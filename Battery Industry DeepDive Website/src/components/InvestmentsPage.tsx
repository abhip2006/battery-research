import { useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Building2, DollarSign, PieChart } from 'lucide-react';

const INVESTMENT_DATA = [
  { sector: 'Grid Storage', value: 12500, percentage: 42, color: '#B2FF59' },
  { sector: 'Solid-State', value: 4200, percentage: 14, color: '#1565C0' },
  { sector: 'Recycling', value: 3100, percentage: 10, color: '#FFB300' },
  { sector: 'Manufacturing', value: 6800, percentage: 23, color: '#B2FF59' },
  { sector: 'Flow Batteries', value: 1800, percentage: 6, color: '#1565C0' },
  { sector: 'Materials', value: 1500, percentage: 5, color: '#FFB300' },
];

const INVESTORS = [
  {
    name: 'Breakthrough Energy Ventures',
    type: 'Venture Capital',
    portfolio: ['Form Energy', 'ESS Tech', 'QuantumScape'],
    totalInvested: '$1.2B',
    focus: 'Climate tech and deep tech',
  },
  {
    name: 'U.S. Department of Energy',
    type: 'Government',
    portfolio: ['Redwood Materials', 'GM Battery Plants', 'Solid Power'],
    totalInvested: '$4.8B',
    focus: 'Domestic manufacturing and innovation',
  },
  {
    name: 'SoftBank Vision Fund',
    type: 'Private Equity',
    portfolio: ['ESS Tech', 'Northvolt', 'Amprius'],
    totalInvested: '$890M',
    focus: 'Growth-stage battery companies',
  },
  {
    name: 'T. Rowe Price',
    type: 'Asset Manager',
    portfolio: ['Redwood Materials', 'QuantumScape', 'Rivian'],
    totalInvested: '$2.1B',
    focus: 'EV and battery value chain',
  },
  {
    name: 'Volkswagen Group',
    type: 'Strategic Corporate',
    portfolio: ['QuantumScape', 'Solid Power', 'Northvolt'],
    totalInvested: '$3.5B',
    focus: 'Solid-state and manufacturing',
  },
];

const DEALS = [
  {
    company: 'Redwood Materials',
    investor: 'T. Rowe Price',
    amount: '$1.0B',
    round: 'Series D',
    date: 'Aug 2024',
    sector: 'Recycling',
  },
  {
    company: 'Form Energy',
    investor: 'ArcelorMittal',
    amount: '$450M',
    round: 'Series E',
    date: 'Jul 2024',
    sector: 'Grid Storage',
  },
  {
    company: 'QuantumScape',
    investor: 'Volkswagen',
    amount: '$300M',
    round: 'Strategic Investment',
    date: 'Jun 2024',
    sector: 'Solid-State',
  },
  {
    company: 'Solid Power',
    investor: 'BMW & Ford',
    amount: '$135M',
    round: 'Series B-2',
    date: 'May 2024',
    sector: 'Solid-State',
  },
];

