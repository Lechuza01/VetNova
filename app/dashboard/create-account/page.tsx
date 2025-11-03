"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { FaUserPlus, FaCheck } from "react-icons/fa"
import { useToast } from "@/hooks/use-toast"

export default function CreateAccountPage() {
  const [step, setStep] = useState(1)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 3) {
      setStep(step + 1)
    } else {
      toast({
        title: "Cuenta creada exitosamente",
        description: "El nuevo usuario ha sido registrado en el sistema",
      })
      setStep(1)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Crear Nueva Cuenta</h1>
        <p className="text-muted-foreground mt-1">Registro de nuevo usuario en el sistema</p>
      </div>

      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                s === step
                  ? "bg-primary text-primary-foreground"
                  : s < step
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {s < step ? <FaCheck /> : s}
            </div>
            {s < 3 && <div className={`w-16 h-1 ${s < step ? "bg-primary" : "bg-muted"}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && "Paso 1: Información Personal"}
              {step === 2 && "Paso 2: Datos de Acceso"}
              {step === 3 && "Paso 3: Confirmación"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Completa los datos personales del usuario"}
              {step === 2 && "Configura las credenciales de acceso"}
              {step === 3 && "Revisa y confirma la información"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre *</Label>
                    <Input id="firstName" required placeholder="Juan" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellidos *</Label>
                    <Input id="lastName" required placeholder="Pérez García" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" required placeholder="juan@vetnova.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input id="phone" required placeholder="+34 600 000 000" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Fecha de Nacimiento *</Label>
                    <Input id="birthDate" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Rol *</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="veterinarian">Veterinario</SelectItem>
                        <SelectItem value="receptionist">Recepcionista</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input id="address" placeholder="Calle Principal 123, Madrid" />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username">Nombre de Usuario *</Label>
                  <Input id="username" required placeholder="jperez" />
                  <p className="text-xs text-muted-foreground">El nombre de usuario debe ser único y sin espacios</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña *</Label>
                    <Input id="password" type="password" required placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                    <Input id="confirmPassword" type="password" required placeholder="••••••••" />
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="text-sm font-medium">Requisitos de contraseña:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Mínimo 8 caracteres</li>
                    <li>Al menos una letra mayúscula</li>
                    <li>Al menos un número</li>
                    <li>Al menos un carácter especial</li>
                  </ul>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Permisos y Accesos</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="perm1" defaultChecked />
                      <Label htmlFor="perm1" className="font-normal cursor-pointer">
                        Acceso al módulo de clientes
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="perm2" defaultChecked />
                      <Label htmlFor="perm2" className="font-normal cursor-pointer">
                        Acceso al módulo de mascotas
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="perm3" defaultChecked />
                      <Label htmlFor="perm3" className="font-normal cursor-pointer">
                        Gestión de turnos
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="perm4" />
                      <Label htmlFor="perm4" className="font-normal cursor-pointer">
                        Acceso a reportes financieros
                      </Label>
                    </div>
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Nombre Completo</p>
                      <p className="font-medium">Juan Pérez García</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">juan@vetnova.com</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Teléfono</p>
                      <p className="font-medium">+34 600 000 000</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rol</p>
                      <p className="font-medium">Veterinario</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Usuario</p>
                      <p className="font-medium">jperez</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha de Nacimiento</p>
                      <p className="font-medium">15/03/1990</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Permisos Asignados</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>✓ Acceso al módulo de clientes</li>
                    <li>✓ Acceso al módulo de mascotas</li>
                    <li>✓ Gestión de turnos</li>
                  </ul>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  />
                  <Label htmlFor="terms" className="font-normal cursor-pointer">
                    Acepto los términos y condiciones del sistema
                  </Label>
                </div>
              </>
            )}

            <div className="flex justify-between pt-4">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                  Anterior
                </Button>
              )}
              <Button type="submit" className={step === 1 ? "ml-auto" : ""} disabled={step === 3 && !acceptTerms}>
                {step === 3 ? (
                  <>
                    <FaUserPlus className="mr-2" />
                    Crear Cuenta
                  </>
                ) : (
                  "Siguiente"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
