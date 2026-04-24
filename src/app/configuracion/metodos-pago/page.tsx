"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  ArrowLeft,
  Plus,
  Trash2,
  Edit3,
  Check,
  AlertCircle,
  Lock,
  Building,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useTheme } from "@/contexts/theme-context";
import Link from "next/link";

export default function MetodosPagoPage() {
  const { user } = useAuthStore();
  const { themeColors } = useTheme();
  const [showAddCard, setShowAddCard] = useState(false);
  const [cards, setCards] = useState([
    { id: 1, type: "visa", last4: "4532", expiryMonth: "12", expiryYear: "26", holderName: "María González", isDefault: true },
    { id: 2, type: "mastercard", last4: "8765", expiryMonth: "08", expiryYear: "25", holderName: "María González", isDefault: false },
  ]);
  const [newCard, setNewCard] = useState({ number: "", expiryMonth: "", expiryYear: "", cvv: "", holderName: "", isDefault: false });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4"
        style={{ background: `linear-gradient(135deg, ${themeColors.surface}, #ffffff, ${themeColors.primary}10)` }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 rounded-2xl"
          style={{ backgroundColor: "#ffffff", boxShadow: `0 20px 60px ${themeColors.primary}20`, border: `1px solid ${themeColors.border}` }}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}>
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-4" style={{ color: themeColors.text.primary }}>Acceso Denegado</h1>
          <p className="mb-6" style={{ color: themeColors.text.secondary }}>Debes iniciar sesión para gestionar métodos de pago</p>
          <Link href="/login" className="inline-block px-6 py-3 rounded-lg font-semibold text-white transition-all"
            style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}>
            Iniciar Sesión
          </Link>
        </motion.div>
      </div>
    );
  }

  const getCardIcon = (type: string) => {
    const icons = { visa: "🔵", mastercard: "🟠", amex: "🟦", default: "💳" };
    return icons[type as keyof typeof icons] || icons.default;
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) parts.push(match.substring(i, i + 4));
    return parts.length ? parts.join(" ") : v;
  };

  const addCard = () => {
    const card = {
      id: Date.now(),
      type: newCard.number.startsWith("4") ? "visa" : "mastercard",
      last4: newCard.number.slice(-4),
      expiryMonth: newCard.expiryMonth,
      expiryYear: newCard.expiryYear,
      holderName: newCard.holderName,
      isDefault: newCard.isDefault,
    };
    if (newCard.isDefault) setCards((prev) => prev.map((c) => ({ ...c, isDefault: false })));
    setCards((prev) => [...prev, card]);
    setNewCard({ number: "", expiryMonth: "", expiryYear: "", cvv: "", holderName: "", isDefault: false });
    setShowAddCard(false);
  };

  const removeCard = (id: number) => setCards((prev) => prev.filter((card) => card.id !== id));
  const setAsDefault = (id: number) => setCards((prev) => prev.map((card) => ({ ...card, isDefault: card.id === id })));

  const inputClass = "w-full px-4 py-3 border-2 rounded-lg text-sm transition-all duration-200 focus:outline-none bg-white";
  const inputStyle = { borderColor: themeColors.border, color: themeColors.text.primary };
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = themeColors.primary;
    e.target.style.boxShadow = `0 0 0 3px ${themeColors.primary}20`;
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = themeColors.border;
    e.target.style.boxShadow = "none";
  };

  return (
    <div className="min-h-screen pt-6"
      style={{ background: `linear-gradient(135deg, ${themeColors.surface} 0%, #ffffff 50%, ${themeColors.primary}08 100%)` }}>
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/configuracion"
              className="inline-flex items-center gap-2 text-sm font-medium mb-4 hover:underline transition-colors"
              style={{ color: themeColors.primary }}>
              <ArrowLeft className="w-4 h-4" />
              Volver a Configuración
            </Link>
            <h1 className="text-3xl font-bold mb-1" style={{ color: themeColors.text.primary }}>Métodos de Pago</h1>
            <p className="text-sm" style={{ color: themeColors.text.secondary }}>
              Gestiona tus tarjetas de crédito y débito para realizar compras
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Lista de tarjetas */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold" style={{ color: themeColors.text.primary }}>Tus Tarjetas</h2>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAddCard(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-white transition-all"
                  style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}>
                  <Plus className="w-4 h-4" />
                  Agregar
                </motion.button>
              </div>

              <div className="space-y-3">
                {cards.map((card, index) => (
                  <motion.div key={card.id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + index * 0.1 }}
                    className="relative p-5 rounded-2xl border-2 transition-all"
                    style={{
                      backgroundColor: card.isDefault ? `${themeColors.primary}08` : "#ffffff",
                      borderColor: card.isDefault ? themeColors.primary : themeColors.border,
                      boxShadow: `0 4px 16px ${themeColors.primary}10`,
                    }}>
                    {card.isDefault && (
                      <div className="absolute top-4 right-4">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full text-white"
                          style={{ backgroundColor: themeColors.primary }}>
                          Principal
                        </span>
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getCardIcon(card.type)}</span>
                        <div>
                          <p className="font-medium" style={{ color: themeColors.text.primary }}>
                            •••• •••• •••• {card.last4}
                          </p>
                          <p className="text-sm capitalize" style={{ color: themeColors.text.secondary }}>
                            {card.type} • {card.expiryMonth}/{card.expiryYear}
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm mb-4" style={{ color: themeColors.text.secondary }}>{card.holderName}</p>

                    <div className="flex gap-2">
                      {!card.isDefault && (
                        <button onClick={() => setAsDefault(card.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all"
                          style={{ borderColor: themeColors.border, color: themeColors.text.secondary, backgroundColor: themeColors.surface }}>
                          <Check className="w-3 h-3" />
                          Hacer principal
                        </button>
                      )}
                      <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all"
                        style={{ borderColor: themeColors.border, color: themeColors.text.secondary, backgroundColor: themeColors.surface }}>
                        <Edit3 className="w-3 h-3" />
                        Editar
                      </button>
                      <button onClick={() => removeCard(card.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all"
                        style={{ borderColor: "#fecaca", color: "#ef4444", backgroundColor: "#fef2f2" }}>
                        <Trash2 className="w-3 h-3" />
                        Eliminar
                      </button>
                    </div>
                  </motion.div>
                ))}

                {cards.length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 rounded-2xl border-2 border-dashed"
                    style={{ borderColor: themeColors.border }}>
                    <CreditCard className="w-12 h-12 mx-auto mb-3" style={{ color: themeColors.text.muted }} />
                    <p className="font-medium" style={{ color: themeColors.text.secondary }}>No tienes tarjetas agregadas</p>
                    <p className="text-sm" style={{ color: themeColors.text.muted }}>Agrega una tarjeta para realizar compras</p>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Formulario / Info adicional */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
              {showAddCard ? (
                <div className="rounded-2xl overflow-hidden"
                  style={{ backgroundColor: "#ffffff", boxShadow: `0 20px 60px ${themeColors.primary}15`, border: `1px solid ${themeColors.border}` }}>
                  {/* Card header */}
                  <div className="px-6 pt-6 pb-4"
                    style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white">Agregar Nueva Tarjeta</h3>
                    </div>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); addCard(); }} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>
                        Número de tarjeta
                      </label>
                      <input type="text"
                        value={formatCardNumber(newCard.number)}
                        onChange={(e) => setNewCard((prev) => ({ ...prev, number: e.target.value.replace(/\s/g, "") }))}
                        maxLength={19}
                        className={inputClass} style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                        placeholder="1234 5678 9012 3456" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>Mes</label>
                        <select value={newCard.expiryMonth}
                          onChange={(e) => setNewCard((prev) => ({ ...prev, expiryMonth: e.target.value }))}
                          className={inputClass} style={inputStyle} onFocus={onFocus} onBlur={onBlur}>
                          <option value="">Mes</option>
                          {Array.from({ length: 12 }, (_, i) => {
                            const month = (i + 1).toString().padStart(2, "0");
                            return <option key={month} value={month}>{month}</option>;
                          })}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>Año</label>
                        <select value={newCard.expiryYear}
                          onChange={(e) => setNewCard((prev) => ({ ...prev, expiryYear: e.target.value }))}
                          className={inputClass} style={inputStyle} onFocus={onFocus} onBlur={onBlur}>
                          <option value="">Año</option>
                          {Array.from({ length: 10 }, (_, i) => {
                            const year = (new Date().getFullYear() + i).toString().slice(-2);
                            return <option key={year} value={year}>{year}</option>;
                          })}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>CVV</label>
                      <input type="text" value={newCard.cvv}
                        onChange={(e) => setNewCard((prev) => ({ ...prev, cvv: e.target.value }))}
                        maxLength={4} className={inputClass} style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                        placeholder="123" />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>Nombre del titular</label>
                      <input type="text" value={newCard.holderName}
                        onChange={(e) => setNewCard((prev) => ({ ...prev, holderName: e.target.value }))}
                        className={inputClass} style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                        placeholder="Nombre como aparece en la tarjeta" />
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={newCard.isDefault}
                        onChange={(e) => setNewCard((prev) => ({ ...prev, isDefault: e.target.checked }))}
                        className="w-4 h-4 rounded" />
                      <span className="text-sm" style={{ color: themeColors.text.secondary }}>Establecer como tarjeta principal</span>
                    </label>

                    <div className="p-3 rounded-xl flex items-start gap-2"
                      style={{ backgroundColor: `${themeColors.primary}08`, border: `1px solid ${themeColors.primary}20` }}>
                      <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: themeColors.primary }} />
                      <p className="text-xs" style={{ color: themeColors.text.secondary }}>
                        Tu información está protegida con encriptación de extremo a extremo. No almacenamos tu número completo ni CVV.
                      </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                        type="button" onClick={() => setShowAddCard(false)}
                        className="px-5 py-2.5 rounded-lg font-semibold text-sm border-2 transition-all"
                        style={{ borderColor: themeColors.border, color: themeColors.text.secondary, backgroundColor: "#ffffff" }}>
                        Cancelar
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                        type="submit"
                        className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm text-white transition-all"
                        style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}>
                        <CreditCard className="w-4 h-4" />
                        Agregar Tarjeta
                      </motion.button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Información de facturación */}
                  <div className="rounded-2xl overflow-hidden"
                    style={{ backgroundColor: "#ffffff", boxShadow: `0 4px 20px ${themeColors.primary}10`, border: `1px solid ${themeColors.border}` }}>
                    <div className="px-5 pt-5 pb-3"
                      style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <Building className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="font-bold text-white">Información de Facturación</h3>
                      </div>
                    </div>
                    <div className="p-5 space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span style={{ color: themeColors.text.secondary }}>Empresa:</span>
                        <span className="font-medium" style={{ color: themeColors.text.primary }}>{user?.distributorInfo?.businessName || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: themeColors.text.secondary }}>Email:</span>
                        <span className="font-medium" style={{ color: themeColors.text.primary }}>{user.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: themeColors.text.secondary }}>Dirección:</span>
                        <span className="font-medium" style={{ color: themeColors.text.primary }}>Av. Corrientes 1234</span>
                      </div>
                    </div>
                  </div>

                  {/* Información importante */}
                  <div className="rounded-2xl p-5"
                    style={{ backgroundColor: `${themeColors.primary}08`, border: `1px solid ${themeColors.primary}20` }}>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: themeColors.primary }}>
                      <AlertCircle className="w-4 h-4" />
                      Información Importante
                    </h3>
                    <ul className="text-xs space-y-1.5" style={{ color: themeColors.text.secondary }}>
                      <li>• Las tarjetas están protegidas con encriptación SSL</li>
                      <li>• Solo almacenamos los últimos 4 dígitos</li>
                      <li>• Puedes cambiar tu tarjeta principal en cualquier momento</li>
                      <li>• Los pagos se procesan de forma segura</li>
                    </ul>
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
