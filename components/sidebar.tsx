"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import {
  FaUsers,
  FaUserFriends,
  FaDog,
  FaCalendarAlt,
  FaChartBar,
  FaBoxes,
  FaCapsules,
  FaUserPlus,
  FaUserShield,
  FaPaw,
  FaStore,
  FaComments,
  FaHospital,
} from "react-icons/fa"

const menuItems = [
  { href: "/dashboard/users", label: "Usuarios", icon: FaUsers },
  { href: "/dashboard/clients", label: "Clientes", icon: FaUserFriends },
  { href: "/dashboard/pets", label: "Mascotas", icon: FaDog },
  { href: "/dashboard/appointments", label: "Turnos", icon: FaCalendarAlt },
  { href: "/dashboard/hospitalizations", label: "Internaciones", icon: FaHospital },
  { href: "/dashboard/marketplace", label: "Marketplace", icon: FaStore },
  { href: "/dashboard/community", label: "Comunidad", icon: FaComments },
  { href: "/dashboard/reports", label: "Reportes", icon: FaChartBar },
  { href: "/dashboard/articles", label: "Artículos", icon: FaBoxes },
  { href: "/dashboard/supplies", label: "Insumos", icon: FaCapsules },
  { href: "/dashboard/create-account", label: "Crear Cuenta", icon: FaUserPlus },
  { href: "/dashboard/admin", label: "Admin", icon: FaUserShield, adminOnly: true },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground p-2 rounded-lg">
            <FaPaw className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">VetNova</h1>
            <p className="text-xs text-muted-foreground">Sistema de Gestión</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          if (item.adminOnly && user?.role !== "admin") return null

          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
