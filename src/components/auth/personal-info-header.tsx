// Personal Info Form - Header Component
import { motion } from "framer-motion";
import { ArrowLeft, User } from "lucide-react";

interface PersonalInfoHeaderProps {
  onBack: () => void;
}

export function PersonalInfoHeader({ onBack }: PersonalInfoHeaderProps) {
  return (
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
  );
}