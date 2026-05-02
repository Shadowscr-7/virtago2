"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, ShoppingCart, DollarSign, BarChart3 } from "lucide-react";
import { SuperadminLayout } from "@/components/superadmin/superadmin-layout";
import { useTheme } from "@/contexts/theme-context";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { getMetrics } from "@/services/superadmin.service";

export default function SuperadminMetricas() {
  const { themeColors } = useTheme();
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== "superadmin")) router.replace("/login");
  }, [mounted, isAuthenticated, user, router]);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      getMetrics().then((res) => setMetrics(res.data)).catch(console.error).finally(() => setLoading(false));
    }
  }, [mounted, isAuthenticated]);

  if (!mounted || !user) return null;

  const curr = metrics?.currentMonth;
  const prev = metrics?.previousMonth;
  const revenueChange = prev?.totalRevenue
    ? (((curr?.totalRevenue || 0) - prev.totalRevenue) / prev.totalRevenue * 100).toFixed(1)
    : null;

  return (
    <SuperadminLayout>
      <div className="p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: themeColors.text.primary }}>Metricas Globales</h1>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: themeColors.primary + "30", borderTopColor: themeColors.primary }} />
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { label: "Total Usuarios", value: metrics?.totalUsers || 0, icon: Users, color: themeColors.primary },
                { label: "Ordenes este mes", value: curr?.ordersCount || 0, icon: ShoppingCart, color: themeColors.secondary },
                { label: "Ingresos Virtago", value: `$${(curr?.totalRevenue || 0).toFixed(2)}`, icon: DollarSign, color: themeColors.accent },
                { label: "Volumen Ordenes", value: `$${(curr?.orderVolume || 0).toFixed(2)}`, icon: TrendingUp, color: themeColors.primary },
              ].map((kpi, i) => {
                const Icon = kpi.icon;
                return (
                  <motion.div
                    key={kpi.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 rounded-2xl border shadow-lg"
                    style={{ borderColor: themeColors.primary + "20", backgroundColor: "#fff" }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(45deg, ${kpi.color}, ${kpi.color}90)` }}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold" style={{ color: themeColors.text.primary }}>{kpi.value}</div>
                    <div className="text-sm mt-1" style={{ color: themeColors.text.secondary }}>{kpi.label}</div>
                  </motion.div>
                );
              })}
            </div>

            {/* Monthly revenue chart (bar) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-6 rounded-2xl border shadow-lg"
                style={{ borderColor: themeColors.primary + "20", backgroundColor: "#fff" }}
              >
                <h3 className="text-base font-semibold mb-4" style={{ color: themeColors.text.primary }}>
                  Ingresos Virtago por Mes
                </h3>
                <div className="h-40 flex items-end justify-between gap-1">
                  {(metrics?.monthlyData || []).map((m: any, i: number) => {
                    const maxRev = Math.max(...(metrics?.monthlyData || []).map((x: any) => x.totalRevenue || 0), 1);
                    const pct = ((m.totalRevenue || 0) / maxRev) * 100;
                    return (
                      <div key={m.month} className="flex flex-col items-center flex-1 gap-1">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${pct}%` }}
                          transition={{ delay: 0.5 + i * 0.08 }}
                          className="w-full rounded-t-md"
                          title={`${m.label}: $${(m.totalRevenue || 0).toFixed(2)}`}
                          style={{ background: `linear-gradient(to top, ${themeColors.primary}, ${themeColors.secondary})`, minHeight: "4px" }}
                        />
                        <span className="text-xs" style={{ color: themeColors.text.muted }}>{m.label}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Orders by status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="p-6 rounded-2xl border shadow-lg"
                style={{ borderColor: themeColors.primary + "20", backgroundColor: "#fff" }}
              >
                <h3 className="text-base font-semibold mb-4" style={{ color: themeColors.text.primary }}>
                  Ordenes por Estado
                </h3>
                <div className="space-y-3">
                  {Object.entries(metrics?.ordersByStatus || {}).map(([status, count]: [string, any]) => {
                    const total = Object.values(metrics?.ordersByStatus || {}).reduce((s: number, v: any) => s + v, 0) as number;
                    const pct = total ? (count / total * 100).toFixed(0) : 0;
                    return (
                      <div key={status}>
                        <div className="flex justify-between text-sm mb-1">
                          <span style={{ color: themeColors.text.secondary }}>{status}</span>
                          <span style={{ color: themeColors.text.primary }}>{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 rounded-full" style={{ backgroundColor: themeColors.border }}>
                          <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: themeColors.primary }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* Top distributors */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-6 rounded-2xl border shadow-lg"
                style={{ borderColor: themeColors.primary + "20", backgroundColor: "#fff" }}
              >
                <h3 className="text-base font-semibold mb-4" style={{ color: themeColors.text.primary }}>
                  Top Distribuidores (este mes)
                </h3>
                <div className="space-y-3">
                  {(metrics?.topDistributors || []).map((d: any, i: number) => (
                    <div key={d.code} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: themeColors.primary }}>
                          {i + 1}
                        </span>
                        <span className="text-sm" style={{ color: themeColors.text.primary }}>{d.name || d.code}</span>
                      </div>
                      <span className="text-sm font-semibold" style={{ color: themeColors.primary }}>${(d.volume || 0).toFixed(2)}</span>
                    </div>
                  ))}
                  {(!metrics?.topDistributors?.length) && (
                    <p className="text-sm" style={{ color: themeColors.text.muted }}>Sin datos este mes</p>
                  )}
                </div>
              </motion.div>

              {/* Plan distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="p-6 rounded-2xl border shadow-lg"
                style={{ borderColor: themeColors.primary + "20", backgroundColor: "#fff" }}
              >
                <h3 className="text-base font-semibold mb-4" style={{ color: themeColors.text.primary }}>
                  Distribucion de Planes
                </h3>
                <div className="space-y-3">
                  {Object.entries(metrics?.planDistribution || {}).map(([plan, count]: [string, any]) => {
                    const totalPlans = Object.values(metrics?.planDistribution || {}).reduce((s: number, v: any) => s + v, 0) as number;
                    const pct = totalPlans ? (count / totalPlans * 100).toFixed(0) : 0;
                    return (
                      <div key={plan}>
                        <div className="flex justify-between text-sm mb-1">
                          <span style={{ color: themeColors.text.secondary }}>{plan}</span>
                          <span style={{ color: themeColors.text.primary }}>{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 rounded-full" style={{ backgroundColor: themeColors.border }}>
                          <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: themeColors.secondary }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </SuperadminLayout>
  );
}
