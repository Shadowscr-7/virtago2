import { NextRequest } from "next/server";

// Forzar Node.js runtime
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const isDev = process.env.NODE_ENV !== "production";

// ─── Registro global del proceso activo para poder matarlo desde /api/tests/stop
// Se usa un Map global para sobrevivir hot-reload en dev
const globalForTests = globalThis as typeof globalThis & {
  __testRunnerPid?: number;
  __testRunnerKill?: () => void;
};

/** Registrar el proceso activo */
function registerProcess(pid: number, kill: () => void) {
  globalForTests.__testRunnerPid = pid;
  globalForTests.__testRunnerKill = kill;
}

/** Limpiar el registro */
function clearProcess() {
  globalForTests.__testRunnerPid = undefined;
  globalForTests.__testRunnerKill = undefined;
}

/** Matar el proceso activo (exportado para el endpoint /stop) */
export function killActiveProcess(): boolean {
  if (globalForTests.__testRunnerKill) {
    globalForTests.__testRunnerKill();
    clearProcess();
    return true;
  }
  return false;
}

/**
 * POST /api/tests/run — Ejecuta tests de Playwright y devuelve output vía SSE
 */
export async function POST(request: NextRequest) {
  if (!isDev) {
    return new Response("Test runner solo disponible en desarrollo", { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const {
      file,
      project = "chromium",
      grep,
      headed = false,
    } = body as {
      file?: string;
      project?: string;
      grep?: string;
      headed?: boolean;
    };

    // Construir argumentos
    const args = ["playwright", "test"];

    if (file) {
      const safeName = file.replace(/[^a-zA-Z0-9._-]/g, "");
      args.push(safeName);
    }

    args.push("--project", project);
    args.push("--reporter", "list");

    if (grep) args.push("--grep", grep);
    if (headed) {
      args.push("--headed");
      args.push("--workers", "1"); // Un solo navegador a la vez en modo headed
    }

    // Dynamic require para evitar que Turbopack intente bundlear child_process
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { spawn } = require("child_process") as typeof import("child_process");

    const env = {
      ...process.env,
      FORCE_COLOR: "0",
      PW_TEST_REUSE_SERVER: "1",
    };

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start(controller) {
        const cwd = process.cwd();
        const isWindows = process.platform === "win32";
        const cmd = isWindows ? "npx.cmd" : "npx";

        const child = spawn(cmd, args, {
          cwd,
          env,
          shell: isWindows,
          stdio: ["pipe", "pipe", "pipe"],
        });

        // Registrar proceso para poder matarlo desde /api/tests/stop
        const killTree = () => {
          try {
            if (isWindows && child.pid) {
              // En Windows, SIGTERM no mata el árbol de procesos.
              // Usar taskkill /T /F para matar el proceso y todos sus hijos.
              const { execSync } = require("child_process") as typeof import("child_process");
              execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: "ignore" });
            } else {
              child.kill("SIGTERM");
            }
          } catch {
            // Proceso ya terminó
          }
        };

        if (child.pid) {
          registerProcess(child.pid, killTree);
        }

        const sendEvent = (event: string, data: unknown) => {
          const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
          try {
            controller.enqueue(encoder.encode(payload));
          } catch {
            // Stream already closed
          }
        };

        sendEvent("start", {
          command: `npx ${args.join(" ")}`,
          file: file || "(todos)",
          project,
          headed,
          timestamp: new Date().toISOString(),
        });

        child.stdout.on("data", (chunk: Buffer) => {
          const text = chunk.toString("utf-8");
          const lines = text.split("\n").filter((l: string) => l.trim());
          for (const line of lines) {
            const passMatch = line.match(/✓|✔|passed|ok\s+\d+/i);
            const failMatch = line.match(/✗|✘|failed|✕/i);
            const skipMatch = line.match(/skipped/i);

            let type: "info" | "pass" | "fail" | "skip" = "info";
            if (passMatch) type = "pass";
            else if (failMatch) type = "fail";
            else if (skipMatch) type = "skip";

            sendEvent("output", { text: line, type });
          }
        });

        child.stderr.on("data", (chunk: Buffer) => {
          const text = chunk.toString("utf-8");
          const lines = text.split("\n").filter((l: string) => l.trim());
          for (const line of lines) {
            sendEvent("output", { text: line, type: "error" });
          }
        });

        child.on("error", (err: Error) => {
          sendEvent("error", { message: err.message });
          try { controller.close(); } catch { /* */ }
        });

        child.on("close", (code: number | null) => {
          clearProcess();
          sendEvent("done", {
            exitCode: code,
            success: code === 0,
            timestamp: new Date().toISOString(),
          });
          try { controller.close(); } catch { /* */ }
        });

        request.signal.addEventListener("abort", () => {
          killTree();
          clearProcess();
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
