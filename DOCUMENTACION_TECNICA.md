# 📚 Documentación Técnica - Virtago B2B Platform

## 📋 Índice

1. [Introducción](#introducción)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitectura del Frontend](#arquitectura-del-frontend)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Comunicación con el Backend](#comunicación-con-el-backend)
6. [Gestión de Estado](#gestión-de-estado)
7. [Sistema de Temas](#sistema-de-temas)
8. [Servicios y Utilidades](#servicios-y-utilidades)
9. [Componentes Principales](#componentes-principales)
10. [Sistema de Pruebas](#sistema-de-pruebas)
11. [Configuración y Deployment](#configuración-y-deployment)
12. [Best Practices](#best-practices)

---

## 🎯 Introducción

**Virtago** es una plataforma de e-commerce B2B moderna desarrollada para empresas mayoristas. Es una aplicación web full-stack que conecta distribuidores con clientes empresariales, ofreciendo una experiencia de compra optimizada con gestión de productos, precios, descuentos, y sistema de pedidos.

### Características Destacadas

- ✅ **Plataforma B2B especializada** con autenticación empresarial
- ✅ **Multi-brand** con soporte para múltiples distribuidores
- ✅ **Sistema de precios dinámico** con listas de precios y descuentos
- ✅ **Gestión de inventario** en tiempo real
- ✅ **Integración con IA** para análisis de imágenes de productos (Cloudinary AI)
- ✅ **Sistema de temas** personalizables con 4 variantes
- ✅ **Modo oscuro/claro** con transiciones suaves
- ✅ **PWA Ready** con optimizaciones de rendimiento

---

## 🛠️ Stack Tecnológico

### Frontend Framework

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **Next.js** | 15.5.3 | Framework React con App Router, SSR, SSG y API Routes |
| **React** | 19.1.0 | Biblioteca para construcción de UI |
| **TypeScript** | 5.x | Superset de JavaScript con tipado estático |

### Lenguajes y Estándares

- **TypeScript**: Configurado con `strict: true` y paths alias `@/*`
- **ES2017+**: Soporte para características modernas de JavaScript
- **JSX/TSX**: Para componentes React con tipado

### Styling y UI

| Librería | Versión | Propósito |
|----------|---------|-----------|
| **Tailwind CSS** | 4.x | Framework CSS utility-first |
| **PostCSS** | Latest | Procesador CSS para transformaciones |
| **Framer Motion** | 12.23.12 | Animaciones y transiciones fluidas |
| **Radix UI** | Latest | Componentes UI accesibles y sin estilos |
| **Lucide React** | 0.544.0 | Iconos modernos y optimizados |
| **next-themes** | 0.4.6 | Gestión de temas (dark/light mode) |
| **class-variance-authority** | 0.7.1 | Gestión de variantes de componentes |
| **tailwind-merge** | 3.3.1 | Merging inteligente de clases Tailwind |
| **clsx** | 2.1.1 | Construcción condicional de classNames |

### Estado y Formularios

| Librería | Versión | Uso |
|----------|---------|-----|
| **Zustand** | 5.0.8 | Gestión de estado global (auth, cart, etc.) |
| **React Hook Form** | 7.62.0 | Manejo de formularios con validación |
| **Zod** | 4.1.8 | Validación de esquemas y tipos |
| **@hookform/resolvers** | 5.2.1 | Integración de validadores con RHF |

### Comunicación HTTP

| Librería | Versión | Funcionalidad |
|----------|---------|---------------|
| **Axios** | 1.12.2 | Cliente HTTP con interceptores |
| **JWT** | - | Autenticación basada en tokens |

### Servicios de Terceros

| Servicio | Descripción |
|----------|-------------|
| **Cloudinary** | Gestión y transformación de imágenes |
| **Cloudinary AI** | Análisis de imágenes con IA (detección de productos, etiquetado) |
| **OpenAI** | Chat inteligente y asistencia con IA |
| **Vercel Analytics** | Análisis de rendimiento y métricas |

### Utilidades y Herramientas

| Herramienta | Versión | Uso |
|-------------|---------|-----|
| **date-fns** | 4.1.0 | Manipulación de fechas |
| **sharp** | 0.34.5 | Procesamiento de imágenes (optimización) |
| **xlsx** | 0.18.5 | Importación/exportación de Excel |
| **sonner** | 2.0.7 | Toast notifications modernas |

### Development Tools

| Tool | Versión | Propósito |
|------|---------|-----------|
| **ESLint** | 9.x | Linting y calidad de código |
| **Playwright** | 1.55.1 | Testing E2E |
| **pnpm** | 9.12.3 | Package manager rápido |

### Fuentes

- **Inter**: Sans-serif principal (variable font)
- **JetBrains Mono**: Fuente monoespaciada para código
- **Manrope**: Fuente sans-serif alternativa

---

## 🏗️ Arquitectura del Frontend

### Patrón de Arquitectura

Virtago utiliza una **arquitectura modular basada en Next.js App Router** con las siguientes capas:

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (Pages, Components, UI Elements)       │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│         Business Logic Layer            │
│  (Hooks, Services, Contexts, Stores)    │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│         Data Access Layer               │
│  (API Client, HTTP Interceptors)        │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│         Backend API (FastAPI)           │
│  (REST API, Database, Business Logic)   │
└─────────────────────────────────────────┘
```

### Principios de Diseño

1. **Component-Driven Development**: Todo es un componente reutilizable
2. **Server Components First**: Uso de React Server Components por defecto
3. **Client Components cuando necesario**: `'use client'` para interactividad
4. **Type-Safe**: TypeScript en todo el código
5. **Separation of Concerns**: Lógica separada de presentación
6. **DRY (Don't Repeat Yourself)**: Componentes y hooks reutilizables
7. **Performance First**: Lazy loading, code splitting, optimizaciones de imágenes

### Rendering Strategy

| Tipo de Página | Estrategia | Ejemplo |
|----------------|------------|---------|
| **Homepage** | SSR (Server-Side Rendering) | Contenido dinámico actualizado |
| **Productos** | SSR + Client Hydration | Filtros interactivos en cliente |
| **Detalle Producto** | SSR + ISR (Incremental Static Regeneration) | Cache con revalidación |
| **Admin Panel** | CSR (Client-Side Rendering) | Componentes `'use client'` |
| **Checkout** | CSR con formularios | Interactividad y validaciones |

---

## 📁 Estructura del Proyecto

### Vista General

```
virtago2/
├── public/                      # Archivos estáticos públicos
│   ├── images/                  # Imágenes optimizadas
│   └── templates/               # Plantillas (Excel, etc.)
│
├── src/                         # Código fuente principal
│   ├── app/                     # Next.js App Router
│   ├── components/              # Componentes React
│   ├── contexts/                # React Contexts
│   ├── hooks/                   # Custom React Hooks
│   ├── lib/                     # Utilidades y helpers
│   ├── services/                # Servicios externos
│   ├── store/                   # Zustand stores
│   ├── types/                   # TypeScript types y interfaces
│   └── api/                     # Cliente HTTP y APIs
│
├── tests/                       # Tests E2E con Playwright
├── docs/                        # Documentación adicional
│
├── next.config.ts               # Configuración de Next.js
├── tailwind.config.ts           # Configuración de Tailwind
├── tsconfig.json                # Configuración de TypeScript
├── playwright.config.ts         # Configuración de Playwright
├── eslint.config.mjs            # Configuración de ESLint
├── package.json                 # Dependencias y scripts
├── pnpm-lock.yaml              # Lock file de pnpm
└── vercel.json                  # Configuración de Vercel
```

### Estructura Detallada

#### 📂 `src/app/` - Pages (App Router)

```
app/
├── page.tsx                     # Homepage principal (/)
├── layout.tsx                   # Layout global con providers
├── globals.css                  # Estilos globales y variables CSS
├── not-found.tsx                # Página 404 personalizada
│
├── admin/                       # Panel de administración
│   ├── page.tsx                 # Dashboard admin
│   ├── clientes/                # Gestión de clientes
│   ├── productos/               # Gestión de productos
│   ├── precios/                 # Gestión de precios
│   ├── descuentos/              # Gestión de descuentos
│   ├── pedidos/                 # Gestión de pedidos
│   └── quick-setup/             # Configuración rápida (wizard)
│
├── productos/                   # Catálogo de productos
│   ├── page.tsx                 # Listado de productos
│   └── [id]/page.tsx            # Detalle de producto
│
├── producto/                    # Rutas alternativas de producto
│   └── [id]/page.tsx
│
├── login/                       # Autenticación
│   └── page.tsx
│
├── perfil/                      # Perfil de usuario
│   └── page.tsx
│
├── mis-pedidos/                 # Historial de pedidos
│   └── page.tsx
│
├── favoritos/                   # Lista de favoritos
│   └── page.tsx
│
├── checkout/                    # Proceso de compra
│   └── page.tsx
│
├── configuracion/               # Configuración de cuenta
│   └── page.tsx
│
├── contacto/                    # Página de contacto
│   └── page.tsx
│
├── ofertas/                     # Ofertas especiales
│   └── page.tsx
│
└── marcas/                      # Catálogo de marcas
    └── page.tsx
```

#### 📂 `src/components/` - Componentes

```
components/
├── admin/                       # Componentes del panel admin
│   ├── quick-setup/             # Wizard de configuración inicial
│   │   ├── QuickSetupWizard.tsx
│   │   └── steps/               # Steps del wizard
│   │       ├── ClientStep.tsx
│   │       ├── ProductStep.tsx
│   │       ├── PriceListStep.tsx
│   │       ├── PriceStep.tsx
│   │       ├── DiscountStep.tsx
│   │       └── PreviewStep.tsx
│   │
│   ├── clients/                 # Gestión de clientes
│   ├── products/                # Gestión de productos
│   ├── prices/                  # Gestión de precios
│   └── discounts/               # Gestión de descuentos
│
├── auth/                        # Componentes de autenticación
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   └── OTPVerification.tsx
│
├── banners/                     # Banners promocionales
│   ├── HeroBanner.tsx
│   ├── CategoryBanner.tsx
│   └── PromotionalBanner.tsx
│
├── brands/                      # Componentes de marcas
│   └── BrandCard.tsx
│
├── cart/                        # Carrito de compras
│   ├── CartDrawer.tsx
│   ├── CartItem.tsx
│   ├── CartSummary.tsx
│   └── toast-integration.tsx
│
├── chat/                        # Sistema de chat IA
│   ├── ChatSystem.tsx
│   ├── ChatMessage.tsx
│   └── ChatInput.tsx
│
├── checkout/                    # Proceso de compra
│   ├── CheckoutForm.tsx
│   ├── ShippingForm.tsx
│   └── PaymentForm.tsx
│
├── clients/                     # Componentes de clientes B2B
│
├── contact/                     # Formularios de contacto
│
├── images/                      # Componentes de imágenes
│   ├── CloudinaryImage.tsx
│   └── OptimizedImage.tsx
│
├── layout/                      # Layout y navegación
│   ├── ClientLayout.tsx         # Layout del cliente
│   ├── Header.tsx               # Header principal
│   ├── Footer.tsx               # Footer
│   ├── Navbar.tsx               # Barra de navegación
│   ├── Sidebar.tsx              # Sidebar navegación
│   └── MobileMenu.tsx           # Menú móvil
│
├── offers/                      # Ofertas y promociones
│
├── product-detail/              # Detalle de producto
│   ├── ProductImages.tsx
│   ├── ProductInfo.tsx
│   ├── ProductSpecs.tsx
│   └── RelatedProducts.tsx
│
├── products/                    # Catálogo de productos
│   ├── ProductCard.tsx          # Card de producto
│   ├── ProductGrid.tsx          # Grid de productos
│   ├── ProductList.tsx          # Lista de productos
│   ├── ProductFilters.tsx       # Filtros
│   └── ProductSort.tsx          # Ordenamiento
│
├── providers/                   # React Providers
│   ├── theme-provider.tsx       # Provider de next-themes
│   └── loading-provider.tsx     # Provider de loading states
│
├── suppliers/                   # Componentes de proveedores
│
└── ui/                          # Componentes base UI (Shadcn-like)
    ├── button.tsx
    ├── input.tsx
    ├── card.tsx
    ├── dialog.tsx
    ├── dropdown-menu.tsx
    ├── tabs.tsx
    ├── toast.tsx
    ├── tooltip.tsx
    └── ...
```

#### 📂 `src/api/` - Cliente HTTP y APIs

```
api/
├── base.ts                      # Configuración base de APIs
├── http-client.ts               # Cliente Axios con interceptores
├── index.ts                     # Todas las APIs exportadas
├── examples.ts                  # Ejemplos de uso
├── README.md                    # Documentación del sistema API
│
├── mock-clients.ts              # Mocks para desarrollo
├── mock-products.ts
├── mock-prices.ts
└── mock-price-lists.ts
```

#### 📂 `src/contexts/` - React Contexts

```
contexts/
├── theme-context.tsx            # Contexto de temas personalizados
└── chat-context.tsx             # Contexto del sistema de chat
```

#### 📂 `src/store/` - Zustand Stores

```
store/
├── auth.ts                      # Store de autenticación
├── api-helpers.ts               # Helpers para llamadas API
└── toast-helpers.ts             # Helpers para toasts
```

#### 📂 `src/services/` - Servicios

```
services/
├── cloudinary.ts                # Servicio de Cloudinary
└── image-vision.service.ts      # Servicio de IA para imágenes
```

#### 📂 `src/types/` - TypeScript Types

```
types/
├── index.ts                     # Tipos generales
├── product.ts                   # Tipos de productos
├── auth.ts                      # Tipos de autenticación
├── cart.ts                      # Tipos de carrito
└── ...
```

---

## 🌐 Comunicación con el Backend

### Arquitectura de Comunicación

Virtago utiliza un **sistema de comunicación HTTP centralizado** basado en Axios con las siguientes características:

1. **Cliente HTTP Centralizado** (`http-client.ts`)
2. **APIs Organizadas por Módulos** (`index.ts`)
3. **Interceptores de Request/Response**
4. **Manejo Automático de JWT**
5. **Refresh Token Automático**
6. **Proxy Inverso de Next.js**

### Flujo de Comunicación

```
┌──────────────────┐
│  React Component │
└────────┬─────────┘
         │
         ↓
┌────────┴─────────┐
│  API Call        │  api.product.getProducts()
│  (src/api/)      │
└────────┬─────────┘
         │
         ↓
┌────────┴─────────────────┐
│  HTTP Client (Axios)     │  + JWT Token
│  Request Interceptor     │  + Headers
└────────┬─────────────────┘
         │
         ↓
┌────────┴─────────────────┐
│  Next.js Proxy           │  /api/* → Backend
│  (next.config.ts)        │
└────────┬─────────────────┘
         │
         ↓ HTTP Request
┌────────┴─────────────────┐
│  Backend API (FastAPI)   │  Python Backend
│  http://localhost:3001   │  o Vercel Deploy
└────────┬─────────────────┘
         │
         ↓ HTTP Response
┌────────┴─────────────────┐
│  Response Interceptor    │  Error Handling
│  JWT Refresh (si 401)    │  Token Refresh
└────────┬─────────────────┘
         │
         ↓
┌────────┴─────────┐
│  React Component │  Actualización de UI
│  setState/Store  │
└──────────────────┘
```

### Configuración del Cliente HTTP

#### Base URL y Proxy

**Desarrollo Local:**
```typescript
// En development, se usa proxy de Next.js
const API_BASE_URL = '/api';  // → http://localhost:3002/api/*

// Next.js reescribe a:
// /api/* → http://localhost:3001/api/*
```

**Producción:**
```typescript
// En producción, se usa la URL completa
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
// → https://virtago-backend.vercel.app/api
```

#### Configuración de Axios (`http-client.ts`)

```typescript
const httpClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});
```

### Interceptores

#### Request Interceptor

Agrega automáticamente el token JWT a todas las requests:

```typescript
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();  // Obtiene token de localStorage
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`🚀 API Request: ${config.method} ${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);
```

#### Response Interceptor

Maneja errores y renueva tokens automáticamente:

```typescript
httpClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Si es error 401 (Unauthorized) y no es un retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        try {
          // Renovar token
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          
          const newToken = response.data.access_token;
          setToken(newToken);
          
          // Reintentar request original con nuevo token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return httpClient(originalRequest);
        } catch (refreshError) {
          // Si falla el refresh, cerrar sesión
          removeToken();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    
    return Promise.reject(error);
  }
);
```

### APIs Organizadas por Módulos

Todas las APIs están organizadas en módulos temáticos en `src/api/index.ts`:

```typescript
export const api = {
  // Autenticación
  auth: {
    login: (data: LoginData) => 
      http.post<LoginResponse>('/auth/login', data),
    register: (data: RegisterData) => 
      http.post<RegisterResponse>('/auth/register', data),
    logout: () => 
      http.post('/auth/logout'),
    refreshToken: () => 
      http.post('/auth/refresh'),
    verifyOTP: (data: OTPVerifyData) => 
      http.post<OTPVerifyResponse>('/auth/verify-otp', data),
    resendOTP: (email: string) => 
      http.post('/auth/resend-otp', { email }),
  },

  // Usuarios
  user: {
    getProfile: () => 
      http.get<User>('/users/profile'),
    updateUserDetails: (data: UserDetailsData) => 
      http.put('/users/details', data),
    selectUserType: (userType: 'client' | 'distributor') => 
      http.post('/users/select-user-type', { user_type: userType }),
  },

  // Productos
  product: {
    getProducts: (params?: ProductFilters) => 
      http.get<ProductsResponse>('/products', { params }),
    getProduct: (id: string) => 
      http.get<Product>(`/products/${id}`),
    getFeaturedProducts: () => 
      http.get<Product[]>('/products/featured'),
    searchProducts: (query: string) => 
      http.get<ProductsResponse>(`/products/search`, { 
        params: { q: query } 
      }),
  },

  // Carrito
  cart: {
    getCart: () => 
      http.get<Cart>('/cart'),
    addToCart: (productId: string, quantity: number) => 
      http.post('/cart/add', { product_id: productId, quantity }),
    updateQuantity: (itemId: string, quantity: number) => 
      http.put(`/cart/${itemId}`, { quantity }),
    removeFromCart: (itemId: string) => 
      http.delete(`/cart/${itemId}`),
    clearCart: () => 
      http.delete('/cart'),
  },

  // Pedidos
  order: {
    createOrder: (data: CreateOrderData) => 
      http.post<Order>('/orders', data),
    getOrders: (params?: OrderFilters) => 
      http.get<OrdersResponse>('/orders', { params }),
    getOrder: (id: string) => 
      http.get<Order>(`/orders/${id}`),
    cancelOrder: (id: string) => 
      http.post(`/orders/${id}/cancel`),
  },

  // Admin - Clientes
  admin: {
    clients: {
      getAll: (params?: ClientFilters) => 
        http.get<ClientsResponse>('/client/', { params }),
      create: (data: ClientCreateData) => 
        http.post<Client>('/client/', data),
      update: (id: string, data: ClientUpdateData) => 
        http.put<Client>(`/client/${id}`, data),
      delete: (id: string) => 
        http.delete(`/client/${id}`),
      importBulk: (data: Client[]) => 
        http.post('/client/bulk', data),
    },

    // Admin - Productos
    products: {
      getAll: (params?: ProductFilters) => 
        http.get('/product/', { params }),
      create: (data: ProductCreateData) => 
        http.post('/product/', data),
      update: (id: string, data: ProductUpdateData) => 
        http.put(`/product/${id}`, data),
      delete: (id: string) => 
        http.delete(`/product/${id}`),
      importBulk: (data: Product[]) => 
        http.post('/product/bulk', data),
    },

    // Admin - Precios
    prices: {
      getAll: (params?: PriceFilters) => 
        http.get('/price/', { params }),
      create: (data: PriceCreateData) => 
        http.post('/price/', data),
      update: (id: string, data: PriceUpdateData) => 
        http.put(`/price/${id}`, data),
      delete: (id: string) => 
        http.delete(`/price/${id}`),
      importBulk: (data: Price[]) => 
        http.post('/price/bulk', data),
      import: (file: File) => 
        http.upload('/price/import', file),
    },

    // Admin - Listas de Precios
    priceLists: {
      getAll: (params?: PriceListFilters) => 
        http.get('/listprice/', { params }),
      create: (data: PriceListCreateData) => 
        http.post('/listprice/', data),
      update: (id: string, data: PriceListUpdateData) => 
        http.put(`/listprice/${id}`, data),
      delete: (id: string) => 
        http.delete(`/listprice/${id}`),
      importBulk: (data: PriceList[]) => 
        http.post('/listprice/bulk', data),
    },

    // Admin - Descuentos
    discounts: {
      getAll: (params?: DiscountFilters) => 
        http.get('/discount/', { params }),
      create: (data: DiscountCreateData) => 
        http.post('/discount/', data),
      createBulk: (data: DiscountCreateData[]) => 
        http.post('/discount/', data),
      update: (id: string, data: DiscountUpdateData) => 
        http.put(`/discount/${id}`, data),
      delete: (id: string) => 
        http.delete(`/discount/${id}`),
    },
  },
};
```

### Uso en Componentes

#### Ejemplo 1: Obtener Productos

```typescript
import { api } from '@/api';
import { useState, useEffect } from 'react';

function ProductsList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.product.getProducts({
          page: 1,
          limit: 20,
          category: 'electronics'
        });
        setProducts(response.data.products);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ... render
}
```

#### Ejemplo 2: Login con Autenticación

```typescript
import { api } from '@/api';
import { useAuthStore } from '@/store/auth';

function LoginForm() {
  const { setUser, setToken } = useAuthStore();

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await api.auth.login({ email, password });
      
      // El token se guarda automáticamente en el interceptor
      setUser(response.data.user);
      setToken(response.data.token);
      
      // Redirigir
      router.push('/');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // ... render
}
```

#### Ejemplo 3: Crear Cliente (Admin)

```typescript
import { api } from '@/api';

async function createClient(data: ClientCreateData) {
  try {
    const response = await api.admin.clients.create(data);
    
    console.log('Cliente creado:', response.data);
    return response.data;
  } catch (error) {
    if (error.status === 409) {
      throw new Error('El cliente ya existe');
    }
    throw error;
  }
}
```

### Manejo de Errores

El cliente HTTP maneja automáticamente los errores comunes:

```typescript
try {
  const response = await api.product.getProducts();
} catch (error) {
  // error es del tipo ApiError con propiedades:
  console.log(error.status);      // 404, 401, 500, etc.
  console.log(error.message);     // Mensaje de error
  console.log(error.data);        // Data del servidor
  
  // Manejo específico
  switch (error.status) {
    case 401:
      // No autorizado (ya manejado por interceptor)
      break;
    case 404:
      // No encontrado
      toast.error('Recurso no encontrado');
      break;
    case 500:
      // Error del servidor
      toast.error('Error del servidor');
      break;
    default:
      toast.error('Error desconocido');
  }
}
```

### Configuración de Proxy en Next.js

#### `next.config.ts` - Desarrollo

```typescript
async rewrites() {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  
  return [
    {
      source: '/api/:path*',
      destination: `${backendUrl}/api/:path*`,
    },
    {
      source: '/redoc',
      destination: `${backendUrl}/redoc`,
    },
    {
      source: '/docs',
      destination: `${backendUrl}/docs`,
    },
  ];
}
```

#### `vercel.json` - Producción

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://virtago-backend.vercel.app/api/:path*"
    }
  ]
}
```

### Variables de Entorno

```bash
# .env.local

# Backend URL (desarrollo)
BACKEND_URL=http://localhost:3001

# Backend URL (producción) - usado por el cliente
NEXT_PUBLIC_API_URL=/api

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dyy8hc876
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=virtago

# OpenAI (opcional para chat)
OPENAI_API_KEY=sk-...
```

---

## 🗄️ Gestión de Estado

Virtago utiliza **múltiples estrategias de gestión de estado** dependiendo del alcance y necesidad:

### 1. Zustand - Estado Global

**Ubicación**: `src/store/`

**Uso**: Estado global persistente y complejo (autenticación, carrito, etc.)

#### Auth Store (`src/store/auth.ts`)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Acciones
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setToken: (token) => {
        if (token) {
          localStorage.setItem('auth_token', token);
        } else {
          localStorage.removeItem('auth_token');
        }
        set({ token });
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.auth.login({ email, password });
          
          get().setUser(response.data.user);
          get().setToken(response.data.token);
          
          showToast('success', 'Bienvenido!');
        } catch (error) {
          showToast('error', 'Error en login');
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        get().setUser(null);
        get().setToken(null);
        localStorage.clear();
        window.location.href = '/login';
      },
    }),
    {
      name: 'auth-storage', // LocalStorage key
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

**Uso en componentes:**

```typescript
import { useAuthStore } from '@/store/auth';

function UserProfile() {
  const { user, logout } = useAuthStore();

  return (
    <div>
      <h1>Hola, {user?.firstName}</h1>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  );
}
```

### 2. React Context - Estado de Aplicación

**Ubicación**: `src/contexts/`

#### Theme Context (`src/contexts/theme-context.tsx`)

```typescript
import { createContext, useContext, useState, useEffect } from 'react';

type ThemeVariant = 'original' | 'ocean' | 'forest' | 'crimson';

interface ThemeContextType {
  currentTheme: ThemeVariant;
  setTheme: (theme: ThemeVariant) => void;
  themeColors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeVariant>('original');

  useEffect(() => {
    const savedTheme = localStorage.getItem('virtago-theme') as ThemeVariant;
    if (savedTheme) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  const setTheme = (theme: ThemeVariant) => {
    setCurrentTheme(theme);
    localStorage.setItem('virtago-theme', theme);
    
    // Aplicar CSS custom properties
    const colors = themes[theme];
    document.documentElement.style.setProperty('--primary', colors.primary);
    // ... más propiedades
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themeColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
```

**Uso:**

```typescript
import { useTheme } from '@/contexts/theme-context';

function ThemeSelector() {
  const { currentTheme, setTheme } = useTheme();

  return (
    <select value={currentTheme} onChange={(e) => setTheme(e.target.value)}>
      <option value="original">Original</option>
      <option value="ocean">Ocean</option>
      <option value="forest">Forest</option>
      <option value="crimson">Crimson</option>
    </select>
  );
}
```

### 3. React Hook Form - Estado de Formularios

**Para formularios complejos con validación:**

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

type FormData = z.infer<typeof schema>;

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}
      
      <button type="submit">Login</button>
    </form>
  );
}
```

### 4. useState/useReducer - Estado Local

**Para estado de componente simple:**

```typescript
function ProductCard({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await api.cart.addToCart(product.id, quantity);
      toast.success('Agregado al carrito');
    } catch (error) {
      toast.error('Error al agregar');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div>
      <input 
        type="number" 
        value={quantity} 
        onChange={(e) => setQuantity(Number(e.target.value))} 
      />
      <button onClick={handleAddToCart} disabled={isAdding}>
        {isAdding ? 'Agregando...' : 'Agregar al Carrito'}
      </button>
    </div>
  );
}
```

### Estrategia de Selección

| Tipo de Estado | Tecnología | Ejemplo |
|----------------|------------|---------|
| **Global Persistente** | Zustand + persist | Auth, User preferences |
| **Global No Persistente** | React Context | Theme, Chat, Loading |
| **Formularios** | React Hook Form | Login, Register, Checkout |
| **Local Simple** | useState | Toggles, counters, modals |
| **Local Complejo** | useReducer | Multi-step wizards |
| **Server State** | React Query (futuro) | Productos, pedidos |

---

## 🎨 Sistema de Temas

Virtago cuenta con un **sistema de temas dinámico** con 4 variantes de color y soporte para modo oscuro/claro.

### Tecnologías Utilizadas

1. **next-themes**: Gestión de dark/light mode
2. **Custom Theme Context**: Gestión de variantes de color
3. **Tailwind CSS**: Variables CSS y clases utility
4. **CSS Custom Properties**: Variables dinámicas

### Configuración de Temas

#### Temas Disponibles

```typescript
// src/contexts/theme-context.tsx

export const themes = {
  original: {
    name: 'Virtago Original',
    primary: '#8b5cf6',     // purple-500
    secondary: '#ec4899',   // pink-500
    accent: '#06b6d4',      // cyan-500
    gradients: {
      primary: 'from-purple-500 to-pink-500',
      secondary: 'from-blue-500 to-cyan-500',
    },
  },
  
  ocean: {
    name: 'Ocean Depths',
    primary: '#3b82f6',     // blue-500
    secondary: '#06b6d4',   // cyan-500
    accent: '#10b981',      // emerald-500
    gradients: {
      primary: 'from-blue-500 to-cyan-500',
      secondary: 'from-cyan-500 to-emerald-500',
    },
  },
  
  forest: {
    name: 'Forest Depths',
    primary: '#10b981',     // emerald-500
    secondary: '#059669',   // emerald-600
    accent: '#3b82f6',      // blue-500
    gradients: {
      primary: 'from-emerald-500 to-green-500',
    },
  },
  
  crimson: {
    name: 'Crimson Nights',
    primary: '#ef4444',     // red-500
    secondary: '#dc2626',   // red-600
    accent: '#f59e0b',      // amber-500
    gradients: {
      primary: 'from-red-500 to-rose-500',
    },
  },
};
```

### Arquitectura del Sistema de Temas

```
┌────────────────────────────────────────┐
│  next-themes Provider                  │
│  (Dark/Light Mode)                     │
└──────────────┬─────────────────────────┘
               │
               ↓
┌──────────────┴─────────────────────────┐
│  ThemeProvider (Custom)                │
│  (Color Variants)                      │
└──────────────┬─────────────────────────┘
               │
               ↓
┌──────────────┴─────────────────────────┐
│  Tailwind CSS + CSS Variables          │
│  (Dynamic Styling)                     │
└────────────────────────────────────────┘
```

### Implementación

#### 1. Layout Principal (`src/app/layout.tsx`)

```typescript
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { ThemeProvider } from '@/contexts/theme-context';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <NextThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </NextThemeProvider>
      </body>
    </html>
  );
}
```

#### 2. Uso en Componentes

**Cambiar entre light/dark:**

```typescript
import { useTheme } from 'next-themes';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}
```

**Cambiar variante de color:**

```typescript
import { useTheme } from '@/contexts/theme-context';

function ColorThemeSelector() {
  const { currentTheme, setTheme, availableThemes } = useTheme();

  return (
    <div>
      {Object.keys(availableThemes).map((themeKey) => (
        <button
          key={themeKey}
          onClick={() => setTheme(themeKey)}
          className={currentTheme === themeKey ? 'active' : ''}
        >
          {availableThemes[themeKey].name}
        </button>
      ))}
    </div>
  );
}
```

#### 3. Clases Tailwind con Temas

```typescript
// Uso de clases con dark mode
<div className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
  <h1 className="text-purple-500 dark:text-purple-400">
    Título con tema
  </h1>
</div>

// Uso de gradientes dinámicos
<div className={`bg-gradient-to-r ${themeColors.gradients.primary}`}>
  Banner con gradiente del tema actual
</div>
```

#### 4. CSS Custom Properties

```css
/* src/app/globals.css */

:root {
  --primary: 139 92 246;        /* purple-500 por defecto */
  --secondary: 236 72 153;      /* pink-500 */
  --accent: 6 182 212;          /* cyan-500 */
  
  --background: 255 255 255;
  --foreground: 15 23 42;
}

.dark {
  --background: 15 23 42;       /* slate-900 */
  --foreground: 248 250 252;    /* slate-50 */
}

/* Las variables se actualizan dinámicamente al cambiar de tema */
```

### Ejemplo Completo de Componente con Temas

```typescript
import { useTheme } from 'next-themes';
import { useTheme as useColorTheme } from '@/contexts/theme-context';

function ThemedCard({ title, description }: Props) {
  const { theme } = useTheme();  // dark/light
  const { themeColors } = useColorTheme();  // color variant

  return (
    <div className="relative overflow-hidden rounded-lg 
                    bg-white dark:bg-slate-800 
                    border border-gray-200 dark:border-slate-700
                    shadow-lg hover:shadow-xl transition-all">
      
      {/* Gradiente dinámico basado en tema de color */}
      <div 
        className={`h-2 bg-gradient-to-r ${themeColors.gradients.primary}`}
      />
      
      <div className="p-6">
        <h3 className="text-2xl font-bold 
                       text-gray-900 dark:text-white
                       mb-2">
          {title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300">
          {description}
        </p>
        
        <button 
          style={{ backgroundColor: themeColors.primary }}
          className="mt-4 px-4 py-2 rounded-lg text-white
                     hover:opacity-90 transition-opacity">
          Ver más
        </button>
      </div>
    </div>
  );
}
```

---

## 🛠️ Servicios y Utilidades

### Cloudinary Service

**Ubicación**: `src/services/cloudinary.ts`

**Funcionalidad**: Subida de imágenes con generación automática de blur placeholders.

```typescript
import { uploadImageToCloudinary } from '@/services/cloudinary';

async function handleImageUpload(file: File) {
  try {
    const result = await uploadImageToCloudinary(file, (progress) => {
      console.log(`Progreso: ${progress.percentage}%`);
    });
    
    console.log('URL:', result.url);
    console.log('Blur DataURL:', result.blurDataURL);
    
  } catch (error) {
    console.error('Error subiendo imagen:', error);
  }
}
```

**Características:**
- ✅ Progreso de subida en tiempo real
- ✅ Generación automática de blur placeholder
- ✅ Transformaciones de imagen (resize, crop, etc.)
- ✅ Organización en carpetas (`/products`, `/banners`, etc.)

### Image Vision Service

**Ubicación**: `src/services/image-vision.service.ts`

**Funcionalidad**: Análisis de imágenes con IA (Cloudinary AI + OpenAI Vision).

```typescript
import { analyzeProductImage } from '@/services/image-vision.service';

const analysis = await analyzeProductImage(imageUrl);

console.log('Categorías detectadas:', analysis.categories);
console.log('Descripción:', analysis.description);
console.log('Tags:', analysis.tags);
```

**Características:**
- 🤖 Detección automática de productos
- 🏷️ Generación de tags y categorías
- 📝 Descripciones automáticas
- 🎨 Análisis de colores dominantes

### API Helpers

**Ubicación**: `src/store/api-helpers.ts`

Funciones auxiliares para llamadas API comunes:

```typescript
export const apiHelpers = {
  // Manejo de errores genérico
  handleError: (error: unknown) => {
    if (isApiError(error)) {
      return error.message;
    }
    return 'Error desconocido';
  },
  
  // Transformar datos para el backend
  transformClientData: (data: ClientFormData) => ({
    ...data,
    // Transformaciones específicas
  }),
};
```

### Toast Helpers

**Ubicación**: `src/store/toast-helpers.ts`

Sistema centralizado de notificaciones:

```typescript
import { showToast } from '@/store/toast-helpers';

// Success toast
showToast('success', 'Cliente creado correctamente');

// Error toast
showToast('error', 'Error al crear cliente');

// Info toast
showToast('info', 'Procesando...');

// Warning toast
showToast('warning', 'La sesión expirará pronto');

// Custom toast con posición
showToast('success', 'Guardado', { 
  position: 'bottom-right',
  duration: 5000 
});
```

### Utilidades Generales

**Ubicación**: `src/lib/utils.ts`

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Combinar clases de Tailwind sin conflictos
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formatear precio
export function formatPrice(price: number, currency = 'USD'): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
  }).format(price);
}

// Formatear fecha
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

// Debounce
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Truncar texto
export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + '...' : str;
}

// Validar email
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Generar ID único
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
```

---

## 🧩 Componentes Principales

### Estructura de Componentes

Virtago sigue una **arquitectura de componentes atómicos** inspirada en Atomic Design:

```
Components/
├── ui/                    # Átomos - Componentes básicos
├── products/              # Moléculas - Componentes de producto
├── cart/                  # Moléculas - Componentes de carrito
├── layout/                # Organismos - Layout y navegación
├── admin/                 # Organismos - Componentes de admin
└── providers/             # Utilidades - Providers
```

### UI Components (Átomos)

Componentes base reutilizables ubicados en `src/components/ui/`:

#### Button

```typescript
// src/components/ui/button.tsx
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary/90',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
        outline: 'border border-gray-300 hover:bg-gray-100',
        ghost: 'hover:bg-gray-100',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-11 px-8 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
```

**Uso:**

```typescript
<Button variant="default" size="md">Guardar</Button>
<Button variant="destructive">Eliminar</Button>
<Button variant="outline" size="sm">Cancelar</Button>
```

#### Input

```typescript
// src/components/ui/input.tsx
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border border-gray-300',
          'bg-white px-3 py-2 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-primary',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'dark:bg-slate-800 dark:border-slate-600',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
```

### Product Components (Moléculas)

#### ProductCard

```typescript
// src/components/products/ProductCard.tsx
import Image from 'next/image';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { user } = useAuthStore();
  const showPrice = !!user; // Solo mostrar precio si está autenticado

  return (
    <div className="group relative bg-white dark:bg-slate-800 rounded-lg 
                    border border-gray-200 dark:border-slate-700
                    hover:shadow-xl transition-all duration-300">
      
      {/* Imagen */}
      <div className="relative h-64 overflow-hidden rounded-t-lg">
        <Image
          src={product.images[0] || '/placeholder.jpg'}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform"
          placeholder="blur"
          blurDataURL={product.blurDataURL}
        />
        
        {product.featured && (
          <span className="absolute top-2 right-2 bg-primary text-white 
                          px-2 py-1 rounded text-xs font-bold">
            Destacado
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">
          {product.name}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Precio - Solo visible si está autenticado */}
        {showPrice ? (
          <div className="flex items-baseline gap-2 mb-3">
            {product.discountPrice ? (
              <>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(product.discountPrice)}
                </span>
                <span className="text-sm line-through text-gray-500">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        ) : (
          <div className="mb-3 text-sm text-gray-500 dark:text-gray-400">
            Inicia sesión para ver precios
          </div>
        )}

        {/* Stock */}
        <div className="flex items-center gap-2 mb-3">
          <span className={cn(
            'h-2 w-2 rounded-full',
            product.stock > 10 ? 'bg-green-500' : 'bg-orange-500'
          )} />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {product.stock > 0 ? `${product.stock} en stock` : 'Sin stock'}
          </span>
        </div>

        {/* Botón */}
        {showPrice && product.stock > 0 && (
          <Button 
            onClick={() => onAddToCart?.(product)}
            className="w-full"
          >
            Agregar al Carrito
          </Button>
        )}
      </div>
    </div>
  );
}
```

#### ProductGrid

```typescript
// src/components/products/ProductGrid.tsx
import { ProductCard } from './ProductCard';
import { Product } from '@/types';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
}

export function ProductGrid({ products, isLoading }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No se encontraron productos</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border 
                    border-gray-200 dark:border-slate-700 animate-pulse">
      <div className="h-64 bg-gray-300 dark:bg-slate-700 rounded-t-lg" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-300 dark:bg-slate-700 rounded w-3/4" />
        <div className="h-3 bg-gray-300 dark:bg-slate-700 rounded w-full" />
        <div className="h-3 bg-gray-300 dark:bg-slate-700 rounded w-2/3" />
        <div className="h-10 bg-gray-300 dark:bg-slate-700 rounded" />
      </div>
    </div>
  );
}
```

### Layout Components (Organismos)

#### Header

```typescript
// src/components/layout/Header.tsx
import { useAuthStore } from '@/store/auth';
import { useTheme } from 'next-themes';
import { ShoppingCart, User, Moon, Sun, Menu } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b 
                       bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Virtago" width={32} height={32} />
          <span className="text-xl font-bold">Virtago</span>
        </Link>

        {/* Navegación Desktop */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/productos" className="hover:text-primary">
            Productos
          </Link>
          <Link href="/marcas" className="hover:text-primary">
            Marcas
          </Link>
          <Link href="/ofertas" className="hover:text-primary">
            Ofertas
          </Link>
        </nav>

        {/* Acciones */}
        <div className="flex items-center gap-4">
          
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Cart */}
          <Link href="/cart" className="relative p-2">
            <ShoppingCart size={24} />
            <span className="absolute -top-1 -right-1 bg-primary text-white
                           text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </Link>

          {/* User */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2">
                  <User size={24} />
                  <span className="hidden md:inline">{user.firstName}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Link href="/perfil">Mi Perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/mis-pedidos">Mis Pedidos</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button>Iniciar Sesión</Button>
            </Link>
          )}

          {/* Mobile Menu */}
          <button className="md:hidden p-2">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}
```

### Admin Components (Organismos Complejos)

#### QuickSetupWizard

Wizard de configuración inicial multi-paso ubicado en `src/components/admin/quick-setup/`:

```
quick-setup/
├── QuickSetupWizard.tsx    # Componente principal del wizard
└── steps/
    ├── ClientStep.tsx       # Paso 1: Importar clientes
    ├── ProductStep.tsx      # Paso 2: Importar productos
    ├── PriceListStep.tsx    # Paso 3: Crear listas de precios
    ├── PriceStep.tsx        # Paso 4: Asignar precios
    ├── DiscountStep.tsx     # Paso 5: Configurar descuentos
    └── PreviewStep.tsx      # Paso 6: Vista previa y confirmación
```

**Características:**
- ✅ Multi-paso con navegación
- ✅ Validación en cada paso
- ✅ Importación de Excel
- ✅ Vista previa de datos
- ✅ Guardado automático de progreso

---

## 🧪 Sistema de Pruebas

### Playwright E2E Testing

**Ubicación**: `tests/`

**Configuración**: `playwright.config.ts`

#### Configuración

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3002',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3002',
    reuseExistingServer: !process.env.CI,
  },
});
```

#### Test Example

```typescript
// tests/homepage.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Virtago/);
  });

  test('should display hero banner', async ({ page }) => {
    await page.goto('/');
    
    const banner = page.locator('[data-testid="hero-banner"]');
    await expect(banner).toBeVisible();
  });

  test('should navigate to products page', async ({ page }) => {
    await page.goto('/');
    
    await page.click('text=Productos');
    await expect(page).toHaveURL(/\/productos/);
  });
});

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Cerrar Sesión')).toBeVisible();
  });
});
```

#### Scripts de Testing

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report"
  }
}
```

