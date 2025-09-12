"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Edit, Save, X, Package, Star, TrendingUp, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import type { ProductData } from "@/app/admin/productos/[id]/page"

interface ProductHeaderProps {
  productData: ProductData
  isEditing: boolean
  hasChanges: boolean
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
}

export function ProductHeader({
  productData,
  isEditing,
  hasChanges,
  onEdit,
  onSave,
  onCancel
}: ProductHeaderProps) {
  const router = useRouter()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVO":
        return "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 dark:text-green-300 border-green-500/30"
      case "BAJO_STOCK":
        return "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30"
      case "SIN_STOCK":
        return "bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-700 dark:text-red-300 border-red-500/30"
      case "INACTIVO":
        return "bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-700 dark:text-gray-300 border-gray-500/30"
      default:
        return "bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-700 dark:text-gray-300 border-gray-500/30"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-white/30 shadow-xl p-6"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left side - Product info */}
        <div className="flex items-start gap-6">
          {/* Back button */}
          <motion.button
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/admin/productos')}
            className="p-3 bg-white/60 dark:bg-slate-700/60 rounded-xl border border-white/30 hover:bg-white/80 dark:hover:bg-slate-600/80 transition-all backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </motion.button>

          {/* Product icon and info */}
          <div className="flex items-start gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white shadow-lg"
            >
              <Package className="w-10 h-10" />
            </motion.div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {productData.name}
                </h1>
                <span className={`px-3 py-1 rounded-lg text-sm font-medium border backdrop-blur-sm ${getStatusColor(productData.status)}`}>
                  {productData.status}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="bg-blue-100/50 dark:bg-blue-900/20 px-2 py-1 rounded-md text-blue-700 dark:text-blue-300 font-mono">
                  {productData.sku}
                </span>
                <span>•</span>
                <span>{productData.brand}</span>
                <span>•</span>
                <span>{productData.category}</span>
              </div>
              
              {/* Quick stats */}
              <div className="flex items-center gap-6 mt-3">
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {formatCurrency(productData.price)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Stock: {productData.stock}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {productData.salesStats.averageRating.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({productData.salesStats.totalReviews} reseñas)
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {productData.salesStats.totalSales} ventas
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          {!isEditing ? (
            <>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open(`/productos/${productData.id}`, '_blank')}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 text-blue-700 dark:text-blue-300 rounded-xl transition-all backdrop-blur-sm border border-blue-500/20"
              >
                <Eye className="w-4 h-4" />
                <span className="font-medium">Ver en tienda</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEdit}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-700 dark:text-purple-300 rounded-xl transition-all backdrop-blur-sm border border-purple-500/20"
              >
                <Edit className="w-4 h-4" />
                <span className="font-medium">Editar</span>
              </motion.button>
            </>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCancel}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-gray-500/20 to-slate-500/20 hover:from-gray-500/30 hover:to-slate-500/30 text-gray-700 dark:text-gray-300 rounded-xl transition-all backdrop-blur-sm border border-gray-500/20"
              >
                <X className="w-4 h-4" />
                <span className="font-medium">Cancelar</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSave}
                disabled={!hasChanges}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all backdrop-blur-sm border font-medium ${
                  hasChanges
                    ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 text-green-700 dark:text-green-300 border-green-500/20'
                    : 'bg-gray-100/50 dark:bg-slate-700/50 text-gray-400 dark:text-gray-500 border-gray-300/30 cursor-not-allowed'
                }`}
              >
                <Save className="w-4 h-4" />
                <span>Guardar {hasChanges && '(*)' }</span>
              </motion.button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
