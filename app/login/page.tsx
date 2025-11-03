"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { validateCredentials, generate2FACode } from "@/lib/auth"
import { useAuth } from "@/contexts/auth-context"
import { FaPaw, FaUser, FaLock, FaShieldAlt } from "react-icons/fa"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(false)
  const [show2FA, setShow2FA] = useState(false)
  const [code2FA, setCode2FA] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const generatedCodeRef = useRef<string>("")
  const router = useRouter()
  const { login } = useAuth()
  const { toast } = useToast()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const user = validateCredentials(username, password)

    if (user) {
      const code = generate2FACode()
      setGeneratedCode(code)
      generatedCodeRef.current = code
      setShow2FA(true)
      toast({
        title: "Código 2FA Generado",
        description: `Tu código de verificación es: ${code}`,
      })
    } else {
      toast({
        title: "Error de autenticación",
        description: "Usuario o contraseña incorrectos",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Limpiar espacios en blanco y comparar
    const cleanedCode = code2FA.trim().replace(/\D/g, "") // Solo números
    // Usar el ref si el estado está vacío (por si se perdió en un re-render)
    const codeToCompare = generatedCodeRef.current || generatedCode.trim()

    if (!cleanedCode) {
      toast({
        title: "Código requerido",
        description: "Por favor ingresa el código de verificación",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (cleanedCode === codeToCompare) {
      const user = validateCredentials(username, password)
      if (user) {
        if (remember) {
          localStorage.setItem("vetclinic_remember", "true")
        }
        login(user)
        toast({
          title: "Bienvenido",
          description: `Has iniciado sesión correctamente, ${user.name}`,
        })
        router.push("/dashboard")
      } else {
        toast({
          title: "Error",
          description: "No se pudo validar el usuario",
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "Código incorrecto",
        description: `El código ingresado no coincide. Código esperado: ${codeToCompare}`,
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary text-primary-foreground p-4 rounded-full">
              <FaPaw className="w-8 h-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">VetNova</CardTitle>
          <CardDescription>
            {show2FA ? "Ingresa el código de verificación" : "Inicia sesión en tu cuenta"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!show2FA ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Ingresa tu usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={(checked) => setRemember(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                  Recordar sesión
                </Label>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
              <div className="text-xs text-center text-muted-foreground mt-4">
                <p>Demo: admin / admin123 o veterinario / vet123</p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerify2FA} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code2fa">Código de 6 dígitos</Label>
                <div className="relative">
                  <FaShieldAlt className="absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    id="code2fa"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="000000"
                    value={code2FA}
                    onChange={(e) => {
                      // Solo permitir números
                      const value = e.target.value.replace(/\D/g, "")
                      if (value.length <= 6) {
                        setCode2FA(value)
                      }
                    }}
                    className="pl-10 text-center text-lg tracking-widest"
                    maxLength={6}
                    required
                  />
                </div>
              </div>
              <div className="flex flex-row gap-2 w-full">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => {
                    setShow2FA(false)
                    setCode2FA("")
                    generatedCodeRef.current = ""
                    setGeneratedCode("")
                  }}
                  disabled={isLoading}
                >
                  Volver
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Verificando..." : "Verificar"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
