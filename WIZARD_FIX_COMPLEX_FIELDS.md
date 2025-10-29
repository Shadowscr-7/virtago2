# 🔧 FIX: Preservar Campos Complejos en Descuentos (conditions, applicable_to, customFields)

## 📅 Fecha: 2025-10-20

## 🐛 Problema Identificado

Al enviar descuentos con campos complejos como `conditions`, `applicable_to` y `customFields`, estos campos llegaban **vacíos** a la base de datos.

### Ejemplo del JSON del Usuario:
```json
{
  "name": "Black Friday 30%",
  "discount_id": "DISC-BF-2025-001",
  "conditions": {
    "customer_type": "all",
    "min_items": 2,
    "payment_methods": ["credit_card", "paypal"]
  },
  "applicable_to": [
    { "type": "all_products", "value": "*" },
    { "type": "category", "value": "electronics" }
  ],
  "customFields": {
    "campaign": "Black Friday 2025",
    "priority": "critical"
  }
}
```

### ❌ Lo que llegaba al backend:
```json
{
  "name": "Black Friday 30%",
  "discount_id": "DISC-BF-2025-001",
  "conditions": {},      // ❌ VACÍO
  "applicable_to": [],   // ❌ VACÍO
  "customFields": {}     // ❌ VACÍO
}
```

---

## 🔍 Causa Raíz

La función `convertToApiFormat()` en `DiscountStep.tsx` **NO estaba preservando** los campos complejos del JSON original:

### ANTES (❌ Código Problemático):
```typescript
const convertToApiFormat = (discounts: DiscountData[]): DiscountBulkData[] => {
  return discounts.map((discount: DiscountData) => ({
    discount_id: discount.discountId,
    name: discount.name,
    description: discount.description,
    // ... otros campos básicos ...
    // ❌ FALTABA: conditions, applicable_to, customFields
  }));
};
```

**Problema**: Solo mapeaba campos simples, descartando objetos anidados.

---

## ✅ Solución Implementada

### Estrategia:
1. Acceder al objeto original como `Record<string, unknown>`
2. **Preservar explícitamente** los campos complejos
3. Mapear tanto formato wizard (`camelCase`) como formato backend (`snake_case`)

### AHORA (✅ Código Corregido):
```typescript
const convertToApiFormat = (discounts: DiscountData[]): DiscountBulkData[] => {
  return discounts.map((discount: DiscountData) => {
    // 1️⃣ Acceder al objeto original sin restricciones de tipo
    const originalData = discount as unknown as Record<string, unknown>;
    
    // 2️⃣ Construir objeto base con campos requeridos
    const apiDiscount: Record<string, unknown> = {
      discount_id: discount.discountId || originalData.discount_id,
      name: discount.name,
      // ... mapeo de campos básicos con fallbacks ...
    };

    // 3️⃣ 🆕 CRÍTICO: Preservar campos complejos del JSON original
    if (originalData.conditions) {
      apiDiscount.conditions = originalData.conditions;
    }
    
    if (originalData.applicable_to) {
      apiDiscount.applicable_to = originalData.applicable_to;
    }
    
    if (originalData.customFields) {
      apiDiscount.customFields = originalData.customFields;
    }

    // 4️⃣ Preservar campos del backend en formato snake_case
    if (originalData.start_date) {
      apiDiscount.start_date = originalData.start_date;
    }
    
    if (originalData.end_date) {
      apiDiscount.end_date = originalData.end_date;
    }

    return apiDiscount as unknown as DiscountBulkData;
  });
};
```

---

## 🎯 Campos Preservados

### Campos Complejos:
- ✅ **`conditions`**: Objeto con reglas de aplicación
  - `customer_type`, `min_items`, `payment_methods`, etc.
- ✅ **`applicable_to`**: Array de reglas de productos/categorías
  - `[{ type, value }, ...]`
- ✅ **`customFields`**: Objeto flexible con metadatos
  - `campaign`, `priority`, `banner_url`, etc.

### Campos del Backend (snake_case):
- ✅ **`start_date`**: Fecha de inicio (alternativa a `valid_from`)
- ✅ **`end_date`**: Fecha de fin (alternativa a `valid_to`)
- ✅ **`discount_type`**: Tipo de descuento (alternativa a `type`)
- ✅ **`is_active`**: Estado activo (alternativa a `status`)

