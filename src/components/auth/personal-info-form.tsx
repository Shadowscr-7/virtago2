"use client";

import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/store/auth";
import { PersonalInfoHeader } from "./personal-info-header";
import { PersonalInfoFormFields } from "./personal-info-form-fields";
import { PersonalInfoProgress } from "./personal-info-progress";

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
      country: "Uruguay",
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
        <PersonalInfoHeader onBack={onBack} />
        <PersonalInfoFormFields
          register={register}
          errors={errors}
          isLoading={isLoading}
          onSubmit={handleSubmit(onSubmit)}
        />
        <PersonalInfoProgress />
      </motion.div>
    </div>
  );
}