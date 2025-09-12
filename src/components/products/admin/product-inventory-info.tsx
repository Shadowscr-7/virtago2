"use client"

import { motion } from "framer-motion"
import { Package, MapPin, AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { StyledSwitch } from "@/components/ui/styled-switch"
import type { ProductData } from "@/app/admin/productos/[id]/page"

interface ProductInventoryInfoProps {
  productData: ProductData
  isEditing: boolean
  onChange: (updates: Partial<ProductData>) => void
}

export function ProductInventoryInfo({
  productData,
  isEditing,
  onChange
}: ProductInventoryInfoProps) {

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) {
      return {
        status: "SIN_STOCK",
        label: "Sin Stock",
        color: "red",
        icon: <Minus className="w-4 h-4" />
      }
    } else if (stock <= minStock) {
      return {
        status: "BAJO_STOCK",
        label: "Bajo Stock",
        color: "yellow",
        icon: <TrendingDown className="w-4 h-4" />
      }
    } else {
      return {
        status: "EN_STOCK",
        label: "En Stock",
        color: "green",
        icon: <TrendingUp className="w-4 h-4" />
      }
    }
  }

  const stockStatus = getStockStatus(productData.stock, productData.minStock)

  const getStockPercentage = () => {
    if (productData.maxStock === 0) return 0
    return (productData.stock / productData.maxStock) * 100
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-white/30 shadow-xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl">
          <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Gestión de Inventario
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Control de stock y ubicación
          </p>
        </div>
      </div>

      {/* Estado actual del stock */}
      <div className="mb-6 p-4 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-slate-700/30 dark:to-slate-600/30 rounded-xl border border-white/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              stockStatus.color === 'green' ? 'bg-green-100/50 dark:bg-green-900/20 text-green-600' :
              stockStatus.color === 'yellow' ? 'bg-yellow-100/50 dark:bg-yellow-900/20 text-yellow-600' :
              'bg-red-100/50 dark:bg-red-900/20 text-red-600'
            }`}>
              {stockStatus.icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Estado del Stock
              </h3>
              <span className={`text-sm font-medium ${
                stockStatus.color === 'green' ? 'text-green-600 dark:text-green-400' :
                stockStatus.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                'text-red-600 dark:text-red-400'
              }`}>
                {stockStatus.label}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {productData.stock}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              unidades disponibles
            </div>
          </div>
        </div>
        
        {/* Barra de progreso del stock */}
        <div className="relative">
          <div className="w-full bg-gray-200/50 dark:bg-gray-700/50 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                stockStatus.color === 'green' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                stockStatus.color === 'yellow' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                'bg-gradient-to-r from-red-500 to-rose-500'
              }`}
              style={{ width: `${Math.min(getStockPercentage(), 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>0</span>
            <span>Min: {productData.minStock}</span>
            <span>Máx: {productData.maxStock}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock actual */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <Package className="w-4 h-4 inline mr-2" />
            Stock actual *
          </label>
          {isEditing ? (
            <input
              type="number"
              value={productData.stock}
              onChange={(e) => onChange({ stock: Number(e.target.value) })}
              className="w-full px-4 py-3 bg-white/60 dark:bg-slate-700/60 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all backdrop-blur-sm"
              placeholder="0"
              min="0"
              step="1"
            />
          ) : (
            <div className="px-4 py-3 bg-gray-50/50 dark:bg-slate-700/30 rounded-xl border border-white/20">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {productData.stock}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">unidades</span>
            </div>
          )}
        </div>

        {/* Stock mínimo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <AlertTriangle className="w-4 h-4 inline mr-2" />
            Stock mínimo *
          </label>
          {isEditing ? (
            <input
              type="number"
              value={productData.minStock}
              onChange={(e) => onChange({ minStock: Number(e.target.value) })}
              className="w-full px-4 py-3 bg-white/60 dark:bg-slate-700/60 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all backdrop-blur-sm"
              placeholder="0"
              min="0"
              step="1"
            />
          ) : (
            <div className="px-4 py-3 bg-gray-50/50 dark:bg-slate-700/30 rounded-xl border border-white/20">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {productData.minStock}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">unidades</span>
            </div>
          )}
        </div>

        {/* Stock máximo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Stock máximo
          </label>
          {isEditing ? (
            <input
              type="number"
              value={productData.maxStock}
              onChange={(e) => onChange({ maxStock: Number(e.target.value) })}
              className="w-full px-4 py-3 bg-white/60 dark:bg-slate-700/60 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all backdrop-blur-sm"
              placeholder="0"
              min="0"
              step="1"
            />
          ) : (
            <div className="px-4 py-3 bg-gray-50/50 dark:bg-slate-700/30 rounded-xl border border-white/20">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {productData.maxStock}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">unidades</span>
            </div>
          )}
        </div>

        {/* Stock reservado */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Stock reservado
          </label>
          {isEditing ? (
            <input
              type="number"
              value={productData.reservedStock || 0}
              onChange={(e) => onChange({ reservedStock: Number(e.target.value) })}
              className="w-full px-4 py-3 bg-white/60 dark:bg-slate-700/60 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all backdrop-blur-sm"
              placeholder="0"
              min="0"
              step="1"
            />
          ) : (
            <div className="px-4 py-3 bg-gray-50/50 dark:bg-slate-700/30 rounded-xl border border-white/20">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {productData.reservedStock || 0}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">unidades</span>
            </div>
          )}
        </div>

        {/* Ubicación */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <MapPin className="w-4 h-4 inline mr-2" />
            Ubicación en almacén
          </label>
          {isEditing ? (
            <input
              type="text"
              value={productData.location || ''}
              onChange={(e) => onChange({ location: e.target.value })}
              className="w-full px-4 py-3 bg-white/60 dark:bg-slate-700/60 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all backdrop-blur-sm"
              placeholder="Ej: A-1-15, Pasillo A, Estante 1, Nivel 15"
            />
          ) : (
            <div className="px-4 py-3 bg-gray-50/50 dark:bg-slate-700/30 rounded-xl border border-white/20">
              <span className="text-gray-900 dark:text-white">
                {productData.location || 'No especificada'}
              </span>
            </div>
          )}
        </div>

        {/* SKU del proveedor */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            SKU del proveedor
          </label>
          {isEditing ? (
            <input
              type="text"
              value={productData.supplier_sku || ''}
              onChange={(e) => onChange({ supplier_sku: e.target.value })}
              className="w-full px-4 py-3 bg-white/60 dark:bg-slate-700/60 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all backdrop-blur-sm"
              placeholder="SKU del proveedor"
            />
          ) : (
            <div className="px-4 py-3 bg-gray-50/50 dark:bg-slate-700/30 rounded-xl border border-white/20">
              <span className="text-gray-900 dark:text-white font-mono">
                {productData.supplier_sku || 'No especificado'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Configuraciones de inventario */}
      <div className="mt-6 pt-6 border-t border-gray-200/30 dark:border-gray-700/30">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Configuraciones de Inventario
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Seguimiento de stock */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-xl border border-blue-200/30">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                Seguimiento de stock
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Controlar automáticamente el inventario
              </div>
            </div>
            <StyledSwitch
              checked={productData.trackStock}
              onChange={(checked) => onChange({ trackStock: checked })}
              disabled={!isEditing}
            />
          </div>

          {/* Permitir pedidos sin stock */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50/50 to-red-50/50 dark:from-orange-900/10 dark:to-red-900/10 rounded-xl border border-orange-200/30">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                Permitir pedidos sin stock
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Backorder cuando no hay stock
              </div>
            </div>
            <StyledSwitch
              checked={productData.allowBackorder}
              onChange={(checked) => onChange({ allowBackorder: checked })}
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>

      {/* Stock disponible calculado */}
      <div className="mt-6 p-4 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-xl border border-green-200/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-green-700 dark:text-green-300">
              Stock disponible para venta
            </div>
            <div className="text-sm text-green-600/70 dark:text-green-400/70">
              Stock total - Stock reservado
            </div>
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {Math.max(0, productData.stock - (productData.reservedStock || 0))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
