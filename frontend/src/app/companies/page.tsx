'use client';

import { useState, useMemo } from 'react';
import { useBatteryData } from '@/hooks/useBatteryData';
import { SearchBar } from '@/components/ui/SearchBar';
import { FilterPanel, FilterGroup, CheckboxFilter, RangeFilter } from '@/components/ui/FilterPanel';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Loading } from '@/components/ui/Loading';
import { Download, Filter } from 'lucide-react';
import { filterCompanies, sortCompanies, getUniqueTechnologies, exportToCSV, exportToJSON } from '@/lib/data';
import { formatNumber } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function CompaniesPage() {
  const { data, loading, error } = useBatteryData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);
  const [capacityRange, setCapacityRange] = useState<[number, number]>([0, 200]);
  const [sortBy, setSortBy] = useState<'name' | 'capacity' | 'technology'>('capacity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const filteredAndSortedCompanies = useMemo(() => {
    if (!data) return [];

    const filtered = filterCompanies(data.topCompanies, {
      search: searchQuery,
      technology: selectedTechnologies,
      minCapacity: capacityRange[0],
      maxCapacity: capacityRange[1],
    });

    return sortCompanies(filtered, sortBy, sortOrder);
  }, [data, searchQuery, selectedTechnologies, capacityRange, sortBy, sortOrder]);

  const uniqueTechnologies = useMemo(() => {
    if (!data) return [];
    return getUniqueTechnologies(data.topCompanies);
  }, [data]);

  const handleExportCSV = () => {
    exportToCSV(filteredAndSortedCompanies, 'battery-companies.csv');
    toast.success('Exported to CSV successfully');
  };

  const handleExportJSON = () => {
    exportToJSON(filteredAndSortedCompanies, 'battery-companies.json');
    toast.success('Exported to JSON successfully');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTechnologies([]);
    setCapacityRange([0, 200]);
    toast.success('Filters cleared');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Loading company data..." />
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
            Unable to load company data
          </p>
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
            Company Directory
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Explore {data.topCompanies.length} battery manufacturers by capacity and technology focus
          </p>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchBar
              placeholder="Search companies..."
              onSearch={setSearchQuery}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
            <div className="relative group">
              <button className="btn btn-secondary flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hidden group-hover:block z-10">
                <button
                  onClick={handleExportCSV}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                >
                  Export as CSV
                </button>
                <button
                  onClick={handleExportJSON}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
                >
                  Export as JSON
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:col-span-1">
              <FilterPanel title="Filters" onClear={clearFilters}>
                <FilterGroup label="Technology">
                  <CheckboxFilter
                    options={uniqueTechnologies.map((tech) => ({
                      label: tech,
                      value: tech,
                    }))}
                    selectedValues={selectedTechnologies}
                    onChange={setSelectedTechnologies}
                  />
                </FilterGroup>
                <FilterGroup label="Capacity (GWh)">
                  <RangeFilter
                    min={0}
                    max={200}
                    value={capacityRange}
                    onChange={setCapacityRange}
                    unit="GWh"
                  />
                </FilterGroup>
              </FilterPanel>
            </div>
          )}

          {/* Companies Table */}
          <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {filteredAndSortedCompanies.length} of {data.topCompanies.length} companies
                </p>
                <div className="flex gap-2 items-center">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="input py-1 px-2 text-sm"
                  >
                    <option value="capacity">Capacity</option>
                    <option value="name">Name</option>
                    <option value="technology">Technology</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="btn btn-secondary py-1 px-2 text-sm"
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Capacity (GWh)</TableHead>
                    <TableHead>Technology Focus</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedCompanies.map((company, index) => (
                    <TableRow key={company.name}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {company.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-primary-600 dark:text-primary-400">
                          {formatNumber(company.capacity, 0)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {company.technology.split(',').slice(0, 2).map((tech, i) => (
                            <span key={i} className="badge badge-primary text-xs">
                              {tech.trim()}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
