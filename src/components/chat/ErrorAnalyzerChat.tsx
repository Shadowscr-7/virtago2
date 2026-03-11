'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/theme-context';
import {
  AlertTriangle,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Bug,
  RefreshCw,
  Code2,
  Globe,
  Server,
  Shield,
  Zap,
  Copy,
  Check,
  ArrowRight,
  Minimize2,
  Maximize2,
  Trash2,
} from 'lucide-react';
import {
  type CapturedError,
  type ErrorAnalysis,
  onError,
  getErrorHistory,
  clearErrorHistory,
} from '@/store/error-analyzer';

// ── Tipos internos ──────────────────────────────────────────────────────────

interface AnalyzedError {
  error: CapturedError;
  analysis: ErrorAnalysis | null;
  analyzing: boolean;
  provider?: string;
}

// ── Animaciones ──────────────────────────────────────────────────────────────

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const panelVariants = {
  hidden: {
    opacity: 0,
    y: 80,
    scale: 0.9,
    filter: 'blur(10px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 30,
      mass: 0.8,
    },
  },
  exit: {
    opacity: 0,
    y: 40,
    scale: 0.95,
    filter: 'blur(8px)',
    transition: { duration: 0.25 },
  },
};

const pulseRingVariants = {
  initial: { scale: 1, opacity: 0.6 },
  pulse: {
    scale: [1, 1.4, 1],
    opacity: [0.6, 0, 0.6],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
  },
};

const errorCardVariants = {
  hidden: { opacity: 0, x: -30, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 500,
      damping: 30,
      delay: i * 0.08,
    },
  }),
  exit: { opacity: 0, x: 30, scale: 0.95, transition: { duration: 0.2 } },
};

const shimmerVariants = {
  initial: { x: '-100%' },
  animate: {
    x: '100%',
    transition: { duration: 1.5, repeat: Infinity, ease: 'linear' as const },
  },
};

// ── Helper: ícono por categoría ──────────────────────────────────────────────

function CategoryIcon({ category, className, style }: { category?: string; className?: string; style?: React.CSSProperties }) {
  const props = { className: className || 'w-4 h-4', style };
  switch (category) {
    case 'network': return <Globe {...props} />;
    case 'server': return <Server {...props} />;
    case 'auth': return <Shield {...props} />;
    case 'validation': return <Code2 {...props} />;
    case 'config': return <Zap {...props} />;
    default: return <Bug {...props} />;
  }
}

function severityColor(severity?: string) {
  switch (severity) {
    case 'critical': return { bg: '#ef444420', text: '#ef4444', border: '#ef444440' };
    case 'medium': return { bg: '#f59e0b20', text: '#f59e0b', border: '#f59e0b40' };
    case 'low': return { bg: '#22c55e20', text: '#22c55e', border: '#22c55e40' };
    default: return { bg: '#6366f120', text: '#6366f1', border: '#6366f140' };
  }
}

// ── Componente principal ─────────────────────────────────────────────────────

