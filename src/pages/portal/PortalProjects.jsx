/**
 * PortalProjects.jsx
 * Client portal projects list
 *
 * @location src/pages/portal/PortalProjects.jsx
 */

import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  FolderKanban,
  Search,
  Filter,
  Clock,
  CheckCircle,
  Activity,
  AlertCircle,
  ChevronRight,
  Calendar,
  MapPin
} from 'lucide-react'
import { usePortalAuth } from '../../contexts/PortalAuthContext'
import { getProjectsForClient } from '../../lib/firestorePortal'
import { logger } from '../../lib/logger'
import PortalLayout from '../../components/portal/PortalLayout'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Input } from '../../components/ui/Input'

// Status colors
const STATUS_CONFIG = {
  draft: { label: 'Planning', color: 'bg-gray-100 text-gray-700', icon: Clock },
  active: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: Activity },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  on_hold: { label: 'On Hold', color: 'bg-amber-100 text-amber-700', icon: AlertCircle }
}

const STATUS_FILTERS = [
  { value: 'all', label: 'All Projects' },
  { value: 'active', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'draft', label: 'Planning' }
]

export default function PortalProjects() {
  const { client } = usePortalAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    if (client?.name) {
      loadProjects()
    }
  }, [client?.name])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const data = await getProjectsForClient(client.name)
      setProjects(data)
    } catch (err) {
      logger.error('Failed to load projects:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      // Status filter
      if (statusFilter !== 'all' && project.status !== statusFilter) {
        return false
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          project.name?.toLowerCase().includes(query) ||
          project.sites?.some(site => site.name?.toLowerCase().includes(query))
        )
      }

      return true
    })
  }, [projects, searchQuery, statusFilter])

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <PortalLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FolderKanban className="w-7 h-7 text-gray-500" />
          Projects
        </h1>
        <p className="text-gray-500 mt-1">
          View all your projects and their status
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <div className="flex gap-1">
              {STATUS_FILTERS.map(filter => (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === filter.value
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Projects List */}
      {loading ? (
        <Card className="p-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-100 rounded-lg" />
            ))}
          </div>
        </Card>
      ) : filteredProjects.length === 0 ? (
        <Card className="p-12 text-center">
          <FolderKanban className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || statusFilter !== 'all' ? 'No matching projects' : 'No projects yet'}
          </h3>
          <p className="text-gray-500">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Projects will appear here once they are created'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map(project => {
            const statusConfig = STATUS_CONFIG[project.status] || STATUS_CONFIG.draft
            const StatusIcon = statusConfig.icon
            const siteCount = project.sites?.length || 0

            return (
              <Link
                key={project.id}
                to={`/portal/projects/${project.id}`}
                className="block"
              >
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      statusConfig.color.split(' ')[0]
                    }`}>
                      <StatusIcon className={`w-6 h-6 ${
                        statusConfig.color.split(' ')[1]
                      }`} />
                    </div>

                    {/* Project Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {project.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Created {formatDate(project.createdAt)}
                            </span>
                            {siteCount > 0 && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {siteCount} site{siteCount !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge className={statusConfig.color}>
                            {statusConfig.label}
                          </Badge>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>

                      {/* Sites Preview */}
                      {siteCount > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {project.sites.slice(0, 3).map(site => (
                            <span
                              key={site.id}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                            >
                              {site.name || 'Unnamed Site'}
                            </span>
                          ))}
                          {siteCount > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md">
                              +{siteCount - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}

      {/* Results count */}
      {!loading && filteredProjects.length > 0 && (
        <div className="mt-4 text-sm text-gray-500 text-center">
          Showing {filteredProjects.length} of {projects.length} project{projects.length !== 1 ? 's' : ''}
        </div>
      )}
    </PortalLayout>
  )
}
