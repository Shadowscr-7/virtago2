'use client';

import React, { Component, type ReactNode } from 'react';
import { emitError, createFrontendError } from '@/store/error-analyzer';

interface Props {
  children: ReactNode;
  /** Nombre del boundary para identificar dónde ocurrió el error */
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary que captura errores de renderizado de React
 * y los emite al sistema de análisis de IA.
 *
 * Se recupera automáticamente al navegar (detecta cambio de children).
 */
export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Emitir al sistema de análisis de IA
    emitError(
      createFrontendError({
        message: error.message,
        stack: [
          error.stack || '',
          '--- Component Stack ---',
          errorInfo.componentStack || '',
        ].join('\n'),
        component: this.props.name || 'GlobalErrorBoundary',
      }),
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-400 mb-2">Algo salió mal</h3>
          <p className="text-sm text-gray-400 mb-4 max-w-md">
            Ocurrió un error inesperado. El asistente de IA está analizando el problema.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors"
          >
            Intentar nuevamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
