"use client";

import { motion } from "framer-motion";
import { ShieldAlert, Star, AlertCircle, CheckCircle } from "lucide-react";
import { StyledSwitch } from "@/components/ui/styled-switch";
import { useTheme } from "@/contexts/theme-context";

interface ClientStatusData {
  isActive: boolean;
  isBlocked: boolean;
  isVip: boolean;
  hasDebt: boolean;
}

interface ClientStatusPanelProps {
  clientData: ClientStatusData;
  isEditing: boolean;
  onInputChange: (field: keyof ClientStatusData, value: boolean) => void;
}

export function ClientStatusPanel({
  clientData,
  isEditing,
  onInputChange,
}: ClientStatusPanelProps) {
  const { themeColors } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
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
          <ShieldAlert
            className="w-5 h-5"
            style={{ color: themeColors.primary }}
          />
        </div>
        <h3
          className="text-lg font-semibold"
          style={{ color: themeColors.text.primary }}
        >
          Estado del Cliente
        </h3>
      </div>

      <div className="space-y-3">
        {/* Activo */}
        <div
          className="flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200"
          style={{
            backgroundColor: clientData.isActive ? "#f0fdf4" : "#f9fafb",
            borderColor: clientData.isActive ? "#bbf7d0" : themeColors.border,
          }}
        >
          <div className="flex items-center gap-3">
            <CheckCircle
              className="w-4 h-4"
              style={{ color: clientData.isActive ? "#16a34a" : themeColors.text.muted }}
            />
            <div>
              <span
                className="text-sm font-medium block"
                style={{ color: clientData.isActive ? "#15803d" : themeColors.text.primary }}
              >
                Cliente Activo
              </span>
              <span className="text-xs" style={{ color: themeColors.text.muted }}>
                {clientData.isActive ? "Puede realizar compras" : "Sin acceso a compras"}
              </span>
            </div>
          </div>
          <StyledSwitch
            checked={clientData.isActive}
            onChange={(checked) => onInputChange("isActive", checked)}
            disabled={!isEditing}
          />
        </div>

        {/* Bloqueado */}
        <div
          className="flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200"
          style={{
            backgroundColor: clientData.isBlocked ? "#fff1f2" : "#f9fafb",
            borderColor: clientData.isBlocked ? "#fecdd3" : themeColors.border,
          }}
        >
          <div className="flex items-center gap-3">
            <AlertCircle
              className="w-4 h-4"
              style={{ color: clientData.isBlocked ? themeColors.primary : themeColors.text.muted }}
            />
            <div>
              <span
                className="text-sm font-medium block"
                style={{ color: clientData.isBlocked ? themeColors.primary : themeColors.text.primary }}
              >
                Cliente Bloqueado
              </span>
              <span className="text-xs" style={{ color: themeColors.text.muted }}>
                {clientData.isBlocked ? "Acceso restringido" : "Sin restricciones"}
              </span>
            </div>
          </div>
          <StyledSwitch
            checked={clientData.isBlocked}
            onChange={(checked) => onInputChange("isBlocked", checked)}
            disabled={!isEditing}
          />
        </div>

        {/* VIP */}
        <div
          className="flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200"
          style={{
            backgroundColor: clientData.isVip ? "#fffbeb" : "#f9fafb",
            borderColor: clientData.isVip ? "#fde68a" : themeColors.border,
          }}
        >
          <div className="flex items-center gap-3">
            <Star
              className="w-4 h-4"
              style={{ color: clientData.isVip ? "#d97706" : themeColors.text.muted }}
              fill={clientData.isVip ? "#d97706" : "none"}
            />
            <div>
              <span
                className="text-sm font-medium block"
                style={{ color: clientData.isVip ? "#92400e" : themeColors.text.primary }}
              >
                Cliente VIP
              </span>
              <span className="text-xs" style={{ color: themeColors.text.muted }}>
                {clientData.isVip ? "Beneficios especiales" : "Cliente estándar"}
              </span>
            </div>
          </div>
          <StyledSwitch
            checked={clientData.isVip}
            onChange={(checked) => onInputChange("isVip", checked)}
            disabled={!isEditing}
          />
        </div>

        {/* Tiene Deuda */}
        <div
          className="flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200"
          style={{
            backgroundColor: clientData.hasDebt ? "#fefce8" : "#f9fafb",
            borderColor: clientData.hasDebt ? "#fef08a" : themeColors.border,
          }}
        >
          <div className="flex items-center gap-3">
            <AlertCircle
              className="w-4 h-4"
              style={{ color: clientData.hasDebt ? "#ca8a04" : themeColors.text.muted }}
            />
            <div>
              <span
                className="text-sm font-medium block"
                style={{ color: clientData.hasDebt ? "#854d0e" : themeColors.text.primary }}
              >
                Tiene Deuda
              </span>
              <span className="text-xs" style={{ color: themeColors.text.muted }}>
                {clientData.hasDebt ? "Revisar pagos pendientes" : "Al día con pagos"}
              </span>
            </div>
          </div>
          <StyledSwitch
            checked={clientData.hasDebt}
            onChange={(checked) => onInputChange("hasDebt", checked)}
            disabled={!isEditing}
          />
        </div>
      </div>
    </motion.div>
  );
}
