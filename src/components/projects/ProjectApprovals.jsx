import { useState, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import {
  FileCheck,
  UserCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Edit3,
  Users,
  Shield,
  ChevronDown,
  ChevronUp,
  Info,
  Calendar,
  MessageSquare,
  Lock,
  FileText,
  Square,
  CheckSquare
} from 'lucide-react'
import { sendTeamNotification } from '../../lib/teamNotificationService'

const approvalStatuses = {
  pending: { label: 'Pending Review', color: 'bg-gray-100 text-gray-700', icon: Clock },
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700', icon: Send },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  rejected: { label: 'Requires Changes', color: 'bg-red-100 text-red-700', icon: XCircle },
  conditional: { label: 'Conditional Approval', color: 'bg-amber-100 text-amber-700', icon: AlertTriangle }
}

const reviewerRoles = [
  { value: 'operations_manager', label: 'Operations Manager' },
  { value: 'chief_pilot', label: 'Chief Pilot' },
  { value: 'safety_officer', label: 'Safety Officer' },
  { value: 'client_representative', label: 'Client Representative' },
  { value: 'site_supervisor', label: 'Site Supervisor' },
  { value: 'other', label: 'Other' }
]

export default function ProjectApprovals({ project, onUpdate }) {
  const [expandedSections, setExpandedSections] = useState({
    documents: true,
    submission: true,
    approval: true,
    acknowledgments: true
  })

  // Document checklist items with requirements based on SAIL level
  const sites = useMemo(() => Array.isArray(project?.sites) ? project.sites : [], [project?.sites])

  const maxSAIL = useMemo(() => {
    const sailOrder = ['I', 'II', 'III', 'IV', 'V', 'VI']
    let maxIndex = -1
    sites.forEach(site => {
      const sail = site.soraAssessment?.sail
      const idx = sailOrder.indexOf(sail)
      if (idx > maxIndex) maxIndex = idx
    })
    return maxIndex >= 0 ? sailOrder[maxIndex] : null
  }, [sites])

  const documentItems = useMemo(() => [
    { id: 'ops_manual', name: 'Operations Manual', sailRequired: 'I', description: 'Company operations manual or SOP' },
    { id: 'emergency_plan', name: 'Emergency Response Plan', sailRequired: 'I', description: 'Emergency procedures and contacts' },
    { id: 'risk_assessment', name: 'Risk Assessment', sailRequired: 'I', description: 'SORA or equivalent risk assessment' },
    { id: 'pilot_certs', name: 'Pilot Certifications', sailRequired: 'I', description: 'Valid pilot certificates and ratings' },
    { id: 'insurance', name: 'Insurance Certificate', sailRequired: 'I', description: 'Liability insurance documentation' },
    { id: 'maintenance_log', name: 'Maintenance Records', sailRequired: 'III', description: 'Aircraft maintenance logs' },
    { id: 'training_records', name: 'Training Records', sailRequired: 'II', description: 'Crew training documentation' },
    { id: 'flight_auth', name: 'Flight Authorization (SFOC)', sailRequired: 'IV', description: 'Special flight operations certificate' }
  ], [])

  const isDocumentRequired = (sailRequired) => {
    if (!maxSAIL) return sailRequired === 'I'
    const sailOrder = ['I', 'II', 'III', 'IV', 'V', 'VI']
    return sailOrder.indexOf(maxSAIL) >= sailOrder.indexOf(sailRequired)
  }

  const toggleDocument = (docId) => {
    const currentChecklist = project.documentChecklist || {}
    onUpdate({
      documentChecklist: {
        ...currentChecklist,
        [docId]: !currentChecklist[docId]
      }
    })
  }

  // Initialize approvals if not present
  useEffect(() => {
    if (!project.approvals) {
      onUpdate({
        approvals: {
          status: 'pending',
          submittedBy: '',
          submittedDate: '',
          submissionNotes: '',
          reviewer: {
            name: '',
            role: 'operations_manager',
            email: ''
          },
          reviewDate: '',
          reviewNotes: '',
          conditions: '',
          crewAcknowledgments: []
        }
      })
    }
  }, [project.approvals])

  const approvals = project.approvals || {}
  const crew = project.crew || []

  const updateApprovals = (updates) => {
    onUpdate({
      approvals: {
        ...approvals,
        ...updates
      }
    })
  }

  const updateReviewer = (field, value) => {
    updateApprovals({
      reviewer: {
        ...(approvals.reviewer || {}),
        [field]: value
      }
    })
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Submit for approval
  const handleSubmit = () => {
    if (!approvals.submittedBy) {
      alert('Please enter your name before submitting.')
      return
    }
    updateApprovals({
      status: 'submitted',
      submittedDate: new Date().toISOString().split('T')[0]
    })
  }

  // Approve
  const handleApprove = async (withConditions = false) => {
    if (!approvals.reviewer?.name) {
      alert('Please enter reviewer name.')
      return
    }

    const newStatus = withConditions ? 'conditional' : 'approved'
    const reviewDate = new Date().toISOString().split('T')[0]

    updateApprovals({
      status: newStatus,
      reviewDate
    })

    // Send notification for approval
    if (project.id) {
      try {
        await sendTeamNotification(project.id, 'planApproved', {
          approver: approvals.reviewer?.name,
          date: reviewDate,
          conditions: withConditions ? approvals.conditions : null
        })
      } catch (error) {
        // Log error but don't block the UI update
        console.error('Failed to send plan approved notification:', error)
      }
    }
  }

  // Reject
  const handleReject = () => {
    if (!approvals.reviewer?.name) {
      alert('Please enter reviewer name.')
      return
    }
    if (!approvals.reviewNotes) {
      alert('Please provide notes on required changes.')
      return
    }
    updateApprovals({
      status: 'rejected',
      reviewDate: new Date().toISOString().split('T')[0]
    })
  }

  // Reset to draft
  const handleReset = () => {
    if (confirm('Reset approval status to pending? This will clear review information.')) {
      updateApprovals({
        status: 'pending',
        reviewDate: '',
        reviewNotes: '',
        conditions: ''
      })
    }
  }

  // Quick approve - bypass formal workflow
  const handleQuickApprove = async () => {
    const approverName = prompt('Enter your name for approval:')
    if (!approverName) return

    const reviewDate = new Date().toISOString().split('T')[0]

    updateApprovals({
      status: 'approved',
      submittedBy: approverName,
      submittedDate: reviewDate,
      reviewer: {
        name: approverName,
        role: 'operations_manager',
        email: ''
      },
      reviewDate,
      reviewNotes: 'Quick approval - formal review bypassed'
    })

    // Send notification
    if (project.id) {
      try {
        await sendTeamNotification(project.id, 'planApproved', {
          approver: approverName,
          date: reviewDate,
          conditions: null
        })
      } catch (error) {
        console.error('Failed to send approval notification:', error)
      }
    }
  }

  // Crew acknowledgment
  const handleCrewAcknowledge = (crewMemberId, crewMemberName) => {
    const existing = approvals.crewAcknowledgments || []
    const alreadyAcked = existing.find(a => a.crewId === crewMemberId)
    
    if (alreadyAcked) return
    
    updateApprovals({
      crewAcknowledgments: [
        ...existing,
        {
          crewId: crewMemberId,
          name: crewMemberName,
          date: new Date().toISOString().split('T')[0],
          timestamp: new Date().toISOString()
        }
      ]
    })
  }

  const removeAcknowledgment = (crewId) => {
    updateApprovals({
      crewAcknowledgments: (approvals.crewAcknowledgments || []).filter(a => a.crewId !== crewId)
    })
  }

  const getCrewAcknowledgment = (crewId) => {
    return (approvals.crewAcknowledgments || []).find(a => a.crewId === crewId)
  }

  const statusInfo = approvalStatuses[approvals.status] || approvalStatuses.pending
  const StatusIcon = statusInfo.icon

  const isApproved = approvals.status === 'approved' || approvals.status === 'conditional'
  const isLocked = isApproved
  const acknowledgedCount = (approvals.crewAcknowledgments || []).length
  const totalCrew = crew.length

  // Calculate readiness
  const checkReadiness = () => {
    const issues = []
    
    if (!project.name) issues.push('Project name missing')
    if (!project.startDate) issues.push('Start date not set')
    if (crew.length === 0) issues.push('No crew assigned')
    if (!crew.some(c => c.role === 'PIC')) issues.push('No PIC assigned')
    
    // Flight Plan is always on - check for max altitude
    if (project.sections?.flightPlan !== false) {
      if (!project.flightPlan?.maxAltitude) issues.push('Max altitude not set')
    }
    
    if (project.riskAssessment) {
      if (project.riskAssessment.overallRiskAcceptable === null) {
        issues.push('Risk assessment not reviewed')
      } else if (project.riskAssessment.overallRiskAcceptable === false) {
        issues.push('Risk assessment marked as not acceptable')
      }
    }
    
    if (!project.emergencyPlan?.primaryEmergencyContact?.name) {
      issues.push('Emergency contact not set')
    }
    
    return issues
  }

  const readinessIssues = checkReadiness()

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div className={`p-4 rounded-lg ${statusInfo.color} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <StatusIcon className="w-6 h-6" />
          <div>
            <p className="font-semibold">{statusInfo.label}</p>
            {approvals.reviewDate && (
              <p className="text-sm opacity-75">
                {approvals.status === 'submitted' ? 'Submitted' : 'Reviewed'} on {approvals.reviewDate}
              </p>
            )}
          </div>
        </div>
        {isLocked && (
          <div className="flex items-center gap-2 text-sm">
            <Lock className="w-4 h-4" />
            Plan Locked
          </div>
        )}
      </div>

      {/* Documents Checklist */}
      <div className="card">
        <button
          onClick={() => toggleSection('documents')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-aeria-blue" />
            Documents Checklist
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              documentItems.filter(d => isDocumentRequired(d.sailRequired)).every(d => project.documentChecklist?.[d.id])
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {documentItems.filter(d => isDocumentRequired(d.sailRequired) && project.documentChecklist?.[d.id]).length}/
              {documentItems.filter(d => isDocumentRequired(d.sailRequired)).length}
            </span>
          </h2>
          {expandedSections.documents ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.documents && (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-600 mb-3">
              Check off each document as you gather and verify them. Requirements based on SAIL {maxSAIL || 'I'} operations.
            </p>

            {documentItems.map(doc => {
              const required = isDocumentRequired(doc.sailRequired)
              const checked = project.documentChecklist?.[doc.id] || false

              return (
                <div
                  key={doc.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    !required ? 'opacity-50 bg-gray-50 border-gray-200' :
                    checked ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => required && !isLocked && toggleDocument(doc.id)}
                >
                  <div className="pt-0.5">
                    {checked ? (
                      <CheckSquare className="w-5 h-5 text-green-600" />
                    ) : (
                      <Square className={`w-5 h-5 ${required ? 'text-gray-400' : 'text-gray-300'}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${checked ? 'text-green-800' : 'text-gray-900'}`}>
                        {doc.name}
                      </span>
                      {required && !checked && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-red-100 text-red-700 rounded">Required</span>
                      )}
                      {!required && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-500 rounded">SAIL {doc.sailRequired}+</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{doc.description}</p>
                  </div>
                </div>
              )
            })}

            {isLocked && (
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Checklist locked after approval
              </p>
            )}
          </div>
        )}
      </div>

      {/* Readiness Check */}
      {readinessIssues.length > 0 && approvals.status === 'pending' && (
        <div className="card bg-amber-50 border-amber-200">
          <h3 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Readiness Issues
          </h3>
          <ul className="space-y-1">
            {readinessIssues.map((issue, i) => (
              <li key={i} className="text-sm text-amber-800 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {issue}
              </li>
            ))}
          </ul>
          <p className="text-xs text-amber-700 mt-3">
            Address these items before submitting for approval.
          </p>
        </div>
      )}

      {/* Submission Section */}
      <div className="card">
        <button
          onClick={() => toggleSection('submission')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Send className="w-5 h-5 text-aeria-blue" />
            Plan Submission
          </h2>
          {expandedSections.submission ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.submission && (
          <div className="mt-4 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Submitted By</label>
                <input
                  type="text"
                  value={approvals.submittedBy || ''}
                  onChange={(e) => updateApprovals({ submittedBy: e.target.value })}
                  className="input"
                  placeholder="Your name"
                  disabled={approvals.status !== 'pending'}
                />
              </div>
              <div>
                <label className="label">Submission Date</label>
                <input
                  type="date"
                  value={approvals.submittedDate || ''}
                  onChange={(e) => updateApprovals({ submittedDate: e.target.value })}
                  className="input"
                  disabled={approvals.status !== 'pending'}
                />
              </div>
            </div>

            <div>
              <label className="label">Submission Notes</label>
              <textarea
                value={approvals.submissionNotes || ''}
                onChange={(e) => updateApprovals({ submissionNotes: e.target.value })}
                className="input min-h-[80px]"
                placeholder="Any notes for the reviewer..."
                disabled={approvals.status !== 'pending'}
              />
            </div>

            {approvals.status === 'pending' && (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={readinessIssues.length > 0}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Submit for Approval
                </button>
                <button
                  onClick={handleQuickApprove}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 inline-flex items-center gap-2"
                  title="Bypass the formal review process"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Quick Approve
                </button>
              </div>
            )}

            {approvals.status === 'rejected' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Changes Required:</strong> Please address the reviewer's notes and resubmit.
                </p>
                <button
                  onClick={() => updateApprovals({ status: 'pending' })}
                  className="mt-2 text-sm text-red-700 hover:underline inline-flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  Edit and Resubmit
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Approval Section */}
      <div className="card">
        <button
          onClick={() => toggleSection('approval')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-aeria-blue" />
            Review & Approval
          </h2>
          {expandedSections.approval ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.approval && (
          <div className="mt-4 space-y-4">
            {/* Reviewer Info */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3">Reviewer Information</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="label">Reviewer Name</label>
                  <input
                    type="text"
                    value={approvals.reviewer?.name || ''}
                    onChange={(e) => updateReviewer('name', e.target.value)}
                    className="input"
                    placeholder="Name"
                    disabled={isApproved}
                  />
                </div>
                <div>
                  <label className="label">Role</label>
                  <select
                    value={approvals.reviewer?.role || 'operations_manager'}
                    onChange={(e) => updateReviewer('role', e.target.value)}
                    className="input"
                    disabled={isApproved}
                  >
                    {reviewerRoles.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    value={approvals.reviewer?.email || ''}
                    onChange={(e) => updateReviewer('email', e.target.value)}
                    className="input"
                    placeholder="Email"
                    disabled={isApproved}
                  />
                </div>
              </div>
            </div>

            {/* Review Notes */}
            <div>
              <label className="label">Review Notes</label>
              <textarea
                value={approvals.reviewNotes || ''}
                onChange={(e) => updateApprovals({ reviewNotes: e.target.value })}
                className="input min-h-[80px]"
                placeholder="Notes, required changes, or conditions..."
                disabled={isApproved}
              />
            </div>

            {/* Conditions (for conditional approval) */}
            {(approvals.status === 'conditional' || approvals.conditions) && (
              <div>
                <label className="label">Conditions of Approval</label>
                <textarea
                  value={approvals.conditions || ''}
                  onChange={(e) => updateApprovals({ conditions: e.target.value })}
                  className="input min-h-[60px]"
                  placeholder="Conditions that must be met..."
                  disabled={isApproved}
                />
              </div>
            )}

            {/* Approval Actions */}
            {approvals.status === 'submitted' && (
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => handleApprove(false)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 inline-flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => handleApprove(true)}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 inline-flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Approve with Conditions
                </button>
                <button
                  onClick={handleReject}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 inline-flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Request Changes
                </button>
              </div>
            )}

            {isApproved && (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-800">
                    Approved by {approvals.reviewer?.name} on {approvals.reviewDate}
                    {approvals.status === 'conditional' && ' (with conditions)'}
                  </span>
                </div>
                <button
                  onClick={handleReset}
                  className="text-xs text-green-700 hover:underline"
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Crew Acknowledgments */}
      <div className="card">
        <button
          onClick={() => toggleSection('acknowledgments')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-aeria-blue" />
            Crew Acknowledgments
            {totalCrew > 0 && (
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                acknowledgedCount === totalCrew 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {acknowledgedCount}/{totalCrew}
              </span>
            )}
          </h2>
          {expandedSections.acknowledgments ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.acknowledgments && (
          <div className="mt-4 space-y-4">
            {!isApproved && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600">
                  Crew acknowledgments are available after the plan is approved.
                </p>
              </div>
            )}

            {isApproved && crew.length === 0 && (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-gray-500">No crew members assigned.</p>
              </div>
            )}

            {isApproved && crew.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 mb-3">
                  Each crew member should acknowledge they have reviewed and understood the operations plan.
                </p>
                
                {crew.map((member) => {
                  const ack = getCrewAcknowledgment(member.id)
                  
                  return (
                    <div 
                      key={member.id}
                      className={`p-3 rounded-lg border ${
                        ack ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                            ack ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {member.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{member.name}</p>
                            <p className="text-sm text-gray-500">{member.role}</p>
                          </div>
                        </div>
                        
                        {ack ? (
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-sm text-green-700 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                Acknowledged
                              </p>
                              <p className="text-xs text-green-600">{ack.date}</p>
                            </div>
                            <button
                              onClick={() => removeAcknowledgment(member.id)}
                              className="text-xs text-gray-400 hover:text-red-500"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleCrewAcknowledge(member.id, member.name)}
                            className="px-3 py-1.5 text-sm bg-aeria-navy text-white rounded-lg hover:bg-aeria-blue"
                          >
                            Acknowledge
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}

                {acknowledgedCount === totalCrew && totalCrew > 0 && (
                  <div className="p-3 bg-green-100 border border-green-200 rounded-lg mt-4">
                    <p className="text-sm text-green-800 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      All crew members have acknowledged the operations plan.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Approval History / Audit Trail */}
      {(approvals.submittedDate || approvals.reviewDate) && (
        <div className="card bg-gray-50">
          <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Approval Timeline
          </h3>
          <div className="space-y-2 text-sm">
            {approvals.submittedDate && (
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-gray-600">
                  Submitted by {approvals.submittedBy || 'Unknown'} on {approvals.submittedDate}
                </span>
              </div>
            )}
            {approvals.reviewDate && (
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  approvals.status === 'approved' ? 'bg-green-500' :
                  approvals.status === 'conditional' ? 'bg-amber-500' :
                  approvals.status === 'rejected' ? 'bg-red-500' : 'bg-gray-500'
                }`} />
                <span className="text-gray-600">
                  {approvals.status === 'rejected' ? 'Changes requested' : 'Approved'} by {approvals.reviewer?.name || 'Unknown'} on {approvals.reviewDate}
                </span>
              </div>
            )}
            {(approvals.crewAcknowledgments || []).map((ack, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-gray-600">
                  {ack.name} acknowledged on {ack.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Approval Workflow</h3>
            <p className="text-sm text-blue-700 mt-1">
              Operations plans must be reviewed and approved before field operations. 
              Once approved, the plan is locked to prevent changes. All crew members 
              should acknowledge review before the tailgate briefing.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

ProjectApprovals.propTypes = {
  project: PropTypes.shape({
    approvals: PropTypes.object,
    crew: PropTypes.array
  }).isRequired,
  onUpdate: PropTypes.func.isRequired
}
