"use client"

import { CartSidebar } from "@/components/cart/cart-sidebar"
import { Navbar } from "@/components/layout/navbar"

interface ClientLayoutProps {
  children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <>
      <Navbar />
      {children}
      <CartSidebar />
    </>
  )
}
