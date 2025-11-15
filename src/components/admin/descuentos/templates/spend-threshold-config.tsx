"use client";

import { motion } from "framer-motion";
import { DollarSign, Plus, Trash2, Info } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { SpendThresholdConfig, SpendThresholdTier } from "@/types/discount-templates";

interface SpendThresholdConfigProps {
  config: SpendThresholdConfig;
  onChange: (config: SpendThresholdConfig) => void;
}

export function SpendThresholdConfigComponent({ config, onChange }: SpendThresholdConfigProps) {
  const { themeColors } = useTheme();

  const updateField = (field: keyof SpendThresholdConfig, value: unknown) => {
    onChange({ ...config, [field]: value });
  };

  const addTier = () => {
    const tiers = config.tiers || [];
    const newTier: SpendThresholdTier = { min_spend: 0, discount: 0, discount_type: "fixed" };
    updateField("tiers", [...tiers, newTier]);
  };

  const removeTier = (index: number) => {
    const tiers = config.tiers || [];
    updateField("tiers", tiers.filter((_, i) => i !== index));
  };

  const updateTier = (index: number, field: keyof SpendThresholdTier, value: number | string) => {
    const tiers = [...(config.tiers || [])];
    tiers[index] = { ...tiers[index], [field]: value };
    updateField("tiers", tiers);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #AA96DA, #9B86DA)" }}>
          <DollarSign className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold" style={{ color: themeColors.text.primary }}>Configuración: Gasta y Ahorra</h3>
          <p className="text-sm" style={{ color: themeColors.text.secondary }}>Descuento por monto mínimo de compra</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl border flex items-start gap-3" style={{ backgroundColor: "#AA96DA15", borderColor: "#AA96DA30" }}>
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#AA96DA" }} />
        <div className="text-sm" style={{ color: themeColors.text.secondary }}>
          <p className="font-medium mb-1" style={{ color: themeColors.text.primary }}>¿Cómo funciona?</p>
          <p>Define un monto mínimo de compra para obtener descuento. Puede ser simple o progresivo con varios niveles.</p>
        </div>
      </motion.div>

      <div>
        <label className="flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200" style={{ backgroundColor: config.progressive ? `${themeColors.primary}10` : themeColors.surface + "50", borderColor: config.progressive ? themeColors.primary : themeColors.primary + "30" }}>
          <input type="checkbox" checked={config.progressive} onChange={(e) => updateField("progressive", e.target.checked)} className="w-5 h-5 rounded" style={{ accentColor: themeColors.primary }} />
          <div>
            <span className="font-medium" style={{ color: themeColors.text.primary }}>Descuento Progresivo</span>
            <p className="text-sm" style={{ color: themeColors.text.secondary }}>
              {config.progressive ? "Varios niveles de descuento según el monto gastado" : "Un solo nivel de descuento"}
            </p>
          </div>
        </label>
      </div>

      {config.progressive ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium" style={{ color: themeColors.text.primary }}>Niveles de Gasto *</label>
            <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={addTier} className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg text-white" style={{ background: "linear-gradient(135deg, #AA96DA, #9B86DA)" }}>
              <Plus className="w-4 h-4" />Agregar Nivel
            </motion.button>
          </div>

          {config.tiers && config.tiers.length > 0 ? (
            <div className="space-y-3">
              {config.tiers.map((tier, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl border" style={{ backgroundColor: themeColors.surface + "50", borderColor: "#AA96DA30" }}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-white mt-1" style={{ background: "linear-gradient(135deg, #AA96DA, #9B86DA)" }}>
                      {index + 1}
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: themeColors.text.secondary }}>Monto Mínimo ($)</label>
                        <input type="number" min="0" value={tier.min_spend} onChange={(e) => updateTier(index, "min_spend", Number(e.target.value))} placeholder="Ej: 100" className="w-full px-3 py-2 rounded-lg border text-sm transition-all duration-200 focus:outline-none focus:ring-2" style={{ backgroundColor: themeColors.surface + "50", borderColor: themeColors.primary + "30", color: themeColors.text.primary }} />
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: themeColors.text.secondary }}>Descuento</label>
                        <input type="number" min="0" value={tier.discount} onChange={(e) => updateTier(index, "discount", Number(e.target.value))} placeholder="Ej: 20" className="w-full px-3 py-2 rounded-lg border text-sm transition-all duration-200 focus:outline-none focus:ring-2" style={{ backgroundColor: themeColors.surface + "50", borderColor: themeColors.primary + "30", color: themeColors.text.primary }} />
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: themeColors.text.secondary }}>Tipo</label>
                        <select value={tier.discount_type} onChange={(e) => updateTier(index, "discount_type", e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm transition-all duration-200 focus:outline-none focus:ring-2" style={{ backgroundColor: themeColors.surface + "50", borderColor: themeColors.primary + "30", color: themeColors.text.primary }}>
                          <option value="percentage">%</option>
                          <option value="fixed">$</option>
                        </select>
                      </div>
                    </div>

                    <motion.button type="button" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => removeTier(index)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mt-5">
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>

                  <div className="mt-3 p-2 rounded-lg" style={{ backgroundColor: "#AA96DA15" }}>
                    <p className="text-sm font-medium" style={{ color: themeColors.text.primary }}>
                      Gasta ${tier.min_spend}+ = <span style={{ color: "#AA96DA" }}>{tier.discount}{tier.discount_type === "percentage" ? "%" : "$"} descuento</span>
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 rounded-xl border-2 border-dashed" style={{ borderColor: "#AA96DA30" }}>
              <DollarSign className="w-12 h-12 mx-auto mb-4" style={{ color: themeColors.text.secondary }} />
              <p style={{ color: themeColors.text.secondary }}>No hay niveles configurados. Agrégalos para comenzar.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>Monto Mínimo ($) *</label>
            <input type="number" min="0" value={config.threshold || ""} onChange={(e) => updateField("threshold", e.target.value ? Number(e.target.value) : undefined)} placeholder="Ej: 100" className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2" style={{ backgroundColor: themeColors.surface + "50", borderColor: themeColors.primary + "30", color: themeColors.text.primary }} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>Recompensa *</label>
            <input type="number" min="0" value={config.reward || ""} onChange={(e) => updateField("reward", e.target.value ? Number(e.target.value) : undefined)} placeholder="Ej: 20" className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2" style={{ backgroundColor: themeColors.surface + "50", borderColor: themeColors.primary + "30", color: themeColors.text.primary }} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>Tipo *</label>
            <select value={config.discount_type || "fixed"} onChange={(e) => updateField("discount_type", e.target.value)} className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2" style={{ backgroundColor: themeColors.surface + "50", borderColor: themeColors.primary + "30", color: themeColors.text.primary }}>
              <option value="percentage">Porcentaje (%)</option>
              <option value="fixed">Monto Fijo ($)</option>
            </select>
          </div>
        </div>
      )}

      {!config.progressive && config.threshold && config.reward && (
        <div className="p-4 rounded-xl border-2 border-dashed" style={{ backgroundColor: "#10B98115", borderColor: "#10B98130" }}>
          <p className="text-sm font-medium mb-1" style={{ color: themeColors.text.primary }}>Vista Previa:</p>
          <p className="text-2xl font-bold" style={{ color: "#10B981" }}>
            Gasta ${config.threshold} → Obtén {config.reward}{config.discount_type === "percentage" ? "%" : "$"} OFF
          </p>
        </div>
      )}
    </div>
  );
}
