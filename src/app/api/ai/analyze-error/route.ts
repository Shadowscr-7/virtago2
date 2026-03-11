import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/ai/analyze-error
 *
 * Recibe información de un error (API o frontend) y usa OpenAI
 * para analizar la causa raíz y sugerir soluciones.
 *
 * Si no hay OPENAI_API_KEY, retorna un análisis estático útil.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      source,       // 'api' | 'frontend' | 'unhandled'
      request: req, // { method, url, body }
      response: res, // { status, statusText, data }
      error: err,   // { message, stack, code }
      context,      // { page, component, userAction }
    } = body;

    if (!err?.message) {
      return NextResponse.json(
        { error: 'Falta información del error' },
        { status: 400 },
      );
    }

    // ── Intentar análisis con OpenAI ──────────────────────────────────
    const apiKey =
      process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    if (apiKey) {
      try {
        const { default: OpenAI } = await import('openai');
        const openai = new OpenAI({ apiKey });

        const systemPrompt = `Eres un experto en debugging de aplicaciones web modernas (Next.js 16, React 19, TypeScript, Axios, API REST).

Tu trabajo es analizar errores que ocurren en tiempo de ejecución — tanto errores de API (request/response) como errores del frontend (React, renderizado, JS) — y explicar de forma clara y concisa:

1. **Causa**: Por qué ocurrió el error.
2. **Solución**: Qué puede hacer el usuario o desarrollador.
3. **Severidad**: "critical" (bloquea funcionalidad core), "medium" (degradación de UX), "low" (cosmético/temporal).
4. **Categoría**: "network" | "auth" | "validation" | "server" | "client" | "config" | "data".

Reglas:
- Responde SIEMPRE en español.
- Sé conciso pero útil (máx 3 oraciones por campo).
- Si el error es de red (status 0, ECONNREFUSED), sugiere verificar conexión/servidor.
- Si es 500, indica que es un error del backend.
- Si es un error de React/JS, analiza el stack trace.
- Para errores de validación (400/422), indica qué campos o datos podrían estar mal.
- Incluye code_suggestion SOLO si es realmente útil.

Responde en JSON exacto:
{
  "cause": "...",
  "solution": "...",
  "severity": "critical|medium|low",
  "category": "network|auth|validation|server|client|config|data",
  "code_suggestion": "..." // opcional
}`;

        // Construir contexto del error
        const parts: string[] = [];
        parts.push(`**Fuente:** ${source}`);
        parts.push(`**Página:** ${context?.page || 'desconocida'}`);

        if (req) {
          parts.push(`\n**Request:**`);
          parts.push(`- Método: ${req.method}`);
          parts.push(`- URL: ${req.url}`);
          if (req.body) parts.push(`- Body: ${JSON.stringify(req.body).slice(0, 500)}`);
        }

        if (res) {
          parts.push(`\n**Response:**`);
          parts.push(`- Status: ${res.status} ${res.statusText || ''}`);
          if (res.data) parts.push(`- Data: ${JSON.stringify(res.data).slice(0, 800)}`);
        }

        parts.push(`\n**Error:**`);
        parts.push(`- Message: ${err.message}`);
        if (err.code) parts.push(`- Code: ${err.code}`);
        if (err.stack) parts.push(`- Stack (primeras 5 líneas):\n${err.stack.split('\n').slice(0, 5).join('\n')}`);

        if (context?.component) parts.push(`\n**Componente:** ${context.component}`);
        if (context?.userAction) parts.push(`**Acción del usuario:** ${context.userAction}`);

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: parts.join('\n') },
          ],
          temperature: 0.2,
          max_tokens: 600,
          response_format: { type: 'json_object' },
        });

        const raw = completion.choices[0]?.message?.content || '{}';
        let analysis;
        try {
          analysis = JSON.parse(raw);
        } catch {
          analysis = {
            cause: raw,
            solution: 'No se pudo parsear la respuesta de IA.',
            severity: 'medium',
            category: 'client',
          };
        }

        return NextResponse.json({ success: true, analysis, provider: 'openai' });
      } catch (aiError) {
        console.error('[AI Analyze Error] OpenAI failed:', aiError);
        // Fallback a análisis estático
      }
    }

    // ── Análisis estático (sin IA) ────────────────────────────────────
    const analysis = buildStaticAnalysis(source, req, res, err);
    return NextResponse.json({ success: true, analysis, provider: 'static' });

  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error desconocido';
    console.error('[AI Analyze Error] Unhandled:', msg);
    return NextResponse.json(
      {
        success: false,
        analysis: {
          cause: `Error interno al analizar: ${msg}`,
          solution: 'Intenta nuevamente o revisa la consola del servidor.',
          severity: 'low' as const,
          category: 'server' as const,
        },
        provider: 'fallback',
      },
      { status: 200 }, // No devolver 500 para que el frontend siempre reciba algo
    );
  }
}

