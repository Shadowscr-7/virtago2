"use client";

import { motion } from "framer-motion";
import {
  Image as ImageIcon,
  CheckCircle,
  Clock,
  AlertCircle,
  HardDrive,
} from "lucide-react";

interface ImageStatsProps {
  stats: {
    total: number;
    assigned: number;
    unassigned: number;
    processing: number;
    errors: number;
    totalSize: number;
  };
}

export function ImageStats({ stats }: ImageStatsProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const statCards = [
    {
      title: "Total de Imágenes",
      value: stats.total,
      icon: ImageIcon,
      color: "from-blue-500 to-cyan-500",
      bgColor:
        "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
    },
    {
      title: "Asignadas",
      value: stats.assigned,
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500",
      bgColor:
        "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
    },
    {
      title: "Sin Asignar",
      value: stats.unassigned,
      icon: AlertCircle,
      color: "from-yellow-500 to-orange-500",
      bgColor:
        "from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20",
    },
    {
      title: "Procesando",
      value: stats.processing,
      icon: Clock,
      color: "from-purple-500 to-pink-500",
      bgColor:
        "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
    },
    {
      title: "Espacio Usado",
      value: formatFileSize(stats.totalSize),
      icon: HardDrive,
      color: "from-gray-500 to-slate-500",
      bgColor:
        "from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20",
      isSize: true,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
    >
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 + index * 0.05 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className={`bg-gradient-to-br ${stat.bgColor} backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-2xl p-6 shadow-xl relative overflow-hidden group`}
        >
          {/* Efecto de brillo */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </div>

              {stats.errors > 0 && stat.title === "Sin Asignar" && (
                <div className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
                  <AlertCircle className="w-3 h-3" />
                  <span>{stats.errors} errores</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {stat.title}
              </h3>
              <p
                className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
              >
                {stat.isSize ? stat.value : stat.value.toLocaleString()}
              </p>

              {/* Porcentaje para estadísticas numéricas */}
              {!stat.isSize && stats.total > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 bg-gradient-to-r ${stat.color} rounded-full transition-all duration-500`}
                      style={{
                        width: `${Math.min((Number(stat.value) / stats.total) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {Math.round((Number(stat.value) / stats.total) * 100)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
