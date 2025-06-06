"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, ChevronUp, Send, Calculator, MessageCircle } from "lucide-react"

interface BirthData {
  fullName: string
  birthDate: string
  birthTime: string
  timezone: string
  latitude: string
  longitude: string
}

interface ChatMessage {
  type: "user" | "ai"
  content: string
  timestamp: Date
}

export default function VedicAstrologyApp() {
  const [birthData, setBirthData] = useState<BirthData>({
    fullName: "",
    birthDate: "",
    birthTime: "",
    timezone: "",
    latitude: "",
    longitude: "",
  })

  const [chartResult, setChartResult] = useState<any>(null)
  const [isChartOpen, setIsChartOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [isChatLoading, setIsChatLoading] = useState(false)

  const handleInputChange = (field: keyof BirthData, value: string) => {
    setBirthData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const calculateChart = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: birthData.fullName || undefined,
          birthDate: birthData.birthDate,
          birthTime: birthData.birthTime,
          timezone: Number.parseFloat(birthData.timezone),
          latitude: Number.parseFloat(birthData.latitude),
          longitude: Number.parseFloat(birthData.longitude),
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setChartResult(result)
        setIsChartOpen(true)
      } else {
        console.error("Erro ao calcular mapa astral")
      }
    } catch (error) {
      console.error("Erro na requisição:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendQuestion = async () => {
    if (!currentQuestion.trim() || !chartResult) return

    const userMessage: ChatMessage = {
      type: "user",
      content: currentQuestion,
      timestamp: new Date(),
    }

    setChatMessages((prev) => [...prev, userMessage])
    setCurrentQuestion("")
    setIsChatLoading(true)

    try {
      const response = await fetch("/api/interpret", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: currentQuestion,
          chartData: chartResult,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        const aiMessage: ChatMessage = {
          type: "ai",
          content: result.interpretation || result.answer || "Resposta não disponível",
          timestamp: new Date(),
        }
        setChatMessages((prev) => [...prev, aiMessage])
      } else {
        console.error("Erro ao interpretar pergunta")
      }
    } catch (error) {
      console.error("Erro na requisição:", error)
    } finally {
      setIsChatLoading(false)
    }
  }

  const isFormValid =
    birthData.birthDate && birthData.birthTime && birthData.timezone && birthData.latitude && birthData.longitude

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Astrologia Védica</h1>
          <p className="text-gray-600">Calcule seu mapa astral védico e obtenha interpretações personalizadas</p>
        </div>

        {/* Formulário de Dados de Nascimento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Dados de Nascimento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="fullName">Nome Completo (Opcional)</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Seu nome completo"
                  value={birthData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="birthDate">Data de Nascimento *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={birthData.birthDate}
                  onChange={(e) => handleInputChange("birthDate", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="birthTime">Hora de Nascimento *</Label>
                <Input
                  id="birthTime"
                  type="time"
                  value={birthData.birthTime}
                  onChange={(e) => handleInputChange("birthTime", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="timezone">Fuso Horário *</Label>
                <Input
                  id="timezone"
                  type="number"
                  step="0.5"
                  placeholder="-3 (para Brasil)"
                  value={birthData.timezone}
                  onChange={(e) => handleInputChange("timezone", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="latitude">Latitude *</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  placeholder="-23.5505 (São Paulo)"
                  value={birthData.latitude}
                  onChange={(e) => handleInputChange("latitude", e.target.value)}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="longitude">Longitude *</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  placeholder="-46.6333 (São Paulo)"
                  value={birthData.longitude}
                  onChange={(e) => handleInputChange("longitude", e.target.value)}
                  required
                />
              </div>
            </div>

            <Button onClick={calculateChart} disabled={!isFormValid || isLoading} className="w-full" size="lg">
              {isLoading ? "Calculando..." : "Calcular Mapa Védico"}
            </Button>
          </CardContent>
        </Card>

        {/* Resultado do Mapa Astral */}
        {chartResult && (
          <Card>
            <Collapsible open={isChartOpen} onOpenChange={setIsChartOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <span>Resultado do Mapa Astral</span>
                    {isChartOpen ? <ChevronUp /> : <ChevronDown />}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <ScrollArea className="h-64 w-full rounded-md border p-4">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(chartResult, null, 2)}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        )}

        {/* Seção de Chat */}
        {chartResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Interpretação Personalizada
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Histórico de Mensagens */}
              {chatMessages.length > 0 && (
                <ScrollArea className="h-64 w-full rounded-md border p-4 space-y-4">
                  <div className="space-y-4">
                    {chatMessages.map((message, index) => (
                      <div key={index} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.type === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {/* Input de Pergunta */}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Faça uma pergunta sobre seu mapa astral védico..."
                  value={currentQuestion}
                  onChange={(e) => setCurrentQuestion(e.target.value)}
                  className="flex-1"
                  rows={2}
                />
                <Button
                  onClick={sendQuestion}
                  disabled={!currentQuestion.trim() || isChatLoading}
                  size="lg"
                  className="self-end"
                >
                  {isChatLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <p className="text-sm text-gray-500">
                Faça perguntas sobre planetas, casas, aspectos ou qualquer elemento do seu mapa astral védico.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
