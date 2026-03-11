/**
 * Genera archivos XLSX de prueba para cada paso del wizard.
 * Se ejecuta una vez para crear los fixtures:
 *
 *   npx tsx tests/fixtures/generate-xlsx-fixtures.ts
 *
 * Los archivos generados quedan en tests/fixtures/ y son usados
 * directamente por los tests de Playwright.
 */

import ExcelJS from 'exceljs';
import * as path from 'path';

const FIXTURES_DIR = path.resolve(__dirname);

// ─── Clientes ─────────────────────────────────────────────────────────────────

async function generateClientes() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Clientes');

  ws.columns = [
    { header: 'documentType', key: 'documentType', width: 14 },
    { header: 'document', key: 'document', width: 14 },
    { header: 'firstName', key: 'firstName', width: 20 },
    { header: 'lastName', key: 'lastName', width: 20 },
    { header: 'gender', key: 'gender', width: 8 },
    { header: 'email', key: 'email', width: 35 },
    { header: 'phone', key: 'phone', width: 18 },
    { header: 'phoneOptional', key: 'phoneOptional', width: 18 },
    { header: 'latitude', key: 'latitude', width: 14 },
    { header: 'longitude', key: 'longitude', width: 14 },
    { header: 'status', key: 'status', width: 8 },
    { header: 'hasUser', key: 'hasUser', width: 8 },
    { header: 'customerClass', key: 'customerClass', width: 16 },
    { header: 'customerClassTwo', key: 'customerClassTwo', width: 16 },
    { header: 'customerClassThree', key: 'customerClassThree', width: 16 },
    { header: 'customerClassDist', key: 'customerClassDist', width: 16 },
    { header: 'customerClassDistTwo', key: 'customerClassDistTwo', width: 16 },
    { header: 'distributorCodes', key: 'distributorCodes', width: 20 },
    { header: 'information.companyCode', key: 'companyCode', width: 18 },
    { header: 'information.clientCode', key: 'clientCode', width: 18 },
    { header: 'information.distributorName', key: 'distributorName', width: 25 },
    { header: 'information.sellerId', key: 'sellerId', width: 14 },
    { header: 'information.salesmanName', key: 'salesmanName', width: 25 },
    { header: 'information.routeId', key: 'routeId', width: 14 },
    { header: 'information.routeName', key: 'routeName', width: 20 },
    { header: 'information.pdv', key: 'pdv', width: 12 },
    { header: 'information.pdvname', key: 'pdvname', width: 20 },
    { header: 'information.visitDay', key: 'visitDay', width: 12 },
    { header: 'information.deliveryDay', key: 'deliveryDay', width: 12 },
    { header: 'information.frequency', key: 'frequency', width: 12 },
    { header: 'information.paymentMethodCode', key: 'paymentMethodCode', width: 20 },
    { header: 'information.paymentTerm', key: 'paymentTerm', width: 16 },
    { header: 'information.priceList', key: 'priceList', width: 18 },
    { header: 'information.withCredit', key: 'withCredit', width: 12 },
    { header: 'information.warehouse', key: 'warehouse', width: 22 },
  ];

  const clients = [
    {
      documentType: 'DNI', document: '12345678', firstName: 'Juan Carlos',
      lastName: 'Pérez Mendoza', gender: 'M', email: 'juan.perez@test-e2e.com',
      phone: '+51987654321', phoneOptional: '+51912345678',
      latitude: '-12.0464', longitude: '-77.0428', status: 'A', hasUser: 'false',
      customerClass: 'A', customerClassTwo: 'VIP', customerClassThree: 'Premium',
      customerClassDist: 'Nacional', customerClassDistTwo: 'Mayorista',
      distributorCodes: 'DIST01,DIST02', companyCode: 'COMP001', clientCode: 'CLI001',
      distributorName: 'Distribuidor Lima', sellerId: 'SELL001',
      salesmanName: 'Carlos Vendedor', routeId: 'R001', routeName: 'Ruta Lima Centro',
      pdv: 'PDV001', pdvname: 'Tienda Central', visitDay: 'Lunes',
      deliveryDay: 'Martes', frequency: 'Semanal', paymentMethodCode: 'CASH',
      paymentTerm: 'Net30', priceList: 'LISTA_PREMIUM', withCredit: 'true',
      warehouse: 'ALMACEN_LIMA',
    },
    {
      documentType: 'RUC', document: '20123456789', firstName: 'María Elena',
      lastName: 'González Torres', gender: 'F', email: 'maria.gonzalez@test-e2e.com',
      phone: '+51976543210', phoneOptional: '',
      latitude: '-12.1191', longitude: '-77.0297', status: 'A', hasUser: 'false',
      customerClass: 'B', customerClassTwo: 'Regular', customerClassThree: '',
      customerClassDist: 'Regional', customerClassDistTwo: 'Minorista',
      distributorCodes: 'DIST03', companyCode: 'COMP002', clientCode: 'CLI002',
      distributorName: 'Distribuidor Sur', sellerId: 'SELL002',
      salesmanName: 'Ana Vendedora', routeId: 'R002', routeName: 'Ruta Surquillo',
      pdv: 'PDV002', pdvname: 'Minimarket Sur', visitDay: 'Miércoles',
      deliveryDay: 'Jueves', frequency: 'Quincenal', paymentMethodCode: 'CREDIT',
      paymentTerm: 'Net60', priceList: 'LISTA_REGULAR', withCredit: 'true',
      warehouse: 'ALMACEN_SUR',
    },
    {
      documentType: 'DNI', document: '87654321', firstName: 'Roberto',
      lastName: 'Silva Ramos', gender: 'M', email: 'roberto.silva@test-e2e.com',
      phone: '+51965432109', phoneOptional: '+51954321098',
      latitude: '-12.0553', longitude: '-77.0311', status: 'A', hasUser: 'true',
      customerClass: 'C', customerClassTwo: 'Nuevo', customerClassThree: '',
      customerClassDist: 'Local', customerClassDistTwo: '',
      distributorCodes: 'DIST01', companyCode: 'COMP003', clientCode: 'CLI003',
      distributorName: 'Distribuidor Centro', sellerId: 'SELL001',
      salesmanName: 'Carlos Vendedor', routeId: 'R001', routeName: 'Ruta Lima Centro',
      pdv: 'PDV003', pdvname: 'Bodega Norte', visitDay: 'Viernes',
      deliveryDay: 'Sábado', frequency: 'Semanal', paymentMethodCode: 'CASH',
      paymentTerm: '', priceList: 'LISTA_BASICA', withCredit: 'false',
      warehouse: 'ALMACEN_LIMA',
    },
  ];

  clients.forEach(c => ws.addRow(c));
  await wb.xlsx.writeFile(path.join(FIXTURES_DIR, 'clientes_test.xlsx'));
  console.log('✅ clientes_test.xlsx generado (3 clientes)');
}

