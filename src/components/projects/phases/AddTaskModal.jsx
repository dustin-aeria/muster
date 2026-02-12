/**
 * AddTaskModal.jsx
 * Modal for adding/editing phase tasks
 *
 * @location src/components/projects/phases/AddTaskModal.jsx
 */

import { useState, useEffect } from 'react'
import { X, ListTodo, Calendar, Clock, Users, DollarSign, Trash2, Percent } from 'lucide-react'
import {
  PRE_FIELD_TASK_TYPES,
  POST_FIELD_TASK_TYPES,
  createTask,
  generateId,
  COST_ITEM_MODIFIER_PRESETS
} from './phaseConstants'

const RATE_TYPE_OPTIONS = {
  hourly: { label: 'Hours', rateField: 'hourlyRate', unitLabel: 'hr' },
  daily: { label: 'Days', rateField: 'dailyRate', unitLabel: 'day' },
  weekly: { label: 'Weeks', rateField: 'weeklyRate', unitLabel: 'wk' }
}

export default function AddTaskModal({
  isOpen,
  onClose,
  onSave,
  task = null,
  isPreField = true,
  operators = []
}) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'other',
    description: '',
    dueDate: '',
    rateType: 'hourly',
    estimatedDuration: '',
    assignedOperators: [],
    modifiers: []
  })

  const taskTypes = isPreField ? PRE_FIELD_TASK_TYPES : POST_FIELD_TASK_TYPES
  const isEditing = !!task
  const rateConfig = RATE_TYPE_OPTIONS[formData.rateType]

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name || '',
        type: task.type || 'other',
        description: task.description || '',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        rateType: task.rateType || 'hourly',
        estimatedDuration: task.estimatedDuration || task.estimatedHours || '',
        assignedOperators: task.assignedOperators || [],
        modifiers: task.modifiers || []
      })
    } else {
      setFormData({
        name: '',
        type: 'other',
        description: '',
        dueDate: '',
        rateType: 'hourly',
        estimatedDuration: '',
        assignedOperators: [],
        modifiers: []
      })
    }
  }, [task, isOpen])

  // Get the rate for an operator based on current rate type
  const getOperatorRate = (operator) => {
    const rateField = rateConfig.rateField
    return operator?.[rateField] || 0
  }

  // Calculate base cost based on assigned operators, duration, and rate type
  const baseCost = formData.assignedOperators.reduce((total, opId) => {
    const operator = operators.find(o => o.id === opId || o.operatorId === opId)
    const duration = parseFloat(formData.estimatedDuration) || 0
    const rate = getOperatorRate(operator)
    return total + (duration * rate)
  }, 0)

  // Apply modifiers to get final estimated cost
  const estimatedCost = (() => {
    let cost = baseCost
    if (formData.modifiers.length > 0) {
      let multiplier = 1
      for (const mod of formData.modifiers) {
        multiplier *= (mod.multiplier || 1)
      }
      cost *= multiplier
    }
    return cost
  })()

  // Modifier management functions
  const addModifier = (preset = null) => {
    const newModifier = preset
      ? { id: generateId(), name: preset.name, multiplier: preset.multiplier }
      : { id: generateId(), name: '', multiplier: 1.0 }
    setFormData(prev => ({
      ...prev,
      modifiers: [...prev.modifiers, newModifier]
    }))
  }

  const updateModifier = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      modifiers: prev.modifiers.map(m =>
        m.id === id ? { ...m, [field]: value } : m
      )
    }))
  }

  const removeModifier = (id) => {
    setFormData(prev => ({
      ...prev,
      modifiers: prev.modifiers.filter(m => m.id !== id)
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert('Please enter a task name')
      return
    }

    const taskData = isEditing
      ? {
          ...task,
          ...formData,
          dueDate: formData.dueDate || null,
          estimatedDuration: parseFloat(formData.estimatedDuration) || 0,
          estimatedHours: formData.rateType === 'hourly'
            ? parseFloat(formData.estimatedDuration) || 0
            : formData.rateType === 'daily'
              ? (parseFloat(formData.estimatedDuration) || 0) * 8
              : (parseFloat(formData.estimatedDuration) || 0) * 40,
          estimatedCost,
          baseCost,
          modifiers: formData.modifiers
        }
      : createTask({
          ...formData,
          dueDate: formData.dueDate || null,
          estimatedDuration: parseFloat(formData.estimatedDuration) || 0,
          estimatedHours: formData.rateType === 'hourly'
            ? parseFloat(formData.estimatedDuration) || 0
            : formData.rateType === 'daily'
              ? (parseFloat(formData.estimatedDuration) || 0) * 8
              : (parseFloat(formData.estimatedDuration) || 0) * 40,
          estimatedCost,
          baseCost,
          modifiers: formData.modifiers
        })

    onSave(taskData)
    onClose()
  }

  const handleAddOperator = (operatorId) => {
    if (!operatorId || formData.assignedOperators.includes(operatorId)) return
    setFormData(prev => ({
      ...prev,
      assignedOperators: [...prev.assignedOperators, operatorId]
    }))
  }

  const handleRemoveOperator = (operatorId) => {
    setFormData(prev => ({
      ...prev,
      assignedOperators: prev.assignedOperators.filter(id => id !== operatorId)
    }))
  }

  // Get available operators (not yet assigned)
  const availableOperators = operators.filter(op => {
    const opId = op.id || op.operatorId
    return !formData.assignedOperators.includes(opId)
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-auto z-10">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ListTodo className="w-5 h-5" />
              {isEditing ? 'Edit Task' : 'Add Task'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Task Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter task name"
                className="input"
                autoFocus
              />
            </div>

            {/* Task Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(taskTypes).map(([key, config]) => {
                  const Icon = config.icon
                  const isSelected = formData.type === key

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: key }))}
                      className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${
                        isSelected
                          ? 'border-aeria-navy bg-aeria-navy/5 ring-1 ring-aeria-navy'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`p-1 rounded ${config.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm text-gray-700">{config.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Due Date
                </span>
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="input"
              />
            </div>

            {/* Duration & Rate Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Estimated Duration
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.estimatedDuration}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                  className="input flex-1"
                  placeholder="e.g., 2.5"
                />
                <select
                  value={formData.rateType}
                  onChange={(e) => setFormData(prev => ({ ...prev, rateType: e.target.value }))}
                  className="input w-28"
                >
                  {Object.entries(RATE_TYPE_OPTIONS).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Assigned Operators */}
            {operators.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Assigned Operators
                  </span>
                </label>

                {/* Dropdown to add operators */}
                {availableOperators.length > 0 && (
                  <select
                    value=""
                    onChange={(e) => handleAddOperator(e.target.value)}
                    className="input mb-2"
                  >
                    <option value="">Select operator to add...</option>
                    {availableOperators.map(op => {
                      const opId = op.id || op.operatorId
                      const rate = getOperatorRate(op)
                      const opName = op.name || op.operatorName || `${op.firstName || ''} ${op.lastName || ''}`.trim()
                      return (
                        <option key={opId} value={opId}>
                          {opName} {rate > 0 ? `($${rate}/${rateConfig.unitLabel})` : '(no rate)'}
                        </option>
                      )
                    })}
                  </select>
                )}

                {/* List of assigned operators */}
                {formData.assignedOperators.length > 0 ? (
                  <div className="space-y-2">
                    {formData.assignedOperators.map(opId => {
                      const op = operators.find(o => (o.id || o.operatorId) === opId)
                      if (!op) return null
                      const rate = getOperatorRate(op)
                      const opName = op.name || op.operatorName || `${op.firstName || ''} ${op.lastName || ''}`.trim()
                      const duration = parseFloat(formData.estimatedDuration) || 0
                      const opCost = duration * rate

                      return (
                        <div
                          key={opId}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex-1">
                            <span className="font-medium text-gray-900">{opName}</span>
                            {rate > 0 ? (
                              <span className="ml-2 text-sm text-gray-500">
                                ${rate}/{rateConfig.unitLabel}
                                {duration > 0 && (
                                  <span className="text-green-600 ml-1">
                                    = ${opCost.toFixed(2)}
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span className="ml-2 text-sm text-amber-600">(no {rateConfig.label.toLowerCase()} rate)</span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveOperator(opId)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No operators assigned</p>
                )}

                {/* Warning for missing rates */}
                {formData.assignedOperators.some(opId => {
                  const op = operators.find(o => (o.id || o.operatorId) === opId)
                  return !getOperatorRate(op)
                }) && (
                  <p className="text-xs text-amber-600 mt-2">
                    Some operators don't have a {rateConfig.label.toLowerCase()} rate set. Update their rates in the Operators page.
                  </p>
                )}
              </div>
            )}

            {/* Price Adjustments / Modifiers */}
            {(baseCost > 0 || formData.modifiers.length > 0) && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Percent className="w-4 h-4" />
                    Price Adjustments
                  </label>
                  <button
                    type="button"
                    onClick={() => addModifier()}
                    className="text-xs text-aeria-navy hover:underline"
                  >
                    + Add Custom
                  </button>
                </div>

                {/* Quick add preset modifiers */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {COST_ITEM_MODIFIER_PRESETS
                    .filter(preset => !formData.modifiers.some(m => m.name === preset.name))
                    .slice(0, 4)
                    .map(preset => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => addModifier(preset)}
                        className="px-2 py-0.5 text-xs bg-white border border-gray-200 rounded hover:bg-gray-100 transition-colors"
                      >
                        + {preset.name} ({preset.multiplier > 1 ? '+' : ''}{((preset.multiplier - 1) * 100).toFixed(0)}%)
                      </button>
                    ))}
                </div>

                {/* Active modifiers */}
                {formData.modifiers.length > 0 ? (
                  <div className="space-y-2">
                    {formData.modifiers.map(m => (
                      <div key={m.id} className="flex items-center gap-2 bg-white p-2 rounded border border-gray-200">
                        <input
                          type="text"
                          value={m.name}
                          onChange={(e) => updateModifier(m.id, 'name', e.target.value)}
                          className="input flex-1 text-sm py-1"
                          placeholder="Adjustment name"
                        />
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={m.multiplier || ''}
                            onChange={(e) => updateModifier(m.id, 'multiplier', parseFloat(e.target.value) || 1)}
                            className="input w-16 text-sm text-center py-1"
                            placeholder="1.0"
                            step="0.05"
                            min="0.1"
                            max="3"
                          />
                          <span className="text-xs text-gray-500">x</span>
                        </div>
                        <span className={`text-xs w-12 text-right ${
                          m.multiplier > 1 ? 'text-red-600' : m.multiplier < 1 ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {m.multiplier > 1 ? `+${((m.multiplier - 1) * 100).toFixed(0)}%` :
                           m.multiplier < 1 ? `${((m.multiplier - 1) * 100).toFixed(0)}%` : '—'}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeModifier(m.id)}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No adjustments. Add rush fees, discounts, etc.</p>
                )}
              </div>
            )}

            {/* Estimated Cost */}
            {estimatedCost > 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-800">
                      Estimated Cost: <strong>${estimatedCost.toFixed(2)}</strong>
                    </span>
                  </div>
                  <span className="text-xs text-green-600">
                    {formData.assignedOperators.length} operator{formData.assignedOperators.length !== 1 ? 's' : ''} × {formData.estimatedDuration || 0} {rateConfig.label.toLowerCase()}
                    {formData.modifiers.length > 0 && (
                      <span className="ml-1">
                        (base ${baseCost.toFixed(2)})
                      </span>
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional task description or notes"
                rows={3}
                className="input resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                {isEditing ? 'Save Changes' : 'Add Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
