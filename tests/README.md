# Playwright E2E Testing

Este proyecto utiliza [Playwright](https://playwright.dev/) para pruebas end-to-end (E2E).

## 🚀 Comandos Disponibles

```bash
# Ejecutar todas las pruebas
pnpm test:e2e

# Ejecutar pruebas con interfaz gráfica
pnpm test:e2e:ui

# Ejecutar pruebas en modo visible (con navegador)
pnpm test:e2e:headed

# Ejecutar pruebas en modo debug
pnpm test:e2e:debug

# Ver el reporte de la última ejecución
pnpm test:e2e:report
```

## 📁 Estructura de Pruebas

```
tests/
├── homepage.spec.ts          # Pruebas de la página principal
└── [futuros archivos]        # Más pruebas por módulos
```

## 🎯 Configuración

- **Navegadores**: Chromium, Firefox, WebKit
- **Dispositivos**: Desktop y Mobile
- **Base URL**: http://localhost:3000
- **Servidor**: Se inicia automáticamente antes de las pruebas

## 📝 Escribir Nuevas Pruebas

```typescript
import { test, expect } from '@playwright/test';

test.describe('Mi Módulo', () => {
  test('debería hacer algo específico', async ({ page }) => {
    await page.goto('/mi-pagina');
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

## 🛠️ Herramientas Útiles

- **Playwright Inspector**: `pnpm test:e2e:debug`
- **Test Generator**: `npx playwright codegen localhost:3000`
- **Trace Viewer**: Incluido en el reporte HTML

## 📊 Reportes

Los reportes se generan automáticamente y se pueden ver con:
```bash
pnpm test:e2e:report
```

## 🔧 Configuración Avanzada

La configuración está en `playwright.config.ts` y incluye:
- Configuración de navegadores
- Timeouts y reintentos
- Screenshots y videos en fallos
- Configuración del servidor de desarrollo