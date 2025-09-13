import { get, post, put, patch } from "./base";

// Tipos para las APIs
export interface LoginData extends Record<string, unknown> {
  email: string;
  password: string;
}

export interface RegisterData extends Record<string, unknown> {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

export interface OTPVerifyData extends Record<string, unknown> {
  email: string;
  otp: string;
}

export interface UserDetailsData extends Record<string, unknown> {
  email?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  phone?: string;
  country?: string;
  city?: string;
  address?: string;
  zip?: string;
}

export interface ClientDetailsData extends Record<string, unknown> {
  phoneOptional?: string;
  documentType?: string;
  document?: string;
  latitude?: number;
  longitude?: number;
  information?: {
    distributorCode?: string;
    distributorName?: string;
    pdv?: string;
    pdvname?: string;
    warehouse?: string;
    withCredit?: boolean;
    paymentTerm?: string;
    paymentMethodCode?: string;
    companyCode?: string;
  };
}

// Repositorio de APIs de Autenticación
export const authApi = {
  // Registro inicial
  register: (data: RegisterData) => post("/auth/register", data),

  // Verificar OTP
  verifyOTP: (data: OTPVerifyData) => post("/auth/verify-otp", data),

  // Reenviar OTP
  resendOTP: (email: string) => post("/auth/resend-otp", { email }),

  // Login
  login: (data: LoginData) => post("/auth/login", data),

  // Logout
  logout: () => post("/auth/logout"),

  // Refresh token
  refreshToken: () => post("/auth/refresh"),

  // Verificar token
  verifyToken: () => get("/auth/verify"),
};

// Repositorio de APIs de Usuario
export const userApi = {
  // Obtener perfil
  getProfile: () => get("/user/profile"),

  // Actualizar detalles del usuario
  updateUserDetails: (data: UserDetailsData) => put("/user/details", data),

  // Seleccionar tipo de usuario
  selectUserType: (userType: "client" | "distributor") =>
    patch("/user/type", { userType }),

  // Actualizar detalles del cliente
  updateClientDetails: (data: ClientDetailsData) =>
    put("/user/client-details", data),
};

// Repositorio de APIs de Productos
export const productApi = {
  // Obtener todos los productos
  getProducts: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    brand?: string;
    search?: string;
  }) =>
    get(
      `/products${params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : ""}`,
    ),

  // Obtener producto por ID
  getProduct: (id: string) => get(`/products/${id}`),

  // Obtener productos destacados
  getFeaturedProducts: () => get("/products/featured"),

  // Obtener categorías
  getCategories: () => get("/products/categories"),

  // Obtener marcas
  getBrands: () => get("/products/brands"),
};

// Repositorio de APIs de Ubicación
export const locationApi = {
  // Obtener países
  getCountries: () => get("/location/countries"),

  // Obtener ciudades por país
  getCities: (countryId: string) => get(`/location/cities/${countryId}`),

  // Geocodificación
  geocode: (address: string) =>
    get(`/location/geocode?address=${encodeURIComponent(address)}`),

  // Geocodificación inversa
  reverseGeocode: (lat: number, lng: number) =>
    get(`/location/reverse-geocode?lat=${lat}&lng=${lng}`),
};

// Repositorio de APIs de Carrito
export const cartApi = {
  // Obtener carrito
  getCart: () => get("/cart"),

  // Agregar producto al carrito
  addToCart: (productId: string, quantity: number) =>
    post("/cart/add", { productId, quantity }),

  // Actualizar cantidad
  updateQuantity: (itemId: string, quantity: number) =>
    patch("/cart/update", { itemId, quantity }),

  // Remover del carrito
  removeFromCart: (itemId: string) => patch("/cart/remove", { itemId }),

  // Limpiar carrito
  clearCart: () => patch("/cart/clear"),
};

// Repositorio de APIs de Pedidos
export const orderApi = {
  // Crear pedido
  createOrder: (orderData: Record<string, unknown>) =>
    post("/orders", orderData),

  // Obtener pedidos del usuario
  getOrders: (params?: { page?: number; limit?: number }) =>
    get(
      `/orders${params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : ""}`,
    ),

  // Obtener pedido por ID
  getOrder: (id: string) => get(`/orders/${id}`),

  // Cancelar pedido
  cancelOrder: (id: string) => patch(`/orders/${id}/cancel`),
};

// Repositorio de APIs de Favoritos
export const favoritesApi = {
  // Obtener favoritos
  getFavorites: () => get("/favorites"),

  // Agregar a favoritos
  addToFavorites: (productId: string) => post("/favorites/add", { productId }),

  // Remover de favoritos
  removeFromFavorites: (productId: string) =>
    patch("/favorites/remove", { productId }),
};

// Objeto principal API - para usar como api.auth.login(), api.user.getProfile(), etc.
export const api = {
  auth: authApi,
  user: userApi,
  product: productApi,
  location: locationApi,
  cart: cartApi,
  order: orderApi,
  favorites: favoritesApi,
};
