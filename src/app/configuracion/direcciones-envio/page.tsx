"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Truck,
  ArrowLeft,
  Plus,
  Trash2,
  Edit3,
  MapPin,
  Home,
  Building,
  Star,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useTheme } from "@/contexts/theme-context";
import { StyledSelect } from "@/components/ui/styled-select";
import { StyledSwitch } from "@/components/ui/styled-switch";
import Link from "next/link";

interface Address {
  id: number;
  type: "home" | "work" | "other";
  title: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export default function DireccionesEnvioPage() {
  const { user } = useAuthStore();
  const { themeColors } = useTheme();
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([
    { id: 1, type: "work", title: "Oficina Principal", fullName: "María González", street: "Av. Corrientes 1234, Piso 5, Oficina 501", city: "Buenos Aires", state: "CABA", zipCode: "C1043", country: "Argentina", phone: "+54 11 1234-5678", isDefault: true },
    { id: 2, type: "home", title: "Casa Particular", fullName: "María González", street: "Av. Santa Fe 567, Depto 3B", city: "Buenos Aires", state: "CABA", zipCode: "C1059", country: "Argentina", phone: "+54 11 9876-5432", isDefault: false },
  ]);
  const [newAddress, setNewAddress] = useState<Omit<Address, "id">>({
    type: "home", title: "", fullName: "", street: "", city: "", state: "", zipCode: "", country: "Argentina", phone: "", isDefault: false,
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4"
        style={{ background: `linear-gradient(135deg, ${themeColors.surface}, #ffffff, ${themeColors.primary}10)` }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 rounded-2xl"
          style={{ backgroundColor: "#ffffff", boxShadow: `0 20px 60px ${themeColors.primary}20`, border: `1px solid ${themeColors.border}` }}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}>
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-4" style={{ color: themeColors.text.primary }}>Acceso Denegado</h1>
          <p className="mb-6" style={{ color: themeColors.text.secondary }}>Debes iniciar sesión para gestionar direcciones</p>
          <Link href="/login" className="inline-block px-6 py-3 rounded-lg font-semibold text-white transition-all"
            style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}>
            Iniciar Sesión
          </Link>
        </motion.div>
      </div>
    );
  }

  const getAddressIcon = (type: string) => {
    const icons = { home: Home, work: Building, other: MapPin };
    const IconComponent = icons[type as keyof typeof icons] || MapPin;
    return <IconComponent className="w-5 h-5 text-white" />;
  };

  const addAddress = () => {
    const address: Address = { ...newAddress, id: Date.now() };
    if (newAddress.isDefault) setAddresses((prev) => prev.map((addr) => ({ ...addr, isDefault: false })));
    setAddresses((prev) => [...prev, address]);
    setNewAddress({ type: "home", title: "", fullName: "", street: "", city: "", state: "", zipCode: "", country: "Argentina", phone: "", isDefault: false });
    setShowAddAddress(false);
  };

  const removeAddress = (id: number) => setAddresses((prev) => prev.filter((addr) => addr.id !== id));
  const setAsDefault = (id: number) => setAddresses((prev) => prev.map((addr) => ({ ...addr, isDefault: addr.id === id })));

