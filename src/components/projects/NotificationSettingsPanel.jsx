import { useState } from 'react'
import PropTypes from 'prop-types'
import {
  CheckCircle2,
  FileCheck,
  Calendar,
  Bell,
  Users,
  ChevronDown,
  Check,
  Info,
  AlertTriangle,
  MapPin
} from 'lucide-react'
import { NOTIFICATION_EVENTS } from '../../lib/teamNotificationService'

const EVENT_CONFIG = {
  goNoGoDecision: {
    key: 'goNoGoDecision',
    event: 'goNoGo',
    label: 'GO/NO GO Decision',
    description: 'Send notification when GO/NO GO decision is made on the Tailgate page',
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  planApproved: {
    key: 'planApproved',
    event: 'planApproved',
    label: 'Plan Approved',
    description: 'Send notification when the operations plan is approved',
    icon: FileCheck,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  dailyPlan: {
    key: 'dailyPlan',
    event: 'dailyPlan',
    label: 'Daily Plan Distribution',
    description: 'Manual daily briefing distribution (triggered via Send Notification)',
    icon: Calendar,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  flightPlan: {
    key: 'flightPlan',
    event: 'flightPlan',
    label: 'Flight Plan',
    description: 'Send flight plan PDF to air operators, heli crews, etc.',
    icon: MapPin,
    color: 'text-sky-600',
    bgColor: 'bg-sky-50'
  }
}

export default function NotificationSettingsPanel({ settings, distributionLists, onUpdate }) {
  const [expandedEvent, setExpandedEvent] = useState(null)

  const handleToggleEnabled = (eventKey) => {
    onUpdate({
      ...settings,
      [eventKey]: {
        ...settings[eventKey],
        enabled: !settings[eventKey]?.enabled
      }
    })
  }

  const handleToggleList = (eventKey, listId) => {
    const currentLists = settings[eventKey]?.listIds || []
    const hasId = currentLists.includes(listId)

    onUpdate({
      ...settings,
      [eventKey]: {
        ...settings[eventKey],
        listIds: hasId
          ? currentLists.filter(id => id !== listId)
          : [...currentLists, listId]
      }
    })
  }

  const getSelectedListNames = (eventKey) => {
    const listIds = settings[eventKey]?.listIds || []
    return listIds
      .map(id => distributionLists.find(l => l.id === id)?.name)
      .filter(Boolean)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Configure which events trigger automatic notifications and which distribution lists receive them.
      </p>

      {distributionLists.length === 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-800 font-medium">No Distribution Lists</p>
            <p className="text-sm text-amber-700">
              Create distribution lists first to configure notification settings.
            </p>
          </div>
        </div>
      )}

      {Object.values(EVENT_CONFIG).map((eventConfig) => {
        const Icon = eventConfig.icon
        const eventSettings = settings[eventConfig.key] || { enabled: false, listIds: [] }
        const isExpanded = expandedEvent === eventConfig.key
        const selectedLists = getSelectedListNames(eventConfig.key)

        return (
          <div
            key={eventConfig.key}
            className={`border rounded-lg overflow-hidden ${
              eventSettings.enabled ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
            }`}
          >
            {/* Event Header */}
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${eventConfig.bgColor}`}>
                    <Icon className={`w-5 h-5 ${eventConfig.color}`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{eventConfig.label}</h4>
                    <p className="text-sm text-gray-500 mt-0.5">{eventConfig.description}</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={eventSettings.enabled}
                    onChange={() => handleToggleEnabled(eventConfig.key)}
                    disabled={distributionLists.length === 0}
                  />
                  <div className={`w-11 h-6 rounded-full peer peer-focus:ring-2 peer-focus:ring-aeria-blue/20 ${
                    eventSettings.enabled ? 'bg-aeria-blue' : 'bg-gray-300'
                  } peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                </label>
              </div>

              {/* Selected Lists Summary */}
              {eventSettings.enabled && (
                <div className="mt-3">
                  <button
                    onClick={() => setExpandedEvent(isExpanded ? null : eventConfig.key)}
                    className="w-full flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      {selectedLists.length === 0 ? (
                        <span className="text-sm text-amber-600">No lists selected</span>
                      ) : (
                        <span className="text-sm text-gray-600">
                          {selectedLists.length} list{selectedLists.length !== 1 ? 's' : ''}: {selectedLists.join(', ')}
                        </span>
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              )}
            </div>

            {/* List Selection */}
            {eventSettings.enabled && isExpanded && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <p className="text-sm text-gray-600 mb-3">
                  Select which distribution lists should receive this notification:
                </p>

                {distributionLists.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No distribution lists available.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {distributionLists.map((list) => {
                      const isSelected = eventSettings.listIds?.includes(list.id)
                      const memberCount = list.members?.length || 0

                      return (
                        <button
                          key={list.id}
                          onClick={() => handleToggleList(eventConfig.key, list.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                            isSelected
                              ? 'bg-aeria-blue/5 border-aeria-blue'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isSelected ? 'bg-aeria-blue text-white' : 'bg-gray-100 text-gray-400'
                            }`}>
                              {isSelected ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Users className="w-4 h-4" />
                              )}
                            </div>
                            <div className="text-left">
                              <p className={`font-medium ${isSelected ? 'text-aeria-blue' : 'text-gray-900'}`}>
                                {list.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {memberCount} member{memberCount !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>

                          {isSelected && (
                            <Check className="w-5 h-5 text-aeria-blue" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-800 font-medium">Phase 1: In-App Notifications Only</p>
          <p className="text-sm text-blue-700 mt-1">
            Currently, only in-app notifications are sent immediately. Email and SMS delivery
            will be available in Phase 2 when Cloud Functions are set up.
          </p>
        </div>
      </div>
    </div>
  )
}

NotificationSettingsPanel.propTypes = {
  settings: PropTypes.shape({
    goNoGoDecision: PropTypes.shape({
      enabled: PropTypes.bool,
      listIds: PropTypes.array
    }),
    planApproved: PropTypes.shape({
      enabled: PropTypes.bool,
      listIds: PropTypes.array
    }),
    dailyPlan: PropTypes.shape({
      enabled: PropTypes.bool,
      listIds: PropTypes.array
    }),
    flightPlan: PropTypes.shape({
      enabled: PropTypes.bool,
      listIds: PropTypes.array
    })
  }).isRequired,
  distributionLists: PropTypes.array.isRequired,
  onUpdate: PropTypes.func.isRequired
}
