/**
 * AddTaskModal.jsx
 * Modal for adding/editing phase tasks
 *
 * @location src/components/projects/phases/AddTaskModal.jsx
 */

import { useState, useEffect } from 'react'
import { X, ListTodo, Calendar, Clock, Users, DollarSign } from 'lucide-react'
import {
  PRE_FIELD_TASK_TYPES,
  POST_FIELD_TASK_TYPES,
  createTask
} from './phaseConstants'

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
    estimatedHours: '',
    assignedOperators: []
  })

  const taskTypes = isPreField ? PRE_FIELD_TASK_TYPES : POST_FIELD_TASK_TYPES
  const isEditing = !!task

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name || '',
        type: task.type || 'other',
        description: task.description || '',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        estimatedHours: task.estimatedHours || '',
        assignedOperators: task.assignedOperators || []
      })
    } else {
      setFormData({
        name: '',
        type: 'other',
        description: '',
        dueDate: '',
        estimatedHours: '',
        assignedOperators: []
      })
    }
  }, [task, isOpen])

  // Calculate estimated cost based on assigned operators and hours
  const estimatedCost = formData.assignedOperators.reduce((total, opId) => {
    const operator = operators.find(o => o.id === opId || o.operatorId === opId)
    const hours = parseFloat(formData.estimatedHours) || 0
    const rate = operator?.hourlyRate || 0
    return total + (hours * rate)
  }, 0)

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
          estimatedHours: parseFloat(formData.estimatedHours) || 0,
          estimatedCost
        }
      : createTask({
          ...formData,
          dueDate: formData.dueDate || null,
          estimatedHours: parseFloat(formData.estimatedHours) || 0,
          estimatedCost
        })

    onSave(taskData)
    onClose()
  }

  const handleToggleOperator = (operatorId) => {
    setFormData(prev => ({
      ...prev,
      assignedOperators: prev.assignedOperators.includes(operatorId)
        ? prev.assignedOperators.filter(id => id !== operatorId)
        : [...prev.assignedOperators, operatorId]
    }))
  }

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

            {/* Estimated Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Estimated Hours
                </span>
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.estimatedHours}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: e.target.value }))}
                className="input"
                placeholder="e.g., 2.5"
              />
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
                <div className="flex flex-wrap gap-2">
                  {operators.map(op => {
                    const opId = op.id || op.operatorId
                    const isSelected = formData.assignedOperators.includes(opId)
                    return (
                      <button
                        key={opId}
                        type="button"
                        onClick={() => handleToggleOperator(opId)}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                          isSelected
                            ? 'bg-aeria-navy text-white border-aeria-navy'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {op.name || op.operatorName || op.firstName}
                        {op.hourlyRate > 0 && (
                          <span className="ml-1 text-xs opacity-75">
                            (${op.hourlyRate}/hr)
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Estimated Cost */}
            {estimatedCost > 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-800">
                    Estimated Cost: <strong>${estimatedCost.toFixed(2)}</strong>
                  </span>
                  <span className="text-xs text-green-600">
                    ({formData.assignedOperators.length} operator{formData.assignedOperators.length !== 1 ? 's' : ''} × {formData.estimatedHours || 0}h)
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
