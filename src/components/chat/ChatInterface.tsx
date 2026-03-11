'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/theme-context';
import { useChat, ChatMessage } from '../../contexts/chat-context';

// Tipos locales
interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
  };
}
import { 
  MessageCircle, 
  Send, 
  X, 
  Minimize2, 
  Maximize2, 
  Bot, 
  User, 
  Clock,

  AlertCircle,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  Code2,
  Globe,
  Server,
  Shield,
  Zap,
  Bug,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from 'lucide-react';

// Componente para el indicador de escritura
function TypingIndicator({ themeColors }: { themeColors: ThemeColors }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-2 px-4 py-3 rounded-2xl max-w-xs"
      style={{ backgroundColor: `${themeColors.surface}40` }}
    >
      <div 
        className="w-8 h-8 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${themeColors.primary}20` }}
      >
        <Bot className="w-4 h-4" style={{ color: themeColors.primary }} />
      </div>
      <div className="flex items-center gap-1">
        <motion.div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: themeColors.primary }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
        />
        <motion.div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: themeColors.primary }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        />
        <motion.div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: themeColors.primary }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
        />
      </div>
    </motion.div>
  );
}

// Componente para los botones de respuesta rápida
function QuickReplies({ 
  replies, 
  onSelect, 
  themeColors 
}: { 
  replies: string[], 
  onSelect: (reply: string) => void,
  themeColors: ThemeColors 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap gap-2 mt-3"
    >
      {replies.map((reply, index) => (
        <motion.button
          key={reply}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(reply)}
          className="px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
          style={{
            backgroundColor: `${themeColors.primary}10`,
            borderColor: `${themeColors.primary}30`,
            color: themeColors.primary,
            border: '1px solid',
          }}
        >
          {reply}
        </motion.button>
      ))}
    </motion.div>
  );
}

// ── Helpers para el análisis de errores ────────────────────────────────────

function sevColor(severity?: string) {
  switch (severity) {
    case 'critical': return { bg: '#ef444420', text: '#ef4444', border: '#ef444440' };
    case 'medium': return { bg: '#f59e0b20', text: '#f59e0b', border: '#f59e0b40' };
    case 'low': return { bg: '#22c55e20', text: '#22c55e', border: '#22c55e40' };
    default: return { bg: '#6366f120', text: '#6366f1', border: '#6366f140' };
  }
}

function ErrorCategoryIcon({ category, className, style }: { category?: string; className?: string; style?: React.CSSProperties }) {
  const props = { className: className || 'w-3.5 h-3.5', style };
  switch (category) {
    case 'network': return <Globe {...props} />;
    case 'server': return <Server {...props} />;
    case 'auth': return <Shield {...props} />;
    case 'validation': return <Code2 {...props} />;
    case 'config': return <Zap {...props} />;
    default: return <Bug {...props} />;
  }
}

// ── Card que muestra dentro del bubble cuando hay errorAnalysis ──────────

