"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  Settings,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  FileJson,
  FileSpreadsheet,
  FileText,
  Loader2,
} from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { useAuthStore } from "@/store/auth";
import { api, ExportConfigData } from "@/api";

// ─── Campos de Virtago disponibles para exportar ───────────────────────────
const VIRTAGO_ORDER_FIELDS: { name: string; label: string }[] = [
  { name: "id", label: "ID Pedido" },
  { name: "orderNo", label: "Nro de Pedido" },
  { name: "status", label: "Estado" },
  { name: "paymentMethod", label: "Método de pago" },
  { name: "paymentId", label: "ID de pago" },
  { name: "subTotal", label: "Subtotal" },
  { name: "total", label: "Total" },
  { name: "totalItems", label: "Total items" },
  { name: "shipping", label: "Costo de envío" },
  { name: "discount", label: "Descuento" },
  { name: "currency", label: "Moneda" },
  { name: "note", label: "Nota" },
  { name: "createdAt", label: "Fecha de creación" },
  { name: "clientName", label: "Nombre del cliente" },
  { name: "clientEmail", label: "Email del cliente" },
  { name: "clientPhone", label: "Teléfono del cliente" },
  { name: "clientAddress", label: "Dirección del cliente" },
  { name: "clientCity", label: "Ciudad del cliente" },
  { name: "clientZip", label: "CP del cliente" },
  { name: "clientCountry", label: "País del cliente" },
  { name: "items", label: "Ítems del pedido (JSON)" },
];

// ─── Tipos ──────────────────────────────────────────────────────────────────
interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedOrderIds?: string[];
  distributorId: string;
  mode?: "config" | "export"; // config = solo configurar, export = exportar
}

type Step = "format" | "mapping" | "export";
type Format = "json" | "xlsx" | "csv";

// ─── Helpers de descarga ─────────────────────────────────────────────────────
function downloadJson(data: Record<string, unknown>[], filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  triggerDownload(blob, filename);
}

