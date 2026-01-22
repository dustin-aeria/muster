/**
 * ComplianceHub.jsx
 * Main dashboard for Compliance Assistant
 *
 * Features:
 * - Unified view of Template Applications and Q&A Projects
 * - AI-powered Knowledge Base search and indexing
 * - Create structured compliance applications from templates (SFOC, Prequalification)
 * - Create free-form Q&A projects for any compliance questionnaire
 * - Quick stats and filtering by type/status
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
  Plane,
  Database,
  Sparkles,
  MessageSquare,
  HelpCircle
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import {
  getComplianceApplications,
  getComplianceTemplates,
  deleteComplianceApplication,
  getComplianceProjects,
  createComplianceProject,
  deleteComplianceProject,
  APPLICATION_STATUSES,
  TEMPLATE_CATEGORIES
} from '../lib/firestoreCompliance'
import { seedAllComplianceTemplates } from '../lib/seedComplianceTemplates'
import { KnowledgeBasePanel, BatchIndexPanel } from '../components/compliance'
import { useKnowledgeBase } from '../hooks/useKnowledgeBase'
import { logger } from '../lib/logger'

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

function QAProjectCard({ project, onDelete, viewMode }) {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)

  const handleClick = () => {
    navigate(`/compliance/project/${project.id}`)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    setShowMenu(false)
    if (window.confirm(`Delete "${project.name}"? This cannot be undone.`)) {
      onDelete(project.id)
    }
  }

  const questionCount = project.questions?.length || 0
  const answeredCount = project.questions?.filter(q => q.status === 'answered').length || 0
  const progress = questionCount > 0 ? Math.round((answeredCount / questionCount) * 100) : 0

  if (viewMode === 'list') {
    return (
      <div
        onClick={handleClick}
        className="flex items-center gap-4 p-4 bg-white border border-purple-200 rounded-lg hover:border-purple-300 hover:shadow-sm transition-all cursor-pointer"
      >
        {/* Icon */}
        <div className="p-2 rounded-lg bg-purple-100">
          <MessageSquare className="w-5 h-5 text-purple-600" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 truncate">{project.name}</h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
              <HelpCircle className="w-3 h-3" />
              Q&A Project
            </span>
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              {questionCount} questions
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Updated {formatRelativeDate(project.updatedAt)}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="w-32">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${progress === 100 ? 'bg-green-500' : 'bg-purple-500'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 w-10 text-right">{progress}%</span>
          </div>
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
      className="p-4 bg-white border border-purple-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all cursor-pointer flex flex-col h-full"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-purple-100">
          <MessageSquare className="w-5 h-5 text-purple-600" />
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
          Q&A
        </span>
      </div>

      <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{project.name}</h3>
      <p className="text-sm text-gray-500 mb-3">{questionCount} questions</p>

      <div className="mt-auto">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${progress === 100 ? 'bg-green-500' : 'bg-purple-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 w-10 text-right">{progress}%</span>
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <span>Updated {formatRelativeDate(project.updatedAt)}</span>
          <span>{answeredCount}/{questionCount}</span>
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
      logger.error('Error creating application:', error)
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
          <h2 className="text-xl font-semibold text-gray-900">New Compliance Project</h2>
          <p className="text-gray-500 mt-1">Select a template for regulatory submissions, client prequalifications, or general compliance questionnaires</p>
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

function NewQAProjectModal({ isOpen, onClose, onCreateProject }) {
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    if (!projectName.trim()) return

    setCreating(true)
    try {
      await onCreateProject({
        name: projectName.trim(),
        description: projectDescription.trim()
      })
      onClose()
      setProjectName('')
      setProjectDescription('')
    } catch (error) {
      logger.error('Error creating Q&A project:', error)
      alert('Failed to create project. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <MessageSquare className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">New Q&A Project</h2>
              <p className="text-gray-500 text-sm mt-0.5">Ask compliance questions and get AI-assisted answers</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g., Client ABC Prequalification Questions"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optional)
            </label>
            <textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="What is this compliance project for?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 text-sm">How Q&A Projects Work</h4>
            <ul className="mt-2 text-sm text-purple-700 space-y-1">
              <li>• Add compliance questions one at a time</li>
              <li>• AI assistant suggests answers from your knowledge base</li>
              <li>• Reference policies, procedures, and project data</li>
              <li>• Export completed Q&A for submissions</li>
            </ul>
          </div>
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
            disabled={!projectName.trim() || creating}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Project
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ onCreateNew, onCreateQA, hasTemplates }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8">
      <div className="text-center mb-8">
        <FolderOpen className="w-12 h-12 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Start Your First Compliance Project</h3>
        <p className="text-gray-500 max-w-lg mx-auto">
          Choose how you want to work on compliance. Both options include AI-powered assistance from your indexed policies and procedures.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {/* Q&A Project Option */}
        <button
          onClick={onCreateQA}
          className="p-6 bg-purple-50 border-2 border-purple-200 rounded-xl hover:border-purple-400 hover:bg-purple-100 transition-all text-left group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-purple-100 group-hover:bg-purple-200">
              <MessageSquare className="w-5 h-5 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Q&A Project</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Ask compliance questions and get AI-assisted answers from your knowledge base. Perfect for client prequalifications and custom questionnaires.
          </p>
          <span className="text-sm font-medium text-purple-600 group-hover:text-purple-700">
            Get started →
          </span>
        </button>

        {/* Template Option */}
        {hasTemplates ? (
          <button
            onClick={onCreateNew}
            className="p-6 bg-blue-50 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:bg-blue-100 transition-all text-left group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-100 group-hover:bg-blue-200">
                <FileCheck className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900">From Template</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Use a pre-built compliance matrix (SFOC, COR, etc.) with structured requirements. Best for regulatory submissions.
            </p>
            <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
              Browse templates →
            </span>
          </button>
        ) : (
          <div className="p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl text-left">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-gray-100">
                <FileCheck className="w-5 h-5 text-gray-400" />
              </div>
              <h4 className="font-semibold text-gray-500">From Template</h4>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Seed templates first to use pre-built compliance matrices for SFOC and other regulatory applications.
            </p>
            <span className="text-sm text-gray-400">
              Click "Seed Templates" above
            </span>
          </div>
        )}
      </div>
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
  const [qaProjects, setQaProjects] = useState([])
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState(null)
  const [typeFilter, setTypeFilter] = useState(null) // 'application', 'qa', or null for all
  const [viewMode, setViewMode] = useState('list')
  const [showNewModal, setShowNewModal] = useState(false)
  const [showNewQAModal, setShowNewQAModal] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [showKnowledgeBase, setShowKnowledgeBase] = useState(false)
  const [kbTab, setKbTab] = useState('search') // 'search' or 'index'

  // Knowledge Base
  const { indexStatus, isIndexed, reindexPolicies, indexing } = useKnowledgeBase()

  // Load data
  const loadData = async () => {
    try {
      setError('')
      const [appsData, templatesData, qaData] = await Promise.all([
        getComplianceApplications(),
        getComplianceTemplates(),
        getComplianceProjects(user?.operatorId || user?.uid)
      ])
      setApplications(appsData)
      setTemplates(templatesData)
      setQaProjects(qaData || [])
    } catch (err) {
      logger.error('Error loading compliance data:', err)
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
      logger.error('Error seeding templates:', err)
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
      logger.error('Error deleting application:', err)
      setError('Failed to delete application.')
    }
  }

  // Create Q&A project
  const handleCreateQAProject = async (data) => {
    const project = await createComplianceProject({
      ...data,
      operatorId: user?.operatorId || user?.uid,
      createdBy: user?.uid
    })
    await loadData()
    navigate(`/compliance/project/${project.id}`)
  }

  // Delete Q&A project
  const handleDeleteQAProject = async (id) => {
    try {
      await deleteComplianceProject(id)
      setQaProjects(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      logger.error('Error deleting Q&A project:', err)
      setError('Failed to delete project.')
    }
  }

  // Filter and combine all items
  const filteredItems = useMemo(() => {
    // Start with applications (add type marker)
    let apps = applications.map(a => ({ ...a, _type: 'application' }))
    let qas = qaProjects.map(p => ({ ...p, _type: 'qa' }))

    // Apply type filter
    if (typeFilter === 'application') {
      qas = []
    } else if (typeFilter === 'qa') {
      apps = []
    }

    // Apply status filter (only for applications)
    if (statusFilter) {
      apps = apps.filter(app => app.status === statusFilter)
    }

    // Combine
    let result = [...apps, ...qas]

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(item =>
        item.name?.toLowerCase().includes(query) ||
        item.templateName?.toLowerCase().includes(query) ||
        item.projectName?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      )
    }

    // Sort by updatedAt
    result.sort((a, b) => {
      const aDate = a.updatedAt?.toDate?.() || new Date(a.updatedAt) || new Date(0)
      const bDate = b.updatedAt?.toDate?.() || new Date(b.updatedAt) || new Date(0)
      return bDate - aDate
    })

    return result
  }, [applications, qaProjects, statusFilter, typeFilter, searchQuery])

  // Calculate stats
  const stats = useMemo(() => {
    const allApps = applications.length
    const allQA = qaProjects.length
    const all = allApps + allQA
    const draft = applications.filter(a => a.status === 'draft').length
    const inProgress = applications.filter(a => a.status === 'in-progress').length
    const review = applications.filter(a => a.status === 'ready-for-review').length
    const submitted = applications.filter(a => a.status === 'submitted').length
    const approved = applications.filter(a => a.status === 'approved').length

    return { all, allApps, allQA, draft, inProgress, review, submitted, approved }
  }, [applications, qaProjects])

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

      {/* Getting Started Banner - show when no templates and no projects */}
      {templates.length === 0 && stats.all === 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <Sparkles className="w-6 h-6 text-amber-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Welcome to the Compliance Assistant</h3>
              <p className="text-gray-600 text-sm mb-3">
                Get started by seeding the template library, then index your policies to enable AI-powered assistance.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">1</span>
                  <span className="text-gray-700">Seed Templates</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">2</span>
                  <span className="text-gray-700">Index Policies</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">3</span>
                  <span className="text-gray-700">Create Projects</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Index Policies Prompt - show when templates exist but KB not indexed */}
      {templates.length > 0 && !isIndexed && stats.all === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-amber-600" />
            <div className="flex-1">
              <p className="text-amber-800 font-medium">Index your policies for AI-powered suggestions</p>
              <p className="text-amber-700 text-sm">Click "AI Assistant" above and go to the Index tab to enable intelligent search.</p>
            </div>
            <button
              onClick={() => { setShowKnowledgeBase(true); setKbTab('index'); }}
              className="px-3 py-1.5 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700"
            >
              Index Now
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <ClipboardCheck className="w-7 h-7 text-aeria-navy" />
              Compliance Assistant
            </h1>
            <p className="text-gray-500 mt-1">
              Manage compliance applications, client prequalifications, regulatory submissions, and audits
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

            {/* Knowledge Base Button */}
            <button
              onClick={() => setShowKnowledgeBase(!showKnowledgeBase)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showKnowledgeBase
                  ? 'bg-amber-100 text-amber-700 border border-amber-200'
                  : 'btn-secondary'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              AI Assistant
              {isIndexed && (
                <span className="w-2 h-2 rounded-full bg-green-500" title="Knowledge Base indexed" />
              )}
            </button>

            {/* Template Library Link */}
            <Link
              to="/compliance/templates"
              className="btn-secondary flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Templates
            </Link>

            {/* New Q&A Project Button */}
            <button
              onClick={() => setShowNewQAModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Q&A Project
            </button>

            {/* New Template Application Button */}
            <button
              onClick={() => setShowNewModal(true)}
              disabled={templates.filter(t => t.status === 'active').length === 0}
              className="btn-primary flex items-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              From Template
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-200 flex-wrap">
          {/* Type filters */}
          <button
            onClick={() => { setTypeFilter(null); setStatusFilter(null); }}
            className={`text-center px-4 py-2 rounded-lg transition-colors ${
              typeFilter === null && statusFilter === null ? 'bg-gray-100' : 'hover:bg-gray-50'
            }`}
          >
            <p className="text-2xl font-bold text-gray-900">{stats.all}</p>
            <p className="text-xs text-gray-500">All</p>
          </button>
          <button
            onClick={() => { setTypeFilter('application'); setStatusFilter(null); }}
            className={`text-center px-4 py-2 rounded-lg transition-colors ${
              typeFilter === 'application' ? 'bg-blue-100' : 'hover:bg-gray-50'
            }`}
          >
            <p className="text-2xl font-bold text-blue-600">{stats.allApps}</p>
            <p className="text-xs text-gray-500">Templates</p>
          </button>
          <button
            onClick={() => { setTypeFilter('qa'); setStatusFilter(null); }}
            className={`text-center px-4 py-2 rounded-lg transition-colors ${
              typeFilter === 'qa' ? 'bg-purple-100' : 'hover:bg-gray-50'
            }`}
          >
            <p className="text-2xl font-bold text-purple-600">{stats.allQA}</p>
            <p className="text-xs text-gray-500">Q&A</p>
          </button>

          <div className="w-px h-8 bg-gray-300 mx-2" />

          {/* Status filters (for template apps) */}
          <button
            onClick={() => { setTypeFilter('application'); setStatusFilter('draft'); }}
            className={`text-center px-3 py-2 rounded-lg transition-colors ${
              statusFilter === 'draft' ? 'bg-gray-100' : 'hover:bg-gray-50'
            }`}
          >
            <p className="text-lg font-bold text-gray-500">{stats.draft}</p>
            <p className="text-xs text-gray-500">Draft</p>
          </button>
          <button
            onClick={() => { setTypeFilter('application'); setStatusFilter('in-progress'); }}
            className={`text-center px-3 py-2 rounded-lg transition-colors ${
              statusFilter === 'in-progress' ? 'bg-blue-100' : 'hover:bg-gray-50'
            }`}
          >
            <p className="text-lg font-bold text-blue-600">{stats.inProgress}</p>
            <p className="text-xs text-gray-500">In Progress</p>
          </button>
          <button
            onClick={() => { setTypeFilter('application'); setStatusFilter('submitted'); }}
            className={`text-center px-3 py-2 rounded-lg transition-colors ${
              statusFilter === 'submitted' ? 'bg-amber-100' : 'hover:bg-gray-50'
            }`}
          >
            <p className="text-lg font-bold text-amber-600">{stats.submitted}</p>
            <p className="text-xs text-gray-500">Submitted</p>
          </button>
          <button
            onClick={() => { setTypeFilter('application'); setStatusFilter('approved'); }}
            className={`text-center px-3 py-2 rounded-lg transition-colors ${
              statusFilter === 'approved' ? 'bg-green-100' : 'hover:bg-gray-50'
            }`}
          >
            <p className="text-lg font-bold text-green-600">{stats.approved}</p>
            <p className="text-xs text-gray-500">Approved</p>
          </button>
        </div>
      </div>

      {/* Knowledge Base Panel */}
      {showKnowledgeBase && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  AI Compliance Assistant
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Search policies, procedures, and project data to help complete any compliance questionnaire
                </p>
              </div>
              <button
                onClick={() => setShowKnowledgeBase(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mt-4">
              <button
                onClick={() => setKbTab('search')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  kbTab === 'search'
                    ? 'bg-aeria-navy text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Search className="w-4 h-4 inline-block mr-1.5" />
                Search
              </button>
              <button
                onClick={() => setKbTab('index')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  kbTab === 'index'
                    ? 'bg-aeria-navy text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Database className="w-4 h-4 inline-block mr-1.5" />
                Index
                {!isIndexed && (
                  <span className="ml-1.5 w-2 h-2 inline-block rounded-full bg-amber-500" />
                )}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {kbTab === 'search' ? (
              <>
                {!isIndexed && (
                  <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-800">Knowledge Base Not Indexed</p>
                        <p className="text-sm text-amber-700 mt-1">
                          Index your policies to enable search.
                        </p>
                        <button
                          onClick={() => setKbTab('index')}
                          className="mt-2 text-sm text-amber-700 underline hover:no-underline"
                        >
                          Go to Index tab
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <KnowledgeBasePanel />
              </>
            ) : (
              <BatchIndexPanel />
            )}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
            <label htmlFor="compliance-search" className="sr-only">Search applications</label>
            <input
              id="compliance-search"
              type="search"
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
          Showing {filteredItems.length} of {stats.all} projects
        </p>
      </div>

      {/* Projects List/Grid */}
      {filteredItems.length === 0 ? (
        <EmptyState
          onCreateNew={() => setShowNewModal(true)}
          onCreateQA={() => setShowNewQAModal(true)}
          hasTemplates={templates.filter(t => t.status === 'active').length > 0}
        />
      ) : viewMode === 'list' ? (
        <div className="space-y-2">
          {filteredItems.map(item => (
            item._type === 'qa' ? (
              <QAProjectCard
                key={`qa-${item.id}`}
                project={item}
                viewMode="list"
                onDelete={handleDeleteQAProject}
              />
            ) : (
              <ApplicationCard
                key={`app-${item.id}`}
                application={item}
                viewMode="list"
                onDelete={handleDeleteApplication}
              />
            )
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => (
            item._type === 'qa' ? (
              <QAProjectCard
                key={`qa-${item.id}`}
                project={item}
                viewMode="grid"
                onDelete={handleDeleteQAProject}
              />
            ) : (
              <ApplicationCard
                key={`app-${item.id}`}
                application={item}
                viewMode="grid"
                onDelete={handleDeleteApplication}
              />
            )
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

      {/* New Q&A Project Modal */}
      <NewQAProjectModal
        isOpen={showNewQAModal}
        onClose={() => setShowNewQAModal(false)}
        onCreateProject={handleCreateQAProject}
      />
    </div>
  )
}
