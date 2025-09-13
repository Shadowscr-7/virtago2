"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Search,
  AlertCircle,
} from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { AdminLayout } from "@/components/admin/admin-layout";
import { ThemedSelect } from "@/components/ui/themed-select";

// Schema de validación
const orderSchema = z.object({
  customerId: z.string().min(1, "Debe seleccionar un cliente"),
  items: z.array(z.object({
    productId: z.string().min(1, "Producto requerido"),
    quantity: z.number().min(1, "Cantidad debe ser mayor a 0"),
    price: z.number().min(0, "Precio debe ser mayor o igual a 0"),
  })).min(1, "Debe agregar al menos un producto"),
  paymentMethod: z.enum(["CASH_ON_DELIVERY", "CREDIT_CARD", "DEBIT_CARD", "PAYPAL", "BANK_TRANSFER"]),
  shippingMethod: z.string().min(1, "Método de envío requerido"),
  notes: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  supplierId: string;
  supplierName: string;
}

// Mock data para productos y clientes
const mockCustomers = [
  { id: "1", name: "Julio Gomez", email: "julio@email.com" },
  { id: "2", name: "María García", email: "maria@email.com" },
  { id: "3", name: "Carlos Rodriguez", email: "carlos@email.com" },
];

const mockProducts = [
  { id: "1", name: "Smartphone Samsung Galaxy S24", price: 899, supplierId: "sup1", supplierName: "Tech Solutions" },
  { id: "2", name: "Auriculares Sony WH-1000XM5", price: 349, supplierId: "sup2", supplierName: "Audio World" },
  { id: "3", name: "Laptop Dell XPS 13", price: 1299, supplierId: "sup1", supplierName: "Tech Solutions" },
  { id: "4", name: "Monitor LG 27\"", price: 289, supplierId: "sup3", supplierName: "Display Pro" },
];

export default function NewOrderPage() {
  const { themeColors } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [productSearch, setProductSearch] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      paymentMethod: "CASH_ON_DELIVERY",
      shippingMethod: "standard",
      items: [],
    },
  });

  const addOrderItem = (product: typeof mockProducts[0]) => {
    const existingItem = orderItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      setOrderItems(orderItems.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const newItem: OrderItem = {
        id: `item-${Date.now()}`,
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.price,
        supplierId: product.supplierId,
        supplierName: product.supplierName,
      };
      setOrderItems([...orderItems, newItem]);
    }
  };

  const removeOrderItem = (itemId: string) => {
    setOrderItems(orderItems.filter(item => item.id !== itemId));
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeOrderItem(itemId);
      return;
    }
    setOrderItems(orderItems.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ));
  };

  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = 14;
  const total = subtotal + shippingFee;

  // Agrupar items por proveedor
  const itemsBySupplier = orderItems.reduce((acc, item) => {
    if (!acc[item.supplierId]) {
      acc[item.supplierId] = {
        supplierName: item.supplierName,
        items: [],
        subtotal: 0,
      };
    }
    acc[item.supplierId].items.push(item);
    acc[item.supplierId].subtotal += item.price * item.quantity;
    return acc;
  }, {} as Record<string, { supplierName: string; items: OrderItem[]; subtotal: number }>);

  const onSubmit = async (data: OrderFormData) => {
    setLoading(true);
    try {
      // Simular creación de orden
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const orderData = {
        ...data,
        items: orderItems,
        subtotal,
        shippingFee,
        total,
      };
      
      console.log("Nueva orden creada:", orderData);
      router.push("/admin/ordenes");
    } catch (error) {
      console.error("Error al crear orden:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => router.push("/admin/ordenes")}
                className="p-2 rounded-xl transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: `${themeColors.surface}80`,
                  color: themeColors.text.primary,
                }}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: themeColors.text.primary }}>
                  Nueva Orden
                </h1>
                <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                  Crear una nueva orden para un cliente
                </p>
              </div>
            </div>
            
            <motion.button
              type="submit"
              disabled={loading || orderItems.length === 0}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg disabled:opacity-50"
              style={{
                background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
              }}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {loading ? "Creando..." : "Crear Orden"}
            </motion.button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Información Principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Información del Cliente */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="backdrop-blur-xl p-6 rounded-2xl border"
                style={{
                  backgroundColor: `${themeColors.surface}70`,
                  borderColor: `${themeColors.primary}30`,
                }}
              >
                <h3 className="text-lg font-bold mb-4" style={{ color: themeColors.text.primary }}>
                  Información del Cliente
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>
                      Cliente *
                    </label>
                    <Controller
                      name="customerId"
                      control={control}
                      render={({ field }) => (
                        <ThemedSelect
                          value={field.value || ""}
                          onChange={field.onChange}
                          options={mockCustomers.map(customer => ({
                            value: customer.id,
                            label: `${customer.name} (${customer.email})`,
                          }))}
                          placeholder="Seleccionar cliente"
                        />
                      )}
                    />
                    {errors.customerId && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.customerId.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>
                      Método de Pago *
                    </label>
                    <Controller
                      name="paymentMethod"
                      control={control}
                      render={({ field }) => (
                        <ThemedSelect
                          value={field.value}
                          onChange={field.onChange}
                          options={[
                            { value: "CASH_ON_DELIVERY", label: "Pago contra entrega" },
                            { value: "CREDIT_CARD", label: "Tarjeta de crédito" },
                            { value: "DEBIT_CARD", label: "Tarjeta de débito" },
                            { value: "PAYPAL", label: "PayPal" },
                            { value: "BANK_TRANSFER", label: "Transferencia bancaria" },
                          ]}
                        />
                      )}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Buscar y Agregar Productos */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="backdrop-blur-xl p-6 rounded-2xl border"
                style={{
                  backgroundColor: `${themeColors.surface}70`,
                  borderColor: `${themeColors.primary}30`,
                }}
              >
                <h3 className="text-lg font-bold mb-4" style={{ color: themeColors.text.primary }}>
                  Agregar Productos
                </h3>
                
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: themeColors.text.secondary }} />
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: `${themeColors.surface}50`,
                      borderColor: `${themeColors.primary}30`,
                      color: themeColors.text.primary,
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="p-3 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                      style={{
                        backgroundColor: `${themeColors.surface}50`,
                        borderColor: `${themeColors.primary}20`,
                      }}
                      onClick={() => addOrderItem(product)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm" style={{ color: themeColors.text.primary }}>
                            {product.name}
                          </p>
                          <p className="text-xs" style={{ color: themeColors.text.secondary }}>
                            {product.supplierName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold" style={{ color: themeColors.text.primary }}>
                            ${product.price}
                          </p>
                          <button
                            type="button"
                            className="p-1 rounded-lg mt-1"
                            style={{ backgroundColor: `${themeColors.primary}20`, color: themeColors.primary }}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Items de la Orden por Proveedor */}
              {Object.entries(itemsBySupplier).map(([supplierId, supplierData], index) => (
                <motion.div
                  key={supplierId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (0.1 * index) }}
                  className="backdrop-blur-xl rounded-2xl border overflow-hidden"
                  style={{
                    backgroundColor: `${themeColors.surface}70`,
                    borderColor: `${themeColors.primary}30`,
                  }}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold" style={{ color: themeColors.text.primary }}>
                        {supplierData.supplierName}
                      </h3>
                      <div className="text-sm" style={{ color: themeColors.text.secondary }}>
                        {supplierData.items.length} item(s)
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {supplierData.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 rounded-xl"
                          style={{ backgroundColor: `${themeColors.primary}10` }}
                        >
                          <div className="flex-1">
                            <p className="font-medium" style={{ color: themeColors.text.primary }}>
                              {item.productName}
                            </p>
                            <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                              ${item.price} c/u
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: `${themeColors.surface}80` }}
                              >
                                -
                              </button>
                              <span className="font-medium min-w-[2rem] text-center" style={{ color: themeColors.text.primary }}>
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: `${themeColors.surface}80` }}
                              >
                                +
                              </button>
                            </div>
                            <p className="font-bold min-w-[4rem] text-right" style={{ color: themeColors.text.primary }}>
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                            <button
                              type="button"
                              onClick={() => removeOrderItem(item.id)}
                              className="p-2 rounded-lg text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center mt-4 pt-4 border-t" style={{ borderColor: `${themeColors.primary}20` }}>
                      <span className="font-medium" style={{ color: themeColors.text.primary }}>
                        Subtotal {supplierData.supplierName}:
                      </span>
                      <span className="text-lg font-bold" style={{ color: themeColors.text.primary }}>
                        ${supplierData.subtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Sidebar - Resumen */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="backdrop-blur-xl p-6 rounded-2xl border"
                style={{
                  backgroundColor: `${themeColors.surface}70`,
                  borderColor: `${themeColors.primary}30`,
                }}
              >
                <h3 className="text-lg font-bold mb-4" style={{ color: themeColors.text.primary }}>
                  Resumen de Orden
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span style={{ color: themeColors.text.secondary }}>Subtotal:</span>
                    <span style={{ color: themeColors.text.primary }}>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: themeColors.text.secondary }}>Envío:</span>
                    <span style={{ color: themeColors.text.primary }}>${shippingFee.toFixed(2)}</span>
                  </div>
                  <hr style={{ borderColor: `${themeColors.primary}20` }} />
                  <div className="flex justify-between text-lg font-bold">
                    <span style={{ color: themeColors.text.primary }}>Total:</span>
                    <span style={{ color: themeColors.text.primary }}>${total.toFixed(2)}</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="backdrop-blur-xl p-6 rounded-2xl border"
                style={{
                  backgroundColor: `${themeColors.surface}70`,
                  borderColor: `${themeColors.primary}30`,
                }}
              >
                <h3 className="text-lg font-bold mb-4" style={{ color: themeColors.text.primary }}>
                  Notas (Opcional)
                </h3>
                
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      rows={4}
                      placeholder="Agregar notas adicionales para esta orden..."
                      className="w-full px-4 py-3 rounded-xl border resize-none transition-all duration-200 focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: `${themeColors.surface}50`,
                        borderColor: `${themeColors.primary}30`,
                        color: themeColors.text.primary,
                      }}
                    />
                  )}
                />
              </motion.div>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
