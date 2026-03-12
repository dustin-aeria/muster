/**
 * WorkflowTasks Page
 * Task inbox showing user's assigned workflow tasks with quick actions
 *
 * @version 1.0.0
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckSquare,
  GitBranch,
  Clock,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  MessageSquare,
  AlertCircle,
  ChevronRight,
  Filter,
  RefreshCw,
  FileText,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useOrganization } from '../hooks/useOrganization'
import {
  getMyWorkflowTasks,
  getPendingWorkflowTasks,
  advanceWorkflow,
  getWorkflowInstance,
  getWorkflowTemplate,
} from '../lib/firestoreWorkflows'
import { WORKFLOW_ACTIONS, WORKFLOW_INSTANCE_STATUS } from '../lib/database-phase4'
import LoadingSpinner from '../components/LoadingSpinner'
import WorkflowProgress from '../components/WorkflowProgress'

// Task card component
function TaskCard({ task, currentStep, onAction, onViewDetails }) {
  const [comment, setComment] = useState('')
  const [showCommentBox, setShowCommentBox] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date()

  const handleAction = async (action) => {
    if (currentStep?.requireComment && !comment.trim()) {
      setShowCommentBox(true)
      return
    }

    setActionLoading(action)
    try {
      await onAction(task.id, action, comment.trim() || null)
      setComment('')
      setShowCommentBox(false)
    } catch (error) {
      alert('Action failed: ' + error.message)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className={`bg-white rounded-xl border ${isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200'} p-4`}>
      <div className="flex items-start justify-between gap-4">
        {/* Task info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <GitBranch className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-purple-600 font-medium">
              {task.templateName}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 truncate">
            {task.entityTitle || 'Untitled'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Step: <span className="font-medium">{task.currentStepName}</span>
          </p>

          {/* Meta info */}
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            {task.dueDate && (
              <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                <Calendar className="w-4 h-4" />
                {isOverdue ? 'Overdue: ' : 'Due: '}
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              Started by {task.startedByName}
            </span>
          </div>

          {/* Comment input */}
          {showCommentBox && (
            <div className="mt-4">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={currentStep?.requireComment ? 'Comment required...' : 'Add a comment (optional)...'}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={() => onViewDetails(task)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            View Details
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mt-2">
            {!showCommentBox && (
              <button
                onClick={() => setShowCommentBox(true)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                title="Add comment"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            )}

            {currentStep?.actions?.map((action) => {
              const config = WORKFLOW_ACTIONS[action]
              if (!config) return null

              return (
                <button
                  key={action}
                  onClick={() => handleAction(action)}
                  disabled={actionLoading !== null}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${config.color} disabled:opacity-50`}
                >
                  {actionLoading === action ? 'Processing...' : config.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// Task detail modal
function TaskDetailModal({ task, template, onClose, onAction }) {
  const [comment, setComment] = useState('')
  const [actionLoading, setActionLoading] = useState(null)

  const currentStep = template?.steps?.find(s => s.id === task.currentStepId)

  const handleAction = async (action) => {
    if (currentStep?.requireComment && !comment.trim()) {
      alert('A comment is required for this action')
      return
    }

    setActionLoading(action)
    try {
      await onAction(task.id, action, comment.trim() || null)
      setComment('')
      onClose()
    } catch (error) {
      alert('Action failed: ' + error.message)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-purple-600 font-medium">{task.templateName}</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mt-1">
              {task.entityTitle || 'Workflow Task'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Progress */}
          {template && (
            <WorkflowProgress
              instance={task}
              template={template}
              compact
            />
          )}

          {/* Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Current Step</span>
              <span className="font-medium text-gray-900">{task.currentStepName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Started By</span>
              <span className="font-medium text-gray-900">{task.startedByName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Started</span>
              <span className="font-medium text-gray-900">
                {task.startedAt?.toLocaleDateString()} {task.startedAt?.toLocaleTimeString()}
              </span>
            </div>
            {task.dueDate && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Due Date</span>
                <span className={`font-medium ${
                  new Date(task.dueDate) < new Date() ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* History */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">History</h3>
            <div className="space-y-3">
              {task.history?.slice().reverse().map((entry, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {entry.action === 'started' && <GitBranch className="w-4 h-4 text-purple-500" />}
                    {entry.action === 'approved' && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {entry.action === 'rejected' && <XCircle className="w-4 h-4 text-red-500" />}
                    {entry.action === 'assigned' && <User className="w-4 h-4 text-blue-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{entry.byName}</span>
                      {' '}
                      <span className="text-gray-600">
                        {entry.action === 'started' && 'started the workflow'}
                        {entry.action === 'approved' && 'approved'}
                        {entry.action === 'rejected' && 'rejected'}
                        {entry.action === 'assigned' && 'assigned'}
                        {entry.action === 'request_changes' && 'requested changes'}
                      </span>
                      {' '}
                      at {entry.stepName}
                    </p>
                    {entry.comment && (
                      <p className="text-sm text-gray-500 mt-1">"{entry.comment}"</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(entry.at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Comment {currentStep?.requireComment && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter your comments..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          {task.entityType === 'form_submission' && (
            <button
              onClick={() => window.open(`/forms/${task.entityId}`, '_blank')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <FileText className="w-4 h-4" />
              View Form
            </button>
          )}

          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Close
            </button>

            {currentStep?.actions?.map((action) => {
              const config = WORKFLOW_ACTIONS[action]
              if (!config) return null

              return (
                <button
                  key={action}
                  onClick={() => handleAction(action)}
                  disabled={actionLoading !== null}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${config.color} disabled:opacity-50`}
                >
                  {actionLoading === action ? 'Processing...' : config.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WorkflowTasks() {
  const navigate = useNavigate()
  const { user, userProfile } = useAuth()
  const { organization } = useOrganization()

  const [myTasks, setMyTasks] = useState([])
  const [pendingTasks, setPendingTasks] = useState([])
  const [templates, setTemplates] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('my')
  const [selectedTask, setSelectedTask] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  // Load tasks
  const loadTasks = async () => {
    if (!organization?.id || !user?.uid) return

    setError(null)

    try {
      const [myData, pendingData] = await Promise.all([
        getMyWorkflowTasks(organization.id, user.uid),
        getPendingWorkflowTasks(organization.id),
      ])

      setMyTasks(myData)
      setPendingTasks(pendingData)

      // Load templates for current steps
      const templateIds = new Set([
        ...myData.map(t => t.templateId),
        ...pendingData.map(t => t.templateId),
      ])

      const loadedTemplates = {}
      for (const id of templateIds) {
        if (!templates[id]) {
          const template = await getWorkflowTemplate(id)
          if (template) {
            loadedTemplates[id] = template
          }
        }
      }
      setTemplates(prev => ({ ...prev, ...loadedTemplates }))
    } catch (err) {
      console.error('Error loading tasks:', err)
      setError(err.message || 'Failed to load tasks')
    }
  }

  useEffect(() => {
    async function init() {
      setLoading(true)
      await loadTasks()
      setLoading(false)
    }
    init()
  }, [organization?.id, user?.uid])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadTasks()
    setRefreshing(false)
  }

  const handleAction = async (instanceId, action, comment) => {
    const userName = userProfile?.firstName
      ? `${userProfile.firstName} ${userProfile.lastName}`
      : user.email

    await advanceWorkflow(instanceId, action, {
      userId: user.uid,
      userName,
      comment,
    })

    // Reload tasks
    await loadTasks()
  }

  const getTaskStep = (task) => {
    const template = templates[task.templateId]
    return template?.steps?.find(s => s.id === task.currentStepId)
  }

  const displayTasks = activeTab === 'my' ? myTasks : pendingTasks

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading workflow tasks..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflow Tasks</h1>
          <p className="text-gray-600 mt-1">Manage your assigned workflow tasks</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('my')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'my'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <User className="w-4 h-4" />
            My Tasks
            {myTasks.length > 0 && (
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                {myTasks.length}
              </span>
            )}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'pending'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            All Pending
            {pendingTasks.length > 0 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                {pendingTasks.length}
              </span>
            )}
          </span>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Tasks list */}
      {displayTasks.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <CheckSquare className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'my' ? 'No tasks assigned to you' : 'No pending tasks'}
          </h3>
          <p className="text-gray-500">
            {activeTab === 'my'
              ? 'Tasks will appear here when workflows are assigned to you'
              : 'All workflow tasks have been completed'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              currentStep={getTaskStep(task)}
              onAction={handleAction}
              onViewDetails={(t) => setSelectedTask(t)}
            />
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          template={templates[selectedTask.templateId]}
          onClose={() => setSelectedTask(null)}
          onAction={handleAction}
        />
      )}
    </div>
  )
}
