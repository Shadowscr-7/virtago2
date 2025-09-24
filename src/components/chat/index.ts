// Exportaciones principales del sistema de chat
export { ChatSystem } from './ChatSystem';
export { ChatInterface } from './ChatInterface';
export { ChatProvider, useChat } from '../../contexts/chat-context';
export { useChatUI } from '../../hooks/useChatUI';
export { chatConfig, getChatConfig } from './chatConfig';

// Tipos
export type { 
  ChatMessage, 
  ChatState 
} from '../../contexts/chat-context';

export type { 
  ChatUIState 
} from '../../hooks/useChatUI';

export type { 
  ChatConfig, 
  ChatPosition, 
  ChatSize, 
  AnimationSpeed 
} from './chatConfig';