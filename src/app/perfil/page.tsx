"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  Edit3,
  Save,
  X,
  Camera,
  Shield,
  Award,
  Bell,
  Lock,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useTheme } from "@/contexts/theme-context";
import { toast } from "sonner";
import Link from "next/link";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { themeColors } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '';
  const userCompany = user?.distributorInfo?.businessName || '';
  const userPhone = user?.profile?.phone || '';
  const userAddress = user?.profile?.address || '';
  const userRole = user?.role === 'distributor' || user?.userType === 'distributor' ? 'distributor' : (user?.role || 'user');
  const [formData, setFormData] = useState({
    name: fullName,
    email: user?.email || "",
    phone: userPhone,
    company: userCompany,
    address: userAddress,
    avatar: "👤",
  });

  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background: `linear-gradient(135deg, ${themeColors.surface} 0%, #ffffff 40%, ${themeColors.primary}10 100%)`,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 rounded-2xl"
          style={{
            backgroundColor: "#ffffff",
            boxShadow: `0 20px 60px ${themeColors.primary}20`,
            border: `1px solid ${themeColors.border}`,
          }}
        >
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
          >
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-4" style={{ color: themeColors.text.primary }}>
            Acceso Denegado
          </h1>
          <p className="mb-6" style={{ color: themeColors.text.secondary }}>
            Debes iniciar sesión para ver tu perfil
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 rounded-lg font-semibold text-white transition-all"
            style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
          >
            Iniciar Sesión
          </Link>
        </motion.div>
      </div>
    );
  }

  const handleSave = () => {
    if (user) {
      // TODO: Implementar API de updateProfile cuando esté disponible en el backend
      setIsEditing(false);
      toast.success("Perfil actualizado correctamente");
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: fullName,
        email: user.email,
        phone: userPhone,
        company: userCompany,
        address: userAddress,
        avatar: "👤",
      });
    }
    setIsEditing(false);
  };

  const avatarOptions = [
    "👤", "👨", "👩", "🧑", "👨‍💼", "👩‍💼", "🚀", "💼", "🎯", "⭐",
  ];

  return (
    <div
      className="min-h-screen pt-6"
      style={{
        background: `linear-gradient(135deg, ${themeColors.surface} 0%, #ffffff 50%, ${themeColors.primary}08 100%)`,
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold mb-4"
              style={{ color: themeColors.text.primary }}
            >
              Mi Perfil
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg"
              style={{ color: themeColors.text.secondary }}
            >
              Gestiona tu información personal y preferencias
            </motion.p>
          </div>

          {/* Profile Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl overflow-hidden mb-8"
            style={{
              backgroundColor: "#ffffff",
              border: `1px solid ${themeColors.border}`,
              boxShadow: `0 4px 20px ${themeColors.primary}10`,
            }}
          >
            {/* Card header gradient */}
            <div
              className="px-8 pt-6 pb-4"
              style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl border-2 border-white/40"
                    >
                      {formData.avatar}
                    </motion.div>
                    {isEditing && (
                      <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-full shadow-lg"
                        style={{ border: `1px solid ${themeColors.border}` }}>
                        <Camera className="w-3 h-3" style={{ color: themeColors.primary }} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">{fullName}</h2>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                        {userRole === "distributor" ? (
                          <Shield className="w-3 h-3" />
                        ) : (
                          <User className="w-3 h-3" />
                        )}
                        <span className="capitalize">{userRole}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-white/80 text-xs">
                        <Calendar className="w-3 h-3" />
                        <span>Miembro desde septiembre 2024</span>
                      </div>
                    </div>
                  </div>
                </div>

                {!isEditing ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-all text-sm font-medium border border-white/30"
                  >
                    <Edit3 className="w-4 h-4" />
                    Editar Perfil
                  </motion.button>
                ) : (
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSave}
                      className="flex items-center gap-2 bg-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                      style={{ color: themeColors.primary }}
                    >
                      <Save className="w-4 h-4" />
                      Guardar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCancel}
                      className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-colors text-sm font-medium"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </motion.button>
                  </div>
                )}
              </div>
            </div>

            {/* Email below header */}
            <div className="px-8 py-3" style={{ borderBottom: `1px solid ${themeColors.border}` }}>
              <p className="text-sm" style={{ color: themeColors.text.secondary }}>{user.email}</p>
            </div>

            {/* Avatar Selection */}
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="px-8 py-4"
                style={{ backgroundColor: themeColors.surface, borderBottom: `1px solid ${themeColors.border}` }}
              >
                <p className="text-sm font-medium mb-3" style={{ color: themeColors.text.secondary }}>
                  Selecciona tu avatar:
                </p>
                <div className="flex gap-2 flex-wrap">
                  {avatarOptions.map((avatar) => (
                    <motion.button
                      key={avatar}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setFormData((prev) => ({ ...prev, avatar }))}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all"
                      style={{
                        backgroundColor: formData.avatar === avatar ? themeColors.primary : "#ffffff",
                        border: `2px solid ${formData.avatar === avatar ? themeColors.primary : themeColors.border}`,
                      }}
                    >
                      {avatar}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Information Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl p-8"
              style={{
                backgroundColor: "#ffffff",
                border: `1px solid ${themeColors.border}`,
                boxShadow: `0 4px 20px ${themeColors.primary}10`,
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
                >
                  <User className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold" style={{ color: themeColors.text.primary }}>
                  Información Personal
                </h3>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>
                    Nombre Completo
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border-2 rounded-lg text-sm transition-all duration-200 focus:outline-none bg-white"
                      style={{ borderColor: themeColors.border, color: themeColors.text.primary }}
                      onFocus={(e) => { e.target.style.borderColor = themeColors.primary; e.target.style.boxShadow = `0 0 0 3px ${themeColors.primary}20`; }}
                      onBlur={(e) => { e.target.style.borderColor = themeColors.border; e.target.style.boxShadow = "none"; }}
                    />
                  ) : (
                    <div
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}
                    >
                      <User className="w-4 h-4" style={{ color: themeColors.text.muted }} />
                      <span className="text-sm" style={{ color: themeColors.text.primary }}>{fullName}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border-2 rounded-lg text-sm transition-all duration-200 focus:outline-none bg-white"
                      style={{ borderColor: themeColors.border, color: themeColors.text.primary }}
                      onFocus={(e) => { e.target.style.borderColor = themeColors.primary; e.target.style.boxShadow = `0 0 0 3px ${themeColors.primary}20`; }}
                      onBlur={(e) => { e.target.style.borderColor = themeColors.border; e.target.style.boxShadow = "none"; }}
                    />
                  ) : (
                    <div
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}
                    >
                      <Mail className="w-4 h-4" style={{ color: themeColors.text.muted }} />
                      <span className="text-sm" style={{ color: themeColors.text.primary }}>{user.email}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>
                    Teléfono
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="Introduce tu número de teléfono"
                      className="w-full px-4 py-3 border-2 rounded-lg text-sm transition-all duration-200 focus:outline-none bg-white"
                      style={{ borderColor: themeColors.border, color: themeColors.text.primary }}
                      onFocus={(e) => { e.target.style.borderColor = themeColors.primary; e.target.style.boxShadow = `0 0 0 3px ${themeColors.primary}20`; }}
                      onBlur={(e) => { e.target.style.borderColor = themeColors.border; e.target.style.boxShadow = "none"; }}
                    />
                  ) : (
                    <div
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}
                    >
                      <Phone className="w-4 h-4" style={{ color: themeColors.text.muted }} />
                      <span className="text-sm" style={{ color: themeColors.text.primary }}>{userPhone || "No especificado"}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Company & Address */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl p-8"
              style={{
                backgroundColor: "#ffffff",
                border: `1px solid ${themeColors.border}`,
                boxShadow: `0 4px 20px ${themeColors.primary}10`,
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
                >
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold" style={{ color: themeColors.text.primary }}>
                  Empresa &amp; Ubicación
                </h3>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>
                    Empresa
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
                      placeholder="Nombre de tu empresa"
                      className="w-full px-4 py-3 border-2 rounded-lg text-sm transition-all duration-200 focus:outline-none bg-white"
                      style={{ borderColor: themeColors.border, color: themeColors.text.primary }}
                      onFocus={(e) => { e.target.style.borderColor = themeColors.primary; e.target.style.boxShadow = `0 0 0 3px ${themeColors.primary}20`; }}
                      onBlur={(e) => { e.target.style.borderColor = themeColors.border; e.target.style.boxShadow = "none"; }}
                    />
                  ) : (
                    <div
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}
                    >
                      <Building2 className="w-4 h-4" style={{ color: themeColors.text.muted }} />
                      <span className="text-sm" style={{ color: themeColors.text.primary }}>{userCompany || "No especificado"}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>
                    Dirección
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                      placeholder="Tu dirección completa"
                      rows={3}
                      className="w-full px-4 py-3 border-2 rounded-lg text-sm transition-all duration-200 focus:outline-none bg-white resize-none"
                      style={{ borderColor: themeColors.border, color: themeColors.text.primary }}
                      onFocus={(e) => { e.target.style.borderColor = themeColors.primary; e.target.style.boxShadow = `0 0 0 3px ${themeColors.primary}20`; }}
                      onBlur={(e) => { e.target.style.borderColor = themeColors.border; e.target.style.boxShadow = "none"; }}
                    />
                  ) : (
                    <div
                      className="flex items-start gap-3 p-3 rounded-xl"
                      style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}
                    >
                      <MapPin className="w-4 h-4 mt-0.5" style={{ color: themeColors.text.muted }} />
                      <span className="text-sm" style={{ color: themeColors.text.primary }}>{userAddress || "No especificado"}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 rounded-2xl p-8"
            style={{
              backgroundColor: "#ffffff",
              border: `1px solid ${themeColors.border}`,
              boxShadow: `0 4px 20px ${themeColors.primary}10`,
            }}
          >
            <h3 className="text-xl font-bold mb-6" style={{ color: themeColors.text.primary }}>
              Acciones Rápidas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/mis-pedidos"
                className="flex items-center gap-3 p-4 rounded-xl border-2 transition-all group hover:shadow-md"
                style={{ borderColor: themeColors.border, backgroundColor: themeColors.surface }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = themeColors.primary; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = themeColors.border; }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                  style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
                >
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm" style={{ color: themeColors.text.primary }}>Mis Pedidos</h4>
                  <p className="text-xs" style={{ color: themeColors.text.muted }}>Ver historial</p>
                </div>
              </Link>

              <Link
                href="/favoritos"
                className="flex items-center gap-3 p-4 rounded-xl border-2 transition-all group hover:shadow-md"
                style={{ borderColor: themeColors.border, backgroundColor: themeColors.surface }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = themeColors.primary; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = themeColors.border; }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                  style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
                >
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm" style={{ color: themeColors.text.primary }}>Favoritos</h4>
                  <p className="text-xs" style={{ color: themeColors.text.muted }}>Productos guardados</p>
                </div>
              </Link>

              <Link
                href="/configuracion/cambiar-contrasena"
                className="flex items-center gap-3 p-4 rounded-xl border-2 transition-all group hover:shadow-md"
                style={{ borderColor: themeColors.border, backgroundColor: themeColors.surface }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = themeColors.primary; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = themeColors.border; }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                  style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
                >
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm" style={{ color: themeColors.text.primary }}>Seguridad</h4>
                  <p className="text-xs" style={{ color: themeColors.text.muted }}>Cambiar contraseña</p>
                </div>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
