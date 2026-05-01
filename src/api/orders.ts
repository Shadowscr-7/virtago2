import http from './http-client';

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface OrderItem {
  pid: string;
  name: string;
  sku: string;
  quantity: number;
  originalPrice: number;
  discountPercentage: number;
  finalPrice: number;
  total: number;
  savings: number;
  shop?: string;
  distributorCode?: string;
  imageUrl?: string;
  appliedDiscounts?: unknown[];
  addedByDistributor?: boolean;
}

export interface ChangelogEntry {
  id: string;
  action: 'update_item' | 'remove_item' | 'add_item';
  itemIndex: number;
  itemName: string;
  field: string;
  previousValue: unknown;
  newValue: unknown;
  changedBy: string;
  changedByEmail: string;
  timestamp: string;
  reason?: string;
}

export interface Order {
  id: string;
  orderNo: string;
  status: string;
  distributorCode: string;
  userId: string | null;
  paymentMethod: string;
  paymentId?: string;
  currency?: string;
  conversionRate?: number;
  description?: string;
  observations?: string;
  subTotal: number;
  itemDiscountTotal: number;
  couponDiscount: number;
  coupon?: unknown;
  shipping: number;
  total: number;
  totalItems: number;
  items: OrderItem[];
  user: {
    id?: string;
    email: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    city?: string;
    phone?: string;
    address?: string;
  };
  createdAt: string;
  updatedAt?: string;
  changelog?: ChangelogEntry[];
  lastModifiedByDistributor?: string;
  lastModifiedByEmail?: string;
}

export interface UpdateItemPayload {
  quantity?: number;
  finalPrice?: number;
  discountPercentage?: number;
}

export interface AddItemPayload {
  pid?: string;
  name: string;
  sku?: string;
  quantity: number;
  finalPrice: number;
  discountPercentage?: number;
}

// ─── Funciones de API ─────────────────────────────────────────────────────────

/** Obtiene el detalle de una orden por ID (admin endpoint). */
export async function getOrderById(orderId: string): Promise<Order> {
  const response = await http.get<{ success: boolean; data: Order }>(
    `/admin/orders/${orderId}`
  );
  const body = response.data as { success: boolean; data: Order };
  if (!body.success) throw new Error('No se pudo obtener la orden');
  return body.data;
}

/** Edita un item existente de la orden. Devuelve la orden actualizada. */
export async function updateOrderItem(
  orderId: string,
  itemIndex: number,
  payload: UpdateItemPayload
): Promise<Order> {
  const response = await http.put<{ success: boolean; data: Order }>(
    `/distributor/orders/${orderId}/items/${itemIndex}`,
    payload
  );
  const body = response.data as { success: boolean; data: Order };
  if (!body.success) throw new Error('No se pudo actualizar el item');
  return body.data;
}

/** Elimina un item de la orden. Devuelve la orden actualizada. */
export async function removeOrderItem(
  orderId: string,
  itemIndex: number,
  reason?: string
): Promise<Order> {
  const response = await http.delete<{ success: boolean; data: Order }>(
    `/distributor/orders/${orderId}/items/${itemIndex}`,
    { data: { reason } }
  );
  const body = response.data as { success: boolean; data: Order };
  if (!body.success) throw new Error('No se pudo eliminar el item');
  return body.data;
}

/** Agrega un item nuevo a la orden. Devuelve la orden actualizada. */
export async function addOrderItem(
  orderId: string,
  payload: AddItemPayload
): Promise<Order> {
  const response = await http.post<{ success: boolean; data: Order }>(
    `/distributor/orders/${orderId}/items`,
    payload
  );
  const body = response.data as { success: boolean; data: Order };
  if (!body.success) throw new Error('No se pudo agregar el item');
  return body.data;
}

/** Confirma los cambios y notifica al cliente. Devuelve la orden final. */
export async function confirmOrderChanges(orderId: string): Promise<Order> {
  const response = await http.post<{ success: boolean; data: Order }>(
    `/distributor/orders/${orderId}/confirm-changes`
  );
  const body = response.data as { success: boolean; data: Order };
  if (!body.success) throw new Error('No se pudo confirmar los cambios');
  return body.data;
}

/** Obtiene el changelog de una orden. */
export async function getOrderChangelog(orderId: string): Promise<ChangelogEntry[]> {
  const response = await http.get<{ success: boolean; data: ChangelogEntry[]; total: number }>(
    `/distributor/orders/${orderId}/changelog`
  );
  const body = response.data as { success: boolean; data: ChangelogEntry[] };
  if (!body.success) throw new Error('No se pudo obtener el changelog');
  return body.data;
}
