"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Copy,
  QrCode,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Ticket,
  Users,
  BarChart3,
  Percent,
  Edit,
  Trash2,
} from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { AdminLayout } from "@/components/admin/admin-layout";
import { EnhancedSelect } from "@/components/ui/enhanced-select";

interface Coupon {
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
  categories?: string[];
  products?: string[];
}

// Mock data
const mockCoupons: Coupon[] = [
  {
    id: "1",
    code: "BLACKFRIDAY25",
    name: "Black Friday 25%",
    description: "Descuento especial del 25% para Black Friday",
    type: "PERCENTAGE",
    value: 25,
    minOrderAmount: 50000,
    maxUses: 1000,
    currentUses: 347,
    startDate: "2025-11-25",
    endDate: "2025-11-30",
    status: "ACTIVE",
    createdAt: "2025-11-01",
    categories: ["electronics", "clothing"],
  },
  {
    id: "2",
    code: "WELCOME10",
    name: "Bienvenida 10%",
    description: "Descuento de bienvenida para nuevos clientes",
    type: "PERCENTAGE",
    value: 10,
    maxUses: 500,
    currentUses: 123,
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    status: "ACTIVE",
    createdAt: "2025-01-01",
  },
  {
    id: "3",
    code: "FREESHIP",
    name: "Envío Gratis",
    description: "Envío gratuito en compras superiores a $30.000",
    type: "FREE_SHIPPING",
    value: 0,
    minOrderAmount: 30000,
    maxUses: 2000,
    currentUses: 1856,
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    status: "ACTIVE",
    createdAt: "2025-01-01",
  },
  {
    id: "4",
    code: "SUMMER50",
    name: "Verano $50 Off",
    description: "Descuento fijo de $50 en productos de verano",
    type: "FIXED_AMOUNT",
    value: 50,
    minOrderAmount: 20000,
    maxUses: 300,
    currentUses: 300,
    startDate: "2025-12-01",
    endDate: "2025-03-31",
    status: "USED_UP",
    createdAt: "2025-11-15",
    categories: ["summer", "clothing"],
  },
  {
    id: "5",
    code: "EXPIRED20",
    name: "Cupón Expirado",
    description: "Cupón de prueba que ya expiró",
    type: "PERCENTAGE",
    value: 20,
    maxUses: 100,
    currentUses: 45,
    startDate: "2025-01-01",
    endDate: "2025-06-30",
    status: "EXPIRED",
    createdAt: "2025-01-01",
  },
];

