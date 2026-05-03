"use client";

import { Navbar } from "@/components/layout/navbar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundColor: "#ffffff"
      }}
    >
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
