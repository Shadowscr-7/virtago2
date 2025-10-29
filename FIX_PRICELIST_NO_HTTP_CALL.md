# FIX: PriceListStep no llamaba al endpoint HTTP

## Fecha
Octubre 20, 2025

## Problema Reportado

Al hacer clic en "Confirmar y Continuar" en el paso de **Listas de Precios** del wizard, **NO aparecía ninguna llamada HTTP en el Network del navegador**.

### Síntomas
- ✅ El botón "Confirmar y Continuar" sí ejecutaba `handleConfirmAndContinue()`
- ✅ La función llamaba a `api.admin.priceLists.bulkCreate()`
- ❌ **NO se veía ninguna petición HTTP en Network**
- ❌ Los datos no se enviaban al backend

## Causa Raíz

El método `api.admin.priceLists.bulkCreate()` estaba **implementado directamente en el archivo `src/api/index.ts` con código simulado**, en lugar de llamar al endpoint HTTP del backend.

### Código Problemático (ANTES)

```typescript
// src/api/index.ts - INCORRECTO ❌
bulkCreate: async (priceLists: PriceListBulkData[]): Promise<ApiResponse<PriceListBulkCreateResponse>> => {
  console.log(`[API] Procesando ${priceLists.length} listas de precios...`);
  
  // ❌ Simular procesamiento en desarrollo (NO LLAMABA AL BACKEND)
  await new Promise(resolve => setTimeout(resolve, 2500));
  
  // ❌ Crear respuesta simulada localmente
  const mockResult: PriceListBulkCreateResponse = {
    success: true,
    message: `Bulk creation completed. ${priceLists.length} price lists created successfully`,
    results: {
      totalProcessed: priceLists.length,
      successCount: priceLists.length,
      errorCount: 0,
      priceLists: priceLists.map(priceList => ({
        ...priceList,
        status: 'active' as const,
        priority: priceList.priority || 1,
        tags: priceList.tags || []
      })),
      validations: {
        duplicateIds: [],
        invalidCurrencies: [],
        conflictingPriorities: [],
        dateConflicts: []
      }
    }
  };
  
  // ❌ Retornar resultado simulado (SIN llamar a http.post())
  return { success: true, data: mockResult, message: mockResult.message };
},
```

**Problema**: El código nunca llamaba a `http.post()`, por lo que no había ninguna petición HTTP.

## Solución Implementada

Se refactorizó el método `bulkCreate` siguiendo el **mismo patrón usado en `clients.bulkCreate`**:

### Código Correcto (DESPUÉS)

```typescript
// src/api/index.ts - CORRECTO ✅
bulkCreate: async (priceLists: PriceListBulkData[]): Promise<ApiResponse<PriceListBulkCreateResponse>> => {
  // En desarrollo, usar mock si no hay backend disponible
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK_API === 'true') {
    const { mockPriceListBulkCreate } = await import('./mock-price-lists');
    const mockResult = await mockPriceListBulkCreate(priceLists);
    return { success: true, data: mockResult, message: mockResult.message };
  }
  
  // ✅ Usar API real - Llama al backend vía HTTP
  return http.post("/price-lists", priceLists);
},
```

### Cambios Clave

1. **Lógica condicional**:
   - Si `NEXT_PUBLIC_USE_MOCK_API=true` → Usa mock (sin llamada HTTP real)
   - Si `NEXT_PUBLIC_USE_MOCK_API=false` o no está definida → **Llama al backend real**

2. **Llamada HTTP real**:
   ```typescript
   return http.post("/price-lists", priceLists);
   ```
   Esto hace una petición POST a `http://localhost:3001/api/price-lists` (según tu baseURL)

3. **Mock separado**:
   - El código mock se movió a `src/api/mock-price-lists.ts`
   - Solo se usa en desarrollo y si está habilitado explícitamente

## Actualización del Mock

También se actualizó el archivo `src/api/mock-price-lists.ts` para usar los tipos correctos:

### Antes
```typescript
// Definir tipos localmente para evitar importación circular
interface PriceListBulkData {
  id: string;
  name: string;
  // ... (tipos diferentes al archivo principal)
}
```

### Después
```typescript
// Importar tipos del archivo principal para consistencia
import type { PriceListBulkData, PriceListBulkCreateResponse } from './index';
```

Esto garantiza que el mock use **exactamente los mismos tipos** que el API real.

## Configuración para Desarrollo

