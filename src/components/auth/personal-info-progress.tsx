// Personal Info Form - Progress Component
import { motion } from "framer-motion";

export function PersonalInfoProgress() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.4, duration: 0.6 }}
      className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/70 text-sm">Progreso del registro</span>
        <span className="text-white/70 text-sm">57%</span>
      </div>
      <div className="w-full bg-white/20 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "57%" }}
          transition={{ delay: 1.6, duration: 1 }}
          className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
        />
      </div>
    </motion.div>
  );
}