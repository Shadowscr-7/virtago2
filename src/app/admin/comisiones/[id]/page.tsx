"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  DollarSign,
  CheckCircle,
  Clock,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useAuthStore } from "@/store/auth";
import { useTheme } from "@/contexts/theme-context";
import { showToast } from "@/store/toast-helpers";
import http from "@/api/http-client";

interface Commission {
  id: string;
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

interface OrderDetail {
  orderId: string;
  orderNo: string;
  createdAt: string;
  subTotal: number;
  commissionRate: number;
  commissionAmount: number;
}

interface CommissionDetail {
  commission: Commission;
  orders: OrderDetail[];
  totalOrders: number;
  periodTotal: number;
  commissionTotal: number;
}

export default function ComisionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { themeColors } = useTheme();

  const [detail, setDetail] = useState<CommissionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDetail = async () => {
      setIsLoading(true);
      try {
        const response = await http.get(`/admin/commissions/${id}`);
        if (response.data.success && response.data.data) {
          setDetail(response.data.data);
        }
      } catch {
        showToast.error("Error al cargar el detalle de comisión");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) loadDetail();
  }, [id]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: "UYU",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("es-UY", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user || user.role !== "admin") {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <AlertTriangle className="w-8 h-8 text-amber-500 mr-3" />
          <p style={{ color: themeColors.text.secondary }}>
            Acceso restringido
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Back */}
        <button
          onClick={() => router.push("/admin/comisiones")}
          className="flex items-center gap-2 text-sm transition-colors hover:opacity-80"
          style={{ color: themeColors.text.secondary }}
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a comisiones
        </button>

        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div
              className="animate-spin rounded-full h-8 w-8 border-b-2"
              style={{ borderColor: themeColors.primary }}
            />
          </div>
        ) : !detail ? (
          <div
            className="flex items-center justify-center h-48"
            style={{ color: themeColors.text.muted }}
          >
            <p>Comisión no encontrada</p>
          </div>
        ) : (
          <>
            {/* Header card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${themeColors.primary}15` }}
                  >
                    <DollarSign
                      className="w-7 h-7"
                      style={{ color: themeColors.primary }}
                    />
                  </div>
                  <div>
                    <h1
                      className="text-xl font-bold"
                      style={{ color: themeColors.text.primary }}
                    >
                      {detail.commission.distributorName}
                    </h1>
                    <p
                      className="text-sm mt-0.5"
                      style={{ color: themeColors.text.secondary }}
                    >
                      {new Date(
                        `${detail.commission.month}-01`
                      ).toLocaleDateString("es-UY", {
                        year: "numeric",
                        month: "long",
                      })}
                      {" · "}
                      {detail.commission.distributorCode}
                    </p>
                  </div>
                </div>
                <div>
                  {detail.commission.status === "paid" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-100">
                      <CheckCircle className="w-4 h-4" />
                      Pagado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-amber-50 text-amber-700 border border-amber-100">
                      <Clock className="w-4 h-4" />
                      Pendiente
                    </span>
                  )}
                </div>
              </div>

              {/* Summary metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-gray-100">
                <div>
                  <p
                    className="text-xs uppercase tracking-wide mb-1"
                    style={{ color: themeColors.text.muted }}
                  >
                    Total transacciones
                  </p>
                  <p
                    className="text-lg font-bold"
                    style={{ color: themeColors.text.primary }}
                  >
                    {formatCurrency(detail.periodTotal)}
                  </p>
                </div>
                <div>
                  <p
                    className="text-xs uppercase tracking-wide mb-1"
                    style={{ color: themeColors.text.muted }}
                  >
                    % Comisión
                  </p>
                  <p
                    className="text-lg font-bold"
                    style={{ color: themeColors.text.primary }}
                  >
                    {(detail.commission.commissionRate * 100).toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p
                    className="text-xs uppercase tracking-wide mb-1"
                    style={{ color: themeColors.text.muted }}
                  >
                    Monto comisión
                  </p>
                  <p
                    className="text-lg font-bold"
                    style={{ color: themeColors.primary }}
                  >
                    {formatCurrency(detail.commissionTotal)}
                  </p>
                </div>
                <div>
                  <p
                    className="text-xs uppercase tracking-wide mb-1"
                    style={{ color: themeColors.text.muted }}
                  >
                    Órdenes incluidas
                  </p>
                  <p
                    className="text-lg font-bold"
                    style={{ color: themeColors.text.primary }}
                  >
                    {detail.totalOrders}
                  </p>
                </div>
              </div>

              {/* Payment proof */}
              {detail.commission.status === "paid" &&
                detail.commission.paymentProofUrl && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p
                      className="text-xs uppercase tracking-wide mb-2"
                      style={{ color: themeColors.text.muted }}
                    >
                      Comprobante de pago
                    </p>
                    <div className="flex items-center gap-3">
                      <a
                        href={detail.commission.paymentProofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border border-blue-100 bg-blue-50 hover:bg-blue-100 text-blue-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Ver comprobante ({detail.commission.paymentProofType})
                      </a>
                      {detail.commission.paidAt && (
                        <span
                          className="text-xs"
                          style={{ color: themeColors.text.muted }}
                        >
                          Registrado el {formatDate(detail.commission.paidAt)}
                        </span>
                      )}
                    </div>
                  </div>
                )}
            </motion.div>

            {/* Orders table */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-gray-100">
                <h2
                  className="text-sm font-semibold"
                  style={{ color: themeColors.text.primary }}
                >
                  Desglose por órdenes ({detail.totalOrders})
                </h2>
              </div>

              {detail.orders.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center h-32"
                  style={{ color: themeColors.text.muted }}
                >
                  <p className="text-sm">
                    No hay órdenes completadas en este período
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr
                        className="border-b"
                        style={{
                          backgroundColor: `${themeColors.primary}08`,
                          borderColor: themeColors.border,
                        }}
                      >
                        {[
                          "N° Orden",
                          "Fecha",
                          "Monto subtotal",
                          "% Comisión",
                          "Monto comisión",
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
                      {detail.orders.map((o, idx) => (
                        <motion.tr
                          key={o.orderId}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.03 }}
                          className="border-t hover:bg-red-50 transition-colors"
                          style={{ borderColor: `${themeColors.primary}10` }}
                        >
                          <td
                            className="px-4 py-3 text-sm font-medium"
                            style={{ color: themeColors.text.primary }}
                          >
                            {o.orderNo || o.orderId}
                          </td>
                          <td
                            className="px-4 py-3 text-sm"
                            style={{ color: themeColors.text.secondary }}
                          >
                            {formatDate(o.createdAt)}
                          </td>
                          <td
                            className="px-4 py-3 text-sm"
                            style={{ color: themeColors.text.primary }}
                          >
                            {formatCurrency(o.subTotal)}
                          </td>
                          <td
                            className="px-4 py-3 text-sm"
                            style={{ color: themeColors.text.secondary }}
                          >
                            {(o.commissionRate * 100).toFixed(2)}%
                          </td>
                          <td
                            className="px-4 py-3 text-sm font-semibold"
                            style={{ color: themeColors.primary }}
                          >
                            {formatCurrency(o.commissionAmount)}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr
                        className="border-t-2 bg-gray-50"
                        style={{ borderColor: themeColors.border }}
                      >
                        <td
                          colSpan={2}
                          className="px-4 py-3 text-sm font-semibold"
                          style={{ color: themeColors.text.primary }}
                        >
                          Total del período
                        </td>
                        <td
                          className="px-4 py-3 text-sm font-bold"
                          style={{ color: themeColors.text.primary }}
                        >
                          {formatCurrency(detail.periodTotal)}
                        </td>
                        <td />
                        <td
                          className="px-4 py-3 text-sm font-bold"
                          style={{ color: themeColors.primary }}
                        >
                          {formatCurrency(detail.commissionTotal)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
