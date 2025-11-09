// Core data types for the Battery Intelligence Platform

export interface CostCurveData {
  year: number;
  cost: number;
}

export interface CapacityGrowthData {
  year: number;
  capacity: number;
}

export interface Company {
  name: string;
  capacity: number;
  technology: string;
  headquarters?: string;
  founded?: number;
  facilities?: Facility[];
  financials?: CompanyFinancials;
}

export interface CompanyFinancials {
  revenue?: number;
  employees?: number;
  investment?: number;
}

export interface Facility {
  name: string;
  location: string;
  state: string;
  capacity: number;
  status: 'Operational' | 'Under Construction' | 'Announced' | 'Planned';
  technology: string;
  startDate?: string;
  coordinates?: [number, number]; // [lat, lng]
}

export interface StateRanking {
  state: string;
  capacity: number;
  facilities: number;
  companies: string[];
  flagship: string;
}

export interface TechnologyMix {
  [year: string]: {
    [technology: string]: number;
  };
}

export interface EnergyDensityData {
  [technology: string]: {
    [year: string]: {
      cellLevel: number;
      packLevel: number;
    };
  };
}

export interface MarketShareData {
  [year: string]: Array<{
    chemistry: string;
    share: number;
  }>;
}

export interface CycleLifeData {
  [technology: string]: {
    laboratoryMax: number;
    realWorld: number;
    degradationRate: number;
    capacityAfter1000Cycles: number;
  };
}

export interface RegionalCluster {
  name: string;
  states: string[];
  totalCapacity: number;
  numFacilities: number;
  employment: number;
  dominantPlayers: string[];
  advantages: string[];
}

export interface TimelineEvent {
  avgCost: number;
  capacity: number;
  dominantChemistry: string;
  keyEvent: string;
}

export interface Timeline {
  [year: string]: TimelineEvent;
}

export interface KeyMetrics {
  costReduction: {
    '2015to2024': string;
    costPerKwh: string;
  };
  marketSize: {
    '2024': string;
    '2030': string;
  };
  employment: {
    direct: string;
    indirect: string;
  };
  energyDensityImprovement: {
    LFP: string;
    NMC: string;
  };
  supplyChainGap: {
    cathodeCapacity: string;
    separatorProduction: string;
    electrolyte: string;
  };
}

export interface BatteryData {
  costCurve: CostCurveData[];
  capacityGrowth: CapacityGrowthData[];
  topCompanies: Company[];
  stateRankings: StateRanking[];
  technologyMix: TechnologyMix;
  energyDensity: EnergyDensityData;
  marketShare: MarketShareData;
  cycleLife: CycleLifeData;
  regionalClusters: RegionalCluster[];
  timeline: Timeline;
  keyMetrics: KeyMetrics;
  metadata?: {
    reportDate: string;
    dataSource: string[];
    updateFrequency: string;
    confidence: string;
  };
}

// Filter types
export interface CompanyFilters {
  technology?: string[];
  state?: string[];
  minCapacity?: number;
  maxCapacity?: number;
  search?: string;
}

export interface FacilityFilters {
  state?: string[];
  status?: string[];
  technology?: string[];
  minCapacity?: number;
  search?: string;
}

// Chart types
export type ChartType = 'line' | 'bar' | 'area' | 'pie' | 'scatter';

export interface ChartConfig {
  title: string;
  type: ChartType;
  data: any[];
  xKey?: string;
  yKey?: string;
  colors?: string[];
}

// Theme types
export type Theme = 'light' | 'dark' | 'system';

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavItem[];
}
