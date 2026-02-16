/**
 * FlightPathGenerator.jsx
 * UI component for generating flight path patterns
 *
 * Features:
 * - Grid pattern generation with configurable spacing/angle
 * - Corridor pattern for linear features
 * - Perimeter survey option
 * - Manual waypoint mode
 * - Flight statistics preview
 *
 * @location src/components/map/FlightPathGenerator.jsx
 */

import React, { useState, useCallback } from 'react'
import {
  Grid3X3,
  Route,
  Square,
  MapPin,
  Settings2,
  Play,
  Trash2,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Clock,
  Ruler,
  Navigation,
  Plane
} from 'lucide-react'
import { FLIGHT_PATH_TYPES, DEFAULT_GRID_SETTINGS, DEFAULT_CORRIDOR_SETTINGS } from '../../lib/flightPathUtils'

// ============================================
// PATTERN TYPE SELECTOR
// ============================================

function PatternTypeSelector({ selectedType, onSelect, disabled }) {
  const types = [
    { id: 'grid', icon: Grid3X3, label: 'Grid', description: 'Area survey pattern' },
    { id: 'corridor', icon: Route, label: 'Corridor', description: 'Linear inspection' },
    { id: 'perimeter', icon: Square, label: 'Perimeter', description: 'Boundary survey' },
    { id: 'waypoint', icon: MapPin, label: 'Manual', description: 'Custom waypoints' }
  ]

  return (
    <div className="grid grid-cols-2 gap-2">
      {types.map(({ id, icon: Icon, label, description }) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          disabled={disabled}
          className={`
            flex flex-col items-center p-3 rounded-lg border-2 transition-all
            ${selectedType === id
              ? 'border-aeria-navy bg-aeria-navy/5'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <Icon className={`w-6 h-6 ${selectedType === id ? 'text-aeria-navy' : 'text-gray-500'}`} />
          <span className={`mt-1 text-sm font-medium ${selectedType === id ? 'text-aeria-navy' : 'text-gray-700'}`}>
            {label}
          </span>
          <span className="text-xs text-gray-400">{description}</span>
        </button>
      ))}
    </div>
  )
}

// ============================================
// GRID SETTINGS PANEL
// ============================================

function GridSettingsPanel({ settings, onChange, disabled }) {
  return (
    <div className="space-y-4">
      {/* Spacing */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700">Line Spacing</label>
          <span className="text-sm text-gray-500">{settings.spacing}m</span>
        </div>
        <input
          type="range"
          min="10"
          max="100"
          step="5"
          value={settings.spacing}
          onChange={(e) => onChange({ spacing: parseInt(e.target.value) })}
          disabled={disabled}
          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-aeria-navy
            [&::-webkit-slider-thumb]:cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>10m</span>
          <span>100m</span>
        </div>
      </div>

      {/* Angle */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700">Grid Angle</label>
          <span className="text-sm text-gray-500">{settings.angle}°</span>
        </div>
        <input
          type="range"
          min="0"
          max="180"
          step="5"
          value={settings.angle}
          onChange={(e) => onChange({ angle: parseInt(e.target.value) })}
          disabled={disabled}
          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-aeria-navy
            [&::-webkit-slider-thumb]:cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0° (E-W)</span>
          <span>90° (N-S)</span>
          <span>180°</span>
        </div>
      </div>

      {/* Altitude */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700">Flight Altitude</label>
          <span className="text-sm text-gray-500">{settings.altitude}m AGL</span>
        </div>
        <input
          type="range"
          min="20"
          max="400"
          step="10"
          value={settings.altitude}
          onChange={(e) => onChange({ altitude: parseInt(e.target.value) })}
          disabled={disabled}
          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-aeria-navy
            [&::-webkit-slider-thumb]:cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>20m</span>
          <span>400m</span>
        </div>
      </div>

      {/* Speed */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700">Flight Speed</label>
          <span className="text-sm text-gray-500">{settings.speed} m/s</span>
        </div>
        <input
          type="range"
          min="2"
          max="20"
          step="1"
          value={settings.speed}
          onChange={(e) => onChange({ speed: parseInt(e.target.value) })}
          disabled={disabled}
          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-aeria-navy
            [&::-webkit-slider-thumb]:cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>2 m/s</span>
          <span>20 m/s</span>
        </div>
      </div>
    </div>
  )
}

// ============================================
// CORRIDOR SETTINGS PANEL
// ============================================

function CorridorSettingsPanel({ settings, onChange, disabled }) {
  return (
    <div className="space-y-4">
      {/* Width */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700">Corridor Width</label>
          <span className="text-sm text-gray-500">{settings.width}m each side</span>
        </div>
        <input
          type="range"
          min="10"
          max="200"
          step="10"
          value={settings.width}
          onChange={(e) => onChange({ width: parseInt(e.target.value) })}
          disabled={disabled}
          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-aeria-navy
            [&::-webkit-slider-thumb]:cursor-pointer"
        />
      </div>

      {/* Waypoint Spacing */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700">Waypoint Spacing</label>
          <span className="text-sm text-gray-500">{settings.waypointSpacing}m</span>
        </div>
        <input
          type="range"
          min="25"
          max="500"
          step="25"
          value={settings.waypointSpacing}
          onChange={(e) => onChange({ waypointSpacing: parseInt(e.target.value) })}
          disabled={disabled}
          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-aeria-navy
            [&::-webkit-slider-thumb]:cursor-pointer"
        />
      </div>

      {/* Altitude */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700">Flight Altitude</label>
          <span className="text-sm text-gray-500">{settings.altitude}m AGL</span>
        </div>
        <input
          type="range"
          min="20"
          max="400"
          step="10"
          value={settings.altitude}
          onChange={(e) => onChange({ altitude: parseInt(e.target.value) })}
          disabled={disabled}
          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-aeria-navy
            [&::-webkit-slider-thumb]:cursor-pointer"
        />
      </div>
    </div>
  )
}

// ============================================
// FLIGHT STATS DISPLAY
// ============================================

function FlightStatsDisplay({ stats }) {
  if (!stats || stats.waypointCount === 0) {
    return (
      <div className="p-3 bg-gray-50 rounded-lg text-center text-sm text-gray-500">
        Generate a flight path to see statistics
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 text-gray-500 mb-1">
          <Ruler className="w-4 h-4" />
          <span className="text-xs">Distance</span>
        </div>
        <p className="text-lg font-semibold text-gray-900">
          {(stats.distance / 1000).toFixed(2)} km
        </p>
      </div>

      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 text-gray-500 mb-1">
          <Clock className="w-4 h-4" />
          <span className="text-xs">Duration</span>
        </div>
        <p className="text-lg font-semibold text-gray-900">
          {stats.durationMinutes} min
        </p>
      </div>

      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 text-gray-500 mb-1">
          <MapPin className="w-4 h-4" />
          <span className="text-xs">Waypoints</span>
        </div>
        <p className="text-lg font-semibold text-gray-900">
          {stats.waypointCount}
        </p>
      </div>

      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 text-gray-500 mb-1">
          <Navigation className="w-4 h-4" />
          <span className="text-xs">Altitude</span>
        </div>
        <p className="text-lg font-semibold text-gray-900">
          {stats.altitudeRange?.average || 0}m
        </p>
      </div>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * FlightPathGenerator - UI for generating flight patterns
 */
export function FlightPathGenerator({
  flightGeography,
  selectedType,
  gridSettings,
  corridorSettings,
  flightStats,
  waypoints,
  isEditing,
  onSelectType,
  onUpdateGridSettings,
  onUpdateCorridorSettings,
  onGenerate,
  onClear,
  onToggleEditing,
  className = ''
}) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

  const hasFlightGeography = flightGeography?.coordinates?.[0]?.length >= 4
  const hasWaypoints = waypoints && waypoints.length > 0

  const handleGenerate = useCallback(() => {
    if (selectedType === 'grid' || selectedType === 'perimeter') {
      onGenerate?.()
    }
  }, [selectedType, onGenerate])

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Plane className="w-5 h-5 text-aeria-navy" />
          <span className="text-sm font-semibold text-gray-900">Flight Path Generator</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Requirements Check */}
          {!hasFlightGeography && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                Draw a Flight Geography polygon first to generate a flight path.
              </p>
            </div>
          )}

          {/* Pattern Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pattern Type
            </label>
            <PatternTypeSelector
              selectedType={selectedType}
              onSelect={onSelectType}
              disabled={!hasFlightGeography && selectedType !== 'waypoint'}
            />
          </div>

          {/* Settings Section */}
          {selectedType && selectedType !== 'waypoint' && (
            <div>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-2"
              >
                <Settings2 className="w-4 h-4" />
                <span>Settings</span>
                {showSettings ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {showSettings && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  {selectedType === 'grid' && (
                    <GridSettingsPanel
                      settings={gridSettings}
                      onChange={onUpdateGridSettings}
                      disabled={!hasFlightGeography}
                    />
                  )}
                  {selectedType === 'corridor' && (
                    <CorridorSettingsPanel
                      settings={corridorSettings}
                      onChange={onUpdateCorridorSettings}
                      disabled={!hasFlightGeography}
                    />
                  )}
                  {selectedType === 'perimeter' && (
                    <GridSettingsPanel
                      settings={gridSettings}
                      onChange={onUpdateGridSettings}
                      disabled={!hasFlightGeography}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleGenerate}
              disabled={!hasFlightGeography || !selectedType || selectedType === 'waypoint' || selectedType === 'corridor'}
              className={`
                flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg
                font-medium text-sm transition-colors
                ${hasFlightGeography && selectedType && selectedType !== 'waypoint' && selectedType !== 'corridor'
                  ? 'bg-aeria-navy text-white hover:bg-aeria-navy/90'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              <Play className="w-4 h-4" />
              Generate Path
            </button>

            {hasWaypoints && (
              <button
                onClick={onClear}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg
                  font-medium text-sm bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Corridor Instructions */}
          {selectedType === 'corridor' && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                To create a corridor path, draw a line on the map along the feature you want to survey (road, pipeline, waterway).
              </p>
            </div>
          )}

          {/* Manual Waypoint Instructions */}
          {selectedType === 'waypoint' && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Click on the map to place waypoints. Each waypoint will be connected in sequence to form your flight path.
              </p>
            </div>
          )}

          {/* Flight Stats */}
          {hasWaypoints && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Flight Statistics
              </label>
              <FlightStatsDisplay stats={flightStats} />
            </div>
          )}

          {/* Edit Mode Toggle */}
          {hasWaypoints && (
            <button
              onClick={onToggleEditing}
              className={`
                w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg
                font-medium text-sm border-2 transition-colors
                ${isEditing
                  ? 'border-aeria-navy bg-aeria-navy/5 text-aeria-navy'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {isEditing ? (
                <>
                  <RotateCcw className="w-4 h-4" />
                  Exit Edit Mode
                </>
              ) : (
                <>
                  <Settings2 className="w-4 h-4" />
                  Edit Waypoints
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default FlightPathGenerator
