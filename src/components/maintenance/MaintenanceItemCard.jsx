/**
 * MaintenanceItemCard.jsx
 * Card component for displaying maintainable item in list
 *
 * @location src/components/maintenance/MaintenanceItemCard.jsx
 */

import { Link } from 'react-router-dom'
import {
  Plane,
  Package,
  Clock,
  AlertTriangle,
  CheckCircle,
  XOctagon,
  Calendar,
  ChevronRight,
  Gauge,
  Wrench
} from 'lucide-react'
import { calculateOverallMaintenanceStatus, getMostUrgentMaintenance } from '../../lib/firestoreMaintenance'

const statusConfig = {
  ok: {
    bg: 'bg-green-50 border-green-200',
    badge: 'bg-green-100 text-green-700',
    icon: CheckCircle,
    iconColor: 'text-green-500',
    label: 'Good Standing'
  },
  due_soon: {
    bg: 'bg-amber-50 border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    icon: Clock,
    iconColor: 'text-amber-500',
    label: 'Due Soon'
  },
  overdue: {
    bg: 'bg-red-50 border-red-200',
    badge: 'bg-red-100 text-red-700',
    icon: AlertTriangle,
    iconColor: 'text-red-500',
    label: 'Overdue'
  },
  grounded: {
    bg: 'bg-red-50 border-red-300',
    badge: 'bg-red-200 text-red-800',
    icon: XOctagon,
    iconColor: 'text-red-600',
    label: 'Grounded'
  },
  no_schedule: {
    bg: 'bg-gray-50 border-gray-200',
    badge: 'bg-gray-100 text-gray-600',
    icon: Calendar,
    iconColor: 'text-gray-400',
    label: 'No Schedule'
  }
}

function formatRemaining(urgentMaint) {
  if (!urgentMaint) return null

  const remaining = urgentMaint.remaining
  if (remaining === undefined || remaining === null) return null

  if (urgentMaint.nextDueDate) {
    if (remaining === 0) return 'Due today'
    if (remaining < 0) return `${Math.abs(remaining)} days overdue`
    return `${remaining} days remaining`
  }
  if (urgentMaint.nextDueHours !== undefined) {
    if (remaining <= 0) return `${Math.abs(remaining)} hrs overdue`
    return `${remaining} hrs remaining`
  }
  if (urgentMaint.nextDueCycles !== undefined) {
    if (remaining <= 0) return `${Math.abs(remaining)} cycles overdue`
    return `${remaining} cycles remaining`
  }

  return null
}

export default function MaintenanceItemCard({ item, compact = false, onLogService }) {
  const status = calculateOverallMaintenanceStatus(item)
  const config = statusConfig[status] || statusConfig.no_schedule
  const StatusIcon = config.icon
  const ItemIcon = item.itemType === 'aircraft' ? Plane : Package
  const urgentMaint = getMostUrgentMaintenance(item)
  const remainingText = formatRemaining(urgentMaint)

  // Get schedule count
  const scheduleCount = item.maintenanceScheduleIds?.length || 0

  // Build the link path
  const linkPath = item.itemType === 'aircraft'
    ? `/aircraft/${item.id}`
    : `/equipment/${item.id}`

  const handleLogService = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (onLogService) {
      onLogService(item)
    }
  }

  if (compact) {
    return (
      <Link
        to={linkPath}
        className={`block p-4 rounded-lg border ${config.bg} hover:shadow-md transition-all`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/60">
              <ItemIcon className={`w-5 h-5 ${config.iconColor}`} />
            </div>
            <div>
              <p className="font-medium text-gray-900">{item.name || item.nickname}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-xs px-2 py-0.5 rounded ${config.badge}`}>
                  {config.label}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onLogService && (
              <button
                onClick={handleLogService}
                className="p-1.5 text-gray-500 hover:text-aeria-navy hover:bg-white rounded"
                title="Log Service"
              >
                <Wrench className="w-4 h-4" />
              </button>
            )}
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={linkPath}
      className={`block p-5 rounded-xl border ${config.bg} hover:shadow-md transition-all`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-white/60">
            <ItemIcon className={`w-6 h-6 ${config.iconColor}`} />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-lg">
              {item.name || item.nickname}
            </p>
            <p className="text-sm text-gray-600 mt-0.5">
              {item.model && <span>{item.model}</span>}
              {item.model && item.serialNumber && <span className="mx-1.5">-</span>}
              {item.serialNumber && <span>S/N: {item.serialNumber}</span>}
            </p>

            {/* Status badges */}
            <div className="flex items-center gap-2 mt-3">
              <span className={`flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-full ${config.badge}`}>
                <StatusIcon className="w-4 h-4" />
                {config.label}
              </span>
              {scheduleCount > 0 && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {scheduleCount} schedule{scheduleCount !== 1 ? 's' : ''}
                </span>
              )}
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full capitalize">
                {item.itemType}
              </span>
            </div>

            {/* Urgent maintenance info */}
            {remainingText && (
              <div className="flex items-center gap-2 mt-3 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className={status === 'overdue' ? 'text-red-600 font-medium' : 'text-gray-600'}>
                  {remainingText}
                </span>
              </div>
            )}

            {/* Meter readings */}
            {(item.currentHours || item.totalFlightHours || item.currentCycles || item.totalCycles) && (
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                {(item.currentHours || item.totalFlightHours) && (
                  <span className="flex items-center gap-1">
                    <Gauge className="w-4 h-4" />
                    {item.currentHours || item.totalFlightHours} hrs
                  </span>
                )}
                {(item.currentCycles || item.totalCycles) && (
                  <span>
                    {item.currentCycles || item.totalCycles} cycles
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {onLogService && !item.isGrounded && (
            <button
              onClick={handleLogService}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-aeria-navy bg-white hover:bg-gray-50 rounded-lg border border-gray-200 shadow-sm"
            >
              <Wrench className="w-4 h-4" />
              Log Service
            </button>
          )}
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Grounded reason */}
      {item.isGrounded && item.groundedReason && (
        <div className="mt-4 p-3 bg-red-100/50 rounded-lg border border-red-200">
          <p className="text-sm text-red-700">
            <span className="font-medium">Grounded: </span>
            {item.groundedReason}
          </p>
        </div>
      )}
    </Link>
  )
}
