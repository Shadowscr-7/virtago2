"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Save, X, Edit3, User } from "lucide-react";
import Link from "next/link";

interface ClientHeaderProps {
  clientName: string;
  isEditing: boolean;
  hasChanges: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export function ClientHeader({
  clientName,
  isEditing,
  hasChanges,
  onEdit,
  onSave,
  onCancel,
}: ClientHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
    >
      <div className="flex items-center gap-4">
        <Link
          href="/admin/clientes"
          className="p-2 hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/30 group"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
        </Link>
        <div>
                    <h1 className="text-4xl font-bold flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
              <User className="w-8 h-8 text-purple-600" />
            </div>
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {clientName}
            </span>
          </h1>
          <div className="text-lg text-gray-600 dark:text-gray-300 mt-2 flex items-center gap-2">
            {isEditing ? (
              <>
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse inline-block"></span>
                <span>Editando información del cliente</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                <span>Información del cliente</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {!isEditing ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onEdit}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Edit3 className="w-4 h-4" />
            Editar Cliente
          </motion.button>
        ) : (
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCancel}
              className="flex items-center gap-2 px-6 py-3 bg-white/80 dark:bg-slate-700/80 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 border border-gray-300 dark:border-slate-600 backdrop-blur-sm"
            >
              <X className="w-4 h-4" />
              Cancelar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSave}
              disabled={!hasChanges}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Save className="w-4 h-4" />
              {hasChanges ? "Guardar Cambios" : "Guardar"}
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
