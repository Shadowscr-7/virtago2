"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Building2,
  Briefcase,
  ShoppingBag,
  ArrowRight,
  Check,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useTheme } from "@/contexts/theme-context";
import { useRouter } from "next/navigation";

interface UserTypeSelectionProps {
  onBack: () => void;
  onSuccess: () => void;
}

const userTypes = [
  {
    id: "client" as const,
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
    id: "distributor" as const,
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
  {
    id: "company" as const,
    title: "Compañía",
    description: "Empresa con acceso B2B",
    icon: Briefcase,
    features: [
      "Precios exclusivos B2B",
      "Dashboard empresarial",
      "Múltiples usuarios",
      "Reportes avanzados",
    ],
  },
  {
    id: "vendor" as const,
    title: "Vendedor",
    description: "Vendedor o representante comercial",
    icon: ShoppingBag,
    features: [
      "Panel de ventas",
      "Comisiones y metas",
      "Gestión de clientes",
      "Reportes de desempeño",
    ],
  },
];

export function UserTypeSelection({ onBack, onSuccess }: UserTypeSelectionProps) {
  const [selectedType, setSelectedType] = useState<string>("");
  const { setUserType, isLoading, user } = useAuthStore();
  const { themeColors } = useTheme();
  const router = useRouter();

  const handleContinue = async () => {
    if (!selectedType) return;
    try {
      await setUserType(selectedType as "client" | "distributor" | "company" | "vendor");
      // Determine redirect based on selected type
      const roleMap: Record<string, string> = {
        client: "/",
        distributor: "/admin",
        company: "/admin",
        vendor: "/admin",
      };
      const redirectPath = roleMap[selectedType] || "/";
      router.push(redirectPath);
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
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {user?.firstName ? `¡Hola, ${user.firstName}!` : "Tipo de Cuenta"}
                </h1>
                <p className="text-white/80 text-sm">Seleccioná cómo vas a usar Virtago</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-7">
          <p className="text-sm mb-6" style={{ color: themeColors.text.secondary }}>
            Esta elección define tu experiencia en la plataforma. Es el último paso para empezar.
          </p>

          {/* Tipos de usuario */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {userTypes.map((type, index) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.id;

              return (
                <motion.button
                  key={type.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.06 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedType(type.id)}
                  className="p-4 rounded-xl border-2 text-left transition-all duration-200 relative"
                  style={{
                    borderColor: isSelected ? themeColors.primary : themeColors.border,
                    backgroundColor: isSelected ? `${themeColors.primary}08` : "#ffffff",
                    boxShadow: isSelected ? `0 0 0 3px ${themeColors.primary}20` : "none",
                  }}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: themeColors.primary }}
                    >
                      <Check className="h-3 w-3 text-white" />
                    </motion.div>
                  )}

                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all"
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

                  <h3
                    className="text-sm font-bold mb-0.5"
                    style={{ color: themeColors.text.primary }}
                  >
                    {type.title}
                  </h3>
                  <p className="text-xs" style={{ color: themeColors.text.muted }}>
                    {type.description}
                  </p>
                </motion.button>
              );
            })}
          </div>

          {/* Features del tipo seleccionado */}
          {selectedType && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-5 p-4 rounded-xl"
              style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}
            >
              <p className="text-xs font-semibold mb-2" style={{ color: themeColors.text.primary }}>
                Con este tipo de cuenta tendrás:
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {userTypes.find((t) => t.id === selectedType)?.features.map((feature, fi) => (
                  <div
                    key={fi}
                    className="flex items-center gap-1.5 text-xs"
                    style={{ color: themeColors.text.secondary }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: themeColors.primary }}
                    />
                    {feature}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Botón continuar */}
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
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
                Creando tu cuenta...
              </>
            ) : (
              <>
                Confirmar y entrar
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
