/**
 * ProjectTimeEntries.jsx
 * Time entries view within a project
 *
 * @location src/components/projects/ProjectTimeEntries.jsx
 */

import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Clock,
  Plus,
  Calendar,
  User,
  DollarSign,
  TrendingUp,
  Filter,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react'
import {
  getTimeEntriesByProject,
  getProjectTimeSummary,
  TASK_TYPES
} from '../../lib/firestoreTimeTracking'
import { logger } from '../../lib/logger'
import { useOrganization } from '../../hooks/useOrganization'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'

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
 * Format date for display
 */
function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

export default function ProjectTimeEntries({ project }) {
  const { organizationId } = useOrganization()
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState([])
  const [summary, setSummary] = useState(null)
  const [expandedOperator, setExpandedOperator] = useState(null)
  const [filterTaskType, setFilterTaskType] = useState('all')
  const [sortBy, setSortBy] = useState('date') // 'date' | 'operator' | 'hours'

  useEffect(() => {
    if (organizationId && project?.id) {
      loadData()
    }
  }, [organizationId, project?.id])

  const loadData = async () => {
    try {
      setLoading(true)
      const [entriesData, summaryData] = await Promise.all([
        getTimeEntriesByProject(organizationId, project.id),
        getProjectTimeSummary(organizationId, project.id)
      ])
      setEntries(entriesData)
      setSummary(summaryData)
    } catch (err) {
      logger.error('Failed to load project time data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort entries
  const filteredEntries = useMemo(() => {
    let filtered = entries

    if (filterTaskType !== 'all') {
      filtered = filtered.filter(e => e.taskType === filterTaskType)
    }

    // Sort
    if (sortBy === 'date') {
      filtered = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date))
    } else if (sortBy === 'operator') {
      filtered = [...filtered].sort((a, b) => (a.operatorName || '').localeCompare(b.operatorName || ''))
    } else if (sortBy === 'hours') {
      filtered = [...filtered].sort((a, b) => (b.totalHours || 0) - (a.totalHours || 0))
    }

    return filtered
  }, [entries, filterTaskType, sortBy])

  // Group entries by operator
  const entriesByOperator = useMemo(() => {
    const grouped = {}
    filteredEntries.forEach(entry => {
      const key = entry.operatorId || 'unknown'
      if (!grouped[key]) {
        grouped[key] = {
          operatorId: entry.operatorId,
          operatorName: entry.operatorName || 'Unknown',
          entries: [],
          totalHours: 0,
          billableHours: 0,
          totalAmount: 0
        }
      }
      grouped[key].entries.push(entry)
      grouped[key].totalHours += entry.totalHours || 0
      if (entry.billable) {
        grouped[key].billableHours += entry.totalHours || 0
        grouped[key].totalAmount += entry.billingAmount || 0
      }
    })
    return Object.values(grouped).sort((a, b) => b.totalHours - a.totalHours)
  }, [filteredEntries])

  // Task type breakdown for chart
  const taskTypeBreakdown = useMemo(() => {
    if (!summary?.byTaskType) return []
    return Object.entries(summary.byTaskType)
      .map(([type, hours]) => ({
        type,
        label: TASK_TYPES[type]?.label || type,
        hours,
        color: TASK_TYPES[type]?.color || 'bg-gray-100 text-gray-700',
        percentage: summary.totalHours > 0 ? (hours / summary.totalHours * 100) : 0
      }))
      .sort((a, b) => b.hours - a.hours)
  }, [summary])

  if (loading) {
    return (
      <Card className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            <div className="h-20 bg-gray-100 rounded"></div>
            <div className="h-20 bg-gray-100 rounded"></div>
            <div className="h-20 bg-gray-100 rounded"></div>
            <div className="h-20 bg-gray-100 rounded"></div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-aeria-navy" />
            Time Tracking
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {entries.length} entries logged for this project
          </p>
        </div>
        <Link to="/time-tracking">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Log Time
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {formatHours(summary?.totalHours || 0)}
              </div>
              <div className="text-sm text-gray-500">Total Hours</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {formatHours(summary?.billableHours || 0)}
              </div>
              <div className="text-sm text-gray-500">Billable Hours</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                ${(summary?.totalBillingAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-gray-500">Labor Cost</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <User className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {Object.keys(summary?.byOperator || {}).length}
              </div>
              <div className="text-sm text-gray-500">Team Members</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Task Type Breakdown */}
      {taskTypeBreakdown.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Hours by Task Type</h3>
          <div className="space-y-2">
            {taskTypeBreakdown.map(task => (
              <div key={task.type} className="flex items-center gap-3">
                <Badge size="sm" className={task.color}>
                  {task.label}
                </Badge>
                <div className="flex-1">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-aeria-navy rounded-full transition-all"
                      style={{ width: `${task.percentage}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700 w-16 text-right">
                  {formatHours(task.hours)}
                </span>
                <span className="text-xs text-gray-400 w-12 text-right">
                  {task.percentage.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Entries by Team Member */}
      {entriesByOperator.length > 0 ? (
        <Card className="overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Time by Team Member</h3>
            <div className="flex items-center gap-2">
              <select
                value={filterTaskType}
                onChange={(e) => setFilterTaskType(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-2 py-1"
              >
                <option value="all">All Task Types</option>
                {Object.entries(TASK_TYPES).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {entriesByOperator.map(operator => (
              <div key={operator.operatorId}>
                {/* Operator Header */}
                <button
                  onClick={() => setExpandedOperator(
                    expandedOperator === operator.operatorId ? null : operator.operatorId
                  )}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{operator.operatorName}</div>
                      <div className="text-sm text-gray-500">{operator.entries.length} entries</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{formatHours(operator.totalHours)}</div>
                      <div className="text-xs text-green-600">
                        {formatHours(operator.billableHours)} billable
                      </div>
                    </div>
                    {operator.totalAmount > 0 && (
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          ${operator.totalAmount.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-400">labor cost</div>
                      </div>
                    )}
                    {expandedOperator === operator.operatorId ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Entries */}
                {expandedOperator === operator.operatorId && (
                  <div className="bg-gray-50 px-4 py-2 border-t border-gray-100">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-500">
                          <th className="text-left py-2 font-medium">Date</th>
                          <th className="text-left py-2 font-medium">Task</th>
                          <th className="text-left py-2 font-medium">Description</th>
                          <th className="text-right py-2 font-medium">Hours</th>
                          <th className="text-right py-2 font-medium">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {operator.entries.map(entry => (
                          <tr key={entry.id} className="hover:bg-white">
                            <td className="py-2 text-gray-600">
                              {formatDate(entry.date)}
                            </td>
                            <td className="py-2">
                              <Badge size="sm" className={TASK_TYPES[entry.taskType]?.color}>
                                {TASK_TYPES[entry.taskType]?.label || entry.taskType}
                              </Badge>
                            </td>
                            <td className="py-2 text-gray-600 max-w-xs truncate">
                              {entry.description || '—'}
                            </td>
                            <td className="py-2 text-right font-medium text-gray-900">
                              {formatHours(entry.totalHours)}
                            </td>
                            <td className="py-2 text-right">
                              {entry.billable ? (
                                <span className="text-green-600">${(entry.billingAmount || 0).toFixed(2)}</span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No time logged yet</h3>
          <p className="text-gray-500 mb-4">
            Start tracking time for this project to see labor costs and team productivity.
          </p>
          <Link to="/time-tracking">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Log Time
            </Button>
          </Link>
        </Card>
      )}

      {/* Link to full time tracking */}
      {entries.length > 0 && (
        <div className="text-center">
          <Link
            to="/time-tracking"
            className="text-sm text-aeria-blue hover:text-aeria-navy inline-flex items-center gap-1"
          >
            View all time entries
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  )
}
