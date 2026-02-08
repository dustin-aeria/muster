/**
 * Export Enhancement Service
 * Client-side service for requesting AI-enhanced export content
 *
 * @location src/lib/exportEnhancementService.js
 */

import { getFunctions, httpsCallable } from 'firebase/functions'
import { getFirestore, doc, getDoc, onSnapshot } from 'firebase/firestore'
import { logger } from './logger'

const functions = getFunctions()
const db = getFirestore()

// ============================================
// Cloud Function Calls
// ============================================

/**
 * Request enhanced content for an export
 * @param {string} projectId - The project ID
 * @param {string} exportType - Type of export (operations-plan, sora, hse-risk, etc.)
 * @param {object} options - Options including tone, forceRefresh
 * @returns {Promise<object>} Enhanced content and metadata
 */
export async function requestExportEnhancement(projectId, exportType, options = {}) {
  try {
    const enhanceExportContent = httpsCallable(functions, 'enhanceExportContent')

    const result = await enhanceExportContent({
      projectId,
      exportType,
      options: {
        tone: options.tone || 'professional',
        forceRefresh: options.forceRefresh || false
      }
    })

    if (!result.data.success) {
      throw new Error(result.data.error || 'Enhancement failed')
    }

    return result.data
  } catch (error) {
    logger.error('Export enhancement request failed:', error)

    // Rethrow with user-friendly message
    if (error.code === 'functions/resource-exhausted') {
      throw new Error('Rate limit exceeded. Please try again later.')
    }
    if (error.code === 'functions/failed-precondition') {
      throw new Error('AI service is not configured. Contact your administrator.')
    }
    if (error.code === 'functions/permission-denied') {
      throw new Error('You do not have permission to enhance this export.')
    }

    throw error
  }
}

/**
 * Get cached enhancement for a project/export type
 * @param {string} projectId - The project ID
 * @param {string} exportType - Type of export
 * @returns {Promise<object|null>} Cached enhancement or null if not cached/invalid
 */
export async function getCachedEnhancement(projectId, exportType) {
  try {
    const cacheKey = `${projectId}_${exportType}`
    const cacheRef = doc(db, 'exportEnhancements', cacheKey)
    const cacheSnap = await getDoc(cacheRef)

    if (!cacheSnap.exists()) {
      return null
    }

    const cached = cacheSnap.data()

    // Check if cache is for draft and expired (24 hours)
    if (cached.projectStatus === 'draft') {
      const age = Date.now() - cached.cachedAt.toMillis()
      const CACHE_TTL_MS = 24 * 60 * 60 * 1000
      if (age > CACHE_TTL_MS) {
        return null
      }
    }

    return {
      enhanced: cached.enhanced,
      metadata: {
        cachedAt: cached.cachedAt,
        projectHash: cached.projectHash,
        tokenUsage: cached.tokenUsage
      }
    }
  } catch (error) {
    logger.error('Failed to get cached enhancement:', error)
    return null
  }
}

/**
 * Invalidate cached enhancement for a project
 * @param {string} projectId - The project ID
 * @param {string} exportType - Optional specific export type to invalidate
 * @returns {Promise<void>}
 */
export async function invalidateCache(projectId, exportType = null) {
  try {
    const invalidateExportCache = httpsCallable(functions, 'invalidateExportCache')

    await invalidateExportCache({
      projectId,
      exportType
    })
  } catch (error) {
    logger.error('Failed to invalidate cache:', error)
    throw error
  }
}

/**
 * Get cache status for all export types of a project
 * @param {string} projectId - The project ID
 * @returns {Promise<object>} Cache status by export type
 */
export async function getCacheStatus(projectId) {
  try {
    const getExportCacheStatus = httpsCallable(functions, 'getExportCacheStatus')

    const result = await getExportCacheStatus({ projectId })

    if (!result.data.success) {
      throw new Error(result.data.error || 'Failed to get cache status')
    }

    return result.data
  } catch (error) {
    logger.error('Failed to get cache status:', error)
    throw error
  }
}

/**
 * Subscribe to cache updates for a project/export type
 * @param {string} projectId - The project ID
 * @param {string} exportType - Type of export
 * @param {function} onUpdate - Callback when cache changes
 * @returns {function} Unsubscribe function
 */
export function subscribeToCacheUpdates(projectId, exportType, onUpdate) {
  const cacheKey = `${projectId}_${exportType}`
  const cacheRef = doc(db, 'exportEnhancements', cacheKey)

  return onSnapshot(cacheRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data()
      onUpdate({
        exists: true,
        enhanced: data.enhanced,
        metadata: {
          cachedAt: data.cachedAt,
          projectHash: data.projectHash,
          tokenUsage: data.tokenUsage
        }
      })
    } else {
      onUpdate({ exists: false, enhanced: null, metadata: null })
    }
  }, (error) => {
    logger.error('Cache subscription error:', error)
    onUpdate({ exists: false, enhanced: null, metadata: null, error })
  })
}

// ============================================
// Enhanced Content Helpers
// ============================================

/**
 * Check if project data has changed since last cache
 * @param {object} project - Current project data
 * @param {string} cachedHash - Hash from cache metadata
 * @returns {boolean} True if project has changed
 */
export function hasProjectChanged(project, cachedHash) {
  const currentHash = generateSimpleHash(project)
  return currentHash !== cachedHash
}

/**
 * Generate a simple hash for project data (client-side version)
 * This is a simplified version for quick comparison
 */
function generateSimpleHash(project) {
  const relevantData = {
    name: project.name,
    clientName: project.clientName,
    status: project.status,
    sitesCount: project.sites?.length || 0,
    crewCount: project.crew?.length || 0,
    hasSora: !!project.soraAssessment,
    hasHse: !!project.hseRiskAssessment?.hazards?.length
  }

  // Simple string-based hash
  const str = JSON.stringify(relevantData)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16).substring(0, 8)
}

/**
 * Format enhanced content for display or injection
 * @param {object} enhanced - Enhanced content object
 * @param {string} sectionKey - Key of the section to format
 * @returns {string} Formatted text
 */
export function formatEnhancedSection(enhanced, sectionKey) {
  if (!enhanced || !enhanced[sectionKey]) {
    return null
  }

  const content = enhanced[sectionKey]

  // Clean up any residual formatting
  return content
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .trim()
}

/**
 * Get all available section keys from enhanced content
 * @param {object} enhanced - Enhanced content object
 * @returns {string[]} Array of section keys
 */
export function getEnhancedSections(enhanced) {
  if (!enhanced || typeof enhanced !== 'object') {
    return []
  }

  return Object.keys(enhanced)
}

/**
 * Merge enhanced content with default content
 * Falls back to default if enhanced section is missing
 * @param {object} enhanced - Enhanced content object
 * @param {object} defaults - Default content object
 * @returns {object} Merged content
 */
export function mergeWithDefaults(enhanced, defaults) {
  if (!enhanced) return defaults
  if (!defaults) return enhanced

  const merged = { ...defaults }

  for (const key of Object.keys(enhanced)) {
    if (enhanced[key] && enhanced[key].trim()) {
      merged[key] = enhanced[key]
    }
  }

  return merged
}

export default {
  requestExportEnhancement,
  getCachedEnhancement,
  invalidateCache,
  getCacheStatus,
  subscribeToCacheUpdates,
  hasProjectChanged,
  formatEnhancedSection,
  getEnhancedSections,
  mergeWithDefaults
}
