/**
 * SmartPopulate.jsx
 * Smart auto-population features for compliance requirements
 *
 * Features:
 * - Auto-populate from linked project data
 * - Gap analysis panel
 * - Suggested content based on requirement type
 *
 * @location src/components/compliance/SmartPopulate.jsx
 */

import React, { useState, useEffect, useMemo } from 'react'
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  FileText,
  Loader2,
  X,
  Check,
  ArrowRight,
  Lightbulb,
  Database,
  Plane
} from 'lucide-react'
import { getProject } from '../../lib/firestore'

// ============================================
// AUTO-POPULATE MAPPING
// ============================================

/**
 * Maps requirement autoPopulateFrom paths to project data
 * Returns the value at the specified path or null if not found
 */
function getValueFromPath(obj, path) {
  if (!obj || !path) return null

  const parts = path.split('.')
  let current = obj

  for (const part of parts) {
    if (current === null || current === undefined) return null
    current = current[part]
  }

  return current
}

/**
 * Format a value for display in a requirement response
 */
function formatValue(value, path) {
  if (value === null || value === undefined) return null

  // Handle arrays
  if (Array.isArray(value)) {
    if (value.length === 0) return null

    // Aircraft array
    if (path.includes('aircraft')) {
      return value.map(a => {
        const parts = []
        if (a.nickname) parts.push(a.nickname)
        if (a.make && a.model) parts.push(`${a.make} ${a.model}`)
        if (a.registration) parts.push(`(${a.registration})`)
        return parts.join(' ')
      }).join('\n')
    }

    // Contingencies array
    if (path.includes('contingencies')) {
      return value.map(c => `${c.trigger}: ${c.action}`).join('\n\n')
    }

    // Crew array
    if (path.includes('crew')) {
      return value.map(c => {
        const parts = [c.name || 'Unknown']
        if (c.role) parts.push(`(${c.role})`)
        if (c.certNumber) parts.push(`- Cert #${c.certNumber}`)
        return parts.join(' ')
      }).join('\n')
    }

    return value.join(', ')
  }

  // Handle objects
  if (typeof value === 'object') {
    // Weather minimums
    if (path.includes('weatherMinimums')) {
      const parts = []
      if (value.minVisibility) parts.push(`Visibility: ${value.minVisibility} SM`)
      if (value.minCeiling) parts.push(`Ceiling: ${value.minCeiling} ft AGL`)
      if (value.maxWind) parts.push(`Max Wind: ${value.maxWind} m/s`)
      if (value.maxGust) parts.push(`Max Gust: ${value.maxGust} m/s`)
      if (value.notes) parts.push(`Notes: ${value.notes}`)
      return parts.join('\n')
    }

    // Location
    if (path.includes('location')) {
      const parts = []
      if (value.name) parts.push(value.name)
      if (value.address) parts.push(value.address)
      if (value.coordinates) {
        parts.push(`Coordinates: ${value.coordinates.lat}, ${value.coordinates.lng}`)
      }
      return parts.join('\n')
    }

    // SORA
    if (path.includes('sora')) {
      return JSON.stringify(value, null, 2)
    }

    return JSON.stringify(value)
  }

  // Handle primitives
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  return String(value)
}

/**
 * Get auto-populate suggestions for a requirement
 */
export function getAutoPopulateSuggestions(requirement, project) {
  if (!requirement.autoPopulateFrom || !project) return []

  const suggestions = []

  for (const path of requirement.autoPopulateFrom) {
    const value = getValueFromPath(project, path)
    const formattedValue = formatValue(value, path)

    if (formattedValue) {
      suggestions.push({
        path,
        value: formattedValue,
        label: getPathLabel(path)
      })
    }
  }

  return suggestions
}

/**
 * Get human-readable label for a data path
 */
function getPathLabel(path) {
  const labels = {
    'project.overview.description': 'Project Description',
    'project.sora.conops': 'SORA CONOPS',
    'project.sora.sailLevel': 'SAIL Level',
    'project.sora.grc': 'Ground Risk Class',
    'project.sora.arc': 'Air Risk Class',
    'project.sora.osos': 'OSO Compliance',
    'project.sora.containment': 'Containment Strategy',
    'project.flightPlan.summary': 'Flight Plan Summary',
    'project.flightPlan.aircraft': 'Aircraft List',
    'project.flightPlan.maxAltitudeAGL': 'Max Altitude',
    'project.flightPlan.operationType': 'Operation Type',
    'project.flightPlan.contingencies': 'Contingency Procedures',
    'project.flightPlan.weatherMinimums': 'Weather Minimums',
    'project.siteSurvey.location': 'Site Location',
    'project.siteSurvey.airspace': 'Airspace Info',
    'project.emergencyPlan': 'Emergency Plan',
    'project.communications': 'Communications Plan',
    'project.crew': 'Crew Members',
    'project.mapData.operationalArea': 'Operational Area'
  }

  return labels[path] || path.split('.').pop()
}

// ============================================
// GAP ANALYSIS
// ============================================

/**
 * Run gap analysis on an application
 */
