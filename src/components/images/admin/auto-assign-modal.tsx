"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
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
  RefreshCw,
} from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { toast } from "sonner";

interface ImageData {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  format: string;
  url: string;
  thumbnailUrl: string;
  uploadedAt: string;
  assignedTo?: {
    productId: string;
    productName: string;
    productSku: string;
  };
  status: "UPLOADED" | "ASSIGNED" | "PROCESSING" | "ERROR";
  tags: string[];
  aiSuggestions?: {
    productMatches: Array<{
      productId: string;
      productName: string;
      productSku: string;
      confidence: number;
    }>;
  };
}

interface AutoAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: ImageData[];
  onComplete?: () => void;
}

interface AssignmentResult {
  imageId: string;
  imageUrl: string;
  prodVirtaId?: string;
  productName?: string;
  confidence: number;
  status: "pending" | "approved" | "rejected" | "manual";
  wasAutoAssigned?: boolean; // Nueva propiedad para marcar si fue auto-asignada
  aiAnalysis?: {
    detectedProduct: string;
    detectedBrand: string;
    keywords: string[];
  };
  suggestedMatches?: Array<{
    prodVirtaId: string;
    productName: string;
    score: number;
  }>;
}

export function AutoAssignModal({
  isOpen,
  onClose,
  images,
  onComplete,
}: AutoAssignModalProps) {
  const { themeColors } = useTheme();
  const [step, setStep] = useState<"config" | "processing" | "review">("config");
  const [assignmentResults, setAssignmentResults] = useState<AssignmentResult[]>([]);
  const [confidenceThreshold, setConfidenceThreshold] = useState(80);
  const [autoApprove, setAutoApprove] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Procesar imágenes con IA
  const processImages = async () => {
    setStep("processing");
    setProcessedCount(0);
    setIsProcessing(true);

    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('jwt_token');
      
      if (!token) {
        toast.error("No autenticado");
        return;
      }

      // Llamar al API para re-analizar las imágenes
      const response = await fetch("/api/product-images/re-analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          imageIds: images.map(img => img.id),
        }),
      });

      if (!response.ok) {
        throw new Error("Error al analizar imágenes");
      }

      const data = await response.json();
      
      console.log("🔍 Respuesta del backend re-analyze:", data);

      if (data.success && data.results) {
        // Actualizar progreso
        setProcessedCount(images.length);
        
        const results: AssignmentResult[] = [];
        let autoAssignedCount = 0;

        // Procesar cada resultado
        for (const result of data.results) {
          console.log("📦 Procesando resultado:", {
            imageId: result.imageId,
            success: result.success,
            suggestedMatches: result.suggestedMatches,
            aiAnalysis: result.aiAnalysis
          });
          if (!result.success || !result.suggestedMatches || result.suggestedMatches.length === 0) {
            // Sin coincidencias - marcar como manual
            results.push({
              imageId: result.imageId,
              imageUrl: images.find(img => img.id === result.imageId)?.url || '',
              confidence: 0,
              status: "manual" as const,
              aiAnalysis: result.aiAnalysis,
            });
            continue;
          }

          const bestMatch = result.suggestedMatches[0];
          const confidencePercent = bestMatch.score;
          const prodVirtaId = bestMatch.product?.prodVirtaId || bestMatch.prodVirtaId;
          const productName = bestMatch.product?.name || bestMatch.productName;
          
          console.log("🎯 bestMatch:", { 
            score: confidencePercent, 
            prodVirtaId, 
            productName,
            fullMatch: bestMatch 
          });
          
          console.log("⚙️ Config:", {
            autoApprove,
            confidenceThreshold,
            willAutoAssign: autoApprove && confidencePercent >= confidenceThreshold
          });
          
          // Si auto-aprobar está activado y supera el umbral, asignar inmediatamente
          if (autoApprove && confidencePercent >= confidenceThreshold) {
            try {
              const assignResponse = await fetch("/api/product-images/assign", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                  imageUrl: images.find(img => img.id === result.imageId)?.url || '',
                  prodVirtaId: prodVirtaId,
                  visionData: result.aiAnalysis || {},
                  metadata: {},
                }),
              });

              if (assignResponse.ok) {
                autoAssignedCount++;
                results.push({
                  imageId: result.imageId,
                  imageUrl: images.find(img => img.id === result.imageId)?.url || '',
                  prodVirtaId: prodVirtaId,
                  productName: productName,
                  confidence: confidencePercent,
                  status: "approved" as const,
                  wasAutoAssigned: true, // Marcado como auto-asignada
                  aiAnalysis: result.aiAnalysis,
                  suggestedMatches: result.suggestedMatches,
                });
              } else {
                // Si falla la asignación automática, marcar como pendiente
                results.push({
                  imageId: result.imageId,
                  imageUrl: images.find(img => img.id === result.imageId)?.url || '',
                  prodVirtaId: prodVirtaId,
                  productName: productName,
                  confidence: confidencePercent,
                  status: "pending" as const,
                  aiAnalysis: result.aiAnalysis,
                  suggestedMatches: result.suggestedMatches,
                });
              }
            } catch (error) {
              console.error(`Error asignando automáticamente imagen ${result.imageId}:`, error);
              // Si hay error, marcar como pendiente para revisión manual
              results.push({
                imageId: result.imageId,
                imageUrl: images.find(img => img.id === result.imageId)?.url || '',
                prodVirtaId: prodVirtaId,
                productName: productName,
                confidence: confidencePercent,
                status: "pending" as const,
                aiAnalysis: result.aiAnalysis,
                suggestedMatches: result.suggestedMatches,
              });
            }
          } else {
            // Por debajo del umbral o auto-aprobar desactivado - marcar como pendiente
            results.push({
              imageId: result.imageId,
              imageUrl: images.find(img => img.id === result.imageId)?.url || '',
              prodVirtaId: prodVirtaId,
              productName: productName,
              confidence: confidencePercent,
              status: "pending" as const,
              aiAnalysis: result.aiAnalysis,
              suggestedMatches: result.suggestedMatches,
            });
          }
        }

        setAssignmentResults(results);
        
        if (autoAssignedCount > 0) {
          toast.success(`${autoAssignedCount} imagen(es) asignadas automáticamente`);
        }
        
        setStep("review");
      }
    } catch (error) {
      console.error("Error procesando imágenes:", error);
      toast.error("Error al procesar las imágenes");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptAssignment = (imageId: string) => {
    setAssignmentResults((prev) =>
      prev.map((result) =>
        result.imageId === imageId ? { ...result, status: "approved" as const } : result,
      ),
    );
  };

  const handleRejectAssignment = (imageId: string) => {
    setAssignmentResults((prev) =>
      prev.map((result) =>
        result.imageId === imageId ? { ...result, status: "rejected" as const } : result,
      ),
    );
  };

  const handleApplyAssignments = async () => {
    // Filtrar solo las que fueron aprobadas MANUALMENTE
    // (las que NO fueron auto-asignadas durante el procesamiento)
    const manuallyApproved = assignmentResults.filter(r => {
      if (r.status !== "approved" || !r.prodVirtaId) return false;
      
      // Si auto-aprobar estaba activado, solo las que estaban bajo el umbral son manuales
      if (autoApprove) {
        return r.confidence < confidenceThreshold;
      }
      
      // Si auto-aprobar estaba desactivado, TODAS son manuales
      return true;
    });
    
    if (manuallyApproved.length === 0) {
      // Si no hay pendientes aprobadas manualmente, verificar si hay auto-asignadas
      const autoApproved = assignmentResults.filter(r => 
        r.status === "approved" && 
        autoApprove &&
        r.confidence >= confidenceThreshold
      );
      
      if (autoApproved.length > 0) {
        toast.success("Las asignaciones ya fueron aplicadas automáticamente");
        if (onComplete) {
          onComplete();
        }
        onClose();
      } else {
        toast.error("No hay asignaciones pendientes por aplicar");
      }
      return;
    }

    setIsProcessing(true);
    
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('jwt_token');
      
      // Asignar cada imagen aprobada manualmente
      let successCount = 0;
      
      for (const assignment of manuallyApproved) {
        try {
          const response = await fetch("/api/product-images/assign", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token && { "Authorization": `Bearer ${token}` }),
            },
            body: JSON.stringify({
              imageUrl: assignment.imageUrl,
              prodVirtaId: assignment.prodVirtaId,
              visionData: assignment.aiAnalysis || {},
              metadata: {},
            }),
          });

          if (response.ok) {
            successCount++;
          }
        } catch (error) {
          console.error(`Error asignando imagen ${assignment.imageId}:`, error);
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} imagen(es) asignada(s) manualmente`);
      }
      
      // Siempre completar si hubo asignaciones (auto o manuales)
      if (onComplete) {
        onComplete();
      }
      
      onClose();
    } catch (error) {
      console.error("Error aplicando asignaciones:", error);
      toast.error("Error al aplicar asignaciones");
    } finally {
      setIsProcessing(false);
    }
  };

  const stats = {
    total: assignmentResults.length,
    assigned: assignmentResults.filter((r) => r.status === "approved").length,
    pending: assignmentResults.filter((r) => r.status === "pending").length,
    rejected: assignmentResults.filter((r) => r.status === "rejected").length,
    manual: assignmentResults.filter((r) => r.status === "manual").length,
  };

  useEffect(() => {
    if (!isOpen) {
      setStep("config");
      setAssignmentResults([]);
      setProcessedCount(0);
    }
  }, [isOpen]);

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
            <div 
              className="backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${themeColors.surface}95, ${themeColors.surface}90)`
              }}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`
                      }}
                    >
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Asignación Inteligente con IA
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {images.length} imagen{images.length !== 1 ? "es" : ""}{" "}
                        para procesar
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
                  {["config", "processing", "review"].map((stepName, index) => (
                    <div key={stepName} className="flex items-center gap-2">
                      <div
                        className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                        ${
                          step === stepName
                            ? "text-white"
                            : index <
                                ["config", "processing", "review"].indexOf(step)
                              ? "bg-green-500 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        }
                      `}
                        style={{
                          ...(step === stepName && {
                            backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`
                          })
                        }}
                      >
                        {index <
                        ["config", "processing", "review"].indexOf(step) ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          step === stepName
                            ? ""
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                        style={{
                          ...(step === stepName && {
                            color: themeColors.primary
                          })
                        }}
                      >
                        {stepName === "config" && "Configuración"}
                        {stepName === "processing" && "Procesando"}
                        {stepName === "review" && "Revisión"}
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
                {step === "config" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Configuración de confianza */}
                      <div 
                        className="rounded-2xl p-6"
                        style={{
                          background: `linear-gradient(135deg, ${themeColors.primary}20, ${themeColors.primary}10)`
                        }}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <Target 
                            className="w-5 h-5" 
                            style={{ color: themeColors.primary }}
                          />
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            Umbral de Confianza
                          </h3>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              Mínimo {confidenceThreshold}%
                            </span>
                            <span 
                              className="text-2xl font-bold"
                              style={{ color: themeColors.primary }}
                            >
                              {confidenceThreshold}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="50"
                            max="95"
                            value={confidenceThreshold}
                            onChange={(e) =>
                              setConfidenceThreshold(Number(e.target.value))
                            }
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Solo se asignarán automáticamente las coincidencias
                            con este nivel de confianza o superior
                          </p>
                        </div>
                      </div>

                      {/* Modo de aprobación */}
                      <div 
                        className="rounded-2xl p-6"
                        style={{
                          background: `linear-gradient(135deg, ${themeColors.secondary}20, ${themeColors.secondary}10)`
                        }}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <Settings 
                            className="w-5 h-5" 
                            style={{ color: themeColors.secondary }}
                          />
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
                              className="w-4 h-4 bg-gray-100 border-gray-300 rounded focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                              style={{
                                accentColor: themeColors.secondary
                              }}
                            />
                            <span className="text-sm text-gray-900 dark:text-white">
                              Auto-aprobar coincidencias de alta confianza
                            </span>
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {autoApprove
                              ? "Las asignaciones se aplicarán automáticamente si superan el umbral"
                              : "Todas las asignaciones requerirán revisión manual"}
                          </p>
                        </div>
                      </div>

                      {/* Estadísticas previas */}
                      <div 
                        className="rounded-2xl p-6"
                        style={{
                          background: `linear-gradient(135deg, ${themeColors.accent}20, ${themeColors.accent}10)`
                        }}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <Brain 
                            className="w-5 h-5" 
                            style={{ color: themeColors.accent }}
                          />
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            Análisis Previo
                          </h3>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-300">
                              Con sugerencias:
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {
                                images.filter(
                                  (img) =>
                                    img.aiSuggestions?.productMatches.length,
                                ).length
                              }
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-300">
                              Sin sugerencias:
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {
                                images.filter(
                                  (img) =>
                                    !img.aiSuggestions?.productMatches.length,
                                ).length
                              }
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-300">
                              Ya asignadas:
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {images.filter((img) => img.assignedTo).length}
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
                          <div
                            key={image.id}
                            className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 relative"
                          >
                            <Image
                              src={image.thumbnailUrl}
                              alt={image.originalName}
                              fill
                              className="object-cover"
                            />
                            {image.assignedTo && (
                              <div 
                                className="absolute top-1 right-1 w-3 h-3 rounded-full"
                                style={{ backgroundColor: themeColors.primary }}
                              ></div>
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

                {step === "processing" && (
                  <div className="text-center space-y-6">
                    <div 
                      className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
                      style={{
                        backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`
                      }}
                    >
                      <Loader2 className="w-10 h-10 text-white animate-spin" />
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Procesando con IA...
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Analizando imágenes y buscando coincidencias con
                        productos
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">
                          Progreso:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {processedCount} / {images.length}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${(processedCount / images.length) * 100}%`,
                            backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {step === "review" && (
                  <div className="space-y-6">
                    {/* Estadísticas de resultados */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div 
                        className="rounded-xl p-4 text-center"
                        style={{
                          backgroundColor: `${themeColors.primary}20`,
                          color: themeColors.primary
                        }}
                      >
                        <div className="text-2xl font-bold">
                          {stats.assigned}
                        </div>
                        <div className="text-sm opacity-80">
                          Asignadas
                        </div>
                      </div>
                      <div 
                        className="rounded-xl p-4 text-center"
                        style={{
                          backgroundColor: `${themeColors.secondary}20`,
                          color: themeColors.secondary
                        }}
                      >
                        <div className="text-2xl font-bold">
                          {stats.pending}
                        </div>
                        <div className="text-sm opacity-80">
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
                        const image = images.find(
                          (img) => img.id === result.imageId,
                        );
                        if (!image) return null;

                        return (
                          <div
                            key={result.imageId}
                            className={`
                              flex items-center gap-4 p-4 rounded-xl border transition-all
                              ${
                                result.status === "approved"
                                  ? "border-green-200 dark:border-green-700"
                                  : result.status === "rejected"
                                    ? "border-red-200 dark:border-red-700"
                                    : result.status === "manual"
                                      ? "border-gray-200 dark:border-gray-600"
                                      : "border-yellow-200 dark:border-yellow-700"
                              }
                            `}
                            style={{
                              backgroundColor: result.status === "approved"
                                ? `${themeColors.primary}10`
                                : result.status === "rejected"
                                  ? "rgba(239, 68, 68, 0.1)"
                                  : result.status === "manual"
                                    ? "rgba(156, 163, 175, 0.1)"
                                    : `${themeColors.secondary}10`
                            }}
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
                              {result.productName &&
                              result.productName !==
                                "Sin coincidencia encontrada" ? (
                                <div className="flex items-center gap-2 mt-1">
                                  <ExternalLink 
                                    className="w-3 h-3" 
                                    style={{ color: themeColors.primary }}
                                  />
                                  <span className="text-sm text-gray-600 dark:text-gray-300">
                                    {result.productName}
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
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full ${
                                      result.confidence >= 90
                                        ? "text-white"
                                        : result.confidence >= 70
                                          ? ""
                                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                    }`}
                                    style={{
                                      ...(result.confidence >= 90 && {
                                        backgroundColor: themeColors.primary,
                                        color: 'white'
                                      }),
                                      ...(result.confidence >= 70 && result.confidence < 90 && {
                                        backgroundColor: `${themeColors.secondary}30`,
                                        color: themeColors.secondary
                                      })
                                    }}
                                  >
                                    {result.confidence}% confianza
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Acciones */}
                            {result.prodVirtaId && result.status !== "rejected" && (
                              <div className="flex gap-2">
                                {result.status === "approved" ? (
                                  // Mostrar estado de aprobación
                                  <div className="flex items-center gap-2">
                                    {result.wasAutoAssigned && (
                                      <span className="text-xs text-green-600 dark:text-green-400 font-medium px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded">
                                        Auto-asignada
                                      </span>
                                    )}
                                    <div className="text-green-600 dark:text-green-400">
                                      <CheckCircle className="w-5 h-5" />
                                    </div>
                                  </div>
                                ) : result.status === "pending" ? (
                                  // Botones de aprobar/rechazar para pendientes
                                  <>
                                    <button
                                      onClick={() =>
                                        handleAcceptAssignment(result.imageId)
                                      }
                                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors dark:bg-green-900/30 dark:hover:bg-green-900/50"
                                      title="Aprobar asignación"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleRejectAssignment(result.imageId)
                                      }
                                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors dark:bg-red-900/30 dark:hover:bg-red-900/50"
                                      title="Rechazar asignación"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </>
                                ) : null}
                              </div>
                            )}

                            {result.status === "rejected" && (
                              <div className="text-red-600 dark:text-red-400">
                                <X className="w-5 h-5" />
                              </div>
                            )}

                            {result.status === "manual" && (
                              <div className="text-gray-400">
                                <AlertCircle className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200/50 dark:border-gray-700/50">
                <div className="flex justify-between">
                  <div className="flex gap-3">
                    {step === "review" && (
                      <button
                        onClick={() => setStep("config")}
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

                    {step === "config" && (
                      <button
                        onClick={processImages}
                        className="px-6 py-2 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                        style={{
                          backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`
                        }}
                      >
                        <Zap className="w-4 h-4" />
                        Procesar con IA
                      </button>
                    )}

                    {step === "review" && (
                      <button
                        onClick={handleApplyAssignments}
                        disabled={stats.assigned === 0}
                        className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {(() => {
                          // Calcular cuántas son aprobaciones manuales
                          const manuallyApproved = assignmentResults.filter(r => {
                            if (r.status !== "approved" || !r.prodVirtaId) return false;
                            
                            // Si auto-aprobar estaba activado, solo las bajo el umbral son manuales
                            if (autoApprove) {
                              return r.confidence < confidenceThreshold;
                            }
                            
                            // Si auto-aprobar estaba desactivado, TODAS son manuales
                            return true;
                          }).length;
                          
                          const autoAssigned = assignmentResults.filter(r =>
                            r.status === "approved" &&
                            autoApprove &&
                            r.confidence >= confidenceThreshold
                          ).length;
                          
                          if (manuallyApproved > 0) {
                            return `Asignar Aprobadas (${manuallyApproved})`;
                          } else if (autoAssigned > 0) {
                            return `Finalizar (${autoAssigned} auto-asignadas)`;
                          } else {
                            return "Finalizar";
                          }
                        })()}
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
  );
}
