"use client"

import { motion } from "framer-motion"
import { 
  BarChart3,
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  Eye,
  Settings,
  Plus,
  Filter
} from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import Link from "next/link"

export default function AdminPage() {
  const { user } = useAuthStore()

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
              <Settings className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Acceso Denegado
            </h1>
            <p className="text-muted-foreground mb-6">Debes iniciar sesión para acceder al panel de administración</p>
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

  if (user.role !== 'distribuidor') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="flex items-center justify-center min-h-[80vh]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Acceso Restringido
            </h1>
            <p className="text-muted-foreground mb-6">Solo los distribuidores pueden acceder a esta sección</p>
            <Link 
              href="/"
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all"
            >
              Volver al Inicio
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  const stats = [
    {
      title: "Ventas del Mes",
      value: "$125,430",
      change: "+12.5%",
      icon: BarChart3,
      color: "text-green-600"
    },
    {
      title: "Productos Activos",
      value: "342",
      change: "+8",
      icon: Package,
      color: "text-blue-600"
    },
    {
      title: "Clientes",
      value: "128",
      change: "+23",
      icon: Users,
      color: "text-purple-600"
    },
    {
      title: "Pedidos Pendientes",
      value: "15",
      change: "-2",
      icon: ShoppingCart,
      color: "text-orange-600"
    }
  ]

  const recentOrders = [
    {
      id: "VTG-2024-003",
      customer: "TechSolutions SA",
      total: 45678,
      status: "processing",
      date: "2024-09-12"
    },
    {
      id: "VTG-2024-004", 
      customer: "InnovaCorp",
      total: 78923,
      status: "shipped",
      date: "2024-09-11"
    },
    {
      id: "VTG-2024-005",
      customer: "DigitalFlow",
      total: 34567,
      status: "delivered",
      date: "2024-09-10"
    }
  ]

  const statusColors = {
    processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400", 
    delivered: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-6">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Panel de Administración</h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Bienvenido de vuelta, {user.name} - {user.company}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                  Nuevo Producto
                </button>
                <button className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors">
                  <Settings className="w-4 h-4" />
                  Configuración
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center ${stat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{stat.title}</p>
                </motion.div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Orders */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Pedidos Recientes</h2>
                <Link
                  href="/admin/pedidos"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                >
                  Ver todos
                  <Eye className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">{order.id}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{order.customer}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900 dark:text-white">${order.total.toLocaleString()}</p>
                      <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status as keyof typeof statusColors]}`}>
                        {order.status === 'processing' && 'Procesando'}
                        {order.status === 'shipped' && 'Enviado'}
                        {order.status === 'delivered' && 'Entregado'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Acciones Rápidas</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href="/admin/productos"
                  className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
                >
                  <Package className="w-8 h-8 text-blue-600 mb-2" />
                  <h3 className="font-medium text-slate-900 dark:text-white">Gestionar Productos</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Agregar, editar o eliminar productos</p>
                </Link>

                <Link
                  href="/admin/pedidos"
                  className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group"
                >
                  <ShoppingCart className="w-8 h-8 text-green-600 mb-2" />
                  <h3 className="font-medium text-slate-900 dark:text-white">Ver Pedidos</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Gestionar pedidos y estados</p>
                </Link>

                <Link
                  href="/admin/clientes"
                  className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors group"
                >
                  <Users className="w-8 h-8 text-purple-600 mb-2" />
                  <h3 className="font-medium text-slate-900 dark:text-white">Clientes</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Administrar base de clientes</p>
                </Link>

                <Link
                  href="/admin/reportes"
                  className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors group"
                >
                  <BarChart3 className="w-8 h-8 text-orange-600 mb-2" />
                  <h3 className="font-medium text-slate-900 dark:text-white">Reportes</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Análisis y estadísticas</p>
                </Link>
              </div>
            </div>
          </div>

          {/* Chart Section - Placeholder */}
          <div className="mt-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Ventas del Último Mes</h2>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <select className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm">
                  <option>Últimos 30 días</option>
                  <option>Últimos 7 días</option>
                  <option>Último año</option>
                </select>
              </div>
            </div>
            
            {/* Chart Placeholder */}
            <div className="h-64 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-500 dark:text-slate-400">Gráfico de ventas (próximamente)</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