// ─── Productos ────────────────────────────────────────────────────────────────

async function generateProductos() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Productos');

  ws.columns = [
    { header: 'productId', key: 'productId', width: 14 },
    { header: 'sku', key: 'sku', width: 14 },
    { header: 'name', key: 'name', width: 35 },
    { header: 'title', key: 'title', width: 35 },
    { header: 'shortDescription', key: 'shortDescription', width: 50 },
    { header: 'fullDescription', key: 'fullDescription', width: 60 },
    { header: 'brand', key: 'brand', width: 16 },
    { header: 'category', key: 'category', width: 18 },
    { header: 'subCategory', key: 'subCategory', width: 18 },
    { header: 'status', key: 'status', width: 10 },
    { header: 'published', key: 'published', width: 10 },
    { header: 'price', key: 'price', width: 12 },
    { header: 'priceSale', key: 'priceSale', width: 12 },
    { header: 'tax', key: 'tax', width: 8 },
    { header: 'stockQuantity', key: 'stockQuantity', width: 14 },
    { header: 'weight', key: 'weight', width: 10 },
    { header: 'vendor', key: 'vendor', width: 18 },
    { header: 'supplierCode', key: 'supplierCode', width: 14 },
    { header: 'uoM', key: 'uoM', width: 8 },
    { header: 'packSize', key: 'packSize', width: 10 },
    { header: 'gtin', key: 'gtin', width: 16 },
    { header: 'markAsNew', key: 'markAsNew', width: 10 },
    { header: 'isTopSelling', key: 'isTopSelling', width: 12 },
    { header: 'productSlug', key: 'productSlug', width: 30 },
  ];

  const products = [
    {
      productId: 'PROD-001', sku: 'LAP-GAME-001', name: 'Laptop Gaming Pro X15',
      title: 'Laptop Gaming Pro X15 RTX 4070', shortDescription: 'Laptop gaming con RTX 4070 y 32GB RAM',
      fullDescription: 'Laptop gaming profesional con procesador Intel i9, GPU NVIDIA RTX 4070, 32GB DDR5, SSD 1TB NVMe',
      brand: 'TechPro', category: 'Computadoras', subCategory: 'Laptops Gaming',
      status: 'active', published: 'true', price: '1599.99', priceSale: '1399.99',
      tax: '18', stockQuantity: '25', weight: '2.5', vendor: 'TechPro International',
      supplierCode: 'SUP001', uoM: 'UN', packSize: '1', gtin: '7501234567890',
      markAsNew: 'true', isTopSelling: 'true', productSlug: 'laptop-gaming-pro-x15',
    },
    {
      productId: 'PROD-002', sku: 'MON-CURV-002', name: 'Monitor Curvo 34" UltraWide',
      title: 'Monitor Curvo 34 pulgadas 165Hz', shortDescription: 'Monitor curvo ultrawide para trabajo y gaming',
      fullDescription: 'Monitor curvo 34" WQHD 3440x1440, 165Hz, 1ms, HDR400, USB-C con Power Delivery',
      brand: 'ViewMax', category: 'Monitores', subCategory: 'Monitores Gaming',
      status: 'active', published: 'true', price: '549.99', priceSale: '',
      tax: '18', stockQuantity: '12', weight: '8.2', vendor: 'ViewMax Electronics',
      supplierCode: 'SUP002', uoM: 'UN', packSize: '1', gtin: '7501234567891',
      markAsNew: 'true', isTopSelling: 'false', productSlug: 'monitor-curvo-34-ultrawide',
    },
    {
      productId: 'PROD-003', sku: 'TEC-MEC-003', name: 'Teclado Mecánico Cherry MX',
      title: 'Teclado Mecánico RGB Cherry MX Blue', shortDescription: 'Teclado mecánico con switches Cherry MX',
      fullDescription: 'Teclado mecánico 104 teclas, switches Cherry MX Blue, RGB per-key, aluminio',
      brand: 'KeyMaster', category: 'Periféricos', subCategory: 'Teclados',
      status: 'active', published: 'true', price: '129.99', priceSale: '99.99',
      tax: '18', stockQuantity: '50', weight: '1.1', vendor: 'KeyMaster Corp',
      supplierCode: 'SUP003', uoM: 'UN', packSize: '1', gtin: '7501234567892',
      markAsNew: 'false', isTopSelling: 'true', productSlug: 'teclado-mecanico-cherry-mx',
    },
    {
      productId: 'PROD-004', sku: 'AUD-PRO-004', name: 'Auriculares Pro 7.1 Surround',
      title: 'Auriculares Gaming Pro 7.1 Virtual Surround', shortDescription: 'Auriculares gaming con sonido envolvente 7.1',
      fullDescription: 'Auriculares over-ear con sonido virtual 7.1, micrófono retráctil, RGB, drivers de 50mm',
      brand: 'AudioMax', category: 'Audio', subCategory: 'Auriculares',
      status: 'active', published: 'true', price: '89.99', priceSale: '79.99',
      tax: '18', stockQuantity: '35', weight: '0.38', vendor: 'AudioMax Sound',
      supplierCode: 'SUP004', uoM: 'UN', packSize: '1', gtin: '7501234567893',
      markAsNew: 'false', isTopSelling: 'false', productSlug: 'auriculares-pro-71-surround',
    },
    {
      productId: 'PROD-005', sku: 'MOU-WIR-005', name: 'Mouse Inalámbrico Ergonómico',
      title: 'Mouse Inalámbrico Ergonómico 16000 DPI', shortDescription: 'Mouse wireless de alta precisión para gaming y productividad',
      fullDescription: 'Mouse inalámbrico ergonómico, sensor óptico 16000 DPI, batería 80h, carga rápida USB-C',
      brand: 'TechPro', category: 'Periféricos', subCategory: 'Mouse',
      status: 'active', published: 'true', price: '69.99', priceSale: '',
      tax: '18', stockQuantity: '60', weight: '0.12', vendor: 'TechPro International',
      supplierCode: 'SUP001', uoM: 'UN', packSize: '1', gtin: '7501234567894',
      markAsNew: 'true', isTopSelling: 'false', productSlug: 'mouse-inalambrico-ergonomico',
    },
  ];

  products.forEach(p => ws.addRow(p));
  await wb.xlsx.writeFile(path.join(FIXTURES_DIR, 'productos_test.xlsx'));
  console.log('✅ productos_test.xlsx generado (5 productos)');
}

