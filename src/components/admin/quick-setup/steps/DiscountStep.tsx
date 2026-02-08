import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileUploadComponent } from '../shared/FileUploadComponent';
import { StepProps, DiscountData, UploadMethod, UploadResult } from '../shared/types';
import { CheckCircle, Loader2 } from 'lucide-react';
import { api, DiscountBulkData, DiscountBulkCreateResponse } from '@/api';
import { parseDiscountFile } from '@/lib/file-parser';

// Datos de ejemplo para descuentos - Casos complejos reales
const sampleDiscounts: DiscountData[] = [
  {
    discountId: "DISC_3X2_ELECTRONICS_2024",
    name: "3x2 en Electrónicos",
    description: "Lleva 3 productos y paga solo 2 en toda la categoría de electrónicos",
    type: "fixed_amount",
    discountValue: 0,
    currency: "USD",
    status: "active",
    validFrom: "2024-01-01T00:00:00Z",
    validTo: "2024-12-31T23:59:59Z",
    maxDiscountAmount: 1000,
    minPurchaseAmount: 0,
    usageLimit: 10000,
    usageLimitPerCustomer: 5,
    customerType: "all",
    channel: "omnichannel",
    region: "all",
    conditions: {
      min_quantity: 3,
      max_quantity: null,
      buy_quantity: 3,
      pay_quantity: 2,
      description: "Por cada 3 productos, paga solo 2. Se aplica el descuento al producto de menor valor"
    },
    applicableTo: {
      type: "categories",
      categories: ["electronics", "computers", "smartphones"],
      products: [],
      brands: [],
      exclude_sale_items: true,
      minimum_margin: 15
    },
    tags: ["3x2", "electronics", "seasonal", "high-volume"],
    notes: "Aplicar descuento al producto de menor valor del grupo. No aplica con otros descuentos.",
    campaignUrl: "https://www.virtago.shop/promociones/3x2-electronics"
  },
  {
    discountId: "DISC_VIP_EXCLUSIVE_LUXURY",
    name: "Descuento Exclusivo VIP - Marcas Premium",
    description: "Descuento exclusivo del 20% para clientes VIP en marcas de lujo seleccionadas",
    type: "percentage",
    discountValue: 20,
    currency: "USD",
    status: "active",
    validFrom: "2024-01-01T00:00:00Z",
    validTo: null,
    priority: 10,
    isCumulative: false,
    maxDiscountAmount: 5000,
    minPurchaseAmount: 500,
    usageLimit: null,
    usageLimitPerCustomer: null,
    customerType: "vip",
    channel: "online",
    region: "international",
    conditions: {
      customer_segments: ["vip", "platinum", "diamond"],
      min_amount: 500,
      excluded_brands: ["generic-brand", "budget-line"],
      day_of_week: [],
      time_range: {
        start: "00:00",
        end: "23:59"
      }
    },
    applicableTo: {
      type: "brands",
      categories: [],
      products: [],
      brands: ["Apple", "Samsung", "Sony", "Bose", "LG"],
      exclude_sale_items: true,
      minimum_margin: 25
    },
    customFields: {
      campaign_code: "VIP2024LUXURY",
      marketing_budget: "50000",
      target_audience: "High-income professionals",
      invitation_only: true,
      requires_code: true
    },
    tags: ["vip", "exclusive", "luxury", "premium-brands", "high-value"],
    notes: "Solo para clientes VIP invitados. Requiere código de acceso. No acumulable con otros descuentos.",
    createdBy: "marketing@virtago.com",
    campaignUrl: "https://www.virtago.shop/vip/luxury-brands"
  },
  {
    discountId: "DISC_CATEGORY_FASHION_CLEARANCE",
    name: "Liquidación Ropa y Moda - Solo Categoría",
    description: "Hasta 50% de descuento en toda la categoría de moda y accesorios. Descuento exclusivo no acumulable.",
    type: "percentage",
    discountValue: 50,
    currency: "USD",
    status: "active",
    validFrom: "2024-06-01T00:00:00Z",
    validTo: "2024-06-30T23:59:59Z",
    priority: 9,
    isCumulative: false,
    maxDiscountAmount: 300,
    minPurchaseAmount: 50,
    usageLimit: 5000,
    usageLimitPerCustomer: 3,
    customerType: "all",
    channel: "omnichannel",
    region: "colombia",
    category: "fashion",
    conditions: {
      min_quantity: 1,
      product_categories: ["fashion", "clothing", "shoes", "accessories"],
      excluded_brands: [],
      seasonal: true,
      clearance: true
    },
    applicableTo: {
      type: "categories",
      categories: ["fashion", "clothing", "shoes", "accessories", "jewelry"],
      products: [],
      brands: [],
      exclude_sale_items: false,
      minimum_margin: 5
    },
    tags: ["clearance", "fashion", "seasonal", "summer-sale", "non-cumulative"],
    notes: "Descuento exclusivo de temporada. No acumulable con ningún otro descuento. Stock limitado.",
    campaignUrl: "https://www.virtago.shop/liquidacion/moda-verano"
  },
  {
    discountId: "DISC_TIERED_WHOLESALE_VOLUME",
    name: "Descuento Escalonado Mayoristas - Por Volumen",
    description: "Descuento escalonado según cantidad comprada para clientes mayoristas. A mayor volumen, mayor descuento.",
    type: "tiered_percentage",
    discountValue: 0,
    currency: "USD",
    status: "active",
    validFrom: "2024-01-01T00:00:00Z",
    validTo: null,
    priority: 7,
    isCumulative: false,
    maxDiscountAmount: null,
    minPurchaseAmount: 1000,
    usageLimit: null,
    usageLimitPerCustomer: null,
    customerType: "wholesale",
    channel: "b2b",
    region: "all",
    conditions: {
      tier_structure: [
        {
          min_quantity: 50,
          max_quantity: 99,
          discount_percentage: 8,
          description: "8% de descuento para 50-99 unidades"
        },
        {
          min_quantity: 100,
          max_quantity: 249,
          discount_percentage: 12,
          description: "12% de descuento para 100-249 unidades"
        },
        {
          min_quantity: 250,
          max_quantity: 499,
          discount_percentage: 18,
          description: "18% de descuento para 250-499 unidades"
        },
        {
          min_quantity: 500,
          max_quantity: null,
          discount_percentage: 25,
          description: "25% de descuento para 500+ unidades"
        }
      ],
      customer_segments: ["wholesale", "distributor", "reseller"],
      min_amount: 1000
    },
    applicableTo: {
      type: "all_products",
      categories: [],
      products: [],
      brands: [],
      exclude_sale_items: false,
      minimum_margin: 10
    },
    customFields: {
      campaign_code: "WHOLESALE2024",
      payment_terms: "NET30",
      requires_tax_id: true,
      auto_apply: true
    },
    tags: ["wholesale", "b2b", "volume-discount", "tiered", "high-quantity"],
    notes: "Solo para clientes mayoristas registrados con RUC/Tax ID válido. Descuento se aplica automáticamente según cantidad.",
    createdBy: "sales@virtago.com",
    approvedBy: "director@virtago.com",
    approvalDate: "2023-12-15T10:00:00Z"
  },
  {
    discountId: "DISC_FIRST_PURCHASE_WELCOME",
    name: "Bienvenida - Primera Compra 15%",
    description: "Descuento especial de bienvenida del 15% para la primera compra de nuevos clientes",
    type: "percentage",
    discountValue: 15,
    currency: "USD",
    status: "active",
    validFrom: "2024-01-01T00:00:00Z",
    validTo: null,
    priority: 6,
    isCumulative: false,
    maxDiscountAmount: 100,
    minPurchaseAmount: 30,
    usageLimit: null,
    usageLimitPerCustomer: 1,
    customerType: "retail",
    channel: "online",
    region: "all",
    conditions: {
      first_purchase_only: true,
      min_amount: 30,
      new_customer: true,
      requires_registration: true
    },
    applicableTo: {
      type: "all_products",
      categories: [],
      products: [],
      brands: [],
      exclude_sale_items: true,
      minimum_margin: 20
    },
    customFields: {
      campaign_code: "WELCOME15",
      welcome_email: true,
      referral_eligible: false,
      one_time_use: true
    },
    tags: ["welcome", "first-purchase", "new-customer", "one-time", "retail"],
    notes: "Solo válido para la primera compra. Cliente debe estar registrado. Se envía código por email.",
    campaignUrl: "https://www.virtago.shop/bienvenida"
  },
  {
    discountId: "DISC_FLASH_SALE_FRIDAY",
    name: "Flash Sale Viernes - 2 Horas Solamente",
    description: "Descuento relámpago del 35% solo por 2 horas cada viernes de 18:00 a 20:00",
    type: "percentage",
    discountValue: 35,
    currency: "USD",
    status: "active",
    validFrom: "2024-01-05T18:00:00Z",
    validTo: "2024-12-31T20:00:00Z",
    priority: 10,
    isCumulative: false,
    maxDiscountAmount: 200,
    minPurchaseAmount: 0,
    usageLimit: 1000,
    usageLimitPerCustomer: 1,
    customerType: "all",
    channel: "online",
    region: "all",
    conditions: {
      day_of_week: ["friday"],
      time_range: {
        start: "18:00",
        end: "20:00"
      },
      flash_sale: true,
      limited_time: true
    },
    applicableTo: {
      type: "products",
      categories: [],
      products: ["PROD_FLASH_001", "PROD_FLASH_002", "PROD_FLASH_003"],
      brands: [],
      exclude_sale_items: false,
      minimum_margin: 15
    },
    customFields: {
      campaign_code: "FLASH35",
      notification_required: true,
      countdown_timer: true,
      limited_stock: 100
    },
    tags: ["flash-sale", "time-limited", "friday", "urgent", "limited-stock"],
    notes: "Solo válido viernes de 18:00 a 20:00. Stock limitado a 100 unidades. Notificar clientes por push.",
    campaignUrl: "https://www.virtago.shop/flash-sale"
  },
  {
    discountId: "DISC_BUNDLE_TECH_STUDENT",
    name: "Pack Estudiante Tecnología - Descuento Especial",
    description: "25% de descuento en packs tecnológicos para estudiantes con credencial válida",
    type: "percentage",
    discountValue: 25,
    currency: "USD",
    status: "active",
    validFrom: "2024-01-15T00:00:00Z",
    validTo: "2024-12-31T23:59:59Z",
    priority: 7,
    isCumulative: false,
    maxDiscountAmount: 400,
    minPurchaseAmount: 200,
    usageLimit: null,
    usageLimitPerCustomer: 2,
    customerType: "student",
    channel: "omnichannel",
    region: "all",
    conditions: {
      customer_segments: ["student", "educator"],
      min_amount: 200,
      bundle_required: true,
      verification_required: true,
      valid_student_id: true
    },
    applicableTo: {
      type: "categories",
      categories: ["computers", "laptops", "tablets", "software", "accessories"],
      products: [],
      brands: [],
      exclude_sale_items: true,
      minimum_margin: 18
    },
    customFields: {
      campaign_code: "STUDENT2024",
      requires_verification: true,
      educational_discount: true,
      valid_institutions: ["university", "college", "high-school"],
      document_required: "student_id"
    },
    tags: ["student", "education", "tech-bundle", "verified", "back-to-school"],
    notes: "Requiere verificación de credencial estudiantil vigente. Máximo 2 compras por año académico.",
    createdBy: "education@virtago.com",
    campaignUrl: "https://www.virtago.shop/estudiantes/tech-pack"
  },
  {
    discountId: "DISC_PROGRESSIVE_LOYALTY",
    name: "Descuento Progresivo Programa de Lealtad",
    description: "Descuento que aumenta según nivel de lealtad: Bronze 5%, Silver 10%, Gold 15%, Platinum 20%",
    type: "progressive_percentage",
    discountValue: 0,
    currency: "USD",
    status: "active",
    validFrom: "2024-01-01T00:00:00Z",
    validTo: null,
    priority: 5,
    isCumulative: true,
    maxDiscountAmount: 1000,
    minPurchaseAmount: 0,
    usageLimit: null,
    usageLimitPerCustomer: null,
    customerType: "all",
    channel: "omnichannel",
    region: "all",
    conditions: {
      progressive_structure: [
        {
          level: "bronze",
          discount_percentage: 5,
          min_purchases: 1,
          min_spent: 0,
          description: "5% de descuento - Nivel Bronze"
        },
        {
          level: "silver",
          discount_percentage: 10,
          min_purchases: 5,
          min_spent: 500,
          description: "10% de descuento - Nivel Silver"
        },
        {
          level: "gold",
          discount_percentage: 15,
          min_purchases: 15,
          min_spent: 2000,
          description: "15% de descuento - Nivel Gold"
        },
        {
          level: "platinum",
          discount_percentage: 20,
          min_purchases: 30,
          min_spent: 5000,
          description: "20% de descuento - Nivel Platinum"
        }
      ],
      loyalty_program: true,
      auto_upgrade: true
    },
    applicableTo: {
      type: "all_products",
      categories: [],
      products: [],
      brands: [],
      exclude_sale_items: false,
      minimum_margin: 10
    },
    customFields: {
      campaign_code: "LOYALTY2024",
      program_name: "Virtago VIP Club",
      points_multiplier: 1.5,
      birthday_bonus: true
    },
    tags: ["loyalty", "progressive", "vip-club", "customer-retention", "recurring"],
    notes: "Descuento se aplica automáticamente según nivel de lealtad. Se puede combinar con otros descuentos acumulables.",
    createdBy: "loyalty@virtago.com",
    campaignUrl: "https://www.virtago.shop/loyalty/vip-club"
  }
];

