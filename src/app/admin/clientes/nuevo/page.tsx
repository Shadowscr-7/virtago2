"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { showToast } from "@/store/toast-helpers";
import { useAuthStore } from "@/store/auth";

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

// Datos iniciales vacíos para un nuevo cliente
const emptyClientData: ClientData = {
  id: "",
  name: "",
  businessName: "",
  rut: "",
  rutCode: "",
  phone: "",
  phoneSecond: "",
  email: "",
  taxStatus: "Contribuyente",
  paymentTerm: 30,
  creditLimit: 0,
  currencyCode: "UYU",
  paymentMethodCode: "TRANSFERENCIA",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  fiscalName: "",
  city: "",
  district: "",
  neighborhood: "",
  address: "",
  postalCode: "",
  country: "Uruguay",
  isActive: true,
  isBlocked: false,
  isVip: false,
  hasDebt: false,
  observations: "",
  registrationDate: new Date().toISOString().split('T')[0],
  lastPurchase: "",
  totalPurchases: 0,
  latitude: -34.9051,
  longitude: -56.1915,
};

export default function NuevoCliente() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [clientData, setClientData] = useState<ClientData>(emptyClientData);
  const [hasChanges, setHasChanges] = useState(false);
  const isEditing = true; // Siempre en modo edición en esta página

  const handleInputChange = (
    field: keyof ClientData,
    value: string | number | boolean,
  ) => {
    setClientData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    // Validaciones básicas
    if (!clientData.name || !clientData.email) {
      showToast({
        title: "Campos requeridos",
        description: "Por favor completa el nombre y el email del cliente",
        type: "error"
      });
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientData.email)) {
      showToast({
        title: "Email inválido",
        description: "Por favor ingresa un email válido",
        type: "error"
      });
      return;
    }

    console.log("[NUEVO CLIENTE] 💾 Creando cliente:", clientData);
    
    try {
      // Obtener el distributorCode del usuario
      const distributorCode = user?.distributorInfo?.distributorCode || "Dist01";
      
      // Separar nombre y apellido
      const nameParts = clientData.name.trim().split(' ');
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(' ') || firstName;

      // Mapear los datos del componente al formato de la API
      const createData = {
        firstName,
        lastName,
        email: clientData.email,
        phone: clientData.phone || undefined,
        phoneOptional: clientData.phoneSecond || undefined,
        document: clientData.rut || undefined,
        documentType: clientData.rut ? "RUT" : undefined,
        customerClass: clientData.taxStatus || undefined,
        status: clientData.isActive ? "A" : "N",
        latitude: clientData.latitude || undefined,
        longitude: clientData.longitude || undefined,
        distributorCodes: [distributorCode],
        information: {
          paymentMethodCode: clientData.paymentMethodCode,
          paymentTerm: clientData.paymentTerm.toString(),
          withCredit: clientData.creditLimit > 0,
          fiscalName: clientData.fiscalName || undefined,
          city: clientData.city || undefined,
          district: clientData.district || undefined,
          neighborhood: clientData.neighborhood || undefined,
          address: clientData.address || undefined,
          postalCode: clientData.postalCode || undefined,
          country: clientData.country || undefined,
          observations: clientData.observations || undefined,
        }
      };

      console.log("[NUEVO CLIENTE] 📤 Enviando a API POST /api/clients/");
      console.log("[NUEVO CLIENTE] 📤 Datos:", createData);
      
      const response = await api.admin.clients.create(createData);
      
      if (response.success) {
        console.log("[NUEVO CLIENTE] ✅ Cliente creado correctamente:", response.data);
        
        showToast({
          title: "Cliente creado",
          description: `El cliente ${clientData.name} ha sido creado correctamente`,
          type: "success"
        });
        
        // Redirigir a la lista de clientes después de un breve delay
        setTimeout(() => {
          router.push('/admin/clientes');
        }, 1500);
      } else {
        console.error("[NUEVO CLIENTE] ❌ Error en la respuesta:", response);
        showToast({
          title: "Error al crear cliente",
          description: response.message || "No se pudo crear el cliente",
          type: "error"
        });
      }
    } catch (error) {
      console.error("[NUEVO CLIENTE] ❌ Error al crear:", error);
      showToast({
        title: "Error al crear cliente",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        type: "error"
      });
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm("¿Estás seguro de que deseas cancelar? Se perderán los cambios realizados.")) {
        router.push('/admin/clientes');
      }
    } else {
      router.push('/admin/clientes');
    }
  };

  const handleDiscard = () => {
    if (confirm("¿Estás seguro de que deseas descartar los cambios?")) {
      setClientData(emptyClientData);
      setHasChanges(false);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <ClientHeader
            clientName={clientData.name || "Nuevo Cliente"}
            isEditing={isEditing}
            hasChanges={hasChanges}
            onEdit={() => {}} // No hace nada, siempre está en modo edición
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

            {/* Columna Lateral - Info y Stats */}
            <div className="space-y-8">
              {/* Panel de Estado */}
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

          {/* Notificación de Cambios No Guardados */}
          {hasChanges && (
            <UnsavedChangesNotification
              hasChanges={hasChanges}
              onSave={handleSave}
              onDiscard={handleDiscard}
            />
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
