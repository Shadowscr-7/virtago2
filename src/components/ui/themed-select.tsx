"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/theme-context";

interface Option {
  value: string;
  label: string;
  icon?: string;
}

interface ThemedSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  label?: string;
  disabled?: boolean;
}

export function ThemedSelect({
  value,
  onChange,
  options,
  placeholder = "Seleccionar...",
  className = "",
  label,
  disabled = false,
}: ThemedSelectProps) {
  const { themeColors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const selectRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Enfocar el input cuando se abre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSearchTerm("");
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>
          {label}
        </label>
      )}

      <div className="relative" ref={selectRef}>
        {/* Trigger Button */}
        <motion.button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          whileHover={disabled ? {} : { scale: 1.01 }}
          whileTap={disabled ? {} : { scale: 0.99 }}
          className={`
            w-full px-4 py-3 rounded-xl border-2 text-left transition-all duration-300 backdrop-blur-lg
            flex items-center justify-between min-h-[3.5rem]
            ${
              disabled
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer hover:scale-[1.01] focus:outline-none focus:ring-2"
            }
          `}
          style={{
            backgroundColor: disabled 
              ? `${themeColors.surface}40` 
              : `${themeColors.surface}80`,
            borderColor: isOpen 
              ? themeColors.primary 
              : `${themeColors.primary}30`,
            color: themeColors.text.primary,
            ...(isOpen && {
              boxShadow: `0 0 0 3px ${themeColors.primary}20`,
            }),
          }}
        >
          <span
            className={`flex items-center gap-2 ${!selectedOption ? "opacity-60" : ""}`}
          >
            {selectedOption ? (
              <>
                {selectedOption.icon && <span>{selectedOption.icon}</span>}
                {selectedOption.label}
              </>
            ) : (
              placeholder
            )}
          </span>

          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className={`flex-shrink-0 ${disabled ? "opacity-50" : ""}`}
          >
            <ChevronDown className="w-5 h-5" style={{ color: themeColors.text.secondary }} />
          </motion.div>
        </motion.button>

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && !disabled && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute z-[9999] w-full mt-2 backdrop-blur-xl border rounded-2xl shadow-2xl overflow-hidden enhanced-select-dropdown"
              style={{
                backgroundColor: `${themeColors.surface}95`,
                borderColor: `${themeColors.primary}40`,
                boxShadow: `0 20px 25px -5px ${themeColors.primary}10, 0 10px 10px -5px ${themeColors.primary}04`,
              }}
            >
              {/* Search Input */}
              {options.length > 5 && (
                <div className="p-3 border-b" style={{ borderColor: `${themeColors.primary}20` }}>
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all duration-200"
                    style={{
                      backgroundColor: `${themeColors.surface}80`,
                      borderColor: `${themeColors.primary}30`,
                      color: themeColors.text.primary,
                    }}
                  />
                </div>
              )}

              {/* Options List */}
              <div className="max-h-60 overflow-y-auto">
                {filteredOptions.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-center" style={{ color: themeColors.text.secondary }}>
                    No se encontraron opciones
                  </div>
                ) : (
                  filteredOptions.map((option, index) => (
                    <motion.button
                      key={option.value}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className="w-full px-4 py-3 text-left flex items-center justify-between transition-all duration-200 hover:scale-[1.01]"
                      style={{
                        ...(value === option.value && {
                          backgroundColor: `${themeColors.primary}20`,
                          color: themeColors.primary,
                          fontWeight: "500",
                        }),
                        ...(value !== option.value && {
                          color: themeColors.text.primary,
                        }),
                      }}
                      onMouseEnter={(e) => {
                        if (value !== option.value) {
                          e.currentTarget.style.backgroundColor = `${themeColors.primary}10`;
                          e.currentTarget.style.color = themeColors.primary;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (value !== option.value) {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = themeColors.text.primary;
                        }
                      }}
                    >
                      <span className="flex items-center gap-2">
                        {option.icon && <span>{option.icon}</span>}
                        {option.label}
                      </span>

                      {value === option.value && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          style={{ color: themeColors.primary }}
                        >
                          <Check className="w-4 h-4" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
