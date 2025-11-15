# Integración de API de Descuentos - Vista de Detalle

## 📋 Resumen

Se ha completado la integración de la API REST para la visualización de detalles de descuentos individuales en el sistema de administración.

## 🔗 Endpoint Integrado

```
GET /api/discount/{discountId}
```

## 📂 Archivo Modificado

**`src/app/admin/descuentos/[id]/page.tsx`**

## 🔄 Cambios Implementados

### 1. Imports Agregados

```typescript
import http from "@/api/http-client";
import { toast } from "sonner";
```

### 2. Estructura de Respuesta de la API

La API responde con el siguiente formato:

```typescript
{
  success: boolean;
  message?: string;
  discount?: {
    discount_id: string;           // Código único del descuento
    name: string;                  // Nombre del descuento
    description: string;           // Descripción detallada
    type: string;                  // Tipo original (percentage, fixed, bogo)
    discount_value: number;        // Valor del descuento
    currency: string;              // Moneda (COP, USD, etc.)
    valid_from: string;            // Fecha inicio validez
    valid_to: string;              // Fecha fin validez
    status: string;                // Estado (active, inactive)
    priority: number;              // Prioridad del descuento
    is_cumulative: boolean;        // Si es acumulable con otros
    customer_type?: string;        // Tipo de cliente (all, vip, etc.)
    channel?: string;              // Canal de venta (all, online, etc.)
    region?: string;               // Región aplicable
    category?: string;             // Categoría del descuento
    tags?: string[];               // Etiquetas para filtrado
    notes?: string;                // Notas adicionales
    created_by?: string;           // Usuario creador
    conditions?: Record<string, unknown>;  // Condiciones complejas
    applicable_to?: Array<{        // Productos/categorías aplicables
      type: string;                // "product" o "category"
      value: string;               // ID del producto/categoría
    }>;
    customFields?: Record<string, unknown>;  // Campos personalizados
    start_date?: string;           // Fecha inicio (alternativa)
    end_date?: string;             // Fecha fin (alternativa)
    discount_type: string;         // Tipo de descuento normalizado
    is_active: boolean;            // Si está activo
    usage_count?: number;          // Veces usado
    usage_limit?: number;          // Límite de usos
    distributorCode?: string;      // Código del distribuidor
    discountId: string;            // UUID único
    createdAt: string;             // Timestamp creación
    updatedAt: string;             // Timestamp actualización
  };
}
```

### Ejemplo Real de Respuesta:

```json
{
  "success": true,
  "discount": {
    "discount_id": "DSC007",
    "name": "Clearance Storage 30% Off",
    "description": "30% off on select storage products - clearance sale",
    "type": "percentage",
    "discount_value": 30,
    "currency": "COP",
    "valid_from": "2025-10-01",
    "valid_to": "2025-10-31",
    "status": "active",
    "priority": 1,
    "is_cumulative": false,
    "customer_type": "all",
    "channel": "all",
    "region": "colombia",
    "category": "clearance",
    "tags": ["percentage", "clearance", "all"],
    "notes": "Descuento Clearance Storage 30% Off",
    "created_by": "admin@virtago.shop",
    "conditions": {
      "limited_stock": true,
      "while_supplies_last": true,
      "final_sale": true
    },
    "applicable_to": [
      { "type": "product", "value": "PROD004" },
      { "type": "product", "value": "PROD013" },
      { "type": "product", "value": "PROD020" }
    ],
    "customFields": {
      "campaign_name": "October Storage Clearance",
      "marketing_channel": "email,banner",
      "inventory_reduction": true,
      "no_returns": true,
      "urgency_messaging": "Limited Time - While Supplies Last!"
    },
    "start_date": "2025-10-01",
    "end_date": "2025-10-31",
    "discount_type": "percentage",
    "is_active": true,
    "distributorCode": "Dist01",
    "discountId": "a2adf8c4-410d-4df8-bd3e-c817f9775018",
    "createdAt": "2025-10-20T09:06:23.755Z",
    "updatedAt": "2025-10-20T09:06:23.755Z"
  }
}
```

