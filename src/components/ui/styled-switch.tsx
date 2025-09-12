"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/contexts/theme-context";

interface StyledSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
}

export function StyledSwitch({
  checked,
  onChange,
  label,
  description,
  className = "",
  disabled = false,
}: StyledSwitchProps) {
  const { themeColors } = useTheme();

  return (
    <div
      className={`flex items-center ${label || description ? "justify-between" : ""} ${disabled ? "opacity-50" : ""} ${className}`}
    >
      {(label || description) && (
        <div className="flex-1">
          {label && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
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

      <button
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`
          relative w-11 h-6 rounded-full transition-all duration-200 ease-in-out
          ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800
        `}
        style={{
          backgroundColor: checked ? themeColors.primary : "#d1d5db",
          focusRingColor: checked ? themeColors.primary + "50" : "#d1d5db50",
        }}
      >
        <motion.div
          animate={{
            x: checked ? 20 : 2,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
          }}
          className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
        />
      </button>
    </div>
  );
}
