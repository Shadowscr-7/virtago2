"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Save, Sparkles, FileJson, AlertCircle, ChevronRight, Check, X } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { AdminLayout } from "@/components/admin/admin-layout";
import http from "@/api/http-client";
import { toast } from "sonner";
import { DiscountTemplateSelector } from "@/components/admin/descuentos/discount-template-selector";
import { DiscountJSONPreview } from "@/components/admin/descuentos/discount-json-preview";
import { BuyXGetYConfigComponent } from "@/components/admin/descuentos/templates/buy-x-get-y-config";
import { TieredVolumeConfigComponent } from "@/components/admin/descuentos/templates/tiered-volume-config";
import { BOGOConfigComponent } from "@/components/admin/descuentos/templates/bogo-config";
import { FlashSaleConfigComponent } from "@/components/admin/descuentos/templates/flash-sale-config";
import { BundleConfigComponent } from "@/components/admin/descuentos/templates/bundle-config";
import { SpendThresholdConfigComponent } from "@/components/admin/descuentos/templates/spend-threshold-config";
import {
  DiscountTemplateType,
  DiscountJSON,
  BuyXGetYConfig,
  TieredVolumeConfig,
  BOGOConfig,
  FlashSaleConfig,
  BundleConfig,
  SpendThresholdConfig,
  DISCOUNT_TEMPLATES,
} from "@/types/discount-templates";

type Step = "select-template" | "configure" | "review";

