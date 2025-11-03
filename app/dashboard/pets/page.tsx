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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { FaPlus, FaEdit, FaTrash, FaSearch, FaDog, FaCat, FaFileAlt } from "react-icons/fa"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useClinic } from "@/contexts/clinic-context"

export default function PetsPage() {
  const { pets, clients, medicalRecords, addPet, addMedicalRecord } = useClinic()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPet, setSelectedPet] = useState<string | null>(null)

  const filteredPets = pets.filter(
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mascotas</h1>
          <p className="text-muted-foreground mt-1">Gestión de mascotas y sus historiales clínicos</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <FaPlus className="mr-2" />
                Nueva Mascota
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Registrar Nueva Mascota</DialogTitle>
                <DialogDescription>Completa los datos de la mascota</DialogDescription>
              </DialogHeader>
              <PetForm clients={clients} onSubmit={addPet} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Mascotas</CardTitle>
          <CardDescription>Total de {pets.length} mascotas registradas</CardDescription>
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

          <div className="rounded-md border">
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
                              />
                            </DialogContent>
                          </Dialog>
                          <Button variant="ghost" size="sm">
                            <FaEdit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <FaTrash className="w-4 h-4 text-destructive" />
                          </Button>
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
}: { pet: any; records: any[]; onAddRecord: (record: any) => void }) {
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
              {pet.notes && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Notas</p>
                  <p className="font-medium">{pet.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="history" className="space-y-4">
        <div className="flex justify-end">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <FaPlus className="mr-2" />
                Nueva Consulta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Registrar Consulta</DialogTitle>
                <DialogDescription>Añadir nueva entrada al historial clínico</DialogDescription>
              </DialogHeader>
              <MedicalRecordForm petId={pet.id} onSubmit={onAddRecord} />
            </DialogContent>
          </Dialog>
        </div>

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

function MedicalRecordForm({ petId, onSubmit }: { petId: string; onSubmit: (record: any) => void }) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const record = {
      id: Date.now().toString(),
      petId,
      date: formData.get("date") as string,
      veterinarianId: "2",
      reason: formData.get("reason") as string,
      diagnosis: formData.get("diagnosis") as string,
      treatment: formData.get("treatment") as string,
      observations: formData.get("observations") as string,
      nextVisit: formData.get("nextVisit") as string,
    }
    onSubmit(record)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Fecha *</Label>
          <Input id="date" name="date" type="date" required defaultValue={new Date().toISOString().split("T")[0]} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reason">Motivo de Consulta *</Label>
          <Input id="reason" name="reason" required placeholder="Vacunación, revisión..." />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="diagnosis">Diagnóstico *</Label>
        <Textarea id="diagnosis" name="diagnosis" required placeholder="Diagnóstico del veterinario..." rows={3} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="treatment">Tratamiento *</Label>
        <Textarea id="treatment" name="treatment" required placeholder="Tratamiento prescrito..." rows={3} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="observations">Observaciones *</Label>
        <Textarea id="observations" name="observations" required placeholder="Observaciones adicionales..." rows={3} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nextVisit">Próxima Visita</Label>
        <Input id="nextVisit" name="nextVisit" type="date" />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline">
          Cancelar
        </Button>
        <Button type="submit">Guardar Consulta</Button>
      </div>
    </form>
  )
}
