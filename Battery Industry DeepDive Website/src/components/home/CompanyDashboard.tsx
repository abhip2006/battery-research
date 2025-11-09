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

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-[#B2FF59] mb-4 text-5xl font-extrabold font-tech uppercase tracking-wider">Company Intelligence Dashboard</h2>
          <p className="text-[#FAFAFA] text-lg mb-8 font-medium">
            Comprehensive view of key players in the U.S. battery ecosystem
          </p>

          {/* Filters */}
          <div className="flex gap-3">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-5 py-2.5 rounded-xl transition-all duration-300 font-medium ${
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

        {/* Table */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-[#1A1A1A] rounded-2xl border-2 border-[#B2FF59]/30 overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="grid grid-cols-7 gap-4 p-5 bg-[#0F0F0F] border-b-2 border-[#B2FF59]/30">
            <div className="text-[#B2FF59] font-bold">Company</div>
            <div className="text-[#B2FF59] font-bold">Sector</div>
            <div className="text-[#B2FF59] font-bold">HQ</div>
            <div className="text-[#B2FF59] font-bold">Market Cap</div>
            <div className="text-[#B2FF59] font-bold">DOE Support</div>
            <div className="text-[#B2FF59] font-bold">Funding</div>
            <div className="text-[#B2FF59] font-bold">Source</div>
          </div>

          {/* Rows */}
          <div>
            {filteredCompanies.map((company, index) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <div
                  onClick={() =>
                    setExpandedRow(expandedRow === company.id ? null : company.id)
                  }
                  className={`grid grid-cols-7 gap-4 p-5 cursor-pointer transition-all duration-300 ${
                    index % 2 === 0 ? 'bg-[#1A1A1A]' : 'bg-[#141414]'
                  } hover:bg-[#222222] border-b border-[#2B2B2B]`}
                >
                  <div className="text-[#FAFAFA] font-medium flex items-center gap-2">
                    {company.name}
                    {expandedRow === company.id ? (
                      <ChevronUp className="size-4 text-[#B2FF59]" />
                    ) : (
                      <ChevronDown className="size-4 text-[#666666]" />
                    )}
                  </div>
                  <div className="text-[#CCCCCC]">{company.sector}</div>
                  <div className="text-[#CCCCCC]">{company.hq}</div>
                  <div className="text-[#B2FF59] font-mono font-bold">{company.marketCap}</div>
                  <div className="text-[#1565C0] font-mono font-bold">{company.doeSupport}</div>
                  <div className="text-[#FAFAFA] font-mono font-bold">{company.funding}</div>
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
                      <div className="p-8 grid grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-[#B2FF59] mb-4 font-bold text-lg">Company Details</h4>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-[#CCCCCC]">
                              <MapPin className="size-4 text-[#B2FF59]" />
                              Founded: <span className="text-[#FAFAFA] font-semibold">{company.details.founded}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[#CCCCCC]">
                              <DollarSign className="size-4 text-[#B2FF59]" />
                              Employees: <span className="text-[#FAFAFA] font-semibold">{company.details.employees}</span>
                            </div>
                            <div className="flex items-start gap-2 text-[#CCCCCC]">
                              <Award className="size-4 text-[#B2FF59] mt-1" />
                              <div>
                                <div>R&D Focus:</div>
                                <div className="text-[#FAFAFA] font-semibold mt-1">{company.details.rdFocus}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-[#B2FF59] mb-4 font-bold text-lg">Key Investors</h4>
                          <p className="text-[#CCCCCC] leading-relaxed mb-4">
                            {company.details.investors}
                          </p>
                          <button className="px-6 py-3 bg-[#B2FF59] text-[#0A0A0A] rounded-xl hover:bg-[#A0E050] transition-colors duration-300 shadow-lg shadow-[#B2FF59]/30 font-semibold">
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