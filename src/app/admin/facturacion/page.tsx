"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Filter } from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useTheme } from "@/contexts/theme-context";
import Link from "next/link";
import { getDistributorInvoices } from "@/services/superadmin.service";

interface InvoiceRow {
  id: string;
  invoiceNo: string;
  type: "commission" | "plan";
  baseAmount: number;
  rate: number | null;
  amount: number;
  status: "pending" | "paid";
  dueDate: string;
  month: string;
  planDisplayName?: string;
  createdAt: string;
}

export default function DistributorFacturacion() {
  const { themeColors } = useTheme();
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const res = await getDistributorInvoices(params);
      setInvoices(res.data || []);
      setTotal(res.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, dateFrom, dateTo]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const isOverdue = (inv: InvoiceRow) =>
    inv.status === "pending" && new Date() > new Date(inv.dueDate);

  return (
    <AdminLayout>
      <div className="p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: themeColors.text.primary }}>
            Mis Facturas ({total})
          </h1>
          <p className="mt-1 text-sm" style={{ color: themeColors.text.secondary }}>
            Facturas de comision por transacciones y cuotas mensuales de plan
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-wrap gap-3 mb-6">
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
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2 rounded-xl border text-sm outline-none" style={{ borderColor: themeColors.border }} />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2 rounded-xl border text-sm outline-none" style={{ borderColor: themeColors.border }} />
          <button
            onClick={fetchInvoices}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white hover:scale-105 transition-all"
            style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
          >
            <Filter className="w-4 h-4 inline mr-1" />
            Filtrar
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-2xl border overflow-hidden shadow-lg" style={{ borderColor: themeColors.primary + "20", backgroundColor: "#fff" }}>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: themeColors.primary + "30", borderTopColor: themeColors.primary }} />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: themeColors.surface }}>
                  {["N° Factura", "Tipo", "Base", "Tasa/Tarifa", "A Pagar", "Estado", "Vencimiento"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: themeColors.text.secondary }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12" style={{ color: themeColors.text.muted }}>No se encontraron facturas</td></tr>
                ) : (
                  invoices.map((inv) => {
                    const overdue = isOverdue(inv);
                    return (
                      <tr key={inv.id} className="border-t hover:bg-gray-50 transition-colors" style={{ borderColor: themeColors.border }}>
                        <td className="px-4 py-3">
                          <Link href={`/admin/facturacion/${inv.id}`} className="font-medium hover:underline" style={{ color: themeColors.primary }}>
                            {inv.invoiceNo}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: inv.type === "commission" ? themeColors.primary + "15" : themeColors.secondary + "15", color: inv.type === "commission" ? themeColors.primary : themeColors.secondary }}>
                            {inv.type === "commission" ? "Comision" : `Plan ${inv.planDisplayName || ""}`}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: themeColors.text.secondary }}>${(inv.baseAmount || 0).toFixed(2)}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: themeColors.text.secondary }}>{inv.rate !== null ? `${(inv.rate * 100).toFixed(2)}%` : "—"}</td>
                        <td className="px-4 py-3 font-semibold" style={{ color: themeColors.text.primary }}>${(inv.amount || 0).toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: inv.status === "paid" ? "#dcfce7" : overdue ? "#fee2e2" : "#fef3c7", color: inv.status === "paid" ? "#15803d" : overdue ? "#dc2626" : "#d97706" }}>
                            {inv.status === "paid" ? "Pagado" : overdue ? "Vencido" : "Pendiente"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: overdue ? "#dc2626" : themeColors.text.muted }}>
                          {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("es-ES") : "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </motion.div>

        <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: themeColors.surface }}>
          <p className="text-xs" style={{ color: themeColors.text.muted }}>
            Estas facturas son de solo lectura. Para consultas sobre pagos, contacta al administrador en soporte@virtago.com
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
