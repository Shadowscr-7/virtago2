"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Check, X } from "lucide-react";
import { useTheme, type ThemeVariant } from "@/contexts/theme-context";

export function ThemeSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { currentTheme, setTheme, availableThemes } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeSelect = (themeKey: ThemeVariant) => {
    setTheme(themeKey);
    setIsOpen(false);
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-xl mx-4"
          >
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    Selector de Tema
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Elige la paleta de colores del panel
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-700 transition-all duration-200 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Grid de temas */}
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(availableThemes).map(
                  ([themeKey, theme], index) => {
                    const isActive = currentTheme === themeKey;
                    return (
                      <motion.div
                        key={themeKey}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.07 }}
                        whileHover={{ scale: 1.03, y: -3 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleThemeSelect(themeKey as ThemeVariant)}
                        className="relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200"
                        style={{
                          borderColor: isActive ? theme.primary : "#e5e7eb",
                          backgroundColor: isActive ? theme.surface : "#fafafa",
                          boxShadow: isActive
                            ? `0 0 0 3px ${theme.primary}30`
                            : "none",
                        }}
                      >
                        {/* Check activo */}
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: theme.primary }}
                          >
                            <Check className="w-3.5 h-3.5 text-white" />
                          </motion.div>
                        )}

                        {/* Nombre */}
                        <h4
                          className="font-semibold text-sm mb-3"
                          style={{ color: theme.primary }}
                        >
                          {theme.name}
                        </h4>

                        {/* Muestra de colores */}
                        <div className="flex gap-2 mb-3">
                          <div
                            className="w-8 h-8 rounded-lg shadow-sm border border-black/10"
                            style={{ backgroundColor: theme.primary }}
                            title="Color primario"
                          />
                          <div
                            className="w-8 h-8 rounded-lg shadow-sm border border-black/10"
                            style={{ backgroundColor: theme.secondary }}
                            title="Color secundario"
                          />
                          <div
                            className="w-8 h-8 rounded-lg shadow-sm border border-black/10"
                            style={{ backgroundColor: theme.accent }}
                            title="Acento"
                          />
                        </div>

                        {/* Gradiente */}
                        <div
                          className={`h-5 rounded-lg bg-gradient-to-r ${theme.gradients.primary}`}
                        />

                        {/* Fondo + superficie */}
                        <div className="flex gap-2 mt-2">
                          <div
                            className="flex-1 h-4 rounded border border-gray-200"
                            style={{ backgroundColor: theme.background }}
                            title="Fondo"
                          />
                          <div
                            className="flex-1 h-4 rounded border border-gray-200"
                            style={{ backgroundColor: theme.surface }}
                            title="Superficie"
                          />
                        </div>
                      </motion.div>
                    );
                  }
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-gray-400 text-xs text-center">
                  El tema se aplica instantáneamente y se guarda automáticamente
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="relative p-2.5 transition-all duration-200 rounded-xl group"
        style={{
          color: "var(--theme-text-secondary)",
        }}
        title="Cambiar tema"
      >
        <Palette className="w-5 h-5" />
      </motion.button>

      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}
