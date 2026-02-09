# 🔧 Solución: Dashboard muestra 0 registros después del Wizard

## 🎯 Problema
Después de completar el wizard de configuración e importar datos (clientes, productos, precios), el dashboard muestra que tienes **0 registrados** en todo.

## 🔍 Causa
El sistema de onboarding consulta un endpoint del backend (`/api/distributor/onboarding-status`) que **aún no está implementado**. El mock temporal no sabía que completaste el wizard porque esa funcionalidad fue agregada **después** de que lo usaras.

## ✅ Solución Implementada

Ahora el sistema:
1. **Guarda automáticamente** los datos del wizard en `localStorage` al completar
2. **Lee del localStorage** si el backend no responde
3. **Muestra los datos reales** importados en el dashboard

## 📋 Cómo Solucionarlo AHORA (Ya completaste el wizard)

### Opción 1: Simular que completaste el wizard (Recomendado)

1. **Abre la consola del navegador:**
   - Windows/Linux: `F12` o `Ctrl + Shift + J`
   - Mac: `Cmd + Option + J`

2. **Ejecuta este comando:**
   ```javascript
   virtago.simulateWizardCompleted()
   ```

3. **Recarga la página** (`F5` o `Ctrl + R`)

4. ✅ **El dashboard ahora mostrará datos mockeados** y verás el dashboard normal en lugar del Empty State

### Opción 2: Actualizar contadores manualmente

Si quieres poner los números EXACTOS que importaste:

```javascript
virtago.updateWizardCounts({
  clients: 10,      // Número de clientes que importaste
  products: 25,     // Número de productos que importaste
  priceLists: 2,    // Número de listas de precios
  prices: 50,       // Número de precios configurados
  discounts: 5      // Número de descuentos creados
})
```

Luego recarga la página.

### Opción 3: Volver a ejecutar el wizard

1. Ve a: `/admin/configuracion-rapida`
2. Completa el wizard nuevamente
3. Al finalizar, ahora SÍ guardará el estado en localStorage
4. El dashboard mostrará los datos correctos

## 🧪 Comandos de Debug Disponibles

En la consola del navegador tienes acceso a:

### Ver estado actual
```javascript
virtago.getWizardState()
```
Muestra cuántos registros tienes guardados.

### Limpiar estado (ver Empty State)
```javascript
virtago.clearWizardState()
```
Útil para volver a ver el Empty State de bienvenida.

### Actualizar contadores
```javascript
virtago.updateWizardCounts({ 
  clients: 100, 
  products: 250,
  priceLists: 3,
  prices: 500,
  discounts: 10
})
```

## 🔄 Botón de Actualización en el Dashboard

En la esquina superior derecha del dashboard, al lado de la fecha, hay un botón **"🔄 Actualizar"** que recarga el estado de onboarding sin recargar toda la página.

Úsalo después de:
- Ejecutar comandos en la consola
- Completar el wizard
- Modificar el localStorage

## 🚀 Para el Futuro (Cuando el Backend esté Listo)

Una vez implementes el endpoint `/api/distributor/onboarding-status` en el backend:

1. El sistema automáticamente dejará de usar el mock
2. Consultará los datos reales del backend
3. Mostrará los contadores exactos de tu base de datos
4. Ya no necesitarás los comandos de debug

### Endpoint a Implementar

Ver documentación completa en: `ONBOARDING_STATUS_ENDPOINT.md`

```
GET /api/distributor/onboarding-status
Authorization: Bearer {jwt_token}
```

## 🐛 Troubleshooting

### Problema: Los comandos no funcionan
**Solución:** Asegúrate de estar en la página `/admin` (dashboard). Los comandos solo se cargan en desarrollo mode.

### Problema: Sigue mostrando 0 después de simular
**Solución:** 
1. Abre DevTools → Application → Local Storage
2. Busca la key `virtago_wizard_completed`
3. Verifica que tenga datos
4. Recarga la página con `Ctrl + F5` (forzar recarga)

### Problema: No aparece el objeto `virtago` en consola
**Solución:** Espera 2-3 segundos después de cargar la página. Si no aparece, recarga.

## 📊 Validar que Funciona

Después de ejecutar `virtago.simulateWizardCompleted()` y recargar:

1. ✅ **Dashboard normal** se muestra (no Empty State)
2. ✅ **Estadísticas** muestran números (no ceros)
3. ✅ **Gráficas** aparecen con datos
4. ✅ **Acciones rápidas** son visibles

## 💡 Resumen Rápido

```bash
# En la consola del navegador:

# 1. Simular wizard completado
virtago.simulateWizardCompleted()

# 2. Recargar página
location.reload()

# 3. ¡Listo! Verás el dashboard con datos
```

## 📞 Soporte Adicional

Si después de estos pasos sigues viendo 0 registros:

1. Verifica la consola del navegador (F12)
2. Busca errores en rojo
3. Ejecuta: `virtago.getWizardState()` y copia el resultado
4. Comparte los logs para debug adicional

---

**Fecha de actualización:** 2026-02-08  
**Versión del fix:** 1.0.0
