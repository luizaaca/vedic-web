"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
//import Chart from "@/components/Chart"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  ChevronDown,
  ChevronUp,
  Send,
  Calculator,
  MessageCircle,
  Copy,
  Check,
  RotateCcw,
  Loader2,
  User,
  Sparkles,
  Map,
} from "lucide-react"

// Importa o MapPicker dinamicamente para garantir que ele seja renderizado apenas no cliente (SSR false)
const MapPicker = dynamic(
  () => import("@/components/MapPicker").then((mod) => mod.MapPicker),
  { ssr: false, loading: () => <p>Carregando mapa...</p> }
)
const Chart = dynamic(() => import("@/components/Chart"), { ssr: false })

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

const timezones = [
  { value: "-12", label: "(GMT-12:00) Linha Internacional de Data Oeste" },
  { value: "-11", label: "(GMT-11:00) Horário Universal Coordenado-11" },
  { value: "-10", label: "(GMT-10:00) Havaí" },
  { value: "-9.5", label: "(GMT-09:30) Ilhas Marquesas" },
  { value: "-9", label: "(GMT-09:00) Alasca" },
  { value: "-8", label: "(GMT-08:00) Horário do Pacífico (EUA e Canadá)" },
  { value: "-7", label: "(GMT-07:00) Horário das Montanhas (EUA e Canadá)" },
  { value: "-6", label: "(GMT-06:00) Horário Central (EUA e Canadá), Cidade do México" },
  { value: "-5", label: "(GMT-05:00) Horário do Leste (EUA e Canadá), Bogotá, Lima" },
  { value: "-4", label: "(GMT-04:00) Horário do Atlântico (Canadá), Manaus" },
  { value: "-3.5", label: "(GMT-03:30) Newfoundland" },
  { value: "-3", label: "(GMT-03:00) Brasília, Buenos Aires, Groenlândia" },
  { value: "-2", label: "(GMT-02:00) Meio-Atlântico" },
  { value: "-1", label: "(GMT-01:00) Açores, Ilhas de Cabo Verde" },
  { value: "0", label: "(GMT+00:00) Horário da Europa Ocidental, Londres, Lisboa" },
  { value: "1", label: "(GMT+01:00) Bruxelas, Copenhague, Madri, Paris" },
  { value: "2", label: "(GMT+02:00) Kaliningrado, África do Sul" },
  { value: "3", label: "(GMT+03:00) Bagdá, Riad, Moscou, São Petersburgo" },
  { value: "3.5", label: "(GMT+03:30) Teerã" },
  { value: "4", label: "(GMT+04:00) Abu Dhabi, Mascate, Baku, Tbilisi" },
  { value: "4.5", label: "(GMT+04:30) Cabul" },
  { value: "5", label: "(GMT+05:00) Ecaterimburgo, Islamabad, Karachi, Tashkent" },
  { value: "5.5", label: "(GMT+05:30) Mumbai, Calcutá, Chennai, Nova Deli" },
  { value: "5.75", label: "(GMT+05:45) Katmandu" },
  { value: "6", label: "(GMT+06:00) Almaty, Daca, Colombo" },
  { value: "6.5", label: "(GMT+06:30) Yangon (Rangoon)" },
  { value: "7", label: "(GMT+07:00) Bangkok, Hanói, Jacarta" },
  { value: "8", label: "(GMT+08:00) Pequim, Perth, Singapura, Hong Kong" },
  { value: "8.75", label: "(GMT+08:45) Eucla" },
  { value: "9", label: "(GMT+09:00) Tóquio, Seul, Osaka, Sapporo, Yakutsk" },
  { value: "9.5", label: "(GMT+09:30) Adelaide, Darwin" },
  { value: "10", label: "(GMT+10:00) Leste da Austrália, Guam, Vladivostok" },
  { value: "10.5", label: "(GMT+10:30) Ilha de Lord Howe" },
  { value: "11", label: "(GMT+11:00) Magadan, Ilhas Salomão, Nova Caledônia" },
  { value: "12", label: "(GMT+12:00) Auckland, Wellington, Fiji, Kamchatka" },
  { value: "12.75", label: "(GMT+12:45) Ilhas Chatham" },
  { value: "13", label: "(GMT+13:00) Nuku'alofa" },
  { value: "14", label: "(GMT+14:00) Kiribati" },
]

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
  const [isCopied, setIsCopied] = useState(false)
  const [isChartSectionOpen, setIsChartSectionOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isMapOpen, setIsMapOpen] = useState(false)

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [isChatLoading, setIsChatLoading] = useState(false)

  const handleInputChange = (field: keyof BirthData, value: string) => {
    setBirthData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleLocationSelect = (coords: { lat: number; lng: number }) => {
    setBirthData((prev) => ({
      ...prev,
      latitude: coords.lat.toFixed(6), // 6 casas decimais para boa precisão
      longitude: coords.lng.toFixed(6),
    }))
  }

  useEffect(() => {
    // Preenche o fuso horário automaticamente se estiver vazio
    if (!birthData.timezone) {
      try {
        const offsetInMinutes = new Date().getTimezoneOffset()
        const offsetInHours = -(offsetInMinutes / 60)
        handleInputChange("timezone", offsetInHours.toString())
      } catch (error) {
        console.error("Erro ao detectar fuso horário automaticamente:", error)
      }
    }
  }, []) // O array vazio garante que isso rode apenas uma vez, ao montar o componente

  const getInitialInterpretation = async (chartData: any) => {
    setIsChatLoading(true)
    const defaultQuestion = "Faça um resumo deste mapa astral, destacando os pontos mais importantes como o ascendente, a lua e o sol."

    try {
      const response = await fetch("/api/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: defaultQuestion,
          chartData: chartData,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        const aiMessage: ChatMessage = {
          type: "ai",
          content: result.interpretation || "Não foi possível gerar a interpretação inicial.",
          timestamp: new Date(),
        }
        setChatMessages([aiMessage])
      } else {
        console.error("Erro ao obter interpretação inicial.")
      }
    } catch (error) {
      console.error("Erro na requisição de interpretação:", error)
    } finally {
      setIsChatLoading(false)
    }
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
        setIsChartSectionOpen(true)
        getInitialInterpretation(result)
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

  const handleReset = () => {
    setBirthData({
      fullName: "",
      birthDate: "1985-11-16",
      birthTime: "07:00",
      timezone: "-3",
      latitude: "-23.5505",
      longitude: "-46.6333",
    })
    setChartResult(null)
    setChatMessages([])
    setCurrentQuestion("")
    setIsChartSectionOpen(false)
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center py-4 md:py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Astrologia Védica</h1>
          <p className="text-gray-600">Calcule seu mapa astral védico e obtenha interpretações personalizadas</p>
        </div>

        {/* Formulário de Dados de Nascimento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-6 h-6 text-indigo-600" />
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
                <Label htmlFor="birthDate">Data de Nascimento</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={birthData.birthDate}
                  onChange={(e) => handleInputChange("birthDate", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="birthTime">Hora de Nascimento</Label>
                <Input
                  id="birthTime"
                  type="time"
                  value={birthData.birthTime}
                  onChange={(e) => handleInputChange("birthTime", e.target.value)}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="timezone">Fuso Horário</Label>
                <Select
                  value={birthData.timezone}
                  onValueChange={(value) => handleInputChange("timezone", value)}
                  required
                >
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Selecione o fuso horário..." />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 flex items-center justify-between border-t pt-4 mt-4">
                <p className="text-sm text-gray-600">Não sabe as coordenadas?</p>
                <Button type="button" variant="outline" size="sm" onClick={() => setIsMapOpen(true)}>
                  <Map className="w-4 h-4 mr-2" />
                  Selecionar no Mapa
                </Button>
              </div>

              <div>
                <Label htmlFor="latitude">Latitude</Label>
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

              <div>
                <Label htmlFor="longitude">Longitude</Label>
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

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button onClick={handleReset} variant="outline" className="w-full sm:w-auto">
                <RotateCcw className="w-4 h-4 mr-2" />
                Resetar
              </Button>
              <Button onClick={calculateChart} disabled={!isFormValid || isLoading} className="w-full" size="lg">
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Calculator className="w-5 h-5 mr-2" />
                )}
                {isLoading ? "Calculando..." : "Calcular Mapa Védico"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultado do Mapa Astral */}
        {chartResult && (
          <Card>
            <Collapsible open={isChartSectionOpen} onOpenChange={setIsChartSectionOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors rounded-t-lg">
                  <CardTitle className="flex items-center justify-between">
                    <span>Resultado do Mapa Astral</span>
                    {isChartSectionOpen ? <ChevronUp /> : <ChevronDown />}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-4">                  
                  <Chart chartData={chartResult} />
                </CardContent>
              </CollapsibleContent>
             </Collapsible>
          </Card>
        )}
        {chartResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-indigo-600" />
                Interpretação Personalizada
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-80 w-full rounded-md border p-4">
                <div className="space-y-4">
                  {chatMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.type === "ai" && (
                        <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100">
                          <Sparkles className="w-5 h-5 text-indigo-600" />
                        </span>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg p-3 text-sm ${
                          message.type === "user"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-900 whitespace-pre-wrap"
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>{message.timestamp.toLocaleTimeString()}</p>
                      </div>
                      {message.type === "user" && (
                        <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-gray-200">
                          <User className="w-5 h-5 text-gray-600" />
                        </span>
                      )}
                    </div>
                  ))}
                  {isChatLoading && chatMessages.length > 0 && (
                    <div className="flex items-start gap-3 justify-start">
                       <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100">
                          <Sparkles className="w-5 h-5 text-indigo-600" />
                        </span>
                      <div className="bg-gray-100 text-gray-900 rounded-lg p-3 flex items-center space-x-2">
                         <Loader2 className="w-4 h-4 animate-spin" />
                         <span>Analisando...</span>
                      </div>
                    </div>
                  )}
                </div>
                <ScrollBar />
              </ScrollArea>

              <div className="flex items-start gap-2 pt-2">
                <Textarea
                  placeholder="Faça outra pergunta sobre seu mapa..."
                  value={currentQuestion}
                  onChange={(e) => setCurrentQuestion(e.target.value)}
                  className="flex-1 resize-none"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendQuestion();
                    }
                  }}
                />
                <Button onClick={sendQuestion} disabled={!currentQuestion.trim() || isChatLoading} size="icon" className="h-full">
                  {isChatLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span className="sr-only">Enviar Pergunta</span>
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center pt-2">
                Você pode perguntar sobre planetas, casas, aspectos ou qualquer elemento do seu mapa.
              </p>
            </CardContent>
              
          </Card>
        )}
      </div>
    </div>
      <MapPicker
        isOpen={isMapOpen}
        onOpenChange={setIsMapOpen}
        onLocationSelect={handleLocationSelect}
      />
    </>
  )
}
