"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { FaHandSparkles, FaHandScissors } from "react-icons/fa"
import { useClinic } from "@/contexts/clinic-context"
import { useAuth } from "@/contexts/auth-context"
import { useNotifications } from "@/contexts/notifications-context"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Image from "next/image"

export default function SpaGroomingPage() {
  const { user: currentUser } = useAuth()
  
  // Si no es cliente, redirigir o mostrar mensaje
  if (currentUser?.role !== "cliente") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Esta sección está disponible solo para clientes</p>
      </div>
    )
  }

  return <SpaGroomingClientView />
}

function SpaGroomingClientView() {
  const { spaGroomingAppointments, pets, clients, branches, addSpaGroomingAppointment } = useClinic()
  const { user: currentUser } = useAuth()
  const { addNotification } = useNotifications()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("")
  const [selectedPet, setSelectedPet] = useState<string>("")
  const [selectedService, setSelectedService] = useState<"spa" | "grooming">("grooming")
  const [selectedBranch, setSelectedBranch] = useState<string>("")
  const [reason, setReason] = useState<string>("")
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [appointmentDetails, setAppointmentDetails] = useState<{ date: string; time: string; pet: string; service: string; branch: string } | null>(null)
  const { toast } = useToast()

  // Filtrar solo sucursales con shop (Centro, Palermo, Belgrano)
  const shopBranches = branches.filter((branch) => 
    branch.type === "veterinaria_shop" && branch.isActive
  )

  // Obtener mascotas del cliente actual
  const clientPets = pets.filter((pet) => {
    const client = clients.find((c) => c.id === pet.clientId)
    return client && (client.email === currentUser?.email || client.name === currentUser?.name)
  })

  // Resetear sucursal cuando cambia el servicio
  useEffect(() => {
    if (shopBranches.length > 0 && !shopBranches.find((b) => b.id === selectedBranch)) {
      setSelectedBranch(shopBranches[0].id)
    } else if (shopBranches.length === 0) {
      setSelectedBranch("")
    }
  }, [selectedService, shopBranches.length, selectedBranch])

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
    const dateAppointments = spaGroomingAppointments.filter(
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

  // Verificar si una fecha tiene disponibilidad
  const hasAvailability = (date: Date) => {
    if (shopBranches.length === 0) return false
    const dateStr = date.toISOString().split("T")[0]
    return shopBranches.some((branch) => getAvailableSlots(dateStr, branch.id).length > 0)
  }

  // Deshabilitar fechas pasadas
  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selected = new Date(date)
    selected.setHours(0, 0, 0, 0)
    return selected < today
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
    if (!selectedPet || !selectedTimeSlot || !selectedBranch) {
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
      branchId: selectedBranch,
      date: selectedDate.toISOString().split("T")[0],
      time: selectedTimeSlot,
      serviceType: selectedService,
      reason: reason || undefined,
      status: "pending" as const,
      notes: "",
    }

    addSpaGroomingAppointment(appointment)
    
    // Crear notificación para el cliente
    addNotification({
      title: "Turno de Spa/Peluquería Reservado",
      message: `Tu turno de ${selectedService === "spa" ? "Spa" : "Peluquería"} para ${pet?.name || "tu mascota"} el ${selectedDate.toLocaleDateString()} a las ${selectedTimeSlot} en ${branch?.name || "la sucursal"} ha sido reservado correctamente.`,
      type: "appointment",
      appointmentId: appointmentId,
    })

    // Guardar detalles para el dialog de email
    setAppointmentDetails({
      date: selectedDate.toLocaleDateString(),
      time: selectedTimeSlot,
      pet: pet?.name || "",
      service: selectedService === "spa" ? "Spa" : "Peluquería",
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
        <h1 className="text-3xl font-bold text-foreground">Spa & Peluquería</h1>
        <p className="text-muted-foreground mt-1">Reserva un turno para el cuidado y belleza de tu mascota</p>
      </div>

      {/* Imágenes glam de peluquería canina */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="relative h-48 rounded-lg overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=400&fit=crop"
            alt="Peluquería canina profesional"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
            <p className="text-white font-semibold">Cuidado Profesional</p>
          </div>
        </div>
        <div className="relative h-48 rounded-lg overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&h=400&fit=crop"
            alt="Spa para mascotas"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
            <p className="text-white font-semibold">Experiencia Premium</p>
          </div>
        </div>
        <div className="relative h-48 rounded-lg overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1517849845537-4d257902454a?w=600&h=400&fit=crop"
            alt="Mascota feliz después del spa"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
            <p className="text-white font-semibold">Resultados Glam</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Servicio y Sucursal</CardTitle>
          <CardDescription>Elige el tipo de servicio y la sucursal más conveniente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service">Tipo de Servicio *</Label>
              <Select value={selectedService} onValueChange={(value: "spa" | "grooming") => setSelectedService(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar servicio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grooming">
                    <div className="flex items-center gap-2">
                      <FaHandScissors className="w-4 h-4" />
                      Peluquería
                    </div>
                  </SelectItem>
                  <SelectItem value="spa">
                    <div className="flex items-center gap-2">
                      <FaHandSparkles className="w-4 h-4" />
                      Spa
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch">Sucursal *</Label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch} disabled={shopBranches.length === 0}>
                <SelectTrigger>
                  <SelectValue placeholder={shopBranches.length === 0 ? "No hay sucursales disponibles" : "Seleccionar sucursal"} />
                </SelectTrigger>
                <SelectContent>
                  {shopBranches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {shopBranches.length === 0 && (
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
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  {selectedService === "spa" ? (
                    <>
                      <FaHandSparkles className="w-4 h-4 text-primary" />
                      Reservar Turno de Spa
                    </>
                  ) : (
                    <>
                      <FaHandScissors className="w-4 h-4 text-primary" />
                      Reservar Turno de Peluquería
                    </>
                  )}
                </h3>
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
                    <Label htmlFor="reason">Motivo o Notas (Opcional)</Label>
                    <Textarea
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Ej: Corte de verano, baño con tratamiento especial..."
                      rows={3}
                    />
                  </div>

                  <div className="bg-background p-3 rounded border">
                    <p className="text-sm">
                      <span className="font-medium">Servicio:</span> {selectedService === "spa" ? "Spa" : "Peluquería"}
                    </p>
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
                      Reservar Turno
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
                  <span className="font-medium">Servicio:</span> {appointmentDetails?.service}
                </p>
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

