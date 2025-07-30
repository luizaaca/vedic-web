"use client";
import React, { useEffect, useMemo, forwardRef, useImperativeHandle, useRef, useState } from "react";
import Image from 'next/image';
import { Chart as ChartLib } from "@astrodraw/astrochart";
import { toJpeg } from "html-to-image";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { HOUSE_POSITION_STYLES, PLANET_SYMBOLS } from "@/lib/chart-constants";
import { JsonViewer } from "./JsonViewer";
import chartBackground from '../public/base-map.jpg';

interface ChartProps {
   chartData: {
      ascendant: string;
      planets: Record<
         string,
         { degree: string; nakshatra: string; signIndex: number }
      >;
   };
   birthData: {
      fullName: string;
      birthDate: string;
      birthTime: string;
      latitude: string;
      longitude: string;
   };
   tabIndex: number;
   onTabChange: (index: number) => void;
}

export interface ChartHandle {
   downloadChart: () => void;
}

// Função para agrupar planetas por casa (mantida a mesma lógica)
const getPlanetsByHouse = (planetsData) => {
  const planetsByHouse = {};
  for (let i = 1; i <= 12; i++) {
    planetsByHouse[i] = [];
  }

  for (const planetName in planetsData) {
    if (planetsData.hasOwnProperty(planetName)) {
      const { houseIndex } = planetsData[planetName];
      if (houseIndex) {
        planetsByHouse[houseIndex].push(PLANET_SYMBOLS[planetName]);
      }
    }
  }
  return planetsByHouse;
};

