export const PLANET_SYMBOLS: Record<string, string> = {
  Sun: 'Su', Moon: 'Mo', Mercury: 'Me', Venus: 'Ve', Mars: 'Ma',
  Jupiter: 'Ju', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke',
};

export const HOUSE_POSITION_STYLES: Record<number, { top: string; left: string; width: string; height: string; }> = {
    // top/left/width/height em porcentagens do contêiner do gráfico
    1: { top: '18%', left: '38%', width: '24%', height: '15%' },
    2: { top: '5%', left: '17%', width: '20%', height: '15%' },
    3: { top: '21%', left: '2%', width: '20%', height: '15%' },
    4: { top: '44%', left: '17%', width: '20%', height: '15%' },
    5: { top: '68%', left: '2%', width: '20%', height: '15%' },
    6: { top: '82%', left: '16%', width: '21%', height: '15%' },
    7: { top: '70%', left: '40%', width: '20%', height: '15%' },
    8: { top: '82%', left: '63%', width: '21%', height: '15%' },
    9: { top: '70%', left: '79%', width: '20%', height: '15%' },
    10: { top: '44%', left: '63%', width: '21%', height: '15%' },
    11: { top: '21%', left: '77%', width: '20%', height: '15%' },
    12: { top: '5%', left: '63%', width: '21%', height: '15%' },
};