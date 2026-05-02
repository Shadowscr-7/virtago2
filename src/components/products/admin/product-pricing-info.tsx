"use client";

import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Percent } from "lucide-react";
import type { ProductData } from "@/app/admin/productos/[id]/page";

interface ProductPricingInfoProps {
  productData: ProductData;
  isEditing: boolean;
  onChange: (updates: Partial<ProductData>) => void;
}

const PRIMARY = "#1E3A61";

export function ProductPricingInfo({
  productData,
  isEditing,
  onChange,
}: ProductPricingInfoProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: "UYU",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateMargin = (price: number, cost: number) => {
    if (cost === 0) return 0;
    return ((price - cost) / price) * 100;
  };

  const calculateMarkup = (price: number, cost: number) => {
    if (cost === 0) return 0;
    return ((price - cost) / cost) * 100;
  };

  const margin = calculateMargin(productData.price, productData.costPrice);
  const markup = calculateMarkup(productData.price, productData.costPrice);

  const inputClass =
    "w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition-all text-gray-800 placeholder-gray-400";
  const readonlyClass = "px-4 py-3 bg-gray-50 rounded-xl border border-gray-100";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl" style={{ backgroundColor: "#16a34a15" }}>
          <DollarSign className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Información de Precios</h2>
          <p className="text-sm text-gray-500">Gestión de precios y márgenes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Precio de venta */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <DollarSign className="w-4 h-4 inline mr-2" />
            Precio de venta *
          </label>
          {isEditing ? (
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={productData.price}
                onChange={(e) => onChange({ price: Number(e.target.value) })}
                className={`${inputClass} pl-8`}
                placeholder="0"
                min="0"
                step="1"
              />
            </div>
          ) : (
            <div className={readonlyClass}>
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(productData.price)}
              </span>
            </div>
          )}
        </div>

        {/* Precio de costo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Precio de costo *
          </label>
          {isEditing ? (
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={productData.costPrice}
                onChange={(e) => onChange({ costPrice: Number(e.target.value) })}
                className={`${inputClass} pl-8`}
                placeholder="0"
                min="0"
                step="1"
              />
            </div>
          ) : (
            <div className={readonlyClass}>
              <span className="text-lg font-semibold text-gray-900">
                {formatCurrency(productData.costPrice)}
              </span>
            </div>
          )}
        </div>

        {/* Precio original */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Precio original
          </label>
          {isEditing ? (
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={productData.originalPrice || ""}
                onChange={(e) =>
                  onChange({
                    originalPrice: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className={`${inputClass} pl-8`}
                placeholder="0"
                min="0"
                step="1"
              />
            </div>
          ) : (
            <div className={readonlyClass}>
              {productData.originalPrice && productData.originalPrice > productData.price ? (
                <div className="space-y-1">
                  <span className="text-lg font-semibold text-gray-400 line-through">
                    {formatCurrency(productData.originalPrice)}
                  </span>
                  <div className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded-md inline-block">
                    -{Math.round(((productData.originalPrice - productData.price) / productData.originalPrice) * 100)}% OFF
                  </div>
                </div>
              ) : (
                <span className="text-gray-400">No especificado</span>
              )}
            </div>
          )}
        </div>

        {/* Precio por mayor */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Precio por mayor</label>
          {isEditing ? (
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={productData.wholesalePrice || ""}
                onChange={(e) =>
                  onChange({ wholesalePrice: e.target.value ? Number(e.target.value) : undefined })
                }
                className={`${inputClass} pl-8`}
                placeholder="0"
                min="0"
                step="1"
              />
            </div>
          ) : (
            <div className={readonlyClass}>
              <span className="text-lg font-semibold text-gray-900">
                {productData.wholesalePrice ? formatCurrency(productData.wholesalePrice) : "No definido"}
              </span>
            </div>
          )}
        </div>

        {/* Precio mínimo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Precio mínimo</label>
          {isEditing ? (
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={productData.minPrice || ""}
                onChange={(e) =>
                  onChange({ minPrice: e.target.value ? Number(e.target.value) : undefined })
                }
                className={`${inputClass} pl-8`}
                placeholder="0"
                min="0"
                step="1"
              />
            </div>
          ) : (
            <div className={readonlyClass}>
              <span className="text-lg font-semibold text-gray-900">
                {productData.minPrice ? formatCurrency(productData.minPrice) : "No definido"}
              </span>
            </div>
          )}
        </div>

        {/* Código del proveedor */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Código del proveedor</label>
          {isEditing ? (
            <input
              type="text"
              value={productData.supplierCode || ""}
              onChange={(e) => onChange({ supplierCode: e.target.value })}
              className={inputClass}
              placeholder="Código del proveedor"
            />
          ) : (
            <div className={readonlyClass}>
              <span className="text-gray-900 font-mono">
                {productData.supplierCode || "No especificado"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Métricas calculadas */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Métricas de Rentabilidad
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Margen</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{margin.toFixed(1)}%</div>
            <div className="text-xs text-green-600/70">(Precio - Costo) / Precio</div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Markup</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{markup.toFixed(1)}%</div>
            <div className="text-xs text-blue-600/70">(Precio - Costo) / Costo</div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4" style={{ color: PRIMARY }} />
              <span className="text-sm font-medium" style={{ color: PRIMARY }}>Ganancia</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: PRIMARY }}>
              {formatCurrency(productData.price - productData.costPrice)}
            </div>
            <div className="text-xs text-gray-500">Por unidad vendida</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
