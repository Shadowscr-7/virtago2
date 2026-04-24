"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Award,
  Building,
  Globe,
  ExternalLink,
  ShoppingBag,
  TrendingUp,
  Users,
  Calendar,
} from "lucide-react";
import { useTheme } from "@/contexts/theme-context";

interface Brand {
  id: string;
  name: string;
  logo: string;
  description: string;
  category: string;
  origin: string;
  founded: number;
  rating: number;
  reviewsCount: number;
  productsCount: number;
  partnershipLevel: "básico" | "silver" | "gold" | "platinum" | "estratégico";
  certifications: string[];
  website: string;
  specialties: string[];
  marketShare: string;
  globalPresence: string[];
}

interface BrandsGridProps {
  brands: Brand[];
  loading?: boolean;
}

interface BrandModalProps {
  brand: Brand;
  isOpen: boolean;
  onClose: () => void;
}

function BrandModal({ brand, isOpen, onClose }: BrandModalProps) {
  const { themeColors } = useTheme();
  const partnershipColors = {
    básico: "from-slate-500 to-slate-600",
    silver: "from-slate-400 to-slate-500",
    gold: "from-yellow-400 to-yellow-500",
    platinum: "from-purple-400 to-purple-500",
    estratégico: "from-emerald-400 to-emerald-500",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 z-10">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0" style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}>
                  {brand.name.charAt(0)}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">
                        {brand.name}
                      </h2>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                          <span className="font-semibold text-slate-900">
                            {brand.rating}
                          </span>
                          <span className="text-slate-600">
                            ({brand.reviewsCount} reseñas)
                          </span>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${partnershipColors[brand.partnershipLevel]}`}
                        >
                          Partner{" "}
                          {brand.partnershipLevel.charAt(0).toUpperCase() +
                            brand.partnershipLevel.slice(1)}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <span className="sr-only">Cerrar</span>✕
                    </button>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      {brand.origin}
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      {brand.category}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Fundada en {brand.founded}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  Acerca de la Marca
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {brand.description}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <ShoppingBag className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                  <div className="font-semibold text-slate-900">
                    {brand.productsCount.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-600">
                    Productos
                  </div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <div className="font-semibold text-slate-900">
                    {brand.marketShare}
                  </div>
                  <div className="text-xs text-slate-600">
                    Market Share
                  </div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <Users className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <div className="font-semibold text-slate-900">
                    {brand.reviewsCount}
                  </div>
                  <div className="text-xs text-slate-600">
                    Reseñas
                  </div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <Globe className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <div className="font-semibold text-slate-900">
                    {brand.globalPresence.length}
                  </div>
                  <div className="text-xs text-slate-600">
                    Países
                  </div>
                </div>
              </div>

              {/* Specialties */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  Especialidades
                </h3>
                <div className="flex flex-wrap gap-2">
                  {brand.specialties.map((specialty, index) => (
<span
                      key={index}
                      className="px-3 py-1 rounded-full text-sm"
                      style={{ backgroundColor: `${themeColors.primary}18`, color: themeColors.primary }}
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  Certificaciones
                </h3>
                <div className="flex flex-wrap gap-2">
                  {brand.certifications.map((cert, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm"
                    >
                      <Award className="w-4 h-4" />
                      {cert}
                    </div>
                  ))}
                </div>
              </div>

              {/* Global Presence */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  Presencia Global
                </h3>
                <div className="flex flex-wrap gap-2">
                  {brand.globalPresence.map((country, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm"
                    >
                      {country}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-slate-200">
                <button className="flex-1 flex items-center justify-center gap-2 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-0.5" style={{ backgroundColor: themeColors.primary }}>
                  <ShoppingBag className="w-5 h-5" />
                  Ver Productos
                </button>
                <a
                  href={brand.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                >
                  <ExternalLink className="w-5 h-5" />
                  Sitio Web
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function BrandsGrid({ brands, loading = false }: BrandsGridProps) {
  const { themeColors } = useTheme();
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  const partnershipColors = {
    básico: "from-slate-500 to-slate-600",
    silver: "from-slate-400 to-slate-500",
    gold: "from-yellow-400 to-yellow-500",
    platinum: "from-purple-400 to-purple-500",
    estratégico: "from-emerald-400 to-emerald-500",
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 shadow-lg animate-pulse"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-slate-200 rounded-xl" />
              <div className="flex-1">
                <div className="h-5 bg-slate-200 rounded mb-2" />
                <div className="h-4 bg-slate-200 rounded w-2/3" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-200 rounded" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {brands.map((brand, index) => (
          <motion.div
            key={brand.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-slate-200 cursor-pointer"
            onClick={() => setSelectedBrand(brand)}
          >
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-xl font-bold group-hover:scale-110 transition-transform duration-300" style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}>
                {brand.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-lg mb-1 truncate">
                  {brand.name}
                </h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-semibold text-sm text-slate-700">
                      {brand.rating}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({brand.reviewsCount})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3 mb-4">
              <p className="text-slate-600 text-sm line-clamp-2">
                {brand.description}
              </p>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Globe className="w-4 h-4" />
                <span>{brand.origin}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Building className="w-4 h-4" />
                <span>{brand.category}</span>
              </div>
            </div>

            {/* Partnership Level */}
            <div className="mb-4">
              <div
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${partnershipColors[brand.partnershipLevel]}`}
              >
                Partner{" "}
                {brand.partnershipLevel.charAt(0).toUpperCase() +
                  brand.partnershipLevel.slice(1)}
              </div>
            </div>

            {/* Specialties */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {brand.specialties.slice(0, 2).map((specialty, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 rounded text-xs"
                    style={{ backgroundColor: `${themeColors.primary}18`, color: themeColors.primary }}
                  >
                    {specialty}
                  </span>
                ))}
                {brand.specialties.length > 2 && (
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                    +{brand.specialties.length - 2} más
                  </span>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center p-2 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-600 mb-1">
                  Productos
                </div>
                <div className="font-semibold text-sm text-slate-900">
                  {brand.productsCount.toLocaleString()}
                </div>
              </div>
              <div className="text-center p-2 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-600 mb-1">
                  Fundada
                </div>
                <div className="font-semibold text-sm text-slate-900">
                  {brand.founded}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedBrand(brand);
                }}
                className="flex-1 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-300"
                style={{ backgroundColor: themeColors.primary }}
              >
                Ver Detalles
              </button>
              <button
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center w-10 h-10 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors duration-300"
              >
                <ShoppingBag className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Brand Modal */}
      {selectedBrand && (
        <BrandModal
          brand={selectedBrand}
          isOpen={true}
          onClose={() => setSelectedBrand(null)}
        />
      )}
    </>
  );
}
