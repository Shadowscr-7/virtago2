"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Trash2,
  Package,
  User,
  DollarSign,
  MapPin,
  Truck,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Phone,
  Mail,
  Edit,
} from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { AdminLayout } from "@/components/admin/admin-layout";

interface OrderItem {
  id: string;
  productName: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
  supplierId: string;
  supplierName: string;
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  orderDate: string;
  estimatedDelivery?: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  paymentMethod: {
    type: string;
    status: string;
  };
  shipping: {
    method: string;
    fee: number;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
}

// Mock data para una orden
const mockOrderDetails: OrderDetails = {
  id: "1",
  orderNumber: "ORD-2025-001",
  status: "PENDING",
  orderDate: "15 Aug 2025",
  estimatedDelivery: "20 Aug 2025",
  customer: {
    name: "Julio Gomez",
    email: "julio@email.com",
    phone: "+598 99 123 456",
    address: "Montevideo, Uruguay",
  },
  paymentMethod: {
    type: "Cash On Delivery",
    status: "Pending",
  },
  shipping: {
    method: "Standard Delivery",
    fee: 14,
  },
  items: [
    {
      id: "1",
      productName: "Smartphone Samsung Galaxy S24",
      color: "Negro",
      size: "128GB",
      quantity: 1,
      price: 899,
      supplierId: "sup1",
      supplierName: "Tech Solutions",
    },
    {
      id: "2",
      productName: "Auriculares Sony WH-1000XM5",
      color: "Plata",
      size: "Único",
      quantity: 1,
      price: 349,
      supplierId: "sup2",
      supplierName: "Audio World",
    },
    {
      id: "3",
      productName: "Cargador Inalámbrico Apple",
      color: "Blanco",
      size: "15W",
      quantity: 2,
      price: 79,
      supplierId: "sup1",
      supplierName: "Tech Solutions",
    },
  ],
  subtotal: 1406,
  discount: -140,
  shippingFee: 14,
  total: 1280,
};

export default function OrderDetailsPage() {
  const { themeColors } = useTheme();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      setLoading(true);
      // Simular carga
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOrder(mockOrderDetails);
      setLoading(false);
    };

