# 🔧 Ejemplo de Implementación Backend - Dashboard Home

Este documento proporciona ejemplos de código para implementar el endpoint de dashboard home en diferentes frameworks de backend.

---

## 📋 Tabla de Contenidos

1. [Express.js / Node.js](#expressjs--nodejs)
2. [Validaciones y Helpers](#validaciones-y-helpers)
3. [Consultas a Base de Datos (Ejemplos)](#consultas-a-base-de-datos)
4. [Testing](#testing)

---

## Express.js / Node.js

### 1. Middleware de Autenticación

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticateDistributor = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Failed To Authenticate Token',
        error: { code: 'NO_TOKEN', details: 'No token provided' }
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que sea distribuidor
    if (decoded.role !== 'distributor' && decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
        error: { code: 'INSUFFICIENT_PERMISSIONS', details: 'User is not a distributor' }
      });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Failed To Authenticate Token',
      error: { code: 'INVALID_TOKEN', details: error.message }
    });
  }
};

module.exports = { authenticateDistributor };
```

### 2. Controlador Principal

```javascript
// controllers/dashboardController.js
const { getDashboardStats, getSalesChartData, getRecentActivity } = require('../services/dashboardService');

/**
 * GET /api/distributor/dashboard-home
 * Obtiene todos los datos del dashboard home
 */
exports.getDashboardHome = async (req, res) => {
  try {
    const distributorCode = req.user.distributorCode;
    const userId = req.user.id;
    
    console.log(`[Dashboard] Obteniendo datos para distributor: ${distributorCode}`);
    
    // Obtener datos en paralelo para mejor performance
    const [stats, salesChart, recentActivity] = await Promise.all([
      getDashboardStats(distributorCode),
      getSalesChartData(distributorCode),
      getRecentActivity(distributorCode, userId)
    ]);
    
    const response = {
      success: true,
      data: {
        stats,
        salesChart,
        recentActivity
      }
    };
    
    res.status(200).json(response);
    
  } catch (error) {
    console.error('[Dashboard] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: {
        code: 'INTERNAL_ERROR',
        details: error.message
      }
    });
  }
};
```

### 3. Servicio de Dashboard

```javascript
// services/dashboardService.js
const { Order, Product, Client, Activity } = require('../models');
const { Op } = require('sequelize');

/**
 * Obtiene las estadísticas principales
 */
exports.getDashboardStats = async (distributorCode) => {
  const now = new Date();
  const currentMonth = {
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  };
  const previousMonth = {
    start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
    end: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
  };
  
  // VENTAS
  const currentSales = await Order.sum('total', {
    where: {
      distributorCode,
      createdAt: { [Op.between]: [currentMonth.start, currentMonth.end] },
      status: { [Op.notIn]: ['cancelled', 'rejected'] }
    }
  }) || 0;
  
  const previousSales = await Order.sum('total', {
    where: {
      distributorCode,
      createdAt: { [Op.between]: [previousMonth.start, previousMonth.end] },
      status: { [Op.notIn]: ['cancelled', 'rejected'] }
    }
  }) || 0;
  
  const salesChange = previousSales > 0 
    ? ((currentSales - previousSales) / previousSales) * 100 
    : 0;
  
  // ÓRDENES
  const currentOrders = await Order.count({
    where: {
      distributorCode,
      createdAt: { [Op.between]: [currentMonth.start, currentMonth.end] }
    }
  });
  
  const previousOrders = await Order.count({
    where: {
      distributorCode,
      createdAt: { [Op.between]: [previousMonth.start, previousMonth.end] }
    }
  });
  
  const ordersChange = previousOrders > 0
    ? ((currentOrders - previousOrders) / previousOrders) * 100
    : 0;
  
  // PRODUCTOS
  const currentProducts = await Product.count({
    where: {
      distributorCode,
      status: 'active'
    }
  });
  
  const previousProducts = await Product.count({
    where: {
      distributorCode,
      status: 'active',
      createdAt: { [Op.lte]: previousMonth.end }
    }
  });
  
  const productsChange = previousProducts > 0
    ? ((currentProducts - previousProducts) / previousProducts) * 100
    : 0;
  
  // CLIENTES
  const currentClients = await Client.count({
    where: {
      distributorCode,
      status: 'active'
    }
  });
  
  const previousClients = await Client.count({
    where: {
      distributorCode,
      status: 'active',
      createdAt: { [Op.lte]: previousMonth.end }
    }
  });
  
  const clientsChange = previousClients > 0
    ? ((currentClients - previousClients) / previousClients) * 100
    : 0;
  
  return {
    sales: {
      total: Math.round(currentSales * 100) / 100,
      currency: 'USD', // O desde configuración del distribuidor
      change: Math.round(salesChange * 10) / 10,
      period: 'month'
    },
    orders: {
      total: currentOrders,
      change: Math.round(ordersChange * 10) / 10,
      period: 'month'
    },
    products: {
      total: currentProducts,
      change: Math.round(productsChange * 10) / 10,
      period: 'month'
    },
    clients: {
      total: currentClients,
      change: Math.round(clientsChange * 10) / 10,
      period: 'month'
    }
  };
};

