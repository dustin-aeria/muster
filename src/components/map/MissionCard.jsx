/**
 * MissionCard.jsx
 * Card component for displaying and editing individual missions within a site
 *
 * Features:
 * - Mission type selector with visual indicators
 * - Altitude and speed controls
 * - 3D overlay toggle
 * - Add to volume calculation toggle
 * - Expandable settings panel
 * - Mission status indicator
 *
 * @location src/components/map/MissionCard.jsx
 */

import React, { useState } from 'react'
import PropTypes from 'prop-types'
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Copy,
  GripVertical,
  Eye,
  EyeOff,
  Box,
  Target,
  Grid3x3,
  MoveHorizontal,
  Square,
  Route,
  Settings,
  Play,
  Pause,
  CheckCircle2
} from 'lucide-react'
import { MISSION_TYPES } from '../../lib/mapDataStructures'

// Icon mapping for mission types
const MISSION_ICONS = {
  mapping: Grid3x3,
  corridor: MoveHorizontal,
  point: Target,
  perimeter: Square,
  freeform: Route
}

/**
 * Mission type selector dropdown
 */
function MissionTypeSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
      {Object.entries(MISSION_TYPES).map(([key, type]) => {
        const Icon = MISSION_ICONS[key] || Route
        const isSelected = value === key

        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`p-3 rounded-lg border text-left transition-all ${
              isSelected
                ? 'border-2 ring-2 ring-offset-1'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            style={{
              borderColor: isSelected ? type.color : undefined,
              backgroundColor: isSelected ? `${type.color}10` : undefined,
              ringColor: isSelected ? `${type.color}40` : undefined
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon
                className="w-4 h-4"
                style={{ color: isSelected ? type.color : '#6B7280' }}
              />
              <span className={`text-xs font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                {type.label}
              </span>
            </div>
            <p className="text-xs text-gray-500 line-clamp-2">{type.description}</p>
          </button>
        )
      })}
    </div>
  )
}

/**
 * Main MissionCard component
 */
