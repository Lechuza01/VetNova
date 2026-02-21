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
import { Textarea } from "@/components/ui/textarea"
import { FaPlus, FaEdit, FaTrash, FaSearch, FaEye } from "react-icons/fa"
import { useClients } from "@/lib/hooks/use-api"
import { useToast } from "@/hooks/use-toast"

export default function ClientsPage() {
  const { data: clients = [], loading, error, mutate } = useClients()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")

  const addClient = async (clientData: any) => {
    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: clientData.firstName || clientData.name?.split(" ")[0] || "",
          lastName: clientData.lastName || clientData.name?.split(" ").slice(1).join(" ") || "",
          email: clientData.email,
          phone: clientData.phone,
          address: clientData.address,
          city: clientData.city,
          postalCode: clientData.postalCode,
          dniCuit: clientData.dniCuit || `DNI-${Date.now()}`,
          notes: clientData.notes,
        }),
      })
      
      if (response.ok) {
        toast({
          title: "Cliente creado",
          description: "El cliente se ha registrado correctamente",
        })
        mutate() // Refresh the list
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "No se pudo crear el cliente",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo conectar con el servidor",
        variant: "destructive",
      })
    }
  }

  const deleteClient = async (id: string) => {
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: "DELETE",
      })
      
      if (response.ok) {
        toast({
          title: "Cliente eliminado",
          description: "El cliente se ha eliminado correctamente",
        })
        mutate() // Refresh the list
      } else {
        toast({
          title: "Error",
          description: "No se pudo eliminar el cliente",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo conectar con el servidor",
        variant: "destructive",
      })
    }
  }

  const filteredClients = (clients || []).filter(
    (client: any) =>
      (client.name || `${client.firstName} ${client.lastName}`).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.phone || "").includes(searchTerm),
  )

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Clientes</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Gestión de clientes de la clínica</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full sm:w-auto">
              <FaPlus className="mr-2" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Cliente</DialogTitle>
              <DialogDescription>Completa los datos del cliente</DialogDescription>
            </DialogHeader>
            <ClientForm onSubmit={addClient} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>
            {loading ? "Cargando..." : `Total de ${filteredClients.length} clientes registrados`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-md">
              Error al cargar clientes: {error.message}
            </div>
          )}
          
          <div className="mb-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">Cargando clientes...</div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Ciudad</TableHead>
                    <TableHead>Fecha Registro</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No hay clientes registrados
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClients.map((client: any) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">
                          {client.name || `${client.firstName || ""} ${client.lastName || ""}`.trim()}
                        </TableCell>
                        <TableCell>{client.email || "-"}</TableCell>
                        <TableCell>{client.phone || "-"}</TableCell>
                        <TableCell>{client.city || "-"}</TableCell>
                        <TableCell>
                          {client.registrationDate 
                            ? new Date(client.registrationDate).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <FaEye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <FaEdit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteClient(client.id)}>
                              <FaTrash className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ClientForm({ onSubmit }: { onSubmit: (client: any) => void }) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const fullName = (formData.get("name") as string).trim()
    const nameParts = fullName.split(" ")
    const firstName = nameParts[0] || ""
    const lastName = nameParts.slice(1).join(" ") || ""
    
    const client = {
      firstName,
      lastName,
      name: fullName,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      postalCode: formData.get("postalCode") as string,
      dniCuit: formData.get("dniCuit") as string || `DNI-${Date.now()}`,
      notes: formData.get("notes") as string,
    }
    onSubmit(client)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre Completo *</Label>
          <Input id="name" name="name" required placeholder="Juan Pérez" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dniCuit">DNI/CUIT *</Label>
          <Input id="dniCuit" name="dniCuit" required placeholder="12345678" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" name="email" type="email" required placeholder="juan@email.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono *</Label>
          <Input id="phone" name="phone" required placeholder="+54 11 6000-0000" />
        </div>
      </div>


      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="address">Dirección *</Label>
          <Input id="address" name="address" required placeholder="Calle Principal 123" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postalCode">Código Postal *</Label>
          <Input id="postalCode" name="postalCode" required placeholder="28001" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea id="notes" name="notes" placeholder="Información adicional del cliente..." rows={3} />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline">
          Cancelar
        </Button>
        <Button type="submit">Registrar Cliente</Button>
      </div>
    </form>
  )
}
