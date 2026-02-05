/**
 * DocumentProjects.jsx
 * Main page for listing all document generation projects
 */

import { useState, useEffect } from 'react'
import { Plus, FileText, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useOrganization } from '../hooks/useOrganization'
import {
  subscribeToDocumentProjects,
  createDocumentProject,
  deleteDocumentProject,
  updateDocumentProject
} from '../lib/firestoreDocumentGeneration'
import DocumentProjectList from '../components/documentGeneration/DocumentProjectList'
import CreateProjectModal from '../components/documentGeneration/CreateProjectModal'

export default function DocumentProjects() {
  const { user } = useAuth()
  const { organization } = useOrganization()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Subscribe to projects
  useEffect(() => {
    if (!organization?.id) return

    setLoading(true)
    const unsubscribe = subscribeToDocumentProjects(organization.id, (data) => {
      setProjects(data)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [organization?.id])

  const handleCreateProject = async (formData) => {
    await createDocumentProject({
      organizationId: organization.id,
      clientId: formData.clientId,
      clientName: formData.clientName,
      name: formData.name,
      description: formData.description,
      companyProfile: formData.companyProfile,
      operationsScope: formData.operationsScope,
      aircraftTypes: formData.aircraftTypes,
      regulations: formData.regulations,
      customContext: formData.customContext,
      branding: formData.branding,
      createdBy: user.uid
    })
  }

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project and all its documents? This cannot be undone.')) {
      await deleteDocumentProject(projectId)
    }
  }

  const handleStatusChange = async (projectId, newStatus) => {
    await updateDocumentProject(projectId, { status: newStatus })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-blue-600" />
            Document Generator
          </h1>
          <p className="text-gray-500 mt-1">
            AI-powered compliance documentation for your clients
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          New Project
        </button>
      </div>

      {/* Feature Highlight */}
      {projects.length === 0 && !loading && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                AI-Powered Document Generation
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Create comprehensive compliance documentation through conversational AI.
                Generate Safety Management Systems, Training Manuals, SOPs, and more with
                intelligent assistance that understands aviation regulations.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  10+ document types supported
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  Shared context across project documents
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  Export to PDF with client branding
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      {projects.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Projects</p>
            <p className="text-2xl font-semibold text-gray-900">{projects.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Active</p>
            <p className="text-2xl font-semibold text-green-600">
              {projects.filter(p => p.status === 'active').length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-semibold text-blue-600">
              {projects.filter(p => p.status === 'completed').length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Documents</p>
            <p className="text-2xl font-semibold text-gray-900">
              {projects.reduce((sum, p) => sum + (p.documentIds?.length || 0), 0)}
            </p>
          </div>
        </div>
      )}

      {/* Project List */}
      <DocumentProjectList
        projects={projects}
        loading={loading}
        onDelete={handleDeleteProject}
        onStatusChange={handleStatusChange}
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  )
}
