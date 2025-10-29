"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "cliente" | "distribuidor" | "client" | "distributor" | "admin"; // ✅ Soporte para español e inglés
  userType?: "client" | "distributor"; // Campo adicional del backend
  avatar?: string;
  company?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  joinDate: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: Array<{
    id: string;
    name: string;
    brand: string;
    supplier: string;
    image: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  taxes: number;
  shipping: number;
  total: number;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  trackingNumber?: string;
}

export interface FavoriteItem {
  id: string;
  productId: string;
  name: string;
  brand: string;
  supplier: string;
  image: string;
  price: number;
  originalPrice?: number;
  dateAdded: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  orders: Order[];
  favorites: FavoriteItem[];

  // Auth actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;

  // Orders actions
  addOrder: (order: Omit<Order, "id" | "orderNumber" | "date">) => void;
  getOrderById: (orderId: string) => Order | undefined;

  // Favorites actions
  addToFavorites: (item: Omit<FavoriteItem, "id" | "dateAdded">) => void;
  removeFromFavorites: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
}

// Test users data
const testUsers: User[] = [
  {
    id: "client-001",
    email: "cliente@virtago.com",
    name: "María González",
    role: "cliente",
    avatar: "👩‍💼",
    company: "TechSolutions SA",
    phone: "+54 11 1234-5678",
    address: "Av. Corrientes 1234",
    city: "Buenos Aires",
    state: "Buenos Aires",
    country: "Argentina",
    zipCode: "1043",
    joinDate: "2024-01-15",
    lastLogin: new Date().toISOString(),
    isActive: true,
  },
  {
    id: "dist-001",
    email: "distribuidor@virtago.com",
    name: "Carlos Rodríguez",
    role: "distribuidor",
    avatar: "👨‍💼",
    company: "ElectroMax Distribuidores",
    phone: "+54 11 9876-5432",
    address: "Av. Libertador 5678",
    city: "Buenos Aires",
    state: "Buenos Aires",
    country: "Argentina",
    zipCode: "1425",
    joinDate: "2023-06-20",
    lastLogin: new Date().toISOString(),
    isActive: true,
  },
];

// Sample orders for the client
const sampleOrders: Order[] = [
  {
    id: "order-001",
    userId: "client-001",
    orderNumber: "VTG-2024-001",
    date: "2024-09-01T10:30:00Z",
    status: "delivered",
    items: [
      {
        id: "1",
        name: "iPhone 15 Pro",
        brand: "Apple",
        supplier: "TechDistributor",
        image: "/api/placeholder/300/300",
        price: 1299999,
        quantity: 1,
      },
      {
        id: "2",
        name: "AirPods Pro",
        brand: "Apple",
        supplier: "TechDistributor",
        image: "/api/placeholder/300/300",
        price: 249999,
        quantity: 2,
      },
    ],
    subtotal: 1799997,
    taxes: 377999,
    shipping: 0,
    total: 2177996,
    shippingAddress: {
      fullName: "María González",
      address: "Av. Corrientes 1234",
      city: "Buenos Aires",
      state: "Buenos Aires",
      zipCode: "1043",
      country: "Argentina",
    },
    paymentMethod: "Pago Online",
    trackingNumber: "VTG123456789",
  },
  {
    id: "order-002",
    userId: "client-001",
    orderNumber: "VTG-2024-002",
    date: "2024-09-10T14:15:00Z",
    status: "processing",
    items: [
      {
        id: "3",
        name: 'MacBook Pro 16"',
        brand: "Apple",
        supplier: "MacroTech",
        image: "/api/placeholder/300/300",
        price: 2499999,
        quantity: 1,
      },
    ],
    subtotal: 2499999,
    taxes: 524999,
    shipping: 0,
    total: 3024998,
    shippingAddress: {
      fullName: "María González",
      address: "Av. Corrientes 1234",
      city: "Buenos Aires",
      state: "Buenos Aires",
      zipCode: "1043",
      country: "Argentina",
    },
    paymentMethod: "Pago en Entrega",
    trackingNumber: "VTG987654321",
  },
];

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      orders: [],
      favorites: [],

      login: async (email: string, password: string) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Check test users (password is always "123456" for demo)
        const user = testUsers.find((u) => u.email === email);
        
        console.log('🔍 [AUTH STORE - LOGIN] Email buscado:', email);
        console.log('🔍 [AUTH STORE - LOGIN] Usuario encontrado:', user);
        console.log('🔍 [AUTH STORE - LOGIN] Rol del usuario:', user?.role);
        
        if (user && password === "123456") {
          const loggedInUser = { ...user, lastLogin: new Date().toISOString() };
          console.log('✅ [AUTH STORE - LOGIN] Usuario logueado:', loggedInUser);
          console.log('✅ [AUTH STORE - LOGIN] Rol guardado:', loggedInUser.role);
          
          set({
            user: loggedInUser,
            isAuthenticated: true,
            orders: user.role === "cliente" ? sampleOrders : [],
          });
          return true;
        }
        
        console.log('❌ [AUTH STORE - LOGIN] Login fallido');
        return false;
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          orders: [],
          favorites: [],
        });
      },

      updateProfile: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },

      addOrder: (orderData) => {
        const newOrder: Order = {
          ...orderData,
          id: `order-${Date.now()}`,
          orderNumber: `VTG-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
          date: new Date().toISOString(),
        };
        set((state) => ({ orders: [newOrder, ...state.orders] }));
      },

      getOrderById: (orderId) => {
        return get().orders.find((order) => order.id === orderId);
      },

      addToFavorites: (item) => {
        const favorite: FavoriteItem = {
          ...item,
          id: `fav-${Date.now()}`,
          dateAdded: new Date().toISOString(),
        };
        set((state) => ({
          favorites: [
            favorite,
            ...state.favorites.filter((f) => f.productId !== item.productId),
          ],
        }));
      },

      removeFromFavorites: (productId) => {
        set((state) => ({
          favorites: state.favorites.filter((f) => f.productId !== productId),
        }));
      },

      isFavorite: (productId) => {
        return get().favorites.some((f) => f.productId === productId);
      },
    }),
    {
      name: "virtago-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        orders: state.orders,
        favorites: state.favorites,
      }),
    },
  ),
);
