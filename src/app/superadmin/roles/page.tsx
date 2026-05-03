"use client";

import { type FormEvent, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Edit2, Plus, Save, Shield, X } from "lucide-react";
import { SuperadminLayout } from "@/components/superadmin/superadmin-layout";
import { useTheme } from "@/contexts/theme-context";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";

interface RoleInfo {
  role: string;
  label: string;
  description: string;
  permissions: string[];
}

interface RoleFormState {
  role: string;
  label: string;
  description: string;
  permissionsText: string;
}

const ROLES_INFO: RoleInfo[] = [
  {
    role: "superadmin",
    label: "Super Admin",
    description: "Acceso total al sistema. Puede ver y gestionar todos los usuarios, ordenes, facturas y metricas. Puede cambiar el rol de cualquier usuario.",
    permissions: ["Ver todos los usuarios", "Cambiar roles", "Ver todas las ordenes", "Gestionar facturacion", "Ver metricas globales", "Enviar recordatorios de pago"],
  },
  {
    role: "admin",
    label: "Admin (Distribuidor con acceso admin)",
    description: "Administrador del sistema de distribucion. Puede gestionar comisiones y usuarios del sistema.",
    permissions: ["Panel de distribuidor", "Ver comisiones", "Gestionar usuarios del sistema", "Acceso a configuracion avanzada"],
  },
  {
    role: "distributor",
    label: "Distribuidor",
    description: "Distribuidor registrado con un plan activo. Puede gestionar su catalogo, clientes, ordenes y ver sus facturas.",
    permissions: ["Panel de distribuidor", "Gestionar productos", "Gestionar clientes", "Ver ordenes", "Ver facturas propias", "Cambiar plan"],
  },
  {
    role: "company",
    label: "Compania",
    description: "Empresa cliente del distribuidor. Puede hacer pedidos y ver su historial.",
    permissions: ["Ver catalogo", "Crear pedidos", "Ver historial de pedidos"],
  },
  {
    role: "vendor",
    label: "Vendedor",
    description: "Vendedor asociado a un distribuidor. Puede gestionar productos y ver ordenes.",
    permissions: ["Ver catalogo", "Gestionar productos asignados", "Ver ordenes"],
  },
  {
    role: "user",
    label: "Usuario / Cliente",
    description: "Usuario cliente basico. Puede navegar el catalogo y hacer compras.",
    permissions: ["Ver catalogo publico", "Agregar al carrito", "Crear pedidos"],
  },
];

const EMPTY_FORM: RoleFormState = {
  role: "",
  label: "",
  description: "",
  permissionsText: "",
};

