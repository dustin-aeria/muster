/**
 * Projects.jsx
 * Projects list page with client logo support
 * 
 * FIXES APPLIED:
 * - Issue #3 & #10: Added client logo/icon display in project cards
 * 
 * @location src/pages/Projects.jsx
 * @action REPLACE
 */

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Plus,
  Search,
  FolderKanban,
  Filter,
  Calendar,
  Building2,
  ChevronRight,
  MoreVertical,
  Trash2,
  Copy,
  AlertTriangle
} from 'lucide-react'
import { getProjects, deleteProject, duplicateProject, getClients } from '../lib/firestore'
import { useOrganizationContext } from '../contexts/OrganizationContext'
import NewProjectModal from '../components/NewProjectModal'
import { format } from 'date-fns'
import { logger } from '../lib/logger'

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  planning: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-purple-100 text-purple-700',
  archived: 'bg-gray-100 text-gray-500'
}

const statusLabels = {
  draft: 'Draft',
  planning: 'Planning',
  active: 'Active',
  completed: 'Completed',
  archived: 'Archived'
}

export default function Projects() {
  const navigate = useNavigate()
  const { organizationId } = useOrganizationContext()
  const [projects, setProjects] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showNewModal, setShowNewModal] = useState(false)
  const [menuOpen, setMenuOpen] = useState(null)

  useEffect(() => {
    if (organizationId) {
      loadData()
    }
  }, [organizationId])

  const loadData = async () => {
    if (!organizationId) return
    setLoading(true)
    setLoadError(null)
    try {
      // Load projects and clients in parallel
      const [projectsData, clientsData] = await Promise.all([
        getProjects(organizationId),
        getClients(organizationId)
      ])
      setProjects(projectsData)
      setClients(clientsData)
    } catch (err) {
      logger.error('Failed to load projects:', err)
      setLoadError('Failed to load projects. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadProjects = async () => {
    if (!organizationId) return
    setLoading(true)
    try {
      const data = await getProjects(organizationId)
      setProjects(data)
    } catch (err) {
      // Intentionally silent for retry - empty state will be shown with error banner above
      logger.debug('Project reload failed (user already notified):', err)
    } finally {
      setLoading(false)
    }
  }

  // FIX #3 & #10: Helper to get client data including logo
  const getClientForProject = (project) => {
    if (!project.clientId) return null
    return clients.find(c => c.id === project.clientId) || null
  }

  const handleDelete = async (projectId, projectName) => {
    if (!confirm(`Are you sure you want to delete "${projectName}"? This cannot be undone.`)) {
      return
    }

    try {
      await deleteProject(projectId)
      setProjects(prev => prev.filter(p => p.id !== projectId))
    } catch (err) {
      logger.error('Failed to delete project:', err)
      alert('Failed to delete project. Please try again.')
    }
    setMenuOpen(null)
  }

  const handleDuplicate = async (projectId, projectName) => {
    try {
      const newProject = await duplicateProject(projectId)
      // Add to list and navigate to the new project
      setProjects(prev => [newProject, ...prev])
      setMenuOpen(null)
      navigate(`/projects/${newProject.id}`)
    } catch (err) {
      logger.error('Failed to duplicate project:', err)
      alert('Failed to duplicate project. Please try again.')
    }
  }

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.projectCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.clientName?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const formatDate = (dates) => {
    if (!dates?.startDate) return 'No date set'
    
    try {
      const start = format(new Date(dates.startDate), 'MMM d, yyyy')
      if (dates.type === 'range' && dates.endDate && dates.endDate !== dates.startDate) {
        const end = format(new Date(dates.endDate), 'MMM d, yyyy')
        return `${start} - ${end}`
      }
      return start
    } catch {
      return 'Invalid date'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">Manage your operations plans</p>
        </div>
        <button 
          onClick={() => setShowNewModal(true)}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row gap-3" role="search">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
          <label htmlFor="project-search" className="sr-only">Search projects</label>
          <input
            id="project-search"
            type="search"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9"
            aria-describedby="search-results-count"
          />
        </div>
        <label htmlFor="status-filter" className="sr-only">Filter by status</label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-full sm:w-40"
          aria-label="Filter projects by status"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      <span id="search-results-count" className="sr-only">
        {filteredProjects.length} projects found
      </span>

      {/* Error display */}
      {loadError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-800 font-medium">Unable to load projects</p>
            <p className="text-red-600 text-sm">{loadError}</p>
          </div>
          <button
            onClick={loadData}
            className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* Projects list */}
      {loading ? (
        <div className="card text-center py-12">
          <div className="w-8 h-8 border-4 border-aeria-navy border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading projects...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="card text-center py-12">
          <FolderKanban className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          {projects.length === 0 ? (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No projects yet</h3>
              <p className="text-gray-500 mb-4">
                Create your first project to get started with operations planning.
              </p>
              <button 
                onClick={() => setShowNewModal(true)}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Project
              </button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No matching projects</h3>
              <p className="text-gray-500">
                Try adjusting your search or filters.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProjects.map((project) => {
            // FIX #3 & #10: Get client data for logo
            const client = getClientForProject(project)
            
            return (
              <div 
                key={project.id} 
                className="card hover:shadow-md transition-shadow group cursor-pointer"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <div className="flex items-center gap-4">
                  {/* FIX #3 & #10: Client logo or fallback icon */}
                  {client?.logo ? (
                    <div className="w-10 h-10 rounded-lg border bg-white flex items-center justify-center p-1 flex-shrink-0">
                      <img 
                        src={client.logo} 
                        alt={client.name} 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  ) : project.clientId ? (
                    <div className="w-10 h-10 bg-gradient-to-br from-aeria-blue to-aeria-navy rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-aeria-sky rounded-lg flex items-center justify-center flex-shrink-0">
                      <FolderKanban className="w-5 h-5 text-aeria-navy" />
                    </div>
                  )}
                  
                  {/* Project info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link 
                        to={`/projects/${project.id}`}
                        className="font-semibold text-gray-900 hover:text-aeria-blue truncate"
                      >
                        {project.name}
                      </Link>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[project.status]}`}>
                        {statusLabels[project.status]}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(project.dates)}
                      </span>
                      {project.clientName && (
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {project.clientName}
                        </span>
                      )}
                      {project.projectCode && (
                        <span className="text-gray-400 font-mono text-xs">
                          {project.projectCode}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/projects/${project.id}`}
                      className="p-2 text-gray-400 hover:text-aeria-blue rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                    
                    {/* More menu */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setMenuOpen(menuOpen === project.id ? null : project.id)
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {menuOpen === project.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-10"
                            onClick={() => setMenuOpen(null)}
                          />
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDuplicate(project.id, project.name)
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Copy className="w-4 h-4" />
                              Duplicate
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(project.id, project.name)
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* New Project Modal */}
      <NewProjectModal 
        isOpen={showNewModal} 
        onClose={() => {
          setShowNewModal(false)
          loadData() // Refresh list after creating
        }} 
      />
    </div>
  )
}
