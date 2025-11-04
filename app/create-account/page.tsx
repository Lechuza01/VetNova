"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { FaUserPlus, FaCheck, FaEnvelope, FaArrowLeft } from "react-icons/fa"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function CreateAccountPage() {
  const [step, setStep] = useState(1)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) {
      // Simular envío de email
      setEmailSent(true)
      toast({
        title: "Email de verificación enviado",
        description: "Revisa tu bandeja de entrada para confirmar tu email",
      })
      setStep(2)
    } else if (step === 2) {
      // Verificar código
      if (verificationCode === "123456") {
        toast({
          title: "Email confirmado",
          description: "Tu email ha sido verificado correctamente",
        })
        setStep(3)
      } else {
        toast({
          title: "Código incorrecto",
          description: "El código de verificación no es válido",
          variant: "destructive",
        })
      }
    } else if (step === 3) {
      toast({
        title: "Cuenta creada exitosamente",
        description: "El nuevo usuario ha sido registrado en el sistema",
      })
      router.push("/login")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/login">
              <Button variant="ghost" size="icon">
                <FaArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold">Crear Nueva Cuenta</CardTitle>
              <CardDescription>Registro de nuevo usuario en el sistema</CardDescription>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mt-6">
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
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Nombre de Usuario *</Label>
                    <Input id="username" required placeholder="jperez" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña *</Label>
                    <Input id="password" type="password" required placeholder="••••••••" />
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="text-center space-y-4">
                  <div className="bg-primary/10 p-6 rounded-lg inline-block">
                    <FaEnvelope className="w-12 h-12 text-primary mx-auto mb-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Confirma tu email</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Hemos enviado un código de verificación a tu correo electrónico.
                      Por favor, ingresa el código que recibiste.
                    </p>
                    <p className="text-xs text-muted-foreground mb-6">
                      (Demo: usa el código 123456)
                    </p>
                  </div>
                  <div className="space-y-2 max-w-xs mx-auto">
                    <Label htmlFor="verificationCode">Código de verificación *</Label>
                    <Input
                      id="verificationCode"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "")
                        if (value.length <= 6) {
                          setVerificationCode(value)
                        }
                      }}
                      className="text-center text-lg tracking-widest"
                      maxLength={6}
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm"
                    onClick={() => {
                      toast({
                        title: "Código reenviado",
                        description: "Hemos enviado un nuevo código a tu email",
                      })
                    }}
                  >
                    ¿No recibiste el código? Reenviar
                  </Button>
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
                  </div>
                </div>

                <Separator />

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
                {step === 1 ? (
                  "Enviar código de verificación"
                ) : step === 2 ? (
                  "Verificar Email"
                ) : (
                  <>
                    <FaUserPlus className="mr-2" />
                    Crear Cuenta
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

