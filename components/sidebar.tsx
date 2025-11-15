"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
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
  FaBars,
  FaExclamationTriangle,
} from "react-icons/fa"

const menuItems = [
  { href: "/dashboard/users", label: "Usuarios", icon: FaUsers, roles: ["admin", "veterinarian", "receptionist"] },
  { href: "/dashboard/clients", label: "Clientes", icon: FaUserFriends, roles: ["admin", "veterinarian", "receptionist"] },
  { href: "/dashboard/pets", label: "Mascotas", icon: FaDog, roles: ["admin", "veterinarian", "receptionist", "cliente"] },
  { href: "/dashboard/appointments", label: "Turnos", icon: FaCalendarAlt, roles: ["admin", "veterinarian", "receptionist", "cliente"] },
  { href: "/dashboard/hospitalizations", label: "Internaciones", icon: FaHospital, roles: ["admin", "veterinarian", "receptionist"] },
  { href: "/dashboard/emergencies", label: "Emergencias", icon: FaExclamationTriangle, roles: ["admin", "veterinarian", "receptionist", "cliente"] },
  { href: "/dashboard/marketplace", label: "Marketplace", icon: FaStore, roles: ["admin", "veterinarian", "receptionist", "cliente"] },
  { href: "/dashboard/community", label: "Comunidad", icon: FaComments, roles: ["admin", "veterinarian", "receptionist", "cliente"] },
  { href: "/dashboard/reports", label: "Reportes", icon: FaChartBar, roles: ["admin", "veterinarian", "receptionist"] },
  { href: "/dashboard/articles", label: "Artículos", icon: FaBoxes, roles: ["admin", "veterinarian", "receptionist"] },
  { href: "/dashboard/supplies", label: "Insumos", icon: FaCapsules, roles: ["admin", "veterinarian", "receptionist"] },
  { href: "/dashboard/admin", label: "Admin", icon: FaUserShield, roles: ["admin"] },
]

function SidebarContent({ onLinkClick, onToggleCollapse }: { onLinkClick?: () => void; onToggleCollapse?: () => void }) {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <>
      <div className="px-4 md:px-6 py-3 md:py-4 border-b border-sidebar-border flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 flex-1" onClick={onLinkClick}>
          <div className="bg-sidebar-primary text-sidebar-primary-foreground p-2 rounded-lg">
            <FaPaw className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">VetNova</h1>
            <p className="text-xs text-muted-foreground">Sistema de Gestión</p>
          </div>
        </Link>
        {onToggleCollapse && (
          <Button variant="ghost" size="icon" onClick={onToggleCollapse} className="md:flex hidden">
            <FaBars className="h-4 w-4" />
          </Button>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          // Filtrar items según el rol del usuario
          if (user?.role && item.roles && !item.roles.includes(user.role)) return null
          // Mantener compatibilidad con adminOnly
          if (item.adminOnly && user?.role !== "admin") return null

          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
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
    </>
  )
}

// Context para compartir el estado del sidebar móvil y collapse
const SidebarContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}>({
  open: false,
  setOpen: () => {},
  collapsed: false,
  setCollapsed: () => {},
})

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  return <SidebarContext.Provider value={{ open, setOpen, collapsed, setCollapsed }}>{children}</SidebarContext.Provider>
}

export function Sidebar() {
  const isMobile = useIsMobile()
  const { collapsed, setCollapsed } = React.useContext(SidebarContext)
  const pathname = usePathname()
  const { user } = useAuth()

  // En móvil, el sidebar se maneja desde SidebarTrigger, así que no renderizamos nada aquí
  if (isMobile) {
    return null
  }

  return (
    <aside className={cn(
      "hidden md:flex bg-sidebar border-r border-sidebar-border flex-col h-screen sticky top-0 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className={cn("border-b border-sidebar-border flex items-center", collapsed ? "justify-center p-2" : "px-4 md:px-6 py-3 md:py-4 justify-between")}>
        {!collapsed ? (
          <>
            <Link href="/dashboard" className="flex items-center gap-3 flex-1">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground p-2 rounded-lg">
                <FaPaw className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-sidebar-foreground">VetNova</h1>
                <p className="text-xs text-muted-foreground">Sistema de Gestión</p>
              </div>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)}>
              <FaBars className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="w-full">
            <FaBars className="h-5 w-5" />
          </Button>
        )}
      </div>
      {!collapsed && (
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            // Filtrar items según el rol del usuario
            if (user?.role && item.roles && !item.roles.includes(user.role)) return null
            // Mantener compatibilidad con adminOnly
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
      )}
      {collapsed && (
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            // Filtrar items según el rol del usuario
            if (user?.role && item.roles && !item.roles.includes(user.role)) return null
            // Mantener compatibilidad con adminOnly
            if (item.adminOnly && user?.role !== "admin") return null

            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-center p-3 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
                title={item.label}
              >
                <Icon className="w-4 h-4" />
              </Link>
            )
          })}
        </nav>
      )}
    </aside>
  )
}

export function SidebarTrigger() {
  const isMobile = useIsMobile()
  const { open, setOpen } = React.useContext(SidebarContext)

  if (!isMobile) return null

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <FaBars className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
        <SidebarContent onLinkClick={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
