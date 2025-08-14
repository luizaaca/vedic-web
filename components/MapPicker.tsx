"use client"

import { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import { LatLngExpression, LatLng } from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import "leaflet-defaulticon-compatibility"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface Suggestion {
  display_name: string
  lat: string
  lon: string
}

interface MapPickerProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onLocationSelect: (coords: { lat: number; lng: number }) => void
}

// Componente para lidar com eventos do mapa, como cliques e centralização automática
function MapController({ onMapClick, setMapInstance }: { onMapClick: (latlng: LatLng) => void, setMapInstance: (map: any) => void }) {
  const map = useMap()

  useMapEvents({
    click(e) {
      onMapClick(e.latlng)
    },
  })

  useEffect(() => {
    setMapInstance(map)
  }, [map, setMapInstance])

  useEffect(() => {
    // Tenta obter a localização do usuário e centralizar o mapa
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        map.setView([latitude, longitude], 13) // Zoom mais apropriado para uma cidade
      },
      (error) => {
        console.warn(`Erro ao obter geolocalização: ${error.message}. Usando localização padrão.`)
        // Se falhar, o mapa permanecerá no centro inicial (Brasil)
      },
    )
  }, [map])

  return null
}

export function MapPicker({ isOpen, onOpenChange, onLocationSelect }: MapPickerProps) {
  const [selectedPosition, setSelectedPosition] = useState<LatLng | null>(null)
  const initialCenter: LatLngExpression = [-14.235, -51.9253] // Centro do Brasil
  const [search, setSearch] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [mapInstance, setMapInstance] = useState<any>(null)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleConfirm = () => {
    if (selectedPosition) {
      onLocationSelect({ lat: selectedPosition.lat, lng: selectedPosition.lng })
      onOpenChange(false)
    }
  }

  const handleMapClick = (latlng: LatLng) => {
    setSelectedPosition(latlng)
  }

  // Reseta a posição quando o modal abre
  useEffect(() => {
    if (isOpen) {
      setSelectedPosition(null)
      setSearch("")
      setSearchError(null)
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [isOpen])

  // Autocomplete: busca sugestões a partir de 3 caracteres
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current)
    if (search.trim().length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    debounceTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}&accept-language=pt&addressdetails=1&limit=5`
        )
        const data = await res.json()
        setSuggestions(data)
        setShowSuggestions(true)
      } catch {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 400)
    return () => { debounceTimeout.current && clearTimeout(debounceTimeout.current) }
  }, [search])

  // Busca e centraliza no mapa ao clicar na lupa ou pressionar Enter
  const handleSearch = async () => {
    if (!search.trim()) return
    setIsSearching(true)
    setSearchError(null)
    setShowSuggestions(false)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}&accept-language=pt&limit=1`
      )
      const data = await res.json()
      if (data && data.length > 0) {
        const { lat, lon } = data[0]
        const latNum = parseFloat(lat)
        const lonNum = parseFloat(lon)
        setSelectedPosition(new LatLng(latNum, lonNum))
        if (mapInstance) {
          mapInstance.setView([latNum, lonNum], 13)
        }
      } else {
        setSearchError("Local não encontrado.")
      }
    } catch {
      setSearchError("Erro ao buscar local.")
    } finally {
      setIsSearching(false)
    }
  }

  // Ao selecionar sugestão
  const handleSuggestionClick = (suggestion: Suggestion) => {
    setSearch(suggestion.display_name)
    setShowSuggestions(false)
    setSuggestions([])
    const latNum = parseFloat(suggestion.lat)
    const lonNum = parseFloat(suggestion.lon)
    setSelectedPosition(new LatLng(latNum, lonNum))
    if (mapInstance) {
      mapInstance.setView([latNum, lonNum], 13)
    }
    // Mantém o foco no input
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }

  // Enter faz busca
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSearch()
    }
    if (e.key === "ArrowDown" && suggestions.length > 0) {
      e.preventDefault()
      setShowSuggestions(true)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[80vw] md:max-w-[70vw] lg:max-w-[60vw] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Selecione a Localização no Mapa</DialogTitle>
          <DialogDescription>
            Clique no mapa ou pesquise para definir a latitude e longitude do local de nascimento.
          </DialogDescription>
        </DialogHeader>
        {/* Barra de pesquisa com autocomplete */}
        <div className="relative mb-2">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Digite o nome da cidade, endereço, etc..."
              value={search}
              onChange={e => {
                setSearch(e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true)
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onKeyDown={handleInputKeyDown}
              disabled={isSearching}
              autoComplete="off"
            />
            <Button
              type="button"
              disabled={isSearching || !search.trim()}
              variant="secondary"
              onClick={handleSearch}
              tabIndex={-1}
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 top-full z-[9999] w-full bg-white border border-gray-200 rounded shadow mt-1 max-h-48 overflow-auto">
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                  onMouseDown={() => handleSuggestionClick(s)}
                >
                  {s.display_name}
                </div>
              ))}
            </div>
          )}
        </div>
        {searchError && <div className="text-red-500 text-xs mb-2">{searchError}</div>}
        <div className="flex-grow h-full w-full rounded-md overflow-hidden">
          <MapContainer center={initialCenter} zoom={4} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController onMapClick={handleMapClick} setMapInstance={setMapInstance} />
            {selectedPosition && <Marker position={selectedPosition}></Marker>}
          </MapContainer>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={!selectedPosition}>Confirmar Localização</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}