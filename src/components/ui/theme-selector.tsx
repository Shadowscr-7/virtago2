"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check, X } from 'lucide-react';
import { useTheme, type ThemeVariant } from '@/contexts/theme-context';

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
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Panel del selector */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-2xl mx-4"
          >
              <div className="bg-gradient-to-br from-slate-800/98 to-slate-900/98 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      Selector de Temas
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Elige tu paleta de colores favorita
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-gray-400 hover:text-white transition-all duration-200 rounded-lg hover:bg-red-500/20"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Grid de temas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(availableThemes).map(([themeKey, theme], index) => (
                    <motion.div
                      key={themeKey}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleThemeSelect(themeKey as ThemeVariant)}
                      className={`relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer group ${
                        currentTheme === themeKey
                          ? 'border-white/40 bg-white/10 shadow-lg'
                          : 'border-white/10 hover:border-white/20 hover:bg-white/5 hover:shadow-md'
                      }`}
                    >
                      {/* Indicador de tema activo */}
                      {currentTheme === themeKey && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-3 right-3 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center"
                        >
                          <Check className="w-4 h-4 text-white" />
                        </motion.div>
                      )}

                      {/* Nombre del tema */}
                      <h4 className="text-white font-semibold mb-3">
                        {theme.name}
                      </h4>

                      {/* Paleta de colores */}
                      <div className="space-y-3">
                        {/* Colores principales */}
                        <div className="flex gap-2">
                          <div
                            className="w-8 h-8 rounded-lg shadow-lg border border-white/20"
                            style={{ backgroundColor: theme.primary }}
                            title="Color primario"
                          />
                          <div
                            className="w-8 h-8 rounded-lg shadow-lg border border-white/20"
                            style={{ backgroundColor: theme.secondary }}
                            title="Color secundario"
                          />
                          <div
                            className="w-8 h-8 rounded-lg shadow-lg border border-white/20"
                            style={{ backgroundColor: theme.accent }}
                            title="Color de acento"
                          />
                        </div>

                        {/* Gradiente de muestra */}
                        <div
                          className={`h-6 rounded-lg bg-gradient-to-r ${theme.gradients.primary} shadow-lg`}
                          title="Gradiente principal"
                        />

                        {/* Colores de fondo */}
                        <div className="flex gap-2">
                          <div
                            className="w-6 h-6 rounded-md border border-white/20"
                            style={{ backgroundColor: theme.background }}
                            title="Fondo principal"
                          />
                          <div
                            className="w-6 h-6 rounded-md border border-white/20"
                            style={{ backgroundColor: theme.surface }}
                            title="Superficie"
                          />
                          <div
                            className="w-6 h-6 rounded-md border border-white/20"
                            style={{ backgroundColor: theme.text.primary }}
                            title="Texto principal"
                          />
                          <div
                            className="w-6 h-6 rounded-md border border-white/20"
                            style={{ backgroundColor: theme.text.secondary }}
                            title="Texto secundario"
                          />
                        </div>
                      </div>

                      {/* Vista previa del gradiente de fondo */}
                      <div className="mt-3 h-8 rounded-lg bg-gradient-to-r overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${theme.gradients.secondary} opacity-20`}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <p className="text-gray-400 text-xs text-center">
                    Los cambios se aplican inmediatamente y se guardan automáticamente
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
      {/* Botón para abrir el selector */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="relative p-2.5 text-gray-300 hover:text-white transition-all duration-200 rounded-xl hover:bg-white/10 group"
        title="Cambiar tema"
      >
        <Palette className="w-5 h-5" />
        {/* Indicador visual del botón */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </motion.button>

      {/* Modal del selector de temas */}
      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}
