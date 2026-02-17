"use client";

import { motion } from "framer-motion";
import { TrendingUp, Package, Users, Award } from "lucide-react";

interface ProductsStatsProps {
  totalProducts: number;
}

export function ProductsStats({ totalProducts }: ProductsStatsProps) {
  const stats = [
    {
      icon: Package,
      label: "Productos Disponibles",
      value: totalProducts.toLocaleString(),
      trend: "+12%",
      description: "vs. mes anterior",
    },
    {
      icon: Users,
      label: "Clientes Activos",
      value: "2,500+",
      trend: "+8%",
      description: "crecimiento mensual",
    },
    {
      icon: Award,
      label: "Marcas Premium",
      value: "50+",
      trend: "+5",
      description: "nuevas este mes",
    },
    {
      icon: TrendingUp,
      label: "Satisfacción",
      value: "99.2%",
      trend: "+0.3%",
      description: "índice de calidad",
    },
  ];

  return (
    <section className="py-16 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Números que Hablan por Sí Solos
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-lg max-w-2xl mx-auto">
            Nuestra plataforma conecta empresas con los mejores productos del
            mercado
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-200/50 dark:border-slate-600/50">
                {/* Icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium">
                    <TrendingUp className="w-4 h-4" />
                    {stat.trend}
                  </div>
                </div>

                {/* Value */}
                <div className="mb-2">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 font-medium">
                    {stat.label}
                  </div>
                </div>

                {/* Description */}
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {stat.description}
                </div>

                {/* Progress Bar */}
                <div className="mt-4 h-1 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "75%" }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                    viewport={{ once: true }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>


      </div>
    </section>
  );
}
