"use client";

import { motion } from "framer-motion";
import { MapPin, Navigation, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";

interface ClientLocationData {
  address: string;
  city: string;
  neighborhood: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

interface ClientLocationMapProps {
  clientData: ClientLocationData;
}

export function ClientLocationMap({ clientData }: ClientLocationMapProps) {
  const hasCoordinates = clientData.latitude && clientData.longitude;

  // Generate grid pattern only on client to avoid hydration mismatch
  const [gridCells, setGridCells] = useState<Array<{
    id: number;
    backgroundColor: string;
    opacity: number;
  }>>([]);

  useEffect(() => {
    setGridCells(
      Array.from({ length: 48 }, (_, i) => ({
        id: i,
        backgroundColor: Math.random() > 0.7 ? "#10b981" : "transparent",
        opacity: Math.random() * 0.3,
      }))
    );
  }, []);

  const openInGoogleMaps = () => {
    if (hasCoordinates) {
      const url = `https://www.google.com/maps?q=${clientData.latitude},${clientData.longitude}`;
      window.open(url, "_blank");
    } else {
      const address = `${clientData.address}, ${clientData.neighborhood}, ${clientData.city}, ${clientData.country}`;
      const url = `https://www.google.com/maps/search/${encodeURIComponent(address)}`;
      window.open(url, "_blank");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white/70 dark:bg-slate-800/70 rounded-2xl border border-white/30 p-6 shadow-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-xl border border-teal-500/30">
            <MapPin className="w-6 h-6 text-teal-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Ubicación
          </h3>
        </div>
        <button
          onClick={openInGoogleMaps}
          className="p-2 bg-teal-500/10 hover:bg-teal-500/20 rounded-lg transition-all duration-200 group"
          title="Abrir en Google Maps"
        >
          <ExternalLink className="w-4 h-4 text-teal-600 group-hover:text-teal-700" />
        </button>
      </div>

      <div
        className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-xl h-48 flex items-center justify-center border border-slate-300 dark:border-slate-600 relative overflow-hidden group cursor-pointer hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-600 dark:hover:to-slate-500 transition-all duration-300"
        onClick={openInGoogleMaps}
      >
        {/* Efecto de patrón de mapa */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
            {gridCells.map((cell) => (
              <div
                key={cell.id}
                className="border border-slate-400 dark:border-slate-500"
                style={{
                  backgroundColor: cell.backgroundColor,
                  opacity: cell.opacity,
                }}
              />
            ))}
          </div>
        </div>

        <div className="text-center z-10 relative">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 bg-teal-500/20 rounded-full border border-teal-500/30 group-hover:bg-teal-500/30 transition-all duration-200">
              <MapPin className="w-8 h-8 text-teal-600" />
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mb-1">
            Mapa Interactivo
          </p>
          <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
            <p className="font-medium">{clientData.address}</p>
            <p>
              {clientData.neighborhood}, {clientData.city}
            </p>
            <p>{clientData.country}</p>
            {hasCoordinates && (
              <p className="font-mono text-xs pt-2 border-t border-slate-300 dark:border-slate-600 mt-2">
                <Navigation className="w-3 h-3 inline mr-1" />
                {clientData.latitude?.toFixed(4)},{" "}
                {clientData.longitude?.toFixed(4)}
              </p>
            )}
          </div>
        </div>

        {/* Indicadores de localización simulados */}
        <div className="absolute top-4 left-4 w-2 h-2 bg-red-500 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute bottom-6 right-8 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse opacity-40 delay-500"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-green-500 rounded-full animate-pulse opacity-50 delay-1000"></div>
      </div>

      <div className="mt-4 p-3 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
        <div className="flex items-center gap-2 text-sm text-teal-700 dark:text-teal-300">
          <MapPin className="w-4 h-4" />
          <span className="font-medium">Dirección completa:</span>
        </div>
        <p className="text-sm text-teal-600 dark:text-teal-400 mt-1 leading-relaxed">
          {clientData.address}
          <br />
          {clientData.neighborhood}, {clientData.city}
          <br />
          {clientData.country}
        </p>
      </div>
    </motion.div>
  );
}
