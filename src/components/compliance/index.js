/**
 * Compliance Assistant Components
 *
 * Export all compliance-related components for easy importing
 *
 * @location src/components/compliance/index.js
 */

export { default as KnowledgeBasePanel } from './KnowledgeBasePanel'
export { default as DocumentSuggestionPanel } from './DocumentSuggestionPanel'
export { default as EnhancedAIPanel } from './EnhancedAIPanel'
export { default as BatchIndexPanel } from './BatchIndexPanel'
export { default as PatternInsightsPanel, PatternBadge } from './PatternInsightsPanel'
export { default as ComplianceDocumentParser, ComplianceDocumentParserModal } from './ComplianceDocumentParser'
export { AutoPopulateButton, GapAnalysisPanel, ProjectLinkBanner, analyzeGaps } from './SmartPopulate'

// Re-export parser utilities for external use
export { parseComplianceText, generateTemplate, importFromJSON, exportToJSON } from '../../lib/complianceMatrixParser'
export { analyzeComplianceText, mapRequirementToPatterns } from '../../lib/regulatoryPatterns'
