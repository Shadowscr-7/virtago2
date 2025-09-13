export interface OrderItem {
  id: string;
  productName: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
  supplierId: string;
  supplierName: string;
  productImage?: string;
}

export interface OrderCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
}

export interface OrderPayment {
  type: "CASH_ON_DELIVERY" | "CREDIT_CARD" | "DEBIT_CARD" | "PAYPAL" | "BANK_TRANSFER";
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  transactionId?: string;
}

export interface OrderShipping {
  method: string;
  fee: number;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  orderDate: string;
  customer: OrderCustomer;
  items: OrderItem[];
  payment: OrderPayment;
  shipping: OrderShipping;
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax?: number;
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersBySupplier {
  [supplierId: string]: {
    supplierName: string;
    items: OrderItem[];
    subtotal: number;
  };
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface OrderFilters {
  status?: OrderStatus | "ALL";
  dateRange?: {
    start: string;
    end: string;
  };
  supplierId?: string;
  customerId?: string;
  paymentMethod?: string;
  search?: string;
}

// Mock data types for development
export interface MockOrderData {
  orders: Order[];
  stats: OrderStats;
}

// Utility types for order management
export type OrderUpdateFields = Partial<Pick<Order, 'status' | 'notes' | 'shipping'>>;
export type OrderCreateFields = Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>;
