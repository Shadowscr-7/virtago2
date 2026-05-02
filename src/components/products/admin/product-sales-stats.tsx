"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  Star,
  DollarSign,
  Package,
  Calendar,
  RotateCcw,
  Target,
} from "lucide-react";
import type { ProductData } from "@/app/admin/productos/[id]/page";

interface ProductSalesStatsProps {
  productData: ProductData;
}

export function ProductSalesStats({ productData }: ProductSalesStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: "UYU",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-UY", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const salesStats = productData.salesStats;

  const stats = [
    {
      label: "Total de ventas",
      value: salesStats.totalSales.toString(),
      icon: <Package className="w-5 h-5" />,
      color: "purple",
      subtitle: "unidades vendidas",
    },
    {
      label: "Ingresos totales",
      value: formatCurrency(salesStats.totalRevenue),
      icon: <DollarSign className="w-5 h-5" />,
      color: "green",
      subtitle: "facturación acumulada",
    },
    {
      label: "Valoración promedio",
      value: salesStats.averageRating.toFixed(1),
      icon: <Star className="w-5 h-5" />,
      color: "yellow",
      subtitle: `${salesStats.totalReviews} reseñas`,
    },
    {
      label: "Margen de ganancia",
      value: `${salesStats.profitMargin.toFixed(1)}%`,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "blue",
      subtitle: "por unidad vendida",
    },
    {
      label: "Tasa de devolución",
      value: `${salesStats.returnRate.toFixed(1)}%`,
      icon: <RotateCcw className="w-5 h-5" />,
      color: salesStats.returnRate > 5 ? "red" : "green",
      subtitle: "de productos devueltos",
    },
    {
      label: "Mejor mes",
      value: salesStats.bestMonth,
      icon: <Target className="w-5 h-5" />,
      color: "indigo",
      subtitle: "con más ventas",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      purple: "bg-purple-50 border-purple-200 text-purple-700",
      green: "bg-green-50 border-green-200 text-green-700",
      yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
      blue: "bg-blue-50 border-blue-200 text-blue-700",
      red: "bg-red-50 border-red-200 text-red-700",
      indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
    };
    return colors[color as keyof typeof colors] || colors.purple;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-orange-50 rounded-xl">
          <TrendingUp className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Estadísticas de Ventas
          </h2>
          <p className="text-sm text-gray-500">
            Rendimiento y métricas del producto
          </p>
        </div>
      </div>

      {/* Grid de estadísticas */}
      <div className="space-y-4 mb-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl border ${getColorClasses(stat.color)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">{stat.icon}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium opacity-90">
                    {stat.label}
                  </div>
                  <div className="text-xs opacity-70 mt-1">{stat.subtitle}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{stat.value}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Información adicional */}
      <div className="space-y-3 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Información Temporal
        </h3>

        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-sm font-medium text-gray-700">
              Última venta
            </span>
            <span className="text-sm text-gray-900 font-medium">
              {formatDate(salesStats.lastSale)}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-sm font-medium text-gray-700">
              Variante más vendida
            </span>
            <span className="text-sm text-gray-900 font-medium">
              {salesStats.topSellingVariant}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-sm font-medium text-gray-700">
              Tendencia de ventas
            </span>
            <div className="flex items-center gap-2">
              {salesStats.salesTrend === "up" ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
              )}
              <span
                className={`text-sm font-medium ${
                  salesStats.salesTrend === "up"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {salesStats.salesTrend === "up" ? "En alza" : "En baja"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Promedio de ventas mensuales */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-gray-900">
              Promedio mensual
            </div>
            <div className="text-sm text-gray-500">
              Ventas estimadas por mes
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[#1E3A61]">
              {Math.round(salesStats.totalSales / 12)}
            </div>
            <div className="text-sm text-gray-500">
              unidades/mes
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
