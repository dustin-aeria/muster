/**
 * AppliedSchedulesList.jsx
 * Display schedules applied to an item with status and actions
 *
 * @location src/components/maintenance/AppliedSchedulesList.jsx
 */

import { useState, useEffect } from 'react'
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Trash2,
  Plus,
  Loader2,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import {
  getMaintenanceScheduleById,
  getMaintenanceSchedules,
  applyScheduleToItem,
  removeScheduleFromItem
} from '../../lib/firestoreMaintenance'

const statusConfig = {
  ok: {
    bg: 'bg-green-50 border-green-200',
    text: 'text-green-700',
    icon: CheckCircle,
    label: 'Good'
  },
  due_soon: {
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-700',
    icon: AlertCircle,
    label: 'Due Soon'
  },
  overdue: {
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-700',
    icon: AlertTriangle,
    label: 'Overdue'
  }
}

function formatRemaining(scheduleStatus, intervalType) {
  if (!scheduleStatus) return null

  const remaining = scheduleStatus.remaining
  if (remaining === undefined || remaining === null) return null

  const unit = intervalType || 'days'

  if (remaining === 0) {
    return `Due today`
  } else if (remaining < 0) {
    return `${Math.abs(remaining)} ${unit} overdue`
  } else {
    return `${remaining} ${unit} remaining`
  }
}

function formatLastService(scheduleStatus) {
  if (!scheduleStatus?.lastServiceDate) return 'Never serviced'

  const date = new Date(scheduleStatus.lastServiceDate)
  return date.toLocaleDateString()
}

function formatNextDue(scheduleStatus, intervalType) {
  if (intervalType === 'days' && scheduleStatus?.nextDueDate) {
    return new Date(scheduleStatus.nextDueDate).toLocaleDateString()
  }
  if (intervalType === 'hours' && scheduleStatus?.nextDueHours !== null) {
    return `${scheduleStatus.nextDueHours} hrs`
  }
  if (intervalType === 'cycles' && scheduleStatus?.nextDueCycles !== null) {
    return `${scheduleStatus.nextDueCycles} cycles`
  }
  return 'Not set'
}

export default function AppliedSchedulesList({ item, onUpdate }) {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [availableSchedules, setAvailableSchedules] = useState([])
  const [showAddDropdown, setShowAddDropdown] = useState(false)
  const [adding, setAdding] = useState(false)
  const [removing, setRemoving] = useState(null)
  const [expanded, setExpanded] = useState({})

  useEffect(() => {
    loadSchedules()
  }, [item])

  const loadSchedules = async () => {
    if (!item?.maintenanceScheduleIds?.length) {
      setSchedules([])
      setLoading(false)
      loadAvailableSchedules()
      return
    }

    setLoading(true)
    try {
      const schedulePromises = item.maintenanceScheduleIds.map(id =>
        getMaintenanceScheduleById(id).catch(() => null)
      )
      const loadedSchedules = await Promise.all(schedulePromises)
      setSchedules(loadedSchedules.filter(Boolean))
      await loadAvailableSchedules()
    } catch (err) {
      console.error('Failed to load schedules:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableSchedules = async () => {
    try {
      const allSchedules = await getMaintenanceSchedules(item.organizationId, { itemType: item.itemType })
      const appliedIds = item?.maintenanceScheduleIds || []
      const available = allSchedules.filter(s => !appliedIds.includes(s.id))
      setAvailableSchedules(available)
    } catch (err) {
      console.error('Failed to load available schedules:', err)
    }
  }

  const handleAddSchedule = async (schedule) => {
    setAdding(true)
    try {
      await applyScheduleToItem(item.id, item.itemType, schedule.id)
      setShowAddDropdown(false)
      if (onUpdate) onUpdate()
    } catch (err) {
      console.error('Failed to add schedule:', err)
    } finally {
      setAdding(false)
    }
  }

  const handleRemoveSchedule = async (scheduleId) => {
    setRemoving(scheduleId)
    try {
      await removeScheduleFromItem(item.id, item.itemType, scheduleId)
      if (onUpdate) onUpdate()
    } catch (err) {
      console.error('Failed to remove schedule:', err)
    } finally {
      setRemoving(null)
    }
  }

  const toggleExpanded = (scheduleId) => {
    setExpanded(prev => ({ ...prev, [scheduleId]: !prev[scheduleId] }))
  }

  const maintenanceStatus = item?.maintenanceStatus || {}

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-aeria-navy" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Applied Schedules</h3>
        <div className="relative">
          <button
            onClick={() => setShowAddDropdown(!showAddDropdown)}
            disabled={availableSchedules.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-aeria-navy hover:bg-aeria-navy/5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Add Schedule
          </button>

          {showAddDropdown && availableSchedules.length > 0 && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowAddDropdown(false)}
              />
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[250px] max-h-[300px] overflow-y-auto">
                {availableSchedules.map(schedule => (
                  <button
                    key={schedule.id}
                    onClick={() => handleAddSchedule(schedule)}
                    disabled={adding}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <p className="font-medium text-gray-900">{schedule.name}</p>
                    <p className="text-xs text-gray-500">
                      Every {schedule.intervalValue} {schedule.intervalType}
                    </p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Schedule List */}
      {schedules.length === 0 ? (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
          <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No maintenance schedules applied</p>
          <p className="text-sm text-gray-400 mt-1">
            Add schedules to track maintenance intervals
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map(schedule => {
            const status = maintenanceStatus[schedule.id] || {}
            const statusKey = status.status || 'ok'
            const config = statusConfig[statusKey] || statusConfig.ok
            const StatusIcon = config.icon
            const isExpanded = expanded[schedule.id]

            return (
              <div
                key={schedule.id}
                className={`rounded-xl border ${config.bg} overflow-hidden`}
              >
                {/* Header */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => toggleExpanded(schedule.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{schedule.name}</h4>
                        <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${config.text} bg-white/50`}>
                          <StatusIcon className="w-3 h-3" />
                          {config.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Every {schedule.intervalValue} {schedule.intervalType}
                        </span>
                        {schedule.requiresForm && (
                          <span className="flex items-center gap-1 text-purple-600">
                            <FileText className="w-4 h-4" />
                            Form required
                          </span>
                        )}
                      </div>

                      {/* Status summary */}
                      <div className={`mt-2 text-sm ${config.text}`}>
                        {formatRemaining(status, schedule.intervalType)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveSchedule(schedule.id)
                        }}
                        disabled={removing === schedule.id}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded"
                        title="Remove schedule"
                      >
                        {removing === schedule.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-gray-200/50">
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Last Service</p>
                        <p className="font-medium text-gray-900">
                          {formatLastService(status)}
                        </p>
                        {status.lastServiceHours && (
                          <p className="text-xs text-gray-500">
                            at {status.lastServiceHours} hrs
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Next Due</p>
                        <p className="font-medium text-gray-900">
                          {formatNextDue(status, schedule.intervalType)}
                        </p>
                      </div>
                    </div>

                    {schedule.description && (
                      <p className="mt-3 text-sm text-gray-600">
                        {schedule.description}
                      </p>
                    )}

                    {schedule.tasks?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 uppercase mb-1">Tasks</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {schedule.tasks.slice(0, 3).map(task => (
                            <li key={task.id} className="flex items-center gap-1">
                              <span className="w-1 h-1 bg-gray-400 rounded-full" />
                              {task.name}
                            </li>
                          ))}
                          {schedule.tasks.length > 3 && (
                            <li className="text-gray-400">
                              +{schedule.tasks.length - 3} more
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
