"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, FileText } from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useTheme } from "@/contexts/theme-context";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getDistributorInvoiceDetail } from "@/services/superadmin.service";

export default function DistributorFacturaDetalle() {
  const { themeColors } = useTheme();
  const params = useParams();
  const id = params?.id as string;
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getDistributorInvoiceDetail(id)
        .then((res) => setDetail(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  return (
    <AdminLayout>
      <div className="max-w-3xl space-y-6">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link
            href="/admin/facturacion"
            className="inline-flex items-center gap-2 text-sm transition-colors hover:opacity-80"
            style={{ color: themeColors.text.secondary }}
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Mis Facturas
          </Link>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div
              className="w-8 h-8 border-4 rounded-full animate-spin"
              style={{
                borderColor: `${themeColors.primary}30`,
                borderTopColor: themeColors.primary,
              }}
            />
          </div>
        ) : !detail ? (
          <p style={{ color: themeColors.text.secondary }}>
            Factura no encontrada
          </p>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Header */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${themeColors.primary}15` }}
                  >
                    <FileText
                      className="w-6 h-6"
                      style={{ color: themeColors.primary }}
                    />
                  </div>
                  <div>
                    <h1
                      className="text-xl font-bold"
                      style={{ color: themeColors.text.primary }}
                    >
                      {detail.type === "commission"
                        ? `Comisión — ${detail.commission?.month}`
                        : `Plan ${detail.invoice?.planDisplayName} — ${detail.invoice?.month}`}
                    </h1>
                  </div>
                </div>
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor:
                      (detail.commission?.status ||
                        detail.invoice?.status) === "paid"
                        ? "#dcfce7"
                        : "#fef3c7",
                    color:
                      (detail.commission?.status ||
                        detail.invoice?.status) === "paid"
                        ? "#15803d"
                        : "#d97706",
                  }}
                >
                  {(detail.commission?.status || detail.invoice?.status) ===
                  "paid"
                    ? "Pagada"
                    : "Pendiente"}
                </span>
              </div>
            </div>

            {/* Commission orders */}
            {detail.type === "commission" && detail.orders && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div
                  className="px-5 py-4 border-b"
                  style={{
                    backgroundColor: `${themeColors.primary}08`,
                    borderColor: themeColors.border,
                  }}
                >
                  <h3
                    className="text-sm font-semibold"
                    style={{ color: themeColors.text.primary }}
                  >
                    Órdenes del periodo ({detail.orders.length})
                  </h3>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {["N° Orden", "Fecha", "Subtotal", "Comisión"].map(
                        (h) => (
                          <th
                            key={h}
                            className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide"
                            style={{ color: themeColors.text.secondary }}
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {detail.orders.map((o: any) => (
                      <tr
                        key={o.orderId}
                        className="border-t hover:bg-red-50 transition-colors"
                        style={{ borderColor: `${themeColors.primary}10` }}
                      >
                        <td
                          className="px-4 py-3 font-medium"
                          style={{ color: themeColors.text.primary }}
                        >
                          {o.orderNo || o.orderId?.substring(0, 8)}
                        </td>
                        <td
                          className="px-4 py-3 text-xs"
                          style={{ color: themeColors.text.muted }}
                        >
                          {o.createdAt
                            ? new Date(o.createdAt).toLocaleDateString("es-ES")
                            : "—"}
                        </td>
                        <td
                          className="px-4 py-3"
                          style={{ color: themeColors.text.primary }}
                        >
                          ${(o.subTotal || 0).toFixed(2)}
                        </td>
                        <td
                          className="px-4 py-3 font-medium"
                          style={{ color: themeColors.primary }}
                        >
                          ${(o.commissionAmount || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div
                  className="px-5 py-3 border-t flex justify-end bg-gray-50"
                  style={{ borderColor: themeColors.border }}
                >
                  <span
                    className="font-bold text-sm"
                    style={{ color: themeColors.primary }}
                  >
                    Total: ${(detail.commission?.commissionAmount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Plan details */}
            {detail.type === "plan" && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h3
                  className="text-sm font-semibold mb-4"
                  style={{ color: themeColors.text.primary }}
                >
                  Detalle del Plan
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: themeColors.text.muted }}>Plan:</span>
                    <span style={{ color: themeColors.text.primary }}>
                      {detail.invoice?.planDisplayName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: themeColors.text.muted }}>
                      Precio base:
                    </span>
                    <span style={{ color: themeColors.text.primary }}>
                      ${(detail.invoice?.planPrice || 0).toFixed(2)}/mes
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: themeColors.text.muted }}>
                      Periodo:
                    </span>
                    <span style={{ color: themeColors.text.primary }}>
                      {detail.invoice?.month}
                    </span>
                  </div>
                  {detail.invoice?.creditAmount > 0 && (
                    <div className="flex justify-between">
                      <span style={{ color: themeColors.text.muted }}>
                        Crédito:
                      </span>
                      <span style={{ color: "#15803d" }}>
                        -${detail.invoice.creditAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div
                    className="flex justify-between font-bold pt-3 border-t"
                    style={{ borderColor: themeColors.border }}
                  >
                    <span style={{ color: themeColors.text.primary }}>
                      Total:
                    </span>
                    <span style={{ color: themeColors.primary }}>
                      ${(detail.invoice?.amount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
                {detail.invoice?.note && (
                  <p
                    className="mt-3 text-xs"
                    style={{ color: themeColors.text.muted }}
                  >
                    {detail.invoice.note}
                  </p>
                )}
              </div>
            )}

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-xs" style={{ color: themeColors.text.muted }}>
                Esta factura es de solo lectura. Para consultas contacta a
                soporte@virtago.com
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
}
