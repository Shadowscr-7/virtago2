/**
 * Mock service para listas de precios - Simulación para desarrollo
 * Simula el comportamiento del API real para bulk creation de listas de precios
 */

// Definir tipos localmente para evitar importación circular
interface PriceListBulkData {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'inactive' | 'draft';
  currency: string;
  priceType: 'regular' | 'promotional' | 'seasonal';
  customerSegments: string[];
  channels: string[];
  regions: string[];
  priority: number;
  margin?: number;
  discountRules?: {
    type: 'percentage' | 'fixed';
    value: number;
    conditions?: string[];
  }[];
  taxIncluded: boolean;
  taxRate?: number;
  customFields?: Record<string, unknown>;
  tags: string[];
  notes?: string;
}

interface PriceListBulkCreateResponse {
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
      dateConflicts: string[];
      overlappingPeriods: Array<{
        priceList1: string;
        priceList2: string;
      }>;
    };
  };
}

// Simulación de listas de precios existentes
const existingPriceLists = [
  "PL_STANDARD_001",
  "PL_PREMIUM_002", 
  "PL_WHOLESALE_003"
];

// Simulación de validaciones
const validatePriceList = (priceList: PriceListBulkData, index: number) => {
  const errors: string[] = [];
  
  // Validar campos requeridos
  if (!priceList.price_list_id?.trim()) {
    errors.push("price_list_id es requerido");
  }
  
  if (!priceList.name?.trim()) {
    errors.push("name es requerido");
  }
  
  if (!priceList.currency?.trim()) {
    errors.push("currency es requerido");
  }
  
  if (!priceList.country?.trim()) {
    errors.push("country es requerido");
  }
  
  if (!priceList.customer_type?.trim()) {
    errors.push("customer_type es requerido");
  }
  
  if (!priceList.channel?.trim()) {
    errors.push("channel es requerido");
  }
  
  if (!priceList.start_date?.trim()) {
    errors.push("start_date es requerido");
  }
  
  // Validar formato de fecha
  if (priceList.start_date) {
    const startDate = new Date(priceList.start_date);
    if (isNaN(startDate.getTime())) {
      errors.push("start_date debe tener formato válido (ISO 8601)");
    }
    
    if (priceList.end_date) {
      const endDate = new Date(priceList.end_date);
      if (isNaN(endDate.getTime())) {
        errors.push("end_date debe tener formato válido (ISO 8601)");
      } else if (endDate <= startDate) {
        errors.push("end_date debe ser posterior a start_date");
      }
    }
  }
  
  // Validar monedas soportadas
  const supportedCurrencies = ['USD', 'EUR', 'COP', 'MXN', 'PEN'];
  if (priceList.currency && !supportedCurrencies.includes(priceList.currency.toUpperCase())) {
    errors.push(`Moneda ${priceList.currency} no soportada. Soportadas: ${supportedCurrencies.join(', ')}`);
  }
  
  // Validar priority (debe ser único y positivo)
  if (priceList.priority !== undefined && priceList.priority < 1) {
    errors.push("priority debe ser mayor a 0");
  }
  
  // Validar applies_to
  const validAppliesTo = ['all', 'specific_categories', 'specific_products', 'promotional_items', 'premium_products'];
  if (priceList.applies_to && !validAppliesTo.includes(priceList.applies_to)) {
    errors.push(`applies_to debe ser uno de: ${validAppliesTo.join(', ')}`);
  }
  
  // Validar discount_type
  const validDiscountTypes = ['percentage', 'fixed', 'tiered'];
  if (priceList.discount_type && !validDiscountTypes.includes(priceList.discount_type)) {
    errors.push(`discount_type debe ser uno de: ${validDiscountTypes.join(', ')}`);
  }
  
  // Validar status
  const validStatuses = ['active', 'inactive', 'draft'];
  if (priceList.status && !validStatuses.includes(priceList.status)) {
    errors.push(`status debe ser uno de: ${validStatuses.join(', ')}`);
  }
  
  // Validar customer_type
  const validCustomerTypes = ['retail', 'wholesale', 'corporate', 'vip', 'retail_premium'];
  if (priceList.customer_type && !validCustomerTypes.includes(priceList.customer_type)) {
    errors.push(`customer_type debe ser uno de: ${validCustomerTypes.join(', ')}`);
  }
  
  // Validar quantities
  if (priceList.minimum_quantity !== undefined && priceList.minimum_quantity < 0) {
    errors.push("minimum_quantity debe ser mayor o igual a 0");
  }
  
  if (priceList.maximum_quantity !== undefined && priceList.maximum_quantity < 1) {
    errors.push("maximum_quantity debe ser mayor a 0");
  }
  
  if (priceList.minimum_quantity !== undefined && 
      priceList.maximum_quantity !== undefined && 
      priceList.minimum_quantity >= priceList.maximum_quantity) {
    errors.push("maximum_quantity debe ser mayor que minimum_quantity");
  }
  
  return errors;
};

