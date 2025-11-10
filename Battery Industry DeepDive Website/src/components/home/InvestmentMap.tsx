import { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, TrendingUp, Building2 } from 'lucide-react';

const INVESTMENT_FLOWS = [
  {
    id: 1,
    from: 'California',
    to: 'Nevada',
    amount: '$2.8B',
    investors: ['Tesla', 'Panasonic', 'Redwood Materials'],
    companies: ['Redwood Materials', 'Ioneer'],
    type: 'Private Capital',
  },
  {
    id: 2,
    from: 'Massachusetts',
    to: 'West Virginia',
    amount: '$835M',
    investors: ['Breakthrough Energy', 'ArcelorMittal'],
    companies: ['Form Energy'],
    type: 'Private Capital',
  },
  {
    id: 3,
    from: 'Federal (DOE)',
    to: 'Michigan',
    amount: '$1.7B',
    investors: ['U.S. Department of Energy'],
    companies: ['GM, Ford Battery Plants'],
    type: 'DOE Loans',
  },
  {
    id: 4,
    from: 'Texas',
    to: 'Colorado',
    amount: '$540M',
    investors: ['BMW', 'Ford', 'Samsung'],
    companies: ['Solid Power'],
    type: 'Equity Ownership',
  },
  {
    id: 5,
    from: 'New York',
    to: 'Oregon',
    amount: '$430M',
    investors: ['SoftBank', 'Breakthrough Energy'],
    companies: ['ESS Tech'],
    type: 'Private Capital',
  },
];

const TABS = ['Private Capital', 'DOE Loans', 'Equity Ownership'];

