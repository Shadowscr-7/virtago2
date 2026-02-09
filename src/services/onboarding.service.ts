/**
 * Servicio de Onboarding para detectar si el distribuidor tiene datos cargados
 */

import { http } from '@/api';

export interface OnboardingDetails {
  products: {
    count: number;
    hasData: boolean;
  };
  clients: {
    count: number;
    hasData: boolean;
  };
  priceLists: {
    count: number;
    hasData: boolean;
  };
  prices: {
    count: number;
    hasData: boolean;
  };
  discounts: {
    count: number;
    hasData: boolean;
  };
}

export interface OnboardingStatus {
  hasData: boolean;
  details: OnboardingDetails;
  completionPercentage: number;
  nextSteps: string[];
  isFirstLogin: boolean;
}

/**
 * Obtiene el estado de onboarding del distribuidor
 */
export const getOnboardingStatus = async (): Promise<OnboardingStatus> => {
  try {
    const response = await http.get<OnboardingStatus>('/distributor/onboarding-status');
    return response.data;
  } catch (error: any) {
    console.warn('⚠️ [Onboarding] Backend no disponible:', error?.status, error?.message);
    
    // 🔧 MOCK INTELIGENTE - Lee del localStorage si el wizard se completó
    console.log('📋 [Onboarding] Usando datos del localStorage como fallback');
    
    // Verificar si el usuario completó el wizard
    let wizardData: any = null;
    try {
      const wizardDataRaw = localStorage.getItem('virtago_wizard_completed');
      if (wizardDataRaw) {
        wizardData = JSON.parse(wizardDataRaw);
      }
    } catch (err) {
      // Ignorar errores de parsing
    }
    
    // Si completó el wizard, simular que tiene datos
    if (wizardData?.completed && wizardData?.hasData) {
      const data = wizardData.data || {};
      
      // Contar registros del wizard
      const clientsCount = data.uploadedClients?.length || 0;
      const productsCount = data.matchedProducts?.length || 0;
      const priceListsCount = data.uploadedPriceLists?.length || 0;
      const pricesCount = data.uploadedPrices?.length || 0;
      const discountsCount = data.uploadedDiscounts?.length || 0;
      
      const hasClients = clientsCount > 0;
      const hasProducts = productsCount > 0;
      const hasPriceLists = priceListsCount > 0;
      const hasPrices = pricesCount > 0;
      const hasDiscounts = discountsCount > 0;
      
      // Calcular completitud
      const completedSteps = [
        hasProducts,
        hasClients,
        hasPriceLists,
        hasPrices,
        hasDiscounts
      ].filter(Boolean).length;
      
      const completionPercentage = Math.round((completedSteps / 5) * 100);
      
      // Determinar si tiene datos suficientes
      // ✅ Permitir dashboard si tiene productos Y clientes Y (precios O listas de precios)
      const hasData = hasProducts && hasClients && (hasPrices || hasPriceLists);
      
      return {
        hasData,
        details: {
          products: { count: productsCount, hasData: hasProducts },
          clients: { count: clientsCount, hasData: hasClients },
          priceLists: { count: priceListsCount, hasData: hasPriceLists },
          prices: { count: pricesCount, hasData: hasPrices },
          discounts: { count: discountsCount, hasData: hasDiscounts },
        },
        completionPercentage,
        nextSteps: hasData ? [] : getNextSteps(hasProducts, hasClients, hasPriceLists, hasPrices, hasDiscounts),
        isFirstLogin: false,
      };
    }
    
    // Si no completó el wizard, mostrar empty state
    const mockResponse: OnboardingStatus = {
      hasData: false,
      details: {
        products: { count: 0, hasData: false },
        clients: { count: 0, hasData: false },
        priceLists: { count: 0, hasData: false },
        prices: { count: 0, hasData: false },
        discounts: { count: 0, hasData: false },
      },
      completionPercentage: 0,
      nextSteps: [
        "Importa tus productos",
        "Crea listas de precios",
        "Registra tus clientes"
      ],
      isFirstLogin: true,
    };
    
    return mockResponse;
  }
};

/**
 * Helper para generar próximos pasos
 */
function getNextSteps(
  hasProducts: boolean,
  hasClients: boolean,
  hasPriceLists: boolean,
  hasPrices: boolean,
  hasDiscounts: boolean
): string[] {
  const steps: string[] = [];
  
  if (!hasProducts) steps.push("Importa tus productos");
  if (!hasPriceLists) steps.push("Crea listas de precios");
  if (!hasClients) steps.push("Registra tus clientes");
  if (!hasPrices && hasPriceLists) steps.push("Asigna precios a tus productos");
  if (!hasDiscounts) steps.push("Configura descuentos y promociones");
  
  return steps;
}

/**
 * Hook personalizado para usar el estado de onboarding (React Query o SWR opcional)
 */
export const useOnboardingStatus = () => {
  // Esta función puede ser extendida con React Query o SWR para caché automático
  // Por ahora, simplemente exponemos la función
  return { getOnboardingStatus };
};
