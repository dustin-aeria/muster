/**
 * Safety Declaration AI Service
 * Client-side interface for Safety Declaration AI Cloud Functions
 *
 * @version 1.0.0
 */

import { getFunctions, httpsCallable } from 'firebase/functions'

// ============================================
// Initialize Functions
// ============================================

const functions = getFunctions()

// Cloud function references
const askDeclarationQuestionFn = httpsCallable(functions, 'askDeclarationQuestion')
const verifyCalculationFn = httpsCallable(functions, 'verifyCalculation')
const recommendComplianceMethodFn = httpsCallable(functions, 'recommendComplianceMethod')
const generateRequirementGuidanceFn = httpsCallable(functions, 'generateRequirementGuidance')
const analyzeEvidenceFn = httpsCallable(functions, 'analyzeEvidence')
const getPreDeclarationGuidanceFn = httpsCallable(functions, 'getPreDeclarationGuidance')

// ============================================
// Conversation History Management
// ============================================

// In-memory cache for conversation context (per declaration)
const conversationCache = new Map()

/**
 * Get or create conversation context for a declaration
 */
function getConversationContext(declarationId) {
  if (!conversationCache.has(declarationId)) {
    conversationCache.set(declarationId, {
      messages: [],
      lastActivity: Date.now()
    })
  }
  return conversationCache.get(declarationId)
}

/**
 * Add message to conversation context
 */
function addToConversation(declarationId, role, content) {
  const context = getConversationContext(declarationId)
  context.messages.push({ role, content, timestamp: Date.now() })
  context.lastActivity = Date.now()

  // Keep only last 20 messages in cache
  if (context.messages.length > 20) {
    context.messages = context.messages.slice(-20)
  }
}

/**
 * Clear conversation context for a declaration
 */
export function clearConversation(declarationId) {
  conversationCache.delete(declarationId)
}

/**
 * Clean up stale conversations (older than 1 hour)
 */
function cleanupStaleConversations() {
  const oneHourAgo = Date.now() - (60 * 60 * 1000)
  for (const [id, context] of conversationCache) {
    if (context.lastActivity < oneHourAgo) {
      conversationCache.delete(id)
    }
  }
}

// Clean up stale conversations every 30 minutes
setInterval(cleanupStaleConversations, 30 * 60 * 1000)

// ============================================
// Error Handling
// ============================================

/**
 * Standardized error handling for AI calls
 */
function handleAIError(error) {
  console.error('Safety Declaration AI Error:', error)

  // Extract meaningful error message
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

  return {
    success: false,
    error: error.message || 'An unexpected error occurred. Please try again.',
    errorCode: 'UNKNOWN'
  }
}

// ============================================
// AI Service Functions
// ============================================

/**
 * Ask a question about safety declaration requirements
 * @param {string} declarationId - The declaration ID
 * @param {string} question - The user's question
 * @param {string} rpasContext - Optional additional context
 * @returns {Promise<Object>} AI response or error
 */