export default function SuperadminRoles() {
  const { themeColors } = useTheme();
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [roles, setRoles] = useState<RoleInfo[]>(ROLES_INFO);
  const [editingRole, setEditingRole] = useState<RoleInfo | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleForm, setRoleForm] = useState<RoleFormState>(EMPTY_FORM);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== "superadmin")) {
      router.replace("/login");
    }
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !user) return null;

  const solidRed = "#C8102E";

  const openCreateModal = () => {
    setEditingRole(null);
    setRoleForm(EMPTY_FORM);
    setIsRoleModalOpen(true);
  };

  const openEditModal = (role: RoleInfo) => {
    setEditingRole(role);
    setRoleForm({
      role: role.role,
      label: role.label,
      description: role.description,
      permissionsText: role.permissions.join("\n"),
    });
    setIsRoleModalOpen(true);
  };

  const closeRoleModal = () => {
    setIsRoleModalOpen(false);
    setEditingRole(null);
    setRoleForm(EMPTY_FORM);
  };

  const handleRoleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedRole = roleForm.role.trim().toLowerCase().replace(/\s+/g, "-");
    const nextRole: RoleInfo = {
      role: normalizedRole,
      label: roleForm.label.trim(),
      description: roleForm.description.trim(),
      permissions: roleForm.permissionsText
        .split("\n")
        .map((permission) => permission.trim())
        .filter(Boolean),
    };

    if (!nextRole.role || !nextRole.label || !nextRole.description || nextRole.permissions.length === 0) {
      return;
    }

    setRoles((currentRoles) => {
      if (editingRole) {
        return currentRoles.map((role) => (role.role === editingRole.role ? nextRole : role));
      }

      const roleExists = currentRoles.some((role) => role.role === nextRole.role);
      return roleExists ? currentRoles : [...currentRoles, nextRole];
    });
    closeRoleModal();
  };

  return (
    <SuperadminLayout>
      <div className="p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: themeColors.text.primary }}>
              Roles del Sistema
            </h1>
            <p className="mt-1 text-sm" style={{ color: themeColors.text.secondary }}>
              Descripcion de permisos por rol. Para cambiar el rol de un usuario, ve a la seccion Usuarios.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02]"
            style={{ backgroundColor: solidRed }}
          >
            <Plus className="h-4 w-4" />
            Nuevo rol
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((info, i) => (
            <motion.div
              key={info.role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border bg-white p-6 shadow-lg"
              style={{ borderColor: themeColors.border }}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: solidRed }}
                  >
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span
                      className="mr-2 rounded-full px-2 py-0.5 text-xs font-medium text-white"
                      style={{ backgroundColor: solidRed }}
                    >
                      {info.role}
                    </span>
                    <span className="text-sm font-semibold" style={{ color: themeColors.text.primary }}>
                      {info.label}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openEditModal(info)}
                  aria-label={`Editar rol ${info.label}`}
                  title={`Editar rol ${info.label}`}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border bg-white text-[#C8102E] transition-colors hover:bg-[#C8102E] hover:text-white"
                  style={{ borderColor: solidRed }}
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm mb-3" style={{ color: themeColors.text.secondary }}>
                {info.description}
              </p>
              <ul className="space-y-1">
                {info.permissions.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm" style={{ color: themeColors.text.secondary }}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: solidRed }} />
                    {p}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {isRoleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-full max-w-2xl rounded-2xl border bg-white p-6 shadow-2xl"
              style={{ borderColor: themeColors.border }}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold" style={{ color: themeColors.text.primary }}>
                    {editingRole ? "Editar rol" : "Crear rol"}
                  </h2>
                  <p className="mt-1 text-sm" style={{ color: themeColors.text.secondary }}>
                    Los cambios se guardan visualmente en esta pantalla.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeRoleModal}
                  aria-label="Cerrar"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border bg-white"
                  style={{ borderColor: themeColors.border, color: themeColors.text.secondary }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleRoleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="space-y-1 text-sm font-medium" style={{ color: themeColors.text.primary }}>
                    Clave del rol
                    <input
                      value={roleForm.role}
                      onChange={(event) => setRoleForm((form) => ({ ...form, role: event.target.value }))}
                      className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#C8102E]"
                      style={{ borderColor: themeColors.border, color: themeColors.text.primary }}
                      placeholder="manager"
                      required
                    />
                  </label>
                  <label className="space-y-1 text-sm font-medium" style={{ color: themeColors.text.primary }}>
                    Nombre visible
                    <input
                      value={roleForm.label}
                      onChange={(event) => setRoleForm((form) => ({ ...form, label: event.target.value }))}
                      className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#C8102E]"
                      style={{ borderColor: themeColors.border, color: themeColors.text.primary }}
                      placeholder="Manager"
                      required
                    />
                  </label>
                </div>

                <label className="block space-y-1 text-sm font-medium" style={{ color: themeColors.text.primary }}>
                  Descripcion
                  <textarea
                    value={roleForm.description}
                    onChange={(event) => setRoleForm((form) => ({ ...form, description: event.target.value }))}
                    rows={3}
                    className="mt-1 w-full resize-none rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#C8102E]"
                    style={{ borderColor: themeColors.border, color: themeColors.text.primary }}
                    placeholder="Describe el alcance del rol"
                    required
                  />
                </label>

                <label className="block space-y-1 text-sm font-medium" style={{ color: themeColors.text.primary }}>
                  Permisos
                  <textarea
                    value={roleForm.permissionsText}
                    onChange={(event) => setRoleForm((form) => ({ ...form, permissionsText: event.target.value }))}
                    rows={5}
                    className="mt-1 w-full resize-none rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#C8102E]"
                    style={{ borderColor: themeColors.border, color: themeColors.text.primary }}
                    placeholder={"Un permiso por linea\nVer reportes\nGestionar clientes"}
                    required
                  />
                </label>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeRoleModal}
                    className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold"
                    style={{ borderColor: themeColors.border, color: themeColors.text.primary }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
                    style={{ backgroundColor: solidRed }}
                  >
                    <Save className="h-4 w-4" />
                    Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </SuperadminLayout>
  );
}
