'use client';

import { useState, useCallback, useEffect } from 'react';

export interface ChatUIState {
  isOpen: boolean;
  isMinimized: boolean;
  unreadCount: number;
}

// ── Module-level bridge para abrir el chat desde fuera de React ──
type OpenChatFn = () => void;
let registeredOpenChat: OpenChatFn | null = null;

/** Llamar desde cualquier lugar para abrir el chat programáticamente. */
export function openChatExternally(): void {
  registeredOpenChat?.();
}

export function useChatUI() {
  const [state, setState] = useState<ChatUIState>({
    isOpen: false,
    isMinimized: false,
    unreadCount: 0,
  });

  const openChat = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: true,
      isMinimized: false,
      unreadCount: 0,
    }));
  }, []);

  // Registrar esta instancia como el handler global
  useEffect(() => {
    registeredOpenChat = openChat;
    return () => {
      if (registeredOpenChat === openChat) registeredOpenChat = null;
    };
  }, [openChat]);

  const toggleChat = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: !prev.isOpen,
      unreadCount: prev.isOpen ? prev.unreadCount : 0,
    }));
  }, []);

  const minimizeChat = useCallback(() => {
    setState(prev => ({
      ...prev,
      isMinimized: !prev.isMinimized,
    }));
  }, []);

  const closeChat = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: false,
      isMinimized: false,
    }));
  }, []);

  const incrementUnread = useCallback(() => {
    setState(prev => ({
      ...prev,
      unreadCount: prev.unreadCount + 1,
    }));
  }, []);

  const clearUnread = useCallback(() => {
    setState(prev => ({
      ...prev,
      unreadCount: 0,
    }));
  }, []);

  return {
    ...state,
    openChat,
    toggleChat,
    minimizeChat,
    closeChat,
    incrementUnread,
    clearUnread,
  };
}