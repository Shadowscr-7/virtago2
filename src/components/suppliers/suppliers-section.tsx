"use client"

import { useState, useEffect } from "react"

// Import de componentes de suppliers
import { SuppliersHero } from "./suppliers-hero"
import { SuppliersStats } from "./suppliers-stats"
import { SuppliersFilters } from "./suppliers-filters"  
import { SuppliersGrid } from "./suppliers-grid"

interface SupplierFilters {
  search: string
  category: string[]
  location: string[]
  companySize: string[]
  certifications: string[]
  partnershipLevel: string[]
}

// Mock data para proveedores
const mockSuppliers = [
  {
    id: "1",
    name: "TechSolutions Global",
    description: "Proveedor líder en soluciones tecnológicas empresariales con más de 15 años de experiencia en el mercado B2B. Especialistas en infraestructura IT y transformación digital.",
    category: "Tecnología y Software",
    location: "Buenos Aires, Argentina",
    rating: 4.8,
    reviewsCount: 245,
    employees: "201-1000 empleados",
    yearsInBusiness: 15,
    specialties: ["Cloud Computing", "Infraestructura IT", "Desarrollo de Software", "Consultoría Digital"],
    certifications: ["ISO 9001", "ISO 27001", "Microsoft Gold Partner", "AWS Advanced Partner"],
    partnershipLevel: "platinum" as const,
    contact: {
      phone: "+54 11 4567-8900",
      email: "contacto@techsolutions.com.ar",
      website: "https://techsolutions.com.ar"
    },
    logo: "TS",
    responseTime: "2 horas",
    completionRate: 98,
    languages: ["Español", "Inglés", "Portugués"],
    deliveryTime: "5-10 días",
    minOrderValue: "$50,000 USD",
    paymentTerms: ["30 días", "60 días", "Transferencia", "Carta de crédito"]
  },
  {
    id: "2",
    name: "Industrial Manufacturing Corp",
    description: "Fabricante industrial especializado en maquinaria pesada y equipos de producción. Más de 20 años sirviendo a la industria manufacturera en toda Latinoamérica.",
    category: "Manufactura Industrial",
    location: "São Paulo, Brasil",
    rating: 4.6,
    reviewsCount: 189,
    employees: "1000+ empleados",
    yearsInBusiness: 22,
    specialties: ["Maquinaria Industrial", "Equipos de Producción", "Automatización", "Mantenimiento Predictivo"],
    certifications: ["ISO 14001", "OHSAS 18001", "CE Marking", "UL Listed"],
    partnershipLevel: "gold" as const,
    contact: {
      phone: "+55 11 9876-5432",
      email: "vendas@industrial-corp.com.br",
      website: "https://industrial-corp.com.br"
    },
    logo: "IM",
    responseTime: "4 horas",
    completionRate: 95,
    languages: ["Portugués", "Español", "Inglés"],
    deliveryTime: "15-30 días",
    minOrderValue: "$100,000 USD",
    paymentTerms: ["45 días", "90 días", "LC", "Financiamiento"]
  },
  {
    id: "3",
    name: "LogiTrans Solutions",
    description: "Red logística integral con presencia en toda América Latina. Especialistas en cadena de suministro, almacenamiento y distribución para empresas B2B.",
    category: "Servicios Logísticos",
    location: "Ciudad de México, México",
    rating: 4.7,
    reviewsCount: 312,
    employees: "51-200 empleados",
    yearsInBusiness: 12,
    specialties: ["Cadena de Suministro", "Almacenamiento", "Distribución", "Logística Inversa"],
    certifications: ["ISO 9001", "C-TPAT", "BASC", "OEA"],
    partnershipLevel: "silver" as const,
    contact: {
      phone: "+52 55 1234-5678",
      email: "contacto@logitrans.mx",
      website: "https://logitrans.mx"
    },
    logo: "LT",
    responseTime: "1 hora",
    completionRate: 99,
    languages: ["Español", "Inglés"],
    deliveryTime: "3-7 días",
    minOrderValue: "$25,000 USD",
    paymentTerms: ["15 días", "30 días", "Efectivo", "Transferencia"]
  },
  {
    id: "4",
    name: "Construction Materials Pro",
    description: "Proveedor especializado en materiales de construcción de alta calidad. Amplio inventario y capacidad de suministro para proyectos de gran escala.",
    category: "Materiales de Construcción",
    location: "Bogotá, Colombia",
    rating: 4.4,
    reviewsCount: 156,
    employees: "101-500 empleados",
    yearsInBusiness: 18,
    specialties: ["Acero Estructural", "Concreto Especializado", "Materiales Sustentables", "Prefabricados"],
    certifications: ["ISO 9001", "LEED Certified", "NSF International", "Green Building Council"],
    partnershipLevel: "silver" as const,
    contact: {
      phone: "+57 1 345-6789",
      email: "ventas@constructionpro.co",
      website: "https://constructionpro.co"
    },
    logo: "CM",
    responseTime: "6 horas",
    completionRate: 92,
    languages: ["Español", "Inglés"],
    deliveryTime: "7-14 días",
    minOrderValue: "$75,000 USD",
    paymentTerms: ["30 días", "60 días", "Carta de crédito"]
  },
  {
    id: "5",
    name: "MedEquip Healthcare",
    description: "Distribuidor autorizado de equipos médicos de última generación. Especialistas en tecnología sanitaria para hospitales y clínicas privadas.",
    category: "Equipos Médicos",
    location: "Lima, Perú",
    rating: 4.9,
    reviewsCount: 98,
    employees: "11-50 empleados",
    yearsInBusiness: 8,
    specialties: ["Equipos de Diagnóstico", "Tecnología Quirúrgica", "Dispositivos de Monitoreo", "Telemedicina"],
    certifications: ["FDA Approved", "CE Marking", "ISO 13485", "Health Canada"],
    partnershipLevel: "gold" as const,
    contact: {
      phone: "+51 1 567-8901",
      email: "info@medequip.pe",
      website: "https://medequip.pe"
    },
    logo: "ME",
    responseTime: "30 min",
    completionRate: 99,
    languages: ["Español", "Inglés", "Portugués"],
    deliveryTime: "2-5 días",
    minOrderValue: "$30,000 USD",
    paymentTerms: ["Inmediato", "15 días", "30 días"]
  },
  {
    id: "6",
    name: "Chemical Industries SA",
    description: "Fabricante y distribuidor de productos químicos industriales. Más de 25 años proporcionando soluciones químicas seguras y eficientes.",
    category: "Productos Químicos",
    location: "Santiago, Chile",
    rating: 4.5,
    reviewsCount: 234,
    employees: "501-1000 empleados",
    yearsInBusiness: 25,
    specialties: ["Química Industrial", "Productos de Limpieza", "Aditivos Especializados", "Tratamiento de Aguas"],
    certifications: ["ISO 14001", "OHSAS 18001", "Responsible Care", "EPA Registered"],
    partnershipLevel: "platinum" as const,
    contact: {
      phone: "+56 2 2345-6789",
      email: "ventas@chemical.cl",
      website: "https://chemical.cl"
    },
    logo: "CI",
    responseTime: "3 horas",
    completionRate: 96,
    languages: ["Español", "Inglés", "Portugués"],
    deliveryTime: "10-15 días",
    minOrderValue: "$40,000 USD",
    paymentTerms: ["45 días", "60 días", "LC", "Consignación"]
  },
  {
    id: "7",
    name: "Financial Services Group",
    description: "Grupo de servicios financieros especializados en soluciones B2B. Financiamiento, seguros comerciales y servicios de tesorería corporativa.",
    category: "Servicios Financieros",
    location: "Montevideo, Uruguay",
    rating: 4.6,
    reviewsCount: 167,
    employees: "201-500 empleados",
    yearsInBusiness: 30,
    specialties: ["Financiamiento Comercial", "Seguros Empresariales", "Gestión de Riesgos", "Servicios de Tesorería"],
    certifications: ["ISO 27001", "SOX Compliance", "Basel III", "PCI DSS"],
    partnershipLevel: "estratégico" as const,
    contact: {
      phone: "+598 2 456-7890",
      email: "corporate@financialgroup.uy",
      website: "https://financialgroup.uy"
    },
    logo: "FS",
    responseTime: "1 hora",
    completionRate: 98,
    languages: ["Español", "Inglés", "Portugués"],
    deliveryTime: "1-3 días",
    minOrderValue: "$10,000 USD",
    paymentTerms: ["Inmediato", "7 días", "15 días", "30 días"]
  },
  {
    id: "8",
    name: "Digital Marketing Experts",
    description: "Agencia de marketing digital especializada en estrategias B2B. Generación de leads, automatización y analítica avanzada para empresas.",
    category: "Marketing Digital",
    location: "Caracas, Venezuela",
    rating: 4.3,
    reviewsCount: 89,
    employees: "21-50 empleados",
    yearsInBusiness: 6,
    specialties: ["Generación de Leads", "Marketing Automation", "SEO/SEM", "Social Media B2B"],
    certifications: ["Google Partner", "HubSpot Certified", "Facebook Blueprint", "LinkedIn Partner"],
    partnershipLevel: "básico" as const,
    contact: {
      phone: "+58 212 345-6789",
      email: "hello@digitalexperts.ve",
      website: "https://digitalexperts.ve"
    },
    logo: "DM",
    responseTime: "2 horas",
    completionRate: 94,
    languages: ["Español", "Inglés"],
    deliveryTime: "5-10 días",
    minOrderValue: "$5,000 USD",
    paymentTerms: ["15 días", "30 días", "Transferencia"]
  }
]

