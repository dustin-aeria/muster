/**
 * SORADetail.jsx
 * Full SORA assessment view with integrated wizard
 *
 * Displays step-by-step SORA assessment process with:
 * - ConOps builder
 * - GRC/ARC calculators
 * - SAIL determination
 * - OSO compliance matrix
 *
 * @location src/pages/SORADetail.jsx
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  FileText,
  Target,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  ChevronRight,
  Download,
  Link as LinkIcon,
  Settings,
  Trash2
} from 'lucide-react'
import {
  subscribeToSORAAssessment,
  subscribeToOSOStatuses,
  SORA_STATUSES,
  SORA_WIZARD_STEPS,
  deleteSORAAssessment
} from '../lib/firestoreSora'
import { sailColors, sailDescriptions } from '../lib/soraConfig'
import SORAAssessmentWizard from '../components/sora/SORAAssessmentWizard'

export default function SORADetail() {
  const { assessmentId } = useParams()
  const navigate = useNavigate()
  const [assessment, setAssessment] = useState(null)
  const [osoStatuses, setOsoStatuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Subscribe to assessment
  useEffect(() => {
    if (!assessmentId) return

    const unsubscribeAssessment = subscribeToSORAAssessment(assessmentId, (data) => {
      setAssessment(data)
      setLoading(false)
    })

    const unsubscribeOSO = subscribeToOSOStatuses(assessmentId, (data) => {
      setOsoStatuses(data)
    })

    return () => {
      unsubscribeAssessment()
      unsubscribeOSO()
    }
  }, [assessmentId])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteSORAAssessment(assessmentId)
      navigate('/sora')
    } catch (err) {
      console.error('Error deleting assessment:', err)
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Assessment Not Found</h2>
        <p className="text-gray-500 mb-4">This SORA assessment could not be found.</p>
        <button
          onClick={() => navigate('/sora')}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Back to SORA Hub
        </button>
      </div>
    )
  }

  const status = SORA_STATUSES[assessment.status] || SORA_STATUSES.draft
  const currentStepIndex = SORA_WIZARD_STEPS.findIndex(s => s.id === assessment.currentStep)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate('/sora')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{assessment.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-sm font-medium ${status.color}`}>
                {status.label}
              </span>
              {assessment.sfocApplicationId && (
                <button
                  onClick={() => navigate(`/sfoc/${assessment.sfocApplicationId}`)}
                  className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
                >
                  <LinkIcon className="w-4 h-4" />
                  View SFOC Application
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Assessment"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* SAIL Summary Banner */}
      {assessment.sail?.level && (
        <div className={`rounded-xl p-4 ${sailColors[assessment.sail.level]}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-xs font-medium opacity-75">SAIL Level</p>
                <p className="text-4xl font-bold">{assessment.sail.level}</p>
              </div>
              <div className="border-l border-current/20 pl-4">
                <p className="text-sm font-medium">{sailDescriptions[assessment.sail.level]}</p>
                <div className="flex gap-4 mt-1 text-sm">
                  <span>GRC: {assessment.groundRisk?.finalGRC}</span>
                  <span>ARC: {assessment.airRisk?.residualARC}</span>
                </div>
              </div>
            </div>

            {/* OSO Summary */}
            <div className="text-right">
              <p className="text-sm font-medium">OSO Compliance</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold">
                  {assessment.osoSummary?.compliantCount || 0}/{assessment.osoSummary?.totalOSOs || 24}
                </p>
                {assessment.osoSummary?.overallCompliant ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Clock className="w-5 h-5" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Steps */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between overflow-x-auto">
          {SORA_WIZARD_STEPS.map((step, index) => {
            const isComplete = index < currentStepIndex || assessment.status === 'approved'
            const isCurrent = index === currentStepIndex
            const isAccessible = index <= currentStepIndex + 1

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    isCurrent
                      ? 'bg-blue-100 text-blue-700'
                      : isComplete
                      ? 'text-green-700'
                      : isAccessible
                      ? 'text-gray-600 hover:bg-gray-50'
                      : 'text-gray-400'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                    isComplete
                      ? 'bg-green-500 text-white'
                      : isCurrent
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {isComplete ? <CheckCircle className="w-4 h-4" /> : step.number}
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap hidden sm:inline">
                    {step.label}
                  </span>
                </div>
                {index < SORA_WIZARD_STEPS.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-300 mx-1 flex-shrink-0" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Wizard Content */}
      <SORAAssessmentWizard
        assessment={assessment}
        osoStatuses={osoStatuses}
        currentStep={assessment.currentStep}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setShowDeleteConfirm(false)}
            />
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Assessment</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{assessment.name}"? This action cannot be undone
                and all OSO compliance data will be lost.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete Assessment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
