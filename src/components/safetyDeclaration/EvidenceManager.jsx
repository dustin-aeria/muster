/**
 * EvidenceManager.jsx
 * Main component for managing evidence files within a Safety Declaration
 * Supports upload, viewing, and linking to requirements
 *
 * @location src/components/safetyDeclaration/EvidenceManager.jsx
 */

import { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  Filter,
  Grid,
  List,
  FileText,
  FileSpreadsheet,
  Calculator,
  Image,
  Video,
  Factory,
  Award,
  PenTool,
  FileCode,
  Download,
  Trash2,
  Eye,
  Link2,
  MoreVertical,
  Calendar,
  User,
  AlertCircle,
  CheckCircle2,
  ExternalLink
} from 'lucide-react'
import {
  EVIDENCE_TYPES,
  deleteEvidence
} from '../../lib/firestoreSafetyDeclaration'

// Map icon names to components
const ICON_MAP = {
  FileText,
  FileSpreadsheet,
  Calculator,
  Image,
  Video,
  Factory,
  Award,
  PenTool,
  FileCode
}

export default function EvidenceManager({
  evidence = [],
  requirements = [],
  declarationId,
  onUploadClick,
  onViewEvidence,
  onEvidenceUpdate
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [actionMenuOpen, setActionMenuOpen] = useState(null)

  // Calculate stats by type
  const stats = useMemo(() => {
    const byType = {}
    Object.keys(EVIDENCE_TYPES).forEach(type => {
      byType[type] = evidence.filter(e => e.type === type).length
    })

    // Calculate linked vs unlinked
    const linked = evidence.filter(e => e.linkedRequirements?.length > 0).length
    const unlinked = evidence.length - linked

    return {
      total: evidence.length,
      byType,
      linked,
      unlinked
    }
  }, [evidence])

  // Filter evidence
  const filteredEvidence = useMemo(() => {
    return evidence.filter(item => {
      // Type filter
      if (typeFilter !== 'all' && item.type !== typeFilter) {
        return false
      }

      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        const matchesName = item.name?.toLowerCase().includes(search)
        const matchesDescription = item.description?.toLowerCase().includes(search)
        const matchesFileName = item.fileName?.toLowerCase().includes(search)
        return matchesName || matchesDescription || matchesFileName
      }

      return true
    })
  }, [evidence, typeFilter, searchTerm])

  // Get requirement names for display
  const getRequirementLabel = (reqId) => {
    const req = requirements.find(r => r.id === reqId || r.requirementId === reqId)
    return req?.requirementId || reqId
  }

  const getTypeIcon = (type) => {
    const typeInfo = EVIDENCE_TYPES[type]
    if (!typeInfo) return FileText
    return ICON_MAP[typeInfo.icon] || FileText
  }

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"? This will also unlink it from all requirements.`)) {
      return
    }

    try {
      await deleteEvidence(declarationId, item.id)
      if (onEvidenceUpdate) onEvidenceUpdate()
    } catch (error) {
      console.error('Error deleting evidence:', error)
    }
    setActionMenuOpen(null)
  }

  const formatDate = (date) => {
    if (!date) return '-'
    if (typeof date === 'string') date = new Date(date)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '-'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const renderEvidenceCard = (item) => {
    const TypeIcon = getTypeIcon(item.type)
    const typeInfo = EVIDENCE_TYPES[item.type] || { label: 'Document' }
    const isLinked = item.linkedRequirements?.length > 0

    return (
      <div
        key={item.id}
        className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
      >
        {/* Preview/Icon Area */}
        <div
          onClick={() => onViewEvidence?.(item)}
          className="h-32 bg-gray-50 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
        >
          {item.type === 'photo' && item.fileUrl ? (
            <img
              src={item.fileUrl}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <TypeIcon className="w-12 h-12 text-gray-400" />
          )}
        </div>

        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
              <p className="text-xs text-gray-500">{typeInfo.label}</p>
            </div>

            {/* Action menu */}
            <div className="relative ml-2">
              <button
                onClick={() => setActionMenuOpen(actionMenuOpen === item.id ? null : item.id)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {actionMenuOpen === item.id && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setActionMenuOpen(null)}
                  />
                  <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                    <button
                      onClick={() => {
                        onViewEvidence?.(item)
                        setActionMenuOpen(null)
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    {item.fileUrl && (
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setActionMenuOpen(null)}
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(item)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
          )}

          {/* Linked requirements */}
          <div className="mb-3">
            {isLinked ? (
              <div className="flex flex-wrap gap-1">
                {item.linkedRequirements.slice(0, 3).map(reqId => (
                  <span
                    key={reqId}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-50 text-green-700"
                  >
                    {getRequirementLabel(reqId)}
                  </span>
                ))}
                {item.linkedRequirements.length > 3 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                    +{item.linkedRequirements.length - 3}
                  </span>
                )}
              </div>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-orange-600">
                <AlertCircle className="w-3 h-3" />
                Not linked to requirements
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(item.createdAt)}
            </div>
            {item.fileSize && (
              <span>{formatFileSize(item.fileSize)}</span>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderEvidenceRow = (item) => {
    const TypeIcon = getTypeIcon(item.type)
    const typeInfo = EVIDENCE_TYPES[item.type] || { label: 'Document' }
    const isLinked = item.linkedRequirements?.length > 0

    return (
      <div
        key={item.id}
        className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        {/* Icon */}
        <div className="p-3 bg-gray-100 rounded-lg flex-shrink-0">
          <TypeIcon className="w-6 h-6 text-gray-600" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
            <span>{typeInfo.label}</span>
            <span>&bull;</span>
            <span>{formatDate(item.createdAt)}</span>
            {item.fileSize && (
              <>
                <span>&bull;</span>
                <span>{formatFileSize(item.fileSize)}</span>
              </>
            )}
          </div>
        </div>

        {/* Linked requirements */}
        <div className="flex-shrink-0">
          {isLinked ? (
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-700">
                {item.linkedRequirements.length} linked
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-orange-600">Unlinked</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onViewEvidence?.(item)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            title="View details"
          >
            <Eye className="w-4 h-4" />
          </button>
          {item.fileUrl && (
            <a
              href={item.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </a>
          )}
          <button
            onClick={() => handleDelete(item)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
          <p className="text-sm text-blue-600">Total Evidence</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{stats.linked}</p>
          <p className="text-sm text-green-600">Linked</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-orange-700">{stats.unlinked}</p>
          <p className="text-sm text-orange-600">Unlinked</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-purple-700">
            {Object.values(stats.byType).filter(c => c > 0).length}
          </p>
          <p className="text-sm text-purple-600">Types Used</p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search evidence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Type Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
          >
            <option value="all">All Types</option>
            {Object.entries(EVIDENCE_TYPES).map(([key, type]) => (
              <option key={key} value={key}>
                {type.label} ({stats.byType[key] || 0})
              </option>
            ))}
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Button */}
        <button
          onClick={onUploadClick}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Upload Evidence
        </button>
      </div>

      {/* Evidence Grid/List */}
      {filteredEvidence.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredEvidence.map(renderEvidenceCard)}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEvidence.map(renderEvidenceRow)}
          </div>
        )
      ) : evidence.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Evidence Yet</h3>
          <p className="text-gray-500 mb-4">
            Upload evidence files to document compliance with requirements.
          </p>
          <button
            onClick={onUploadClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Upload First Evidence
          </button>
        </div>
      ) : (
        <div className="text-center py-8">
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No evidence matches your filters.</p>
        </div>
      )}

      {/* Evidence Type Legend */}
      {evidence.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Evidence by Type</h4>
          <div className="flex flex-wrap gap-3">
            {Object.entries(EVIDENCE_TYPES).map(([key, type]) => {
              const TypeIcon = ICON_MAP[type.icon] || FileText
              const count = stats.byType[key] || 0
              if (count === 0) return null

              return (
                <button
                  key={key}
                  onClick={() => setTypeFilter(typeFilter === key ? 'all' : key)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    typeFilter === key
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <TypeIcon className="w-4 h-4" />
                  <span>{type.label}</span>
                  <span className="font-medium">({count})</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
