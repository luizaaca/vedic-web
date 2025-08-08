export interface ChartResultData {
    ascendant: {
      degree: string;
      sign: string;
      houseNumber: number;
    };
    houses: HouseData[];
    nakshatra: string;
    mahadasha: {
      current: {
        dashaLord: string;
        yearsRemaining: string;
      };
      sequence: DashaSequence[];
    };
  }

export interface HouseData {
    houseNumber: number;
    sign: string;
    startDegree: string;
    endDegrees: string;
    planets: PlanetData[];
  }

export interface PlanetData {
    planetName: string;
    degree: string;
    nakshatra?: string;
    sign: string;
    houseNumber: number;
  }

export interface DashaSequence {
    dashaLord: string;
    duration: number;
    from: string;
    to: string;
    antardashas?: AntardashaData[];
  }

export interface AntardashaData {
    dashaLord: string;
    antardashaLord: string;
    durationYears: string;
    from: string;
    to: string;
  }