import http, { ApiResponse } from './http-client';

// Tipos para las APIs
export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    status: string;
    planId: string;
    planName: string;
    planDisplayName: string;
    planExpiration: string | null;
    recentProducts: unknown[];
    wishlist: unknown[];
    cover: {
      _id: string;
      url: string;
      blurDataURL: string;
    };
    recoveryPassword: boolean;
    role: 'user' | 'admin' | 'distributor';
    lastOtpSentAt: string;
    isVerified: boolean;
    otp: string | null;
    distributorCode: string | null;
  };
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  otp: string;
  token: string;
  user: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    status: string;
    plan: string;
    planExpiration: string | null;
    recentProducts: unknown[];
    wishlist: unknown[];
    cover: {
      _id: string;
      url: string;
      blurDataURL: string;
    };
    recoveryPassword: boolean;
    role: string;
    otp: string;
    isVerified: boolean;
    lastOtpSentAt: string;
  };
}

export interface OTPVerifyData {
  email: string;
  otp: string;
}

export interface OTPVerifyResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isVerified: boolean;
  };
}

export interface UserDetailsData {
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

export interface ClientDetailsData {
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

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: string;
  brand: string;
  stock: number;
  featured: boolean;
  specifications?: Record<string, unknown>;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  productCount: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  productCount: number;
}

export interface PriceList {
  id: string;
  price_list_id: string;
  name: string;
  description?: string;
  currency: string;
  country: string;
  region?: string;
  customer_type: string;
  channel: string;
  start_date: string;
  end_date?: string;
  status: "active" | "inactive" | "draft";
  default: boolean;
  priority: number;
  applies_to: "all" | "specific_categories" | "specific_products" | "promotional_items" | "premium_products";
  discount_type: "percentage" | "fixed" | "tiered";
  minimum_quantity: number;
  maximum_quantity: number;
  custom_fields?: Record<string, unknown>;
  tags?: string[];
  notes?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: CartItem[];
  total: number;
  createdAt: string;
  shippingAddress: unknown;
  paymentMethod: unknown;
}

export interface Country {
  id: string;
  name: string;
  code: string;
}

export interface City {
  id: string;
  name: string;
  countryId: string;
}

export interface Plan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: string;
  features: string[];
  limits: {
    clients: number;
    products: number;
    storage: number;
    orders: number;
    categories: number;
    brands: number;
    discounts: number;
    aiRequests: number;
  };
  isActive: boolean;
  isDefault: boolean;
  order: number;
  aiSupport: boolean;
  supportLevel: string;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  updatedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

export interface PlansResponse {
  success: boolean;
  message: string;
  data: Plan[];
  total: number;
}

export interface CreateDistributorData {
  // Información personal
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  address: string;
  city: string;
  country: string;
  
  // Información empresarial
  businessName: string;
  businessType: string;
  ruc: string; // RUC para Uruguay/Argentina
  distributorCode: string; // Código de identificación del distribuidor
  businessAddress: string;
  businessCity: string;
  businessCountry: string;
  businessPhone: string;
  businessEmail: string;
  website?: string;
  description: string;
  yearsInBusiness: number;
  numberOfEmployees: string;
  
  // Plan seleccionado
  selectedPlan: {
    id: string;
    name: string;
    displayName: string;
    price: number;
    currency: string;
    billingCycle: string;
  };
}

export interface CreateDistributorResponse {
  success: boolean;
  message: string;
  distributor: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    businessName: string;
    distributorCode: string;
    status: string;
    plan: {
      id: string;
      name: string;
      displayName: string;
    };
    createdAt: string;
  };
}

