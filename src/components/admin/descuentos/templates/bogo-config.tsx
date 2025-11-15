"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Plus, Trash2, Info } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { BOGOConfig } from "@/types/discount-templates";

interface BOGOConfigProps {
  config: BOGOConfig;
  onChange: (config: BOGOConfig) => void;
}

export function BOGOConfigComponent({ config, onChange }: BOGOConfigProps) {
  const { themeColors } = useTheme();

  const updateField = (field: keyof BOGOConfig, value: unknown) => {
    onChange({ ...config, [field]: value });
  };

  const manageList = (field: "applicable_categories" | "applicable_products" | "applicable_brands", action: "add" | "remove" | "update", index?: number, value?: string) => {
    const list = config[field] || [];
    if (action === "add") {
      updateField(field, [...list, ""]);
    } else if (action === "remove" && index !== undefined) {
      updateField(field, list.filter((_, i) => i !== index));
    } else if (action === "update" && index !== undefined && value !== undefined) {
      const newList = [...list];
      newList[index] = value;
      updateField(field, newList);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #F38181, #F08080)" }}>
          <ShoppingBag className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold" style={{ color: themeColors.text.primary }}>Configuración: BOGO</h3>
          <p className="text-sm" style={{ color: themeColors.text.secondary }}>Buy One Get One</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl border flex items-start gap-3" style={{ backgroundColor: "#F3818115", borderColor: "#F3818130" }}>
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#F38181" }} />
        <div className="text-sm" style={{ color: themeColors.text.secondary }}>
          <p className="font-medium mb-1" style={{ color: themeColors.text.primary }}>¿Cómo funciona?</p>
          <p>Compra un producto y obtén otro gratis o con descuento. Ejemplo: Compra 1, Lleva 1 Gratis (100% desc. en el segundo).</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>Tipo de BOGO *</label>
          <select value={config.bogo_type} onChange={(e) => updateField("bogo_type", e.target.value)} className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2" style={{ backgroundColor: themeColors.surface + "50", borderColor: "#F3818130", color: themeColors.text.primary }}>
            <option value="free">Gratis (100% desc.)</option>
            <option value="percentage">Porcentaje</option>
            <option value="fixed">Monto Fijo</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>Descuento a Obtener *</label>
          <input type="number" min="0" value={config.get_discount} onChange={(e) => updateField("get_discount", Number(e.target.value))} placeholder="Ej: 100 para gratis, 50 para 50%" className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2" style={{ backgroundColor: themeColors.surface + "50", borderColor: themeColors.primary + "30", color: themeColors.text.primary }} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>Cantidad a Comprar *</label>
          <input type="number" min="1" value={config.buy_quantity} onChange={(e) => updateField("buy_quantity", Number(e.target.value))} placeholder="Ej: 1" className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2" style={{ backgroundColor: themeColors.surface + "50", borderColor: themeColors.primary + "30", color: themeColors.text.primary }} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>Cantidad a Obtener *</label>
          <input type="number" min="1" value={config.get_quantity} onChange={(e) => updateField("get_quantity", Number(e.target.value))} placeholder="Ej: 1" className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2" style={{ backgroundColor: themeColors.surface + "50", borderColor: themeColors.primary + "30", color: themeColors.text.primary }} />
        </div>
      </div>

      <div className="p-4 rounded-xl border-2 border-dashed" style={{ backgroundColor: "#10B98115", borderColor: "#10B98130" }}>
        <p className="text-sm font-medium mb-1" style={{ color: themeColors.text.primary }}>Vista Previa:</p>
        <p className="text-2xl font-bold" style={{ color: "#10B981" }}>
          Compra {config.buy_quantity || "?"}, Lleva {config.get_quantity || "?"} {config.bogo_type === "free" ? "Gratis" : `al ${config.get_discount}%`}
        </p>
      </div>

      {(["applicable_categories", "applicable_products", "applicable_brands"] as const).map((field) => (
        <div key={field}>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium" style={{ color: themeColors.text.primary }}>
              {field === "applicable_categories" ? "Categorías" : field === "applicable_products" ? "Productos" : "Marcas"} (Opcional)
            </label>
            <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => manageList(field, "add")} className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1" style={{ backgroundColor: themeColors.primary + "20", color: themeColors.primary }}>
              <Plus className="w-4 h-4" />Agregar
            </motion.button>
          </div>
          {config[field] && (config[field] as string[]).length > 0 ? (
            <div className="space-y-2">
              {(config[field] as string[]).map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input type="text" value={item} onChange={(e) => manageList(field, "update", index, e.target.value)} placeholder={`ID ${field === "applicable_categories" ? "categoría" : field === "applicable_products" ? "producto" : "marca"}`} className="flex-1 px-4 py-2.5 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2" style={{ backgroundColor: themeColors.surface + "50", borderColor: themeColors.primary + "30", color: themeColors.text.primary }} />
                  <motion.button type="button" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => manageList(field, "remove", index)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-center py-4" style={{ color: themeColors.text.secondary }}>Sin {field === "applicable_categories" ? "categorías" : field === "applicable_products" ? "productos" : "marcas"}.</p>
          )}
        </div>
      ))}
    </div>
  );
}
