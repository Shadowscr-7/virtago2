import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Download, X } from 'lucide-react';
import { ThemeColors, UploadMethod, UploadResult } from '../shared/types';

interface FileUploadProps<T> {
  method: UploadMethod;
  onUpload: (result: UploadResult<T>) => void;
  onBack: () => void;
  themeColors: ThemeColors;
  sampleData: T[];
  title: string;
  acceptedFileTypes: string;
  fileExtensions: string[];
  isProcessing?: boolean;
}

export function FileUploadComponent<T>({
  method,
  onUpload,
  onBack,
  themeColors,
  sampleData,
  title,
  acceptedFileTypes,
  fileExtensions,
  isProcessing = false
}: FileUploadProps<T>) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [jsonInput, setJsonInput] = useState('');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setUploadedFile(file);
    // Por ahora usar datos de ejemplo, luego implementar parser real
    onUpload({ data: sampleData, success: true });
  };

  const handleJsonSubmit = () => {
    try {
      const parsedData = JSON.parse(jsonInput);
      if (Array.isArray(parsedData)) {
        onUpload({ data: parsedData, success: true });
      } else {
        onUpload({ data: [], success: false, error: "El JSON debe ser un array" });
      }
    } catch (error) {
      onUpload({ 
        data: [], 
        success: false, 
        error: "JSON inválido: " + (error as Error).message 
      });
    }
  };

  const downloadSample = () => {
    if (method === "json") {
      const jsonContent = JSON.stringify(sampleData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.toLowerCase().replace(/\s+/g, '_')}_ejemplo.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      // Generar CSV basado en las claves del primer objeto
      if (sampleData.length > 0) {
        const headers = Object.keys(sampleData[0] as object);
        const csvContent = headers.join(',') + '\n' +
          sampleData.map(item => 
            headers.map(header => `"${(item as Record<string, unknown>)[header]}"`).join(',')
          ).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.toLowerCase().replace(/\s+/g, '_')}_ejemplo.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    }
  };

  if (isProcessing) {
    return (
      <div className="text-center space-y-6">
        <div className="flex items-center justify-between mb-6">
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg"
            style={{ color: themeColors.text.secondary }}
          >
            <X className="w-4 h-4" />
            Cancelar
          </motion.button>
          <h3 className="text-xl font-semibold" style={{ color: themeColors.text.primary }}>
            Procesando...
          </h3>
          <div></div>
        </div>

        <div 
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: `${themeColors.primary}20` }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-transparent rounded-full"
            style={{ 
              borderTopColor: themeColors.primary,
              borderRightColor: themeColors.primary 
            }}
          />
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold" style={{ color: themeColors.text.primary }}>
            Procesando {title}
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm" style={{ color: themeColors.text.secondary }}>
              <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
              Validando formato...
            </div>
            <div className="flex items-center justify-center gap-2 text-sm" style={{ color: themeColors.text.secondary }}>
              <div className="w-2 h-2 rounded-full bg-current animate-pulse delay-150"></div>
              Procesando datos...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold" style={{ color: themeColors.text.primary }}>
          {method === "file" ? "Subir Archivo" : "Importar JSON"} - {title}
        </h3>
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-lg"
          style={{ color: themeColors.text.secondary }}
        >
          <X className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Sample Download */}
      <div className="text-center">
        <motion.button
          onClick={downloadSample}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium"
          style={{
            backgroundColor: `${themeColors.secondary}20`,
            color: themeColors.secondary,
          }}
        >
          <Download className="w-4 h-4" />
          Descargar {method === "json" ? "JSON" : "CSV"} de Ejemplo
        </motion.button>
      </div>

      {method === "file" ? (
        /* File Upload */
        <motion.div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer
            ${dragActive ? 'scale-105 border-opacity-100' : 'border-opacity-50'}
          `}
          style={{
            borderColor: dragActive ? themeColors.primary : `${themeColors.primary}50`,
            backgroundColor: dragActive ? `${themeColors.primary}10` : `${themeColors.surface}30`,
          }}
        >
          <input
            type="file"
            accept={acceptedFileTypes}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <Upload className="w-16 h-16 mx-auto mb-4" style={{ color: themeColors.primary }} />
          <h4 className="text-xl font-semibold mb-2" style={{ color: themeColors.text.primary }}>
            {uploadedFile ? `Archivo: ${uploadedFile.name}` : "Arrastra tu archivo aquí"}
          </h4>
          <p className="mb-4" style={{ color: themeColors.text.secondary }}>
            {uploadedFile ? "Archivo cargado correctamente" : "o haz clic para seleccionar"}
          </p>
          <div className="flex items-center justify-center gap-4 text-sm" style={{ color: themeColors.text.secondary }}>
            {fileExtensions.map(ext => (
              <span key={ext}>{ext.toUpperCase()}</span>
            ))}
          </div>
        </motion.div>
      ) : (
        /* JSON Input */
        <div className="space-y-4">
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={`Pega aquí tu JSON de ${title.toLowerCase()}...`}
            className="w-full h-64 p-4 rounded-xl resize-none font-mono text-sm"
            style={{
              backgroundColor: `${themeColors.surface}50`,
              border: `2px solid ${themeColors.primary}30`,
              color: themeColors.text.primary,
            }}
          />
          <motion.button
            onClick={handleJsonSubmit}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={!jsonInput.trim()}
            className="w-full py-3 rounded-xl font-medium transition-all duration-200"
            style={{
              backgroundColor: jsonInput.trim() ? themeColors.primary : `${themeColors.primary}30`,
              color: jsonInput.trim() ? 'white' : themeColors.text.secondary,
            }}
          >
            Procesar JSON
          </motion.button>
        </div>
      )}
    </div>
  );
}