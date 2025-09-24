import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileUploadComponent } from '../shared/FileUploadComponent';
import { StepProps, UploadMethod, UploadResult } from '../shared/types';
import { Users, Building, Mail, Phone } from 'lucide-react';

// Definir tipos para clientes
interface ClientData {
  code: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  clientType: 'individual' | 'company';
  taxId?: string;
  creditLimit: number;
  paymentTerms: number;
}

// Datos de ejemplo para clientes
const sampleClients: ClientData[] = [
  {
    code: "CLI001",
    name: "TechStore Solutions",
    email: "ventas@techstore.com",
    phone: "+1-555-0123",
    address: "123 Tech Avenue",
    city: "San Francisco",
    country: "USA",
    clientType: "company",
    taxId: "12-3456789",
    creditLimit: 50000,
    paymentTerms: 30
  },
  {
    code: "CLI002", 
    name: "GameHub Distribution",
    email: "orders@gamehub.com",
    phone: "+1-555-0456",
    address: "456 Gaming Street",
    city: "Los Angeles",
    country: "USA",
    clientType: "company",
    taxId: "98-7654321",
    creditLimit: 75000,
    paymentTerms: 15
  },
  {
    code: "CLI003",
    name: "Juan Carlos Pérez",
    email: "juan.perez@email.com",
    phone: "+52-555-0789",
    address: "Av. Reforma 789",
    city: "Ciudad de México",
    country: "México",
    clientType: "individual",
    creditLimit: 5000,
    paymentTerms: 0
  },
  {
    code: "CLI004",
    name: "Electronics Plus Inc",
    email: "purchasing@electronicsplus.com",
    phone: "+1-555-1234",
    address: "789 Commerce Blvd",
    city: "Miami",
    country: "USA",
    clientType: "company",
    taxId: "55-9988776",
    creditLimit: 100000,
    paymentTerms: 45
  },
  {
    code: "CLI005",
    name: "María González",
    email: "maria.gonzalez@gmail.com",
    phone: "+34-666-555-444",
    address: "Calle Mayor 123",
    city: "Madrid",
    country: "España",
    clientType: "individual",
    creditLimit: 3000,
    paymentTerms: 0
  },
  {
    code: "CLI006",
    name: "Digital World Corp",
    email: "info@digitalworld.com",
    phone: "+44-20-7946-0958",
    address: "10 Oxford Street",
    city: "London",
    country: "Reino Unido",
    clientType: "company",
    taxId: "GB-123456789",
    creditLimit: 80000,
    paymentTerms: 30
  },
  {
    code: "CLI007",
    name: "Roberto Silva",
    email: "roberto.silva@outlook.com",
    phone: "+55-11-98765-4321",
    address: "Rua Paulista 456",
    city: "São Paulo",
    country: "Brasil",
    clientType: "individual",
    creditLimit: 8000,
    paymentTerms: 7
  },
  {
    code: "CLI008",
    name: "TechMart Wholesale",
    email: "wholesale@techmart.com",
    phone: "+1-555-9999",
    address: "1500 Business Park Dr",
    city: "Austin",
    country: "USA",
    clientType: "company",
    taxId: "77-5544332",
    creditLimit: 150000,
    paymentTerms: 60
  }
];

interface ClientStepProps extends StepProps {
  stepData?: {
    uploadedClients?: ClientData[];
  };
}

