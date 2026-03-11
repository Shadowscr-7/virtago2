/**
 * Script para exportar los casos de prueba de Playwright a un archivo XLSX.
 *
 * Uso:
 *   npx tsx tests/export-tests-to-xlsx.ts
 *
 * Genera:
 *   tests/reports/casos_de_prueba_e2e_<fecha>.xlsx
 */

import ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface TestCase {
  id: string;
  suite: string;
  subSuite: string;
  testName: string;
  description: string;
  steps: string;
  expectedResult: string;
  type: 'Funcional' | 'Validación' | 'Navegación' | 'Rendimiento' | 'UI/UX';
  priority: 'Alta' | 'Media' | 'Baja';
  file: string;
}

// ─── Definición manual detallada de los casos de prueba ──────────────────────

const TEST_CASES: TestCase[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // homepage.spec.ts
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'HP-001',
    suite: 'Virtago Homepage',
    subSuite: '',
    testName: 'Carga exitosa de homepage',
    description: 'Verifica que la página principal carga correctamente con título visible y título del documento.',
    steps: [
      '1. Navegar a la URL raíz (/)',
      '2. Verificar que el h1 contiene "Bienvenido a Virtago"',
      '3. Verificar que el <title> del documento contiene "Virtago"',
    ].join('\n'),
    expectedResult: 'La página carga, se muestra el título principal y el título del documento es correcto.',
    type: 'Funcional',
    priority: 'Alta',
    file: 'homepage.spec.ts',
  },
  {
    id: 'HP-002',
    suite: 'Virtago Homepage',
    subSuite: '',
    testName: 'Navegación responsive',
    description: 'Verifica que el elemento de navegación (<nav>) está visible en la página principal.',
    steps: [
      '1. Navegar a /',
      '2. Verificar que el elemento <nav> está visible',
    ].join('\n'),
    expectedResult: 'El componente de navegación está presente y visible.',
    type: 'UI/UX',
    priority: 'Media',
    file: 'homepage.spec.ts',
  },
  {
    id: 'HP-003',
    suite: 'Chat System',
    subSuite: '',
    testName: 'Botón de chat visible',
    description: 'Verifica que el botón flotante de chat está presente en la página principal.',
    steps: [
      '1. Navegar a /',
      '2. Esperar a que la red esté inactiva (networkidle)',
      '3. Buscar botón de chat por data-testid o por texto "chat/mensaje"',
    ].join('\n'),
    expectedResult: 'El botón de chat flotante es localizable en la página.',
    type: 'UI/UX',
    priority: 'Baja',
    file: 'homepage.spec.ts',
  },
  {
    id: 'HP-004',
    suite: 'Theme System',
    subSuite: '',
    testName: 'Tema por defecto aplicado',
    description: 'Verifica que el body tiene la clase CSS del tema por defecto (font-sans).',
    steps: [
      '1. Navegar a /',
      '2. Verificar que <body> tiene la clase "font-sans"',
    ].join('\n'),
    expectedResult: 'El tema visual por defecto está correctamente aplicado.',
    type: 'UI/UX',
    priority: 'Baja',
    file: 'homepage.spec.ts',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // register.spec.ts
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'REG-001',
    suite: 'Register Flow',
    subSuite: '',
    testName: 'Flujo completo de registro exitoso',
    description:
      'Verifica el flujo completo de registro: formulario → OTP → verificación → autenticación.',
    steps: [
      '1. Navegar a /login',
      '2. Click en "Regístrate aquí"',
      '3. Llenar firstName, lastName, email (único), password, passwordConfirmation',
      '4. Captura de pantalla del formulario lleno',
      '5. Click en submit',
      '6. Esperar pantalla de "Verificación de código" (hasta 60s)',
      '7. Captura de pantalla de la pantalla OTP',
      '8. Capturar OTP de los logs de consola (modo dev)',
      '9. Ingresar cada dígito del OTP en inputs data-index',
      '10. Captura de pantalla con OTP ingresado',
      '11. Click en "Verificar"',
      '12. Esperar redirección a /',
      '13. Verificar que "Cerrar Sesión" está visible',
    ].join('\n'),
    expectedResult:
      'El usuario se registra exitosamente, verifica su email con OTP y es redirigido autenticado.',
    type: 'Funcional',
    priority: 'Alta',
    file: 'register.spec.ts',
  },
  {
    id: 'REG-002',
    suite: 'Register Flow',
    subSuite: '',
    testName: 'Error por email ya registrado',
    description: 'Verifica que al intentar registrarse con un email ya existente se muestra un error.',
    steps: [
      '1. Navegar a /login → "Regístrate aquí"',
      '2. Llenar formulario con email existente (usuario@ejemplo.com)',
      '3. Click en submit',
      '4. Esperar mensaje "Correo ya registrado" y "ya está registrado" (hasta 60s)',
      '5. Captura de pantalla del error',
    ].join('\n'),
    expectedResult: 'Se muestra mensaje de error indicando que el correo ya está registrado.',
    type: 'Validación',
    priority: 'Alta',
    file: 'register.spec.ts',
  },
  {
    id: 'REG-003',
    suite: 'Register Flow',
    subSuite: '',
    testName: 'Validación de fortaleza de contraseña',
    description: 'Verifica que una contraseña débil (ej: "123") muestra mensaje de validación.',
    steps: [
      '1. Navegar a /login → "Regístrate aquí"',
      '2. Llenar datos con contraseña "123"',
      '3. Verificar que aparece "La contraseña debe tener al menos 8 caracteres"',
      '4. Captura de pantalla',
    ].join('\n'),
    expectedResult: 'Se muestra mensaje de validación sobre contraseña débil.',
    type: 'Validación',
    priority: 'Alta',
    file: 'register.spec.ts',
  },
  {
    id: 'REG-004',
    suite: 'Register Flow',
    subSuite: '',
    testName: 'Validación de coincidencia de contraseñas',
    description:
      'Verifica que si password y passwordConfirmation no coinciden, se muestra un error.',
    steps: [
      '1. Navegar a /login → "Regístrate aquí"',
      '2. Ingresar password "TestPass123!" y confirmación "DifferentPass123!"',
      '3. Click en submit',
      '4. Verificar que aparece "Las contraseñas no coinciden"',
      '5. Captura de pantalla',
    ].join('\n'),
    expectedResult: 'Se muestra error de no coincidencia de contraseñas.',
    type: 'Validación',
    priority: 'Alta',
    file: 'register.spec.ts',
  },
  {
    id: 'REG-005',
    suite: 'Register Flow',
    subSuite: '',
    testName: 'Manejo de timeout de API',
    description:
      'Verifica que durante el envío del formulario se muestra estado de carga (botón disabled).',
    steps: [
      '1. Navegar a /login → "Regístrate aquí"',
      '2. Llenar formulario con datos válidos',
      '3. Click en submit',
      '4. Verificar que el botón submit está deshabilitado (estado loading)',
      '5. Esperar 3s y capturar pantalla',
    ].join('\n'),
    expectedResult: 'El botón muestra estado de carga mientras la API procesa la solicitud.',
    type: 'Funcional',
    priority: 'Media',
    file: 'register.spec.ts',
  },
  {
    id: 'REG-006',
    suite: 'Register Flow',
    subSuite: '',
    testName: 'Captura de errores de consola',
    description:
      'Verifica que durante el flujo de registro no se producen errores críticos en la consola del navegador.',
    steps: [
      '1. Configurar listeners para console.log y page errors',
      '2. Navegar a /login → "Regístrate aquí"',
      '3. Llenar formulario y enviar',
      '4. Esperar 5s para capturar logs',
      '5. Filtrar errores quitando Warnings',
      '6. Verificar que no hay errores (length === 0)',
    ].join('\n'),
    expectedResult: 'No se detectan errores críticos en la consola del navegador.',
    type: 'Funcional',
    priority: 'Media',
    file: 'register.spec.ts',
  },
  {
    id: 'REG-007',
    suite: 'Register Performance',
    subSuite: '',
    testName: 'Registro completa en tiempo aceptable',
    description:
      'Mide el tiempo desde el llenado del formulario hasta la pantalla de OTP y verifica que sea < 60s.',
    steps: [
      '1. Navegar a /login → "Regístrate aquí"',
      '2. Marcar startTime',
      '3. Llenar formulario y enviar',
      '4. Esperar pantalla "Verificación" (hasta 60s)',
      '5. Calcular duración',
      '6. Verificar que duration < 60000ms',
    ].join('\n'),
    expectedResult: 'El proceso de registro (hasta OTP) completa en menos de 60 segundos.',
    type: 'Rendimiento',
    priority: 'Media',
    file: 'register.spec.ts',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // onboarding-distributor.spec.ts — Flujo completo
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'DIST-001',
    suite: 'Onboarding Distribuidor — Flujo Completo',
    subSuite: '',
    testName: 'Registro completo de distribuidor (7 pasos)',
    description:
      'Flujo end-to-end completo de registro de distribuidor: registro → OTP → tipo usuario → info personal → info empresa → selección plan → éxito. Timeout: 180s.',
    steps: [
      'PASO 1 — Formulario de registro:',
      '  1. Navegar a /login',
      '  2. Click "Regístrate aquí"',
      '  3. Llenar firstName, lastName, email único, password, passwordConfirmation',
      '  4. Screenshot → Click "Continuar"',
      '',
      'PASO 2 — Verificación OTP:',
      '  5. Esperar heading "Verificar email"',
      '  6. Verificar que se muestra el email correcto',
      '  7. Capturar OTP de la respuesta HTTP del backend',
      '  8. Ingresar OTP en inputs .otp-input',
      '  9. Click "Verificar código" → Esperar "código verificado"',
      '',
      'PASO 3 — Selección tipo de usuario:',
      '  10. Esperar heading "Tipo de usuario"',
      '  11. Verificar cards "Cliente" y "Distribuidor" visibles',
      '  12. Click en card "Distribuidor"',
      '  13. Verificar estilo de selección (border-purple/selected/ring)',
      '  14. Click "Continuar"',
      '',
      'PASO 4 — Información personal:',
      '  15. Esperar heading "Información personal"',
      '  16. Verificar que firstName y lastName están prellenados',
      '  17. Llenar phone, birthDate, address, city',
      '  18. Verificar que country tiene "Uruguay" por defecto',
      '  19. Click "Continuar" → Esperar toast "información personal guardada"',
      '',
      'PASO 5 — Información de empresa:',
      '  20. Esperar heading "Información de empresa"',
      '  21. Llenar businessName, businessType, ruc, distributorCode, businessPhone, businessEmail, website, businessAddress, businessCity, yearsInBusiness, numberOfEmployees, description',
      '  22. Click "Continuar a selección de plan" → Esperar toast éxito',
      '',
      'PASO 6 — Selección de plan:',
      '  23. Esperar heading "Elige tu plan"',
      '  24. Esperar a que no aparezca "Cargando planes"',
      '  25. Verificar que hay al menos 1 plan disponible',
      '  26. Seleccionar plan "Más Popular" o el primero',
      '  27. Click "Completar registro"',
      '',
      'PASO 7 — Registro completado:',
      '  28. Esperar heading "Registro completado"',
      '  29. Verificar nombre completo, tipo "distribuidor", email',
      '  30. Verificar beneficios: "precios mayoristas", "dashboard de ventas"',
      '  31. Click "Comenzar a explorar" o esperar redirección automática',
      '  32. Verificar que se está autenticado',
    ].join('\n'),
    expectedResult:
      'El distribuidor se registra exitosamente pasando por los 7 pasos y llega a la página principal autenticado.',
    type: 'Funcional',
    priority: 'Alta',
    file: 'onboarding-distributor.spec.ts',
  },

  // ─── Validaciones Paso 1 ───
  {
    id: 'DIST-002',
    suite: 'Onboarding Distribuidor — Flujo Completo',
    subSuite: 'Paso 1 — Formulario: validaciones',
    testName: 'Campos vacíos no permiten continuar',
    description: 'Verifica que no se puede avanzar si los campos del formulario están vacíos.',
    steps: [
      '1. Navegar a /login → "Regístrate aquí"',
      '2. Click en "Continuar" sin llenar campos',
      '3. Verificar que aparece "nombre requerido" o "al menos 2 caracteres"',
      '4. Captura de pantalla',
    ].join('\n'),
    expectedResult: 'Se muestran mensajes de validación impidiendo continuar.',
    type: 'Validación',
    priority: 'Alta',
    file: 'onboarding-distributor.spec.ts',
  },
  {
    id: 'DIST-003',
    suite: 'Onboarding Distribuidor — Flujo Completo',
    subSuite: 'Paso 1 — Formulario: validaciones',
    testName: 'Contraseña débil muestra error',
    description: 'Verifica que una contraseña de "123" genera error de validación.',
    steps: [
      '1. Navegar a /login → "Regístrate aquí"',
      '2. Llenar datos con password "123"',
      '3. Click "Continuar"',
      '4. Verificar mensaje "al menos 8 caracteres"',
    ].join('\n'),
    expectedResult: 'Se muestra error de contraseña débil.',
    type: 'Validación',
    priority: 'Alta',
    file: 'onboarding-distributor.spec.ts',
  },
  {
    id: 'DIST-004',
    suite: 'Onboarding Distribuidor — Flujo Completo',
    subSuite: 'Paso 1 — Formulario: validaciones',
    testName: 'Contraseñas no coinciden muestra error',
    description:
      'Verifica que si password y confirmación son diferentes se muestra error.',
    steps: [
      '1. Navegar a /login → "Regístrate aquí"',
      '2. Ingresar password "TestPass123!" y confirmación "OtherPass123!"',
      '3. Click "Continuar"',
      '4. Verificar mensaje "contraseñas no coinciden"',
    ].join('\n'),
    expectedResult: 'Se muestra error de no coincidencia de contraseñas.',
    type: 'Validación',
    priority: 'Alta',
    file: 'onboarding-distributor.spec.ts',
  },
  {
    id: 'DIST-005',
    suite: 'Onboarding Distribuidor — Flujo Completo',
    subSuite: 'Paso 1 — Formulario: validaciones',
    testName: 'Email inválido muestra error',
    description: 'Verifica que un email con formato incorrecto genera error.',
    steps: [
      '1. Navegar a /login → "Regístrate aquí"',
      '2. Ingresar email "not-an-email"',
      '3. Llenar demás datos y click "Continuar"',
      '4. Verificar mensaje "email inválido"',
    ].join('\n'),
    expectedResult: 'Se muestra error de email inválido.',
    type: 'Validación',
    priority: 'Alta',
    file: 'onboarding-distributor.spec.ts',
  },

  // ─── Validaciones Paso 2 (OTP) ───
  {
    id: 'DIST-006',
    suite: 'Onboarding Distribuidor — Flujo Completo',
    subSuite: 'Paso 2 — OTP: validaciones',
    testName: 'OTP incorrecto muestra error',
    description:
      'Verifica que al ingresar un OTP incorrecto (000000) se muestra mensaje de error.',
    steps: [
      '1. Completar registro hasta pantalla OTP',
      '2. Ingresar OTP "000000" (incorrecto)',
      '3. Click "Verificar código"',
      '4. Verificar mensaje "código incorrecto/error/inválido"',
      '5. Captura de pantalla',
    ].join('\n'),
    expectedResult: 'Se muestra error de código incorrecto.',
    type: 'Validación',
    priority: 'Alta',
    file: 'onboarding-distributor.spec.ts',
  },

  // ─── Validaciones Paso 3 ───
  {
    id: 'DIST-007',
    suite: 'Onboarding Distribuidor — Flujo Completo',
    subSuite: 'Paso 3 — Tipo usuario: validaciones',
    testName: 'No se puede continuar sin seleccionar tipo',
    description:
      'Verifica que el botón Continuar está deshabilitado si no se selecciona un tipo de usuario.',
    steps: [
      '1. Llegar al paso 3 (registro + OTP)',
      '2. Verificar heading "Tipo de usuario"',
      '3. Sin seleccionar nada, verificar que botón "Continuar" está disabled',
      '4. Captura de pantalla',
    ].join('\n'),
    expectedResult: 'El botón Continuar está deshabilitado sin selección.',
    type: 'Validación',
    priority: 'Alta',
    file: 'onboarding-distributor.spec.ts',
  },

  // ─── Validaciones Paso 4 ───
  {
    id: 'DIST-008',
    suite: 'Onboarding Distribuidor — Flujo Completo',
    subSuite: 'Paso 4 — Info personal: validaciones',
    testName: 'Campos vacíos en info personal muestran errores',
    description:
      'Verifica que al borrar los campos prellenados e intentar continuar se muestran errores.',
    steps: [
      '1. Navegar hasta paso 4 (registro + OTP + tipo distribuidor)',
      '2. Limpiar firstName y lastName (prellenados)',
      '3. Click "Continuar"',
      '4. Verificar mensaje "al menos 2 caracteres"',
      '5. Captura de pantalla',
    ].join('\n'),
    expectedResult: 'Se muestran errores de validación en campos requeridos.',
    type: 'Validación',
    priority: 'Alta',
    file: 'onboarding-distributor.spec.ts',
  },
  {
    id: 'DIST-009',
    suite: 'Onboarding Distribuidor — Flujo Completo',
    subSuite: 'Paso 4 — Info personal: validaciones',
    testName: 'Teléfono corto muestra error',
    description: 'Verifica que un teléfono con menos de 10 dígitos genera error.',
    steps: [
      '1. Navegar hasta paso 4',
      '2. Ingresar teléfono "12345"',
      '3. Llenar demás campos y click "Continuar"',
      '4. Verificar mensaje "al menos 10 dígitos"',
    ].join('\n'),
    expectedResult: 'Se muestra error de teléfono con formato incorrecto.',
    type: 'Validación',
    priority: 'Media',
    file: 'onboarding-distributor.spec.ts',
  },

  // ─── Validaciones Paso 5 ───
  {
    id: 'DIST-010',
    suite: 'Onboarding Distribuidor — Flujo Completo',
    subSuite: 'Paso 5 — Info empresa: validaciones',
    testName: 'RUC corto muestra error de validación',
    description:
      'Verifica que un RUC con menos de 11 caracteres genera error de validación.',
    steps: [
      '1. Navegar hasta paso 5 (registro + OTP + tipo + info personal)',
      '2. Llenar todos los campos de empresa con RUC "123" (muy corto)',
      '3. Click "Continuar a selección de plan"',
      '4. Verificar mensaje "al menos 11 caracteres"',
      '5. Captura de pantalla',
    ].join('\n'),
    expectedResult: 'Se muestra error de RUC con longitud insuficiente.',
    type: 'Validación',
    priority: 'Media',
    file: 'onboarding-distributor.spec.ts',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // onboarding-distributor.spec.ts — Navegación
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'DIST-011',
    suite: 'Onboarding Distribuidor — Navegación',
    subSuite: '',
    testName: 'Botón atrás en OTP vuelve al formulario',
    description:
      'Verifica que el botón "atrás" en la pantalla de OTP regresa al formulario de registro o al login.',
    steps: [
      '1. Completar registro hasta pantalla OTP',
      '2. Click en botón atrás (primer botón con SVG)',
      '3. Verificar que se muestra input firstName o heading "Iniciar sesión"',
      '4. Captura de pantalla',
    ].join('\n'),
    expectedResult: 'Se regresa correctamente al paso anterior.',
    type: 'Navegación',
    priority: 'Media',
    file: 'onboarding-distributor.spec.ts',
  },
  {
    id: 'DIST-012',
    suite: 'Onboarding Distribuidor — Navegación',
    subSuite: '',
    testName: 'Botón atrás en selección de tipo mantiene estado',
    description:
      'Verifica que al seleccionar "Distribuidor" y presionar atrás, el estado se mantiene.',
    steps: [
      '1. Completar registro + OTP hasta paso 3 (tipo usuario)',
      '2. Seleccionar card "Distribuidor"',
      '3. Verificar estilo de selección (border-purple/selected/ring)',
      '4. Captura de pantalla del estado',
    ].join('\n'),
    expectedResult: 'La selección de tipo de usuario se mantiene correctamente.',
    type: 'Navegación',
    priority: 'Media',
    file: 'onboarding-distributor.spec.ts',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // onboarding-distributor.spec.ts — Rendimiento
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'DIST-013',
    suite: 'Onboarding Distribuidor — Rendimiento',
    subSuite: '',
    testName: 'Registro inicial completa en menos de 30s',
    description:
      'Mide el tiempo del paso 1 (formulario → pantalla OTP) y verifica que sea < 30 segundos.',
    steps: [
      '1. Navegar a /login → "Regístrate aquí"',
      '2. Marcar timestamp de inicio',
      '3. Llenar formulario y click "Continuar"',
      '4. Esperar heading "Verificar email"',
      '5. Calcular duración',
      '6. Verificar duration < 30000ms',
    ].join('\n'),
    expectedResult: 'El paso de registro completa en menos de 30 segundos.',
    type: 'Rendimiento',
    priority: 'Media',
    file: 'onboarding-distributor.spec.ts',
  },
  {
    id: 'DIST-014',
    suite: 'Onboarding Distribuidor — Rendimiento',
    subSuite: '',
    testName: 'No hay errores de consola durante el flujo',
    description:
      'Monitorea la consola del navegador durante el flujo de registro y verifica que no haya errores críticos.',
    steps: [
      '1. Configurar listeners para console.error y page errors',
      '2. Navegar a /login → "Regístrate aquí"',
      '3. Llenar formulario y enviar',
      '4. Esperar 5s para capturar logs',
      '5. Filtrar errores (excluir Warning, DevTools, favicon, hydration)',
      '6. Verificar que errores críticos = 0',
    ].join('\n'),
    expectedResult: 'No se detectan errores críticos en la consola del navegador.',
    type: 'Rendimiento',
    priority: 'Media',
    file: 'onboarding-distributor.spec.ts',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // wizard-setup.spec.ts — Landing
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'WIZ-LAND-001',
    suite: 'Wizard Setup',
    subSuite: 'Landing',
    testName: 'Página carga con 4 cards',
    description: 'Verifica que la página de configuración rápida carga con las 4 cards y el botón de inicio.',
    steps: [
      '1. Login como admin',
      '2. Navegar a /admin/configuracion-rapida',
      '3. Verificar título "Configuración Rápida"',
      '4. Verificar cards: Clientes, Productos, Precios, Listas de Precios',
      '5. Verificar botón "Iniciar Configuración Guiada"',
    ].join('\n'),
    expectedResult: 'Se muestran las 4 cards de setup y el botón de inicio del wizard.',
    type: 'Funcional',
    priority: 'Alta',
    file: 'wizard-setup.spec.ts',
  },
  {
    id: 'WIZ-LAND-002',
    suite: 'Wizard Setup',
    subSuite: 'Landing',
    testName: 'Botón abre el wizard',
    description: 'Verificar que al hacer click en "Iniciar Configuración Guiada" se abre el wizard con el paso 1.',
    steps: [
      '1. Login como admin',
      '2. Navegar a /admin/configuracion-rapida',
      '3. Click en "Iniciar Configuración Guiada"',
      '4. Verificar que aparece "Paso 1 de 6" y la sección Clientes',
    ].join('\n'),
    expectedResult: 'El wizard se abre mostrando el primer paso (Clientes).',
    type: 'Funcional',
    priority: 'Alta',
    file: 'wizard-setup.spec.ts',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // wizard-setup.spec.ts — Navegación
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'WIZ-NAV-001',
    suite: 'Wizard Setup',
    subSuite: 'Navegación',
    testName: 'Muestra 6 pasos en indicador',
    description: 'Verifica que el indicador de progreso muestra los 6 pasos del wizard.',
    steps: [
      '1. Abrir wizard',
      '2. Verificar textos: Clientes, Productos, Listas de Precios, Precios, Descuentos, Revisar',
    ].join('\n'),
    expectedResult: 'Los 6 nombres de pasos son visibles en el indicador.',
    type: 'UI/UX',
    priority: 'Media',
    file: 'wizard-setup.spec.ts',
  },
  {
    id: 'WIZ-NAV-002',
    suite: 'Wizard Setup',
    subSuite: 'Navegación',
    testName: 'Paso actual muestra contador',
    description: 'Verifica que se muestra "Paso N de 6" indicando el paso actual.',
    steps: [
      '1. Abrir wizard',
      '2. Verificar texto "Paso 1 de 6"',
    ].join('\n'),
    expectedResult: 'Se muestra correctamente el contador de pasos.',
    type: 'UI/UX',
    priority: 'Media',
    file: 'wizard-setup.spec.ts',
  },
  {
    id: 'WIZ-NAV-003',
    suite: 'Wizard Setup',
    subSuite: 'Navegación',
    testName: 'No se pueden click pasos futuros',
    description: 'Verifica que al intentar hacer click en un paso futuro, el wizard no avanza.',
    steps: [
      '1. Abrir wizard en paso 1',
      '2. Click en "Listas de Precios" (paso 3)',
      '3. Verificar que sigue en "Paso 1 de 6"',
    ].join('\n'),
    expectedResult: 'El wizard no permite saltar a pasos futuros.',
    type: 'Validación',
    priority: 'Media',
    file: 'wizard-setup.spec.ts',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // wizard-setup.spec.ts — Clientes (Step 1)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'WIZ-CLI-001',
    suite: 'Wizard Setup',
    subSuite: 'Step 1: Clientes',
    testName: 'Zona de carga con tabs',
    description: 'Verifica que el paso 1 muestra la zona de upload con tabs Archivo y JSON.',
    steps: [
      '1. Abrir wizard en paso 1',
      '2. Verificar tabs "Subir Archivo" y "Importar JSON"',
      '3. Verificar zona de drag & drop',
    ].join('\n'),
    expectedResult: 'Se muestran ambas tabs y la zona de drag & drop.',
    type: 'UI/UX',
    priority: 'Alta',
    file: 'wizard-setup.spec.ts',
  },
  {
    id: 'WIZ-CLI-002',
    suite: 'Wizard Setup',
    subSuite: 'Step 1: Clientes',
    testName: 'XLSX muestra preview correcta',
    description: 'Sube XLSX de clientes (3 registros) y verifica que la preview muestra los datos.',
    steps: [
      '1. Abrir wizard en paso 1',
      '2. Subir clientes_test.xlsx via input[type="file"]',
      '3. Esperar procesamiento del archivo',
      '4. Verificar que aparece la vista de preview',
      '5. Verificar que los nombres de clientes son visibles',
    ].join('\n'),
    expectedResult: 'La preview muestra los 3 clientes del archivo XLSX.',
    type: 'Funcional',
    priority: 'Alta',
    file: 'wizard-setup.spec.ts',
  },
  {
    id: 'WIZ-CLI-003',
    suite: 'Wizard Setup',
    subSuite: 'Step 1: Clientes',
    testName: 'Preview muestra estadísticas',
    description: 'Verifica que la preview muestra resumen de clientes con estadísticas.',
    steps: [
      '1. Subir XLSX de clientes',
      '2. Esperar preview',
      '3. Verificar texto "resumen de clientes"',
    ].join('\n'),
    expectedResult: 'Se muestra un resumen con estadísticas de los clientes importados.',
    type: 'Funcional',
    priority: 'Media',
    file: 'wizard-setup.spec.ts',
  },
  {
    id: 'WIZ-CLI-004',
    suite: 'Wizard Setup',
    subSuite: 'Step 1: Clientes',
    testName: 'Botón confirmar visible en preview',
    description: 'Verifica que el botón "Confirmar y Continuar" aparece tras la preview.',
    steps: [
      '1. Subir XLSX de clientes',
      '2. Esperar preview',
      '3. Verificar botón "Confirmar y Continuar"',
    ].join('\n'),
    expectedResult: 'El botón de confirmación es visible y clickeable.',
    type: 'Funcional',
    priority: 'Alta',
    file: 'wizard-setup.spec.ts',
  },
  {
    id: 'WIZ-CLI-005',
    suite: 'Wizard Setup',
    subSuite: 'Step 1: Clientes',
    testName: 'Recargar otros datos desde preview',
    description: 'Verifica que se puede volver a la vista de upload desde la preview.',
    steps: [
      '1. Subir XLSX de clientes',
      '2. Click en "Cargar Otros Datos"',
      '3. Verificar que vuelve a la vista de upload',
    ].join('\n'),
    expectedResult: 'Se regresa a la zona de upload para seleccionar otro archivo.',
    type: 'Funcional',
    priority: 'Media',
    file: 'wizard-setup.spec.ts',
  },
  {
    id: 'WIZ-CLI-006',
    suite: 'Wizard Setup',
    subSuite: 'Step 1: Clientes',
    testName: 'Confirmar envía datos al backend',
    description: 'Verifica que confirmar los clientes importados los envía al backend.',
    steps: [
      '1. Subir XLSX de clientes',
      '2. Esperar preview',
      '3. Click "Confirmar y Continuar"',
      '4. Verificar procesamiento o avance al paso 2',
    ].join('\n'),
    expectedResult: 'Los datos se envían al backend y se avanza al paso 2.',
    type: 'Funcional',
    priority: 'Alta',
    file: 'wizard-setup.spec.ts',
  },
  {
    id: 'WIZ-CLI-007',
    suite: 'Wizard Setup',
    subSuite: 'Step 1: Clientes',
    testName: 'Importar clientes via JSON',
    description: 'Verifica que se pueden importar clientes pegando un JSON.',
    steps: [
      '1. Click en tab "Importar JSON"',
      '2. Pegar JSON con datos de cliente',
      '3. Click "Cargar Datos"',
      '4. Verificar que se procesan los datos',
    ].join('\n'),
    expectedResult: 'Los clientes del JSON se cargan correctamente.',
    type: 'Funcional',
    priority: 'Media',
    file: 'wizard-setup.spec.ts',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // wizard-setup.spec.ts — Productos (Step 2)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'WIZ-PROD-001',
    suite: 'Wizard Setup',
    subSuite: 'Step 2: Productos',
    testName: 'Zona de upload p/ productos',
    description: 'Verifica que el paso 2 muestra la zona de upload para productos.',
    steps: [
      '1. Avanzar al paso 2',
      '2. Verificar zona de upload visible',
    ].join('\n'),
    expectedResult: 'La zona de upload está visible para productos.',
    type: 'UI/UX',
    priority: 'Alta',
    file: 'wizard-setup.spec.ts',
  },
  {
    id: 'WIZ-PROD-002',
    suite: 'Wizard Setup',
    subSuite: 'Step 2: Productos',
    testName: 'XLSX muestra matching',
    description: 'Sube XLSX de productos y verifica que el proceso de matching muestra resultados.',
    steps: [
      '1. Subir productos_test.xlsx',
      '2. Esperar matching (puede tardar por IA)',
      '3. Verificar que aparecen nombres de productos',
    ].join('\n'),
    expectedResult: 'El matching muestra los 5 productos del archivo con sus campos.',
    type: 'Funcional',
    priority: 'Alta',
    file: 'wizard-setup.spec.ts',
  },
  {
    id: 'WIZ-PROD-003',
    suite: 'Wizard Setup',
    subSuite: 'Step 2: Productos',
    testName: 'Preview muestra brand/categoría',
    description: 'Verifica que el matching muestra marcas y categorías de los productos.',
    steps: [
      '1. Subir productos_test.xlsx',
      '2. Esperar matching',
      '3. Verificar datos de brand "TechPro" y categoría "Computadoras"',
    ].join('\n'),
    expectedResult: 'Las marcas y categorías se muestran correctamente en el matching.',
    type: 'Funcional',
    priority: 'Media',
    file: 'wizard-setup.spec.ts',
  },
  {
    id: 'WIZ-PROD-004',
    suite: 'Wizard Setup',
    subSuite: 'Step 2: Productos',
    testName: 'Confirmar tras matching',
    description: 'Verifica que el botón de confirmar aparece después del matching.',
    steps: [
      '1. Subir productos_test.xlsx',
      '2. Esperar matching completo',
      '3. Verificar botón "Confirmar y Continuar"',
    ].join('\n'),
    expectedResult: 'El botón de confirmación es visible tras el matching.',
    type: 'Funcional',
    priority: 'Alta',
    file: 'wizard-setup.spec.ts',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // wizard-setup.spec.ts — Listas de Precios (Step 3)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'WIZ-PL-001',
    suite: 'Wizard Setup',
    subSuite: 'Step 3: Listas de Precios',
    testName: 'Zona de upload para listas',
    description: 'Verifica que el paso 3 muestra la zona de upload para listas de precios.',
    steps: [
      '1. Avanzar al paso 3',
      '2. Verificar texto "Listas de Precios"',
      '3. Verificar zona de upload',
    ].join('\n'),
    expectedResult: 'La zona de upload está visible para listas de precios.',
    type: 'UI/UX',
    priority: 'Alta',
    file: 'wizard-setup.spec.ts',
  },
  {
    id: 'WIZ-PL-002',
    suite: 'Wizard Setup',
    subSuite: 'Step 3: Listas de Precios',
    testName: 'XLSX muestra preview de listas',
    description: 'Sube XLSX de listas y verifica que la preview muestra los datos correctamente.',
    steps: [
      '1. Subir listas_precios_test.xlsx',
      '2. Esperar preview',
      '3. Verificar nombre "Lista Premium E2E Test"',
    ].join('\n'),
    expectedResult: 'La preview muestra las 2 listas del archivo XLSX.',
    type: 'Funcional',
    priority: 'Alta',
    file: 'wizard-setup.spec.ts',
  },
  {
    id: 'WIZ-PL-003',
    suite: 'Wizard Setup',
    subSuite: 'Step 3: Listas de Precios',
    testName: 'Preview muestra resumen',
    description: 'Verifica que la preview muestra un resumen con conteo de listas.',
    steps: [
      '1. Subir XLSX de listas',
      '2. Verificar que se muestra "Resumen"',
    ].join('\n'),
    expectedResult: 'El resumen con conteo de listas es visible.',
    type: 'Funcional',
    priority: 'Media',
    file: 'wizard-setup.spec.ts',
  },
  {
    id: 'WIZ-PL-004',
    suite: 'Wizard Setup',
    subSuite: 'Step 3: Listas de Precios',
    testName: 'Cards con info de cada lista',
    description: 'Verifica que las cards de preview muestran detalles como tipo, moneda, estado.',
    steps: [
      '1. Subir XLSX',
      '2. Verificar detalles: wholesale, USD, active',
    ].join('\n'),
    expectedResult: 'Los detalles de cada lista son visibles en las cards.',
    type: 'Funcional',
    priority: 'Media',
    file: 'wizard-setup.spec.ts',
  },
  {
    id: 'WIZ-PL-005',
    suite: 'Wizard Setup',
    subSuite: 'Step 3: Listas de Precios',
    testName: 'Confirmar envía al backend',
    description: 'Verifica que confirmar las listas las envía al backend correctamente.',
    steps: [
      '1. Subir XLSX de listas',
      '2. Click "Confirmar y Continuar"',
      '3. Verificar procesamiento o avance al paso 4',
    ].join('\n'),
    expectedResult: 'Las listas se envían al backend y se avanza al siguiente paso.',
    type: 'Funcional',
    priority: 'Alta',
    file: 'wizard-setup.spec.ts',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // wizard-setup.spec.ts — Precios (Step 4)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'WIZ-PRC-001',
    suite: 'Wizard Setup',
    subSuite: 'Step 4: Precios',
    testName: 'Zona de upload con tabs',
    description: 'Verifica que el paso 4 muestra tabs Archivo y JSON para precios.',
    steps: [
      '1. Avanzar al paso 4',
      '2. Verificar tabs "Subir Archivo" e "Importar JSON"',
    ].join('\n'),
    expectedResult: 'Las tabs de Archivo y JSON son visibles.',
    type: 'UI/UX',
    priority: 'Alta',
    file: 'wizard-setup.spec.ts',
  },
  {
    id: 'WIZ-PRC-002',
    suite: 'Wizard Setup',
    subSuite: 'Step 4: Precios',
    testName: 'XLSX muestra preview de precios',
    description: 'Sube XLSX de precios (7 registros) y verifica la vista de preview.',
    steps: [
      '1. Subir precios_test.xlsx',
      '2. Esperar preview',
      '3. Verificar datos de productos con precio',
    ].join('\n'),
    expectedResult: 'La preview muestra los 7 precios del archivo XLSX.',
    type: 'Funcional',
    priority: 'Alta',
    file: 'wizard-setup.spec.ts',
  },
  {
    id: 'WIZ-PRC-003',
    suite: 'Wizard Setup',
    subSuite: 'Step 4: Precios',
    testName: 'Análisis de precios visible',
    description: 'Verifica que la preview muestra análisis de precios (promedio, margen).',
    steps: [
      '1. Subir XLSX',
      '2. Verificar estadísticas: precio promedio, margen promedio',
    ].join('\n'),
    expectedResult: 'Se muestran estadísticas de precios.',
    type: 'Funcional',
    priority: 'Media',
    file: 'wizard-setup.spec.ts',
  },
  {
    id: 'WIZ-PRC-004',
    suite: 'Wizard Setup',
    subSuite: 'Step 4: Precios',
    testName: 'Confirmar envía precios',
    description: 'Verifica que confirmar los precios los envía al backend.',
    steps: [
      '1. Subir XLSX',
      '2. Click "Confirmar y Continuar"',
      '3. Verificar procesamiento o avance',
    ].join('\n'),
    expectedResult: 'Los precios se envían al backend y se avanza al paso 5.',
    type: 'Funcional',
    priority: 'Alta',
    file: 'wizard-setup.spec.ts',
  },
  {
    id: 'WIZ-PRC-005',
    suite: 'Wizard Setup',
    subSuite: 'Step 4: Precios',
    testName: 'Importar precios via JSON',
    description: 'Verifica importación de precios pegando JSON en textarea.',
    steps: [
      '1. Click tab "Importar JSON"',
      '2. Pegar JSON con 2 precios',
      '3. Click "Cargar Datos"',
    ].join('\n'),
    expectedResult: 'Los precios del JSON se cargan correctamente.',
    type: 'Funcional',
    priority: 'Media',
    file: 'wizard-setup.spec.ts',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // wizard-setup.spec.ts — Descuentos (Step 5)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'WIZ-DSC-001',
    suite: 'Wizard Setup',
    subSuite: 'Step 5: Descuentos',
    testName: 'Zona upload con tabs',
    description: 'Verifica que el paso 5 muestra tabs Archivo y JSON para descuentos.',
    steps: [
      '1. Avanzar al paso 5',
      '2. Verificar tabs "Subir Archivo" e "Importar JSON"',
    ].join('\n'),
    expectedResult: 'Las tabs son visibles para descuentos.',
    type: 'UI/UX',
    priority: 'Alta',
    file: 'wizard-setup.spec.ts',
  },
  {
    id: 'WIZ-DSC-002',
    suite: 'Wizard Setup',
    subSuite: 'Step 5: Descuentos',
    testName: 'XLSX muestra preview descuentos',
    description: 'Sube XLSX de descuentos (3 registros) y verifica la preview.',
    steps: [
      '1. Subir descuentos_test.xlsx',
      '2. Esperar preview',
      '3. Verificar nombre "Promo E2E 20% OFF"',
    ].join('\n'),
    expectedResult: 'La preview muestra los 3 descuentos del archivo.',
    type: 'Funcional',
    priority: 'Alta',
    file: 'wizard-setup.spec.ts',
  },
  {
    id: 'WIZ-DSC-003',
    suite: 'Wizard Setup',
    subSuite: 'Step 5: Descuentos',
    testName: 'Preview muestra tipo y valor',
    description: 'Verifica que la preview muestra tipo (percentage/fixed) y valor del descuento.',
    steps: [
      '1. Subir XLSX',
      '2. Verificar detalles: percentage, 20%, fixed',
    ].join('\n'),
    expectedResult: 'Los tipos y valores de descuentos son visibles.',
    type: 'Funcional',
    priority: 'Media',
    file: 'wizard-setup.spec.ts',
  },
  {
    id: 'WIZ-DSC-004',
    suite: 'Wizard Setup',
    subSuite: 'Step 5: Descuentos',
    testName: 'Confirmar envía descuentos',
    description: 'Verifica que confirmar los descuentos los envía al backend.',
    steps: [
      '1. Subir XLSX',
      '2. Click "Confirmar y Continuar"',
      '3. Verificar procesamiento o avance',
    ].join('\n'),
    expectedResult: 'Los descuentos se envían y se avanza al paso 6.',
    type: 'Funcional',
    priority: 'Alta',
    file: 'wizard-setup.spec.ts',
  },
  {
    id: 'WIZ-DSC-005',
    suite: 'Wizard Setup',
    subSuite: 'Step 5: Descuentos',
    testName: 'Importar descuentos via JSON',
    description: 'Verifica importación de descuentos pegando JSON.',
    steps: [
      '1. Click tab "Importar JSON"',
      '2. Pegar JSON con 1 descuento',
      '3. Click "Cargar Datos"',
    ].join('\n'),
    expectedResult: 'El descuento del JSON se carga correctamente.',
    type: 'Funcional',
    priority: 'Media',
    file: 'wizard-setup.spec.ts',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // wizard-setup.spec.ts — Review (Step 6)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'WIZ-REV-001',
    suite: 'Wizard Setup',
    subSuite: 'Step 6: Review',
    testName: 'Muestra resumen o loading',
    description: 'Verifica que el paso 6 muestra pantalla de resumen o estado de carga.',
    steps: [
      '1. Avanzar al paso 6',
      '2. Verificar contenido: resumen, cargando, o error',
    ].join('\n'),
    expectedResult: 'Se muestra algún contenido significativo en el paso de review.',
    type: 'Funcional',
    priority: 'Alta',
    file: 'wizard-setup.spec.ts',
  },
  {
    id: 'WIZ-REV-002',
    suite: 'Wizard Setup',
    subSuite: 'Step 6: Review',
    testName: 'Resumen muestra conteos',
    description: 'Verifica que el resumen muestra conteos de todas las entidades.',
    steps: [
      '1. Llegar al paso 6',
      '2. Verificar labels: Clientes, Productos, Listas de Precios, Precios, Descuentos',
    ].join('\n'),
    expectedResult: 'Se muestran conteos para cada tipo de entidad.',
    type: 'Funcional',
    priority: 'Alta',
    file: 'wizard-setup.spec.ts',
  },
  {
    id: 'WIZ-REV-003',
    suite: 'Wizard Setup',
    subSuite: 'Step 6: Review',
    testName: 'Botón Finalizar visible',
    description: 'Verifica que el botón "Finalizar Configuración" está visible en el paso 6.',
    steps: [
      '1. Llegar al paso 6',
      '2. Esperar a que cargue el resumen',
      '3. Verificar botón "Finalizar Configuración"',
    ].join('\n'),
    expectedResult: 'El botón de finalización es visible.',
    type: 'Funcional',
    priority: 'Alta',
    file: 'wizard-setup.spec.ts',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // wizard-setup.spec.ts — Validaciones y Edge Cases
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'WIZ-VAL-001',
    suite: 'Wizard Setup',
    subSuite: 'Validaciones',
    testName: 'Archivo vacío manejado',
    description: 'Verifica que subir un XLSX vacío no rompe el proceso.',
    steps: [
      '1. En paso 1, subir archivo_vacio_test.xlsx',
      '2. Verificar que no muestra preview exitosa o que muestra aviso',
    ].join('\n'),
    expectedResult: 'El archivo vacío se maneja gracefully sin crash.',
    type: 'Validación',
    priority: 'Alta',
    file: 'wizard-setup.spec.ts',
  },
  {
    id: 'WIZ-VAL-002',
    suite: 'Wizard Setup',
    subSuite: 'Validaciones',
    testName: 'Columnas incorrectas manejadas',
    description: 'Verifica que un archivo con columnas incorrectas no crashea.',
    steps: [
      '1. Subir columnas_incorrectas_test.xlsx',
      '2. Verificar que muestra error o datos vacíos',
    ].join('\n'),
    expectedResult: 'El archivo con columnas incorrectas se maneja sin crash.',
    type: 'Validación',
    priority: 'Alta',
    file: 'wizard-setup.spec.ts',
  },
  {
    id: 'WIZ-VAL-003',
    suite: 'Wizard Setup',
    subSuite: 'Validaciones',
    testName: 'JSON inválido muestra error',
    description: 'Verifica que pegar JSON inválido muestra error de validación.',
    steps: [
      '1. Click tab "Importar JSON"',
      '2. Pegar texto no-JSON',
      '3. Click "Validar JSON"',
      '4. Verificar mensaje de error',
    ].join('\n'),
    expectedResult: 'Se muestra un error de validación indicando JSON inválido.',
    type: 'Validación',
    priority: 'Alta',
    file: 'wizard-setup.spec.ts',
  },
  {
    id: 'WIZ-VAL-004',
    suite: 'Wizard Setup',
    subSuite: 'Validaciones',
    testName: 'JSON vacío deshabilitado',
    description: 'Verifica que con textarea vacío el botón "Cargar Datos" está deshabilitado.',
    steps: [
      '1. Click tab "Importar JSON"',
      '2. Verificar que "Cargar Datos" está deshabilitado',
    ].join('\n'),
    expectedResult: 'El botón no permite cargar con textarea vacío.',
    type: 'Validación',
    priority: 'Media',
    file: 'wizard-setup.spec.ts',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // wizard-setup.spec.ts — Templates
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'WIZ-TMPL-001',
    suite: 'Wizard Setup',
    subSuite: 'Templates',
    testName: 'Botón descarga template',
    description: 'Verifica que existe un botón de descarga de template/ejemplo en el paso 1.',
    steps: [
      '1. En paso 1, buscar botón de descarga',
      '2. Verificar que es visible',
    ].join('\n'),
    expectedResult: 'El botón de descarga de template es visible.',
    type: 'Funcional',
    priority: 'Media',
    file: 'wizard-setup.spec.ts',
  },
  {
    id: 'WIZ-TMPL-002',
    suite: 'Wizard Setup',
    subSuite: 'Templates',
    testName: 'Descarga sin error',
    description: 'Verifica que hacer click en descargar template no produce errores.',
    steps: [
      '1. Click en botón de descarga',
      '2. Monitorear errores de consola',
      '3. Verificar que descarga se inicia o no hay errores críticos',
    ].join('\n'),
    expectedResult: 'La descarga se inicia sin errores de consola.',
    type: 'Funcional',
    priority: 'Media',
    file: 'wizard-setup.spec.ts',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // wizard-setup.spec.ts — Flujo Completo
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'WIZ-FULL-001',
    suite: 'Wizard Setup',
    subSuite: 'Flujo Completo',
    testName: 'Recorrer 6 pasos E2E',
    description: 'Ejecuta el flujo completo del wizard: 6 pasos con importación XLSX en cada uno.',
    steps: [
      '1. Login como admin',
      '2. Iniciar wizard',
      '3. Paso 1: Subir clientes_test.xlsx → confirmar',
      '4. Paso 2: Subir productos_test.xlsx → esperar matching → confirmar',
      '5. Paso 3: Subir listas_precios_test.xlsx → confirmar',
      '6. Paso 4: Subir precios_test.xlsx → confirmar',
      '7. Paso 5: Subir descuentos_test.xlsx → confirmar',
      '8. Paso 6: Verificar resumen con conteos',
      '9. Click "Finalizar Configuración"',
      '10. Verificar redirección a /admin',
    ].join('\n'),
    expectedResult: 'El wizard completo se ejecuta sin errores, importando datos XLSX en cada paso.',
    type: 'Funcional',
    priority: 'Alta',
    file: 'wizard-setup.spec.ts',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // wizard-setup.spec.ts — UX y Rendimiento
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'WIZ-PERF-001',
    suite: 'Wizard Setup',
    subSuite: 'Rendimiento',
    testName: 'Carga en < 10 segundos',
    description: 'Verifica que el wizard carga en menos de 10 segundos.',
    steps: [
      '1. Medir tiempo desde login hasta wizard visible',
      '2. Verificar que carga < 10s',
    ].join('\n'),
    expectedResult: 'El wizard carga en menos de 10 segundos.',
    type: 'Rendimiento',
    priority: 'Media',
    file: 'wizard-setup.spec.ts',
  },
  {
    id: 'WIZ-PERF-002',
    suite: 'Wizard Setup',
    subSuite: 'Rendimiento',
    testName: 'Sin errores de consola',
    description: 'Verifica que no hay errores críticos de consola al navegar el wizard.',
    steps: [
      '1. Monitorear consola del navegador',
      '2. Navegar por 3 pasos del wizard',
      '3. Verificar 0 errores críticos',
    ].join('\n'),
    expectedResult: 'No se detectan errores críticos en consola.',
    type: 'Rendimiento',
    priority: 'Media',
    file: 'wizard-setup.spec.ts',
  },
  {
    id: 'WIZ-PERF-003',
    suite: 'Wizard Setup',
    subSuite: 'Rendimiento',
    testName: 'Parsing XLSX < 10s',
    description: 'Verifica que el parsing de un archivo XLSX completa en menos de 10 segundos.',
    steps: [
      '1. Medir tiempo desde upload hasta preview',
      '2. Verificar que < 10 segundos',
    ].join('\n'),
    expectedResult: 'El parsing del XLSX toma menos de 10 segundos.',
    type: 'Rendimiento',
    priority: 'Media',
    file: 'wizard-setup.spec.ts',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // admin-crud.spec.ts — ABM Clientes
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'CLI-LIST-001', suite: 'ABM Clientes', subSuite: 'Listado',
    testName: 'Página carga con tabla y botones',
    description: 'Verifica que la página de clientes muestra tabla, botones Crear/Importar/Exportar y buscador.',
    steps: '1. Navegar a /admin/clientes\n2. Verificar botones Crear Cliente, Importar, Exportar Excel\n3. Verificar buscador',
    expectedResult: 'Todos los botones y elementos de la página son visibles.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'CLI-LIST-002', suite: 'ABM Clientes', subSuite: 'Listado',
    testName: 'Búsqueda filtra clientes',
    description: 'Verifica que el buscador filtra clientes por nombre/email.',
    steps: '1. Escribir "test" en buscador\n2. Esperar debounce 500ms\n3. Verificar resultados filtrados',
    expectedResult: 'La tabla muestra solo clientes que coinciden con la búsqueda.',
    type: 'Funcional', priority: 'Media', file: 'admin-crud.spec.ts',
  },
  {
    id: 'CLI-CREATE-001', suite: 'ABM Clientes', subSuite: 'Crear',
    testName: 'Navegar a crear cliente',
    description: 'Verifica que el botón "Crear Cliente" navega al formulario.',
    steps: '1. Click "Crear Cliente"\n2. Verificar URL /admin/clientes/nuevo\n3. Verificar formulario visible',
    expectedResult: 'Se muestra el formulario de creación de cliente.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'CLI-CREATE-002', suite: 'ABM Clientes', subSuite: 'Crear',
    testName: 'Crear cliente con datos válidos',
    description: 'Llena campos mínimos y envía formulario.',
    steps: '1. Llenar nombre, email, teléfono\n2. Click Guardar\n3. Verificar creación',
    expectedResult: 'El cliente se crea exitosamente.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'CLI-EDIT-001', suite: 'ABM Clientes', subSuite: 'Editar',
    testName: 'Click editar abre modo edición',
    description: 'Verifica que el ícono de editar navega al detalle del cliente.',
    steps: '1. Click ícono Editar en fila de tabla\n2. Verificar navegación a detalle',
    expectedResult: 'Se abre la página de detalle del cliente.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'CLI-EDIT-002', suite: 'ABM Clientes', subSuite: 'Editar',
    testName: 'Botón "Editar Cliente" abre edición',
    description: 'En detalle, el botón "Editar Cliente" activa el modo edición con Cancelar/Guardar.',
    steps: '1. Ver detalle de cliente\n2. Click "Editar Cliente"\n3. Verificar botones Cancelar y Guardar',
    expectedResult: 'Se activa el modo edición con opciones de guardar o cancelar.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'CLI-EDIT-003', suite: 'ABM Clientes', subSuite: 'Editar',
    testName: 'Guardar cambios muestra confirmación',
    description: 'Modifica un campo y guarda; verifica alert de éxito.',
    steps: '1. Activar edición\n2. Modificar campo observaciones\n3. Click Guardar Cambios',
    expectedResult: 'Se muestra confirmación de actualización exitosa.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'CLI-STATUS-001', suite: 'ABM Clientes', subSuite: 'Estado',
    testName: 'Toggle estado abre confirmación',
    description: 'Click en badge de estado abre diálogo "Confirmar Cambio de Estado".',
    steps: '1. Click en badge Activo/Inactivo\n2. Verificar diálogo\n3. Cancelar',
    expectedResult: 'Se muestra diálogo de confirmación de cambio de estado.',
    type: 'Funcional', priority: 'Media', file: 'admin-crud.spec.ts',
  },
  {
    id: 'CLI-INVITE-001', suite: 'ABM Clientes', subSuite: 'Invitación',
    testName: 'Botón Invitar abre diálogo masivo',
    description: 'Click en "Invitar" abre diálogo de envío de invitaciones.',
    steps: '1. Click "Invitar"\n2. Verificar diálogo Enviar Invitación/Invitaciones\n3. Cancelar',
    expectedResult: 'El diálogo de invitación se abre correctamente.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'CLI-INVITE-002', suite: 'ABM Clientes', subSuite: 'Invitación',
    testName: 'Invitación individual desde verificación',
    description: 'Click en ícono de verificación abre invitación individual.',
    steps: '1. Click ícono usuario en columna Verificado\n2. Verificar diálogo con email\n3. Cancelar',
    expectedResult: 'Se muestra diálogo con datos del cliente y botón "Enviar Invitación".',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'CLI-INVITE-003', suite: 'ABM Clientes', subSuite: 'Invitación',
    testName: 'Invitación masiva con selección',
    description: 'Seleccionar clientes y enviar invitación masiva.',
    steps: '1. Seleccionar checkbox\n2. Click "Invitar (N)"\n3. Verificar diálogo masivo\n4. Cancelar',
    expectedResult: 'El diálogo muestra el conteo de clientes seleccionados.',
    type: 'Funcional', priority: 'Media', file: 'admin-crud.spec.ts',
  },
  {
    id: 'CLI-IMPORT-001', suite: 'ABM Clientes', subSuite: 'Importación',
    testName: 'Modal importación abre con tabs',
    description: 'Botón Importar abre modal con tabs Archivo/JSON y descarga de plantilla.',
    steps: '1. Click Importar\n2. Verificar modal "Importar Clientes"\n3. Verificar tabs y plantilla',
    expectedResult: 'Modal con tabs Subir Archivo, Importar JSON y Descargar Plantilla.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'CLI-IMPORT-002', suite: 'ABM Clientes', subSuite: 'Importación',
    testName: 'XLSX con formato diferente activa mapeo',
    description: 'Sube un XLSX con columnas que no coinciden y verifica que se ofrece el mapeo.',
    steps: '1. Subir XLSX\n2. Esperar parsing\n3. Verificar botón "Mapear Columnas"\n4. Abrir mapeo\n5. Verificar columnas obligatorias',
    expectedResult: 'El modal de mapeo se abre con secciones obligatorias y dropdowns.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'CLI-IMPORT-003', suite: 'ABM Clientes', subSuite: 'Importación',
    testName: 'Mapeo muestra obligatorias y recomendadas',
    description: 'El modal de mapeo muestra secciones de columnas obligatorias (badge rojo) y recomendadas.',
    steps: '1. Abrir mapeo\n2. Verificar sección "Columnas Obligatorias"\n3. Verificar badges "Obligatorio"\n4. Verificar dropdowns',
    expectedResult: 'Las columnas obligatorias tienen badge rojo y dropdowns de mapeo.',
    type: 'Validación', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'CLI-IMPORT-004', suite: 'ABM Clientes', subSuite: 'Importación',
    testName: 'Auto-mapeo vincula coincidentes',
    description: 'El auto-mapeo vincula automáticamente columnas con nombre/label coincidente.',
    steps: '1. Subir XLSX\n2. Abrir mapeo\n3. Verificar mensaje "Se auto-mapearon N columna(s)"',
    expectedResult: 'Las columnas con nombres coincidentes se mapean automáticamente.',
    type: 'Funcional', priority: 'Media', file: 'admin-crud.spec.ts',
  },
  {
    id: 'CLI-IMPORT-005', suite: 'ABM Clientes', subSuite: 'Importación',
    testName: 'Vista previa de datos mapeados',
    description: 'El toggle de preview muestra las primeras 5 filas con datos transformados.',
    steps: '1. Abrir mapeo\n2. Click "Ver vista previa de datos mapeados"\n3. Verificar tabla de preview',
    expectedResult: 'Se muestra tabla con datos transformados según el mapeo.',
    type: 'Funcional', priority: 'Media', file: 'admin-crud.spec.ts',
  },
  {
    id: 'CLI-IMPORT-006', suite: 'ABM Clientes', subSuite: 'Importación',
    testName: 'Confirmar mapeo importa registros',
    description: 'Confirmar el mapeo envía los datos mapeados al backend y muestra resultado.',
    steps: '1. Mapear columnas\n2. Click "Confirmar Mapeo e Importar"\n3. Verificar resultado',
    expectedResult: 'Se muestra pantalla "Resultado de Importación" con exitosos/errores.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'CLI-IMPORT-007', suite: 'ABM Clientes', subSuite: 'Importación',
    testName: 'Descargar plantilla de ejemplo',
    description: 'El botón descarga un archivo Excel de plantilla.',
    steps: '1. Click "Descargar Plantilla de Ejemplo"\n2. Verificar descarga',
    expectedResult: 'Se inicia la descarga del archivo de plantilla.',
    type: 'Funcional', priority: 'Media', file: 'admin-crud.spec.ts',
  },
  {
    id: 'CLI-EXPORT-001', suite: 'ABM Clientes', subSuite: 'Exportar',
    testName: 'Exportar Excel descarga archivo',
    description: 'Botón "Exportar Excel" descarga archivo XLSX.',
    steps: '1. Click "Exportar Excel"\n2. Verificar descarga',
    expectedResult: 'Se descarga archivo Excel con los clientes.',
    type: 'Funcional', priority: 'Media', file: 'admin-crud.spec.ts',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // admin-crud.spec.ts — ABM Productos
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'PROD-LIST-001', suite: 'ABM Productos', subSuite: 'Listado',
    testName: 'Página carga con tabla y botones',
    description: 'Verifica tabla, filtros y botones Crear/Importar.',
    steps: '1. Navegar a /admin/productos\n2. Verificar botones\n3. Verificar buscador',
    expectedResult: 'Todos los elementos de la página de productos son visibles.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'PROD-LIST-002', suite: 'ABM Productos', subSuite: 'Listado',
    testName: 'Filtros categoría y estado funcionan',
    description: 'Los filtros dropdown de categoría y estado son funcionales.',
    steps: '1. Seleccionar filtro de categoría\n2. Verificar tabla filtrada',
    expectedResult: 'Los filtros aplican correctamente.',
    type: 'Funcional', priority: 'Media', file: 'admin-crud.spec.ts',
  },
  {
    id: 'PROD-CREATE-001', suite: 'ABM Productos', subSuite: 'Crear',
    testName: 'Navegar a crear producto',
    description: 'Botón "Crear Producto" navega al formulario.',
    steps: '1. Click "Crear Producto"\n2. Verificar URL\n3. Verificar formulario',
    expectedResult: 'Se muestra formulario con campos de producto.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'PROD-CREATE-002', suite: 'ABM Productos', subSuite: 'Crear',
    testName: 'Crear producto con datos mínimos',
    description: 'Llena nombre, SKU, precio, brand, categoría y guarda.',
    steps: '1. Llenar campos\n2. Click Guardar\n3. Verificar creación',
    expectedResult: 'El producto se crea exitosamente.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'PROD-EDIT-001', suite: 'ABM Productos', subSuite: 'Editar',
    testName: 'Click editar abre detalle',
    description: 'Ícono de editar navega a la página de detalle.',
    steps: '1. Click ícono Editar\n2. Verificar URL de detalle',
    expectedResult: 'Se abre la página de detalle del producto.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'PROD-EDIT-002', suite: 'ABM Productos', subSuite: 'Editar',
    testName: 'Botón Editar activa modo edición',
    description: 'En detalle, "Editar" muestra Cancelar/Guardar.',
    steps: '1. Ver detalle\n2. Click Editar\n3. Verificar Cancelar/Guardar',
    expectedResult: 'Se activa modo edición con opciones de guardar.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'PROD-EDIT-003', suite: 'ABM Productos', subSuite: 'Editar',
    testName: 'Guardar cambios muestra toast éxito',
    description: 'Guardar cambios muestra "Producto guardado correctamente".',
    steps: '1. Editar\n2. Guardar\n3. Verificar toast',
    expectedResult: 'Toast de éxito visible.',
    type: 'Funcional', priority: 'Media', file: 'admin-crud.spec.ts',
  },
  {
    id: 'PROD-IMPORT-001', suite: 'ABM Productos', subSuite: 'Importación',
    testName: 'Modal importación con tabs',
    description: 'Botón Importar abre "Importar Productos" con tabs.',
    steps: '1. Click Importar\n2. Verificar modal\n3. Verificar tabs',
    expectedResult: 'Modal con Subir Archivo e Importar JSON.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'PROD-IMPORT-002', suite: 'ABM Productos', subSuite: 'Importación',
    testName: 'XLSX cualquiera activa mapeo',
    description: 'Sube un XLSX con columnas que no coinciden → se abre mapeo.',
    steps: '1. Subir XLSX genérico\n2. Verificar advertencia\n3. Click Mapear Columnas\n4. Verificar modal de mapeo',
    expectedResult: 'El modal de mapeo se abre con columnas obligatorias.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'PROD-IMPORT-003', suite: 'ABM Productos', subSuite: 'Importación',
    testName: 'XLSX correcto permite importar directo',
    description: 'Sube XLSX con columnas correctas → listo para importar.',
    steps: '1. Subir productos_test.xlsx\n2. Verificar "listo para importar" o mapeo',
    expectedResult: 'El archivo se procesa y está listo para importación.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'PROD-IMPORT-004', suite: 'ABM Productos', subSuite: 'Importación',
    testName: 'Mapeo valida obligatorias',
    description: 'Sin obligatorias mapeadas, botón confirmar deshabilitado.',
    steps: '1. Subir XLSX genérico\n2. Abrir mapeo\n3. Verificar botón deshabilitado\n4. Verificar mensaje',
    expectedResult: 'No permite importar sin columnas obligatorias.',
    type: 'Validación', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'PROD-IMPORT-005', suite: 'ABM Productos', subSuite: 'Importación',
    testName: 'Resultado muestra éxito/errores',
    description: 'Tras importar, pantalla muestra resultado por fila.',
    steps: '1. Importar productos\n2. Ver "Resultado de Importación"\n3. Verificar conteos',
    expectedResult: 'Se muestran resultados con conteo de exitosos y errores.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // admin-crud.spec.ts — ABM Listas de Precios
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'LP-LIST-001', suite: 'ABM Listas de Precios', subSuite: 'Listado',
    testName: 'Página carga con tabla y botones',
    description: 'Verifica tabla, filtros y botones Agregar/Importar/Exportar.',
    steps: '1. Navegar a /admin/listas-precios\n2. Verificar botones Agregar, Importar\n3. Verificar buscador',
    expectedResult: 'Todos los elementos de la página son visibles.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'LP-LIST-002', suite: 'ABM Listas de Precios', subSuite: 'Listado',
    testName: 'Filtros estado y moneda funcionan',
    description: 'Los filtros de estado y moneda existen.',
    steps: '1. Verificar estados\n2. Verificar monedas',
    expectedResult: 'Los filtros están visibles.',
    type: 'Funcional', priority: 'Media', file: 'admin-crud.spec.ts',
  },
  {
    id: 'LP-CREATE-001', suite: 'ABM Listas de Precios', subSuite: 'Crear',
    testName: 'Navegar a crear lista',
    description: 'Botón Agregar navega a formulario de creación.',
    steps: '1. Click Agregar\n2. Verificar URL',
    expectedResult: 'Se navega a la página de creación de lista.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'LP-EDIT-001', suite: 'ABM Listas de Precios', subSuite: 'Editar',
    testName: 'Click editar abre detalle de lista',
    description: 'Ícono editar navega al detalle.',
    steps: '1. Click ícono editar\n2. Verificar URL',
    expectedResult: 'Se abre detalle de la lista de precios.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'LP-STATUS-001', suite: 'ABM Listas de Precios', subSuite: 'Estado',
    testName: 'Toggle estado abre confirmación',
    description: 'Click en badge de estado abre diálogo de confirmación.',
    steps: '1. Click badge estado\n2. Verificar diálogo\n3. Cancelar',
    expectedResult: 'Diálogo de confirmación de cambio de estado visible.',
    type: 'Funcional', priority: 'Media', file: 'admin-crud.spec.ts',
  },
  {
    id: 'LP-IMPORT-001', suite: 'ABM Listas de Precios', subSuite: 'Importación',
    testName: 'Modal importación abre',
    description: 'Botón Importar abre "Importar Listas de Precios".',
    steps: '1. Click Importar\n2. Verificar modal',
    expectedResult: 'Se muestra modal de importación con tabs.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'LP-IMPORT-002', suite: 'ABM Listas de Precios', subSuite: 'Importación',
    testName: 'XLSX cualquiera activa mapeo',
    description: 'Sube XLSX genérico → mapeo de columnas.',
    steps: '1. Subir XLSX genérico\n2. Verificar mapeo\n3. Verificar modal con obligatorias',
    expectedResult: 'Modal de mapeo con columnas obligatorias.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'LP-IMPORT-003', suite: 'ABM Listas de Precios', subSuite: 'Importación',
    testName: 'XLSX correcto muestra preview',
    description: 'Sube XLSX con formato correcto.',
    steps: '1. Subir listas_precios_test.xlsx\n2. Verificar listo para importar o mapeo',
    expectedResult: 'El archivo se procesa correctamente.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'LP-IMPORT-004', suite: 'ABM Listas de Precios', subSuite: 'Importación',
    testName: 'Importar y ver resultado',
    description: 'Importa listas y verifica pantalla de resultados.',
    steps: '1. Importar listas\n2. Verificar "Resultado de Importación"',
    expectedResult: 'Resultado de importación visible.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // admin-crud.spec.ts — ABM Precios
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'PRC-LIST-001', suite: 'ABM Precios', subSuite: 'Listado',
    testName: 'Página carga con tabla y botones',
    description: 'Verifica tabla, filtros y botones Agregar/Importar.',
    steps: '1. Navegar a /admin/precios\n2. Verificar botones Agregar, Importar\n3. Verificar buscador',
    expectedResult: 'Todos los elementos la página son visibles.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'PRC-LIST-002', suite: 'ABM Precios', subSuite: 'Listado',
    testName: 'Filtros estado, moneda y categoría',
    description: 'Filtros de estado, moneda y categoría visibles.',
    steps: '1. Verificar filtros de estado\n2. Verificar filtros moneda',
    expectedResult: 'Los filtros están presentes.',
    type: 'Funcional', priority: 'Media', file: 'admin-crud.spec.ts',
  },
  {
    id: 'PRC-CREATE-001', suite: 'ABM Precios', subSuite: 'Crear',
    testName: 'Navegar a crear precio',
    description: 'Botón Agregar navega a formulario.',
    steps: '1. Click Agregar\n2. Verificar URL /admin/precios/nuevo',
    expectedResult: 'Se navega al formulario de creación.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'PRC-CREATE-002', suite: 'ABM Precios', subSuite: 'Crear',
    testName: 'Formulario tiene campos requeridos',
    description: 'Verifica campos código de producto y precio.',
    steps: '1. Navegar a /admin/precios/nuevo\n2. Verificar campos',
    expectedResult: 'Los campos productCode y price son visibles.',
    type: 'Funcional', priority: 'Media', file: 'admin-crud.spec.ts',
  },
  {
    id: 'PRC-EDIT-001', suite: 'ABM Precios', subSuite: 'Editar',
    testName: 'Click editar navega al detalle',
    description: 'Ícono Editar navega a la vista de detalle.',
    steps: '1. Click ícono Editar\n2. Verificar URL',
    expectedResult: 'Se navega al detalle del precio.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'PRC-EDIT-002', suite: 'ABM Precios', subSuite: 'Editar',
    testName: 'Click ver navega al detalle',
    description: 'Ícono Ver navega a la vista de detalle.',
    steps: '1. Click ícono Ver\n2. Verificar URL',
    expectedResult: 'Se navega al detalle del precio.',
    type: 'Funcional', priority: 'Media', file: 'admin-crud.spec.ts',
  },
  {
    id: 'PRC-IMPORT-001', suite: 'ABM Precios', subSuite: 'Importación',
    testName: 'Modal importación abre',
    description: 'Botón Importar abre "Importar Precios".',
    steps: '1. Click Importar\n2. Verificar modal',
    expectedResult: 'Modal con tabs Subir Archivo e Importar JSON.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'PRC-IMPORT-002', suite: 'ABM Precios', subSuite: 'Importación',
    testName: 'XLSX cualquiera activa mapeo',
    description: 'Sube XLSX genérico → mapeo de columnas.',
    steps: '1. Subir XLSX genérico\n2. Click Mapear Columnas\n3. Verificar modal',
    expectedResult: 'Modal de mapeo de columnas abierto.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'PRC-IMPORT-003', suite: 'ABM Precios', subSuite: 'Importación',
    testName: 'XLSX correcto de precios',
    description: 'Sube precios_test.xlsx con formato correcto.',
    steps: '1. Subir precios_test.xlsx\n2. Verificar procesamiento',
    expectedResult: 'Archivo procesado y listo para importar.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'PRC-IMPORT-004', suite: 'ABM Precios', subSuite: 'Importación',
    testName: 'Mapeo valida obligatorias',
    description: 'Sin obligatorias, confirmar deshabilitado.',
    steps: '1. Subir genérico\n2. Abrir mapeo\n3. Verificar botón deshabilitado',
    expectedResult: 'No se puede importar sin obligatorias mapeadas.',
    type: 'Validación', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'PRC-IMPORT-005', suite: 'ABM Precios', subSuite: 'Importación',
    testName: 'Importar y ver resultado',
    description: 'Importa precios y verifica pantalla de resultado.',
    steps: '1. Importar precios\n2. Ver resultado',
    expectedResult: 'Pantalla "Resultado de Importación" visible.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // admin-crud.spec.ts — ABM Descuentos
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'DSC-LIST-001', suite: 'ABM Descuentos', subSuite: 'Listado',
    testName: 'Página carga con tabla y estadísticas',
    description: 'Verifica tabla, estadísticas y botones Nuevo/Importar.',
    steps: '1. Navegar a /admin/descuentos\n2. Verificar botones\n3. Verificar buscador',
    expectedResult: 'Tabla, estadísticas y botones visibles.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'DSC-LIST-002', suite: 'ABM Descuentos', subSuite: 'Listado',
    testName: 'Estadísticas muestran conteos',
    description: 'Barra de estadísticas con total/activos visible.',
    steps: '1. Verificar sección estadísticas\n2. Verificar texto activos/total',
    expectedResult: 'Estadísticas con conteos visibles.',
    type: 'UI/UX', priority: 'Media', file: 'admin-crud.spec.ts',
  },
  {
    id: 'DSC-LIST-003', suite: 'ABM Descuentos', subSuite: 'Listado',
    testName: 'Filtros estado, tipo y acumulativo',
    description: 'Filtros desplegables de estado, tipo y acumulativo.',
    steps: '1. Verificar filtro estados\n2. Verificar filtro tipos',
    expectedResult: 'Los filtros están presentes.',
    type: 'Funcional', priority: 'Media', file: 'admin-crud.spec.ts',
  },
  {
    id: 'DSC-CREATE-001', suite: 'ABM Descuentos', subSuite: 'Crear',
    testName: '"Nuevo con Template" navega a template',
    description: 'Botón "Nuevo con Template" navega a /admin/descuentos/nuevo-template.',
    steps: '1. Click "Nuevo con Template"\n2. Verificar URL',
    expectedResult: 'Se navega a la página de creación por template.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'DSC-CREATE-002', suite: 'ABM Descuentos', subSuite: 'Crear',
    testName: '"Modo Avanzado" navega a formulario',
    description: 'Botón "Modo Avanzado" navega a /admin/descuentos/nuevo.',
    steps: '1. Click Modo Avanzado\n2. Verificar URL',
    expectedResult: 'Se navega al formulario avanzado.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'DSC-CREATE-003', suite: 'ABM Descuentos', subSuite: 'Crear',
    testName: 'Formulario avanzado con tabs',
    description: 'Formulario tiene tabs General/Condiciones/Relaciones y campos requeridos.',
    steps: '1. Navegar a /admin/descuentos/nuevo\n2. Verificar tabs\n3. Verificar campo nombre',
    expectedResult: 'Tabs y campos requeridos visibles.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'DSC-CREATE-004', suite: 'ABM Descuentos', subSuite: 'Crear',
    testName: 'Crear descuento con datos mínimos',
    description: 'Llena nombre, descripción, valor y guarda.',
    steps: '1. Llenar nombre, descripción, valor\n2. Click Guardar',
    expectedResult: 'El descuento se crea exitosamente.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'DSC-EDIT-001', suite: 'ABM Descuentos', subSuite: 'Editar',
    testName: 'Click nombre navega a detalle',
    description: 'Click en nombre de descuento navega al detalle.',
    steps: '1. Click nombre\n2. Verificar URL de detalle',
    expectedResult: 'Se navega al detalle del descuento.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'DSC-EDIT-002', suite: 'ABM Descuentos', subSuite: 'Editar',
    testName: 'Botón Editar navega a edición',
    description: 'En detalle, "Editar" navega a /editar.',
    steps: '1. Ver detalle\n2. Click Editar\n3. Verificar URL /editar',
    expectedResult: 'Se navega a la página de edición.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'DSC-DELETE-001', suite: 'ABM Descuentos', subSuite: 'Eliminar',
    testName: 'Botón eliminar abre confirmación',
    description: 'Ícono Trash en tabla abre diálogo "Eliminar Descuento".',
    steps: '1. Click ícono Trash\n2. Verificar diálogo\n3. Verificar botones Cancelar/Eliminar\n4. Cancelar',
    expectedResult: 'Diálogo con advertencia "no se puede deshacer" y botones.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'DSC-DELETE-002', suite: 'ABM Descuentos', subSuite: 'Eliminar',
    testName: 'Eliminar desde detalle con confirmación',
    description: 'En detalle, "Eliminar" abre modal con texto de confirmación.',
    steps: '1. Ver detalle\n2. Click Eliminar\n3. Verificar diálogo\n4. Cancelar',
    expectedResult: 'Modal "Eliminar Descuento" con advertencia visible.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'DSC-IMPORT-001', suite: 'ABM Descuentos', subSuite: 'Importación',
    testName: 'Modal importación abre',
    description: 'Botón Importar abre "Importar Descuentos".',
    steps: '1. Click Importar\n2. Verificar modal',
    expectedResult: 'Modal de importación con tabs.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'DSC-IMPORT-002', suite: 'ABM Descuentos', subSuite: 'Importación',
    testName: 'XLSX cualquiera activa mapeo',
    description: 'Sube XLSX genérico → mapeo de columnas con info de archivo.',
    steps: '1. Subir XLSX genérico\n2. Click Mapear Columnas\n3. Verificar info de archivo y columnas',
    expectedResult: 'Modal de mapeo con info de archivo y columnas detectadas.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'DSC-IMPORT-003', suite: 'ABM Descuentos', subSuite: 'Importación',
    testName: 'Mapeo muestra obligatorias y recomendadas',
    description: 'El modal muestra secciones separadas de columnas.',
    steps: '1. Abrir mapeo\n2. Verificar secciones\n3. Contar badges "Obligatorio"',
    expectedResult: 'Secciones obligatorias con badges rojos visibles.',
    type: 'Validación', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'DSC-IMPORT-004', suite: 'ABM Descuentos', subSuite: 'Importación',
    testName: 'Vista previa de mapeo funciona',
    description: 'Toggle "Ver vista previa" muestra datos transformados.',
    steps: '1. Abrir mapeo\n2. Click toggle preview\n3. Verificar tabla',
    expectedResult: 'Tabla de preview con datos visibles.',
    type: 'Funcional', priority: 'Media', file: 'admin-crud.spec.ts',
  },
  {
    id: 'DSC-IMPORT-005', suite: 'ABM Descuentos', subSuite: 'Importación',
    testName: 'Importar descuentos y ver resultado',
    description: 'Importa y verifica pantalla de resultado.',
    steps: '1. Importar descuentos\n2. Verificar resultado',
    expectedResult: 'Pantalla de resultado con conteos.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // admin-crud.spec.ts — Mapeo de Columnas (cross-entity)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'MAP-001', suite: 'Mapeo de Columnas', subSuite: 'Dropdowns',
    testName: 'Dropdowns muestran columnas del archivo',
    description: 'Los dropdowns de mapeo listan las columnas detectadas del XLSX.',
    steps: '1. Abrir mapeo en Clientes\n2. Contar dropdowns\n3. Abrir un dropdown',
    expectedResult: 'Los dropdowns listan las columnas del archivo subido.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'MAP-002', suite: 'Mapeo de Columnas', subSuite: 'Desvincular',
    testName: 'Desvincular columna la desmapea',
    description: 'Click en "Desvincular" remueve el mapeo de una columna.',
    steps: '1. Abrir mapeo\n2. Click Desvincular\n3. Verificar que queda sin mapear',
    expectedResult: 'La columna vuelve a "— Sin mapear —".',
    type: 'Funcional', priority: 'Media', file: 'admin-crud.spec.ts',
  },
  {
    id: 'MAP-003', suite: 'Mapeo de Columnas', subSuite: 'Validación',
    testName: 'Sin obligatorias no permite importar',
    description: 'Desvincular obligatorias deshabilita botón confirmar.',
    steps: '1. Desvincular obligatorias\n2. Verificar mensaje error\n3. Verificar botón deshabilitado',
    expectedResult: 'Botón "Confirmar Mapeo e Importar" deshabilitado.',
    type: 'Validación', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'MAP-004', suite: 'Mapeo de Columnas', subSuite: 'Validación',
    testName: 'Todas obligatorias mapeadas habilita botón',
    description: 'Con todas las obligatorias mapeadas, botón se habilita.',
    steps: '1. Mapear obligatorias\n2. Verificar mensaje verde\n3. Verificar botón habilitado',
    expectedResult: 'Mensaje "Todas las columnas obligatorias mapeadas" y botón activo.',
    type: 'Validación', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
  {
    id: 'MAP-005', suite: 'Mapeo de Columnas', subSuite: 'Cross-Entity',
    testName: 'XLSX libre activa mapeo en todas las entidades',
    description: 'Sube el mismo XLSX genérico en las 5 entidades y verifica que todas ofrecen mapeo.',
    steps: '1. Para cada entidad (Clientes, Productos, Listas, Precios, Descuentos)\n2. Abrir importar\n3. Subir XLSX genérico\n4. Verificar mapeo o listo\n5. Cerrar',
    expectedResult: 'Todas las entidades ofrecen mapeo de columnas al subir XLSX libre.',
    type: 'Funcional', priority: 'Alta', file: 'admin-crud.spec.ts',
  },
];

