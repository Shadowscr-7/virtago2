# Virtago - Complete Registration & Onboarding E2E Flow

## Overview

The app has **two separate flows** depending on the user type:
- **Client** (short flow): Register → OTP → Select "Cliente" → Done (redirect `/`)
- **Distributor** (full flow): Register → OTP → Select "Distribuidor" → Personal Info → Business Info → Plan Selection → Done (redirect `/`)

Additionally, authenticated distributors have an **Onboarding Wizard** at `/admin/configuracion-rapida`.

---

## FLOW 1: Registration (Multi-Step)

### Route: `/register`
- **Component**: `src/app/register/page.tsx` → renders `<MultiStepRegistration />` from `src/components/auth/multi-step-registration.tsx`
- **State management**: Zustand store at `src/store/auth.ts` — `registrationStep` drives which sub-component renders
- **Steps**: `initial` → `otp` → `userType` → `personalInfo` → `businessInfo` → `planSelection` → `completed`

### Progress indicator
A dot-based progress bar at the top shows 7 dots (one per step). Active step is highlighted with `themeColors.primary`.

---

## STEP 1: Registration Form (`registrationStep === "initial"`)

### Component: `src/components/auth/register-form.tsx`
### URL: `/register`

#### Form fields (react-hook-form + zod validation):

| Field Name | `name` attribute | Type | Validation | Placeholder |
|---|---|---|---|---|
| Nombre | `firstName` | text | min 2 chars | "Juan" |
| Apellido | `lastName` | text | min 2 chars | "Pérez" |
| Correo electrónico | `email` | email | valid email | "juan@empresa.com" |
| Contraseña | `password` | password | min 8 chars | "••••••••" |
| Confirmar contraseña | `passwordConfirmation` | password | must match `password` | "••••••••" |

#### Validation schema (Zod):
```typescript
const registerSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  passwordConfirmation: z.string(),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: "Las contraseñas no coinciden",
  path: ["passwordConfirmation"],
});
```

#### Error messages:
- `"El nombre debe tener al menos 2 caracteres"` — firstName too short
- `"El apellido debe tener al menos 2 caracteres"` — lastName too short
- `"Email inválido"` — bad email format
- `"La contraseña debe tener al menos 8 caracteres"` — password too short
- `"Las contraseñas no coinciden"` — password mismatch

#### Password strength indicator:
Shown when password field has content. Calculates based on: 8+ chars, uppercase, lowercase, number (each 25%). Labels: "Débil", "Media", "Fuerte".

#### Submit button:
- **Selector**: `button[type="submit"]`
- **Text (idle)**: "Continuar" (with ArrowRight icon)
- **Text (loading)**: "Creando cuenta..."
- **Disabled when**: `isLoading === true`

#### Footer link:
- **Text**: "¿Ya tienes cuenta? Iniciar sesión"
- **Header text**: "Crear Cuenta" / "Registro para empresas B2B"

#### API called:
- **Endpoint**: `POST /auth/register-simple`
- **Timeout**: 60,000ms
- **Payload**: `{ firstName, lastName, email, password, passwordConfirmation }`
- **Success response**: `{ success, message, data: { otp, token, user } }`
- **Error case**: `EMAIL_ALREADY_EXISTS` → toast title "Correo ya registrado"

#### On success:
- `registrationStep` → `"otp"`
- `otpSent` → `true`
- OTP logged to console: `"🔐 OTP para desarrollo: XXXXXX"`
- Token saved to `localStorage.temp_auth_token`
- Toast: "¡Registro exitoso!" / "Código de verificación enviado a {email}"

---

## STEP 2: OTP Verification (`registrationStep === "otp"`)

### Component: `src/components/auth/otp-verification.tsx`
### URL: `/register` (same page, different component)

#### Heading:
- **h1**: "Verificar Email"
- **Subtitle**: "Hemos enviado un código de 6 dígitos a {email}"

