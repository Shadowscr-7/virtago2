# Configuración de Proxy para Documentación del Backend

## 📋 Descripción

Este documento explica cómo se configuró el proxy en Next.js para redirigir las peticiones de documentación (`/redoc`, `/docs`) desde el frontend hacia el backend, permitiendo acceder a la documentación de la API a través del dominio del frontend.

## 🔧 Configuración Local

### 1. Variables de Entorno

En tu archivo `.env.local`, asegúrate de tener:

```bash
# URL del backend para desarrollo
BACKEND_URL=http://localhost:3001
```

### 2. Next.js Config

En `next.config.ts` se configuró la función `rewrites()` que redirige las siguientes rutas:

- `/redoc` → `http://localhost:3001/redoc`
- `/docs` → `http://localhost:3001/docs`
- `/openapi.json` → `http://localhost:3001/openapi.json`

### 3. Uso en Desarrollo

1. **Inicia tu backend** en el puerto 3001
2. **Inicia tu frontend** en el puerto 3002:
   ```bash
   pnpm dev
   ```
3. **Accede a la documentación**:
   - Frontend: `http://localhost:3002/redoc`
   - Backend directo: `http://localhost:3001/redoc`

Ambas URLs mostrarán la misma documentación, pero la del frontend se redirige internamente al backend.

## 🚀 Configuración en Vercel

### Paso 1: Configurar Variables de Entorno

En el dashboard de Vercel:

1. Ve a tu proyecto → **Settings** → **Environment Variables**
2. Agrega la siguiente variable:

| Nombre | Valor | Environments |
|--------|-------|--------------|
| `BACKEND_URL` | `https://tu-backend-api.com` | Production, Preview, Development |

⚠️ **Importante**: Reemplaza `https://tu-backend-api.com` con la URL real de tu backend en producción.

### Paso 2: Verificar el Deploy

Después de configurar la variable de entorno:

1. Realiza un nuevo deploy o redeploy del proyecto
2. La configuración de `rewrites()` tomará automáticamente la variable `BACKEND_URL`
3. Accede a `https://tu-dominio.com/redoc` para verificar

### Paso 3: CORS en el Backend

Asegúrate de que tu backend FastAPI permita requests desde tu dominio de Vercel:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3002",  # Desarrollo
        "https://tu-dominio.vercel.app",  # Producción
        "https://tu-dominio.com",  # Dominio personalizado
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🎯 Rutas Disponibles

Una vez configurado, podrás acceder a:

| Ruta Frontend | Redirige a | Descripción |
|---------------|------------|-------------|
| `/redoc` | `{BACKEND_URL}/redoc` | Documentación ReDoc |
| `/docs` | `{BACKEND_URL}/docs` | Documentación Swagger UI |
| `/openapi.json` | `{BACKEND_URL}/openapi.json` | Especificación OpenAPI |

## 🔍 Troubleshooting

### Problema: "404 Not Found" al acceder a /redoc

**Solución**:
- Verifica que la variable `BACKEND_URL` esté configurada correctamente
- Asegúrate de que el backend esté corriendo y accesible
- Revisa los logs de Vercel para ver si hay errores de conexión

### Problema: CORS errors

**Solución**:
- Verifica que el backend tenga configurado CORS correctamente
- Añade tu dominio de Vercel a la lista de orígenes permitidos

### Problema: La documentación se ve pero sin estilos

**Solución**:
- Asegúrate de que la ruta `/openapi.json` también esté siendo redirigida
- Verifica que el backend devuelva los recursos estáticos necesarios

## 📝 Notas Adicionales

- Los rewrites en Next.js funcionan en el lado del servidor, por lo que no verás un redirect en el navegador
- Esto es diferente a los redirects, que sí cambian la URL visible
- Los rewrites permiten mantener una URL limpia mientras se consume contenido de otro origen
- Esta configuración funciona tanto en desarrollo como en producción sin cambios en el código

## 🔗 Referencias

- [Next.js Rewrites Documentation](https://nextjs.org/docs/api-reference/next.config.js/rewrites)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
