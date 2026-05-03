"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Save, X, Edit3, User } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/contexts/theme-context";

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
  const { themeColors } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
    >
      <div className="flex items-center gap-4">
        <Link
          href="/admin/clientes"
          className="p-2 rounded-xl transition-all duration-200 border"
          style={{
            backgroundColor: "white",
            borderColor: themeColors.border,
            color: themeColors.text.secondary,
          }}
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm"
              style={{
                background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
              }}
            >
              <User className="w-6 h-6 text-white" />
            </div>
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
              }}
            >
              {clientName}
            </span>
          </h1>
          <div
            className="text-sm mt-1 flex items-center gap-2"
            style={{ color: themeColors.text.secondary }}
          >
            {isEditing ? (
              <>
                <span
                  className="w-2 h-2 rounded-full animate-pulse inline-block"
                  style={{ backgroundColor: "#f59e0b" }}
                />
                <span>Editando información del cliente</span>
              </>
            ) : (
              <>
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: "#10b981" }}
                />
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
            className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl transition-all duration-200 shadow-sm"
            style={{
              background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
            }}
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
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-200 border"
              style={{
                backgroundColor: "white",
                color: themeColors.text.secondary,
                borderColor: themeColors.border,
              }}
            >
              <X className="w-4 h-4" />
              Cancelar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSave}
              disabled={!hasChanges}
              className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={
                hasChanges
                  ? {
                      background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                    }
                  : { backgroundColor: "#d1d5db" }
              }
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
