# 📊 Dashboard Home - Especificación de Endpoint

Este documento define el endpoint necesario para alimentar el dashboard principal (home) con todos los indicadores, gráficos y datos de actividad.

---

## 📍 Endpoint

```
GET /api/distributor/dashboard-home
```

**Autenticación:** `Bearer Token` (JWT del distribuidor logueado)

**Headers requeridos:**
```
Authorization: Bearer {token}
```

---

## 📤 Respuesta Esperada

### Estructura JSON Completa

```json
{
  "success": true,
  "data": {
    "stats": {
      "sales": {
        "total": 125430.50,
        "currency": "USD",
        "change": 12.5,
        "period": "month"
      },
      "orders": {
        "total": 1249,
        "change": 8.2,
        "period": "month"
      },
      "products": {
        "total": 847,
        "change": 15.3,
        "period": "month"
      },
      "clients": {
        "total": 2847,
        "change": 23.1,
        "period": "month"
      }
    },
    "salesChart": {
      "period": "monthly",
      "year": 2026,
      "data": [
        { "month": "Enero", "value": 45000, "percentage": 40 },
        { "month": "Febrero", "value": 72000, "percentage": 65 },
        { "month": "Marzo", "value": 38000, "percentage": 35 },
        { "month": "Abril", "value": 95000, "percentage": 80 },
        { "month": "Mayo", "value": 62000, "percentage": 55 },
        { "month": "Junio", "value": 110000, "percentage": 90 },
        { "month": "Julio", "value": 82000, "percentage": 70 },
        { "month": "Agosto", "value": 98000, "percentage": 85 },
        { "month": "Septiembre", "value": 68000, "percentage": 60 },
        { "month": "Octubre", "value": 115000, "percentage": 95 },
        { "month": "Noviembre", "value": 88000, "percentage": 75 },
        { "month": "Diciembre", "value": 105000, "percentage": 88 }
      ]
    },
    "recentActivity": [
      {
        "id": "act_001",
        "type": "order",
        "action": "Nueva orden recibida",
        "description": "Orden #ORD-2024-001",
        "timestamp": "2026-02-08T10:45:00Z",
        "relativeTime": "Hace 5 min"
      },
      {
        "id": "act_002",
        "type": "product",
        "action": "Producto actualizado",
        "description": "Producto SKU-12345",
        "timestamp": "2026-02-08T10:35:00Z",
        "relativeTime": "Hace 15 min"
      },
      {
        "id": "act_003",
        "type": "client",
        "action": "Cliente registrado",
        "description": "Cliente: Acme Corp",
        "timestamp": "2026-02-08T09:50:00Z",
        "relativeTime": "Hace 1 hora"
      },
      {
        "id": "act_004",
        "type": "price",
        "action": "Precio modificado",
        "description": "Lista de precios: Premium",
        "timestamp": "2026-02-08T08:50:00Z",
        "relativeTime": "Hace 2 horas"
      }
    ]
  }
}
```

---

## 📋 Descripción de Campos

### `stats` - Indicadores Principales

**`sales` (Ventas Totales)**
- `total`: Monto total de ventas en el periodo
- `currency`: Código de moneda (USD, EUR, etc.)
- `change`: Porcentaje de cambio respecto al periodo anterior (positivo = crecimiento)
- `period`: Periodo de comparación ("month", "week", "year")

**`orders` (Órdenes)**
- `total`: Cantidad total de órdenes en el periodo
- `change`: Porcentaje de cambio respecto al periodo anterior
- `period`: Periodo de comparación

**`products` (Productos)**
- `total`: Cantidad total de productos activos en el catálogo
- `change`: Porcentaje de cambio respecto al periodo anterior
- `period`: Periodo de comparación

**`clients` (Clientes)**
- `total`: Cantidad total de clientes registrados
- `change`: Porcentaje de cambio respecto al periodo anterior
- `period`: Periodo de comparación

### `salesChart` - Gráfico de Ventas Mensuales

- `period`: Tipo de periodo ("monthly", "weekly", "daily")
- `year`: Año de los datos
- `data`: Array de 12 objetos (uno por mes):
  - `month`: Nombre del mes
  - `value`: Valor monetario de ventas en ese mes
  - `percentage`: Porcentaje normalizado para altura del gráfico (0-100)

**Cálculo de `percentage`:**
```
percentage = (value / valor_más_alto) * 100
```

