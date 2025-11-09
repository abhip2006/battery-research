import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        'card p-6',
        hover && 'card-hover cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={cn('text-xl font-bold text-gray-900 dark:text-white', className)}>
      {children}
    </h3>
  );
}

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function CardDescription({ children, className }: CardDescriptionProps) {
  return (
    <p className={cn('text-sm text-gray-600 dark:text-gray-400', className)}>
      {children}
    </p>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={className}>{children}</div>;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'primary',
}: MetricCardProps) {
  const colorClasses = {
    primary: 'border-primary-500 bg-primary-50 dark:bg-primary-900/20',
    green: 'border-green-500 bg-green-50 dark:bg-green-900/20',
    blue: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
    purple: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20',
    orange: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20',
  };

  return (
    <Card className={cn('border-l-4', colorClasses[color as keyof typeof colorClasses])}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div className="mt-2">
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.isPositive
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 text-4xl opacity-50">{icon}</div>
        )}
      </div>
    </Card>
  );
}
