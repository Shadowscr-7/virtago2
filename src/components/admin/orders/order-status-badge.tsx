"use client";

import { Clock, Package, Truck, CheckCircle, XCircle } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";

interface OrderStatusBadgeProps {
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  size?: "sm" | "md" | "lg";
}

export function OrderStatusBadge({ status, size = "md" }: OrderStatusBadgeProps) {
  const { themeColors } = useTheme();

  const getStatusIcon = () => {
    const iconSize = size === "sm" ? "w-3 h-3" : size === "lg" ? "w-5 h-5" : "w-4 h-4";
    
    switch (status) {
      case "PENDING":
        return <Clock className={iconSize} />;
      case "PROCESSING":
        return <Package className={iconSize} />;
      case "SHIPPED":
        return <Truck className={iconSize} />;
      case "DELIVERED":
        return <CheckCircle className={iconSize} />;
      case "CANCELLED":
        return <XCircle className={iconSize} />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "PENDING":
        return "#f59e0b"; // yellow
      case "PROCESSING":
        return "#3b82f6"; // blue
      case "SHIPPED":
        return "#8b5cf6"; // purple
      case "DELIVERED":
        return "#10b981"; // green
      case "CANCELLED":
        return "#ef4444"; // red
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case "PENDING":
        return "Pendiente";
      case "PROCESSING":
        return "Procesando";
      case "SHIPPED":
        return "Enviado";
      case "DELIVERED":
        return "Entregado";
      case "CANCELLED":
        return "Cancelado";
    }
  };

  const paddingClass = size === "sm" ? "px-2 py-1" : size === "lg" ? "px-4 py-2" : "px-3 py-1";
  const textSize = size === "sm" ? "text-xs" : size === "lg" ? "text-sm" : "text-xs";

  return (
    <div className={`flex items-center gap-2 ${paddingClass} rounded-lg`} style={{ backgroundColor: `${getStatusColor()}20` }}>
      <div style={{ color: getStatusColor() }}>
        {getStatusIcon()}
      </div>
      <span className={`${textSize} font-medium`} style={{ color: getStatusColor() }}>
        {getStatusLabel()}
      </span>
    </div>
  );
}

export default OrderStatusBadge;
