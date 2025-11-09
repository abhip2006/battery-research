// Data fetching and caching utilities
import type { BatteryData } from '@/types';

const DATA_URL = '/data/visualization-data.json';

let cachedData: BatteryData | null = null;

/**
 * Fetch battery industry data
 * Implements client-side caching for performance
 */
export async function fetchBatteryData(): Promise<BatteryData> {
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch(DATA_URL);

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const data: BatteryData = await response.json();
    cachedData = data;
    return data;
  } catch (error) {
    console.error('Error fetching battery data:', error);
    throw error;
  }
}

/**
 * Clear cached data (useful for development/testing)
 */
export function clearDataCache(): void {
  cachedData = null;
}

/**
 * Filter companies based on criteria
 */
export function filterCompanies(
  companies: BatteryData['topCompanies'],
  filters: {
    technology?: string[];
    minCapacity?: number;
    maxCapacity?: number;
    search?: string;
  }
): BatteryData['topCompanies'] {
  return companies.filter((company) => {
    // Technology filter
    if (filters.technology && filters.technology.length > 0) {
      const hasMatchingTech = filters.technology.some((tech) =>
        company.technology.toLowerCase().includes(tech.toLowerCase())
      );
      if (!hasMatchingTech) return false;
    }

    // Capacity filters
    if (filters.minCapacity && company.capacity < filters.minCapacity) {
      return false;
    }
    if (filters.maxCapacity && company.capacity > filters.maxCapacity) {
      return false;
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        company.name.toLowerCase().includes(searchLower) ||
        company.technology.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });
}

/**
 * Sort companies by various criteria
 */
export function sortCompanies(
  companies: BatteryData['topCompanies'],
  sortBy: 'name' | 'capacity' | 'technology',
  order: 'asc' | 'desc' = 'desc'
): BatteryData['topCompanies'] {
  return [...companies].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'capacity':
        comparison = a.capacity - b.capacity;
        break;
      case 'technology':
        comparison = a.technology.localeCompare(b.technology);
        break;
    }

    return order === 'asc' ? comparison : -comparison;
  });
}

/**
 * Get unique technologies from companies
 */
export function getUniqueTechnologies(companies: BatteryData['topCompanies']): string[] {
  const technologies = new Set<string>();

  companies.forEach((company) => {
    // Split technology string by common separators
    const techs = company.technology.split(/[,()]/);
    techs.forEach((tech) => {
      const cleaned = tech.trim();
      if (cleaned) {
        technologies.add(cleaned);
      }
    });
  });

  return Array.from(technologies).sort();
}

/**
 * Calculate statistics for companies
 */
export function calculateCompanyStats(companies: BatteryData['topCompanies']) {
  const totalCapacity = companies.reduce((sum, c) => sum + c.capacity, 0);
  const avgCapacity = totalCapacity / companies.length;
  const maxCapacity = Math.max(...companies.map((c) => c.capacity));
  const minCapacity = Math.min(...companies.map((c) => c.capacity));

  return {
    total: companies.length,
    totalCapacity,
    avgCapacity: Math.round(avgCapacity * 10) / 10,
    maxCapacity,
    minCapacity,
  };
}

/**
 * Export data to CSV format
 */
export function exportToCSV(data: any[], filename: string): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header];
        // Escape values containing commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    ),
  ].join('\n');

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export data to JSON format
 */
export function exportToJSON(data: any, filename: string): void {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
