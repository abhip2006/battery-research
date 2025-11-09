import { useState } from 'react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const CAPACITY_DATA = [
  { year: '2024', capacity: 180, rdSpend: 3.2, manufacturing: 12 },
  { year: '2025', capacity: 245, rdSpend: 4.1, manufacturing: 18 },
  { year: '2026', capacity: 320, rdSpend: 5.3, manufacturing: 26 },
  { year: '2027', capacity: 425, rdSpend: 6.8, manufacturing: 35 },
  { year: '2028', capacity: 560, rdSpend: 8.5, manufacturing: 47 },
  { year: '2029', capacity: 720, rdSpend: 10.2, manufacturing: 62 },
  { year: '2030', capacity: 920, rdSpend: 12.5, manufacturing: 80 },
];

const CHART_CONFIGS = {
  'Installed Capacity': {
    dataKey: 'capacity',
    color: '#B2FF59',
    unit: 'GWh',
    description: 'Projected U.S. battery manufacturing capacity through 2030',
  },
  'R&D Spend': {
    dataKey: 'rdSpend',
    color: '#1565C0',
    unit: '$B',
    description: 'Projected annual R&D investment in battery technology',
  },
  'Manufacturing Growth': {
    dataKey: 'manufacturing',
    color: '#FFB300',
    unit: 'Facilities',
    description: 'Number of operational battery manufacturing facilities',
  },
};

export function ForecastExplorer() {
  const [activeChart, setActiveChart] = useState<keyof typeof CHART_CONFIGS>('Installed Capacity');

  const config = CHART_CONFIGS[activeChart];

  return (
    <section className="py-24 bg-[#1E1E1E]">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-[#B2FF59] mb-4">Forecast Explorer</h2>
          <p className="text-[#FAFAFA]/70 max-w-2xl mx-auto">
            Data-driven projections for U.S. battery industry growth through 2030
          </p>
        </motion.div>

        <div className="grid grid-cols-5 gap-6">
          {/* Left: Summary Text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="col-span-2 space-y-6"
          >
            {/* Tabs */}
            <div className="space-y-3">
              {(Object.keys(CHART_CONFIGS) as Array<keyof typeof CHART_CONFIGS>).map((chartType) => (
                <button
                  key={chartType}
                  onClick={() => setActiveChart(chartType)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                    activeChart === chartType
                      ? 'bg-[#B2FF59] text-[#1E1E1E]'
                      : 'bg-[#2B2B2B] text-[#FAFAFA]/70 hover:bg-[#303030]'
                  }`}
                >
                  <div className="mb-1">{chartType}</div>
                  {activeChart === chartType && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                      className="text-sm opacity-80"
                    >
                      {CHART_CONFIGS[chartType].description}
                    </motion.div>
                  )}
                </button>
              ))}
            </div>

            {/* Key Stats */}
            <motion.div
              key={activeChart}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-[#2B2B2B] p-6 rounded-xl border border-[#B2FF59]/20"
            >
              <h4 className="text-[#B2FF59] mb-4">2030 Projection</h4>
              <div className="space-y-3">
                <div>
                  <div className="text-[#FAFAFA]/60 text-sm">Target Value</div>
                  <div className="text-[#FAFAFA] font-mono mt-1">
                    {CAPACITY_DATA[CAPACITY_DATA.length - 1][config.dataKey]} {config.unit}
                  </div>
                </div>
                <div>
                  <div className="text-[#FAFAFA]/60 text-sm">Growth Rate</div>
                  <div className="text-[#B2FF59] font-mono mt-1">
                    +
                    {(
                      ((CAPACITY_DATA[CAPACITY_DATA.length - 1][config.dataKey] -
                        CAPACITY_DATA[0][config.dataKey]) /
                        CAPACITY_DATA[0][config.dataKey]) *
                      100
                    ).toFixed(0)}
                    %
                  </div>
                </div>
                <div>
                  <div className="text-[#FAFAFA]/60 text-sm">Confidence Level</div>
                  <div className="text-[#1565C0] font-mono mt-1">High</div>
                </div>
              </div>
            </motion.div>

            {/* Data Source Badge */}
            <div className="bg-[#2B2B2B] p-4 rounded-xl border border-[#1565C0]/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-[#B2FF59]/20 text-[#B2FF59] text-xs rounded">VERIFIED</span>
                <span className="text-[#FAFAFA]/60 text-sm">Data Sources</span>
              </div>
              <p className="text-[#FAFAFA]/70 text-sm">
                DOE National Blueprint, BloombergNEF, industry filings
              </p>
            </div>
          </motion.div>

          {/* Right: Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="col-span-3 bg-[#2B2B2B] p-8 rounded-xl border border-[#B2FF59]/20"
          >
            <motion.div
              key={activeChart}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <h3 className="text-[#FAFAFA] mb-6">{activeChart}</h3>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={CAPACITY_DATA}>
                  <defs>
                    <linearGradient id={`gradient-${activeChart}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={config.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={config.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                      value: config.unit,
                      angle: -90,
                      position: 'insideLeft',
                      style: { fill: '#FAFAFA', fontSize: '12px' },
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E1E1E',
                      border: `1px solid ${config.color}`,
                      borderRadius: '8px',
                      color: '#FAFAFA',
                    }}
                    formatter={(value: any) => [`${value} ${config.unit}`, activeChart]}
                  />
                  <Area
                    type="monotone"
                    dataKey={config.dataKey}
                    stroke={config.color}
                    strokeWidth={3}
                    fill={`url(#gradient-${activeChart})`}
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Download Button */}
            <div className="mt-6 flex justify-end">
              <button className="px-4 py-2 bg-[#B2FF59] text-[#1E1E1E] rounded-lg hover:bg-[#A0E050] transition-colors duration-300 text-sm">
                Download Full Report
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
