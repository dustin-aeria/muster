/**
 * useRegulatoryPatterns.js
 * React hook for accessing regulatory pattern matching functionality
 *
 * Provides:
 * - Pattern analysis for compliance requirements
 * - Cross-framework mapping suggestions
 * - Evidence type recommendations
 * - Regulatory reference lookups
 *
 * @location src/hooks/useRegulatoryPatterns.js
 */

import { useState, useCallback, useMemo } from 'react'
import {
  analyzeComplianceText,
  mapRequirementToPatterns,
  findMatchingQuestionPattern,
  getSuggestedEvidence,
  getRelatedRegulations,
  REGULATORY_REFERENCES,
  COMPLIANCE_CATEGORIES,
  EVIDENCE_PATTERNS,
  COMMON_COMPLIANCE_QUESTIONS
} from '../lib/regulatoryPatterns'
import { parseComplianceText, generateTemplate } from '../lib/complianceMatrixParser'

/**
 * Hook for regulatory pattern matching and analysis
 */
export function useRegulatoryPatterns() {
  const [analysisCache, setAnalysisCache] = useState({})

  /**
   * Analyze a requirement and get pattern matches
   * Results are cached by requirement ID
   */
  const analyzeRequirement = useCallback((requirement) => {
    if (!requirement) return null

    const cacheKey = requirement.id || requirement.text?.substring(0, 50)

    // Return cached result if available
    if (analysisCache[cacheKey]) {
      return analysisCache[cacheKey]
    }

    // Perform analysis
    const result = mapRequirementToPatterns(requirement)

    // Also check for common question patterns
    const questionMatch = findMatchingQuestionPattern(
      requirement.text || requirement.shortText || ''
    )
    if (questionMatch) {
      result.questionPattern = questionMatch
    }

    // Cache the result
    setAnalysisCache(prev => ({
      ...prev,
      [cacheKey]: result
    }))

    return result
  }, [analysisCache])

  /**
   * Analyze free-form text
   */
  const analyzeText = useCallback((text) => {
    if (!text) return null
    return analyzeComplianceText(text)
  }, [])

  /**
   * Get suggested evidence types for a category
   */
  const getEvidenceForCategory = useCallback((categoryId) => {
    return getSuggestedEvidence(categoryId)
  }, [])

  /**
   * Get related regulations for a category
   */
  const getRegulationsForCategory = useCallback((categoryId) => {
    return getRelatedRegulations(categoryId)
  }, [])

  /**
   * Look up a regulatory reference
   */
  const lookupRegulation = useCallback((refId) => {
    // Normalize the reference ID
    const normalizedId = refId?.toUpperCase().replace(/\s+/g, ' ')

    // Direct lookup
    if (REGULATORY_REFERENCES[normalizedId]) {
      return REGULATORY_REFERENCES[normalizedId]
    }

    // Try partial match (e.g., "CAR 903.02(d)" matches "CAR 903.02")
    const baseRef = normalizedId?.replace(/\([a-z]\)+$/i, '').trim()
    if (REGULATORY_REFERENCES[baseRef]) {
      const baseInfo = REGULATORY_REFERENCES[baseRef]
      // Check for subpart info
      const subPartMatch = normalizedId.match(/\(([a-z])\)/i)
      if (subPartMatch && baseInfo.subParts) {
        const subPartKey = subPartMatch[1].toLowerCase()
        const subPartInfo = baseInfo.subParts[subPartKey]
        if (subPartInfo) {
          return {
            ...baseInfo,
            id: normalizedId,
            subPart: subPartKey,
            subPartInfo: typeof subPartInfo === 'string'
              ? { description: subPartInfo }
              : subPartInfo
          }
        }
      }
      return baseInfo
    }

    return null
  }, [])

  /**
   * Parse a compliance document text
   */
  const parseDocument = useCallback((text, options = {}) => {
    return parseComplianceText(text, options)
  }, [])

  /**
   * Generate a template from parsed requirements
   */
  const createTemplate = useCallback((parsedResult) => {
    return generateTemplate(parsedResult)
  }, [])

  /**
   * Get all categories
   */
  const categories = useMemo(() => {
    return Object.entries(COMPLIANCE_CATEGORIES).map(([id, cat]) => ({
      id,
      ...cat
    }))
  }, [])

  /**
   * Get all evidence patterns
   */
  const evidencePatterns = useMemo(() => {
    return Object.entries(EVIDENCE_PATTERNS).map(([id, pattern]) => ({
      id,
      ...pattern
    }))
  }, [])

  /**
   * Get common compliance questions
   */
  const commonQuestions = useMemo(() => {
    return Object.entries(COMMON_COMPLIANCE_QUESTIONS).map(([id, question]) => ({
      id,
      ...question
    }))
  }, [])

  /**
   * Batch analyze multiple requirements
   */
  const analyzeRequirements = useCallback((requirements) => {
    return requirements.map(req => ({
      requirement: req,
      analysis: analyzeRequirement(req)
    }))
  }, [analyzeRequirement])

  /**
   * Get category summary for a set of requirements
   */
  const getCategorySummary = useCallback((requirements) => {
    const summary = {}

    for (const req of requirements) {
      const analysis = analyzeRequirement(req)
      const categoryId = analysis?.primaryCategory?.id || 'uncategorized'

      if (!summary[categoryId]) {
        summary[categoryId] = {
          id: categoryId,
          name: analysis?.primaryCategory?.name || 'Uncategorized',
          count: 0,
          requirements: []
        }
      }

      summary[categoryId].count++
      summary[categoryId].requirements.push(req.id)
    }

    return Object.values(summary).sort((a, b) => b.count - a.count)
  }, [analyzeRequirement])

  /**
   * Clear analysis cache
   */
  const clearCache = useCallback(() => {
    setAnalysisCache({})
  }, [])

  return {
    // Analysis functions
    analyzeRequirement,
    analyzeText,
    analyzeRequirements,
    getCategorySummary,

    // Lookup functions
    lookupRegulation,
    getEvidenceForCategory,
    getRegulationsForCategory,

    // Parsing functions
    parseDocument,
    createTemplate,

    // Static data
    categories,
    evidencePatterns,
    commonQuestions,

    // Cache management
    clearCache
  }
}

/**
 * Hook for analyzing a single requirement with memoization
 * @param {Object} requirement - The requirement to analyze
 */
export function useRequirementAnalysis(requirement) {
  const { analyzeRequirement } = useRegulatoryPatterns()

  const analysis = useMemo(() => {
    if (!requirement) return null
    return analyzeRequirement(requirement)
  }, [requirement, analyzeRequirement])

  return analysis
}

export default useRegulatoryPatterns
