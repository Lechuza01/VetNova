"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { FaExclamationTriangle, FaPlus, FaPhone, FaClock, FaAmbulance } from "react-icons/fa"
import { useClinic } from "@/contexts/clinic-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { EmergencyForm } from "@/components/emergency-form"
import { mockUsers } from "@/lib/auth"

interface Emergency {
  id: string
  petId: string
  clientId: string
  reportedBy: string
  reportedAt: string
  priority: "low" | "medium" | "high" | "critical"
  description: string
  symptoms: string
  status: "pending" | "in_progress" | "resolved" | "cancelled"
  assignedTo?: string
  notes?: string
}

const mockEmergencies: Emergency[] = [
  {
    id: "1",
    petId: "1",
    clientId: "1",
    reportedBy: "Dr. María González",
    reportedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    priority: "critical",
    description: "Accidente de tráfico",
    symptoms: "Fractura visible en pata trasera, sangrado moderado",
    status: "in_progress",
    assignedTo: "Dr. Carlos Ruiz",
  },
  {
    id: "2",
    petId: "3",
    clientId: "2",
    reportedBy: "Ana López",
    reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    priority: "high",
    description: "Dificultad respiratoria",
    symptoms: "Jadeo excesivo, encías azuladas",
    status: "resolved",
    assignedTo: "Dr. María González",
  },
]

