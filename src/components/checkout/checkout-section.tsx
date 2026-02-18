"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Package2,
  CreditCard,
  Truck,
  MapPin,
  Phone,
  Mail,
  User,
  Building,
  CheckCircle,
  Clock,
  Shield,
  Plus,
  Star,
  Pencil,
  Trash2,
  Home,
} from "lucide-react";
import { useCartStore } from "@/components/cart/cart-store";
import { api, AddressData, CreateAddressData } from "@/api";
import { useAuthStore } from "@/store/auth";
import Image from "next/image";
import Link from "next/link";

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
}

interface ShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export function CheckoutSection() {
  const {
    items,
    getTotalPrice,
    getItemsBySupplier,
    getSupplierTotals,
    clearCart,
  } = useCartStore();
  const { user } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [orderNumber] = useState(() => `VTG${Date.now().toString().slice(-6)}`);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Uruguay",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Address management state
  const [savedAddresses, setSavedAddresses] = useState<AddressData[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddressAlias, setNewAddressAlias] = useState("");
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [saveAsNew, setSaveAsNew] = useState(false);

  // Load saved addresses when step 2 is reached
  const loadAddresses = useCallback(async () => {
    if (!user?.email) return;
    setIsLoadingAddresses(true);
    try {
      const response = await api.addresses.getAll(user.email);
      const addresses = (response.data as any)?.data || response.data;
      if (Array.isArray(addresses) && addresses.length > 0) {
        setSavedAddresses(addresses);
        // Auto-select default address
        const defaultAddr = addresses.find((a: AddressData) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
          applyAddressToForm(defaultAddr);
        }
      } else {
        setSavedAddresses([]);
        setShowNewAddressForm(true);
      }
    } catch (error) {
      console.error('[CHECKOUT] Error loading addresses:', error);
      setShowNewAddressForm(true);
    } finally {
      setIsLoadingAddresses(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (currentStep === 2 && user?.email) {
      loadAddresses();
    }
  }, [currentStep, user?.email, loadAddresses]);

  const applyAddressToForm = (address: AddressData) => {
    setShippingInfo({
      fullName: address.fullName || "",
      email: address.email || "",
      phone: address.phone || "",
      company: address.company || "",
      address: address.street || "",
      city: address.city || "",
      state: address.state || "",
      zipCode: address.postalCode || "",
      country: address.country || "Uruguay",
    });
  };

  const handleSelectAddress = (address: AddressData) => {
    setSelectedAddressId(address.id);
    setShowNewAddressForm(false);
    applyAddressToForm(address);
  };

  const handleNewAddress = () => {
    setSelectedAddressId(null);
    setShowNewAddressForm(true);
    setShippingInfo({
      fullName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "",
      email: user?.email || "",
      phone: "",
      company: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Uruguay",
    });
    setNewAddressAlias("");
  };

  const handleSaveAddress = async () => {
    if (!user?.email) return;
    setIsSavingAddress(true);
    try {
      const addressData: CreateAddressData = {
        alias: newAddressAlias || "Dirección",
        fullName: shippingInfo.fullName,
        email: shippingInfo.email,
        phone: shippingInfo.phone,
        company: shippingInfo.company || undefined,
        street: shippingInfo.address,
        city: shippingInfo.city,
        state: shippingInfo.state,
        postalCode: shippingInfo.zipCode,
        country: shippingInfo.country,
        isDefault: savedAddresses.length === 0,
      };
      
      const response = await api.addresses.create(addressData);
      const newAddr = (response.data as any)?.data || response.data;
      if (newAddr?.id) {
        setSavedAddresses(prev => [...prev, newAddr]);
        setSelectedAddressId(newAddr.id);
        setShowNewAddressForm(false);
        setSaveAsNew(false);
      }
    } catch (error) {
      console.error('[CHECKOUT] Error saving address:', error);
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      await api.addresses.delete(addressId);
      setSavedAddresses(prev => prev.filter(a => a.id !== addressId));
      if (selectedAddressId === addressId) {
        const remaining = savedAddresses.filter(a => a.id !== addressId);
        if (remaining.length > 0) {
          handleSelectAddress(remaining[0]);
        } else {
          handleNewAddress();
        }
      }
    } catch (error) {
      console.error('[CHECKOUT] Error deleting address:', error);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await api.addresses.setDefault(addressId);
      setSavedAddresses(prev => prev.map(a => ({
        ...a,
        isDefault: a.id === addressId,
      })));
    } catch (error) {
      console.error('[CHECKOUT] Error setting default address:', error);
    }
  };

  const itemsBySupplier = getItemsBySupplier();
  const supplierTotals = getSupplierTotals();
  const totalPrice = getTotalPrice();
  const shippingCost = 0; // Free shipping
  const taxes = Math.round(totalPrice * 0.21); // 21% IVA
  const finalTotal = totalPrice + shippingCost + taxes;

  const paymentMethods: PaymentMethod[] = [
    {
      id: "cash_on_delivery",
      name: "Pago en Entrega",
      description:
        "Paga cuando recibas tu pedido. Aceptamos efectivo y tarjetas.",
      icon: <Clock className="w-6 h-6" />,
      available: true,
    },
    {
      id: "online_payment",
      name: "Pago Online",
      description: "Pago seguro con tarjeta de crédito/débito via dlocal.",
      icon: <CreditCard className="w-6 h-6" />,
      available: true,
    },
  ];

  const handleInputChange = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }));
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return true; // Review cart
      case 2:
        return (
          shippingInfo.fullName &&
          shippingInfo.email &&
          shippingInfo.phone &&
          shippingInfo.address &&
          shippingInfo.city &&
          shippingInfo.state &&
          shippingInfo.zipCode
        );
      case 3:
        return selectedPaymentMethod !== "";
      default:
        return false;
    }
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);

    // Simulate order processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Clear cart and redirect
    clearCart();
    setCurrentStep(4);
    setIsProcessing(false);
  };

  if (items.length === 0 && currentStep !== 4) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-6">🛒</div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Tu carrito está vacío
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Agrega algunos productos antes de proceder al checkout
          </p>
          <Link
            href="/productos"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Ver Productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/productos"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Continuar Comprando</span>
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Checkout
        </h1>

        {/* Progress Steps */}
        {currentStep !== 4 && (
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    step === currentStep
                      ? "bg-blue-600 text-white"
                      : step < currentStep
                        ? "bg-green-600 text-white"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                  }`}
                >
                  {step < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step
                  )}
                </div>
                {step < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      step < currentStep
                        ? "bg-green-600"
                        : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                  Revisar Pedido
                </h2>

                {/* Items grouped by supplier */}
                <div className="space-y-8">
                  {Object.entries(itemsBySupplier).map(
                    ([supplier, supplierItems]) => (
                      <div key={supplier} className="space-y-4">
                        {/* Supplier Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-3">
                            <Package2 className="w-5 h-5 text-blue-600" />
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                              {supplier}
                            </h3>
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {supplierTotals[supplier]?.items}{" "}
                            {supplierTotals[supplier]?.items === 1
                              ? "artículo"
                              : "artículos"}
                          </div>
                        </div>

                        {/* Supplier Items */}
                        {supplierItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl"
                          >
                            <div className="relative w-16 h-16 bg-white dark:bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={item.name || 'Producto'}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package2 className="w-8 h-8 text-slate-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-slate-900 dark:text-white">
                                {item.name}
                              </h4>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {item.brand} • {item.category}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                  Cantidad: {item.quantity}
                                </span>
                                <span className="font-semibold text-slate-900 dark:text-white">
                                  $
                                  {(
                                    item.price * item.quantity
                                  ).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Supplier Subtotal */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-blue-800 dark:text-blue-300">
                              Subtotal {supplier}:
                            </span>
                            <span className="font-bold text-blue-900 dark:text-blue-200">
                              $
                              {supplierTotals[supplier]?.total.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Saved Addresses Section */}
              {isLoadingAddresses ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                  <span className="ml-3 text-slate-600 dark:text-slate-400">Cargando direcciones...</span>
                </div>
              ) : savedAddresses.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Tus Direcciones
                    </h2>
                    <button
                      onClick={handleNewAddress}
                      className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Nueva dirección
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {savedAddresses.map((address) => (
                      <motion.div
                        key={address.id}
                        whileHover={{ scale: 1.01 }}
                        onClick={() => handleSelectAddress(address)}
                        className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedAddressId === address.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                        }`}
                      >
                        {/* Default badge */}
                        {address.isDefault && (
                          <span className="absolute top-2 right-2 flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                            <Star className="w-3 h-3 fill-current" />
                            Por defecto
                          </span>
                        )}

                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            selectedAddressId === address.id
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 dark:bg-slate-700 text-slate-500"
                          }`}>
                            <Home className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-white text-sm">
                              {address.alias || "Dirección"}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                              {address.street}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-500">
                              {address.city}, {address.state} {address.postalCode}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-500">
                              {address.fullName} • {address.phone}
                            </p>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                          {!address.isDefault && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleSetDefault(address.id); }}
                              className="text-xs text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1"
                            >
                              <Star className="w-3 h-3" />
                              Predeterminar
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteAddress(address.id); }}
                            className="text-xs text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-1 ml-auto"
                          >
                            <Trash2 className="w-3 h-3" />
                            Eliminar
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Address Form (new or editing) */}
              <AnimatePresence>
                {(showNewAddressForm || savedAddresses.length === 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6"
                  >
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                      {savedAddresses.length > 0 ? "Nueva Dirección" : "Información de Envío"}
                    </h2>

                    {/* Alias field */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Alias (ej: Casa, Oficina, Depósito)
                      </label>
                      <div className="relative">
                        <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                          type="text"
                          value={newAddressAlias}
                          onChange={(e) => setNewAddressAlias(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                          placeholder="Casa"
                        />
                      </div>
                    </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Nombre Completo *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      value={shippingInfo.fullName}
                      onChange={(e) =>
                        handleInputChange("fullName", e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      placeholder="Tu nombre completo"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Teléfono *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      placeholder="+598 99 123-456"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Empresa (Opcional)
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      value={shippingInfo.company}
                      onChange={(e) =>
                        handleInputChange("company", e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      placeholder="Nombre de tu empresa"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Dirección *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      value={shippingInfo.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      placeholder="Calle, número, piso, departamento"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    placeholder="Montevideo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Departamento *
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    placeholder="Montevideo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Código Postal *
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.zipCode}
                    onChange={(e) =>
                      handleInputChange("zipCode", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    placeholder="11000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    País
                  </label>
                  <select
                    value={shippingInfo.country}
                    onChange={(e) =>
                      handleInputChange("country", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Uruguay">Uruguay</option>
                  </select>
                </div>
              </div>

                    {/* Save address checkbox + button */}
                    <div className="mt-6 flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={saveAsNew}
                          onChange={(e) => setSaveAsNew(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          Guardar esta dirección para futuras compras
                        </span>
                      </label>
                      {saveAsNew && (
                        <button
                          onClick={handleSaveAddress}
                          disabled={isSavingAddress || !shippingInfo.fullName || !shippingInfo.address}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors"
                        >
                          {isSavingAddress ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          Guardar
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6"
            >
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                Método de Pago
              </h2>

              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`block p-6 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedPaymentMethod === method.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    } ${!method.available ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selectedPaymentMethod === method.id}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      disabled={!method.available}
                      className="sr-only"
                    />
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-xl ${
                          selectedPaymentMethod === method.id
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {method.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                          {method.name}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                          {method.description}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {selectedPaymentMethod === "online_payment" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-6 p-6 bg-slate-50 dark:bg-slate-700/50 rounded-xl"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      Pago Seguro con dlocal
                    </h4>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Serás redirigido a dlocal para completar tu pago de forma
                    segura. Aceptamos todas las tarjetas de crédito y débito
                    principales.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Shield className="w-4 h-4" />
                    Transacción encriptada SSL
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8 text-center relative overflow-hidden"
            >
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{ scale: 2, rotate: 360 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-xl"
                />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1.5 }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="absolute top-10 right-10 w-16 h-16 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full blur-lg"
                />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1.2 }}
                  transition={{ duration: 1.2, delay: 0.5 }}
                  className="absolute bottom-10 left-10 w-20 h-20 bg-gradient-to-r from-cyan-400/30 to-blue-400/30 rounded-full blur-lg"
                />
              </div>

              {/* Floating Success Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.2,
                  type: "spring",
                  stiffness: 200,
                }}
                className="relative z-10 mx-auto mb-6 w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                >
                  <CheckCircle className="w-10 h-10 text-white" />
                </motion.div>

                {/* Pulse Effect */}
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-green-500 rounded-full"
                />
              </motion.div>

              {/* Success Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="relative z-10"
              >
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                  ¡Pedido Confirmado!
                </h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="text-lg text-slate-600 dark:text-slate-400 mb-8"
                >
                  Tu pedido ha sido procesado exitosamente. Te enviaremos un
                  email con los detalles y el seguimiento.
                </motion.p>
              </motion.div>

              {/* Order Details Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="relative z-10 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 mb-8 border border-green-200 dark:border-green-700"
              >
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">
                      Número de Pedido:
                    </span>
                    <p className="font-bold text-slate-900 dark:text-white">
                      #{orderNumber}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">
                      Total Pagado:
                    </span>
                    <p className="font-bold text-green-600 dark:text-green-400">
                      ${finalTotal.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">
                      Método de Pago:
                    </span>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {
                        paymentMethods.find(
                          (p) => p.id === selectedPaymentMethod,
                        )?.name
                      }
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">
                      Entrega Estimada:
                    </span>
                    <p className="font-medium text-slate-900 dark:text-white">
                      3-5 días hábiles
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="relative z-10 flex flex-col sm:flex-row gap-4 justify-center"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/productos"
                    className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Seguir Comprando
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/"
                    className="inline-block bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Ir al Inicio
                  </Link>
                </motion.div>
              </motion.div>

              {/* Decorative Elements */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.2 }}
                className="absolute top-4 left-4 text-2xl"
              >
                🎉
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.4 }}
                className="absolute top-4 right-4 text-2xl"
              >
                ✨
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.6 }}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xl"
              >
                🚚
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        {currentStep !== 4 && (
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 sticky top-8">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Resumen del Pedido
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">
                    Subtotal:
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    ${totalPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">
                    Envío:
                  </span>
                  <span className="font-medium text-green-600">
                    {shippingCost === 0 ? "Gratis" : `$${shippingCost}`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">
                    IVA (21%):
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    ${taxes.toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      Total:
                    </span>
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      ${finalTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800 dark:text-green-300">
                    Envío Gratis
                  </span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Entrega estimada: 3-5 días hábiles
                </p>
              </div>

              {/* Navigation Buttons */}
              <div className="space-y-3">
                {currentStep < 3 && (
                  <button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={!isStepValid(currentStep)}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                  >
                    {currentStep === 1
                      ? "Continuar al Envío"
                      : "Continuar al Pago"}
                  </button>
                )}

                {currentStep === 3 && (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={!isStepValid(currentStep) || isProcessing}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                        Procesando...
                      </>
                    ) : (
                      "Confirmar Pedido"
                    )}
                  </button>
                )}

                {currentStep > 1 && (
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold py-3 px-6 rounded-xl transition-colors"
                  >
                    Volver
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
