#!/usr/bin/env node

/**
 * Script para verificar si el endpoint de onboarding está implementado
 * Ejecutar con: node test-onboarding-endpoint.js
 */

const https = require('https');
const http = require('http');

// Configuración
const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const TOKEN = process.env.AUTH_TOKEN || '';

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║       🔍 Verificador de Endpoint de Onboarding                 ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

console.log(`📍 URL Base: ${BASE_URL}`);
console.log(`🔐 Token: ${TOKEN ? '✅ Configurado' : '❌ No configurado (usar variable AUTH_TOKEN)'}\n`);

if (!TOKEN) {
  console.log('⚠️  ADVERTENCIA: No se proporcionó token de autenticación');
  console.log('   Para probarlo con autenticación, ejecuta:');
  console.log('   AUTH_TOKEN=tu_token_aqui node test-onboarding-endpoint.js\n');
  console.log('   Continuando sin token...\n');
}

console.log('🔍 Verificando endpoint: /api/distributor/onboarding-status\n');
console.log('⏳ Esperando respuesta...\n');

const url = new URL('/api/distributor/onboarding-status', BASE_URL);
const isHttps = url.protocol === 'https:';
const client = isHttps ? https : http;

const options = {
  method: 'GET',
  hostname: url.hostname,
  port: url.port || (isHttps ? 443 : 80),
  path: url.pathname,
  headers: {
    'Content-Type': 'application/json',
    ...(TOKEN && { 'Authorization': `Bearer ${TOKEN}` })
  }
};

const req = client.request(options, (res) => {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`📊 Status Code: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);
  console.log('═══════════════════════════════════════════════════════════════\n');

  let data = '';
  res.on('data', chunk => data += chunk);

  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ ¡ENDPOINT IMPLEMENTADO Y FUNCIONANDO!\n');
      
      try {
        const jsonData = JSON.parse(data);
        console.log('📦 Response data:');
        console.log(JSON.stringify(jsonData, null, 2));
        
        console.log('\n╔════════════════════════════════════════════════════════════════╗');
        console.log('║                     📊 RESUMEN                                 ║');
        console.log('╠════════════════════════════════════════════════════════════════╣');
        console.log(`║  ¿Tiene datos?: ${jsonData.hasData ? '✅ Sí' : '❌ No'}`.padEnd(65) + '║');
        console.log(`║  Completitud: ${jsonData.completionPercentage}%`.padEnd(65) + '║');
        console.log(`║  Clientes: ${jsonData.details?.clients?.count || 0}`.padEnd(65) + '║');
        console.log(`║  Productos: ${jsonData.details?.products?.count || 0}`.padEnd(65) + '║');
        console.log(`║  Listas: ${jsonData.details?.priceLists?.count || 0}`.padEnd(65) + '║');
        console.log(`║  Precios: ${jsonData.details?.prices?.count || 0}`.padEnd(65) + '║');
        console.log(`║  Descuentos: ${jsonData.details?.discounts?.count || 0}`.padEnd(65) + '║');
        console.log('╚════════════════════════════════════════════════════════════════╝\n');
        
        console.log('🎉 El backend está implementado correctamente!');
        console.log('💡 El sistema ya NO usará datos mock de localStorage');
        console.log('✨ Puedes usar: api.onboarding.getStatus() en tu código\n');
        
      } catch (e) {
        console.log('⚠️  Respuesta no es JSON válido:');
        console.log(data);
      }
      
    } else if (res.statusCode === 404) {
      console.log('❌ ENDPOINT NO IMPLEMENTADO (404 Not Found)\n');
      console.log('📄 El backend aún no tiene este endpoint.');
      console.log('📋 Comparte estos archivos con el equipo de backend:');
      console.log('   • ONBOARDING_STATUS_ENDPOINT.md');
      console.log('   • VERIFICAR_ENDPOINT_ONBOARDING.md\n');
      console.log('💡 Mientras tanto, el sistema usará datos mock de localStorage\n');
      
    } else if (res.statusCode === 401) {
      console.log('🔒 ERROR DE AUTENTICACIÓN (401 Unauthorized)\n');
      console.log('❌ Token inválido, expirado o no proporcionado');
      console.log('💡 Soluciones:');
      console.log('   1. Haz login en la app y copia el token desde localStorage');
      console.log('   2. Ejecuta: AUTH_TOKEN=tu_token node test-onboarding-endpoint.js');
      console.log('   3. O prueba desde el navegador con: virtago.checkBackendEndpoint()\n');
      
      if (data) {
        console.log('📋 Respuesta del servidor:');
        console.log(data, '\n');
      }
      
    } else if (res.statusCode === 403) {
      console.log('🚫 ACCESO DENEGADO (403 Forbidden)\n');
      console.log('❌ El usuario no tiene permisos (no es distribuidor)');
      console.log('💡 Asegúrate de estar logueado con una cuenta de distribuidor\n');
      
    } else if (res.statusCode === 500) {
      console.log('💥 ERROR DEL SERVIDOR (500 Internal Server Error)\n');
      console.log('✅ El endpoint SÍ existe pero tiene un bug');
      console.log('📋 Respuesta del servidor:');
      console.log(data);
      console.log('\n🐛 Revisa los logs del backend para ver el error\n');
      
    } else {
      console.log(`⚠️  RESPUESTA INESPERADA (${res.statusCode})\n`);
      console.log('📋 Respuesta:');
      console.log(data, '\n');
    }
  });
});

req.on('error', (error) => {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('❌ ERROR DE RED\n');
  console.error(`Error: ${error.message}\n`);
  
  console.log('💡 Posibles causas:');
  console.log('   1. El backend no está corriendo');
  console.log('      → Inicia el backend con: npm run dev (backend)');
  console.log('   2. La URL es incorrecta');
  console.log('      → Verifica la URL en .env o usa: API_URL=http://... node test-...');
  console.log('   3. Problema de red/firewall');
  console.log('      → Verifica tu conexión y configuración de firewall\n');
  
  console.log('🔍 Intentando conectar a:', BASE_URL);
  console.log('═══════════════════════════════════════════════════════════════\n');
});

req.end();
