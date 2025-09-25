# Sistema API con Axios y JWT

Este sistema proporciona una configuración robusta de Axios con manejo automático de tokens JWT, interceptores de request/response, y APIs tipadas para toda la aplicación.

## 📁 Estructura

```
src/api/
├── http-client.ts    # Configuración de Axios con interceptores JWT
├── index.ts          # APIs organizadas por módulos
└── examples.ts       # Ejemplos de uso
```

## 🚀 Características Principales

- ✅ **Manejo automático de JWT**: Los tokens se agregan automáticamente a las requests
- ✅ **Refresh token automático**: Renovación automática cuando el token expira
- ✅ **Interceptores de error**: Manejo centralizado de errores HTTP
- ✅ **Tipado completo**: TypeScript para mejor DX y menos errores
- ✅ **Upload de archivos**: Soporte nativo para FormData
- ✅ **APIs organizadas**: Estructura modular por funcionalidad
- ✅ **Logs de debugging**: Console logs para desarrollo (remover en producción)

## 🔧 Configuración Inicial

### 1. Variables de Entorno

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 2. Importar en tu aplicación

```typescript
import { api, http } from '@/api';
```

## 📝 Uso Básico

### Autenticación

```typescript
import { api } from '@/api';

// Login
const login = async (email: string, password: string) => {
  try {
    const response = await api.auth.login({ email, password });
    console.log('Usuario logueado:', response.data.user);
    // El token se guarda automáticamente
  } catch (error) {
    console.error('Error en login:', error.message);
  }
};

// Registro
const register = async (userData) => {
  try {
    const response = await api.auth.register(userData);
    console.log('Usuario registrado:', response.data.message);
  } catch (error) {
    console.error('Error en registro:', error.message);
  }
};

// Logout
const logout = async () => {
  await api.auth.logout();
  // Los tokens se limpian automáticamente
};
```

### Productos

```typescript
// Obtener productos con filtros
const getProducts = async () => {
  const response = await api.product.getProducts({
    page: 1,
    limit: 20,
    category: 'electronics',
    search: 'laptop'
  });
  
  console.log('Productos:', response.data.products);
  console.log('Total:', response.data.total);
};

// Obtener producto específico
const getProduct = async (id: string) => {
  const response = await api.product.getProduct(id);
  console.log('Producto:', response.data);
};
```

### Carrito de Compras

```typescript
// Agregar al carrito
await api.cart.addToCart('product-id', 2);

// Obtener carrito
const cart = await api.cart.getCart();
console.log('Carrito:', cart.data);

// Actualizar cantidad
await api.cart.updateQuantity('item-id', 3);

// Remover del carrito
await api.cart.removeFromCart('item-id');
```

## 🔐 Manejo de Tokens

### Automático
El sistema maneja los tokens automáticamente:

```typescript
// El token se agrega automáticamente a todas las requests
const profile = await api.user.getProfile();

// Si el token expira, se renueva automáticamente
// Si falla la renovación, redirige al login
```

### Manual
También puedes manejar tokens manualmente:

```typescript
import { http } from '@/api';

// Verificar si está autenticado
const isLoggedIn = http.getAuthToken() !== null;

// Establecer token manualmente
http.setAuthToken('tu-jwt-token');

// Remover token
http.removeAuthToken();
```

## 📦 Administración

Para funciones de administrador:

```typescript
// Gestión de clientes
const clients = await api.admin.clients.getAll({
  page: 1,
  limit: 50,
  search: 'juan'
});

// Crear cliente
await api.admin.clients.create({
  name: 'Nuevo Cliente',
  email: 'cliente@example.com'
});

// Gestión de productos
await api.admin.products.create(productData);
await api.admin.products.update('product-id', updatedData);

// Importar precios
const file = new File(['...'], 'precios.csv');
await api.admin.prices.import(file);
```

## 🔧 HTTP Client Avanzado

Para casos especiales, usa el cliente HTTP directamente:

```typescript
import { http } from '@/api';

// Request personalizada
const response = await http.get('/custom-endpoint', {
  headers: {
    'Custom-Header': 'valor',
    'Accept-Language': 'es-ES'
  },
  timeout: 5000
});

// Upload de archivos
const formData = new FormData();
formData.append('file', file);
const uploadResponse = await http.upload('/upload', formData);

// Otros métodos HTTP
await http.post('/endpoint', data);
await http.put('/endpoint', data);
await http.patch('/endpoint', data);
await http.delete('/endpoint');
```

