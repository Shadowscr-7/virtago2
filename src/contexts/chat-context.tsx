'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
// import { chatConfig } from '../components/chat/chatConfig';

// Tipos del sistema de chat
export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: Date;
  isTyping?: boolean;
  metadata?: {
    confidence?: number;
    suggestions?: string[];
    attachments?: string[];
    quickReplies?: string[];
  };
}

export interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  isConnected: boolean;
  currentConversationId?: string;
  aiStatus: 'idle' | 'thinking' | 'responding' | 'error';
}

type ChatAction =
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'SET_AI_STATUS'; payload: ChatState['aiStatus'] }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'CLEAR_CHAT' }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; updates: Partial<ChatMessage> } }
  | { type: 'REMOVE_MESSAGE'; payload: string };

interface ChatContextType {
  state: ChatState;
  sendMessage: (content: string, metadata?: ChatMessage['metadata']) => Promise<void>;
  clearChat: () => void;
  setTyping: (isTyping: boolean) => void;
  setAiStatus: (status: ChatState['aiStatus']) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  removeMessage: (id: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Reducer para manejar el estado del chat
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case 'SET_TYPING':
      return {
        ...state,
        isTyping: action.payload,
      };
    case 'SET_AI_STATUS':
      return {
        ...state,
        aiStatus: action.payload,
      };
    case 'SET_CONNECTED':
      return {
        ...state,
        isConnected: action.payload,
      };
    case 'CLEAR_CHAT':
      return {
        ...state,
        messages: [],
        isTyping: false,
        aiStatus: 'idle',
      };
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id
            ? { ...msg, ...action.payload.updates }
            : msg
        ),
      };
    case 'REMOVE_MESSAGE':
      return {
        ...state,
        messages: state.messages.filter(msg => msg.id !== action.payload),
      };
    default:
      return state;
  }
}

// Estado inicial
const initialState: ChatState = {
  messages: [
    {
      id: 'welcome',
      content: '¡Hola! Soy tu asistente de IA. Estoy aquí para ayudarte con la configuración de tu sistema y responder cualquier pregunta que tengas. ¿En qué puedo ayudarte hoy?',
      sender: 'ai',
      timestamp: new Date(),
      metadata: {
        quickReplies: [
          '¿Cómo configuro productos?',
          '¿Cómo importo clientes?',
          '¿Cómo funcionan las listas de precios?',
          'Ayuda general'
        ]
      }
    }
  ],
  isTyping: false,
  isConnected: true,
  aiStatus: 'idle',
};

// Simulador de respuestas de IA (más tarde se conectará con n8n)
const simulateAIResponse = async (userMessage: string): Promise<ChatMessage> => {
  // Simular tiempo de respuesta realista
  const responseTime = Math.random() * 2000 + 1000; // 1-3 segundos
  
  await new Promise(resolve => setTimeout(resolve, responseTime));
  
  const responses = {
    productos: {
      content: 'Para configurar productos, puedes subirlos masivamente usando archivos CSV o JSON. El sistema incluye IA para categorizar automáticamente tus productos y sugerir mejoras en las descripciones. ¿Te gustaría que te muestre cómo funciona?',
      suggestions: ['Mostrar ejemplo de CSV', 'Ver categorización IA', 'Ayuda con imágenes']
    },
    clientes: {
      content: 'La importación de clientes es muy sencilla. Puedes subir un archivo con información básica como nombre, email, teléfono y dirección. El sistema automáticamente creará perfiles completos y asignará niveles de precios. ¿Necesitas el formato de ejemplo?',
      suggestions: ['Descargar formato', 'Ver niveles de precio', 'Configurar descuentos']
    },
    precios: {
      content: 'Las listas de precios te permiten tener diferentes precios para distintos tipos de clientes (mayorista, minorista, VIP). Puedes configurar descuentos automáticos por volumen y promociones especiales. ¿Quieres ver cómo se configuran?',
      suggestions: ['Crear lista de precios', 'Configurar descuentos', 'Ver ejemplos']
    },
    default: {
      content: 'Entiendo tu consulta. Puedo ayudarte con la configuración de productos, clientes, precios, y cualquier aspecto del sistema. También puedo explicarte cómo funciona cada módulo y darte consejos para optimizar tu configuración. ¿Sobre qué te gustaría saber más?',
      suggestions: ['Tour del sistema', 'Mejores prácticas', 'Configuración avanzada', 'Soporte técnico']
    }
  };
  
  // Lógica simple para determinar el tipo de respuesta
  const message = userMessage.toLowerCase();
  let responseType: keyof typeof responses = 'default';
  
  if (message.includes('producto') || message.includes('inventario') || message.includes('stock')) {
    responseType = 'productos';
  } else if (message.includes('cliente') || message.includes('usuario') || message.includes('customer')) {
    responseType = 'clientes';
  } else if (message.includes('precio') || message.includes('lista') || message.includes('descuento')) {
    responseType = 'precios';
  }
  
  const response = responses[responseType];
  
  return {
    id: `ai-${Date.now()}`,
    content: response.content,
    sender: 'ai',
    timestamp: new Date(),
    metadata: {
      confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
      suggestions: response.suggestions,
    }
  };
};

