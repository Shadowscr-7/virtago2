"use client"

import { motion } from "framer-motion"
import { Search, Tag, TrendingDown, Clock, Gift, Zap } from "lucide-react"

export function OffersHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-red-600 to-pink-700 dark:from-orange-800 dark:via-red-800 dark:to-pink-900">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm10 0c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        
        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl"
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-24 h-24 bg-white/10 rounded-full blur-xl"
          animate={{
            y: [0, 20, 0],
            x: [0, -10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
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
            <Tag className="w-4 h-4" />
            <span className="text-sm font-medium">Ofertas Exclusivas B2B</span>
          </motion.div>
          
          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent"
          >
            Ofertas
            <span className="block text-transparent bg-gradient-to-r from-yellow-300 to-red-300 bg-clip-text">
              Imperdibles
            </span>
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-orange-100 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Descuentos exclusivos para empresas registradas.
            <span className="block mt-2 text-lg text-orange-200">
              Aprovecha precios mayoristas y ofertas por tiempo limitado.
            </span>
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <button className="group flex items-center gap-3 bg-white text-orange-600 px-8 py-4 rounded-xl font-semibold hover:bg-orange-50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl">
              <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Ver Todas las Ofertas
            </button>
            <button className="group flex items-center gap-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 transform hover:-translate-y-1">
              <Gift className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Ofertas Flash
            </button>
          </motion.div>
          
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-1 sm:grid-cols-4 gap-6 max-w-3xl mx-auto"
          >
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl mx-auto mb-2">
                <Tag className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold">500+</div>
              <div className="text-orange-200 text-sm">Ofertas Activas</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl mx-auto mb-2">
                <TrendingDown className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold">70%</div>
              <div className="text-orange-200 text-sm">Descuento Máximo</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl mx-auto mb-2">
                <Clock className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold">24h</div>
              <div className="text-orange-200 text-sm">Ofertas Flash</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl mx-auto mb-2">
                <Zap className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold">Nuevo</div>
              <div className="text-orange-200 text-sm">Cada Día</div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="currentColor"
            className="text-slate-50 dark:text-slate-900"
          />
        </svg>
      </div>
    </section>
  )
}
