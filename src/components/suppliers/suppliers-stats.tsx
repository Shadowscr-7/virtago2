"use client";

import { motion } from "framer-motion";
import {
  Building,
  Award,
  TrendingUp,
  Users,
  Globe,
  Clock,
  CheckCircle,
  Star,
} from "lucide-react";

export function SuppliersStats() {
  const stats = [
    {
      icon: Building,
      value: "500+",
      label: "Proveedores Activos",
      description: "Red global de proveedores verificados",
    },
    {
      icon: Award,
      value: "95%",
      label: "Certificación ISO",
      description: "Estándares de calidad internacional",
    },
    {
      icon: Users,
      value: "10K+",
      label: "Empresas Conectadas",
      description: "Clientes satisfechos en toda la región",
    },
    {
      icon: TrendingUp,
      value: "$2.5B+",
      label: "Volumen de Transacciones",
      description: "Valor total procesado anualmente",
    },
    {
      icon: Globe,
      value: "35",
      label: "Países",
      description: "Cobertura internacional",
    },
    {
      icon: Clock,
      value: "24/7",
      label: "Soporte",
      description: "Atención continua especializada",
    },
    {
      icon: CheckCircle,
      value: "99.8%",
      label: "Entregas a Tiempo",
      description: "Cumplimiento garantizado",
    },
    {
      icon: Star,
      value: "4.9⭐",
      label: "Rating Promedio",
      description: "Excelencia en satisfacción",
    },
  ];

  const highlights = [
    {
      title: "Verificación Rigurosa",
      description:
        "Proceso de validación en 7 etapas para garantizar la confiabilidad de cada proveedor.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Tecnología Avanzada",
      description:
        "Plataforma inteligente con IA para matchmaking óptimo entre empresas y proveedores.",
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Soporte Dedicado",
      description:
        "Equipo especializado en B2B para facilitar negociaciones y resolver cualquier consulta.",
      color: "from-orange-500 to-red-500",
    },
  ];

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Liderando el Mercado B2B
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Cifras que demuestran nuestro compromiso con la excelencia y la
            satisfacción de nuestros partners comerciales.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                      {stat.value}
                    </div>
                  </div>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  {stat.label}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {stat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Highlights Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
            ¿Por Qué Elegirnos?
          </h3>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Tres pilares fundamentales que nos posicionan como la plataforma
            líder en conexiones B2B.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {highlights.map((highlight, index) => (
            <motion.div
              key={highlight.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="group"
            >
              <div className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-slate-200 dark:border-slate-700">
                {/* Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${highlight.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}
                />

                {/* Content */}
                <div className="relative">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${highlight.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                      <div
                        className={`w-4 h-4 bg-gradient-to-r ${highlight.color} rounded`}
                      />
                    </div>
                  </div>

                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                    {highlight.title}
                  </h4>

                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {highlight.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              ¿Listo para formar parte de nuestra red?
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Únete a miles de empresas que ya confían en nuestra plataforma
              para encontrar los mejores proveedores.
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
              Comenzar Ahora
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
