import { useState } from 'react';
import { motion } from 'motion/react';
import { Building2, MapPin, TrendingUp, DollarSign, Search } from 'lucide-react';

const COMPANIES_DATA = [
  {
    id: 1,
    name: 'QuantumScape',
    logo: '⚡',
    sector: 'Solid-State',
    region: 'West',
    hq: 'San Jose, CA',
    founded: '2010',
    marketCap: '$2.4B',
    doeSupport: '$175M',
    employees: '450+',
    status: 'Public',
  },
  {
    id: 2,
    name: 'Redwood Materials',
    logo: '♻️',
    sector: 'Recycling',
    region: 'West',
    hq: 'Carson City, NV',
    founded: '2017',
    marketCap: '$3.7B',
    doeSupport: '$2.0B',
    employees: '800+',
    status: 'Private',
  },
  {
    id: 3,
    name: 'Form Energy',
    logo: '🔋',
    sector: 'Grid Storage',
    region: 'Northeast',
    hq: 'Somerville, MA',
    founded: '2017',
    marketCap: '$1.2B',
    doeSupport: '$150M',
    employees: '300+',
    status: 'Private',
  },
  {
    id: 4,
    name: 'Solid Power',
    logo: '⚛️',
    sector: 'Solid-State',
    region: 'West',
    hq: 'Thornton, CO',
    founded: '2012',
    marketCap: '$740M',
    doeSupport: '$75M',
    employees: '200+',
    status: 'Public',
  },
  {
    id: 5,
    name: 'ESS Tech',
    logo: '🌊',
    sector: 'Flow Batteries',
    region: 'West',
    hq: 'Wilsonville, OR',
    founded: '2011',
    marketCap: '$320M',
    doeSupport: '$50M',
    employees: '150+',
    status: 'Public',
  },
  {
    id: 6,
    name: 'American Battery Technology',
    logo: '🔬',
    sector: 'Materials',
    region: 'West',
    hq: 'Reno, NV',
    founded: '2018',
    marketCap: '$280M',
    doeSupport: '$115M',
    employees: '120+',
    status: 'Public',
  },
];

const SECTORS = ['All', 'Solid-State', 'Recycling', 'Grid Storage', 'Flow Batteries', 'Materials'];
const REGIONS = ['All', 'West', 'Northeast', 'Midwest', 'South'];
const FUNDING_TYPES = ['All', 'Public', 'Private'];

export function CompaniesPage() {
  const [selectedSector, setSelectedSector] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedFunding, setSelectedFunding] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCompanies = COMPANIES_DATA.filter((company) => {
    const matchesSector = selectedSector === 'All' || company.sector === selectedSector;
    const matchesRegion = selectedRegion === 'All' || company.region === selectedRegion;
    const matchesFunding = selectedFunding === 'All' || company.status === selectedFunding;
    const matchesSearch =
      searchQuery === '' ||
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.sector.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSector && matchesRegion && matchesFunding && matchesSearch;
  });

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
            <h1 className="text-[#B2FF59] mb-4 text-5xl font-extrabold font-tech uppercase tracking-wider">Company Directory</h1>
            <p className="text-[#FAFAFA] max-w-2xl text-lg font-medium">
              Comprehensive database of U.S. battery companies across all subsectors
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

            {filteredCompanies.map((company, index) => (
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
                    {company.logo}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-[#FAFAFA] mb-2 text-xl font-bold group-hover:text-[#B2FF59] transition-colors duration-300">
                          {company.name}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-[#AAAAAA]">
                          <span className="px-3 py-1.5 bg-[#B2FF59]/20 text-[#B2FF59] rounded-lg font-semibold border border-[#B2FF59]/50">
                            {company.sector}
                          </span>
                          <span className="flex items-center gap-1.5 font-medium">
                            <MapPin className="size-3.5" />
                            {company.hq}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-4 py-2 rounded-lg font-semibold border-2 ${
                          company.status === 'Public'
                            ? 'bg-[#B2FF59]/20 text-[#B2FF59] border-[#B2FF59]/50'
                            : 'bg-[#1565C0]/20 text-[#1565C0] border-[#1565C0]/50'
                        }`}
                      >
                        {company.status}
                      </span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-4 mt-5 pt-5 border-t-2 border-[#2B2B2B]">
                      <div>
                        <div className="text-[#888888] text-xs mb-1.5 font-semibold uppercase tracking-wide">Founded</div>
                        <div className="text-[#FAFAFA] font-mono font-semibold">{company.founded}</div>
                      </div>
                      <div>
                        <div className="text-[#888888] text-xs mb-1.5 font-semibold uppercase tracking-wide">Market Cap</div>
                        <div className="text-[#B2FF59] font-mono font-bold">{company.marketCap}</div>
                      </div>
                      <div>
                        <div className="text-[#888888] text-xs mb-1.5 font-semibold uppercase tracking-wide">DOE Support</div>
                        <div className="text-[#1565C0] font-mono font-bold">{company.doeSupport}</div>
                      </div>
                      <div>
                        <div className="text-[#888888] text-xs mb-1.5 font-semibold uppercase tracking-wide">Employees</div>
                        <div className="text-[#FAFAFA] font-mono font-semibold">{company.employees}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}