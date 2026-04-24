import { motion } from "framer-motion";
import { User, Phone, Calendar, MapPin, ArrowRight } from "lucide-react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/theme-context";

interface PersonalInfoFormData {
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;
  address: string;
  city: string;
  country: string;
}

interface PersonalInfoFormFieldsProps {
  register: UseFormRegister<PersonalInfoFormData>;
  errors: FieldErrors<PersonalInfoFormData>;
  isLoading: boolean;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

const COUNTRIES = [
  "Uruguay", "Argentina", "Brasil", "Chile", "Paraguay",
  "Colombia", "Perú", "México", "España", "Estados Unidos", "Canadá", "Otros",
];

export function PersonalInfoFormFields({ register, errors, isLoading, onSubmit }: PersonalInfoFormFieldsProps) {
  const { themeColors } = useTheme();

  const inputClass = "w-full py-3 border-2 rounded-lg text-sm transition-all duration-200 focus:outline-none bg-white";

  const getStyle = (hasError: boolean) => ({
    borderColor: hasError ? "#ef4444" : themeColors.border,
    color: themeColors.text.primary,
  });

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>, hasError: boolean) => {
    if (!hasError) {
      (e.target as HTMLElement).style.borderColor = themeColors.primary;
      (e.target as HTMLElement).style.boxShadow = `0 0 0 3px ${themeColors.primary}20`;
    }
  };

  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>, hasError: boolean) => {
    if (!hasError) {
      (e.target as HTMLElement).style.borderColor = themeColors.border;
      (e.target as HTMLElement).style.boxShadow = "none";
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Nombre y Apellido */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>
            Nombre *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: themeColors.text.muted }} />
            <input
              {...register("firstName")}
              className={cn(inputClass, "pl-10 pr-4")}
              style={getStyle(!!errors.firstName)}
              onFocus={(e) => onFocus(e, !!errors.firstName)}
              onBlur={(e) => onBlur(e, !!errors.firstName)}
              placeholder="Juan"
            />
          </div>
          {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 }}>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>
            Apellido *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: themeColors.text.muted }} />
            <input
              {...register("lastName")}
              className={cn(inputClass, "pl-10 pr-4")}
              style={getStyle(!!errors.lastName)}
              onFocus={(e) => onFocus(e, !!errors.lastName)}
              onBlur={(e) => onBlur(e, !!errors.lastName)}
              placeholder="Pérez"
            />
          </div>
          {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
        </motion.div>
      </div>

      {/* Teléfono y Fecha de nacimiento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>
            Teléfono *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: themeColors.text.muted }} />
            <input
              {...register("phone")}
              type="tel"
              className={cn(inputClass, "pl-10 pr-4")}
              style={getStyle(!!errors.phone)}
              onFocus={(e) => onFocus(e, !!errors.phone)}
              onBlur={(e) => onBlur(e, !!errors.phone)}
              placeholder="+598 99 123 456"
            />
          </div>
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18 }}>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>
            Fecha de nacimiento *
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: themeColors.text.muted }} />
            <input
              {...register("birthDate")}
              type="date"
              className={cn(inputClass, "pl-10 pr-4")}
              style={getStyle(!!errors.birthDate)}
              onFocus={(e) => onFocus(e, !!errors.birthDate)}
              onBlur={(e) => onBlur(e, !!errors.birthDate)}
            />
          </div>
          {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate.message}</p>}
        </motion.div>
      </div>

      {/* Dirección */}
      <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
        <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>
          Dirección *
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: themeColors.text.muted }} />
          <input
            {...register("address")}
            className={cn(inputClass, "pl-10 pr-4")}
            style={getStyle(!!errors.address)}
            onFocus={(e) => onFocus(e, !!errors.address)}
            onBlur={(e) => onBlur(e, !!errors.address)}
            placeholder="18 de Julio 1234, Montevideo"
          />
        </div>
        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
      </motion.div>

      {/* Ciudad y País */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.22 }}>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>
            Ciudad *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: themeColors.text.muted }} />
            <input
              {...register("city")}
              className={cn(inputClass, "pl-10 pr-4")}
              style={getStyle(!!errors.city)}
              onFocus={(e) => onFocus(e, !!errors.city)}
              onBlur={(e) => onBlur(e, !!errors.city)}
              placeholder="Montevideo"
            />
          </div>
          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.24 }}>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>
            País *
          </label>
          <select
            {...register("country")}
            className={cn(inputClass, "px-4")}
            style={getStyle(!!errors.country)}
            onFocus={(e) => onFocus(e, !!errors.country)}
            onBlur={(e) => onBlur(e, !!errors.country)}
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
        </motion.div>
      </div>

      {/* Botón */}
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-6 rounded-lg font-semibold text-white text-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{
          background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
          boxShadow: `0 4px 14px ${themeColors.primary}40`,
        }}
      >
        {isLoading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Guardando...
          </>
        ) : (
          <>
            Continuar
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </motion.button>
    </form>
  );
}
