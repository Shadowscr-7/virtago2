# 🎁 Sistema de Templates de Descuentos

Sistema completo para crear, visualizar y administrar descuentos con templates predefinidos y configuración guiada.

## 📋 Características

### ✨ Templates Disponibles

1. **Compra X Lleva Y (3x2, 2x1)** 🎁
   - Promociones tipo "Compra 3 Paga 2"
   - Configuración de cantidades a comprar, pagar y gratis
   - Aplicable a categorías o productos específicos
   - Ejemplo: 3x2, 2x1, Compra 2 Lleva 1 Gratis

2. **Descuento por Volumen/Escalonado** 📈
   - Descuentos progresivos según cantidad
   - Múltiples niveles configurables
   - Ideal para mayoristas y B2B
   - Ejemplo: 5-9 unidades = 10%, 10-19 = 20%, 20+ = 30%

3. **Paquetes/Bundle** 📦
   - Descuento por combinar productos específicos
   - Lista de productos requeridos
   - Opción de "todos requeridos" o flexible
   - Ejemplo: Laptop + Mouse + Teclado = 15% desc.

4. **BOGO (Buy One Get One)** 🛍️
   - Compra uno lleva otro gratis o con descuento
   - Configuración de porcentaje de descuento
   - Aplicable a categorías, productos o marcas
   - Ejemplo: Compra 1 Lleva 1 Gratis, Segundo al 50%

5. **Venta Flash** ⚡
   - Descuentos por tiempo limitado
   - Nivel de urgencia configurable
   - Límite de usos
   - Ejemplo: 24 horas - 40% OFF

6. **Gasta y Ahorra** 💰
   - Descuento por monto mínimo de compra
   - Modo simple o progresivo
   - Niveles de gasto configurables
   - Ejemplo: Gasta $100 obtén $20 OFF

7. **Mix & Match** 🎨
   - Elige varios de una categoría y obtén descuento
   - Cantidad requerida configurable
   - Mezcla permitida entre productos
   - Ejemplo: Elige 3 snacks obtén 20% OFF

8. **VIP/Lealtad** 👑
   - Descuentos exclusivos para clientes premium
   - Diferentes niveles (Bronze, Silver, Gold, Platinum, VIP)
   - Descuentos por fidelidad
   - Ejemplo: Clientes VIP 25% OFF

9. **Bienvenida** 🎉
   - Descuento para nuevos clientes
   - Primera compra únicamente
   - Límite de 1 uso por cliente
   - Ejemplo: Primera compra 15% OFF

10. **Estacional/Festivo** 🎄
    - Promociones para eventos especiales
    - Black Friday, Cyber Monday, Navidad, etc.
    - Fechas de inicio y fin configurables
    - Ejemplo: Black Friday 30% en todo

11. **Envío Gratis** 🚚
    - Envío sin costo al alcanzar monto mínimo
    - Reducir carritos abandonados
    - Regiones aplicables opcionales
    - Ejemplo: Envío gratis en compras +$75

12. **Liquidación** 🏷️
    - Descuentos masivos para limpiar inventario
    - Sin devoluciones (final sale)
    - Tags y categorías aplicables
    - Ejemplo: Liquidación 70% OFF

## 🎨 Características del Sistema

### Interface de Usuario

- ✅ **Diseño Moderno**: Glassmorphism, animaciones suaves, gradientes
- ✅ **Responsive**: Funciona en desktop, tablet y móvil
- ✅ **Tema Dinámico**: Respeta los colores del tema seleccionado
- ✅ **Animaciones**: Framer Motion en todo el flujo
- ✅ **Cards Interactivas**: Hover effects, badges populares, indicadores de complejidad

### Flujo de Trabajo

1. **Selección de Template**
   - Grid visual con 12 templates
   - Información de cada template (descripción, ejemplos, casos de uso)
   - Indicador de complejidad (Fácil, Intermedio, Avanzado)
   - Badges "Popular" en los más usados

2. **Configuración Guiada**
   - Formulario específico para cada template
   - Campos dinámicos según el template seleccionado
   - Información básica del descuento (nombre, descripción, fechas)
   - Preview en tiempo real de la configuración
   - Validación de campos requeridos

3. **Revisión y Guardado**
   - Vista previa del JSON generado
   - Botón para copiar JSON
   - Indicadores de líneas, caracteres y tamaño
   - Posibilidad de colapsar el JSON
   - Botón de guardado con loading state

### Componentes Creados

```
src/
├── types/
│   └── discount-templates.ts          # Tipos e interfaces de todos los templates
├── components/
│   └── admin/
│       └── descuentos/
│           ├── discount-template-selector.tsx    # Selector visual de templates
│           ├── discount-json-preview.tsx         # Preview del JSON con copy
│           └── templates/
│               ├── buy-x-get-y-config.tsx       # Config 3x2, 2x1
│               ├── tiered-volume-config.tsx     # Config descuento escalonado
│               ├── bogo-config.tsx              # Config BOGO
│               ├── flash-sale-config.tsx        # Config venta flash
│               ├── bundle-config.tsx            # Config paquetes
│               ├── spend-threshold-config.tsx   # Config gasta y ahorra
│               └── index.ts                     # Re-exports
└── app/
    └── admin/
        └── descuentos/
            ├── page.tsx                         # Lista principal (actualizada)
            ├── nuevo-template/
            │   └── page.tsx                     # Flujo con templates
            ├── nuevo/
            │   └── page.tsx                     # Modo avanzado (existente)
            └── [id]/
                ├── page.tsx                     # Visualización detallada
                └── editar/
                    └── page.tsx                 # Edición (existente)
```

