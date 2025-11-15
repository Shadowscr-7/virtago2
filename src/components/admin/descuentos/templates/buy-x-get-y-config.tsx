"use client";

import { motion } from "framer-motion";
import { Gift, Plus, Trash2, Info } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { BuyXGetYConfig } from "@/types/discount-templates";

interface BuyXGetYConfigProps {
  config: BuyXGetYConfig;
  onChange: (config: BuyXGetYConfig) => void;
}

export function BuyXGetYConfigComponent({ config, onChange }: BuyXGetYConfigProps) {
  const { themeColors } = useTheme();

  const updateField = (field: keyof BuyXGetYConfig, value: number | string[] | number | undefined) => {
    onChange({ ...config, [field]: value });
  };

  const addCategory = () => {
    const categories = config.applicable_categories || [];
    updateField("applicable_categories", [...categories, ""]);
  };

  const removeCategory = (index: number) => {
    const categories = config.applicable_categories || [];
    updateField(
      "applicable_categories",
      categories.filter((_, i) => i !== index)
    );
  };

  const updateCategory = (index: number, value: string) => {
    const categories = [...(config.applicable_categories || [])];
    categories[index] = value;
    updateField("applicable_categories", categories);
  };

  const addProduct = () => {
    const products = config.applicable_products || [];
    updateField("applicable_products", [...products, ""]);
  };

  const removeProduct = (index: number) => {
    const products = config.applicable_products || [];
    updateField(
      "applicable_products",
      products.filter((_, i) => i !== index)
    );
  };

  const updateProduct = (index: number, value: string) => {
    const products = [...(config.applicable_products || [])];
    products[index] = value;
    updateField("applicable_products", products);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
          style={{
            background: "linear-gradient(135deg, #FF6B6B, #FF5252)",
          }}
        >
          <Gift className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold" style={{ color: themeColors.text.primary }}>
            Configuración: Compra X Lleva Y
          </h3>
          <p className="text-sm" style={{ color: themeColors.text.secondary }}>
            Configura promociones tipo 3x2, 2x1, etc.
          </p>
        </div>
      </div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl border flex items-start gap-3"
        style={{
          backgroundColor: "#FF6B6B15",
          borderColor: "#FF6B6B30",
        }}
      >
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#FF6B6B" }} />
        <div className="text-sm" style={{ color: themeColors.text.secondary }}>
          <p className="font-medium mb-1" style={{ color: themeColors.text.primary }}>
            ¿Cómo funciona?
          </p>
          <p>
            Ejemplo: Para un <strong>3x2</strong>, configura: Compra <strong>3</strong>, Paga{" "}
            <strong>2</strong>, Lleva <strong>1</strong> gratis.
          </p>
          <p className="mt-1">
            Para un <strong>2x1</strong>: Compra <strong>2</strong>, Paga <strong>1</strong>, Lleva{" "}
            <strong>1</strong> gratis.
          </p>
        </div>
      </motion.div>

      {/* Main Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>
            Cantidad a Comprar *
          </label>
          <input
            type="number"
            min="1"
            value={config.buy_quantity || ""}
            onChange={(e) => updateField("buy_quantity", Number(e.target.value))}
            placeholder="Ej: 3"
            className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2"
            style={{
              backgroundColor: themeColors.surface + "50",
              borderColor: "#FF6B6B30",
              color: themeColors.text.primary,
            }}
          />
          <p className="text-xs mt-1" style={{ color: themeColors.text.secondary }}>
            Cliente debe comprar esta cantidad
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>
            Cantidad a Pagar *
          </label>
          <input
            type="number"
            min="1"
            value={config.pay_quantity || ""}
            onChange={(e) => updateField("pay_quantity", Number(e.target.value))}
            placeholder="Ej: 2"
            className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2"
            style={{
              backgroundColor: themeColors.surface + "50",
              borderColor: "#FF6B6B30",
              color: themeColors.text.primary,
            }}
          />
          <p className="text-xs mt-1" style={{ color: themeColors.text.secondary }}>
            Cliente paga solo esta cantidad
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>
            Cantidad Gratis *
          </label>
          <input
            type="number"
            min="1"
            value={config.free_quantity || ""}
            onChange={(e) => updateField("free_quantity", Number(e.target.value))}
            placeholder="Ej: 1"
            className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2"
            style={{
              backgroundColor: themeColors.surface + "50",
              borderColor: "#FF6B6B30",
              color: themeColors.text.primary,
            }}
          />
          <p className="text-xs mt-1" style={{ color: themeColors.text.secondary }}>
            Productos que recibe gratis
          </p>
        </div>
      </div>

      {/* Preview Box */}
      <div
        className="p-4 rounded-xl border-2 border-dashed"
        style={{
          backgroundColor: "#10B98115",
          borderColor: "#10B98130",
        }}
      >
        <p className="text-sm font-medium mb-1" style={{ color: themeColors.text.primary }}>
          Vista Previa:
        </p>
        <p className="text-2xl font-bold" style={{ color: "#10B981" }}>
          {config.buy_quantity && config.pay_quantity
            ? `${config.buy_quantity}x${config.pay_quantity}`
            : "Completa los campos"}
        </p>
        <p className="text-sm mt-1" style={{ color: themeColors.text.secondary }}>
          {config.buy_quantity && config.pay_quantity && config.free_quantity
            ? `Compra ${config.buy_quantity}, Paga ${config.pay_quantity}, Lleva ${config.free_quantity} Gratis`
            : "Configura las cantidades para ver el resultado"}
        </p>
      </div>

      {/* Optional Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>
            Cantidad Mínima de Ítems (Opcional)
          </label>
          <input
            type="number"
            min="1"
            value={config.min_items || ""}
            onChange={(e) =>
              updateField("min_items", e.target.value ? Number(e.target.value) : undefined)
            }
            placeholder="Dejar vacío si no aplica"
            className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2"
            style={{
              backgroundColor: themeColors.surface + "50",
              borderColor: themeColors.primary + "30",
              color: themeColors.text.primary,
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>
            Cantidad Mínima por Producto (Opcional)
          </label>
          <input
            type="number"
            min="1"
            value={config.min_quantity_per_product || ""}
            onChange={(e) =>
              updateField("min_quantity_per_product", e.target.value ? Number(e.target.value) : undefined)
            }
            placeholder="Dejar vacío si no aplica"
            className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2"
            style={{
              backgroundColor: themeColors.surface + "50",
              borderColor: themeColors.primary + "30",
              color: themeColors.text.primary,
            }}
          />
        </div>
      </div>

      {/* Applicable Categories */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium" style={{ color: themeColors.text.primary }}>
            Categorías Aplicables (Opcional)
          </label>
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={addCategory}
            className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1"
            style={{
              backgroundColor: themeColors.primary + "20",
              color: themeColors.primary,
            }}
          >
            <Plus className="w-4 h-4" />
            Agregar
          </motion.button>
        </div>

        {config.applicable_categories && config.applicable_categories.length > 0 ? (
          <div className="space-y-2">
            {config.applicable_categories.map((category, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={category}
                  onChange={(e) => updateCategory(index, e.target.value)}
                  placeholder="ID o nombre de la categoría"
                  className="flex-1 px-4 py-2.5 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: themeColors.surface + "50",
                    borderColor: themeColors.primary + "30",
                    color: themeColors.text.primary,
                  }}
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeCategory(index)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-center py-4" style={{ color: themeColors.text.secondary }}>
            Sin categorías. El descuento aplicará a todos los productos.
          </p>
        )}
      </div>

      {/* Applicable Products */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium" style={{ color: themeColors.text.primary }}>
            Productos Específicos (Opcional)
          </label>
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={addProduct}
            className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1"
            style={{
              backgroundColor: themeColors.secondary + "20",
              color: themeColors.secondary,
            }}
          >
            <Plus className="w-4 h-4" />
            Agregar
          </motion.button>
        </div>

        {config.applicable_products && config.applicable_products.length > 0 ? (
          <div className="space-y-2">
            {config.applicable_products.map((product, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={product}
                  onChange={(e) => updateProduct(index, e.target.value)}
                  placeholder="ID del producto"
                  className="flex-1 px-4 py-2.5 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: themeColors.surface + "50",
                    borderColor: themeColors.primary + "30",
                    color: themeColors.text.primary,
                  }}
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeProduct(index)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-center py-4" style={{ color: themeColors.text.secondary }}>
            Sin productos específicos. Aplicará a las categorías o todos los productos.
          </p>
        )}
      </div>
    </div>
  );
}