interface DiscountStepProps extends StepProps {
  stepData?: {
    uploadedDiscounts?: DiscountData[];
  };
}

export function DiscountStep({ onNext, onBack, themeColors, stepData }: DiscountStepProps) {
  const [method, setMethod] = useState<UploadMethod>("file");
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedData, setUploadedData] = useState<DiscountData[]>(stepData?.uploadedDiscounts || []);
  const [apiResponse, setApiResponse] = useState<DiscountBulkCreateResponse | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // 🆕 Estados para manejo de archivos y métodos
  const [uploadMethod, setUploadMethod] = useState<UploadMethod | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);


  // Función para convertir datos del wizard al formato de API
  const convertToApiFormat = (discounts: DiscountData[]): DiscountBulkData[] => {
    return discounts.map((discount: DiscountData) => {
      // Extraer todos los campos del descuento original
      const originalData = discount as unknown as Record<string, unknown>;
      
      // Construir el objeto base con campos requeridos
      const apiDiscount: Record<string, unknown> = {
        discount_id: discount.discountId || originalData.discount_id,
        name: discount.name,
        description: discount.description,
        type: discount.type || originalData.discount_type,
        discount_value: discount.discountValue !== undefined ? discount.discountValue : originalData.discount_value,
        currency: discount.currency,
        valid_from: discount.validFrom || originalData.start_date,
        valid_to: discount.validTo || originalData.end_date,
        status: discount.status || (originalData.is_active ? 'active' : 'inactive'),
        priority: 1,
        is_cumulative: false,
        max_discount_amount: discount.maxDiscountAmount || originalData.max_discount_amount,
        min_purchase_amount: discount.minPurchaseAmount || originalData.min_purchase_amount,
        usage_limit: discount.usageLimit || originalData.usage_limit,
        usage_limit_per_customer: discount.usageLimitPerCustomer || originalData.usage_limit_per_customer,
        customer_type: discount.customerType,
        channel: discount.channel,
        region: 'colombia',
        category: discount.category,
        tags: [discount.type, discount.category, discount.customerType].filter(Boolean),
        notes: `Descuento ${discount.name} - ${discount.description}`,
        created_by: 'admin@virtago.shop'
      };

      // 🆕 CRÍTICO: Preservar campos complejos del JSON original
      // Estos campos contienen información estructurada que el backend necesita
      if (originalData.conditions) {
        apiDiscount.conditions = originalData.conditions;
      }
      
      if (originalData.applicable_to) {
        apiDiscount.applicable_to = originalData.applicable_to;
      }
      
      if (originalData.customFields) {
        apiDiscount.customFields = originalData.customFields;
      }

      // Preservar campos del backend en formato snake_case
      if (originalData.start_date) {
        apiDiscount.start_date = originalData.start_date;
      }
      
      if (originalData.end_date) {
        apiDiscount.end_date = originalData.end_date;
      }
      
      if (originalData.discount_type) {
        apiDiscount.discount_type = originalData.discount_type;
      }
      
      if (originalData.is_active !== undefined) {
        apiDiscount.is_active = originalData.is_active;
      }

      return apiDiscount as unknown as DiscountBulkData;
    });
  };

  // Función para normalizar datos de API a formato wizard
  const normalizeDiscountData = (apiData: Record<string, unknown>, index: number = 0): DiscountData => {
    // Extraer el valor del descuento, considerando estructuras anidadas
    let discountValue = 0;
    if (apiData.discount_value !== undefined) {
      discountValue = Number(apiData.discount_value);
    } else if (apiData.discountValue !== undefined) {
      discountValue = Number(apiData.discountValue);
    } else if (apiData.type === 'tiered_percentage' && apiData.conditions && typeof apiData.conditions === 'object') {
      // Para descuentos escalonados, tomar el máximo descuento
      const conditions = apiData.conditions as Record<string, unknown>;
      if (Array.isArray(conditions.tier_structure)) {
        const maxDiscount = Math.max(...conditions.tier_structure.map((tier: Record<string, unknown>) => Number(tier.discount_percentage) || 0));
        discountValue = maxDiscount;
      }
    } else if (apiData.type === 'progressive_percentage' && apiData.conditions && typeof apiData.conditions === 'object') {
      // Para descuentos progresivos, tomar el máximo descuento
      const conditions = apiData.conditions as Record<string, unknown>;
      if (Array.isArray(conditions.progressive_structure)) {
        const maxDiscount = Math.max(...conditions.progressive_structure.map((prog: Record<string, unknown>) => Number(prog.discount_percentage) || 0));
        discountValue = maxDiscount;
      }
    }

    // Validar campos requeridos
    let discountId = apiData.discount_id || apiData.discountId;
    const name = apiData.name;
    const type = apiData.type || apiData.discount_type;
    const currency = apiData.currency;
    
    // 🆕 Si no hay discount_id, generar uno basado en el nombre o un ID único
    if (!discountId && name) {
      // Generar ID: quitar espacios, convertir a uppercase, agregar timestamp
      const nameSlug = String(name).replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '').toUpperCase();
      discountId = `DISC_${nameSlug}_${Date.now().toString().slice(-6)}`;
      console.log(`🆔 Generando discount_id automático: ${discountId} para "${name}"`);
    }
    
    if (!discountId || !name || !type || !currency) {
      console.warn('Descuento con datos incompletos:', { discountId, name, type, currency, index });
    }

    // 🆕 Determinar el tipo correcto del descuento
    let discountType: 'percentage' | 'fixed_amount' | 'tiered_percentage' | 'progressive_percentage' = 'percentage';
    const typeStr = String(type || 'percentage').toLowerCase();
    
    if (typeStr.includes('fixed') || typeStr === 'fixed_amount') {
      discountType = 'fixed_amount';
    } else if (typeStr.includes('tier')) {
      discountType = 'tiered_percentage';
    } else if (typeStr.includes('progress')) {
      discountType = 'progressive_percentage';
    } else {
      discountType = 'percentage';
    }

    // 🆕 Determinar el status basado en is_active
    let status: 'active' | 'inactive' | 'draft' = 'active';
    if (apiData.is_active !== undefined) {
      const isActive = apiData.is_active;
      if (typeof isActive === 'boolean') {
        status = isActive ? 'active' : 'inactive';
      } else if (typeof isActive === 'string') {
        const activeStr = String(isActive).toLowerCase();
        status = ['true', 'verdadero', '1', 'yes', 'si', 'sí'].includes(activeStr) ? 'active' : 'inactive';
      }
    } else if (apiData.status) {
      status = String(apiData.status) as 'active' | 'inactive' | 'draft';
    }

    return {
      discountId: String(discountId || `DISC_${index + 1}_${Date.now()}`),
      name: String(name || ''),
      description: String(apiData.description || ''),
      type: discountType,
      discountValue: discountValue,
      currency: String(currency || 'USD'),
      validFrom: String(apiData.valid_from || apiData.validFrom || apiData.start_date || ''),
      validTo: String(apiData.valid_to || apiData.validTo || apiData.end_date || ''),
      status: status,
      customerType: String(apiData.customer_type || apiData.customerType || 'all') as 'all' | 'retail' | 'wholesale' | 'vip',
      channel: String(apiData.channel || 'online') as 'online' | 'offline' | 'omnichannel' | 'b2b' | 'all',
      category: String(apiData.category || 'general'),
      maxDiscountAmount: apiData.max_discount_amount ? Number(apiData.max_discount_amount) : 
                        apiData.maxDiscountAmount ? Number(apiData.maxDiscountAmount) : 
                        apiData.maximum_discount_amount ? Number(apiData.maximum_discount_amount) : undefined,
      minPurchaseAmount: apiData.min_purchase_amount ? Number(apiData.min_purchase_amount) : 
                        apiData.minPurchaseAmount ? Number(apiData.minPurchaseAmount) : 
                        apiData.minimum_purchase_amount ? Number(apiData.minimum_purchase_amount) : undefined,
      usageLimit: apiData.usage_limit ? Number(apiData.usage_limit) : 
                 apiData.usageLimit ? Number(apiData.usageLimit) : undefined,
      usageLimitPerCustomer: apiData.usage_limit_per_customer ? Number(apiData.usage_limit_per_customer) : 
                            apiData.usageLimitPerCustomer ? Number(apiData.usageLimitPerCustomer) : undefined
    };
  };

  const handleUpload = async (result: UploadResult<Record<string, unknown>>) => {
    if (!result.success) {
      console.error('Error uploading discounts:', result.error);
      
      // Mostrar mensaje de error más claro al usuario
      const errorMessage = result.error || 'Error desconocido';
      
      // Crear un mensaje más amigable basado en el tipo de error
      let userMessage = '❌ Error procesando el JSON:\n\n';
      
      if (errorMessage.includes('Unexpected token') || errorMessage.includes('Caracter inesperado')) {
        userMessage += `${errorMessage}\n\n💡 Tu JSON parece tener un problema de formato. Verifica:\n• Que todas las llaves { } estén balanceadas\n• Que no haya comas extras al final\n• Que todas las comillas estén cerradas correctamente`;
      } else if (errorMessage.includes('array de objetos')) {
        userMessage += `${errorMessage}\n\n💡 Asegúrate que tu JSON:\n• Empiece con [ y termine con ]\n• Contenga una lista de objetos de descuentos`;
      } else if (errorMessage.includes('vacío')) {
        userMessage += `${errorMessage}\n\n💡 El JSON debe contener al menos un descuento válido.`;
      } else {
        userMessage += `${errorMessage}\n\n💡 Verifica que el JSON esté correctamente formateado.`;
      }
      
      alert(userMessage);
      return;
    }

    // Validar que solo se use UN método de carga
    const currentMethod = method;
    
    if (uploadMethod && uploadMethod !== currentMethod) {
      alert(`Ya has cargado datos mediante ${uploadMethod === 'file' ? 'archivo' : 'JSON'}. Por favor, usa el mismo método o recarga la página.`);
      return;
    }

    setUploadMethod(currentMethod);

    try {
      // 🆕 PRESERVAR JSON ORIGINAL + NORMALIZAR para visualización
      // Normalizar para la UI pero mantener campos originales
      const normalizedData = result.data.map((rawDiscount: Record<string, unknown>, index: number) => {
        const normalized = normalizeDiscountData(rawDiscount, index);
        
        // 🔥 CRÍTICO: Agregar campos complejos del JSON original al objeto normalizado
        const enriched = normalized as unknown as Record<string, unknown>;
        
        // Preservar campos complejos exactamente como vienen del JSON
        if (rawDiscount.conditions) {
          enriched.conditions = rawDiscount.conditions;
        }
        if (rawDiscount.applicable_to) {
          enriched.applicable_to = rawDiscount.applicable_to;
        }
        if (rawDiscount.customFields) {
          enriched.customFields = rawDiscount.customFields;
        }
        
        // Preservar también campos del backend en snake_case
        if (rawDiscount.start_date) enriched.start_date = rawDiscount.start_date;
        if (rawDiscount.end_date) enriched.end_date = rawDiscount.end_date;
        if (rawDiscount.discount_type) enriched.discount_type = rawDiscount.discount_type;
        if (rawDiscount.discount_value !== undefined) enriched.discount_value = rawDiscount.discount_value;
        if (rawDiscount.is_active !== undefined) enriched.is_active = rawDiscount.is_active;
        if (rawDiscount.max_discount_amount !== undefined) enriched.max_discount_amount = rawDiscount.max_discount_amount;
        if (rawDiscount.min_purchase_amount !== undefined) enriched.min_purchase_amount = rawDiscount.min_purchase_amount;
        if (rawDiscount.usage_limit !== undefined) enriched.usage_limit = rawDiscount.usage_limit;
        if (rawDiscount.usage_limit_per_customer !== undefined) enriched.usage_limit_per_customer = rawDiscount.usage_limit_per_customer;
        
        return enriched as unknown as DiscountData;
      });
      
      console.log('🔍 [CARGA] JSON Original (primer descuento):', result.data[0]);
      console.log('🔍 [CARGA] Datos Enriquecidos (primer descuento):', normalizedData[0]);
      console.log('🔍 [CARGA] Campos preservados:', {
        conditions: !!(normalizedData[0] as unknown as Record<string, unknown>).conditions,
        applicable_to: !!(normalizedData[0] as unknown as Record<string, unknown>).applicable_to,
        customFields: !!(normalizedData[0] as unknown as Record<string, unknown>).customFields
      });
      
      // Validar que los datos normalizados son válidos (solo name y type son estrictamente requeridos)
      const validDiscounts = normalizedData.filter(discount => 
        discount.name && 
        discount.type
      );
      
      if (validDiscounts.length === 0) {
        alert('❌ No se encontraron descuentos válidos en el archivo.\n\n💡 Verifica que cada descuento tenga al menos: name y type (discount_type).');
        return;
      }
      
      if (validDiscounts.length < normalizedData.length) {
        alert(`⚠️ Se procesaron ${validDiscounts.length} de ${normalizedData.length} descuentos.\n\nAlgunos descuentos tenían datos incompletos y fueron omitidos.`);
      }
      
      // 🎯 SOLO CARGAR DATOS - NO LLAMAR API TODAVÍA
      console.log('✅ Datos cargados correctamente. Esperando confirmación del usuario...');
      setUploadedData(validDiscounts);
      
    } catch (error) {
      console.error('Error normalizing discount data:', error);
      alert('❌ Error procesando los datos de descuentos.\n\n💡 Verifica que el formato del JSON sea correcto.');
    }
  };

  // 🆕 Callback para guardar la referencia del archivo
  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
  };

  // 🆕 Función para CONFIRMAR y enviar al backend
  const handleConfirmAndContinue = async () => {
    if (uploadedData.length === 0) {
      alert('❌ No hay descuentos para procesar. Sube primero un archivo válido.');
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('🚀 Enviando descuentos al backend...');
      
      let apiData: DiscountBulkData[] | FormData;

      // Determinar si se usó archivo o JSON
      if (uploadMethod === 'file' && uploadedFile) {
        // 📁 ARCHIVO: Enviar como FormData
        console.log(`📁 Enviando archivo: ${uploadedFile.name}`);
        
        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('importType', 'discounts');
        
        apiData = formData;
      } else {
        // 📋 JSON: Convertir datos al formato de API
        console.log(`📋 Enviando ${uploadedData.length} descuentos como JSON`);
        console.log('📄 Datos originales (primeros 2):', uploadedData.slice(0, 2));
        
        apiData = convertToApiFormat(uploadedData);
        
        console.log('📤 Datos convertidos para API (primeros 2):', apiData.slice(0, 2));
        console.log('🔍 Verificando campos críticos del primer descuento:');
        console.log('  - conditions:', apiData[0]?.conditions);
        console.log('  - applicable_to:', apiData[0]?.applicable_to);
        console.log('  - customFields:', apiData[0]?.customFields);
      }
      
      // Llamar a la API real
      console.log('📤 Tipo de dato enviado:', apiData instanceof FormData ? 'FormData' : 'JSON Array');
      const response = await api.admin.discounts.bulkCreate(apiData);
      
      console.log('📥 Respuesta completa del backend:', response);
      console.log('📊 Status:', response.success);
      console.log('📋 Data:', response.data);
      
      if (response.success && response.data?.success) {
        console.log('✅ Descuentos insertados/actualizados exitosamente en la base de datos');
        setApiResponse(response.data);
        setShowConfirmation(true);
      } else {
        console.warn('⚠️ Respuesta no exitosa del backend:', {
          responseSuccess: response.success,
          dataSuccess: response.data?.success,
          message: response.data?.message || response.message
        });
        throw new Error(response.data?.message || response.message || 'Error procesando descuentos');
      }
    } catch (error) {
      console.error('❌ Error enviando descuentos al backend:', error);
      console.error('❌ Detalles del error:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      setIsProcessing(false);
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al enviar descuentos: ${errorMessage}\n\nContinuando con datos locales...`);
      
      // En caso de error, continuar con los datos locales
      onNext({ uploadedDiscounts: uploadedData });
    }
  };

  // Pantalla de confirmación después del procesamiento exitoso
  if (showConfirmation && apiResponse) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: `${themeColors.secondary}20` }}
          >
            <CheckCircle className="w-8 h-8" style={{ color: themeColors.secondary }} />
          </motion.div>
          
          <h3 className="text-xl font-semibold mb-2" style={{ color: themeColors.text.primary }}>
            ¡Descuentos Procesados Exitosamente!
          </h3>
          
          <p className="text-sm mb-6" style={{ color: themeColors.text.secondary }}>
            {apiResponse.message}
          </p>
        </div>

        {/* Estadísticas del procesamiento */}
        <div 
          className="p-6 rounded-xl"
          style={{ backgroundColor: `${themeColors.surface}30` }}
        >
          <h4 className="text-lg font-semibold mb-4" style={{ color: themeColors.text.primary }}>
            Resumen del Procesamiento
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: themeColors.primary }}>
                {apiResponse.results.totalProcessed}
              </div>
              <div className="text-sm" style={{ color: themeColors.text.secondary }}>
                Total Procesados
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: themeColors.secondary }}>
                {apiResponse.results.successCount}
              </div>
              <div className="text-sm" style={{ color: themeColors.text.secondary }}>
                Creados Exitosamente
              </div>
            </div>
            
            {apiResponse.results.errorCount > 0 && (
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: themeColors.accent }}>
                  {apiResponse.results.errorCount}
                </div>
                <div className="text-sm" style={{ color: themeColors.text.secondary }}>
                  Con Errores
                </div>
              </div>
            )}
          </div>

          {/* Mostrar errores si los hay */}
          {apiResponse.results.errors && apiResponse.results.errors.length > 0 && (
            <div className="mt-6">
              <h5 className="font-semibold mb-3" style={{ color: themeColors.text.primary }}>
                Errores Encontrados:
              </h5>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {apiResponse.results.errors.map((error: {index: number; discount: DiscountBulkData; error: string}, index: number) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border-l-4"
                    style={{
                      backgroundColor: `${themeColors.accent}10`,
                      borderLeftColor: themeColors.accent
                    }}
                  >
                    <div className="text-sm font-medium" style={{ color: themeColors.text.primary }}>
                      {error.discount.name}
                    </div>
                    <div className="text-xs" style={{ color: themeColors.accent }}>
                      {error.error}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mostrar validaciones si las hay */}
          {apiResponse.results.validations && (
            <div className="mt-6">
              {apiResponse.results.validations.overlappingDiscounts?.length > 0 && (
                <div className="mb-4">
                  <h5 className="font-semibold mb-2" style={{ color: themeColors.text.primary }}>
                    Conflictos de Descuentos:
                  </h5>
                  <div className="space-y-1">
                    {apiResponse.results.validations.overlappingDiscounts.map((conflict: {discount1: string; discount2: string; conflictType: string}, index: number) => (
                      <div
                        key={index}
                        className="text-sm p-2 rounded"
                        style={{ backgroundColor: `${themeColors.accent}10`, color: themeColors.text.secondary }}
                      >
                        {conflict.discount1} vs {conflict.discount2}: {conflict.conflictType}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Resumen de descuentos procesados */}
        {apiResponse.results.discounts && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold" style={{ color: themeColors.text.primary }}>
              Descuentos Creados ({apiResponse.results.discounts.length})
            </h4>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {apiResponse.results.discounts.slice(0, 5).map((discount: DiscountBulkData, index: number) => (
                <motion.div
                  key={discount.discount_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 rounded-lg border"
                  style={{
                    backgroundColor: `${themeColors.surface}20`,
                    borderColor: `${themeColors.secondary}30`
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm" style={{ color: themeColors.text.primary }}>
                        {discount.name}
                      </div>
                      <div className="text-xs" style={{ color: themeColors.text.secondary }}>
                        ID: {discount.discount_id} | Tipo: {discount.type}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold" style={{ color: themeColors.primary }}>
                        {discount.type === 'percentage' ? `${discount.discount_value}%` : `${discount.currency} ${discount.discount_value}`}
                      </div>
                      <div className="text-xs" style={{ color: themeColors.text.secondary }}>
                        {discount.status}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {apiResponse.results.discounts.length > 5 && (
                <div className="text-center py-2">
                  <span className="text-sm" style={{ color: themeColors.text.secondary }}>
                    ... y {apiResponse.results.discounts.length - 5} descuentos más
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botón de navegación */}
        <div className="flex justify-center pt-6">
          <motion.button
            onClick={() => onNext({ uploadedDiscounts: uploadedData, apiResponse })}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-3 rounded-xl font-medium text-white"
            style={{ backgroundColor: themeColors.primary }}
          >
            Continuar
          </motion.button>
        </div>
      </div>
    );
  }

  // Pantalla de procesamiento
  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 space-y-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 rounded-full border-4 border-transparent flex items-center justify-center"
          style={{ 
            borderTopColor: themeColors.primary,
            borderRightColor: `${themeColors.primary}50`
          }}
        >
          <Loader2 className="w-8 h-8" style={{ color: themeColors.primary }} />
        </motion.div>
        
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2" style={{ color: themeColors.text.primary }}>
            Procesando Descuentos...
          </h3>
          <p className="text-sm" style={{ color: themeColors.text.secondary }}>
            Validando y creando descuentos en el sistema. Esto puede tomar unos momentos.
          </p>
        </div>
        
        <div 
          className="w-64 h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: `${themeColors.surface}50` }}
        >
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, ease: "easeInOut" }}
            className="h-full rounded-full"
            style={{ backgroundColor: themeColors.primary }}
          />
        </div>
      </div>
    );
  }

  // 🆕 Vista de preview cuando hay datos cargados (OCULTA el formulario de carga)
  if (uploadedData.length > 0 && !isProcessing && !showConfirmation) {
    return (
      <div className="space-y-6">
        {/* Header con título y botón para cargar otros */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold" style={{ color: themeColors.text.primary }}>
            Descuentos Cargados - Revisión
          </h3>
          <motion.button
            onClick={() => {
              setUploadedData([]);
              setUploadMethod(null);
              setUploadedFile(null);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-lg"
            style={{ 
              backgroundColor: `${themeColors.accent}20`,
              color: themeColors.accent 
            }}
          >
            Cargar Otros
          </motion.button>
        </div>

        {/* Preview de descuentos cargados */}
        <div 
          className="p-6 rounded-xl"
          style={{ backgroundColor: `${themeColors.surface}20`, border: `1px solid ${themeColors.primary}30` }}
        >
          <h4 className="text-lg font-semibold mb-4" style={{ color: themeColors.text.primary }}>
            📋 Descuentos Importados ({uploadedData.length})
          </h4>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {uploadedData.slice(0, 10).map((discount, index) => (
              <motion.div
                key={discount.discountId || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: `${themeColors.surface}50`,
                  borderColor: `${themeColors.secondary}30`
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm mb-1" style={{ color: themeColors.text.primary }}>
                      {discount.name}
                    </div>
                    <div className="text-xs mb-2" style={{ color: themeColors.text.secondary }}>
                      {discount.description || 'Sin descripción'}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span 
                        className="px-2 py-1 rounded"
                        style={{ backgroundColor: `${themeColors.primary}20`, color: themeColors.primary }}
                      >
                        ID: {discount.discountId}
                      </span>
                      <span 
                        className="px-2 py-1 rounded"
                        style={{ backgroundColor: `${themeColors.secondary}20`, color: themeColors.secondary }}
                      >
                        Tipo: {discount.type}
                      </span>
                      {discount.status && (
                        <span 
                          className="px-2 py-1 rounded"
                          style={{ 
                            backgroundColor: discount.status === 'active' ? '#10b98120' : '#f59e0b20',
                            color: discount.status === 'active' ? '#10b981' : '#f59e0b'
                          }}
                        >
                          {discount.status === 'active' ? 'Activo' : discount.status}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="font-bold text-lg" style={{ color: themeColors.primary }}>
                      {discount.type === 'percentage' 
                        ? `${discount.discountValue}%` 
                        : `${discount.currency} ${discount.discountValue}`
                      }
                    </div>
                    {discount.minPurchaseAmount && (
                      <div className="text-xs" style={{ color: themeColors.text.secondary }}>
                        Min: {discount.currency} {discount.minPurchaseAmount}
                      </div>
                    )}
                    {discount.maxDiscountAmount && (
                      <div className="text-xs" style={{ color: themeColors.text.secondary }}>
                        Max: {discount.currency} {discount.maxDiscountAmount}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Información adicional */}
                <div className="mt-3 pt-3 border-t flex flex-wrap gap-3 text-xs" style={{ borderColor: `${themeColors.secondary}20` }}>
                  {discount.customerType && (
                    <div style={{ color: themeColors.text.secondary }}>
                      <span className="font-medium">Cliente:</span> {discount.customerType}
                    </div>
                  )}
                  {discount.channel && (
                    <div style={{ color: themeColors.text.secondary }}>
                      <span className="font-medium">Canal:</span> {discount.channel}
                    </div>
                  )}
                  {discount.validFrom && (
                    <div style={{ color: themeColors.text.secondary }}>
                      <span className="font-medium">Válido desde:</span> {new Date(discount.validFrom).toLocaleDateString()}
                    </div>
                  )}
                  {discount.validTo && (
                    <div style={{ color: themeColors.text.secondary }}>
                      <span className="font-medium">Hasta:</span> {new Date(discount.validTo).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            
            {uploadedData.length > 10 && (
              <div className="text-center py-2">
                <span className="text-sm" style={{ color: themeColors.text.secondary }}>
                  ... y {uploadedData.length - 10} descuentos más
                </span>
              </div>
            )}
          </div>

          {/* Resumen */}
          <div 
            className="mt-4 pt-4 border-t flex justify-between items-center"
            style={{ borderColor: `${themeColors.secondary}20` }}
          >
            <div className="text-sm" style={{ color: themeColors.text.secondary }}>
              <span className="font-medium">Total de descuentos:</span> {uploadedData.length}
            </div>
            <div className="text-sm" style={{ color: themeColors.text.secondary }}>
              <span className="font-medium">Método:</span> {uploadMethod === 'file' ? 'Archivo' : 'JSON'}
            </div>
          </div>
        </div>

        {/* Botones de navegación */}
        <div className="flex justify-between pt-6">
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 rounded-xl font-medium"
            style={{
              backgroundColor: `${themeColors.surface}50`,
              color: themeColors.text.primary,
              border: `1px solid ${themeColors.primary}30`
            }}
          >
            Anterior
          </motion.button>
          
          <motion.button
            onClick={handleConfirmAndContinue}
            disabled={isProcessing}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-3 rounded-xl font-medium text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: themeColors.primary }}
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Procesando...
              </span>
            ) : (
              <span>Confirmar y Continuar</span>
            )}
          </motion.button>
        </div>
      </div>
    );
  }

  // Vista de carga inicial (formulario)
  return (
    <div className="space-y-6">
      {/* Selector de método */}
      <div className="flex items-center justify-center">
        <div 
          className="flex p-1 rounded-xl"
          style={{ backgroundColor: `${themeColors.surface}50` }}
        >
          <motion.button
            onClick={() => setMethod("file")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              method === "file" ? "" : "opacity-70"
            }`}
            style={{
              backgroundColor: method === "file" ? themeColors.primary : "transparent",
              color: method === "file" ? "white" : themeColors.text.primary,
            }}
          >
            Subir Archivo
          </motion.button>
          <motion.button
            onClick={() => setMethod("json")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              method === "json" ? "" : "opacity-70"
            }`}
            style={{
              backgroundColor: method === "json" ? themeColors.primary : "transparent",
              color: method === "json" ? "white" : themeColors.text.primary,
            }}
          >
            Importar JSON
          </motion.button>
        </div>
      </div>

      {/* Mensaje de ayuda para JSON */}
      {method === "json" && (
        <div 
          className="p-4 rounded-lg mb-4"
          style={{ backgroundColor: `${themeColors.surface}20`, border: `1px solid ${themeColors.primary}30` }}
        >
          <h5 className="font-semibold mb-2" style={{ color: themeColors.text.primary }}>
            💡 Formato JSON para Descuentos
          </h5>
          <p className="text-sm mb-2" style={{ color: themeColors.text.secondary }}>
            El JSON debe ser un array de objetos con la siguiente estructura:
          </p>
          <div className="text-xs bg-gray-800 text-green-400 p-2 rounded font-mono whitespace-pre">
{`[{
  "discountId": "DISC_001",
  "name": "Descuento Ejemplo", 
  "type": "percentage",
  "discountValue": 10,
  "currency": "COP",
  "validFrom": "2024-01-01T00:00:00Z",
  "status": "active",
  "customerType": "all", 
  "channel": "online",
  "category": "electronics"
}]`}
          </div>
          <p className="text-xs mt-2" style={{ color: themeColors.accent }}>
            ⚠️ Asegúrate que el JSON termine correctamente con ] y no tenga contenido adicional después.
          </p>
        </div>
      )}

      {/* Componente de upload */}
      <FileUploadComponent
        method={method}
        onUpload={handleUpload}
        onFileSelect={handleFileSelect}
        onBack={onBack}
        themeColors={themeColors}
        sampleData={sampleDiscounts as unknown as Record<string, unknown>[]}
        title="Descuentos y Promociones"
        acceptedFileTypes=".csv,.xlsx,.json"
        fileExtensions={["csv", "xlsx", "json"]}
        isProcessing={isProcessing}
        parseFile={parseDiscountFile}
      />
    </div>
  );
}