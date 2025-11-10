import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, MapPin, DollarSign, Award } from 'lucide-react';

const COMPANIES = [
  {
    id: 1,
    name: 'QuantumScape',
    sector: 'Solid-State',
    hq: 'San Jose, CA',
    marketCap: '$2.4B',
    doeSupport: '$175M',
    funding: '$1.5B',
    source: 'Public',
    details: {
      founded: '2010',
      employees: '450+',
      rdFocus: 'Ceramic solid-state separator technology',
      investors: 'Volkswagen, Bill Gates, Khosla Ventures',
    },
  },
  {
    id: 2,
    name: 'Redwood Materials',
    sector: 'Recycling',
    hq: 'Carson City, NV',
    marketCap: '$3.7B',
    doeSupport: '$2.0B',
    funding: '$2.3B',
    source: 'Private',
    details: {
      founded: '2017',
      employees: '800+',
      rdFocus: 'Lithium-ion battery recycling and refining',
      investors: 'T. Rowe Price, Baillie Gifford, Amazon',
    },
  },
  {
    id: 3,
    name: 'Form Energy',
    sector: 'Grid Storage',
    hq: 'Somerville, MA',
    marketCap: '$1.2B',
    doeSupport: '$150M',
    funding: '$829M',
    source: 'Private',
    details: {
      founded: '2017',
      employees: '300+',
      rdFocus: 'Iron-air battery technology for multi-day storage',
      investors: 'Breakthrough Energy Ventures, ArcelorMittal',
    },
  },
  {
    id: 4,
    name: 'Solid Power',
    sector: 'Solid-State',
    hq: 'Thornton, CO',
    marketCap: '$740M',
    doeSupport: '$75M',
    funding: '$540M',
    source: 'Public',
    details: {
      founded: '2012',
      employees: '200+',
      rdFocus: 'Sulfide-based solid electrolyte batteries',
      investors: 'BMW, Ford, Samsung',
    },
  },
  {
    id: 5,
    name: 'ESS Tech',
    sector: 'Flow Batteries',
    hq: 'Wilsonville, OR',
    marketCap: '$320M',
    doeSupport: '$50M',
    funding: '$430M',
    source: 'Public',
    details: {
      founded: '2011',
      employees: '150+',
      rdFocus: 'Iron flow battery for long-duration storage',
      investors: 'SoftBank, Breakthrough Energy Ventures',
    },
  },
];

const FILTERS = ['All', 'Solid-State', 'Recycling', 'Grid Storage', 'Flow Batteries'];

