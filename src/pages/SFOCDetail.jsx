/**
 * SFOCDetail.jsx
 * Detailed view for SFOC application management
 * Includes document checklist, status tracking, TC communications
 *
 * @location src/pages/SFOCDetail.jsx
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useOrganization } from '../hooks/useOrganization'
import {
  ArrowLeft,
  FileCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  Send,
  Scale,
  Plane,
  MapPin,
  Calendar,
  ChevronRight,
  Upload,
  ExternalLink,
  MessageSquare,
  Activity,
  Edit,
  MoreVertical,
  RefreshCw,
  FileText,
  Trash2,
  Link as LinkIcon,
  Sparkles
} from 'lucide-react'
import {
  subscribeToSFOCApplication,
  subscribeToSFOCDocuments,
  updateSFOCApplication,
  updateSFOCStatus,
  updateSFOCDocument,
  deleteSFOCApplication,
  SFOC_STATUSES,
  SFOC_COMPLEXITY,
  SFOC_APPLICATION_TYPES,
  SFOC_OPERATION_TRIGGERS,
  DOCUMENT_CATEGORIES,
  DOCUMENT_STATUSES,
  getDaysUntilExpiry,
  isExpiringSoon,
  calculateDocumentCompletion
} from '../lib/firestoreSFOC'
import SFOCDocumentChecklist from '../components/sfoc/SFOCDocumentChecklist'
import SFOCAIPanel from '../components/sfoc/SFOCAIPanel'

export default function SFOCDetail() {
  const { applicationId } = useParams()
  const navigate = useNavigate()
  const { organization } = useOrganization()

  const [application, setApplication] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('documents')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)

  // Subscribe to application data
  useEffect(() => {
    if (!applicationId) return

    const unsubApp = subscribeToSFOCApplication(applicationId, (data) => {
      setApplication(data)
      setLoading(false)
    })

    const unsubDocs = subscribeToSFOCDocuments(applicationId, (data) => {
      setDocuments(data)
    })

    return () => {
      unsubApp()
      unsubDocs()
    }
  }, [applicationId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-lg font-medium text-gray-900">Application Not Found</h2>
        <p className="text-gray-500 mt-1">The SFOC application could not be found.</p>
        <button
          onClick={() => navigate('/sfoc')}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          Return to SFOC Hub
        </button>
      </div>
    )
  }

  const statusInfo = SFOC_STATUSES[application.status] || SFOC_STATUSES.draft
  const complexityInfo = SFOC_COMPLEXITY[application.complexityLevel] || SFOC_COMPLEXITY.medium
  const typeInfo = SFOC_APPLICATION_TYPES[application.applicationType] || SFOC_APPLICATION_TYPES.new
  const docCompletion = calculateDocumentCompletion(documents)
  const daysUntilExpiry = application.status === 'approved' ? getDaysUntilExpiry(application.approvedEndDate) : null

  const handleStatusChange = async (newStatus) => {
    try {
      await updateSFOCStatus(applicationId, newStatus)
      setShowStatusMenu(false)
    } catch (err) {
      console.error('Error updating status:', err)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteSFOCApplication(applicationId)
      navigate('/sfoc')
    } catch (err) {
      console.error('Error deleting application:', err)
    }
  }

  // Valid status transitions
  const getValidTransitions = () => {
    const transitions = {
      draft: ['documents_pending', 'sora_in_progress', 'cancelled'],
      documents_pending: ['draft', 'sora_in_progress', 'review_ready', 'cancelled'],
      sora_in_progress: ['documents_pending', 'review_ready', 'cancelled'],
      review_ready: ['documents_pending', 'submitted', 'cancelled'],
      submitted: ['under_review', 'additional_info_requested', 'approved', 'rejected'],
      under_review: ['additional_info_requested', 'approved', 'rejected'],
      additional_info_requested: ['under_review', 'rejected'],
      approved: ['expired'],
      rejected: ['draft'],
      expired: [],
      cancelled: ['draft']
    }
    return transitions[application.status] || []
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate('/sfoc')}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{application.name}</h1>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>{typeInfo.label}</span>
              <span className="text-gray-300">|</span>
              <span className={`flex items-center gap-1 ${
                application.complexityLevel === 'high' ? 'text-purple-600' : 'text-blue-600'
              }`}>
                <Scale className="w-4 h-4" />
                {complexityInfo.label}
              </span>
              {application.sfocNumber && (
                <>
                  <span className="text-gray-300">|</span>
                  <span className="font-medium text-green-600">SFOC #{application.sfocNumber}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Change Menu */}
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Update Status
              <ChevronRight className={`w-4 h-4 transition-transform ${showStatusMenu ? 'rotate-90' : ''}`} />
            </button>
            {showStatusMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="p-2">
                  {getValidTransitions().map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-100 flex items-center gap-2"
                    >
                      <span className={`w-2 h-2 rounded-full ${SFOC_STATUSES[status]?.color.split(' ')[0] || 'bg-gray-400'}`} />
                      {SFOC_STATUSES[status]?.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
              title="Delete Application"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Expiry Warning */}
      {application.status === 'approved' && daysUntilExpiry !== null && daysUntilExpiry <= 60 && (
        <div className={`p-4 rounded-lg border ${
          daysUntilExpiry <= 0 ? 'bg-red-50 border-red-200' :
          daysUntilExpiry <= 30 ? 'bg-orange-50 border-orange-200' :
          'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center gap-3">
            <AlertTriangle className={`w-5 h-5 ${
              daysUntilExpiry <= 0 ? 'text-red-600' :
              daysUntilExpiry <= 30 ? 'text-orange-600' :
              'text-yellow-600'
            }`} />
            <div>
              <p className={`font-medium ${
                daysUntilExpiry <= 0 ? 'text-red-900' :
                daysUntilExpiry <= 30 ? 'text-orange-900' :
                'text-yellow-900'
              }`}>
                {daysUntilExpiry <= 0 ? 'SFOC Expired' :
                 daysUntilExpiry === 1 ? 'SFOC expires tomorrow' :
                 `SFOC expires in ${daysUntilExpiry} days`}
              </p>
              <p className={`text-sm ${
                daysUntilExpiry <= 0 ? 'text-red-700' :
                daysUntilExpiry <= 30 ? 'text-orange-700' :
                'text-yellow-700'
              }`}>
                {daysUntilExpiry <= 0
                  ? 'Operations under this SFOC are no longer authorized. Submit a renewal application.'
                  : 'Consider submitting a renewal application to maintain operational authorization.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Additional Info Requested Alert */}
      {application.status === 'additional_info_requested' && (
        <div className="p-4 rounded-lg border bg-orange-50 border-orange-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-orange-900">Transport Canada requires additional information</p>
              <p className="text-sm text-orange-700 mt-1">
                Review the TC Communications tab for details on the requested information.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Document Progress */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Document Progress</span>
            <FileText className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-gray-900">{docCompletion}%</span>
            <span className="text-sm text-gray-500 mb-1">complete</span>
          </div>
          <div className="mt-2 h-2 bg-gray-100 rounded-full">
            <div
              className={`h-full rounded-full ${
                docCompletion === 100 ? 'bg-green-500' :
                docCompletion > 50 ? 'bg-blue-500' :
                'bg-yellow-500'
              }`}
              style={{ width: `${docCompletion}%` }}
            />
          </div>
        </div>

        {/* SORA Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">SORA Assessment</span>
            <Scale className="w-4 h-4 text-gray-400" />
          </div>
          {application.soraSummary?.sailLevel ? (
            <div className="flex items-center gap-4">
              <div>
                <span className={`text-2xl font-bold ${
                  application.soraSummary.sailLevel >= 5 ? 'text-red-600' :
                  application.soraSummary.sailLevel >= 3 ? 'text-orange-600' :
                  'text-green-600'
                }`}>
                  SAIL {application.soraSummary.sailLevel}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                <p>GRC: {application.soraSummary.finalGRC}</p>
                <p>ARC: {application.soraSummary.residualARC}</p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-500">Not linked</p>
              <Link
                to="/safety-declarations"
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-1"
              >
                Link SORA assessment
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>

        {/* Aircraft */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Aircraft</span>
            <Plane className="w-4 h-4 text-gray-400" />
          </div>
          {application.aircraftDetails ? (
            <div>
              <p className="font-medium text-gray-900">
                {application.aircraftDetails.manufacturer} {application.aircraftDetails.model}
              </p>
              <p className={`text-sm ${
                application.aircraftDetails.weightKg > 150 ? 'text-purple-600 font-medium' : 'text-gray-500'
              }`}>
                {application.aircraftDetails.weightKg} kg
                {application.aircraftDetails.weightKg > 150 && ' (Large RPAS)'}
              </p>
            </div>
          ) : (
            <p className="text-gray-500">No aircraft specified</p>
          )}
        </div>

        {/* Processing Time */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Processing Time</span>
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">~{complexityInfo.processingDays}</p>
          <p className="text-sm text-gray-500">business days</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {[
            { id: 'documents', label: 'Documents', icon: FileText },
            { id: 'details', label: 'Details', icon: FileCheck },
            { id: 'ai', label: 'AI Assistant', icon: Sparkles },
            { id: 'communications', label: 'TC Communications', icon: MessageSquare },
            { id: 'activity', label: 'Activity', icon: Activity }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'documents' && docCompletion < 100 && (
                <span className="ml-1 px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">
                  {100 - docCompletion}%
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200">
        {activeTab === 'documents' && (
          <SFOCDocumentChecklist
            applicationId={applicationId}
            documents={documents}
            operationTriggers={application.operationTriggers}
          />
        )}

        {activeTab === 'details' && (
          <div className="p-6 space-y-6">
            {/* Operation Triggers */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Operation Triggers</h3>
              <div className="flex flex-wrap gap-2">
                {(application.operationTriggers || []).map(triggerId => {
                  const trigger = SFOC_OPERATION_TRIGGERS[triggerId]
                  return (
                    <div
                      key={triggerId}
                      className={`px-3 py-2 rounded-lg border ${
                        trigger?.complexity === 'high'
                          ? 'bg-purple-50 border-purple-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <p className={`text-sm font-medium ${
                        trigger?.complexity === 'high' ? 'text-purple-700' : 'text-blue-700'
                      }`}>
                        {trigger?.label || triggerId}
                      </p>
                      <p className="text-xs text-gray-500">{trigger?.car_reference}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Operation Description */}
            {application.operationDescription && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Operation Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{application.operationDescription}</p>
              </div>
            )}

            {/* Operational Area */}
            {application.operationalArea && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Operational Area
                </h3>
                <p className="text-gray-700">{application.operationalArea}</p>
              </div>
            )}

            {/* Proposed/Approved Dates */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Proposed Period</h3>
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {application.proposedStartDate?.toLocaleDateString() || 'TBD'} - {application.proposedEndDate?.toLocaleDateString() || 'TBD'}
                </div>
              </div>
              {application.status === 'approved' && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Approved Period</h3>
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="w-4 h-4" />
                    {application.approvedStartDate?.toLocaleDateString()} - {application.approvedEndDate?.toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>

            {/* Aircraft Details */}
            {application.aircraftDetails && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Aircraft Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Manufacturer</p>
                    <p className="font-medium">{application.aircraftDetails.manufacturer}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Model</p>
                    <p className="font-medium">{application.aircraftDetails.model}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Weight</p>
                    <p className="font-medium">{application.aircraftDetails.weightKg} kg</p>
                  </div>
                  {application.aircraftDetails.registrationNumber && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Registration</p>
                      <p className="font-medium">{application.aircraftDetails.registrationNumber}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TC Reference */}
            {application.tcReferenceNumber && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Transport Canada Reference</h3>
                <p className="text-gray-700 font-mono">{application.tcReferenceNumber}</p>
              </div>
            )}

            {/* Applicant Info */}
            {application.applicantInfo && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Applicant Information</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Name</p>
                    <p className="font-medium">{application.applicantInfo.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Organization</p>
                    <p className="font-medium">{application.applicantInfo.organization}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Email</p>
                    <p className="font-medium">{application.applicantInfo.email}</p>
                  </div>
                  {application.applicantInfo.phone && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Phone</p>
                      <p className="font-medium">{application.applicantInfo.phone}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ai' && (
          <SFOCAIPanel sfocId={applicationId} application={application} />
        )}

        {activeTab === 'communications' && (
          <div className="p-6">
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="font-medium">TC Communications</p>
              <p className="text-sm mt-1">Communication tracking will be implemented in a future phase.</p>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="p-6">
            <div className="text-center py-12 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="font-medium">Activity Log</p>
              <p className="text-sm mt-1">Activity tracking will be implemented in a future phase.</p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowDeleteConfirm(false)} />
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Application?</h3>
              <p className="text-gray-500 mb-4">
                This will permanently delete this SFOC application and all associated documents. This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
