/**
 * DeclarationCard.jsx
 * Reusable card component for displaying Safety Declaration summaries
 *
 * @location src/components/safetyDeclaration/DeclarationCard.jsx
 */

import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileCheck,
  Plane,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Calendar,
  TestTube,
  FileText,
  Shield
} from 'lucide-react'
import {
  DECLARATION_STATUSES,
  DECLARATION_TYPES,
  RPAS_CATEGORIES,
  KINETIC_ENERGY_CATEGORIES
} from '../../lib/firestoreSafetyDeclaration'

export default function DeclarationCard({ declaration, stats, onClick }) {
  const navigate = useNavigate()

  const statusInfo = DECLARATION_STATUSES[declaration.status] || DECLARATION_STATUSES.draft
  const typeInfo = DECLARATION_TYPES[declaration.declarationType] || DECLARATION_TYPES.declaration
  const categoryInfo = RPAS_CATEGORIES[declaration.rpasDetails?.category] || RPAS_CATEGORIES.small
  const keCategory = KINETIC_ENERGY_CATEGORIES[declaration.rpasDetails?.kineticEnergyCategory]

  // Calculate days since last activity
  const daysSinceActivity = useMemo(() => {
    if (!declaration.lastActivityAt) return null
    const now = new Date()
    const lastActivity = declaration.lastActivityAt instanceof Date
      ? declaration.lastActivityAt
      : new Date(declaration.lastActivityAt)
    const diffTime = Math.abs(now - lastActivity)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }, [declaration.lastActivityAt])

  const handleClick = () => {
    if (onClick) {
      onClick(declaration)
    } else {
      navigate(`/safety-declarations/${declaration.id}`)
    }
  }

  // Progress calculation
  const completionPercentage = stats?.requirements?.completionPercentage || 0

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer overflow-hidden"
    >
      {/* Progress Bar */}
      <div className="h-1 bg-gray-100">
        <div
          className={`h-full transition-all ${
            completionPercentage === 100 ? 'bg-green-500' :
            completionPercentage > 50 ? 'bg-blue-500' :
            completionPercentage > 0 ? 'bg-yellow-500' :
            'bg-gray-300'
          }`}
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-lg ${
              declaration.status === 'accepted' ? 'bg-green-100' :
              declaration.status === 'rejected' ? 'bg-red-100' :
              declaration.status === 'submitted' ? 'bg-blue-100' :
              declaration.status === 'testing' ? 'bg-yellow-100' :
              'bg-gray-100'
            }`}>
              {declaration.declarationType === 'pre_validated' ? (
                <Shield className={`w-5 h-5 ${
                  declaration.status === 'accepted' ? 'text-green-600' :
                  declaration.status === 'rejected' ? 'text-red-600' :
                  declaration.status === 'submitted' ? 'text-blue-600' :
                  declaration.status === 'testing' ? 'text-yellow-600' :
                  'text-gray-600'
                }`} />
              ) : (
                <FileCheck className={`w-5 h-5 ${
                  declaration.status === 'accepted' ? 'text-green-600' :
                  declaration.status === 'rejected' ? 'text-red-600' :
                  declaration.status === 'submitted' ? 'text-blue-600' :
                  declaration.status === 'testing' ? 'text-yellow-600' :
                  'text-gray-600'
                }`} />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 line-clamp-1">
                {declaration.name}
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

        {/* RPAS Info */}
        <div className="flex items-center gap-2 mb-4 text-sm">
          <Plane className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700 font-medium">
            {declaration.rpasDetails?.manufacturer} {declaration.rpasDetails?.model}
          </span>
          <span className="text-gray-400">|</span>
          <span className="text-gray-500">{categoryInfo.label}</span>
          {keCategory && (
            <>
              <span className="text-gray-400">|</span>
              <span className={`${
                declaration.rpasDetails?.kineticEnergyCategory === 'high' ||
                declaration.rpasDetails?.kineticEnergyCategory === 'very_high'
                  ? 'text-orange-600'
                  : 'text-gray-500'
              }`}>
                {keCategory.label}
              </span>
            </>
          )}
        </div>

        {/* Client Badge */}
        {declaration.clientName && (
          <div className="mb-4">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
              Client: {declaration.clientName}
            </span>
          </div>
        )}

        {/* Standards Tags */}
        {declaration.applicableStandards?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {declaration.applicableStandards.slice(0, 4).map(std => (
              <span
                key={std}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700"
              >
                {std}
              </span>
            ))}
            {declaration.applicableStandards.length > 4 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                +{declaration.applicableStandards.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-3 gap-3 mb-4 py-3 border-t border-b border-gray-100">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {stats.requirements?.completed || 0}/{stats.requirements?.applicable || 0}
              </p>
              <p className="text-xs text-gray-500">Requirements</p>
            </div>
            <div className="text-center border-x border-gray-100">
              <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                <TestTube className="w-3.5 h-3.5" />
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {stats.testing?.completedSessions || 0}
              </p>
              <p className="text-xs text-gray-500">Tests Done</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {stats.evidence?.total || 0}
              </p>
              <p className="text-xs text-gray-500">Evidence</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
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
            {declaration.createdAt && (
              <div className="flex items-center gap-1.5 text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>
                  {declaration.createdAt instanceof Date
                    ? declaration.createdAt.toLocaleDateString()
                    : new Date(declaration.createdAt).toLocaleDateString()
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
 * Compact version for list views
 */
export function DeclarationCardCompact({ declaration, onClick }) {
  const navigate = useNavigate()
  const statusInfo = DECLARATION_STATUSES[declaration.status] || DECLARATION_STATUSES.draft

  const handleClick = () => {
    if (onClick) {
      onClick(declaration)
    } else {
      navigate(`/safety-declarations/${declaration.id}`)
    }
  }

  return (
    <div
      onClick={handleClick}
      className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <FileCheck className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h4 className="font-medium text-gray-900">{declaration.name}</h4>
          <p className="text-sm text-gray-500">
            {declaration.rpasDetails?.manufacturer} {declaration.rpasDetails?.model}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  )
}
