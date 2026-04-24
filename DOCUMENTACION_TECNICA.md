# Virtago V2 — Documentación Técnica

> Última actualización: 2026-04-23  
> Frontend: `D:\Proyecto\virtago2` → https://github.com/Shadowscr-7/virtago2.git  
> Backend: `D:\Proyecto\VirtagoV2\backend aws\Virtago-Backend` → https://github.com/Shadowscr-7/Virtago-Backend

---

## 1. Arquitectura General

Virtago V2 es una plataforma B2B de e-commerce multi-marca orientada a distribuidores. Consta de:

- **Frontend**: Next.js 16 (App Router) — desplegado en Vercel → `https://www.virtago.shop`
- **Backend**: Express.js + Firebase Admin SDK — desplegado en Vercel → `https://virtago-backend.vercel.app/api`
- **Base de datos**: Firestore (Firebase/Google Cloud) — Proyecto: `virtago-4de9f`
- **Almacenamiento de imágenes**: Cloudinary (`dyy8hc876`)
- **Email**: Mailgun / Nodemailer

---

## 2. Frontend (`D:\Proyecto\virtago2`)

### Stack
| Tecnología | Versión | Uso |
|------------|---------|-----|
| Next.js | 16.1.6 | Framework React (App Router) |
| React | 19.1.0 | UI |
| TypeScript | 5.x | Tipado |
| Tailwind CSS | v4 | Estilos (via `@import "tailwindcss"`) |
| Zustand | 5.0.8 | Estado global (auth, cart) |
| Framer Motion | latest | Animaciones |
| Axios | latest | HTTP client |
| next-themes | latest | Dark/light mode base |
| Playwright | latest | Tests E2E |
| Sentry | latest | Monitoreo de errores |
| Sonner | latest | Notificaciones toast |
| Lucide React | latest | Iconos |

### Ramas Git
| Rama | Uso |
|------|-----|
| `master` | Código principal |
| `dev` | Desarrollo |
| `prod` | Deploy a producción |
| `test` | Testing |

### Estructura de Directorios
```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout con providers
│   ├── page.tsx            # Home público
│   ├── globals.css         # CSS global + variables de tema
│   ├── admin/              # Panel administrador/distribuidor
│   │   ├── page.tsx        # Dashboard
│   │   ├── clientes/       # ABM Clientes
│   │   ├── productos/      # ABM Productos
│   │   ├── imagenes/       # Gestión de imágenes + IA
│   │   ├── listas-precios/ # Lista de precios
│   │   ├── precios/        # Precios por distribuidor
│   │   ├── descuentos/     # Descuentos
│   │   ├── ordenes/        # Órdenes
│   │   ├── cupones/        # Cupones
│   │   ├── tests/          # Tests E2E viewer (oculto para distributor)
│   │   ├── tutoriales/     # Tutoriales
│   │   └── configuracion-rapida/ # Setup wizard
│   ├── api/                # Next.js API Routes (proxy al backend)
│   │   ├── ai/             # AI: chat, análisis de errores
│   │   ├── clients/        # CRUD clientes + importación
│   │   ├── products/       # Match de productos
│   │   ├── product-images/ # Gestión imágenes de productos
│   │   ├── images/         # Análisis IA de imágenes
│   │   └── discounts/      # Descuentos
│   ├── producto/[id]/      # Detalle de producto (público)
│   ├── productos/          # Catálogo (público)
│   ├── marcas/             # Marcas (público)
│   ├── ofertas/            # Ofertas (público)
│   ├── contacto/           # Contacto (público)
│   ├── checkout/           # Checkout (requiere auth)
│   ├── favoritos/          # Favoritos (requiere auth)
│   ├── perfil/             # Perfil usuario (requiere auth)
│   ├── mis-pedidos/        # Pedidos (requiere auth)
│   ├── login/              # Login
│   ├── register/           # Registro multi-step
│   ├── configuracion/      # Configuración cuenta
│   ├── geo-blocked/        # Página de bloqueo geográfico
│   └── themes/             # Demo de temas
├── components/
│   ├── admin/
│   │   ├── admin-sidebar.tsx  # Menú lateral (Tests E2E oculto para distributor)
│   │   ├── clients/        # Tabla, importación, modales
│   │   ├── products/       # ABM Productos
│   │   ├── listas-precios/ # Listas de precios
│   │   ├── precios/        # Precios
│   │   ├── descuentos/     # Descuentos
│   │   ├── orders/         # Órdenes
│   │   ├── quick-setup/    # Wizard de configuración rápida
│   │   ├── shared/         # ColumnMappingModal, etc.
│   │   └── images/         # Upload y asignación con IA
│   ├── auth/               # Registro multi-step
│   ├── layout/
│   │   ├── navbar.tsx      # Navbar pública con ThemeSelector
│   │   └── client-layout.tsx
│   ├── ui/
│   │   ├── theme-selector.tsx  # Modal selector de temas
│   │   └── toast.tsx
│   └── providers/
│       ├── theme-provider.tsx
│       └── loading-provider.tsx
├── contexts/
│   └── theme-context.tsx   # 4 presets de tema claro
├── store/
│   ├── auth.ts             # Zustand auth store (persist)
│   ├── api-helpers.ts
│   ├── error-analyzer.ts   # Análisis de errores con IA
│   └── toast-helpers.ts
├── api/
│   ├── http-client.ts      # Axios instance con interceptors y token
│   ├── index.ts            # Tipos e interfaces de API
│   └── base.ts             # fetch-based helpers
├── services/
│   ├── dashboard.service.ts
│   ├── cloudinary.ts
│   ├── image-vision.service.ts
│   └── onboarding.service.ts
└── middleware.ts            # Geo-blocking (solo Uruguay en producción)
```

