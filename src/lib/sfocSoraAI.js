/**
 * SFOC & SORA AI Service
 * Client-side interface for SFOC/SORA AI Cloud Functions
 *
 * @version 1.0.0
 */

import { useState, useCallback } from 'react'
import { getFunctions, httpsCallable } from 'firebase/functions'

// ============================================
// Initialize Functions
// ============================================

const functions = getFunctions()

// SFOC Cloud function references
const askSFOCQuestionFn = httpsCallable(functions, 'askSFOCQuestion')
const getSFOCDocumentGuidanceFn = httpsCallable(functions, 'getSFOCDocumentGuidance')

// SORA Cloud function references
const askSORAQuestionFn = httpsCallable(functions, 'askSORAQuestion')
const getSORAStepGuidanceFn = httpsCallable(functions, 'getSORAStepGuidance')
const recommendMitigationsFn = httpsCallable(functions, 'recommendMitigations')
const getOSOGuidanceFn = httpsCallable(functions, 'getOSOGuidance')
const analyzeConOpsFn = httpsCallable(functions, 'analyzeConOps')

// ============================================
// Conversation History Management
// ============================================

// In-memory cache for conversation context
const sfocConversationCache = new Map()
const soraConversationCache = new Map()

/**
 * Get or create SFOC conversation context
 */
function getSFOCConversationContext(sfocId) {
  if (!sfocConversationCache.has(sfocId)) {
    sfocConversationCache.set(sfocId, {
      messages: [],
      lastActivity: Date.now()
    })
  }
  return sfocConversationCache.get(sfocId)
}

/**
 * Get or create SORA conversation context
 */
function getSORAConversationContext(soraId) {
  if (!soraConversationCache.has(soraId)) {
    soraConversationCache.set(soraId, {
      messages: [],
      lastActivity: Date.now()
    })
  }
  return soraConversationCache.get(soraId)
}

/**
 * Add message to SFOC conversation
 */
function addToSFOCConversation(sfocId, role, content) {
  const context = getSFOCConversationContext(sfocId)
  context.messages.push({ role, content, timestamp: Date.now() })
  context.lastActivity = Date.now()

  if (context.messages.length > 20) {
    context.messages = context.messages.slice(-20)
  }
}

/**
 * Add message to SORA conversation
 */
function addToSORAConversation(soraId, role, content) {
  const context = getSORAConversationContext(soraId)
  context.messages.push({ role, content, timestamp: Date.now() })
  context.lastActivity = Date.now()

  if (context.messages.length > 20) {
    context.messages = context.messages.slice(-20)
  }
}

/**
 * Clear SFOC conversation
 */
export function clearSFOCConversation(sfocId) {
  sfocConversationCache.delete(sfocId)
}

/**
 * Clear SORA conversation
 */
export function clearSORAConversation(soraId) {
  soraConversationCache.delete(soraId)
}

/**
 * Clean up stale conversations
 */
function cleanupStaleConversations() {
  const oneHourAgo = Date.now() - (60 * 60 * 1000)

  for (const [id, context] of sfocConversationCache) {
    if (context.lastActivity < oneHourAgo) {
      sfocConversationCache.delete(id)
    }
  }

  for (const [id, context] of soraConversationCache) {
    if (context.lastActivity < oneHourAgo) {
      soraConversationCache.delete(id)
    }
  }
}

// Clean up every 30 minutes
setInterval(cleanupStaleConversations, 30 * 60 * 1000)

// ============================================
// Error Handling
// ============================================

/**
 * Standardized error handling for AI calls
 */
function handleAIError(error) {
  console.error('SFOC/SORA AI Error:', error)

  if (error.code === 'functions/resource-exhausted') {
    return {
      success: false,
      error: 'Rate limit exceeded. Please wait a moment and try again.',
      errorCode: 'RATE_LIMIT'
    }
  }

  if (error.code === 'functions/permission-denied') {
    return {
      success: false,
      error: 'You do not have permission to use this feature.',
      errorCode: 'PERMISSION_DENIED'
    }
  }

  if (error.code === 'functions/failed-precondition') {
    return {
      success: false,
      error: 'AI service is not configured. Please contact support.',
      errorCode: 'SERVICE_UNAVAILABLE'
    }
  }

  if (error.code === 'functions/unauthenticated') {
    return {
      success: false,
      error: 'Please log in to use this feature.',
      errorCode: 'UNAUTHENTICATED'
    }
  }

  if (error.code === 'functions/not-found') {
    return {
      success: false,
      error: 'The requested resource was not found.',
      errorCode: 'NOT_FOUND'
    }
  }

  return {
    success: false,
    error: error.message || 'An unexpected error occurred. Please try again.',
    errorCode: 'UNKNOWN'
  }
}

// ============================================
// SFOC AI Service Functions
// ============================================

/**
 * Ask a question about SFOC requirements
 * @param {string} sfocId - The SFOC application ID
 * @param {string} question - The user's question
 * @param {string} applicationContext - Optional additional context
 * @returns {Promise<Object>} AI response or error
 */
