/**
 * PhaseTaskItem.jsx
 * Individual task card with expand/collapse and status controls
 *
 * @location src/components/projects/phases/PhaseTaskItem.jsx
 */

import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Circle,
  CircleDot,
  CheckCircle2,
  MinusCircle,
  Calendar,
  Trash2,
  Edit2,
  MoreVertical
} from 'lucide-react'
import { formatCurrency, calculateTaskCost } from '../../../lib/costEstimator'
import { getTaskTypeConfig, getTaskStatusConfig, TASK_STATUS } from './phaseConstants'
import TaskCostItems from './TaskCostItems'

export default function PhaseTaskItem({
  task,
  isPreField = true,
  onUpdate,
  onDelete,
  onEdit,
  onAddCostItem,
  onRemoveCostItem,
  readOnly = false
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const typeConfig = getTaskTypeConfig(task.type, isPreField)
  const statusConfig = getTaskStatusConfig(task.status)
  const TypeIcon = typeConfig.icon
  const taskCost = calculateTaskCost(task)

  // Status icons
  const StatusIcon = {
    pending: Circle,
    in_progress: CircleDot,
    completed: CheckCircle2,
    skipped: MinusCircle
  }[task.status] || Circle

  const handleStatusChange = (newStatus) => {
    const updates = { status: newStatus }
    if (newStatus === 'completed') {
      updates.completedAt = new Date().toISOString()
    } else if (task.status === 'completed') {
      updates.completedAt = null
    }
    onUpdate(task.id, updates)
  }

  const statusOptions = Object.entries(TASK_STATUS).map(([key, config]) => ({
    value: key,
    label: config.label
  }))

  return (
    <div
      className={`bg-white border rounded-lg transition-all border-gray-200 ${
        task.status === 'skipped' ? 'opacity-60' : ''
      }`}
    >
      {/* Main task row */}
      <div className="flex items-center gap-2 p-3">

        {/* Status button */}
        <button
          onClick={() => {
            if (readOnly) return
            // Cycle through: pending -> in_progress -> completed
            const nextStatus = {
              pending: 'in_progress',
              in_progress: 'completed',
              completed: 'pending',
              skipped: 'pending'
            }[task.status]
            handleStatusChange(nextStatus)
          }}
          disabled={readOnly}
          className={`p-1 rounded-full transition-colors ${
            readOnly ? 'cursor-default' : 'hover:bg-gray-100'
          } ${statusConfig.color}`}
          title={statusConfig.label}
        >
          <StatusIcon className="w-5 h-5" />
        </button>

        {/* Task type icon */}
        <div className={`p-1.5 rounded ${typeConfig.color}`}>
          <TypeIcon className="w-4 h-4" />
        </div>

        {/* Task name */}
        <div className="flex-1 min-w-0">
          <span
            className={`font-medium text-gray-900 ${
              task.status === 'skipped' ? 'line-through' : ''
            }`}
          >
            {task.name || 'Untitled Task'}
          </span>
          {task.dueDate && (
            <span className="ml-2 text-xs text-gray-400 inline-flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Cost */}
        {taskCost > 0 && (
          <span className="text-sm font-medium text-gray-700 px-2">
            {formatCurrency(taskCost)}
          </span>
        )}

        {/* Expand/collapse button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
        >
          {isExpanded ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </button>

        {/* Actions menu */}
        {!readOnly && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <button
                    onClick={() => {
                      onEdit(task)
                      setMenuOpen(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Task
                  </button>

                  {/* Status submenu */}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <div className="px-4 py-1 text-xs text-gray-400 uppercase">
                      Set Status
                    </div>
                    {statusOptions.map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => {
                          handleStatusChange(value)
                          setMenuOpen(false)
                        }}
                        className={`w-full px-4 py-1.5 text-left text-sm hover:bg-gray-50 ${
                          task.status === value ? 'text-aeria-navy font-medium' : 'text-gray-600'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        if (confirm('Delete this task?')) {
                          onDelete(task.id)
                        }
                        setMenuOpen(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Task
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {/* Description */}
          {task.description && (
            <p className="text-sm text-gray-600 mt-3 whitespace-pre-wrap">
              {task.description}
            </p>
          )}

          {/* Task type label */}
          <div className="mt-3 flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${typeConfig.color}`}>
              {typeConfig.label}
            </span>
            {task.completedAt && (
              <span className="text-xs text-gray-400">
                Completed {new Date(task.completedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Cost items */}
          <TaskCostItems
            costItems={task.costItems || []}
            onRemove={readOnly ? null : (costItemId) => onRemoveCostItem(task.id, costItemId)}
            onAdd={readOnly ? null : () => onAddCostItem(task)}
            readOnly={readOnly}
          />
        </div>
      )}
    </div>
  )
}
