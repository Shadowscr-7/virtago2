// Mock service for testing client bulk creation during development
import { ClientBulkData, ClientBulkCreateResponse } from './index';

export const mockClientBulkCreate = (clients: ClientBulkData[]): Promise<ClientBulkCreateResponse> => {
  return new Promise((resolve, reject) => {
    // Simular delay de red
    setTimeout(() => {
      // Simular algunos errores ocasionales para testing
      const errors: { index: number; client: ClientBulkData; error: string }[] = [];
      
      clients.forEach((client, index) => {
        // Simular errores en algunos casos específicos
        if (!client.email || !client.email.includes('@')) {
          errors.push({
            index,
            client,
            error: 'Email inválido o faltante'
          });
        }
        if (!client.firstName) {
          errors.push({
            index,
            client,
            error: 'Nombre es requerido'
          });
        }
      });

      // Calcular estadísticas
      const totalProcessed = clients.length;
      const errorCount = errors.length;
      const successCount = totalProcessed - errorCount;

      // Simular que falla si más del 50% tiene errores
      if (errorCount > totalProcessed * 0.5) {
        reject(new Error('Demasiados errores en los datos. Revisa el formato.'));
        return;
      }

      // Respuesta exitosa
      const response: ClientBulkCreateResponse = {
        success: true,
        message: `Bulk creation completed. ${successCount} clients created successfully${errorCount > 0 ? `, ${errorCount} errors found` : ''}`,
        results: {
          totalProcessed,
          successCount,
          errorCount,
          createdClients: errorCount === 0 ? clients : clients.filter((_, index) => !errors.some(e => e.index === index)),
          errors: errorCount > 0 ? errors : undefined
        }
      };

      resolve(response);
    }, 2000 + Math.random() * 1000); // 2-3 segundos de delay simulado
  });
};

// Función para alternar entre mock y API real
export const shouldUseMockAPI = (): boolean => {
  // Usar mock en desarrollo si no hay token de auth o si está configurado
  return process.env.NODE_ENV === 'development' && 
         (process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || !localStorage.getItem('auth_token'));
};