/**
 * Componente para mostrar resultados del matching de imágenes
 * Muestra el producto principal matcheado y todos los candidatos con scores
 */

"use client";

import { motion } from "framer-motion";
import { CheckCircle, TrendingUp, Package, AlertCircle, Search } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";

interface MatchResult {
  imageUrl: string;
  matchScore: number;
  matchedProduct: {
    id?: string;
    prodVirtaId?: string;
    nombre: string;
    codigo?: string;
    precio?: number;
    categoria?: string;
    imagen?: string;
  } | null;
  visionData: {
    description?: string;
    detectedFeatures?: string[];
    suggestedCategory?: string;
    detectedBrand?: string;
    detectedModel?: string;
    detectedColor?: string;
    productName?: string;
    brand?: string;
    category?: string;
    subcategory?: string;
    keywords?: string[];
    confidence?: number;
  };
  allMatches?: Array<{
    product: {
      id?: string;
      prodVirtaId?: string;
      nombre: string;
      codigo?: string;
      precio?: number;
      categoria?: string;
      imagen?: string;
    };
    score: number;
    matchReasons?: string[];
  }>;
  processingTime: number;
}

interface ImageMatchResultsProps {
  result: MatchResult;
  isApproved?: boolean; // ✅ Estado de aprobación
  onToggleApproval?: () => void; // ✅ Callback para aprobar/rechazar
  onSelectProduct?: (productId: string) => void;
  onReject?: () => void;
}

