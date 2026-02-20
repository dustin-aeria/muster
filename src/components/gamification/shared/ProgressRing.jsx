/**
 * Progress Ring Component
 * Circular progress indicator with customizable appearance
 */

import { useMemo } from 'react'

export default function ProgressRing({
  progress = 0,
  size = 120,
  strokeWidth = 8,
  color = 'purple',
  trackColor = 'gray-200',
  showValue = true,
  valueFormat = 'percent',
  label = '',
  children,
  className = ''
}) {
  const normalizedProgress = Math.min(100, Math.max(0, progress))

  const dimensions = useMemo(() => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (normalizedProgress / 100) * circumference

    return { radius, circumference, offset }
  }, [size, strokeWidth, normalizedProgress])

  const colorClasses = {
    purple: 'stroke-purple-500',
    blue: 'stroke-blue-500',
    green: 'stroke-green-500',
    amber: 'stroke-amber-500',
    red: 'stroke-red-500',
    indigo: 'stroke-indigo-500',
    gradient: 'stroke-[url(#progress-gradient)]'
  }

  const formatValue = () => {
    switch (valueFormat) {
      case 'percent':
        return `${Math.round(normalizedProgress)}%`
      case 'fraction':
        return `${Math.round(normalizedProgress)}/100`
      case 'number':
        return Math.round(normalizedProgress).toString()
      default:
        return `${Math.round(normalizedProgress)}%`
    }
  }

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <defs>
          <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
        </defs>

        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={dimensions.radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={`stroke-${trackColor}`}
        />

        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={dimensions.radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={colorClasses[color] || colorClasses.purple}
          style={{
            strokeDasharray: dimensions.circumference,
            strokeDashoffset: dimensions.offset,
            transition: 'stroke-dashoffset 0.5s ease-out'
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children || (
          <>
            {showValue && (
              <span className="text-2xl font-bold text-gray-900">
                {formatValue()}
              </span>
            )}
            {label && (
              <span className="text-sm text-gray-500">{label}</span>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/**
 * Small progress ring for inline use
 */
export function MiniProgressRing({
  progress = 0,
  size = 32,
  strokeWidth = 3,
  color = 'purple',
  className = ''
}) {
  return (
    <ProgressRing
      progress={progress}
      size={size}
      strokeWidth={strokeWidth}
      color={color}
      showValue={false}
      className={className}
    />
  )
}

/**
 * Progress ring with score tier coloring
 */
export function ScoreRing({
  score = 0,
  size = 120,
  strokeWidth = 10,
  showLabel = true,
  label = 'Score',
  className = ''
}) {
  const getColor = () => {
    if (score >= 90) return 'green'
    if (score >= 75) return 'blue'
    if (score >= 60) return 'amber'
    return 'red'
  }

  const getTierLabel = () => {
    if (score >= 90) return 'Excellent'
    if (score >= 75) return 'Good'
    if (score >= 60) return 'Fair'
    return 'Needs Work'
  }

  return (
    <ProgressRing
      progress={score}
      size={size}
      strokeWidth={strokeWidth}
      color={getColor()}
      showValue={true}
      className={className}
    >
      <span className="text-3xl font-bold text-gray-900">{Math.round(score)}</span>
      {showLabel && (
        <span className="text-xs text-gray-500 mt-1">{label}</span>
      )}
    </ProgressRing>
  )
}

/**
 * Multiple segment progress ring (for category breakdowns)
 */
export function SegmentedProgressRing({
  segments = [],
  size = 140,
  strokeWidth = 12,
  gap = 4,
  className = ''
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI

  // Calculate segment positions
  const totalValue = segments.reduce((sum, seg) => sum + seg.value, 0) || 100
  let currentOffset = 0

  const segmentData = segments.map((segment, index) => {
    const percentage = (segment.value / totalValue) * 100
    const length = (percentage / 100) * circumference - gap
    const offset = currentOffset
    currentOffset += (percentage / 100) * circumference

    return {
      ...segment,
      length,
      offset,
      dasharray: `${Math.max(0, length)} ${circumference}`
    }
  })

  const colorClasses = {
    purple: 'stroke-purple-500',
    blue: 'stroke-blue-500',
    green: 'stroke-green-500',
    amber: 'stroke-amber-500',
    red: 'stroke-red-500',
    indigo: 'stroke-indigo-500',
    pink: 'stroke-pink-500',
    teal: 'stroke-teal-500'
  }

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-gray-200"
        />

        {/* Segments */}
        {segmentData.map((segment, index) => (
          <circle
            key={index}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={colorClasses[segment.color] || colorClasses.purple}
            style={{
              strokeDasharray: segment.dasharray,
              strokeDashoffset: -segment.offset,
              transition: 'stroke-dasharray 0.5s ease-out, stroke-dashoffset 0.5s ease-out'
            }}
          />
        ))}
      </svg>
    </div>
  )
}
