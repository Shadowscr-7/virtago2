"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  GraduationCap, 
  Play, 
  Clock, 
  BookOpen,
  Zap,
  Users,
  Package,
  DollarSign,
  FileText,
  Percent,
  Settings,
  Search,
  Filter
} from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useTheme } from "@/contexts/theme-context";

interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  videoUrl: string;
  thumbnail?: string;
  icon: React.ComponentType<{ className?: string }>;
  difficulty: "Principiante" | "Intermedio" | "Avanzado";
}

const tutorials: Tutorial[] = [
  {
    id: "onboarding",
    title: "Primeros Pasos - Onboarding",
    description: "Aprende a configurar tu tienda desde cero. Configuración inicial, primeros productos y personalización básica.",
    category: "Inicio",
    duration: "15 min",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    icon: Zap,
    difficulty: "Principiante"
  },
  {
    id: "clientes-abm",
    title: "Gestión de Clientes",
    description: "Cómo crear, editar y administrar clientes. Importación masiva y organización de tu base de datos.",
    category: "ABM",
    duration: "12 min",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    icon: Users,
    difficulty: "Principiante"
  },
  {
    id: "productos-abm",
    title: "Gestión de Productos",
    description: "Administra tu catálogo de productos. Creación, edición, categorías, variantes e imágenes.",
    category: "ABM",
    duration: "18 min",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    icon: Package,
    difficulty: "Intermedio"
  },
  {
    id: "listas-precios-abm",
    title: "Listas de Precios",
    description: "Configura diferentes listas de precios para distintos tipos de clientes y regiones.",
    category: "ABM",
    duration: "10 min",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    icon: FileText,
    difficulty: "Intermedio"
  },
  {
    id: "precios-abm",
    title: "Gestión de Precios",
    description: "Administra precios por producto, lista y moneda. Importación masiva de precios.",
    category: "ABM",
    duration: "14 min",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    icon: DollarSign,
    difficulty: "Intermedio"
  },
  {
    id: "descuentos-abm",
    title: "Sistema de Descuentos",
    description: "Crea y gestiona descuentos, promociones y reglas de negocio avanzadas.",
    category: "ABM",
    duration: "16 min",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    icon: Percent,
    difficulty: "Avanzado"
  },
  {
    id: "configuracion-general",
    title: "Configuración General",
    description: "Configura aspectos generales de tu tienda: monedas, impuestos, envíos y más.",
    category: "Configuración",
    duration: "20 min",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    icon: Settings,
    difficulty: "Intermedio"
  },
  {
    id: "importacion-datos",
    title: "Importación Masiva de Datos",
    description: "Aprende a importar productos, precios y clientes usando archivos JSON y Excel.",
    category: "Avanzado",
    duration: "15 min",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    icon: BookOpen,
    difficulty: "Avanzado"
  },
];

const categories = ["Todos", "Inicio", "ABM", "Configuración", "Avanzado"];
const difficulties = ["Todos", "Principiante", "Intermedio", "Avanzado"];

