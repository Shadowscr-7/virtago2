import { ThemeDemo } from "@/components/ui/theme-demo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demostración de Temas | Virtago",
  description:
    "Explora los diferentes temas y paletas de colores disponibles en Virtago",
};

export default function ThemeDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Demostración de Temas
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explora cómo se ven los diferentes elementos de la interfaz con cada
            tema. Utiliza el selector de temas en la barra de navegación para
            cambiar entre estilos.
          </p>
        </div>

        <ThemeDemo />
      </div>
    </div>
  );
}
