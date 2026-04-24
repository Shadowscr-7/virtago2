"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Building2,
  UserCheck,
  ArrowRight,
  Check,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useTheme } from "@/contexts/theme-context";

interface UserTypeSelectionProps {
  onBack: () => void;
  onSuccess: () => void;
}

const userTypes = [
  {
    id: "client",
    title: "Cliente",
    description: "Comprador final de productos",
    icon: User,
    features: [
      "Acceso al catálogo completo",
      "Precios especiales para clientes",
      "Historial de compras",
      "Soporte dedicado",
    ],
  },
  {
    id: "distributor",
    title: "Distribuidor",
    description: "Socio comercial con beneficios especiales",
    icon: Building2,
    features: [
      "Precios mayoristas",
      "Dashboard de ventas",
      "Gestión de territorio",
      "Comisiones y bonificaciones",
    ],
  },
];

export function UserTypeSelection({ onBack, onSuccess }: UserTypeSelectionProps) {
  const [selectedType, setSelectedType] = useState<string>("");
  const { setUserType, isLoading } = useAuthStore();
  const { themeColors } = useTheme();

  const handleContinue = async () => {
    if (!selectedType) return;
    try {
      await setUserType(selectedType as "client" | "distributor");
      onSuccess();
    } catch {
      // error shown via toast
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "#ffffff",
          boxShadow: `0 20px 60px ${themeColors.primary}20, 0 4px 20px rgba(0,0,0,0.08)`,
          border: `1px solid ${themeColors.border}`,
        }}
      >
        {/* Header con gradiente */}
        <div
          className="px-8 pt-8 pb-6 text-white"
          style={{
            background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 text-white" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Tipo de Cuenta</h1>
                <p className="text-white/80 text-sm">Selecciona cómo vas a usar Virtago</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-7">
          <p className="text-sm mb-6" style={{ color: themeColors.text.secondary }}>
            Selecciona el tipo de cuenta que mejor se adapte a tus necesidades
          </p>

          {/* Tipos de usuario */}
          <div className="space-y-4 mb-6">
            {userTypes.map((type, index) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.id;

              return (
                <motion.button
                  key={type.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.08 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedType(type.id)}
                  className="w-full p-5 rounded-xl border-2 text-left transition-all duration-200"
                  style={{
                    borderColor: isSelected ? themeColors.primary : themeColors.border,
                    backgroundColor: isSelected ? `${themeColors.primary}08` : "#ffffff",
                    boxShadow: isSelected ? `0 0 0 3px ${themeColors.primary}20` : "none",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all"
                      style={{
                        background: isSelected
                          ? `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`
                          : themeColors.surface,
                      }}
                    >
                      <Icon
                        className="h-5 w-5"
                        style={{ color: isSelected ? "#ffffff" : themeColors.primary }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3
                          className="text-base font-semibold"
                          style={{ color: themeColors.text.primary }}
                        >
                          {type.title}
                        </h3>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: themeColors.primary }}
                          >
                            <Check className="h-3.5 w-3.5 text-white" />
                          </motion.div>
                        )}
                      </div>

                      <p className="text-sm mb-3" style={{ color: themeColors.text.secondary }}>
                        {type.description}
                      </p>

                      <div className="grid grid-cols-2 gap-1.5">
                        {type.features.map((feature, fi) => (
                          <div
                            key={fi}
                            className="flex items-center gap-1.5 text-xs"
                            style={{ color: themeColors.text.muted }}
                          >
                            <div
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: themeColors.primary }}
                            />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Botón continuar */}
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleContinue}
            disabled={!selectedType || isLoading}
            className="w-full py-3 px-6 rounded-lg font-semibold text-white text-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
              boxShadow: `0 4px 14px ${themeColors.primary}40`,
            }}
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                Continuar
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
