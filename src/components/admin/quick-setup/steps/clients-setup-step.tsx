"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/theme-context";
import { 
  Upload, 
  Download, 
  FileText, 
  Code, 
  Users,
  CheckCircle,
  AlertCircle,
  X,
  ChevronRight
} from "lucide-react";
import { WizardStepProps } from "../setup-wizard";

interface ClientData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  businessType?: string;
  taxId?: string;
}

interface ImportMethod {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ComponentType<{ onComplete: (data: ClientData[]) => void }>;
}

const SAMPLE_CLIENT_DATA = [
  {
    name: "Empresa ABC S.A.",
    email: "contacto@empresaabc.com",
    phone: "+54 11 1234-5678",
    address: "Av. Corrientes 1234, CABA",
    businessType: "Mayorista",
    taxId: "20-12345678-9"
  },
  {
    name: "Distribuidora XYZ",
    email: "ventas@distribuidoraxyz.com",
    phone: "+54 11 8765-4321",
    address: "San Martín 5678, Buenos Aires",
    businessType: "Distribuidor",
    taxId: "30-87654321-5"
  }
];

function FileUploadMethod({ onComplete }: { onComplete: (data: ClientData[]) => void }) {
  const { themeColors } = useTheme();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
    setIsProcessing(true);
    
    // Simular procesamiento
    setTimeout(() => {
      setIsProcessing(false);
      onComplete(SAMPLE_CLIENT_DATA); // En la implementación real, procesar el archivo
    }, 2000);
  };

  const downloadSampleFile = () => {
    const csvContent = "name,email,phone,address,businessType,taxId\n" +
      SAMPLE_CLIENT_DATA.map(client => 
        `"${client.name}","${client.email}","${client.phone}","${client.address}","${client.businessType}","${client.taxId}"`
      ).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clientes_ejemplo.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Download Sample */}
      <div className="text-center">
        <motion.button
          onClick={downloadSampleFile}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200"
          style={{
            backgroundColor: `${themeColors.secondary}20`,
            borderColor: themeColors.secondary,
            color: themeColors.secondary,
          }}
        >
          <Download className="w-4 h-4" />
          Descargar Archivo de Ejemplo
        </motion.button>
      </div>

      {/* Upload Area */}
      <motion.div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        whileHover={{ scale: dragActive ? 1 : 1.02 }}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer
          ${dragActive ? 'scale-105' : ''}
        `}
        style={{
          borderColor: dragActive ? themeColors.primary : `${themeColors.primary}30`,
          backgroundColor: dragActive ? `${themeColors.primary}10` : `${themeColors.surface}30`,
        }}
      >
        <input
          type="file"
          accept=".csv,.xlsx,.txt"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        {isProcessing ? (
          <div className="space-y-4">
            <div className="animate-spin w-12 h-12 mx-auto rounded-full border-4 border-t-transparent" style={{ borderColor: themeColors.primary, borderTopColor: 'transparent' }} />
            <p style={{ color: themeColors.text.primary }}>Procesando archivo...</p>
          </div>
        ) : uploadedFile ? (
          <div className="space-y-4">
            <CheckCircle className="w-12 h-12 mx-auto" style={{ color: themeColors.secondary }} />
            <div>
              <p className="font-medium" style={{ color: themeColors.text.primary }}>
                {uploadedFile.name}
              </p>
              <p style={{ color: themeColors.text.secondary }}>
                Archivo cargado correctamente
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="w-12 h-12 mx-auto" style={{ color: themeColors.primary }} />
            <div>
              <p className="text-lg font-medium mb-2" style={{ color: themeColors.text.primary }}>
                Arrastra tu archivo aquí o haz clic para seleccionar
              </p>
              <p style={{ color: themeColors.text.secondary }}>
                Formatos soportados: CSV, XLSX, TXT
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function JsonApiMethod({ onComplete }: { onComplete: (data: ClientData[]) => void }) {
  const { themeColors } = useTheme();
  const [jsonInput, setJsonInput] = useState("");
  const [isValidJson, setIsValidJson] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const sampleJson = JSON.stringify(SAMPLE_CLIENT_DATA, null, 2);

  const validateAndSubmit = () => {
    try {
      const data = JSON.parse(jsonInput);
      if (Array.isArray(data)) {
        setIsProcessing(true);
        setTimeout(() => {
          setIsProcessing(false);
          onComplete(data);
        }, 1000);
      } else {
        setIsValidJson(false);
      }
    } catch {
      setIsValidJson(false);
    }
  };

  const downloadSampleJson = () => {
    const blob = new Blob([sampleJson], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clientes_ejemplo.json';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Sample JSON Display */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium" style={{ color: themeColors.text.primary }}>
            Formato de ejemplo:
          </h4>
          <motion.button
            onClick={downloadSampleJson}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200"
            style={{
              backgroundColor: `${themeColors.secondary}20`,
              color: themeColors.secondary,
            }}
          >
            <Download className="w-3 h-3" />
            Descargar
          </motion.button>
        </div>
        
        <div 
          className="p-4 rounded-xl border text-sm font-mono overflow-auto max-h-48"
          style={{
            backgroundColor: `${themeColors.surface}30`,
            borderColor: `${themeColors.primary}30`,
            color: themeColors.text.secondary,
          }}
        >
          <pre>{sampleJson}</pre>
        </div>
      </div>

      {/* JSON Input */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>
          Pega tu JSON aquí:
        </label>
        <textarea
          value={jsonInput}
          onChange={(e) => {
            setJsonInput(e.target.value);
            setIsValidJson(true);
          }}
          placeholder="Pega aquí tu JSON con los datos de clientes..."
          rows={8}
          className={`
            w-full p-4 rounded-xl border transition-all duration-200 font-mono text-sm
            focus:outline-none focus:ring-2 resize-none
            ${!isValidJson ? 'border-red-500' : ''}
          `}
          style={{
            backgroundColor: `${themeColors.surface}50`,
            borderColor: !isValidJson ? '#ef4444' : `${themeColors.primary}30`,
            color: themeColors.text.primary,
          }}
        />
        
        {!isValidJson && (
          <div className="flex items-center gap-2 mt-2 text-red-500">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">JSON inválido. Verifica el formato.</span>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <motion.button
        onClick={validateAndSubmit}
        disabled={!jsonInput.trim() || isProcessing}
        whileHover={{ scale: jsonInput.trim() && !isProcessing ? 1.02 : 1 }}
        whileTap={{ scale: jsonInput.trim() && !isProcessing ? 0.98 : 1 }}
        className={`
          w-full py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2
          ${!jsonInput.trim() || isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        style={{
          backgroundColor: themeColors.primary,
          color: 'white',
        }}
      >
        {isProcessing ? (
          <>
            <div className="animate-spin w-4 h-4 rounded-full border-2 border-t-transparent border-white" />
            Procesando...
          </>
        ) : (
          <>
            <Code className="w-4 h-4" />
            Procesar JSON
          </>
        )}
      </motion.button>
    </div>
  );
}

