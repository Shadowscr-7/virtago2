# 🧙‍♂️ Setup Wizard - Sistema Modularizado

## 📁 Estructura del Proyecto

```
src/components/admin/quick-setup/
├── setup-wizard.tsx              # Wizard principal refactorizado
├── shared/
│   ├── types.ts                  # Tipos compartidos
│   └── FileUploadComponent.tsx   # Componente reutilizable de upload
├── steps/
│   ├── index.ts                  # Exportaciones centralizadas
│   ├── ProductStep.tsx           # Paso 1: Carga de productos con IA
│   ├── PriceListStep.tsx         # Paso 2: Listas de precios
│   ├── PriceStep.tsx             # Paso 3: Precios individuales
│   ├── DiscountStep.tsx          # Paso 4: Descuentos (placeholder)
│   └── ReviewStep.tsx            # Paso 5: Revisión final
└── setup-wizard-old.tsx          # Backup del wizard original
```

## 🎯 Funcionalidades Implementadas

### ✅ **Wizard Principal Modularizado**
- **Navegación fluida** entre pasos con indicadores visuales
- **Estado compartido** entre todos los pasos
- **Progreso visual** con línea de progreso animada
- **Navegación libre** entre pasos completados
- **Responsive design** con animaciones suaves

### ✅ **Paso 1: Carga de Productos**
- **Dual upload**: Archivos (CSV/XLSX) + JSON
- **AI Matching**: Categorización automática con IA simulada
- **Confidence scoring**: Alta/Media/Baja confianza visual
- **Editor manual**: Ajustes de categorías, marcas, subcategorías
- **Sugerencias automáticas**: Botones para aceptar sugerencias de IA

### ✅ **Paso 2: Listas de Precios** 
- **Carga masiva** de listas con descuentos por cliente
- **Vista resumen**: Total listas, productos, descuento promedio
- **Detalles expandidos**: Productos por lista con precios
- **Procesamiento animado**: Estados de carga con feedback visual

### ✅ **Paso 3: Precios**
- **Análisis automático**: Estadísticas de márgenes y precios
- **Vista detallada**: Costo → Precio → Margen por producto
- **Indicadores de rentabilidad**: Colores según margen
- **Métricas calculadas**: Precio promedio, margen promedio

### ✅ **Componente FileUpload Reutilizable**
- **Drag & drop** para archivos
- **Editor JSON** integrado con validación
- **Descarga de ejemplos** automática (CSV/JSON)
- **Estados de procesamiento** con animaciones
- **Manejo de errores** completo

## 📄 Archivos JSON de Ejemplo

### `productos_ejemplo.json` (15 productos)
```json
[
  {
    "code": "LAP001",
    "name": "Laptop Gaming RGB Ultra",
    "description": "Laptop para gaming con iluminación RGB...",
    "category": "Computadoras",
    "brand": "TechPro",
    "price": 1299.99,
    "stock": 15
  }
  // ... más productos
]
```

### `listas_precios_ejemplo.json` (3 listas)
```json
[
  {
    "id": "lista_001",
    "name": "Lista Mayorista",
    "description": "Precios especiales para mayoristas...",
    "discountPercentage": 15,
    "products": [...]
  }
  // ... más listas
]
```

### `precios_ejemplo.json` (15 precios)
```json
[
  {
    "productCode": "LAP001",
    "productName": "Laptop Gaming RGB Ultra",
    "basePrice": 1299.99,
    "cost": 900.00,
    "margin": 44.44,
    "currency": "USD"
  }
  // ... más precios
]
```

## 🔧 Cómo Usar

### 1. **Acceder al Wizard**
```tsx
import SetupWizard from '@/components/admin/quick-setup/setup-wizard';

function AdminPanel() {
  return <SetupWizard />;
}
```

### 2. **Probar Funcionalidades**

**Paso 1 - Productos:**
- Selecciona "Importar JSON"
- Copia el contenido de `productos_ejemplo.json`
- Observa el proceso de AI matching
- Ajusta las sugerencias manualmente

**Paso 2 - Listas de Precios:**
- Usa "Subir Archivo" o "Importar JSON"
- Carga `listas_precios_ejemplo.json`
- Revisa las estadísticas generadas

**Paso 3 - Precios:**
- Importa `precios_ejemplo.json`
- Analiza márgenes y precios automáticamente
- Observa indicadores visuales de rentabilidad

## 🏗️ Arquitectura

### **Tipos Compartidos** (`shared/types.ts`)
- Interfaces comunes para todos los componentes
- Tipado estricto de TypeScript
- Reutilización en todos los steps

### **Props Pattern**
```tsx
interface StepProps {
  onNext: (data?: unknown) => void;
  onBack: () => void;
  themeColors: ThemeColors;
  stepData?: unknown;
}
```

### **Estado Global**
```tsx
interface WizardData {
  matchedProducts?: MatchedProduct[];
  uploadedPriceLists?: PriceList[];
  uploadedPrices?: PriceData[];
  discounts?: unknown[];
  completed?: boolean;
}
```

## 🎨 Personalización de Temas

El wizard utiliza el sistema de temas global:
- **Colores dinámicos** desde `ThemeContext`
- **Adaptación automática** a temas dark/light
- **Consistencia visual** en todos los componentes

## 🚀 Próximas Funcionalidades

- [ ] **DiscountStep**: Reglas de descuentos completas
- [ ] **Parser real**: CSV/XLSX → Datos estructurados
- [ ] **API Integration**: Conexión con backend real
- [ ] **Validaciones avanzadas**: Esquemas de datos
- [ ] **Importación masiva**: Archivos grandes con chunks
- [ ] **Exportación**: Datos procesados a diferentes formatos

## 💡 Ventajas del Sistema Modularizado

1. **Mantenibilidad**: Código organizado en módulos pequeños
2. **Reutilización**: Componentes compartidos entre steps
3. **Escalabilidad**: Fácil agregar nuevos pasos
4. **Testabilidad**: Componentes aislados y testeables
5. **Performance**: Lazy loading de components por step
6. **Developer Experience**: Tipado estricto y IntelliSense

¡El sistema está listo para usar y expandir! 🎉