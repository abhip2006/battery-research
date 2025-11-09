'use client';

import { useBatteryData } from '@/hooks/useBatteryData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import { Loading } from '@/components/ui/Loading';
import { CHART_COLORS } from '@/lib/utils';

export default function TechnologyPage() {
  const { data, loading, error } = useBatteryData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Loading technology data..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Error Loading Data
          </h1>
        </div>
      </div>
    );
  }

  // Prepare energy density data for chart
  const energyDensityChartData = Object.keys(data.energyDensity.LFP || {}).map((year) => ({
    year: parseInt(year),
    'LFP Cell': data.energyDensity.LFP[year]?.cellLevel,
    'LFP Pack': data.energyDensity.LFP[year]?.packLevel,
    'NMC Cell': data.energyDensity.NMC?.[year]?.cellLevel,
    'NMC Pack': data.energyDensity.NMC?.[year]?.packLevel,
    'Solid-State Cell': data.energyDensity.SolidState?.[year]?.cellLevel,
    'Solid-State Pack': data.energyDensity.SolidState?.[year]?.packLevel,
  }));

  // Prepare market share data for 2024
  const marketShare2024 = data.marketShare['2024'] || [];

  // Prepare technology mix data
  const techMixData = Object.keys(data.technologyMix).map((year) => ({
    year,
    ...data.technologyMix[year],
  }));

  // Prepare cycle life data
  const cycleLifeData = Object.keys(data.cycleLife).map((tech) => ({
    technology: tech,
    'Lab Max': data.cycleLife[tech].laboratoryMax,
    'Real World': data.cycleLife[tech].realWorld,
    'After 1000 Cycles': data.cycleLife[tech].capacityAfter1000Cycles,
  }));

  return (
    <div className="min-h-screen section">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Battery Technology Evolution
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Comprehensive analysis of battery chemistry trends, energy density improvements, and performance metrics
          </p>
        </div>

        {/* Energy Density Trends */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Energy Density Trends (Wh/kg)</CardTitle>
            <CardDescription>
              Evolution of cell and pack-level energy density across different battery technologies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart
              data={energyDensityChartData}
              xKey="year"
              yKey={['LFP Cell', 'LFP Pack', 'NMC Cell', 'NMC Pack', 'Solid-State Cell', 'Solid-State Pack']}
              height={450}
              yAxisLabel="Energy Density (Wh/kg)"
              xAxisLabel="Year"
            />
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Key Trends</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <li>LFP energy density improved 75% from 2015 to 2024 (95 → 160 Wh/kg cell-level)</li>
                <li>NMC shows 50% improvement in same period (180 → 260 Wh/kg cell-level)</li>
                <li>Solid-state batteries expected to reach 450 Wh/kg by 2030 (cell-level)</li>
                <li>Pack-level efficiency gap narrowing as integration improves</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Market Share Evolution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>2024 Chemistry Market Share</CardTitle>
              <CardDescription>Current distribution of battery chemistries</CardDescription>
            </CardHeader>
            <CardContent>
              <PieChart
                data={marketShare2024}
                nameKey="chemistry"
                valueKey="share"
                height={350}
                colors={Object.values(CHART_COLORS.technology)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Technology Mix Evolution</CardTitle>
              <CardDescription>Projected changes in chemistry adoption</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart
                data={techMixData}
                xKey="year"
                yKey={['LFP', 'NMC', 'SolidState', 'Sodium-ion', 'Other']}
                height={350}
                yAxisLabel="Market Share (%)"
                colors={Object.values(CHART_COLORS.technology).slice(0, 5)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Cycle Life Comparison */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Battery Cycle Life Comparison</CardTitle>
            <CardDescription>
              Durability and degradation analysis by chemistry
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={cycleLifeData}
              xKey="technology"
              yKey={['Lab Max', 'Real World', 'After 1000 Cycles']}
              height={400}
              yAxisLabel="Cycles / Capacity %"
            />
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.keys(data.cycleLife).map((tech) => (
                <div key={tech} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{tech}</h4>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-600 dark:text-gray-400">
                      Lab Max: <span className="font-medium text-gray-900 dark:text-white">
                        {data.cycleLife[tech].laboratoryMax.toLocaleString()} cycles
                      </span>
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Real World: <span className="font-medium text-gray-900 dark:text-white">
                        {data.cycleLife[tech].realWorld.toLocaleString()} cycles
                      </span>
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Degradation: <span className="font-medium text-gray-900 dark:text-white">
                        {data.cycleLife[tech].degradationRate}%/100 cycles
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Technology Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>LFP (Lithium Iron Phosphate)</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Superior cycle life (6,000 lab, 3,000 real-world cycles)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Excellent safety profile and thermal stability</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Lower cost due to iron-based cathode</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">×</span>
                  <span>Lower energy density vs NMC/NCA</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">→</span>
                  <span>Ideal for: Fleet vehicles, energy storage, standard-range EVs</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>NMC (Nickel Manganese Cobalt)</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>High energy density (260 Wh/kg cell-level in 2024)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Balanced performance characteristics</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">×</span>
                  <span>Shorter cycle life (2,500 lab, 1,300 real-world)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">×</span>
                  <span>Higher cost due to cobalt content</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">→</span>
                  <span>Ideal for: Long-range EVs, performance vehicles</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