### 3. Mapeo de Datos Backend → Frontend

#### 3.1 Mapeo de Tipo de Descuento

| Backend (`discount_type`) | Frontend (`tipo`) |
|---------------------------|-------------------|
| `percentage`              | `PORCENTAJE`      |
| `fixed`                   | `MONTO_FIJO`      |
| `bogo`                    | `COMPRA_LLEVA`    |

#### 3.2 Mapeo de Condiciones

La función extrae condiciones desde:

1. **`conditions` object:**
   - `min_purchase_amount` → `MONTO_MINIMO`
   - `min_items` → `CANTIDAD_MINIMA`
   - `customer_type` → `CLIENTE_VIP`
   - `limited_stock` → `CANTIDAD_MINIMA` (Stock limitado)
   - `while_supplies_last` → `CANTIDAD_MINIMA` (Hasta agotar stock)
   - `final_sale` → `CANTIDAD_MINIMA` (Venta final - No reembolsable)

2. **`applicable_to` array:**
   - `type: "category"` → `CATEGORIA`
   - `type: "product"` → `PRODUCTO`

Ejemplo de mapeo de condiciones de clearance:

```typescript
if (backendData.conditions.limited_stock) {
  condiciones.push({
    id: `cond_stock_${backendData.discountId}`,
    tipoCondicion: 'CANTIDAD_MINIMA',
    valorCondicion: 'limited',
    descripcion: 'Stock limitado'
  });
}

if (backendData.conditions.while_supplies_last) {
  condiciones.push({
    id: `cond_supplies_${backendData.discountId}`,
    tipoCondicion: 'CANTIDAD_MINIMA',
    valorCondicion: 'supplies_last',
    descripcion: 'Hasta agotar stock'
  });
}

if (backendData.conditions.final_sale) {
  condiciones.push({
    id: `cond_final_${backendData.discountId}`,
    tipoCondicion: 'CANTIDAD_MINIMA',
    valorCondicion: 'final_sale',
    descripcion: 'Venta final - No reembolsable'
  });
}
```

#### 3.3 Mapeo de Campos Principales

```typescript
const mappedDiscount: DiscountItem = {
  id: backendData.discountId,              // UUID único
  nombre: backendData.name,
  descripcion: backendData.description || 'Sin descripción',
  validoHasta: backendData.valid_to || backendData.end_date || '',
  acumulativo: backendData.is_cumulative || false,
  activo: backendData.is_active || backendData.status === 'active',
  tipo,
  valor: backendData.discount_value,
  codigoDescuento: backendData.discount_id,   // Código legible (DSC007)
  usoMaximo: backendData.usage_limit,
  usoActual: backendData.usage_count || 0,
  fechaCreacion: backendData.createdAt,
  fechaModificacion: backendData.updatedAt,
  condiciones,
  relaciones: [], // Actualmente vacío, expandible
  // Campos adicionales del backend
  currency: backendData.currency,              // "COP", "USD", etc.
  validFrom: backendData.valid_from || backendData.start_date,
  status: backendData.status,                  // "active", "inactive"
  priority: backendData.priority,              // Número de prioridad
  customerType: backendData.customer_type,     // "all", "vip", etc.
  channel: backendData.channel,                // "all", "online", etc.
  region: backendData.region,                  // "colombia", etc.
  category: backendData.category,              // "clearance", etc.
  tags: backendData.tags,                      // Array de strings
  notes: backendData.notes,                    // Notas adicionales
  createdBy: backendData.created_by,           // Email del creador
  distributorCode: backendData.distributorCode,
  customFields: backendData.customFields,      // Campos personalizados
};
```

### 4. Manejo de Estados

```typescript
✅ Loading State: setLoading(true/false)
✅ Success State: setDiscount(mappedDiscount)
✅ Error State: toast.error + setDiscount(null)
```

### 5. Logs para Debugging