function ErrorAnalysisCard({
  metadata,
  themeColors,
}: {
  metadata: NonNullable<ChatMessage['metadata']>['errorAnalysis'];
  themeColors: ThemeColors;
}) {
  if (!metadata) return null;
  const { error: capturedError, analysis, analyzing, provider } = metadata;
  const sev = sevColor(analysis?.severity);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = [
      `Error: ${capturedError.error.message}`,
      capturedError.request ? `Request: ${capturedError.request.method} ${capturedError.request.url}` : '',
      capturedError.response ? `Status: ${capturedError.response.status}` : '',
      analysis ? `\nCausa: ${analysis.cause}` : '',
      analysis ? `Solución: ${analysis.solution}` : '',
    ].filter(Boolean).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className="mt-2 space-y-2"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      {/* Header badges */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span
          className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
          style={{
            backgroundColor: capturedError.source === 'api' ? '#3b82f620' : '#a855f720',
            color: capturedError.source === 'api' ? '#3b82f6' : '#a855f7',
          }}
        >
          {capturedError.source}
        </span>
        {capturedError.request && (
          <span className="text-[10px] font-mono" style={{ color: themeColors.text.secondary }}>
            {capturedError.request.method} {capturedError.response?.status || ''}
          </span>
        )}
        {analysis && (
          <span
            className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
            style={{ backgroundColor: sev.bg, color: sev.text }}
          >
            {analysis.severity}
          </span>
        )}
      </div>

      {/* URL */}
      {capturedError.request?.url && (
        <p className="text-[10px] font-mono truncate" style={{ color: themeColors.text.secondary }}>
          {capturedError.request.url}
        </p>
      )}

      {/* Shimmer while analyzing */}
      {analyzing && (
        <motion.div className="flex items-center gap-2 py-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="w-4 h-4 text-orange-400" />
          </motion.div>
          <span className="text-xs" style={{ color: themeColors.text.secondary }}>
            Analizando con IA...
          </span>
          <motion.div
            className="flex-1 h-0.5 rounded-full overflow-hidden"
            style={{ backgroundColor: `${themeColors.primary}15` }}
          >
            <motion.div
              className="h-full w-1/2"
              style={{ background: `linear-gradient(90deg, transparent, ${themeColors.primary}60, transparent)` }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
        </motion.div>
      )}

      {/* Analysis results */}
      {analysis && !analyzing && (
        <motion.div
          className="space-y-1.5"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Causa */}
          <div className="rounded-lg p-2" style={{ backgroundColor: '#ef444408', border: '1px solid #ef444415' }}>
            <div className="flex items-center gap-1.5 mb-0.5">
              <AlertTriangle className="w-3 h-3 text-red-400" />
              <span className="text-[10px] font-bold uppercase text-red-400">Causa</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: themeColors.text.primary }}>
              {analysis.cause}
            </p>
          </div>

          {/* Solución */}
          <div className="rounded-lg p-2" style={{ backgroundColor: '#22c55e08', border: '1px solid #22c55e15' }}>
            <div className="flex items-center gap-1.5 mb-0.5">
              <ArrowRight className="w-3 h-3 text-green-400" />
              <span className="text-[10px] font-bold uppercase text-green-400">Solución</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: themeColors.text.primary }}>
              {analysis.solution}
            </p>
          </div>

          {/* Code suggestion */}
          {analysis.code_suggestion && (
            <div className="rounded-lg p-2 font-mono" style={{ backgroundColor: `${themeColors.primary}08`, border: `1px solid ${themeColors.primary}15` }}>
              <div className="flex items-center gap-1.5 mb-0.5">
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

          {/* Technical details (collapsible) */}
          {(capturedError.request || capturedError.response) && (
            <div>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-1 text-[10px] font-medium py-0.5"
                style={{ color: themeColors.text.secondary }}
              >
                {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                Detalles técnicos
              </button>
              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-lg p-2 text-[10px] font-mono space-y-1" style={{ backgroundColor: `${themeColors.surface}60` }}>
                      {capturedError.request && (
                        <div>
                          <span className="font-bold" style={{ color: '#3b82f6' }}>Request: </span>
                          <span style={{ color: themeColors.text.primary }}>
                            {capturedError.request.method} {capturedError.request.url}
                          </span>
                        </div>
                      )}
                      {capturedError.response && (
                        <div>
                          <span className="font-bold" style={{ color: capturedError.response.status >= 500 ? '#ef4444' : '#f59e0b' }}>
                            Response: {capturedError.response.status}
                          </span>
                          {capturedError.response.data != null && (
                            <pre className="mt-0.5 whitespace-pre-wrap break-words opacity-70" style={{ color: themeColors.text.secondary }}>
                              {JSON.stringify(capturedError.response.data, null, 2)?.slice(0, 300) ?? ''}
                            </pre>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Actions row */}
          <div className="flex items-center gap-2 pt-0.5">
            <motion.button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium"
              style={{
                backgroundColor: `${themeColors.surface}80`,
                color: themeColors.text.secondary,
                border: `1px solid ${themeColors.primary}15`,
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {copied ? <><Check className="w-3 h-3 text-green-400" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
            </motion.button>

            {provider && (
              <span
                className="ml-auto text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1"
                style={{
                  backgroundColor: provider === 'openai' ? '#10b98120' : `${themeColors.surface}60`,
                  color: provider === 'openai' ? '#10b981' : themeColors.text.secondary,
                }}
              >
                <Sparkles className="w-2.5 h-2.5" />
                {provider === 'openai' ? 'GPT-4o' : 'Análisis local'}
              </span>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// Componente para los mensajes individuales
function ChatBubble({ 
  message, 
  themeColors, 
  onQuickReply 
}: { 
  message: ChatMessage, 
  themeColors: ThemeColors,
  onQuickReply: (reply: string) => void 
}) {
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';
  const hasErrorAnalysis = !!message.metadata?.errorAnalysis;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 500, 
        damping: 30,
        duration: 0.3 
      }}
      className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isSystem ? 'mt-1' : ''
          }`}
          style={{ 
            backgroundColor: hasErrorAnalysis
              ? '#ef444420'
              : isSystem 
                ? `${themeColors.accent}20` 
                : `${themeColors.primary}20` 
          }}
        >
          {hasErrorAnalysis ? (
            <AlertTriangle className="w-4 h-4 text-red-400" />
          ) : isSystem ? (
            <AlertCircle className="w-4 h-4" style={{ color: themeColors.accent }} />
          ) : (
            <Bot className="w-4 h-4" style={{ color: themeColors.primary }} />
          )}
        </motion.div>
      )}
      
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`px-4 py-3 rounded-2xl relative ${
            isUser 
              ? 'rounded-br-sm' 
              : 'rounded-bl-sm'
          }`}
          style={{
            backgroundColor: isUser 
              ? themeColors.primary
              : isSystem
                ? `${themeColors.accent}10`
                : `${themeColors.surface}40`,
            color: isUser 
              ? 'white' 
              : themeColors.text.primary,
          }}
        >
          {/* Efecto de brillo para mensajes de IA */}
          {!isUser && !isSystem && (
            <motion.div
              className="absolute -inset-0.5 rounded-2xl opacity-0"
              style={{
                background: `linear-gradient(90deg, transparent, ${themeColors.primary}20, transparent)`
              }}
              animate={{ 
                x: [-100, 100],
                opacity: [0, 0.3, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                delay: 1,
                repeatDelay: 5
              }}
            />
          )}
          
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>

          {/* Error analysis card */}
          {message.metadata?.errorAnalysis && (
            <ErrorAnalysisCard
              metadata={message.metadata.errorAnalysis}
              themeColors={themeColors}
            />
          )}
          
          {/* Indicador de confianza para mensajes de IA */}
          {message.metadata?.confidence && (
            <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
              <Sparkles className="w-3 h-3" />
              <span>Confianza: {Math.round(message.metadata.confidence * 100)}%</span>
            </div>
          )}
        </motion.div>
        
        {/* Timestamp */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={`text-xs mt-1 flex items-center gap-1 ${
            isUser ? 'justify-end' : 'justify-start'
          }`}
          style={{ color: themeColors.text.secondary }}
        >
          <Clock className="w-3 h-3" />
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </motion.div>
        
        {/* Quick replies */}
        {message.metadata?.quickReplies && (
          <QuickReplies
            replies={message.metadata.quickReplies}
            onSelect={onQuickReply}
            themeColors={themeColors}
          />
        )}
      </div>
      
      {isUser && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${themeColors.secondary}20` }}
        >
          <User className="w-4 h-4" style={{ color: themeColors.secondary }} />
        </motion.div>
      )}
    </motion.div>
  );
}

// Componente del input de chat
function ChatInput({ 
  onSendMessage, 
  themeColors, 
  disabled 
}: { 
  onSendMessage: (message: string) => void,
  themeColors: ThemeColors,
  disabled: boolean 
}) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="relative"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className={`
        relative rounded-2xl transition-all duration-300 border-2
        ${isFocused ? 'shadow-lg' : 'shadow-sm'}
      `}
      style={{
        borderColor: isFocused ? themeColors.primary : `${themeColors.primary}20`,
        backgroundColor: `${themeColors.surface}80`,
      }}>
        {/* Efecto de brillo en el input cuando está enfocado */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              className="absolute -inset-0.5 rounded-2xl"
              style={{
                background: `linear-gradient(90deg, ${themeColors.primary}30, ${themeColors.secondary}20, ${themeColors.primary}30)`
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>
        
        <div className="relative z-10 flex items-center gap-3 p-3">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={disabled ? "IA está escribiendo..." : "Escribe tu mensaje..."}
            disabled={disabled}
            className="flex-1 bg-transparent outline-none text-sm placeholder:transition-colors duration-200"
            style={{ 
              color: themeColors.text.primary,
              opacity: disabled ? 0.6 : 1,
            }}
          />
          
          <motion.button
            type="submit"
            disabled={!message.trim() || disabled}
            whileHover={{ scale: message.trim() && !disabled ? 1.1 : 1 }}
            whileTap={{ scale: message.trim() && !disabled ? 0.9 : 1 }}
            className={`
              p-2 rounded-xl transition-all duration-200 flex items-center justify-center
              ${!message.trim() || disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}
            `}
            style={{
              backgroundColor: themeColors.primary,
              color: 'white',
            }}
          >
            {disabled ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </motion.button>
        </div>
      </div>
    </motion.form>
  );
}

// Componente principal del chat
interface ChatInterfaceProps {
  isOpen: boolean;
  onToggle: () => void;
  isMinimized: boolean;
  onMinimize: () => void;
}

export function ChatInterface({ isOpen, onToggle, isMinimized, onMinimize }: ChatInterfaceProps) {
  const { themeColors } = useTheme();
  const { state, sendMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  const getStatusColor = () => {
    switch (state.aiStatus) {
      case 'thinking': return themeColors.accent;
      case 'responding': return themeColors.primary;
      case 'error': return '#ef4444';
      default: return themeColors.secondary;
    }
  };

  const getStatusText = () => {
    switch (state.aiStatus) {
      case 'thinking': return 'Pensando...';
      case 'responding': return 'Respondiendo...';
      case 'error': return 'Error';
      default: return 'En línea';
    }
  };

  if (!isOpen) {
    // Botón flotante para abrir el chat
    return (
      <motion.button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl"
        style={{ backgroundColor: themeColors.primary }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <MessageCircle className="w-6 h-6 text-white" />
        
        {/* Indicador de pulso */}
        <motion.div
          className="absolute -inset-1 rounded-full border-2 border-white opacity-30"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.button>
    );
  }

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50 shadow-2xl rounded-2xl overflow-hidden"
      style={{ 
        backgroundColor: `${themeColors.surface}95`,
        backdropFilter: 'blur(10px)',
        width: isMinimized ? '300px' : '400px',
        height: isMinimized ? '60px' : '600px',
      }}
      initial={{ scale: 0, opacity: 0, y: 100 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      layout
    >
      {/* Header */}
      <motion.div
        className="flex items-center justify-between p-4 border-b cursor-pointer"
        style={{ 
          borderColor: `${themeColors.primary}20`,
          backgroundColor: `${themeColors.primary}10`,
        }}
        onClick={isMinimized ? onMinimize : undefined}
        whileHover={isMinimized ? { backgroundColor: `${themeColors.primary}20` } : {}}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="relative"
            animate={{ rotate: state.aiStatus === 'thinking' ? 360 : 0 }}
            transition={{ duration: 2, repeat: state.aiStatus === 'thinking' ? Infinity : 0 }}
          >
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${themeColors.primary}20` }}
            >
              <Bot className="w-5 h-5" style={{ color: themeColors.primary }} />
            </div>
            <motion.div
              className="absolute -inset-1 rounded-full border-2"
              style={{ borderColor: getStatusColor() }}
              animate={{ 
                scale: state.isConnected ? [1, 1.1, 1] : 1,
                opacity: state.isConnected ? [0.5, 0.8, 0.5] : 0.3
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
          
          <div>
            <h3 className="font-semibold text-sm" style={{ color: themeColors.text.primary }}>
              Asistente IA
            </h3>
            <div className="flex items-center gap-2">
              <motion.div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: getStatusColor() }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-xs" style={{ color: themeColors.text.secondary }}>
                {getStatusText()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <motion.button
            onClick={onMinimize}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1 rounded-lg"
            style={{ color: themeColors.text.secondary }}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </motion.button>
          <motion.button
            onClick={onToggle}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1 rounded-lg"
            style={{ color: themeColors.text.secondary }}
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

      {/* Chat Content */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            className="flex flex-col h-full"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '440px' }}>
              <AnimatePresence>
                {state.messages.map((message) => (
                  <ChatBubble
                    key={message.id}
                    message={message}
                    themeColors={themeColors}
                    onQuickReply={sendMessage}
                  />
                ))}
              </AnimatePresence>
              
              {/* Typing Indicator */}
              <AnimatePresence>
                {state.isTyping && (
                  <TypingIndicator themeColors={themeColors} />
                )}
              </AnimatePresence>
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t" style={{ borderColor: `${themeColors.primary}10` }}>
              <ChatInput
                onSendMessage={sendMessage}
                themeColors={themeColors}
                disabled={state.isTyping || state.aiStatus === 'thinking'}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}