### `recentActivity` - Actividad Reciente

Array de las últimas 4-10 actividades del distribuidor:
- `id`: ID único de la actividad
- `type`: Tipo de actividad ("order", "product", "client", "price", "discount", etc.)
- `action`: Descripción corta de la acción
- `description`: Detalle adicional (nombre, ID, etc.)
- `timestamp`: Fecha y hora ISO 8601
- `relativeTime`: Tiempo relativo en español ("Hace 5 min", "Hace 1 hora", "Ayer", etc.)

---

## 🔧 Lógica de Backend Sugerida

### 1. Estadísticas (Stats)

```javascript
// Pseudo-código
const currentMonth = getCurrentMonth();
const previousMonth = getPreviousMonth();

// Ventas
const currentSales = sumOrdersTotal(distributorId, currentMonth);
const previousSales = sumOrdersTotal(distributorId, previousMonth);
const salesChange = ((currentSales - previousSales) / previousSales) * 100;

// Órdenes
const currentOrders = countOrders(distributorId, currentMonth);
const previousOrders = countOrders(distributorId, previousMonth);
const ordersChange = ((currentOrders - previousOrders) / previousOrders) * 100;

// Productos
const currentProducts = countActiveProducts(distributorId);
const previousProducts = countActiveProducts(distributorId, previousMonth);
const productsChange = ((currentProducts - previousProducts) / previousProducts) * 100;

// Clientes
const currentClients = countActiveClients(distributorId);
const previousClients = countActiveClients(distributorId, previousMonth);
const clientsChange = ((currentClients - previousClients) / previousClients) * 100;
```

### 2. Gráfico de Ventas (Sales Chart)

```javascript
// Obtener ventas de los últimos 12 meses
const salesByMonth = await getMonthlyASales(distributorId, 12);

// Encontrar valor máximo para normalización
const maxSale = Math.max(...salesByMonth.map(s => s.value));

// Calcular porcentajes
const chartData = salesByMonth.map(month => ({
  month: month.name,
  value: month.total,
  percentage: Math.round((month.total / maxSale) * 100)
}));
```

### 3. Actividad Reciente (Recent Activity)

```javascript
// Obtener eventos de las últimas 24 horas
const activities = await getRecentActivities(distributorId, limit: 10);

// Formatear con tiempo relativo
const formattedActivities = activities.map(activity => ({
  id: activity.id,
  type: activity.type,
  action: getActionText(activity.type),
  description: activity.description,
  timestamp: activity.createdAt.toISOString(),
  relativeTime: formatRelativeTime(activity.createdAt)
}));
```

**Función helper para tiempo relativo:**
```javascript
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

---

## ⚠️ Casos de Error

### Sin datos (distribuidor nuevo)

```json
{
  "success": true,
  "data": {
    "stats": {
      "sales": { "total": 0, "currency": "USD", "change": 0, "period": "month" },
      "orders": { "total": 0, "change": 0, "period": "month" },
      "products": { "total": 0, "change": 0, "period": "month" },
      "clients": { "total": 0, "change": 0, "period": "month" }
    },
    "salesChart": {
      "period": "monthly",
      "year": 2026,
      "data": []
    },
    "recentActivity": []
  }
}
```

### Error de autenticación (401)

```json
{
  "success": false,
  "message": "Failed To Authenticate Token",
  "error": {
    "code": "UNAUTHORIZED",
    "details": "Invalid or expired token"
  }
}
```

### Error del servidor (500)

```json
{
  "success": false,
  "message": "Internal Server Error",
  "error": {
    "code": "INTERNAL_ERROR",
    "details": "Error retrieving dashboard data"
  }
}
```

---

## 🚀 Integración en Frontend

### 1. Crear el servicio

**Archivo:** `src/services/dashboard.service.ts`

```typescript
import { http } from '@/api';

export interface DashboardStats {
  sales: {
    total: number;
    currency: string;
    change: number;
    period: string;
  };
  orders: {
    total: number;
    change: number;
    period: string;
  };
  products: {
    total: number;
    change: number;
    period: string;
  };
  clients: {
    total: number;
    change: number;
    period: string;
  };
}

export interface SalesChartData {
  month: string;
  value: number;
  percentage: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  action: string;
  description: string;
  timestamp: string;
  relativeTime: string;
}

