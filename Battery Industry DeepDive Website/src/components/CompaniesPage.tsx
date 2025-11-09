import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Building2, MapPin, TrendingUp, DollarSign, Search, Loader2 } from 'lucide-react';
import { getCompanies, getCompanyFilters, type Company } from '../services/companies.service';

const SECTORS_MAPPING: Record<string, string> = {
  'Solid-state lithium-metal battery': 'Solid-State',
  'Solid-state': 'Solid-State',
  'Silicon anode lithium-ion batteries': 'Silicon Anode',
  'Lithium iron phosphate': 'LFP',
  'Znyth aqueous zinc battery': 'Zinc Battery',
  'Recycling': 'Recycling',
  'Grid Storage': 'Grid Storage',
  'Flow Batteries': 'Flow Batteries',
  'Materials': 'Materials',
};

const REGIONS_MAP: Record<string, string> = {
  CA: 'West',
  NV: 'West',
  CO: 'West',
  OR: 'West',
  WA: 'West',
  MA: 'Northeast',
  NY: 'Northeast',
  NJ: 'Northeast',
  GA: 'South',
  NC: 'South',
  TX: 'South',
  MI: 'Midwest',
  OH: 'Midwest',
  IL: 'Midwest',
};

export function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSector, setSelectedSector] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedFunding, setSelectedFunding] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [availableSectors, setAvailableSectors] = useState<string[]>([]);
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);

  // Load companies and filters
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [companiesData, filters] = await Promise.all([
          getCompanies(),
          getCompanyFilters(),
        ]);

        setCompanies(companiesData);
        setFilteredCompanies(companiesData);

        // Map technologies to sectors
        const sectors = new Set<string>();
        filters.technologies.forEach((tech) => {
          const sector = SECTORS_MAPPING[tech] || tech;
          sectors.add(sector);
        });

        setAvailableSectors(Array.from(sectors).sort());

        // Map states to regions
        const regions = new Set<string>();
        filters.states.forEach((state) => {
          const region = REGIONS_MAP[state];
          if (region) regions.add(region);
        });

        setAvailableRegions(Array.from(regions).sort());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load companies');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = companies;

    // Filter by sector
    if (selectedSector !== 'All') {
      result = result.filter((company) => {
        const sector = SECTORS_MAPPING[company.technology] || company.technology;
        return sector === selectedSector;
      });
    }

    // Filter by region
    if (selectedRegion !== 'All') {
      result = result.filter((company) => {
        const stateMatch = company.headquarters.match(/,\s*([A-Z]{2})\s*$/);
        if (stateMatch) {
          const region = REGIONS_MAP[stateMatch[1]];
          return region === selectedRegion;
        }
        return false;
      });
    }

    // Filter by funding status
    if (selectedFunding !== 'All') {
      result = result.filter((company) => {
        if (selectedFunding === 'Public') {
          return company.ticker || company.is_publicly_traded;
        } else {
          return !company.ticker && !company.is_publicly_traded;
        }
      });
    }

    // Filter by search query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (company) =>
          company.name.toLowerCase().includes(lowerQuery) ||
          company.technology.toLowerCase().includes(lowerQuery) ||
          company.headquarters.toLowerCase().includes(lowerQuery)
      );
    }

    setFilteredCompanies(result);
  }, [companies, selectedSector, selectedRegion, selectedFunding, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-12 text-[#B2FF59] animate-spin" />
          <p className="text-[#FAFAFA]">Loading companies data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#B2FF59] text-[#0A0A0A] rounded-lg hover:bg-[#A0E050] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const SECTORS = ['All', ...availableSectors];
  const REGIONS = ['All', ...availableRegions];
  const FUNDING_TYPES = ['All', 'Public', 'Private'];

  return (
    <div className="min-h-screen pt-24 bg-[#0A0A0A]">
      {/* Hero Banner */}
      <div className="relative bg-[#0F0F0F] border-b-4 border-[#B2FF59] overflow-hidden">
        <motion.div
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-[#B2FF59]/10 to-transparent"
        />
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-[#B2FF59] mb-4 text-5xl font-extrabold font-tech uppercase tracking-wider">
              Company Directory
            </h1>
            <p className="text-[#FAFAFA] max-w-2xl text-lg font-medium">
              Comprehensive database of {companies.length} U.S. battery companies across all subsectors
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-4 gap-6">
          {/* Left Sidebar: Filters */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Search */}
            <div className="bg-[#1A1A1A] p-6 rounded-xl border-2 border-[#B2FF59]/30">
              <h3 className="text-[#B2FF59] mb-4 font-bold font-tech uppercase tracking-wider">Search</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#666666]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search companies..."
                  className="w-full pl-10 pr-4 py-3 bg-[#0A0A0A] text-[#FAFAFA] rounded-lg border-2 border-[#2B2B2B] focus:border-[#B2FF59] outline-none transition-all duration-300 placeholder:text-[#666666]"
                />
              </div>
            </div>

            {/* Sector Filter */}
            <div className="bg-[#1A1A1A] p-6 rounded-xl border-2 border-[#B2FF59]/30">
              <h3 className="text-[#B2FF59] mb-4 font-bold font-tech uppercase tracking-wider">Subsector</h3>
              <div className="space-y-2">
                {SECTORS.map((sector) => (
                  <button
                    key={sector}
                    onClick={() => setSelectedSector(sector)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg transition-all duration-300 font-medium ${
                      selectedSector === sector
                        ? 'bg-[#B2FF59] text-[#0A0A0A] shadow-lg shadow-[#B2FF59]/30'
                        : 'text-[#CCCCCC] hover:bg-[#2B2B2B] hover:text-[#FAFAFA]'
                    }`}
                  >
                    {sector}
                  </button>
                ))}
              </div>
            </div>

            {/* Region Filter */}
            <div className="bg-[#1A1A1A] p-6 rounded-xl border-2 border-[#B2FF59]/30">
              <h3 className="text-[#B2FF59] mb-4 font-bold font-tech uppercase tracking-wider">Region</h3>
              <div className="space-y-2">
                {REGIONS.map((region) => (
                  <button
                    key={region}
                    onClick={() => setSelectedRegion(region)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg transition-all duration-300 font-medium ${
                      selectedRegion === region
                        ? 'bg-[#B2FF59] text-[#0A0A0A] shadow-lg shadow-[#B2FF59]/30'
                        : 'text-[#CCCCCC] hover:bg-[#2B2B2B] hover:text-[#FAFAFA]'
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>

            {/* Funding Type Filter */}
            <div className="bg-[#1A1A1A] p-6 rounded-xl border-2 border-[#B2FF59]/30">
              <h3 className="text-[#B2FF59] mb-4 font-bold font-tech uppercase tracking-wider">Funding Type</h3>
              <div className="space-y-2">
                {FUNDING_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedFunding(type)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg transition-all duration-300 font-medium ${
                      selectedFunding === type
                        ? 'bg-[#B2FF59] text-[#0A0A0A] shadow-lg shadow-[#B2FF59]/30'
                        : 'text-[#CCCCCC] hover:bg-[#2B2B2B] hover:text-[#FAFAFA]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: Company Cards */}
          <div className="col-span-3 space-y-4">
            <div className="text-[#AAAAAA] mb-4 font-medium">
              Showing {filteredCompanies.length} companies
            </div>

            {filteredCompanies.map((company, index) => {
              const sector = SECTORS_MAPPING[company.technology] || company.technology;
              const isPublic = company.ticker || company.is_publicly_traded;

              return (
                <motion.div
                  key={company.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="bg-[#1A1A1A] p-6 rounded-xl border-2 border-[#2B2B2B] hover:border-[#B2FF59] hover:shadow-lg hover:shadow-[#B2FF59]/20 transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex items-start gap-6">
                    {/* Logo */}
                    <div className="w-16 h-16 bg-[#0F0F0F] rounded-xl flex items-center justify-center text-3xl border-2 border-[#2B2B2B] group-hover:border-[#B2FF59] transition-all duration-300">
                      <Building2 className="size-8 text-[#B2FF59]" />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-[#FAFAFA] mb-2 text-xl font-bold group-hover:text-[#B2FF59] transition-colors duration-300">
                            {company.name}
                            {company.ticker && (
                              <span className="ml-2 text-sm text-[#B2FF59]">
                                ({company.ticker})
                              </span>
                            )}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-[#AAAAAA]">
                            <span className="px-3 py-1.5 bg-[#B2FF59]/20 text-[#B2FF59] rounded-lg font-semibold border border-[#B2FF59]/50">
                              {sector}
                            </span>
                            <span className="flex items-center gap-1.5 font-medium">
                              <MapPin className="size-3.5" />
                              {company.headquarters}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`px-4 py-2 rounded-lg font-semibold border-2 ${
                            isPublic
                              ? 'bg-[#B2FF59]/20 text-[#B2FF59] border-[#B2FF59]/50'
                              : 'bg-[#1565C0]/20 text-[#1565C0] border-[#1565C0]/50'
                          }`}
                        >
                          {isPublic ? 'Public' : 'Private'}
                        </span>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-4 gap-4 mt-5 pt-5 border-t-2 border-[#2B2B2B]">
                        <div>
                          <div className="text-[#888888] text-xs mb-1.5 font-semibold uppercase tracking-wide">
                            Founded
                          </div>
                          <div className="text-[#FAFAFA] font-mono font-semibold">{company.founded}</div>
                        </div>
                        <div>
                          <div className="text-[#888888] text-xs mb-1.5 font-semibold uppercase tracking-wide">
                            Capacity
                          </div>
                          <div className="text-[#B2FF59] font-mono font-bold">
                            {company.capacity_gwh ? `${company.capacity_gwh} GWh` : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-[#888888] text-xs mb-1.5 font-semibold uppercase tracking-wide">
                            Funding
                          </div>
                          <div className="text-[#1565C0] font-mono font-bold">
                            {company.funding?.total_raised || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-[#888888] text-xs mb-1.5 font-semibold uppercase tracking-wide">
                            Employees
                          </div>
                          <div className="text-[#FAFAFA] font-mono font-semibold">
                            {company.employees}+
                          </div>
                        </div>
                      </div>

                      {/* Technology Description */}
                      <div className="mt-4 text-sm text-[#CCCCCC]">
                        {company.technology}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {filteredCompanies.length === 0 && (
              <div className="text-center py-12">
                <p className="text-[#AAAAAA] text-lg">
                  No companies match your filters. Try adjusting your search criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}