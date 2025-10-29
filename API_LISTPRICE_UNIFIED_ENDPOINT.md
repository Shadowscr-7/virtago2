# API Endpoint Unificado: POST /listPrice

## Fecha
Octubre 20, 2025

## Descripción General

Se implementó un **endpoint unificado** en el frontend que maneja tanto **JSON directo** como **archivos (Excel/CSV/TXT)** para la importación masiva de listas de precios.

## 🎯 Objetivo

Crear un único punto de entrada (`api.admin.priceLists.bulkCreate`) que detecte automáticamente el tipo de dato recibido y lo envíe al endpoint correcto del backend:

- **JSON** → `POST /listPrice` (body JSON)
- **Archivo** → `POST /listPrice/import` (multipart/form-data)

## 📡 Endpoints del Backend

### 1. POST /listPrice/ (JSON Directo)

**URL**: `http://localhost:3001/api/listPrice`  
**Método**: `POST`  
**Content-Type**: `application/json`  
**Acepta**: Array de objetos o un solo objeto

#### Request Body (JSON)

```json
[
  {
    "price_list_id": "PL001",
    "name": "Lista Premium",
    "description": "Descripción de la lista",
    "distributorCode": "DIST01",
    "currency": "USD",
    "country": "USA",
    "region": "Norte",
    "customer_type": "wholesale",
    "channel": "online",
    "start_date": "2025-01-01T00:00:00.000Z",
    "end_date": "2025-12-31T23:59:59.000Z",
    "status": "active",
    "default": true,
    "priority": 1,
    "applies_to": "all",
    "discount_type": "percentage",
    "minimum_quantity": 10,
    "maximum_quantity": 1000,
    "custom_fields": {
      "season": "winter",
      "promotion": "black_friday"
    },
    "tags": ["premium", "wholesale"],
    "notes": "Notas adicionales"
  }
]
```

#### Campos

| Campo | Tipo | ¿Obligatorio? | Default | Descripción |
|-------|------|---------------|---------|-------------|
| `name` | string | ✅ SÍ | - | **ÚNICO CAMPO OBLIGATORIO** - Nombre de la lista |
| `price_list_id` | string | ❌ NO | auto-generado | ID único de la lista |
| `listPriceId` | string | ❌ NO | auto-generado | Alias de price_list_id (se genera automáticamente) |
| `description` | string | ❌ NO | `""` | Descripción de la lista |
| `distributorCode` | string | ❌ NO | usuario logueado | Se asigna automáticamente del usuario |
| `currency` | string | ❌ NO | `"USD"` | Moneda (USD, EUR, etc.) |
| `country` | string | ❌ NO | `""` | País |
| `region` | string | ❌ NO | `""` | Región geográfica |
| `customer_type` | string | ❌ NO | `"retail"` | Tipo de cliente: `retail`, `wholesale` |
| `channel` | string | ❌ NO | `"online"` | Canal: `online`, `offline`, `both` |
| `start_date` | string (ISO) | ❌ NO | fecha actual | Fecha de inicio de vigencia |
| `end_date` | string (ISO) | ❌ NO | `null` | Fecha de fin de vigencia (null = sin vencimiento) |
| `status` | string | ❌ NO | `"active"` | Estado: `active`, `inactive` |
| `default` | boolean | ❌ NO | `false` | Si es la lista por defecto |
| `priority` | number | ❌ NO | `1` | Prioridad de aplicación (menor número = mayor prioridad) |
| `applies_to` | string | ❌ NO | `"all"` | A qué aplica: `all`, `specific_products`, `specific_categories`, `promotional_items`, `premium_products` |
| `discount_type` | string | ❌ NO | `"percentage"` | Tipo de descuento: `percentage`, `fixed`, `tiered` |
| `minimum_quantity` | number | ❌ NO | `1` | Cantidad mínima para aplicar |
| `maximum_quantity` | number | ❌ NO | `null` | Cantidad máxima |
| `custom_fields` | object | ❌ NO | `{}` | Campos personalizados (JSON object) |
| `tags` | array | ❌ NO | `[]` | Etiquetas para categorización |
| `notes` | string | ❌ NO | `""` | Notas adicionales |
| `createdAt` | string (ISO) | ❌ NO | auto-generado | Timestamp de creación (automático) |
| `updatedAt` | string (ISO) | ❌ NO | auto-generado | Timestamp de actualización (automático) |
| `created_by` | string | ❌ NO | usuario logueado | Usuario que creó (asignado automáticamente) |

