'use client';

import { useBatteryData } from '@/hooks/useBatteryData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, MetricCard } from '@/components/ui/Card';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { Loading } from '@/components/ui/Loading';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

export default function ForecastPage() {
  const { data, loading, error } = useBatteryData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Loading forecast data..." />
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

  // Prepare combined forecast data
  const forecastData = data.costCurve.map((cost, index) => ({
    year: cost.year,
    cost: cost.cost,
    capacity: data.capacityGrowth.find(c => c.year === cost.year)?.capacity || null,
  }));

  return (
    <div className="min-h-screen section">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Market Forecast Dashboard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Supply/demand projections, cost trajectories, and market outlook through 2030
          </p>
        </div>

        {/* Key Forecasts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="2030 Capacity"
            value="1,500 GWh"
            subtitle="Projected US manufacturing capacity"
            icon={<TrendingUp />}
            color="green"
            trend={{ value: 76, isPositive: true }}
          />
          <MetricCard
            title="2030 Cost Target"
            value="$69/kWh"
            subtitle="Battery pack cost projection"
            icon={<TrendingDown />}
            color="blue"
            trend={{ value: 40, isPositive: true }}
          />
          <MetricCard
            title="Annual EV Production"
            value="~10M"
            subtitle="Vehicles supported by 2030 capacity"
            icon={<TrendingUp />}
            color="purple"
          />
          <MetricCard
            title="Investment Pipeline"
            value="$100B+"
            subtitle="Committed capital through 2030"
            icon={<TrendingUp />}
            color="orange"
          />
        </div>

        {/* Dual Axis Forecast */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Cost & Capacity Forecast (2015-2030)</CardTitle>
            <CardDescription>
              Historical trends and projections for battery pack cost and manufacturing capacity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart
              data={forecastData}
              xKey="year"
              yKey={['cost', 'capacity']}
              height={450}
              xAxisLabel="Year"
            />
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-green-600" />
                  Cost Trajectory
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <li>2024: $115/kWh (crossed $100 threshold)</li>
                  <li>2026: $98/kWh (mass market inflection)</li>
                  <li>2030: $69/kWh (cost parity with ICE)</li>
                  <li>Key drivers: Scale economies, tech improvements, supply chain</li>
                </ul>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Capacity Growth
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <li>2024: 850 GWh announced capacity</li>
                  <li>2027: 1,200 GWh (first wave operational)</li>
                  <li>2030: 1,500 GWh (mature market state)</li>
                  <li>Sufficient for 10M EVs/year at 150 kWh avg</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Supply Chain Outlook */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Supply Chain Gap Analysis</CardTitle>
            <CardDescription>
              Critical bottlenecks and investment priorities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 rounded">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Cathode Capacity Gap
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {data.keyMetrics.supplyChainGap.cathodeCapacity}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Separator Production
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {data.keyMetrics.supplyChainGap.separatorProduction}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 rounded">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Electrolyte Production
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {data.keyMetrics.supplyChainGap.electrolyte}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Scenarios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600 dark:text-green-400">Bull Case</CardTitle>
              <CardDescription>Accelerated adoption scenario</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>• 2030 capacity: 2,000+ GWh</li>
                <li>• Cost reaches $60/kWh by 2028</li>
                <li>• Solid-state at 15% market share</li>
                <li>• Full supply chain localization</li>
                <li>• 15M EVs/year production</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600 dark:text-blue-400">Base Case</CardTitle>
              <CardDescription>Current trajectory projection</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>• 2030 capacity: 1,500 GWh</li>
                <li>• Cost reaches $69/kWh by 2030</li>
                <li>• Solid-state at 10% market share</li>
                <li>• Partial supply chain gaps</li>
                <li>• 10M EVs/year production</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">Bear Case</CardTitle>
              <CardDescription>Delayed adoption scenario</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>• 2030 capacity: 1,000 GWh</li>
                <li>• Cost plateaus at $80/kWh</li>
                <li>• Solid-state below 5% share</li>
                <li>• Persistent supply gaps</li>
                <li>• 7M EVs/year production</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
