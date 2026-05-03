"use client";

import { motion } from "framer-motion";
import { BarChart2, TrendingUp, Calendar, CreditCard } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";

interface ClientStatsData {
  registrationDate: string;
  lastPurchase: string;
  totalPurchases: number;
  creditLimit: number;
  currencyCode: string;
}

interface ClientStatsProps {
  clientData: ClientStatsData;
}

export function ClientStats({ clientData }: ClientStatsProps) {
  const { themeColors } = useTheme();

  const formatCurrency = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: currency === "UYU" ? "UYU" : currency === "USD" ? "USD" : "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return formatter.format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("es-UY", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const daysSinceLastPurchase = Math.floor(
    (new Date().getTime() - new Date(clientData.lastPurchase).getTime()) /
      (1000 * 3600 * 24),
  );

  const membershipDays = Math.floor(
    (new Date().getTime() - new Date(clientData.registrationDate).getTime()) /
      (1000 * 3600 * 24),
  );

  const statItems = [
    {
      icon: <Calendar className="w-4 h-4" style={{ color: themeColors.primary }} />,
      label: "Fecha de Registro",
      value: formatDate(clientData.registrationDate),
      sub: `${membershipDays} días como cliente`,
    },
    {
      icon: <Calendar className="w-4 h-4" style={{ color: themeColors.primary }} />,
      label: "Última Compra",
      value: formatDate(clientData.lastPurchase),
      sub: daysSinceLastPurchase === 0 ? "Hoy" : `Hace ${daysSinceLastPurchase} días`,
    },
    {
      icon: <TrendingUp className="w-4 h-4" style={{ color: themeColors.primary }} />,
      label: "Total Compras",
      value: formatCurrency(clientData.totalPurchases, clientData.currencyCode),
      sub: "Volumen acumulado",
    },
    {
      icon: <CreditCard className="w-4 h-4" style={{ color: themeColors.primary }} />,
      label: "Límite de Crédito",
      value: formatCurrency(clientData.creditLimit, clientData.currencyCode),
      sub: "Crédito disponible",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
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
          <BarChart2
            className="w-5 h-5"
            style={{ color: themeColors.primary }}
          />
        </div>
        <h3
          className="text-lg font-semibold"
          style={{ color: themeColors.text.primary }}
        >
          Estadísticas del Cliente
        </h3>
      </div>

      <div className="space-y-3">
        {statItems.map((item, i) => (
          <div
            key={i}
            className="p-3.5 rounded-xl border transition-all duration-200 hover:border-red-200"
            style={{
              backgroundColor: "#fafafa",
              borderColor: themeColors.border,
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              {item.icon}
              <span
                className="text-xs font-medium"
                style={{ color: themeColors.text.secondary }}
              >
                {item.label}
              </span>
            </div>
            <div
              className="text-base font-semibold"
              style={{ color: themeColors.text.primary }}
            >
              {item.value}
            </div>
            <div
              className="text-xs mt-0.5"
              style={{ color: themeColors.text.muted }}
            >
              {item.sub}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
