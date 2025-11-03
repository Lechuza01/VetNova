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

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <>
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-3" onClick={onLinkClick}>
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

// Context para compartir el estado del sidebar móvil
const SidebarContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({
  open: false,
  setOpen: () => {},
})

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return <SidebarContext.Provider value={{ open, setOpen }}>{children}</SidebarContext.Provider>
}

export function Sidebar() {
  const isMobile = useIsMobile()

  // En móvil, el sidebar se maneja desde SidebarTrigger, así que no renderizamos nada aquí
  if (isMobile) {
    return null
  }

  return (
    <aside className="hidden md:flex w-64 bg-sidebar border-r border-sidebar-border flex-col h-screen sticky top-0">
      <SidebarContent />
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
