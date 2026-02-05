/**
 * DocumentList.jsx
 * List/grid display of documents within a project
 */

import { useState } from 'react'
import { Search, Filter, Grid, List as ListIcon, Plus } from 'lucide-react'
import DocumentCard from './DocumentCard'
import { DOCUMENT_TYPES, DOCUMENT_STATUSES } from '../../lib/firestoreDocumentGeneration'

export default function DocumentList({
  documents,
  projectId,
  loading,
  onDelete,
  onDuplicate,
  onCreateNew
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState('grid')

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      DOCUMENT_TYPES[doc.type]?.label.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = typeFilter === 'all' || doc.type === typeFilter
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 h-10 bg-gray-100 rounded-lg animate-pulse" />
          <div className="w-32 h-10 bg-gray-100 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Type Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
          >
            <option value="all">All Types</option>
            {Object.entries(DOCUMENT_TYPES).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
        >
          <option value="all">All Status</option>
          {Object.entries(DOCUMENT_STATUSES).map(([key, value]) => (
            <option key={key} value={key}>{value.label}</option>
          ))}
        </select>

        {/* View Mode Toggle */}
        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <ListIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {filteredDocuments.length} {filteredDocuments.length === 1 ? 'document' : 'documents'}
        </p>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Add Document
        </button>
      </div>

      {/* Documents Grid/List */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500 mb-4">
            {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
              ? 'No documents match your filters.'
              : 'No documents in this project yet.'}
          </p>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Create First Document
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map(doc => (
            <DocumentCard
              key={doc.id}
              document={doc}
              projectId={projectId}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredDocuments.map(doc => (
            <DocumentCard
              key={doc.id}
              document={doc}
              projectId={projectId}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
            />
          ))}
        </div>
      )}
    </div>
  )
}
