"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { StyledSwitch } from "@/components/ui/styled-switch";

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
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white/70 dark:bg-slate-800/70 rounded-2xl border border-white/30 p-6 shadow-xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl border border-orange-500/30">
          <AlertTriangle className="w-6 h-6 text-orange-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Estado del Cliente
        </h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 group hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-200">
          <div>
            <span className="text-green-700 dark:text-green-300 font-medium block">
              Cliente Activo
            </span>
            <span className="text-green-600/70 dark:text-green-400/70 text-xs">
              {clientData.isActive
                ? "Puede realizar compras"
                : "Sin acceso a compras"}
            </span>
          </div>
          <StyledSwitch
            checked={clientData.isActive}
            onChange={(checked) => onInputChange("isActive", checked)}
            disabled={!isEditing}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 group hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200">
          <div>
            <span className="text-red-700 dark:text-red-300 font-medium block">
              Cliente Bloqueado
            </span>
            <span className="text-red-600/70 dark:text-red-400/70 text-xs">
              {clientData.isBlocked
                ? "Acceso restringido"
                : "Sin restricciones"}
            </span>
          </div>
          <StyledSwitch
            checked={clientData.isBlocked}
            onChange={(checked) => onInputChange("isBlocked", checked)}
            disabled={!isEditing}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800 group hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-200">
          <div>
            <span className="text-purple-700 dark:text-purple-300 font-medium block">
              Cliente VIP
            </span>
            <span className="text-purple-600/70 dark:text-purple-400/70 text-xs">
              {clientData.isVip ? "Beneficios especiales" : "Cliente estándar"}
            </span>
          </div>
          <StyledSwitch
            checked={clientData.isVip}
            onChange={(checked) => onInputChange("isVip", checked)}
            disabled={!isEditing}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 group hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-all duration-200">
          <div>
            <span className="text-yellow-700 dark:text-yellow-300 font-medium block">
              Tiene Deuda
            </span>
            <span className="text-yellow-600/70 dark:text-yellow-400/70 text-xs">
              {clientData.hasDebt
                ? "Revisar pagos pendientes"
                : "Al día con pagos"}
            </span>
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
