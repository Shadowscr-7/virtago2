"use client";

import { motion } from "framer-motion";
import { Code, Copy, Check, Eye, EyeOff } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { useState } from "react";
import { DiscountJSON } from "@/types/discount-templates";

interface DiscountJSONPreviewProps {
  discountData: DiscountJSON;
  onCopy?: () => void;
}

export function DiscountJSONPreview({ discountData, onCopy }: DiscountJSONPreviewProps) {
  const { themeColors } = useTheme();
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const jsonString = JSON.stringify(discountData, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5" style={{ color: themeColors.primary }} />
          <h4 className="text-lg font-bold" style={{ color: themeColors.text.primary }}>
            JSON Preview
          </h4>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCollapsed(!collapsed)}
            className="px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            style={{
              backgroundColor: themeColors.surface + "60",
              color: themeColors.text.primary,
            }}
          >
            {collapsed ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {collapsed ? "Mostrar" : "Ocultar"}
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopy}
            className="px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            style={{
              backgroundColor: copied ? "#10B98120" : themeColors.primary + "20",
              color: copied ? "#10B981" : themeColors.primary,
            }}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar JSON
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* JSON Display */}
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="relative"
        >
          <div
            className="p-4 rounded-xl border font-mono text-xs overflow-x-auto max-h-[600px] overflow-y-auto"
            style={{
              backgroundColor: themeColors.surface + "80",
              borderColor: themeColors.primary + "30",
            }}
          >
            <pre className="whitespace-pre-wrap break-words">
              <code style={{ color: themeColors.text.primary }}>
                {jsonString}
              </code>
            </pre>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: themeColors.text.secondary }}>
            <span>Líneas: {jsonString.split('\n').length}</span>
            <span>Caracteres: {jsonString.length}</span>
            <span>Tamaño: {(new Blob([jsonString]).size / 1024).toFixed(2)} KB</span>
          </div>
        </motion.div>
      )}

      {/* Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-3 rounded-xl border text-xs"
        style={{
          backgroundColor: `${themeColors.accent}10`,
          borderColor: `${themeColors.accent}30`,
          color: themeColors.text.secondary,
        }}
      >
        <p>
          Este JSON será enviado a la API cuando guardes el descuento. Verifica que todos los campos
          estén correctos antes de continuar.
        </p>
      </motion.div>
    </div>
  );
}
