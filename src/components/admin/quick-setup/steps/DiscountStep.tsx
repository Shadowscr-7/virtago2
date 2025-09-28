import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileUploadComponent } from '../shared/FileUploadComponent';
import { StepProps, DiscountData, UploadMethod, UploadResult } from '../shared/types';
import { CheckCircle, Loader2 } from 'lucide-react';
import { api, DiscountBulkData, DiscountBulkCreateResponse } from '@/api';

// Datos de ejemplo para descuentos
const sampleDiscounts: DiscountData[] = [
  {
    discountId: "DISC_BLACK_FRIDAY_001",
    name: "Descuento Black Friday Premium",
    description: "Descuento especial para Black Friday con hasta 50% de descuento en productos seleccionados",
    type: "percentage",
    discountValue: 50,
    currency: "COP",
    validFrom: "2024-11-29T00:00:00Z",
    validTo: "2024-12-02T23:59:59Z",
    status: "active",
    customerType: "all",
    channel: "online",
    category: "electronics",
    maxDiscountAmount: 500000,
    minPurchaseAmount: 100000,
    usageLimit: 1000,
    usageLimitPerCustomer: 1
  },
  {
    discountId: "DISC_WHOLESALE_002",
    name: "Descuento Mayorista Volumen",
    description: "Descuento por volumen para clientes mayoristas según cantidad comprada",
    type: "tiered_percentage",
    discountValue: 15,
    currency: "COP",
    validFrom: "2024-01-01T00:00:00Z",
    validTo: "2024-12-31T23:59:59Z",
    status: "active",
    customerType: "wholesale",
    channel: "b2b",
    category: "all",
    minPurchaseAmount: 1000000
  },
  {
    discountId: "DISC_LOYALTY_003",
    name: "Descuento Programa Lealtad VIP",
    description: "Descuentos exclusivos para miembros VIP del programa de lealtad",
    type: "fixed_amount",
    discountValue: 50000,
    currency: "COP",
    validFrom: "2024-01-01T00:00:00Z",
    status: "active",
    customerType: "vip",
    channel: "all",
    category: "premium",
    usageLimitPerCustomer: 5
  },
  {
    discountId: "DISC_SEASONAL_004",
    name: "Descuento Temporada Navideña",
    description: "Promoción especial para la temporada navideña con descuentos progresivos",
    type: "progressive_percentage",
    discountValue: 25,
    currency: "COP",
    validFrom: "2024-12-01T00:00:00Z",
    validTo: "2024-12-25T23:59:59Z",
    status: "draft",
    customerType: "retail",
    channel: "omnichannel",
    category: "gifts"
  },
  {
    discountId: "DISC_CLEARANCE_005",
    name: "Descuento Liquidación Inventario",
    description: "Liquidación de inventario con descuentos agresivos para productos de temporadas pasadas",
    type: "percentage",
    discountValue: 70,
    currency: "COP",
    validFrom: "2024-01-15T00:00:00Z",
    validTo: "2024-02-15T23:59:59Z",
    status: "active",
    customerType: "all",
    channel: "all",
    category: "clearance",
    maxDiscountAmount: 1000000,
    usageLimit: 5000
  }
];

interface DiscountStepProps extends StepProps {
  stepData?: {
    uploadedDiscounts?: DiscountData[];
  };
}

