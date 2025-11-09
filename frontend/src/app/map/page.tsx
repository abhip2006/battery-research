'use client';

import { useBatteryData } from '@/hooks/useBatteryData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { MapPin, Factory, TrendingUp } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

export default function MapPage() {
  const { data, loading, error } = useBatteryData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Loading map data..." />
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

  return (
    <div className="min-h-screen section">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Interactive Manufacturing Map
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Explore US battery manufacturing facilities by state and region
          </p>
        </div>

        {/* Map Placeholder */}
        <Card className="mb-8">
          <CardContent className="p-0">
            <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 rounded-lg flex items-center justify-center">
              <div className="text-center p-8">
                <MapPin className="h-16 w-16 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Interactive Map View
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                  In production: Integration with Leaflet/Mapbox for interactive facility mapping.
                  Currently showing state-level aggregated data below.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* State Rankings */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            State Rankings by Capacity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.stateRankings.slice(0, 12).map((state, index) => (
              <Card key={state.state} hover className="relative">
                <div className="absolute top-4 right-4 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <CardHeader>
                  <CardTitle>{state.state}</CardTitle>
                  <CardDescription>
                    {state.facilities} facilities • {state.companies.length} companies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                          {state.capacity}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">GWh</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500">Total Capacity</p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Key Companies
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {state.companies.slice(0, 3).map((company) => (
                          <span key={company} className="badge badge-primary text-xs">
                            {company}
                          </span>
                        ))}
                        {state.companies.length > 3 && (
                          <span className="badge bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs">
                            +{state.companies.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <Factory className="inline h-3 w-3 mr-1" />
                        Flagship Facility
                      </p>
                      <p className="text-xs font-medium text-gray-900 dark:text-white">
                        {state.flagship}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Regional Clusters */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Regional Manufacturing Clusters
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.regionalClusters.map((cluster, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{cluster.name}</CardTitle>
                  <CardDescription>
                    {cluster.states.join(', ')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {cluster.totalCapacity}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">GWh Capacity</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {cluster.numFacilities}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Facilities</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {formatNumber(cluster.employment)}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Jobs</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Dominant Players
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {cluster.dominantPlayers.map((player) => (
                        <span key={player} className="badge badge-primary text-xs">
                          {player}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Strategic Advantages
                    </p>
                    <ul className="space-y-1">
                      {cluster.advantages.map((advantage, i) => (
                        <li key={i} className="text-xs text-gray-700 dark:text-gray-300 flex items-start">
                          <TrendingUp className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {advantage}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