#### Response

```json
{
  "success": true,
  "message": "3 listas de precios creadas exitosamente",
  "results": {
    "totalProcessed": 3,
    "successCount": 3,
    "errorCount": 0,
    "priceLists": [
      {
        "price_list_id": "PL001",
        "name": "Lista Premium",
        "description": "...",
        "status": "active",
        "priority": 1,
        "tags": ["premium", "wholesale"],
        "createdAt": "2025-10-20T10:00:00.000Z",
        "updatedAt": "2025-10-20T10:00:00.000Z"
      }
    ],
    "validations": {
      "duplicateIds": [],
      "invalidCurrencies": [],
      "conflictingPriorities": [],
      "dateConflicts": []
    }
  }
}
```

### 2. POST /listPrice/import (Archivos)

**URL**: `http://localhost:3001/api/listPrice/import`  
**Método**: `POST`  
**Content-Type**: `multipart/form-data`  
**Acepta**: Archivos Excel (.xlsx, .xls), CSV (.csv), TXT (.txt)

#### Request (FormData)

```javascript
const formData = new FormData();
formData.append('file', archivoExcel);
formData.append('importType', 'priceLists');
```

#### Estructura del Archivo Excel/CSV

El archivo debe tener las siguientes columnas (headers):

```
name | price_list_id | description | distributorCode | currency | country | region | customer_type | channel | start_date | end_date | status | default | priority | applies_to | discount_type | minimum_quantity | maximum_quantity | tags | notes
```

**Ejemplo de fila en Excel**:

| name | price_list_id | description | currency | country | customer_type | channel | start_date | status | default | priority |
|------|---------------|-------------|----------|---------|---------------|---------|------------|--------|---------|----------|
| Lista Premium | PL001 | Lista para clientes premium | USD | USA | wholesale | online | 2025-01-01T00:00:00.000Z | active | true | 1 |

**Notas**:
- Solo `name` es obligatorio
- Las columnas vacías toman valores por defecto
- `tags` puede ser un string separado por comas: `"premium,wholesale,2025"`

#### Response

Misma estructura que el endpoint JSON.

## 💻 Implementación en el Frontend

### 1. API Client (`src/api/index.ts`)

```typescript
// 🆕 BULK CREATION - Crear múltiples listas de precios de una vez
// Acepta tanto JSON (array de objetos) como archivos (xlsx, csv, txt)
bulkCreate: async (data: PriceListBulkData[] | FormData): Promise<ApiResponse<PriceListBulkCreateResponse>> => {
  // En desarrollo, usar mock si no hay backend disponible y es JSON
  if (process.env.NODE_ENV === 'development' && 
      process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' &&
      !(data instanceof FormData)) {
    const { mockPriceListBulkCreate } = await import('./mock-price-lists');
    const mockResult = await mockPriceListBulkCreate(data as PriceListBulkData[]);
    return { success: true, data: mockResult, message: mockResult.message };
  }
  
  // Determinar si es archivo o JSON
  if (data instanceof FormData) {
    // 📁 ARCHIVO: Usar multipart/form-data
    console.log('[API] Enviando archivo de listas de precios...');
    return http.post("/listPrice/import", data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  } else {
    // 📋 JSON: Enviar como JSON directo
    console.log(`[API] Enviando ${data.length} listas de precios como JSON...`);
    return http.post("/listPrice", data);
  }
}
```

### 2. Componente PriceListStep

