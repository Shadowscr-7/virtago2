"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  CreditCard, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit3, 
  Check,
  AlertCircle,
  Calendar,
  Lock,
  Building
} from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import Link from "next/link"

export default function MetodosPagoPage() {
  const { user } = useAuthStore()
  const [showAddCard, setShowAddCard] = useState(false)
  const [cards, setCards] = useState([
    {
      id: 1,
      type: "visa",
      last4: "4532",
      expiryMonth: "12",
      expiryYear: "26",
      holderName: "María González",
      isDefault: true
    },
    {
      id: 2,
      type: "mastercard",
      last4: "8765",
      expiryMonth: "08",
      expiryYear: "25",
      holderName: "María González",
      isDefault: false
    }
  ])
  const [newCard, setNewCard] = useState({
    number: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    holderName: "",
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
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Acceso Denegado
            </h1>
            <p className="text-muted-foreground mb-6">Debes iniciar sesión para gestionar métodos de pago</p>
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

  const getCardIcon = (type: string) => {
    const icons = {
      visa: "🔵",
      mastercard: "🟠",
      amex: "🟦",
      default: "💳"
    }
    return icons[type as keyof typeof icons] || icons.default
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const addCard = () => {
    const card = {
      id: Date.now(),
      type: newCard.number.startsWith('4') ? 'visa' : 'mastercard',
      last4: newCard.number.slice(-4),
      expiryMonth: newCard.expiryMonth,
      expiryYear: newCard.expiryYear,
      holderName: newCard.holderName,
      isDefault: newCard.isDefault
    }
    
    if (newCard.isDefault) {
      setCards(prev => prev.map(c => ({ ...c, isDefault: false })))
    }
    
    setCards(prev => [...prev, card])
    setNewCard({
      number: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      holderName: "",
      isDefault: false
    })
    setShowAddCard(false)
  }

  const removeCard = (id: number) => {
    setCards(prev => prev.filter(card => card.id !== id))
  }

  const setAsDefault = (id: number) => {
    setCards(prev => prev.map(card => ({
      ...card,
      isDefault: card.id === id
    })))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-6">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
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
              className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4"
            >
              Métodos de Pago
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-300"
            >
              Gestiona tus tarjetas de crédito y débito para realizar compras
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Lista de tarjetas */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Tus Tarjetas</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddCard(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Agregar
                </motion.button>
              </div>

              <div className="space-y-3">
                {cards.map((card, index) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className={`relative p-6 rounded-2xl border transition-all ${
                      card.isDefault 
                        ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30' 
                        : 'bg-white/10 border-white/20 hover:bg-white/15'
                    }`}
                  >
                    {card.isDefault && (
                      <div className="absolute top-4 right-4">
                        <span className="px-2 py-1 text-xs bg-blue-500 text-white rounded-full">
                          Principal
                        </span>
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getCardIcon(card.type)}</span>
                        <div>
                          <p className="text-white font-medium">
                            •••• •••• •••• {card.last4}
                          </p>
                          <p className="text-gray-300 text-sm capitalize">
                            {card.type} • {card.expiryMonth}/{card.expiryYear}
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-300 text-sm mb-4">{card.holderName}</p>

                    <div className="flex gap-2">
                      {!card.isDefault && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setAsDefault(card.id)}
                          className="flex items-center gap-1 px-3 py-1 text-xs bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 hover:text-white transition-all"
                        >
                          <Check className="w-3 h-3" />
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
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => removeCard(card.id)}
                        className="flex items-center gap-1 px-3 py-1 text-xs bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 hover:text-red-200 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                        Eliminar
                      </motion.button>
                    </div>
                  </motion.div>
                ))}

                {cards.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <CreditCard className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No tienes tarjetas agregadas</p>
                    <p className="text-gray-500 text-sm">Agrega una tarjeta para realizar compras</p>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Formulario agregar tarjeta */}
            {showAddCard && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
              >
                <h3 className="text-xl font-semibold text-white mb-6">Agregar Nueva Tarjeta</h3>
                
                <form onSubmit={(e) => { e.preventDefault(); addCard(); }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Número de tarjeta
                    </label>
                    <input
                      type="text"
                      value={formatCardNumber(newCard.number)}
                      onChange={(e) => setNewCard(prev => ({ ...prev, number: e.target.value.replace(/\s/g, '') }))}
                      maxLength={19}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Mes
                      </label>
                      <select
                        value={newCard.expiryMonth}
                        onChange={(e) => setNewCard(prev => ({ ...prev, expiryMonth: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Mes</option>
                        {Array.from({ length: 12 }, (_, i) => {
                          const month = (i + 1).toString().padStart(2, '0')
                          return (
                            <option key={month} value={month} className="bg-slate-800">
                              {month}
                            </option>
                          )
                        })}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Año
                      </label>
                      <select
                        value={newCard.expiryYear}
                        onChange={(e) => setNewCard(prev => ({ ...prev, expiryYear: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Año</option>
                        {Array.from({ length: 10 }, (_, i) => {
                          const year = (new Date().getFullYear() + i).toString().slice(-2)
                          return (
                            <option key={year} value={year} className="bg-slate-800">
                              {year}
                            </option>
                          )
                        })}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={newCard.cvv}
                      onChange={(e) => setNewCard(prev => ({ ...prev, cvv: e.target.value }))}
                      maxLength={4}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="123"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Nombre del titular
                    </label>
                    <input
                      type="text"
                      value={newCard.holderName}
                      onChange={(e) => setNewCard(prev => ({ ...prev, holderName: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nombre como aparece en la tarjeta"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={newCard.isDefault}
                      onChange={(e) => setNewCard(prev => ({ ...prev, isDefault: e.target.checked }))}
                      className="w-4 h-4 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isDefault" className="text-sm text-gray-200">
                      Establecer como tarjeta principal
                    </label>
                  </div>

                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-blue-200 text-sm flex items-start gap-2">
                      <Lock className="w-4 h-4 mt-0.5" />
                      Tu información está protegida con encriptación de extremo a extremo. 
                      No almacenamos tu número completo ni CVV.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setShowAddCard(false)}
                      className="px-6 py-3 bg-white/10 text-gray-300 font-medium rounded-lg hover:bg-white/20 hover:text-white transition-all border border-white/20"
                    >
                      Cancelar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all"
                    >
                      <CreditCard className="w-4 h-4" />
                      Agregar Tarjeta
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Información adicional */}
            {!showAddCard && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-6"
              >
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Información de Facturación
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Empresa:</span>
                      <span className="text-white">{user.company}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Email:</span>
                      <span className="text-white">{user.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Dirección:</span>
                      <span className="text-white">Av. Corrientes 1234</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Información Importante
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Las tarjetas están protegidas con encriptación SSL</li>
                    <li>• Solo almacenamos los últimos 4 dígitos</li>
                    <li>• Puedes cambiar tu tarjeta principal en cualquier momento</li>
                    <li>• Los pagos se procesan de forma segura</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