export default function TutorialesPage() {
  const { themeColors } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<Tutorial | null>(null);

  // Filtrar tutoriales
  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesCategory = selectedCategory === "Todos" || tutorial.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "Todos" || tutorial.difficulty === selectedDifficulty;
    const matchesSearch = tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tutorial.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  // Obtener color para dificultad
  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case "Principiante": return "#10b981"; // green
      case "Intermedio": return "#f59e0b"; // orange
      case "Avanzado": return "#ef4444"; // red
      default: return themeColors.primary;
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div 
            className="p-4 rounded-2xl"
            style={{
              background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`
            }}
          >
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 
              className="text-3xl font-bold"
              style={{ color: themeColors.text.primary }}
            >
              Tutoriales
            </h1>
            <p style={{ color: themeColors.text.secondary }}>
              Aprende a usar todas las funcionalidades de la plataforma
            </p>
          </div>
        </motion.div>

        {/* Filtros y búsqueda */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl"
          style={{
            background: `linear-gradient(135deg, ${themeColors.surface}80, ${themeColors.surface}70)`,
            borderColor: themeColors.primary + "20"
          }}
        >
          {/* Búsqueda */}
          <div className="mb-6">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: themeColors.primary }}
              />
              <input
                type="text"
                placeholder="Buscar tutoriales..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: themeColors.surface + "50",
                  borderColor: themeColors.primary + "30",
                  color: themeColors.text.primary
                }}
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Categorías */}
            <div className="flex-1">
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: themeColors.text.secondary }}
              >
                <Filter className="w-4 h-4 inline mr-2" />
                Categoría
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className="px-4 py-2 rounded-lg transition-all font-medium"
                    style={{
                      backgroundColor: selectedCategory === category 
                        ? themeColors.primary 
                        : themeColors.surface + "50",
                      color: selectedCategory === category 
                        ? "white" 
                        : themeColors.text.primary,
                      border: `2px solid ${selectedCategory === category ? themeColors.primary : themeColors.primary + "30"}`
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Dificultad */}
            <div className="flex-1">
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: themeColors.text.secondary }}
              >
                Nivel
              </label>
              <div className="flex flex-wrap gap-2">
                {difficulties.map((difficulty) => (
                  <button
                    key={difficulty}
                    onClick={() => setSelectedDifficulty(difficulty)}
                    className="px-4 py-2 rounded-lg transition-all font-medium"
                    style={{
                      backgroundColor: selectedDifficulty === difficulty 
                        ? themeColors.secondary 
                        : themeColors.surface + "50",
                      color: selectedDifficulty === difficulty 
                        ? "white" 
                        : themeColors.text.primary,
                      border: `2px solid ${selectedDifficulty === difficulty ? themeColors.secondary : themeColors.secondary + "30"}`
                    }}
                  >
                    {difficulty}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contador */}
          <div className="mt-4 pt-4 border-t" style={{ borderColor: themeColors.primary + "20" }}>
            <p style={{ color: themeColors.text.secondary }}>
              Mostrando <strong style={{ color: themeColors.primary }}>{filteredTutorials.length}</strong> tutorial{filteredTutorials.length !== 1 ? 'es' : ''}
            </p>
          </div>
        </motion.div>

        {/* Grid de tutoriales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredTutorials.map((tutorial, index) => {
            const IconComponent = tutorial.icon;
            const difficultyColor = getDifficultyColor(tutorial.difficulty);

            return (
              <motion.div
                key={tutorial.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.02, y: -5 }}
                onClick={() => setSelectedVideo(tutorial)}
                className="cursor-pointer backdrop-blur-xl border rounded-2xl overflow-hidden shadow-lg transition-all hover:shadow-2xl"
                style={{
                  background: `linear-gradient(135deg, ${themeColors.surface}90, ${themeColors.surface}80)`,
                  borderColor: themeColors.primary + "20"
                }}
              >
                {/* Thumbnail */}
                <div 
                  className="h-48 relative flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${themeColors.primary}20, ${themeColors.secondary}20)`
                  }}
                >
                  <div
                    className="p-6 rounded-full"
                    style={{
                      backgroundColor: themeColors.surface + "80",
                      color: themeColors.primary
                    }}
                  >
                    <IconComponent className="w-12 h-12" />
                  </div>
                  <div 
                    className="absolute bottom-4 right-4 px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-2"
                    style={{
                      backgroundColor: themeColors.surface + "90"
                    }}
                  >
                    <Clock className="w-4 h-4" color={themeColors.primary} />
                    <span 
                      className="text-sm font-medium"
                      style={{ color: themeColors.text.primary }}
                    >
                      {tutorial.duration}
                    </span>
                  </div>
                  <div 
                    className="absolute top-4 left-4 px-3 py-1 rounded-full backdrop-blur-sm"
                    style={{
                      backgroundColor: difficultyColor + "20",
                      border: `2px solid ${difficultyColor}`
                    }}
                  >
                    <span 
                      className="text-xs font-bold"
                      style={{ color: difficultyColor }}
                    >
                      {tutorial.difficulty}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="mb-3">
                    <span 
                      className="text-xs font-semibold px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: themeColors.accent + "20",
                        color: themeColors.accent
                      }}
                    >
                      {tutorial.category}
                    </span>
                  </div>

                  <h3 
                    className="text-lg font-bold mb-2"
                    style={{ color: themeColors.text.primary }}
                  >
                    {tutorial.title}
                  </h3>

                  <p 
                    className="text-sm mb-4 line-clamp-2"
                    style={{ color: themeColors.text.secondary }}
                  >
                    {tutorial.description}
                  </p>

                  <button
                    className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
                    style={{
                      background: `linear-gradient(45deg, ${themeColors.primary}, ${themeColors.secondary})`,
                      color: "white"
                    }}
                  >
                    <Play className="w-5 h-5" />
                    Ver Tutorial
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Modal de video */}
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedVideo(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl border"
              style={{
                backgroundColor: themeColors.surface,
                borderColor: themeColors.primary + "30"
              }}
            >
              {/* Header del modal */}
              <div 
                className="p-6 border-b"
                style={{ borderColor: themeColors.primary + "20" }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 
                      className="text-2xl font-bold mb-2"
                      style={{ color: themeColors.text.primary }}
                    >
                      {selectedVideo.title}
                    </h2>
                    <p style={{ color: themeColors.text.secondary }}>
                      {selectedVideo.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <span 
                        className="text-sm px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: themeColors.accent + "20",
                          color: themeColors.accent
                        }}
                      >
                        {selectedVideo.category}
                      </span>
                      <span 
                        className="text-sm px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: getDifficultyColor(selectedVideo.difficulty) + "20",
                          color: getDifficultyColor(selectedVideo.difficulty)
                        }}
                      >
                        {selectedVideo.difficulty}
                      </span>
                      <span 
                        className="text-sm flex items-center gap-2"
                        style={{ color: themeColors.text.secondary }}
                      >
                        <Clock className="w-4 h-4" />
                        {selectedVideo.duration}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedVideo(null)}
                    className="p-2 rounded-lg transition-all"
                    style={{
                      backgroundColor: themeColors.primary + "20",
                      color: themeColors.text.primary
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Video */}
              <div className="aspect-video">
                <iframe
                  width="100%"
                  height="100%"
                  src={selectedVideo.videoUrl}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Mensaje si no hay resultados */}
        {filteredTutorials.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <BookOpen 
              className="w-16 h-16 mx-auto mb-4"
              style={{ color: themeColors.text.secondary }}
            />
            <h3 
              className="text-xl font-bold mb-2"
              style={{ color: themeColors.text.primary }}
            >
              No se encontraron tutoriales
            </h3>
            <p style={{ color: themeColors.text.secondary }}>
              Intenta con otros filtros o términos de búsqueda
            </p>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
}
