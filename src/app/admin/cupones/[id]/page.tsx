"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Copy,
  QrCode,
  Calendar,
  DollarSign,
  Users,
  BarChart3,
  Package,
  Tag,
  Percent,
  CheckCircle,
  Clock,
  XCircle,
  Ticket,
  TrendingUp,
  TrendingDown,
  Download,
  Share2,
} from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { AdminLayout } from "@/components/admin/admin-layout";

interface CouponDetails {
  id: string;
  code: string;
  name: string;
  description: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  value: number;
  minOrderAmount?: number;
  maxUses?: number;
  currentUses: number;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED" | "USED_UP";
  createdAt: string;
  updatedAt: string;
  categories?: string[];
  products?: string[];
  usageHistory: {
    date: string;
    uses: number;
    orders: number;
    savings: number;
  }[];
  analytics: {
    totalSavings: number;
    totalOrders: number;
    conversionRate: number;
    averageOrderValue: number;
  };
}

// Mock data para un cupón
const mockCouponDetails: CouponDetails = {
  id: "1",
  code: "BLACKFRIDAY25",
  name: "Black Friday 25%",
  description: "Descuento especial del 25% para Black Friday. Válido para productos seleccionados de las categorías de electrónicos y ropa. Compra mínima de $50.000.",
  type: "PERCENTAGE",
  value: 25,
  minOrderAmount: 50000,
  maxUses: 1000,
  currentUses: 347,
  startDate: "2025-11-25",
  endDate: "2025-11-30",
  status: "ACTIVE",
  createdAt: "2025-11-01",
  updatedAt: "2025-11-15",
  categories: ["electronics", "clothing"],
  usageHistory: [
    { date: "2025-11-25", uses: 45, orders: 38, savings: 12450 },
    { date: "2025-11-26", uses: 67, orders: 59, savings: 18920 },
    { date: "2025-11-27", uses: 89, orders: 78, savings: 24670 },
    { date: "2025-11-28", uses: 123, orders: 108, savings: 35890 },
    { date: "2025-11-29", uses: 23, orders: 20, savings: 6780 },
  ],
  analytics: {
    totalSavings: 98710,
    totalOrders: 303,
    conversionRate: 87.3,
    averageOrderValue: 89450,
  },
};

