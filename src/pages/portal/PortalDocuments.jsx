/**
 * PortalDocuments.jsx
 * Client portal documents and deliverables page
 *
 * @location src/pages/portal/PortalDocuments.jsx
 */

import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  Download,
  Search,
  Filter,
  FolderOpen,
  File,
  Image,
  FileSpreadsheet,
  FileCode,
  Calendar,
  ChevronRight
} from 'lucide-react'
import { usePortalAuth } from '../../contexts/PortalAuthContext'
import { getProjectsForClient, getProjectDeliverables } from '../../lib/firestorePortal'
import { logger } from '../../lib/logger'
import PortalLayout from '../../components/portal/PortalLayout'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'

// File type icons
const getFileIcon = (mimeType) => {
  if (!mimeType) return File
  if (mimeType.startsWith('image/')) return Image
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) return FileSpreadsheet
  if (mimeType.includes('pdf')) return FileText
  if (mimeType.includes('json') || mimeType.includes('xml')) return FileCode
  return File
}

// File type colors
const getFileColor = (mimeType) => {
  if (!mimeType) return 'bg-gray-100 text-gray-600'
  if (mimeType.startsWith('image/')) return 'bg-purple-100 text-purple-600'
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) return 'bg-green-100 text-green-600'
  if (mimeType.includes('pdf')) return 'bg-red-100 text-red-600'
  return 'bg-blue-100 text-blue-600'
}

export default function PortalDocuments() {
  const { client } = usePortalAuth()
  const [projects, setProjects] = useState([])
  const [allDeliverables, setAllDeliverables] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProject, setSelectedProject] = useState('all')

  useEffect(() => {
    if (client?.name) {
      loadData()
    }
  }, [client?.name])

  const loadData = async () => {
    try {
      setLoading(true)

      // Get all projects
      const projectData = await getProjectsForClient(client.name)
      setProjects(projectData)

      // Get deliverables for all projects
      const deliverablePromises = projectData.map(async (project) => {
        const deliverables = await getProjectDeliverables(project.id)
        return deliverables.map(d => ({
          ...d,
          projectId: project.id,
          projectName: project.name
        }))
      })

      const deliverableResults = await Promise.all(deliverablePromises)
      const flatDeliverables = deliverableResults.flat()

      // Sort by date (newest first)
      flatDeliverables.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0
        const bTime = b.createdAt?.toMillis?.() || 0
        return bTime - aTime
      })

      setAllDeliverables(flatDeliverables)
    } catch (err) {
      logger.error('Failed to load documents:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter deliverables
  const filteredDeliverables = useMemo(() => {
    return allDeliverables.filter(deliverable => {
      // Project filter
      if (selectedProject !== 'all' && deliverable.projectId !== selectedProject) {
        return false
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          deliverable.name?.toLowerCase().includes(query) ||
          deliverable.projectName?.toLowerCase().includes(query) ||
          deliverable.description?.toLowerCase().includes(query)
        )
      }

      return true
    })
  }, [allDeliverables, selectedProject, searchQuery])

  // Group by project
  const deliverablesByProject = useMemo(() => {
    const grouped = {}
    filteredDeliverables.forEach(d => {
      if (!grouped[d.projectId]) {
        grouped[d.projectId] = {
          projectId: d.projectId,
          projectName: d.projectName,
          deliverables: []
        }
      }
      grouped[d.projectId].deliverables.push(d)
    })
    return Object.values(grouped)
  }, [filteredDeliverables])

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

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <PortalLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-7 h-7 text-gray-500" />
          Documents
        </h1>
        <p className="text-gray-500 mt-1">
          Download project deliverables and reports
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
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Project Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Documents */}
      {loading ? (
        <Card className="p-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg" />
            ))}
          </div>
        </Card>
      ) : allDeliverables.length === 0 ? (
        <Card className="p-12 text-center">
          <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Documents Available
          </h3>
          <p className="text-gray-500">
            Project documents and deliverables will appear here once they are uploaded.
          </p>
        </Card>
      ) : filteredDeliverables.length === 0 ? (
        <Card className="p-12 text-center">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Matching Documents
          </h3>
          <p className="text-gray-500">
            Try adjusting your search or project filter.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {deliverablesByProject.map(group => (
            <Card key={group.projectId}>
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-gray-500" />
                  {group.projectName}
                </h2>
                <Link
                  to={`/portal/projects/${group.projectId}`}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  View Project
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="divide-y divide-gray-100">
                {group.deliverables.map(deliverable => {
                  const FileIcon = getFileIcon(deliverable.mimeType)
                  const fileColor = getFileColor(deliverable.mimeType)

                  return (
                    <div
                      key={deliverable.id}
                      className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                    >
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${fileColor}`}>
                        <FileIcon className="w-5 h-5" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {deliverable.name}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                          {deliverable.fileSize && (
                            <span>{formatFileSize(deliverable.fileSize)}</span>
                          )}
                          {deliverable.createdAt && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(deliverable.createdAt)}
                            </span>
                          )}
                        </div>
                        {deliverable.description && (
                          <p className="text-sm text-gray-500 mt-1 truncate">
                            {deliverable.description}
                          </p>
                        )}
                      </div>

                      {/* Download */}
                      {deliverable.fileUrl && (
                        <a
                          href={deliverable.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={deliverable.fileName}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </a>
                      )}
                    </div>
                  )
                })}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Results count */}
      {!loading && filteredDeliverables.length > 0 && (
        <div className="mt-4 text-sm text-gray-500 text-center">
          Showing {filteredDeliverables.length} document{filteredDeliverables.length !== 1 ? 's' : ''}
          {selectedProject === 'all' ? ` across ${deliverablesByProject.length} project${deliverablesByProject.length !== 1 ? 's' : ''}` : ''}
        </div>
      )}
    </PortalLayout>
  )
}
