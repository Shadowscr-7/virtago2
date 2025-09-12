"use client"

import { motion } from "framer-motion"
import { FileText, TrendingUp, Calendar, CreditCard } from "lucide-react"

interface ClientStatsData {
  registrationDate: string
  lastPurchase: string
  totalPurchases: number
  creditLimit: number
  currencyCode: string
}

interface ClientStatsProps {
  clientData: ClientStatsData
}

export function ClientStats({ clientData }: ClientStatsProps) {
  const formatCurrency = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: currency === 'UYU' ? 'UYU' : currency === 'USD' ? 'USD' : 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
    return formatter.format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-UY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const daysSinceLastPurchase = Math.floor(
    (new Date().getTime() - new Date(clientData.lastPurchase).getTime()) / (1000 * 3600 * 24)
  )

  const membershipDays = Math.floor(
    (new Date().getTime() - new Date(clientData.registrationDate).getTime()) / (1000 * 3600 * 24)
  )

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-white/30 p-6 shadow-xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl border border-indigo-500/30">
          <FileText className="w-6 h-6 text-indigo-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Estadísticas del Cliente
        </h3>
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800 group hover:from-blue-100 hover:to-cyan-100 dark:hover:from-blue-900/30 dark:hover:to-cyan-900/30 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fecha de Registro
              </div>
              <div className="text-lg font-semibold text-blue-900 dark:text-blue-200">
                {formatDate(clientData.registrationDate)}
              </div>
              <div className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
                {membershipDays} días como cliente
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800 group hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-green-600 dark:text-green-400 font-medium mb-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Última Compra
              </div>
              <div className="text-lg font-semibold text-green-900 dark:text-green-200">
                {formatDate(clientData.lastPurchase)}
              </div>
              <div className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">
                {daysSinceLastPurchase === 0 ? 'Hoy' : `Hace ${daysSinceLastPurchase} días`}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800 group hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Total Compras
              </div>
              <div className="text-lg font-semibold text-purple-900 dark:text-purple-200">
                {formatCurrency(clientData.totalPurchases, clientData.currencyCode)}
              </div>
              <div className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">
                Volumen acumulado
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800 group hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-900/30 dark:hover:to-orange-900/30 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-amber-600 dark:text-amber-400 font-medium mb-1 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Límite de Crédito
              </div>
              <div className="text-lg font-semibold text-amber-900 dark:text-amber-200">
                {formatCurrency(clientData.creditLimit, clientData.currencyCode)}
              </div>
              <div className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">
                Crédito disponible
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
