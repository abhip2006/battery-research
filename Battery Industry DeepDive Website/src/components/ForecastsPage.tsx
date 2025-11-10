import { useState } from 'react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Download, TrendingUp, AlertCircle } from 'lucide-react';

const CAPACITY_DATA = [
  { year: '2024', capacity: 180, production: 145, demand: 220 },
  { year: '2025', capacity: 245, production: 210, demand: 290 },
  { year: '2026', capacity: 320, production: 285, demand: 370 },
  { year: '2027', capacity: 425, production: 380, demand: 460 },
  { year: '2028', capacity: 560, production: 510, demand: 580 },
  { year: '2029', capacity: 720, production: 670, demand: 720 },
  { year: '2030', capacity: 920, production: 860, demand: 900 },
];

const COST_DATA = [
  { year: '2024', cost: 140, target: 100 },
  { year: '2025', cost: 125, target: 100 },
  { year: '2026', cost: 112, target: 100 },
  { year: '2027', cost: 100, target: 100 },
  { year: '2028', cost: 88, target: 100 },
  { year: '2029', cost: 78, target: 100 },
  { year: '2030', cost: 70, target: 100 },
];

const MATERIALS_DATA = [
  { material: 'Lithium', demand: 450, supply: 420, unit: 'kt' },
  { material: 'Cobalt', demand: 180, supply: 190, unit: 'kt' },
  { material: 'Nickel', demand: 650, supply: 680, unit: 'kt' },
  { material: 'Graphite', demand: 920, supply: 850, unit: 'kt' },
];

const SCENARIOS = [
  {
    name: 'Base Case',
    description: 'Current policy and market trajectory',
    capacityBy2030: '920 GWh',
    confidence: 'High',
  },
  {
    name: 'Accelerated',
    description: 'Aggressive policy support and faster adoption',
    capacityBy2030: '1,250 GWh',
    confidence: 'Medium',
  },
  {
    name: 'Conservative',
    description: 'Slower adoption and supply chain challenges',
    capacityBy2030: '680 GWh',
    confidence: 'Medium',
  },
];

