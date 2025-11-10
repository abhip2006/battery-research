import { motion } from 'motion/react';
import { Zap, Droplet, Grid3x3, Recycle, Factory, Atom, Calendar, TrendingUp } from 'lucide-react';

const SUBSECTORS = [
  {
    id: 'solid-state',
    name: 'Solid-State Batteries',
    icon: Zap,
    color: '#B2FF59',
    companies: 35,
    investment: '$4.2B',
    description: 'Next-generation batteries with solid electrolytes replacing liquid electrolytes for improved safety and energy density.',
    timeline: [
      { year: '2010', event: 'Early research phase', milestone: 'Initial proof of concept' },
      { year: '2015', event: 'First prototypes', milestone: 'Lab-scale demonstrations' },
      { year: '2020', event: 'Pilot production', milestone: 'Manufacturing partnerships' },
      { year: '2024', event: 'Pre-commercial', milestone: 'Vehicle testing programs' },
      { year: '2027', event: 'Commercial launch', milestone: 'Mass production target' },
    ],
  },
  {
    id: 'flow-batteries',
    name: 'Flow Batteries',
    icon: Droplet,
    color: '#1565C0',
    companies: 18,
    investment: '$1.8B',
    description: 'Rechargeable battery technology using liquid electrolyte solutions for long-duration energy storage.',
    timeline: [
      { year: '2005', event: 'Technology foundation', milestone: 'Early deployments' },
      { year: '2012', event: 'Grid-scale pilots', milestone: 'Utility partnerships' },
      { year: '2018', event: 'Commercial systems', milestone: 'First megawatt projects' },
      { year: '2022', event: 'Market expansion', milestone: 'Cost reduction milestones' },
      { year: '2025', event: 'Widespread adoption', milestone: 'GW-scale deployments' },
    ],
  },
  {
    id: 'grid-storage',
    name: 'Grid Storage',
    icon: Grid3x3,
    color: '#B2FF59',
    companies: 52,
    investment: '$12.5B',
    description: 'Large-scale battery systems for renewable energy integration and grid stabilization.',
    timeline: [
      { year: '2015', event: 'Early adoption', milestone: 'Pilot projects' },
      { year: '2018', event: 'Market acceleration', milestone: 'Policy incentives' },
      { year: '2021', event: 'Rapid growth', milestone: '10 GW deployed' },
      { year: '2024', event: 'Mainstream integration', milestone: '50 GW capacity' },
      { year: '2030', event: 'Critical infrastructure', milestone: '200+ GW target' },
    ],
  },
  {
    id: 'recycling',
    name: 'Battery Recycling',
    icon: Recycle,
    color: '#1565C0',
    companies: 28,
    investment: '$3.1B',
    description: 'Circular economy solutions for recovering valuable materials from end-of-life batteries.',
    timeline: [
      { year: '2012', event: 'Early facilities', milestone: 'Manual disassembly' },
      { year: '2017', event: 'Automation advances', milestone: 'Improved recovery rates' },
      { year: '2020', event: 'Scale-up investments', milestone: 'Major facility expansions' },
      { year: '2024', event: 'Industrial scale', milestone: '90%+ recovery rates' },
      { year: '2028', event: 'Closed-loop systems', milestone: 'Supply chain integration' },
    ],
  },
];