```typescript
console.log(`🔍 Cargando descuento ID: ${discountId}`);
console.log('📦 Respuesta de la API:', response);
console.log('✅ Descuento cargado y mapeado:', mappedDiscount);
console.error('❌ Error al cargar descuento:', error);
```

## � Nuevas Secciones de UI

### 1. Información Adicional

Muestra campos complementarios del descuento en una grid responsiva:

- **Moneda**: Código de moneda (COP, USD, EUR, etc.)
- **Región**: Región geográfica aplicable
- **Canal**: Canal de ventas (all, online, retail, etc.)
- **Categoría**: Categoría del descuento
- **Tipo de Cliente**: Segmento de clientes (all, vip, etc.)
- **Código Distribuidor**: Identificador del distribuidor
- **Creado Por**: Email del usuario que creó el descuento
- **Prioridad**: Nivel de prioridad numérico
- **Válido Desde**: Fecha de inicio de validez

### 2. Tags/Etiquetas

Lista visual de etiquetas asociadas al descuento en formato pill/badge:

```typescript
["percentage", "clearance", "all"]
```

### 3. Notas

Campo de texto para notas adicionales o instrucciones especiales del descuento.

### 4. Campos Personalizados (Custom Fields)

Grid dinámico que muestra cualquier campo personalizado del backend:

- **Automáticamente formatea keys**: `campaign_name` → "Campaign Name"
- **Maneja diferentes tipos**: Boolean → "Sí"/"No", String → Texto
- **Layout responsive**: 1-2 columnas según tamaño de pantalla

Ejemplo con descuento de clearance:

| Campo                 | Valor                                |
|-----------------------|--------------------------------------|
| Campaign Name         | October Storage Clearance            |
| Marketing Channel     | email,banner                         |
| Inventory Reduction   | Sí                                   |
| No Returns            | Sí                                   |
| Urgency Messaging     | Limited Time - While Supplies Last!  |

### 5. Condiciones Especiales

Mapeo de condiciones de tipo clearance/liquidación:

- **limited_stock**: Muestra badge "Stock limitado"
- **while_supplies_last**: Badge "Hasta agotar stock"
- **final_sale**: Badge "Venta final - No reembolsable"

## �🎯 Funcionalidades Implementadas

### ✅ Completado

1. **Carga de datos desde API** - GET /discount/{discountId}
2. **Mapeo automático completo** - Todos los campos del backend → Frontend
3. **Manejo de errores** - Toast notifications
4. **Loading states** - Spinner mientras carga
5. **Logs de debugging** - Console logs con emojis
6. **Mapeo de condiciones** - Desde `conditions` y `applicable_to`
7. **Mapeo de tipos** - `percentage`, `fixed`, `bogo` → Frontend types
8. **Fallbacks** - Valores por defecto para campos opcionales
9. **Campos adicionales en UI**:
   - Moneda (currency)
   - Región (region)
   - Canal (channel)
   - Categoría (category)
   - Tipo de cliente (customerType)
   - Código distribuidor (distributorCode)
   - Creado por (createdBy)
   - Prioridad (priority)
   - Fecha inicio (validFrom)
   - Tags/Etiquetas
   - Notas
   - Campos personalizados (customFields)
10. **Condiciones especiales de clearance**:
    - Stock limitado
    - Hasta agotar stock
    - Venta final - No reembolsable

### 🔄 Comportamiento

- **Carga automática**: Al entrar a la página `/admin/descuentos/{id}`
- **Re-fetch**: Si cambia el `discountId` (navegación entre descuentos)
- **Error handling**: Si falla la API, muestra toast y limpia el estado
- **Empty state**: Si no hay data, muestra null

## 📊 Ejemplo de Flujo Completo

```
1. Usuario accede a /admin/descuentos/desc-123
   ↓
2. useEffect detecta discountId = "desc-123"
   ↓
3. setLoading(true)
   ↓
4. http.get("/discount/desc-123")
   ↓
5. API responde con data
   ↓
6. Mapeo de backend → frontend
   ↓
7. setDiscount(mappedDiscount)
   ↓
8. setLoading(false)
   ↓
9. UI muestra los datos del descuento
```

