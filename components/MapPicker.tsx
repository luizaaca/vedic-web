"use client"

import { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import { LatLngExpression, LatLng } from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import "leaflet-defaulticon-compatibility"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface MapPickerProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onLocationSelect: (coords: { lat: number; lng: number }) => void
}

// Componente para lidar com eventos do mapa, como cliques e centralização automática
function MapController({ onMapClick }: { onMapClick: (latlng: LatLng) => void }) {
  const map = useMap()

  useMapEvents({
    click(e) {
      onMapClick(e.latlng)
    },
  })

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
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[80vw] md:max-w-[70vw] lg:max-w-[60vw] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Selecione a Localização no Mapa</DialogTitle>
          <DialogDescription>
            Clique no mapa para definir a latitude e longitude do local de nascimento.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow h-full w-full rounded-md overflow-hidden">
          <MapContainer center={initialCenter} zoom={4} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController onMapClick={handleMapClick} />
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