export default function CouponsPage() {
  const { themeColors } = useTheme();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  const getStatusIcon = (status: Coupon["status"]) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle className="w-4 h-4" />;
      case "INACTIVE":
        return <Clock className="w-4 h-4" />;
      case "EXPIRED":
        return <XCircle className="w-4 h-4" />;
      case "USED_UP":
        return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Coupon["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "#10b981"; // green
      case "INACTIVE":
        return "#f59e0b"; // yellow
      case "EXPIRED":
        return "#ef4444"; // red
      case "USED_UP":
        return "#6b7280"; // gray
    }
  };

  const getStatusLabel = (status: Coupon["status"]) => {
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

  const getTypeIcon = (type: Coupon["type"]) => {
    switch (type) {
      case "PERCENTAGE":
        return <Percent className="w-4 h-4" />;
      case "FIXED_AMOUNT":
        return <DollarSign className="w-4 h-4" />;
      case "FREE_SHIPPING":
        return <Ticket className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: Coupon["type"]) => {
    switch (type) {
      case "PERCENTAGE":
        return "Porcentaje";
      case "FIXED_AMOUNT":
        return "Monto Fijo";
      case "FREE_SHIPPING":
        return "Envío Gratis";
    }
  };

  const getTypeColor = (type: Coupon["type"]) => {
    switch (type) {
      case "PERCENTAGE":
        return "#3b82f6"; // blue
      case "FIXED_AMOUNT":
        return "#10b981"; // green
      case "FREE_SHIPPING":
        return "#8b5cf6"; // purple
    }
  };

  const filteredCoupons = mockCoupons.filter(coupon => {
    const matchesSearch = 
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || coupon.status === statusFilter;
    const matchesType = typeFilter === "ALL" || coupon.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Statistics
  const totalCoupons = mockCoupons.length;
  const activeCoupons = mockCoupons.filter(c => c.status === "ACTIVE").length;
  const totalUses = mockCoupons.reduce((sum, coupon) => sum + coupon.currentUses, 0);
  const averageUsage = totalCoupons > 0 ? Math.round((totalUses / totalCoupons) * 100) / 100 : 0;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Aquí podrías agregar una notificación toast
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold" style={{ color: themeColors.text.primary }}>
              Cupones
            </h1>
            <p className="text-sm mt-1" style={{ color: themeColors.text.secondary }}>
              Gestiona todos los cupones de descuento del sistema
            </p>
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
              <Download className="w-4 h-4" />
              Exportar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/admin/cupones/nuevo")}
              className="px-6 py-2 rounded-xl font-medium text-white transition-all duration-200 flex items-center gap-2"
              style={{
                background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
              }}
            >
              <Plus className="w-4 h-4" />
              Nuevo Cupón
            </motion.button>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: themeColors.text.secondary }}>
                  Total Cupones
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: themeColors.text.primary }}>
                  {totalCoupons}
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${themeColors.primary}20` }}
              >
                <Ticket className="w-6 h-6" style={{ color: themeColors.primary }} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-xs text-green-500">+8% vs mes anterior</span>
            </div>
          </motion.div>

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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: themeColors.text.secondary }}>
                  Cupones Activos
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: themeColors.text.primary }}>
                  {activeCoupons}
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "#10b98120" }}
              >
                <CheckCircle className="w-6 h-6" style={{ color: "#10b981" }} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-xs text-green-500">+12% vs semana anterior</span>
            </div>
          </motion.div>

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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: themeColors.text.secondary }}>
                  Total Usos
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: themeColors.text.primary }}>
                  {totalUses.toLocaleString()}
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${themeColors.secondary}20` }}
              >
                <Users className="w-6 h-6" style={{ color: themeColors.secondary }} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-xs text-green-500">+25% vs mes anterior</span>
            </div>
          </motion.div>

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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: themeColors.text.secondary }}>
                  Uso Promedio
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: themeColors.text.primary }}>
                  {averageUsage}
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "#3b82f620" }}
              >
                <BarChart3 className="w-6 h-6" style={{ color: "#3b82f6" }} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="text-xs text-red-500">-2% vs mes anterior</span>
            </div>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="backdrop-blur-xl p-6 rounded-2xl border mb-6"
          style={{
            backgroundColor: `${themeColors.surface}70`,
            borderColor: `${themeColors.primary}30`,
          }}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: themeColors.text.secondary }} />
                <input
                  type="text"
                  placeholder="Buscar por código, nombre o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: `${themeColors.surface}50`,
                    borderColor: `${themeColors.primary}30`,
                    color: themeColors.text.primary,
                  }}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <EnhancedSelect
                options={[
                  { value: "ALL", label: "Todos los estados" },
                  { value: "ACTIVE", label: "Activo", icon: <CheckCircle className="w-4 h-4" /> },
                  { value: "INACTIVE", label: "Inactivo", icon: <Clock className="w-4 h-4" /> },
                  { value: "EXPIRED", label: "Expirado", icon: <XCircle className="w-4 h-4" /> },
                  { value: "USED_UP", label: "Agotado", icon: <BarChart3 className="w-4 h-4" /> },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="Estado"
                className="min-w-[200px]"
              />
              <EnhancedSelect
                options={[
                  { value: "ALL", label: "Todos los tipos" },
                  { value: "PERCENTAGE", label: "Porcentaje", icon: <Percent className="w-4 h-4" /> },
                  { value: "FIXED_AMOUNT", label: "Monto Fijo", icon: <DollarSign className="w-4 h-4" /> },
                  { value: "FREE_SHIPPING", label: "Envío Gratis", icon: <Ticket className="w-4 h-4" /> },
                ]}
                value={typeFilter}
                onChange={setTypeFilter}
                placeholder="Tipo"
                className="min-w-[200px]"
              />
              <button
                className="p-3 rounded-xl border transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: `${themeColors.surface}50`,
                  borderColor: `${themeColors.primary}30`,
                  color: themeColors.text.primary,
                }}
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Coupons Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl border overflow-hidden"
          style={{
            backgroundColor: `${themeColors.surface}70`,
            borderColor: `${themeColors.primary}30`,
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: `${themeColors.primary}10` }}>
                  <th className="text-left p-4 font-semibold" style={{ color: themeColors.text.primary }}>
                    Cupón
                  </th>
                  <th className="text-left p-4 font-semibold" style={{ color: themeColors.text.primary }}>
                    Tipo
                  </th>
                  <th className="text-left p-4 font-semibold" style={{ color: themeColors.text.primary }}>
                    Valor
                  </th>
                  <th className="text-left p-4 font-semibold" style={{ color: themeColors.text.primary }}>
                    Usos
                  </th>
                  <th className="text-left p-4 font-semibold" style={{ color: themeColors.text.primary }}>
                    Estado
                  </th>
                  <th className="text-left p-4 font-semibold" style={{ color: themeColors.text.primary }}>
                    Válido hasta
                  </th>
                  <th className="text-left p-4 font-semibold" style={{ color: themeColors.text.primary }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.map((coupon, index) => (
                  <motion.tr
                    key={coupon.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="border-t transition-colors duration-200 hover:bg-opacity-50"
                    style={{ 
                      borderColor: `${themeColors.primary}20`,
                    }}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{
                            backgroundColor: `${getTypeColor(coupon.type)}20`,
                            color: getTypeColor(coupon.type),
                          }}
                        >
                          {getTypeIcon(coupon.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-mono font-bold text-sm" style={{ color: themeColors.text.primary }}>
                              {coupon.code}
                            </p>
                            <button
                              onClick={() => copyToClipboard(coupon.code)}
                              className="p-1 rounded hover:bg-gray-100"
                              title="Copiar código"
                            >
                              <Copy className="w-3 h-3" style={{ color: themeColors.text.secondary }} />
                            </button>
                          </div>
                          <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                            {coupon.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div style={{ color: getTypeColor(coupon.type) }}>
                          {getTypeIcon(coupon.type)}
                        </div>
                        <span className="text-sm font-medium" style={{ color: themeColors.text.primary }}>
                          {getTypeLabel(coupon.type)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold" style={{ color: themeColors.text.primary }}>
                        {coupon.type === "PERCENTAGE" ? `${coupon.value}%` : 
                         coupon.type === "FIXED_AMOUNT" ? `$${coupon.value}` : 
                         "Gratis"}
                      </p>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium" style={{ color: themeColors.text.primary }}>
                          {coupon.currentUses}{coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
                        </p>
                        {coupon.maxUses && (
                          <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                            <div 
                              className="h-1.5 rounded-full"
                              style={{ 
                                width: `${Math.min((coupon.currentUses / coupon.maxUses) * 100, 100)}%`,
                                backgroundColor: getStatusColor(coupon.status)
                              }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${getStatusColor(coupon.status)}20` }}
                        >
                          <div style={{ color: getStatusColor(coupon.status) }}>
                            {getStatusIcon(coupon.status)}
                          </div>
                        </div>
                        <span
                          className="text-sm font-medium"
                          style={{ color: getStatusColor(coupon.status) }}
                        >
                          {getStatusLabel(coupon.status)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" style={{ color: themeColors.text.secondary }} />
                        <p style={{ color: themeColors.text.primary }}>
                          {new Date(coupon.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/admin/cupones/${coupon.id}`)}
                          className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
                          style={{
                            backgroundColor: `${themeColors.primary}20`,
                            color: themeColors.primary,
                          }}
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/cupones/${coupon.id}/editar`)}
                          className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
                          style={{
                            backgroundColor: `${themeColors.secondary}20`,
                            color: themeColors.secondary,
                          }}
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
                          style={{
                            backgroundColor: "#ef444420",
                            color: "#ef4444",
                          }}
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
