/**
 * SORACard.jsx
 * Card component for displaying SORA assessment summary
 *
 * @location src/components/sora/SORACard.jsx
 */

import {
  FileText,
  Target,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Link as LinkIcon
} from 'lucide-react'
import { SORA_STATUSES, SORA_WIZARD_STEPS } from '../../lib/firestoreSora'
import { sailColors, sailDescriptions } from '../../lib/soraConfig'

export default function SORACard({ assessment, viewMode = 'grid', onClick }) {
  const status = SORA_STATUSES[assessment.status] || SORA_STATUSES.draft

  // Calculate progress
  const currentStepIndex = SORA_WIZARD_STEPS.findIndex(s => s.id === assessment.currentStep)
  const progressPercent = Math.round(((currentStepIndex + 1) / SORA_WIZARD_STEPS.length) * 100)

  // OSO compliance status
  const osoProgress = assessment.osoSummary
    ? Math.round((assessment.osoSummary.compliantCount / assessment.osoSummary.totalOSOs) * 100)
    : 0

  const formatDate = (date) => {
    if (!date) return null
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (viewMode === 'list') {
    return (
      <div
        onClick={onClick}
        className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
      >
        <div className="flex items-center gap-4 p-4">
          {/* Status Icon */}
          <div className={`p-2 rounded-lg ${
            assessment.status === 'approved' ? 'bg-green-100' :
            assessment.status === 'ready_for_review' ? 'bg-cyan-100' :
            'bg-gray-100'
          }`}>
            {assessment.status === 'approved' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : assessment.status === 'ready_for_review' ? (
              <Target className="w-5 h-5 text-cyan-600" />
            ) : (
              <FileText className="w-5 h-5 text-gray-600" />
            )}
          </div>

          {/* Main Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900 truncate">{assessment.name}</h3>
              {assessment.sfocApplicationId && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded">
                  <LinkIcon className="w-3 h-3" />
                  SFOC
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 truncate">
              {assessment.conops?.operationDescription?.purpose || 'No description'}
            </p>
          </div>

          {/* SAIL Badge */}
          {assessment.sail?.level && (
            <div className={`px-3 py-1 rounded-lg text-center ${sailColors[assessment.sail.level]}`}>
              <p className="text-xs font-medium">SAIL</p>
              <p className="text-lg font-bold">{assessment.sail.level}</p>
            </div>
          )}

          {/* GRC/ARC Summary */}
          <div className="text-center">
            <p className="text-xs text-gray-500">GRC</p>
            <p className="font-medium text-gray-900">
              {assessment.groundRisk?.finalGRC ?? '-'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">ARC</p>
            <p className="font-medium text-gray-900">
              {assessment.airRisk?.residualARC?.replace('ARC-', '') ?? '-'}
            </p>
          </div>

          {/* Status */}
          <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${status.color}`}>
            {status.label}
          </span>

          {/* Arrow */}
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </div>

        {/* Progress Bar */}
        {assessment.status !== 'approved' && (
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{progressPercent}%</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Grid view
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer overflow-hidden"
    >
      {/* Header */}
      <div className={`px-4 py-3 border-b ${
        assessment.status === 'approved' ? 'bg-green-50 border-green-200' :
        assessment.status === 'ready_for_review' ? 'bg-cyan-50 border-cyan-200' :
        'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${status.color}`}>
            {status.label}
          </span>
          {assessment.sfocApplicationId && (
            <span className="flex items-center gap-1 text-xs text-indigo-600">
              <LinkIcon className="w-3 h-3" />
              Linked to SFOC
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
          {assessment.name}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
          {assessment.conops?.operationDescription?.purpose || 'No description provided'}
        </p>

        {/* SAIL & Risk Summary */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {/* SAIL */}
          <div className={`p-2 rounded-lg text-center ${
            assessment.sail?.level ? sailColors[assessment.sail.level] : 'bg-gray-100'
          }`}>
            <p className="text-xs font-medium">SAIL</p>
            <p className="text-xl font-bold">{assessment.sail?.level || '-'}</p>
          </div>

          {/* GRC */}
          <div className="p-2 rounded-lg text-center bg-gray-100">
            <p className="text-xs text-gray-500">Final GRC</p>
            <p className="text-xl font-bold text-gray-900">
              {assessment.groundRisk?.finalGRC ?? '-'}
            </p>
          </div>

          {/* ARC */}
          <div className="p-2 rounded-lg text-center bg-gray-100">
            <p className="text-xs text-gray-500">Res. ARC</p>
            <p className="text-xl font-bold text-gray-900">
              {assessment.airRisk?.residualARC?.replace('ARC-', '') ?? '-'}
            </p>
          </div>
        </div>

        {/* OSO Compliance */}
        {assessment.sail?.level && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">OSO Compliance</span>
              <span className="text-xs font-medium text-gray-700">
                {assessment.osoSummary?.compliantCount || 0}/{assessment.osoSummary?.totalOSOs || 24}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  assessment.osoSummary?.overallCompliant
                    ? 'bg-green-500'
                    : osoProgress >= 50
                    ? 'bg-yellow-500'
                    : 'bg-red-400'
                }`}
                style={{ width: `${osoProgress}%` }}
              />
            </div>
            {assessment.osoSummary?.overallCompliant && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                All required OSOs compliant
              </p>
            )}
          </div>
        )}

        {/* Progress */}
        {assessment.status !== 'approved' && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">Assessment Progress</span>
              <span className="text-xs font-medium text-gray-700">
                {SORA_WIZARD_STEPS.find(s => s.id === assessment.currentStep)?.label || 'Getting Started'}
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
          <span>
            Updated {formatDate(assessment.updatedAt)}
          </span>
          <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            View Details
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
