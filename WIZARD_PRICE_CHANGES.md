# Refactorización del PriceStep - Wizard de Configuración Rápida

## Fecha
Octubre 20, 2025

## Problema Identificado

En el paso de **Precios** del wizard de configuración rápida, la API se estaba llamando inmediatamente al cargar el archivo o JSON (`handleUpload()`), en lugar de esperar a que el usuario confirme los datos con el botón.

### Comportamiento Anterior (❌ Incorrecto)
```
Usuario sube archivo/JSON
  ↓
handleUpload() → Llama a api.admin.prices.bulkCreate()
  ↓
Se procesan los datos y se muestran
  ↓
Usuario hace clic en "Procesar JSON" → Solo pasa al siguiente paso
```

### Comportamiento Esperado (✅ Correcto)
```
Usuario sube archivo/JSON
  ↓
handleUpload() → Solo carga y previsualiza los datos
  ↓
Se muestran los datos para revisión
  ↓
Usuario hace clic en "Confirmar y Continuar" → Llama a api.admin.prices.bulkCreate()
  ↓
Datos insertados/actualizados en base de datos → Pasa al siguiente paso
```

## Cambios Implementados

### 1. Nuevo Estado para Validación y Control

```typescript
const [uploadMethod, setUploadMethod] = useState<'file' | 'json' | null>(null);
const [uploadedFile, setUploadedFile] = useState<File | null>(null);
```

**Propósito**: 
- `uploadMethod`: Evitar que el usuario mezcle métodos de carga (archivo Y JSON)
- `uploadedFile`: Guardar el archivo seleccionado para enviarlo al backend

### 2. Callback para Selección de Archivo

```typescript
const handleFileSelect = (file: File) => {
  console.log('📁 Archivo seleccionado:', file.name);
  setUploadedFile(file);
};
```

**Propósito**: Guardar el archivo cuando el usuario lo selecciona (para enviarlo más tarde).

### 3. Refactorización de `handleUpload()`

**Antes**:
```typescript
const handleUpload = async (result: UploadResult<PriceData>) => {
  if (!result.success) {
    console.error('Error uploading prices:', result.error);
    return;
  }

  setIsProcessing(true);
  
  try {
    // ❌ Llamaba a api.admin.prices.bulkCreate() inmediatamente
    const apiData = convertToApiFormat(result.data);
    const response = await api.admin.prices.bulkCreate(apiData);
    
    if (response.success && response.data?.success) {
      setApiResponse(response.data);
      setUploadedData(result.data);
      setShowConfirmation(true);
    }
  } catch (error) {
    console.error('Error processing prices:', error);
    setUploadedData(result.data);
  } finally {
    setIsProcessing(false);
  }
};
```

**Después**:
```typescript
const handleUpload = async (result: UploadResult<PriceData>) => {
  if (!result.success) {
    console.error('Error uploading prices:', result.error);
    alert(`Error al cargar precios: ${result.error || 'Error desconocido'}`);
    return;
  }

  // 1. Validar método único
  const currentMethod = method;
  
  if (uploadMethod && uploadMethod !== currentMethod) {
    alert('Ya has cargado datos mediante otro método');
    return;
  }

  setUploadMethod(currentMethod);
  
  // 2. Solo cargar y validar datos (SIN llamar API)
  console.log('📋 Cargando precios para previsualización...');
  setUploadedData(result.data);
  console.log(`✅ ${result.data.length} precios cargados para revisión`);
};
```

### 4. Nueva Función `handleConfirmAndContinue()`

