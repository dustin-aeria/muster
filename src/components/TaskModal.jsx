/**
 * TaskModal.jsx
 * Modal for creating/editing tasks
 */

import { useState, useEffect } from 'react'
import { X, Save, Trash2, CheckSquare } from 'lucide-react'
import {
  createTask,
  updateTask,
  deleteTask,
  TASK_STATUS,
  TASK_PRIORITY,
  TASK_VISIBILITY,
  TASK_CATEGORY
} from '../lib/firestoreTasks'

export default function TaskModal({
  isOpen,
  onClose,
  task,
  organizationId,
  userId,
  projects = [],
  members = [],
  onSave
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    category: 'general',
    dueDate: '',
    projectId: '',
    assignedTo: userId || '',
    visibility: 'personal'
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const isEditing = !!task

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        category: task.category || 'general',
        dueDate: task.dueDate
          ? (task.dueDate instanceof Date
              ? task.dueDate.toISOString().split('T')[0]
              : new Date(task.dueDate).toISOString().split('T')[0])
          : '',
        projectId: task.projectId || '',
        assignedTo: task.assignedTo || userId || '',
        visibility: task.visibility || 'personal'
      })
    } else {
      // Reset for new task
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        category: 'general',
        dueDate: '',
        projectId: '',
        assignedTo: userId || '',
        visibility: 'personal'
      })
    }
  }, [task, userId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      if (!formData.title.trim()) {
        setError('Title is required')
        setSaving(false)
        return
      }

      const taskData = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        projectId: formData.projectId || null
      }

      if (isEditing) {
        await updateTask(task.id, taskData)
      } else {
        await createTask(taskData, organizationId, userId)
      }

      onSave?.()
      onClose()
    } catch (err) {
      console.error('Error saving task:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task? This cannot be undone.')) return

    setSaving(true)
    try {
      await deleteTask(task.id)
      onSave?.()
      onClose()
    } catch (err) {
      console.error('Error deleting task:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            {isEditing ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              autoFocus
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What needs to be done?"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add more details (optional)"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(TASK_CATEGORY).map(([key, cat]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: key }))}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    formData.category === key
                      ? `${cat.color} text-white ring-2 ring-offset-2 ring-${cat.color.replace('bg-', '')}`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(TASK_PRIORITY).map(([key, priority]) => (
                  <option key={key} value={key}>
                    {priority.icon} {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Project (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project
            </label>
            <select
              name="projectId"
              value={formData.projectId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">No project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Assignee & Visibility */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned To
              </label>
              <select
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={userId}>Me</option>
                {members
                  .filter(m => m.userId !== userId)
                  .map(member => (
                    <option key={member.userId} value={member.userId}>
                      {member.displayName || member.email}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visibility
              </label>
              <select
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(TASK_VISIBILITY).map(([key, vis]) => (
                  <option key={key} value={key}>
                    {vis.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status (only for editing) */}
          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(TASK_STATUS).map(([key, status]) => (
                  <option key={key} value={key}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            {isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : isEditing ? 'Update' : 'Create Task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