### Opción 1: Usar Backend Real (Recomendado)

```bash
# .env.local
NEXT_PUBLIC_USE_MOCK_API=false
# O simplemente NO definir la variable
```

**Resultado**: Todas las llamadas irán al backend en `http://localhost:3001/api`

### Opción 2: Usar Mock API (Solo Frontend)

```bash
# .env.local
NEXT_PUBLIC_USE_MOCK_API=true
```

**Resultado**: Las llamadas usarán el mock, NO habrá peticiones HTTP reales

## Verificación en Network

Ahora, al hacer clic en "Confirmar y Continuar" en PriceListStep, deberías ver:

### Con Mock API Deshabilitado (`NEXT_PUBLIC_USE_MOCK_API=false`)
```
Network Tab:
POST http://localhost:3001/api/price-lists
Request Payload: [array de PriceListBulkData]
Status: 200 OK (si el backend responde)
Status: 404/500 (si el backend no existe o tiene error)
```

### Con Mock API Habilitado (`NEXT_PUBLIC_USE_MOCK_API=true`)
```
Network Tab:
(Sin peticiones HTTP - todo se simula en memoria)
Console:
"[MOCK] Procesando 3 listas de precios..."
```

## Endpoint del Backend

El frontend ahora llama a:

```
POST /price-lists
Content-Type: application/json

Body:
[
  {
    "price_list_id": "PL_001",
    "name": "Lista Retail",
    "description": "...",
    "currency": "USD",
    "country": "Colombia",
    "customer_type": "retail",
    "channel": "online",
    "start_date": "2024-01-01T00:00:00.000Z",
    "status": "active",
    "default": false,
    "priority": 1,
    "applies_to": "all",
    "discount_type": "percentage",
    "minimum_quantity": 1,
    "maximum_quantity": 1000,
    "tags": ["imported"],
    "notes": "Lista importada: Lista Retail"
  }
]
```

**Nota**: Tu backend debe implementar este endpoint para recibir las listas de precios.

## Patrón Consistente

Ahora todos los métodos `bulkCreate` siguen el mismo patrón:

```typescript
// ✅ Patrón consistente para todos los bulkCreate
bulkCreate: async (items: ItemType[]): Promise<ApiResponse<BulkCreateResponse>> => {
  // Mock en desarrollo si está habilitado
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK_API === 'true') {
    const { mockFunction } = await import('./mock-file');
    const mockResult = await mockFunction(items);
    return { success: true, data: mockResult, message: mockResult.message };
  }
  
  // API real
  return http.post("/endpoint", items);
}
```

### Métodos que siguen este patrón
- ✅ `api.admin.clients.bulkCreate()`
- ✅ `api.admin.priceLists.bulkCreate()`
- ⏳ `api.admin.products.bulkCreate()` (verificar)
- ⏳ `api.admin.prices.bulkCreate()` (verificar)

## Testing

### Para probar con backend real:
1. Asegúrate de que tu backend esté corriendo en `http://localhost:3001`
2. Verifica que el endpoint `POST /price-lists` esté implementado
3. En `.env.local` establece `NEXT_PUBLIC_USE_MOCK_API=false` o borra la variable
4. Recarga la aplicación Next.js
5. Importa listas de precios en el wizard
6. Haz clic en "Confirmar y Continuar"
7. Abre DevTools → Network → Deberías ver la petición POST

### Para probar con mock:
1. En `.env.local` establece `NEXT_PUBLIC_USE_MOCK_API=true`
2. Recarga la aplicación
3. Importa listas de precios
4. Haz clic en "Confirmar y Continuar"
5. NO verás peticiones en Network, pero funcionará localmente

## Archivos Modificados

- `src/api/index.ts` - Refactorizado `priceLists.bulkCreate()`
- `src/api/mock-price-lists.ts` - Actualizado imports de tipos

## Próximos Pasos

1. ✅ `priceLists.bulkCreate()` ahora llama al backend
2. ⏳ Verificar que `products.bulkCreate()` siga el mismo patrón
3. ⏳ Verificar que `prices.bulkCreate()` siga el mismo patrón
4. ⏳ Implementar endpoints en el backend para recibir los datos

## Nota Importante

**Si tu backend aún no está listo**, puedes seguir desarrollando el frontend con `NEXT_PUBLIC_USE_MOCK_API=true`. Cuando el backend esté disponible, simplemente cambia a `false` y todo funcionará sin cambios en el código.
