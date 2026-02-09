# 🔍 Verificación del Endpoint de Onboarding

## 📍 Detalles del Endpoint

```
GET /api/distributor/onboarding-status
```

**Base URL del Backend:** Depende de tu configuración
- Desarrollo local: `http://localhost:3000` o `http://localhost:8000`
- Staging: `https://api-staging.virtago.com`
- Producción: `https://api.virtago.com`

## 🔐 Autenticación Requerida

El endpoint requiere un JWT token válido en el header:

```
Authorization: Bearer {tu_jwt_token}
```

## 🧪 Cómo Verificar si el Endpoint Existe

### Opción 1: Desde la Consola del Navegador (Más Fácil)

1. **Inicia sesión en tu aplicación** (para tener un token válido)

2. **Abre la consola del navegador** (`F12`)

3. **Ejecuta este código:**

```javascript
// Verificar endpoint de onboarding
fetch('/api/distributor/onboarding-status', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
    'Content-Type': 'application/json'
  }
})
.then(async response => {
  console.log('📊 Status:', response.status);
  
  if (response.status === 404) {
    console.log('❌ Endpoint NO implementado (404 Not Found)');
    return null;
  }
  
  if (response.status === 401 || response.status === 403) {
    console.log('🔒 Token inválido o sin permisos');
    return null;
  }
  
  if (response.ok) {
    const data = await response.json();
    console.log('✅ Endpoint IMPLEMENTADO!');
    console.log('📦 Datos recibidos:', data);
    return data;
  }
  
  console.log('⚠️ Error inesperado:', response.status);
  return null;
})
.catch(error => {
  console.error('❌ Error de red:', error);
});
```

**Interpretación de resultados:**
- ✅ **200 OK** → Endpoint implementado y funcionando
- ❌ **404 Not Found** → Endpoint NO existe todavía
- 🔒 **401 Unauthorized** → Token inválido o expirado
- 🔒 **403 Forbidden** → Usuario no tiene permisos (no es distribuidor)
- ⚠️ **500 Server Error** → Endpoint existe pero tiene un error

---

### Opción 2: Con cURL (Desde Terminal)

```bash
# 1. Obtener tu token (después de hacer login)
# Copia el token desde localStorage o desde la respuesta del login

# 2. Hacer la petición
curl -X GET "http://localhost:3000/api/distributor/onboarding-status" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -v
```

**Interpretación:**
```bash
# Si responde con 200 y JSON:
< HTTP/1.1 200 OK
< Content-Type: application/json
{
  "hasData": false,
  "details": { ... }
}
# ✅ Endpoint implementado

# Si responde con 404:
< HTTP/1.1 404 Not Found
# ❌ Endpoint NO existe
```

---

### Opción 3: Con Postman / Thunder Client

1. **Nueva Request GET:**
   ```
   GET {{base_url}}/api/distributor/onboarding-status
   ```

2. **Headers:**
   ```
   Authorization: Bearer {{token}}
   Content-Type: application/json
   ```

3. **Enviar** y verificar:
   - ✅ **200 OK** = Implementado
   - ❌ **404** = No existe

---

### Opción 4: Desde el Código de la Aplicación

**Archivo:** `src/services/onboarding.service.ts`

El servicio ya tiene lógica que detecta automáticamente si el endpoint existe:

```typescript
export const getOnboardingStatus = async (): Promise<OnboardingStatus> => {
  try {
    // Intenta llamar al endpoint real
    const response = await http.get<OnboardingStatus>('/api/distributor/onboarding-status');
    
    // Si llega aquí, significa que el endpoint existe y respondió
    console.log('✅ Endpoint del backend respondió correctamente');
    return response.data;
    
  } catch (error) {
    // Si falla, usa el mock
    console.error('❌ Backend no responde, usando mock');
    // ... lógica del mock
  }
};
```

**Para verificar en tu app:**

1. Abre el dashboard (`/admin`)
2. Abre DevTools → Console
3. Busca estos mensajes:
   - ✅ `"Endpoint del backend respondió correctamente"` → Implementado
   - ❌ `"Usando MOCK de onboarding status"` → NO implementado

---

## 📝 Response Esperado (Endpoint Implementado)

Si el endpoint está implementado, debe responder con esta estructura:

```json
{
  "hasData": true,
  "details": {
    "products": {
      "count": 150,
      "hasData": true
    },
    "clients": {
      "count": 45,
      "hasData": true
    },
    "priceLists": {
      "count": 3,
      "hasData": true
    },
    "prices": {
      "count": 450,
      "hasData": true
    },
    "discounts": {
      "count": 12,
      "hasData": true
    }
  },
  "completionPercentage": 85,
  "nextSteps": [],
  "isFirstLogin": false
}
```

---

## 🔧 Script de Verificación Automática

Guarda esto como `test-onboarding-endpoint.js` y ejecútalo con Node.js:

```javascript
#!/usr/bin/env node

const https = require('https');

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const TOKEN = process.env.AUTH_TOKEN || 'tu_token_aqui';

console.log('🔍 Verificando endpoint de onboarding...');
console.log(`📍 URL: ${BASE_URL}/api/distributor/onboarding-status`);

const options = {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  }
};

const req = https.request(`${BASE_URL}/api/distributor/onboarding-status`, options, (res) => {
  console.log(`\n📊 Status Code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', chunk => data += chunk);
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ ENDPOINT IMPLEMENTADO!');
      console.log('\n📦 Response:');
      console.log(JSON.stringify(JSON.parse(data), null, 2));
    } else if (res.statusCode === 404) {
      console.log('❌ ENDPOINT NO EXISTE (404)');
      console.log('   El backend aún no implementó este endpoint');
    } else if (res.statusCode === 401) {
      console.log('🔒 TOKEN INVÁLIDO (401)');
      console.log('   Verifica tu token de autenticación');
    } else {
      console.log(`⚠️  Status inesperado: ${res.statusCode}`);
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error de red:', error.message);
  console.log('\n💡 Verifica que:');
  console.log('   1. El backend esté corriendo');
  console.log('   2. La URL sea correcta');
  console.log('   3. Tengas conexión a la red');
});

req.end();
```

**Uso:**
```bash
# Con variables de entorno
API_URL=http://localhost:3000 AUTH_TOKEN=tu_token node test-onboarding-endpoint.js

# O editar las variables en el archivo y ejecutar:
node test-onboarding-endpoint.js
```

---

## ✅ Checklist de Verificación

- [ ] Backend está corriendo
- [ ] Tengo un token JWT válido de distribuidor
- [ ] Ejecuté la verificación desde consola/cURL/Postman
- [ ] Verifiqué los logs en la consola del dashboard
- [ ] Si el endpoint existe, devuelve la estructura JSON correcta
- [ ] Si no existe, veo el mensaje "Usando MOCK"

---

## 📊 Tabla de Status Codes

| Code | Significado | Endpoint existe? | Acción |
|------|-------------|------------------|--------|
| 200 | OK | ✅ Sí | Listo para usar |
| 404 | Not Found | ❌ No | Pedir al backend que lo implemente |
| 401 | Unauthorized | 🤷 Tal vez | Verificar token |
| 403 | Forbidden | 🤷 Tal vez | Verificar permisos de usuario |
| 500 | Server Error | ✅ Sí (con bug) | Reportar error al backend |

---

## 🔗 URLs de Endpoints Relacionados

Para referencia, estos son todos los endpoints que usa la app:

```
POST   /api/auth/login           # Login
POST   /api/auth/register        # Registro
GET    /api/distributor/onboarding-status  # 👈 Este es el nuevo
GET    /api/products             # Lista de productos
GET    /api/clients              # Lista de clientes
GET    /api/price-lists          # Listas de precios
```

---

## 💡 Tip: Configuración de Environment

En tu archivo `.env` o `.env.local`:

```bash
# Development
NEXT_PUBLIC_API_URL=http://localhost:3000

# Staging
# NEXT_PUBLIC_API_URL=https://api-staging.virtago.com

# Production
# NEXT_PUBLIC_API_URL=https://api.virtago.com
```

Luego en el código:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
```

---

## 🆘 Si el Endpoint NO Existe

Envía este documento al equipo de backend:
- `ONBOARDING_STATUS_ENDPOINT.md` - Especificación completa
- Incluye estructura de response, SQL queries, y ejemplo de implementación

---

**Última actualización:** 2026-02-08  
**Versión:** 1.0.0