    loadOrder();
  }, [orderId]);

  const getStatusIcon = (status: OrderDetails["status"]) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-5 h-5" />;
      case "PROCESSING":
        return <Package className="w-5 h-5" />;
      case "SHIPPED":
        return <Truck className="w-5 h-5" />;
      case "DELIVERED":
        return <CheckCircle className="w-5 h-5" />;
      case "CANCELLED":
        return <XCircle className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: OrderDetails["status"]) => {
    switch (status) {
      case "PENDING":
        return "#f59e0b";
      case "PROCESSING":
        return "#3b82f6";
      case "SHIPPED":
        return "#8b5cf6";
      case "DELIVERED":
        return "#10b981";
      case "CANCELLED":
        return "#ef4444";
    }
  };

  const getStatusLabel = (status: OrderDetails["status"]) => {
    switch (status) {
      case "PENDING":
        return "Pendiente";
      case "PROCESSING":
        return "Procesando";
      case "SHIPPED":
        return "Enviado";
      case "DELIVERED":
        return "Entregado";
      case "CANCELLED":
        return "Cancelado";
    }
  };

  // Agrupar items por proveedor
  const itemsBySupplier = order?.items.reduce((acc, item) => {
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
  }, {} as Record<string, { supplierName: string; items: OrderItem[]; subtotal: number }>) || {};

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: themeColors.primary }}></div>
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4" style={{ color: themeColors.text.primary }}>
            Orden no encontrada
          </h2>
          <button
            onClick={() => router.push("/admin/ordenes")}
            className="px-4 py-2 rounded-lg"
            style={{
              backgroundColor: themeColors.primary,
              color: "white",
            }}
          >
            Volver a Órdenes
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <button
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
                Detalles de Orden
              </h1>
              <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                Dashboard → Órdenes → Detalles de orden
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
              style={{
                backgroundColor: `${themeColors.surface}80`,
                color: themeColors.text.primary,
                border: `1px solid ${themeColors.primary}30`,
              }}
            >
              <Download className="w-4 h-4" />
              Descargar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
              style={{
                backgroundColor: "#ef444420",
                color: "#ef4444",
                border: "1px solid #ef444430",
              }}
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
              style={{
                backgroundColor: `${themeColors.primary}20`,
                color: themeColors.primary,
                border: `1px solid ${themeColors.primary}30`,
              }}
            >
              <Edit className="w-4 h-4" />
              Cargar
            </motion.button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items por Proveedor */}
            {Object.entries(itemsBySupplier).map(([supplierId, supplierData], index) => (
              <motion.div
                key={supplierId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
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
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ backgroundColor: `${themeColors.primary}10` }}>
                          <th className="text-left p-3 text-sm font-semibold" style={{ color: themeColors.text.primary }}>
                            Producto
                          </th>
                          <th className="text-left p-3 text-sm font-semibold" style={{ color: themeColors.text.primary }}>
                            Color
                          </th>
                          <th className="text-left p-3 text-sm font-semibold" style={{ color: themeColors.text.primary }}>
                            Tamaño
                          </th>
                          <th className="text-left p-3 text-sm font-semibold" style={{ color: themeColors.text.primary }}>
                            Cantidad
                          </th>
                          <th className="text-left p-3 text-sm font-semibold" style={{ color: themeColors.text.primary }}>
                            Precio
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {supplierData.items.map((item) => (
                          <tr key={item.id} className="border-t" style={{ borderColor: `${themeColors.primary}20` }}>
                            <td className="p-3">
                              <p className="font-medium" style={{ color: themeColors.text.primary }}>
                                {item.productName}
                              </p>
                            </td>
                            <td className="p-3" style={{ color: themeColors.text.primary }}>
                              {item.color}
                            </td>
                            <td className="p-3" style={{ color: themeColors.text.primary }}>
                              {item.size}
                            </td>
                            <td className="p-3" style={{ color: themeColors.text.primary }}>
                              {item.quantity}
                            </td>
                            <td className="p-3 font-medium" style={{ color: themeColors.text.primary }}>
                              ${item.price}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4 pt-4 border-t" style={{ borderColor: `${themeColors.primary}20` }}>
                    <span className="font-medium" style={{ color: themeColors.text.primary }}>
                      Subtotal {supplierData.supplierName}:
                    </span>
                    <span className="text-lg font-bold" style={{ color: themeColors.text.primary }}>
                      ${supplierData.subtotal}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Order Summary */}
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
                  <span style={{ color: themeColors.text.primary }}>${order.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: themeColors.text.secondary }}>Costo de Envío:</span>
                  <span style={{ color: themeColors.text.primary }}>${order.shippingFee}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: themeColors.text.secondary }}>Descuento:</span>
                  <span style={{ color: themeColors.text.primary }}>${order.discount}</span>
                </div>
                <hr style={{ borderColor: `${themeColors.primary}20` }} />
                <div className="flex justify-between text-lg font-bold">
                  <span style={{ color: themeColors.text.primary }}>Total:</span>
                  <span style={{ color: themeColors.text.primary }}>${order.total}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Details */}
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
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${themeColors.primary}20` }}
                >
                  <User className="w-5 h-5" style={{ color: themeColors.primary }} />
                </div>
                <h3 className="text-lg font-bold" style={{ color: themeColors.text.primary }}>
                  Detalles del Cliente
                </h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm" style={{ color: themeColors.text.secondary }}>Nombre:</p>
                  <p className="font-medium" style={{ color: themeColors.text.primary }}>
                    {order.customer.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: themeColors.text.secondary }}>Teléfono:</p>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" style={{ color: themeColors.text.secondary }} />
                    <p style={{ color: themeColors.text.primary }}>{order.customer.phone}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm" style={{ color: themeColors.text.secondary }}>Email:</p>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" style={{ color: themeColors.text.secondary }} />
                    <p style={{ color: themeColors.text.primary }}>{order.customer.email}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm" style={{ color: themeColors.text.secondary }}>Dirección:</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" style={{ color: themeColors.text.secondary }} />
                    <p style={{ color: themeColors.text.primary }}>{order.customer.address}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="backdrop-blur-xl p-6 rounded-2xl border"
              style={{
                backgroundColor: `${themeColors.surface}70`,
                borderColor: `${themeColors.primary}30`,
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${themeColors.secondary}20` }}
                >
                  <DollarSign className="w-5 h-5" style={{ color: themeColors.secondary }} />
                </div>
                <h3 className="text-lg font-bold" style={{ color: themeColors.text.primary }}>
                  Método de Pago
                </h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm" style={{ color: themeColors.text.secondary }}>Método:</p>
                  <p className="font-medium" style={{ color: themeColors.text.primary }}>
                    {order.paymentMethod.type}
                  </p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: themeColors.text.secondary }}>Estado:</p>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    ></div>
                    <p style={{ color: themeColors.text.primary }}>{order.paymentMethod.status}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm" style={{ color: themeColors.text.secondary }}>Costo de Envío:</p>
                  <p className="font-medium" style={{ color: themeColors.text.primary }}>
                    ${order.shipping.fee}
                  </p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: themeColors.text.secondary }}>Fecha de Orden:</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" style={{ color: themeColors.text.secondary }} />
                    <p style={{ color: themeColors.text.primary }}>{order.orderDate}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Order Status */}
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
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${getStatusColor(order.status)}20` }}
                >
                  <div style={{ color: getStatusColor(order.status) }}>
                    {getStatusIcon(order.status)}
                  </div>
                </div>
                <h3 className="text-lg font-bold" style={{ color: themeColors.text.primary }}>
                  Estado de Orden
                </h3>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold mb-2" style={{ color: getStatusColor(order.status) }}>
                  {getStatusLabel(order.status)}
                </p>
                {order.estimatedDelivery && (
                  <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                    Entrega estimada: {order.estimatedDelivery}
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