export function ErrorAnalyzerChat() {
  const { themeColors } = useTheme();
  const [errors, setErrors] = useState<AnalyzedError[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hasNewError, setHasNewError] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // ── Suscribirse a errores ───────────────────────────────────────────
  useEffect(() => {
    const unsub = onError(async (capturedError) => {
      const entry: AnalyzedError = {
        error: capturedError,
        analysis: null,
        analyzing: true,
      };

      setErrors(prev => [entry, ...prev].slice(0, 20));
      setHasNewError(true);

      // Auto-abrir el panel con animación
      setIsOpen(true);
      setIsMinimized(false);
      setExpandedId(capturedError.id);

      // Solicitar análisis de IA
      try {
        const res = await fetch('/api/ai/analyze-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source: capturedError.source,
            request: capturedError.request,
            response: capturedError.response,
            error: capturedError.error,
            context: capturedError.context,
          }),
        });

        const data = await res.json();

        setErrors(prev =>
          prev.map(e =>
            e.error.id === capturedError.id
              ? { ...e, analysis: data.analysis, analyzing: false, provider: data.provider }
              : e,
          ),
        );
      } catch {
        setErrors(prev =>
          prev.map(e =>
            e.error.id === capturedError.id
              ? {
                  ...e,
                  analyzing: false,
                  analysis: {
                    cause: 'No se pudo conectar con el servicio de análisis.',
                    solution: 'Verifica que la app esté corriendo correctamente.',
                    severity: 'low',
                    category: 'client',
                  },
                }
              : e,
          ),
        );
      }
    });

    return unsub;
  }, []);

  // Limpiar badge de "nuevo" cuando abre
  useEffect(() => {
    if (isOpen) setHasNewError(false);
  }, [isOpen]);

  const handleClear = useCallback(() => {
    setErrors([]);
    clearErrorHistory();
  }, []);

  const handleRetryAnalysis = useCallback(async (entry: AnalyzedError) => {
    setErrors(prev =>
      prev.map(e => (e.error.id === entry.error.id ? { ...e, analyzing: true } : e)),
    );

    try {
      const res = await fetch('/api/ai/analyze-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: entry.error.source,
          request: entry.error.request,
          response: entry.error.response,
          error: entry.error.error,
          context: entry.error.context,
        }),
      });
      const data = await res.json();
      setErrors(prev =>
        prev.map(e =>
          e.error.id === entry.error.id
            ? { ...e, analysis: data.analysis, analyzing: false, provider: data.provider }
            : e,
        ),
      );
    } catch {
      setErrors(prev =>
        prev.map(e =>
          e.error.id === entry.error.id ? { ...e, analyzing: false } : e,
        ),
      );
    }
  }, []);

  // No renderizar nada si no hay errores
  if (errors.length === 0 && !isOpen) return null;

  // ── Botón flotante (cuando está cerrado) ────────────────────────────
  if (!isOpen) {
    return (
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.button
            onClick={() => { setIsOpen(true); setHasNewError(false); }}
            className="fixed bottom-6 left-6 z-[60] p-3 rounded-full shadow-2xl"
            style={{ backgroundColor: '#ef4444' }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <Bug className="w-5 h-5 text-white" />

            {/* Badge de conteo */}
            <motion.span
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-[10px] font-bold flex items-center justify-center"
              style={{ color: '#ef4444' }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              {errors.length}
            </motion.span>

            {/* Pulse ring para errores nuevos */}
            {hasNewError && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-red-400"
                variants={pulseRingVariants}
                initial="initial"
                animate="pulse"
              />
            )}
          </motion.button>
        )}
      </AnimatePresence>
    );
  }

  // ── Panel abierto ──────────────────────────────────────────────────
  return (
    <AnimatePresence>
      <motion.div
        ref={panelRef}
        className="fixed bottom-6 left-6 z-[60] shadow-2xl rounded-2xl overflow-hidden flex flex-col"
        style={{
          backgroundColor: `${themeColors.surface}f5`,
          backdropFilter: 'blur(16px)',
          border: `1px solid ${themeColors.primary}20`,
          width: isMinimized ? '340px' : '440px',
          maxHeight: isMinimized ? '56px' : '600px',
        }}
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        layout
      >
        {/* ── Header ──────────────────────────────────────────────── */}
        <motion.div
          className="flex items-center justify-between px-4 py-3 border-b cursor-pointer select-none"
          style={{
            borderColor: '#ef444420',
            background: 'linear-gradient(135deg, #ef444410 0%, #f97316 10 100%)',
          }}
          onClick={() => isMinimized && setIsMinimized(false)}
          whileHover={isMinimized ? { backgroundColor: '#ef444418' } : {}}
        >
          <div className="flex items-center gap-3">
            {/* Ícono animado */}
            <motion.div
              className="relative w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#ef444420' }}
              animate={errors.some(e => e.analyzing) ? { rotate: 360 } : {}}
              transition={{
                duration: 2,
                repeat: errors.some(e => e.analyzing) ? Infinity : 0,
                ease: 'linear',
              }}
            >
              {errors.some(e => e.analyzing) ? (
                <Sparkles className="w-4 h-4 text-orange-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-400" />
              )}

              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, #ef444430 0%, transparent 70%)',
                }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>

            <div>
              <h3 className="font-semibold text-sm" style={{ color: themeColors.text.primary }}>
                Análisis de Errores IA
              </h3>
              {!isMinimized && (
                <motion.p
                  className="text-xs"
                  style={{ color: themeColors.text.secondary }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {errors.filter(e => e.analyzing).length > 0
                    ? `Analizando ${errors.filter(e => e.analyzing).length} error(es)...`
                    : `${errors.length} error(es) detectado(s)`}
                </motion.p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {!isMinimized && errors.length > 0 && (
              <motion.button
                onClick={(e) => { e.stopPropagation(); handleClear(); }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                title="Limpiar todo"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400/70" />
              </motion.button>
            )}
            <motion.button
              onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 rounded-lg"
              style={{ color: themeColors.text.secondary }}
            >
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </motion.button>
            <motion.button
              onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 rounded-lg"
              style={{ color: themeColors.text.secondary }}
            >
              <X className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </motion.div>

        {/* ── Contenido ──────────────────────────────────────────── */}
        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              className="flex-1 overflow-y-auto p-3 space-y-3"
              style={{ maxHeight: '530px' }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {errors.length === 0 ? (
                <motion.div
                  className="flex flex-col items-center justify-center py-12 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Check className="w-10 h-10 text-green-400 mb-3" />
                  <p className="text-sm font-medium" style={{ color: themeColors.text.primary }}>
                    ¡Sin errores!
                  </p>
                  <p className="text-xs mt-1" style={{ color: themeColors.text.secondary }}>
                    Todos los sistemas funcionan correctamente.
                  </p>
                </motion.div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {errors.map((entry, i) => (
                    <ErrorCard
                      key={entry.error.id}
                      entry={entry}
                      index={i}
                      isExpanded={expandedId === entry.error.id}
                      onToggle={() =>
                        setExpandedId(prev => (prev === entry.error.id ? null : entry.error.id))
                      }
                      onRetry={() => handleRetryAnalysis(entry)}
                      themeColors={themeColors}
                    />
                  ))}
                </AnimatePresence>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Error Card ───────────────────────────────────────────────────────────────

interface ErrorCardProps {
  entry: AnalyzedError;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onRetry: () => void;
  themeColors: {
    primary: string;
    surface: string;
    text: { primary: string; secondary: string };
  };
}

function ErrorCard({ entry, index, isExpanded, onToggle, onRetry, themeColors }: ErrorCardProps) {
  const { error, analysis, analyzing } = entry;
  const sevColors = severityColor(analysis?.severity);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const text = [
      `Error: ${error.error.message}`,
      error.request ? `Request: ${error.request.method} ${error.request.url}` : '',
      error.response ? `Response: ${error.response.status}` : '',
      analysis ? `\nAnálisis IA:` : '',
      analysis ? `Causa: ${analysis.cause}` : '',
      analysis ? `Solución: ${analysis.solution}` : '',
    ]
      .filter(Boolean)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [error, analysis]);

  return (
    <motion.div
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: `${themeColors.surface}80`,
        border: `1px solid ${analyzing ? '#f59e0b30' : sevColors.border}`,
      }}
      variants={errorCardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      custom={index}
      layout
    >
      {/* Card Header */}
      <motion.button
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left"
        onClick={onToggle}
        whileHover={{ backgroundColor: `${themeColors.primary}08` }}
      >
        {/* Status indicator */}
        <div className="relative flex-shrink-0">
          {analyzing ? (
            <motion.div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#f59e0b20' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-4 h-4 text-orange-400" />
            </motion.div>
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: sevColors.bg }}
            >
              <CategoryIcon category={analysis?.category} className="w-4 h-4" style={{ color: sevColors.text } as React.CSSProperties} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {/* Source badge */}
            <span
              className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: error.source === 'api' ? '#3b82f620' : '#a855f720',
                color: error.source === 'api' ? '#3b82f6' : '#a855f7',
              }}
            >
              {error.source}
            </span>

            {/* Method + Status */}
            {error.request && (
              <span className="text-[10px] font-mono" style={{ color: themeColors.text.secondary }}>
                {error.request.method} {error.response?.status || ''}
              </span>
            )}

            {/* Severity badge */}
            {analysis && (
              <span
                className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ml-auto"
                style={{ backgroundColor: sevColors.bg, color: sevColors.text }}
              >
                {analysis.severity}
              </span>
            )}
          </div>

          <p
            className="text-xs font-medium mt-0.5 truncate"
            style={{ color: themeColors.text.primary }}
          >
            {error.error.message.slice(0, 100)}
          </p>

          {error.request?.url && (
            <p
              className="text-[10px] font-mono truncate mt-0.5"
              style={{ color: themeColors.text.secondary }}
            >
              {error.request.url}
            </p>
          )}
        </div>

        {/* Expand chevron */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-4 h-4" style={{ color: themeColors.text.secondary }} />
        </motion.div>
      </motion.button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2.5">
              {/* Barra separadora con shimmer durante análisis */}
              <div className="relative h-px overflow-hidden rounded-full" style={{ backgroundColor: `${themeColors.primary}15` }}>
                {analyzing && (
                  <motion.div
                    className="absolute inset-y-0 w-1/2"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${themeColors.primary}60, transparent)`,
                    }}
                    variants={shimmerVariants}
                    initial="initial"
                    animate="animate"
                  />
                )}
              </div>

              {/* Analyzing state */}
              {analyzing && (
                <motion.div
                  className="flex items-center gap-2 py-3 justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-4 h-4 text-orange-400" />
                  </motion.div>
                  <span className="text-xs" style={{ color: themeColors.text.secondary }}>
                    Analizando con IA...
                  </span>
                </motion.div>
              )}

              {/* Analysis result */}
              {analysis && !analyzing && (
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {/* Causa */}
                  <div className="rounded-lg p-2.5" style={{ backgroundColor: '#ef444408' }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <AlertTriangle className="w-3 h-3 text-red-400" />
                      <span className="text-[10px] font-bold uppercase text-red-400">Causa</span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: themeColors.text.primary }}>
                      {analysis.cause}
                    </p>
                  </div>

                  {/* Solución */}
                  <div className="rounded-lg p-2.5" style={{ backgroundColor: '#22c55e08' }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <ArrowRight className="w-3 h-3 text-green-400" />
                      <span className="text-[10px] font-bold uppercase text-green-400">Solución</span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: themeColors.text.primary }}>
                      {analysis.solution}
                    </p>
                  </div>

                  {/* Code suggestion */}
                  {analysis.code_suggestion && (
                    <div className="rounded-lg p-2.5 font-mono" style={{ backgroundColor: `${themeColors.primary}08` }}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Code2 className="w-3 h-3" style={{ color: themeColors.primary }} />
                        <span className="text-[10px] font-bold uppercase" style={{ color: themeColors.primary }}>
                          Código sugerido
                        </span>
                      </div>
                      <pre className="text-[11px] whitespace-pre-wrap break-words" style={{ color: themeColors.text.primary }}>
                        {analysis.code_suggestion}
                      </pre>
                    </div>
                  )}

                  {/* Request/Response details (collapsible) */}
                  {(error.request || error.response) && (
                    <RequestResponseDetails error={error} themeColors={themeColors} />
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <motion.button
                      onClick={onRetry}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium"
                      style={{
                        backgroundColor: `${themeColors.primary}15`,
                        color: themeColors.primary,
                      }}
                      whileHover={{ scale: 1.03, backgroundColor: `${themeColors.primary}25` }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <RefreshCw className="w-3 h-3" />
                      Re-analizar
                    </motion.button>

                    <motion.button
                      onClick={handleCopy}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium"
                      style={{
                        backgroundColor: `${themeColors.surface}80`,
                        color: themeColors.text.secondary,
                        border: `1px solid ${themeColors.primary}15`,
                      }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-green-400" /> Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copiar
                        </>
                      )}
                    </motion.button>

                    {/* Provider indicator */}
                    {entry.provider && (
                      <span
                        className="ml-auto text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1"
                        style={{
                          backgroundColor: entry.provider === 'openai' ? '#10b98120' : `${themeColors.surface}60`,
                          color: entry.provider === 'openai' ? '#10b981' : themeColors.text.secondary,
                        }}
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        {entry.provider === 'openai' ? 'GPT-4o' : 'Análisis local'}
                      </span>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Request/Response collapsible ─────────────────────────────────────────────

function RequestResponseDetails({
  error,
  themeColors,
}: {
  error: CapturedError;
  themeColors: { primary: string; surface: string; text: { primary: string; secondary: string } };
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-[10px] font-medium py-1"
        style={{ color: themeColors.text.secondary }}
      >
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        Detalles técnicos
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div
              className="rounded-lg p-2 text-[10px] font-mono space-y-1.5"
              style={{ backgroundColor: `${themeColors.surface}60` }}
            >
              {error.request && (
                <div>
                  <span className="font-bold" style={{ color: '#3b82f6' }}>Request: </span>
                  <span style={{ color: themeColors.text.primary }}>
                    {error.request.method} {error.request.url}
                  </span>
                  {error.request.body != null && (
                    <pre className="mt-1 whitespace-pre-wrap break-words opacity-70" style={{ color: themeColors.text.secondary }}>
                      {JSON.stringify(error.request.body, null, 2)?.slice(0, 300) ?? ''}
                    </pre>
                  )}
                </div>
              )}
              {error.response && (
                <div>
                  <span className="font-bold" style={{ color: error.response.status >= 500 ? '#ef4444' : '#f59e0b' }}>
                    Response ({error.response.status}):
                  </span>
                  {error.response.data != null && (
                    <pre className="mt-1 whitespace-pre-wrap break-words opacity-70" style={{ color: themeColors.text.secondary }}>
                      {JSON.stringify(error.response.data, null, 2)?.slice(0, 400) ?? ''}
                    </pre>
                  )}
                </div>
              )}
              {error.context?.page && (
                <div>
                  <span className="font-bold" style={{ color: '#a855f7' }}>Página: </span>
                  <span style={{ color: themeColors.text.secondary }}>{error.context.page}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