export function ForecastsPage() {
  const [activeChart, setActiveChart] = useState('capacity');

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
            <h1 className="text-[#B2FF59] mb-3 sm:mb-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold font-tech uppercase tracking-wider">Market Forecasts</h1>
            <p className="text-[#FAFAFA] max-w-2xl text-base sm:text-lg font-medium">
              Data-driven projections and scenario analysis for the U.S. battery industry through 2030
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-12">
        {/* Scenario Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-[#B2FF59] mb-4 sm:mb-6 text-2xl sm:text-3xl font-bold font-tech uppercase tracking-wider">Forecast Scenarios</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {SCENARIOS.map((scenario, index) => (
              <motion.div
                key={scenario.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-[#1A1A1A] p-5 sm:p-6 rounded-xl border-2 border-[#2B2B2B] hover:border-[#B2FF59] hover:shadow-lg hover:shadow-[#B2FF59]/20 transition-all duration-300"
              >
                <h3 className="text-[#FAFAFA] mb-2 sm:mb-3 text-lg sm:text-xl font-bold">{scenario.name}</h3>
                <p className="text-[#CCCCCC] text-sm mb-4 sm:mb-6 leading-relaxed">{scenario.description}</p>
                <div className="space-y-3">
                  <div>
                    <div className="text-[#888888] text-xs mb-1.5 font-semibold uppercase tracking-wide">2030 Capacity</div>
                    <div className="text-[#B2FF59] font-mono font-bold text-lg">{scenario.capacityBy2030}</div>
                  </div>
                  <div>
                    <div className="text-[#888888] text-xs mb-1.5 font-semibold uppercase tracking-wide">Confidence</div>
                    <span
                      className={`px-3 py-1.5 rounded-lg font-semibold border ${
                        scenario.confidence === 'High'
                          ? 'bg-[#B2FF59]/20 text-[#B2FF59] border-[#B2FF59]/50'
                          : 'bg-[#FFB300]/20 text-[#FFB300] border-[#FFB300]/50'
                      }`}
                    >
                      {scenario.confidence}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-[#B2FF59] mb-4 sm:mb-6 text-2xl sm:text-3xl font-bold">Capacity & Production Outlook</h2>
          <div className="bg-[#1E1E1E] p-4 sm:p-8 rounded-2xl border border-[#B2FF59]/20">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6">
              <button
                onClick={() => setActiveChart('capacity')}
                className={`px-4 py-3 sm:py-2 rounded-lg transition-all duration-300 text-sm sm:text-base font-medium ${
                  activeChart === 'capacity'
                    ? 'bg-[#B2FF59] text-[#1E1E1E]'
                    : 'bg-[#2B2B2B] text-[#FAFAFA]/70 hover:bg-[#303030]'
                }`}
              >
                Capacity vs Demand
              </button>
              <button
                onClick={() => setActiveChart('cost')}
                className={`px-4 py-3 sm:py-2 rounded-lg transition-all duration-300 text-sm sm:text-base font-medium ${
                  activeChart === 'cost'
                    ? 'bg-[#B2FF59] text-[#1E1E1E]'
                    : 'bg-[#2B2B2B] text-[#FAFAFA]/70 hover:bg-[#303030]'
                }`}
              >
                Cost Trajectory
              </button>
              <button
                onClick={() => setActiveChart('materials')}
                className={`px-4 py-3 sm:py-2 rounded-lg transition-all duration-300 text-sm sm:text-base font-medium ${
                  activeChart === 'materials'
                    ? 'bg-[#B2FF59] text-[#1E1E1E]'
                    : 'bg-[#2B2B2B] text-[#FAFAFA]/70 hover:bg-[#303030]'
                }`}
              >
                Materials Supply
              </button>
            </div>

            {activeChart === 'capacity' && (
              <motion.div
                key="capacity"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={CAPACITY_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3A3A3A" />
                    <XAxis
                      dataKey="year"
                      stroke="#FAFAFA"
                      style={{ fontSize: '12px', fill: '#FAFAFA' }}
                    />
                    <YAxis
                      stroke="#FAFAFA"
                      style={{ fontSize: '12px', fill: '#FAFAFA' }}
                      label={{
                        value: 'GWh',
                        angle: -90,
                        position: 'insideLeft',
                        style: { fill: '#FAFAFA', fontSize: '12px' },
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1E1E1E',
                        border: '1px solid #B2FF59',
                        borderRadius: '8px',
                        color: '#FAFAFA',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="capacity"
                      stroke="#B2FF59"
                      strokeWidth={3}
                      name="Manufacturing Capacity"
                    />
                    <Line
                      type="monotone"
                      dataKey="production"
                      stroke="#1565C0"
                      strokeWidth={3}
                      name="Actual Production"
                    />
                    <Line
                      type="monotone"
                      dataKey="demand"
                      stroke="#FFB300"
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      name="Projected Demand"
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-0.5 bg-[#B2FF59]" />
                      <span className="text-[#FAFAFA]/70 text-xs sm:text-sm">Manufacturing Capacity</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-0.5 bg-[#1565C0]" />
                      <span className="text-[#FAFAFA]/70 text-xs sm:text-sm">Actual Production</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-0.5 bg-[#FFB300] opacity-50" />
                      <span className="text-[#FAFAFA]/70 text-xs sm:text-sm">Projected Demand</span>
                    </div>
                  </div>
                  <button className="px-4 py-2.5 sm:py-2 bg-[#B2FF59] text-[#1E1E1E] rounded-lg hover:bg-[#A0E050] transition-colors duration-300 text-sm flex items-center gap-2 w-full sm:w-auto justify-center">
                    <Download className="size-4" />
                    Export Data
                  </button>
                </div>
              </motion.div>
            )}

            {activeChart === 'cost' && (
              <motion.div
                key="cost"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={COST_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3A3A3A" />
                    <XAxis
                      dataKey="year"
                      stroke="#FAFAFA"
                      style={{ fontSize: '12px', fill: '#FAFAFA' }}
                    />
                    <YAxis
                      stroke="#FAFAFA"
                      style={{ fontSize: '12px', fill: '#FAFAFA' }}
                      label={{
                        value: '$/kWh',
                        angle: -90,
                        position: 'insideLeft',
                        style: { fill: '#FAFAFA', fontSize: '12px' },
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1E1E1E',
                        border: '1px solid #1565C0',
                        borderRadius: '8px',
                        color: '#FAFAFA',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cost"
                      stroke="#1565C0"
                      strokeWidth={3}
                      name="Battery Pack Cost"
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="#B2FF59"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="$100/kWh Target"
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-6 bg-[#2B2B2B] p-4 rounded-lg border border-[#1565C0]/20 flex items-start gap-3">
                  <AlertCircle className="size-5 text-[#1565C0] flex-shrink-0 mt-0.5" />
                  <p className="text-[#FAFAFA]/70 text-sm">
                    Cost parity target of $100/kWh expected by 2027, enabling mass-market EV adoption and
                    grid storage competitiveness with fossil fuel peaker plants.
                  </p>
                </div>
              </motion.div>
            )}

            {activeChart === 'materials' && (
              <motion.div
                key="materials"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={MATERIALS_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3A3A3A" />
                    <XAxis
                      dataKey="material"
                      stroke="#FAFAFA"
                      style={{ fontSize: '12px', fill: '#FAFAFA' }}
                    />
                    <YAxis
                      stroke="#FAFAFA"
                      style={{ fontSize: '12px', fill: '#FAFAFA' }}
                      label={{
                        value: 'Kilotons (kt)',
                        angle: -90,
                        position: 'insideLeft',
                        style: { fill: '#FAFAFA', fontSize: '12px' },
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1E1E1E',
                        border: '1px solid #B2FF59',
                        borderRadius: '8px',
                        color: '#FAFAFA',
                      }}
                    />
                    <Bar dataKey="demand" fill="#FFB300" name="2030 Demand" />
                    <Bar dataKey="supply" fill="#B2FF59" name="Projected Supply" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-6 space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-[#FFB300]" />
                        <span className="text-[#FAFAFA]/70 text-xs sm:text-sm">2030 Demand</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-[#B2FF59]" />
                        <span className="text-[#FAFAFA]/70 text-xs sm:text-sm">Projected Supply</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#2B2B2B] p-4 rounded-lg border border-[#FFB300]/20 flex items-start gap-3">
                    <AlertCircle className="size-5 text-[#FFB300] flex-shrink-0 mt-0.5" />
                    <p className="text-[#FAFAFA]/70 text-xs sm:text-sm">
                      Lithium and graphite show potential supply deficits. Accelerated domestic mining and
                      recycling infrastructure development is critical.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Key Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          <div className="bg-[#1E1E1E] p-5 sm:p-6 rounded-xl border border-[#B2FF59]/20">
            <TrendingUp className="size-7 sm:size-8 text-[#B2FF59] mb-3" />
            <div className="text-[#FAFAFA] font-mono mb-1 text-xl sm:text-2xl">5.1x</div>
            <div className="text-[#FAFAFA]/70 text-sm">Capacity Growth (2024-2030)</div>
          </div>
          <div className="bg-[#1E1E1E] p-5 sm:p-6 rounded-xl border border-[#1565C0]/20">
            <TrendingUp className="size-7 sm:size-8 text-[#1565C0] mb-3" />
            <div className="text-[#FAFAFA] font-mono mb-1 text-xl sm:text-2xl">-50%</div>
            <div className="text-[#FAFAFA]/70 text-sm">Cost Reduction by 2030</div>
          </div>
          <div className="bg-[#1E1E1E] p-5 sm:p-6 rounded-xl border border-[#FFB300]/20">
            <AlertCircle className="size-7 sm:size-8 text-[#FFB300] mb-3" />
            <div className="text-[#FAFAFA] font-mono mb-1 text-xl sm:text-2xl">2</div>
            <div className="text-[#FAFAFA]/70 text-sm">Materials at Supply Risk</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}