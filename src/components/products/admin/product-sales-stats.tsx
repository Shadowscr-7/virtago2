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
      purple:
        "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-700 dark:text-purple-300",
      green:
        "from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-700 dark:text-green-300",
      yellow:
        "from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-700 dark:text-yellow-300",
      blue: "from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-700 dark:text-blue-300",
      red: "from-red-500/20 to-rose-500/20 border-red-500/30 text-red-700 dark:text-red-300",
      indigo:
        "from-indigo-500/20 to-purple-500/20 border-indigo-500/30 text-indigo-700 dark:text-indigo-300",
    };
    return colors[color as keyof typeof colors] || colors.purple;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white/70 dark:bg-slate-800/70 rounded-2xl border border-white/30 shadow-xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl">
          <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Estadísticas de Ventas
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
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
            className={`p-4 bg-gradient-to-r ${getColorClasses(stat.color)} rounded-xl border backdrop-blur-sm`}
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
      <div className="space-y-3 pt-6 border-t border-gray-200/30 dark:border-gray-700/30">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Información Temporal
        </h3>

        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-slate-700/30 rounded-xl border border-white/20">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Última venta
            </span>
            <span className="text-sm text-gray-900 dark:text-white font-medium">
              {formatDate(salesStats.lastSale)}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-slate-700/30 rounded-xl border border-white/20">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Variante más vendida
            </span>
            <span className="text-sm text-gray-900 dark:text-white font-medium">
              {salesStats.topSellingVariant}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-slate-700/30 rounded-xl border border-white/20">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
      <div className="mt-6 p-4 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-slate-700/30 dark:to-slate-600/30 rounded-xl border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">
              Promedio mensual
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Ventas estimadas por mes
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {Math.round(salesStats.totalSales / 12)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              unidades/mes
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
