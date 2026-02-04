/**
 * ActiveTimerWidget.jsx
 * Floating widget showing active activity timers
 * Displays in the bottom-left corner of the screen
 *
 * @location src/components/activities/ActiveTimerWidget.jsx
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Timer,
  Play,
  Pause,
  Square,
  ChevronUp,
  ChevronDown,
  X,
  Loader2
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useOrganizationContext } from '../../contexts/OrganizationContext'
import {
  formatTimerDisplay,
  calculateElapsedSeconds,
  getActiveActivities,
  pauseActivity,
  resumeActivity,
  completeActivity,
  ACTIVITY_CATEGORIES
} from '../../lib/firestoreActivities'
import { logger } from '../../lib/logger'

/**
 * Single timer item in the widget
 */
function TimerItem({ activity, onRefresh }) {
  const [elapsed, setElapsed] = useState(calculateElapsedSeconds(activity))
  const [loading, setLoading] = useState(false)

  const categoryInfo = ACTIVITY_CATEGORIES[activity.category] || ACTIVITY_CATEGORIES.other

  // Update elapsed time every second for active activities
  useEffect(() => {
    if (activity.status === 'active') {
      const interval = setInterval(() => {
        setElapsed(calculateElapsedSeconds(activity))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [activity])

  const handlePause = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      setLoading(true)
      await pauseActivity(activity.id)
      onRefresh?.()
    } catch (err) {
      logger.error('Failed to pause activity:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleResume = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      setLoading(true)
      await resumeActivity(activity.id)
      onRefresh?.()
    } catch (err) {
      logger.error('Failed to resume activity:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      setLoading(true)
      await completeActivity(activity.id)
      onRefresh?.()
    } catch (err) {
      logger.error('Failed to stop activity:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Link
      to={`/projects/${activity.projectId}`}
      className="block px-3 py-2 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
              activity.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
            }`} />
            <span className="text-sm font-medium text-gray-900 truncate">
              {activity.name}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-500 truncate">
              {activity.projectName}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${categoryInfo.color}`}>
              {categoryInfo.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Timer */}
          <span className={`text-sm font-mono tabular-nums ${
            activity.status === 'active' ? 'text-green-600' : 'text-yellow-600'
          }`}>
            {formatTimerDisplay(elapsed)}
          </span>

          {/* Controls */}
          <div className="flex items-center gap-1">
            {activity.status === 'active' ? (
              <button
                onClick={handlePause}
                disabled={loading}
                className="p-1 text-yellow-600 hover:bg-yellow-100 rounded transition-colors"
                title="Pause"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Pause className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <button
                onClick={handleResume}
                disabled={loading}
                className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                title="Resume"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              </button>
            )}
            <button
              onClick={handleStop}
              disabled={loading}
              className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
              title="Stop"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

/**
 * Floating Active Timer Widget
 */
export default function ActiveTimerWidget() {
  const { user } = useAuth()
  const { organizationId } = useOrganizationContext()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  // Load active activities
  const loadActivities = async () => {
    if (!organizationId || !user?.uid) return

    try {
      const data = await getActiveActivities(organizationId, user.uid)
      setActivities(data)
    } catch (err) {
      logger.error('Failed to load active activities:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load on mount and periodically
  useEffect(() => {
    loadActivities()

    // Refresh every 30 seconds
    const interval = setInterval(loadActivities, 30000)
    return () => clearInterval(interval)
  }, [organizationId, user?.uid])

  // Don't render if no activities or dismissed
  if (dismissed || activities.length === 0) {
    return null
  }

  const activeCount = activities.filter(a => a.status === 'active').length
  const pausedCount = activities.filter(a => a.status === 'paused').length

  return (
    <div className="fixed bottom-6 left-6 z-40 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 bg-green-50 border-b border-green-100 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <div className="p-1 bg-green-100 rounded">
            <Timer className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <span className="text-sm font-medium text-green-800">
              Active Timers
            </span>
            <div className="flex items-center gap-2 text-xs text-green-600">
              {activeCount > 0 && (
                <span className="flex items-center gap-1">
                  <Play className="w-3 h-3" />
                  {activeCount} running
                </span>
              )}
              {pausedCount > 0 && (
                <span className="flex items-center gap-1">
                  <Pause className="w-3 h-3" />
                  {pausedCount} paused
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
            className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
          >
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDismissed(true) }}
            className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Timer List */}
      {expanded && (
        <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
          {activities.map(activity => (
            <TimerItem
              key={activity.id}
              activity={activity}
              onRefresh={loadActivities}
            />
          ))}
        </div>
      )}
    </div>
  )
}
