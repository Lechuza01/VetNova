"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FaExclamationTriangle } from "react-icons/fa"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { EmergencyForm } from "./emergency-form"
import { useClinic } from "@/contexts/clinic-context"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

interface Emergency {
  id: string
  petId: string
  clientId: string
  reportedBy: string
  reportedAt: string
  priority: "low" | "medium" | "high" | "critical"
  description: string
  symptoms: string
  status: "pending" | "in_progress" | "resolved" | "cancelled"
  assignedTo?: string
  notes?: string
}

export function EmergencyButton() {
  const isMobile = useIsMobile()
  const router = useRouter()
  const pathname = usePathname()
  const { pets, clients } = useClinic()
  const { user } = useAuth()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)

  // Solo mostrar en móvil y si no estamos en la página de emergencias
  if (!isMobile || pathname === "/dashboard/emergencies") {
    return null
  }

  const handleSubmit = (data: Omit<Emergency, "id" | "reportedBy" | "reportedAt">) => {
    // En una app real, aquí harías la llamada a la API
    toast({
      title: "Emergencia registrada",
      description: "La emergencia se ha registrado correctamente",
    })
    setOpen(false)
    router.push("/dashboard/emergencies")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-20 right-6 h-16 w-16 rounded-full shadow-2xl z-40 bg-destructive hover:bg-destructive/90 animate-pulse"
          size="icon"
        >
          <FaExclamationTriangle className="w-6 h-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Emergencia</DialogTitle>
          <DialogDescription>Completa los datos de la emergencia</DialogDescription>
        </DialogHeader>
        <EmergencyForm pets={pets} clients={clients} currentUser={user} onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  )
}

