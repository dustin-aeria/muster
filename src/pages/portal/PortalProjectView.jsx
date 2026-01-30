/**
 * PortalProjectView.jsx
 * Read-only project view for client portal
 *
 * @location src/pages/portal/PortalProjectView.jsx
 */

import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  Activity,
  AlertCircle,
  MapPin,
  Calendar,
  Users,
  FileText,
  Download,
  Plane,
  Shield,
  ChevronRight
} from 'lucide-react'
import { usePortalAuth } from '../../contexts/PortalAuthContext'
import { getProjectForClient, getProjectDeliverables } from '../../lib/firestorePortal'
import { logger } from '../../lib/logger'
import PortalLayout from '../../components/portal/PortalLayout'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'

// Status config
const STATUS_CONFIG = {
  draft: { label: 'Planning', color: 'bg-gray-100 text-gray-700', icon: Clock },
  active: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: Activity },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  on_hold: { label: 'On Hold', color: 'bg-amber-100 text-amber-700', icon: AlertCircle }
}

export default function PortalProjectView() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { client } = usePortalAuth()

  const [project, setProject] = useState(null)
  const [deliverables, setDeliverables] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (client?.name && projectId) {
      loadProject()
    }
  }, [client?.name, projectId])

  const loadProject = async () => {
    try {
      setLoading(true)
      setError(null)

      const projectData = await getProjectForClient(projectId, client.name)
      if (!projectData) {
        setError('Project not found or access denied')
        return
      }

      setProject(projectData)

      // Load deliverables
      const deliverableData = await getProjectDeliverables(projectId)
      setDeliverables(deliverableData)
    } catch (err) {
      logger.error('Failed to load project:', err)
      setError('Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (loading) {
    return (
      <PortalLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded-lg" />
          <div className="h-48 bg-gray-200 rounded-lg" />
        </div>
      </PortalLayout>
    )
  }

  if (error || !project) {
    return (
      <PortalLayout>
        <Card className="p-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Project Not Found'}
          </h2>
          <p className="text-gray-500 mb-6">
            This project may not exist or you don't have access to view it.
          </p>
          <Link to="/portal/projects">
            <Button variant="secondary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </Card>
      </PortalLayout>
    )
  }

  const statusConfig = STATUS_CONFIG[project.status] || STATUS_CONFIG.draft
  const StatusIcon = statusConfig.icon
  const siteCount = project.sites?.length || 0
  const crewCount = project.crew?.length || 0

  return (
    <PortalLayout>
      {/* Back Link */}
      <Link
        to="/portal/projects"
        className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </Link>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <Badge className={statusConfig.color}>
              <StatusIcon className="w-3.5 h-3.5 mr-1" />
              {statusConfig.label}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
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
            {crewCount > 0 && (
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {crewCount} team member{crewCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sites */}
          {siteCount > 0 && (
            <Card>
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  Project Sites
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                {project.sites.map((site, index) => (
                  <div key={site.id || index} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {site.name || `Site ${index + 1}`}
                        </h3>
                        {site.description && (
                          <p className="text-sm text-gray-500 mt-1">
                            {site.description}
                          </p>
                        )}
                        {site.siteSurvey?.location?.address && (
                          <p className="text-sm text-gray-500 mt-1">
                            {site.siteSurvey.location.address}
                          </p>
                        )}
                      </div>
                      {site.status && (
                        <Badge className={
                          site.status === 'completed' ? 'bg-green-100 text-green-700' :
                          site.status === 'active' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }>
                          {site.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Project Overview */}
          <Card>
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Project Overview</h2>
            </div>
            <div className="p-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Flight Plan Summary */}
                {project.flightPlan && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-700 mb-2">
                      <Plane className="w-4 h-4" />
                      <span className="font-medium">Flight Operations</span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      {project.flightPlan.aircraft?.model && (
                        <div>Aircraft: {project.flightPlan.aircraft.model}</div>
                      )}
                      {project.flightPlan.operationType && (
                        <div>Type: {project.flightPlan.operationType}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Safety Summary */}
                {(project.hseRiskAssessment || project.emergencyPlan) && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-700 mb-2">
                      <Shield className="w-4 h-4" />
                      <span className="font-medium">Safety & Compliance</span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      {project.hseRiskAssessment?.risks?.length > 0 && (
                        <div>{project.hseRiskAssessment.risks.length} hazards assessed</div>
                      )}
                      {project.emergencyPlan?.hospitalName && (
                        <div>Emergency plan: Complete</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Notes or Description */}
              {project.notes && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">{project.notes}</div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Deliverables */}
          <Card>
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-500" />
                Deliverables
              </h2>
            </div>

            {deliverables.length === 0 ? (
              <div className="p-6 text-center">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  No deliverables available yet
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {deliverables.map(deliverable => (
                  <div key={deliverable.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {deliverable.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {formatFileSize(deliverable.fileSize)}
                          {deliverable.createdAt && (
                            <span> • {formatDate(deliverable.createdAt)}</span>
                          )}
                        </div>
                      </div>
                      {deliverable.fileUrl && (
                        <a
                          href={deliverable.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="p-3 border-t border-gray-200">
              <Link
                to="/portal/documents"
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View All Documents
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </Card>

          {/* Team */}
          {crewCount > 0 && (
            <Card>
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-500" />
                  Project Team
                </h2>
              </div>
              <div className="p-4 space-y-3">
                {project.crew.slice(0, 5).map((member, index) => (
                  <div key={member.id || index} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {member.name || 'Team Member'}
                      </div>
                      {member.role && (
                        <div className="text-xs text-gray-500">{member.role}</div>
                      )}
                    </div>
                  </div>
                ))}
                {crewCount > 5 && (
                  <div className="text-sm text-gray-500">
                    +{crewCount - 5} more team members
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </PortalLayout>
  )
}
