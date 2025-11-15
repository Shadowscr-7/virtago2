"use client";

import { motion } from "framer-motion";
import { Package, Plus, Trash2, Info } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { BundleConfig, BundleProduct } from "@/types/discount-templates";

interface BundleConfigProps {
  config: BundleConfig;
  onChange: (config: BundleConfig) => void;
}

export function BundleConfigComponent({ config, onChange }: BundleConfigProps) {
  const { themeColors } = useTheme();

  const updateField = (field: keyof BundleConfig, value: unknown) => {
    onChange({ ...config, [field]: value });
  };

  const addProduct = () => {
    const products = config.required_products || [];
    updateField("required_products", [...products, { product_id: "", quantity: 1 }]);
  };

  const removeProduct = (index: number) => {
    const products = config.required_products || [];
    updateField("required_products", products.filter((_, i) => i !== index));
  };

  const updateProduct = (index: number, field: keyof BundleProduct, value: string | number) => {
    const products = [...(config.required_products || [])];
    products[index] = { ...products[index], [field]: value };
    updateField("required_products", products);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #95E1D3, #80CEC9)" }}>
          <Package className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold" style={{ color: themeColors.text.primary }}>Configuración: Paquete/Bundle</h3>
          <p className="text-sm" style={{ color: themeColors.text.secondary }}>Combina productos específicos</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl border flex items-start gap-3" style={{ backgroundColor: "#95E1D315", borderColor: "#95E1D330" }}>
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#95E1D3" }} />
        <div className="text-sm" style={{ color: themeColors.text.secondary }}>
          <p className="font-medium mb-1" style={{ color: themeColors.text.primary }}>¿Cómo funciona?</p>
          <p>Define productos que deben comprarse juntos para obtener el descuento. Ejemplo: Laptop + Mouse = 15% desc.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>Tipo de Descuento *</label>
          <select value={config.discount_type} onChange={(e) => updateField("discount_type", e.target.value)} className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2" style={{ backgroundColor: themeColors.surface + "50", borderColor: themeColors.primary + "30", color: themeColors.text.primary }}>
            <option value="percentage">Porcentaje (%)</option>
            <option value="fixed">Monto Fijo ($)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>Valor del Descuento *</label>
          <input type="number" min="0" value={config.discount_value} onChange={(e) => updateField("discount_value", Number(e.target.value))} placeholder={config.discount_type === "percentage" ? "Ej: 15" : "Ej: 200"} className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2" style={{ backgroundColor: themeColors.surface + "50", borderColor: themeColors.primary + "30", color: themeColors.text.primary }} />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200" style={{ backgroundColor: config.all_required ? `${themeColors.primary}10` : themeColors.surface + "50", borderColor: config.all_required ? themeColors.primary : themeColors.primary + "30" }}>
          <input type="checkbox" checked={config.all_required} onChange={(e) => updateField("all_required", e.target.checked)} className="w-5 h-5 rounded" style={{ accentColor: themeColors.primary }} />
          <div>
            <span className="font-medium" style={{ color: themeColors.text.primary }}>Todos los productos son requeridos</span>
            <p className="text-sm" style={{ color: themeColors.text.secondary }}>Si no está marcado, el cliente puede elegir algunos productos del bundle</p>
          </div>
        </label>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-medium" style={{ color: themeColors.text.primary }}>Productos del Bundle *</label>
          <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={addProduct} className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg text-white" style={{ background: "linear-gradient(135deg, #95E1D3, #80CEC9)" }}>
            <Plus className="w-4 h-4" />Agregar Producto
          </motion.button>
        </div>

        {config.required_products && config.required_products.length > 0 ? (
          <div className="space-y-3">
            {config.required_products.map((product, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl border" style={{ backgroundColor: themeColors.surface + "50", borderColor: "#95E1D330" }}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-white mt-1" style={{ background: "linear-gradient(135deg, #95E1D3, #80CEC9)" }}>
                    {index + 1}
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium mb-1" style={{ color: themeColors.text.secondary }}>ID del Producto</label>
                      <input type="text" value={product.product_id} onChange={(e) => updateProduct(index, "product_id", e.target.value)} placeholder="Ej: laptop-001" className="w-full px-3 py-2 rounded-lg border text-sm transition-all duration-200 focus:outline-none focus:ring-2" style={{ backgroundColor: themeColors.surface + "50", borderColor: themeColors.primary + "30", color: themeColors.text.primary }} />
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: themeColors.text.secondary }}>Cantidad</label>
                      <input type="number" min="1" value={product.quantity} onChange={(e) => updateProduct(index, "quantity", Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border text-sm transition-all duration-200 focus:outline-none focus:ring-2" style={{ backgroundColor: themeColors.surface + "50", borderColor: themeColors.primary + "30", color: themeColors.text.primary }} />
                    </div>
                  </div>

                  <motion.button type="button" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => removeProduct(index)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mt-5">
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 rounded-xl border-2 border-dashed" style={{ borderColor: "#95E1D330" }}>
            <Package className="w-12 h-12 mx-auto mb-4" style={{ color: themeColors.text.secondary }} />
            <p style={{ color: themeColors.text.secondary }}>No hay productos en el bundle. Agrégalos para comenzar.</p>
          </div>
        )}
      </div>
    </div>
  );
}
