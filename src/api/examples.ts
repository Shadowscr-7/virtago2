// Ejemplos de uso del sistema API con Axios y JWT

import { api, http } from '@/api';
import type { LoginData, RegisterData, ApiError } from '@/api';

// =====================================================
// EJEMPLOS DE USO BÁSICO
// =====================================================

// 1. Autenticación
export const loginExample = async (email: string, password: string) => {
  try {
    const loginData: LoginData = { email, password };
    const response = await api.auth.login(loginData);
    
    console.log('Login exitoso:', response.data);
    console.log('Token:', response.data.token);
    console.log('Usuario:', response.data.user);
    
    // El token se guarda automáticamente y se incluye en futuras requests
    return response.data;
    
  } catch (error) {
    const apiError = error as ApiError;
    console.error('Error en login:', apiError.message);
    throw error;
  }
};

// 2. Registro
export const registerExample = async (userData: RegisterData) => {
  try {
    const response = await api.auth.register(userData);
    console.log('Registro exitoso:', response.data.message);
    return response.data;
    
  } catch (error) {
    const apiError = error as ApiError;
    console.error('Error en registro:', apiError.message);
    throw error;
  }
};

// =====================================================
// 🆕 ONBOARDING API - Verificar estado del distribuidor
// =====================================================

// Obtener estado de onboarding
export const getOnboardingStatusExample = async () => {
  try {
    const response = await api.onboarding.getStatus();
    
    console.log('📊 Estado de onboarding:', response.data);
    console.log('¿Tiene datos?', response.data.hasData);
    console.log('Completitud:', `${response.data.completionPercentage}%`);
    console.log('Próximos pasos:', response.data.nextSteps);
    
    // Verificar qué le falta al usuario
    if (!response.data.details.products.hasData) {
      console.log('⚠️ El usuario no tiene productos cargados');
    }
    if (!response.data.details.clients.hasData) {
      console.log('⚠️ El usuario no tiene clientes registrados');
    }
    if (!response.data.details.priceLists.hasData) {
      console.log('⚠️ El usuario no tiene listas de precios configuradas');
    }
    
    return response.data;
    
  } catch (error) {
    const apiError = error as ApiError;
    console.error('Error obteniendo estado de onboarding:', apiError.message);
    throw error;
  }
};

// Verificar si el endpoint existe en el backend
export const checkOnboardingEndpointExample = async () => {
  try {
    const exists = await api.onboarding.checkEndpointExists();
    
    if (exists) {
      console.log('✅ El backend tiene el endpoint implementado');
      console.log('   Puedes usar api.onboarding.getStatus()');
    } else {
      console.log('❌ El backend NO tiene el endpoint');
      console.log('   El sistema usará datos mock de localStorage');
    }
    
    return exists;
    
  } catch (error) {
    console.error('Error verificando endpoint:', error);
    return false;
  }
};

// 3. Obtener productos
export const getProductsExample = async () => {
  try {
    const response = await api.product.getProducts({
      page: 1,
      limit: 20,
      category: 'electronics',
      search: 'laptop'
    });
    
    console.log('Productos:', response.data.products);
    console.log('Total:', response.data.total);
    console.log('Páginas:', response.data.pages);
    
    return response.data;
    
  } catch (error) {
    const apiError = error as ApiError;
    console.error('Error obteniendo productos:', apiError.message);
    throw error;
  }
};

// 4. Agregar al carrito
export const addToCartExample = async (productId: string, quantity: number) => {
  try {
    const response = await api.cart.addToCart(productId, quantity);
    console.log('Agregado al carrito:', response.data.message);
    return response.data;
    
  } catch (error) {
    const apiError = error as ApiError;
    
    // Manejar errores específicos
    if (apiError.status === 401) {
      console.error('No autorizado - redirigir al login');
      // El interceptor ya maneja esto automáticamente
    } else if (apiError.status === 404) {
      console.error('Producto no encontrado');
    } else {
      console.error('Error agregando al carrito:', apiError.message);
    }
    
    throw error;
  }
};

// =====================================================
// EJEMPLOS DE USO AVANZADO
// =====================================================

