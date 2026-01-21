/**
 * PolicyDetail.jsx
 * Full policy view page with version history, acknowledgments, and management
 *
 * Features:
 * - Complete policy content display
 * - Version history timeline
 * - Acknowledgment status and management
 * - Edit/delete/workflow actions
 * - Related policies navigation
 *
 * @location src/pages/PolicyDetail.jsx
 */

import { useState, useEffect, Fragment } from 'react'
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
  Printer,
  Send,
  Check,
  X,
  Plane,
  Users,
  HardHat,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { getPolicy, deletePolicy } from '../lib/firestore'
import {
  getAcknowledgments,
  checkAcknowledgmentStatus,
  submitForReview,
  submitForApproval,
  approvePolicy,
  retirePolicy
} from '../lib/firestorePolicies'
import { useAuth } from '../contexts/AuthContext'
import { usePolicyPermissions } from '../hooks/usePolicyPermissions'
import PolicyVersionHistory from '../components/policies/PolicyVersionHistory'
import PolicyAcknowledgment from '../components/policies/PolicyAcknowledgment'
import PolicyEditor from '../components/policies/PolicyEditor'
import AcknowledgmentDashboard from '../components/policies/AcknowledgmentDashboard'

const CATEGORY_CONFIG = {
  rpas: { name: 'RPAS Operations', icon: Plane, color: 'blue' },
  crm: { name: 'CRM', icon: Users, color: 'purple' },
  hse: { name: 'HSE', icon: HardHat, color: 'green' }
}

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'gray', icon: FileText },
  pending_review: { label: 'Pending Review', color: 'amber', icon: Clock },
  pending_approval: { label: 'Pending Approval', color: 'blue', icon: Send },
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