export function DiscountStep({ onNext, onBack, themeColors, stepData }: DiscountStepProps) {
  const [method, setMethod] = useState<UploadMethod>("file");
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedData, setUploadedData] = useState<DiscountData[]>(stepData?.uploadedDiscounts || []);
  const [apiResponse, setApiResponse] = useState<DiscountBulkCreateResponse | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);


  // Función para convertir datos del wizard al formato de API
  const convertToApiFormat = (discounts: DiscountData[]): DiscountBulkData[] => {
    return discounts.map((discount: DiscountData) => ({
      discount_id: discount.discountId,
      name: discount.name,
      description: discount.description,
      type: discount.type,
      discount_value: discount.discountValue,
      currency: discount.currency,
      valid_from: discount.validFrom,
      valid_to: discount.validTo,
      status: discount.status || 'active',
      priority: 1,
      is_cumulative: false,
      max_discount_amount: discount.maxDiscountAmount,
      min_purchase_amount: discount.minPurchaseAmount,
      usage_limit: discount.usageLimit,
      usage_limit_per_customer: discount.usageLimitPerCustomer,
      customer_type: discount.customerType,
      channel: discount.channel,
      region: 'colombia',
      category: discount.category,
      tags: [discount.type, discount.category, discount.customerType],
      notes: `Descuento ${discount.name} - ${discount.description}`,
      created_by: 'admin@virtago.shop'
    }));
  };

  // Función para normalizar datos de API a formato wizard
  const normalizeDiscountData = (apiData: Record<string, unknown>): DiscountData => {
    // Extraer el valor del descuento, considerando estructuras anidadas
    let discountValue = 0;
    if (apiData.discount_value !== undefined) {
      discountValue = Number(apiData.discount_value);
    } else if (apiData.discountValue !== undefined) {
      discountValue = Number(apiData.discountValue);
    } else if (apiData.type === 'tiered_percentage' && apiData.conditions && typeof apiData.conditions === 'object') {
      // Para descuentos escalonados, tomar el máximo descuento
      const conditions = apiData.conditions as Record<string, unknown>;
      if (Array.isArray(conditions.tier_structure)) {
        const maxDiscount = Math.max(...conditions.tier_structure.map((tier: Record<string, unknown>) => Number(tier.discount_percentage) || 0));
        discountValue = maxDiscount;
      }
    } else if (apiData.type === 'progressive_percentage' && apiData.conditions && typeof apiData.conditions === 'object') {
      // Para descuentos progresivos, tomar el máximo descuento
      const conditions = apiData.conditions as Record<string, unknown>;
      if (Array.isArray(conditions.progressive_structure)) {
        const maxDiscount = Math.max(...conditions.progressive_structure.map((prog: Record<string, unknown>) => Number(prog.discount_percentage) || 0));
        discountValue = maxDiscount;
      }
    }

    // Validar campos requeridos
    const discountId = apiData.discount_id || apiData.discountId;
    const name = apiData.name;
    const type = apiData.type;
    const currency = apiData.currency;
    
    if (!discountId || !name || !type || !currency) {
      console.warn('Descuento con datos incompletos:', { discountId, name, type, currency });
    }

    return {
      discountId: String(discountId || ''),
      name: String(name || ''),
      description: String(apiData.description || ''),
      type: String(type || 'percentage') as 'percentage' | 'fixed_amount' | 'tiered_percentage' | 'progressive_percentage',
      discountValue: discountValue,
      currency: String(currency || 'COP'),
      validFrom: String(apiData.valid_from || apiData.validFrom || ''),
      validTo: String(apiData.valid_to || apiData.validTo || ''),
      status: String(apiData.status || 'active') as 'active' | 'inactive' | 'draft',
      customerType: String(apiData.customer_type || apiData.customerType || 'all') as 'all' | 'retail' | 'wholesale' | 'vip',
      channel: String(apiData.channel || 'online') as 'online' | 'offline' | 'omnichannel' | 'b2b' | 'all',
      category: String(apiData.category || 'general'),
      maxDiscountAmount: apiData.max_discount_amount ? Number(apiData.max_discount_amount) : 
                        apiData.maxDiscountAmount ? Number(apiData.maxDiscountAmount) : undefined,
      minPurchaseAmount: apiData.min_purchase_amount ? Number(apiData.min_purchase_amount) : 
                        apiData.minPurchaseAmount ? Number(apiData.minPurchaseAmount) : undefined,
      usageLimit: apiData.usage_limit ? Number(apiData.usage_limit) : 
                 apiData.usageLimit ? Number(apiData.usageLimit) : undefined,
      usageLimitPerCustomer: apiData.usage_limit_per_customer ? Number(apiData.usage_limit_per_customer) : 
                            apiData.usageLimitPerCustomer ? Number(apiData.usageLimitPerCustomer) : undefined
    };
  };

  const handleUpload = async (result: UploadResult<Record<string, unknown>>) => {
    if (!result.success) {
      console.error('Error uploading discounts:', result.error);
      
      // Mostrar mensaje de error más claro al usuario
      const errorMessage = result.error || 'Error desconocido';
      
      // Crear un mensaje más amigable basado en el tipo de error
      let userMessage = '❌ Error procesando el JSON:\n\n';
      
      if (errorMessage.includes('Unexpected token') || errorMessage.includes('Caracter inesperado')) {
        userMessage += `${errorMessage}\n\n💡 Tu JSON parece tener un problema de formato. Verifica:\n• Que todas las llaves { } estén balanceadas\n• Que no haya comas extras al final\n• Que todas las comillas estén cerradas correctamente`;
      } else if (errorMessage.includes('array de objetos')) {
        userMessage += `${errorMessage}\n\n💡 Asegúrate que tu JSON:\n• Empiece con [ y termine con ]\n• Contenga una lista de objetos de descuentos`;
      } else if (errorMessage.includes('vacío')) {
        userMessage += `${errorMessage}\n\n💡 El JSON debe contener al menos un descuento válido.`;
      } else {
        userMessage += `${errorMessage}\n\n💡 Verifica que el JSON esté correctamente formateado.`;
      }
      
      alert(userMessage);
      return;
    }

    try {
      // Normalizar los datos independientemente del formato
      const normalizedData = result.data.map(normalizeDiscountData);
      
      // Validar que los datos normalizados son válidos
      const validDiscounts = normalizedData.filter(discount => 
        discount.discountId && 
        discount.name && 
        discount.type && 
        discount.currency
      );
      
      if (validDiscounts.length === 0) {
        alert('❌ No se encontraron descuentos válidos en el JSON.\n\n💡 Verifica que cada descuento tenga al menos: discount_id, name, type, y currency.');
        return;
      }
      
      if (validDiscounts.length < normalizedData.length) {
        alert(`⚠️ Se procesaron ${validDiscounts.length} de ${normalizedData.length} descuentos.\n\nAlgunos descuentos tenían datos incompletos y fueron omitidos.`);
      }
      
      // Cargar los datos y procesar inmediatamente (como en otros pasos del wizard)
      setUploadedData(validDiscounts);
      
      // Procesar inmediatamente cuando se suben los datos
      await processDiscounts(validDiscounts);
      
    } catch (error) {
      console.error('Error normalizing discount data:', error);
      alert('❌ Error procesando los datos de descuentos.\n\n💡 Verifica que el formato del JSON sea correcto.');
    }
  };

  const processDiscounts = async (discountsToProcess?: DiscountData[]) => {
    const dataToProcess = discountsToProcess || uploadedData;
    
    if (dataToProcess.length === 0) {
      alert('❌ No hay descuentos para procesar. Sube primero un archivo JSON válido.');
      return;
    }

    setIsProcessing(true);
    try {
      // Convertir datos al formato de API
      const apiData = convertToApiFormat(dataToProcess);
      
      console.log('Sending discount data to API:', apiData);
      
      // Llamar a la API real
      const response = await api.admin.discounts.bulkCreate(apiData);
      
      console.log('API Response:', response);
      
      if (response.success && response.data?.success) {
        setApiResponse(response.data);
        setShowConfirmation(true);
      } else {
        throw new Error(response.data?.message || response.message || 'Error procesando descuentos');
      }
    } catch (error) {
      console.error('Error processing discounts:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`❌ Error procesando descuentos: ${errorMessage}\n\n💡 Continuando con datos locales para el siguiente paso.`);
      // En caso de error de API, continuar al siguiente paso con los datos locales
      onNext({ uploadedDiscounts: dataToProcess });
    } finally {
      setIsProcessing(false);
    }
  };



  // Pantalla de confirmación después del procesamiento exitoso
  if (showConfirmation && apiResponse) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: `${themeColors.secondary}20` }}
          >
            <CheckCircle className="w-8 h-8" style={{ color: themeColors.secondary }} />
          </motion.div>
          
          <h3 className="text-xl font-semibold mb-2" style={{ color: themeColors.text.primary }}>
            ¡Descuentos Procesados Exitosamente!
          </h3>
          
          <p className="text-sm mb-6" style={{ color: themeColors.text.secondary }}>
            {apiResponse.message}
          </p>
        </div>

        {/* Estadísticas del procesamiento */}
        <div 
          className="p-6 rounded-xl"
          style={{ backgroundColor: `${themeColors.surface}30` }}
        >
          <h4 className="text-lg font-semibold mb-4" style={{ color: themeColors.text.primary }}>
            Resumen del Procesamiento
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: themeColors.primary }}>
                {apiResponse.results.totalProcessed}
              </div>
              <div className="text-sm" style={{ color: themeColors.text.secondary }}>
                Total Procesados
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: themeColors.secondary }}>
                {apiResponse.results.successCount}
              </div>
              <div className="text-sm" style={{ color: themeColors.text.secondary }}>
                Creados Exitosamente
              </div>
            </div>
            
            {apiResponse.results.errorCount > 0 && (
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: themeColors.accent }}>
                  {apiResponse.results.errorCount}
                </div>
                <div className="text-sm" style={{ color: themeColors.text.secondary }}>
                  Con Errores
                </div>
              </div>
            )}
          </div>

          {/* Mostrar errores si los hay */}
          {apiResponse.results.errors && apiResponse.results.errors.length > 0 && (
            <div className="mt-6">
              <h5 className="font-semibold mb-3" style={{ color: themeColors.text.primary }}>
                Errores Encontrados:
              </h5>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {apiResponse.results.errors.map((error: {index: number; discount: DiscountBulkData; error: string}, index: number) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border-l-4"
                    style={{
                      backgroundColor: `${themeColors.accent}10`,
                      borderLeftColor: themeColors.accent
                    }}
                  >
                    <div className="text-sm font-medium" style={{ color: themeColors.text.primary }}>
                      {error.discount.name}
                    </div>
                    <div className="text-xs" style={{ color: themeColors.accent }}>
                      {error.error}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mostrar validaciones si las hay */}
          {apiResponse.results.validations && (
            <div className="mt-6">
              {apiResponse.results.validations.overlappingDiscounts?.length > 0 && (
                <div className="mb-4">
                  <h5 className="font-semibold mb-2" style={{ color: themeColors.text.primary }}>
                    Conflictos de Descuentos:
                  </h5>
                  <div className="space-y-1">
                    {apiResponse.results.validations.overlappingDiscounts.map((conflict: {discount1: string; discount2: string; conflictType: string}, index: number) => (
                      <div
                        key={index}
                        className="text-sm p-2 rounded"
                        style={{ backgroundColor: `${themeColors.accent}10`, color: themeColors.text.secondary }}
                      >
                        {conflict.discount1} vs {conflict.discount2}: {conflict.conflictType}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Resumen de descuentos procesados */}
        {apiResponse.results.discounts && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold" style={{ color: themeColors.text.primary }}>
              Descuentos Creados ({apiResponse.results.discounts.length})
            </h4>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {apiResponse.results.discounts.slice(0, 5).map((discount: DiscountBulkData, index: number) => (
                <motion.div
                  key={discount.discount_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 rounded-lg border"
                  style={{
                    backgroundColor: `${themeColors.surface}20`,
                    borderColor: `${themeColors.secondary}30`
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm" style={{ color: themeColors.text.primary }}>
                        {discount.name}
                      </div>
                      <div className="text-xs" style={{ color: themeColors.text.secondary }}>
                        ID: {discount.discount_id} | Tipo: {discount.type}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold" style={{ color: themeColors.primary }}>
                        {discount.type === 'percentage' ? `${discount.discount_value}%` : `${discount.currency} ${discount.discount_value}`}
                      </div>
                      <div className="text-xs" style={{ color: themeColors.text.secondary }}>
                        {discount.status}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {apiResponse.results.discounts.length > 5 && (
                <div className="text-center py-2">
                  <span className="text-sm" style={{ color: themeColors.text.secondary }}>
                    ... y {apiResponse.results.discounts.length - 5} descuentos más
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botón de navegación */}
        <div className="flex justify-center pt-6">
          <motion.button
            onClick={() => onNext({ uploadedDiscounts: uploadedData, apiResponse })}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-3 rounded-xl font-medium text-white"
            style={{ backgroundColor: themeColors.primary }}
          >
            Continuar
          </motion.button>
        </div>
      </div>
    );
  }

  // Pantalla de procesamiento
  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 space-y-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 rounded-full border-4 border-transparent flex items-center justify-center"
          style={{ 
            borderTopColor: themeColors.primary,
            borderRightColor: `${themeColors.primary}50`
          }}
        >
          <Loader2 className="w-8 h-8" style={{ color: themeColors.primary }} />
        </motion.div>
        
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2" style={{ color: themeColors.text.primary }}>
            Procesando Descuentos...
          </h3>
          <p className="text-sm" style={{ color: themeColors.text.secondary }}>
            Validando y creando descuentos en el sistema. Esto puede tomar unos momentos.
          </p>
        </div>
        
        <div 
          className="w-64 h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: `${themeColors.surface}50` }}
        >
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, ease: "easeInOut" }}
            className="h-full rounded-full"
            style={{ backgroundColor: themeColors.primary }}
          />
        </div>
      </div>
    );
  }



  return (
    <div className="space-y-6">
      {/* Selector de método */}
      <div className="flex items-center justify-center">
        <div 
          className="flex p-1 rounded-xl"
          style={{ backgroundColor: `${themeColors.surface}50` }}
        >
          <motion.button
            onClick={() => setMethod("file")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              method === "file" ? "" : "opacity-70"
            }`}
            style={{
              backgroundColor: method === "file" ? themeColors.primary : "transparent",
              color: method === "file" ? "white" : themeColors.text.primary,
            }}
          >
            Subir Archivo
          </motion.button>
          <motion.button
            onClick={() => setMethod("json")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              method === "json" ? "" : "opacity-70"
            }`}
            style={{
              backgroundColor: method === "json" ? themeColors.primary : "transparent",
              color: method === "json" ? "white" : themeColors.text.primary,
            }}
          >
            Importar JSON
          </motion.button>
        </div>
      </div>

      {/* Mensaje de ayuda para JSON */}
      {method === "json" && (
        <div 
          className="p-4 rounded-lg mb-4"
          style={{ backgroundColor: `${themeColors.surface}20`, border: `1px solid ${themeColors.primary}30` }}
        >
          <h5 className="font-semibold mb-2" style={{ color: themeColors.text.primary }}>
            💡 Formato JSON para Descuentos
          </h5>
          <p className="text-sm mb-2" style={{ color: themeColors.text.secondary }}>
            El JSON debe ser un array de objetos con la siguiente estructura:
          </p>
          <div className="text-xs bg-gray-800 text-green-400 p-2 rounded font-mono whitespace-pre">
{`[{
  "discountId": "DISC_001",
  "name": "Descuento Ejemplo", 
  "type": "percentage",
  "discountValue": 10,
  "currency": "COP",
  "validFrom": "2024-01-01T00:00:00Z",
  "status": "active",
  "customerType": "all", 
  "channel": "online",
  "category": "electronics"
}]`}
          </div>
          <p className="text-xs mt-2" style={{ color: themeColors.accent }}>
            ⚠️ Asegúrate que el JSON termine correctamente con ] y no tenga contenido adicional después.
          </p>
        </div>
      )}

      {/* Componente de upload */}
      <FileUploadComponent
        method={method}
        onUpload={handleUpload}
        onBack={onBack}
        themeColors={themeColors}
        sampleData={sampleDiscounts as unknown as Record<string, unknown>[]}
        title="Descuentos y Promociones"
        acceptedFileTypes=".csv,.xlsx,.json"
        fileExtensions={["csv", "xlsx", "json"]}
        isProcessing={isProcessing}
      />
    </div>
  );
}