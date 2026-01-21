/**
 * BatchIndexPanel.jsx
 * Batch indexing panel for Knowledge Base
 *
 * Allows users to index all their documentation sources:
 * - Policies (from Policy Library)
 * - Projects (SORA, site surveys, flight plans)
 * - Equipment/Aircraft
 * - Crew members
 *
 * @location src/components/compliance/BatchIndexPanel.jsx
 */

import React, { useState, useEffect } from 'react'
import {
  Database,
  FileText,
  FolderOpen,
  Plane,
  Users,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Play,
  Pause
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useKnowledgeBase } from '../../hooks/useKnowledgeBase'
import { getProjects } from '../../lib/firestore'
import { getPoliciesEnhanced } from '../../lib/firestorePolicies'
import {
  indexAllPolicies,
  indexProject,
  indexEquipment,
  indexCrew,
  fullReindex
} from '../../lib/knowledgeBaseIndexer'
import { refreshIndexStats } from '../../lib/firestoreKnowledgeBase'
import { logger } from '../../lib/logger'

// ============================================
// SOURCE CONFIG
// ============================================

const SOURCES = {
  policies: {
    id: 'policies',
    name: 'Policies',
    description: 'Index all policies from your Policy Library',
    icon: FileText,
    color: 'blue'
  },
  projects: {
    id: 'projects',
    name: 'Projects',
    description: 'Index project data (SORA, site surveys, flight plans)',
    icon: FolderOpen,
    color: 'green'
  },
  equipment: {
    id: 'equipment',
    name: 'Equipment',
    description: 'Index aircraft and equipment specifications',
    icon: Plane,
    color: 'purple'
  },
  crew: {
    id: 'crew',
    name: 'Crew',
    description: 'Index crew qualifications and certifications',
    icon: Users,
    color: 'amber'
  }
}

// ============================================
// SUB-COMPONENTS
// ============================================

