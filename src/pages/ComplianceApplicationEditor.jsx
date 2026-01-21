/**
 * ComplianceApplicationEditor.jsx
 * Main editing interface for compliance applications
 *
 * Features:
 * - Category sidebar navigation
 * - Requirement cards with response editing
 * - Progress tracking per category
 * - Auto-save responses
 * - Status management
 * - Gap analysis view
 *
 * @location src/pages/ComplianceApplicationEditor.jsx
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Circle,
  CircleDot,
  AlertCircle,
  ChevronRight,
  FileText,
  Link as LinkIcon,
  Sparkles,
  Flag,
  MoreVertical,
  Clock,
  Loader2,
  Search,
  Filter,
  Download,
  Send,
  Eye,
  ChevronDown,
  ChevronUp,
  BookOpen,
  HelpCircle,
  X,
  Check,
  ExternalLink,
  Paperclip,
  Plus,
  Trash2
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import {
  getComplianceApplication,
  getComplianceTemplate,
  updateRequirementResponse,
  updateApplicationStatus,
  updateComplianceApplication,
  APPLICATION_STATUSES,
  runGapAnalysis
} from '../lib/firestoreCompliance'
import DocumentLinker from '../components/compliance/DocumentLinker'
import { AutoPopulateButton, GapAnalysisPanel, ProjectLinkBanner, analyzeGaps } from '../components/compliance/SmartPopulate'
import { getProject } from '../lib/firestore'

// ============================================
// HELPER FUNCTIONS
// ============================================

const getStatusIcon = (status) => {
  switch (status) {
    case 'complete':
      return CheckCircle2
    case 'partial':
      return CircleDot
    case 'needs-attention':
      return AlertCircle
    default:
      return Circle
  }
}

const getStatusColor = (status) => {
  switch (status) {
    case 'complete':
      return 'text-green-600'
    case 'partial':
      return 'text-amber-500'
    case 'needs-attention':
      return 'text-red-500'
    default:
      return 'text-gray-300'
  }
}

const getCategoryProgress = (requirements, responses, categoryId) => {
  const categoryReqs = requirements.filter(r => r.category === categoryId)
  const total = categoryReqs.length
  const complete = categoryReqs.filter(r => responses[r.id]?.status === 'complete').length
  const partial = categoryReqs.filter(r => responses[r.id]?.status === 'partial').length

  return {
    total,
    complete,
    partial,
    empty: total - complete - partial,
    percent: total > 0 ? Math.round((complete / total) * 100) : 0
  }
}

// ============================================
// SUB-COMPONENTS
// ============================================

function CategorySidebar({ categories, requirements, responses, activeCategory, onSelectCategory }) {
  return (
    <div className="w-64 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Categories</h3>
      </div>
      <nav className="p-2">
        {categories.map(category => {
          const progress = getCategoryProgress(requirements, responses, category.id)
          const isActive = activeCategory === category.id

          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                isActive
                  ? 'bg-blue-50 border border-blue-200'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                  {category.name}
                </span>
                <span className={`text-xs ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                  {progress.complete}/{progress.total}
                </span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    progress.percent === 100 ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </button>
          )
        })}
      </nav>

      {/* Overall Progress */}
      <div className="p-4 border-t border-gray-200 mt-auto">
        <div className="text-xs text-gray-500 mb-2">Overall Progress</div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all"
              style={{
                width: `${requirements.length > 0
                  ? Math.round((Object.values(responses).filter(r => r.status === 'complete').length / requirements.length) * 100)
                  : 0}%`
              }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {requirements.length > 0
              ? Math.round((Object.values(responses).filter(r => r.status === 'complete').length / requirements.length) * 100)
              : 0}%
          </span>
        </div>
      </div>
    </div>
  )
}

