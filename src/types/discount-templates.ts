// Tipos de templates de descuentos disponibles
export type DiscountTemplateType =
  | "buy_x_get_y"       // 3x2, 2x1, etc.
  | "tiered_volume"     // Descuentos escalonados por volumen
  | "bundle"            // Paquetes de productos
  | "bogo"              // Buy One Get One
  | "spend_threshold"   // Gasta X, obtén descuento
  | "mix_and_match"     // Mezcla y combina
  | "flash_sale"        // Venta flash
  | "loyalty_vip"       // Descuento VIP/Lealtad
  | "welcome"           // Primera compra
  | "seasonal"          // Promoción estacional
  | "free_shipping"     // Envío gratis
  | "clearance";        // Liquidación

// Template: Compra X Lleva Y (3x2, 2x1)
export interface BuyXGetYConfig {
  buy_quantity: number;
  pay_quantity: number;
  free_quantity: number;
  applicable_categories?: string[];
  applicable_products?: string[];
  min_items?: number;
  min_quantity_per_product?: number;
}

// Template: Descuento por Volumen/Escalonado
export interface TieredDiscountTier {
  min_qty: number;
  max_qty: number | null;
  discount: number;
  discount_type: "percentage" | "fixed";
}

export interface TieredVolumeConfig {
  tiers: TieredDiscountTier[];
  applicable_categories?: string[];
  applicable_products?: string[];
}

// Template: Paquete/Bundle
export interface BundleProduct {
  product_id: string;
  product_name?: string;
  quantity: number;
}

export interface BundleConfig {
  required_products: BundleProduct[];
  all_required: boolean;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_items?: number;
}

// Template: BOGO (Buy One Get One)
export interface BOGOConfig {
  bogo_type: "free" | "percentage" | "fixed";
  buy_quantity: number;
  get_quantity: number;
  get_discount: number; // 100 para gratis, 50 para 50% off, etc.
  applicable_categories?: string[];
  applicable_products?: string[];
  applicable_brands?: string[];
  min_quantity_per_product?: number;
}

// Template: Descuento por Monto Mínimo
export interface SpendThresholdTier {
  min_spend: number;
  discount: number;
  discount_type: "percentage" | "fixed";
}

export interface SpendThresholdConfig {
  progressive: boolean;
  tiers?: SpendThresholdTier[];
  threshold?: number;
  reward?: number;
  discount_type?: "percentage" | "fixed";
}

// Template: Mix & Match
export interface MixAndMatchConfig {
  required_quantity: number;
  from_categories: string[];
  from_products?: string[];
  mix_allowed: boolean;
  discount_type: "percentage" | "fixed";
  discount_value: number;
}

// Template: Venta Flash
export interface FlashSaleConfig {
  duration_hours: number;
  urgency_level: "low" | "medium" | "high";
  usage_limit: number;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  applicable_to_all?: boolean;
  applicable_categories?: string[];
}

// Template: Lealtad/VIP
export interface LoyaltyVIPConfig {
  tier: "bronze" | "silver" | "gold" | "platinum" | "vip";
  exclusive: boolean;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  customer_type?: string;
  min_purchase_amount?: number;
}

// Template: Bienvenida (Primera Compra)
export interface WelcomeConfig {
  new_customer_only: boolean;
  first_purchase_only: boolean;
  usage_limit_per_customer: 1;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_purchase_amount?: number;
}

// Template: Estacional
export interface SeasonalConfig {
  event: string; // "black_friday", "cyber_monday", "navidad", etc.
  year: number;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_purchase_amount?: number;
  exclude_sale_items: boolean;
  applicable_to_all?: boolean;
}

// Template: Envío Gratis
export interface FreeShippingConfig {
  min_purchase_amount: number;
  shipping_discount: 100; // Siempre 100% de descuento en envío
  applies_to_shipping: true;
  regions?: string[];
}

// Template: Liquidación
export interface ClearanceConfig {
  discount_type: "percentage" | "fixed";
  discount_value: number;
  final_sale: boolean;
  no_returns: boolean;
  stock_clearance: boolean;
  applicable_tags: string[];
  applicable_categories?: string[];
}

// Estructura base para applicable_to
export interface ApplicableToItem {
  type: "category" | "product" | "brand" | "tag" | "all_products";
  value: string;
}

// Estructura completa del JSON de descuento
export interface DiscountJSON {
  name: string;
  description?: string;
  discount_type: "percentage" | "fixed" | "bogo";
  discount_value: number;
  currency?: string;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  status?: "active" | "inactive";
  min_purchase_amount?: number;
  usage_limit?: number;
  usage_limit_per_customer?: number;
  applicable_to?: ApplicableToItem[];
  conditions?: {
    min_items?: number;
    min_quantity_per_product?: number;
    customer_type?: string;
    first_purchase_only?: boolean;
    exclude_sale_items?: boolean;
  };
  customFields?: {
    promotion_type: DiscountTemplateType;
    [key: string]: unknown; // Campos específicos de cada template
  };
}

