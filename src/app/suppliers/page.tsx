import { Navbar } from "@/components/layout/navbar"
import { SuppliersSection } from "@/components/suppliers/suppliers-section"

export default function SuppliersPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <SuppliersSection />
    </div>
  )
}
