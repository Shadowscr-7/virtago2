"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Phone,
  Calendar,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";

const personalInfoSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
  birthDate: z.string().min(1, "La fecha de nacimiento es requerida"),
  address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
  city: z.string().min(2, "La ciudad es requerida"),
  country: z.string().min(2, "El país es requerido"),
});

type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

interface PersonalInfoFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function PersonalInfoForm({ onBack, onSuccess }: PersonalInfoFormProps) {
  const { updatePersonalInfo, isLoading, user } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: "",
      birthDate: "",
      address: "",
      city: "",
      country: "México",
    },
  });

  const onSubmit = async (data: PersonalInfoFormData) => {
    try {
      await updatePersonalInfo(data);
      onSuccess();
    } catch (error) {
      console.error("Error updating personal info:", error);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.6 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8 relative">
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute -top-2 -left-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </motion.button>

          <motion.div
            initial={{ scale: 0.5, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
              <div className="absolute inset-2 rounded-full bg-slate-900 flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-3xl font-bold text-white mb-2"
          >
            Información Personal
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-white/70"
          >
            Completa tu perfil con tus datos personales
          </motion.p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Nombre y Apellido */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  placeholder="+52 55 1234 5678"
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
                placeholder="Calle 123, Colonia Centro"
              />
            </div>
            {errors.address && (
              <p className="text-red-400 text-sm mt-1">
                {errors.address.message}
              </p>
            )}
          </motion.div>

          {/* Ciudad y País */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  placeholder="Ciudad de México"
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
                  <option value="México" className="bg-slate-800">
                    México
                  </option>
                  <option value="Estados Unidos" className="bg-slate-800">
                    Estados Unidos
                  </option>
                  <option value="Canadá" className="bg-slate-800">
                    Canadá
                  </option>
                  <option value="España" className="bg-slate-800">
                    España
                  </option>
                  <option value="Colombia" className="bg-slate-800">
                    Colombia
                  </option>
                  <option value="Argentina" className="bg-slate-800">
                    Argentina
                  </option>
                  <option value="Chile" className="bg-slate-800">
                    Chile
                  </option>
                  <option value="Perú" className="bg-slate-800">
                    Perú
                  </option>
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
            transition={{ delay: 1.2, duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300",
              "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500",
              "hover:from-blue-600 hover:via-purple-600 hover:to-pink-600",
              "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent",
              "disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
              isLoading && "animate-pulse",
            )}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                Continuar
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </motion.button>
        </form>

        {/* Progreso */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.6 }}
          className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/70 text-sm">Progreso del registro</span>
            <span className="text-white/70 text-sm">75%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "75%" }}
              transition={{ delay: 1.5, duration: 1 }}
              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
