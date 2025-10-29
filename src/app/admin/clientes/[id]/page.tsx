"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { ClientHeader } from "@/components/clients/client-header";
import { ClientPersonalInfo } from "@/components/clients/client-personal-info";
import { ClientCommercialInfo } from "@/components/clients/client-commercial-info";
import { ClientAdditionalInfo } from "@/components/clients/client-additional-info";
import { ClientStatusPanel } from "@/components/clients/client-status-panel";
import { ClientStats } from "@/components/clients/client-stats";
import { ClientLocationMap } from "@/components/clients/client-location-map";
import { UnsavedChangesNotification } from "@/components/clients/unsaved-changes-notification";
import { api } from "@/api";
import { Loader2 } from "lucide-react";

// Interface para la respuesta de la API
interface ApiClientResponse {
  id: string;
  clientId: string;
  email: string;
  firstName: string;
  lastName: string;
  gender?: string;
  phone?: string;
  phoneOptional?: string;
  documentType?: string;
  document?: string;
  customerClass?: string;
  customerClassTwo?: string;
  customerClassThree?: string;
  customerClassDist?: string;
  customerClassDistTwo?: string;
  latitude?: number | null;
  longitude?: number | null;
  information?: Record<string, unknown>;
  distributorCodes?: string[];
  createdAt?: string;
  status?: string;
  updatedAt?: string;
  hasUser?: boolean;
}

// Datos de ejemplo - en producción vendría del servidor
const mockClientData = {
  id: "1",
  name: "TechCorp Solutions S.A.",
  businessName: "TechCorp Solutions S.A.",
  rut: "21.345.678.901",
  rutCode: "21345678901",
  phone: "+598 99 123 456",
  phoneSecond: "+598 99 765 432",
  email: "contacto@techcorp.com.uy",
  taxStatus: "Contribuyente",
  paymentTerm: 30,
  creditLimit: 500000,
  currencyCode: "UYU",
  paymentMethodCode: "TRANSFERENCIA",
  contactName: "María González",
  contactPhone: "+598 99 888 777",
  contactEmail: "maria@techcorp.com.uy",
  fiscalName: "TECHCORP SOLUTIONS S.A.",
  city: "Montevideo",
  district: "Centro",
  neighborhood: "Ciudad Vieja",
  address: "18 de Julio 1234",
  postalCode: "11000",
  country: "Uruguay",
  isActive: true,
  isBlocked: false,
  isVip: true,
  hasDebt: false,
  observations:
    "Cliente preferencial con historial de pagos excelente. Ha demostrado consistencia en sus compras y siempre cumple con los plazos de pago establecidos.",
  registrationDate: "2024-01-15",
  lastPurchase: "2024-03-10",
  totalPurchases: 1250000,
  latitude: -34.9051,
  longitude: -56.1915,
};

interface ClientData {
  id: string;
  name: string;
  businessName: string;
  rut: string;
  rutCode: string;
  phone: string;
  phoneSecond: string;
  email: string;
  taxStatus: string;
  paymentTerm: number;
  creditLimit: number;
  currencyCode: string;
  paymentMethodCode: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  fiscalName: string;
  city: string;
  district: string;
  neighborhood: string;
  address: string;
  postalCode: string;
  country: string;
  isActive: boolean;
  isBlocked: boolean;
  isVip: boolean;
  hasDebt: boolean;
  observations: string;
  registrationDate: string;
  lastPurchase: string;
  totalPurchases: number;
  latitude: number;
  longitude: number;
}

