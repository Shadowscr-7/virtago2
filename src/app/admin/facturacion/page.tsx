"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Filter, FileText } from "lucide-react";
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

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const isOverdue = (inv: InvoiceRow) =>
    inv.status === "pending" && new Date() > new Date(inv.dueDate);

  const selectStyle = {
    borderColor: themeColors.border,
    color: themeColors.text.primary,
    backgroundColor: "#f9fafb",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: themeColors.text.primary }}
            >
              Mis Facturas
              {total > 0 && (
                <span
                  className="ml-2 text-base font-medium"
                  style={{ color: themeColors.text.secondary }}
                >
                  ({total})
                </span>
              )}
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: themeColors.text.secondary }}
            >
              Facturas de comisión por transacciones y cuotas mensuales de plan
            </p>
          </div>
          <div
            className="p-3 rounded-xl"
            style={{ backgroundColor: `${themeColors.primary}15` }}
          >
            <FileText
              className="w-6 h-6"
              style={{ color: themeColors.primary }}
            />
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-200 p-5"
        >
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: themeColors.text.secondary }}
              >
                Estado
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-red-700/20 focus:border-red-700"
                style={selectStyle}
              >
                <option value="">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="paid">Pagado</option>
              </select>
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: themeColors.text.secondary }}
              >
                Tipo
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-red-700/20 focus:border-red-700"
                style={selectStyle}
              >
                <option value="">Todos los tipos</option>
                <option value="commission">Comisión</option>
                <option value="plan">Plan</option>
              </select>
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: themeColors.text.secondary }}
              >
                Desde
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2.5 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-red-700/20 focus:border-red-700"
                style={selectStyle}
              />
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: themeColors.text.secondary }}
              >
                Hasta
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2.5 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-red-700/20 focus:border-red-700"
                style={selectStyle}
              />
            </div>
            <button
              onClick={fetchInvoices}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-red-700 hover:bg-red-800 transition-all flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtrar
            </button>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
        >
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div
                className="w-8 h-8 border-4 rounded-full animate-spin"
                style={{
                  borderColor: `${themeColors.primary}30`,
                  borderTopColor: themeColors.primary,
                }}
              />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="border-b"
                  style={{
                    backgroundColor: `${themeColors.primary}08`,
                    borderColor: themeColors.border,
                  }}
                >
                  {[
                    "N° Factura",
                    "Tipo",
                    "Base",
                    "Tasa/Tarifa",
                    "A Pagar",
                    "Estado",
                    "Vencimiento",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide"
                      style={{ color: themeColors.text.secondary }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-12 text-sm"
                      style={{ color: themeColors.text.muted }}
                    >
                      No se encontraron facturas
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => {
                    const overdue = isOverdue(inv);
                    return (
                      <tr
                        key={inv.id}
                        className="border-t hover:bg-red-50 transition-colors"
                        style={{ borderColor: `${themeColors.primary}10` }}
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/facturacion/${inv.id}`}
                            className="font-medium hover:underline"
                            style={{ color: themeColors.primary }}
                          >
                            {inv.invoiceNo}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor:
                                inv.type === "commission"
                                  ? `${themeColors.primary}15`
                                  : "#3b82f615",
                              color:
                                inv.type === "commission"
                                  ? themeColors.primary
                                  : "#3b82f6",
                            }}
                          >
                            {inv.type === "commission"
                              ? "Comisión"
                              : `Plan ${inv.planDisplayName || ""}`}
                          </span>
                        </td>
                        <td
                          className="px-4 py-3 text-xs"
                          style={{ color: themeColors.text.secondary }}
                        >
                          ${(inv.baseAmount || 0).toFixed(2)}
                        </td>
                        <td
                          className="px-4 py-3 text-xs"
                          style={{ color: themeColors.text.secondary }}
                        >
                          {inv.rate !== null
                            ? `${(inv.rate * 100).toFixed(2)}%`
                            : "—"}
                        </td>
                        <td
                          className="px-4 py-3 font-semibold"
                          style={{ color: themeColors.text.primary }}
                        >
                          ${(inv.amount || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor:
                                inv.status === "paid"
                                  ? "#dcfce7"
                                  : overdue
                                  ? "#fee2e2"
                                  : "#fef3c7",
                              color:
                                inv.status === "paid"
                                  ? "#15803d"
                                  : overdue
                                  ? "#dc2626"
                                  : "#d97706",
                            }}
                          >
                            {inv.status === "paid"
                              ? "Pagado"
                              : overdue
                              ? "Vencido"
                              : "Pendiente"}
                          </span>
                        </td>
                        <td
                          className="px-4 py-3 text-xs"
                          style={{
                            color: overdue ? "#dc2626" : themeColors.text.muted,
                          }}
                        >
                          {inv.dueDate
                            ? new Date(inv.dueDate).toLocaleDateString("es-ES")
                            : "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </motion.div>

        <div
          className="p-4 rounded-xl bg-gray-50 border border-gray-100"
        >
          <p className="text-xs" style={{ color: themeColors.text.muted }}>
            Estas facturas son de solo lectura. Para consultas sobre pagos,
            contacta al administrador en soporte@virtago.com
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
