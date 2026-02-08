import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { FileUploadComponent } from '../shared/FileUploadComponent';
import { StepProps, UploadResult } from '../shared/types';
import { api, PriceListBulkData } from '@/api';
import { parsePriceListFile } from '@/lib/file-parser';

// Interfaz para lista de precios parseada
interface ParsedPriceList {
  price_list_id?: string;
  name?: string;
  status?: string;
  default?: boolean;
  priority?: number;
  description?: string;
  notes?: string;
  applies_to?: string;
  customer_type?: string;
  channel?: string;
  country?: string;
  region?: string;
  currency?: string;
  discount_type?: string;
  start_date?: string;
  end_date?: string;
  minimum_quantity?: number;
  maximum_quantity?: number;
  tags?: string[];
  [key: string]: unknown;
}

interface PriceListStepProps extends StepProps {
  stepData?: {
    uploadedPriceLists?: ParsedPriceList[];
  };
}

export function PriceListStep({ onNext, onBack, themeColors }: PriceListStepProps) {
  const [uploadedData, setUploadedData] = useState<ParsedPriceList[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creationSummary, setCreationSummary] = useState<{
    count: number;
  } | null>(null);
  const [resetKey, setResetKey] = useState(0);

  const samplePriceLists: ParsedPriceList[] = [
    {
      price_list_id: 'PL_RETAIL_001',
      name: 'Lista Retail Premium',
      status: 'active',
      default: false,
      priority: 1,
      description: 'Lista de precios para clientes retail premium',
      customer_type: 'retail',
      channel: 'online',
      country: 'Colombia',
      currency: 'USD',
      start_date: '2025-11-29T06:43:14.951Z',
    },
  ];

  const handleUpload = async (result: UploadResult<ParsedPriceList>) => {
    if (!result.success || !result.data || result.data.length === 0) {
      setError('No se pudieron cargar los datos del archivo');
      return;
    }

    console.log('📤 [PriceListStep] Datos cargados del archivo:', result.data);
    console.log('📤 [PriceListStep] Primer item:', result.data[0]);
    console.log('📤 [PriceListStep] price_list_id del primer item:', result.data[0]?.price_list_id);
    
    setUploadedData(result.data);
    setError(null);
  };

  const handleConfirm = async () => {
    setIsCreating(true);
    setError(null);

    try {
      console.log('🚀 [PriceListStep] Creando listas de precios...');
      
      // Convertir a formato PriceListBulkData
      const priceListsToCreate: PriceListBulkData[] = uploadedData.map((list) => ({
        price_list_id: list.price_list_id || '',
        name: list.name || '',
        description: list.description,
        currency: list.currency || 'USD',
        country: list.country || '',
        customer_type: list.customer_type || '',
        channel: list.channel || '',
        start_date: list.start_date || new Date().toISOString(),
        end_date: list.end_date,
        status: (list.status as 'active' | 'inactive' | 'draft') || 'active',
        default: list.default,
        priority: list.priority,
      }));

      console.log('📤 [PriceListStep] Enviando:', priceListsToCreate);
      const response = await api.admin.priceLists.bulkCreate(priceListsToCreate);
      console.log('📥 [PriceListStep] Respuesta:', response);

      if (response.success) {
        console.log('✅ [PriceListStep] Listas de precios creadas');
        setCreationSummary({ count: response.data?.results?.successCount || priceListsToCreate.length });
      } else {
        // Mostrar errores específicos del backend
        console.error('❌ [PriceListStep] Error del backend:', response);
        
        // Construir mensaje de error detallado
        let errorMessage = 'Error al crear las listas de precios';
        
        // Si hay errores detallados en results.errors
        if (response.data?.results?.errors && Array.isArray(response.data.results.errors)) {
          const errors = response.data.results.errors;
          const successCount = response.data.results.successCount || 0;
          const errorCount = response.data.results.errorCount || errors.length;
          
          if (errorCount === 1) {
            const err = errors[0];
            if (err.error.toLowerCase().includes('already exists')) {
              errorMessage = `La lista de precios con ID "${err.price_list_id}" ya existe en el sistema`;
            } else {
              errorMessage = `Error en la lista de precios "${err.price_list_id}": ${err.error}`;
            }
          } else {
            errorMessage = `Se procesaron ${response.data.results.totalProcessed} listas:\n`;
            errorMessage += `✅ ${successCount} creadas correctamente\n`;
            errorMessage += `❌ ${errorCount} con errores:\n\n`;
            errors.forEach((err: any) => {
              if (err.error.toLowerCase().includes('already exists')) {
                errorMessage += `• ID "${err.price_list_id}" ya existe\n`;
              } else {
                errorMessage += `• ${err.price_list_id}: ${err.error}\n`;
              }
            });
          }
        } else if (response.message) {
          errorMessage = response.message;
        }
        
        setError(errorMessage);
      }
    } catch (error) {
      console.error('❌ [PriceListStep] Error de conexión:', error);
      
      // Verificar si es un error de red o del servidor
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'No se pudo conectar con el servidor';
      
      setError(`Error al conectar con el servidor: ${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleContinueAfterCreation = () => {
    onNext({ uploadedPriceLists: uploadedData });
  };

  // Si estamos creando
  if (isCreating) {
    return (
      <div className="text-center space-y-6">
        <div 
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: `${themeColors.primary}20` }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-transparent rounded-full"
            style={{ 
              borderTopColor: themeColors.primary,
              borderRightColor: themeColors.primary 
            }}
          />
        </div>
        <h4 className="text-lg font-semibold" style={{ color: themeColors.text.primary }}>
          Creando listas de precios...
        </h4>
      </div>
    );
  }

  // Si tenemos resumen de creación
  if (creationSummary) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: `${themeColors.secondary}20` }}
          >
            <CheckCircle2 className="w-10 h-10" style={{ color: themeColors.secondary }} />
          </motion.div>
          <h3 className="text-2xl font-bold" style={{ color: themeColors.text.primary }}>
            ¡Listas de Precios Creadas! 🎉
          </h3>
          <p className="text-sm mt-2" style={{ color: themeColors.text.secondary }}>
            Todas las listas han sido importadas exitosamente
          </p>
        </div>

        <div 
          className="p-6 rounded-xl"
          style={{ backgroundColor: `${themeColors.surface}30` }}
        >
          <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: `${themeColors.secondary}10` }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${themeColors.secondary}20` }}>
                <span className="text-xl">📋</span>
              </div>
              <div>
                <div className="font-semibold" style={{ color: themeColors.text.primary }}>
                  Listas de Precios Creadas
                </div>
                <div className="text-xs" style={{ color: themeColors.text.secondary }}>
                  Importadas correctamente
                </div>
              </div>
            </div>
            <div className="text-2xl font-bold" style={{ color: themeColors.secondary }}>
              {creationSummary.count}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 px-6 py-3 rounded-xl font-medium"
            style={{ 
              backgroundColor: `${themeColors.surface}50`,
              color: themeColors.text.secondary,
              border: `1px solid ${themeColors.primary}30`
            }}
          >
            ← Volver Atrás
          </motion.button>
          
          <motion.button
            onClick={handleContinueAfterCreation}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
            style={{ 
              backgroundColor: themeColors.secondary,
              color: 'white'
            }}
          >
            <CheckCircle2 className="w-5 h-5" />
            Confirmar y Continuar
          </motion.button>
        </div>
      </div>
    );
  }

  // Si tenemos datos cargados, mostrar preview
  if (uploadedData.length > 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold" style={{ color: themeColors.text.primary }}>
              Listas de Precios para Importar
            </h3>
            <p className="text-sm mt-1" style={{ color: themeColors.text.secondary }}>
              Revisa los datos antes de importar
            </p>
          </div>
          <motion.button
            onClick={() => {
              setUploadedData([]);
              setResetKey(prev => prev + 1);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-lg flex items-center gap-2"
            style={{ 
              backgroundColor: `${themeColors.accent}20`,
              color: themeColors.accent,
              border: `1px solid ${themeColors.accent}30`
            }}
          >
            🔄 Cargar Otros Datos
          </motion.button>
        </div>

        {/* Resumen */}
        <div 
          className="p-6 rounded-xl"
          style={{ backgroundColor: `${themeColors.surface}30` }}
        >
          <h4 className="text-lg font-semibold mb-4" style={{ color: themeColors.text.primary }}>
            Resumen
          </h4>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: themeColors.primary }}>
              {uploadedData.length}
            </div>
            <div className="text-sm" style={{ color: themeColors.text.secondary }}>
              Listas de Precios
            </div>
          </div>
        </div>

        {/* Lista de listas de precios */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {uploadedData.map((list, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-xl border"
              style={{
                backgroundColor: `${themeColors.surface}20`,
                borderColor: `${themeColors.primary}30`,
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h5 className="font-semibold mb-2" style={{ color: themeColors.text.primary }}>
                    {list.name || 'Sin nombre'}
                  </h5>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium" style={{ color: themeColors.text.secondary }}>ID:</span>
                      <span className="ml-2" style={{ color: themeColors.text.primary }}>{list.price_list_id}</span>
                    </div>
                    <div>
                      <span className="font-medium" style={{ color: themeColors.text.secondary }}>Estado:</span>
                      <span className="ml-2" style={{ color: themeColors.text.primary }}>{list.status}</span>
                    </div>
                    <div>
                      <span className="font-medium" style={{ color: themeColors.text.secondary }}>Tipo Cliente:</span>
                      <span className="ml-2" style={{ color: themeColors.text.primary }}>{list.customer_type}</span>
                    </div>
                    <div>
                      <span className="font-medium" style={{ color: themeColors.text.secondary }}>Canal:</span>
                      <span className="ml-2" style={{ color: themeColors.text.primary }}>{list.channel}</span>
                    </div>
                    <div>
                      <span className="font-medium" style={{ color: themeColors.text.secondary }}>País:</span>
                      <span className="ml-2" style={{ color: themeColors.text.primary }}>{list.country}</span>
                    </div>
                    <div>
                      <span className="font-medium" style={{ color: themeColors.text.secondary }}>Moneda:</span>
                      <span className="ml-2" style={{ color: themeColors.text.primary }}>{list.currency}</span>
                    </div>
                  </div>
                  {list.description && (
                    <p className="text-xs mt-2" style={{ color: themeColors.text.secondary }}>
                      {list.description}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-4">
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 px-6 py-3 rounded-xl font-medium"
            style={{
              backgroundColor: `${themeColors.surface}50`,
              color: themeColors.text.secondary,
              border: `1px solid ${themeColors.primary}30`
            }}
          >
            ← Volver Atrás
          </motion.button>
          <motion.button
            onClick={handleConfirm}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 px-6 py-3 rounded-xl font-medium text-white"
            style={{ backgroundColor: themeColors.secondary }}
          >
            ✅ Confirmar y Continuar
          </motion.button>
        </div>
      </div>
    );
  }

  // Vista inicial de carga
  return (
    <div className="space-y-6">
      <FileUploadComponent<ParsedPriceList>
        key={resetKey}
        method="file"
        onUpload={handleUpload}
        parseFile={parsePriceListFile}
        sampleData={samplePriceLists}
        onBack={onBack}
        themeColors={themeColors}
        title="Listas de Precios"
        description="Sube un archivo CSV o XLSX con las listas de precios"
        acceptedFileTypes=".csv,.xlsx"
        fileExtensions={["csv", "xlsx"]}
      />
    </div>
  );
}