/**
 * PortalDashboard.jsx
 * Client portal dashboard - overview of projects and recent activity
 *
 * @location src/pages/portal/PortalDashboard.jsx
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FolderKanban,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  ChevronRight,
  Activity,
  Calendar
} from 'lucide-react'
import { usePortalAuth } from '../../contexts/PortalAuthContext'
import { getProjectsForClient } from '../../lib/firestorePortal'
import { logger } from '../../lib/logger'
import PortalLayout from '../../components/portal/PortalLayout'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'

// Status colors
const STATUS_CONFIG = {
  draft: { label: 'Planning', color: 'bg-gray-100 text-gray-700', icon: Clock },
  active: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: Activity },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  on_hold: { label: 'On Hold', color: 'bg-amber-100 text-amber-700', icon: AlertCircle }
}

export default function PortalDashboard() {
  const { client, portalUser } = usePortalAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

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

  // Calculate stats
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    draft: projects.filter(p => p.status === 'draft').length
  }

  // Get recent projects (last 5)
  const recentProjects = projects.slice(0, 5)

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
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back{portalUser?.name ? `, ${portalUser.name.split(' ')[0]}` : ''}!
        </h1>
        <p className="text-gray-500 mt-1">
          Here's an overview of your projects with {client?.name || 'us'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FolderKanban className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-500">Total Projects</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
              <div className="text-sm text-gray-500">In Progress</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.draft}</div>
              <div className="text-sm text-gray-500">Planning</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Projects */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-gray-500" />
                Recent Projects
              </h2>
              <Link
                to="/portal/projects"
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-gray-100 rounded-lg" />
                  ))}
                </div>
              </div>
            ) : recentProjects.length === 0 ? (
              <div className="p-8 text-center">
                <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No projects yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentProjects.map(project => {
                  const statusConfig = STATUS_CONFIG[project.status] || STATUS_CONFIG.draft
                  const StatusIcon = statusConfig.icon

                  return (
                    <Link
                      key={project.id}
                      to={`/portal/projects/${project.id}`}
                      className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        statusConfig.color.split(' ')[0]
                      }`}>
                        <StatusIcon className={`w-5 h-5 ${
                          statusConfig.color.split(' ')[1]
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {project.name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(project.createdAt)}
                          {project.sites?.length > 0 && (
                            <span>• {project.sites.length} site{project.sites.length !== 1 ? 's' : ''}</span>
                          )}
                        </div>
                      </div>
                      <Badge className={statusConfig.color}>
                        {statusConfig.label}
                      </Badge>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </Link>
                  )
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Quick Links / Info */}
        <div className="space-y-6">
          {/* Contact Card */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Need Assistance?</h3>
            <p className="text-sm text-gray-500 mb-4">
              Our team is here to help with any questions about your projects.
            </p>
            <div className="space-y-2">
              {client?.email && (
                <a
                  href={`mailto:${client.email}`}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <span>Email: {client.email}</span>
                </a>
              )}
              {client?.phone && (
                <a
                  href={`tel:${client.phone}`}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <span>Phone: {client.phone}</span>
                </a>
              )}
            </div>
          </Card>

          {/* Documents Quick Access */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-500" />
              Documents
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Access project deliverables and reports
            </p>
            <Link
              to="/portal/documents"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              View All Documents
              <ChevronRight className="w-4 h-4" />
            </Link>
          </Card>

          {/* Last Login Info */}
          {portalUser?.lastLoginAt && (
            <Card className="p-4 bg-gray-50">
              <div className="text-xs text-gray-500">
                Last login: {formatDate(portalUser.lastLoginAt)}
              </div>
            </Card>
          )}
        </div>
      </div>
    </PortalLayout>
  )
}