## 🎯 Ejemplos en Componentes React

### Hook personalizado

```typescript
// hooks/useProducts.ts
import { useState, useEffect } from 'react';
import { api } from '@/api';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = async (filters = {}) => {
    setLoading(true);
    try {
      const response = await api.product.getProducts(filters);
      setProducts(response.data.products);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, loading, error, fetchProducts };
};
```

### Componente de Login

```typescript
// components/LoginForm.tsx
import { useState } from 'react';
import { api } from '@/api';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.auth.login({ email, password });
      window.location.href = '/dashboard';
    } catch (error) {
      alert('Error en login: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Iniciando sesión...' : 'Login'}
      </button>
    </form>
  );
};
```

## 🚨 Manejo de Errores

El sistema maneja errores automáticamente:

```typescript
try {
  const response = await api.product.getProducts();
} catch (error) {
  // error es del tipo ApiError
  console.log('Status HTTP:', error.status);
  console.log('Mensaje:', error.message);
  console.log('Datos del servidor:', error.data);
  
  // Manejo específico por tipo de error
  switch (error.status) {
    case 401:
      // No autorizado - redirige automáticamente al login
      break;
    case 404:
      // No encontrado
      break;
    case 500:
      // Error del servidor
      break;
    default:
      // Otros errores
  }
}
```

## 🔄 Interceptores

### Request Interceptor
- Agrega automáticamente el token JWT
- Logs de debugging

### Response Interceptor
- Manejo automático de token expirado (401)
- Renovación automática con refresh token
- Redirección al login si falla la renovación
- Logs de debugging y errores

## 📱 APIs Disponibles

### Autenticación (`api.auth`)
- `login(data)` - Iniciar sesión
- `register(data)` - Registrar usuario
- `logout()` - Cerrar sesión
- `verifyOTP(data)` - Verificar código OTP
- `resendOTP(email)` - Reenviar OTP
- `refreshToken()` - Renovar token
- `verifyToken()` - Verificar token actual

### Usuario (`api.user`)
- `getProfile()` - Obtener perfil
- `updateUserDetails(data)` - Actualizar datos
- `selectUserType(type)` - Seleccionar tipo de usuario
- `updateClientDetails(data)` - Actualizar datos de cliente

### Productos (`api.product`)
- `getProducts(filters)` - Obtener productos
- `getProduct(id)` - Obtener producto específico
- `getFeaturedProducts()` - Productos destacados
- `getCategories()` - Obtener categorías
- `getBrands()` - Obtener marcas

### Carrito (`api.cart`)
- `getCart()` - Obtener carrito
- `addToCart(productId, quantity)` - Agregar producto
- `updateQuantity(itemId, quantity)` - Actualizar cantidad
- `removeFromCart(itemId)` - Remover producto
- `clearCart()` - Limpiar carrito

### Pedidos (`api.order`)
- `createOrder(data)` - Crear pedido
- `getOrders(params)` - Obtener pedidos
- `getOrder(id)` - Obtener pedido específico
- `cancelOrder(id)` - Cancelar pedido

### Favoritos (`api.favorites`)
- `getFavorites()` - Obtener favoritos
- `addToFavorites(productId)` - Agregar a favoritos
- `removeFromFavorites(productId)` - Remover de favoritos

### Ubicación (`api.location`)
- `getCountries()` - Obtener países
- `getCities(countryId)` - Obtener ciudades
- `geocode(address)` - Geocodificar dirección
- `reverseGeocode(lat, lng)` - Geocodificación inversa

### Administración (`api.admin`)
- `clients.*` - Gestión de clientes
- `products.*` - Gestión de productos
- `prices.*` - Gestión de precios
- `orders.*` - Gestión de pedidos
- `coupons.*` - Gestión de cupones
- `quickSetup.*` - Configuración rápida

## 🛠️ Configuración de Desarrollo

Para desarrollo, los logs están habilitados. Para producción, remover o comentar las líneas `console.log` en `http-client.ts`.

## 🔒 Seguridad

- Los tokens se almacenan en `localStorage`
- Renovación automática de tokens
- Redirección automática al login cuando no hay autorización
- Headers de seguridad configurados

## 📄 Tipos TypeScript

Todos los tipos están definidos y exportados desde `@/api`:

```typescript
import type { 
  LoginData, 
  RegisterData, 
  Product, 
  Cart, 
  Order,
  ApiResponse,
  ApiError 
} from '@/api';
```