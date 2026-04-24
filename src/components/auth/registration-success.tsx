"use client";

import { useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Sparkles, ArrowRight, Building2, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { useTheme } from "@/contexts/theme-context";

export function RegistrationSuccess() {
  const router = useRouter();
  const { user, resetRegistration } = useAuthStore();
  const { themeColors } = useTheme();

  const handleContinue = useCallback(() => {
    resetRegistration();
    router.push("/");
  }, [resetRegistration, router]);

  useEffect(() => {
    const timer = setTimeout(() => { handleContinue(); }, 5000);
    return () => clearTimeout(timer);
  }, [handleContinue]);

  const benefits =
    user?.userType === "distributor"
      ? ["Precios mayoristas", "Dashboard de ventas", "Gestión de territorio", "Comisiones especiales"]
      : ["Catálogo completo", "Precios exclusivos", "Historial de compras", "Soporte prioritario"];

  const dotColors = ["#16a34a", "#2563eb", "#7c3aed", "#db2777"];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="rounded-2xl overflow-hidden text-center"
        style={{
          backgroundColor: "#ffffff",
          boxShadow: `0 20px 60px ${themeColors.primary}20, 0 4px 20px rgba(0,0,0,0.08)`,
          border: `1px solid ${themeColors.border}`,
        }}
      >
        {/* Header con gradiente */}
        <div
          className="px-8 pt-8 pb-10"
          style={{
            background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
          }}
        >
          {/* Icono de éxito */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, duration: 0.8, type: "spring", stiffness: 150, damping: 12 }}
            className="relative w-20 h-20 mx-auto mb-6"
          >
            <div className="absolute inset-0 rounded-full bg-white/20 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.1, 1] }}
              transition={{
                rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
              }}
              className="absolute -inset-4"
            >
              <Sparkles className="absolute top-0 right-0 h-4 w-4 text-white/60" />
              <Sparkles className="absolute bottom-0 left-0 h-3 w-3 text-white/40" />
              <Sparkles className="absolute top-1/2 left-0 h-2 w-2 text-white/60" />
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-bold text-white mb-2"
          >
            ¡Registro Completado!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-white/80 text-lg"
          >
            Bienvenido a <span className="font-bold text-white">Virtago</span>
          </motion.p>
        </div>

        <div className="px-8 py-7">
          {/* Info usuario */}
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-4 p-4 rounded-xl mb-6"
              style={{
                backgroundColor: themeColors.surface,
                border: `1px solid ${themeColors.border}`,
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                }}
              >
                {user.userType === "distributor" ? (
                  <Building2 className="h-6 w-6 text-white" />
                ) : (
                  <User className="h-6 w-6 text-white" />
                )}
              </div>
              <div className="text-left">
                <h3 className="font-semibold" style={{ color: themeColors.text.primary }}>
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                  {user.userType === "distributor" ? "Distribuidor" : "Cliente"} · {user.email}
                </p>
              </div>
            </motion.div>
          )}

          {/* Beneficios */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
            className="mb-6"
          >
            <h4 className="text-sm font-semibold mb-3 text-left" style={{ color: themeColors.text.primary }}>
              {user?.userType === "distributor" ? "Beneficios de Distribuidor:" : "Beneficios de Cliente:"}
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              {benefits.map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + i * 0.08 }}
                  className="flex items-center gap-2.5 text-sm"
                  style={{ color: themeColors.text.secondary }}
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: dotColors[i] }} />
                  {benefit}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Botón */}
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleContinue}
            className="w-full py-3 px-8 rounded-lg font-semibold text-white text-sm transition-all duration-300 flex items-center justify-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
              boxShadow: `0 4px 14px ${themeColors.primary}40`,
            }}
          >
            Comenzar a explorar
            <ArrowRight className="h-4 w-4" />
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-xs mt-4"
            style={{ color: themeColors.text.muted }}
          >
            Serás redirigido automáticamente en 5 segundos...
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
