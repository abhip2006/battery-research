'use client';

import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface FilterPanelProps {
  title: string;
  children: ReactNode;
  onClear?: () => void;
  className?: string;
}

export function FilterPanel({
  title,
  children,
  onClear,
  className = '',
}: FilterPanelProps) {
  return (
    <div className={`card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        {onClear && (
          <button
            onClick={onClear}
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
          >
            Clear All
          </button>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

interface FilterGroupProps {
  label: string;
  children: ReactNode;
}

export function FilterGroup({ label, children }: FilterGroupProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

interface CheckboxFilterProps {
  options: { label: string; value: string }[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

export function CheckboxFilter({
  options,
  selectedValues,
  onChange,
}: CheckboxFilterProps) {
  const handleToggle = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onChange(newValues);
  };

  return (
    <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
      {options.map((option) => (
        <label
          key={option.value}
          className="flex items-center space-x-2 cursor-pointer"
        >
          <input
            type="checkbox"
            checked={selectedValues.includes(option.value)}
            onChange={() => handleToggle(option.value)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
}

interface RangeFilterProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  label?: string;
  unit?: string;
}

export function RangeFilter({
  min,
  max,
  value,
  onChange,
  label,
  unit = '',
}: RangeFilterProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          {value[0]} {unit}
        </span>
        <span className="text-gray-600 dark:text-gray-400">
          {value[1]} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value[1]}
        onChange={(e) => onChange([value[0], parseInt(e.target.value)])}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
      />
    </div>
  );
}
