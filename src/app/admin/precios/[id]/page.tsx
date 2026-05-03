"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  Calendar,
  DollarSign,
  Package,
  User,
  Clock,
  AlertTriangle,
  Check,
  Trash2,
  Copy,
  TrendingUp,
  Building,
  Loader2,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useTheme } from "@/contexts/theme-context";
import { StyledSelect } from "@/components/ui/styled-select";
import { ProductAutocomplete } from "@/components/admin/precios/product-autocomplete";
import http from "@/api/http-client";
import { toast } from "sonner";

interface PriceItem {
  id: string;
  productCode: string;
  productName: string;
  minQuantity: number;
  maxQuantity: number;
  price: number;
  currency: 'USD' | 'UYU' | 'EUR' | 'BRL';
  endDate: string;
  includeIVA: boolean;
  status: 'ACTIVO' | 'INACTIVO' | 'VENCIDO' | 'PROGRAMADO';
  createdAt: string;
  updatedAt: string;
  margin?: number;
  costPrice?: number;
  category?: string;
  supplier?: string;
  description?: string;
  tags?: string[];
  lastModifiedBy?: string;
  priceListId?: string;
  productId?: string;
  distributorCode?: string;
  effectiveDate?: string;
  expirationDate?: string;
  basePrice?: number;
  salePrice?: number;
  profitMargin?: number;
  taxRate?: number;
  priceType?: string;
  priority?: number;
  customerType?: string;
  channel?: string;
  region?: string;
  validFrom?: string;
  customFields?: Record<string, unknown>;
}