/**
 * Obtiene datos para el gráfico de ventas mensuales
 */
exports.getSalesChartData = async (distributorCode) => {
  const year = new Date().getFullYear();
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  // Obtener ventas de cada mes
  const salesByMonth = await Promise.all(
    Array.from({ length: 12 }, async (_, index) => {
      const monthStart = new Date(year, index, 1);
      const monthEnd = new Date(year, index + 1, 0, 23, 59, 59);
      
      const total = await Order.sum('total', {
        where: {
          distributorCode,
          createdAt: { [Op.between]: [monthStart, monthEnd] },
          status: { [Op.notIn]: ['cancelled', 'rejected'] }
        }
      }) || 0;
      
      return {
        month: monthNames[index],
        value: Math.round(total * 100) / 100
      };
    })
  );
  
  // Encontrar valor máximo para normalización
  const maxValue = Math.max(...salesByMonth.map(m => m.value), 1);
  
  // Calcular porcentajes
  const data = salesByMonth.map(month => ({
    ...month,
    percentage: Math.round((month.value / maxValue) * 100)
  }));
  
  return {
    period: 'monthly',
    year,
    data
  };
};

/**
 * Obtiene actividad reciente del distribuidor
 */
exports.getRecentActivity = async (distributorCode, userId, limit = 10) => {
  const activities = await Activity.findAll({
    where: {
      [Op.or]: [
        { distributorCode },
        { userId }
      ]
    },
    order: [['createdAt', 'DESC']],
    limit,
    raw: true
  });
  
  return activities.map(activity => ({
    id: activity.id,
    type: activity.type,
    action: getActionText(activity.type, activity.action),
    description: activity.description,
    timestamp: activity.createdAt.toISOString(),
    relativeTime: formatRelativeTime(activity.createdAt)
  }));
};

/**
 * Convierte tipo de actividad a texto legible
 */
function getActionText(type, action) {
  const texts = {
    order: 'Nueva orden recibida',
    product: 'Producto actualizado',
    client: 'Cliente registrado',
    price: 'Precio modificado',
    discount: 'Descuento configurado',
    user: 'Usuario actualizado'
  };
  return texts[type] || 'Actividad registrada';
}

/**
 * Formatea fecha a tiempo relativo
 */
function formatRelativeTime(date) {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return "Ahora mismo";
  if (minutes < 60) return `Hace ${minutes} min`;
  if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
  if (days < 7) return `Hace ${days} día${days > 1 ? 's' : ''}`;
  return date.toLocaleDateString('es-ES');
}
```

### 4. Rutas

```javascript
// routes/distributor.js
const express = require('express');
const router = express.Router();
const { authenticateDistributor } = require('../middleware/auth');
const { getDashboardHome } = require('../controllers/dashboardController');

// Dashboard home
router.get('/dashboard-home', authenticateDistributor, getDashboardHome);

module.exports = router;
```

### 5. Registro en App Principal

```javascript
// app.js o server.js
const express = require('express');
const distributorRoutes = require('./routes/distributor');

const app = express();

// Middlewares
app.use(express.json());