// ─── Listas de Precios ───────────────────────────────────────────────────────

async function generateListasPrecios() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Listas de Precios');

  ws.columns = [
    { header: 'price_list_id', key: 'price_list_id', width: 16 },
    { header: 'name', key: 'name', width: 30 },
    { header: 'status', key: 'status', width: 10 },
    { header: 'default', key: 'default', width: 10 },
    { header: 'priority', key: 'priority', width: 10 },
    { header: 'description', key: 'description', width: 45 },
    { header: 'notes', key: 'notes', width: 40 },
    { header: 'applies_to', key: 'applies_to', width: 18 },
    { header: 'customer_type', key: 'customer_type', width: 14 },
    { header: 'channel', key: 'channel', width: 12 },
    { header: 'country', key: 'country', width: 12 },
    { header: 'region', key: 'region', width: 16 },
    { header: 'currency', key: 'currency', width: 10 },
    { header: 'discount_type', key: 'discount_type', width: 14 },
    { header: 'start_date', key: 'start_date', width: 24 },
    { header: 'end_date', key: 'end_date', width: 24 },
    { header: 'minimum_quantity', key: 'minimum_quantity', width: 14 },
    { header: 'maximum_quantity', key: 'maximum_quantity', width: 14 },
    { header: 'tags', key: 'tags', width: 30 },
  ];

  const priceLists = [
    {
      price_list_id: 'PL-TEST-001', name: 'Lista Premium E2E Test',
      status: 'active', default: 'true', priority: '1',
      description: 'Lista de precios premium para pruebas E2E',
      notes: 'Generada automáticamente por tests Playwright',
      applies_to: 'specific_products', customer_type: 'wholesale',
      channel: 'online', country: 'Uruguay', region: 'Sudamérica',
      currency: 'USD', discount_type: 'percentage',
      start_date: '2026-01-01T00:00:00.000Z', end_date: '2026-12-31T23:59:59.000Z',
      minimum_quantity: '10', maximum_quantity: '5000',
      tags: 'premium;wholesale;e2e-test',
    },
    {
      price_list_id: 'PL-TEST-002', name: 'Lista Retail E2E Test',
      status: 'active', default: 'false', priority: '2',
      description: 'Lista de precios retail para pruebas E2E',
      notes: 'Aplicable a clientes minoristas',
      applies_to: 'all', customer_type: 'retail',
      channel: 'all', country: 'Uruguay', region: 'Sudamérica',
      currency: 'USD', discount_type: 'fixed',
      start_date: '2026-01-01T00:00:00.000Z', end_date: '2026-06-30T23:59:59.000Z',
      minimum_quantity: '1', maximum_quantity: '100',
      tags: 'retail;e2e-test',
    },
  ];

  priceLists.forEach(pl => ws.addRow(pl));
  await wb.xlsx.writeFile(path.join(FIXTURES_DIR, 'listas_precios_test.xlsx'));
  console.log('✅ listas_precios_test.xlsx generado (2 listas)');
}

