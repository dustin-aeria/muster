/**
 * Map3DControls.jsx
 * Control panel for 3D map visualization features
 *
 * Provides UI controls for:
 * - 3D mode toggle
 * - Terrain toggle and exaggeration
 * - Camera pitch and bearing
 * - Sky/atmosphere toggle
 *
 * @location src/components/map/Map3DControls.jsx
 */

import React, { useState } from 'react'
import {
  Mountain,
  Compass,
  Sun,
  Box,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Layers3,
  Move3D
} from 'lucide-react'

// ============================================
// 3D TOGGLE BUTTON
// ============================================

/**
 * Simple 3D mode toggle button for map controls
 */
export function Toggle3DButton({
  is3DEnabled,
  onToggle,
  className = ''
}) {
  return (
    <button
      onClick={onToggle}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg shadow-md transition-all
        ${is3DEnabled
          ? 'bg-aeria-navy text-white hover:bg-aeria-navy/90'
          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
        }
        ${className}
      `}
      title={is3DEnabled ? 'Switch to 2D view' : 'Switch to 3D view'}
    >
      <Box className="w-4 h-4" />
      <span className="text-sm font-medium">
        {is3DEnabled ? '3D' : '2D'}
      </span>
    </button>
  )
}

// ============================================
// TERRAIN EXAGGERATION SLIDER
// ============================================

function TerrainSlider({ value, onChange, disabled }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-8">1x</span>
      <input
        type="range"
        min="1"
        max="3"
        step="0.1"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        className={`
          flex-1 h-2 rounded-full appearance-none cursor-pointer
          ${disabled ? 'bg-gray-200' : 'bg-gray-300'}
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-aeria-navy
          [&::-webkit-slider-thumb]:cursor-pointer
          ${disabled ? '[&::-webkit-slider-thumb]:bg-gray-400' : ''}
        `}
      />
      <span className="text-xs text-gray-500 w-8">3x</span>
    </div>
  )
}

// ============================================
// PITCH CONTROL
// ============================================

function PitchControl({ value, onChange, disabled }) {
  const presets = [0, 30, 45, 60, 75]

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Camera Tilt</span>
        <span className="text-xs font-medium text-gray-700">{Math.round(value)}°</span>
      </div>
      <div className="flex gap-1">
        {presets.map(preset => (
          <button
            key={preset}
            onClick={() => onChange(preset)}
            disabled={disabled}
            className={`
              flex-1 py-1 text-xs rounded transition-colors
              ${Math.abs(value - preset) < 5
                ? 'bg-aeria-navy text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {preset}°
          </button>
        ))}
      </div>
    </div>
  )
}

// ============================================
// BEARING CONTROL
// ============================================

