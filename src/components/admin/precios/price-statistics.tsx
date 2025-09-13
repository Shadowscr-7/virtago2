"use client";

import { motion } from "framer-motion";
import { Package, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";

interface PriceStats {
  total: number;
  activos: number;
  inactivos: number;
  totalValue: number;
}

interface PriceStatisticsProps {
  stats: PriceStats;
}

export const PriceStatistics: React.FC<PriceStatisticsProps> = ({ stats }) => {
  const { themeColors } = useTheme();

  const statItems = [
    { 
      title: "Total Precios", 
      value: stats.total, 
      icon: Package, 
      colorKey: "primary" as const 
    },
    { 
      title: "Activos", 
      value: stats.activos, 
      icon: TrendingUp, 
      colorKey: "secondary" as const 
    },
    { 
      title: "Inactivos", 
      value: stats.inactivos, 
      icon: TrendingDown, 
      colorKey: "accent" as const 
    },
    { 
      title: "Valor Total", 
      value: `$${stats.totalValue.toLocaleString()}`, 
      icon: DollarSign, 
      colorKey: "primary" as const 
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-1 md:grid-cols-4 gap-4"
    >
      {statItems.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 + index * 0.05 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className="p-6 backdrop-blur-xl rounded-2xl border shadow-lg"
          style={{
            backgroundColor: themeColors.surface + "70",
            borderColor: themeColors.primary + "30",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                backgroundImage: `linear-gradient(to right, ${themeColors[stat.colorKey]}, ${themeColors.secondary})`,
              }}
            >
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p
                className="text-2xl font-bold"
                style={{ color: themeColors[stat.colorKey] }}
              >
                {typeof stat.value === 'string' ? stat.value : stat.value.toLocaleString()}
              </p>
              <p style={{ color: themeColors.text.secondary }} className="text-sm">
                {stat.title}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};
