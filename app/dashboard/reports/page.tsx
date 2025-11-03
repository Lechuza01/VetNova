"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { FaFileDownload, FaChartBar, FaChartLine, FaChartPie } from "react-icons/fa"
import { useClinic } from "@/contexts/clinic-context"

export default function ReportsPage() {
  const { appointments, clients, pets, inventory } = useClinic()
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  // Mock data for charts
  const monthlyIncome = [
    { month: "Ene", income: 8500 },
    { month: "Feb", income: 9200 },
    { month: "Mar", income: 10100 },
    { month: "Abr", income: 9800 },
    { month: "May", income: 11200 },
    { month: "Jun", income: 12450 },
  ]

  const appointmentsByStatus = [
    { name: "Completados", value: appointments.filter((a) => a.status === "completed").length, color: "#10b981" },
    { name: "Confirmados", value: appointments.filter((a) => a.status === "confirmed").length, color: "#3b82f6" },
    { name: "Pendientes", value: appointments.filter((a) => a.status === "pending").length, color: "#f59e0b" },
    { name: "Cancelados", value: appointments.filter((a) => a.status === "cancelled").length, color: "#ef4444" },
  ]

  const speciesDistribution = [
    { name: "Perros", value: pets.filter((p) => p.species === "Perro").length, color: "#3b82f6" },
    { name: "Gatos", value: pets.filter((p) => p.species === "Gato").length, color: "#8b5cf6" },
    { name: "Otros", value: pets.filter((p) => !["Perro", "Gato"].includes(p.species)).length, color: "#10b981" },
  ]

  const lowStockItems = inventory.filter((item) => item.quantity <= item.minStock)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reportes</h1>
          <p className="text-muted-foreground mt-1">Análisis y estadísticas de la clínica</p>
        </div>
        <Button>
          <FaFileDownload className="mr-2" />
          Exportar Reporte
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">€12,450</div>
            <p className="text-xs text-muted-foreground mt-1">+15% vs mes anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Consultas Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{appointments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">+8% vs mes anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Nuevos Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">24</div>
            <p className="text-xs text-muted-foreground mt-1">Este mes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stock Bajo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Artículos críticos</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="income" className="w-full">
        <TabsList>
          <TabsTrigger value="income">
            <FaChartLine className="mr-2" />
            Ingresos
          </TabsTrigger>
          <TabsTrigger value="appointments">
            <FaChartPie className="mr-2" />
            Turnos
          </TabsTrigger>
          <TabsTrigger value="pets">
            <FaChartBar className="mr-2" />
            Mascotas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ingresos Mensuales</CardTitle>
              <CardDescription>Evolución de ingresos en los últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={monthlyIncome}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#3b82f6" strokeWidth={2} name="Ingresos (€)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Servicios Más Solicitados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { service: "Vacunación", count: 45, percentage: 35 },
                    { service: "Revisión General", count: 38, percentage: 30 },
                    { service: "Cirugía", count: 25, percentage: 20 },
                    { service: "Emergencias", count: 19, percentage: 15 },
                  ].map((item) => (
                    <div key={item.service}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{item.service}</span>
                        <span className="text-sm text-muted-foreground">{item.count} consultas</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${item.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métodos de Pago</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Efectivo", value: 45, color: "#3b82f6" },
                        { name: "Tarjeta", value: 40, color: "#10b981" },
                        { name: "Transferencia", value: 15, color: "#f59e0b" },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: "Efectivo", value: 45, color: "#3b82f6" },
                        { name: "Tarjeta", value: 40, color: "#10b981" },
                        { name: "Transferencia", value: 15, color: "#f59e0b" },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Turnos por Estado</CardTitle>
                <CardDescription>Distribución de estados de turnos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={appointmentsByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {appointmentsByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Turnos por Día de la Semana</CardTitle>
                <CardDescription>Distribución semanal de consultas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { day: "Lun", count: 18 },
                      { day: "Mar", count: 22 },
                      { day: "Mié", count: 20 },
                      { day: "Jue", count: 25 },
                      { day: "Vie", count: 28 },
                      { day: "Sáb", count: 15 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" name="Turnos" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pets" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Especie</CardTitle>
                <CardDescription>Mascotas registradas por tipo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={speciesDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {speciesDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nuevas Mascotas por Mes</CardTitle>
                <CardDescription>Registros de los últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { month: "Ene", count: 12 },
                      { month: "Feb", count: 15 },
                      { month: "Mar", count: 18 },
                      { month: "Abr", count: 14 },
                      { month: "May", count: 20 },
                      { month: "Jun", count: 22 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" name="Nuevas Mascotas" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Generar Reporte Personalizado</CardTitle>
          <CardDescription>Selecciona el rango de fechas y tipo de reporte</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateFrom">Fecha Desde</Label>
                <Input id="dateFrom" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateTo">Fecha Hasta</Label>
                <Input id="dateTo" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reportType">Tipo de Reporte</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Ingresos</SelectItem>
                    <SelectItem value="appointments">Turnos</SelectItem>
                    <SelectItem value="clients">Clientes</SelectItem>
                    <SelectItem value="inventory">Inventario</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="button">
                <FaFileDownload className="mr-2" />
                Generar y Descargar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