export async function askSFOCQuestion(sfocId, question, applicationContext = null) {
  try {
    addToSFOCConversation(sfocId, 'user', question)

    const result = await askSFOCQuestionFn({
      sfocId,
      question,
      applicationContext
    })

    addToSFOCConversation(sfocId, 'assistant', result.data.message)

    return {
      success: true,
      message: result.data.message,
      tokenUsage: result.data.tokenUsage
    }
  } catch (error) {
    return handleAIError(error)
  }
}

/**
 * Get guidance for a specific SFOC document type
 * @param {string} sfocId - The SFOC application ID
 * @param {string} documentType - Type of document (conops, safety_plan, erp, etc.)
 * @returns {Promise<Object>} Guidance or error
 */
export async function getSFOCDocumentGuidance(sfocId, documentType) {
  try {
    const result = await getSFOCDocumentGuidanceFn({
      sfocId,
      documentType
    })

    return {
      success: true,
      documentType: result.data.documentType,
      documentName: result.data.documentName,
      guidance: result.data.guidance,
      tokenUsage: result.data.tokenUsage
    }
  } catch (error) {
    return handleAIError(error)
  }
}

// ============================================
// SORA AI Service Functions
// ============================================

/**
 * Ask a question about SORA assessment
 * @param {string} soraId - The SORA assessment ID
 * @param {string} question - The user's question
 * @param {string} assessmentContext - Optional additional context
 * @returns {Promise<Object>} AI response or error
 */
export async function askSORAQuestion(soraId, question, assessmentContext = null) {
  try {
    addToSORAConversation(soraId, 'user', question)

    const result = await askSORAQuestionFn({
      soraId,
      question,
      assessmentContext
    })

    addToSORAConversation(soraId, 'assistant', result.data.message)

    return {
      success: true,
      message: result.data.message,
      tokenUsage: result.data.tokenUsage
    }
  } catch (error) {
    return handleAIError(error)
  }
}

/**
 * Get step-by-step guidance for a SORA step
 * @param {string} soraId - The SORA assessment ID
 * @param {string} step - The step identifier (conops, grc, arc, sail, oso, containment, portfolio)
 * @returns {Promise<Object>} Step guidance or error
 */
export async function getSORAStepGuidance(soraId, step) {
  try {
    const result = await getSORAStepGuidanceFn({
      soraId,
      step
    })

    return {
      success: true,
      step: result.data.step,
      stepName: result.data.stepName,
      guidance: result.data.guidance,
      tokenUsage: result.data.tokenUsage
    }
  } catch (error) {
    return handleAIError(error)
  }
}

/**
 * Get mitigation recommendations
 * @param {string} soraId - The SORA assessment ID
 * @param {number} targetGRC - Optional target final GRC
 * @param {string} targetARC - Optional target residual ARC
 * @returns {Promise<Object>} Recommendations or error
 */
export async function getRecommendedMitigations(soraId, targetGRC = null, targetARC = null) {
  try {
    const result = await recommendMitigationsFn({
      soraId,
      targetGRC,
      targetARC
    })

    return {
      success: true,
      recommendations: result.data.recommendations,
      currentState: result.data.currentState,
      tokenUsage: result.data.tokenUsage
    }
  } catch (error) {
    return handleAIError(error)
  }
}

/**
 * Get guidance for a specific OSO
 * @param {string} soraId - The SORA assessment ID
 * @param {string} osoId - The OSO identifier (e.g., 'OSO-01')
 * @param {string} requiredRobustness - The required robustness level
 * @returns {Promise<Object>} OSO guidance or error
 */
export async function getOSOGuidance(soraId, osoId, requiredRobustness = null) {
  try {
    const result = await getOSOGuidanceFn({
      soraId,
      osoId,
      requiredRobustness
    })

    return {
      success: true,
      osoId: result.data.osoId,
      requiredRobustness: result.data.requiredRobustness,
      guidance: result.data.guidance,
      tokenUsage: result.data.tokenUsage
    }
  } catch (error) {
    return handleAIError(error)
  }
}

/**
 * Analyze ConOps for completeness
 * @param {string} soraId - The SORA assessment ID
 * @param {string} conopsText - The ConOps text to analyze
 * @returns {Promise<Object>} Analysis or error
 */
export async function analyzeConOps(soraId, conopsText) {
  try {
    const result = await analyzeConOpsFn({
      soraId,
      conopsText
    })

    return {
      success: true,
      analysis: result.data.analysis,
      tokenUsage: result.data.tokenUsage
    }
  } catch (error) {
    return handleAIError(error)
  }
}

// ============================================
// React Hooks
// ============================================

/**
 * Custom hook for SFOC AI interactions
 * @param {string} sfocId - The SFOC application ID
 * @returns {Object} AI state and functions
 */
