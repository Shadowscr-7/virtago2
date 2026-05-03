"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  ShoppingCart,
  AlertTriangle,
  UserX,
  UserCheck,
  X,
  Tag,
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
  city?: string;
  country?: string;
  gender?: string;
}

export default function UsuarioDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const { themeColors } = useTheme();

  const [userData, setUserData] = useState<AdminUser | null>(null);
  const [ordersCount, setOrdersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isActioning, setIsActioning] = useState(false);

  const [deactivateModal, setDeactivateModal] = useState(false);

  const loadUser = async () => {
    setIsLoading(true);
    try {
      const response = await http.get(`/admin/users/${id}`);
      if (response.data.success && response.data.data) {
        setUserData(response.data.data.user);
        setOrdersCount(response.data.data.ordersCount || 0);
      }
    } catch (error) {
      showToast.error("Error al cargar el usuario");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadUser();
  }, [id]);

  const handleDeactivate = async () => {
    setIsActioning(true);
    try {
      const response = await http.patch(`/admin/users/${id}/deactivate`);
      if (response.data.success) {
        showToast.success("Usuario dado de baja correctamente");
        setDeactivateModal(false);
        loadUser();
      }
    } catch {
      showToast.error("Error al dar de baja al usuario");
    } finally {
      setIsActioning(false);
    }
  };

  const handleActivate = async () => {
    setIsActioning(true);
    try {
      await http.patch(`/admin/users/${id}/activate`);
      showToast.success("Usuario reactivado");
      loadUser();
    } catch {
      showToast.error("Error al reactivar usuario");
    } finally {
      setIsActioning(false);
    }
  };

  const handleSendPasswordReset = async () => {
    setIsActioning(true);
    try {
      await http.post(`/admin/users/${id}/send-password-reset`);
      showToast.success("Email de reseteo enviado");
    } catch {
      showToast.error("Error al enviar el email de reseteo");
    } finally {
      setIsActioning(false);
    }
  };

  const isActive = userData?.isActive !== false && userData?.status !== "inactive";

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("es-UY", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getUserTypeLabel = (u: AdminUser) => {
    const type = u.role || u.userType || "";
    if (type === "admin") return "Administrador";
    if (type === "distributor") return "Distribuidor";
    return "Cliente";
  };

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <AlertTriangle className="w-8 h-8 text-amber-500 mr-3" />
          <p style={{ color: themeColors.text.secondary }}>Acceso restringido</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Back button */}
        <button
          onClick={() => router.push("/admin/usuarios")}
          className="flex items-center gap-2 text-sm transition-colors"
          style={{ color: themeColors.text.secondary }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = themeColors.text.primary; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = themeColors.text.secondary; }}
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a usuarios
        </button>

        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: themeColors.primary }} />
          </div>
        ) : !userData ? (
          <div className="flex items-center justify-center h-48" style={{ color: themeColors.text.muted }}>
            <p>Usuario no encontrado</p>
          </div>
        ) : (
          <>
            {/* Header card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border shadow-sm p-6"
              style={{ borderColor: themeColors.border }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
                    style={{ backgroundColor: themeColors.primary }}
                  >
                    {(userData.firstName?.[0] || userData.email?.[0] || "?").toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold" style={{ color: themeColors.text.primary }}>
                      {`${userData.firstName || ""} ${userData.lastName || ""}`.trim() || userData.email}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm px-2 py-0.5 rounded-full bg-red-50 border" style={{ color: themeColors.primary, borderColor: `${themeColors.primary}30` }}>
                        {getUserTypeLabel(userData)}
                      </span>
                      {isActive ? (
                        <span className="text-sm px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Activo
                        </span>
                      ) : (
                        <span className="text-sm px-2 py-0.5 rounded-full bg-red-50 border border-red-100 flex items-center gap-1" style={{ color: themeColors.primary }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColors.primary }} />
                          Inactivo
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSendPasswordReset}
                    disabled={isActioning}
                    className="flex items-center gap-2 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-sm font-medium transition-all border border-amber-200 disabled:opacity-50"
                  >
                    <Mail className="w-4 h-4" />
                    Resetear contraseña
                  </button>
                  {isActive ? (
                    <button
                      onClick={() => setDeactivateModal(true)}
                      disabled={isActioning}
                      className="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition-all border border-red-200 disabled:opacity-50"
                      style={{ color: themeColors.primary }}
                    >
                      <UserX className="w-4 h-4" />
                      Dar de baja
                    </button>
                  ) : (
                    <button
                      onClick={handleActivate}
                      disabled={isActioning}
                      className="flex items-center gap-2 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-medium transition-all border border-green-200 disabled:opacity-50"
                    >
                      <UserCheck className="w-4 h-4" />
                      Reactivar
                    </button>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Info cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Datos personales */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl border shadow-sm p-5"
                style={{ borderColor: themeColors.border }}
              >
                <h2 className="text-sm font-semibold uppercase tracking-wide mb-4 flex items-center gap-2" style={{ color: themeColors.text.secondary }}>
                  <User className="w-4 h-4" style={{ color: themeColors.primary }} />
                  Datos personales
                </h2>
                <div className="space-y-3">
                  <InfoRow label="Nombre" value={`${userData.firstName || ""} ${userData.lastName || ""}`.trim() || "-"} themeColors={themeColors} />
                  <InfoRow label="Email" value={userData.email || "-"} icon={<Mail className="w-3.5 h-3.5" style={{ color: themeColors.text.muted }} />} themeColors={themeColors} />
                  <InfoRow label="Teléfono" value={userData.phone || "-"} icon={<Phone className="w-3.5 h-3.5" style={{ color: themeColors.text.muted }} />} themeColors={themeColors} />
                  <InfoRow label="Ciudad" value={userData.city || "-"} themeColors={themeColors} />
                  <InfoRow label="País" value={userData.country || "-"} themeColors={themeColors} />
                  <InfoRow label="Género" value={userData.gender || "-"} themeColors={themeColors} />
                </div>
              </motion.div>

              {/* Actividad */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-xl border shadow-sm p-5"
                style={{ borderColor: themeColors.border }}
              >
                <h2 className="text-sm font-semibold uppercase tracking-wide mb-4 flex items-center gap-2" style={{ color: themeColors.text.secondary }}>
                  <ShoppingCart className="w-4 h-4" style={{ color: themeColors.primary }} />
                  Actividad
                </h2>
                <div className="space-y-3">
                  <InfoRow
                    label="Fecha de registro"
                    value={formatDate(userData.createdAt)}
                    icon={<Calendar className="w-3.5 h-3.5" style={{ color: themeColors.text.muted }} />}
                    themeColors={themeColors}
                  />
                  <InfoRow label="Pedidos realizados" value={String(ordersCount)} icon={<ShoppingCart className="w-3.5 h-3.5" style={{ color: themeColors.text.muted }} />} themeColors={themeColors} />
                  <InfoRow label="Rol" value={getUserTypeLabel(userData)} icon={<Tag className="w-3.5 h-3.5" style={{ color: themeColors.text.muted }} />} themeColors={themeColors} />
                  <InfoRow label="Estado de cuenta" value={isActive ? "Activa" : "Suspendida"} themeColors={themeColors} />
                </div>
              </motion.div>
            </div>
          </>
        )}
      </div>

      {/* Modal: Dar de baja */}
      <AnimatePresence>
        {deactivateModal && (
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
                    Esta acción desactivará la cuenta de{" "}
                    <span className="font-semibold" style={{ color: themeColors.text.primary }}>
                      {`${userData?.firstName || ""} ${userData?.lastName || ""}`.trim() || userData?.email}
                    </span>
                    . El usuario no podrá ingresar mientras esté inactivo.
                  </p>
                </div>
                <button onClick={() => setDeactivateModal(false)} className="p-1 transition-colors" style={{ color: themeColors.text.muted }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-3 mt-6 pt-4 border-t" style={{ borderColor: themeColors.border }}>
                <button
                  onClick={() => setDeactivateModal(false)}
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
                  {isActioning ? "Procesando..." : "Confirmar baja"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}

function InfoRow({
  label,
  value,
  icon,
  themeColors,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  themeColors: { text: { primary: string; secondary: string; muted: string }; border: string };
}) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b last:border-0" style={{ borderColor: `${themeColors.border}60` }}>
      <span className="text-sm flex items-center gap-1.5" style={{ color: themeColors.text.secondary }}>
        {icon}
        {label}
      </span>
      <span className="text-sm font-medium" style={{ color: themeColors.text.primary }}>{value}</span>
    </div>
  );
}