export default function NewDiscountPageTemplates() {
  const { themeColors } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>("select-template");
  const [selectedTemplate, setSelectedTemplate] = useState<DiscountTemplateType | null>(null);
  const [showJSON, setShowJSON] = useState(false);

  // Configuraciones base
  const [basicInfo, setBasicInfo] = useState<{
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    currency: "UYU" | "USD" | "EUR" | "BRL";
    is_active: boolean;
  }>({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    currency: "UYU",
    is_active: true,
  });

  // Configuraciones específicas de cada template
  const [buyXGetYConfig, setBuyXGetYConfig] = useState<BuyXGetYConfig>({
    buy_quantity: 3,
    pay_quantity: 2,
    free_quantity: 1,
  });

  const [tieredVolumeConfig, setTieredVolumeConfig] = useState<TieredVolumeConfig>({
    tiers: [],
  });

  const [bogoConfig, setBogoConfig] = useState<BOGOConfig>({
    bogo_type: "free",
    buy_quantity: 1,
    get_quantity: 1,
    get_discount: 100,
  });

  const [flashSaleConfig, setFlashSaleConfig] = useState<FlashSaleConfig>({
    duration_hours: 24,
    urgency_level: "high",
    usage_limit: 100,
    discount_type: "percentage",
    discount_value: 40,
    applicable_to_all: true,
  });

  const [bundleConfig, setBundleConfig] = useState<BundleConfig>({
    required_products: [],
    all_required: true,
    discount_type: "percentage",
    discount_value: 15,
  });

  const [spendThresholdConfig, setSpendThresholdConfig] = useState<SpendThresholdConfig>({
    progressive: false,
    threshold: 100,
    reward: 20,
    discount_type: "fixed",
  });

  // Generar JSON según el template seleccionado
  const generateJSON = (): DiscountJSON => {
    const base: DiscountJSON = {
      name: basicInfo.name || "Nuevo Descuento",
      description: basicInfo.description,
      discount_type: "percentage",
      discount_value: 0,
      currency: basicInfo.currency,
      start_date: basicInfo.start_date,
      end_date: basicInfo.end_date,
      is_active: basicInfo.is_active,
      status: basicInfo.is_active ? "active" : "inactive",
    };

    if (!selectedTemplate) return base;

    switch (selectedTemplate) {
      case "buy_x_get_y":
        return {
          ...base,
          discount_type: "percentage",
          discount_value: Number(((buyXGetYConfig.free_quantity / buyXGetYConfig.buy_quantity) * 100).toFixed(2)),
          conditions: {
            min_items: buyXGetYConfig.min_items,
            min_quantity_per_product: buyXGetYConfig.min_quantity_per_product,
          },
          applicable_to: buyXGetYConfig.applicable_categories?.map(cat => ({ type: "category" as const, value: cat })),
          customFields: {
            promotion_type: "buy_x_get_y",
            buy_quantity: buyXGetYConfig.buy_quantity,
            pay_quantity: buyXGetYConfig.pay_quantity,
            free_quantity: buyXGetYConfig.free_quantity,
          },
        };

      case "tiered_volume":
        return {
          ...base,
          discount_type: "percentage",
          discount_value: tieredVolumeConfig.tiers[0]?.discount || 0,
          applicable_to: tieredVolumeConfig.applicable_categories?.map(cat => ({ type: "category" as const, value: cat })),
          customFields: {
            promotion_type: "tiered_volume",
            tiers: tieredVolumeConfig.tiers,
          },
        };

      case "bogo":
        return {
          ...base,
          discount_type: bogoConfig.bogo_type === "free" ? "percentage" : (bogoConfig.bogo_type as "percentage" | "fixed"),
          discount_value: bogoConfig.get_discount,
          conditions: {
            min_quantity_per_product: bogoConfig.min_quantity_per_product,
          },
          applicable_to: [
            ...(bogoConfig.applicable_categories?.map(cat => ({ type: "category" as const, value: cat })) || []),
            ...(bogoConfig.applicable_products?.map(prod => ({ type: "product" as const, value: prod })) || []),
            ...(bogoConfig.applicable_brands?.map(brand => ({ type: "brand" as const, value: brand })) || []),
          ],
          customFields: {
            promotion_type: "bogo",
            bogo_type: bogoConfig.bogo_type,
            buy_quantity: bogoConfig.buy_quantity,
            get_quantity: bogoConfig.get_quantity,
            get_discount: bogoConfig.get_discount,
          },
        };

      case "flash_sale":
        return {
          ...base,
          discount_type: flashSaleConfig.discount_type,
          discount_value: flashSaleConfig.discount_value,
          usage_limit: flashSaleConfig.usage_limit,
          applicable_to: flashSaleConfig.applicable_to_all
            ? [{ type: "all_products" as const, value: "*" }]
            : flashSaleConfig.applicable_categories?.map(cat => ({ type: "category" as const, value: cat })),
          customFields: {
            promotion_type: "flash_sale",
            duration_hours: flashSaleConfig.duration_hours,
            urgency_level: flashSaleConfig.urgency_level,
          },
        };

      case "bundle":
        return {
          ...base,
          discount_type: bundleConfig.discount_type,
          discount_value: bundleConfig.discount_value,
          conditions: {
            min_items: bundleConfig.min_items,
          },
          customFields: {
            promotion_type: "bundle",
            required_products: bundleConfig.required_products,
            all_required: bundleConfig.all_required,
          },
        };

      case "spend_threshold":
        return {
          ...base,
          discount_type: spendThresholdConfig.progressive ? "fixed" : (spendThresholdConfig.discount_type || "fixed"),
          discount_value: spendThresholdConfig.progressive
            ? (spendThresholdConfig.tiers?.[0]?.discount || 0)
            : (spendThresholdConfig.reward || 0),
          min_purchase_amount: spendThresholdConfig.progressive
            ? spendThresholdConfig.tiers?.[0]?.min_spend
            : spendThresholdConfig.threshold,
          customFields: {
            promotion_type: "spend_threshold",
            progressive: spendThresholdConfig.progressive,
            ...(spendThresholdConfig.progressive
              ? { tiers: spendThresholdConfig.tiers }
              : { threshold: spendThresholdConfig.threshold, reward: spendThresholdConfig.reward }),
          },
        };

      default:
        return base;
    }
  };

  const handleTemplateSelect = (template: DiscountTemplateType) => {
    setSelectedTemplate(template);
    setCurrentStep("configure");
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const jsonData = generateJSON();
      console.log('📝 JSON generado por template:', JSON.stringify(jsonData, null, 2));

      // El JSON ya viene en el formato correcto del backend
      const response = await http.post('/discount', jsonData);

      console.log('✅ Respuesta de la API:', response);

      toast.success('Descuento creado exitosamente desde template');
      router.push("/admin/descuentos");
    } catch (error) {
      console.error('❌ Error al guardar:', error);
      toast.error('Error al crear el descuento');
    } finally {
      setLoading(false);
    }
  };

  const renderConfigComponent = () => {
    if (!selectedTemplate) return null;

    switch (selectedTemplate) {
      case "buy_x_get_y":
        return <BuyXGetYConfigComponent config={buyXGetYConfig} onChange={setBuyXGetYConfig} />;
      case "tiered_volume":
        return <TieredVolumeConfigComponent config={tieredVolumeConfig} onChange={setTieredVolumeConfig} />;
      case "bogo":
        return <BOGOConfigComponent config={bogoConfig} onChange={setBogoConfig} />;
      case "flash_sale":
        return <FlashSaleConfigComponent config={flashSaleConfig} onChange={setFlashSaleConfig} />;
      case "bundle":
        return <BundleConfigComponent config={bundleConfig} onChange={setBundleConfig} />;
      case "spend_threshold":
        return <SpendThresholdConfigComponent config={spendThresholdConfig} onChange={setSpendThresholdConfig} />;
      default:
        return (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: themeColors.text.secondary }} />
            <p style={{ color: themeColors.text.secondary }}>
              Configuración no disponible para este template. Estamos trabajando en ello.
            </p>
          </div>
        );
    }
  };

  const selectedTemplateData = DISCOUNT_TEMPLATES.find((t) => t.id === selectedTemplate);

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => currentStep === "select-template" ? router.push("/admin/descuentos") : setCurrentStep("select-template")} className="p-2 rounded-xl transition-colors" style={{ backgroundColor: themeColors.surface + "60", color: themeColors.text.primary }}>
              <ArrowLeft className="w-5 h-5" />
            </motion.button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})` }}>
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: themeColors.text.primary }}>
                  {currentStep === "select-template" && "Selecciona un Template"}
                  {currentStep === "configure" && "Configura tu Descuento"}
                  {currentStep === "review" && "Revisa y Guarda"}
                </h1>
                <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                  {currentStep === "select-template" && "Elige el tipo de promoción que necesitas"}
                  {currentStep === "configure" && selectedTemplateData?.name}
                  {currentStep === "review" && "Verifica que todo esté correcto"}
                </p>
              </div>
            </div>
          </div>

          {currentStep !== "select-template" && (
            <div className="flex items-center gap-3">
              {currentStep === "configure" && (
                <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setCurrentStep("review")} className="px-6 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg" style={{ backgroundColor: themeColors.secondary + "20", color: themeColors.secondary }}>
                  Siguiente: Revisar
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              )}

              {currentStep === "review" && (
                <motion.button type="button" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} className="px-6 py-2 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg disabled:opacity-50" style={{ backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})` }}>
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {loading ? "Guardando..." : "Guardar Descuento"}
                </motion.button>
              )}
            </div>
          )}
        </motion.div>

        {/* Steps Progress */}
        {currentStep !== "select-template" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
            {[
              { id: "select-template", label: "Template" },
              { id: "configure", label: "Configurar" },
              { id: "review", label: "Revisar" },
            ].map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${currentStep === step.id ? "shadow-lg" : ""}`} style={{ backgroundColor: currentStep === step.id ? `${themeColors.primary}20` : themeColors.surface + "50", color: currentStep === step.id ? themeColors.primary : themeColors.text.secondary }}>
                  {index + 1}. {step.label}
                </div>
                {index < 2 && <ChevronRight className="w-4 h-4 mx-2" style={{ color: themeColors.text.secondary }} />}
              </div>
            ))}
          </motion.div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          {currentStep === "select-template" && (
            <motion.div key="select" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <DiscountTemplateSelector selectedTemplate={selectedTemplate} onSelectTemplate={handleTemplateSelect} />
            </motion.div>
          )}

          {currentStep === "configure" && (
            <motion.div key="configure" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
              {/* Basic Info */}
              <div className="backdrop-blur-xl rounded-2xl border p-6 space-y-4" style={{ backgroundColor: themeColors.surface + "70", borderColor: themeColors.primary + "30" }}>
                <h3 className="text-lg font-bold" style={{ color: themeColors.text.primary }}>
                  Información Básica
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>
                      Nombre del Descuento *
                    </label>
                    <input type="text" value={basicInfo.name} onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })} placeholder="Ej: Promoción Black Friday" className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2" style={{ backgroundColor: themeColors.surface + "50", borderColor: themeColors.primary + "30", color: themeColors.text.primary }} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>
                      Moneda
                    </label>
                    <select value={basicInfo.currency} onChange={(e) => setBasicInfo({ ...basicInfo, currency: e.target.value as "UYU" | "USD" | "EUR" | "BRL" })} className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2" style={{ backgroundColor: themeColors.surface + "50", borderColor: themeColors.primary + "30", color: themeColors.text.primary }}>
                      <option value="UYU">UYU - Peso Uruguayo</option>
                      <option value="USD">USD - Dólar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="BRL">BRL - Real</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>
                      Fecha de Inicio
                    </label>
                    <input type="date" value={basicInfo.start_date} onChange={(e) => setBasicInfo({ ...basicInfo, start_date: e.target.value })} className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2" style={{ backgroundColor: themeColors.surface + "50", borderColor: themeColors.primary + "30", color: themeColors.text.primary }} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>
                      Fecha de Fin
                    </label>
                    <input type="date" value={basicInfo.end_date} onChange={(e) => setBasicInfo({ ...basicInfo, end_date: e.target.value })} className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2" style={{ backgroundColor: themeColors.surface + "50", borderColor: themeColors.primary + "30", color: themeColors.text.primary }} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>
                    Descripción
                  </label>
                  <textarea value={basicInfo.description} onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })} rows={3} placeholder="Describe el descuento..." className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 resize-none" style={{ backgroundColor: themeColors.surface + "50", borderColor: themeColors.primary + "30", color: themeColors.text.primary }} />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: themeColors.surface + "50" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: basicInfo.is_active ? "#10b981" + "20" : "#ef4444" + "20" }}>
                      {basicInfo.is_active ? <Check className="w-5 h-5" style={{ color: "#10b981" }} /> : <X className="w-5 h-5" style={{ color: "#ef4444" }} />}
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: themeColors.text.primary }}>
                        Estado del Descuento
                      </p>
                      <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                        {basicInfo.is_active ? "El descuento estará activo inmediatamente" : "El descuento se creará como inactivo"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBasicInfo({ ...basicInfo, is_active: !basicInfo.is_active })}
                    className="relative w-14 h-7 rounded-full transition-all duration-300"
                    style={{ backgroundColor: basicInfo.is_active ? "#10b981" : "#ef4444" + "40" }}
                  >
                    <motion.div
                      className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md"
                      animate={{ left: basicInfo.is_active ? "calc(100% - 26px)" : "2px" }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
              </div>

              {/* Template-Specific Config */}
              <div className="backdrop-blur-xl rounded-2xl border p-6" style={{ backgroundColor: themeColors.surface + "70", borderColor: themeColors.primary + "30" }}>
                {renderConfigComponent()}
              </div>
            </motion.div>
          )}

          {currentStep === "review" && (
            <motion.div key="review" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
              {/* Resumen Visual */}
              <div className="backdrop-blur-xl rounded-2xl border p-6 space-y-6" style={{ backgroundColor: themeColors.surface + "70", borderColor: themeColors.primary + "30" }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})` }}>
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold" style={{ color: themeColors.text.primary }}>
                        Resumen del Descuento
                      </h3>
                      <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                        {selectedTemplateData?.name}
                      </p>
                    </div>
                  </div>

                  {/* Toggle JSON/Visual */}
                  <div className="flex items-center gap-2 p-1 rounded-lg" style={{ backgroundColor: themeColors.surface + "50" }}>
                    <button
                      type="button"
                      onClick={() => setShowJSON(false)}
                      className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
                      style={{
                        backgroundColor: !showJSON ? themeColors.primary : "transparent",
                        color: !showJSON ? "#fff" : themeColors.text.secondary,
                      }}
                    >
                      Visual
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowJSON(true)}
                      className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2"
                      style={{
                        backgroundColor: showJSON ? themeColors.primary : "transparent",
                        color: showJSON ? "#fff" : themeColors.text.secondary,
                      }}
                    >
                      <FileJson className="w-4 h-4" />
                      JSON
                    </button>
                  </div>
                </div>

                {!showJSON ? (
                  /* Vista Visual */
                  <motion.div
                    key="visual"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Información Básica */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl" style={{ backgroundColor: themeColors.surface + "50" }}>
                        <p className="text-xs font-medium mb-1" style={{ color: themeColors.text.secondary }}>
                          Nombre
                        </p>
                        <p className="font-semibold" style={{ color: themeColors.text.primary }}>
                          {basicInfo.name || "Sin nombre"}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl" style={{ backgroundColor: themeColors.surface + "50" }}>
                        <p className="text-xs font-medium mb-1" style={{ color: themeColors.text.secondary }}>
                          Estado
                        </p>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${basicInfo.is_active ? "bg-green-500" : "bg-red-500"}`} />
                          <p className="font-semibold" style={{ color: themeColors.text.primary }}>
                            {basicInfo.is_active ? "Activo" : "Inactivo"}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl" style={{ backgroundColor: themeColors.surface + "50" }}>
                        <p className="text-xs font-medium mb-1" style={{ color: themeColors.text.secondary }}>
                          Tipo de Descuento
                        </p>
                        <p className="font-semibold" style={{ color: themeColors.text.primary }}>
                          {generateJSON().discount_type === "percentage" ? "Porcentaje" : generateJSON().discount_type === "fixed" ? "Monto Fijo" : "BOGO"}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl" style={{ backgroundColor: themeColors.surface + "50" }}>
                        <p className="text-xs font-medium mb-1" style={{ color: themeColors.text.secondary }}>
                          Valor
                        </p>
                        <p className="font-semibold text-2xl" style={{ color: themeColors.primary }}>
                          {generateJSON().discount_type === "percentage" ? `${generateJSON().discount_value}%` : `${basicInfo.currency} ${generateJSON().discount_value}`}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl" style={{ backgroundColor: themeColors.surface + "50" }}>
                        <p className="text-xs font-medium mb-1" style={{ color: themeColors.text.secondary }}>
                          Fecha de Inicio
                        </p>
                        <p className="font-semibold" style={{ color: themeColors.text.primary }}>
                          {basicInfo.start_date || "No especificada"}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl" style={{ backgroundColor: themeColors.surface + "50" }}>
                        <p className="text-xs font-medium mb-1" style={{ color: themeColors.text.secondary }}>
                          Fecha de Fin
                        </p>
                        <p className="font-semibold" style={{ color: themeColors.text.primary }}>
                          {basicInfo.end_date || "No especificada"}
                        </p>
                      </div>
                    </div>

                    {basicInfo.description && (
                      <div className="p-4 rounded-xl" style={{ backgroundColor: themeColors.surface + "50" }}>
                        <p className="text-xs font-medium mb-2" style={{ color: themeColors.text.secondary }}>
                          Descripción
                        </p>
                        <p className="text-sm" style={{ color: themeColors.text.primary }}>
                          {basicInfo.description}
                        </p>
                      </div>
                    )}

                    {/* Condiciones Especiales */}
                    {generateJSON().conditions && Object.keys(generateJSON().conditions || {}).length > 0 && (
                      <div className="p-4 rounded-xl" style={{ backgroundColor: themeColors.accent + "10", borderColor: themeColors.accent + "30" }}>
                        <p className="text-xs font-medium mb-3" style={{ color: themeColors.accent }}>
                          Condiciones
                        </p>
                        <div className="space-y-2">
                          {Object.entries(generateJSON().conditions || {}).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-sm">
                              <span style={{ color: themeColors.text.secondary }}>{key.replace(/_/g, " ")}:</span>
                              <span className="font-medium" style={{ color: themeColors.text.primary }}>{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Custom Fields */}
                    {generateJSON().customFields && (
                      <div className="p-4 rounded-xl" style={{ backgroundColor: themeColors.secondary + "10" }}>
                        <p className="text-xs font-medium mb-3" style={{ color: themeColors.secondary }}>
                          Configuración Especial
                        </p>
                        <div className="space-y-2">
                          {Object.entries(generateJSON().customFields || {})
                            .filter(([key]) => key !== "promotion_type")
                            .map(([key, value]) => (
                              <div key={key} className="flex justify-between text-sm">
                                <span style={{ color: themeColors.text.secondary }}>{key.replace(/_/g, " ")}:</span>
                                <span className="font-medium" style={{ color: themeColors.text.primary }}>
                                  {typeof value === "object" ? JSON.stringify(value) : String(value)}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  /* Vista JSON */
                  <motion.div
                    key="json"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <DiscountJSONPreview discountData={generateJSON()} />
                  </motion.div>
                )}

                <div className="mt-6 p-4 rounded-xl border flex items-start gap-3" style={{ backgroundColor: `${themeColors.accent}10`, borderColor: `${themeColors.accent}30` }}>
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: themeColors.accent }} />
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: themeColors.text.primary }}>
                      Verifica antes de guardar
                    </p>
                    <p className="text-xs" style={{ color: themeColors.text.secondary }}>
                      Asegúrate de que todos los datos sean correctos. Este descuento será enviado a la API para su creación.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
