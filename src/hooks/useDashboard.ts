/**
 * Hook personalizado para gestionar el estado del dashboard
 * Maneja loading, datos y errores automáticamente
 */

import { useState, useEffect } from 'react';
import { getDashboardData, DashboardData } from '@/services/dashboard.service';

interface UseDashboardReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseDashboardOptions {
  enabled?: boolean; // Si false, no carga datos automáticamente
}

export const useDashboard = (options: UseDashboardOptions = {}): UseDashboardReturn => {
  const { enabled = true } = options;
  
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!enabled) {
      console.log('[useDashboard] Fetch disabled, skipping...');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const dashboardData = await getDashboardData();
      setData(dashboardData);
    } catch (err: any) {
      const errorMessage = err?.message || 'Error al cargar dashboard';
      setError(errorMessage);
      console.error('[useDashboard] Error loading dashboard:', {
        message: errorMessage,
        err
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled]);

  return { 
    data, 
    loading, 
    error,
    refetch: fetchData 
  };
};
