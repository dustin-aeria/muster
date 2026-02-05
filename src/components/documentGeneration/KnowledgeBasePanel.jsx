/**
 * KnowledgeBasePanel.jsx
 * Shows referenced knowledge base documents used in the conversation
 */

import { useState } from 'react'
import { BookOpen, ExternalLink, ChevronDown, ChevronUp, FileText, Search } from 'lucide-react'

export default function KnowledgeBasePanel({
  referencedDocs = [],
  onViewDocument,
  loading = false
}) {
  const [expanded, setExpanded] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredDocs = referencedDocs.filter(doc =>
    doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.type?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getDocTypeColor = (type) => {
    const colors = {
      policy: 'bg-blue-100 text-blue-700',
      procedure: 'bg-green-100 text-green-700',
      regulation: 'bg-purple-100 text-purple-700',
      template: 'bg-yellow-100 text-yellow-700',
      guide: 'bg-orange-100 text-orange-700',
      default: 'bg-gray-100 text-gray-700'
    }
    return colors[type?.toLowerCase()] || colors.default
  }

  const formatDate = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="border-t border-gray-200 bg-gray-50">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            Knowledge Base References
          </span>
          {referencedDocs.length > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
              {referencedDocs.length}
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 pb-3">
          {/* Search */}
          {referencedDocs.length > 3 && (
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search references..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="ml-2 text-sm text-gray-500">Finding relevant documents...</span>
            </div>
          )}

          {/* Empty State */}
          {!loading && referencedDocs.length === 0 && (
            <div className="text-center py-4">
              <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                No knowledge base documents referenced yet.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Relevant documents will appear here as you chat.
              </p>
            </div>
          )}

          {/* Document List */}
          {!loading && filteredDocs.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredDocs.map((doc, index) => (
                <div
                  key={doc.id || index}
                  className="p-2.5 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${getDocTypeColor(doc.type)}`}>
                          {doc.type || 'Document'}
                        </span>
                        {doc.relevanceScore && (
                          <span className="text-xs text-gray-400">
                            {Math.round(doc.relevanceScore * 100)}% match
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {doc.title}
                      </h4>
                      {doc.excerpt && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {doc.excerpt}
                        </p>
                      )}
                      {doc.updatedAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          Updated {formatDate(doc.updatedAt)}
                        </p>
                      )}
                    </div>
                    {onViewDocument && (
                      <button
                        onClick={() => onViewDocument(doc)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View document"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && searchQuery && filteredDocs.length === 0 && referencedDocs.length > 0 && (
            <p className="text-sm text-gray-500 text-center py-3">
              No documents match "{searchQuery}"
            </p>
          )}
        </div>
      )}
    </div>
  )
}