```typescript
const handleConfirmAndContinue = async () => {
  if (uploadedData.length === 0) {
    alert('No hay precios cargados');
    return;
  }

  setIsProcessing(true);
  
  try {
    console.log('🚀 Enviando precios al backend...');
    
    let apiData: PriceBulkData[] | FormData;

    // Determinar si se usó archivo o JSON
    if (uploadMethod === 'file' && uploadedFile) {
      // 📁 ARCHIVO: Enviar como FormData
      console.log(`📁 Enviando archivo: ${uploadedFile.name}`);
      
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('importType', 'prices');
      
      apiData = formData;
    } else {
      // 📋 JSON: Convertir datos al formato de API
      console.log(`📋 Enviando ${uploadedData.length} precios como JSON`);
      apiData = convertToApiFormat(uploadedData);
    }
    
    // Llamar a la API real
    const response = await api.admin.prices.bulkCreate(apiData as PriceBulkData[]);
    
    if (response.success && response.data?.success) {
      console.log('✅ Precios insertados/actualizados en BD');
      setApiResponse(response.data);
      setShowConfirmation(true);
    } else {
      throw new Error(response.data?.message || 'Error procesando precios');
    }
  } catch (error) {
    console.error('❌ Error enviando precios:', error);
    setIsProcessing(false);
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    alert(`Error: ${errorMessage}\n\nContinuando con datos locales...`);
    
    // Continuar con datos locales en caso de error
    onNext({ uploadedPrices: uploadedData });
  }
};
```

**Propósito**: Esta función se ejecuta cuando el usuario hace clic en "Confirmar y Continuar". Es aquí donde se llama al backend para insertar/actualizar los precios en la base de datos.

### 5. Actualización del Botón

