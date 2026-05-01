"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Trash2,
  Package,
  User,
  DollarSign,
  MapPin,
  Truck,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Phone,
  Mail,
  Edit,
  Save,
  X,
  Plus,
  History,
  AlertTriangle,
} from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useAuthStore } from "@/store/auth";
import {
  getOrderById,
  updateOrderItem,
  removeOrderItem,
  addOrderItem,
  confirmOrderChanges,
  type Order,
  type OrderItem,
  type ChangelogEntry,
  type UpdateItemPayload,
  type AddItemPayload,
} from "@/api/orders";

// ─── Helpers ────────────────────────────────────────────────────────────────

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "confirmed";

function getStatusIcon(status: string) {
  switch (status?.toLowerCase()) {
    case "pending": return <Clock className="w-5 h-5" />;
    case "processing": return <Package className="w-5 h-5" />;
    case "shipped": return <Truck className="w-5 h-5" />;
    case "delivered": return <CheckCircle className="w-5 h-5" />;
    case "cancelled": return <XCircle className="w-5 h-5" />;
    default: return <Package className="w-5 h-5" />;
  }
}

function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case "pending": return "#f59e0b";
    case "processing": return "#3b82f6";
    case "shipped": return "#8b5cf6";
    case "delivered": return "#10b981";
    case "cancelled": return "#ef4444";
    default: return "#6b7280";
  }
}

function getStatusLabel(status: string): string {
  switch (status?.toLowerCase()) {
    case "pending": return "Pendiente";
    case "processing": return "Procesando";
    case "shipped": return "Enviado";
    case "delivered": return "Entregado";
    case "cancelled": return "Cancelado";
    case "confirmed": return "Confirmado";
    default: return status || "Desconocido";
  }
}

