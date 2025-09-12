"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Truck, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit3, 
  Check,
  MapPin,
  Home,
  Building,
  Star
} from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import Link from "next/link"

interface Address {
  id: number
  type: "home" | "work" | "other"
  title: string
  fullName: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  isDefault: boolean
}

export default function DireccionesEnvioPage() {
  const { user } = useAuthStore()
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: 1,
      type: "work",
      title: "Oficina Principal",
      fullName: "María González",
      street: "Av. Corrientes 1234, Piso 5, Oficina 501",
      city: "Buenos Aires",
      state: "CABA",
      zipCode: "C1043",
      country: "Argentina",
      phone: "+54 11 1234-5678",
      isDefault: true
    },
    {
      id: 2,
      type: "home",
      title: "Casa Particular",
      fullName: "María González",
      street: "Av. Santa Fe 567, Depto 3B",
      city: "Buenos Aires",
      state: "CABA",
      zipCode: "C1059",
      country: "Argentina",
      phone: "+54 11 9876-5432",
      isDefault: false
    }
  ])
  const [newAddress, setNewAddress] = useState<Omit<Address, 'id'>>({
    type: "home",
    title: "",
    fullName: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Argentina",
    phone: "",
    isDefault: false
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
              <Truck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Acceso Denegado
            </h1>
            <p className="text-muted-foreground mb-6">Debes iniciar sesión para gestionar direcciones</p>
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

  const getAddressIcon = (type: string) => {
    const icons = {
      home: Home,
      work: Building,
      other: MapPin
    }
    const IconComponent = icons[type as keyof typeof icons] || MapPin
    return <IconComponent className="w-5 h-5" />
  }

  const getAddressColor = (type: string) => {
    const colors = {
      home: "from-green-500 to-emerald-500",
      work: "from-blue-500 to-cyan-500",
      other: "from-purple-500 to-pink-500"
    }
    return colors[type as keyof typeof colors] || colors.other
  }

  const addAddress = () => {
    const address: Address = {
      ...newAddress,
      id: Date.now()
    }
    
    if (newAddress.isDefault) {
      setAddresses(prev => prev.map(addr => ({ ...addr, isDefault: false })))
    }
    
    setAddresses(prev => [...prev, address])
    setNewAddress({
      type: "home",
      title: "",
      fullName: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Argentina",
      phone: "",
      isDefault: false
    })
    setShowAddAddress(false)
  }

  const removeAddress = (id: number) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id))
  }

  const setAsDefault = (id: number) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })))
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
          <div className="mb-8">
            <Link 
              href="/configuracion"
              className="inline-flex items-center gap-2 text-purple-300 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a Configuración
            </Link>
            
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-4"
            >
              Direcciones de Envío
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-300"
            >
              Administra las direcciones donde quieres recibir tus pedidos
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de direcciones */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Tus Direcciones</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddAddress(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-600 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Dirección
                </motion.button>
              </div>

              <div className="space-y-4">
                {addresses.map((address, index) => (
                  <motion.div
                    key={address.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className={`relative p-6 rounded-2xl border transition-all ${
                      address.isDefault 
                        ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30' 
                        : 'bg-white/10 border-white/20 hover:bg-white/15'
                    }`}
                  >
                    {address.isDefault && (
                      <div className="absolute top-4 right-4">
                        <span className="px-2 py-1 text-xs bg-orange-500 text-white rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          Principal
                        </span>
                      </div>
                    )}

                    <div className="flex items-start gap-4 mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${getAddressColor(address.type)}`}>
                        {getAddressIcon(address.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg">{address.title}</h3>
                        <p className="text-gray-300">{address.fullName}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <p className="text-gray-200">{address.street}</p>
                      <p className="text-gray-300">
                        {address.city}, {address.state} {address.zipCode}
                      </p>
                      <p className="text-gray-300">{address.country}</p>
                      <p className="text-gray-300 flex items-center gap-2">
                        📞 {address.phone}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {!address.isDefault && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setAsDefault(address.id)}
                          className="flex items-center gap-1 px-3 py-1 text-xs bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 hover:text-white transition-all"
                        >
                          <Star className="w-3 h-3" />
                          Hacer principal
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-1 px-3 py-1 text-xs bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 hover:text-white transition-all"
                      >
                        <Edit3 className="w-3 h-3" />
                        Editar
                      </motion.button>
                      {!address.isDefault && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => removeAddress(address.id)}
                          className="flex items-center gap-1 px-3 py-1 text-xs bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 hover:text-red-200 transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                          Eliminar
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}

                {addresses.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <MapPin className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No tienes direcciones guardadas</p>
                    <p className="text-gray-500 text-sm">Agrega una dirección para recibir tus pedidos</p>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Formulario agregar dirección */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-1"
            >
              {showAddAddress ? (
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 sticky top-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Nueva Dirección</h3>
                  
                  <form onSubmit={(e) => { e.preventDefault(); addAddress(); }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Tipo de dirección
                      </label>
                      <select
                        value={newAddress.type}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, type: e.target.value as Address['type'] }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="home" className="bg-slate-800">🏠 Casa</option>
                        <option value="work" className="bg-slate-800">🏢 Trabajo</option>
                        <option value="other" className="bg-slate-800">📍 Otro</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Título de la dirección
                      </label>
                      <input
                        type="text"
                        value={newAddress.title}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Ej: Casa, Oficina, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        value={newAddress.fullName}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, fullName: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Nombre de quien recibe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Dirección completa
                      </label>
                      <textarea
                        value={newAddress.street}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent h-20 resize-none"
                        placeholder="Calle, número, piso, depto"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                          Ciudad
                        </label>
                        <input
                          type="text"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Ciudad"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                          Provincia
                        </label>
                        <input
                          type="text"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Provincia"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Código postal
                      </label>
                      <input
                        type="text"
                        value={newAddress.zipCode}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Código postal"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="+54 11 1234-5678"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={newAddress.isDefault}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, isDefault: e.target.checked }))}
                        className="w-4 h-4 text-orange-500 bg-white/10 border-white/20 rounded focus:ring-orange-500"
                      />
                      <label htmlFor="isDefault" className="text-sm text-gray-200">
                        Establecer como dirección principal
                      </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => setShowAddAddress(false)}
                        className="px-4 py-3 bg-white/10 text-gray-300 font-medium rounded-lg hover:bg-white/20 hover:text-white transition-all border border-white/20"
                      >
                        Cancelar
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-600 transition-all"
                      >
                        <MapPin className="w-4 h-4" />
                        Guardar
                      </motion.button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 sticky top-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Información de Envío</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <h4 className="text-green-300 font-medium mb-2">Envío Gratis</h4>
                      <p className="text-green-200 text-sm">
                        En compras mayores a $500.000 el envío es gratuito a todo el país.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <h4 className="text-blue-300 font-medium mb-2">Tiempos de Entrega</h4>
                      <ul className="text-blue-200 text-sm space-y-1">
                        <li>• CABA: 24-48 horas</li>
                        <li>• GBA: 2-3 días hábiles</li>
                        <li>• Interior: 3-7 días hábiles</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <h4 className="text-purple-300 font-medium mb-2">Seguimiento</h4>
                      <p className="text-purple-200 text-sm">
                        Recibirás un código de seguimiento para rastrear tu pedido en tiempo real.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
