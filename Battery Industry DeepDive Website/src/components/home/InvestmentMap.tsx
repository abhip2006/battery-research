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
    <section className="py-24 bg-[#2B2B2B]">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-[#B2FF59] mb-4">Investment Flow Map</h2>
          <p className="text-[#FAFAFA]/70 max-w-2xl mx-auto">
            Track capital movements and strategic investments across the U.S. battery ecosystem
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-3 justify-center mb-12">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-[#B2FF59] text-[#1E1E1E]'
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
          className="bg-[#1E1E1E] rounded-2xl p-12 mb-8 border border-[#B2FF59]/20 relative overflow-hidden min-h-[500px]"
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
          <div className="relative h-[450px]">
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
                      width: hoveredFlow === flow.id ? '48px' : '32px',
                      height: hoveredFlow === flow.id ? '48px' : '32px',
                    }}
                    whileHover={{ scale: 1.2 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MapPin className="size-4 text-[#FAFAFA]" />
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
                      width: hoveredFlow === flow.id ? '48px' : '32px',
                      height: hoveredFlow === flow.id ? '48px' : '32px',
                    }}
                    whileHover={{ scale: 1.2 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Building2 className="size-4 text-[#1E1E1E]" />
                  </motion.div>

                  {/* Info Tooltip */}
                  {hoveredFlow === flow.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute bg-[#303030] p-4 rounded-lg shadow-xl border border-[#B2FF59] z-10"
                      style={{
                        left: `${(startX + endX) / 2}%`,
                        top: `${(startY + endY) / 2 - 10}%`,
                        transform: 'translate(-50%, -50%)',
                        minWidth: '250px',
                      }}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[#B2FF59]">{flow.from}</span>
                          <span className="text-[#FAFAFA]/50">→</span>
                          <span className="text-[#B2FF59]">{flow.to}</span>
                        </div>
                        <div className="text-[#FAFAFA] font-mono">{flow.amount}</div>
                        <div className="text-[#FAFAFA]/70 text-sm">
                          <div>Investors: {flow.investors.join(', ')}</div>
                          <div className="mt-1">Companies: {flow.companies.join(', ')}</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="absolute bottom-6 left-6 flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#1565C0]" />
              <span className="text-[#FAFAFA]/70 text-sm">Origin</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#B2FF59]" />
              <span className="text-[#FAFAFA]/70 text-sm">Destination</span>
            </div>
          </div>
        </motion.div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-[#1E1E1E] p-6 rounded-xl border border-[#B2FF59]/20"
          >
            <TrendingUp className="size-8 text-[#B2FF59] mb-3" />
            <div className="text-[#FAFAFA] font-mono mb-1">$8.3B</div>
            <div className="text-[#FAFAFA]/70 text-sm">Total Investment Flow</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-[#1E1E1E] p-6 rounded-xl border border-[#1565C0]/20"
          >
            <MapPin className="size-8 text-[#1565C0] mb-3" />
            <div className="text-[#FAFAFA] font-mono mb-1">24</div>
            <div className="text-[#FAFAFA]/70 text-sm">Active Investment Hubs</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-[#1E1E1E] p-6 rounded-xl border border-[#B2FF59]/20"
          >
            <Building2 className="size-8 text-[#B2FF59] mb-3" />
            <div className="text-[#FAFAFA] font-mono mb-1">142</div>
            <div className="text-[#FAFAFA]/70 text-sm">Funded Companies</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
