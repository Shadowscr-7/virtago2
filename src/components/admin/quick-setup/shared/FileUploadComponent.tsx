import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Download, X } from 'lucide-react';
import { ThemeColors, UploadMethod, UploadResult } from '../shared/types';

interface FileUploadProps<T> {
  method: UploadMethod;
  onUpload: (result: UploadResult<T>) => void;
  onFileSelect?: (file: File) => void; // Callback para cuando se selecciona un archivo
  onBack: () => void;
  themeColors: ThemeColors;
  sampleData: T[];
  title: string;
  acceptedFileTypes: string;
  fileExtensions: string[];
  isProcessing?: boolean;
  parseFile?: (file: File) => Promise<T[]>; // Optional file parser function
}

export function FileUploadComponent<T>({
  method,
  onUpload,
  onFileSelect,
  onBack,
  themeColors,
  sampleData,
  title,
  acceptedFileTypes,
  fileExtensions,
  isProcessing = false,
  parseFile: parseFileFn
}: FileUploadProps<T>) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [jsonInput, setJsonInput] = useState('');
  const [validationMessage, setValidationMessage] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [isParsingFile, setIsParsingFile] = useState(false);
  
  // Ref para resetear el input file
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFile = async (file: File) => {
    setUploadedFile(file);
    
    // Notificar al componente padre que se seleccionó un archivo
    if (onFileSelect) {
      onFileSelect(file);
    }
    
    // Si hay una función de parseo, usarla
    if (parseFileFn) {
      setIsParsingFile(true);
      setValidationMessage({ type: null, message: '' });
      
      try {
        const parsedData = await parseFileFn(file);
        
        if (parsedData.length === 0) {
          onUpload({ 
            data: [], 
            success: false, 
            error: 'El archivo no contiene datos válidos o está vacío' 
          });
          setValidationMessage({
            type: 'error',
            message: 'El archivo no contiene datos válidos'
          });
        } else {
          onUpload({ data: parsedData, success: true });
          setValidationMessage({
            type: 'success',
            message: `✓ Se procesaron ${parsedData.length} registro(s) correctamente`
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido al procesar el archivo';
        onUpload({ 
          data: [], 
          success: false, 
          error: errorMessage 
        });
        setValidationMessage({
          type: 'error',
          message: errorMessage
        });
      } finally {
        setIsParsingFile(false);
        // Resetear el input file para permitir subir el mismo archivo modificado
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } else {
      // Fallback: usar datos de ejemplo si no hay parser
      onUpload({ data: sampleData, success: true });
      // Resetear el input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const validateJson = (input: string): { valid: boolean; error?: string; cleaned?: string; parsed?: T[] } => {
    // Limpiar el input de espacios en blanco y caracteres invisibles
    let cleanedInput = input.trim().replace(/[\u200B-\u200D\uFEFF]/g, '');
    
    // Detectar y reportar problemas comunes
    if (!cleanedInput) {
      return { valid: false, error: "Por favor ingresa un JSON válido" };
    }

    // Verificar que empiece con [ y termine con ]
    if (!cleanedInput.startsWith('[')) {
      return { valid: false, error: "El JSON debe empezar con '[' (debe ser un array)" };
    }
    
    // Si no termina con ], buscar el último ] y cortar ahí
    if (!cleanedInput.endsWith(']')) {
      const lastBracketIndex = cleanedInput.lastIndexOf(']');
      if (lastBracketIndex !== -1) {
        cleanedInput = cleanedInput.substring(0, lastBracketIndex + 1);
      } else {
        return { valid: false, error: "El JSON debe terminar con ']' (debe ser un array)" };
      }
    }

    // Para JSONs grandes, omitir validaciones línea por línea que pueden ser problemáticas
    // y confiar en el parseo directo de JSON.parse()

    // Intentar parsear el JSON para verificar si es válido
    try {
      const parsed = JSON.parse(cleanedInput);
      if (!Array.isArray(parsed)) {
        return { 
          valid: false, 
          error: "El JSON debe ser un array de objetos" 
        };
      }
      
      // Verificar que el array no esté vacío
      if (parsed.length === 0) {
        return { 
          valid: false, 
          error: "El JSON no puede estar vacío" 
        };
      }
      
      return { valid: true, cleaned: cleanedInput, parsed };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Formato inválido';
      
      // Intentar dar un mensaje más útil basado en el tipo de error
      if (errorMsg.includes('Unexpected token')) {
        return { 
          valid: false, 
          error: `Error de formato JSON: Carácter inesperado. Verifica que no haya comas extras, llaves sin cerrar, o comillas mal formateadas.` 
        };
      }
      
      if (errorMsg.includes('position')) {
        return { 
          valid: false, 
          error: `Error de sintaxis JSON: ${errorMsg}. Revisa el formato cerca de esa posición.` 
        };
      }
      
      return { 
        valid: false, 
        error: `Error de sintaxis JSON: ${errorMsg}` 
      };
    }
  };

  const handleJsonSubmit = () => {
    const validation = validateJson(jsonInput);
    
    if (!validation.valid) {
      onUpload({ 
        data: [], 
        success: false, 
        error: validation.error 
      });
      return;
    }

    // Si ya tenemos el JSON parseado de la validación, usarlo directamente
    if (validation.parsed && Array.isArray(validation.parsed)) {
      onUpload({ data: validation.parsed, success: true });
      return;
    }

    try {
      const parsedData = JSON.parse(validation.cleaned!);
      if (Array.isArray(parsedData)) {
        onUpload({ data: parsedData, success: true });
      } else {
        onUpload({ data: [], success: false, error: "El JSON debe ser un array de objetos" });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      // Extraer información útil del error de parsing
      let friendlyError = `JSON inválido: ${errorMessage}`;
      
      if (errorMessage.includes('position')) {
        const match = errorMessage.match(/position (\d+)/);
        if (match) {
          const position = parseInt(match[1]);
          const lines = jsonInput.split('\n');
          let currentPos = 0;
          let lineNumber = 1;
          
          for (const line of lines) {
            if (currentPos + line.length >= position) {
              const columnNumber = position - currentPos + 1;
              friendlyError = `JSON inválido en la línea ${lineNumber}, columna ${columnNumber}: ${errorMessage}`;
              break;
            }
            currentPos += line.length + 1; // +1 for newline
            lineNumber++;
          }
        }
      }
      
      onUpload({ 
        data: [], 
        success: false, 
        error: friendlyError
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
            <div className="flex items-center justify-center gap-2 text-sm" style={{ color: themeColors.text.secondary }}>
              <div className="w-2 h-2 rounded-full bg-current animate-pulse delay-300"></div>
              Guardando en el servidor...
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
          Descargar {method === "json" ? "JSON" : "archivo"} de Ejemplo
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
            ref={fileInputRef}
            type="file"
            accept={acceptedFileTypes}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <Upload className="w-16 h-16 mx-auto mb-4" style={{ color: themeColors.primary }} />
          <h4 className="text-xl font-semibold mb-2" style={{ color: themeColors.text.primary }}>
            {isParsingFile ? "Procesando archivo..." : uploadedFile ? `Archivo: ${uploadedFile.name}` : "Arrastra tu archivo aquí"}
          </h4>
          <p className="mb-4" style={{ color: themeColors.text.secondary }}>
            {isParsingFile ? "Leyendo y validando datos..." : uploadedFile ? "Archivo cargado correctamente" : "o haz clic para seleccionar"}
          </p>
          <div className="flex items-center justify-center gap-4 text-sm" style={{ color: themeColors.text.secondary }}>
            {fileExtensions.map(ext => (
              <span key={ext}>{ext.toUpperCase()}</span>
            ))}
          </div>
          
          {/* Loading spinner for file parsing */}
          {isParsingFile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-transparent rounded-full mx-auto"
                style={{ 
                  borderTopColor: themeColors.primary,
                  borderRightColor: themeColors.primary 
                }}
              />
            </motion.div>
          )}
          
          {/* Validation message for file upload */}
          {validationMessage.type && !isParsingFile && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded-lg text-sm"
              style={{
                backgroundColor: validationMessage.type === 'success' ? `${themeColors.secondary}20` : '#fef2f2',
                color: validationMessage.type === 'success' ? themeColors.secondary : '#dc2626'
              }}
            >
              {validationMessage.message}
            </motion.div>
          )}
        </motion.div>
      ) : (
        /* JSON Input */
        <div className="space-y-4">
          {/* Mensaje de Validación */}
          {validationMessage.type && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="p-4 rounded-xl border-2 relative overflow-hidden"
              style={{
                borderColor: validationMessage.type === 'success' ? themeColors.secondary : '#ef4444',
                backgroundColor: validationMessage.type === 'success' ? `${themeColors.secondary}10` : '#fef2f2'
              }}
            >
              {/* Gradiente animado de fondo */}
              <motion.div
                className="absolute inset-0 opacity-10"
                animate={{
                  background: validationMessage.type === 'success'
                    ? [`linear-gradient(45deg, ${themeColors.secondary}, ${themeColors.primary})`, `linear-gradient(45deg, ${themeColors.primary}, ${themeColors.secondary})`]
                    : ['linear-gradient(45deg, #ef4444, #f87171)', 'linear-gradient(45deg, #f87171, #ef4444)']
                }}
                transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
              />
              
              <div className="relative z-10 flex items-start gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{
                    backgroundColor: validationMessage.type === 'success' ? themeColors.secondary : '#ef4444'
                  }}
                >
                  {validationMessage.type === 'success' ? '✓' : '✗'}
                </motion.div>
                
                <div className="flex-1">
                  <motion.h4
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="font-semibold text-sm"
                    style={{
                      color: validationMessage.type === 'success' ? themeColors.secondary : '#dc2626'
                    }}
                  >
                    {validationMessage.type === 'success' ? 'Validación Exitosa' : 'Error de Validación'}
                  </motion.h4>
                  
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm mt-1"
                    style={{
                      color: validationMessage.type === 'success' ? themeColors.text.primary : '#b91c1c'
                    }}
                  >
                    {validationMessage.message}
                  </motion.p>
                  
                  {validationMessage.type === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="mt-3 flex items-center gap-2 text-xs"
                      style={{ color: themeColors.secondary }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="w-3 h-3"
                      >
                        ⚡
                      </motion.div>
                      Ahora puedes procesar tu JSON con confianza
                    </motion.div>
                  )}
                </div>
                
                <motion.button
                  onClick={() => setValidationMessage({ type: null, message: '' })}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-200 hover:bg-opacity-20"
                  style={{
                    color: validationMessage.type === 'success' ? themeColors.secondary : '#dc2626',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = validationMessage.type === 'success' 
                      ? `${themeColors.secondary}20` 
                      : '#fecaca';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  ×
                </motion.button>
              </div>
            </motion.div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>
              Pega tu JSON aquí:
            </label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={`Pega aquí tu JSON de ${title.toLowerCase()}...

Ejemplo:
[
  {
    "code": "CLI001",
    "name": "Cliente Ejemplo",
    "email": "cliente@ejemplo.com",
    ...
  }
]`}
              className="w-full h-64 p-4 rounded-xl resize-none font-mono text-sm"
              style={{
                backgroundColor: `${themeColors.surface}50`,
                border: `2px solid ${themeColors.primary}30`,
                color: themeColors.text.primary,
              }}
            />
          </div>
          
          <div className="text-sm space-y-2" style={{ color: themeColors.text.secondary }}>
            <h5 className="font-medium">💡 Consejos para el JSON:</h5>
            <ul className="text-xs space-y-1 list-disc list-inside">
              <li>Debe ser un array de objetos [{"{"} {"}"}, {"{"} {"}"} ]</li>
              <li>Las comillas deben ser dobles &quot;texto&quot;</li>
              <li>No olvides las comas entre elementos</li>
              <li>Los números van sin comillas: 123</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <motion.button
              onClick={() => {
                const validation = validateJson(jsonInput);
                if (validation.valid) {
                  setValidationMessage({
                    type: 'success',
                    message: 'JSON válido! El formato es correcto y listo para procesar.'
                  });
                } else {
                  setValidationMessage({
                    type: 'error',
                    message: validation.error || 'Error desconocido de validación'
                  });
                }
                // Auto-ocultar después de 5 segundos
                setTimeout(() => {
                  setValidationMessage({ type: null, message: '' });
                }, 5000);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!jsonInput.trim()}
              className="px-4 py-3 rounded-xl font-medium transition-all duration-200"
              style={{
                backgroundColor: jsonInput.trim() ? `${themeColors.secondary}20` : `${themeColors.secondary}10`,
                color: jsonInput.trim() ? themeColors.secondary : themeColors.text.secondary,
                border: `2px solid ${jsonInput.trim() ? themeColors.secondary : `${themeColors.secondary}30`}`,
              }}
            >
              Validar JSON
            </motion.button>
            
            <motion.button
              onClick={handleJsonSubmit}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!jsonInput.trim()}
              className="flex-1 py-3 rounded-xl font-medium transition-all duration-200"
              style={{
                backgroundColor: jsonInput.trim() ? themeColors.primary : `${themeColors.primary}30`,
                color: jsonInput.trim() ? 'white' : themeColors.text.secondary,
              }}
            >
              Cargar Datos
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}