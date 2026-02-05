/**
 * ActivityTimeline.jsx
 * Displays the activity log/audit trail for a safety declaration
 *
 * @location src/components/safetyDeclaration/ActivityTimeline.jsx
 */

import { useState, useEffect } from 'react'
import {
  Plus,
  Edit,
  RefreshCw,
  CheckSquare,
  CheckCircle,
  Play,
  XCircle,
  Upload,
  Trash2,
  Link,
  MessageSquare,
  Clock,
  ChevronDown,
  ChevronUp,
  User
} from 'lucide-react'
import {
  subscribeToActivityLog,
  ACTIVITY_TYPES
} from '../../lib/firestoreSafetyDeclaration'

// Map icon names to components
const ICON_MAP = {
  Plus,
  Edit,
  RefreshCw,
  CheckSquare,
  CheckCircle,
  Play,
  XCircle,
  Upload,
  Trash: Trash2,
  Link,
  MessageSquare
}

// Color classes for different activity types
const COLOR_CLASSES = {
  green: 'bg-green-100 text-green-600',
  blue: 'bg-blue-100 text-blue-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  red: 'bg-red-100 text-red-600',
  gray: 'bg-gray-100 text-gray-600'
}

export default function ActivityTimeline({
  declarationId,
  limit = 20,
  compact = false
}) {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(!compact)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    if (!declarationId) return

    const unsubscribe = subscribeToActivityLog(declarationId, (data) => {
      setActivities(data)
      setLoading(false)
    }, limit)

    return () => unsubscribe()
  }, [declarationId, limit])

  const formatTimeAgo = (date) => {
    if (!date) return ''

    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-CA', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const getActivityIcon = (type) => {
    const typeInfo = ACTIVITY_TYPES[type]
    if (!typeInfo) return Clock

    return ICON_MAP[typeInfo.icon] || Clock
  }

  const getActivityColor = (type) => {
    const typeInfo = ACTIVITY_TYPES[type]
    return COLOR_CLASSES[typeInfo?.color] || COLOR_CLASSES.gray
  }

  const displayActivities = showAll ? activities : activities.slice(0, compact ? 5 : 10)

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No activity recorded yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with toggle */}
      {compact && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="text-sm font-medium text-gray-700">Recent Activity</h3>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
      )}

      {/* Timeline */}
      {expanded && (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

          {/* Activity items */}
          <div className="space-y-4">
            {displayActivities.map((activity, index) => {
              const Icon = getActivityIcon(activity.type)
              const colorClass = getActivityColor(activity.type)
              const typeInfo = ACTIVITY_TYPES[activity.type] || { label: activity.type }

              return (
                <div key={activity.id} className="relative flex gap-4">
                  {/* Icon */}
                  <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {typeInfo.label}
                        </p>
                        {activity.description && (
                          <p className="text-sm text-gray-600 mt-0.5">
                            {activity.description}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formatTimeAgo(activity.createdAt)}
                      </span>
                    </div>

                    {/* Details (if present) */}
                    {activity.details && Object.keys(activity.details).length > 0 && (
                      <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded p-2">
                        {Object.entries(activity.details).map(([key, value]) => (
                          <div key={key} className="flex gap-2">
                            <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                            <span>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* User info */}
                    {activity.userName && activity.userName !== 'System' && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                        <User className="w-3 h-3" />
                        {activity.userName}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Show more/less */}
          {activities.length > (compact ? 5 : 10) && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {showAll ? 'Show less' : `Show ${activities.length - (compact ? 5 : 10)} more`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Compact version for sidebar or overview sections
export function ActivityTimelineCompact({ declarationId }) {
  return <ActivityTimeline declarationId={declarationId} limit={10} compact />
}
