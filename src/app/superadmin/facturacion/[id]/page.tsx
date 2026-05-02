"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { SuperadminLayout } from "@/components/superadmin/superadmin-layout";
import { useTheme } from "@/contexts/theme-context";
import { useAuthStore } from "@/store/auth";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getInvoiceDetail, markInvoicePaid } from "@/services/superadmin.service";

export default function SuperadminFacturaDetalle() {
  const { themeColors } = useTheme();
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showMarkPaid, setShowMarkPaid] = useState(false);
  const [proofUrl, setProofUrl] = useState("");
  const [proofType, setProofType] = useState<"image" | "pdf">("image");
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== "superadmin")) {
      router.replace("/login");
    }
  }, [mounted, isAuthenticated, user, router]);

  useEffect(() => {
    if (mounted && isAuthenticated && id) {
      getInvoiceDetail(id)
        .then((res) => setDetail(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [mounted, isAuthenticated, id]);

  const handleMarkPaid = async () => {
    if (!proofUrl) return;
    setSaving(true);
    try {
      await markInvoicePaid(id, proofUrl, proofType);
      setShowMarkPaid(false);
      setDetail((prev: any) => {
        if (prev?.type === "commission") return { ...prev, commission: { ...prev.commission, status: "paid" } };
        if (prev?.type === "plan") return { ...prev, invoice: { ...prev.invoice, status: "paid" } };
        return prev;
      });
    } catch (e: any) {
      alert(e.message || "Error");
    } finally {
      setSaving(false);
    }
  };

  if (!mounted || !user) return null;

  const isPaid = detail?.type === "commission"
    ? detail?.commission?.status === "paid"
    : detail?.invoice?.status === "paid";

  return (
    <SuperadminLayout>
      <div className="p-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
          <Link href="/superadmin/facturacion" className="flex items-center gap-2 text-sm hover:underline" style={{ color: themeColors.text.secondary }}>
            <ArrowLeft className="w-4 h-4" />
            Volver a Facturacion
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
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold" style={{ color: themeColors.text.primary }}>
                  {detail.type === "commission"
                    ? `Factura COM-${detail.commission?.id?.substring(0, 8).toUpperCase()}`
                    : `Factura PLAN-${detail.invoice?.id?.substring(0, 8).toUpperCase()}`}
                </h1>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium mt-1 inline-block"
                  style={{
                    backgroundColor: isPaid ? "#dcfce7" : "#fef3c7",
                    color: isPaid ? "#15803d" : "#d97706",
                  }}
                >
                  {isPaid ? "Pagada" : "Pendiente"}
                </span>
              </div>
              {!isPaid && (
                <button
                  onClick={() => setShowMarkPaid(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
                  style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
                >
                  <CheckCircle className="w-4 h-4" />
                  Marcar como pagada
                </button>
              )}
            </div>

            {/* Distribuidor */}
            {detail.distributor && (
              <div className="p-4 rounded-2xl border mb-6" style={{ borderColor: themeColors.border, backgroundColor: themeColors.surface }}>
                <h3 className="font-semibold mb-2" style={{ color: themeColors.text.primary }}>Datos del Distribuidor</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span style={{ color: themeColors.text.muted }}>Nombre:</span> <span style={{ color: themeColors.text.primary }}>{detail.distributor.firstName} {detail.distributor.lastName}</span></div>
                  <div><span style={{ color: themeColors.text.muted }}>Email:</span> <span style={{ color: themeColors.text.primary }}>{detail.distributor.email}</span></div>
                  <div><span style={{ color: themeColors.text.muted }}>Empresa:</span> <span style={{ color: themeColors.text.primary }}>{detail.distributor.businessName || "—"}</span></div>
                  <div><span style={{ color: themeColors.text.muted }}>Codigo:</span> <span style={{ color: themeColors.text.primary }}>{detail.distributor.distributorCode || "—"}</span></div>
                </div>
              </div>
            )}

            {/* Breakdown */}
            {detail.type === "commission" && detail.orders && (
              <div className="rounded-2xl border overflow-hidden mb-6" style={{ borderColor: themeColors.primary + "20" }}>
                <div className="px-4 py-3" style={{ backgroundColor: themeColors.surface }}>
                  <h3 className="font-semibold text-sm" style={{ color: themeColors.text.primary }}>
                    Ordenes del periodo {detail.commission?.month} ({detail.orders.length} ordenes)
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
                        <td className="px-4 py-2" style={{ color: themeColors.text.primary }}>{o.orderNo || o.orderId?.substring(0, 8)}</td>
                        <td className="px-4 py-2 text-xs" style={{ color: themeColors.text.muted }}>{o.createdAt ? new Date(o.createdAt).toLocaleDateString("es-ES") : "—"}</td>
                        <td className="px-4 py-2" style={{ color: themeColors.text.primary }}>${(o.subTotal || 0).toFixed(2)}</td>
                        <td className="px-4 py-2 font-medium" style={{ color: themeColors.primary }}>${(o.commissionAmount || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-4 py-3 border-t flex justify-end" style={{ borderColor: themeColors.border, backgroundColor: themeColors.surface }}>
                  <span className="font-bold" style={{ color: themeColors.primary }}>
                    Total comision: ${(detail.commission?.commissionAmount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {detail.type === "plan" && (
              <div className="p-4 rounded-2xl border mb-6" style={{ borderColor: themeColors.border, backgroundColor: themeColors.surface }}>
                <h3 className="font-semibold mb-3" style={{ color: themeColors.text.primary }}>Detalle del Plan</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span style={{ color: themeColors.text.muted }}>Plan:</span><span style={{ color: themeColors.text.primary }}>{detail.invoice?.planDisplayName}</span></div>
                  <div className="flex justify-between"><span style={{ color: themeColors.text.muted }}>Precio del plan:</span><span>${(detail.invoice?.planPrice || 0).toFixed(2)}/mes</span></div>
                  <div className="flex justify-between"><span style={{ color: themeColors.text.muted }}>Periodo:</span><span>{detail.invoice?.month}</span></div>
                  {detail.invoice?.creditAmount > 0 && (
                    <div className="flex justify-between"><span style={{ color: themeColors.text.muted }}>Credito:</span><span style={{ color: "#15803d" }}>-${detail.invoice.creditAmount.toFixed(2)}</span></div>
                  )}
                  <div className="flex justify-between font-bold pt-2 border-t" style={{ borderColor: themeColors.border }}>
                    <span style={{ color: themeColors.text.primary }}>Total a cobrar:</span>
                    <span style={{ color: themeColors.primary }}>${(detail.invoice?.amount || 0).toFixed(2)}</span>
                  </div>
                </div>
                {detail.invoice?.note && (
                  <p className="mt-2 text-xs" style={{ color: themeColors.text.muted }}>{detail.invoice.note}</p>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Mark Paid Modal */}
        {showMarkPaid && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
              <h3 className="text-lg font-bold mb-4" style={{ color: themeColors.text.primary }}>Subir comprobante de pago</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ color: themeColors.text.secondary }}>URL del comprobante *</label>
                <input
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                  style={{ borderColor: themeColors.border }}
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1" style={{ color: themeColors.text.secondary }}>Tipo</label>
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
                <button onClick={() => setShowMarkPaid(false)} className="flex-1 py-2 rounded-xl border text-sm font-medium" style={{ borderColor: themeColors.border, color: themeColors.text.secondary }}>
                  Cancelar
                </button>
                <button onClick={handleMarkPaid} disabled={!proofUrl || saving} className="flex-1 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50" style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}>
                  {saving ? "Guardando..." : "Confirmar"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </SuperadminLayout>
  );
}
