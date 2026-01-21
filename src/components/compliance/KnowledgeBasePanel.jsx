/**
 * KnowledgeBasePanel.jsx
 * Knowledge Base management and search panel for Compliance Assistant
 *
 * Features:
 * - Search across indexed documentation
 * - View index status and statistics
 * - Trigger reindexing
 * - Browse by source type
 *
 * @location src/components/compliance/KnowledgeBasePanel.jsx
 */

import React, { useState, useEffect, useMemo } from 'react'
import {
  Search,
  Database,
  FileText,
  FolderOpen,
  Plane,
  Users,
  Upload,
  RefreshCw,
  Loader2,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  X,
  Book,
  Filter,
  ExternalLink,
  Clock,
  Hash,
  Tag
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import {
  searchKnowledgeBase,
  getIndexStatus,
  getChunks,
  SOURCE_TYPES
} from '../../lib/firestoreKnowledgeBase'
import { indexAllPolicies, fullReindex } from '../../lib/knowledgeBaseIndexer'
import { logger } from '../../lib/logger'

// ============================================
// SOURCE TYPE ICONS
// ============================================

const SOURCE_ICONS = {
  policy: FileText,
  project: FolderOpen,
  equipment: Plane,
  crew: Users,
  upload: Upload
}

const SOURCE_COLORS = {
  policy: 'blue',
  project: 'green',
  equipment: 'purple',
  crew: 'amber',
  upload: 'gray'
}

// ============================================
// SUB-COMPONENTS
// ============================================

function SourceTypeBadge({ sourceType }) {
  const Icon = SOURCE_ICONS[sourceType] || FileText
  const color = SOURCE_COLORS[sourceType] || 'gray'

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    purple: 'bg-purple-100 text-purple-700',
    amber: 'bg-amber-100 text-amber-700',
    gray: 'bg-gray-100 text-gray-700'
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${colorClasses[color]}`}>
      <Icon className="w-3 h-3" />
      {SOURCE_TYPES[sourceType]?.name || sourceType}
    </span>
  )
}

function SearchResult({ result, onSelect }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 text-left flex items-start gap-3"
      >
        <div className="flex-shrink-0 mt-0.5">
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <SourceTypeBadge sourceType={result.sourceType} />
            {result.sourceNumber && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Hash className="w-3 h-3" />
                {result.sourceNumber}
              </span>
            )}
            {result.relevanceScore > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                result.relevanceScore > 70 ? 'bg-green-100 text-green-700' :
                result.relevanceScore > 40 ? 'bg-amber-100 text-amber-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {result.relevanceScore}% match
              </span>
            )}
          </div>

          <h4 className="font-medium text-gray-900 truncate">{result.sourceTitle}</h4>

          {result.sectionTitle && (
            <p className="text-sm text-gray-600 mt-0.5">
              Section: {result.sectionTitle}
            </p>
          )}

          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {result.contentPreview}
          </p>
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 pl-10 space-y-3">
          {/* Full Content */}
          <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap max-h-60 overflow-y-auto">
            {result.content}
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-2">
            {result.regulatoryRefs?.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Book className="w-3.5 h-3.5 text-gray-400" />
                {result.regulatoryRefs.map((ref, i) => (
                  <span key={i} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                    {ref}
                  </span>
                ))}
              </div>
            )}

            {result.keywords?.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-gray-400" />
                {result.keywords.slice(0, 5).map((kw, i) => (
                  <span key={i} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                    {kw}
                  </span>
                ))}
                {result.keywords.length > 5 && (
                  <span className="text-xs text-gray-400">+{result.keywords.length - 5} more</span>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => onSelect?.(result)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Use as reference
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function IndexStatusCard({ status, onReindex, reindexing }) {
  if (!status) return null

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900 flex items-center gap-2">
          <Database className="w-4 h-4" />
          Knowledge Base Status
        </h4>
        <button
          onClick={onReindex}
          disabled={reindexing}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 disabled:opacity-50"
        >
          {reindexing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Indexing...
            </>
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5" />
              Reindex
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="text-center p-2 bg-white rounded-lg">
          <p className="text-2xl font-bold text-gray-900">{status.totalChunks || 0}</p>
          <p className="text-xs text-gray-500">Total Chunks</p>
        </div>
        <div className="text-center p-2 bg-white rounded-lg">
          <p className="text-2xl font-bold text-gray-900">{status.uniqueSources || 0}</p>
          <p className="text-xs text-gray-500">Sources</p>
        </div>
        <div className="text-center p-2 bg-white rounded-lg">
          <p className="text-2xl font-bold text-gray-900">{status.regulatoryRefs?.length || 0}</p>
          <p className="text-xs text-gray-500">Reg. Refs</p>
        </div>
        <div className="text-center p-2 bg-white rounded-lg">
          <div className="flex items-center justify-center gap-1">
            {status.isIndexed ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-600">Indexed</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span className="text-sm text-amber-600">Not Indexed</span>
              </>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">Status</p>
        </div>
      </div>

      {status.bySourceType && Object.keys(status.bySourceType).length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">By Source Type:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(status.bySourceType).map(([type, count]) => (
              <span key={type} className="text-xs bg-white px-2 py-1 rounded flex items-center gap-1">
                {React.createElement(SOURCE_ICONS[type] || FileText, { className: 'w-3 h-3' })}
                {SOURCE_TYPES[type]?.name || type}: {count}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function KnowledgeBasePanel({
  onSelectResult,
  initialQuery = '',
  filterSourceTypes = null,
  compact = false
}) {
  const { user } = useAuth()

  // State
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [indexStatus, setIndexStatus] = useState(null)
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [reindexing, setReindexing] = useState(false)
  const [error, setError] = useState('')
  const [selectedSourceTypes, setSelectedSourceTypes] = useState(filterSourceTypes || [])
  const [showFilters, setShowFilters] = useState(false)

  // Load index status on mount
  useEffect(() => {
    loadIndexStatus()
  }, [user])

  // Search when query changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch()
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, selectedSourceTypes])

  const loadIndexStatus = async () => {
    if (!user) return

    setLoadingStatus(true)
    try {
      const status = await getIndexStatus(user.uid)
      setIndexStatus(status)
    } catch (err) {
      logger.error('Error loading index status:', err)
    } finally {
      setLoadingStatus(false)
    }
  }

  const performSearch = async () => {
    if (!user || !searchQuery.trim()) return

    setSearching(true)
    setError('')

    try {
      const results = await searchKnowledgeBase(
        user.uid,
        searchQuery.trim(),
        {
          sourceTypes: selectedSourceTypes.length > 0 ? selectedSourceTypes : null,
          maxResults: 20
        }
      )
      setSearchResults(results)
    } catch (err) {
      setError('Search failed. Please try again.')
      logger.error('Search error:', err)
    } finally {
      setSearching(false)
    }
  }

  const handleReindex = async () => {
    if (!user) return

    setReindexing(true)
    setError('')

    try {
      // For now, just index policies. Full reindex would include all data sources
      const result = await indexAllPolicies(user.uid, { clearExisting: true })

      if (result.success) {
        await loadIndexStatus()
        setSearchResults([])
        setSearchQuery('')
      } else {
        setError('Some errors occurred during indexing. Check console for details.')
      }
    } catch (err) {
      setError('Indexing failed. Please try again.')
      logger.error('Reindex error:', err)
    } finally {
      setReindexing(false)
    }
  }

  const toggleSourceType = (type) => {
    setSelectedSourceTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  // Render
  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${compact ? '' : 'p-6'}`}>
      {/* Header */}
      {!compact && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-aeria-navy" />
            Knowledge Base Search
          </h3>
        </div>
      )}

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

      {/* Search Bar */}
      <div className={`space-y-3 ${compact ? 'p-4' : ''}`}>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search policies, procedures, requirements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy focus:border-transparent"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 border rounded-lg flex items-center gap-1 ${
              selectedSourceTypes.length > 0
                ? 'border-blue-300 bg-blue-50 text-blue-700'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            {selectedSourceTypes.length > 0 && (
              <span className="text-xs">{selectedSourceTypes.length}</span>
            )}
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-2">Filter by source type:</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(SOURCE_TYPES).map(([key, type]) => {
                const Icon = SOURCE_ICONS[key]
                const isSelected = selectedSourceTypes.includes(key)
                return (
                  <button
                    key={key}
                    onClick={() => toggleSourceType(key)}
                    className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 transition-colors ${
                      isSelected
                        ? 'bg-aeria-navy text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {type.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className={`mt-4 ${compact ? 'px-4 pb-4' : ''}`}>
        {searchQuery.trim().length < 2 ? (
          // Index Status (when not searching)
          !compact && (
            <IndexStatusCard
              status={indexStatus}
              onReindex={handleReindex}
              reindexing={reindexing}
            />
          )
        ) : searchResults.length > 0 ? (
          // Search Results
          <div className="space-y-2">
            <p className="text-sm text-gray-500 mb-3">
              Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
            </p>
            {searchResults.map((result) => (
              <SearchResult
                key={result.id}
                result={result}
                onSelect={onSelectResult}
              />
            ))}
          </div>
        ) : !searching ? (
          // No Results
          <div className="text-center py-8 text-gray-500">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No results found for "{searchQuery}"</p>
            <p className="text-sm mt-1">Try different keywords or check your filters</p>
          </div>
        ) : null}
      </div>

      {/* Index Status (compact mode) */}
      {compact && !searchQuery && (
        <div className="px-4 pb-4">
          <div className="text-center py-4 text-gray-500">
            <Database className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {indexStatus?.totalChunks || 0} documents indexed
            </p>
            {!indexStatus?.isIndexed && (
              <button
                onClick={handleReindex}
                disabled={reindexing}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                {reindexing ? 'Indexing...' : 'Build Index'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
