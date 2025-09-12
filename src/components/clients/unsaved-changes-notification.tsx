"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface UnsavedChangesNotificationProps {
  hasChanges: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

export function UnsavedChangesNotification({
  hasChanges,
  onSave,
  onDiscard,
}: UnsavedChangesNotificationProps) {
  if (!hasChanges) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      className="fixed bottom-6 right-6 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 backdrop-blur-sm border border-orange-400/30"
    >
      <div className="p-2 bg-white/20 rounded-lg">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <div>
        <span className="font-medium block">Cambios no guardados</span>
        <span className="text-sm opacity-90">
          Tienes modificaciones pendientes
        </span>
      </div>
      <div className="flex gap-2 ml-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSave}
          className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
        >
          Guardar
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onDiscard}
          className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-white/20"
        >
          Descartar
        </motion.button>
      </div>
    </motion.div>
  );
}
