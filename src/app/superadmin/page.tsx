"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, ShoppingCart, DollarSign, BarChart3 } from "lucide-react";
import { SuperadminLayout } from "@/components/superadmin/superadmin-layout";
import { useTheme } from "@/contexts/theme-context";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";

export default function SuperadminDashboard() {
  const { themeColors } = useTheme();
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== "superadmin")) {
      router.replace("/login");
    }
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !user) return null;

  const quickLinks = [
    { label: "Usuarios", href: "/superadmin/usuarios", icon: Users, color: themeColors.primary },
    { label: "Ordenes", href: "/superadmin/ordenes", icon: ShoppingCart, color: themeColors.secondary },
    { label: "Facturacion", href: "/superadmin/facturacion", icon: DollarSign, color: themeColors.accent },
    { label: "Metricas", href: "/superadmin/metricas", icon: BarChart3, color: themeColors.primary },
  ];

  return (
    <SuperadminLayout>
      <div className="p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1
            className="text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})` }}
          >
            Panel de Super Admin
          </h1>
          <p className="mt-2" style={{ color: themeColors.text.secondary }}>
            Bienvenido, {user.firstName}. Tienes acceso completo al sistema.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickLinks.map((link, i) => {
            const Icon = link.icon;
            return (
              <motion.a
                key={link.label}
                href={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="p-6 rounded-2xl border backdrop-blur-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer block"
                style={{
                  backgroundColor: themeColors.surface + "80",
                  borderColor: themeColors.primary + "20",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `linear-gradient(45deg, ${link.color}, ${link.color}90)` }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold" style={{ color: themeColors.text.primary }}>
                  {link.label}
                </h3>
              </motion.a>
            );
          })}
        </div>
      </div>
    </SuperadminLayout>
  );
}
