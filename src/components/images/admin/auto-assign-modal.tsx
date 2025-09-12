"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { 
  X, 
  Sparkles, 
  Zap, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  ExternalLink,
  Settings,
  Target,
  Brain,
  RefreshCw
} from "lucide-react"

interface ImageData {
  id: string
  filename: string
  originalName: string
  size: number
  format: string
  url: string
  thumbnailUrl: string
  uploadedAt: string
  assignedTo?: {
    productId: string
    productName: string
    productSku: string
  }
  status: 'UPLOADED' | 'ASSIGNED' | 'PROCESSING' | 'ERROR'
  tags: string[]
  aiSuggestions?: {
    productMatches: Array<{
      productId: string
      productName: string
      productSku: string
      confidence: number
    }>
  }
}

interface AutoAssignModalProps {
  isOpen: boolean
  onClose: () => void
  images: ImageData[]
}

interface AssignmentResult {
  imageId: string
  productId: string
  productName: string
  productSku: string
  confidence: number
  status: 'pending' | 'assigned' | 'rejected' | 'manual'
}

export function AutoAssignModal({ isOpen, onClose, images }: AutoAssignModalProps) {
  const [step, setStep] = useState<'config' | 'processing' | 'review'>('config')
  const [assignmentResults, setAssignmentResults] = useState<AssignmentResult[]>([])
  const [confidenceThreshold, setConfidenceThreshold] = useState(80)
  const [autoApprove, setAutoApprove] = useState(false)
  const [processedCount, setProcessedCount] = useState(0)

  // Simular procesamiento de IA
  const processImages = async () => {
    setStep('processing')
    setProcessedCount(0)

    const results: AssignmentResult[] = []

    for (let i = 0; i < images.length; i++) {
      const image = images[i]
      
      // Simular delay de procesamiento
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Simular resultado de IA
      if (image.aiSuggestions && image.aiSuggestions.productMatches.length > 0) {
        const bestMatch = image.aiSuggestions.productMatches[0]
        const result: AssignmentResult = {
          imageId: image.id,
          productId: bestMatch.productId,
          productName: bestMatch.productName,
          productSku: bestMatch.productSku,
          confidence: bestMatch.confidence,
          status: bestMatch.confidence >= confidenceThreshold ? 'assigned' : 'pending'
        }
        results.push(result)
      } else {
        // Simular que no se encontró coincidencia
        const result: AssignmentResult = {
          imageId: image.id,
          productId: '',
          productName: 'Sin coincidencia encontrada',
          productSku: '',
          confidence: 0,
          status: 'manual'
        }
        results.push(result)
      }

      setProcessedCount(i + 1)
    }

    setAssignmentResults(results)
    setStep('review')
  }

  const handleAcceptAssignment = (imageId: string) => {
    setAssignmentResults(prev => 
      prev.map(result => 
        result.imageId === imageId 
          ? { ...result, status: 'assigned' }
          : result
      )
    )
  }

  const handleRejectAssignment = (imageId: string) => {
    setAssignmentResults(prev => 
      prev.map(result => 
        result.imageId === imageId 
          ? { ...result, status: 'rejected' }
          : result
      )
    )
  }

  const handleApplyAssignments = () => {
    // Aquí iría la lógica para aplicar las asignaciones
    const acceptedAssignments = assignmentResults.filter(r => r.status === 'assigned')
    console.log('Aplicando asignaciones:', acceptedAssignments)
    onClose()
  }

  const stats = {
    total: assignmentResults.length,
    assigned: assignmentResults.filter(r => r.status === 'assigned').length,
    pending: assignmentResults.filter(r => r.status === 'pending').length,
    rejected: assignmentResults.filter(r => r.status === 'rejected').length,
    manual: assignmentResults.filter(r => r.status === 'manual').length
  }

  useEffect(() => {
    if (!isOpen) {
      setStep('config')
      setAssignmentResults([])
      setProcessedCount(0)
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-white/95 to-gray-50/95 dark:from-slate-800/95 dark:to-slate-700/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              
              {/* Header */}
              <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Asignación Inteligente con IA
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {images.length} imagen{images.length !== 1 ? 'es' : ''} para procesar
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Progress steps */}
                <div className="mt-6 flex items-center gap-4">
                  {['config', 'processing', 'review'].map((stepName, index) => (
                    <div key={stepName} className="flex items-center gap-2">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                        ${step === stepName 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                          : index < ['config', 'processing', 'review'].indexOf(step)
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }
                      `}>
                        {index < ['config', 'processing', 'review'].indexOf(step) ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span className={`text-sm font-medium ${
                        step === stepName 
                          ? 'text-purple-600 dark:text-purple-400' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {stepName === 'config' && 'Configuración'}
                        {stepName === 'processing' && 'Procesando'}
                        {stepName === 'review' && 'Revisión'}
                      </span>
                      {index < 2 && (
                        <div className="w-8 h-px bg-gray-200 dark:bg-gray-700"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {step === 'config' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Configuración de confianza */}
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Target className="w-5 h-5 text-blue-500" />
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            Umbral de Confianza
                          </h3>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              Mínimo {confidenceThreshold}%
                            </span>
                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {confidenceThreshold}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="50"
                            max="95"
                            value={confidenceThreshold}
                            onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Solo se asignarán automáticamente las coincidencias con este nivel de confianza o superior
                          </p>
                        </div>
                      </div>

                      {/* Modo de aprobación */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Settings className="w-5 h-5 text-green-500" />
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            Modo de Aprobación
                          </h3>
                        </div>
                        <div className="space-y-3">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={autoApprove}
                              onChange={(e) => setAutoApprove(e.target.checked)}
                              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <span className="text-sm text-gray-900 dark:text-white">
                              Auto-aprobar coincidencias de alta confianza
                            </span>
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {autoApprove 
                              ? 'Las asignaciones se aplicarán automáticamente si superan el umbral'
                              : 'Todas las asignaciones requerirán revisión manual'
                            }
                          </p>
                        </div>
                      </div>

                      {/* Estadísticas previas */}
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Brain className="w-5 h-5 text-purple-500" />
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            Análisis Previo
                          </h3>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-300">Con sugerencias:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {images.filter(img => img.aiSuggestions?.productMatches.length).length}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-300">Sin sugerencias:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {images.filter(img => !img.aiSuggestions?.productMatches.length).length}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-300">Ya asignadas:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {images.filter(img => img.assignedTo).length}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Vista previa de imágenes */}
                    <div className="bg-white/60 dark:bg-slate-700/60 rounded-2xl p-6">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                        Imágenes a Procesar ({images.length})
                      </h3>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                        {images.slice(0, 20).map((image) => (
                          <div key={image.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
                            <Image
                              src={image.thumbnailUrl}
                              alt={image.originalName}
                              fill
                              className="object-cover"
                            />
                            {image.assignedTo && (
                              <div className="absolute top-1 right-1 w-3 h-3 bg-green-500 rounded-full"></div>
                            )}
                          </div>
                        ))}
                        {images.length > 20 && (
                          <div className="aspect-square rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                              +{images.length - 20}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {step === 'processing' && (
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Loader2 className="w-10 h-10 text-white animate-spin" />
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Procesando con IA...
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Analizando imágenes y buscando coincidencias con productos
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Progreso:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {processedCount} / {images.length}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(processedCount / images.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 'review' && (
                  <div className="space-y-6">
                    {/* Estadísticas de resultados */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-green-100 dark:bg-green-900/20 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {stats.assigned}
                        </div>
                        <div className="text-sm text-green-700 dark:text-green-300">
                          Asignadas
                        </div>
                      </div>
                      <div className="bg-yellow-100 dark:bg-yellow-900/20 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                          {stats.pending}
                        </div>
                        <div className="text-sm text-yellow-700 dark:text-yellow-300">
                          Pendientes
                        </div>
                      </div>
                      <div className="bg-red-100 dark:bg-red-900/20 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                          {stats.rejected}
                        </div>
                        <div className="text-sm text-red-700 dark:text-red-300">
                          Rechazadas
                        </div>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                          {stats.manual}
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          Manuales
                        </div>
                      </div>
                    </div>

                    {/* Lista de resultados */}
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {assignmentResults.map((result) => {
                        const image = images.find(img => img.id === result.imageId)
                        if (!image) return null

                        return (
                          <div
                            key={result.imageId}
                            className={`
                              flex items-center gap-4 p-4 rounded-xl border transition-all
                              ${result.status === 'assigned' 
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                                : result.status === 'rejected'
                                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                                : result.status === 'manual'
                                ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                                : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
                              }
                            `}
                          >
                            {/* Imagen */}
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0 relative">
                              <Image
                                src={image.thumbnailUrl}
                                alt={image.originalName}
                                fill
                                className="object-cover"
                              />
                            </div>

                            {/* Información */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                {image.originalName}
                              </h4>
                              {result.productName && result.productName !== 'Sin coincidencia encontrada' ? (
                                <div className="flex items-center gap-2 mt-1">
                                  <ExternalLink className="w-3 h-3 text-blue-500" />
                                  <span className="text-sm text-gray-600 dark:text-gray-300">
                                    {result.productName}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    ({result.productSku})
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 mt-1">
                                  <AlertCircle className="w-3 h-3 text-gray-400" />
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Sin coincidencia encontrada
                                  </span>
                                </div>
                              )}
                              {result.confidence > 0 && (
                                <div className="mt-1">
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    result.confidence >= 90 
                                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                      : result.confidence >= 70
                                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                  }`}>
                                    {result.confidence}% confianza
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Acciones */}
                            {result.status === 'pending' && result.productName !== 'Sin coincidencia encontrada' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleAcceptAssignment(result.imageId)}
                                  className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleRejectAssignment(result.imageId)}
                                  className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            )}

                            {result.status === 'assigned' && (
                              <div className="text-green-600 dark:text-green-400">
                                <CheckCircle className="w-5 h-5" />
                              </div>
                            )}

                            {result.status === 'rejected' && (
                              <div className="text-red-600 dark:text-red-400">
                                <X className="w-5 h-5" />
                              </div>
                            )}

                            {result.status === 'manual' && (
                              <div className="text-gray-400">
                                <AlertCircle className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200/50 dark:border-gray-700/50">
                <div className="flex justify-between">
                  <div className="flex gap-3">
                    {step === 'review' && (
                      <button
                        onClick={() => setStep('config')}
                        className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Volver a configurar
                      </button>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
                    >
                      Cancelar
                    </button>
                    
                    {step === 'config' && (
                      <button
                        onClick={processImages}
                        className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center gap-2"
                      >
                        <Zap className="w-4 h-4" />
                        Procesar con IA
                      </button>
                    )}

                    {step === 'review' && (
                      <button
                        onClick={handleApplyAssignments}
                        disabled={stats.assigned === 0}
                        className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Aplicar Asignaciones ({stats.assigned})
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