export function CompanyDashboard() {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const filteredCompanies =
    selectedFilter === 'All'
      ? COMPANIES
      : COMPANIES.filter((c) => c.sector === selectedFilter);

  return (
    <section className="py-24 bg-[#0F0F0F] relative">
      {/* Circuit Board Pattern */}
      <div className="absolute inset-0 opacity-3">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
              linear-gradient(90deg, #B2FF59 1px, transparent 1px),
              linear-gradient(#B2FF59 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8 md:mb-12"
        >
          <h2 className="text-[#B2FF59] mb-3 md:mb-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold font-tech uppercase tracking-wider">Company Intelligence Dashboard</h2>
          <p className="text-[#FAFAFA] text-base sm:text-lg mb-6 md:mb-8 font-medium px-2">
            Comprehensive view of key players in the U.S. battery ecosystem
          </p>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 md:gap-3">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 sm:px-4 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl transition-all duration-300 font-medium text-sm md:text-base min-h-[44px] ${
                  selectedFilter === filter
                    ? 'bg-[#B2FF59] text-[#0A0A0A] shadow-lg shadow-[#B2FF59]/30'
                    : 'bg-[#1A1A1A] text-[#AAAAAA] hover:bg-[#2B2B2B] border-2 border-[#2B2B2B]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Desktop Table / Mobile Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-[#1A1A1A] rounded-xl md:rounded-2xl border-2 border-[#B2FF59]/30 overflow-hidden shadow-2xl"
        >
          {/* Desktop Header - Hidden on Mobile */}
          <div className="hidden lg:grid grid-cols-7 gap-4 p-5 bg-[#0F0F0F] border-b-2 border-[#B2FF59]/30">
            <div className="text-[#B2FF59] font-bold text-sm">Company</div>
            <div className="text-[#B2FF59] font-bold text-sm">Sector</div>
            <div className="text-[#B2FF59] font-bold text-sm">HQ</div>
            <div className="text-[#B2FF59] font-bold text-sm">Market Cap</div>
            <div className="text-[#B2FF59] font-bold text-sm">DOE Support</div>
            <div className="text-[#B2FF59] font-bold text-sm">Funding</div>
            <div className="text-[#B2FF59] font-bold text-sm">Source</div>
          </div>

          {/* Rows - Responsive Cards/Table */}
          <div>
            {filteredCompanies.map((company, index) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                {/* Desktop Table Row */}
                <div
                  onClick={() =>
                    setExpandedRow(expandedRow === company.id ? null : company.id)
                  }
                  className={`hidden lg:grid grid-cols-7 gap-4 p-5 cursor-pointer transition-all duration-300 ${
                    index % 2 === 0 ? 'bg-[#1A1A1A]' : 'bg-[#141414]'
                  } hover:bg-[#222222] border-b border-[#2B2B2B]`}
                >
                  <div className="text-[#FAFAFA] font-medium flex items-center gap-2 text-sm">
                    {company.name}
                    {expandedRow === company.id ? (
                      <ChevronUp className="size-4 text-[#B2FF59]" />
                    ) : (
                      <ChevronDown className="size-4 text-[#666666]" />
                    )}
                  </div>
                  <div className="text-[#CCCCCC] text-sm">{company.sector}</div>
                  <div className="text-[#CCCCCC] text-sm">{company.hq}</div>
                  <div className="text-[#B2FF59] font-mono font-bold text-sm">{company.marketCap}</div>
                  <div className="text-[#1565C0] font-mono font-bold text-sm">{company.doeSupport}</div>
                  <div className="text-[#FAFAFA] font-mono font-bold text-sm">{company.funding}</div>
                  <div>
                    <span
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        company.source === 'Public'
                          ? 'bg-[#B2FF59]/20 text-[#B2FF59] border border-[#B2FF59]/50'
                          : 'bg-[#1565C0]/20 text-[#1565C0] border border-[#1565C0]/50'
                      }`}
                    >
                      {company.source}
                    </span>
                  </div>
                </div>

                {/* Mobile Card */}
                <div
                  onClick={() =>
                    setExpandedRow(expandedRow === company.id ? null : company.id)
                  }
                  className={`lg:hidden p-4 cursor-pointer transition-all duration-300 ${
                    index % 2 === 0 ? 'bg-[#1A1A1A]' : 'bg-[#141414]'
                  } hover:bg-[#222222] border-b border-[#2B2B2B]`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-[#FAFAFA] font-bold text-base mb-1">{company.name}</h3>
                      <p className="text-[#CCCCCC] text-sm">{company.sector}</p>
                    </div>
                    {expandedRow === company.id ? (
                      <ChevronUp className="size-5 text-[#B2FF59] flex-shrink-0" />
                    ) : (
                      <ChevronDown className="size-5 text-[#666666] flex-shrink-0" />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-[#AAAAAA] text-xs mb-1">HQ</div>
                      <div className="text-[#FAFAFA]">{company.hq}</div>
                    </div>
                    <div>
                      <div className="text-[#AAAAAA] text-xs mb-1">Market Cap</div>
                      <div className="text-[#B2FF59] font-mono font-bold">{company.marketCap}</div>
                    </div>
                    <div>
                      <div className="text-[#AAAAAA] text-xs mb-1">DOE Support</div>
                      <div className="text-[#1565C0] font-mono font-bold">{company.doeSupport}</div>
                    </div>
                    <div>
                      <div className="text-[#AAAAAA] text-xs mb-1">Funding</div>
                      <div className="text-[#FAFAFA] font-mono font-bold">{company.funding}</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        company.source === 'Public'
                          ? 'bg-[#B2FF59]/20 text-[#B2FF59] border border-[#B2FF59]/50'
                          : 'bg-[#1565C0]/20 text-[#1565C0] border border-[#1565C0]/50'
                      }`}
                    >
                      {company.source}
                    </span>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedRow === company.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-[#0F0F0F] border-b-2 border-[#B2FF59]/30 overflow-hidden"
                    >
                      <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-[#B2FF59] mb-4 font-bold text-base md:text-lg">Company Details</h4>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-[#CCCCCC] text-sm md:text-base">
                              <MapPin className="size-4 text-[#B2FF59] flex-shrink-0" />
                              Founded: <span className="text-[#FAFAFA] font-semibold">{company.details.founded}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[#CCCCCC] text-sm md:text-base">
                              <DollarSign className="size-4 text-[#B2FF59] flex-shrink-0" />
                              Employees: <span className="text-[#FAFAFA] font-semibold">{company.details.employees}</span>
                            </div>
                            <div className="flex items-start gap-2 text-[#CCCCCC] text-sm md:text-base">
                              <Award className="size-4 text-[#B2FF59] mt-1 flex-shrink-0" />
                              <div>
                                <div>R&D Focus:</div>
                                <div className="text-[#FAFAFA] font-semibold mt-1">{company.details.rdFocus}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-[#B2FF59] mb-4 font-bold text-base md:text-lg">Key Investors</h4>
                          <p className="text-[#CCCCCC] leading-relaxed mb-4 text-sm md:text-base">
                            {company.details.investors}
                          </p>
                          <button className="w-full md:w-auto px-6 py-3 bg-[#B2FF59] text-[#0A0A0A] rounded-lg md:rounded-xl hover:bg-[#A0E050] transition-colors duration-300 shadow-lg shadow-[#B2FF59]/30 font-semibold text-sm md:text-base min-h-[44px]">
                            View Full Profile →
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}