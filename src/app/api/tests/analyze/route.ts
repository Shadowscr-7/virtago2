import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const isDev = process.env.NODE_ENV !== "production";

/**
 * POST /api/tests/analyze — Usa OpenAI para analizar un error de test E2E
 */
export async function POST(request: NextRequest) {
  if (!isDev) {
    return NextResponse.json({ error: "Solo disponible en desarrollo" }, { status: 403 });
  }

  try {
    const { testName, errorSummary, logContext } = (await request.json()) as {
      testName: string;
      errorSummary: string;
      logContext: string;
    };

    if (!testName || !errorSummary) {
      return NextResponse.json({ error: "Faltan datos del error" }, { status: 400 });
    }

    // Obtener la API key del servidor (no exponer al cliente)
    const apiKey =
      process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "OPENAI_API_KEY no configurada",
          analysis: {
            cause: "No se puede analizar: falta configurar la API key de OpenAI en .env.local",
            solution: "Agrega OPENAI_API_KEY=sk-... a tu archivo .env.local",
            severity: "config",
          },
        },
        { status: 200 }
      );
    }

    // Importar OpenAI dinámicamente
    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey });

    const systemPrompt = `Eres un experto en testing E2E con Playwright y desarrollo web con Next.js/React/TypeScript.
Tu trabajo es analizar errores de tests automáticos y explicar:
1. La CAUSA probable del error de forma clara y concisa (para un desarrollador)
2. La SOLUCIÓN concreta paso a paso
3. La SEVERIDAD: "critical" (bloquea funcionalidad), "medium" (afecta UX), "low" (cosmético/flaky)

Responde SIEMPRE en español y en formato JSON exacto:
{
  "cause": "Explicación clara de por qué falló el test",
  "solution": "Pasos concretos para arreglarlo",
  "severity": "critical|medium|low",
  "file_hint": "Archivo donde probablemente está el bug (si se puede deducir)",
  "code_suggestion": "Fragmento de código sugerido si aplica (opcional)"
}

Contexto técnico del proyecto:
- Frontend: Next.js 16 (App Router), React 19, TypeScript, Zustand, Tailwind CSS
- Backend: API separada proxied via /api/[...path]/route.ts
- Auth: registro → OTP → tipo usuario → info personal → empresa → resumen → completar
- Tests: Playwright con Page Object Model implícito`;

    const userPrompt = `Test fallido: "${testName}"

Error: ${errorSummary}

Contexto de logs relevante:
${logContext || "(sin contexto adicional)"}

Analiza la causa raíz y dame una solución concreta.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 800,
      response_format: { type: "json_object" },
    });

    const rawContent = completion.choices[0]?.message?.content || "{}";
    let analysis;
    try {
      analysis = JSON.parse(rawContent);
    } catch {
      analysis = {
        cause: rawContent,
        solution: "No se pudo parsear la respuesta de la IA.",
        severity: "medium",
      };
    }

    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error("[AI Analyze] Error:", message);
    return NextResponse.json(
      {
        error: message,
        analysis: {
          cause: `Error al contactar OpenAI: ${message}`,
          solution: "Verifica tu API key y conexión a internet.",
          severity: "config",
        },
      },
      { status: 200 }
    );
  }
}
