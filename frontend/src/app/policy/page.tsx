'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { CheckCircle, DollarSign, Factory, Zap, Shield } from 'lucide-react';

export default function PolicyPage() {
  return (
    <div className="min-h-screen section">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Policy Explorer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Understanding the Inflation Reduction Act (IRA) and its impact on US battery manufacturing
          </p>
        </div>

        {/* IRA Overview */}
        <Card className="mb-8 border-l-4 border-primary-500">
          <CardHeader>
            <CardTitle>Inflation Reduction Act (IRA) - August 2022</CardTitle>
            <CardDescription>
              Landmark legislation providing $370B+ in clean energy incentives
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <DollarSign className="h-8 w-8 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">$7,500</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">EV Tax Credit (New)</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">$4,000</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">EV Tax Credit (Used)</div>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Factory className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">$45/kWh</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Manufacturing Credit</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Zap className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">30%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Investment Tax Credit</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Provisions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Key Provisions & Requirements
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Critical Mineral Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phase-in Timeline:
                    </div>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-start">
                        <span className="font-medium text-gray-900 dark:text-white mr-2">2023:</span>
                        40% from FTA countries or recycled in NA
                      </li>
                      <li className="flex items-start">
                        <span className="font-medium text-gray-900 dark:text-white mr-2">2024:</span>
                        50% requirement
                      </li>
                      <li className="flex items-start">
                        <span className="font-medium text-gray-900 dark:text-white mr-2">2026:</span>
                        60% requirement
                      </li>
                      <li className="flex items-start">
                        <span className="font-medium text-gray-900 dark:text-white mr-2">2027+:</span>
                        80% requirement
                      </li>
                    </ul>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      <Shield className="inline h-3 w-3 mr-1" />
                      Excludes materials from "Foreign Entities of Concern" (China, Russia, NK, Iran)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Factory className="h-5 w-5 text-blue-600" />
                  Battery Component Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phase-in Timeline:
                    </div>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-start">
                        <span className="font-medium text-gray-900 dark:text-white mr-2">2023:</span>
                        50% manufactured/assembled in NA
                      </li>
                      <li className="flex items-start">
                        <span className="font-medium text-gray-900 dark:text-white mr-2">2024:</span>
                        60% requirement
                      </li>
                      <li className="flex items-start">
                        <span className="font-medium text-gray-900 dark:text-white mr-2">2026:</span>
                        70% requirement
                      </li>
                      <li className="flex items-start">
                        <span className="font-medium text-gray-900 dark:text-white mr-2">2029+:</span>
                        100% requirement
                      </li>
                    </ul>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      Drives domestic manufacturing of cells, modules, and packs
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Impact Analysis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>IRA Impact Analysis</CardTitle>
            <CardDescription>
              Transformation of US battery manufacturing landscape
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Positive Impacts
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>• 60+ gigafactory announcements since Aug 2022</li>
                  <li>• $100B+ in committed investment</li>
                  <li>• 100,000+ direct manufacturing jobs</li>
                  <li>• Accelerated supply chain localization</li>
                  <li>• Enhanced energy security</li>
                  <li>• Reduced dependence on foreign supply</li>
                </ul>
              </div>

              <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-yellow-600" />
                  Challenges
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>• Complex compliance requirements</li>
                  <li>• Material sourcing constraints</li>
                  <li>• Upstream supply gaps (cathode, electrolyte)</li>
                  <li>• Skilled workforce shortage</li>
                  <li>• Permitting and construction delays</li>
                  <li>• Technology transfer barriers</li>
                </ul>
              </div>

              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Factory className="h-5 w-5 text-blue-600" />
                  Future Outlook
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>• 1,500 GWh capacity by 2030</li>
                  <li>• Full value chain development</li>
                  <li>• Advanced tech (solid-state) adoption</li>
                  <li>• Recycling infrastructure buildout</li>
                  <li>• Regional cluster consolidation</li>
                  <li>• Cost competitiveness with Asia</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Policy Timeline & Milestones
          </h2>
          <div className="space-y-4">
            {[
              { year: '2022', event: 'IRA signed into law', impact: 'Immediate investment surge announced' },
              { year: '2023', event: 'First compliance requirements take effect', impact: '40% critical mineral, 50% component thresholds' },
              { year: '2024', event: 'Foreign Entity restriction begins', impact: 'Major supply chain restructuring' },
              { year: '2025-2026', event: 'First wave gigafactories operational', impact: 'Domestic capacity reaches 500+ GWh' },
              { year: '2027', event: 'Stricter thresholds activate', impact: '80% critical mineral, 70% component requirements' },
              { year: '2030', event: 'Mature market state', impact: '1,500 GWh capacity, competitive with global leaders' },
            ].map((item, index) => (
              <div
                key={index}
                className="flex gap-4 items-start p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex-shrink-0 w-16 text-center">
                  <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                    {item.year}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {item.event}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.impact}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