```typescript
// 🆕 Función para ENVIAR al backend cuando se confirma
const handleConfirmAndContinue = async () => {
  if (uploadedData.length === 0) {
    alert('No hay listas de precios cargadas');
    return;
  }

  setIsProcessing(true);

  try {
    console.log('🚀 Enviando listas de precios al backend...');
    
    let apiResponse;

    // Determinar si se usó archivo o JSON
    if (uploadMethod === 'file' && uploadedFile) {
      // 📁 ARCHIVO: Enviar como FormData
      console.log(`📁 Enviando archivo: ${uploadedFile.name}`);
      
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('importType', 'priceLists');
      
      apiResponse = await api.admin.priceLists.bulkCreate(formData);
      
    } else {
      // 📋 JSON: Enviar como array de objetos
      console.log(`📋 Enviando ${uploadedData.length} listas de precios como JSON`);
      
      // Transformar datos al formato de API
      const priceListsForAPI = transformToAPIFormat(uploadedData);
      
      apiResponse = await api.admin.priceLists.bulkCreate(priceListsForAPI);
    }
    
    if (apiResponse.success) {
      console.log('✅ Listas insertadas/actualizadas en BD');
      // ... pasar al siguiente paso
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
};
```

## 🔄 Flujo Completo

### Flujo con Archivo (Excel/CSV/TXT)

```
1. Usuario arrastra/selecciona archivo .xlsx
   ↓
2. handleFileSelect() guarda el archivo en estado (uploadedFile)
   ↓
3. handleUpload() parsea el archivo y muestra preview
   ↓
4. Usuario revisa datos y hace clic en "Confirmar y Continuar"
   ↓
5. handleConfirmAndContinue() detecta uploadMethod === 'file'
   ↓
6. Crea FormData con el archivo
   ↓
7. api.admin.priceLists.bulkCreate(formData)
   ↓
8. Detecta FormData → POST /listPrice/import (multipart/form-data)
   ↓
9. Backend procesa archivo e inserta en BD
   ↓
10. Respuesta → Avanza al siguiente paso
```

### Flujo con JSON

```
1. Usuario pega JSON en el textarea
   ↓
2. handleUpload() valida y parsea el JSON
   ↓
3. Muestra preview de las listas
   ↓
4. Usuario hace clic en "Confirmar y Continuar"
   ↓
5. handleConfirmAndContinue() detecta uploadMethod === 'json'
   ↓
6. transformToAPIFormat() convierte al formato del backend
   ↓
7. api.admin.priceLists.bulkCreate(array)
   ↓
8. Detecta array → POST /listPrice (JSON)
   ↓
9. Backend procesa JSON e inserta en BD
   ↓
10. Respuesta → Avanza al siguiente paso
```

## 🧪 Testing

### Probar con JSON (en Network verás POST /listPrice)

```bash
# En .env.local
NEXT_PUBLIC_USE_MOCK_API=false
```

1. Reinicia Next.js: `pnpm dev`
2. Ve al wizard → Listas de Precios
3. Selecciona "Importar JSON"
4. Pega el JSON de ejemplo
5. Clic en "Confirmar y Continuar"
6. **Abre DevTools → Network**
7. Deberías ver: `POST http://localhost:3001/api/listPrice`

### Probar con Archivo (en Network verás POST /listPrice/import)

1. Ve al wizard → Listas de Precios
2. Selecciona "Subir Archivo"
3. Arrastra un .xlsx con las columnas correctas
4. Clic en "Confirmar y Continuar"
5. **Abre DevTools → Network**
6. Deberías ver: `POST http://localhost:3001/api/listPrice/import`

## 📋 Ejemplo JSON Mínimo (solo name)

```json
[
  {
    "name": "Lista Básica 1"
  },
  {
    "name": "Lista Básica 2"
  }
]
```

Todos los demás campos se llenarán con valores por defecto.

## 📋 Ejemplo JSON Completo

