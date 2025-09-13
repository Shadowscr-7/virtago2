"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useTheme } from "@/contexts/theme-context";
import { StyledSelect } from "@/components/ui/styled-select";

// Tipos para precios
interface PriceItem {
  id: string;
  productCode: string;
  productName: string;
  minQuantity: number;
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
}

// Datos de ejemplo
const mockPrice: PriceItem = {
  id: "P001",
  productCode: "2",
  productName: "iPhone 15 Pro Max 256GB",
  minQuantity: 2,
  price: 1450,
  currency: "UYU",
  endDate: "2025-12-31",
  includeIVA: false,
  status: "INACTIVO",
  createdAt: "2024-01-15",
  updatedAt: "2024-09-12",
  margin: 28.5,
  costPrice: 1037,
  category: "Electrónicos",
  supplier: "Tech Distribution",
  description: "iPhone 15 Pro Max con 256GB de almacenamiento, pantalla Super Retina XDR de 6.7 pulgadas",
  tags: ["iPhone", "Apple", "256GB", "Pro Max", "Premium"],
  lastModifiedBy: "admin@virtago.com"
};

export default function PriceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { themeColors } = useTheme();
  const [price, setPrice] = useState<PriceItem>(mockPrice);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editedPrice, setEditedPrice] = useState<PriceItem>(mockPrice);

  useEffect(() => {
    // Aquí cargarías los datos del precio desde la API
    // const priceId = params.id;
    // loadPrice(priceId);
  }, [params.id]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedPrice(price);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedPrice(price);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Aquí harías la llamada a la API para guardar
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay
      setPrice(editedPrice);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving price:", error);
    } finally {
      setIsLoading(false);
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
    // Aquí podrías mostrar un toast de confirmación
  };

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
                  disabled={isLoading}
                  className="px-4 py-2 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg disabled:opacity-50"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
                  }}
                >
                  <Save className="w-4 h-4" />
                  {isLoading ? "Guardando..." : "Guardar"}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.secondary }}>
                    Código del Producto
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedPrice.productCode}
                      onChange={(e) => setEditedPrice({...editedPrice, productCode: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                      style={{
                        backgroundColor: themeColors.surface + "60",
                        borderColor: themeColors.primary + "30",
                        color: themeColors.text.primary,
                        "--tw-ring-color": `${themeColors.primary}50`,
                      } as React.CSSProperties}
                    />
                  ) : (
                    <p className="px-3 py-2 text-sm font-mono" style={{ color: themeColors.text.primary }}>
                      {price.productCode}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.secondary }}>
                    Moneda
                  </label>
                  {isEditing ? (
                    <StyledSelect
                      value={editedPrice.currency}
                      onChange={(value: string) => setEditedPrice({...editedPrice, currency: value as 'USD' | 'UYU' | 'EUR' | 'BRL'})}
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
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.secondary }}>
                  Nombre del Producto
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedPrice.productName}
                    onChange={(e) => setEditedPrice({...editedPrice, productName: e.target.value})}
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
                    {price.productName}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.secondary }}>
                    Precio
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedPrice.price}
                      onChange={(e) => setEditedPrice({...editedPrice, price: Number(e.target.value)})}
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
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedPrice.minQuantity}
                      onChange={(e) => setEditedPrice({...editedPrice, minQuantity: Number(e.target.value)})}
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
                  {isEditing ? (
                    <input
                      type="date"
                      value={editedPrice.endDate}
                      onChange={(e) => setEditedPrice({...editedPrice, endDate: e.target.value})}
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
                  {isEditing ? (
                    <StyledSelect
                      value={editedPrice.status}
                      onChange={(value: string) => setEditedPrice({...editedPrice, status: value as 'ACTIVO' | 'INACTIVO' | 'VENCIDO' | 'PROGRAMADO'})}
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
                {isEditing ? (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editedPrice.includeIVA}
                      onChange={(e) => setEditedPrice({...editedPrice, includeIVA: e.target.checked})}
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
                {isEditing ? (
                  <StyledSelect
                    value={editedPrice.category || ""}
                    onChange={(value) => setEditedPrice({...editedPrice, category: value})}
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
                {isEditing ? (
                  <input
                    type="text"
                    value={editedPrice.supplier || ""}
                    onChange={(e) => setEditedPrice({...editedPrice, supplier: e.target.value})}
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
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedPrice.costPrice || 0}
                      onChange={(e) => setEditedPrice({...editedPrice, costPrice: Number(e.target.value)})}
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
                {isEditing ? (
                  <textarea
                    value={editedPrice.description || ""}
                    onChange={(e) => setEditedPrice({...editedPrice, description: e.target.value})}
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
              className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar Precio
            </motion.button>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
}
