// Personal Info Form - Form Fields Component
import { motion } from "framer-motion";
import { User, Phone, Calendar, MapPin, ArrowRight } from "lucide-react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { cn } from "@/lib/utils";

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

export function PersonalInfoFormFields({ register, errors, isLoading, onSubmit }: PersonalInfoFormFieldsProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Nombre y Apellido */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <label className="block text-white/90 text-sm font-medium mb-2">
            Nombre *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
            <input
              {...register("firstName")}
              className={cn(
                "w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50",
                "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all",
                errors.firstName && "border-red-500 focus:ring-red-500",
              )}
              placeholder="Juan"
            />
          </div>
          {errors.firstName && (
            <p className="text-red-400 text-sm mt-1">
              {errors.firstName.message}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <label className="block text-white/90 text-sm font-medium mb-2">
            Apellido *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
            <input
              {...register("lastName")}
              className={cn(
                "w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50",
                "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all",
                errors.lastName && "border-red-500 focus:ring-red-500",
              )}
              placeholder="Pérez"
            />
          </div>
          {errors.lastName && (
            <p className="text-red-400 text-sm mt-1">
              {errors.lastName.message}
            </p>
          )}
        </motion.div>
      </div>

      {/* Teléfono y Fecha de nacimiento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <label className="block text-white/90 text-sm font-medium mb-2">
            Teléfono *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
            <input
              {...register("phone")}
              type="tel"
              className={cn(
                "w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50",
                "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all",
                errors.phone && "border-red-500 focus:ring-red-500",
              )}
              placeholder="+598 99 123 456"
            />
          </div>
          {errors.phone && (
            <p className="text-red-400 text-sm mt-1">
              {errors.phone.message}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <label className="block text-white/90 text-sm font-medium mb-2">
            Fecha de nacimiento *
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
            <input
              {...register("birthDate")}
              type="date"
              className={cn(
                "w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50",
                "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all",
                errors.birthDate && "border-red-500 focus:ring-red-500",
              )}
            />
          </div>
          {errors.birthDate && (
            <p className="text-red-400 text-sm mt-1">
              {errors.birthDate.message}
            </p>
          )}
        </motion.div>
      </div>

      {/* Dirección */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
      >
        <label className="block text-white/90 text-sm font-medium mb-2">
          Dirección *
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
          <input
            {...register("address")}
            className={cn(
              "w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50",
              "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all",
              errors.address && "border-red-500 focus:ring-red-500",
            )}
            placeholder="18 de Julio 1234, Montevideo"
          />
        </div>
        {errors.address && (
          <p className="text-red-400 text-sm mt-1">
            {errors.address.message}
          </p>
        )}
      </motion.div>

      {/* Ciudad y País */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <label className="block text-white/90 text-sm font-medium mb-2">
            Ciudad *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
            <input
              {...register("city")}
              className={cn(
                "w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50",
                "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all",
                errors.city && "border-red-500 focus:ring-red-500",
              )}
              placeholder="Montevideo"
            />
          </div>
          {errors.city && (
            <p className="text-red-400 text-sm mt-1">
              {errors.city.message}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
        >
          <label className="block text-white/90 text-sm font-medium mb-2">
            País *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
            <select
              {...register("country")}
              className={cn(
                "w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white",
                "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all",
                errors.country && "border-red-500 focus:ring-red-500",
              )}
            >
              <option value="Uruguay" className="bg-slate-800">Uruguay</option>
              <option value="Argentina" className="bg-slate-800">Argentina</option>
              <option value="Brasil" className="bg-slate-800">Brasil</option>
              <option value="Chile" className="bg-slate-800">Chile</option>
              <option value="Paraguay" className="bg-slate-800">Paraguay</option>
              <option value="Colombia" className="bg-slate-800">Colombia</option>
              <option value="Perú" className="bg-slate-800">Perú</option>
              <option value="México" className="bg-slate-800">México</option>
              <option value="España" className="bg-slate-800">España</option>
              <option value="Estados Unidos" className="bg-slate-800">Estados Unidos</option>
              <option value="Canadá" className="bg-slate-800">Canadá</option>
              <option value="Otros" className="bg-slate-800">Otros</option>
            </select>
          </div>
          {errors.country && (
            <p className="text-red-400 text-sm mt-1">
              {errors.country.message}
            </p>
          )}
        </motion.div>
      </div>

      {/* Botón continuar */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3, duration: 0.6 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isLoading}
        className={cn(
          "w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-300",
          "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500",
          "hover:from-blue-600 hover:via-purple-600 hover:to-pink-600",
          "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent",
          "disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
          isLoading && "animate-pulse",
        )}
      >
        {isLoading ? (
          <>
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Guardando información...
          </>
        ) : (
          <>
            Continuar
            <ArrowRight className="h-6 w-6" />
          </>
        )}
      </motion.button>
    </form>
  );
}