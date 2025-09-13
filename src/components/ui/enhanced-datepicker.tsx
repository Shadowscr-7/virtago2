"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  X
} from "lucide-react";
import { useTheme } from "@/contexts/theme-context";

interface DatePickerProps {
  value?: string;
  onChange?: (date: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  showTime?: boolean;
  minDate?: string;
  maxDate?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export function EnhancedDatePicker({
  value,
  onChange,
  placeholder = "Seleccionar fecha...",
  disabled = false,
  error = false,
  showTime = false,
  minDate,
  maxDate,
  className = "",
  size = "md"
}: DatePickerProps) {
  const { themeColors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState({ hours: "00", minutes: "00" });
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-5 py-4 text-lg"
  };

  const updateDropdownPosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: Math.max(280, rect.width) // Ancho mínimo para el calendario
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setViewDate(date);
      if (showTime) {
        setSelectedTime({
          hours: date.getHours().toString().padStart(2, '0'),
          minutes: date.getMinutes().toString().padStart(2, '0')
        });
      }
    }
  }, [value, showTime]);

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

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return placeholder;
    
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    if (showTime) {
      const formattedTime = date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
      return `${formattedDate} ${formattedTime}`;
    }
    
    return formattedDate;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = firstDay.getDay();
    
    const days = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDate - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        isPrevMonth: true,
        date: new Date(year, month - 1, prevMonthLastDay - i)
      });
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        isPrevMonth: false,
        date: new Date(year, month, day)
      });
    }
    
    // Next month days
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isPrevMonth: false,
        date: new Date(year, month + 1, day)
      });
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setViewDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const navigateYear = (direction: 'prev' | 'next') => {
    setViewDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setFullYear(prev.getFullYear() - 1);
      } else {
        newDate.setFullYear(prev.getFullYear() + 1);
      }
      return newDate;
    });
  };

  const selectDate = (date: Date) => {
    if (isDateDisabled(date)) return;
    
    if (showTime) {
      date.setHours(parseInt(selectedTime.hours), parseInt(selectedTime.minutes));
    }
    
    const dateString = date.toISOString();
    onChange?.(dateString);
    
    if (!showTime) {
      setIsOpen(false);
    }
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < new Date(minDate)) return true;
    if (maxDate && date > new Date(maxDate)) return true;
    return false;
  };

  const isDateSelected = (date: Date) => {
    if (!value) return false;
    const selectedDate = new Date(value);
    return date.toDateString() === selectedDate.toDateString();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const handleTimeChange = (type: 'hours' | 'minutes', newValue: string) => {
    setSelectedTime(prev => ({ ...prev, [type]: newValue }));
    
    if (value) {
      const date = new Date(value);
      if (type === 'hours') {
        date.setHours(parseInt(newValue));
      } else {
        date.setMinutes(parseInt(newValue));
      }
      onChange?.(date.toISOString());
    }
  };

  const clearDate = () => {
    onChange?.("");
    setIsOpen(false);
  };

  const days = getDaysInMonth(viewDate);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input Field */}
      <motion.button
        type="button"
        onClick={() => {
          if (!disabled) {
            if (!isOpen) {
              updateDropdownPosition();
              setIsOpen(true);
            } else {
              setIsOpen(false);
            }
          }
        }}
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
          <CalendarIcon className="w-5 h-5 flex-shrink-0" style={{ color: themeColors.primary }} />
          <span className={`truncate ${!value ? 'opacity-60' : ''}`}>
            {formatDisplayDate(value || "")}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {value && !disabled && (
            <motion.button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearDate();
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1 rounded-full transition-colors duration-200"
              style={{ color: themeColors.text.secondary }}
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
          
          {showTime && (
            <Clock className="w-4 h-4" style={{ color: themeColors.text.secondary }} />
          )}
        </div>
      </motion.button>

      {/* Calendar Dropdown renderizado mediante Portal */}
      {typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed p-4 rounded-2xl border shadow-2xl backdrop-blur-xl enhanced-datepicker-dropdown"
              style={{
                backgroundColor: `${themeColors.surface}90`,
                borderColor: `${themeColors.primary}30`,
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: showTime ? '320px' : '280px',
                zIndex: 99999,
              }}
            >
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    onClick={() => navigateYear('prev')}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1 rounded-lg transition-colors duration-200"
                    style={{ color: themeColors.text.secondary }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => navigateMonth('prev')}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1 rounded-lg transition-colors duration-200"
                    style={{ color: themeColors.primary }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </motion.button>
                </div>
                
                <h3 className="text-lg font-semibold" style={{ color: themeColors.text.primary }}>
                  {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                </h3>
                
                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    onClick={() => navigateMonth('next')}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1 rounded-lg transition-colors duration-200"
                    style={{ color: themeColors.primary }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => navigateYear('next')}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1 rounded-lg transition-colors duration-200"
                    style={{ color: themeColors.text.secondary }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Days Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map((day) => (
                  <div 
                    key={day} 
                    className="text-center text-xs font-medium py-2"
                    style={{ color: themeColors.text.secondary }}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {days.map((dayInfo, index) => {
                  const isSelected = isDateSelected(dayInfo.date);
                  const isTodayDate = isToday(dayInfo.date);
                  const isDisabled = isDateDisabled(dayInfo.date);
                  
                  return (
                    <motion.button
                      key={index}
                      type="button"
                      onClick={() => selectDate(dayInfo.date)}
                      disabled={isDisabled}
                      whileHover={!isDisabled ? { scale: 1.1 } : {}}
                      whileTap={!isDisabled ? { scale: 0.9 } : {}}
                      className={`
                        w-8 h-8 text-sm rounded-lg transition-all duration-200 font-medium
                        ${!dayInfo.isCurrentMonth ? 'opacity-30' : ''}
                        ${isDisabled ? 'cursor-not-allowed opacity-30' : 'cursor-pointer'}
                        ${isTodayDate ? 'ring-2' : ''}
                      `}
                      style={{
                        backgroundColor: isSelected 
                          ? themeColors.primary 
                          : 'transparent',
                        color: isSelected 
                          ? 'white' 
                          : dayInfo.isCurrentMonth 
                            ? themeColors.text.primary 
                            : themeColors.text.secondary,
                        '--tw-ring-color': isTodayDate ? `${themeColors.secondary}50` : 'transparent',
                      } as React.CSSProperties}
                    >
                      {dayInfo.day}
                    </motion.button>
                  );
                })}
              </div>

              {/* Time Picker */}
              {showTime && (
                <div className="border-t pt-4" style={{ borderColor: `${themeColors.primary}20` }}>
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium" style={{ color: themeColors.text.primary }}>
                        Hora:
                      </label>
                      <select
                        value={selectedTime.hours}
                        onChange={(e) => handleTimeChange('hours', e.target.value)}
                        className="px-2 py-1 rounded border text-sm"
                        style={{
                          backgroundColor: `${themeColors.surface}50`,
                          borderColor: `${themeColors.primary}30`,
                          color: themeColors.text.primary,
                        }}
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i.toString().padStart(2, '0')}>
                            {i.toString().padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <span style={{ color: themeColors.text.primary }}>:</span>
                    
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium" style={{ color: themeColors.text.primary }}>
                        Min:
                      </label>
                      <select
                        value={selectedTime.minutes}
                        onChange={(e) => handleTimeChange('minutes', e.target.value)}
                        className="px-2 py-1 rounded border text-sm"
                        style={{
                          backgroundColor: `${themeColors.surface}50`,
                          borderColor: `${themeColors.primary}30`,
                          color: themeColors.text.primary,
                        }}
                      >
                        {Array.from({ length: 60 }, (_, i) => (
                          <option key={i} value={i.toString().padStart(2, '0')}>
                            {i.toString().padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <motion.button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-4 py-2 rounded-xl font-medium transition-all duration-200"
                      style={{
                        backgroundColor: themeColors.primary,
                        color: 'white',
                      }}
                    >
                      Confirmar
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
