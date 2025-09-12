"use client"

import { motion } from "framer-motion"
import { 
  X, 
  Trash2, 
  Download, 
  Tag, 
  ExternalLink,
  Sparkles,
  Archive,
  CheckCircle,
  AlertTriangle
} from "lucide-react"

interface BulkActionsBarProps {
  selectedCount: number
  onAssignToProducts: () => void
  onDelete: () => void
  onDownload: () => void
  onClearSelection: () => void
  onAddTags?: () => void
  onArchive?: () => void
}

export function BulkActionsBar({
  selectedCount,
  onAssignToProducts,
  onDelete,
  onDownload,
  onClearSelection,
  onAddTags,
  onArchive
}: BulkActionsBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.95 }}
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
    >
      <div className="bg-gradient-to-r from-white/95 to-gray-50/95 dark:from-slate-800/95 dark:to-slate-700/95 backdrop-blur-lg border border-white/20 dark:border-gray-700/30 rounded-2xl shadow-2xl px-6 py-4">
        <div className="flex items-center gap-6">
          {/* Contador de selección */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {selectedCount} imagen{selectedCount !== 1 ? 'es' : ''} seleccionada{selectedCount !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Elige una acción para aplicar
              </p>
            </div>
          </div>

          {/* Separador */}
          <div className="w-px h-8 bg-gray-200 dark:bg-gray-600"></div>

          {/* Acciones principales */}
          <div className="flex items-center gap-2">
            {/* Auto-asignar con IA */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAssignToProducts}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Auto-Asignar</span>
            </motion.button>

            {/* Asignar manualmente */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAssignToProducts}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-lg"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Asignar</span>
            </motion.button>

            {/* Agregar tags */}
            {onAddTags && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAddTags}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg"
              >
                <Tag className="w-4 h-4" />
                <span className="hidden sm:inline">Etiquetar</span>
              </motion.button>
            )}

            {/* Descargar */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDownload}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Descargar</span>
            </motion.button>

            {/* Archivar */}
            {onArchive && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onArchive}
                className="flex items-center gap-2 px-3 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg font-medium hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-all duration-200"
              >
                <Archive className="w-4 h-4" />
                <span className="hidden sm:inline">Archivar</span>
              </motion.button>
            )}
          </div>

          {/* Separador */}
          <div className="w-px h-8 bg-gray-200 dark:bg-gray-600"></div>

          {/* Acciones destructivas */}
          <div className="flex items-center gap-2">
            {/* Eliminar */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDelete}
              className="flex items-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-200 group"
            >
              <Trash2 className="w-4 h-4 group-hover:animate-pulse" />
              <span className="hidden sm:inline">Eliminar</span>
            </motion.button>

            {/* Cerrar */}
            <motion.button
              whileHover={{ scale: 1.05, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClearSelection}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Indicador de advertencia para acciones destructivas */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-600/50"
        >
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-3 h-3" />
            <span>
              Las acciones se aplicarán a todas las imágenes seleccionadas. 
              <strong className="ml-1">Esta acción no se puede deshacer.</strong>
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
