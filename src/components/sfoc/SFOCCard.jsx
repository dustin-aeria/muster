/**
 * SFOCCard.jsx
 * Card component for displaying SFOC application summaries
 *
 * @location src/components/sfoc/SFOCCard.jsx
 */

import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileCheck,
  Plane,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Calendar,
  Scale,
  MapPin,
  Send,
  AlertCircle
} from 'lucide-react'
import {
  SFOC_STATUSES,
  SFOC_COMPLEXITY,
  SFOC_APPLICATION_TYPES,
  SFOC_OPERATION_TRIGGERS,
  getDaysUntilExpiry,
  isExpiringSoon,
  isExpired
} from '../../lib/firestoreSFOC'

export default function SFOCCard({ application, onClick }) {
  const navigate = useNavigate()

  const statusInfo = SFOC_STATUSES[application.status] || SFOC_STATUSES.draft
  const complexityInfo = SFOC_COMPLEXITY[application.complexityLevel] || SFOC_COMPLEXITY.medium
  const typeInfo = SFOC_APPLICATION_TYPES[application.applicationType] || SFOC_APPLICATION_TYPES.new

  // Calculate days since last activity
  const daysSinceActivity = useMemo(() => {
    if (!application.lastActivityAt) return null
    const now = new Date()
    const lastActivity = application.lastActivityAt instanceof Date
      ? application.lastActivityAt
      : new Date(application.lastActivityAt)
    const diffTime = Math.abs(now - lastActivity)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }, [application.lastActivityAt])

  // Calculate days until expiry for approved SFOCs
  const daysUntilExpiry = useMemo(() => {
    if (application.status !== 'approved' || !application.approvedEndDate) return null
    return getDaysUntilExpiry(application.approvedEndDate)
  }, [application.status, application.approvedEndDate])

  const handleClick = () => {
    if (onClick) {
      onClick(application)
    } else {
      navigate(`/sfoc/${application.id}`)
    }
  }

  // Get trigger labels (first 3)
  const triggerLabels = (application.operationTriggers || [])
    .slice(0, 3)
    .map(t => SFOC_OPERATION_TRIGGERS[t]?.label || t)

  // Determine card accent based on status/complexity
  const getAccentColor = () => {
    if (application.status === 'approved') {
      if (daysUntilExpiry !== null && daysUntilExpiry <= 0) return 'border-red-500'
      if (daysUntilExpiry !== null && daysUntilExpiry <= 60) return 'border-orange-400'
      return 'border-green-500'
    }
    if (application.status === 'rejected') return 'border-red-500'
    if (application.status === 'additional_info_requested') return 'border-orange-400'
    if (application.complexityLevel === 'high') return 'border-purple-400'
    return 'border-gray-200'
  }

  return (
    <div
      onClick={handleClick}
      className={`bg-white rounded-lg border-2 hover:shadow-md transition-all cursor-pointer overflow-hidden ${getAccentColor()}`}
    >
      {/* Status/Expiry Banner for approved SFOCs */}
      {application.status === 'approved' && daysUntilExpiry !== null && (
        <div className={`px-4 py-2 text-xs font-medium ${
          daysUntilExpiry <= 0 ? 'bg-red-100 text-red-800' :
          daysUntilExpiry <= 30 ? 'bg-orange-100 text-orange-800' :
          daysUntilExpiry <= 60 ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {daysUntilExpiry <= 0 ? (
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              SFOC Expired
            </span>
          ) : daysUntilExpiry === 1 ? (
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Expires Tomorrow
            </span>
          ) : daysUntilExpiry <= 60 ? (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {daysUntilExpiry} days until expiry
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Valid for {daysUntilExpiry} days
            </span>
          )}
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-lg ${
              application.status === 'approved' ? 'bg-green-100' :
              application.status === 'rejected' ? 'bg-red-100' :
              application.status === 'submitted' || application.status === 'under_review' ? 'bg-blue-100' :
              application.status === 'additional_info_requested' ? 'bg-orange-100' :
              application.complexityLevel === 'high' ? 'bg-purple-100' :
              'bg-gray-100'
            }`}>
              <FileCheck className={`w-5 h-5 ${
                application.status === 'approved' ? 'text-green-600' :
                application.status === 'rejected' ? 'text-red-600' :
                application.status === 'submitted' || application.status === 'under_review' ? 'text-blue-600' :
                application.status === 'additional_info_requested' ? 'text-orange-600' :
                application.complexityLevel === 'high' ? 'text-purple-600' :
                'text-gray-600'
              }`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 line-clamp-1">
                {application.name}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {typeInfo.label}
              </p>
            </div>
          </div>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>

        {/* Aircraft Info */}
        {application.aircraftDetails && (
          <div className="flex items-center gap-2 mb-3 text-sm">
            <Plane className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700 font-medium">
              {application.aircraftDetails.manufacturer} {application.aircraftDetails.model}
            </span>
            {application.aircraftDetails.weightKg && (
              <>
                <span className="text-gray-400">|</span>
                <span className={`${
                  application.aircraftDetails.weightKg > 150
                    ? 'text-purple-600 font-medium'
                    : 'text-gray-500'
                }`}>
                  {application.aircraftDetails.weightKg} kg
                </span>
              </>
            )}
          </div>
        )}

        {/* Operational Area */}
        {application.operationalArea && (
          <div className="flex items-center gap-2 mb-3 text-sm">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600 line-clamp-1">
              {application.operationalArea}
            </span>
          </div>
        )}

        {/* SFOC Number (if approved) */}
        {application.sfocNumber && (
          <div className="mb-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-green-100 text-green-700 font-medium">
              SFOC #{application.sfocNumber}
            </span>
          </div>
        )}

        {/* Complexity Badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
            application.complexityLevel === 'high'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            <Scale className="w-3 h-3" />
            {complexityInfo.label}
          </span>
          <span className="text-xs text-gray-500">
            ~{complexityInfo.processingDays} business days
          </span>
        </div>

        {/* Operation Triggers */}
        {triggerLabels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {triggerLabels.map((label, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
              >
                {label}
              </span>
            ))}
            {application.operationTriggers?.length > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                +{application.operationTriggers.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* SORA Summary (if linked) */}
        {application.soraSummary?.sailLevel && (
          <div className="flex items-center gap-3 mb-4 py-3 border-t border-b border-gray-100">
            <div className="text-center flex-1">
              <p className={`text-lg font-bold ${
                application.soraSummary.sailLevel >= 5 ? 'text-red-600' :
                application.soraSummary.sailLevel >= 3 ? 'text-orange-600' :
                'text-green-600'
              }`}>
                SAIL {application.soraSummary.sailLevel}
              </p>
              <p className="text-xs text-gray-500">Assurance Level</p>
            </div>
            <div className="w-px h-10 bg-gray-200" />
            <div className="text-center flex-1">
              <p className="text-lg font-bold text-gray-900">
                {application.soraSummary.finalGRC}
              </p>
              <p className="text-xs text-gray-500">Ground Risk</p>
            </div>
            <div className="w-px h-10 bg-gray-200" />
            <div className="text-center flex-1">
              <p className="text-lg font-bold text-gray-900">
                {application.soraSummary.residualARC}
              </p>
              <p className="text-xs text-gray-500">Air Risk</p>
            </div>
          </div>
        )}

        {/* TC Communication Status */}
        {application.tcReferenceNumber && (
          <div className="mb-4 p-2 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Send className="w-4 h-4" />
              <span>TC Ref: {application.tcReferenceNumber}</span>
            </div>
          </div>
        )}

        {/* Additional Info Requested Alert */}
        {application.status === 'additional_info_requested' && (
          <div className="mb-4 p-2 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 text-sm text-orange-700">
              <AlertCircle className="w-4 h-4" />
              <span>Transport Canada requires additional information</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4 text-sm">
            {daysSinceActivity !== null && (
              <div className="flex items-center gap-1.5 text-gray-500">
                <Clock className="w-4 h-4" />
                <span>
                  {daysSinceActivity === 0
                    ? 'Today'
                    : daysSinceActivity === 1
                    ? 'Yesterday'
                    : `${daysSinceActivity}d ago`
                  }
                </span>
              </div>
            )}
            {application.createdAt && (
              <div className="flex items-center gap-1.5 text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>
                  {application.createdAt instanceof Date
                    ? application.createdAt.toLocaleDateString()
                    : new Date(application.createdAt).toLocaleDateString()
                  }
                </span>
              </div>
            )}
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </div>
  )
}

/**
 * Compact version for list views or selection dialogs
 */
export function SFOCCardCompact({ application, onClick, selected = false }) {
  const navigate = useNavigate()
  const statusInfo = SFOC_STATUSES[application.status] || SFOC_STATUSES.draft
  const complexityInfo = SFOC_COMPLEXITY[application.complexityLevel] || SFOC_COMPLEXITY.medium

  const handleClick = () => {
    if (onClick) {
      onClick(application)
    } else {
      navigate(`/sfoc/${application.id}`)
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`flex items-center justify-between p-4 bg-white rounded-lg border transition-all cursor-pointer ${
        selected
          ? 'border-blue-500 ring-1 ring-blue-500'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${
          application.status === 'approved' ? 'bg-green-50' :
          application.complexityLevel === 'high' ? 'bg-purple-50' :
          'bg-blue-50'
        }`}>
          <FileCheck className={`w-5 h-5 ${
            application.status === 'approved' ? 'text-green-600' :
            application.complexityLevel === 'high' ? 'text-purple-600' :
            'text-blue-600'
          }`} />
        </div>
        <div>
          <h4 className="font-medium text-gray-900">{application.name}</h4>
          <p className="text-sm text-gray-500">
            {application.aircraftDetails?.manufacturer} {application.aircraftDetails?.model}
            {application.sfocNumber && ` • SFOC #${application.sfocNumber}`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
          application.complexityLevel === 'high'
            ? 'bg-purple-100 text-purple-700'
            : 'bg-blue-100 text-blue-700'
        }`}>
          {complexityInfo.label}
        </span>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  )
}
