"use client";

import { motion } from "framer-motion";
import { Gift, Plus, Trash2, Info } from "lucide-react";
import { BuyXGetYConfig } from "@/types/discount-templates";

interface BuyXGetYConfigProps {
  config: BuyXGetYConfig;
  onChange: (config: BuyXGetYConfig) => void;
}

export function BuyXGetYConfigComponent({ config, onChange }: BuyXGetYConfigProps) {
  const updateField = (field: keyof BuyXGetYConfig, value: number | string[] | number | undefined) => {
    onChange({ ...config, [field]: value });
  };

  const addCategory = () => {
    const categories = config.applicable_categories || [];
    updateField("applicable_categories", [...categories, ""]);
  };

  const removeCategory = (index: number) => {
    const categories = config.applicable_categories || [];
    updateField("applicable_categories", categories.filter((_, i) => i !== index));
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
    updateField("applicable_products", products.filter((_, i) => i !== index));
  };

  const updateProduct = (index: number, value: string) => {
    const products = [...(config.applicable_products || [])];
    products[index] = value;
    updateField("applicable_products", products);
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-all";
  const inputFlexClass = "flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-all";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-50">
          <Gift className="w-6 h-6 text-red-700" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Configuración: Compra X Lleva Y</h3>
          <p className="text-sm text-gray-500">Configura promociones tipo 3x2, 2x1, etc.</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl border border-red-100 bg-red-50 flex items-start gap-3">
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-700" />
        <div className="text-sm text-gray-600">
          <p className="font-medium mb-1 text-gray-900">¿Cómo funciona?</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Cantidad a Comprar *</label>
          <input type="number" min="1" value={config.buy_quantity || ""} onChange={(e) => updateField("buy_quantity", Number(e.target.value))} placeholder="Ej: 3" className={inputClass} />
          <p className="text-xs mt-1 text-gray-500">Cliente debe comprar esta cantidad</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Cantidad a Pagar *</label>
          <input type="number" min="1" value={config.pay_quantity || ""} onChange={(e) => updateField("pay_quantity", Number(e.target.value))} placeholder="Ej: 2" className={inputClass} />
          <p className="text-xs mt-1 text-gray-500">Cliente paga solo esta cantidad</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Cantidad Gratis *</label>
          <input type="number" min="1" value={config.free_quantity || ""} onChange={(e) => updateField("free_quantity", Number(e.target.value))} placeholder="Ej: 1" className={inputClass} />
          <p className="text-xs mt-1 text-gray-500">Productos que recibe gratis</p>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
        <p className="text-sm font-medium mb-1 text-gray-900">Vista Previa:</p>
        <p className="text-2xl font-bold text-red-700">
          {config.buy_quantity && config.pay_quantity
            ? `${config.buy_quantity}x${config.pay_quantity}`
            : "Completa los campos"}
        </p>
        <p className="text-sm mt-1 text-gray-500">
          {config.buy_quantity && config.pay_quantity && config.free_quantity
            ? `Compra ${config.buy_quantity}, Paga ${config.pay_quantity}, Lleva ${config.free_quantity} Gratis`
            : "Configura las cantidades para ver el resultado"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Cantidad Mínima de Ítems (Opcional)</label>
          <input type="number" min="1" value={config.min_items || ""} onChange={(e) => updateField("min_items", e.target.value ? Number(e.target.value) : undefined)} placeholder="Dejar vacío si no aplica" className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Cantidad Mínima por Producto (Opcional)</label>
          <input type="number" min="1" value={config.min_quantity_per_product || ""} onChange={(e) => updateField("min_quantity_per_product", e.target.value ? Number(e.target.value) : undefined)} placeholder="Dejar vacío si no aplica" className={inputClass} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">Categorías Aplicables (Opcional)</label>
          <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={addCategory} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors">
            <Plus className="w-4 h-4" />Agregar
          </motion.button>
        </div>

        {config.applicable_categories && config.applicable_categories.length > 0 ? (
          <div className="space-y-2">
            {config.applicable_categories.map((category, index) => (
              <div key={index} className="flex items-center gap-2">
                <input type="text" value={category} onChange={(e) => updateCategory(index, e.target.value)} placeholder="ID o nombre de la categoría" className={inputFlexClass} />
                <motion.button type="button" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => removeCategory(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-center py-4 text-gray-400">Sin categorías. El descuento aplicará a todos los productos.</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">Productos Específicos (Opcional)</label>
          <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={addProduct} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors">
            <Plus className="w-4 h-4" />Agregar
          </motion.button>
        </div>

        {config.applicable_products && config.applicable_products.length > 0 ? (
          <div className="space-y-2">
            {config.applicable_products.map((product, index) => (
              <div key={index} className="flex items-center gap-2">
                <input type="text" value={product} onChange={(e) => updateProduct(index, e.target.value)} placeholder="ID del producto" className={inputFlexClass} />
                <motion.button type="button" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => removeProduct(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-center py-4 text-gray-400">Sin productos específicos. Aplicará a las categorías o todos los productos.</p>
        )}
      </div>
    </div>
  );
}
