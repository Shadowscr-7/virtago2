# API: Productos con Descuentos

## 🎯 Endpoint
```
GET /api/products/ecommerce/with-discounts
```

## 🔐 Autenticación
Esta API requiere autenticación mediante token JWT. El token se inyecta automáticamente usando el cliente HTTP.

## 📋 Descripción
Obtiene una lista paginada de productos del ecommerce con los descuentos aplicables ya calculados. Ideal para mostrar productos en la tienda con precios rebajados.

## 🚀 Uso en TypeScript/React

### Importación
```typescript
import { api, ProductWithDiscounts, ProductsWithDiscountsResponse } from '@/api';
```

### Ejemplo Básico
```typescript
// Obtener productos con descuentos (página 1, 20 items)
const response = await api.product.getProductsWithDiscounts({
  page: 1,
  limit: 20
});

console.log('Productos:', response.data.products);
console.log('Total:', response.data.total);
console.log('Páginas:', response.data.pages);
```

### Ejemplo con Filtros
```typescript
const response = await api.product.getProductsWithDiscounts({
  page: 1,
  limit: 20,
  category: 'electronics',
  brand: 'Samsung',
  search: 'smartphone',
  minPrice: 100,
  maxPrice: 1000,
  inStock: true
});
```

### Ejemplo en Componente React
```typescript
'use client';

import { useState, useEffect } from 'react';
import { api, ProductWithDiscounts } from '@/api';

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductWithDiscounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.product.getProductsWithDiscounts({
          page,
          limit: 20
        });

        setProducts(response.data.products);
        setTotal(response.data.total);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page]);

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h1>Productos con Descuentos</h1>
      <div className="grid grid-cols-4 gap-4">
        {products.map((product) => (
          <div key={product.id} className="border p-4 rounded">
            <h3>{product.name}</h3>
            <p className="text-sm text-gray-600">{product.description}</p>
            
            {/* Precio base */}
            <div className="mt-2">
              {product.discountedPrice ? (
                <>
                  <span className="line-through text-gray-500">
                    ${product.basePrice}
                  </span>
                  <span className="ml-2 text-red-600 font-bold">
                    ${product.discountedPrice}
                  </span>
                  {product.discountPercentage && (
                    <span className="ml-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
                      -{product.discountPercentage}%
                    </span>
                  )}
                </>
              ) : (
                <span className="font-bold">${product.basePrice}</span>
              )}
            </div>

            {/* Descuento aplicado */}
            {product.discountName && (
              <div className="mt-2 text-sm text-green-600">
                🎉 {product.discountName}
              </div>
            )}

            {/* Stock */}
            <div className="mt-2 text-sm">
              Stock: {product.stock} unidades
            </div>

            {/* Descuentos aplicables */}
            {product.applicableDiscounts && product.applicableDiscounts.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-semibold">Otros descuentos disponibles:</p>
                {product.applicableDiscounts.map((discount, idx) => (
                  <div key={idx} className="text-xs text-blue-600">
                    • {discount.name}: ${discount.finalPrice}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Paginación */}
      <div className="mt-4 flex gap-2">
        <button 
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Anterior
        </button>
        <span>Página {page}</span>
        <button 
          onClick={() => setPage(p => p + 1)}
          disabled={products.length < 20}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
```

## 📊 Parámetros de Query

| Parámetro | Tipo | Requerido | Descripción | Ejemplo |
|-----------|------|-----------|-------------|---------|
| `page` | number | No | Número de página (default: 1) | `1` |
| `limit` | number | No | Items por página (default: 20) | `20` |
| `category` | string | No | Filtrar por categoría | `"electronics"` |
| `brand` | string | No | Filtrar por marca | `"Samsung"` |
| `search` | string | No | Búsqueda por nombre/descripción | `"smartphone"` |
| `minPrice` | number | No | Precio mínimo | `100` |
| `maxPrice` | number | No | Precio máximo | `1000` |
| `inStock` | boolean | No | Solo productos en stock | `true` |

## 📤 Respuesta

### Estructura de la Respuesta
```typescript
{
  success: true,
  data: {
    products: ProductWithDiscounts[],
    total: number,
    pages: number,
    currentPage: number
  }
}
```

