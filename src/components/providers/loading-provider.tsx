"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/theme-context";

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}

interface LoadingProviderProps {
  children: React.ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false); // Cambiar a false para evitar hidratación
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Simular carga inicial solo en el cliente
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

  return (
    <LoadingContext.Provider
      value={{ isLoading, setIsLoading, startLoading, stopLoading }}
    >
      {mounted && (
        <AnimatePresence mode="wait">
          {isLoading && <VirtagoLoader />}
        </AnimatePresence>
      )}
      {(!isLoading || !mounted) && children}
    </LoadingContext.Provider>
  );
}

function VirtagoLoader() {
  const { themeColors } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: `
          radial-gradient(ellipse at top left, ${themeColors.primary}15, transparent 50%),
          radial-gradient(ellipse at top right, ${themeColors.secondary}15, transparent 50%),
          radial-gradient(ellipse at bottom, ${themeColors.accent}10, transparent 50%),
          linear-gradient(135deg, #0f172a, #1e293b, #0f172a)
        `,
      }}
    >
      <div className="text-center">
        {/* Logo animado */}
        <motion.div
          initial={{ scale: 0.5, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 mx-auto"
            >
              <div
                className="absolute inset-0 rounded-full animate-pulse"
                style={{
                  background: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary}, ${themeColors.accent})`,
                }}
              />
              <div
                className="absolute inset-2 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(to bottom right, #0f172a, ${themeColors.primary}20, #1e293b)`,
                }}
              >
                <span className="text-2xl font-bold text-white">V</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Título */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-4xl font-bold bg-clip-text text-transparent mb-4"
          style={{
            backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary}, ${themeColors.accent})`,
          }}
        >
          VIRTAGO
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-slate-300 text-lg mb-8"
        >
          B2B E-commerce Platform
        </motion.p>

        {/* Barras de carga animadas */}
        <div className="flex space-x-2 justify-center">
          {[0, 1, 2, 3, 4].map((index) => (
            <motion.div
              key={index}
              initial={{ height: 4 }}
              animate={{ height: [4, 20, 4] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: index * 0.1,
                ease: "easeInOut",
              }}
              className="w-1 rounded-full"
              style={{
                background: `linear-gradient(to top, ${themeColors.primary}, ${themeColors.accent})`,
              }}
            />
          ))}
        </div>

        {/* Texto de carga */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-slate-400 text-sm mt-6"
        >
          Cargando experiencia premium...
        </motion.p>
      </div>

      {/* Partículas de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              x: [0, Math.random() * 200 - 100],
              y: [0, Math.random() * 200 - 100],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: themeColors.primary,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
