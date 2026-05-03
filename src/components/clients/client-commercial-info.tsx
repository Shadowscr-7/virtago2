"use client";

import { motion } from "framer-motion";
import { CreditCard, Calendar, DollarSign } from "lucide-react";
import { StyledSelect } from "@/components/ui/styled-select";
import { useTheme } from "@/contexts/theme-context";

interface ClientCommercialData {
  taxStatus: string;
  paymentTerm: number;
  creditLimit: number;
  currencyCode: string;
}

interface ClientCommercialInfoProps {
  clientData: ClientCommercialData;
  isEditing: boolean;
  onInputChange: (
    field: keyof ClientCommercialData,
    value: string | number,
  ) => void;
}

export function ClientCommercialInfo({
  clientData,
  isEditing,
  onInputChange,
}: ClientCommercialInfoProps) {
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
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl border p-6 shadow-sm overflow-visible"
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
          <CreditCard
            className="w-5 h-5"
            style={{ color: themeColors.primary }}
          />
        </div>
        <h2
          className="text-lg font-semibold"
          style={{ color: themeColors.text.primary }}
        >
          Información Comercial
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Situación Fiscal */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: themeColors.text.secondary }}
          >
            Situación Fiscal
          </label>
          <div className="relative h-11">
            <StyledSelect
              value={clientData.taxStatus}
              onChange={(value) => onInputChange("taxStatus", value)}
              disabled={!isEditing}
              options={[
                { value: "Contribuyente", label: "Contribuyente" },
                { value: "No Contribuyente", label: "No Contribuyente" },
                { value: "Exonerado", label: "Exonerado" },
              ]}
            />
          </div>
        </div>

        {/* Plazo de Pago */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: themeColors.text.secondary }}
          >
            Plazo de Pago (días)
          </label>
          <div className="relative h-11">
            <Calendar
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: themeColors.text.muted }}
            />
            <input
              type="number"
              value={clientData.paymentTerm}
              onChange={(e) =>
                onInputChange("paymentTerm", parseInt(e.target.value))
              }
              disabled={!isEditing}
              className={inputClass}
              style={inputStyle}
              placeholder="30"
              min="0"
              max="365"
            />
          </div>
        </div>

        {/* Límite de Crédito */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: themeColors.text.secondary }}
          >
            Límite de Crédito
          </label>
          <div className="relative h-11">
            <DollarSign
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: themeColors.text.muted }}
            />
            <input
              type="number"
              value={clientData.creditLimit}
              onChange={(e) =>
                onInputChange("creditLimit", parseInt(e.target.value) || 0)
              }
              disabled={!isEditing}
              className={inputClass}
              style={inputStyle}
              placeholder="500000"
              min="0"
            />
          </div>
        </div>

        {/* Moneda */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: themeColors.text.secondary }}
          >
            Moneda
          </label>
          <div className="relative h-11 z-10">
            <StyledSelect
              value={clientData.currencyCode}
              onChange={(value) => onInputChange("currencyCode", value)}
              disabled={!isEditing}
              options={[
                { value: "UYU", label: "Peso Uruguayo (UYU)" },
                { value: "USD", label: "Dólar Americano (USD)" },
                { value: "EUR", label: "Euro (EUR)" },
                { value: "ARS", label: "Peso Argentino (ARS)" },
                { value: "BRL", label: "Real Brasileño (BRL)" },
              ]}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
