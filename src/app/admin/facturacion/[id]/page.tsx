"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
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
      <div className="p-8 max-w-3xl">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
          <Link href="/admin/facturacion" className="flex items-center gap-2 text-sm hover:underline" style={{ color: themeColors.text.secondary }}>
            <ArrowLeft className="w-4 h-4" />
            Volver a Mis Facturas
          </Link>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: themeColors.primary + "30", borderTopColor: themeColors.primary }} />
          </div>
        ) : !detail ? (
          <p style={{ color: themeColors.text.secondary }}>Factura no encontrada</p>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold mb-1" style={{ color: themeColors.text.primary }}>
              {detail.type === "commission"
                ? `Comision — ${detail.commission?.month}`
                : `Plan ${detail.invoice?.planDisplayName} — ${detail.invoice?.month}`}
            </h1>
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: (detail.commission?.status || detail.invoice?.status) === "paid" ? "#dcfce7" : "#fef3c7",
                color: (detail.commission?.status || detail.invoice?.status) === "paid" ? "#15803d" : "#d97706",
              }}
            >
              {(detail.commission?.status || detail.invoice?.status) === "paid" ? "Pagada" : "Pendiente"}
            </span>

            {detail.type === "commission" && detail.orders && (
              <div className="mt-6 rounded-2xl border overflow-hidden" style={{ borderColor: themeColors.primary + "20" }}>
                <div className="px-4 py-3" style={{ backgroundColor: themeColors.surface }}>
                  <h3 className="font-semibold text-sm" style={{ color: themeColors.text.primary }}>
                    Ordenes del periodo ({detail.orders.length})
                  </h3>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: themeColors.surface + "80" }}>
                      {["N° Orden", "Fecha", "Subtotal", "Comision"].map((h) => (
                        <th key={h} className="text-left px-4 py-2 text-xs font-semibold" style={{ color: themeColors.text.secondary }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {detail.orders.map((o: any) => (
                      <tr key={o.orderId} className="border-t" style={{ borderColor: themeColors.border }}>
                        <td className="px-4 py-2">{o.orderNo || o.orderId?.substring(0, 8)}</td>
                        <td className="px-4 py-2 text-xs" style={{ color: themeColors.text.muted }}>{o.createdAt ? new Date(o.createdAt).toLocaleDateString("es-ES") : "—"}</td>
                        <td className="px-4 py-2">${(o.subTotal || 0).toFixed(2)}</td>
                        <td className="px-4 py-2 font-medium" style={{ color: themeColors.primary }}>${(o.commissionAmount || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-4 py-3 border-t flex justify-end" style={{ borderColor: themeColors.border, backgroundColor: themeColors.surface }}>
                  <span className="font-bold" style={{ color: themeColors.primary }}>
                    Total: ${(detail.commission?.commissionAmount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {detail.type === "plan" && (
              <div className="mt-6 p-4 rounded-2xl border" style={{ borderColor: themeColors.border, backgroundColor: themeColors.surface }}>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span style={{ color: themeColors.text.muted }}>Plan:</span><span>{detail.invoice?.planDisplayName}</span></div>
                  <div className="flex justify-between"><span style={{ color: themeColors.text.muted }}>Precio base:</span><span>${(detail.invoice?.planPrice || 0).toFixed(2)}/mes</span></div>
                  <div className="flex justify-between"><span style={{ color: themeColors.text.muted }}>Periodo:</span><span>{detail.invoice?.month}</span></div>
                  {detail.invoice?.creditAmount > 0 && (
                    <div className="flex justify-between"><span style={{ color: themeColors.text.muted }}>Credito:</span><span style={{ color: "#15803d" }}>-${detail.invoice.creditAmount.toFixed(2)}</span></div>
                  )}
                  <div className="flex justify-between font-bold pt-2 border-t" style={{ borderColor: themeColors.border }}>
                    <span>Total:</span>
                    <span style={{ color: themeColors.primary }}>${(detail.invoice?.amount || 0).toFixed(2)}</span>
                  </div>
                </div>
                {detail.invoice?.note && <p className="mt-2 text-xs" style={{ color: themeColors.text.muted }}>{detail.invoice.note}</p>}
              </div>
            )}

            <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: themeColors.surface }}>
              <p className="text-xs" style={{ color: themeColors.text.muted }}>
                Esta factura es de solo lectura. Para consultas contacta a soporte@virtago.com
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
}
