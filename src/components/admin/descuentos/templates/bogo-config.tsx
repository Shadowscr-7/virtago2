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

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-all";
  const selectClass = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-all";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-50">
          <ShoppingBag className="w-6 h-6 text-red-700" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Configuración: BOGO</h3>
          <p className="text-sm text-gray-500">Buy One Get One</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl border border-red-100 bg-red-50 flex items-start gap-3">
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-700" />
        <div className="text-sm text-gray-600">
          <p className="font-medium mb-1 text-gray-900">¿Cómo funciona?</p>
          <p>Compra un producto y obtén otro gratis o con descuento. Ejemplo: Compra 1, Lleva 1 Gratis (100% desc. en el segundo).</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Tipo de BOGO *</label>
          <select value={config.bogo_type} onChange={(e) => updateField("bogo_type", e.target.value)} className={selectClass}>
            <option value="free">Gratis (100% desc.)</option>
            <option value="percentage">Porcentaje</option>
            <option value="fixed">Monto Fijo</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Descuento a Obtener *</label>
          <input type="number" min="0" value={config.get_discount} onChange={(e) => updateField("get_discount", Number(e.target.value))} placeholder="Ej: 100 para gratis, 50 para 50%" className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Cantidad a Comprar *</label>
          <input type="number" min="1" value={config.buy_quantity} onChange={(e) => updateField("buy_quantity", Number(e.target.value))} placeholder="Ej: 1" className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Cantidad a Obtener *</label>
          <input type="number" min="1" value={config.get_quantity} onChange={(e) => updateField("get_quantity", Number(e.target.value))} placeholder="Ej: 1" className={inputClass} />
        </div>
      </div>

      <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
        <p className="text-sm font-medium mb-1 text-gray-900">Vista Previa:</p>
        <p className="text-2xl font-bold text-red-700">
          Compra {config.buy_quantity || "?"}, Lleva {config.get_quantity || "?"} {config.bogo_type === "free" ? "Gratis" : `al ${config.get_discount}%`}
        </p>
      </div>

      {(["applicable_categories", "applicable_products", "applicable_brands"] as const).map((field) => (
        <div key={field}>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">
              {field === "applicable_categories" ? "Categorías" : field === "applicable_products" ? "Productos" : "Marcas"} (Opcional)
            </label>
            <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => manageList(field, "add")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors">
              <Plus className="w-4 h-4" />Agregar
            </motion.button>
          </div>
          {config[field] && (config[field] as string[]).length > 0 ? (
            <div className="space-y-2">
              {(config[field] as string[]).map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input type="text" value={item} onChange={(e) => manageList(field, "update", index, e.target.value)} placeholder={`ID ${field === "applicable_categories" ? "categoría" : field === "applicable_products" ? "producto" : "marca"}`} className={inputClass} />
                  <motion.button type="button" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => manageList(field, "remove", index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-center py-4 text-gray-400">Sin {field === "applicable_categories" ? "categorías" : field === "applicable_products" ? "productos" : "marcas"}.</p>
          )}
        </div>
      ))}
    </div>
  );
}
