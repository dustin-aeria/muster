/**
 * ControlMeasuresEditor.jsx
 * Editor for FHA control measures using Hierarchy of Controls
 *
 * @location src/components/fha/ControlMeasuresEditor.jsx
 */

import { useState } from 'react'
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Shield,
  RefreshCw,
  Wrench,
  FileText,
  HardHat,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { CONTROL_TYPES } from '../../lib/firestoreFHA'

// Icons for each control type
const controlTypeIcons = {
  elimination: Shield,
  substitution: RefreshCw,
  engineering: Wrench,
  administrative: FileText,
  ppe: HardHat
}

// Colors for each control type (effectiveness gradient - most effective = green)
const controlTypeColors = {
  elimination: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100' },
  substitution: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100' },
  engineering: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100' },
  administrative: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100' },
  ppe: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100' }
}

/**
 * Single control measure item
 */
function ControlMeasureItem({ control, index, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const colors = controlTypeColors[control.type] || controlTypeColors.administrative
  const Icon = controlTypeIcons[control.type] || FileText

  return (
    <div className={`border rounded-lg ${colors.border} ${colors.bg}`}>
      <div className="flex items-center gap-3 p-3">
        <button
          type="button"
          className="cursor-grab text-gray-400 hover:text-gray-600"
          title="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div className={`p-1.5 rounded ${colors.badge}`}>
          <Icon className={`w-4 h-4 ${colors.text}`} />
        </div>

        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={control.description}
            onChange={(e) => onUpdate(index, { ...control, description: e.target.value })}
            placeholder="Describe the control measure..."
            className="w-full bg-transparent border-none p-0 text-sm font-medium text-gray-900 focus:outline-none focus:ring-0"
          />
        </div>

        <div className="flex items-center gap-2">
          {control.implemented && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">
              <CheckCircle className="w-3 h-3" />
              Implemented
            </span>
          )}

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 hover:bg-white/50 rounded"
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onDelete(index)}
            className="p-1.5 hover:bg-red-100 rounded text-gray-400 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-gray-200/50 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Control Type</label>
              <select
                value={control.type}
                onChange={(e) => onUpdate(index, { ...control, type: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CONTROL_TYPES.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select
                value={control.implemented ? 'implemented' : 'planned'}
                onChange={(e) => onUpdate(index, { ...control, implemented: e.target.value === 'implemented' })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="planned">Planned</option>
                <option value="implemented">Implemented</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
            <textarea
              value={control.notes || ''}
              onChange={(e) => onUpdate(index, { ...control, notes: e.target.value })}
              placeholder="Additional notes about this control measure..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Responsible Party</label>
            <input
              type="text"
              value={control.responsibleParty || ''}
              onChange={(e) => onUpdate(index, { ...control, responsibleParty: e.target.value })}
              placeholder="Who is responsible for implementing this control?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Add control button for each type
 */
function AddControlButton({ type, onClick }) {
  const colors = controlTypeColors[type.id] || controlTypeColors.administrative
  const Icon = controlTypeIcons[type.id] || FileText

  return (
    <button
      type="button"
      onClick={() => onClick(type.id)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${colors.border} ${colors.bg} hover:shadow-sm transition-all text-sm`}
    >
      <Icon className={`w-4 h-4 ${colors.text}`} />
      <span className={colors.text}>{type.name}</span>
    </button>
  )
}

/**
 * Main Control Measures Editor
 */
export default function ControlMeasuresEditor({
  controlMeasures = [],
  onChange,
  showHierarchyGuide = true
}) {
  const [showAddMenu, setShowAddMenu] = useState(false)

  const handleAdd = (type) => {
    const newControl = {
      type,
      description: '',
      implemented: false,
      notes: '',
      responsibleParty: ''
    }
    onChange([...controlMeasures, newControl])
    setShowAddMenu(false)
  }

  const handleUpdate = (index, updatedControl) => {
    const updated = [...controlMeasures]
    updated[index] = updatedControl
    onChange(updated)
  }

  const handleDelete = (index) => {
    const updated = controlMeasures.filter((_, i) => i !== index)
    onChange(updated)
  }

  // Group controls by type for summary
  const controlsByType = CONTROL_TYPES.reduce((acc, type) => {
    acc[type.id] = controlMeasures.filter(c => c.type === type.id)
    return acc
  }, {})

  const totalControls = controlMeasures.length
  const implementedControls = controlMeasures.filter(c => c.implemented).length

  return (
    <div className="space-y-4">
      {/* Header with summary */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-gray-900">Control Measures</h4>
          <p className="text-xs text-gray-500 mt-0.5">
            {totalControls} control{totalControls !== 1 ? 's' : ''}
            {totalControls > 0 && ` (${implementedControls} implemented)`}
          </p>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Control
          </button>

          {showAddMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowAddMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-2">
                <div className="text-xs font-medium text-gray-500 px-2 py-1 mb-1">
                  Hierarchy of Controls
                </div>
                {CONTROL_TYPES.map(type => {
                  const Icon = controlTypeIcons[type.id] || FileText
                  const colors = controlTypeColors[type.id]
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => handleAdd(type.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:${colors.bg} transition-colors text-left`}
                    >
                      <div className={`p-1.5 rounded ${colors.badge}`}>
                        <Icon className={`w-4 h-4 ${colors.text}`} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{type.name}</div>
                        <div className="text-xs text-gray-500">{type.description}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Hierarchy of Controls Guide */}
      {showHierarchyGuide && totalControls === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <h5 className="text-sm font-medium text-gray-900">Hierarchy of Controls</h5>
              <p className="text-xs text-gray-600 mt-1">
                Controls should be selected in order of effectiveness. Start with elimination
                (most effective) and work down to PPE (least effective) as needed.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {CONTROL_TYPES.map(type => (
                  <AddControlButton key={type.id} type={type} onClick={handleAdd} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Control Measures List */}
      {totalControls > 0 && (
        <div className="space-y-2">
          {controlMeasures.map((control, index) => (
            <ControlMeasureItem
              key={index}
              control={control}
              index={index}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Control type summary badges */}
      {totalControls > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
          {CONTROL_TYPES.map(type => {
            const count = controlsByType[type.id]?.length || 0
            if (count === 0) return null
            const colors = controlTypeColors[type.id]
            const Icon = controlTypeIcons[type.id]
            return (
              <span
                key={type.id}
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${colors.badge} ${colors.text}`}
              >
                <Icon className="w-3 h-3" />
                {type.name}: {count}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}

/**
 * Compact display of control measures (read-only)
 */
export function ControlMeasuresDisplay({ controlMeasures = [] }) {
  if (controlMeasures.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">No control measures defined</p>
    )
  }

  // Group by type
  const grouped = CONTROL_TYPES.reduce((acc, type) => {
    const controls = controlMeasures.filter(c => c.type === type.id)
    if (controls.length > 0) {
      acc.push({ type, controls })
    }
    return acc
  }, [])

  return (
    <div className="space-y-3">
      {grouped.map(({ type, controls }) => {
        const colors = controlTypeColors[type.id]
        const Icon = controlTypeIcons[type.id]
        return (
          <div key={type.id}>
            <div className={`flex items-center gap-2 ${colors.text} text-sm font-medium mb-1`}>
              <Icon className="w-4 h-4" />
              {type.name}
            </div>
            <ul className="space-y-1 pl-6">
              {controls.map((control, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                  <span>
                    {control.description}
                    {control.implemented && (
                      <span className="ml-2 inline-flex items-center gap-0.5 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        Implemented
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
