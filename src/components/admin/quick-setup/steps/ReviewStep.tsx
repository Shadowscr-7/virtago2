import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { StepProps } from '../shared/types';
import { CheckCircle, Loader2 } from 'lucide-react';
import { WizardSummaryData } from '@/api';

interface WizardStepData {
  uploadedClients?: Array<{
    clientId: string;
    nombreCompleto?: string;
    razonSocial?: string;
    email?: string;
    telefono?: string;
    ciudad?: string;
  }>;
  matchedProducts?: Array<{
    codigoProducto: string;
    nombreProducto: string;
    backendProductId?: string;
    marca?: string;
  }>;
  uploadedPriceLists?: Array<{
    listPriceId: string;
    name: string;
    description?: string;
    isDefault?: boolean;
  }>;
  uploadedPrices?: Array<{
    productId: string;
    listPriceId?: string;
    price: number;
    currency?: string;
    productName?: string;
  }>;
  uploadedDiscounts?: Array<{
    discountId: string;
    name: string;
    description?: string;
    type: string;
    discountValue: number;
    currency: string;
    status?: string;
    customerType?: string;
    channel?: string;
    minPurchaseAmount?: number;
    maxDiscountAmount?: number;
    validFrom?: string;
    validTo?: string;
  }>;
}

export function ReviewStep({ onNext, onBack, themeColors, stepData }: StepProps) {
  const [wizardData, setWizardData] = useState<WizardSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedRef = useRef(false);
  
  // Cast stepData al tipo correcto
  const wizardStepData = stepData as WizardStepData | undefined;

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
        
        // 🔍 Contar registros creados en el wizard
        const clientsCount = wizardStepData?.uploadedClients?.length || 0;
        const productsCount = wizardStepData?.matchedProducts?.length || 0;
        const priceListsCount = wizardStepData?.uploadedPriceLists?.length || 0;
        const pricesCount = wizardStepData?.uploadedPrices?.length || 0;
        const discountsCount = wizardStepData?.uploadedDiscounts?.length || 0;
        
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

      {/* Datos Importados - Clientes */}
      {wizardStepData?.uploadedClients && wizardStepData.uploadedClients.length > 0 && (
        <div 
          className="p-6 rounded-xl"
          style={{ backgroundColor: `${themeColors.secondary}10` }}
        >
          <h4 className="text-lg font-semibold mb-4" style={{ color: themeColors.text.primary }}>
            👥 Clientes Importados ({wizardStepData.uploadedClients.length})
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
            {wizardStepData.uploadedClients.slice(0, 8).map((client, index) => (
              <motion.div
                key={client.clientId || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="p-3 rounded-lg border"
                style={{
                  backgroundColor: `${themeColors.surface}50`,
                  borderColor: `${themeColors.secondary}30`
                }}
              >
                <div className="font-medium text-sm" style={{ color: themeColors.text.primary }}>
                  {client.nombreCompleto || client.razonSocial || 'Sin nombre'}
                </div>
                <div className="text-xs mt-1" style={{ color: themeColors.text.secondary }}>
                  ID: {client.clientId}
                </div>
                {client.email && (
                  <div className="text-xs" style={{ color: themeColors.text.secondary }}>
                    {client.email}
                  </div>
                )}
                {client.ciudad && (
                  <div className="text-xs" style={{ color: themeColors.text.secondary }}>
                    📍 {client.ciudad}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          
          {wizardStepData.uploadedClients.length > 8 && (
            <div className="text-center py-2 mt-2">
              <span className="text-sm" style={{ color: themeColors.text.secondary }}>
                ... y {wizardStepData.uploadedClients.length - 8} clientes más
              </span>
            </div>
          )}
        </div>
      )}

      {/* Datos Importados - Productos Emparejados */}
      {wizardStepData?.matchedProducts && wizardStepData.matchedProducts.length > 0 && (
        <div 
          className="p-6 rounded-xl"
          style={{ backgroundColor: `${themeColors.accent}10` }}
        >
          <h4 className="text-lg font-semibold mb-4" style={{ color: themeColors.text.primary }}>
            🎁 Productos Emparejados ({wizardStepData.matchedProducts.length})
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
            {wizardStepData.matchedProducts.slice(0, 8).map((product, index) => (
              <motion.div
                key={product.codigoProducto || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="p-3 rounded-lg border"
                style={{
                  backgroundColor: `${themeColors.surface}50`,
                  borderColor: `${themeColors.accent}30`
                }}
              >
                <div className="font-medium text-sm" style={{ color: themeColors.text.primary }}>
                  {product.nombreProducto}
                </div>
                <div className="text-xs mt-1" style={{ color: themeColors.text.secondary }}>
                  Código: {product.codigoProducto}
                </div>
                {product.marca && (
                  <div className="text-xs" style={{ color: themeColors.text.secondary }}>
                    Marca: {product.marca}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          
          {wizardStepData.matchedProducts.length > 8 && (
            <div className="text-center py-2 mt-2">
              <span className="text-sm" style={{ color: themeColors.text.secondary }}>
                ... y {wizardStepData.matchedProducts.length - 8} productos más
              </span>
            </div>
          )}
        </div>
      )}

      {/* Datos Importados - Listas de Precios */}
      {wizardStepData?.uploadedPriceLists && wizardStepData.uploadedPriceLists.length > 0 && (
        <div 
          className="p-6 rounded-xl"
          style={{ backgroundColor: `${themeColors.primary}10` }}
        >
          <h4 className="text-lg font-semibold mb-4" style={{ color: themeColors.text.primary }}>
            💲 Listas de Precios ({wizardStepData.uploadedPriceLists.length})
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
            {wizardStepData.uploadedPriceLists.slice(0, 6).map((priceList, index) => (
              <motion.div
                key={priceList.listPriceId || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="p-3 rounded-lg border"
                style={{
                  backgroundColor: `${themeColors.surface}50`,
                  borderColor: `${themeColors.primary}30`
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm" style={{ color: themeColors.text.primary }}>
                      {priceList.name}
                    </div>
                    <div className="text-xs mt-1" style={{ color: themeColors.text.secondary }}>
                      ID: {priceList.listPriceId}
                    </div>
                  </div>
                  {priceList.isDefault && (
                    <span 
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{ backgroundColor: `${themeColors.secondary}20`, color: themeColors.secondary }}
                    >
                      Por defecto
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          
          {wizardStepData.uploadedPriceLists.length > 6 && (
            <div className="text-center py-2 mt-2">
              <span className="text-sm" style={{ color: themeColors.text.secondary }}>
                ... y {wizardStepData.uploadedPriceLists.length - 6} listas más
              </span>
            </div>
          )}
        </div>
      )}

      {/* Datos Importados - Precios */}
      {wizardStepData?.uploadedPrices && wizardStepData.uploadedPrices.length > 0 && (
        <div 
          className="p-6 rounded-xl"
          style={{ backgroundColor: `${themeColors.secondary}10` }}
        >
          <h4 className="text-lg font-semibold mb-4" style={{ color: themeColors.text.primary }}>
            💰 Precios Importados ({wizardStepData.uploadedPrices.length})
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
            {wizardStepData.uploadedPrices.slice(0, 8).map((price, index) => (
              <motion.div
                key={`${price.productId}-${price.listPriceId || 'default'}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="p-3 rounded-lg border"
                style={{
                  backgroundColor: `${themeColors.surface}50`,
                  borderColor: `${themeColors.secondary}30`
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm" style={{ color: themeColors.text.primary }}>
                      {price.productName || `Producto ${price.productId}`}
                    </div>
                    <div className="text-xs mt-1" style={{ color: themeColors.text.secondary }}>
                      {price.listPriceId ? `Lista: ${price.listPriceId}` : 'Precio base'}
                    </div>
                  </div>
                  <div className="font-bold text-lg" style={{ color: themeColors.primary }}>
                    {price.currency || 'COP'} {Number(price.price).toLocaleString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {wizardStepData.uploadedPrices.length > 8 && (
            <div className="text-center py-2 mt-2">
              <span className="text-sm" style={{ color: themeColors.text.secondary }}>
                ... y {wizardStepData.uploadedPrices.length - 8} precios más
              </span>
            </div>
          )}
        </div>
      )}

      {/* Datos Importados - Descuentos */}
      {wizardStepData?.uploadedDiscounts && wizardStepData.uploadedDiscounts.length > 0 && (
        <div 
          className="p-6 rounded-xl"
          style={{ backgroundColor: `${themeColors.primary}10` }}
        >
          <h4 className="text-lg font-semibold mb-4" style={{ color: themeColors.text.primary }}>
            📋 Descuentos Importados ({wizardStepData.uploadedDiscounts.length})
          </h4>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {wizardStepData.uploadedDiscounts.slice(0, 10).map((discount, index) => (
              <motion.div
                key={discount.discountId || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: `${themeColors.surface}50`,
                  borderColor: `${themeColors.secondary}30`
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm mb-1" style={{ color: themeColors.text.primary }}>
                      {discount.name}
                    </div>
                    <div className="text-xs mb-2" style={{ color: themeColors.text.secondary }}>
                      {discount.description || 'Sin descripción'}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span 
                        className="px-2 py-1 rounded"
                        style={{ backgroundColor: `${themeColors.primary}20`, color: themeColors.primary }}
                      >
                        ID: {discount.discountId}
                      </span>
                      <span 
                        className="px-2 py-1 rounded"
                        style={{ backgroundColor: `${themeColors.secondary}20`, color: themeColors.secondary }}
                      >
                        Tipo: {discount.type}
                      </span>
                      {discount.status && (
                        <span 
                          className="px-2 py-1 rounded"
                          style={{ 
                            backgroundColor: discount.status === 'active' ? '#10b98120' : '#f59e0b20',
                            color: discount.status === 'active' ? '#10b981' : '#f59e0b'
                          }}
                        >
                          {discount.status === 'active' ? 'Activo' : discount.status}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="font-bold text-lg" style={{ color: themeColors.primary }}>
                      {discount.type === 'percentage' 
                        ? `${discount.discountValue}%` 
                        : `${discount.currency} ${discount.discountValue}`
                      }
                    </div>
                    {discount.minPurchaseAmount && (
                      <div className="text-xs" style={{ color: themeColors.text.secondary }}>
                        Min: {discount.currency} {discount.minPurchaseAmount}
                      </div>
                    )}
                    {discount.maxDiscountAmount && (
                      <div className="text-xs" style={{ color: themeColors.text.secondary }}>
                        Max: {discount.currency} {discount.maxDiscountAmount}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Información adicional */}
                <div className="mt-3 pt-3 border-t flex flex-wrap gap-3 text-xs" style={{ borderColor: `${themeColors.secondary}20` }}>
                  {discount.customerType && (
                    <div style={{ color: themeColors.text.secondary }}>
                      <span className="font-medium">Cliente:</span> {discount.customerType}
                    </div>
                  )}
                  {discount.channel && (
                    <div style={{ color: themeColors.text.secondary }}>
                      <span className="font-medium">Canal:</span> {discount.channel}
                    </div>
                  )}
                  {discount.validFrom && (
                    <div style={{ color: themeColors.text.secondary }}>
                      <span className="font-medium">Válido desde:</span> {new Date(discount.validFrom).toLocaleDateString()}
                    </div>
                  )}
                  {discount.validTo && (
                    <div style={{ color: themeColors.text.secondary }}>
                      <span className="font-medium">Hasta:</span> {new Date(discount.validTo).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            
            {wizardStepData.uploadedDiscounts.length > 10 && (
              <div className="text-center py-2">
                <span className="text-sm" style={{ color: themeColors.text.secondary }}>
                  ... y {wizardStepData.uploadedDiscounts.length - 10} descuentos más
                </span>
              </div>
            )}
          </div>
        </div>
      )}

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