// ─── Generación del XLSX ─────────────────────────────────────────────────────

async function exportToXlsx() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Virtago E2E Test Export';
  workbook.created = new Date();

  // ── Hoja 1: Resumen ─────────────────────────────────────────────────────

  const summarySheet = workbook.addWorksheet('Resumen', {
    properties: { tabColor: { argb: '4472C4' } },
  });

  // Título
  summarySheet.mergeCells('A1:F1');
  const titleCell = summarySheet.getCell('A1');
  titleCell.value = 'Virtago 2 — Casos de Prueba E2E (Playwright)';
  titleCell.font = { bold: true, size: 18, color: { argb: 'FFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4472C4' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  summarySheet.getRow(1).height = 40;

  // Info del proyecto
  const infoData = [
    ['Proyecto', 'Virtago 2'],
    ['Framework de pruebas', 'Playwright'],
    ['Fecha de exportación', new Date().toLocaleDateString('es-UY', { year: 'numeric', month: 'long', day: 'numeric' })],
    ['Total de casos de prueba', TEST_CASES.length],
    ['Archivos de test', '3 (homepage.spec.ts, register.spec.ts, onboarding-distributor.spec.ts)'],
    ['Base URL', 'http://localhost:3002'],
    ['Navegadores configurados', 'Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari'],
  ];

  summarySheet.addRow([]);
  infoData.forEach(([key, value]) => {
    const row = summarySheet.addRow([key, value]);
    row.getCell(1).font = { bold: true };
    row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D9E2F3' } };
  });

  // Resumen por tipo
  summarySheet.addRow([]);
  summarySheet.addRow([]);
  const typeHeader = summarySheet.addRow(['Resumen por Tipo']);
  typeHeader.getCell(1).font = { bold: true, size: 14 };

  const typeCounts: Record<string, number> = {};
  TEST_CASES.forEach((tc) => {
    typeCounts[tc.type] = (typeCounts[tc.type] || 0) + 1;
  });
  Object.entries(typeCounts).forEach(([type, count]) => {
    const row = summarySheet.addRow([type, count]);
    row.getCell(1).font = { bold: true };
  });

  // Resumen por prioridad
  summarySheet.addRow([]);
  const prioHeader = summarySheet.addRow(['Resumen por Prioridad']);
  prioHeader.getCell(1).font = { bold: true, size: 14 };

  const prioCounts: Record<string, number> = {};
  TEST_CASES.forEach((tc) => {
    prioCounts[tc.priority] = (prioCounts[tc.priority] || 0) + 1;
  });
  Object.entries(prioCounts).forEach(([prio, count]) => {
    const row = summarySheet.addRow([prio, count]);
    row.getCell(1).font = { bold: true };
  });

  // Resumen por archivo
  summarySheet.addRow([]);
  const fileHeader = summarySheet.addRow(['Resumen por Archivo']);
  fileHeader.getCell(1).font = { bold: true, size: 14 };

  const fileCounts: Record<string, number> = {};
  TEST_CASES.forEach((tc) => {
    fileCounts[tc.file] = (fileCounts[tc.file] || 0) + 1;
  });
  Object.entries(fileCounts).forEach(([file, count]) => {
    const row = summarySheet.addRow([file, count]);
    row.getCell(1).font = { bold: true };
  });

  summarySheet.getColumn(1).width = 30;
  summarySheet.getColumn(2).width = 60;

  // ── Hoja 2: Casos de Prueba Detallados ──────────────────────────────────

  const detailSheet = workbook.addWorksheet('Casos de Prueba', {
    properties: { tabColor: { argb: '70AD47' } },
  });

  // Columnas
  detailSheet.columns = [
    { header: 'ID', key: 'id', width: 12 },
    { header: 'Suite', key: 'suite', width: 35 },
    { header: 'Sub-Suite', key: 'subSuite', width: 30 },
    { header: 'Caso de Prueba', key: 'testName', width: 45 },
    { header: 'Descripción', key: 'description', width: 55 },
    { header: 'Pasos', key: 'steps', width: 70 },
    { header: 'Resultado Esperado', key: 'expectedResult', width: 55 },
    { header: 'Tipo', key: 'type', width: 15 },
    { header: 'Prioridad', key: 'priority', width: 12 },
    { header: 'Archivo', key: 'file', width: 30 },
  ];

  // Estilo del header
  const headerRow = detailSheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '70AD47' } };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  headerRow.height = 30;

  // Agregar filas
  TEST_CASES.forEach((tc, index) => {
    const row = detailSheet.addRow(tc);

    // Wrap text en todas las celdas
    row.eachCell((cell) => {
      cell.alignment = { wrapText: true, vertical: 'top' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'D9D9D9' } },
        bottom: { style: 'thin', color: { argb: 'D9D9D9' } },
        left: { style: 'thin', color: { argb: 'D9D9D9' } },
        right: { style: 'thin', color: { argb: 'D9D9D9' } },
      };
    });

    // Colores alternos
    if (index % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F2F7ED' } };
      });
    }

    // Color por prioridad
    const prioCell = row.getCell('priority');
    switch (tc.priority) {
      case 'Alta':
        prioCell.font = { bold: true, color: { argb: 'C00000' } };
        break;
      case 'Media':
        prioCell.font = { bold: true, color: { argb: 'ED7D31' } };
        break;
      case 'Baja':
        prioCell.font = { color: { argb: '70AD47' } };
        break;
    }

    // Color por tipo
    const typeCell = row.getCell('type');
    const typeColors: Record<string, string> = {
      Funcional: '4472C4',
      Validación: 'ED7D31',
      Navegación: '7030A0',
      Rendimiento: 'FFC000',
      'UI/UX': '70AD47',
    };
    typeCell.font = { bold: true, color: { argb: typeColors[tc.type] || '000000' } };
  });

  // Auto-filter
  detailSheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: TEST_CASES.length + 1, column: 10 },
  };

  // Freeze header
  detailSheet.views = [{ state: 'frozen', ySplit: 1 }];

  // ── Hoja 3: Matriz de Trazabilidad ──────────────────────────────────────

  const matrixSheet = workbook.addWorksheet('Matriz Trazabilidad', {
    properties: { tabColor: { argb: 'ED7D31' } },
  });

  matrixSheet.columns = [
    { header: 'ID', key: 'id', width: 12 },
    { header: 'Caso de Prueba', key: 'testName', width: 45 },
    { header: 'Módulo', key: 'suite', width: 35 },
    { header: 'Tipo', key: 'type', width: 15 },
    { header: 'Prioridad', key: 'priority', width: 12 },
    { header: 'Estado', key: 'status', width: 15 },
    { header: 'Automatizado', key: 'automated', width: 15 },
    { header: 'Archivo', key: 'file', width: 30 },
  ];

  const matrixHeader = matrixSheet.getRow(1);
  matrixHeader.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 };
  matrixHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ED7D31' } };
  matrixHeader.alignment = { horizontal: 'center', vertical: 'middle' };
  matrixHeader.height = 28;

  TEST_CASES.forEach((tc, index) => {
    const row = matrixSheet.addRow({
      id: tc.id,
      testName: tc.testName,
      suite: tc.suite,
      type: tc.type,
      priority: tc.priority,
      status: 'Implementado',
      automated: 'Sí — Playwright',
      file: tc.file,
    });

    row.eachCell((cell) => {
      cell.alignment = { vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'D9D9D9' } },
        bottom: { style: 'thin', color: { argb: 'D9D9D9' } },
        left: { style: 'thin', color: { argb: 'D9D9D9' } },
        right: { style: 'thin', color: { argb: 'D9D9D9' } },
      };
    });

    if (index % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FDF2E9' } };
      });
    }

    // Status siempre verde
    row.getCell('status').font = { bold: true, color: { argb: '70AD47' } };
    row.getCell('automated').font = { bold: true, color: { argb: '4472C4' } };
  });

  matrixSheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: TEST_CASES.length + 1, column: 8 },
  };
  matrixSheet.views = [{ state: 'frozen', ySplit: 1 }];

  // ── Guardar archivo ─────────────────────────────────────────────────────

  const reportsDir = path.join(__dirname, 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const timestamp = new Date().toISOString().slice(11, 19).replace(/:/g, '');
  const fileName = `casos_de_prueba_e2e_${dateStr}_${timestamp}.xlsx`;
  const filePath = path.join(reportsDir, fileName);

  await workbook.xlsx.writeFile(filePath);

  console.log(`\n✅ Archivo XLSX generado exitosamente:`);
  console.log(`   📄 ${filePath}`);
  console.log(`\n📊 Contenido:`);
  console.log(`   • Hoja 1 — Resumen: estadísticas generales del proyecto`);
  console.log(`   • Hoja 2 — Casos de Prueba: ${TEST_CASES.length} casos detallados con pasos y resultados esperados`);
  console.log(`   • Hoja 3 — Matriz Trazabilidad: vista compacta con estado y automatización`);
  console.log(`\n📁 Tipos de prueba:`);
  Object.entries(typeCounts).forEach(([type, count]) => {
    console.log(`   • ${type}: ${count}`);
  });
  console.log(`\n🎯 Prioridades:`);
  Object.entries(prioCounts).forEach(([prio, count]) => {
    console.log(`   • ${prio}: ${count}`);
  });
}

exportToXlsx().catch(console.error);
