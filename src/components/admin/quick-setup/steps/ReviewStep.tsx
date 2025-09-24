import React from 'react';
import { motion } from 'framer-motion';
import { StepProps } from '../shared/types';
import { CheckCircle } from 'lucide-react';

export function ReviewStep({ onNext, onBack, themeColors, stepData }: StepProps) {
  const data = stepData as Record<string, unknown>;
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div 
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
          style={{ backgroundColor: `${themeColors.secondary}20` }}
        >
          <CheckCircle className="w-10 h-10" style={{ color: themeColors.secondary }} />
        </div>
        
        <h3 className="text-2xl font-semibold" style={{ color: themeColors.text.primary }}>
          ¡Configuración Completada!
        </h3>
        <p style={{ color: themeColors.text.secondary }}>
          Tu sistema ha sido configurado exitosamente con todos los datos iniciales.
        </p>
      </div>

      {/* Resumen de lo configurado */}
      <div 
        className="p-6 rounded-xl"
        style={{ backgroundColor: `${themeColors.surface}30` }}
      >
        <h4 className="text-lg font-semibold mb-4" style={{ color: themeColors.text.primary }}>
          Resumen de Configuración
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span style={{ color: themeColors.text.secondary }}>Clientes:</span>
              <span className="font-semibold" style={{ color: themeColors.text.primary }}>
                {(data?.uploadedClients as unknown[])?.length || 0} registrados
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: themeColors.text.secondary }}>Productos:</span>
              <span className="font-semibold" style={{ color: themeColors.text.primary }}>
                {(data?.matchedProducts as unknown[])?.length || 0} cargados
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: themeColors.text.secondary }}>Listas de Precios:</span>
              <span className="font-semibold" style={{ color: themeColors.text.primary }}>
                {(data?.uploadedPriceLists as unknown[])?.length || 0} configuradas
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span style={{ color: themeColors.text.secondary }}>Precios:</span>
              <span className="font-semibold" style={{ color: themeColors.text.primary }}>
                {(data?.uploadedPrices as unknown[])?.length || 0} establecidos
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: themeColors.text.secondary }}>Estado:</span>
              <span 
                className="px-2 py-1 rounded text-sm font-medium"
                style={{ 
                  backgroundColor: `${themeColors.secondary}20`,
                  color: themeColors.secondary 
                }}
              >
                Listo para usar
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Próximos pasos */}
      <div 
        className="p-6 rounded-xl"
        style={{ backgroundColor: `${themeColors.primary}10` }}
      >
        <h4 className="text-lg font-semibold mb-3" style={{ color: themeColors.text.primary }}>
          Próximos Pasos Recomendados
        </h4>
        <ul className="space-y-2 text-sm" style={{ color: themeColors.text.secondary }}>
          <li>• Revisar y ajustar los productos importados</li>
          <li>• Configurar usuarios y permisos del sistema</li>
          <li>• Personalizar la apariencia de tu tienda</li>
          <li>• Configurar métodos de pago y envío</li>
        </ul>
      </div>

      <div className="flex justify-between pt-6">
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 rounded-xl font-medium"
          style={{
            backgroundColor: `${themeColors.surface}50`,
            color: themeColors.text.secondary,
          }}
        >
          Anterior
        </motion.button>
        <motion.button
          onClick={() => onNext({ completed: true })}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 rounded-xl font-medium text-white"
          style={{ backgroundColor: themeColors.secondary }}
        >
          Finalizar Configuración
        </motion.button>
      </div>
    </div>
  );
}