### Tipo ProductWithDiscounts
```typescript
interface ProductWithDiscounts {
  id: string;                    // ID del producto
  name: string;                  // Nombre del producto
  description?: string;          // Descripción
  sku: string;                   // SKU único
  basePrice: number;             // Precio original sin descuento
  discountedPrice?: number;      // Precio con descuento aplicado
  discountPercentage?: number;   // Porcentaje de descuento (ej: 25)
  discountId?: string;           // ID del descuento aplicado
  discountName?: string;         // Nombre del descuento
  currency: string;              // Moneda (UYU, USD, etc.)
  stock: number;                 // Cantidad en stock
  brand?: string;                // Marca del producto
  category?: string;             // Categoría
  images?: string[];             // URLs de imágenes
  status: string;                // Estado del producto
  applicableDiscounts?: Array<{  // Otros descuentos disponibles
    discountId: string;
    name: string;
    type: string;
    value: number;
    finalPrice: number;
  }>;
}
```

### Ejemplo de Respuesta
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod-123",
        "name": "Samsung Galaxy S24",
        "description": "Smartphone de última generación",
        "sku": "SAM-S24-128GB",
        "basePrice": 999.99,
        "discountedPrice": 749.99,
        "discountPercentage": 25,
        "discountId": "disc-blackfriday",
        "discountName": "Black Friday 25%",
        "currency": "USD",
        "stock": 50,
        "brand": "Samsung",
        "category": "Smartphones",
        "images": [
          "https://example.com/image1.jpg",
          "https://example.com/image2.jpg"
        ],
        "status": "active",
        "applicableDiscounts": [
          {
            "discountId": "disc-vip",
            "name": "Descuento VIP",
            "type": "percentage",
            "value": 30,
            "finalPrice": 699.99
          }
        ]
      }
    ],
    "total": 150,
    "pages": 8,
    "currentPage": 1
  }
}
```

## 🔍 Características

### ✅ Ventajas
- **Autenticación automática**: El token JWT se inyecta automáticamente
- **Descuentos pre-calculados**: No necesitas calcular descuentos en el frontend
- **Múltiples descuentos**: Muestra el mejor descuento y otros disponibles
- **Paginación**: Optimizado para grandes catálogos
- **Filtros avanzados**: Búsqueda, categorías, precios, stock
- **Type-safe**: Tipado completo con TypeScript
- **Logging**: Console logs automáticos para debugging

### 🎨 Casos de Uso
1. **Catálogo de ecommerce**: Mostrar productos con precios rebajados
2. **Ofertas especiales**: Destacar productos en promoción
3. **Comparación de precios**: Mostrar precio antes/después
4. **Descuentos múltiples**: Permitir al usuario elegir el mejor descuento
5. **Filtrado por promociones**: Mostrar solo productos con descuento

## 🛠️ Manejo de Errores

```typescript
try {
  const response = await api.product.getProductsWithDiscounts({ page: 1, limit: 20 });
  console.log('Productos:', response.data.products);
} catch (error) {
  if (error.status === 401) {
    console.error('No autenticado');
    // Redirigir a login
  } else if (error.status === 404) {
    console.error('No se encontraron productos');
  } else {
    console.error('Error:', error.message);
  }
}
```

## 📝 Notas Importantes

1. **Autenticación**: Requiere token válido en localStorage como `auth_token` o `jwt_token`
2. **Paginación**: Por defecto devuelve 20 items, máximo configurable
3. **Descuentos**: Solo se aplica el mejor descuento por producto (mayor ahorro)
4. **Stock**: Los productos sin stock pueden aparecer si `inStock: false`
5. **Imágenes**: Las URLs son absolutas y listas para usar en `<img>`

## 🔄 Actualización en Tiempo Real

Para actualizar la lista cuando cambian los descuentos:

```typescript
// Polling cada 5 minutos
useEffect(() => {
  const interval = setInterval(() => {
    fetchProducts();
  }, 5 * 60 * 1000);

  return () => clearInterval(interval);
}, []);
```

## 🧪 Testing

```typescript
// Mock para tests
const mockProductsResponse = {
  success: true,
  data: {
    products: [
      {
        id: 'test-1',
        name: 'Test Product',
        sku: 'TEST-001',
        basePrice: 100,
        discountedPrice: 80,
        discountPercentage: 20,
        currency: 'USD',
        stock: 10,
        status: 'active'
      }
    ],
    total: 1,
    pages: 1,
    currentPage: 1
  }
};

jest.mock('@/api', () => ({
  api: {
    product: {
      getProductsWithDiscounts: jest.fn().mockResolvedValue(mockProductsResponse)
    }
  }
}));
```

---

**Última actualización**: Noviembre 15, 2025  
**Versión**: 1.0.0  
**Endpoint**: `/api/products/ecommerce/with-discounts`
