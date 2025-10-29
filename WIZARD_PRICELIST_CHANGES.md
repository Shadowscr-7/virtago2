# Refactorización del PriceListStep - Wizard de Configuración Rápida

## Fecha
2024

## Problema Identificado

En el paso de **Listas de Precios** del wizard de configuración rápida, la API se estaba llamando inmediatamente al cargar el archivo o JSON (`handleUpload()`), en lugar de esperar a que el usuario confirme los datos con el botón "Continuar".

### Comportamiento Anterior (❌ Incorrecto)
```
Usuario sube archivo/JSON
  ↓
handleUpload() → Llama a api.admin.priceLists.bulkCreate()
  ↓
Se muestran los datos
  ↓
Usuario hace clic en "Continuar" → Solo pasa al siguiente paso
```

### Comportamiento Esperado (✅ Correcto)
```
Usuario sube archivo/JSON
  ↓
handleUpload() → Solo carga y previsualiza los datos
  ↓
Se muestran los datos para revisión
  ↓
Usuario hace clic en "Confirmar y Continuar" → Llama a api.admin.priceLists.bulkCreate()
  ↓
Datos insertados/actualizados en base de datos → Pasa al siguiente paso
```

## Cambios Implementados

### 1. Nuevo Estado para Validación de Método

```typescript
const [uploadMethod, setUploadMethod] = useState<'file' | 'json' | null>(null);
```

**Propósito**: Evitar que el usuario mezcle métodos de carga (archivo Y JSON). Solo puede usar UNO.

### 2. Refactorización de `handleUpload()`

**Antes**:
```typescript
const handleUpload = async (result: UploadResult<PriceList>) => {
  // Llamaba a api.admin.priceLists.bulkCreate() inmediatamente
  const apiResponse = await api.admin.priceLists.bulkCreate(priceListsForAPI);
  // ...
};
```

**Después**:
```typescript
const handleUpload = async (result: UploadResult<PriceList>) => {
  // 1. Validar método único
  if (uploadMethod && uploadMethod !== method) {
    alert('Ya has cargado datos mediante otro método');
    return;
  }
  
  // 2. Solo cargar y validar datos (SIN llamar API)
  setUploadMethod(method);
  const validatedData = result.data.map((list, index) => ({
    ...list,
    id: list.id || `PL_${Date.now()}_${index}`,
    products: Array.isArray(list.products) ? list.products : []
  }));
  
  setUploadedData(validatedData);
  console.log(`✅ ${validatedData.length} listas cargadas para revisión`);
};
```

### 3. Nueva Función `transformToAPIFormat()`

```typescript
const transformToAPIFormat = (priceLists: PriceList[]): PriceListBulkData[] => {
  return priceLists.map((list, index) => ({
    price_list_id: list.id || `PL_${Date.now()}_${index}`,
    name: list.name,
    description: list.description,
    currency: "USD",
    country: "Colombia",
    customer_type: "retail",
    channel: "online",
    start_date: new Date().toISOString(),
    status: "active",
    default: false,
    priority: index + 1,
    applies_to: "all",
    discount_type: "percentage",
    minimum_quantity: 1,
    maximum_quantity: 1000,
    tags: ["imported"],
    notes: `Lista importada: ${list.name}`
  }));
};
```

**Propósito**: Convertir el formato del wizard (`PriceList`) al formato esperado por el API (`PriceListBulkData`).

### 4. Nueva Función `handleConfirmAndContinue()`

```typescript
const handleConfirmAndContinue = async () => {
  if (uploadedData.length === 0) {
    alert('No hay listas de precios cargadas');
    return;
  }

  setIsProcessing(true);

  try {
    console.log('🚀 Enviando listas de precios al backend...');
    
    // Transformar datos al formato de API
    const priceListsForAPI = transformToAPIFormat(uploadedData);
    
    // Llamar al API para insertar/actualizar en base de datos
    const apiResponse = await api.admin.priceLists.bulkCreate(priceListsForAPI);
    
    if (apiResponse.success) {
      console.log('✅ Listas insertadas/actualizadas en BD');
      
      // Convertir respuesta al formato del wizard
      const processedData: PriceList[] = /* ... */;
      
      setIsProcessing(false);
      onNext({ uploadedPriceLists: processedData });
    } else {
      console.error('⚠️ API reportó errores:', apiResponse.message);
      setIsProcessing(false);
      alert(`Error del API: ${apiResponse.message}`);
    }
  } catch (error) {
    console.error('❌ Error enviando al backend:', error);
    setIsProcessing(false);
    alert(`Error: ${error.message}`);
  }
};
```

