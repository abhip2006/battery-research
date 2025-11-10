/**
 * Companies Data Service
 * Fetches company data from local JSON files or API
 */

import apiClient from '../lib/api-client';

const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE || 'local';

export interface Company {
  id: number;
  name: string;
  ticker?: string;
  exchange?: string;
  headquarters: string;
  founded: number;
  technology: string;
  stage: string;
  capacity_gwh?: number | null;
  capacity_target_year?: number;
  employees: number;
  partnerships?: string[];
  funding?: {
    total_raised?: string;
    ipo_date?: string;
    ipo_method?: string;
    valuation?: string;
  };
  financials?: {
    [key: string]: string;
  };
  products?: string[];
  features?: string[];
  applications?: string[];
  timeline?: Array<{ year: number; event: string }>;
  confidence_score?: number;
  website?: string;
  is_publicly_traded?: boolean;
}

export interface CompaniesData {
  publicCompanies?: Company[];
  privateCompanies?: Company[];
  jointVentures?: Company[];
}

let cachedCompanies: Company[] | null = null;

async function fetchFromLocal(): Promise<Company[]> {
  if (cachedCompanies) {
    return cachedCompanies;
  }

  try {
    // Fetch from public data directory
    const response = await fetch('/data/companies-detailed.json');
    if (!response.ok) {
      throw new Error('Failed to load companies data');
    }

    const data: CompaniesData = await response.json();

    // Combine all company types
    const allCompanies = [
      ...(data.publicCompanies || []),
      ...(data.privateCompanies || []),
      ...(data.jointVentures || []),
    ];

    cachedCompanies = allCompanies;
    return allCompanies;
  } catch (error) {
    console.error('Error loading local companies data:', error);
    return [];
  }
}

async function fetchFromAPI(params?: {
  company_type?: string;
  primary_category?: string;
  state?: string;
  is_publicly_traded?: boolean;
  min_capacity?: number;
  skip?: number;
  limit?: number;
}): Promise<Company[]> {
  try {
    const queryParams: Record<string, string> = {};

    if (params) {
      if (params.company_type) queryParams.company_type = params.company_type;
      if (params.primary_category)
        queryParams.primary_category = params.primary_category;
      if (params.state) queryParams.state = params.state;
      if (params.is_publicly_traded !== undefined)
        queryParams.is_publicly_traded = String(params.is_publicly_traded);
      if (params.min_capacity)
        queryParams.min_capacity = String(params.min_capacity);
      if (params.skip) queryParams.skip = String(params.skip);
      if (params.limit) queryParams.limit = String(params.limit);
    }

    const response = await apiClient.get<{ companies: Company[] }>(
      '/companies',
      queryParams
    );

    return response.companies;
  } catch (error) {
    console.error('Error fetching companies from API:', error);
    throw error;
  }
}

export async function getCompanies(params?: {
  company_type?: string;
  primary_category?: string;
  state?: string;
  is_publicly_traded?: boolean;
  min_capacity?: number;
}): Promise<Company[]> {
  if (DATA_SOURCE === 'api') {
    return fetchFromAPI(params);
  }

  // Default to local data
  const allCompanies = await fetchFromLocal();

  // Apply filters locally if provided
  if (!params) {
    return allCompanies;
  }

  return allCompanies.filter((company) => {
    if (params.company_type && company.technology !== params.company_type) {
      return false;
    }
    if (params.state && !company.headquarters.includes(params.state)) {
      return false;
    }
    if (
      params.is_publicly_traded !== undefined &&
      company.is_publicly_traded !== params.is_publicly_traded
    ) {
      return false;
    }
    if (
      params.min_capacity &&
      (!company.capacity_gwh || company.capacity_gwh < params.min_capacity)
    ) {
      return false;
    }
    return true;
  });
}

export async function getCompanyById(id: number): Promise<Company | null> {
  const companies = await getCompanies();
  return companies.find((c) => c.id === id) || null;
}

export async function searchCompanies(query: string): Promise<Company[]> {
  const companies = await getCompanies();
  const lowerQuery = query.toLowerCase();

  return companies.filter(
    (company) =>
      company.name.toLowerCase().includes(lowerQuery) ||
      company.technology.toLowerCase().includes(lowerQuery) ||
      company.headquarters.toLowerCase().includes(lowerQuery)
  );
}

// Get unique values for filters
export async function getCompanyFilters() {
  const companies = await getCompanies();

  const technologies = new Set<string>();
  const states = new Set<string>();
  const stages = new Set<string>();

  companies.forEach((company) => {
    technologies.add(company.technology);
    stages.add(company.stage);

    // Extract state from headquarters (e.g., "San Jose, CA" -> "CA")
    const match = company.headquarters.match(/,\s*([A-Z]{2})\s*$/);
    if (match) {
      states.add(match[1]);
    }
  });

  return {
    technologies: Array.from(technologies).sort(),
    states: Array.from(states).sort(),
    stages: Array.from(stages).sort(),
  };
}
