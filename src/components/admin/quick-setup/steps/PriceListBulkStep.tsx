import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileUploadComponent } from '../shared/FileUploadComponent';
import { StepProps, UploadMethod, UploadResult } from '../shared/types';
import { api, PriceListBulkData } from '@/api';

// Datos de ejemplo para el upload (basados en el CURL del usuario)
const sampleData: PriceListBulkData[] = [
  {
    price_list_id: "PL_RETAIL_001",
    name: "Lista Retail Premium",
    description: "Lista de precios para clientes retail premium con descuentos especiales",
    currency: "USD",
    country: "Colombia",
    region: "Bogotá",
    customer_type: "retail_premium",
    channel: "online",
    start_date: "2024-01-01T00:00:00Z",
    end_date: "2024-12-31T23:59:59Z",
    status: "active",
    default: false,
    priority: 1,
    applies_to: "all",
    discount_type: "percentage",
    minimum_quantity: 1,
    maximum_quantity: 1000,
    custom_fields: {
      region_manager: "Juan Pérez",
      approval_required: true,
      max_discount: "15%"
    },
    tags: ["retail", "premium", "online"],
    notes: "Lista especial para clientes retail con volumen alto de compras"
  },
  {
    price_list_id: "PL_WHOLESALE_002",
    name: "Lista Mayorista Estándar",
    description: "Precios especiales para distribuidores mayoristas",
    currency: "USD",
    country: "Colombia",
    region: "Nacional",
    customer_type: "wholesale",
    channel: "b2b",
    start_date: "2024-01-01T00:00:00Z",
    status: "active",
    default: true,
    priority: 2,
    applies_to: "specific_categories",
    discount_type: "tiered",
    minimum_quantity: 50,
    maximum_quantity: 5000,
    custom_fields: {
      volume_discount: true,
      payment_terms: "Net 30",
      shipping_included: false
    },
    tags: ["wholesale", "b2b", "distributor"],
    notes: "Lista base para todos los distribuidores mayoristas"
  },
  {
    price_list_id: "PL_CORPORATE_003",
    name: "Lista Corporativa Empresarial", 
    description: "Precios negociados para grandes corporaciones",
    currency: "USD",
    country: "Colombia",
    region: "Medellín",
    customer_type: "corporate",
    channel: "direct_sales",
    start_date: "2024-02-01T00:00:00Z",
    end_date: "2024-07-31T23:59:59Z",
    status: "active",
    default: false,
    priority: 3,
    applies_to: "specific_products",
    discount_type: "fixed",
    minimum_quantity: 100,
    maximum_quantity: 10000,
    custom_fields: {
      contract_number: "CORP-2024-001",
      account_manager: "María González",
      special_terms: true,
      rebate_program: "quarterly"
    },
    tags: ["corporate", "enterprise", "contract"],
    notes: "Lista especial bajo contrato corporativo - válida hasta julio 2024"
  },
  {
    price_list_id: "PL_PROMOTIONAL_004",
    name: "Lista Promocional Temporada Alta",
    description: "Precios especiales para campañas promocionales de temporada",
    currency: "USD",
    country: "Colombia",
    region: "Costa Atlántica",
    customer_type: "retail",
    channel: "omnichannel",
    start_date: "2024-06-01T00:00:00Z",
    end_date: "2024-08-31T23:59:59Z",
    status: "draft",
    default: false,
    priority: 4,
    applies_to: "promotional_items",
    discount_type: "percentage",
    minimum_quantity: 1,
    maximum_quantity: 500,
    custom_fields: {
      campaign_code: "SUMMER2024",
      marketing_budget: "$50000",
      target_audience: "millennials",
      promotion_type: "flash_sale"
    },
    tags: ["promotional", "seasonal", "summer", "limited_time"],
    notes: "Lista temporal para campaña de verano - activar el 1 de junio"
  },
  {
    price_list_id: "PL_VIP_005",
    name: "Lista VIP Clientes Exclusivos",
    description: "Precios preferenciales para clientes VIP y de alto valor",
    currency: "USD",
    country: "Colombia", 
    region: "Cali",
    customer_type: "vip",
    channel: "exclusive",
    start_date: "2024-01-01T00:00:00Z",
    status: "active",
    default: false,
    priority: 5,
    applies_to: "premium_products",
    discount_type: "tiered",
    minimum_quantity: 1,
    maximum_quantity: 100,
    custom_fields: {
      loyalty_tier: "platinum",
      personal_shopper: "Ana Rodríguez", 
      concierge_service: true,
      exclusive_access: true
    },
    tags: ["vip", "exclusive", "premium", "loyalty"],
    notes: "Lista exclusiva para clientes platino con servicios premium incluidos"
  }
];

