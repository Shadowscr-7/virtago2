"use client";

import { usePathname } from "next/navigation";
import { CartSidebar } from "@/components/cart/cart-sidebar";
import { Navbar } from "@/components/layout/navbar";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <>
      {/* Solo mostrar navbar si NO estamos en rutas de admin */}
      {!isAdminRoute && <Navbar />}
      {children}
      <CartSidebar />
    </>
  );
}