export default function CouponDetailsPage() {
  const { themeColors } = useTheme();
  const router = useRouter();
  const params = useParams();
  const couponId = params.id as string;
  
  const [coupon, setCoupon] = useState<CouponDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCoupon = async () => {
      setLoading(true);
      // Simular carga
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCoupon(mockCouponDetails);
      setLoading(false);
    };

    loadCoupon();
  }, [couponId]);

  const getStatusIcon = (status: CouponDetails["status"]) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle className="w-5 h-5" />;
      case "INACTIVE":
        return <Clock className="w-5 h-5" />;
      case "EXPIRED":
        return <XCircle className="w-5 h-5" />;
      case "USED_UP":
        return <BarChart3 className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: CouponDetails["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "#10b981";
      case "INACTIVE":
        return "#f59e0b";
      case "EXPIRED":
        return "#ef4444";
      case "USED_UP":
        return "#6b7280";
    }
  };

  const getStatusLabel = (status: CouponDetails["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "Activo";
      case "INACTIVE":
        return "Inactivo";
      case "EXPIRED":
        return "Expirado";
      case "USED_UP":
        return "Agotado";
    }
  };

  const getTypeIcon = (type: CouponDetails["type"]) => {
    switch (type) {
      case "PERCENTAGE":
        return <Percent className="w-6 h-6" />;
      case "FIXED_AMOUNT":
        return <DollarSign className="w-6 h-6" />;
      case "FREE_SHIPPING":
        return <Ticket className="w-6 h-6" />;
    }
  };

  const getTypeLabel = (type: CouponDetails["type"]) => {
    switch (type) {
      case "PERCENTAGE":
        return "Porcentaje";
      case "FIXED_AMOUNT":
        return "Monto Fijo";
      case "FREE_SHIPPING":
        return "Envío Gratis";
    }
  };

  const getTypeColor = (type: CouponDetails["type"]) => {
    switch (type) {
      case "PERCENTAGE":
        return "#3b82f6";
      case "FIXED_AMOUNT":
        return "#10b981";
      case "FREE_SHIPPING":
        return "#8b5cf6";
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: themeColors.primary }}></div>
        </div>
      </AdminLayout>
    );
  }

  if (!coupon) {
    return (
      <AdminLayout>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4" style={{ color: themeColors.text.primary }}>
            Cupón no encontrado
          </h2>
          <button
            onClick={() => router.push("/admin/cupones")}
            className="px-4 py-2 rounded-lg"
            style={{
              backgroundColor: themeColors.primary,
              color: "white",
            }}
          >
            Volver a Cupones
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin/cupones")}
              className="p-2 rounded-xl transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: `${themeColors.surface}80`,
                color: themeColors.text.primary,
              }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: themeColors.text.primary }}>
                Detalles del Cupón
              </h1>
              <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                Dashboard → Cupones → Detalles del cupón
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
              style={{
                backgroundColor: `${themeColors.surface}80`,
                color: themeColors.text.primary,
                border: `1px solid ${themeColors.primary}30`,
              }}
            >
              <Share2 className="w-4 h-4" />
              Compartir
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
              style={{
                backgroundColor: `${themeColors.surface}80`,
                color: themeColors.text.primary,
                border: `1px solid ${themeColors.primary}30`,
              }}
            >
              <Download className="w-4 h-4" />
              Exportar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(`/admin/cupones/${couponId}/editar`)}
              className="px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
              style={{
                backgroundColor: `${themeColors.primary}20`,
                color: themeColors.primary,
                border: `1px solid ${themeColors.primary}30`,
              }}
            >
              <Edit className="w-4 h-4" />
              Editar
            </motion.button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cupón Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="backdrop-blur-xl p-6 rounded-2xl border"
              style={{
                backgroundColor: `${themeColors.surface}70`,
                borderColor: `${themeColors.primary}30`,
              }}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{
                      backgroundColor: `${getTypeColor(coupon.type)}20`,
                      color: getTypeColor(coupon.type),
                    }}
                  >
                    {getTypeIcon(coupon.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold font-mono" style={{ color: themeColors.text.primary }}>
                        {coupon.code}
                      </h2>
                      <button
                        onClick={() => copyToClipboard(coupon.code)}
                        className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
                        style={{
                          backgroundColor: `${themeColors.primary}20`,
                          color: themeColors.primary,
                        }}
                        title="Copiar código"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
                        style={{
                          backgroundColor: `${themeColors.secondary}20`,
                          color: themeColors.secondary,
                        }}
                        title="Generar QR"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="text-lg font-semibold mb-1" style={{ color: themeColors.text.primary }}>
                      {coupon.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div
                        className="px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-2"
                        style={{ backgroundColor: `${getStatusColor(coupon.status)}20`, color: getStatusColor(coupon.status) }}
                      >
                        {getStatusIcon(coupon.status)}
                        {getStatusLabel(coupon.status)}
                      </div>
                      <div
                        className="px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-2"
                        style={{ backgroundColor: `${getTypeColor(coupon.type)}20`, color: getTypeColor(coupon.type) }}
                      >
                        {getTypeIcon(coupon.type)}
                        {getTypeLabel(coupon.type)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold mb-2" style={{ color: themeColors.text.primary }}>
                  Descripción
                </h4>
                <p style={{ color: themeColors.text.secondary }}>
                  {coupon.description}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-xl" style={{ backgroundColor: `${themeColors.primary}10` }}>
                  <div className="text-2xl font-bold mb-1" style={{ color: themeColors.text.primary }}>
                    {coupon.type === "PERCENTAGE" ? `${coupon.value}%` : 
                     coupon.type === "FIXED_AMOUNT" ? `$${coupon.value}` : 
                     "Gratis"}
                  </div>
                  <div className="text-sm" style={{ color: themeColors.text.secondary }}>
                    Descuento
                  </div>
                </div>
                <div className="text-center p-4 rounded-xl" style={{ backgroundColor: `${themeColors.primary}10` }}>
                  <div className="text-2xl font-bold mb-1" style={{ color: themeColors.text.primary }}>
                    {coupon.currentUses}
                  </div>
                  <div className="text-sm" style={{ color: themeColors.text.secondary }}>
                    Usos actuales
                  </div>
                </div>
                <div className="text-center p-4 rounded-xl" style={{ backgroundColor: `${themeColors.primary}10` }}>
                  <div className="text-2xl font-bold mb-1" style={{ color: themeColors.text.primary }}>
                    {coupon.maxUses || "∞"}
                  </div>
                  <div className="text-sm" style={{ color: themeColors.text.secondary }}>
                    Límite de usos
                  </div>
                </div>
                <div className="text-center p-4 rounded-xl" style={{ backgroundColor: `${themeColors.primary}10` }}>
                  <div className="text-2xl font-bold mb-1" style={{ color: themeColors.text.primary }}>
                    ${coupon.minOrderAmount?.toLocaleString() || "0"}
                  </div>
                  <div className="text-sm" style={{ color: themeColors.text.secondary }}>
                    Compra mínima
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="backdrop-blur-xl p-6 rounded-2xl border"
              style={{
                backgroundColor: `${themeColors.surface}70`,
                borderColor: `${themeColors.primary}30`,
              }}
            >
              <h3 className="text-lg font-bold mb-6" style={{ color: themeColors.text.primary }}>
                Analytics del Cupón
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: "#10b98120" }}
                  >
                    <DollarSign className="w-6 h-6" style={{ color: "#10b981" }} />
                  </div>
                  <div className="text-2xl font-bold mb-1" style={{ color: themeColors.text.primary }}>
                    ${coupon.analytics.totalSavings.toLocaleString()}
                  </div>
                  <div className="text-sm" style={{ color: themeColors.text.secondary }}>
                    Ahorros Totales
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-500">+15%</span>
                  </div>
                </div>

                <div className="text-center">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: `${themeColors.primary}20` }}
                  >
                    <Package className="w-6 h-6" style={{ color: themeColors.primary }} />
                  </div>
                  <div className="text-2xl font-bold mb-1" style={{ color: themeColors.text.primary }}>
                    {coupon.analytics.totalOrders}
                  </div>
                  <div className="text-sm" style={{ color: themeColors.text.secondary }}>
                    Órdenes Totales
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-500">+28%</span>
                  </div>
                </div>

                <div className="text-center">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: `${themeColors.secondary}20` }}
                  >
                    <BarChart3 className="w-6 h-6" style={{ color: themeColors.secondary }} />
                  </div>
                  <div className="text-2xl font-bold mb-1" style={{ color: themeColors.text.primary }}>
                    {coupon.analytics.conversionRate}%
                  </div>
                  <div className="text-sm" style={{ color: themeColors.text.secondary }}>
                    Tasa Conversión
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <TrendingDown className="w-4 h-4 text-red-500" />
                    <span className="text-xs text-red-500">-3%</span>
                  </div>
                </div>

                <div className="text-center">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: "#3b82f620" }}
                  >
                    <Users className="w-6 h-6" style={{ color: "#3b82f6" }} />
                  </div>
                  <div className="text-2xl font-bold mb-1" style={{ color: themeColors.text.primary }}>
                    ${coupon.analytics.averageOrderValue.toLocaleString()}
                  </div>
                  <div className="text-sm" style={{ color: themeColors.text.secondary }}>
                    Orden Promedio
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-500">+8%</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Usage History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="backdrop-blur-xl rounded-2xl border overflow-hidden"
              style={{
                backgroundColor: `${themeColors.surface}70`,
                borderColor: `${themeColors.primary}30`,
              }}
            >
              <div className="p-6">
                <h3 className="text-lg font-bold mb-4" style={{ color: themeColors.text.primary }}>
                  Historial de Uso
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: `${themeColors.primary}10` }}>
                      <th className="text-left p-4 font-semibold" style={{ color: themeColors.text.primary }}>
                        Fecha
                      </th>
                      <th className="text-left p-4 font-semibold" style={{ color: themeColors.text.primary }}>
                        Usos
                      </th>
                      <th className="text-left p-4 font-semibold" style={{ color: themeColors.text.primary }}>
                        Órdenes
                      </th>
                      <th className="text-left p-4 font-semibold" style={{ color: themeColors.text.primary }}>
                        Ahorros
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupon.usageHistory.map((day, index) => (
                      <tr key={index} className="border-t" style={{ borderColor: `${themeColors.primary}20` }}>
                        <td className="p-4" style={{ color: themeColors.text.primary }}>
                          {new Date(day.date).toLocaleDateString()}
                        </td>
                        <td className="p-4 font-medium" style={{ color: themeColors.text.primary }}>
                          {day.uses}
                        </td>
                        <td className="p-4" style={{ color: themeColors.text.primary }}>
                          {day.orders}
                        </td>
                        <td className="p-4 font-semibold" style={{ color: themeColors.text.primary }}>
                          ${day.savings.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Validity Period */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="backdrop-blur-xl p-6 rounded-2xl border"
              style={{
                backgroundColor: `${themeColors.surface}70`,
                borderColor: `${themeColors.primary}30`,
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${themeColors.primary}20` }}
                >
                  <Calendar className="w-5 h-5" style={{ color: themeColors.primary }} />
                </div>
                <h3 className="text-lg font-bold" style={{ color: themeColors.text.primary }}>
                  Período de Validez
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm mb-1" style={{ color: themeColors.text.secondary }}>Fecha de inicio:</p>
                  <p className="font-medium" style={{ color: themeColors.text.primary }}>
                    {new Date(coupon.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: themeColors.text.secondary }}>Fecha de fin:</p>
                  <p className="font-medium" style={{ color: themeColors.text.primary }}>
                    {new Date(coupon.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: themeColors.text.secondary }}>Días restantes:</p>
                  <p className="font-medium" style={{ color: themeColors.text.primary }}>
                    {Math.max(0, Math.ceil((new Date(coupon.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} días
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Usage Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="backdrop-blur-xl p-6 rounded-2xl border"
              style={{
                backgroundColor: `${themeColors.surface}70`,
                borderColor: `${themeColors.primary}30`,
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${themeColors.secondary}20` }}
                >
                  <BarChart3 className="w-5 h-5" style={{ color: themeColors.secondary }} />
                </div>
                <h3 className="text-lg font-bold" style={{ color: themeColors.text.primary }}>
                  Progreso de Uso
                </h3>
              </div>
              
              {coupon.maxUses ? (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span style={{ color: themeColors.text.secondary }}>Progreso:</span>
                    <span className="font-medium" style={{ color: themeColors.text.primary }}>
                      {coupon.currentUses} / {coupon.maxUses}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div 
                      className="h-3 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((coupon.currentUses / coupon.maxUses) * 100, 100)}%`,
                        backgroundColor: getStatusColor(coupon.status)
                      }}
                    ></div>
                  </div>
                  <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                    {((coupon.currentUses / coupon.maxUses) * 100).toFixed(1)}% utilizado
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-2xl font-bold mb-2" style={{ color: themeColors.text.primary }}>
                    {coupon.currentUses}
                  </p>
                  <p style={{ color: themeColors.text.secondary }}>
                    Usos sin límite
                  </p>
                </div>
              )}
            </motion.div>

            {/* Categories */}
            {coupon.categories && coupon.categories.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="backdrop-blur-xl p-6 rounded-2xl border"
                style={{
                  backgroundColor: `${themeColors.surface}70`,
                  borderColor: `${themeColors.primary}30`,
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "#3b82f620" }}
                  >
                    <Tag className="w-5 h-5" style={{ color: "#3b82f6" }} />
                  </div>
                  <h3 className="text-lg font-bold" style={{ color: themeColors.text.primary }}>
                    Categorías Aplicables
                  </h3>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {coupon.categories.map((category, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-lg text-sm font-medium"
                      style={{
                        backgroundColor: `${themeColors.accent}20`,
                        color: themeColors.accent,
                      }}
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Metadata */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="backdrop-blur-xl p-6 rounded-2xl border"
              style={{
                backgroundColor: `${themeColors.surface}70`,
                borderColor: `${themeColors.primary}30`,
              }}
            >
              <h3 className="text-lg font-bold mb-4" style={{ color: themeColors.text.primary }}>
                Información del Sistema
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: themeColors.text.secondary }}>ID del cupón:</span>
                  <span className="font-mono" style={{ color: themeColors.text.primary }}>{coupon.id}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: themeColors.text.secondary }}>Creado:</span>
                  <span style={{ color: themeColors.text.primary }}>
                    {new Date(coupon.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: themeColors.text.secondary }}>Última actualización:</span>
                  <span style={{ color: themeColors.text.primary }}>
                    {new Date(coupon.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