export function InvestmentsPage() {
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);

  return (
    <div className="min-h-screen pt-20 sm:pt-24 bg-[#0A0A0A]">
      {/* Hero Banner */}
      <div className="relative bg-[#0F0F0F] border-b-4 border-[#B2FF59] overflow-hidden">
        <motion.div
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-[#B2FF59]/10 to-transparent"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-[#B2FF59] mb-3 sm:mb-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold font-tech uppercase tracking-wider">Investment Landscape</h1>
            <p className="text-[#FAFAFA] max-w-2xl text-base sm:text-lg font-medium">
              Track capital flows, investor portfolios, and funding trends across the U.S. battery ecosystem
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-12">
        {/* Investment Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-[#B2FF59] mb-4 sm:mb-6 text-2xl sm:text-3xl font-bold">Investment Distribution by Sector</h2>
          <div className="bg-[#1E1E1E] p-4 sm:p-8 rounded-2xl border border-[#B2FF59]/20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {INVESTMENT_DATA.map((item, index) => (
                <motion.div
                  key={item.sector}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  onHoverStart={() => setHoveredSector(item.sector)}
                  onHoverEnd={() => setHoveredSector(null)}
                  className="relative group cursor-pointer"
                >
                  <div
                    className="p-4 sm:p-6 rounded-xl border-2 transition-all duration-300 min-h-[120px] sm:min-h-[140px]"
                    style={{
                      backgroundColor: hoveredSector === item.sector ? item.color : '#2B2B2B',
                      borderColor: hoveredSector === item.sector ? item.color : 'transparent',
                      boxShadow:
                        hoveredSector === item.sector ? `0 10px 40px ${item.color}40` : 'none',
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <PieChart
                        className="size-7 sm:size-8 transition-colors duration-300"
                        style={{
                          color: hoveredSector === item.sector ? '#1E1E1E' : item.color,
                        }}
                      />
                      <motion.div
                        animate={{
                          scale: hoveredSector === item.sector ? 1.2 : 1,
                        }}
                        className="font-mono transition-colors duration-300"
                        style={{
                          color: hoveredSector === item.sector ? '#1E1E1E' : item.color,
                        }}
                      >
                        {item.percentage}%
                      </motion.div>
                    </div>
                    <div
                      className="mb-2 transition-colors duration-300"
                      style={{
                        color: hoveredSector === item.sector ? '#1E1E1E' : '#FAFAFA',
                      }}
                    >
                      {item.sector}
                    </div>
                    <div
                      className="text-sm font-mono transition-colors duration-300"
                      style={{
                        color: hoveredSector === item.sector ? '#1E1E1E' : item.color,
                      }}
                    >
                      ${(item.value / 1000).toFixed(1)}B
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 sm:mt-8 pt-6 border-t border-[#B2FF59]/20 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center sm:text-left">
                <div className="text-[#FAFAFA]/60 text-xs sm:text-sm mb-1">Total Investment (2020-2024)</div>
                <div className="text-[#B2FF59] font-mono text-xl sm:text-2xl">$29.9B</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-[#FAFAFA]/60 text-xs sm:text-sm mb-1">YoY Growth</div>
                <div className="text-[#B2FF59] font-mono text-xl sm:text-2xl">+34%</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-[#FAFAFA]/60 text-xs sm:text-sm mb-1">Active Investors</div>
                <div className="text-[#B2FF59] font-mono text-xl sm:text-2xl">240+</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Key Investors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-[#B2FF59] mb-4 sm:mb-6 text-2xl sm:text-3xl font-bold">Key Investors</h2>
          <div className="space-y-3 sm:space-y-4">
            {INVESTORS.map((investor, index) => (
              <motion.div
                key={investor.name}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-[#1E1E1E] p-4 sm:p-6 rounded-xl border border-[#B2FF59]/20 hover:border-[#B2FF59] hover:shadow-lg hover:shadow-[#B2FF59]/10 transition-all duration-300 group"
              >
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:justify-between">
                  <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <Building2 className="size-5 sm:size-6 text-[#B2FF59] flex-shrink-0" />
                        <h3 className="text-[#FAFAFA] text-base sm:text-lg group-hover:text-[#B2FF59] transition-colors duration-300">
                          {investor.name}
                        </h3>
                      </div>
                      <span className="px-3 py-1.5 bg-[#1565C0]/20 text-[#1565C0] text-xs sm:text-sm rounded self-start sm:self-auto">
                        {investor.type}
                      </span>
                    </div>
                    <p className="text-[#FAFAFA]/70 text-sm mb-3">{investor.focus}</p>
                    <div className="flex flex-wrap gap-2">
                      {investor.portfolio.map((company) => (
                        <span
                          key={company}
                          className="px-2 py-1 bg-[#2B2B2B] text-[#FAFAFA]/70 text-xs rounded border border-[#B2FF59]/20"
                        >
                          {company}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <div className="text-[#FAFAFA]/60 text-xs sm:text-sm mb-1">Total Invested</div>
                    <div className="text-[#B2FF59] font-mono text-lg sm:text-base">{investor.totalInvested}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Deals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-[#B2FF59] mb-4 sm:mb-6 text-2xl sm:text-3xl font-bold">Recent Deals</h2>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-[#1E1E1E] rounded-xl border border-[#B2FF59]/20 overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-6 gap-4 p-4 bg-[#2B2B2B] border-b border-[#B2FF59]/20">
              <div className="text-[#B2FF59] text-sm font-semibold">Company</div>
              <div className="text-[#B2FF59] text-sm font-semibold">Investor</div>
              <div className="text-[#B2FF59] text-sm font-semibold">Amount</div>
              <div className="text-[#B2FF59] text-sm font-semibold">Round</div>
              <div className="text-[#B2FF59] text-sm font-semibold">Date</div>
              <div className="text-[#B2FF59] text-sm font-semibold">Sector</div>
            </div>

            {/* Rows */}
            {DEALS.map((deal, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={`grid grid-cols-6 gap-4 p-4 ${
                  index % 2 === 0 ? 'bg-[#1E1E1E]' : 'bg-[#2B2B2B]'
                } hover:bg-[#303030] transition-all duration-300`}
              >
                <div className="text-[#FAFAFA]">{deal.company}</div>
                <div className="text-[#FAFAFA]/70">{deal.investor}</div>
                <div className="text-[#B2FF59] font-mono">{deal.amount}</div>
                <div className="text-[#1565C0]">{deal.round}</div>
                <div className="text-[#FAFAFA]/70">{deal.date}</div>
                <div>
                  <span className="px-2 py-1 bg-[#B2FF59]/20 text-[#B2FF59] text-xs rounded">
                    {deal.sector}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {DEALS.map((deal, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-[#1E1E1E] p-4 rounded-xl border border-[#B2FF59]/20"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-[#FAFAFA] font-semibold text-base">{deal.company}</h3>
                  <span className="px-2 py-1 bg-[#B2FF59]/20 text-[#B2FF59] text-xs rounded ml-2 flex-shrink-0">
                    {deal.sector}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#FAFAFA]/60">Investor</span>
                    <span className="text-[#FAFAFA]">{deal.investor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#FAFAFA]/60">Amount</span>
                    <span className="text-[#B2FF59] font-mono">{deal.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#FAFAFA]/60">Round</span>
                    <span className="text-[#1565C0]">{deal.round}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#FAFAFA]/60">Date</span>
                    <span className="text-[#FAFAFA]">{deal.date}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
