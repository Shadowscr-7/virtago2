"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Calendar,
  Eye,
  Truck,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Filter,
  Search,
  ShoppingBag,
  Star,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Tag,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useTheme } from "@/contexts/theme-context";
import { api } from "@/api";
import { Order } from "@/api";
import Link from "next/link";

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: {
    label: "Pendiente",
    color: "#92400e",
    bg: "#fef3c7",
    icon: Clock,
  },
  processing: {
    label: "Procesando",
    color: "#1e40af",
    bg: "#dbeafe",
    icon: Package,
  },
  shipped: {
    label: "Enviado",
    color: "#5b21b6",
    bg: "#ede9fe",
    icon: Truck,
  },
  delivered: {
    label: "Entregado",
    color: "#166534",
    bg: "#dcfce7",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelado",
    color: "#991b1b",
    bg: "#fee2e2",
    icon: XCircle,
  },
};

export default function OrdersPage() {
  const { user } = useAuthStore();
  const { themeColors } = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const limit = 10;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: { page: number; limit: number; status?: string } = {
        page: currentPage,
        limit,
      };
      if (selectedStatus !== "all") {
        params.status = selectedStatus;
      }
      const response = await api.order.getMyOrders(params);
      if (response.data) {
        setOrders(response.data.data || []);
        setTotalOrders(response.data.total || 0);
      } else {
        setOrders([]);
        setTotalOrders(0);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("No se pudieron cargar los pedidos. Intenta nuevamente.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedStatus]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user, fetchOrders]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus]);

  const totalPages = Math.ceil(totalOrders / limit);

  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background: `linear-gradient(135deg, ${themeColors.surface} 0%, #ffffff 40%, ${themeColors.primary}10 100%)`,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 rounded-2xl"
          style={{
            backgroundColor: "#ffffff",
            boxShadow: `0 20px 60px ${themeColors.primary}20`,
            border: `1px solid ${themeColors.border}`,
          }}
        >
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
          >
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-4" style={{ color: themeColors.text.primary }}>
            Acceso Denegado
          </h1>
          <p className="mb-6" style={{ color: themeColors.text.secondary }}>
            Debes iniciar sesión para ver tus pedidos
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 rounded-lg font-semibold text-white transition-all"
            style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
          >
            Iniciar Sesión
          </Link>
        </motion.div>
      </div>
    );
  }

  // Client-side search filter
  const filteredOrders = searchQuery
    ? orders.filter((order) => {
        const q = searchQuery.toLowerCase();
        return (
          (order.orderNo || "").toLowerCase().includes(q) ||
          (order.distributorCode || "").toLowerCase().includes(q) ||
          order.items.some((item) => item.name.toLowerCase().includes(q))
        );
      })
    : orders;

  // Stats from loaded orders
  const completedCount = orders.filter((o) => o.status === "delivered").length;
  const inProcessCount = orders.filter((o) =>
    ["pending", "processing", "shipped"].includes(o.status),
  ).length;
  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  const statCards = [
    { label: "Total Pedidos", value: totalOrders, icon: Package },
    { label: "Completados", value: completedCount, icon: CheckCircle2 },
    { label: "En Proceso", value: inProcessCount, icon: Clock },
    {
      label: "Total Gastado",
      value: `$${totalSpent.toLocaleString("es-UY", { minimumFractionDigits: 2 })}`,
      icon: Star,
    },
  ];

  return (
    <div
      className="min-h-screen pt-6"
      style={{
        background: `linear-gradient(135deg, ${themeColors.surface} 0%, #ffffff 50%, ${themeColors.primary}08 100%)`,
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold mb-4"
              style={{ color: themeColors.text.primary }}
            >
              Mis Pedidos
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg"
              style={{ color: themeColors.text.secondary }}
            >
              Historial completo de tus pedidos en VIRTAGO
            </motion.p>
          </div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="rounded-2xl p-6 relative overflow-hidden"
                  style={{
                    backgroundColor: "#ffffff",
                    border: `1px solid ${themeColors.border}`,
                    boxShadow: `0 4px 16px ${themeColors.primary}10`,
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-1" style={{ color: themeColors.text.primary }}>
                    {stat.value}
                  </h3>
                  <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                    {stat.label}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="rounded-2xl p-6 mb-8"
            style={{
              backgroundColor: "#ffffff",
              border: `1px solid ${themeColors.border}`,
              boxShadow: `0 4px 20px ${themeColors.primary}10`,
            }}
          >
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-80">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                    style={{ color: themeColors.text.muted }}
                  />
                  <input
                    type="text"
                    placeholder="Buscar por número de pedido o producto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 rounded-xl text-sm transition-all focus:outline-none bg-white"
                    style={{ borderColor: themeColors.border, color: themeColors.text.primary }}
                    onFocus={(e) => { e.target.style.borderColor = themeColors.primary; e.target.style.boxShadow = `0 0 0 3px ${themeColors.primary}20`; }}
                    onBlur={(e) => { e.target.style.borderColor = themeColors.border; e.target.style.boxShadow = "none"; }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Filter className="w-4 h-4" style={{ color: themeColors.text.muted }} />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-3 border-2 rounded-xl text-sm transition-all focus:outline-none bg-white"
                  style={{ borderColor: themeColors.border, color: themeColors.text.primary }}
                  onFocus={(e) => { (e.target as HTMLSelectElement).style.borderColor = themeColors.primary; }}
                  onBlur={(e) => { (e.target as HTMLSelectElement).style.borderColor = themeColors.border; }}
                >
                  <option value="all">Todos los estados</option>
                  <option value="pending">Pendiente</option>
                  <option value="processing">Procesando</option>
                  <option value="shipped">Enviado</option>
                  <option value="delivered">Entregado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2
                  className="w-10 h-10 animate-spin mx-auto mb-4"
                  style={{ color: themeColors.primary }}
                />
                <p style={{ color: themeColors.text.secondary }}>Cargando pedidos...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 rounded-2xl border mb-8"
              style={{ backgroundColor: "#fef2f2", borderColor: "#fecaca" }}
            >
              <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: themeColors.primary }} />
              <h3 className="text-lg font-semibold mb-2" style={{ color: themeColors.text.primary }}>
                Error al cargar pedidos
              </h3>
              <p className="mb-4" style={{ color: themeColors.text.secondary }}>{error}</p>
              <button
                onClick={fetchOrders}
                className="px-6 py-2 rounded-lg text-white transition-colors"
                style={{ backgroundColor: themeColors.primary }}
              >
                Reintentar
              </button>
            </motion.div>
          )}

          {/* Orders List */}
          {!loading && !error && (
            <div className="space-y-6">
              {filteredOrders.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 rounded-2xl"
                  style={{
                    backgroundColor: "#ffffff",
                    border: `1px solid ${themeColors.border}`,
                    boxShadow: `0 4px 20px ${themeColors.primary}10`,
                  }}
                >
                  <Package className="w-16 h-16 mx-auto mb-4" style={{ color: themeColors.text.muted }} />
                  <h3 className="text-xl font-semibold mb-2" style={{ color: themeColors.text.primary }}>
                    No se encontraron pedidos
                  </h3>
                  <p style={{ color: themeColors.text.secondary }}>
                    {searchQuery || selectedStatus !== "all"
                      ? "Prueba a ajustar los filtros de búsqueda"
                      : "Aún no has realizado ningún pedido"}
                  </p>
                </motion.div>
              ) : (
                filteredOrders.map((order, index) => {
                  const statusKey = order.status || "pending";
                  const config = statusConfig[statusKey] || statusConfig.pending;
                  const StatusIcon = config.icon;
                  const displayOrderNo = order.orderNo || order.orderNumber || order.id;

                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="rounded-2xl p-6 transition-all hover:shadow-lg"
                      style={{
                        backgroundColor: "#ffffff",
                        border: `1px solid ${themeColors.border}`,
                        boxShadow: `0 4px 16px ${themeColors.primary}08`,
                      }}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        {/* Order Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center"
                              style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
                            >
                              <Package className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold" style={{ color: themeColors.text.primary }}>
                                Pedido #{displayOrderNo}
                              </h3>
                              <div className="flex flex-wrap items-center gap-3 text-sm mt-1">
                                <div className="flex items-center gap-1" style={{ color: themeColors.text.secondary }}>
                                  <Calendar className="w-4 h-4" />
                                  {new Date(order.createdAt).toLocaleDateString("es-UY")}
                                </div>
                                {order.distributorCode && (
                                  <div
                                    className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs"
                                    style={{ backgroundColor: themeColors.surface, color: themeColors.text.secondary, border: `1px solid ${themeColors.border}` }}
                                  >
                                    <Tag className="w-3 h-3" />
                                    {order.distributorCode}
                                  </div>
                                )}
                                <div
                                  className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                                  style={{ backgroundColor: config.bg, color: config.color }}
                                >
                                  <StatusIcon className="w-3 h-3" />
                                  {config.label}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Order Items Preview */}
                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex -space-x-2">
                              {order.items.slice(0, 3).map((item, itemIndex) => (
                                <div
                                  key={itemIndex}
                                  className="w-10 h-10 rounded-lg border-2 border-white flex items-center justify-center"
                                  style={{ backgroundColor: themeColors.surface }}
                                >
                                  <Package className="w-5 h-5" style={{ color: themeColors.text.muted }} />
                                </div>
                              ))}
                              {order.items.length > 3 && (
                                <div
                                  className="w-10 h-10 rounded-lg border-2 border-white flex items-center justify-center"
                                  style={{ backgroundColor: themeColors.surface }}
                                >
                                  <span className="text-xs font-medium" style={{ color: themeColors.text.secondary }}>
                                    +{order.items.length - 3}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium" style={{ color: themeColors.text.primary }}>
                                {order.totalItems || order.items.length} producto
                                {(order.totalItems || order.items.length) !== 1 ? "s" : ""}
                              </p>
                              <p className="text-xs" style={{ color: themeColors.text.secondary }}>
                                {order.items[0]?.name}
                                {order.items.length > 1 && ` y ${order.items.length - 1} más`}
                              </p>
                            </div>
                          </div>

                          {/* Price and Savings */}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold" style={{ color: themeColors.text.primary }}>
                                ${(order.total || 0).toLocaleString("es-UY", { minimumFractionDigits: 2 })}
                              </p>
                              <div className="flex items-center gap-3">
                                <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                                  Total del pedido
                                </p>
                                {order.itemDiscountTotal > 0 && (
                                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#dcfce7", color: "#166534" }}>
                                    Ahorro: ${order.itemDiscountTotal.toLocaleString("es-UY", { minimumFractionDigits: 2 })}
                                  </span>
                                )}
                              </div>
                            </div>

                            <Link
                              href={`/mis-pedidos/${order.id}`}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all"
                              style={{
                                background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                                boxShadow: `0 4px 12px ${themeColors.primary}30`,
                              }}
                            >
                              <Eye className="w-4 h-4" />
                              Ver Detalles
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center gap-4 pt-4"
                >
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    style={{
                      backgroundColor: "#ffffff",
                      borderColor: themeColors.border,
                      color: themeColors.text.secondary,
                    }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </button>
                  <span className="text-sm" style={{ color: themeColors.text.secondary }}>
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    style={{
                      backgroundColor: "#ffffff",
                      borderColor: themeColors.border,
                      color: themeColors.text.secondary,
                    }}
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
