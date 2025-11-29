# Sección de Tutoriales - Panel de Administración

## 📋 Descripción General

Nueva sección "Tutoriales" agregada al panel de administración que proporciona videos instructivos para aprender a usar todas las funcionalidades de la plataforma.

## 🎯 Ubicación

**Ruta:** `/admin/tutoriales`
**Menú:** Aparece entre "Cupones" y "Documentación" en el sidebar
**Icono:** `GraduationCap` (birrete de graduación)

## ✨ Características

### 1. Sistema de Filtrado Avanzado

#### Búsqueda de Texto
- Campo de búsqueda en tiempo real
- Busca en títulos y descripciones
- Icono de búsqueda visual

#### Filtro por Categoría
- **Todos** - Muestra todos los tutoriales
- **Inicio** - Onboarding y primeros pasos
- **ABM** - Gestión de datos (Clientes, Productos, Precios, etc.)
- **Configuración** - Ajustes generales de la plataforma
- **Avanzado** - Funcionalidades avanzadas

#### Filtro por Nivel de Dificultad
- **Principiante** 🟢 (Verde) - Conceptos básicos
- **Intermedio** 🟠 (Naranja) - Funcionalidades intermedias
- **Avanzado** 🔴 (Rojo) - Características avanzadas

### 2. Catálogo de Tutoriales

#### Tutoriales Disponibles:

1. **Primeros Pasos - Onboarding** (15 min)
   - Categoría: Inicio
   - Nivel: Principiante
   - Configuración inicial de la tienda

2. **Gestión de Clientes** (12 min)
   - Categoría: ABM
   - Nivel: Principiante
   - Crear, editar y administrar clientes

3. **Gestión de Productos** (18 min)
   - Categoría: ABM
   - Nivel: Intermedio
   - Catálogo, categorías, variantes e imágenes

4. **Listas de Precios** (10 min)
   - Categoría: ABM
   - Nivel: Intermedio
   - Configurar listas para diferentes clientes

5. **Gestión de Precios** (14 min)
   - Categoría: ABM
   - Nivel: Intermedio
   - Administrar precios e importación masiva

6. **Sistema de Descuentos** (16 min)
   - Categoría: ABM
   - Nivel: Avanzado
   - Descuentos, promociones y reglas

7. **Configuración General** (20 min)
   - Categoría: Configuración
   - Nivel: Intermedio
   - Monedas, impuestos, envíos

8. **Importación Masiva de Datos** (15 min)
   - Categoría: Avanzado
   - Nivel: Avanzado
   - Importar con JSON y Excel

### 3. Cards de Tutoriales

Cada tutorial se presenta en una card con:

- **Icono temático** - Representación visual del tema
- **Badge de dificultad** - Color codificado (esquina superior izquierda)
- **Duración** - Tiempo estimado del video (esquina inferior derecha)
- **Categoría** - Tag con el tipo de tutorial
- **Título** - Nombre descriptivo del tutorial
- **Descripción** - Breve explicación del contenido
- **Botón "Ver Tutorial"** - Abre el video en modal

#### Animaciones:
- Fade in escalonado al cargar
- Hover: escala 1.02 y elevación
- Click: abre modal con video

### 4. Reproductor de Video (Modal)

#### Características del Modal:
- **Overlay oscuro** - Fondo semitransparente con blur
- **Reproductor embebido** - YouTube iframe responsive
- **Header informativo:**
  - Título completo del tutorial
  - Descripción extendida
  - Badges de categoría, dificultad y duración
  - Botón de cierre (X)
- **Aspect ratio 16:9** - Video adaptado a cualquier pantalla

#### Controles:
- Click fuera del modal para cerrar
- Botón X para cerrar
- Escape key (pendiente)

### 5. Estado Vacío

Cuando no hay resultados de búsqueda/filtros:
- Icono de libro grande
- Mensaje "No se encontraron tutoriales"
- Sugerencia para cambiar filtros

## 🎨 Diseño y Temas

### Colores por Elemento:

