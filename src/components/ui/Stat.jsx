import React from 'react';
import { cn } from '../../lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUp,
  ArrowDown,
  Info,
  MoreHorizontal,
  RefreshCw
} from 'lucide-react';

/**
 * Batch 98: Stat/Metric Component
 *
 * Statistical and metric display components.
 *
 * Exports:
 * - Stat: Basic stat display
 * - StatCard: Card with stat
 * - StatGroup: Group of stats
 * - StatTrend: Stat with trend indicator
 * - StatComparison: Compare two values
 * - StatProgress: Stat with progress bar
 * - StatMini: Compact inline stat
 * - StatRing: Circular progress stat
 * - StatDelta: Change indicator
 * - StatGoal: Goal/target stat
 * - StatTimeline: Stat with sparkline
 * - KPI: Key Performance Indicator
 */

// ============================================================================
// STAT - Basic stat display
// ============================================================================
export function Stat({
  label,
  value,
  prefix,
  suffix,
  helpText,
  icon: Icon,
  trend,
  trendValue,
  size = 'md',
  align = 'left',
  className,
  ...props
}) {
  const sizeClasses = {
    sm: {
      label: 'text-xs',
      value: 'text-xl',
      helpText: 'text-xs',
    },
    md: {
      label: 'text-sm',
      value: 'text-3xl',
      helpText: 'text-sm',
    },
    lg: {
      label: 'text-base',
      value: 'text-4xl',
      helpText: 'text-sm',
    },
    xl: {
      label: 'text-lg',
      value: 'text-5xl',
      helpText: 'text-base',
    },
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const trendConfig = {
    up: { icon: TrendingUp, color: 'text-green-500' },
    down: { icon: TrendingDown, color: 'text-red-500' },
    neutral: { icon: Minus, color: 'text-gray-500' },
  };

  const TrendIcon = trend ? trendConfig[trend].icon : null;

  return (
    <div className={cn(alignClasses[align], className)} {...props}>
      {label && (
        <p className={cn(
          'font-medium text-gray-500 dark:text-gray-400 mb-1',
          sizeClasses[size].label
        )}>
          {Icon && <Icon className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />}
          {label}
        </p>
      )}

      <p className={cn(
        'font-bold text-gray-900 dark:text-white',
        sizeClasses[size].value
      )}>
        {prefix && <span className="text-gray-500 dark:text-gray-400">{prefix}</span>}
        {value}
        {suffix && <span className="text-gray-500 dark:text-gray-400 text-lg ml-1">{suffix}</span>}
      </p>

      {(helpText || trend) && (
        <div className={cn(
          'flex items-center gap-2 mt-1',
          alignClasses[align] === 'text-center' && 'justify-center',
          alignClasses[align] === 'text-right' && 'justify-end',
          sizeClasses[size].helpText
        )}>
          {trend && TrendIcon && (
            <span className={cn('flex items-center gap-0.5', trendConfig[trend].color)}>
              <TrendIcon className="w-4 h-4" />
              {trendValue && <span className="font-medium">{trendValue}</span>}
            </span>
          )}
          {helpText && (
            <span className="text-gray-500 dark:text-gray-400">{helpText}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// STAT CARD - Card with stat
// ============================================================================
export function StatCard({
  label,
  value,
  prefix,
  suffix,
  helpText,
  icon: Icon,
  iconColor = 'blue',
  trend,
  trendValue,
  action,
  loading = false,
  className,
  ...props
}) {
  const iconColorClasses = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400',
    gray: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  };

  const trendConfig = {
    up: { icon: ArrowUp, color: 'text-green-500 bg-green-50 dark:bg-green-900/30' },
    down: { icon: ArrowDown, color: 'text-red-500 bg-red-50 dark:bg-red-900/30' },
    neutral: { icon: Minus, color: 'text-gray-500 bg-gray-50 dark:bg-gray-800' },
  };

  const TrendIcon = trend ? trendConfig[trend].icon : null;

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6',
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {label}
          </p>

          {loading ? (
            <div className="h-9 w-24 mt-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ) : (
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {prefix && <span className="text-gray-500 dark:text-gray-400 text-xl">{prefix}</span>}
              {value}
              {suffix && <span className="text-gray-500 dark:text-gray-400 text-lg ml-1">{suffix}</span>}
            </p>
          )}

          {(helpText || trend) && (
            <div className="flex items-center gap-2 mt-2">
              {trend && TrendIcon && (
                <span className={cn(
                  'inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium',
                  trendConfig[trend].color
                )}>
                  <TrendIcon className="w-3 h-3" />
                  {trendValue}
                </span>
              )}
              {helpText && (
                <span className="text-sm text-gray-500 dark:text-gray-400">{helpText}</span>
              )}
            </div>
          )}
        </div>

        {Icon && (
          <div className={cn('p-3 rounded-lg', iconColorClasses[iconColor])}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {action && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {action}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// STAT GROUP - Group of stats
// ============================================================================
export function StatGroup({
  children,
  columns = 4,
  dividers = true,
  className,
  ...props
}) {
  const colClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-2 lg:grid-cols-5',
  };

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700',
        className
      )}
      {...props}
    >
      <div className={cn('grid', colClasses[columns])}>
        {React.Children.map(children, (child, index) => (
          <div
            key={index}
            className={cn(
              'p-6',
              dividers && index > 0 && 'border-t sm:border-t-0 sm:border-l border-gray-200 dark:border-gray-700'
            )}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// STAT TREND - Stat with trend indicator
// ============================================================================
export function StatTrend({
  label,
  value,
  previousValue,
  format = 'number',
  showChange = true,
  invertColors = false,
  className,
  ...props
}) {
  const numValue = typeof value === 'number' ? value : parseFloat(value);
  const numPrevious = typeof previousValue === 'number' ? previousValue : parseFloat(previousValue);
  const change = numPrevious !== 0 ? ((numValue - numPrevious) / numPrevious) * 100 : 0;
  const isPositive = change > 0;
  const isNegative = change < 0;

  const formatValue = (val) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
      case 'percent':
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString();
    }
  };

  const getTrendColor = () => {
    if (change === 0) return 'text-gray-500';
    const positive = invertColors ? isNegative : isPositive;
    return positive ? 'text-green-500' : 'text-red-500';
  };

  return (
    <div className={className} {...props}>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
        {formatValue(numValue)}
      </p>
      {showChange && (
        <div className="flex items-center gap-1 mt-1">
          <span className={cn('flex items-center text-sm font-medium', getTrendColor())}>
            {isPositive && <ArrowUp className="w-4 h-4" />}
            {isNegative && <ArrowDown className="w-4 h-4" />}
            {Math.abs(change).toFixed(1)}%
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            vs {formatValue(numPrevious)}
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// STAT COMPARISON - Compare two values
// ============================================================================
export function StatComparison({
  label,
  currentLabel = 'Current',
  previousLabel = 'Previous',
  currentValue,
  previousValue,
  format = 'number',
  className,
  ...props
}) {
  const formatValue = (val) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
      case 'percent':
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString();
    }
  };

  return (
    <div className={className} {...props}>
      {label && (
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
          {label}
        </p>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            {currentLabel}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {formatValue(currentValue)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            {previousLabel}
          </p>
          <p className="text-2xl font-bold text-gray-500 dark:text-gray-400 mt-1">
            {formatValue(previousValue)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STAT PROGRESS - Stat with progress bar
// ============================================================================
export function StatProgress({
  label,
  value,
  max = 100,
  format,
  color = 'blue',
  showPercentage = true,
  className,
  ...props
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
  };

  const formatValue = (val) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    }
    return val.toLocaleString();
  };

  return (
    <div className={className} {...props}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {label}
        </p>
        {showPercentage && (
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {percentage.toFixed(0)}%
          </p>
        )}
      </div>

      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {formatValue(value)}
        <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
          / {formatValue(max)}
        </span>
      </p>

      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', colorClasses[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// STAT MINI - Compact inline stat
// ============================================================================
export function StatMini({
  label,
  value,
  trend,
  trendValue,
  icon: Icon,
  className,
  ...props
}) {
  const trendConfig = {
    up: { icon: ArrowUp, color: 'text-green-500' },
    down: { icon: ArrowDown, color: 'text-red-500' },
    neutral: { icon: Minus, color: 'text-gray-500' },
  };

  const TrendIcon = trend ? trendConfig[trend].icon : null;

  return (
    <div className={cn('flex items-center gap-3', className)} {...props}>
      {Icon && (
        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </div>
      )}
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <div className="flex items-center gap-1">
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{value}</p>
          {trend && TrendIcon && (
            <span className={cn('flex items-center text-xs', trendConfig[trend].color)}>
              <TrendIcon className="w-3 h-3" />
              {trendValue}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STAT RING - Circular progress stat
// ============================================================================
export function StatRing({
  label,
  value,
  max = 100,
  size = 'md',
  color = 'blue',
  showValue = true,
  className,
  ...props
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeConfig = {
    sm: { size: 64, stroke: 6, text: 'text-sm' },
    md: { size: 96, stroke: 8, text: 'text-lg' },
    lg: { size: 128, stroke: 10, text: 'text-2xl' },
  };

  const colorClasses = {
    blue: 'stroke-blue-500',
    green: 'stroke-green-500',
    red: 'stroke-red-500',
    yellow: 'stroke-yellow-500',
    purple: 'stroke-purple-500',
  };

  const config = sizeConfig[size];
  const radius = (config.size - config.stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('flex flex-col items-center', className)} {...props}>
      <div className="relative" style={{ width: config.size, height: config.size }}>
        <svg width={config.size} height={config.size} className="transform -rotate-90">
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={config.stroke}
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            strokeWidth={config.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={cn('transition-all duration-500', colorClasses[color])}
          />
        </svg>
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn('font-bold text-gray-900 dark:text-white', config.text)}>
              {percentage.toFixed(0)}%
            </span>
          </div>
        )}
      </div>
      {label && (
        <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
          {label}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// STAT GOAL - Goal/target stat
// ============================================================================
export function StatGoal({
  label,
  current,
  goal,
  format,
  deadline,
  className,
  ...props
}) {
  const percentage = Math.min(100, Math.max(0, (current / goal) * 100));
  const remaining = goal - current;

  const formatValue = (val) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    }
    return val.toLocaleString();
  };

  return (
    <div className={className} {...props}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {label}
        </p>
        {deadline && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Due: {deadline}
          </p>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {formatValue(current)}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          of {formatValue(goal)}
        </p>
      </div>

      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        {remaining > 0 ? (
          <>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatValue(remaining)}
            </span>{' '}
            remaining to reach goal
          </>
        ) : (
          <span className="text-green-600 dark:text-green-400 font-medium">
            Goal achieved!
          </span>
        )}
      </p>
    </div>
  );
}

// ============================================================================
// KPI - Key Performance Indicator
// ============================================================================
export function KPI({
  title,
  value,
  target,
  trend,
  trendValue,
  status,
  icon: Icon,
  actions,
  lastUpdated,
  className,
  ...props
}) {
  const statusClasses = {
    good: 'border-l-green-500',
    warning: 'border-l-yellow-500',
    critical: 'border-l-red-500',
    neutral: 'border-l-gray-300 dark:border-l-gray-600',
  };

  const statusBadgeClasses = {
    good: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400',
    critical: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400',
    neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  };

  const trendConfig = {
    up: { icon: TrendingUp, color: 'text-green-500' },
    down: { icon: TrendingDown, color: 'text-red-500' },
    neutral: { icon: Minus, color: 'text-gray-500' },
  };

  const TrendIcon = trend ? trendConfig[trend].icon : null;

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700',
        'border-l-4',
        statusClasses[status || 'neutral'],
        className
      )}
      {...props}
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
            )}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {title}
              </h3>
              {lastUpdated && (
                <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                  <RefreshCw className="w-3 h-3" />
                  {lastUpdated}
                </p>
              )}
            </div>
          </div>

          {status && (
            <span className={cn(
              'px-2 py-1 text-xs font-medium rounded-full capitalize',
              statusBadgeClasses[status]
            )}>
              {status}
            </span>
          )}
        </div>

        <div className="mt-4">
          <p className="text-4xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>

          <div className="flex items-center gap-3 mt-2">
            {target && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Target: {target}
              </span>
            )}
            {trend && TrendIcon && (
              <span className={cn('flex items-center gap-1 text-sm', trendConfig[trend].color)}>
                <TrendIcon className="w-4 h-4" />
                {trendValue}
              </span>
            )}
          </div>
        </div>
      </div>

      {actions && (
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
          {actions}
        </div>
      )}
    </div>
  );
}

export default Stat;
