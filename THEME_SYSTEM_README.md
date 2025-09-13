# 🎨 Sistema de Temas Virtago - Documentación Completa

## 📋 Resumen del Sistema

Hemos implementado un sistema de temas dinámico y completo para Virtago que permite cambiar toda la paleta de colores de la aplicación en tiempo real. El sistema está construido con React Context API y CSS Custom Properties.

## 🏗️ Arquitectura del Sistema

### Core Files

```
src/
├── contexts/
│   └── theme-context.tsx          # Context principal del sistema de temas
├── components/
│   ├── ui/
│   │   ├── theme-selector.tsx     # Modal selector de temas
│   │   ├── theme-demo.tsx         # Página de demostración
│   │   ├── animated-background.tsx # Fondo animado dinámico
│   │   └── styled-switch.tsx      # Switches simplificados
│   └── providers/
│       └── loading-provider.tsx   # Loader con temas
└── app/
    └── themes/
        └── page.tsx              # Página de demo de temas
```

## 🎯 Temas Disponibles

### 1. **Original** (Predeterminado)

```typescript
primary: "#8b5cf6",     // Purple
secondary: "#ec4899",   // Pink
accent: "#06b6d4",      // Cyan
surface: "#f1f5f9"      // Light Gray
```

### 2. **Ocean**

```typescript
primary: "#0ea5e9",     // Sky Blue
secondary: "#06b6d4",   // Cyan
accent: "#14b8a6",      // Teal
surface: "#f0f9ff"      // Very Light Blue
```

### 3. **Forest**

```typescript
primary: "#10b981",     // Emerald
secondary: "#059669",   // Green
accent: "#84cc16",      // Lime
surface: "#f0fdf4"      // Very Light Green
```

### 4. **Crimson**

```typescript
primary: "#ef4444",     // Red
secondary: "#f97316",   // Orange
accent: "#eab308",      // Yellow
surface: "#fef2f2"      // Very Light Red
```

## 🔧 Implementación Técnica

### Theme Context Structure

```typescript
interface ThemeColors {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  surface: string;
  gradients: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

interface ThemeContextType {
  currentTheme: string;
  themeColors: ThemeColors;
  setTheme: (theme: string) => void;
  themes: Record<string, ThemeColors>;
}
```

### Uso del Hook

```typescript
import { useTheme } from "@/contexts/theme-context";

function Component() {
  const { themeColors, setTheme, currentTheme } = useTheme();

  return (
    <div style={{ backgroundColor: themeColors.primary }}>
      Contenido con tema dinámico
    </div>
  );
}
```

## 🎨 Guías de Estilo por Componente

### 1. **Navbar**

- Logo: Gradiente con `primary → secondary`
- Búsqueda: Focus con `primary` + glow effect
- Botones: Background `primary`, hover effects
- Enlaces: Color `primary` con hover transitions

### 2. **Banners (OfferBanner)**

- Fondo: Gradiente `primary → secondary → accent`
- Contenido: Backdrop blur para legibilidad
- CTA: Background semi-transparente con colores del tema
- Partículas: Color `primary` animadas

### 3. **Formularios**

- Inputs: Border `primary` en focus
- Efectos glow: Color del tema en hover/focus
- Botones: Gradiente `primary → secondary`
- Labels: Color `primary` para estados activos

### 4. **Cards y Componentes**

- Bordes: Semi-transparentes con colores del tema
- Íconos: Color `primary` o `accent` según contexto
- Hover states: Escalado + glow con colores del tema
- Backgrounds: Transparencias con colores del tema

## 🎭 Componentes Especiales

### AnimatedBackground

Fondo animado que se adapta al tema:

```typescript
// Círculos animados con colores del tema
// Partículas flotantes
// Gradientes radiales dinámicos
// Overlay para legibilidad
```

### Loading Provider

Loader completamente temático:

- Logo rotatorio con gradiente del tema
- Barras de carga con colores dinámicos
- Partículas de fondo del color primario
- Fondo degradado adaptable

### Theme Selector

Modal de selección con:

- Portal rendering (z-index: 9999)
- Preview de cada tema
- Animaciones Framer Motion
- Persistencia en localStorage

## 📱 Responsive Design

### Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Adaptaciones por Dispositivo

- Tamaños de elementos escalables
- Espaciados responsivos
- Animaciones optimizadas para móvil
- Touch-friendly interactions

## 🔄 Estados de Interacción

### Hover Effects

```css
/* Patrón estándar para hover */
.element:hover {
  transform: scale(1.02);
  box-shadow: 0 0 20px ${themeColors.primary}30;
  transition: all 0.3s ease;
}
```

### Focus States

