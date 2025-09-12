"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Filter, Tag, Clock, TrendingDown, ChevronDown, X } from "lucide-react"

interface OffersFilters {
  search: string
  category: string[]
  discountRange: string[]
  timeLeft: string[]
  offerType: string[]
}

interface OffersFiltersProps {
  filters: OffersFilters
  onFiltersChange: (filters: OffersFilters) => void
}

export function OffersFilters({ filters, onFiltersChange }: OffersFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>([])

  const filterSections = [
    {
      id: 'category',
      title: 'Categoría',
      icon: Tag,
      options: [
        'Tecnología', 'Electrónicos', 'Hogar y Jardín', 'Deportes',
        'Moda', 'Salud y Belleza', 'Automotriz', 'Oficina',
        'Alimentación', 'Construcción', 'Herramientas', 'Industrial'
      ]
    },
    {
      id: 'discountRange',
      title: 'Descuento',
      icon: TrendingDown,
      options: [
        '10% - 20%', '21% - 30%', '31% - 40%', '41% - 50%',
        '51% - 60%', '61% - 70%', 'Más del 70%'
      ]
    },
    {
      id: 'timeLeft',
      title: 'Tiempo Restante',
      icon: Clock,
      options: [
        'Menos de 1 hora', '1-6 horas', '6-24 horas',
        '1-3 días', '3-7 días', 'Más de 1 semana'
      ]
    },
    {
      id: 'offerType',
      title: 'Tipo de Oferta',
      icon: Tag,
      options: [
        'Flash Sale', 'Oferta del Día', 'Descuento por Volumen',
        'Liquidación', 'Black Friday', 'Cyber Monday',
        'Fin de Temporada', 'Lanzamiento'
      ]
    }
  ]

  const [searchInputs, setSearchInputs] = useState<{[key: string]: string}>({})
  const [visibleItems, setVisibleItems] = useState<{[key: string]: number}>({})

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const handleFilterChange = (sectionId: string, value: string, checked: boolean) => {
    const currentValues = filters[sectionId as keyof typeof filters] as string[]
    const newValues = checked 
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value)
    
    onFiltersChange({
      ...filters,
      [sectionId]: newValues
    })
  }

  const handleSearchChange = (sectionId: string, searchValue: string) => {
    setSearchInputs(prev => ({
      ...prev,
      [sectionId]: searchValue
    }))
  }

  const getFilteredOptions = (sectionId: string, options: string[]) => {
    const searchTerm = searchInputs[sectionId]?.toLowerCase() || ''
    return options.filter(option => 
      option.toLowerCase().includes(searchTerm)
    )
  }

  const getVisibleOptions = (sectionId: string, options: string[]) => {
    const limit = visibleItems[sectionId] || 8
    const filteredOptions = getFilteredOptions(sectionId, options)
    return filteredOptions.slice(0, limit)
  }

  const shouldShowMoreButton = (sectionId: string, options: string[]) => {
    const filteredOptions = getFilteredOptions(sectionId, options)
    const limit = visibleItems[sectionId] || 8
    return filteredOptions.length > limit
  }

  const handleShowMore = (sectionId: string, options: string[]) => {
    const filteredOptions = getFilteredOptions(sectionId, options)
    setVisibleItems(prev => ({
      ...prev,
      [sectionId]: filteredOptions.length
    }))
  }

  const handleShowLess = (sectionId: string) => {
    setVisibleItems(prev => ({
      ...prev,
      [sectionId]: 8
    }))
  }

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      category: [],
      discountRange: [],
      timeLeft: [],
      offerType: []
    })
    setSearchInputs({})
  }

  const activeFiltersCount = Object.values(filters).flat().filter(Boolean).length - (filters.search ? 1 : 0)

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* Search Bar */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar ofertas por producto, marca..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
            />
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="flex gap-3">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
              isFilterOpen || activeFiltersCount > 0
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
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
              className="flex items-center gap-2 px-4 py-3 rounded-xl font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-300"
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
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-slate-200 dark:border-slate-700 pt-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
              {filterSections.map((section) => (
                <div key={section.id} className="space-y-3">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <div className="flex items-center gap-2">
                      <section.icon className="w-5 h-5 text-orange-500" />
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {section.title}
                      </span>
                      {filters[section.id as keyof typeof filters].length > 0 && (
                        <span className="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 text-xs px-2 py-1 rounded-full">
                          {filters[section.id as keyof typeof filters].length}
                        </span>
                      )}
                    </div>
                    <ChevronDown 
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        expandedSections.includes(section.id) ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>

                  <AnimatePresence>
                    {expandedSections.includes(section.id) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
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
                            value={searchInputs[section.id] || ''}
                            onChange={(e) => handleSearchChange(section.id, e.target.value)}
                            className="w-full pl-10 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                          />
                        </div>

                        {/* Options */}
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {getVisibleOptions(section.id, section.options).map((option) => (
                            <label
                              key={option}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors duration-200"
                            >
                              <input
                                type="checkbox"
                                checked={filters[section.id as keyof typeof filters].includes(option)}
                                onChange={(e) => handleFilterChange(section.id, option, e.target.checked)}
                                className="rounded border-slate-300 text-orange-500 focus:ring-orange-500 focus:ring-offset-0"
                              />
                              <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">
                                {option}
                              </span>
                            </label>
                          ))}
                        </div>

                        {/* Show More/Less Buttons */}
                        <div className="flex gap-2">
                          {shouldShowMoreButton(section.id, section.options) && (
                            <button
                              onClick={() => handleShowMore(section.id, section.options)}
                              className="text-xs text-orange-500 hover:text-orange-600 font-medium"
                            >
                              Ver más ({getFilteredOptions(section.id, section.options).length - (visibleItems[section.id] || 8)} más)
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
  )
}
