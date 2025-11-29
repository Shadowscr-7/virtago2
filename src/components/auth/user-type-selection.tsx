"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Building2,
  UserCheck,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";

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
    gradient: "from-blue-500 via-purple-500 to-pink-500",
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
    gradient: "from-green-500 via-blue-500 to-purple-500",
  },
];

export function UserTypeSelection({
  onBack,
  onSuccess,
}: UserTypeSelectionProps) {
  const [selectedType, setSelectedType] = useState<string>("");
  const { setUserType, isLoading } = useAuthStore();

  const handleContinue = async () => {
    if (!selectedType) return;

    try {
      await setUserType(selectedType as "client" | "distributor");
      onSuccess();
    } catch (error) {
      console.error("Error setting user type:", error);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.6 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8 relative">
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute -top-2 -left-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </motion.button>

          <motion.div
            initial={{ scale: 0.5, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500" />
              <div className="absolute inset-2 rounded-full bg-slate-900 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-3xl font-bold text-white mb-2"
          >
            Tipo de Usuario
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-white/70"
          >
            Selecciona el tipo de cuenta que mejor se adapte a tus necesidades
          </motion.p>
        </div>

        {/* Tipos de usuario */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="grid gap-6 mb-8"
        >
          {userTypes.map((type, index) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;

            return (
              <motion.button
                key={type.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedType(type.id)}
                className={cn(
                  "w-full p-6 rounded-xl border transition-all duration-300 text-left",
                  "hover:border-white/40 hover:bg-white/5",
                  isSelected
                    ? "border-purple-500 bg-white/10"
                    : "border-white/20 bg-white/5",
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Icono */}
                  <div
                    className={cn(
                      "flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center",
                      `bg-gradient-to-r ${type.gradient}`,
                      isSelected && "scale-110",
                    )}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>

                  {/* Contenido */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-white">
                        {type.title}
                      </h3>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center"
                        >
                          <UserCheck className="h-4 w-4 text-white" />
                        </motion.div>
                      )}
                    </div>

                    <p className="text-white/70 mb-4">{type.description}</p>

                    {/* Características */}
                    <div className="grid grid-cols-2 gap-2">
                      {type.features.map((feature, featureIndex) => (
                        <motion.div
                          key={featureIndex}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + featureIndex * 0.1 }}
                          className="flex items-center gap-2 text-sm text-white/60"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                          {feature}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Botón continuar */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleContinue}
          disabled={!selectedType || isLoading}
          className={cn(
            "w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300",
            "bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500",
            "hover:from-purple-600 hover:via-pink-600 hover:to-cyan-600",
            "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent",
            "disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
            (!selectedType || isLoading) && "animate-pulse",
          )}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              Continuar
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}
