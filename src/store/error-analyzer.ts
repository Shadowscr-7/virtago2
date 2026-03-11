'use client';

/**
 * Store global para interceptar errores de API y frontend
 * y activar el chat de IA con análisis automático.
 *
 * Patrón: module-level singleton (igual que toast-helpers.ts)
 * para que el HTTP client pueda emitir errores sin depender de React.
 */

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface CapturedError {
  id: string;
  timestamp: Date;
  source: 'api' | 'frontend' | 'unhandled';

  // Request info (solo para errores de API)
  request?: {
    method: string;
    url: string;
    headers?: Record<string, string>;
    body?: unknown;
  };

  // Response info (solo para errores de API)
  response?: {
    status: number;
    statusText?: string;
    headers?: Record<string, string>;
    data?: unknown;
  };

  // Error info
  error: {
    message: string;
    stack?: string;
    code?: string;
  };

  // Contexto adicional
  context?: {
    page?: string;          // URL de la página actual
    component?: string;     // Componente donde ocurrió
    userAction?: string;    // Acción del usuario que lo desencadenó
  };
}

export interface ErrorAnalysis {
  cause: string;
  solution: string;
  severity: 'critical' | 'medium' | 'low' | 'config';
  category?: string;
  code_suggestion?: string;
}

type ErrorListener = (error: CapturedError) => void;

// ─── Singleton ───────────────────────────────────────────────────────────────

const listeners: Set<ErrorListener> = new Set();
const errorHistory: CapturedError[] = [];
const MAX_HISTORY = 50;

// Errores que NO deben activar el análisis automáticamente
const IGNORED_STATUS_CODES = [401, 403, 404];
const IGNORED_URL_PATTERNS = ['/auth/refresh', '/auth/login', '/onboarding/status'];

/**
 * Emitir un error capturado. Llamar desde el HTTP client o ErrorBoundary.
 */
export function emitError(error: CapturedError): void {
  // Filtrar errores ignorados
  const status = error.response?.status;
  if (status && IGNORED_STATUS_CODES.includes(status)) return;

  const url = error.request?.url || '';
  if (IGNORED_URL_PATTERNS.some(p => url.includes(p))) return;

  // Guardar en historial
  errorHistory.unshift(error);
  if (errorHistory.length > MAX_HISTORY) errorHistory.pop();

  // Notificar a todos los listeners (el componente de chat)
  listeners.forEach(fn => {
    try { fn(error); } catch (e) { console.error('[ErrorAnalyzer] listener error:', e); }
  });
}

/**
 * Suscribirse a errores. Retorna función de unsub.
 */
export function onError(listener: ErrorListener): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

/**
 * Obtener historial de errores recientes.
 */
export function getErrorHistory(): readonly CapturedError[] {
  return errorHistory;
}

/**
 * Limpiar historial.
 */
export function clearErrorHistory(): void {
  errorHistory.length = 0;
}

// ─── Helpers para construir CapturedError ────────────────────────────────────

let errorCounter = 0;

export function createApiError(opts: {
  method: string;
  url: string;
  requestBody?: unknown;
  status: number;
  statusText?: string;
  responseData?: unknown;
  errorMessage: string;
  errorCode?: string;
}): CapturedError {
  return {
    id: `api-err-${++errorCounter}-${Date.now()}`,
    timestamp: new Date(),
    source: 'api',
    request: {
      method: opts.method.toUpperCase(),
      url: opts.url,
      body: opts.requestBody,
    },
    response: {
      status: opts.status,
      statusText: opts.statusText,
      data: opts.responseData,
    },
    error: {
      message: opts.errorMessage,
      code: opts.errorCode,
    },
    context: {
      page: typeof window !== 'undefined' ? window.location.pathname : undefined,
    },
  };
}

export function createFrontendError(opts: {
  message: string;
  stack?: string;
  component?: string;
  userAction?: string;
}): CapturedError {
  return {
    id: `fe-err-${++errorCounter}-${Date.now()}`,
    timestamp: new Date(),
    source: 'frontend',
    error: {
      message: opts.message,
      stack: opts.stack,
    },
    context: {
      page: typeof window !== 'undefined' ? window.location.pathname : undefined,
      component: opts.component,
      userAction: opts.userAction,
    },
  };
}
