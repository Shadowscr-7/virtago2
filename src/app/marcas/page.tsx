import { Navbar } from "@/components/layout/navbar"
import { BrandsSection } from "@/components/brands/brands-section"

export default function BrandsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <BrandsSection />
    </div>
  )
}
