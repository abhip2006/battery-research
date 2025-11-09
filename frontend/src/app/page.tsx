'use client';

import { useBatteryData } from '@/hooks/useBatteryData';
import { MetricCard } from '@/components/ui/Card';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { Loading } from '@/components/ui/Loading';
import { TrendingUp, Factory, Users, Zap, MapPin, FileText } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { data, loading, error } = useBatteryData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Loading dashboard data..." />
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
          <p className="text-gray-600 dark:text-gray-400">
            Please make sure the data file is available at /data/visualization-data.json
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="container relative py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              US Battery Industry Dashboard
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 animate-slide-up">
              Comprehensive Analysis of Manufacturing Capacity, Technology Evolution, and Market Dynamics
            </p>
            <div className="flex flex-wrap justify-center gap-4 animate-slide-up">
              <Link
                href="/companies"
                className="btn bg-white text-primary-700 hover:bg-primary-50 px-8 py-3"
              >
                Explore Companies
              </Link>
              <Link
                href="/map"
                className="btn bg-primary-800 text-white hover:bg-primary-900 px-8 py-3"
              >
                View Map
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="section bg-gray-50 dark:bg-gray-900">
        <div className="container">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Key Industry Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="US Capacity (2024)"
              value="850 GWh"
              subtitle="Announced manufacturing capacity"
              icon={<Factory />}
              color="primary"
              trend={{ value: 76, isPositive: true }}
            />
            <MetricCard
              title="Battery Pack Cost"
              value="$115/kWh"
              subtitle="2024 average (81% reduction since 2015)"
              icon={<TrendingUp />}
              color="green"
              trend={{ value: 23, isPositive: true }}
            />
            <MetricCard
              title="Direct Jobs"
              value="100,000+"
              subtitle="Manufacturing jobs by 2027"
              icon={<Users />}
              color="blue"
            />
            <MetricCard
              title="Manufacturing Facilities"
              value="60+"
              subtitle="Across 15+ states"
              icon={<MapPin />}
              color="purple"
            />
          </div>
        </div>
      </section>

      {/* Cost Trends */}
      <section className="section">
        <div className="container">
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Battery Cost Trends (2015-2030)
            </h2>
            <LineChart
              data={data.costCurve}
              xKey="year"
              yKey="cost"
              height={400}
              yAxisLabel="Cost ($/kWh)"
              xAxisLabel="Year"
              colors={['#10B981']}
            />
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Key Insights
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <li>Dramatic 81% cost reduction from 2015 ($600/kWh) to 2024 ($115/kWh)</li>
                <li>Crossed critical $100/kWh threshold in 2024 for BEV pack parity</li>
                <li>Projected to reach $69/kWh by 2030, enabling mass market adoption</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Capacity Growth */}
      <section className="section bg-gray-50 dark:bg-gray-900">
        <div className="container">
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Manufacturing Capacity Growth
            </h2>
            <BarChart
              data={data.capacityGrowth}
              xKey="year"
              yKey="capacity"
              height={400}
              yAxisLabel="Capacity (GWh)"
              xAxisLabel="Year"
              colors={['#3B82F6']}
            />
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Growth Trajectory
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <li>Exponential growth from 10 GWh (2015) to 850 GWh (2024) - 85x increase</li>
                <li>Projected 1,500 GWh by 2030 - sufficient for ~10M EVs annually</li>
                <li>Major acceleration post-2020 driven by IRA incentives and OEM commitments</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Top Companies */}
      <section className="section">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Top Battery Manufacturers
            </h2>
            <Link
              href="/companies"
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium flex items-center gap-2"
            >
              View All
              <FileText className="h-4 w-4" />
            </Link>
          </div>
          <div className="card p-8">
            <BarChart
              data={data.topCompanies.slice(0, 10)}
              xKey="name"
              yKey="capacity"
              height={500}
              layout="vertical"
              yAxisLabel="Company"
              xAxisLabel="Capacity (GWh)"
              colors={['#8B5CF6']}
            />
          </div>
        </div>
      </section>

      {/* Regional Clusters */}
      <section className="section bg-gray-50 dark:bg-gray-900">
        <div className="container">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Regional Manufacturing Clusters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.regionalClusters.map((cluster, index) => (
              <div
                key={index}
                className="card p-6 border-l-4 border-primary-500 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {cluster.name}
                </h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {cluster.totalCapacity}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">GWh Capacity</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {cluster.numFacilities}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Facilities</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {cluster.employment.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Jobs</p>
                  </div>
                </div>
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    States: {cluster.states.join(', ')}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cluster.advantages.map((adv, i) => (
                    <span
                      key={i}
                      className="badge badge-primary text-xs"
                    >
                      {adv}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-to-r from-primary-600 to-accent-600 text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Explore More Insights
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Dive deeper into technology trends, policy impacts, and future forecasts
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/technology" className="btn bg-white text-primary-700 hover:bg-primary-50 px-8 py-3">
              Technology Analysis
            </Link>
            <Link href="/forecast" className="btn bg-primary-800 text-white hover:bg-primary-900 px-8 py-3">
              Market Forecast
            </Link>
            <Link href="/policy" className="btn bg-primary-800 text-white hover:bg-primary-900 px-8 py-3">
              Policy Explorer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