export default function EmergenciesPage() {
  const { pets, clients, branches } = useClinic()
  const { user } = useAuth()
  const { toast } = useToast()
  const [emergencies, setEmergencies] = useState<Emergency[]>(mockEmergencies)
  const [filterStatus, setFilterStatus] = useState<"all" | Emergency["status"]>("all")
  const [newDialogOpen, setNewDialogOpen] = useState(false)
  const [emergencyConfirmationOpen, setEmergencyConfirmationOpen] = useState(false)
  const [lastEmergencyData, setLastEmergencyData] = useState<{ branchName: string; branchAddress: string; veterinarianName: string } | null>(null)

  // Si es cliente, solo mostrar sus propias emergencias
  const clientEmergencies = user?.role === "cliente"
    ? emergencies.filter((e) => {
        const client = clients.find((c) => c.id === e.clientId)
        return client && (client.email === user.email || client.name === user.name)
      })
    : emergencies

  const filteredEmergencies = clientEmergencies.filter((e) => {
    if (filterStatus === "all") return true
    return e.status === filterStatus
  })

  const getPetInfo = (petId: string) => {
    return pets.find((p) => p.id === petId)
  }

  const getClientInfo = (clientId: string) => {
    return clients.find((c) => c.id === clientId)
  }

  const getPriorityBadge = (priority: Emergency["priority"]) => {
    const variants = {
      low: { variant: "secondary" as const, label: "Baja" },
      medium: { variant: "default" as const, label: "Media" },
      high: { variant: "destructive" as const, label: "Alta" },
      critical: { variant: "destructive" as const, label: "Crítica" },
    }
    const config = variants[priority]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getStatusBadge = (status: Emergency["status"]) => {
    const variants = {
      pending: { variant: "secondary" as const, label: "Pendiente" },
      in_progress: { variant: "default" as const, label: "En Proceso" },
      resolved: { variant: "default" as const, label: "Resuelta" },
      cancelled: { variant: "secondary" as const, label: "Cancelada" },
    }
    const config = variants[status]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const handleAddEmergency = (data: Omit<Emergency, "id" | "reportedBy" | "reportedAt">) => {
    const newEmergency: Emergency = {
      ...data,
      id: Date.now().toString(),
      reportedBy: user?.name || "Usuario",
      reportedAt: new Date().toISOString(),
    }
    setEmergencies((prev) => [newEmergency, ...prev])
    
    // Si es cliente, mostrar información de la sucursal de emergencias
    if (user?.role === "cliente") {
      // Buscar sucursal con servicio de urgencias (preferiblemente 24 horas)
      const emergencyBranch = branches.find((b) => 
        b.services.includes("urgencias") && b.isActive
      ) || branches.find((b) => b.services.includes("urgencias"))
      
      if (emergencyBranch) {
        const veterinarian = Object.values(mockUsers)
          .map((u) => u.user)
          .find((u) => u.id === emergencyBranch.chiefVeterinarianId)
        
        setLastEmergencyData({
          branchName: emergencyBranch.name,
          branchAddress: `${emergencyBranch.address}, ${emergencyBranch.city}`,
          veterinarianName: veterinarian?.name || "Dr. Carlos Ruiz",
        })
        setEmergencyConfirmationOpen(true)
      }
    } else {
      toast({
        title: "Emergencia registrada",
        description: "La emergencia se ha registrado correctamente",
      })
    }
    
    setNewDialogOpen(false)
  }

  const handleRequestAmbulance = () => {
    toast({
      title: "Ambulancia solicitada",
      description: "Se ha enviado la solicitud de ambulancia. Un vehículo será enviado a su ubicación.",
    })
    setEmergencyConfirmationOpen(false)
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Emergencias</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            {user?.role === "cliente" ? "Solicitar emergencia" : "Gestión de casos de emergencia"}
          </p>
        </div>
        <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full sm:w-auto">
              <FaPlus className="mr-2" />
              Nueva Emergencia
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Nueva Emergencia</DialogTitle>
              <DialogDescription>Completa los datos de la emergencia</DialogDescription>
            </DialogHeader>
            <EmergencyForm 
              pets={user?.role === "cliente" ? pets.filter((pet) => {
                const client = clients.find((c) => c.id === pet.clientId)
                return client && (client.email === user.email || client.name === user.name)
              }) : pets} 
              clients={clients} 
              currentUser={user}
              onSubmit={handleAddEmergency} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas - Solo para admin, veterinario y recepcionista */}
      {user?.role !== "cliente" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Críticas</CardTitle>
            <FaExclamationTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {emergencies.filter((e) => e.priority === "critical" && e.status !== "resolved").length}
            </div>
            <p className="text-xs text-muted-foreground">Urgentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
            <FaAmbulance className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {emergencies.filter((e) => e.status === "in_progress").length}
            </div>
            <p className="text-xs text-muted-foreground">Activas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <FaClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {emergencies.filter((e) => e.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Sin asignar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FaExclamationTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emergencies.length}</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Filtros - Solo para admin, veterinario y recepcionista */}
      {user?.role !== "cliente" && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("all")}
              >
                Todas
              </Button>
              <Button
                variant={filterStatus === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("pending")}
              >
                Pendientes
              </Button>
              <Button
                variant={filterStatus === "in_progress" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("in_progress")}
              >
                En Proceso
              </Button>
              <Button
                variant={filterStatus === "resolved" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("resolved")}
              >
                Resueltas
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Lista de emergencias - Todos pueden ver sus propias emergencias */}
      <Card>
        <CardHeader>
          <CardTitle>
            {user?.role === "cliente" ? "Mis Emergencias" : "Lista de Emergencias"}
          </CardTitle>
          <CardDescription>
            {user?.role === "cliente" 
              ? "Tus emergencias registradas"
              : "Todas las emergencias del sistema"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEmergencies.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FaExclamationTriangle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>{user?.role === "cliente" ? "No has registrado emergencias" : "No hay emergencias registradas"}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEmergencies.map((emergency) => {
                const pet = getPetInfo(emergency.petId)
                const client = getClientInfo(emergency.clientId)

                return (
                  <Card key={emergency.id} className={emergency.priority === "critical" ? "border-destructive" : ""}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-xl">{pet?.name || "Mascota desconocida"}</CardTitle>
                            {getPriorityBadge(emergency.priority)}
                            {getStatusBadge(emergency.status)}
                          </div>
                          <CardDescription>
                            {pet?.species} {pet?.breed} - Propietario: {client?.name || "Desconocido"}
                          </CardDescription>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <FaClock className="w-3 h-3" />
                              {formatDistanceToNow(new Date(emergency.reportedAt), {
                                addSuffix: true,
                                locale: es,
                              })}
                            </span>
                            <span>Reportado por: {emergency.reportedBy}</span>
                            {emergency.assignedTo && <span>Asignado a: {emergency.assignedTo}</span>}
                          </div>
                        </div>
                        {user?.role !== "cliente" && (
                          <Button variant="outline" size="sm">
                            <FaPhone className="w-4 h-4 mr-2" />
                            Llamar
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-1">Descripción</p>
                        <p className="text-sm text-muted-foreground">{emergency.description}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Síntomas</p>
                        <p className="text-sm text-muted-foreground">{emergency.symptoms}</p>
                      </div>
                      {emergency.notes && (
                        <div>
                          <p className="text-sm font-medium mb-1">Notas</p>
                          <p className="text-sm text-muted-foreground">{emergency.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de confirmación de emergencia para clientes */}
      {user?.role === "cliente" && lastEmergencyData && (
        <Dialog open={emergencyConfirmationOpen} onOpenChange={setEmergencyConfirmationOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FaExclamationTriangle className="text-destructive" />
                Emergencia Registrada
              </DialogTitle>
              <DialogDescription>
                Su emergencia ha sido registrada correctamente. Por favor, diríjase a la sucursal de emergencias.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Sucursal de Emergencias</p>
                  <p className="text-base font-semibold">{lastEmergencyData.branchName}</p>
                  <p className="text-sm text-muted-foreground mt-1">{lastEmergencyData.branchAddress}</p>
                </div>
                <div className="border-t pt-3">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Veterinario a Cargo</p>
                  <p className="text-base font-semibold">{lastEmergencyData.veterinarianName}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={handleRequestAmbulance} className="w-full">
                  <FaAmbulance className="mr-2" />
                  Solicitar Ambulancia
                </Button>
                <Button variant="outline" onClick={() => setEmergencyConfirmationOpen(false)} className="w-full">
                  Entendido
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}


