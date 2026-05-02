"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Filter, ChevronRight } from "lucide-react";
import { SuperadminLayout } from "@/components/superadmin/superadmin-layout";
import { useTheme } from "@/contexts/theme-context";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { listUsers, changeUserRole } from "@/services/superadmin.service";

const ROLES = ["", "user", "distributor", "company", "vendor", "admin", "superadmin"];
const STATUSES = ["", "active", "inactive", "suspended"];

interface UserRow {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  planDisplayName?: string;
  createdAt: string;
}

export default function SuperadminUsuarios() {
  const { themeColors } = useTheme();
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [changingRole, setChangingRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== "superadmin")) {
      router.replace("/login");
    }
  }, [mounted, isAuthenticated, user, router]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await listUsers(params);
      setUsers(res.data || []);
      setTotal(res.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter]);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      fetchUsers();
    }
  }, [mounted, isAuthenticated, fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setChangingRole(userId);
    try {
      await changeUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    } catch (e) {
      alert("Error al cambiar rol");
    } finally {
      setChangingRole(null);
    }
  };

  if (!mounted || !user) return null;

  const roleBadgeColor = (role: string) => {
    const map: Record<string, string> = {
      superadmin: "#7c3aed",
      admin: themeColors.primary,
      distributor: themeColors.secondary,
      company: "#0891b2",
      vendor: "#059669",
      user: "#6b7280",
    };
    return map[role] || "#6b7280";
  };

  return (
    <SuperadminLayout>
      <div className="p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: themeColors.text.primary }}>
            Usuarios ({total})
          </h1>
          <p className="mt-1 text-sm" style={{ color: themeColors.text.secondary }}>
            Todos los usuarios registrados en el sistema
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-3 mb-6"
        >
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 min-w-[200px]"
            style={{ borderColor: themeColors.border, backgroundColor: "#fff" }}
          >
            <Search className="w-4 h-4" style={{ color: themeColors.text.muted }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o email..."
              className="flex-1 text-sm outline-none bg-transparent"
              style={{ color: themeColors.text.primary }}
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border text-sm outline-none"
            style={{ borderColor: themeColors.border, color: themeColors.text.primary }}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{r || "Todos los roles"}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border text-sm outline-none"
            style={{ borderColor: themeColors.border, color: themeColors.text.primary }}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s || "Todos los estados"}</option>
            ))}
          </select>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
          >
            <Filter className="w-4 h-4 inline mr-1" />
            Filtrar
          </button>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border overflow-hidden shadow-lg"
          style={{ borderColor: themeColors.primary + "20", backgroundColor: "#fff" }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div
                className="w-8 h-8 border-4 rounded-full animate-spin"
                style={{ borderColor: themeColors.primary + "30", borderTopColor: themeColors.primary }}
              />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: themeColors.surface }}>
                  {["Nombre", "Email", "Rol", "Plan", "Estado", "Registro", "Cambiar Rol"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: themeColors.text.secondary }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12" style={{ color: themeColors.text.muted }}>
                      No se encontraron usuarios
                    </td>
                  </tr>
                ) : (
                  users.map((u, i) => (
                    <tr
                      key={u.id}
                      className="border-t transition-colors hover:bg-gray-50"
                      style={{ borderColor: themeColors.border }}
                    >
                      <td className="px-4 py-3 font-medium" style={{ color: themeColors.text.primary }}>
                        {u.firstName} {u.lastName}
                      </td>
                      <td className="px-4 py-3" style={{ color: themeColors.text.secondary }}>
                        {u.email}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: roleBadgeColor(u.role) }}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: themeColors.text.muted }}>
                        {u.planDisplayName || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: u.status === "active" ? "#dcfce7" : "#fef2f2",
                            color: u.status === "active" ? "#15803d" : "#dc2626",
                          }}
                        >
                          {u.status || "active"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: themeColors.text.muted }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString("es-ES") : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          disabled={changingRole === u.id}
                          className="text-xs px-2 py-1 rounded-lg border outline-none"
                          style={{ borderColor: themeColors.border, color: themeColors.text.primary }}
                        >
                          {["user", "distributor", "company", "vendor", "admin", "superadmin"].map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </motion.div>
      </div>
    </SuperadminLayout>
  );
}
