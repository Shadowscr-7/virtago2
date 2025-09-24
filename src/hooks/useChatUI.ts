'use client';

import { useState, useCallback } from 'react';

export interface ChatUIState {
  isOpen: boolean;
  isMinimized: boolean;
  unreadCount: number;
}

export function useChatUI() {
  const [state, setState] = useState<ChatUIState>({
    isOpen: false,
    isMinimized: false,
    unreadCount: 0,
  });

  const toggleChat = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: !prev.isOpen,
      unreadCount: prev.isOpen ? prev.unreadCount : 0, // Clear unread when opening
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
    toggleChat,
    minimizeChat,
    closeChat,
    incrementUnread,
    clearUnread,
  };
}