// Metadata de cada template para la UI
export interface DiscountTemplate {
  id: DiscountTemplateType;
  name: string;
  description: string;
  icon: string; // Nombre del icono de lucide-react
  color: string; // Color hex para el gradiente
  examples: string[];
  useCases: string[];
  complexity: "simple" | "medium" | "complex";
  popular?: boolean;
}

// Catálogo completo de templates
export const DISCOUNT_TEMPLATES: DiscountTemplate[] = [
  {
    id: "buy_x_get_y",
    name: "Compra X Lleva Y",
    description: "Promociones tipo 3x2, 2x1, Compra 2 Lleva 1 Gratis",
    icon: "Gift",
    color: "#FF6B6B",
    examples: ["3x2", "2x1", "Compra 3 Paga 2"],
    useCases: ["Liquidar stock", "Incrementar cantidad de venta", "Promociones estacionales"],
    complexity: "simple",
    popular: true,
  },
  {
    id: "tiered_volume",
    name: "Descuento por Volumen",
    description: "Descuentos progresivos: más compras, más descuento",
    icon: "TrendingUp",
    color: "#4ECDC4",
    examples: ["5-9 unidades: 10%", "10-19: 20%", "20+: 30%"],
    useCases: ["Mayoristas", "Compras al por mayor", "B2B"],
    complexity: "medium",
    popular: true,
  },
  {
    id: "bundle",
    name: "Paquetes/Bundle",
    description: "Descuento por comprar productos específicos juntos",
    icon: "Package",
    color: "#95E1D3",
    examples: ["Laptop + Mouse: 15% off", "Setup Gaming Completo: $200 off"],
    useCases: ["Cross-selling", "Productos complementarios", "Aumentar ticket promedio"],
    complexity: "medium",
  },
  {
    id: "bogo",
    name: "BOGO (Buy One Get One)",
    description: "Compra uno y lleva otro gratis o con descuento",
    icon: "ShoppingBag",
    color: "#F38181",
    examples: ["Compra 1 Lleva 1 Gratis", "Segundo al 50%"],
    useCases: ["Duplicar ventas", "Productos de moda", "Promociones atractivas"],
    complexity: "simple",
    popular: true,
  },
  {
    id: "spend_threshold",
    name: "Gasta y Ahorra",
    description: "Descuento al alcanzar un monto mínimo de compra",
    icon: "DollarSign",
    color: "#AA96DA",
    examples: ["Gasta $100, obtén $20 off", "Descuentos progresivos por monto"],
    useCases: ["Incrementar ticket promedio", "Incentivar compras mayores"],
    complexity: "simple",
  },
  {
    id: "mix_and_match",
    name: "Mix & Match",
    description: "Elige varios productos de una categoría y obtén descuento",
    icon: "Layers",
    color: "#FCBAD3",
    examples: ["Elige 3 snacks: 20% off", "Cualquier 5 productos de belleza"],
    useCases: ["Variedad de productos", "Categorías grandes", "Libertad de elección"],
    complexity: "medium",
  },
  {
    id: "flash_sale",
    name: "Venta Flash",
    description: "Descuento por tiempo limitado con urgencia",
    icon: "Zap",
    color: "#FF9A3C",
    examples: ["24 horas: 40% off", "Venta relámpago"],
    useCases: ["Crear urgencia", "Liquidar stock rápido", "Eventos especiales"],
    complexity: "simple",
    popular: true,
  },
  {
    id: "loyalty_vip",
    name: "Descuento VIP/Lealtad",
    description: "Descuentos exclusivos para clientes premium",
    icon: "Crown",
    color: "#FFD700",
    examples: ["VIP: 25% off", "Miembros Gold: 30% off"],
    useCases: ["Fidelización", "Clientes premium", "Programas de lealtad"],
    complexity: "simple",
  },
  {
    id: "welcome",
    name: "Bienvenida",
    description: "Descuento para nuevos clientes en su primera compra",
    icon: "UserPlus",
    color: "#6BCB77",
    examples: ["Primera compra: 15% off", "Bienvenido: $10 off"],
    useCases: ["Adquisición de clientes", "Primera impresión", "Conversión"],
    complexity: "simple",
  },
  {
    id: "seasonal",
    name: "Estacional/Festivo",
    description: "Promociones para eventos especiales y fechas festivas",
    icon: "Calendar",
    color: "#C70039",
    examples: ["Black Friday: 30%", "Cyber Monday", "Navidad"],
    useCases: ["Fechas comerciales", "Eventos anuales", "Campañas masivas"],
    complexity: "simple",
    popular: true,
  },
  {
    id: "free_shipping",
    name: "Envío Gratis",
    description: "Envío sin costo al alcanzar monto mínimo",
    icon: "Truck",
    color: "#3498DB",
    examples: ["Envío gratis en compras +$75"],
    useCases: ["Reducir carritos abandonados", "Incentivar compra", "Competir con marketplace"],
    complexity: "simple",
  },
  {
    id: "clearance",
    name: "Liquidación",
    description: "Descuentos masivos para limpiar inventario",
    icon: "Percent",
    color: "#E74C3C",
    examples: ["Última oportunidad: 70% off", "Liquidación final"],
    useCases: ["Limpiar stock", "Productos descontinuados", "Fin de temporada"],
    complexity: "simple",
  },
];