export default function ClientDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "view";
  const [isEditing, setIsEditing] = useState(mode === "edit");
  const [clientData, setClientData] = useState<ClientData>(mockClientData);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState<ClientData>(mockClientData);
  const [isLoading, setIsLoading] = useState(true);
  const [clientId, setClientId] = useState<string>("");

  // Efecto para obtener el clientId y cargar sus datos
  useEffect(() => {
    const loadClientData = async () => {
      try {
        const resolvedParams = await params;
        const clientIdParam = resolvedParams.id;
        setClientId(clientIdParam);
        
        console.log("[CLIENT DETAIL] 🔍 Cargando datos del cliente por clientId:", clientIdParam);
        setIsLoading(true);

        const response = await api.admin.clients.getByClientId(clientIdParam);
        
        console.log("[CLIENT DETAIL] 📦 Respuesta completa de la API:", response);
        console.log("[CLIENT DETAIL] 📦 response.success:", response.success);
        console.log("[CLIENT DETAIL] 📦 response.data:", response.data);
        console.log("[CLIENT DETAIL] 📦 Tipo de response.data:", typeof response.data);

        if (response.success && response.data) {
          // El http-client envuelve la respuesta, y el backend también devuelve { success, data }
          // Entonces response.data = { success: true, data: { cliente... } }
          const backendResponse = response.data as { success?: boolean; data?: ApiClientResponse };
          const apiData = (backendResponse.data || backendResponse) as unknown as ApiClientResponse;
          
          console.log("[CLIENT DETAIL] 📋 apiData completo:", apiData);
          console.log("[CLIENT DETAIL] 📋 apiData.firstName:", apiData.firstName);
          console.log("[CLIENT DETAIL] 📋 apiData.lastName:", apiData.lastName);
          console.log("[CLIENT DETAIL] 📋 Datos recibidos:", {
            id: apiData.id,
            clientId: apiData.clientId,
            email: apiData.email,
            firstName: apiData.firstName,
            lastName: apiData.lastName,
            status: apiData.status,
            hasUser: apiData.hasUser
          });
          
          // Mapear los datos de la API al formato que espera el componente
          const mappedData: ClientData = {
            id: apiData.id || apiData.clientId,
            name: `${apiData.firstName} ${apiData.lastName}`,
            businessName: `${apiData.firstName} ${apiData.lastName}`,
            rut: apiData.document || "",
            rutCode: apiData.document || "",
            phone: apiData.phone || "",
            phoneSecond: apiData.phoneOptional || "",
            email: apiData.email,
            taxStatus: apiData.customerClass || "Contribuyente",
            paymentTerm: parseInt((apiData.information?.paymentTerm as string) || "30"),
            creditLimit: (apiData.information?.withCredit as boolean) ? 500000 : 0,
            currencyCode: "UYU",
            paymentMethodCode: (apiData.information?.paymentMethodCode as string) || "TRANSFERENCIA",
            contactName: `${apiData.firstName} ${apiData.lastName}`,
            contactPhone: apiData.phone || "",
            contactEmail: apiData.email,
            fiscalName: (apiData.information?.fiscalName as string) || `${apiData.firstName} ${apiData.lastName}`,
            city: (apiData.information?.city as string) || "",
            district: "",
            neighborhood: (apiData.information?.neighborhood as string) || "",
            address: (apiData.information?.address as string) || "",
            postalCode: (apiData.information?.postalCode as string) || "",
            country: (apiData.information?.country as string) || "Uruguay",
            isActive: apiData.status === "A",
            isBlocked: apiData.status === "I",
            isVip: false,
            hasDebt: apiData.hasUser || false,
            observations: (apiData.information?.observations as string) || "",
            registrationDate: apiData.createdAt ? new Date(apiData.createdAt).toISOString().split('T')[0] : "",
            lastPurchase: apiData.updatedAt ? new Date(apiData.updatedAt).toISOString().split('T')[0] : "",
            totalPurchases: 0,
            latitude: apiData.latitude || -34.9051,
            longitude: apiData.longitude || -56.1915,
          };

          console.log("[CLIENT DETAIL] ✅ Datos mapeados:", mappedData);
          
          setClientData(mappedData);
          setOriginalData(mappedData);
        } else {
          console.error("[CLIENT DETAIL] ❌ Error en la respuesta:", response);
        }
      } catch (error) {
        console.error("[CLIENT DETAIL] ❌ Error al cargar datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadClientData();
  }, [params]);

  // Efecto para detectar cambios
  useEffect(() => {
    const hasDataChanged =
      JSON.stringify(clientData) !== JSON.stringify(originalData);
    setHasChanges(hasDataChanged && isEditing);
  }, [clientData, originalData, isEditing]);

  const handleInputChange = (
    field: keyof ClientData,
    value: string | number | boolean,
  ) => {
    if (!isEditing) return;

    setClientData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!clientId) {
      console.error("[CLIENT DETAIL] ❌ No hay clientId");
      alert("Error: No se puede guardar sin ID de cliente");
      return;
    }

    console.log("[CLIENT DETAIL] 💾 Guardando cambios:", clientData);
    
    try {
      // Mapear los datos del componente al formato de la API
      const updateData = {
        firstName: clientData.name.split(' ')[0],
        lastName: clientData.name.split(' ').slice(1).join(' ') || clientData.name.split(' ')[0],
        email: clientData.email,
        phone: clientData.phone,
        phoneOptional: clientData.phoneSecond,
        document: clientData.rut,
        documentType: clientData.rut ? "RUT" : "CI",
        status: clientData.isActive ? "A" : clientData.isBlocked ? "I" : "N",
        latitude: clientData.latitude,
        longitude: clientData.longitude,
        information: {
          paymentMethodCode: clientData.paymentMethodCode,
          paymentTerm: clientData.paymentTerm.toString(),
          withCredit: clientData.creditLimit > 0,
        }
      };

      console.log("[CLIENT DETAIL] 📤 Enviando a API con clientId:", clientId);
      console.log("[CLIENT DETAIL] 📤 Datos:", updateData);
      
      // Usar el clientId para actualizar
      const response = await api.admin.clients.update(clientId, updateData);
      
      if (response.success) {
        console.log("[CLIENT DETAIL] ✅ Cliente actualizado correctamente");
        setOriginalData(clientData);
        setHasChanges(false);
        setIsEditing(false);
        alert("Cliente actualizado correctamente");
      } else {
        console.error("[CLIENT DETAIL] ❌ Error en la respuesta:", response);
        alert("Error al actualizar el cliente");
      }
    } catch (error) {
      console.error("[CLIENT DETAIL] ❌ Error al guardar:", error);
      alert("Error al actualizar el cliente");
    }
  };

  const handleCancel = () => {
    setClientData(originalData);
    setHasChanges(false);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDiscard = () => {
    setClientData(originalData);
    setHasChanges(false);
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Loading State */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Cargando datos del cliente...
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Client ID: {clientId}
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <ClientHeader
                clientName={clientData.name}
                isEditing={isEditing}
                hasChanges={hasChanges}
                onEdit={handleEdit}
                onSave={handleSave}
                onCancel={handleCancel}
              />

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Columna Principal - Formulario */}
            <div className="xl:col-span-2 space-y-8 overflow-visible">
              {/* Información Personal */}
              <ClientPersonalInfo
                clientData={{
                  name: clientData.name,
                  businessName: clientData.businessName,
                  rut: clientData.rut,
                  email: clientData.email,
                  phone: clientData.phone,
                  phoneSecond: clientData.phoneSecond,
                }}
                isEditing={isEditing}
                onInputChange={handleInputChange}
              />

              {/* Información Comercial */}
              <ClientCommercialInfo
                clientData={{
                  taxStatus: clientData.taxStatus,
                  paymentTerm: clientData.paymentTerm,
                  creditLimit: clientData.creditLimit,
                  currencyCode: clientData.currencyCode,
                }}
                isEditing={isEditing}
                onInputChange={handleInputChange}
              />

              {/* Información Adicional */}
              <ClientAdditionalInfo
                clientData={{
                  paymentMethodCode: clientData.paymentMethodCode,
                  contactName: clientData.contactName,
                  contactPhone: clientData.contactPhone,
                  contactEmail: clientData.contactEmail,
                  fiscalName: clientData.fiscalName,
                  city: clientData.city,
                  neighborhood: clientData.neighborhood,
                  address: clientData.address,
                  postalCode: clientData.postalCode,
                  country: clientData.country,
                  observations: clientData.observations,
                }}
                isEditing={isEditing}
                onInputChange={handleInputChange}
              />
            </div>

            {/* Columna Lateral - Información y Estado */}
            <div className="space-y-6">
              {/* Estado del Cliente */}
              <ClientStatusPanel
                clientData={{
                  isActive: clientData.isActive,
                  isBlocked: clientData.isBlocked,
                  isVip: clientData.isVip,
                  hasDebt: clientData.hasDebt,
                }}
                isEditing={isEditing}
                onInputChange={handleInputChange}
              />

              {/* Estadísticas */}
              <ClientStats
                clientData={{
                  registrationDate: clientData.registrationDate,
                  lastPurchase: clientData.lastPurchase,
                  totalPurchases: clientData.totalPurchases,
                  creditLimit: clientData.creditLimit,
                  currencyCode: clientData.currencyCode,
                }}
              />

              {/* Mapa de Ubicación */}
              <ClientLocationMap
                clientData={{
                  address: clientData.address,
                  city: clientData.city,
                  neighborhood: clientData.neighborhood,
                  country: clientData.country,
                  latitude: clientData.latitude,
                  longitude: clientData.longitude,
                }}
              />
            </div>
          </div>

              {/* Notificación de cambios no guardados */}
              <UnsavedChangesNotification
                hasChanges={hasChanges}
                onSave={handleSave}
                onDiscard={handleDiscard}
              />
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
