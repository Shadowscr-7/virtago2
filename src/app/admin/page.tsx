"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  ShoppingCart,
  Eye,
  Plus,
  ArrowUpRight,
  Calendar,
  Activity,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useAuthStore } from "@/lib/auth-store";
import Link from "next/link";

export default function AdminDashboard() {
  const { user } = useAuthStore();

  if (!user || user.role !== "distribuidor") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            Acceso Denegado
          </h1>
          <p className="text-muted-foreground mb-6">
            Solo los distribuidores pueden acceder al panel de administración
          </p>
          <Link
            href="/"
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            Volver al Inicio
          </Link>
        </motion.div>
      </div>
    );
  }

  const stats = [
    {
      title: "Ventas Totales",
      value: "$125,430",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Órdenes",
      value: "1,249",
      change: "+8.2%",
      trend: "up",
      icon: ShoppingCart,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Productos",
      value: "847",
      change: "+15.3%",
      trend: "up",
      icon: Package,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Clientes",
      value: "2,847",
      change: "+23.1%",
      trend: "up",
      icon: Users,
      color: "from-orange-500 to-red-500",
    },
  ];

  const quickActions = [
    {
      title: "Agregar Producto",
      description: "Añade un nuevo producto a tu catálogo",
      icon: Plus,
      href: "/admin/productos/nuevo",
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Ver Órdenes",
      description: "Revisa las órdenes pendientes",
      icon: Eye,
      href: "/admin/ordenes",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Gestionar Precios",
      description: "Actualiza precios y descuentos",
      icon: DollarSign,
      href: "/admin/precios",
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Configuración Rápida",
      description: "Configura tu tienda paso a paso",
      icon: Activity,
      href: "/admin/configuracion-rapida",
      color: "from-orange-500 to-red-500",
    },
  ];

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ¡Bienvenido, {user.name}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Aquí tienes un resumen de tu actividad comercial
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              {new Date().toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}
                  >
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-green-500 text-sm font-medium">
                    <ArrowUpRight className="w-4 h-4" />
                    {stat.change}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {stat.title}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Link key={action.title} href={action.href}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {action.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {action.description}
                    </p>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* Chart Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Sales Chart */}
          <div className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Ventas por Mes
              </h3>
            </div>
            <div className="h-48 flex items-end justify-between gap-2">
              {[40, 65, 35, 80, 55, 90, 70, 85, 60, 95, 75, 88].map(
                (height, index) => (
                  <motion.div
                    key={index}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="bg-gradient-to-t from-blue-500 to-cyan-500 rounded-t-lg flex-1 min-w-0"
                  />
                ),
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Actividad Reciente
              </h3>
            </div>
            <div className="space-y-4">
              {[
                {
                  action: "Nueva orden recibida",
                  time: "Hace 5 min",
                  color: "text-green-500",
                },
                {
                  action: "Producto actualizado",
                  time: "Hace 15 min",
                  color: "text-blue-500",
                },
                {
                  action: "Cliente registrado",
                  time: "Hace 1 hora",
                  color: "text-purple-500",
                },
                {
                  action: "Precio modificado",
                  time: "Hace 2 horas",
                  color: "text-orange-500",
                },
              ].map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50"
                >
                  <span className="text-gray-900 dark:text-white font-medium">
                    {activity.action}
                  </span>
                  <span className={`text-sm ${activity.color}`}>
                    {activity.time}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
