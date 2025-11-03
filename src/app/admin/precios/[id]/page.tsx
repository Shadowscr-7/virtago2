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

// Tipos para precios
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
      
      console.log("📦 Respuesta del API de precio:", response.data);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = response.data as any;
      const data = result.price || result.data || result;
      
      if (!data || !data.price_id) {
        throw new Error("No se encontró el precio");
      }
      
      // Mapear respuesta del backend a estructura del frontend
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
        status: data.is_active === true || data.status === "active"
          ? "ACTIVO" 
          : data.is_active === false || data.status === "inactive"
          ? "INACTIVO" 
          : (data.status?.toUpperCase() || "ACTIVO") as 'ACTIVO' | 'INACTIVO' | 'VENCIDO' | 'PROGRAMADO',
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
      
      console.log("✅ Precio cargado:", mappedPrice);
    } catch (error) {
      console.error("❌ Error cargando precio:", error);
      toast.error("Error al cargar el precio");
      // Redirigir a la lista si no se encuentra el precio
      setTimeout(() => router.push("/admin/precios"), 2000);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const priceId = params.id as string;
    
    // Si el ID es "new" o "nuevo", es un precio nuevo
    if (priceId === "new" || priceId === "nuevo") {
      setIsNewPrice(true);
      setIsEditing(true);
      const newPrice: PriceItem = {
        id: "",
        productCode: "",
        productName: "",
        minQuantity: 1,
        maxQuantity: 1000,
        price: 0,
        currency: "USD",
        endDate: "",
        includeIVA: false,
        status: "ACTIVO",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        basePrice: 0,
        salePrice: 0,
      };
      setPrice(newPrice);
      setEditedPrice(newPrice);
      setIsLoading(false);
      return;
    }

    // Cargar datos del precio existente
    loadPrice(priceId);
  }, [params.id, router, loadPrice]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedPrice(price);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedPrice(price);
  };

  const handleSave = async () => {
    if (!editedPrice) return;
    
    setIsSaving(true);
    try {
      // Mapear estructura del frontend al backend
      const payload = {
        price_id: isNewPrice ? `PRC${Date.now()}` : editedPrice.id,
        price_list_id: editedPrice.priceListId || "PL001", // Valor por defecto o desde formulario
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
      
      console.log("📤 Payload a enviar:", payload);
      console.log("🔑 ID del precio para actualizar:", editedPrice.id);
      console.log("🆔 Params ID:", params.id);

      let response;
      
      if (isNewPrice) {
        // Crear nuevo precio
        response = await http.post("/price/", payload);
        toast.success("Precio creado exitosamente");
      } else {
        // Actualizar precio existente - remover price_id del payload
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { price_id, ...updatePayload } = payload;
        
        // Usar params.id que viene de la URL en lugar de editedPrice.id
        const priceIdToUpdate = params.id as string;
        console.log("🔄 Actualizando precio con ID:", priceIdToUpdate);
        
        response = await http.put(`/price/${priceIdToUpdate}`, updatePayload);
        toast.success("Precio actualizado exitosamente");
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = response.data as any;
      
      setIsEditing(false);
      
      // Si es un precio nuevo, redirigir al detalle con el ID
      if (isNewPrice && result.price?.price_id) {
        router.push(`/admin/precios/${result.price.price_id}`);
      } else {
        // Recargar datos del precio actualizado
        loadPrice(editedPrice.id);
      }
    } catch (error) {
      console.error("❌ Error guardando precio:", error);
      const errorMessage = error && typeof error === 'object' && 'message' in error 
        ? String(error.message) 
        : "Error al guardar el precio";
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
      console.error("❌ Error eliminando precio:", error);
      const errorMessage = error && typeof error === 'object' && 'message' in error 
        ? String(error.message) 
        : "Error al eliminar el precio";
      toast.error(errorMessage);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVO":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "INACTIVO":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
      case "VENCIDO":
        return "bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300";
      case "PROGRAMADO":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300";
    }
  };

  const formatCurrency = (value: number, currency: string) => {
    const symbols = { USD: "$", UYU: "$U", EUR: "€", BRL: "R$" };
    return `${symbols[currency as keyof typeof symbols] || "$"} ${value.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("ID copiado al portapapeles");
  };

  const handleFieldChange = (field: keyof PriceItem, value: string | number | boolean) => {
    if (!editedPrice) return;
    setEditedPrice({ ...editedPrice, [field]: value });
  };

  // Estado de carga
  if (isLoading || !price) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">
              Cargando precio...
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.back()}
              className="p-2 rounded-xl transition-colors duration-200"
              style={{
                backgroundColor: themeColors.surface + "60",
                color: themeColors.text.primary,
              }}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h1
                className="text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
                }}
              >
                Precio: {price.productCode}
              </h1>
              <p style={{ color: themeColors.text.secondary }}>
                {price.productName}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {!isEditing ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => copyToClipboard(price.id)}
                  className="px-4 py-2 border rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
                  style={{
                    backgroundColor: themeColors.surface + "60",
                    borderColor: themeColors.primary + "30",
                    color: themeColors.text.primary,
                  }}
                >
                  <Copy className="w-4 h-4" />
                  Copiar ID
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEdit}
                  className="px-4 py-2 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
                  }}
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
                  className="px-4 py-2 border rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
                  style={{
                    backgroundColor: themeColors.surface + "60",
                    borderColor: themeColors.primary + "30",
                    color: themeColors.text.primary,
                  }}
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
                  }}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Guardar
                    </>
                  )}
                </motion.button>
              </>
            )}
          </div>
        </motion.div>

        {/* Estado y métricas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div
            className="p-6 backdrop-blur-xl rounded-2xl border shadow-lg"
            style={{
              backgroundColor: themeColors.surface + "70",
              borderColor: themeColors.primary + "30",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{
                  backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
                }}
              >
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(price.status)}`}>
                {price.status}
              </span>
            </div>
            <div>
              <p
                className="text-2xl font-bold"
                style={{ color: themeColors.primary }}
              >
                {formatCurrency(price.price, price.currency)}
              </p>
              <p style={{ color: themeColors.text.secondary }} className="text-sm">
                Precio actual
              </p>
            </div>
          </div>

          <div
            className="p-6 backdrop-blur-xl rounded-2xl border shadow-lg"
            style={{
              backgroundColor: themeColors.surface + "70",
              borderColor: themeColors.primary + "30",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{
                  backgroundImage: `linear-gradient(to right, ${themeColors.secondary}, ${themeColors.accent})`,
                }}
              >
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p
                  className="text-2xl font-bold"
                  style={{ color: themeColors.secondary }}
                >
                  {price.minQuantity}
                </p>
                <p style={{ color: themeColors.text.secondary }} className="text-sm">
                  Min. cantidad
                </p>
              </div>
            </div>
          </div>

          {price.margin && (
            <div
              className="p-6 backdrop-blur-xl rounded-2xl border shadow-lg"
              style={{
                backgroundColor: themeColors.surface + "70",
                borderColor: themeColors.primary + "30",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${themeColors.accent}, ${themeColors.primary})`,
                  }}
                >
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p
                    className="text-2xl font-bold"
                    style={{ color: themeColors.accent }}
                  >
                    {price.margin}%
                  </p>
                  <p style={{ color: themeColors.text.secondary }} className="text-sm">
                    Margen
                  </p>
                </div>
              </div>
            </div>
          )}

          <div
            className="p-6 backdrop-blur-xl rounded-2xl border shadow-lg"
            style={{
              backgroundColor: themeColors.surface + "70",
              borderColor: themeColors.primary + "30",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{
                  backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.accent})`,
                }}
              >
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p
                  className="text-lg font-bold"
                  style={{ color: themeColors.text.primary }}
                >
                  {formatDate(price.endDate)}
                </p>
                <p style={{ color: themeColors.text.secondary }} className="text-sm">
                  Fecha fin
                </p>
              </div>
            </div>
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
          <div
            className="p-6 backdrop-blur-xl rounded-2xl border shadow-lg"
            style={{
              backgroundColor: themeColors.surface + "70",
              borderColor: themeColors.primary + "30",
            }}
          >
            <h3
              className="text-lg font-semibold mb-4 flex items-center gap-2"
              style={{ color: themeColors.text.primary }}
            >
              <DollarSign className="w-5 h-5" style={{ color: themeColors.primary }} />
              Información del Precio
            </h3>

            <div className="space-y-4">
              {/* Selector de producto con autocomplete */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.secondary }}>
                  Producto {isEditing && <span className="text-red-500">*</span>}
                </label>
                {isEditing && editedPrice ? (
                  <ProductAutocomplete
                    value={`${editedPrice.productCode} - ${editedPrice.productName}`}
                    onSelect={(product) => {
                      // Autocompletar datos del producto seleccionado
                      if (editedPrice) {
                        setEditedPrice({
                          ...editedPrice,
                          productCode: product.sku,
                          productName: product.name,
                          productId: product.id,
                          category: product.category,
                          // Si el producto tiene precio base, usarlo como referencia
                          ...(product.price && {
                            basePrice: product.price,
                            salePrice: product.price,
                            price: product.price,
                          }),
                        });
                      }
                    }}
                    placeholder="Buscar por código o nombre de producto..."
                  />
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2">
                    <p className="text-sm font-mono font-semibold" style={{ color: themeColors.primary }}>
                      {price.productCode}
                    </p>
                    <span style={{ color: themeColors.text.secondary }}>•</span>
                    <p className="text-sm" style={{ color: themeColors.text.primary }}>
                      {price.productName}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.secondary }}>
                    Moneda
                  </label>
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
                    <p className="px-3 py-2 text-sm font-mono" style={{ color: themeColors.text.primary }}>
                      {price.currency}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.secondary }}>
                    Categoría
                  </label>
                  <p className="px-3 py-2 text-sm" style={{ color: themeColors.text.primary }}>
                    {price.category || "-"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.secondary }}>
                    Precio
                  </label>
                  {isEditing && editedPrice ? (
                    <input
                      type="number"
                      value={editedPrice.price}
                      onChange={(e) => handleFieldChange("price", Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                      style={{
                        backgroundColor: themeColors.surface + "60",
                        borderColor: themeColors.primary + "30",
                        color: themeColors.text.primary,
                        "--tw-ring-color": `${themeColors.primary}50`,
                      } as React.CSSProperties}
                    />
                  ) : (
                    <p className="px-3 py-2 text-sm font-semibold" style={{ color: themeColors.primary }}>
                      {formatCurrency(price.price, price.currency)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.secondary }}>
                    Cantidad Mínima
                  </label>
                  {isEditing && editedPrice ? (
                    <input
                      type="number"
                      value={editedPrice.minQuantity}
                      onChange={(e) => handleFieldChange("minQuantity", Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                      style={{
                        backgroundColor: themeColors.surface + "60",
                        borderColor: themeColors.primary + "30",
                        color: themeColors.text.primary,
                        "--tw-ring-color": `${themeColors.primary}50`,
                      } as React.CSSProperties}
                    />
                  ) : (
                    <p className="px-3 py-2 text-sm" style={{ color: themeColors.text.primary }}>
                      {price.minQuantity} unidades
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.secondary }}>
                    Fecha de Fin
                  </label>
                  {isEditing && editedPrice ? (
                    <input
                      type="date"
                      value={editedPrice.endDate}
                      onChange={(e) => handleFieldChange("endDate", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                      style={{
                        backgroundColor: themeColors.surface + "60",
                        borderColor: themeColors.primary + "30",
                        color: themeColors.text.primary,
                        "--tw-ring-color": `${themeColors.primary}50`,
                      } as React.CSSProperties}
                    />
                  ) : (
                    <p className="px-3 py-2 text-sm" style={{ color: themeColors.text.primary }}>
                      {formatDate(price.endDate)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.secondary }}>
                    Estado
                  </label>
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
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(price.status)}`}>
                      {price.status}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: themeColors.text.secondary }}>
                  <span>Incluye IVA</span>
                  {price.includeIVA ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                </label>
                {isEditing && editedPrice ? (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editedPrice.includeIVA}
                      onChange={(e) => handleFieldChange("includeIVA", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div
                      className="relative w-5 h-5 bg-white/50 dark:bg-slate-600/50 border-2 border-gray-300 dark:border-gray-500 rounded-md transition-all duration-200 peer-hover:border-purple-400"
                      style={{
                        borderColor: editedPrice.includeIVA ? themeColors.primary : undefined,
                        background: editedPrice.includeIVA
                          ? `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`
                          : undefined,
                      }}
                    >
                      <Check className="absolute inset-0 w-3 h-3 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" />
                    </div>
                    <span className="text-sm" style={{ color: themeColors.text.primary }}>
                      Incluir IVA en el precio
                    </span>
                  </label>
                ) : (
                  <p className="px-3 py-2 text-sm" style={{ color: themeColors.text.primary }}>
                    {price.includeIVA ? "Sí" : "No"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div
            className="p-6 backdrop-blur-xl rounded-2xl border shadow-lg"
            style={{
              backgroundColor: themeColors.surface + "70",
              borderColor: themeColors.primary + "30",
            }}
          >
            <h3
              className="text-lg font-semibold mb-4 flex items-center gap-2"
              style={{ color: themeColors.text.primary }}
            >
              <Building className="w-5 h-5" style={{ color: themeColors.primary }} />
              Información Adicional
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.secondary }}>
                  Categoría
                </label>
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
                  <p className="px-3 py-2 text-sm" style={{ color: themeColors.text.primary }}>
                    {price.category || "Sin categoría"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.secondary }}>
                  Proveedor
                </label>
                {isEditing && editedPrice ? (
                  <input
                    type="text"
                    value={editedPrice.supplier || ""}
                    onChange={(e) => handleFieldChange("supplier", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: themeColors.surface + "60",
                      borderColor: themeColors.primary + "30",
                      color: themeColors.text.primary,
                      "--tw-ring-color": `${themeColors.primary}50`,
                    } as React.CSSProperties}
                  />
                ) : (
                  <p className="px-3 py-2 text-sm" style={{ color: themeColors.text.primary }}>
                    {price.supplier || "Sin proveedor"}
                  </p>
                )}
              </div>

              {price.costPrice && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.secondary }}>
                    Precio de Costo
                  </label>
                  {isEditing && editedPrice ? (
                    <input
                      type="number"
                      value={editedPrice.costPrice || 0}
                      onChange={(e) => handleFieldChange("costPrice", Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                      style={{
                        backgroundColor: themeColors.surface + "60",
                        borderColor: themeColors.primary + "30",
                        color: themeColors.text.primary,
                        "--tw-ring-color": `${themeColors.primary}50`,
                      } as React.CSSProperties}
                    />
                  ) : (
                    <p className="px-3 py-2 text-sm" style={{ color: themeColors.text.primary }}>
                      {formatCurrency(price.costPrice, price.currency)}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.secondary }}>
                  Descripción
                </label>
                {isEditing && editedPrice ? (
                  <textarea
                    value={editedPrice.description || ""}
                    onChange={(e) => handleFieldChange("description", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none"
                    style={{
                      backgroundColor: themeColors.surface + "60",
                      borderColor: themeColors.primary + "30",
                      color: themeColors.text.primary,
                      "--tw-ring-color": `${themeColors.primary}50`,
                    } as React.CSSProperties}
                  />
                ) : (
                  <p className="px-3 py-2 text-sm" style={{ color: themeColors.text.primary }}>
                    {price.description || "Sin descripción"}
                  </p>
                )}
              </div>

              {/* Metadatos */}
              <div className="pt-4 border-t" style={{ borderColor: themeColors.primary + "20" }}>
                <div className="grid grid-cols-1 gap-3 text-xs" style={{ color: themeColors.text.secondary }}>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Creado: {formatDateTime(price.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    <span>Modificado: {formatDateTime(price.updatedAt)}</span>
                  </div>
                  {price.lastModifiedBy && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>Por: {price.lastModifiedBy}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Acciones de eliminar */}
        {!isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 backdrop-blur-xl rounded-2xl border border-red-200 dark:border-red-800/30 shadow-lg"
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.05)",
            }}
          >
            <h3 className="text-lg font-semibold mb-2 text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Zona de Peligro
            </h3>
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">
              Esta acción no se puede deshacer. El precio será eliminado permanentemente.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDeleteDialog(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar Precio
            </motion.button>
          </motion.div>
        )}

        {/* Modal de confirmación de eliminación */}
        {showDeleteDialog && (
          <div
            className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            onClick={() => setShowDeleteDialog(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="p-6 rounded-2xl max-w-md w-full mx-4 border shadow-2xl"
              style={{
                backgroundColor: themeColors.surface + "95",
                borderColor: themeColors.primary + "30",
              }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: "rgba(239, 68, 68, 0.2)" }}
                >
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3
                    className="text-lg font-semibold mb-1"
                    style={{ color: themeColors.text.primary }}
                  >
                    Confirmar Eliminación
                  </h3>
                  <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>

              <p className="text-sm mb-6" style={{ color: themeColors.text.primary }}>
                ¿Estás seguro que deseas eliminar este precio? Toda la información
                será eliminada permanentemente del sistema.
              </p>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteDialog(false)}
                  className="flex-1 px-4 py-2 rounded-xl font-medium transition-all duration-200"
                  style={{
                    backgroundColor: themeColors.surface + "50",
                    color: themeColors.text.primary,
                  }}
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowDeleteDialog(false);
                    handleDelete();
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-medium transition-all duration-200 hover:bg-red-700 shadow-lg"
                >
                  Eliminar
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
