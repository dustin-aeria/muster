/**
 * TestSessionDetail.jsx
 * Detailed view for active test session recording with timer, pause/resume,
 * environmental logging, observations, and results
 *
 * @location src/components/safetyDeclaration/TestSessionDetail.jsx
 */

import { useState, useEffect, useCallback } from 'react'
import {
  ArrowLeft,
  Play,
  Pause,
  Square,
  Clock,
  Calendar,
  MapPin,
  Thermometer,
  Wind,
  Cloud,
  Eye,
  CheckCircle2,
  Circle,
  AlertCircle,
  Plus,
  Trash2,
  Save,
  FileText,
  Camera,
  MessageSquare,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Edit
} from 'lucide-react'
import {
  updateTestingSession,
  startTestingSession,
  pauseTestingSession,
  resumeTestingSession,
  completeTestingSession,
  SESSION_STATUSES
} from '../../lib/firestoreSafetyDeclaration'
import { TEST_TYPES } from './TestingSessionManager'

export default function TestSessionDetail({
  session,
  declarationId,
  onBack,
  onUpdate
}) {
  const [localSession, setLocalSession] = useState(session)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [saving, setSaving] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    conditions: true,
    preTest: true,
    inTest: true,
    postTest: false,
    observations: true,
    results: session?.status === 'complete'
  })

  // Editable state
  const [editingConditions, setEditingConditions] = useState(false)
  const [conditions, setConditions] = useState(session?.conditions || {})
  const [observations, setObservations] = useState(session?.results?.observations || [])
  const [issues, setIssues] = useState(session?.results?.issues || [])
  const [newObservation, setNewObservation] = useState('')
  const [newIssue, setNewIssue] = useState('')
  const [resultsSummary, setResultsSummary] = useState(session?.results?.summary || '')
  const [passed, setPassed] = useState(session?.results?.passed)

  // Update local state when session prop changes
  useEffect(() => {
    setLocalSession(session)
    setConditions(session?.conditions || {})
    setObservations(session?.results?.observations || [])
    setIssues(session?.results?.issues || [])
    setResultsSummary(session?.results?.summary || '')
    setPassed(session?.results?.passed)
  }, [session])

  // Timer effect
  useEffect(() => {
    if (!localSession?.actualStartTime) return
    if (localSession.status !== 'in_progress') return

    const startTime = localSession.actualStartTime instanceof Date
      ? localSession.actualStartTime
      : new Date(localSession.actualStartTime)

    // Calculate initial elapsed time accounting for pauses
    let pausedDuration = 0
    if (localSession.pauseHistory) {
      localSession.pauseHistory.forEach(pause => {
        if (pause.pausedAt && pause.resumedAt) {
          const pauseStart = new Date(pause.pausedAt)
          const pauseEnd = new Date(pause.resumedAt)
          pausedDuration += pauseEnd - pauseStart
        }
      })
    }

    const calculateElapsed = () => {
      const now = new Date()
      const totalElapsed = now - startTime - pausedDuration
      setElapsedTime(Math.max(0, Math.floor(totalElapsed / 1000)))
    }

    calculateElapsed()
    const interval = setInterval(calculateElapsed, 1000)

    return () => clearInterval(interval)
  }, [localSession])

  // Calculate elapsed time for paused sessions
  useEffect(() => {
    if (localSession?.status === 'paused' && localSession?.actualStartTime && localSession?.pausedAt) {
      const startTime = localSession.actualStartTime instanceof Date
        ? localSession.actualStartTime
        : new Date(localSession.actualStartTime)
      const pauseTime = localSession.pausedAt instanceof Date
        ? localSession.pausedAt
        : new Date(localSession.pausedAt)

      let pausedDuration = 0
      if (localSession.pauseHistory) {
        localSession.pauseHistory.slice(0, -1).forEach(pause => {
          if (pause.pausedAt && pause.resumedAt) {
            const pauseStart = new Date(pause.pausedAt)
            const pauseEnd = new Date(pause.resumedAt)
            pausedDuration += pauseEnd - pauseStart
          }
        })
      }

      const elapsed = pauseTime - startTime - pausedDuration
      setElapsedTime(Math.max(0, Math.floor(elapsed / 1000)))
    }
  }, [localSession])

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = async () => {
    try {
      await startTestingSession(declarationId, localSession.id)
      setLocalSession(prev => ({ ...prev, status: 'in_progress', actualStartTime: new Date() }))
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Error starting session:', error)
    }
  }

  const handlePause = async () => {
    try {
      await pauseTestingSession(declarationId, localSession.id)
      setLocalSession(prev => ({ ...prev, status: 'paused', pausedAt: new Date() }))
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Error pausing session:', error)
    }
  }

  const handleResume = async () => {
    try {
      await resumeTestingSession(declarationId, localSession.id)
      setLocalSession(prev => ({ ...prev, status: 'in_progress', pausedAt: null }))
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Error resuming session:', error)
    }
  }

  const handleComplete = async () => {
    if (!window.confirm('Complete this testing session? You will still be able to edit results afterward.')) {
      return
    }

    try {
      await completeTestingSession(declarationId, localSession.id, {
        passed,
        summary: resultsSummary,
        observations,
        issues
      })
      setLocalSession(prev => ({ ...prev, status: 'complete' }))
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Error completing session:', error)
    }
  }

  const saveConditions = async () => {
    setSaving(true)
    try {
      await updateTestingSession(declarationId, localSession.id, { conditions })
      setEditingConditions(false)
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Error saving conditions:', error)
    } finally {
      setSaving(false)
    }
  }

  const toggleChecklistItem = async (listType, index) => {
    const key = `${listType}Checklist`
    const updatedList = [...(localSession[key] || [])]
    updatedList[index] = { ...updatedList[index], completed: !updatedList[index].completed }

    setLocalSession(prev => ({ ...prev, [key]: updatedList }))

    try {
      await updateTestingSession(declarationId, localSession.id, { [key]: updatedList })
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Error updating checklist:', error)
    }
  }

  const addObservation = async () => {
    if (!newObservation.trim()) return

    const updated = [...observations, { text: newObservation.trim(), timestamp: new Date().toISOString() }]
    setObservations(updated)
    setNewObservation('')

    try {
      await updateTestingSession(declarationId, localSession.id, {
        'results.observations': updated
      })
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Error adding observation:', error)
    }
  }

  const addIssue = async () => {
    if (!newIssue.trim()) return

    const updated = [...issues, { text: newIssue.trim(), timestamp: new Date().toISOString(), resolved: false }]
    setIssues(updated)
    setNewIssue('')

    try {
      await updateTestingSession(declarationId, localSession.id, {
        'results.issues': updated
      })
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Error adding issue:', error)
    }
  }

  const toggleIssueResolved = async (index) => {
    const updated = [...issues]
    updated[index] = { ...updated[index], resolved: !updated[index].resolved }
    setIssues(updated)

    try {
      await updateTestingSession(declarationId, localSession.id, {
        'results.issues': updated
      })
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Error updating issue:', error)
    }
  }

  const saveResults = async () => {
    setSaving(true)
    try {
      await updateTestingSession(declarationId, localSession.id, {
        'results.summary': resultsSummary,
        'results.passed': passed
      })
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Error saving results:', error)
    } finally {
      setSaving(false)
    }
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const statusInfo = SESSION_STATUSES[localSession?.status] || SESSION_STATUSES.scheduled
  const testTypeInfo = TEST_TYPES[localSession?.testType] || TEST_TYPES.general
  const isActive = localSession?.status === 'in_progress' || localSession?.status === 'paused'
  const canEdit = localSession?.status !== 'cancelled'

  if (!localSession) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <button
            onClick={onBack}
            className="mt-1 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">{localSession.name}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {testTypeInfo.label} {testTypeInfo.section && `• CAR ${testTypeInfo.section}`}
            </p>
          </div>
        </div>
      </div>

      {/* Timer & Controls */}
      <div className={`rounded-xl p-6 ${
        localSession.status === 'in_progress' ? 'bg-yellow-50 border-2 border-yellow-300' :
        localSession.status === 'paused' ? 'bg-orange-50 border-2 border-orange-300' :
        localSession.status === 'complete' ? 'bg-green-50 border border-green-200' :
        'bg-gray-50 border border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">
              {localSession.status === 'complete' ? 'Total Duration' : 'Elapsed Time'}
            </p>
            <p className={`text-4xl font-mono font-bold ${
              localSession.status === 'in_progress' ? 'text-yellow-700' :
              localSession.status === 'paused' ? 'text-orange-700' :
              'text-gray-700'
            }`}>
              {localSession.status === 'complete'
                ? formatTime((localSession.totalDurationMinutes || 0) * 60)
                : formatTime(elapsedTime)
              }
            </p>
            {localSession.status === 'paused' && (
              <p className="text-sm text-orange-600 mt-1 flex items-center gap-1">
                <Pause className="w-4 h-4" />
                Session paused
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {localSession.status === 'scheduled' && (
              <button
                onClick={handleStart}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-lg font-medium"
              >
                <Play className="w-6 h-6" />
                Start Session
              </button>
            )}
            {localSession.status === 'in_progress' && (
              <>
                <button
                  onClick={handlePause}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  <Pause className="w-5 h-5" />
                  Pause
                </button>
                <button
                  onClick={handleComplete}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Square className="w-5 h-5" />
                  Complete
                </button>
              </>
            )}
            {localSession.status === 'paused' && (
              <>
                <button
                  onClick={handleResume}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-lg font-medium"
                >
                  <Play className="w-6 h-6" />
                  Resume Session
                </button>
                <button
                  onClick={handleComplete}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <Square className="w-5 h-5" />
                  Complete
                </button>
              </>
            )}
          </div>
        </div>

        {/* Pause history */}
        {localSession.pauseHistory?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">
              Paused {localSession.pauseHistory.length} time{localSession.pauseHistory.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {/* Environmental Conditions */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection('conditions')}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100"
        >
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-gray-400" />
            Environmental Conditions
          </h3>
          {expandedSections.conditions ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.conditions && (
          <div className="p-4">
            {editingConditions ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Location</label>
                    <input
                      type="text"
                      value={conditions.location || ''}
                      onChange={(e) => setConditions(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Weather</label>
                    <select
                      value={conditions.weather || ''}
                      onChange={(e) => setConditions(prev => ({ ...prev, weather: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">Select...</option>
                      <option value="clear">Clear</option>
                      <option value="partly_cloudy">Partly Cloudy</option>
                      <option value="overcast">Overcast</option>
                      <option value="light_rain">Light Rain</option>
                      <option value="fog">Fog/Mist</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Temperature (°C)</label>
                    <input
                      type="number"
                      value={conditions.temperature || ''}
                      onChange={(e) => setConditions(prev => ({ ...prev, temperature: e.target.value ? parseFloat(e.target.value) : null }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Wind Speed (km/h)</label>
                    <input
                      type="number"
                      value={conditions.windSpeed || ''}
                      onChange={(e) => setConditions(prev => ({ ...prev, windSpeed: e.target.value ? parseFloat(e.target.value) : null }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Wind Direction</label>
                    <input
                      type="text"
                      value={conditions.windDirection || ''}
                      onChange={(e) => setConditions(prev => ({ ...prev, windDirection: e.target.value }))}
                      placeholder="e.g., NW"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Visibility</label>
                    <select
                      value={conditions.visibility || ''}
                      onChange={(e) => setConditions(prev => ({ ...prev, visibility: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">Select...</option>
                      <option value="excellent">Excellent (&gt;10km)</option>
                      <option value="good">Good (5-10km)</option>
                      <option value="moderate">Moderate (2-5km)</option>
                      <option value="poor">Poor (&lt;2km)</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setConditions(localSession.conditions || {})
                      setEditingConditions(false)
                    }}
                    className="px-3 py-1.5 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveConditions}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div className="grid grid-cols-3 gap-4">
                  {conditions.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{conditions.location}</span>
                    </div>
                  )}
                  {conditions.weather && (
                    <div className="flex items-center gap-2 text-sm">
                      <Cloud className="w-4 h-4 text-gray-400" />
                      <span className="capitalize">{conditions.weather.replace('_', ' ')}</span>
                    </div>
                  )}
                  {conditions.temperature !== null && conditions.temperature !== undefined && (
                    <div className="flex items-center gap-2 text-sm">
                      <Thermometer className="w-4 h-4 text-gray-400" />
                      <span>{conditions.temperature}°C</span>
                    </div>
                  )}
                  {conditions.windSpeed !== null && conditions.windSpeed !== undefined && (
                    <div className="flex items-center gap-2 text-sm">
                      <Wind className="w-4 h-4 text-gray-400" />
                      <span>{conditions.windSpeed} km/h {conditions.windDirection}</span>
                    </div>
                  )}
                  {conditions.visibility && (
                    <div className="flex items-center gap-2 text-sm">
                      <Eye className="w-4 h-4 text-gray-400" />
                      <span className="capitalize">{conditions.visibility}</span>
                    </div>
                  )}
                </div>
                {canEdit && (
                  <button
                    onClick={() => setEditingConditions(true)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pre-Test Checklist */}
      {localSession.preTestChecklist?.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('preTest')}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100"
          >
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              Pre-Test Checklist
              <span className="text-sm text-gray-500">
                ({localSession.preTestChecklist.filter(i => i.completed).length}/{localSession.preTestChecklist.length})
              </span>
            </h3>
            {expandedSections.preTest ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {expandedSections.preTest && (
            <div className="p-4 space-y-2">
              {localSession.preTestChecklist.map((item, index) => (
                <label
                  key={index}
                  className={`flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-gray-50 ${
                    item.completed ? 'text-gray-500' : 'text-gray-900'
                  }`}
                >
                  <button
                    onClick={() => toggleChecklistItem('preTest', index)}
                    disabled={!canEdit}
                    className="flex-shrink-0"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300" />
                    )}
                  </button>
                  <span className={item.completed ? 'line-through' : ''}>{item.text}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* In-Test Checklist */}
      {localSession.inTestChecklist?.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('inTest')}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100"
          >
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              In-Test Checklist
              <span className="text-sm text-gray-500">
                ({localSession.inTestChecklist.filter(i => i.completed).length}/{localSession.inTestChecklist.length})
              </span>
            </h3>
            {expandedSections.inTest ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {expandedSections.inTest && (
            <div className="p-4 space-y-2">
              {localSession.inTestChecklist.map((item, index) => (
                <label
                  key={index}
                  className={`flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-gray-50 ${
                    item.completed ? 'text-gray-500' : 'text-gray-900'
                  }`}
                >
                  <button
                    onClick={() => toggleChecklistItem('inTest', index)}
                    disabled={!canEdit}
                    className="flex-shrink-0"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300" />
                    )}
                  </button>
                  <span className={item.completed ? 'line-through' : ''}>{item.text}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Observations & Issues */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection('observations')}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100"
        >
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-gray-400" />
            Observations & Issues
          </h3>
          {expandedSections.observations ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.observations && (
          <div className="p-4 space-y-4">
            {/* Observations */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Observations</h4>
              {observations.length > 0 && (
                <div className="space-y-2 mb-3">
                  {observations.map((obs, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded text-sm">
                      <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p>{obs.text}</p>
                        {obs.timestamp && (
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(obs.timestamp).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {canEdit && isActive && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newObservation}
                    onChange={(e) => setNewObservation(e.target.value)}
                    placeholder="Add observation..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && addObservation()}
                  />
                  <button
                    onClick={addObservation}
                    disabled={!newObservation.trim()}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Issues */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                Issues
              </h4>
              {issues.length > 0 && (
                <div className="space-y-2 mb-3">
                  {issues.map((issue, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-2 p-2 rounded text-sm ${
                        issue.resolved ? 'bg-green-50' : 'bg-orange-50'
                      }`}
                    >
                      <button
                        onClick={() => toggleIssueResolved(index)}
                        disabled={!canEdit}
                        className="flex-shrink-0 mt-0.5"
                      >
                        {issue.resolved ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                        )}
                      </button>
                      <div className="flex-1">
                        <p className={issue.resolved ? 'line-through text-gray-500' : ''}>{issue.text}</p>
                        {issue.timestamp && (
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(issue.timestamp).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {canEdit && isActive && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newIssue}
                    onChange={(e) => setNewIssue(e.target.value)}
                    placeholder="Log an issue..."
                    className="flex-1 px-3 py-2 border border-orange-300 rounded-lg text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && addIssue()}
                  />
                  <button
                    onClick={addIssue}
                    disabled={!newIssue.trim()}
                    className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Post-Test Checklist */}
      {localSession.postTestChecklist?.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('postTest')}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100"
          >
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              Post-Test Checklist
              <span className="text-sm text-gray-500">
                ({localSession.postTestChecklist.filter(i => i.completed).length}/{localSession.postTestChecklist.length})
              </span>
            </h3>
            {expandedSections.postTest ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {expandedSections.postTest && (
            <div className="p-4 space-y-2">
              {localSession.postTestChecklist.map((item, index) => (
                <label
                  key={index}
                  className={`flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-gray-50 ${
                    item.completed ? 'text-gray-500' : 'text-gray-900'
                  }`}
                >
                  <button
                    onClick={() => toggleChecklistItem('postTest', index)}
                    disabled={!canEdit}
                    className="flex-shrink-0"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300" />
                    )}
                  </button>
                  <span className={item.completed ? 'line-through' : ''}>{item.text}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Results Summary */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection('results')}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100"
        >
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-400" />
            Test Results
          </h3>
          {expandedSections.results ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.results && (
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Test Outcome</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setPassed(true)}
                  disabled={!canEdit}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 ${
                    passed === true
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Passed
                </button>
                <button
                  onClick={() => setPassed(false)}
                  disabled={!canEdit}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 ${
                    passed === false
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <AlertCircle className="w-5 h-5" />
                  Failed
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Results Summary</label>
              <textarea
                value={resultsSummary}
                onChange={(e) => setResultsSummary(e.target.value)}
                disabled={!canEdit}
                rows={4}
                placeholder="Summarize the test results, key findings, and any follow-up actions required..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {canEdit && (
              <div className="flex justify-end">
                <button
                  onClick={saveResults}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Save className="w-4 h-4" />
                  Save Results
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Linked Requirements */}
      {localSession.linkedRequirements?.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-medium text-gray-900 mb-3">Linked Requirements</h3>
          <div className="flex flex-wrap gap-2">
            {localSession.linkedRequirements.map(reqId => (
              <span
                key={reqId}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700"
              >
                {reqId}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
