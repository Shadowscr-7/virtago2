/**
 * Utilidades de Debug para Sistema de Onboarding
 * 
 * Estas funciones son útiles durante el desarrollo para:
 * - Simular que el wizard fue completado
 * - Limpiar el estado de onboarding
 * - Forzar recarga del dashboard
 */

/**
 * Simula que el wizard fue completado con datos
 * Útil si completaste el wizard ANTES de que existiera la funcionalidad de localStorage
 */
export function simulateWizardCompleted() {
  const mockWizardData = {
    completed: true,
    completedAt: new Date().toISOString(),
    hasData: true,
    data: {
      uploadedClients: Array(10).fill(null).map((_, i) => ({
        clientId: `CLI-${i + 1}`,
        nombreCompleto: `Cliente ${i + 1}`,
        email: `cliente${i + 1}@example.com`,
        ciudad: 'Ciudad Ejemplo'
      })),
      matchedProducts: Array(25).fill(null).map((_, i) => ({
        codigoProducto: `PROD-${i + 1}`,
        nombreProducto: `Producto ${i + 1}`,
        backendProductId: `prod-${i + 1}`,
        marca: 'Marca Ejemplo'
      })),
      uploadedPriceLists: [
        {
          listPriceId: 'LP-001',
          name: 'Lista General',
          description: 'Lista de precios general',
          isDefault: true
        },
        {
          listPriceId: 'LP-002',
          name: 'Lista Mayoristas',
          description: 'Precios especiales mayoristas',
          isDefault: false
        }
      ],
      uploadedPrices: Array(50).fill(null).map((_, i) => ({
        productId: `PROD-${(i % 25) + 1}`,
        listPriceId: i < 25 ? 'LP-001' : 'LP-002',
        price: (Math.random() * 10000 + 1000).toFixed(2),
        currency: 'ARS',
        productName: `Producto ${(i % 25) + 1}`
      })),
      uploadedDiscounts: [
        {
          discountId: 'DESC-001',
          name: 'Descuento por Volumen',
          description: '10% en compras mayores a $50000',
          type: 'PORCENTAJE',
          discountValue: 10,
          currency: 'ARS',
          status: 'active',
          minPurchaseAmount: 50000
        },
        {
          discountId: 'DESC-002',
          name: 'Promoción Nuevos Clientes',
          description: '15% de descuento para nuevos clientes',
          type: 'PORCENTAJE',
          discountValue: 15,
          currency: 'ARS',
          status: 'active'
        }
      ]
    }
  };

  try {
    localStorage.setItem('virtago_wizard_completed', JSON.stringify(mockWizardData));
    console.log('✅ Wizard simulado como completado con datos mock');
    console.log('📊 Datos guardados:', mockWizardData);
    console.log('🔄 Recarga la página para ver el dashboard con datos');
    return mockWizardData;
  } catch (error) {
    console.error('❌ Error simulando wizard completado:', error);
    return null;
  }
}

/**
 * Limpia el estado del wizard en localStorage
 * Útil para volver a ver el Empty State
 */
export function clearWizardState() {
  try {
    localStorage.removeItem('virtago_wizard_completed');
    console.log('🧹 Estado del wizard limpiado');
    console.log('🔄 Recarga la página para ver el Empty State');
    return true;
  } catch (error) {
    console.error('❌ Error limpiando estado del wizard:', error);
    return false;
  }
}

/**
 * Muestra el estado actual del wizard
 */
export function getWizardState() {
  try {
    const wizardDataRaw = localStorage.getItem('virtago_wizard_completed');
    if (!wizardDataRaw) {
      console.log('ℹ️ No hay estado del wizard guardado (Empty State se mostrará)');
      return null;
    }
    
    const wizardData = JSON.parse(wizardDataRaw);
    console.log('📊 Estado actual del wizard:', wizardData);
    
    // Mostrar resumen
    console.log('\n📈 Resumen de Datos:');
    console.log(`  👥 Clientes: ${wizardData.data?.uploadedClients?.length || 0}`);
    console.log(`  📦 Productos: ${wizardData.data?.matchedProducts?.length || 0}`);
    console.log(`  💲 Listas de Precios: ${wizardData.data?.uploadedPriceLists?.length || 0}`);
    console.log(`  💰 Precios: ${wizardData.data?.uploadedPrices?.length || 0}`);
    console.log(`  🎁 Descuentos: ${wizardData.data?.uploadedDiscounts?.length || 0}`);
    console.log(`  ✅ Completado: ${wizardData.completed ? 'Sí' : 'No'}`);
    console.log(`  📅 Fecha: ${wizardData.completedAt || 'N/A'}\n`);
    
    return wizardData;
  } catch (error) {
    console.error('❌ Error obteniendo estado del wizard:', error);
    return null;
  }
}

/**
 * Actualiza los contadores del wizard con valores personalizados
 */
