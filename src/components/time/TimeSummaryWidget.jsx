/**
 * TimeSummaryWidget.jsx
 * Dashboard widget showing current week's time tracking summary
 *
 * @location src/components/time/TimeSummaryWidget.jsx
 */

import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Clock,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Send,
  XCircle,
  Plus
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useOrganization } from '../../hooks/useOrganization'
import {
  getCurrentWeekSummary,
  getWeekStart,
  getWeekEnd,
  formatDateString,
  TIMESHEET_STATUS
} from '../../lib/firestoreTimeTracking'
import { logger } from '../../lib/logger'

/**
 * Format hours for display
 */
function formatHours(hours) {
  if (!hours) return '0h'
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

/**
 * Day abbreviations
 */
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export default function TimeSummaryWidget({ compact = false }) {
  const { user } = useAuth()
  const { organizationId } = useOrganization()
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user?.uid && organizationId) {
      loadSummary()
    }
  }, [user?.uid, organizationId])

  const loadSummary = async () => {
    if (!organizationId) return
    try {
      setLoading(true)
      setError(null)
      const data = await getCurrentWeekSummary(user.uid, organizationId)
      setSummary(data)
    } catch (err) {
      logger.error('Failed to load time summary:', err)
      setError('Failed to load')
    } finally {
      setLoading(false)
    }
  }

  // Calculate week dates
  const weekDates = useMemo(() => {
    const monday = getWeekStart(new Date())
    const dates = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday)
      day.setDate(monday.getDate() + i)
      dates.push(formatDateString(day))
    }
    return dates
  }, [])

  // Get today's date string
  const today = formatDateString(new Date())

  // Status badge
  const statusBadge = useMemo(() => {
    if (!summary) return null

    switch (summary.status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        )
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            <Send className="w-3 h-3" />
            Pending
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        )
      default:
        return null
    }
  }, [summary])

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-32 bg-gray-200 rounded"></div>
          <div className="h-4 w-16 bg-gray-100 rounded"></div>
        </div>
        <div className="h-16 bg-gray-100 rounded"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <div className="flex items-center gap-2 text-gray-500">
          <AlertCircle className="w-5 h-5" />
          <span>Unable to load time data</span>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-aeria-navy" />
          Time This Week
        </h2>
        <Link
          to="/time-tracking"
          className="text-sm text-aeria-blue hover:text-aeria-navy inline-flex items-center gap-1"
        >
          View all
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">
            {formatHours(summary?.totalHours || 0)}
          </p>
          <p className="text-xs text-gray-500">Total Hours</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">
            {formatHours(summary?.billableHours || 0)}
          </p>
          <p className="text-xs text-green-700">Billable</p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">
            {summary?.entriesCount || 0}
          </p>
          <p className="text-xs text-blue-700">Entries</p>
        </div>
      </div>

      {/* Week Grid */}
      {!compact && (
        <div className="mb-4">
          <div className="flex gap-1">
            {weekDates.map((dateStr, idx) => {
              const hours = summary?.byDay?.[dateStr] || 0
              const isToday = dateStr === today
              const hasHours = hours > 0
              const maxHours = 10 // For visual scaling

              return (
                <div
                  key={dateStr}
                  className={`flex-1 text-center ${isToday ? 'ring-2 ring-blue-400 ring-offset-1' : ''} rounded`}
                >
                  <div className="text-[10px] text-gray-500 mb-1">{DAYS[idx]}</div>
                  <div
                    className={`h-8 rounded flex items-end justify-center transition-all ${
                      hasHours
                        ? 'bg-green-500'
                        : isToday
                        ? 'bg-blue-100'
                        : 'bg-gray-100'
                    }`}
                    style={{
                      opacity: hasHours ? Math.min(0.4 + (hours / maxHours) * 0.6, 1) : 1
                    }}
                    title={`${hours.toFixed(1)}h`}
                  >
                    {hasHours && (
                      <span className="text-[9px] text-white font-medium pb-0.5">
                        {hours.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Status & Action */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          {statusBadge}
          {!statusBadge && summary?.entriesCount === 0 && (
            <span className="text-sm text-gray-500">No time logged this week</span>
          )}
          {!statusBadge && summary?.entriesCount > 0 && summary?.status === 'draft' && (
            <span className="text-sm text-gray-500">Ready to submit</span>
          )}
        </div>

        <Link
          to="/time-tracking"
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-aeria-navy text-white rounded-lg hover:bg-aeria-blue transition-colors"
        >
          <Plus className="w-4 h-4" />
          Log Time
        </Link>
      </div>
    </div>
  )
}