export async function askQuestion(declarationId, question, rpasContext = null) {
  try {
    // Add to local conversation
    addToConversation(declarationId, 'user', question)

    const result = await askDeclarationQuestionFn({
      declarationId,
      question,
      rpasContext
    })

    // Add response to local conversation
    addToConversation(declarationId, 'assistant', result.data.message)

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
 * Verify a calculation (kinetic energy or reliability)
 * @param {string} declarationId - The declaration ID
 * @param {string} calculationType - 'kinetic_energy' or 'reliability'
 * @param {Object} inputs - Calculation inputs
 * @returns {Promise<Object>} Verification result or error
 */
export async function verifyCalculation(declarationId, calculationType, inputs) {
  try {
    const result = await verifyCalculationFn({
      declarationId,
      calculationType,
      inputs
    })

    return {
      success: true,
      verification: result.data.verification,
      tokenUsage: result.data.tokenUsage
    }
  } catch (error) {
    return handleAIError(error)
  }
}

/**
 * Get compliance method recommendation for a requirement
 * @param {string} declarationId - The declaration ID
 * @param {string} requirementId - The requirement document ID
 * @param {string} rpasContext - Optional additional context
 * @returns {Promise<Object>} Recommendation or error
 */
export async function getComplianceRecommendation(declarationId, requirementId, rpasContext = null) {
  try {
    const result = await recommendComplianceMethodFn({
      declarationId,
      requirementId,
      rpasContext
    })

    return {
      success: true,
      recommendation: result.data.recommendation,
      requirementId: result.data.requirementId,
      tokenUsage: result.data.tokenUsage
    }
  } catch (error) {
    return handleAIError(error)
  }
}

/**
 * Generate detailed guidance for a requirement
 * @param {string} declarationId - The declaration ID
 * @param {string} requirementId - The requirement document ID
 * @returns {Promise<Object>} Guidance or error
 */
export async function getRequirementGuidance(declarationId, requirementId) {
  try {
    const result = await generateRequirementGuidanceFn({
      declarationId,
      requirementId
    })

    return {
      success: true,
      guidance: result.data.guidance,
      requirementId: result.data.requirementId,
      sectionTitle: result.data.sectionTitle,
      tokenUsage: result.data.tokenUsage
    }
  } catch (error) {
    return handleAIError(error)
  }
}

/**
 * Analyze evidence for completeness and quality
 * @param {string} declarationId - The declaration ID
 * @param {string} requirementId - The requirement document ID
 * @param {string} evidenceDescription - Description of the evidence
 * @param {string} evidenceType - Type of evidence
 * @returns {Promise<Object>} Analysis or error
 */
export async function analyzeEvidence(declarationId, requirementId, evidenceDescription, evidenceType = null) {
  try {
    const result = await analyzeEvidenceFn({
      declarationId,
      requirementId,
      evidenceDescription,
      evidenceType
    })

    return {
      success: true,
      analysis: result.data.analysis,
      requirementId: result.data.requirementId,
      tokenUsage: result.data.tokenUsage
    }
  } catch (error) {
    return handleAIError(error)
  }
}

/**
 * Get pre-declaration guidance before starting
 * @param {Object} context - User's context
 * @returns {Promise<Object>} Guidance or error
 */
export async function getPreDeclarationGuidance(context) {
  try {
    const result = await getPreDeclarationGuidanceFn(context)

    return {
      success: true,
      guidance: result.data.guidance,
      tokenUsage: result.data.tokenUsage
    }
  } catch (error) {
    return handleAIError(error)
  }
}

// ============================================
// React Hook for AI State Management
// ============================================

import { useState, useCallback } from 'react'

/**
 * Custom hook for managing AI interactions
 * @param {string} declarationId - The declaration ID
 * @returns {Object} AI state and functions
 */
export function useSafetyDeclarationAI(declarationId) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastResponse, setLastResponse] = useState(null)

  const ask = useCallback(async (question, rpasContext = null) => {
    setLoading(true)
    setError(null)

    try {
      const result = await askQuestion(declarationId, question, rpasContext)

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
  }, [declarationId])

  const verify = useCallback(async (calculationType, inputs) => {
    setLoading(true)
    setError(null)

    try {
      const result = await verifyCalculation(declarationId, calculationType, inputs)

      if (result.success) {
        setLastResponse(result.verification)
        return result
      } else {
        setError(result.error)
        return result
      }
    } finally {
      setLoading(false)
    }
  }, [declarationId])

  const getRecommendation = useCallback(async (requirementId, rpasContext = null) => {
    setLoading(true)
    setError(null)

    try {
      const result = await getComplianceRecommendation(declarationId, requirementId, rpasContext)

      if (result.success) {
        setLastResponse(result.recommendation)
        return result
      } else {
        setError(result.error)
        return result
      }
    } finally {
      setLoading(false)
    }
  }, [declarationId])

  const getGuidance = useCallback(async (requirementId) => {
    setLoading(true)
    setError(null)

    try {
      const result = await getRequirementGuidance(declarationId, requirementId)

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
  }, [declarationId])

  const analyzeEvidenceItem = useCallback(async (requirementId, description, type) => {
    setLoading(true)
    setError(null)

    try {
      const result = await analyzeEvidence(declarationId, requirementId, description, type)

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
  }, [declarationId])

  const clearHistory = useCallback(() => {
    clearConversation(declarationId)
    setLastResponse(null)
    setError(null)
  }, [declarationId])

  return {
    loading,
    error,
    lastResponse,
    ask,
    verify,
    getRecommendation,
    getGuidance,
    analyzeEvidenceItem,
    clearHistory
  }
}

// ============================================
// Utility Functions
// ============================================

/**
 * Format AI response for display (handle markdown)
 * @param {string} response - The AI response text
 * @returns {string} Formatted response
 */
export function formatAIResponse(response) {
  if (!response) return ''

  // The response is already in markdown format
  // This function can be extended to add additional formatting if needed
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
    // Check for section headers (## Header)
    const headerMatch = line.match(/^##\s+(.+)$/)
    if (headerMatch) {
      // Save previous section
      if (currentContent.length > 0) {
        sections[currentSection] = currentContent.join('\n').trim()
      }
      // Start new section
      currentSection = headerMatch[1].toLowerCase().replace(/\s+/g, '_')
      currentContent = []
    } else {
      currentContent.push(line)
    }
  }

  // Save last section
  if (currentContent.length > 0) {
    sections[currentSection] = currentContent.join('\n').trim()
  }

  return sections
}

// ============================================
// Export All
// ============================================

export default {
  askQuestion,
  verifyCalculation,
  getComplianceRecommendation,
  getRequirementGuidance,
  analyzeEvidence,
  getPreDeclarationGuidance,
  clearConversation,
  useSafetyDeclarationAI,
  formatAIResponse,
  parseAIResponse
}
