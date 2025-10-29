"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileJson, FileSpreadsheet, Download, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import { api, ClientBulkData, ClientBulkCreateResponse } from '@/api';
import { showToast } from '@/store/toast-helpers';

interface ClientImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ClientData {
  code?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  clientType?: 'individual' | 'company';
  taxId?: string;
  creditLimit?: number;
  paymentTerms?: number;
  paymentTerm?: string;
  [key: string]: unknown;
}

type UploadMethod = 'file' | 'json';

export function ClientImportModal({ isOpen, onClose, onSuccess }: ClientImportModalProps) {
  const { themeColors } = useTheme();
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>('file');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [jsonInput, setJsonInput] = useState('');
  const [uploadedData, setUploadedData] = useState<ClientData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Función helper para obtener valores seguros
  const getClientValue = (client: ClientData, field: keyof ClientData, defaultValue = '') => {
    const value = client[field];
    return value != null ? String(value) : defaultValue;
  };

  // Transformar datos al formato de la API
  const transformToAPIFormat = (clients: ClientData[]): ClientBulkData[] => {
    return clients.map(client => {
      const genderValue = getClientValue(client, 'gender', '');
      const statusValue = getClientValue(client, 'status', 'A');
      return {
        email: getClientValue(client, 'email'),
        firstName: getClientValue(client, 'firstName') || getClientValue(client, 'name', '').split(' ')[0] || '',
        lastName: getClientValue(client, 'lastName') || getClientValue(client, 'name', '').split(' ').slice(1).join(' ') || '',
        gender: (genderValue === 'M' || genderValue === 'F') ? genderValue : undefined,
        phone: getClientValue(client, 'phone', ''),
        phoneOptional: getClientValue(client, 'phoneOptional', '') || undefined,
        documentType: getClientValue(client, 'documentType', '') || undefined,
        document: getClientValue(client, 'document', '') || getClientValue(client, 'taxId', '') || undefined,
        customerClass: getClientValue(client, 'customerClass', '') || undefined,
        customerClassTwo: getClientValue(client, 'customerClassTwo', '') || undefined,
        customerClassThree: getClientValue(client, 'customerClassThree', '') || undefined,
        customerClassDist: getClientValue(client, 'customerClassDist', '') || undefined,
        latitude: typeof client.latitude === 'number' ? client.latitude : undefined,
        longitude: typeof client.longitude === 'number' ? client.longitude : undefined,
        status: (statusValue === 'A' || statusValue === 'N' || statusValue === 'I') ? statusValue : "A",
        distributorCodes: Array.isArray(client.distributorCodes) ? client.distributorCodes as string[] : undefined,
        information: {
          paymentMethodCode: getClientValue(client, 'paymentMethodCode', '') || undefined,
          companyCode: getClientValue(client, 'companyCode', '') || undefined,
          salesmanName: getClientValue(client, 'salesmanName', '') || undefined,
          visitDay: getClientValue(client, 'visitDay', '') || undefined,
          pdv: getClientValue(client, 'pdv', '') || undefined,
          deliveryDay: getClientValue(client, 'deliveryDay', '') || undefined,
          warehouse: getClientValue(client, 'warehouse', '') || undefined,
          frequency: getClientValue(client, 'frequency', '') || undefined,
          priceList: getClientValue(client, 'priceList', '') || undefined,
          routeName: getClientValue(client, 'routeName', '') || undefined,
          withCredit: typeof client.withCredit === 'boolean' ? client.withCredit : undefined,
          distributorName: getClientValue(client, 'distributorName', '') || undefined,
          sellerId: getClientValue(client, 'sellerId', '') || undefined,
          routeId: getClientValue(client, 'routeId', '') || undefined,
          clientCode: getClientValue(client, 'code', '') || getClientValue(client, 'clientCode', '') || undefined,
          pdvname: getClientValue(client, 'pdvname', '') || undefined,
          paymentTerm: getClientValue(client, 'paymentTerm', '') || undefined,
          customerClassDistTwo: getClientValue(client, 'customerClassDistTwo', '') || undefined
        }
      };
    });
  };

  // Validar JSON
  const validateJSON = (jsonString: string): { isValid: boolean; data?: ClientData[]; errors: string[] } => {
    const errors: string[] = [];
    
    try {
      const parsed = JSON.parse(jsonString);
      
      // Debe ser un array
      if (!Array.isArray(parsed)) {
        errors.push('El JSON debe ser un array de objetos');
        return { isValid: false, errors };
      }

      // Validar cada cliente
      parsed.forEach((client, index) => {
        if (!client.email) {
          errors.push(`Cliente ${index + 1}: El email es requerido`);
        }
        if (!client.firstName && !client.name) {
          errors.push(`Cliente ${index + 1}: El nombre es requerido`);
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
        email: "ejemplo@email.com",
        firstName: "Juan",
        lastName: "Pérez",
        phone: "+59899123456",
        documentType: "CI",
        document: "12345678",
        customerClass: "A",
        status: "A",
        distributorCodes: ["Dist01"]
      }
    ];

    const blob = new Blob([JSON.stringify(exampleData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ejemplo_clientes.json';
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

        console.log('[CLIENT IMPORT] 📤 Enviando clientes vía JSON...');
        const clientsForAPI = transformToAPIFormat(uploadedData);
        
        const apiResponse = await api.admin.clients.bulkCreate(clientsForAPI);
        
        if (apiResponse.success) {
          const response = apiResponse.data as ClientBulkCreateResponse;
          console.log('[CLIENT IMPORT] ✅ Respuesta:', response);
          
          if (response.results.errorCount > 0) {
            showToast({
              title: "Importación parcial",
              description: `${response.results.successCount} clientes importados, ${response.results.errorCount} con errores`,
              type: "warning"
            });
          } else {
            showToast({
              title: "Importación exitosa",
              description: `${response.results.successCount} clientes importados correctamente`,
              type: "success"
            });
          }
          
          // Cerrar modal y actualizar lista
          setTimeout(() => {
            onSuccess?.();
            handleClose();
          }, 1000);
        } else {
          throw new Error(apiResponse.message || 'Error al importar clientes');
        }
      } else if (uploadMethod === 'file' && uploadedFile) {
        // Importar desde archivo
        console.log('[CLIENT IMPORT] 📁 Enviando archivo...');
        
        const formData = new FormData();
        formData.append('file', uploadedFile);
        
        const response = await fetch('/api/clients/import', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
          throw new Error(errorData.message || `Error HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('[CLIENT IMPORT] ✅ Resultado:', result);
        
        if (result.details?.errorCount > 0) {
          showToast({
            title: "Importación parcial",
            description: `${result.details.savedCount} clientes importados, ${result.details.errorCount} con errores`,
            type: "warning"
          });
        } else {
          showToast({
            title: "Importación exitosa",
            description: "Los clientes se han importado correctamente",
            type: "success"
          });
        }
        
        setTimeout(() => {
          onSuccess?.();
          handleClose();
        }, 1000);
      } else {
        setError('Selecciona un archivo o ingresa un JSON válido');
      }
    } catch (error) {
      console.error('[CLIENT IMPORT] ❌ Error:', error);
      showToast({
        title: "Error al importar",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        type: "error"
      });
      setError(error instanceof Error ? error.message : "Error al importar clientes");
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
                Importar Clientes
              </h2>
              <p 
                className="text-sm mt-1"
                style={{ color: themeColors.text.secondary }}
              >
                Sube un archivo o pega JSON con los datos de los clientes
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
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
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
    "code": "CLI001",
    "name": "Cliente Ejemplo",
    "email": "cliente@ejemplo.com",
    ...
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
                        <span>JSON válido - {uploadedData.length} cliente(s) detectado(s)</span>
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
                    💡 Consejos para el JSON:
                  </p>
                  <ul className="text-xs space-y-1" style={{ color: themeColors.text.secondary }}>
                    <li>• Debe ser un array de objetos</li>
                    <li>• Las comillas deben ser dobles &quot;texto&quot;</li>
                    <li>• No olvides las comas entre elementos</li>
                    <li>• Los números van sin comillas: 123</li>
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
                  Importar Clientes
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
