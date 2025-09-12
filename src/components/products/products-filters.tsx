"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp,
  Package,
  Tag,
  Building,
  DollarSign,
  Star
} from "lucide-react"
import { ProductFilters } from "./products-section"

interface FilterData {
  categories: Array<{ id: string; name: string; count: number }>
  subcategories: Record<string, string[]>
  brands: Array<{ id: string; name: string; count: number }>
  suppliers: Array<{ id: string; name: string }>
  priceRanges: Array<{ id: string; name: string; min: number; max: number }>
}

interface ProductsFiltersProps {
  filters: ProductFilters
  onFiltersChange: (filters: ProductFilters) => void
  filterData: FilterData
}

export function ProductsFilters({ filters, onFiltersChange, filterData }: ProductsFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [expandedSections, setExpandedSections] = useState({
    search: true,
    category: true,
    brand: true,
    supplier: true,
    price: true,
    options: true
  })

  const updateFilter = (key: keyof ProductFilters, value: string | boolean) => {
    const newFilters = { ...filters, [key]: value }
    
    // Reset subcategory when category changes
    if (key === "category" && value !== filters.category) {
      newFilters.subcategory = "all"
    }
    
    onFiltersChange(newFilters)
  }

  const clearAllFilters = () => {
    onFiltersChange({
      search: "",
      category: "all",
      subcategory: "all",
      brand: "all",
      supplier: "all",
      priceRange: "all",
      sortBy: "relevance",
      inStockOnly: false,
      onSaleOnly: false
    })
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "search") return value.length > 0
    if (key === "sortBy") return value !== "relevance"
    if (typeof value === "boolean") return value
    return value !== "all"
  }).length

  const getSubcategories = () => {
    if (filters.category === "all") return []
    
    const categoryKey = filterData.categories.find(c => c.id === filters.category)?.name
    if (!categoryKey) return []
    
    const subcategoryMap: Record<string, string[]> = {
      "Electrónicos": filterData.subcategories.electronics,
      "Informática": filterData.subcategories.computing,
      "Oficina": filterData.subcategories.office,
      "Fotografía": filterData.subcategories.photography
    }
    
    return subcategoryMap[categoryKey] || []
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
            <Filter className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Filtros
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {activeFiltersCount} filtros activos
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            >
              <X className="w-4 h-4" />
              Limpiar
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors lg:hidden"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {(isExpanded || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Search */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200/50 dark:border-slate-600/50">
              <button
                onClick={() => toggleSection("search")}
                className="flex items-center justify-between w-full mb-3"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-500" />
                  <span className="font-medium text-slate-900 dark:text-white">Búsqueda</span>
                </div>
                {expandedSections.search ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>
              
              <AnimatePresence>
                {expandedSections.search && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Buscar productos..."
                        value={filters.search}
                        onChange={(e) => updateFilter("search", e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      {filters.search && (
                        <button
                          onClick={() => updateFilter("search", "")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Category */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200/50 dark:border-slate-600/50">
              <button
                onClick={() => toggleSection("category")}
                className="flex items-center justify-between w-full mb-3"
              >
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-slate-500" />
                  <span className="font-medium text-slate-900 dark:text-white">Categoría</span>
                </div>
                {expandedSections.category ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>
              
              <AnimatePresence>
                {expandedSections.category && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2"
                  >
                    {filterData.categories.map(category => (
                      <label
                        key={category.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="category"
                            checked={filters.category === category.id}
                            onChange={() => updateFilter("category", category.id)}
                            className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                          />
                          <span className="text-slate-700 dark:text-slate-300">{category.name}</span>
                        </div>
                        <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-600 px-2 py-1 rounded-full">
                          {category.count}
                        </span>
                      </label>
                    ))}
                    
                    {/* Subcategories */}
                    {getSubcategories().length > 0 && (
                      <div className="ml-6 mt-4 space-y-2 border-l-2 border-slate-200 dark:border-slate-600 pl-4">
                        <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                          Subcategorías:
                        </div>
                        {getSubcategories().map((subcategory: string) => (
                          <label
                            key={subcategory}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                          >
                            <input
                              type="radio"
                              name="subcategory"
                              checked={filters.subcategory === subcategory}
                              onChange={() => updateFilter("subcategory", subcategory)}
                              className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                            />
                            <span className="text-slate-700 dark:text-slate-300 text-sm">{subcategory}</span>
                          </label>
                        ))}
                        <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                          <input
                            type="radio"
                            name="subcategory"
                            checked={filters.subcategory === "all"}
                            onChange={() => updateFilter("subcategory", "all")}
                            className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                          />
                          <span className="text-slate-700 dark:text-slate-300 text-sm">Todas las subcategorías</span>
                        </label>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Brand */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200/50 dark:border-slate-600/50">
              <button
                onClick={() => toggleSection("brand")}
                className="flex items-center justify-between w-full mb-3"
              >
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-slate-500" />
                  <span className="font-medium text-slate-900 dark:text-white">Marca</span>
                </div>
                {expandedSections.brand ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>
              
              <AnimatePresence>
                {expandedSections.brand && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2"
                  >
                    {filterData.brands.map(brand => (
                      <label
                        key={brand.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="brand"
                            checked={filters.brand === brand.id}
                            onChange={() => updateFilter("brand", brand.id)}
                            className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                          />
                          <span className="text-slate-700 dark:text-slate-300">{brand.name}</span>
                        </div>
                        <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-600 px-2 py-1 rounded-full">
                          {brand.count}
                        </span>
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Supplier */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200/50 dark:border-slate-600/50">
              <button
                onClick={() => toggleSection("supplier")}
                className="flex items-center justify-between w-full mb-3"
              >
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-slate-500" />
                  <span className="font-medium text-slate-900 dark:text-white">Proveedor</span>
                </div>
                {expandedSections.supplier ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>
              
              <AnimatePresence>
                {expandedSections.supplier && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2"
                  >
                    {filterData.suppliers.map(supplier => (
                      <label
                        key={supplier.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                      >
                        <input
                          type="radio"
                          name="supplier"
                          checked={filters.supplier === supplier.id}
                          onChange={() => updateFilter("supplier", supplier.id)}
                          className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                        />
                        <span className="text-slate-700 dark:text-slate-300">{supplier.name}</span>
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Price Range */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200/50 dark:border-slate-600/50">
              <button
                onClick={() => toggleSection("price")}
                className="flex items-center justify-between w-full mb-3"
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-slate-500" />
                  <span className="font-medium text-slate-900 dark:text-white">Precio</span>
                </div>
                {expandedSections.price ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>
              
              <AnimatePresence>
                {expandedSections.price && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2"
                  >
                    {filterData.priceRanges.map(range => (
                      <label
                        key={range.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                      >
                        <input
                          type="radio"
                          name="priceRange"
                          checked={filters.priceRange === range.id}
                          onChange={() => updateFilter("priceRange", range.id)}
                          className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                        />
                        <span className="text-slate-700 dark:text-slate-300">{range.name}</span>
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Additional Options */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200/50 dark:border-slate-600/50">
              <button
                onClick={() => toggleSection("options")}
                className="flex items-center justify-between w-full mb-3"
              >
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-slate-500" />
                  <span className="font-medium text-slate-900 dark:text-white">Opciones</span>
                </div>
                {expandedSections.options ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>
              
              <AnimatePresence>
                {expandedSections.options && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={filters.inStockOnly}
                        onChange={(e) => updateFilter("inStockOnly", e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-slate-700 dark:text-slate-300">Solo productos en stock</span>
                    </label>
                    
                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={filters.onSaleOnly}
                        onChange={(e) => updateFilter("onSaleOnly", e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-slate-700 dark:text-slate-300">Solo productos en oferta</span>
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
