"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileJson, FileSpreadsheet, Download, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import { showToast } from '@/store/toast-helpers';
import { api } from '@/api';

interface PriceImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface PriceData {
  productSku: string;
  productName: string;
  basePrice: number;
  salePrice?: number;
  minQuantity?: number;
  currency?: string;
  validFrom?: string;
  validTo?: string;
  taxIncluded?: boolean;
  status?: 'active' | 'inactive';
  costPrice?: number;
  margin?: number;
  priceListId?: string;
  [key: string]: unknown;
}

type UploadMethod = 'file' | 'json';

export function PriceImportModal({ isOpen, onClose, onSuccess }: PriceImportModalProps) {
  const { themeColors } = useTheme();
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>('file');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [jsonInput, setJsonInput] = useState('');
  const [uploadedData, setUploadedData] = useState<PriceData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Validar JSON
  const validateJSON = (jsonString: string): { isValid: boolean; data?: PriceData[]; errors: string[] } => {
    const errors: string[] = [];
    
    try {
      const parsed = JSON.parse(jsonString);
      
      // Debe ser un array
      if (!Array.isArray(parsed)) {
        errors.push('El JSON debe ser un array de objetos');
        return { isValid: false, errors };
      }

      // Validar cada precio
      parsed.forEach((price, index) => {
        if (!price.productSku && !price.productName) {
          errors.push(`Precio ${index + 1}: Se requiere productSku o productName`);
        }
        if (price.basePrice == null || isNaN(Number(price.basePrice))) {
          errors.push(`Precio ${index + 1}: basePrice es requerido y debe ser un número`);
        }
      });

      return {
        isValid: errors.length === 0,
        data: parsed,
        errors
      };
    } catch (e) {
      errors.push('JSON inválido: ' + (e instanceof Error ? e.message : 'Error de sintaxis'));
      return { isValid: false, errors };
    }
  };

  // Manejar cambio de archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setError(null);
      setValidationErrors([]);
    }
  };

  // Manejar cambio de JSON
  const handleJsonChange = (value: string) => {
    setJsonInput(value);
    setError(null);
    
    if (value.trim()) {
      const validation = validateJSON(value);
      setValidationErrors(validation.errors);
      if (validation.isValid && validation.data) {
        setUploadedData(validation.data);
      }
    } else {
      setValidationErrors([]);
      setUploadedData([]);
    }
  };

  // Descargar archivo de ejemplo
  const handleDownloadExample = () => {
    const exampleData = [
      {
        productSku: "LAP001",
        productName: "Laptop Gaming RGB Ultra",
        basePrice: 1299.99,
        salePrice: 1199.99,
        minQuantity: 1,
        currency: "USD",
        validFrom: "2024-01-01",
        validTo: "2024-12-31",
        taxIncluded: false,
        status: "active",
        costPrice: 999.99,
        margin: 30,
        priceListId: "PRICE_LIST_001"
      },
      {
        productSku: "MON002",
        productName: "Monitor Curvo 27 pulgadas",
        basePrice: 399.99,
        salePrice: 369.99,
        minQuantity: 1,
        currency: "USD",
        validFrom: "2024-01-01",
        validTo: "2024-12-31",
        taxIncluded: false,
        status: "active",
        costPrice: 299.99,
        margin: 33,
        priceListId: "PRICE_LIST_001"
      }
    ];

    const blob = new Blob([JSON.stringify(exampleData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ejemplo_precios.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    showToast({
      title: "Archivo descargado",
      description: "Se ha descargado el archivo de ejemplo",
      type: "success"
    });
  };

  // Transformar datos al formato API
  const transformToAPIFormat = (data: PriceData[]) => {
    return data.map((price, index) => ({
      name: price.productName || `Precio ${index + 1}`,
      priceId: price.priceListId || `PRICE_${Date.now()}_${index}`,
      productSku: price.productSku || "",
      productName: price.productName || "",
      basePrice: Number(price.basePrice || price.salePrice || 0),
      salePrice: Number(price.salePrice || price.basePrice || 0),
      minQuantity: Number(price.minQuantity || 1),
      currency: (price.currency || "USD").toUpperCase(),
      validFrom: price.validFrom || new Date().toISOString(),
      validUntil: price.validTo || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      taxIncluded: Boolean(price.taxIncluded),
      status: (price.status === "active" || price.status === "inactive" ? price.status : "active") as "active" | "inactive" | "draft",
      costPrice: Number(price.costPrice || 0),
      margin: Number(price.margin || 0),
    }));
  };

  // Procesar importación
  const handleImport = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      if (uploadMethod === 'json') {
        // Importar desde JSON
        if (uploadedData.length === 0) {
          setError('No hay datos para importar');
          setIsProcessing(false);
          return;
        }

        console.log('[PRICE IMPORT] 📤 Enviando precios vía JSON...');
        
        const transformedData = transformToAPIFormat(uploadedData);
        const response = await api.admin.prices.bulkCreate(transformedData);
        
        console.log('[PRICE IMPORT] ✅ Resultado:', response);
        
        showToast({
          title: "Importación exitosa",
          description: `${uploadedData.length} precio(s) importado(s) correctamente`,
          type: "success"
        });
        
        setTimeout(() => {
          onSuccess?.();
          handleClose();
        }, 1000);
      } else if (uploadMethod === 'file' && uploadedFile) {
        // Importar desde archivo
        console.log('[PRICE IMPORT] 📁 Enviando archivo...');
        
        const formData = new FormData();
        formData.append('file', uploadedFile);
        
        const response = await api.admin.prices.bulkCreate(formData);
        
        console.log('[PRICE IMPORT] ✅ Resultado:', response);
        
        showToast({
          title: "Importación exitosa",
          description: "Los precios se han importado correctamente",
          type: "success"
        });
        
        setTimeout(() => {
          onSuccess?.();
          handleClose();
        }, 1000);
      } else {
        setError('Selecciona un archivo o ingresa un JSON válido');
      }
    } catch (error) {
      console.error('[PRICE IMPORT] ❌ Error:', error);
      showToast({
        title: "Error al importar",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        type: "error"
      });
      setError(error instanceof Error ? error.message : "Error al importar precios");
    } finally {
      setIsProcessing(false);
    }
  };

  // Cerrar y limpiar
  const handleClose = () => {
    setUploadedFile(null);
    setJsonInput('');
    setUploadedData([]);
    setError(null);
    setValidationErrors([]);
    setIsProcessing(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="rounded-2xl p-6 max-w-3xl w-full border shadow-2xl max-h-[90vh] overflow-y-auto"
          style={{
            backgroundColor: themeColors.surface,
            borderColor: themeColors.primary + "30"
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 
                className="text-2xl font-bold"
                style={{ color: themeColors.text.primary }}
              >
                Importar Precios
              </h2>
              <p 
                className="text-sm mt-1"
                style={{ color: themeColors.text.secondary }}
              >
                Sube un archivo o pega JSON con los datos de los precios
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              style={{ color: themeColors.text.secondary }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setUploadMethod('file')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
              style={{
                backgroundColor: uploadMethod === 'file' ? themeColors.primary : 'transparent',
                color: uploadMethod === 'file' ? 'white' : themeColors.text.secondary,
                border: `2px solid ${uploadMethod === 'file' ? themeColors.primary : themeColors.primary + '30'}`
              }}
            >
              <FileSpreadsheet className="w-5 h-5" />
              Subir Archivo
            </button>
            <button
              onClick={() => setUploadMethod('json')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
              style={{
                backgroundColor: uploadMethod === 'json' ? themeColors.primary : 'transparent',
                color: uploadMethod === 'json' ? 'white' : themeColors.text.secondary,
                border: `2px solid ${uploadMethod === 'json' ? themeColors.primary : themeColors.primary + '30'}`
              }}
            >
              <FileJson className="w-5 h-5" />
              Importar JSON
            </button>
          </div>

          {/* Download Example */}
          <button
            onClick={handleDownloadExample}
            className="flex items-center gap-2 px-4 py-2 rounded-lg mb-6 transition-all"
            style={{
              backgroundColor: themeColors.accent + '20',
              color: themeColors.text.primary,
              border: `1px solid ${themeColors.accent + '40'}`
            }}
          >
            <Download className="w-4 h-4" />
            Descargar JSON de Ejemplo
          </button>

          {/* Content */}
          <div className="mb-6">
            {uploadMethod === 'file' ? (
              <div
                className="border-2 border-dashed rounded-2xl p-8 text-center transition-all hover:border-opacity-80"
                style={{ borderColor: themeColors.primary + '40' }}
              >
                <Upload className="w-16 h-16 mx-auto mb-4" style={{ color: themeColors.primary }} />
                <p className="mb-4" style={{ color: themeColors.text.primary }}>
                  Arrastra tu archivo aquí
                </p>
                <p className="text-sm mb-4" style={{ color: themeColors.text.secondary }}>
                  o haz clic para seleccionar
                </p>
                <p className="text-xs mb-4" style={{ color: themeColors.text.secondary }}>
                  CSV, XLSX, JSON
                </p>
                <input
                  type="file"
                  accept=".csv,.xlsx,.json"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload-price"
                />
                <label
                  htmlFor="file-upload-price"
                  className="inline-block px-6 py-3 rounded-lg cursor-pointer transition-all text-white"
                  style={{
                    background: `linear-gradient(45deg, ${themeColors.primary}, ${themeColors.secondary})`
                  }}
                >
                  Seleccionar Archivo
                </label>
                {uploadedFile && (
                  <p className="mt-4 text-sm" style={{ color: themeColors.text.primary }}>
                    ✓ {uploadedFile.name}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: themeColors.text.primary }}>
                  Pega tu JSON aquí:
                </label>
                <textarea
                  value={jsonInput}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  placeholder='Ejemplo:
[
  {
    "productSku": "LAP001",
    "productName": "Laptop Gaming",
    "basePrice": 1299.99,
    "salePrice": 1199.99,
    "currency": "USD",
    "status": "active"
  }
]'
                  className="w-full h-64 p-4 rounded-lg font-mono text-sm border-2"
                  style={{
                    backgroundColor: themeColors.surface + '50',
                    borderColor: themeColors.primary + '30',
                    color: themeColors.text.primary
                  }}
                />
                
                {/* Validation Info */}
                {jsonInput && (
                  <div className="mt-4">
                    {validationErrors.length === 0 ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span>JSON válido - {uploadedData.length} precio(s) detectado(s)</span>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2 text-red-600 mb-2">
                          <AlertCircle className="w-5 h-5" />
                          <span className="font-semibold">Errores encontrados:</span>
                        </div>
                        <ul className="list-disc list-inside text-sm space-y-1 text-red-500">
                          {validationErrors.map((err, idx) => (
                            <li key={idx}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Tips */}
                <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: themeColors.primary + '10' }}>
                  <p className="text-sm font-semibold mb-2" style={{ color: themeColors.text.primary }}>
                    💡 Campos requeridos:
                  </p>
                  <ul className="text-xs space-y-1" style={{ color: themeColors.text.secondary }}>
                    <li>• <strong>productSku</strong> o <strong>productName</strong>: Identificación del producto</li>
                    <li>• <strong>basePrice</strong>: Precio base (número)</li>
                    <li className="mt-2">Opcionales: salePrice, currency (USD/UYU), minQuantity, status (active/inactive)</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div 
              className="mb-6 p-4 rounded-lg border flex items-start gap-3"
              style={{
                backgroundColor: '#fee',
                borderColor: '#fcc'
              }}
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="px-6 py-3 rounded-lg transition-all"
              style={{
                color: themeColors.text.secondary,
                backgroundColor: themeColors.surface + "50"
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleImport}
              disabled={isProcessing || (uploadMethod === 'json' && validationErrors.length > 0) || (uploadMethod === 'file' && !uploadedFile)}
              className="px-6 py-3 rounded-lg transition-all text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(45deg, ${themeColors.primary}, ${themeColors.secondary})`
              }}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Importar Precios
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