export default function PriceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { themeColors } = useTheme();
  const [price, setPrice] = useState<PriceItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editedPrice, setEditedPrice] = useState<PriceItem | null>(null);
  const [isNewPrice, setIsNewPrice] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const loadPrice = useCallback(async (priceId: string) => {
    setIsLoading(true);
    try {
      const response = await http.get(`/price/getprice/${priceId}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = response.data as any;
      const data = result.price || result.data || result;

      if (!data || !data.price_id) throw new Error("No se encontró el precio");

      const mappedPrice: PriceItem = {
        id: data.price_id || data.priceId,
        productCode: data.productSku || data.product_sku || data.productCode || "",
        productName: data.productName || data.product_name || "",
        minQuantity: data.minQuantity || data.min_quantity || 1,
        maxQuantity: data.maxQuantity || data.max_quantity || 1000,
        price: data.salePrice || data.sale_price || data.price || 0,
        currency: (data.currency?.toUpperCase() || "USD") as 'USD' | 'UYU' | 'EUR' | 'BRL',
        endDate: data.expirationDate ? data.expirationDate.split("T")[0] : data.expiration_date ? data.expiration_date.split("T")[0] : "",
        includeIVA: data.taxIncluded || data.tax_included || data.includeIVA || false,
        status: data.is_active === true || data.status === "active" ? "ACTIVO" : data.is_active === false || data.status === "inactive" ? "INACTIVO" : (data.status?.toUpperCase() || "ACTIVO") as 'ACTIVO' | 'INACTIVO' | 'VENCIDO' | 'PROGRAMADO',
        createdAt: data.createdAt || data.created_at || new Date().toISOString(),
        updatedAt: data.updatedAt || data.updated_at || new Date().toISOString(),
        basePrice: data.basePrice || data.base_price || 0,
        salePrice: data.salePrice || data.sale_price || 0,
        costPrice: data.costPrice || data.cost_price,
        margin: data.margin || data.margin_percentage,
        profitMargin: data.profitMargin,
        taxRate: data.taxRate || data.tax_rate,
        priceType: data.priceType || data.price_type,
        priority: data.priority,
        customerType: data.customerType || data.customer_type,
        channel: data.channel,
        region: data.region,
        validFrom: data.validFrom || data.valid_from,
        category: data.category,
        supplier: data.supplier,
        description: data.description,
        priceListId: data.list_id || data.priceListId || data.listId,
        productId: data.product_id || data.productId,
        distributorCode: data.distributorCode,
        effectiveDate: data.effective_date || data.validFrom,
        expirationDate: data.expiration_date,
        customFields: data.customFields || data.custom_fields,
      };
      setPrice(mappedPrice);
      setEditedPrice(mappedPrice);
    } catch (error) {
      console.error("Error cargando precio:", error);
      toast.error("Error al cargar el precio");
      setTimeout(() => router.push("/admin/precios"), 2000);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const priceId = params.id as string;
    if (priceId === "new" || priceId === "nuevo") {
      setIsNewPrice(true);
      setIsEditing(true);
      const newPrice: PriceItem = {
        id: "", productCode: "", productName: "", minQuantity: 1, maxQuantity: 1000,
        price: 0, currency: "USD", endDate: "", includeIVA: false, status: "ACTIVO",
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        basePrice: 0, salePrice: 0,
      };
      setPrice(newPrice);
      setEditedPrice(newPrice);
      setIsLoading(false);
      return;
    }
    loadPrice(priceId);
  }, [params.id, router, loadPrice]);

  const handleEdit = () => { setIsEditing(true); setEditedPrice(price); };
  const handleCancel = () => { setIsEditing(false); setEditedPrice(price); };

  const handleSave = async () => {
    if (!editedPrice) return;
    setIsSaving(true);
    try {
      const payload = {
        price_id: isNewPrice ? `PRC${Date.now()}` : editedPrice.id,
        price_list_id: editedPrice.priceListId || "PL001",
        product_id: editedPrice.productId || editedPrice.productCode,
        distributorCode: editedPrice.distributorCode || "Dist01",
        base_price: editedPrice.basePrice || editedPrice.price,
        sale_price: editedPrice.salePrice || editedPrice.price,
        currency: editedPrice.currency,
        min_quantity: editedPrice.minQuantity,
        status: editedPrice.status.toLowerCase(),
        effective_date: editedPrice.effectiveDate || `${new Date().toISOString().split("T")[0]}T00:00:00Z`,
        expiration_date: editedPrice.endDate ? `${editedPrice.endDate}T23:59:59Z` : undefined,
      };
      let response;
      if (isNewPrice) {
        response = await http.post("/price/", payload);
        toast.success("Precio creado exitosamente");
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { price_id, ...updatePayload } = payload;
        const priceIdToUpdate = params.id as string;
        response = await http.put(`/price/${priceIdToUpdate}`, updatePayload);
        toast.success("Precio actualizado exitosamente");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = response.data as any;
      setIsEditing(false);
      if (isNewPrice && result.price?.price_id) {
        router.push(`/admin/precios/${result.price.price_id}`);
      } else {
        loadPrice(editedPrice.id);
      }
    } catch (error) {
      const errorMessage = error && typeof error === 'object' && 'message' in error ? String(error.message) : "Error al guardar el precio";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!price) return;
    try {
      await http.delete(`/price/${price.id}`);
      toast.success("Precio eliminado exitosamente");
      router.push("/admin/precios");
    } catch (error) {
      const errorMessage = error && typeof error === 'object' && 'message' in error ? String(error.message) : "Error al eliminar el precio";
      toast.error(errorMessage);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVO": return "bg-green-50 text-green-700 border border-green-200";
      case "INACTIVO": return "bg-gray-100 text-gray-600 border border-gray-200";
      case "VENCIDO": return "bg-red-50 text-red-700 border border-red-200";
      case "PROGRAMADO": return "bg-blue-50 text-blue-700 border border-blue-200";
      default: return "bg-gray-100 text-gray-600 border border-gray-200";
    }
  };

  const formatCurrency = (value: number, currency: string) => {
    const symbols = { USD: "$", UYU: "$U", EUR: "€", BRL: "R$" };
    return `${symbols[currency as keyof typeof symbols] || "$"} ${value.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("ID copiado al portapapeles");
  };

  const handleFieldChange = (field: keyof PriceItem, value: string | number | boolean) => {
    if (!editedPrice) return;
    setEditedPrice({ ...editedPrice, [field]: value });
  };

  const inputClass = "w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-all text-gray-900";

  if (isLoading || !price) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" style={{ color: themeColors.primary }} />
            <p className="text-gray-500">Cargando precio...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.back()}
              className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Precio: {price.productCode}
              </h1>
              <p className="text-gray-500 text-sm">{price.productName}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {!isEditing ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => copyToClipboard(price.id)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
                >
                  <Copy className="w-4 h-4" />
                  Copiar ID
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl font-medium transition-all"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (<><Loader2 className="w-4 h-4 animate-spin" />Guardando...</>) : (<><Save className="w-4 h-4" />Guardar</>)}
                </motion.button>
              </>
            )}
          </div>
        </motion.div>

        {/* Métricas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: themeColors.primary + "15" }}>
                <DollarSign className="w-5 h-5" style={{ color: themeColors.primary }} />
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(price.status)}`}>
                {price.status}
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: themeColors.primary }}>{formatCurrency(price.price, price.currency)}</p>
            <p className="text-sm text-gray-500">Precio actual</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{price.minQuantity}</p>
            <p className="text-sm text-gray-500">Min. cantidad</p>
          </div>

          {price.margin ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-50">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-green-700">{price.margin}%</p>
              <p className="text-sm text-gray-500">Margen</p>
            </div>
          ) : null}

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50">
                <Calendar className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <p className="text-lg font-bold text-gray-900">{formatDate(price.endDate)}</p>
            <p className="text-sm text-gray-500">Fecha fin</p>
          </div>
        </motion.div>

        {/* Información principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Información del precio */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
              <DollarSign className="w-5 h-5" style={{ color: themeColors.primary }} />
              Información del Precio
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-500">
                  Producto {isEditing && <span className="text-red-500">*</span>}
                </label>
                {isEditing && editedPrice ? (
                  <ProductAutocomplete
                    value={`${editedPrice.productCode} - ${editedPrice.productName}`}
                    onSelect={(product) => {
                      if (editedPrice) {
                        setEditedPrice({
                          ...editedPrice,
                          productCode: product.sku,
                          productName: product.name,
                          productId: product.id,
                          category: product.category,
                          ...(product.price && { basePrice: product.price, salePrice: product.price, price: product.price }),
                        });
                      }
                    }}
                    placeholder="Buscar por código o nombre de producto..."
                  />
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2">
                    <p className="text-sm font-mono font-semibold" style={{ color: themeColors.primary }}>{price.productCode}</p>
                    <span className="text-gray-300">•</span>
                    <p className="text-sm text-gray-900">{price.productName}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-500">Moneda</label>
                  {isEditing && editedPrice ? (
                    <StyledSelect
                      value={editedPrice.currency}
                      onChange={(value: string) => handleFieldChange("currency", value as 'USD' | 'UYU' | 'EUR' | 'BRL')}
                      options={[
                        { value: "USD", label: "USD" },
                        { value: "UYU", label: "UYU" },
                        { value: "EUR", label: "EUR" },
                        { value: "BRL", label: "BRL" },
                      ]}
                    />
                  ) : (
                    <p className="px-3 py-2 text-sm font-mono text-gray-900">{price.currency}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-500">Categoría</label>
                  <p className="px-3 py-2 text-sm text-gray-900">{price.category || "-"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-500">Precio</label>
                  {isEditing && editedPrice ? (
                    <input type="number" value={editedPrice.price} onChange={(e) => handleFieldChange("price", Number(e.target.value))} className={inputClass} />
                  ) : (
                    <p className="px-3 py-2 text-sm font-semibold" style={{ color: themeColors.primary }}>{formatCurrency(price.price, price.currency)}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-500">Cantidad Mínima</label>
                  {isEditing && editedPrice ? (
                    <input type="number" value={editedPrice.minQuantity} onChange={(e) => handleFieldChange("minQuantity", Number(e.target.value))} className={inputClass} />
                  ) : (
                    <p className="px-3 py-2 text-sm text-gray-900">{price.minQuantity} unidades</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-500">Fecha de Fin</label>
                  {isEditing && editedPrice ? (
                    <input type="date" value={editedPrice.endDate} onChange={(e) => handleFieldChange("endDate", e.target.value)} className={inputClass} />
                  ) : (
                    <p className="px-3 py-2 text-sm text-gray-900">{formatDate(price.endDate)}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-500">Estado</label>
                  {isEditing && editedPrice ? (
                    <StyledSelect
                      value={editedPrice.status}
                      onChange={(value: string) => handleFieldChange("status", value as 'ACTIVO' | 'INACTIVO' | 'VENCIDO' | 'PROGRAMADO')}
                      options={[
                        { value: "ACTIVO", label: "Activo" },
                        { value: "INACTIVO", label: "Inactivo" },
                        { value: "VENCIDO", label: "Vencido" },
                        { value: "PROGRAMADO", label: "Programado" },
                      ]}
                    />
                  ) : (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(price.status)}`}>
                      {price.status}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-500 flex items-center gap-2">
                  <span>Incluye IVA</span>
                  {price.includeIVA ? <Check className="w-4 h-4 text-green-500" /> : <AlertTriangle className="w-4 h-4 text-gray-400" />}
                </label>
                {isEditing && editedPrice ? (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editedPrice.includeIVA} onChange={(e) => handleFieldChange("includeIVA", e.target.checked)} className="sr-only peer" />
                    <div
                      className="relative w-5 h-5 bg-white border-2 border-gray-300 rounded-md transition-all duration-200"
                      style={{
                        borderColor: editedPrice.includeIVA ? themeColors.primary : undefined,
                        backgroundColor: editedPrice.includeIVA ? themeColors.primary : undefined,
                      }}
                    >
                      <Check className="absolute inset-0 w-3 h-3 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" />
                    </div>
                    <span className="text-sm text-gray-700">Incluir IVA en el precio</span>
                  </label>
                ) : (
                  <p className="px-3 py-2 text-sm text-gray-900">{price.includeIVA ? "Sí" : "No"}</p>
                )}
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
              <Building className="w-5 h-5" style={{ color: themeColors.primary }} />
              Información Adicional
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-500">Categoría</label>
                {isEditing && editedPrice ? (
                  <StyledSelect
                    value={editedPrice.category || ""}
                    onChange={(value) => handleFieldChange("category", value)}
                    options={[
                      { value: "Electrónicos", label: "Electrónicos" },
                      { value: "Informática", label: "Informática" },
                      { value: "Accesorios", label: "Accesorios" },
                    ]}
                  />
                ) : (
                  <p className="px-3 py-2 text-sm text-gray-900">{price.category || "Sin categoría"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-500">Proveedor</label>
                {isEditing && editedPrice ? (
                  <input type="text" value={editedPrice.supplier || ""} onChange={(e) => handleFieldChange("supplier", e.target.value)} className={inputClass} />
                ) : (
                  <p className="px-3 py-2 text-sm text-gray-900">{price.supplier || "Sin proveedor"}</p>
                )}
              </div>

              {price.costPrice ? (
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-500">Precio de Costo</label>
                  {isEditing && editedPrice ? (
                    <input type="number" value={editedPrice.costPrice || 0} onChange={(e) => handleFieldChange("costPrice", Number(e.target.value))} className={inputClass} />
                  ) : (
                    <p className="px-3 py-2 text-sm text-gray-900">{formatCurrency(price.costPrice, price.currency)}</p>
                  )}
                </div>
              ) : null}

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-500">Descripción</label>
                {isEditing && editedPrice ? (
                  <textarea value={editedPrice.description || ""} onChange={(e) => handleFieldChange("description", e.target.value)} rows={3} className={inputClass + " resize-none"} />
                ) : (
                  <p className="px-3 py-2 text-sm text-gray-900">{price.description || "Sin descripción"}</p>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="space-y-2 text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Creado: {formatDateTime(price.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Edit className="w-3.5 h-3.5" />
                    <span>Modificado: {formatDateTime(price.updatedAt)}</span>
                  </div>
                  {price.lastModifiedBy && (
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5" />
                      <span>Por: {price.lastModifiedBy}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Zona de peligro */}
        {!isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold mb-2 text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Zona de Peligro
            </h3>
            <p className="text-sm text-red-600 mb-4">
              Esta acción no se puede deshacer. El precio será eliminado permanentemente.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDeleteDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar Precio
            </motion.button>
          </motion.div>
        )}

        {/* Modal eliminación */}
        {showDeleteDialog && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            onClick={() => setShowDeleteDialog(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-gray-200 rounded-2xl p-6 max-w-md w-full shadow-xl"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2.5 rounded-xl bg-red-50">
                  <AlertTriangle className="w-5 h-5 text-red-700" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Confirmar Eliminación</h3>
                  <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-6">
                ¿Estás seguro que deseas eliminar este precio? Toda la información será eliminada permanentemente.
              </p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowDeleteDialog(false)} className="px-4 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={() => { setShowDeleteDialog(false); handleDelete(); }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
