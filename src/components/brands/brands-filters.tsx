"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Star,
  Award,
  Building,
  ChevronDown,
  X,
} from "lucide-react";
import { useTheme } from "@/contexts/theme-context";

interface BrandsFilters {
  search: string;
  category: string[];
  origin: string[];
  certification: string[];
  partnershipLevel: string[];
}

interface BrandsFiltersProps {
  filters: BrandsFilters;
  onFiltersChange: (filters: BrandsFilters) => void;
}

export function BrandsFilters({
  filters,
  onFiltersChange,
}: BrandsFiltersProps) {
  const { themeColors } = useTheme();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const filterSections = [
    {
      id: "category",
      title: "Categoría",
      icon: Building,
      options: [
        "Tecnología",
        "Electrónicos",
        "Hogar y Jardín",
        "Deportes y Fitness",
        "Moda y Accesorios",
        "Salud y Belleza",
        "Automotriz",
        "Industrial",
        "Oficina y Papelería",
        "Alimentación",
        "Construcción",
        "Herramientas",
      ],
    },
    {
      id: "origin",
      title: "Origen",
      icon: Award,
      options: [
        "Estados Unidos",
        "Alemania",
        "Japón",
        "Corea del Sur",
        "China",
        "Italia",
        "Francia",
        "Reino Unido",
        "Suecia",
        "Países Bajos",
        "Suiza",
        "Canadá",
      ],
    },
    {
      id: "certification",
      title: "Certificaciones",
      icon: Award,
      options: [
        "ISO 9001",
        "ISO 14001",
        "Energy Star",
        "CE Marking",
        "FCC Certified",
        "FDA Approved",
        "ROHS Compliant",
        "UL Listed",
      ],
    },
    {
      id: "partnershipLevel",
      title: "Nivel de Partnership",
      icon: Star,
      options: [
        "Partner Básico",
        "Partner Silver",
        "Partner Gold",
        "Partner Platinum",
        "Partner Estratégico",
      ],
    },
  ];

  const [searchInputs, setSearchInputs] = useState<{ [key: string]: string }>(
    {},
  );
  const [visibleItems, setVisibleItems] = useState<{ [key: string]: number }>(
    {},
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId],
    );
  };

  const handleFilterChange = (
    sectionId: string,
    value: string,
    checked: boolean,
  ) => {
    const currentValues = filters[
      sectionId as keyof typeof filters
    ] as string[];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter((v) => v !== value);

    onFiltersChange({
      ...filters,
      [sectionId]: newValues,
    });
  };

  const handleSearchChange = (sectionId: string, searchValue: string) => {
    setSearchInputs((prev) => ({
      ...prev,
      [sectionId]: searchValue,
    }));
  };

  const getFilteredOptions = (sectionId: string, options: string[]) => {
    const searchTerm = searchInputs[sectionId]?.toLowerCase() || "";
    return options.filter((option) =>
      option.toLowerCase().includes(searchTerm),
    );
  };

  const getVisibleOptions = (sectionId: string, options: string[]) => {
    const limit = visibleItems[sectionId] || 8;
    const filteredOptions = getFilteredOptions(sectionId, options);
    return filteredOptions.slice(0, limit);
  };

  const shouldShowMoreButton = (sectionId: string, options: string[]) => {
    const filteredOptions = getFilteredOptions(sectionId, options);
    const limit = visibleItems[sectionId] || 8;
    return filteredOptions.length > limit;
  };

  const handleShowMore = (sectionId: string, options: string[]) => {
    const filteredOptions = getFilteredOptions(sectionId, options);
    setVisibleItems((prev) => ({
      ...prev,
      [sectionId]: filteredOptions.length,
    }));
  };

  const handleShowLess = (sectionId: string) => {
    setVisibleItems((prev) => ({
      ...prev,
      [sectionId]: 8,
    }));
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: "",
      category: [],
      origin: [],
      certification: [],
      partnershipLevel: [],
    });
    setSearchInputs({});
  };

  const activeFiltersCount =
    Object.values(filters).flat().filter(Boolean).length -
    (filters.search ? 1 : 0);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* Search Bar */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar marcas por nombre, categoría..."
              value={filters.search}
              onChange={(e) =>
                onFiltersChange({ ...filters, search: e.target.value })
              }
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-slate-900 placeholder-slate-500"
            />
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="flex gap-3">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300"
            style={
              isFilterOpen || activeFiltersCount > 0
                ? { backgroundColor: themeColors.primary, color: "#ffffff" }
                : { backgroundColor: "#f1f5f9", color: "#475569" }
            }
          >
            <Filter className="w-5 h-5" />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-2 px-4 py-3 rounded-xl font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all duration-300"
            >
              <X className="w-4 h-4" />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-slate-200 pt-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
              {filterSections.map((section) => (
                <div key={section.id} className="space-y-3">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <div className="flex items-center gap-2">
                      <section.icon className="w-5 h-5" style={{ color: themeColors.primary }} />
                      <span className="font-semibold text-slate-900">
                        {section.title}
                      </span>
                      {filters[section.id as keyof typeof filters].length >
                        0 && (
                        <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${themeColors.primary}20`, color: themeColors.primary }}>
                          {filters[section.id as keyof typeof filters].length}
                        </span>
                      )}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        expandedSections.includes(section.id)
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {expandedSections.includes(section.id) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-3"
                      >
                        {/* Search Input for Section */}
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                          <input
                            type="text"
                            placeholder={`Buscar en ${section.title.toLowerCase()}...`}
                            value={searchInputs[section.id] || ""}
                            onChange={(e) =>
                              handleSearchChange(section.id, e.target.value)
                            }
                            className="w-full pl-10 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50 text-slate-900 placeholder-slate-500"
                          />
                        </div>

                        {/* Options */}
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {getVisibleOptions(section.id, section.options).map(
                            (option) => (
                              <label
                                key={option}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors duration-200"
                              >
                                <input
                                  type="checkbox"
                                  checked={filters[
                                    section.id as keyof typeof filters
                                  ].includes(option)}
                                  onChange={(e) =>
                                    handleFilterChange(
                                      section.id,
                                      option,
                                      e.target.checked,
                                    )
                                  }
                                  className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                                />
                                <span className="text-sm text-slate-700 flex-1">
                                  {option}
                                </span>
                              </label>
                            ),
                          )}
                        </div>

                        {/* Show More/Less Buttons */}
                        <div className="flex gap-2">
                          {shouldShowMoreButton(
                            section.id,
                            section.options,
                          ) && (
                            <button
                              onClick={() =>
                                handleShowMore(section.id, section.options)
                              }
                              className="text-xs font-medium"
                              style={{ color: themeColors.primary }}
                            >
                              Ver más (
                              {getFilteredOptions(section.id, section.options)
                                .length - (visibleItems[section.id] || 8)}{" "}
                              más)
                            </button>
                          )}
                          {(visibleItems[section.id] || 0) > 8 && (
                            <button
                              onClick={() => handleShowLess(section.id)}
                              className="text-xs text-slate-500 hover:text-slate-600 font-medium"
                            >
                              Ver menos
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
