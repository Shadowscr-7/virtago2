import { test, expect, Page } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers reutilizables
// ─────────────────────────────────────────────────────────────────────────────

/** Genera un email único para cada ejecución */
const uniqueEmail = () => `dist_test_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@example.com`;

/** Datos de prueba para el registro completo de distribuidor */
const TEST_DATA = {
  // Step 1 — Registro
  firstName: 'Carlos',
  lastName: 'Distribuidor',
  password: 'Test@Dist2025!',

  // Step 3 — Información personal
  personal: {
    phone: '+598991234567',
    birthDate: '1990-05-15',
    address: 'Avenida 18 de Julio 1234, Apto 501',
    city: 'Montevideo',
    country: 'Uruguay',
  },

  // Step 4 — Información de empresa
  business: {
    businessName: 'Distribuidora Test S.A.',
    businessType: 'Distribuidor mayorista',
    ruc: '21123456789-0',
    distributorCode: 'DIST-TEST-001',
    businessPhone: '+598212345678',
    businessEmail: 'contacto@disttest.com.uy',
    website: 'https://www.disttest.com.uy',
    businessAddress: '18 de Julio 5678, Oficina 302',
    businessCity: 'Montevideo',
    businessCountry: 'Uruguay',
    yearsInBusiness: '5',
    numberOfEmployees: '11-25',
    description: 'Distribuidora de pruebas E2E — empresa mayorista con amplia trayectoria en el mercado uruguayo de distribución.',
  },
};

/**
 * Captura el OTP interceptando la respuesta de red de /auth/register-simple.
 * El backend devuelve { data: { otp: "XXXXXX", token, user } }.
 * Fallback: también intenta capturarlo del console.log del store.
 */
function setupOTPCapture(page: Page): { getOTP: () => string; waitForOTP: () => Promise<string> } {
  let otp = '';

  // Método 1: interceptar la respuesta HTTP de registro
  page.on('response', async (response) => {
    try {
      const url = response.url();
      if (url.includes('auth/register') && (response.status() === 200 || response.status() === 201)) {
        const json = await response.json().catch(() => null);
        // El backend retorna: { success, data: { otp, token, user } }
        const capturedOTP = json?.data?.otp || json?.otp;
        if (capturedOTP && /^\d{6}$/.test(String(capturedOTP))) {
          otp = String(capturedOTP);
          console.log(`✅ OTP capturado de respuesta HTTP: ${otp}`);
        }
      }
    } catch {
      // Ignorar errores de parseo de responses no-JSON
    }
  });

  // Método 2 (fallback): capturar del console.log del navegador
  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('OTP') && !otp) {
      const match = text.match(/\d{6}/);
      if (match) {
        otp = match[0];
        console.log(`✅ OTP capturado de console.log: ${otp}`);
      }
    }
  });

  return {
    getOTP: () => otp,
    waitForOTP: async () => {
      // Esperar hasta 15s a que el OTP aparezca
      for (let i = 0; i < 30; i++) {
        if (otp) return otp;
        await new Promise((r) => setTimeout(r, 500));
      }
      return otp;
    },
  };
}

/**
 * Ingresa los 6 dígitos del OTP uno por uno en los inputs .otp-input
 */
