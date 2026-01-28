/**
 * MaintenanceSchedulesPage.jsx
 * Maintenance schedule management page
 *
 * Features:
 * - List all maintenance schedules
 * - Create, edit, delete schedules
 * - Link schedules to form templates
 * - See which items have schedules applied
 *
 * @location src/pages/MaintenanceSchedulesPage.jsx
 */

import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Wrench,
  ArrowLeft,
  Plus,
  Loader2,
  AlertTriangle,
  Calendar,
  Clock,
  Settings,
  FileText,
  Plane,
  Package,
  Pencil,
  Trash2,
  Search,
  MoreVertical
} from 'lucide-react'
import {
  getMaintenanceSchedules,
  createMaintenanceSchedule,
  updateMaintenanceSchedule,
  deleteMaintenanceSchedule,
  getAllMaintainableItems
} from '../lib/firestoreMaintenance'
import ScheduleEditorModal from '../components/maintenance/ScheduleEditorModal'

const INTERVAL_TYPE_LABELS = {
  days: 'days',
  hours: 'flight hours',
  cycles: 'cycles'
}

export default function MaintenanceSchedulesPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [schedules, setSchedules] = useState([])
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [schedulesData, itemsData] = await Promise.all([
        getMaintenanceSchedules(),
        getAllMaintainableItems({ includeRetired: false })
      ])
      setSchedules(schedulesData)
      setItems(itemsData)
    } catch (err) {
      console.error('Failed to load data:', err)
      setError('Failed to load maintenance schedules. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Get unique equipment categories
  const equipmentCategories = useMemo(() => {
    const categories = new Set()
    items
      .filter(item => item.itemType === 'equipment' && item.category)
      .forEach(item => categories.add(item.category))
    return Array.from(categories).sort()
  }, [items])

  // Count items using each schedule
  const scheduleItemCounts = useMemo(() => {
    const counts = {}
    schedules.forEach(schedule => {
      counts[schedule.id] = items.filter(item =>
        (item.maintenanceScheduleIds || []).includes(schedule.id)
      ).length
    })
    return counts
  }, [schedules, items])

  // Filter schedules
  const filteredSchedules = useMemo(() => {
    let result = [...schedules]

    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(s =>
        s.name.toLowerCase().includes(searchLower) ||
        (s.description || '').toLowerCase().includes(searchLower)
      )
    }

    if (filterType) {
      result = result.filter(s => s.itemType === filterType)
    }

    return result
  }, [schedules, search, filterType])

  const handleCreateSchedule = () => {
    setEditingSchedule(null)
    setIsModalOpen(true)
  }

  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule)
    setIsModalOpen(true)
  }

  const handleSaveSchedule = async (data) => {
    if (editingSchedule?.id) {
      await updateMaintenanceSchedule(editingSchedule.id, data)
    } else {
      await createMaintenanceSchedule(data)
    }
    await loadData()
  }

  const handleDeleteSchedule = async (schedule) => {
    setDeleting(true)
    try {
      await deleteMaintenanceSchedule(schedule.id)
      setDeleteConfirm(null)
      await loadData()
    } catch (err) {
      console.error('Failed to delete schedule:', err)
      setError('Failed to delete schedule. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-aeria-navy mx-auto" />
          <p className="mt-2 text-gray-500">Loading schedules...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Schedules</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button onClick={loadData} className="btn-primary">
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/maintenance"
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="w-7 h-7 text-aeria-navy" />
            Maintenance Schedules
          </h1>
          <p className="text-gray-500 mt-1">
            {schedules.length} schedule{schedules.length !== 1 ? 's' : ''} configured
          </p>
        </div>

        <button
          onClick={handleCreateSchedule}
          className="flex items-center gap-2 px-4 py-2 bg-aeria-navy text-white rounded-lg hover:bg-aeria-navy/90"
        >
          <Plus className="w-5 h-5" />
          New Schedule
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search schedules..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-aeria-navy focus:border-transparent"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="min-w-[140px]">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-aeria-navy focus:border-transparent bg-white"
            >
              <option value="">All Types</option>
              <option value="aircraft">Aircraft</option>
              <option value="equipment">Equipment</option>
            </select>
          </div>
        </div>
      </div>

      {/* Schedule List */}
      {filteredSchedules.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {schedules.length === 0 ? 'No schedules yet' : 'No matching schedules'}
          </h3>
          <p className="text-gray-500 mb-4">
            {schedules.length === 0
              ? 'Create maintenance schedules to track service intervals for your equipment and aircraft.'
              : 'Try adjusting your search or filters.'}
          </p>
          {schedules.length === 0 && (
            <button onClick={handleCreateSchedule} className="btn-primary">
              Create First Schedule
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSchedules.map(schedule => (
            <ScheduleCard
              key={schedule.id}
              schedule={schedule}
              itemCount={scheduleItemCounts[schedule.id] || 0}
              onEdit={() => handleEditSchedule(schedule)}
              onDelete={() => setDeleteConfirm(schedule)}
            />
          ))}
        </div>
      )}

      {/* Schedule Editor Modal */}
      <ScheduleEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSchedule}
        schedule={editingSchedule}
        equipmentCategories={equipmentCategories}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Schedule?
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{deleteConfirm.name}"?
              {scheduleItemCounts[deleteConfirm.id] > 0 && (
                <span className="block mt-2 text-amber-600">
                  This schedule is currently applied to {scheduleItemCounts[deleteConfirm.id]} item(s).
                </span>
              )}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSchedule(deleteConfirm)}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Schedule Card Component
function ScheduleCard({ schedule, itemCount, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const ItemIcon = schedule.itemType === 'aircraft' ? Plane : Package
  const IntervalIcon = schedule.intervalType === 'hours' ? Clock : Calendar

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-aeria-navy/10">
            <Wrench className="w-6 h-6 text-aeria-navy" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{schedule.name}</h3>
            {schedule.description && (
              <p className="text-sm text-gray-500 mt-0.5">{schedule.description}</p>
            )}

            {/* Schedule Details */}
            <div className="flex flex-wrap items-center gap-3 mt-3">
              {/* Item Type */}
              <span className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                <ItemIcon className="w-4 h-4" />
                <span className="capitalize">{schedule.itemType}</span>
                {schedule.category && (
                  <span className="text-gray-400">• {schedule.category}</span>
                )}
              </span>

              {/* Interval */}
              <span className="flex items-center gap-1.5 text-sm text-gray-600 bg-blue-50 px-2.5 py-1 rounded-full">
                <IntervalIcon className="w-4 h-4 text-blue-600" />
                Every {schedule.intervalValue} {INTERVAL_TYPE_LABELS[schedule.intervalType]}
              </span>

              {/* Warning Threshold */}
              {schedule.warningThreshold > 0 && (
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                  {schedule.warningThreshold} {schedule.intervalType} warning
                </span>
              )}

              {/* Form Link */}
              {schedule.requiresForm && schedule.formTemplateName && (
                <span className="flex items-center gap-1.5 text-sm text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
                  <FileText className="w-4 h-4" />
                  {schedule.formTemplateName}
                </span>
              )}

              {/* Item Count */}
              <span className="text-xs text-gray-500">
                Applied to {itemCount} item{itemCount !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Tasks Preview (if no form) */}
            {!schedule.requiresForm && schedule.tasks?.length > 0 && (
              <div className="mt-3 text-sm text-gray-500">
                <span className="font-medium">{schedule.tasks.length} task{schedule.tasks.length !== 1 ? 's' : ''}:</span>
                {' '}
                {schedule.tasks.slice(0, 3).map(t => t.name).join(', ')}
                {schedule.tasks.length > 3 && ` +${schedule.tasks.length - 3} more`}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[140px]">
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    onEdit()
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    onDelete()
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
