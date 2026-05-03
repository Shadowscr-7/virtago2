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
  Check,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { StyledSelect } from "@/components/ui/styled-select";
import { useTheme } from "@/contexts/theme-context";
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
  const { themeColors } = useTheme();
  const [priceList, setPriceList] = useState<PriceListDetail | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [priceListId, setPriceListId] = useState<string | null>(null);
  const [isNewList, setIsNewList] = useState(false);

  useEffect(() => {
    params.then(async (resolvedParams) => {
      const id = resolvedParams.id;
      setPriceListId(id);

      if (id === "new" || id === "nuevo") {
        setIsNewList(true);
        setIsEditing(true);
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

      setIsLoading(true);
      try {
        const response = await http.get(`/listPrice/${id}`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = response.data as any;
        const data = result.priceList || result.data || result;

        if (!data || !data.price_list_id) {
          throw new Error("No se encontró la lista de precios");
        }

        setPriceList({
          id: data.price_list_id || id,
          nombre: data.name || "",
          moneda: data.currency?.toUpperCase() || "USD",
          fechaInicio: data.start_date ? data.start_date.split("T")[0] : "",
          fechaFin: data.end_date ? data.end_date.split("T")[0] : "",
          estado: data.status === "active" ? "ACTIVO" : data.status === "inactive" ? "INACTIVO" : data.status?.toUpperCase() || "ACTIVO",
          tipo: data.customer_type?.toUpperCase() || "GENERAL",
          descripcion: data.description || "",
          descuentoGeneral: 0,
          montoMinimo: data.minimum_quantity || 0,
          creadoPor: data.created_by || "Admin",
          fechaCreacion: data.createdAt || data.start_date || new Date().toISOString(),
          ultimaModificacion: data.updatedAt || new Date().toISOString(),
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
      } catch (error) {
        console.error("Error cargando lista de precios:", error);
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
      const payload = {
        price_list_id: isNewList ? `PL${Date.now()}` : priceList.id,
        name: priceList.nombre,
        description: priceList.descripcion,
        distributorCode: "DIST001",
        currency: priceList.moneda,
        country: "USA",
        region: "North America",
        customer_type: priceList.tipo.toLowerCase(),
        channel: "online",
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
        response = await http.post("/listPrice", payload);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { price_list_id, ...updatePayload } = payload;
        response = await http.put(`/listPrice/${priceListId}`, updatePayload);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = response.data as any;
      toast.success(isNewList ? "Lista de precios creada exitosamente" : "Lista de precios actualizada exitosamente");
      setIsEditing(false);
      setHasChanges(false);
      if (isNewList && result.priceList?.price_list_id) {
        router.push(`/admin/listas-precios/${result.priceList.price_list_id}`);
      }
    } catch (error) {
      console.error("Error guardando lista de precios:", error);
      const errorMessage = error && typeof error === "object" && "message" in error
        ? String(error.message)
        : "Error al guardar la lista de precios";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (field: keyof PriceListDetail, value: string | number | boolean) => {
    setPriceList((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
    setHasChanges(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusStyle = (estado: string) => {
    switch (estado) {
      case "ACTIVO": return "bg-green-50 text-green-700 border border-green-200";
      case "INACTIVO": return "bg-gray-100 text-gray-600 border border-gray-200";
      case "VENCIDO": return "bg-red-50 text-red-700 border border-red-200";
      case "PROGRAMADO": return "bg-blue-50 text-blue-700 border border-blue-200";
      default: return "bg-gray-100 text-gray-600 border border-gray-200";
    }
  };

  const inputClass = "w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-all text-gray-900";

  return (
    <AdminLayout>
      {isLoading || !priceList ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" style={{ color: themeColors.primary }} />
            <p className="text-gray-500">Cargando lista de precios...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
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
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {isEditing ? (
                        <input
                          type="text"
                          value={priceList.nombre}
                          onChange={(e) => handleFieldChange("nombre", e.target.value)}
                          className="bg-transparent border-b-2 border-red-700 focus:outline-none text-gray-900"
                        />
                      ) : (
                        priceList.nombre || "Nueva Lista de Precios"
                      )}
                    </h1>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(priceList.estado)}`}>
                      {priceList.estado}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">
                    {priceList.tipo} · {priceList.moneda}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {hasChanges && (
                  <span className="text-amber-600 text-sm font-medium">
                    Cambios sin guardar
                  </span>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 font-medium transition-all"
                >
                  <Download className="w-4 h-4" />
                  Exportar
                </motion.button>

                {isEditing ? (
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setIsEditing(false); setHasChanges(false); }}
                      disabled={isSaving}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                    >
                      Cancelar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <><Loader2 className="w-4 h-4 animate-spin" />Guardando...</>
                      ) : (
                        <><Save className="w-4 h-4" />Guardar</>
                      )}
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl font-medium transition-all"
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
            transition={{ delay: 0.1 }}
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Información de la Lista</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-500 mb-2">Descripción</label>
                {isEditing ? (
                  <textarea
                    value={priceList.descripcion}
                    onChange={(e) => handleFieldChange("descripcion", e.target.value)}
                    rows={3}
                    className={inputClass + " resize-none"}
                  />
                ) : (
                  <p className="text-gray-900">{priceList.descripcion || "-"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Tipo de Cliente</label>
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
                  <p className="text-gray-900">{priceList.tipo}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Moneda</label>
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
                  <p className="text-gray-900">{priceList.moneda}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Canal</label>
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
                  <p className="text-gray-900">{priceList.channel || "-"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Fecha de Inicio</label>
                {isEditing ? (
                  <input type="date" value={priceList.fechaInicio} onChange={(e) => handleFieldChange("fechaInicio", e.target.value)} className={inputClass} />
                ) : (
                  <p className="text-gray-900">{formatDate(priceList.fechaInicio)}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Fecha de Fin</label>
                {isEditing ? (
                  <input type="date" value={priceList.fechaFin} onChange={(e) => handleFieldChange("fechaFin", e.target.value)} className={inputClass} />
                ) : (
                  <p className="text-gray-900">{priceList.fechaFin ? formatDate(priceList.fechaFin) : "Sin fecha de fin"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">País</label>
                {isEditing ? (
                  <input type="text" value={priceList.country} onChange={(e) => handleFieldChange("country", e.target.value)} className={inputClass} />
                ) : (
                  <p className="text-gray-900">{priceList.country || "-"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Región</label>
                {isEditing ? (
                  <input type="text" value={priceList.region} onChange={(e) => handleFieldChange("region", e.target.value)} className={inputClass} />
                ) : (
                  <p className="text-gray-900">{priceList.region || "-"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Código Distribuidor</label>
                {isEditing ? (
                  <input type="text" value={priceList.distributorCode} onChange={(e) => handleFieldChange("distributorCode", e.target.value)} className={inputClass} />
                ) : (
                  <p className="text-gray-900">{priceList.distributorCode || "-"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Prioridad</label>
                {isEditing ? (
                  <input type="number" min="1" value={priceList.priority} onChange={(e) => handleFieldChange("priority", Number(e.target.value))} className={inputClass} />
                ) : (
                  <p className="text-gray-900">{priceList.priority}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Cantidad Mínima</label>
                {isEditing ? (
                  <input type="number" min="0" value={priceList.minimum_quantity} onChange={(e) => handleFieldChange("minimum_quantity", Number(e.target.value))} className={inputClass} />
                ) : (
                  <p className="text-gray-900">{priceList.minimum_quantity}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Cantidad Máxima</label>
                {isEditing ? (
                  <input type="number" min="0" value={priceList.maximum_quantity} onChange={(e) => handleFieldChange("maximum_quantity", Number(e.target.value))} className={inputClass} />
                ) : (
                  <p className="text-gray-900">{priceList.maximum_quantity}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Aplica a</label>
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
                  <p className="text-gray-900">{priceList.applies_to || "-"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Tipo de Descuento</label>
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
                  <p className="text-gray-900">{priceList.discount_type || "-"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Lista por Defecto</label>
                {isEditing ? (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={priceList.default}
                      onChange={(e) => handleFieldChange("default", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div
                      className="relative w-5 h-5 bg-white border-2 border-gray-300 rounded-md transition-all duration-200"
                      style={{
                        borderColor: priceList.default ? themeColors.primary : undefined,
                        backgroundColor: priceList.default ? themeColors.primary : undefined,
                      }}
                    >
                      <Check className="absolute inset-0 w-3 h-3 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" />
                    </div>
                    <span className="text-sm text-gray-700">{priceList.default ? "Sí" : "No"}</span>
                  </label>
                ) : (
                  <p className="text-gray-900">{priceList.default ? "Sí" : "No"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Creado Por</label>
                <p className="text-gray-900">{priceList.creadoPor}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Fecha de Creación</label>
                <p className="text-gray-900">{formatDate(priceList.fechaCreacion)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Última Actualización</label>
                <p className="text-gray-900">{formatDate(priceList.ultimaModificacion)}</p>
              </div>

              {priceList.tags && priceList.tags.length > 0 && (
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-500 mb-2">Etiquetas</label>
                  <div className="flex flex-wrap gap-2">
                    {priceList.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm border border-red-100">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {priceList.notes && (
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-500 mb-2">Notas</label>
                  {isEditing ? (
                    <textarea
                      value={priceList.notes}
                      onChange={(e) => handleFieldChange("notes", e.target.value)}
                      rows={2}
                      className={inputClass + " resize-none"}
                    />
                  ) : (
                    <p className="text-gray-900">{priceList.notes}</p>
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
