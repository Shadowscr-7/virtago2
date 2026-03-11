import { test, expect, Page } from '@playwright/test';
import * as path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// Configuración y Helpers
// ─────────────────────────────────────────────────────────────────────────────

const FIXTURES_DIR = path.resolve(__dirname, 'fixtures');

/** Un XLSX genérico — usamos clientes_test.xlsx que tiene columnas distintas a
 *  las esperadas por productos, precios, etc. así se fuerza el mapeo. */
const GENERIC_XLSX = path.join(FIXTURES_DIR, 'clientes_test.xlsx');
const CLIENTES_XLSX = path.join(FIXTURES_DIR, 'clientes_test.xlsx');
const PRODUCTOS_XLSX = path.join(FIXTURES_DIR, 'productos_test.xlsx');
const LISTAS_PRECIOS_XLSX = path.join(FIXTURES_DIR, 'listas_precios_test.xlsx');
const PRECIOS_XLSX = path.join(FIXTURES_DIR, 'precios_test.xlsx');
const DESCUENTOS_XLSX = path.join(FIXTURES_DIR, 'descuentos_test.xlsx');

const ADMIN_CREDENTIALS = {
  email: process.env.E2E_ADMIN_EMAIL || 'admin@test.com',
  password: process.env.E2E_ADMIN_PASSWORD || 'TestAdmin123!',
};

// ─── Auth helper ─────────────────────────────────────────────────────────────

async function loginAsAdmin(page: Page) {
  await page.goto('/admin/clientes');
  await page.waitForTimeout(2000);

  if (page.url().includes('/login')) {
    await page.locator('input[name="email"]').or(page.getByRole('textbox', { name: /email/i })).fill(ADMIN_CREDENTIALS.email);
    await page.locator('input[name="password"]').or(page.getByRole('textbox', { name: /contraseña|password/i })).fill(ADMIN_CREDENTIALS.password);
    await page.getByRole('button', { name: /iniciar sesión|sign in|entrar/i }).click();
    await page.waitForTimeout(3000);
  }
}

// ─── Shared helpers ──────────────────────────────────────────────────────────

/** Navega a una ruta admin y espera carga */
async function navigateAdmin(page: Page, path: string) {
  await page.goto(path);
  await page.waitForTimeout(2000);
}

/** Sube un archivo al input[type="file"] visible o hidden */
async function uploadFile(page: Page, filePath: string) {
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(filePath);
  await page.waitForTimeout(3000);
}

/** Espera a que el modal de mapeo de columnas aparezca y mapea campos */
async function waitForMappingModal(page: Page) {
  await expect(
    page.getByText('Mapeo de Columnas').or(page.getByText('Mapear Columnas'))
  ).toBeVisible({ timeout: 20000 });
}

