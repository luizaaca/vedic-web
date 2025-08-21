'use client';
import React, {
  useEffect,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import Image from 'next/image';
import { Chart as ChartLib } from '@astrodraw/astrochart';
import { toJpeg } from 'html-to-image';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { HOUSE_POSITION_STYLES } from '@/lib/chart-constants';
import { JsonViewer } from './JsonViewer';
import chartBackground from '../public/base-map.jpg';
import PlanetIcon from './PlanetIcon';
import { useIsMobile } from '@/hooks/use-mobile';
import type { ChartResultData } from '@/app/api/calculate/types';

export interface ChartProps {
  chartResult: ChartResultData;
  birthData: {
    fullName: string;
    birthDate: string;
    birthTime: string;
    latitude: string;
    longitude: string;
  };
  //ref: any;
  tabIndex: number;
  onTabChange: (index: number) => void;
}
export interface ChartHandle {
  downloadChart: () => void;
}

function toAstroChartFormat(chartData: ChartResultData) {
  // As cúspides agora estão diretamente disponíveis nos dados das casas
  const cusps = chartData.houses
    .sort((a, b) => a.houseNumber - b.houseNumber)
    .map((house) => parseFloat(house.startDegree));

  const planets: Record<string, [number]> = {};

  // Itera através das casas e seus planetas
  chartData.houses.forEach((house) => {
    house.planets.forEach((planet) => {
      const deg = parseFloat(planet.degree);
      if (!isNaN(deg)) {
        // A biblioteca astrochart usa NNode para Rahu e SNode para Ketu
        const planetNameForChart =
          planet.planetName === 'Rahu'
            ? 'NNode'
            : planet.planetName === 'Ketu'
              ? 'SNode'
              : planet.planetName;
        // A biblioteca espera um array com o grau e, opcionalmente, a velocidade
        planets[planetNameForChart] = [deg];
      }
    });
  });

  return { planets, cusps };
}

function formatDate(dateString: string) {
  if (!dateString) return 'N/A';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

const Chart = forwardRef<ChartHandle, ChartProps>(
  ({ chartResult, birthData, tabIndex, onTabChange }, ref) => {
    const data = useMemo(() => toAstroChartFormat(chartResult), [chartResult]);
    const isMobile = useIsMobile();
    const chartContainerIdSigns = 'astro-chart-container-signs';
    const chartContainerIdHouses = 'astro-chart-container-houses';
    const downloadableAreaRef = useRef<HTMLDivElement>(null);
    const signsChartContainerRef = useRef<HTMLDivElement>(null);
    const [signsChartSize, setSignsChartSize] = useState(0);
    const planetsInHouses = useMemo(() => {
      const byHouse: { [key: number]: string[] } = {};
      for (let i = 1; i <= 12; i++) {
        byHouse[i] = [];
      }
      chartResult.houses.forEach((house) => {
        byHouse[house.houseNumber] = house.planets
          .map((p) => p.planetName)
          .filter(Boolean);
      });
      return byHouse;
    }, [chartResult.houses]);

    useEffect(() => {
      // Observes the container for the "Gráfico Signos" and updates its size
      // state. This makes the chart responsive to layout changes (e.g., resize).
      const container = signsChartContainerRef.current;
      if (tabIndex !== 1 || !container) {
        return;
      }

      const resizeObserver = new ResizeObserver(() => {
        setSignsChartSize(container.clientWidth);
      });

      resizeObserver.observe(container);

      // Cleanup observer on component unmount or when tab changes
      return () => {
        resizeObserver.disconnect();
      };
    }, [tabIndex]);

    useEffect(() => {
      // This effect draws the "Gráfico Signos" whenever its size changes.
      if (tabIndex === 1 && signsChartSize > 0) {
        const chartElement = document.getElementById(chartContainerIdSigns);
        if (chartElement) {
          chartElement.innerHTML = ''; // Clear previous chart to prevent duplicates
          const chart = new ChartLib(
            chartContainerIdSigns,
            signsChartSize,
            signsChartSize
          );
          chart.radix(data);
        }
      }
    }, [data, tabIndex, signsChartSize]);

    useImperativeHandle(ref, () => ({
      downloadChart: () => {
        const element = downloadableAreaRef.current;
        if (!element) {
          console.error('Área do gráfico para download não encontrada.');
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
                  type: 'DOWNLOAD_CHART_IMAGE',
                  payload: {
                    fileData: dataUrl,
                    fileName: 'mapa-astral.jpg',
                    mimeType: 'image/jpeg',
                  },
                })
              );
            } else {
              // Comportamento padrão para navegadores web
              const link = document.createElement('a');
              link.download = 'mapa-astral.jpg';
              link.href = dataUrl;
              link.click();
            }
          })
          .catch((err) => {
            console.error('Oops, algo deu errado!', err);
          });
      },
    }));

    const birthDataView = (
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
              Lat: {parseFloat(birthData.latitude).toFixed(4)}, Lon:{' '}
              {parseFloat(birthData.longitude).toFixed(4)}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className="font-medium text-gray-500">Ascendente:</span>
            <span>{chartResult.ascendant.degree}º em {chartResult.ascendant.sign}
            </span>
          </div>
        </div>
      </div>
    );
    const tabs = [
      { label: 'Gráfico Casas', index: 0 },
      { label: 'Gráfico Signos', index: 1 },
      { label: 'Dados', index: 2 },
    ].filter(tab => !(isMobile && tab.label === 'Gráfico Signos'));

    return (
      <>
        <Tabs selectedIndex={tabIndex} onSelect={onTabChange}>
          <TabList className="flex gap-2 mb-6 pb-2">
            {tabs.map(({ label, index }) => (
              <Tab
                key={index}
                className={`whitespace-nowrap px-4 sm:px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 border border-gray-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                ${
                  tabIndex === index
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                    : 'bg-gradient-to-r from-white to-gray-100 text-gray-700 hover:shadow-md hover:from-gray-50 hover:to-gray-200'
                }`}
              >
                {label}
              </Tab>
            ))}
          </TabList>

          <TabPanel>
            <div
              ref={tabIndex === 0 ? downloadableAreaRef : undefined}
              className="bg-white/80 p-6 rounded-xl border border-gray-200 text-center shadow-inner text-gray-600"
            >
              <div className="flex flex-col items-center gap-6">
                <div className="flex w-full justify-center items-center">
                  <div
                    id={chartContainerIdHouses}
                    className="relative w-full max-w-[400px] aspect-square"
                  >
                    <Image
                      src={chartBackground}
                      alt="Gráfico de Casas"
                      className="absolute top-0 left-0 w-full h-full object-contain"
                    />
                    {/* Overlay para cada Casa do Mapa */}
                    {Object.keys(HOUSE_POSITION_STYLES).map((houseNum: any) => {
                      const HousePlanets = planetsInHouses[houseNum];
                      const positionStyle = HOUSE_POSITION_STYLES[houseNum];
                      console.log(`House ${houseNum} planets:`, HousePlanets);
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
                          {HousePlanets.length > 0 && (
                            <div className="flex flex-row  justify-center items-center gap-x-1 px-2 py-1 rounded-lg">
                              {HousePlanets.map(
                                (planetName: string, index: any) => (
                                  <div
                                    key={`${houseNum}-${planetName}-${index}`}
                                    data-tooltip-id="planet-tooltip"
                                    data-tooltip-content={`**${planetName}**: house ${houseNum} at ${chartResult.houses[houseNum-1].planets[index].degree}º`}
                                    data-tooltip-place="top"
                                    className="cursor-pointer"
                                  >
                                    <PlanetIcon
                                      planetName={planetName}
                                      className="w-8 h-8 bg-yellow-400/90 rounded-lg p-1"
                                    />
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                {birthDataView}
              </div>
            </div>
          </TabPanel>

          {!isMobile && <TabPanel>
            <div
              ref={tabIndex === 1 ? downloadableAreaRef : undefined}
              className="bg-white/80 p-6 rounded-xl border border-gray-200 text-center shadow-inner text-gray-600"
            >
              <div className="flex flex-col items-center gap-6">
                <div className="flex w-full justify-center items-center">
                  <div
                    ref={signsChartContainerRef}
                    className="relative w-full max-w-[390px] aspect-square p-0.5 rounded-full bg-gradient-to-br from-green-200 via-indigo-200 to-red-200 shadow-lg"
                  >
                    <div className="bg-white rounded-full w-full h-full">
                      {/* The chart library will draw inside this div */}
                      <div id={chartContainerIdSigns} className="w-full h-full" />
                    </div>
                  </div>
                </div>
                {birthDataView}
              </div>
            </div>
          </TabPanel>}

          <TabPanel>
            <div className="bg-white/80 rounded-xl border border-gray-200 shadow-inner overflow-hidden max-h-[550px] overflow-y-auto">
                <JsonViewer data={chartResult} />
            </div>
          </TabPanel>
        </Tabs>
        <Tooltip id="planet-tooltip" />
      </>
    );
  }
);

Chart.displayName = 'Chart';

export default Chart;
