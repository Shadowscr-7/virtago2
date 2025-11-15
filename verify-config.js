#!/usr/bin/env node

/**
 * Script de verificación de configuración para deploy en Vercel
 * Ejecutar: node verify-config.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración de Vercel...\n');

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0
};

// 1. Verificar que existe vercel.json
console.log('📄 Verificando vercel.json...');
if (fs.existsSync('vercel.json')) {
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  
  if (vercelConfig.rewrites && vercelConfig.rewrites.length > 0) {
    console.log('  ✅ vercel.json existe y tiene rewrites configurados');
    checks.passed++;
    
    // Verificar rewrites importantes
    const hasRedoc = vercelConfig.rewrites.some(r => r.source.includes('redoc'));
    const hasApi = vercelConfig.rewrites.some(r => r.source.includes('api'));
    
    if (hasRedoc) {
      console.log('  ✅ Rewrite para /redoc configurado');
      checks.passed++;
    } else {
      console.log('  ⚠️  Rewrite para /redoc NO configurado');
      checks.warnings++;
    }
    
    if (hasApi) {
      console.log('  ✅ Rewrite para /api/* configurado');
      checks.passed++;
    } else {
      console.log('  ❌ Rewrite para /api/* NO configurado');
      checks.failed++;
    }
  } else {
    console.log('  ⚠️  vercel.json existe pero no tiene rewrites');
    checks.warnings++;
  }
} else {
  console.log('  ❌ vercel.json NO existe');
  checks.failed++;
}

console.log('');

// 2. Verificar .env.production
console.log('📄 Verificando .env.production...');
if (fs.existsSync('.env.production')) {
  const envProd = fs.readFileSync('.env.production', 'utf8');
  
  console.log('  ✅ .env.production existe');
  checks.passed++;
  
  // Verificar que use rutas relativas
  if (envProd.includes('NEXT_PUBLIC_API_URL=/api')) {
    console.log('  ✅ NEXT_PUBLIC_API_URL usa ruta relativa (/api)');
    checks.passed++;
  } else if (envProd.includes('NEXT_PUBLIC_API_URL=http')) {
    console.log('  ⚠️  NEXT_PUBLIC_API_URL usa URL absoluta (mejor usar /api con proxy)');
    checks.warnings++;
  } else {
    console.log('  ❌ NEXT_PUBLIC_API_URL no configurado en .env.production');
    checks.failed++;
  }
  
  // Verificar que no tenga secrets
  if (envProd.includes('sk-') || envProd.includes('secret')) {
    console.log('  ⚠️  ADVERTENCIA: Posible API key en .env.production (configurar en Vercel)');
    checks.warnings++;
  }
} else {
  console.log('  ⚠️  .env.production NO existe (crear desde .env.production.example)');
  checks.warnings++;
}

console.log('');

// 3. Verificar .gitignore
console.log('📄 Verificando .gitignore...');
if (fs.existsSync('.gitignore')) {
  const gitignore = fs.readFileSync('.gitignore', 'utf8');
  
  if (gitignore.includes('.env')) {
    console.log('  ✅ .gitignore incluye archivos .env*');
    checks.passed++;
  } else {
    console.log('  ❌ .gitignore NO protege archivos .env');
    checks.failed++;
  }
} else {
  console.log('  ❌ .gitignore NO existe');
  checks.failed++;
}

console.log('');

// 4. Verificar que .env.local no esté en git
console.log('🔐 Verificando seguridad...');
const { execSync } = require('child_process');
try {
  const trackedFiles = execSync('git ls-files', { encoding: 'utf8' });
  
  if (trackedFiles.includes('.env.local')) {
    console.log('  ❌ CRÍTICO: .env.local está siendo rastreado por Git!');
    console.log('     Ejecuta: git rm --cached .env.local');
    checks.failed++;
  } else {
    console.log('  ✅ .env.local NO está en Git (correcto)');
    checks.passed++;
  }
} catch (error) {
  console.log('  ⚠️  No se pudo verificar archivos de Git');
  checks.warnings++;
}

console.log('');

// 5. Verificar estructura del proyecto
console.log('📁 Verificando estructura del proyecto...');
const requiredDirs = [
  'src/api',
  'src/app',
  'src/components',
];

requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`  ✅ ${dir} existe`);
    checks.passed++;
  } else {
    console.log(`  ❌ ${dir} NO existe`);
    checks.failed++;
  }
});

console.log('');

// Resumen
console.log('═══════════════════════════════════════');
console.log('📊 RESUMEN DE VERIFICACIÓN');
console.log('═══════════════════════════════════════');
console.log(`✅ Pasadas:     ${checks.passed}`);
console.log(`⚠️  Advertencias: ${checks.warnings}`);
console.log(`❌ Fallidas:    ${checks.failed}`);
console.log('═══════════════════════════════════════');

if (checks.failed === 0 && checks.warnings === 0) {
  console.log('\n🎉 ¡Configuración lista para deploy en Vercel!');
  console.log('\n📝 Próximos pasos:');
  console.log('   1. Configura variables de entorno en Vercel');
  console.log('   2. git add vercel.json .env.production');
  console.log('   3. git commit -m "Configure Vercel proxy"');
  console.log('   4. git push origin master');
  console.log('   5. Verifica en: https://virtago.shop/redoc');
  process.exit(0);
} else if (checks.failed === 0) {
  console.log('\n⚠️  Hay algunas advertencias, pero puedes continuar');
  console.log('   Revisa los puntos marcados con ⚠️');
  process.exit(0);
} else {
  console.log('\n❌ Hay problemas que deben corregirse antes del deploy');
  console.log('   Revisa los puntos marcados con ❌');
  process.exit(1);
}
