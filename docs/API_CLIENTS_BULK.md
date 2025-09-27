# 📋 API de Clientes - Bulk Creation

## 🚀 Endpoint de Creación Masiva

### POST `/api/clients`

Crea múltiples clientes en una sola operación.

#### Headers necesarios:
```bash
Content-Type: application/json
Authorization: Bearer {token}
```

#### Formato del Request:
```typescript
ClientBulkData[] = [
  {
    email: string;                    // REQUERIDO
    firstName: string;                // REQUERIDO  
    lastName: string;                 // REQUERIDO
    phone: string;                    // REQUERIDO
    phoneOptional?: string;
    gender?: "M" | "F";
    documentType?: string;
    document?: string;
    customerClass?: string;
    customerClassTwo?: string;
    customerClassThree?: string;
    customerClassDist?: string;
    customerClassDistTwo?: string;
    latitude?: number;
    longitude?: number;
    status?: "A" | "N" | "I";        // A=Active, N=New, I=Inactive
    distributorCodes?: string[] | string;
    information?: {
      paymentMethodCode?: string;
      companyCode?: string;
      salesmanName?: string;
      visitDay?: string;
      pdv?: string;
      deliveryDay?: string;
      warehouse?: string;
      frequency?: string;
      priceList?: string;
      routeName?: string;
      withCredit?: boolean;
      distributorName?: string;
      sellerId?: string;
      routeId?: string;
      clientCode?: string;
      pdvname?: string;
      paymentTerm?: string;
    };
  }
]
```

#### Ejemplo de Response Exitoso:
```json
{
  "success": true,
  "message": "Bulk creation completed. 5 clients created successfully",
  "results": {
    "totalProcessed": 5,
    "successCount": 5,
    "errorCount": 0,
    "createdClients": [...],
    "errors": undefined
  }
}
```

#### Ejemplo de Response con Errores Parciales:
```json
{
  "success": true,
  "message": "Bulk creation completed. 3 clients created successfully, 2 errors found",
  "results": {
    "totalProcessed": 5,
    "successCount": 3,
    "errorCount": 2,
    "createdClients": [...],
    "errors": [
      {
        "index": 1,
        "client": {...},
        "error": "Email inválido o faltante"
      }
    ]
  }
}
```

## 🧪 Modo de Desarrollo

Para testing sin backend, configura:
```bash
NEXT_PUBLIC_USE_MOCK_API=true
```

Esto activará el mock service que simula el comportamiento real de la API.

## 🔗 Integración en el Frontend

```typescript
import { api } from '@/api';

// Usar la API
const result = await api.admin.clients.bulkCreate(clientsData);
if (result.success) {
  console.log('Clientes creados:', result.data.results.successCount);
}
```

## ✅ Estado de Implementación

- ✅ **Tipos TypeScript** - Definidos y documentados
- ✅ **Cliente API** - Función bulkCreate implementada
- ✅ **Mock Service** - Para desarrollo sin backend
- ✅ **Integración Frontend** - En ClientStep component
- ✅ **Validación** - Tipos y formato de datos
- ✅ **Manejo de Errores** - Respuestas parciales y completas
- ⏳ **Backend Implementation** - Pendiente

## 🔮 Próximos Pasos

1. Implementar el endpoint real en tu backend
2. Agregar validación de duplicados
3. Implementar rollback en caso de errores críticos
4. Agregar logs y monitoring
5. Tests unitarios e integración