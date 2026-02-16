/**
 * WaypointEditor.jsx
 * Panel for editing individual waypoint properties
 *
 * Features:
 * - Altitude adjustment with slider and input
 * - Waypoint type display
 * - Coordinates display
 * - Delete waypoint option
 * - Waypoint list with drag-to-reorder
 *
 * @location src/components/map/WaypointEditor.jsx
 */

import React, { useState, useCallback } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  GripVertical,
  Navigation,
  MapPin,
  Circle,
  PlayCircle,
  StopCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

// ============================================
// WAYPOINT TYPE ICONS
// ============================================

const WaypointTypeIcon = ({ type, className = '' }) => {
  switch (type) {
    case 'start':
      return <PlayCircle className={`text-green-500 ${className}`} />
    case 'end':
      return <StopCircle className={`text-red-500 ${className}`} />
    case 'turn':
      return <Navigation className={`text-amber-500 ${className}`} />
    default:
      return <Circle className={`text-blue-500 ${className}`} />
  }
}

// ============================================
// SINGLE WAYPOINT EDITOR
// ============================================

function SingleWaypointEditor({
  waypoint,
  onUpdateAltitude,
  onDelete,
  maxAltitude = 400
}) {
  const [localAltitude, setLocalAltitude] = useState(waypoint.coordinates[2])

  const handleAltitudeChange = useCallback((value) => {
    const clamped = Math.max(0, Math.min(maxAltitude, value))
    setLocalAltitude(clamped)
  }, [maxAltitude])

  const handleAltitudeCommit = useCallback(() => {
    onUpdateAltitude?.(waypoint.id, localAltitude)
  }, [waypoint.id, localAltitude, onUpdateAltitude])

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <WaypointTypeIcon type={waypoint.type} className="w-5 h-5" />
          <span className="font-semibold text-gray-900">{waypoint.label}</span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
            {waypoint.type}
          </span>
        </div>
        {waypoint.type !== 'start' && waypoint.type !== 'end' && (
          <button
            onClick={() => onDelete?.(waypoint.id)}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete waypoint"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Coordinates */}
      <div className="text-xs text-gray-500 mb-4 font-mono">
        {waypoint.coordinates[1].toFixed(6)}, {waypoint.coordinates[0].toFixed(6)}
      </div>

      {/* Altitude Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Altitude</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAltitudeChange(localAltitude - 10)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ArrowDown className="w-4 h-4 text-gray-500" />
            </button>
            <input
              type="number"
              value={localAltitude}
              onChange={(e) => handleAltitudeChange(parseInt(e.target.value) || 0)}
              onBlur={handleAltitudeCommit}
              className="w-16 px-2 py-1 text-center text-sm border border-gray-200 rounded"
            />
            <button
              onClick={() => handleAltitudeChange(localAltitude + 10)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ArrowUp className="w-4 h-4 text-gray-500" />
            </button>
            <span className="text-xs text-gray-500">m AGL</span>
          </div>
        </div>

        <input
          type="range"
          min="0"
          max={maxAltitude}
          step="5"
          value={localAltitude}
          onChange={(e) => handleAltitudeChange(parseInt(e.target.value))}
          onMouseUp={handleAltitudeCommit}
          onTouchEnd={handleAltitudeCommit}
          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-aeria-navy
            [&::-webkit-slider-thumb]:cursor-pointer"
        />

        <div className="flex justify-between text-xs text-gray-400">
          <span>0m</span>
          <span>{maxAltitude}m</span>
        </div>
      </div>
    </div>
  )
}

// ============================================
// WAYPOINT LIST ITEM
// ============================================

function WaypointListItem({
  waypoint,
  isSelected,
  onSelect,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown
}) {
  return (
    <div
      className={`
        flex items-center gap-2 p-2 rounded-lg border transition-colors cursor-pointer
        ${isSelected
          ? 'border-aeria-navy bg-aeria-navy/5'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }
      `}
      onClick={() => onSelect?.(waypoint.id)}
    >
      {/* Drag handle */}
      <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />

      {/* Type icon */}
      <WaypointTypeIcon type={waypoint.type} className="w-4 h-4" />

      {/* Label and altitude */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{waypoint.label}</p>
        <p className="text-xs text-gray-500">{waypoint.coordinates[2]}m AGL</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onMoveUp?.(waypoint.order)
          }}
          disabled={!canMoveUp}
          className={`p-1 rounded ${canMoveUp ? 'hover:bg-gray-200' : 'opacity-30'}`}
        >
          <ArrowUp className="w-3 h-3 text-gray-500" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onMoveDown?.(waypoint.order)
          }}
          disabled={!canMoveDown}
          className={`p-1 rounded ${canMoveDown ? 'hover:bg-gray-200' : 'opacity-30'}`}
        >
          <ArrowDown className="w-3 h-3 text-gray-500" />
        </button>
        {waypoint.type !== 'start' && waypoint.type !== 'end' && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete?.(waypoint.id)
            }}
            className="p-1 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-3 h-3 text-red-500" />
          </button>
        )}
      </div>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * WaypointEditor - Panel for editing waypoints
 */