### Sistema de Autenticación

**Store**: `src/store/auth.ts` — Zustand con middleware `persist`

```typescript
// Estado principal
{ user, token, isAuthenticated, isLoading, registrationStep }

// Roles
user.role: 'user' | 'admin' | 'distributor'
user.userType: 'client' | 'distributor'

// Token en localStorage
'token'           // clave principal
'auth_token'      // compatibilidad
'temp_auth_token' // solo durante flujo de registro
```

**Flujo de registro (6 pasos)**:
1. `register-form.tsx` → `POST /api/auth/register` → OTP por email
2. `otp-verification.tsx` → `POST /api/auth/verify-otp`
3. `user-type-selection.tsx` → client o distributor
4. (si distribuidor) `personal-info-form.tsx`
5. (si distribuidor) `business-info-form.tsx`
6. (si distribuidor) `plan-selection.tsx` → `POST /api/distributors/create` → redirect `/admin`

**HTTP Client** (`src/api/http-client.ts`):
- Axios con `baseURL: process.env.NEXT_PUBLIC_API_URL || '/api'`
- Interceptor agrega `Authorization: Bearer <token>` en cada request
- Timeout: 30 segundos
- Reintento en 401

### Sistema de Temas

**Contexto**: `src/contexts/theme-context.tsx`

| Key | Nombre | Primary | Surface |
|-----|--------|---------|---------|
| `light-blue` | Azul | `#1E3A61` | `#f1f5f9` |
| `light-green` | Verde | `#1B6B3A` | `#f0fdf4` |
| `light-orange` | Naranja | `#C45000` | `#fff7ed` |
| `light-purple` | Morado | `#4A148C` | `#faf5ff` |

Todos tienen `background: #ffffff` y texto oscuro (`#0f172a`). Las variables CSS `--theme-*` se inyectan en `:root` vía `useEffect`. El tema persiste en `localStorage` key `virtago-theme`.

**Cómo cambiar el default**: editar `useState<ThemeVariant>("light-blue")` en `theme-context.tsx`.

### Middleware

`src/middleware.ts` — Geo-blocking:
- Solo permite acceso desde Uruguay (`UY`) en producción
- En desarrollo (sin header de país) siempre permite paso
- Redirige a `/geo-blocked` si el país no está habilitado

### Tests E2E (Playwright)

| Archivo | Casos | Descripción |
|---------|-------|-------------|
| `tests/wizard-setup.spec.ts` | 44 | Flujo wizard de configuración |
| `tests/admin-crud.spec.ts` | 62 | ABM: Clientes, Productos, Listas, Precios, Descuentos |
| `tests/onboarding-distributor.spec.ts` | — | Flujo registro distribuidor |
| `tests/export-tests-to-xlsx.ts` | 141 total | Generador de reporte XLSX |
| `tests/fixtures/` | 7 archivos | XLSX para import/mapping |

### Menú Sidebar Admin

```
Inicio                → /admin
Configuración Rápida  → /admin/configuracion-rapida
Clientes              → /admin/clientes
Productos             → /admin/productos
Imágenes              → /admin/imagenes
Lista de Precios      → /admin/listas-precios
Precios               → /admin/precios
Descuentos            → /admin/descuentos
Órdenes               → /admin/ordenes
Cupones               → /admin/cupones
Tests E2E             → /admin/tests   [oculto para rol distributor]
Tutoriales            → /admin/tutoriales
Documentación         → /redoc-es      [link externo]
```

---

## 3. Backend (`D:\Proyecto\VirtagoV2\backend aws\Virtago-Backend`)

