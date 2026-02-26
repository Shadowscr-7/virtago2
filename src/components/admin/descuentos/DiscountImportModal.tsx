"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileJson, FileSpreadsheet, Download, AlertCircle, CheckCircle, Loader2, Table } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import { api, DiscountBulkData, DiscountBulkCreateResponse } from '@/api';
import { showToast } from '@/store/toast-helpers';
import { useAuthStore } from '@/store/auth';
import { ColumnMappingModal, ColumnMapping, ImportSchema, SchemaColumn } from '../shared/ColumnMappingModal';
import { parseFile } from '@/lib/file-parser';

interface DiscountImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type UploadMethod = 'file' | 'json';

interface ImportResultRow {
  name: string;
  discountId: string;
  type: string;
  status: 'success' | 'error';
  message?: string;
}

export function DiscountImportModal({ isOpen, onClose, onSuccess }: DiscountImportModalProps) {
  const { themeColors } = useTheme();
  const { token } = useAuthStore();
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>('file');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [jsonInput, setJsonInput] = useState('');
  const [uploadedData, setUploadedData] = useState<Record<string, unknown>[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);

  // Column mapping state
  const [showColumnMapping, setShowColumnMapping] = useState(false);
  const [fileColumns, setFileColumns] = useState<string[]>([]);
  const [fileRawData, setFileRawData] = useState<Record<string, unknown>[]>([]);
  const [isParsingFile, setIsParsingFile] = useState(false);

  // Auto-match state
  const [columnsMatch, setColumnsMatch] = useState(false);
  const [autoMapping, setAutoMapping] = useState<ColumnMapping>({});
  const [formatWarning, setFormatWarning] = useState<string | null>(null);

  // Import results state
  const [importResults, setImportResults] = useState<ImportResultRow[] | null>(null);
  const [importSummary, setImportSummary] = useState<{ success: number; errors: number } | null>(null);

  const getValue = (row: Record<string, unknown>, field: string, defaultValue = '') => {
    const value = row[field];
    return value != null ? String(value) : defaultValue;
  };

  // Transformar datos al formato de la API
  const transformToAPIFormat = (data: Record<string, unknown>[]): DiscountBulkData[] => {
    return data.map((row, index) => {
      const typeValue = getValue(row, 'type', 'percentage');
      const validTypes = ['percentage', 'fixed_amount', 'tiered_percentage', 'progressive_percentage'];
      return {
        discount_id: getValue(row, 'discount_id') || getValue(row, 'discountId') || `DISC_${Date.now()}_${index}`,
        name: getValue(row, 'name'),
        description: getValue(row, 'description', '') || undefined,
        type: (validTypes.includes(typeValue) ? typeValue : 'percentage') as DiscountBulkData['type'],
        discount_value: Number(row.discount_value || row.discountValue || 0),
        currency: (getValue(row, 'currency', 'USD')).toUpperCase(),
        valid_from: getValue(row, 'valid_from') || getValue(row, 'validFrom') || new Date().toISOString(),
        valid_to: getValue(row, 'valid_to') || getValue(row, 'validTo') || undefined,
        status: (['active', 'inactive', 'draft'].includes(getValue(row, 'status', ''))
          ? getValue(row, 'status') as 'active' | 'inactive' | 'draft'
          : 'active'),
        priority: row.priority != null ? Number(row.priority) : undefined,
        is_cumulative: typeof row.is_cumulative === 'boolean' ? row.is_cumulative : undefined,
        max_discount_amount: row.max_discount_amount != null ? Number(row.max_discount_amount) : undefined,
        min_purchase_amount: row.min_purchase_amount != null ? Number(row.min_purchase_amount) : undefined,
        customer_type: (['all', 'retail', 'wholesale', 'vip'].includes(getValue(row, 'customer_type', ''))
          ? getValue(row, 'customer_type') as DiscountBulkData['customer_type']
          : undefined),
        channel: (['online', 'offline', 'omnichannel', 'b2b', 'all'].includes(getValue(row, 'channel', ''))
          ? getValue(row, 'channel') as DiscountBulkData['channel']
          : undefined),
        region: getValue(row, 'region', '') || undefined,
        category: getValue(row, 'category', '') || undefined,
      };
    });
  };

  // Validar JSON
  const validateJSON = (jsonString: string): { isValid: boolean; data?: Record<string, unknown>[]; errors: string[] } => {
    const errors: string[] = [];

    try {
      const parsed = JSON.parse(jsonString);

      if (!Array.isArray(parsed)) {
        errors.push('El JSON debe ser un array de objetos');
        return { isValid: false, errors };
      }

      parsed.forEach((discount: Record<string, unknown>, index: number) => {
        if (!discount.name) errors.push(`Descuento ${index + 1}: El nombre es requerido`);
        if (!discount.type) errors.push(`Descuento ${index + 1}: El tipo es requerido (percentage, fixed_amount, etc.)`);
        if (discount.discount_value == null && discount.discountValue == null) errors.push(`Descuento ${index + 1}: El valor del descuento es requerido`);
        if (!discount.currency) errors.push(`Descuento ${index + 1}: La moneda es requerida`);
      });

      return { isValid: errors.length === 0, data: parsed, errors };
    } catch (e) {
      errors.push('JSON inválido: ' + (e instanceof Error ? e.message : 'Error de sintaxis'));
      return { isValid: false, errors };
    }
  };

  // Manejar cambio de archivo
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setError(null);
    setValidationErrors([]);
    setImportResults(null);
    setImportSummary(null);
    setColumnsMatch(false);
    setAutoMapping({});
    setFormatWarning(null);

    setIsParsingFile(true);
    try {
      const rawData = await parseFile<Record<string, unknown>>(file);

      if (rawData.length === 0) {
        setError('El archivo no contiene datos o está vacío');
        setIsParsingFile(false);
        return;
      }

      const columns = new Set<string>();
      rawData.forEach(row => Object.keys(row).forEach(key => columns.add(key)));
      const columnList = Array.from(columns);
      setFileColumns(columnList);
      setFileRawData(rawData);

      console.log(`[DiscountImport] Archivo parseado: ${rawData.length} filas, ${columns.size} columnas:`, columnList);

      try {
        const schemaHeaders: Record<string, string> = {};
        if (token) schemaHeaders['Authorization'] = `Bearer ${token}`;
        const schemaResponse = await fetch('/api/imports/schema/discounts', { headers: schemaHeaders });

        if (schemaResponse.ok) {
          const schemaData: ImportSchema = await schemaResponse.json();
          const requiredCols = schemaData.columns.required || [];

          const mapping: ColumnMapping = {};
          let allRequiredMapped = true;
          const usedFileColumns = new Set<string>();

          requiredCols.forEach((col: SchemaColumn) => {
            const exactMatch = columnList.find(fc => fc === col.name && !usedFileColumns.has(fc));
            if (exactMatch) { mapping[col.name] = exactMatch; usedFileColumns.add(exactMatch); return; }
            const ciMatch = columnList.find(fc => fc.toLowerCase() === col.name.toLowerCase() && !usedFileColumns.has(fc));
            if (ciMatch) { mapping[col.name] = ciMatch; usedFileColumns.add(ciMatch); return; }
            const labelMatch = columnList.find(fc => fc.toLowerCase() === col.label.toLowerCase() && !usedFileColumns.has(fc));
            if (labelMatch) { mapping[col.name] = labelMatch; usedFileColumns.add(labelMatch); return; }
            allRequiredMapped = false;
          });

          const recommendedCols = schemaData.columns.recommended || [];
          recommendedCols.forEach((col: SchemaColumn) => {
            const exactMatch = columnList.find(fc => fc === col.name && !usedFileColumns.has(fc));
            if (exactMatch) { mapping[col.name] = exactMatch; usedFileColumns.add(exactMatch); return; }
            const ciMatch = columnList.find(fc => fc.toLowerCase() === col.name.toLowerCase() && !usedFileColumns.has(fc));
            if (ciMatch) { mapping[col.name] = ciMatch; usedFileColumns.add(ciMatch); return; }
            const labelMatch = columnList.find(fc => fc.toLowerCase() === col.label.toLowerCase() && !usedFileColumns.has(fc));
            if (labelMatch) { mapping[col.name] = labelMatch; usedFileColumns.add(labelMatch); return; }
          });

          setAutoMapping(mapping);
          setColumnsMatch(allRequiredMapped);

          if (!allRequiredMapped) {
            setFormatWarning('El formato del archivo no coincide con el esperado. Por favor, verifique la correspondencia de los datos con los campos requeridos por el sistema para poder importar.');
            setShowColumnMapping(true);
          }

          console.log(`[DiscountImport] Auto-match: ${allRequiredMapped ? 'TODAS las columnas obligatorias coinciden' : 'Faltan columnas obligatorias'}`, mapping);
        }
      } catch (schemaErr) {
        console.warn('[DiscountImport] No se pudo verificar esquema:', schemaErr);
        setColumnsMatch(true);
      }
    } catch (err) {
      console.error('[DiscountImport] Error parseando archivo:', err);
      setError(err instanceof Error ? err.message : 'Error al leer el archivo');
    } finally {
      setIsParsingFile(false);
    }
  };

  const handleJsonChange = (value: string) => {
    setJsonInput(value);
    setError(null);
    setImportResults(null);
    setImportSummary(null);

    if (value.trim()) {
      const validation = validateJSON(value);
      setValidationErrors(validation.errors);
      if (validation.isValid && validation.data) setUploadedData(validation.data);
    } else {
      setValidationErrors([]);
      setUploadedData([]);
    }
  };

  const handleDownloadExample = async () => {
    setIsDownloadingTemplate(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch('/api/discounts/format', { method: 'GET', headers });

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const contentDisposition = response.headers.get('content-disposition');
      const fileName = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : 'Descuentos_Plantilla_Importacion.xlsx';

      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast({ title: "Archivo descargado", description: "Se ha descargado la plantilla Excel de ejemplo", type: "success" });
    } catch (error) {
      console.error('Error descargando plantilla:', error);
      showToast({ title: "Error", description: "No se pudo descargar la plantilla. Intenta nuevamente.", type: "error" });
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const processImportResponse = (response: DiscountBulkCreateResponse) => {
    const results: ImportResultRow[] = [];

    if (response.results.discounts) {
      response.results.discounts.forEach((disc) => {
        results.push({ name: disc.name || '—', discountId: disc.discount_id || '—', type: disc.type || '—', status: 'success' });
      });
    }

    if (response.results.errors) {
      response.results.errors.forEach((err) => {
        results.push({ name: err.discount?.name || '—', discountId: err.discount?.discount_id || '—', type: err.discount?.type || '—', status: 'error', message: err.error });
      });
    }

    if (results.length === 0 && response.results.totalProcessed > 0) {
      setImportSummary({ success: response.results.successCount, errors: response.results.errorCount });
      return;
    }

    setImportResults(results);
    setImportSummary({ success: response.results.successCount, errors: response.results.errorCount });
  };

  const handleImport = async () => {
    setIsProcessing(true);
    setError(null);
    setImportResults(null);
    setImportSummary(null);

    try {
      if (uploadMethod === 'json') {
        if (uploadedData.length === 0) { setError('No hay datos para importar'); setIsProcessing(false); return; }

        console.log('[DISCOUNT IMPORT] 📤 Enviando descuentos vía JSON...');
        const dataForAPI = transformToAPIFormat(uploadedData);
        const apiResponse = await api.admin.discounts.bulkCreate(dataForAPI);

        if (apiResponse.success) {
          const response = apiResponse.data as DiscountBulkCreateResponse;
          processImportResponse(response);
          if (response.results.errorCount > 0) {
            showToast({ title: "Importación parcial", description: `${response.results.successCount} descuentos importados, ${response.results.errorCount} con errores`, type: "warning" });
          } else {
            showToast({ title: "Importación exitosa", description: `${response.results.successCount} descuentos importados correctamente`, type: "success" });
          }
          onSuccess?.();
        } else {
          throw new Error(apiResponse.message || 'Error al importar descuentos');
        }
      } else if (uploadMethod === 'file' && uploadedFile) {
        if (columnsMatch && fileRawData.length > 0) {
          console.log('[DISCOUNT IMPORT] ✅ Columnas coinciden, importando con mapeo automático...');
          const mappedData = fileRawData.map(row => {
            const mappedRow: Record<string, unknown> = {};
            Object.entries(autoMapping).forEach(([schemaCol, fileCol]) => { mappedRow[schemaCol] = row[fileCol]; });
            return mappedRow;
          });

          const dataForAPI = transformToAPIFormat(mappedData);
          const apiResponse = await api.admin.discounts.bulkCreate(dataForAPI);

          if (apiResponse.success) {
            const response = apiResponse.data as DiscountBulkCreateResponse;
            processImportResponse(response);
            if (response.results.errorCount > 0) {
              showToast({ title: "Importación parcial", description: `${response.results.successCount} descuentos importados, ${response.results.errorCount} con errores`, type: "warning" });
            } else {
              showToast({ title: "Importación exitosa", description: `${response.results.successCount} descuentos importados correctamente`, type: "success" });
            }
            onSuccess?.();
          } else {
            throw new Error(apiResponse.message || 'Error al importar descuentos');
          }
        } else if (fileColumns.length > 0 && fileRawData.length > 0) {
          setFormatWarning('El formato del archivo no coincide con el esperado. Por favor, verifique la correspondencia de los datos con los campos requeridos por el sistema para poder importar.');
          setIsProcessing(false);
          setShowColumnMapping(true);
          return;
        } else {
          console.log('[DISCOUNT IMPORT] 📁 Enviando archivo directamente...');
          const formData = new FormData();
          formData.append('file', uploadedFile);
          const apiResponse = await api.admin.discounts.bulkCreate(formData);
          if (apiResponse.success) {
            const response = apiResponse.data as DiscountBulkCreateResponse;
            processImportResponse(response);
            showToast({ title: "Importación exitosa", description: "Los descuentos se han importado correctamente", type: "success" });
            onSuccess?.();
          } else {
            throw new Error(apiResponse.message || 'Error al importar');
          }
        }
      } else {
        setError('Selecciona un archivo o ingresa un JSON válido');
      }
    } catch (error) {
      console.error('[DISCOUNT IMPORT] ❌ Error:', error);
      showToast({ title: "Error al importar", description: error instanceof Error ? error.message : "Ocurrió un error inesperado", type: "error" });
      setError(error instanceof Error ? error.message : "Error al importar descuentos");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMappingConfirm = async (mappedData: Record<string, unknown>[], _mapping: ColumnMapping) => {
    setShowColumnMapping(false);
    setIsProcessing(true);
    setError(null);

    try {
      console.log(`[DISCOUNT IMPORT] 📤 Importando ${mappedData.length} descuentos con mapeo personalizado...`);
      const dataForAPI = transformToAPIFormat(mappedData);
      const apiResponse = await api.admin.discounts.bulkCreate(dataForAPI);

      if (apiResponse.success) {
        const response = apiResponse.data as DiscountBulkCreateResponse;
        processImportResponse(response);
        if (response.results.errorCount > 0) {
          showToast({ title: "Importación parcial", description: `${response.results.successCount} descuentos importados, ${response.results.errorCount} con errores`, type: "warning" });
        } else {
          showToast({ title: "Importación exitosa", description: `${response.results.successCount} descuentos importados correctamente`, type: "success" });
        }
        onSuccess?.();
      } else {
        throw new Error(apiResponse.message || 'Error al importar descuentos');
      }
    } catch (error) {
      console.error('[DISCOUNT IMPORT] ❌ Error con mapeo:', error);
      showToast({ title: "Error al importar", description: error instanceof Error ? error.message : "Ocurrió un error inesperado", type: "error" });
      setError(error instanceof Error ? error.message : "Error al importar descuentos");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenMapping = () => {
    if (fileColumns.length > 0 && fileRawData.length > 0) setShowColumnMapping(true);
  };

  const handleClose = () => {
    setUploadedFile(null);
    setJsonInput('');
    setUploadedData([]);
    setError(null);
    setValidationErrors([]);
    setIsProcessing(false);
    setShowColumnMapping(false);
    setFileColumns([]);
    setFileRawData([]);
    setColumnsMatch(false);
    setAutoMapping({});
    setFormatWarning(null);
    setImportResults(null);
    setImportSummary(null);
    onClose();
  };

  if (!isOpen) return null;

  // ── Results View ─────────────────────────────────────────────────────────────
  if (importResults || importSummary) {
    return (
      <AnimatePresence>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} onClick={handleClose}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()} className="rounded-2xl max-w-4xl w-full border shadow-2xl max-h-[90vh] flex flex-col"
            style={{ backgroundColor: themeColors.surface, borderColor: themeColors.primary + "30" }}>
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: themeColors.primary + "20" }}>
              <div>
                <h2 className="text-xl font-bold" style={{ color: themeColors.text.primary }}>Resultado de Importación</h2>
                {importSummary && (
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1.5 text-sm text-green-600"><CheckCircle className="w-4 h-4" />{importSummary.success} exitoso(s)</span>
                    {importSummary.errors > 0 && (<span className="flex items-center gap-1.5 text-sm text-red-500"><AlertCircle className="w-4 h-4" />{importSummary.errors} error(es)</span>)}
                  </div>
                )}
              </div>
              <button onClick={handleClose} className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800" style={{ color: themeColors.text.secondary }}><X className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {importResults && importResults.length > 0 ? (
                <div className="rounded-xl border overflow-hidden" style={{ borderColor: themeColors.primary + '20' }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ backgroundColor: `${themeColors.primary}10` }}>
                        <th className="px-4 py-3 text-left font-medium" style={{ color: themeColors.text.primary }}>Estado</th>
                        <th className="px-4 py-3 text-left font-medium" style={{ color: themeColors.text.primary }}>Nombre</th>
                        <th className="px-4 py-3 text-left font-medium" style={{ color: themeColors.text.primary }}>ID</th>
                        <th className="px-4 py-3 text-left font-medium" style={{ color: themeColors.text.primary }}>Tipo</th>
                        <th className="px-4 py-3 text-left font-medium" style={{ color: themeColors.text.primary }}>Detalle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importResults.map((row, i) => (
                        <tr key={i} className="border-t" style={{ borderColor: themeColors.primary + '10', backgroundColor: row.status === 'error' ? '#fee2e210' : 'transparent' }}>
                          <td className="px-4 py-3">{row.status === 'success' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}</td>
                          <td className="px-4 py-3" style={{ color: themeColors.text.primary }}>{row.name}</td>
                          <td className="px-4 py-3" style={{ color: themeColors.text.primary }}>{row.discountId}</td>
                          <td className="px-4 py-3" style={{ color: themeColors.text.primary }}>{row.type}</td>
                          <td className="px-4 py-3 text-xs" style={{ color: row.status === 'error' ? '#ef4444' : themeColors.text.secondary }}>{row.status === 'success' ? 'Importado correctamente' : row.message || 'Error'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : importSummary ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                  <p className="text-lg font-medium" style={{ color: themeColors.text.primary }}>Importación completada</p>
                  <p className="text-sm mt-2" style={{ color: themeColors.text.secondary }}>
                    {importSummary.success} descuento(s) importado(s) exitosamente{importSummary.errors > 0 && `, ${importSummary.errors} con errores`}
                  </p>
                </div>
              ) : null}
            </div>
            <div className="flex justify-end p-6 border-t" style={{ borderColor: themeColors.primary + "20" }}>
              <button onClick={handleClose} className="px-6 py-3 rounded-lg text-white font-medium" style={{ background: `linear-gradient(45deg, ${themeColors.primary}, ${themeColors.secondary})` }}>Cerrar</button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // ── Main Import View ─────────────────────────────────────────────────────────
  return (
    <>
      <AnimatePresence>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} onClick={handleClose}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()} className="rounded-2xl p-6 max-w-3xl w-full border shadow-2xl max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: themeColors.surface, borderColor: themeColors.primary + "30" }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: themeColors.text.primary }}>Importar Descuentos</h2>
                <p className="text-sm mt-1" style={{ color: themeColors.text.secondary }}>Sube un archivo o pega JSON con los datos de los descuentos</p>
              </div>
              <button onClick={handleClose} className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800" style={{ color: themeColors.text.secondary }}><X className="w-6 h-6" /></button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6">
              <button onClick={() => setUploadMethod('file')} className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
                style={{ backgroundColor: uploadMethod === 'file' ? themeColors.primary : 'transparent', color: uploadMethod === 'file' ? 'white' : themeColors.text.secondary, border: `2px solid ${uploadMethod === 'file' ? themeColors.primary : themeColors.primary + '30'}` }}>
                <FileSpreadsheet className="w-5 h-5" />Subir Archivo
              </button>
              <button onClick={() => setUploadMethod('json')} className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
                style={{ backgroundColor: uploadMethod === 'json' ? themeColors.primary : 'transparent', color: uploadMethod === 'json' ? 'white' : themeColors.text.secondary, border: `2px solid ${uploadMethod === 'json' ? themeColors.primary : themeColors.primary + '30'}` }}>
                <FileJson className="w-5 h-5" />Importar JSON
              </button>
            </div>

            {/* Download Example */}
            <button onClick={handleDownloadExample} disabled={isDownloadingTemplate}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg mb-6 transition-all ${isDownloadingTemplate ? 'opacity-70 cursor-wait' : ''}`}
              style={{ backgroundColor: themeColors.accent + '20', color: themeColors.text.primary, border: `1px solid ${themeColors.accent + '40'}` }}>
              {isDownloadingTemplate ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isDownloadingTemplate ? 'Descargando...' : 'Descargar Plantilla de Ejemplo'}
            </button>

            {/* Content */}
            <div className="mb-6">
              {uploadMethod === 'file' ? (
                <div>
                  <div className="border-2 border-dashed rounded-2xl p-8 text-center transition-all hover:border-opacity-80" style={{ borderColor: themeColors.primary + '40' }}>
                    <Upload className="w-16 h-16 mx-auto mb-4" style={{ color: themeColors.primary }} />
                    <p className="mb-4" style={{ color: themeColors.text.primary }}>Arrastra tu archivo aquí</p>
                    <p className="text-sm mb-4" style={{ color: themeColors.text.secondary }}>o haz clic para seleccionar</p>
                    <p className="text-xs mb-4" style={{ color: themeColors.text.secondary }}>CSV, XLSX, JSON</p>
                    <input type="file" accept=".csv,.xlsx,.json" onChange={handleFileChange} className="hidden" id="file-upload-discount" />
                    <label htmlFor="file-upload-discount" className="inline-block px-6 py-3 rounded-lg cursor-pointer transition-all text-white"
                      style={{ background: `linear-gradient(45deg, ${themeColors.primary}, ${themeColors.secondary})` }}>Seleccionar Archivo</label>
                    {isParsingFile && (
                      <div className="mt-4 flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" style={{ color: themeColors.primary }} />
                        <span className="text-sm" style={{ color: themeColors.text.secondary }}>Leyendo archivo...</span>
                      </div>
                    )}
                    {uploadedFile && !isParsingFile && (<p className="mt-4 text-sm" style={{ color: themeColors.text.primary }}>✓ {uploadedFile.name}</p>)}
                  </div>

                  {uploadedFile && fileColumns.length > 0 && !isParsingFile && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 rounded-xl border"
                      style={{ backgroundColor: columnsMatch ? `${themeColors.primary}08` : '#fef3c720', borderColor: columnsMatch ? `${themeColors.primary}25` : '#f59e0b40' }}>
                      {columnsMatch ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <p className="text-sm font-medium" style={{ color: themeColors.text.primary }}>{fileRawData.length} descuento(s) listo(s) para importar</p>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-start gap-2 mb-3">
                            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm" style={{ color: themeColors.text.primary }}>El formato del archivo no coincide con el esperado. Verifique la correspondencia de los datos con los campos requeridos por el sistema.</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs" style={{ color: themeColors.text.secondary }}>{fileRawData.length} fila(s) · {fileColumns.length} columna(s) detectada(s)</p>
                            <button onClick={handleOpenMapping} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                              style={{ backgroundColor: `${themeColors.secondary}20`, color: themeColors.secondary }}><Table className="w-4 h-4" />Mapear Columnas</button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: themeColors.text.primary }}>Pega tu JSON aquí:</label>
                  <textarea value={jsonInput} onChange={(e) => handleJsonChange(e.target.value)}
                    placeholder='Ejemplo:
[
  {
    "discount_id": "DISC_001",
    "name": "Descuento Verano",
    "type": "percentage",
    "discount_value": 15,
    "currency": "USD",
    "valid_from": "2024-01-01",
    "valid_to": "2024-03-31",
    "status": "active"
  }
]'
                    className="w-full h-64 p-4 rounded-lg font-mono text-sm border-2"
                    style={{ backgroundColor: themeColors.surface + '50', borderColor: themeColors.primary + '30', color: themeColors.text.primary }} />

                  {jsonInput && (
                    <div className="mt-4">
                      {validationErrors.length === 0 ? (
                        <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-5 h-5" /><span>JSON válido - {uploadedData.length} descuento(s) detectado(s)</span></div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2 text-red-600 mb-2"><AlertCircle className="w-5 h-5" /><span className="font-semibold">Errores encontrados:</span></div>
                          <ul className="list-disc list-inside text-sm space-y-1 text-red-500">{validationErrors.map((err, idx) => <li key={idx}>{err}</li>)}</ul>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: themeColors.primary + '10' }}>
                    <p className="text-sm font-semibold mb-2" style={{ color: themeColors.text.primary }}>💡 Consejos para el JSON:</p>
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

            {error && (
              <div className="mb-6 p-4 rounded-lg border flex items-start gap-3" style={{ backgroundColor: '#fee', borderColor: '#fcc' }}>
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" /><p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button onClick={handleClose} disabled={isProcessing} className="px-6 py-3 rounded-lg transition-all"
                style={{ color: themeColors.text.secondary, backgroundColor: themeColors.surface + "50" }}>Cancelar</button>
              <button onClick={handleImport}
                disabled={isProcessing || isParsingFile || (uploadMethod === 'json' && validationErrors.length > 0) || (uploadMethod === 'file' && !uploadedFile)}
                className="px-6 py-3 rounded-lg transition-all text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: `linear-gradient(45deg, ${themeColors.primary}, ${themeColors.secondary})` }}>
                {isProcessing ? (<><Loader2 className="w-5 h-5 animate-spin" />Procesando...</>) : (<><Upload className="w-5 h-5" />Importar Descuentos</>)}
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <ColumnMappingModal
        isOpen={showColumnMapping}
        onClose={() => setShowColumnMapping(false)}
        onConfirm={handleMappingConfirm}
        entityType="discounts"
        fileColumns={fileColumns}
        fileData={fileRawData}
        fileName={uploadedFile?.name || 'archivo'}
        warningMessage={formatWarning || undefined}
      />
    </>
  );
}
