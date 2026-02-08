/**
 * useExportEnhancement Hook
 * React hook for managing AI-enhanced export content
 *
 * @location src/hooks/useExportEnhancement.js
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  requestExportEnhancement,
  getCachedEnhancement,
  invalidateCache,
  subscribeToCacheUpdates,
  getCacheStatus
} from '../lib/exportEnhancementService'
import { logger } from '../lib/logger'

/**
 * Hook for managing export enhancement state and operations
 * @param {string} projectId - The project ID
 * @returns {object} Enhancement state and methods
 */
export function useExportEnhancement(projectId) {
  const [enhancedContent, setEnhancedContent] = useState({})
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [enhancingType, setEnhancingType] = useState(null)
  const [cacheStatus, setCacheStatus] = useState({})
  const [error, setError] = useState(null)

  const unsubscribesRef = useRef({})
  const mountedRef = useRef(true)

  // Load cache status on mount
  useEffect(() => {
    mountedRef.current = true

    const loadCacheStatus = async () => {
      if (!projectId) return

      try {
        const status = await getCacheStatus(projectId)
        if (mountedRef.current) {
          setCacheStatus(status.cacheStatus || {})
        }
      } catch (err) {
        logger.warn('Failed to load cache status:', err)
      }
    }

    loadCacheStatus()

    return () => {
      mountedRef.current = false
      // Cleanup all subscriptions
      Object.values(unsubscribesRef.current).forEach(unsub => {
        if (typeof unsub === 'function') unsub()
      })
      unsubscribesRef.current = {}
    }
  }, [projectId])

  /**
   * Request enhancement for a specific export type
   */
  const enhance = useCallback(async (exportType, options = {}) => {
    if (!projectId) {
      setError(new Error('No project ID provided'))
      return null
    }

    setIsEnhancing(true)
    setEnhancingType(exportType)
    setError(null)

    try {
      // First check cache unless force refresh
      if (!options.forceRefresh) {
        const cached = await getCachedEnhancement(projectId, exportType)
        if (cached) {
          if (mountedRef.current) {
            setEnhancedContent(prev => ({
              ...prev,
              [exportType]: cached.enhanced
            }))
            setCacheStatus(prev => ({
              ...prev,
              [exportType]: cached.metadata
            }))
          }
          return cached
        }
      }

      // Request new enhancement
      const result = await requestExportEnhancement(projectId, exportType, options)

      if (mountedRef.current) {
        setEnhancedContent(prev => ({
          ...prev,
          [exportType]: result.enhanced
        }))
        setCacheStatus(prev => ({
          ...prev,
          [exportType]: result.metadata
        }))
      }

      // Set up subscription for this export type
      if (!unsubscribesRef.current[exportType]) {
        unsubscribesRef.current[exportType] = subscribeToCacheUpdates(
          projectId,
          exportType,
          (update) => {
            if (mountedRef.current && update.exists) {
              setEnhancedContent(prev => ({
                ...prev,
                [exportType]: update.enhanced
              }))
              setCacheStatus(prev => ({
                ...prev,
                [exportType]: update.metadata
              }))
            }
          }
        )
      }

      return result
    } catch (err) {
      logger.error('Enhancement failed:', err)
      if (mountedRef.current) {
        setError(err)
      }
      return null
    } finally {
      if (mountedRef.current) {
        setIsEnhancing(false)
        setEnhancingType(null)
      }
    }
  }, [projectId])

  /**
   * Force refresh enhancement for an export type
   */
  const forceRefresh = useCallback(async (exportType) => {
    return enhance(exportType, { forceRefresh: true })
  }, [enhance])

  /**
   * Check if an export type has cached enhancement
   */
  const isCached = useCallback((exportType) => {
    return !!cacheStatus[exportType]
  }, [cacheStatus])

  /**
   * Get the cached timestamp for an export type
   */
  const getCachedAt = useCallback((exportType) => {
    const status = cacheStatus[exportType]
    if (!status?.cachedAt) return null

    // Handle Firestore Timestamp
    if (status.cachedAt.toDate) {
      return status.cachedAt.toDate()
    }
    // Handle ISO string
    if (typeof status.cachedAt === 'string') {
      return new Date(status.cachedAt)
    }
    return null
  }, [cacheStatus])

  /**
   * Get enhanced content for a specific export type
   */
  const getEnhanced = useCallback((exportType) => {
    return enhancedContent[exportType] || null
  }, [enhancedContent])

  /**
   * Get a specific section from enhanced content
   */
  const getSection = useCallback((exportType, sectionKey) => {
    const content = enhancedContent[exportType]
    if (!content) return null
    return content[sectionKey] || null
  }, [enhancedContent])

  /**
   * Invalidate cache for an export type
   */
  const invalidate = useCallback(async (exportType = null) => {
    if (!projectId) return

    try {
      await invalidateCache(projectId, exportType)

      if (mountedRef.current) {
        if (exportType) {
          // Clear specific type
          setEnhancedContent(prev => {
            const next = { ...prev }
            delete next[exportType]
            return next
          })
          setCacheStatus(prev => {
            const next = { ...prev }
            delete next[exportType]
            return next
          })
        } else {
          // Clear all
          setEnhancedContent({})
          setCacheStatus({})
        }
      }
    } catch (err) {
      logger.error('Failed to invalidate cache:', err)
      throw err
    }
  }, [projectId])

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // State
    enhancedContent,
    isEnhancing,
    enhancingType,
    cacheStatus,
    error,

    // Methods
    enhance,
    forceRefresh,
    invalidate,
    clearError,

    // Helpers
    isCached,
    getCachedAt,
    getEnhanced,
    getSection
  }
}

/**
 * Hook for a single export type enhancement
 * Simplified version for components that only need one type
 * @param {string} projectId - The project ID
 * @param {string} exportType - The export type
 */
export function useSingleExportEnhancement(projectId, exportType) {
  const {
    enhancedContent,
    isEnhancing,
    enhancingType,
    cacheStatus,
    error,
    enhance,
    forceRefresh,
    isCached,
    getCachedAt,
    getEnhanced,
    getSection,
    invalidate,
    clearError
  } = useExportEnhancement(projectId)

  return {
    enhanced: getEnhanced(exportType),
    isEnhancing: isEnhancing && enhancingType === exportType,
    isCached: isCached(exportType),
    cachedAt: getCachedAt(exportType),
    error,

    enhance: useCallback((options) => enhance(exportType, options), [enhance, exportType]),
    forceRefresh: useCallback(() => forceRefresh(exportType), [forceRefresh, exportType]),
    invalidate: useCallback(() => invalidate(exportType), [invalidate, exportType]),
    getSection: useCallback((key) => getSection(exportType, key), [getSection, exportType]),
    clearError
  }
}

export default useExportEnhancement