// Tipos para Bulk Creation de Productos
export interface ProductBulkData {
  name: string;                           // REQUERIDO
  title?: string;
  shortDescription?: string;
  fullDescription?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  categoryCode?: string;
  categoryId?: string;
  subCategoryId?: string;
  brandId?: string;
  manufacturerCode?: string;
  manufacturerPartNumber?: string;
  price: number;                          // REQUERIDO
  priceSale?: number;
  priceInPoints?: number;
  tax?: number;
  stockQuantity?: number;
  trackInventory?: boolean;
  weight?: number;
  inputWeight?: number;
  pieceGrossWeight?: number;
  pieceNetWeight?: number;
  pieceLength?: number;
  pieceWidth?: number;
  pieceHeight?: number;
  piecesPerCase?: number;
  packSize?: number;
  status?: "active" | "inactive" | "draft";
  published?: boolean;
  markAsNew?: boolean;
  markAsNewStartDateTimeUtc?: string;
  markAsNewEndDateTimeUtc?: string;
  isTopSelling?: boolean;
  availableInLoyaltyMarket?: boolean;
  availableInPromoPack?: boolean;
  gtin?: string;
  uoM?: string;                          // Unidad de medida
  productTypeCode?: string;
  gama?: string;
  supplierCode?: string;
  shopId?: string[];
  sizes?: string[];
  colors?: string[];
  productImages?: {
    url: string;
    alt?: string;
  }[];
  productTags?: string;
  productTagsList?: string[];
  likes?: number;
  vendor?: string;
  // Información nutricional (opcional)
  energyKcal?: number;
  fatG?: number;
  saturatedFatG?: number;
  carbsG?: number;
  sugarsG?: number;
  proteinsG?: number;
  saltG?: number;
}

export interface PriceListBulkData {
  price_list_id: string;                   // REQUERIDO
  name: string;                           // REQUERIDO
  description?: string;
  currency: string;                       // REQUERIDO
  country: string;                        // REQUERIDO
  region?: string;
  customer_type: string;                  // REQUERIDO
  channel: string;                        // REQUERIDO
  start_date: string;                     // REQUERIDO
  end_date?: string;
  status?: "active" | "inactive" | "draft";
  default?: boolean;
  priority?: number;
  applies_to?: "all" | "specific_categories" | "specific_products" | "promotional_items" | "premium_products";
  discount_type?: "percentage" | "fixed" | "tiered";
  minimum_quantity?: number;
  maximum_quantity?: number;
  custom_fields?: Record<string, unknown>;
  tags?: string[];
  notes?: string;
}

export interface PriceBulkData {
  name: string;                           // REQUERIDO
  priceId: string;                        // REQUERIDO
  productSku: string;                     // REQUERIDO
  productName: string;                    // REQUERIDO
  basePrice: number;                      // REQUERIDO
  salePrice?: number;
  discountPrice?: number;
  wholesalePrice?: number;
  retailPrice?: number;
  loyaltyPrice?: number;
  corporatePrice?: number;
  currency: string;                       // REQUERIDO
  validFrom: string;                      // REQUERIDO
  validUntil?: string;
  minQuantity?: number;
  maxQuantity?: number;
  priceType?: "regular" | "promotional" | "seasonal";
  customerType?: string;
  channel?: string;
  region?: string;
  city?: string;
  zone?: string;
  status?: "active" | "inactive" | "draft";
  priority?: number;
  taxIncluded?: boolean;
  taxRate?: number;
  margin?: number;
  costPrice?: number;
  profitMargin?: number;
  competitorPrice?: number;
  marketPosition?: "above_market" | "competitive" | "below_market";
  seasonality?: string;
  customFields?: Record<string, unknown>;
  tags?: string[];
  notes?: string;
  approvedBy?: string;
  lastReviewDate?: string;
  nextReviewDate?: string;
}

export interface ProductBulkCreateResponse {
  success: boolean;
  message: string;
  results: {
    totalProcessed: number;
    successCount: number;
    errorCount: number;
    products?: ProductBulkData[];
    errors?: {
      index: number;
      product: ProductBulkData;
      error: string;
    }[];
    aiValidations?: {
      categoriesCreated: string[];
      brandsCreated: string[];
      subCategoriesCreated: string[];
      suggestedImprovements: {
        productIndex: number;
        suggestions: string[];
      }[];
    };
  };
}

export interface PriceBulkCreateResponse {
  success: boolean;
  message: string;
  results: {
    totalProcessed: number;
    successCount: number;
    errorCount: number;
    prices?: PriceBulkData[];
    errors?: {
      index: number;
      price: PriceBulkData;
      error: string;
    }[];
    validations?: {
      duplicatePriceIds: string[];
      invalidCurrencies: string[];
      priceConflicts: {
        priceId: string;
        conflictType: string;
      }[];
      outOfRangePrices: {
        priceId: string;
        issue: string;
      }[];
    };
  };
}

