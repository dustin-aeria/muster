/**
 * PhaseTaskList.jsx
 * Reorderable task list with simple drag-and-drop support
 *
 * @location src/components/projects/phases/PhaseTaskList.jsx
 */

import { useState, useCallback, useRef } from 'react'
import { Plus, ListTodo, ArrowUp, ArrowDown } from 'lucide-react'
import PhaseTaskItem from './PhaseTaskItem'
import { formatCurrency, calculatePhaseCost } from '../../../lib/costEstimator'

export default function PhaseTaskList({
  phase,
  isPreField = true,
  onUpdateTask,
  onDeleteTask,
  onEditTask,
  onAddCostItem,
  onRemoveCostItem,
  onReorderTasks,
  onAddTask,
  readOnly = false
}) {
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)
  const tasks = phase?.tasks || []

  const totalCost = calculatePhaseCost(phase)

  // Reorder handlers
  const moveTask = useCallback((fromIndex, toIndex) => {
    if (fromIndex === toIndex) return

    const newTasks = [...tasks]
    const [movedTask] = newTasks.splice(fromIndex, 1)
    newTasks.splice(toIndex, 0, movedTask)

    // Update order property for each task
    const reorderedTasks = newTasks.map((task, index) => ({
      ...task,
      order: index
    }))

    onReorderTasks(reorderedTasks)
  }, [tasks, onReorderTasks])

  const handleMoveUp = (index) => {
    if (index > 0) {
      moveTask(index, index - 1)
    }
  }

  const handleMoveDown = (index) => {
    if (index < tasks.length - 1) {
      moveTask(index, index + 1)
    }
  }

  // Simple drag handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e, toIndex) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== toIndex) {
      moveTask(draggedIndex, toIndex)
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  return (
    <div className="space-y-4">
      {/* Header with total */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <ListTodo className="w-5 h-5 text-gray-500" />
          {isPreField ? 'Pre-Field Tasks' : 'Post-Field Tasks'}
        </h3>
        {totalCost > 0 && (
          <span className="text-lg font-semibold text-gray-900">
            Total: {formatCurrency(totalCost)}
          </span>
        )}
      </div>

      {/* Task list */}
      {tasks.length > 0 ? (
        <div className="space-y-2">
          {tasks.map((task, index) => (
            <div
              key={task.id}
              draggable={!readOnly}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`transition-all ${
                dragOverIndex === index && draggedIndex !== index
                  ? 'border-t-2 border-aeria-navy pt-2'
                  : ''
              } ${
                draggedIndex === index ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-start gap-1">
                {/* Reorder buttons for accessibility */}
                {!readOnly && (
                  <div className="flex flex-col gap-0.5 pt-3">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === tasks.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <div className="flex-1">
                  <PhaseTaskItem
                    task={task}
                    isPreField={isPreField}
                    onUpdate={onUpdateTask}
                    onDelete={onDeleteTask}
                    onEdit={onEditTask}
                    onAddCostItem={onAddCostItem}
                    onRemoveCostItem={onRemoveCostItem}
                    readOnly={readOnly}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <ListTodo className="w-10 h-10 mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500 mb-4">No tasks added yet</p>
          {!readOnly && (
            <button
              onClick={onAddTask}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add First Task
            </button>
          )}
        </div>
      )}

      {/* Add task button */}
      {!readOnly && tasks.length > 0 && (
        <button
          onClick={onAddTask}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-aeria-navy hover:text-aeria-navy transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Task
        </button>
      )}
    </div>
  )
}