function BearingControl({ value, onChange, disabled }) {
  const directions = [
    { label: 'N', value: 0 },
    { label: 'E', value: 90 },
    { label: 'S', value: 180 },
    { label: 'W', value: 270 }
  ]

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Rotation</span>
        <span className="text-xs font-medium text-gray-700">{Math.round(value)}°</span>
      </div>
      <div className="flex gap-1">
        {directions.map(dir => (
          <button
            key={dir.label}
            onClick={() => onChange(dir.value)}
            disabled={disabled}
            className={`
              flex-1 py-1 text-xs font-medium rounded transition-colors
              ${Math.abs(value - dir.value) < 22.5 || (dir.value === 0 && value > 337.5)
                ? 'bg-aeria-navy text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {dir.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ============================================
// FULL 3D CONTROLS PANEL
// ============================================

/**
 * Full 3D controls panel with all options
 */
export function Map3DControlsPanel({
  view3D,
  onToggle3D,
  onToggleTerrain,
  onSetExaggeration,
  onSetPitch,
  onSetBearing,
  onToggleSky,
  onReset,
  className = ''
}) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Layers3 className="w-4 h-4 text-aeria-navy" />
          <span className="text-sm font-medium text-gray-900">3D View</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-3 space-y-4">
          {/* 3D Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">3D Mode</span>
            </div>
            <button
              onClick={onToggle3D}
              className={`
                relative w-11 h-6 rounded-full transition-colors
                ${view3D.enabled ? 'bg-aeria-navy' : 'bg-gray-300'}
              `}
            >
              <span
                className={`
                  absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform
                  ${view3D.enabled ? 'left-5.5 translate-x-0' : 'left-0.5'}
                `}
                style={{ left: view3D.enabled ? '22px' : '2px' }}
              />
            </button>
          </div>

          {/* Terrain Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mountain className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">Terrain</span>
            </div>
            <button
              onClick={onToggleTerrain}
              disabled={!view3D.enabled}
              className={`
                relative w-11 h-6 rounded-full transition-colors
                ${!view3D.enabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${view3D.terrainEnabled ? 'bg-aeria-navy' : 'bg-gray-300'}
              `}
            >
              <span
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                style={{ left: view3D.terrainEnabled ? '22px' : '2px' }}
              />
            </button>
          </div>

          {/* Terrain Exaggeration */}
          {view3D.enabled && view3D.terrainEnabled && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Terrain Scale</span>
                <span className="text-xs font-medium text-gray-700">
                  {view3D.terrainExaggeration.toFixed(1)}x
                </span>
              </div>
              <TerrainSlider
                value={view3D.terrainExaggeration}
                onChange={onSetExaggeration}
                disabled={!view3D.enabled || !view3D.terrainEnabled}
              />
            </div>
          )}

          {/* Sky Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">Atmosphere</span>
            </div>
            <button
              onClick={onToggleSky}
              disabled={!view3D.enabled}
              className={`
                relative w-11 h-6 rounded-full transition-colors
                ${!view3D.enabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${view3D.skyEnabled ? 'bg-aeria-navy' : 'bg-gray-300'}
              `}
            >
              <span
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                style={{ left: view3D.skyEnabled ? '22px' : '2px' }}
              />
            </button>
          </div>

          {/* Camera Controls (only in 3D mode) */}
          {view3D.enabled && (
            <>
              <div className="pt-2 border-t border-gray-100">
                <PitchControl
                  value={view3D.pitch}
                  onChange={onSetPitch}
                  disabled={!view3D.enabled}
                />
              </div>

              <BearingControl
                value={view3D.bearing}
                onChange={onSetBearing}
                disabled={!view3D.enabled}
              />
            </>
          )}

          {/* Reset Button */}
          {view3D.enabled && (
            <button
              onClick={onReset}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset View
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// COMPACT 3D CONTROLS
// ============================================

/**
 * Compact 3D controls for map overlay
 */
export function Map3DControlsCompact({
  is3DEnabled,
  onToggle3D,
  pitch,
  onSetPitch,
  bearing,
  onSetBearing,
  onReset,
  className = ''
}) {
  const [showOptions, setShowOptions] = useState(false)

  return (
    <div className={`relative ${className}`}>
      {/* Main toggle */}
      <button
        onClick={onToggle3D}
        onContextMenu={(e) => {
          e.preventDefault()
          setShowOptions(!showOptions)
        }}
        className={`
          flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg shadow-md transition-all text-sm
          ${is3DEnabled
            ? 'bg-aeria-navy text-white'
            : 'bg-white text-gray-700 hover:bg-gray-50'
          }
        `}
        title="Click to toggle 3D | Right-click for options"
      >
        <Move3D className="w-4 h-4" />
        <span className="font-medium">{is3DEnabled ? '3D' : '2D'}</span>
      </button>

      {/* Quick options popup */}
      {showOptions && is3DEnabled && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 p-3 space-y-3 z-50">
          <PitchControl value={pitch} onChange={onSetPitch} disabled={false} />
          <BearingControl value={bearing} onChange={onSetBearing} disabled={false} />
          <button
            onClick={() => {
              onReset()
              setShowOptions(false)
            }}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
      )}
    </div>
  )
}

// ============================================
// ALTITUDE INDICATOR
// ============================================

/**
 * Displays current altitude information
 */
export function AltitudeIndicator({
  minAltitude,
  maxAltitude,
  currentAltitude,
  unit = 'm',
  className = ''
}) {
  const range = maxAltitude - minAltitude
  const percentage = range > 0
    ? ((currentAltitude - minAltitude) / range) * 100
    : 50

  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 p-2 ${className}`}>
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-400">{maxAltitude}{unit}</span>
          <div className="relative w-2 h-16 bg-gray-200 rounded-full my-1">
            <div
              className="absolute bottom-0 w-full bg-gradient-to-t from-green-500 to-blue-500 rounded-full transition-all"
              style={{ height: `${percentage}%` }}
            />
            <div
              className="absolute w-3 h-3 -left-0.5 bg-aeria-navy rounded-full border-2 border-white shadow transition-all"
              style={{ bottom: `calc(${percentage}% - 6px)` }}
            />
          </div>
          <span className="text-xs text-gray-400">{minAltitude}{unit}</span>
        </div>
        <div className="pl-2 border-l border-gray-200">
          <p className="text-xs text-gray-500">Altitude</p>
          <p className="text-lg font-bold text-gray-900">{currentAltitude}</p>
          <p className="text-xs text-gray-400">{unit} AGL</p>
        </div>
      </div>
    </div>
  )
}

// ============================================
// EXPORTS
// ============================================

export default Map3DControlsPanel
