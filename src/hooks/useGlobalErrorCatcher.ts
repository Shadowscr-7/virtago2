'use client';

import { useEffect } from 'react';
import { emitError, createFrontendError } from '@/store/error-analyzer';

/**
 * Hook that captures unhandled JS errors and unhandled promise rejections,
 * emitting them to the error analyzer for AI analysis.
 *
 * Mount once at the root level (layout).
 */
export function useGlobalErrorCatcher() {
  useEffect(() => {
    // ── Unhandled JS errors ──
    function handleError(event: ErrorEvent) {
      // Ignore ResizeObserver loop errors (noise)
      if (event.message?.includes('ResizeObserver')) return;

      emitError(
        createFrontendError({
          message: event.message || 'Error desconocido',
          stack: event.error?.stack,
          userAction: `Error en ${event.filename || 'unknown'}:${event.lineno}`,
        }),
      );
    }

    // ── Unhandled promise rejections ──
    function handleRejection(event: PromiseRejectionEvent) {
      const reason = event.reason;
      const message =
        reason instanceof Error
          ? reason.message
          : typeof reason === 'string'
            ? reason
            : 'Unhandled promise rejection';

      const stack = reason instanceof Error ? reason.stack : undefined;

      emitError(
        createFrontendError({
          message,
          stack,
          userAction: 'Unhandled Promise Rejection',
        }),
      );
    }

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);
}