export function SubsectorsPage() {
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
            <h1 className="text-[#B2FF59] mb-3 sm:mb-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold font-tech uppercase tracking-wider">Battery Subsectors</h1>
            <p className="text-[#FAFAFA] max-w-2xl text-base sm:text-lg font-medium">
              Explore the evolution and current state of key battery technology segments
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12 sm:space-y-16">
        {SUBSECTORS.map((subsector, sectorIndex) => {
          const Icon = subsector.icon;

          return (
            <motion.div
              key={subsector.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-[#1A1A1A] rounded-2xl border-2 border-[#2B2B2B] overflow-hidden hover:border-[#B2FF59]/50 transition-all duration-300"
            >
              {/* Header */}
              <div className="p-4 sm:p-8 border-b-2 border-[#2B2B2B]">
                <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
                    <div
                      className="p-3 sm:p-4 rounded-xl border-2 flex-shrink-0"
                      style={{
                        backgroundColor: `${subsector.color}20`,
                        borderColor: `${subsector.color}60`,
                      }}
                    >
                      <Icon className="size-7 sm:size-8" style={{ color: subsector.color }} />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-[#FAFAFA] mb-2 text-xl sm:text-2xl font-bold">{subsector.name}</h2>
                      <p className="text-[#CCCCCC] max-w-2xl leading-relaxed text-sm sm:text-base">{subsector.description}</p>
                    </div>
                  </div>
                  <div className="w-full lg:w-auto">
                    <div className="flex gap-6 sm:gap-8">
                      <div>
                        <div className="text-[#888888] text-xs sm:text-sm mb-1 sm:mb-2 font-semibold uppercase tracking-wide">Companies</div>
                        <div className="text-[#B2FF59] font-mono font-bold text-lg sm:text-xl">{subsector.companies}</div>
                      </div>
                      <div>
                        <div className="text-[#888888] text-xs sm:text-sm mb-1 sm:mb-2 font-semibold uppercase tracking-wide">Investment</div>
                        <div className="text-[#1565C0] font-mono font-bold text-lg sm:text-xl">{subsector.investment}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="p-4 sm:p-8 bg-[#0F0F0F]">
                <h3 className="text-[#B2FF59] mb-6 sm:mb-8 font-bold font-tech uppercase tracking-wider text-lg sm:text-xl">Technology Evolution Timeline</h3>

                {/* Desktop Timeline */}
                <div className="hidden md:block relative">
                  {/* Timeline Line */}
                  <div className="absolute top-6 left-0 right-0 h-1 bg-[#2B2B2B] rounded-full" />
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: sectorIndex * 0.2 }}
                    className="absolute top-6 left-0 h-1 rounded-full"
                    style={{ backgroundColor: subsector.color, boxShadow: `0 0 10px ${subsector.color}` }}
                  />

                  {/* Timeline Events */}
                  <div className="relative flex justify-between">
                    {subsector.timeline.map((item, index) => (
                      <motion.div
                        key={item.year}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="flex flex-col items-center flex-1 group cursor-pointer"
                      >
                        {/* Dot */}
                        <motion.div
                          whileHover={{ scale: 1.5 }}
                          className="w-4 h-4 rounded-full mb-4 z-10 group-hover:shadow-lg transition-all duration-300 border-2 border-[#0F0F0F]"
                          style={{
                            backgroundColor: subsector.color,
                            boxShadow: `0 0 20px ${subsector.color}80`,
                          }}
                        />

                        {/* Content */}
                        <div className="text-center">
                          <div
                            className="font-mono mb-2 transition-colors duration-300 group-hover:text-[#B2FF59] font-bold text-lg"
                            style={{ color: subsector.color }}
                          >
                            {item.year}
                          </div>
                          <div className="text-[#FAFAFA] font-semibold mb-1 text-sm">{item.event}</div>
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            whileInView={{ height: 'auto', opacity: 1 }}
                            className="text-[#AAAAAA] text-xs mt-2 px-3 py-2 bg-[#1A1A1A] rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 border border-[#2B2B2B]"
                          >
                            {item.milestone}
                          </motion.div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Mobile Timeline - Vertical */}
                <div className="md:hidden space-y-4">
                  {subsector.timeline.map((item, index) => (
                    <motion.div
                      key={item.year}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex gap-4 items-start"
                    >
                      <div className="flex flex-col items-center">
                        <div
                          className="w-3 h-3 rounded-full border-2 border-[#0F0F0F] flex-shrink-0"
                          style={{
                            backgroundColor: subsector.color,
                            boxShadow: `0 0 10px ${subsector.color}80`,
                          }}
                        />
                        {index < subsector.timeline.length - 1 && (
                          <div className="w-0.5 h-full bg-[#2B2B2B] flex-1 mt-2"
                               style={{ minHeight: '40px' }} />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div
                          className="font-mono mb-1 font-bold text-base"
                          style={{ color: subsector.color }}
                        >
                          {item.year}
                        </div>
                        <div className="text-[#FAFAFA] font-semibold mb-1 text-sm">{item.event}</div>
                        <div className="text-[#AAAAAA] text-xs mt-1">
                          {item.milestone}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Stats Footer */}
                <div className="mt-8 sm:mt-12 pt-6 border-t-2 border-[#2B2B2B] flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
                  <button
                    className="px-5 sm:px-6 py-3 rounded-lg text-[#FAFAFA] hover:text-[#0A0A0A] transition-all duration-300 flex items-center justify-center gap-2 border-2 font-semibold hover:bg-[#B2FF59] text-sm sm:text-base"
                    style={{
                      backgroundColor: `${subsector.color}20`,
                      borderColor: `${subsector.color}60`,
                    }}
                  >
                    <TrendingUp className="size-4" />
                    View Market Analysis
                  </button>
                  <button
                    className="px-5 sm:px-6 py-3 rounded-lg text-[#FAFAFA] hover:text-[#0A0A0A] transition-all duration-300 flex items-center justify-center gap-2 border-2 font-semibold hover:bg-[#B2FF59] text-sm sm:text-base"
                    style={{
                      backgroundColor: `${subsector.color}20`,
                      borderColor: `${subsector.color}60`,
                    }}
                  >
                    <Calendar className="size-4" />
                    Explore Companies
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}