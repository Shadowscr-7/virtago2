"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Edit,
  Download,
  Loader2,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { StyledSelect } from "@/components/ui/styled-select";
import { toast } from "sonner";
import http from "@/api/http-client";

interface PriceListDetail {
  id: string;
  nombre: string;
  moneda: "USD" | "UYU" | "EUR" | "BRL" | string;
  fechaInicio: string;
  fechaFin: string;
  estado: "ACTIVO" | "INACTIVO" | "VENCIDO" | "PROGRAMADO" | string;
  tipo: "GENERAL" | "MAYORISTA" | "MINORISTA" | "PROMOCIONAL" | "ESPECIAL" | string;
  descripcion: string;
  descuentoGeneral: number;
  montoMinimo: number;
  creadoPor: string;
  fechaCreacion: string;
  ultimaModificacion: string;
  // Campos adicionales del backend
  distributorCode: string;
  country: string;
  region: string;
  channel: string;
  default: boolean;
  priority: number;
  tags: string[];
  notes: string;
  applies_to: string;
  discount_type: string;
  minimum_quantity: number;
  maximum_quantity: number;
}

export default function PriceListDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [priceList, setPriceList] = useState<PriceListDetail | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Iniciar como true
  const [isSaving, setIsSaving] = useState(false);
  const [priceListId, setPriceListId] = useState<string | null>(null);
  const [isNewList, setIsNewList] = useState(false);

  // Efecto para obtener el ID de la lista de precios
  useEffect(() => {
    params.then(async (resolvedParams) => {
      const id = resolvedParams.id;
      setPriceListId(id);

      // Si el ID es "new" o "nuevo", es una lista nueva
      if (id === "new" || id === "nuevo") {
        setIsNewList(true);
        setIsEditing(true);
        // Inicializar con valores vacíos para nueva lista
        setPriceList({
          id: "",
          nombre: "",
          moneda: "USD",
          fechaInicio: "",
          fechaFin: "",
          estado: "ACTIVO",
          tipo: "GENERAL",
          descripcion: "",
          descuentoGeneral: 0,
          montoMinimo: 0,
          creadoPor: "Admin",
          fechaCreacion: new Date().toISOString(),
          ultimaModificacion: new Date().toISOString(),
          distributorCode: "",
          country: "",
          region: "",
          channel: "",
          default: false,
          priority: 1,
          tags: [],
          notes: "",
          applies_to: "",
          discount_type: "",
          minimum_quantity: 0,
          maximum_quantity: 0,
        });
        setIsLoading(false);
        return;
      }

      // Cargar datos de lista existente
      setIsLoading(true);
      try {
        const response = await http.get(`/listPrice/${id}`);
        
        console.log("📦 Respuesta completa del API:", response.data); // Debug
        
        // La respuesta viene en response.data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = response.data as any;
        
        // El backend puede devolver directamente el objeto o dentro de una propiedad
        const data = result.priceList || result.data || result;
        
        console.log("✅ Datos extraídos:", data); // Debug
        
        if (!data || !data.price_list_id) {
          throw new Error("No se encontró la lista de precios");
        }
        
        // Mapear respuesta del backend a estructura del frontend
        setPriceList({
          id: data.price_list_id || id,
          nombre: data.name || "",
          moneda: data.currency?.toUpperCase() || "USD",
          fechaInicio: data.start_date ? data.start_date.split("T")[0] : "",
          fechaFin: data.end_date ? data.end_date.split("T")[0] : "",
          estado: data.status === "active" ? "ACTIVO" : data.status === "inactive" ? "INACTIVO" : data.status?.toUpperCase() || "ACTIVO",
          tipo: data.customer_type?.toUpperCase() || "GENERAL",
          descripcion: data.description || "",
          descuentoGeneral: 0, // No está en la API directamente
          montoMinimo: data.minimum_quantity || 0,
          creadoPor: data.created_by || "Admin",
          fechaCreacion: data.createdAt || data.start_date || new Date().toISOString(),
          ultimaModificacion: data.updatedAt || new Date().toISOString(),
          // Campos adicionales
          distributorCode: data.distributorCode || "",
          country: data.country || "",
          region: data.region || "",
          channel: data.channel || "",
          default: data.default || false,
          priority: data.priority || 1,
          tags: data.tags || [],
          notes: data.notes || "",
          applies_to: data.applies_to || "",
          discount_type: data.discount_type || "",
          minimum_quantity: data.minimum_quantity || 0,
          maximum_quantity: data.maximum_quantity || 0,
        });
        
        console.log("✅ Estado actualizado con nombre:", data.name); // Debug
      } catch (error) {
        console.error("❌ Error cargando lista de precios:", error);
        toast.error("Error al cargar la lista de precios");
      } finally {
        setIsLoading(false);
      }
    });
  }, [params]);

  const handleSave = async () => {
    if (!priceList) return;
    
    setIsSaving(true);
    
    try {
      // Mapear estructura del frontend a la del backend
      const payload = {
        price_list_id: isNewList ? `PL${Date.now()}` : priceList.id,
        name: priceList.nombre,
        description: priceList.descripcion,
        distributorCode: "DIST001", // Valor por defecto
        currency: priceList.moneda,
        country: "USA", // Valor por defecto
        region: "North America", // Valor por defecto
        customer_type: priceList.tipo.toLowerCase(),
        channel: "online", // Valor por defecto
        start_date: `${priceList.fechaInicio}T00:00:00Z`,
        end_date: `${priceList.fechaFin}T23:59:59Z`,
        status: priceList.estado.toLowerCase(),
        default: false,
        priority: 1,
        tags: [],
        custom_fields: {},
        notes: priceList.descripcion,
      };

      let response;
      
      if (isNewList) {
        // Crear nueva lista de precios
        response = await http.post("/listPrice", payload);
      } else {
        // Actualizar lista existente - remover price_list_id del payload
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { price_list_id, ...updatePayload } = payload;
        response = await http.put(`/listPrice/${priceListId}`, updatePayload);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = response.data as any;
      
      toast.success(
        isNewList
          ? "Lista de precios creada exitosamente"
          : "Lista de precios actualizada exitosamente"
      );
      
      setIsEditing(false);
      setHasChanges(false);
      
      // Si es una lista nueva, redirigir al detalle con el ID
      if (isNewList && result.priceList?.price_list_id) {
        router.push(`/admin/listas-precios/${result.priceList.price_list_id}`);
      }
    } catch (error) {
      console.error("Error guardando lista de precios:", error);
      const errorMessage = error && typeof error === 'object' && 'message' in error 
        ? String(error.message) 
        : "Error al guardar la lista de precios";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (
    field: keyof PriceListDetail,
    value: string | number | boolean,
  ) => {
    setPriceList((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
    setHasChanges(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <AdminLayout>
      {isLoading || !priceList ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">
              Cargando lista de precios...
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
        {/* Header con navegación */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-white/80 to-gray-50/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.back()}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isEditing ? (
                      <input
                        type="text"
                        value={priceList.nombre}
                        onChange={(e) =>
                          handleFieldChange("nombre", e.target.value)
                        }
                        className="bg-transparent border-b-2 border-purple-500 focus:outline-none"
                      />
                    ) : (
                      priceList.nombre
                    )}
                  </h1>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      priceList.estado === "ACTIVO"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                    }`}
                  >
                    {priceList.estado}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                  {priceList.tipo} • {priceList.moneda}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {hasChanges && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-amber-600 dark:text-amber-400 text-sm font-medium"
                >
                  Cambios sin guardar
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar
              </motion.button>

              {isEditing ? (
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setIsEditing(false);
                      setHasChanges(false);
                    }}
                    disabled={isSaving}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Información de la lista */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-white/80 to-gray-50/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-2xl p-6 shadow-xl"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Información de la Lista
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción
              </label>
              {isEditing ? (
                <textarea
                  value={priceList.descripcion}
                  onChange={(e) =>
                    handleFieldChange("descripcion", e.target.value)
                  }
                  rows={3}
                  className="w-full px-3 py-2 bg-white/60 dark:bg-slate-700/60 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">
                  {priceList.descripcion}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Cliente
              </label>
              {isEditing ? (
                <StyledSelect
                  value={priceList.tipo}
                  onChange={(value) => handleFieldChange("tipo", value)}
                  options={[
                    { value: "RETAIL", label: "Retail" },
                    { value: "WHOLESALE", label: "Mayorista" },
                    { value: "DISTRIBUTOR", label: "Distribuidor" },
                    { value: "CORPORATE", label: "Corporativo" },
                  ]}
                />
              ) : (
                <p className="text-gray-900 dark:text-white">
                  {priceList.tipo}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Moneda
              </label>
              {isEditing ? (
                <StyledSelect
                  value={priceList.moneda}
                  onChange={(value) => handleFieldChange("moneda", value)}
                  options={[
                    { value: "USD", label: "USD - Dólar" },
                    { value: "UYU", label: "UYU - Peso Uruguayo" },
                    { value: "EUR", label: "EUR - Euro" },
                    { value: "BRL", label: "BRL - Real" },
                  ]}
                />
              ) : (
                <p className="text-gray-900 dark:text-white">
                  {priceList.moneda}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Canal
              </label>
              {isEditing ? (
                <StyledSelect
                  value={priceList.channel}
                  onChange={(value) => handleFieldChange("channel", value)}
                  options={[
                    { value: "online", label: "Online" },
                    { value: "offline", label: "Offline" },
                    { value: "both", label: "Ambos" },
                  ]}
                />
              ) : (
                <p className="text-gray-900 dark:text-white">
                  {priceList.channel || "-"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha de Inicio
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={priceList.fechaInicio}
                  onChange={(e) =>
                    handleFieldChange("fechaInicio", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-white/60 dark:bg-slate-700/60 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">
                  {formatDate(priceList.fechaInicio)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha de Fin
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={priceList.fechaFin}
                  onChange={(e) =>
                    handleFieldChange("fechaFin", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-white/60 dark:bg-slate-700/60 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">
                  {priceList.fechaFin ? formatDate(priceList.fechaFin) : "Sin fecha de fin"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                País
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={priceList.country}
                  onChange={(e) =>
                    handleFieldChange("country", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-white/60 dark:bg-slate-700/60 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">
                  {priceList.country || "-"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Región
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={priceList.region}
                  onChange={(e) =>
                    handleFieldChange("region", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-white/60 dark:bg-slate-700/60 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">
                  {priceList.region || "-"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Código Distribuidor
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={priceList.distributorCode}
                  onChange={(e) =>
                    handleFieldChange("distributorCode", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-white/60 dark:bg-slate-700/60 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">
                  {priceList.distributorCode || "-"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prioridad
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="1"
                  value={priceList.priority}
                  onChange={(e) =>
                    handleFieldChange("priority", Number(e.target.value))
                  }
                  className="w-full px-3 py-2 bg-white/60 dark:bg-slate-700/60 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">
                  {priceList.priority}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cantidad Mínima
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="0"
                  value={priceList.minimum_quantity}
                  onChange={(e) =>
                    handleFieldChange("minimum_quantity", Number(e.target.value))
                  }
                  className="w-full px-3 py-2 bg-white/60 dark:bg-slate-700/60 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">
                  {priceList.minimum_quantity}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cantidad Máxima
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="0"
                  value={priceList.maximum_quantity}
                  onChange={(e) =>
                    handleFieldChange("maximum_quantity", Number(e.target.value))
                  }
                  className="w-full px-3 py-2 bg-white/60 dark:bg-slate-700/60 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">
                  {priceList.maximum_quantity}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Aplica a
              </label>
              {isEditing ? (
                <StyledSelect
                  value={priceList.applies_to}
                  onChange={(value) => handleFieldChange("applies_to", value)}
                  options={[
                    { value: "all", label: "Todos" },
                    { value: "specific", label: "Específicos" },
                  ]}
                />
              ) : (
                <p className="text-gray-900 dark:text-white">
                  {priceList.applies_to || "-"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Descuento
              </label>
              {isEditing ? (
                <StyledSelect
                  value={priceList.discount_type}
                  onChange={(value) => handleFieldChange("discount_type", value)}
                  options={[
                    { value: "percentage", label: "Porcentaje" },
                    { value: "fixed", label: "Fijo" },
                  ]}
                />
              ) : (
                <p className="text-gray-900 dark:text-white">
                  {priceList.discount_type || "-"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lista por Defecto
              </label>
              {isEditing ? (
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={priceList.default}
                    onChange={(e) =>
                      handleFieldChange("default", e.target.checked)
                    }
                    className="w-5 h-5 text-purple-600 bg-white border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {priceList.default ? "Sí" : "No"}
                  </span>
                </label>
              ) : (
                <p className="text-gray-900 dark:text-white">
                  {priceList.default ? "Sí" : "No"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Creado Por
              </label>
              <p className="text-gray-900 dark:text-white">
                {priceList.creadoPor}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha de Creación
              </label>
              <p className="text-gray-900 dark:text-white">
                {formatDate(priceList.fechaCreacion)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Última Actualización
              </label>
              <p className="text-gray-900 dark:text-white">
                {formatDate(priceList.ultimaModificacion)}
              </p>
            </div>

            {priceList.tags && priceList.tags.length > 0 && (
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Etiquetas
                </label>
                <div className="flex flex-wrap gap-2">
                  {priceList.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {priceList.notes && (
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notas
                </label>
                {isEditing ? (
                  <textarea
                    value={priceList.notes}
                    onChange={(e) =>
                      handleFieldChange("notes", e.target.value)
                    }
                    rows={2}
                    className="w-full px-3 py-2 bg-white/60 dark:bg-slate-700/60 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">
                    {priceList.notes}
                  </p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
      )}
    </AdminLayout>
  );
}