export function ClientStep({ onNext, onBack, themeColors, stepData }: ClientStepProps) {
  const [method, setMethod] = useState<UploadMethod>("file");
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedData, setUploadedData] = useState<ClientData[]>(
    Array.isArray(stepData?.uploadedClients) ? stepData.uploadedClients : []
  );

  const handleUpload = (result: UploadResult<ClientData>) => {
    if (result.success) {
      setIsProcessing(true);
      
      // Simular procesamiento y validación de datos
      setTimeout(() => {
        setUploadedData(result.data);
        setIsProcessing(false);
        onNext({ uploadedClients: result.data });
      }, 2000);
    } else {
      // Manejar error
      console.error('Error uploading clients:', result.error);
    }
  };

  const calculateStats = (clients: ClientData[]) => {
    if (clients.length === 0) return { totalClients: 0, companies: 0, individuals: 0, avgCredit: 0 };
    
    const companies = clients.filter(c => c.clientType === 'company').length;
    const individuals = clients.filter(c => c.clientType === 'individual').length;
    const avgCredit = clients.reduce((sum, client) => sum + client.creditLimit, 0) / clients.length;
    
    return {
      totalClients: clients.length,
      companies,
      individuals,
      avgCredit: Math.round(avgCredit)
    };
  };

  if (uploadedData.length > 0 && !isProcessing) {
    const stats = calculateStats(uploadedData);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold" style={{ color: themeColors.text.primary }}>
            Clientes Cargados
          </h3>
          <motion.button
            onClick={() => setUploadedData([])}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-lg"
            style={{ 
              backgroundColor: `${themeColors.accent}20`,
              color: themeColors.accent 
            }}
          >
            Cargar Otros
          </motion.button>
        </div>

        {/* Estadísticas */}
        <div 
          className="p-6 rounded-xl"
          style={{ backgroundColor: `${themeColors.surface}30` }}
        >
          <h4 className="text-lg font-semibold mb-4" style={{ color: themeColors.text.primary }}>
            Resumen de Clientes
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2"
                style={{ backgroundColor: `${themeColors.primary}20` }}
              >
                <Users className="w-6 h-6" style={{ color: themeColors.primary }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: themeColors.primary }}>
                {stats.totalClients}
              </div>
              <div className="text-sm" style={{ color: themeColors.text.secondary }}>
                Total Clientes
              </div>
            </div>
            <div className="text-center">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2"
                style={{ backgroundColor: `${themeColors.secondary}20` }}
              >
                <Building className="w-6 h-6" style={{ color: themeColors.secondary }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: themeColors.secondary }}>
                {stats.companies}
              </div>
              <div className="text-sm" style={{ color: themeColors.text.secondary }}>
                Empresas
              </div>
            </div>
            <div className="text-center">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2"
                style={{ backgroundColor: `${themeColors.accent}20` }}
              >
                <Users className="w-6 h-6" style={{ color: themeColors.accent }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: themeColors.accent }}>
                {stats.individuals}
              </div>
              <div className="text-sm" style={{ color: themeColors.text.secondary }}>
                Individuales
              </div>
            </div>
            <div className="text-center">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2"
                style={{ backgroundColor: `${themeColors.primary}20` }}
              >
                <span className="text-lg font-bold" style={{ color: themeColors.primary }}>$</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: themeColors.primary }}>
                ${stats.avgCredit.toLocaleString()}
              </div>
              <div className="text-sm" style={{ color: themeColors.text.secondary }}>
                Crédito Promedio
              </div>
            </div>
          </div>
        </div>

        {/* Lista de clientes */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold" style={{ color: themeColors.text.primary }}>
            Clientes Registrados
          </h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {uploadedData.map((client, index) => (
              <motion.div
                key={`${client.code}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: `${themeColors.surface}20`,
                  borderColor: `${themeColors.primary}30`,
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {client.clientType === 'company' ? (
                        <Building className="w-4 h-4" style={{ color: themeColors.primary }} />
                      ) : (
                        <Users className="w-4 h-4" style={{ color: themeColors.accent }} />
                      )}
                      <h5 className="font-semibold" style={{ color: themeColors.text.primary }}>
                        {client.name}
                      </h5>
                      <span 
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{ 
                          backgroundColor: client.clientType === 'company' ? `${themeColors.primary}20` : `${themeColors.accent}20`,
                          color: client.clientType === 'company' ? themeColors.primary : themeColors.accent
                        }}
                      >
                        {client.clientType === 'company' ? 'Empresa' : 'Individual'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3" style={{ color: themeColors.text.secondary }} />
                        <span style={{ color: themeColors.text.secondary }}>{client.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3" style={{ color: themeColors.text.secondary }} />
                        <span style={{ color: themeColors.text.secondary }}>{client.phone}</span>
                      </div>
                    </div>
                    
                    <div className="text-xs mt-2" style={{ color: themeColors.text.secondary }}>
                      <span className="font-medium">Código:</span> {client.code} • 
                      <span className="font-medium"> Ciudad:</span> {client.city}, {client.country}
                      {client.taxId && (
                        <>
                          <span className="font-medium"> • Tax ID:</span> {client.taxId}
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <div className="text-lg font-bold" style={{ color: themeColors.primary }}>
                      ${client.creditLimit.toLocaleString()}
                    </div>
                    <div className="text-xs" style={{ color: themeColors.text.secondary }}>
                      Límite de Crédito
                    </div>
                    <div className="text-xs mt-1" style={{ color: themeColors.text.secondary }}>
                      Términos: {client.paymentTerms} días
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Botones de navegación */}
        <div className="flex justify-between pt-6">
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 rounded-xl font-medium"
            style={{
              backgroundColor: `${themeColors.surface}50`,
              color: themeColors.text.secondary,
            }}
          >
            Anterior
          </motion.button>
          <motion.button
            onClick={() => onNext({ uploadedClients: uploadedData })}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 rounded-xl font-medium text-white"
            style={{ backgroundColor: themeColors.primary }}
          >
            Continuar
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selector de método */}
      <div className="flex items-center justify-center">
        <div 
          className="flex p-1 rounded-xl"
          style={{ backgroundColor: `${themeColors.surface}50` }}
        >
          <motion.button
            onClick={() => setMethod("file")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              method === "file" ? "" : "opacity-70"
            }`}
            style={{
              backgroundColor: method === "file" ? themeColors.primary : "transparent",
              color: method === "file" ? "white" : themeColors.text.primary,
            }}
          >
            Subir Archivo
          </motion.button>
          <motion.button
            onClick={() => setMethod("json")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              method === "json" ? "" : "opacity-70"
            }`}
            style={{
              backgroundColor: method === "json" ? themeColors.primary : "transparent",
              color: method === "json" ? "white" : themeColors.text.primary,
            }}
          >
            Importar JSON
          </motion.button>
        </div>
      </div>

      {/* Componente de upload */}
      <FileUploadComponent
        method={method}
        onUpload={handleUpload}
        onBack={onBack}
        themeColors={themeColors}
        sampleData={sampleClients}
        title="Clientes"
        acceptedFileTypes=".csv,.xlsx,.json"
        fileExtensions={["csv", "xlsx", "json"]}
        isProcessing={isProcessing}
      />
    </div>
  );
}