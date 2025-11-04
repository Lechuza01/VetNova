"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { FaRobot, FaUser, FaPaperPlane, FaTimes, FaComments } from "react-icons/fa"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hola! Soy el asistente virtual de VetNova. Puedo ayudarte con información sobre mascotas, turnos, tratamientos y más. ¿En qué puedo asistirte hoy?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const response = generateResponse(input)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1000)
  }

  const generateResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase()

    if (lowerQuery.includes("turno") || lowerQuery.includes("cita") || lowerQuery.includes("agendar")) {
      return "Para agendar un turno, ve al módulo de Turnos en el menú lateral. Allí podrás seleccionar la mascota, fecha y hora deseada. ¿Necesitas ayuda con algo más?"
    }

    if (lowerQuery.includes("vacuna") || lowerQuery.includes("vacunación")) {
      return "Las vacunas son fundamentales para la salud de las mascotas. Los perros necesitan vacunas contra rabia, parvovirus, moquillo y hepatitis. Los gatos requieren vacunas contra rabia, panleucopenia y calicivirus. ¿Quieres agendar una vacunación?"
    }

    if (lowerQuery.includes("precio") || lowerQuery.includes("costo") || lowerQuery.includes("cuánto")) {
      return "Los precios varían según el servicio. Consulta general: €40-60, Vacunación: €25-45, Cirugía: desde €150. Para información específica, contacta con recepción."
    }

    if (lowerQuery.includes("horario") || lowerQuery.includes("hora")) {
      return "Nuestro horario de atención es de Lunes a Viernes de 9:00 a 20:00, y Sábados de 9:00 a 14:00. Para emergencias fuera de horario, contamos con servicio de urgencias 24/7."
    }

    if (lowerQuery.includes("emergencia") || lowerQuery.includes("urgencia")) {
      return "En caso de emergencia, llama inmediatamente al +34 900 123 456. Si tu mascota presenta síntomas graves como dificultad para respirar, sangrado abundante, convulsiones o pérdida de consciencia, acude de inmediato a nuestra clínica."
    }

    if (lowerQuery.includes("alimentación") || lowerQuery.includes("comida") || lowerQuery.includes("dieta")) {
      return "Una alimentación balanceada es clave para la salud de tu mascota. Recomendamos alimento premium específico para su edad y tamaño. Evita darle comida humana, especialmente chocolate, uvas, cebolla y ajo. ¿Necesitas recomendaciones específicas?"
    }

    if (lowerQuery.includes("desparasitar") || lowerQuery.includes("parásito")) {
      return "La desparasitación debe realizarse cada 3 meses en perros y gatos adultos, y mensualmente en cachorros. Usamos productos de amplio espectro que eliminan parásitos internos y externos. ¿Quieres agendar una desparasitación?"
    }

    if (lowerQuery.includes("esterilizar") || lowerQuery.includes("castrar")) {
      return "La esterilización es recomendable entre los 6-12 meses de edad. Previene enfermedades reproductivas, reduce comportamientos agresivos y evita camadas no deseadas. Es una cirugía segura con recuperación rápida. ¿Necesitas más información?"
    }

    return "Entiendo tu consulta. Para información más específica, te recomiendo contactar directamente con nuestro equipo veterinario o agendar una consulta. ¿Hay algo más en lo que pueda ayudarte?"
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        <FaComments className="w-6 h-6" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[700px] shadow-2xl z-50 flex flex-col overflow-hidden">
      <CardHeader className="border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground p-2 rounded-full">
              <FaRobot className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Asistente Virtual</CardTitle>
              <CardDescription className="text-xs">Siempre disponible para ayudarte</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <FaTimes className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 flex flex-col overflow-hidden min-h-0">
        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full w-full">
            <div className="p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <FaRobot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "rounded-lg px-4 py-2 max-w-[80%]",
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                  )}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {message.role === "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-accent text-accent-foreground">
                      <FaUser className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <FaRobot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            </div>
          </ScrollArea>
        </div>

        <div className="border-t p-4 flex-shrink-0 bg-background z-10">
          <div className="flex gap-2">
            <Input
              placeholder="Escribe tu consulta..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              className="flex-1"
            />
            <Button onClick={handleSend} size="icon" disabled={!input.trim() || isTyping}>
              <FaPaperPlane className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setInput("¿Cómo agendar un turno?")
                handleSend()
              }}
              className="text-xs"
            >
              Agendar turno
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setInput("¿Cuándo vacunar a mi mascota?")
                handleSend()
              }}
              className="text-xs"
            >
              Vacunación
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setInput("¿Cuál es el horario?")
                handleSend()
              }}
              className="text-xs"
            >
              Horarios
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
