/**
 * NoAircraftAssignedModal.jsx
 * Modal shown when user reaches Flight Planning or Site Survey without aircraft assigned
 *
 * Features:
 * - Shows when no aircraft are assigned to project
 * - "Select from Inventory" - pick from global aircraft fleet
 * - "Quick Add New" - add new aircraft inline without leaving current view
 * - Seamless workflow continuation after selection
 *
 * @location src/components/NoAircraftAssignedModal.jsx
 */

import { useState, useEffect } from 'react'
import {
  Plane,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  X,
  ArrowRight,
  Weight,
  Gauge,
  Clock,
  ChevronLeft
} from 'lucide-react'
import { getAircraft, createAircraft } from '../lib/firestore'
import { logger } from '../lib/logger'

// ============================================
// STATUS CONFIGURATION
// ============================================
const statusConfig = {
  airworthy: {
    label: 'Airworthy',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle2
  },
  maintenance: {
    label: 'In Maintenance',
    color: 'bg-amber-100 text-amber-700',
    icon: Wrench
  },
  grounded: {
    label: 'Grounded',
    color: 'bg-red-100 text-red-700',
    icon: AlertTriangle
  }
}

const categoryOptions = [
  { value: 'multirotor', label: 'Multirotor' },
  { value: 'fixed_wing', label: 'Fixed Wing' },
  { value: 'vtol', label: 'VTOL (Hybrid)' },
  { value: 'helicopter', label: 'Helicopter' },
  { value: 'other', label: 'Other' }
]

