"use client";

import { useState, useEffect } from "react";
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
import { useAuthStore } from "@/store/auth";
import { useTheme } from "@/contexts/theme-context";
import { EmptyStateWizardCard } from "@/components/admin/empty-state-wizard-card";
import { getOnboardingStatus, OnboardingStatus } from "@/services/onboarding.service";
import { useDashboard } from "@/hooks/useDashboard";
import Link from "next/link";

// Importar debug utils (solo en development)
if (process.env.NODE_ENV === 'development') {
  import('@/utils/onboarding-debug');
}

export default function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const { themeColors } = useTheme();

  // Generate current date only on client to prevent hydration mismatch
  const [currentDate, setCurrentDate] = useState("");
  
  // Estado de onboarding
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const [isLoadingOnboarding, setIsLoadingOnboarding] = useState(true);

  // 🔐 Estado para mensaje de redirección
  const [showAuthRedirect, setShowAuthRedirect] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // 🆕 Hook de dashboard - solo cargar datos después de verificar autenticación
  const { data: dashboardData, loading: loadingDashboard, error: dashboardError, refetch } = useDashboard({
    enabled: authChecked
  });

  // 🔐 GUARD: Verificar autenticación - Solo verificar localStorage
  useEffect(() => {
    const checkAuth = async () => {
      // Delay mínimo para evitar hydration issues
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('🔐 [AUTH CHECK] Ejecutando verificación de autenticación...');
      
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        console.log('🔐 [AUTH CHECK] Token:', token ? `✅ Presente (${token.substring(0, 20)}...)` : '❌ Faltante');
        console.log('🔐 [AUTH CHECK] User localStorage:', userStr ? '✅ Presente' : '❌ Faltante');
        console.log('🔐 [AUTH CHECK] Zustand user:', user ? `✅ Presente (${user.email})` : '❌ Faltante');
        
        // ✅ LÓGICA SIMPLE: Si hay token Y usuario en localStorage, tiene sesión válida
        if (!token || !userStr) {
          console.error('❌ [AUTH CHECK] NO HAY SESIÓN en localStorage - Redirigiendo a login...');
          
          // 🧹 Limpiar completamente el estado de autenticación
          logout();
          
          setShowAuthRedirect(true);
          
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          return;
        }
        
        // Validar que el usuario en localStorage sea válido JSON
        try {
          const parsedUser = JSON.parse(userStr);
          if (!parsedUser.distributorCode && !parsedUser.email) {
            console.error('❌ [AUTH CHECK] Usuario en localStorage inválido');
            
            // 🧹 Limpiar completamente el estado de autenticación
            logout();
            
            setShowAuthRedirect(true);
            setTimeout(() => {
              window.location.href = '/login';
            }, 2000);
            return;
          }
        } catch (err) {
          console.error('❌ [AUTH CHECK] Error parseando usuario:', err);
          
          // 🧹 Limpiar completamente el estado de autenticación
          logout();
          
          setShowAuthRedirect(true);
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          return;
        }
        
        console.log('✅ [AUTH CHECK] Autenticación válida - Permitiendo acceso');
        setAuthChecked(true);
      }
    };
    
    checkAuth();
  }, []); // Sin dependencias - verificar solo al montar

  useEffect(() => {
    setCurrentDate(
      new Date().toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  // Cargar estado de onboarding solo después de verificar autenticación
  useEffect(() => {
    if (!authChecked) {
      console.log('[Onboarding] Esperando verificación de autenticación...');
      return;
    }

    const loadOnboardingStatus = async () => {
      try {
        console.log('[Onboarding] Cargando estado...');
        const status = await getOnboardingStatus();
        setOnboardingStatus(status);
      } catch (error) {
        console.error("Error cargando estado de onboarding:", error);
      } finally {
        setIsLoadingOnboarding(false);
      }
    };

    loadOnboardingStatus();
  }, [authChecked]);

  // Función para recargar el estado (útil después del wizard)
  const reloadOnboardingStatus = async () => {
    setIsLoadingOnboarding(true);
    try {
      const status = await getOnboardingStatus();
      setOnboardingStatus(status);
      // También recargar datos del dashboard
      await refetch();
    } catch (error) {
      console.error("Error recargando estado:", error);
    } finally {
      setIsLoadingOnboarding(false);
    }
  };

  // 🔍 DEBUG COMPLETO
  console.log('====================================');
  console.log('🔍 [ADMIN DASHBOARD] USUARIO COMPLETO:');
  console.log(JSON.stringify(user, null, 2));
  console.log('====================================');
  console.log('🔍 [ADMIN DASHBOARD] user existe?', !!user);
  console.log('🔍 [ADMIN DASHBOARD] user.role:', user?.role);
  console.log('🔍 [ADMIN DASHBOARD] user.userType:', user?.userType);
  console.log('🔍 [ADMIN DASHBOARD] typeof user.role:', typeof user?.role);

  // ✅ Verificar si el usuario tiene permiso de acceso
  const hasAccess = user && (
    user.role === "distributor" || 
    user.role === "admin" || 
    user.userType === "distributor"
  );

  console.log('🔍 [ADMIN DASHBOARD] hasAccess:', hasAccess);
  console.log('🔍 [ADMIN DASHBOARD] Verificación detallada:', {
    userExists: !!user,
    roleIsDistributor: user?.role === "distributor",
    roleIsAdmin: user?.role === "admin",
    userTypeIsDistributor: user?.userType === "distributor",
    roleValue: user?.role,
    userTypeValue: user?.userType
  });
  console.log('====================================');

  if (!hasAccess) {
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

  // 🎯 Preparar stats con datos reales del backend
  const stats = dashboardData ? [
    {
      title: "Ventas Totales",
      value: `$${dashboardData.stats.sales.total.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: `${dashboardData.stats.sales.change > 0 ? '+' : ''}${dashboardData.stats.sales.change.toFixed(1)}%`,
      trend: dashboardData.stats.sales.change >= 0 ? "up" : "down",
      icon: DollarSign,
      colorIndex: 0,
    },
    {
      title: "Órdenes",
      value: dashboardData.stats.orders.total.toLocaleString(),
      change: `${dashboardData.stats.orders.change > 0 ? '+' : ''}${dashboardData.stats.orders.change.toFixed(1)}%`,
      trend: dashboardData.stats.orders.change >= 0 ? "up" : "down",
      icon: ShoppingCart,
      colorIndex: 1,
    },
    {
      title: "Productos",
      value: dashboardData.stats.products.total.toLocaleString(),
      change: `${dashboardData.stats.products.change > 0 ? '+' : ''}${dashboardData.stats.products.change.toFixed(1)}%`,
      trend: dashboardData.stats.products.change >= 0 ? "up" : "down",
      icon: Package,
      colorIndex: 2,
    },
    {
      title: "Clientes",
      value: dashboardData.stats.clients.total.toLocaleString(),
      change: `${dashboardData.stats.clients.change > 0 ? '+' : ''}${dashboardData.stats.clients.change.toFixed(1)}%`,
      trend: dashboardData.stats.clients.change >= 0 ? "up" : "down",
      icon: Users,
      colorIndex: 0,
    },
  ] : [];

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

  // 🔐 Mostrar mensaje estético de redirección si no hay autenticación
  if (showAuthRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: themeColors.background }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-2xl shadow-2xl max-w-md w-full mx-4"
          style={{
            background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`,
          }}
        >
          {/* Efectos de fondo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          </div>

          {/* Contenido */}
          <div className="relative p-8 text-center">
            {/* Icono animado */}
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 10, 0],
                scale: [1, 1.1, 1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-white/20 backdrop-blur-sm"
            >
              <Activity className="w-10 h-10 text-white" strokeWidth={2.5} />
            </motion.div>

            {/* Título */}
            <h2 className="text-2xl font-bold text-white mb-3">
              Sesión no encontrada
            </h2>

            {/* Mensaje */}
            <p className="text-white/90 mb-6 text-lg">
              Redirigiendo al inicio de sesión...
            </p>

            {/* Barra de progreso */}
            <div className="relative h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: "linear" }}
                className="absolute inset-y-0 left-0 bg-white rounded-full"
              />
            </div>

            {/* Texto pequeño */}
            <p className="mt-4 text-white/70 text-sm">
              Serás redirigido automáticamente en 2 segundos
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // 🔄 Mostrar loading mientras verifica autenticación
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: themeColors.background }}>
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block w-8 h-8 border-4 rounded-full"
            style={{ 
              borderColor: themeColors.primary + "30",
              borderTopColor: themeColors.primary 
            }}
          />
          <p className="mt-4" style={{ color: themeColors.text.secondary }}>
            Verificando sesión...
          </p>
        </div>
      </div>
    );
  }

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
                ¡Bienvenido, {user.firstName} {user.lastName}!
              </h1>
              <p 
                className="mt-2"
                style={{ color: themeColors.text.secondary }}
              >
                {onboardingStatus && !onboardingStatus.hasData 
                  ? "Comienza tu viaje con Virtago configurando tu sistema" 
                  : "Aquí tienes un resumen de tu actividad comercial"}
              </p>
            </div>
            <div 
              className="flex items-center gap-2 text-sm"
              style={{ color: themeColors.text.secondary }}
            >
              <Calendar className="w-4 h-4" />
              {currentDate}
            </div>
            
            {/* Debug: Botón para recargar estado (temporal durante desarrollo) */}
            {!isLoadingOnboarding && (
              <button
                onClick={reloadOnboardingStatus}
                className="ml-4 px-3 py-1 text-xs rounded-lg border transition-all hover:scale-105"
                style={{
                  borderColor: `${themeColors.primary}40`,
                  color: themeColors.primary,
                  backgroundColor: `${themeColors.surface}80`
                }}
                title="Recargar estado de onboarding"
              >
                🔄 Actualizar
              </button>
            )}
          </div>
        </motion.div>

        {/* Loading State */}
        {(isLoadingOnboarding || loadingDashboard) && (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 rounded-full border-4"
              style={{
                borderColor: `${themeColors.primary}30`,
                borderTopColor: themeColors.primary,
              }}
            />
          </div>
        )}

        {/* Error State */}
        {!isLoadingOnboarding && !loadingDashboard && dashboardError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 backdrop-blur-lg rounded-2xl shadow-lg border text-center"
            style={{
              backgroundColor: themeColors.surface + "80",
              borderColor: `${themeColors.primary}20`,
            }}
          >
            <p style={{ color: themeColors.text.secondary }} className="mb-4">
              {dashboardError}
            </p>
            <button
              onClick={refetch}
              className="px-4 py-2 rounded-lg transition-all hover:scale-105"
              style={{
                background: `linear-gradient(45deg, ${themeColors.primary}, ${themeColors.secondary})`,
                color: "white"
              }}
            >
              🔄 Reintentar
            </button>
          </motion.div>
        )}

        {/* Empty State - Mostrar si no tiene datos */}
        {!isLoadingOnboarding && !loadingDashboard && onboardingStatus && !onboardingStatus.hasData && (
          <EmptyStateWizardCard onboardingStatus={onboardingStatus} />
        )}

        {/* Dashboard Normal - Mostrar si tiene datos */}
        {!isLoadingOnboarding && !loadingDashboard && onboardingStatus && onboardingStatus.hasData && dashboardData && (
          <>
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
                        style={{ 
                          color: stat.trend === "up" ? themeColors.accent : "#ef4444" 
                        }}
                      >
                        {stat.trend === "up" ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                          </svg>
                        )}
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
              {dashboardData.salesChart.data.map((monthData, index) => (
                <motion.div
                  key={monthData.month}
                  initial={{ height: 0 }}
                  animate={{ height: `${monthData.percentage}%` }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="rounded-t-lg flex-1 min-w-0 relative group"
                  style={{
                    background: `linear-gradient(to top, ${themeColors.primary}, ${themeColors.secondary})`
                  }}
                  title={`${monthData.month}: $${monthData.value.toLocaleString()}`}
                >
                  {/* Tooltip en hover */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-xs whitespace-nowrap pointer-events-none"
                    style={{
                      backgroundColor: themeColors.surface + "F0",
                      color: themeColors.text.primary,
                      boxShadow: `0 2px 8px ${themeColors.primary}40`
                    }}
                  >
                    <div className="font-semibold">{monthData.month}</div>
                    <div>${monthData.value.toLocaleString()}</div>
                  </div>
                </motion.div>
              ))}
            </div>
            {dashboardData.salesChart.data.length === 0 && (
              <div className="h-48 flex items-center justify-center">
                <p style={{ color: themeColors.text.secondary }}>
                  No hay datos de ventas disponibles
                </p>
              </div>
            )}
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
              {dashboardData.recentActivity.length > 0 ? (
                dashboardData.recentActivity.map((activity, index) => {
                  // Mapear tipos a colores
                  const typeColorMap: Record<string, number> = {
                    order: 0,
                    product: 1,
                    client: 2,
                    price: 0,
                    discount: 1,
                  };
                  const colorIndex = typeColorMap[activity.type] || 0;
                  
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={{
                        backgroundColor: themeColors.primary + "10"
                      }}
                    >
                      <div className="flex-1">
                        <span 
                          className="font-medium block"
                          style={{ color: themeColors.text.primary }}
                        >
                          {activity.action}
                        </span>
                        <span 
                          className="text-sm"
                          style={{ color: themeColors.text.secondary }}
                        >
                          {activity.description}
                        </span>
                      </div>
                      <span 
                        className="text-sm ml-4 whitespace-nowrap"
                        style={{ color: getThemeColor(colorIndex) }}
                      >
                        {activity.relativeTime}
                      </span>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <p style={{ color: themeColors.text.secondary }}>
                    No hay actividad reciente
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
        </>
      )}
      </div>
    </AdminLayout>
  );
}