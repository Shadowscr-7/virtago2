"use client"

import { motion } from "framer-motion"
import { Building, Phone, Mail, MapPin } from "lucide-react"
import { StyledSelect } from "@/components/ui/styled-select"

interface ClientAdditionalData {
  paymentMethodCode: string
  contactName: string
  contactPhone: string
  contactEmail: string
  fiscalName: string
  city: string
  neighborhood: string
  address: string
  postalCode: string
  country: string
  observations: string
}

interface ClientAdditionalInfoProps {
  clientData: ClientAdditionalData
  isEditing: boolean
  onInputChange: (field: keyof ClientAdditionalData, value: string) => void
}

export function ClientAdditionalInfo({ clientData, isEditing, onInputChange }: ClientAdditionalInfoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-white/30 p-6 shadow-xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/30">
          <Building className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Información Adicional
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Método de Pago
          </label>
          <div className="relative h-14">
            <StyledSelect
              value={clientData.paymentMethodCode}
              onChange={(value) => onInputChange('paymentMethodCode', value)}
              disabled={!isEditing}
              options={[
                { value: "EFECTIVO", label: "💵 Efectivo" },
                { value: "TRANSFERENCIA", label: "🏦 Transferencia Bancaria" },
                { value: "CREDITO", label: "💳 Tarjeta de Crédito" },
                { value: "DEBITO", label: "💸 Tarjeta de Débito" },
                { value: "CHEQUE", label: "📝 Cheque" }
              ]}
            />
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Nombre de Contacto
          </label>
          <div className="relative h-14">
            <input
              type="text"
              value={clientData.contactName}
              onChange={(e) => onInputChange('contactName', e.target.value)}
              disabled={!isEditing}
              className="w-full h-full px-4 bg-white/80 dark:bg-slate-700/80 border-2 border-white/40 dark:border-slate-600/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:border-purple-400/40 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-lg shadow-purple-500/5"
              placeholder="Nombre del contacto principal"
            />
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            <span className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-purple-500" />
              Teléfono de Contacto
            </span>
          </label>
          <div className="relative h-14">
            <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-500/60" />
            <input
              type="text"
              value={clientData.contactPhone}
              onChange={(e) => onInputChange('contactPhone', e.target.value)}
              disabled={!isEditing}
              className="w-full h-full px-4 pl-12 bg-white/80 dark:bg-slate-700/80 border-2 border-white/40 dark:border-slate-600/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:border-purple-400/40 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-lg shadow-purple-500/5"
              placeholder="Teléfono del contacto"
            />
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            <span className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-500" />
              Email de Contacto
            </span>
          </label>
          <div className="relative h-14">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-500/60" />
            <input
              type="email"
              value={clientData.contactEmail}
              onChange={(e) => onInputChange('contactEmail', e.target.value)}
              disabled={!isEditing}
              className="w-full h-full px-4 pl-12 bg-white/80 dark:bg-slate-700/80 border-2 border-white/40 dark:border-slate-600/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:border-purple-400/40 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-lg shadow-purple-500/5"
              placeholder="Email del contacto"
            />
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Razón Social Fiscal
          </label>
          <div className="relative h-14">
            <input
              type="text"
              value={clientData.fiscalName}
              onChange={(e) => onInputChange('fiscalName', e.target.value)}
              disabled={!isEditing}
              className="w-full h-full px-4 bg-white/80 dark:bg-slate-700/80 border-2 border-white/40 dark:border-slate-600/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:border-purple-400/40 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-lg shadow-purple-500/5"
              placeholder="Razón social para facturación"
            />
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-500" />
              Ciudad
            </span>
          </label>
          <div className="relative h-14">
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-500/60" />
            <input
              type="text"
              value={clientData.city}
              onChange={(e) => onInputChange('city', e.target.value)}
              disabled={!isEditing}
              className="w-full h-full px-4 pl-12 bg-white/80 dark:bg-slate-700/80 border-2 border-white/40 dark:border-slate-600/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:border-purple-400/40 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-lg shadow-purple-500/5"
              placeholder="Ciudad"
            />
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Barrio
          </label>
          <div className="relative h-14">
            <input
              type="text"
              value={clientData.neighborhood}
              onChange={(e) => onInputChange('neighborhood', e.target.value)}
              disabled={!isEditing}
              className="w-full h-full px-4 bg-white/80 dark:bg-slate-700/80 border-2 border-white/40 dark:border-slate-600/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:border-purple-400/40 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-lg shadow-purple-500/5"
              placeholder="Barrio o zona"
            />
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Dirección
          </label>
          <div className="relative h-14">
            <input
              type="text"
              value={clientData.address}
              onChange={(e) => onInputChange('address', e.target.value)}
              disabled={!isEditing}
              className="w-full h-full px-4 bg-white/80 dark:bg-slate-700/80 border-2 border-white/40 dark:border-slate-600/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:border-purple-400/40 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-lg shadow-purple-500/5"
              placeholder="Dirección completa"
            />
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Código Postal
          </label>
          <div className="relative h-14">
            <input
              type="text"
              value={clientData.postalCode}
              onChange={(e) => onInputChange('postalCode', e.target.value)}
              disabled={!isEditing}
              className="w-full h-full px-4 bg-white/80 dark:bg-slate-700/80 border-2 border-white/40 dark:border-slate-600/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:border-purple-400/40 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-lg shadow-purple-500/5"
              placeholder="Código postal"
            />
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            País
          </label>
          <div className="relative h-14">
            <StyledSelect
              value={clientData.country}
              onChange={(value) => onInputChange('country', value)}
              disabled={!isEditing}
              options={[
                { value: "Uruguay", label: "🇺🇾 Uruguay" },
                { value: "Argentina", label: "🇦🇷 Argentina" },
                { value: "Brasil", label: "🇧🇷 Brasil" },
                { value: "Chile", label: "🇨🇱 Chile" },
                { value: "Paraguay", label: "🇵🇾 Paraguay" },
                { value: "Colombia", label: "🇨🇴 Colombia" },
                { value: "Perú", label: "🇵🇪 Perú" }
              ]}
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Observaciones
          </label>
          <div className="relative">
            <textarea
              value={clientData.observations}
              onChange={(e) => onInputChange('observations', e.target.value)}
              disabled={!isEditing}
              rows={4}
              className="w-full px-4 py-3 bg-white/80 dark:bg-slate-700/80 border-2 border-white/40 dark:border-slate-600/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:border-purple-400/40 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-lg shadow-purple-500/5 resize-none"
              placeholder="Observaciones adicionales sobre el cliente, historial, notas importantes..."
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
