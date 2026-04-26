"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Toast function will be set from the component
let toastFunction:
  | ((toast: {
      title: string;
      description?: string;
      type: "success" | "error" | "info" | "warning";
    }) => void)
  | null = null;

export const setToastFunction = (
  toast: (toast: {
    title: string;
    description?: string;
    type: "success" | "error" | "info" | "warning";
  }) => void,
) => {
  toastFunction = toast;
};

export interface CartItem {
  id: string;
  productId: string;
  prodVirtaId?: string;
  sku?: string;
  name: string;
  brand: string;
  supplier: string; // distributorCode (e.g., "DIST001")
  supplierId: string;
  image: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  inStock: boolean;
  stockQuantity: number;
  // Unidad de venta
  baseUnit?: string;
  packagingUnit?: string;
  unitsPerPackage?: number;
  purchaseMode?: 'by_unit' | 'by_package' | 'both';
  minOrderQuantity?: number;
  category: string;
  specifications?: Record<string, string>;
}

export interface CartStore {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // Computed values
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemsBySupplier: () => Record<string, CartItem[]>;
  getSupplierTotals: () => Record<string, { items: number; total: number }>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => item.productId === newItem.productId,
          );

          if (existingItemIndex >= 0) {
            // Update quantity if item already exists
            const updatedItems = [...state.items];
            const existingItem = updatedItems[existingItemIndex];
            const newQuantity = Math.min(
              existingItem.quantity + newItem.quantity,
              existingItem.stockQuantity,
            );
            updatedItems[existingItemIndex] = {
              ...existingItem,
              quantity: newQuantity,
            };

            if (toastFunction) {
              toastFunction({
                title: "Producto actualizado",
                description: `Se actualizó la cantidad de ${existingItem.name} en el carrito`,
                type: "success",
              });
            }

            return { items: updatedItems };
          } else {
            // Add new item
            const cartItem: CartItem = {
              ...newItem,
              id: `${newItem.productId}-${Date.now()}`,
            };

            // Validar cantidad inicial según modo de compra
            if (cartItem.purchaseMode === 'by_package' && cartItem.unitsPerPackage && cartItem.unitsPerPackage > 1) {
              cartItem.quantity = Math.max(cartItem.unitsPerPackage, Math.round(cartItem.quantity / cartItem.unitsPerPackage) * cartItem.unitsPerPackage);
            } else if (cartItem.minOrderQuantity && cartItem.quantity < cartItem.minOrderQuantity) {
              cartItem.quantity = cartItem.minOrderQuantity;
            }

            if (toastFunction) {
              toastFunction({
                title: "Producto agregado",
                description: `${newItem.name} se agregó al carrito`,
                type: "success",
              });
            }

            return { items: [...state.items, cartItem] };
          }
        });
      },

      removeItem: (itemId) => {
        const item = get().items.find((item) => item.id === itemId);

        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));

        if (item && toastFunction) {
          toastFunction({
            title: "Producto eliminado",
            description: `${item.name} se eliminó del carrito`,
            type: "info",
          });
        }
      },

      updateQuantity: (itemId, quantity) => {
        const item = get().items.find((item) => item.id === itemId);

        set((state) => {
          if (quantity <= 0) {
            if (item && toastFunction) {
              toastFunction({
                title: "Producto eliminado",
                description: `${item.name} se eliminó del carrito`,
                type: "info",
              });
            }
            return { items: state.items.filter((item) => item.id !== itemId) };
          }

          // Para modo by_package, la cantidad debe ser múltiplo de unitsPerPackage
          const itemToUpdate = state.items.find((i) => i.id === itemId);
          let validatedQuantity = quantity;
          if (itemToUpdate?.purchaseMode === 'by_package' && itemToUpdate.unitsPerPackage && itemToUpdate.unitsPerPackage > 1) {
            validatedQuantity = Math.max(
              itemToUpdate.unitsPerPackage,
              Math.round(quantity / itemToUpdate.unitsPerPackage) * itemToUpdate.unitsPerPackage
            );
          } else if (itemToUpdate?.minOrderQuantity && quantity < itemToUpdate.minOrderQuantity) {
            validatedQuantity = itemToUpdate.minOrderQuantity;
          }

          const updatedItems = state.items.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  quantity: Math.min(validatedQuantity, item.stockQuantity),
                }
              : item,
          );

          if (item && toastFunction) {
            toastFunction({
              title: "Cantidad actualizada",
              description: `Se actualizó la cantidad de ${item.name}`,
              type: "success",
            });
          }

          return { items: updatedItems };
        });
      },

      clearCart: () => {
        set({ items: [] });
        if (toastFunction) {
          toastFunction({
            title: "Carrito vaciado",
            description: "Se eliminaron todos los productos del carrito",
            type: "info",
          });
        }
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        );
      },

      getItemsBySupplier: () => {
        const items = get().items;
        return items.reduce(
          (acc, item) => {
            if (!acc[item.supplier]) {
              acc[item.supplier] = [];
            }
            acc[item.supplier].push(item);
            return acc;
          },
          {} as Record<string, CartItem[]>,
        );
      },

      getSupplierTotals: () => {
        const itemsBySupplier = get().getItemsBySupplier();
        const totals: Record<string, { items: number; total: number }> = {};

        Object.entries(itemsBySupplier).forEach(([supplier, items]) => {
          totals[supplier] = {
            items: items.reduce((sum, item) => sum + item.quantity, 0),
            total: items.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0,
            ),
          };
        });

        return totals;
      },
    }),
    {
      name: "virtago-cart",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
