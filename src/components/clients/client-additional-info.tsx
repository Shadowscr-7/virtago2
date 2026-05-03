"use client";

import { motion } from "framer-motion";
import { Building, Phone, Mail, MapPin } from "lucide-react";
import { StyledSelect } from "@/components/ui/styled-select";
import { useTheme } from "@/contexts/theme-context";

interface ClientAdditionalData {
  paymentMethodCode: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  fiscalName: string;
  city: string;
  neighborhood: string;
  address: string;
  postalCode: string;
  country: string;
  observations: string;
}

interface ClientAdditionalInfoProps {
  clientData: ClientAdditionalData;
  isEditing: boolean;
  onInputChange: (field: keyof ClientAdditionalData, value: string) => void;
}

export function ClientAdditionalInfo({
  clientData,
  isEditing,
  onInputChange,
}: ClientAdditionalInfoProps) {
  const { themeColors } = useTheme();

  const inputClass =
    "w-full h-full px-4 rounded-xl border focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed placeholder-gray-400";

  const inputWithIconClass =
    "w-full h-full pl-10 pr-4 rounded-xl border focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed placeholder-gray-400";

  const inputStyle = {
    backgroundColor: "white",
    borderColor: themeColors.border,
    color: themeColors.text.primary,
  } as React.CSSProperties;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl border p-6 shadow-sm"
      style={{ borderColor: themeColors.border }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className="p-2.5 rounded-xl"
          style={{
            backgroundColor: themeColors.primary + "15",
            border: `1px solid ${themeColors.primary}30`,
          }}
        >
          <Building
            className="w-5 h-5"
            style={{ color: themeColors.primary }}
          />
        </div>
        <h2
          className="text-lg font-semibold"
          style={{ color: themeColors.text.primary }}
        >
          Información Adicional
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Método de Pago */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: themeColors.text.secondary }}
          >
            Método de Pago
          </label>
          <div className="relative h-11">
            <StyledSelect
              value={clientData.paymentMethodCode}
              onChange={(value) => onInputChange("paymentMethodCode", value)}
              disabled={!isEditing}
              options={[
                { value: "EFECTIVO", label: "Efectivo" },
                { value: "TRANSFERENCIA", label: "Transferencia Bancaria" },
                { value: "CREDITO", label: "Tarjeta de Crédito" },
                { value: "DEBITO", label: "Tarjeta de Débito" },
                { value: "CHEQUE", label: "Cheque" },
              ]}
            />
          </div>
        </div>

        {/* Nombre de Contacto */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: themeColors.text.secondary }}
          >
            Nombre de Contacto
          </label>
          <div className="relative h-11">
            <input
              type="text"
              value={clientData.contactName}
              onChange={(e) => onInputChange("contactName", e.target.value)}
              disabled={!isEditing}
              className={inputClass}
              style={inputStyle}
              placeholder="Nombre del contacto principal"
            />
          </div>
        </div>

        {/* Teléfono de Contacto */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: themeColors.text.secondary }}
          >
            Teléfono de Contacto
          </label>
          <div className="relative h-11">
            <Phone
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: themeColors.text.muted }}
            />
            <input
              type="text"
              value={clientData.contactPhone}
              onChange={(e) => onInputChange("contactPhone", e.target.value)}
              disabled={!isEditing}
              className={inputWithIconClass}
              style={inputStyle}
              placeholder="Teléfono del contacto"
            />
          </div>
        </div>

        {/* Email de Contacto */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: themeColors.text.secondary }}
          >
            Email de Contacto
          </label>
          <div className="relative h-11">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: themeColors.text.muted }}
            />
            <input
              type="email"
              value={clientData.contactEmail}
              onChange={(e) => onInputChange("contactEmail", e.target.value)}
              disabled={!isEditing}
              className={inputWithIconClass}
              style={inputStyle}
              placeholder="Email del contacto"
            />
          </div>
        </div>

        {/* Razón Social Fiscal */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: themeColors.text.secondary }}
          >
            Razón Social Fiscal
          </label>
          <div className="relative h-11">
            <input
              type="text"
              value={clientData.fiscalName}
              onChange={(e) => onInputChange("fiscalName", e.target.value)}
              disabled={!isEditing}
              className={inputClass}
              style={inputStyle}
              placeholder="Razón social para facturación"
            />
          </div>
        </div>

        {/* Ciudad */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: themeColors.text.secondary }}
          >
            Ciudad
          </label>
          <div className="relative h-11">
            <MapPin
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: themeColors.text.muted }}
            />
            <input
              type="text"
              value={clientData.city}
              onChange={(e) => onInputChange("city", e.target.value)}
              disabled={!isEditing}
              className={inputWithIconClass}
              style={inputStyle}
              placeholder="Ciudad"
            />
          </div>
        </div>

        {/* Barrio */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: themeColors.text.secondary }}
          >
            Barrio
          </label>
          <div className="relative h-11">
            <input
              type="text"
              value={clientData.neighborhood}
              onChange={(e) => onInputChange("neighborhood", e.target.value)}
              disabled={!isEditing}
              className={inputClass}
              style={inputStyle}
              placeholder="Barrio o zona"
            />
          </div>
        </div>

        {/* Dirección */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: themeColors.text.secondary }}
          >
            Dirección
          </label>
          <div className="relative h-11">
            <input
              type="text"
              value={clientData.address}
              onChange={(e) => onInputChange("address", e.target.value)}
              disabled={!isEditing}
              className={inputClass}
              style={inputStyle}
              placeholder="Dirección completa"
            />
          </div>
        </div>

        {/* Código Postal */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: themeColors.text.secondary }}
          >
            Código Postal
          </label>
          <div className="relative h-11">
            <input
              type="text"
              value={clientData.postalCode}
              onChange={(e) => onInputChange("postalCode", e.target.value)}
              disabled={!isEditing}
              className={inputClass}
              style={inputStyle}
              placeholder="Código postal"
            />
          </div>
        </div>

        {/* País */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: themeColors.text.secondary }}
          >
            País
          </label>
          <div className="relative h-11">
            <StyledSelect
              value={clientData.country}
              onChange={(value) => onInputChange("country", value)}
              disabled={!isEditing}
              options={[
                { value: "Uruguay", label: "Uruguay" },
                { value: "Argentina", label: "Argentina" },
                { value: "Brasil", label: "Brasil" },
                { value: "Chile", label: "Chile" },
                { value: "Paraguay", label: "Paraguay" },
                { value: "Colombia", label: "Colombia" },
                { value: "Perú", label: "Perú" },
              ]}
            />
          </div>
        </div>

        {/* Observaciones */}
        <div className="md:col-span-2">
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: themeColors.text.secondary }}
          >
            Observaciones
          </label>
          <textarea
            value={clientData.observations}
            onChange={(e) => onInputChange("observations", e.target.value)}
            disabled={!isEditing}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed placeholder-gray-400 resize-none"
            style={inputStyle}
            placeholder="Observaciones adicionales sobre el cliente, historial, notas importantes..."
          />
        </div>
      </div>
    </motion.div>
  );
}
