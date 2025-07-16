"use client";
import React, { useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { Chart as ChartLib } from "@astrodraw/astrochart";

interface ChartProps {
   chartData: {
      ascendant: string;
      planets: Record<string, { degree: string; nakshatra: string; signIndex: number }>;
   };
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

const Chart: React.FC<ChartProps> = ({ chartData }) => {
   const data = useMemo(() => toAstroChartFormat(chartData), [chartData]);

   useEffect(() => {
      // Cria o gráfico dentro da div
      const chart = new ChartLib("chart", 400, 400);
      const radix = chart.radix(data);
      //const transit = radix.transit(data);
   }, [data]);

   return (
      <div className="flex justify-center">
         <div id="chart" style={{ width: 400, height: 400 }} />
      </div>
   );
};

export default Chart;
