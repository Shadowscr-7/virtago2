"use client";

import { useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Sparkles,
  ArrowRight,
  Building2,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

export function RegistrationSuccess() {
  const router = useRouter();
  const { user, resetRegistration } = useAuthStore();

  const handleContinue = useCallback(() => {
    resetRegistration();
    router.push("/");
  }, [resetRegistration, router]);

  useEffect(() => {
    // Auto-redirect después de 5 segundos
    const timer = setTimeout(() => {
      handleContinue();
    }, 5000);

    return () => clearTimeout(timer);
  }, [handleContinue]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-12 shadow-2xl text-center"
      >
        {/* Icono de éxito animado */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            type: "spring",
            stiffness: 150,
            damping: 10,
          }}
          className="relative w-24 h-24 mx-auto mb-8"
        >
          {/* Círculo de fondo con gradiente */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500" />

          {/* Círculo interior */}
          <div className="absolute inset-2 rounded-full bg-slate-900 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>

          {/* Efectos de brillos */}
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            }}
            className="absolute -inset-4"
          >
            <Sparkles className="absolute top-0 right-0 h-4 w-4 text-yellow-400" />
            <Sparkles className="absolute bottom-0 left-0 h-3 w-3 text-purple-400" />
            <Sparkles className="absolute top-1/2 left-0 h-2 w-2 text-cyan-400" />
            <Sparkles className="absolute bottom-0 right-1/3 h-3 w-3 text-pink-400" />
          </motion.div>
        </motion.div>

        {/* Título y mensaje principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            ¡Registro Completado!
          </h1>

          <p className="text-xl text-white/80 mb-8">
            Bienvenido a{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-bold">
              Virtago
            </span>
          </p>
        </motion.div>

        {/* Información del usuario */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="bg-white/5 rounded-xl p-6 mb-8 border border-white/10"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                {user.userType === "distributor" ? (
                  <Building2 className="h-6 w-6 text-white" />
                ) : (
                  <User className="h-6 w-6 text-white" />
                )}
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-white">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-white/70">
                  {user.userType === "distributor" ? "Distribuidor" : "Cliente"}
                </p>
              </div>
            </div>

            <p className="text-white/60 text-sm">{user.email}</p>
          </motion.div>
        )}

        {/* Beneficios según tipo de usuario */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mb-8"
        >
          <h4 className="text-lg font-semibold text-white mb-4">
            {user?.userType === "distributor"
              ? "Beneficios de Distribuidor:"
              : "Beneficios de Cliente:"}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
            {user?.userType === "distributor" ? (
              <>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2, duration: 0.4 }}
                  className="flex items-center gap-3 text-white/70"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Precios mayoristas
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.3, duration: 0.4 }}
                  className="flex items-center gap-3 text-white/70"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  Dashboard de ventas
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4, duration: 0.4 }}
                  className="flex items-center gap-3 text-white/70"
                >
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  Gestión de territorio
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.5, duration: 0.4 }}
                  className="flex items-center gap-3 text-white/70"
                >
                  <div className="w-2 h-2 bg-pink-500 rounded-full" />
                  Comisiones especiales
                </motion.div>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2, duration: 0.4 }}
                  className="flex items-center gap-3 text-white/70"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Catálogo completo
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.3, duration: 0.4 }}
                  className="flex items-center gap-3 text-white/70"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  Precios exclusivos
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4, duration: 0.4 }}
                  className="flex items-center gap-3 text-white/70"
                >
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  Historial de compras
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.5, duration: 0.4 }}
                  className="flex items-center gap-3 text-white/70"
                >
                  <div className="w-2 h-2 bg-pink-500 rounded-full" />
                  Soporte prioritario
                </motion.div>
              </>
            )}
          </div>
        </motion.div>

        {/* Botón continuar */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleContinue}
          className="w-full py-4 px-8 rounded-lg font-semibold text-white bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 transition-all duration-300 flex items-center justify-center gap-3 group"
        >
          Comenzar a explorar
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>

        {/* Contador regresivo */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.6 }}
          className="text-white/50 text-sm mt-4"
        >
          Serás redirigido automáticamente en 5 segundos...
        </motion.p>

        {/* Decoración adicional */}
        <div className="absolute top-4 right-4 opacity-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="h-8 w-8 text-purple-400" />
          </motion.div>
        </div>

        <div className="absolute bottom-4 left-4 opacity-20">
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="h-6 w-6 text-cyan-400" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
