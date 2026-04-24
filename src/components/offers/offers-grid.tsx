"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Eye, ShoppingCart, Bookmark, Timer } from "lucide-react";
import Image from "next/image";
import { useTheme } from "@/contexts/theme-context";

interface Offer {
  id: string;
  title: string;
  brand: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  stockLeft: number;
  timeLeft: {
    days: number;
    hours: number;
    minutes: number;
  };
  isFlashSale: boolean;
  isFeatured: boolean;
  offerType: string;
  description: string;
  minQuantity: number;
  maxQuantity: number;
  savedAmount: number;
}

interface OffersGridProps {
  offers: Offer[];
  isLoading?: boolean;
}

export function OffersGrid({ offers, isLoading = false }: OffersGridProps) {
  const { themeColors } = useTheme();
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  const formatTimeLeft = (timeLeft: {
    days: number;
    hours: number;
    minutes: number;
  }) => {
    if (timeLeft.days > 0) {
      return `${timeLeft.days}d ${timeLeft.hours}h`;
    } else if (timeLeft.hours > 0) {
      return `${timeLeft.hours}h ${timeLeft.minutes}m`;
    } else {
      return `${timeLeft.minutes}m`;
    }
  };

  const getUrgencyColor = (timeLeft: {
    days: number;
    hours: number;
    minutes: number;
  }) => {
    const totalMinutes =
      timeLeft.days * 24 * 60 + timeLeft.hours * 60 + timeLeft.minutes;
    if (totalMinutes < 60) return "text-red-500 bg-red-100";
    if (totalMinutes < 360)
      return "text-orange-500 bg-orange-100";
    return "text-green-500 bg-green-100";
  };

  const getOfferTypeStyle = (offerType: string) => {
    const styles = {
      "Flash Sale": "bg-gradient-to-r from-red-500 to-orange-500 text-white",
      "Oferta del Día":
        "bg-gradient-to-r from-blue-500 to-purple-500 text-white",
      "Descuento por Volumen":
        "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
      Liquidación: "bg-gradient-to-r from-gray-600 to-gray-700 text-white",
      "Black Friday": "bg-gradient-to-r from-gray-900 to-black text-white",
      "Cyber Monday": "bg-gradient-to-r from-cyan-500 to-blue-600 text-white",
      "Fin de Temporada":
        "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
      Lanzamiento: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white",
    };
    return (
      styles[offerType as keyof typeof styles] || "bg-slate-500 text-white"
    );
  };

  const handleQuantityChange = (offerId: string, quantity: number) => {
    setQuantities((prev) => ({
      ...prev,
      [offerId]: quantity,
    }));
  };

  const OfferCard = ({ offer }: { offer: Offer }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="group relative bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500"
    >
      {/* Offer Type Badge */}
      <div className="absolute top-4 left-4 z-10">
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${getOfferTypeStyle(offer.offerType)}`}
        >
          {offer.offerType}
        </span>
      </div>

      {/* Featured Badge */}
      {offer.isFeatured && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-yellow-400 text-yellow-900 p-2 rounded-full">
            <Star className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Discount Badge */}
      <div className="absolute top-16 right-4 z-10">
        <div className="bg-red-500 text-white px-3 py-1 rounded-full font-bold text-lg">
          -{offer.discountPercentage}%
        </div>
      </div>

      {/* Image Container */}
      <div className="relative h-56 overflow-hidden">
        <Image
          src={offer.image}
          alt={offer.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {offer.isFlashSale && (
          <div className="absolute inset-0 bg-gradient-to-t from-red-500/20 to-transparent" />
        )}

        {/* Timer Overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-sm ${getUrgencyColor(offer.timeLeft)}`}
          >
            <Timer className="w-4 h-4" />
            <span className="font-bold text-sm">
              {formatTimeLeft(offer.timeLeft)}
            </span>
            <span className="text-xs opacity-75">restante</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Brand and Title */}
        <div className="mb-3">
          <p className="text-sm font-medium mb-1" style={{ color: themeColors.primary }}>
            {offer.brand}
          </p>
          <h3 className="font-bold text-lg text-slate-900 line-clamp-2 leading-tight">
            {offer.title}
          </h3>
        </div>

        {/* Rating and Reviews */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-sm text-slate-900">
              {offer.rating}
            </span>
          </div>
          <span className="text-xs text-slate-500">
            ({offer.reviews} reseñas)
          </span>
        </div>

        {/* Pricing */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              ${offer.discountedPrice.toLocaleString()}
            </span>
            <span className="text-lg text-slate-400 line-through">
              ${offer.originalPrice.toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-green-600 font-medium">
            Ahorras ${offer.savedAmount.toLocaleString()}
          </p>
        </div>

        {/* Stock Info */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">
              Stock disponible:
            </span>
            <span
              className={`font-semibold ${
                offer.stockLeft < 10
                  ? "text-red-500"
                  : offer.stockLeft < 50
                    ? "text-orange-500"
                    : "text-green-500"
              }`}
            >
              {offer.stockLeft} unidades
            </span>
          </div>
          <div className="mt-2 bg-slate-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                offer.stockLeft < 10
                  ? "bg-red-500"
                  : offer.stockLeft < 50
                    ? "bg-orange-500"
                    : "bg-green-500"
              }`}
              style={{
                width: `${Math.min((offer.stockLeft / 100) * 100, 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => setSelectedOffer(offer)}
            className="flex-1 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-300 flex items-center justify-center gap-2"
            style={{ backgroundColor: themeColors.primary }}
          >
            <Eye className="w-4 h-4" />
            Ver Oferta
          </button>
          <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-3 rounded-xl transition-colors duration-300">
            <Bookmark className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-slate-300 h-56 rounded-t-2xl" />
            <div className="bg-white p-6 rounded-b-2xl space-y-4">
              <div className="h-4 bg-slate-300 rounded w-3/4" />
              <div className="h-6 bg-slate-300 rounded" />
              <div className="h-4 bg-slate-300 rounded w-1/2" />
              <div className="h-8 bg-slate-300 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
        {offers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </div>

      {/* Offer Detail Modal */}
      <AnimatePresence>
        {selectedOffer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedOffer(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                {/* Image Section */}
                <div className="space-y-4">
                  <div className="relative h-80 rounded-2xl overflow-hidden">
                    <Image
                      src={selectedOffer.image}
                      alt={selectedOffer.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${getOfferTypeStyle(selectedOffer.offerType)}`}
                      >
                        {selectedOffer.offerType}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <div className="bg-red-500 text-white px-3 py-1 rounded-full font-bold text-lg">
                        -{selectedOffer.discountPercentage}%
                      </div>
                    </div>
                  </div>

                  {/* Timer */}
                  <div
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl ${getUrgencyColor(selectedOffer.timeLeft)}`}
                  >
                    <Timer className="w-5 h-5" />
                    <span className="font-bold text-lg">
                      ⏰ {formatTimeLeft(selectedOffer.timeLeft)} restante
                    </span>
                  </div>
                </div>

                {/* Details Section */}
                <div className="space-y-6">
                  <div>
                    <p className="text-lg font-medium mb-2" style={{ color: themeColors.primary }}>
                      {selectedOffer.brand}
                    </p>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">
                      {selectedOffer.title}
                    </h2>
                    <p className="text-slate-600">
                      {selectedOffer.description}
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-lg text-slate-900">
                        {selectedOffer.rating}
                      </span>
                    </div>
                    <span className="text-slate-500">
                      ({selectedOffer.reviews} reseñas)
                    </span>
                  </div>

                  {/* Pricing */}
                  <div className="bg-slate-50 p-6 rounded-xl">
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-4xl font-bold text-slate-900">
                        ${selectedOffer.discountedPrice.toLocaleString()}
                      </span>
                      <span className="text-2xl text-slate-400 line-through">
                        ${selectedOffer.originalPrice.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-lg text-green-600 font-semibold">
                      ¡Ahorras ${selectedOffer.savedAmount.toLocaleString()}!
                    </p>
                  </div>

                  {/* Stock and Quantity */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-900">
                        Stock disponible:
                      </span>
                      <span
                        className={`font-bold ${
                          selectedOffer.stockLeft < 10
                            ? "text-red-500"
                            : selectedOffer.stockLeft < 50
                              ? "text-orange-500"
                              : "text-green-500"
                        }`}
                      >
                        {selectedOffer.stockLeft} unidades
                      </span>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-900 mb-2">
                        Cantidad (mín. {selectedOffer.minQuantity}, máx.{" "}
                        {selectedOffer.maxQuantity})
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            const current =
                              quantities[selectedOffer.id] ||
                              selectedOffer.minQuantity;
                            if (current > selectedOffer.minQuantity) {
                              handleQuantityChange(
                                selectedOffer.id,
                                current - 1,
                              );
                            }
                          }}
                          className="w-10 h-10 rounded-lg bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold text-slate-700"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={selectedOffer.minQuantity}
                          max={selectedOffer.maxQuantity}
                          value={
                            quantities[selectedOffer.id] ||
                            selectedOffer.minQuantity
                          }
                          onChange={(e) => {
                            const value = Math.max(
                              selectedOffer.minQuantity,
                              Math.min(
                                selectedOffer.maxQuantity,
                                parseInt(e.target.value) ||
                                  selectedOffer.minQuantity,
                              ),
                            );
                            handleQuantityChange(selectedOffer.id, value);
                          }}
                          className="w-20 h-10 text-center border border-slate-300 rounded-lg bg-white text-slate-900"
                        />
                        <button
                          onClick={() => {
                            const current =
                              quantities[selectedOffer.id] ||
                              selectedOffer.minQuantity;
                            if (current < selectedOffer.maxQuantity) {
                              handleQuantityChange(
                                selectedOffer.id,
                                current + 1,
                              );
                            }
                          }}
                          className="w-10 h-10 rounded-lg bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold text-slate-700"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4">
                    <button className="flex-1 text-white font-bold py-4 px-6 rounded-xl transition-colors duration-300 flex items-center justify-center gap-2" style={{ backgroundColor: themeColors.primary }}>
                      <ShoppingCart className="w-5 h-5" />
                      Agregar al Carrito
                    </button>
                    <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-4 rounded-xl transition-colors duration-300">
                      <Bookmark className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
