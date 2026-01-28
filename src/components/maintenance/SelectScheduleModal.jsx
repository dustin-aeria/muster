/**
 * SelectScheduleModal.jsx
 * Modal for selecting which maintenance schedule to log
 *
 * Shows available schedules for an item and their current status.
 * If schedule has a linked form, user will be directed to form filler.
 * If no form, user gets the legacy manual entry modal.
 *
 * @location src/components/maintenance/SelectScheduleModal.jsx
 */

import { useState, useEffect } from 'react'
import {
  X,
  Loader2,
  FileText,
  Calendar,
  Clock,
  Wrench,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  ChevronRight
} from 'lucide-react'
import { getMaintenanceScheduleById } from '../../lib/firestoreMaintenance'

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

function formatRemaining(scheduleStatus, scheduleType) {
  if (!scheduleStatus) return null

  const remaining = scheduleStatus.remaining
  if (remaining === undefined || remaining === null) return null

  const type = scheduleType || 'days'

  if (remaining === 0) {
    return `Due today`
  } else if (remaining < 0) {
    return `${Math.abs(remaining)} ${type} overdue`
  } else {
    return `${remaining} ${type} remaining`
  }
}

export default function SelectScheduleModal({
  isOpen,
  onClose,
  item,
  onSelectSchedule,
  onSelectAdHoc
}) {
  const [loading, setLoading] = useState(true)
  const [schedules, setSchedules] = useState([])
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const [selectingAdHoc, setSelectingAdHoc] = useState(false)

  useEffect(() => {
    async function loadSchedules() {
      if (!item?.maintenanceScheduleIds?.length) {
        setSchedules([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const schedulePromises = item.maintenanceScheduleIds.map(id =>
          getMaintenanceScheduleById(id).catch(() => null)
        )
        const loadedSchedules = await Promise.all(schedulePromises)
        setSchedules(loadedSchedules.filter(Boolean))
      } catch (err) {
        console.error('Failed to load schedules:', err)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      loadSchedules()
      setSelectedSchedule(null)
      setSelectingAdHoc(false)
    }
  }, [isOpen, item])

  const handleContinue = () => {
    if (selectingAdHoc) {
      onSelectAdHoc()
    } else if (selectedSchedule) {
      onSelectSchedule(selectedSchedule)
    }
  }

  if (!isOpen) return null

  const itemName = item?.name || item?.nickname || 'Item'
  const maintenanceStatus = item?.maintenanceStatus || {}

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Log Maintenance
            </h2>
            <p className="text-sm text-gray-500">{itemName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-aeria-navy" />
              <span className="ml-2 text-gray-500">Loading schedules...</span>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Select the maintenance being performed:
              </p>

              {/* Schedule Options */}
              {schedules.map(schedule => {
                const status = maintenanceStatus[schedule.id] || {}
                const statusKey = status.status || 'ok'
                const config = statusConfig[statusKey] || statusConfig.ok
                const StatusIcon = config.icon
                const remaining = formatRemaining(status, schedule.intervalType)
                const isSelected = selectedSchedule?.id === schedule.id && !selectingAdHoc

                return (
                  <button
                    key={schedule.id}
                    onClick={() => {
                      setSelectedSchedule(schedule)
                      setSelectingAdHoc(false)
                    }}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-aeria-navy bg-aeria-navy/5'
                        : `${config.bg} hover:border-gray-300`
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-aeria-navy bg-aeria-navy' : 'border-gray-300'
                          }`}>
                            {isSelected && (
                              <span className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </span>
                          <span className="font-medium text-gray-900">{schedule.name}</span>
                        </div>

                        <div className="ml-6 mt-2 space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            Every {schedule.intervalValue} {schedule.intervalType}
                            {schedule.requiresForm && (
                              <>
                                <span className="mx-1">•</span>
                                <FileText className="w-4 h-4 text-purple-500" />
                                <span className="text-purple-600">Requires form</span>
                              </>
                            )}
                          </div>

                          {remaining && (
                            <div className={`flex items-center gap-2 text-sm ${config.text}`}>
                              <StatusIcon className="w-4 h-4" />
                              {remaining}
                            </div>
                          )}
                        </div>
                      </div>

                      <ChevronRight className={`w-5 h-5 ${isSelected ? 'text-aeria-navy' : 'text-gray-400'}`} />
                    </div>
                  </button>
                )
              })}

              {/* Ad-hoc / Unscheduled Option */}
              <button
                onClick={() => {
                  setSelectingAdHoc(true)
                  setSelectedSchedule(null)
                }}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selectingAdHoc
                    ? 'border-aeria-navy bg-aeria-navy/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectingAdHoc ? 'border-aeria-navy bg-aeria-navy' : 'border-gray-300'
                      }`}>
                        {selectingAdHoc && (
                          <span className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </span>
                      <span className="font-medium text-gray-900">Ad-hoc / Unscheduled Maintenance</span>
                    </div>

                    <div className="ml-6 mt-2">
                      <p className="text-sm text-gray-500">
                        Log repair, damage, inspection, or other unscheduled service
                      </p>
                    </div>
                  </div>

                  <ChevronRight className={`w-5 h-5 ${selectingAdHoc ? 'text-aeria-navy' : 'text-gray-400'}`} />
                </div>
              </button>

              {schedules.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <Wrench className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No maintenance schedules applied to this item.</p>
                  <p className="text-sm">Use ad-hoc maintenance to log service.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            disabled={!selectedSchedule && !selectingAdHoc}
            className="flex items-center gap-2 px-4 py-2 bg-aeria-navy text-white rounded-lg hover:bg-aeria-navy/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
