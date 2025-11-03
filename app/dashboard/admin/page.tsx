"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { FaCog, FaDatabase, FaShieldAlt, FaBell, FaPalette } from "react-icons/fa"
import { useAuth } from "@/contexts/auth-context"
import { useClinic } from "@/contexts/clinic-context"

export default function AdminPage() {
  const { user } = useAuth()
  const { clients, pets, appointments, inventory } = useClinic()
  const router = useRouter()

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
          <TabsTrigger value="security">
            <FaShieldAlt className="mr-2" />
            Seguridad
          </TabsTrigger>
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
                    <Button variant="outline" size="sm">
                      Configurar
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Veterinario</p>
                      <p className="text-sm text-muted-foreground">Gestión de consultas y mascotas</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configurar
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Recepcionista</p>
                      <p className="text-sm text-muted-foreground">Gestión de turnos y clientes</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configurar
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button>Guardar Cambios</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
      </Tabs>
    </div>
  )
}