// ─── Precios ──────────────────────────────────────────────────────────────────

async function generatePrecios() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Precios');

  ws.columns = [
    { header: 'price_list_id', key: 'price_list_id', width: 16 },
    { header: 'productId', key: 'productId', width: 16 },
    { header: 'productName', key: 'productName', width: 35 },
    { header: 'basePrice', key: 'basePrice', width: 12 },
    { header: 'cost', key: 'cost', width: 12 },
    { header: 'margin', key: 'margin', width: 10 },
    { header: 'currency', key: 'currency', width: 10 },
  ];

  const prices = [
    { price_list_id: 'PL-TEST-001', productId: 'PROD-001', productName: 'Laptop Gaming Pro X15', basePrice: '1599.99', cost: '1100.00', margin: '45.45', currency: 'USD' },
    { price_list_id: 'PL-TEST-001', productId: 'PROD-002', productName: 'Monitor Curvo 34" UltraWide', basePrice: '549.99', cost: '380.00', margin: '44.73', currency: 'USD' },
    { price_list_id: 'PL-TEST-001', productId: 'PROD-003', productName: 'Teclado Mecánico Cherry MX', basePrice: '129.99', cost: '75.00', margin: '73.32', currency: 'USD' },
    { price_list_id: 'PL-TEST-001', productId: 'PROD-004', productName: 'Auriculares Pro 7.1 Surround', basePrice: '89.99', cost: '50.00', margin: '79.98', currency: 'USD' },
    { price_list_id: 'PL-TEST-001', productId: 'PROD-005', productName: 'Mouse Inalámbrico Ergonómico', basePrice: '69.99', cost: '40.00', margin: '74.98', currency: 'USD' },
    { price_list_id: 'PL-TEST-002', productId: 'PROD-001', productName: 'Laptop Gaming Pro X15', basePrice: '1699.99', cost: '1100.00', margin: '54.54', currency: 'USD' },
    { price_list_id: 'PL-TEST-002', productId: 'PROD-002', productName: 'Monitor Curvo 34" UltraWide', basePrice: '599.99', cost: '380.00', margin: '57.89', currency: 'USD' },
  ];

  prices.forEach(p => ws.addRow(p));
  await wb.xlsx.writeFile(path.join(FIXTURES_DIR, 'precios_test.xlsx'));
  console.log('✅ precios_test.xlsx generado (7 precios)');
}

