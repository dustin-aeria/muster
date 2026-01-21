/**
 * ComplianceHub.jsx
 * Main dashboard for Compliance Matrix Engine
 *
 * Features:
 * - View all compliance applications
 * - Quick stats by status
 * - Create new applications from templates
 * - Recent activity
 * - Template library access
 *
 * @location src/pages/ComplianceHub.jsx
 */

import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ClipboardCheck,
  FileCheck,
  Plus,
  Search,
  Filter,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  XCircle,
  Loader2,
  FolderOpen,
  LayoutGrid,
  List,
  RefreshCw,
  BookOpen,
  Trash2,
  MoreVertical,
  Calendar,
  Building2,
  Plane
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import {
  getComplianceApplications,
  getComplianceTemplates,
  deleteComplianceApplication,
  APPLICATION_STATUSES,
  TEMPLATE_CATEGORIES
} from '../lib/firestoreCompliance'
import { seedAllComplianceTemplates } from '../lib/seedComplianceTemplates'

// ============================================
// STATUS HELPERS
// ============================================

const getStatusConfig = (status) => {
  const configs = {
    draft: { icon: FileText, color: 'gray', bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
    'in-progress': { icon: Clock, color: 'blue', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    'ready-for-review': { icon: AlertCircle, color: 'amber', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
    submitted: { icon: Send, color: 'purple', bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
    approved: { icon: CheckCircle2, color: 'green', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
    rejected: { icon: XCircle, color: 'red', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' }
  }
  return configs[status] || configs.draft
}

const formatDate = (dateValue) => {
  if (!dateValue) return 'N/A'
  const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue)
  return date.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatRelativeDate = (dateValue) => {
  if (!dateValue) return 'N/A'
  const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return formatDate(dateValue)
}

// ============================================
// SUB-COMPONENTS
// ============================================

function StatusBadge({ status }) {
  const config = getStatusConfig(status)
  const StatusIcon = config.icon
  const statusInfo = APPLICATION_STATUSES[status] || { name: status }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <StatusIcon className="w-3.5 h-3.5" />
      {statusInfo.name}
    </span>
  )
}

function ProgressBar({ progress }) {
  const percent = progress?.percentComplete || 0

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${
            percent === 100 ? 'bg-green-500' : percent > 50 ? 'bg-blue-500' : 'bg-amber-500'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 w-10 text-right">{percent}%</span>
    </div>
  )
}

function ApplicationCard({ application, onDelete, viewMode }) {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const statusConfig = getStatusConfig(application.status)

  const handleClick = () => {
    navigate(`/compliance/application/${application.id}`)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    setShowMenu(false)
    if (window.confirm(`Delete "${application.name}"? This cannot be undone.`)) {
      onDelete(application.id)
    }
  }

  if (viewMode === 'list') {
    return (
      <div
        onClick={handleClick}
        className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
      >
        {/* Icon */}
        <div className={`p-2 rounded-lg ${statusConfig.bg}`}>
          <ClipboardCheck className={`w-5 h-5 ${statusConfig.text}`} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 truncate">{application.name}</h3>
            <StatusBadge status={application.status} />
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5" />
              {application.templateName}
            </span>
            {application.projectName && (
              <span className="flex items-center gap-1">
                <Plane className="w-3.5 h-3.5" />
                {application.projectName}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Updated {formatRelativeDate(application.updatedAt)}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="w-32">
          <ProgressBar progress={application.progress} />
        </div>

        {/* Actions */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
              <button
                onClick={handleDelete}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>

        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    )
  }

  // Grid view
  return (
    <div
      onClick={handleClick}
      className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all cursor-pointer flex flex-col h-full"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${statusConfig.bg}`}>
          <ClipboardCheck className={`w-5 h-5 ${statusConfig.text}`} />
        </div>
        <StatusBadge status={application.status} />
      </div>

      <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{application.name}</h3>
      <p className="text-sm text-gray-500 mb-3">{application.templateName}</p>

      <div className="mt-auto">
        <ProgressBar progress={application.progress} />
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <span>Updated {formatRelativeDate(application.updatedAt)}</span>
          <span>{application.progress?.complete || 0}/{application.progress?.total || 0}</span>
        </div>
      </div>
    </div>
  )
}

function TemplateCard({ template, onSelect }) {
  const categoryConfig = TEMPLATE_CATEGORIES[template.category] || TEMPLATE_CATEGORIES.general

  return (
    <div
      onClick={() => onSelect(template)}
      className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg bg-${categoryConfig.color}-100`}>
          <FileCheck className={`w-5 h-5 text-${categoryConfig.color}-600`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900">{template.shortName || template.name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{template.regulatoryBody}</p>
          <p className="text-xs text-gray-400 mt-1">{template.requirements?.length || 0} requirements</p>
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-3 line-clamp-2">{template.description}</p>
    </div>
  )
}

function NewApplicationModal({ isOpen, onClose, templates, onCreateApplication }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [applicationName, setApplicationName] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    if (!selectedTemplate || !applicationName.trim()) return

    setCreating(true)
    try {
      await onCreateApplication({
        templateId: selectedTemplate.id,
        name: applicationName.trim()
      })
      onClose()
      setSelectedTemplate(null)
      setApplicationName('')
    } catch (error) {
      console.error('Error creating application:', error)
      alert('Failed to create application. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">New Compliance Application</h2>
          <p className="text-gray-500 mt-1">Select a template and provide a name for your application</p>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* Step 1: Select Template */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              1. Select a Template
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {templates.filter(t => t.status === 'active').map(template => (
                <div
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template)
                    if (!applicationName) {
                      setApplicationName(`${template.shortName || template.name} - ${new Date().toLocaleDateString()}`)
                    }
                  }}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileCheck className={`w-4 h-4 ${selectedTemplate?.id === template.id ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className="font-medium text-gray-900">{template.shortName || template.name}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{template.regulatoryBody} • {template.requirements?.length || 0} requirements</p>
                </div>
              ))}
            </div>
            {templates.filter(t => t.status === 'active').length === 0 && (
              <p className="text-gray-500 text-center py-4">No templates available. Please seed templates first.</p>
            )}
          </div>

          {/* Step 2: Name */}
          {selectedTemplate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                2. Application Name
              </label>
              <input
                type="text"
                value={applicationName}
                onChange={(e) => setApplicationName(e.target.value)}
                placeholder="e.g., BVLOS Pipeline Inspection - Q1 2025"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!selectedTemplate || !applicationName.trim() || creating}
            className="px-4 py-2 bg-aeria-navy text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Application
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ onCreateNew, hasTemplates }) {
  return (
    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
      <FolderOpen className="w-12 h-12 mx-auto text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No compliance applications yet</h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        {hasTemplates
          ? 'Start a new compliance application to begin filling out regulatory requirements.'
          : 'Seed compliance templates first, then create applications.'}
      </p>
      {hasTemplates && (
        <button
          onClick={onCreateNew}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Application
        </button>
      )}
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ComplianceHub() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // State
  const [applications, setApplications] = useState([])
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState(null)
  const [viewMode, setViewMode] = useState('list')
  const [showNewModal, setShowNewModal] = useState(false)
  const [seeding, setSeeding] = useState(false)

  // Load data
  const loadData = async () => {
    try {
      setError('')
      const [appsData, templatesData] = await Promise.all([
        getComplianceApplications(),
        getComplianceTemplates()
      ])
      setApplications(appsData)
      setTemplates(templatesData)
    } catch (err) {
      console.error('Error loading compliance data:', err)
      setError('Failed to load compliance data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Seed templates
  const handleSeedTemplates = async () => {
    setSeeding(true)
    setError('')
    try {
      const result = await seedAllComplianceTemplates(user?.uid)
      if (result.success) {
        await loadData()
      } else {
        setError('Some templates failed to seed. Check console for details.')
      }
    } catch (err) {
      console.error('Error seeding templates:', err)
      setError('Failed to seed templates. Please try again.')
    } finally {
      setSeeding(false)
    }
  }

  // Create application
  const handleCreateApplication = async (data) => {
    // Import dynamically to avoid circular dependency
    const { createComplianceApplication } = await import('../lib/firestoreCompliance')
    const application = await createComplianceApplication({
      ...data,
      createdBy: user?.uid
    })
    await loadData()
    navigate(`/compliance/application/${application.id}`)
  }

  // Delete application
  const handleDeleteApplication = async (id) => {
    try {
      await deleteComplianceApplication(id)
      setApplications(prev => prev.filter(app => app.id !== id))
    } catch (err) {
      console.error('Error deleting application:', err)
      setError('Failed to delete application.')
    }
  }

  // Filter applications
  const filteredApplications = useMemo(() => {
    let result = [...applications]

    if (statusFilter) {
      result = result.filter(app => app.status === statusFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(app =>
        app.name?.toLowerCase().includes(query) ||
        app.templateName?.toLowerCase().includes(query) ||
        app.projectName?.toLowerCase().includes(query)
      )
    }

    return result
  }, [applications, statusFilter, searchQuery])

  // Calculate stats
  const stats = useMemo(() => {
    const all = applications.length
    const draft = applications.filter(a => a.status === 'draft').length
    const inProgress = applications.filter(a => a.status === 'in-progress').length
    const review = applications.filter(a => a.status === 'ready-for-review').length
    const submitted = applications.filter(a => a.status === 'submitted').length
    const approved = applications.filter(a => a.status === 'approved').length

    return { all, draft, inProgress, review, submitted, approved }
  }, [applications])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-aeria-navy" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto p-1 hover:bg-red-100 rounded">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <ClipboardCheck className="w-7 h-7 text-aeria-navy" />
              Compliance Hub
            </h1>
            <p className="text-gray-500 mt-1">
              Manage regulatory compliance applications and submissions
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Seed Templates Button (only show if no templates) */}
            {templates.length === 0 && (
              <button
                onClick={handleSeedTemplates}
                disabled={seeding}
                className="btn-secondary flex items-center gap-2"
              >
                {seeding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Seeding...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Seed Templates
                  </>
                )}
              </button>
            )}

            {/* Template Library Link */}
            <Link
              to="/compliance/templates"
              className="btn-secondary flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Template Library
            </Link>

            {/* New Application Button */}
            <button
              onClick={() => setShowNewModal(true)}
              disabled={templates.filter(t => t.status === 'active').length === 0}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Application
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => setStatusFilter(null)}
            className={`text-center px-4 py-2 rounded-lg transition-colors ${
              statusFilter === null ? 'bg-gray-100' : 'hover:bg-gray-50'
            }`}
          >
            <p className="text-2xl font-bold text-gray-900">{stats.all}</p>
            <p className="text-xs text-gray-500">Total</p>
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`text-center px-4 py-2 rounded-lg transition-colors ${
              statusFilter === 'draft' ? 'bg-gray-100' : 'hover:bg-gray-50'
            }`}
          >
            <p className="text-2xl font-bold text-gray-500">{stats.draft}</p>
            <p className="text-xs text-gray-500">Draft</p>
          </button>
          <button
            onClick={() => setStatusFilter('in-progress')}
            className={`text-center px-4 py-2 rounded-lg transition-colors ${
              statusFilter === 'in-progress' ? 'bg-blue-100' : 'hover:bg-gray-50'
            }`}
          >
            <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            <p className="text-xs text-gray-500">In Progress</p>
          </button>
          <button
            onClick={() => setStatusFilter('ready-for-review')}
            className={`text-center px-4 py-2 rounded-lg transition-colors ${
              statusFilter === 'ready-for-review' ? 'bg-amber-100' : 'hover:bg-gray-50'
            }`}
          >
            <p className="text-2xl font-bold text-amber-600">{stats.review}</p>
            <p className="text-xs text-gray-500">Review</p>
          </button>
          <button
            onClick={() => setStatusFilter('submitted')}
            className={`text-center px-4 py-2 rounded-lg transition-colors ${
              statusFilter === 'submitted' ? 'bg-purple-100' : 'hover:bg-gray-50'
            }`}
          >
            <p className="text-2xl font-bold text-purple-600">{stats.submitted}</p>
            <p className="text-xs text-gray-500">Submitted</p>
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`text-center px-4 py-2 rounded-lg transition-colors ${
              statusFilter === 'approved' ? 'bg-green-100' : 'hover:bg-gray-50'
            }`}
          >
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            <p className="text-xs text-gray-500">Approved</p>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy focus:border-transparent"
            />
          </div>

          {/* Clear Filters */}
          {(searchQuery || statusFilter) && (
            <button
              onClick={() => {
                setSearchQuery('')
                setStatusFilter(null)
              }}
              className="text-sm text-aeria-navy hover:underline"
            >
              Clear filters
            </button>
          )}

          {/* View Toggle */}
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-aeria-navy text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-aeria-navy text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
          </div>

          {/* Refresh */}
          <button
            onClick={loadData}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {filteredApplications.length} of {applications.length} applications
        </p>
      </div>

      {/* Applications List/Grid */}
      {filteredApplications.length === 0 ? (
        <EmptyState
          onCreateNew={() => setShowNewModal(true)}
          hasTemplates={templates.filter(t => t.status === 'active').length > 0}
        />
      ) : viewMode === 'list' ? (
        <div className="space-y-2">
          {filteredApplications.map(app => (
            <ApplicationCard
              key={app.id}
              application={app}
              viewMode="list"
              onDelete={handleDeleteApplication}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApplications.map(app => (
            <ApplicationCard
              key={app.id}
              application={app}
              viewMode="grid"
              onDelete={handleDeleteApplication}
            />
          ))}
        </div>
      )}

      {/* Quick Start: Available Templates (when no applications) */}
      {applications.length === 0 && templates.filter(t => t.status === 'active').length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.filter(t => t.status === 'active').map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={(t) => {
                  setShowNewModal(true)
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* New Application Modal */}
      <NewApplicationModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        templates={templates}
        onCreateApplication={handleCreateApplication}
      />
    </div>
  )
}
