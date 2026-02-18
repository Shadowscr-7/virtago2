"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  MapPin,
  CreditCard,
  Truck,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Phone,
  Mail,
  Loader2,
  AlertCircle,
  Tag,
  Percent,
  FileText,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { api, Order, OrderItem } from "@/api";
import Link from "next/link";
import { notFound } from "next/navigation";

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }>; description: string }> = {
  pending: {
    label: "Pendiente",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    icon: Clock,
    description: "Tu pedido está siendo revisado",
  },
  processing: {
    label: "Procesando",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    icon: Package,
    description: "Estamos preparando tu pedido",
  },
  shipped: {
    label: "Enviado",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
    icon: Truck,
    description: "Tu pedido está en camino",
  },
  delivered: {
    label: "Entregado",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    icon: CheckCircle2,
    description: "Pedido entregado exitosamente",
  },
  cancelled: {
    label: "Cancelado",
    color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    icon: XCircle,
    description: "El pedido fue cancelado",
  },
};

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then(async (resolvedParams) => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.order.getOrder(resolvedParams.id);
        if (response.data) {
          setOrder(response.data);
        } else {
          setError("Pedido no encontrado");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("No se pudo cargar el pedido");
      } finally {
        setLoading(false);
      }
    });
  }, [params, user]);

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
              <Package className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Acceso Denegado
            </h1>
            <p className="text-muted-foreground mb-6">
              Debes iniciar sesión para ver los detalles del pedido
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Cargando pedido...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="flex items-center justify-center min-h-[80vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20"
          >
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
              {error || "Pedido no encontrado"}
            </h1>
            <Link
              href="/mis-pedidos"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a mis pedidos
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const statusKey = order.status || "pending";
  const statusInfo = statusConfig[statusKey] || statusConfig.pending;
  const StatusIcon = statusInfo.icon;
  const displayOrderNo = order.orderNo || order.orderNumber || order.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-6">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/mis-pedidos"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a mis pedidos
            </Link>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Pedido #{displayOrderNo}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  <p className="text-slate-600 dark:text-slate-400">
                    Realizado el{" "}
                    {new Date(order.createdAt).toLocaleDateString("es-UY", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {order.distributorCode && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-md text-xs text-slate-600 dark:text-slate-400">
                      <Tag className="w-3 h-3" />
                      {order.distributorCode}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${statusInfo.color}`}
                >
                  <StatusIcon className="w-4 h-4" />
                  {statusInfo.label}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Status */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  Estado del Pedido
                </h2>
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${statusInfo.color}`}
                  >
                    <StatusIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {statusInfo.label}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {statusInfo.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                  Productos ({order.totalItems || order.items.length})
                </h2>
                <div className="space-y-4">
                  {order.items?.map((item: OrderItem, idx: number) => (
                    <div
                      key={item.pid || idx}
                      className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                    >
                      <div className="w-14 h-14 bg-slate-200 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                        <Package className="w-7 h-7 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          {item.sku && <span>SKU: {item.sku}</span>}
                          <span>Cant: {item.quantity}</span>
                        </div>
                        {/* Applied Discounts */}
                        {item.appliedDiscounts && item.appliedDiscounts.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.appliedDiscounts.map((disc, dIdx) => (
                              <span
                                key={dIdx}
                                className="inline-flex items-center gap-0.5 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded"
                              >
                                <Percent className="w-2.5 h-2.5" />
                                {disc.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        {item.discountPercentage > 0 ? (
                          <>
                            <p className="text-xs text-slate-400 line-through">
                              ${item.originalPrice.toLocaleString("es-UY", { minimumFractionDigits: 2 })}
                            </p>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              ${item.finalPrice.toLocaleString("es-UY", { minimumFractionDigits: 2 })}
                            </p>
                            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                              -{item.discountPercentage}%
                            </span>
                          </>
                        ) : (
                          <p className="font-semibold text-slate-900 dark:text-white">
                            ${item.finalPrice.toLocaleString("es-UY", { minimumFractionDigits: 2 })}
                          </p>
                        )}
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                          Total: ${item.total.toLocaleString("es-UY", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              {order.user && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                    Datos de Envío
                  </h2>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-slate-500 mt-1" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {order.user.fullName}
                      </p>
                      {order.user.address && (
                        <p className="text-slate-600 dark:text-slate-400">
                          {order.user.address}
                        </p>
                      )}
                      <p className="text-slate-600 dark:text-slate-400">
                        {[order.user.city, order.user.state, order.user.postalCode]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                      {order.user.country && (
                        <p className="text-slate-600 dark:text-slate-400">
                          {order.user.country}
                        </p>
                      )}
                      {order.user.phone && (
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                          <Phone className="w-3 h-3 inline mr-1" />
                          {order.user.phone}
                        </p>
                      )}
                      {order.user.email && (
                        <p className="text-slate-600 dark:text-slate-400">
                          <Mail className="w-3 h-3 inline mr-1" />
                          {order.user.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Observations */}
              {order.observations && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Observaciones
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                    {order.observations}
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Order Summary */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                  Resumen del Pedido
                </h2>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">
                      Subtotal:
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      ${(order.subTotal || 0).toLocaleString("es-UY", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  {order.itemDiscountTotal > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Descuentos:</span>
                      <span className="font-medium">
                        -${order.itemDiscountTotal.toLocaleString("es-UY", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}

                  {order.couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        Cupón{order.coupon?.code ? ` (${order.coupon.code})` : ""}:
                      </span>
                      <span className="font-medium">
                        -${order.couponDiscount.toLocaleString("es-UY", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">
                      Envío:
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {(order.shipping || 0) === 0
                        ? "Gratis"
                        : `$${order.shipping.toLocaleString("es-UY", { minimumFractionDigits: 2 })}`}
                    </span>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-slate-900 dark:text-white">
                        Total:
                      </span>
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        ${(order.total || 0).toLocaleString("es-UY", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Total Savings */}
                  {(order.itemDiscountTotal > 0 || order.couponDiscount > 0) && (
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm font-medium text-green-700 dark:text-green-400 text-center">
                        Ahorraste ${((order.itemDiscountTotal || 0) + (order.couponDiscount || 0)).toLocaleString("es-UY", { minimumFractionDigits: 2 })} en este pedido
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  Método de Pago
                </h2>
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-slate-500" />
                  <span className="text-slate-900 dark:text-white capitalize">
                    {order.paymentMethod || "No especificado"}
                  </span>
                </div>
                {order.currency && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    Moneda: {order.currency}
                  </p>
                )}
              </div>

              {/* Distributor Info */}
              {order.distributorCode && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                    Distribuidor
                  </h2>
                  <div className="flex items-center gap-3">
                    <Tag className="w-5 h-5 text-slate-500" />
                    <span className="text-slate-900 dark:text-white">
                      {order.distributorCode}
                    </span>
                  </div>
                </div>
              )}

              {/* Support */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  ¿Necesitas Ayuda?
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      +598 99 123 456
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      soporte@virtago.com
                    </span>
                  </div>
                </div>
                <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                  Contactar Soporte
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
