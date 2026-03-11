'use client';

import React, { useEffect } from 'react';
import { ChatProvider, useChat } from '../../contexts/chat-context';
import { ChatInterface } from './ChatInterface';
import { useChatUI } from '../../hooks/useChatUI';
import { onError, type CapturedError } from '@/store/error-analyzer';

// Componente interno que conecta errores con el chat
function ErrorBridge({ openChat }: { openChat: () => void }) {
  const { injectErrorAnalysis } = useChat();

  useEffect(() => {
    const unsub = onError((capturedError: CapturedError) => {
      // Abrir el chat automáticamente
      openChat();
      // Inyectar el análisis en el chat
      injectErrorAnalysis(capturedError);
    });
    return unsub;
  }, [injectErrorAnalysis, openChat]);

  return null;
}

// Componente interno que usa los hooks
function ChatWrapper() {
  const chatUI = useChatUI();

  return (
    <>
      <ErrorBridge openChat={chatUI.openChat} />
      <ChatInterface
        isOpen={chatUI.isOpen}
        onToggle={chatUI.toggleChat}
        isMinimized={chatUI.isMinimized}
        onMinimize={chatUI.minimizeChat}
      />
    </>
  );
}

// Componente principal exportado
export function ChatSystem() {
  return (
    <ChatProvider>
      <ChatWrapper />
    </ChatProvider>
  );
}

// También exportar componentes individuales para uso personalizado
export { ChatInterface } from './ChatInterface';
export { ChatProvider, useChat } from '../../contexts/chat-context';
export { useChatUI } from '../../hooks/useChatUI';