```typescript
// Header
background: linear-gradient(135deg, primary, secondary)

// Filtros
surface: surface + "80" (semitransparente)
borders: primary + "20"

// Cards
background: linear-gradient(135deg, surface90, surface80)
thumbnail: linear-gradient(135deg, primary20, secondary20)

// Botón Ver Tutorial
background: linear-gradient(45deg, primary, secondary)
text: white

// Modal
background: surface
overlay: black/80 + backdrop-blur
```

### Colores por Dificultad:

```typescript
Principiante: #10b981 (verde)
Intermedio:   #f59e0b (naranja)
Avanzado:     #ef4444 (rojo)
```

## 📱 Responsive Design

### Desktop (lg+)
- 3 columnas de tutoriales
- Filtros en una fila
- Sidebar completo visible

### Tablet (md)
- 2 columnas de tutoriales
- Filtros en una fila

### Mobile (sm)
- 1 columna de tutoriales
- Filtros apilados verticalmente
- Texto de botones oculto, solo iconos

## 🔧 Estructura de Datos

### Interface Tutorial:
```typescript
interface Tutorial {
  id: string;                    // Identificador único
  title: string;                 // Título del tutorial
  description: string;           // Descripción detallada
  category: string;              // Inicio | ABM | Configuración | Avanzado
  duration: string;              // Ej: "15 min"
  videoUrl: string;              // URL de YouTube embed
  thumbnail?: string;            // URL de miniatura (opcional)
  icon: React.ComponentType;     // Icono de Lucide
  difficulty: "Principiante" | "Intermedio" | "Avanzado";
}
```

## 🚀 Cómo Agregar Nuevos Tutoriales

1. Editar el array `tutorials` en `/src/app/admin/tutoriales/page.tsx`
2. Agregar nuevo objeto con la estructura:

```typescript
{
  id: "mi-tutorial",
  title: "Mi Tutorial",
  description: "Descripción completa...",
  category: "ABM", // o la categoría que corresponda
  duration: "10 min",
  videoUrl: "https://www.youtube.com/embed/VIDEO_ID",
  icon: IconName, // Importar de lucide-react
  difficulty: "Intermedio"
}
```

3. Si es una nueva categoría, agregarla al array `categories`

## 🎥 Formato de URLs de Video

### YouTube:
```
https://www.youtube.com/embed/VIDEO_ID
```

**Ejemplo:**
```
https://www.youtube.com/embed/dQw4w9WgXcQ
```

**Importante:** Usar el formato `/embed/` para que funcione en iframe

## 📊 Contador de Resultados

En el panel de filtros se muestra:
- Cantidad de tutoriales que coinciden con los filtros actuales
- Se actualiza en tiempo real al filtrar o buscar

## 🔮 Mejoras Futuras

- [ ] Videos alojados en Vimeo o plataforma propia
- [ ] Subtítulos en múltiples idiomas
- [ ] Transcripciones de video
- [ ] Progreso de visualización (marcador de completados)
- [ ] Sistema de favoritos
- [ ] Calificación y comentarios
- [ ] Descargar videos para ver offline
- [ ] Playlist automáticas por rol de usuario
- [ ] Certificados de completación
- [ ] Notificaciones de nuevos tutoriales

## 📝 Notas de Implementación

### Archivos Creados/Modificados:

1. **`src/app/admin/tutoriales/page.tsx`** (NUEVO)
   - Componente principal de la página
   - 519 líneas
   - Sistema completo de filtrado y visualización

2. **`src/components/admin/admin-sidebar.tsx`** (MODIFICADO)
   - Agregado import de `GraduationCap`
   - Agregado item "Tutoriales" en el menú
   - Ubicado entre "Cupones" y "Documentación"

### Dependencias:
- `framer-motion` - Animaciones
- `lucide-react` - Iconos
- `@/contexts/theme-context` - Sistema de temas
- `@/components/admin/admin-layout` - Layout del admin

## 🎓 Uso

1. Navegar a `/admin/tutoriales` desde el panel de administración
2. Usar filtros para encontrar el tutorial deseado
3. Click en una card para abrir el video
4. Ver el tutorial en el modal
5. Cerrar y continuar explorando otros tutoriales

## 🌈 Tematización

La sección respeta completamente el sistema de temas de la aplicación:
- Colores dinámicos según el tema activo
- Modo claro/oscuro soportado
- Gradientes adaptados al tema
- Transparencias y blur effects consistentes