// Simular detección de duplicados y conflictos
const analyzeData = (priceLists: PriceListBulkData[]) => {
  const duplicateIds: string[] = [];
  const invalidCurrencies: string[] = [];
  const conflictingPriorities: Array<{
    priceListId: string;
    existingPriority: number;
    newPriority: number;
  }> = [];
  const dateConflicts: Array<{
    priceListId: string;
    issue: string;
  }> = [];
  
  const seenIds = new Set<string>();
  const seenPriorities = new Set<number>();
  
  priceLists.forEach(priceList => {
    // Detectar IDs duplicados
    if (seenIds.has(priceList.price_list_id)) {
      duplicateIds.push(priceList.price_list_id);
    }
    seenIds.add(priceList.price_list_id);
    
    // Detectar monedas inválidas
    const supportedCurrencies = ['USD', 'EUR', 'COP', 'MXN', 'PEN'];
    if (priceList.currency && !supportedCurrencies.includes(priceList.currency.toUpperCase())) {
      invalidCurrencies.push(priceList.currency);
    }
    
    // Detectar prioridades conflictivas
    if (priceList.priority !== undefined) {
      if (seenPriorities.has(priceList.priority)) {
        conflictingPriorities.push({
          priceListId: priceList.price_list_id,
          existingPriority: priceList.priority,
          newPriority: priceList.priority + 1
        });
      }
      seenPriorities.add(priceList.priority);
    }
    
    // Detectar conflictos de fechas
    if (priceList.start_date && priceList.end_date) {
      const startDate = new Date(priceList.start_date);
      const endDate = new Date(priceList.end_date);
      const now = new Date();
      
      if (startDate > endDate) {
        dateConflicts.push({
          priceListId: priceList.price_list_id,
          issue: "Fecha de inicio posterior a fecha de fin"
        });
      }
      
      if (endDate < now) {
        dateConflicts.push({
          priceListId: priceList.price_list_id,
          issue: "Fecha de fin ya expirada"
        });
      }
    }
  });
  
  return {
    duplicateIds: Array.from(new Set(duplicateIds)),
    invalidCurrencies: Array.from(new Set(invalidCurrencies)),
    conflictingPriorities,
    dateConflicts
  };
};

/**
 * Mock function para bulk creation de listas de precios
 */
