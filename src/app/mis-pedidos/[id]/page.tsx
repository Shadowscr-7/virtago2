"use client"

import { motion } from "framer-motion"
import { 
  Package,
  MapPin,
  CreditCard,
  Truck,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Download,
  Phone,
  Mail
} from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"

const statusConfig = {
  pending: {
    label: "Pendiente",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    icon: Clock,
    description: "Tu pedido está siendo revisado"
  },
  processing: {
    label: "Procesando",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    icon: Package,
    description: "Estamos preparando tu pedido"
  },
  shipped: {
    label: "Enviado",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
    icon: Truck,
    description: "Tu pedido está en camino"
  },
  delivered: {
    label: "Entregado",
    color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    icon: CheckCircle2,
    description: "Pedido entregado exitosamente"
  },
  cancelled: {
    label: "Cancelado",
    color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    icon: XCircle,
    description: "El pedido fue cancelado"
  }
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { user, getOrderById } = useAuthStore()
  const order = getOrderById(params.id)

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
            <p className="text-muted-foreground mb-6">Debes iniciar sesión para ver los detalles del pedido</p>
            <Link 
              href="/login"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Iniciar Sesión
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  if (!order) {
    notFound()
  }

  const statusInfo = statusConfig[order.status]
  const StatusIcon = statusInfo.icon

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
                  Pedido {order.orderNumber}
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Realizado el {new Date(order.date).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${statusInfo.color}`}>
                  <StatusIcon className="w-4 h-4" />
                  {statusInfo.label}
                </div>
                <button className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                  <Download className="w-4 h-4" />
                  Descargar Factura
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Status */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Estado del Pedido</h2>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${statusInfo.color}`}>
                    <StatusIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{statusInfo.label}</h3>
                    <p className="text-slate-600 dark:text-slate-400">{statusInfo.description}</p>
                  </div>
                </div>
                
                {order.trackingNumber && (
                  <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Número de seguimiento: {order.trackingNumber}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Products */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Productos</h2>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="w-16 h-16 bg-slate-200 dark:bg-slate-600 rounded-lg flex items-center justify-center overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white">{item.name}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {item.brand} • {item.supplier}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          ${item.price.toLocaleString()}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Cantidad: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Dirección de Envío</h2>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-slate-500 mt-1" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{order.shippingAddress.fullName}</p>
                    <p className="text-slate-600 dark:text-slate-400">{order.shippingAddress.address}</p>
                    <p className="text-slate-600 dark:text-slate-400">
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">{order.shippingAddress.country}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Order Summary */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Resumen del Pedido</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Subtotal:</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      ${order.subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Envío:</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {order.shipping === 0 ? 'Gratis' : `$${order.shipping.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Impuestos:</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      ${order.taxes.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-slate-900 dark:text-white">Total:</span>
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        ${order.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Método de Pago</h2>
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-slate-500" />
                  <span className="text-slate-900 dark:text-white">{order.paymentMethod}</span>
                </div>
              </div>

              {/* Support */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">¿Necesitas Ayuda?</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">+54 11 1234-5678</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">soporte@virtago.com</span>
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
  )
}
