"use client";

import { useState } from "react";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "@/contexts/theme-context";

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
    id: "coupons",
    label: "Cupones",
    icon: Ticket,
    href: "/admin/cupones",
  },
];

interface AdminSidebarProps {
  className?: string;
}

export function AdminSidebar({ className = "" }: AdminSidebarProps) {
  const { themeColors } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  // Colores dinámicos para cada item basados en el tema
  const getItemColor = (index: number) => {
    const colors = [
      themeColors.primary,
      themeColors.secondary,
      themeColors.accent,
      themeColors.primary,
      themeColors.secondary,
      themeColors.accent,
      themeColors.primary,
      themeColors.secondary,
      themeColors.accent,
      themeColors.primary,
    ];
    return colors[index % colors.length];
  };

  return (
    <motion.aside
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        relative h-screen border-r backdrop-blur-xl
        ${isCollapsed ? "w-16" : "w-64"} 
        transition-all duration-300 ease-in-out
        ${className}
      `}
      style={{
        background: `linear-gradient(180deg, 
          ${themeColors.surface}90 0%, 
          ${themeColors.primary}20 50%, 
          ${themeColors.surface}80 100%)`,
        borderColor: themeColors.primary + "20"
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: themeColors.primary + "20" }}
      >
        {!isCollapsed && (
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg font-bold bg-gradient-to-r bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`
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
            backgroundColor: themeColors.primary + "20",
            color: themeColors.text.primary
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
      <nav className="p-2 space-y-1">
        {menuItems.map((item, index) => {
          const IconComponent = item.icon;
          const active = isActive(item.href);
          const itemColor = getItemColor(index);

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.02, x: isCollapsed ? 0 : 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    relative group flex items-center gap-3 p-3 rounded-xl transition-all duration-300
                    ${isCollapsed ? "justify-center" : ""}
                  `}
                  style={{
                    backgroundColor: active 
                      ? itemColor + "40" 
                      : "transparent",
                    color: active 
                      ? themeColors.text.primary 
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

                  {/* Efecto de brillo al hacer hover */}
                  <div 
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${itemColor}15, transparent)`
                    }}
                  />

                  {/* Icono */}
                  <div
                    className="relative z-10 p-2 rounded-lg transition-all duration-300"
                    style={{
                      backgroundColor: active 
                        ? itemColor + "30" 
                        : themeColors.surface + "20"
                    }}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>

                  {/* Texto */}
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
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
                        backgroundColor: themeColors.surface + "95",
                        color: themeColors.text.primary,
                        borderColor: themeColors.primary + "30"
                      }}
                    >
                      {item.label}
                      <div 
                        className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 rotate-45 border-l border-b"
                        style={{
                          backgroundColor: themeColors.surface + "95",
                          borderColor: themeColors.primary + "30"
                        }}
                      />
                    </motion.div>
                  )}
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 px-2">
        {!isCollapsed ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mx-2 p-3 rounded-lg border"
            style={{
              backgroundColor: themeColors.surface + "30",
              borderColor: themeColors.primary + "20"
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center"
          >
            <div 
              className="w-8 h-8 rounded-lg border flex items-center justify-center"
              style={{
                backgroundColor: themeColors.primary + "20",
                borderColor: themeColors.primary + "30"
              }}
            >
              <div 
                className="w-2 h-2 rounded-full"
                style={{
                  background: `linear-gradient(45deg, ${themeColors.primary}, ${themeColors.secondary})`
                }}
              />
            </div>
          </motion.div>
        )}
      </div>
    </motion.aside>
  );
}
