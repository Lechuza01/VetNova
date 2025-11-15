"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FaUser, FaEdit, FaSave, FaTimes, FaCalendarAlt, FaTrash } from "react-icons/fa"
import { useAuth } from "@/contexts/auth-context"
import { useClinic } from "@/contexts/clinic-context"
import { useToast } from "@/hooks/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const { appointments, pets, clients, branches, updateAppointment, deleteAppointment } = useClinic()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    address: "",
  })
  const [appointmentFormData, setAppointmentFormData] = useState({
    date: "",
    time: "",
    reason: "",
    notes: "",
  })

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      })
    }
  }, [user])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    if (!user) return

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      toast({
        title: "Error",
        description: "Por favor ingresa un email válido",
        variant: "destructive",
      })
      return
    }

    updateUser({
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
    })

    toast({
      title: "Perfil actualizado",
      description: "Tus datos han sido guardados correctamente",
    })

    setIsEditing(false)
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      })
    }
    setIsEditing(false)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: "Administrador",
      veterinarian: "Veterinario",
      receptionist: "Recepcionista",
      cliente: "Cliente",
    }
    return labels[role] || role
  }

  // Obtener el cliente asociado al usuario actual
  const currentClient = clients.find((c) => c.email === user?.email || c.name === user?.name)

  // Obtener turnos del cliente
  const clientAppointments = currentClient
    ? appointments.filter((apt) => apt.clientId === currentClient.id).sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`)
        const dateB = new Date(`${b.date}T${b.time}`)
        return dateB.getTime() - dateA.getTime()
      })
    : []

  const getPetName = (petId: string) => pets.find((p) => p.id === petId)?.name || "Desconocido"
  const getClientName = (clientId: string) => clients.find((c) => c.id === clientId)?.name || "Desconocido"
  const getBranchName = (branchId: string) => {
    const branch = branches.find((b) => b.id === branchId)
    return branch?.name || "Sin asignar"
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

  const handleEditAppointment = (appointment: any) => {
    setEditingAppointment(appointment.id)
    setAppointmentFormData({
      date: appointment.date,
      time: appointment.time,
      reason: appointment.reason,
      notes: appointment.notes || "",
    })
  }

  const handleSaveAppointment = () => {
    if (!editingAppointment) return

    updateAppointment(editingAppointment, {
      date: appointmentFormData.date,
      time: appointmentFormData.time,
      reason: appointmentFormData.reason,
      notes: appointmentFormData.notes,
    })

    toast({
      title: "Turno actualizado",
      description: "Los cambios han sido guardados correctamente",
    })

    setEditingAppointment(null)
  }

  const handleCancelAppointment = (appointmentId: string) => {
    updateAppointment(appointmentId, { status: "cancelled" })
    toast({
      title: "Turno cancelado",
      description: "El turno ha sido cancelado correctamente",
    })
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Cargando perfil...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mi Perfil</h1>
          <p className="text-muted-foreground mt-1">Gestiona tu información personal</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <FaEdit className="mr-2" />
            Editar Perfil
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>{user.name}</CardTitle>
            <CardDescription>
              <Badge variant="secondary" className="mt-2">
                {getRoleLabel(user.role)}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-muted-foreground">Usuario</p>
                <p className="font-medium">{user.username}</p>
              </div>
              {user.birthDate && (
                <div>
                  <p className="text-muted-foreground">Fecha de Nacimiento</p>
                  <p className="font-medium">{new Date(user.birthDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Información de Contacto</CardTitle>
            <CardDescription>Actualiza tu información de contacto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="tu@email.com"
                  />
                ) : (
                  <p className="text-sm font-medium py-2">{user.email || "No especificado"}</p>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+34 600 000 000"
                  />
                ) : (
                  <p className="text-sm font-medium py-2">{user.phone || "No especificado"}</p>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                {isEditing ? (
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Calle Principal 123, Ciudad"
                  />
                ) : (
                  <p className="text-sm font-medium py-2">{user.address || "No especificada"}</p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="flex-1">
                  <FaSave className="mr-2" />
                  Guardar Cambios
                </Button>
                <Button variant="outline" onClick={handleCancel} className="flex-1">
                  <FaTimes className="mr-2" />
                  Cancelar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Nombre de Usuario</p>
              <p className="font-medium">{user.username}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Rol</p>
              <p className="font-medium capitalize">{getRoleLabel(user.role)}</p>
            </div>
            {user.birthDate && (
              <div>
                <p className="text-muted-foreground">Fecha de Nacimiento</p>
                <p className="font-medium">{new Date(user.birthDate).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sección de turnos para clientes */}
      {user.role === "cliente" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaCalendarAlt />
              Mis Turnos
            </CardTitle>
            <CardDescription>Gestiona tus turnos y citas programadas</CardDescription>
          </CardHeader>
          <CardContent>
            {clientAppointments.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Hora</TableHead>
                      <TableHead>Mascota</TableHead>
                      <TableHead>Sucursal</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientAppointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>{new Date(appointment.date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{appointment.time}</TableCell>
                        <TableCell>{getPetName(appointment.petId)}</TableCell>
                        <TableCell>{getBranchName(appointment.branchId)}</TableCell>
                        <TableCell>{appointment.reason}</TableCell>
                        <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {appointment.status !== "completed" && appointment.status !== "cancelled" && (
                              <>
                                <Dialog
                                  open={editingAppointment === appointment.id}
                                  onOpenChange={(open) => {
                                    if (!open) {
                                      setEditingAppointment(null)
                                    } else {
                                      handleEditAppointment(appointment)
                                    }
                                  }}
                                >
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <FaEdit className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Editar Turno</DialogTitle>
                                      <DialogDescription>Modifica los datos de tu turno</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <Label htmlFor="edit-date">Fecha *</Label>
                                          <Input
                                            id="edit-date"
                                            type="date"
                                            value={appointmentFormData.date}
                                            onChange={(e) =>
                                              setAppointmentFormData((prev) => ({ ...prev, date: e.target.value }))
                                            }
                                            required
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label htmlFor="edit-time">Hora *</Label>
                                          <Input
                                            id="edit-time"
                                            type="time"
                                            value={appointmentFormData.time}
                                            onChange={(e) =>
                                              setAppointmentFormData((prev) => ({ ...prev, time: e.target.value }))
                                            }
                                            required
                                          />
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-reason">Motivo *</Label>
                                        <Input
                                          id="edit-reason"
                                          value={appointmentFormData.reason}
                                          onChange={(e) =>
                                            setAppointmentFormData((prev) => ({ ...prev, reason: e.target.value }))
                                          }
                                          required
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-notes">Notas</Label>
                                        <Textarea
                                          id="edit-notes"
                                          value={appointmentFormData.notes}
                                          onChange={(e) =>
                                            setAppointmentFormData((prev) => ({ ...prev, notes: e.target.value }))
                                          }
                                          rows={3}
                                        />
                                      </div>
                                      <div className="flex gap-2 pt-4">
                                        <Button variant="outline" onClick={() => setEditingAppointment(null)} className="flex-1">
                                          Cancelar
                                        </Button>
                                        <Button onClick={handleSaveAppointment} className="flex-1">
                                          Guardar Cambios
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                {appointment.status !== "cancelled" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCancelAppointment(appointment.id)}
                                  >
                                    <FaTrash className="w-4 h-4 text-destructive" />
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FaCalendarAlt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No tienes turnos programados</p>
                <p className="text-sm mt-2">Puedes solicitar un turno desde el módulo de Turnos</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sección de turnos en calendario para admin */}
      {user.role === "admin" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaCalendarAlt />
              Turnos - Vista de Calendario
            </CardTitle>
            <CardDescription>Visualiza los turnos en formato calendario</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="calendar" className="w-full">
              <TabsList>
                <TabsTrigger value="calendar">Calendario</TabsTrigger>
                <TabsTrigger value="list">Lista</TabsTrigger>
              </TabsList>

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
                                    Sucursal: {getBranchName(appointment.branchId)}
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

              <TabsContent value="list" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Hora</TableHead>
                        <TableHead>Mascota</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Sucursal</TableHead>
                        <TableHead>Motivo</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments
                        .sort((a, b) => {
                          const dateA = new Date(`${a.date}T${a.time}`)
                          const dateB = new Date(`${b.date}T${b.time}`)
                          return dateB.getTime() - dateA.getTime()
                        })
                        .slice(0, 10)
                        .map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell>{new Date(appointment.date).toLocaleDateString()}</TableCell>
                            <TableCell className="font-medium">{appointment.time}</TableCell>
                            <TableCell>{getPetName(appointment.petId)}</TableCell>
                            <TableCell>{getClientName(appointment.clientId)}</TableCell>
                            <TableCell>{getBranchName(appointment.branchId)}</TableCell>
                            <TableCell>{appointment.reason}</TableCell>
                            <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
                {appointments.length > 10 && (
                  <p className="text-sm text-muted-foreground text-center">
                    Mostrando los últimos 10 turnos. Ve a Turnos para ver todos.
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