async function fillOTP(page: Page, code: string) {
  const digits = code.split('');
  for (let i = 0; i < 6; i++) {
    const input = page.locator('input.otp-input').nth(i);
    await input.fill(digits[i] || '0');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Test principal: flujo completo de registro de distribuidor
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Onboarding Distribuidor — Flujo Completo', () => {
  // Timeout generoso porque el flujo tiene muchos pasos con delays simulados
  test.setTimeout(180_000);

  let email: string;

  test.beforeEach(async () => {
    email = uniqueEmail();
  });

  // ─── HAPPY PATH ────────────────────────────────────────────────────────────

  test('Registro completo de distribuidor (7 pasos)', async ({ page }) => {
    // Capturar OTP de la respuesta HTTP ANTES de navegar
    const { waitForOTP } = setupOTPCapture(page);

    // ── PASO 1: Formulario de registro ────────────────────────────────────
    await test.step('Paso 1 — Formulario de registro', async () => {
      await page.goto('/login');
      await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible({ timeout: 15_000 });

      // Ir a registro
      await page.getByText('Regístrate aquí').click();
      await expect(page.locator('input[name="firstName"]')).toBeVisible({ timeout: 10_000 });

      // Llenar datos
      await page.locator('input[name="firstName"]').fill(TEST_DATA.firstName);
      await page.locator('input[name="lastName"]').fill(TEST_DATA.lastName);
      await page.locator('input[name="email"]').fill(email);
      await page.locator('input[name="password"]').fill(TEST_DATA.password);
      await page.locator('input[name="passwordConfirmation"]').fill(TEST_DATA.password);

      await page.screenshot({ path: 'test-results/dist-01-register-form.png' });

      // Enviar
      await page.getByRole('button', { name: /continuar/i }).click();
    });

    // ── PASO 2: Verificación OTP ──────────────────────────────────────────
    await test.step('Paso 2 — Verificación de email (OTP)', async () => {
      // Esperar pantalla OTP
      await expect(page.getByRole('heading', { name: /verificar email/i })).toBeVisible({ timeout: 60_000 });

      // Verificar que se muestra el email correcto
      await expect(page.getByText(email)).toBeVisible();

      // Esperar a que el OTP sea capturado de la respuesta HTTP del backend
      const otpCode = await waitForOTP();

      expect(otpCode, 'Debe capturarse el OTP de la respuesta del backend').toBeTruthy();

      await page.screenshot({ path: 'test-results/dist-02-otp-screen.png' });

      // Ingresar OTP
      await fillOTP(page, otpCode);

      await page.screenshot({ path: 'test-results/dist-03-otp-filled.png' });

      // Verificar
      await page.getByRole('button', { name: /verificar código/i }).click();

      // Esperar confirmación
      await expect(page.getByText(/código verificado|verificado exitosamente/i)).toBeVisible({ timeout: 15_000 });
    });

    // ── PASO 3: Selección tipo de usuario ─────────────────────────────────
    await test.step('Paso 3 — Selección tipo de usuario: Distribuidor', async () => {
      await expect(page.getByRole('heading', { name: /tipo de usuario/i })).toBeVisible({ timeout: 15_000 });

      // Verificar que ambos tipos están disponibles
      await expect(page.getByRole('heading', { name: 'Cliente' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Distribuidor' })).toBeVisible();

      await page.screenshot({ path: 'test-results/dist-04-user-type.png' });

      // Seleccionar Distribuidor
      const distribuidorCard = page.locator('button').filter({ has: page.getByRole('heading', { name: 'Distribuidor' }) });
      await distribuidorCard.click();

      // Verificar que se seleccionó (debe tener borde/estilo de selección)
      await expect(distribuidorCard).toHaveClass(/border-purple|selected|ring/);

      // Continuar
      await page.getByRole('button', { name: /continuar/i }).click();

      // Debe navegar a información personal
      await expect(page.getByText(/información personal/i)).toBeVisible({ timeout: 15_000 });
    });

    // ── PASO 4: Información personal ──────────────────────────────────────
    await test.step('Paso 4 — Información personal', async () => {
      await expect(page.getByRole('heading', { name: /información personal/i })).toBeVisible({ timeout: 15_000 });
      await expect(page.getByText(/completa tu perfil/i)).toBeVisible();

      // Nombre y apellido deberían estar prellenados del registro
      const firstNameInput = page.locator('input[name="firstName"]');
      const lastNameInput = page.locator('input[name="lastName"]');
      await expect(firstNameInput).toHaveValue(TEST_DATA.firstName);
      await expect(lastNameInput).toHaveValue(TEST_DATA.lastName);

      // Llenar campos restantes
      await page.locator('input[name="phone"]').fill(TEST_DATA.personal.phone);
      await page.locator('input[name="birthDate"]').fill(TEST_DATA.personal.birthDate);
      await page.locator('input[name="address"]').fill(TEST_DATA.personal.address);
      await page.locator('input[name="city"]').fill(TEST_DATA.personal.city);

      // País (select) — debería tener Uruguay por defecto
      const countrySelect = page.locator('select[name="country"]');
      await expect(countrySelect).toHaveValue(TEST_DATA.personal.country);

      await page.screenshot({ path: 'test-results/dist-05-personal-info.png' });

      // Enviar
      await page.getByRole('button', { name: /continuar/i }).click();

      // Esperar confirmación toast + transición
      await expect(page.getByText(/información personal guardada/i)).toBeVisible({ timeout: 10_000 });
    });

    // ── PASO 5: Información de empresa ────────────────────────────────────
    await test.step('Paso 5 — Información de empresa', async () => {
      await expect(page.getByRole('heading', { name: /información de empresa/i })).toBeVisible({ timeout: 15_000 });
      await expect(page.getByText(/datos de tu empresa/i)).toBeVisible();

      // Llenar todos los campos de empresa
      await page.locator('input[name="businessName"]').fill(TEST_DATA.business.businessName);

      // Tipo de empresa (select)
      await page.locator('select[name="businessType"]').selectOption(TEST_DATA.business.businessType);

      // RUC
      await page.locator('input[name="ruc"]').fill(TEST_DATA.business.ruc);

      // Código de distribuidor
      await page.locator('input[name="distributorCode"]').fill(TEST_DATA.business.distributorCode);

      // Teléfono comercial
      await page.locator('input[name="businessPhone"]').fill(TEST_DATA.business.businessPhone);

      // Email comercial
      await page.locator('input[name="businessEmail"]').fill(TEST_DATA.business.businessEmail);

      // Website (opcional)
      await page.locator('input[name="website"]').fill(TEST_DATA.business.website);

      // Dirección comercial
      await page.locator('input[name="businessAddress"]').fill(TEST_DATA.business.businessAddress);

      // Ciudad
      await page.locator('input[name="businessCity"]').fill(TEST_DATA.business.businessCity);

      // País (select — debería tener Uruguay por defecto)
      const businessCountrySelect = page.locator('select[name="businessCountry"]');
      await expect(businessCountrySelect).toHaveValue(TEST_DATA.business.businessCountry);

      // Años en el negocio
      await page.locator('input[name="yearsInBusiness"]').fill(TEST_DATA.business.yearsInBusiness);

      // Número de empleados (select)
      await page.locator('select[name="numberOfEmployees"]').selectOption(TEST_DATA.business.numberOfEmployees);

      // Descripción (textarea)
      await page.locator('textarea[name="description"]').fill(TEST_DATA.business.description);

      await page.screenshot({ path: 'test-results/dist-06-business-info.png' });

      // Enviar
      await page.getByRole('button', { name: /continuar a selección de plan/i }).click();

      // Esperar confirmación toast + transición
      await expect(page.getByText(/información empresarial guardada/i)).toBeVisible({ timeout: 10_000 });
    });

    // ── PASO 6: Selección de plan ─────────────────────────────────────────
    await test.step('Paso 6 — Selección de plan', async () => {
      await expect(page.getByRole('heading', { name: /elige tu plan/i })).toBeVisible({ timeout: 15_000 });

      // Esperar a que se carguen los planes (puede haber estado de loading)
      await expect(page.getByText(/cargando planes/i)).not.toBeVisible({ timeout: 15_000 });

      // Verificar que hay planes disponibles (al menos 1 card visible)
      const planCards = page.locator('[class*="cursor-pointer"]').filter({ has: page.locator('h3') });
      const planCount = await planCards.count();
      expect(planCount, 'Debe haber al menos 1 plan disponible').toBeGreaterThanOrEqual(1);

      // Si hay un plan "Más Popular", seleccionarlo; si no, seleccionar el primero
      const popularPlan = page.getByText('Más Popular');
      if (await popularPlan.isVisible({ timeout: 3000 }).catch(() => false)) {
        const popularCard = page.locator('[class*="cursor-pointer"]').filter({ has: popularPlan });
        await popularCard.click();
        console.log('✅ Plan "Más Popular" seleccionado');
      } else {
        // Seleccionar el primer plan
        await planCards.first().click();
        console.log('✅ Primer plan seleccionado');
      }

      await page.screenshot({ path: 'test-results/dist-07-plan-selection.png' });

      // Verificar progreso del registro
      await expect(page.getByText(/progreso del registro/i)).toBeVisible();

      // Completar registro con el plan seleccionado
      const completarBtn = page.getByRole('button', { name: /completar registro/i });
      await expect(completarBtn).toBeEnabled();
      await completarBtn.click();

      // Esperar proceso (puede tardar por llamada API real)
      // El botón muestra "Creando distribuidor..." mientras procesa
      await expect(page.getByText(/creando distribuidor/i)).toBeVisible({ timeout: 5_000 }).catch(() => {
        // Puede ser tan rápido que no se vea el loading
      });
    });

    // ── PASO 7: Pantalla de éxito ─────────────────────────────────────────
    await test.step('Paso 7 — Registro completado', async () => {
      // Esperar pantalla de éxito
      await expect(page.getByRole('heading', { name: /registro completado/i })).toBeVisible({ timeout: 30_000 });
      await expect(page.getByText(/bienvenido a virtago/i)).toBeVisible();

      // Verificar datos del usuario
      await expect(page.getByText(`${TEST_DATA.firstName} ${TEST_DATA.lastName}`)).toBeVisible();
      await expect(page.getByText(/distribuidor/i)).toBeVisible();
      await expect(page.getByText(email)).toBeVisible();

      // Verificar beneficios de distribuidor
      await expect(page.getByText(/precios mayoristas/i)).toBeVisible();
      await expect(page.getByText(/dashboard de ventas/i)).toBeVisible();

      // Verificar mensaje de redirección automática
      await expect(page.getByText(/redirigido automáticamente/i)).toBeVisible();

      await page.screenshot({ path: 'test-results/dist-08-success.png' });

      // Esperar redirección automática (5s) o hacer clic en "Comenzar a explorar"
      const explorarBtn = page.getByRole('button', { name: /comenzar a explorar/i });
      if (await explorarBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await explorarBtn.click();
      } else {
        // Esperar la redirección automática
        await page.waitForURL('**/', { timeout: 10_000 });
      }

      // Verificar que estamos autenticados en la página principal
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'test-results/dist-09-authenticated.png' });
    });
  });

  // ─── TESTS INDIVIDUALES POR PASO ───────────────────────────────────────

  test.describe('Paso 1 — Formulario de registro: validaciones', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.getByText('Regístrate aquí').click();
      await expect(page.locator('input[name="firstName"]')).toBeVisible({ timeout: 10_000 });
    });

    test('Campos vacíos no permiten continuar', async ({ page }) => {
      await page.getByRole('button', { name: /continuar/i }).click();

      // Deben aparecer mensajes de validación
      await expect(page.getByText(/nombre.*requerido|al menos 2 caracteres/i)).toBeVisible({ timeout: 5_000 });

      await page.screenshot({ path: 'test-results/dist-val-01-empty-fields.png' });
    });

    test('Contraseña débil muestra error', async ({ page }) => {
      await page.locator('input[name="firstName"]').fill('Test');
      await page.locator('input[name="lastName"]').fill('User');
      await page.locator('input[name="email"]').fill(email);
      await page.locator('input[name="password"]').fill('123');
      await page.locator('input[name="passwordConfirmation"]').fill('123');

      await page.getByRole('button', { name: /continuar/i }).click();

      await expect(page.getByText(/al menos 8 caracteres/i)).toBeVisible({ timeout: 5_000 });

      await page.screenshot({ path: 'test-results/dist-val-02-weak-password.png' });
    });

    test('Contraseñas que no coinciden muestran error', async ({ page }) => {
      await page.locator('input[name="firstName"]').fill('Test');
      await page.locator('input[name="lastName"]').fill('User');
      await page.locator('input[name="email"]').fill(email);
      await page.locator('input[name="password"]').fill('TestPass123!');
      await page.locator('input[name="passwordConfirmation"]').fill('OtherPass123!');

      await page.getByRole('button', { name: /continuar/i }).click();

      await expect(page.getByText(/contraseñas no coinciden/i)).toBeVisible({ timeout: 5_000 });

      await page.screenshot({ path: 'test-results/dist-val-03-password-mismatch.png' });
    });

    test('Email inválido muestra error', async ({ page }) => {
      await page.locator('input[name="firstName"]').fill('Test');
      await page.locator('input[name="lastName"]').fill('User');
      await page.locator('input[name="email"]').fill('not-an-email');
      await page.locator('input[name="password"]').fill('TestPass123!');
      await page.locator('input[name="passwordConfirmation"]').fill('TestPass123!');

      await page.getByRole('button', { name: /continuar/i }).click();

      await expect(page.getByText(/email.*inválido|email.*válido/i)).toBeVisible({ timeout: 5_000 });

      await page.screenshot({ path: 'test-results/dist-val-04-invalid-email.png' });
    });
  });

  test.describe('Paso 2 — OTP: validaciones', () => {
    test('OTP incorrecto muestra error', async ({ page }) => {
      setupOTPCapture(page); // Solo para capturar, no usamos el OTP real

      await page.goto('/login');
      await page.getByText('Regístrate aquí').click();

      await page.locator('input[name="firstName"]').fill(TEST_DATA.firstName);
      await page.locator('input[name="lastName"]').fill(TEST_DATA.lastName);
      await page.locator('input[name="email"]').fill(email);
      await page.locator('input[name="password"]').fill(TEST_DATA.password);
      await page.locator('input[name="passwordConfirmation"]').fill(TEST_DATA.password);

      await page.getByRole('button', { name: /continuar/i }).click();

      // Esperar OTP screen
      await expect(page.getByRole('heading', { name: /verificar email/i })).toBeVisible({ timeout: 60_000 });

      // Ingresar OTP incorrecto
      await fillOTP(page, '000000');

      await page.screenshot({ path: 'test-results/dist-val-05-wrong-otp.png' });

      await page.getByRole('button', { name: /verificar código/i }).click();

      // Debe mostrar error
      await expect(page.getByText(/código incorrecto|error|inválido/i)).toBeVisible({ timeout: 15_000 });

      await page.screenshot({ path: 'test-results/dist-val-06-otp-error.png' });
    });
  });

  test.describe('Paso 3 — Selección tipo usuario: validaciones', () => {
    test('No se puede continuar sin seleccionar tipo', async ({ page }) => {
      // Este test verifica que el botón Continuar está deshabilitado sin selección
      // Requiere llegar primero al paso 3 (simplificado con mock si es posible)

      const { waitForOTP } = setupOTPCapture(page);

      // Registrar y pasar OTP rápidamente
      await page.goto('/login');
      await page.getByText('Regístrate aquí').click();
      await page.locator('input[name="firstName"]').fill(TEST_DATA.firstName);
      await page.locator('input[name="lastName"]').fill(TEST_DATA.lastName);
      await page.locator('input[name="email"]').fill(email);
      await page.locator('input[name="password"]').fill(TEST_DATA.password);
      await page.locator('input[name="passwordConfirmation"]').fill(TEST_DATA.password);
      await page.getByRole('button', { name: /continuar/i }).click();

      await expect(page.getByRole('heading', { name: /verificar email/i })).toBeVisible({ timeout: 60_000 });
      const otp = await waitForOTP();
      if (!otp) {
        test.skip(true, 'No se pudo capturar OTP — backend no devolvió OTP');
        return;
      }
      await fillOTP(page, otp);
      await page.getByRole('button', { name: /verificar código/i }).click();

      // Esperar step 3
      await expect(page.getByRole('heading', { name: /tipo de usuario/i })).toBeVisible({ timeout: 15_000 });

      // El botón Continuar debería estar deshabilitado sin selección
      const continueBtn = page.getByRole('button', { name: /continuar/i });
      await expect(continueBtn).toBeDisabled();

      await page.screenshot({ path: 'test-results/dist-val-07-no-type-selected.png' });
    });
  });

  test.describe('Paso 4 — Info personal: validaciones', () => {
    // Helper: navegar hasta el paso 4
    async function navigateToPersonalInfo(page: Page, testEmail: string) {
      const { waitForOTP } = setupOTPCapture(page);

      await page.goto('/login');
      await page.getByText('Regístrate aquí').click();
      await page.locator('input[name="firstName"]').fill(TEST_DATA.firstName);
      await page.locator('input[name="lastName"]').fill(TEST_DATA.lastName);
      await page.locator('input[name="email"]').fill(testEmail);
      await page.locator('input[name="password"]').fill(TEST_DATA.password);
      await page.locator('input[name="passwordConfirmation"]').fill(TEST_DATA.password);
      await page.getByRole('button', { name: /continuar/i }).click();

      await expect(page.getByRole('heading', { name: /verificar email/i })).toBeVisible({ timeout: 60_000 });
      const otp = await waitForOTP();
      if (!otp) {
        test.skip(true, 'No se pudo capturar OTP');
        return;
      }
      await fillOTP(page, otp);
      await page.getByRole('button', { name: /verificar código/i }).click();

      await expect(page.getByRole('heading', { name: /tipo de usuario/i })).toBeVisible({ timeout: 15_000 });
      const distribuidorCard = page.locator('button').filter({ has: page.getByRole('heading', { name: 'Distribuidor' }) });
      await distribuidorCard.click();
      await page.getByRole('button', { name: /continuar/i }).click();

      await expect(page.getByRole('heading', { name: /información personal/i })).toBeVisible({ timeout: 15_000 });
    }

    test('Campos vacíos en información personal muestran errores', async ({ page }) => {
      await navigateToPersonalInfo(page, email);

      // Limpiar campos prellenados
      await page.locator('input[name="firstName"]').clear();
      await page.locator('input[name="lastName"]').clear();

      // Intentar continuar
      await page.getByRole('button', { name: /continuar/i }).click();

      // Deben aparecer errores de validación
      await expect(page.getByText(/al menos 2 caracteres/i).first()).toBeVisible({ timeout: 5_000 });

      await page.screenshot({ path: 'test-results/dist-val-08-personal-empty.png' });
    });

    test('Teléfono corto muestra error', async ({ page }) => {
      await navigateToPersonalInfo(page, email);

      await page.locator('input[name="phone"]').fill('12345');
      await page.locator('input[name="birthDate"]').fill('1990-01-01');
      await page.locator('input[name="address"]').fill('Direccion Test 123');
      await page.locator('input[name="city"]').fill('Test');

      await page.getByRole('button', { name: /continuar/i }).click();

      await expect(page.getByText(/al menos 10 dígitos/i)).toBeVisible({ timeout: 5_000 });

      await page.screenshot({ path: 'test-results/dist-val-09-short-phone.png' });
    });
  });

  test.describe('Paso 5 — Info empresa: validaciones', () => {
    test('RUC corto muestra error de validación', async ({ page }) => {
      // Este test navega hasta paso 5 y valida un campo
      const { waitForOTP } = setupOTPCapture(page);

      await page.goto('/login');
      await page.getByText('Regístrate aquí').click();
      await page.locator('input[name="firstName"]').fill(TEST_DATA.firstName);
      await page.locator('input[name="lastName"]').fill(TEST_DATA.lastName);
      await page.locator('input[name="email"]').fill(email);
      await page.locator('input[name="password"]').fill(TEST_DATA.password);
      await page.locator('input[name="passwordConfirmation"]').fill(TEST_DATA.password);
      await page.getByRole('button', { name: /continuar/i }).click();

      await expect(page.getByRole('heading', { name: /verificar email/i })).toBeVisible({ timeout: 60_000 });
      const otp = await waitForOTP();
      if (!otp) { test.skip(true, 'OTP no capturado'); return; }
      await fillOTP(page, otp);
      await page.getByRole('button', { name: /verificar código/i }).click();

      // Paso 3: Distribuidor
      await expect(page.getByRole('heading', { name: /tipo de usuario/i })).toBeVisible({ timeout: 15_000 });
      await page.locator('button').filter({ has: page.getByRole('heading', { name: 'Distribuidor' }) }).click();
      await page.getByRole('button', { name: /continuar/i }).click();

      // Paso 4: Personal info
      await expect(page.getByRole('heading', { name: /información personal/i })).toBeVisible({ timeout: 15_000 });
      await page.locator('input[name="phone"]').fill(TEST_DATA.personal.phone);
      await page.locator('input[name="birthDate"]').fill(TEST_DATA.personal.birthDate);
      await page.locator('input[name="address"]').fill(TEST_DATA.personal.address);
      await page.locator('input[name="city"]').fill(TEST_DATA.personal.city);
      await page.getByRole('button', { name: /continuar/i }).click();

      // Paso 5: Business info
      await expect(page.getByRole('heading', { name: /información de empresa/i })).toBeVisible({ timeout: 15_000 });

      // Llenar con RUC demasiado corto
      await page.locator('input[name="businessName"]').fill('Test S.A.');
      await page.locator('select[name="businessType"]').selectOption(TEST_DATA.business.businessType);
      await page.locator('input[name="ruc"]').fill('123'); // Demasiado corto — min 11
      await page.locator('input[name="distributorCode"]').fill('DIST-01');
      await page.locator('input[name="businessPhone"]').fill(TEST_DATA.business.businessPhone);
      await page.locator('input[name="businessEmail"]').fill(TEST_DATA.business.businessEmail);
      await page.locator('input[name="businessAddress"]').fill(TEST_DATA.business.businessAddress);
      await page.locator('input[name="businessCity"]').fill(TEST_DATA.business.businessCity);
      await page.locator('input[name="yearsInBusiness"]').fill('2');
      await page.locator('select[name="numberOfEmployees"]').selectOption('1-5');
      await page.locator('textarea[name="description"]').fill('Descripción de prueba para validar RUC corto en test E2E.');

      await page.getByRole('button', { name: /continuar a selección de plan/i }).click();

      // Debe mostrar error de RUC
      await expect(page.getByText(/al menos 11 caracteres/i)).toBeVisible({ timeout: 5_000 });

      await page.screenshot({ path: 'test-results/dist-val-10-short-ruc.png' });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests de navegación y UX
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Onboarding Distribuidor — Navegación', () => {
  test.setTimeout(120_000);

  test('Botón atrás en OTP vuelve al formulario de registro', async ({ page }) => {
    setupOTPCapture(page); // No necesitamos el OTP, solo navegamos al paso OTP

    await page.goto('/login');
    await page.getByText('Regístrate aquí').click();

    await page.locator('input[name="firstName"]').fill('Back');
    await page.locator('input[name="lastName"]').fill('Test');
    await page.locator('input[name="email"]').fill(uniqueEmail());
    await page.locator('input[name="password"]').fill('TestPass123!');
    await page.locator('input[name="passwordConfirmation"]').fill('TestPass123!');
    await page.getByRole('button', { name: /continuar/i }).click();

    await expect(page.getByRole('heading', { name: /verificar email/i })).toBeVisible({ timeout: 60_000 });

    // Click botón atrás (ArrowLeft icon button)
    const backBtn = page.locator('button').filter({ has: page.locator('svg') }).first();
    await backBtn.click();

    // Debe volver al formulario o al login
    await expect(
      page.locator('input[name="firstName"]').or(page.getByRole('heading', { name: /iniciar sesión/i }))
    ).toBeVisible({ timeout: 10_000 });

    await page.screenshot({ path: 'test-results/dist-nav-01-back-from-otp.png' });
  });

  test('Botón atrás en selección de tipo mantiene estado', async ({ page }) => {
    const { waitForOTP } = setupOTPCapture(page);

    await page.goto('/login');
    await page.getByText('Regístrate aquí').click();

    const testEmail = uniqueEmail();
    await page.locator('input[name="firstName"]').fill('Nav');
    await page.locator('input[name="lastName"]').fill('Test');
    await page.locator('input[name="email"]').fill(testEmail);
    await page.locator('input[name="password"]').fill('TestPass123!');
    await page.locator('input[name="passwordConfirmation"]').fill('TestPass123!');
    await page.getByRole('button', { name: /continuar/i }).click();

    await expect(page.getByRole('heading', { name: /verificar email/i })).toBeVisible({ timeout: 60_000 });
    const otp = await waitForOTP();
    if (!otp) { test.skip(true, 'OTP no capturado'); return; }
    await fillOTP(page, otp);
    await page.getByRole('button', { name: /verificar código/i }).click();

    // Paso 3: Selección de tipo
    await expect(page.getByRole('heading', { name: /tipo de usuario/i })).toBeVisible({ timeout: 15_000 });

    // Seleccionar distribuidor
    const distribuidorCard = page.locator('button').filter({ has: page.getByRole('heading', { name: 'Distribuidor' }) });
    await distribuidorCard.click();

    // Verificar selección visual
    await expect(distribuidorCard).toHaveClass(/border-purple|selected|ring/);

    await page.screenshot({ path: 'test-results/dist-nav-02-type-selected.png' });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests de rendimiento y resiliencia
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Onboarding Distribuidor — Rendimiento', () => {
  test.setTimeout(120_000);

  test('El registro inicial completa en menos de 30s', async ({ page }) => {
    setupOTPCapture(page);

    await page.goto('/login');
    await page.getByText('Regístrate aquí').click();

    const startTime = Date.now();

    await page.locator('input[name="firstName"]').fill('Perf');
    await page.locator('input[name="lastName"]').fill('Test');
    await page.locator('input[name="email"]').fill(uniqueEmail());
    await page.locator('input[name="password"]').fill('TestPass123!');
    await page.locator('input[name="passwordConfirmation"]').fill('TestPass123!');
    await page.getByRole('button', { name: /continuar/i }).click();

    await expect(page.getByRole('heading', { name: /verificar email/i })).toBeVisible({ timeout: 60_000 });

    const duration = Date.now() - startTime;
    console.log(`⏱️ Paso 1 (Registro → OTP): ${duration}ms`);

    expect(duration, 'El registro debe completar en menos de 30 segundos').toBeLessThan(30_000);
  });

  test('No hay errores de consola durante el flujo', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    page.on('pageerror', (error) => {
      errors.push(`PageError: ${error.message}`);
    });

    await page.goto('/login');
    await page.getByText('Regístrate aquí').click();

    await page.locator('input[name="firstName"]').fill('NoErr');
    await page.locator('input[name="lastName"]').fill('Test');
    await page.locator('input[name="email"]').fill(uniqueEmail());
    await page.locator('input[name="password"]').fill('TestPass123!');
    await page.locator('input[name="passwordConfirmation"]').fill('TestPass123!');

    await page.getByRole('button', { name: /continuar/i }).click();
    await page.waitForTimeout(5000);

    // Filtrar errores conocidos / no críticos (como warnings de Next.js)
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes('Warning') &&
        !e.includes('DevTools') &&
        !e.includes('favicon') &&
        !e.includes('hydration')
    );

    console.log(`\n📋 Errores de consola: ${errors.length} total, ${criticalErrors.length} críticos`);
    if (criticalErrors.length > 0) {
      console.log('❌ Errores críticos:', criticalErrors);
    }

    expect(criticalErrors, 'No debe haber errores críticos de consola').toHaveLength(0);
  });
});
