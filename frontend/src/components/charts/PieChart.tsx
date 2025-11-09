'use client';

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from '@/lib/utils';

interface PieChartProps {
  data: any[];
  nameKey: string;
  valueKey: string;
  title?: string;
  height?: number;
  colors?: string[];
  showLegend?: boolean;
}

export function PieChart({
  data,
  nameKey,
  valueKey,
  title,
  height = 400,
  colors = CHART_COLORS.primary,
  showLegend = true,
}: PieChartProps) {
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ [nameKey]: name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={120}
            fill="#8884d8"
            dataKey={valueKey}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: '0.5rem',
            }}
          />
          {showLegend && <Legend />}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
