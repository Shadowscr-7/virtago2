"use client";

import { ReactNode } from "react";
import { SuperadminSidebar } from "./superadmin-sidebar";
import { useTheme } from "@/contexts/theme-context";

interface SuperadminLayoutProps {
  children: ReactNode;
}

export function SuperadminLayout({ children }: SuperadminLayoutProps) {
  const { themeColors } = useTheme();

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: themeColors.background }}>
      <SuperadminSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
