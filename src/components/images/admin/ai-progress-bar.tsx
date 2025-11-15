/**
 * Barra de Progreso Animada para Análisis de Imágenes con IA
 * Muestra mensajes dinámicos sobre el proceso de matching
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Brain, Search, CheckCircle } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { useEffect, useState, useMemo } from "react";

interface AIProgressBarProps {
  currentStep: number;
  totalSteps: number;
  currentImageName?: string;
  stage: "analyzing" | "matching" | "completed";
}

export function AIProgressBar({
  currentStep,
  totalSteps,
  currentImageName,
  stage,
}: AIProgressBarProps) {
  const { themeColors } = useTheme();
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = useMemo(() => ({
    analyzing: [
      "🤖 IA analizando la imagen...",
      "🔍 Detectando producto, marca y características...",
      "🧠 Extrayendo información relevante...",
      "📊 Procesando datos visuales...",
      "✨ Identificando categoría y atributos...",
    ],
    matching: [
      "🎯 Buscando productos coincidentes...",
      "🔎 Comparando con inventario...",
      "📈 Calculando porcentaje de similitud...",
      "🎪 Matching inteligente en proceso...",
      "⚡ Ordenando resultados por relevancia...",
    ],
    completed: [
      "✅ Análisis completado exitosamente",
      "🎉 Producto identificado y asignado",
      "💯 Procesamiento finalizado",
    ],
  }), []);

  // Rotar mensajes cada 2 segundos
  useEffect(() => {
    if (stage === "completed") return;

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages[stage].length);
    }, 2000);

    return () => clearInterval(interval);
  }, [stage, messages]);

  const progress = (currentStep / totalSteps) * 100;

  const getStageIcon = () => {
    switch (stage) {
      case "analyzing":
        return <Brain className="w-5 h-5 animate-pulse" />;
      case "matching":
        return <Search className="w-5 h-5 animate-pulse" />;
      case "completed":
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-4 p-6 rounded-xl border border-white/10 backdrop-blur-sm"
      style={{
        background: `linear-gradient(135deg, ${themeColors.surface}40, ${themeColors.surface}20)`
      }}
    >
      {/* Header con icono y mensaje */}
      <div className="flex items-center gap-3">
        <motion.div
          key={stage}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-2 rounded-lg"
          style={{
            background: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
          }}
        >
          {getStageIcon()}
        </motion.div>

        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.p
              key={`${stage}-${messageIndex}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              {messages[stage][messageIndex]}
            </motion.p>
          </AnimatePresence>

          {currentImageName && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
              {currentImageName}
            </p>
          )}
        </div>

        <div className="text-right">
          <p className="text-lg font-bold"
            style={{ color: themeColors.primary }}
          >
            {currentStep}/{totalSteps}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            imágenes
          </p>
        </div>
      </div>

      {/* Barra de progreso principal */}
      <div className="relative">
        <div className="h-3 bg-white/20 dark:bg-gray-700/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full relative overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              background: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
            }}
          >
            {/* Efecto de brillo animado */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ["-100%", "200%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </motion.div>
        </div>

        {/* Porcentaje */}
        <motion.div
          className="absolute -top-1 text-xs font-bold text-white px-2 py-0.5 rounded-full shadow-lg"
          initial={{ left: 0 }}
          animate={{ left: `calc(${progress}% - 20px)` }}
          transition={{ duration: 0.5 }}
          style={{
            background: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
          }}
        >
          {Math.round(progress)}%
        </motion.div>
      </div>

      {/* Detalles del stage */}
      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-1 text-green-500`}>
            ✓ Subida
          </div>
          <div className={`flex items-center gap-1 ${stage === "analyzing" || stage === "matching" || stage === "completed" ? "text-green-500" : stage === "analyzing" ? "text-blue-500" : "text-gray-400"}`}>
            {stage === "completed" || stage === "matching" ? "✓" : stage === "analyzing" ? "⏳" : "○"} Análisis IA
          </div>
          <div className={`flex items-center gap-1 ${stage === "matching" || stage === "completed" ? stage === "completed" ? "text-green-500" : "text-blue-500" : "text-gray-400"}`}>
            {stage === "completed" ? "✓" : stage === "matching" ? "⏳" : "○"} Matching
          </div>
        </div>

        {stage === "completed" && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1 text-green-500 font-medium"
          >
            <CheckCircle className="w-4 h-4" />
            Completado
          </motion.div>
        )}
      </div>

      {/* Partículas decorativas */}
      {stage === "analyzing" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: themeColors.primary,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.4,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
