import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileUploadComponent } from '../shared/FileUploadComponent';
import { StepProps, UploadMethod, UploadResult } from '../shared/types';
import { Users, Building, Mail, Phone } from 'lucide-react';
import { api, ClientBulkData, ClientBulkCreateResponse } from '@/api';

// Definir tipos para clientes
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
  // Campos adicionales del JSON completo
  [key: string]: unknown;
}

// Función helper para obtener valores seguros
const getClientValue = (client: ClientData, field: keyof ClientData, defaultValue = '') => {
  const value = client[field];
  return value != null ? String(value) : defaultValue;
};

const getClientName = (client: ClientData): string => {
  if (client.name) return client.name;
  if (client.firstName && client.lastName) return `${client.firstName} ${client.lastName}`;
  if (client.firstName) return client.firstName;
  return 'Cliente sin nombre';
};

const getCreditLimit = (client: ClientData): number => {
  return typeof client.creditLimit === 'number' ? client.creditLimit : 0;
};

const getPaymentTerms = (client: ClientData): string => {
  if (client.paymentTerm) return client.paymentTerm;
  if (typeof client.paymentTerms === 'number') return `${client.paymentTerms} días`;
  return 'No especificado';
};

// Datos de ejemplo para clientes (formato compatible con la API)
const sampleClients: ClientData[] = [
  {
    email: "juan.perez@tiendacentral.com",
    firstName: "Juan Carlos",
    lastName: "Pérez Mendoza",
    name: "Juan Carlos Pérez Mendoza", // Para display
    gender: "M",
    phone: "+51987654321",
    phoneOptional: "+51912345678",
    documentType: "DNI",
    document: "12345678",
    customerClass: "A",
    customerClassTwo: "VIP",
    customerClassThree: "Premium",
    customerClassDist: "Nacional",
    customerClassDistTwo: "Mayorista",
    latitude: -12.0464,
    longitude: -77.0428,
    status: "A",
    paymentMethodCode: "CASH",
    companyCode: "COMP001",
    salesmanName: "Carlos Alberto Vendedor",
    visitDay: "Lunes",
    pdv: "PDV001",
    deliveryDay: "Martes",
    warehouse: "ALMACEN_LIMA_CENTRO",
    frequency: "Semanal",
    priceList: "LISTA_PREMIUM",
    routeName: "Ruta Lima Centro",
    withCredit: true,
    distributorName: "Distribuidor Lima Central",
    sellerId: "SELL001",
    routeId: "ROUTE001",
    code: "CLI001",
    pdvname: "Tienda Central Lima",
    paymentTerm: "30 días",
    distributorCodes: ["DIST01", "DIST05"],
    creditLimit: 50000,
    clientType: "company",
    city: "Lima",
    country: "Perú",
    taxId: "20123456789"
  },
  {
    email: "maria.garcia@supermercadosur.com",
    firstName: "María Elena",
    lastName: "García Rodríguez",
    name: "María Elena García Rodríguez",
    gender: "F",
    phone: "+51987654322",
    phoneOptional: "+51987654399",
    documentType: "RUC",
    document: "20123456789",
    customerClass: "B",
    customerClassTwo: "Corporativo",
    customerClassThree: "Mayorista",
    customerClassDist: "Regional",
    customerClassDistTwo: "Cadena",
    latitude: -12.1234,
    longitude: -77.0567,
    status: "A",
    paymentMethodCode: "CREDIT_CARD",
    companyCode: "COMP002",
    salesmanName: "Ana Patricia Vendedora",
    visitDay: "Miércoles",
    pdv: "PDV002",
    deliveryDay: "Jueves",
    warehouse: "ALMACEN_SUR_LIMA",
    frequency: "Quincenal",
    priceList: "LISTA_CORPORATIVA",
    routeName: "Ruta Sur Lima",
    withCredit: true,
    distributorName: "Distribuidor Sur Lima",
    sellerId: "SELL002",
    routeId: "ROUTE002",
    code: "CLI002",
    pdvname: "Supermercado Sur Plaza",
    paymentTerm: "45 días",
    distributorCodes: ["DIST02", "DIST03", "DIST07"],
    creditLimit: 75000,
    clientType: "company",
    city: "Lima",
    country: "Perú",
    taxId: "20987654321"
  },
  {
    email: "pedro.rodriguez@minimarket.com",
    firstName: "Pedro Antonio",
    lastName: "Rodríguez Silva",
    name: "Pedro Antonio Rodríguez Silva",
    gender: "M",
    phone: "+51987654323",
    phoneOptional: "+51912345680",
    documentType: "DNI",
    document: "87654321",
    customerClass: "C",
    customerClassTwo: "Estándar",
    customerClassThree: "Minorista",
    customerClassDist: "Local",
    customerClassDistTwo: "Independiente",
    latitude: -11.9854,
    longitude: -77.0621,
    status: "A",
    paymentMethodCode: "CASH",
    companyCode: "COMP003",
    salesmanName: "Luis Fernando Comercial",
    visitDay: "Viernes",
    pdv: "PDV003",
    deliveryDay: "Sábado",
    warehouse: "ALMACEN_NORTE_LIMA",
    frequency: "Mensual",
    priceList: "LISTA_ESTANDAR",
    routeName: "Ruta Norte Lima",
    withCredit: false,
    distributorName: "Distribuidor Norte",
    sellerId: "SELL003",
    routeId: "ROUTE003",
    code: "CLI003",
    pdvname: "MiniMarket Noroeste",
    paymentTerm: "Contado",
    distributorCodes: ["DIST01"],
    creditLimit: 15000,
    clientType: "individual",
    city: "Lima",
    country: "Perú",
    taxId: "10876543211"
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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'json' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  // Función para manejar la carga de datos (sin llamar a la API todavía)
  const handleUpload = async (result: UploadResult<ClientData>) => {
    if (result.success) {
      setError(null);
      setUploadedData(result.data);
      
      // Guardar el método usado (file o json)
      if (method === 'file') {
        setUploadMethod('file');
      } else {
        setUploadMethod('json');
      }
    } else {
      setError(result.error || 'Error desconocido al procesar los datos');
    }
  };

  // Función para manejar la carga de archivos
  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setUploadMethod('file');
  };

  // Función para transformar datos al formato de la API
  const transformToAPIFormat = (clients: ClientData[]): ClientBulkData[] => {
    return clients.map(client => ({
      email: getClientValue(client, 'email', ''),
      firstName: getClientValue(client, 'firstName', '') || getClientValue(client, 'name', ''),
      lastName: getClientValue(client, 'lastName', ''),
      phone: getClientValue(client, 'phone', ''),
      phoneOptional: getClientValue(client, 'phoneOptional', '') || undefined,
      gender: (getClientValue(client, 'gender', '') as "M" | "F") || undefined,
      documentType: getClientValue(client, 'documentType', '') || undefined,
      document: getClientValue(client, 'document', '') || undefined,
      customerClass: getClientValue(client, 'customerClass', '') || undefined,
      customerClassTwo: getClientValue(client, 'customerClassTwo', '') || undefined,
      customerClassThree: getClientValue(client, 'customerClassThree', '') || undefined,
      customerClassDist: getClientValue(client, 'customerClassDist', '') || undefined,
      customerClassDistTwo: getClientValue(client, 'customerClassDistTwo', '') || undefined,
      latitude: typeof client.latitude === 'number' ? client.latitude : undefined,
      longitude: typeof client.longitude === 'number' ? client.longitude : undefined,
      status: (getClientValue(client, 'status', 'A') as "A" | "N" | "I") || "A",
      distributorCodes: Array.isArray(client.distributorCodes) ? client.distributorCodes : undefined,
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
    }));
  };

  // Función para confirmar y enviar a la API
  const handleConfirmAndContinue = async () => {
    if (uploadedData.length === 0) {
      setError('No hay datos para procesar');
      return;
    }

    setIsConfirming(true);
    setIsProcessing(true);
    setError(null);

    try {
      // Verificar qué método se usó para subir los datos
      if (uploadMethod === 'json') {
        // Método 1: JSON - Usar POST /api/clients/
        console.log('📤 Enviando clientes vía JSON (POST /api/clients/)...');
        console.log('📊 Total de clientes a enviar:', uploadedData.length);
        
        const clientsForAPI = transformToAPIFormat(uploadedData);
        console.log('📋 Datos transformados:', clientsForAPI.slice(0, 2)); // Mostrar primeros 2 para debug
        
        const apiResponse = await api.admin.clients.bulkCreate(clientsForAPI);
        console.log('📥 Respuesta de la API:', apiResponse);
        
        if (apiResponse.success) {
          const response = apiResponse.data as ClientBulkCreateResponse;
          console.log('✅ Clientes creados exitosamente:', response);
          
          // Mostrar resumen si hay errores
          if (response.results.errorCount > 0) {
            const errorMsg = `⚠️ Se procesaron ${response.results.totalProcessed} clientes. ${response.results.successCount} exitosos, ${response.results.errorCount} con errores.`;
            setError(errorMsg);
            
            // Aún así continuar si hubo algunos exitosos
            if (response.results.successCount > 0) {
              setTimeout(() => {
                onNext({ uploadedClients: uploadedData });
              }, 2000);
            } else {
              setIsConfirming(false);
              setIsProcessing(false);
            }
          } else {
            // Todo exitoso
            setTimeout(() => {
              onNext({ uploadedClients: uploadedData });
            }, 1000);
          }
        } else {
          throw new Error(apiResponse.message || 'Error al crear clientes');
        }
      } else if (uploadMethod === 'file' && uploadedFile) {
        // Método 2: Archivo - Usar POST /api/clients/import
        console.log('📁 Enviando clientes vía archivo (POST /api/clients/import)...');
        
        const formData = new FormData();
        formData.append('file', uploadedFile);
        
        // Llamar al endpoint de importación (necesitamos agregarlo al API)
        const response = await fetch('/api/clients/import', {
          method: 'POST',
          body: formData,
          headers: {
            // No agregar Content-Type, el navegador lo establecerá automáticamente con boundary
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
          throw new Error(errorData.message || `Error HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Clientes importados exitosamente:', result);
        
        // Mostrar resumen
        if (result.details?.errorCount > 0) {
          const errorMsg = `⚠️ Se procesaron ${result.details.totalProcessed} clientes. ${result.details.savedCount} guardados, ${result.details.errorCount} con errores.`;
          setError(errorMsg);
        }
        
        // Continuar al siguiente paso
        setTimeout(() => {
          onNext({ uploadedClients: uploadedData });
        }, 1000);
      } else {
        throw new Error('Método de carga no válido');
      }
    } catch (error) {
      console.error('❌ Error al confirmar clientes:', error);
      
      // Determinar el tipo de error y mostrar mensaje apropiado
      let errorMessage = 'Error desconocido';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Detectar errores comunes
        if (errorMessage.includes('Network Error') || errorMessage.includes('ERR_CONNECTION_REFUSED')) {
          errorMessage = '🔴 No se puede conectar con el servidor. Verifica que el backend esté corriendo en http://localhost:3001';
        } else if (errorMessage.includes('timeout')) {
          errorMessage = '⏱️ La solicitud tardó demasiado. El servidor puede estar sobrecargado o no responde.';
        } else if (errorMessage.includes('401')) {
          errorMessage = '🔒 No estás autenticado. Por favor inicia sesión nuevamente.';
        } else if (errorMessage.includes('403')) {
          errorMessage = '🚫 No tienes permisos para realizar esta acción.';
        } else if (errorMessage.includes('404')) {
          errorMessage = '❓ El endpoint /api/clients/ no existe en el servidor. Contacta al administrador.';
        } else if (errorMessage.includes('500')) {
          errorMessage = '💥 Error interno del servidor. Revisa los logs del backend.';
        }
      }
      
      setError(`❌ ${errorMessage}`);
      setIsConfirming(false);
      setIsProcessing(false);
    }
  };

  const calculateStats = (clients: ClientData[]) => {
    if (clients.length === 0) return { totalClients: 0, companies: 0, individuals: 0, avgCredit: 0 };
    
    const companies = clients.filter(c => c.clientType === 'company').length;
    const individuals = clients.filter(c => c.clientType === 'individual').length;
    const totalCredit = clients.reduce((sum, client) => sum + getCreditLimit(client), 0);
    const avgCredit = clients.length > 0 ? totalCredit / clients.length : 0;
    
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
          <div>
            <h3 className="text-xl font-semibold" style={{ color: themeColors.text.primary }}>
              Clientes Procesados Correctamente
            </h3>
            <p className="text-sm mt-1" style={{ color: themeColors.text.secondary }}>
              Revisa los datos importados y confirma si son correctos
            </p>
          </div>
          <motion.button
            onClick={() => setUploadedData([])}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-lg flex items-center gap-2"
            style={{ 
              backgroundColor: `${themeColors.accent}20`,
              color: themeColors.accent,
              border: `1px solid ${themeColors.accent}30`
            }}
          >
            🔄 Cargar Otros Datos
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
                        {getClientName(client)}
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
                        <span style={{ color: themeColors.text.secondary }}>{getClientValue(client, 'email', 'Sin email')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3" style={{ color: themeColors.text.secondary }} />
                        <span style={{ color: themeColors.text.secondary }}>{getClientValue(client, 'phone', 'Sin teléfono')}</span>
                      </div>
                    </div>
                    
                    <div className="text-xs mt-2" style={{ color: themeColors.text.secondary }}>
                      <span className="font-medium">Código:</span> {getClientValue(client, 'code', 'Sin código')} • 
                      <span className="font-medium"> Ciudad:</span> {getClientValue(client, 'city', 'Sin ciudad')}, {getClientValue(client, 'country', 'Sin país')}
                      {client.taxId && (
                        <>
                          <span className="font-medium"> • Tax ID:</span> {client.taxId}
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <div className="text-lg font-bold" style={{ color: themeColors.primary }}>
                      ${getCreditLimit(client).toLocaleString()}
                    </div>
                    <div className="text-xs" style={{ color: themeColors.text.secondary }}>
                      Límite de Crédito
                    </div>
                    <div className="text-xs mt-1" style={{ color: themeColors.text.secondary }}>
                      Términos: {getPaymentTerms(client)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Confirmación y botones de navegación */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-6 rounded-2xl border"
          style={{
            backgroundColor: `${themeColors.primary}05`,
            borderColor: `${themeColors.primary}30`,
          }}
        >
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                 style={{ backgroundColor: `${themeColors.primary}20` }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="text-2xl"
              >
                ✓
              </motion.div>
            </div>
            <h4 className="text-lg font-semibold mb-2" style={{ color: themeColors.text.primary }}>
              ¿Confirmar importación de clientes?
            </h4>
            <p className="text-sm" style={{ color: themeColors.text.secondary }}>
              Los datos se han procesado correctamente. Revisa la información anterior y confirma si deseas continuar con estos {uploadedData.length} clientes.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <motion.button
              onClick={onBack}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 rounded-xl font-medium order-2 sm:order-1"
              style={{
                backgroundColor: `${themeColors.surface}50`,
                color: themeColors.text.secondary,
                border: `2px solid ${themeColors.surface}`,
              }}
            >
              ← Volver Atrás
            </motion.button>
            
            <div className="flex flex-col sm:flex-row gap-3 order-1 sm:order-2">
              <motion.button
                onClick={() => setUploadedData([])}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 rounded-xl font-medium"
                style={{
                  backgroundColor: `${themeColors.accent}20`,
                  color: themeColors.accent,
                  border: `2px solid ${themeColors.accent}30`,
                }}
              >
                🔄 Cargar Otros Datos
              </motion.button>
              
              <motion.button
                onClick={handleConfirmAndContinue}
                disabled={isConfirming || isProcessing}
                whileHover={{ scale: (isConfirming || isProcessing) ? 1 : 1.05 }}
                whileTap={{ scale: (isConfirming || isProcessing) ? 1 : 0.98 }}
                className="px-8 py-3 rounded-xl font-semibold text-white shadow-lg flex items-center gap-2 min-w-[200px] justify-center"
                style={{ 
                  backgroundColor: (isConfirming || isProcessing) ? `${themeColors.primary}80` : themeColors.primary,
                  boxShadow: `0 4px 12px ${themeColors.primary}30`,
                  cursor: (isConfirming || isProcessing) ? 'wait' : 'pointer'
                }}
              >
                {(isConfirming || isProcessing) ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    {uploadMethod === 'json' ? 'Enviando JSON...' : 'Importando archivo...'}
                  </>
                ) : (
                  <>
                    ✅ Confirmar y Continuar
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
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
            onClick={() => {
              // Solo permitir cambio si no hay datos cargados
              if (uploadedData.length === 0 || uploadMethod === null) {
                setMethod("file");
              }
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={uploadMethod === 'json' && uploadedData.length > 0}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              method === "file" ? "" : "opacity-70"
            }`}
            style={{
              backgroundColor: method === "file" ? themeColors.primary : "transparent",
              color: method === "file" ? "white" : themeColors.text.primary,
              cursor: (uploadMethod === 'json' && uploadedData.length > 0) ? 'not-allowed' : 'pointer',
              opacity: (uploadMethod === 'json' && uploadedData.length > 0) ? 0.5 : 1
            }}
          >
            📁 Subir Archivo
          </motion.button>
          <motion.button
            onClick={() => {
              // Solo permitir cambio si no hay datos cargados
              if (uploadedData.length === 0 || uploadMethod === null) {
                setMethod("json");
              }
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={uploadMethod === 'file' && uploadedData.length > 0}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              method === "json" ? "" : "opacity-70"
            }`}
            style={{
              backgroundColor: method === "json" ? themeColors.primary : "transparent",
              color: method === "json" ? "white" : themeColors.text.primary,
              cursor: (uploadMethod === 'file' && uploadedData.length > 0) ? 'not-allowed' : 'pointer',
              opacity: (uploadMethod === 'file' && uploadedData.length > 0) ? 0.5 : 1
            }}
          >
            📋 Importar JSON
          </motion.button>
        </div>
      </div>

      {/* Mensaje informativo si ya se cargó un método */}
      {uploadedData.length > 0 && uploadMethod && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border"
          style={{
            backgroundColor: `${themeColors.primary}10`,
            borderColor: `${themeColors.primary}30`
          }}
        >
          <div className="flex items-center gap-2 text-sm">
            <div className="w-5 h-5">ℹ️</div>
            <div style={{ color: themeColors.text.primary }}>
              <strong>Método seleccionado:</strong> {uploadMethod === 'file' ? 'Archivo Excel/CSV' : 'JSON'}. 
              {' '}Solo puedes usar un método por vez. Para cambiar, primero elimina los datos cargados.
            </div>
          </div>
        </motion.div>
      )}

      {/* Mostrar error si existe */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border border-red-200 bg-red-50"
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 text-red-500">⚠️</div>
            <div>
              <h4 className="text-sm font-semibold text-red-800">Error al procesar los datos</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <div className="text-xs text-red-600 mt-2">
                <strong>Sugerencias:</strong>
                <ul className="list-disc list-inside mt-1">
                  <li>Verifica que el JSON sea válido (usa un validador JSON online)</li>
                  <li>Asegúrate de que sea un array de objetos</li>
                  <li>Elimina caracteres especiales o espacios extra al final</li>
                  <li>Descarga el ejemplo y usa su formato exacto</li>
                </ul>
              </div>
            </div>
          </div>
          <motion.button
            onClick={() => setError(null)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-3 px-3 py-1 bg-red-200 text-red-800 rounded text-sm hover:bg-red-300"
          >
            Cerrar
          </motion.button>
        </motion.div>
      )}

      {/* Componente de upload */}
      <FileUploadComponent
        method={method}
        onUpload={handleUpload}
        onFileSelect={handleFileUpload}
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