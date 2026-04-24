import { motion } from "framer-motion";
import { ArrowLeft, User } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";

interface PersonalInfoHeaderProps {
  onBack: () => void;
}

export function PersonalInfoHeader({ onBack }: PersonalInfoHeaderProps) {
  const { themeColors } = useTheme();

  return (
    <div
      className="px-8 pt-8 pb-6 -mx-8 -mt-8 mb-6 text-white"
      style={{
        background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
      }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-white" />
        </button>
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"
          >
            <User className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h1 className="text-xl font-bold text-white">Información Personal</h1>
            <p className="text-white/80 text-sm">Completa tu perfil</p>
          </div>
        </div>
      </div>
    </div>
  );
}