### Stack
| Tecnología | Uso |
|------------|-----|
| Express.js 4 | Framework HTTP |
| Firebase Admin SDK | Acceso a Firestore |
| Firestore | Base de datos NoSQL principal |
| JWT | Tokens de autenticación (24h) |
| bcrypt | Hash de contraseñas |
| Nodemailer + Mailgun | Envío de emails (OTP, notificaciones) |
| Cloudinary | Almacenamiento de imágenes |
| Stripe | Pagos |
| OpenAI | IA (análisis imágenes, chat) |

### Variables de Entorno
```env
PORT=3001
JWT_SECRET=Vu_KXSpKlnyOJRJQEcXoH86eB1jE1PoBeAExodbr
FIREBASE_PROJECT_ID=virtago-4de9f
CLOUDINARY_CLOUD_NAME=dyy8hc876
BASE_CURRENCY=USD
SHIPPING_FEE=10
```

### Endpoints Principales

#### Auth — `/api/auth/`
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/register` | Registro + envío OTP |
| POST | `/verify-otp` | Verificación OTP |
| POST | `/resend-otp` | Reenvío OTP |
| POST | `/login` | Login → `{ token, user }` |
| PUT | `/update-user-details` | Actualiza firstName, lastName, phone, address, city, zip, country, role, distributorCode, planName |

#### Distribuidores — `/api/distributors/`
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/create` | Crea distribuidor completo con plan |

#### Productos — `/api/products/`
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Lista (filtra por `distributorCode`) |
| GET | `/:id` | Detalle |
| POST | `/` | Crear |
| PUT | `/:id` | Actualizar |
| DELETE | `/:id` | Eliminar |

#### Clientes — `/api/clients/`
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Lista por distribuidor |
| POST | `/` | Crear |
| PUT | `/:id` | Actualizar |
| DELETE | `/:id` | Eliminar |
| POST | `/import` | Importación masiva XLSX |

#### Imágenes — `/api/product-images/`
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/my-distributor` | Imágenes del distribuidor |
| POST | `/` | Subir (Cloudinary) |
| POST | `/assign` | Asignar a producto |
| POST | `/re-analyze` | Re-analizar con IA |
| DELETE | `/batch-delete` | Eliminación masiva |

### Colecciones Firestore

| Colección | Descripción |
|-----------|-------------|
| `users` | Usuarios (clientes y distribuidores) |
| `distributors` | Info extendida de distribuidores |
| `products` | Catálogo de productos |
| `product_images` | Imágenes vinculadas a productos |
| `clients` | Clientes de cada distribuidor |
| `orders` | Órdenes de compra |
| `price_lists` | Listas de precios |
| `prices` | Precios por producto/distribuidor |
| `discounts` | Descuentos |
| `coupons` | Cupones |
| `plans` | Planes de suscripción |

---

## 4. Flujos Clave

### Registro Distribuidor
1. `/register` → OTP email
2. Verificar OTP
3. Seleccionar tipo "Distribuidor"
4. Info personal (nombre, teléfono, dirección, país)
5. Info empresarial (nombre empresa, RUT, código distribuidor)
6. Selección plan → `createDistributor` API
7. Redirect `/admin`

### Imágenes con IA
1. Admin sube imágenes en `/admin/imagenes`
2. Cloudinary almacena
3. OpenAI Vision analiza e identifica el producto
4. Sistema sugiere match con el catálogo
5. Admin confirma asignación → vinculado en Firestore

### Importación de Clientes
1. Descargar template XLSX desde `/admin/clientes`
2. Completar y subir
3. `ColumnMappingModal` mapea columnas
4. Importación masiva en Firestore

---

## 5. Control de Acceso

### Páginas Públicas (sin auth requerida)
`/`, `/producto/[id]`, `/productos`, `/marcas`, `/ofertas`, `/contacto`, `/login`, `/register`

### Páginas Protegidas
`/admin/*`, `/checkout`, `/favoritos`, `/perfil`, `/mis-pedidos`, `/configuracion/*`

### Roles
| Rol | Permisos |
|-----|----------|
| `user` | Páginas públicas + checkout + perfil |
| `admin` | Todo (incluyendo Tests E2E) |
| `distributor` | Panel admin completo, excepto Tests E2E |

---

## 6. Integraciones Externas

| Servicio | Uso |
|----------|-----|
| Cloudinary | Imágenes de productos |
| OpenAI | Vision (análisis imágenes) + Chat IA |
| Stripe | Pagos |
| Mailgun | OTP y notificaciones email |
| Sentry | Monitoreo de errores |
| Vercel | Deploy frontend y backend |
| Firebase/Firestore | Base de datos |

---

## 7. Desarrollo Local

### Frontend
```bash
cd D:\Proyecto\virtago2
npm install
npm run dev    # http://localhost:3000
```
`.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Backend
```bash
cd "D:\Proyecto\VirtagoV2\backend aws\Virtago-Backend"
npm install
npm run dev    # http://localhost:3001
```
