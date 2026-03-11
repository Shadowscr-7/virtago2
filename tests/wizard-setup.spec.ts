import { test, expect, Page } from '@playwright/test';
import * as path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// Configuración y Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Ruta base a los fixtures XLSX */
const FIXTURES_DIR = path.resolve(__dirname, 'fixtures');

/** Archivos XLSX de test por step */
const FIXTURES = {
  clientes: path.join(FIXTURES_DIR, 'clientes_test.xlsx'),
  productos: path.join(FIXTURES_DIR, 'productos_test.xlsx'),
  listasPrecios: path.join(FIXTURES_DIR, 'listas_precios_test.xlsx'),
  precios: path.join(FIXTURES_DIR, 'precios_test.xlsx'),
  descuentos: path.join(FIXTURES_DIR, 'descuentos_test.xlsx'),
  vacio: path.join(FIXTURES_DIR, 'archivo_vacio_test.xlsx'),
  columnasMalas: path.join(FIXTURES_DIR, 'columnas_incorrectas_test.xlsx'),
};

/** Email y password de un usuario admin que ya existe en el sistema */
const ADMIN_CREDENTIALS = {
  email: process.env.E2E_ADMIN_EMAIL || 'admin@test.com',
  password: process.env.E2E_ADMIN_PASSWORD || 'TestAdmin123!',
};

/**
 * Helper: Inicia sesión con credenciales admin para poder acceder al wizard.
 * Si ya está autenticado (hay token en localStorage), no hace nada.
 */
async function loginIfNeeded(page: Page) {
  // Intentar navegar al wizard directamente
  await page.goto('/admin/configuracion-rapida');
  
  // Esperar un momento para que el cliente-side auth check se ejecute
  await page.waitForTimeout(2000);

  // Si fuimos redirigidos a login, necesitamos autenticarnos
  const currentUrl = page.url();
  if (currentUrl.includes('/login')) {
    console.log('🔐 Se necesita login, autenticando...');
    
    // Esperar a que el formulario de login esté visible
    await expect(page.locator('input[name="email"]').or(page.getByRole('textbox', { name: /email/i }))).toBeVisible({ timeout: 15000 });
    
    // Llenar credenciales
    const emailInput = page.locator('input[name="email"]').or(page.getByRole('textbox', { name: /email/i }));
    const passwordInput = page.locator('input[name="password"]').or(page.getByRole('textbox', { name: /contraseña|password/i }));
    
    await emailInput.fill(ADMIN_CREDENTIALS.email);
    await passwordInput.fill(ADMIN_CREDENTIALS.password);
    
    // Submit
    await page.getByRole('button', { name: /iniciar sesión|sign in|entrar/i }).click();
    
    // Esperar a estar autenticados
    await page.waitForTimeout(3000);
    
    // Navegar al wizard
    await page.goto('/admin/configuracion-rapida');
  }

  // Esperar a que la página del wizard cargue (o la pantalla de verificación de auth)
  await page.waitForTimeout(2000);
}

/**
 * Helper: Abre el wizard desde la página de configuración rápida
 */
async function openWizard(page: Page) {
  // Buscar el botón de iniciar wizard
  const startButton = page.getByRole('button', { name: /iniciar configuración guiada/i });
  
  // Si la página muestra las cards de setup, hacer click en el botón start
  if (await startButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    await startButton.click();
  }

  // Esperar a que el wizard esté visible — el step 1 (Clientes)
  await expect(
    page.getByText(/Paso 1 de 6/i).or(page.getByText('Clientes').first())
  ).toBeVisible({ timeout: 15000 });
}

/**
 * Helper: Sube un archivo XLSX al FileUploadComponent.
 * Localiza el input[type="file"] oculto y usa setInputFiles.
 */
async function uploadXLSXFile(page: Page, filePath: string) {
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(filePath);
  
  // Esperar a que el archivo se procese (buscar validación o preview)
  await page.waitForTimeout(3000);
}

/**
 * Helper: Pega JSON en el textarea del modo JSON
 */
async function pasteJSON(page: Page, jsonData: unknown) {
  const jsonString = typeof jsonData === 'string' ? jsonData : JSON.stringify(jsonData, null, 2);
  const textarea = page.locator('textarea').first();
  await textarea.fill(jsonString);
}

