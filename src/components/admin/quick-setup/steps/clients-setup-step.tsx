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
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  phone: string;
  phoneOptional?: string;
  documentType: string;
  document: string;
  customerClass: string;
  customerClassTwo: string;
  customerClassThree: string;
  customerClassDist: string;
  customerClassDistTwo: string;
  latitude: number;
  longitude: number;
  status: string;
  distributorCodes: string[];
  information: {
    paymentMethodCode: string;
    companyCode: string;
    salesmanName: string;
    visitDay: string;
    pdv: string;
    deliveryDay: string;
    warehouse: string;
    frequency: string;
    priceList: string;
    routeName: string;
    withCredit: boolean;
    distributorName: string;
    sellerId: string;
    routeId: string;
    clientCode: string;
    pdvname: string;
    paymentTerm: string;
    customerClassDistTwo: string;
  };
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
    "email": "juan.perez@tiendacentral.com",
    "firstName": "Juan Carlos",
    "lastName": "Pérez Mendoza",
    "gender": "M",
    "phone": "+51987654321",
    "phoneOptional": "+51912345678",
    "documentType": "DNI",
    "document": "12345678",
    "customerClass": "A",
    "customerClassTwo": "VIP",
    "customerClassThree": "Premium",
    "customerClassDist": "Nacional",
    "customerClassDistTwo": "Mayorista",
    "latitude": -12.0464,
    "longitude": -77.0428,
    "status": "A",
    "distributorCodes": ["DIST01", "DIST05"],
    "information": {
      "paymentMethodCode": "CASH",
      "companyCode": "COMP001",
      "salesmanName": "Carlos Alberto Vendedor",
      "visitDay": "Lunes",
      "pdv": "PDV001",
      "deliveryDay": "Martes",
      "warehouse": "ALMACEN_LIMA_CENTRO",
      "frequency": "Semanal",
      "priceList": "LISTA_PREMIUM",
      "routeName": "Ruta Lima Centro",
      "withCredit": true,
      "distributorName": "Distribuidor Lima Central",
      "sellerId": "SELL001",
      "routeId": "ROUTE001",
      "clientCode": "CLI001",
      "pdvname": "Tienda Central Lima",
      "paymentTerm": "30 días",
      "customerClassDistTwo": "Regional Norte"
    }
  },
  {
    "email": "maria.garcia@supermercadosur.com",
    "firstName": "María Elena",
    "lastName": "García Rodríguez",
    "gender": "F",
    "phone": "+51987654322",
    "phoneOptional": "+51987654399",
    "documentType": "RUC",
    "document": "20123456789",
    "customerClass": "B",
    "customerClassTwo": "Corporativo",
    "customerClassThree": "Mayorista",
    "customerClassDist": "Regional",
    "customerClassDistTwo": "Cadena",
    "latitude": -12.1234,
    "longitude": -77.0567,
    "status": "A",
    "distributorCodes": ["DIST02", "DIST03", "DIST07"],
    "information": {
      "paymentMethodCode": "CREDIT_CARD",
      "companyCode": "COMP002",
      "salesmanName": "Ana Patricia Vendedora",
      "visitDay": "Miércoles",
      "pdv": "PDV002",
      "deliveryDay": "Jueves",
      "warehouse": "ALMACEN_SUR_LIMA",
      "frequency": "Quincenal",
      "priceList": "LISTA_CORPORATIVA",
      "routeName": "Ruta Sur Lima",
      "withCredit": true,
      "distributorName": "Distribuidor Sur Lima",
      "sellerId": "SELL002",
      "routeId": "ROUTE002",
      "clientCode": "CLI002",
      "pdvname": "Supermercado Sur Plaza",
      "paymentTerm": "45 días",
      "customerClassDistTwo": "Cadena Nacional"
    }
  },
  {
    "email": "pedro.rodriguez@minimarketnoroeste.com",
    "firstName": "Pedro Antonio",
    "lastName": "Rodríguez Silva",
    "gender": "M",
    "phone": "+51987654323",
    "phoneOptional": "+51912345680",
    "documentType": "DNI",
    "document": "87654321",
    "customerClass": "C",
    "customerClassTwo": "Minorista",
    "customerClassThree": "Estándar",
    "customerClassDist": "Local",
    "customerClassDistTwo": "Independiente",
    "latitude": -12.0789,
    "longitude": -77.0234,
    "status": "A",
    "distributorCodes": ["DIST01", "DIST04"],
    "information": {
      "paymentMethodCode": "TRANSFER",
      "companyCode": "COMP003",
      "salesmanName": "Luis Fernando Representante",
      "visitDay": "Viernes",
      "pdv": "PDV003",
      "deliveryDay": "Sábado",
      "warehouse": "ALMACEN_CALLAO",
      "frequency": "Mensual",
      "priceList": "LISTA_ESTANDAR",
      "routeName": "Ruta Callao Norte",
      "withCredit": false,
      "distributorName": "Distribuidor Callao",
      "sellerId": "SELL003",
      "routeId": "ROUTE003",
      "clientCode": "CLI003",
      "pdvname": "Minimarket Noroeste",
      "paymentTerm": "Contado",
      "customerClassDistTwo": "Local Independiente"
    }
  },
  {
    "email": "ana.martinez@boticafarmacia.com",
    "firstName": "Ana Lucía",
    "lastName": "Martínez Flores",
    "gender": "F",
    "phone": "+51987654324",
    "phoneOptional": "+51987654401",
    "documentType": "RUC",
    "document": "20987654321",
    "customerClass": "A",
    "customerClassTwo": "Especializado",
    "customerClassThree": "Farmacia",
    "customerClassDist": "Especializado",
    "customerClassDistTwo": "Salud",
    "latitude": -12.0234,
    "longitude": -77.0789,
    "status": "A",
    "distributorCodes": ["DIST06", "DIST08"],
    "information": {
      "paymentMethodCode": "CHECK",
      "companyCode": "COMP004",
      "salesmanName": "Roberto Carlos Especialista",
      "visitDay": "Martes",
      "pdv": "PDV004",
      "deliveryDay": "Miércoles",
      "warehouse": "ALMACEN_ESPECIALIZADO",
      "frequency": "Semanal",
      "priceList": "LISTA_FARMACIA",
      "routeName": "Ruta Farmacias Lima",
      "withCredit": true,
      "distributorName": "Distribuidor Farmacéutico",
      "sellerId": "SELL004",
      "routeId": "ROUTE004",
      "clientCode": "CLI004",
      "pdvname": "Botica & Farmacia Central",
      "paymentTerm": "60 días",
      "customerClassDistTwo": "Red Farmacéutica"
    }
  },
  {
    "email": "carlos.lopez@restaurantedeluxe.com",
    "firstName": "Carlos Eduardo",
    "lastName": "López Vargas",
    "gender": "M",
    "phone": "+51987654325",
    "phoneOptional": "+51912345682",
    "documentType": "RUC",
    "document": "20456789123",
    "customerClass": "B",
    "customerClassTwo": "HoReCa",
    "customerClassThree": "Restaurante",
    "customerClassDist": "Gastronómico",
    "customerClassDistTwo": "Alta Cocina",
    "latitude": -12.1111,
    "longitude": -77.0333,
    "status": "A",
    "distributorCodes": ["DIST09", "DIST10"],
    "information": {
      "paymentMethodCode": "WIRE_TRANSFER",
      "companyCode": "COMP005",
      "salesmanName": "Patricia Elena Ejecutiva",
      "visitDay": "Jueves",
      "pdv": "PDV005",
      "deliveryDay": "Viernes",
      "warehouse": "ALMACEN_HORECA",
      "frequency": "Bisemanal",
      "priceList": "LISTA_HORECA",
      "routeName": "Ruta Restaurantes Premium",
      "withCredit": true,
      "distributorName": "Distribuidor HoReCa",
      "sellerId": "SELL005",
      "routeId": "ROUTE005",
      "clientCode": "CLI005",
      "pdvname": "Restaurante Deluxe Miraflores",
      "paymentTerm": "90 días",
      "customerClassDistTwo": "Cadena Gastronómica"
    }
  },
  {
    "email": "lucia.fernandez@kioskouniversitario.com",
    "firstName": "Lucía Isabel",
    "lastName": "Fernández Castro",
    "gender": "F",
    "phone": "+51987654326",
    "phoneOptional": "",
    "documentType": "DNI",
    "document": "11223344",
    "customerClass": "D",
    "customerClassTwo": "Micro",
    "customerClassThree": "Kiosko",
    "customerClassDist": "Micro",
    "customerClassDistTwo": "Estudiantil",
    "latitude": -12.0678,
    "longitude": -77.0123,
    "status": "N",
    "distributorCodes": ["DIST01"],
    "information": {
      "paymentMethodCode": "CASH",
      "companyCode": "COMP006",
      "salesmanName": "Miguel Angel Promotor",
      "visitDay": "Lunes",
      "pdv": "PDV006",
      "deliveryDay": "Martes",
      "warehouse": "ALMACEN_LIMA_ESTE",
      "frequency": "Semanal",
      "priceList": "LISTA_MICRO",
      "routeName": "Ruta Universitaria",
      "withCredit": false,
      "distributorName": "Distribuidor Zona Este",
      "sellerId": "SELL006",
      "routeId": "ROUTE006",
      "clientCode": "CLI006",
      "pdvname": "Kiosko Universitario UNI",
      "paymentTerm": "Contado",
      "customerClassDistTwo": "Canal Educativo"
    }
  },
  {
    "email": "raul.santos@autoservicioplaza.com",
    "firstName": "Raúl Alejandro",
    "lastName": "Santos Mendoza",
    "gender": "M",
    "phone": "+51987654327",
    "phoneOptional": "+51987654403",
    "documentType": "RUC",
    "document": "20789123456",
    "customerClass": "B",
    "customerClassTwo": "Autoservicio",
    "customerClassThree": "Plaza",
    "customerClassDist": "Moderno",
    "customerClassDistTwo": "Autoservicio",
    "latitude": -12.0890,
    "longitude": -77.0456,
    "status": "A",
    "distributorCodes": ["DIST02", "DIST05", "DIST11"],
    "information": {
      "paymentMethodCode": "CREDIT_CARD",
      "companyCode": "COMP007",
      "salesmanName": "Sandra Patricia Gerente",
      "visitDay": "Miércoles",
      "pdv": "PDV007",
      "deliveryDay": "Jueves",
      "warehouse": "ALMACEN_NORTE_LIMA",
      "frequency": "Semanal",
      "priceList": "LISTA_AUTOSERVICIO",
      "routeName": "Ruta Autoservicios Norte",
      "withCredit": true,
      "distributorName": "Distribuidor Norte Lima",
      "sellerId": "SELL007",
      "routeId": "ROUTE007",
      "clientCode": "CLI007",
      "pdvname": "Autoservicio Plaza Norte",
      "paymentTerm": "15 días",
      "customerClassDistTwo": "Canal Moderno"
    }
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

  const downloadSampleFile = async () => {
    console.log('🔵 Descargando archivo Excel de plantilla...');
    try {
      const timestamp = new Date().getTime();
      const fileUrl = `/templates/plantilla_clientes_comentarios.xlsx?v=${timestamp}`;
      console.log('🔵 URL del archivo:', fileUrl);
      
      // Fetch el archivo directamente
      const response = await fetch(fileUrl);
      console.log('🔵 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      console.log('🔵 Blob type:', blob.type);
      console.log('🔵 Blob size:', blob.size);
      
      // Crear URL del blob y descargar
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'plantilla_clientes_comentarios.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
      
      console.log('✅ Descarga completada exitosamente');
    } catch (error) {
      console.error('❌ Error al descargar archivo:', error);
      alert('Error al descargar el archivo. Por favor intenta nuevamente.');
    }
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