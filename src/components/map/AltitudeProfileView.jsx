/**
 * AltitudeProfileView.jsx
 * Side-view chart showing altitude profile along flight path
 *
 * Features:
 * - 2D side-view showing terrain and flight altitude
 * - X-axis: distance along path
 * - Y-axis: altitude (meters AGL)
 * - Interactive hover to highlight map position
 * - Waypoint markers on profile
 *
 * @location src/components/map/AltitudeProfileView.jsx
 */

import React, { useMemo, useState, useRef, useCallback } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Mountain,
  Plane
} from 'lucide-react'

// ============================================
// CONSTANTS
// ============================================

const CHART_HEIGHT = 120
const CHART_PADDING = { top: 20, right: 20, bottom: 30, left: 45 }

// ============================================
// ALTITUDE PROFILE CHART
// ============================================

function AltitudeChart({
  profile,
  selectedWaypointId,
  onWaypointHover,
  onWaypointClick,
  width = 400
}) {
  const svgRef = useRef(null)
  const [hoveredIndex, setHoveredIndex] = useState(null)

  // Calculate scales
  const { xScale, yScale, pathD, areaD, maxDistance, maxAltitude } = useMemo(() => {
    if (!profile || profile.length === 0) {
      return {
        xScale: () => CHART_PADDING.left,
        yScale: () => CHART_PADDING.top,
        pathD: '',
        areaD: '',
        maxDistance: 0,
        maxAltitude: 100
      }
    }

    const innerWidth = width - CHART_PADDING.left - CHART_PADDING.right
    const innerHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom

    // Calculate max values with safety checks
    const distances = profile.map(p => p.distance || 0)
    const altitudes = profile.map(p => p.altitude || 0)

    let maxDistance = Math.max(...distances, 0)
    let maxAltitude = Math.max(...altitudes, 50) * 1.1 // 10% padding
    const minAltitude = 0

    // Prevent division by zero
    if (maxDistance <= 0) maxDistance = 100 // Default to 100m if no distance
    if (maxAltitude <= minAltitude) maxAltitude = minAltitude + 100 // Ensure range

    const xScale = (d) => {
      const val = CHART_PADDING.left + ((d || 0) / maxDistance) * innerWidth
      return isNaN(val) ? CHART_PADDING.left : val
    }

    const yScale = (a) => {
      const range = maxAltitude - minAltitude
      const val = CHART_PADDING.top + innerHeight - (((a || 0) - minAltitude) / range) * innerHeight
      return isNaN(val) ? CHART_PADDING.top + innerHeight : val
    }

    // Flight path line - filter out any NaN values
    const pathPoints = profile
      .map(p => {
        const x = xScale(p.distance)
        const y = yScale(p.altitude)
        if (isNaN(x) || isNaN(y)) return null
        return `${x},${y}`
      })
      .filter(Boolean)

    const pathD = pathPoints.length > 0 ? `M ${pathPoints.join(' L ')}` : ''

    // Area under the line
    const areaD = pathPoints.length > 0
      ? `${pathD} L ${xScale(maxDistance)},${yScale(0)} L ${xScale(0)},${yScale(0)} Z`
      : ''

    return { xScale, yScale, pathD, areaD, maxDistance, maxAltitude }
  }, [profile, width])

  const handleMouseMove = useCallback((e) => {
    if (!svgRef.current || !profile || profile.length === 0) return

    const rect = svgRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left

    // Find closest waypoint
    let closestIndex = 0
    let closestDist = Infinity

    profile.forEach((p, i) => {
      const px = xScale(p.distance)
      const dist = Math.abs(x - px)
      if (dist < closestDist) {
        closestDist = dist
        closestIndex = i
      }
    })

    if (closestDist < 30) {
      setHoveredIndex(closestIndex)
      onWaypointHover?.(profile[closestIndex]?.waypointId)
    } else {
      setHoveredIndex(null)
      onWaypointHover?.(null)
    }
  }, [profile, xScale, onWaypointHover])

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null)
    onWaypointHover?.(null)
  }, [onWaypointHover])

  if (!profile || profile.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-gray-400 text-sm"
        style={{ height: CHART_HEIGHT }}
      >
        No flight path data
      </div>
    )
  }

  // Use computed values from useMemo (maxDistance and maxAltitude already calculated)

  return (
    <svg
      ref={svgRef}
      width={width}
      height={CHART_HEIGHT}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="cursor-crosshair"
    >
      {/* Background */}
      <rect
        x={CHART_PADDING.left}
        y={CHART_PADDING.top}
        width={width - CHART_PADDING.left - CHART_PADDING.right}
        height={CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom}
        fill="#F9FAFB"
        rx={4}
      />

      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
        const y = yScale(maxAltitude * ratio)
        // Skip rendering if y is NaN
        if (isNaN(y)) return null
        return (
          <g key={ratio}>
            <line
              x1={CHART_PADDING.left}
              y1={y}
              x2={width - CHART_PADDING.right}
              y2={y}
              stroke="#E5E7EB"
              strokeDasharray="2,2"
            />
            <text
              x={CHART_PADDING.left - 5}
              y={y}
              textAnchor="end"
              alignmentBaseline="middle"
              className="fill-gray-400 text-xs"
            >
              {Math.round(maxAltitude * ratio)}
            </text>
          </g>
        )
      })}

      {/* Area fill */}
      <path
        d={areaD}
        fill="url(#altitudeGradient)"
        opacity={0.3}
      />

      {/* Gradient definition */}
      <defs>
        <linearGradient id="altitudeGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Flight path line */}
      <path
        d={pathD}
        fill="none"
        stroke="#3B82F6"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Ground line */}
      {!isNaN(yScale(0)) && (
        <line
          x1={CHART_PADDING.left}
          y1={yScale(0)}
          x2={width - CHART_PADDING.right}
          y2={yScale(0)}
          stroke="#10B981"
          strokeWidth={2}
        />
      )}

      {/* Waypoint markers */}
      {profile.map((point, index) => {
        const x = xScale(point.distance)
        const y = yScale(point.altitude)
        const groundY = yScale(0)

        // Skip if coordinates are NaN
        if (isNaN(x) || isNaN(y) || isNaN(groundY)) return null

        const isSelected = point.waypointId === selectedWaypointId
        const isHovered = index === hoveredIndex

        return (
          <g
            key={point.waypointId || index}
            onClick={() => onWaypointClick?.(point.waypointId)}
            className="cursor-pointer"
          >
            {/* Vertical line from ground to altitude */}
            <line
              x1={x}
              y1={groundY}
              x2={x}
              y2={y}
              stroke="#9CA3AF"
              strokeWidth={1}
              strokeDasharray="2,2"
              opacity={isHovered || isSelected ? 1 : 0.3}
            />

            {/* Waypoint circle */}
            <circle
              cx={x}
              cy={y}
              r={isSelected || isHovered ? 6 : 4}
              fill={index === 0 ? '#22C55E' : index === profile.length - 1 ? '#EF4444' : '#3B82F6'}
              stroke="white"
              strokeWidth={2}
            />

            {/* Label */}
            {(isHovered || isSelected) && (
              <g>
                <rect
                  x={x - 25}
                  y={y - 30}
                  width={50}
                  height={20}
                  rx={4}
                  fill="white"
                  stroke="#E5E7EB"
                />
                <text
                  x={x}
                  y={y - 16}
                  textAnchor="middle"
                  className="fill-gray-700 text-xs font-medium"
                >
                  {Math.round(point.altitude || 0)}m
                </text>
              </g>
            )}
          </g>
        )
      })}

      {/* X-axis labels */}
      <text
        x={CHART_PADDING.left}
        y={CHART_HEIGHT - 5}
        className="fill-gray-400 text-xs"
      >
        0m
      </text>
      <text
        x={width - CHART_PADDING.right}
        y={CHART_HEIGHT - 5}
        textAnchor="end"
        className="fill-gray-400 text-xs"
      >
        {maxDistance >= 1000 ? `${(maxDistance / 1000).toFixed(1)}km` : `${Math.round(maxDistance)}m`}
      </text>

      {/* Axis labels */}
      <text
        x={12}
        y={CHART_HEIGHT / 2}
        textAnchor="middle"
        transform={`rotate(-90, 12, ${CHART_HEIGHT / 2})`}
        className="fill-gray-500 text-xs"
      >
        Alt (m)
      </text>
    </svg>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * AltitudeProfileView - Collapsible panel showing altitude profile
 */
export function AltitudeProfileView({
  profile,
  selectedWaypointId,
  onWaypointHover,
  onWaypointClick,
  altitudeRange,
  className = ''
}) {
  const [isExpanded, setIsExpanded] = useState(true)
  const containerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(400)

  // Measure container width
  React.useEffect(() => {
    if (!containerRef.current) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width)
      }
    })

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Mountain className="w-4 h-4 text-aeria-navy" />
          <span className="text-sm font-medium text-gray-900">Altitude Profile</span>
          {altitudeRange && (
            <span className="text-xs text-gray-500">
              ({altitudeRange.min}m - {altitudeRange.max}m)
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Chart */}
      {isExpanded && (
        <div ref={containerRef} className="p-2">
          <AltitudeChart
            profile={profile}
            selectedWaypointId={selectedWaypointId}
            onWaypointHover={onWaypointHover}
            onWaypointClick={onWaypointClick}
            width={containerWidth - 16}
          />

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Start</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-blue-500" />
              <span>Flight Path</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>End</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-green-500" />
              <span>Ground</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AltitudeProfileView