// ============================================
// QUICK ADD FORM
// ============================================
function QuickAddForm({ onSave, onCancel, saving }) {
  const [formData, setFormData] = useState({
    nickname: '',
    make: '',
    model: '',
    serialNumber: '',
    category: 'multirotor',
    mtow: '',
    maxSpeed: '',
    endurance: ''
  })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.nickname.trim()) {
      setError('Nickname is required')
      return
    }
    if (!formData.make.trim()) {
      setError('Make is required')
      return
    }
    if (!formData.model.trim()) {
      setError('Model is required')
      return
    }

    const aircraftData = {
      ...formData,
      mtow: formData.mtow ? parseFloat(formData.mtow) : null,
      maxSpeed: formData.maxSpeed ? parseFloat(formData.maxSpeed) : null,
      endurance: formData.endurance ? parseFloat(formData.endurance) : null,
      status: 'airworthy'
    }

    await onSave(aircraftData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nickname <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="nickname"
            value={formData.nickname}
            onChange={handleChange}
            className="input"
            placeholder="e.g., M300-01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="input"
          >
            {categoryOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Make <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="make"
            value={formData.make}
            onChange={handleChange}
            className="input"
            placeholder="e.g., DJI"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Model <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            className="input"
            placeholder="e.g., Matrice 300 RTK"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
        <input
          type="text"
          name="serialNumber"
          value={formData.serialNumber}
          onChange={handleChange}
          className="input font-mono"
          placeholder="Optional"
        />
      </div>

      {/* Performance Specs - Important for SORA */}
      <div className="pt-3 border-t border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          Performance Specs
          <span className="text-xs font-normal text-gray-500">(Used for SORA calculations)</span>
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">MTOW (kg)</label>
            <input
              type="number"
              name="mtow"
              value={formData.mtow}
              onChange={handleChange}
              className="input"
              placeholder="e.g., 9"
              step="0.1"
              min="0"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Max Speed (m/s)</label>
            <input
              type="number"
              name="maxSpeed"
              value={formData.maxSpeed}
              onChange={handleChange}
              className="input"
              placeholder="e.g., 23"
              step="0.1"
              min="0"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Endurance (min)</label>
            <input
              type="number"
              name="endurance"
              value={formData.endurance}
              onChange={handleChange}
              className="input"
              placeholder="e.g., 45"
              step="1"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-3">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Add Aircraft
            </>
          )}
        </button>
      </div>
    </form>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function NoAircraftAssignedModal({
  isOpen,
  onClose,
  onAircraftSelected,
  context = 'flight planning' // 'flight planning' | 'site survey' | 'SORA'
}) {
  const [allAircraft, setAllAircraft] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [view, setView] = useState('select') // 'select' | 'quickAdd'
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Load aircraft on open
  useEffect(() => {
    if (isOpen) {
      loadAircraft()
      setView('select')
      setSearchQuery('')
      setError('')
    }
  }, [isOpen])

  const loadAircraft = async () => {
    setLoading(true)
    try {
      const data = await getAircraft()
      setAllAircraft(data)
    } catch (err) {
      logger.error('Failed to load aircraft:', err)
      setError('Failed to load aircraft inventory')
    } finally {
      setLoading(false)
    }
  }

  // Filter to airworthy aircraft only
  const availableAircraft = allAircraft.filter(a =>
    a.status === 'airworthy' &&
    (a.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     a.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     a.model?.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Handle selecting an existing aircraft
  const handleSelectAircraft = (aircraft) => {
    onAircraftSelected(aircraft)
    onClose()
  }

  // Handle quick add new aircraft
  const handleQuickAdd = async (aircraftData) => {
    setSaving(true)
    setError('')

    try {
      const newAircraft = await createAircraft(aircraftData)
      // Auto-select the newly created aircraft
      onAircraftSelected(newAircraft)
      onClose()
    } catch (err) {
      logger.error('Failed to create aircraft:', err)
      setError('Failed to add aircraft. Please try again.')
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">No Aircraft Assigned</h3>
                  <p className="text-sm text-gray-500">
                    {context === 'SORA'
                      ? 'SORA requires aircraft specs for calculations'
                      : `Select or add aircraft to continue with ${context}`}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {view === 'select' ? (
              <>
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                  <label htmlFor="aircraft-modal-search" className="sr-only">Search aircraft inventory</label>
                  <input
                    id="aircraft-modal-search"
                    type="search"
                    placeholder="Search aircraft inventory..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input pl-9"
                  />
                </div>

                {/* Aircraft List */}
                <div className="max-h-[300px] overflow-y-auto mb-4 space-y-2">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-aeria-navy border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-gray-500 mt-2">Loading aircraft...</p>
                    </div>
                  ) : availableAircraft.length === 0 ? (
                    <div className="text-center py-8">
                      <Plane className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                      <p className="text-gray-500">
                        {allAircraft.length === 0
                          ? 'No aircraft in inventory yet'
                          : searchQuery
                            ? 'No matching aircraft found'
                            : 'No airworthy aircraft available'}
                      </p>
                    </div>
                  ) : (
                    availableAircraft.map(ac => {
                      const status = statusConfig[ac.status] || statusConfig.airworthy
                      const StatusIcon = status.icon

                      return (
                        <button
                          key={ac.id}
                          onClick={() => handleSelectAircraft(ac)}
                          className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-aeria-blue hover:bg-aeria-sky/30 transition-colors group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-aeria-sky">
                                <Plane className="w-5 h-5 text-gray-600 group-hover:text-aeria-navy" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{ac.nickname}</p>
                                <p className="text-sm text-gray-500">{ac.make} {ac.model}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${status.color}`}>
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                              </span>
                              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-aeria-navy" />
                            </div>
                          </div>

                          {/* Quick specs */}
                          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                            {ac.mtow && (
                              <span className="flex items-center gap-1">
                                <Weight className="w-3 h-3" />
                                {ac.mtow} kg
                              </span>
                            )}
                            {ac.maxSpeed && (
                              <span className="flex items-center gap-1">
                                <Gauge className="w-3 h-3" />
                                {ac.maxSpeed} m/s
                              </span>
                            )}
                            {ac.endurance && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {ac.endurance} min
                              </span>
                            )}
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>

                {/* Quick Add Option */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setView('quickAdd')}
                    className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-aeria-blue hover:text-aeria-navy hover:bg-aeria-sky/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Quick Add New Aircraft
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Add a new aircraft to your inventory and assign it to this project
                  </p>
                </div>
              </>
            ) : (
              <QuickAddForm
                onSave={handleQuickAdd}
                onCancel={() => setView('select')}
                saving={saving}
              />
            )}
          </div>

          {/* Footer hint */}
          {view === 'select' && (
            <div className="px-4 pb-4">
              <p className="text-xs text-gray-400 text-center">
                Tip: Manage your full aircraft inventory in{' '}
                <span className="font-medium">Libraries → Aircraft</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
