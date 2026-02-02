/**
 * Tasks.jsx
 * Task Management Page
 *
 * Simple, functional task management with personal and team visibility.
 * Integrates with projects and displays on the unified calendar.
 *
 * @location src/pages/Tasks.jsx
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useOrganization } from '../hooks/useOrganization'
import { Link } from 'react-router-dom'
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  MoreVertical,
  Check,
  Circle,
  Trash2,
  Edit,
  ChevronDown,
  FolderKanban,
  Users,
  User
} from 'lucide-react'
import { format, isToday, isTomorrow, isPast, isThisWeek } from 'date-fns'

import {
  getTasks,
  getMyTasks,
  getTeamTasks,
  toggleTaskComplete,
  deleteTask,
  TASK_STATUS,
  TASK_PRIORITY
} from '../lib/firestoreTasks'
import { getProjects } from '../lib/firestore'
import { getOrganizationMembers } from '../lib/firestoreOrganizations'

import TaskModal from '../components/TaskModal'

export default function Tasks() {
  const { user } = useAuth()
  const { organizationId } = useOrganization()

  // State
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [members, setMembers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [viewFilter, setViewFilter] = useState('my') // 'my', 'team', 'all'
  const [showFilters, setShowFilters] = useState(false)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)

  // Quick add state
  const [quickAddTitle, setQuickAddTitle] = useState('')
  const [addingQuick, setAddingQuick] = useState(false)

  // Load data
  const loadData = useCallback(async () => {
    if (!organizationId || !user) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      let tasksData
      if (viewFilter === 'my') {
        tasksData = await getMyTasks(organizationId, user.uid)
      } else if (viewFilter === 'team') {
        tasksData = await getTeamTasks(organizationId)
      } else {
        tasksData = await getTasks(organizationId)
      }

      const [projectsData, membersData] = await Promise.all([
        getProjects({ organizationId }),
        getOrganizationMembers(organizationId)
      ])

      setTasks(tasksData)
      setProjects(projectsData)
      setMembers(membersData)
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }, [organizationId, user, viewFilter])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null)
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [openMenuId])

  // Handlers
  const handleToggleComplete = async (task) => {
    try {
      const isComplete = task.status === 'complete'
      await toggleTaskComplete(task.id, !isComplete)
      loadData()
    } catch (error) {
      console.error('Error toggling task:', error)
    }
  }

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return
    try {
      await deleteTask(taskId)
      loadData()
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const handleEdit = (task) => {
    setSelectedTask(task)
    setModalOpen(true)
    setOpenMenuId(null)
  }

  const handleAddTask = () => {
    setSelectedTask(null)
    setModalOpen(true)
  }

  const handleQuickAdd = async (e) => {
    e.preventDefault()
    if (!quickAddTitle.trim()) return

    setAddingQuick(true)
    try {
      const { createTask } = await import('../lib/firestoreTasks')
      await createTask(
        { title: quickAddTitle.trim(), priority: 'medium', visibility: 'personal' },
        organizationId,
        user.uid
      )
      setQuickAddTitle('')
      loadData()
    } catch (error) {
      console.error('Error adding task:', error)
    } finally {
      setAddingQuick(false)
    }
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setSelectedTask(null)
    loadData()
  }

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    // Search
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      if (!task.title.toLowerCase().includes(search) &&
          !task.description?.toLowerCase().includes(search)) {
        return false
      }
    }

    // Status filter
    if (statusFilter !== 'all' && task.status !== statusFilter) {
      return false
    }

    // Priority filter
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
      return false
    }

    // Project filter
    if (projectFilter !== 'all') {
      if (projectFilter === 'none' && task.projectId) return false
      if (projectFilter !== 'none' && task.projectId !== projectFilter) return false
    }

    return true
  })

  // Sort tasks: incomplete first, then by due date, then by priority
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // Completed tasks go to bottom
    if (a.status === 'complete' && b.status !== 'complete') return 1
    if (a.status !== 'complete' && b.status === 'complete') return -1

    // Sort by due date (tasks with dates first, sorted by date)
    if (a.dueDate && !b.dueDate) return -1
    if (!a.dueDate && b.dueDate) return 1
    if (a.dueDate && b.dueDate) {
      const dateA = new Date(a.dueDate)
      const dateB = new Date(b.dueDate)
      if (dateA < dateB) return -1
      if (dateA > dateB) return 1
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  // Helper to format due date
  const formatDueDate = (date) => {
    if (!date) return null
    const d = date instanceof Date ? date : new Date(date)
    if (isToday(d)) return 'Today'
    if (isTomorrow(d)) return 'Tomorrow'
    if (isThisWeek(d)) return format(d, 'EEEE')
    return format(d, 'MMM d')
  }

  // Get due date color
  const getDueDateColor = (date, status) => {
    if (status === 'complete') return 'text-gray-400'
    if (!date) return 'text-gray-400'
    const d = date instanceof Date ? date : new Date(date)
    if (isPast(d) && !isToday(d)) return 'text-red-600'
    if (isToday(d)) return 'text-orange-600'
    return 'text-gray-500'
  }

  // Get project name by ID
  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId)
    return project?.name || null
  }

  // Get member name by ID
  const getMemberName = (userId) => {
    if (userId === user.uid) return 'Me'
    const member = members.find(m => m.userId === userId)
    return member?.displayName || member?.email || 'Unknown'
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-blue-600" />
            Tasks
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your personal and team tasks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/calendar"
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            Calendar
          </Link>
          <button
            onClick={handleAddTask}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* View Tabs & Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* View Tabs */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setViewFilter('my')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewFilter === 'my'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-4 h-4" />
              My Tasks
            </button>
            <button
              onClick={() => setViewFilter('team')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewFilter === 'team'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-4 h-4" />
              Team Tasks
            </button>
            <button
              onClick={() => setViewFilter('all')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewFilter === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All
            </button>
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors ${
              showFilters ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="todo">To Do</option>
                <option value="complete">Complete</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Projects</option>
                <option value="none">No Project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Quick Add */}
      <form onSubmit={handleQuickAdd} className="flex gap-2">
        <div className="flex-1 relative">
          <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={quickAddTitle}
            onChange={(e) => setQuickAddTitle(e.target.value)}
            placeholder="Quick add task..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          disabled={!quickAddTitle.trim() || addingQuick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {addingQuick ? 'Adding...' : 'Add'}
        </button>
      </form>

      {/* Task List */}
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {sortedTasks.length === 0 ? (
          <div className="p-8 text-center">
            <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No tasks found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || projectFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first task to get started'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={handleAddTask}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            )}
          </div>
        ) : (
          sortedTasks.map(task => (
            <div
              key={task.id}
              className={`flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors group ${
                task.status === 'complete' ? 'bg-gray-50' : ''
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={() => handleToggleComplete(task)}
                className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  task.status === 'complete'
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 hover:border-blue-500'
                }`}
              >
                {task.status === 'complete' && <Check className="w-3 h-3" />}
              </button>

              {/* Task Content */}
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => handleEdit(task)}
              >
                <div className="flex items-start gap-2">
                  <span className={`font-medium ${
                    task.status === 'complete' ? 'text-gray-400 line-through' : 'text-gray-900'
                  }`}>
                    {task.title}
                  </span>
                  {/* Priority indicator */}
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${TASK_PRIORITY[task.priority]?.color || 'bg-gray-400'}`}
                    title={TASK_PRIORITY[task.priority]?.label}
                  />
                </div>

                {/* Meta info */}
                <div className="flex items-center gap-3 mt-1 text-sm">
                  {/* Due date */}
                  {task.dueDate && (
                    <span className={`flex items-center gap-1 ${getDueDateColor(task.dueDate, task.status)}`}>
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDueDate(task.dueDate)}
                    </span>
                  )}

                  {/* Project */}
                  {task.projectId && getProjectName(task.projectId) && (
                    <span className="flex items-center gap-1 text-gray-500">
                      <FolderKanban className="w-3.5 h-3.5" />
                      {getProjectName(task.projectId)}
                    </span>
                  )}

                  {/* Visibility indicator */}
                  {task.visibility === 'team' && (
                    <span className="flex items-center gap-1 text-blue-600">
                      <Users className="w-3.5 h-3.5" />
                      Team
                    </span>
                  )}

                  {/* Assignee (if not self and viewing all/team) */}
                  {viewFilter !== 'my' && task.assignedTo !== user.uid && (
                    <span className="text-gray-400">
                      Assigned to {getMemberName(task.assignedTo)}
                    </span>
                  )}

                  {/* Completed indicator */}
                  {task.status === 'complete' && (
                    <span className="text-green-600 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Done
                    </span>
                  )}
                </div>
              </div>

              {/* Actions Menu */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpenMenuId(openMenuId === task.id ? null : task.id)
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

                {openMenuId === task.id && (
                  <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEdit(task)
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(task.id)
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats Footer */}
      {sortedTasks.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            {sortedTasks.filter(t => t.status === 'complete').length} of {sortedTasks.length} complete
          </span>
          <span>
            {sortedTasks.filter(t => t.status !== 'complete' && t.dueDate && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate))).length} overdue
          </span>
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        task={selectedTask}
        organizationId={organizationId}
        userId={user?.uid}
        projects={projects}
        members={members}
        onSave={loadData}
      />
    </div>
  )
}
