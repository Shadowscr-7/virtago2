"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Upload,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useAuthStore } from "@/store/auth";
import { useTheme } from "@/contexts/theme-context";
import { showToast } from "@/store/toast-helpers";
import http from "@/api/http-client";

interface Commission {
  id: string;
  distributorId: string;
  distributorName: string;
  distributorCode: string;
  month: string;
  totalTransactions: number;
  commissionRate: number;
  commissionAmount: number;
  status: "pending" | "paid";
  paymentProofUrl?: string;
  paymentProofType?: string;
  paidAt?: string;
}

export default function ComisionesAdminPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { themeColors } = useTheme();

  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);

  const [payModal, setPayModal] = useState<{
    show: boolean;
    commissionId: string;
    distributorName: string;
    amount: number;
  }>({ show: false, commissionId: "", distributorName: "", amount: 0 });

  const [proofUrl, setProofUrl] = useState("");
  const [proofType, setProofType] = useState<"image" | "pdf">("image");
  const [isActioning, setIsActioning] = useState(false);

  const hasAccess = user && user.role === "admin";

  const loadCommissions = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await http.get(`/admin/commissions?month=${selectedMonth}`);
      if (response.data.success) {
        setCommissions(response.data.data || []);
      }
    } catch (error) {
      showToast.error("Error al cargar comisiones");
    } finally {
      setIsLoading(false);
    }
  }, [user, selectedMonth]);

  useEffect(() => {
    loadCommissions();
  }, [loadCommissions]);

  const handleMarkPaid = async () => {
    if (!proofUrl.trim()) {
      showToast.error("Debes ingresar la URL del comprobante");
      return;
    }
    setIsActioning(true);
    try {
      const response = await http.patch(
        `/admin/commissions/${payModal.commissionId}/mark-paid`,
        { paymentProofUrl: proofUrl, paymentProofType: proofType }
      );
      if (response.data.success) {
        showToast.success("Pago registrado correctamente");
        setPayModal({ show: false, commissionId: "", distributorName: "", amount: 0 });
        setProofUrl("");
        loadCommissions();
      }
    } catch {
      showToast.error("Error al registrar el pago");
    } finally {
      setIsActioning(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: "UYU",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (rate: number) => `${(rate * 100).toFixed(2)}%`;

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("es-UY", { year: "numeric", month: "long" });
    return { value, label };
  });

  const totalPending = commissions
    .filter((c) => c.status === "pending")
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  const totalPaid = commissions
    .filter((c) => c.status === "paid")
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  if (!hasAccess) {
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: themeColors.text.primary }}>Panel de Comisiones</h1>
            <p className="text-sm mt-1" style={{ color: themeColors.text.secondary }}>
              Comisiones por transacciones entre clientes y distribuidores
            </p>
          </div>
          <div className="p-3 rounded-xl" style={{ backgroundColor: `${themeColors.primary}15` }}>
            <DollarSign className="w-6 h-6" style={{ color: themeColors.primary }} />
          </div>
        </div>

        {/* Summary + month filter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: themeColors.border }}>
            <p className="text-xs uppercase tracking-wide mb-1" style={{ color: themeColors.text.muted }}>Pendiente de cobro</p>
            <p className="text-2xl font-bold text-amber-600">{formatCurrency(totalPending)}</p>
          </div>
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: themeColors.border }}>
            <p className="text-xs uppercase tracking-wide mb-1" style={{ color: themeColors.text.muted }}>Cobrado este mes</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
          </div>
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: themeColors.border }}>
            <p className="text-xs uppercase tracking-wide mb-2" style={{ color: themeColors.text.muted }}>Filtrar por mes</p>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none transition-all"
              style={{
                backgroundColor: "#f9fafb",
                borderColor: themeColors.border,
                color: themeColors.text.primary,
              }}
            >
              {monthOptions.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: themeColors.border }}>
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: themeColors.primary }} />
            </div>
          ) : commissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48" style={{ color: themeColors.text.muted }}>
              <DollarSign className="w-10 h-10 mb-2" />
              <p className="text-sm">No hay comisiones para este mes</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ backgroundColor: `${themeColors.primary}08`, borderColor: themeColors.border }}>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: themeColors.text.secondary }}>
                      Distribuidor
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: themeColors.text.secondary }}>
                      Mes
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: themeColors.text.secondary }}>
                      Total transacc.
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: themeColors.text.secondary }}>
                      % Comisión
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: themeColors.text.secondary }}>
                      Monto a cobrar
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
                  {commissions.map((c, idx) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="border-t transition-colors cursor-pointer hover:bg-red-50"
                      style={{ borderColor: `${themeColors.primary}10` }}
                      onClick={() => router.push(`/admin/comisiones/${c.id}`)}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium" style={{ color: themeColors.text.primary }}>{c.distributorName}</p>
                          <p className="text-xs" style={{ color: themeColors.text.muted }}>{c.distributorCode}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: themeColors.text.secondary }}>
                        {new Date(`${c.month}-01`).toLocaleDateString("es-UY", {
                          year: "numeric",
                          month: "long",
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-right" style={{ color: themeColors.text.primary }}>
                        {formatCurrency(c.totalTransactions)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right" style={{ color: themeColors.text.secondary }}>
                        {formatPercent(c.commissionRate)}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-right" style={{ color: themeColors.primary }}>
                        {formatCurrency(c.commissionAmount)}
                      </td>
                      <td className="px-4 py-3">
                        {c.status === "paid" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                            <CheckCircle className="w-3 h-3" />
                            Pagado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                            <Clock className="w-3 h-3" />
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          {c.status === "pending" && (
                            <button
                              onClick={() =>
                                setPayModal({
                                  show: true,
                                  commissionId: c.id,
                                  distributorName: c.distributorName,
                                  amount: c.commissionAmount,
                                })
                              }
                              className="px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-all hover:opacity-90"
                              style={{ backgroundColor: themeColors.primary }}
                            >
                              Registrar pago
                            </button>
                          )}
                          <button
                            onClick={() => router.push(`/admin/comisiones/${c.id}`)}
                            className="p-1.5 rounded-lg transition-all"
                            style={{ color: themeColors.text.muted }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.color = themeColors.text.primary;
                              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f3f4f6";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.color = themeColors.text.muted;
                              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                            }}
                            title="Ver detalle"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Registrar pago */}
      <AnimatePresence>
        {payModal.show && (
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
              className="bg-white rounded-2xl shadow-2xl border p-6 max-w-lg w-full"
              style={{ borderColor: themeColors.border }}
            >
              <div className="flex items-start gap-4 mb-5">
                <div className="p-3 bg-red-50 rounded-xl flex-shrink-0">
                  <Upload className="w-6 h-6" style={{ color: themeColors.primary }} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold" style={{ color: themeColors.text.primary }}>Registrar pago de comisión</h3>
                  <p className="text-sm mt-1" style={{ color: themeColors.text.secondary }}>
                    Distribuidor:{" "}
                    <span className="font-semibold" style={{ color: themeColors.text.primary }}>{payModal.distributorName}</span>
                  </p>
                  <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                    Monto:{" "}
                    <span className="font-semibold" style={{ color: themeColors.primary }}>
                      {new Intl.NumberFormat("es-UY", {
                        style: "currency",
                        currency: "UYU",
                        minimumFractionDigits: 0,
                      }).format(payModal.amount)}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setPayModal({ show: false, commissionId: "", distributorName: "", amount: 0 });
                    setProofUrl("");
                  }}
                  className="p-1 transition-colors"
                  style={{ color: themeColors.text.muted }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>
                    Tipo de comprobante
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setProofType("image")}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all flex-1"
                      style={{
                        borderColor: proofType === "image" ? themeColors.primary : themeColors.border,
                        backgroundColor: proofType === "image" ? `${themeColors.primary}10` : "transparent",
                        color: proofType === "image" ? themeColors.primary : themeColors.text.secondary,
                      }}
                    >
                      <ImageIcon className="w-4 h-4" />
                      Imagen
                    </button>
                    <button
                      onClick={() => setProofType("pdf")}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all flex-1"
                      style={{
                        borderColor: proofType === "pdf" ? themeColors.primary : themeColors.border,
                        backgroundColor: proofType === "pdf" ? `${themeColors.primary}10` : "transparent",
                        color: proofType === "pdf" ? themeColors.primary : themeColors.text.secondary,
                      }}
                    >
                      <FileText className="w-4 h-4" />
                      PDF
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>
                    URL del comprobante
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={proofUrl}
                    onChange={(e) => setProofUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none transition-all"
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
                  <p className="text-xs mt-1" style={{ color: themeColors.text.muted }}>
                    Subí el comprobante a Cloudinary o drive y pegá la URL aquí
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-4 border-t" style={{ borderColor: themeColors.border }}>
                <button
                  onClick={() => {
                    setPayModal({ show: false, commissionId: "", distributorName: "", amount: 0 });
                    setProofUrl("");
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl font-medium text-sm transition-all"
                  style={{ backgroundColor: "#f3f4f6", color: themeColors.text.secondary }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleMarkPaid}
                  disabled={isActioning || !proofUrl.trim()}
                  className="flex-1 px-4 py-2.5 text-white rounded-xl font-medium text-sm transition-all disabled:opacity-50 hover:opacity-90"
                  style={{ backgroundColor: themeColors.primary }}
                >
                  {isActioning ? "Registrando..." : "Confirmar pago"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
