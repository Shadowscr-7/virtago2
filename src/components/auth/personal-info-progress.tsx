import { motion } from "framer-motion";
import { useTheme } from "@/contexts/theme-context";

export function PersonalInfoProgress() {
  const { themeColors } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.4, duration: 0.6 }}
      className="mt-6 p-4 rounded-xl"
      style={{
        backgroundColor: themeColors.surface,
        border: `1px solid ${themeColors.border}`,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm" style={{ color: themeColors.text.secondary }}>
          Progreso del registro
        </span>
        <span className="text-sm font-medium" style={{ color: themeColors.text.primary }}>
          57%
        </span>
      </div>
      <div className="w-full rounded-full h-1.5" style={{ backgroundColor: themeColors.border }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "57%" }}
          transition={{ delay: 1.6, duration: 1 }}
          className="h-1.5 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${themeColors.primary}, ${themeColors.secondary})`,
          }}
        />
      </div>
    </motion.div>
  );
}
