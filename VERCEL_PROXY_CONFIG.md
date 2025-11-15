# Configuración de Proxy en Vercel

## 📋 Resumen

El archivo `vercel.json` configura un proxy que redirige las peticiones de tu frontend a tu backend, permitiendo acceder a las rutas del backend a través del dominio del frontend.

## 🔄 Rutas Proxy Configuradas

### Documentación API
- **Frontend**: `https://virtago.shop/redoc` → **Backend**: `https://virtago-backend.vercel.app/redoc`
- **Frontend**: `https://virtago.shop/docs` → **Backend**: `https://virtago-backend.vercel.app/docs`

### API Endpoints
- **Frontend**: `https://virtago.shop/api/*` → **Backend**: `https://virtago-backend.vercel.app/api/*`

## ✅ Ventajas del Proxy

1. **Mismo Dominio**: Evita problemas de CORS
2. **URLs Limpias**: Los usuarios ven `virtago.shop/api/...` en lugar de URLs del backend
3. **Seguridad**: Oculta la URL real del backend
4. **Documentación Accesible**: ReDoc disponible en tu dominio principal

## 🚀 Configuración en Vercel

### Variables de Entorno Requeridas

En tu proyecto de Vercel → Settings → Environment Variables:

```bash
# API Configuration (usando proxy relativo)
NEXT_PUBLIC_API_URL=/api

# OpenAI Configuration
OPENAI_API_KEY=tu_api_key_real
OPENAI_VISION_MODEL=gpt-4o
OPENAI_MAX_TOKENS=1000

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dyy8hc876
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=virtago
CLOUDINARY_API_SECRET=tu_secret_real

# Otros
NEXT_PUBLIC_USE_MOCK_API=false
```

## 📝 Estructura de `vercel.json`

```json
{
  "rewrites": [
    // Documentación ReDoc
    {
      "source": "/redoc",
      "destination": "https://virtago-backend.vercel.app/redoc"
    },
    
    // Rutas de API
    {
      "source": "/api/:path*",
      "destination": "https://virtago-backend.vercel.app/api/:path*"
    }
  ],
  
  "headers": [
    // Headers CORS para las rutas de API
    {
      "source": "/api/:path*",
      "headers": [
        { "key": "Access-Control-Allow-Credentials", "value": "true" },
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        // ... más headers
      ]
    }
  ]
}
```

## 🔍 Pruebas

Después de hacer deploy, verifica:

1. **Documentación**: 
   - ✅ `https://virtago.shop/redoc`
   - ✅ `https://www.virtago.shop/redoc`

2. **API Endpoints**:
   - ✅ `https://virtago.shop/api/products/ecommerce/with-discounts`
   - ✅ Cualquier otra ruta de tu API

3. **Frontend**:
   - ✅ `https://virtago.shop/` (página principal)
   - ✅ `https://virtago.shop/productos` (catálogo)

## 🐛 Troubleshooting

### Si `/redoc` no funciona:

1. **Verificar que el backend esté activo**:
   ```bash
   curl https://virtago-backend.vercel.app/redoc
   ```

2. **Verificar logs en Vercel**:
   - Ve a tu proyecto → Deployments → Selecciona el último deploy → Functions
   - Revisa los logs de las funciones

3. **Verificar variables de entorno**:
   - Settings → Environment Variables
   - Asegúrate de que `NEXT_PUBLIC_API_URL=/api`

4. **Redeploy después de cambios**:
   - Cada cambio en `vercel.json` requiere un nuevo deploy
   - Usa `vercel --prod` o haz push a GitHub

### Si las APIs no funcionan:

1. **Verificar headers CORS** en el backend
2. **Revisar logs del navegador** (Console y Network tab)
3. **Verificar que el token JWT** se esté enviando correctamente

## 📚 Recursos

- [Vercel Rewrites Documentation](https://vercel.com/docs/concepts/projects/project-configuration#rewrites)
- [Vercel Headers Configuration](https://vercel.com/docs/concepts/projects/project-configuration#headers)
- [CORS Configuration](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

## 🔐 Seguridad

**IMPORTANTE**: 
- ✅ Las API keys están en variables de entorno (no en código)
- ✅ El archivo `.env.local` no se sube a GitHub (`.gitignore`)
- ✅ Usa `.env.production` solo como plantilla (sin secrets reales)
- ✅ Configura secrets directamente en Vercel

---

**Última actualización**: 2025-11-15
