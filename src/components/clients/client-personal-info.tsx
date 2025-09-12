"use client";

import { motion } from "framer-motion";
import { User, Building, FileText, Mail, Phone } from "lucide-react";

interface ClientData {
  name: string;
  businessName: string;
  rut: string;
  email: string;
  phone: string;
  phoneSecond: string;
}

interface ClientPersonalInfoProps {
  clientData: ClientData;
  isEditing: boolean;
  onInputChange: (field: keyof ClientData, value: string) => void;
}

export function ClientPersonalInfo({
  clientData,
  isEditing,
  onInputChange,
}: ClientPersonalInfoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-white/30 p-6 shadow-xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
          <User className="w-6 h-6 text-purple-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Información Personal
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Nombre Comercial
          </label>
          <div className="relative h-14">
            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-hover:text-purple-500 z-10" />
            <input
              type="text"
              value={clientData.name}
              onChange={(e) => onInputChange("name", e.target.value)}
              disabled={!isEditing}
              className="w-full h-full pl-12 pr-4 bg-white/80 dark:bg-slate-700/80 border-2 border-white/40 dark:border-slate-600/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:border-purple-400/40 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-lg shadow-purple-500/5"
              placeholder="Nombre del cliente"
            />
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Razón Social
          </label>
          <div className="relative h-14">
            <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-hover:text-purple-500 z-10" />
            <input
              type="text"
              value={clientData.businessName}
              onChange={(e) => onInputChange("businessName", e.target.value)}
              disabled={!isEditing}
              className="w-full h-full pl-12 pr-4 bg-white/80 dark:bg-slate-700/80 border-2 border-white/40 dark:border-slate-600/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:border-purple-400/40 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-lg shadow-purple-500/5"
              placeholder="Razón social completa"
            />
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            RUT
          </label>
          <div className="relative h-14">
            <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-hover:text-purple-500 z-10" />
            <input
              type="text"
              value={clientData.rut}
              onChange={(e) => onInputChange("rut", e.target.value)}
              disabled={!isEditing}
              className="w-full h-full pl-12 pr-4 bg-white/80 dark:bg-slate-700/80 border-2 border-white/40 dark:border-slate-600/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:border-purple-400/40 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-lg shadow-purple-500/5"
              placeholder="12.345.678.901"
            />
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            <span className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-500" />
              Email
            </span>
          </label>
          <div className="relative h-14">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-hover:text-purple-500 z-10" />
            <input
              type="email"
              value={clientData.email}
              onChange={(e) => onInputChange("email", e.target.value)}
              disabled={!isEditing}
              className="w-full h-full pl-12 pr-4 bg-white/80 dark:bg-slate-700/80 border-2 border-white/40 dark:border-slate-600/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:border-purple-400/40 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-lg shadow-purple-500/5"
              placeholder="contacto@empresa.com"
            />
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            <span className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-purple-500" />
              Teléfono Principal
            </span>
          </label>
          <div className="relative h-14">
            <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-hover:text-purple-500 z-10" />
            <input
              type="tel"
              value={clientData.phone}
              onChange={(e) => onInputChange("phone", e.target.value)}
              disabled={!isEditing}
              className="w-full h-full pl-12 pr-4 bg-white/80 dark:bg-slate-700/80 border-2 border-white/40 dark:border-slate-600/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:border-purple-400/40 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-lg shadow-purple-500/5"
              placeholder="+598 99 123 456"
            />
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Teléfono Secundario
          </label>
          <div className="relative h-14">
            <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-hover:text-purple-500 z-10" />
            <input
              type="tel"
              value={clientData.phoneSecond}
              onChange={(e) => onInputChange("phoneSecond", e.target.value)}
              disabled={!isEditing}
              className="w-full h-full pl-12 pr-4 bg-white/80 dark:bg-slate-700/80 border-2 border-white/40 dark:border-slate-600/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:border-purple-400/40 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-lg shadow-purple-500/5"
              placeholder="+598 99 765 432"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
