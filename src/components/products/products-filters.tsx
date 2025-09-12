"use client"

import { useState, useMemo } from "react"
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
  
  // Estados para búsquedas en filtros
  const [categorySearch, setCategorySearch] = useState("")
  const [brandSearch, setBrandSearch] = useState("")
  const [supplierSearch, setSupplierSearch] = useState("")
  
  // Estados para "ver más"
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [showAllBrands, setShowAllBrands] = useState(false)
  const [showAllSuppliers, setShowAllSuppliers] = useState(false)
  
  // Estados para slider de precio
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 })
  
  const ITEMS_LIMIT = 8

  // Funciones de filtrado para búsquedas
  const filteredCategories = useMemo(() => {
    return filterData.categories.filter(category =>
      category.name.toLowerCase().includes(categorySearch.toLowerCase())
    )
  }, [filterData.categories, categorySearch])

  const filteredBrands = useMemo(() => {
    return filterData.brands.filter(brand =>
      brand.name.toLowerCase().includes(brandSearch.toLowerCase())
    )
  }, [filterData.brands, brandSearch])

  const filteredSuppliers = useMemo(() => {
    return filterData.suppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(supplierSearch.toLowerCase())
    )
  }, [filterData.suppliers, supplierSearch])

  // Obtener items limitados para mostrar
  const getDisplayedItems = <T,>(items: T[], showAll: boolean): T[] => {
    return showAll ? items : items.slice(0, ITEMS_LIMIT)
  }

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
                    className="space-y-3"
                  >
                    {/* Search input for categories */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Buscar categorías..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      {getDisplayedItems(filteredCategories, showAllCategories).map(category => (
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
                      
                      {/* Show more/less button */}
                      {filteredCategories.length > ITEMS_LIMIT && (
                        <button
                          onClick={() => setShowAllCategories(!showAllCategories)}
                          className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 py-2 transition-colors"
                        >
                          {showAllCategories ? 'Ver menos' : `Ver ${filteredCategories.length - ITEMS_LIMIT} más`}
                        </button>
                      )}
                    </div>
                    
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
                    className="space-y-3"
                  >
                    {/* Search input for brands */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Buscar marcas..."
                        value={brandSearch}
                        onChange={(e) => setBrandSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      {getDisplayedItems(filteredBrands, showAllBrands).map(brand => (
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
                      
                      {/* Show more/less button */}
                      {filteredBrands.length > ITEMS_LIMIT && (
                        <button
                          onClick={() => setShowAllBrands(!showAllBrands)}
                          className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 py-2 transition-colors"
                        >
                          {showAllBrands ? 'Ver menos' : `Ver ${filteredBrands.length - ITEMS_LIMIT} más`}
                        </button>
                      )}
                    </div>
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
                    className="space-y-3"
                  >
                    {/* Search input for suppliers */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Buscar proveedores..."
                        value={supplierSearch}
                        onChange={(e) => setSupplierSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      {getDisplayedItems(filteredSuppliers, showAllSuppliers).map(supplier => (
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
                      
                      {/* Show more/less button */}
                      {filteredSuppliers.length > ITEMS_LIMIT && (
                        <button
                          onClick={() => setShowAllSuppliers(!showAllSuppliers)}
                          className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 py-2 transition-colors"
                        >
                          {showAllSuppliers ? 'Ver menos' : `Ver ${filteredSuppliers.length - ITEMS_LIMIT} más`}
                        </button>
                      )}
                    </div>
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
                    className="space-y-4"
                  >
                    {/* Price Range Slider */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                        <span>${priceRange.min.toLocaleString()}</span>
                        <span>${priceRange.max.toLocaleString()}</span>
                      </div>
                      
                      {/* Custom Dual Range Slider */}
                      <div className="relative h-2 bg-slate-200 dark:bg-slate-600 rounded-full">
                        {/* Track */}
                        <div 
                          className="absolute h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                          style={{
                            left: `${(priceRange.min / 100000) * 100}%`,
                            width: `${((priceRange.max - priceRange.min) / 100000) * 100}%`
                          }}
                        />
                        
                        {/* Min Handle */}
                        <input
                          type="range"
                          min="0"
                          max="100000"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange(prev => ({ 
                            ...prev, 
                            min: Math.min(Number(e.target.value), prev.max - 1000) 
                          }))}
                          className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
                          style={{ background: 'transparent' }}
                        />
                        
                        {/* Max Handle */}
                        <input
                          type="range"
                          min="0"
                          max="100000"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange(prev => ({ 
                            ...prev, 
                            max: Math.max(Number(e.target.value), prev.min + 1000) 
                          }))}
                          className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
                          style={{ background: 'transparent' }}
                        />
                      </div>
                      
                      {/* Manual Input */}
                      <div className="flex gap-2 items-center">
                        <div className="flex-1">
                          <label className="block text-xs text-slate-500 mb-1">Mínimo</label>
                          <input
                            type="number"
                            value={priceRange.min}
                            onChange={(e) => setPriceRange(prev => ({ 
                              ...prev, 
                              min: Math.max(0, Math.min(Number(e.target.value) || 0, prev.max - 1000))
                            }))}
                            className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            placeholder="0"
                          />
                        </div>
                        <div className="text-slate-400 pt-4">-</div>
                        <div className="flex-1">
                          <label className="block text-xs text-slate-500 mb-1">Máximo</label>
                          <input
                            type="number"
                            value={priceRange.max}
                            onChange={(e) => setPriceRange(prev => ({ 
                              ...prev, 
                              max: Math.max(prev.min + 1000, Number(e.target.value) || 100000)
                            }))}
                            className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            placeholder="100000"
                          />
                        </div>
                      </div>
                      
                      {/* Apply Price Filter Button */}
                      <button
                        onClick={() => {
                          // Aquí aplicarías el filtro de precio personalizado
                          // Por ahora solo actualizamos el estado
                          console.log('Applying price filter:', priceRange)
                        }}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Aplicar Filtro de Precio
                      </button>
                    </div>

                    {/* Quick Price Ranges */}
                    <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-600">
                      <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                        Rangos rápidos:
                      </div>
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
                    </div>
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

// Estilos CSS para el slider personalizado
const sliderStyles = `
  .slider-thumb::-webkit-slider-thumb {
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: linear-gradient(45deg, #3B82F6, #8B5CF6);
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    border: 2px solid white;
  }
  
  .slider-thumb::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: linear-gradient(45deg, #3B82F6, #8B5CF6);
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    border: 2px solid white;
  }
  
  .slider-thumb::-webkit-slider-track {
    background: transparent;
  }
  
  .slider-thumb::-moz-range-track {
    background: transparent;
  }
`

// Inyectar estilos si no existen
if (typeof document !== 'undefined' && !document.getElementById('slider-styles')) {
  const style = document.createElement('style')
  style.id = 'slider-styles'
  style.textContent = sliderStyles
  document.head.appendChild(style)
}
