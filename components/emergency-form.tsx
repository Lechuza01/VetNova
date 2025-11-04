"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

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

export function EmergencyForm({
  pets,
  clients,
  onSubmit,
}: {
  pets: any[]
  clients: any[]
  onSubmit: (data: Omit<Emergency, "id" | "reportedBy" | "reportedAt">) => void
}) {
  const [selectedClientId, setSelectedClientId] = useState("")
  const filteredPets = pets.filter((pet) => !selectedClientId || pet.clientId === selectedClientId)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data: Omit<Emergency, "id" | "reportedBy" | "reportedAt"> = {
      petId: formData.get("petId") as string,
      clientId: formData.get("clientId") as string,
      priority: formData.get("priority") as Emergency["priority"],
      description: formData.get("description") as string,
      symptoms: formData.get("symptoms") as string,
      status: "pending",
      notes: formData.get("notes") as string || undefined,
    }
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="clientId">Cliente *</Label>
          <Select name="clientId" required onValueChange={setSelectedClientId}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar cliente" />
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
        <div className="space-y-2">
          <Label htmlFor="petId">Mascota *</Label>
          <Select name="petId" required disabled={!selectedClientId}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar mascota" />
            </SelectTrigger>
            <SelectContent>
              {filteredPets.map((pet) => (
                <SelectItem key={pet.id} value={pet.id}>
                  {pet.name} - {pet.species}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">Prioridad *</Label>
        <Select name="priority" required>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Baja</SelectItem>
            <SelectItem value="medium">Media</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
            <SelectItem value="critical">Crítica</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción de la Emergencia *</Label>
        <Input
          id="description"
          name="description"
          required
          placeholder="Ej: Accidente de tráfico, dificultad respiratoria..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="symptoms">Síntomas Observados *</Label>
        <Textarea
          id="symptoms"
          name="symptoms"
          required
          placeholder="Describe los síntomas que presenta la mascota..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas Adicionales</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Información adicional sobre la emergencia..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit">Registrar Emergencia</Button>
      </div>
    </form>
  )
}