export function MissionCard({
  mission,
  index,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onDelete,
  onDuplicate,
  onGeneratePath,
  maxAltitude = 400,
  hasFlightGeography = false,
  dragHandleProps = {}
}) {
  const missionType = MISSION_TYPES[mission.type] || MISSION_TYPES.mapping
  const Icon = MISSION_ICONS[mission.type] || Route

  const handleFieldChange = (field, value) => {
    onUpdate({ ...mission, [field]: value, updatedAt: new Date().toISOString() })
  }

  const handleSettingsChange = (settingKey, value) => {
    onUpdate({
      ...mission,
      settings: { ...mission.settings, [settingKey]: value },
      updatedAt: new Date().toISOString()
    })
  }

  const handleTypeChange = (newType) => {
    const newMissionType = MISSION_TYPES[newType]
    onUpdate({
      ...mission,
      type: newType,
      settings: { ...newMissionType.defaultSettings, ...mission.settings },
      altitude: newMissionType.defaultSettings.altitude,
      speed: newMissionType.defaultSettings.speed,
      updatedAt: new Date().toISOString()
    })
  }

  const statusColors = {
    draft: 'bg-gray-100 text-gray-600',
    planned: 'bg-blue-100 text-blue-700',
    complete: 'bg-green-100 text-green-700'
  }

  const waypointCount = mission.flightPath?.waypoints?.length || 0

  return (
    <div
      className={`border rounded-lg overflow-hidden transition-all ${
        isExpanded ? 'border-gray-300 shadow-sm' : 'border-gray-200'
      }`}
      style={{ borderLeftColor: missionType.color, borderLeftWidth: '4px' }}
    >
      {/* Header - Always visible */}
      <div className="bg-gray-50 px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Drag handle */}
          <div
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
          >
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Mission number and icon */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: missionType.color }}
          >
            {index + 1}
          </div>

          {/* Mission name (editable) */}
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={mission.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className="font-medium text-gray-900 bg-transparent border-none p-0 focus:ring-0 w-full truncate"
              placeholder="Mission name..."
            />
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Icon className="w-3 h-3" />
              <span>{missionType.label}</span>
              <span className="text-gray-300">|</span>
              <span>{mission.altitude}m AGL</span>
              {waypointCount > 0 && (
                <>
                  <span className="text-gray-300">|</span>
                  <span>{waypointCount} waypoints</span>
                </>
              )}
            </div>
          </div>

          {/* Quick toggles */}
          <div className="flex items-center gap-2">
            {/* 3D Overlay toggle */}
            <button
              type="button"
              onClick={() => handleFieldChange('show3DOverlay', !mission.show3DOverlay)}
              className={`p-1.5 rounded transition-colors ${
                mission.show3DOverlay
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
              title={mission.show3DOverlay ? '3D overlay visible' : '3D overlay hidden'}
            >
              {mission.show3DOverlay ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>

            {/* Add to volume toggle */}
            <button
              type="button"
              onClick={() => handleFieldChange('addToVolume', !mission.addToVolume)}
              className={`p-1.5 rounded transition-colors ${
                mission.addToVolume
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
              title={mission.addToVolume ? 'Included in volume calculation' : 'Excluded from volume calculation'}
            >
              <Box className="w-4 h-4" />
            </button>

            {/* Status badge */}
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[mission.status]}`}>
              {mission.status}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onDuplicate?.(mission)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded"
              title="Duplicate mission"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(mission.id)}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
              title="Delete mission"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onToggleExpand?.(mission.id)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="p-4 space-y-4 bg-white">
          {/* Mission Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mission Type</label>
            <MissionTypeSelector value={mission.type} onChange={handleTypeChange} />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={mission.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Describe the purpose and scope of this mission..."
              rows={2}
              className="input text-sm"
            />
          </div>

          {/* Flight Parameters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Altitude</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="10"
                  max={maxAltitude}
                  step="10"
                  value={mission.altitude}
                  onChange={(e) => handleFieldChange('altitude', Number(e.target.value))}
                  className="input w-20 text-sm"
                />
                <span className="text-sm text-gray-500">m AGL</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Speed</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="30"
                  step="1"
                  value={mission.speed}
                  onChange={(e) => handleFieldChange('speed', Number(e.target.value))}
                  className="input w-20 text-sm"
                />
                <span className="text-sm text-gray-500">m/s</span>
              </div>
            </div>

            {/* Pattern-specific settings */}
            {mission.type === 'mapping' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Overlap</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="20"
                      max="90"
                      step="5"
                      value={mission.settings?.overlap || 70}
                      onChange={(e) => handleSettingsChange('overlap', Number(e.target.value))}
                      className="input w-20 text-sm"
                    />
                    <span className="text-sm text-gray-500">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sidelap</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="20"
                      max="90"
                      step="5"
                      value={mission.settings?.sidelap || 60}
                      onChange={(e) => handleSettingsChange('sidelap', Number(e.target.value))}
                      className="input w-20 text-sm"
                    />
                    <span className="text-sm text-gray-500">%</span>
                  </div>
                </div>
              </>
            )}

            {mission.type === 'corridor' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="10"
                    max="200"
                    step="10"
                    value={mission.settings?.width || 30}
                    onChange={(e) => handleSettingsChange('width', Number(e.target.value))}
                    className="input w-20 text-sm"
                  />
                  <span className="text-sm text-gray-500">m</span>
                </div>
              </div>
            )}

            {mission.type === 'point' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Radius</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="5"
                    max="100"
                    step="5"
                    value={mission.settings?.radius || 30}
                    onChange={(e) => handleSettingsChange('radius', Number(e.target.value))}
                    className="input w-20 text-sm"
                  />
                  <span className="text-sm text-gray-500">m</span>
                </div>
              </div>
            )}

            {mission.type === 'perimeter' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Offset</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="5"
                    value={mission.settings?.offset || 10}
                    onChange={(e) => handleSettingsChange('offset', Number(e.target.value))}
                    className="input w-20 text-sm"
                  />
                  <span className="text-sm text-gray-500">m</span>
                </div>
              </div>
            )}
          </div>

          {/* Volume and Visibility Options */}
          <div className="flex flex-wrap gap-4 py-3 border-t border-gray-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={mission.show3DOverlay}
                onChange={(e) => handleFieldChange('show3DOverlay', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <Eye className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700">Show 3D overlay on map</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={mission.addToVolume}
                onChange={(e) => handleFieldChange('addToVolume', e.target.checked)}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <Box className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700">Include in volume calculation</span>
            </label>
          </div>

          {/* Generate Path Button */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              {waypointCount > 0 ? (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  {waypointCount} waypoints generated
                </span>
              ) : (
                <span>No flight path generated</span>
              )}
            </div>

            <button
              type="button"
              onClick={() => onGeneratePath?.(mission)}
              disabled={!hasFlightGeography && mission.type !== 'freeform'}
              className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4" />
              {waypointCount > 0 ? 'Regenerate Path' : 'Generate Path'}
            </button>
          </div>

          {!hasFlightGeography && mission.type !== 'freeform' && (
            <p className="text-xs text-amber-600 mt-2">
              Draw a flight geography on the map first to generate a flight path for this mission.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

MissionCard.propTypes = {
  mission: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    description: PropTypes.string,
    altitude: PropTypes.number.isRequired,
    speed: PropTypes.number.isRequired,
    settings: PropTypes.object,
    flightPath: PropTypes.object,
    show3DOverlay: PropTypes.bool,
    addToVolume: PropTypes.bool,
    status: PropTypes.oneOf(['draft', 'planned', 'complete'])
  }).isRequired,
  index: PropTypes.number.isRequired,
  isExpanded: PropTypes.bool,
  onToggleExpand: PropTypes.func,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  onDuplicate: PropTypes.func,
  onGeneratePath: PropTypes.func,
  maxAltitude: PropTypes.number,
  hasFlightGeography: PropTypes.bool,
  dragHandleProps: PropTypes.object
}

export default MissionCard