export function ImageMatchResults({
  result,
  isApproved = false,
  onToggleApproval,
  onSelectProduct,
  onReject,
}: ImageMatchResultsProps) {
  const { themeColors } = useTheme();

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500/20 border-green-500/30";
    if (score >= 60) return "bg-yellow-500/20 border-yellow-500/30";
    return "bg-red-500/20 border-red-500/30";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excelente";
    if (score >= 60) return "Buena";
    if (score >= 40) return "Regular";
    return "Baja";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-6 rounded-2xl border border-white/10"
      style={{
        background: `linear-gradient(135deg, ${themeColors.surface}40, ${themeColors.surface}20)`,
      }}
    >
      {/* Header con imagen analizada */}
      <div className="flex items-start gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={result.imageUrl}
          alt="Imagen analizada"
          className="w-32 h-32 object-cover rounded-xl border-2 border-white/20"
        />

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Análisis Completado
            </h3>
          </div>

          {/* Información detectada por IA */}
          <div className="mb-3">
            {result.visionData.productName && (
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                🏷️ Producto: {result.visionData.productName}
              </p>
            )}
            {result.visionData.brand && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                🏢 Marca: {result.visionData.brand}
              </p>
            )}
            {result.visionData.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                📝 {result.visionData.description}
              </p>
            )}
            {result.visionData.confidence && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                🎯 Confianza de Detección: {(result.visionData.confidence * 100).toFixed(0)}%
              </p>
            )}
          </div>

          {/* Tags de características detectadas */}
          {result.visionData.keywords && result.visionData.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">Keywords:</span>
              {result.visionData.keywords.map((keyword, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300"
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}

          {/* Info adicional */}
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            {result.visionData.category && (
              <div className="flex items-center gap-1">
                <Package className="w-3 h-3" />
                {result.visionData.category}
                {result.visionData.subcategory && ` > ${result.visionData.subcategory}`}
              </div>
            )}
            <div>⏱️ {result.processingTime}ms</div>
          </div>
        </div>
      </div>

      {/* Producto principal matcheado */}
      {result.matchedProduct ? (
        <div
          className={`p-4 rounded-xl border-2 ${getScoreBg(result.matchScore)}`}
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200">
              🎯 Coincidencia con Catálogo
            </h4>
            <div className="flex items-center gap-2">
              <span
                className={`text-2xl font-bold ${getScoreColor(result.matchScore)}`}
              >
                {result.matchScore}%
              </span>
              <span className="text-xs text-gray-500">
                {getScoreLabel(result.matchScore)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-3">
            {result.matchedProduct.imagen && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={result.matchedProduct.imagen}
                alt={result.matchedProduct.nombre}
                className="w-20 h-20 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h5 className="font-semibold text-gray-900 dark:text-white">
                {result.matchedProduct.nombre}
              </h5>
              {result.matchedProduct.codigo && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Código: {result.matchedProduct.codigo}
                </p>
              )}
              {result.matchedProduct.precio && (
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  ${result.matchedProduct.precio.toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Razones del match */}
          {result.allMatches && result.allMatches.length > 0 && result.allMatches[0].matchReasons && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">
                📊 Criterios de matching:
              </p>
              <div className="flex flex-wrap gap-2">
                {result.allMatches[0].matchReasons.map((reason, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 text-xs rounded-md bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300"
                  >
                    ✓ {reason}
                  </span>
                ))}
              </div>
            </div>
          )}

          {onSelectProduct && (result.matchedProduct?.id || result.matchedProduct?.prodVirtaId) && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => onSelectProduct((result.matchedProduct?.id || result.matchedProduct?.prodVirtaId)!)}
                className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-all"
                style={{
                  background: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
                }}
              >
                ✓ Confirmar Producto
              </button>
              {onReject && (
                <button
                  onClick={onReject}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-white/10 hover:bg-white/20 transition-all"
                >
                  ✗ Rechazar
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-center gap-2 mb-2">
            {result.allMatches && result.allMatches.length > 0 ? (
              <>
                <Search className="w-5 h-5 text-amber-500" />
                <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300">
                  Coincidencias parciales encontradas
                </h4>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-red-500" />
                <h4 className="text-sm font-bold text-red-700 dark:text-red-300">
                  No se encontró coincidencia
                </h4>
              </>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            {result.allMatches && result.allMatches.length > 0
              ? "No se encontró coincidencia exacta, pero se encontraron productos similares por marca/nombre."
              : "La IA detectó el producto pero no se encontró en el inventario."}
          </p>
          {result.visionData.productName && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              💡 Producto detectado: <strong>{result.visionData.productName}</strong>
              {result.visionData.brand && ` de ${result.visionData.brand}`}
            </p>
          )}
        </div>
      )}

      {/* Todos los candidatos - mostrar cuando hay más de 1 match, o cuando NO hay match principal pero sí parciales */}
      {result.allMatches && result.allMatches.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
            {result.matchedProduct ? (
              <>
                <TrendingUp className="w-4 h-4" />
                Otras Coincidencias ({result.allMatches.length - 1})
              </>
            ) : (
              <>
                <Search className="w-4 h-4 text-amber-500" />
                Posibles Coincidencias ({result.allMatches.length})
              </>
            )}
          </h4>

          <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
            {result.allMatches
              .slice(result.matchedProduct ? 1 : 0, result.matchedProduct ? 5 : 10)
              .map((match, idx) => (
              <motion.div
                key={match.product.id || match.product.prodVirtaId || idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                onClick={() => {
                  const pid = match.product?.id || match.product?.prodVirtaId;
                  if (pid) onSelectProduct?.(pid);
                }}
              >
                {match.product.imagen && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={match.product.imagen}
                    alt={match.product.nombre}
                    className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                    {match.product.nombre}
                  </h5>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {match.product.codigo}
                  </p>
                  {/* Razones del match */}
                  {match.matchReasons && match.matchReasons.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {match.matchReasons.slice(0, 2).map((reason, ridx) => (
                        <span
                          key={ridx}
                          className="px-1.5 py-0.5 text-[10px] rounded bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        >
                          {reason}
                        </span>
                      ))}
                      {match.matchReasons.length > 2 && (
                        <span className="text-[10px] text-gray-400">
                          +{match.matchReasons.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-lg font-bold ${getScoreColor(match.score)}`}>
                    {match.score}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {getScoreLabel(match.score)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ✅ Botones de Aprobar/Rechazar */}
      {onToggleApproval && (
        <div className="mt-4 flex gap-3">
          <button
            onClick={onToggleApproval}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              isApproved
                ? "bg-green-500/20 text-green-600 dark:text-green-400 border-2 border-green-500"
                : "bg-white/5 text-gray-600 dark:text-gray-400 border-2 border-white/10 hover:bg-white/10"
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            {isApproved ? "Aprobado ✓" : "Aprobar Match"}
          </button>
          {onReject && (
            <button
              onClick={onReject}
              className="px-4 py-3 rounded-lg font-medium transition-all bg-red-500/10 text-red-600 dark:text-red-400 border-2 border-red-500/20 hover:bg-red-500/20"
            >
              Rechazar
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
