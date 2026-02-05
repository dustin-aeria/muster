/**
 * DocumentProjectList.jsx
 * Grid display of document project cards with filtering
 */

import { useState } from 'react'
import { Search, Filter, SortAsc } from 'lucide-react'
import DocumentProjectCard from './DocumentProjectCard'
import { PROJECT_STATUSES } from '../../lib/firestoreDocumentGeneration'

export default function DocumentProjectList({
  projects,
  loading,
  onDelete,
  onStatusChange
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('updatedAt')

  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' || project.status === statusFilter

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name)
      }
      if (sortBy === 'client') {
        return (a.clientName || '').localeCompare(b.clientName || '')
      }
      // Default: updatedAt descending
      const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(0)
      const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(0)
      return dateB - dateA
    })

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-5 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
            <div className="h-3 bg-gray-200 rounded w-full mb-2" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
          </div>
        ))}
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
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
          >
            <option value="all">All Status</option>
            {Object.entries(PROJECT_STATUSES).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="relative">
          <SortAsc className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
          >
            <option value="updatedAt">Recently Updated</option>
            <option value="name">Name</option>
            <option value="client">Client</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-500">
        {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
        {searchQuery && ` matching "${searchQuery}"`}
      </p>

      {/* Project Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">
            {searchQuery || statusFilter !== 'all'
              ? 'No projects match your filters.'
              : 'No document projects yet. Create your first one!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map(project => (
            <DocumentProjectCard
              key={project.id}
              project={project}
              onDelete={onDelete}
              onArchive={onStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}
