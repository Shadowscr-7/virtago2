"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Eye, 
  Moon, 
  Sun, 
  Globe, 
  Mail, 
  Phone, 
  Lock,
  CreditCard,
  Truck,
  Save,
  RefreshCw
} from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import Link from "next/link"

export default function ConfiguracionPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState("perfil")
  const [darkMode, setDarkMode] = useState(true)
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
    marketing: false
  })
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
    showPhone: false,
    analytics: true
  })

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="flex items-center justify-center min-h-[80vh]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Acceso Denegado
            </h1>
            <p className="text-muted-foreground mb-6">Debes iniciar sesión para acceder a la configuración</p>
            <Link 
              href="/login"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Iniciar Sesión
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: "perfil", label: "Perfil", icon: User },
    { id: "notificaciones", label: "Notificaciones", icon: Bell },
    { id: "privacidad", label: "Privacidad", icon: Shield },
    { id: "apariencia", label: "Apariencia", icon: Eye },
    { id: "cuenta", label: "Cuenta", icon: Lock }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case "perfil":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Nombre completo</label>
                  <input 
                    type="text" 
                    defaultValue={user.name}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Email</label>
                  <input 
                    type="email" 
                    defaultValue={user.email}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Teléfono</label>
                  <input 
                    type="tel" 
                    defaultValue="+54 11 1234-5678"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Empresa</label>
                  <input 
                    type="text" 
                    defaultValue={user.company}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Dirección</label>
                  <textarea 
                    defaultValue="Av. Corrientes 1234, Buenos Aires, Argentina"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent h-24 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Zona horaria</label>
                  <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="UTC-3">Argentina (UTC-3)</option>
                    <option value="UTC-5">Colombia (UTC-5)</option>
                    <option value="UTC-6">México (UTC-6)</option>
                    <option value="UTC+1">España (UTC+1)</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )

      case "notificaciones":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Notificaciones por Email
                </h3>
                {[
                  { key: "email" as keyof typeof notifications, label: "Confirmaciones de pedido", checked: notifications.email },
                  { key: "marketing" as keyof typeof notifications, label: "Promociones y ofertas", checked: notifications.marketing }
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-white/10 rounded-lg">
                    <span className="text-gray-200">{item.label}</span>
                    <button 
                      onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                      className={`relative w-12 h-6 rounded-full transition-colors ${item.checked ? 'bg-purple-500' : 'bg-gray-600'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${item.checked ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Notificaciones Móviles
                </h3>
                {[
                  { key: "push" as keyof typeof notifications, label: "Notificaciones push", checked: notifications.push },
                  { key: "sms" as keyof typeof notifications, label: "SMS importantes", checked: notifications.sms }
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-white/10 rounded-lg">
                    <span className="text-gray-200">{item.label}</span>
                    <button 
                      onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                      className={`relative w-12 h-6 rounded-full transition-colors ${item.checked ? 'bg-purple-500' : 'bg-gray-600'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${item.checked ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )

      case "privacidad":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Configuración de Privacidad</h3>
              {[
                { key: "profileVisible" as keyof typeof privacy, label: "Perfil visible para otros usuarios", checked: privacy.profileVisible },
                { key: "showEmail" as keyof typeof privacy, label: "Mostrar email en el perfil", checked: privacy.showEmail },
                { key: "showPhone" as keyof typeof privacy, label: "Mostrar teléfono en el perfil", checked: privacy.showPhone },
                { key: "analytics" as keyof typeof privacy, label: "Permitir análisis de uso", checked: privacy.analytics }
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-white/10 rounded-lg">
                  <div>
                    <span className="text-gray-200 block">{item.label}</span>
                    <span className="text-sm text-gray-400">
                      {item.key === "analytics" && "Ayúdanos a mejorar la plataforma"}
                      {item.key === "profileVisible" && "Otros usuarios podrán ver tu información básica"}
                    </span>
                  </div>
                  <button 
                    onClick={() => setPrivacy(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${item.checked ? 'bg-purple-500' : 'bg-gray-600'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${item.checked ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )

      case "apariencia":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Personalización de Apariencia</h3>
              
              <div className="p-4 bg-white/10 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {darkMode ? <Moon className="w-5 h-5 text-purple-400" /> : <Sun className="w-5 h-5 text-yellow-400" />}
                    <span className="text-gray-200">Modo oscuro</span>
                  </div>
                  <button 
                    onClick={() => setDarkMode(!darkMode)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-purple-500' : 'bg-gray-600'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${darkMode ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              <div className="p-4 bg-white/10 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-200">Idioma</span>
                </div>
                <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="pt">Português</option>
                </select>
              </div>
            </div>
          </motion.div>
        )

      case "cuenta":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Seguridad de la Cuenta</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/configuracion/cambiar-contrasena">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Lock className="w-5 h-5 text-purple-400" />
                      <span className="text-white font-medium">Cambiar Contraseña</span>
                    </div>
                    <p className="text-sm text-gray-400">Actualiza tu contraseña de acceso</p>
                  </motion.div>
                </Link>

                <Link href="/configuracion/autenticacion-2fa">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className="w-5 h-5 text-green-400" />
                      <span className="text-white font-medium">Autenticación 2FA</span>
                    </div>
                    <p className="text-sm text-gray-400">Activa la verificación en dos pasos</p>
                  </motion.div>
                </Link>

                <Link href="/configuracion/metodos-pago">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <CreditCard className="w-5 h-5 text-blue-400" />
                      <span className="text-white font-medium">Métodos de Pago</span>
                    </div>
                    <p className="text-sm text-gray-400">Gestiona tus tarjetas y cuentas</p>
                  </motion.div>
                </Link>

                <Link href="/configuracion/direcciones-envio">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Truck className="w-5 h-5 text-orange-400" />
                      <span className="text-white font-medium">Direcciones de Envío</span>
                    </div>
                    <p className="text-sm text-gray-400">Administra tus direcciones</p>
                  </motion.div>
                </Link>
              </div>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-6">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4"
            >
              Configuración
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-300 max-w-2xl mx-auto"
            >
              Personaliza tu experiencia en VIRTAGO. Configura tu perfil, notificaciones y preferencias.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar de Tabs */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-1"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <nav className="space-y-2">
                  {tabs.map((tab, index) => {
                    const IconComponent = tab.icon
                    return (
                      <motion.button
                        key={tab.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                          activeTab === tab.id 
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                      </motion.button>
                    )
                  })}
                </nav>
              </div>
            </motion.div>

            {/* Content Area */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-3"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                {renderTabContent()}

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex gap-4 mt-8 pt-6 border-t border-white/20"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Guardar Cambios
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 text-gray-300 font-medium rounded-lg hover:bg-white/20 hover:text-white transition-all border border-white/20"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Restablecer
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
