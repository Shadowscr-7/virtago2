import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { StepProps } from '../shared/types';
import { CheckCircle, Loader2 } from 'lucide-react';
import { api, WizardSummaryData } from '@/api';

export function ReviewStep({ onNext, onBack, themeColors, stepData }: StepProps) {
  const [wizardData, setWizardData] = useState<WizardSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Evitar múltiples llamadas
    if (hasLoadedRef.current) {
      console.log('[ReviewStep] Ya se cargaron los datos, evitando llamada duplicada');
      return;
    }

    const loadWizardSummary = async () => {
      try {
        console.log('[ReviewStep] Iniciando carga de resumen del wizard...');
        hasLoadedRef.current = true; // Marcar inmediatamente para evitar concurrencia
        setIsLoading(true);
        const response = await api.admin.wizard.getSummary();
        
        if (response.success && response.data) {
          console.log('[ReviewStep] Datos cargados exitosamente:', response.data);
          setWizardData(response.data);
        } else {
          throw new Error(response.message || 'Error cargando resumen');
        }
      } catch (err) {
        console.error('[ReviewStep] Error loading wizard summary:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        
        // Fallback con datos locales del wizard si hay error
        const localData = stepData as Record<string, unknown>;
        const fallbackData: WizardSummaryData = {
          success: false,
          distributorCode: "LOCAL",
          userEmail: "user@local.test",
          generatedAt: new Date().toISOString(),
          configuration: {
            clients: {
              total: (localData?.uploadedClients as unknown[])?.length || 0,
              today: 0,
              status: (localData?.uploadedClients as unknown[])?.length ? "✅ Configurado" : "❌ Sin configurar"
            },
            products: {
              total: (localData?.matchedProducts as unknown[])?.length || 0,
              today: 0,
              status: (localData?.matchedProducts as unknown[])?.length ? "✅ Configurado" : "❌ Sin configurar"
            },
            listPrices: {
              total: (localData?.uploadedPriceLists as unknown[])?.length || 0,
              today: 0,
              status: (localData?.uploadedPriceLists as unknown[])?.length ? "✅ Configurado" : "❌ Sin configurar"
            },
            prices: {
              total: (localData?.uploadedPrices as unknown[])?.length || 0,
              today: 0,
              status: (localData?.uploadedPrices as unknown[])?.length ? "✅ Configurado" : "❌ Sin configurar"
            },
            discounts: {
              total: (localData?.uploadedDiscounts as unknown[])?.length || 0,
              today: 0,
              status: (localData?.uploadedDiscounts as unknown[])?.length ? "✅ Configurado" : "❌ Sin configurar"
            }
          },
          systemStatus: {
            status: "🟡 Configuración local",
            statusCode: "local_setup",
            completionPercentage: 75,
            totalEntities: ((localData?.uploadedClients as unknown[])?.length || 0) + 
                           ((localData?.matchedProducts as unknown[])?.length || 0) + 
                           ((localData?.uploadedPriceLists as unknown[])?.length || 0) + 
                           ((localData?.uploadedPrices as unknown[])?.length || 0) + 
                           ((localData?.uploadedDiscounts as unknown[])?.length || 0),
            todayActivity: 0
          },
          activity: {
            totalCreatedToday: 0,
            totalCreatedEver: 0,
            mostActiveEntity: {
              entity: "ninguna",
              count: 0,
              message: "Configuración local"
            }
          },
          recommendations: [
            "📋 Conectar con el servidor para sincronizar datos",
            "🔄 Verificar la conexión de red",
            "⚙️ Revisar configuración de API",
            "📊 Validar datos importados"
          ],
          summary: {
            title: "📋 Configuración Local",
            distributor: "LOCAL",
            details: [
              `Clientes: ${(localData?.uploadedClients as unknown[])?.length || 0} registrados`,
              `Productos: ${(localData?.matchedProducts as unknown[])?.length || 0} cargados`,
              `Listas de Precios: ${(localData?.uploadedPriceLists as unknown[])?.length || 0} configuradas`,
              `Precios: ${(localData?.uploadedPrices as unknown[])?.length || 0} establecidos`,
              `Descuentos: ${(localData?.uploadedDiscounts as unknown[])?.length || 0} configurados`,
              "Estado: 🟡 Configuración local"
            ]
          },
          simpleFormat: {
            message: "Configuración completada localmente"
          }
        };
        setWizardData(fallbackData);
      } finally {
        setIsLoading(false);
      }
    };

    loadWizardSummary();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Ejecutar solo una vez al montar - stepData se usa solo en fallback

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
        
        {error && (
          <p className="text-xs" style={{ color: themeColors.accent }}>
            Usando datos locales (sin conexión al servidor)
          </p>
        )}
      </div>

      {/* Resumen de lo configurado */}
      <div 
        className="p-6 rounded-xl"
        style={{ backgroundColor: `${themeColors.surface}30` }}
      >
        <h4 className="text-lg font-semibold mb-4" style={{ color: themeColors.text.primary }}>
          Resumen de Configuración
        </h4>
        
        {wizardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span style={{ color: themeColors.text.secondary }}>Clientes:</span>
                <div className="text-right">
                  <div className="font-semibold" style={{ color: themeColors.text.primary }}>
                    {wizardData.configuration.clients.total} registrados
                  </div>
                  {wizardData.configuration.clients.today > 0 && (
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
                    {wizardData.configuration.products.total} cargados
                  </div>
                  {wizardData.configuration.products.today > 0 && (
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
                    {wizardData.configuration.listPrices.total} configuradas
                  </div>
                  {wizardData.configuration.listPrices.today > 0 && (
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
                    {wizardData.configuration.prices.total} establecidos
                  </div>
                  {wizardData.configuration.prices.today > 0 && (
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
                    {wizardData.configuration.discounts.total} configurados
                  </div>
                  {wizardData.configuration.discounts.today > 0 && (
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
                    backgroundColor: wizardData.systemStatus.statusCode === 'configured' ? `${themeColors.secondary}20` : 
                                    wizardData.systemStatus.statusCode === 'not_configured' ? `${themeColors.accent}20` : 
                                    `${themeColors.primary}20`,
                    color: wizardData.systemStatus.statusCode === 'configured' ? themeColors.secondary : 
                           wizardData.systemStatus.statusCode === 'not_configured' ? themeColors.accent : 
                           themeColors.primary
                  }}
                >
                  {wizardData.systemStatus.status}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Próximos pasos */}
      {wizardData && wizardData.recommendations && (
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
      {wizardData && wizardData.activity && (
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
          {wizardData.activity.mostActiveEntity.entity !== 'ninguna' && (
            <div className="mt-2 text-xs" style={{ color: themeColors.text.secondary }}>
              Más activo hoy: {wizardData.activity.mostActiveEntity.entity} ({wizardData.activity.mostActiveEntity.count})
            </div>
          )}
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