"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Filter, Bell, CheckCircle, Upload } from "lucide-react";
import { SuperadminLayout } from "@/components/superadmin/superadmin-layout";
import { useTheme } from "@/contexts/theme-context";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { listInvoices, sendInvoiceReminder, markInvoicePaid } from "@/services/superadmin.service";

interface InvoiceRow {
  id: string;
  invoiceNo: string;
  type: "commission" | "plan";
  distributorName: string;
  distributorId: string;
  baseAmount: number;
  rate: number | null;
  amount: number;
  status: "pending" | "paid";
  dueDate: string;
  month: string;
  planDisplayName?: string;
  createdAt: string;
}

export default function SuperadminFacturacion() {
  const { themeColors } = useTheme();
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [distFilter, setDistFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [markPaidModal, setMarkPaidModal] = useState<{ id: string; invoiceNo: string } | null>(null);
  const [proofUrl, setProofUrl] = useState("");
  const [proofType, setProofType] = useState<"image" | "pdf">("image");

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== "superadmin")) {
      router.replace("/login");
    }
  }, [mounted, isAuthenticated, user, router]);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;
      if (distFilter) params.distributorId = distFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const res = await listInvoices(params);
      setInvoices(res.data || []);
      setTotal(res.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, distFilter, dateFrom, dateTo]);

  useEffect(() => {
    if (mounted && isAuthenticated) fetchInvoices();
  }, [mounted, isAuthenticated, fetchInvoices]);

  const handleReminder = async (id: string) => {
    setActionLoading(id);
    try {
      await sendInvoiceReminder(id);
      alert("Recordatorio enviado exitosamente");
    } catch (e: any) {
      alert(e.message || "Error al enviar recordatorio");
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkPaid = async () => {
    if (!markPaidModal || !proofUrl) return;
    setActionLoading(markPaidModal.id);
    try {
      await markInvoicePaid(markPaidModal.id, proofUrl, proofType);
      setInvoices((prev) => prev.map((inv) => (inv.id === markPaidModal.id ? { ...inv, status: "paid" } : inv)));
      setMarkPaidModal(null);
      setProofUrl("");
    } catch (e: any) {
      alert(e.message || "Error al marcar como pagada");
    } finally {
      setActionLoading(null);
    }
  };

  if (!mounted || !user) return null;

  const isOverdue = (inv: InvoiceRow) =>
    inv.status === "pending" && new Date() > new Date(inv.dueDate);

  return (
    <SuperadminLayout>
      <div className="p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: themeColors.text.primary }}>
            Facturacion ({total})
          </h1>
          <p className="mt-1 text-sm" style={{ color: themeColors.text.secondary }}>
            Facturas de comision y plan que Virtago cobra a distribuidores
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-3 mb-6"
        >
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border text-sm outline-none"
            style={{ borderColor: themeColors.border, color: themeColors.text.primary }}
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="paid">Pagado</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border text-sm outline-none"
            style={{ borderColor: themeColors.border, color: themeColors.text.primary }}
          >
            <option value="">Todos los tipos</option>
            <option value="commission">Comision</option>
            <option value="plan">Plan</option>
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 rounded-xl border text-sm outline-none"
            style={{ borderColor: themeColors.border, color: themeColors.text.primary }}
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 rounded-xl border text-sm outline-none"
            style={{ borderColor: themeColors.border, color: themeColors.text.primary }}
          />
          <button
            onClick={fetchInvoices}
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
              <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: themeColors.primary + "30", borderTopColor: themeColors.primary }} />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: themeColors.surface }}>
                  {["N° Factura", "Distribuidor", "Tipo", "Base", "Tasa", "A Cobrar", "Estado", "Vencimiento", "Acciones"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: themeColors.text.secondary }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12" style={{ color: themeColors.text.muted }}>
                      No se encontraron facturas
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => {
                    const overdue = isOverdue(inv);
                    return (
                      <tr key={inv.id} className="border-t hover:bg-gray-50 transition-colors" style={{ borderColor: themeColors.border }}>
                        <td className="px-4 py-3">
                          <Link href={`/superadmin/facturacion/${inv.id}`} className="font-medium hover:underline" style={{ color: themeColors.primary }}>
                            {inv.invoiceNo}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: themeColors.text.primary }}>{inv.distributorName}</td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: inv.type === "commission" ? themeColors.primary + "15" : themeColors.secondary + "15",
                              color: inv.type === "commission" ? themeColors.primary : themeColors.secondary,
                            }}
                          >
                            {inv.type === "commission" ? "Comision" : `Plan ${inv.planDisplayName || ""}`}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: themeColors.text.secondary }}>
                          ${(inv.baseAmount || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: themeColors.text.secondary }}>
                          {inv.rate !== null ? `${(inv.rate * 100).toFixed(2)}%` : "—"}
                        </td>
                        <td className="px-4 py-3 font-semibold" style={{ color: themeColors.text.primary }}>
                          ${(inv.amount || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: inv.status === "paid" ? "#dcfce7" : overdue ? "#fee2e2" : "#fef3c7",
                              color: inv.status === "paid" ? "#15803d" : overdue ? "#dc2626" : "#d97706",
                            }}
                          >
                            {inv.status === "paid" ? "Pagado" : overdue ? "Vencido" : "Pendiente"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: overdue ? "#dc2626" : themeColors.text.muted }}>
                          {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("es-ES") : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {inv.status === "pending" && (
                              <>
                                <button
                                  onClick={() => setMarkPaidModal({ id: inv.id, invoiceNo: inv.invoiceNo })}
                                  title="Marcar como pagada"
                                  className="p-1.5 rounded-lg transition-all hover:scale-105"
                                  style={{ backgroundColor: "#dcfce7", color: "#15803d" }}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleReminder(inv.id)}
                                  disabled={!overdue || actionLoading === inv.id}
                                  title={overdue ? "Enviar recordatorio" : "Solo disponible para facturas vencidas"}
                                  className="p-1.5 rounded-lg transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
                                  style={{ backgroundColor: themeColors.primary + "15", color: themeColors.primary }}
                                >
                                  <Bell className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </motion.div>

        {/* Mark Paid Modal */}
        {markPaidModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
            >
              <h3 className="text-lg font-bold mb-4" style={{ color: themeColors.text.primary }}>
                Marcar como pagada — {markPaidModal.invoiceNo}
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ color: themeColors.text.secondary }}>
                  URL del comprobante de pago *
                </label>
                <input
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                  style={{ borderColor: themeColors.border }}
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1" style={{ color: themeColors.text.secondary }}>
                  Tipo de comprobante
                </label>
                <select
                  value={proofType}
                  onChange={(e) => setProofType(e.target.value as "image" | "pdf")}
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                  style={{ borderColor: themeColors.border }}
                >
                  <option value="image">Imagen</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setMarkPaidModal(null)}
                  className="flex-1 py-2 rounded-xl border text-sm font-medium"
                  style={{ borderColor: themeColors.border, color: themeColors.text.secondary }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleMarkPaid}
                  disabled={!proofUrl || !!actionLoading}
                  className="flex-1 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50"
                  style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
                >
                  {actionLoading ? "Guardando..." : "Confirmar pago"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </SuperadminLayout>
  );
}
