"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Zap,
  Users,
  Package,
  Images,
  FileText,
  DollarSign,
  Percent,
  ShoppingCart,
  Ticket,
  BookOpen,
  GraduationCap,
  FlaskConical,
  ChevronLeft,
  ChevronRight,
  MonitorDown,
  UserCog,
  BarChart3,
  CreditCard,
  UserCircle,
  Star,
} from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { useAuthStore } from "@/store/auth";

const menuItems = [
  {
    id: "dashboard",
    label: "Inicio",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    id: "quick-setup",
    label: "Configuración Rápida",
    icon: Zap,
    href: "/admin/configuracion-rapida",
  },
  {
    id: "customers",
    label: "Clientes",
    icon: Users,
    href: "/admin/clientes",
  },
  {
    id: "users",
    label: "Usuarios",
    icon: UserCog,
    href: "/admin/usuarios",
    adminOnly: true,
  },
  {
    id: "products",
    label: "Productos",
    icon: Package,
    href: "/admin/productos",
  },
  {
    id: "images",
    label: "Imágenes",
    icon: Images,
    href: "/admin/imagenes",
  },
  {
    id: "price-lists",
    label: "Lista de Precios",
    icon: FileText,
    href: "/admin/listas-precios",
  },
  {
    id: "prices",
    label: "Precios",
    icon: DollarSign,
    href: "/admin/precios",
  },
  {
    id: "discounts",
    label: "Descuentos",
    icon: Percent,
    href: "/admin/descuentos",
  },
  {
    id: "orders",
    label: "Órdenes",
    icon: ShoppingCart,
    href: "/admin/ordenes",
  },
  {
    id: "commissions",
    label: "Comisiones",
    icon: BarChart3,
    href: "/admin/comisiones",
    adminOnly: true,
  },
  {
    id: "coupons",
    label: "Cupones",
    icon: Ticket,
    href: "/admin/cupones",
  },
  {
    id: "virtago-sync",
    label: "Virtago Sync",
    icon: MonitorDown,
    href: "/admin/virtago-sync",
  },
  {
    id: "tests",
    label: "Tests E2E",
    icon: FlaskConical,
    href: "/admin/tests",
    adminOnly: true,
  },
  {
    id: "tutorials",
    label: "Tutoriales",
    icon: GraduationCap,
    href: "/admin/tutoriales",
  },
  {
    id: "documentation",
    label: "Documentación",
    icon: BookOpen,
    href: "/redoc-es",
    external: true,
  },
  {
    id: "perfil",
    label: "Mi Perfil",
    icon: UserCircle,
    href: "/admin/perfil",
  },
  {
    id: "facturacion-dist",
    label: "Facturacion",
    icon: CreditCard,
    href: "/admin/facturacion",
  },
  {
    id: "mi-plan",
    label: "Mi Plan",
    icon: Star,
    href: "/admin/mi-plan",
  },
];

interface AdminSidebarProps {
  className?: string;
}

let hasPlayedAdminSidebarIntro = false;

export function AdminSidebar({ className = "" }: AdminSidebarProps) {
  const { themeColors } = useTheme();
  const { user } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [shouldPlayIntro] = useState(() => !hasPlayedAdminSidebarIntro);
  const pathname = usePathname();
  const isDistributor = user?.role === "distributor";
  const visibleItems = menuItems.filter((item) => !(item.adminOnly && isDistributor));

  useEffect(() => {
    hasPlayedAdminSidebarIntro = true;
  }, []);

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <motion.aside
      initial={shouldPlayIntro ? { x: -100 } : false}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        relative h-screen border-r bg-white
        ${isCollapsed ? "w-16" : "w-64"}
        transition-all duration-300 ease-in-out
        ${className}
      `}
      style={{
        borderColor: themeColors.border
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: themeColors.border }}
      >
        {!isCollapsed && (
          <motion.h2
            initial={shouldPlayIntro ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            className="text-lg font-bold"
            style={{
              color: themeColors.primary
            }}
          >
            Panel Admin
          </motion.h2>
        )}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg transition-colors"
          style={{
            backgroundColor: themeColors.primary,
            color: "#ffffff"
          }}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </motion.button>
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-1 overflow-y-auto" style={{ maxHeight: "calc(100vh - 8rem)" }}>
        {visibleItems.map((item, index) => {
          const IconComponent = item.icon;
          const active = isActive(item.href);
          const itemColor = themeColors.primary;

          const linkContent = (
            <motion.div
              whileHover={{ scale: 1.02, x: isCollapsed ? 0 : 4 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative group flex items-center gap-3 p-3 rounded-xl transition-all duration-300
                ${isCollapsed ? "justify-center" : ""}
                ${active ? "shadow-sm" : "hover:bg-gray-50"}
              `}
              style={{
                backgroundColor: active
                  ? itemColor
                  : "transparent",
                color: active
                  ? "#ffffff"
                  : themeColors.text.secondary
              }}
            >
              {/* Marcador activo */}
              {active && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full"
                  style={{ backgroundColor: itemColor }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}

              {/* Icono */}
              <div
                className="relative z-10 p-2 rounded-lg transition-all duration-300"
                style={{
                  backgroundColor: active
                    ? themeColors.accent
                    : "#ffffff"
                }}
              >
                <IconComponent className="w-5 h-5" />
              </div>

              {/* Texto */}
              {!isCollapsed && (
                <motion.span
                  initial={shouldPlayIntro ? { opacity: 0 } : false}
                  animate={{ opacity: 1 }}
                  className="relative z-10 font-medium"
                >
                  {item.label}
                </motion.span>
              )}

              {/* Tooltip para modo colapsado */}
              {isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  className="absolute left-full ml-4 px-3 py-2 text-sm rounded-lg shadow-lg border z-50 whitespace-nowrap pointer-events-none group-hover:pointer-events-auto"
                  style={{
                    backgroundColor: "#ffffff",
                    color: themeColors.text.primary,
                    borderColor: themeColors.border
                  }}
                >
                  {item.label}
                  <div
                    className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 rotate-45 border-l border-b"
                    style={{
                      backgroundColor: "#ffffff",
                      borderColor: themeColors.border
                    }}
                  />
                </motion.div>
              )}
            </motion.div>
          );

          return (
            <motion.div
              key={item.id}
              initial={shouldPlayIntro ? { opacity: 0, x: -20 } : false}
              animate={{ opacity: 1, x: 0 }}
              transition={shouldPlayIntro ? { delay: index * 0.05 } : undefined}
            >
              {item.external ? (
                <a href={item.href} target="_blank" rel="noopener noreferrer">
                  {linkContent}
                </a>
              ) : (
                <Link href={item.href}>
                  {linkContent}
                </Link>
              )}
            </motion.div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 px-2">
        {!isCollapsed ? (
          <motion.div
            initial={shouldPlayIntro ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            className="mx-2 p-3 rounded-lg border"
            style={{
              backgroundColor: "#ffffff",
              borderColor: themeColors.border
            }}
          >
            <div className="text-xs text-center">
              <div
                className="font-medium"
                style={{ color: themeColors.text.primary }}
              >
                Panel Admin
              </div>
              <div style={{ color: themeColors.text.secondary }}>
                VIRTAGO v2.0
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={shouldPlayIntro ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            className="flex justify-center"
          >
            <div
              className="w-8 h-8 rounded-lg border flex items-center justify-center"
              style={{
                backgroundColor: themeColors.primary,
                borderColor: themeColors.border
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: "#ffffff"
                }}
              />
            </div>
          </motion.div>
        )}
      </div>
    </motion.aside>
  );
}
