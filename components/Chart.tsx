"use client";
import React, {
  useEffect,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import { Chart as ChartLib } from "@astrodraw/astrochart";
import { toJpeg } from "html-to-image";

interface ChartProps {
  chartData: {
    ascendant: string;
    planets: Record<string, { degree: string; nakshatra: string; signIndex: number }>;
  };
  birthData: {
    fullName: string;
    birthDate: string;
    birthTime: string;
    latitude: string;
    longitude: string;
  };
}

export interface ChartHandle {
  downloadChart: () => void;
}

function toAstroChartFormat(chartData: ChartProps["chartData"]) {
   const asc = parseFloat(chartData.ascendant || "0");
   const ascSign = Math.floor(asc / 30);
   const ascStart = ascSign * 30;

   const cusps = Array.from(
      { length: 12 },
      (_, i) => (ascStart + i * 30) % 360
   );

   const planets: Record<string, number[]> = {};
   for (const [name, info] of Object.entries(chartData.planets)) {
      const deg = parseFloat(info.degree);
      if (!isNaN(deg)) {
         planets[name] = [deg];
      }
   }

   return { planets, cusps };
}

function formatDate(dateString: string) {
  if (!dateString) return "N/A";
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

const Chart = forwardRef<ChartHandle, ChartProps>(({ chartData, birthData }, ref) => {
  const data = useMemo(() => toAstroChartFormat(chartData), [chartData]);
  const chartContainerId = "astro-chart-container";
  const downloadableAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = document.getElementById(chartContainerId);
    if (container) {
      // Limpa o container para evitar múltiplos gráficos ao redesenhar
      container.innerHTML = "";
    }

    // Cria o gráfico dentro da div
    const chart = new ChartLib(chartContainerId, 400, 400);
    chart.radix(data);
  }, [data]);

  useImperativeHandle(ref, () => ({
    downloadChart: () => {
      if (!downloadableAreaRef.current) {
        console.error("Área do gráfico para download não encontrada.");
        alert("Erro: Não foi possível encontrar a área do gráfico para download.");
        return;
      }

      toJpeg(downloadableAreaRef.current, {
        quality: 1.0, // Qualidade máxima
        pixelRatio: 2, // Dobro da resolução para melhor qualidade em telas de alta densidade
        // A cor de fundo da div será usada, mas podemos forçar uma aqui se quisermos
        // backgroundColor: '#ffffff', 
      })
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.download = "mapa-astral.jpg";
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error("Oops, algo deu errado!", err);
          alert("Oops, algo deu errado ao tentar gerar a imagem!");
        });
    },
  }));

  return (
    // Esta div externa será a área capturada para o download
    <div ref={downloadableAreaRef} className="bg-gray-50 p-4 sm:p-6 rounded-lg">
      <div className="flex flex-col items-center gap-6">
        {/* Mapa Astral com borda */}
        <div className="flex justify-center items-center">
          <div className="p-2 rounded-full bg-gradient-to-br from-purple-200 via-indigo-200 to-blue-200 shadow-lg">
            <div className="bg-white rounded-full">
              <div id={chartContainerId} style={{ width: 400, height: 400 }} />
            </div>
          </div>
        </div>

        {/* Legenda com Dados de Nascimento */}
        <div className="w-full max-w-md bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-center text-gray-800 mb-3">
            Dados de Nascimento
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            {birthData.fullName && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-500">Nome:</span>
                <span>{birthData.fullName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-medium text-gray-500">Data e Hora:</span>
              <span>
                {formatDate(birthData.birthDate)} às {birthData.birthTime}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-500">Coordenadas:</span>
              <span>
                Lat: {parseFloat(birthData.latitude).toFixed(4)}, Lon: {parseFloat(birthData.longitude).toFixed(4)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

Chart.displayName = "Chart";

export default Chart;