export function SuppliersSection() {
  const [filters, setFilters] = useState<SupplierFilters>({
    search: "",
    category: [],
    location: [],
    companySize: [],
    certifications: [],
    partnershipLevel: []
  })
  const [filteredSuppliers, setFilteredSuppliers] = useState(mockSuppliers)
  const [isLoading, setIsLoading] = useState(false)

  // Función para filtrar proveedores
  const filterSuppliers = (suppliers: typeof mockSuppliers, filters: SupplierFilters) => {
    return suppliers.filter(supplier => {
      // Filtro de búsqueda por texto
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const matchesSearch = 
          supplier.name.toLowerCase().includes(searchTerm) ||
          supplier.description.toLowerCase().includes(searchTerm) ||
          supplier.specialties.some(specialty => specialty.toLowerCase().includes(searchTerm)) ||
          supplier.category.toLowerCase().includes(searchTerm)
        
        if (!matchesSearch) return false
      }

      // Filtro por categoría
      if (filters.category.length > 0 && !filters.category.includes(supplier.category)) {
        return false
      }

      // Filtro por ubicación
      if (filters.location.length > 0) {
        const supplierLocation = supplier.location.split(', ')[1] || supplier.location
        if (!filters.location.some((loc: string) => supplierLocation.includes(loc))) {
          return false
        }
      }

      // Filtro por tamaño de empresa
      if (filters.companySize.length > 0 && !filters.companySize.includes(supplier.employees)) {
        return false
      }

      // Filtro por certificaciones
      if (filters.certifications.length > 0) {
        const hasRequiredCert = filters.certifications.some((cert: string) =>
          supplier.certifications.some((supplierCert: string) => supplierCert.includes(cert))
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
          return mappedLevel === supplier.partnershipLevel
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
      const filtered = filterSuppliers(mockSuppliers, filters)
      setFilteredSuppliers(filtered)
      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timeout)
  }, [filters])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <SuppliersHero />
      
      {/* Stats Section */}
      <SuppliersStats />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Filters */}
        <div className="mb-8">
          <SuppliersFilters 
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>
        
        {/* Results Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Proveedores Disponibles
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {isLoading ? "Buscando..." : `${filteredSuppliers.length} proveedores encontrados`}
          </p>
        </div>
        
        {/* Suppliers Grid */}
        <SuppliersGrid
          suppliers={filteredSuppliers}
          loading={isLoading}
        />
      </div>
    </div>
  )
}
