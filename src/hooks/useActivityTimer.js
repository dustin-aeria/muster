/**
 * useActivityTimer.js
 * React hook for real-time activity timer with pause/resume support
 *
 * Features:
 * - Real-time elapsed time tracking
 * - Pause/resume support
 * - Automatic sync with Firestore
 * - Multiple concurrent timers support
 *
 * @location src/hooks/useActivityTimer.js
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  getActivityById,
  startActivity,
  pauseActivity,
  resumeActivity,
  completeActivity,
  updateActivity,
  calculateElapsedSeconds
} from '../lib/firestoreActivities'
import { logger } from '../lib/logger'

/**
 * Hook for managing a single activity timer
 * @param {string|null} activityId - Activity ID to track (null for new activity)
 * @returns {Object} Timer state and controls
 */
export function useActivityTimer(activityId = null) {
  const [activity, setActivity] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [status, setStatus] = useState('idle') // idle, active, paused, completed
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const intervalRef = useRef(null)
  const activityIdRef = useRef(activityId)

  // Load activity if ID provided
  useEffect(() => {
    if (activityId && activityId !== activityIdRef.current) {
      activityIdRef.current = activityId
      loadActivity(activityId)
    }
  }, [activityId])

  // Timer interval effect
  useEffect(() => {
    if (status === 'active') {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [status])

  /**
   * Load activity from Firestore
   */
  const loadActivity = useCallback(async (id) => {
    try {
      setLoading(true)
      setError(null)
      const data = await getActivityById(id)
      setActivity(data)
      setStatus(data.status)
      setElapsed(calculateElapsedSeconds(data))
    } catch (err) {
      logger.error('Failed to load activity:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Start a new activity
   * @param {Object} data - Activity data
   * @param {string} organizationId - Organization ID
   * @returns {Promise<Object>} Created activity
   */
  const start = useCallback(async (data, organizationId) => {
    try {
      setLoading(true)
      setError(null)
      const newActivity = await startActivity(data, organizationId)
      setActivity(newActivity)
      activityIdRef.current = newActivity.id
      setStatus('active')
      setElapsed(0)
      return newActivity
    } catch (err) {
      logger.error('Failed to start activity:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Pause the current activity
   */
  const pause = useCallback(async () => {
    if (!activityIdRef.current || status !== 'active') return

    try {
      setLoading(true)
      setError(null)
      await pauseActivity(activityIdRef.current)
      setStatus('paused')
      // Reload to get accurate pausedAt timestamp
      await loadActivity(activityIdRef.current)
    } catch (err) {
      logger.error('Failed to pause activity:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [status, loadActivity])

  /**
   * Resume the paused activity
   */
  const resume = useCallback(async () => {
    if (!activityIdRef.current || status !== 'paused') return

    try {
      setLoading(true)
      setError(null)
      await resumeActivity(activityIdRef.current)
      setStatus('active')
      // Reload to get accurate totalPausedSeconds
      await loadActivity(activityIdRef.current)
    } catch (err) {
      logger.error('Failed to resume activity:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [status, loadActivity])

  /**
   * Complete/stop the activity
   * @param {Object} finalData - Optional final notes/findings
   */
  const stop = useCallback(async (finalData = {}) => {
    if (!activityIdRef.current) return

    try {
      setLoading(true)
      setError(null)
      await completeActivity(activityIdRef.current, finalData)
      setStatus('completed')
      // Reload to get final totalSeconds
      await loadActivity(activityIdRef.current)
    } catch (err) {
      logger.error('Failed to complete activity:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [loadActivity])

  /**
   * Update activity details
   * @param {Object} data - Updated data
   */
  const update = useCallback(async (data) => {
    if (!activityIdRef.current) return

    try {
      setLoading(true)
      setError(null)
      await updateActivity(activityIdRef.current, data)
      setActivity(prev => ({ ...prev, ...data }))
    } catch (err) {
      logger.error('Failed to update activity:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Reset the timer (for starting a new activity)
   */
  const reset = useCallback(() => {
    setActivity(null)
    setElapsed(0)
    setStatus('idle')
    setError(null)
    activityIdRef.current = null
  }, [])

  /**
   * Refresh activity from Firestore
   */
  const refresh = useCallback(async () => {
    if (activityIdRef.current) {
      await loadActivity(activityIdRef.current)
    }
  }, [loadActivity])

  return {
    // State
    activity,
    activityId: activityIdRef.current,
    elapsed,
    status,
    loading,
    error,

    // Controls
    start,
    pause,
    resume,
    stop,
    update,
    reset,
    refresh
  }
}

/**
 * Hook for tracking multiple concurrent activity timers
 * @param {string} organizationId - Organization ID
 * @param {string} operatorId - Operator ID
 * @returns {Object} Active timers and controls
 */
export function useActiveTimers(organizationId, operatorId) {
  const [activeActivities, setActiveActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const intervalsRef = useRef({})

  /**
   * Load all active/paused activities for the operator
   */
  const loadActiveActivities = useCallback(async () => {
    if (!organizationId || !operatorId) return

    try {
      setLoading(true)
      setError(null)

      // Import here to avoid circular dependency
      const { getActiveActivities } = await import('../lib/firestoreActivities')
      const activities = await getActiveActivities(organizationId, operatorId)

      // Calculate elapsed for each
      const withElapsed = activities.map(activity => ({
        ...activity,
        currentElapsed: calculateElapsedSeconds(activity)
      }))

      setActiveActivities(withElapsed)
    } catch (err) {
      logger.error('Failed to load active activities:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [organizationId, operatorId])

  // Load on mount and when dependencies change
  useEffect(() => {
    loadActiveActivities()
  }, [loadActiveActivities])

  // Update elapsed times every second for active activities
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveActivities(prev =>
        prev.map(activity => {
          if (activity.status === 'active') {
            return {
              ...activity,
              currentElapsed: calculateElapsedSeconds(activity)
            }
          }
          return activity
        })
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  /**
   * Get count of active timers
   */
  const activeCount = activeActivities.filter(a => a.status === 'active').length
  const pausedCount = activeActivities.filter(a => a.status === 'paused').length
  const totalCount = activeActivities.length

  return {
    activities: activeActivities,
    activeCount,
    pausedCount,
    totalCount,
    loading,
    error,
    refresh: loadActiveActivities
  }
}

export default useActivityTimer
