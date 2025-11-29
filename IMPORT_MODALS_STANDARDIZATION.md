# Sistema de Importación Estandarizado

## 📋 Descripción General

Se ha implementado un sistema de importación consistente para todas las secciones del panel de administración, siguiendo el mismo patrón de diseño y funcionalidad.

## 🎯 Modales Implementados

### 1. ProductImportModal (Referencia)
**Ubicación:** `src/components/admin/products/ProductImportModal.tsx`
**Estado:** ✅ Implementado (Referencia)
**Integrado en:** `src/app/admin/productos/page.tsx`

### 2. PriceImportModal
**Ubicación:** `src/components/admin/precios/price-import-modal.tsx`
**Estado:** ✅ Implementado
**Integrado en:** `src/app/admin/precios/page.tsx`

### 3. PriceListImportModal
**Ubicación:** `src/components/admin/listas-precios/price-list-import-modal.tsx`
**Estado:** ✅ Implementado
**Integrado en:** `src/app/admin/listas-precios/page.tsx`

## 🎨 Características Comunes

### Diseño Unificado
- **Dos tabs de importación:**
  - "Subir Archivo" - Soporta CSV, XLSX, JSON
  - "Importar JSON" - Pega JSON directamente

- **Botón de descarga de ejemplo:**
  - Descarga archivo JSON con datos de ejemplo
  - Muestra estructura correcta con valores reales

- **Drag & Drop Area (Modo Archivo):**
  - Área visual para arrastrar archivos
  - Botón de selección manual
  - Indicador del archivo seleccionado

- **Editor JSON (Modo JSON):**
  - Textarea con monospace font
  - Placeholder con ejemplo completo
  - Validación en tiempo real

### Validación y Feedback
- **Validación en tiempo real:**
  - ✅ CheckCircle verde cuando JSON es válido
  - ❌ AlertCircle rojo con lista de errores
  - Contador de registros detectados

- **Mensajes de error:**
  - Errores de sintaxis JSON
  - Campos faltantes
  - Tipos de datos incorrectos

- **Notificaciones toast:**
  - Éxito: muestra cantidad de registros importados
  - Error: muestra mensaje descriptivo

### Sección de Tips
- Lista de campos requeridos
- Ejemplo de valores válidos
- Campos opcionales con valores esperados

## 📊 Formato de Datos

### Productos (ProductImportModal)
```json
{
  "sku": "PROD-001",
  "name": "Producto Ejemplo",
  "price": 100.00,
  "category": "Electrónica"
}
```

### Precios (PriceImportModal)
```json
{
  "name": "Precio Premium",
  "priceId": "PRICE_001",
  "productSku": "PROD-001",
  "basePrice": 150.00,
  "currency": "USD",
  "validFrom": "2024-01-01",
  "validTo": "2024-12-31"
}
```

**Transformación al API:**
- `priceId` → campo requerido en el API
- `name` → campo requerido en el API
- Valores por defecto: `currency: "USD"`, `status: "active"`

### Listas de Precios (PriceListImportModal)
```json
{
  "name": "Lista Premium",
  "priceListId": "PREMIUM_001",
  "currency": "USD",
  "status": "active",
  "description": "Lista para clientes premium",
  "validFrom": "2024-01-01",
  "validTo": "2024-12-31",
  "country": "UY",
  "customerType": "premium",
  "channel": "online"
}
```

**Transformación al API:**
- `priceListId` → `price_list_id`
- `validFrom` → `start_date`
- `validTo` → `end_date`
- `customerType` → `customer_type`
- Valores por defecto: `country: "UY"`, `customer_type: "all"`, `channel: "all"`

## 🔄 Flujo de Importación

### 1. Usuario abre modal
```typescript
const [isImportModalOpen, setIsImportModalOpen] = useState(false);

// En el botón:
onClick={() => setIsImportModalOpen(true)}
```

### 2. Selecciona método de importación
- **Archivo:** Usuario sube CSV/XLSX/JSON
- **JSON:** Usuario pega JSON en el textarea

### 3. Validación
```typescript
const validateJSON = (jsonString: string) => {
  // Parsea JSON
  // Valida estructura
  // Valida campos requeridos
  // Retorna errores
};
```

### 4. Transformación (cuando es necesario)
```typescript
const transformToAPIFormat = (data: InputData[]): APIData[] => {
  return data.map(item => ({
    // Mapea campos del usuario a campos del API
    // Aplica valores por defecto
  }));
};
```

### 5. Envío al API
```typescript
const response = await api.admin.{resource}.bulkCreate(transformedData);
```

### 6. Feedback y cierre
```typescript
showToast({
  title: "Importación exitosa",
  description: `${count} registros importados`,
  type: "success"
});

onSuccess?.(); // Recarga la lista
handleClose(); // Cierra el modal
```

## 🎭 Tema y Estilos

Todos los modales utilizan el sistema de temas para consistencia:

```typescript
const { themeColors } = useTheme();

// Superficie del modal
backgroundColor: themeColors.surface
borderColor: themeColors.primary + "30"

// Botones primarios
background: `linear-gradient(45deg, ${themeColors.primary}, ${themeColors.secondary})`

// Tabs activas
backgroundColor: themeColors.primary
color: 'white'

// Tabs inactivas
backgroundColor: 'transparent'
color: themeColors.text.secondary
border: `2px solid ${themeColors.primary}30`

// Área de tips
backgroundColor: themeColors.primary + '10'
```

## 📝 Integración en Páginas

### Patrón estándar:

```typescript
// 1. Importar componente
import { ImportModal } from '@/components/admin/.../import-modal';

// 2. Estado del modal
const [isImportModalOpen, setIsImportModalOpen] = useState(false);

// 3. Handler del botón
const handleImport = () => {
  setIsImportModalOpen(true);
};

// 4. Renderizar modal
<ImportModal 
  isOpen={isImportModalOpen}
  onClose={() => setIsImportModalOpen(false)}
  onSuccess={loadData} // Función que recarga los datos
/>
```

## ✅ Beneficios del Sistema

1. **Consistencia UX:** Todos los modales se ven y funcionan igual
2. **Mantenibilidad:** Un patrón claro para futuras importaciones
3. **Validación robusta:** Errores claros antes de enviar al servidor
4. **Feedback claro:** Usuario siempre sabe qué está pasando
5. **Flexibilidad:** Soporta múltiples formatos de entrada
6. **Accesibilidad:** Temas adaptados, animaciones suaves

## 🔮 Futuras Mejoras

- [ ] Soporte real para archivos XLSX/CSV (actualmente solo JSON funciona)
- [ ] Preview de datos antes de importar
- [ ] Importación parcial (seleccionar qué registros importar)
- [ ] Mapeo de columnas (para archivos con headers diferentes)
- [ ] Historial de importaciones
- [ ] Validación avanzada con reglas de negocio
- [ ] Importación en segundo plano para archivos grandes
- [ ] Rollback de importaciones

## 📚 Referencias

- **Framer Motion:** Animaciones del modal y transiciones
- **API Client:** `src/api/index.ts` - Endpoints `bulkCreate`
- **Toast System:** `src/store/toast-helpers.ts`
- **Theme System:** `src/contexts/theme-context.tsx`
