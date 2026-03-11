import { NextRequest, NextResponse } from "next/server";

// Forzar Node.js runtime (fs no funciona en Edge)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ─── Solo permitir en desarrollo ──────────────────────────────────────────
const isDev = process.env.NODE_ENV !== "production";

/**
 * GET /api/tests — Lista todos los archivos de test (.spec.ts) disponibles
 */
export async function GET() {
  if (!isDev) {
    return NextResponse.json(
      { error: "Test runner solo disponible en desarrollo" },
      { status: 403 }
    );
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("fs") as typeof import("fs");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require("path") as typeof import("path");

    const testsDir = path.join(process.cwd(), "tests");
    const files = fs.readdirSync(testsDir);

    const testFiles = (files as string[])
      .filter((f) => f.endsWith(".spec.ts"))
      .map((f) => {
        const filePath = path.join(testsDir, f);
        const stats = fs.statSync(filePath);
        return {
          name: f,
          path: `tests/${f}`,
          size: stats.size,
          lastModified: stats.mtime.toISOString(),
        };
      });

    return NextResponse.json({
      success: true,
      tests: testFiles,
      total: testFiles.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "No se pudo leer el directorio de tests" },
      { status: 500 }
    );
  }
}