export function useSFOCAI(sfocId) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastResponse, setLastResponse] = useState(null)

  const ask = useCallback(async (question, context = null) => {
    setLoading(true)
    setError(null)

    try {
      const result = await askSFOCQuestion(sfocId, question, context)

      if (result.success) {
        setLastResponse(result.message)
        return result
      } else {
        setError(result.error)
        return result
      }
    } finally {
      setLoading(false)
    }
  }, [sfocId])

  const getDocumentGuidance = useCallback(async (documentType) => {
    setLoading(true)
    setError(null)

    try {
      const result = await getSFOCDocumentGuidance(sfocId, documentType)

      if (result.success) {
        setLastResponse(result.guidance)
        return result
      } else {
        setError(result.error)
        return result
      }
    } finally {
      setLoading(false)
    }
  }, [sfocId])

  const clearHistory = useCallback(() => {
    clearSFOCConversation(sfocId)
    setLastResponse(null)
    setError(null)
  }, [sfocId])

  return {
    loading,
    error,
    lastResponse,
    ask,
    getDocumentGuidance,
    clearHistory
  }
}

/**
 * Custom hook for SORA AI interactions
 * @param {string} soraId - The SORA assessment ID
 * @returns {Object} AI state and functions
 */
export function useSORAI(soraId) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastResponse, setLastResponse] = useState(null)

  const ask = useCallback(async (question, context = null) => {
    setLoading(true)
    setError(null)

    try {
      const result = await askSORAQuestion(soraId, question, context)

      if (result.success) {
        setLastResponse(result.message)
        return result
      } else {
        setError(result.error)
        return result
      }
    } finally {
      setLoading(false)
    }
  }, [soraId])

  const getStepGuidance = useCallback(async (step) => {
    setLoading(true)
    setError(null)

    try {
      const result = await getSORAStepGuidance(soraId, step)

      if (result.success) {
        setLastResponse(result.guidance)
        return result
      } else {
        setError(result.error)
        return result
      }
    } finally {
      setLoading(false)
    }
  }, [soraId])

  const getMitigationAdvice = useCallback(async (targetGRC = null, targetARC = null) => {
    setLoading(true)
    setError(null)

    try {
      const result = await getRecommendedMitigations(soraId, targetGRC, targetARC)

      if (result.success) {
        setLastResponse(result.recommendations)
        return result
      } else {
        setError(result.error)
        return result
      }
    } finally {
      setLoading(false)
    }
  }, [soraId])

  const getOSOHelp = useCallback(async (osoId, requiredRobustness = null) => {
    setLoading(true)
    setError(null)

    try {
      const result = await getOSOGuidance(soraId, osoId, requiredRobustness)

      if (result.success) {
        setLastResponse(result.guidance)
        return result
      } else {
        setError(result.error)
        return result
      }
    } finally {
      setLoading(false)
    }
  }, [soraId])

  const analyzeConOpsText = useCallback(async (conopsText) => {
    setLoading(true)
    setError(null)

    try {
      const result = await analyzeConOps(soraId, conopsText)

      if (result.success) {
        setLastResponse(result.analysis)
        return result
      } else {
        setError(result.error)
        return result
      }
    } finally {
      setLoading(false)
    }
  }, [soraId])

  const clearHistory = useCallback(() => {
    clearSORAConversation(soraId)
    setLastResponse(null)
    setError(null)
  }, [soraId])

  return {
    loading,
    error,
    lastResponse,
    ask,
    getStepGuidance,
    getMitigationAdvice,
    getOSOHelp,
    analyzeConOpsText,
    clearHistory
  }
}

// ============================================
// Utility Functions
// ============================================

/**
 * Format AI response for display
 * @param {string} response - The AI response text
 * @returns {string} Formatted response
 */
export function formatAIResponse(response) {
  if (!response) return ''
  return response
}

/**
 * Extract sections from AI response
 * @param {string} response - The AI response text
 * @returns {Object} Parsed sections
 */
export function parseAIResponse(response) {
  if (!response) return {}

  const sections = {}
  const lines = response.split('\n')
  let currentSection = 'content'
  let currentContent = []

  for (const line of lines) {
    const headerMatch = line.match(/^##\s+(.+)$/)
    if (headerMatch) {
      if (currentContent.length > 0) {
        sections[currentSection] = currentContent.join('\n').trim()
      }
      currentSection = headerMatch[1].toLowerCase().replace(/\s+/g, '_')
      currentContent = []
    } else {
      currentContent.push(line)
    }
  }

  if (currentContent.length > 0) {
    sections[currentSection] = currentContent.join('\n').trim()
  }

  return sections
}

// ============================================
// Export All
// ============================================

export default {
  // SFOC Functions
  askSFOCQuestion,
  getSFOCDocumentGuidance,
  clearSFOCConversation,
  useSFOCAI,
  // SORA Functions
  askSORAQuestion,
  getSORAStepGuidance,
  getRecommendedMitigations,
  getOSOGuidance,
  analyzeConOps,
  clearSORAConversation,
  useSORAI,
  // Utilities
  formatAIResponse,
  parseAIResponse
}
