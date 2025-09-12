"use client"

import { motion } from "framer-motion"

interface StyledSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  className?: string
  size?: "sm" | "md" | "lg"
  color?: "purple" | "blue" | "green" | "orange" | "red"
}

export function StyledSwitch({ 
  checked, 
  onChange, 
  label,
  description,
  className = "",
  size = "md",
  color = "purple"
}: StyledSwitchProps) {
  const sizeClasses = {
    sm: { container: "w-8 h-4", toggle: "w-3 h-3", translate: "translate-x-4" },
    md: { container: "w-12 h-6", toggle: "w-4 h-4", translate: "translate-x-6" },
    lg: { container: "w-14 h-7", toggle: "w-5 h-5", translate: "translate-x-7" }
  }

  const colorClasses = {
    purple: { 
      active: "bg-gradient-to-r from-purple-500 to-purple-600 shadow-purple-500/25",
      focus: "focus:ring-purple-500/50"
    },
    blue: { 
      active: "bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-500/25",
      focus: "focus:ring-blue-500/50"
    },
    green: { 
      active: "bg-gradient-to-r from-green-500 to-green-600 shadow-green-500/25",
      focus: "focus:ring-green-500/50"
    },
    orange: { 
      active: "bg-gradient-to-r from-orange-500 to-orange-600 shadow-orange-500/25",
      focus: "focus:ring-orange-500/50"
    },
    red: { 
      active: "bg-gradient-to-r from-red-500 to-red-600 shadow-red-500/25",
      focus: "focus:ring-red-500/50"
    }
  }

  const { container, toggle, translate } = sizeClasses[size]
  const activeColorClass = colorClasses[color]

  return (
    <div className={`flex items-center ${label || description ? 'justify-between' : ''} ${className}`}>
      {(label || description) && (
        <div className="flex-1">
          {label && <span className="text-gray-200 font-medium">{label}</span>}
          {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
        </div>
      )}
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onChange(!checked)}
        className={`
          relative ${container} rounded-full transition-all duration-300 ${activeColorClass.focus}
          ${checked 
            ? `${activeColorClass.active} shadow-lg` 
            : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600'
          }
        `}
      >
        <motion.div
          animate={{
            x: checked ? translate.replace('translate-x-', '') : '2px'
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
          className={`
            absolute top-1 ${toggle} bg-white rounded-full shadow-lg
            ${checked ? 'shadow-white/20' : 'shadow-gray-900/20'}
          `}
        />
      </motion.button>
    </div>
  )
}
