import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { StepProps } from '../shared/types';
import { CheckCircle, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { WizardSummaryData } from '@/api';
import { api } from '@/api';

export function ReviewStep({ onNext, onBack, themeColors, stepData }: StepProps) {
  const [wizardData, setWizardData] = useState<WizardSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const loadFromBackend = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('[ReviewStep] 🔍 Llamando al endpoint GET /wizard/ para obtener totales reales...');
      const response = await api.admin.wizard.getSummary();
      console.log('[ReviewStep] 📥 Respuesta del backend:', response);
      
      if (response.success && response.data) {
        // Handle both flat and nested response structures
        const data = (response.data as any)?.configuration 
          ? response.data 
          : (response.data as any)?.data || response.data;
        
        console.log('[ReviewStep] ✅ Datos del resumen obtenidos del backend:', data);
        setWizardData(data as WizardSummaryData);
      } else {
        console.warn('[ReviewStep] ⚠️ Respuesta no exitosa:', response);
        setError('No se pudieron obtener los datos del resumen');
      }
    } catch (err) {
      console.error('[ReviewStep] ❌ Error obteniendo resumen:', err);
      setError('Error al conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    loadFromBackend();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${themeColors.primary}20` }}
        >
          <Loader2 className="w-10 h-10 animate-spin" style={{ color: themeColors.primary }} />
        </motion.div>
        
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2" style={{ color: themeColors.text.primary }}>
            Generando Resumen
          </h3>
          <p className="text-sm" style={{ color: themeColors.text.secondary }}>
            Obteniendo datos actualizados del sistema...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center space-y-6">
        <div 
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
          style={{ backgroundColor: '#ef444420' }}
        >
          <AlertCircle className="w-10 h-10" style={{ color: '#ef4444' }} />
        </div>
        <h3 className="text-xl font-semibold" style={{ color: themeColors.text.primary }}>
          Error al cargar resumen
        </h3>
        <p className="text-sm" style={{ color: themeColors.text.secondary }}>
          {error}
        </p>
        <motion.button
          onClick={() => { hasLoadedRef.current = false; loadFromBackend(); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 rounded-xl font-medium text-white flex items-center gap-2 mx-auto"
          style={{ backgroundColor: themeColors.primary }}
        >
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </motion.button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div 
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
          style={{ backgroundColor: `${themeColors.secondary}20` }}
        >
          <CheckCircle className="w-10 h-10" style={{ color: themeColors.secondary }} />
        </div>
        
        <h3 className="text-2xl font-semibold" style={{ color: themeColors.text.primary }}>
          ¡Configuración Completada!
        </h3>
        <p style={{ color: themeColors.text.secondary }}>
          Tu sistema ha sido configurado exitosamente con todos los datos iniciales.
        </p>
      </div>

      {/* Resumen de lo configurado */}
      <div 
        className="p-6 rounded-xl"
        style={{ backgroundColor: `${themeColors.surface}30` }}
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold" style={{ color: themeColors.text.primary }}>
            Resumen de Configuración
          </h4>
          <motion.button
            onClick={() => { hasLoadedRef.current = false; loadFromBackend(); }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${themeColors.primary}20`, color: themeColors.primary }}
            title="Actualizar datos"
          >
            <RefreshCw className="w-4 h-4" />
          </motion.button>
        </div>
        
        {wizardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span style={{ color: themeColors.text.secondary }}>Clientes:</span>
                <div className="text-right">
                  <div className="font-semibold" style={{ color: themeColors.text.primary }}>
                    {wizardData.configuration?.clients?.total ?? 0} registrados
                  </div>
                  {(wizardData.configuration?.clients?.today ?? 0) > 0 && (
                    <div className="text-xs" style={{ color: themeColors.text.secondary }}>
                      +{wizardData.configuration.clients.today} hoy
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: themeColors.text.secondary }}>Productos:</span>
                <div className="text-right">
                  <div className="font-semibold" style={{ color: themeColors.text.primary }}>
                    {wizardData.configuration?.products?.total ?? 0} cargados
                  </div>
                  {(wizardData.configuration?.products?.today ?? 0) > 0 && (
                    <div className="text-xs" style={{ color: themeColors.text.secondary }}>
                      +{wizardData.configuration.products.today} hoy
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: themeColors.text.secondary }}>Listas de Precios:</span>
                <div className="text-right">
                  <div className="font-semibold" style={{ color: themeColors.text.primary }}>
                    {wizardData.configuration?.listPrices?.total ?? 0} configuradas
                  </div>
                  {(wizardData.configuration?.listPrices?.today ?? 0) > 0 && (
                    <div className="text-xs" style={{ color: themeColors.text.secondary }}>
                      +{wizardData.configuration.listPrices.today} hoy
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span style={{ color: themeColors.text.secondary }}>Precios:</span>
                <div className="text-right">
                  <div className="font-semibold" style={{ color: themeColors.text.primary }}>
                    {wizardData.configuration?.prices?.total ?? 0} establecidos
                  </div>
                  {(wizardData.configuration?.prices?.today ?? 0) > 0 && (
                    <div className="text-xs" style={{ color: themeColors.text.secondary }}>
                      +{wizardData.configuration.prices.today} hoy
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: themeColors.text.secondary }}>Descuentos:</span>
                <div className="text-right">
                  <div className="font-semibold" style={{ color: themeColors.text.primary }}>
                    {wizardData.configuration?.discounts?.total ?? 0} configurados
                  </div>
                  {(wizardData.configuration?.discounts?.today ?? 0) > 0 && (
                    <div className="text-xs" style={{ color: themeColors.text.secondary }}>
                      +{wizardData.configuration.discounts.today} hoy
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: themeColors.text.secondary }}>Estado:</span>
                <span 
                  className="px-2 py-1 rounded text-sm font-medium"
                  style={{ 
                    backgroundColor: wizardData.systemStatus?.statusCode === 'configured' ? `${themeColors.secondary}20` : 
                                    wizardData.systemStatus?.statusCode === 'not_configured' ? `${themeColors.accent}20` : 
                                    `${themeColors.primary}20`,
                    color: wizardData.systemStatus?.statusCode === 'configured' ? themeColors.secondary : 
                           wizardData.systemStatus?.statusCode === 'not_configured' ? themeColors.accent : 
                           themeColors.primary
                  }}
                >
                  {wizardData.systemStatus?.status || '🟡 Sin configurar'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recomendaciones */}
      {wizardData?.recommendations && wizardData.recommendations.length > 0 && (
        <div 
          className="p-6 rounded-xl"
          style={{ backgroundColor: `${themeColors.primary}10` }}
        >
          <h4 className="text-lg font-semibold mb-3" style={{ color: themeColors.text.primary }}>
            Recomendaciones
          </h4>
          <ul className="space-y-2 text-sm" style={{ color: themeColors.text.secondary }}>
            {wizardData.recommendations.map((recommendation, index) => (
              <li key={index}>{recommendation}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Información adicional del sistema */}
      {wizardData?.activity && (
        <div 
          className="p-4 rounded-xl"
          style={{ backgroundColor: `${themeColors.secondary}10` }}
        >
          <div className="flex items-center justify-between text-sm">
            <div>
              <span style={{ color: themeColors.text.secondary }}>Actividad hoy: </span>
              <span className="font-semibold" style={{ color: themeColors.text.primary }}>
                {wizardData.activity.totalCreatedToday} registros
              </span>
            </div>
            <div>
              <span style={{ color: themeColors.text.secondary }}>Total histórico: </span>
              <span className="font-semibold" style={{ color: themeColors.text.primary }}>
                {wizardData.activity.totalCreatedEver} registros
              </span>
            </div>
          </div>
        </div>
      )}

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
          onClick={() => onNext({ completed: true })}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 rounded-xl font-medium text-white"
          style={{ backgroundColor: themeColors.secondary }}
        >
          Finalizar Configuración
        </motion.button>
      </div>
    </div>
  );
}