export const mockPriceListBulkCreate = async (priceLists: PriceListBulkData[]): Promise<PriceListBulkCreateResponse> => {
  console.log(`[MOCK] Procesando ${priceLists.length} listas de precios...`);
  
  // Simular delay del API
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const errors: Array<{
    index: number;
    priceList: PriceListBulkData;
    error: string;
  }> = [];
  
  const successfulPriceLists: PriceListBulkData[] = [];
  
  // Validar cada lista de precios
  priceLists.forEach((priceList, index) => {
    const validationErrors = validatePriceList(priceList, index);
    
    if (validationErrors.length > 0) {
      errors.push({
        index,
        priceList,
        error: validationErrors.join('; ')
      });
    } else {
      // Simular asignación de valores por defecto
      const processedPriceList: PriceListBulkData = {
        ...priceList,
        status: priceList.status || 'active',
        default: priceList.default || false,
        priority: priceList.priority || (index + 1),
        applies_to: priceList.applies_to || 'all',
        discount_type: priceList.discount_type || 'percentage',
        minimum_quantity: priceList.minimum_quantity || 1,
        maximum_quantity: priceList.maximum_quantity || 1000
      };
      
      successfulPriceLists.push(processedPriceList);
    }
  });
  
  // Analizar datos para detectar conflictos
  const validations = analyzeData(successfulPriceLists);
  
  // Simular algunas validaciones aleatorias adicionales
  if (Math.random() > 0.7 && errors.length === 0) {
    const randomIndex = Math.floor(Math.random() * priceLists.length);
    errors.push({
      index: randomIndex,
      priceList: priceLists[randomIndex],
      error: "Lista de precios con ID duplicado en base de datos existente"
    });
  }
  
  const successCount = priceLists.length - errors.length;
  const isSuccess = successCount > 0;
  
  console.log(`[MOCK] Procesamiento completado: ${successCount}/${priceLists.length} exitosas`);
  
  return {
    success: isSuccess,
    message: isSuccess 
      ? `Bulk creation completed. ${successCount} price lists created successfully${errors.length > 0 ? ` with ${errors.length} errors` : ''}`
      : `Bulk creation failed. ${errors.length} validation errors found`,
    results: {
      totalProcessed: priceLists.length,
      successCount,
      errorCount: errors.length,
      priceLists: successCount > 0 ? successfulPriceLists : undefined,
      errors: errors.length > 0 ? errors : undefined,
      validations: {
        duplicateIds: validations.duplicateIds,
        invalidCurrencies: validations.invalidCurrencies,
        conflictingPriorities: validations.conflictingPriorities,
        dateConflicts: validations.dateConflicts
      }
    }
  };
};

// Función auxiliar para generar datos de ejemplo
export const generateSamplePriceListData = (): PriceListBulkData[] => [
  {
    price_list_id: "PL_RETAIL_001",
    name: "Lista Retail Premium",
    description: "Lista de precios para clientes retail premium con descuentos especiales",
    currency: "USD",
    country: "Colombia",
    region: "Bogotá",
    customer_type: "retail_premium",
    channel: "online",
    start_date: "2024-01-01T00:00:00Z",
    end_date: "2024-12-31T23:59:59Z",
    status: "active",
    default: false,
    priority: 1,
    applies_to: "all",
    discount_type: "percentage",
    minimum_quantity: 1,
    maximum_quantity: 1000,
    custom_fields: {
      region_manager: "Juan Pérez",
      approval_required: true,
      max_discount: "15%"
    },
    tags: ["retail", "premium", "online"],
    notes: "Lista especial para clientes retail con volumen alto de compras"
  },
  {
    price_list_id: "PL_WHOLESALE_002",
    name: "Lista Mayorista Estándar",
    description: "Precios especiales para distribuidores mayoristas",
    currency: "USD",
    country: "Colombia",
    region: "Nacional",
    customer_type: "wholesale",
    channel: "b2b",
    start_date: "2024-01-01T00:00:00Z",
    status: "active",
    default: true,
    priority: 2,
    applies_to: "specific_categories",
    discount_type: "tiered",
    minimum_quantity: 50,
    maximum_quantity: 5000,
    custom_fields: {
      volume_discount: true,
      payment_terms: "Net 30",
      shipping_included: false
    },
    tags: ["wholesale", "b2b", "distributor"],
    notes: "Lista base para todos los distribuidores mayoristas"
  }
];