"use client"

import { motion } from "framer-motion"
import { DollarSign, TrendingUp, Percent } from "lucide-react"
import type { ProductData } from "@/app/admin/productos/[id]/page"

interface ProductPricingInfoProps {
  productData: ProductData
  isEditing: boolean
  onChange: (updates: Partial<ProductData>) => void
}

export function ProductPricingInfo({
  productData,
  isEditing,
  onChange
}: ProductPricingInfoProps) {

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const calculateMargin = (price: number, cost: number) => {
    if (cost === 0) return 0
    return ((price - cost) / price) * 100
  }

  const calculateMarkup = (price: number, cost: number) => {
    if (cost === 0) return 0
    return ((price - cost) / cost) * 100
  }

  const margin = calculateMargin(productData.price, productData.costPrice)
  const markup = calculateMarkup(productData.price, productData.costPrice)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-white/30 shadow-xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl">
          <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Información de Precios
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gestión de precios y márgenes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Precio de venta */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <DollarSign className="w-4 h-4 inline mr-2" />
            Precio de venta *
          </label>
          {isEditing ? (
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
              <input
                type="number"
                value={productData.price}
                onChange={(e) => onChange({ price: Number(e.target.value) })}
                className="w-full pl-8 pr-4 py-3 bg-white/60 dark:bg-slate-700/60 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all backdrop-blur-sm"
                placeholder="0"
                min="0"
                step="1"
              />
            </div>
          ) : (
            <div className="px-4 py-3 bg-gray-50/50 dark:bg-slate-700/30 rounded-xl border border-white/20">
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {formatCurrency(productData.price)}
              </span>
            </div>
          )}
        </div>

        {/* Precio de costo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Precio de costo *
          </label>
          {isEditing ? (
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
              <input
                type="number"
                value={productData.costPrice}
                onChange={(e) => onChange({ costPrice: Number(e.target.value) })}
                className="w-full pl-8 pr-4 py-3 bg-white/60 dark:bg-slate-700/60 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all backdrop-blur-sm"
                placeholder="0"
                min="0"
                step="1"
              />
            </div>
          ) : (
            <div className="px-4 py-3 bg-gray-50/50 dark:bg-slate-700/30 rounded-xl border border-white/20">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(productData.costPrice)}
              </span>
            </div>
          )}
        </div>

        {/* Precio original (antes de descuento) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Precio original
          </label>
          {isEditing ? (
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
              <input
                type="number"
                value={productData.originalPrice || ''}
                onChange={(e) => onChange({ originalPrice: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full pl-8 pr-4 py-3 bg-white/60 dark:bg-slate-700/60 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all backdrop-blur-sm"
                placeholder="0"
                min="0"
                step="1"
              />
            </div>
          ) : (
            <div className="px-4 py-3 bg-gray-50/50 dark:bg-slate-700/30 rounded-xl border border-white/20">
              {productData.originalPrice ? (
                <div className="space-y-1">
                  <span className="text-lg font-semibold text-gray-500 dark:text-gray-400 line-through">
                    {formatCurrency(productData.originalPrice)}
                  </span>
                  <div className="text-sm bg-red-100/50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-2 py-1 rounded-md inline-block">
                    -{Math.round(((productData.originalPrice - productData.price) / productData.originalPrice) * 100)}% OFF
                  </div>
                </div>
              ) : (
                <span className="text-gray-500 dark:text-gray-400">Sin descuento</span>
              )}
            </div>
          )}
        </div>

        {/* Precio por mayor */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Precio por mayor
          </label>
          {isEditing ? (
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
              <input
                type="number"
                value={productData.wholesalePrice || ''}
                onChange={(e) => onChange({ wholesalePrice: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full pl-8 pr-4 py-3 bg-white/60 dark:bg-slate-700/60 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all backdrop-blur-sm"
                placeholder="0"
                min="0"
                step="1"
              />
            </div>
          ) : (
            <div className="px-4 py-3 bg-gray-50/50 dark:bg-slate-700/30 rounded-xl border border-white/20">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {productData.wholesalePrice ? formatCurrency(productData.wholesalePrice) : 'No definido'}
              </span>
            </div>
          )}
        </div>

        {/* Precio mínimo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Precio mínimo
          </label>
          {isEditing ? (
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
              <input
                type="number"
                value={productData.minPrice || ''}
                onChange={(e) => onChange({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full pl-8 pr-4 py-3 bg-white/60 dark:bg-slate-700/60 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all backdrop-blur-sm"
                placeholder="0"
                min="0"
                step="1"
              />
            </div>
          ) : (
            <div className="px-4 py-3 bg-gray-50/50 dark:bg-slate-700/30 rounded-xl border border-white/20">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {productData.minPrice ? formatCurrency(productData.minPrice) : 'No definido'}
              </span>
            </div>
          )}
        </div>

        {/* Información adicional de proveedor */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Código del proveedor
          </label>
          {isEditing ? (
            <input
              type="text"
              value={productData.supplierCode || ''}
              onChange={(e) => onChange({ supplierCode: e.target.value })}
              className="w-full px-4 py-3 bg-white/60 dark:bg-slate-700/60 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all backdrop-blur-sm"
              placeholder="Código del proveedor"
            />
          ) : (
            <div className="px-4 py-3 bg-gray-50/50 dark:bg-slate-700/30 rounded-xl border border-white/20">
              <span className="text-gray-900 dark:text-white font-mono">
                {productData.supplierCode || 'No especificado'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Métricas calculadas */}
      <div className="mt-6 pt-6 border-t border-gray-200/30 dark:border-gray-700/30">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Métricas de Rentabilidad
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Margen */}
          <div className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-xl p-4 border border-green-200/30">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">Margen</span>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {margin.toFixed(1)}%
            </div>
            <div className="text-xs text-green-600/70 dark:text-green-400/70">
              (Precio - Costo) / Precio
            </div>
          </div>

          {/* Markup */}
          <div className="bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-xl p-4 border border-blue-200/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Markup</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {markup.toFixed(1)}%
            </div>
            <div className="text-xs text-blue-600/70 dark:text-blue-400/70">
              (Precio - Costo) / Costo
            </div>
          </div>

          {/* Ganancia */}
          <div className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-xl p-4 border border-purple-200/30">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Ganancia</span>
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {formatCurrency(productData.price - productData.costPrice)}
            </div>
            <div className="text-xs text-purple-600/70 dark:text-purple-400/70">
              Por unidad vendida
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
