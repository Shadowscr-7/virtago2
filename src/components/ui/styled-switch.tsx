"use client";

import { motion } from "framer-motion";

interface StyledSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: "purple" | "blue" | "green" | "orange" | "red";
  disabled?: boolean;
}

export function StyledSwitch({
  checked,
  onChange,
  label,
  description,
  className = "",
  size = "md",
  color = "purple",
  disabled = false,
}: StyledSwitchProps) {
  const sizeClasses = {
    sm: { container: "w-11 h-6", toggle: "w-5 h-5", translate: "20px" },
    md: { container: "w-12 h-6", toggle: "w-5 h-5", translate: "24px" },
    lg: { container: "w-14 h-7", toggle: "w-6 h-6", translate: "28px" },
  };

  const colorClasses = {
    purple: {
      active:
        "bg-gradient-to-r from-purple-500 to-violet-600 shadow-lg shadow-purple-500/25",
      focus: "focus:ring-purple-500/50",
      glow: "shadow-purple-400/30",
    },
    blue: {
      active:
        "bg-gradient-to-r from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/25",
      focus: "focus:ring-blue-500/50",
      glow: "shadow-blue-400/30",
    },
    green: {
      active:
        "bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/25",
      focus: "focus:ring-emerald-500/50",
      glow: "shadow-emerald-400/30",
    },
    orange: {
      active:
        "bg-gradient-to-r from-orange-500 to-amber-600 shadow-lg shadow-orange-500/25",
      focus: "focus:ring-orange-500/50",
      glow: "shadow-orange-400/30",
    },
    red: {
      active:
        "bg-gradient-to-r from-red-500 to-rose-600 shadow-lg shadow-red-500/25",
      focus: "focus:ring-red-500/50",
      glow: "shadow-red-400/30",
    },
  };

  const { container, toggle, translate } = sizeClasses[size];
  const activeColorClass = colorClasses[color];

  return (
    <div
      className={`flex items-center ${label || description ? "justify-between" : ""} ${disabled ? "opacity-50" : ""} ${className}`}
    >
      {(label || description) && (
        <div className="flex-1">
          {label && (
            <span
              className={`text-sm font-medium transition-colors ${
                checked
                  ? "text-gray-800 dark:text-gray-100"
                  : "text-gray-600 dark:text-gray-300"
              }`}
            >
              {label}
            </span>
          )}
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
      )}

      <motion.button
        whileHover={disabled ? {} : { scale: 1.05 }}
        whileTap={disabled ? {} : { scale: 0.95 }}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`
          relative ${container} rounded-full transition-all duration-300 border-2
          ${
            checked
              ? `${activeColorClass.active} border-transparent ${activeColorClass.glow}`
              : "bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 border-gray-300 dark:border-gray-500 hover:from-gray-300 hover:to-gray-400 dark:hover:from-gray-500 dark:hover:to-gray-600"
          }
          ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
          focus:outline-none focus:ring-2 ${activeColorClass.focus}
        `}
      >
        <motion.div
          animate={{
            x: checked ? translate : "2px",
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 25,
          }}
          className={`
            absolute top-0.5 left-0.5 ${toggle} rounded-full shadow-lg transition-all duration-300
            ${checked ? "bg-white shadow-lg" : "bg-white shadow-md"}
          `}
        />
      </motion.button>
    </div>
  );
}
