"use client";

import { motion } from "framer-motion";
import { TrendingUp, Plus, Trash2, Info } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { TieredVolumeConfig, TieredDiscountTier } from "@/types/discount-templates";

interface TieredVolumeConfigProps {
  config: TieredVolumeConfig;
  onChange: (config: TieredVolumeConfig) => void;
}

export function TieredVolumeConfigComponent({
  config,
  onChange,
}: TieredVolumeConfigProps) {
  const { themeColors } = useTheme();

  const updateField = (field: keyof TieredVolumeConfig, value: unknown) => {
    onChange({ ...config, [field]: value });
  };

  const addTier = () => {
    const tiers = config.tiers || [];
    const newTier: TieredDiscountTier = {
      min_qty: tiers.length > 0 ? (tiers[tiers.length - 1].max_qty || 0) + 1 : 1,
      max_qty: null,
      discount: 0,
      discount_type: "percentage",
    };
    updateField("tiers", [...tiers, newTier]);
  };

  const removeTier = (index: number) => {
    const tiers = config.tiers || [];
    updateField(
      "tiers",
      tiers.filter((_, i) => i !== index)
    );
  };

  const updateTier = (index: number, field: keyof TieredDiscountTier, value: number | string | null) => {
    const tiers = [...(config.tiers || [])];
    tiers[index] = { ...tiers[index], [field]: value };
    updateField("tiers", tiers);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
          style={{
            background: "linear-gradient(135deg, #4ECDC4, #44A08D)",
          }}
        >
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold" style={{ color: themeColors.text.primary }}>
            Configuración: Descuento por Volumen
          </h3>
          <p className="text-sm" style={{ color: themeColors.text.secondary }}>
            Más compras = más descuento
          </p>
        </div>
      </div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl border flex items-start gap-3"
        style={{
          backgroundColor: "#4ECDC415",
          borderColor: "#4ECDC430",
        }}
      >
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#4ECDC4" }} />
        <div className="text-sm" style={{ color: themeColors.text.secondary }}>
          <p className="font-medium mb-1" style={{ color: themeColors.text.primary }}>
            ¿Cómo funciona?
          </p>
          <p>
            Define rangos de cantidad y el descuento correspondiente. Ejemplo:
          </p>
          <ul className="list-disc list-inside mt-1 space-y-0.5">
            <li>5-9 unidades: 10% descuento</li>
            <li>10-19 unidades: 20% descuento</li>
            <li>20+ unidades: 30% descuento</li>
          </ul>
        </div>
      </motion.div>

      {/* Tiers Configuration */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-medium" style={{ color: themeColors.text.primary }}>
            Niveles de Descuento *
          </label>
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={addTier}
            className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg text-white"
            style={{
              background: "linear-gradient(135deg, #4ECDC4, #44A08D)",
            }}
          >
            <Plus className="w-4 h-4" />
            Agregar Nivel
          </motion.button>
        </div>

        {config.tiers && config.tiers.length > 0 ? (
          <div className="space-y-3">
            {config.tiers.map((tier, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: themeColors.surface + "50",
                  borderColor: "#4ECDC430",
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-white mt-1"
                    style={{
                      background: "linear-gradient(135deg, #4ECDC4, #44A08D)",
                    }}
                  >
                    {index + 1}
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: themeColors.text.secondary }}>
                        Cantidad Mínima
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={tier.min_qty}
                        onChange={(e) => updateTier(index, "min_qty", Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border text-sm transition-all duration-200 focus:outline-none focus:ring-2"
                        style={{
                          backgroundColor: themeColors.surface + "50",
                          borderColor: themeColors.primary + "30",
                          color: themeColors.text.primary,
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: themeColors.text.secondary }}>
                        Cantidad Máxima
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={tier.max_qty || ""}
                        onChange={(e) =>
                          updateTier(index, "max_qty", e.target.value ? Number(e.target.value) : null)
                        }
                        placeholder="Sin límite"
                        className="w-full px-3 py-2 rounded-lg border text-sm transition-all duration-200 focus:outline-none focus:ring-2"
                        style={{
                          backgroundColor: themeColors.surface + "50",
                          borderColor: themeColors.primary + "30",
                          color: themeColors.text.primary,
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: themeColors.text.secondary }}>
                        Valor Descuento
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={tier.discount}
                        onChange={(e) => updateTier(index, "discount", Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border text-sm transition-all duration-200 focus:outline-none focus:ring-2"
                        style={{
                          backgroundColor: themeColors.surface + "50",
                          borderColor: themeColors.primary + "30",
                          color: themeColors.text.primary,
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: themeColors.text.secondary }}>
                        Tipo
                      </label>
                      <select
                        value={tier.discount_type}
                        onChange={(e) => updateTier(index, "discount_type", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border text-sm transition-all duration-200 focus:outline-none focus:ring-2"
                        style={{
                          backgroundColor: themeColors.surface + "50",
                          borderColor: themeColors.primary + "30",
                          color: themeColors.text.primary,
                        }}
                      >
                        <option value="percentage">%</option>
                        <option value="fixed">$</option>
                      </select>
                    </div>
                  </div>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeTier(index)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mt-5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Tier Preview */}
                <div className="mt-3 p-2 rounded-lg" style={{ backgroundColor: "#4ECDC415" }}>
                  <p className="text-sm font-medium" style={{ color: themeColors.text.primary }}>
                    {tier.min_qty} {tier.max_qty ? `- ${tier.max_qty}` : "+"} unidades ={" "}
                    <span style={{ color: "#4ECDC4" }}>
                      {tier.discount}
                      {tier.discount_type === "percentage" ? "%" : "$"} descuento
                    </span>
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 rounded-xl border-2 border-dashed" style={{ borderColor: "#4ECDC430" }}>
            <TrendingUp className="w-12 h-12 mx-auto mb-4" style={{ color: themeColors.text.secondary }} />
            <p style={{ color: themeColors.text.secondary }}>
              No hay niveles configurados. Haz clic en &quot;Agregar Nivel&quot; para comenzar.
            </p>
          </div>
        )}
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

      {/* Summary */}
      {config.tiers && config.tiers.length > 0 && (
        <div
          className="p-4 rounded-xl border"
          style={{
            backgroundColor: "#10B98115",
            borderColor: "#10B98130",
          }}
        >
          <p className="text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>
            Resumen de Niveles:
          </p>
          <div className="space-y-1">
            {config.tiers.map((tier, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span style={{ color: themeColors.text.secondary }}>
                  {tier.min_qty} {tier.max_qty ? `- ${tier.max_qty}` : "+"} unidades
                </span>
                <span className="font-bold" style={{ color: "#10B981" }}>
                  {tier.discount}
                  {tier.discount_type === "percentage" ? "%" : "$"} OFF
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
