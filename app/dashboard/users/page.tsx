"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa"
import { useAuth } from "@/contexts/auth-context"
import { mockUsers } from "@/lib/auth"
import type { User } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [mockUsersList] = useState<User[]>(Object.values(mockUsers).map((u) => ({ ...u.user, createdAt: "2024-01-01" })))
  const [temporaryUsers, setTemporaryUsers] = useState<User[]>([])

  // Cargar usuarios temporales del localStorage al montar
  useEffect(() => {
    const stored = localStorage.getItem("vetclinic_temporary_users")
    if (stored) {
      setTemporaryUsers(JSON.parse(stored))
    }
  }, [])

  // Restringir acceso solo a admin
  useEffect(() => {
    if (currentUser?.role !== "admin") {
      router.push("/dashboard")
    }
  }, [currentUser?.role, router])

  if (currentUser?.role !== "admin") {
    return null
  }

  // Combinar usuarios mock con usuarios temporales
  const users = [...mockUsersList, ...temporaryUsers]

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getRoleBadge = (role: string) => {
    const roleLabels: Record<string, string> = {
      admin: "Administrador",
      veterinarian: "Veterinario",
      receptionist: "Recepcionista",
      cliente: "Cliente",
    }
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      admin: "destructive",
      veterinarian: "default",
      receptionist: "secondary",
      cliente: "secondary",
    }
    return <Badge variant={variants[role] || "default"}>{roleLabels[role] || role}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Usuarios</h1>
          <p className="text-muted-foreground mt-1">Gestión de usuarios del sistema</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <FaPlus className="mr-2" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
              <DialogDescription>Completa los datos del nuevo usuario del sistema</DialogDescription>
            </DialogHeader>
            <UserForm
              onSuccess={(newUser) => {
                // Agregar usuario temporal
                const updated = [...temporaryUsers, newUser]
                setTemporaryUsers(updated)
                localStorage.setItem("vetclinic_temporary_users", JSON.stringify(updated))
                setDialogOpen(false)
                toast({
                  title: "Usuario creado",
                  description: `El usuario ${newUser.name} ha sido creado exitosamente`,
                })
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>Usuarios registrados en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o email..."
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
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{user.phone || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <FaEdit className="w-4 h-4" />
                        </Button>
                        {currentUser?.role === "admin" && user.id !== currentUser.id && (
                          <Button variant="ghost" size="sm">
                            <FaTrash className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function UserForm({ onSuccess }: { onSuccess: (user: User) => void }) {
  const [role, setRole] = useState<string>("")

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden")
      return
    }

    if (!role) {
      alert("Por favor selecciona un rol")
      return
    }

    const newUser: User = {
      id: `temp_${Date.now()}`,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      role: role as User["role"],
      phone: formData.get("phone") as string || undefined,
      address: formData.get("address") as string || undefined,
      birthDate: formData.get("birthDate") as string || undefined,
      createdAt: new Date().toISOString(),
    }

    onSuccess(newUser)
    
    // Reset form
    e.currentTarget.reset()
    setRole("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre Completo *</Label>
          <Input id="name" name="name" required placeholder="Dr. Juan Pérez" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" name="email" type="email" required placeholder="juan@vetnova.com" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" name="phone" placeholder="+34 600 000 000" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Rol *</Label>
          <Select value={role} onValueChange={setRole} required>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="veterinarian">Veterinario</SelectItem>
              <SelectItem value="receptionist">Recepcionista</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
          <Input id="birthDate" name="birthDate" type="date" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Dirección</Label>
          <Input id="address" name="address" placeholder="Calle Principal 123" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña *</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" required />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={() => setRole("")}>
          Cancelar
        </Button>
        <Button type="submit">Crear Usuario</Button>
      </div>
    </form>
  )
}