```json
[
  {
    "price_list_id": "PL001",
    "name": "Lista Premium Invierno 2025",
    "description": "Lista especial para clientes premium durante temporada de invierno",
    "distributorCode": "DIST01",
    "currency": "USD",
    "country": "USA",
    "region": "Norte América",
    "customer_type": "wholesale",
    "channel": "online",
    "start_date": "2025-01-01T00:00:00.000Z",
    "end_date": "2025-03-31T23:59:59.000Z",
    "status": "active",
    "default": true,
    "priority": 1,
    "custom_fields": {
      "season": "winter",
      "promotion": "early_bird",
      "payment_terms": "Net 30"
    },
    "applies_to": "specific_products",
    "discount_type": "percentage",
    "minimum_quantity": 50,
    "maximum_quantity": 5000,
    "tags": ["premium", "wholesale", "winter", "2025"],
    "notes": "Aplicar descuento adicional del 5% si paga en los primeros 10 días"
  }
]
```

## 🔧 Archivos Modificados

- ✅ `src/api/index.ts` - Endpoint unificado `bulkCreate`
- ✅ `src/components/admin/quick-setup/steps/PriceListStep.tsx` - Soporte para archivo y JSON
- ✅ `.env.local` - Cambió `NEXT_PUBLIC_USE_MOCK_API=false`

## 🚀 Siguiente Paso: Implementar en el Backend

Tu backend debe tener estos dos endpoints:

### POST /listPrice (JSON)

```javascript
app.post('/listPrice', async (req, res) => {
  try {
    let priceLists = req.body;
    
    // Si es un solo objeto, convertir a array
    if (!Array.isArray(priceLists)) {
      priceLists = [priceLists];
    }
    
    // Validar que tengan el campo "name"
    for (const list of priceLists) {
      if (!list.name) {
        return res.status(400).json({
          success: false,
          message: 'El campo "name" es obligatorio'
        });
      }
    }
    
    // Completar campos con defaults
    const processedLists = priceLists.map((list, index) => ({
      price_list_id: list.price_list_id || `PL_${Date.now()}_${index}`,
      listPriceId: list.price_list_id || `PL_${Date.now()}_${index}`,
      name: list.name,
      description: list.description || '',
      distributorCode: list.distributorCode || req.user.distributorCode,
      currency: list.currency || 'USD',
      country: list.country || '',
      region: list.region || '',
      customer_type: list.customer_type || 'retail',
      channel: list.channel || 'online',
      start_date: list.start_date || new Date().toISOString(),
      end_date: list.end_date || null,
      status: list.status || 'active',
      default: list.default || false,
      priority: list.priority || 1,
      applies_to: list.applies_to || 'all',
      discount_type: list.discount_type || 'percentage',
      minimum_quantity: list.minimum_quantity || 1,
      maximum_quantity: list.maximum_quantity || null,
      custom_fields: list.custom_fields || {},
      tags: list.tags || [],
      notes: list.notes || '',
      created_by: req.user.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    
    // Guardar en base de datos
    // await db.priceLists.insertMany(processedLists);
    
    res.json({
      success: true,
      message: `${processedLists.length} listas de precios creadas exitosamente`,
      results: {
        totalProcessed: processedLists.length,
        successCount: processedLists.length,
        errorCount: 0,
        priceLists: processedLists,
        validations: {
          duplicateIds: [],
          invalidCurrencies: [],
          conflictingPriorities: [],
          dateConflicts: []
        }
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
```

### POST /listPrice/import (Archivo)

```javascript
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.post('/listPrice/import', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No se recibió ningún archivo'
      });
    }
    
    // Parsear el archivo Excel/CSV
    const priceLists = await parseExcelFile(file.path);
    
    // Procesar igual que el endpoint JSON
    const processedLists = priceLists.map(/* ... mismo código ... */);
    
    // Guardar en BD
    // await db.priceLists.insertMany(processedLists);
    
    // Eliminar archivo temporal
    fs.unlinkSync(file.path);
    
    res.json({
      success: true,
      message: `${processedLists.length} listas importadas exitosamente`,
      results: { /* ... */ }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
```

## ✅ Resumen

- ✅ Frontend detecta automáticamente si es JSON o archivo
- ✅ Usa el endpoint correcto según el tipo de dato
- ✅ Solo el campo `name` es obligatorio
- ✅ Todos los demás campos tienen valores por defecto
- ✅ Soporta creación masiva (array) o individual (objeto)
- ✅ Backend puede procesar ambos formatos con la misma lógica

🎉 **¡Implementación completa!**
