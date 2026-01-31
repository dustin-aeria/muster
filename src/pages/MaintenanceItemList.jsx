/**
 * MaintenanceItemList.jsx
 * List view of all maintainable items (equipment + aircraft)
 *
 * Features:
 * - Combined list of equipment and aircraft
 * - Filter by status, type, category, search
 * - Sort by name, status, due date
 * - Quick actions (log service, ground)
 *
 * @location src/pages/MaintenanceItemList.jsx
 */

import { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Wrench,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Package,
  Plane,
  LayoutGrid,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react'
import {
  getAllMaintainableItems,
  calculateOverallMaintenanceStatus,
  getMostUrgentMaintenance
} from '../lib/firestoreMaintenance'
import MaintenanceFilters from '../components/maintenance/MaintenanceFilters'
import { useOrganization } from '../hooks/useOrganization'
import MaintenanceItemCard from '../components/maintenance/MaintenanceItemCard'
import SelectScheduleModal from '../components/maintenance/SelectScheduleModal'
import LogMaintenanceModal from '../components/maintenance/LogMaintenanceModal'

const sortOptions = [
  { value: 'name', label: 'Name' },
  { value: 'status', label: 'Status' },
  { value: 'type', label: 'Type' },
  { value: 'remaining', label: 'Due Date' }
]

const statusPriority = {
  overdue: 0,
  grounded: 1,
  due_soon: 2,
  ok: 3,
  no_schedule: 4
}

export default function MaintenanceItemList() {
  const { organizationId } = useOrganization()
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [items, setItems] = useState([])
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  const [sortBy, setSortBy] = useState('status')
  const [sortDir, setSortDir] = useState('asc')

  // Get initial filter values from URL params
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    itemType: searchParams.get('type') || '',
    category: searchParams.get('category') || ''
  })

  // Log service modal state
  const [selectedItem, setSelectedItem] = useState(null)
  const [showSelectSchedule, setShowSelectSchedule] = useState(false)
  const [showLogMaintenance, setShowLogMaintenance] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState(null)

  useEffect(() => {
    if (organizationId) {
      loadItems()
    }
  }, [organizationId])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.status) params.set('status', filters.status)
    if (filters.itemType) params.set('type', filters.itemType)
    if (filters.category) params.set('category', filters.category)
    setSearchParams(params, { replace: true })
  }, [filters, setSearchParams])

  const loadItems = async () => {
    if (!organizationId) return
    setLoading(true)
    setError(null)
    try {
      const data = await getAllMaintainableItems(organizationId, { includeRetired: false })
      setItems(data)
    } catch (err) {
      console.error('Failed to load items:', err)
      setError('Failed to load maintenance items. Please try again.')
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

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let result = [...items]

    // Apply filters
    if (filters.search) {
      const search = filters.search.toLowerCase()
      result = result.filter(item =>
        (item.name || '').toLowerCase().includes(search) ||
        (item.nickname || '').toLowerCase().includes(search) ||
        (item.serialNumber || '').toLowerCase().includes(search) ||
        (item.model || '').toLowerCase().includes(search)
      )
    }

    if (filters.status) {
      result = result.filter(item => {
        const status = calculateOverallMaintenanceStatus(item)
        return status === filters.status
      })
    }

    if (filters.itemType) {
      result = result.filter(item => item.itemType === filters.itemType)
    }

    if (filters.category) {
      result = result.filter(item => item.category === filters.category)
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'name':
          comparison = (a.name || a.nickname || '').localeCompare(b.name || b.nickname || '')
          break
        case 'status':
          const statusA = calculateOverallMaintenanceStatus(a)
          const statusB = calculateOverallMaintenanceStatus(b)
          comparison = statusPriority[statusA] - statusPriority[statusB]
          break
        case 'type':
          comparison = a.itemType.localeCompare(b.itemType)
          break
        case 'remaining':
          const urgentA = getMostUrgentMaintenance(a)
          const urgentB = getMostUrgentMaintenance(b)
          const remainingA = urgentA?.remaining ?? Infinity
          const remainingB = urgentB?.remaining ?? Infinity
          comparison = remainingA - remainingB
          break
        default:
          comparison = 0
      }

      return sortDir === 'desc' ? -comparison : comparison
    })

    return result
  }, [items, filters, sortBy, sortDir])

  // Stats for header
  const stats = useMemo(() => {
    return {
      total: items.length,
      filtered: filteredItems.length,
      overdue: items.filter(i => calculateOverallMaintenanceStatus(i) === 'overdue').length,
      dueSoon: items.filter(i => calculateOverallMaintenanceStatus(i) === 'due_soon').length,
      grounded: items.filter(i => i.isGrounded).length
    }
  }, [items, filteredItems])

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '',
      itemType: '',
      category: ''
    })
  }

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDir('asc')
    }
  }

  // Log service handlers
  const handleLogService = (item) => {
    setSelectedItem(item)
    setShowSelectSchedule(true)
  }

  const handleSelectSchedule = (schedule) => {
    setSelectedSchedule(schedule)
    setShowSelectSchedule(false)
    // If schedule requires form, we would launch form here
    // For now, open manual log modal
    setShowLogMaintenance(true)
  }

  const handleSelectAdHoc = () => {
    setSelectedSchedule(null)
    setShowSelectSchedule(false)
    setShowLogMaintenance(true)
  }

  const handleLogSuccess = async () => {
    setShowLogMaintenance(false)
    setSelectedItem(null)
    setSelectedSchedule(null)
    // Refresh the list
    await loadItems()
  }

  const handleCloseModals = () => {
    setShowSelectSchedule(false)
    setShowLogMaintenance(false)
    setSelectedItem(null)
    setSelectedSchedule(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-aeria-navy mx-auto" />
          <p className="mt-2 text-gray-500">Loading items...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Items</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button onClick={loadItems} className="btn-primary">
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
            <Wrench className="w-7 h-7 text-aeria-navy" />
            Maintenance Items
          </h1>
          <p className="text-gray-500 mt-1">
            {stats.filtered} of {stats.total} items
            {stats.overdue > 0 && (
              <span className="ml-2 text-red-600">- {stats.overdue} overdue</span>
            )}
            {stats.dueSoon > 0 && (
              <span className="ml-2 text-amber-600">- {stats.dueSoon} due soon</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-aeria-navy text-white' : 'text-gray-500 hover:bg-gray-100'}`}
              title="Grid view"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-aeria-navy text-white' : 'text-gray-500 hover:bg-gray-100'}`}
              title="List view"
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>Sort by {opt.label}</option>
              ))}
            </select>
            <button
              onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-100"
              title={sortDir === 'asc' ? 'Ascending' : 'Descending'}
            >
              {sortDir === 'asc' ? <SortAsc className="w-5 h-5" /> : <SortDesc className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <MaintenanceFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        equipmentCategories={equipmentCategories}
      />

      {/* Results */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-500 mb-4">
            {filters.search || filters.status || filters.itemType
              ? 'Try adjusting your filters'
              : 'Add equipment or aircraft to start tracking maintenance'
            }
          </p>
          {(filters.search || filters.status || filters.itemType) && (
            <button
              onClick={handleClearFilters}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => (
            <MaintenanceItemCard
              key={item.id}
              item={item}
              onLogService={handleLogService}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map(item => (
            <MaintenanceItemCard
              key={item.id}
              item={item}
              compact
              onLogService={handleLogService}
            />
          ))}
        </div>
      )}

      {/* Log Service Modals */}
      <SelectScheduleModal
        isOpen={showSelectSchedule}
        onClose={handleCloseModals}
        item={selectedItem}
        onSelectSchedule={handleSelectSchedule}
        onSelectAdHoc={handleSelectAdHoc}
      />

      <LogMaintenanceModal
        isOpen={showLogMaintenance}
        onClose={handleCloseModals}
        item={selectedItem}
        schedule={selectedSchedule}
        onSuccess={handleLogSuccess}
      />
    </div>
  )
}
