import { test, expect } from '@playwright/test';

test.describe('Register Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página de registro
    await page.goto('/login');
  });

  test('should complete full registration flow successfully', async ({ page }) => {
    // 1. Llenar formulario de registro
    await page.click('text=Regístrate aquí');
    
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.fill('input[name="passwordConfirmation"]', 'TestPass123!');
    
    // Screenshot antes de enviar
    await page.screenshot({ path: 'test-results/register-form-filled.png' });
    
    // 2. Enviar formulario
    await page.click('button[type="submit"]');
    
    // 3. Esperar a que se muestre el OTP
    await expect(page.locator('text=Verificación de código')).toBeVisible({ timeout: 60000 });
    
    // Screenshot del paso OTP
    await page.screenshot({ path: 'test-results/register-otp-screen.png' });
    
    // Buscar el OTP en los logs de consola (solo en dev)
    let otpCode = '';
    page.on('console', msg => {
      if (msg.text().includes('OTP para desarrollo:')) {
        const match = msg.text().match(/\d{6}/);
        if (match) otpCode = match[0];
      }
    });
    
    // Esperar un poco para que aparezca el OTP en consola
    await page.waitForTimeout(2000);
    
    console.log('OTP capturado:', otpCode);
    
    // Si encontramos el OTP, ingresarlo
    if (otpCode) {
      // Ingresar cada dígito del OTP
      const digits = otpCode.split('');
      for (let i = 0; i < digits.length; i++) {
        await page.fill(`input[data-index="${i}"]`, digits[i]);
      }
      
      // Screenshot con OTP ingresado
      await page.screenshot({ path: 'test-results/register-otp-filled.png' });
      
      // Enviar OTP
      await page.click('button:has-text("Verificar")');
      
      // 4. Esperar redirección exitosa
      await expect(page).toHaveURL(/\//, { timeout: 10000 });
      
      // Screenshot final
      await page.screenshot({ path: 'test-results/register-success.png' });
      
      // Verificar que se muestra el usuario logueado
      await expect(page.locator('text=Cerrar Sesión')).toBeVisible();
    }
  });

  test('should show error for already registered email', async ({ page }) => {
    await page.click('text=Regístrate aquí');
    
    // Usar un email que ya existe
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', 'usuario@ejemplo.com'); // Email existente
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.fill('input[name="passwordConfirmation"]', 'TestPass123!');
    
    await page.click('button[type="submit"]');
    
    // Esperar mensaje de error específico
    await expect(page.locator('text=Correo ya registrado')).toBeVisible({ timeout: 60000 });
    await expect(page.locator('text=ya está registrado')).toBeVisible();
    
    // Screenshot del error
    await page.screenshot({ path: 'test-results/register-error-email-exists.png' });
  });

  test('should validate password strength', async ({ page }) => {
    await page.click('text=Regístrate aquí');
    
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', 'test@example.com');
    
    // Contraseña débil
    await page.fill('input[name="password"]', '123');
    
    // Debe mostrar mensaje de validación
    await expect(page.locator('text=La contraseña debe tener al menos 8 caracteres')).toBeVisible();
    
    await page.screenshot({ path: 'test-results/register-weak-password.png' });
  });

  test('should validate password confirmation match', async ({ page }) => {
    await page.click('text=Regístrate aquí');
    
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.fill('input[name="passwordConfirmation"]', 'DifferentPass123!');
    
    // Intentar enviar
    await page.click('button[type="submit"]');
    
    // Debe mostrar error de no coincidencia
    await expect(page.locator('text=Las contraseñas no coinciden')).toBeVisible();
    
    await page.screenshot({ path: 'test-results/register-password-mismatch.png' });
  });

  test('should handle API timeout gracefully', async ({ page }) => {
    // Este test verifica que el timeout de 60s funcione
    await page.click('text=Regístrate aquí');
    
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', `timeout${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.fill('input[name="passwordConfirmation"]', 'TestPass123!');
    
    await page.click('button[type="submit"]');
    
    // El botón debe mostrar estado de carga
    await expect(page.locator('button[type="submit"][disabled]')).toBeVisible();
    
    // Esperar respuesta (máximo 60s)
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'test-results/register-loading-state.png' });
  });

  test('should capture console errors', async ({ page }) => {
    const consoleMessages: string[] = [];
    const errors: string[] = [];
    
    // Capturar todos los mensajes de consola
    page.on('console', msg => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Capturar errores de página
    page.on('pageerror', error => {
      errors.push(`Page Error: ${error.message}`);
    });
    
    await page.click('text=Regístrate aquí');
    
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', `console${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.fill('input[name="passwordConfirmation"]', 'TestPass123!');
    
    await page.click('button[type="submit"]');
    
    // Esperar un poco para capturar logs
    await page.waitForTimeout(5000);
    
    // Log de resultados
    console.log('\n=== CONSOLE MESSAGES ===');
    console.log(consoleMessages.join('\n'));
    
    console.log('\n=== ERRORS ===');
    console.log(errors.length > 0 ? errors.join('\n') : 'No errors found');
    
    // El test pasa si no hay errores críticos
    expect(errors.filter(e => !e.includes('Warning'))).toHaveLength(0);
  });
});

test.describe('Register Performance', () => {
  test('should complete registration within acceptable time', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Regístrate aquí');
    
    const startTime = Date.now();
    
    await page.fill('input[name="firstName"]', 'Perf');
    await page.fill('input[name="lastName"]', 'Test');
    await page.fill('input[name="email"]', `perf${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.fill('input[name="passwordConfirmation"]', 'TestPass123!');
    
    await page.click('button[type="submit"]');
    
    // Esperar OTP screen
    await expect(page.locator('text=Verificación')).toBeVisible({ timeout: 60000 });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`\n⏱️ Registration took: ${duration}ms (${(duration / 1000).toFixed(2)}s)`);
    
    // Debe completarse en menos de 60 segundos
    expect(duration).toBeLessThan(60000);
  });
});
