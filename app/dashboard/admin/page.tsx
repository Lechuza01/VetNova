"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { FaCog, FaDatabase, FaShieldAlt, FaBell, FaPalette, FaBuilding } from "react-icons/fa"
import { useAuth } from "@/contexts/auth-context"
import { useClinic } from "@/contexts/clinic-context"
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
import { mockUsers } from "@/lib/auth"
import { Checkbox } from "@/components/ui/checkbox"

export default function AdminPage() {
  const { user } = useAuth()
  const { clients, pets, appointments, inventory, branches } = useClinic()
  const router = useRouter()
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [rolePermissions, setRolePermissions] = useState<Record<string, Record<string, { lectura: boolean; escritura: boolean; admin: boolean }>>>({
    admin: {
      usuarios: { lectura: true, escritura: true, admin: true },
      clientes: { lectura: true, escritura: true, admin: true },
      mascotas: { lectura: true, escritura: true, admin: true },
      turnos: { lectura: true, escritura: true, admin: true },
      internaciones: { lectura: true, escritura: true, admin: true },
      emergencias: { lectura: true, escritura: true, admin: true },
      marketplace: { lectura: true, escritura: true, admin: true },
      comunidad: { lectura: true, escritura: true, admin: true },
      reportes: { lectura: true, escritura: true, admin: true },
      articulos: { lectura: true, escritura: true, admin: true },
      insumos: { lectura: true, escritura: true, admin: true },
      admin: { lectura: true, escritura: true, admin: true },
    },
    veterinarian: {
      usuarios: { lectura: false, escritura: false, admin: false },
      clientes: { lectura: true, escritura: true, admin: false },
      mascotas: { lectura: true, escritura: true, admin: false },
      turnos: { lectura: true, escritura: true, admin: false },
      internaciones: { lectura: true, escritura: true, admin: false },
      emergencias: { lectura: true, escritura: true, admin: false },
      marketplace: { lectura: true, escritura: false, admin: false },
      comunidad: { lectura: true, escritura: true, admin: false },
      reportes: { lectura: true, escritura: false, admin: false },
      articulos: { lectura: true, escritura: true, admin: false },
      insumos: { lectura: true, escritura: true, admin: false },
      admin: { lectura: false, escritura: false, admin: false },
    },
    receptionist: {
      usuarios: { lectura: false, escritura: false, admin: false },
      clientes: { lectura: true, escritura: true, admin: false },
      mascotas: { lectura: true, escritura: true, admin: false },
      turnos: { lectura: true, escritura: true, admin: false },
      internaciones: { lectura: true, escritura: false, admin: false },
      emergencias: { lectura: true, escritura: true, admin: false },
      marketplace: { lectura: true, escritura: false, admin: false },
      comunidad: { lectura: true, escritura: false, admin: false },
      reportes: { lectura: true, escritura: false, admin: false },
      articulos: { lectura: false, escritura: false, admin: false },
      insumos: { lectura: true, escritura: false, admin: false },
      admin: { lectura: false, escritura: false, admin: false },
    },
    cliente: {
      usuarios: { lectura: false, escritura: false, admin: false },
      clientes: { lectura: true, escritura: false, admin: false },
      mascotas: { lectura: true, escritura: true, admin: false },
      turnos: { lectura: true, escritura: true, admin: false },
      internaciones: { lectura: true, escritura: false, admin: false },
      emergencias: { lectura: true, escritura: true, admin: false },
      marketplace: { lectura: true, escritura: true, admin: false },
      comunidad: { lectura: true, escritura: true, admin: false },
      reportes: { lectura: false, escritura: false, admin: false },
      articulos: { lectura: true, escritura: false, admin: false },
      insumos: { lectura: false, escritura: false, admin: false },
      admin: { lectura: false, escritura: false, admin: false },
    },
  })

  const modules = [
    { id: "usuarios", label: "Usuarios" },
    { id: "clientes", label: "Clientes" },
    { id: "mascotas", label: "Mascotas" },
    { id: "turnos", label: "Turnos" },
    { id: "internaciones", label: "Internaciones" },
    { id: "emergencias", label: "Emergencias" },
    { id: "marketplace", label: "Marketplace" },
    { id: "comunidad", label: "Comunidad" },
    { id: "reportes", label: "Reportes" },
    { id: "articulos", label: "Artículos" },
    { id: "insumos", label: "Insumos" },
    { id: "admin", label: "Administración" },
  ]

  const roleLabels: Record<string, string> = {
    admin: "Administrador",
    veterinarian: "Veterinario",
    receptionist: "Recepcionista",
    cliente: "Cliente",
  }

  const handlePermissionChange = (role: string, module: string, permission: "lectura" | "escritura" | "admin", checked: boolean) => {
    setRolePermissions((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [module]: {
          ...prev[role][module],
          [permission]: checked,
        },
      },
    }))
  }

  useEffect(() => {
    if (user?.role !== "admin") {
      router.push("/dashboard")
    }
  }, [user, router])

  if (user?.role !== "admin") {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Administración</h1>
        <p className="text-muted-foreground mt-1">Configuración y gestión del sistema</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{clients.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Mascotas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{pets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Turnos Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {appointments.filter((a) => a.status !== "cancelled").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Items Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{inventory.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">
            <FaCog className="mr-2" />
            General
          </TabsTrigger>
          {user?.role === "admin" && (
            <TabsTrigger value="security">
              <FaShieldAlt className="mr-2" />
              Seguridad
            </TabsTrigger>
          )}
          <TabsTrigger value="notifications">
            <FaBell className="mr-2" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <FaPalette className="mr-2" />
            Apariencia
          </TabsTrigger>
          <TabsTrigger value="database">
            <FaDatabase className="mr-2" />
            Base de Datos
          </TabsTrigger>
          <TabsTrigger value="branches">
            <FaBuilding className="mr-2" />
            Sucursales
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>Ajustes básicos del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="clinicName">Nombre de la Clínica</Label>
                <Input id="clinicName" defaultValue="VetNova" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinicEmail">Email de Contacto</Label>
                <Input id="clinicEmail" type="email" defaultValue="contacto@vetnova.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinicPhone">Teléfono</Label>
                <Input id="clinicPhone" defaultValue="+34 900 123 456" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinicAddress">Dirección</Label>
                <Input id="clinicAddress" defaultValue="Calle Principal 123, Madrid" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo Mantenimiento</Label>
                  <p className="text-sm text-muted-foreground">Desactivar acceso temporal al sistema</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Registro de Actividad</Label>
                  <p className="text-sm text-muted-foreground">Guardar logs de todas las acciones</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex justify-end">
                <Button>Guardar Cambios</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {user?.role === "admin" && (
          <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Seguridad</CardTitle>
              <CardDescription>Gestión de permisos y accesos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Autenticación de Dos Factores (2FA)</Label>
                  <p className="text-sm text-muted-foreground">Requerir código de verificación al iniciar sesión</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sesiones Múltiples</Label>
                  <p className="text-sm text-muted-foreground">Permitir inicio de sesión desde varios dispositivos</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Cierre de Sesión Automático</Label>
                  <p className="text-sm text-muted-foreground">Cerrar sesión después de inactividad</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Tiempo de Inactividad (minutos)</Label>
                <Select defaultValue="30">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">60 minutos</SelectItem>
                    <SelectItem value="120">120 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Permisos por Rol</Label>
                <div className="space-y-3 mt-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Administrador</p>
                      <p className="text-sm text-muted-foreground">Acceso completo al sistema</p>
                    </div>
                    <Dialog open={selectedRole === "admin"} onOpenChange={(open) => setSelectedRole(open ? "admin" : null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Configurar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Configurar Permisos - {roleLabels["admin"]}</DialogTitle>
                          <DialogDescription>Gestiona los permisos de acceso para este rol</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-[200px]">Módulo</TableHead>
                                  <TableHead className="text-center">Lectura</TableHead>
                                  <TableHead className="text-center">Escritura</TableHead>
                                  <TableHead className="text-center">Admin</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {modules.map((module) => (
                                  <TableRow key={module.id}>
                                    <TableCell className="font-medium">{module.label}</TableCell>
                                    <TableCell className="text-center">
                                      <Checkbox
                                        checked={rolePermissions["admin"]?.[module.id]?.lectura || false}
                                        onCheckedChange={(checked) =>
                                          handlePermissionChange("admin", module.id, "lectura", checked as boolean)
                                        }
                                      />
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <Checkbox
                                        checked={rolePermissions["admin"]?.[module.id]?.escritura || false}
                                        onCheckedChange={(checked) =>
                                          handlePermissionChange("admin", module.id, "escritura", checked as boolean)
                                        }
                                      />
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <Checkbox
                                        checked={rolePermissions["admin"]?.[module.id]?.admin || false}
                                        onCheckedChange={(checked) =>
                                          handlePermissionChange("admin", module.id, "admin", checked as boolean)
                                        }
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setSelectedRole(null)}>
                              Cancelar
                            </Button>
                            <Button onClick={() => setSelectedRole(null)}>Guardar Cambios</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Veterinario</p>
                      <p className="text-sm text-muted-foreground">Gestión de consultas y mascotas</p>
                    </div>
                    <Dialog open={selectedRole === "veterinarian"} onOpenChange={(open) => setSelectedRole(open ? "veterinarian" : null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Configurar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Configurar Permisos - {roleLabels["veterinarian"]}</DialogTitle>
                          <DialogDescription>Gestiona los permisos de acceso para este rol</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-[200px]">Módulo</TableHead>
                                  <TableHead className="text-center">Lectura</TableHead>
                                  <TableHead className="text-center">Escritura</TableHead>
                                  <TableHead className="text-center">Admin</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {modules.map((module) => (
                                  <TableRow key={module.id}>
                                    <TableCell className="font-medium">{module.label}</TableCell>
                                    <TableCell className="text-center">
                                      <Checkbox
                                        checked={rolePermissions["veterinarian"]?.[module.id]?.lectura || false}
                                        onCheckedChange={(checked) =>
                                          handlePermissionChange("veterinarian", module.id, "lectura", checked as boolean)
                                        }
                                      />
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <Checkbox
                                        checked={rolePermissions["veterinarian"]?.[module.id]?.escritura || false}
                                        onCheckedChange={(checked) =>
                                          handlePermissionChange("veterinarian", module.id, "escritura", checked as boolean)
                                        }
                                      />
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <Checkbox
                                        checked={rolePermissions["veterinarian"]?.[module.id]?.admin || false}
                                        onCheckedChange={(checked) =>
                                          handlePermissionChange("veterinarian", module.id, "admin", checked as boolean)
                                        }
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setSelectedRole(null)}>
                              Cancelar
                            </Button>
                            <Button onClick={() => setSelectedRole(null)}>Guardar Cambios</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Recepcionista</p>
                      <p className="text-sm text-muted-foreground">Gestión de turnos y clientes</p>
                    </div>
                    <Dialog open={selectedRole === "receptionist"} onOpenChange={(open) => setSelectedRole(open ? "receptionist" : null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Configurar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Configurar Permisos - {roleLabels["receptionist"]}</DialogTitle>
                          <DialogDescription>Gestiona los permisos de acceso para este rol</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-[200px]">Módulo</TableHead>
                                  <TableHead className="text-center">Lectura</TableHead>
                                  <TableHead className="text-center">Escritura</TableHead>
                                  <TableHead className="text-center">Admin</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {modules.map((module) => (
                                  <TableRow key={module.id}>
                                    <TableCell className="font-medium">{module.label}</TableCell>
                                    <TableCell className="text-center">
                                      <Checkbox
                                        checked={rolePermissions["receptionist"]?.[module.id]?.lectura || false}
                                        onCheckedChange={(checked) =>
                                          handlePermissionChange("receptionist", module.id, "lectura", checked as boolean)
                                        }
                                      />
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <Checkbox
                                        checked={rolePermissions["receptionist"]?.[module.id]?.escritura || false}
                                        onCheckedChange={(checked) =>
                                          handlePermissionChange("receptionist", module.id, "escritura", checked as boolean)
                                        }
                                      />
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <Checkbox
                                        checked={rolePermissions["receptionist"]?.[module.id]?.admin || false}
                                        onCheckedChange={(checked) =>
                                          handlePermissionChange("receptionist", module.id, "admin", checked as boolean)
                                        }
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setSelectedRole(null)}>
                              Cancelar
                            </Button>
                            <Button onClick={() => setSelectedRole(null)}>Guardar Cambios</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Cliente</p>
                      <p className="text-sm text-muted-foreground">Acceso limitado a servicios y turnos</p>
                    </div>
                    <Dialog open={selectedRole === "cliente"} onOpenChange={(open) => setSelectedRole(open ? "cliente" : null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Configurar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Configurar Permisos - {roleLabels["cliente"]}</DialogTitle>
                          <DialogDescription>Gestiona los permisos de acceso para este rol</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-[200px]">Módulo</TableHead>
                                  <TableHead className="text-center">Lectura</TableHead>
                                  <TableHead className="text-center">Escritura</TableHead>
                                  <TableHead className="text-center">Admin</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {modules.map((module) => (
                                  <TableRow key={module.id}>
                                    <TableCell className="font-medium">{module.label}</TableCell>
                                    <TableCell className="text-center">
                                      <Checkbox
                                        checked={rolePermissions["cliente"]?.[module.id]?.lectura || false}
                                        onCheckedChange={(checked) =>
                                          handlePermissionChange("cliente", module.id, "lectura", checked as boolean)
                                        }
                                      />
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <Checkbox
                                        checked={rolePermissions["cliente"]?.[module.id]?.escritura || false}
                                        onCheckedChange={(checked) =>
                                          handlePermissionChange("cliente", module.id, "escritura", checked as boolean)
                                        }
                                      />
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <Checkbox
                                        checked={rolePermissions["cliente"]?.[module.id]?.admin || false}
                                        onCheckedChange={(checked) =>
                                          handlePermissionChange("cliente", module.id, "admin", checked as boolean)
                                        }
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setSelectedRole(null)}>
                              Cancelar
                            </Button>
                            <Button onClick={() => setSelectedRole(null)}>Guardar Cambios</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button>Guardar Cambios</Button>
              </div>
            </CardContent>
          </Card>
          </TabsContent>
        )}

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Notificaciones</CardTitle>
              <CardDescription>Gestión de alertas y recordatorios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Recordatorios de Turnos</Label>
                  <p className="text-sm text-muted-foreground">Enviar recordatorios a clientes antes de la cita</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertas de Stock Bajo</Label>
                  <p className="text-sm text-muted-foreground">Notificar cuando el inventario esté bajo</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificaciones de Vencimiento</Label>
                  <p className="text-sm text-muted-foreground">Alertar sobre productos próximos a vencer</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Confirmación de Turnos</Label>
                  <p className="text-sm text-muted-foreground">Solicitar confirmación de citas programadas</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="reminderTime">Tiempo de Anticipación (horas)</Label>
                <Select defaultValue="24">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 horas</SelectItem>
                    <SelectItem value="6">6 horas</SelectItem>
                    <SelectItem value="12">12 horas</SelectItem>
                    <SelectItem value="24">24 horas</SelectItem>
                    <SelectItem value="48">48 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end">
                <Button>Guardar Cambios</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Apariencia</CardTitle>
              <CardDescription>Personalización visual del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Tema del Sistema</Label>
                <Select defaultValue="light">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Oscuro</SelectItem>
                    <SelectItem value="auto">Automático</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Color Principal</Label>
                <div className="flex gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary border-2 border-foreground cursor-pointer" />
                  <div className="w-10 h-10 rounded-full bg-blue-500 border-2 border-transparent cursor-pointer" />
                  <div className="w-10 h-10 rounded-full bg-green-500 border-2 border-transparent cursor-pointer" />
                  <div className="w-10 h-10 rounded-full bg-purple-500 border-2 border-transparent cursor-pointer" />
                  <div className="w-10 h-10 rounded-full bg-orange-500 border-2 border-transparent cursor-pointer" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo Compacto</Label>
                  <p className="text-sm text-muted-foreground">Reducir espaciado en la interfaz</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Animaciones</Label>
                  <p className="text-sm text-muted-foreground">Habilitar transiciones y efectos visuales</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex justify-end">
                <Button>Guardar Cambios</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Base de Datos</CardTitle>
              <CardDescription>Respaldo y mantenimiento de datos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Respaldo Automático</p>
                    <p className="text-sm text-muted-foreground">Último respaldo: Hoy a las 03:00</p>
                  </div>
                  <Button variant="outline">Configurar</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Crear Respaldo Manual</p>
                    <p className="text-sm text-muted-foreground">Generar copia de seguridad ahora</p>
                  </div>
                  <Button>Crear Respaldo</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Restaurar Base de Datos</p>
                    <p className="text-sm text-muted-foreground">Recuperar desde un respaldo anterior</p>
                  </div>
                  <Button variant="outline">Restaurar</Button>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-medium">Mantenimiento</h3>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Optimizar Base de Datos</p>
                    <p className="text-sm text-muted-foreground">Mejorar rendimiento y liberar espacio</p>
                  </div>
                  <Button variant="outline">Optimizar</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Limpiar Datos Antiguos</p>
                    <p className="text-sm text-muted-foreground">Eliminar registros obsoletos</p>
                  </div>
                  <Button variant="outline">Limpiar</Button>
                </div>
              </div>
              <Separator />
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <h3 className="font-medium text-destructive mb-2">Zona de Peligro</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Estas acciones son irreversibles y pueden causar pérdida de datos
                </p>
                <Button variant="destructive">Restablecer Sistema</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Sucursales</CardTitle>
              <CardDescription>Administración de todas las sucursales del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Servicios</TableHead>
                      <TableHead>Horario</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {branches.map((branch) => {
                      const chiefVet = Object.values(mockUsers)
                        .map((u) => u.user)
                        .find((u) => u.id === branch.chiefVeterinarianId)
                      const serviceLabels: Record<string, string> = {
                        consulta: "Consulta",
                        shop: "Shop",
                        internacion: "Internación",
                        urgencias: "Urgencias",
                      }
                      const typeLabels: Record<string, string> = {
                        veterinaria_shop: "Veterinaria + Shop",
                        veterinaria_clinica: "Veterinaria + Clínica",
                      }

                      return (
                        <TableRow key={branch.id}>
                          <TableCell className="font-medium">{branch.name}</TableCell>
                          <TableCell>{typeLabels[branch.type]}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {branch.services.map((service) => (
                                <Badge key={service} variant="secondary" className="text-xs">
                                  {serviceLabels[service]}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            {branch.is24Hours ? (
                              <Badge variant="default">24 horas</Badge>
                            ) : (
                              <span className="text-sm">{branch.openingHours.monday}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={branch.isActive ? "default" : "secondary"}>
                              {branch.isActive ? "Activa" : "Inactiva"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedBranch(branch.id)}
                            >
                              Ver Detalles
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de detalles de sucursal */}
      {selectedBranch && (
        <Dialog open={!!selectedBranch} onOpenChange={(open) => !open && setSelectedBranch(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalles de Sucursal</DialogTitle>
              <DialogDescription>Información completa de la sucursal</DialogDescription>
            </DialogHeader>
            {(() => {
              const branch = branches.find((b) => b.id === selectedBranch)
              if (!branch) return null
              const chiefVet = Object.values(mockUsers)
                .map((u) => u.user)
                .find((u) => u.id === branch.chiefVeterinarianId)
              const serviceLabels: Record<string, string> = {
                consulta: "Consulta Veterinaria",
                shop: "Shop",
                internacion: "Internación",
                urgencias: "Urgencias",
              }
              const typeLabels: Record<string, string> = {
                veterinaria_shop: "Veterinaria + Shop",
                veterinaria_clinica: "Veterinaria + Clínica",
              }

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Nombre</Label>
                      <p className="font-medium">{branch.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Tipo</Label>
                      <p className="font-medium">{typeLabels[branch.type]}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm text-muted-foreground">Dirección</Label>
                    <p className="font-medium">
                      {branch.address}, {branch.city} {branch.postalCode}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Teléfono</Label>
                      <p className="font-medium">{branch.phone}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Email</Label>
                      <p className="font-medium">{branch.email}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block">Servicios Disponibles</Label>
                    <div className="flex flex-wrap gap-2">
                      {branch.services.map((service) => (
                        <Badge key={service} variant="secondary">
                          {serviceLabels[service]}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block">Horarios</Label>
                    <div className="bg-muted p-3 rounded-lg space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Lunes:</span>
                        <span className="font-medium">{branch.openingHours.monday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Martes:</span>
                        <span className="font-medium">{branch.openingHours.tuesday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Miércoles:</span>
                        <span className="font-medium">{branch.openingHours.wednesday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Jueves:</span>
                        <span className="font-medium">{branch.openingHours.thursday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Viernes:</span>
                        <span className="font-medium">{branch.openingHours.friday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sábado:</span>
                        <span className="font-medium">{branch.openingHours.saturday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Domingo:</span>
                        <span className="font-medium">{branch.openingHours.sunday}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm text-muted-foreground">Veterinario en Jefe</Label>
                    <p className="font-medium">{chiefVet?.name || "No asignado"}</p>
                  </div>

                  <div>
                    <Label className="text-sm text-muted-foreground">Estado</Label>
                    <div className="mt-1">
                      <Badge variant={branch.isActive ? "default" : "secondary"}>
                        {branch.isActive ? "Activa" : "Inactiva"}
                      </Badge>
                      {branch.is24Hours && (
                        <Badge variant="default" className="ml-2">
                          24 horas
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )
            })()}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
