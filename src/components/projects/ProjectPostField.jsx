/**
 * ProjectPostField.jsx
 * Post-field phase tab for project lifecycle management
 *
 * @location src/components/projects/ProjectPostField.jsx
 */

import { useState, useCallback } from 'react'
import { PackageCheck, FileText, Info } from 'lucide-react'
import PhaseTaskList from './phases/PhaseTaskList'
import PhaseCostSummary from './phases/PhaseCostSummary'
import AddTaskModal from './phases/AddTaskModal'
import AddCostItemModal from './phases/AddCostItemModal'

export default function ProjectPostField({ project, onUpdate }) {
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [costModalOpen, setCostModalOpen] = useState(false)
  const [costModalTask, setCostModalTask] = useState(null)

  const phase = project?.postFieldPhase || { tasks: [], notes: '' }

  // Update phase data
  const updatePhase = useCallback((updates) => {
    onUpdate({
      postFieldPhase: {
        ...phase,
        ...updates
      }
    })
  }, [phase, onUpdate])

  // Task handlers
  const handleAddTask = () => {
    setEditingTask(null)
    setTaskModalOpen(true)
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setTaskModalOpen(true)
  }

  const handleSaveTask = (taskData) => {
    const tasks = [...(phase.tasks || [])]

    if (editingTask) {
      // Update existing task
      const index = tasks.findIndex(t => t.id === taskData.id)
      if (index !== -1) {
        tasks[index] = taskData
      }
    } else {
      // Add new task
      taskData.order = tasks.length
      tasks.push(taskData)
    }

    updatePhase({ tasks })
    setEditingTask(null)
  }

  const handleUpdateTask = (taskId, updates) => {
    const tasks = (phase.tasks || []).map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    )
    updatePhase({ tasks })
  }

  const handleDeleteTask = (taskId) => {
    const tasks = (phase.tasks || [])
      .filter(t => t.id !== taskId)
      .map((task, index) => ({ ...task, order: index }))
    updatePhase({ tasks })
  }

  const handleReorderTasks = (reorderedTasks) => {
    updatePhase({ tasks: reorderedTasks })
  }

  // Cost item handlers
  const handleAddCostItem = (task) => {
    setCostModalTask(task)
    setCostModalOpen(true)
  }

  const handleSaveCostItem = (costItem) => {
    if (!costModalTask) return

    const tasks = (phase.tasks || []).map(task => {
      if (task.id === costModalTask.id) {
        return {
          ...task,
          costItems: [...(task.costItems || []), costItem]
        }
      }
      return task
    })

    updatePhase({ tasks })
    setCostModalTask(null)
  }

  const handleRemoveCostItem = (taskId, costItemId) => {
    const tasks = (phase.tasks || []).map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          costItems: (task.costItems || []).filter(ci => ci.id !== costItemId)
        }
      }
      return task
    })
    updatePhase({ tasks })
  }

  // Notes handler
  const handleNotesChange = (notes) => {
    updatePhase({ notes })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <PackageCheck className="w-6 h-6 text-aeria-navy" />
            Post-Field Phase
          </h2>
          <p className="text-gray-600 mt-1">
            Tasks and costs after field operations complete
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-purple-800">
          <p className="font-medium mb-1">Track post-field activities and costs</p>
          <p className="text-purple-700">
            Add tasks for data processing, deliverable production, client review,
            revisions, final delivery, and project closeout. Link personnel and
            services to automatically calculate costs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task List - 2/3 width */}
        <div className="lg:col-span-2">
          <PhaseTaskList
            phase={phase}
            isPreField={false}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
            onReorderTasks={handleReorderTasks}
            onAddCostItem={handleAddCostItem}
            onRemoveCostItem={handleRemoveCostItem}
          />
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="space-y-4">
          {/* Cost Summary */}
          <PhaseCostSummary
            phase={phase}
            title="Post-Field Costs"
          />

          {/* Phase Notes */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4" />
              Phase Notes
            </h3>
            <textarea
              value={phase.notes || ''}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Add notes about post-field activities..."
              rows={4}
              className="input resize-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* Add/Edit Task Modal */}
      <AddTaskModal
        isOpen={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false)
          setEditingTask(null)
        }}
        onSave={handleSaveTask}
        task={editingTask}
        isPreField={false}
      />

      {/* Add Cost Item Modal */}
      <AddCostItemModal
        isOpen={costModalOpen}
        onClose={() => {
          setCostModalOpen(false)
          setCostModalTask(null)
        }}
        onSave={handleSaveCostItem}
        taskName={costModalTask?.name}
      />
    </div>
  )
}
