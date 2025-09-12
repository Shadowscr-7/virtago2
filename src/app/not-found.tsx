"use client"

import { motion } from "framer-motion"
import { Search, Home, ArrowLeft, RefreshCw, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NotFound() {
  const router = useRouter()

  const handleGoBack = () => {
    router.back()
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Elementos de fondo animados */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-3xl"
        />
        <motion.div
          animate={{ 
            rotate: -360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-r from-cyan-600/20 to-blue-600/20 blur-3xl"
        />
        <motion.div
          animate={{ 
            y: [-20, 20, -20],
            x: [-10, 10, -10]
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-pink-600/10 to-purple-600/10 blur-2xl"
        />
      </div>

      {/* Contenido principal */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center max-w-2xl mx-auto"
      >
        {/* Icono 404 animado */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6, type: "spring", bounce: 0.4 }}
          className="mb-8"
        >
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="relative mx-auto w-48 h-48 rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-white/10 flex items-center justify-center"
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-600/30 to-pink-600/30 animate-pulse" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="relative"
            >
              <AlertTriangle className="w-20 h-20 text-purple-300" />
            </motion.div>
            
            {/* Número 404 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
            >
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                404
              </span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Título y descripción */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              ¡Oops!
            </span>
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
            Página no encontrada
          </h2>
          <p className="text-lg text-purple-200 max-w-lg mx-auto leading-relaxed">
            La página que buscas no existe o ha sido movida. No te preocupes, 
            te ayudamos a encontrar lo que necesitas.
          </p>
        </motion.div>

        {/* Sugerencias y botones de acción */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="space-y-6"
        >
          {/* Sugerencias */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">¿Qué puedes hacer?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center text-purple-200">
                <Search className="w-4 h-4 mr-2 text-purple-400" />
                Buscar productos
              </div>
              <div className="flex items-center text-purple-200">
                <Home className="w-4 h-4 mr-2 text-purple-400" />
                Ir a la página principal
              </div>
              <div className="flex items-center text-purple-200">
                <RefreshCw className="w-4 h-4 mr-2 text-purple-400" />
                Recargar la página
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoBack}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver Atrás
            </motion.button>

            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 text-white font-medium rounded-xl hover:bg-white/20 transition-all duration-300 shadow-lg"
              >
                <Home className="w-4 h-4" />
                Ir al Inicio
              </Link>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 text-purple-200 font-medium rounded-xl hover:bg-white/10 hover:text-white transition-all duration-300"
            >
              <RefreshCw className="w-4 h-4" />
              Recargar
            </motion.button>
          </div>
        </motion.div>

        {/* Enlaces útiles */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-12 pt-8 border-t border-white/10"
        >
          <p className="text-purple-300 mb-4">Enlaces útiles:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            {[
              { name: "Productos", href: "/productos" },
              { name: "Marcas", href: "/marcas" },
              { name: "Ofertas", href: "/ofertas" },
              { name: "Contacto", href: "/contacto" }
            ].map((link, index) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                whileHover={{ y: -2 }}
              >
                <Link
                  href={link.href}
                  className="text-purple-300 hover:text-white transition-colors duration-200 hover:underline"
                >
                  {link.name}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Partículas flotantes */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [-20, -40, -20],
            x: [-10, 10, -10],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5
          }}
          className={`absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-sm`}
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + i * 10}%`
          }}
        />
      ))}
    </div>
  )
}