## 🔧 Uso

### Crear un Nuevo Descuento con Template

1. Ir a `/admin/descuentos`
2. Click en "Nuevo con Template" (botón con badge "NUEVO")
3. Seleccionar un template de la lista
4. Completar información básica (nombre, descripción, fechas, moneda)
5. Configurar campos específicos del template
6. Click en "Siguiente: Revisar"
7. Revisar el JSON generado
8. Click en "Guardar Descuento"

### Modo Avanzado

Para usuarios experimentados, el botón "Modo Avanzado" permite acceder al formulario completo sin templates.

### Ver Descuento Existente

1. Ir a `/admin/descuentos`
2. Click en el botón de "ojo" (ver) en cualquier descuento
3. Ver detalles completos con tabs:
   - General: Info básica, estado, fechas
   - Condiciones: Condiciones aplicables
   - Relaciones: Relaciones con otros descuentos
   - Historial de Usos: Tabla con usos del descuento

## 📄 Estructura de JSON

Cada template genera un JSON con la siguiente estructura base:

```json
{
  "name": "Nombre del descuento",
  "description": "Descripción",
  "discount_type": "percentage | fixed | bogo",
  "discount_value": 30,
  "currency": "UYU",
  "start_date": "2024-11-20T00:00:00Z",
  "end_date": "2024-11-30T23:59:59Z",
  "min_purchase_amount": 5000,
  "usage_limit": 1000,
  "applicable_to": [
    { "type": "category", "value": "electronics" }
  ],
  "conditions": {
    "min_items": 3
  },
  "customFields": {
    "promotion_type": "buy_x_get_y",
    "buy_quantity": 3,
    "pay_quantity": 2,
    "free_quantity": 1
  }
}
```

El campo `customFields.promotion_type` identifica el template usado y contiene la configuración específica.

## 🎯 Ejemplos de Uso

### 3x2 en Ropa

```json
{
  "name": "Promoción 3x2 en Ropa",
  "discount_type": "percentage",
  "discount_value": 33.33,
  "applicable_to": [
    { "type": "category", "value": "ropa" }
  ],
  "customFields": {
    "promotion_type": "buy_x_get_y",
    "buy_quantity": 3,
    "pay_quantity": 2,
    "free_quantity": 1
  }
}
```

### Descuento por Volumen en Electrónicos

```json
{
  "name": "Descuento por Volumen - Electrónicos",
  "discount_type": "percentage",
  "discount_value": 10,
  "applicable_to": [
    { "type": "category", "value": "electronicos" }
  ],
  "customFields": {
    "promotion_type": "tiered_volume",
    "tiers": [
      { "min_qty": 5, "max_qty": 9, "discount": 10, "discount_type": "percentage" },
      { "min_qty": 10, "max_qty": 19, "discount": 20, "discount_type": "percentage" },
      { "min_qty": 20, "max_qty": null, "discount": 30, "discount_type": "percentage" }
    ]
  }
}
```

### Black Friday

```json
{
  "name": "Black Friday - 30% en Todo",
  "discount_type": "percentage",
  "discount_value": 30,
  "start_date": "2025-11-24T00:00:00Z",
  "end_date": "2025-11-30T23:59:59Z",
  "min_purchase_amount": 50,
  "applicable_to": [
    { "type": "all_products", "value": "*" }
  ],
  "customFields": {
    "promotion_type": "seasonal",
    "event": "black_friday",
    "year": 2025
  }
}
```

## 🚀 Próximos Pasos

### Para Implementar

1. **Integración con API Backend**
   - Endpoint POST `/api/discounts` para crear descuentos
   - Endpoint PUT `/api/discounts/:id` para editar
   - Endpoint DELETE `/api/discounts/:id` para eliminar
   - Validación del JSON en backend

2. **Templates Adicionales**
   - Regalo con Compra
   - Descuento por Hora del Día
   - Descuento por Día de la Semana
   - Descuento por Ubicación Geográfica
   - Descuento por Método de Pago

3. **Mejoras de UX**
   - Validación en tiempo real de campos
   - Sugerencias de configuración según template
   - Simulador de aplicación del descuento
   - Cálculo automático de impacto en ventas

4. **Funcionalidades Avanzadas**
   - Duplicar descuento existente
   - Importar/Exportar descuentos en JSON
   - Programación de activación automática
   - Notificaciones cuando un descuento está por vencer
   - Analytics de performance de cada descuento

## 🎨 Temas y Estilos

El sistema respeta completamente los colores del tema seleccionado:
- `themeColors.primary` - Color primario del tema
- `themeColors.secondary` - Color secundario
- `themeColors.accent` - Color de acento
- `themeColors.surface` - Color de superficie
- `themeColors.text.primary` - Texto principal
- `themeColors.text.secondary` - Texto secundario

Todos los gradientes, borders, backgrounds y hover effects utilizan estos colores dinámicamente.

## 📱 Responsive Design

- **Mobile**: Cards en 1 columna
- **Tablet**: Cards en 2 columnas
- **Desktop**: Cards en 3-4 columnas
- **Large Desktop**: Cards en 4 columnas

## ⚡ Optimizaciones

- Debounce en búsqueda (500ms)
- Loading states en todas las acciones
- Animaciones optimizadas con Framer Motion
- Lazy loading de componentes pesados
- Memoización de cálculos complejos

---

**Desarrollado con ❤️ usando Next.js, TypeScript, Tailwind CSS y Framer Motion**
