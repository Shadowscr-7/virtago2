"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/contexts/theme-context";
import { Package } from "lucide-react";
import { WizardStepProps } from "../setup-wizard";

export function ProductsSetupStep({ onComplete }: WizardStepProps) {
  const { themeColors } = useTheme();

  const handleContinue = () => {
    onComplete({ products: [] }); // Placeholder data
  };

  return (
    <div className="space-y-8 text-center">
      <div 
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ backgroundColor: `${themeColors.primary}20` }}
      >
        <Package className="w-8 h-8" style={{ color: themeColors.primary }} />
      </div>
      <h2 className="text-2xl font-bold mb-2" style={{ color: themeColors.text.primary }}>
        Cargar Productos
      </h2>
      <p style={{ color: themeColors.text.secondary }}>
        Este step se implementará próximamente...
      </p>
      
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
        Continuar
      </motion.button>
    </div>
  );
}