#### Ejecutar Tests

```bash
# Ejecutar todos los tests
pnpm test:e2e

# Ejecutar con UI mode (interactivo)
pnpm test:e2e:ui

# Ejecutar en modo debug
pnpm test:e2e:debug

# Ver reporte de última ejecución
pnpm test:e2e:report
```

### Best Practices de Testing

1. **Test IDs**: Usar `data-testid` para selectores estables
2. **Page Objects**: Crear objetos de página reutilizables
3. **Fixtures**: Usar fixtures para datos de prueba
4. **Isolation**: Cada test debe ser independiente
5. **Snapshots**: Usar snapshots para comparaciones visuales

---

## ⚙️ Configuración y Deployment

### Variables de Entorno

#### Desarrollo (`. env.local`)

```bash
# Backend
BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=/api

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dyy8hc876
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=virtago

# OpenAI (opcional)
OPENAI_API_KEY=sk-...

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=...
```

#### Producción (Vercel)

Variables configuradas en el panel de Vercel:
- `BACKEND_URL`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
- `OPENAI_API_KEY`

### Scripts NPM/PNPM

```json
{
  "scripts": {
    "dev": "next dev -p 3002",
    "build": "next build",
    "start": "next start -p 3002",
    "lint": "eslint",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report"
  }
}
```

