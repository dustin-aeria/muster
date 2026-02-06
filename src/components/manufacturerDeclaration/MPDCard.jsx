/**
 * MPDCard.jsx
 * Card component for displaying Manufacturer Performance Declaration summaries
 *
 * @location src/components/manufacturerDeclaration/MPDCard.jsx
 */

import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileCheck,
  Cpu,
  Clock,
  CheckCircle2,
  ChevronRight,
  Calendar,
  Code,
  Zap,
  Shield,
  Link as LinkIcon
} from 'lucide-react'
import {
  MPD_STATUSES,
  MPD_RPAS_CATEGORIES,
  SOFTWARE_DAL_LEVELS,
  getKineticEnergyCategory
} from '../../lib/firestoreManufacturerDeclaration'

export default function MPDCard({ declaration, onClick }) {
  const navigate = useNavigate()

  const statusInfo = MPD_STATUSES[declaration.status] || MPD_STATUSES.draft
  const categoryInfo = MPD_RPAS_CATEGORIES[declaration.category] || MPD_RPAS_CATEGORIES.large
  const keCategory = getKineticEnergyCategory(declaration.rpasDetails?.kineticEnergy || 0)

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
      navigate(`/manufacturer-declarations/${declaration.id}`)
    }
  }

  // Determine card accent based on status/category
  const getAccentColor = () => {
    if (declaration.status === 'accepted') return 'border-green-500'
    if (declaration.status === 'rejected') return 'border-red-500'
    if (declaration.status === 'info_requested') return 'border-orange-400'
    if (keCategory.category === 'very_high') return 'border-red-400'
    if (keCategory.category === 'high') return 'border-orange-400'
    if (declaration.hasCustomSoftware) return 'border-purple-400'
    return 'border-gray-200'
  }

  return (
    <div
      onClick={handleClick}
      className={`bg-white rounded-lg border-2 hover:shadow-md transition-all cursor-pointer overflow-hidden ${getAccentColor()}`}
    >
      {/* High KE Warning Banner */}
      {(keCategory.category === 'high' || keCategory.category === 'very_high') && (
        <div className={`px-4 py-2 text-xs font-medium ${
          keCategory.category === 'very_high'
            ? 'bg-red-100 text-red-800'
            : 'bg-orange-100 text-orange-800'
        }`}>
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" />
            {keCategory.label} - {keCategory.requiresContact ? 'Contact TC directly' : 'Additional safety analysis required'}
          </span>
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-lg ${
              declaration.status === 'accepted' ? 'bg-green-100' :
              declaration.status === 'rejected' ? 'bg-red-100' :
              declaration.hasCustomSoftware ? 'bg-purple-100' :
              'bg-blue-100'
            }`}>
              {declaration.hasCustomSoftware ? (
                <Code className={`w-5 h-5 ${
                  declaration.status === 'accepted' ? 'text-green-600' :
                  declaration.status === 'rejected' ? 'text-red-600' :
                  'text-purple-600'
                }`} />
              ) : (
                <FileCheck className={`w-5 h-5 ${
                  declaration.status === 'accepted' ? 'text-green-600' :
                  declaration.status === 'rejected' ? 'text-red-600' :
                  'text-blue-600'
                }`} />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 line-clamp-1">
                {declaration.name}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {categoryInfo.label}
              </p>
            </div>
          </div>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>

        {/* RPAS Info */}
        <div className="flex items-center gap-2 mb-3 text-sm">
          <Cpu className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700 font-medium">
            {declaration.rpasDetails?.manufacturer} {declaration.rpasDetails?.model}
          </span>
          <span className="text-gray-400">|</span>
          <span className={`${
            declaration.rpasDetails?.operatingWeight > 150
              ? 'text-orange-600 font-medium'
              : 'text-gray-500'
          }`}>
            {declaration.rpasDetails?.operatingWeight} kg
          </span>
        </div>

        {/* Kinetic Energy */}
        <div className="mb-4 p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className={`w-4 h-4 ${
                keCategory.category === 'very_high' ? 'text-red-600' :
                keCategory.category === 'high' ? 'text-orange-600' :
                keCategory.category === 'medium' ? 'text-yellow-600' :
                'text-green-600'
              }`} />
              <span className="text-sm text-gray-600">Kinetic Energy</span>
            </div>
            <span className={`text-sm font-medium ${
              keCategory.category === 'very_high' ? 'text-red-700' :
              keCategory.category === 'high' ? 'text-orange-700' :
              'text-gray-700'
            }`}>
              {(declaration.rpasDetails?.kineticEnergy / 1000).toFixed(1)} kJ
            </span>
          </div>
        </div>

        {/* Custom Software Badge */}
        {declaration.hasCustomSoftware && declaration.softwareDetails && (
          <div className="mb-4">
            <div className="p-2 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-1">
                <Code className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">
                  {declaration.softwareDetails.name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-purple-600">
                <span>{declaration.softwareDetails.designStandard?.replace('_', ' ')}</span>
                {declaration.softwareDetails.dalLevel && (
                  <>
                    <span className="text-purple-400">|</span>
                    <span>DAL {declaration.softwareDetails.dalLevel}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SAIL Level (if linked) */}
        {declaration.sailLevel && (
          <div className="mb-4 flex items-center gap-2">
            <Shield className={`w-4 h-4 ${
              declaration.sailLevel >= 5 ? 'text-red-600' :
              declaration.sailLevel >= 3 ? 'text-orange-600' :
              'text-green-600'
            }`} />
            <span className={`text-sm font-medium ${
              declaration.sailLevel >= 5 ? 'text-red-700' :
              declaration.sailLevel >= 3 ? 'text-orange-700' :
              'text-green-700'
            }`}>
              SAIL Level {declaration.sailLevel}
            </span>
          </div>
        )}

        {/* Linked SFOC */}
        {declaration.sfocApplicationId && (
          <div className="mb-4">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-blue-50 text-blue-700">
              <LinkIcon className="w-3 h-3" />
              Linked to SFOC
            </span>
          </div>
        )}

        {/* TC Acceptance Info */}
        {declaration.status === 'accepted' && declaration.tcReferenceNumber && (
          <div className="mb-4 p-2 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-700">
              <span className="font-medium">TC Ref:</span> {declaration.tcReferenceNumber}
            </p>
            {declaration.validUntil && (
              <p className="text-xs text-green-600 mt-1">
                Valid until {declaration.validUntil.toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
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
 * Compact version for list views or selection dialogs
 */
export function MPDCardCompact({ declaration, onClick, selected = false }) {
  const navigate = useNavigate()
  const statusInfo = MPD_STATUSES[declaration.status] || MPD_STATUSES.draft
  const keCategory = getKineticEnergyCategory(declaration.rpasDetails?.kineticEnergy || 0)

  const handleClick = () => {
    if (onClick) {
      onClick(declaration)
    } else {
      navigate(`/manufacturer-declarations/${declaration.id}`)
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
          declaration.status === 'accepted' ? 'bg-green-50' :
          declaration.hasCustomSoftware ? 'bg-purple-50' :
          'bg-blue-50'
        }`}>
          {declaration.hasCustomSoftware ? (
            <Code className={`w-5 h-5 ${
              declaration.status === 'accepted' ? 'text-green-600' : 'text-purple-600'
            }`} />
          ) : (
            <FileCheck className={`w-5 h-5 ${
              declaration.status === 'accepted' ? 'text-green-600' : 'text-blue-600'
            }`} />
          )}
        </div>
        <div>
          <h4 className="font-medium text-gray-900">{declaration.name}</h4>
          <p className="text-sm text-gray-500">
            {declaration.rpasDetails?.manufacturer} {declaration.rpasDetails?.model} •
            {declaration.rpasDetails?.operatingWeight} kg •
            {(declaration.rpasDetails?.kineticEnergy / 1000).toFixed(1)} kJ
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {declaration.hasCustomSoftware && (
          <span className="px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-700">
            Custom SW
          </span>
        )}
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  )
}
