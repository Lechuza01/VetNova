"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FaUsers, FaDog, FaCalendarAlt, FaChartLine } from "react-icons/fa"

export default function DashboardPage() {
  const { user } = useAuth()

  const stats = [
    {
      title: "Total Clientes",
      value: "248",
      icon: FaUsers,
      description: "+12% desde el mes pasado",
      color: "text-primary",
    },
    {
      title: "Mascotas Registradas",
      value: "412",
      icon: FaDog,
      description: "+8% desde el mes pasado",
      color: "text-accent",
    },
    {
      title: "Turnos Hoy",
      value: "18",
      icon: FaCalendarAlt,
      description: "5 pendientes",
      color: "text-chart-3",
    },
    {
      title: "Ingresos Mensuales",
      value: "€12,450",
      icon: FaChartLine,
      description: "+15% desde el mes pasado",
      color: "text-chart-5",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Resumen general de la clínica veterinaria</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bienvenido al Sistema VetNova</CardTitle>
          <CardDescription>Sistema completo de gestión para clínicas veterinarias</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Este sistema te permite gestionar todos los aspectos de tu clínica veterinaria: clientes, mascotas,
            historiales médicos, turnos, inventario y mucho más.
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium text-foreground mb-2">Usuario actual: {user?.name}</p>
            <p className="text-sm text-muted-foreground">
              Rol: <span className="capitalize font-medium">{user?.role}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
