"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Filter } from "lucide-react";
import { SuperadminLayout } from "@/components/superadmin/superadmin-layout";
import { useTheme } from "@/contexts/theme-context";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { listOrders, listUsers } from "@/services/superadmin.service";

const ORDER_STATUSES = ["", "pending", "processing", "shipped", "delivered", "completed", "cancelled"];
const RED = "#C8102E";

interface OrderRow {
  id: string;
  orderNo: string;
  client: string;
  distributorCode: string;
  distributorName?: string;
  total: number;
  status: string;
  createdAt: string;
}

interface DistributorUser {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  distributorCode?: string | null;
  businessName?: string | null;
  distributorInfo?: {
    distributorCode?: string;
    businessName?: string;
    distributorName?: string;
  };
}

interface DistributorOption {
  code: string;
  label: string;
}

const toDistributorOption = (distributor: DistributorUser): DistributorOption | null => {
  const code = distributor.distributorCode || distributor.distributorInfo?.distributorCode || "";
  if (!code) return null;

  const fullName = `${distributor.firstName || ""} ${distributor.lastName || ""}`.trim();
  const name =
    distributor.businessName ||
    distributor.distributorInfo?.businessName ||
    distributor.distributorInfo?.distributorName ||
    fullName ||
    distributor.email ||
    code;

  return {
    code,
    label: `${name} (${code})`,
  };
};

export default function SuperadminOrdenes() {
  const { themeColors } = useTheme();
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [distributors, setDistributors] = useState<DistributorOption[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingDistributors, setLoadingDistributors] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [distFilter, setDistFilter] = useState("");
  const [distributorSearch, setDistributorSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== "superadmin")) {
      router.replace("/login");
    }
  }, [mounted, isAuthenticated, user, router]);

  const fetchDistributors = useCallback(async () => {
    setLoadingDistributors(true);
    try {
      const res = await listUsers({ role: "distributor", limit: "1000" });
      const seen = new Set<string>();
      const options = ((res.data || []) as DistributorUser[])
        .map(toDistributorOption)
        .filter((option): option is DistributorOption => {
          if (!option || seen.has(option.code)) return false;
          seen.add(option.code);
          return true;
        })
        .sort((a, b) => a.label.localeCompare(b.label, "es"));

      setDistributors(options);
    } catch (e) {
      console.error(e);
      setDistributors([]);
    } finally {
      setLoadingDistributors(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      if (distFilter) params.distributorCode = distFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const res = await listOrders(params);
      setOrders(res.data || []);
      setTotal(res.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, distFilter, dateFrom, dateTo]);

  useEffect(() => {
    if (mounted && isAuthenticated) fetchOrders();
  }, [mounted, isAuthenticated, fetchOrders]);

  useEffect(() => {
    if (mounted && isAuthenticated) fetchDistributors();
  }, [mounted, isAuthenticated, fetchDistributors]);

  if (!mounted || !user) return null;

  const statusColor = (s: string) => {
    const map: Record<string, { bg: string; text: string }> = {
      pending: { bg: "#fef3c7", text: "#d97706" },
      processing: { bg: "#dbeafe", text: "#1d4ed8" },
      shipped: { bg: "#e0e7ff", text: "#4338ca" },
      delivered: { bg: "#dcfce7", text: "#15803d" },
      completed: { bg: "#dcfce7", text: "#15803d" },
      cancelled: { bg: "#fee2e2", text: "#dc2626" },
    };
    return map[s] || { bg: "#f3f4f6", text: "#6b7280" };
  };

  const normalizedDistributorSearch = distributorSearch.trim().toLowerCase();
  const filteredDistributors = normalizedDistributorSearch
    ? distributors.filter((distributor) =>
        distributor.label.toLowerCase().includes(normalizedDistributorSearch) ||
        distributor.code.toLowerCase().includes(normalizedDistributorSearch)
      )
    : distributors;
  const selectedDistributor = distributors.find((distributor) => distributor.code === distFilter);
  const visibleDistributors =
    selectedDistributor && !filteredDistributors.some((distributor) => distributor.code === selectedDistributor.code)
      ? [selectedDistributor, ...filteredDistributors]
      : filteredDistributors;

  return (
    <SuperadminLayout>
      <div className="p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: themeColors.text.primary }}>
            Ordenes ({total})
          </h1>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-3 mb-6"
        >
          <div
            className="flex flex-wrap items-center gap-2 px-3 py-2 rounded-xl border bg-white"
            style={{ borderColor: RED }}
          >
            <Search className="w-4 h-4" style={{ color: RED }} />
            <input
              value={distributorSearch}
              onChange={(e) => setDistributorSearch(e.target.value)}
              placeholder="Buscar distribuidor..."
              className="w-48 bg-white text-sm outline-none placeholder:text-gray-400"
              style={{ color: themeColors.text.primary }}
              disabled={loadingDistributors}
            />
            <select
              value={distFilter}
              onChange={(e) => {
                const nextCode = e.target.value;
                setDistFilter(nextCode);
                const nextDistributor = distributors.find((distributor) => distributor.code === nextCode);
                if (nextDistributor) setDistributorSearch(nextDistributor.label);
              }}
              className="w-64 border-l bg-white pl-2 text-sm outline-none"
              style={{ borderColor: themeColors.border, color: themeColors.text.primary }}
              disabled={loadingDistributors}
            >
              <option value="">
                {loadingDistributors ? "Cargando distribuidores..." : "Todos los distribuidores"}
              </option>
              {visibleDistributors.map((distributor) => (
                <option key={distributor.code} value={distributor.code}>
                  {distributor.label}
                </option>
              ))}
            </select>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border text-sm outline-none bg-white"
            style={{ borderColor: RED, color: themeColors.text.primary }}
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{s || "Todos los estados"}</option>
            ))}
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 rounded-xl border text-sm outline-none bg-white"
            style={{ borderColor: RED, color: themeColors.text.primary }}
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 rounded-xl border text-sm outline-none bg-white"
            style={{ borderColor: RED, color: themeColors.text.primary }}
          />
          <button
            onClick={fetchOrders}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:scale-105"
            style={{ backgroundColor: RED }}
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
          style={{ borderColor: RED, backgroundColor: "#fff" }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div
                className="w-8 h-8 border-4 rounded-full animate-spin"
                style={{ borderColor: `${RED}30`, borderTopColor: RED }}
              />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "#fff" }}>
                  {["Nro. Orden", "Cliente", "Distribuidor", "Monto", "Estado", "Fecha"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: themeColors.text.secondary }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12" style={{ color: themeColors.text.muted }}>
                      No se encontraron ordenes
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => {
                    const sc = statusColor(o.status);
                    return (
                      <tr
                        key={o.id}
                        className="border-t hover:bg-gray-50 transition-colors"
                        style={{ borderColor: themeColors.border }}
                      >
                        <td className="px-4 py-3 font-medium" style={{ color: RED }}>
                          {o.orderNo || o.id.substring(0, 8)}
                        </td>
                        <td className="px-4 py-3" style={{ color: themeColors.text.primary }}>{o.client}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: themeColors.text.secondary }}>
                          {o.distributorCode}{o.distributorName ? ` - ${o.distributorName}` : ""}
                        </td>
                        <td className="px-4 py-3 font-semibold" style={{ color: themeColors.text.primary }}>
                          ${(o.total || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: sc.bg, color: sc.text }}>
                            {o.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: themeColors.text.muted }}>
                          {o.createdAt ? new Date(o.createdAt).toLocaleDateString("es-ES") : "-"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </motion.div>
      </div>
    </SuperadminLayout>
  );
}
