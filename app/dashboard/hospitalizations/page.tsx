"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  FaHospital,
  FaPlus,
  FaClock,
  FaStethoscope,
  FaFileMedical,
  FaThermometerHalf,
  FaHeartbeat,
  FaLungs,
  FaWeight,
  FaTimesCircle,
  FaCheckCircle,
  FaEdit,
  FaSignOutAlt,
} from "react-icons/fa"
import { useClinic } from "@/contexts/clinic-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow, format } from "date-fns"
import { es } from "date-fns/locale"
import Image from "next/image"
import type { Hospitalization } from "@/lib/types"

const studyTypeLabels = {
  blood_test: "Análisis de Sangre",
  xray: "Radiografía",
  ultrasound: "Ecografía",
  ecg: "Electrocardiograma",
  biopsy: "Biopsia",
  other: "Otro",
}

export default function HospitalizationsPage() {
  const { hospitalizations, pets, clients, addHospitalization, updateHospitalization, dischargeHospitalization, addStudy, addVitalSigns } = useClinic()
  const { user } = useAuth()
  const { toast } = useToast()
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "discharged">("all")
  const [newDialogOpen, setNewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState<Record<string, boolean>>({})

  const filteredHospitalizations = hospitalizations.filter((h) => {
    if (selectedStatus === "all") return true
    return h.status === selectedStatus
  })

  const activeHospitalizations = hospitalizations.filter((h) => h.status === "active")

  const getPetInfo = (petId: string) => {
    return pets.find((p) => p.id === petId)
  }

  const getClientInfo = (clientId: string) => {
    return clients.find((c) => c.id === clientId)
  }

  const getDaysHospitalized = (admissionDate: string) => {
    const days = Math.floor((Date.now() - new Date(admissionDate).getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Internaciones</h1>
          <p className="text-muted-foreground mt-1">Gestión de animales internados</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <FaPlus className="mr-2" />
                Nueva Internación
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Nueva Internación</DialogTitle>
                <DialogDescription>Completa los datos de la internación</DialogDescription>
              </DialogHeader>
              <HospitalizationForm
                pets={pets}
                clients={clients}
                onSubmit={(data) => {
                  addHospitalization({
                    ...data,
                    id: Date.now().toString(),
                    admissionDate: new Date().toISOString(),
                    status: "active",
                    studies: [],
                    vitalSigns: [],
                  })
                  setNewDialogOpen(false)
                  toast({
                    title: "Internación registrada",
                    description: "La internación se ha registrado correctamente",
                  })
                }}
                onClose={() => setNewDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activas</CardTitle>
            <FaHospital className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeHospitalizations.length}</div>
            <p className="text-xs text-muted-foreground">Animales internados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dadas de Alta</CardTitle>
            <FaCheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hospitalizations.filter((h) => h.status === "discharged").length}
            </div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FaFileMedical className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hospitalizations.length}</div>
            <p className="text-xs text-muted-foreground">Historial completo</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button
              variant={selectedStatus === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus("all")}
            >
              Todas
            </Button>
            <Button
              variant={selectedStatus === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus("active")}
            >
              Activas
            </Button>
            <Button
              variant={selectedStatus === "discharged" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus("discharged")}
            >
              Dadas de Alta
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredHospitalizations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FaHospital className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No hay internaciones registradas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHospitalizations.map((hospitalization) => {
                const pet = getPetInfo(hospitalization.petId)
                const client = getClientInfo(hospitalization.clientId)
                const daysHospitalized = getDaysHospitalized(hospitalization.admissionDate)

                return (
                  <Card key={hospitalization.id} className="overflow-hidden">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          {pet?.photo && (
                            <Avatar className="w-16 h-16">
                              <AvatarImage src={pet.photo} alt={pet.name} />
                              <AvatarFallback>{pet.name[0]}</AvatarFallback>
                            </Avatar>
                          )}
                          <div>
                            <CardTitle className="text-xl">{pet?.name || "Mascota desconocida"}</CardTitle>
                            <CardDescription>
                              {pet?.species} {pet?.breed} - Propietario: {client?.name || "Desconocido"}
                            </CardDescription>
                            {hospitalization.room && (
                              <Badge variant="outline" className="mt-1">
                                {hospitalization.room}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={hospitalization.status === "active" ? "default" : "secondary"}
                            className="flex items-center gap-1"
                          >
                            {hospitalization.status === "active" ? (
                              <>
                                <FaClock className="w-3 h-3" />
                                Activa
                              </>
                            ) : (
                              <>
                                <FaCheckCircle className="w-3 h-3" />
                                Dada de Alta
                              </>
                            )}
                          </Badge>
                          {hospitalization.status === "active" && (
                            <div className="flex gap-2">
                              <Dialog open={editDialogOpen[hospitalization.id] || false} onOpenChange={(open) => setEditDialogOpen((prev) => ({ ...prev, [hospitalization.id]: open }))}>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <FaEdit className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Editar Internación</DialogTitle>
                                    <DialogDescription>Actualiza los datos de la internación</DialogDescription>
                                  </DialogHeader>
                                  <HospitalizationForm
                                    pets={pets}
                                    clients={clients}
                                    hospitalization={hospitalization}
                                    onSubmit={(data) => {
                                      updateHospitalization(hospitalization.id, data)
                                      setEditDialogOpen((prev) => ({ ...prev, [hospitalization.id]: false }))
                                      toast({
                                        title: "Internación actualizada",
                                        description: "Los datos se han actualizado correctamente",
                                      })
                                    }}
                                    onClose={() => setEditDialogOpen((prev) => ({ ...prev, [hospitalization.id]: false }))}
                                  />
                                </DialogContent>
                              </Dialog>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <FaSignOutAlt className="w-4 h-4 mr-1" />
                                    Dar de Alta
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Dar de alta esta internación?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción marcará la internación como finalizada. La mascota será dada de alta.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => {
                                        dischargeHospitalization(hospitalization.id, new Date().toISOString())
                                        toast({
                                          title: "Alta médica registrada",
                                          description: "La internación ha sido finalizada",
                                        })
                                      }}
                                    >
                                      Confirmar Alta
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="info" className="w-full">
                        <TabsList>
                          <TabsTrigger value="info">Información</TabsTrigger>
                          <TabsTrigger value="treatment">Tratamiento</TabsTrigger>
                          <TabsTrigger value="studies">Estudios</TabsTrigger>
                          <TabsTrigger value="vitals">Signos Vitales</TabsTrigger>
                        </TabsList>

                        <TabsContent value="info" className="space-y-4 mt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Fecha de Ingreso</p>
                              <p className="font-medium">
                                {format(new Date(hospitalization.admissionDate), "dd/MM/yyyy HH:mm", { locale: es })}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(hospitalization.admissionDate), {
                                  addSuffix: true,
                                  locale: es,
                                })}
                              </p>
                            </div>
                            {hospitalization.dischargeDate && (
                              <div>
                                <p className="text-sm text-muted-foreground">Fecha de Alta</p>
                                <p className="font-medium">
                                  {format(new Date(hospitalization.dischargeDate), "dd/MM/yyyy HH:mm", { locale: es })}
                                </p>
                              </div>
                            )}
                            {hospitalization.status === "active" && (
                              <div>
                                <p className="text-sm text-muted-foreground">Días Internado</p>
                                <p className="font-medium text-lg text-primary">{daysHospitalized} días</p>
                              </div>
                            )}
                            <div>
                              <p className="text-sm text-muted-foreground">Motivo de Ingreso</p>
                              <p className="font-medium">{hospitalization.reason}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Diagnóstico</p>
                              <p className="font-medium">{hospitalization.diagnosis}</p>
                            </div>
                            {hospitalization.notes && (
                              <div className="col-span-2">
                                <p className="text-sm text-muted-foreground">Notas</p>
                                <p className="font-medium">{hospitalization.notes}</p>
                              </div>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="treatment" className="mt-4">
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Tratamiento Actual</p>
                            <div className="bg-muted rounded-lg p-4">
                              <p className="whitespace-pre-wrap">{hospitalization.treatment}</p>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="studies" className="mt-4">
                          <div className="space-y-4">
                            <div className="flex justify-end">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm">
                                    <FaPlus className="mr-2" />
                                    Agregar Estudio
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Agregar Estudio</DialogTitle>
                                    <DialogDescription>Registrar un nuevo estudio para esta internación</DialogDescription>
                                  </DialogHeader>
                                  <StudyForm
                                    hospitalizationId={hospitalization.id}
                                    onSubmit={(study) => {
                                      addStudy(hospitalization.id, study)
                                      toast({
                                        title: "Estudio agregado",
                                        description: "El estudio se ha registrado correctamente",
                                      })
                                    }}
                                  />
                                </DialogContent>
                              </Dialog>
                            </div>
                            {hospitalization.studies.length === 0 ? (
                              <p className="text-muted-foreground text-center py-8">No hay estudios registrados</p>
                            ) : (
                              hospitalization.studies.map((study) => (
                                <Card key={study.id}>
                                  <CardHeader>
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <CardTitle className="text-lg">{study.name}</CardTitle>
                                        <CardDescription>
                                          {studyTypeLabels[study.type]} - Realizado por {study.performedBy}
                                        </CardDescription>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {format(new Date(study.date), "dd/MM/yyyy HH:mm", { locale: es })}
                                        </p>
                                      </div>
                                      <Badge variant="outline">{studyTypeLabels[study.type]}</Badge>
                                    </div>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-2">
                                      <p className="text-sm font-medium">Resultados:</p>
                                      <div className="bg-muted rounded-lg p-4">
                                        <p className="whitespace-pre-wrap text-sm">{study.results}</p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="vitals" className="mt-4">
                          <div className="space-y-4">
                            <div className="flex justify-end">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm">
                                    <FaPlus className="mr-2" />
                                    Registrar Signos Vitales
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Registrar Signos Vitales</DialogTitle>
                                    <DialogDescription>Agregar nuevo registro de signos vitales</DialogDescription>
                                  </DialogHeader>
                                  <VitalSignsForm
                                    hospitalizationId={hospitalization.id}
                                    onSubmit={(vitals) => {
                                      addVitalSigns(hospitalization.id, vitals)
                                      toast({
                                        title: "Signos vitales registrados",
                                        description: "Los signos vitales se han registrado correctamente",
                                      })
                                    }}
                                  />
                                </DialogContent>
                              </Dialog>
                            </div>
                            {!hospitalization.vitalSigns || hospitalization.vitalSigns.length === 0 ? (
                              <p className="text-muted-foreground text-center py-8">No hay registros de signos vitales</p>
                            ) : (
                              <div className="rounded-md border">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Fecha/Hora</TableHead>
                                      <TableHead>
                                        <FaThermometerHalf className="inline mr-1" />
                                        Temp (°C)
                                      </TableHead>
                                      <TableHead>
                                        <FaHeartbeat className="inline mr-1" />
                                        FC (bpm)
                                      </TableHead>
                                      <TableHead>
                                        <FaLungs className="inline mr-1" />
                                        FR (rpm)
                                      </TableHead>
                                      <TableHead>
                                        <FaWeight className="inline mr-1" />
                                        Peso (kg)
                                      </TableHead>
                                      <TableHead>Notas</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {hospitalization.vitalSigns.map((vital, index) => (
                                      <TableRow key={index}>
                                        <TableCell>
                                          {format(new Date(vital.date), "dd/MM/yyyy HH:mm", { locale: es })}
                                        </TableCell>
                                        <TableCell>{vital.temperature?.toFixed(1) || "-"}</TableCell>
                                        <TableCell>{vital.heartRate || "-"}</TableCell>
                                        <TableCell>{vital.respiratoryRate || "-"}</TableCell>
                                        <TableCell>{vital.weight?.toFixed(2) || "-"}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                          {vital.notes || "-"}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function HospitalizationForm({
  pets,
  clients,
  hospitalization,
  onSubmit,
  onClose,
}: {
  pets: any[]
  clients: any[]
  hospitalization?: Hospitalization
  onSubmit: (data: Omit<Hospitalization, "id" | "admissionDate" | "status" | "studies" | "vitalSigns">) => void
  onClose?: () => void
}) {
  const { user } = useAuth()
  const [selectedPetId, setSelectedPetId] = useState(hospitalization?.petId || "")

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const selectedPet = pets.find((p) => p.id === selectedPetId)
    const clientId = selectedPet?.clientId || ""

    const data: Omit<Hospitalization, "id" | "admissionDate" | "status" | "studies" | "vitalSigns"> = {
      petId: selectedPetId,
      clientId: clientId,
      reason: formData.get("reason") as string,
      diagnosis: formData.get("diagnosis") as string,
      treatment: formData.get("treatment") as string,
      veterinarianId: user?.id || "2",
      room: formData.get("room") as string || undefined,
      notes: formData.get("notes") as string || undefined,
      dischargeDate: hospitalization?.dischargeDate,
    }

    onSubmit(data)
    if (onClose) onClose()
  }

  const filteredPets = pets.filter((pet) => {
    if (!hospitalization) return true
    return pet.clientId === hospitalization.clientId
  })

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="petId">Mascota *</Label>
          <Select value={selectedPetId} onValueChange={setSelectedPetId} required>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar mascota" />
            </SelectTrigger>
            <SelectContent>
              {filteredPets.map((pet) => (
                <SelectItem key={pet.id} value={pet.id}>
                  {pet.name} - {pet.species} ({clients.find((c) => c.id === pet.clientId)?.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="room">Sala</Label>
          <Input
            id="room"
            name="room"
            placeholder="Sala 1, Sala 2, etc."
            defaultValue={hospitalization?.room}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Motivo de Ingreso *</Label>
        <Input
          id="reason"
          name="reason"
          required
          placeholder="Ej: Cirugía, tratamiento, observación..."
          defaultValue={hospitalization?.reason}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="diagnosis">Diagnóstico *</Label>
        <Textarea
          id="diagnosis"
          name="diagnosis"
          required
          placeholder="Diagnóstico del veterinario..."
          rows={3}
          defaultValue={hospitalization?.diagnosis}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="treatment">Tratamiento *</Label>
        <Textarea
          id="treatment"
          name="treatment"
          required
          placeholder="Describe el tratamiento a seguir..."
          rows={5}
          defaultValue={hospitalization?.treatment}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas Adicionales</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Observaciones, recomendaciones, etc."
          rows={3}
          defaultValue={hospitalization?.notes}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">{hospitalization ? "Actualizar" : "Registrar Internación"}</Button>
      </div>
    </form>
  )
}

function StudyForm({
  hospitalizationId,
  onSubmit,
}: {
  hospitalizationId: string
  onSubmit: (study: Omit<Hospitalization["studies"][0], "id">) => void
}) {
  const { user } = useAuth()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const study: Omit<Hospitalization["studies"][0], "id"> = {
      hospitalizationId,
      type: formData.get("type") as Hospitalization["studies"][0]["type"],
      name: formData.get("name") as string,
      date: new Date().toISOString(),
      results: formData.get("results") as string,
      performedBy: user?.name || "Veterinario",
    }

    onSubmit(study)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Tipo de Estudio *</Label>
          <Select name="type" required>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="blood_test">Análisis de Sangre</SelectItem>
              <SelectItem value="xray">Radiografía</SelectItem>
              <SelectItem value="ultrasound">Ecografía</SelectItem>
              <SelectItem value="ecg">Electrocardiograma</SelectItem>
              <SelectItem value="biopsy">Biopsia</SelectItem>
              <SelectItem value="other">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Nombre del Estudio *</Label>
          <Input id="name" name="name" required placeholder="Ej: Hemograma completo" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="results">Resultados *</Label>
        <Textarea
          id="results"
          name="results"
          required
          placeholder="Describe los resultados del estudio..."
          rows={5}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit">Registrar Estudio</Button>
      </div>
    </form>
  )
}

function VitalSignsForm({
  hospitalizationId,
  onSubmit,
}: {
  hospitalizationId: string
  onSubmit: (vitals: Hospitalization["vitalSigns"][0]) => void
}) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const vitals: Hospitalization["vitalSigns"][0] = {
      date: new Date().toISOString(),
      temperature: formData.get("temperature") ? Number.parseFloat(formData.get("temperature") as string) : undefined,
      heartRate: formData.get("heartRate") ? Number.parseInt(formData.get("heartRate") as string) : undefined,
      respiratoryRate: formData.get("respiratoryRate")
        ? Number.parseInt(formData.get("respiratoryRate") as string)
        : undefined,
      weight: formData.get("weight") ? Number.parseFloat(formData.get("weight") as string) : undefined,
      notes: formData.get("notes") as string || undefined,
    }

    onSubmit(vitals)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="temperature">Temperatura (°C)</Label>
          <Input
            id="temperature"
            name="temperature"
            type="number"
            step="0.1"
            placeholder="38.5"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="heartRate">Frecuencia Cardíaca (bpm)</Label>
          <Input
            id="heartRate"
            name="heartRate"
            type="number"
            placeholder="90"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="respiratoryRate">Frecuencia Respiratoria (rpm)</Label>
          <Input
            id="respiratoryRate"
            name="respiratoryRate"
            type="number"
            placeholder="20"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight">Peso (kg)</Label>
          <Input
            id="weight"
            name="weight"
            type="number"
            step="0.1"
            placeholder="30.5"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Observaciones sobre los signos vitales..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit">Registrar Signos Vitales</Button>
      </div>
    </form>
  )
}