export function updateWizardCounts(counts: {
  clients?: number;
  products?: number;
  priceLists?: number;
  prices?: number;
  discounts?: number;
}) {
  try {
    let wizardData: any = null;
    const wizardDataRaw = localStorage.getItem('virtago_wizard_completed');
    
    if (wizardDataRaw) {
      wizardData = JSON.parse(wizardDataRaw);
    } else {
      // Crear nuevo estado si no existe
      wizardData = {
        completed: true,
        completedAt: new Date().toISOString(),
        hasData: true,
        data: {}
      };
    }

    // Actualizar contadores
    if (counts.clients !== undefined) {
      wizardData.data.uploadedClients = Array(counts.clients).fill({}).map((_, i) => ({
        clientId: `CLI-${i + 1}`,
        nombreCompleto: `Cliente ${i + 1}`
      }));
    }

    if (counts.products !== undefined) {
      wizardData.data.matchedProducts = Array(counts.products).fill({}).map((_, i) => ({
        codigoProducto: `PROD-${i + 1}`,
        nombreProducto: `Producto ${i + 1}`
      }));
    }

    if (counts.priceLists !== undefined) {
      wizardData.data.uploadedPriceLists = Array(counts.priceLists).fill({}).map((_, i) => ({
        listPriceId: `LP-${String(i + 1).padStart(3, '0')}`,
        name: `Lista ${i + 1}`
      }));
    }

    if (counts.prices !== undefined) {
      wizardData.data.uploadedPrices = Array(counts.prices).fill({}).map((_, i) => ({
        productId: `PROD-${i + 1}`,
        price: Math.random() * 10000
      }));
    }

    if (counts.discounts !== undefined) {
      wizardData.data.uploadedDiscounts = Array(counts.discounts).fill({}).map((_, i) => ({
        discountId: `DESC-${String(i + 1).padStart(3, '0')}`,
        name: `Descuento ${i + 1}`
      }));
    }

    localStorage.setItem('virtago_wizard_completed', JSON.stringify(wizardData));
    console.log('✅ Contadores del wizard actualizados');
    console.log('📊 Nuevos valores:', counts);
    console.log('🔄 Recarga la página para ver los cambios');
    
    return wizardData;
  } catch (error) {
    console.error('❌ Error actualizando contadores:', error);
    return null;
  }
}

/**
 * Verifica si el endpoint del backend está implementado
 */
export async function checkBackendEndpoint() {
  console.log('🔍 Verificando si el endpoint está implementado en el backend...');
  
  try {
    const response = await fetch('/api/distributor/onboarding-status', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`📊 Status Code: ${response.status}`);

    if (response.status === 404) {
      console.log('❌ ENDPOINT NO IMPLEMENTADO');
      console.log('   El backend aún no tiene este endpoint');
      console.log('   📄 Envía ONBOARDING_STATUS_ENDPOINT.md al equipo de backend');
      return false;
    }

    if (response.status === 401 || response.status === 403) {
      console.log('🔒 ERROR DE AUTENTICACIÓN');
      console.log('   Token inválido o sin permisos');
      console.log('   Haz login nuevamente');
      return false;
    }

    if (response.ok) {
      const data = await response.json();
      console.log('✅ ENDPOINT IMPLEMENTADO Y FUNCIONANDO!');
      console.log('📦 Datos del backend:', data);
      console.log('\n🎉 El sistema ahora usa datos reales del backend');
      console.log('🗑️ Ya no necesitas los datos mockeados de localStorage');
      return true;
    }

    console.log(`⚠️ Respuesta inesperada: ${response.status}`);
    const text = await response.text();
    console.log('Respuesta:', text);
    return false;

  } catch (error: any) {
    console.error('❌ Error de red:', error.message);
    console.log('\n💡 Posibles causas:');
    console.log('  1. Backend no está corriendo');
    console.log('  2. CORS no configurado');
    console.log('  3. URL incorrecta');
    return false;
  }
}

// Exponer funciones en window para usar desde la consola del navegador
if (typeof window !== 'undefined') {
  (window as any).virtago = {
    simulateWizardCompleted,
    clearWizardState,
    getWizardState,
    updateWizardCounts,
    checkBackendEndpoint,
  };
  
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║             🛠️  Virtago Debug Utils Loaded                     ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  Usa estas funciones desde la consola del navegador:          ║
║                                                                ║
║  virtago.checkBackendEndpoint()                               ║
║  → Verifica si el backend ya implementó el endpoint           ║
║                                                                ║
║  virtago.simulateWizardCompleted()                            ║
║  → Simula wizard completado con datos mock                    ║
║                                                                ║
║  virtago.clearWizardState()                                   ║
║  → Limpia estado para ver Empty State                        ║
║                                                                ║
║  virtago.getWizardState()                                     ║
║  → Muestra estado actual del wizard                           ║
║                                                                ║
║  virtago.updateWizardCounts({ clients: 50, products: 100 })  ║
║  → Actualiza contadores manualmente                           ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);
}

export default {
  simulateWizardCompleted,
  clearWizardState,
  getWizardState,
  updateWizardCounts,
  checkBackendEndpoint,
};