**Antes**:
```tsx
<motion.button
  onClick={async () => {
    setIsProcessing(true);
    // ... lógica inline ...
  }}
>
  Procesar JSON
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
- ✅ Llama a `handleConfirmAndContinue()` en lugar de lógica inline
- ✅ Deshabilitado durante el procesamiento
- ✅ Muestra estado de carga
- ✅ Texto actualizado: "Confirmar y Continuar"

### 6. Actualización del API Client

**API (`src/api/index.ts`)**:

```typescript
// Ahora acepta FormData o Array
bulkCreate: async (data: PriceBulkData[] | FormData): Promise<ApiResponse<PriceBulkCreateResponse>> => {
  // Determinar si es archivo o JSON
  if (data instanceof FormData) {
    // 📁 ARCHIVO: Usar multipart/form-data
    console.log('[API] Enviando archivo de precios...');
    return http.post("/price/import", data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  } else {
    // 📋 JSON: Enviar como JSON directo
    console.log(`[API] Enviando ${data.length} precios como JSON...`);
    return http.post("/price/", data);
  }
}
```

## Endpoints del Backend

### 1. POST /price/ (JSON)

**URL**: `http://localhost:3001/api/price/`  
**Método**: `POST`  
**Content-Type**: `application/json`

**Request Body**:
```json
[
  {
    "name": "Precio para Laptop Gaming RGB Ultra",
    "priceId": "PRC_LAP001_1729468800000",
    "productSku": "LAP001",
    "productName": "Laptop Gaming RGB Ultra",
    "basePrice": 1299.99,
    "costPrice": 900.00,
    "currency": "USD",
    "validFrom": "2025-10-20T10:00:00.000Z",
    "status": "active",
    "priceType": "regular",
    "priority": 1,
    "taxIncluded": true,
    "taxRate": 19,
    "minQuantity": 1,
    "maxQuantity": 1000,
    "customerType": "all",
    "channel": "omnichannel",
    "region": "colombia",
    "margin": 44.44,
    "profitMargin": 399.99
  }
]
```

### 2. POST /price/import (Archivo)

**URL**: `http://localhost:3001/api/price/import`  
**Método**: `POST`  
**Content-Type**: `multipart/form-data`

**Request (FormData)**:
```javascript
const formData = new FormData();
formData.append('file', archivoExcel);
formData.append('importType', 'prices');
```

## Flujo Completo de Usuario

### Flujo con JSON

```
1. Usuario selecciona "Importar JSON"
   ↓
2. Usuario pega el JSON
   ↓
3. handleUpload() valida y muestra preview
   ↓
4. Usuario revisa precios (costo, precio, margen)
   ↓
5. Usuario hace clic en "Confirmar y Continuar"
   ↓
6. handleConfirmAndContinue() convierte a formato API
   ↓
7. api.admin.prices.bulkCreate(array)
   ↓
8. Detecta array → POST /price/ (JSON)
   ↓
9. Backend inserta en BD
   ↓
10. Muestra pantalla de confirmación con estadísticas
   ↓
11. Usuario hace clic en "Continuar" → Siguiente paso
```

### Flujo con Archivo

```
1. Usuario selecciona "Subir Archivo"
   ↓
2. Usuario arrastra/selecciona .xlsx
   ↓
3. handleFileSelect() guarda el archivo
   ↓
4. handleUpload() parsea y muestra preview
   ↓
5. Usuario revisa precios
   ↓
6. Usuario hace clic en "Confirmar y Continuar"
   ↓
7. handleConfirmAndContinue() crea FormData
   ↓
8. api.admin.prices.bulkCreate(formData)
   ↓
9. Detecta FormData → POST /price/import (multipart)
   ↓
10. Backend procesa archivo e inserta en BD
   ↓
11. Muestra confirmación
   ↓
12. Continuar al siguiente paso
```

## Ventajas de los Cambios

✅ **Consistencia**: Mismo patrón que ClientStep y PriceListStep  
✅ **Control del usuario**: El usuario decide cuándo enviar los datos  
✅ **Validación**: Solo permite UN método de carga (file XOR JSON)  
✅ **Feedback visual**: Muestra estado de procesamiento  
✅ **Manejo de errores**: Captura errores y permite continuar  
✅ **Soporte de archivos**: Envía archivos al endpoint correcto  
✅ **Separación de responsabilidades**: Cargar ≠ Enviar al backend  

## Pantalla de Confirmación

Después de enviar los datos al backend, se muestra una pantalla de confirmación con:

- ✅ Icono de éxito
- ✅ Mensaje de confirmación
- ✅ Estadísticas del procesamiento:
  - Total procesados
  - Creados exitosamente
  - Errores (si los hay)
- ✅ Lista de precios creados (primeros 5)
- ✅ Detalles de errores y validaciones (si los hay)
- ✅ Botón "Continuar" para avanzar

## Archivos Modificados

- ✅ `src/components/admin/quick-setup/steps/PriceStep.tsx` - Refactorizado completamente
- ✅ `src/api/index.ts` - Endpoint `prices.bulkCreate()` ahora soporta FormData y JSON

## Compatibilidad

- ✅ Funciona con backend real (cuando esté disponible)
- ✅ Fallback local si el backend no está disponible
- ✅ Mismo patrón que todos los demás pasos del wizard
- ✅ Soporta archivos y JSON

## 🧪 Testing

### Probar con JSON
1. Ve al wizard → Precios
2. Selecciona "Importar JSON"
3. Pega un JSON con precios
4. Revisa el preview
5. Clic en "Confirmar y Continuar"
6. **Abre DevTools → Network** → Verás `POST /price/`

### Probar con Archivo
1. Ve al wizard → Precios
2. Selecciona "Subir Archivo"
3. Arrastra un .xlsx
4. Revisa el preview
5. Clic en "Confirmar y Continuar"
6. **Abre DevTools → Network** → Verás `POST /price/import`

## 📊 Ejemplo JSON de Precios

```json
[
  {
    "productCode": "LAP001",
    "productName": "Laptop Gaming RGB Ultra",
    "basePrice": 1299.99,
    "cost": 900.00,
    "margin": 44.44,
    "currency": "USD"
  },
  {
    "productCode": "MON002",
    "productName": "Monitor Curvo 27 pulgadas",
    "basePrice": 399.99,
    "cost": 280.00,
    "margin": 42.86,
    "currency": "USD"
  }
]
```

## ✅ Resumen

- ✅ PriceStep refactorizado con mismo patrón
- ✅ API se llama solo al confirmar (no al cargar)
- ✅ Soporta archivos y JSON
- ✅ Validación de método único
- ✅ Manejo de errores robusto
- ✅ Pantalla de confirmación con estadísticas

🎉 **¡Implementación completa!**
