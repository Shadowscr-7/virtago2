"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Edit, Save, X, Package, Star, TrendingUp, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ProductData } from "@/app/admin/productos/[id]/page";

interface ProductHeaderProps {
  productData: ProductData;
  isEditing: boolean;
  hasChanges: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

const PRIMARY = "#C8102E";

export function ProductHeader({
  productData,
  isEditing,
  hasChanges,
  onEdit,
  onSave,
  onCancel,
}: ProductHeaderProps) {
  const router = useRouter();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVO":
        return "bg-green-100 text-green-800 border-green-200";
      case "BAJO_STOCK":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "SIN_STOCK":
        return "bg-red-100 text-red-800 border-red-200";
      case "INACTIVO":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: "UYU",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left side */}
        <div className="flex items-start gap-6">
          {/* Back button */}
          <motion.button
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/admin/productos")}
            className="p-3 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </motion.button>

          {/* Product icon and info */}
          <div className="flex items-start gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-20 h-20 rounded-xl flex items-center justify-center text-white shadow-md"
              style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY}cc)` }}
            >
              <Package className="w-10 h-10" />
            </motion.div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{productData.name}</h1>
                <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${getStatusBadge(productData.status)}`}>
                  {productData.status}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="bg-red-50 px-2 py-1 rounded-md text-red-700 font-mono">
                  {productData.sku}
                </span>
                <span>•</span>
                <span>{productData.brand}</span>
                <span>•</span>
                <span>{productData.category}</span>
              </div>

              <div className="flex items-center gap-6 mt-3">
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold" style={{ color: PRIMARY }}>
                    {formatCurrency(productData.price)}
                  </div>
                  <div className="text-sm text-gray-500">Stock: {productData.stock}</div>
                </div>

                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-semibold text-gray-900">
                    {productData.salesStats.averageRating.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({productData.salesStats.totalReviews} reseñas)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-gray-900">
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
                onClick={() => window.open(`/productos/${productData.id}`, "_blank")}
                className="flex items-center gap-2 px-5 py-3 bg-red-50 hover:bg-blue-100 text-red-700 rounded-xl transition-all border border-blue-100"
              >
                <Eye className="w-4 h-4" />
                <span className="font-medium">Ver en tienda</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEdit}
                className="flex items-center gap-2 px-5 py-3 text-white rounded-xl transition-all"
                style={{ backgroundColor: PRIMARY }}
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
                className="flex items-center gap-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all border border-gray-200"
              >
                <X className="w-4 h-4" />
                <span className="font-medium">Cancelar</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSave}
                disabled={!hasChanges}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all font-medium ${
                  hasChanges
                    ? "text-white"
                    : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                }`}
                style={hasChanges ? { backgroundColor: PRIMARY } : {}}
              >
                <Save className="w-4 h-4" />
                <span>Guardar {hasChanges && "(*)"}</span>
              </motion.button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
