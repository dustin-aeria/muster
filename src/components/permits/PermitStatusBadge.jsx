/**
 * PermitStatusBadge.jsx
 * Status indicator badge for permits
 *
 * @location src/components/permits/PermitStatusBadge.jsx
 */

import PropTypes from 'prop-types'
import { CheckCircle, AlertTriangle, XCircle, Pause } from 'lucide-react'
import { PERMIT_STATUS } from '../../lib/firestorePermits'

const STATUS_ICONS = {
  active: CheckCircle,
  expiring_soon: AlertTriangle,
  expired: XCircle,
  suspended: Pause
}

export default function PermitStatusBadge({ status, size = 'md', showLabel = true }) {
  const statusConfig = PERMIT_STATUS[status] || PERMIT_STATUS.active
  const Icon = STATUS_ICONS[status] || CheckCircle

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${statusConfig.bgClass} ${sizeClasses[size]}`}>
      <Icon className={iconSizes[size]} />
      {showLabel && <span>{statusConfig.label}</span>}
    </span>
  )
}

PermitStatusBadge.propTypes = {
  status: PropTypes.oneOf(['active', 'expiring_soon', 'expired', 'suspended']).isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  showLabel: PropTypes.bool
}
