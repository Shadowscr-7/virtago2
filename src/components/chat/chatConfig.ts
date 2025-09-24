// Configuración del sistema de chat
export const chatConfig = {
  // Configuración de apariencia
  appearance: {
    position: 'bottom-right', // 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
    buttonSize: 'medium', // 'small' | 'medium' | 'large'
    animationSpeed: 'normal', // 'slow' | 'normal' | 'fast'
    showTypingIndicator: true,
    showTimestamps: true,
    showAvatars: true,
    enableSoundEffects: false,
  },

  // Configuración de funcionalidad
  functionality: {
    enableQuickReplies: true,
    enableFileUpload: false, // Para futuras implementaciones
    enableVoiceMessages: false, // Para futuras implementaciones
    maxMessageLength: 1000,
    historyLimit: 100, // Número máximo de mensajes a mantener
    autoScroll: true,
  },

  // Configuración de IA
  ai: {
    responseDelay: {
      min: 1000, // Mínimo delay en ms para simular tiempo de procesamiento
      max: 3000, // Máximo delay en ms
    },
    confidenceThreshold: 0.7, // Mostrar confianza solo si es mayor a este valor
    enableSuggestions: true,
    maxSuggestions: 4,
  },

  // Mensajes del sistema
  messages: {
    welcome: '¡Hola! Soy tu asistente de IA. Estoy aquí para ayudarte con la configuración de tu sistema y responder cualquier pregunta que tengas. ¿En qué puedo ayudarte hoy?',
    offline: 'El asistente no está disponible en este momento. Por favor, intenta más tarde.',
    error: 'Lo siento, hubo un problema procesando tu mensaje. Por favor, intenta nuevamente.',
    typing: 'El asistente está escribiendo...',
    connecting: 'Conectando con el asistente...',
  },

  // Configuración de n8n
  n8n: {
    enabled: false, // Cambiar a true cuando se configure n8n
    webhookUrl: '', // URL del webhook de n8n
    timeout: 30000, // Timeout para requests en ms
    retries: 3, // Número de reintentos en caso de error
  },

  // Respuestas predefinidas para diferentes contextos
  predefinedResponses: {
    productos: {
      keywords: ['producto', 'inventario', 'stock', 'item', 'artículo'],
      responses: [
        {
          content: 'Para configurar productos, puedes subirlos masivamente usando archivos CSV o JSON. El sistema incluye IA para categorizar automáticamente tus productos y sugerir mejoras en las descripciones. ¿Te gustaría que te muestre cómo funciona?',
          quickReplies: ['Mostrar ejemplo CSV', 'Ver categorización IA', 'Ayuda con imágenes', 'Gestión de stock']
        }
      ]
    },
    clientes: {
      keywords: ['cliente', 'usuario', 'customer', 'comprador'],
      responses: [
        {
          content: 'La importación de clientes es muy sencilla. Puedes subir un archivo con información básica como nombre, email, teléfono y dirección. El sistema automáticamente creará perfiles completos y asignará niveles de precios. ¿Necesitas el formato de ejemplo?',
          quickReplies: ['Descargar formato', 'Ver niveles de precio', 'Configurar descuentos', 'Segmentación']
        }
      ]
    },
    precios: {
      keywords: ['precio', 'lista', 'descuento', 'tarifa', 'costo'],
      responses: [
        {
          content: 'Las listas de precios te permiten tener diferentes precios para distintos tipos de clientes (mayorista, minorista, VIP). Puedes configurar descuentos automáticos por volumen y promociones especiales. ¿Quieres ver cómo se configuran?',
          quickReplies: ['Crear lista de precios', 'Configurar descuentos', 'Ver ejemplos', 'Reglas automáticas']
        }
      ]
    },
    configuracion: {
      keywords: ['configurar', 'setup', 'instalar', 'configuración'],
      responses: [
        {
          content: 'Puedo guiarte a través de la configuración completa del sistema. Esto incluye la importación de datos, configuración de usuarios, personalización de la interfaz y configuración de integraciones. ¿Por dónde te gustaría empezar?',
          quickReplies: ['Tour del sistema', 'Importar datos', 'Configurar usuarios', 'Personalizar interfaz']
        }
      ]
    },
    ayuda: {
      keywords: ['ayuda', 'help', 'soporte', 'problema', 'error'],
      responses: [
        {
          content: 'Estoy aquí para ayudarte con cualquier duda. Puedo asistirte con la configuración del sistema, importación de datos, resolución de problemas y mejores prácticas. ¿Cuál es tu consulta específica?',
          quickReplies: ['Problemas técnicos', 'Guía de uso', 'Mejores prácticas', 'Contactar soporte']
        }
      ]
    }
  },

  // Shortcuts de teclado
  shortcuts: {
    toggleChat: ['ctrl+shift+c'], // Combinación para abrir/cerrar chat  
    focusInput: ['ctrl+shift+i'], // Combinación para enfocar el input
    clearChat: ['ctrl+shift+x'], // Combinación para limpiar chat
  }
};

// Función para obtener configuración con valores por defecto
export function getChatConfig(overrides?: Partial<typeof chatConfig>) {
  return {
    ...chatConfig,
    ...overrides,
    appearance: {
      ...chatConfig.appearance,
      ...overrides?.appearance,
    },
    functionality: {
      ...chatConfig.functionality,
      ...overrides?.functionality,
    },
    ai: {
      ...chatConfig.ai,
      ...overrides?.ai,
    },
    n8n: {
      ...chatConfig.n8n,
      ...overrides?.n8n,
    },
  };
}

// Tipos para TypeScript
export type ChatConfig = typeof chatConfig;
export type ChatPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
export type ChatSize = 'small' | 'medium' | 'large';
export type AnimationSpeed = 'slow' | 'normal' | 'fast';