'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, TrendingUp, Package, List, Percent, Users, ArrowRight, ArrowLeft } from 'lucide-react';
import { useTheme } from '../../../contexts/theme-context';
import { AdminLayout } from '../admin-layout';
import { ClientStep, ProductStep, PriceListStep, PriceStep, DiscountStep, ReviewStep } from './steps';
import { ThemeColors, ClientData, MatchedProduct, PriceList, PriceData } from './shared/types';

// Definición de pasos del wizard
const WIZARD_STEPS = [
  { 
    id: 'clients', 
    title: 'Clientes', 
    icon: Users, 
    description: 'Carga masiva de clientes' 
  },
  { 
    id: 'products', 
    title: 'Productos', 
    icon: Package, 
    description: 'Carga masiva de productos con IA' 
  },
  { 
    id: 'price-lists', 
    title: 'Listas de Precios', 
    icon: List, 
    description: 'Configurar listas por cliente' 
  },
  { 
    id: 'prices', 
    title: 'Precios', 
    icon: TrendingUp, 
    description: 'Precios base y márgenes' 
  },
  { 
    id: 'discounts', 
    title: 'Descuentos', 
    icon: Percent, 
    description: 'Reglas de descuentos' 
  },
  { 
    id: 'review', 
    title: 'Revisar', 
    icon: CheckCircle, 
    description: 'Finalizar configuración' 
  },
];

interface WizardData {
  uploadedClients?: ClientData[];
  matchedProducts?: MatchedProduct[];
  uploadedPriceLists?: PriceList[];
  uploadedPrices?: PriceData[];
  discounts?: unknown[];
  completed?: boolean;
}

export default function SetupWizard() {
  const { themeColors: contextThemeColors } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<WizardData>({});
  const [isVisible, setIsVisible] = useState(true);

  const themeColors: ThemeColors = {
    primary: contextThemeColors.primary,
    secondary: contextThemeColors.secondary,
    accent: contextThemeColors.accent,
    surface: contextThemeColors.surface,
    text: {
      primary: contextThemeColors.text.primary,
      secondary: contextThemeColors.text.secondary,
    },
  };

  const handleNext = (stepData?: unknown) => {
    if (stepData) {
      setWizardData(prev => ({ ...prev, ...stepData }));
    }
    
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else if (stepData && (stepData as { completed?: boolean }).completed) {
      // Wizard completado
      handleClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  const renderStep = () => {
    const commonProps = {
      onNext: handleNext,
      onBack: handleBack,
      themeColors,
      stepData: wizardData,
    };

    switch (WIZARD_STEPS[currentStep].id) {
      case 'clients':
        return <ClientStep {...commonProps} stepData={{ uploadedClients: wizardData.uploadedClients }} />;
      case 'products':
        return <ProductStep {...commonProps} stepData={{ matchedProducts: wizardData.matchedProducts }} />;
      case 'price-lists':
        return <PriceListStep {...commonProps} stepData={{ uploadedPriceLists: wizardData.uploadedPriceLists }} />;
      case 'prices':
        return <PriceStep {...commonProps} stepData={{ uploadedPrices: wizardData.uploadedPrices }} />;
      case 'discounts':
        return <DiscountStep {...commonProps} />;
      case 'review':
        return <ReviewStep {...commonProps} />;
      default:
        return null;
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="min-h-screen p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: themeColors.text.primary }}>
                Configuración Rápida
              </h1>
              <p className="mt-2" style={{ color: themeColors.text.secondary }}>
                Configura tu sistema paso a paso con datos iniciales
              </p>
            </div>
            <motion.button
              onClick={handleClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg"
              style={{ color: themeColors.text.secondary }}
            >
              <X className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between relative">
              {/* Progress Line */}
              <div 
                className="absolute top-6 left-0 h-0.5 transition-all duration-500"
                style={{ 
                  backgroundColor: `${themeColors.primary}30`,
                  width: '100%',
                  zIndex: 0,
                }}
              />
              <div 
                className="absolute top-6 left-0 h-0.5 transition-all duration-500"
                style={{ 
                  backgroundColor: themeColors.primary,
                  width: `${(currentStep / (WIZARD_STEPS.length - 1)) * 100}%`,
                  zIndex: 1,
                }}
              />

              {/* Step Indicators */}
              {WIZARD_STEPS.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;
                const isClickable = index <= currentStep;

                return (
                  <motion.div
                    key={step.id}
                    className={`relative z-10 flex flex-col items-center cursor-pointer group ${
                      isClickable ? '' : 'cursor-not-allowed opacity-50'
                    }`}
                    whileHover={isClickable ? { scale: 1.05 } : {}}
                    whileTap={isClickable ? { scale: 0.95 } : {}}
                    onClick={() => handleStepClick(index)}
                  >
                    <motion.div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        isCurrent ? 'shadow-lg' : ''
                      }`}
                      style={{
                        backgroundColor: isCompleted 
                          ? themeColors.secondary 
                          : isCurrent 
                            ? themeColors.primary 
                            : `${themeColors.surface}80`,
                        borderColor: isCompleted 
                          ? themeColors.secondary 
                          : isCurrent 
                            ? themeColors.primary 
                            : `${themeColors.primary}30`,
                      }}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : (
                        <Icon 
                          className="w-6 h-6" 
                          style={{ 
                            color: isCurrent ? 'white' : themeColors.text.secondary 
                          }} 
                        />
                      )}
                    </motion.div>
                    
                    <div className="mt-3 text-center min-w-0">
                      <div 
                        className={`text-sm font-medium transition-colors duration-200 ${
                          isCurrent ? 'font-semibold' : ''
                        }`}
                        style={{ 
                          color: isCurrent 
                            ? themeColors.text.primary 
                            : themeColors.text.secondary 
                        }}
                      >
                        {step.title}
                      </div>
                      <div 
                        className="text-xs mt-1 group-hover:opacity-100 transition-opacity duration-200"
                        style={{ color: themeColors.text.secondary }}
                      >
                        {step.description}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <motion.div
            className="rounded-2xl border p-8 min-h-[600px]"
            style={{
              backgroundColor: `${themeColors.surface}20`,
              borderColor: `${themeColors.primary}20`,
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Navigation Footer */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm" style={{ color: themeColors.text.secondary }}>
              Paso {currentStep + 1} de {WIZARD_STEPS.length}
            </div>
            
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <motion.button
                  onClick={handleBack}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: `${themeColors.surface}50`,
                    color: themeColors.text.secondary,
                  }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Anterior
                </motion.button>
              )}
              
              {currentStep < WIZARD_STEPS.length - 1 && (
                <motion.button
                  onClick={() => handleNext()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white"
                  style={{ backgroundColor: themeColors.primary }}
                >
                  Siguiente
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}