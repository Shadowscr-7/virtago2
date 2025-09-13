"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Search } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";

interface Option {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface EnhancedSelectProps {
  options: Option[];
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  searchable?: boolean;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function EnhancedSelect({
  options,
  value,
  placeholder = "Seleccionar...",
  onChange,
  searchable = false,
  disabled = false,
  error = false,
  className = "",
  size = "md"
}: EnhancedSelectProps) {
  const { themeColors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(option => option.value === value);

  const updateDropdownPosition = () => {
    if (selectRef.current) {
      const rect = selectRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-5 py-4 text-lg"
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
        setFocusedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  useEffect(() => {
    const handleResize = () => {
      if (isOpen) {
        updateDropdownPosition();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case "Enter":
        e.preventDefault();
        if (isOpen && focusedIndex >= 0 && filteredOptions[focusedIndex]) {
          handleSelect(filteredOptions[focusedIndex].value);
        } else {
          setIsOpen(!isOpen);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSearchTerm("");
        setFocusedIndex(-1);
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex(prev => 
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
        }
        break;
    }
  };

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
    setSearchTerm("");
    setFocusedIndex(-1);
  };

  const toggleOpen = () => {
    if (!disabled) {
      if (!isOpen) {
        updateDropdownPosition();
        setIsOpen(true);
        setFocusedIndex(-1);
      } else {
        setIsOpen(false);
      }
    }
  };

  return (
    <div 
      ref={selectRef} 
      className={`relative ${className}`}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
    >
      {/* Main Select Button */}
      <motion.button
        type="button"
        onClick={toggleOpen}
        disabled={disabled}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        className={`
          w-full flex items-center justify-between rounded-xl border-2 transition-all duration-200 
          focus:outline-none focus:ring-2 focus:ring-opacity-50
          ${sizeClasses[size]}
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        `}
        style={{
          backgroundColor: disabled ? `${themeColors.surface}30` : `${themeColors.surface}70`,
          borderColor: error ? "#ef4444" : isOpen ? themeColors.primary : `${themeColors.primary}30`,
          color: themeColors.text.primary,
        }}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {selectedOption?.icon && (
            <div className="flex-shrink-0">
              {selectedOption.icon}
            </div>
          )}
          <span className={`truncate ${!selectedOption ? 'opacity-60' : ''}`}>
            {selectedOption?.label || placeholder}
          </span>
        </div>
        
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 ml-2"
        >
          <ChevronDown className="w-5 h-5" style={{ color: themeColors.text.secondary }} />
        </motion.div>
      </motion.button>

      {/* Dropdown renderizado mediante Portal */}
      {typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed rounded-xl border shadow-2xl backdrop-blur-xl overflow-hidden enhanced-select-dropdown"
              style={{
                backgroundColor: `${themeColors.surface}90`,
                borderColor: `${themeColors.primary}30`,
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
                zIndex: 99999,
              }}
            >
              {/* Search Input */}
              {searchable && (
                <div className="p-3 border-b" style={{ borderColor: `${themeColors.primary}20` }}>
                  <div className="relative">
                    <Search 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" 
                      style={{ color: themeColors.text.secondary }} 
                    />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setFocusedIndex(-1);
                      }}
                      placeholder="Buscar..."
                      className="w-full pl-10 pr-4 py-2 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: `${themeColors.surface}50`,
                        borderColor: `${themeColors.primary}30`,
                        color: themeColors.text.primary,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Options List */}
              <div className="max-h-60 overflow-y-auto">
                {filteredOptions.length === 0 ? (
                  <div 
                    className="px-4 py-3 text-center text-sm"
                    style={{ color: themeColors.text.secondary }}
                  >
                    No se encontraron opciones
                  </div>
                ) : (
                  filteredOptions.map((option, index) => (
                    <motion.button
                      key={option.value}
                      type="button"
                      onClick={() => !option.disabled && handleSelect(option.value)}
                      onMouseEnter={() => setFocusedIndex(index)}
                      disabled={option.disabled}
                      whileHover={!option.disabled ? { x: 4 } : {}}
                      className={`
                        w-full flex items-center justify-between px-4 py-3 text-left transition-all duration-200
                        ${option.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                        ${focusedIndex === index ? 'ring-2 ring-inset' : ''}
                      `}
                      style={{
                        backgroundColor: 
                          value === option.value 
                            ? `${themeColors.primary}20`
                            : focusedIndex === index 
                              ? `${themeColors.primary}10`
                              : 'transparent',
                        color: themeColors.text.primary,
                        '--tw-ring-color': focusedIndex === index ? `${themeColors.primary}50` : 'transparent',
                      } as React.CSSProperties}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {option.icon && (
                          <div className="flex-shrink-0">
                            {option.icon}
                          </div>
                        )}
                        <span className="truncate">{option.label}</span>
                      </div>
                      
                      {value === option.value && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex-shrink-0"
                        >
                          <Check className="w-5 h-5" style={{ color: themeColors.primary }} />
                        </motion.div>
                      )}
                    </motion.button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
