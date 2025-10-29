import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { StepProps } from '../shared/types';
import { CheckCircle, Loader2 } from 'lucide-react';
import { WizardSummaryData } from '@/api';

export function ReviewStep({ onNext, onBack, themeColors, stepData }: StepProps) {
  const [wizardData, setWizardData] = useState<WizardSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Evitar múltiples llamadas
    if (hasLoadedRef.current) {
      console.log('[ReviewStep] Ya se cargaron los datos, evitando llamada duplicada');
      return;
    }

    const loadWizardSummary = async () => {
      try {
        console.log('[ReviewStep] ✅ USANDO DATOS DEL WIZARD (no del backend)');
        console.log('[ReviewStep] 📦 stepData recibido:', stepData);
        hasLoadedRef.current = true;
        setIsLoading(true);
        
        // 🆕 USAR DATOS DEL WIZARD DIRECTAMENTE
        // El wizard ya tiene toda la información de lo que se creó en cada paso
        const localData = stepData as Record<string, unknown>;
        
        // 🔍 Contar registros creados en el wizard
        const clientsCount = (localData?.uploadedClients as unknown[])?.length || 0;
        const productsCount = (localData?.matchedProducts as unknown[])?.length || 0;
        const priceListsCount = (localData?.uploadedPriceLists as unknown[])?.length || 0;
        const pricesCount = (localData?.uploadedPrices as unknown[])?.length || 0;
        const discountsCount = (localData?.uploadedDiscounts as unknown[])?.length || 0;
        
        const totalEntities = clientsCount + productsCount + priceListsCount + pricesCount + discountsCount;
        const completionPercentage = totalEntities > 0 ? 100 : 0;
        
        console.log('[ReviewStep] 📊 Conteo de registros:', {
          clientes: clientsCount,
          productos: productsCount,
          listas: priceListsCount,
          precios: pricesCount,
          descuentos: discountsCount,
          total: totalEntities
        });
        
        const fallbackData: WizardSummaryData = {
          success: true,
          distributorCode: "WIZARD-SESSION",
          userEmail: "admin@virtago.shop",
          generatedAt: new Date().toISOString(),
          configuration: {
            clients: {
              total: clientsCount,
              today: clientsCount, // ✅ Los creados "hoy" son los del wizard
              status: clientsCount > 0 ? "✅ Configurado" : "❌ Sin configurar"
            },
            products: {
              total: productsCount,
              today: productsCount,
              status: productsCount > 0 ? "✅ Configurado" : "❌ Sin configurar"
            },
            listPrices: {
              total: priceListsCount,
              today: priceListsCount,
              status: priceListsCount > 0 ? "✅ Configurado" : "❌ Sin configurar"
            },
            prices: {
              total: pricesCount,
              today: pricesCount,
              status: pricesCount > 0 ? "✅ Configurado" : "❌ Sin configurar"
            },
            discounts: {
              total: discountsCount,
              today: discountsCount,
              status: discountsCount > 0 ? "✅ Configurado" : "❌ Sin configurar"
            }
          },
          systemStatus: {
            status: totalEntities > 0 ? "✅ Configurado" : "🟡 Sin configurar",
            statusCode: totalEntities > 0 ? "configured" : "not_configured",
            completionPercentage,
            totalEntities,
            todayActivity: totalEntities
          },
          activity: {
            totalCreatedToday: totalEntities,
            totalCreatedEver: totalEntities,
            mostActiveEntity: {
              entity: clientsCount > 0 ? "Clientes" : 
                      productsCount > 0 ? "Productos" : 
                      pricesCount > 0 ? "Precios" : 
                      discountsCount > 0 ? "Descuentos" : 
                      priceListsCount > 0 ? "Listas de Precios" : "ninguna",
              count: Math.max(clientsCount, productsCount, priceListsCount, pricesCount, discountsCount),
              message: "Configurado en wizard"
            }
          },
          recommendations: totalEntities > 0 ? [
            "📋 Cargar clientes para comenzar" + (clientsCount === 0 ? " ⚠️" : ""),
            "🎁 Agregar productos al catálogo" + (productsCount === 0 ? " ⚠️" : ""),
            "💲 Configurar precios para los productos" + (pricesCount === 0 ? " ⚠️" : ""),
            "🎯 Crear listas de precios organizadas" + (priceListsCount === 0 ? " ⚠️" : ""),
            "🎉 Configurar descuentos y promociones" + (discountsCount === 0 ? " ⚠️" : "")
          ] : [
            "⚠️ No se han cargado datos todavía",
            "📋 Empieza por cargar clientes",
            "🎁 Luego agrega productos al catálogo",
            "💲 Configura precios base",
            "🎯 Organiza listas de precios por cliente"
          ],
          summary: {
            title: totalEntities > 0 ? "✅ Configuración del Wizard Completada" : "⚠️ Configuración Pendiente",
            distributor: "WIZARD-SESSION",
            details: [
              `Clientes: ${clientsCount} registrados ${clientsCount > 0 ? '✅' : '⚠️'}`,
              `Productos: ${productsCount} cargados ${productsCount > 0 ? '✅' : '⚠️'}`,
              `Listas de Precios: ${priceListsCount} configuradas ${priceListsCount > 0 ? '✅' : '⚠️'}`,
              `Precios: ${pricesCount} establecidos ${pricesCount > 0 ? '✅' : '⚠️'}`,
              `Descuentos: ${discountsCount} configurados ${discountsCount > 0 ? '✅' : '⚠️'}`,
              `Total: ${totalEntities} registros creados`,
              `Estado: ${totalEntities > 0 ? '✅ Configurado' : '⚠️ Sin configurar'}`
            ]
          },
          simpleFormat: {
            message: totalEntities > 0 
              ? `✅ Configuración completada: ${totalEntities} registros creados` 
              : "⚠️ No se han cargado datos todavía"
          }
        };
        
        console.log('[ReviewStep] ✅ Datos del resumen generados:', fallbackData);
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