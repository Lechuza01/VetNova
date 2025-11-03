"use client"

import type React from "react"

import { useState } from "react"
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

export default function AppointmentsPage() {
  const { appointments, pets, clients, addAppointment, updateAppointment, deleteAppointment } = useClinic()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [filterStatus, setFilterStatus] = useState<string>("all")

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
            <AppointmentForm pets={pets} clients={clients} onSubmit={addAppointment} />
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
  onSubmit,
}: {
  pets: any[]
  clients: any[]
  onSubmit: (appointment: any) => void
}) {
  const [selectedPet, setSelectedPet] = useState<string>("")

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const pet = pets.find((p) => p.id === selectedPet)
    const appointment = {
      id: Date.now().toString(),
      petId: selectedPet,
      clientId: pet?.clientId || "",
      veterinarianId: "2",
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
