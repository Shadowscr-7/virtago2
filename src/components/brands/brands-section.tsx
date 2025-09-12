"use client"

import { useState, useEffect } from "react"
import { BrandsHero } from "./brands-hero"
import { BrandsFilters } from "./brands-filters"
import { BrandsGrid } from "./brands-grid"

interface BrandsFilters {
  search: string
  category: string[]
  origin: string[]
  certification: string[]
  partnershipLevel: string[]
}

// Mock data para marcas
const mockBrands = [
  {
    id: "1",
    name: "Apple",
    logo: "AP",
    description: "Líder mundial en tecnología de consumo, conocida por sus productos innovadores como iPhone, iPad, Mac y servicios digitales premium.",
    category: "Tecnología",
    origin: "Estados Unidos",
    founded: 1976,
    rating: 4.8,
    reviewsCount: 45672,
    productsCount: 1250,
    partnershipLevel: "platinum" as const,
    certifications: ["ISO 9001", "ISO 14001", "Energy Star", "EPEAT Gold"],
    website: "https://apple.com",
    specialties: ["Smartphones", "Computadoras", "Tablets", "Wearables", "Software"],
    marketShare: "23.4%",
    globalPresence: ["Estados Unidos", "Reino Unido", "Alemania", "Japón", "China", "Australia", "Canadá", "Francia"]
  },
  {
    id: "2", 
    name: "Samsung",
    logo: "SA",
    description: "Conglomerado tecnológico surcoreano líder en electrónicos de consumo, semiconductores y displays para el mercado global.",
    category: "Electrónicos",
    origin: "Corea del Sur",
    founded: 1938,
    rating: 4.6,
    reviewsCount: 38945,
    productsCount: 2840,
    partnershipLevel: "platinum" as const,
    certifications: ["ISO 9001", "ISO 14001", "OHSAS 18001", "Energy Star"],
    website: "https://samsung.com",
    specialties: ["Smartphones", "TV", "Electrodomésticos", "Semiconductores", "Displays"],
    marketShare: "20.1%",
    globalPresence: ["Corea del Sur", "Estados Unidos", "China", "India", "Brasil", "Alemania", "Reino Unido", "Vietnam"]
  },
  {
    id: "3",
    name: "Microsoft",
    logo: "MS",
    description: "Gigante del software y servicios en la nube, creador de Windows, Office y Azure, líder en productividad empresarial.",
    category: "Tecnología",
    origin: "Estados Unidos", 
    founded: 1975,
    rating: 4.7,
    reviewsCount: 29876,
    productsCount: 890,
    partnershipLevel: "estratégico" as const,
    certifications: ["ISO 27001", "SOC 2", "FedRAMP", "HIPAA"],
    website: "https://microsoft.com",
    specialties: ["Software", "Cloud Computing", "Productividad", "Gaming", "IA"],
    marketShare: "15.8%",
    globalPresence: ["Estados Unidos", "India", "Irlanda", "Singapur", "Brasil", "Canadá", "Japón", "Australia"]
  },
  {
    id: "4",
    name: "Sony",
    logo: "SO",
    description: "Corporación japonesa pionera en entretenimiento y electrónicos, famosa por PlayStation, cámaras y audio de alta calidad.",
    category: "Electrónicos",
    origin: "Japón",
    founded: 1946,
    rating: 4.5,
    reviewsCount: 22134,
    productsCount: 1680,
    partnershipLevel: "gold" as const,
    certifications: ["ISO 9001", "ISO 14001", "Energy Star", "RoHS"],
    website: "https://sony.com",
    specialties: ["Gaming", "Audio", "Cámaras", "Entretenimiento", "Electrónicos"],
    marketShare: "8.9%",
    globalPresence: ["Japón", "Estados Unidos", "Reino Unido", "Alemania", "China", "India", "Brasil", "México"]
  },
  {
    id: "5",
    name: "Nike",
    logo: "NK",
    description: "Marca global líder en calzado deportivo, ropa atlética e innovación en performance, inspirando a atletas de todo el mundo.",
    category: "Deportes y Fitness",
    origin: "Estados Unidos",
    founded: 1964,
    rating: 4.4,
    reviewsCount: 18967,
    productsCount: 3420,
    partnershipLevel: "gold" as const,
    certifications: ["Better Cotton Initiative", "Sustainable Apparel Coalition", "Cradle to Cradle"],
    website: "https://nike.com",
    specialties: ["Calzado Deportivo", "Ropa Atlética", "Accesorios", "Tecnología Deportiva"],
    marketShare: "27.3%",
    globalPresence: ["Estados Unidos", "China", "Europa", "Brasil", "India", "Japón", "México", "Canadá"]
  },
  {
    id: "6",
    name: "BMW",
    logo: "BM",
    description: "Fabricante alemán de automóviles de lujo y motocicletas, reconocido por su ingeniería de precisión y diseño innovador.",
    category: "Automotriz",
    origin: "Alemania",
    founded: 1916,
    rating: 4.6,
    reviewsCount: 15432,
    productsCount: 450,
    partnershipLevel: "platinum" as const,
    certifications: ["ISO 9001", "ISO 14001", "IATF 16949", "ISO 50001"],
    website: "https://bmw.com",
    specialties: ["Automóviles de Lujo", "Vehículos Eléctricos", "Motocicletas", "Servicios de Movilidad"],
    marketShare: "4.8%",
    globalPresence: ["Alemania", "Estados Unidos", "China", "Reino Unido", "Brasil", "India", "Sudáfrica", "México"]
  },
  {
    id: "7",
    name: "IKEA",
    logo: "IK",
    description: "Retailer sueco de muebles y artículos para el hogar, conocido por su diseño funcional, calidad y precios accesibles.",
    category: "Hogar y Jardín",
    origin: "Suecia",
    founded: 1943,
    rating: 4.3,
    reviewsCount: 24681,
    productsCount: 5680,
    partnershipLevel: "gold" as const,
    certifications: ["FSC Certified", "GREENGUARD", "OEKO-TEX", "ISO 14001"],
    website: "https://ikea.com",
    specialties: ["Muebles", "Decoración", "Organización", "Cocina", "Dormitorio"],
    marketShare: "9.1%",
    globalPresence: ["Suecia", "Alemania", "Estados Unidos", "Francia", "Reino Unido", "China", "Japón", "Australia"]
  },
  {
    id: "8",
    name: "L'Oréal",
    logo: "LO",
    description: "Líder mundial en cosméticos y belleza, ofreciendo productos innovadores para el cuidado personal y profesional.",
    category: "Salud y Belleza",
    origin: "Francia",
    founded: 1909,
    rating: 4.2,
    reviewsCount: 31245,
    productsCount: 4230,
    partnershipLevel: "silver" as const,
    certifications: ["ISO 14001", "Cradle to Cradle", "PETA Certified", "Ecocert"],
    website: "https://loreal.com",
    specialties: ["Cosméticos", "Cuidado del Cabello", "Cuidado de la Piel", "Fragancias", "Maquillaje"],
    marketShare: "14.2%",
    globalPresence: ["Francia", "Estados Unidos", "China", "Brasil", "India", "Japón", "Alemania", "Reino Unido"]
  }
]

