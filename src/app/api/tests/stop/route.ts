import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const isDev = process.env.NODE_ENV !== "production";

/**
 * POST /api/tests/stop — Detiene el proceso de Playwright activo
 */
export async function POST() {
  if (!isDev) {
    return NextResponse.json({ error: "Solo disponible en desarrollo" }, { status: 403 });
  }

  try {
    // Acceder al registro global del proceso activo
    const globalForTests = globalThis as typeof globalThis & {
      __testRunnerPid?: number;
      __testRunnerKill?: () => void;
    };

    if (globalForTests.__testRunnerKill) {
      const pid = globalForTests.__testRunnerPid;
      globalForTests.__testRunnerKill();
      globalForTests.__testRunnerPid = undefined;
      globalForTests.__testRunnerKill = undefined;

      return NextResponse.json({
        success: true,
        message: `Proceso ${pid} detenido`,
      });
    }

    return NextResponse.json({
      success: false,
      message: "No hay proceso de test activo",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
