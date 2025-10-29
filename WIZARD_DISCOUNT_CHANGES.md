# Refactorización del Wizard - Descuentos (DiscountStep)

## 📅 Fecha: 2025-10-20

## ✅ Cambios Implementados

### 1. **Actualización de API** (`src/api/index.ts`)
- ✅ Endpoint `discounts.bulkCreate()` ahora soporta **FormData** y **JSON**
- ✅ Auto-detección de tipo: `data instanceof FormData`
- ✅ Rutas:
  - **Archivo**: `POST /discount/import` (multipart/form-data)
  - **JSON**: `POST /discount/` (application/json)
- ✅ Logs detallados de errores con status code y response data

### 2. **Refactorización de DiscountStep** (`src/components/admin/quick-setup/steps/DiscountStep.tsx`)

#### Estados Agregados:
```typescript
const [uploadMethod, setUploadMethod] = useState<UploadMethod | null>(null);
const [uploadedFile, setUploadedFile] = useState<File | null>(null);
```

#### Funciones Modificadas:

**`handleUpload()`**:
- ✅ SOLO carga y valida datos (no llama al API)
- ✅ Normaliza datos de backend → wizard format
- ✅ Valida método único (file XOR JSON)
- ✅ Muestra preview de descuentos cargados

**`handleConfirmAndContinue()` (NUEVA)**:
- ✅ Envía datos al backend en `POST /discount/` o `/discount/import`
- ✅ Soporta archivo (FormData) y JSON (Array)
- ✅ Logs detallados de request/response
- ✅ Manejo de errores con fallback

**`handleFileSelect()` (NUEVA)**:
- ✅ Callback para guardar referencia del archivo subido

#### UI Modificada:
- ✅ Botón "Confirmar y Continuar" aparece después de cargar datos
- ✅ Botón deshabilitado durante processing
- ✅ Animación con Framer Motion

### 3. **Archivo de Ejemplo Creado**
- ✅ `descuentos_backend_ejemplo.json` - Formato exacto del backend con:
  - `discount_id`
  - `discount_type`
  - `discount_value`
  - `min_purchase_amount`
  - `max_discount_amount`
  - `start_date` / `end_date`
  - `is_active`
  - `usage_limit` / `usage_limit_per_customer`
  - `conditions` (objeto con validaciones)
  - `applicable_to` (array de reglas)
  - `customFields` (objeto flexible)

## 🔄 Flujo Actualizado

### Antes:
```
1. Usuario sube archivo/JSON
2. handleUpload() valida datos
3. ❌ Llama INMEDIATAMENTE a api.admin.discounts.bulkCreate()
4. Muestra confirmación o error
```

### Ahora:
```
1. Usuario sube archivo/JSON
2. handleUpload() SOLO valida y muestra preview
3. Usuario revisa los datos cargados
4. ✅ Usuario hace clic en "Confirmar y Continuar"
5. handleConfirmAndContinue() llama a api.admin.discounts.bulkCreate()
6. Envía FormData (archivo) o JSON (array) según el método
7. Muestra confirmación o error
```

## 📊 Formato de Datos

### Backend Format (Input):
```json
{
  "name": "Black Friday 30%",
  "discount_id": "DISC-BF-001",
  "discount_type": "percentage",
  "discount_value": 30,
  "currency": "USD",
  "min_purchase_amount": 100,
  "max_discount_amount": 500,
  "start_date": "2024-11-24T00:00:00Z",
  "end_date": "2024-11-30T23:59:59Z",
  "is_active": true,
  "usage_limit": 5000,
  "usage_limit_per_customer": 3,
  "conditions": { ... },
  "applicable_to": [ ... ],
  "customFields": { ... }
}
```

### Wizard Format (Display):
```json
{
  "discountId": "DISC-BF-001",
  "name": "Black Friday 30%",
  "description": "Descuento especial Black Friday",
  "type": "percentage",
  "discountValue": 30,
  "currency": "USD",
  "validFrom": "2024-11-24T00:00:00Z",
  "validTo": "2024-11-30T23:59:59Z",
  "status": "active",
  "customerType": "all",
  "channel": "online",
  "category": "general",
  "maxDiscountAmount": 500,
  "minPurchaseAmount": 100,
  "usageLimit": 5000,
  "usageLimitPerCustomer": 3
}
```

### Conversión:
- `normalizeDiscountData()` - Backend → Wizard (para display)
- `convertToApiFormat()` - Wizard → Backend (para enviar)

## 🔍 Endpoints Actualizados

| Método | Endpoint | Content-Type | Datos |
|--------|----------|--------------|-------|
| POST | `/discount/` | application/json | `DiscountBulkData[]` |
| POST | `/discount/import` | multipart/form-data | `FormData` con archivo |

## 🎯 Testing

### Para probar con JSON:
1. Ir a Wizard → Descuentos
2. Seleccionar "Importar JSON"
3. Copiar contenido de `descuentos_backend_ejemplo.json`
4. Pegar en el textarea
5. Click "Cargar Datos"
6. Verificar preview de descuentos
7. Click "Confirmar y Continuar"
8. Verificar en Network tab (F12): `POST /discount/`

### Para probar con archivo:
1. Ir a Wizard → Descuentos
2. Seleccionar "Subir Archivo"
3. Subir archivo `.json`, `.csv` o `.xlsx`
4. Verificar preview
5. Click "Confirmar y Continuar"
6. Verificar en Network tab: `POST /discount/import`

## ⚠️ Validaciones

- ✅ Solo se puede usar UN método por sesión (file o JSON)
- ✅ Campos requeridos: `discount_id`, `name`, `type`, `currency`, `discount_value`
- ✅ Manejo de errores con mensajes user-friendly
- ✅ Fallback local si backend no está disponible

## 📝 Siguiente Paso

**ProductStep**: Aplicar el mismo patrón (load → preview → confirm → API)

## 🔗 Archivos Relacionados

- `src/api/index.ts` - Cliente API
- `src/components/admin/quick-setup/steps/DiscountStep.tsx` - Componente refactorizado
- `descuentos_backend_ejemplo.json` - Archivo de ejemplo

---

**Status**: ✅ Completado y testeado
**Patrones aplicados**: PriceListStep, PriceStep, **DiscountStep**
**Pendiente**: ProductStep
