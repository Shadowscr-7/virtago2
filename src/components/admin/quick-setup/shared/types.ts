// Tipos compartidos para el wizard de configuración rápida

export interface ClientData {
  code: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  clientType: 'individual' | 'company';
  taxId?: string;
  creditLimit: number;
  paymentTerms: number;
  [key: string]: unknown;
}

export interface ProductData {
  code: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
}

export interface MatchedProduct extends ProductData {
  original: ProductData;
  subcategory?: string;
  aiSuggestions: {
    category: { name: string; confidence: number };
    brand: { name: string; confidence: number };
    subcategory: { name: string; confidence: number };
    confidence: number;
  };
}

export interface Category {
  id: number;
  name: string;
  subcategories: string[];
}

export interface PriceList {
  id: string;
  name: string;
  description: string;
  discountPercentage: number;
  products: PriceListProduct[];
}

export interface PriceListProduct {
  productCode: string;
  productName: string;
  basePrice: number;
  listPrice: number;
  discountPercentage: number;
}

export interface PriceData {
  // Formato wizard
  productId?: string;
  productName?: string;
  basePrice?: number;
  cost?: number;
  margin?: number;
  currency?: string;
  
  // Formato backend API
  name?: string;
  price_id?: string;
  price_list_id?: string;
  product_id?: string;
  amount?: number;
  customFields?: Record<string, unknown>;
}

export interface DiscountData {
  discountId: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed_amount' | 'tiered_percentage' | 'progressive_percentage';
  discountValue: number;
  currency: string;
  validFrom: string;
  validTo?: string;
  status: 'active' | 'inactive' | 'draft';
  customerType: 'all' | 'retail' | 'wholesale' | 'vip';
  channel: 'online' | 'offline' | 'omnichannel' | 'b2b' | 'all';
  category: string;
  maxDiscountAmount?: number;
  minPurchaseAmount?: number;
  usageLimit?: number;
  usageLimitPerCustomer?: number;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
  };
}

export interface StepProps {
  onNext: (data?: unknown) => void;
  onBack: () => void;
  themeColors: ThemeColors;
  stepData?: unknown;
}

export type UploadMethod = "file" | "json";

export interface UploadResult<T> {
  data: T[];
  success: boolean;
  error?: string;
}