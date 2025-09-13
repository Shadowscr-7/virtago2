"use client";

import { motion } from "framer-motion";
import { 
  ShoppingBag, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Package,
  Truck,
  CheckCircle 
} from "lucide-react";
import { useTheme } from "@/contexts/theme-context";

interface OrderStatsProps {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  trends?: {
    orders: number;
    pending: number;
    revenue: number;
    average: number;
  };
}

export function OrderStats({
  totalOrders,
  pendingOrders,
  processingOrders,
  shippedOrders,
  deliveredOrders,
  totalRevenue,
  averageOrderValue,
  trends
}: OrderStatsProps) {
  const { themeColors } = useTheme();

  const stats = [
    {
      title: "Total Órdenes",
      value: totalOrders,
      icon: ShoppingBag,
      color: themeColors.primary,
      trend: trends?.orders || 12,
      isPositive: (trends?.orders || 12) > 0,
    },
    {
      title: "Pendientes",
      value: pendingOrders,
      icon: Clock,
      color: "#f59e0b",
      trend: trends?.pending || -5,
      isPositive: (trends?.pending || -5) > 0,
    },
    {
      title: "Procesando",
      value: processingOrders,
      icon: Package,
      color: "#3b82f6",
      trend: 8,
      isPositive: true,
    },
    {
      title: "Enviados",
      value: shippedOrders,
      icon: Truck,
      color: "#8b5cf6",
      trend: 15,
      isPositive: true,
    },
    {
      title: "Entregados",
      value: deliveredOrders,
      icon: CheckCircle,
      color: "#10b981",
      trend: 22,
      isPositive: true,
    },
    {
      title: "Ingresos Totales",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "#10b981",
      trend: trends?.revenue || 18,
      isPositive: (trends?.revenue || 18) > 0,
    },
    {
      title: "Orden Promedio",
      value: `$${averageOrderValue.toFixed(0)}`,
      icon: TrendingUp,
      color: themeColors.secondary,
      trend: trends?.average || 3,
      isPositive: (trends?.average || 3) > 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * index }}
          className="backdrop-blur-xl p-6 rounded-2xl border"
          style={{
            backgroundColor: `${themeColors.surface}70`,
            borderColor: `${themeColors.primary}30`,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: themeColors.text.secondary }}>
                {stat.title}
              </p>
              <p className="text-2xl font-bold mt-1" style={{ color: themeColors.text.primary }}>
                {stat.value}
              </p>
            </div>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${stat.color}20` }}
            >
              <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4">
            {stat.isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-xs ${stat.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {stat.isPositive ? '+' : ''}{stat.trend}% vs mes anterior
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default OrderStats;
