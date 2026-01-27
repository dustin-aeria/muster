/**
 * AddCostItemModal.jsx
 * Modal for adding cost items to tasks with resource picker
 *
 * @location src/components/projects/phases/AddCostItemModal.jsx
 */

import { useState, useEffect } from 'react'
import { X, Search, Users, Settings, Wrench, Truck, DollarSign, Loader2 } from 'lucide-react'
import { getOperators, getServices, getEquipment } from '../../../lib/firestore'
import { formatCurrency, calculateCostItemTotal } from '../../../lib/costEstimator'
import { COST_ITEM_TYPES, createCostItem } from './phaseConstants'

const TABS = [
  { id: 'personnel', label: 'Personnel', icon: Users },
  { id: 'service', label: 'Services', icon: Settings },
  { id: 'equipment', label: 'Equipment', icon: Wrench },
  { id: 'fleet', label: 'Fleet', icon: Truck },
  { id: 'fixed', label: 'Fixed Cost', icon: DollarSign }
]

export default function AddCostItemModal({
  isOpen,
  onClose,
  onSave,
  taskName = ''
}) {
  const [activeTab, setActiveTab] = useState('personnel')
  const [searchQuery, setSearchQuery] = useState('')
  const [resources, setResources] = useState({
    personnel: [],
    service: [],
    equipment: [],
    fleet: []
  })
  const [loading, setLoading] = useState(false)
  const [selectedResource, setSelectedResource] = useState(null)
  const [hours, setHours] = useState('')
  const [customRate, setCustomRate] = useState('')
  const [rateType, setRateType] = useState('hourly')
  const [fixedName, setFixedName] = useState('')
  const [fixedAmount, setFixedAmount] = useState('')
  const [notes, setNotes] = useState('')

  // Load resources when modal opens
  useEffect(() => {
    if (isOpen) {
      loadResources()
    }
  }, [isOpen])

  // Reset form when tab changes
  useEffect(() => {
    setSelectedResource(null)
    setHours('')
    setCustomRate('')
    setSearchQuery('')
    setNotes('')
    setRateType(activeTab === 'fleet' ? 'daily' : 'hourly')
  }, [activeTab])

  const loadResources = async () => {
    setLoading(true)
    try {
      const [operators, services, equipment] = await Promise.all([
        getOperators(),
        getServices(),
        getEquipment()
      ])

      // Filter equipment for fleet (vehicles category)
      const fleet = equipment.filter(e => e.category === 'vehicles')
      const otherEquipment = equipment.filter(e => e.category !== 'vehicles')

      setResources({
        personnel: operators.map(o => ({
          id: o.id,
          name: `${o.firstName} ${o.lastName}`,
          subtitle: o.role || 'Operator',
          hourlyRate: o.hourlyRate || 0,
          dailyRate: o.dailyRate || (o.hourlyRate ? o.hourlyRate * 8 : 0)
        })),
        service: services.map(s => ({
          id: s.id,
          name: s.name,
          subtitle: s.category || 'Service',
          hourlyRate: s.hourlyRate || 0,
          dailyRate: s.dailyRate || (s.hourlyRate ? s.hourlyRate * 8 : 0)
        })),
        equipment: otherEquipment.map(e => ({
          id: e.id,
          name: e.name,
          subtitle: e.category || 'Equipment',
          hourlyRate: e.hourlyRate || 0,
          dailyRate: e.dailyRate || (e.hourlyRate ? e.hourlyRate * 8 : 0)
        })),
        fleet: fleet.map(f => ({
          id: f.id,
          name: f.name,
          subtitle: f.model || 'Vehicle',
          hourlyRate: f.hourlyRate || 0,
          dailyRate: f.dailyRate || 0
        }))
      })
    } catch (error) {
      console.error('Failed to load resources:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredResources = () => {
    const list = resources[activeTab] || []
    if (!searchQuery) return list

    const query = searchQuery.toLowerCase()
    return list.filter(r =>
      r.name.toLowerCase().includes(query) ||
      (r.subtitle && r.subtitle.toLowerCase().includes(query))
    )
  }

  const getRate = () => {
    if (customRate) return parseFloat(customRate) || 0
    if (!selectedResource) return 0
    return rateType === 'daily'
      ? selectedResource.dailyRate
      : selectedResource.hourlyRate
  }

  const getTotal = () => {
    if (activeTab === 'fixed') {
      return parseFloat(fixedAmount) || 0
    }
    const rate = getRate()
    const qty = parseFloat(hours) || 0
    return calculateCostItemTotal(qty, rate, rateType)
  }

  const handleSubmit = () => {
    if (activeTab === 'fixed') {
      if (!fixedName.trim() || !fixedAmount) {
        alert('Please enter a name and amount')
        return
      }

      const costItem = createCostItem({
        type: 'fixed',
        referenceId: '',
        referenceName: fixedName.trim(),
        hours: 0,
        rate: parseFloat(fixedAmount) || 0,
        rateType: 'fixed',
        total: parseFloat(fixedAmount) || 0,
        notes: notes.trim()
      })

      onSave(costItem)
      onClose()
      return
    }

    if (!selectedResource || !hours) {
      alert('Please select a resource and enter hours/quantity')
      return
    }

    const rate = getRate()
    const total = getTotal()

    const costItem = createCostItem({
      type: activeTab,
      referenceId: selectedResource.id,
      referenceName: selectedResource.name,
      hours: parseFloat(hours) || 0,
      rate,
      rateType,
      total,
      notes: notes.trim()
    })

    onSave(costItem)
    onClose()
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
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-auto z-10">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Add Cost Item</h2>
              {taskName && (
                <p className="text-sm text-gray-500">To: {taskName}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {TABS.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? 'border-aeria-navy text-aeria-navy'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Content */}
          <div className="p-4">
            {activeTab === 'fixed' ? (
              /* Fixed Cost Form */
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost Description
                  </label>
                  <input
                    type="text"
                    value={fixedName}
                    onChange={(e) => setFixedName(e.target.value)}
                    placeholder="e.g., Permit fee, Travel expenses"
                    className="input"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={fixedAmount}
                      onChange={(e) => setFixedAmount(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="input pl-7"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes"
                    className="input"
                  />
                </div>
              </div>
            ) : (
              /* Resource Picker */
              <>
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${TABS.find(t => t.id === activeTab)?.label?.toLowerCase()}...`}
                    className="input pl-10"
                  />
                </div>

                {/* Resource List */}
                <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto mb-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : getFilteredResources().length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No {TABS.find(t => t.id === activeTab)?.label?.toLowerCase()} found
                    </div>
                  ) : (
                    getFilteredResources().map(resource => {
                      const isSelected = selectedResource?.id === resource.id
                      const rate = rateType === 'daily' ? resource.dailyRate : resource.hourlyRate

                      return (
                        <button
                          key={resource.id}
                          onClick={() => setSelectedResource(resource)}
                          className={`w-full flex items-center justify-between p-3 text-left border-b border-gray-100 last:border-b-0 transition-colors ${
                            isSelected ? 'bg-aeria-navy/5' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div>
                            <p className="font-medium text-gray-900">{resource.name}</p>
                            <p className="text-sm text-gray-500">{resource.subtitle}</p>
                          </div>
                          <div className="text-right">
                            {rate > 0 ? (
                              <p className="text-sm font-medium text-gray-700">
                                {formatCurrency(rate)}/{rateType === 'daily' ? 'day' : 'hr'}
                              </p>
                            ) : (
                              <p className="text-sm text-gray-400">No rate set</p>
                            )}
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>

                {/* Selected Resource Config */}
                {selectedResource && (
                  <div className="space-y-4 border-t border-gray-200 pt-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium text-gray-900">{selectedResource.name}</p>
                      <p className="text-sm text-gray-500">{selectedResource.subtitle}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Rate Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rate Type
                        </label>
                        <select
                          value={rateType}
                          onChange={(e) => setRateType(e.target.value)}
                          className="input"
                        >
                          <option value="hourly">Hourly</option>
                          <option value="daily">Daily</option>
                        </select>
                      </div>

                      {/* Hours/Days */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {rateType === 'daily' ? 'Days' : 'Hours'}
                        </label>
                        <input
                          type="number"
                          value={hours}
                          onChange={(e) => setHours(e.target.value)}
                          placeholder="0"
                          min="0"
                          step="0.5"
                          className="input"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Rate */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rate (override)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                          <input
                            type="number"
                            value={customRate}
                            onChange={(e) => setCustomRate(e.target.value)}
                            placeholder={getRate().toFixed(2)}
                            min="0"
                            step="0.01"
                            className="input pl-7"
                          />
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes
                        </label>
                        <input
                          type="text"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Optional"
                          className="input"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Total Display */}
            {(selectedResource || (activeTab === 'fixed' && fixedAmount)) && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                <span className="text-gray-600">Calculated Total:</span>
                <span className="text-xl font-bold text-gray-900">
                  {formatCurrency(getTotal())}
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={activeTab !== 'fixed' && (!selectedResource || !hours)}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Cost Item
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