function downloadCsv(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((h) => {
      const val = row[h] ?? "";
      const str = String(val).replace(/"/g, '""');
      return str.includes(",") || str.includes("\n") ? `"${str}"` : str;
    }).join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  triggerDownload(blob, filename);
}

async function downloadXlsx(data: Record<string, unknown>[], filename: string) {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Pedidos");
  if (data.length) {
    ws.columns = Object.keys(data[0]).map((key) => ({ header: key, key, width: 20 }));
    data.forEach((row) => ws.addRow(row));
    ws.getRow(1).font = { bold: true };
  }
  const buf = await wb.xlsx.writeBuffer();
  triggerDownload(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), filename);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Componente principal ────────────────────────────────────────────────────
export function ExportWizardModal({
  isOpen,
  onClose,
  selectedOrderIds = [],
  distributorId,
  mode = "export",
}: Props) {
  const { themeColors } = useTheme();
  const { user } = useAuthStore();

  const [step, setStep] = useState<Step>("format");
  const [format, setFormat] = useState<Format>("xlsx");
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [error, setError] = useState("");
  const [existingConfig, setExistingConfig] = useState<ExportConfigData | null>(null);

  const distId = distributorId || user?.distributorInfo?.distributorCode || user?.id || "";

  // Cargar config existente al abrir
  useEffect(() => {
    if (!isOpen || !distId) return;
    setLoadingConfig(true);
    setError("");
    setExportDone(false);

    api.admin.exportConfig.get(distId)
      .then((res: any) => {
        const cfg = res?.data as ExportConfigData | null;
        if (cfg) {
          setExistingConfig(cfg);
          setFormat(cfg.format || "xlsx");
          setFieldMapping(cfg.fieldMapping || {});
          // Si estamos en modo export y hay config, ir directo al export
          if (mode === "export") setStep("export");
          else setStep("format");
        } else {
          setExistingConfig(null);
          setFieldMapping({});
          setStep("format");
        }
      })
      .catch(() => {
        setExistingConfig(null);
        setStep("format");
      })
      .finally(() => setLoadingConfig(false));
  }, [isOpen, distId, mode]);

  const handleSaveConfig = useCallback(async () => {
    setError("");
    try {
      await api.admin.exportConfig.save({ distributorId: distId, format, fieldMapping });
      if (mode === "config") {
        onClose();
      } else {
        setStep("export");
      }
    } catch {
      setError("Error al guardar la configuración.");
    }
  }, [distId, format, fieldMapping, mode, onClose]);

  const handleExport = useCallback(async () => {
    setExporting(true);
    setError("");
    try {
      const res = await api.admin.exportConfig.exportOrders(distId, selectedOrderIds) as any;
      const { records, filename } = res.data;

      if (format === "json") downloadJson(records, filename);
      else if (format === "csv") downloadCsv(records, filename);
      else await downloadXlsx(records, filename);

      setExportDone(true);
    } catch {
      setError("Error al generar el archivo de exportación.");
    } finally {
      setExporting(false);
    }
  }, [distId, selectedOrderIds, format]);

  const toggleField = (fieldName: string) => {
    setFieldMapping((prev) => {
      const next = { ...prev };
      if (next[fieldName] !== undefined) {
        delete next[fieldName];
      } else {
        next[fieldName] = fieldName; // default: mismo nombre
      }
      return next;
    });
  };

  const updateFieldAlias = (fieldName: string, alias: string) => {
    setFieldMapping((prev) => ({ ...prev, [fieldName]: alias }));
  };

  const STEP_LABELS: Record<Step, string> = {
    format: "1. Formato",
    mapping: "2. Campos",
    export: "3. Exportar",
  };

  const surface = `${themeColors.surface}90`;
  const border = `${themeColors.primary}30`;

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
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl rounded-2xl border shadow-2xl flex flex-col max-h-[90vh]"
          style={{ backgroundColor: themeColors.surface, borderColor: border }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-6 border-b"
            style={{ borderColor: border }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
              >
                <Download className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold" style={{ color: themeColors.text.primary }}>
                  {mode === "config" ? "Configurar exportación al ERP" : "Exportar pedidos al ERP"}
                </h2>
                <p className="text-xs" style={{ color: themeColors.text.secondary }}>
                  {mode === "export" && selectedOrderIds.length > 0
                    ? `${selectedOrderIds.length} pedido(s) seleccionado(s)`
                    : "Configuración guardada para próximas exportaciones"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors hover:opacity-70"
              style={{ color: themeColors.text.secondary }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Steps indicator */}
          <div
            className="flex items-center gap-0 px-6 py-3 border-b"
            style={{ borderColor: border, backgroundColor: `${themeColors.primary}08` }}
          >
            {(["format", "mapping", "export"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all"
                  style={{
                    backgroundColor: step === s ? `${themeColors.primary}25` : "transparent",
                    color: step === s ? themeColors.primary : themeColors.text.secondary,
                  }}
                >
                  <span>{STEP_LABELS[s]}</span>
                </div>
                {i < 2 && (
                  <ArrowRight className="w-3 h-3" style={{ color: themeColors.text.secondary }} />
                )}
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loadingConfig ? (
              <div className="flex items-center justify-center py-12 gap-3">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: themeColors.primary }} />
                <span style={{ color: themeColors.text.secondary }}>Cargando configuración...</span>
              </div>
            ) : step === "format" ? (
              <StepFormat format={format} onChange={setFormat} themeColors={themeColors} />
            ) : step === "mapping" ? (
              <StepMapping
                fieldMapping={fieldMapping}
                onToggle={toggleField}
                onUpdateAlias={updateFieldAlias}
                themeColors={themeColors}
              />
            ) : (
              <StepExport
                format={format}
                orderCount={selectedOrderIds.length}
                exportDone={exportDone}
                mode={mode}
                themeColors={themeColors}
              />
            )}

            {error && (
              <div
                className="mt-4 flex items-center gap-2 p-3 rounded-xl border"
                style={{ backgroundColor: "#ef444420", borderColor: "#ef444440", color: "#ef4444" }}
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between p-6 border-t"
            style={{ borderColor: border }}
          >
            <div>
              {step !== "format" && !exportDone && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(step === "mapping" ? "format" : "mapping")}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{ color: themeColors.text.secondary, border: `1px solid ${border}` }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Atrás
                </motion.button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{ color: themeColors.text.secondary }}
              >
                {exportDone ? "Cerrar" : "Cancelar"}
              </button>

              {!exportDone && step === "format" && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep("mapping")}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                  style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
                >
                  Siguiente
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              )}

              {!exportDone && step === "mapping" && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveConfig}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                  style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
                >
                  {mode === "config" ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Guardar configuración
                    </>
                  ) : (
                    <>
                      Siguiente
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              )}

              {!exportDone && step === "export" && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExport}
                  disabled={exporting || selectedOrderIds.length === 0}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                  style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
                >
                  {exporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Descargar {format.toUpperCase()}
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Step 1: Formato ─────────────────────────────────────────────────────────
function StepFormat({
  format,
  onChange,
  themeColors,
}: {
  format: Format;
  onChange: (f: Format) => void;
  themeColors: any;
}) {
  const options: { value: Format; icon: React.ReactNode; label: string; desc: string }[] = [
    {
      value: "xlsx",
      icon: <FileSpreadsheet className="w-7 h-7" />,
      label: "Excel (.xlsx)",
      desc: "Mejor para abrir en Excel o Google Sheets",
    },
    {
      value: "csv",
      icon: <FileText className="w-7 h-7" />,
      label: "CSV (.csv)",
      desc: "Compatible con cualquier ERP",
    },
    {
      value: "json",
      icon: <FileJson className="w-7 h-7" />,
      label: "JSON (.json)",
      desc: "Para integrar con APIs o sistemas propios",
    },
  ];

  return (
    <div>
      <h3 className="text-base font-semibold mb-1" style={{ color: themeColors.text.primary }}>
        ¿En qué formato necesita recibir los pedidos tu ERP?
      </h3>
      <p className="text-sm mb-5" style={{ color: themeColors.text.secondary }}>
        Esta configuración se guardará y se reutilizará en futuras exportaciones.
      </p>
      <div className="grid grid-cols-3 gap-3">
        {options.map((opt) => {
          const selected = format === opt.value;
          return (
            <motion.button
              key={opt.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange(opt.value)}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all text-center"
              style={{
                borderColor: selected ? themeColors.primary : `${themeColors.primary}25`,
                backgroundColor: selected ? `${themeColors.primary}15` : `${themeColors.surface}50`,
                color: selected ? themeColors.primary : themeColors.text.secondary,
              }}
            >
              {opt.icon}
              <div>
                <p className="font-semibold text-sm" style={{ color: selected ? themeColors.primary : themeColors.text.primary }}>
                  {opt.label}
                </p>
                <p className="text-xs mt-0.5" style={{ color: themeColors.text.secondary }}>
                  {opt.desc}
                </p>
              </div>
              {selected && <CheckCircle className="w-4 h-4" style={{ color: themeColors.primary }} />}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 2: Mapeo de campos ──────────────────────────────────────────────────
function StepMapping({
  fieldMapping,
  onToggle,
  onUpdateAlias,
  themeColors,
}: {
  fieldMapping: Record<string, string>;
  onToggle: (name: string) => void;
  onUpdateAlias: (name: string, alias: string) => void;
  themeColors: any;
}) {
  const selectedCount = Object.keys(fieldMapping).length;

  return (
    <div>
      <h3 className="text-base font-semibold mb-1" style={{ color: themeColors.text.primary }}>
        ¿Qué campos necesita tu ERP y cómo los llama?
      </h3>
      <p className="text-sm mb-1" style={{ color: themeColors.text.secondary }}>
        Activá los campos que querés exportar y escribí el nombre que tu ERP espera (izquierda = Virtago, derecha = tu ERP).
      </p>
      <p className="text-xs mb-4" style={{ color: themeColors.text.secondary }}>
        {selectedCount} campo(s) seleccionado(s)
      </p>

      <div className="space-y-2">
        {VIRTAGO_ORDER_FIELDS.map((field) => {
          const active = fieldMapping[field.name] !== undefined;
          return (
            <div
              key={field.name}
              className="flex items-center gap-3 p-3 rounded-xl border transition-all"
              style={{
                borderColor: active ? `${themeColors.primary}40` : `${themeColors.primary}15`,
                backgroundColor: active ? `${themeColors.primary}08` : "transparent",
              }}
            >
              <button
                onClick={() => onToggle(field.name)}
                className="flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all"
                style={{
                  borderColor: active ? themeColors.primary : `${themeColors.primary}40`,
                  backgroundColor: active ? themeColors.primary : "transparent",
                }}
              >
                {active && <CheckCircle className="w-3.5 h-3.5 text-white" />}
              </button>

              <span
                className="text-sm w-44 flex-shrink-0"
                style={{ color: active ? themeColors.text.primary : themeColors.text.secondary }}
              >
                {field.label}
              </span>

              <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: themeColors.text.secondary }} />

              <input
                type="text"
                disabled={!active}
                value={active ? (fieldMapping[field.name] || "") : ""}
                onChange={(e) => onUpdateAlias(field.name, e.target.value)}
                placeholder={field.name}
                className="flex-1 px-3 py-1.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-1 disabled:opacity-40"
                style={{
                  backgroundColor: `${themeColors.surface}50`,
                  borderColor: `${themeColors.primary}25`,
                  color: themeColors.text.primary,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 3: Confirmar y exportar ─────────────────────────────────────────────
function StepExport({
  format,
  orderCount,
  exportDone,
  mode,
  themeColors,
}: {
  format: Format;
  orderCount: number;
  exportDone: boolean;
  mode: string;
  themeColors: any;
}) {
  if (exportDone) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "#10b98120" }}
        >
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </motion.div>
        <h3 className="text-lg font-bold" style={{ color: themeColors.text.primary }}>
          ¡Exportación completada!
        </h3>
        <p className="text-sm text-center" style={{ color: themeColors.text.secondary }}>
          El archivo {format.toUpperCase()} se descargó en tu carpeta de descargas.
          <br />
          Podés importarlo directamente en tu ERP.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-base font-semibold mb-1" style={{ color: themeColors.text.primary }}>
        Listo para exportar
      </h3>
      <p className="text-sm mb-6" style={{ color: themeColors.text.secondary }}>
        Se generará un archivo <strong>{format.toUpperCase()}</strong> con los campos configurados y se descargará automáticamente.
      </p>

      <div
        className="p-4 rounded-2xl border"
        style={{ backgroundColor: `${themeColors.primary}08`, borderColor: `${themeColors.primary}25` }}
      >
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p style={{ color: themeColors.text.secondary }}>Formato de salida</p>
            <p className="font-semibold mt-0.5" style={{ color: themeColors.text.primary }}>
              {format.toUpperCase()}
            </p>
          </div>
          <div>
            <p style={{ color: themeColors.text.secondary }}>Pedidos a exportar</p>
            <p className="font-semibold mt-0.5" style={{ color: themeColors.text.primary }}>
              {orderCount > 0 ? `${orderCount} pedido(s)` : "Todos los pedidos filtrados"}
            </p>
          </div>
        </div>
      </div>

      {orderCount === 0 && (
        <div
          className="mt-4 flex items-start gap-2 p-3 rounded-xl border"
          style={{ backgroundColor: "#f59e0b15", borderColor: "#f59e0b30", color: "#f59e0b" }}
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p className="text-sm">
            No hay pedidos seleccionados. Cerrá este modal, seleccioná los pedidos de la tabla y volvé a exportar.
          </p>
        </div>
      )}
    </div>
  );
}
