/**
 * ActivityList.jsx
 * Timeline view of activities with filtering
 *
 * @location src/components/activities/ActivityList.jsx
 */

import { useState, useMemo, useEffect } from 'react'
import {
  Timer,
  Play,
  Pause,
  Square,
  Clock,
  Search,
  Filter,
  Edit2,
  Trash2,
  MoreVertical,
  Tag,
  FileText,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import {
  formatDuration,
  formatTimerDisplay,
  calculateElapsedSeconds,
  pauseActivity,
  resumeActivity,
  completeActivity,
  deleteActivity,
  ACTIVITY_STATUS,
  ACTIVITY_CATEGORIES
} from '../../lib/firestoreActivities'
import { logger } from '../../lib/logger'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

/**
 * Format timestamp for display
 */
function formatTimestamp(timestamp) {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

/**
 * Activity List Item with inline timer
 */
function ActivityListItem({
  activity,
  onEdit,
  onDelete,
  onRefresh
}) {
  const [expanded, setExpanded] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [elapsed, setElapsed] = useState(calculateElapsedSeconds(activity))

  const categoryInfo = ACTIVITY_CATEGORIES[activity.category] || ACTIVITY_CATEGORIES.other
  const statusInfo = ACTIVITY_STATUS[activity.status] || ACTIVITY_STATUS.active

  // Update elapsed time every second for active activities
  useEffect(() => {
    if (activity.status === 'active') {
      const interval = setInterval(() => {
        setElapsed(calculateElapsedSeconds(activity))
      }, 1000)
      return () => clearInterval(interval)
    } else {
      setElapsed(activity.totalSeconds || calculateElapsedSeconds(activity))
    }
  }, [activity])

  const handlePause = async () => {
    try {
      setActionLoading(true)
      await pauseActivity(activity.id)
      onRefresh?.()
    } catch (err) {
      logger.error('Failed to pause activity:', err)
      alert(err.message || 'Failed to pause activity')
    } finally {
      setActionLoading(false)
    }
  }

  const handleResume = async () => {
    try {
      setActionLoading(true)
      await resumeActivity(activity.id)
      onRefresh?.()
    } catch (err) {
      logger.error('Failed to resume activity:', err)
      alert(err.message || 'Failed to resume activity')
    } finally {
      setActionLoading(false)
    }
  }

  const handleStop = async () => {
    try {
      setActionLoading(true)
      await completeActivity(activity.id)
      onRefresh?.()
    } catch (err) {
      logger.error('Failed to stop activity:', err)
      alert(err.message || 'Failed to stop activity')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this activity?')) return

    try {
      setActionLoading(true)
      await deleteActivity(activity.id)
      onRefresh?.()
    } catch (err) {
      logger.error('Failed to delete activity:', err)
      alert(err.message || 'Failed to delete activity')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className={`border rounded-lg overflow-hidden ${
      activity.status === 'active' ? 'border-green-300 bg-green-50/50' :
      activity.status === 'paused' ? 'border-yellow-300 bg-yellow-50/50' : ''
    }`}>
      {/* Main Row */}
      <div className="flex items-center gap-4 p-4">
        {/* Status indicator */}
        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
          activity.status === 'active' ? 'bg-green-500 animate-pulse' :
          activity.status === 'paused' ? 'bg-yellow-500' : 'bg-blue-500'
        }`} />

        {/* Activity Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900 truncate">{activity.name}</h4>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryInfo.color}`}>
              {categoryInfo.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
            <span>{activity.operatorName}</span>
            <span>{formatTimestamp(activity.startTime)}</span>
          </div>
        </div>

        {/* Timer Display */}
        <div className={`text-right ${
          activity.status === 'active' ? 'text-green-700' :
          activity.status === 'paused' ? 'text-yellow-700' : 'text-gray-700'
        }`}>
          <div className="text-xl font-mono tabular-nums">
            {formatTimerDisplay(elapsed)}
          </div>
          <div className={`text-xs font-medium ${statusInfo.color} px-2 py-0.5 rounded-full inline-block mt-1`}>
            {statusInfo.label}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          {activity.status === 'active' && (
            <>
              <button
                onClick={handlePause}
                disabled={actionLoading}
                className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors"
                title="Pause"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pause className="w-4 h-4" />}
              </button>
              <button
                onClick={handleStop}
                disabled={actionLoading}
                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                title="Stop"
              >
                <Square className="w-4 h-4" />
              </button>
            </>
          )}
          {activity.status === 'paused' && (
            <>
              <button
                onClick={handleResume}
                disabled={actionLoading}
                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                title="Resume"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={handleStop}
                disabled={actionLoading}
                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                title="Stop"
              >
                <Square className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Expand/Collapse */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border z-20">
                  <button
                    onClick={() => { onEdit?.(activity); setShowMenu(false) }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => { handleDelete(); setShowMenu(false) }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t bg-white">
          <div className="grid grid-cols-2 gap-4 pt-4">
            {/* Methods Used */}
            {activity.methodsUsed?.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Methods Used</h5>
                <div className="flex flex-wrap gap-1">
                  {activity.methodsUsed.map(method => (
                    <span
                      key={method}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                    >
                      {method}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {activity.notes && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Notes</h5>
                <p className="text-sm text-gray-600">{activity.notes}</p>
              </div>
            )}

            {/* Information Gathered */}
            {activity.informationGathered && (
              <div className="col-span-2">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Information Gathered</h5>
                <p className="text-sm text-gray-600">{activity.informationGathered}</p>
              </div>
            )}

            {/* Report Inclusion */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Report</h5>
              <span className={`text-sm ${activity.includeInReport ? 'text-green-600' : 'text-gray-500'}`}>
                {activity.includeInReport ? `Include in ${activity.reportSection}` : 'Not included'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Activity List Component
 */
export default function ActivityList({
  activities,
  onEdit,
  onRefresh,
  showFilters = true
}) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase()
        const matchesSearch =
          activity.name?.toLowerCase().includes(searchLower) ||
          activity.operatorName?.toLowerCase().includes(searchLower) ||
          activity.notes?.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Status filter
      if (statusFilter !== 'all' && activity.status !== statusFilter) {
        return false
      }

      // Category filter
      if (categoryFilter !== 'all' && activity.category !== categoryFilter) {
        return false
      }

      return true
    })
  }, [activities, search, statusFilter, categoryFilter])

  // Group by date
  const groupedActivities = useMemo(() => {
    const groups = {}

    filteredActivities.forEach(activity => {
      const startTime = activity.startTime?.toDate?.() || new Date(activity.startTime)
      const dateKey = startTime.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      })

      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(activity)
    })

    return groups
  }, [filteredActivities])

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <Timer className="w-12 h-12 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No activities yet</h3>
        <p className="text-gray-500">Start tracking activities to see them here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search activities..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="all">All Status</option>
            {Object.entries(ACTIVITY_STATUS).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="all">All Categories</option>
            {Object.entries(ACTIVITY_CATEGORIES).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-gray-500">
        {filteredActivities.length} activit{filteredActivities.length === 1 ? 'y' : 'ies'}
        {filteredActivities.length !== activities.length && ` (filtered from ${activities.length})`}
      </div>

      {/* Activity Groups by Date */}
      {Object.entries(groupedActivities).map(([date, dateActivities]) => (
        <div key={date} className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500 sticky top-0 bg-white py-2">
            {date}
          </h3>
          <div className="space-y-2">
            {dateActivities.map(activity => (
              <ActivityListItem
                key={activity.id}
                activity={activity}
                onEdit={onEdit}
                onRefresh={onRefresh}
              />
            ))}
          </div>
        </div>
      ))}

      {filteredActivities.length === 0 && activities.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          No activities match your filters
        </div>
      )}
    </div>
  )
}
