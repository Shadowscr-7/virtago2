"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Star,
  Award,
  Users,
  Building,
  ExternalLink,
  MessageCircle,
  Calendar,
  TrendingUp,
  Globe,
  Clock,
} from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  rating: number;
  reviewsCount: number;
  employees: string;
  yearsInBusiness: number;
  specialties: string[];
  certifications: string[];
  partnershipLevel: "básico" | "silver" | "gold" | "platinum" | "estratégico";
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  logo: string;
  responseTime: string;
  completionRate: number;
  languages: string[];
  deliveryTime: string;
  minOrderValue: string;
  paymentTerms: string[];
}

interface SuppliersGridProps {
  suppliers: Supplier[];
  loading?: boolean;
}

interface SupplierModalProps {
  supplier: Supplier;
  isOpen: boolean;
  onClose: () => void;
}

function SupplierModal({ supplier, isOpen, onClose }: SupplierModalProps) {
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
            className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 z-10">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0">
                  {supplier.name.charAt(0)}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        {supplier.name}
                      </h2>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {supplier.rating}
                          </span>
                          <span className="text-slate-600 dark:text-slate-400">
                            ({supplier.reviewsCount} reseñas)
                          </span>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${partnershipColors[supplier.partnershipLevel]}`}
                        >
                          Partner{" "}
                          {supplier.partnershipLevel.charAt(0).toUpperCase() +
                            supplier.partnershipLevel.slice(1)}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <span className="sr-only">Cerrar</span>✕
                    </button>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {supplier.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      {supplier.category}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {supplier.employees}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  Acerca de la Empresa
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {supplier.description}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                  <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {supplier.responseTime}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Tiempo de Respuesta
                  </div>
                </div>
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {supplier.completionRate}%
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Tasa de Cumplimiento
                  </div>
                </div>
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                  <Calendar className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {supplier.yearsInBusiness}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Años en el Mercado
                  </div>
                </div>
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                  <Globe className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {supplier.deliveryTime}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Tiempo de Entrega
                  </div>
                </div>
              </div>

              {/* Specialties */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  Especialidades
                </h3>
                <div className="flex flex-wrap gap-2">
                  {supplier.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  Certificaciones
                </h3>
                <div className="flex flex-wrap gap-2">
                  {supplier.certifications.map((cert, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg text-sm"
                    >
                      <Award className="w-4 h-4" />
                      {cert}
                    </div>
                  ))}
                </div>
              </div>

              {/* Business Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                    Detalles Comerciales
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Pedido Mínimo:
                      </span>
                      <span className="ml-2 text-slate-900 dark:text-white">
                        {supplier.minOrderValue}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Términos de Pago:
                      </span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {supplier.paymentTerms.map((term, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-sm"
                          >
                            {term}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Idiomas:
                      </span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {supplier.languages.map((lang, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-sm"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                    Contacto
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-blue-500" />
                      <span className="text-slate-900 dark:text-white">
                        {supplier.contact.phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-blue-500" />
                      <span className="text-slate-900 dark:text-white">
                        {supplier.contact.email}
                      </span>
                    </div>
                    {supplier.contact.website && (
                      <div className="flex items-center gap-3">
                        <ExternalLink className="w-5 h-5 text-blue-500" />
                        <a
                          href={supplier.contact.website}
                          className="text-blue-500 hover:text-blue-600 transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Sitio Web
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-0.5">
                  <MessageCircle className="w-5 h-5" />
                  Contactar Proveedor
                </button>
                <button className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 px-6 py-3 rounded-xl font-semibold transition-all duration-300">
                  <Calendar className="w-5 h-5" />
                  Programar Reunión
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function SuppliersGrid({
  suppliers,
  loading = false,
}: SuppliersGridProps) {
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );

  const partnershipColors = {
    básico: "from-slate-500 to-slate-600",
    silver: "from-slate-400 to-slate-500",
    gold: "from-yellow-400 to-yellow-500",
    platinum: "from-purple-400 to-purple-500",
    estratégico: "from-emerald-400 to-emerald-500",
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg animate-pulse"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-xl" />
              <div className="flex-1">
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((supplier, index) => (
          <motion.div
            key={supplier.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-slate-200 dark:border-slate-700 cursor-pointer"
            onClick={() => setSelectedSupplier(supplier)}
          >
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-xl font-bold group-hover:scale-110 transition-transform duration-300">
                {supplier.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1 truncate">
                  {supplier.name}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                      {supplier.rating}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      ({supplier.reviewsCount})
                    </span>
                  </div>
                </div>
                <div
                  className={`inline-block px-2 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${partnershipColors[supplier.partnershipLevel]}`}
                >
                  {supplier.partnershipLevel.charAt(0).toUpperCase() +
                    supplier.partnershipLevel.slice(1)}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3 mb-4">
              <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">
                {supplier.description}
              </p>

              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <MapPin className="w-4 h-4" />
                <span>{supplier.location}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Building className="w-4 h-4" />
                <span>{supplier.category}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Users className="w-4 h-4" />
                <span>{supplier.employees}</span>
              </div>
            </div>

            {/* Specialties */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {supplier.specialties.slice(0, 3).map((specialty, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs"
                  >
                    {specialty}
                  </span>
                ))}
                {supplier.specialties.length > 3 && (
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-xs">
                    +{supplier.specialties.length - 3} más
                  </span>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center p-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                  Respuesta
                </div>
                <div className="font-semibold text-sm text-slate-900 dark:text-white">
                  {supplier.responseTime}
                </div>
              </div>
              <div className="text-center p-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                  Cumplimiento
                </div>
                <div className="font-semibold text-sm text-slate-900 dark:text-white">
                  {supplier.completionRate}%
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSupplier(supplier);
                }}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-300"
              >
                Ver Perfil
              </button>
              <button
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center w-10 h-10 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors duration-300"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Supplier Modal */}
      {selectedSupplier && (
        <SupplierModal
          supplier={selectedSupplier}
          isOpen={true}
          onClose={() => setSelectedSupplier(null)}
        />
      )}
    </>
  );
}