// Rutas
app.use('/api/distributor', distributorRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: {
      code: 'INTERNAL_ERROR',
      details: err.message
    }
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## Validaciones y Helpers

### Validación de Estructura

```javascript
// utils/validators.js

/**
 * Valida que la respuesta tenga la estructura correcta
 */
exports.validateDashboardResponse = (data) => {
  const errors = [];
  
  // Validar stats
  if (!data.stats) {
    errors.push('Missing stats object');
  } else {
    if (!data.stats.sales) errors.push('Missing stats.sales');
    if (!data.stats.orders) errors.push('Missing stats.orders');
    if (!data.stats.products) errors.push('Missing stats.products');
    if (!data.stats.clients) errors.push('Missing stats.clients');
  }
  
  // Validar salesChart
  if (!data.salesChart) {
    errors.push('Missing salesChart object');
  } else {
    if (!Array.isArray(data.salesChart.data)) {
      errors.push('salesChart.data must be an array');
    }
  }
  
  // Validar recentActivity
  if (!Array.isArray(data.recentActivity)) {
    errors.push('recentActivity must be an array');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};
```

### Cache Helper

```javascript
// utils/cache.js
const NodeCache = require('node-cache');

// Cache de 5 minutos para dashboard
const cache = new NodeCache({ stdTTL: 300 });

exports.getCachedDashboard = (distributorCode) => {
  const key = `dashboard:${distributorCode}`;
  return cache.get(key);
};

exports.setCachedDashboard = (distributorCode, data) => {
  const key = `dashboard:${distributorCode}`;
  cache.set(key, data);
};

// Usar en el controlador:
const cachedData = getCachedDashboard(distributorCode);
if (cachedData) {
  return res.status(200).json({ success: true, data: cachedData });
}
// ... fetch data ...
setCachedDashboard(distributorCode, data);
```

---

## Consultas a Base de Datos

### SQL Raw Queries (Alternativa)

Si prefieres SQL directo en lugar de ORM:

```javascript
// queries/dashboardQueries.js

exports.getCurrentMonthSales = async (db, distributorCode) => {
  const query = `
    SELECT COALESCE(SUM(total), 0) as total
    FROM orders
    WHERE distributor_code = ?
      AND MONTH(created_at) = MONTH(CURRENT_DATE())
      AND YEAR(created_at) = YEAR(CURRENT_DATE())
      AND status NOT IN ('cancelled', 'rejected')
  `;
  const [rows] = await db.query(query, [distributorCode]);
  return rows[0].total;
};

exports.getSalesByMonth = async (db, distributorCode, year) => {
  const query = `
    SELECT 
      MONTH(created_at) as month,
      COALESCE(SUM(total), 0) as value
    FROM orders
    WHERE distributor_code = ?
      AND YEAR(created_at) = ?
      AND status NOT IN ('cancelled', 'rejected')
    GROUP BY MONTH(created_at)
    ORDER BY MONTH(created_at)
  `;
  const [rows] = await db.query(query, [distributorCode, year]);
  return rows;
};
```

---

## Testing

### Test Unitario (Jest)

```javascript
// tests/dashboard.test.js
const { getDashboardHome } = require('../controllers/dashboardController');

describe('Dashboard Controller', () => {
  test('should return dashboard data structure', async () => {
    const req = {
      user: {
        distributorCode: 'TEST01',
        id: 'user123'
      }
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    await getDashboardHome(req, res);
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          stats: expect.any(Object),
          salesChart: expect.any(Object),
          recentActivity: expect.any(Array)
        })
      })
    );
  });
});
```

---

## 📝 Checklist de Implementación

- [ ] Crear middleware de autenticación
- [ ] Crear controlador getDashboardHome
- [ ] Implementar getDashboardStats (stats calculations)
- [ ] Implementar getSalesChartData (monthly sales)
- [ ] Implementar getRecentActivity (recent events)
- [ ] Agregar helpers (formatRelativeTime, getActionText)
- [ ] Registrar ruta GET /api/distributor/dashboard-home
- [ ] Agregar validación de estructura
- [ ] Implementar cache (opcional)
- [ ] Agregar logging
- [ ] Crear tests unitarios
- [ ] Probar con test-dashboard-endpoint.js
- [ ] Documentar en Swagger/OpenAPI

---

## 🚀 Deployment

### Variables de Entorno

```bash
# .env
JWT_SECRET=your_secret_key
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
PORT=3002
NODE_ENV=production
```

### PM2 (Production)

```bash
pm2 start server.js --name "dashboard-api"
pm2 logs dashboard-api
pm2 monit
```

---

## 📚 Referencias

- [DASHBOARD_HOME_ENDPOINT.md](./DASHBOARD_HOME_ENDPOINT.md) - Especificación completa
- [test-dashboard-endpoint.js](./test-dashboard-endpoint.js) - Script de testing