function formatChangelogEntry(entry: ChangelogEntry): string {
  if (entry.action === "update_item") {
    if (entry.field === "quantity") {
      return `${entry.itemName}: cantidad ${entry.previousValue} → ${entry.newValue}`;
    }
    if (entry.field === "finalPrice") {
      return `${entry.itemName}: precio $${entry.previousValue} → $${entry.newValue}`;
    }
    if (entry.field === "discountPercentage") {
      return `${entry.itemName}: descuento ${entry.previousValue}% → ${entry.newValue}%`;
    }
    return `${entry.itemName}: ${entry.field} actualizado`;
  }
  if (entry.action === "remove_item") {
    return `${entry.itemName}: eliminado de la orden${entry.reason ? ` (${entry.reason})` : ""}`;
  }
  if (entry.action === "add_item") {
    const item = entry.newValue as OrderItem | null;
    return `${entry.itemName}: agregado — ${item?.quantity ?? "?"} unidades a $${item?.finalPrice ?? "?"}`;
  }
  return "Cambio en la orden";
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function OrderDetailsPage() {
  const { themeColors } = useTheme();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const { user } = useAuthStore();

  const isDistributor = user?.role === "distributor";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modo edicion
  const [editMode, setEditMode] = useState(false);
  const [localItems, setLocalItems] = useState<OrderItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Modal agregar item
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState<AddItemPayload>({
    name: "",
    sku: "",
    quantity: 1,
    finalPrice: 0,
    discountPercentage: 0,
  });
  const [addError, setAddError] = useState<string | null>(null);
  const [addSaving, setAddSaving] = useState(false);

  // Cargar la orden
  const loadOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrderById(orderId);
      setOrder(data);
      setLocalItems(data.items ? [...data.items] : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar la orden.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  // Entrar en modo edicion
  function enterEditMode() {
    if (!order) return;
    setLocalItems([...order.items]);
    setEditMode(true);
    setEditError(null);
  }

  // Cancelar edicion
  function cancelEditMode() {
    if (!order) return;
    setLocalItems([...order.items]);
    setEditMode(false);
    setEditError(null);
  }

  // Editar un campo de un item en modo local (preview sin guardar)
  function handleLocalItemChange(index: number, field: keyof OrderItem, value: string | number) {
    setLocalItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };
      // @ts-expect-error dynamic field assignment
      item[field] = typeof value === "string" ? (isNaN(Number(value)) ? value : Number(value)) : value;
      // Recalcular total local
      if (field === "quantity" || field === "finalPrice") {
        item.total = Number((item.finalPrice * item.quantity).toFixed(2));
      }
      updated[index] = item;
      return updated;
    });
  }

  // Guardar cambios de un item (llama al API)
  async function saveItemChange(index: number) {
    if (!order) return;
    setSaving(true);
    setEditError(null);
    try {
      const original = order.items[index];
      const edited = localItems[index];
      const payload: UpdateItemPayload = {};
      if (edited.quantity !== original.quantity) payload.quantity = edited.quantity;
      if (edited.finalPrice !== original.finalPrice) payload.finalPrice = edited.finalPrice;
      if (edited.discountPercentage !== original.discountPercentage) payload.discountPercentage = edited.discountPercentage;

      if (Object.keys(payload).length === 0) return; // Sin cambios

      const updatedOrder = await updateOrderItem(order.id, index, payload);
      setOrder(updatedOrder);
      setLocalItems([...updatedOrder.items]);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Error al guardar el item.");
    } finally {
      setSaving(false);
    }
  }

  // Eliminar un item
  async function handleRemoveItem(index: number) {
    if (!order) return;
    if (!window.confirm(`Eliminar "${order.items[index]?.name}" de la orden?`)) return;
    setSaving(true);
    setEditError(null);
    try {
      const updatedOrder = await removeOrderItem(order.id, index, "Sin stock disponible");
      setOrder(updatedOrder);
      setLocalItems([...updatedOrder.items]);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Error al eliminar el item.");
    } finally {
      setSaving(false);
    }
  }

  // Agregar item
  async function handleAddItem() {
    if (!order) return;
    setAddError(null);
    if (!addForm.name.trim()) { setAddError("El nombre es obligatorio."); return; }
    if (addForm.quantity < 1) { setAddError("La cantidad debe ser mayor a 0."); return; }
    if (addForm.finalPrice < 0) { setAddError("El precio debe ser mayor o igual a 0."); return; }

    setAddSaving(true);
    try {
      const updatedOrder = await addOrderItem(order.id, addForm);
      setOrder(updatedOrder);
      setLocalItems([...updatedOrder.items]);
      setShowAddModal(false);
      setAddForm({ name: "", sku: "", quantity: 1, finalPrice: 0, discountPercentage: 0 });
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Error al agregar el item.");
    } finally {
      setAddSaving(false);
    }
  }

  // Confirmar cambios y notificar al cliente
  async function handleConfirmChanges() {
    if (!order) return;
    if (!window.confirm("Confirmar cambios y notificar al cliente?")) return;
    setConfirming(true);
    setEditError(null);
    try {
      const updatedOrder = await confirmOrderChanges(order.id);
      setOrder(updatedOrder);
      setLocalItems([...updatedOrder.items]);
      setEditMode(false);
      // Toast de exito simple
      alert("Cambios confirmados. El cliente fue notificado.");
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Error al confirmar los cambios.");
    } finally {
      setConfirming(false);
    }
  }

  // ─── Calculos locales para el resumen en modo edicion ──────────────────────
  const displayItems = editMode ? localItems : (order?.items || []);
  const localSubTotal = displayItems.reduce((acc, item) => acc + (item.originalPrice || item.finalPrice) * item.quantity, 0);
  const localDiscountTotal = displayItems.reduce((acc, item) => acc + (item.savings || 0), 0);
  const localTotal = Math.max(0, localSubTotal - localDiscountTotal - (order?.couponDiscount || 0)) + (order?.shipping || 0);

  const changelog = order?.changelog || [];
  const hasUnconfirmedChanges = changelog.length > 0 && !order?.lastModifiedByDistributor;
  const canEdit = isDistributor && order?.status?.toLowerCase() !== "cancelled";

  // ─── Render estados ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2"
            style={{ borderColor: themeColors.primary }}
          />
        </div>
      </AdminLayout>
    );
  }

  if (error || !order) {
    return (
      <AdminLayout>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4" style={{ color: themeColors.text.primary }}>
            {error || "Orden no encontrada"}
          </h2>
          <button
            onClick={() => router.push("/admin/ordenes")}
            className="px-4 py-2 rounded-lg"
            style={{ backgroundColor: themeColors.primary, color: "white" }}
          >
            Volver a Ordenes
          </button>
        </div>
      </AdminLayout>
    );
  }

  // ─── Render principal ──────────────────────────────────────────────────────

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 flex-wrap gap-4"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin/ordenes")}
              className="p-2 rounded-xl transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: `${themeColors.surface}80`,
                color: themeColors.text.primary,
              }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: themeColors.text.primary }}>
                Detalle de Orden
              </h1>
              <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                {order.orderNo} &mdash; creada el {new Date(order.createdAt).toLocaleDateString("es-UY")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Boton Descargar */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-xl font-medium flex items-center gap-2"
              style={{
                backgroundColor: `${themeColors.surface}80`,
                color: themeColors.text.primary,
                border: `1px solid ${themeColors.primary}30`,
              }}
            >
              <Download className="w-4 h-4" />
              Descargar
            </motion.button>

            {/* Botones de edicion (solo distribuidor) */}
            {canEdit && !editMode && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={enterEditMode}
                className="px-4 py-2 rounded-xl font-medium flex items-center gap-2"
                style={{
                  backgroundColor: `${themeColors.primary}20`,
                  color: themeColors.primary,
                  border: `1px solid ${themeColors.primary}30`,
                }}
              >
                <Edit className="w-4 h-4" />
                Editar orden
              </motion.button>
            )}

            {editMode && (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={cancelEditMode}
                  disabled={saving || confirming}
                  className="px-4 py-2 rounded-xl font-medium flex items-center gap-2 disabled:opacity-50"
                  style={{
                    backgroundColor: "#6b728020",
                    color: "#6b7280",
                    border: "1px solid #6b728030",
                  }}
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirmChanges}
                  disabled={saving || confirming || changelog.length === 0}
                  className="px-4 py-2 rounded-xl font-medium flex items-center gap-2 disabled:opacity-50"
                  style={{
                    backgroundColor: "#10b98120",
                    color: "#10b981",
                    border: "1px solid #10b98130",
                  }}
                >
                  <Save className="w-4 h-4" />
                  {confirming ? "Confirmando..." : "Confirmar cambios"}
                </motion.button>
              </>
            )}
          </div>
        </motion.div>

        {/* Banner modo edicion */}
        <AnimatePresence>
          {editMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 rounded-xl flex items-center gap-3"
              style={{ backgroundColor: `${themeColors.primary}15`, border: `1px solid ${themeColors.primary}30` }}
            >
              <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: themeColors.primary }} />
              <p className="text-sm" style={{ color: themeColors.text.primary }}>
                Modo edicion activo. Cada cambio se guarda inmediatamente. Usa &ldquo;Confirmar cambios&rdquo; para notificar al cliente cuando termines.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error de edicion */}
        <AnimatePresence>
          {editError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 rounded-xl"
              style={{ backgroundColor: "#ef444420", border: "1px solid #ef444430" }}
            >
              <p className="text-sm" style={{ color: "#ef4444" }}>{editError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabla de items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border overflow-hidden"
              style={{
                backgroundColor: `${themeColors.surface}70`,
                borderColor: `${themeColors.primary}30`,
              }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold" style={{ color: themeColors.text.primary }}>
                    Productos de la orden
                  </h3>
                  {editMode && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowAddModal(true)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5"
                      style={{
                        backgroundColor: `${themeColors.primary}20`,
                        color: themeColors.primary,
                        border: `1px solid ${themeColors.primary}30`,
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Agregar producto
                    </motion.button>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ backgroundColor: `${themeColors.primary}10` }}>
                        <th className="text-left p-3 text-sm font-semibold" style={{ color: themeColors.text.primary }}>Producto</th>
                        <th className="text-left p-3 text-sm font-semibold" style={{ color: themeColors.text.primary }}>Cantidad</th>
                        <th className="text-left p-3 text-sm font-semibold" style={{ color: themeColors.text.primary }}>Precio unit.</th>
                        <th className="text-left p-3 text-sm font-semibold" style={{ color: themeColors.text.primary }}>Descuento %</th>
                        <th className="text-left p-3 text-sm font-semibold" style={{ color: themeColors.text.primary }}>Total</th>
                        {editMode && <th className="p-3" />}
                      </tr>
                    </thead>
                    <tbody>
                      {displayItems.map((item, index) => (
                        <EditableItemRow
                          key={`${item.pid}-${index}`}
                          item={item}
                          index={index}
                          editMode={editMode}
                          saving={saving}
                          themeColors={themeColors}
                          onFieldChange={(field, value) => handleLocalItemChange(index, field as keyof OrderItem, value)}
                          onSave={() => saveItemChange(index)}
                          onRemove={() => handleRemoveItem(index)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>

            {/* Resumen / Factura */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl border"
              style={{
                backgroundColor: `${themeColors.surface}70`,
                borderColor: `${themeColors.primary}30`,
              }}
            >
              <h3 className="text-lg font-bold mb-4" style={{ color: themeColors.text.primary }}>
                Resumen de Orden
                {editMode && (
                  <span className="ml-2 text-xs font-normal" style={{ color: themeColors.primary }}>
                    (actualizado en tiempo real)
                  </span>
                )}
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span style={{ color: themeColors.text.secondary }}>Subtotal:</span>
                  <span style={{ color: themeColors.text.primary }}>
                    ${editMode ? localSubTotal.toFixed(2) : order.subTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: themeColors.text.secondary }}>Descuentos en items:</span>
                  <span style={{ color: themeColors.text.primary }}>
                    -${editMode ? localDiscountTotal.toFixed(2) : order.itemDiscountTotal.toFixed(2)}
                  </span>
                </div>
                {order.couponDiscount > 0 && (
                  <div className="flex justify-between">
                    <span style={{ color: themeColors.text.secondary }}>Cupon:</span>
                    <span style={{ color: "#10b981" }}>-${order.couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span style={{ color: themeColors.text.secondary }}>Envio:</span>
                  <span style={{ color: themeColors.text.primary }}>${order.shipping.toFixed(2)}</span>
                </div>
                <hr style={{ borderColor: `${themeColors.primary}20` }} />
                <div className="flex justify-between text-lg font-bold">
                  <span style={{ color: themeColors.text.primary }}>Total:</span>
                  <span style={{ color: themeColors.primary }}>
                    ${editMode ? localTotal.toFixed(2) : order.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Seccion de cambios realizados (en factura) */}
              {changelog.length > 0 && (
                <div className="mt-6 pt-4 border-t" style={{ borderColor: `${themeColors.primary}20` }}>
                  <p className="text-sm font-semibold mb-2" style={{ color: themeColors.text.secondary }}>
                    Cambios realizados por el distribuidor:
                  </p>
                  <ul className="space-y-1">
                    {changelog.map((entry) => (
                      <li key={entry.id} className="text-xs" style={{ color: themeColors.text.secondary }}>
                        {formatChangelogEntry(entry)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>

            {/* Panel historial de cambios */}
            {changelog.length > 0 && (
              <ChangelogPanel
                changelog={changelog}
                themeColors={themeColors}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cliente */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-2xl border"
              style={{
                backgroundColor: `${themeColors.surface}70`,
                borderColor: `${themeColors.primary}30`,
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${themeColors.primary}20` }}>
                  <User className="w-5 h-5" style={{ color: themeColors.primary }} />
                </div>
                <h3 className="text-lg font-bold" style={{ color: themeColors.text.primary }}>
                  Detalles del Cliente
                </h3>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm" style={{ color: themeColors.text.secondary }}>Nombre:</p>
                  <p className="font-medium" style={{ color: themeColors.text.primary }}>
                    {order.user.fullName || `${order.user.firstName || ""} ${order.user.lastName || ""}`.trim() || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: themeColors.text.secondary }}>Email:</p>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" style={{ color: themeColors.text.secondary }} />
                    <p style={{ color: themeColors.text.primary }}>{order.user.email}</p>
                  </div>
                </div>
                {order.user.phone && (
                  <div>
                    <p className="text-sm" style={{ color: themeColors.text.secondary }}>Telefono:</p>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" style={{ color: themeColors.text.secondary }} />
                      <p style={{ color: themeColors.text.primary }}>{order.user.phone}</p>
                    </div>
                  </div>
                )}
                {order.user.city && (
                  <div>
                    <p className="text-sm" style={{ color: themeColors.text.secondary }}>Ciudad:</p>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" style={{ color: themeColors.text.secondary }} />
                      <p style={{ color: themeColors.text.primary }}>{order.user.city}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Pago */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-2xl border"
              style={{
                backgroundColor: `${themeColors.surface}70`,
                borderColor: `${themeColors.primary}30`,
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${themeColors.secondary}20` }}>
                  <DollarSign className="w-5 h-5" style={{ color: themeColors.secondary }} />
                </div>
                <h3 className="text-lg font-bold" style={{ color: themeColors.text.primary }}>
                  Metodo de Pago
                </h3>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm" style={{ color: themeColors.text.secondary }}>Metodo:</p>
                  <p className="font-medium" style={{ color: themeColors.text.primary }}>{order.paymentMethod || "—"}</p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: themeColors.text.secondary }}>Envio:</p>
                  <p className="font-medium" style={{ color: themeColors.text.primary }}>${order.shipping}</p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: themeColors.text.secondary }}>Fecha de orden:</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" style={{ color: themeColors.text.secondary }} />
                    <p style={{ color: themeColors.text.primary }}>{new Date(order.createdAt).toLocaleDateString("es-UY")}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Estado */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 rounded-2xl border"
              style={{
                backgroundColor: `${themeColors.surface}70`,
                borderColor: `${themeColors.primary}30`,
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${getStatusColor(order.status)}20` }}
                >
                  <div style={{ color: getStatusColor(order.status) }}>
                    {getStatusIcon(order.status)}
                  </div>
                </div>
                <h3 className="text-lg font-bold" style={{ color: themeColors.text.primary }}>
                  Estado de Orden
                </h3>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold mb-2" style={{ color: getStatusColor(order.status) }}>
                  {getStatusLabel(order.status)}
                </p>
                {order.lastModifiedByDistributor && (
                  <p className="text-xs mt-1" style={{ color: themeColors.text.secondary }}>
                    Ultima modificacion: {new Date(order.lastModifiedByDistributor).toLocaleString("es-UY")}
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Modal agregar item */}
        <AnimatePresence>
          {showAddModal && (
            <AddItemModal
              addForm={addForm}
              addError={addError}
              addSaving={addSaving}
              themeColors={themeColors}
              onChange={(field, value) => setAddForm((prev) => ({ ...prev, [field]: value }))}
              onConfirm={handleAddItem}
              onClose={() => { setShowAddModal(false); setAddError(null); }}
            />
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}

// ─── Subcomponente: fila editable ─────────────────────────────────────────────

interface EditableItemRowProps {
  item: OrderItem;
  index: number;
  editMode: boolean;
  saving: boolean;
  themeColors: ReturnType<typeof useTheme>["themeColors"];
  onFieldChange: (field: string, value: number) => void;
  onSave: () => void;
  onRemove: () => void;
}

function EditableItemRow({ item, index, editMode, saving, themeColors, onFieldChange, onSave, onRemove }: EditableItemRowProps) {
  const [dirty, setDirty] = useState(false);

  function handleChange(field: string, value: string) {
    onFieldChange(field, Number(value));
    setDirty(true);
  }

  return (
    <tr
      className="border-t"
      style={{
        borderColor: `${themeColors.primary}20`,
        backgroundColor: item.addedByDistributor ? `${themeColors.primary}08` : undefined,
      }}
    >
      <td className="p-3">
        <p className="font-medium" style={{ color: themeColors.text.primary }}>
          {item.name}
          {item.addedByDistributor && (
            <span className="ml-2 text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: `${themeColors.primary}20`, color: themeColors.primary }}>
              Agregado
            </span>
          )}
        </p>
        {item.sku && <p className="text-xs" style={{ color: themeColors.text.secondary }}>{item.sku}</p>}
      </td>

      {/* Cantidad */}
      <td className="p-3">
        {editMode ? (
          <input
            type="number"
            min="1"
            step="1"
            value={item.quantity}
            onChange={(e) => handleChange("quantity", e.target.value)}
            className="w-20 px-2 py-1 rounded-lg text-sm border"
            style={{
              backgroundColor: `${themeColors.surface}`,
              color: themeColors.text.primary,
              borderColor: `${themeColors.primary}40`,
            }}
          />
        ) : (
          <span style={{ color: themeColors.text.primary }}>{item.quantity}</span>
        )}
      </td>

      {/* Precio */}
      <td className="p-3">
        {editMode ? (
          <input
            type="number"
            min="0"
            step="0.01"
            value={item.finalPrice}
            onChange={(e) => handleChange("finalPrice", e.target.value)}
            className="w-24 px-2 py-1 rounded-lg text-sm border"
            style={{
              backgroundColor: `${themeColors.surface}`,
              color: themeColors.text.primary,
              borderColor: `${themeColors.primary}40`,
            }}
          />
        ) : (
          <span style={{ color: themeColors.text.primary }}>${item.finalPrice}</span>
        )}
      </td>

      {/* Descuento */}
      <td className="p-3">
        {editMode ? (
          <input
            type="number"
            min="0"
            max="100"
            step="0.5"
            value={item.discountPercentage}
            onChange={(e) => handleChange("discountPercentage", e.target.value)}
            className="w-20 px-2 py-1 rounded-lg text-sm border"
            style={{
              backgroundColor: `${themeColors.surface}`,
              color: themeColors.text.primary,
              borderColor: `${themeColors.primary}40`,
            }}
          />
        ) : (
          <span style={{ color: themeColors.text.primary }}>{item.discountPercentage}%</span>
        )}
      </td>

      {/* Total */}
      <td className="p-3 font-medium" style={{ color: themeColors.text.primary }}>
        ${(item.finalPrice * item.quantity).toFixed(2)}
      </td>

      {/* Acciones edicion */}
      {editMode && (
        <td className="p-3">
          <div className="flex items-center gap-2">
            {dirty && (
              <button
                onClick={() => { onSave(); setDirty(false); }}
                disabled={saving}
                title="Guardar cambios de este item"
                className="p-1.5 rounded-lg disabled:opacity-50"
                style={{ backgroundColor: "#10b98120", color: "#10b981" }}
              >
                <Save className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onRemove}
              disabled={saving}
              title="Eliminar item"
              className="p-1.5 rounded-lg disabled:opacity-50"
              style={{ backgroundColor: "#ef444420", color: "#ef4444" }}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      )}
    </tr>
  );
}

// ─── Subcomponente: panel de historial ────────────────────────────────────────

interface ChangelogPanelProps {
  changelog: ChangelogEntry[];
  themeColors: ReturnType<typeof useTheme>["themeColors"];
}

function ChangelogPanel({ changelog, themeColors }: ChangelogPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="p-6 rounded-2xl border"
      style={{
        backgroundColor: `${themeColors.surface}70`,
        borderColor: `${themeColors.primary}30`,
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <History className="w-5 h-5" style={{ color: themeColors.primary }} />
        <h3 className="text-lg font-bold" style={{ color: themeColors.text.primary }}>
          Historial de cambios ({changelog.length})
        </h3>
      </div>

      <div className="space-y-3">
        {[...changelog].reverse().map((entry) => (
          <div
            key={entry.id}
            className="flex items-start gap-3 p-3 rounded-xl"
            style={{ backgroundColor: `${themeColors.primary}08` }}
          >
            <div
              className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
              style={{
                backgroundColor:
                  entry.action === "remove_item"
                    ? "#ef4444"
                    : entry.action === "add_item"
                    ? "#10b981"
                    : themeColors.primary,
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium" style={{ color: themeColors.text.primary }}>
                {formatChangelogEntry(entry)}
              </p>
              <p className="text-xs mt-0.5" style={{ color: themeColors.text.secondary }}>
                {entry.changedBy} &mdash; {new Date(entry.timestamp).toLocaleString("es-UY")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Subcomponente: modal agregar item ────────────────────────────────────────

interface AddItemModalProps {
  addForm: AddItemPayload;
  addError: string | null;
  addSaving: boolean;
  themeColors: ReturnType<typeof useTheme>["themeColors"];
  onChange: (field: keyof AddItemPayload, value: string | number) => void;
  onConfirm: () => void;
  onClose: () => void;
}

function AddItemModal({ addForm, addError, addSaving, themeColors, onChange, onConfirm, onClose }: AddItemModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md p-6 rounded-2xl shadow-2xl"
        style={{ backgroundColor: themeColors.surface }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold" style={{ color: themeColors.text.primary }}>
            Agregar producto
          </h3>
          <button onClick={onClose} style={{ color: themeColors.text.secondary }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1" style={{ color: themeColors.text.secondary }}>Nombre *</label>
            <input
              type="text"
              value={addForm.name}
              onChange={(e) => onChange("name", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border text-sm"
              style={{
                backgroundColor: `${themeColors.surface}80`,
                color: themeColors.text.primary,
                borderColor: `${themeColors.primary}40`,
              }}
              placeholder="Nombre del producto"
            />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: themeColors.text.secondary }}>SKU</label>
            <input
              type="text"
              value={addForm.sku || ""}
              onChange={(e) => onChange("sku", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border text-sm"
              style={{
                backgroundColor: `${themeColors.surface}80`,
                color: themeColors.text.primary,
                borderColor: `${themeColors.primary}40`,
              }}
              placeholder="SKU (opcional)"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm mb-1" style={{ color: themeColors.text.secondary }}>Cantidad *</label>
              <input
                type="number"
                min="1"
                value={addForm.quantity}
                onChange={(e) => onChange("quantity", Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border text-sm"
                style={{
                  backgroundColor: `${themeColors.surface}80`,
                  color: themeColors.text.primary,
                  borderColor: `${themeColors.primary}40`,
                }}
              />
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: themeColors.text.secondary }}>Precio *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={addForm.finalPrice}
                onChange={(e) => onChange("finalPrice", Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border text-sm"
                style={{
                  backgroundColor: `${themeColors.surface}80`,
                  color: themeColors.text.primary,
                  borderColor: `${themeColors.primary}40`,
                }}
              />
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: themeColors.text.secondary }}>Dcto %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={addForm.discountPercentage || 0}
                onChange={(e) => onChange("discountPercentage", Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border text-sm"
                style={{
                  backgroundColor: `${themeColors.surface}80`,
                  color: themeColors.text.primary,
                  borderColor: `${themeColors.primary}40`,
                }}
              />
            </div>
          </div>

          {addError && (
            <p className="text-sm" style={{ color: "#ef4444" }}>{addError}</p>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-xl font-medium text-sm"
            style={{ backgroundColor: "#6b728020", color: "#6b7280" }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={addSaving}
            className="flex-1 px-4 py-2 rounded-xl font-medium text-sm disabled:opacity-50"
            style={{ backgroundColor: themeColors.primary, color: "white" }}
          >
            {addSaving ? "Agregando..." : "Agregar"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