export function ClientsSetupStep({ onComplete }: WizardStepProps) {
  const { themeColors } = useTheme();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [importedData, setImportedData] = useState<ClientData[] | null>(null);

  const importMethods: ImportMethod[] = [
    {
      id: "file",
      title: "Subir Archivo",
      description: "Sube un archivo CSV, XLSX o TXT con tus clientes",
      icon: <FileText className="w-6 h-6" />,
      component: FileUploadMethod,
    },
    {
      id: "json",
      title: "API / JSON",
      description: "Pega un JSON o conecta con tu API",
      icon: <Code className="w-6 h-6" />,
      component: JsonApiMethod,
    },
  ];

  const handleMethodComplete = (data: ClientData[]) => {
    setImportedData(data);
  };

  const handleFinishStep = () => {
    if (importedData) {
      onComplete({ clients: importedData });
    }
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="text-center">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: `${themeColors.primary}20` }}
        >
          <Users className="w-8 h-8" style={{ color: themeColors.primary }} />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: themeColors.text.primary }}>
          Cargar Clientes
        </h2>
        <p style={{ color: themeColors.text.secondary }}>
          Importa tu base de clientes existente para comenzar a usar el sistema
        </p>
      </div>

      {!selectedMethod ? (
        /* Method Selection */
        <div className="grid md:grid-cols-2 gap-6">
          {importMethods.map((method) => (
            <motion.div
              key={method.id}
              whileHover={{ scale: 1.02, y: -4 }}
              className="relative group"
            >
              <motion.button
                onClick={() => setSelectedMethod(method.id)}
                whileTap={{ scale: 0.98 }}
                className="w-full p-8 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden"
                style={{
                  backgroundColor: `${themeColors.surface}30`,
                  borderColor: `${themeColors.primary}30`,
                }}
              >
                {/* Background gradient effect on hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${themeColors.primary}10, ${themeColors.secondary}05)`
                  }}
                />
                
                <div className="relative z-10">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: `${themeColors.primary}20` }}
                  >
                    <div style={{ color: themeColors.primary }}>
                      {method.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: themeColors.text.primary }}>
                    {method.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: themeColors.text.secondary }}>
                    {method.description}
                  </p>
                  
                  {/* Call to action indicator */}
                  <div className="mt-6 flex items-center justify-between">
                    <span 
                      className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ color: themeColors.primary }}
                    >
                      Seleccionar método →
                    </span>
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1"
                      style={{ backgroundColor: `${themeColors.primary}20` }}
                    >
                      <ChevronRight className="w-4 h-4" style={{ color: themeColors.primary }} />
                    </div>
                  </div>
                </div>
              </motion.button>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Selected Method Content */
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold" style={{ color: themeColors.text.primary }}>
              {importMethods.find(m => m.id === selectedMethod)?.title}
            </h3>
            <motion.button
              onClick={() => {
                setSelectedMethod(null);
                setImportedData(null);
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg transition-colors duration-200"
              style={{ color: themeColors.text.secondary }}
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {(() => {
            const method = importMethods.find(m => m.id === selectedMethod);
            const MethodComponent = method?.component;
            return MethodComponent ? <MethodComponent onComplete={handleMethodComplete} /> : null;
          })()}

          {/* Success State */}
          {importedData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 rounded-2xl border"
              style={{
                backgroundColor: `${themeColors.secondary}10`,
                borderColor: themeColors.secondary,
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6" style={{ color: themeColors.secondary }} />
                <h4 className="text-lg font-semibold" style={{ color: themeColors.text.primary }}>
                  ¡Datos cargados exitosamente!
                </h4>
              </div>
              <p className="mb-4" style={{ color: themeColors.text.secondary }}>
                Se han importado {importedData.length} clientes correctamente.
              </p>
              
              <motion.button
                onClick={handleFinishStep}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl font-medium transition-all duration-200"
                style={{
                  backgroundColor: themeColors.primary,
                  color: 'white',
                }}
              >
                Continuar al Siguiente Paso
              </motion.button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}