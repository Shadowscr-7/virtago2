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
  User
} from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import Link from "next/link"
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
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
    )
  }

  if (!order) {
    notFound()
  }

  const StatusIcon = statusConfig[order.status].icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/mis-pedidos"
              className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a mis pedidos
            </Link>
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <motion.h1 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2"
                >
                  Pedido {order.orderNumber}
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-slate-600 dark:text-slate-400"
                >
                  Realizado el {new Date(order.date).toLocaleDateString()}
                </motion.p>
              </div>

              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-xl transition-colors"
              >
                <Download className="w-4 h-4" />
                Descargar Factura
              </motion.button>
            </div>
          </div>

          {/* Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 mb-8"
          >
            <div className="flex items-center gap-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${statusConfig[order.status].color.replace('text-', 'text-white bg-').split(' ')[1].replace('dark:bg-', 'bg-').replace('/20', '')}`}>
                <StatusIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {statusConfig[order.status].label}
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  {statusConfig[order.status].description}
                </p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Productos</h3>
              </div>

              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl"
                  >
                    <div className="w-16 h-16 bg-slate-200 dark:bg-slate-600 rounded-xl flex items-center justify-center">
                      <Package className="w-8 h-8 text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                        {item.name}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {item.brand} • {item.supplier}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          Cantidad: {item.quantity}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          ${(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="space-y-3">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Subtotal</span>
                    <span>${order.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Impuestos</span>
                    <span>${order.taxes.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Envío</span>
                    <span>${order.shipping.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-slate-900 dark:text-white pt-3 border-t border-slate-200 dark:border-slate-700">
                    <span>Total</span>
                    <span>${order.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Order Info */}
            <div className="space-y-8">
              {/* Shipping Address */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Dirección de Envío</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-900 dark:text-white font-medium">
                      {order.shippingAddress.fullName}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-500 mt-0.5" />
                    <div className="text-slate-600 dark:text-slate-400">
                      <p>{order.shippingAddress.address}</p>
                      <p>
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Payment Method */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Método de Pago</h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">VISA</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {order.paymentMethod}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Pago procesado exitosamente
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Order Timeline */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Seguimiento</h3>
                </div>

                <div className="space-y-4">
                  {[
                    { status: 'pending', date: order.date, label: 'Pedido recibido' },
                    { status: 'processing', date: order.date, label: 'Procesando pedido' },
                    { status: 'shipped', date: order.date, label: 'Pedido enviado' },
                    { status: 'delivered', date: order.date, label: 'Pedido entregado' }
                  ].map((step, index) => {
                    const isCompleted = ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.status) >= index
                    const isCurrent = ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.status) === index
                    const StepIcon = statusConfig[step.status as keyof typeof statusConfig].icon

                    return (
                      <div key={step.status} className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted 
                            ? isCurrent 
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                              : 'bg-green-500 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                        }`}>
                          <StepIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className={`font-medium ${isCompleted ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                            {step.label}
                          </p>
                          {isCompleted && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {new Date(step.date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
