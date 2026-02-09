# 🔍 Diagnóstico: Dashboard Muestra 0s Después del Wizard

## Problema

El usuario completa el wizard de configuración rápida con éxito, pero al ir al dashboard todos los indicadores muestran 0:
- Clientes: 0
- Productos: 0  
- Listas de Precios: 0
- Precios: 0
- Descuentos: 0

## Causas Posibles

### 1. ⚠️ Datos No Procesados en el Backend

**Síntoma:** El wizard envía los datos pero el backend no los procesa correctamente.

**Verificación:**
```javascript
// En consola del navegador
await virtago.testDashboard()
```

Si muestra 0s, el backend no tiene los datos guardados.

**Solución:**
El backend debe:
1. Recibir los datos del wizard desde cada paso (POST requests)
2. Guardar en la base de datos (Firestore/SQL)
3. El endpoint `/api/distributor/dashboard-home` debe leer esos datos

---

### 2. 🕒 Delay en Procesamiento

**Síntoma:** Los datos se están procesando pero aún no están disponibles.

**Verificación:**
```javascript
// Esperar 1-2 minutos y verificar de nuevo
setTimeout(() => virtago.testDashboard(), 120000); // 2 minutos
```

**Solución:**
Esperar o agregar indicador de "procesando datos" en el wizard.

---

### 3. 🔐 Token/Usuario Incorrecto

**Síntoma:** El backend devuelve datos de otro distributor o no encuentra al usuario.

**Verificación:**
```javascript
// Verificar token y distributorCode
const user = JSON.parse(localStorage.getItem('user') || '{}');
console.log('DistributorCode:', user.distributorCode);
console.log('Token:', localStorage.getItem('token'));
```

**Solución:**
Cerrar sesión y volver a iniciar sesión para refrescar el token.

---

### 4. 📦 Wizard No Guardó en LocalStorage

**Síntoma:** El servicio de onboarding no detecta que se completó el wizard.

**Verificación:**
```javascript
virtago.getWizardState()
```

**Solución:**
```javascript
// Si no hay datos, simular:
virtago.simulateWizardCompleted()
location.reload()
```

---

## Diagnóstico Rápido

Ejecuta este script en la consola del navegador:

```javascript
(async () => {
  console.log('🔍 DIAGNÓSTICO COMPLETO');
  console.log('═══════════════════════════════════════════');
  
  // 1. Verificar localStorage
  const wizardData = localStorage.getItem('virtago_wizard_completed');
  console.log('1️⃣ Wizard en localStorage:', wizardData ? '✅ SI' : '❌ NO');
  if (wizardData) {
    console.log('   Datos:', JSON.parse(wizardData));
  }
  
  // 2. Verificar usuario y token
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  console.log('2️⃣ Usuario autenticado:', user.email || 'Sin usuario');
  console.log('   DistributorCode:', user.distributorCode || 'Sin código');
  console.log('   Token:', token ? '✅ Presente' : '❌ Faltante');
  
  // 3. Probar endpoint de onboarding
  console.log('3️⃣ Probando /api/distributor/onboarding-status...');
  try {
    const onboardingRes = await fetch('/api/distributor/onboarding-status', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const onboardingData = await onboardingRes.json();
    console.log('   Status:', onboardingRes.status);
    console.log('   hasData:', onboardingData.data?.hasData);
    console.log('   Respuesta completa:', onboardingData);
  } catch (error) {
    console.error('   ❌ Error:', error.message);
  }
  
  // 4. Probar endpoint de dashboard
  console.log('4️⃣ Probando /api/distributor/dashboard-home...');
  try {
    const dashRes = await fetch('/api/distributor/dashboard-home', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const dashData = await dashRes.json();
    console.log('   Status:', dashRes.status);
    if (dashData.data?.stats) {
      console.log('   Ventas:', dashData.data.stats.sales.total);
      console.log('   Órdenes:', dashData.data.stats.orders.total);
      console.log('   Productos:', dashData.data.stats.products.total);
      console.log('   Clientes:', dashData.data.stats.clients.total);
    }
    console.log('   Respuesta completa:', dashData);
  } catch (error) {
    console.error('   ❌ Error:', error.message);
  }
  
  console.log('═══════════════════════════════════════════');
  console.log('✅ Diagnóstico completado');
})();
```