// ─── Descuentos ───────────────────────────────────────────────────────────────

async function generateDescuentos() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Descuentos');

  ws.columns = [
    { header: 'name', key: 'name', width: 30 },
    { header: 'discount_id', key: 'discount_id', width: 18 },
    { header: 'description', key: 'description', width: 45 },
    { header: 'discount_type', key: 'discount_type', width: 14 },
    { header: 'discount_value', key: 'discount_value', width: 14 },
    { header: 'currency', key: 'currency', width: 10 },
    { header: 'min_purchase_amount', key: 'min_purchase_amount', width: 18 },
    { header: 'max_discount_amount', key: 'max_discount_amount', width: 18 },
    { header: 'start_date', key: 'start_date', width: 24 },
    { header: 'end_date', key: 'end_date', width: 24 },
    { header: 'is_active', key: 'is_active', width: 10 },
    { header: 'usage_limit', key: 'usage_limit', width: 12 },
    { header: 'usage_limit_per_customer', key: 'usage_limit_per_customer', width: 22 },
  ];

  const discounts = [
    {
      name: 'Promo E2E 20% OFF', discount_id: 'DISC-E2E-001',
      description: 'Descuento E2E test — 20% en todos los productos',
      discount_type: 'percentage', discount_value: '20', currency: 'USD',
      min_purchase_amount: '50', max_discount_amount: '200',
      start_date: '2026-01-01T00:00:00Z', end_date: '2026-12-31T23:59:59Z',
      is_active: 'true', usage_limit: '1000', usage_limit_per_customer: '5',
    },
    {
      name: 'Descuento Fijo $50', discount_id: 'DISC-E2E-002',
      description: 'Descuento fijo de $50 para compras mayores a $200',
      discount_type: 'fixed', discount_value: '50', currency: 'USD',
      min_purchase_amount: '200', max_discount_amount: '50',
      start_date: '2026-03-01T00:00:00Z', end_date: '2026-09-30T23:59:59Z',
      is_active: 'true', usage_limit: '500', usage_limit_per_customer: '2',
    },
    {
      name: 'Black Friday E2E 40%', discount_id: 'DISC-E2E-003',
      description: 'Simulación de descuento Black Friday para test',
      discount_type: 'percentage', discount_value: '40', currency: 'USD',
      min_purchase_amount: '100', max_discount_amount: '800',
      start_date: '2026-11-24T00:00:00Z', end_date: '2026-11-30T23:59:59Z',
      is_active: 'false', usage_limit: '5000', usage_limit_per_customer: '3',
    },
  ];

  discounts.forEach(d => ws.addRow(d));
  await wb.xlsx.writeFile(path.join(FIXTURES_DIR, 'descuentos_test.xlsx'));
  console.log('✅ descuentos_test.xlsx generado (3 descuentos)');
}

// ─── Archivo vacío (para tests de validación) ─────────────────────────────────

async function generateEmpty() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Vacío');
  ws.columns = [{ header: 'nombre', key: 'nombre', width: 20 }];
  // Sin filas de datos — solo el header
  await wb.xlsx.writeFile(path.join(FIXTURES_DIR, 'archivo_vacio_test.xlsx'));
  console.log('✅ archivo_vacio_test.xlsx generado (0 filas)');
}

// ─── Archivo con columnas incorrectas (para tests de error) ───────────────────

async function generateColumnasMalas() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Datos');
  ws.columns = [
    { header: 'columna_erronea_1', key: 'c1', width: 20 },
    { header: 'otra_columna_mala', key: 'c2', width: 20 },
    { header: 'no_existe', key: 'c3', width: 20 },
  ];
  ws.addRow({ c1: 'dato1', c2: 'dato2', c3: 'dato3' });
  ws.addRow({ c1: 'dato4', c2: 'dato5', c3: 'dato6' });
  await wb.xlsx.writeFile(path.join(FIXTURES_DIR, 'columnas_incorrectas_test.xlsx'));
  console.log('✅ columnas_incorrectas_test.xlsx generado (columnas incorrectas)');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n📦 Generando archivos XLSX de test para el Wizard...\n');

  await generateClientes();
  await generateProductos();
  await generateListasPrecios();
  await generatePrecios();
  await generateDescuentos();
  await generateEmpty();
  await generateColumnasMalas();

  console.log('\n✅ Todos los fixtures XLSX generados en tests/fixtures/\n');
}

main().catch(console.error);
