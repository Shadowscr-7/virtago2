"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Building2, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/auth-store"
import { useToast } from "@/components/ui/toast"
import { setToastFunction } from "@/components/cart/cart-store"
import { StyledSwitch } from "@/components/ui/styled-switch"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  
  const { login } = useAuthStore()
  const { showToast } = useToast()
  const router = useRouter()

  // Set up toast function
  useEffect(() => {
    setToastFunction(showToast)
  }, [showToast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      showToast({
        title: "Campos requeridos",
        description: "Por favor completa email y contraseña",
        type: "warning"
      })
      return
    }

    setIsLoading(true)
    
    try {
      const success = await login(email, password)
      
      if (success) {
        showToast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión exitosamente",
          type: "success"
        })
        router.push("/")
      } else {
        showToast({
          title: "Error de autenticación",
          description: "Email o contraseña incorrectos",
          type: "error"
        })
      }
    } catch {
      showToast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        type: "error"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fillTestUser = (userType: 'cliente' | 'distribuidor') => {
    if (userType === 'cliente') {
      setEmail('cliente@virtago.com')
    } else {
      setEmail('distribuidor@virtago.com')
    }
    setPassword('123456')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Partículas de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 0], 
              scale: [0, 1, 0],
              x: [0, Math.random() * 200 - 100],
              y: [0, Math.random() * 200 - 100]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
            className="absolute w-1 h-1 bg-purple-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Botón de regreso */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </motion.div>

        {/* Formulario */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl"
        >
          {/* Logo y título */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.5, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-16 h-16 mx-auto mb-4"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500" />
                <div className="absolute inset-2 rounded-full bg-slate-900 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">V</span>
                </div>
              </div>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl font-bold text-white mb-2"
            >
              Iniciar Sesión
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-white/70"
            >
              Accede a precios exclusivos B2B
            </motion.p>
          </div>

          {/* Test Users Info */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4 mb-6"
          >
            <p className="text-blue-200 text-sm mb-3">🔐 Datos de prueba disponibles:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillTestUser('cliente')}
                className="text-left p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <div className="text-white text-xs font-medium">👩‍💼 Cliente</div>
                <div className="text-white/70 text-xs">María González</div>
              </button>
              <button
                type="button"
                onClick={() => fillTestUser('distribuidor')}
                className="text-left p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <div className="text-white text-xs font-medium">👨‍💼 Distribuidor</div>
                <div className="text-white/70 text-xs">Carlos Rodríguez</div>
              </button>
            </div>
            <p className="text-blue-200/70 text-xs mt-2">Contraseña para ambos: <code>123456</code></p>
          </motion.div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <label className="block text-white/90 text-sm font-medium mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="tu@empresa.com"
                />
              </div>
            </motion.div>

            {/* Contraseña */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <label className="block text-white/90 text-sm font-medium mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </motion.div>

            {/* Recordarme y olvidé contraseña */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex items-center justify-between"
            >
              <StyledSwitch
                checked={rememberMe}
                onChange={setRememberMe}
                label="Recordarme"
                size="sm"
                color="purple"
              />
              <a href="#" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                ¿Olvidaste tu contraseña?
              </a>
            </motion.div>

            {/* Botón de login */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300",
                "bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500",
                "hover:from-purple-600 hover:via-pink-600 hover:to-cyan-600",
                "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                isLoading && "animate-pulse"
              )}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Iniciando sesión...
                </div>
              ) : (
                "Iniciar Sesión"
              )}
            </motion.button>
          </form>

          {/* Registro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mt-8 text-center"
          >
            <p className="text-white/70">
              ¿No tienes cuenta?{" "}
              <Link href="/register" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                Regístrate aquí
              </Link>
            </p>
          </motion.div>

          {/* Badge B2B */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-6 flex items-center justify-center gap-2 p-3 bg-white/5 rounded-lg border border-white/10"
          >
            <Building2 className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-white/70">Plataforma exclusiva para empresas</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