#### Ejecutar Scripts

```bash
# Desarrollo
pnpm dev

# Build para producción
pnpm build

# Producción local
pnpm start

# Linting
pnpm lint

# Testing E2E
pnpm test:e2e
```

### Deployment en Vercel

#### 1. Configuración Automática

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel
```

#### 2. Configuración Manual

**vercel.json:**

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://virtago-backend.vercel.app/api/:path*"
    }
  ],
  "headers": [
    {
      "source": "/api/:path*",
      "headers": [
        {
          "key": "Access-Control-Allow-Credentials",
          "value": "true"
        },
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

#### 3. Configuración de Variables de Entorno

En el dashboard de Vercel:

1. Settings → Environment Variables
2. Agregar todas las variables necesarias
3. Configurar para Production, Preview, y Development

### Optimizaciones de Producción

#### Next.js Config

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  // Imágenes remotas permitidas
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },

  // Ignore durante builds
  typescript: {
    ignoreBuildErrors: false,  // Cambiar a false en producción
  },
  eslint: {
    ignoreDuringBuilds: false,  // Cambiar a false en producción
  },

  // Compresión
  compress: true,

  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};
```

#### Optimización de Bundle

- ✅ **Tree Shaking**: Automático con Next.js 15
- ✅ **Code Splitting**: Por ruta automático
- ✅ **Dynamic Imports**: Para componentes pesados
- ✅ **Image Optimization**: Con `next/image`
- ✅ **Font Optimization**: Con `@next/font`

