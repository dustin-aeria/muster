/**
 * WorkflowTemplates Page
 * Create and manage workflow templates with step builder
 *
 * @version 1.0.0
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  GitBranch,
  Plus,
  Edit2,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  Archive,
  Play,
  ChevronDown,
  ChevronUp,
  GripVertical,
  AlertCircle,
  Settings,
  ArrowRight,
  Users,
  Clock,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useOrganization } from '../hooks/useOrganization'
import {
  getWorkflowTemplates,
  createWorkflowTemplate,
  updateWorkflowTemplate,
  deleteWorkflowTemplate,
  archiveWorkflowTemplate,
  activateWorkflowTemplate,
} from '../lib/firestoreWorkflows'
import {
  WORKFLOW_TEMPLATE_STATUS,
  WORKFLOW_TRIGGER_TYPES,
  WORKFLOW_ACTIONS,
  WORKFLOW_ASSIGNEE_ROLES,
} from '../lib/database-phase4'
import LoadingSpinner from '../components/LoadingSpinner'

// Template card component
function TemplateCard({ template, onEdit, onDelete, onActivate, onArchive, onDuplicate }) {
  const [expanded, setExpanded] = useState(false)
  const statusConfig = WORKFLOW_TEMPLATE_STATUS[template.status] || WORKFLOW_TEMPLATE_STATUS.draft

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{template.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{template.description || 'No description'}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
              <span className="text-xs text-gray-500">
                {template.steps?.length || 0} steps
              </span>
              <span className="text-xs text-gray-500">
                {WORKFLOW_TRIGGER_TYPES[template.triggerType]?.label || 'Manual'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onEdit(template)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDuplicate(template)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Copy className="w-4 h-4" />
          </button>
          {template.status === 'draft' && (
            <button
              onClick={() => onActivate(template)}
              className="p-2 text-green-500 hover:text-green-600 hover:bg-green-50 rounded-lg"
            >
              <Play className="w-4 h-4" />
            </button>
          )}
          {template.status === 'active' && (
            <button
              onClick={() => onArchive(template)}
              className="p-2 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
            >
              <Archive className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(template)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded content - Steps visualization */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Workflow Steps</h4>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {template.steps?.sort((a, b) => a.order - b.order).map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`px-4 py-2 rounded-lg border ${
                  step.final ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="text-sm font-medium text-gray-900">{step.name}</div>
                  {step.assigneeRole && (
                    <div className="text-xs text-gray-500 mt-1">
                      {WORKFLOW_ASSIGNEE_ROLES[step.assigneeRole]?.label}
                    </div>
                  )}
                  {step.actions?.length > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      {step.actions.map(action => (
                        <span
                          key={action}
                          className={`px-1.5 py-0.5 text-xs rounded ${WORKFLOW_ACTIONS[action]?.color || 'bg-gray-200'} text-white`}
                        >
                          {action}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {index < template.steps.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-gray-400 mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Step editor component
function StepEditor({ step, index, onUpdate, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-1 pt-2">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <GripVertical className="w-4 h-4 text-gray-300" />
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              {index + 1}
            </span>
            <input
              type="text"
              value={step.name}
              onChange={(e) => onUpdate({ ...step, name: e.target.value })}
              placeholder="Step name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Assignee</label>
              <select
                value={step.assigneeRole || ''}
                onChange={(e) => onUpdate({ ...step, assigneeRole: e.target.value || null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">No assignment</option>
                {Object.entries(WORKFLOW_ASSIGNEE_ROLES).map(([key, value]) => (
                  <option key={key} value={key}>{value.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Due Days</label>
              <input
                type="number"
                value={step.dueDays || ''}
                onChange={(e) => onUpdate({ ...step, dueDays: e.target.value ? parseInt(e.target.value) : null })}
                placeholder="Days"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Available Actions</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(WORKFLOW_ACTIONS).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    const actions = step.actions || []
                    const newActions = actions.includes(key)
                      ? actions.filter(a => a !== key)
                      : [...actions, key]
                    onUpdate({ ...step, actions: newActions })
                  }}
                  className={`px-3 py-1 text-xs rounded-lg border ${
                    step.actions?.includes(key)
                      ? `${config.color} text-white border-transparent`
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={step.final || false}
                onChange={(e) => onUpdate({ ...step, final: e.target.checked })}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              Final step
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={step.requireComment || false}
                onChange={(e) => onUpdate({ ...step, requireComment: e.target.checked })}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              Require comment
            </label>
          </div>
        </div>

        <button
          onClick={onDelete}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Template editor modal
function TemplateEditorModal({ template, onSave, onClose }) {
  const [name, setName] = useState(template?.name || '')
  const [description, setDescription] = useState(template?.description || '')
  const [triggerType, setTriggerType] = useState(template?.triggerType || 'manual')
  const [steps, setSteps] = useState(template?.steps || [
    { id: 'step_1', name: 'Submit', order: 1, actions: [], final: false },
    { id: 'step_2', name: 'Review', order: 2, actions: ['approve', 'reject'], assigneeRole: 'manager', final: false },
    { id: 'step_3', name: 'Complete', order: 3, actions: [], final: true },
  ])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleAddStep = () => {
    const newStep = {
      id: `step_${Date.now()}`,
      name: `Step ${steps.length + 1}`,
      order: steps.length + 1,
      actions: [],
      final: false,
    }
    setSteps([...steps, newStep])
  }

  const handleUpdateStep = (index, updatedStep) => {
    const newSteps = [...steps]
    newSteps[index] = updatedStep
    setSteps(newSteps)
  }

  const handleDeleteStep = (index) => {
    if (steps.length <= 2) {
      setError('Workflow must have at least 2 steps')
      return
    }
    const newSteps = steps.filter((_, i) => i !== index)
    // Reorder
    newSteps.forEach((s, i) => s.order = i + 1)
    setSteps(newSteps)
  }

  const handleMoveStep = (index, direction) => {
    const newSteps = [...steps]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= newSteps.length) return

    // Swap
    [newSteps[index], newSteps[swapIndex]] = [newSteps[swapIndex], newSteps[index]]
    // Reorder
    newSteps.forEach((s, i) => s.order = i + 1)
    setSteps(newSteps)
  }

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    if (steps.length < 2) {
      setError('Workflow must have at least 2 steps')
      return
    }

    setSaving(true)
    setError(null)

    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        triggerType,
        steps,
      })
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {template ? 'Edit Workflow Template' : 'Create Workflow Template'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Basic info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Form Approval Workflow"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe when this workflow should be used..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Type</label>
              <select
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {Object.entries(WORKFLOW_TRIGGER_TYPES).map(([key, value]) => (
                  <option key={key} value={key}>{value.label} - {value.description}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Steps */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Workflow Steps</h3>
              <button
                type="button"
                onClick={handleAddStep}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg"
              >
                <Plus className="w-4 h-4" />
                Add Step
              </button>
            </div>

            <div className="space-y-3">
              {steps.map((step, index) => (
                <StepEditor
                  key={step.id}
                  step={step}
                  index={index}
                  onUpdate={(updated) => handleUpdateStep(index, updated)}
                  onDelete={() => handleDeleteStep(index)}
                  onMoveUp={() => handleMoveStep(index, 'up')}
                  onMoveDown={() => handleMoveStep(index, 'down')}
                  isFirst={index === 0}
                  isLast={index === steps.length - 1}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : template ? 'Save Changes' : 'Create Template'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function WorkflowTemplates() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { organization } = useOrganization()

  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [showEditor, setShowEditor] = useState(false)

  // Load templates
  useEffect(() => {
    async function loadTemplates() {
      if (!organization?.id) return

      setLoading(true)
      setError(null)

      try {
        const data = await getWorkflowTemplates(organization.id)
        setTemplates(data)
      } catch (err) {
        console.error('Error loading templates:', err)
        setError(err.message || 'Failed to load templates')
      } finally {
        setLoading(false)
      }
    }

    loadTemplates()
  }, [organization?.id])

  const handleCreate = () => {
    setEditingTemplate(null)
    setShowEditor(true)
  }

  const handleEdit = (template) => {
    setEditingTemplate(template)
    setShowEditor(true)
  }

  const handleSave = async (data) => {
    if (editingTemplate) {
      await updateWorkflowTemplate(editingTemplate.id, data)
      setTemplates(templates.map(t =>
        t.id === editingTemplate.id ? { ...t, ...data, updatedAt: new Date() } : t
      ))
    } else {
      const newTemplate = await createWorkflowTemplate({
        ...data,
        organizationId: organization.id,
        createdBy: user.uid,
        status: 'draft',
      })
      setTemplates([newTemplate, ...templates])
    }
  }

  const handleDelete = async (template) => {
    if (!window.confirm(`Are you sure you want to delete "${template.name}"?`)) return

    try {
      await deleteWorkflowTemplate(template.id)
      setTemplates(templates.filter(t => t.id !== template.id))
    } catch (err) {
      alert('Failed to delete template: ' + err.message)
    }
  }

  const handleActivate = async (template) => {
    try {
      await activateWorkflowTemplate(template.id)
      setTemplates(templates.map(t =>
        t.id === template.id ? { ...t, status: 'active' } : t
      ))
    } catch (err) {
      alert('Failed to activate template: ' + err.message)
    }
  }

  const handleArchive = async (template) => {
    try {
      await archiveWorkflowTemplate(template.id)
      setTemplates(templates.map(t =>
        t.id === template.id ? { ...t, status: 'archived' } : t
      ))
    } catch (err) {
      alert('Failed to archive template: ' + err.message)
    }
  }

  const handleDuplicate = async (template) => {
    const newTemplate = await createWorkflowTemplate({
      name: `${template.name} (Copy)`,
      description: template.description,
      steps: template.steps,
      triggerType: template.triggerType,
      triggerFormTypes: template.triggerFormTypes,
      organizationId: organization.id,
      createdBy: user.uid,
      status: 'draft',
    })
    setTemplates([newTemplate, ...templates])
  }

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading workflow templates..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflow Templates</h1>
          <p className="text-gray-600 mt-1">Create and manage reusable workflow templates</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" />
          Create Template
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Templates list */}
      {templates.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <GitBranch className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No workflow templates yet</h3>
          <p className="text-gray-500 mb-6">
            Create your first workflow template to automate form approvals and task assignments
          </p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="w-4 h-4" />
            Create Template
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onActivate={handleActivate}
              onArchive={handleArchive}
              onDuplicate={handleDuplicate}
            />
          ))}
        </div>
      )}

      {/* Editor modal */}
      {showEditor && (
        <TemplateEditorModal
          template={editingTemplate}
          onSave={handleSave}
          onClose={() => setShowEditor(false)}
        />
      )}
    </div>
  )
}
