/**
 * CapaDetail.jsx
 * CAPA Detail View with Full Lifecycle Management
 * 
 * Displays:
 * - CAPA information and assignment
 * - Implementation tracking
 * - Evidence upload
 * - Verification of Effectiveness (VOE)
 * - Recurrence checking
 * - Status history
 * 
 * @location src/pages/CapaDetail.jsx
 * @action NEW FILE
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom'
import { 
  ArrowLeft,
  Edit,
  Trash2,
  AlertTriangle,
  Calendar,
  Clock,
  User,
  Building2,
  Plus,
  FileText,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Save,
  MessageSquare,
  Activity,
  Target,
  ClipboardCheck,
  Upload,
  ExternalLink,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import {
  getCapa,
  updateCapa,
  completeCapa,
  verifyCapa,
  recordRecurrenceCheck,
  closeCapa,
  deleteCapa,
  addCapaComment,
  CAPA_STATUS,
  CAPA_TYPES,
  PRIORITY_LEVELS
} from '../lib/firestoreSafety'

// Collapsible section component
function Section({ title, icon: Icon, children, defaultOpen = true, badge, status }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  return (
    <div className="card">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-gray-400" />}
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {badge && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
              {badge}
            </span>
          )}
          {status && (
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
              status === 'complete' ? 'bg-green-100 text-green-700' :
              status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
              status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {status.replace(/_/g, ' ')}
            </span>
          )}
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>
      {isOpen && <div className="mt-4 pt-4 border-t border-gray-100">{children}</div>}
    </div>
  )
}

// Info row component
function InfoRow({ label, value, icon: Icon }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-2">
      {Icon && <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />}
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm text-gray-900">{value}</p>
      </div>
    </div>
  )
}

// Status badge
function StatusBadge({ status }) {
  const statusInfo = CAPA_STATUS[status]
  if (!statusInfo) return null
  
  return (
    <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusInfo.color}`}>
      {statusInfo.label}
    </span>
  )
}

// Priority badge
function PriorityBadge({ priority }) {
  const priorityInfo = PRIORITY_LEVELS[priority]
  if (!priorityInfo) return null
  
  return (
    <span className={`px-3 py-1 text-sm font-medium rounded ${priorityInfo.color}`}>
      {priorityInfo.label}
    </span>
  )
}

// Progress stepper component
function ProgressStepper({ currentStatus }) {
  const steps = [
    { key: 'open', label: 'Open' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'pending_verification', label: 'Pending VOE' },
    { key: 'verified', label: 'Verified' },
    { key: 'closed', label: 'Closed' }
  ]
  
  const getCurrentStep = () => {
    if (currentStatus === 'closed') return 4
    if (currentStatus === 'verified_effective' || currentStatus === 'verified_ineffective') return 3
    if (currentStatus === 'pending_verification') return 2
    if (currentStatus === 'in_progress') return 1
    return 0
  }
  
  const currentStep = getCurrentStep()
  const isIneffective = currentStatus === 'verified_ineffective'
  
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, idx) => (
        <div key={step.key} className="flex items-center flex-1">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            idx < currentStep ? 'bg-green-500 text-white' :
            idx === currentStep ? (isIneffective && idx === 3 ? 'bg-red-500 text-white' : 'bg-aeria-blue text-white') :
            'bg-gray-200 text-gray-500'
          }`}>
            {idx < currentStep ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : idx === currentStep && isIneffective && idx === 3 ? (
              <XCircle className="w-5 h-5" />
            ) : (
              idx + 1
            )}
          </div>
          {idx < steps.length - 1 && (
            <div className={`flex-1 h-1 mx-2 ${
              idx < currentStep ? 'bg-green-500' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function CapaDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  const [capa, setCapa] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  
  // Form states
  const [showImplementationForm, setShowImplementationForm] = useState(false)
  const [showVerificationForm, setShowVerificationForm] = useState(false)
  const [showRecurrenceForm, setShowRecurrenceForm] = useState(false)
  const [showCommentForm, setShowCommentForm] = useState(false)
  
  const [implementationData, setImplementationData] = useState({
    actionsTaken: '',
    evidence: [],
    notes: ''
  })
  
  const [verificationData, setVerificationData] = useState({
    verifiedBy: '',
    effective: null,
    evidence: '',
    findings: ''
  })
  
  const [recurrenceData, setRecurrenceData] = useState({
    checkedBy: '',
    recurred: null,
    notes: ''
  })
  
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    loadCapa()
  }, [id])

  const loadCapa = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await getCapa(id)
      setCapa(data)
      
      // Pre-populate forms
      if (data.implementation) {
        setImplementationData({
          actionsTaken: data.implementation.actionsTaken || '',
          evidence: data.implementation.evidenceProvided || [],
          notes: data.implementation.completionNotes || ''
        })
      }
      
      if (data.verification) {
        setVerificationData({
          verifiedBy: data.verification.verifiedBy || '',
          effective: data.verification.effective,
          evidence: data.verification.evidence || '',
          findings: data.verification.findings || ''
        })
        
        if (data.verification.recurrenceCheck) {
          setRecurrenceData({
            checkedBy: data.verification.recurrenceCheck.checkedBy || '',
            recurred: data.verification.recurrenceCheck.recurred,
            notes: data.verification.recurrenceCheck.notes || ''
          })
        }
      }
    } catch (err) {
      console.error('Error loading CAPA:', err)
      setError('Failed to load CAPA')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    setSaving(true)
    try {
      await updateCapa(id, {
        status: newStatus,
        _changedBy: 'Current User',
        _statusChangeReason: ''
      })
      await loadCapa()
    } catch (err) {
      console.error('Error updating status:', err)
      alert('Failed to update status')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveImplementation = async () => {
    setSaving(true)
    try {
      await completeCapa(id, {
        actionsTaken: implementationData.actionsTaken,
        evidence: implementationData.evidence,
        notes: implementationData.notes,
        completedBy: 'Current User'
      })
      await loadCapa()
      setShowImplementationForm(false)
    } catch (err) {
      console.error('Error completing CAPA:', err)
      alert('Failed to save implementation')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveVerification = async () => {
    if (verificationData.effective === null) {
      alert('Please select whether the CAPA was effective')
      return
    }
    
    setSaving(true)
    try {
      await verifyCapa(id, {
        verifiedBy: verificationData.verifiedBy,
        effective: verificationData.effective,
        evidence: verificationData.evidence,
        findings: verificationData.findings
      })
      await loadCapa()
      setShowVerificationForm(false)
    } catch (err) {
      console.error('Error verifying CAPA:', err)
      alert('Failed to save verification')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveRecurrence = async () => {
    if (recurrenceData.recurred === null) {
      alert('Please select whether the issue has recurred')
      return
    }
    
    setSaving(true)
    try {
      await recordRecurrenceCheck(id, {
        checkedBy: recurrenceData.checkedBy,
        recurred: recurrenceData.recurred,
        notes: recurrenceData.notes
      })
      await loadCapa()
      setShowRecurrenceForm(false)
    } catch (err) {
      console.error('Error recording recurrence check:', err)
      alert('Failed to save recurrence check')
    } finally {
      setSaving(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    
    setSaving(true)
    try {
      await addCapaComment(id, {
        by: 'Current User',
        text: newComment
      })
      setNewComment('')
      await loadCapa()
      setShowCommentForm(false)
    } catch (err) {
      console.error('Error adding comment:', err)
      alert('Failed to add comment')
    } finally {
      setSaving(false)
    }
  }

  const handleCloseCapa = async () => {
    if (!confirm('Are you sure you want to close this CAPA?')) return
    
    setSaving(true)
    try {
      await closeCapa(id, 'Current User', 'CAPA closed')
      await loadCapa()
    } catch (err) {
      console.error('Error closing CAPA:', err)
      alert('Failed to close CAPA')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete CAPA ${capa.capaNumber}? This cannot be undone.`)) return
    
    try {
      await deleteCapa(id)
      navigate('/capas')
    } catch (err) {
      console.error('Error deleting CAPA:', err)
      alert('Failed to delete CAPA')
    }
  }

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Not set'
    try {
      const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue)
      return format(date, 'MMM d, yyyy')
    } catch {
      return 'Invalid date'
    }
  }

  const formatDateTime = (dateValue) => {
    if (!dateValue) return 'Unknown'
    try {
      const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue)
      return format(date, 'MMM d, yyyy h:mm a')
    } catch {
      return 'Invalid date'
    }
  }

  const getDaysInfo = () => {
    if (!capa?.targetDate) return null
    
    const targetDate = capa.targetDate.toDate ? capa.targetDate.toDate() : new Date(capa.targetDate)
    const today = new Date()
    const diff = differenceInDays(targetDate, today)
    
    if (['closed', 'verified_effective', 'verified_ineffective'].includes(capa.status)) {
      return null
    }
    
    if (diff < 0) {
      return { overdue: true, days: Math.abs(diff) }
    }
    
    return { overdue: false, days: diff }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="card text-center py-16">
          <div className="w-12 h-12 border-4 border-aeria-navy border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading CAPA...</p>
        </div>
      </div>
    )
  }

  if (error || !capa) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">CAPA Not Found</h1>
        </div>
        <div className="card border-red-200 bg-red-50 text-center py-8">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <h3 className="text-lg font-medium text-red-900 mb-1">{error || 'CAPA not found'}</h3>
          <Link to="/capas" className="btn-primary mt-4">
            Back to CAPAs
          </Link>
        </div>
      </div>
    )
  }

  const daysInfo = getDaysInfo()
  const isComplete = ['closed', 'verified_effective'].includes(capa.status)
  const isIneffective = capa.status === 'verified_ineffective'

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{capa.capaNumber}</h1>
              <StatusBadge status={capa.status} />
              <PriorityBadge priority={capa.priority} />
              {daysInfo?.overdue && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
                  {daysInfo.days}d overdue
                </span>
              )}
            </div>
            <p className="text-gray-600 mt-1">{capa.title}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          {!isComplete && !isIneffective && (
            <Link
              to={`/capas/${id}/edit`}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
          )}
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
            title="Delete CAPA"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="card">
        <h3 className="text-sm font-medium text-gray-500 mb-4">CAPA Progress</h3>
        <ProgressStepper currentStatus={capa.status} />
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Open</span>
          <span>In Progress</span>
          <span>Pending VOE</span>
          <span>Verified</span>
          <span>Closed</span>
        </div>
      </div>

      {/* Overdue Warning */}
      {daysInfo?.overdue && (
        <div className="p-4 rounded-lg border-2 bg-red-50 border-red-300">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-bold text-red-900">CAPA Overdue</h3>
              <p className="text-sm text-red-700">
                This CAPA is {daysInfo.days} days past its target date of {formatDate(capa.targetDate)}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Ineffective Warning */}
      {isIneffective && (
        <div className="p-4 rounded-lg border-2 bg-red-50 border-red-300">
          <div className="flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-bold text-red-900">CAPA Verified Ineffective</h3>
              <p className="text-sm text-red-700">
                This CAPA was found to be ineffective. Consider creating a new CAPA with revised actions.
              </p>
              <Link
                to={`/capas/new?sourceType=capa&sourceId=${id}&sourceReference=${capa.capaNumber}`}
                className="btn-primary text-sm mt-3"
              >
                Create Follow-up CAPA
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* CAPA Details */}
          <Section title="CAPA Details" icon={ClipboardCheck} defaultOpen={true}>
            <div className="grid sm:grid-cols-2 gap-4">
              <InfoRow label="Type" value={CAPA_TYPES[capa.type]?.label} icon={Target} />
              <InfoRow label="Priority" value={PRIORITY_LEVELS[capa.priority]?.label} icon={AlertTriangle} />
              <InfoRow label="Assigned To" value={capa.assignedTo} icon={User} />
              <InfoRow label="Assigned Date" value={formatDate(capa.assignedDate)} icon={Calendar} />
              <InfoRow label="Target Date" value={formatDate(capa.targetDate)} icon={Calendar} />
              {capa.completedDate && (
                <InfoRow label="Completed Date" value={formatDate(capa.completedDate)} icon={CheckCircle2} />
              )}
              <InfoRow label="Source" value={capa.sourceReference} icon={FileText} />
              <InfoRow label="Category" value={capa.category} icon={Building2} />
            </div>
            
            {capa.problemStatement && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Problem Statement</p>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{capa.problemStatement}</p>
              </div>
            )}
            
            {capa.rootCause && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Root Cause</p>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{capa.rootCause}</p>
              </div>
            )}
            
            {capa.action?.description && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Planned Action</p>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{capa.action.description}</p>
              </div>
            )}
          </Section>

          {/* Implementation */}
          <Section 
            title="Implementation" 
            icon={Wrench} 
            status={capa.implementation?.status || 'not_started'}
            defaultOpen={capa.status === 'in_progress' || capa.status === 'pending_verification'}
          >
            {!showImplementationForm ? (
              <div>
                {capa.implementation?.actionsTaken ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Actions Taken</p>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{capa.implementation.actionsTaken}</p>
                    </div>
                    
                    {capa.implementation.evidenceProvided?.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Evidence Provided</p>
                        <div className="space-y-1">
                          {capa.implementation.evidenceProvided.map((ev, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                              <FileText className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{ev.description || ev.type || `Evidence ${idx + 1}`}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {capa.implementation.completionNotes && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Completion Notes</p>
                        <p className="text-sm text-gray-900">{capa.implementation.completionNotes}</p>
                      </div>
                    )}
                    
                    {capa.status === 'in_progress' && (
                      <button
                        onClick={() => setShowImplementationForm(true)}
                        className="btn-secondary text-sm mt-4"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit Implementation
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Target className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 mb-4">No implementation recorded yet</p>
                    {capa.status === 'open' && (
                      <button
                        onClick={() => {
                          handleStatusChange('in_progress')
                          setShowImplementationForm(true)
                        }}
                        className="btn-primary"
                      >
                        Start Implementation
                      </button>
                    )}
                    {capa.status === 'in_progress' && (
                      <button
                        onClick={() => setShowImplementationForm(true)}
                        className="btn-primary"
                      >
                        Record Implementation
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Actions Taken *</label>
                  <textarea
                    value={implementationData.actionsTaken}
                    onChange={(e) => setImplementationData(prev => ({ ...prev, actionsTaken: e.target.value }))}
                    className="input"
                    rows={4}
                    placeholder="Describe the actions that were taken..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Completion Notes</label>
                  <textarea
                    value={implementationData.notes}
                    onChange={(e) => setImplementationData(prev => ({ ...prev, notes: e.target.value }))}
                    className="input"
                    rows={2}
                    placeholder="Any additional notes..."
                  />
                </div>
                
                <div className="flex items-center gap-2 pt-4">
                  <button
                    onClick={handleSaveImplementation}
                    disabled={saving || !implementationData.actionsTaken}
                    className="btn-primary"
                  >
                    {saving ? 'Saving...' : 'Complete Implementation'}
                  </button>
                  <button
                    onClick={() => setShowImplementationForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </Section>

          {/* Verification of Effectiveness */}
          <Section 
            title="Verification of Effectiveness" 
            icon={CheckCircle2}
            status={
              capa.verification?.effective === true ? 'effective' :
              capa.verification?.effective === false ? 'ineffective' :
              capa.status === 'pending_verification' ? 'pending' : null
            }
            defaultOpen={capa.status === 'pending_verification' || capa.verification?.verifiedDate}
          >
            {!showVerificationForm ? (
              <div>
                {capa.verification?.verifiedDate ? (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${
                      capa.verification.effective 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {capa.verification.effective ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span className={`font-medium ${
                          capa.verification.effective ? 'text-green-900' : 'text-red-900'
                        }`}>
                          {capa.verification.effective ? 'Verified Effective' : 'Verified Ineffective'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Verified by {capa.verification.verifiedBy} on {formatDate(capa.verification.verifiedDate)}
                      </p>
                    </div>
                    
                    {capa.verification.findings && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Findings</p>
                        <p className="text-sm text-gray-900">{capa.verification.findings}</p>
                      </div>
                    )}
                    
                    {capa.verification.evidence && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Evidence</p>
                        <p className="text-sm text-gray-900">{capa.verification.evidence}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 mb-4">Verification not yet completed</p>
                    {capa.status === 'pending_verification' && (
                      <button
                        onClick={() => setShowVerificationForm(true)}
                        className="btn-primary"
                      >
                        Verify Effectiveness
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Verified By *</label>
                  <input
                    type="text"
                    value={verificationData.verifiedBy}
                    onChange={(e) => setVerificationData(prev => ({ ...prev, verifiedBy: e.target.value }))}
                    className="input"
                    placeholder="Verifier name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Was the CAPA effective? *</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="effective"
                        checked={verificationData.effective === true}
                        onChange={() => setVerificationData(prev => ({ ...prev, effective: true }))}
                        className="text-green-600"
                      />
                      <span className="text-green-700">Yes, Effective</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="effective"
                        checked={verificationData.effective === false}
                        onChange={() => setVerificationData(prev => ({ ...prev, effective: false }))}
                        className="text-red-600"
                      />
                      <span className="text-red-700">No, Ineffective</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Findings</label>
                  <textarea
                    value={verificationData.findings}
                    onChange={(e) => setVerificationData(prev => ({ ...prev, findings: e.target.value }))}
                    className="input"
                    rows={3}
                    placeholder="Describe your verification findings..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Evidence</label>
                  <textarea
                    value={verificationData.evidence}
                    onChange={(e) => setVerificationData(prev => ({ ...prev, evidence: e.target.value }))}
                    className="input"
                    rows={2}
                    placeholder="Evidence of effectiveness or lack thereof..."
                  />
                </div>
                
                <div className="flex items-center gap-2 pt-4">
                  <button
                    onClick={handleSaveVerification}
                    disabled={saving || !verificationData.verifiedBy || verificationData.effective === null}
                    className="btn-primary"
                  >
                    {saving ? 'Saving...' : 'Save Verification'}
                  </button>
                  <button
                    onClick={() => setShowVerificationForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </Section>

          {/* Recurrence Check */}
          {capa.verification?.effective && (
            <Section 
              title="Recurrence Check" 
              icon={RefreshCw}
              status={
                capa.verification?.recurrenceCheck?.recurred === false ? 'no_recurrence' :
                capa.verification?.recurrenceCheck?.recurred === true ? 'recurred' :
                'pending'
              }
              defaultOpen={!capa.verification?.recurrenceCheck?.checkDate}
            >
              {!showRecurrenceForm ? (
                <div>
                  {capa.verification?.recurrenceCheck?.checkDate ? (
                    <div className="space-y-4">
                      <div className={`p-4 rounded-lg ${
                        capa.verification.recurrenceCheck.recurred 
                          ? 'bg-red-50 border border-red-200' 
                          : 'bg-green-50 border border-green-200'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          {capa.verification.recurrenceCheck.recurred ? (
                            <XCircle className="w-5 h-5 text-red-600" />
                          ) : (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          )}
                          <span className={`font-medium ${
                            capa.verification.recurrenceCheck.recurred ? 'text-red-900' : 'text-green-900'
                          }`}>
                            {capa.verification.recurrenceCheck.recurred ? 'Issue Recurred' : 'No Recurrence'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Checked by {capa.verification.recurrenceCheck.checkedBy} on {formatDate(capa.verification.recurrenceCheck.checkDate)}
                        </p>
                      </div>
                      
                      {capa.verification.recurrenceCheck.notes && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Notes</p>
                          <p className="text-sm text-gray-900">{capa.verification.recurrenceCheck.notes}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <RefreshCw className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500 mb-2">Recurrence check not yet completed</p>
                      <p className="text-xs text-gray-400 mb-4">
                        Recommended: 30-90 days after verification
                      </p>
                      <button
                        onClick={() => setShowRecurrenceForm(true)}
                        className="btn-primary"
                      >
                        Record Recurrence Check
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Checked By *</label>
                    <input
                      type="text"
                      value={recurrenceData.checkedBy}
                      onChange={(e) => setRecurrenceData(prev => ({ ...prev, checkedBy: e.target.value }))}
                      className="input"
                      placeholder="Your name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Has the issue recurred? *</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="recurred"
                          checked={recurrenceData.recurred === false}
                          onChange={() => setRecurrenceData(prev => ({ ...prev, recurred: false }))}
                          className="text-green-600"
                        />
                        <span className="text-green-700">No, not recurred</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="recurred"
                          checked={recurrenceData.recurred === true}
                          onChange={() => setRecurrenceData(prev => ({ ...prev, recurred: true }))}
                          className="text-red-600"
                        />
                        <span className="text-red-700">Yes, recurred</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={recurrenceData.notes}
                      onChange={(e) => setRecurrenceData(prev => ({ ...prev, notes: e.target.value }))}
                      className="input"
                      rows={2}
                      placeholder="Any observations or notes..."
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 pt-4">
                    <button
                      onClick={handleSaveRecurrence}
                      disabled={saving || !recurrenceData.checkedBy || recurrenceData.recurred === null}
                      className="btn-primary"
                    >
                      {saving ? 'Saving...' : 'Save Check'}
                    </button>
                    <button
                      onClick={() => setShowRecurrenceForm(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </Section>
          )}

          {/* Comments */}
          <Section 
            title="Comments" 
            icon={MessageSquare} 
            badge={capa.comments?.length}
            defaultOpen={false}
          >
            <div className="space-y-4">
              {capa.comments?.length > 0 ? (
                <div className="space-y-3">
                  {capa.comments.map((comment, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900 text-sm">{comment.by}</span>
                        <span className="text-xs text-gray-500">{formatDateTime(comment.date)}</span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No comments yet</p>
              )}
              
              {!showCommentForm ? (
                <button
                  onClick={() => setShowCommentForm(true)}
                  className="btn-secondary text-sm w-full"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Comment
                </button>
              ) : (
                <div className="space-y-2">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="input"
                    rows={2}
                    placeholder="Write a comment..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddComment}
                      disabled={saving || !newComment.trim()}
                      className="btn-primary text-sm"
                    >
                      {saving ? 'Adding...' : 'Add Comment'}
                    </button>
                    <button
                      onClick={() => {
                        setShowCommentForm(false)
                        setNewComment('')
                      }}
                      className="btn-secondary text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          {!isComplete && !isIneffective && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-2">
                {capa.status === 'open' && (
                  <button
                    onClick={() => handleStatusChange('in_progress')}
                    disabled={saving}
                    className="btn-primary w-full text-sm"
                  >
                    Start Implementation
                  </button>
                )}
                {capa.status === 'in_progress' && capa.implementation?.actionsTaken && (
                  <button
                    onClick={() => handleStatusChange('pending_verification')}
                    disabled={saving}
                    className="btn-primary w-full text-sm"
                  >
                    Ready for Verification
                  </button>
                )}
                {capa.status === 'verified_effective' && !capa.verification?.recurrenceCheck?.checkDate && (
                  <button
                    onClick={() => setShowRecurrenceForm(true)}
                    className="btn-primary w-full text-sm"
                  >
                    Record Recurrence Check
                  </button>
                )}
                {capa.status === 'verified_effective' && capa.verification?.recurrenceCheck?.recurred === false && (
                  <button
                    onClick={handleCloseCapa}
                    disabled={saving}
                    className="btn-primary w-full text-sm bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Close CAPA
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Status History */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-gray-400" />
              Status History
            </h3>
            
            {capa.statusHistory?.length > 0 ? (
              <div className="space-y-4">
                {capa.statusHistory.slice().reverse().map((entry, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-aeria-blue flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {entry.from ? `${entry.from} → ${entry.to}` : entry.to}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(entry.date)} by {entry.by}
                      </p>
                      {entry.reason && (
                        <p className="text-xs text-gray-600 mt-1">{entry.reason}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No status changes recorded</p>
            )}
          </div>

          {/* Metrics */}
          {(capa.metrics?.daysOpen || capa.metrics?.onTime !== undefined) && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Metrics</h3>
              <div className="space-y-2">
                {capa.metrics.onTime !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">On Time</span>
                    <span className={capa.metrics.onTime ? 'text-green-600' : 'text-red-600'}>
                      {capa.metrics.onTime ? 'Yes' : 'No'}
                    </span>
                  </div>
                )}
                {capa.metrics.effectivenessScore !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Effectiveness Score</span>
                    <span className="text-gray-900">{capa.metrics.effectivenessScore}%</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Related Items */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Related</h3>
            <div className="space-y-2">
              {capa.relatedIncidentId && (
                <Link
                  to={`/incidents/${capa.relatedIncidentId}`}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-gray-700 text-sm"
                >
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  View Related Incident
                </Link>
              )}
              <Link
                to="/capas"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-gray-700 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to CAPAs
              </Link>
              <Link
                to="/safety"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-gray-700 text-sm"
              >
                <Activity className="w-4 h-4" />
                Safety Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Missing import - add at top of file
const Wrench = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
)