export function analyzeGaps(template, responses) {
  const gaps = {
    missingRequired: [],
    incompleteResponses: [],
    missingDocuments: [],
    flagged: [],
    suggestions: []
  }

  if (!template?.requirements) return gaps

  for (const req of template.requirements) {
    const response = responses[req.id]

    // Check required but empty
    if (req.required && (!response || response.status === 'empty')) {
      gaps.missingRequired.push({
        requirementId: req.id,
        shortText: req.shortText || req.text.substring(0, 60),
        regulatoryRef: req.regulatoryRef
      })
    }

    // Check partial responses
    if (response?.status === 'partial') {
      gaps.incompleteResponses.push({
        requirementId: req.id,
        shortText: req.shortText || req.text.substring(0, 60),
        regulatoryRef: req.regulatoryRef
      })
    }

    // Check document-reference requirements without documents
    if (req.responseType === 'document-reference') {
      if (!response?.documentRefs || response.documentRefs.length === 0) {
        gaps.missingDocuments.push({
          requirementId: req.id,
          shortText: req.shortText || req.text.substring(0, 60),
          regulatoryRef: req.regulatoryRef,
          suggestedPolicies: req.suggestedPolicies,
          suggestedDocTypes: req.suggestedDocTypes
        })
      }
    }

    // Check flagged items
    if (response?.flagged) {
      gaps.flagged.push({
        requirementId: req.id,
        shortText: req.shortText || req.text.substring(0, 60),
        regulatoryRef: req.regulatoryRef,
        flagReason: response.flagReason
      })
    }

    // Check minimum response length
    if (req.minResponseLength && response?.response) {
      if (response.response.length < req.minResponseLength) {
        gaps.suggestions.push({
          requirementId: req.id,
          shortText: req.shortText || req.text.substring(0, 60),
          type: 'min-length',
          message: `Response should be at least ${req.minResponseLength} characters`
        })
      }
    }
  }

  return gaps
}

// ============================================
// UI COMPONENTS
// ============================================

export function AutoPopulateButton({ requirement, project, onPopulate }) {
  const [loading, setLoading] = useState(false)
  const suggestions = useMemo(
    () => getAutoPopulateSuggestions(requirement, project),
    [requirement, project]
  )

  if (suggestions.length === 0) return null

  const handlePopulate = async () => {
    setLoading(true)
    try {
      // Combine all suggestions into one response
      const combined = suggestions.map(s => `[${s.label}]\n${s.value}`).join('\n\n')
      await onPopulate(combined)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePopulate}
      disabled={loading}
      className="text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
      title={`Auto-fill from: ${suggestions.map(s => s.label).join(', ')}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Database className="w-4 h-4" />
      )}
      Auto-fill from Project
    </button>
  )
}

export function GapAnalysisPanel({ template, responses, onNavigateToRequirement }) {
  const gaps = useMemo(() => analyzeGaps(template, responses), [template, responses])

  const totalGaps =
    gaps.missingRequired.length +
    gaps.incompleteResponses.length +
    gaps.missingDocuments.length +
    gaps.flagged.length

  if (totalGaps === 0) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span className="font-medium text-green-800">No gaps detected</span>
        </div>
        <p className="text-sm text-green-600 mt-1">
          All requirements have been addressed
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Missing Required */}
      {gaps.missingRequired.length > 0 && (
        <GapSection
          title="Missing Required Responses"
          icon={AlertTriangle}
          color="red"
          items={gaps.missingRequired}
          onNavigate={onNavigateToRequirement}
        />
      )}

      {/* Missing Documents */}
      {gaps.missingDocuments.length > 0 && (
        <GapSection
          title="Missing Document References"
          icon={FileText}
          color="amber"
          items={gaps.missingDocuments}
          onNavigate={onNavigateToRequirement}
        />
      )}

      {/* Incomplete */}
      {gaps.incompleteResponses.length > 0 && (
        <GapSection
          title="Incomplete Responses"
          icon={AlertTriangle}
          color="amber"
          items={gaps.incompleteResponses}
          onNavigate={onNavigateToRequirement}
        />
      )}

      {/* Flagged */}
      {gaps.flagged.length > 0 && (
        <GapSection
          title="Flagged for Review"
          icon={AlertTriangle}
          color="purple"
          items={gaps.flagged}
          onNavigate={onNavigateToRequirement}
        />
      )}
    </div>
  )
}

function GapSection({ title, icon: Icon, color, items, onNavigate }) {
  const [expanded, setExpanded] = useState(true)

  const colorClasses = {
    red: 'bg-red-50 border-red-200 text-red-800',
    amber: 'bg-amber-50 border-amber-200 text-amber-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800'
  }

  const iconColorClasses = {
    red: 'text-red-600',
    amber: 'text-amber-600',
    purple: 'text-purple-600'
  }

  return (
    <div className={`border rounded-lg overflow-hidden ${colorClasses[color]}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3"
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${iconColorClasses[color]}`} />
          <span className="font-medium">{title}</span>
          <span className="text-sm opacity-75">({items.length})</span>
        </div>
        <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {expanded && (
        <div className="border-t border-current/10 divide-y divide-current/10">
          {items.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate(item.requirementId)}
              className="w-full flex items-center justify-between p-3 hover:bg-white/50 text-left"
            >
              <div>
                {item.regulatoryRef && (
                  <span className="text-xs font-medium opacity-75 mr-2">{item.regulatoryRef}</span>
                )}
                <span className="text-sm">{item.shortText}</span>
              </div>
              <ArrowRight className="w-4 h-4 opacity-50" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function ProjectLinkBanner({ projectId, projectName, onLinkProject, onUnlinkProject }) {
  if (projectId) {
    return (
      <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2">
          <Plane className="w-5 h-5 text-blue-600" />
          <span className="text-sm text-blue-800">
            Linked to project: <strong>{projectName}</strong>
          </span>
        </div>
        <button
          onClick={onUnlinkProject}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Unlink
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-amber-500" />
        <span className="text-sm text-gray-600">
          Link a project to enable auto-population of responses
        </span>
      </div>
      <button
        onClick={onLinkProject}
        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
      >
        <Plane className="w-4 h-4" />
        Link Project
      </button>
    </div>
  )
}

export default {
  getAutoPopulateSuggestions,
  analyzeGaps,
  AutoPopulateButton,
  GapAnalysisPanel,
  ProjectLinkBanner
}
