"use client";

import { motion } from "framer-motion";
import {
  Gift,
  TrendingUp,
  Package,
  ShoppingBag,
  DollarSign,
  Layers,
  Zap,
  Crown,
  UserPlus,
  Calendar,
  Truck,
  Percent,
  Star,
  Info,
} from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { DISCOUNT_TEMPLATES, DiscountTemplateType, DiscountTemplate } from "@/types/discount-templates";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Gift,
  TrendingUp,
  Package,
  ShoppingBag,
  DollarSign,
  Layers,
  Zap,
  Crown,
  UserPlus,
  Calendar,
  Truck,
  Percent,
};

interface DiscountTemplateSelectorProps {
  selectedTemplate: DiscountTemplateType | null;
  onSelectTemplate: (template: DiscountTemplateType) => void;
}

export function DiscountTemplateSelector({
  selectedTemplate,
  onSelectTemplate,
}: DiscountTemplateSelectorProps) {
  const { themeColors } = useTheme();

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "simple":
        return "#10B981";
      case "medium":
        return "#F59E0B";
      case "complex":
        return "#EF4444";
      default:
        return themeColors.text.secondary;
    }
  };

  const getComplexityLabel = (complexity: string) => {
    switch (complexity) {
      case "simple":
        return "Fácil";
      case "medium":
        return "Intermedio";
      case "complex":
        return "Avanzado";
      default:
        return complexity;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: themeColors.text.primary }}>
          Selecciona un Template de Descuento
        </h2>
        <p className="text-sm" style={{ color: themeColors.text.secondary }}>
          Elige el tipo de promoción que mejor se adapte a tus necesidades. Cada template incluye
          configuraciones específicas y ejemplos.
        </p>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {DISCOUNT_TEMPLATES.map((template: DiscountTemplate, index: number) => {
          const Icon = iconMap[template.icon];
          const isSelected = selectedTemplate === template.id;

          return (
            <motion.button
              key={template.id}
              type="button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectTemplate(template.id)}
              className="relative p-5 rounded-2xl border-2 transition-all duration-300 text-left group overflow-hidden"
              style={{
                backgroundColor: isSelected
                  ? `${template.color}15`
                  : themeColors.surface + "50",
                borderColor: isSelected
                  ? template.color
                  : themeColors.primary + "20",
                boxShadow: isSelected
                  ? `0 8px 20px ${template.color}30`
                  : "none",
              }}
            >
              {/* Background Gradient */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(135deg, ${template.color}10, transparent)`,
                }}
              />

              {/* Popular Badge */}
              {template.popular && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.05 + 0.2 }}
                  className="absolute top-3 right-3 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg"
                >
                  <Star className="w-3 h-3 fill-current" />
                  Popular
                </motion.div>
              )}

              {/* Content */}
              <div className="relative z-10 space-y-3">
                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${template.color}, ${template.color}CC)`,
                  }}
                >
                  {Icon && <Icon className="w-7 h-7 text-white" />}
                </div>

                {/* Name */}
                <h3
                  className="text-lg font-bold leading-tight"
                  style={{ color: themeColors.text.primary }}
                >
                  {template.name}
                </h3>

                {/* Description */}
                <p
                  className="text-sm leading-relaxed min-h-[40px]"
                  style={{ color: themeColors.text.secondary }}
                >
                  {template.description}
                </p>

                {/* Complexity Badge */}
                <div className="flex items-center gap-2">
                  <div
                    className="px-2 py-1 rounded-lg text-xs font-medium"
                    style={{
                      backgroundColor: `${getComplexityColor(template.complexity)}20`,
                      color: getComplexityColor(template.complexity),
                    }}
                  >
                    {getComplexityLabel(template.complexity)}
                  </div>
                </div>

                {/* Examples */}
                <div className="space-y-1">
                  <p className="text-xs font-medium" style={{ color: themeColors.text.secondary }}>
                    Ejemplos:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {template.examples.slice(0, 2).map((example, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 rounded-md"
                        style={{
                          backgroundColor: `${template.color}15`,
                          color: template.color,
                        }}
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Selected Indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: template.color }}
                  >
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-4 rounded-xl border flex items-start gap-3"
        style={{
          backgroundColor: `${themeColors.accent}10`,
          borderColor: `${themeColors.accent}30`,
        }}
      >
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: themeColors.accent }} />
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: themeColors.text.primary }}>
            ¿Necesitas ayuda para elegir?
          </p>
          <p className="text-xs" style={{ color: themeColors.text.secondary }}>
            Los templates <strong>populares</strong> son los más utilizados y fáciles de configurar.
            Los templates <strong>intermedios</strong> ofrecen más opciones de personalización.
            Selecciona uno para ver los campos de configuración y un ejemplo en tiempo real.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
