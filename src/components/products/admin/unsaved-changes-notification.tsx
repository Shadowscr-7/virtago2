"use client";

import { motion } from "framer-motion";
import { Save, RotateCcw, AlertTriangle } from "lucide-react";

interface UnsavedChangesNotificationProps {
  onSave: () => void;
  onDiscard: () => void;
}

export function UnsavedChangesNotification({
  onSave,
  onDiscard,
}: UnsavedChangesNotificationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
    >
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl p-6 min-w-[400px]">
        <div className="flex items-center gap-4">
          {/* Icono de advertencia */}
          <div className="flex-shrink-0 p-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>

          {/* Contenido */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Cambios sin guardar
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Tienes modificaciones pendientes en este producto
            </p>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDiscard}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-500/20 to-slate-500/20 hover:from-gray-500/30 hover:to-slate-500/30 text-gray-700 dark:text-gray-300 rounded-xl transition-all backdrop-blur-sm border border-gray-500/20"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="font-medium">Descartar</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSave}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 text-green-700 dark:text-green-300 rounded-xl transition-all backdrop-blur-sm border border-green-500/20"
            >
              <Save className="w-4 h-4" />
              <span className="font-medium">Guardar cambios</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
