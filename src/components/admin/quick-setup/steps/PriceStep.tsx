import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileUploadComponent } from '../shared/FileUploadComponent';
import { StepProps, PriceData, UploadMethod, UploadResult } from '../shared/types';
import { TrendingUp, DollarSign, Percent, CheckCircle, Loader2 } from 'lucide-react';
import { api, PriceBulkData, PriceBulkCreateResponse } from '@/api';

// Datos de ejemplo para precios
const samplePrices: PriceData[] = [
  {
    productCode: "LAP001",
    productName: "Laptop Gaming RGB Ultra",
    basePrice: 1299.99,
    cost: 900.00,
    margin: 44.44,
    currency: "USD"
  },
  {
    productCode: "MON002",
    productName: "Monitor Curvo 27 pulgadas",
    basePrice: 399.99,
    cost: 280.00,
    margin: 42.86,
    currency: "USD"
  },
  {
    productCode: "TEC003",
    productName: "Teclado Mecánico RGB",
    basePrice: 89.99,
    cost: 55.00,
    margin: 63.64,
    currency: "USD"
  },
  {
    productCode: "RAT004",
    productName: "Mouse Inalámbrico Precisión",
    basePrice: 59.99,
    cost: 35.00,
    margin: 71.43,
    currency: "USD"
  },
  {
    productCode: "AUD005",
    productName: "Auriculares Gaming 7.1",
    basePrice: 79.99,
    cost: 45.00,
    margin: 77.78,
    currency: "USD"
  },
  {
    productCode: "GPU009",
    productName: "Tarjeta Gráfica RTX Super",
    basePrice: 899.99,
    cost: 650.00,
    margin: 38.46,
    currency: "USD"
  },
  {
    productCode: "RAM008",
    productName: "Memoria RAM DDR4 32GB",
    basePrice: 189.99,
    cost: 120.00,
    margin: 58.33,
    currency: "USD"
  }
];

interface PriceStepProps extends StepProps {
  stepData?: {
    uploadedPrices?: PriceData[];
  };
}

