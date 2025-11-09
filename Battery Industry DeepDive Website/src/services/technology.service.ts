/**
 * Technology Data Service
 * Fetches battery technology and specifications data
 */

const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE || 'local';

export interface TechnologySpec {
  energy_density_cell_whkg?: Record<string, number>;
  energy_density_pack_whkg?: Record<string, number>;
  volumetric_density_whl?: { current: number };
  cycle_life_laboratory?: number;
  cycle_life_real_world?: number;
  degradation_rate_percent_year?: number;
  capacity_after_1000_cycles_percent?: number;
  cost_per_kwh_2024?: number;
  cost_per_kwh_2030_projected?: number;
  charging_rate_c?: string;
  operating_temp_min_celsius?: number;
  operating_temp_max_celsius?: number;
  safety_rating?: string;
  thermal_stability?: string;
}

export interface Chemistry {
  name: string;
  formula: string;
  variants?: string[];
  market_share: {
    [year: string]: number;
  };
  specs: TechnologySpec;
  advantages: string[];
  disadvantages: string[];
  applications: string[];
  major_manufacturers: string[];
}

export interface TechnologyData {
  chemistries: Chemistry[];
}

let cachedTechnology: TechnologyData | null = null;

async function fetchFromLocal(): Promise<TechnologyData> {
  if (cachedTechnology) {
    return cachedTechnology;
  }

  try {
    const response = await fetch('/data/technology-specs.json');
    if (!response.ok) {
      throw new Error('Failed to load technology data');
    }

    const data: TechnologyData = await response.json();
    cachedTechnology = data;
    return data;
  } catch (error) {
    console.error('Error loading local technology data:', error);
    return { chemistries: [] };
  }
}

export async function getTechnologies(): Promise<Chemistry[]> {
  const data = await fetchFromLocal();
  return data.chemistries;
}

export async function getTechnologyByName(name: string): Promise<Chemistry | null> {
  const technologies = await getTechnologies();
  return (
    technologies.find(
      (tech) => tech.name.toLowerCase() === name.toLowerCase()
    ) || null
  );
}

export async function getMarketShareData(year?: string): Promise<
  Array<{ name: string; value: number }>
> {
  const technologies = await getTechnologies();
  const targetYear = year || '2024';

  return technologies
    .map((tech) => ({
      name: tech.name,
      value: tech.market_share[targetYear] || 0,
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);
}

export async function getCostProjections(): Promise<
  Array<{ name: string; cost_2024: number; cost_2030: number }>
> {
  const technologies = await getTechnologies();

  return technologies
    .map((tech) => ({
      name: tech.name,
      cost_2024: tech.specs.cost_per_kwh_2024 || 0,
      cost_2030: tech.specs.cost_per_kwh_2030_projected || 0,
    }))
    .filter((item) => item.cost_2024 > 0);
}

export async function getEnergyDensityComparison(): Promise<
  Array<{ name: string; cell_2024: number; pack_2024: number; cell_2030: number }>
> {
  const technologies = await getTechnologies();

  return technologies
    .map((tech) => ({
      name: tech.name,
      cell_2024: tech.specs.energy_density_cell_whkg?.['2024'] || 0,
      pack_2024: tech.specs.energy_density_pack_whkg?.['2024'] || 0,
      cell_2030: tech.specs.energy_density_cell_whkg?.['2030_projected'] || 0,
    }))
    .filter((item) => item.cell_2024 > 0);
}