**Propósito**: Esta función se ejecuta cuando el usuario hace clic en "Confirmar y Continuar". Es aquí donde se llama al backend para insertar/actualizar las listas de precios en la base de datos.

### 5. Actualización del Botón "Continuar"

**Antes**:
```tsx
<motion.button
  onClick={() => onNext({ uploadedPriceLists: uploadedData })}
>
  Continuar
</motion.button>
```

**Después**:
```tsx
<motion.button
  onClick={handleConfirmAndContinue}
  disabled={isProcessing}
  style={{ 
    backgroundColor: isProcessing ? `${themeColors.primary}80` : themeColors.primary,
    cursor: isProcessing ? 'not-allowed' : 'pointer'
  }}
>
  {isProcessing ? (
    <>
      <span className="animate-spin">⏳</span>
      Enviando a BD...
    </>
  ) : (
    'Confirmar y Continuar'
  )}
</motion.button>
```

**Cambios**:
- ✅ Llama a `handleConfirmAndContinue()` en lugar de `onNext()` directamente
- ✅ Deshabilitado durante el procesamiento
- ✅ Muestra estado de carga ("Enviando a BD...")
- ✅ Texto actualizado: "Confirmar y Continuar"

## Endpoint del Backend

El componente utiliza el siguiente endpoint para enviar las listas de precios:

```typescript
// Frontend (src/api/index.ts)
api.admin.priceLists.bulkCreate(priceLists: PriceListBulkData[])

// HTTP Request
POST /admin/price-lists
Content-Type: application/json

// Body
{
  "priceLists": [
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
}
```

### Respuesta Esperada

```typescript
{
  "success": true,
  "message": "Bulk creation completed. 3 price lists created successfully",
  "results": {
    "totalProcessed": 3,
    "successCount": 3,
    "errorCount": 0,
    "priceLists": [ /* ... */ ],
    "validations": {
      "duplicateIds": [],
      "invalidCurrencies": [],
      "conflictingPriorities": [],
      "dateConflicts": []
    }
  }
}
```

## Flujo Completo de Usuario

1. **Usuario accede al wizard** → PriceListStep
2. **Usuario selecciona método** → "Subir Archivo" o "Importar JSON"
3. **Usuario carga datos** → handleUpload() carga y valida datos
4. **Sistema muestra preview** → Resumen de listas cargadas
5. **Usuario revisa datos** → Puede ver detalles de cada lista
6. **Usuario confirma** → Clic en "Confirmar y Continuar"
7. **Sistema envía al backend** → handleConfirmAndContinue() → api.admin.priceLists.bulkCreate()
8. **Backend procesa** → Inserta/actualiza en base de datos
9. **Sistema avanza** → Siguiente paso del wizard

## Ventajas de los Cambios

✅ **Consistencia**: Mismo patrón que ClientStep (carga → preview → confirma → API)  
✅ **Control del usuario**: El usuario decide cuándo enviar los datos  
✅ **Validación**: Solo permite UN método de carga (file XOR JSON)  
✅ **Feedback**: Muestra estado de procesamiento en el botón  
✅ **Manejo de errores**: Captura y muestra errores de forma clara  
✅ **Separación de responsabilidades**: Cargar datos ≠ Enviar al backend  

## Archivos Modificados

- `src/components/admin/quick-setup/steps/PriceListStep.tsx`

## Compatibilidad con Mock API

Si tienes `NEXT_PUBLIC_USE_MOCK_API=true` en `.env.local`, el sistema usará el mock del API (`src/api/mock-price-lists.ts`) en lugar del backend real. Esto permite desarrollo frontend sin depender del backend.

## Próximos Pasos

1. ✅ PriceListStep refactorizado
2. ⏳ Aplicar el mismo patrón a ProductStep (actualmente llama API en upload)
3. ⏳ Aplicar el mismo patrón a PriceStep (verificar implementación)
4. ⏳ Aplicar el mismo patrón a DiscountStep (verificar implementación)

## Notas

- El backend debe tener implementado el endpoint `POST /admin/price-lists` que acepte un array de `PriceListBulkData`
- Si el backend no está implementado, habilita Mock API en `.env.local`