// ── Análisis estático basado en heurísticas ───────────────────────────────────
function buildStaticAnalysis(
  source: string,
  req?: { method: string; url: string },
  res?: { status: number; data?: unknown },
  err?: { message: string; code?: string },
) {
  const status = res?.status || 0;
  const message = err?.message || '';

  // Errores de red
  if (status === 0 || message.includes('Network Error') || message.includes('ECONNREFUSED')) {
    return {
      cause: 'No se pudo conectar con el servidor. Posible problema de red o el backend no está disponible.',
      solution: 'Verifica tu conexión a internet y que el servidor backend esté corriendo correctamente.',
      severity: 'critical' as const,
      category: 'network' as const,
    };
  }

  // Errores de servidor
  if (status >= 500) {
    return {
      cause: `Error interno del servidor (${status}) al llamar a ${req?.method || 'GET'} ${req?.url || 'endpoint desconocido'}. El backend devolvió un error no controlado.`,
      solution: 'Revisa los logs del servidor backend para ver el detalle del error. Puede ser un bug en el endpoint o un problema de base de datos.',
      severity: 'critical' as const,
      category: 'server' as const,
    };
  }

  // Errores de validación
  if (status === 400 || status === 422) {
    const respData = typeof res?.data === 'object' ? JSON.stringify(res.data).slice(0, 200) : '';
    return {
      cause: `Error de validación (${status}): los datos enviados no cumplen los requisitos del servidor. ${respData ? `Detalle: ${respData}` : ''}`,
      solution: 'Revisa los campos del formulario y asegúrate de que todos los valores requeridos estén completos y en el formato correcto.',
      severity: 'medium' as const,
      category: 'validation' as const,
    };
  }

  // Timeout
  if (message.includes('timeout') || err?.code === 'ECONNABORTED') {
    return {
      cause: 'La solicitud tardó demasiado en responder (timeout). El servidor puede estar sobrecargado.',
      solution: 'Intenta nuevamente en unos segundos. Si persiste, contacta soporte técnico.',
      severity: 'medium' as const,
      category: 'network' as const,
    };
  }

  // CORS
  if (message.includes('CORS') || message.includes('cross-origin')) {
    return {
      cause: 'Error de CORS: el servidor no permite solicitudes desde este origen.',
      solution: 'Verifica la configuración de CORS en el backend y asegúrate de que el dominio esté permitido.',
      severity: 'critical' as const,
      category: 'config' as const,
    };
  }

  // Frontend errors
  if (source === 'frontend') {
    return {
      cause: `Error en el frontend: ${message}. Puede ser un problema en la lógica del componente o datos inesperados.`,
      solution: 'Intenta recargar la página. Si persiste, revisa la consola del navegador para más detalles.',
      severity: 'medium' as const,
      category: 'client' as const,
    };
  }

  // Default
  return {
    cause: `Error inesperado: ${message}`,
    solution: 'Intenta la operación nuevamente. Si el problema persiste, contacta al equipo de soporte.',
    severity: 'medium' as const,
    category: 'client' as const,
  };
}