export function PriceStep({ onNext, onBack, themeColors, stepData }: PriceStepProps) {
  const [method, setMethod] = useState<UploadMethod>("file");
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedData, setUploadedData] = useState<PriceData[]>(stepData?.uploadedPrices || []);
  const [apiResponse, setApiResponse] = useState<PriceBulkCreateResponse | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Función para convertir datos del wizard al formato de API
  const convertToApiFormat = (prices: PriceData[]): PriceBulkData[] => {
    return prices.map(price => ({
      name: `Precio para ${price.productName}`,
      priceId: `PRC_${price.productCode}_${Date.now()}`,
      productSku: price.productCode,
      productName: price.productName,
      basePrice: price.basePrice,
      costPrice: price.cost,
      currency: price.currency,
      validFrom: new Date().toISOString(),
      status: 'active' as const,
      priceType: 'regular' as const,
      priority: 1,
      taxIncluded: true,
      taxRate: 19,
      minQuantity: 1,
      maxQuantity: 1000,
      customerType: 'all' as const,
      channel: 'omnichannel' as const,
      region: 'colombia' as const,
      margin: price.margin,
      profitMargin: price.basePrice - price.cost,
    }));
  };

  const handleUpload = async (result: UploadResult<PriceData>) => {
    if (!result.success) {
      console.error('Error uploading prices:', result.error);
      return;
    }

    setIsProcessing(true);
    
    try {
      // Convertir datos al formato de API
      const apiData = convertToApiFormat(result.data);
      
      // Llamar a la API real
      const response = await api.admin.prices.bulkCreate(apiData);
      
      if (response.success && response.data?.success) {
        setApiResponse(response.data);
        setUploadedData(result.data);
        setShowConfirmation(true);
      } else {
        throw new Error(response.data?.message || response.message || 'Error procesando precios');
      }
    } catch (error) {
      console.error('Error processing prices:', error);
      // En caso de error, mostrar datos localmente
      setUploadedData(result.data);
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateStats = (prices: PriceData[]) => {
    if (prices.length === 0) return { avgMargin: 0, totalProducts: 0, avgPrice: 0 };
    
    const avgMargin = prices.reduce((sum, price) => sum + price.margin, 0) / prices.length;
    const avgPrice = prices.reduce((sum, price) => sum + price.basePrice, 0) / prices.length;
    
    return {
      avgMargin: Math.round(avgMargin * 100) / 100,
      totalProducts: prices.length,
      avgPrice: Math.round(avgPrice * 100) / 100
    };
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
            ¡Precios Procesados Exitosamente!
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
                {apiResponse.results.errors.map((error: {index: number; price: PriceBulkData; error: string}, index: number) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border-l-4"
                    style={{
                      backgroundColor: `${themeColors.accent}10`,
                      borderLeftColor: themeColors.accent
                    }}
                  >
                    <div className="text-sm font-medium" style={{ color: themeColors.text.primary }}>
                      {error.price.productName}
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
              {apiResponse.results.validations.priceConflicts?.length > 0 && (
                <div className="mb-4">
                  <h5 className="font-semibold mb-2" style={{ color: themeColors.text.primary }}>
                    Conflictos de Precio:
                  </h5>
                  <div className="space-y-1">
                    {apiResponse.results.validations.priceConflicts.map((conflict: {priceId: string; conflictType: string}, index: number) => (
                      <div
                        key={index}
                        className="text-sm p-2 rounded"
                        style={{ backgroundColor: `${themeColors.accent}10`, color: themeColors.text.secondary }}
                      >
                        {conflict.priceId}: {conflict.conflictType}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Resumen de precios procesados */}
        {apiResponse.results.prices && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold" style={{ color: themeColors.text.primary }}>
              Precios Creados ({apiResponse.results.prices.length})
            </h4>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {apiResponse.results.prices.slice(0, 5).map((price: PriceBulkData, index: number) => (
                <motion.div
                  key={price.priceId}
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
                        {price.productName}
                      </div>
                      <div className="text-xs" style={{ color: themeColors.text.secondary }}>
                        ID: {price.priceId}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold" style={{ color: themeColors.primary }}>
                        {price.currency} {price.basePrice}
                      </div>
                      <div className="text-xs" style={{ color: themeColors.text.secondary }}>
                        {price.status}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {apiResponse.results.prices.length > 5 && (
                <div className="text-center py-2">
                  <span className="text-sm" style={{ color: themeColors.text.secondary }}>
                    ... y {apiResponse.results.prices.length - 5} precios más
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botón de navegación */}
        <div className="flex justify-center pt-6">
          <motion.button
            onClick={() => onNext({ uploadedPrices: uploadedData, apiResponse })}
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
            Procesando Precios...
          </h3>
          <p className="text-sm" style={{ color: themeColors.text.secondary }}>
            Validando y creando precios en el sistema. Esto puede tomar unos momentos.
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

  if (uploadedData.length > 0 && !isProcessing && !showConfirmation) {
    const stats = calculateStats(uploadedData);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold" style={{ color: themeColors.text.primary }}>
            Precios Cargados - Revisión
          </h3>
          <motion.button
            onClick={() => setUploadedData([])}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-lg"
            style={{ 
              backgroundColor: `${themeColors.accent}20`,
              color: themeColors.accent 
            }}
          >
            Cargar Otros
          </motion.button>
        </div>

        {/* Estadísticas */}
        <div 
          className="p-6 rounded-xl"
          style={{ backgroundColor: `${themeColors.surface}30` }}
        >
          <h4 className="text-lg font-semibold mb-4" style={{ color: themeColors.text.primary }}>
            Análisis de Precios
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2"
                style={{ backgroundColor: `${themeColors.primary}20` }}
              >
                <TrendingUp className="w-6 h-6" style={{ color: themeColors.primary }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: themeColors.primary }}>
                {stats.totalProducts}
              </div>
              <div className="text-sm" style={{ color: themeColors.text.secondary }}>
                Productos con Precio
              </div>
            </div>
            <div className="text-center">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2"
                style={{ backgroundColor: `${themeColors.secondary}20` }}
              >
                <DollarSign className="w-6 h-6" style={{ color: themeColors.secondary }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: themeColors.secondary }}>
                ${stats.avgPrice}
              </div>
              <div className="text-sm" style={{ color: themeColors.text.secondary }}>
                Precio Promedio
              </div>
            </div>
            <div className="text-center">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2"
                style={{ backgroundColor: `${themeColors.accent}20` }}
              >
                <Percent className="w-6 h-6" style={{ color: themeColors.accent }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: themeColors.accent }}>
                {stats.avgMargin}%
              </div>
              <div className="text-sm" style={{ color: themeColors.text.secondary }}>
                Margen Promedio
              </div>
            </div>
          </div>
        </div>

        {/* Lista de precios */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold" style={{ color: themeColors.text.primary }}>
            Precios por Producto
          </h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {uploadedData.map((price, index) => (
              <motion.div
                key={`${price.productCode}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: `${themeColors.surface}20`,
                  borderColor: `${themeColors.primary}30`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h5 className="font-semibold text-sm" style={{ color: themeColors.text.primary }}>
                      {price.productName}
                    </h5>
                    <p className="text-xs" style={{ color: themeColors.text.secondary }}>
                      Código: {price.productCode}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-xs" style={{ color: themeColors.text.secondary }}>
                        Costo
                      </div>
                      <div className="font-medium" style={{ color: themeColors.text.primary }}>
                        ${price.cost}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-xs" style={{ color: themeColors.text.secondary }}>
                        Precio
                      </div>
                      <div className="font-bold" style={{ color: themeColors.primary }}>
                        ${price.basePrice}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-xs" style={{ color: themeColors.text.secondary }}>
                        Margen
                      </div>
                      <div 
                        className="font-medium px-2 py-1 rounded text-xs"
                        style={{ 
                          backgroundColor: price.margin > 50 ? `${themeColors.secondary}20` : `${themeColors.accent}20`,
                          color: price.margin > 50 ? themeColors.secondary : themeColors.accent
                        }}
                      >
                        {price.margin}%
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Botones de navegación */}
        <div className="flex justify-between pt-6">
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 rounded-xl font-medium"
            style={{
              backgroundColor: `${themeColors.surface}50`,
              color: themeColors.text.secondary,
            }}
          >
            Anterior
          </motion.button>
          
          <motion.button
            onClick={async () => {
              setIsProcessing(true);
              try {
                // Convertir datos al formato de API
                const apiData = convertToApiFormat(uploadedData);
                
                // Llamar a la API real
                const response = await api.admin.prices.bulkCreate(apiData);
                
                if (response.success && response.data?.success) {
                  setApiResponse(response.data);
                  setShowConfirmation(true);
                } else {
                  throw new Error(response.data?.message || response.message || 'Error procesando precios');
                }
              } catch (error) {
                console.error('Error processing prices:', error);
                // En caso de error, mostrar mensaje pero continuar
                alert('Error procesando precios. Continuando con datos locales.');
                onNext({ uploadedPrices: uploadedData });
              } finally {
                setIsProcessing(false);
              }
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 rounded-xl font-medium text-white"
            style={{ backgroundColor: themeColors.primary }}
          >
            Procesar JSON
          </motion.button>
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

      {/* Componente de upload */}
      <FileUploadComponent
        method={method}
        onUpload={handleUpload}
        onBack={onBack}
        themeColors={themeColors}
        sampleData={samplePrices}
        title="Precios de Productos"
        acceptedFileTypes=".csv,.xlsx,.json"
        fileExtensions={["csv", "xlsx", "json"]}
        isProcessing={isProcessing}
      />
    </div>
  );
}