function SourceCard({ source, count, indexed, indexing, onIndex }) {
  const Icon = source.icon
  const colorClasses = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', iconBg: 'bg-blue-100' },
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', iconBg: 'bg-green-100' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', iconBg: 'bg-purple-100' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', iconBg: 'bg-amber-100' }
  }
  const colors = colorClasses[source.color] || colorClasses.blue

  return (
    <div className={`p-4 rounded-lg border ${colors.border} ${colors.bg}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${colors.iconBg}`}>
            <Icon className={`w-5 h-5 ${colors.text}`} />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{source.name}</h4>
            <p className="text-sm text-gray-600 mt-0.5">{source.description}</p>
            <div className="flex items-center gap-3 mt-2 text-sm">
              <span className="text-gray-500">{count} items available</span>
              {indexed > 0 && (
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {indexed} indexed
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={onIndex}
          disabled={indexing || count === 0}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
            indexing
              ? 'bg-gray-200 text-gray-500 cursor-wait'
              : count === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : `${colors.iconBg} ${colors.text} hover:opacity-80`
          }`}
        >
          {indexing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Indexing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Index
            </>
          )}
        </button>
      </div>
    </div>
  )
}

function IndexProgress({ current, total, source }) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-blue-900">
          Indexing {source}...
        </span>
        <span className="text-sm text-blue-700">
          {current} / {total}
        </span>
      </div>
      <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function BatchIndexPanel({ compact = false }) {
  const { user } = useAuth()
  const { indexStatus, refreshStatus } = useKnowledgeBase()

  // State
  const [counts, setCounts] = useState({
    policies: 0,
    projects: 0,
    equipment: 0,
    crew: 0
  })
  const [loadingCounts, setLoadingCounts] = useState(true)
  const [indexing, setIndexing] = useState(null)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  // Load source counts on mount
  useEffect(() => {
    loadCounts()
  }, [user])

  const loadCounts = async () => {
    if (!user) return

    setLoadingCounts(true)
    try {
      // Load policies
      const policies = await getPoliciesEnhanced()

      // Load projects (if available)
      let projects = []
      try {
        projects = await getProjects()
      } catch (e) {
        logger.warn('Could not load projects:', e)
      }

      setCounts({
        policies: policies.length,
        projects: projects.length,
        equipment: 0, // Would load from equipment collection
        crew: 0 // Would load from crew collection
      })
    } catch (err) {
      logger.error('Error loading counts:', err)
    } finally {
      setLoadingCounts(false)
    }
  }

  const handleIndexSource = async (sourceId) => {
    if (!user || indexing) return

    setIndexing(sourceId)
    setError(null)
    setResults(null)

    try {
      let result

      switch (sourceId) {
        case 'policies':
          result = await indexAllPolicies(user.uid, { clearExisting: true })
          break

        case 'projects':
          const projects = await getProjects()
          result = { indexed: 0, chunks: 0, errors: [] }
          setProgress({ current: 0, total: projects.length })

          for (let i = 0; i < projects.length; i++) {
            try {
              const projectResult = await indexProject(user.uid, projects[i])
              result.indexed++
              result.chunks += projectResult.created || 0
              setProgress({ current: i + 1, total: projects.length })
            } catch (err) {
              result.errors.push({ id: projects[i].id, error: err.message })
            }
          }
          break

        case 'equipment':
          // Would index equipment from equipment collection
          result = { indexed: 0, chunks: 0, message: 'Equipment indexing not yet implemented' }
          break

        case 'crew':
          // Would index crew from crew collection
          result = { indexed: 0, chunks: 0, message: 'Crew indexing not yet implemented' }
          break

        default:
          throw new Error(`Unknown source: ${sourceId}`)
      }

      setResults({
        sourceId,
        ...result
      })

      // Refresh index stats
      await refreshStatus()

    } catch (err) {
      setError(err.message)
      logger.error('Indexing error:', err)
    } finally {
      setIndexing(null)
      setProgress({ current: 0, total: 0 })
    }
  }

  const handleFullReindex = async () => {
    if (!user || indexing) return

    setIndexing('all')
    setError(null)
    setResults(null)

    try {
      // First policies
      setProgress({ current: 0, total: 2 })
      await indexAllPolicies(user.uid, { clearExisting: true })
      setProgress({ current: 1, total: 2 })

      // Then projects
      const projects = await getProjects()
      for (const project of projects) {
        try {
          await indexProject(user.uid, project)
        } catch (err) {
          logger.warn('Error indexing project:', err)
        }
      }
      setProgress({ current: 2, total: 2 })

      await refreshStatus()

      setResults({
        sourceId: 'all',
        message: 'Full reindex complete'
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setIndexing(null)
      setProgress({ current: 0, total: 0 })
    }
  }

  // Get indexed counts from status
  const indexedCounts = indexStatus?.bySourceType || {}

  // Compact mode for sidebar panels
  if (compact) {
    return (
      <div className="space-y-4">
        {/* Quick Index Button */}
        <button
          onClick={handleFullReindex}
          disabled={!!indexing}
          className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {indexing === 'all' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Indexing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Index All Policies
            </>
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Success */}
        {results && !error && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            {results.message || 'Indexing complete'}
          </div>
        )}

        {/* Progress */}
        {indexing && progress.total > 0 && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Indexing...</span>
              <span>{Math.round((progress.current / progress.total) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 transition-all"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Source List */}
        <div className="space-y-2">
          {Object.entries(SOURCES).map(([id, source]) => {
            const Icon = source.icon
            const count = counts[id] || 0
            const indexed = indexedCounts[id] || 0
            return (
              <div
                key={id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 text-${source.color}-600`} />
                  <span className="text-sm text-gray-700">{source.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {indexed}/{count}
                  </span>
                  {indexed > 0 && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-aeria-navy" />
            Index Documentation
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Index your documentation to enable AI-powered compliance assistance
          </p>
        </div>
        <button
          onClick={handleFullReindex}
          disabled={!!indexing}
          className="btn-primary flex items-center gap-2"
        >
          {indexing === 'all' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Reindexing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Full Reindex
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">Indexing Error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Success */}
      {results && !error && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-800">Indexing Complete</p>
            <p className="text-sm text-green-700 mt-1">
              {results.message || `Indexed ${results.indexed || 0} items, created ${results.chunks || 0} searchable chunks`}
            </p>
            {results.errors?.length > 0 && (
              <p className="text-sm text-amber-600 mt-1">
                {results.errors.length} item(s) had errors
              </p>
            )}
          </div>
        </div>
      )}

      {/* Progress */}
      {indexing && progress.total > 0 && (
        <IndexProgress
          current={progress.current}
          total={progress.total}
          source={SOURCES[indexing]?.name || indexing}
        />
      )}

      {/* Source Cards */}
      {loadingCounts ? (
        <div className="text-center py-8">
          <Loader2 className="w-6 h-6 mx-auto text-gray-400 animate-spin mb-2" />
          <p className="text-sm text-gray-500">Loading sources...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(SOURCES).map(([id, source]) => (
            <SourceCard
              key={id}
              source={source}
              count={counts[id] || 0}
              indexed={indexedCounts[id] || 0}
              indexing={indexing === id}
              onIndex={() => handleIndexSource(id)}
            />
          ))}
        </div>
      )}

      {/* Current Index Status */}
      {indexStatus && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Current Index Status</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{indexStatus.totalChunks || 0}</p>
              <p className="text-xs text-gray-500">Total Chunks</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{indexStatus.uniqueSources || 0}</p>
              <p className="text-xs text-gray-500">Sources</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{indexStatus.regulatoryRefs?.length || 0}</p>
              <p className="text-xs text-gray-500">Regulations</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                {indexStatus.isIndexed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {indexStatus.isIndexed ? 'Ready' : 'Not Indexed'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
