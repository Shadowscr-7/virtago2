"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/theme-context";
import { AdminLayout } from "@/components/admin/admin-layout";
import SetupWizard from "@/components/admin/quick-setup/setup-wizard";
import { 
  Zap, 
  Users, 
  Package, 
  DollarSign, 
  FileText,
  ArrowRight,
  CheckCircle,
  Clock,
  Play
} from "lucide-react";

interface QuickSetupCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'completed' | 'pending' | 'in-progress';
  onClick: () => void;
}

export default function ConfiguracionRapidaPage() {
  const { themeColors } = useTheme();
  const [showWizard, setShowWizard] = useState(false);

  const setupCards: QuickSetupCard[] = [
    {
      title: "Configurar Clientes",
      description: "Importa tu base de clientes existente",
      icon: <Users className="w-6 h-6" />,
      status: 'pending',
      onClick: () => setShowWizard(true),
    },
    {
      title: "Cargar Productos",
      description: "Agrega tu catálogo de productos",
      icon: <Package className="w-6 h-6" />,
      status: 'pending',
      onClick: () => setShowWizard(true),
    },
    {
      title: "Configurar Precios",
      description: "Define tus listas de precios",
      icon: <DollarSign className="w-6 h-6" />,
      status: 'pending',
      onClick: () => setShowWizard(true),
    },
    {
      title: "Crear Listas de Precios",
      description: "Organiza tus diferentes listas",
      icon: <FileText className="w-6 h-6" />,
      status: 'pending',
      onClick: () => setShowWizard(true),
    },
  ];

  const getStatusIcon = (status: QuickSetupCard['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5" style={{ color: themeColors.secondary }} />;
      case 'in-progress':
        return <Clock className="w-5 h-5" style={{ color: themeColors.primary }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: QuickSetupCard['status']) => {
    switch (status) {
      case 'completed':
        return themeColors.secondary;
      case 'in-progress':
        return themeColors.primary;
      default:
        return themeColors.text.secondary;
    }
  };

  if (showWizard) {
    return <SetupWizard />;
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: `${themeColors.primary}20` }}
          >
            <Zap className="w-8 h-8" style={{ color: themeColors.primary }} />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: themeColors.text.primary }}>
            Configuración Rápida
          </h1>
          <p className="max-w-2xl mx-auto" style={{ color: themeColors.text.secondary }}>
            Configura los elementos esenciales de tu tienda en pocos pasos simples
          </p>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border"
          style={{ borderColor: `${themeColors.primary}30` }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold" style={{ color: themeColors.text.primary }}>
              Progreso General
            </h2>
            <span 
              className="text-sm px-3 py-1 rounded-full"
              style={{ 
                backgroundColor: `${themeColors.primary}20`,
                color: themeColors.primary 
              }}
            >
              0 de 4 completadas
            </span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{ 
                backgroundColor: themeColors.primary,
                width: '0%' 
              }}
            />
          </div>
          
          <p className="text-sm" style={{ color: themeColors.text.secondary }}>
            Completa estas configuraciones para comenzar a usar tu tienda
          </p>
        </motion.div>

        {/* Setup Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {setupCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              onClick={card.onClick}
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border cursor-pointer transition-all duration-300 group"
              style={{ borderColor: `${themeColors.primary}30` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: `${themeColors.primary}20` }}
                >
                  {card.icon}
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(card.status)}
                  <ArrowRight 
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" 
                    style={{ color: getStatusColor(card.status) }}
                  />
                </div>
              </div>
              
              <h3 className="text-lg font-semibold mb-2" style={{ color: themeColors.text.primary }}>
                {card.title}
              </h3>
              <p style={{ color: themeColors.text.secondary }}>
                {card.description}
              </p>
              
              <div className="mt-4 pt-4 border-t" style={{ borderColor: `${themeColors.primary}20` }}>
                <span 
                  className="text-sm font-medium"
                  style={{ color: getStatusColor(card.status) }}
                >
                  {card.status === 'completed' && 'Completado'}
                  {card.status === 'in-progress' && 'En progreso'}
                  {card.status === 'pending' && 'Pendiente'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <motion.button
            onClick={() => setShowWizard(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300"
            style={{
              backgroundColor: themeColors.primary,
              color: 'white',
            }}
          >
            <Play className="w-6 h-6" />
            Iniciar Configuración Guiada
          </motion.button>
          <p className="mt-2 text-sm" style={{ color: themeColors.text.secondary }}>
            Sigue el asistente paso a paso para configurar todo rápidamente
          </p>
        </motion.div>
      </div>
    </AdminLayout>
  );
}