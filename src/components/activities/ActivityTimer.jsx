/**
 * ActivityTimer.jsx
 * Timer display component with play/pause/stop controls
 *
 * @location src/components/activities/ActivityTimer.jsx
 */

import { useState, useEffect } from 'react'
import {
  Play,
  Pause,
  Square,
  Clock,
  Loader2
} from 'lucide-react'
import {
  formatTimerDisplay,
  calculateElapsedSeconds,
  ACTIVITY_STATUS,
  ACTIVITY_CATEGORIES
} from '../../lib/firestoreActivities'
import { Button } from '../ui/Button'

/**
 * Timer display with real-time updates
 */
export function TimerDisplay({ seconds, size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'text-lg font-mono',
    md: 'text-2xl font-mono',
    lg: 'text-4xl font-mono',
    xl: 'text-5xl font-mono'
  }

  return (
    <span className={`${sizeClasses[size]} tabular-nums ${className}`}>
      {formatTimerDisplay(seconds)}
    </span>
  )
}

/**
 * Activity Timer component with controls
 */
export default function ActivityTimer({
  activity,
  elapsed,
  status,
  loading,
  onPause,
  onResume,
  onStop,
  compact = false
}) {
  const [localElapsed, setLocalElapsed] = useState(elapsed || 0)

  // Sync with prop and tick every second when active
  useEffect(() => {
    setLocalElapsed(elapsed || 0)
  }, [elapsed])

  useEffect(() => {
    if (status === 'active') {
      const interval = setInterval(() => {
        setLocalElapsed(prev => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [status])

  const categoryInfo = ACTIVITY_CATEGORIES[activity?.category] || ACTIVITY_CATEGORIES.other
  const statusInfo = ACTIVITY_STATUS[status] || ACTIVITY_STATUS.active

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        {/* Timer */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
          status === 'active' ? 'bg-green-100' : 'bg-yellow-100'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
          }`} />
          <TimerDisplay seconds={localElapsed} size="sm" />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          {status === 'active' ? (
            <button
              onClick={onPause}
              disabled={loading}
              className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
              title="Pause"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pause className="w-4 h-4" />}
            </button>
          ) : status === 'paused' ? (
            <button
              onClick={onResume}
              disabled={loading}
              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Resume"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            </button>
          ) : null}

          {(status === 'active' || status === 'paused') && (
            <button
              onClick={onStop}
              disabled={loading}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Stop"
            >
              <Square className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border p-4">
      {/* Activity Info */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{activity?.name || 'Activity'}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryInfo.color}`}>
              {categoryInfo.label}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Status Indicator */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
          status === 'active' ? 'bg-green-100' : status === 'paused' ? 'bg-yellow-100' : 'bg-blue-100'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            status === 'active' ? 'bg-green-500 animate-pulse' :
            status === 'paused' ? 'bg-yellow-500' : 'bg-blue-500'
          }`} />
          <span className={`text-xs font-medium ${
            status === 'active' ? 'text-green-700' :
            status === 'paused' ? 'text-yellow-700' : 'text-blue-700'
          }`}>
            {status === 'active' ? 'Recording' : status === 'paused' ? 'Paused' : 'Completed'}
          </span>
        </div>
      </div>

      {/* Timer Display */}
      <div className="flex items-center justify-center py-6 bg-gray-50 rounded-lg mb-4">
        <TimerDisplay seconds={localElapsed} size="xl" className="text-gray-900" />
      </div>

      {/* Controls */}
      {(status === 'active' || status === 'paused') && (
        <div className="flex items-center justify-center gap-3">
          {status === 'active' ? (
            <Button
              onClick={onPause}
              disabled={loading}
              variant="outline"
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Pause className="w-4 h-4 mr-2" />
              )}
              Pause
            </Button>
          ) : (
            <Button
              onClick={onResume}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Resume
            </Button>
          )}

          <Button
            onClick={onStop}
            disabled={loading}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            <Square className="w-4 h-4 mr-2" />
            Stop
          </Button>
        </div>
      )}

      {/* Project Info */}
      {activity?.projectName && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-500">
            Project: <span className="font-medium text-gray-700">{activity.projectName}</span>
          </p>
        </div>
      )}
    </div>
  )
}
