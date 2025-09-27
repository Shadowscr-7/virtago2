/**
 * Mock service para precios - Simulación para desarrollo
 * Simula el comportamiento del API real para bulk creation de precios
 */

// Definir tipos localmente para evitar importación circular
interface PriceBulkData {
  name: string;
  priceId: string;
  productSku: string;
  productName: string;
  basePrice: number;
  salePrice?: number;
  discountPrice?: number;
  wholesalePrice?: number;
  retailPrice?: number;
  loyaltyPrice?: number;
  corporatePrice?: number;
  currency: string;
  validFrom: string;
  validUntil?: string;
  minQuantity?: number;
  maxQuantity?: number;
  priceType?: 'regular' | 'promotional' | 'seasonal';
  customerType?: 'all' | 'retail' | 'wholesale' | 'corporate' | 'vip';
  channel?: 'online' | 'offline' | 'omnichannel' | 'mobile';
  region?: string;
  city?: string;
  zone?: string;
  status?: 'active' | 'inactive' | 'draft';
  priority?: number;
  taxIncluded?: boolean;
  taxRate?: number;
  margin?: number;
  costPrice?: number;
  profitMargin?: number;
  competitorPrice?: number;
  marketPosition?: 'above_market' | 'competitive' | 'below_market';
  seasonality?: string;
  customFields?: Record<string, unknown>;
  tags?: string[];
  notes?: string;
}

