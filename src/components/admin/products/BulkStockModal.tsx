"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Layers } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { api, ApiProductData } from "@/api";
import { showToast } from "@/store/toast-helpers";

interface BulkStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ApiProductData[];
  onSuccess: () => void;
}

interface StockRow {
  productId: string;
  name: string;
  sku: string;
  currentStock: number;
  newStock: string;
}

export function BulkStockModal({ isOpen, onClose, products, onSuccess }: BulkStockModalProps) {
  const { themeColors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState<StockRow[]>(() =>
    products.map((p) => ({
      productId: p.prodVirtaId,
      name: p.name,
      sku: p.sku,
      currentStock: p.stockQuantity ?? 0,
      newStock: String(p.stockQuantity ?? 0),
    }))
  );

  const handleStockChange = (productId: string, value: string) => {
    setRows((prev) =>
      prev.map((r) => (r.productId === productId ? { ...r, newStock: value } : r))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updates = rows
      .filter((r) => {
        const n = Number(r.newStock);
        return !isNaN(n) && n >= 0 && n !== r.currentStock;
      })
      .map((r) => ({ productId: r.productId, stock: Number(r.newStock) }));

    if (updates.length === 0) {
      showToast({ title: "No hay cambios para guardar", type: "error" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.stock.bulkUpdate(updates);
      if (response.success) {
        const data = response.data as { updated: unknown[]; errors: unknown[] };
        showToast({
          title: `Stock actualizado: ${data?.updated?.length ?? updates.length} productos`,
          type: "success",
        });
        onSuccess();
        onClose();
      } else {
        showToast({ title: "Error en la actualizacion masiva", description: response.message, type: "error" });
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-3xl rounded-2xl border shadow-2xl flex flex-col"
            style={{
              backgroundColor: themeColors.surface,
              borderColor: themeColors.primary + "30",
              maxHeight: "90vh",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: themeColors.primary + "20" }}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl" style={{ backgroundColor: themeColors.primary + "20" }}>
                  <Layers className="w-5 h-5" style={{ color: themeColors.primary }} />
                </div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: themeColors.text.primary }}>
                    Actualizar Stock Masivo
                  </h2>
                  <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                    Edita el stock de todos tus productos de una vez
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                style={{ color: themeColors.text.secondary }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Table */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-auto flex-1">
                <table className="w-full">
                  <thead
                    className="border-b sticky top-0"
                    style={{ backgroundColor: themeColors.surface, borderColor: themeColors.primary + "20" }}
                  >
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>
                        Producto
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>
                        SKU
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>
                        Stock actual
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>
                        Nuevo stock
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: themeColors.primary + "10" }}>
                    {rows.map((row) => (
                      <tr key={row.productId}>
                        <td className="px-4 py-3 text-sm font-medium" style={{ color: themeColors.text.primary }}>
                          {row.name}
                        </td>
                        <td className="px-4 py-3 text-xs font-mono" style={{ color: themeColors.text.secondary }}>
                          {row.sku}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-medium" style={{ color: themeColors.text.secondary }}>
                            {row.currentStock}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min={0}
                            value={row.newStock}
                            onChange={(e) => handleStockChange(row.productId, e.target.value)}
                            className="w-24 mx-auto block px-3 py-2 text-center rounded-lg border focus:outline-none focus:ring-2 text-sm transition-all"
                            style={{
                              backgroundColor: themeColors.surface + "80",
                              borderColor:
                                Number(row.newStock) !== row.currentStock
                                  ? themeColors.primary
                                  : themeColors.primary + "30",
                              color: themeColors.text.primary,
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-6 border-t" style={{ borderColor: themeColors.primary + "20" }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border font-medium transition-all"
                  style={{ borderColor: themeColors.primary + "30", color: themeColors.text.secondary }}
                >
                  Cancelar
                </button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
                  style={{ background: `linear-gradient(45deg, ${themeColors.primary}, ${themeColors.secondary})` }}
                >
                  <Save className="w-4 h-4" />
                  {isLoading ? "Guardando..." : "Guardar Cambios"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