#### Ejemplo de Dynamic Import

```typescript
import dynamic from 'next/dynamic';

// Lazy load de componente pesado
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
  ssr: false,  // Solo en cliente
});

// Lazy load con suspense
const ChatSystem = dynamic(() => import('@/components/chat/ChatSystem'), {
  suspense: true,
});
```

### Monitoreo y Analytics

#### Vercel Analytics

```typescript
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

#### Console Logs en Producción

**Importante**: Remover console.logs de producción:

```typescript
// next.config.ts
const nextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
};
```

---

## 📖 Best Practices

### Código

1. **TypeScript Strict Mode**: Siempre usar `strict: true`
2. **Nomenclatura**: `camelCase` para variables, `PascalCase` para componentes
3. **Exports**: Named exports para componentes, default para páginas
4. **Imports Order**: 
   - React/Next
   - Third-party libraries
   - Internal components
   - Utilities
   - Types
   - Styles

```typescript
// ✅ Correcto
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

// ❌ Incorrecto (desordenado)
import type { Product } from '@/types';
import { useState } from 'react';
import { formatPrice } from '@/lib/utils';
```

### Componentes

1. **Single Responsibility**: Un componente, una responsabilidad
2. **Props Interface**: Siempre tipar las props
3. **Default Props**: Usar valores por defecto cuando sea necesario
4. **Composición sobre Herencia**: Preferir composición
5. **Memoización**: Usar `memo`, `useMemo`, `useCallback` cuando sea necesario

```typescript
// ✅ Correcto
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  onClick 
}: ButtonProps) {
  return (
    <button onClick={onClick} className={cn(variant, size)}>
      {children}
    </button>
  );
}

