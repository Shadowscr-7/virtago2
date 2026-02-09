# Playwright E2E Testing

Este proyecto utiliza [Playwright](https://playwright.dev/) para pruebas end-to-end (E2E).

## 🧪 Tests Disponibles

### 1. **Homepage Tests** (`homepage.spec.ts`)
- Prueba básica de carga de la página principal

### 2. **Register Tests** (`register.spec.ts`) ⭐ **NUEVO**
Pruebas completas del flujo de registro:
- ✅ Flujo completo de registro (formulario → OTP → éxito)
- ✅ Validación de email ya registrado
- ✅ Validación de contraseña débil
- ✅ Validación de coincidencia de contraseñas
- ✅ Manejo de timeouts
- ✅ Captura de errores de consola
- ✅ Medición de performance

## 🚀 Comandos Disponibles

```bash
# Ejecutar todas las pruebas
pnpm test:e2e

# Ejecutar solo las pruebas de registro
pnpm test:e2e tests/register.spec.ts

# Ejecutar con interfaz gráfica (RECOMENDADO 🎯)
pnpm test:e2e:ui

# Ejecutar en modo visible (con navegador)
pnpm test:e2e:headed

# Ejecutar en modo debug
pnpm test:e2e:debug

# Ver el reporte de la última ejecución
pnpm test:e2e:report
```

## 📊 Ver Resultados Completos

### Opción 1: UI Mode (Recomendado)

```bash
pnpm test:e2e:ui
```

**Ventajas:**
- 🎯 Ver tests ejecutándose en tiempo real
- 🎬 Grabación paso a paso
- 📸 Screenshots automáticos
- 🔍 Inspeccionar elementos
- ⚡ Re-ejecutar tests específicos
- 📝 Ver logs de consola en vivo

### Opción 2: Reporte HTML

```bash
# 1. Ejecutar tests
pnpm test:e2e tests/register.spec.ts

# 2. Ver reporte
pnpm test:e2e:report
```

**El reporte incluye:**
- ✅ Tests que pasaron / ❌ que fallaron
- 📸 Screenshots de cada paso
- 🎬 Videos de tests fallidos
- 📊 Tiempos de ejecución
- 🔍 Stack traces de errores
- 📝 Logs de consola capturados

### Opción 3: Archivos Generados

Después de ejecutar, revisa estos directorios:

```
playwright-report/           # Reporte HTML interactivo
├── index.html              # Ábrelo en el navegador

test-results/               # Screenshots y evidencias
├── register-form-filled.png
├── register-otp-screen.png
├── register-success.png
├── register-error-email-exists.png
└── [más screenshots...]
```

## 🎯 Ejemplo Completo: Test de Registro

### Paso 1: Iniciar Backend

```bash
# Terminal 1
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python run.py
# Backend en http://localhost:3001
```

### Paso 2: Ejecutar Tests con UI

```bash
# Terminal 2 (raíz del proyecto)
pnpm test:e2e:ui
```

### Paso 3: Seleccionar Test

1. En la UI de Playwright, busca `register.spec.ts`
2. Click en cualquier test para ejecutarlo
3. Observa la ejecución en tiempo real
4. Revisa screenshots, logs y timings

## 📋 Detalles de Tests de Registro

### Test 1: Flujo Completo Exitoso
```typescript
test('should complete full registration flow successfully')
```

**Qué verifica:**
1. Llenar formulario con datos válidos
2. Enviar formulario
3. Esperar pantalla OTP (hasta 60s)
4. Capturar OTP de consola
5. Ingresar OTP y verificar
6. Confirmar redirección exitosa

**Screenshots generados:**
- `register-form-filled.png` - Formulario completo
- `register-otp-screen.png` - Pantalla de OTP
- `register-otp-filled.png` - OTP ingresado
- `register-success.png` - Registro exitoso

### Test 2: Email Duplicado
```typescript
test('should show error for already registered email')
```

**Qué verifica:**
- Usar email existente
- Verificar mensaje: "Correo ya registrado"
- Screenshot: `register-error-email-exists.png`

### Test 3: Validaciones de Contraseña
```typescript
test('should validate password strength')
test('should validate password confirmation match')
```

**Qué verifica:**
- Contraseña debe tener mínimo 8 caracteres
- Confirmación debe coincidir con contraseña

### Test 4: Performance
```typescript
test('should complete registration within acceptable time')
```

**Qué verifica:**
- Registro completa en menos de 60 segundos
- Muestra duración en consola

### Test 5: Captura de Errores
```typescript
test('should capture console errors')
```

**Qué verifica:**
- No hay errores JavaScript
- No hay errores de hidratación de React
- Lista todos los mensajes de consola

**Output ejemplo:**
```
=== CONSOLE MESSAGES ===
log: 🔐 OTP para desarrollo: 123456
log: ✅ Usuario registrado

=== ERRORS ===
No errors found ✅
```

## 🐛 Debugging

Si un test falla:

1. **Ver Screenshot**: `test-results/[nombre-test].png`
2. **Ver Video**: En `test-results/` si falló
3. **Ver Trace**: Click en el test en el reporte HTML
4. **Logs**: Revisa la salida de consola

### Comandos de Debug Específicos

```bash
# Modo debug con breakpoints
pnpm test:e2e:debug tests/register.spec.ts

# Ver con navegador visible
pnpm test:e2e:headed tests/register.spec.ts

# Ver trace de un test específico
npx playwright show-trace test-results/.../trace.zip
```

## 📁 Estructura de Pruebas

```
tests/
├── homepage.spec.ts         # Pruebas de homepage
├── register.spec.ts         # Pruebas de registro ⭐
└── README.md               # Esta guía
```

## 🎯 Configuración

- **Navegadores**: Chromium, Firefox, WebKit
- **Dispositivos**: Desktop y Mobile
- **Base URL**: http://localhost:3002
- **Servidor**: Se inicia automáticamente antes de las pruebas
- **Timeouts**: 60 segundos para operaciones de registro
- **Screenshots**: Automáticos en cada paso importante
- **Videos**: Solo para tests fallidos

## 📝 Escribir Nuevas Pruebas

```typescript
import { test, expect } from '@playwright/test';

test.describe('Mi Módulo', () => {
  test('debería hacer algo específico', async ({ page }) => {
    await page.goto('/mi-ruta');
    
    // Capturar screenshot
    await page.screenshot({ 
      path: 'test-results/mi-screenshot.png' 
    });
    
    // Assertions
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

## 🎓 Recursos

- [Documentación Playwright](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Selectores](https://playwright.dev/docs/locators)
- [Assertions](https://playwright.dev/docs/test-assertions)

## 🛠️ Herramientas Útiles

- **Playwright Inspector**: `pnpm test:e2e:debug`
- **Test Generator**: `npx playwright codegen localhost:3002`
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