export function WaypointEditor({
  waypoints,
  selectedWaypointId,
  onSelectWaypoint,
  onUpdateAltitude,
  onDeleteWaypoint,
  onReorderWaypoints,
  maxAltitude = 400,
  className = ''
}) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [viewMode, setViewMode] = useState('list') // 'list' | 'single'

  const sortedWaypoints = [...(waypoints || [])].sort((a, b) => a.order - b.order)
  const selectedWaypoint = sortedWaypoints.find(wp => wp.id === selectedWaypointId)

  const handleMoveUp = useCallback((order) => {
    if (order > 0) {
      onReorderWaypoints?.(order, order - 1)
    }
  }, [onReorderWaypoints])

  const handleMoveDown = useCallback((order) => {
    if (order < sortedWaypoints.length - 1) {
      onReorderWaypoints?.(order, order + 1)
    }
  }, [sortedWaypoints.length, onReorderWaypoints])

  if (!waypoints || waypoints.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-lg border border-gray-200 p-4 ${className}`}>
        <div className="flex items-center gap-2 text-gray-500">
          <MapPin className="w-5 h-5" />
          <span className="text-sm">No waypoints to edit</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-aeria-navy" />
          <span className="text-sm font-semibold text-gray-900">
            Waypoints ({sortedWaypoints.length})
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-3">
          {/* View Mode Toggle */}
          <div className="flex gap-1 mb-3 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('single')}
              disabled={!selectedWaypointId}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'single'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              } ${!selectedWaypointId ? 'opacity-50' : ''}`}
            >
              Edit Selected
            </button>
          </div>

          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sortedWaypoints.map((wp, index) => (
                <WaypointListItem
                  key={wp.id}
                  waypoint={wp}
                  isSelected={wp.id === selectedWaypointId}
                  onSelect={onSelectWaypoint}
                  onDelete={onDeleteWaypoint}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  canMoveUp={index > 0}
                  canMoveDown={index < sortedWaypoints.length - 1}
                />
              ))}
            </div>
          )}

          {/* Single Edit View */}
          {viewMode === 'single' && selectedWaypoint && (
            <SingleWaypointEditor
              waypoint={selectedWaypoint}
              onUpdateAltitude={onUpdateAltitude}
              onDelete={onDeleteWaypoint}
              maxAltitude={maxAltitude}
            />
          )}

          {viewMode === 'single' && !selectedWaypoint && (
            <div className="text-center py-8 text-gray-500 text-sm">
              Select a waypoint on the map or from the list to edit
            </div>
          )}

          {/* Bulk Actions */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Set all to:</span>
              <button
                onClick={() => {
                  sortedWaypoints.forEach(wp => onUpdateAltitude?.(wp.id, 60))
                }}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                60m
              </button>
              <button
                onClick={() => {
                  sortedWaypoints.forEach(wp => onUpdateAltitude?.(wp.id, 90))
                }}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                90m
              </button>
              <button
                onClick={() => {
                  sortedWaypoints.forEach(wp => onUpdateAltitude?.(wp.id, 120))
                }}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                120m
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WaypointEditor
