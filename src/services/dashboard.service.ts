/**
 * Servicio de Dashboard para obtener datos del home
 */

import { api, DashboardData } from '@/api';

/**
 * Obtiene todos los datos del dashboard home
 * Incluye: stats, gráfico de ventas, actividad reciente
 */
export const getDashboardData = async (): Promise<DashboardData> => {
  try {
    const response = await api.admin.dashboard.getHomeData();
    
    // La respuesta del backend es: { success: true, data: { stats, salesChart, recentActivity } }
    // El httpClient lo envuelve como: { data: backendResponse, status: 200, success: true }
    // Entonces response.data = { success: true, data: {...} }
    
    // Caso 1: response.data ya tiene la estructura correcta (data anidado del backend)
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      const backendResponse = response.data as any;
      if (backendResponse.success && backendResponse.data) {
        return backendResponse.data as DashboardData;
      }
    }
    
    // Caso 2: response.data ya es directamente DashboardData (sin anidamiento)
    if (response.data && 'stats' in response.data && 'salesChart' in response.data) {
      return response.data as DashboardData;
    }
    
    throw new Error('Estructura de respuesta inesperada del servidor');
    
  } catch (error: any) {
    console.warn('⚠️ [Dashboard] Backend no disponible:', error?.status, error?.message);
    
    // Fallback con datos vacíos si falla
    console.log('📊 [Dashboard] Usando datos vacíos como fallback');
    return {
      stats: {
        sales: { total: 0, currency: 'USD', change: 0, period: 'month' },
        orders: { total: 0, change: 0, period: 'month' },
        products: { total: 0, change: 0, period: 'month' },
        clients: { total: 0, change: 0, period: 'month' },
      },
      salesChart: {
        period: 'monthly',
        year: new Date().getFullYear(),
        data: [],
      },
      recentActivity: [],
    };
  }
};

// Re-exportar tipos para fácil importación
export type { DashboardData, DashboardStats, SalesChartData, RecentActivity } from '@/api';
