/**
 * Workflows Page
 * List all workflow instances with status and progress
 *
 * @version 1.0.0
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  GitBranch,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Play,
  AlertCircle,
  ChevronDown,
  Calendar,
  User,
  FileText,
  Plus,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useOrganization } from '../hooks/useOrganization'
import {
  getWorkflowInstances,
  getWorkflowCounts,
  getWorkflowInstance,
  getWorkflowTemplate,
  cancelWorkflow,
} from '../lib/firestoreWorkflows'
import { WORKFLOW_INSTANCE_STATUS } from '../lib/database-phase4'
import LoadingSpinner from '../components/LoadingSpinner'
import WorkflowProgress from '../components/WorkflowProgress'

// Status badge component
function StatusBadge({ status }) {
  const config = WORKFLOW_INSTANCE_STATUS[status] || WORKFLOW_INSTANCE_STATUS.active
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
      {config.label}
    </span>
  )
}

// Workflow detail modal
function WorkflowDetailModal({ instance, template, onClose, onCancel }) {
  const [cancelling, setCancelling] = useState(false)

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this workflow?')) return

    setCancelling(true)
    try {
      await onCancel(instance.id)
      onClose()
    } catch (error) {
      alert('Failed to cancel workflow: ' + error.message)
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-purple-600 font-medium">{instance.templateName}</span>
              <StatusBadge status={instance.status} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mt-1">
              {instance.entityTitle || 'Workflow Instance'}
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
          {/* Progress visualization */}
          {template && (
            <WorkflowProgress
              instance={instance}
              template={template}
            />
          )}

          {/* Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Entity Type</div>
              <div className="font-medium text-gray-900 capitalize">
                {instance.entityType?.replace('_', ' ')}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Current Step</div>
              <div className="font-medium text-gray-900">{instance.currentStepName}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Started By</div>
              <div className="font-medium text-gray-900">{instance.startedByName}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Started</div>
              <div className="font-medium text-gray-900">
                {instance.startedAt?.toLocaleDateString()} {instance.startedAt?.toLocaleTimeString()}
              </div>
            </div>
            {instance.assignedTo && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Assigned To</div>
                <div className="font-medium text-gray-900">{instance.assignedToName}</div>
              </div>
            )}
            {instance.dueDate && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Due Date</div>
                <div className={`font-medium ${
                  new Date(instance.dueDate) < new Date() && instance.status === 'active'
                    ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {new Date(instance.dueDate).toLocaleDateString()}
                </div>
              </div>
            )}
            {instance.completedAt && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Completed</div>
                <div className="font-medium text-green-600">
                  {instance.completedAt?.toLocaleDateString()} {instance.completedAt?.toLocaleTimeString()}
                </div>
              </div>
            )}
          </div>

          {/* History */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Activity History</h3>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200" />

              <div className="space-y-4">
                {instance.history?.slice().reverse().map((entry, index) => (
                  <div key={index} className="relative flex items-start gap-4 pl-10">
                    {/* Timeline dot */}
                    <div className={`absolute left-2 w-5 h-5 rounded-full flex items-center justify-center ${
                      entry.action === 'started' ? 'bg-purple-500' :
                      entry.action === 'approved' ? 'bg-green-500' :
                      entry.action === 'rejected' ? 'bg-red-500' :
                      entry.action === 'cancelled' ? 'bg-gray-500' :
                      'bg-blue-500'
                    }`}>
                      {entry.action === 'started' && <Play className="w-3 h-3 text-white" />}
                      {entry.action === 'approved' && <CheckCircle className="w-3 h-3 text-white" />}
                      {entry.action === 'rejected' && <XCircle className="w-3 h-3 text-white" />}
                      {entry.action === 'assigned' && <User className="w-3 h-3 text-white" />}
                      {entry.action === 'cancelled' && <XCircle className="w-3 h-3 text-white" />}
                    </div>

                    <div className="flex-1 bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-gray-900">{entry.byName}</span>
                          <span className="text-gray-600">
                            {' '}
                            {entry.action === 'started' && 'started the workflow'}
                            {entry.action === 'approved' && 'approved'}
                            {entry.action === 'rejected' && 'rejected'}
                            {entry.action === 'assigned' && 'assigned task'}
                            {entry.action === 'request_changes' && 'requested changes'}
                            {entry.action === 'cancelled' && 'cancelled workflow'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(entry.at).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Step: {entry.stepName}
                      </div>
                      {entry.comment && (
                        <div className="mt-2 text-sm text-gray-700 bg-gray-50 rounded p-2">
                          "{entry.comment}"
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          {instance.entityType === 'form_submission' && (
            <button
              onClick={() => window.open(`/form-submissions`, '_blank')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <FileText className="w-4 h-4" />
              View Form
            </button>
          )}

          <div className="flex items-center gap-3 ml-auto">
            {instance.status === 'active' && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Workflow'}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Workflows() {
  const navigate = useNavigate()
  const { user, userProfile } = useAuth()
  const { organization } = useOrganization()

  // State
  const [instances, setInstances] = useState([])
  const [counts, setCounts] = useState({})
  const [templates, setTemplates] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [filteredInstances, setFilteredInstances] = useState([])

  // Detail view
  const [selectedInstance, setSelectedInstance] = useState(null)

  // Load data
  useEffect(() => {
    async function loadData() {
      if (!organization?.id) return

      setLoading(true)
      setError(null)

      try {
        const [instancesData, countsData] = await Promise.all([
          getWorkflowInstances(organization.id),
          getWorkflowCounts(organization.id),
        ])

        setInstances(instancesData)
        setCounts(countsData)

        // Load templates
        const templateIds = new Set(instancesData.map(i => i.templateId))
        const loadedTemplates = {}
        for (const id of templateIds) {
          const template = await getWorkflowTemplate(id)
          if (template) {
            loadedTemplates[id] = template
          }
        }
        setTemplates(loadedTemplates)
      } catch (err) {
        console.error('Error loading workflows:', err)
        setError(err.message || 'Failed to load workflows')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [organization?.id])

  // Apply filters
  useEffect(() => {
    let filtered = [...instances]

    if (statusFilter !== 'all') {
      filtered = filtered.filter(i => i.status === statusFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(i =>
        i.templateName?.toLowerCase().includes(query) ||
        i.entityTitle?.toLowerCase().includes(query) ||
        i.startedByName?.toLowerCase().includes(query)
      )
    }

    setFilteredInstances(filtered)
  }, [instances, statusFilter, searchQuery])

  const handleCancel = async (instanceId, reason = '') => {
    const userName = userProfile?.firstName
      ? `${userProfile.firstName} ${userProfile.lastName}`
      : user.email

    await cancelWorkflow(instanceId, user.uid, userName, reason)

    // Update local state
    setInstances(instances.map(i =>
      i.id === instanceId ? { ...i, status: 'cancelled' } : i
    ))
  }

  const handleViewDetails = async (instance) => {
    // Load full instance data
    const fullInstance = await getWorkflowInstance(instance.id)
    setSelectedInstance(fullInstance)
  }

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading workflows..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflows</h1>
          <p className="text-gray-600 mt-1">Track and manage all workflow instances</p>
        </div>
        <button
          onClick={() => navigate('/workflow-templates')}
          className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Manage Templates
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{counts.total || 0}</div>
          <div className="text-sm text-gray-500">Total Workflows</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{counts.active || 0}</div>
          <div className="text-sm text-gray-500">Active</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{counts.completed || 0}</div>
          <div className="text-sm text-gray-500">Completed</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-gray-400">{counts.cancelled || 0}</div>
          <div className="text-sm text-gray-500">Cancelled</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workflows..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Workflows list */}
      {filteredInstances.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <GitBranch className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows found</h3>
          <p className="text-gray-500">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Workflows will appear here when forms are submitted through workflow templates'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Workflow
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Step
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Started By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInstances.map((instance) => (
                <tr
                  key={instance.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewDetails(instance)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <GitBranch className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {instance.entityTitle || 'Untitled'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {instance.templateName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={instance.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {instance.currentStepName}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {instance.startedByName || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {instance.startedAt?.toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {instance.startedAt?.toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewDetails(instance)
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail modal */}
      {selectedInstance && (
        <WorkflowDetailModal
          instance={selectedInstance}
          template={templates[selectedInstance.templateId]}
          onClose={() => setSelectedInstance(null)}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}
