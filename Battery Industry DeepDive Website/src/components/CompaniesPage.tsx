import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, TrendingUp, DollarSign, Search, Loader2, Filter, X, ExternalLink, Calendar, Users, Zap, ArrowRight } from 'lucide-react';
import { getCompanies, getCompanyFilters, type Company } from '../services/companies.service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

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
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedFunding, setSelectedFunding] = useState('all');
  const [selectedStage, setSelectedStage] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [availableSectors, setAvailableSectors] = useState<string[]>([]);
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);
  const [availableStages, setAvailableStages] = useState<string[]>([]);

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

        // Get available stages
        const stages = new Set<string>();
        companiesData.forEach((company) => {
          if (company.stage) stages.add(company.stage);
        });
        setAvailableStages(Array.from(stages).sort());
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

    if (selectedSector !== 'all') {
      result = result.filter((company) => {
        const sector = SECTORS_MAPPING[company.technology] || company.technology;
        return sector === selectedSector;
      });
    }

    if (selectedRegion !== 'all') {
      result = result.filter((company) => {
        const stateMatch = company.headquarters.match(/,\s*([A-Z]{2})\s*$/);
        if (stateMatch) {
          const region = REGIONS_MAP[stateMatch[1]];
          return region === selectedRegion;
        }
        return false;
      });
    }

    if (selectedFunding !== 'all') {
      result = result.filter((company) => {
        if (selectedFunding === 'public') {
          return company.ticker || company.is_publicly_traded;
        } else {
          return !company.ticker && !company.is_publicly_traded;
        }
      });
    }

    if (selectedStage !== 'all') {
      result = result.filter((company) => company.stage === selectedStage);
    }

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
  }, [companies, selectedSector, selectedRegion, selectedFunding, selectedStage, searchQuery]);

  const clearAllFilters = () => {
    setSelectedSector('all');
    setSelectedRegion('all');
    setSelectedFunding('all');
    setSelectedStage('all');
    setSearchQuery('');
  };

  const activeFiltersCount = [
    selectedSector !== 'all',
    selectedRegion !== 'all',
    selectedFunding !== 'all',
    selectedStage !== 'all',
    searchQuery !== '',
  ].filter(Boolean).length;

  const openCompanyModal = (company: Company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const viewCompanyProfile = (companyId: number) => {
    setIsModalOpen(false);
    navigate(`/companies/${companyId}`);
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

  return (
    <div className="min-h-screen pt-16 md:pt-24 bg-[#0A0A0A]">
      {/* Hero Banner */}
      <div className="relative bg-[#0F0F0F] border-b-4 border-[#B2FF59] overflow-hidden">
        <motion.div
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-[#B2FF59]/10 to-transparent"
        />
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-[#B2FF59] mb-3 text-3xl md:text-5xl font-extrabold font-tech uppercase tracking-wider">
              Company Database
            </h1>
            <p className="text-[#FAFAFA] max-w-2xl text-base md:text-lg font-medium">
              Comprehensive CRM-style directory of {companies.length} U.S. battery companies
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* CRM-Style Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-[#1A1A1A] rounded-xl border-2 border-[#2B2B2B] p-4 md:p-6 mb-6"
        >
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#666666]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search companies, technologies, locations..."
                className="w-full pl-10 pr-4 py-3 bg-[#0A0A0A] text-[#FAFAFA] rounded-lg border-2 border-[#2B2B2B] focus:border-[#B2FF59] outline-none transition-all duration-300 placeholder:text-[#666666] min-h-[44px]"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Subsector Filter */}
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger className="bg-[#0A0A0A] border-2 border-[#2B2B2B] hover:border-[#B2FF59] text-[#FAFAFA] min-h-[44px]">
                  <SelectValue placeholder="All Subsectors" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-2 border-[#2B2B2B]">
                  <SelectItem value="all">All Subsectors</SelectItem>
                  {availableSectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Region Filter */}
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="bg-[#0A0A0A] border-2 border-[#2B2B2B] hover:border-[#B2FF59] text-[#FAFAFA] min-h-[44px]">
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-2 border-[#2B2B2B]">
                  <SelectItem value="all">All Regions</SelectItem>
                  {availableRegions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Funding Filter */}
              <Select value={selectedFunding} onValueChange={setSelectedFunding}>
                <SelectTrigger className="bg-[#0A0A0A] border-2 border-[#2B2B2B] hover:border-[#B2FF59] text-[#FAFAFA] min-h-[44px]">
                  <SelectValue placeholder="All Funding Types" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-2 border-[#2B2B2B]">
                  <SelectItem value="all">All Funding Types</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>

              {/* Stage Filter */}
              <Select value={selectedStage} onValueChange={setSelectedStage}>
                <SelectTrigger className="bg-[#0A0A0A] border-2 border-[#2B2B2B] hover:border-[#B2FF59] text-[#FAFAFA] min-h-[44px]">
                  <SelectValue placeholder="All Stages" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-2 border-[#2B2B2B]">
                  <SelectItem value="all">All Stages</SelectItem>
                  {availableStages.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter Summary */}
            <div className="flex items-center justify-between pt-2 border-t-2 border-[#2B2B2B]">
              <span className="text-[#AAAAAA] text-sm">
                Showing <span className="text-[#B2FF59] font-bold">{filteredCompanies.length}</span> of <span className="text-[#FAFAFA] font-bold">{companies.length}</span> companies
                {activeFiltersCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-[#B2FF59] text-[#0A0A0A] rounded-full text-xs font-bold">
                    {activeFiltersCount} filters active
                  </span>
                )}
              </span>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-1.5 text-[#B2FF59] hover:text-[#A0E050] transition-colors text-sm font-semibold"
                >
                  <X className="size-4" />
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Company Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredCompanies.map((company, index) => {
            const sector = SECTORS_MAPPING[company.technology] || company.technology;
            const isPublic = company.ticker || company.is_publicly_traded;

            return (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.02 }}
                onClick={() => openCompanyModal(company)}
                className="bg-[#1A1A1A] p-5 rounded-xl border-2 border-[#2B2B2B] hover:border-[#B2FF59] hover:shadow-xl hover:shadow-[#B2FF59]/10 transition-all duration-300 cursor-pointer group"
              >
                {/* Company Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#0F0F0F] rounded-lg flex items-center justify-center flex-shrink-0 border-2 border-[#2B2B2B] group-hover:border-[#B2FF59] transition-all duration-300">
                    <Building2 className="size-6 text-[#B2FF59]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[#FAFAFA] mb-1 text-lg font-bold group-hover:text-[#B2FF59] transition-colors duration-300 truncate">
                      {company.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-[#AAAAAA]">
                      <MapPin className="size-3 flex-shrink-0" />
                      <span className="truncate">{company.headquarters}</span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-[#B2FF59]/20 text-[#B2FF59] rounded-md text-xs font-semibold border border-[#B2FF59]/50">
                    {sector}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-semibold border ${
                      isPublic
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                        : 'bg-[#1565C0]/20 text-[#1565C0] border-[#1565C0]/50'
                    }`}
                  >
                    {isPublic ? 'Public' : 'Private'}
                  </span>
                  {company.ticker && (
                    <span className="px-2 py-1 bg-[#2B2B2B] text-[#B2FF59] rounded-md text-xs font-mono font-bold">
                      {company.ticker}
                    </span>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b-2 border-[#2B2B2B]">
                  <div>
                    <div className="text-[#888888] text-xs mb-1 font-semibold uppercase tracking-wide">
                      Founded
                    </div>
                    <div className="text-[#FAFAFA] text-sm font-mono font-semibold">
                      {company.founded}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#888888] text-xs mb-1 font-semibold uppercase tracking-wide">
                      Employees
                    </div>
                    <div className="text-[#FAFAFA] text-sm font-mono font-semibold">
                      {company.employees}+
                    </div>
                  </div>
                </div>

                {/* View More Button */}
                <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#0F0F0F] text-[#B2FF59] rounded-lg border-2 border-[#2B2B2B] group-hover:border-[#B2FF59] group-hover:bg-[#B2FF59]/10 transition-all duration-300 font-medium text-sm">
                  View Details
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </motion.div>
            );
          })}
        </div>

        {filteredCompanies.length === 0 && (
          <div className="text-center py-12 px-4">
            <p className="text-[#AAAAAA] text-base md:text-lg">
              No companies match your filters. Try adjusting your search criteria.
            </p>
          </div>
        )}
      </div>

      {/* Company Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#0A0A0A] border-2 border-[#B2FF59]/30 max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedCompany && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-2xl text-[#B2FF59] font-bold font-tech uppercase">
                  <Building2 className="size-8" />
                  {selectedCompany.name}
                  {selectedCompany.ticker && (
                    <span className="text-lg">({selectedCompany.ticker})</span>
                  )}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1A1A1A] p-4 rounded-lg border-2 border-[#2B2B2B]">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="size-4 text-[#B2FF59]" />
                      <span className="text-[#888888] text-xs font-semibold uppercase">Location</span>
                    </div>
                    <p className="text-[#FAFAFA] font-medium">{selectedCompany.headquarters}</p>
                  </div>
                  <div className="bg-[#1A1A1A] p-4 rounded-lg border-2 border-[#2B2B2B]">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="size-4 text-[#B2FF59]" />
                      <span className="text-[#888888] text-xs font-semibold uppercase">Founded</span>
                    </div>
                    <p className="text-[#FAFAFA] font-medium">{selectedCompany.founded}</p>
                  </div>
                  <div className="bg-[#1A1A1A] p-4 rounded-lg border-2 border-[#2B2B2B]">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="size-4 text-[#B2FF59]" />
                      <span className="text-[#888888] text-xs font-semibold uppercase">Employees</span>
                    </div>
                    <p className="text-[#FAFAFA] font-medium">{selectedCompany.employees}+</p>
                  </div>
                  <div className="bg-[#1A1A1A] p-4 rounded-lg border-2 border-[#2B2B2B]">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="size-4 text-[#B2FF59]" />
                      <span className="text-[#888888] text-xs font-semibold uppercase">Capacity</span>
                    </div>
                    <p className="text-[#B2FF59] font-bold">
                      {selectedCompany.capacity_gwh ? `${selectedCompany.capacity_gwh} GWh` : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Technology */}
                <div className="bg-[#1A1A1A] p-4 rounded-lg border-2 border-[#2B2B2B]">
                  <h3 className="text-[#B2FF59] font-semibold mb-2 uppercase tracking-wide text-sm">Technology</h3>
                  <p className="text-[#FAFAFA]">{selectedCompany.technology}</p>
                </div>

                {/* Funding */}
                {selectedCompany.funding && (
                  <div className="bg-[#1A1A1A] p-4 rounded-lg border-2 border-[#2B2B2B]">
                    <h3 className="text-[#B2FF59] font-semibold mb-2 uppercase tracking-wide text-sm flex items-center gap-2">
                      <DollarSign className="size-4" />
                      Funding
                    </h3>
                    <p className="text-[#1565C0] font-bold text-lg">{selectedCompany.funding.total_raised}</p>
                  </div>
                )}

                {/* Stage */}
                {selectedCompany.stage && (
                  <div className="bg-[#1A1A1A] p-4 rounded-lg border-2 border-[#2B2B2B]">
                    <h3 className="text-[#B2FF59] font-semibold mb-2 uppercase tracking-wide text-sm flex items-center gap-2">
                      <TrendingUp className="size-4" />
                      Development Stage
                    </h3>
                    <p className="text-[#FAFAFA]">{selectedCompany.stage}</p>
                  </div>
                )}

                {/* View Profile Button */}
                <button
                  onClick={() => viewCompanyProfile(selectedCompany.id)}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-[#B2FF59] text-[#0A0A0A] rounded-lg hover:bg-[#A0E050] transition-all duration-300 font-bold text-base shadow-lg shadow-[#B2FF59]/30 hover:shadow-[#B2FF59]/50"
                >
                  <ExternalLink className="size-5" />
                  View Full Company Profile
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