## 🔍 Verificación de Condiciones

La función es inteligente para extraer condiciones desde múltiples fuentes:

### Ejemplo de Response:

```json
{
  "conditions": {
    "limited_stock": true,
    "while_supplies_last": true,
    "final_sale": true
  },
  "applicable_to": [
    { "type": "product", "value": "PROD004" },
    { "type": "product", "value": "PROD013" },
    { "type": "product", "value": "PROD020" }
  ],
  "customFields": {
    "campaign_name": "October Storage Clearance",
    "marketing_channel": "email,banner",
    "inventory_reduction": true,
    "no_returns": true,
    "urgency_messaging": "Limited Time - While Supplies Last!"
  }
}
```

### Condiciones Mapeadas:

```typescript
[
  {
    id: "cond_stock_a2adf8c4-410d",
    tipoCondicion: "CANTIDAD_MINIMA",
    valorCondicion: "limited",
    descripcion: "Stock limitado"
  },
  {
    id: "cond_supplies_a2adf8c4-410d",
    tipoCondicion: "CANTIDAD_MINIMA",
    valorCondicion: "supplies_last",
    descripcion: "Hasta agotar stock"
  },
  {
    id: "cond_final_a2adf8c4-410d",
    tipoCondicion: "CANTIDAD_MINIMA",
    valorCondicion: "final_sale",
    descripcion: "Venta final - No reembolsable"
  },
  {
    id: "cond_prod_0",
    tipoCondicion: "PRODUCTO",
    valorCondicion: "PROD004",
    descripcion: "Producto: PROD004"
  },
  {
    id: "cond_prod_1",
    tipoCondicion: "PRODUCTO",
    valorCondicion: "PROD013",
    descripcion: "Producto: PROD013"
  },
  {
    id: "cond_prod_2",
    tipoCondicion: "PRODUCTO",
    valorCondicion: "PROD020",
    descripcion: "Producto: PROD020"
  }
]
```

### Custom Fields Mostrados en UI:

Los campos personalizados se muestran en una sección especial con formato automático:

- **Campaign Name**: October Storage Clearance
- **Marketing Channel**: email,banner
- **Inventory Reduction**: Sí
- **No Returns**: Sí
- **Urgency Messaging**: Limited Time - While Supplies Last!

## 🚀 Próximos Pasos

### Pendientes de Integración

1. **POST /api/discounts** - Guardar nuevos descuentos desde template
2. **PUT /api/discount/{discountId}** - Editar descuento existente
3. **DELETE /api/discount/{discountId}** - Eliminar descuento
4. **GET /api/discounts** - Ya implementado en list page

### Mejoras Sugeridas

1. **Mapeo de Relaciones** - Expandir el array `relaciones` si el backend lo soporta
2. **Validación de Response** - Agregar zod schema para validar estructura
3. **Cache** - Implementar react-query para cache y re-fetch automático
4. **Optimistic Updates** - Para edición, mostrar cambios antes de confirmar
5. **Error Messages** - Mensajes más específicos según tipo de error (404, 401, 500)

## 📝 Notas Técnicas

- **httpClient**: Usa axios wrapper con token automático
- **TypeScript**: Fully typed con interfaces para request/response
- **Error Handling**: Try-catch con toast notifications
- **Console Logs**: Emojis para fácil identificación en DevTools
- **Fallbacks**: Valores por defecto para evitar undefined

## ✅ Estado del Código

- ✅ No TypeScript errors
- ✅ No lint warnings (imports usados)
- ✅ Mapeo completo de todos los campos
- ✅ Error handling implementado
- ✅ Loading states funcionando
- ✅ Compatible con estructura existente de UI

---

**Última actualización**: Integración completada
**Archivo**: `src/app/admin/descuentos/[id]/page.tsx`
**Estado**: ✅ Production Ready
