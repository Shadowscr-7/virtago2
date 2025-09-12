# 🚀 Virtago - E-commerce B2B Platform

## 📖 Descripción

Virtago es una plataforma de e-commerce B2B moderna y profesional desarrollada con las tecnologías más avanzadas. Diseñada específicamente para empresas, ofrece una experiencia de compra mayorista con características exclusivas para negocios.

## ✨ Características Principales

### 🎨 Diseño y UI/UX
- **Temas Dual**: Modo claro y oscuro con gradientes profesionales
- **Animaciones Fluidas**: Implementadas con Framer Motion
- **Loader Único**: Animación de carga personalizada con partículas
- **Responsive Design**: Optimizado para todos los dispositivos
- **Fuentes Modernas**: Inter, JetBrains Mono, Manrope

### 🛍️ Funcionalidades E-commerce
- **Restricción de Precios**: Los precios solo son visibles para usuarios autenticados
- **Multi-marca**: Soporte para múltiples marcas y proveedores
- **Catálogo Avanzado**: Sistema de filtros y búsqueda
- **Vista Dual**: Grid y lista para productos
- **Banners Promocionales**: Secciones llamativas para ofertas

### 🔐 Sistema B2B
- **Autenticación Empresarial**: Login especializado para empresas
- **Precios Mayoristas**: Estructura de precios B2B
- **Proveedores Verificados**: Sistema multi-proveedor
- **Catálogos Especializados**: Por marca y proveedor

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 14 con App Router
- **Lenguaje**: TypeScript
- **Styling**: Tailwind CSS
- **Animaciones**: Framer Motion
- **Iconos**: Lucide React
- **UI Components**: Radix UI
- **Estado Global**: Zustand
- **Formularios**: React Hook Form + Zod
- **Temas**: next-themes

## 🚀 Instalación y Uso

### Prerequisitos
- Node.js 18+
- npm o yarn

### Instalación
```bash
# Clonar el repositorio
git clone [repository-url]

# Navegar al directorio
cd virtago2

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

### URLs Disponibles
- **Homepage**: http://localhost:3001/
- **Productos**: http://localhost:3001/productos
- **Login**: http://localhost:3001/login

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── page.tsx           # Homepage principal
│   ├── login/page.tsx     # Página de autenticación
│   ├── productos/page.tsx # Catálogo de productos
│   └── layout.tsx         # Layout global
├── components/
│   ├── banners/           # Componentes de banners
│   ├── layout/            # Navbar, footer, etc.
│   ├── products/          # Cards y grids de productos
│   ├── providers/         # Providers de tema y loading
│   └── ui/                # Componentes base reutilizables
├── lib/
│   └── utils.ts           # Utilidades y helpers
└── styles/
    └── globals.css        # Estilos globales y variables CSS
```

## 🎯 Características Únicas

### 🔒 Restricción de Precios B2B
```tsx
// Los precios solo se muestran si el usuario está autenticado
{isAuthenticated ? (
  <span>${price?.toLocaleString()}</span>
) : (
  <div>Inicie sesión para ver precios</div>
)}
```

### 🎨 Loader Animado Personalizado
- Partículas flotantes animadas
- Logo rotatorio con gradientes
- Barras de carga dinámicas
- Texto de estado personalizado

### 🌈 Sistema de Temas Avanzado
- Variables CSS para colores
- Gradientes personalizados
- Transiciones suaves
- Persistencia de preferencias

## 🎨 Paleta de Colores

### Tema Claro
- Primary: `#9333ea` (Purple)
- Secondary: Gradientes de purple a pink a cyan
- Background: Blanco con gradientes sutiles

### Tema Oscuro
- Primary: `#9333ea` (Purple)
- Background: Gradientes oscuros de slate
- Acentos: Purple, pink, cyan

## 📱 Responsive Design

- **Mobile First**: Diseño optimizado para móviles
- **Breakpoints**: sm, md, lg, xl, 2xl
- **Grid Adaptativo**: Ajuste automático de columnas
- **Tipografía Escalable**: Tamaños responsivos

## 🔮 Próximas Funcionalidades

- [ ] Sistema de carrito de compras
- [ ] Checkout y pagos
- [ ] Dashboard de usuario
- [ ] Panel de administración
- [ ] API REST completa
- [ ] Base de datos real
- [ ] Sistema de notificaciones
- [ ] Chat en vivo
- [ ] Reportes y analytics

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.

## 🙏 Agradecimientos

- Next.js team por el excelente framework
- Tailwind CSS por el sistema de diseño
- Framer Motion por las animaciones
- Radix UI por los componentes primitivos
- Lucide por los iconos modernos

---

**Desarrollado con ❤️ para empresas modernas**
