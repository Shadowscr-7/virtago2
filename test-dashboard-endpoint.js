/**
 * 📊 Test del Endpoint de Dashboard Home
 * 
 * Este script verifica si el endpoint /api/distributor/dashboard-home está implementado
 * y devuelve los datos correctos.
 * 
 * BACKEND IMPLEMENTADO ✅
 */

const http = require('http');

// ===========================
// CONFIGURACIÓN
// ===========================
const BASE_URL = 'http://localhost:3002';
const AUTH_TOKEN = process.env.AUTH_TOKEN || ''; // Configu con: AUTH_TOKEN="tu_token_aqui" node test-dashboard-endpoint.js

// ===========================
// FUNCIONES HELPER
// ===========================
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 3002,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    // Agregar token si existe
    if (AUTH_TOKEN) {
      options.headers['Authorization'] = `Bearer ${AUTH_TOKEN}`;
    }
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

function printBox(title) {
  const width = 70;
  console.log('\n╔' + '═'.repeat(width) + '╗');
  console.log('║' + title.padEnd(width) + '║');
  console.log('╚' + '═'.repeat(width) + '╝\n');
}

function printSuccess(message) {
  console.log('✅', message);
}

function printError(message) {
  console.log('❌', message);
}

function printWarning(message) {
  console.log('⚠️ ', message);
}

function printInfo(message) {
  console.log('ℹ️ ', message);
}

// ===========================
// TEST PRINCIPAL
// ===========================
async function testDashboardEndpoint() {
  printBox('       🔍 Test de Endpoint: Dashboard Home             ');
  
  console.log('📍 URL Base:', BASE_URL);
  console.log('🔐 Token:', AUTH_TOKEN ? '✅ Configurado' : '❌ No configurado (usar variable AUTH_TOKEN)');
  console.log('');
  
  if (!AUTH_TOKEN) {
    printWarning('ADVERTENCIA: No se proporcionó token de autenticación');
    printInfo('Configura el token con: AUTH_TOKEN="tu_token" node test-dashboard-endpoint.js');
    console.log('');
  }
  
  try {
    console.log('🔍 Verificando endpoint: /api/distributor/dashboard-home');
    console.log('⏳ Esperando respuesta...\n');
    
    const response = await makeRequest('/api/distributor/dashboard-home');
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`📡 Status Code: ${response.statusCode}`);
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    // Verificar status code
    if (response.statusCode === 200) {
      printSuccess('Endpoint implementado y funcionando correctamente');
      console.log('\n📊 Respuesta del servidor:\n');
      console.log(JSON.stringify(response.data, null, 2));
      
      // Validar estructura
      console.log('\n═══════════════════════════════════════════════════════════════');
      console.log('🔍 VALIDACIÓN DE ESTRUCTURA');
      console.log('═══════════════════════════════════════════════════════════════\n');
      
      const data = response.data.data || response.data;
      
      // Validar stats
      if (data.stats) {
        printSuccess('✓ stats: Presente');
        if (data.stats.sales) printSuccess('  ✓ stats.sales');
        if (data.stats.orders) printSuccess('  ✓ stats.orders');
        if (data.stats.products) printSuccess('  ✓ stats.products');
        if (data.stats.clients) printSuccess('  ✓ stats.clients');
      } else {
        printError('✗ stats: Faltante');
      }
      
      // Validar salesChart
      if (data.salesChart) {
        printSuccess('✓ salesChart: Presente');
        if (data.salesChart.data && Array.isArray(data.salesChart.data)) {
          printSuccess(`  ✓ salesChart.data (${data.salesChart.data.length} items)`);
        }
      } else {
        printError('✗ salesChart: Faltante');
      }
      
      // Validar recentActivity
      if (data.recentActivity) {
        printSuccess('✓ recentActivity: Presente');
        if (Array.isArray(data.recentActivity)) {
          printSuccess(`  ✓ Array con ${data.recentActivity.length} actividades`);
        }
      } else {
        printError('✗ recentActivity: Faltante');
      }
      
    } else if (response.statusCode === 401) {
      printError('Error de Autenticación (401)');
      console.log('\n💡 Posibles causas:');
      console.log('   1. No se proporcionó token (usar AUTH_TOKEN="token" node test-dashboard-endpoint.js)');
      console.log('   2. El token es inválido o expiró');
      console.log('   3. El token no tiene permisos de distributor');
      console.log('\n📋 Respuesta del servidor:');
      console.log(JSON.stringify(response.data, null, 2));
      
    } else if (response.statusCode === 404) {
      printError('Endpoint NO encontrado (404)');
      console.log('\n💡 El backend necesita implementar: GET /api/distributor/dashboard-home');
      console.log('📄 Ver documentación en: DASHBOARD_HOME_ENDPOINT.md');
      
    } else if (response.statusCode === 500) {
      printError('Error interno del servidor (500)');
      console.log('\n📋 Respuesta del servidor:');
      console.log(JSON.stringify(response.data, null, 2));
      
    } else {
      printWarning(`Status code inesperado: ${response.statusCode}`);
      console.log('\n📋 Respuesta del servidor:');
      console.log(JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    console.log('═══════════════════════════════════════════════════════════════');
    printError('ERROR DE RED');
    console.log('Error:', error.message);
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log('💡 Posibles causas:');
    console.log('   1. El backend no está corriendo');
    console.log('   2. La URL base es incorrecta (actual: ' + BASE_URL + ')');
    console.log('   3. Problema de red/firewall');
    console.log('\n🔍 Intentando conectar a:', BASE_URL);
  }
  
  console.log('\n');
}

// Ejecutar test
testDashboardEndpoint();