export interface DashboardData {
  stats: DashboardStats;
  salesChart: {
    period: string;
    year: number;
    data: SalesChartData[];
  };
  recentActivity: RecentActivity[];
}

export const getDashboardData = async (): Promise<DashboardData> => {
  try {
    const response = await http.get<{ success: boolean; data: DashboardData }>(
      '/api/distributor/dashboard-home'
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};
```

### 2. Modificar el componente Dashboard

**Archivo:** `src/app/admin/page.tsx`

```typescript
import { getDashboardData, DashboardData } from '@/services/dashboard.service';

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Usar dashboardData en lugar de stats hardcodeados
  const stats = dashboardData ? [
    {
      title: "Ventas Totales",
      value: `$${dashboardData.stats.sales.total.toLocaleString()}`,
      change: `${dashboardData.stats.sales.change > 0 ? '+' : ''}${dashboardData.stats.sales.change}%`,
      trend: dashboardData.stats.sales.change >= 0 ? "up" : "down",
      icon: DollarSign,
      colorIndex: 0,
    },
    // ... resto de stats
  ] : [];
}
```

---

## ✅ Checklist de Implementación

### Backend

- [ ] Crear ruta `GET /api/distributor/dashboard-home`
- [ ] Implementar middleware de autenticación JWT
- [ ] Calcular estadísticas de ventas del mes actual vs anterior
- [ ] Calcular estadísticas de órdenes del mes actual vs anterior
- [ ] Contar productos activos (actual vs mes anterior)
- [ ] Contar clientes activos (actual vs mes anterior)
- [ ] Obtener ventas mensuales de los últimos 12 meses
- [ ] Normalizar valores del gráfico (calcular porcentajes)
- [ ] Obtener últimas 10 actividades del distribuidor
- [ ] Formatear tiempos relativos en español
- [ ] Manejar caso de distribuidor sin datos (arrays vacíos, totales en 0)
- [ ] Agregar tests unitarios
- [ ] Documentar en Swagger/OpenAPI

### Frontend

- [ ] Crear archivo `src/services/dashboard.service.ts`
- [ ] Definir interfaces TypeScript para la respuesta
- [ ] Implementar función `getDashboardData()`
- [ ] Modificar `src/app/admin/page.tsx` para usar datos reales
- [ ] Reemplazar stats hardcodeados con datos del endpoint
- [ ] Reemplazar datos del gráfico con datos del endpoint
- [ ] Reemplazar actividad reciente con datos del endpoint
- [ ] Agregar estado de loading mientras carga
- [ ] Agregar manejo de errores (try/catch)
- [ ] Agregar fallback si no hay datos
- [ ] Probar con datos reales del backend
- [ ] Probar con usuario sin datos (distribuidor nuevo)

---

## 🧪 Testing

### Comando de prueba (Node.js)

Crear archivo `test-dashboard-endpoint.js`:

```javascript
const https = require('https');

const BASE_URL = 'http://localhost:3002';
const AUTH_TOKEN = 'TU_TOKEN_AQUI'; // Reemplazar con token real

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/api/distributor/dashboard-home',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json'
  }
};

console.log('\n🔍 Probando endpoint de Dashboard...\n');

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Respuesta:', JSON.stringify(JSON.parse(data), null, 2));
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

req.end();
```

### Prueba en consola del navegador

```javascript
// Con autenticación
fetch('/api/distributor/dashboard-home', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(data => {
  console.log('📊 Dashboard Data:', data);
});
```

---

## 📝 Notas Adicionales

1. **Performance:** Considerar cachear los resultados por 5-15 minutos para reducir carga en BD
2. **Moneda:** El campo `currency` debería venir de la configuración del distribuidor
3. **Timezone:** Todos los timestamps deben estar en UTC, el frontend los convierte al timezone local
4. **Paginación:** La actividad reciente puede limitarse a 10 items por defecto
5. **Tiempo real:** Considerar WebSockets para actualizar actividad en tiempo real en futuras versiones

---

## 🎯 Resultado Final

Una vez implementado, el dashboard mostrará:

✅ **Stats** reales del distribuidor (ventas, órdenes, productos, clientes)  
✅ **Gráfico de barras** con ventas de los últimos 12 meses  
✅ **Actividad reciente** con las últimas acciones del distribuidor  
✅ **Cambios porcentuales** comparando con periodo anterior  
✅ **Fallback** al estado de onboarding si no hay datos  