// ❌ Incorrecto (sin tipos)
export function Button(props) {
  return <button {...props} />;
}
```

### Performance

1. **Image Optimization**: Siempre usar `next/image`
2. **Lazy Loading**: Dynamic imports para componentes pesados
3. **Memoización**: Evitar re-renders innecesarios
4. **Debouncing**: Para búsquedas y inputs
5. **Virtual Lists**: Para listas largas (react-window)

### Seguridad

1. **Sanitización**: Sanitizar inputs de usuario
2. **CORS**: Configurar correctamente
3. **JWT**: Tokens con expiración
4. **HTTPS**: Solo en producción
5. **Environment Variables**: Nunca commitear secrets

### Accesibilidad

1. **Semantic HTML**: Usar elementos semánticos
2. **ARIA Labels**: Para elementos interactivos
3. **Keyboard Navigation**: Tab, Enter, Escape
4. **Color Contrast**: WCAG AA minimum
5. **Screen Readers**: Textos descriptivos

```typescript
// ✅ Buenas prácticas de accesibilidad
<button
  aria-label="Agregar al carrito"
  aria-pressed={isInCart}
  onClick={handleAddToCart}
>
  <ShoppingCart aria-hidden="true" />
  <span className="sr-only">Agregar al carrito</span>
</button>
```

### Git Workflow

1. **Branches**: `feature/`, `fix/`, `hotfix/`
2. **Commits**: Conventional Commits
3. **Pull Requests**: Siempre revisar antes de merge
4. **Tags**: Versiones semánticas (v1.0.0)

```bash
# ✅ Buenos commits
git commit -m "feat: add product filters"
git commit -m "fix: resolve cart quantity bug"
git commit -m "docs: update API documentation"