```css
/* Para inputs y elementos interactivos */
.element:focus {
  outline: none;
  border-color: ${themeColors.primary};
  box-shadow: 0 0 0 3px ${themeColors.primary}20;
}
```

### Loading States

- Pulse animations con colores del tema
- Skeleton loaders con gradientes temáticos
- Spinner components adaptables

## 🎨 Nuevos Componentes - Guía de Creación

### Template Base para Componente Temático

```typescript
"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/contexts/theme-context";

interface ComponentProps {
  // Props del componente
}

export function ThemeComponent({ ...props }: ComponentProps) {
  const { themeColors } = useTheme();

  return (
    <motion.div
      className="relative"
      style={{
        // Usar themeColors para estilos dinámicos
        backgroundColor: themeColors.surface,
        borderColor: themeColors.primary,
      }}
    >
      {/* Contenido del componente */}
    </motion.div>
  );
}
```

### Patrones de Color Recomendados

#### Fondos

- **Principal**: `themeColors.primary`
- **Secundario**: `themeColors.secondary`
- **Superficie**: `themeColors.surface`
- **Gradientes**: `themeColors.gradients.primary`

#### Textos

- **Títulos**: Gradiente `primary → secondary`
- **Enlaces**: `themeColors.primary`
- **Texto activo**: `themeColors.accent`
- **Texto secundario**: Transparencias del tema

#### Interacciones

- **Hover**: Glow con `primary + 30% opacity`
- **Focus**: Border `primary` + ring `20% opacity`
- **Active**: Background `primary` con transformaciones
- **Disabled**: Colores del tema con `50% opacity`

## 🚀 Extensión del Sistema

### Agregar Nuevo Tema

1. Definir colores en `theme-context.tsx`
2. Agregar gradientes correspondientes
3. Testear en todos los componentes
4. Actualizar documentación

### Ejemplo Tema Nuevo

```typescript
sunset: {
  name: "Sunset",
  primary: "#f59e0b",      // Amber
  secondary: "#dc2626",    // Red
  accent: "#7c3aed",       // Violet
  surface: "#fffbeb",      // Amber light
  gradients: {
    primary: "from-amber-500 to-red-500",
    secondary: "from-red-500 to-violet-500",
    accent: "from-violet-500 to-amber-500"
  }
}
```

### Modificar Componente Existente

1. Importar `useTheme`
2. Reemplazar colores hardcoded por `themeColors.x`
3. Agregar efectos hover/focus si faltan
4. Testear en todos los temas
5. Verificar accesibilidad

## 🔍 Testing y QA

### Checklist por Tema

- [ ] Logo se ve correcto
- [ ] Navegación funcional
- [ ] Formularios legibles
- [ ] Botones contrastados
- [ ] Animaciones fluidas
- [ ] Responsive en móvil
- [ ] Loader temático
- [ ] Accesibilidad (contraste)

### Comandos de Desarrollo

```bash
# Iniciar desarrollo
pnpm dev

# Build de producción
pnpm build

# Linting
pnpm lint

# Formateo de código
pnpm format
```

## 📦 Dependencias del Sistema

### Core Dependencies

- `framer-motion`: Animaciones
- `react`: Context API
- `tailwindcss`: Utility classes
- `lucide-react`: Iconografía

### Custom Hooks

- `useTheme`: Acceso al sistema de temas
- `useLocalStorage`: Persistencia (interno)

## 🎯 Próximas Mejoras

### Features Pendientes

- [ ] Modo oscuro automático por horario
- [ ] Temas personalizados por usuario
- [ ] Exportar/importar configuraciones de tema
- [ ] Preview en tiempo real en theme-selector
- [ ] Animaciones de transición entre temas
- [ ] Temas estacionales automáticos

### Optimizaciones

- [ ] Lazy loading de componentes de tema
- [ ] CSS-in-JS optimization
- [ ] Performance monitoring
- [ ] Bundle size analysis

---

## 📞 Notas para Continuación

### Estado Actual

✅ **Completado**: Sistema base, 4 temas, componentes principales
🔄 **En progreso**: Refinamiento de animaciones
⏳ **Pendiente**: Temas adicionales, modo oscuro avanzado

### Archivos Críticos

- `theme-context.tsx` - No modificar estructura base
- `theme-selector.tsx` - Portal rendering estable
- `animated-background.tsx` - Performance optimizada

### Convenciones Establecidas

- Colores siempre via `themeColors.x`
- Animaciones con Framer Motion
- Opacity `20`, `30`, `50` para transparencias
- Hover scale `1.02`, focus ring `3px`

**Última actualización**: Septiembre 12, 2025
**Versión del sistema**: 1.0.0
**Estado**: Producción ready ✨
