"use client";

import React from 'react';

interface ChartProps {
  chartData: {
    ascendant: string;
    planets: {
      [key: string]: {
        degree: string;
        nakshatra: string;
        signIndex: number;
      };
    };
  };
}

interface PlanetData {
  name: string;
  degree: string;
  nakshatra: string;
  signIndex: number;
}

const housePositions = [
  [200, 20],   // 1 (Ascendente no topo)
  [270, 80],
  [270, 170],
  [200, 230],
  [130, 170],
  [130, 80],
  [60, 20],
  [20, 100],
  [60, 180],
  [130, 280],
  [200, 320],
  [270, 280],
];

const Chart: React.FC<ChartProps> = ({ chartData }) => {
  const { ascendant, planets } = chartData;
  const ascSign = Math.floor(parseFloat(ascendant) / 30);

  const planetsArray: PlanetData[] = React.useMemo(() => {
    return Object.entries(planets).map(([name, data]) => ({
      name,
      ...data,
    }));
  }, [planets]);

  const getHouse = (signIndex: number) =>
    (signIndex - ascSign + 12) % 12;

  const housePlanetMap: Record<number, string[]> = {};

  planetsArray.forEach((planet) => {
    const house = getHouse(planet.signIndex);
    if (!housePlanetMap[house]) housePlanetMap[house] = [];
    housePlanetMap[house].push(planet.name);
  });

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="400"
      height="400"
      viewBox="0 0 400 400"
    >
      {/* Background */}
      <rect x="0" y="0" width="400" height="400" fill="#fdfcf8" stroke="#000" />

      {/* Draw diagonal pattern of North Indian chart */}
      <polygon points="200,0 400,200 200,400 0,200" fill="none" stroke="black" />
      <line x1="0" y1="200" x2="400" y2="200" stroke="black" />
      <line x1="200" y1="0" x2="200" y2="400" stroke="black" />
      <line x1="0" y1="0" x2="400" y2="400" stroke="black" />
      <line x1="0" y1="400" x2="400" y2="0" stroke="black" />

      {/* Houses */}
      {housePositions.map(([x, y], idx) => {
        const planets = housePlanetMap[idx] || [];
        return (
          <g key={idx}>
            <text
              x={x}
              y={y}
              fontSize="12"
              fill="#333"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {planets.join(', ')}
            </text>
            {/* Opcional: número da casa */}
            {/* <text x={x} y={y + 12} fontSize="10" fill="gray" textAnchor="middle">{idx + 1}</text> */}
          </g>
        );
      })}
    </svg>
  );
};

export default Chart;