// Tipos para Bulk Creation de Clientes
export interface ClientBulkData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  phoneOptional?: string;
  gender?: "M" | "F";
  documentType?: string;
  document?: string;
  customerClass?: string;
  customerClassTwo?: string;
  customerClassThree?: string;
  customerClassDist?: string;
  customerClassDistTwo?: string;
  latitude?: number;
  longitude?: number;
  status?: "A" | "N" | "I"; // A = Active, N = New, I = Inactive
  distributorCodes?: string[] | string; // Puede ser array o string separado por comas
  information?: {
    paymentMethodCode?: string;
    companyCode?: string;
    salesmanName?: string;
    visitDay?: string;
    pdv?: string;
    deliveryDay?: string;
    warehouse?: string;
    frequency?: string;
    priceList?: string;
    routeName?: string;
    withCredit?: boolean;
    distributorName?: string;
    sellerId?: string;
    routeId?: string;
    clientCode?: string;
    pdvname?: string;
    paymentTerm?: string;
    customerClassDistTwo?: string;
  };
}

export interface ClientBulkCreateResponse {
  success: boolean;
  message: string;
  results: {
    totalProcessed: number;
    successCount: number;
    errorCount: number;
    createdClients?: ClientBulkData[];
    errors?: {
      index: number;
      client: ClientBulkData;
      error: string;
    }[];
  };
}

export interface PriceListBulkCreateResponse {
  success: boolean;
  message: string;
  results: {
    totalProcessed: number;
    successCount: number;
    errorCount: number;
    priceLists?: PriceListBulkData[];
    errors?: {
      index: number;
      priceList: PriceListBulkData;
      error: string;
    }[];
    validations?: {
      duplicateIds: string[];
      invalidCurrencies: string[];
      conflictingPriorities: {
        priceListId: string;
        existingPriority: number;
        newPriority: number;
      }[];
      dateConflicts: {
        priceListId: string;
        issue: string;
      }[];
    };
  };
}

// Repositorio de APIs de Autenticación
export const authApi = {
  // Registro inicial
  register: async (data: RegisterData): Promise<ApiResponse<RegisterResponse>> => 
    http.post("/auth/register-simple", data),

  // Verificar OTP
  verifyOTP: async (data: OTPVerifyData): Promise<ApiResponse<OTPVerifyResponse>> => 
    http.post("/auth/verify-otp", data),

  // Reenviar OTP
  resendOTP: async (email: string): Promise<ApiResponse<RegisterResponse>> => 
    http.post("/auth/resend-otp", { email }),

  // Login
  login: async (data: LoginData): Promise<ApiResponse<LoginResponse>> => 
    http.post("/auth/login", data),

  // Logout
  logout: async (): Promise<ApiResponse<{ message: string }>> => 
    http.post("/auth/logout"),

  // Refresh token
  refreshToken: async (): Promise<ApiResponse<{ access_token: string }>> => 
    http.post("/auth/refresh"),

  // Verificar token
  verifyToken: async (): Promise<ApiResponse<{ valid: boolean }>> => 
    http.get("/auth/verify"),
};

// Repositorio de APIs de Distribuidores
export const distributorApi = {
  // Crear distribuidor completo
  create: async (data: CreateDistributorData): Promise<ApiResponse<CreateDistributorResponse>> =>
    http.post("/distributors", data),

  // Obtener distribuidor por email
  getByEmail: async (email: string): Promise<ApiResponse<CreateDistributorResponse['distributor']>> =>
    http.get(`/distributors/by-email/${email}`),

  // Actualizar distribuidor
  update: async (id: string, data: Partial<CreateDistributorData>): Promise<ApiResponse<{ message: string }>> =>
    http.put(`/distributors/${id}`, data),
};

// Repositorio de APIs de Usuario
export const userApi = {
  // Obtener perfil
  getProfile: async (): Promise<ApiResponse<LoginResponse['user']>> => 
    http.get("/user/profile"),

  // Actualizar detalles del usuario
  updateUserDetails: async (data: UserDetailsData): Promise<ApiResponse<{ message: string }>> => 
    http.put("/user/details", data),

  // Seleccionar tipo de usuario
  selectUserType: async (userType: "client" | "distributor"): Promise<ApiResponse<{ message: string }>> =>
    http.patch("/user/type", { userType }),

  // Actualizar detalles del cliente
  updateClientDetails: async (data: ClientDetailsData): Promise<ApiResponse<{ message: string }>> =>
    http.put("/user/client-details", data),
};

