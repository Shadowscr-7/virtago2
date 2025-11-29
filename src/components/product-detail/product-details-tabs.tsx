"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";

interface ProductDetails {
  description: string;
  longDescription: string;
  specifications: Record<string, string>;
  features: string[];
}

interface ProductDetailsTabsProps {
  product: ProductDetails;
}

export function ProductDetailsTabs({ product }: ProductDetailsTabsProps) {
  const [activeTab, setActiveTab] = useState("description");
  const [expandedSpecs, setExpandedSpecs] = useState(false);
  const { themeColors } = useTheme();

  const tabs = [
    { id: "description", label: "Descripción", icon: "📝" },
    { id: "specifications", label: "Especificaciones", icon: "⚙️" },
    { id: "features", label: "Características", icon: "✨" },
  ];

  const specEntries = Object.entries(product.specifications);
  const visibleSpecs = expandedSpecs ? specEntries : specEntries.slice(0, 6);

  return (
    <div className="rounded-2xl shadow-lg" style={{ background: themeColors.surface, border: `1px solid ${themeColors.primary}20` }}>
      {/* Tab Navigation */}
      <div className="flex" style={{ borderBottom: `1px solid ${themeColors.primary}20` }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 px-6 py-4 text-left font-medium transition-all duration-300"
            style={{
              color: activeTab === tab.id ? themeColors.primary : themeColors.text.secondary,
              borderBottom: activeTab === tab.id ? `2px solid ${themeColors.primary}` : 'none',
              background: activeTab === tab.id ? `${themeColors.primary}10` : 'transparent'
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "description" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold mb-3" style={{ color: themeColors.text.primary }}>
                  Descripción del Producto
                </h3>
                <p className="text-lg leading-relaxed mb-4" style={{ color: themeColors.text.secondary }}>
                  {product.description}
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-3" style={{ color: themeColors.text.primary }}>
                  Descripción Detallada
                </h4>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="leading-relaxed" style={{ color: themeColors.text.secondary }}>
                    {product.longDescription}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "specifications" && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-4" style={{ color: themeColors.text.primary }}>
                Especificaciones Técnicas
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {visibleSpecs.map(([key, value], index) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl transition-colors"
                    style={{ background: `${themeColors.surface}80` }}
                  >
                    <span className="font-medium" style={{ color: themeColors.text.secondary }}>
                      {key}:
                    </span>
                    <span className="font-semibold text-right max-w-xs" style={{ color: themeColors.text.primary }}>
                      {value}
                    </span>
                  </motion.div>
                ))}
              </div>

              {specEntries.length > 6 && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => setExpandedSpecs(!expandedSpecs)}
                    className="flex items-center gap-2 mx-auto px-4 py-2 rounded-lg transition-colors"
                    style={{ color: themeColors.primary, background: `${themeColors.primary}10` }}
                  >
                    {expandedSpecs ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Ver menos especificaciones
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Ver más especificaciones ({specEntries.length - 6} más)
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "features" && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-4" style={{ color: themeColors.text.primary }}>
                Características Principales
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start gap-3 p-4 rounded-xl"
                    style={{ background: `${themeColors.accent}15`, border: `1px solid ${themeColors.accent}30` }}
                  >
                    <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: themeColors.accent }} />
                    <span className="font-medium" style={{ color: themeColors.text.primary }}>
                      {feature}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