export default function PolicyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, userProfile } = useAuth()

  const [policy, setPolicy] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [activeTab, setActiveTab] = useState('content')
  const [showEditor, setShowEditor] = useState(false)
  const [showAckModal, setShowAckModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [userAcknowledgment, setUserAcknowledgment] = useState(null)
  const [acknowledgmentCount, setAcknowledgmentCount] = useState(0)
  const [expandedSections, setExpandedSections] = useState({})

  const permissions = usePolicyPermissions(policy)

  const toggleSection = (index) => {
    setExpandedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const expandAllSections = () => {
    const all = {}
    policy?.sections?.forEach((_, index) => {
      all[index] = true
    })
    setExpandedSections(all)
  }

  const collapseAllSections = () => {
    setExpandedSections({})
  }

  useEffect(() => {
    if (id) {
      loadPolicy()
    }
  }, [id])

  useEffect(() => {
    if (policy && user) {
      checkUserAcknowledgment()
      loadAcknowledgmentCount()
    }
  }, [policy, user])

  const loadPolicy = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getPolicy(id)
      setPolicy(data)
    } catch (err) {
      setError('Failed to load policy')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const checkUserAcknowledgment = async () => {
    if (!policy?.acknowledgmentSettings?.required) return

    try {
      const ack = await checkAcknowledgmentStatus(policy.id, policy.version, user.uid)
      setUserAcknowledgment(ack)
    } catch {
      // Not acknowledged
    }
  }

  const loadAcknowledgmentCount = async () => {
    try {
      const acks = await getAcknowledgments(policy.id)
      const validAcks = acks.filter(a => a.isValid && a.policyVersion === policy.version)
      setAcknowledgmentCount(validAcks.length)
    } catch {
      // Ignore
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await deletePolicy(id)
      navigate('/policies')
    } catch (err) {
      setError('Failed to delete policy')
    } finally {
      setDeleting(false)
    }
  }

  const handleWorkflowAction = async (action) => {
    try {
      setLoading(true)
      switch (action) {
        case 'submit_review':
          await submitForReview(policy.id, user.uid)
          break
        case 'submit_approval':
          await submitForApproval(policy.id, user.uid)
          break
        case 'approve':
          await approvePolicy(policy.id, user.uid)
          break
        case 'retire':
          await retirePolicy(policy.id, user.uid)
          break
      }
      await loadPolicy()
    } catch (err) {
      setError(err.message || 'Action failed')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !policy) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error && !policy) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
        <Link to="/policies" className="mt-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" />
          Back to Policies
        </Link>
      </div>
    )
  }

  const category = CATEGORY_CONFIG[policy?.category] || CATEGORY_CONFIG.rpas
  const CategoryIcon = category.icon

  const colorClasses = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', headerBg: 'bg-blue-50' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', headerBg: 'bg-purple-50' },
    green: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', headerBg: 'bg-green-50' }
  }
  const colors = colorClasses[category.color]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        to="/policies"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Policy Library
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
                    {policy.number}
                  </span>
                  <StatusBadge status={policy.status} />
                  {policy.type === 'default' && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                      Template
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{policy.title}</h1>
                <p className="text-gray-500 mt-1">{category.name}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {policy.acknowledgmentSettings?.required && !userAcknowledgment && (
                <button
                  onClick={() => setShowAckModal(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  Acknowledge
                </button>
              )}
              {permissions.canEdit && (
                <button
                  onClick={() => setShowEditor(true)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>
              )}
              {permissions.canDelete && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Metadata bar */}
        <div className="px-6 py-3 bg-white border-t border-gray-100 flex items-center gap-6 text-sm">
          <span className="flex items-center gap-1.5 text-gray-600">
            <GitBranch className="w-4 h-4 text-gray-400" />
            v{policy.version}
          </span>
          <span className="flex items-center gap-1.5 text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            Effective: {formatDate(policy.effectiveDate)}
          </span>
          <span className="flex items-center gap-1.5 text-gray-600">
            <Clock className="w-4 h-4 text-gray-400" />
            Review: {formatDate(policy.reviewDate)}
          </span>
          <span className="flex items-center gap-1.5 text-gray-600">
            <User className="w-4 h-4 text-gray-400" />
            {policy.owner || 'Unassigned'}
          </span>
          {policy.acknowledgmentSettings?.required && (
            <span className="flex items-center gap-1.5 text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              {acknowledgmentCount} acknowledged
            </span>
          )}
        </div>
      </div>

      {/* Workflow actions */}
      {(permissions.canSubmitForReview || permissions.canSubmitForApproval || permissions.canPublish || permissions.canRetire) && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Workflow Actions</h3>
          <div className="flex flex-wrap gap-2">
            {permissions.canSubmitForReview && (
              <button
                onClick={() => handleWorkflowAction('submit_review')}
                className="btn-secondary text-sm"
              >
                Submit for Review
              </button>
            )}
            {permissions.canSubmitForApproval && (
              <button
                onClick={() => handleWorkflowAction('submit_approval')}
                className="btn-secondary text-sm"
              >
                Submit for Approval
              </button>
            )}
            {permissions.canPublish && (
              <button
                onClick={() => handleWorkflowAction('approve')}
                className="btn-primary text-sm flex items-center gap-1"
              >
                <Check className="w-4 h-4" />
                Approve & Publish
              </button>
            )}
            {permissions.canRetire && (
              <button
                onClick={() => handleWorkflowAction('retire')}
                className="btn-secondary text-sm text-red-600 hover:bg-red-50"
              >
                Retire Policy
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
            You acknowledged this policy on {formatDate(userAcknowledgment.acknowledgedAt?.toDate?.() || userAcknowledgment.acknowledgedAt)}
          </span>
        </div>
      )}

      {/* Tab navigation */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex border-b border-gray-200">
          {[
            { id: 'content', label: 'Content' },
            { id: 'history', label: 'Version History' },
            ...(policy.acknowledgmentSettings?.required && permissions.canViewAcknowledgments
              ? [{ id: 'acknowledgments', label: 'Acknowledgments' }]
              : [])
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
                <p className="text-gray-700">{policy.description || 'No description provided.'}</p>
              </div>

              {/* Main content */}
              {policy.content && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Policy Content</h3>
                  <div className="prose prose-sm max-w-none bg-gray-50 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap font-sans text-gray-700">
                      {policy.content}
                    </pre>
                  </div>
                </div>
              )}

              {/* Sections */}
              {policy.sections?.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-500">Policy Sections</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={expandAllSections}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Expand All
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={collapseAllSections}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Collapse All
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {policy.sections.map((section, index) => {
                      const sectionTitle = typeof section === 'string' ? section : section.title
                      const sectionContent = typeof section === 'string' ? null : section.content
                      const isExpanded = expandedSections[index]

                      return (
                        <div key={section.id || index} className="border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleSection(index)}
                            className="w-full bg-gray-50 px-4 py-3 flex items-center gap-3 hover:bg-gray-100 transition-colors text-left"
                          >
                            <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center justify-center font-medium flex-shrink-0">
                              {index + 1}
                            </span>
                            <h4 className="font-medium text-gray-900 flex-1">
                              {sectionTitle}
                            </h4>
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                          {isExpanded && (
                            <div className="p-4 border-t border-gray-200 bg-white">
                              {sectionContent ? (
                                <div className="text-gray-600 whitespace-pre-wrap">
                                  {sectionContent}
                                </div>
                              ) : (
                                <p className="text-gray-400 italic">
                                  No content available for this section. Edit the policy to add content.
                                </p>
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
              {policy.regulatoryRefs?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Regulatory References</h3>
                  <div className="flex flex-wrap gap-2">
                    {policy.regulatoryRefs.map((ref, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                        <Scale className="w-3 h-3" />
                        {ref}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Policies */}
              {policy.relatedPolicies?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Related Policies</h3>
                  <div className="flex flex-wrap gap-2">
                    {policy.relatedPolicies.map((num, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        <LinkIcon className="w-3 h-3" />
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Keywords */}
              {policy.keywords?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {policy.keywords.map((kw, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {policy.attachments?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Attachments</h3>
                  <div className="space-y-2">
                    {policy.attachments.map((att, i) => (
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

          {/* Version History Tab */}
          {activeTab === 'history' && (
            <PolicyVersionHistory
              policy={policy}
              onVersionRestored={loadPolicy}
            />
          )}

          {/* Acknowledgments Tab */}
          {activeTab === 'acknowledgments' && (
            <AcknowledgmentDashboard policyId={policy.id} />
          )}
        </div>
      </div>

      {/* Edit modal */}
      <PolicyEditor
        isOpen={showEditor}
        onClose={() => setShowEditor(false)}
        policy={policy}
        onSaved={loadPolicy}
      />

      {/* Acknowledgment modal */}
      <PolicyAcknowledgment
        policy={policy}
        isOpen={showAckModal}
        onClose={() => setShowAckModal(false)}
        onAcknowledged={() => {
          checkUserAcknowledgment()
          loadAcknowledgmentCount()
        }}
      />

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Policy</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{policy.number} - {policy.title}</strong>?
              This will also delete all version history and acknowledgment records.
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
                className="btn-primary bg-red-600 hover:bg-red-700 flex items-center gap-2"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete Policy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
