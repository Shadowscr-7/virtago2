"use client"

import { ChevronDown } from "lucide-react"

interface Option {
  value: string
  label: string
  icon?: string
}

interface StyledSelectProps {
  value: string
  onChange: (value: string) => void
  options: Option[]
  placeholder?: string
  className?: string
  label?: string
}

export function StyledSelect({ 
  value, 
  onChange, 
  options, 
  placeholder = "Seleccionar...",
  className = "",
  label
}: StyledSelectProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-200 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-xl text-white appearance-none cursor-pointer transition-all duration-300 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 backdrop-blur-lg"
        >
          {placeholder && (
            <option value="" disabled className="bg-slate-900">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value} 
              className="bg-slate-900 text-white py-2"
            >
              {option.icon ? `${option.icon} ${option.label}` : option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </div>
  )
}
