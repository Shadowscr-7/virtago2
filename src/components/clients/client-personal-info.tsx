"use client";

import { motion } from "framer-motion";
import { User, Building, FileText, Mail, Phone } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";

interface ClientData {
  name: string;
  businessName: string;
  rut: string;
  email: string;
  phone: string;
  phoneSecond: string;
}

interface ClientPersonalInfoProps {
  clientData: ClientData;
  isEditing: boolean;
  onInputChange: (field: keyof ClientData, value: string) => void;
}

export function ClientPersonalInfo({
  clientData,
  isEditing,
  onInputChange,
}: ClientPersonalInfoProps) {
  const { themeColors } = useTheme();

  const inputClass =
    "w-full h-full pl-12 pr-4 rounded-xl border focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed placeholder-gray-400";

  const inputStyle = {
    backgroundColor: "white",
    borderColor: themeColors.border,
    color: themeColors.text.primary,
  } as React.CSSProperties;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
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
          <User className="w-5 h-5" style={{ color: themeColors.primary }} />
        </div>
        <h2
          className="text-lg font-semibold"
          style={{ color: themeColors.text.primary }}
        >
          Información Personal
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Nombre Comercial */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: themeColors.text.secondary }}
          >
            Nombre Comercial
          </label>
          <div className="relative h-11">
            <User
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: themeColors.text.muted }}
            />
            <input
              type="text"
              value={clientData.name}
              onChange={(e) => onInputChange("name", e.target.value)}
              disabled={!isEditing}
              className={inputClass}
              style={inputStyle}
              placeholder="Nombre del cliente"
            />
          </div>
        </div>

        {/* Razón Social */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: themeColors.text.secondary }}
          >
            Razón Social
          </label>
          <div className="relative h-11">
            <Building
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: themeColors.text.muted }}
            />
            <input
              type="text"
              value={clientData.businessName}
              onChange={(e) => onInputChange("businessName", e.target.value)}
              disabled={!isEditing}
              className={inputClass}
              style={inputStyle}
              placeholder="Razón social completa"
            />
          </div>
        </div>

        {/* RUT */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: themeColors.text.secondary }}
          >
            RUT
          </label>
          <div className="relative h-11">
            <FileText
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: themeColors.text.muted }}
            />
            <input
              type="text"
              value={clientData.rut}
              onChange={(e) => onInputChange("rut", e.target.value)}
              disabled={!isEditing}
              className={inputClass}
              style={inputStyle}
              placeholder="12.345.678.901"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: themeColors.text.secondary }}
          >
            Email
          </label>
          <div className="relative h-11">
            <Mail
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: themeColors.text.muted }}
            />
            <input
              type="email"
              value={clientData.email}
              onChange={(e) => onInputChange("email", e.target.value)}
              disabled={!isEditing}
              className={inputClass}
              style={inputStyle}
              placeholder="contacto@empresa.com"
            />
          </div>
        </div>

        {/* Teléfono Principal */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: themeColors.text.secondary }}
          >
            Teléfono Principal
          </label>
          <div className="relative h-11">
            <Phone
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: themeColors.text.muted }}
            />
            <input
              type="tel"
              value={clientData.phone}
              onChange={(e) => onInputChange("phone", e.target.value)}
              disabled={!isEditing}
              className={inputClass}
              style={inputStyle}
              placeholder="+598 99 123 456"
            />
          </div>
        </div>

        {/* Teléfono Secundario */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: themeColors.text.secondary }}
          >
            Teléfono Secundario
          </label>
          <div className="relative h-11">
            <Phone
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: themeColors.text.muted }}
            />
            <input
              type="tel"
              value={clientData.phoneSecond}
              onChange={(e) => onInputChange("phoneSecond", e.target.value)}
              disabled={!isEditing}
              className={inputClass}
              style={inputStyle}
              placeholder="+598 99 765 432"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