function RequirementCard({ requirement, response, onUpdate, onFlag, onLinkDocuments, isExpanded, onToggleExpand }) {
  const [localResponse, setLocalResponse] = useState(response?.response || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const StatusIcon = getStatusIcon(response?.status)
  const statusColor = getStatusColor(response?.status)

  // Debounced save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localResponse !== (response?.response || '') && localResponse.trim()) {
        handleSave()
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [localResponse])

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    try {
      await onUpdate(requirement.id, {
        response: localResponse,
        documentRefs: response?.documentRefs || [],
        responseType: requirement.responseType
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Error saving response:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`bg-white border rounded-lg overflow-hidden transition-shadow ${
      response?.flagged ? 'border-red-300 shadow-red-100' : 'border-gray-200'
    } ${isExpanded ? 'shadow-md' : 'hover:shadow-sm'}`}>
      {/* Header */}
      <div
        onClick={onToggleExpand}
        className="flex items-start gap-3 p-4 cursor-pointer"
      >
        <StatusIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${statusColor}`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              {requirement.regulatoryRef && (
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded mb-1 inline-block">
                  {requirement.regulatoryRef}
                </span>
              )}
              <h4 className="font-medium text-gray-900">
                {requirement.shortText || requirement.text.substring(0, 80)}
              </h4>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
              isExpanded ? 'rotate-180' : ''
            }`} />
          </div>

          {!isExpanded && localResponse && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-1">{localResponse}</p>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          {/* Full Requirement Text */}
          <div>
            <p className="text-sm text-gray-700">{requirement.text}</p>
          </div>

          {/* Guidance */}
          {requirement.guidance && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-blue-800 mb-1">Guidance</p>
                  <p className="text-sm text-blue-700">{requirement.guidance}</p>
                </div>
              </div>
            </div>
          )}

          {/* Response Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Response
              {requirement.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={localResponse}
              onChange={(e) => setLocalResponse(e.target.value)}
              placeholder={requirement.exampleResponse ? `Example: ${requirement.exampleResponse.substring(0, 100)}...` : 'Enter your response...'}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {saving && (
                  <span className="flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Saving...
                  </span>
                )}
                {saved && (
                  <span className="flex items-center gap-1 text-green-600">
                    <Check className="w-3 h-3" />
                    Saved
                  </span>
                )}
              </div>
              {requirement.minResponseLength && (
                <span className={`text-xs ${
                  localResponse.length >= requirement.minResponseLength ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {localResponse.length}/{requirement.minResponseLength} min characters
                </span>
              )}
            </div>
          </div>

          {/* Document References */}
          {requirement.responseType === 'document-reference' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Linked Documents
              </label>
              {response?.documentRefs?.length > 0 ? (
                <div className="space-y-2">
                  {response.documentRefs.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <Paperclip className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700 flex-1">{doc.title}</span>
                      {doc.section && (
                        <span className="text-xs text-gray-500">Section {doc.section}</span>
                      )}
                      <button className="text-gray-400 hover:text-red-500">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No documents linked yet</p>
              )}
              <button
                onClick={() => onLinkDocuments(requirement)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Link Document
              </button>

              {/* Suggested Documents */}
              {(requirement.suggestedPolicies?.length > 0 || requirement.suggestedDocTypes?.length > 0) && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                  <p className="text-xs font-medium text-amber-800 mb-1">Suggested Documentation</p>
                  <div className="flex flex-wrap gap-1">
                    {requirement.suggestedPolicies?.map(policyNum => (
                      <span key={policyNum} className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                        Policy {policyNum}
                      </span>
                    ))}
                    {requirement.suggestedDocTypes?.map(docType => (
                      <span key={docType} className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                        {docType}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Example Response */}
          {requirement.exampleResponse && (
            <details className="group">
              <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700 flex items-center gap-1">
                <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
                View example response
              </summary>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 italic">
                {requirement.exampleResponse}
              </div>
            </details>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onFlag(requirement.id, !response?.flagged)}
                className={`text-sm px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                  response?.flagged
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Flag className="w-4 h-4" />
                {response?.flagged ? 'Flagged' : 'Flag for Review'}
              </button>
              <button className="text-sm text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                AI Assist
              </button>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ApplicationHeader({ application, template, onStatusChange, onExport, showGapAnalysis, onToggleGapAnalysis, gapCount }) {
  const statusConfig = APPLICATION_STATUSES[application.status] || {}
  const progress = application.progress || { percentComplete: 0, complete: 0, total: 0 }

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/compliance"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{application.name}</h1>
            <p className="text-sm text-gray-500">{template?.name} • {template?.regulatoryBody}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Progress */}
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{progress.percentComplete}%</div>
            <div className="text-xs text-gray-500">{progress.complete}/{progress.total} complete</div>
          </div>

          {/* Progress Bar */}
          <div className="w-32">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  progress.percentComplete === 100 ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${progress.percentComplete}%` }}
              />
            </div>
          </div>

          {/* Gap Analysis Toggle */}
          <button
            onClick={onToggleGapAnalysis}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
              showGapAnalysis
                ? 'bg-amber-100 text-amber-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            Gaps
            {gapCount > 0 && (
              <span className="bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {gapCount}
              </span>
            )}
          </button>

          {/* Status Badge */}
          <select
            value={application.status}
            onChange={(e) => onStatusChange(e.target.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border-0 cursor-pointer ${
              statusConfig.color === 'gray' ? 'bg-gray-100 text-gray-700' :
              statusConfig.color === 'blue' ? 'bg-blue-100 text-blue-700' :
              statusConfig.color === 'amber' ? 'bg-amber-100 text-amber-700' :
              statusConfig.color === 'purple' ? 'bg-purple-100 text-purple-700' :
              statusConfig.color === 'green' ? 'bg-green-100 text-green-700' :
              'bg-red-100 text-red-700'
            }`}
          >
            {Object.entries(APPLICATION_STATUSES).map(([key, value]) => (
              <option key={key} value={key}>{value.name}</option>
            ))}
          </select>

          {/* Actions */}
          <button
            onClick={onExport}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ComplianceApplicationEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  // State
  const [application, setApplication] = useState(null)
  const [template, setTemplate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeCategory, setActiveCategory] = useState(null)
  const [expandedRequirement, setExpandedRequirement] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState(null)
  const [linkingRequirement, setLinkingRequirement] = useState(null) // For DocumentLinker modal
  const [showGapAnalysis, setShowGapAnalysis] = useState(false)
  const [linkedProject, setLinkedProject] = useState(null)

  // Load application and template
  useEffect(() => {
    async function loadData() {
      if (!id) {
        setError('No application ID provided')
        setLoading(false)
        return
      }

      try {
        const appData = await getComplianceApplication(id)
        setApplication(appData)

        const templateData = await getComplianceTemplate(appData.templateId)
        setTemplate(templateData)

        // Set initial active category
        if (templateData.categories?.length > 0) {
          setActiveCategory(templateData.categories[0].id)
        }

        // Load linked project if exists
        if (appData.projectId) {
          try {
            const projectData = await getProject(appData.projectId)
            setLinkedProject(projectData)
          } catch (err) {
            console.warn('Could not load linked project:', err)
          }
        }
      } catch (err) {
        console.error('Error loading application:', err)
        setError('Failed to load application. It may have been deleted.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id])

  // Handle response update
  const handleResponseUpdate = useCallback(async (requirementId, responseData) => {
    if (!application || !user) return

    try {
      const result = await updateRequirementResponse(
        application.id,
        requirementId,
        responseData,
        user.uid
      )

      // Update local state
      setApplication(prev => ({
        ...prev,
        responses: result.responses,
        progress: result.progress
      }))
    } catch (err) {
      console.error('Error updating response:', err)
      throw err
    }
  }, [application, user])

  // Handle flag toggle
  const handleFlag = useCallback(async (requirementId, flagged) => {
    if (!application || !user) return

    try {
      await handleResponseUpdate(requirementId, {
        ...application.responses[requirementId],
        flagged,
        flagReason: flagged ? 'Flagged for review' : null
      })
    } catch (err) {
      console.error('Error flagging requirement:', err)
    }
  }, [application, user, handleResponseUpdate])

  // Handle status change
  const handleStatusChange = useCallback(async (newStatus) => {
    if (!application || !user) return

    try {
      await updateApplicationStatus(application.id, newStatus, user.uid)
      setApplication(prev => ({ ...prev, status: newStatus }))
    } catch (err) {
      console.error('Error updating status:', err)
      alert(`Cannot change status: ${err.message}`)
    }
  }, [application, user])

  // Handle export
  const handleExport = useCallback(() => {
    // TODO: Implement export functionality
    alert('Export functionality coming in Phase 5')
  }, [])

  // Handle document linking
  const handleLinkDocuments = useCallback((requirement) => {
    setLinkingRequirement(requirement)
  }, [])

  // Save linked documents
  const handleSaveLinkedDocuments = useCallback(async (documentRefs) => {
    if (!linkingRequirement || !application || !user) return

    try {
      const currentResponse = application.responses[linkingRequirement.id] || {}
      await handleResponseUpdate(linkingRequirement.id, {
        ...currentResponse,
        documentRefs,
        responseType: linkingRequirement.responseType
      })
    } catch (err) {
      console.error('Error saving linked documents:', err)
    }
  }, [linkingRequirement, application, user, handleResponseUpdate])

  // Filter requirements
  const filteredRequirements = useMemo(() => {
    if (!template?.requirements) return []

    let result = template.requirements

    // Filter by category
    if (activeCategory) {
      result = result.filter(r => r.category === activeCategory)
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(r =>
        r.text?.toLowerCase().includes(query) ||
        r.shortText?.toLowerCase().includes(query) ||
        r.regulatoryRef?.toLowerCase().includes(query)
      )
    }

    // Filter by status
    if (filterStatus) {
      result = result.filter(r => application?.responses[r.id]?.status === filterStatus)
    }

    // Sort by order
    result.sort((a, b) => a.order - b.order)

    return result
  }, [template, activeCategory, searchQuery, filterStatus, application])

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-aeria-navy" />
      </div>
    )
  }

  // Error state
  if (error || !application || !template) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-4" />
        <h2 className="text-lg font-medium text-gray-900 mb-2">Error Loading Application</h2>
        <p className="text-gray-500 mb-4">{error || 'Application not found'}</p>
        <Link to="/compliance" className="btn-primary">
          Back to Compliance Hub
        </Link>
      </div>
    )
  }

  const activeTemplateCategory = template.categories?.find(c => c.id === activeCategory)

  // Calculate gap count
  const gapAnalysisData = useMemo(() => {
    if (!template || !application) return { total: 0 }
    const gaps = analyzeGaps(template, application.responses || {})
    return {
      gaps,
      total: gaps.missingRequired.length + gaps.incompleteResponses.length +
             gaps.missingDocuments.length + gaps.flagged.length
    }
  }, [template, application])

  // Navigate to requirement from gap analysis
  const handleNavigateToRequirement = useCallback((requirementId) => {
    // Find the category for this requirement
    const requirement = template.requirements.find(r => r.id === requirementId)
    if (requirement) {
      setActiveCategory(requirement.category)
      setExpandedRequirement(requirementId)
      setShowGapAnalysis(false)
    }
  }, [template])

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-4 lg:-m-8">
      {/* Header */}
      <ApplicationHeader
        application={application}
        template={template}
        onStatusChange={handleStatusChange}
        onExport={handleExport}
        showGapAnalysis={showGapAnalysis}
        onToggleGapAnalysis={() => setShowGapAnalysis(!showGapAnalysis)}
        gapCount={gapAnalysisData.total}
      />

      {/* Gap Analysis Panel (collapsible) */}
      {showGapAnalysis && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Gap Analysis</h3>
            <button
              onClick={() => setShowGapAnalysis(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <GapAnalysisPanel
            template={template}
            responses={application.responses || {}}
            onNavigateToRequirement={handleNavigateToRequirement}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Category Sidebar */}
        <CategorySidebar
          categories={template.categories || []}
          requirements={template.requirements || []}
          responses={application.responses || {}}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />

        {/* Requirements List */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {/* Category Header & Filters */}
          <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-6 py-4 z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {activeTemplateCategory?.name || 'All Requirements'}
                </h2>
                {activeTemplateCategory?.description && (
                  <p className="text-sm text-gray-500">{activeTemplateCategory.description}</p>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {filteredRequirements.length} requirements
              </div>
            </div>

            {/* Search & Filters */}
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search requirements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={filterStatus || ''}
                onChange={(e) => setFilterStatus(e.target.value || null)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All statuses</option>
                <option value="empty">Empty</option>
                <option value="partial">Partial</option>
                <option value="complete">Complete</option>
                <option value="needs-attention">Needs Attention</option>
              </select>
            </div>
          </div>

          {/* Requirements */}
          <div className="p-6 space-y-3">
            {filteredRequirements.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No requirements match your filters</p>
              </div>
            ) : (
              filteredRequirements.map(requirement => (
                <RequirementCard
                  key={requirement.id}
                  requirement={requirement}
                  response={application.responses[requirement.id]}
                  onUpdate={handleResponseUpdate}
                  onFlag={handleFlag}
                  onLinkDocuments={handleLinkDocuments}
                  isExpanded={expandedRequirement === requirement.id}
                  onToggleExpand={() => setExpandedRequirement(
                    expandedRequirement === requirement.id ? null : requirement.id
                  )}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Document Linker Modal */}
      <DocumentLinker
        isOpen={!!linkingRequirement}
        onClose={() => setLinkingRequirement(null)}
        currentDocRefs={linkingRequirement ? application?.responses[linkingRequirement.id]?.documentRefs : []}
        suggestedPolicies={linkingRequirement?.suggestedPolicies || []}
        suggestedDocTypes={linkingRequirement?.suggestedDocTypes || []}
        onSave={handleSaveLinkedDocuments}
      />
    </div>
  )
}