function toAstroChartFormat(chartData: ChartProps["chartData"]) {
   const asc = parseFloat(chartData.ascendant.degree || "0");
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

const Chart = forwardRef<ChartHandle, ChartProps>(
   ({ chartData, birthData, tabIndex, onTabChange }, ref) => {
      const data = useMemo(() => toAstroChartFormat(chartData), [chartData]);
      const chartContainerIdSigns = "astro-chart-container-signs";
      const chartContainerIdHouses = "astro-chart-container-houses";
      const downloadableAreaRef = useRef<HTMLDivElement>(null);
      const [planetsInHouses, setPlanetsInHouses] = useState(getPlanetsByHouse(chartData.planets));

      useEffect(() => {
        if (tabIndex === 0) {
            
          } else {
            const container = document.getElementById(chartContainerIdSigns);
            if (container) {
               container.innerHTML = "";
               const chart = new ChartLib(chartContainerIdSigns, 390, 390);
               chart.radix(data);
            }
         }
      }, [data, tabIndex]);

      useImperativeHandle(ref, () => ({
         downloadChart: () => {
            const element = downloadableAreaRef.current;
            if (!element) {
               console.error("Área do gráfico para download não encontrada.");
               alert(
                  "Erro: Não foi possível encontrar a área do gráfico para download."
               );
               return;
            }

            toJpeg(element, {
               quality: 1.0, // Qualidade máxima
               pixelRatio: 2, // Dobro da resolução para melhor qualidade em telas de alta densidade
            })
               .then((dataUrl) => {
                  // Verifica se está rodando dentro de um React Native WebView
                  if (window.ReactNativeWebView) {
                     // Envia os dados da imagem para o app nativo
                     window.ReactNativeWebView.postMessage(
                        JSON.stringify({
                           type: "DOWNLOAD_CHART_IMAGE",
                           payload: {
                              fileData: dataUrl,
                              fileName: "mapa-astral.jpg",
                              mimeType: "image/jpeg",
                           },
                        })
                     );
                  } else {
                     // Comportamento padrão para navegadores web
                     const link = document.createElement("a");
                     link.download = "mapa-astral.jpg";
                     link.href = dataUrl;
                     link.click();
                  }
               })
               .catch((err) => {
                  console.error("Oops, algo deu errado!", err);
                  alert("Oops, algo deu errado ao tentar gerar a imagem!");
               });
         },
      }));

      const birthDataView = (<div className="w-full max-w-md bg-white p-4 rounded-lg shadow-md border border-gray-200">
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
                           <span>{formatDate(birthData.birthDate)} às {birthData.birthTime}</span>
                        </div>
                        <div className="flex justify-between">
                           <span className="font-medium text-gray-500">Coordenadas:</span>
                           <span>
                              Lat: {parseFloat(birthData.latitude).toFixed(4)}, Lon: {parseFloat(birthData.longitude).toFixed(4)}
                           </span>
                        </div>
                     </div>
                  </div>);
      return (
      <Tabs selectedIndex={tabIndex} onSelect={onTabChange}>
         <TabList className="flex space-x-2 mb-6">
            <Tab className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 border border-gray-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
               ${tabIndex === 0 
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white/80 text-gray-600 hover:bg-gray-100'}`}>
               Gráfico Casas
            </Tab>
            <Tab className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 border border-gray-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
               ${tabIndex === 1 
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white/80 text-gray-600 hover:bg-gray-100'}`}>
               Gráfico Signos
            </Tab>
            <Tab className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 border border-gray-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
               ${tabIndex === 2 
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white/80 text-gray-600 hover:bg-gray-100'}`}>
               Dados
            </Tab>
         </TabList>

         <TabPanel>
            <div ref={tabIndex === 0 ? downloadableAreaRef : undefined} className="bg-white/80 p-6 rounded-xl border border-gray-200 text-center shadow-inner text-gray-600">
               <div className="flex flex-col items-center gap-6">
                  <div className="flex justify-center items-center">
                    <div id={chartContainerIdHouses} className="relative w-[400px] h-[400px]">
               <Image src={chartBackground} alt="Gráfico de Casas" className="absolute top-0 left-0 w-full h-full object-contain"/>
            {/* Overlay para cada Casa do Mapa */}
            {Object.keys(HOUSE_POSITION_STYLES).map((houseNum) => {
                const HousePlanets = planetsInHouses[houseNum];
                const positionStyle = HOUSE_POSITION_STYLES[houseNum];

                return (
                    <div
                        key={houseNum}
                        className="absolute flex items-center justify-center p-0.5" // Flexbox para centralizar astros dentro da casa
                        style={{
                            ...positionStyle, // top, left, width, height da casa
                            // backgroundColor: 'rgba(0, 0, 255, 0.1)', // ATIVE PARA DEPURAR POSIÇÕES
                        }}
                    >
                        {/* Renderiza os símbolos dos planetas */}
                        <div className="flex flex-row flex-wrap justify-center items-center gap-x-1"> 
                            {HousePlanets.map((planetSymbol, index) => (
                                // AQUI VOCÊ PODE SUBSTITUIR O SPAN POR UM COMPONENTE DE ÍCONE SVG/IMAGEM
                                <span 
                                    key={`${houseNum}-${planetSymbol}-${index}`} 
                                    className="text-sm font-bold text-gray-800" // Ajuste tamanho/cor do texto
                                >
                                    {planetSymbol}
                                </span>
                            ))}
                        </div>
                    </div>
                );
            })}
               </div>
               </div>
               {birthDataView}
               </div>
            </div>
         </TabPanel>

         <TabPanel>
            <div ref={tabIndex === 1 ? downloadableAreaRef : undefined} className="bg-white/80 p-6 rounded-xl border border-gray-200 text-center shadow-inner text-gray-600">
               <div className="flex flex-col items-center gap-6">
                  <div className="flex justify-center items-center">
                     <div className="p-1 rounded-full bg-gradient-to-br from-green-200 via-indigo-200 to-red-200 shadow-lg">
                        <div className="bg-white rounded-full">
                           <div id={chartContainerIdSigns} style={{ width: 390, height: 390 }} />
                        </div>
                     </div>
                  </div>  
                  {birthDataView}                
               </div>
            </div>
         </TabPanel>

         <TabPanel>
            <div className="bg-white/80 p-6 rounded-xl border border-gray-200 shadow-inner">               
               <JsonViewer data={chartData} />
            </div>
         </TabPanel>
      </Tabs>
);
});

Chart.displayName = "Chart";

export default Chart;