  const inputClass = "w-full px-4 py-3 border-2 rounded-lg text-sm transition-all duration-200 focus:outline-none bg-white";
  const inputStyle = { borderColor: themeColors.border, color: themeColors.text.primary };
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = themeColors.primary;
    e.target.style.boxShadow = `0 0 0 3px ${themeColors.primary}20`;
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = themeColors.border;
    e.target.style.boxShadow = "none";
  };

  return (
    <div className="min-h-screen pt-6"
      style={{ background: `linear-gradient(135deg, ${themeColors.surface} 0%, #ffffff 50%, ${themeColors.primary}08 100%)` }}>
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/configuracion"
              className="inline-flex items-center gap-2 text-sm font-medium mb-4 hover:underline transition-colors"
              style={{ color: themeColors.primary }}>
              <ArrowLeft className="w-4 h-4" />
              Volver a Configuración
            </Link>
            <h1 className="text-3xl font-bold mb-1" style={{ color: themeColors.text.primary }}>Direcciones de Envío</h1>
            <p className="text-sm" style={{ color: themeColors.text.secondary }}>
              Administra las direcciones donde quieres recibir tus pedidos
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de direcciones */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold" style={{ color: themeColors.text.primary }}>Tus Direcciones</h2>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAddAddress(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-white transition-all"
                  style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}>
                  <Plus className="w-4 h-4" />
                  Agregar Dirección
                </motion.button>
              </div>

              <div className="space-y-4">
                {addresses.map((address, index) => (
                  <motion.div key={address.id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + index * 0.1 }}
                    className="relative p-5 rounded-2xl border-2 transition-all"
                    style={{
                      backgroundColor: address.isDefault ? `${themeColors.primary}08` : "#ffffff",
                      borderColor: address.isDefault ? themeColors.primary : themeColors.border,
                      boxShadow: `0 4px 16px ${themeColors.primary}10`,
                    }}>
                    {address.isDefault && (
                      <div className="absolute top-4 right-4">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full text-white flex items-center gap-1"
                          style={{ backgroundColor: themeColors.primary }}>
                          <Star className="w-3 h-3" />
                          Principal
                        </span>
                      </div>
                    )}

                    <div className="flex items-start gap-4 mb-3">
                      <div className="p-2.5 rounded-xl flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}>
                        {getAddressIcon(address.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-base" style={{ color: themeColors.text.primary }}>{address.title}</h3>
                        <p className="text-sm" style={{ color: themeColors.text.secondary }}>{address.fullName}</p>
                      </div>
                    </div>

                    <div className="ml-12 space-y-1 mb-4">
                      <p className="text-sm" style={{ color: themeColors.text.primary }}>{address.street}</p>
                      <p className="text-sm" style={{ color: themeColors.text.secondary }}>{address.city}, {address.state} {address.zipCode}</p>
                      <p className="text-sm" style={{ color: themeColors.text.secondary }}>{address.country}</p>
                      <p className="text-sm" style={{ color: themeColors.text.secondary }}>📞 {address.phone}</p>
                    </div>

                    <div className="flex gap-2">
                      {!address.isDefault && (
                        <button onClick={() => setAsDefault(address.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all"
                          style={{ borderColor: themeColors.border, color: themeColors.text.secondary, backgroundColor: themeColors.surface }}>
                          <Star className="w-3 h-3" />
                          Hacer principal
                        </button>
                      )}
                      <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all"
                        style={{ borderColor: themeColors.border, color: themeColors.text.secondary, backgroundColor: themeColors.surface }}>
                        <Edit3 className="w-3 h-3" />
                        Editar
                      </button>
                      {!address.isDefault && (
                        <button onClick={() => removeAddress(address.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all"
                          style={{ borderColor: "#fecaca", color: "#ef4444", backgroundColor: "#fef2f2" }}>
                          <Trash2 className="w-3 h-3" />
                          Eliminar
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}

                {addresses.length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-center py-12 rounded-2xl border-2 border-dashed"
                    style={{ borderColor: themeColors.border }}>
                    <MapPin className="w-12 h-12 mx-auto mb-3" style={{ color: themeColors.text.muted }} />
                    <p className="font-medium" style={{ color: themeColors.text.secondary }}>No tienes direcciones guardadas</p>
                    <p className="text-sm" style={{ color: themeColors.text.muted }}>Agrega una dirección para recibir tus pedidos</p>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Sidebar */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="lg:col-span-1">
              {showAddAddress ? (
                <div className="rounded-2xl overflow-hidden sticky top-6"
                  style={{ backgroundColor: "#ffffff", boxShadow: `0 20px 60px ${themeColors.primary}15`, border: `1px solid ${themeColors.border}` }}>
                  <div className="px-5 pt-5 pb-4"
                    style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="font-bold text-white">Nueva Dirección</h3>
                    </div>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); addAddress(); }} className="p-5 space-y-4">
                    <StyledSelect
                      value={newAddress.type}
                      onChange={(value) => setNewAddress((prev) => ({ ...prev, type: value as Address["type"] }))}
                      options={[
                        { value: "home", label: "Casa", icon: "🏠" },
                        { value: "work", label: "Trabajo", icon: "🏢" },
                        { value: "other", label: "Otro", icon: "📍" },
                      ]}
                      label="Tipo de dirección"
                    />

                    {[
                      { label: "Título", key: "title", placeholder: "Ej: Casa, Oficina, etc." },
                      { label: "Nombre completo", key: "fullName", placeholder: "Nombre de quien recibe" },
                    ].map(({ label, key, placeholder }) => (
                      <div key={key}>
                        <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>{label}</label>
                        <input type="text" value={newAddress[key as keyof typeof newAddress] as string}
                          onChange={(e) => setNewAddress((prev) => ({ ...prev, [key]: e.target.value }))}
                          className={inputClass} style={inputStyle} onFocus={onFocus} onBlur={onBlur} placeholder={placeholder} />
                      </div>
                    ))}

                    <div>
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>Dirección completa</label>
                      <textarea value={newAddress.street}
                        onChange={(e) => setNewAddress((prev) => ({ ...prev, street: e.target.value }))}
                        className="w-full px-4 py-3 border-2 rounded-lg text-sm transition-all duration-200 focus:outline-none bg-white h-20 resize-none"
                        style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                        placeholder="Calle, número, piso, depto" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Ciudad", key: "city", placeholder: "Ciudad" },
                        { label: "Provincia", key: "state", placeholder: "Provincia" },
                      ].map(({ label, key, placeholder }) => (
                        <div key={key}>
                          <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>{label}</label>
                          <input type="text" value={newAddress[key as keyof typeof newAddress] as string}
                            onChange={(e) => setNewAddress((prev) => ({ ...prev, [key]: e.target.value }))}
                            className={inputClass} style={inputStyle} onFocus={onFocus} onBlur={onBlur} placeholder={placeholder} />
                        </div>
                      ))}
                    </div>

                    {[
                      { label: "Código postal", key: "zipCode", type: "text", placeholder: "Código postal" },
                      { label: "Teléfono", key: "phone", type: "tel", placeholder: "+54 11 1234-5678" },
                    ].map(({ label, key, type, placeholder }) => (
                      <div key={key}>
                        <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>{label}</label>
                        <input type={type} value={newAddress[key as keyof typeof newAddress] as string}
                          onChange={(e) => setNewAddress((prev) => ({ ...prev, [key]: e.target.value }))}
                          className={inputClass} style={inputStyle} onFocus={onFocus} onBlur={onBlur} placeholder={placeholder} />
                      </div>
                    ))}

                    <div className="p-3 rounded-xl"
                      style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
                      <StyledSwitch
                        checked={newAddress.isDefault}
                        onChange={(checked) => setNewAddress((prev) => ({ ...prev, isDefault: checked }))}
                        label="Dirección principal"
                        description="Se usará por defecto en tus pedidos"
                      />
                    </div>

                    <div className="flex gap-3 pt-1">
                      <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                        type="button" onClick={() => setShowAddAddress(false)}
                        className="px-4 py-2.5 rounded-lg font-semibold text-sm border-2 transition-all"
                        style={{ borderColor: themeColors.border, color: themeColors.text.secondary, backgroundColor: "#ffffff" }}>
                        Cancelar
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                        type="submit"
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm text-white transition-all"
                        style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}>
                        <MapPin className="w-4 h-4" />
                        Guardar
                      </motion.button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden sticky top-6"
                  style={{ backgroundColor: "#ffffff", boxShadow: `0 4px 20px ${themeColors.primary}10`, border: `1px solid ${themeColors.border}` }}>
                  <div className="px-5 pt-5 pb-3"
                    style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <Truck className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="font-bold text-white">Información de Envío</h3>
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="p-4 rounded-xl" style={{ backgroundColor: "#f0fdf4", border: "1px solid #86efac" }}>
                      <h4 className="font-semibold text-sm mb-1.5" style={{ color: "#16a34a" }}>Envío Gratis</h4>
                      <p className="text-xs" style={{ color: "#166534" }}>
                        En compras mayores a $500.000 el envío es gratuito a todo el país.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl"
                      style={{ backgroundColor: `${themeColors.primary}08`, border: `1px solid ${themeColors.primary}20` }}>
                      <h4 className="font-semibold text-sm mb-1.5" style={{ color: themeColors.primary }}>Tiempos de Entrega</h4>
                      <ul className="text-xs space-y-1" style={{ color: themeColors.text.secondary }}>
                        <li>• CABA: 24-48 horas</li>
                        <li>• GBA: 2-3 días hábiles</li>
                        <li>• Interior: 3-7 días hábiles</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl"
                      style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
                      <h4 className="font-semibold text-sm mb-1.5" style={{ color: themeColors.text.primary }}>Seguimiento</h4>
                      <p className="text-xs" style={{ color: themeColors.text.secondary }}>
                        Recibirás un código de seguimiento para rastrear tu pedido en tiempo real.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
