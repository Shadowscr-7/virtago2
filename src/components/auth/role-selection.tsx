"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Building2, Briefcase, ShoppingBag, Check, ArrowRight } from "lucide-react";
import { useAuthStore, getRedirectForRole, UserRole } from "@/store/auth";
import { useTheme } from "@/contexts/theme-context";
import { useRouter } from "next/navigation";

const ROLE_OPTIONS: {
  id: UserRole;
  label: string;
  description: string;
  icon: React.ElementType;
  features: string[];
}[] = [
  {
    id: "user",
    label: "Cliente",
    description: "Comprador final de productos",
    icon: User,
    features: ["Catálogo completo", "Precios especiales", "Historial de compras", "Soporte dedicado"],
  },
  {
    id: "distributor",
    label: "Distribuidor",
    description: "Socio comercial con beneficios especiales",
    icon: Building2,
    features: ["Precios mayoristas", "Dashboard de ventas", "Gestión de territorio", "Comisiones"],
  },
  {
    id: "company",
    label: "Compañía",
    description: "Empresa con acceso B2B",
    icon: Briefcase,
    features: ["Precios exclusivos B2B", "Dashboard empresarial", "Múltiples usuarios", "Reportes"],
  },
  {
    id: "vendor",
    label: "Vendedor",
    description: "Vendedor o representante comercial",
    icon: ShoppingBag,
    features: ["Panel de ventas", "Comisiones y metas", "Gestión de clientes", "Reportes"],
  },
];

export function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const { assignRole, isLoading, user } = useAuthStore();
  const { themeColors } = useTheme();
  const router = useRouter();

  const handleConfirm = async () => {
    if (!selectedRole) return;
    try {
      await assignRole(selectedRole);
      // Brief visual pause before redirect
      setTimeout(() => {
        router.push(getRedirectForRole(selectedRole));
      }, 800);
    } catch {
      // Error shown via toast
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl overflow-hidden bg-white"
      style={{
        boxShadow: `0 20px 60px ${themeColors.primary}20, 0 4px 20px rgba(0,0,0,0.08)`,
        border: `1px solid ${themeColors.border}`,
      }}
    >
      {/* Header */}
      <div
        className="px-8 pt-8 pb-6 text-white"
        style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
      >
        <div className="text-center">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Check className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">
            {user?.firstName ? `Bienvenido, ${user.firstName}!` : "Bienvenido a Virtago!"}
          </h2>
          <p className="text-white/80 text-sm mt-1">
            Seleccioná cómo vas a usar la plataforma
          </p>
        </div>
      </div>

      <div className="px-8 py-7">
        <p className="text-sm mb-5 text-center" style={{ color: themeColors.text.secondary }}>
          Esta elección define tu experiencia. Podés cambiarla después desde tu perfil.
        </p>

        {/* Role cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {ROLE_OPTIONS.map((option, index) => {
            const Icon = option.icon;
            const isSelected = selectedRole === option.id;

            return (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRole(option.id)}
                className="p-4 rounded-xl border-2 text-left transition-all duration-200 relative"
                style={{
                  borderColor: isSelected ? themeColors.primary : themeColors.border,
                  backgroundColor: isSelected ? `${themeColors.primary}08` : "#ffffff",
                  boxShadow: isSelected ? `0 0 0 3px ${themeColors.primary}20` : "none",
                }}
              >
                {/* Check badge */}
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
                  <Icon className="h-5 w-5" style={{ color: isSelected ? "#ffffff" : themeColors.primary }} />
                </div>

                <h3 className="text-sm font-bold mb-0.5" style={{ color: themeColors.text.primary }}>
                  {option.label}
                </h3>
                <p className="text-xs" style={{ color: themeColors.text.muted }}>
                  {option.description}
                </p>
              </motion.button>
            );
          })}
        </div>

        {/* Features of selected role */}
        {selectedRole && (
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
              {ROLE_OPTIONS.find((r) => r.id === selectedRole)?.features.map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs" style={{ color: themeColors.text.secondary }}>
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: themeColors.primary }} />
                  {f}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Confirm button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleConfirm}
          disabled={!selectedRole || isLoading}
          className="w-full py-3 px-6 rounded-lg font-semibold text-white text-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{
            background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
            boxShadow: `0 4px 14px ${themeColors.primary}40`,
          }}
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Configurando cuenta...
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
  );
}