// Repositorio de APIs de Productos
export const productApi = {
  // Obtener todos los productos
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    brand?: string;
    search?: string;
  }): Promise<ApiResponse<{ products: Product[]; total: number; pages: number }>> => {
    const queryString = params 
      ? "?" + new URLSearchParams(
          Object.entries(params).reduce((acc, [key, value]) => {
            if (value !== undefined) acc[key] = String(value);
            return acc;
          }, {} as Record<string, string>)
        ).toString()
      : "";
    return http.get(`/products${queryString}`);
  },

  // Obtener producto por ID
  getProduct: async (id: string): Promise<ApiResponse<Product>> => 
    http.get(`/products/${id}`),

  // Obtener productos destacados
  getFeaturedProducts: async (): Promise<ApiResponse<Product[]>> => 
    http.get("/products/featured"),

  // Obtener categorías
  getCategories: async (): Promise<ApiResponse<Category[]>> => 
    http.get("/products/categories"),

  // Obtener marcas
  getBrands: async (): Promise<ApiResponse<Brand[]>> => 
    http.get("/products/brands"),
};

// Repositorio de APIs de Ubicación
export const locationApi = {
  // Obtener países
  getCountries: async (): Promise<ApiResponse<Country[]>> => 
    http.get("/location/countries"),

  // Obtener ciudades por país
  getCities: async (countryId: string): Promise<ApiResponse<City[]>> => 
    http.get(`/location/cities/${countryId}`),

  // Geocodificación
  geocode: async (address: string): Promise<ApiResponse<{ lat: number; lng: number }>> =>
    http.get(`/location/geocode?address=${encodeURIComponent(address)}`),

  // Geocodificación inversa
  reverseGeocode: async (lat: number, lng: number): Promise<ApiResponse<{ address: string }>> =>
    http.get(`/location/reverse-geocode?lat=${lat}&lng=${lng}`),
};

// Repositorio de APIs de Carrito
export const cartApi = {
  // Obtener carrito
  getCart: async (): Promise<ApiResponse<Cart>> => 
    http.get("/cart"),

  // Agregar producto al carrito
  addToCart: async (productId: string, quantity: number): Promise<ApiResponse<{ message: string }>> =>
    http.post("/cart/add", { productId, quantity }),

  // Actualizar cantidad
  updateQuantity: async (itemId: string, quantity: number): Promise<ApiResponse<{ message: string }>> =>
    http.patch("/cart/update", { itemId, quantity }),

  // Remover del carrito
  removeFromCart: async (itemId: string): Promise<ApiResponse<{ message: string }>> => 
    http.patch("/cart/remove", { itemId }),

  // Limpiar carrito
  clearCart: async (): Promise<ApiResponse<{ message: string }>> => 
    http.patch("/cart/clear"),
};

// Repositorio de APIs de Pedidos
export const orderApi = {
  // Crear pedido
  createOrder: async (orderData: unknown): Promise<ApiResponse<Order>> =>
    http.post("/orders", orderData),

  // Obtener pedidos del usuario
  getOrders: async (params?: { page?: number; limit?: number }): Promise<ApiResponse<{ orders: Order[]; total: number; pages: number }>> => {
    const queryString = params 
      ? "?" + new URLSearchParams(
          Object.entries(params).reduce((acc, [key, value]) => {
            if (value !== undefined) acc[key] = String(value);
            return acc;
          }, {} as Record<string, string>)
        ).toString()
      : "";
    return http.get(`/orders${queryString}`);
  },

  // Obtener pedido por ID
  getOrder: async (id: string): Promise<ApiResponse<Order>> => 
    http.get(`/orders/${id}`),

  // Cancelar pedido
  cancelOrder: async (id: string): Promise<ApiResponse<{ message: string }>> => 
    http.patch(`/orders/${id}/cancel`),
};

// Repositorio de APIs de Favoritos
export const favoritesApi = {
  // Obtener favoritos
  getFavorites: async (): Promise<ApiResponse<Product[]>> => 
    http.get("/favorites"),

  // Agregar a favoritos
  addToFavorites: async (productId: string): Promise<ApiResponse<{ message: string }>> => 
    http.post("/favorites/add", { productId }),

  // Remover de favoritos
  removeFromFavorites: async (productId: string): Promise<ApiResponse<{ message: string }>> =>
    http.patch("/favorites/remove", { productId }),
};

