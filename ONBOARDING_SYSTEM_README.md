# Sistema de Onboarding y Empty State

## 📋 Descripción

Sistema que detecta si un distribuidor es nuevo (sin datos cargados) y le muestra un **Empty State llamativo** que lo invita a usar el wizard de configuración rápida.

## 🎯 Funcionalidades Implementadas

### 1. Detección de Estado
- ✅ Servicio de onboarding (`onboarding.service.ts`) que consulta el backend  
- ✅ Mock temporal funcional para development
- ✅ Caché y manejo de errores

### 2. Componente Visual
- ✅ `EmptyStateWizardCard` - Tarjeta llamativa y animada
- ✅ Animaciones con Framer Motion
- ✅ Progreso visual del onboarding
- ✅ Partículas flotantes de fondo
- ✅ Botón CTA destacado que redirige al wizard
- ✅ Lista de próximos pasos sugeridos

### 3. Integración en Dashboard
- ✅ Carga automática del estado al montar
- ✅ Loading state mientras carga
- ✅ Muestra Empty State si `hasData === false`
- ✅ Muestra Dashboard normal si `hasData === true`

## 🚀 Testing

### Ver el Empty State
En `src/services/onboarding.service.ts`, línea 41:
```typescript
const mockResponse: OnboardingStatus = {
  hasData: false, // 👈 false = muestra Empty State
  // ...
};
```

### Ver el Dashboard Normal
```typescript
const mockResponse: OnboardingStatus = {
  hasData: true, // 👈 true = muestra Dashboard normal
  // ...
};
```

### Simular Progreso Parcial
```typescript
const mockResponse: OnboardingStatus = {
  hasData: false,
  details: {
    products: { count: 25, hasData: true }, // ✅ Tiene productos
    clients: { count: 0, hasData: false },  // ❌ No tiene clientes
    priceLists: { count: 0, hasData: false }, // ❌ No tiene listas
    prices: { count: 0, hasData: false },
    discounts: { count: 0, hasData: false },
  },
  completionPercentage: 33, // 👈 Muestra 33% completo
  nextSteps: [
    "Crea listas de precios",
    "Registra tus clientes"
  ],
  isFirstLogin: false,
};
```

## 📡 Endpoint Requerido del Backend

### GET `/api/distributor/onboarding-status`

Ver documentación completa en: `ONBOARDING_STATUS_ENDPOINT.md`

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "hasData": false,
  "details": {
    "products": { "count": 0, "hasData": false },
    "clients": { "count": 0, "hasData": false },
    "priceLists": { "count": 0, "hasData": false },
    "prices": { "count": 0, "hasData": false },
    "discounts": { "count": 0, "hasData": false }
  },
  "completionPercentage": 0,
  "nextSteps": [
    "Importa tus productos",
    "Crea listas de precios",
    "Registra tus clientes"
  ],
  "isFirstLogin": true
}
```

## 🔄 Lógica de Negocio

### Criterios para "Sin Datos"
Un usuario se considera nuevo (sin datos) cuando:
```
products.count === 0 
OR 
clients.count === 0 
OR 
priceLists.count === 0
```

Si **cualquiera** de estos está vacío → `hasData = false`

### Porcentaje de Completitud
```javascript
const steps = [
  hasProducts,
  hasClients,
  hasPriceLists,
  hasPrices,
  hasDiscounts
];
completionPercentage = (steps completados / 5) * 100
```

## 📁 Archivos Relacionados

- `src/services/onboarding.service.ts` - Servicio de consulta
- `src/components/admin/empty-state-wizard-card.tsx` - Componente visual
- `src/app/admin/page.tsx` - Dashboard con integración
- `ONBOARDING_STATUS_ENDPOINT.md` - Documentación del endpoint

## 🎨 Características Visuales

### Empty State Card
- **Fondo:** Gradiente glassmorphism con el tema actual
- **Icono principal:** Cohete animado con sparkles
- **Barra de progreso:** Muestra % de completitud
- **3 pasos con iconos:**
  - 📦 Importar Productos
  - 💲 Configurar Precios
  - 👥 Registrar Clientes
- **Botón CTA:** Animado con hover effects
- **Partículas flotantes:** Efecto de fondo sutil
- **Responsive:** Se adapta a mobile/tablet/desktop

### Estados
1. **Loading:** Spinner mientras carga
2. **Empty State:** Si `hasData === false`
3. **Dashboard:** Si `hasData === true`

## 🔧 Configuración Adicional

### Invalidar Caché al Completar Wizard
Cuando el usuario complete el wizard, debes recargar el estado:

```typescript
// En cualquier página después del wizard
import { getOnboardingStatus } from '@/services/onboarding.service';

// Después de guardar datos
await  getOnboardingStatus(); // Recarga el estado
window.location.reload(); // O forzar recarga si es necesario
```

### Actualización en Tiempo Real (Opcional)
Puedes usar React Query o SWR para auto-revalidación:

```typescript
import useSWR from 'swr';

function useOnboard ingStatus() {
  return useSWR('/api/distributor/onboarding-status', getOnboardingStatus, {
    revalidateOnFocus: true,
    refreshInterval: 60000, // Revalidar cada 60s
  });
}
```

## 🐛 Debugging

El componente muestra logs en consola:
```
⚠️ Usando MOCK de onboarding status - endpoint no implementado
```

Cuando veas este mensaje, significa que está usando el mock temporal.

Una vez implementes el endpoint del backend, el servicio automáticamente dejará de usar el mock y consultará la API real.

## 📱 Responsive Design

- **Mobile (< 768px):** Stack vertical, iconos más pequeños
- **Tablet (768px - 1024px):** 2 columnas en steps
- **Desktop (> 1024px):** 3 columnas en steps, máximo ancho

## 🎯 Flujo de Usuario

1. Usuario distribuidor hace login
2. Dashboard carga → Consulta estado de onboarding
3. **Si no tiene datos:**
   - Muestra Empty State llamativo
   - Usuario hace click en "Comenzar Ahora"
   - Redirige a `/admin/configuracion-rapida`
   - Usa el wizard para importar datos
4. **Si tiene datos:**
   - Muestra dashboard normal con estadísticas
   - Puede seguir operando normalmente

## 🚀 Próximos Pasos

1. ✅ Implementar endpoint backend (ver `ONBOARDING_STATUS_ENDPOINT.md`)
2. ⏳ Eliminar mock temporal una vez el backend esté listo
3. ⏳ Opcional: Agregar tracking de analytics cuando muestres empty state
4. ⏳ Opcional: Agregar tooltip/tour guiado para primera vez

## 💡 Mejoras Futuras

- [ ] Notificación push cuando completé todos los pasos
- [ ] Confetti animation al completar 100%
- [ ] Video tutorial embebido en el Empty State
- [ ] Estimación de tiempo para completar el setup
- [ ] Badge de "Nuevo" en el navbar
- [ ] Onboarding checklist permanente en sidebar (colapsable)