---

## 🔬 Logs de Debugging

### Agregados logs detallados:
```typescript
console.log('📄 Datos originales (primeros 2):', uploadedData.slice(0, 2));
console.log('📤 Datos convertidos para API (primeros 2):', apiData.slice(0, 2));
console.log('🔍 Verificando campos críticos del primer descuento:');
console.log('  - conditions:', apiData[0]?.conditions);
console.log('  - applicable_to:', apiData[0]?.applicable_to);
console.log('  - customFields:', apiData[0]?.customFields);
```

### Para verificar en consola:
1. Abrir F12 → Console
2. Cargar descuentos con JSON
3. Click "Confirmar y Continuar"
4. Buscar logs con emojis 📄, 📤, 🔍
5. Verificar que los campos NO estén vacíos

---

## 🧪 Testing

### Test 1: Verificar Conditions
```json
{
  "conditions": {
    "customer_type": "all",
    "min_items": 2,
    "payment_methods": ["credit_card", "paypal"]
  }
}
```
**Esperado**: `conditions` llega completo al backend

### Test 2: Verificar Applicable_to
```json
{
  "applicable_to": [
    { "type": "all_products", "value": "*" },
    { "type": "category", "value": "electronics" }
  ]
}
```
**Esperado**: Array con 2 elementos llega al backend

### Test 3: Verificar CustomFields
```json
{
  "customFields": {
    "campaign": "Black Friday 2025",
    "priority": "critical",
    "auto_apply": true
  }
}
```
**Esperado**: Objeto con 3 propiedades llega al backend

### Test 4: Verificar Formato Backend
```json
{
  "start_date": "2025-11-24T00:00:00Z",
  "end_date": "2025-11-30T23:59:59Z",
  "discount_type": "percentage",
  "is_active": true
}
```
**Esperado**: Campos snake_case preservados

---

## 📊 Comparación Antes/Después

| Campo | Antes | Después |
|-------|-------|---------|
| `conditions` | ❌ `{}` vacío | ✅ Objeto completo |
| `applicable_to` | ❌ `[]` vacío | ✅ Array completo |
| `customFields` | ❌ `{}` vacío | ✅ Objeto completo |
| `start_date` | ❌ No enviado | ✅ Preservado |
| `end_date` | ❌ No enviado | ✅ Preservado |
| `is_active` | ❌ No enviado | ✅ Preservado |

---

## 🔧 Archivos Modificados

- **`src/components/admin/quick-setup/steps/DiscountStep.tsx`**
  - Función `convertToApiFormat()` completamente refactorizada
  - Agregados logs de debugging
  - Preservación explícita de campos complejos

---

## ⚠️ Nota Importante

### Por qué usar `Record<string, unknown>`?

El tipo `DiscountData` del wizard tiene campos en `camelCase`:
```typescript
interface DiscountData {
  discountId: string;
  validFrom: string;
  maxDiscountAmount?: number;
}
```

Pero el backend espera campos en `snake_case`:
```json
{
  "discount_id": "...",
  "valid_from": "...",
  "max_discount_amount": 100
}
```

**Solución**: Usar `Record<string, unknown>` permite acceder a **ambos formatos** y preservar **todos los campos** del JSON original, sin restricciones de tipo.

---

## 🎯 Próximos Pasos

1. ✅ **Testing**: Verificar en base de datos que los campos llegan completos
2. ⏳ **PriceStep**: Revisar si tiene el mismo problema
3. ⏳ **PriceListStep**: Revisar si tiene el mismo problema
4. ⏳ **ProductStep**: Aplicar mismo fix preventivamente

---

## 📝 Comando para Testing

```bash
# 1. Iniciar backend
cd backend
npm start

# 2. Abrir frontend
# Wizard → Descuentos
# Pegar JSON del usuario
# Click "Cargar Datos"
# Click "Confirmar y Continuar"
# F12 → Console → Verificar logs
# F12 → Network → Ver payload de POST /discount/
```

---

**Status**: ✅ Fix implementado
**Testing**: ⏳ Pendiente verificación en base de datos
**Documentación**: ✅ Completa
