"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, Upload, AlertCircle } from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useTheme } from "@/contexts/theme-context";
import { useAuthStore } from "@/store/auth";
import { getDistributorProfile, updateDistributorProfile } from "@/services/superadmin.service";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  businessName: string;
  website: string;
  description: string;
  distributorCode: string;
  logoUrl: string;
}

export default function DistributorPerfil() {
  const { themeColors } = useTheme();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [codeHasValue, setCodeHasValue] = useState(false);
  const [form, setForm] = useState<Partial<ProfileData>>({});

  useEffect(() => {
    getDistributorProfile()
      .then((res) => {
        const d = res.data;
        setProfile(d);
        setCodeHasValue(!!(d.distributorCode && d.distributorCode.trim()));
        setForm({
          firstName: d.firstName || "",
          lastName: d.lastName || "",
          phone: d.phone || "",
          country: d.country || "",
          city: d.city || "",
          address: d.address || "",
          businessName: d.businessName || "",
          website: d.website || "",
          description: d.description || "",
          distributorCode: d.distributorCode || "",
          logoUrl: d.logoUrl || "",
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: keyof ProfileData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { ...form };
      // Never send email
      delete payload.email;
      await updateDistributorProfile(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      if (form.distributorCode && !codeHasValue) {
        setCodeHasValue(true);
      }
    } catch (e: any) {
      alert(e.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all focus:ring-2";
  const inputStyle = { borderColor: themeColors.border, color: themeColors.text.primary, backgroundColor: "#fff" };

  return (
    <AdminLayout>
      <div className="p-8 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: themeColors.text.primary }}>
            Mi Perfil
          </h1>
          <p className="mt-1 text-sm" style={{ color: themeColors.text.secondary }}>
            Informacion de tu cuenta de distribuidor
          </p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: themeColors.primary + "30", borderTopColor: themeColors.primary }} />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            {/* Logo */}
            <div className="mb-6 p-4 rounded-2xl border" style={{ borderColor: themeColors.border, backgroundColor: themeColors.surface }}>
              <label className="block text-sm font-semibold mb-2" style={{ color: themeColors.text.primary }}>
                Logo o imagen de perfil
              </label>
              <div className="flex items-center gap-4">
                {form.logoUrl ? (
                  <img src={form.logoUrl} alt="Logo" className="w-16 h-16 rounded-xl object-cover border" style={{ borderColor: themeColors.border }} />
                ) : (
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ backgroundColor: themeColors.primary + "15" }}>
                    <Upload className="w-6 h-6" style={{ color: themeColors.primary }} />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    value={form.logoUrl || ""}
                    onChange={(e) => handleChange("logoUrl", e.target.value)}
                    placeholder="URL de imagen (ej: Cloudinary)"
                    className={inputClass}
                    style={inputStyle}
                  />
                  <p className="text-xs mt-1" style={{ color: themeColors.text.muted }}>
                    Sube tu imagen a Cloudinary y pega la URL aqui
                  </p>
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div className="mb-6 p-4 rounded-2xl border" style={{ borderColor: themeColors.border, backgroundColor: "#fff" }}>
              <h3 className="font-semibold mb-4" style={{ color: themeColors.text.primary }}>Informacion Personal</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: themeColors.text.secondary }}>Nombre</label>
                  <input value={form.firstName || ""} onChange={(e) => handleChange("firstName", e.target.value)} className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: themeColors.text.secondary }}>Apellido</label>
                  <input value={form.lastName || ""} onChange={(e) => handleChange("lastName", e.target.value)} className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: themeColors.text.secondary }}>Email (no editable)</label>
                  <input value={profile?.email || ""} disabled className={inputClass} style={{ ...inputStyle, backgroundColor: themeColors.surface, cursor: "not-allowed", opacity: 0.6 }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: themeColors.text.secondary }}>Telefono</label>
                  <input value={form.phone || ""} onChange={(e) => handleChange("phone", e.target.value)} className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: themeColors.text.secondary }}>Pais</label>
                  <input value={form.country || ""} onChange={(e) => handleChange("country", e.target.value)} className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: themeColors.text.secondary }}>Ciudad</label>
                  <input value={form.city || ""} onChange={(e) => handleChange("city", e.target.value)} className={inputClass} style={inputStyle} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1" style={{ color: themeColors.text.secondary }}>Direccion</label>
                  <input value={form.address || ""} onChange={(e) => handleChange("address", e.target.value)} className={inputClass} style={inputStyle} />
                </div>
              </div>
            </div>

            {/* Business Info */}
            <div className="mb-6 p-4 rounded-2xl border" style={{ borderColor: themeColors.border, backgroundColor: "#fff" }}>
              <h3 className="font-semibold mb-4" style={{ color: themeColors.text.primary }}>Informacion de Empresa</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: themeColors.text.secondary }}>Nombre de empresa</label>
                  <input value={form.businessName || ""} onChange={(e) => handleChange("businessName", e.target.value)} className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: themeColors.text.secondary }}>Sitio web (opcional)</label>
                  <input value={form.website || ""} onChange={(e) => handleChange("website", e.target.value)} placeholder="https://..." className={inputClass} style={inputStyle} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1" style={{ color: themeColors.text.secondary }}>Descripcion del negocio (opcional)</label>
                  <textarea
                    value={form.description || ""}
                    onChange={(e) => handleChange("description", e.target.value)}
                    rows={3}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Distributor Code */}
            <div className="mb-6 p-4 rounded-2xl border" style={{ borderColor: themeColors.border, backgroundColor: "#fff" }}>
              <h3 className="font-semibold mb-2" style={{ color: themeColors.text.primary }}>Codigo de Distribuidor</h3>
              {codeHasValue ? (
                <div>
                  <div
                    className="flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}
                  >
                    <span className="font-mono font-bold text-lg" style={{ color: themeColors.primary }}>
                      {profile?.distributorCode}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: themeColors.primary + "15", color: themeColors.primary }}>
                      Configurado
                    </span>
                  </div>
                  <div className="flex items-start gap-2 mt-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: themeColors.text.muted }} />
                    <p className="text-xs" style={{ color: themeColors.text.muted }}>
                      El codigo de distribuidor solo puede configurarse una vez. Para modificarlo contacta al administrador.
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    value={form.distributorCode || ""}
                    onChange={(e) => handleChange("distributorCode", e.target.value.toUpperCase())}
                    placeholder="Ej: DIST001"
                    className={inputClass + " font-mono"}
                    style={inputStyle}
                  />
                  <div className="flex items-start gap-2 mt-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#d97706" }} />
                    <p className="text-xs" style={{ color: "#d97706" }}>
                      El codigo de distribuidor solo puede configurarse una vez. Una vez guardado no podra modificarse. Para modificarlo contacta al administrador.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white transition-all hover:scale-105 disabled:opacity-60"
                style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
              {saved && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-sm font-medium"
                  style={{ color: "#15803d" }}
                >
                  Cambios guardados correctamente
                </motion.span>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
}
