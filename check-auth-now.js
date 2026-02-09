// ============================================
// 🔍 VERIFICADOR RÁPIDO DE AUTENTICACIÓN
// ============================================
// Ejecuta: node check-auth-now.js

console.log('\n🔍 Verificando estado de autenticación...\n');

// Simular localStorage del navegador
console.log('📋 Para verificar en el NAVEGADOR, abre DevTools (F12) y ejecuta:');
console.log('\n---COPY THIS---');
console.log(`
console.clear();
console.log('🔍 VERIFICACIÓN DE AUTENTICACIÓN\\n');

const token = localStorage.getItem('token');
const user = localStorage.getItem('user');

console.log('1️⃣ TOKEN:');
if (token) {
  console.log('✅ Token presente');
  console.log('📝 Token (primeros 50 chars):', token.substring(0, 50));
} else {
  console.log('❌ NO HAY TOKEN');
}

console.log('\\n2️⃣ USUARIO:');
if (user) {
  console.log('✅ Usuario presente');
  try {
    const parsedUser = JSON.parse(user);
    console.log('📝 Distributor Code:', parsedUser.distributorCode || 'NO ENCONTRADO');
    console.log('📝 Email:', parsedUser.email || 'NO ENCONTRADO');
  } catch (e) {
    console.log('⚠️ Error parseando usuario:', e.message);
  }
} else {
  console.log('❌ NO HAY USUARIO');
}

console.log('\\n3️⃣ ESTADO ESPERADO:');
if (token && user) {
  console.log('✅ AUTENTICADO - Dashboard debería funcionar');
} else {
  console.log('❌ NO AUTENTICADO - Deberías ser redirigido a /login');
}

console.log('\\n4️⃣ RUTA ACTUAL:');
console.log('📍', window.location.pathname);

console.log('\\n💡 Si estás en /admin sin token, el redirect NO está funcionando');
`);
console.log('---END COPY---\n');

console.log('✅ Copia y pega ese código en la consola del navegador');
console.log('📍 Asegúrate de estar en la página del dashboard (http://localhost:3000/admin)\n');
