"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/contexts/theme-context";
import { Palette, Star, Heart, ShoppingBag } from "lucide-react";

export function ThemeDemo() {
  const { themeColors } = useTheme();

  return (
    <div className="space-y-6">
      {/* Encabezado con información del tema actual */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-white/80 to-gray-50/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-2xl p-6 shadow-xl"
      >
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
            style={{ backgroundColor: themeColors.primary }}
          >
            <Palette className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Tema Activo: {themeColors.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Vista previa de la paleta de colores actual
            </p>
          </div>
        </div>

        {/* Paleta de colores principal */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div
              className="w-full h-16 rounded-lg shadow-lg border border-white/20 mb-2"
              style={{ backgroundColor: themeColors.primary }}
            />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Primario
            </span>
          </div>
          <div className="text-center">
            <div
              className="w-full h-16 rounded-lg shadow-lg border border-white/20 mb-2"
              style={{ backgroundColor: themeColors.secondary }}
            />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Secundario
            </span>
          </div>
          <div className="text-center">
            <div
              className="w-full h-16 rounded-lg shadow-lg border border-white/20 mb-2"
              style={{ backgroundColor: themeColors.accent }}
            />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Acento
            </span>
          </div>
          <div className="text-center">
            <div
              className="w-full h-16 rounded-lg shadow-lg border border-white/20 mb-2"
              style={{ backgroundColor: themeColors.surface }}
            />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Superficie
            </span>
          </div>
        </div>
      </motion.div>

      {/* Ejemplos de componentes con el tema */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Botón primario */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-white/70 to-gray-50/70 dark:from-slate-800/70 dark:to-slate-700/70 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-2xl p-6 shadow-xl"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Botón Primario
          </h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ backgroundColor: themeColors.primary }}
            className="w-full py-3 px-6 text-white rounded-xl font-medium shadow-lg transition-all duration-200"
          >
            Acción Principal
          </motion.button>
        </motion.div>

        {/* Tarjeta con gradiente */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-white/70 to-gray-50/70 dark:from-slate-800/70 dark:to-slate-700/70 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-2xl p-6 shadow-xl"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tarjeta de Producto
          </h3>
          <div className="space-y-3">
            <div
              className={`h-24 rounded-lg bg-gradient-to-r ${themeColors.gradients.primary} flex items-center justify-center`}
            >
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-900 dark:text-white font-medium">
                Producto Ejemplo
              </span>
              <div className="flex items-center gap-1">
                <Star
                  className="w-4 h-4 fill-current"
                  style={{ color: themeColors.accent }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  4.8
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Iconos y estado */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-white/70 to-gray-50/70 dark:from-slate-800/70 dark:to-slate-700/70 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-2xl p-6 shadow-xl"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Estados de Iconos
          </h3>
          <div className="flex gap-4 justify-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="p-3 rounded-full shadow-lg"
              style={{ backgroundColor: themeColors.primary }}
            >
              <Heart className="w-6 h-6 text-white" />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="p-3 rounded-full shadow-lg"
              style={{ backgroundColor: themeColors.secondary }}
            >
              <ShoppingBag className="w-6 h-6 text-white" />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="p-3 rounded-full shadow-lg"
              style={{ backgroundColor: themeColors.accent }}
            >
              <Star className="w-6 h-6 text-white" />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Gradientes de demostración */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-white/80 to-gray-50/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-2xl p-6 shadow-xl"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Gradientes del Tema
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div
              className={`h-20 rounded-lg bg-gradient-to-r ${themeColors.gradients.primary} shadow-lg mb-2`}
            />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Gradiente Primario
            </span>
          </div>
          <div>
            <div
              className={`h-20 rounded-lg bg-gradient-to-r ${themeColors.gradients.secondary} shadow-lg mb-2`}
            />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Gradiente Secundario
            </span>
          </div>
          <div>
            <div
              className={`h-20 rounded-lg bg-gradient-to-r ${themeColors.gradients.accent} shadow-lg mb-2`}
            />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Gradiente de Acento
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
