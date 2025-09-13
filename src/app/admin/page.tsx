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
import { useTheme } from "@/contexts/theme-context";
import Link from "next/link";

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const { themeColors } = useTheme();

  if (!user || user.role !== "distribuidor") {
    return (
      <div 
        className="min-h-screen flex items-center justify-center backdrop-blur-xl"
        style={{
          background: `linear-gradient(135deg, 
            ${themeColors.surface}20 0%, 
            ${themeColors.primary}10 25%, 
            ${themeColors.secondary}10 75%, 
            ${themeColors.surface}20 100%)`
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 backdrop-blur-lg rounded-2xl shadow-xl border"
          style={{
            backgroundColor: themeColors.surface + "80",
            borderColor: themeColors.primary + "20"
          }}
        >
          <div 
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{
              background: `linear-gradient(45deg, ${themeColors.primary}, ${themeColors.secondary})`
            }}
          >
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 
            className="text-2xl font-bold mb-4 bg-gradient-to-r bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`
            }}
          >
            Acceso Denegado
          </h1>
          <p 
            className="mb-6"
            style={{ color: themeColors.text.secondary }}
          >
            Solo los distribuidores pueden acceder al panel de administración
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-lg transition-all hover:scale-105"
            style={{
              background: `linear-gradient(45deg, ${themeColors.primary}, ${themeColors.secondary})`,
              color: "white"
            }}
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
      colorIndex: 0,
    },
    {
      title: "Órdenes",
      value: "1,249",
      change: "+8.2%",
      trend: "up",
      icon: ShoppingCart,
      colorIndex: 1,
    },
    {
      title: "Productos",
      value: "847",
      change: "+15.3%",
      trend: "up",
      icon: Package,
      colorIndex: 2,
    },
    {
      title: "Clientes",
      value: "2,847",
      change: "+23.1%",
      trend: "up",
      icon: Users,
      colorIndex: 0,
    },
  ];

  const quickActions = [
    {
      title: "Agregar Producto",
      description: "Añade un nuevo producto a tu catálogo",
      icon: Plus,
      href: "/admin/productos/nuevo",
      colorIndex: 1,
    },
    {
      title: "Ver Órdenes",
      description: "Revisa las órdenes pendientes",
      icon: Eye,
      href: "/admin/ordenes",
      colorIndex: 2,
    },
    {
      title: "Gestionar Precios",
      description: "Actualiza precios y descuentos",
      icon: DollarSign,
      href: "/admin/precios",
      colorIndex: 0,
    },
    {
      title: "Configuración Rápida",
      description: "Configura tu tienda paso a paso",
      icon: Activity,
      href: "/admin/configuracion-rapida",
      colorIndex: 1,
    },
  ];

  // Función para obtener colores del tema
  const getThemeColor = (index: number) => {
    const colors = [themeColors.primary, themeColors.secondary, themeColors.accent];
    return colors[index % colors.length];
  };

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
              <h1 
                className="text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`
                }}
              >
                ¡Bienvenido, {user.name}!
              </h1>
              <p 
                className="mt-2"
                style={{ color: themeColors.text.secondary }}
              >
                Aquí tienes un resumen de tu actividad comercial
              </p>
            </div>
            <div 
              className="flex items-center gap-2 text-sm"
              style={{ color: themeColors.text.secondary }}
            >
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
            const statColor = getThemeColor(stat.colorIndex);
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="p-6 backdrop-blur-lg rounded-2xl shadow-lg border hover:shadow-xl transition-all duration-300"
                style={{
                  backgroundColor: themeColors.surface + "80",
                  borderColor: themeColors.primary + "20"
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="p-3 rounded-xl"
                    style={{
                      background: `linear-gradient(45deg, ${statColor}, ${statColor}90)`
                    }}
                  >
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div 
                    className="flex items-center gap-1 text-sm font-medium"
                    style={{ color: themeColors.accent }}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    {stat.change}
                  </div>
                </div>
                <div>
                  <h3 
                    className="text-2xl font-bold"
                    style={{ color: themeColors.text.primary }}
                  >
                    {stat.value}
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: themeColors.text.secondary }}
                  >
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
          <h2 
            className="text-2xl font-bold mb-6"
            style={{ color: themeColors.text.primary }}
          >
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              const actionColor = getThemeColor(action.colorIndex);
              return (
                <Link key={action.title} href={action.href}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="p-6 backdrop-blur-lg rounded-2xl shadow-lg border hover:shadow-xl transition-all duration-300 cursor-pointer group"
                    style={{
                      backgroundColor: themeColors.surface + "80",
                      borderColor: themeColors.primary + "20"
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                      style={{
                        background: `linear-gradient(45deg, ${actionColor}, ${actionColor}90)`
                      }}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h3 
                      className="text-lg font-semibold mb-2"
                      style={{ color: themeColors.text.primary }}
                    >
                      {action.title}
                    </h3>
                    <p 
                      className="text-sm"
                      style={{ color: themeColors.text.secondary }}
                    >
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
          <div 
            className="p-6 backdrop-blur-lg rounded-2xl shadow-lg border"
            style={{
              backgroundColor: themeColors.surface + "80",
              borderColor: themeColors.primary + "20"
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="p-2 rounded-lg"
                style={{
                  background: `linear-gradient(45deg, ${themeColors.primary}, ${themeColors.secondary})`
                }}
              >
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h3 
                className="text-lg font-semibold"
                style={{ color: themeColors.text.primary }}
              >
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
                    className="rounded-t-lg flex-1 min-w-0"
                    style={{
                      background: `linear-gradient(to top, ${themeColors.primary}, ${themeColors.secondary})`
                    }}
                  />
                ),
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div 
            className="p-6 backdrop-blur-lg rounded-2xl shadow-lg border"
            style={{
              backgroundColor: themeColors.surface + "80",
              borderColor: themeColors.primary + "20"
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="p-2 rounded-lg"
                style={{
                  background: `linear-gradient(45deg, ${themeColors.secondary}, ${themeColors.accent})`
                }}
              >
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 
                className="text-lg font-semibold"
                style={{ color: themeColors.text.primary }}
              >
                Actividad Reciente
              </h3>
            </div>
            <div className="space-y-4">
              {[
                {
                  action: "Nueva orden recibida",
                  time: "Hace 5 min",
                  colorIndex: 0,
                },
                {
                  action: "Producto actualizado",
                  time: "Hace 15 min",
                  colorIndex: 1,
                },
                {
                  action: "Cliente registrado",
                  time: "Hace 1 hora",
                  colorIndex: 2,
                },
                {
                  action: "Precio modificado",
                  time: "Hace 2 horas",
                  colorIndex: 0,
                },
              ].map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{
                    backgroundColor: themeColors.primary + "10"
                  }}
                >
                  <span 
                    className="font-medium"
                    style={{ color: themeColors.text.primary }}
                  >
                    {activity.action}
                  </span>
                  <span 
                    className="text-sm"
                    style={{ color: getThemeColor(activity.colorIndex) }}
                  >
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
