"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/layout/navbar"
import { ProductCard } from "@/components/products/product-card"
import { Filter, Grid3X3, List, SlidersHorizontal } from "lucide-react"

// Mock data expandido para productos
const allProducts = [
  {
    name: "Smartphone Pro Max 256GB",
    brand: "TechBrand",
    supplier: "TechSupplier SA",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
    price: 899000,
    originalPrice: 999000,
    description: "Último modelo con tecnología avanzada y cámara profesional",
    category: "Electrónicos"
  },
  {
    name: "Laptop Gaming RGB 16GB",
    brand: "GameTech",
    supplier: "Gaming Solutions",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
    price: 1299000,
    description: "Potencia extrema para gaming y trabajo profesional",
    category: "Informática"
  },
  {
    name: "Auriculares Inalámbricos Pro",
    brand: "AudioMax",
    supplier: "Audio Premium",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    price: 199000,
    originalPrice: 249000,
    description: "Cancelación de ruido activa y sonido de alta fidelidad",
    category: "Electrónicos"
  },
  {
    name: "Tablet Profesional 12.9\"",
    brand: "TabletPro",
    supplier: "Digital Devices",
    image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400",
    price: 799000,
    description: "Perfecta para diseño y productividad profesional",
    category: "Informática"
  },
  {
    name: "Monitor 4K UltraWide",
    brand: "DisplayPro",
    supplier: "Monitor Solutions",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400",
    price: 649000,
    originalPrice: 749000,
    description: "Monitor curvo de 34 pulgadas para máxima productividad",
    category: "Informática"
  },
  {
    name: "Teclado Mecánico RGB",
    brand: "KeyMaster",
    supplier: "Gaming Gear",
    image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400",
    price: 159000,
    description: "Switches mecánicos y retroiluminación personalizable",
    category: "Informática"
  },
  {
    name: "Silla Ergonómica Ejecutiva",
    brand: "ComfortPlus",
    supplier: "Office Furniture",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
    price: 449000,
    originalPrice: 529000,
    description: "Máximo confort para largas jornadas de trabajo",
    category: "Oficina"
  },
  {
    name: "Impresora Láser Multifunción",
    brand: "PrintMax",
    supplier: "Office Solutions",
    image: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400",
    price: 289000,
    description: "Impresión, escaneado y copiado de alta velocidad",
    category: "Oficina"
  }
]

const categories = ["Todos", "Electrónicos", "Informática", "Oficina"]
const brands = ["Todas", "TechBrand", "GameTech", "AudioMax", "TabletPro", "DisplayPro", "KeyMaster", "ComfortPlus", "PrintMax"]

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [selectedBrand, setSelectedBrand] = useState("Todas")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isAuthenticated] = useState(false) // Simular estado de autenticación

  // Filtrar productos
  const filteredProducts = allProducts.filter(product => {
    const categoryMatch = selectedCategory === "Todos" || product.category === selectedCategory
    const brandMatch = selectedBrand === "Todas" || product.brand === selectedBrand
    return categoryMatch && brandMatch
  })

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            Catálogo de Productos
          </h1>
          <p className="text-muted-foreground">
            Descubre nuestra amplia selección de productos B2B
          </p>
        </motion.div>

        {/* Filtros y controles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          {/* Barra de filtros */}
          <div className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-lg border">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>
            
            {/* Categorías */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Categoría:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Marcas */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Marca:</span>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="px-3 py-1 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            {/* Vista */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-muted-foreground">Vista:</span>
              <div className="flex border rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-accent"}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-accent"}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Resultados y ordenamiento */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando {filteredProducts.length} productos
            </p>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <select className="px-3 py-1 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option>Más relevantes</option>
                <option>Precio: menor a mayor</option>
                <option>Precio: mayor a menor</option>
                <option>Nombre A-Z</option>
                <option>Nombre Z-A</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Grid de productos */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`grid gap-6 ${
            viewMode === "grid" 
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "grid-cols-1"
          }`}
        >
          {filteredProducts.map((product, index) => (
            <motion.div
              key={`${product.name}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
            >
              <ProductCard
                {...product}
                isAuthenticated={isAuthenticated}
                isFavorite={index % 4 === 0}
                className={viewMode === "list" ? "flex flex-row" : ""}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Mensaje si no hay productos */}
        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground text-lg mb-4">
              No se encontraron productos con los filtros seleccionados
            </p>
            <button
              onClick={() => {
                setSelectedCategory("Todos")
                setSelectedBrand("Todas")
              }}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Limpiar filtros
            </button>
          </motion.div>
        )}

        {/* Paginación (placeholder) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex justify-center"
        >
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 border rounded-lg hover:bg-accent transition-colors disabled:opacity-50" disabled>
              Anterior
            </button>
            <button className="px-3 py-2 bg-primary text-primary-foreground rounded-lg">
              1
            </button>
            <button className="px-3 py-2 border rounded-lg hover:bg-accent transition-colors">
              2
            </button>
            <button className="px-3 py-2 border rounded-lg hover:bg-accent transition-colors">
              3
            </button>
            <button className="px-3 py-2 border rounded-lg hover:bg-accent transition-colors">
              Siguiente
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
