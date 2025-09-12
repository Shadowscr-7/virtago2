"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronDown, ChevronUp, CheckCircle } from "lucide-react"

interface ProductDetails {
  description: string
  longDescription: string
  specifications: Record<string, string>
  features: string[]
}

interface ProductDetailsTabsProps {
  product: ProductDetails
}

export function ProductDetailsTabs({ product }: ProductDetailsTabsProps) {
  const [activeTab, setActiveTab] = useState("description")
  const [expandedSpecs, setExpandedSpecs] = useState(false)

  const tabs = [
    { id: "description", label: "Descripción", icon: "📝" },
    { id: "specifications", label: "Especificaciones", icon: "⚙️" },
    { id: "features", label: "Características", icon: "✨" }
  ]

  const specEntries = Object.entries(product.specifications)
  const visibleSpecs = expandedSpecs ? specEntries : specEntries.slice(0, 6)

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-6 py-4 text-left font-medium transition-all duration-300 ${
              activeTab === tab.id
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
            }`}
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
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  Descripción del Producto
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-4">
                  {product.description}
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  Descripción Detallada
                </h4>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {product.longDescription}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "specifications" && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                Especificaciones Técnicas
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                {visibleSpecs.map(([key, value], index) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {key}:
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white text-right max-w-xs">
                      {value}
                    </span>
                  </motion.div>
                ))}
              </div>

              {specEntries.length > 6 && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => setExpandedSpecs(!expandedSpecs)}
                    className="flex items-center gap-2 mx-auto px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
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
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                Características Principales
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-800 dark:text-slate-200 font-medium">
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
  )
}
