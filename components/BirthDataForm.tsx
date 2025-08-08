"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calculator, Loader2, Map, RotateCcw } from "lucide-react"

export interface BirthData {
  fullName: string
  birthDate: string
  birthTime: string
  timezone: string
  latitude: string
  longitude: string
}

interface Timezone {
  value: string
  label: string
}

export interface BirthDataFormProps {
  birthData: BirthData
  timezones: Timezone[]
  isFormValid: boolean
  isLoading: boolean
  // eslint-disable-next-line no-unused-vars
  onInputChange: (field: keyof BirthData, value: string) => void
  onCalculate: () => void
  onReset: () => void
  onOpenMap: () => void
}

export function BirthDataForm({
  birthData,
  timezones,
  isFormValid,
  isLoading,
  onInputChange,
  onCalculate,
  onReset,
  onOpenMap,
}: BirthDataFormProps) {
  return (
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
              onChange={(e) => onInputChange("fullName", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="birthDate">Data de Nascimento</Label>
            <Input
              id="birthDate"
              type="date"
              value={birthData.birthDate}
              onChange={(e) => onInputChange("birthDate", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="birthTime">Hora de Nascimento</Label>
            <Input
              id="birthTime"
              type="time"
              value={birthData.birthTime}
              onChange={(e) => onInputChange("birthTime", e.target.value)}
              required
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="timezone">Fuso Horário</Label>
            <Select
              value={birthData.timezone}
              onValueChange={(value) => onInputChange("timezone", value)}
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
            <Button type="button" variant="outline" size="sm" onClick={onOpenMap}>
              <Map className="w-4 h-4 mr-2" />
              Selecionar no Mapa
            </Button>
          </div>

          <div>
            <Label htmlFor="latitude">Latitude</Label>
            <Input id="latitude" type="number" step="any" placeholder="-23.5505 (São Paulo)" value={birthData.latitude} onChange={(e) => onInputChange("latitude", e.target.value)} required />
          </div>

          <div>
            <Label htmlFor="longitude">Longitude</Label>
            <Input id="longitude" type="number" step="any" placeholder="-46.6333 (São Paulo)" value={birthData.longitude} onChange={(e) => onInputChange("longitude", e.target.value)} required />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button onClick={onReset} variant="outline" className="w-full sm:w-auto">
            <RotateCcw className="w-4 h-4 mr-2" />
            Resetar
          </Button>
          <Button onClick={onCalculate} disabled={!isFormValid || isLoading} className="w-full" size="lg">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Calculator className="w-5 h-5 mr-2" />}
            {isLoading ? "Calculando..." : "Calcular Mapa Védico"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
