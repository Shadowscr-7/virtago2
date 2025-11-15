"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";

interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export function CustomSelect({ value, onChange, options, placeholder, className = "" }: CustomSelectProps) {
  const { themeColors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        dropdownRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const DropdownPortal = () => {
    if (!isOpen || !mounted || !buttonRef.current) return null;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - buttonRect.bottom;
    const dropdownHeight = Math.min(256, options.length * 60);
    const shouldOpenUpward = spaceBelow < dropdownHeight + 20 && buttonRect.top > dropdownHeight;

    const dropdownStyle: React.CSSProperties = {
      position: 'fixed',
      left: `${buttonRect.left}px`,
      width: `${buttonRect.width}px`,
      zIndex: 99999,
      ...(shouldOpenUpward
        ? { bottom: `${viewportHeight - buttonRect.top + 8}px` }
        : { top: `${buttonRect.bottom + 8}px` }
      ),
    };

    return createPortal(
      <AnimatePresence>
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: shouldOpenUpward ? 10 : -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: shouldOpenUpward ? 10 : -10 }}
          transition={{ duration: 0.15 }}
          className="rounded-xl border shadow-xl"
          style={{
            ...dropdownStyle,
            backgroundColor: themeColors.surface,
            borderColor: themeColors.primary + "30",
          }}
        >
          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            {options.map((option) => (
              <motion.button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 text-left transition-colors duration-150 flex items-center justify-between gap-2"
                style={{
                  backgroundColor: value === option.value 
                    ? themeColors.primary + "20" 
                    : "transparent",
                  color: themeColors.text.primary,
                }}
                whileHover={{
                  backgroundColor: value === option.value 
                    ? themeColors.primary + "30"
                    : themeColors.primary + "10",
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{option.label}</div>
                  {option.description && (
                    <div className="text-xs mt-0.5 truncate" style={{ color: themeColors.text.secondary }}>
                      {option.description}
                    </div>
                  )}
                </div>
                {value === option.value && (
                  <Check className="w-4 h-4 flex-shrink-0" style={{ color: themeColors.primary }} />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>,
      document.body
    );
  };

  return (
    <div className={`relative ${className}`}>
      <motion.button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 rounded-xl border text-sm transition-all duration-200 focus:outline-none focus:ring-2 flex items-center justify-between"
        style={{
          backgroundColor: themeColors.surface + "50",
          borderColor: isOpen ? themeColors.primary : themeColors.primary + "30",
          color: themeColors.text.primary,
        }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder || "Seleccionar..."}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 ml-2"
        >
          <ChevronDown className="w-4 h-4" style={{ color: themeColors.text.secondary }} />
        </motion.div>
      </motion.button>

      {DropdownPortal()}
    </div>
  );
}
