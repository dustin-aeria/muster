/**
 * TimeTracking.jsx
 * Main time tracking page with list view and entry management
 *
 * @location src/pages/TimeTracking.jsx
 */

import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Clock,
  Plus,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Send,
  FolderKanban
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import {
  getTimeEntriesByOperator,
  getTimeEntriesForWeek,
  getCurrentWeekSummary,
  getOrCreateTimesheet,
  submitTimesheet,
  deleteTimeEntry,
  getWeekStart,
  getWeekEnd,
  formatDateString,
  TASK_TYPES,
  TIME_ENTRY_STATUS
} from '../lib/firestoreTimeTracking'
import { logger } from '../lib/logger'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import Modal from '../components/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import TimeEntryForm from '../components/time/TimeEntryForm'
import { AlertCircle, MessageSquare } from 'lucide-react'

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

/**
 * Day names for week view
 */
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function TimeTracking() {
  const { user, userProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState([])
  const [weekSummary, setWeekSummary] = useState(null)
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStart(new Date()))

  // UI state
  const [showEntryModal, setShowEntryModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingEntry, setDeletingEntry] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [submitNotes, setSubmitNotes] = useState('')
  const [viewMode, setViewMode] = useState('week') // 'week' | 'list'
  const [searchQuery, setSearchQuery] = useState('')

  // Load data
  useEffect(() => {
    if (user?.uid) {
      loadData()
    }
  }, [user?.uid, currentWeekStart])

  const loadData = async () => {
    try {
      setLoading(true)
      const [weekEntries, summary] = await Promise.all([
        getTimeEntriesForWeek(user.uid, currentWeekStart),
        getCurrentWeekSummary(user.uid)
      ])
      setEntries(weekEntries)
      setWeekSummary(summary)
    } catch (err) {
      logger.error('Failed to load time entries:', err)
    } finally {
      setLoading(false)
    }
  }

  // Navigate weeks
  const goToPreviousWeek = () => {
    const newWeek = new Date(currentWeekStart)
    newWeek.setDate(newWeek.getDate() - 7)
    setCurrentWeekStart(newWeek)
  }

  const goToNextWeek = () => {
    const newWeek = new Date(currentWeekStart)
    newWeek.setDate(newWeek.getDate() + 7)
    setCurrentWeekStart(newWeek)
  }

  const goToCurrentWeek = () => {
    setCurrentWeekStart(getWeekStart(new Date()))
  }

  // Week end date
  const weekEnd = useMemo(() => getWeekEnd(currentWeekStart), [currentWeekStart])

  // Is current week
  const isCurrentWeek = useMemo(() => {
    const today = getWeekStart(new Date())
    return currentWeekStart.getTime() === today.getTime()
  }, [currentWeekStart])

  // Group entries by day for week view
  const entriesByDay = useMemo(() => {
    const byDay = {}
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart)
      day.setDate(currentWeekStart.getDate() + i)
      const dateStr = formatDateString(day)
      byDay[dateStr] = {
        date: day,
        dateStr,
        entries: [],
        totalHours: 0
      }
    }

    entries.forEach(entry => {
      if (byDay[entry.date]) {
        byDay[entry.date].entries.push(entry)
        byDay[entry.date].totalHours += entry.totalHours || 0
      }
    })

    return Object.values(byDay)
  }, [entries, currentWeekStart])

  // Weekly totals
  const weeklyTotals = useMemo(() => {
    return {
      totalHours: entries.reduce((sum, e) => sum + (e.totalHours || 0), 0),
      billableHours: entries.filter(e => e.billable).reduce((sum, e) => sum + (e.totalHours || 0), 0),
      totalAmount: entries.reduce((sum, e) => sum + (e.billingAmount || 0), 0)
    }
  }, [entries])

  // Check for draft entries that need submission
  const hasDraftEntries = useMemo(() => {
    return entries.some(e => e.status === 'draft')
  }, [entries])

  // Determine if submission is needed
  const needsSubmission = useMemo(() => {
    // Show submit if there are entries and either:
    // 1. Timesheet is draft
    // 2. Timesheet was rejected
    // 3. There are new draft entries (added after previous submission)
    if (entries.length === 0) return false
    if (!weekSummary?.status || weekSummary.status === 'draft') return true
    if (weekSummary.status === 'rejected') return true
    if (hasDraftEntries) return true // New entries added after submission
    return false
  }, [entries, weekSummary, hasDraftEntries])

  // Handle entry creation
  const handleNewEntry = () => {
    setEditingEntry(null)
    setShowEntryModal(true)
  }

  // Handle entry edit
  const handleEditEntry = (entry) => {
    setEditingEntry(entry)
    setShowEntryModal(true)
  }

  // Handle entry deletion
  const handleDeleteEntry = async () => {
    if (!deletingEntry) return

    try {
      await deleteTimeEntry(deletingEntry.id)
      logger.info('Time entry deleted:', deletingEntry.id)
      setShowDeleteConfirm(false)
      setDeletingEntry(null)
      loadData()
    } catch (err) {
      logger.error('Failed to delete time entry:', err)
    }
  }

  // Open submission confirmation
  const handleOpenSubmitConfirm = () => {
    if (entries.length === 0) {
      return // Can't submit empty timesheet
    }
    setSubmitNotes('')
    setShowSubmitConfirm(true)
  }

  // Handle timesheet submission
  const handleSubmitTimesheet = async () => {
    try {
      setSubmitting(true)
      const operatorName = userProfile?.firstName
        ? `${userProfile.firstName} ${userProfile.lastName || ''}`
        : user.email

      const timesheet = await getOrCreateTimesheet(user.uid, operatorName, currentWeekStart)
      await submitTimesheet(timesheet.id, submitNotes)
      logger.info('Timesheet submitted:', timesheet.id)
      setShowSubmitConfirm(false)
      setSubmitNotes('')
      loadData()
    } catch (err) {
      logger.error('Failed to submit timesheet:', err)
    } finally {
      setSubmitting(false)
    }
  }

  // Entry saved callback
  const handleEntrySaved = () => {
    setShowEntryModal(false)
    setEditingEntry(null)
    loadData()
  }

  // Filter entries for search
  const filteredEntries = useMemo(() => {
    if (!searchQuery) return entries
    const query = searchQuery.toLowerCase()
    return entries.filter(e =>
      e.projectName?.toLowerCase().includes(query) ||
      e.description?.toLowerCase().includes(query) ||
      TASK_TYPES[e.taskType]?.label.toLowerCase().includes(query)
    )
  }, [entries, searchQuery])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-7 h-7 text-aeria-navy" />
            Time Tracking
          </h1>
          <p className="text-gray-500 mt-1">
            Log and manage your work hours
          </p>
        </div>

        <Button onClick={handleNewEntry}>
          <Plus className="w-4 h-4 mr-2" />
          Log Time
        </Button>
      </div>

      {/* Week Navigation & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        {/* Week Navigator */}
        <Card className="lg:col-span-2 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={goToPreviousWeek}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="text-sm text-gray-500">Week of</div>
              <div className="font-semibold text-gray-900">
                {currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {' - '}
                {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              {!isCurrentWeek && (
                <button
                  onClick={goToCurrentWeek}
                  className="text-sm text-blue-600 hover:text-blue-700 mt-1"
                >
                  Go to current week
                </button>
              )}
            </div>

            <button
              onClick={goToNextWeek}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isCurrentWeek}
            >
              <ChevronRight className={`w-5 h-5 ${isCurrentWeek ? 'text-gray-300' : ''}`} />
            </button>
          </div>
        </Card>

        {/* Weekly Summary */}
        <Card className="p-4">
          <div className="text-sm text-gray-500 mb-1">Total Hours</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatHours(weeklyTotals.totalHours)}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {formatHours(weeklyTotals.billableHours)} billable
          </div>
        </Card>

        {/* Status / Actions */}
        <Card className="p-4">
          <div className="text-sm text-gray-500 mb-1">Status</div>
          {needsSubmission ? (
            <div>
              {hasDraftEntries && weekSummary?.status === 'approved' ? (
                <Badge className="bg-amber-100 text-amber-700 mb-2">New Entries</Badge>
              ) : hasDraftEntries && weekSummary?.status === 'submitted' ? (
                <Badge className="bg-amber-100 text-amber-700 mb-2">New Entries</Badge>
              ) : weekSummary?.status === 'rejected' ? (
                <Badge className="bg-red-100 text-red-700 mb-2">Rejected</Badge>
              ) : (
                <Badge variant="secondary" className="mb-2">Draft</Badge>
              )}
              <Button
                size="sm"
                onClick={handleOpenSubmitConfirm}
                disabled={submitting}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-1" />
                {hasDraftEntries && (weekSummary?.status === 'approved' || weekSummary?.status === 'submitted')
                  ? 'Submit New Entries'
                  : weekSummary?.status === 'rejected'
                  ? 'Resubmit'
                  : 'Submit for Approval'}
              </Button>
            </div>
          ) : weekSummary?.status === 'submitted' ? (
            <div>
              <Badge className="bg-blue-100 text-blue-700">
                <Send className="w-3 h-3 mr-1" />
                Submitted
              </Badge>
              <div className="text-sm text-gray-500 mt-2">Pending approval</div>
              {weekSummary?.submittedAt && (
                <div className="text-xs text-gray-400 mt-1">
                  Submitted {new Date(weekSummary.submittedAt.toDate?.() || weekSummary.submittedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          ) : weekSummary?.status === 'approved' ? (
            <div>
              <Badge className="bg-green-100 text-green-700">
                <CheckCircle className="w-3 h-3 mr-1" />
                Approved
              </Badge>
              {weekSummary?.approvedAt && (
                <div className="text-xs text-gray-400 mt-2">
                  Approved {new Date(weekSummary.approvedAt.toDate?.() || weekSummary.approvedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          ) : weekSummary?.status === 'rejected' ? (
            <div>
              <Badge className="bg-red-100 text-red-700">
                <XCircle className="w-3 h-3 mr-1" />
                Rejected
              </Badge>
              {weekSummary?.rejectionReason && (
                <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
                  <div className="font-medium flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    Reason:
                  </div>
                  <div className="mt-1">{weekSummary.rejectionReason}</div>
                </div>
              )}
              <Button
                size="sm"
                onClick={handleOpenSubmitConfirm}
                disabled={submitting}
                className="w-full mt-2"
              >
                <Send className="w-4 h-4 mr-1" />
                Resubmit
              </Button>
            </div>
          ) : (
            <div className="text-gray-500">No entries yet</div>
          )}
        </Card>
      </div>

      {/* Week View */}
      {loading ? (
        <Card className="p-8 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
            {entriesByDay.map((day, idx) => {
              const isToday = formatDateString(new Date()) === day.dateStr
              return (
                <div
                  key={day.dateStr}
                  className={`p-3 text-center border-r border-gray-200 last:border-r-0 ${
                    isToday ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className={`text-xs font-medium ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                    {DAY_NAMES[idx]}
                  </div>
                  <div className={`text-sm font-semibold ${isToday ? 'text-blue-900' : 'text-gray-900'}`}>
                    {day.date.getDate()}
                  </div>
                  {day.totalHours > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {formatHours(day.totalHours)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Day Content */}
          <div className="grid grid-cols-7 min-h-[300px]">
            {entriesByDay.map((day) => {
              const isToday = formatDateString(new Date()) === day.dateStr
              const isPast = new Date(day.dateStr) < new Date(formatDateString(new Date()))
              // Can always add new entries to past/today days
              const canAddEntry = isPast || isToday

              return (
                <div
                  key={day.dateStr}
                  className={`border-r border-gray-200 last:border-r-0 p-2 ${
                    isToday ? 'bg-blue-50/30' : ''
                  }`}
                >
                  {day.entries.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      {canAddEntry && (
                        <button
                          onClick={() => {
                            setEditingEntry({ date: day.dateStr })
                            setShowEntryModal(true)
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {day.entries.map(entry => {
                        // Entry is editable if it's draft or rejected (not submitted or approved)
                        const entryEditable = entry.status === 'draft' || entry.status === 'rejected'
                        return (
                          <div
                            key={entry.id}
                            className={`p-2 rounded-lg text-xs transition-colors ${
                              TASK_TYPES[entry.taskType]?.color || 'bg-gray-100 text-gray-700'
                            } ${entryEditable ? 'cursor-pointer hover:opacity-80' : 'opacity-75'}`}
                            onClick={() => entryEditable && handleEditEntry(entry)}
                          >
                            <div className="font-medium truncate">
                              {entry.projectName || 'No project'}
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <span>{formatHours(entry.totalHours)}</span>
                              {entry.billable && (
                                <span className="text-green-600">$</span>
                              )}
                            </div>
                            {entry.description && (
                              <div className="text-gray-600 truncate mt-1">
                                {entry.description}
                              </div>
                            )}
                            {/* Show status indicator for non-draft entries */}
                            {entry.status !== 'draft' && (
                              <div className={`text-xs mt-1 ${
                                entry.status === 'approved' ? 'text-green-700' :
                                entry.status === 'submitted' ? 'text-blue-700' :
                                entry.status === 'rejected' ? 'text-red-700' : ''
                              }`}>
                                {entry.status === 'approved' ? '✓ Approved' :
                                 entry.status === 'submitted' ? '⏳ Pending' :
                                 entry.status === 'rejected' ? '✗ Rejected' : ''}
                              </div>
                            )}
                          </div>
                        )
                      })}

                      {/* Add more button - always allow adding new entries */}
                      {canAddEntry && (
                        <button
                          onClick={() => {
                            setEditingEntry({ date: day.dateStr })
                            setShowEntryModal(true)
                          }}
                          className="w-full p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Recent Entries List */}
      {entries.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">This Week's Entries</h2>
          <Card>
            <div className="divide-y divide-gray-200">
              {entries.map(entry => (
                <div
                  key={entry.id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-10 rounded-full ${
                      TASK_TYPES[entry.taskType]?.color.replace('text-', 'bg-').split(' ')[0] || 'bg-gray-300'
                    }`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/projects/${entry.projectId}`}
                          className="font-medium text-gray-900 hover:text-blue-600"
                        >
                          {entry.projectName || 'No project'}
                        </Link>
                        <Badge size="sm" className={TASK_TYPES[entry.taskType]?.color}>
                          {TASK_TYPES[entry.taskType]?.label || entry.taskType}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(entry.date)}
                        {entry.startTime && entry.endTime && (
                          <span>• {entry.startTime} - {entry.endTime}</span>
                        )}
                      </div>
                      {entry.description && (
                        <div className="text-sm text-gray-600 mt-1">
                          {entry.description}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {formatHours(entry.totalHours)}
                      </div>
                      {entry.billable && entry.billingAmount > 0 && (
                        <div className="text-sm text-green-600">
                          ${entry.billingAmount.toFixed(2)}
                        </div>
                      )}
                    </div>

                    {/* Status badge */}
                    {entry.status && entry.status !== 'draft' && (
                      <Badge size="sm" className={
                        entry.status === 'approved' ? 'bg-green-100 text-green-700' :
                        entry.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                        entry.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }>
                        {entry.status === 'approved' ? 'Approved' :
                         entry.status === 'submitted' ? 'Pending' :
                         entry.status === 'rejected' ? 'Rejected' :
                         entry.status}
                      </Badge>
                    )}

                    {/* Edit/Delete buttons - only for draft or rejected entries */}
                    {(entry.status === 'draft' || entry.status === 'rejected' || !entry.status) && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditEntry(entry)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                          title="Edit entry"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingEntry(entry)
                            setShowDeleteConfirm(true)
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!loading && entries.length === 0 && (
        <Card className="p-8 text-center">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No time entries this week
          </h3>
          <p className="text-gray-500 mb-4">
            Start tracking your work hours by logging your first entry.
          </p>
          <Button onClick={handleNewEntry}>
            <Plus className="w-4 h-4 mr-2" />
            Log Time
          </Button>
        </Card>
      )}

      {/* Entry Modal */}
      <Modal
        isOpen={showEntryModal}
        onClose={() => {
          setShowEntryModal(false)
          setEditingEntry(null)
        }}
        size="lg"
      >
        <TimeEntryForm
          entry={editingEntry}
          onClose={() => {
            setShowEntryModal(false)
            setEditingEntry(null)
          }}
          onSaved={handleEntrySaved}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false)
          setDeletingEntry(null)
        }}
        onConfirm={handleDeleteEntry}
        title="Delete Time Entry"
        message={`Are you sure you want to delete this time entry for ${deletingEntry?.projectName || 'this project'}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />

      {/* Submit Timesheet Confirmation */}
      <Modal
        isOpen={showSubmitConfirm}
        onClose={() => !submitting && setShowSubmitConfirm(false)}
        size="md"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
              <Send className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Submit Timesheet</h3>
              <p className="text-sm text-gray-500">
                Week of {currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{formatHours(weeklyTotals.totalHours)}</div>
                <div className="text-xs text-gray-500">Total Hours</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{formatHours(weeklyTotals.billableHours)}</div>
                <div className="text-xs text-green-700">Billable</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{entries.length}</div>
                <div className="text-xs text-gray-500">Entries</div>
              </div>
            </div>
            {weeklyTotals.totalAmount > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200 text-center">
                <div className="text-lg font-semibold text-green-600">
                  ${weeklyTotals.totalAmount.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">Total Billable Amount</div>
              </div>
            )}
          </div>

          {/* Entries preview */}
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Entries to submit:</div>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {entries.map(entry => (
                <div key={entry.id} className="flex items-center justify-between text-sm py-1 px-2 bg-white rounded border">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">{formatDate(entry.date).split(',')[0]}</span>
                    <span className="font-medium truncate max-w-[150px]">{entry.projectName || 'No project'}</span>
                  </div>
                  <span className="text-gray-600">{formatHours(entry.totalHours)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notes field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes for approver (optional)
            </label>
            <textarea
              value={submitNotes}
              onChange={(e) => setSubmitNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any additional context for your timesheet..."
              disabled={submitting}
            />
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg text-sm text-amber-800 mb-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">Note:</span> Once submitted, you won't be able to edit entries until the timesheet is approved or rejected.
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowSubmitConfirm(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitTimesheet}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Timesheet
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
