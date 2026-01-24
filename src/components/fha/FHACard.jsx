/**
 * FHACard.jsx
 * Card component for displaying FHA summary in list/grid views
 *
 * @location src/components/fha/FHACard.jsx
 */

import {
  AlertTriangle,
  FileText,
  Calendar,
  User,
  ChevronRight,
  Edit,
  Trash2,
  Link2,
  MoreVertical,
  Shield,
  CheckCircle,
  Clock,
  Archive
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { getRiskLevel, FHA_CATEGORIES } from '../../lib/firestoreFHA'

// Risk badge component
function RiskBadge({ score, size = 'md' }) {
  const { level, bgColor, textColor } = getRiskLevel(score)

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  }

  return (
    <span className={`inline-flex items-center font-medium rounded ${bgColor} ${textColor} ${sizeClasses[size]}`}>
      {level} ({score})
    </span>
  )
}

// Status badge component
function StatusBadge({ status }) {
  const statusConfig = {
    active: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Active' },
    under_review: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'Under Review' },
    archived: { bg: 'bg-gray-100', text: 'text-gray-600', icon: Archive, label: 'Archived' }
  }

  const config = statusConfig[status] || statusConfig.active
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  )
}

// Source badge component
function SourceBadge({ source }) {
  const sourceConfig = {
    default: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Default' },
    uploaded: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Uploaded' },
    created: { bg: 'bg-green-50', text: 'text-green-700', label: 'Created' },
    field_triggered: { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Field' }
  }

  const config = sourceConfig[source] || sourceConfig.created

  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  )
}

// Category badge component (simplified - no emojis)
function CategoryBadge({ category }) {
  const categoryData = FHA_CATEGORIES.find(c => c.id === category)

  // Category color mapping
  const colorMap = {
    flight_ops: 'bg-blue-50 text-blue-700 border-blue-200',
    equipment: 'bg-gray-50 text-gray-700 border-gray-200',
    environmental: 'bg-teal-50 text-teal-700 border-teal-200',
    site_hazards: 'bg-amber-50 text-amber-700 border-amber-200',
    emergency: 'bg-red-50 text-red-700 border-red-200',
    personnel: 'bg-purple-50 text-purple-700 border-purple-200',
    specialized: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  }

  const colors = colorMap[category] || 'bg-gray-50 text-gray-700 border-gray-200'

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colors}`}>
      {categoryData?.name || category}
    </span>
  )
}

// Legacy CategoryIcon for backwards compatibility
function CategoryIcon({ category, className = 'w-5 h-5' }) {
  return <CategoryBadge category={category} />
}

export default function FHACard({
  fha,
  onEdit,
  onDelete,
  onView,
  compact = false
}) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const categoryData = FHA_CATEGORIES.find(c => c.id === fha.category)

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Not set'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Check if needs review
  const needsReview = () => {
    if (!fha.reviewDate) return false
    const reviewDate = fha.reviewDate.toDate ? fha.reviewDate.toDate() : new Date(fha.reviewDate)
    return reviewDate <= new Date()
  }

  if (compact) {
    // Compact list view
    return (
      <div
        className="flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
        onClick={() => onView?.(fha)}
      >
        <div className="flex-shrink-0">
          <CategoryIcon category={fha.category} className="text-xl" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-500">{fha.fhaNumber}</span>
            <StatusBadge status={fha.status} />
            <SourceBadge source={fha.source} />
          </div>
          <h3 className="font-medium text-gray-900 truncate">{fha.title}</h3>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-gray-500">Initial Risk</div>
            <RiskBadge score={fha.riskScore} size="sm" />
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Residual</div>
            <RiskBadge score={fha.residualRiskScore} size="sm" />
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    )
  }

  // Full card view
  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all">
      {/* Card Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <CategoryIcon category={fha.category} className="text-2xl" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                  {fha.fhaNumber}
                </span>
                <StatusBadge status={fha.status} />
                {needsReview() && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-red-50 text-red-700">
                    <Clock className="w-3 h-3" />
                    Review Due
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 line-clamp-2">{fha.title}</h3>
              <p className="text-sm text-gray-500 mt-0.5">{categoryData?.name || fha.category}</p>
            </div>
          </div>

          {/* Actions menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(false)
                    onView?.(fha)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  View Details
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(false)
                    onEdit?.(fha)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(false)
                    onDelete?.(fha)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4" onClick={() => onView?.(fha)}>
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {fha.description || 'No description provided'}
        </p>

        {/* Risk Assessment Summary */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Initial Risk</div>
            <RiskBadge score={fha.riskScore} />
            <div className="text-xs text-gray-400 mt-1">
              L:{fha.likelihood} × S:{fha.severity}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Residual Risk</div>
            <RiskBadge score={fha.residualRiskScore} />
            <div className="text-xs text-gray-400 mt-1">
              L:{fha.residualLikelihood} × S:{fha.residualSeverity}
            </div>
          </div>
        </div>

        {/* Control Measures Preview */}
        {fha.controlMeasures && fha.controlMeasures.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-medium text-gray-500 mb-2">
              Controls ({fha.controlMeasures.length})
            </div>
            <div className="flex flex-wrap gap-1">
              {fha.controlMeasures.slice(0, 3).map((control, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 capitalize"
                >
                  {control.type}
                </span>
              ))}
              {fha.controlMeasures.length > 3 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                  +{fha.controlMeasures.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Linked Field Forms */}
        {fha.linkedFieldForms && fha.linkedFieldForms.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Link2 className="w-3 h-3" />
            {fha.linkedFieldForms.length} linked field form{fha.linkedFieldForms.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Review: {formatDate(fha.reviewDate)}
          </div>
          <SourceBadge source={fha.source} />
        </div>
      </div>
    </div>
  )
}

// Export sub-components for reuse
export { RiskBadge, StatusBadge, SourceBadge, CategoryIcon }
