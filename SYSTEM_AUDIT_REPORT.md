# 🔍 Auditoría Completa del Sistema — Virtago2

**Fecha:** 9 de Marzo de 2026  
**Alcance:** Análisis completo de seguridad, calidad de código, arquitectura, código muerto, duplicados, configuración y testing.

---

## Tabla de Contenidos

1. [Estado Actual del Testing](#1-estado-actual-del-testing)
2. [Recomendación de Framework de Testing](#2-recomendación-de-framework-de-testing)
3. [Vulnerabilidades de Seguridad](#3-vulnerabilidades-de-seguridad)
4. [Problemas de Código y Lógica](#4-problemas-de-código-y-lógica)
5. [Código Muerto](#5-código-muerto)
6. [Código Duplicado](#6-código-duplicado)
7. [Problemas de Configuración](#7-problemas-de-configuración)
8. [Problemas de Arquitectura](#8-problemas-de-arquitectura)
9. [Problemas de Performance](#9-problemas-de-performance)
10. [Accesibilidad](#10-accesibilidad)
11. [Organización del Proyecto](#11-organización-del-proyecto)
12. [Resumen y Prioridades](#12-resumen-y-prioridades)

---

## 1. Estado Actual del Testing

### ✅ Lo que ya tienen

El proyecto **ya tiene Playwright** configurado para E2E testing con una infraestructura bastante completa:

| Componente | Estado | Ubicación |
|------------|--------|-----------|
| Playwright instalado | ✅ | `@playwright/test ^1.55.1` |
| Config multi-browser | ✅ | `playwright.config.ts` (Chromium, Firefox, WebKit, Mobile) |
| Test Homepage | ✅ | `tests/homepage.spec.ts` |
| Test Registro | ✅ | `tests/register.spec.ts` (214 líneas, 7 tests) |
| Reporter HTML | ✅ | `reporter: 'html'` |
| Screenshots/Videos | ✅ | En fallas |
| Trace viewer | ✅ | `trace: 'on-first-retry'` |
| Scripts NPM | ✅ | 5 scripts (`test:e2e`, `test:e2e:ui`, `test:e2e:headed`, `test:e2e:debug`, `test:e2e:report`) |

### Scripts disponibles
```bash
pnpm test:e2e           # Ejecutar headless (background)
pnpm test:e2e:ui        # Panel visual interactivo (ver ejecución en vivo)
pnpm test:e2e:headed    # Ver navegador ejecutando tests
pnpm test:e2e:debug     # Modo paso a paso
pnpm test:e2e:report    # Ver reporte HTML con screenshots, videos, traces
```

### ❌ Lo que falta

- **Solo 2 archivos de test** (homepage básico + registro)
- **0 tests unitarios** (no hay Jest/Vitest)
- **0 tests de API/integración**
- **0 tests para flujos admin** (productos, clientes, precios, descuentos)
- **0 tests para autenticación/autorización**
- **No hay CI/CD** ejecutando tests automáticamente

---

## 2. Recomendación de Framework de Testing

### Ya tienen lo necesario — Playwright es la solución completa

**Playwright ya cubre todo lo que necesitan:**

| Necesidad | Solución con Playwright | Comando |
|-----------|------------------------|---------|
| Tests en background (headless) | `pnpm test:e2e` | Automático |
| Ver ejecución en navegador | `pnpm test:e2e:headed` | Con navegador visible |
| Panel visual interactivo | `pnpm test:e2e:ui` | **Panel web con timeline** |
| Debug paso a paso | `pnpm test:e2e:debug` | Inspector de Playwright |
| Reporte con screenshots/videos | `pnpm test:e2e:report` | HTML interactivo |
| Tests de API sin navegador | `test(async ({ request }) => ...)` | Sin browser |
| Ejecutar tests individuales | `pnpm test:e2e tests/archivo.spec.ts` | Selectivo |
| Ejecutar tests por tag | `pnpm test:e2e --grep @smoke` | Por etiqueta |

### Para complementar (opcional, gratuito):

| Herramienta | Propósito | Costo |
|-------------|-----------|-------|
| **Vitest** | Tests unitarios (funciones, utils, stores) | Gratis |
| **Playwright UI Mode** | Ya incluido — panel visual para debugging | Gratis |
| **Playwright HTML Reporter** | Ya incluido — reportes detallados | Gratis |
| **GitHub Actions** | CI/CD para ejecutar tests en cada push | Gratis (2000 min/mes) |

### Estructura de tests recomendada

```
tests/
├── e2e/                        # Tests E2E (flujos completos)
│   ├── auth/
│   │   ├── login.spec.ts
│   │   ├── register.spec.ts
│   │   └── logout.spec.ts
│   ├── admin/
│   │   ├── dashboard.spec.ts
│   │   ├── products.spec.ts
│   │   ├── clients.spec.ts
│   │   ├── price-lists.spec.ts
│   │   └── discounts.spec.ts
│   ├── catalog/
│   │   ├── browse-products.spec.ts
│   │   ├── search-filter.spec.ts
│   │   └── product-detail.spec.ts
│   ├── cart/
│   │   ├── add-to-cart.spec.ts
│   │   └── checkout.spec.ts
│   └── onboarding/
│       └── wizard-flow.spec.ts
├── api/                        # Tests de API (sin browser)
│   ├── auth.api.spec.ts
│   ├── products.api.spec.ts
│   ├── clients.api.spec.ts
│   └── proxy.api.spec.ts
├── fixtures/                   # Data y helpers compartidos
│   ├── auth.fixture.ts
│   └── test-data.ts
└── global-setup.ts             # Setup global (login, etc.)
```

---

## 3. Vulnerabilidades de Seguridad

### 🔴 CRÍTICAS (Requieren acción inmediata)

#### 3.1 API Key de OpenAI expuesta al navegador
- **Archivo:** `src/lib/product-matcher.ts` (línea 3-6)
- **Problema:** `NEXT_PUBLIC_OPENAI_API_KEY` se incluye en el bundle del cliente. Cualquier usuario puede extraerla desde DevTools → Sources → buscar "sk-". `dangerouslyAllowBrowser: true` confirma el riesgo.
- **Impacto:** Uso ilimitado de la API de OpenAI a tu costo. Una noche de abuso puede costar cientos de dólares.
- **Fix:** Mover todas las llamadas a OpenAI a un API route server-side. Usar `OPENAI_API_KEY` (sin `NEXT_PUBLIC_`).

#### 3.2 XSS vía `dangerouslySetInnerHTML` sin sanitizar
- **Archivo:** `src/app/redoc/page.tsx` (línea 24 y 67)
- **Problema:** Se fetch HTML externo de `https://virtago-backend.vercel.app/api/redoc` y se inyecta directo al DOM sin sanitizar.
- **Impacto:** Si el backend es comprometido o hay un MITM, se puede ejecutar JavaScript arbitrario en la sesión del usuario.
- **Fix:** Usar un `<iframe sandbox>` o sanitizar con DOMPurify antes de renderizar.

#### 3.3 Proxy abierto sin autenticación ni allowlist
- **Archivo:** `src/app/api/[...path]/route.ts` (todo el archivo)
- **Problema:** El catch-all proxy reenvía CUALQUIER request al backend sin validar autenticación, sin whitelist de paths, sin rate limiting.
- **Impacto:** Un atacante puede acceder a endpoints internos del backend, enumerar la API, y lanzar ataques DDoS.
- **Fix:** Agregar validación de JWT, implementar whitelist de paths permitidos, agregar rate limiting.

---

### 🟠 ALTAS

#### 3.4 CORS wildcard + credentials
- **Archivos:** `vercel.json` (líneas 25-28), `next.config.ts` (líneas 89-92)
- **Problema:** `Access-Control-Allow-Origin: *` con `Access-Control-Allow-Credentials: true`
- **Fix:** Reemplazar `*` con el dominio real del frontend.

#### 3.5 Redirect de autenticación desactivado
- **Archivo:** `src/api/http-client.ts` (líneas 117-138)
- **Problema:** El handler de 401 que redirige a `/login` está COMENTADO con "TEMPORALMENTE DESACTIVADO PARA DEBUG". El `removeToken()` se ejecuta pero el usuario queda en el app en estado roto.
- **Fix:** Reactivar el redirect, gated con `NODE_ENV` si es necesario.

#### 3.6 5 endpoints de API sin autenticación
- **Archivos:**
  - `src/app/api/images/analyze/route.ts`
  - `src/app/api/images/analyze-multiple/route.ts`
  - `src/app/api/images/find-matches/route.ts`
  - `src/app/api/images/check-image/route.ts`
  - `src/app/api/products/match/route.ts`
- **Problema:** Ninguno valida `Authorization` header. Los endpoints de imágenes invocan OpenAI — sin auth, cualquiera puede triggear procesamiento costoso.

#### 3.7 Datos sensibles logueados en producción
- **Archivos:** `src/app/api/[...path]/route.ts` (líneas 91-98), 39+ `console.log` en rutas API
- **Problema:** Bodies completos de respuesta (incluyendo PII, tokens) se loguean. En Vercel estos logs son visibles.
- **Fix:** Eliminar todos los `console.log` de bodies. Usar logger estructurado.

#### 3.8 Contraseñas y OTP en respuestas de API
- **Archivo:** `src/api/index.ts` (líneas 37, 55, 76, 80, 88)
- **Problema:** Los tipos `LoginResponse` y `RegisterResponse` incluyen campos `password` y `otp`. El backend aparentemente retorna contraseñas en texto plano.
- **Fix:** El backend debe NUNCA retornar passwords. Eliminar estos campos de los tipos y del backend.

#### 3.9 Credenciales hardcodeadas en auth store legacy
- **Archivo:** `src/lib/auth-store.ts` (línea 220)
- **Problema:** `password === "123456"` como contraseña universal para test users. Está en el bundle de producción.
- **Archivo:** `src/app/login/page.tsx` (línea 82-89) — función `fillTestUser` con credenciales hardcodeadas.

#### 3.10 Geo-blocking fácilmente bypasseable
- **Archivo:** `src/middleware.ts` (línea 6-14)
- **Problema:** Si no hay header geo (`country === ''`), se permite el acceso. El header `x-vercel-ip-country` es spoofeable fuera de Vercel. No hay auth check server-side para `/admin`.

---

### 🟡 MEDIAS

#### 3.11 Sin rate limiting en ningún endpoint
- Todos los 14+ API routes están sin protección. Los endpoints de IA son especialmente costosos.
- **Fix:** Agregar `@upstash/ratelimit` o similar.

#### 3.12 Sin protección CSRF
- No hay CSRF tokens en operaciones POST/PUT/DELETE.

#### 3.13 Sin validación de tamaño de input en proxy
- El proxy reenvía bodies sin límite de tamaño. Un atacante puede enviar payloads enormes.

#### 3.14 GET endpoints exponen documentación interna
- 4 endpoints de imágenes retornan docs con payloads de ejemplo y URLs internas del backend en requests GET.

---

## 4. Problemas de Código y Lógica

### 🔴 CRÍTICOS

#### 4.1 Dos auth stores activos simultáneamente
- **`src/store/auth.ts`** — Store real (Zustand + persist, API real, 989 líneas)
- **`src/lib/auth-store.ts`** — Store legacy (mock data, hardcoded passwords, 305 líneas)
- **12 páginas** importan del legacy, **18 páginas** del real
- Los tipos `User` son INCOMPATIBLES entre ambos stores
- Dos localStorage keys diferentes (`"auth-storage"` vs `"virtago-auth"`)
- **Páginas en el store INCORRECTO (legacy):**
  - `src/app/favoritos/page.tsx`
  - `src/app/mis-pedidos/page.tsx`
  - `src/app/mis-pedidos/[id]/page.tsx`
  - `src/app/perfil/page.tsx`
  - `src/app/configuracion/page.tsx` y sub-páginas

#### 4.2 Respuestas fake de éxito en errores de API
- **Archivo:** `src/api/index.ts` (líneas ~1672-1695, ~1742-1762)
- **Problema:** `prices.bulkCreate` y `discounts.bulkCreate` retornan `success: true` con datos falsos cuando la API falla. El usuario cree que sus datos se guardaron cuando NO es así.
- **Archivo:** `src/app/api/images/check-image/route.ts` (líneas 78-99) — retorna análisis mock cuando el backend está caído.

#### 4.3 `console.log` en render body (ejecuta cada render)
- **Archivo:** `src/app/admin/page.tsx` (líneas 169-194) — 10+ console.log que serializan el objeto `user` completo en CADA render.
- **Archivo:** `src/app/admin/productos/page.tsx` (líneas 46-55) — misma situación.

---

### 🟠 ALTOS

#### 4.4 `as any` masivo en auth store
- **Archivo:** `src/store/auth.ts` — 6 casts `as any` para parsing de respuestas API (líneas 205, 340, 428, 630, 824, 838)
- Derrota completamente la seguridad de tipos de TypeScript.

#### 4.5 `localStorage` sin guard de window
- **Archivo:** `src/api/http-client.ts` (línea 99) — `localStorage.getItem('refresh_token')` dentro del interceptor de Axios sin `typeof window !== 'undefined'`. Crasheará en SSR.
- **Archivo:** `src/services/onboarding.service.ts` (línea 55) — mismo problema.
- **Archivo:** `src/api/base.ts` (línea 7) — `localStorage.getItem()` directo sin guard.

#### 4.6 Error details leakeados al cliente
- **Archivo:** `src/app/api/clients/route.ts` (línea 26-28)
- **Archivo:** `src/app/api/clients/import/route.ts` (línea 30-32)
- Retornan `String(error)` al cliente, exponiendo stack traces e info interna.

#### 4.7 Uso de `window.location.href` en vez de `router.push()`
- **Archivos:** `src/app/admin/page.tsx` (línea 79), y varios más
- Causa recargas completas de página, perdiendo estado del cliente.

---

### 🟡 MEDIOS

#### 4.8 useEffect con dependencias incorrectas
- **`src/hooks/useDashboard.ts`** — `fetchData` no memoizada con `useCallback`, no en dependency array.
- **`src/app/admin/productos/page.tsx`** — ESLint exhaustive-deps silenciado pero con deps manuales.

#### 4.9 Chat system es 100% mock
- **Archivo:** `src/contexts/chat-context.tsx` (líneas 119-175)
- `simulateAIResponse` usa keyword matching con delays random. El hook `useN8nIntegration` existe (línea 274) pero nunca se usa.

#### 4.10 Manejo de errores inconsistente
- Auth store: algunas branches hacen `throw error`, otras `throw new Error(...)`. No hay patrón estándar.

---

## 5. Código Muerto

### Archivos completamente muertos (~3,000+ líneas)

| Archivo | Líneas | Razón |
|---------|--------|-------|
| `src/api/base.ts` | ~50 | Reemplazado por `http-client.ts` (Axios). Nunca importado. |
| `src/app/page-new.tsx` | ~285 | Duplicado de `page.tsx` sin theming. Next.js no lo sirve. |
| `src/app/favoritos/page-new.tsx` | ~332 | Dead — Next.js solo sirve `page.tsx`. |
| `src/app/mis-pedidos/page-new.tsx` | ~348 | Dead. |
| `src/app/mis-pedidos/[id]/page-new.tsx` | ~200 | Dead. |
| `src/app/admin/listas-precios/page-new.tsx` | ~758 | Dead — 758 líneas de código inaccesible. |
| `src/lib/auth-store.ts` | ~305 | Debería ser eliminado tras migrar 12 páginas a `store/auth.ts`. |

**Total código muerto en archivos completos: ~2,278+ líneas**

### Funciones/exports nunca usados

| Función | Archivo | Notas |
|---------|---------|-------|
| `formatPriceCalculation` | `src/lib/price-calculator.ts` (línea 223) | Nunca importada |
| `useOnboardingStatus` | `src/services/onboarding.service.ts` (línea 156) | Nunca importada |
| `deleteImageFromCloudinary` | `src/services/cloudinary.ts` (línea 142) | Nunca importada |
| `fileToBase64` | `src/services/image-vision.service.ts` (línea 476) | Nunca importada (duplicada en hooks) |
| `validateImageFile` | `src/services/image-vision.service.ts` (línea 488) | Nunca importada (duplicada en hooks) |
| `matchWithAI` (runtime) | `src/lib/product-matcher.ts` (línea 23) | Solo el **tipo** `MatchResult` se importa; la función nunca se llama |
| `matchProductsBatch` | `src/lib/product-matcher.ts` (línea 220) | Nunca importada |
| `fillTestUser` | `src/app/login/page.tsx` (línea 82) | Definida pero nunca usada en JSX |
| `PlanInfo` interface | `src/store/auth.ts` (línea 8) | Exportada pero nunca referenciada |

### Scripts de debug en root (no deberían existir)

| Archivo | Propósito | Problema |
|---------|-----------|---------|
| `check-auth-now.js` | Script para pegar en consola del browser | Herramienta de debug |
| `test-dashboard-endpoint.js` | Test de API dashboard | Hardcodea `localhost:3002` |
| `test-onboarding-endpoint.js` | Test de API onboarding | Hardcodea `localhost:3000` |
| `test-price-list-api.ts` | Test de precios | TypeScript que no se puede ejecutar con `node` |
| `verify-config.js` | Verificar config | Script ad-hoc |

---

## 6. Código Duplicado

### 6.1 Cuatro componentes Select casi idénticos (~920 líneas)

| Componente | Archivo | Líneas |
|------------|---------|--------|
| `StyledSelect` | `src/components/ui/styled-select.tsx` | ~203 |
| `ThemedSelect` | `src/components/ui/themed-select.tsx` | ~238 |
| `CustomSelect` | `src/components/ui/custom-select.tsx` | ~162 |
| `EnhancedSelect` | `src/components/ui/enhanced-select.tsx` | ~318 |

Todos implementan el mismo patrón de dropdown con click-outside. Deberían ser UN solo componente configurable.

### 6.2 `normalizeText()` duplicada
- `src/app/api/product-images/route.ts` (línea 42-50)
- `src/app/api/products/match/route.ts` (línea 78-87)
- Misma función: lowercase + remove accents + strip special chars.

### 6.3 `UnsavedChangesNotification` duplicado
- `src/components/products/admin/unsaved-changes-notification.tsx`
- `src/components/clients/unsaved-changes-notification.tsx`
- Misma funcionalidad con API ligeramente diferente.

### 6.4 Debug tools duplicados
- `src/utils/onboarding-debug.ts` (línea 12) — `simulateWizardCompleted` completo
- `src/components/debug-tools.tsx` (línea 36) — versión simplificada
- Datos de mock diferentes, genera estados inconsistentes.

### 6.5 `ProductImageAnalysis` type definido dos veces
- `src/hooks/useImageVision.ts` (línea 13-53)
- `src/services/image-vision.service.ts` (línea 12-60)

### 6.6 `hasAccess` check duplicado en cada página admin
- `src/app/admin/page.tsx` (línea 183-193)
- `src/app/admin/productos/page.tsx` (línea 49-53)
- Probablemente en cada página admin. Debería ser un middleware o HOC.

### 6.7 Doble sistema de toast
- Custom toast: `src/components/ui/toast.tsx` (392 líneas) + `ToastProvider` + `ToastIntegration`
- Sonner: importado en `src/app/layout.tsx`
- Ambos renderizados simultáneamente. Componentes usan uno u otro sin consistencia.

### 6.8 Doble tipo `User`
- `src/lib/auth-store.ts` — `User` con `name`, `role: "cliente" | "distribuidor" | "client" | "distributor" | "admin"`, `joinDate`
- `src/store/auth.ts` — `User` con `firstName`/`lastName`, `role: 'user' | 'admin' | 'distributor'`, `isVerified`, `distributorInfo`

---

## 7. Problemas de Configuración

### 7.1 `ignoreBuildErrors: true` en producción
- **Archivo:** `next.config.ts` (línea 8-9)
- La app se deploya con errores de TypeScript sin detectar. Esto es una bomba de tiempo.

### 7.2 Rewrites duplicados e inconsistentes
- `next.config.ts` → `process.env.BACKEND_URL || 'http://localhost:3001'`
- `vercel.json` → `https://virtago-backend.vercel.app/api/:path*`
- En Vercel, `vercel.json` tiene prioridad. El rewrite de `next.config.ts` nunca corre en producción.

### 7.3 5 diferentes URLs de backend
| Archivo | URL Default |
|---------|-------------|
| `src/api/base.ts` | `https://virtago-backend.vercel.app/api` |
| `src/api/http-client.ts` | `/api` |
| `src/app/api/[...path]/route.ts` | `https://virtago-backend.vercel.app` (sin `/api`) |
| `src/app/api/clients/route.ts` | `https://virtago-backend.vercel.app` |
| `next.config.ts` | `http://localhost:3001` |

### 7.4 `NEXT_PUBLIC_API_URL` usado en server-side routes
- 6 archivos en `src/app/api/product-images/` usan `process.env.NEXT_PUBLIC_API_URL`
- Variables `NEXT_PUBLIC_` están diseñadas para el cliente. En server-side routes debería usarse `BACKEND_URL`.

### 7.5 Falta `.env.example`
- No hay archivo template para documentar variables requeridas. Nuevos desarrolladores no saben qué configurar.

### 7.6 `package-lock.json` tracked pero el proyecto usa pnpm
- El proyecto usa `pnpm` (tiene `pnpm-lock.yaml` y `packageManager` en `package.json`).
- Un `package-lock.json` de npm podría causar confusión.

### 7.7 Fallback de Cloudinary hardcodeado
- `src/services/cloudinary.ts` — `"dyy8hc876"` y `"virtago"` como fallbacks
- Si env vars no están seteadas, cualquiera puede subir a este Cloudinary account.

### 7.8 Target de TypeScript demasiado bajo
- `tsconfig.json` → `"target": "ES2017"` — con Next.js 16+ es innecesariamente conservador.

### 7.9 ESLint sin reglas custom
- Solo extiende `next/core-web-vitals` y `next/typescript`.
- Falta: `no-console`, restricción de `any`, import ordering, unused imports.

---

## 8. Problemas de Arquitectura

### 8.1 `src/api/index.ts` es un monolito de 2,033 líneas
- Un solo archivo contiene TODA la lógica de API: auth, clientes, productos, precios, descuentos, dashboard, onboarding, imágenes.
- Debería dividirse en módulos: `api/auth.ts`, `api/products.ts`, `api/clients.ts`, etc.

### 8.2 Sin Error Boundaries
- 0 componentes `ErrorBoundary` en todo el proyecto. Un error de runtime en CUALQUIER componente crashea toda la app.
- Crítico para: admin dashboard, product listing, chat system, image analysis.

### 8.3 Auth check client-side sin protección server-side
- Todas las verificaciones de autenticación para `/admin` son client-side via Zustand.
- El middleware solo hace geo-blocking.
- Un usuario puede acceder directamente a rutas admin modificando el state en localStorage.

### 8.4 DoS ThemeProvider duplicado
- `layout.tsx` wrappea en `NextThemeProvider` con `defaultTheme="dark"`, `enableSystem={false}`
- El re-exported `ThemeProvider` tiene `defaultTheme="system"`, `enableSystem={true}`
- Valores conflictivos, aunque el outer overrides.

### 8.5 LoadingProvider bloquea la app 2 segundos
- **Archivo:** `src/components/providers/loading-provider.tsx` (línea 32-43)
- `setTimeout(() => setIsLoading(false), 2000)` — hardcoded 2s de loading artificial en CADA carga.
- Mata el LCP y la experiencia de usuario.

---

## 9. Problemas de Performance

| Problema | Archivo | Impacto |
|----------|---------|---------|
| Loading artificial de 2s | `loading-provider.tsx` | LCP +2000ms |
| `console.log` en render body | `admin/page.tsx`, `admin/productos/page.tsx` | Serialización JSON cada render |
| Context value sin `useMemo` | `src/contexts/theme-context.tsx` (línea 172) | Re-renders innecesarios en todos los consumers |
| `fetchData` sin `useCallback` | `src/hooks/useDashboard.ts` | Referencia inestable, posibles re-fetches |
| Dual toast system renderizando | `layout.tsx` | Dos overlays DOM simultáneos |
| `matchWithAI` bundled pero nunca usado | `product-matcher.ts` | OpenAI SDK en client bundle sin necesidad |

---

## 10. Accesibilidad

**Estado: Prácticamente inexistente.**

- 0 atributos `aria-*` encontrados en componentes custom
- Custom select dropdowns sin `role="listbox"`, sin `aria-expanded`
- Cart sidebar sin `role="dialog"`, sin `aria-label`
- Modals sin focus trapping
- Loading states sin `aria-live` regions
- No hay skip-to-content link
- No hay manejo de focus en navegación

---

## 11. Organización del Proyecto

### 11.1 Root completamente desordenado
- **45 archivos .md** en el root (448KB de documentación)
- **8 archivos JSON de ejemplo** en el root
- **5 scripts de debug** sueltos
- **Recomendación:** Mover todo a `docs/`, `scripts/`, `examples/`

### 11.2 Estructura de `src/api/` inconsistente
- `src/api/index.ts` (2,033 líneas) — monolito
- `src/api/base.ts` — dead code
- `src/api/http-client.ts` — HTTP client activo
- Debería ser: `src/api/client.ts` + `src/api/modules/auth.ts`, `products.ts`, etc.

### 11.3 Documentación .md sin categorizar
- Los 45+ markdowns cubren: API docs, bug fixes, features, guías de instalación, changelogs
- Mezclados sin estructura, difícil encontrar información relevante

---

## 12. Resumen y Prioridades

### Conteo total de issues

| Severidad | Cantidad | Categoría |
|-----------|----------|-----------|
| 🔴 CRÍTICA | 6 | OpenAI key expuesta, XSS, proxy abierto, dual auth stores, fake success, debug en render |
| 🟠 ALTA | 10 | CORS, auth desactivado, endpoints sin auth, datos sensibles en logs, passwords en response, `as any`, error leaks, localStorage sin guard, credenciales hardcoded, geo-bypass |
| 🟡 MEDIA | 12 | Sin rate limit, sin CSRF, sin error boundaries, código duplicado (selects, toasts, types), loader 2s, ESLint vacío, ignoreBuildErrors |
| 🔵 BAJA | 10 | Dead code (~3000 LOC), accesibilidad zero, organización del root, scripts sueltos, tsconfig target |

### **Top 10 acciones prioritarias**

| # | Acción | Severidad | Esfuerzo |
|---|--------|-----------|----------|
| 1 | Mover OpenAI a server-side, eliminar `NEXT_PUBLIC_OPENAI_API_KEY` | 🔴 | Bajo |
| 2 | Agregar auth al proxy catch-all + whitelist de paths | 🔴 | Medio |
| 3 | Migrar 12 páginas de `lib/auth-store.ts` a `store/auth.ts` y eliminar legacy | 🔴 | Medio |
| 4 | Eliminar fake success en `bulkCreate` — propagar errores reales | 🔴 | Bajo |
| 5 | Reactivar redirect a `/login` en handler 401 | 🟠 | Bajo |
| 6 | Agregar auth a los 5 endpoints de imágenes/match | 🟠 | Bajo |
| 7 | Poner `ignoreBuildErrors: false` y corregir errores de TS | 🟡 | Medio-Alto |
| 8 | Sanitizar HTML en redoc page (DOMPurify o iframe sandbox) | 🔴 | Bajo |
| 9 | Eliminar ~3,000 líneas de código muerto (page-new.tsx, base.ts) | 🔵 | Bajo |
| 10 | Unificar los 4 Select components en uno solo | 🟡 | Medio |

### Código muerto estimado: **~3,000+ líneas**
### Código duplicado estimado: **~1,500+ líneas**
### Vulnerabilidades de seguridad activas: **16**

---

> **Nota:** Este documento es un análisis estático. Se recomienda complementar con:
> - Penetration testing real contra el backend
> - Auditoría de dependencias (`pnpm audit`)
> - Lighthouse audit para performance y accesibilidad
> - OWASP ZAP scan para vulnerabilidades web
