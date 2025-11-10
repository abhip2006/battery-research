import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Building2, MapPin, Search, Loader2, X, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { getCompanies, getCompanyFilters, type Company } from '../services/companies.service';

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

  const [searchQuery, setSearchQuery] = useState('');

  // Multi-select filters
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);
  const [selectedCompanyTypes, setSelectedCompanyTypes] = useState<string[]>([]);
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  // Sorting
  const [sortBy, setSortBy] = useState<'name' | 'capacity' | 'employees' | 'founded'>('name');

  const [availableRegions, setAvailableRegions] = useState<string[]>([]);

  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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

  // Helper functions for categorization
  const categorizeTechnology = (tech: string): string[] => {
    const techLower = tech.toLowerCase();
    const categories: string[] = [];

    if (techLower.includes('solid-state') || techLower.includes('solid state')) categories.push('solid-state');
    if (techLower.includes('li-ion') || techLower.includes('lithium-ion') || techLower.includes('lithium ion')) categories.push('li-ion');
    if (techLower.includes('lfp') || techLower.includes('lithium iron phosphate')) categories.push('lfp');
    if (techLower.includes('flow') || techLower.includes('zinc') || techLower.includes('iron-air')) categories.push('flow');
    if (techLower.includes('silicon')) categories.push('silicon');

    return categories;
  };

  const categorizeStage = (stage: string): string => {
    const stageLower = stage.toLowerCase();
    if (stageLower.includes('commercial') || stageLower.includes('production') || stageLower.includes('scaled')) return 'commercial';
    if (stageLower.includes('pilot')) return 'pilot';
    return 'development';
  };

  const getCompanyType = (company: Company): string => {
    if (company.ticker || company.is_publicly_traded) return 'public';
    if (company.name.toLowerCase().includes('llc') || company.name.toLowerCase().includes('jv') ||
        (company as any).partners) return 'jv';
    return 'private';
  };

  // Apply filters
  useEffect(() => {
    let result = companies;

    // Filter by technologies
    if (selectedTechnologies.length > 0) {
      result = result.filter((company) => {
        const companyTechs = categorizeTechnology(company.technology);
        return selectedTechnologies.some(tech => companyTechs.includes(tech));
      });
    }

    // Filter by company type
    if (selectedCompanyTypes.length > 0) {
      result = result.filter((company) => {
        const companyType = getCompanyType(company);
        return selectedCompanyTypes.includes(companyType);
      });
    }

    // Filter by stage
    if (selectedStages.length > 0) {
      result = result.filter((company) => {
        const stage = categorizeStage(company.stage || '');
        return selectedStages.includes(stage);
      });
    }

    // Filter by regions
    if (selectedRegions.length > 0) {
      result = result.filter((company) => {
        const stateMatch = company.headquarters.match(/,\s*([A-Z]{2})\s*$/);
        if (stateMatch) {
          const region = REGIONS_MAP[stateMatch[1]];
          return region && selectedRegions.includes(region);
        }
        return false;
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

    // Apply sorting
    result.sort((a, b) => {
      switch(sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'capacity':
          return (b.capacity_gwh || 0) - (a.capacity_gwh || 0);
        case 'employees':
          return (b.employees || 0) - (a.employees || 0);
        case 'founded':
          return (b.founded || 0) - (a.founded || 0);
        default:
          return 0;
      }
    });

    setFilteredCompanies(result);
  }, [companies, selectedTechnologies, selectedCompanyTypes, selectedStages, selectedRegions, searchQuery, sortBy]);

  // Calculate active filters count
  const activeFiltersCount =
    selectedTechnologies.length +
    selectedCompanyTypes.length +
    selectedStages.length +
    selectedRegions.length +
    (searchQuery ? 1 : 0);

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedTechnologies([]);
    setSelectedCompanyTypes([]);
    setSelectedStages([]);
    setSelectedRegions([]);
    setSearchQuery('');
    setSortBy('name');
  };

  // Toggle filter selection
  const toggleFilter = (filterArray: string[], setFilter: (val: string[]) => void, value: string) => {
    if (filterArray.includes(value)) {
      setFilter(filterArray.filter(v => v !== value));
    } else {
      setFilter([...filterArray, value]);
    }
    setOpenDropdown(null);
  };

  // Remove individual filter
  const removeFilter = (type: 'tech' | 'type' | 'stage' | 'region', value: string) => {
    switch(type) {
      case 'tech':
        setSelectedTechnologies(prev => prev.filter(v => v !== value));
        break;
      case 'type':
        setSelectedCompanyTypes(prev => prev.filter(v => v !== value));
        break;
      case 'stage':
        setSelectedStages(prev => prev.filter(v => v !== value));
        break;
      case 'region':
        setSelectedRegions(prev => prev.filter(v => v !== value));
        break;
    }
  };

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
        <div className="text-center px-4">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#B2FF59] text-[#0A0A0A] rounded-lg hover:bg-[#A0E050] transition-colors min-h-[44px]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const TECHNOLOGIES = ['li-ion', 'solid-state', 'lfp', 'flow', 'silicon'];
  const COMPANY_TYPES = ['public', 'private', 'jv'];
  const STAGES = ['commercial', 'pilot', 'development'];

  return (
    <div className="min-h-screen pt-16 md:pt-24 bg-[#0A0A0A]">
      {/* Hero Banner */}
      <div className="relative bg-[#0F0F0F] border-b-2 border-[#B2FF59]/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <h1 className="text-[#B2FF59] mb-2 text-2xl md:text-4xl font-extrabold font-tech uppercase tracking-wider">
            Company Directory
          </h1>
          <p className="text-[#FAFAFA] text-sm md:text-base font-medium">
            {companies.length} U.S. battery companies across all subsectors
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Modern CRM-Style Filter Bar */}
        <div className="mb-6 space-y-4">
          {/* Top Row: Search + Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#666666]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search companies..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#1A1A1A] text-[#FAFAFA] rounded-lg border border-[#2B2B2B] focus:border-[#B2FF59] outline-none transition-all placeholder:text-[#666666] text-sm"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Technology Filter */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'tech' ? null : 'tech')}
                  className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all flex items-center gap-2 ${
                    selectedTechnologies.length > 0
                      ? 'bg-[#B2FF59] text-[#0A0A0A] border-[#B2FF59]'
                      : 'bg-[#1A1A1A] text-[#FAFAFA] border-[#2B2B2B] hover:border-[#B2FF59]'
                  }`}
                >
                  <SlidersHorizontal className="size-4" />
                  Technology
                  {selectedTechnologies.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-[#0A0A0A] text-[#B2FF59] rounded text-xs font-bold">
                      {selectedTechnologies.length}
                    </span>
                  )}
                  <ChevronDown className="size-4" />
                </button>
                {openDropdown === 'tech' && (
                  <div className="absolute top-full mt-2 left-0 bg-[#1A1A1A] border border-[#2B2B2B] rounded-lg shadow-xl z-50 min-w-[200px]">
                    {TECHNOLOGIES.map((tech) => (
                      <label
                        key={tech}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#2B2B2B] cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTechnologies.includes(tech)}
                          onChange={() => toggleFilter(selectedTechnologies, setSelectedTechnologies, tech)}
                          className="w-4 h-4 rounded border border-[#B2FF59] bg-[#0A0A0A] text-[#B2FF59] focus:ring-2 focus:ring-[#B2FF59] cursor-pointer"
                        />
                        <span className="text-[#FAFAFA] text-sm capitalize">
                          {tech === 'lfp' ? 'LFP' : tech.replace('-', ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Company Type Filter */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
                  className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all flex items-center gap-2 ${
                    selectedCompanyTypes.length > 0
                      ? 'bg-[#B2FF59] text-[#0A0A0A] border-[#B2FF59]'
                      : 'bg-[#1A1A1A] text-[#FAFAFA] border-[#2B2B2B] hover:border-[#B2FF59]'
                  }`}
                >
                  Company Type
                  {selectedCompanyTypes.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-[#0A0A0A] text-[#B2FF59] rounded text-xs font-bold">
                      {selectedCompanyTypes.length}
                    </span>
                  )}
                  <ChevronDown className="size-4" />
                </button>
                {openDropdown === 'type' && (
                  <div className="absolute top-full mt-2 left-0 bg-[#1A1A1A] border border-[#2B2B2B] rounded-lg shadow-xl z-50 min-w-[180px]">
                    {COMPANY_TYPES.map((type) => (
                      <label
                        key={type}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#2B2B2B] cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCompanyTypes.includes(type)}
                          onChange={() => toggleFilter(selectedCompanyTypes, setSelectedCompanyTypes, type)}
                          className="w-4 h-4 rounded border border-[#B2FF59] bg-[#0A0A0A] text-[#B2FF59] focus:ring-2 focus:ring-[#B2FF59] cursor-pointer"
                        />
                        <span className="text-[#FAFAFA] text-sm capitalize">
                          {type === 'jv' ? 'Joint Venture' : type}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Stage Filter */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'stage' ? null : 'stage')}
                  className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all flex items-center gap-2 ${
                    selectedStages.length > 0
                      ? 'bg-[#B2FF59] text-[#0A0A0A] border-[#B2FF59]'
                      : 'bg-[#1A1A1A] text-[#FAFAFA] border-[#2B2B2B] hover:border-[#B2FF59]'
                  }`}
                >
                  Stage
                  {selectedStages.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-[#0A0A0A] text-[#B2FF59] rounded text-xs font-bold">
                      {selectedStages.length}
                    </span>
                  )}
                  <ChevronDown className="size-4" />
                </button>
                {openDropdown === 'stage' && (
                  <div className="absolute top-full mt-2 left-0 bg-[#1A1A1A] border border-[#2B2B2B] rounded-lg shadow-xl z-50 min-w-[180px]">
                    {STAGES.map((stage) => (
                      <label
                        key={stage}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#2B2B2B] cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStages.includes(stage)}
                          onChange={() => toggleFilter(selectedStages, setSelectedStages, stage)}
                          className="w-4 h-4 rounded border border-[#B2FF59] bg-[#0A0A0A] text-[#B2FF59] focus:ring-2 focus:ring-[#B2FF59] cursor-pointer"
                        />
                        <span className="text-[#FAFAFA] text-sm capitalize">
                          {stage}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Region Filter */}
              {availableRegions.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setOpenDropdown(openDropdown === 'region' ? null : 'region')}
                    className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all flex items-center gap-2 ${
                      selectedRegions.length > 0
                        ? 'bg-[#B2FF59] text-[#0A0A0A] border-[#B2FF59]'
                        : 'bg-[#1A1A1A] text-[#FAFAFA] border-[#2B2B2B] hover:border-[#B2FF59]'
                    }`}
                  >
                    Region
                    {selectedRegions.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 bg-[#0A0A0A] text-[#B2FF59] rounded text-xs font-bold">
                        {selectedRegions.length}
                      </span>
                    )}
                    <ChevronDown className="size-4" />
                  </button>
                  {openDropdown === 'region' && (
                    <div className="absolute top-full mt-2 left-0 bg-[#1A1A1A] border border-[#2B2B2B] rounded-lg shadow-xl z-50 min-w-[180px]">
                      {availableRegions.map((region) => (
                        <label
                          key={region}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#2B2B2B] cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedRegions.includes(region)}
                            onChange={() => toggleFilter(selectedRegions, setSelectedRegions, region)}
                            className="w-4 h-4 rounded border border-[#B2FF59] bg-[#0A0A0A] text-[#B2FF59] focus:ring-2 focus:ring-[#B2FF59] cursor-pointer"
                          />
                          <span className="text-[#FAFAFA] text-sm">
                            {region}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-4 py-2.5 bg-[#1A1A1A] text-[#FAFAFA] rounded-lg border border-[#2B2B2B] focus:border-[#B2FF59] outline-none text-sm font-medium"
              >
                <option value="name">Sort: Name</option>
                <option value="capacity">Sort: Capacity</option>
                <option value="employees">Sort: Employees</option>
                <option value="founded">Sort: Founded</option>
              </select>

              {/* Clear All */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2.5 bg-[#2B2B2B] text-[#FAFAFA] rounded-lg hover:bg-[#3B3B3B] transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <X className="size-4" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Active Filters Pills */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-[#888888] font-medium">Active filters:</span>
              {selectedTechnologies.map((tech) => (
                <button
                  key={tech}
                  onClick={() => removeFilter('tech', tech)}
                  className="px-3 py-1.5 bg-[#B2FF59]/20 text-[#B2FF59] rounded-full text-xs font-medium flex items-center gap-1.5 hover:bg-[#B2FF59]/30 transition-colors"
                >
                  {tech === 'lfp' ? 'LFP' : tech.replace('-', ' ')}
                  <X className="size-3" />
                </button>
              ))}
              {selectedCompanyTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => removeFilter('type', type)}
                  className="px-3 py-1.5 bg-[#1565C0]/20 text-[#1565C0] rounded-full text-xs font-medium flex items-center gap-1.5 hover:bg-[#1565C0]/30 transition-colors"
                >
                  {type === 'jv' ? 'Joint Venture' : type}
                  <X className="size-3" />
                </button>
              ))}
              {selectedStages.map((stage) => (
                <button
                  key={stage}
                  onClick={() => removeFilter('stage', stage)}
                  className="px-3 py-1.5 bg-[#FF9F0A]/20 text-[#FF9F0A] rounded-full text-xs font-medium flex items-center gap-1.5 hover:bg-[#FF9F0A]/30 transition-colors capitalize"
                >
                  {stage}
                  <X className="size-3" />
                </button>
              ))}
              {selectedRegions.map((region) => (
                <button
                  key={region}
                  onClick={() => removeFilter('region', region)}
                  className="px-3 py-1.5 bg-[#AF52DE]/20 text-[#AF52DE] rounded-full text-xs font-medium flex items-center gap-1.5 hover:bg-[#AF52DE]/30 transition-colors"
                >
                  {region}
                  <X className="size-3" />
                </button>
              ))}
            </div>
          )}

          {/* Results Count */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#AAAAAA] font-medium">
              Showing {filteredCompanies.length} of {companies.length} companies
            </span>
          </div>
        </div>

        {/* Company Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map((company, index) => {
            const isPublic = company.ticker || company.is_publicly_traded;

            return (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
                className="bg-[#1A1A1A] p-5 rounded-lg border border-[#2B2B2B] hover:border-[#B2FF59] hover:shadow-lg hover:shadow-[#B2FF59]/10 transition-all duration-300 group"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#0F0F0F] rounded-lg flex items-center justify-center flex-shrink-0 border border-[#2B2B2B] group-hover:border-[#B2FF59] transition-all">
                    <Building2 className="size-5 text-[#B2FF59]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[#FAFAFA] text-base font-bold group-hover:text-[#B2FF59] transition-colors truncate">
                      {company.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {company.ticker && (
                        <span className="text-xs text-[#B2FF59] font-mono">
                          {company.ticker}
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          isPublic
                            ? 'bg-[#B2FF59]/20 text-[#B2FF59]'
                            : 'bg-[#1565C0]/20 text-[#1565C0]'
                        }`}
                      >
                        {isPublic ? 'Public' : 'Private'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#AAAAAA] mb-3">
                  <MapPin className="size-3.5 flex-shrink-0" />
                  <span className="truncate">{company.headquarters}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#2B2B2B]">
                  <div>
                    <div className="text-[10px] text-[#888888] mb-1 uppercase tracking-wide font-semibold">
                      Capacity
                    </div>
                    <div className="text-sm text-[#B2FF59] font-mono font-bold">
                      {company.capacity_gwh ? `${company.capacity_gwh} GWh` : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#888888] mb-1 uppercase tracking-wide font-semibold">
                      Employees
                    </div>
                    <div className="text-sm text-[#FAFAFA] font-mono font-semibold">
                      {company.employees}+
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-xs text-[#CCCCCC] line-clamp-2">
                  {company.technology}
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredCompanies.length === 0 && (
          <div className="text-center py-16 px-4">
            <p className="text-[#AAAAAA] text-base">
              No companies match your filters. Try adjusting your search criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
