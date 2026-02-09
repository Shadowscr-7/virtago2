# Endpoint de Estado de Onboarding

## Propósito
Detectar si un distribuidor tiene datos cargados en el sistema para mostrar el Empty State con invitación al wizard.

## Endpoint Propuesto

### GET `/api/distributor/onboarding-status`

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response exitoso (200):**
```json
{
  "hasData": false,
  "details": {
    "products": {
      "count": 0,
      "hasData": false
    },
    "clients": {
      "count": 0,
      "hasData": false
    },
    "priceLists": {
      "count": 0,
      "hasData": false
    },
    "prices": {
      "count": 0,
      "hasData": false
    },
    "discounts": {
      "count": 0,
      "hasData": false
    }
  },
  "completionPercentage": 0,
  "nextSteps": [
    "Importa tus productos",
    "Crea listas de precios",
    "Registra tus clientes"
  ],
  "isFirstLogin": true
}
```

**Response con datos (200):**
```json
{
  "hasData": true,
  "details": {
    "products": {
      "count": 150,
      "hasData": true
    },
    "clients": {
      "count": 45,
      "hasData": true
    },
    "priceLists": {
      "count": 3,
      "hasData": true
    },
    "prices": {
      "count": 450,
      "hasData": true
    },
    "discounts": {
      "count": 12,
      "hasData": true
    }
  },
  "completionPercentage": 85,
  "nextSteps": [],
  "isFirstLogin": false
}
```

## Lógica de Detección

El usuario se considera "sin datos" cuando:
- `products.count === 0` O
- `clients.count === 0` O  
- `priceLists.count === 0`

Si al menos uno de estos está vacío, `hasData = false`

## Query SQL Sugerido (PostgreSQL)

```sql
SELECT 
  (SELECT COUNT(*) FROM products WHERE distributor_id = $1) as product_count,
  (SELECT COUNT(*) FROM clients WHERE distributor_id = $1) as client_count,
  (SELECT COUNT(*) FROM price_lists WHERE distributor_id = $1) as price_list_count,
  (SELECT COUNT(*) FROM prices WHERE distributor_id = $1) as price_count,
  (SELECT COUNT(*) FROM discounts WHERE distributor_id = $1) as discount_count,
  (SELECT first_login FROM users WHERE id = $1) as is_first_login
```

## Caché Recomendado
- Este endpoint puede ser cacheado por 5 minutos
- Invalidar caché cuando se crea el primer producto/cliente/lista de precios

## Implementación Backend Sugerida

```javascript
// Node.js / Express / PostgreSQL
router.get('/onboarding-status', authMiddleware, async (req, res) => {
  try {
    const distributorId = req.user.id;
    
    const result = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM products WHERE distributor_id = $1) as product_count,
        (SELECT COUNT(*) FROM clients WHERE distributor_id = $1) as client_count,
        (SELECT COUNT(*) FROM price_lists WHERE distributor_id = $1) as price_list_count,
        (SELECT COUNT(*) FROM prices WHERE distributor_id = $1) as price_count,
        (SELECT COUNT(*) FROM discounts WHERE distributor_id = $1) as discount_count
    `, [distributorId]);
    
    const counts = result.rows[0];
    const productCount = parseInt(counts.product_count);
    const clientCount = parseInt(counts.client_count);
    const priceListCount = parseInt(counts.price_list_count);
    const priceCount = parseInt(counts.price_count);
    const discountCount = parseInt(counts.discount_count);
    
    const hasProducts = productCount > 0;
    const hasClients = clientCount > 0;
    const hasPriceLists = priceListCount > 0;
    
    // El usuario tiene datos si tiene al menos productos, clientes y listas de precios
    const hasData = hasProducts && hasClients && hasPriceLists;
    
    // Calcular porcentaje de completitud
    const steps = [
      hasProducts,
      hasClients,
      hasPriceLists,
      priceCount > 0,
      discountCount > 0
    ];
    const completionPercentage = Math.round((steps.filter(Boolean).length / steps.length) * 100);
    
    // Siguiente pasos sugeridos
    const nextSteps = [];
    if (!hasProducts) nextSteps.push("Importa tus productos");
    if (!hasPriceLists) nextSteps.push("Crea listas de precios");
    if (!hasClients) nextSteps.push("Registra tus clientes");
    if (priceCount === 0 && hasPriceLists) nextSteps.push("Asigna precios a tus productos");
    if (discountCount === 0) nextSteps.push("Configura descuentos y promociones");
    
    res.json({
      hasData,
      details: {
        products: { count: productCount, hasData: hasProducts },
        clients: { count: clientCount, hasData: hasClients },
        priceLists: { count: priceListCount, hasData: hasPriceLists },
        prices: { count: priceCount, hasData: priceCount > 0 },
        discounts: { count: discountCount, hasData: discountCount > 0 }
      },
      completionPercentage,
      nextSteps,
      isFirstLogin: false // Puedes implementar lógica adicional para esto
    });
    
  } catch (error) {
    console.error('Error en onboarding-status:', error);
    res.status(500).json({ error: 'Error obteniendo estado de onboarding' });
  }
});
```

## Notas Adicionales
- Considerar agregar un campo `first_login` en la tabla `users` para trackear el primer login
- Este endpoint debe ser llamado en el dashboard principal al cargar
- Considerar websocket/polling para actualizar en tiempo real después de usar el wizard
