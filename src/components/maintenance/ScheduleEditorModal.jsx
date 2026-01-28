/**
 * ScheduleEditorModal.jsx
 * Modal for creating and editing maintenance schedules with form linking
 *
 * @location src/components/maintenance/ScheduleEditorModal.jsx
 */

import { useState, useEffect } from 'react'
import {
  X,
  Save,
  Loader2,
  Wrench,
  Calendar,
  Clock,
  FileText,
  ExternalLink,
  Plus,
  Trash2,
  GripVertical
} from 'lucide-react'
import { FORM_TEMPLATES } from '../../lib/formDefinitions'
import { MAINTENANCE_FORM_TEMPLATES } from '../../lib/maintenanceFormTemplates'
import { getCustomForms } from '../../lib/firestore'
import { useAuth } from '../../contexts/AuthContext'

const INTERVAL_TYPES = [
  { value: 'days', label: 'Days', icon: Calendar },
  { value: 'hours', label: 'Hours', icon: Clock },
  { value: 'cycles', label: 'Cycles', icon: Wrench }
]

const ITEM_TYPES = [
  { value: 'equipment', label: 'Equipment' },
  { value: 'aircraft', label: 'Aircraft' }
]

export default function ScheduleEditorModal({
  isOpen,
  onClose,
  onSave,
  schedule = null,
  equipmentCategories = []
}) {
  const { user } = useAuth()
  const isEditing = !!schedule?.id

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    itemType: 'equipment',
    category: '',
    intervalType: 'days',
    intervalValue: 30,
    warningThreshold: 7,
    criticalThreshold: 0,
    requiresForm: false,
    formTemplateId: '',
    formTemplateName: '',
    tasks: []
  })

  const [availableForms, setAvailableForms] = useState([])
  const [loadingForms, setLoadingForms] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  // Load available form templates
  useEffect(() => {
    async function loadForms() {
      setLoadingForms(true)
      try {
        // Combine built-in maintenance form templates with custom forms
        const builtInForms = Object.values(MAINTENANCE_FORM_TEMPLATES).map(f => ({
          id: f.id,
          name: f.name,
          description: f.description,
          category: f.category,
          isBuiltIn: true
        }))

        // Get relevant built-in templates (equipment inspection, etc.)
        const relevantBuiltIn = Object.values(FORM_TEMPLATES)
          .filter(f => f.category === 'maintenance' || f.name.toLowerCase().includes('inspection'))
          .map(f => ({
            id: f.id,
            name: f.name,
            description: f.description,
            category: f.category,
            isBuiltIn: true
          }))

        // Get custom forms
        let customForms = []
        if (user?.uid) {
          try {
            const customs = await getCustomForms(user.uid)
            customForms = customs
              .filter(f => f.category === 'maintenance' || !f.category)
              .map(f => ({
                id: f.id,
                name: f.name,
                description: f.description,
                category: f.category,
                isBuiltIn: false
              }))
          } catch (err) {
            console.warn('Could not load custom forms:', err)
          }
        }

        setAvailableForms([...builtInForms, ...relevantBuiltIn, ...customForms])
      } catch (err) {
        console.error('Failed to load forms:', err)
      } finally {
        setLoadingForms(false)
      }
    }

    if (isOpen) {
      loadForms()
    }
  }, [isOpen, user?.uid])

  // Initialize form data when editing
  useEffect(() => {
    if (schedule) {
      setFormData({
        name: schedule.name || '',
        description: schedule.description || '',
        itemType: schedule.itemType || 'equipment',
        category: schedule.category || '',
        intervalType: schedule.intervalType || 'days',
        intervalValue: schedule.intervalValue || 30,
        warningThreshold: schedule.warningThreshold || 7,
        criticalThreshold: schedule.criticalThreshold || 0,
        requiresForm: schedule.requiresForm || false,
        formTemplateId: schedule.formTemplateId || '',
        formTemplateName: schedule.formTemplateName || '',
        tasks: schedule.tasks || []
      })
    } else {
      setFormData({
        name: '',
        description: '',
        itemType: 'equipment',
        category: '',
        intervalType: 'days',
        intervalValue: 30,
        warningThreshold: 7,
        criticalThreshold: 0,
        requiresForm: false,
        formTemplateId: '',
        formTemplateName: '',
        tasks: []
      })
    }
    setErrors({})
  }, [schedule, isOpen])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const handleFormSelect = (formId) => {
    const selectedForm = availableForms.find(f => f.id === formId)
    setFormData(prev => ({
      ...prev,
      formTemplateId: formId,
      formTemplateName: selectedForm?.name || ''
    }))
  }

  const handleAddTask = () => {
    const newTask = {
      id: `task_${Date.now()}`,
      name: '',
      description: '',
      required: true
    }
    setFormData(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }))
  }

  const handleUpdateTask = (taskId, field, value) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t =>
        t.id === taskId ? { ...t, [field]: value } : t
      )
    }))
  }

  const handleRemoveTask = (taskId) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== taskId)
    }))
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Schedule name is required'
    }

    if (!formData.intervalValue || formData.intervalValue <= 0) {
      newErrors.intervalValue = 'Interval must be greater than 0'
    }

    if (formData.requiresForm && !formData.formTemplateId) {
      newErrors.formTemplateId = 'Please select a form template'
    }

    if (!formData.requiresForm && formData.tasks.length === 0) {
      newErrors.tasks = 'Add at least one task or link a form'
    }

    const invalidTasks = formData.tasks.filter(t => !t.name.trim())
    if (invalidTasks.length > 0) {
      newErrors.tasks = 'All tasks must have a name'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return

    setSaving(true)
    try {
      await onSave(formData)
      onClose()
    } catch (err) {
      console.error('Failed to save schedule:', err)
      setErrors({ submit: 'Failed to save schedule. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  const intervalTypeConfig = INTERVAL_TYPES.find(t => t.value === formData.intervalType)
  const IntervalIcon = intervalTypeConfig?.icon || Calendar

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Maintenance Schedule' : 'New Maintenance Schedule'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Schedule Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., 100-Hour Inspection"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy ${
                  errors.name ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe what this maintenance schedule covers..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy"
              />
            </div>
          </div>

          {/* Applies To */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Applies To</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Item Type</label>
                <select
                  value={formData.itemType}
                  onChange={(e) => handleChange('itemType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy bg-white"
                >
                  {ITEM_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {formData.itemType === 'equipment' && equipmentCategories.length > 0 && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Category (optional)
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy bg-white"
                  >
                    <option value="">All Categories</option>
                    {equipmentCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Schedule Interval */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Schedule Interval</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Interval Type</label>
                <select
                  value={formData.intervalType}
                  onChange={(e) => handleChange('intervalType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy bg-white"
                >
                  {INTERVAL_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Every
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.intervalValue}
                    onChange={(e) => handleChange('intervalValue', parseInt(e.target.value) || 0)}
                    min="1"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy ${
                      errors.intervalValue ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    {formData.intervalType}
                  </span>
                </div>
                {errors.intervalValue && (
                  <p className="mt-1 text-sm text-red-600">{errors.intervalValue}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Warning at
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.warningThreshold}
                    onChange={(e) => handleChange('warningThreshold', parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    before
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Integration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Form Integration</h3>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.requiresForm}
                  onChange={(e) => handleChange('requiresForm', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-aeria-navy focus:ring-aeria-navy"
                />
                <span className="text-sm text-gray-600">Require form completion</span>
              </label>
            </div>

            {formData.requiresForm && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Linked Form Template
                </label>
                {loadingForms ? (
                  <div className="flex items-center gap-2 text-gray-500 py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading form templates...
                  </div>
                ) : (
                  <select
                    value={formData.formTemplateId}
                    onChange={(e) => handleFormSelect(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy bg-white ${
                      errors.formTemplateId ? 'border-red-300' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Select a form template...</option>
                    <optgroup label="Maintenance Forms">
                      {availableForms.filter(f => f.category === 'maintenance').map(form => (
                        <option key={form.id} value={form.id}>
                          {form.name}
                        </option>
                      ))}
                    </optgroup>
                    {availableForms.filter(f => f.category !== 'maintenance').length > 0 && (
                      <optgroup label="Other Forms">
                        {availableForms.filter(f => f.category !== 'maintenance').map(form => (
                          <option key={form.id} value={form.id}>
                            {form.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                )}
                {errors.formTemplateId && (
                  <p className="mt-1 text-sm text-red-600">{errors.formTemplateId}</p>
                )}

                {formData.formTemplateId && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        {formData.formTemplateName}
                      </span>
                    </div>
                    <p className="text-xs text-blue-700 mt-1">
                      Completing this maintenance will require filling out this form.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Legacy Tasks (when no form linked) */}
          {!formData.requiresForm && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">Tasks / Checklist</h3>
                <button
                  onClick={handleAddTask}
                  className="flex items-center gap-1 text-sm text-aeria-navy hover:text-aeria-navy/80"
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                </button>
              </div>

              {formData.tasks.length === 0 ? (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                  <p className="text-sm text-gray-500">
                    No tasks defined. Add tasks or link a form template.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {formData.tasks.map((task, index) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <GripVertical className="w-4 h-4 text-gray-400 mt-2 cursor-move" />
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={task.name}
                          onChange={(e) => handleUpdateTask(task.id, 'name', e.target.value)}
                          placeholder="Task name"
                          className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-aeria-navy"
                        />
                        <input
                          type="text"
                          value={task.description}
                          onChange={(e) => handleUpdateTask(task.id, 'description', e.target.value)}
                          placeholder="Description (optional)"
                          className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-aeria-navy"
                        />
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={task.required}
                            onChange={(e) => handleUpdateTask(task.id, 'required', e.target.checked)}
                            className="w-3 h-3 rounded border-gray-300 text-aeria-navy focus:ring-aeria-navy"
                          />
                          <span className="text-xs text-gray-600">Required</span>
                        </label>
                      </div>
                      <button
                        onClick={() => handleRemoveTask(task.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {errors.tasks && (
                <p className="text-sm text-red-600">{errors.tasks}</p>
              )}
            </div>
          )}

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{errors.submit}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-aeria-navy text-white rounded-lg hover:bg-aeria-navy/90 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditing ? 'Save Changes' : 'Create Schedule'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