interface PriceBulkCreateResponse {
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

// Simulación de validaciones
const validatePrice = (price: PriceBulkData) => {
  const errors: string[] = [];
  
  // Validar campos requeridos
  if (!price.name?.trim()) {
    errors.push("name es requerido");
  }
  
  if (!price.priceId?.trim()) {
    errors.push("priceId es requerido");
  }
  
  if (!price.productSku?.trim()) {
    errors.push("productSku es requerido");
  }
  
  if (!price.productName?.trim()) {
    errors.push("productName es requerido");
  }
  
  if (!price.basePrice || price.basePrice <= 0) {
    errors.push("basePrice debe ser mayor a 0");
  }
  
  if (!price.currency?.trim()) {
    errors.push("currency es requerido");
  }
  
  if (!price.validFrom?.trim()) {
    errors.push("validFrom es requerido");
  }
  
  // Validar formato de fecha
  if (price.validFrom) {
    const validFromDate = new Date(price.validFrom);
    if (isNaN(validFromDate.getTime())) {
      errors.push("validFrom debe tener formato válido (ISO 8601)");
    }
    
    if (price.validUntil) {
      const validUntilDate = new Date(price.validUntil);
      if (isNaN(validUntilDate.getTime())) {
        errors.push("validUntil debe tener formato válido (ISO 8601)");
      } else if (validUntilDate <= validFromDate) {
        errors.push("validUntil debe ser posterior a validFrom");
      }
    }
  }
  
  // Validar monedas soportadas
  const supportedCurrencies = ['COP', 'USD', 'EUR', 'MXN', 'PEN'];
  if (price.currency && !supportedCurrencies.includes(price.currency.toUpperCase())) {
    errors.push(`Moneda ${price.currency} no soportada. Soportadas: ${supportedCurrencies.join(', ')}`);
  }
  
  // Validar precios lógicos
  if (price.basePrice && price.salePrice && price.salePrice > price.basePrice) {
    errors.push("salePrice no puede ser mayor que basePrice");
  }
  
  if (price.basePrice && price.discountPrice && price.discountPrice > price.basePrice) {
    errors.push("discountPrice no puede ser mayor que basePrice");
  }
  
  if (price.costPrice && price.basePrice && price.costPrice >= price.basePrice) {
    errors.push("costPrice debe ser menor que basePrice");
  }
  
  // Validar quantities
  if (price.minQuantity !== undefined && price.minQuantity < 0) {
    errors.push("minQuantity debe ser mayor o igual a 0");
  }
  
  if (price.maxQuantity !== undefined && price.maxQuantity < 1) {
    errors.push("maxQuantity debe ser mayor a 0");
  }
  
  if (price.minQuantity !== undefined && 
      price.maxQuantity !== undefined && 
      price.minQuantity >= price.maxQuantity) {
    errors.push("maxQuantity debe ser mayor que minQuantity");
  }
  
  // Validar status
  const validStatuses = ['active', 'inactive', 'draft'];
  if (price.status && !validStatuses.includes(price.status)) {
    errors.push(`status debe ser uno de: ${validStatuses.join(', ')}`);
  }
  
  // Validar priceType
  const validPriceTypes = ['regular', 'promotional', 'seasonal'];
  if (price.priceType && !validPriceTypes.includes(price.priceType)) {
    errors.push(`priceType debe ser uno de: ${validPriceTypes.join(', ')}`);
  }
  
  // Validar marketPosition
  const validMarketPositions = ['above_market', 'competitive', 'below_market'];
  if (price.marketPosition && !validMarketPositions.includes(price.marketPosition)) {
    errors.push(`marketPosition debe ser uno de: ${validMarketPositions.join(', ')}`);
  }
  
  // Validar tax rate
  if (price.taxRate !== undefined && (price.taxRate < 0 || price.taxRate > 100)) {
    errors.push("taxRate debe estar entre 0 y 100");
  }
  
  return errors;
};

// Simular detección de duplicados y conflictos
const analyzeData = (prices: PriceBulkData[]) => {
  const duplicatePriceIds: string[] = [];
  const invalidCurrencies: string[] = [];
  const priceConflicts: Array<{
    priceId: string;
    conflictType: string;
  }> = [];
  const outOfRangePrices: Array<{
    priceId: string;
    issue: string;
  }> = [];
  
  const seenIds = new Set<string>();
  
  prices.forEach(price => {
    // Detectar IDs duplicados
    if (seenIds.has(price.priceId)) {
      duplicatePriceIds.push(price.priceId);
    }
    seenIds.add(price.priceId);
    
    // Detectar monedas inválidas
    const supportedCurrencies = ['COP', 'USD', 'EUR', 'MXN', 'PEN'];
    if (price.currency && !supportedCurrencies.includes(price.currency.toUpperCase())) {
      invalidCurrencies.push(price.currency);
    }
    
    // Detectar conflictos de precios
    if (price.basePrice && price.competitorPrice && price.basePrice > price.competitorPrice * 1.5) {
      priceConflicts.push({
        priceId: price.priceId,
        conflictType: "Precio muy por encima de la competencia"
      });
    }
    
    if (price.costPrice && price.basePrice && (price.basePrice - price.costPrice) / price.basePrice < 0.1) {
      priceConflicts.push({
        priceId: price.priceId,
        conflictType: "Margen muy bajo (menos del 10%)"
      });
    }
    
    // Detectar precios fuera de rango
    if (price.basePrice && (price.basePrice < 100 || price.basePrice > 10000000)) {
      outOfRangePrices.push({
        priceId: price.priceId,
        issue: "Precio base fuera del rango esperado"
      });
    }
  });
  
  return {
    duplicatePriceIds: Array.from(new Set(duplicatePriceIds)),
    invalidCurrencies: Array.from(new Set(invalidCurrencies)),
    priceConflicts,
    outOfRangePrices
  };
};

/**
 * Mock function para bulk creation de precios
 */
export const mockPriceBulkCreate = async (prices: PriceBulkData[]): Promise<PriceBulkCreateResponse> => {
  console.log(`[MOCK] Procesando ${prices.length} precios...`);
  
  // Simular delay del API
  await new Promise(resolve => setTimeout(resolve, 2500));
  
  const errors: Array<{
    index: number;
    price: PriceBulkData;
    error: string;
  }> = [];
  
  const successfulPrices: PriceBulkData[] = [];
  
  // Validar cada precio
  prices.forEach((price, index) => {
    const validationErrors = validatePrice(price);
    
    if (validationErrors.length > 0) {
      errors.push({
        index,
        price,
        error: validationErrors.join('; ')
      });
    } else {
      // Simular asignación de valores por defecto
      const processedPrice: PriceBulkData = {
        ...price,
        status: price.status || 'active',
        priceType: price.priceType || 'regular',
        priority: price.priority || (index + 1),
        taxIncluded: price.taxIncluded !== undefined ? price.taxIncluded : true,
        taxRate: price.taxRate || 19,
        minQuantity: price.minQuantity || 1,
        maxQuantity: price.maxQuantity || 1000,
        customerType: price.customerType || 'all',
        channel: price.channel || 'omnichannel',
        region: price.region || 'colombia'
      };
      
      successfulPrices.push(processedPrice);
    }
  });
  
  // Analizar datos para detectar conflictos
  const validations = analyzeData(successfulPrices);
  
  // Simular algunas validaciones aleatorias adicionales
  if (Math.random() > 0.8 && errors.length === 0) {
    const randomIndex = Math.floor(Math.random() * prices.length);
    errors.push({
      index: randomIndex,
      price: prices[randomIndex],
      error: "Precio con ID duplicado en base de datos existente"
    });
  }
  
  const successCount = prices.length - errors.length;
  const isSuccess = successCount > 0;
  
  console.log(`[MOCK] Procesamiento completado: ${successCount}/${prices.length} exitosos`);
  
  return {
    success: isSuccess,
    message: isSuccess 
      ? `Bulk creation completed. ${successCount} prices created successfully${errors.length > 0 ? ` with ${errors.length} errors` : ''}`
      : `Bulk creation failed. ${errors.length} validation errors found`,
    results: {
      totalProcessed: prices.length,
      successCount,
      errorCount: errors.length,
      prices: successCount > 0 ? successfulPrices : undefined,
      errors: errors.length > 0 ? errors : undefined,
      validations: {
        duplicatePriceIds: validations.duplicatePriceIds,
        invalidCurrencies: validations.invalidCurrencies,
        priceConflicts: validations.priceConflicts,
        outOfRangePrices: validations.outOfRangePrices
      }
    }
  };
};

// Función auxiliar para generar datos de ejemplo
export const generateSamplePriceData = (): PriceBulkData[] => [
  {
    name: "Precio Café Premium Colombiano",
    priceId: "PRC_CAFE_PREM_001",
    productSku: "SKU_CAFE_500G",
    productName: "Café Premium Colombiano 500g",
    basePrice: 25000,
    salePrice: 22500,
    discountPrice: 20000,
    wholesalePrice: 18500,
    retailPrice: 25000,
    loyaltyPrice: 21000,
    corporatePrice: 17500,
    currency: "COP",
    validFrom: "2024-01-01T00:00:00Z",
    validUntil: "2024-12-31T23:59:59Z",
    minQuantity: 1,
    maxQuantity: 100,
    priceType: "regular",
    customerType: "all",
    channel: "omnichannel",
    region: "colombia",
    city: "bogota",
    zone: "zona_norte",
    status: "active",
    priority: 1,
    taxIncluded: true,
    taxRate: 19,
    margin: 35.5,
    costPrice: 16250,
    profitMargin: 8750,
    competitorPrice: 26500,
    marketPosition: "competitive",
    seasonality: "all_year",
    customFields: {
      supplier_code: "SUPP_CAFE_001",
      brand_discount: "10%",
      volume_tier: "standard",
      payment_terms: "Net 30"
    },
    tags: ["premium", "colombiano", "bebidas"],
    notes: "Precio premium para café de alta calidad, competitivo en el mercado"
  },
  {
    name: "Precio Aceite Oliva Premium",
    priceId: "PRC_ACEITE_OLIVA_001",
    productSku: "SKU_ACEITE_500ML",
    productName: "Aceite de Oliva Extra Virgen 500ml",
    basePrice: 18500,
    salePrice: 16650,
    discountPrice: 15500,
    wholesalePrice: 14200,
    retailPrice: 18500,
    loyaltyPrice: 16000,
    corporatePrice: 13800,
    currency: "COP",
    validFrom: "2024-01-01T00:00:00Z",
    validUntil: "2024-12-31T23:59:59Z",
    minQuantity: 1,
    maxQuantity: 50,
    priceType: "regular",
    customerType: "retail",
    channel: "online",
    region: "colombia",
    city: "medellin",
    status: "active",
    priority: 2,
    taxIncluded: true,
    taxRate: 19,
    margin: 28.5,
    costPrice: 13225,
    profitMargin: 5275,
    competitorPrice: 19200,
    marketPosition: "below_market",
    seasonality: "all_year",
    tags: ["aceite", "oliva", "premium", "saludable"],
    notes: "Precio competitivo para aceite importado de alta calidad"
  }
];