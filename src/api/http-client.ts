import axios, { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse, 
  InternalAxiosRequestConfig 
} from 'axios';

// Extender el tipo para agregar _retry
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

// Configuración base de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Crear instancia de Axios
const httpClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Función para obtener el token del localStorage (solo en cliente)
const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token') || localStorage.getItem('jwt_token');
};

// Función para guardar el token
const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
};

// Función para remover el token
const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('jwt_token');
  localStorage.removeItem('refresh_token');
};

// Interceptor de request - agregar token automáticamente
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log para debugging (remover en producción)
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data,
    });
    
    return config;
  },
  (error: unknown) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Interceptor de response - manejo de errores y refresh token
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log para debugging (remover en producción)
    console.log(`✅ API Response: ${response.status}`, {
      url: response.config.url,
      data: response.data,
    });
    
    return response;
  },
  async (error: unknown) => {
    // Verificar si es un error de Axios
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }
    
    const originalRequest = error.config;
    
    console.error('❌ API Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data,
    });
    
    // Si el error es 401 (Unauthorized) y no es un retry
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        try {
          // Intentar refrescar el token
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          
          const newToken = response.data.access_token;
          setToken(newToken);
          
          // Reintentar la request original con el nuevo token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return httpClient(originalRequest);
          
        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError);
          
          // Si falla el refresh, remover tokens y redirigir al login
          removeToken();
          
          // TEMPORALMENTE DESACTIVADO PARA DEBUG - Redirigir al login (solo en cliente)
          console.log("🔴 DEBERÍA REDIRIGIR A /login PERO ESTÁ DESACTIVADO PARA DEBUG");
          // if (typeof window !== 'undefined') {
          //   window.location.href = '/login';
          // }
          
          return Promise.reject(refreshError);
        }
      } else {
        // No hay refresh token, redirigir al login
        removeToken();
        
        // TEMPORALMENTE DESACTIVADO PARA DEBUG - Redirigir al login
        console.log("🔴 DEBERÍA REDIRIGIR A /login PERO ESTÁ DESACTIVADO PARA DEBUG (no refresh token)");
        // if (typeof window !== 'undefined') {
        //   window.location.href = '/login';
        // }
      }
    }
    
    // Para otros errores, rechazar directamente
    return Promise.reject(error);
  }
);

// Interfaces para tipado
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success?: boolean;
  status?: number;
}

export interface ApiError {
  message: string;
  status: number;
  data?: unknown;
}

// Clase HttpClient con métodos helper
class HttpClient {
  private client: AxiosInstance;
  
  constructor(client: AxiosInstance) {
    this.client = client;
  }
  
  // GET request
  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<T>(url, config);
      return {
        data: response.data,
        status: response.status,
        success: true,
      };
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }
  
  // POST request
  async post<T = unknown>(
    url: string, 
    data?: unknown, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return {
        data: response.data,
        status: response.status,
        success: true,
      };
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }
  
  // PUT request
  async put<T = unknown>(
    url: string, 
    data?: unknown, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return {
        data: response.data,
        status: response.status,
        success: true,
      };
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }
  
  // PATCH request
  async patch<T = unknown>(
    url: string, 
    data?: unknown, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<T>(url, data, config);
      return {
        data: response.data,
        status: response.status,
        success: true,
      };
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }
  
  // DELETE request
  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<T>(url, config);
      return {
        data: response.data,
        status: response.status,
        success: true,
      };
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }
  
  // Upload file
  async upload<T = unknown>(
    url: string, 
    formData: FormData, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<T>(url, formData, {
        ...config,
        headers: {
          'Content-Type': 'multipart/form-data',
          ...config?.headers,
        },
      });
      return {
        data: response.data,
        status: response.status,
        success: true,
      };
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }
  
  // Manejo de errores
  private handleError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Error de respuesta del servidor
        return {
          message: error.response.data?.message || error.message || 'Error del servidor',
          status: error.response.status,
          data: error.response.data,
        };
      } else if (error.request) {
        // Error de red
        return {
          message: 'Error de conexión. Verifica tu conexión a internet.',
          status: 0,
        };
      }
    }
    
    // Error de configuración o desconocido
    return {
      message: error instanceof Error ? error.message : 'Error inesperado',
      status: 0,
    };
  }
  
  // Métodos para manejo de tokens
  setAuthToken(token: string): void {
    setToken(token);
  }
  
  removeAuthToken(): void {
    removeToken();
  }
  
  getAuthToken(): string | null {
    return getToken();
  }
}

// Crear instancia del cliente HTTP
const http = new HttpClient(httpClient);

// Exportar instancia y utilidades
export default http;
export { httpClient, setToken, removeToken, getToken };
export type { AxiosRequestConfig, AxiosResponse };