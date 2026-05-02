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
      <div className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-2xl p-6 min-w-[400px]">
        <div className="flex items-center gap-4">
          {/* Icono de advertencia */}
          <div className="flex-shrink-0 p-3 bg-orange-50 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
          </div>

          {/* Contenido */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              Cambios sin guardar
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Tienes modificaciones pendientes en este producto
            </p>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDiscard}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all border border-gray-200"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="font-medium">Descartar</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSave}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-xl transition-all"
              style={{ backgroundColor: "#C8102E" }}
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
