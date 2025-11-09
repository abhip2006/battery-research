// Utility functions
import { type ClassValue, clsx } from 'clsx';

/**
 * Merge class names with tailwind-merge for proper class precedence
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Format number with thousands separator
 */
export function formatNumber(num: number, decimals: number = 0): string {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Calculate percentage change
 */
export function calculatePercentChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Generate array of years between start and end
 */
export function generateYearRange(start: number, end: number): number[] {
  const years: number[] = [];
  for (let year = start; year <= end; year++) {
    years.push(year);
  }
  return years;
}

/**
 * Get US state abbreviation from full name
 */
export function getStateAbbreviation(stateName: string): string {
  const states: { [key: string]: string } = {
    Alabama: 'AL',
    Alaska: 'AK',
    Arizona: 'AZ',
    Arkansas: 'AR',
    California: 'CA',
    Colorado: 'CO',
    Connecticut: 'CT',
    Delaware: 'DE',
    Florida: 'FL',
    Georgia: 'GA',
    Hawaii: 'HI',
    Idaho: 'ID',
    Illinois: 'IL',
    Indiana: 'IN',
    Iowa: 'IA',
    Kansas: 'KS',
    Kentucky: 'KY',
    Louisiana: 'LA',
    Maine: 'ME',
    Maryland: 'MD',
    Massachusetts: 'MA',
    Michigan: 'MI',
    Minnesota: 'MN',
    Mississippi: 'MS',
    Missouri: 'MO',
    Montana: 'MT',
    Nebraska: 'NE',
    Nevada: 'NV',
    'New Hampshire': 'NH',
    'New Jersey': 'NJ',
    'New Mexico': 'NM',
    'New York': 'NY',
    'North Carolina': 'NC',
    'North Dakota': 'ND',
    Ohio: 'OH',
    Oklahoma: 'OK',
    Oregon: 'OR',
    Pennsylvania: 'PA',
    'Rhode Island': 'RI',
    'South Carolina': 'SC',
    'South Dakota': 'SD',
    Tennessee: 'TN',
    Texas: 'TX',
    Utah: 'UT',
    Vermont: 'VT',
    Virginia: 'VA',
    Washington: 'WA',
    'West Virginia': 'WV',
    Wisconsin: 'WI',
    Wyoming: 'WY',
  };

  return states[stateName] || stateName;
}

/**
 * Color palette for charts
 */
export const CHART_COLORS = {
  primary: ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444', '#6366F1', '#14B8A6'],
  technology: {
    LFP: '#10B981',
    'LFP/LMFP': '#059669',
    NMC: '#3B82F6',
    'NMC-333': '#60A5FA',
    'NMC-811': '#2563EB',
    NCA: '#EC4899',
    'Solid-state': '#8B5CF6',
    'SolidState': '#8B5CF6',
    'Sodium-ion': '#F59E0B',
    Other: '#6B7280',
  },
  gradient: {
    blue: ['#3B82F6', '#1E40AF'],
    green: ['#10B981', '#065F46'],
    purple: ['#8B5CF6', '#5B21B6'],
    orange: ['#F59E0B', '#92400E'],
    red: ['#EF4444', '#991B1B'],
  },
};

/**
 * Get color for technology
 */
export function getTechnologyColor(technology: string): string {
  // Check for exact match first
  if (CHART_COLORS.technology[technology as keyof typeof CHART_COLORS.technology]) {
    return CHART_COLORS.technology[technology as keyof typeof CHART_COLORS.technology];
  }

  // Check for partial match
  for (const [key, color] of Object.entries(CHART_COLORS.technology)) {
    if (technology.toLowerCase().includes(key.toLowerCase())) {
      return color;
    }
  }

  // Default color
  return CHART_COLORS.technology.Other;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Share URL using Web Share API if available
 */
export async function shareUrl(url: string, title: string, text?: string): Promise<boolean> {
  if (!navigator.share) {
    return copyToClipboard(url);
  }

  try {
    await navigator.share({
      title,
      text,
      url,
    });
    return true;
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Error sharing:', error);
    }
    return false;
  }
}