#### OTP inputs:
- **6 individual inputs** with class `otp-input`
- **Selector for each**: `.otp-input` (all 6 are querySelectorAll'd)
- **Type**: text, maxLength=1
- **Behavior**: Auto-advance on digit entry, backspace goes to previous
- **Paste support**: Paste a 6-digit code fills all inputs

#### Timer:
- **Initial**: 30 minutes (1800 seconds)
- **Display format**: `mm:ss` inside a circular SVG progress indicator
- **Color changes**: green (>5min) → yellow (>1min) → red (<1min)

#### Buttons:

| Button | Selector | Text | Condition |
|---|---|---|---|
| Verify | `button:has-text("Verificar código")` | "Verificar código" (idle) / "Verificando..." (loading) | Enabled when all 6 digits filled |
| Resend | `button:has-text("Reenviar código")` | "Reenviar código" | Only visible when timer reaches 0 |
| Back | ArrowLeft button (top left of card) | (icon only) | Always visible |

#### API called:
- **Endpoint**: `POST /auth/verify-otp`
- **Payload**: `{ email, otp }`
- **Success response**: `{ success, message, data: {...} }`

#### Resend OTP API:
- **Endpoint**: `POST /auth/resend-otp`
- **Payload**: `{ email }`
- **Timeout**: 60,000ms

#### On success:
- `otpVerified` → `true`
- `registrationStep` → `"userType"`
- Toast: "¡Código verificado!" / "Tu cuenta ha sido verificada exitosamente"

#### On error:
- OTP inputs reset to empty
- First input gets focus
- Toast: "Código incorrecto"

#### How to get OTP in E2E tests:
The OTP is logged to the browser console: `"🔐 OTP para desarrollo: XXXXXX"`
Listen for `page.on('console')` and match `msg.text().includes('OTP para desarrollo:')`, then extract `/\d{6}/`.

---

## STEP 3: User Type Selection (`registrationStep === "userType"`)

### Component: `src/components/auth/user-type-selection.tsx`
### URL: `/register`

#### Heading:
- **h1**: "Tipo de Usuario"
- **Subtitle**: "Selecciona el tipo de cuenta que mejor se adapte a tus necesidades"

#### Options (clickable cards):

| Type | `id` value | Title text | Description | Icon |
|---|---|---|---|---|
| Client | `"client"` | "Cliente" | "Comprador final de productos" | User icon |
| Distributor | `"distributor"` | "Distribuidor" | "Socio comercial con beneficios especiales" | Building2 icon |

#### Card selectors:
- Cards are `<button>` elements
- Selected card has class `border-purple-500 bg-white/10`
- Unselected: `border-white/20 bg-white/5`
- Each card title is `<h3>` with text "Cliente" or "Distribuidor"
- **Best selectors**: `button:has-text("Cliente")` or `button:has-text("Distribuidor")`

#### Continue button:
- **Text**: "Continuar" (with ArrowRight icon) / "Procesando..." (loading)
- **Disabled when**: nothing selected OR `isLoading`
- **Selector**: Last button in the component, gradient background

#### Back button:
- ArrowLeft icon, top-left corner

#### On selecting "client":
- `registrationStep` → `"completed"` (skips personal/business/plan)
- `isAuthenticated` → `true`
- `user.userType` → `"client"`, `user.role` → `"user"`
- Token moved from `temp_auth_token` to `token` + `auth_token`
- Toast: "¡Registro completado!" / "Bienvenido a Virtago, {firstName}"
- **Immediately goes to STEP 7 (Success)**

#### On selecting "distributor":
- `registrationStep` → `"personalInfo"`
- `user.userType` → `"distributor"`, `user.role` → `"distributor"`
- Toast: "Tipo de cuenta seleccionado" / "Por favor completa tu información personal"

---

## STEP 4: Personal Information (`registrationStep === "personalInfo"`)
**(Distributor only)**

### Component: `src/components/auth/personal-info-form.tsx` + `personal-info-form-fields.tsx`
### URL: `/register`

#### Form fields (react-hook-form + zod):

| Field Name | `name` attribute | Type | Validation | Placeholder | Default |
|---|---|---|---|---|---|
| Nombre | `firstName` | text | min 2 chars | "Juan" | From registration data |
| Apellido | `lastName` | text | min 2 chars | "Pérez" | From registration data |
| Teléfono | `phone` | tel | min 10 digits | "+598 99 123 456" | "" |
| Fecha de nacimiento | `birthDate` | date | required | (date picker) | "" |
| Dirección | `address` | text | min 5 chars | "18 de Julio 1234, Montevideo" | "" |
| Ciudad | `city` | text | min 2 chars | "Montevideo" | "" |
| País | `country` | select | min 2 chars | — | "Uruguay" |

#### Country options:
Uruguay, Argentina, Brasil, Chile, Paraguay, Colombia, Perú, México, España, Estados Unidos, Canadá, Otros

#### Submit button:
- **Text**: "Continuar" (with ArrowRight icon) / "Guardando información..."
- **Selector**: `button[type="submit"]`

#### On success:
- `registrationStep` → `"businessInfo"`
- Toast: "Información personal guardada" / "Ahora completa tu información empresarial"

---

## STEP 5: Business Information (`registrationStep === "businessInfo"`)
**(Distributor only)**

### Component: `src/components/auth/business-info-form.tsx`
### URL: `/register`

#### Heading:
- **h1**: "Información de Empresa"
- **Subtitle**: "Completa los datos de tu empresa para acceso a precios mayoristas"

#### Form fields (react-hook-form + zod):

| Field Name | `name` attribute | Type | Validation | Placeholder |
|---|---|---|---|---|
| Nombre de la empresa | `businessName` | text | min 2 chars | "Distribuidora ABC S.A." |
| Tipo de empresa | `businessType` | select | required | "Selecciona un tipo" |
| RUC | `ruc` | text | min 11 chars | "21.123.456.789-0" |
| Código/ID de Distribuidor | `distributorCode` | text | min 3 chars | "DIST-UY-001" |
| Teléfono comercial | `businessPhone` | tel | min 10 digits | "+598 2 123 4567" |
| Email comercial | `businessEmail` | email | valid email | "contacto@empresa.com.uy" |
| Sitio web (optional) | `website` | url | valid URL (optional) | "https://www.empresa.com.uy" |
| Dirección comercial | `businessAddress` | text | min 5 chars | "18 de Julio 1234, Montevideo" |
| Ciudad | `businessCity` | text | min 2 chars | "Montevideo" |
| País | `businessCountry` | select | min 2 chars | Default: "Uruguay" |
| Años en el negocio | `yearsInBusiness` | number | required | "5" |
| Número de empleados | `numberOfEmployees` | select | required | "Selecciona rango" |
| Descripción | `description` | textarea | min 10 chars | "Describe brevemente tu empresa..." |

#### Business type options:
- "Distribuidor mayorista"
- "Tienda minorista"
- "Empresa de servicios"
- "Manufacturera"
- "Importador/Exportador"
- "E-commerce"
- "Franquicia"
- "Otro"

#### Employee range options:
"1-5", "6-10", "11-25", "26-50", "51-100", "101-500", "500+"

#### Business country options:
Uruguay, Argentina, Brasil, Chile, Paraguay, Colombia, Perú, México, España

#### Submit button:
- **Text**: "Continuar a selección de plan" (with CheckCircle + ArrowRight) / "Completando registro..."
- **Selector**: `button[type="submit"]`
- **Progress indicator shows**: "71%"

#### On success:
- `registrationStep` → `"planSelection"`
- Toast: "Información empresarial guardada" / "Ahora selecciona tu plan de suscripción"

---

## STEP 6: Plan Selection (`registrationStep === "planSelection"`)
**(Distributor only)**

### Component: `src/components/auth/plan-selection.tsx`
### URL: `/register`

#### Heading:
- **h1**: "Elige tu Plan"
- **Subtitle**: "Selecciona el plan que mejor se adapte a las necesidades de tu negocio..."

#### Plans loaded from API:
- **Endpoint**: `GET /plans`
- Plans are sorted by `order` field
- Default plan (where `isDefault === true`) is pre-selected
- "Gold" plan gets a "Más Popular" badge

#### Plan cards:
- 3-column grid on desktop
- Each plan card is clickable (`cursor-pointer`)
- Selected plan has a green checkmark badge on top-right
- **Selector**: Click the card containing the plan name text

#### Continue button:
- **Text**: "Completar registro con {planDisplayName}" (with Crown icon) / "Creando distribuidor..." (loading)
- **Disabled when**: no plan selected OR isSelecting
- **Progress indicator shows**: "86%"

#### API called:
- **Endpoint**: `POST /distributors`
- **Payload**: Full `CreateDistributorData` including personal info, business info, and selected plan
- **Success response**: `{ success, message, data: { distributor: { id, email, distributorCode, ... } } }`

#### On success:
- `registrationStep` → `"completed"`
- `isAuthenticated` → `true`
- Token finalized (moved from temp to permanent)
- Toast: "¡Registro completado!" / "Bienvenido a Virtago con el plan {planDisplayName}. Tu cuenta está lista."

#### On error:
- Toast: "Error al seleccionar plan" / specific error message
- Does NOT redirect — stays on plan selection

---

## STEP 7: Registration Success (`registrationStep === "completed"`)

### Component: `src/components/auth/registration-success.tsx`
### URL: `/register` (briefly, then auto-redirects)

#### Content:
- **h1**: "¡Registro Completado!"
- **Subtitle**: "Bienvenido a Virtago"
- Shows user name, email, and type (Distribuidor/Cliente)
- Lists benefits based on user type

#### Benefits displayed:
- **Distributor**: Precios mayoristas, Dashboard de ventas, Gestión de territorio, Comisiones especiales
- **Client**: Catálogo completo, Precios exclusivos, Historial de compras, Soporte prioritario

#### Continue button:
- **Text**: "Comenzar a explorar" (with ArrowRight icon)
- **Selector**: `button:has-text("Comenzar a explorar")`
- Also: auto-redirects after 5 seconds

#### On click / auto-redirect:
- Calls `resetRegistration()` (resets all registration state)
- Navigates to `"/"` (home page)

---

## FLOW 2: Login

### Route: `/login`
### Component: `src/app/login/page.tsx`

#### Heading:
- **h1**: "Iniciar Sesión"
- **Subtitle**: "Accede a precios exclusivos B2B"

#### Form fields:

| Field | Type | Placeholder | Required |
|---|---|---|---|
| Correo electrónico | email | "tu@empresa.com" | Yes |
| Contraseña | password | "••••••••" | Yes |

**Note**: These inputs do NOT use `name` attributes — they use `value`/`onChange` state. Select by type or placeholder.

#### Other elements:
- **Remember me switch**: `StyledSwitch` labeled "Recordarme"
- **Forgot password**: `<a>` with text "¿Olvidaste tu contraseña?"
- **Submit button**: Text "Iniciar Sesión" (idle) / "Iniciando sesión..." (loading)
- **Register link**: `<Link href="/register">` with text "Regístrate aquí"

#### API called:
- **Endpoint**: `POST /auth/login`
- **Payload**: `{ email, password }`

#### On success:
- Redirects to `"/"`
- Toast: "¡Bienvenido!" / "Sesión iniciada como {firstName} {lastName}"

#### Test users (dev mode):
- **Client**: `cliente@virtago.com` / `123456`
- **Distributor**: `distribuidor@virtago.com` / `123456`

---

## FLOW 3: Onboarding / Quick Setup Wizard (Post-Registration, Distributor Only)

### Route: `/admin/configuracion-rapida`
### Component: `src/app/admin/configuracion-rapida/page.tsx` → `src/components/admin/quick-setup/setup-wizard.tsx`

#### Access:
- Requires authentication (`isAuthenticated && token`)
- Redirects to `/login?redirect=/admin/configuracion-rapida` if not authenticated

#### Landing page (before wizard):
- Shows 4 cards: Configurar Clientes, Cargar Productos, Configurar Precios, Crear Listas de Precios
- **"Iniciar Configuración Guiada"** button launches the wizard
- Progress bar shows "0 de 4 completadas"

#### Wizard Steps (6 total):

| # | Step ID | Title | Icon | Description |
|---|---|---|---|---|
| 1 | `clients` | Clientes | Users | Carga masiva de clientes |
| 2 | `products` | Productos | Package | Carga masiva de productos con IA |
| 3 | `price-lists` | Listas de Precios | List | Configurar listas por cliente |
| 4 | `prices` | Precios | TrendingUp | Precios base y márgenes |
| 5 | `discounts` | Descuentos | Percent | Reglas de descuentos |
| 6 | `review` | Revisar | CheckCircle | Finalizar configuración |

#### Wizard components:
- `ClientStep` — `src/components/admin/quick-setup/steps/ClientStep.tsx`
- `ProductStep` — `src/components/admin/quick-setup/steps/ProductStep.tsx`
- `PriceListStep` — `src/components/admin/quick-setup/steps/PriceListStep.tsx`
- `PriceStep` — `src/components/admin/quick-setup/steps/PriceStep.tsx`
- `DiscountStep` — `src/components/admin/quick-setup/steps/DiscountStep.tsx`
- `ReviewStep` — `src/components/admin/quick-setup/steps/ReviewStep.tsx`

#### Navigation:
- **"Siguiente" button**: Advances to next step
- **"Anterior" button**: Goes back one step (hidden on step 1)
- **Close button (X icon)**: Goes to `/admin`
- **Step indicators**: Clickable for already-visited steps
- **Footer text**: "Paso {n} de 6"

#### On wizard completion:
- Saves to `localStorage.virtago_wizard_completed` with `{ completed: true, completedAt, hasData: true, data: {...} }`
- Redirects to `/admin` (dashboard)

---

## Onboarding Status Service

### File: `src/services/onboarding.service.ts`
### API Endpoint: `GET /distributor/onboarding-status`

Checks if distributor has data for: products, clients, priceLists, prices, discounts. Falls back to localStorage data from the wizard if the API is unavailable.

**Completion criteria**: `hasProducts && hasClients && (hasPrices || hasPriceLists)`

---

## API Endpoints Summary

| Action | Method | Endpoint | Timeout |
|---|---|---|---|
| Register | POST | `/auth/register-simple` | 60s |
| Verify OTP | POST | `/auth/verify-otp` | default |
| Resend OTP | POST | `/auth/resend-otp` | 60s |
| Login | POST | `/auth/login` | default |
| Create Distributor | POST | `/distributors` | default |
| Get Plans | GET | `/plans` | default |
| Onboarding Status | GET | `/distributor/onboarding-status` | default |

---

## Recommended Playwright Selectors

### Registration form:
```typescript
page.locator('input[name="firstName"]')
page.locator('input[name="lastName"]')
page.locator('input[name="email"]')
page.locator('input[name="password"]')
page.locator('input[name="passwordConfirmation"]')
page.locator('button[type="submit"]')
```

### OTP screen:
```typescript
// Wait for OTP screen
page.locator('h1:has-text("Verificar Email")')
// OTP inputs (6 of them)
page.locator('.otp-input').nth(0)  // through .nth(5)
// Verify button
page.locator('button:has-text("Verificar código")')
// Resend button (only visible after timer expires)
page.locator('button:has-text("Reenviar código")')
```

### User type selection:
```typescript
page.locator('h1:has-text("Tipo de Usuario")')
// Select client
page.locator('button:has(h3:has-text("Cliente"))')
// Select distributor
page.locator('button:has(h3:has-text("Distribuidor"))')
// Continue
page.locator('button:has-text("Continuar")')
```

### Personal info form (distributor):
```typescript
page.locator('input[name="firstName"]')     // pre-filled
page.locator('input[name="lastName"]')       // pre-filled
page.locator('input[name="phone"]')
page.locator('input[name="birthDate"]')
page.locator('input[name="address"]')
page.locator('input[name="city"]')
page.locator('select[name="country"]')
page.locator('button[type="submit"]')
```

### Business info form (distributor):
```typescript
page.locator('input[name="businessName"]')
page.locator('select[name="businessType"]')
page.locator('input[name="ruc"]')
page.locator('input[name="distributorCode"]')
page.locator('input[name="businessPhone"]')
page.locator('input[name="businessEmail"]')
page.locator('input[name="website"]')          // optional
page.locator('input[name="businessAddress"]')
page.locator('input[name="businessCity"]')
page.locator('select[name="businessCountry"]')
page.locator('input[name="yearsInBusiness"]')
page.locator('select[name="numberOfEmployees"]')
page.locator('textarea[name="description"]')
page.locator('button[type="submit"]')
```

### Plan selection:
```typescript
page.locator('h1:has-text("Elige tu Plan")')
// Plans are clickable divs. By plan display name:
page.locator('h3:has-text("Free")').locator('..')   // or Gold, Platinum
// Continue button with dynamic text:
page.locator('button:has-text("Completar registro con")')
```

### Registration success:
```typescript
page.locator('h1:has-text("¡Registro Completado!")')
page.locator('button:has-text("Comenzar a explorar")')
// OR wait for auto-redirect (5s):
page.waitForURL('/')
```

### Login page:
```typescript
page.locator('input[type="email"]')
page.locator('input[type="password"]')
page.locator('button[type="submit"]')        // "Iniciar Sesión"
page.locator('a:has-text("Regístrate aquí")')  // <Link> to /register
```

### Quick Setup Wizard:
```typescript
// Landing page
page.locator('button:has-text("Iniciar Configuración Guiada")')
// Navigation
page.locator('button:has-text("Siguiente")')
page.locator('button:has-text("Anterior")')
// Step indicator text
page.locator('text=Paso 1 de 6')
```

---

## Complete User Journey: Client Registration

```
1. Navigate to /register
2. Fill: firstName, lastName, email, password, passwordConfirmation
3. Click "Continuar"
4. → OTP screen appears
5. Capture OTP from console log
6. Fill 6 OTP inputs
7. Click "Verificar código"
8. → User Type screen appears
9. Click "Cliente" card
10. Click "Continuar"
11. → Success screen "¡Registro Completado!"
12. Auto-redirect to "/" after 5s  (or click "Comenzar a explorar")
```

## Complete User Journey: Distributor Registration

```
1. Navigate to /register
2. Fill: firstName, lastName, email, password, passwordConfirmation
3. Click "Continuar"
4. → OTP screen appears
5. Capture OTP from console log
6. Fill 6 OTP inputs
7. Click "Verificar código"
8. → User Type screen appears
9. Click "Distribuidor" card
10. Click "Continuar"
11. → Personal Info form appears
12. Fill: phone, birthDate, address, city, country (firstName/lastName pre-filled)
13. Click "Continuar"
14. → Business Info form appears
15. Fill: businessName, businessType, ruc, distributorCode, businessPhone, businessEmail, businessAddress, businessCity, businessCountry, yearsInBusiness, numberOfEmployees, description
16. Click "Continuar a selección de plan"
17. → Plan selection appears (loads plans from API)
18. Select a plan card
19. Click "Completar registro con {planName}"
20. → API creates distributor (POST /distributors)
21. → Success screen "¡Registro Completado!"
22. Auto-redirect to "/" after 5s  (or click "Comenzar a explorar")
23. (Optional) Navigate to /admin/configuracion-rapida for Quick Setup Wizard
```

## Toast Messages Reference

| Step | Success Toast | Error Toast |
|---|---|---|
| Register | "¡Registro exitoso!" | "Correo ya registrado" / "Error en el registro" |
| OTP Verify | "¡Código verificado!" | "Código incorrecto" |
| OTP Resend | "Código reenviado" | "Error al reenviar" |
| User Type (client) | "¡Registro completado!" | "Error" |
| User Type (distributor) | "Tipo de cuenta seleccionado" | "Error" |
| Personal Info | "Información personal guardada" | "Error al guardar información personal" |
| Business Info | "Información empresarial guardada" | "Error al guardar información empresarial" |
| Plan Selection | "¡Registro completado!" | "Error al seleccionar plan" |
| Login | "¡Bienvenido!" | "Error de autenticación" |