---

## Soluciones según Resultado

### Resultado A: Backend Devuelve 0s Reales

**Causa:** Los datos del wizard no se guardaron en la base de datos del backend.

**Fix Backend (lo que deben hacer):**

Cuando el frontend hace POST a cada paso del wizard, el backend debe:

```javascript
// Ejemplo: Endpoint de importación de clientes
POST /api/clients
Body: [{ clientId, name, email, ... }, ...]

// El backend debe:
1. Recibir el array de clientes
2. Validar cada cliente
3. Guardar en Firestore/SQL con distributorCode del usuario
4. Retornar { success: true, imported: X, failed: Y }
```

Lo mismo para productos, listas de precios, precios y descuentos.

**Fix Frontend (temporal mientras el backend se arregla):**

Modificar el servicio de dashboard para usar datos de localStorage si el backend devuelve 0s:

```typescript
// src/services/dashboard.service.ts
export const getDashboardData = async (): Promise<DashboardData> => {
  try {
    const response = await api.admin.dashboard.getHomeData();
    const backendData = response.data as any;
    
    // Si el backend devuelve 0s pero tenemos datos del wizard...
    const wizardDataRaw = localStorage.getItem('virtago_wizard_completed');
    const hasWizardData = !!wizardDataRaw;
    const backendHasNoData = 
      backendData?.data?.stats?.products?.total === 0 &&
      backendData?.data?.stats?.clients?.total === 0;
    
    if (hasWizardData && backendHasNoData) {
      console.warn('⚠️ Backend devuelve 0s, usando datos del wizard');
      const wizardData = JSON.parse(wizardDataRaw);
      
      return {
        stats: {
          sales: { total: 0, currency: 'USD', change: 0, period: 'month' },
          orders: { total: 0, change: 0, period: 'month' },
          products: { 
            total: wizardData.summary?.totalProducts || 0, 
            change: 0, 
            period: 'month' 
          },
          clients: { 
            total: wizardData.summary?.totalClients || 0, 
            change: 0, 
            period: 'month' 
          },
        },
        salesChart: {
          period: 'monthly',
          year: new Date().getFullYear(),
          data: [],
        },
        recentActivity: [],
      };
    }
    
    // Si el backend tiene datos, usarlos
    return backendData.data;
    
  } catch (error) {
    // ... fallback existente
  }
};
```

---

### Resultado B: Token Inválido/Expirado

**Fix:**
```javascript
// Cerrar sesión
localStorage.clear();
// Ir a login y volver a iniciar sesión
window.location.href = '/login';
```

---

### Resultado C: No Hay Datos en LocalStorage

**Fix:**
```javascript
// Simular wizard completado
virtago.simulateWizardCompleted();
location.reload();
```

---

## Verificación Final

Después de aplicar la solución, ejecuta:

```javascript
// Debe mostrar números > 0
await virtago.testDashboard()

// Debe mostrar la tabla con datos
// Si muestra 0s, el problema está en el backend
```

---

## Recomendaciones

### Para el Equipo Backend

1. **Logs de debugging:** Agregar logs en cada endpoint del wizard para confirmar que reciben los datos
2. **Validar guardado:** Verificar que los datos realmente se guardan en Firestore/SQL
3. **Testing:** Probar manualmente los endpoints del wizard:
   ```bash
   POST /api/clients
   POST /api/products  
   POST /api/price-lists
   POST /api/prices
   POST /api/discounts
   ```

### Para el Frontend

1. **Mostrar confirmación:** Después de cada paso del wizard, mostrar un mensaje de confirmación con la cantidad de registros creados
2. **Agregar retry:** Si un paso falla, permitir reintentar
3. **Progress tracking:** Guardar el progreso de cada paso para poder retomar si algo falla

---

## Documentos Relacionados

- [FIX_DASHBOARD_SHOWS_ZERO.md](FIX_DASHBOARD_SHOWS_ZERO.md) - Documentación anterior sobre este problema
- [ONBOARDING_SYSTEM_README.md](ONBOARDING_SYSTEM_README.md) - Sistema de onboarding completo
- [WIZARD_README.md](WIZARD_README.md) - Documentación del wizard

