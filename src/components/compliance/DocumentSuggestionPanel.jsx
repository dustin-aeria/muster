/**
 * DocumentSuggestionPanel.jsx
 * AI-assisted document suggestion panel for compliance requirements
 *
 * This component finds and suggests relevant documentation for a specific
 * compliance requirement, helping users identify applicable policies,
 * procedures, and evidence.
 *
 * @location src/components/compliance/DocumentSuggestionPanel.jsx
 */

import React, { useState, useEffect } from 'react'
import {
  Lightbulb,
  FileText,
  FolderOpen,
  Plane,
  Users,
  Search,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  Book,
  Link,
  ExternalLink,
  Hash,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import {
  searchKnowledgeBase,
  findRelevantDocs,
  getIndexStatus
} from '../../lib/firestoreKnowledgeBase'
import { logger } from '../../lib/logger'

// ============================================
// SOURCE TYPE ICONS
// ============================================

const SOURCE_ICONS = {
  policy: FileText,
  project: FolderOpen,
  equipment: Plane,
  crew: Users
}

const SOURCE_COLORS = {
  policy: 'blue',
  project: 'green',
  equipment: 'purple',
  crew: 'amber'
}

// ============================================
// SUB-COMPONENTS
// ============================================

function SuggestionCard({ suggestion, onUseContent, onLinkDocument }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const Icon = SOURCE_ICONS[suggestion.sourceType] || FileText
  const color = SOURCE_COLORS[suggestion.sourceType] || 'gray'

  const colorClasses = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100' },
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100' },
    gray: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', badge: 'bg-gray-100' }
  }

  const colors = colorClasses[color]

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(suggestion.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      logger.error('Failed to copy:', err)
    }
  }

  return (
    <div className={`border rounded-lg ${colors.border} overflow-hidden`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full p-3 text-left flex items-start gap-3 ${colors.bg} hover:opacity-90`}
      >
        <div className={`p-1.5 rounded ${colors.badge}`}>
          <Icon className={`w-4 h-4 ${colors.text}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900 truncate">{suggestion.sourceTitle}</h4>
            {suggestion.relevanceScore && (
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                suggestion.relevanceScore > 70 ? 'bg-green-100 text-green-700' :
                suggestion.relevanceScore > 40 ? 'bg-amber-100 text-amber-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {suggestion.relevanceScore}%
              </span>
            )}
          </div>

          {suggestion.sectionTitle && (
            <p className="text-sm text-gray-600 mt-0.5">
              {suggestion.sectionTitle}
            </p>
          )}

          {suggestion.sourceNumber && (
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <Hash className="w-3 h-3" />
              Policy {suggestion.sourceNumber}
            </p>
          )}
        </div>

        {expanded ? (
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="p-3 bg-white border-t border-gray-100 space-y-3">
          {/* Content Preview */}
          <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto">
            {suggestion.content}
          </div>

          {/* Regulatory References */}
          {suggestion.regulatoryRefs?.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Book className="w-3.5 h-3.5 text-gray-400" />
              {suggestion.regulatoryRefs.map((ref, i) => (
                <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                  {ref}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <button
              onClick={() => onUseContent?.(suggestion.content)}
              className="flex-1 px-3 py-1.5 bg-aeria-navy text-white rounded-lg text-sm hover:bg-opacity-90 flex items-center justify-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Use Content
            </button>
            <button
              onClick={() => onLinkDocument?.(suggestion)}
              className="flex-1 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 flex items-center justify-center gap-1"
            >
              <Link className="w-3.5 h-3.5" />
              Link as Evidence
            </button>
            <button
              onClick={handleCopyContent}
              className="p-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
              title="Copy content"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function GapWarning({ gaps }) {
  if (!gaps || gaps.length === 0) return null

  return (
    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
      <h5 className="font-medium text-amber-800 flex items-center gap-2 mb-2">
        <AlertCircle className="w-4 h-4" />
        Potential Gaps Identified
      </h5>
      <ul className="space-y-1">
        {gaps.map((gap, i) => (
          <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            {gap.message}
          </li>
        ))}
      </ul>
    </div>
  )
}

function EmptyState({ indexed, onSearch }) {
  return (
    <div className="text-center py-8 px-4">
      <Lightbulb className="w-10 h-10 mx-auto text-gray-300 mb-3" />
      {indexed ? (
        <>
          <p className="text-gray-600 mb-1">No suggestions yet</p>
          <p className="text-sm text-gray-500">
            Click "Find Suggestions" to search your documentation for relevant content
          </p>
        </>
      ) : (
        <>
          <p className="text-gray-600 mb-1">Knowledge Base not indexed</p>
          <p className="text-sm text-gray-500">
            Index your policies first to enable AI-assisted suggestions
          </p>
        </>
      )}
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function DocumentSuggestionPanel({
  requirement,
  onUseContent,
  onLinkDocument,
  className = ''
}) {
  const { user } = useAuth()

  // State
  const [suggestions, setSuggestions] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [indexStatus, setIndexStatus] = useState(null)
  const [autoSearched, setAutoSearched] = useState(false)

  // Check index status on mount
  useEffect(() => {
    checkIndexStatus()
  }, [user])

  // Auto-search when requirement changes (if indexed)
  useEffect(() => {
    if (requirement && indexStatus?.isIndexed && !autoSearched) {
      findSuggestions()
      setAutoSearched(true)
    }
  }, [requirement, indexStatus])

  // Reset auto-search flag when requirement changes
  useEffect(() => {
    setAutoSearched(false)
    setSuggestions(null)
  }, [requirement?.id])

  const checkIndexStatus = async () => {
    if (!user) return

    try {
      const status = await getIndexStatus(user.uid)
      setIndexStatus(status)
    } catch (err) {
      logger.error('Error checking index status:', err)
    }
  }

  const findSuggestions = async () => {
    if (!user || !requirement) return

    setLoading(true)
    setError('')

    try {
      const results = await findRelevantDocs(user.uid, requirement)
      setSuggestions(results)
    } catch (err) {
      setError('Failed to find suggestions. Please try again.')
      logger.error('Error finding suggestions:', err)
    } finally {
      setLoading(false)
    }
  }

  const allResults = [
    ...(suggestions?.directMatches || []),
    ...(suggestions?.relatedMatches || [])
  ]

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h4 className="font-medium text-gray-900 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          AI Suggestions
        </h4>
        <button
          onClick={findSuggestions}
          disabled={loading || !indexStatus?.isIndexed}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5" />
              Find Suggestions
            </>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
            <button onClick={() => setError('')} className="ml-auto p-1 hover:bg-red-100 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Requirement Context */}
        {requirement && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Finding documentation for:</p>
            <p className="text-sm text-gray-700 font-medium">
              {requirement.shortText || requirement.text?.substring(0, 100)}
            </p>
            {requirement.regulatoryRef && (
              <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {requirement.regulatoryRef}
              </span>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="py-8 text-center">
            <Loader2 className="w-8 h-8 mx-auto text-aeria-navy animate-spin mb-3" />
            <p className="text-gray-600">Searching knowledge base...</p>
          </div>
        )}

        {/* Results */}
        {!loading && suggestions && (
          <div className="space-y-4">
            {/* Gaps Warning */}
            <GapWarning gaps={suggestions.gaps} />

            {/* Direct Matches */}
            {suggestions.directMatches?.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Direct Matches ({suggestions.directMatches.length})
                </h5>
                <div className="space-y-2">
                  {suggestions.directMatches.map((result) => (
                    <SuggestionCard
                      key={result.id}
                      suggestion={result}
                      onUseContent={onUseContent}
                      onLinkDocument={onLinkDocument}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Related Matches */}
            {suggestions.relatedMatches?.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Search className="w-4 h-4 text-blue-600" />
                  Related Content ({suggestions.relatedMatches.length})
                </h5>
                <div className="space-y-2">
                  {suggestions.relatedMatches.slice(0, 5).map((result) => (
                    <SuggestionCard
                      key={result.id}
                      suggestion={result}
                      onUseContent={onUseContent}
                      onLinkDocument={onLinkDocument}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {allResults.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No matching documentation found</p>
                <p className="text-sm mt-1">
                  Consider adding relevant policies or procedures to your library
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && !suggestions && (
          <EmptyState
            indexed={indexStatus?.isIndexed}
            onSearch={findSuggestions}
          />
        )}
      </div>
    </div>
  )
}