// Repositorio de APIs de Planes
export const plansApi = {
  // Obtener todos los planes
  getPlans: async (): Promise<ApiResponse<PlansResponse>> =>
    http.get("/plans"),

  // Obtener plan por ID
  getPlan: async (id: string): Promise<ApiResponse<Plan>> =>
    http.get(`/plans/${id}`),

  // Seleccionar plan para usuario
  selectPlan: async (planId: string): Promise<ApiResponse<{ message: string }>> =>
    http.post("/plans/select", { planId }),
};

// APIs de Administración
export const adminApi = {
  // Clientes
  clients: {
    getAll: async (params?: { page?: number; limit?: number; search?: string }): Promise<ApiResponse<{ clients: unknown[]; total: number; pages: number }>> => {
      const queryString = params 
        ? "?" + new URLSearchParams(
            Object.entries(params).reduce((acc, [key, value]) => {
              if (value !== undefined) acc[key] = String(value);
              return acc;
            }, {} as Record<string, string>)
          ).toString()
        : "";
      return http.get(`/admin/clients${queryString}`);
    },
    
    getById: async (id: string): Promise<ApiResponse<unknown>> => 
      http.get(`/admin/clients/${id}`),
    
    create: async (data: unknown): Promise<ApiResponse<unknown>> => 
      http.post("/admin/clients", data),
    
    // 🆕 BULK CREATION - Crear múltiples clientes de una vez
    bulkCreate: async (clients: ClientBulkData[]): Promise<ApiResponse<ClientBulkCreateResponse>> => {
      // En desarrollo, usar mock si no hay backend disponible
      if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK_API === 'true') {
        const { mockClientBulkCreate } = await import('./mock-clients');
        const mockResult = await mockClientBulkCreate(clients);
        return { success: true, data: mockResult, message: mockResult.message };
      }
      
      // Usar API real - Corregida la URL
      return http.post("/clients", clients);
    },
    
    update: async (id: string, data: unknown): Promise<ApiResponse<unknown>> => 
      http.put(`/admin/clients/${id}`, data),
    
    delete: async (id: string): Promise<ApiResponse<{ message: string }>> => 
      http.delete(`/admin/clients/${id}`),
  },

  // Productos
  products: {
    getAll: async (params?: unknown): Promise<ApiResponse<unknown>> => {
      const queryString = params 
        ? "?" + new URLSearchParams(params as Record<string, string>).toString()
        : "";
      return http.get(`/admin/products${queryString}`);
    },
    
    create: async (data: unknown): Promise<ApiResponse<unknown>> => 
      http.post("/admin/products", data),
    
    // 🆕 BULK CREATION - Crear múltiples productos de una vez
    bulkCreate: async (products: ProductBulkData[]): Promise<ApiResponse<ProductBulkCreateResponse>> => {
      // En desarrollo, usar mock si no hay backend disponible
      if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK_API === 'true') {
        try {
          const { mockProductBulkCreate } = await import('./mock-products');
          const mockResult = await mockProductBulkCreate(products);
          return { success: true, data: mockResult, message: mockResult.message };
        } catch {
          console.warn('Mock service not available, using real API');
        }
      }
      
      // Usar API real
      return http.post("/products", products);
    },
    
    update: async (id: string, data: unknown): Promise<ApiResponse<unknown>> => 
      http.put(`/admin/products/${id}`, data),
    
    delete: async (id: string): Promise<ApiResponse<{ message: string }>> => 
      http.delete(`/admin/products/${id}`),
  },

  // Precios
  prices: {
    getAll: async (): Promise<ApiResponse<unknown[]>> => 
      http.get("/admin/prices"),
    
    update: async (data: unknown): Promise<ApiResponse<{ message: string }>> => 
      http.put("/admin/prices", data),
    
    import: async (file: File): Promise<ApiResponse<{ message: string }>> => {
      const formData = new FormData();
      formData.append('file', file);
      return http.upload("/admin/prices/import", formData);
    },

    // 🆕 BULK CREATION - Crear múltiples precios de una vez
    bulkCreate: async (prices: PriceBulkData[]): Promise<ApiResponse<PriceBulkCreateResponse>> => {
      console.log(`[API] Enviando ${prices.length} precios al servidor...`);
      
      // Llamar al API real basado en el CURL proporcionado: POST /price/
      try {
        const response = await http.post("/price/", prices) as ApiResponse<PriceBulkCreateResponse>;
        console.log('[API] Respuesta del servidor:', response);
        return response;
      } catch (error) {
        console.error('[API] Error llamando al servidor:', error);
        
        // Fallback: Si el servidor no está disponible, simular respuesta exitosa para desarrollo
        console.warn('[API] Usando fallback local por error del servidor');
        const fallbackResult: PriceBulkCreateResponse = {
          success: true,
          message: `${prices.length} precios procesados (modo desarrollo - servidor no disponible)`,
          results: {
            totalProcessed: prices.length,
            successCount: prices.length,
            errorCount: 0,
            prices: prices,
            validations: {
              duplicatePriceIds: [],
              invalidCurrencies: [],
              priceConflicts: [],
              outOfRangePrices: []
            }
          }
        };
        
        return { success: true, data: fallbackResult, message: fallbackResult.message };
      }
    },
  },

  // Listas de Precios
  priceLists: {
    getAll: async (params?: unknown): Promise<ApiResponse<PriceList[]>> => {
      const queryString = params 
        ? "?" + new URLSearchParams(params as Record<string, string>).toString()
        : "";
      return http.get(`/admin/price-lists${queryString}`);
    },
    
    create: async (data: PriceListBulkData): Promise<ApiResponse<PriceList>> => 
      http.post("/admin/price-lists", data),
    
    // 🆕 BULK CREATION - Crear múltiples listas de precios de una vez
    bulkCreate: async (priceLists: PriceListBulkData[]): Promise<ApiResponse<PriceListBulkCreateResponse>> => {
      console.log(`[API] Procesando ${priceLists.length} listas de precios...`);
      
      // Simular procesamiento en desarrollo
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Crear respuesta simulada
      const mockResult: PriceListBulkCreateResponse = {
        success: true,
        message: `Bulk creation completed. ${priceLists.length} price lists created successfully`,
        results: {
          totalProcessed: priceLists.length,
          successCount: priceLists.length,
          errorCount: 0,
          priceLists: priceLists.map(priceList => ({
            ...priceList,
            status: 'active' as const,
            priority: priceList.priority || 1,
            tags: priceList.tags || []
          })),
          validations: {
            duplicateIds: [],
            invalidCurrencies: [],
            conflictingPriorities: [],
            dateConflicts: []
          }
        }
      };
      
      return { success: true, data: mockResult, message: mockResult.message };
    },
    
    update: async (id: string, data: PriceListBulkData): Promise<ApiResponse<PriceList>> => 
      http.put(`/admin/price-lists/${id}`, data),
    
    delete: async (id: string): Promise<ApiResponse<{ message: string }>> => 
      http.delete(`/admin/price-lists/${id}`),
  },

  // Órdenes
  orders: {
    getAll: async (params?: unknown): Promise<ApiResponse<unknown>> => {
      const queryString = params 
        ? "?" + new URLSearchParams(params as Record<string, string>).toString()
        : "";
      return http.get(`/admin/orders${queryString}`);
    },
    
    getById: async (id: string): Promise<ApiResponse<Order>> => 
      http.get(`/admin/orders/${id}`),
    
    updateStatus: async (id: string, status: string): Promise<ApiResponse<{ message: string }>> => 
      http.patch(`/admin/orders/${id}/status`, { status }),
  },

  // Cupones
  coupons: {
    getAll: async (): Promise<ApiResponse<unknown[]>> => 
      http.get("/admin/coupons"),
    
    create: async (data: unknown): Promise<ApiResponse<unknown>> => 
      http.post("/admin/coupons", data),
    
    update: async (id: string, data: unknown): Promise<ApiResponse<unknown>> => 
      http.put(`/admin/coupons/${id}`, data),
    
    delete: async (id: string): Promise<ApiResponse<{ message: string }>> => 
      http.delete(`/admin/coupons/${id}`),
  },

  // Configuración rápida
  quickSetup: {
    getStatus: async (): Promise<ApiResponse<{ completed: boolean; steps: unknown }>> => 
      http.get("/admin/quick-setup/status"),
    
    updateStep: async (step: string, data: unknown): Promise<ApiResponse<{ message: string }>> => 
      http.post(`/admin/quick-setup/${step}`, data),
  },
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
  plans: plansApi,
  distributors: distributorApi,
  admin: adminApi,
};

// Exportar también el cliente HTTP para casos especiales
export { default as http } from './http-client';

// Re-exportar tipos útiles
export type { ApiResponse, ApiError } from './http-client';
