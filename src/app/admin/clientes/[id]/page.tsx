"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { AdminLayout } from "@/components/admin/admin-layout"
import { useAuthStore } from "@/lib/auth-store"
import { ClientHeader } from "@/components/clients/client-header"
import { ClientPersonalInfo } from "@/components/clients/client-personal-info"
import { ClientCommercialInfo } from "@/components/clients/client-commercial-info"
import { ClientAdditionalInfo } from "@/components/clients/client-additional-info"
import { ClientStatusPanel } from "@/components/clients/client-status-panel"
import { ClientStats } from "@/components/clients/client-stats"
import { ClientLocationMap } from "@/components/clients/client-location-map"
import { UnsavedChangesNotification } from "@/components/clients/unsaved-changes-notification"

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
  observations: "Cliente preferencial con historial de pagos excelente. Ha demostrado consistencia en sus compras y siempre cumple con los plazos de pago establecidos.",
  registrationDate: "2024-01-15",
  lastPurchase: "2024-03-10",
  totalPurchases: 1250000,
  latitude: -34.9051,
  longitude: -56.1915
}

interface ClientData {
  id: string
  name: string
  businessName: string
  rut: string
  rutCode: string
  phone: string
  phoneSecond: string
  email: string
  taxStatus: string
  paymentTerm: number
  creditLimit: number
  currencyCode: string
  paymentMethodCode: string
  contactName: string
  contactPhone: string
  contactEmail: string
  fiscalName: string
  city: string
  district: string
  neighborhood: string
  address: string
  postalCode: string
  country: string
  isActive: boolean
  isBlocked: boolean
  isVip: boolean
  hasDebt: boolean
  observations: string
  registrationDate: string
  lastPurchase: string
  totalPurchases: number
  latitude: number
  longitude: number
}

export default function ClientDetail({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') || 'view'
  const [isEditing, setIsEditing] = useState(mode === 'edit')
  const [clientData, setClientData] = useState<ClientData>(mockClientData)
  const [hasChanges, setHasChanges] = useState(false)
  const [originalData, setOriginalData] = useState<ClientData>(mockClientData)

  // En el futuro se usará params.id para cargar datos específicos del cliente
  console.log('Client ID:', params.id)

  // Efecto para detectar cambios
  useEffect(() => {
    const hasDataChanged = JSON.stringify(clientData) !== JSON.stringify(originalData)
    setHasChanges(hasDataChanged && isEditing)
  }, [clientData, originalData, isEditing])

  const handleInputChange = (field: keyof ClientData, value: string | number | boolean) => {
    if (!isEditing) return
    
    setClientData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = () => {
    console.log('Guardando cambios:', clientData)
    setOriginalData(clientData)
    setHasChanges(false)
    setIsEditing(false)
    
    // Aquí iría la llamada a la API para guardar los datos
    // try {
    //   await updateClient(params.id, clientData)
    //   toast.success('Cliente actualizado correctamente')
    // } catch (error) {
    //   toast.error('Error al actualizar el cliente')
    // }
  }

  const handleCancel = () => {
    setClientData(originalData)
    setHasChanges(false)
    setIsEditing(false)
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleDiscard = () => {
    setClientData(originalData)
    setHasChanges(false)
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
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
            <div className="xl:col-span-2 space-y-8">
              {/* Información Personal */}
              <ClientPersonalInfo
                clientData={{
                  name: clientData.name,
                  businessName: clientData.businessName,
                  rut: clientData.rut,
                  email: clientData.email,
                  phone: clientData.phone,
                  phoneSecond: clientData.phoneSecond
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
                  currencyCode: clientData.currencyCode
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
                  observations: clientData.observations
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
                  hasDebt: clientData.hasDebt
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
                  currencyCode: clientData.currencyCode
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
                  longitude: clientData.longitude
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
        </div>
      </div>
    </AdminLayout>
  )
}
