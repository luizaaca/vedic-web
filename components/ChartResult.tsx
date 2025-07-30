"use client"

import React, { forwardRef, useState } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp, Download } from "lucide-react"
import type { ChartHandle } from "@/components/Chart"

const Chart = dynamic(() => import("@/components/Chart"), { ssr: false })

interface ChartResultProps {
  chartResult: any
  birthData: any
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export const ChartResult = forwardRef<HTMLDivElement, ChartResultProps>(
  ({ chartResult, birthData, isOpen, onOpenChange }, ref) => {
    const chartComponentRef = React.useRef<ChartHandle>(null)
    const [tabIndex, setTabIndex] = useState(0)

    const handleDownloadClick = (e: React.MouseEvent) => {
      e.stopPropagation()
      if (isDownloadDisabled) {
        e.preventDefault() // Garante que nenhuma ação padrão ocorra.
        return
      }
      chartComponentRef.current?.downloadChart()
    }

    // A aba "Dados" é a de índice 2, então o download deve ser desativado.
    const isDownloadDisabled = tabIndex === 2

    return (
      <Card ref={ref}>
        <Collapsible open={isOpen} onOpenChange={onOpenChange}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors rounded-t-lg">
              <CardTitle className="flex items-center justify-between">
                <span>Resultado do Mapa Astral</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDownloadClick}
                    aria-label="Baixar mapa como imagem"
                    aria-disabled={isDownloadDisabled}
                    className={isDownloadDisabled ? "opacity-50" : ""}
                  >
                    <Download className="w-5 h-5" />
                  </Button>
                  {isOpen ? <ChevronUp /> : <ChevronDown />}
                </div>
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-4">
              <Chart
                ref={chartComponentRef}
                chartData={chartResult}
                birthData={birthData}
                tabIndex={tabIndex}
                onTabChange={setTabIndex}
              />
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    )
  }
)

ChartResult.displayName = "ChartResult"
