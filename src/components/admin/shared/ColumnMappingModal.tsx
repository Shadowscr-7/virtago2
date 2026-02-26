"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, AlertCircle, CheckCircle, Loader2, Link2, Unlink, ChevronDown, Eye } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import { useAuthStore } from '@/store/auth';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface SchemaColumn {
  name: string;
  label: string;
  type: string;
  note?: string;
}

export interface ImportSchema {
  entity: string;
  entityName: string;
  columns: {
    required: SchemaColumn[];
    recommended?: SchemaColumn[];
    optional?: SchemaColumn[];
  };
  totalColumns: number;
  maxRows: number;
}

export interface ColumnMapping {
  [schemaColumn: string]: string; // schema column name → file column name
}

interface ColumnMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (mappedData: Record<string, unknown>[], mapping: ColumnMapping) => void;
  entityType: 'clients' | 'products' | 'priceLists' | 'prices' | 'discounts';
  fileColumns: string[];
  fileData: Record<string, unknown>[];
  fileName: string;
  warningMessage?: string;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function ColumnMappingModal({
  isOpen,
  onClose,
  onConfirm,
  entityType,
  fileColumns,
  fileData,
  fileName,
  warningMessage,
}: ColumnMappingModalProps) {
  const { themeColors } = useTheme();
  const { token } = useAuthStore();

  const [schema, setSchema] = useState<ImportSchema | null>(null);
  const [isLoadingSchema, setIsLoadingSchema] = useState(false);
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [showPreview, setShowPreview] = useState(false);

  // Fetch schema from backend
  useEffect(() => {
    if (!isOpen) return;

    const fetchSchema = async () => {
      setIsLoadingSchema(true);
      setSchemaError(null);
      try {
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(`/api/imports/schema/${entityType}`, {
          method: 'GET',
          headers,
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setSchema(data);
        
        // Auto-map columns that match exactly (case-insensitive)
        if (data.columns) {
          const allSchemaColumns = [
            ...(data.columns.required || []),
            ...(data.columns.recommended || []),
          ];
          const autoMapping: ColumnMapping = {};
          
          allSchemaColumns.forEach((col: SchemaColumn) => {
            // Try exact match first
            const exactMatch = fileColumns.find(fc => fc === col.name);
            if (exactMatch) {
              autoMapping[col.name] = exactMatch;
              return;
            }
            // Try case-insensitive match
            const ciMatch = fileColumns.find(fc => fc.toLowerCase() === col.name.toLowerCase());
            if (ciMatch) {
              autoMapping[col.name] = ciMatch;
              return;
            }
            // Try label match
            const labelMatch = fileColumns.find(fc => fc.toLowerCase() === col.label.toLowerCase());
            if (labelMatch) {
              autoMapping[col.name] = labelMatch;
              return;
            }
          });
          
          setMapping(autoMapping);
        }
      } catch (error) {
        console.error('[ColumnMapping] Error fetching schema:', error);
        setSchemaError(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setIsLoadingSchema(false);
      }
    };

    fetchSchema();
  }, [isOpen, entityType, token, fileColumns]);

  // All schema columns (required + recommended)
  const allSchemaColumns = useMemo(() => {
    if (!schema) return { required: [], recommended: [] };
    return {
      required: schema.columns.required || [],
      recommended: schema.columns.recommended || [],
    };
  }, [schema]);

  // Validation: check all required columns are mapped
  const unmappedRequired = useMemo(() => {
    return allSchemaColumns.required.filter(col => !mapping[col.name]);
  }, [allSchemaColumns.required, mapping]);

  const isValid = unmappedRequired.length === 0;

  // Columns already used in mapping
  const usedFileColumns = useMemo(() => {
    return new Set(Object.values(mapping));
  }, [mapping]);

  // Available file columns for a given schema column (exclude already-used ones, except current)
  const getAvailableFileColumns = (schemaColName: string) => {
    const currentlyMapped = mapping[schemaColName];
    return fileColumns.filter(fc => !usedFileColumns.has(fc) || fc === currentlyMapped);
  };

  // Set mapping for a column
  const setColumnMapping = (schemaCol: string, fileCol: string) => {
    setMapping(prev => {
      if (fileCol === '') {
        const newMapping = { ...prev };
        delete newMapping[schemaCol];
        return newMapping;
      }
      return { ...prev, [schemaCol]: fileCol };
    });
  };

  // Transform file data using the mapping
  const getMappedData = (): Record<string, unknown>[] => {
    return fileData.map(row => {
      const mappedRow: Record<string, unknown> = {};
      Object.entries(mapping).forEach(([schemaCol, fileCol]) => {
        mappedRow[schemaCol] = row[fileCol];
      });
      return mappedRow;
    });
  };

  // Preview data
  const previewData = useMemo(() => {
    if (!showPreview) return [];
    return getMappedData().slice(0, 5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPreview, mapping, fileData]);

  const handleConfirm = () => {
    if (!isValid) return;
    const mappedData = getMappedData();
    onConfirm(mappedData, mapping);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="rounded-2xl max-w-5xl w-full border shadow-2xl max-h-[90vh] flex flex-col"
          style={{
            backgroundColor: themeColors.surface,
            borderColor: themeColors.primary + "30"
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: themeColors.primary + "20" }}>
            <div>
              <h2 
                className="text-xl font-bold"
                style={{ color: themeColors.text.primary }}
              >
                Mapeo de Columnas
              </h2>
              <p 
                className="text-sm mt-1"
                style={{ color: themeColors.text.secondary }}
              >
                Archivo: <span className="font-medium">{fileName}</span> · {fileData.length} fila(s) · {fileColumns.length} columna(s) detectada(s)
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              style={{ color: themeColors.text.secondary }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoadingSchema ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: themeColors.primary }} />
                <span className="ml-3" style={{ color: themeColors.text.secondary }}>Cargando esquema de columnas...</span>
              </div>
            ) : schemaError ? (
              <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5' }}>
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">Error al cargar el esquema</p>
                  <p className="text-sm text-red-700">{schemaError}</p>
                </div>
              </div>
            ) : schema ? (
              <div className="space-y-6">
                {/* Warning Banner */}
                {warningMessage && (
                  <div 
                    className="p-4 rounded-xl border flex items-start gap-3"
                    style={{ backgroundColor: '#fef3c720', borderColor: '#f59e0b40' }}
                  >
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm" style={{ color: themeColors.text.primary }}>
                      {warningMessage}
                    </p>
                  </div>
                )}

                {/* Info Banner */}
                <div 
                  className="p-4 rounded-xl border"
                  style={{ backgroundColor: `${themeColors.primary}08`, borderColor: `${themeColors.primary}25` }}
                >
                  <p className="text-sm" style={{ color: themeColors.text.primary }}>
                    Vincula las columnas de tu archivo con los campos del sistema. Las columnas <strong>obligatorias</strong> deben estar mapeadas para poder importar.
                    {Object.keys(mapping).length > 0 && (
                      <span style={{ color: themeColors.primary }}> · Se auto-mapearon {Object.keys(mapping).length} columna(s)</span>
                    )}
                  </p>
                </div>

                {/* Required Columns */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: themeColors.primary }}>
                    <AlertCircle className="w-4 h-4" />
                    Columnas Obligatorias ({allSchemaColumns.required.length})
                  </h3>
                  <div className="space-y-2">
                    {allSchemaColumns.required.map((col) => (
                      <MappingRow
                        key={col.name}
                        schemaColumn={col}
                        isRequired={true}
                        mappedTo={mapping[col.name] || ''}
                        availableFileColumns={getAvailableFileColumns(col.name)}
                        onMap={(fileCol) => setColumnMapping(col.name, fileCol)}
                        themeColors={themeColors}
                      />
                    ))}
                  </div>
                </div>

                {/* Recommended Columns */}
                {allSchemaColumns.recommended.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: themeColors.text.secondary }}>
                      <CheckCircle className="w-4 h-4" />
                      Columnas Recomendadas ({allSchemaColumns.recommended.length})
                    </h3>
                    <div className="space-y-2">
                      {allSchemaColumns.recommended.map((col) => (
                        <MappingRow
                          key={col.name}
                          schemaColumn={col}
                          isRequired={false}
                          mappedTo={mapping[col.name] || ''}
                          availableFileColumns={getAvailableFileColumns(col.name)}
                          onMap={(fileCol) => setColumnMapping(col.name, fileCol)}
                          themeColors={themeColors}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Preview */}
                <div>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-all"
                    style={{ color: themeColors.primary, backgroundColor: `${themeColors.primary}10` }}
                  >
                    <Eye className="w-4 h-4" />
                    {showPreview ? 'Ocultar' : 'Ver'} vista previa de datos mapeados
                    <ChevronDown className={`w-4 h-4 transition-transform ${showPreview ? 'rotate-180' : ''}`} />
                  </button>

                  {showPreview && previewData.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 rounded-xl border overflow-x-auto"
                      style={{ borderColor: themeColors.primary + '20' }}
                    >
                      <table className="w-full text-sm">
                        <thead>
                          <tr style={{ backgroundColor: `${themeColors.primary}10` }}>
                            {Object.keys(mapping).map(col => (
                              <th
                                key={col}
                                className="px-3 py-2 text-left font-medium whitespace-nowrap"
                                style={{ color: themeColors.text.primary }}
                              >
                                {schema.columns.required.find(c => c.name === col)?.label || 
                                 schema.columns.recommended?.find(c => c.name === col)?.label || 
                                 col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.map((row, i) => (
                            <tr 
                              key={i}
                              className="border-t"
                              style={{ borderColor: themeColors.primary + '10' }}
                            >
                              {Object.keys(mapping).map(col => (
                                <td
                                  key={col}
                                  className="px-3 py-2 whitespace-nowrap"
                                  style={{ color: themeColors.text.secondary }}
                                >
                                  {row[col] != null ? String(row[col]) : <span className="opacity-40">—</span>}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="px-3 py-2 text-xs" style={{ color: themeColors.text.secondary, backgroundColor: `${themeColors.surface}80` }}>
                        Mostrando {previewData.length} de {fileData.length} fila(s)
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div 
            className="flex items-center justify-between p-6 border-t"
            style={{ borderColor: themeColors.primary + "20" }}
          >
            <div className="text-sm" style={{ color: themeColors.text.secondary }}>
              {unmappedRequired.length > 0 ? (
                <span className="flex items-center gap-2 text-amber-500">
                  <AlertCircle className="w-4 h-4" />
                  {unmappedRequired.length} columna(s) obligatoria(s) sin mapear
                </span>
              ) : (
                <span className="flex items-center gap-2 text-green-500">
                  <CheckCircle className="w-4 h-4" />
                  Todas las columnas obligatorias mapeadas
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg transition-all text-sm"
                style={{ color: themeColors.text.secondary }}
              >
                Cancelar
              </button>
              <motion.button
                onClick={handleConfirm}
                disabled={!isValid}
                whileHover={isValid ? { scale: 1.02 } : {}}
                whileTap={isValid ? { scale: 0.98 } : {}}
                className="px-6 py-2.5 rounded-lg text-white text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: isValid 
                    ? `linear-gradient(45deg, ${themeColors.primary}, ${themeColors.secondary})`
                    : themeColors.text.secondary + '40'
                }}
              >
                <CheckCircle className="w-4 h-4" />
                Confirmar Mapeo e Importar
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Custom Select Sub-component ────────────────────────────────────────────────

interface CustomSelectProps {
  value: string;
  options: string[];
  onChange: (val: string) => void;
  themeColors: ReturnType<typeof useTheme>['themeColors'];
}

function CustomSelect({ value, options, onChange, themeColors }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const isMapped = value !== '';

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm border transition-all cursor-pointer text-left"
        style={{
          backgroundColor: isMapped ? `${themeColors.primary}15` : themeColors.surface,
          borderColor: isOpen ? themeColors.primary : (isMapped ? `${themeColors.primary}40` : `${themeColors.primary}20`),
          color: isMapped ? themeColors.text.primary : themeColors.text.secondary,
        }}
      >
        <span className="truncate">{value || '— Sin mapear —'}</span>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: themeColors.text.secondary }}
        />
      </button>

      {isOpen && (
        <div
          className="absolute top-full mt-1 w-full rounded-lg shadow-2xl border z-[100] max-h-52 overflow-y-auto"
          style={{
            backgroundColor: themeColors.surface,
            borderColor: themeColors.primary + '30',
          }}
        >
          <button
            type="button"
            onClick={() => { onChange(''); setIsOpen(false); }}
            className="w-full text-left px-3 py-2.5 text-sm transition-colors border-b"
            style={{
              color: themeColors.text.secondary,
              backgroundColor: value === '' ? `${themeColors.primary}15` : 'transparent',
              borderColor: themeColors.primary + '15',
            }}
            onMouseEnter={(e) => { if (value !== '') e.currentTarget.style.backgroundColor = `${themeColors.primary}10`; }}
            onMouseLeave={(e) => { if (value !== '') e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            — Sin mapear —
          </button>
          {options.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setIsOpen(false); }}
              className="w-full text-left px-3 py-2.5 text-sm transition-colors"
              style={{
                color: opt === value ? themeColors.primary : themeColors.text.primary,
                backgroundColor: opt === value ? `${themeColors.primary}15` : 'transparent',
                fontWeight: opt === value ? 600 : 400,
              }}
              onMouseEnter={(e) => { if (opt !== value) e.currentTarget.style.backgroundColor = `${themeColors.primary}10`; }}
              onMouseLeave={(e) => { if (opt !== value) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Mapping Row Sub-component ──────────────────────────────────────────────────

interface MappingRowProps {
  schemaColumn: SchemaColumn;
  isRequired: boolean;
  mappedTo: string;
  availableFileColumns: string[];
  onMap: (fileCol: string) => void;
  themeColors: ReturnType<typeof useTheme>['themeColors'];
}

function MappingRow({ schemaColumn, isRequired, mappedTo, availableFileColumns, onMap, themeColors }: MappingRowProps) {
  const isMapped = mappedTo !== '';

  return (
    <div 
      className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all"
      style={{
        backgroundColor: isMapped 
          ? `${themeColors.primary}06` 
          : isRequired ? '#fef3c7' + '30' : `${themeColors.surface}50`,
        borderColor: isMapped 
          ? `${themeColors.primary}30` 
          : isRequired && !isMapped ? '#f59e0b40' : `${themeColors.primary}15`,
      }}
    >
      {/* Schema column info (left side) */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: themeColors.text.primary }}>
            {schemaColumn.label}
          </span>
          {isRequired && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider"
              style={{ backgroundColor: '#ef444420', color: '#ef4444' }}>
              Obligatorio
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs font-mono" style={{ color: themeColors.text.secondary }}>
            {schemaColumn.name}
          </span>
          <span className="text-xs" style={{ color: themeColors.text.secondary + '80' }}>
            · {schemaColumn.type}
          </span>
          {schemaColumn.note && (
            <span className="text-xs italic" style={{ color: themeColors.text.secondary + '80' }}>
              · {schemaColumn.note}
            </span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <div className="flex-shrink-0">
        {isMapped ? (
          <Link2 className="w-5 h-5" style={{ color: themeColors.primary }} />
        ) : (
          <ArrowRight className="w-5 h-5 opacity-30" style={{ color: themeColors.text.secondary }} />
        )}
      </div>

      {/* File column selector (right side) */}
      <div className="w-56 flex-shrink-0">
        <CustomSelect
          value={mappedTo}
          options={availableFileColumns}
          onChange={onMap}
          themeColors={themeColors}
        />
        {isMapped && (
          <button
            onClick={() => onMap('')}
            className="mt-1 text-xs flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: themeColors.text.secondary }}
          >
            <Unlink className="w-3 h-3" />
            Desvincular
          </button>
        )}
      </div>
    </div>
  );
}
