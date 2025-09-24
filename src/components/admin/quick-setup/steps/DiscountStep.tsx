import React from 'react';
import { motion } from 'framer-motion';
import { StepProps } from '../shared/types';

export function DiscountStep({ onNext, onBack, themeColors }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h3 className="text-xl font-semibold" style={{ color: themeColors.text.primary }}>
          Configuración de Descuentos
        </h3>
        <p style={{ color: themeColors.text.secondary }}>
          Este paso se implementará próximamente
        </p>
        
        <div 
          className="p-8 rounded-xl"
          style={{ backgroundColor: `${themeColors.surface}30` }}
        >
          <div className="text-6xl mb-4">🎯</div>
          <h4 className="text-lg font-semibold mb-2" style={{ color: themeColors.text.primary }}>
            Descuentos y Promociones
          </h4>
          <p className="text-sm" style={{ color: themeColors.text.secondary }}>
            Aquí podrás configurar descuentos por volumen, promociones especiales y reglas de precios dinámicos.
          </p>
        </div>
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
          onClick={() => onNext()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 rounded-xl font-medium text-white"
          style={{ backgroundColor: themeColors.primary }}
        >
          Continuar
        </motion.button>
      </div>
    </div>
  );
}