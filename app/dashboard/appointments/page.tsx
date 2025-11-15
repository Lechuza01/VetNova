"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FaPlus, FaEdit, FaTrash, FaCheck } from "react-icons/fa"
import { useClinic } from "@/contexts/clinic-context"
import { useAuth } from "@/contexts/auth-context"
import { useNotifications } from "@/contexts/notifications-context"
import { mockUsers } from "@/lib/auth"
import type { User } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import type { Branch } from "@/lib/types"

export default function AppointmentsPage() {
  const { appointments, pets, clients, branches, addAppointment, updateAppointment, deleteAppointment } = useClinic()
  const { user: currentUser } = useAuth()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [editingVet, setEditingVet] = useState<string | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("")

  // Obtener lista de veterinarios y profesionales (veterinarian, admin)
  const professionals = Object.values(mockUsers)
    .map((u) => u.user)
    .filter((u) => u.role === "veterinarian" || u.role === "admin")

  // Si es cliente, mostrar vista de disponibilidad
  if (currentUser?.role === "cliente") {
    return <ClientAvailabilityView appointments={appointments} pets={pets} clients={clients} addAppointment={addAppointment} />
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive"; label: string }> = {
      pending: { variant: "secondary", label: "Pendiente" },
      confirmed: { variant: "default", label: "Confirmado" },
      completed: { variant: "default", label: "Completado" },
      cancelled: { variant: "destructive", label: "Cancelado" },
    }
    const config = variants[status] || variants.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getPetName = (petId: string) => pets.find((p) => p.id === petId)?.name || "Desconocido"
  const getClientName = (clientId: string) => clients.find((c) => c.id === clientId)?.name || "Desconocido"
  const getVeterinarianName = (vetId: string) => {
    const vet = professionals.find((p) => p.id === vetId)
    return vet?.name || "Sin asignar"
  }
  const getBranchName = (branchId: string) => {
    const branch = branches.find((b) => b.id === branchId)
    return branch?.name || "Sin asignar"
  }

  const filteredAppointments = appointments.filter((apt) => {
    if (filterStatus !== "all" && apt.status !== filterStatus) return false
    return true
  })

  const todayAppointments = appointments.filter((apt) => {
    const today = new Date().toISOString().split("T")[0]
    return apt.date === today
  })

  const upcomingAppointments = appointments.filter((apt) => {
    const today = new Date().toISOString().split("T")[0]
    return apt.date > today
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Turnos</h1>
          <p className="text-muted-foreground mt-1">Gestión de citas y calendario</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <FaPlus className="mr-2" />
              Nuevo Turno
            </Button>
          </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Agendar Nuevo Turno</DialogTitle>
                <DialogDescription>Completa los datos de la cita</DialogDescription>
              </DialogHeader>
              <AppointmentForm pets={pets} clients={clients} professionals={professionals} branches={branches} onSubmit={addAppointment} />
            </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Turnos Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{todayAppointments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {todayAppointments.filter((a) => a.status === "pending").length} pendientes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Próximos Turnos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{upcomingAppointments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Programados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{appointments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Este mes</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="calendar">Calendario</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lista de Turnos</CardTitle>
                  <CardDescription>Total de {filteredAppointments.length} turnos</CardDescription>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="confirmed">Confirmados</SelectItem>
                    <SelectItem value="completed">Completados</SelectItem>
                    <SelectItem value="cancelled">Cancelados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Hora</TableHead>
                      <TableHead>Mascota</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Sucursal</TableHead>
                      <TableHead>Veterinario/Profesional</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAppointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>{new Date(appointment.date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{appointment.time}</TableCell>
                        <TableCell>{getPetName(appointment.petId)}</TableCell>
                        <TableCell>{getClientName(appointment.clientId)}</TableCell>
                        <TableCell>{getBranchName(appointment.branchId)}</TableCell>
                        <TableCell>
                          {currentUser?.role === "admin" && editingVet === appointment.id ? (
                            <Select
                              value={appointment.veterinarianId}
                              onValueChange={(value) => {
                                updateAppointment(appointment.id, { veterinarianId: value })
                                setEditingVet(null)
                              }}
                              onOpenChange={(open) => !open && setEditingVet(null)}
                            >
                              <SelectTrigger className="w-[200px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {professionals.map((prof) => (
                                  <SelectItem key={prof.id} value={prof.id}>
                                    {prof.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span>{getVeterinarianName(appointment.veterinarianId)}</span>
                              {currentUser?.role === "admin" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2"
                                  onClick={() => setEditingVet(appointment.id)}
                                >
                                  <FaEdit className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{appointment.reason}</TableCell>
                        <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {appointment.status === "pending" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateAppointment(appointment.id, { status: "confirmed" })}
                              >
                                <FaCheck className="w-4 h-4 text-primary" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <FaEdit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                appointment.status !== "cancelled"
                                  ? updateAppointment(appointment.id, { status: "cancelled" })
                                  : deleteAppointment(appointment.id)
                              }
                            >
                              <FaTrash className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <div className="grid md:grid-cols-[300px_1fr] gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Calendario</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Turnos del {selectedDate.toLocaleDateString()}</CardTitle>
                <CardDescription>
                  {appointments.filter((apt) => apt.date === selectedDate.toISOString().split("T")[0]).length} turnos
                  programados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {appointments
                    .filter((apt) => apt.date === selectedDate.toISOString().split("T")[0])
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 text-primary px-3 py-1 rounded font-medium text-sm">
                            {appointment.time}
                          </div>
                          <div>
                            <p className="font-medium">
                              {getPetName(appointment.petId)} - {getClientName(appointment.clientId)}
                            </p>
                            <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Sucursal: {getBranchName(appointment.branchId)} | Veterinario: {getVeterinarianName(appointment.veterinarianId)}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(appointment.status)}
                      </div>
                    ))}
                  {appointments.filter((apt) => apt.date === selectedDate.toISOString().split("T")[0]).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No hay turnos programados para esta fecha
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AppointmentForm({
  pets,
  clients,
  professionals,
  branches,
  onSubmit,
}: {
  pets: any[]
  clients: any[]
  professionals: User[]
  branches: Branch[]
  onSubmit: (appointment: any) => void
}) {
  const [selectedPet, setSelectedPet] = useState<string>("")
  const [selectedVeterinarian, setSelectedVeterinarian] = useState<string>("")
  const [selectedBranch, setSelectedBranch] = useState<string>("")

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const pet = pets.find((p) => p.id === selectedPet)
    const appointment = {
      id: Date.now().toString(),
      petId: selectedPet,
      clientId: pet?.clientId || "",
      veterinarianId: selectedVeterinarian || professionals[0]?.id || "",
      branchId: selectedBranch || branches[0]?.id || "",
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      reason: formData.get("reason") as string,
      status: "pending",
      notes: formData.get("notes") as string,
    }
    onSubmit(appointment)
  }

  const selectedPetData = pets.find((p) => p.id === selectedPet)
  const clientName = selectedPetData ? clients.find((c) => c.id === selectedPetData.clientId)?.name : ""

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="petId">Mascota *</Label>
        <Select value={selectedPet} onValueChange={setSelectedPet} required>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar mascota" />
          </SelectTrigger>
          <SelectContent>
            {pets.map((pet) => {
              const client = clients.find((c) => c.id === pet.clientId)
              return (
                <SelectItem key={pet.id} value={pet.id}>
                  {pet.name} ({pet.species}) - {client?.name}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
        {clientName && (
          <p className="text-sm text-muted-foreground">
            Propietario: <span className="font-medium">{clientName}</span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Fecha *</Label>
          <Input id="date" name="date" type="date" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="time">Hora *</Label>
          <Input id="time" name="time" type="time" required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="branchId">Sucursal *</Label>
          <Select value={selectedBranch} onValueChange={setSelectedBranch} required>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar sucursal" />
            </SelectTrigger>
            <SelectContent>
              {branches.filter((b) => b.isActive).map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="veterinarianId">Veterinario/Profesional *</Label>
          <Select value={selectedVeterinarian} onValueChange={setSelectedVeterinarian} required>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar veterinario" />
            </SelectTrigger>
            <SelectContent>
              {professionals.map((prof) => (
                <SelectItem key={prof.id} value={prof.id}>
                  {prof.name} ({prof.role === "admin" ? "Administrador" : "Veterinario"})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Motivo de la Consulta *</Label>
        <Input id="reason" name="reason" required placeholder="Vacunación, revisión, emergencia..." />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea id="notes" name="notes" placeholder="Información adicional..." rows={3} />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline">
          Cancelar
        </Button>
        <Button type="submit">Agendar Turno</Button>
      </div>
    </form>
  )
}

// Vista para clientes: mostrar solo fechas y horarios disponibles
function ClientAvailabilityView({
  appointments,
  pets,
  clients,
  addAppointment,
}: {
  appointments: any[]
  pets: any[]
  clients: any[]
  addAppointment: (appointment: any) => void
}) {
  const { user: currentUser } = useAuth()
  const { addNotification } = useNotifications()
  const { branches } = useClinic()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("")
  const [selectedPet, setSelectedPet] = useState<string>("")
  const [selectedService, setSelectedService] = useState<"consulta" | "internacion" | "urgencias">("consulta")
  const [selectedBranch, setSelectedBranch] = useState<string>("")
  const [reason, setReason] = useState<string>("")
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [appointmentDetails, setAppointmentDetails] = useState<{ date: string; time: string; pet: string; reason: string; branch: string } | null>(null)
  const { toast } = useToast()

  // Obtener lista de veterinarios y profesionales
  const professionals = Object.values(mockUsers)
    .map((u) => u.user)
    .filter((u) => u.role === "veterinarian" || u.role === "admin")

  // Obtener mascotas del cliente actual (buscando por email o nombre)
  const clientPets = pets.filter((pet) => {
    const client = clients.find((c) => c.id === pet.clientId)
    // Buscar por email o nombre del cliente
    return client && (client.email === currentUser?.email || client.name === currentUser?.name)
  })

  // Filtrar sucursales según el servicio seleccionado
  const availableBranches = branches.filter((branch) => {
    if (!branch.isActive) return false
    return branch.services.includes(selectedService)
  })

  // Resetear sucursal cuando cambia el servicio
  useEffect(() => {
    if (availableBranches.length > 0 && !availableBranches.find((b) => b.id === selectedBranch)) {
      setSelectedBranch(availableBranches[0].id)
    } else if (availableBranches.length === 0) {
      setSelectedBranch("")
    }
  }, [selectedService, availableBranches.length, selectedBranch])

  // Horarios disponibles: de 9:00 a 18:00 con intervalos de 30 minutos
  const generateTimeSlots = () => {
    const slots: string[] = []
    for (let hour = 9; hour < 18; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`)
      slots.push(`${hour.toString().padStart(2, "0")}:30`)
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  // Obtener turnos ocupados para una fecha específica y sucursal
  const getOccupiedSlots = (date: string, branchId: string) => {
    const dateAppointments = appointments.filter(
      (apt) =>
        apt.date === date &&
        apt.branchId === branchId &&
        (apt.status === "pending" || apt.status === "confirmed"),
    )
    return dateAppointments.map((apt) => apt.time)
  }

  // Obtener horarios disponibles para la fecha seleccionada y sucursal
  const getAvailableSlots = (date: string, branchId: string) => {
    if (!branchId) return []
    const occupiedSlots = getOccupiedSlots(date, branchId)
    return timeSlots.filter((slot) => !occupiedSlots.includes(slot))
  }

  const availableSlots = selectedBranch
    ? getAvailableSlots(selectedDate.toISOString().split("T")[0], selectedBranch)
    : []

  // Verificar si una fecha tiene disponibilidad para alguna sucursal
  const hasAvailability = (date: Date) => {
    if (availableBranches.length === 0) return false
    const dateStr = date.toISOString().split("T")[0]
    return availableBranches.some((branch) => getAvailableSlots(dateStr, branch.id).length > 0)
  }

  // Fechas no disponibles (por ejemplo, días festivos, días de cierre, etc.)
  const getUnavailableDates = (): string[] => {
    const today = new Date()
    const unavailableDates: string[] = []
    
    // Calcular fechas específicas no disponibles (ejemplo: 13/11 y 15/11)
    const unavailableDays = [13, 15] // Días del mes actual
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    
    unavailableDays.forEach((day) => {
      const unavailableDate = new Date(currentYear, currentMonth, day)
      // Solo agregar si la fecha es futura
      if (unavailableDate >= today) {
        unavailableDates.push(unavailableDate.toISOString().split("T")[0])
      }
    })
    
    return unavailableDates
  }

  const unavailableDates = getUnavailableDates()

  // Deshabilitar fechas pasadas y fechas marcadas como no disponibles
  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selected = new Date(date)
    selected.setHours(0, 0, 0, 0)
    const dateStr = selected.toISOString().split("T")[0]
    
    // Deshabilitar fechas pasadas o fechas no disponibles
    return selected < today || unavailableDates.includes(dateStr)
  }

  const handleTimeSlotClick = (time: string) => {
    if (!selectedBranch) {
      toast({
        title: "Error",
        description: "Por favor selecciona una sucursal primero",
        variant: "destructive",
      })
      return
    }
    setSelectedTimeSlot(time)
    setShowRequestForm(true)
  }

  const handleRequestAppointment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPet || !selectedTimeSlot || !reason || !selectedBranch) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    const pet = pets.find((p) => p.id === selectedPet)
    const branch = branches.find((b) => b.id === selectedBranch)
    const appointmentId = Date.now().toString()
    const appointment = {
      id: appointmentId,
      petId: selectedPet,
      clientId: pet?.clientId || "",
      veterinarianId: professionals[0]?.id || "", // Asignar automáticamente al primer veterinario disponible
      branchId: selectedBranch,
      date: selectedDate.toISOString().split("T")[0],
      time: selectedTimeSlot,
      reason: reason,
      status: "pending",
      notes: "",
    }

    addAppointment(appointment)
    
    // Crear notificación para el cliente
    addNotification({
      title: "Turno Reservado",
      message: `Tu turno para ${pet?.name || "tu mascota"} el ${selectedDate.toLocaleDateString()} a las ${selectedTimeSlot} en ${branch?.name || "la sucursal"} ha sido reservado correctamente. Motivo: ${reason}`,
      type: "appointment",
      appointmentId: appointmentId,
    })

    // Guardar detalles para el dialog de email
    setAppointmentDetails({
      date: selectedDate.toLocaleDateString(),
      time: selectedTimeSlot,
      pet: pet?.name || "",
      reason: reason,
      branch: branch?.name || "",
    })
    setShowEmailDialog(true)

    // Resetear formulario
    setSelectedTimeSlot("")
    setSelectedPet("")
    setReason("")
    setShowRequestForm(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Solicitar Turno</h1>
        <p className="text-muted-foreground mt-1">Selecciona un servicio, sucursal, fecha y horario disponible</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Servicio y Sucursal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service">Tipo de Servicio *</Label>
              <Select value={selectedService} onValueChange={(value: "consulta" | "internacion" | "urgencias") => setSelectedService(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar servicio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consulta">Consulta Veterinaria</SelectItem>
                  <SelectItem value="internacion">Internación</SelectItem>
                  <SelectItem value="urgencias">Urgencias</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch">Sucursal *</Label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch} disabled={availableBranches.length === 0}>
                <SelectTrigger>
                  <SelectValue placeholder={availableBranches.length === 0 ? "No hay sucursales disponibles" : "Seleccionar sucursal"} />
                </SelectTrigger>
                <SelectContent>
                  {availableBranches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name} {branch.is24Hours && "(24hs)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableBranches.length === 0 && (
                <p className="text-sm text-muted-foreground">No hay sucursales disponibles para este servicio</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-[350px_1fr] gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Seleccionar Fecha</CardTitle>
            <CardDescription>Elige una fecha con disponibilidad</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(date)
                  setSelectedTimeSlot("")
                  setShowRequestForm(false)
                }
              }}
              disabled={isDateDisabled}
              className="rounded-md border"
            />
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Horarios:</span> 9:00 - 18:00
              </p>
              <p className="text-xs text-muted-foreground mt-1">Intervalos de 30 minutos</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Horarios Disponibles</CardTitle>
            <CardDescription>
              {selectedDate.toLocaleDateString()} - {availableSlots.length} horarios disponibles
            </CardDescription>
          </CardHeader>
          <CardContent>
            {availableSlots.length > 0 ? (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot}
                    variant={selectedTimeSlot === slot ? "default" : "outline"}
                    onClick={() => handleTimeSlotClick(slot)}
                    className="h-12"
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No hay horarios disponibles para esta fecha</p>
                <p className="text-sm mt-2">Por favor selecciona otra fecha</p>
              </div>
            )}

            {showRequestForm && selectedTimeSlot && (
              <div className="mt-6 p-4 border rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-4">Solicitar Turno</h3>
                <form onSubmit={handleRequestAppointment} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pet">Mascota *</Label>
                    <Select value={selectedPet} onValueChange={setSelectedPet} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar mascota" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientPets.map((pet) => (
                          <SelectItem key={pet.id} value={pet.id}>
                            {pet.name} ({pet.species})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">Motivo de la Consulta *</Label>
                    <Input
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required
                      placeholder="Vacunación, revisión, emergencia..."
                    />
                  </div>

                  <div className="bg-background p-3 rounded border">
                    <p className="text-sm">
                      <span className="font-medium">Fecha:</span> {selectedDate.toLocaleDateString()}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Hora:</span> {selectedTimeSlot}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowRequestForm(false)} className="flex-1">
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1">
                      Solicitar Turno
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog de confirmación de email */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              Email Enviado
            </DialogTitle>
            <DialogDescription>
              Se ha enviado un email de confirmación a tu dirección de correo electrónico
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium">Detalles del turno:</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium">Mascota:</span> {appointmentDetails?.pet}
                </p>
                <p>
                  <span className="font-medium">Fecha:</span> {appointmentDetails?.date}
                </p>
                <p>
                  <span className="font-medium">Hora:</span> {appointmentDetails?.time}
                </p>
                <p>
                  <span className="font-medium">Motivo:</span> {appointmentDetails?.reason}
                </p>
                <p>
                  <span className="font-medium">Sucursal:</span> {appointmentDetails?.branch}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Revisa tu bandeja de entrada para ver la confirmación completa del turno. Te recordaremos el turno con
              anticipación.
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setShowEmailDialog(false)}>Entendido</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
