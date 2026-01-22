/**
 * ProcedureDetail.jsx
 * Full procedure view page with step-by-step display, version history, and management
 *
 * Features:
 * - Complete procedure content display with steps
 * - Equipment and personnel requirements
 * - Version history timeline
 * - Acknowledgment status and management
 * - Edit/delete/workflow actions
 * - Related policies navigation
 *
 * @location src/pages/ProcedureDetail.jsx
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  FileText,
  Clock,
  User,
  Calendar,
  Scale,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  GitBranch,
  Bell,
  Loader2,
  Download,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Zap,
  AlertTriangle,
  ListChecks,
  Wrench,
  Users
} from 'lucide-react'
import {
  getProcedure,
  deleteProcedureEnhanced,
  getProcedureAcknowledgments,
  checkProcedureAcknowledgmentStatus,
  submitProcedureForReview,
  submitProcedureForApproval,
  approveProcedure,
  retireProcedure
} from '../lib/firestoreProcedures'
import { useAuth } from '../contexts/AuthContext'
import { useBranding } from '../components/BrandingSettings'
import { logger } from '../lib/logger'

const CATEGORY_CONFIG = {
  general: { name: 'General Procedures', icon: ClipboardList, color: 'blue' },
  advanced: { name: 'Advanced Procedures', icon: Zap, color: 'purple' },
  emergency: { name: 'Emergency Procedures', icon: AlertTriangle, color: 'red' }
}

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'gray', icon: FileText },
  pending_review: { label: 'Pending Review', color: 'amber', icon: Clock },
  pending_approval: { label: 'Pending Approval', color: 'blue', icon: Clock },
  active: { label: 'Active', color: 'green', icon: CheckCircle2 },
  retired: { label: 'Retired', color: 'gray', icon: X }
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft
  const Icon = config.icon

  const colorClasses = {
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    green: 'bg-green-100 text-green-700 border-green-200'
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-medium ${colorClasses[config.color]}`}>
      <Icon className="w-4 h-4" />
      {config.label}
    </span>
  )
}

function formatDate(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export default function ProcedureDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [procedure, setProcedure] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [activeTab, setActiveTab] = useState('content')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [userAcknowledgment, setUserAcknowledgment] = useState(null)
  const [acknowledgmentCount, setAcknowledgmentCount] = useState(0)
  const [expandedSteps, setExpandedSteps] = useState({})

  const { applyCompanyName } = useBranding()

  // Admin check - simplified, could be enhanced with proper permissions hook
  const isAdmin = user?.role === 'admin' || true // Allow all authenticated users for now

  const toggleStep = (index) => {
    setExpandedSteps(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const expandAllSteps = () => {
    const all = {}
    procedure?.steps?.forEach((_, index) => {
      all[index] = true
    })
    setExpandedSteps(all)
  }

  const collapseAllSteps = () => {
    setExpandedSteps({})
  }

  useEffect(() => {
    if (id) {
      loadProcedure()
    }
  }, [id])

  useEffect(() => {
    if (procedure && user) {
      checkUserAcknowledgment()
      loadAcknowledgmentCount()
    }
  }, [procedure, user])

  const loadProcedure = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getProcedure(id)
      setProcedure(data)

      // Auto-expand all steps by default for better UX
      const all = {}
      data?.steps?.forEach((_, index) => {
        all[index] = true
      })
      setExpandedSteps(all)
    } catch (err) {
      setError('Failed to load procedure')
      logger.error('Error loading procedure:', err)
    } finally {
      setLoading(false)
    }
  }

  const checkUserAcknowledgment = async () => {
    if (!procedure?.acknowledgmentSettings?.required) return

    try {
      const ack = await checkProcedureAcknowledgmentStatus(procedure.id, procedure.version, user.uid)
      setUserAcknowledgment(ack)
    } catch {
      // User hasn't acknowledged - valid state
    }
  }

  const loadAcknowledgmentCount = async () => {
    try {
      const acks = await getProcedureAcknowledgments(procedure.id)
      const validAcks = acks.filter(a => a.isValid && a.procedureVersion === procedure.version)
      setAcknowledgmentCount(validAcks.length)
    } catch {
      // Optional display data
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await deleteProcedureEnhanced(id)
      navigate('/procedures')
    } catch (err) {
      setError('Failed to delete procedure')
    } finally {
      setDeleting(false)
    }
  }

  const handleWorkflowAction = async (action) => {
    try {
      setLoading(true)
      switch (action) {
        case 'submit_review':
          await submitProcedureForReview(procedure.id, user.uid)
          break
        case 'submit_approval':
          await submitProcedureForApproval(procedure.id, user.uid)
          break
        case 'approve':
          await approveProcedure(procedure.id, user.uid)
          break
        case 'retire':
          await retireProcedure(procedure.id, user.uid)
          break
      }
      await loadProcedure()
    } catch (err) {
      setError(err.message || 'Action failed')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !procedure) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error && !procedure) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
        <Link to="/procedures" className="mt-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" />
          Back to Procedures
        </Link>
      </div>
    )
  }

  const category = CATEGORY_CONFIG[procedure?.category] || CATEGORY_CONFIG.general
  const CategoryIcon = category.icon

  const colorClasses = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', headerBg: 'bg-blue-50' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', headerBg: 'bg-purple-50' },
    red: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', headerBg: 'bg-red-50' },
    green: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', headerBg: 'bg-green-50' }
  }
  const colors = colorClasses[category.color]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        to="/procedures"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Procedure Library
      </Link>

      {/* Header */}
      <div className={`rounded-xl border ${colors.border} overflow-hidden`}>
        <div className={`p-6 ${colors.headerBg}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${colors.bg}`}>
                <CategoryIcon className={`w-7 h-7 ${colors.text}`} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-lg font-bold ${colors.bg} ${colors.text}`}>
                    {procedure.number}
                  </span>
                  <StatusBadge status={procedure.status} />
                  {procedure.type === 'default' && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                      Template
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{procedure.title}</h1>
                <p className="text-gray-500 mt-1">{category.name}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {procedure.acknowledgmentSettings?.required && !userAcknowledgment && (
                <button
                  className="btn-primary flex items-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  Acknowledge
                </button>
              )}
              {isAdmin && (
                <>
                  <button
                    onClick={() => navigate(`/procedures/${id}/edit`)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Metadata bar */}
        <div className="px-6 py-3 bg-white border-t border-gray-100 flex items-center gap-6 text-sm">
          <span className="flex items-center gap-1.5 text-gray-600">
            <GitBranch className="w-4 h-4 text-gray-400" />
            v{procedure.version}
          </span>
          <span className="flex items-center gap-1.5 text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            Effective: {formatDate(procedure.effectiveDate)}
          </span>
          <span className="flex items-center gap-1.5 text-gray-600">
            <Clock className="w-4 h-4 text-gray-400" />
            Review: {formatDate(procedure.reviewDate)}
          </span>
          <span className="flex items-center gap-1.5 text-gray-600">
            <User className="w-4 h-4 text-gray-400" />
            {procedure.owner || 'Unassigned'}
          </span>
          <span className="flex items-center gap-1.5 text-blue-600">
            <ListChecks className="w-4 h-4" />
            {procedure.steps?.length || 0} steps
          </span>
          {procedure.acknowledgmentSettings?.required && (
            <span className="flex items-center gap-1.5 text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              {acknowledgmentCount} acknowledged
            </span>
          )}
        </div>
      </div>

      {/* Workflow actions */}
      {isAdmin && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Workflow Actions</h3>
          <div className="flex flex-wrap gap-2">
            {procedure.status === 'draft' && (
              <button
                onClick={() => handleWorkflowAction('submit_review')}
                className="btn-secondary text-sm"
              >
                Submit for Review
              </button>
            )}
            {procedure.status === 'pending_review' && (
              <button
                onClick={() => handleWorkflowAction('submit_approval')}
                className="btn-secondary text-sm"
              >
                Submit for Approval
              </button>
            )}
            {procedure.status === 'pending_approval' && (
              <button
                onClick={() => handleWorkflowAction('approve')}
                className="btn-primary text-sm flex items-center gap-1"
              >
                <Check className="w-4 h-4" />
                Approve & Publish
              </button>
            )}
            {procedure.status === 'active' && (
              <button
                onClick={() => handleWorkflowAction('retire')}
                className="btn-secondary text-sm text-red-600 hover:bg-red-50"
              >
                Retire Procedure
              </button>
            )}
          </div>
        </div>
      )}

      {/* Acknowledgment notice */}
      {userAcknowledgment && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span className="text-green-700">
            You acknowledged this procedure on {formatDate(userAcknowledgment.acknowledgedAt?.toDate?.() || userAcknowledgment.acknowledgedAt)}
          </span>
        </div>
      )}

      {/* Tab navigation */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex border-b border-gray-200">
          {[
            { id: 'content', label: 'Steps & Content' },
            { id: 'requirements', label: 'Requirements' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                <p className="text-gray-700">{applyCompanyName(procedure.description) || 'No description provided.'}</p>
              </div>

              {/* Procedure Steps */}
              {procedure.steps?.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <ListChecks className="w-4 h-4" />
                      Procedure Steps ({procedure.steps.length})
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={expandAllSteps}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Expand All
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={collapseAllSteps}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Collapse All
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {procedure.steps.map((step, index) => {
                      const isExpanded = expandedSteps[index]
                      const stepColor = category.color === 'red' ? 'red' : 'blue'
                      const stepBgColor = stepColor === 'red' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'

                      return (
                        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleStep(index)}
                            className="w-full bg-gray-50 px-4 py-3 flex items-start gap-3 hover:bg-gray-100 transition-colors text-left"
                          >
                            <span className={`w-8 h-8 ${stepBgColor} rounded-full text-sm flex items-center justify-center font-bold flex-shrink-0 mt-0.5`}>
                              {step.stepNumber || index + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900">
                                {applyCompanyName(step.action)}
                              </h4>
                              {!isExpanded && step.details && (
                                <p className="text-sm text-gray-500 truncate mt-0.5">
                                  {applyCompanyName(step.details).substring(0, 100)}...
                                </p>
                              )}
                            </div>
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            )}
                          </button>

                          {isExpanded && (
                            <div className="p-4 border-t border-gray-200 bg-white space-y-4">
                              {/* Details */}
                              {step.details && (
                                <div>
                                  <h5 className="text-sm font-medium text-gray-500 mb-1">Details</h5>
                                  <p className="text-gray-700 whitespace-pre-wrap">{applyCompanyName(step.details)}</p>
                                </div>
                              )}

                              {/* Notes */}
                              {step.notes && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                  <h5 className="text-sm font-medium text-blue-700 mb-1">Note</h5>
                                  <p className="text-blue-600 text-sm">{applyCompanyName(step.notes)}</p>
                                </div>
                              )}

                              {/* Cautions */}
                              {step.cautions && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                  <h5 className="text-sm font-medium text-amber-700 mb-1 flex items-center gap-1">
                                    <AlertTriangle className="w-4 h-4" />
                                    Caution
                                  </h5>
                                  <p className="text-amber-600 text-sm">{applyCompanyName(step.cautions)}</p>
                                </div>
                              )}

                              {/* Checkpoints */}
                              {step.checkpoints?.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-medium text-gray-500 mb-2">Checkpoints</h5>
                                  <ul className="space-y-1">
                                    {step.checkpoints.map((checkpoint, cpIndex) => (
                                      <li key={cpIndex} className="flex items-center gap-2 text-sm text-gray-600">
                                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                        {applyCompanyName(checkpoint)}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Regulatory References */}
              {procedure.regulatoryRefs?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Regulatory References</h3>
                  <div className="flex flex-wrap gap-2">
                    {procedure.regulatoryRefs.map((ref, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                        <Scale className="w-3 h-3" />
                        {ref}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Policies */}
              {procedure.relatedPolicies?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Related Policies</h3>
                  <div className="flex flex-wrap gap-2">
                    {procedure.relatedPolicies.map((num, i) => (
                      <Link
                        key={i}
                        to={`/policies`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                      >
                        <LinkIcon className="w-3 h-3" />
                        Policy {num}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Keywords */}
              {procedure.keywords?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {procedure.keywords.map((kw, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Requirements Tab */}
          {activeTab === 'requirements' && (
            <div className="space-y-6">
              {/* Equipment Required */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  Equipment Required
                </h3>
                {procedure.equipmentRequired?.length > 0 ? (
                  <ul className="space-y-2">
                    {procedure.equipmentRequired.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 italic">No equipment requirements specified.</p>
                )}
              </div>

              {/* Personnel Required */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Personnel Required
                </h3>
                {procedure.personnelRequired?.length > 0 ? (
                  <ul className="space-y-2">
                    {procedure.personnelRequired.map((role, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-700">
                        <User className="w-4 h-4 text-blue-500" />
                        {role}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 italic">No personnel requirements specified.</p>
                )}
              </div>

              {/* Attachments */}
              {procedure.attachments?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Attachments</h3>
                  <div className="space-y-2">
                    {procedure.attachments.map((att, i) => (
                      <a
                        key={i}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <FileText className="w-5 h-5 text-gray-400" />
                        <span className="flex-1 text-sm text-blue-600 hover:underline">{att.name}</span>
                        <Download className="w-4 h-4 text-gray-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Procedure</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{procedure.number} - {procedure.title}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn-primary bg-red-600 hover:bg-red-700"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete Procedure'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
