"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { api } from "@/api";
import { showToast } from "@/store/toast-helpers";

interface StockEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  currentStock: number;
  onSuccess: (newStock: number) => void;
}

export function StockEditModal({
  isOpen,
  onClose,
  productId,
  productName,
  currentStock,
  onSuccess,
}: StockEditModalProps) {
  const { themeColors } = useTheme();
  const [stock, setStock] = useState<string>(String(currentStock));
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const stockNum = Number(stock);
    if (isNaN(stockNum) || stockNum < 0) {
      showToast({ title: "El stock debe ser un numero mayor o igual a 0", type: "error" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.stock.updateStock(productId, stockNum, reason || undefined);
      if (response.success) {
        showToast({ title: "Stock actualizado correctamente", type: "success" });
        onSuccess(stockNum);
        onClose();
      } else {
        showToast({ title: "Error al actualizar stock", description: response.message, type: "error" });
      }
    } catch (err) {
      showToast({
        title: "Error al actualizar stock",
        description: err instanceof Error ? err.message : "Error inesperado",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md rounded-2xl border shadow-2xl p-6"
            style={{
              backgroundColor: themeColors.surface,
              borderColor: themeColors.primary + "30",
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-xl"
                  style={{ backgroundColor: themeColors.primary + "20" }}
                >
                  <Package className="w-5 h-5" style={{ color: themeColors.primary }} />
                </div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: themeColors.text.primary }}>
                    Actualizar Stock
                  </h2>
                  <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                    {productName}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                style={{ color: themeColors.text.secondary }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Stock actual */}
              <div
                className="p-3 rounded-xl text-sm"
                style={{
                  backgroundColor: themeColors.primary + "10",
                  color: themeColors.text.secondary,
                }}
              >
                Stock actual:{" "}
                <span className="font-semibold" style={{ color: themeColors.text.primary }}>
                  {currentStock} unidades
                </span>
              </div>

              {/* Nuevo stock */}
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: themeColors.text.primary }}
                >
                  Nuevo stock *
                </label>
                <input
                  type="number"
                  min={0}
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: themeColors.surface + "80",
                    borderColor: themeColors.primary + "30",
                    color: themeColors.text.primary,
                  }}
                  required
                />
              </div>

              {/* Motivo */}
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: themeColors.text.primary }}
                >
                  Motivo del ajuste (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Recepcion de mercaderia, inventario..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: themeColors.surface + "80",
                    borderColor: themeColors.primary + "30",
                    color: themeColors.text.primary,
                  }}
                />
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl border font-medium transition-all"
                  style={{
                    borderColor: themeColors.primary + "30",
                    color: themeColors.text.secondary,
                  }}
                >
                  Cancelar
                </button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                  className="flex-1 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
                  style={{
                    background: `linear-gradient(45deg, ${themeColors.primary}, ${themeColors.secondary})`,
                  }}
                >
                  {isLoading ? "Guardando..." : "Guardar Stock"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
