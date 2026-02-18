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
import { useAuthStore } from "@/lib/auth-store";
import { api } from "@/api";
import { Order } from "@/api";
import Link from "next/link";

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: {
    label: "Pendiente",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    icon: Clock,
  },
  processing: {
    label: "Procesando",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    icon: Package,
  },
  shipped: {
    label: "Enviado",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
    icon: Truck,
  },
  delivered: {
    label: "Entregado",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelado",
    color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    icon: XCircle,
  },
};

export default function OrdersPage() {
  const { user } = useAuthStore();
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="flex items-center justify-center min-h-[80vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Acceso Denegado
            </h1>
            <p className="text-muted-foreground mb-6">
              Debes iniciar sesión para ver tus pedidos
            </p>
            <Link
              href="/login"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Iniciar Sesión
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // Client-side search filter (API doesn't support search param)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-6">
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
              className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4"
            >
              Mis Pedidos
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-slate-600 dark:text-slate-400 text-lg"
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
            {[
              {
                label: "Total Pedidos",
                value: totalOrders,
                color: "from-blue-500 to-cyan-500",
                icon: Package,
              },
              {
                label: "Completados",
                value: completedCount,
                color: "from-green-500 to-emerald-500",
                icon: CheckCircle2,
              },
              {
                label: "En Proceso",
                value: inProcessCount,
                color: "from-purple-500 to-pink-500",
                icon: Clock,
              },
              {
                label: "Total Gastado",
                value: `$${totalSpent.toLocaleString("es-UY", { minimumFractionDigits: 2 })}`,
                color: "from-orange-500 to-red-500",
                icon: Star,
              },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6 relative overflow-hidden"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-5`}
                  />
                  <div className="relative">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mb-4`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                      {stat.value}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      {stat.label}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar por número de pedido o producto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white/50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Filter className="w-4 h-4 text-slate-500" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white/50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
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
                <Loader2 className="w-10 h-10 text-purple-500 animate-spin mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">Cargando pedidos...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-200 dark:border-red-800 mb-8"
            >
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">
                Error al cargar pedidos
              </h3>
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchOrders}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
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
                  className="text-center py-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20"
                >
                  <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    No se encontraron pedidos
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
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
                      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all group"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        {/* Order Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                              <Package className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                Pedido #{displayOrderNo}
                              </h3>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(order.createdAt).toLocaleDateString("es-UY")}
                                </div>
                                {order.distributorCode && (
                                  <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-md text-xs">
                                    <Tag className="w-3 h-3" />
                                    {order.distributorCode}
                                  </div>
                                )}
                                <div
                                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}
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
                                  className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg border-2 border-white dark:border-slate-800 flex items-center justify-center"
                                >
                                  <Package className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                </div>
                              ))}
                              {order.items.length > 3 && (
                                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-600 rounded-lg border-2 border-white dark:border-slate-800 flex items-center justify-center">
                                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                    +{order.items.length - 3}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">
                                {order.totalItems || order.items.length} producto
                                {(order.totalItems || order.items.length) !== 1 ? "s" : ""}
                              </p>
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                {order.items[0]?.name}
                                {order.items.length > 1 &&
                                  ` y ${order.items.length - 1} más`}
                              </p>
                            </div>
                          </div>

                          {/* Price and Savings */}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                ${(order.total || 0).toLocaleString("es-UY", { minimumFractionDigits: 2 })}
                              </p>
                              <div className="flex items-center gap-3">
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  Total del pedido
                                </p>
                                {order.itemDiscountTotal > 0 && (
                                  <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
                                    Ahorro: ${order.itemDiscountTotal.toLocaleString("es-UY", { minimumFractionDigits: 2 })}
                                  </span>
                                )}
                              </div>
                            </div>

                            <Link
                              href={`/mis-pedidos/${order.id}`}
                              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl transition-all group-hover:shadow-lg"
                            >
                              <Eye className="w-4 h-4" />
                              Ver Detalles
                              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
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
                    className="flex items-center gap-1 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </button>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
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
