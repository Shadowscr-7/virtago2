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
  RefreshCw
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
            backgroundColor: isSystem 
              ? `${themeColors.accent}20` 
              : `${themeColors.primary}20` 
          }}
        >
          {isSystem ? (
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