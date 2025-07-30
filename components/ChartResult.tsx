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
import { Check, ChevronDown, ChevronUp, Copy, Download } from "lucide-react"
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
    const [tabIndex, setTabIndex] = useState(0);
    const [isCopied, setIsCopied] = useState(false);

    const handleDownloadOrCopyClick = async (e: React.MouseEvent) => {
      e.stopPropagation();

      // Se a aba "Dados" estiver ativa, copia o JSON.
      if (tabIndex === 2) {
        try {
          await navigator.clipboard.writeText(
            JSON.stringify(chartResult, null, 2)
          );
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000); // Reseta o ícone após 2s
        } catch (err) {
          console.error("Falha ao copiar os dados:", err);
          alert("Não foi possível copiar os dados para a área de transferência.");
        }
        return;
      }

      // Caso contrário, aciona o download do gráfico.
      chartComponentRef.current?.downloadChart();
    };

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
                    onClick={handleDownloadOrCopyClick}
                    aria-label={
                      tabIndex === 2
                        ? "Copiar dados do mapa"
                        : "Baixar mapa como imagem"
                    }
                  >
                    {isCopied ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : tabIndex === 2 ? (
                      <Copy className="w-5 h-5" />
                    ) : (
                      <Download className="w-5 h-5" />
                    )}
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
