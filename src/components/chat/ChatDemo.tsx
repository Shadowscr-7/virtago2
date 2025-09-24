'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/theme-context';
import { 
  MessageSquare, 
  Sparkles, 
  Zap, 
  Bot,
  Settings
} from 'lucide-react';

export function ChatDemo() {
  const { themeColors } = useTheme();

  const demoMessages = [
    "¿Cómo configuro productos en el sistema?",
    "¿Puedes ayudarme con la importación de clientes?",
    "¿Cómo funcionan las listas de precios?",
    "Necesito ayuda con la configuración inicial",
    "¿Qué funcionalidades tiene el sistema de descuentos?",
  ];

  const handleSendDemo = (message: string) => {
    // En lugar de usar el context, simplemente mostrar una notificación
    // o usar el chat floating que está en el layout
    console.log('Demo message:', message);
    alert(`Mensaje de demo: "${message}"\n\nAbre el chat flotante (botón inferior derecho) para interactuar con el asistente IA.`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.6 }}
      className="space-y-6"
    >
      <div className="text-center">
        <motion.div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: `${themeColors.primary}20` }}
          whileHover={{ scale: 1.1, rotate: 360 }}
          transition={{ duration: 0.3 }}
        >
          <Bot className="w-8 h-8" style={{ color: themeColors.primary }} />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Asistente IA Integrado
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Prueba nuestro asistente inteligente. Está diseñado para ayudarte con la configuración 
          y responder tus preguntas sobre el sistema.
        </p>
      </div>

      {/* Características del chat */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="p-4 rounded-xl border text-center"
          style={{ 
            backgroundColor: `${themeColors.primary}10`,
            borderColor: `${themeColors.primary}30`
          }}
        >
          <Sparkles className="w-6 h-6 mx-auto mb-2" style={{ color: themeColors.primary }} />
          <h3 className="font-semibold text-sm">IA Inteligente</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Respuestas contextuales y sugerencias inteligentes
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="p-4 rounded-xl border text-center"
          style={{ 
            backgroundColor: `${themeColors.secondary}10`,
            borderColor: `${themeColors.secondary}30`
          }}
        >
          <Zap className="w-6 h-6 mx-auto mb-2" style={{ color: themeColors.secondary }} />
          <h3 className="font-semibold text-sm">Super Fluido</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Animaciones suaves y respuestas instantáneas
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="p-4 rounded-xl border text-center"
          style={{ 
            backgroundColor: `${themeColors.accent}10`,
            borderColor: `${themeColors.accent}30`
          }}
        >
          <Settings className="w-6 h-6 mx-auto mb-2" style={{ color: themeColors.accent }} />
          <h3 className="font-semibold text-sm">Configurable</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Conecta con n8n para funcionalidades avanzadas
          </p>
        </motion.div>
      </div>

      {/* Botones de demostración */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-center">Prueba estas preguntas:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {demoMessages.map((message, index) => (
            <motion.button
              key={message}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSendDemo(message)}
              className="p-3 rounded-xl border text-left text-sm font-medium transition-all hover:shadow-md"
              style={{
                backgroundColor: `${themeColors.surface}30`,
                borderColor: `${themeColors.primary}20`,
                color: themeColors.text.primary,
              }}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" style={{ color: themeColors.primary }} />
              {message}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Instrucciones */}
      <div className="text-center">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border font-medium"
          style={{
            backgroundColor: `${themeColors.primary}10`,
            borderColor: `${themeColors.primary}30`,
            color: themeColors.primary,
          }}
        >
          <MessageSquare className="w-5 h-5" />
          <span>Usa el botón flotante (↘️) para abrir el chat</span>
        </motion.div>
      </div>
    </motion.div>
  );
}