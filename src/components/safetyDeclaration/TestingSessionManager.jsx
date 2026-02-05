/**
 * TestingSessionManager.jsx
 * Main component for managing testing sessions within a Safety Declaration
 * Supports multi-day testing campaigns with pause/resume functionality
 *
 * @location src/components/safetyDeclaration/TestingSessionManager.jsx
 */

import { useState, useMemo } from 'react'
import {
  Play,
  Pause,
  Square,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  TestTube,
  MapPin,
  Thermometer,
  Wind,
  MoreVertical,
  Trash2,
  Edit,
  Eye
} from 'lucide-react'
import {
  SESSION_STATUSES,
  REQUIREMENT_SECTIONS,
  startTestingSession,
  pauseTestingSession,
  resumeTestingSession,
  deleteTestingSession
} from '../../lib/firestoreSafetyDeclaration'

// Test types based on 922.xx requirements
const TEST_TYPES = {
  position_accuracy: {
    id: 'position_accuracy',
    label: 'Position Accuracy',
    description: 'Lateral position indication accuracy testing (922.04)',
    section: '922.04'
  },
  altitude_accuracy: {
    id: 'altitude_accuracy',
    label: 'Altitude Accuracy',
    description: 'Altitude indication accuracy testing (922.04)',
    section: '922.04'
  },
  injury_potential: {
    id: 'injury_potential',
    label: 'Injury Potential',
    description: 'Single failure injury protection testing (922.05/922.06)',
    section: '922.05'
  },
  failure_mode: {
    id: 'failure_mode',
    label: 'Failure Mode Analysis',
    description: 'System safety assessment testing (922.07)',
    section: '922.07'
  },
  containment: {
    id: 'containment',
    label: 'Containment Testing',
    description: 'Geofencing and operational volume testing (922.08)',
    section: '922.08'
  },
  c2_link: {
    id: 'c2_link',
    label: 'C2 Link Testing',
    description: 'Command and control link reliability testing (922.09)',
    section: '922.09'
  },
  daa: {
    id: 'daa',
    label: 'DAA Testing',
    description: 'Detect, Alert, and Avoid system testing (922.10)',
    section: '922.10'
  },
  workload: {
    id: 'workload',
    label: 'Workload Assessment',
    description: 'Bedford/Cooper-Harper workload evaluation (922.11)',
    section: '922.11'
  },
  environmental: {
    id: 'environmental',
    label: 'Environmental Envelope',
    description: 'Flight test demonstration of operational envelope (922.12)',
    section: '922.12'
  },
  general: {
    id: 'general',
    label: 'General Testing',
    description: 'General purpose testing session',
    section: null
  }
}

export { TEST_TYPES }

