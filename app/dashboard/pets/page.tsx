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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { FaPlus, FaEdit, FaTrash, FaSearch, FaDog, FaCat, FaFileAlt, FaExclamationTriangle, FaUserTimes } from "react-icons/fa"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useClinic } from "@/contexts/clinic-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function PetsPage() {
  const { pets, clients, medicalRecords, inventory, addPet, addMedicalRecord, updatePet } = useClinic()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPet, setSelectedPet] = useState<string | null>(null)
  const [statusDialogOpen, setStatusDialogOpen] = useState<Record<string, boolean>>({})
  const [newServiceDialogOpen, setNewServiceDialogOpen] = useState(false)
  const [selectedPetForService, setSelectedPetForService] = useState<string | null>(null)

  // Si es cliente, filtrar solo sus mascotas
  const clientPets = user?.role === "cliente" 
    ? pets.filter((pet) => {
        const client = clients.find((c) => c.id === pet.clientId)
        return client && (client.email === user.email || client.name === user.name)
      })
    : pets

  const filteredPets = clientPets.filter(
    (pet) =>
      pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getClientName = (clientId: string) => {
    return clients.find((c) => c.id === clientId)?.name || "Desconocido"
  }

  const getPetRecords = (petId: string) => {
    return medicalRecords.filter((r) => r.petId === petId)
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {user?.role === "cliente" ? "Mis Mascotas" : "Mascotas"}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            {user?.role === "cliente" 
              ? "Gestiona tus mascotas y sus historiales clínicos"
              : "Gestión de mascotas y sus historiales clínicos"}
          </p>
        </div>
        {user?.role !== "cliente" && (
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full sm:w-auto">
                  <FaPlus className="mr-2" />
                  Nueva Mascota
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Registrar Nueva Mascota</DialogTitle>
                  <DialogDescription>Completa los datos de la mascota</DialogDescription>
                </DialogHeader>
                <PetForm clients={clients} onSubmit={addPet} />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Mascotas</CardTitle>
          <CardDescription>
            {user?.role === "cliente" 
              ? `Tus mascotas (${clientPets.length})`
              : `Total de ${pets.length} mascotas registradas`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, especie o raza..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Foto</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Especie</TableHead>
                  <TableHead>Raza</TableHead>
                  <TableHead>Propietario</TableHead>
                  <TableHead>Edad</TableHead>
                  <TableHead>Peso</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPets.map((pet) => {
                  const age = new Date().getFullYear() - new Date(pet.birthDate).getFullYear()
                  return (
                    <TableRow key={pet.id}>
                      <TableCell>
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={pet.photo} alt={pet.name} />
                          <AvatarFallback>
                            {pet.species.toLowerCase() === "perro" ? (
                              <FaDog className="text-primary" />
                            ) : pet.species.toLowerCase() === "gato" ? (
                              <FaCat className="text-accent" />
                            ) : (
                              <FaDog className="text-primary" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium flex items-center gap-2">
                        {pet.species.toLowerCase() === "perro" ? (
                          <FaDog className="text-primary" />
                        ) : pet.species.toLowerCase() === "gato" ? (
                          <FaCat className="text-accent" />
                        ) : null}
                        {pet.name}
                      </TableCell>
                      <TableCell>{pet.species}</TableCell>
                      <TableCell>{pet.breed}</TableCell>
                      <TableCell>{getClientName(pet.clientId)}</TableCell>
                      <TableCell>{age} años</TableCell>
                      <TableCell>{pet.weight} kg</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {user?.role !== "cliente" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPetForService(pet.id)
                                setNewServiceDialogOpen(true)
                              }}
                            >
                              <FaPlus className="w-4 h-4 mr-1" />
                              Nueva Consulta
                            </Button>
                          )}
                          {user?.role !== "cliente" && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedPet(pet.id)}>
                                  <FaFileAlt className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Historial Clínico - {pet.name}</DialogTitle>
                                  <DialogDescription>
                                    {pet.species} {pet.breed} - Propietario: {getClientName(pet.clientId)}
                                  </DialogDescription>
                                </DialogHeader>
                                <MedicalHistory
                                  pet={pet}
                                  records={getPetRecords(pet.id)}
                                  onAddRecord={addMedicalRecord}
                                  onUpdatePet={updatePet}
                                  clients={clients}
                                  inventory={inventory}
                                />
                              </DialogContent>
                            </Dialog>
                          )}
                          {user?.role !== "cliente" && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <FaExclamationTriangle className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <Dialog open={statusDialogOpen[pet.id] || false} onOpenChange={(open) => setStatusDialogOpen((prev) => ({ ...prev, [pet.id]: open }))}>
                                  <DialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                      <FaExclamationTriangle className="mr-2 h-4 w-4" />
                                      Informar Fallecimiento
                                    </DropdownMenuItem>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Informar Fallecimiento</DialogTitle>
                                      <DialogDescription>Registrar el fallecimiento de {pet.name}</DialogDescription>
                                    </DialogHeader>
                                    <PetStatusForm
                                      pet={pet}
                                      statusType="deceased"
                                      onSubmit={(data) => {
                                        updatePet(pet.id, data)
                                        setStatusDialogOpen((prev) => ({ ...prev, [pet.id]: false }))
                                      }}
                                    />
                                  </DialogContent>
                                </Dialog>
                                <Dialog open={statusDialogOpen[`${pet.id}_transfer`] || false} onOpenChange={(open) => setStatusDialogOpen((prev) => ({ ...prev, [`${pet.id}_transfer`]: open }))}>
                                  <DialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                      <FaUserTimes className="mr-2 h-4 w-4" />
                                      Cambio de Dueño
                                    </DropdownMenuItem>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Cambio de Dueño</DialogTitle>
                                      <DialogDescription>Registrar cambio de propietario para {pet.name}</DialogDescription>
                                    </DialogHeader>
                                    <PetStatusForm
                                      pet={pet}
                                      statusType="transferred"
                                      clients={clients}
                                      onSubmit={(data) => {
                                        updatePet(pet.id, data)
                                        setStatusDialogOpen((prev) => ({ ...prev, [`${pet.id}_transfer`]: false }))
                                      }}
                                    />
                                  </DialogContent>
                                </Dialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Nueva Consulta o Servicio */}
      <Dialog open={newServiceDialogOpen} onOpenChange={setNewServiceDialogOpen}>
        <DialogContent className="!max-w-[95vw] !w-[95vw] !sm:max-w-[95vw] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Consulta o Servicio</DialogTitle>
            <DialogDescription>
              {selectedPetForService
                ? `Mascota: ${pets.find((p) => p.id === selectedPetForService)?.name || "Desconocida"}`
                : "Añadir nueva entrada al historial clínico"}
            </DialogDescription>
          </DialogHeader>
          {selectedPetForService && (
            <MedicalRecordForm
              petId={selectedPetForService}
              inventory={inventory}
              onSubmit={(record) => {
                addMedicalRecord(record)
                setNewServiceDialogOpen(false)
                setSelectedPetForService(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PetForm({ clients, onSubmit }: { clients: any[]; onSubmit: (pet: any) => void }) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const pet = {
      id: Date.now().toString(),
      name: formData.get("name") as string,
      species: formData.get("species") as string,
      breed: formData.get("breed") as string,
      birthDate: formData.get("birthDate") as string,
      weight: Number.parseFloat(formData.get("weight") as string),
      color: formData.get("color") as string,
      clientId: formData.get("clientId") as string,
      microchipNumber: formData.get("microchipNumber") as string,
      notes: formData.get("notes") as string,
      photo: formData.get("photo") as string || undefined,
    }
    onSubmit(pet)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre *</Label>
          <Input id="name" name="name" required placeholder="Max" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="clientId">Propietario *</Label>
          <Select name="clientId" required>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar propietario" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

        <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="species">Especie *</Label>
          <Select name="species" required>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Perro">Perro</SelectItem>
              <SelectItem value="Gato">Gato</SelectItem>
              <SelectItem value="Tortuga">Tortuga</SelectItem>
              <SelectItem value="Hamster">Hamster</SelectItem>
              <SelectItem value="Ave">Ave</SelectItem>
              <SelectItem value="Conejo">Conejo</SelectItem>
              <SelectItem value="Otro">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="breed">Raza *</Label>
          <Input id="breed" name="breed" required placeholder="Golden Retriever" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="color">Color *</Label>
          <Input id="color" name="color" required placeholder="Dorado" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="birthDate">Fecha de Nacimiento *</Label>
          <Input id="birthDate" name="birthDate" type="date" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight">Peso (kg) *</Label>
          <Input id="weight" name="weight" type="number" step="0.1" required placeholder="25.5" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="microchipNumber">Microchip</Label>
          <Input id="microchipNumber" name="microchipNumber" placeholder="123456789012345" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea id="notes" name="notes" placeholder="Información adicional..." rows={3} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="photo">URL de la Foto</Label>
        <Input id="photo" name="photo" type="url" placeholder="https://ejemplo.com/foto.jpg" />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline">
          Cancelar
        </Button>
        <Button type="submit">Registrar Mascota</Button>
      </div>
    </form>
  )
}

function MedicalHistory({
  pet,
  records,
  onAddRecord,
  onUpdatePet,
  clients,
  inventory,
}: {
  pet: any
  records: any[]
  onAddRecord: (record: any) => void
  onUpdatePet: (id: string, data: any) => void
  clients: any[]
  inventory: any[]
}) {
  const { toast } = useToast()
  return (
    <Tabs defaultValue="info" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="info">Información</TabsTrigger>
        <TabsTrigger value="history">Historial Clínico</TabsTrigger>
      </TabsList>

      <TabsContent value="info" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Datos de la Mascota</CardTitle>
          </CardHeader>
          <CardContent>
            {pet.photo && (
              <div className="mb-6 flex justify-center">
                <div className="relative w-48 h-48 rounded-lg overflow-hidden border">
                  <Image
                    src={pet.photo}
                    alt={pet.name}
                    fill
                    className="object-cover"
                    sizes="192px"
                  />
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Especie</p>
                <p className="font-medium">{pet.species}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Raza</p>
                <p className="font-medium">{pet.breed}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Nacimiento</p>
                <p className="font-medium">{new Date(pet.birthDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Peso</p>
                <p className="font-medium">{pet.weight} kg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Color</p>
                <p className="font-medium">{pet.color}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Microchip</p>
                <p className="font-medium">{pet.microchipNumber || "No registrado"}</p>
              </div>
              {pet.status && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <Badge variant={pet.status === "deceased" ? "destructive" : "secondary"}>
                    {pet.status === "deceased" ? "Fallecida" : pet.status === "transferred" ? "Cambio de Dueño" : pet.status}
                  </Badge>
                  {pet.statusDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Fecha: {new Date(pet.statusDate).toLocaleDateString()}
                    </p>
                  )}
                  {pet.statusNotes && (
                    <p className="text-sm mt-2">{pet.statusNotes}</p>
                  )}
                </div>
              )}
              {pet.notes && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Notas</p>
                  <p className="font-medium">{pet.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sección de Estado de la Mascota */}
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive">Estado de la Mascota</CardTitle>
            <CardDescription>Informar cambios importantes en el estado de la mascota</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="w-full sm:w-auto">
                    <FaExclamationTriangle className="mr-2" />
                    Informar Fallecimiento
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Informar Fallecimiento</DialogTitle>
                    <DialogDescription>Registrar el fallecimiento de {pet.name}</DialogDescription>
                  </DialogHeader>
                  <PetStatusForm
                    pet={pet}
                    statusType="deceased"
                    onSubmit={(data) => {
                      onUpdatePet(pet.id, data)
                      toast({
                        title: "Fallecimiento registrado",
                        description: `Se ha registrado el fallecimiento de ${pet.name}`,
                      })
                    }}
                  />
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <FaUserTimes className="mr-2" />
                    Cambio de Dueño
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cambio de Dueño</DialogTitle>
                    <DialogDescription>Registrar cambio de propietario para {pet.name}</DialogDescription>
                  </DialogHeader>
                  <PetStatusForm
                    pet={pet}
                    statusType="transferred"
                    clients={clients}
                    onSubmit={(data) => {
                      onUpdatePet(pet.id, data)
                      toast({
                        title: "Cambio de dueño registrado",
                        description: `Se ha registrado el cambio de propietario para ${pet.name}`,
                      })
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="history" className="space-y-4">

        <div className="space-y-4">
          {records.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No hay registros médicos para esta mascota
              </CardContent>
            </Card>
          ) : (
            records.map((record) => (
              <Card key={record.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{record.reason}</CardTitle>
                      <CardDescription>{new Date(record.date).toLocaleDateString()}</CardDescription>
                    </div>
                    <Badge>Consulta</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Diagnóstico</p>
                    <p className="text-sm">{record.diagnosis}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tratamiento</p>
                    <p className="text-sm">{record.treatment}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Observaciones</p>
                    <p className="text-sm">{record.observations}</p>
                  </div>
                  {record.nextVisit && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Próxima Visita</p>
                      <p className="text-sm">{new Date(record.nextVisit).toLocaleDateString()}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}

function MedicalRecordForm({
  petId,
  inventory,
  onSubmit,
}: {
  petId: string
  inventory: any[]
  onSubmit: (record: any) => void
}) {
  const { toast } = useToast()
  const [serviceType, setServiceType] = useState<string>("consulta")
  const [selectedItems, setSelectedItems] = useState<Array<{ id: string; quantity: number }>>([])
  const [currentItemId, setCurrentItemId] = useState<string>("")
  const [currentQuantity, setCurrentQuantity] = useState<number>(1)

  const handleAddItem = () => {
    if (currentItemId && currentQuantity > 0) {
      const existingIndex = selectedItems.findIndex((item) => item.id === currentItemId)
      if (existingIndex >= 0) {
        const updated = [...selectedItems]
        updated[existingIndex].quantity += currentQuantity
        setSelectedItems(updated)
      } else {
        setSelectedItems([...selectedItems, { id: currentItemId, quantity: currentQuantity }])
      }
      setCurrentItemId("")
      setCurrentQuantity(1)
    }
  }

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(selectedItems.filter((item) => item.id !== itemId))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const record = {
      id: Date.now().toString(),
      petId,
      date: formData.get("date") as string,
      veterinarianId: "2",
      serviceType: serviceType,
      reason: formData.get("reason") as string,
      diagnosis: formData.get("diagnosis") as string,
      treatment: formData.get("treatment") as string,
      observations: formData.get("observations") as string,
      nextVisit: formData.get("nextVisit") as string,
      itemsUsed: selectedItems,
    }
    onSubmit(record)
    toast({
      title: `${serviceType === "consulta" ? "Consulta" : "Estudio"} guardado`,
      description: `La ${serviceType === "consulta" ? "consulta" : "estudio"} se ha registrado correctamente`,
    })
  }

  const availableItems = inventory.filter((item) => item.quantity > 0)
  const getItemName = (itemId: string) => {
    return inventory.find((item) => item.id === itemId)?.name || "Desconocido"
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Fecha *</Label>
          <Input id="date" name="date" type="date" required defaultValue={new Date().toISOString().split("T")[0]} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="serviceType">Tipo de Servicio *</Label>
          <Select value={serviceType} onValueChange={setServiceType} required>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="consulta">Consulta</SelectItem>
              <SelectItem value="estudio">Estudio</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="reason">Motivo de Consulta *</Label>
          <Input id="reason" name="reason" required placeholder="Vacunación, revisión..." />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="diagnosis">Diagnóstico *</Label>
          <Textarea id="diagnosis" name="diagnosis" required placeholder="Diagnóstico del veterinario..." rows={4} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="treatment">Tratamiento *</Label>
          <Textarea id="treatment" name="treatment" required placeholder="Tratamiento prescrito..." rows={4} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="observations">Observaciones *</Label>
          <Textarea id="observations" name="observations" required placeholder="Observaciones adicionales..." rows={3} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nextVisit">Próxima Visita</Label>
          <Input id="nextVisit" name="nextVisit" type="date" />
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <div className="space-y-2">
          <Label>Insumos y Artículos Utilizados</Label>
          <div className="grid grid-cols-4 gap-2">
            <Select value={currentItemId} onValueChange={setCurrentItemId}>
              <SelectTrigger className="col-span-2">
                <SelectValue placeholder="Seleccionar insumo o artículo" />
              </SelectTrigger>
              <SelectContent>
                {availableItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} (Stock: {item.quantity})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              min="1"
              value={currentQuantity}
              onChange={(e) => setCurrentQuantity(Number.parseInt(e.target.value) || 1)}
              placeholder="Cantidad"
            />
            <Button type="button" onClick={handleAddItem} disabled={!currentItemId || currentQuantity <= 0}>
              Agregar
            </Button>
          </div>
        </div>

        {selectedItems.length > 0 && (
          <div className="space-y-2">
            <Label>Items Seleccionados</Label>
            <div className="border rounded-lg p-3 space-y-2 max-h-32 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                {selectedItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">
                      {getItemName(item.id)} x {item.quantity}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                      className="h-6 w-6 p-0"
                    >
                      <FaTrash className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline">
          Cancelar
        </Button>
        <Button type="submit">Guardar {serviceType === "consulta" ? "Consulta" : "Estudio"}</Button>
      </div>
    </form>
  )
}

function PetStatusForm({
  pet,
  statusType,
  clients,
  onSubmit,
}: {
  pet: any
  statusType: "deceased" | "transferred"
  clients?: any[]
  onSubmit: (data: any) => void
}) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data: any = {
      status: statusType,
      statusDate: formData.get("statusDate") as string,
      statusNotes: formData.get("statusNotes") as string,
    }
    if (statusType === "transferred" && formData.get("newClientId")) {
      data.clientId = formData.get("newClientId") as string
    }
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {statusType === "transferred" && clients && (
        <div className="space-y-2">
          <Label htmlFor="newClientId">Nuevo Propietario *</Label>
          <Select name="newClientId" required>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar nuevo propietario" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="statusDate">
          {statusType === "deceased" ? "Fecha de Fallecimiento" : "Fecha de Cambio"} *
        </Label>
        <Input
          id="statusDate"
          name="statusDate"
          type="date"
          required
          defaultValue={new Date().toISOString().split("T")[0]}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="statusNotes">Notas</Label>
        <Textarea
          id="statusNotes"
          name="statusNotes"
          placeholder={statusType === "deceased" ? "Causa del fallecimiento, observaciones..." : "Motivo del cambio de dueño..."}
          rows={4}
        />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit">
          {statusType === "deceased" ? "Registrar Fallecimiento" : "Registrar Cambio"}
        </Button>
      </div>
    </form>
  )
}
