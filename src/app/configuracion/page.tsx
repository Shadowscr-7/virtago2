"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  User,
  Bell,
  Shield,
  Eye,
  Mail,
  Phone,
  Lock,
  CreditCard,
  Truck,
  Save,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useTheme } from "@/contexts/theme-context";
import { StyledSelect } from "@/components/ui/styled-select";
import { StyledSwitch } from "@/components/ui/styled-switch";
import Link from "next/link";

export default function ConfiguracionPage() {
  const { user } = useAuthStore();
  const { themeColors } = useTheme();
  const [activeTab, setActiveTab] = useState("perfil");
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
    marketing: false,
  });
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
    showPhone: false,
    analytics: true,
  });

  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background: `linear-gradient(135deg, ${themeColors.surface}, #ffffff, ${themeColors.primary}10)`,
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
            style={{
              background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
            }}
          >
            <Settings className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-4" style={{ color: themeColors.text.primary }}>
            Acceso Denegado
          </h1>
          <p className="mb-6" style={{ color: themeColors.text.secondary }}>
            Debes iniciar sesión para acceder a la configuración
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 rounded-lg font-semibold text-white transition-all"
            style={{
              background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
            }}
          >
            Iniciar Sesión
          </Link>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: "perfil", label: "Perfil", icon: User },
    { id: "notificaciones", label: "Notificaciones", icon: Bell },
    { id: "privacidad", label: "Privacidad", icon: Shield },
    { id: "apariencia", label: "Apariencia", icon: Eye },
    { id: "cuenta", label: "Cuenta", icon: Lock },
  ];

  const inputClass = "w-full px-4 py-3 border-2 rounded-lg text-sm transition-all duration-200 focus:outline-none bg-white";
  const getInputStyle = () => ({
    borderColor: themeColors.border,
    color: themeColors.text.primary,
  });
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = themeColors.primary;
    e.target.style.boxShadow = `0 0 0 3px ${themeColors.primary}20`;
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = themeColors.border;
    e.target.style.boxShadow = "none";
  };

  const SwitchCard = ({ children }: { children: React.ReactNode }) => (
    <div
      className="p-4 rounded-xl"
      style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}
    >
      {children}
    </div>
  );

  const SectionTitle = ({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) => (
    <h3 className="text-base font-semibold flex items-center gap-2 mb-4" style={{ color: themeColors.text.primary }}>
      <Icon className="w-4 h-4" style={{ color: themeColors.primary }} />
      {children}
    </h3>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "perfil":
        return (
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    defaultValue={user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : ''}
                    className={inputClass}
                    style={getInputStyle()}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={user.email}
                    className={inputClass}
                    style={getInputStyle()}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    placeholder="+598 99 123 456"
                    className={inputClass}
                    style={getInputStyle()}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>
                    Empresa
                  </label>
                  <input
                    type="text"
                    defaultValue={user?.distributorInfo?.businessName || ''}
                    className={inputClass}
                    style={getInputStyle()}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>
                    Dirección
                  </label>
                  <textarea
                    placeholder="Av. Principal 1234"
                    className="w-full px-4 py-3 border-2 rounded-lg text-sm transition-all duration-200 focus:outline-none bg-white h-24 resize-none"
                    style={getInputStyle()}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </div>
                <StyledSelect
                  value="UTC-3"
                  onChange={() => {}}
                  options={[
                    { value: "UTC-3", label: "Uruguay (UTC-3)", icon: "🇺🇾" },
                    { value: "UTC-3b", label: "Argentina (UTC-3)", icon: "🇦🇷" },
                    { value: "UTC-5", label: "Colombia (UTC-5)", icon: "🇨🇴" },
                    { value: "UTC+1", label: "España (UTC+1)", icon: "🇪🇸" },
                  ]}
                  label="Zona horaria"
                />
              </div>
            </div>
          </motion.div>
        );

      case "notificaciones":
        return (
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-3">
                <SectionTitle icon={Mail}>Notificaciones por Email</SectionTitle>
                {[
                  { key: "email" as keyof typeof notifications, label: "Confirmaciones de pedido", description: "Recibe confirmaciones cuando realices un pedido", checked: notifications.email },
                  { key: "marketing" as keyof typeof notifications, label: "Promociones y ofertas", description: "Entérate de nuestras mejores ofertas y descuentos", checked: notifications.marketing },
                ].map((item) => (
                  <SwitchCard key={item.key}>
                    <StyledSwitch
                      checked={item.checked}
                      onChange={(checked) => setNotifications(prev => ({ ...prev, [item.key]: checked }))}
                      label={item.label}
                      description={item.description}
                    />
                  </SwitchCard>
                ))}
              </div>
              <div className="space-y-3">
                <SectionTitle icon={Phone}>Notificaciones Móviles</SectionTitle>
                {[
                  { key: "push" as keyof typeof notifications, label: "Notificaciones push", description: "Recibe notificaciones en tu dispositivo", checked: notifications.push },
                  { key: "sms" as keyof typeof notifications, label: "SMS importantes", description: "Solo para notificaciones críticas de seguridad", checked: notifications.sms },
                ].map((item) => (
                  <SwitchCard key={item.key}>
                    <StyledSwitch
                      checked={item.checked}
                      onChange={(checked) => setNotifications(prev => ({ ...prev, [item.key]: checked }))}
                      label={item.label}
                      description={item.description}
                    />
                  </SwitchCard>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case "privacidad":
        return (
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <SectionTitle icon={Shield}>Configuración de Privacidad</SectionTitle>
            {[
              { key: "profileVisible" as keyof typeof privacy, label: "Perfil visible para otros usuarios", description: "Otros usuarios podrán ver tu información básica", checked: privacy.profileVisible },
              { key: "showEmail" as keyof typeof privacy, label: "Mostrar email en el perfil", description: "Tu email será visible en tu perfil público", checked: privacy.showEmail },
              { key: "showPhone" as keyof typeof privacy, label: "Mostrar teléfono en el perfil", description: "Tu teléfono será visible en tu perfil público", checked: privacy.showPhone },
              { key: "analytics" as keyof typeof privacy, label: "Permitir análisis de uso", description: "Ayúdanos a mejorar la plataforma", checked: privacy.analytics },
            ].map((item) => (
              <SwitchCard key={item.key}>
                <StyledSwitch
                  checked={item.checked}
                  onChange={(checked) => setPrivacy(prev => ({ ...prev, [item.key]: checked }))}
                  label={item.label}
                  description={item.description}
                />
              </SwitchCard>
            ))}
          </motion.div>
        );

      case "apariencia":
        return (
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <SectionTitle icon={Eye}>Personalización de Apariencia</SectionTitle>
            <SwitchCard>
              <StyledSwitch
                checked={darkMode}
                onChange={setDarkMode}
                label="Modo oscuro"
                description="Cambia entre tema claro y oscuro"
              />
            </SwitchCard>
            <StyledSelect
              value="es"
              onChange={() => {}}
              options={[
                { value: "es", label: "Español", icon: "🇪🇸" },
                { value: "en", label: "English", icon: "🇺🇸" },
                { value: "pt", label: "Português", icon: "🇧🇷" },
              ]}
              label="Idioma"
            />
          </motion.div>
        );

      case "cuenta":
        return (
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <SectionTitle icon={Shield}>Seguridad de la Cuenta</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { href: "/configuracion/cambiar-contrasena", icon: Lock, label: "Cambiar Contraseña", desc: "Actualiza tu contraseña de acceso", color: themeColors.primary },
                { href: "/configuracion/autenticacion-2fa", icon: Shield, label: "Autenticación 2FA", desc: "Activa la verificación en dos pasos", color: "#16a34a" },
                { href: "/configuracion/metodos-pago", icon: CreditCard, label: "Métodos de Pago", desc: "Gestiona tus tarjetas y cuentas", color: "#2563eb" },
                { href: "/configuracion/direcciones-envio", icon: Truck, label: "Direcciones de Envío", desc: "Administra tus direcciones", color: "#d97706" },
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 rounded-xl border-2 transition-all cursor-pointer"
                    style={{
                      backgroundColor: themeColors.surface,
                      borderColor: themeColors.border,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = themeColors.primary;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = themeColors.border;
                    }}
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <item.icon className="w-4 h-4" style={{ color: item.color }} />
                      <span className="text-sm font-semibold" style={{ color: themeColors.text.primary }}>
                        {item.label}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: themeColors.text.muted }}>
                      {item.desc}
                    </p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

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
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl font-bold mb-2"
              style={{ color: themeColors.text.primary }}
            >
              Configuración
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="max-w-xl mx-auto"
              style={{ color: themeColors.text.secondary }}
            >
              Personaliza tu experiencia en VIRTAGO. Configura tu perfil, notificaciones y preferencias.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-1"
            >
              <div
                className="rounded-2xl p-4"
                style={{
                  backgroundColor: "#ffffff",
                  border: `1px solid ${themeColors.border}`,
                  boxShadow: `0 4px 20px ${themeColors.primary}10`,
                }}
              >
                <nav className="space-y-1">
                  {tabs.map((tab, index) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <motion.button
                        key={tab.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.06 }}
                        onClick={() => setActiveTab(tab.id)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-all duration-200 text-sm"
                        style={{
                          backgroundColor: isActive ? `${themeColors.primary}12` : "transparent",
                          color: isActive ? themeColors.primary : themeColors.text.secondary,
                          borderLeft: isActive ? `3px solid ${themeColors.primary}` : "3px solid transparent",
                          fontWeight: isActive ? 600 : 400,
                        }}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span>{tab.label}</span>
                      </motion.button>
                    );
                  })}
                </nav>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-3"
            >
              <div
                className="rounded-2xl p-6"
                style={{
                  backgroundColor: "#ffffff",
                  border: `1px solid ${themeColors.border}`,
                  boxShadow: `0 4px 20px ${themeColors.primary}10`,
                }}
              >
                {renderTabContent()}

                {/* Botones acción */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex gap-3 mt-8 pt-6"
                  style={{ borderTop: `1px solid ${themeColors.border}` }}
                >
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-white text-sm transition-all"
                    style={{
                      background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                      boxShadow: `0 4px 14px ${themeColors.primary}40`,
                    }}
                  >
                    <Save className="w-4 h-4" />
                    Guardar Cambios
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm border-2 transition-all"
                    style={{
                      borderColor: themeColors.border,
                      color: themeColors.text.secondary,
                      backgroundColor: "#ffffff",
                    }}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Restablecer
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
