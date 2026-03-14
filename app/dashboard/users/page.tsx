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
import type { User } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { useUsers } from "@/lib/hooks/use-api"

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { data: users = [], loading, error, mutate } = useUsers()
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  // Restringir acceso solo a admin
  useEffect(() => {
    if (currentUser?.role !== "admin") {
      router.push("/dashboard")
    }
  }, [currentUser?.role, router])

  if (currentUser?.role !== "admin") {
    return null
  }

  // Ensure users is always an array
  const safeUsers = Array.isArray(users) ? users : []
  const filteredUsers = safeUsers.filter(
    (user) => {
      if (!user) return false
      const name = user.name?.toLowerCase() || ""
      const email = user.email?.toLowerCase() || ""
      const search = searchTerm.toLowerCase()
      return name.includes(search) || email.includes(search)
    }
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
              onSuccess={async (userData) => {
                try {
                  const response = await fetch("/api/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      username: userData.email.split("@")[0],
                      email: userData.email,
                      name: userData.name,
                      passwordHash: userData.passwordHash || "temp", // Will be hashed on server
                      role: userData.role,
                      phone: userData.phone,
                      address: userData.address,
                      birthDate: userData.birthDate,
                    }),
                  })
                  
                  if (response.ok) {
                    toast({
                      title: "Usuario creado",
                      description: `El usuario ${userData.name} ha sido creado exitosamente`,
                    })
                    mutate() // Refresh the list
                    setDialogOpen(false)
                  } else {
                    const error = await response.json()
                    toast({
                      title: "Error",
                      description: error.error || "No se pudo crear el usuario",
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
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>
            {loading ? "Cargando..." : `${filteredUsers.length} usuarios registrados`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-md">
              Error al cargar usuarios: {error.message}
            </div>
          )}
          
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

          {loading ? (
            <div className="text-center py-8">Cargando usuarios...</div>
          ) : (
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
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No hay usuarios registrados
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user: any) => {
                      if (!user) return null
                      return (
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
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={async () => {
                                  if (confirm(`¿Estás seguro de eliminar a ${user.name}?`)) {
                                    try {
                                      const response = await fetch(`/api/users/${user.id}`, {
                                        method: "DELETE",
                                      })
                                      if (response.ok) {
                                        toast({
                                          title: "Usuario eliminado",
                                          description: "El usuario se ha eliminado correctamente",
                                        })
                                        mutate()
                                      }
                                    } catch (error) {
                                      toast({
                                        title: "Error",
                                        description: "No se pudo eliminar el usuario",
                                        variant: "destructive",
                                      })
                                    }
                                  }
                                }}
                              >
                                <FaTrash className="w-4 h-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      )
                    })}
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

function UserForm({ onSuccess }: { onSuccess: (userData: any) => void }) {
  const [role, setRole] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

    // Hash password (simple hash for now, should use bcrypt on server)
    const passwordHash = btoa(password) // Temporary, server should hash properly

    const userData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      role: role as User["role"],
      phone: formData.get("phone") as string || undefined,
      address: formData.get("address") as string || undefined,
      birthDate: formData.get("birthDate") as string || undefined,
      passwordHash,
    }

    onSuccess(userData)
    
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
