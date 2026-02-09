'use client';

import { useEffect } from 'react';

/**
 * Componente que carga utilidades de debugging en window.virtago
 * Solo se ejecuta en desarrollo
 */
export function DebugTools() {
  useEffect(() => {
    // Solo en desarrollo
    if (process.env.NODE_ENV !== 'production') {
      // @ts-ignore
      window.virtago = {
        async checkBackendEndpoint() {
          console.log('🔍 Verificando endpoint de backend...');
          try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/distributor/onboarding-status', {
              headers: {
                'Authorization': token ? `Bearer ${token}` : '',
              },
            });
            
            console.log('✅ Endpoint existe!');
            console.log('Status:', response.status);
            const data = await response.json();
            console.log('Respuesta:', data);
            return { exists: true, status: response.status, data };
          } catch (error: any) {
            console.log('❌ Endpoint no encontrado o error:', error.message);
            return { exists: false, error: error.message };
          }
        },
        
        simulateWizardCompleted() {
          const mockData = {
            products: { imported: 150, failed: 5 },
            priceLists: { imported: 3, failed: 0 },
            clients: { imported: 89, failed: 2 },
            completedAt: new Date().toISOString(),
          };
          localStorage.setItem('virtago_wizard_completed', JSON.stringify(mockData));
          console.log('✅ Estado de wizard simulado:', mockData);
          console.log('🔄 Recarga la página para ver los cambios');
          return mockData;
        },
        
        clearWizardState() {
          localStorage.removeItem('virtago_wizard_completed');
          console.log('🗑️ Estado eliminado. Recarga la página.');
        },
        
        getWizardState() {
          const data = localStorage.getItem('virtago_wizard_completed');
          const parsed = data ? JSON.parse(data) : null;
          console.log('📊 Estado actual:', parsed || 'No hay datos');
          return parsed;
        },
        
        updateWizardCounts(counts: { products?: number; priceLists?: number; clients?: number }) {
          const current = localStorage.getItem('virtago_wizard_completed');
          if (!current) {
            console.log('⚠️ No hay datos previos. Usa simulateWizardCompleted() primero.');
            return null;
          }
          
          const data = JSON.parse(current);
          if (counts.products) data.products.imported = counts.products;
          if (counts.priceLists) data.priceLists.imported = counts.priceLists;
          if (counts.clients) data.clients.imported = counts.clients;
          
          localStorage.setItem('virtago_wizard_completed', JSON.stringify(data));
          console.log('✅ Contadores actualizados:', data);
          console.log('🔄 Recarga la página para ver los cambios');
          return data;
        },
        
        async testDashboard() {
          console.log('🔍 Probando endpoint de dashboard...');
          try {
            const token = localStorage.getItem('token');
            if (!token) {
              console.error('❌ No hay token. Inicia sesión primero.');
              return null;
            }
            
            const response = await fetch('/api/distributor/dashboard-home', {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            
            if (response.ok) {
              const data = await response.json();
              console.log('✅ Dashboard data recibida:');
              console.table({
                'Ventas': `$${data.data.stats.sales.total}`,
                'Cambio Ventas': `${data.data.stats.sales.change}%`,
                'Órdenes': data.data.stats.orders.total,
                'Cambio Órdenes': `${data.data.stats.orders.change}%`,
                'Productos': data.data.stats.products.total,
                'Cambio Productos': `${data.data.stats.products.change}%`,
                'Clientes': data.data.stats.clients.total,
                'Cambio Clientes': `${data.data.stats.clients.change}%`,
                'Meses con datos': data.data.salesChart.data.length,
                'Actividades': data.data.recentActivity.length
              });
              console.log('📊 Datos completos:', data);
              return data;
            } else {
              console.error('❌ Error:', response.status, response.statusText);
              const error = await response.json();
              console.error('Detalle:', error);
              return null;
            }
          } catch (error: any) {
            console.error('❌ Error de red:', error.message);
            return null;
          }
        },
      };
      
      console.log(
        '%c🛠️ Herramientas de Debug Virtago cargadas',
        'background: #4f46e5; color: white; padding: 8px 12px; border-radius: 4px; font-weight: bold;'
      );
      console.log('Comandos disponibles:');
      console.log('  • virtago.checkBackendEndpoint() - Verifica si el endpoint existe');
      console.log('  • virtago.simulateWizardCompleted() - Simula wizard completado');
      console.log('  • virtago.getWizardState() - Ver estado actual');
      console.log('  • virtago.clearWizardState() - Limpiar estado');
      console.log('  • virtago.updateWizardCounts({ products: 150, clients: 89 }) - Actualizar contadores');
      console.log('  • virtago.testDashboard() - Probar endpoint de dashboard');
    }
  }, []);
  
  return null; // No renderiza nada
}
