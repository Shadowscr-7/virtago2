import { ProductDetailSection } from "@/components/product-detail/product-detail-section"
import { notFound } from "next/navigation"

// This would typically come from a database or API
const getProductById = async (id: string) => {
  // Mock product data - in real app this would be a database query
  const products = [
    {
      id: "1",
      name: "iPhone 15 Pro Max 256GB",
      brand: "Apple",
      supplier: "TechDistributor Corp",
      images: [
        "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&h=800&fit=crop&auto=format&q=80",
        "https://images.unsplash.com/photo-1695048004047-6bb5ae5561a5?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1695048004047-6bb5ae5561a5?w=800&h=800&fit=crop&auto=format&q=80"
      ],
      price: 1299,
      originalPrice: 1499,
      description: "El iPhone más avanzado hasta la fecha con el chip A17 Pro, sistema de cámaras Pro revolucionario y estructura de titanio de grado aeroespacial.",
      longDescription: "El iPhone 15 Pro Max redefine lo que es posible en un smartphone. Con el chip A17 Pro construido en tecnología de 3 nanómetros, experimentarás un rendimiento sin precedentes para gaming, creación de contenido y aplicaciones profesionales. El sistema de cámaras Pro con lente de 120mm permite capturar imágenes con una calidad excepcional, mientras que la estructura de titanio ofrece resistencia y ligereza incomparables.",
      category: "Smartphones",
      subcategory: "iPhone",
      inStock: true,
      stockQuantity: 25,
      rating: 4.8,
      reviews: 2847,
      tags: ["Premium", "5G", "Cámara Pro", "Titanio"],
      specifications: {
        "Pantalla": "6.7 pulgadas Super Retina XDR",
        "Procesador": "Chip A17 Pro",
        "Almacenamiento": "256GB",
        "Cámara": "Sistema de cámaras Pro de 48MP",
        "Batería": "Hasta 29 horas de reproducción de video",
        "Material": "Titanio de grado aeroespacial",
        "Resistencia": "IP68",
        "Conectividad": "5G, Wi-Fi 6E, Bluetooth 5.3",
        "Sistema": "iOS 17",
        "Colores": "Titanio Natural, Azul, Blanco, Negro"
      },
      features: [
        "Chip A17 Pro con GPU de 6 núcleos",
        "Sistema de cámaras Pro con teleobjetivo de 120mm",
        "Pantalla Super Retina XDR de 6.7 pulgadas",
        "Estructura de titanio ultraligera",
        "Resistente al agua IP68",
        "Batería de todo el día",
        "Conector USB-C",
        "Face ID avanzado"
      ],
      warranty: "1 año de garantía limitada Apple",
      shipping: {
        free: true,
        estimatedDays: "2-3 días hábiles",
        cost: 0
      },
      supplier_info: {
        name: "TechDistributor Corp",
        rating: 4.9,
        reviews: 15420,
        response_time: "< 2 horas",
        verified: true
      }
    },
    {
      id: "2", 
      name: "Samsung Galaxy S24 Ultra 512GB",
      brand: "Samsung",
      supplier: "Samsung Electronics",
      images: [
        "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&h=800&fit=crop&auto=format&q=80",
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop&auto=format&q=80"
      ],
      price: 1399,
      originalPrice: 1599,
      description: "Smartphone premium con S Pen integrado, cámara de 200MP y pantalla Dynamic AMOLED 2X de 6.8 pulgadas.",
      longDescription: "El Galaxy S24 Ultra representa la cumbre de la innovación móvil de Samsung. Equipado con una cámara principal de 200MP y zoom óptico de hasta 10x, captura cada detalle con claridad excepcional. El S Pen integrado transforma tu dispositivo en una herramienta de productividad completa, perfecta para tomar notas, dibujar y controlar presentaciones.",
      category: "Smartphones",
      subcategory: "Galaxy",
      inStock: true,
      stockQuantity: 18,
      rating: 4.7,
      reviews: 1923,
      tags: ["S Pen", "200MP", "Zoom 10x", "Premium"],
      specifications: {
        "Pantalla": "6.8 pulgadas Dynamic AMOLED 2X",
        "Procesador": "Snapdragon 8 Gen 3",
        "Almacenamiento": "512GB",
        "RAM": "12GB",
        "Cámara": "200MP + 50MP + 12MP + 10MP",
        "Batería": "5000mAh con carga rápida 45W",
        "S Pen": "Incluido con latencia ultra baja",
        "Resistencia": "IP68",
        "Conectividad": "5G, Wi-Fi 7, Bluetooth 5.3",
        "Sistema": "Android 14 con One UI 6.1"
      },
      features: [
        "Cámara principal de 200MP con zoom óptico 10x",
        "S Pen con latencia ultra baja",
        "Pantalla Dynamic AMOLED 2X de 120Hz",
        "Batería de 5000mAh con carga rápida",
        "Procesador Snapdragon 8 Gen 3",
        "12GB de RAM + 512GB de almacenamiento",
        "Resistente al agua y polvo IP68",
        "Samsung Galaxy AI integrada"
      ],
      warranty: "2 años de garantía Samsung",
      shipping: {
        free: true,
        estimatedDays: "1-2 días hábiles",
        cost: 0
      },
      supplier_info: {
        name: "Samsung Electronics",
        rating: 4.8,
        reviews: 28640,
        response_time: "< 1 hora",
        verified: true
      }
    }
  ]
  
  return products.find(p => p.id === id)
}

interface ProductPageProps {
  params: {
    id: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <ProductDetailSection product={product} />
    </div>
  )
}