// Provider component
interface ChatProviderProps {
  children: React.ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const sendMessage = useCallback(async (content: string, metadata?: ChatMessage['metadata']) => {
    // Agregar mensaje del usuario
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content,
      sender: 'user',
      timestamp: new Date(),
      metadata,
    };

    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_AI_STATUS', payload: 'thinking' });
    dispatch({ type: 'SET_TYPING', payload: true });

    try {
      // Simular respuesta de IA (aquí se conectará con n8n)
      dispatch({ type: 'SET_AI_STATUS', payload: 'responding' });
      const aiResponse = await simulateAIResponse(content);
      
      dispatch({ type: 'SET_TYPING', payload: false });
      dispatch({ type: 'ADD_MESSAGE', payload: aiResponse });
      dispatch({ type: 'SET_AI_STATUS', payload: 'idle' });
    } catch {
      dispatch({ type: 'SET_TYPING', payload: false });
      dispatch({ type: 'SET_AI_STATUS', payload: 'error' });
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        content: 'Lo siento, hubo un problema procesando tu mensaje. Por favor, intenta nuevamente.',
        sender: 'system',
        timestamp: new Date(),
      };
      
      dispatch({ type: 'ADD_MESSAGE', payload: errorMessage });
      dispatch({ type: 'SET_AI_STATUS', payload: 'idle' });
    }
  }, []);

  const clearChat = useCallback(() => {
    dispatch({ type: 'CLEAR_CHAT' });
  }, []);

  const setTyping = useCallback((isTyping: boolean) => {
    dispatch({ type: 'SET_TYPING', payload: isTyping });
  }, []);

  const setAiStatus = useCallback((status: ChatState['aiStatus']) => {
    dispatch({ type: 'SET_AI_STATUS', payload: status });
  }, []);

  const updateMessage = useCallback((id: string, updates: Partial<ChatMessage>) => {
    dispatch({ type: 'UPDATE_MESSAGE', payload: { id, updates } });
  }, []);

  const removeMessage = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_MESSAGE', payload: id });
  }, []);

  const contextValue: ChatContextType = {
    state,
    sendMessage,
    clearChat,
    setTyping,
    setAiStatus,
    updateMessage,
    removeMessage,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}

// Hook para usar el contexto
export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

// Hook para integración con n8n (implementar más tarde)
export function useN8nIntegration() {
  const { sendMessage } = useChat();
  
  const sendToN8n = useCallback(async (message: string, webhook_url?: string) => {
    // Aquí implementaremos la conexión con n8n
    try {
      if (webhook_url) {
        const response = await fetch(webhook_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            timestamp: new Date().toISOString(),
            source: 'virtago-chat',
          }),
        });
        
        if (response.ok) {
          const aiResponse = await response.json();
          return aiResponse;
        }
      }
      
      // Fallback a simulación si no hay webhook
      return await sendMessage(message);
    } catch (err) {
      console.error('Error sending message to n8n:', err);
      throw err;
    }
  }, [sendMessage]);

  return { sendToN8n };
}