// 5. Upload de archivo
export const uploadImageExample = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await http.upload('/admin/products/upload-image', formData);
    console.log('Imagen subida:', response.data);
    return response.data;
    
  } catch (error) {
    const apiError = error as ApiError;
    console.error('Error subiendo imagen:', apiError.message);
    throw error;
  }
};

// 6. Manejo manual de headers
export const customRequestExample = async () => {
  try {
    const response = await http.get('/custom-endpoint', {
      headers: {
        'Custom-Header': 'valor-personalizado',
        'Accept-Language': 'es-ES'
      },
      timeout: 5000
    });
    
    return response.data;
    
  } catch (error) {
    const apiError = error as ApiError;
    console.error('Error en request personalizada:', apiError.message);
    throw error;
  }
};

// =====================================================
// EJEMPLOS EN COMPONENTES REACT
// =====================================================

// 7. Hook personalizado para productos (implementar en un archivo .tsx con React imports)
/*
import { useState } from 'react';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async (filters?: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.product.getProducts(filters);
      setProducts(response.data.products);
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, fetchProducts };
};
*/

// 8. Ejemplo de componente de Login (implementar en un archivo .tsx)
/*
export const LoginComponent = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await loginExample(email, password);
      // Redirigir al dashboard o página principal
      window.location.href = '/dashboard';
      
    } catch (error) {
      // Mostrar error al usuario
      console.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email" 
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password" 
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Iniciando sesión...' : 'Login'}
      </button>
    </form>
  );
};
*/

// =====================================================
// UTILIDADES PARA MANEJO DE TOKENS
// =====================================================

// 9. Verificar si el usuario está autenticado
export const isAuthenticated = (): boolean => {
  return http.getAuthToken() !== null;
};

// 10. Logout manual
export const logout = async () => {
  try {
    await api.auth.logout();
  } catch (error) {
    console.error('Error en logout:', error);
  } finally {
    // Limpiar token y redirigir
    http.removeAuthToken();
    window.location.href = '/login';
  }
};

// 11. Configurar token manualmente (si viene de otra fuente)
export const setAuthToken = (token: string) => {
  http.setAuthToken(token);
};

// =====================================================
// EJEMPLOS DE ADMINISTRACIÓN
// =====================================================

// 12. Gestión de clientes (Admin)
export const adminClientsExample = async () => {
  try {
    // Obtener todos los clientes
    const clientsResponse = await api.admin.clients.getAll({
      page: 1,
      limit: 50,
      search: 'juan'
    });
    
    console.log('Clientes:', clientsResponse.data.clients);
    
    // Crear un nuevo cliente
    const newClient = {
      name: 'Nuevo Cliente',
      email: 'cliente@example.com',
      phone: '123456789'
    };
    
    const createResponse = await api.admin.clients.create(newClient);
    console.log('Cliente creado:', createResponse.data);
    
    return clientsResponse.data;
    
  } catch (error) {
    const apiError = error as ApiError;
    console.error('Error en gestión de clientes:', apiError.message);
    throw error;
  }
};

// 13. Importar precios (Admin)
export const importPricesExample = async (file: File) => {
  try {
    const response = await api.admin.prices.import(file);
    console.log('Precios importados:', response.data.message);
    return response.data;
    
  } catch (error) {
    const apiError = error as ApiError;
    console.error('Error importando precios:', apiError.message);
    throw error;
  }
};

// =====================================================
// MANEJO GLOBAL DE ERRORES
// =====================================================

// 14. Interceptor personalizado para notificaciones
export const setupGlobalErrorHandling = () => {
  // Este código podría ir en un hook o contexto global
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && typeof event.reason === 'object' && 'status' in event.reason) {
      const apiError = event.reason as ApiError;
      
      // Mostrar notificación global de error
      console.error(`Error API (${apiError.status}): ${apiError.message}`);
      
      // Aquí podrías integrar con tu sistema de notificaciones
      // toast.error(apiError.message);
    }
  });
};

const apiExamples = {
  loginExample,
  registerExample,
  getProductsExample,
  addToCartExample,
  uploadImageExample,
  customRequestExample,
  isAuthenticated,
  logout,
  setAuthToken,
  adminClientsExample,
  importPricesExample,
  setupGlobalErrorHandling,
};

export default apiExamples;