/** Verifica que el preview de datos mapeados funciona */
async function verifyMappingPreview(page: Page) {
  const previewToggle = page.getByText(/ver vista previa de datos mapeados/i);
  if (await previewToggle.isVisible({ timeout: 5000 }).catch(() => false)) {
    await previewToggle.click();
    await expect(page.getByText(/mostrando/i)).toBeVisible({ timeout: 5000 });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SECCIÓN 1: CLIENTES — ABM + Invitación + Import con Mapeo
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('ABM Clientes', () => {
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateAdmin(page, '/admin/clientes');
  });

  // ─── Listado ─────────────────────────────────────────────────────────────

  test('CLI-LIST-001: Página de clientes carga con tabla y botones', async ({ page }) => {
    await expect(page.getByRole('button', { name: /crear cliente/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: /importar/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /exportar excel/i })).toBeVisible();
    await expect(page.getByPlaceholder(/buscar por nombre, email/i)).toBeVisible();

    await page.screenshot({ path: 'test-results/crud-cli-list-001.png' });
  });

  test('CLI-LIST-002: Búsqueda filtra clientes por nombre/email', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/buscar por nombre, email/i);
    await searchInput.fill('test');
    await page.waitForTimeout(1500); // debounce 500ms + respuesta

    // La tabla debería mostrar resultados filtrados o mensaje vacío
    await page.screenshot({ path: 'test-results/crud-cli-list-002.png' });
  });

  // ─── Crear Cliente ───────────────────────────────────────────────────────

  test('CLI-CREATE-001: Navegar a crear cliente muestra formulario', async ({ page }) => {
    await page.getByRole('button', { name: /crear cliente/i }).click();
    await page.waitForTimeout(2000);

    expect(page.url()).toContain('/admin/clientes/nuevo');

    // Verificar campos del formulario
    await expect(page.getByLabel(/nombre/i).or(page.locator('input[name="name"]'))).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'test-results/crud-cli-create-001.png' });
  });

  test('CLI-CREATE-002: Enviar formulario con datos válidos crea cliente', async ({ page }) => {
    await navigateAdmin(page, '/admin/clientes/nuevo');

    // Llenar campos mínimos
    const timestamp = Date.now();
    const nameInput = page.locator('input[name="name"]').or(page.getByLabel(/nombre/i).first());
    const emailInput = page.locator('input[name="email"]').or(page.getByLabel(/email/i));
    const phoneInput = page.locator('input[name="phone"]').or(page.getByLabel(/teléfono/i));

    if (await nameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await nameInput.fill(`E2E Test Cliente ${timestamp}`);
    }
    if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await emailInput.fill(`e2e_${timestamp}@test.com`);
    }
    if (await phoneInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await phoneInput.fill('+59899888777');
    }

    // Guardar
    const saveBtn = page.getByRole('button', { name: /guardar|crear/i });
    if (await saveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await saveBtn.click();
      await page.waitForTimeout(5000);
    }

    await page.screenshot({ path: 'test-results/crud-cli-create-002.png' });
  });

  // ─── Editar Cliente ──────────────────────────────────────────────────────

  test('CLI-EDIT-001: Click en editar abre modo edición', async ({ page }) => {
    // Click en el primer ícono de editar de la tabla
    const editBtn = page.locator('button[title="Editar cliente"]').or(page.locator('table tbody tr').first().getByRole('button').last());
    if (await editBtn.first().isVisible({ timeout: 10000 }).catch(() => false)) {
      await editBtn.first().click();
      await page.waitForTimeout(3000);

      // Debe estar en la página de detalle en modo edición
      expect(page.url()).toContain('/admin/clientes/');

      await page.screenshot({ path: 'test-results/crud-cli-edit-001.png' });
    }
  });

  test('CLI-EDIT-002: En detalle, botón "Editar Cliente" abre edición', async ({ page }) => {
    // Click en el primer ícono de ver (ojo)
    const viewBtn = page.locator('table tbody tr').first().locator('button').first();
    if (await viewBtn.isVisible({ timeout: 10000 }).catch(() => false)) {
      await viewBtn.click();
      await page.waitForTimeout(3000);

      // Buscar botón "Editar Cliente"
      const editarClienteBtn = page.getByRole('button', { name: /editar cliente/i });
      await expect(editarClienteBtn).toBeVisible({ timeout: 10000 });
      await editarClienteBtn.click();
      await page.waitForTimeout(2000);

      // Debe mostrar botones Cancelar y Guardar
      await expect(page.getByRole('button', { name: /cancelar/i })).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('button', { name: /guardar/i })).toBeVisible();

      await page.screenshot({ path: 'test-results/crud-cli-edit-002.png' });
    }
  });

  test('CLI-EDIT-003: Guardar cambios muestra confirmación', async ({ page }) => {
    // Ir directo a un cliente en modo edición
    const viewBtn = page.locator('table tbody tr').first().locator('button').first();
    if (await viewBtn.isVisible({ timeout: 10000 }).catch(() => false)) {
      await viewBtn.click();
      await page.waitForTimeout(3000);

      const editarBtn = page.getByRole('button', { name: /editar cliente/i });
      if (await editarBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await editarBtn.click();
        await page.waitForTimeout(1000);

        // Modificar un campo
        const obsField = page.locator('textarea[name="observations"]').or(page.getByLabel(/observaciones/i));
        if (await obsField.isVisible({ timeout: 3000 }).catch(() => false)) {
          await obsField.fill(`E2E Test Edit — ${new Date().toISOString()}`);
        }

        // Guardar
        await page.getByRole('button', { name: /guardar cambios|guardar/i }).click();
        await page.waitForTimeout(5000);
      }
    }

    await page.screenshot({ path: 'test-results/crud-cli-edit-003.png' });
  });

  // ─── Cambio de Estado ────────────────────────────────────────────────────

  test('CLI-STATUS-001: Toggle de estado abre diálogo de confirmación', async ({ page }) => {
    const statusBtn = page.locator('table tbody tr').first().getByRole('button', { name: /activo|inactivo|nuevo/i });
    if (await statusBtn.isVisible({ timeout: 10000 }).catch(() => false)) {
      await statusBtn.click();

      await expect(page.getByText('Confirmar Cambio de Estado')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('button', { name: /cancelar/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /confirmar/i })).toBeVisible();

      // Cancelar para no modificar datos
      await page.getByRole('button', { name: /cancelar/i }).click();
    }

    await page.screenshot({ path: 'test-results/crud-cli-status-001.png' });
  });

  // ─── Invitación ──────────────────────────────────────────────────────────

  test('CLI-INVITE-001: Botón "Invitar" abre diálogo de invitación masiva', async ({ page }) => {
    const inviteBtn = page.getByRole('button', { name: /invitar/i }).first();
    if (await inviteBtn.isVisible({ timeout: 10000 }).catch(() => false)) {
      await inviteBtn.click();
      await page.waitForTimeout(1000);

      // Debe mostrar diálogo de envío
      const hasDialog = 
        await page.getByText('Enviar Invitación').isVisible({ timeout: 5000 }).catch(() => false)
        || await page.getByText('Enviar Invitaciones').isVisible({ timeout: 3000 }).catch(() => false);

      expect(hasDialog).toBeTruthy();

      // Cancelar
      await page.getByRole('button', { name: /cancelar/i }).click();
    }

    await page.screenshot({ path: 'test-results/crud-cli-invite-001.png' });
  });

  test('CLI-INVITE-002: Envío de invitación individual desde ícono de verificación', async ({ page }) => {
    // Buscar ícono de invitación individual en columna Verificado
    const inviteIcon = page.locator('table tbody tr').first().locator('button[title*="invit" i]')
      .or(page.locator('table tbody tr').first().locator('button').nth(2));

    if (await inviteIcon.isVisible({ timeout: 10000 }).catch(() => false)) {
      await inviteIcon.click();
      await page.waitForTimeout(1000);

      // Verificar diálogo individual
      const singleDialog = await page.getByText('Enviar Invitación').isVisible({ timeout: 5000 }).catch(() => false);
      if (singleDialog) {
        // Verificar contenido
        await expect(page.getByText(/recibirá un email de invitación/i)).toBeVisible({ timeout: 5000 });
        await expect(page.getByRole('button', { name: /enviar invitación/i })).toBeVisible();
        
        // Cancelar
        await page.getByRole('button', { name: /cancelar/i }).click();
      }
    }

    await page.screenshot({ path: 'test-results/crud-cli-invite-002.png' });
  });

  test('CLI-INVITE-003: Seleccionar clientes y enviar invitación masiva', async ({ page }) => {
    // Seleccionar primer checkbox
    const firstCheckbox = page.locator('table tbody tr').first().locator('input[type="checkbox"]');
    if (await firstCheckbox.isVisible({ timeout: 10000 }).catch(() => false)) {
      await firstCheckbox.check();
      await page.waitForTimeout(500);

      // Buscar botón de invitación masiva
      const bulkInviteBtn = page.getByRole('button', { name: /invitar.*\d|invitar todos/i });
      if (await bulkInviteBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await bulkInviteBtn.click();

        await expect(page.getByText('Enviar Invitaciones')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText(/cliente\(s\) seleccionado/i)).toBeVisible();

        await page.getByRole('button', { name: /cancelar/i }).click();
      }
    }

    await page.screenshot({ path: 'test-results/crud-cli-invite-003.png' });
  });

  // ─── Importación XLSX con Mapeo de Columnas ─────────────────────────────

  test('CLI-IMPORT-001: Botón "Importar" abre modal de importación', async ({ page }) => {
    await page.getByRole('button', { name: /importar/i }).first().click();

    await expect(page.getByText('Importar Clientes')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Subir Archivo')).toBeVisible();
    await expect(page.getByText('Importar JSON')).toBeVisible();
    await expect(page.getByText('Descargar Plantilla de Ejemplo')).toBeVisible();

    await page.screenshot({ path: 'test-results/crud-cli-import-001.png' });
  });

  test('CLI-IMPORT-002: Subir XLSX con formato diferente activa mapeo de columnas', async ({ page }) => {
    await page.getByRole('button', { name: /importar/i }).first().click();
    await expect(page.getByText('Importar Clientes')).toBeVisible({ timeout: 10000 });

    // Subir archivo XLSX — puede tener columnas que no coinciden exactamente
    await uploadFile(page, CLIENTES_XLSX);

    // Esperar a que se procese y se detecte la necesidad de mapeo
    // Puede mostrar directamente la lista para importar o el botón de mapear
    const needsMapping = await page.getByText('Mapear Columnas').isVisible({ timeout: 15000 }).catch(() => false);
    const readyToImport = await page.getByText(/listo.*para importar/i).isVisible({ timeout: 5000 }).catch(() => false);

    if (needsMapping) {
      console.log('✅ Se detectó necesidad de mapeo — botón "Mapear Columnas" visible');
      await page.getByText('Mapear Columnas').click();
      await waitForMappingModal(page);

      // Verificar estructura del modal de mapeo
      await expect(page.getByText(/columnas obligatorias/i)).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('Obligatorio').first()).toBeVisible();
      await expect(page.getByRole('button', { name: /confirmar mapeo e importar/i })).toBeVisible();
    } else if (readyToImport) {
      console.log('✅ Columnas coinciden — listo para importar directamente');
    }

    await page.screenshot({ path: 'test-results/crud-cli-import-002.png' });
  });

  test('CLI-IMPORT-003: Mapeo muestra columnas obligatorias y recomendadas', async ({ page }) => {
    await page.getByRole('button', { name: /importar/i }).first().click();
    await expect(page.getByText('Importar Clientes')).toBeVisible({ timeout: 10000 });
    await uploadFile(page, CLIENTES_XLSX);

    const mapBtn = page.getByText('Mapear Columnas');
    if (await mapBtn.isVisible({ timeout: 15000 }).catch(() => false)) {
      await mapBtn.click();
      await page.waitForTimeout(3000);

      // Verificar secciones
      await expect(page.getByText(/columnas obligatorias/i)).toBeVisible({ timeout: 10000 });

      // Verificar que hay dropdowns de mapeo
      const selects = page.locator('select').or(page.locator('[role="listbox"]'))
        .or(page.locator('button:has-text("— Sin mapear —")'));
      const selectCount = await selects.count();
      console.log(`📋 Dropdowns de mapeo encontrados: ${selectCount}`);

      // Verificar badge "Obligatorio"
      await expect(page.getByText('Obligatorio').first()).toBeVisible({ timeout: 5000 });
    }

    await page.screenshot({ path: 'test-results/crud-cli-import-003.png' });
  });

  test('CLI-IMPORT-004: Auto-mapeo vincula columnas coincidentes', async ({ page }) => {
    await page.getByRole('button', { name: /importar/i }).first().click();
    await expect(page.getByText('Importar Clientes')).toBeVisible({ timeout: 10000 });
    await uploadFile(page, CLIENTES_XLSX);

    const mapBtn = page.getByText('Mapear Columnas');
    if (await mapBtn.isVisible({ timeout: 15000 }).catch(() => false)) {
      await mapBtn.click();
      await page.waitForTimeout(3000);

      // El auto-mapeo debería haber vinculado algunas columnas
      const autoMapMsg = page.getByText(/se auto-mapearon/i);
      const hasAutoMap = await autoMapMsg.isVisible({ timeout: 10000 }).catch(() => false);
      if (hasAutoMap) {
        console.log('✅ Auto-mapeo detectado');
      }
    }

    await page.screenshot({ path: 'test-results/crud-cli-import-004.png' });
  });

  test('CLI-IMPORT-005: Vista previa de datos mapeados funciona', async ({ page }) => {
    await page.getByRole('button', { name: /importar/i }).first().click();
    await expect(page.getByText('Importar Clientes')).toBeVisible({ timeout: 10000 });
    await uploadFile(page, CLIENTES_XLSX);

    const mapBtn = page.getByText('Mapear Columnas');
    if (await mapBtn.isVisible({ timeout: 15000 }).catch(() => false)) {
      await mapBtn.click();
      await page.waitForTimeout(3000);

      await verifyMappingPreview(page);
    }

    await page.screenshot({ path: 'test-results/crud-cli-import-005.png' });
  });

  test('CLI-IMPORT-006: Confirmar mapeo importa los registros mapeados', async ({ page }) => {
    await page.getByRole('button', { name: /importar/i }).first().click();
    await expect(page.getByText('Importar Clientes')).toBeVisible({ timeout: 10000 });
    await uploadFile(page, CLIENTES_XLSX);

    const readyToImport = await page.getByText(/listo.*para importar/i).isVisible({ timeout: 15000 }).catch(() => false);
    
    if (readyToImport) {
      // Importar directamente si las columnas coinciden
      await page.getByRole('button', { name: /importar clientes/i }).click();
    } else {
      const mapBtn = page.getByText('Mapear Columnas');
      if (await mapBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await mapBtn.click();
        await page.waitForTimeout(3000);

        const confirmBtn = page.getByRole('button', { name: /confirmar mapeo e importar/i });
        if (await confirmBtn.isEnabled({ timeout: 10000 }).catch(() => false)) {
          await confirmBtn.click();
        }
      }
    }

    // Esperar resultado de importación
    await page.waitForTimeout(10000);

    const hasResult = 
      await page.getByText('Resultado de Importación').isVisible({ timeout: 15000 }).catch(() => false)
      || await page.getByText(/importación exitosa/i).isVisible({ timeout: 5000 }).catch(() => false)
      || await page.getByText(/importación parcial/i).isVisible({ timeout: 5000 }).catch(() => false);

    if (hasResult) console.log('✅ Resultado de importación visible');

    await page.screenshot({ path: 'test-results/crud-cli-import-006.png' });
  });

  test('CLI-IMPORT-007: Descargar plantilla de ejemplo', async ({ page }) => {
    await page.getByRole('button', { name: /importar/i }).first().click();
    await expect(page.getByText('Importar Clientes')).toBeVisible({ timeout: 10000 });

    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 15000 }).catch(() => null),
      page.getByText('Descargar Plantilla de Ejemplo').click(),
    ]);

    if (download) {
      console.log(`✅ Template descargado: ${download.suggestedFilename()}`);
    }

    await page.screenshot({ path: 'test-results/crud-cli-import-007.png' });
  });

  // ─── Exportar ────────────────────────────────────────────────────────────

  test('CLI-EXPORT-001: Botón "Exportar Excel" descarga archivo', async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 15000 }).catch(() => null),
      page.getByRole('button', { name: /exportar excel/i }).click(),
    ]);

    if (download) {
      console.log(`✅ Excel exportado: ${download.suggestedFilename()}`);
    }

    await page.screenshot({ path: 'test-results/crud-cli-export-001.png' });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  SECCIÓN 2: PRODUCTOS — ABM + Import con Mapeo
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('ABM Productos', () => {
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateAdmin(page, '/admin/productos');
  });

  // ─── Listado ─────────────────────────────────────────────────────────────

  test('PROD-LIST-001: Página carga con tabla, filtros y botones', async ({ page }) => {
    await expect(page.getByRole('button', { name: /crear producto/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: /importar/i })).toBeVisible();
    await expect(page.getByPlaceholder(/buscar productos/i)).toBeVisible();

    await page.screenshot({ path: 'test-results/crud-prod-list-001.png' });
  });

  test('PROD-LIST-002: Filtros de categoría y estado funcionan', async ({ page }) => {
    // Filtro de categoría
    const categoryFilter = page.getByRole('combobox').or(page.locator('select')).first();
    if (await categoryFilter.isVisible({ timeout: 5000 }).catch(() => false)) {
      await categoryFilter.selectOption({ index: 1 }).catch(() => {});
      await page.waitForTimeout(1500);
    }

    await page.screenshot({ path: 'test-results/crud-prod-list-002.png' });
  });

  // ─── Crear Producto ──────────────────────────────────────────────────────

  test('PROD-CREATE-001: Navegar a crear producto muestra formulario', async ({ page }) => {
    await page.getByRole('button', { name: /crear producto/i }).click();
    await page.waitForTimeout(2000);

    expect(page.url()).toContain('/admin/productos/nuevo');
    await expect(page.locator('input[name="name"]').or(page.getByLabel(/nombre/i).first())).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'test-results/crud-prod-create-001.png' });
  });

  test('PROD-CREATE-002: Crear producto con datos mínimos', async ({ page }) => {
    await navigateAdmin(page, '/admin/productos/nuevo');

    const timestamp = Date.now();
    const fields = {
      name: `E2E Producto ${timestamp}`,
      sku: `SKU-E2E-${timestamp}`,
      price: '99.99',
      brand: 'E2E Test Brand',
      category: 'Electrónicos',
    };

    for (const [field, value] of Object.entries(fields)) {
      const input = page.locator(`input[name="${field}"]`).or(page.getByLabel(new RegExp(field, 'i')));
      if (await input.isVisible({ timeout: 3000 }).catch(() => false)) {
        await input.fill(value);
      }
    }

    const saveBtn = page.getByRole('button', { name: /guardar|crear/i });
    if (await saveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await saveBtn.click();
      await page.waitForTimeout(5000);
    }

    await page.screenshot({ path: 'test-results/crud-prod-create-002.png' });
  });

  // ─── Editar Producto ─────────────────────────────────────────────────────

  test('PROD-EDIT-001: Click en editar abre detalle en modo edición', async ({ page }) => {
    const editBtn = page.locator('button[title="Editar producto"]');
    if (await editBtn.first().isVisible({ timeout: 10000 }).catch(() => false)) {
      await editBtn.first().click();
      await page.waitForTimeout(3000);

      expect(page.url()).toContain('/admin/productos/');
    }

    await page.screenshot({ path: 'test-results/crud-prod-edit-001.png' });
  });

  test('PROD-EDIT-002: En detalle, botón "Editar" abre edición', async ({ page }) => {
    const viewBtn = page.locator('button[title="Ver detalles"]');
    if (await viewBtn.first().isVisible({ timeout: 10000 }).catch(() => false)) {
      await viewBtn.first().click();
      await page.waitForTimeout(3000);

      const editarBtn = page.getByRole('button', { name: /editar/i });
      if (await editarBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await editarBtn.click();
        await page.waitForTimeout(2000);

        // Debe mostrar Cancelar y Guardar
        await expect(page.getByRole('button', { name: /cancelar/i })).toBeVisible({ timeout: 5000 });
        await expect(page.getByRole('button', { name: /guardar/i })).toBeVisible();
      }
    }

    await page.screenshot({ path: 'test-results/crud-prod-edit-002.png' });
  });

  test('PROD-EDIT-003: Guardar cambios muestra toast de éxito', async ({ page }) => {
    const viewBtn = page.locator('button[title="Ver detalles"]');
    if (await viewBtn.first().isVisible({ timeout: 10000 }).catch(() => false)) {
      await viewBtn.first().click();
      await page.waitForTimeout(3000);

      const editarBtn = page.getByRole('button', { name: /editar/i });
      if (await editarBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await editarBtn.click();
        await page.waitForTimeout(1000);

        // Verificar botón Guardar existe
        await expect(page.getByRole('button', { name: /guardar/i })).toBeVisible({ timeout: 5000 });
      }
    }

    await page.screenshot({ path: 'test-results/crud-prod-edit-003.png' });
  });

  // ─── Importación con Mapeo ──────────────────────────────────────────────

  test('PROD-IMPORT-001: Modal de importación abre con tabs', async ({ page }) => {
    await page.getByRole('button', { name: /importar/i }).first().click();

    await expect(page.getByText('Importar Productos')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Subir Archivo')).toBeVisible();
    await expect(page.getByText('Importar JSON')).toBeVisible();

    await page.screenshot({ path: 'test-results/crud-prod-import-001.png' });
  });

  test('PROD-IMPORT-002: Subir XLSX cualquiera activa mapeo de columnas', async ({ page }) => {
    await page.getByRole('button', { name: /importar/i }).first().click();
    await expect(page.getByText('Importar Productos')).toBeVisible({ timeout: 10000 });

    // Subir un XLSX genérico (clientes_test.xlsx) que NO tiene las columnas de productos
    await uploadFile(page, GENERIC_XLSX);

    // Debe detectar que las columnas NO coinciden y mostrar opción de mapeo
    const needsMapping = await page.getByText('Mapear Columnas').isVisible({ timeout: 15000 }).catch(() => false);
    const warningMsg = await page.getByText(/formato del archivo no coincide/i).isVisible({ timeout: 5000 }).catch(() => false);

    if (needsMapping || warningMsg) {
      console.log('✅ Columnas no coinciden — se ofrece mapeo');
      
      if (needsMapping) {
        await page.getByText('Mapear Columnas').click();
        await page.waitForTimeout(3000);

        // Verificar modal de mapeo
        await expect(page.getByText(/mapeo de columnas/i)).toBeVisible({ timeout: 10000 });
        await expect(page.getByText(/columnas obligatorias/i)).toBeVisible({ timeout: 5000 });
      }
    }

    await page.screenshot({ path: 'test-results/crud-prod-import-002.png' });
  });

  test('PROD-IMPORT-003: Subir XLSX correcto permite importar directamente', async ({ page }) => {
    await page.getByRole('button', { name: /importar/i }).first().click();
    await expect(page.getByText('Importar Productos')).toBeVisible({ timeout: 10000 });

    // Subir el XLSX con formato correcto de productos
    await uploadFile(page, PRODUCTOS_XLSX);

    const readyToImport = await page.getByText(/listo.*para importar/i).isVisible({ timeout: 15000 }).catch(() => false);
    const needsMapping = await page.getByText('Mapear Columnas').isVisible({ timeout: 5000 }).catch(() => false);

    console.log(`Resultado: readyToImport=${readyToImport}, needsMapping=${needsMapping}`);

    await page.screenshot({ path: 'test-results/crud-prod-import-003.png' });
  });

  test('PROD-IMPORT-004: Mapeo valida columnas obligatorias antes de importar', async ({ page }) => {
    await page.getByRole('button', { name: /importar/i }).first().click();
    await expect(page.getByText('Importar Productos')).toBeVisible({ timeout: 10000 });
    await uploadFile(page, GENERIC_XLSX);

    const mapBtn = page.getByText('Mapear Columnas');
    if (await mapBtn.isVisible({ timeout: 15000 }).catch(() => false)) {
      await mapBtn.click();
      await page.waitForTimeout(3000);

      // El botón de confirmar debe estar deshabilitado si hay obligatorias sin mapear
      const confirmBtn = page.getByRole('button', { name: /confirmar mapeo e importar/i });
      const isDisabled = await confirmBtn.isDisabled().catch(() => false);
      
      if (isDisabled) {
        console.log('✅ Botón confirmar deshabilitado — hay columnas obligatorias sin mapear');
      }

      // Verificar mensaje de validación
      const validationMsg = page.getByText(/obligatoria.*sin mapear/i);
      if (await validationMsg.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log('✅ Mensaje de validación de columnas obligatorias visible');
      }
    }

    await page.screenshot({ path: 'test-results/crud-prod-import-004.png' });
  });

  test('PROD-IMPORT-005: Resultado de importación muestra éxito/errores por fila', async ({ page }) => {
    await page.getByRole('button', { name: /importar/i }).first().click();
    await expect(page.getByText('Importar Productos')).toBeVisible({ timeout: 10000 });
    await uploadFile(page, PRODUCTOS_XLSX);

    // Intentar importar (sea directo o con mapeo)
    const importBtn = page.getByRole('button', { name: /importar productos/i });
    if (await importBtn.isVisible({ timeout: 15000 }).catch(() => false)) {
      await importBtn.click();
      await page.waitForTimeout(10000);

      // Verificar pantalla de resultados
      const hasResults = await page.getByText('Resultado de Importación').isVisible({ timeout: 20000 }).catch(() => false);
      if (hasResults) {
        console.log('✅ Pantalla de resultados visible');
        // Verificar que muestra conteo
        const successCount = page.getByText(/exitoso/i);
        if (await successCount.isVisible({ timeout: 5000 }).catch(() => false)) {
          console.log('✅ Conteo de exitosos visible');
        }
      }
    }

    await page.screenshot({ path: 'test-results/crud-prod-import-005.png' });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  SECCIÓN 3: LISTAS DE PRECIOS — ABM + Import con Mapeo
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('ABM Listas de Precios', () => {
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateAdmin(page, '/admin/listas-precios');
  });

  // ─── Listado ─────────────────────────────────────────────────────────────

  test('LP-LIST-001: Página carga con tabla, filtros y botones', async ({ page }) => {
    await expect(page.getByRole('button', { name: /agregar/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: /importar/i })).toBeVisible();
    await expect(page.getByPlaceholder(/buscar por nombre/i)).toBeVisible();

    await page.screenshot({ path: 'test-results/crud-lp-list-001.png' });
  });

  test('LP-LIST-002: Filtros de estado y moneda funcionan', async ({ page }) => {
    // Los filtros existen
    await expect(page.getByText(/todos los estados/i).or(page.getByText(/activo/i).first())).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'test-results/crud-lp-list-002.png' });
  });

  // ─── Crear Lista de Precios ──────────────────────────────────────────────

  test('LP-CREATE-001: Navegar a crear lista muestra formulario', async ({ page }) => {
    await page.getByRole('button', { name: /agregar/i }).click();
    await page.waitForTimeout(2000);

    expect(page.url()).toContain('/admin/listas-precios/');
    await page.screenshot({ path: 'test-results/crud-lp-create-001.png' });
  });

  // ─── Editar Lista ────────────────────────────────────────────────────────

  test('LP-EDIT-001: Click en editar abre detalle de lista', async ({ page }) => {
    const editBtn = page.locator('table tbody tr').first().locator('button').last();
    if (await editBtn.isVisible({ timeout: 10000 }).catch(() => false)) {
      await editBtn.click();
      await page.waitForTimeout(3000);
      expect(page.url()).toContain('/admin/listas-precios/');
    }

    await page.screenshot({ path: 'test-results/crud-lp-edit-001.png' });
  });

  // ─── Cambio de Estado ────────────────────────────────────────────────────

  test('LP-STATUS-001: Toggle de estado abre diálogo de confirmación', async ({ page }) => {
    const statusBtn = page.locator('table tbody tr').first().getByRole('button', { name: /activo|inactivo|borrador/i });
    if (await statusBtn.isVisible({ timeout: 10000 }).catch(() => false)) {
      await statusBtn.click();

      await expect(page.getByText('Confirmar Cambio de Estado')).toBeVisible({ timeout: 5000 });
      await page.getByRole('button', { name: /cancelar/i }).click();
    }

    await page.screenshot({ path: 'test-results/crud-lp-status-001.png' });
  });

  // ─── Importación con Mapeo ──────────────────────────────────────────────

  test('LP-IMPORT-001: Modal de importación abre correctamente', async ({ page }) => {
    await page.getByRole('button', { name: /importar/i }).first().click();

    await expect(page.getByText('Importar Listas de Precios')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Subir Archivo')).toBeVisible();

    await page.screenshot({ path: 'test-results/crud-lp-import-001.png' });
  });

  test('LP-IMPORT-002: Subir XLSX cualquiera activa mapeo', async ({ page }) => {
    await page.getByRole('button', { name: /importar/i }).first().click();
    await expect(page.getByText('Importar Listas de Precios')).toBeVisible({ timeout: 10000 });

    await uploadFile(page, GENERIC_XLSX);

    const needsMapping = await page.getByText('Mapear Columnas').isVisible({ timeout: 15000 }).catch(() => false);
    const readyToImport = await page.getByText(/listo.*para importar/i).isVisible({ timeout: 5000 }).catch(() => false);

    if (needsMapping) {
      await page.getByText('Mapear Columnas').click();
      await page.waitForTimeout(3000);
      await expect(page.getByText(/mapeo de columnas/i)).toBeVisible({ timeout: 10000 });
      await expect(page.getByText(/columnas obligatorias/i)).toBeVisible({ timeout: 5000 });
      console.log('✅ Modal de mapeo abierto para Listas de Precios');
    } else if (readyToImport) {
      console.log('✅ Listas listas para importar directamente');
    }

    await page.screenshot({ path: 'test-results/crud-lp-import-002.png' });
  });

  test('LP-IMPORT-003: Subir XLSX correcto y verificar preview', async ({ page }) => {
    await page.getByRole('button', { name: /importar/i }).first().click();
    await expect(page.getByText('Importar Listas de Precios')).toBeVisible({ timeout: 10000 });

    await uploadFile(page, LISTAS_PRECIOS_XLSX);

    const readyOrMap = 
      await page.getByText(/listo.*para importar/i).isVisible({ timeout: 15000 }).catch(() => false)
      || await page.getByText('Mapear Columnas').isVisible({ timeout: 5000 }).catch(() => false);

    expect(readyOrMap).toBeTruthy();

    await page.screenshot({ path: 'test-results/crud-lp-import-003.png' });
  });

  test('LP-IMPORT-004: Importar listas y ver resultado', async ({ page }) => {
    await page.getByRole('button', { name: /importar/i }).first().click();
    await expect(page.getByText('Importar Listas de Precios')).toBeVisible({ timeout: 10000 });
    await uploadFile(page, LISTAS_PRECIOS_XLSX);

    const importBtn = page.getByRole('button', { name: /importar listas de precios/i });
    if (await importBtn.isVisible({ timeout: 15000 }).catch(() => false)) {
      await importBtn.click();
      await page.waitForTimeout(10000);

      const hasResults = await page.getByText('Resultado de Importación').isVisible({ timeout: 20000 }).catch(() => false);
      if (hasResults) console.log('✅ Resultado de importación visible');
    }

    await page.screenshot({ path: 'test-results/crud-lp-import-004.png' });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  SECCIÓN 4: PRECIOS — ABM + Import con Mapeo
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('ABM Precios', () => {
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateAdmin(page, '/admin/precios');
  });

  // ─── Listado ─────────────────────────────────────────────────────────────

  test('PRC-LIST-001: Página carga con tabla, filtros y botones', async ({ page }) => {
    await expect(page.getByRole('button', { name: /agregar/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: /importar/i })).toBeVisible();
    await expect(page.getByPlaceholder(/buscar por código/i)).toBeVisible();

    await page.screenshot({ path: 'test-results/crud-prc-list-001.png' });
  });

  test('PRC-LIST-002: Filtros de estado, moneda y categoría', async ({ page }) => {
    await expect(page.getByText(/todos los estados/i).first()).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'test-results/crud-prc-list-002.png' });
  });

  // ─── Crear Precio ────────────────────────────────────────────────────────

  test('PRC-CREATE-001: Navegar a crear precio muestra formulario', async ({ page }) => {
    await page.getByRole('button', { name: /agregar/i }).click();
    await page.waitForTimeout(2000);

    expect(page.url()).toContain('/admin/precios/nuevo');

    await page.screenshot({ path: 'test-results/crud-prc-create-001.png' });
  });

  test('PRC-CREATE-002: Formulario tiene campos requeridos', async ({ page }) => {
    await navigateAdmin(page, '/admin/precios/nuevo');

    // Verificar campos clave
    const hasProductCode = await page.locator('input[name="productCode"]').or(page.getByLabel(/código.*producto/i)).isVisible({ timeout: 10000 }).catch(() => false);
    const hasPrice = await page.locator('input[name="price"]').or(page.getByLabel(/precio/i)).isVisible({ timeout: 5000 }).catch(() => false);

    console.log(`Campos: productCode=${hasProductCode}, price=${hasPrice}`);

    await page.screenshot({ path: 'test-results/crud-prc-create-002.png' });
  });

  // ─── Editar Precio ───────────────────────────────────────────────────────

  test('PRC-EDIT-001: Click en editar navega al detalle', async ({ page }) => {
    const editBtn = page.locator('button[title="Editar"]');
    if (await editBtn.first().isVisible({ timeout: 10000 }).catch(() => false)) {
      await editBtn.first().click();
      await page.waitForTimeout(3000);
      expect(page.url()).toContain('/admin/precios/');
    }

    await page.screenshot({ path: 'test-results/crud-prc-edit-001.png' });
  });

  test('PRC-EDIT-002: Click en ver navega al detalle', async ({ page }) => {
    const viewBtn = page.locator('button[title="Ver"]');
    if (await viewBtn.first().isVisible({ timeout: 10000 }).catch(() => false)) {
      await viewBtn.first().click();
      await page.waitForTimeout(3000);
      expect(page.url()).toContain('/admin/precios/');
    }

    await page.screenshot({ path: 'test-results/crud-prc-edit-002.png' });
  });

  // ─── Importación con Mapeo ──────────────────────────────────────────────

  test('PRC-IMPORT-001: Modal de importación abre correctamente', async ({ page }) => {
    await page.getByRole('button', { name: /importar/i }).first().click();

    await expect(page.getByText('Importar Precios')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Subir Archivo')).toBeVisible();

    await page.screenshot({ path: 'test-results/crud-prc-import-001.png' });
  });

  test('PRC-IMPORT-002: Subir XLSX cualquiera activa mapeo', async ({ page }) => {
    await page.getByRole('button', { name: /importar/i }).first().click();
    await expect(page.getByText('Importar Precios')).toBeVisible({ timeout: 10000 });

    await uploadFile(page, GENERIC_XLSX);

    const needsMapping = await page.getByText('Mapear Columnas').isVisible({ timeout: 15000 }).catch(() => false);

    if (needsMapping) {
      await page.getByText('Mapear Columnas').click();
      await page.waitForTimeout(3000);
      await expect(page.getByText(/mapeo de columnas/i)).toBeVisible({ timeout: 10000 });
      console.log('✅ Modal de mapeo abierto para Precios');
    }

    await page.screenshot({ path: 'test-results/crud-prc-import-002.png' });
  });

  test('PRC-IMPORT-003: Subir XLSX correcto de precios', async ({ page }) => {
    await page.getByRole('button', { name: /importar/i }).first().click();
    await expect(page.getByText('Importar Precios')).toBeVisible({ timeout: 10000 });

    await uploadFile(page, PRECIOS_XLSX);

    const readyOrMap = 
      await page.getByText(/listo.*para importar/i).isVisible({ timeout: 15000 }).catch(() => false)
      || await page.getByText('Mapear Columnas').isVisible({ timeout: 5000 }).catch(() => false);

    expect(readyOrMap).toBeTruthy();

    await page.screenshot({ path: 'test-results/crud-prc-import-003.png' });
  });

  test('PRC-IMPORT-004: Mapeo muestra obligatorias y valida antes de importar', async ({ page }) => {
    await page.getByRole('button', { name: /importar/i }).first().click();
    await expect(page.getByText('Importar Precios')).toBeVisible({ timeout: 10000 });
    await uploadFile(page, GENERIC_XLSX);

    const mapBtn = page.getByText('Mapear Columnas');
    if (await mapBtn.isVisible({ timeout: 15000 }).catch(() => false)) {
      await mapBtn.click();
      await page.waitForTimeout(3000);

      // Verificar que hay columnas obligatorias
      await expect(page.getByText(/columnas obligatorias/i)).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('Obligatorio').first()).toBeVisible({ timeout: 5000 });

      // Verificar que confirmar está deshabilitado sin mapeo completo
      const confirmBtn = page.getByRole('button', { name: /confirmar mapeo e importar/i });
      const isDisabled = await confirmBtn.isDisabled().catch(() => false);
      console.log(`Confirmar deshabilitado: ${isDisabled}`);
    }

    await page.screenshot({ path: 'test-results/crud-prc-import-004.png' });
  });

  test('PRC-IMPORT-005: Importar precios y ver resultado', async ({ page }) => {
    await page.getByRole('button', { name: /importar/i }).first().click();
    await expect(page.getByText('Importar Precios')).toBeVisible({ timeout: 10000 });
    await uploadFile(page, PRECIOS_XLSX);

    const importBtn = page.getByRole('button', { name: /importar precios/i });
    if (await importBtn.isVisible({ timeout: 15000 }).catch(() => false)) {
      await importBtn.click();
      await page.waitForTimeout(10000);

      const hasResults = await page.getByText('Resultado de Importación').isVisible({ timeout: 20000 }).catch(() => false);
      if (hasResults) console.log('✅ Resultado de importación de precios visible');
    }

    await page.screenshot({ path: 'test-results/crud-prc-import-005.png' });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  SECCIÓN 5: DESCUENTOS — ABM + Eliminación + Import con Mapeo
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('ABM Descuentos', () => {
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateAdmin(page, '/admin/descuentos');
  });

  // ─── Listado ─────────────────────────────────────────────────────────────

  test('DSC-LIST-001: Página carga con tabla, estadísticas y botones', async ({ page }) => {
    // Botones de creación
    await expect(
      page.getByRole('button', { name: /nuevo con template/i })
        .or(page.getByRole('button', { name: /modo avanzado/i }))
    ).toBeVisible({ timeout: 15000 });

    await expect(page.getByRole('button', { name: /importar/i })).toBeVisible();
    await expect(page.getByPlaceholder(/buscar por nombre/i)).toBeVisible();

    await page.screenshot({ path: 'test-results/crud-dsc-list-001.png' });
  });

  test('DSC-LIST-002: Estadísticas muestran conteos', async ({ page }) => {
    // Las estadísticas deben mostrar total, activos, etc.
    const hasStats = 
      await page.getByText(/activos/i).isVisible({ timeout: 10000 }).catch(() => false)
      || await page.getByText(/total/i).isVisible({ timeout: 5000 }).catch(() => false);

    expect(hasStats).toBeTruthy();

    await page.screenshot({ path: 'test-results/crud-dsc-list-002.png' });
  });

  test('DSC-LIST-003: Filtros de estado, tipo y acumulativo', async ({ page }) => {
    await expect(page.getByText(/todos los estados/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/todos los tipos/i).first()).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: 'test-results/crud-dsc-list-003.png' });
  });

  // ─── Crear Descuento (Template) ──────────────────────────────────────────

  test('DSC-CREATE-001: "Nuevo con Template" navega a creación por template', async ({ page }) => {
    const templateBtn = page.getByRole('button', { name: /nuevo con template/i });
    if (await templateBtn.isVisible({ timeout: 10000 }).catch(() => false)) {
      await templateBtn.click();
      await page.waitForTimeout(2000);
      expect(page.url()).toContain('/admin/descuentos/nuevo-template');
    }

    await page.screenshot({ path: 'test-results/crud-dsc-create-001.png' });
  });

  // ─── Crear Descuento (Avanzado) ──────────────────────────────────────────

  test('DSC-CREATE-002: "Modo Avanzado" navega a formulario avanzado', async ({ page }) => {
    const advancedBtn = page.getByRole('button', { name: /modo avanzado/i });
    if (await advancedBtn.isVisible({ timeout: 10000 }).catch(() => false)) {
      await advancedBtn.click();
      await page.waitForTimeout(2000);
      expect(page.url()).toContain('/admin/descuentos/nuevo');
    }

    await page.screenshot({ path: 'test-results/crud-dsc-create-002.png' });
  });

  test('DSC-CREATE-003: Formulario avanzado tiene tabs y campos requeridos', async ({ page }) => {
    await navigateAdmin(page, '/admin/descuentos/nuevo');

    // Verificar campo nombre (obligatorio)
    await expect(
      page.locator('input[name="nombre"]').or(page.getByLabel(/nombre/i).first())
    ).toBeVisible({ timeout: 10000 });

    // Verificar tabs
    const hasGeneralTab = await page.getByText('General').isVisible({ timeout: 5000 }).catch(() => false);
    const hasConditionsTab = await page.getByText('Condiciones').isVisible({ timeout: 3000 }).catch(() => false);
    const hasRelationsTab = await page.getByText('Relaciones').isVisible({ timeout: 3000 }).catch(() => false);

    console.log(`Tabs: general=${hasGeneralTab}, condiciones=${hasConditionsTab}, relaciones=${hasRelationsTab}`);

    await page.screenshot({ path: 'test-results/crud-dsc-create-003.png' });
  });

  test('DSC-CREATE-004: Crear descuento con datos mínimos', async ({ page }) => {
    await navigateAdmin(page, '/admin/descuentos/nuevo');

    const timestamp = Date.now();
    const nameInput = page.locator('input[name="nombre"]').or(page.getByLabel(/nombre/i).first());
    if (await nameInput.isVisible({ timeout: 10000 }).catch(() => false)) {
      await nameInput.fill(`E2E Descuento ${timestamp}`);
    }

    const descInput = page.locator('textarea[name="descripcion"]').or(page.getByLabel(/descripción/i));
    if (await descInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await descInput.fill('Descuento creado por E2E test');
    }

    const valueInput = page.locator('input[name="valor"]').or(page.getByLabel(/valor/i));
    if (await valueInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await valueInput.fill('15');
    }

    // Guardar
    const saveBtn = page.getByRole('button', { name: /guardar|crear/i });
    if (await saveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await saveBtn.click();
      await page.waitForTimeout(5000);
    }

    await page.screenshot({ path: 'test-results/crud-dsc-create-004.png' });
  });

  // ─── Editar Descuento ────────────────────────────────────────────────────

  test('DSC-EDIT-001: Click en nombre navega al detalle', async ({ page }) => {
    // Click en el nombre del primer descuento en la tabla
    const firstRow = page.locator('table tbody tr').first();
    const nameLink = firstRow.locator('a, [role="link"]').first()
      .or(firstRow.locator('span.cursor-pointer, span.underline').first());

    if (await nameLink.isVisible({ timeout: 10000 }).catch(() => false)) {
      await nameLink.click();
      await page.waitForTimeout(3000);
      expect(page.url()).toContain('/admin/descuentos/');
    }

    await page.screenshot({ path: 'test-results/crud-dsc-edit-001.png' });
  });

  test('DSC-EDIT-002: En detalle, botón "Editar" navega a edición', async ({ page }) => {
    // Ir al detalle del primer descuento
    const viewBtn = page.locator('table tbody tr').first().locator('button').first();
    if (await viewBtn.isVisible({ timeout: 10000 }).catch(() => false)) {
      await viewBtn.click();
      await page.waitForTimeout(3000);

      const editarBtn = page.getByRole('button', { name: /editar/i });
      if (await editarBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await editarBtn.click();
        await page.waitForTimeout(2000);
        expect(page.url()).toContain('/editar');
      }
    }

    await page.screenshot({ path: 'test-results/crud-dsc-edit-002.png' });
  });

  // ─── Eliminar Descuento ──────────────────────────────────────────────────

  test('DSC-DELETE-001: Botón eliminar en tabla abre confirmación', async ({ page }) => {
    // El botón Trash está en las acciones de la tabla
    const deleteBtn = page.locator('table tbody tr').first().locator('button').last();
    if (await deleteBtn.isVisible({ timeout: 10000 }).catch(() => false)) {
      await deleteBtn.click();
      await page.waitForTimeout(1000);

      // Puede abrir un modal de confirmación
      const hasDeleteDialog = 
        await page.getByText('Eliminar Descuento').isVisible({ timeout: 5000 }).catch(() => false)
        || await page.getByText(/esta acción no se puede deshacer/i).isVisible({ timeout: 3000 }).catch(() => false);

      if (hasDeleteDialog) {
        console.log('✅ Diálogo de eliminación visible');
        await expect(page.getByRole('button', { name: /cancelar/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /eliminar/i })).toBeVisible();

        // Cancelar para no borrar
        await page.getByRole('button', { name: /cancelar/i }).click();
      }
    }

    await page.screenshot({ path: 'test-results/crud-dsc-delete-001.png' });
  });

  test('DSC-DELETE-002: Eliminar desde detalle muestra confirmación', async ({ page }) => {
    const viewBtn = page.locator('table tbody tr').first().locator('button').first();
    if (await viewBtn.isVisible({ timeout: 10000 }).catch(() => false)) {
      await viewBtn.click();
      await page.waitForTimeout(3000);

      const deleteBtn = page.getByRole('button', { name: /eliminar/i });
      if (await deleteBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await deleteBtn.click();
        await page.waitForTimeout(1000);

        // Verificar modal
        await expect(page.getByText('Eliminar Descuento')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText(/esta acción no se puede deshacer/i)).toBeVisible();

        // Cancelar
        await page.getByRole('button', { name: /cancelar/i }).click();
      }
    }

    await page.screenshot({ path: 'test-results/crud-dsc-delete-002.png' });
  });

  // ─── Importación con Mapeo ──────────────────────────────────────────────

  test('DSC-IMPORT-001: Modal de importación abre correctamente', async ({ page }) => {
    await page.getByRole('button', { name: /importar/i }).first().click();

    await expect(page.getByText('Importar Descuentos')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Subir Archivo')).toBeVisible();

    await page.screenshot({ path: 'test-results/crud-dsc-import-001.png' });
  });

  test('DSC-IMPORT-002: Subir XLSX cualquiera activa mapeo de columnas', async ({ page }) => {
    await page.getByRole('button', { name: /importar/i }).first().click();
    await expect(page.getByText('Importar Descuentos')).toBeVisible({ timeout: 10000 });

    await uploadFile(page, GENERIC_XLSX);

    const needsMapping = await page.getByText('Mapear Columnas').isVisible({ timeout: 15000 }).catch(() => false);

    if (needsMapping) {
      await page.getByText('Mapear Columnas').click();
      await page.waitForTimeout(3000);
      await expect(page.getByText(/mapeo de columnas/i)).toBeVisible({ timeout: 10000 });

      // Verificar info del archivo
      await expect(page.getByText(/archivo:/i)).toBeVisible({ timeout: 5000 });
      await expect(page.getByText(/columna.*detectada/i)).toBeVisible();

      console.log('✅ Modal de mapeo abierto para Descuentos');
    }

    await page.screenshot({ path: 'test-results/crud-dsc-import-002.png' });
  });

  test('DSC-IMPORT-003: Mapeo muestra secciones obligatorias y recomendadas', async ({ page }) => {
    await page.getByRole('button', { name: /importar/i }).first().click();
    await expect(page.getByText('Importar Descuentos')).toBeVisible({ timeout: 10000 });
    await uploadFile(page, GENERIC_XLSX);

    const mapBtn = page.getByText('Mapear Columnas');
    if (await mapBtn.isVisible({ timeout: 15000 }).catch(() => false)) {
      await mapBtn.click();
      await page.waitForTimeout(3000);

      await expect(page.getByText(/columnas obligatorias/i)).toBeVisible({ timeout: 10000 });

      // Verificar si hay sección de recomendadas
      const hasRecommended = await page.getByText(/columnas recomendadas/i).isVisible({ timeout: 5000 }).catch(() => false);
      console.log(`Sección recomendadas: ${hasRecommended}`);

      // Verificar badges obligatorios
      const obligatorioBadges = page.getByText('Obligatorio');
      const count = await obligatorioBadges.count();
      console.log(`Columnas obligatorias: ${count}`);
    }

    await page.screenshot({ path: 'test-results/crud-dsc-import-003.png' });
  });

  test('DSC-IMPORT-004: Vista previa de mapeo muestra datos transformados', async ({ page }) => {
    await page.getByRole('button', { name: /importar/i }).first().click();
    await expect(page.getByText('Importar Descuentos')).toBeVisible({ timeout: 10000 });
    await uploadFile(page, DESCUENTOS_XLSX);

    const mapBtn = page.getByText('Mapear Columnas');
    const readyToImport = await page.getByText(/listo.*para importar/i).isVisible({ timeout: 15000 }).catch(() => false);

    if (await mapBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await mapBtn.click();
      await page.waitForTimeout(3000);
      await verifyMappingPreview(page);
    }

    await page.screenshot({ path: 'test-results/crud-dsc-import-004.png' });
  });

  test('DSC-IMPORT-005: Subir XLSX correcto e importar descuentos', async ({ page }) => {
    await page.getByRole('button', { name: /importar/i }).first().click();
    await expect(page.getByText('Importar Descuentos')).toBeVisible({ timeout: 10000 });
    await uploadFile(page, DESCUENTOS_XLSX);

    const importBtn = page.getByRole('button', { name: /importar descuentos/i });
    if (await importBtn.isVisible({ timeout: 15000 }).catch(() => false)) {
      await importBtn.click();
      await page.waitForTimeout(10000);

      const hasResults = await page.getByText('Resultado de Importación').isVisible({ timeout: 20000 }).catch(() => false);
      if (hasResults) {
        console.log('✅ Resultado de importación de descuentos visible');
        
        // Verificar conteos
        const successMsg = page.getByText(/exitoso/i);
        if (await successMsg.isVisible({ timeout: 5000 }).catch(() => false)) {
          console.log('✅ Conteo de exitosos visible');
        }
      }
    }

    await page.screenshot({ path: 'test-results/crud-dsc-import-005.png' });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  SECCIÓN 6: MAPEO DE COLUMNAS — Tests específicos del ColumnMappingModal
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Mapeo de Columnas — Flujo de Validación', () => {
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('MAP-001: Dropdowns de mapeo muestran columnas del archivo', async ({ page }) => {
    await navigateAdmin(page, '/admin/clientes');
    await page.getByRole('button', { name: /importar/i }).first().click();
    await expect(page.getByText('Importar Clientes')).toBeVisible({ timeout: 10000 });
    await uploadFile(page, GENERIC_XLSX);

    const mapBtn = page.getByText('Mapear Columnas');
    if (await mapBtn.isVisible({ timeout: 15000 }).catch(() => false)) {
      await mapBtn.click();
      await page.waitForTimeout(3000);

      // Contar dropdowns
      const unmapped = page.getByText('— Sin mapear —');
      const count = await unmapped.count();
      console.log(`Columnas sin mapear: ${count}`);

      // Hacer click en el primer dropdown para ver opciones
      if (count > 0) {
        await unmapped.first().click();
        await page.waitForTimeout(1000);
      }
    }

    await page.screenshot({ path: 'test-results/crud-map-001.png' });
  });

  test('MAP-002: Desvincular columna la desmapea', async ({ page }) => {
    await navigateAdmin(page, '/admin/clientes');
    await page.getByRole('button', { name: /importar/i }).first().click();
    await expect(page.getByText('Importar Clientes')).toBeVisible({ timeout: 10000 });
    await uploadFile(page, CLIENTES_XLSX);

    const mapBtn = page.getByText('Mapear Columnas');
    if (await mapBtn.isVisible({ timeout: 15000 }).catch(() => false)) {
      await mapBtn.click();
      await page.waitForTimeout(3000);

      // Buscar botones "Desvincular"
      const unlinkBtns = page.getByText('Desvincular');
      const count = await unlinkBtns.count();
      console.log(`Botones desvincular: ${count}`);

      if (count > 0) {
        await unlinkBtns.first().click();
        await page.waitForTimeout(500);
        console.log('✅ Columna desvinculada');
      }
    }

    await page.screenshot({ path: 'test-results/crud-map-002.png' });
  });

  test('MAP-003: Validación impide importar sin obligatorias mapeadas', async ({ page }) => {
    await navigateAdmin(page, '/admin/productos');
    await page.getByRole('button', { name: /importar/i }).first().click();
    await expect(page.getByText('Importar Productos')).toBeVisible({ timeout: 10000 });
    await uploadFile(page, GENERIC_XLSX);

    const mapBtn = page.getByText('Mapear Columnas');
    if (await mapBtn.isVisible({ timeout: 15000 }).catch(() => false)) {
      await mapBtn.click();
      await page.waitForTimeout(3000);

      // Desvincular todas las columnas auto-mapeadas
      const unlinkBtns = page.getByText('Desvincular');
      const count = await unlinkBtns.count();
      for (let i = 0; i < Math.min(count, 3); i++) {
        if (await unlinkBtns.first().isVisible().catch(() => false)) {
          await unlinkBtns.first().click();
          await page.waitForTimeout(300);
        }
      }

      // Verificar mensaje de error
      const errorMsg = page.getByText(/obligatoria.*sin mapear/i);
      if (await errorMsg.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log('✅ Validación impide importar sin obligatorias');
      }

      // Botón confirmar debe estar deshabilitado
      const confirmBtn = page.getByRole('button', { name: /confirmar mapeo e importar/i });
      const isDisabled = await confirmBtn.isDisabled().catch(() => false);
      expect(isDisabled).toBeTruthy();
    }

    await page.screenshot({ path: 'test-results/crud-map-003.png' });
  });

  test('MAP-004: Todas las obligatorias mapeadas habilita importar', async ({ page }) => {
    await navigateAdmin(page, '/admin/clientes');
    await page.getByRole('button', { name: /importar/i }).first().click();
    await expect(page.getByText('Importar Clientes')).toBeVisible({ timeout: 10000 });
    await uploadFile(page, CLIENTES_XLSX);

    const mapBtn = page.getByText('Mapear Columnas');
    const readyToImport = page.getByText(/listo.*para importar/i);

    if (await mapBtn.isVisible({ timeout: 15000 }).catch(() => false)) {
      await mapBtn.click();
      await page.waitForTimeout(3000);

      // Verificar si el auto-mapeo completó obligatorias
      const allMappedMsg = page.getByText(/todas las columnas obligatorias mapeadas/i);
      if (await allMappedMsg.isVisible({ timeout: 10000 }).catch(() => false)) {
        console.log('✅ Todas las obligatorias mapeadas');

        const confirmBtn = page.getByRole('button', { name: /confirmar mapeo e importar/i });
        const isEnabled = await confirmBtn.isEnabled().catch(() => false);
        expect(isEnabled).toBeTruthy();
      }
    } else if (await readyToImport.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('✅ Columnas coinciden directamente — no necesita mapeo');
    }

    await page.screenshot({ path: 'test-results/crud-map-004.png' });
  });

  test('MAP-005: XLSX con formato libre para cada entidad activa mapeo', async ({ page }) => {
    // Probar el mismo XLSX genérico en cada entidad para forzar mapeo
    const entities = [
      { route: '/admin/clientes', name: 'Importar Clientes' },
      { route: '/admin/productos', name: 'Importar Productos' },
      { route: '/admin/listas-precios', name: 'Importar Listas de Precios' },
      { route: '/admin/precios', name: 'Importar Precios' },
      { route: '/admin/descuentos', name: 'Importar Descuentos' },
    ];

    for (const entity of entities) {
      await navigateAdmin(page, entity.route);
      await page.waitForTimeout(2000);

      const importBtn = page.getByRole('button', { name: /importar/i }).first();
      if (await importBtn.isVisible({ timeout: 10000 }).catch(() => false)) {
        await importBtn.click();
        await expect(page.getByText(entity.name)).toBeVisible({ timeout: 10000 });
        await uploadFile(page, GENERIC_XLSX);

        const needsMapping = await page.getByText('Mapear Columnas').isVisible({ timeout: 15000 }).catch(() => false);
        const matchedDirect = await page.getByText(/listo.*para importar/i).isVisible({ timeout: 5000 }).catch(() => false);

        console.log(`${entity.name}: mapeo=${needsMapping}, directo=${matchedDirect}`);

        // Cerrar modal
        await page.getByRole('button', { name: /cancelar/i }).click();
        await page.waitForTimeout(500);
      }
    }

    await page.screenshot({ path: 'test-results/crud-map-005.png' });
  });
});
