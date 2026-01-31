import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  Users,
  Bell,
  Send,
  History,
  Settings,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  UserPlus,
  Loader2,
  RefreshCw
} from 'lucide-react'
import DistributionListEditor from './DistributionListEditor'
import NotificationSettingsPanel from './NotificationSettingsPanel'
import SendNotificationModal from './SendNotificationModal'
import {
  getDistributionLists,
  createDistributionList,
  updateDistributionList,
  deleteDistributionList,
  createDefaultListsForProject,
  DEFAULT_LIST_TYPES
} from '../../lib/firestoreDistributionLists'
import {
  getAggregatedNotificationHistory,
  getDefaultNotificationSettings
} from '../../lib/teamNotificationService'

export default function ProjectTeam({ project, onUpdate }) {
  const [expandedSections, setExpandedSections] = useState({
    lists: true,
    settings: true,
    quickSend: false,
    history: false
  })

  // Data state
  const [distributionLists, setDistributionLists] = useState([])
  const [notificationHistory, setNotificationHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)

  // Modal state
  const [showListEditor, setShowListEditor] = useState(false)
  const [editingList, setEditingList] = useState(null)
  const [showSendModal, setShowSendModal] = useState(false)

  // Load distribution lists
  useEffect(() => {
    loadDistributionLists()
  }, [project.id])

  const loadDistributionLists = async () => {
    try {
      setLoading(true)
      const lists = await getDistributionLists(project.id)
      setDistributionLists(lists)
    } catch (error) {
      console.error('Failed to load distribution lists:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadNotificationHistory = async () => {
    try {
      setHistoryLoading(true)
      const history = await getAggregatedNotificationHistory(project.id, { limit: 20 })
      setNotificationHistory(history)
    } catch (error) {
      console.error('Failed to load notification history:', error)
    } finally {
      setHistoryLoading(false)
    }
  }

  // Initialize notification settings if not present
  useEffect(() => {
    if (!project.notificationSettings) {
      onUpdate({
        notificationSettings: getDefaultNotificationSettings()
      })
    }
  }, [project.notificationSettings])

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
    // Load history when expanding that section
    if (section === 'history' && !expandedSections.history && notificationHistory.length === 0) {
      loadNotificationHistory()
    }
  }

  // Distribution List Handlers
  const handleCreateList = () => {
    setEditingList(null)
    setShowListEditor(true)
  }

  const handleEditList = (list) => {
    setEditingList(list)
    setShowListEditor(true)
  }

  const handleSaveList = async (listData) => {
    try {
      if (editingList) {
        await updateDistributionList(editingList.id, listData)
      } else {
        await createDistributionList({
          ...listData,
          projectId: project.id
        })
      }
      await loadDistributionLists()
      setShowListEditor(false)
      setEditingList(null)
    } catch (error) {
      console.error('Failed to save distribution list:', error)
      alert('Failed to save distribution list. Please try again.')
    }
  }

  const handleDeleteList = async (listId) => {
    if (!confirm('Are you sure you want to delete this distribution list?')) {
      return
    }
    try {
      await deleteDistributionList(listId)
      await loadDistributionLists()
    } catch (error) {
      console.error('Failed to delete distribution list:', error)
      alert('Failed to delete distribution list. Please try again.')
    }
  }

  const handleCreateDefaultLists = async () => {
    try {
      setLoading(true)
      await createDefaultListsForProject(project.id, project.crew || [])
      await loadDistributionLists()
    } catch (error) {
      console.error('Failed to create default lists:', error)
      alert('Failed to create default lists. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Notification Settings Handler
  const handleUpdateSettings = (settings) => {
    onUpdate({
      notificationSettings: settings
    })
  }

  // Quick Send Handler
  const handleNotificationSent = () => {
    setShowSendModal(false)
    loadNotificationHistory()
  }

  const notificationSettings = project.notificationSettings || getDefaultNotificationSettings()
  const crew = project.crew || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-aeria-blue" />
            Team Notifications
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage distribution lists and notification settings for this project.
          </p>
        </div>
        <button
          onClick={() => setShowSendModal(true)}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          Send Notification
        </button>
      </div>

      {/* Distribution Lists Section */}
      <div className="card">
        <button
          onClick={() => toggleSection('lists')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-aeria-blue" />
            Distribution Lists
            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
              {distributionLists.length}
            </span>
          </h2>
          {expandedSections.lists ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSections.lists && (
          <div className="mt-4 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-aeria-blue" />
              </div>
            ) : distributionLists.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 mb-4">No distribution lists yet.</p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={handleCreateDefaultLists}
                    className="btn-secondary inline-flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Create Default Lists
                  </button>
                  <button
                    onClick={handleCreateList}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create List
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-3">
                  {distributionLists.map((list) => (
                    <DistributionListCard
                      key={list.id}
                      list={list}
                      onEdit={() => handleEditList(list)}
                      onDelete={() => handleDeleteList(list.id)}
                    />
                  ))}
                </div>
                <button
                  onClick={handleCreateList}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-aeria-blue hover:text-aeria-blue transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Distribution List
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Notification Settings Section */}
      <div className="card">
        <button
          onClick={() => toggleSection('settings')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-aeria-blue" />
            Notification Settings
          </h2>
          {expandedSections.settings ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSections.settings && (
          <div className="mt-4">
            <NotificationSettingsPanel
              settings={notificationSettings}
              distributionLists={distributionLists}
              onUpdate={handleUpdateSettings}
            />
          </div>
        )}
      </div>

      {/* Notification History Section */}
      <div className="card">
        <button
          onClick={() => toggleSection('history')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <History className="w-5 h-5 text-aeria-blue" />
            Notification History
          </h2>
          {expandedSections.history ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSections.history && (
          <div className="mt-4">
            {historyLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-aeria-blue" />
              </div>
            ) : notificationHistory.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">No notifications sent yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notificationHistory.map((item, index) => (
                  <NotificationHistoryItem key={index} item={item} />
                ))}
                <button
                  onClick={loadNotificationHistory}
                  className="w-full py-2 text-sm text-gray-500 hover:text-aeria-blue flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh History
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* List Editor Modal */}
      {showListEditor && (
        <DistributionListEditor
          list={editingList}
          projectCrew={crew}
          onSave={handleSaveList}
          onClose={() => {
            setShowListEditor(false)
            setEditingList(null)
          }}
        />
      )}

      {/* Send Notification Modal */}
      {showSendModal && (
        <SendNotificationModal
          project={project}
          distributionLists={distributionLists}
          onClose={() => setShowSendModal(false)}
          onSent={handleNotificationSent}
        />
      )}
    </div>
  )
}

// Distribution List Card Component
function DistributionListCard({ list, onEdit, onDelete }) {
  const listType = DEFAULT_LIST_TYPES[list.type] || DEFAULT_LIST_TYPES.custom
  const memberCount = list.members?.length || 0
  const operatorCount = list.members?.filter(m => m.type === 'operator').length || 0
  const externalCount = list.members?.filter(m => m.type === 'external').length || 0

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900">{list.name}</h3>
            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-600">
              {listType.label}
            </span>
          </div>
          {list.description && (
            <p className="text-sm text-gray-500 mt-1">{list.description}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {memberCount} member{memberCount !== 1 ? 's' : ''}
            </span>
            {operatorCount > 0 && (
              <span>{operatorCount} operator{operatorCount !== 1 ? 's' : ''}</span>
            )}
            {externalCount > 0 && (
              <span>{externalCount} external</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-aeria-blue rounded-lg hover:bg-white transition-colors"
            title="Edit list"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-white transition-colors"
            title="Delete list"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Member Preview */}
      {memberCount > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {list.members.slice(0, 5).map((member, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded text-xs text-gray-600 border border-gray-200"
            >
              {member.type === 'external' ? (
                <Mail className="w-3 h-3 text-gray-400" />
              ) : (
                <Users className="w-3 h-3 text-gray-400" />
              )}
              {member.name}
            </span>
          ))}
          {memberCount > 5 && (
            <span className="px-2 py-1 text-xs text-gray-400">
              +{memberCount - 5} more
            </span>
          )}
        </div>
      )}

      {/* Channel Icons */}
      {memberCount > 0 && (
        <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Bell className="w-3 h-3" />
            In-App
          </span>
          {list.members.some(m => m.email) && (
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              Email
            </span>
          )}
          {list.members.some(m => m.phone) && (
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              SMS
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// Notification History Item Component
function NotificationHistoryItem({ item }) {
  const formatDate = (date) => {
    if (!date) return 'Unknown'
    const d = date instanceof Date ? date : new Date(date)
    return d.toLocaleDateString('en-CA', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const eventLabels = {
    goNoGo: 'GO/NO GO Decision',
    planApproved: 'Plan Approved',
    dailyPlan: 'Daily Plan',
    null: 'Manual Notification'
  }

  const totalRecipients = item.recipients?.length || 0
  const stats = item.deliveryStats || {}

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900">{item.title}</h4>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {eventLabels[item.event] || 'Notification'}
          </p>
        </div>
        <span className="text-xs text-gray-400">
          {formatDate(item.timestamp)}
        </span>
      </div>

      {/* Delivery Stats */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
        <span className="flex items-center gap-1 text-gray-500">
          <Users className="w-3 h-3" />
          {totalRecipients} recipient{totalRecipients !== 1 ? 's' : ''}
        </span>

        {stats.inApp?.sent > 0 && (
          <span className="flex items-center gap-1 text-green-600">
            <CheckCircle2 className="w-3 h-3" />
            {stats.inApp.sent} in-app
          </span>
        )}

        {stats.email?.pending > 0 && (
          <span className="flex items-center gap-1 text-amber-600">
            <Clock className="w-3 h-3" />
            {stats.email.pending} email pending
          </span>
        )}

        {stats.email?.sent > 0 && (
          <span className="flex items-center gap-1 text-green-600">
            <Mail className="w-3 h-3" />
            {stats.email.sent} email sent
          </span>
        )}

        {stats.sms?.pending > 0 && (
          <span className="flex items-center gap-1 text-amber-600">
            <Clock className="w-3 h-3" />
            {stats.sms.pending} SMS pending
          </span>
        )}

        {(stats.inApp?.failed > 0 || stats.email?.failed > 0 || stats.sms?.failed > 0) && (
          <span className="flex items-center gap-1 text-red-600">
            <AlertCircle className="w-3 h-3" />
            {(stats.inApp?.failed || 0) + (stats.email?.failed || 0) + (stats.sms?.failed || 0)} failed
          </span>
        )}
      </div>
    </div>
  )
}

DistributionListCard.propTypes = {
  list: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string,
    description: PropTypes.string,
    members: PropTypes.array
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
}

NotificationHistoryItem.propTypes = {
  item: PropTypes.shape({
    title: PropTypes.string,
    event: PropTypes.string,
    timestamp: PropTypes.any,
    recipients: PropTypes.array,
    deliveryStats: PropTypes.object
  }).isRequired
}

ProjectTeam.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    notificationSettings: PropTypes.object,
    crew: PropTypes.array
  }).isRequired,
  onUpdate: PropTypes.func.isRequired
}
