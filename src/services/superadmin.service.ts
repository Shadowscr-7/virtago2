const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://virtago-backend.vercel.app/api";

function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") || localStorage.getItem("auth_token") || "";
}

async function saFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Error en la solicitud");
  }
  return data;
}

// ─── Usuarios ────────────────────────────────────────────────────────────────

export const listUsers = (params: Record<string, string> = {}) => {
  const qs = new URLSearchParams(params).toString();
  return saFetch(`/superadmin/users${qs ? `?${qs}` : ""}`);
};

export const getUserDetail = (id: string) => saFetch(`/superadmin/users/${id}`);

export const changeUserRole = (id: string, role: string) =>
  saFetch(`/superadmin/users/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });

// ─── Ordenes ─────────────────────────────────────────────────────────────────

export const listOrders = (params: Record<string, string> = {}) => {
  const qs = new URLSearchParams(params).toString();
  return saFetch(`/superadmin/orders${qs ? `?${qs}` : ""}`);
};

export const getOrderDetail = (id: string) => saFetch(`/superadmin/orders/${id}`);

// ─── Facturacion ─────────────────────────────────────────────────────────────

export const listInvoices = (params: Record<string, string> = {}) => {
  const qs = new URLSearchParams(params).toString();
  return saFetch(`/superadmin/invoices${qs ? `?${qs}` : ""}`);
};

export const getInvoiceDetail = (id: string) => saFetch(`/superadmin/invoices/${id}`);

export const markInvoicePaid = (
  id: string,
  paymentProofUrl: string,
  paymentProofType: "image" | "pdf"
) =>
  saFetch(`/superadmin/invoices/${id}/mark-paid`, {
    method: "PATCH",
    body: JSON.stringify({ paymentProofUrl, paymentProofType }),
  });

export const sendInvoiceReminder = (id: string) =>
  saFetch(`/superadmin/invoices/${id}/reminder`, { method: "POST" });

// ─── Metricas ─────────────────────────────────────────────────────────────────

export const getMetrics = () => saFetch("/superadmin/metrics");

// ─── Distributor Profile & Billing ───────────────────────────────────────────

export const getDistributorProfile = () => saFetch("/distributor/profile");

export const updateDistributorProfile = (data: Record<string, unknown>) =>
  saFetch("/distributor/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const getDistributorInvoices = (params: Record<string, string> = {}) => {
  const qs = new URLSearchParams(params).toString();
  return saFetch(`/distributor/invoices${qs ? `?${qs}` : ""}`);
};

export const getDistributorInvoiceDetail = (id: string) =>
  saFetch(`/distributor/invoices/${id}`);

export const changePlan = (newPlanId: string) =>
  saFetch("/distributor/change-plan", {
    method: "POST",
    body: JSON.stringify({ newPlanId }),
  });