interface PriceListBulkStepProps extends StepProps {
  stepData?: {
    uploadedPriceLists?: PriceListBulkData[];
  };
}

export function PriceListBulkStep({ onNext, onBack, themeColors, stepData }: PriceListBulkStepProps) {
  const [method, setMethod] = useState<UploadMethod>("file");
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedData, setUploadedData] = useState<PriceListBulkData[]>(stepData?.uploadedPriceLists || []);
  const [showReview, setShowReview] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleFinalConfirmation = async () => {
    setIsConfirming(true);
    
    try {
      console.log('✅ Confirmando listas de precios procesadas...');
      
      // Los datos ya fueron procesados/guardados por el API en handleUpload
      // Solo necesitamos pasar al siguiente paso con los datos confirmados
      
      // Pequeña pausa para mostrar feedback visual de confirmación
      setTimeout(() => {
        onNext({ 
          uploadedPriceLists: uploadedData,
          confirmedPriceLists: uploadedData,
          processingComplete: true
        });
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error en la confirmación:', error);
      setErrorMessage('Error inesperado durante la confirmación. Por favor intenta nuevamente.');
      setIsConfirming(false);
      
      // Limpiar el error después de 5 segundos
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  const handleUpload = async (result: UploadResult<PriceListBulkData>) => {
    if (result.success) {
      setIsProcessing(true);
      setErrorMessage(""); // Limpiar errores previos
      
      try {
        console.log('🔍 Procesando listas de precios con API...');
        
        // Preparar datos para el API
        const priceListsToProcess = result.data.map(priceList => ({
          ...priceList,
          // Agregar valores por defecto si no están presentes
          status: priceList.status || 'active',
          default: priceList.default || false,
          priority: priceList.priority || 1,
          applies_to: priceList.applies_to || 'all',
          discount_type: priceList.discount_type || 'percentage',
          minimum_quantity: priceList.minimum_quantity || 1,
          maximum_quantity: priceList.maximum_quantity || 1000
        }));

        // 🆕 LLAMAR AL API INMEDIATAMENTE para procesar/validar
        const apiResponse = await api.admin.priceLists.bulkCreate(priceListsToProcess);
        
        if (apiResponse.success) {
          console.log('✅ API procesó exitosamente las listas de precios');
          
          // Usar los datos procesados por el API
          const processedData = apiResponse.data.results.priceLists || priceListsToProcess;
          setUploadedData(processedData);
          setShowReview(true);
          
        } else {
          console.error('⚠️ API reportó errores:', apiResponse.message);
          
          // Mostrar errores pero permitir revisión de datos
          setErrorMessage(`El API reportó algunos problemas: ${apiResponse.message}`);
          setUploadedData(priceListsToProcess);
          setShowReview(true);
        }
        
      } catch (error) {
        console.error('❌ Error llamando al API:', error);
        
        // En caso de error de conexión, mostrar datos para revisión manual
        setErrorMessage('Error de conexión con el API. Los datos se muestran para revisión manual.');
        setUploadedData(result.data.map(priceList => ({
          ...priceList,
          status: priceList.status || 'active',
          default: priceList.default || false,
          priority: priceList.priority || 1,
          applies_to: priceList.applies_to || 'all',
          discount_type: priceList.discount_type || 'percentage',
          minimum_quantity: priceList.minimum_quantity || 1,
          maximum_quantity: priceList.maximum_quantity || 1000
        })));
        setShowReview(true);
        
        // Limpiar el error después de 5 segundos
        setTimeout(() => setErrorMessage(""), 5000);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Mostrar pantalla de revisión de datos
  if (showReview && !showConfirmation) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl"
          style={{
            backgroundColor: `${themeColors.surface}30`,
            borderColor: `${themeColors.primary}30`,
          }}
        >
          {/* Mostrar error de procesamiento si existe */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-lg border-l-4"
              style={{
                backgroundColor: `#fef3c7`,
                borderLeftColor: `#f59e0b`,
                color: `#92400e`
              }}
            >
              <div className="flex items-center">
                <span className="text-lg mr-2">⚠️</span>
                <span className="text-sm font-medium">{errorMessage}</span>
              </div>
            </motion.div>
          )}

          {/* Header con estadísticas */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-4" style={{ color: themeColors.text.primary }}>
              Listas de Precios Procesadas por API
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold" style={{ color: themeColors.primary }}>
                  {uploadedData.length}
                </div>
                <div className="text-sm" style={{ color: themeColors.text.secondary }}>
                  Listas Procesadas
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: themeColors.secondary }}>
                  {uploadedData.filter(list => list.status === 'active').length}
                </div>
                <div className="text-sm" style={{ color: themeColors.text.secondary }}>
                  Activas
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: themeColors.accent }}>
                  {new Set(uploadedData.map(list => list.currency)).size}
                </div>
                <div className="text-sm" style={{ color: themeColors.text.secondary }}>
                  Monedas
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: themeColors.primary }}>
                  {new Set(uploadedData.map(list => list.customer_type)).size}
                </div>
                <div className="text-sm" style={{ color: themeColors.text.secondary }}>
                  Tipos Cliente
                </div>
              </div>
            </div>
          </div>

          {/* Lista de listas de precios */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {uploadedData.map((priceList, index) => (
              <motion.div
                key={`${priceList.price_list_id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: `${themeColors.surface}20`,
                  borderColor: `${themeColors.primary}30`,
                }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-lg font-semibold mb-1" style={{ color: themeColors.text.primary }}>
                      {priceList.name}
                    </h4>
                    <p className="text-sm mb-2" style={{ color: themeColors.text.secondary }}>
                      ID: {priceList.price_list_id}
                    </p>
                    {priceList.description && (
                      <p className="text-sm mb-2" style={{ color: themeColors.text.secondary }}>
                        {priceList.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: priceList.status === 'active' ? `${themeColors.secondary}20` : 
                                       priceList.status === 'draft' ? `${themeColors.accent}20` : `${themeColors.surface}50`,
                        color: priceList.status === 'active' ? themeColors.secondary : 
                               priceList.status === 'draft' ? themeColors.accent : themeColors.text.secondary
                      }}
                    >
                      {priceList.status || 'active'}
                    </span>
                    {priceList.default && (
                      <span 
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{ backgroundColor: `${themeColors.primary}20`, color: themeColors.primary }}
                      >
                        Por Defecto
                      </span>
                    )}
                  </div>
                </div>

                {/* Detalles de la lista */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="font-medium" style={{ color: themeColors.text.primary }}>País:</span>
                    <br />
                    <span style={{ color: themeColors.text.secondary }}>{priceList.country}</span>
                    {priceList.region && (
                      <>
                        <br />
                        <span style={{ color: themeColors.text.secondary }}>({priceList.region})</span>
                      </>
                    )}
                  </div>
                  <div>
                    <span className="font-medium" style={{ color: themeColors.text.primary }}>Moneda:</span>
                    <br />
                    <span style={{ color: themeColors.text.secondary }}>{priceList.currency}</span>
                  </div>
                  <div>
                    <span className="font-medium" style={{ color: themeColors.text.primary }}>Tipo Cliente:</span>
                    <br />
                    <span style={{ color: themeColors.text.secondary }}>{priceList.customer_type}</span>
                  </div>
                  <div>
                    <span className="font-medium" style={{ color: themeColors.text.primary }}>Canal:</span>
                    <br />
                    <span style={{ color: themeColors.text.secondary }}>{priceList.channel}</span>
                  </div>
                </div>

                {/* Fechas y configuración */}
                <div className="mt-3 pt-3 border-t" style={{ borderColor: `${themeColors.primary}20` }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium" style={{ color: themeColors.text.primary }}>Vigencia:</span>
                      <br />
                      <span style={{ color: themeColors.text.secondary }}>
                        Desde: {new Date(priceList.start_date).toLocaleDateString()}
                      </span>
                      {priceList.end_date && (
                        <>
                          <br />
                          <span style={{ color: themeColors.text.secondary }}>
                            Hasta: {new Date(priceList.end_date).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>
                    <div>
                      <span className="font-medium" style={{ color: themeColors.text.primary }}>Configuración:</span>
                      <br />
                      <span style={{ color: themeColors.text.secondary }}>
                        Prioridad: {priceList.priority || 1}
                      </span>
                      <br />
                      <span style={{ color: themeColors.text.secondary }}>
                        Aplica a: {priceList.applies_to || 'all'}
                      </span>
                      <br />
                      <span style={{ color: themeColors.text.secondary }}>
                        Tipo descuento: {priceList.discount_type || 'percentage'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tags si existen */}
                {priceList.tags && priceList.tags.length > 0 && (
                  <div className="mt-3 pt-3 border-t" style={{ borderColor: `${themeColors.primary}20` }}>
                    <div className="flex flex-wrap gap-2">
                      {priceList.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 rounded text-xs"
                          style={{ backgroundColor: `${themeColors.accent}20`, color: themeColors.accent }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notas si existen */}
                {priceList.notes && (
                  <div className="mt-3 pt-3 border-t" style={{ borderColor: `${themeColors.primary}20` }}>
                    <span className="font-medium text-sm" style={{ color: themeColors.text.primary }}>Notas:</span>
                    <p className="text-sm mt-1" style={{ color: themeColors.text.secondary }}>
                      {priceList.notes}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Botones de navegación */}
          <div className="flex justify-between pt-6">
            <motion.button
              onClick={() => setShowReview(false)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 rounded-xl font-medium"
              style={{
                backgroundColor: `${themeColors.surface}50`,
                color: themeColors.text.secondary,
              }}
            >
              Volver
            </motion.button>
            <motion.button
              onClick={() => setShowConfirmation(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 rounded-xl font-medium text-white"
              style={{ backgroundColor: themeColors.primary }}
            >
              Revisar y Confirmar
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Mostrar confirmación después de revisión
  if (showConfirmation) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-xl text-center"
          style={{
            backgroundColor: `${themeColors.surface}30`,
            borderColor: `${themeColors.primary}30`,
          }}
        >
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                 style={{ backgroundColor: `${themeColors.primary}20` }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="text-2xl"
              >
                ✓
              </motion.div>
            </div>
            <h4 className="text-lg font-semibold mb-2" style={{ color: themeColors.text.primary }}>
              ¿Confirmar importación de listas de precios?
            </h4>
            <p className="text-sm" style={{ color: themeColors.text.secondary }}>
              Has revisado los datos. ¿Deseas confirmar la importación de estas {uploadedData.length} listas de precios?
            </p>
          </div>

          {/* Mostrar error si existe */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 rounded-lg border-l-4"
              style={{
                backgroundColor: `#fee2e2`,
                borderLeftColor: `#dc2626`,
                color: `#7f1d1d`
              }}
            >
              <div className="flex items-center">
                <span className="text-lg mr-2">⚠️</span>
                <span className="text-sm font-medium">{errorMessage}</span>
              </div>
            </motion.div>
          )}
          
          {/* Resumen compacto */}
          <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: `${themeColors.surface}20` }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold" style={{ color: themeColors.primary }}>
                  {uploadedData.length}
                </div>
                <div className="text-xs" style={{ color: themeColors.text.secondary }}>
                  Listas Totales
                </div>
              </div>
              <div>
                <div className="text-lg font-bold" style={{ color: themeColors.secondary }}>
                  {uploadedData.filter(list => list.status === 'active').length}
                </div>
                <div className="text-xs" style={{ color: themeColors.text.secondary }}>
                  Activas
                </div>
              </div>
              <div>
                <div className="text-lg font-bold" style={{ color: themeColors.accent }}>
                  {new Set(uploadedData.map(list => list.currency)).size}
                </div>
                <div className="text-xs" style={{ color: themeColors.text.secondary }}>
                  Monedas
                </div>
              </div>
              <div>
                <div className="text-lg font-bold" style={{ color: themeColors.primary }}>
                  {new Set(uploadedData.map(list => list.country)).size}
                </div>
                <div className="text-xs" style={{ color: themeColors.text.secondary }}>
                  Países
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <motion.button
              onClick={() => setShowConfirmation(false)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 rounded-xl font-medium order-2 sm:order-1"
              style={{
                backgroundColor: `${themeColors.surface}50`,
                color: themeColors.text.secondary,
                border: `2px solid ${themeColors.surface}`,
              }}
            >
              ← Revisar Datos
            </motion.button>
            
            <div className="flex flex-col sm:flex-row gap-3 order-1 sm:order-2">
              <motion.button
                onClick={() => {
                  setUploadedData([]);
                  setShowReview(false);
                  setShowConfirmation(false);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 rounded-xl font-medium"
                style={{
                  backgroundColor: `${themeColors.accent}20`,
                  color: themeColors.accent,
                  border: `2px solid ${themeColors.accent}30`,
                }}
              >
                🔄 Cargar Otros Datos
              </motion.button>
              
              <motion.button
                onClick={handleFinalConfirmation}
                disabled={isConfirming}
                whileHover={{ scale: isConfirming ? 1 : 1.05 }}
                whileTap={{ scale: isConfirming ? 1 : 0.98 }}
                className="px-8 py-3 rounded-xl font-semibold text-white shadow-lg flex items-center gap-2 min-w-[200px] justify-center"
                style={{ 
                  backgroundColor: isConfirming ? `${themeColors.primary}80` : themeColors.primary,
                  boxShadow: `0 4px 12px ${themeColors.primary}30`,
                  cursor: isConfirming ? 'wait' : 'pointer'
                }}
              >
                {isConfirming ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    Confirmando...
                  </>
                ) : (
                  <>
                    ✅ Confirmar y Continuar
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
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

      {/* Componente de upload */}
      <FileUploadComponent
        method={method}
        onUpload={handleUpload}
        onBack={onBack}
        themeColors={themeColors}
        sampleData={sampleData}
        title="Listas de Precios"
        acceptedFileTypes=".csv,.xlsx,.json"
        fileExtensions={["csv", "xlsx", "json"]}
        isProcessing={isProcessing}
      />
    </div>
  );
}