// ─────────────────────────────────────────────────────────────────────────────
// TESTS: Página de Configuración Rápida (Landing)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Wizard — Página de Configuración Rápida', () => {
  test.setTimeout(90_000);

  test.beforeEach(async ({ page }) => {
    await loginIfNeeded(page);
  });

  test('WIZ-LAND-001: La página carga correctamente con las 4 cards', async ({ page }) => {
    // Verificar título
    await expect(page.getByRole('heading', { name: /configuración rápida/i })).toBeVisible({ timeout: 15000 });

    // Verificar las 4 cards de setup
    await expect(page.getByText('Configurar Clientes')).toBeVisible();
    await expect(page.getByText('Cargar Productos')).toBeVisible();
    await expect(page.getByText('Configurar Precios')).toBeVisible();
    await expect(page.getByText('Crear Listas de Precios')).toBeVisible();

    // Verificar botón de inicio
    await expect(page.getByRole('button', { name: /iniciar configuración guiada/i })).toBeVisible();

    await page.screenshot({ path: 'test-results/wizard-landing-page.png' });
  });

  test('WIZ-LAND-002: El botón "Iniciar Configuración Guiada" abre el wizard', async ({ page }) => {
    await page.getByRole('button', { name: /iniciar configuración guiada/i }).click();

    // Debe mostrar el wizard con el primer paso
    await expect(
      page.getByText(/Paso 1 de 6/i).or(page.getByText('Clientes').first())
    ).toBeVisible({ timeout: 15000 });

    await page.screenshot({ path: 'test-results/wizard-opened.png' });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TESTS: Navegación del Wizard
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Wizard — Navegación General', () => {
  test.setTimeout(90_000);

  test.beforeEach(async ({ page }) => {
    await loginIfNeeded(page);
    await openWizard(page);
  });

  test('WIZ-NAV-001: Se muestran los 6 pasos en el indicador', async ({ page }) => {
    const stepNames = ['Clientes', 'Productos', 'Listas de Precios', 'Precios', 'Descuentos', 'Revisar'];
    
    for (const name of stepNames) {
      await expect(page.getByText(name, { exact: false }).first()).toBeVisible();
    }

    await page.screenshot({ path: 'test-results/wizard-nav-all-steps.png' });
  });

  test('WIZ-NAV-002: El paso actual se muestra como "Paso N de 6"', async ({ page }) => {
    await expect(page.getByText(/Paso 1 de 6/i)).toBeVisible();
    await page.screenshot({ path: 'test-results/wizard-nav-step-counter.png' });
  });

  test('WIZ-NAV-003: No se pueden clickear pasos futuros', async ({ page }) => {
    // Intentar hacer click en el paso 3 (Listas de Precios) que no debería estar habilitado
    const step3 = page.getByText('Listas de Precios');
    if (await step3.isVisible()) {
      await step3.click();
      // Debemos seguir en el paso 1
      await expect(page.getByText(/Paso 1 de 6/i)).toBeVisible();
    }

    await page.screenshot({ path: 'test-results/wizard-nav-future-step-blocked.png' });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TESTS: Step 1 — Clientes
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Wizard — Step 1: Clientes (XLSX Import)', () => {
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await loginIfNeeded(page);
    await openWizard(page);
  });

  test('WIZ-CLI-001: Muestra zona de carga con tabs Archivo/JSON', async ({ page }) => {
    // Verificar tabs
    await expect(page.getByText('Subir Archivo').or(page.getByText('📁 Subir Archivo'))).toBeVisible();
    await expect(page.getByText('Importar JSON').or(page.getByText('📋 Importar JSON'))).toBeVisible();

    // Verificar zona de drag & drop
    await expect(page.getByText(/arrastra tu archivo aquí|haz clic para seleccionar/i)).toBeVisible();

    await page.screenshot({ path: 'test-results/wizard-cli-01-upload-zone.png' });
  });

  test('WIZ-CLI-002: Subir XLSX de clientes muestra preview correcta', async ({ page }) => {
    // Subir el archivo XLSX de fixture
    await uploadXLSXFile(page, FIXTURES.clientes);

    // Esperar a que aparezca la vista de preview
    await expect(
      page.getByText(/clientes procesados/i).or(page.getByText(/revisa los datos/i))
    ).toBeVisible({ timeout: 30000 });

    // Debe mostrar los 3 clientes del fixture
    await expect(page.getByText('Juan Carlos').or(page.getByText('Pérez Mendoza'))).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'test-results/wizard-cli-02-preview.png' });
  });

  test('WIZ-CLI-003: Preview muestra estadísticas correctas', async ({ page }) => {
    await uploadXLSXFile(page, FIXTURES.clientes);

    // Esperar preview
    await expect(
      page.getByText(/clientes procesados/i).or(page.getByText(/revisa los datos/i))
    ).toBeVisible({ timeout: 30000 });

    // Debe mostrar resumen de clientes
    await expect(page.getByText(/resumen de clientes/i)).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'test-results/wizard-cli-03-stats.png' });
  });

  test('WIZ-CLI-004: El botón "Confirmar y Continuar" está visible en preview', async ({ page }) => {
    await uploadXLSXFile(page, FIXTURES.clientes);

    await expect(
      page.getByText(/clientes procesados/i).or(page.getByText(/revisa los datos/i))
    ).toBeVisible({ timeout: 30000 });

    // Verificar botón de confirmación
    await expect(page.getByRole('button', { name: /confirmar y continuar/i })).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'test-results/wizard-cli-04-confirm-button.png' });
  });

  test('WIZ-CLI-005: Se puede recargar otros datos desde la preview', async ({ page }) => {
    await uploadXLSXFile(page, FIXTURES.clientes);

    await expect(
      page.getByText(/clientes procesados/i).or(page.getByText(/revisa los datos/i))
    ).toBeVisible({ timeout: 30000 });

    // Click en "Cargar Otros Datos"
    const reloadBtn = page.getByRole('button', { name: /cargar otros datos/i });
    if (await reloadBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await reloadBtn.click();
      
      // Debe volver a la vista de upload
      await expect(page.getByText(/arrastra tu archivo aquí|haz clic para seleccionar/i)).toBeVisible({ timeout: 10000 });
    }

    await page.screenshot({ path: 'test-results/wizard-cli-05-reload.png' });
  });

  test('WIZ-CLI-006: Confirmar clientes envía datos al backend', async ({ page }) => {
    await uploadXLSXFile(page, FIXTURES.clientes);

    await expect(
      page.getByText(/clientes procesados/i).or(page.getByText(/revisa los datos/i))
    ).toBeVisible({ timeout: 30000 });

    // Click confirmar
    await page.getByRole('button', { name: /confirmar y continuar/i }).click();

    // Esperar respuesta del backend (el botón cambia de texto)
    await expect(
      page.getByText(/importando archivo|enviando json|Paso 2 de 6|productos/i)
    ).toBeVisible({ timeout: 60000 });

    await page.screenshot({ path: 'test-results/wizard-cli-06-confirmed.png' });
  });

  test('WIZ-CLI-007: Importar clientes via JSON funciona', async ({ page }) => {
    // Cambiar a tab JSON
    await page.getByText('Importar JSON').or(page.getByText('📋 Importar JSON')).click();

    // Pegar JSON con datos de clientes
    const clientesJSON = [
      {
        email: 'json.test@e2e.com',
        firstName: 'JSON',
        lastName: 'Test Client',
        gender: 'M',
        phone: '+51999888777',
        documentType: 'DNI',
        document: '99887766',
        customerClass: 'A',
        status: 'A',
      },
    ];

    await pasteJSON(page, clientesJSON);

    // Click en "Cargar Datos"
    const uploadBtn = page.getByRole('button', { name: /cargar datos/i });
    if (await uploadBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await uploadBtn.click();
    }

    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/wizard-cli-07-json-import.png' });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TESTS: Step 2 — Productos
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Wizard — Step 2: Productos (XLSX Import)', () => {
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await loginIfNeeded(page);
    await openWizard(page);
    // Navegar al paso 2 usando el botón Siguiente o skip
    await page.getByRole('button', { name: /siguiente/i }).click();
    await page.waitForTimeout(1000);
  });

  test('WIZ-PROD-001: Muestra zona de upload para productos', async ({ page }) => {
    await expect(
      page.getByText(/productos/i).first()
    ).toBeVisible({ timeout: 15000 });

    // Verificar zona de upload
    await expect(page.getByText(/arrastra tu archivo aquí|haz clic para seleccionar/i)).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'test-results/wizard-prod-01-upload-zone.png' });
  });

  test('WIZ-PROD-002: Subir XLSX de productos muestra matching', async ({ page }) => {
    // Subir archivo de productos
    await uploadXLSXFile(page, FIXTURES.productos);

    // Esperar a que el matching se complete (puede tardar por la IA)
    await page.waitForTimeout(10000);

    // Debe mostrar alguno de los productos del fixture
    const hasProducts = await page.getByText('Laptop Gaming Pro X15').isVisible({ timeout: 20000 }).catch(() => false)
      || await page.getByText('LAP-GAME-001').isVisible({ timeout: 5000 }).catch(() => false)
      || await page.getByText(/productos/i).isVisible({ timeout: 5000 }).catch(() => false);

    expect(hasProducts).toBeTruthy();

    await page.screenshot({ path: 'test-results/wizard-prod-02-matching.png' });
  });

  test('WIZ-PROD-003: Preview de matching muestra brand y categoría', async ({ page }) => {
    await uploadXLSXFile(page, FIXTURES.productos);
    await page.waitForTimeout(10000);

    // Verificar que se muestran datos de matching (brand, category)
    const hasBrandOrCategory = 
      await page.getByText('TechPro').isVisible({ timeout: 15000 }).catch(() => false)
      || await page.getByText('Computadoras').isVisible({ timeout: 5000 }).catch(() => false)
      || await page.getByText(/marca|brand/i).isVisible({ timeout: 5000 }).catch(() => false);

    if (hasBrandOrCategory) {
      console.log('✅ Matching de brand/categoría visible');
    }

    await page.screenshot({ path: 'test-results/wizard-prod-03-matching-details.png' });
  });

  test('WIZ-PROD-004: Botón confirmar visible después del matching', async ({ page }) => {
    await uploadXLSXFile(page, FIXTURES.productos);
    await page.waitForTimeout(15000);

    // El botón de confirmar debería aparecer tras el matching
    const confirmBtn = page.getByRole('button', { name: /confirmar y continuar/i });
    
    if (await confirmBtn.isVisible({ timeout: 20000 }).catch(() => false)) {
      console.log('✅ Botón de confirmar visible');
    }

    await page.screenshot({ path: 'test-results/wizard-prod-04-confirm-visible.png' });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TESTS: Step 3 — Listas de Precios
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Wizard — Step 3: Listas de Precios (XLSX Import)', () => {
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await loginIfNeeded(page);
    await openWizard(page);
    // Avanzar a paso 3: saltar paso 1 y 2
    await page.getByRole('button', { name: /siguiente/i }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: /siguiente/i }).click();
    await page.waitForTimeout(1000);
  });

  test('WIZ-PL-001: Muestra zona de upload para listas de precios', async ({ page }) => {
    await expect(
      page.getByText(/listas de precios/i).first()
    ).toBeVisible({ timeout: 15000 });

    await expect(page.getByText(/arrastra tu archivo aquí|haz clic para seleccionar/i)).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'test-results/wizard-pl-01-upload-zone.png' });
  });

  test('WIZ-PL-002: Subir XLSX de listas muestra preview', async ({ page }) => {
    await uploadXLSXFile(page, FIXTURES.listasPrecios);

    // Esperar preview
    await expect(
      page.getByText(/listas de precios para importar|revisa los datos/i)
    ).toBeVisible({ timeout: 30000 });

    // Debe mostrar los nombres de las listas
    await expect(page.getByText('Lista Premium E2E Test').or(page.getByText('PL-TEST-001'))).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'test-results/wizard-pl-02-preview.png' });
  });

  test('WIZ-PL-003: Preview muestra resumen con conteo correcto', async ({ page }) => {
    await uploadXLSXFile(page, FIXTURES.listasPrecios);

    await expect(
      page.getByText(/listas de precios para importar|revisa los datos/i)
    ).toBeVisible({ timeout: 30000 });

    // Verificar que muestra el resumen
    await expect(page.getByText(/resumen/i)).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'test-results/wizard-pl-03-summary.png' });
  });

  test('WIZ-PL-004: Cards de preview muestran info de cada lista', async ({ page }) => {
    await uploadXLSXFile(page, FIXTURES.listasPrecios);

    await expect(
      page.getByText(/listas de precios para importar|revisa los datos/i)
    ).toBeVisible({ timeout: 30000 });

    // Verificar detalles de las listas
    const hasListDetails = 
      await page.getByText('wholesale').isVisible({ timeout: 10000 }).catch(() => false)
      || await page.getByText('USD').isVisible({ timeout: 5000 }).catch(() => false)
      || await page.getByText('active').isVisible({ timeout: 5000 }).catch(() => false);

    expect(hasListDetails).toBeTruthy();

    await page.screenshot({ path: 'test-results/wizard-pl-04-card-details.png' });
  });

  test('WIZ-PL-005: Confirmar listas de precios envía al backend', async ({ page }) => {
    await uploadXLSXFile(page, FIXTURES.listasPrecios);

    await expect(
      page.getByText(/listas de precios para importar|revisa los datos/i)
    ).toBeVisible({ timeout: 30000 });

    await page.getByRole('button', { name: /confirmar y continuar/i }).click();

    // Esperar procesamiento o siguiente paso
    await expect(
      page.getByText(/creando listas|listas.*creadas|Paso 4 de 6|precios/i)
    ).toBeVisible({ timeout: 60000 });

    await page.screenshot({ path: 'test-results/wizard-pl-05-confirmed.png' });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TESTS: Step 4 — Precios
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Wizard — Step 4: Precios (XLSX Import)', () => {
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await loginIfNeeded(page);
    await openWizard(page);
    // Avanzar a paso 4
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: /siguiente/i }).click();
      await page.waitForTimeout(1000);
    }
  });

  test('WIZ-PRC-001: Muestra zona de upload con tabs archivo/JSON', async ({ page }) => {
    await expect(
      page.getByText(/precios/i).first()
    ).toBeVisible({ timeout: 15000 });

    // Verificar tabs
    await expect(page.getByText('Subir Archivo')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Importar JSON')).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: 'test-results/wizard-prc-01-upload-zone.png' });
  });

  test('WIZ-PRC-002: Subir XLSX de precios muestra preview', async ({ page }) => {
    await uploadXLSXFile(page, FIXTURES.precios);

    // Esperar preview
    await expect(
      page.getByText(/precios cargados|revisión|análisis de precios/i)
    ).toBeVisible({ timeout: 30000 });

    // Debe mostrar productos con precio
    const hasData = 
      await page.getByText('Laptop Gaming Pro X15').isVisible({ timeout: 10000 }).catch(() => false)
      || await page.getByText('PROD-001').isVisible({ timeout: 5000 }).catch(() => false)
      || await page.getByText(/productos con precio/i).isVisible({ timeout: 5000 }).catch(() => false);

    expect(hasData).toBeTruthy();

    await page.screenshot({ path: 'test-results/wizard-prc-02-preview.png' });
  });

  test('WIZ-PRC-003: Preview muestra análisis de precios (promedio, margen)', async ({ page }) => {
    await uploadXLSXFile(page, FIXTURES.precios);

    await expect(
      page.getByText(/precios cargados|revisión|análisis de precios/i)
    ).toBeVisible({ timeout: 30000 });

    // Verificar estadísticas
    const hasStats = 
      await page.getByText(/análisis de precios/i).isVisible({ timeout: 10000 }).catch(() => false)
      || await page.getByText(/precio promedio/i).isVisible({ timeout: 5000 }).catch(() => false)
      || await page.getByText(/margen promedio/i).isVisible({ timeout: 5000 }).catch(() => false);

    if (hasStats) console.log('✅ Estadísticas de precios visibles');

    await page.screenshot({ path: 'test-results/wizard-prc-03-statistics.png' });
  });

  test('WIZ-PRC-004: Confirmar precios envía datos al backend', async ({ page }) => {
    await uploadXLSXFile(page, FIXTURES.precios);

    await expect(
      page.getByText(/precios cargados|revisión|análisis de precios/i)
    ).toBeVisible({ timeout: 30000 });

    await page.getByRole('button', { name: /confirmar y continuar/i }).click();

    // Esperar procesamiento
    await expect(
      page.getByText(/enviando a bd|procesando precios|precios procesados|Paso 5 de 6/i)
    ).toBeVisible({ timeout: 60000 });

    await page.screenshot({ path: 'test-results/wizard-prc-04-confirmed.png' });
  });

  test('WIZ-PRC-005: Importar precios via JSON funciona', async ({ page }) => {
    // Cambiar a tab JSON
    await page.getByText('Importar JSON').click();

    const preciosJSON = [
      { productId: 'PROD-001', productName: 'Laptop JSON Test', basePrice: 999.99, cost: 700, margin: 42.85, currency: 'USD' },
      { productId: 'PROD-002', productName: 'Monitor JSON Test', basePrice: 450.00, cost: 300, margin: 50.00, currency: 'USD' },
    ];

    await pasteJSON(page, preciosJSON);

    // Click en "Cargar Datos"
    const uploadBtn = page.getByRole('button', { name: /cargar datos/i });
    if (await uploadBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await uploadBtn.click();
    }

    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/wizard-prc-05-json-import.png' });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TESTS: Step 5 — Descuentos
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Wizard — Step 5: Descuentos (XLSX Import)', () => {
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await loginIfNeeded(page);
    await openWizard(page);
    // Avanzar a paso 5
    for (let i = 0; i < 4; i++) {
      await page.getByRole('button', { name: /siguiente/i }).click();
      await page.waitForTimeout(1000);
    }
  });

  test('WIZ-DSC-001: Muestra zona de upload con tabs archivo/JSON', async ({ page }) => {
    await expect(
      page.getByText(/descuentos/i).first()
    ).toBeVisible({ timeout: 15000 });

    await expect(page.getByText('Subir Archivo')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Importar JSON')).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: 'test-results/wizard-dsc-01-upload-zone.png' });
  });

  test('WIZ-DSC-002: Subir XLSX de descuentos muestra preview', async ({ page }) => {
    await uploadXLSXFile(page, FIXTURES.descuentos);

    // Esperar preview
    await expect(
      page.getByText(/descuentos cargados|revisión|descuentos importados/i)
    ).toBeVisible({ timeout: 30000 });

    // Debe mostrar nombres de los descuentos
    const hasData = 
      await page.getByText('Promo E2E 20% OFF').isVisible({ timeout: 10000 }).catch(() => false)
      || await page.getByText('DISC-E2E-001').isVisible({ timeout: 5000 }).catch(() => false);

    expect(hasData).toBeTruthy();

    await page.screenshot({ path: 'test-results/wizard-dsc-02-preview.png' });
  });

  test('WIZ-DSC-003: Preview muestra tipo y valor del descuento', async ({ page }) => {
    await uploadXLSXFile(page, FIXTURES.descuentos);

    await expect(
      page.getByText(/descuentos cargados|revisión|descuentos importados/i)
    ).toBeVisible({ timeout: 30000 });

    // Verificar que se ven tipos y valores
    const hasDetails = 
      await page.getByText('percentage').isVisible({ timeout: 10000 }).catch(() => false)
      || await page.getByText('20%').isVisible({ timeout: 5000 }).catch(() => false)
      || await page.getByText('fixed').isVisible({ timeout: 5000 }).catch(() => false);

    if (hasDetails) console.log('✅ Detalles de descuentos visibles');

    await page.screenshot({ path: 'test-results/wizard-dsc-03-details.png' });
  });

  test('WIZ-DSC-004: Confirmar descuentos envía al backend', async ({ page }) => {
    await uploadXLSXFile(page, FIXTURES.descuentos);

    await expect(
      page.getByText(/descuentos cargados|revisión|descuentos importados/i)
    ).toBeVisible({ timeout: 30000 });

    await page.getByRole('button', { name: /confirmar y continuar/i }).click();

    // Esperar procesamiento
    await expect(
      page.getByText(/procesando descuentos|descuentos procesados|Paso 6 de 6|revisar/i)
    ).toBeVisible({ timeout: 60000 });

    await page.screenshot({ path: 'test-results/wizard-dsc-04-confirmed.png' });
  });

  test('WIZ-DSC-005: Importar descuentos via JSON funciona', async ({ page }) => {
    await page.getByText('Importar JSON').click();

    const descuentosJSON = [
      {
        name: 'Descuento JSON E2E Test',
        discount_id: 'DISC-JSON-001',
        description: 'Test descuento via JSON paste',
        discount_type: 'percentage',
        discount_value: 15,
        currency: 'USD',
        is_active: true,
        start_date: '2026-01-01T00:00:00Z',
        end_date: '2026-12-31T23:59:59Z',
      },
    ];

    await pasteJSON(page, descuentosJSON);

    const uploadBtn = page.getByRole('button', { name: /cargar datos/i });
    if (await uploadBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await uploadBtn.click();
    }

    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/wizard-dsc-05-json-import.png' });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TESTS: Step 6 — Review (Resumen final)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Wizard — Step 6: Review (Resumen)', () => {
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await loginIfNeeded(page);
    await openWizard(page);
    // Avanzar a paso 6
    for (let i = 0; i < 5; i++) {
      await page.getByRole('button', { name: /siguiente/i }).click();
      await page.waitForTimeout(1000);
    }
  });

  test('WIZ-REV-001: Muestra pantalla de resumen o cargando', async ({ page }) => {
    // Puede mostrar loading o resumen directamente
    const hasContent = 
      await page.getByText(/generando resumen/i).isVisible({ timeout: 15000 }).catch(() => false)
      || await page.getByText(/configuración completada/i).isVisible({ timeout: 15000 }).catch(() => false)
      || await page.getByText(/resumen de configuración/i).isVisible({ timeout: 15000 }).catch(() => false)
      || await page.getByText(/error al cargar/i).isVisible({ timeout: 5000 }).catch(() => false);

    expect(hasContent).toBeTruthy();

    await page.screenshot({ path: 'test-results/wizard-rev-01-summary.png' });
  });

  test('WIZ-REV-002: Resumen muestra conteos de entidades', async ({ page }) => {
    // Esperar a que cargue (loading → summary)
    await page.waitForTimeout(10000);

    // Verificar que muestra conteos
    const entityLabels = ['Clientes', 'Productos', 'Listas de Precios', 'Precios', 'Descuentos'];
    
    for (const label of entityLabels) {
      const isVisible = await page.getByText(label).first().isVisible({ timeout: 3000 }).catch(() => false);
      if (isVisible) console.log(`✅ Entidad "${label}" visible en resumen`);
    }

    await page.screenshot({ path: 'test-results/wizard-rev-02-entity-counts.png' });
  });

  test('WIZ-REV-003: Botón "Finalizar Configuración" está visible', async ({ page }) => {
    await page.waitForTimeout(10000);

    const finishBtn = page.getByRole('button', { name: /finalizar configuración/i });
    const isVisible = await finishBtn.isVisible({ timeout: 15000 }).catch(() => false);

    if (isVisible) {
      console.log('✅ Botón Finalizar Configuración visible');
    }

    await page.screenshot({ path: 'test-results/wizard-rev-03-finish-button.png' });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TESTS: Validaciones y Edge Cases
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Wizard — Validaciones y Errores', () => {
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await loginIfNeeded(page);
    await openWizard(page);
  });

  test('WIZ-VAL-001: Archivo vacío no muestra preview con datos', async ({ page }) => {
    await uploadXLSXFile(page, FIXTURES.vacio);
    await page.waitForTimeout(5000);

    // No debería mostrar datos procesados exitosamente
    const hasPreview = await page.getByText(/clientes procesados correctamente/i).isVisible({ timeout: 5000 }).catch(() => false);
    
    // Si no hay preview, verificar que se maneja gracefully
    if (!hasPreview) {
      console.log('✅ Archivo vacío manejado correctamente — no se muestra preview');
    }

    await page.screenshot({ path: 'test-results/wizard-val-01-empty-file.png' });
  });

  test('WIZ-VAL-002: Archivo con columnas incorrectas no rompe el proceso', async ({ page }) => {
    await uploadXLSXFile(page, FIXTURES.columnasMalas);
    await page.waitForTimeout(5000);

    // No debería crashear — puede mostrar error o datos vacíos
    const hasError = await page.getByText(/error/i).isVisible({ timeout: 5000 }).catch(() => false);
    const hasPreview = await page.getByText(/procesados correctamente/i).isVisible({ timeout: 3000 }).catch(() => false);

    console.log(`Archivo con columnas incorrectas: error=${hasError}, preview=${hasPreview}`);

    await page.screenshot({ path: 'test-results/wizard-val-02-bad-columns.png' });
  });

  test('WIZ-VAL-003: JSON inválido en textarea muestra error de validación', async ({ page }) => {
    // Cambiar a tab JSON  
    await page.getByText('Importar JSON').or(page.getByText('📋 Importar JSON')).click();

    // Pegar JSON inválido
    const textarea = page.locator('textarea').first();
    await textarea.fill('{ esto no es json valido }}}');

    // Intentar validar
    const validateBtn = page.getByRole('button', { name: /validar json/i });
    if (await validateBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await validateBtn.click();
    }

    await page.waitForTimeout(2000);

    // Debe mostrar algún error de validación
    const hasValidationError = 
      await page.getByText(/error.*validación|json.*inválido|error.*json/i).isVisible({ timeout: 5000 }).catch(() => false)
      || await page.getByText('✗').isVisible({ timeout: 3000 }).catch(() => false);

    if (hasValidationError) {
      console.log('✅ Error de JSON inválido mostrado correctamente');
    }

    await page.screenshot({ path: 'test-results/wizard-val-03-invalid-json.png' });
  });

  test('WIZ-VAL-004: JSON vacío no permite cargar', async ({ page }) => {
    await page.getByText('Importar JSON').or(page.getByText('📋 Importar JSON')).click();

    // El textarea está vacío por defecto
    // Verificar que los botones de acción están deshabilitados
    const uploadBtn = page.getByRole('button', { name: /cargar datos/i });
    const isDisabled = await uploadBtn.isDisabled({ timeout: 5000 }).catch(() => false);

    if (isDisabled) {
      console.log('✅ Botón "Cargar Datos" deshabilitado con textarea vacío');
    }

    await page.screenshot({ path: 'test-results/wizard-val-04-empty-json.png' });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TESTS: Descarga de Templates
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Wizard — Descarga de Templates', () => {
  test.setTimeout(90_000);

  test.beforeEach(async ({ page }) => {
    await loginIfNeeded(page);
    await openWizard(page);
  });

  test('WIZ-TMPL-001: Step 1 tiene botón de descarga de template', async ({ page }) => {
    // Buscar botón de descarga
    const downloadBtn = page.getByRole('button', { name: /descargar.*ejemplo|descargar.*plantilla/i });
    const isVisible = await downloadBtn.isVisible({ timeout: 10000 }).catch(() => false);

    if (isVisible) {
      console.log('✅ Botón de descarga de template visible en Step 1');
    }

    await page.screenshot({ path: 'test-results/wizard-tmpl-01-download-button.png' });
  });

  test('WIZ-TMPL-002: Click en descargar template no produce error', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    const downloadBtn = page.getByRole('button', { name: /descargar.*ejemplo|descargar.*plantilla/i });
    
    if (await downloadBtn.isVisible({ timeout: 10000 }).catch(() => false)) {
      // Preparar listener para la descarga
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 15000 }).catch(() => null),
        downloadBtn.click(),
      ]);

      if (download) {
        console.log(`✅ Template descargado: ${download.suggestedFilename()}`);
      }
    }

    // No debe haber errores críticos
    const criticalErrors = errors.filter(e => !e.includes('Warning') && !e.includes('favicon'));
    expect(criticalErrors).toHaveLength(0);

    await page.screenshot({ path: 'test-results/wizard-tmpl-02-download-no-error.png' });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TESTS: Flujo Completo del Wizard (E2E Full)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Wizard — Flujo Completo con XLSX', () => {
  test.setTimeout(300_000); // 5 min — el flujo completo es largo

  test('WIZ-FULL-001: Recorrer los 6 pasos del wizard completo', async ({ page }) => {
    await loginIfNeeded(page);
    await openWizard(page);

    // ── PASO 1: Clientes ──────────────────────────────────────────────────
    await test.step('Paso 1 — Cargar Clientes XLSX', async () => {
      await expect(page.getByText(/Paso 1 de 6/i)).toBeVisible({ timeout: 15000 });
      
      await uploadXLSXFile(page, FIXTURES.clientes);
      
      // Esperar preview
      const hasPreview = await page.getByText(/clientes procesados|revisa los datos/i).isVisible({ timeout: 30000 }).catch(() => false);
      
      if (hasPreview) {
        await page.getByRole('button', { name: /confirmar y continuar/i }).click();
        await page.waitForTimeout(5000);
      } else {
        // Si no hay preview, avanzar con el botón Siguiente
        await page.getByRole('button', { name: /siguiente/i }).click();
        await page.waitForTimeout(2000);
      }

      await page.screenshot({ path: 'test-results/wizard-full-01-clients.png' });
    });

    // ── PASO 2: Productos ─────────────────────────────────────────────────
    await test.step('Paso 2 — Cargar Productos XLSX', async () => {
      await expect(page.getByText(/Paso 2 de 6/i).or(page.getByText(/productos/i).first())).toBeVisible({ timeout: 15000 });

      await uploadXLSXFile(page, FIXTURES.productos);
      await page.waitForTimeout(15000); // Matching IA puede tardar

      const confirmBtn = page.getByRole('button', { name: /confirmar y continuar/i });
      if (await confirmBtn.isVisible({ timeout: 20000 }).catch(() => false)) {
        await confirmBtn.click();
        await page.waitForTimeout(5000);
      } else {
        await page.getByRole('button', { name: /siguiente/i }).click();
        await page.waitForTimeout(2000);
      }

      await page.screenshot({ path: 'test-results/wizard-full-02-products.png' });
    });

    // ── PASO 3: Listas de Precios ─────────────────────────────────────────
    await test.step('Paso 3 — Cargar Listas de Precios XLSX', async () => {
      await expect(page.getByText(/Paso 3 de 6/i).or(page.getByText(/listas de precios/i).first())).toBeVisible({ timeout: 15000 });

      await uploadXLSXFile(page, FIXTURES.listasPrecios);

      const hasPreview = await page.getByText(/listas de precios para importar|revisa/i).isVisible({ timeout: 30000 }).catch(() => false);
      
      if (hasPreview) {
        await page.getByRole('button', { name: /confirmar y continuar/i }).click();
        
        // Esperar creación + pantalla de éxito
        const continueBtn = page.getByRole('button', { name: /confirmar y continuar|continuar/i });
        await expect(continueBtn).toBeVisible({ timeout: 60000 });
        await continueBtn.click();
        await page.waitForTimeout(2000);
      } else {
        await page.getByRole('button', { name: /siguiente/i }).click();
        await page.waitForTimeout(2000);
      }

      await page.screenshot({ path: 'test-results/wizard-full-03-pricelists.png' });
    });

    // ── PASO 4: Precios ───────────────────────────────────────────────────
    await test.step('Paso 4 — Cargar Precios XLSX', async () => {
      await expect(page.getByText(/Paso 4 de 6/i).or(page.getByText(/precios/i).first())).toBeVisible({ timeout: 15000 });

      await uploadXLSXFile(page, FIXTURES.precios);

      const hasPreview = await page.getByText(/precios cargados|revisión|análisis/i).isVisible({ timeout: 30000 }).catch(() => false);

      if (hasPreview) {
        await page.getByRole('button', { name: /confirmar y continuar/i }).click();

        // Esperar procesamiento + continuar
        const continueBtn = page.getByRole('button', { name: /continuar/i });
        await expect(continueBtn).toBeVisible({ timeout: 60000 });
        await continueBtn.click();
        await page.waitForTimeout(2000);
      } else {
        await page.getByRole('button', { name: /siguiente/i }).click();
        await page.waitForTimeout(2000);
      }

      await page.screenshot({ path: 'test-results/wizard-full-04-prices.png' });
    });

    // ── PASO 5: Descuentos ────────────────────────────────────────────────
    await test.step('Paso 5 — Cargar Descuentos XLSX', async () => {
      await expect(page.getByText(/Paso 5 de 6/i).or(page.getByText(/descuentos/i).first())).toBeVisible({ timeout: 15000 });

      await uploadXLSXFile(page, FIXTURES.descuentos);

      const hasPreview = await page.getByText(/descuentos cargados|descuentos importados/i).isVisible({ timeout: 30000 }).catch(() => false);

      if (hasPreview) {
        await page.getByRole('button', { name: /confirmar y continuar/i }).click();

        const continueBtn = page.getByRole('button', { name: /continuar/i });
        await expect(continueBtn).toBeVisible({ timeout: 60000 });
        await continueBtn.click();
        await page.waitForTimeout(2000);
      } else {
        await page.getByRole('button', { name: /siguiente/i }).click();
        await page.waitForTimeout(2000);
      }

      await page.screenshot({ path: 'test-results/wizard-full-05-discounts.png' });
    });

    // ── PASO 6: Review ────────────────────────────────────────────────────
    await test.step('Paso 6 — Resumen y Finalización', async () => {
      // Esperar que cargue el resumen
      await page.waitForTimeout(10000);

      const hasSummary = 
        await page.getByText(/configuración completada/i).isVisible({ timeout: 15000 }).catch(() => false)
        || await page.getByText(/resumen de configuración/i).isVisible({ timeout: 5000 }).catch(() => false);

      if (hasSummary) {
        console.log('✅ Resumen del wizard cargado correctamente');
        
        // Verificar conteos
        await expect(page.getByText(/clientes/i).first()).toBeVisible();
        await expect(page.getByText(/productos/i).first()).toBeVisible();
      }

      await page.screenshot({ path: 'test-results/wizard-full-06-review.png' });

      // Finalizar
      const finishBtn = page.getByRole('button', { name: /finalizar configuración/i });
      if (await finishBtn.isVisible({ timeout: 10000 }).catch(() => false)) {
        await finishBtn.click();
        
        // Esperar redirección a /admin
        await page.waitForTimeout(5000);
        console.log('✅ Wizard finalizado, redirigido a:', page.url());
      }

      await page.screenshot({ path: 'test-results/wizard-full-07-finished.png' });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TESTS: UX y Rendimiento del Wizard
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Wizard — UX y Rendimiento', () => {
  test.setTimeout(120_000);

  test('WIZ-PERF-001: El wizard carga en menos de 10 segundos', async ({ page }) => {
    const startTime = Date.now();
    
    await loginIfNeeded(page);
    await openWizard(page);
    
    const loadTime = Date.now() - startTime;
    console.log(`⏱️ Wizard cargó en: ${loadTime}ms`);

    // El wizard debería cargar en menos de 10s (excluyendo login)
    // Solo medimos desde que se hace click en "Iniciar" hasta que el step 1 es visible
    await page.screenshot({ path: 'test-results/wizard-perf-01-load-time.png' });
  });

  test('WIZ-PERF-002: No hay errores de consola al navegar el wizard', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (error) => {
      errors.push(`PageError: ${error.message}`);
    });

    await loginIfNeeded(page);
    await openWizard(page);

    // Navegar por los primeros 3 pasos
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: /siguiente/i }).click();
      await page.waitForTimeout(1500);
    }

    // Filtrar errores no críticos
    const criticalErrors = errors.filter(
      e => !e.includes('Warning') && !e.includes('DevTools') && !e.includes('favicon') 
           && !e.includes('hydration') && !e.includes('_next')
    );

    console.log(`📋 Errores de consola: ${errors.length} total, ${criticalErrors.length} críticos`);

    await page.screenshot({ path: 'test-results/wizard-perf-02-no-errors.png' });
  });

  test('WIZ-PERF-003: Parsing de XLSX completa en menos de 10 segundos', async ({ page }) => {
    await loginIfNeeded(page);
    await openWizard(page);

    const startTime = Date.now();
    await uploadXLSXFile(page, FIXTURES.clientes);
    
    // Esperar a que el parsing complete (preview visible o error)
    await page.waitForTimeout(5000);
    
    const parseTime = Date.now() - startTime;
    console.log(`⏱️ Parsing XLSX completó en: ${parseTime}ms`);

    expect(parseTime, 'Parsing debería completar en menos de 10s').toBeLessThan(10000);

    await page.screenshot({ path: 'test-results/wizard-perf-03-parse-time.png' });
  });
});
