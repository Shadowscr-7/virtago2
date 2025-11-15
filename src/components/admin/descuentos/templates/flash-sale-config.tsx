"use client";

import { motion } from "framer-motion";
import { Zap, Info, Plus, Trash2 } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { FlashSaleConfig } from "@/types/discount-templates";

interface FlashSaleConfigProps {
  config: FlashSaleConfig;
  onChange: (config: FlashSaleConfig) => void;
}

export function FlashSaleConfigComponent({ config, onChange }: FlashSaleConfigProps) {
  const { themeColors } = useTheme();

  const updateField = (field: keyof FlashSaleConfig, value: unknown) => {
    onChange({ ...config, [field]: value });
  };

  const manageCategories = (action: "add" | "remove" | "update", index?: number, value?: string) => {
    const list = config.applicable_categories || [];
    if (action === "add") {
      updateField("applicable_categories", [...list, ""]);
    } else if (action === "remove" && index !== undefined) {
      updateField("applicable_categories", list.filter((_, i) => i !== index));
    } else if (action === "update" && index !== undefined && value !== undefined) {
      const newList = [...list];
      newList[index] = value;
      updateField("applicable_categories", newList);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #FF9A3C, #FF6B35)" }}>
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold" style={{ color: themeColors.text.primary }}>Configuración: Venta Flash</h3>
          <p className="text-sm" style={{ color: themeColors.text.secondary }}>Descuento por tiempo limitado</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl border flex items-start gap-3" style={{ backgroundColor: "#FF9A3C15", borderColor: "#FF9A3C30" }}>
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#FF9A3C" }} />
        <div className="text-sm" style={{ color: themeColors.text.secondary }}>
          <p className="font-medium mb-1" style={{ color: themeColors.text.primary }}>Crea urgencia!</p>
          <p>Venta flash con tiempo limitado. Ideal para liquidar stock rápidamente o eventos especiales.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>Duración (horas) *</label>
          <input type="number" min="1" value={config.duration_hours} onChange={(e) => updateField("duration_hours", Number(e.target.value))} placeholder="Ej: 24" className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2" style={{ backgroundColor: themeColors.surface + "50", borderColor: themeColors.primary + "30", color: themeColors.text.primary }} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>Nivel de Urgencia *</label>
          <select value={config.urgency_level} onChange={(e) => updateField("urgency_level", e.target.value)} className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2" style={{ backgroundColor: themeColors.surface + "50", borderColor: themeColors.primary + "30", color: themeColors.text.primary }}>
            <option value="low">Bajo</option>
            <option value="medium">Medio</option>
            <option value="high">Alto</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>Límite de Usos *</label>
          <input type="number" min="1" value={config.usage_limit} onChange={(e) => updateField("usage_limit", Number(e.target.value))} placeholder="Ej: 100" className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2" style={{ backgroundColor: themeColors.surface + "50", borderColor: themeColors.primary + "30", color: themeColors.text.primary }} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>Tipo de Descuento *</label>
          <select value={config.discount_type} onChange={(e) => updateField("discount_type", e.target.value)} className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2" style={{ backgroundColor: themeColors.surface + "50", borderColor: themeColors.primary + "30", color: themeColors.text.primary }}>
            <option value="percentage">Porcentaje (%)</option>
            <option value="fixed">Monto Fijo ($)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>Valor del Descuento *</label>
          <input type="number" min="0" value={config.discount_value} onChange={(e) => updateField("discount_value", Number(e.target.value))} placeholder={config.discount_type === "percentage" ? "Ej: 40" : "Ej: 1000"} className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2" style={{ backgroundColor: themeColors.surface + "50", borderColor: themeColors.primary + "30", color: themeColors.text.primary }} />
        </div>

        <div>
          <label className="flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200" style={{ backgroundColor: config.applicable_to_all ? `${themeColors.primary}10` : themeColors.surface + "50", borderColor: config.applicable_to_all ? themeColors.primary : themeColors.primary + "30" }}>
            <input type="checkbox" checked={config.applicable_to_all || false} onChange={(e) => updateField("applicable_to_all", e.target.checked)} className="w-5 h-5 rounded" style={{ accentColor: themeColors.primary }} />
            <span className="font-medium text-sm" style={{ color: themeColors.text.primary }}>Aplicar a todos los productos</span>
          </label>
        </div>
      </div>

      {!config.applicable_to_all && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium" style={{ color: themeColors.text.primary }}>Categorías Aplicables</label>
            <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => manageCategories("add")} className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1" style={{ backgroundColor: themeColors.primary + "20", color: themeColors.primary }}>
              <Plus className="w-4 h-4" />Agregar
            </motion.button>
          </div>
          {config.applicable_categories && config.applicable_categories.length > 0 ? (
            <div className="space-y-2">
              {config.applicable_categories.map((category, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input type="text" value={category} onChange={(e) => manageCategories("update", index, e.target.value)} placeholder="ID de categoría" className="flex-1 px-4 py-2.5 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2" style={{ backgroundColor: themeColors.surface + "50", borderColor: themeColors.primary + "30", color: themeColors.text.primary }} />
                  <motion.button type="button" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => manageCategories("remove", index)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-center py-4" style={{ color: themeColors.text.secondary }}>Sin categorías específicas.</p>
          )}
        </div>
      )}
    </div>
  );
}