export default function TestingSessionManager({
  sessions = [],
  declarationId,
  declaration,
  requirements = [],
  onCreateSession,
  onViewSession,
  onSessionUpdate
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [actionMenuOpen, setActionMenuOpen] = useState(null)

  // Calculate session stats
  const stats = useMemo(() => {
    const scheduled = sessions.filter(s => s.status === 'scheduled').length
    const inProgress = sessions.filter(s => s.status === 'in_progress').length
    const paused = sessions.filter(s => s.status === 'paused').length
    const completed = sessions.filter(s => s.status === 'complete').length
    const totalMinutes = sessions
      .filter(s => s.status === 'complete')
      .reduce((sum, s) => sum + (s.totalDurationMinutes || 0), 0)

    return {
      total: sessions.length,
      scheduled,
      inProgress,
      paused,
      completed,
      totalMinutes,
      totalHours: Math.round(totalMinutes / 60 * 10) / 10
    }
  }, [sessions])

  // Filter sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      // Status filter
      if (statusFilter !== 'all' && session.status !== statusFilter) {
        return false
      }

      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        const matchesName = session.name?.toLowerCase().includes(search)
        const matchesType = session.testType?.toLowerCase().includes(search)
        const matchesLocation = session.conditions?.location?.toLowerCase().includes(search)
        return matchesName || matchesType || matchesLocation
      }

      return true
    })
  }, [sessions, statusFilter, searchTerm])

  // Group sessions by status for display
  const groupedSessions = useMemo(() => {
    const active = filteredSessions.filter(s => s.status === 'in_progress' || s.status === 'paused')
    const scheduled = filteredSessions.filter(s => s.status === 'scheduled')
    const completed = filteredSessions.filter(s => s.status === 'complete')
    const cancelled = filteredSessions.filter(s => s.status === 'cancelled')

    return { active, scheduled, completed, cancelled }
  }, [filteredSessions])

  const getStatusIcon = (status) => {
    switch (status) {
      case 'in_progress':
        return <Play className="w-4 h-4 text-yellow-600" />
      case 'paused':
        return <Pause className="w-4 h-4 text-orange-600" />
      case 'complete':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case 'cancelled':
        return <Square className="w-4 h-4 text-red-600" />
      default:
        return <Calendar className="w-4 h-4 text-blue-600" />
    }
  }

  const handleStartSession = async (session) => {
    try {
      await startTestingSession(declarationId, session.id)
      if (onSessionUpdate) onSessionUpdate()
    } catch (error) {
      console.error('Error starting session:', error)
    }
  }

  const handlePauseSession = async (session) => {
    try {
      await pauseTestingSession(declarationId, session.id)
      if (onSessionUpdate) onSessionUpdate()
    } catch (error) {
      console.error('Error pausing session:', error)
    }
  }

  const handleResumeSession = async (session) => {
    try {
      await resumeTestingSession(declarationId, session.id)
      if (onSessionUpdate) onSessionUpdate()
    } catch (error) {
      console.error('Error resuming session:', error)
    }
  }

  const handleDeleteSession = async (session) => {
    if (!window.confirm(`Delete testing session "${session.name}"? This cannot be undone.`)) {
      return
    }

    try {
      await deleteTestingSession(declarationId, session.id)
      if (onSessionUpdate) onSessionUpdate()
    } catch (error) {
      console.error('Error deleting session:', error)
    }
    setActionMenuOpen(null)
  }

  const formatDuration = (minutes) => {
    if (!minutes) return '-'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
  }

  const formatDate = (date) => {
    if (!date) return '-'
    if (typeof date === 'string') date = new Date(date)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const renderSessionCard = (session) => {
    const statusInfo = SESSION_STATUSES[session.status] || SESSION_STATUSES.scheduled
    const testTypeInfo = TEST_TYPES[session.testType] || TEST_TYPES.general
    const isActive = session.status === 'in_progress' || session.status === 'paused'

    return (
      <div
        key={session.id}
        className={`bg-white border rounded-lg overflow-hidden transition-all ${
          isActive ? 'border-yellow-300 shadow-md' : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        {/* Active indicator bar */}
        {isActive && (
          <div className={`h-1 ${session.status === 'paused' ? 'bg-orange-500' : 'bg-yellow-500'}`} />
        )}

        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${
                session.status === 'complete' ? 'bg-green-100' :
                session.status === 'in_progress' ? 'bg-yellow-100' :
                session.status === 'paused' ? 'bg-orange-100' :
                session.status === 'cancelled' ? 'bg-red-100' :
                'bg-blue-100'
              }`}>
                {getStatusIcon(session.status)}
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{session.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                  <span className="text-xs text-gray-500">{testTypeInfo.label}</span>
                </div>
              </div>
            </div>

            {/* Action menu */}
            <div className="relative">
              <button
                onClick={() => setActionMenuOpen(actionMenuOpen === session.id ? null : session.id)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {actionMenuOpen === session.id && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setActionMenuOpen(null)}
                  />
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                    <button
                      onClick={() => {
                        onViewSession?.(session)
                        setActionMenuOpen(null)
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    {session.status !== 'complete' && session.status !== 'cancelled' && (
                      <button
                        onClick={() => setActionMenuOpen(null)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Session
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteSession(session)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Session
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Session details */}
          <div className="grid grid-cols-2 gap-3 text-sm mb-3">
            <div className="flex items-center gap-2 text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{session.scheduledDate ? formatDate(session.scheduledDate) : 'Not scheduled'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(session.totalDurationMinutes)}</span>
            </div>
            {session.conditions?.location && (
              <div className="flex items-center gap-2 text-gray-500 col-span-2">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{session.conditions.location}</span>
              </div>
            )}
          </div>

          {/* Environmental conditions (if any) */}
          {(session.conditions?.temperature || session.conditions?.windSpeed) && (
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-3 p-2 bg-gray-50 rounded">
              {session.conditions?.temperature && (
                <div className="flex items-center gap-1">
                  <Thermometer className="w-3 h-3" />
                  <span>{session.conditions.temperature}°C</span>
                </div>
              )}
              {session.conditions?.windSpeed && (
                <div className="flex items-center gap-1">
                  <Wind className="w-3 h-3" />
                  <span>{session.conditions.windSpeed} km/h</span>
                </div>
              )}
              {session.conditions?.weather && (
                <span>{session.conditions.weather}</span>
              )}
            </div>
          )}

          {/* Linked requirements */}
          {session.linkedRequirements?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {session.linkedRequirements.slice(0, 3).map(reqId => (
                <span
                  key={reqId}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700"
                >
                  {reqId}
                </span>
              ))}
              {session.linkedRequirements.length > 3 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                  +{session.linkedRequirements.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
            {session.status === 'scheduled' && (
              <button
                onClick={() => handleStartSession(session)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                <Play className="w-4 h-4" />
                Start Session
              </button>
            )}
            {session.status === 'in_progress' && (
              <>
                <button
                  onClick={() => handlePauseSession(session)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm"
                >
                  <Pause className="w-4 h-4" />
                  Pause
                </button>
                <button
                  onClick={() => onViewSession?.(session)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
              </>
            )}
            {session.status === 'paused' && (
              <>
                <button
                  onClick={() => handleResumeSession(session)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  <Play className="w-4 h-4" />
                  Resume
                </button>
                <button
                  onClick={() => onViewSession?.(session)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
              </>
            )}
            {(session.status === 'complete' || session.status === 'cancelled') && (
              <button
                onClick={() => onViewSession?.(session)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
              >
                <Eye className="w-4 h-4" />
                View Results
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
          <p className="text-sm text-blue-600">Total Sessions</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-700">{stats.inProgress + stats.paused}</p>
          <p className="text-sm text-yellow-600">Active</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-purple-700">{stats.scheduled}</p>
          <p className="text-sm text-purple-600">Scheduled</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
          <p className="text-sm text-green-600">Completed</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-gray-700">{stats.totalHours}h</p>
          <p className="text-sm text-gray-600">Total Time</p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="paused">Paused</option>
            <option value="complete">Complete</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Create Button */}
        <button
          onClick={onCreateSession}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          New Session
        </button>
      </div>

      {/* Active Sessions */}
      {groupedSessions.active.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            Active Sessions
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {groupedSessions.active.map(renderSessionCard)}
          </div>
        </div>
      )}

      {/* Scheduled Sessions */}
      {groupedSessions.scheduled.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Scheduled Sessions</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {groupedSessions.scheduled.map(renderSessionCard)}
          </div>
        </div>
      )}

      {/* Completed Sessions */}
      {groupedSessions.completed.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Completed Sessions</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {groupedSessions.completed.map(renderSessionCard)}
          </div>
        </div>
      )}

      {/* Cancelled Sessions */}
      {groupedSessions.cancelled.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3 text-gray-500">Cancelled Sessions</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {groupedSessions.cancelled.map(renderSessionCard)}
          </div>
        </div>
      )}

      {/* Empty State */}
      {sessions.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Testing Sessions</h3>
          <p className="text-gray-500 mb-4">
            Create your first testing session to start documenting compliance testing.
          </p>
          <button
            onClick={onCreateSession}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Create First Session
          </button>
        </div>
      )}

      {/* No results state */}
      {sessions.length > 0 && filteredSessions.length === 0 && (
        <div className="text-center py-8">
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No sessions match your filters.</p>
        </div>
      )}
    </div>
  )
}