export function BrandsSection() {
  const [filters, setFilters] = useState<BrandsFilters>({
    search: "",
    category: [],
    origin: [],
    certification: [],
    partnershipLevel: []
  })
  const [filteredBrands, setFilteredBrands] = useState(mockBrands)
  const [isLoading, setIsLoading] = useState(false)

  // Función para filtrar marcas
  const filterBrands = (brands: typeof mockBrands, filters: BrandsFilters) => {
    return brands.filter(brand => {
      // Filtro de búsqueda por texto
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const matchesSearch = 
          brand.name.toLowerCase().includes(searchTerm) ||
          brand.description.toLowerCase().includes(searchTerm) ||
          brand.specialties.some((specialty: string) => specialty.toLowerCase().includes(searchTerm)) ||
          brand.category.toLowerCase().includes(searchTerm)
        
        if (!matchesSearch) return false
      }

      // Filtro por categoría
      if (filters.category.length > 0 && !filters.category.includes(brand.category)) {
        return false
      }

      // Filtro por origen
      if (filters.origin.length > 0 && !filters.origin.includes(brand.origin)) {
        return false
      }

      // Filtro por certificaciones
      if (filters.certification.length > 0) {
        const hasRequiredCert = filters.certification.some((cert: string) =>
          brand.certifications.some((brandCert: string) => brandCert.includes(cert))
        )
        if (!hasRequiredCert) return false
      }

      // Filtro por nivel de partnership
      if (filters.partnershipLevel.length > 0) {
        const partnershipMap: {[key: string]: string} = {
          "Partner Básico": "básico",
          "Partner Silver": "silver", 
          "Partner Gold": "gold",
          "Partner Platinum": "platinum",
          "Partner Estratégico": "estratégico"
        }
        
        const hasRequiredLevel = filters.partnershipLevel.some((level: string) => {
          const mappedLevel = partnershipMap[level]
          return mappedLevel === brand.partnershipLevel
        })
        if (!hasRequiredLevel) return false
      }

      return true
    })
  }

  // Efecto para aplicar filtros
  useEffect(() => {
    setIsLoading(true)
    
    // Simular un pequeño delay para mostrar el loading
    const timeout = setTimeout(() => {
      const filtered = filterBrands(mockBrands, filters)
      setFilteredBrands(filtered)
      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timeout)
  }, [filters])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <BrandsHero />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Filters */}
        <div className="mb-8">
          <BrandsFilters 
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>
        
        {/* Results Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Marcas Disponibles
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {isLoading ? "Buscando..." : `${filteredBrands.length} marcas encontradas`}
          </p>
        </div>
        
        {/* Brands Grid */}
        <BrandsGrid
          brands={filteredBrands}
          loading={isLoading}
        />
      </div>
    </div>
  )
}
