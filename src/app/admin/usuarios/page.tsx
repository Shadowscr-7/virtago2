"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Search,
  Users,
  UserCheck,
  UserX,
  Eye,
  ChevronLeft,
  ChevronRight,
  Mail,
  AlertTriangle,
  X,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useAuthStore } from "@/store/auth";
import { useTheme } from "@/contexts/theme-context";
import { showToast } from "@/store/toast-helpers";
import http from "@/api/http-client";

interface AdminUser {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  userType?: string;
  createdAt?: string;
  isActive?: boolean;
  status?: string;
  phone?: string;
}

interface Pagination {
  totalItems: number;
  totalPages: number;
  page: number;
  limit: number;
}

export default function UsuariosAdminPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { themeColors } = useTheme();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    totalItems: 0,
    totalPages: 1,
    page: 1,
    limit: 20,
  });

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [deactivateModal, setDeactivateModal] = useState<{
    show: boolean;
    userId: string;
    userName: string;
  }>({ show: false, userId: "", userName: "" });

  const [resetModal, setResetModal] = useState<{
    show: boolean;
    userId: string;
    userEmail: string;
  }>({ show: false, userId: "", userEmail: "" });

  const [isActioning, setIsActioning] = useState(false);

  const hasAccess = user && (user.role === "admin");

  const loadUsers = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: "20",
        ...(searchQuery && { search: searchQuery }),
        ...(filterType && { type: filterType }),
        ...(filterStatus && { status: filterStatus }),
      });

      const response = await http.get(`/admin/users?${params.toString()}`);
      const data = response.data;

      if (data.success && data.data) {
        setUsers(data.data.users || []);
        setPagination(data.data.pagination || { totalItems: 0, totalPages: 1, page: 1, limit: 20 });
      }
    } catch (error) {
      console.error("[USUARIOS] Error cargando usuarios:", error);
      showToast.error("Error al cargar usuarios");
    } finally {
      setIsLoading(false);
    }
  }, [user, currentPage, searchQuery, filterType, filterStatus]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleDeactivate = async () => {
    if (!deactivateModal.userId) return;
    setIsActioning(true);
    try {
      const response = await http.patch(`/admin/users/${deactivateModal.userId}/deactivate`);
      if (response.data.success) {
        showToast.success("Usuario dado de baja correctamente");
        setDeactivateModal({ show: false, userId: "", userName: "" });
        loadUsers();
      }
    } catch (error) {
      showToast.error("Error al dar de baja al usuario");
    } finally {
      setIsActioning(false);
    }
  };

  const handleSendPasswordReset = async () => {
    if (!resetModal.userId) return;
    setIsActioning(true);
    try {
      const response = await http.post(`/admin/users/${resetModal.userId}/send-password-reset`);
      if (response.data.success) {
        showToast.success(`Email de reseteo enviado a ${resetModal.userEmail}`);
        setResetModal({ show: false, userId: "", userEmail: "" });
      }
    } catch (error) {
      showToast.error("Error al enviar el email de reseteo");
    } finally {
      setIsActioning(false);
    }
  };

  const getUserDisplayName = (u: AdminUser) => {
    const name = `${u.firstName || ""} ${u.lastName || ""}`.trim();
    return name || u.email || u.id;
  };

  const getUserTypeLabel = (u: AdminUser) => {
    const type = u.role || u.userType || "";
    if (type === "admin") return "Admin";
    if (type === "distributor") return "Distribuidor";
    return "Cliente";
  };

  const isUserActive = (u: AdminUser) => {
    return u.isActive !== false && u.status !== "inactive";
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("es-UY", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!hasAccess) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3" style={{ color: "#f59e0b" }} />
            <p className="font-medium" style={{ color: themeColors.text.primary }}>Acceso restringido</p>
            <p className="text-sm mt-1" style={{ color: themeColors.text.secondary }}>Solo administradores pueden ver esta sección</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: themeColors.text.primary }}>Gestión de Usuarios</h1>
            <p className="text-sm mt-1" style={{ color: themeColors.text.secondary }}>
              {pagination.totalItems} usuarios registrados
            </p>
          </div>
          <div className="p-3 rounded-xl" style={{ backgroundColor: `${themeColors.primary}15` }}>
            <Users className="w-6 h-6" style={{ color: themeColors.primary }} />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border p-4" style={{ borderColor: themeColors.border }}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: themeColors.text.muted }} />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm focus:outline-none transition-all"
                style={{
                  backgroundColor: "#f9fafb",
                  borderColor: themeColors.border,
                  color: themeColors.text.primary,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = themeColors.primary;
                  e.target.style.boxShadow = `0 0 0 3px ${themeColors.primary}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = themeColors.border;
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2.5 rounded-lg border text-sm focus:outline-none transition-all"
              style={{
                backgroundColor: "#f9fafb",
                borderColor: themeColors.border,
                color: themeColors.text.primary,
              }}
            >
              <option value="">Todos los tipos</option>
              <option value="user">Clientes</option>
              <option value="distributor">Distribuidores</option>
              <option value="admin">Admins</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2.5 rounded-lg border text-sm focus:outline-none transition-all"
              style={{
                backgroundColor: "#f9fafb",
                borderColor: themeColors.border,
                color: themeColors.text.primary,
              }}
            >
              <option value="">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: themeColors.border }}>
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: themeColors.primary }} />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48" style={{ color: themeColors.text.muted }}>
              <Users className="w-10 h-10 mb-2" />
              <p className="text-sm">No hay usuarios que coincidan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ backgroundColor: `${themeColors.primary}08`, borderColor: themeColors.border }}>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: themeColors.text.secondary }}>
                      Nombre
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: themeColors.text.secondary }}>
                      Email
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: themeColors.text.secondary }}>
                      Tipo
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: themeColors.text.secondary }}>
                      Registro
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: themeColors.text.secondary }}>
                      Estado
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: themeColors.text.secondary }}>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, idx) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="border-t transition-colors hover:bg-red-50"
                      style={{ borderColor: `${themeColors.primary}10` }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                            style={{ backgroundColor: themeColors.primary }}
                          >
                            {(u.firstName?.[0] || u.email?.[0] || "?").toUpperCase()}
                          </div>
                          <span className="text-sm font-medium" style={{ color: themeColors.text.primary }}>
                            {getUserDisplayName(u)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: themeColors.text.secondary }}>{u.email || "-"}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-50 border" style={{ color: themeColors.primary, borderColor: `${themeColors.primary}30` }}>
                          {getUserTypeLabel(u)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: themeColors.text.muted }}>{formatDate(u.createdAt)}</td>
                      <td className="px-4 py-3">
                        {isUserActive(u) ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-50 border border-red-100" style={{ color: themeColors.primary }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColors.primary }} />
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/admin/usuarios/${u.id}`)}
                            className="p-1.5 rounded-lg transition-all"
                            style={{ color: themeColors.text.muted }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.color = themeColors.primary;
                              (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${themeColors.primary}10`;
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.color = themeColors.text.muted;
                              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                            }}
                            title="Ver detalle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setResetModal({
                                show: true,
                                userId: u.id,
                                userEmail: u.email || "",
                              })
                            }
                            className="p-1.5 rounded-lg text-amber-500 transition-all hover:bg-amber-50"
                            title="Enviar reseteo de contraseña"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          {isUserActive(u) ? (
                            <button
                              onClick={() =>
                                setDeactivateModal({
                                  show: true,
                                  userId: u.id,
                                  userName: getUserDisplayName(u),
                                })
                              }
                              className="p-1.5 rounded-lg text-red-500 transition-all hover:bg-red-50"
                              title="Dar de baja"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={async () => {
                                try {
                                  await http.patch(`/admin/users/${u.id}/activate`);
                                  showToast.success("Usuario reactivado");
                                  loadUsers();
                                } catch {
                                  showToast.error("Error al reactivar usuario");
                                }
                              }}
                              className="p-1.5 rounded-lg text-green-600 transition-all hover:bg-green-50"
                              title="Reactivar"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm" style={{ color: themeColors.text.muted }}>
              Mostrando {(currentPage - 1) * 20 + 1}–{Math.min(currentPage * 20, pagination.totalItems)} de {pagination.totalItems}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border disabled:opacity-40 transition-all"
                style={{ borderColor: themeColors.border }}
                onMouseEnter={(e) => { if (currentPage !== 1) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f9fafb"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
              >
                <ChevronLeft className="w-4 h-4" style={{ color: themeColors.text.secondary }} />
              </button>
              <span className="text-sm" style={{ color: themeColors.text.primary }}>
                Pág {currentPage} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={currentPage === pagination.totalPages}
                className="p-2 rounded-lg border disabled:opacity-40 transition-all"
                style={{ borderColor: themeColors.border }}
                onMouseEnter={(e) => { if (currentPage !== pagination.totalPages) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f9fafb"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
              >
                <ChevronRight className="w-4 h-4" style={{ color: themeColors.text.secondary }} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Dar de baja */}
      <AnimatePresence>
        {deactivateModal.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl border p-6 max-w-md w-full"
              style={{ borderColor: themeColors.border }}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-50 rounded-xl flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold" style={{ color: themeColors.text.primary }}>Dar de baja al usuario</h3>
                  <p className="text-sm mt-2" style={{ color: themeColors.text.secondary }}>
                    Estás por desactivar a{" "}
                    <span className="font-semibold" style={{ color: themeColors.text.primary }}>{deactivateModal.userName}</span>.
                    Esta acción lo impedirá de ingresar a la plataforma. Podés reactivarlo más tarde.
                  </p>
                </div>
                <button
                  onClick={() => setDeactivateModal({ show: false, userId: "", userName: "" })}
                  className="p-1 transition-colors"
                  style={{ color: themeColors.text.muted }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-4 border-t" style={{ borderColor: themeColors.border }}>
                <button
                  onClick={() => setDeactivateModal({ show: false, userId: "", userName: "" })}
                  className="flex-1 px-4 py-2.5 rounded-xl font-medium text-sm transition-all"
                  style={{ backgroundColor: "#f3f4f6", color: themeColors.text.secondary }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeactivate}
                  disabled={isActioning}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm transition-all disabled:opacity-50"
                >
                  {isActioning ? "Procesando..." : "Dar de baja"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Enviar reseteo */}
      <AnimatePresence>
        {resetModal.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl border p-6 max-w-md w-full"
              style={{ borderColor: themeColors.border }}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-50 rounded-xl flex-shrink-0">
                  <Mail className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold" style={{ color: themeColors.text.primary }}>Enviar reseteo de contraseña</h3>
                  <p className="text-sm mt-2" style={{ color: themeColors.text.secondary }}>
                    Se enviará un email de restablecimiento de contraseña a{" "}
                    <span className="font-semibold" style={{ color: themeColors.text.primary }}>{resetModal.userEmail}</span>.
                  </p>
                </div>
                <button
                  onClick={() => setResetModal({ show: false, userId: "", userEmail: "" })}
                  className="p-1 transition-colors"
                  style={{ color: themeColors.text.muted }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-4 border-t" style={{ borderColor: themeColors.border }}>
                <button
                  onClick={() => setResetModal({ show: false, userId: "", userEmail: "" })}
                  className="flex-1 px-4 py-2.5 rounded-xl font-medium text-sm transition-all"
                  style={{ backgroundColor: "#f3f4f6", color: themeColors.text.secondary }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSendPasswordReset}
                  disabled={isActioning}
                  className="flex-1 px-4 py-2.5 text-white rounded-xl font-medium text-sm transition-all disabled:opacity-50"
                  style={{ backgroundColor: themeColors.primary }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#991b1b"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = themeColors.primary; }}
                >
                  {isActioning ? "Enviando..." : "Enviar email"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
