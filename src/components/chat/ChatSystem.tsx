'use client';

import React from 'react';
import { ChatProvider } from '../../contexts/chat-context';
import { ChatInterface } from './ChatInterface';
import { useChatUI } from '../../hooks/useChatUI';

// Componente interno que usa los hooks
function ChatWrapper() {
  const chatUI = useChatUI();

  return (
    <ChatInterface
      isOpen={chatUI.isOpen}
      onToggle={chatUI.toggleChat}
      isMinimized={chatUI.isMinimized}
      onMinimize={chatUI.minimizeChat}
    />
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