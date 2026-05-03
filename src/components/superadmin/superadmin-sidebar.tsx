"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ShoppingCart,
  FileText,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { useAuthStore } from "@/store/auth";

const menuItems = [
  {
    id: "dashboard",
    label: "Inicio",
    icon: LayoutDashboard,
    href: "/superadmin",
  },
  {
    id: "usuarios",
    label: "Usuarios",
    icon: Users,
    href: "/superadmin/usuarios",
  },
  {
    id: "roles",
    label: "Roles",
    icon: ShieldCheck,
    href: "/superadmin/roles",
  },
  {
    id: "ordenes",
    label: "Ordenes",
    icon: ShoppingCart,
    href: "/superadmin/ordenes",
  },
  {
    id: "facturacion",
    label: "Facturacion",
    icon: FileText,
    href: "/superadmin/facturacion",
  },
  {
    id: "metricas",
    label: "Metricas",
    icon: BarChart3,
    href: "/superadmin/metricas",
  },
];

let hasPlayedSuperadminSidebarIntro = false;

export function SuperadminSidebar() {
  const { themeColors } = useTheme();
  const { user, logout } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [shouldPlayIntro] = useState(() => !hasPlayedSuperadminSidebarIntro);
  const pathname = usePathname();

  useEffect(() => {
    hasPlayedSuperadminSidebarIntro = true;
  }, []);

  const isActive = (href: string) => {
    if (href === "/superadmin") return pathname === "/superadmin";
    return pathname.startsWith(href);
  };

  return (
    <motion.aside
      initial={shouldPlayIntro ? { x: -100 } : false}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative h-screen border-r flex flex-col ${isCollapsed ? "w-16" : "w-64"} transition-all duration-300 ease-in-out`}
      style={{
        backgroundColor: "#ffffff",
        borderColor: themeColors.border,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: themeColors.border }}
      >
        {!isCollapsed && (
          <motion.div initial={shouldPlayIntro ? { opacity: 0 } : false} animate={{ opacity: 1 }}>
            <h2
              className="text-lg font-bold"
              style={{ color: themeColors.primary }}
            >
              Super Admin
            </h2>
            <p className="text-xs" style={{ color: themeColors.text.muted }}>
              {user?.firstName} {user?.lastName}
            </p>
          </motion.div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg transition-all hover:scale-105"
          style={{
            backgroundColor: themeColors.primary,
            color: "#ffffff",
          }}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link key={item.id} href={item.href}>
              <motion.div
                initial={shouldPlayIntro ? { opacity: 0, x: -20 } : false}
                animate={{ opacity: 1, x: 0 }}
                transition={shouldPlayIntro ? { delay: index * 0.05 } : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all duration-200 cursor-pointer ${
                  active ? "shadow-sm" : "hover:scale-[1.01] hover:bg-gray-50"
                }`}
                style={{
                  backgroundColor: active ? themeColors.primary : "transparent",
                  borderLeft: active ? `3px solid ${themeColors.primary}` : "3px solid transparent",
                }}
              >
                <Icon
                  className="w-5 h-5 flex-shrink-0"
                  style={{ color: active ? "#ffffff" : themeColors.text.secondary }}
                />
                {!isCollapsed && (
                  <span
                    className="text-sm font-medium"
                    style={{ color: active ? "#ffffff" : themeColors.text.secondary }}
                  >
                    {item.label}
                  </span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t" style={{ borderColor: themeColors.border }}>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:scale-[1.01]"
          style={{ color: themeColors.text.secondary }}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Cerrar sesion</span>}
        </button>
      </div>
    </motion.aside>
  );
}