export function InvestmentMap() {
  const [activeTab, setActiveTab] = useState('Private Capital');
  const [hoveredFlow, setHoveredFlow] = useState<number | null>(null);

  const filteredFlows = INVESTMENT_FLOWS.filter((flow) =>
    activeTab === 'Private Capital' ? true : flow.type === activeTab
  );

  return (
    <section className="py-16 md:py-24 bg-[#2B2B2B]">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-[#B2FF59] mb-3 md:mb-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold font-tech uppercase tracking-wider">Investment Flow Map</h2>
          <p className="text-[#FAFAFA]/70 text-base sm:text-lg max-w-2xl mx-auto px-2">
            Track capital movements and strategic investments across the U.S. battery ecosystem
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 md:gap-3 justify-center mb-8 md:mb-12">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 sm:px-5 md:px-6 py-2.5 md:py-3 rounded-lg transition-all duration-300 text-sm md:text-base min-h-[44px] ${
                activeTab === tab
                  ? 'bg-[#B2FF59] text-[#1E1E1E] font-semibold'
                  : 'bg-[#1E1E1E] text-[#FAFAFA]/70 hover:bg-[#303030]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Map Visual */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-[#1E1E1E] rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-12 mb-6 md:mb-8 border border-[#B2FF59]/20 relative overflow-hidden min-h-[300px] sm:min-h-[400px] md:min-h-[500px]"
        >
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="h-full w-full"
              style={{
                backgroundImage: `linear-gradient(#B2FF59 1px, transparent 1px), linear-gradient(90deg, #B2FF59 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          {/* Animated Arcs */}
          <div className="relative h-[250px] sm:h-[350px] md:h-[450px]">
            {filteredFlows.map((flow, index) => {
              const startX = 20 + (index % 3) * 30;
              const startY = 30 + Math.floor(index / 3) * 50;
              const endX = 60 + (index % 2) * 20;
              const endY = 30 + ((index + 1) % 3) * 50;

              return (
                <motion.div
                  key={flow.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  onMouseEnter={() => setHoveredFlow(flow.id)}
                  onMouseLeave={() => setHoveredFlow(null)}
                  className="absolute"
                >
                  {/* Start Point */}
                  <motion.div
                    className="absolute rounded-full bg-[#1565C0] flex items-center justify-center cursor-pointer"
                    style={{
                      left: `${startX}%`,
                      top: `${startY}%`,
                      width: hoveredFlow === flow.id ? '40px' : '28px',
                      height: hoveredFlow === flow.id ? '40px' : '28px',
                    }}
                    whileHover={{ scale: 1.2 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MapPin className="size-3 sm:size-4 text-[#FAFAFA]" />
                  </motion.div>

                  {/* Arc Path */}
                  <svg
                    className="absolute"
                    style={{
                      left: `${startX}%`,
                      top: `${startY}%`,
                      width: `${Math.abs(endX - startX)}%`,
                      height: `${Math.abs(endY - startY) + 20}%`,
                    }}
                  >
                    <motion.path
                      d={`M 0 0 Q ${(endX - startX) / 2}% -50 ${endX - startX}% ${endY - startY}%`}
                      stroke="#B2FF59"
                      strokeWidth={hoveredFlow === flow.id ? '3' : '2'}
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, delay: index * 0.1 }}
                      opacity={hoveredFlow === flow.id ? 1 : 0.6}
                    />
                  </svg>

                  {/* End Point */}
                  <motion.div
                    className="absolute rounded-full bg-[#B2FF59] flex items-center justify-center cursor-pointer"
                    style={{
                      left: `${endX}%`,
                      top: `${endY}%`,
                      width: hoveredFlow === flow.id ? '40px' : '28px',
                      height: hoveredFlow === flow.id ? '40px' : '28px',
                    }}
                    whileHover={{ scale: 1.2 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Building2 className="size-3 sm:size-4 text-[#1E1E1E]" />
                  </motion.div>

                  {/* Info Tooltip */}
                  {hoveredFlow === flow.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute bg-[#303030] p-3 sm:p-4 rounded-lg shadow-xl border border-[#B2FF59] z-10"
                      style={{
                        left: `${(startX + endX) / 2}%`,
                        top: `${(startY + endY) / 2 - 10}%`,
                        transform: 'translate(-50%, -50%)',
                        minWidth: '200px',
                        maxWidth: '90vw',
                      }}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-[#B2FF59] truncate">{flow.from}</span>
                          <span className="text-[#FAFAFA]/50 mx-2">→</span>
                          <span className="text-[#B2FF59] truncate">{flow.to}</span>
                        </div>
                        <div className="text-[#FAFAFA] font-mono text-sm sm:text-base">{flow.amount}</div>
                        <div className="text-[#FAFAFA]/70 text-xs sm:text-sm">
                          <div className="truncate">Investors: {flow.investors.join(', ')}</div>
                          <div className="mt-1 truncate">Companies: {flow.companies.join(', ')}</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="absolute bottom-3 sm:bottom-6 left-3 sm:left-6 flex gap-3 sm:gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#1565C0]" />
              <span className="text-[#FAFAFA]/70 text-xs sm:text-sm">Origin</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#B2FF59]" />
              <span className="text-[#FAFAFA]/70 text-xs sm:text-sm">Destination</span>
            </div>
          </div>
        </motion.div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-[#1E1E1E] p-4 sm:p-5 md:p-6 rounded-lg md:rounded-xl border border-[#B2FF59]/20"
          >
            <TrendingUp className="size-6 sm:size-7 md:size-8 text-[#B2FF59] mb-2 md:mb-3" />
            <div className="text-[#FAFAFA] font-mono text-lg sm:text-xl md:text-2xl mb-1">$8.3B</div>
            <div className="text-[#FAFAFA]/70 text-xs sm:text-sm">Total Investment Flow</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-[#1E1E1E] p-4 sm:p-5 md:p-6 rounded-lg md:rounded-xl border border-[#1565C0]/20"
          >
            <MapPin className="size-6 sm:size-7 md:size-8 text-[#1565C0] mb-2 md:mb-3" />
            <div className="text-[#FAFAFA] font-mono text-lg sm:text-xl md:text-2xl mb-1">24</div>
            <div className="text-[#FAFAFA]/70 text-xs sm:text-sm">Active Investment Hubs</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-[#1E1E1E] p-4 sm:p-5 md:p-6 rounded-lg md:rounded-xl border border-[#B2FF59]/20"
          >
            <Building2 className="size-6 sm:size-7 md:size-8 text-[#B2FF59] mb-2 md:mb-3" />
            <div className="text-[#FAFAFA] font-mono text-lg sm:text-xl md:text-2xl mb-1">142</div>
            <div className="text-[#FAFAFA]/70 text-xs sm:text-sm">Funded Companies</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
