"use client";

import { motion } from "framer-motion";
import { Search, Award, TrendingUp, Users, Star, Building } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";

export function BrandsHero() {
  const { themeColors } = useTheme();

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-20">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20v-40c11.046 0 20 8.954 20 20zM0 20v20h40V0H20c0 11.046-8.954 20-20 20z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl"
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-24 h-24 bg-white/10 rounded-full blur-xl"
          animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center text-white">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 mb-6"
          >
            <Award className="w-4 h-4" />
            <span className="text-sm font-medium">Marcas Premium B2B</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold mb-6 text-white"
          >
            Marcas
            <span className="block text-white/80">
              de Prestigio
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed"
            style={{ color: "rgba(255,255,255,0.9)" }}
          >
            Descubre las marcas más reconocidas del mercado B2B.
            <span className="block mt-2 text-lg" style={{ color: "rgba(255,255,255,0.75)" }}>
              Calidad garantizada, innovación constante y soporte profesional.
            </span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <button
              className="group flex items-center gap-3 bg-white px-8 py-4 rounded-xl font-semibold hover:bg-white/90 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
              style={{ color: themeColors.primary }}
            >
              <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Explorar Marcas
            </button>
            <button className="group flex items-center gap-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 transform hover:-translate-y-1">
              <Building className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Convertirse en Partner
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-1 sm:grid-cols-4 gap-6 max-w-3xl mx-auto"
          >
            {[
              { icon: Award, value: "200+", label: "Marcas Premium" },
              { icon: Star, value: "4.9⭐", label: "Rating Promedio" },
              { icon: Users, value: "50K+", label: "Productos" },
              { icon: TrendingUp, value: "98%", label: "Satisfacción" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl mx-auto mb-2">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill={themeColors.background}
          />
        </svg>
      </div>
    </section>
  );
}
