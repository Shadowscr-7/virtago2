"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { SuperadminLayout } from "@/components/superadmin/superadmin-layout";
import { useTheme } from "@/contexts/theme-context";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";

const ROLES_INFO = [
  {
    role: "superadmin",
    label: "Super Admin",
    color: "#7c3aed",
    description: "Acceso total al sistema. Puede ver y gestionar todos los usuarios, ordenes, facturas y metricas. Puede cambiar el rol de cualquier usuario.",
    permissions: ["Ver todos los usuarios", "Cambiar roles", "Ver todas las ordenes", "Gestionar facturacion", "Ver metricas globales", "Enviar recordatorios de pago"],
  },
  {
    role: "admin",
    label: "Admin (Distribuidor con acceso admin)",
    color: "#C8102E",
    description: "Administrador del sistema de distribucion. Puede gestionar comisiones y usuarios del sistema.",
    permissions: ["Panel de distribuidor", "Ver comisiones", "Gestionar usuarios del sistema", "Acceso a configuracion avanzada"],
  },
  {
    role: "distributor",
    label: "Distribuidor",
    color: "#E8354A",
    description: "Distribuidor registrado con un plan activo. Puede gestionar su catalogo, clientes, ordenes y ver sus facturas.",
    permissions: ["Panel de distribuidor", "Gestionar productos", "Gestionar clientes", "Ver ordenes", "Ver facturas propias", "Cambiar plan"],
  },
  {
    role: "company",
    label: "Compania",
    color: "#0891b2",
    description: "Empresa cliente del distribuidor. Puede hacer pedidos y ver su historial.",
    permissions: ["Ver catalogo", "Crear pedidos", "Ver historial de pedidos"],
  },
  {
    role: "vendor",
    label: "Vendedor",
    color: "#059669",
    description: "Vendedor asociado a un distribuidor. Puede gestionar productos y ver ordenes.",
    permissions: ["Ver catalogo", "Gestionar productos asignados", "Ver ordenes"],
  },
  {
    role: "user",
    label: "Usuario / Cliente",
    color: "#6b7280",
    description: "Usuario cliente basico. Puede navegar el catalogo y hacer compras.",
    permissions: ["Ver catalogo publico", "Agregar al carrito", "Crear pedidos"],
  },
];

export default function SuperadminRoles() {
  const { themeColors } = useTheme();
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== "superadmin")) {
      router.replace("/login");
    }
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !user) return null;

  return (
    <SuperadminLayout>
      <div className="p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: themeColors.text.primary }}>
            Roles del Sistema
          </h1>
          <p className="mt-1 text-sm" style={{ color: themeColors.text.secondary }}>
            Descripcion de permisos por rol. Para cambiar el rol de un usuario, ve a la seccion Usuarios.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ROLES_INFO.map((info, i) => (
            <motion.div
              key={info.role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-6 rounded-2xl border shadow-lg"
              style={{ borderColor: themeColors.primary + "20", backgroundColor: "#fff" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: info.color + "20" }}
                >
                  <Shield className="w-5 h-5" style={{ color: info.color }} />
                </div>
                <div>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium text-white mr-2"
                    style={{ backgroundColor: info.color }}
                  >
                    {info.role}
                  </span>
                  <span className="text-sm font-semibold" style={{ color: themeColors.text.primary }}>
                    {info.label}
                  </span>
                </div>
              </div>
              <p className="text-sm mb-3" style={{ color: themeColors.text.secondary }}>
                {info.description}
              </p>
              <ul className="space-y-1">
                {info.permissions.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm" style={{ color: themeColors.text.secondary }}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: info.color }} />
                    {p}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </SuperadminLayout>
  );
}
