"use client";

import { Navbar } from "@/components/layout/navbar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useTheme } from "@/contexts/theme-context";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { themeColors } = useTheme();

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, 
          ${themeColors.surface}40 0%, 
          ${themeColors.primary}10 25%, 
          ${themeColors.secondary}15 50%, 
          ${themeColors.accent}10 75%, 
          ${themeColors.surface}30 100%)`
      }}
    >
      {/* Gradiente de overlay para profundidad */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at top right, 
            ${themeColors.primary}08 0%, 
            transparent 60%, 
            ${themeColors.secondary}12 100%)`
        }}
      />

      {/* Navbar en modo admin - oculta carrito y búsqueda */}
      <div className="relative z-20">
        <Navbar isAdminMode={true} />
      </div>

      <div className="flex relative z-10">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main content */}
        <main className="flex-1 admin-layout-content">
          <div className="h-[calc(100vh-4rem)] overflow-y-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
