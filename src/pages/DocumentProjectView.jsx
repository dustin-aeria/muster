/**
 * DocumentProjectView.jsx
 * Project detail page showing documents and project settings
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Settings,
  FileText,
  Plus,
  Building2,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Archive,
  CheckCircle
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useOrganization } from '../hooks/useOrganization'
import {
  getDocumentProject,
  subscribeToProjectDocuments,
  createGeneratedDocument,
  deleteGeneratedDocument,
  deleteDocumentProject,
  updateDocumentProject,
  PROJECT_STATUSES
} from '../lib/firestoreDocumentGeneration'
import DocumentList from '../components/documentGeneration/DocumentList'
import CreateDocumentModal from '../components/documentGeneration/CreateDocumentModal'
import LoadingSpinner from '../components/LoadingSpinner'

export default function DocumentProjectView() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { organization } = useOrganization()

  const [project, setProject] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  // Load project
  useEffect(() => {
    if (!projectId) return

    setLoading(true)
    getDocumentProject(projectId)
      .then(setProject)
      .finally(() => setLoading(false))
  }, [projectId])

  // Subscribe to documents
  useEffect(() => {
    if (!projectId) return

    const unsubscribe = subscribeToProjectDocuments(projectId, setDocuments)
    return () => unsubscribe()
  }, [projectId])

  const handleCreateDocument = async (formData) => {
    await createGeneratedDocument({
      documentProjectId: projectId,
      organizationId: organization.id,
      type: formData.type,
      title: formData.title,
      specificRequirements: formData.specificRequirements,
      createdBy: user.uid
    })
  }

  const handleDeleteDocument = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document? This cannot be undone.')) {
      await deleteGeneratedDocument(documentId)
    }
  }

  const handleDuplicateDocument = async (documentId) => {
    const doc = documents.find(d => d.id === documentId)
    if (!doc) return

    await createGeneratedDocument({
      documentProjectId: projectId,
      organizationId: organization.id,
      type: doc.type,
      title: `${doc.title} (Copy)`,
      specificRequirements: doc.localContext?.specificRequirements,
      createdBy: user.uid
    })
  }

  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project and all its documents? This cannot be undone.')) {
      await deleteDocumentProject(projectId)
      navigate('/document-projects')
    }
  }

  const handleStatusChange = async (newStatus) => {
    await updateDocumentProject(projectId, { status: newStatus })
    setProject(prev => ({ ...prev, status: newStatus }))
    setShowMenu(false)
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading project..." />
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Project not found</p>
        <Link to="/document-projects" className="text-blue-600 hover:text-blue-700">
          Back to Projects
        </Link>
      </div>
    )
  }

  const statusConfig = PROJECT_STATUSES[project.status] || PROJECT_STATUSES.active

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          to="/document-projects"
          className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Document Projects
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-medium">{project.name}</span>
      </div>

      {/* Project Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: project.branding?.colors?.primary || '#1e3a5f' }}
            >
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {project.clientName}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Created {formatDate(project.createdAt)}
                </span>
              </div>
              {project.description && (
                <p className="mt-2 text-gray-600">{project.description}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Document
            </button>

            {/* More Actions Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                    <button
                      onClick={() => navigate(`/document-projects/${projectId}/settings`)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                    >
                      <Settings className="w-4 h-4" />
                      Project Settings
                    </button>
                    <button
                      onClick={() => navigate(`/document-projects/${projectId}/context`)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Context
                    </button>
                    <hr className="my-1" />
                    {project.status !== 'completed' && (
                      <button
                        onClick={() => handleStatusChange('completed')}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark Complete
                      </button>
                    )}
                    {project.status !== 'archived' && (
                      <button
                        onClick={() => handleStatusChange('archived')}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                      >
                        <Archive className="w-4 h-4" />
                        Archive Project
                      </button>
                    )}
                    {project.status === 'archived' && (
                      <button
                        onClick={() => handleStatusChange('active')}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Reactivate
                      </button>
                    )}
                    <hr className="my-1" />
                    <button
                      onClick={handleDeleteProject}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Project
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Context Summary */}
        {(project.sharedContext?.companyProfile ||
          project.sharedContext?.aircraftTypes?.length > 0 ||
          project.sharedContext?.regulations?.length > 0) && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Shared Context
            </p>
            <div className="flex flex-wrap gap-2">
              {project.sharedContext?.aircraftTypes?.map((type, i) => (
                <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                  {type}
                </span>
              ))}
              {project.sharedContext?.regulations?.map((reg, i) => (
                <span key={i} className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">
                  {reg}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Documents Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-400" />
          Documents
          <span className="text-sm font-normal text-gray-500">
            ({documents.length})
          </span>
        </h2>

        <DocumentList
          documents={documents}
          projectId={projectId}
          loading={false}
          onDelete={handleDeleteDocument}
          onDuplicate={handleDuplicateDocument}
          onCreateNew={() => setShowCreateModal(true)}
        />
      </div>

      {/* Create Document Modal */}
      <CreateDocumentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateDocument}
        projectName={project.name}
      />
    </div>
  )
}
