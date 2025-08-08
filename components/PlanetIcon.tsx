import React from 'react';
// Importe todos os seus componentes SVG a partir de um arquivo "barril" (index.ts)
import * as PlanetSvgs from './icons/planets';

// Tipagem para os componentes SVG importados
type SvgComponent = React.FC<React.SVGProps<SVGSVGElement>>;

// Mapeia os nomes dos planetas para os componentes SVG importados.
// Isso assume que todas as exportações de './icons/planets' são componentes React válidos.
const PLANET_COMPONENTS: Record<string, SvgComponent> = PlanetSvgs;

export interface PlanetIconProps {
  planetName: string;
  className?: string;
}

const PlanetIcon: React.FC<PlanetIconProps> = ({ planetName, className }) => {
  const IconComponent = PLANET_COMPONENTS[planetName];

  // Se não encontrar um ícone, exibe as duas primeiras letras como fallback
  if (!IconComponent) {
    return <span className={className}>{planetName.substring(0, 2)}</span>;
  }

  // Renderiza o componente SVG, passando a className para estilização.
  // O componente SVG herdará a cor (ex: text-gray-800) se o código SVG usar `currentColor` para fill/stroke.
  return <IconComponent className={className} />;
};

export default PlanetIcon;