# ❌ Malos commits
git commit -m "changes"
git commit -m "fix"
git commit -m "wip"
```

---

## 📞 Soporte y Contacto

### Documentación Adicional

- [README.md](./README.md) - Información general del proyecto
- [src/api/README.md](./src/api/README.md) - Sistema API detallado
- [WIZARD_README.md](./WIZARD_README.md) - Wizard de configuración
- [THEME_SYSTEM_README.md](./THEME_SYSTEM_README.md) - Sistema de temas
- [CLOUDINARY_AI_SYSTEM_FINAL.md](./CLOUDINARY_AI_SYSTEM_FINAL.md) - Integración con IA

### Recursos Externos

- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Playwright**: https://playwright.dev
- **Zustand**: https://zustand-demo.pmnd.rs/

---

## 📝 Changelog

### v0.1.0 (Actual)

- ✅ Sistema de autenticación con JWT
- ✅ Catálogo de productos con filtros
- ✅ Carrito de compras
- ✅ Panel de administración
- ✅ Wizard de configuración inicial
- ✅ Sistema de temas con 4 variantes
- ✅ Integración con Cloudinary
- ✅ Sistema de chat con IA
- ✅ Testing E2E con Playwright

---

**Última actualización**: Febrero 2026  
**Versión**: 0.1.0  
**Mantenido por**: Virtago Team
