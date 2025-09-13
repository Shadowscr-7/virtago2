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
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  ShoppingBag,
} from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { AdminLayout } from "@/components/admin/admin-layout";

interface Order {
  id: string;
  orderNumber: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  items: number;
  total: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  date: string;
  suppliers: string[];
  paymentMethod: string;
}

// Mock data
const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-2025-001",
    user: {
      name: "Julio Gomez",
      email: "julio@email.com",
    },
    items: 1,
    total: 346.2,
    status: "PENDING",
    date: "15 Aug 2025",
    suppliers: ["Tech Solutions", "Digital World"],
    paymentMethod: "Cash On Delivery",
  },
  {
    id: "2",
    orderNumber: "ORD-2025-002",
    user: {
      name: "María García",
      email: "maria@email.com",
    },
    items: 3,
    total: 892.5,
    status: "PROCESSING",
    date: "14 Aug 2025",
    suppliers: ["Tech Solutions"],
    paymentMethod: "Credit Card",
  },
  {
    id: "3",
    orderNumber: "ORD-2025-003",
    user: {
      name: "Carlos Rodriguez",
      email: "carlos@email.com",
    },
    items: 2,
    total: 567.8,
    status: "SHIPPED",
    date: "13 Aug 2025",
    suppliers: ["Digital World", "Hardware Plus"],
    paymentMethod: "PayPal",
  },
  {
    id: "4",
    orderNumber: "ORD-2025-004",
    user: {
      name: "Ana López",
      email: "ana@email.com",
    },
    items: 1,
    total: 234.0,
    status: "DELIVERED",
    date: "12 Aug 2025",
    suppliers: ["Tech Solutions"],
    paymentMethod: "Credit Card",
  },
  {
    id: "5",
    orderNumber: "ORD-2025-005",
    user: {
      name: "Pedro Martínez",
      email: "pedro@email.com",
    },
    items: 4,
    total: 1256.3,
    status: "CANCELLED",
    date: "11 Aug 2025",
    suppliers: ["Hardware Plus"],
    paymentMethod: "Bank Transfer",
  },
];

export default function OrdersPage() {
  const { themeColors } = useTheme();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-4 h-4" />;
      case "PROCESSING":
        return <Package className="w-4 h-4" />;
      case "SHIPPED":
        return <Truck className="w-4 h-4" />;
      case "DELIVERED":
        return <CheckCircle className="w-4 h-4" />;
      case "CANCELLED":
        return <XCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Order["status"]) => {
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

  const getStatusLabel = (status: Order["status"]) => {
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

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Statistics
  const totalOrders = mockOrders.length;
  const pendingOrders = mockOrders.filter(o => o.status === "PENDING").length;
  const totalRevenue = mockOrders
    .filter(o => o.status !== "CANCELLED")
    .reduce((sum, order) => sum + order.total, 0);

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
              Órdenes
            </h1>
            <p className="text-sm mt-1" style={{ color: themeColors.text.secondary }}>
              Gestiona todas las órdenes del sistema
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
              onClick={() => router.push("/admin/ordenes/nueva")}
              className="px-6 py-2 rounded-xl font-medium text-white transition-all duration-200 flex items-center gap-2"
              style={{
                background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
              }}
            >
              <Plus className="w-4 h-4" />
              Nueva Orden
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
                  Total Órdenes
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: themeColors.text.primary }}>
                  {totalOrders}
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${themeColors.primary}20` }}
              >
                <ShoppingBag className="w-6 h-6" style={{ color: themeColors.primary }} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-xs text-green-500">+12% vs mes anterior</span>
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
                  Pendientes
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: themeColors.text.primary }}>
                  {pendingOrders}
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "#f59e0b20" }}
              >
                <Clock className="w-6 h-6" style={{ color: "#f59e0b" }} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="text-xs text-red-500">-5% vs semana anterior</span>
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
                  Ingresos Totales
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: themeColors.text.primary }}>
                  ${totalRevenue.toLocaleString()}
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "#10b98120" }}
              >
                <DollarSign className="w-6 h-6" style={{ color: "#10b981" }} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-xs text-green-500">+18% vs mes anterior</span>
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
                  Orden Promedio
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: themeColors.text.primary }}>
                  ${(totalRevenue / totalOrders).toFixed(0)}
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${themeColors.secondary}20` }}
              >
                <TrendingUp className="w-6 h-6" style={{ color: themeColors.secondary }} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-xs text-green-500">+3% vs mes anterior</span>
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
                  placeholder="Buscar por número de orden, cliente..."
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
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: `${themeColors.surface}50`,
                  borderColor: `${themeColors.primary}30`,
                  color: themeColors.text.primary,
                }}
              >
                <option value="ALL">Todos los estados</option>
                <option value="PENDING">Pendiente</option>
                <option value="PROCESSING">Procesando</option>
                <option value="SHIPPED">Enviado</option>
                <option value="DELIVERED">Entregado</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
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

        {/* Orders Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="backdrop-blur-xl rounded-2xl border overflow-hidden"
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
                    Usuario
                  </th>
                  <th className="text-left p-4 font-semibold" style={{ color: themeColors.text.primary }}>
                    Total
                  </th>
                  <th className="text-left p-4 font-semibold" style={{ color: themeColors.text.primary }}>
                    Items
                  </th>
                  <th className="text-left p-4 font-semibold" style={{ color: themeColors.text.primary }}>
                    Estado
                  </th>
                  <th className="text-left p-4 font-semibold" style={{ color: themeColors.text.primary }}>
                    Fecha
                  </th>
                  <th className="text-left p-4 font-semibold" style={{ color: themeColors.text.primary }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => (
                  <motion.tr
                    key={order.id}
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
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white"
                          style={{
                            background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                          }}
                        >
                          {order.user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: themeColors.text.primary }}>
                            {order.user.name}
                          </p>
                          <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                            {order.orderNumber}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold" style={{ color: themeColors.text.primary }}>
                        ${order.total}
                      </p>
                    </td>
                    <td className="p-4">
                      <p style={{ color: themeColors.text.primary }}>
                        {order.items}
                      </p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${getStatusColor(order.status)}20` }}
                        >
                          <div style={{ color: getStatusColor(order.status) }}>
                            {getStatusIcon(order.status)}
                          </div>
                        </div>
                        <span
                          className="text-sm font-medium"
                          style={{ color: getStatusColor(order.status) }}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <p style={{ color: themeColors.text.primary }}>
                        {order.date}
                      </p>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => router.push(`/admin/ordenes/${order.id}`)}
                        className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
                        style={{
                          backgroundColor: `${themeColors.primary}20`,
                          color: themeColors.primary,
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
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
