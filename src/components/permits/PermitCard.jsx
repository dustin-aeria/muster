/**
 * PermitCard.jsx
 * Card component for displaying permit information
 *
 * Features:
 * - Grid and list view modes
 * - Status badge with expiry info
 * - Type-specific icons and colors
 * - Click to view details
 *
 * @location src/components/permits/PermitCard.jsx
 */

import PropTypes from 'prop-types'
import {
  FileCheck,
  Award,
  MapPin,
  Radio,
  UserCheck,
  FileText,
  Calendar,
  Building2,
  ChevronRight
} from 'lucide-react'
import { PERMIT_TYPES, getDaysUntilExpiry } from '../../lib/firestorePermits'
import PermitStatusBadge from './PermitStatusBadge'
import { Timestamp } from 'firebase/firestore'

const TYPE_ICONS = {
  sfoc: FileCheck,
  cor: Award,
  land_access: MapPin,
  airspace_auth: Radio,
  client_approval: UserCheck,
  other: FileText
}

const TYPE_COLORS = {
  sfoc: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' },
  cor: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600' },
  land_access: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600' },
  airspace_auth: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-600' },
  client_approval: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600' },
  other: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600' }
}

function formatDate(date) {
  if (!date) return 'No expiry'
  const d = date instanceof Timestamp ? date.toDate() : new Date(date)
  return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: '2-digit' })
}

function getExpiryText(permit) {
  const days = getDaysUntilExpiry(permit)
  if (days === null) return 'No expiry'
  if (days < 0) return `Expired ${Math.abs(days)} days ago`
  if (days === 0) return 'Expires today'
  if (days === 1) return 'Expires tomorrow'
  return `${days} days remaining`
}

export default function PermitCard({ permit, onClick, viewMode = 'grid' }) {
  const permitType = PERMIT_TYPES[permit.type] || PERMIT_TYPES.other
  const Icon = TYPE_ICONS[permit.type] || FileText
  const colors = TYPE_COLORS[permit.type] || TYPE_COLORS.other

  if (viewMode === 'list') {
    return (
      <button
        onClick={() => onClick?.(permit)}
        className={`w-full p-4 bg-white border ${colors.border} rounded-lg hover:shadow-md transition-all text-left flex items-center gap-4`}
      >
        <div className={`p-2 rounded-lg ${colors.bg}`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 truncate">{permit.name}</h3>
            <PermitStatusBadge status={permit.status} size="sm" />
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
            <span className="flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              {permit.issuingAuthority || permitType.authority}
            </span>
            {permit.permitNumber && (
              <span className="font-mono text-xs">{permit.permitNumber}</span>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(permit.expiryDate)}</span>
          </div>
          <p className={`text-xs mt-0.5 ${
            permit.status === 'expired' ? 'text-red-600' :
            permit.status === 'expiring_soon' ? 'text-amber-600' : 'text-gray-500'
          }`}>
            {getExpiryText(permit)}
          </p>
        </div>

        <ChevronRight className="w-5 h-5 text-gray-400" />
      </button>
    )
  }

  // Grid view (default)
  return (
    <button
      onClick={() => onClick?.(permit)}
      className={`w-full p-4 bg-white border ${colors.border} rounded-xl hover:shadow-md transition-all text-left`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${colors.bg}`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>
        <PermitStatusBadge status={permit.status} size="sm" />
      </div>

      <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{permit.name}</h3>

      <div className="space-y-1 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Building2 className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{permit.issuingAuthority || permitType.authority}</span>
        </div>
        {permit.permitNumber && (
          <p className="font-mono text-xs text-gray-400">{permit.permitNumber}</p>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(permit.expiryDate)}</span>
          </div>
        </div>
        <p className={`text-xs mt-1 ${
          permit.status === 'expired' ? 'text-red-600' :
          permit.status === 'expiring_soon' ? 'text-amber-600' : 'text-gray-500'
        }`}>
          {getExpiryText(permit)}
        </p>
      </div>
    </button>
  )
}

PermitCard.propTypes = {
  permit: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    permitNumber: PropTypes.string,
    issuingAuthority: PropTypes.string,
    expiryDate: PropTypes.oneOfType([PropTypes.object, PropTypes.string])
  }).isRequired,
  onClick: PropTypes.func,
  viewMode: PropTypes.oneOf(['grid', 'list'])
}
