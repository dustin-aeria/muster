/**
 * MissionCard.jsx
 * Card component for displaying and selecting individual missions
 *
 * Features:
 * - Display mission name, type, and status
 * - Visual selection indicator
 * - Click to select
 * - Edit and delete actions
 *
 * @location src/components/map/MissionCard.jsx
 */

import React from 'react'
import PropTypes from 'prop-types'
import {
  MapPin,
  Route,
  Grid3X3,
  Circle,
  Hexagon,
  Pencil,
  Trash2,
  CheckCircle2
} from 'lucide-react'
import { MISSION_TYPES } from '../../lib/mapDataStructures'

// Icon map for mission types
const MISSION_TYPE_ICONS = {
  mapping: Grid3X3,
  corridor: Route,
  point: MapPin,
  perimeter: Hexagon,
  freeform: Circle
}

// Color map for mission types
const MISSION_TYPE_COLORS = {
  mapping: 'text-blue-600 bg-blue-50 border-blue-200',
  corridor: 'text-purple-600 bg-purple-50 border-purple-200',
  point: 'text-green-600 bg-green-50 border-green-200',
  perimeter: 'text-amber-600 bg-amber-50 border-amber-200',
  freeform: 'text-gray-600 bg-gray-50 border-gray-200'
}

export default function MissionCard({
  mission,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete
}) {
  if (!mission) return null

  const Icon = MISSION_TYPE_ICONS[mission.type] || Circle
  const typeColors = MISSION_TYPE_COLORS[mission.type] || MISSION_TYPE_COLORS.freeform
  const typeInfo = MISSION_TYPES[mission.type] || { label: 'Unknown' }
  const waypointCount = mission.flightPath?.waypoints?.length || 0

  const handleClick = () => {
    if (onSelect) {
      onSelect(mission.id)
    }
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    if (onEdit) {
      onEdit(mission.id)
    }
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    if (onDelete) {
      if (confirm(`Delete mission "${mission.name}"?`)) {
        onDelete(mission.id)
      }
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`
        relative p-3 rounded-lg border cursor-pointer transition-all
        ${isSelected
          ? 'bg-aeria-navy/5 border-aeria-navy ring-2 ring-aeria-navy/20'
          : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }
      `}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <CheckCircle2 className="w-4 h-4 text-aeria-navy" />
        </div>
      )}

      {/* Mission type badge and name */}
      <div className="flex items-start gap-2 mb-2">
        <div className={`p-1.5 rounded ${typeColors}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium truncate ${isSelected ? 'text-aeria-navy' : 'text-gray-900'}`}>
            {mission.name}
          </h4>
          <p className="text-xs text-gray-500">{typeInfo.label}</p>
        </div>
      </div>

      {/* Mission stats */}
      <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
        <span>{waypointCount} waypoints</span>
        <span>{mission.altitude}m AGL</span>
        {mission.flightPath?.corridorBuffer && (
          <span>{mission.flightPath.corridorBuffer}m buffer</span>
        )}
      </div>

      {/* Status */}
      <div className="flex items-center justify-between">
        <span className={`
          px-2 py-0.5 text-xs font-medium rounded-full
          ${mission.status === 'ready' ? 'bg-green-100 text-green-700' :
            mission.status === 'completed' ? 'bg-blue-100 text-blue-700' :
            'bg-gray-100 text-gray-600'}
        `}>
          {mission.status === 'ready' ? 'Ready' :
           mission.status === 'completed' ? 'Completed' : 'Draft'}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={handleEdit}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
              title="Edit mission"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="p-1 text-gray-400 hover:text-red-500 rounded"
              title="Delete mission"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

MissionCard.propTypes = {
  mission: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    altitude: PropTypes.number,
    status: PropTypes.string,
    flightPath: PropTypes.shape({
      waypoints: PropTypes.array,
      corridorBuffer: PropTypes.number
    })
  }),
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func
}
