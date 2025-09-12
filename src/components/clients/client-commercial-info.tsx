"use client"

import { motion } from "framer-motion"
import { CreditCard, Calendar, DollarSign } from "lucide-react"
import { StyledSelect } from "@/components/ui/styled-select"

interface ClientCommercialData {
  taxStatus: string
  paymentTerm: number
  creditLimit: number
  currencyCode: string
}

interface ClientCommercialInfoProps {
  clientData: ClientCommercialData
  isEditing: boolean
  onInputChange: (field: keyof ClientCommercialData, value: any) => void
}

export function ClientCommercialInfo({ clientData, isEditing, onInputChange }: ClientCommercialInfoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-white/30 p-6 shadow-xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
          <CreditCard className="w-6 h-6 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Información Comercial
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Situación Fiscal
          </label>
          <div className="relative h-14">
            <StyledSelect
              value={clientData.taxStatus}
              onChange={(value) => onInputChange('taxStatus', value)}
              disabled={!isEditing}
              options={[
                { value: "Contribuyente", label: "Contribuyente" },
                { value: "No Contribuyente", label: "No Contribuyente" },
                { value: "Exonerado", label: "Exonerado" }
              ]}
            />
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Plazo de Pago (días)
          </label>
          <div className="relative h-14">
            <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-hover:text-purple-500 z-10" />
            <input
              type="number"
              value={clientData.paymentTerm}
              onChange={(e) => onInputChange('paymentTerm', parseInt(e.target.value))}
              disabled={!isEditing}
              className="w-full h-full pl-12 pr-4 bg-white/80 dark:bg-slate-700/80 border-2 border-white/40 dark:border-slate-600/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:border-purple-400/40 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-lg shadow-purple-500/5"
              placeholder="30"
              min="0"
              max="365"
            />
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Límite de Crédito
          </label>
          <div className="relative h-14">
            <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-hover:text-purple-500 z-10" />
            <input
              type="number"
              value={clientData.creditLimit}
              onChange={(e) => onInputChange('creditLimit', parseInt(e.target.value) || 0)}
              disabled={!isEditing}
              className="w-full h-full pl-12 pr-4 bg-white/80 dark:bg-slate-700/80 border-2 border-white/40 dark:border-slate-600/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:border-purple-400/40 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-lg shadow-purple-500/5"
              placeholder="500000"
              min="0"
            />
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Moneda
          </label>
          <div className="relative h-14">
            <StyledSelect
              value={clientData.currencyCode}
              onChange={(value) => onInputChange('currencyCode', value)}
              disabled={!isEditing}
              options={[
                { value: "UYU", label: "Peso Uruguayo (UYU)" },
                { value: "USD", label: "Dólar Americano (USD)" },
                { value: "EUR", label: "Euro (EUR)" },
                { value: "ARS", label: "Peso Argentino (ARS)" },
                { value: "BRL", label: "Real Brasileño (BRL)" }
              ]}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
