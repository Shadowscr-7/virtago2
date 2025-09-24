"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/contexts/theme-context";
import { Percent } from "lucide-react";
import { WizardStepProps } from "../setup-wizard";

export function DiscountsSetupStep({ onComplete }: WizardStepProps) {
  const { themeColors } = useTheme();

  const handleContinue = () => {
    onComplete({ discounts: [] });
  };

  const handleSkip = () => {
    onComplete({ discounts: [], skipped: true });
  };

  return (
    <div className="space-y-8 text-center">
      <div 
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ backgroundColor: `${themeColors.primary}20` }}
      >
        <Percent className="w-8 h-8" style={{ color: themeColors.primary }} />
      </div>
      <h2 className="text-2xl font-bold mb-2" style={{ color: themeColors.text.primary }}>
        Descuentos
      </h2>
      <p style={{ color: themeColors.text.secondary }}>
        Este step es opcional. Puedes configurar descuentos ahora o hacerlo más tarde.
      </p>
      
      <div className="flex gap-4 justify-center">
        <motion.button
          onClick={handleSkip}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 rounded-xl font-medium transition-all duration-200"
          style={{
            backgroundColor: `${themeColors.surface}70`,
            color: themeColors.text.primary,
          }}
        >
          Omitir por ahora
        </motion.button>
        
        <motion.button
          onClick={handleContinue}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 rounded-xl font-medium transition-all duration-200"
          style={{
            backgroundColor: themeColors.primary,
            color: 'white',
          }}
        >
          Configurar Descuentos
        </motion.button>
      </div>
    </div>
  );
}