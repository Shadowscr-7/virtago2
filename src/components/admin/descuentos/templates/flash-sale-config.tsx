"use client";

import { motion } from "framer-motion";
import { Zap, Info, Plus, Trash2 } from "lucide-react";
import { FlashSaleConfig } from "@/types/discount-templates";

interface FlashSaleConfigProps {
  config: FlashSaleConfig;
  onChange: (config: FlashSaleConfig) => void;
}

export function FlashSaleConfigComponent({ config, onChange }: FlashSaleConfigProps) {
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

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-all";
  const selectClass = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-all";
  const inputFlexClass = "flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-all";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-50">
          <Zap className="w-6 h-6 text-red-700" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Configuración: Venta Flash</h3>
          <p className="text-sm text-gray-500">Descuento por tiempo limitado</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl border border-red-100 bg-red-50 flex items-start gap-3">
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-700" />
        <div className="text-sm text-gray-600">
          <p className="font-medium mb-1 text-gray-900">Crea urgencia!</p>
          <p>Venta flash con tiempo limitado. Ideal para liquidar stock rápidamente o eventos especiales.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Duración (horas) *</label>
          <input type="number" min="1" value={config.duration_hours} onChange={(e) => updateField("duration_hours", Number(e.target.value))} placeholder="Ej: 24" className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Nivel de Urgencia *</label>
          <select value={config.urgency_level} onChange={(e) => updateField("urgency_level", e.target.value)} className={selectClass}>
            <option value="low">Bajo</option>
            <option value="medium">Medio</option>
            <option value="high">Alto</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Límite de Usos *</label>
          <input type="number" min="1" value={config.usage_limit} onChange={(e) => updateField("usage_limit", Number(e.target.value))} placeholder="Ej: 100" className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Tipo de Descuento *</label>
          <select value={config.discount_type} onChange={(e) => updateField("discount_type", e.target.value)} className={selectClass}>
            <option value="percentage">Porcentaje (%)</option>
            <option value="fixed">Monto Fijo ($)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Valor del Descuento *</label>
          <input type="number" min="0" value={config.discount_value} onChange={(e) => updateField("discount_value", Number(e.target.value))} placeholder={config.discount_type === "percentage" ? "Ej: 40" : "Ej: 1000"} className={inputClass} />
        </div>

        <div>
          <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${config.applicable_to_all ? "bg-red-50 border-red-300" : "bg-white border-gray-200"}`}>
            <input type="checkbox" checked={config.applicable_to_all || false} onChange={(e) => updateField("applicable_to_all", e.target.checked)} className="w-5 h-5 rounded accent-red-700" />
            <span className="font-medium text-sm text-gray-900">Aplicar a todos los productos</span>
          </label>
        </div>
      </div>

      {!config.applicable_to_all && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">Categorías Aplicables</label>
            <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => manageCategories("add")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors">
              <Plus className="w-4 h-4" />Agregar
            </motion.button>
          </div>
          {config.applicable_categories && config.applicable_categories.length > 0 ? (
            <div className="space-y-2">
              {config.applicable_categories.map((category, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input type="text" value={category} onChange={(e) => manageCategories("update", index, e.target.value)} placeholder="ID de categoría" className={inputFlexClass} />
                  <motion.button type="button" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => manageCategories("remove", index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-center py-4 text-gray-400">Sin categorías específicas.</p>
          )}
        </div>
      )}
    </div>
  );
}
