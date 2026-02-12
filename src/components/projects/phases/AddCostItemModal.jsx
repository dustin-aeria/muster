/**
 * AddCostItemModal.jsx
 * Modal for adding cost items to tasks with resource picker
 * Auto-populates description and rates from Services library
 *
 * @location src/components/projects/phases/AddCostItemModal.jsx
 */

import { useState, useEffect } from 'react'
import { X, Search, Users, Settings, Wrench, Truck, DollarSign, Loader2, FileText, Percent } from 'lucide-react'
import { getOperators, getServices, getEquipment } from '../../../lib/firestore'
import { useOrganization } from '../../../hooks/useOrganization'
import { formatCurrency, calculateCostItemTotal } from '../../../lib/costEstimator'
import { COST_ITEM_TYPES, createCostItem, COST_ITEM_MODIFIER_PRESETS, generateId } from './phaseConstants'

const TABS = [
  { id: 'service', label: 'Services', icon: Settings },
  { id: 'personnel', label: 'Personnel', icon: Users },
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
  const { organizationId } = useOrganization()
  const [activeTab, setActiveTab] = useState('service')
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
  const [description, setDescription] = useState('')
  const [customName, setCustomName] = useState('')
  const [fixedName, setFixedName] = useState('')
  const [fixedAmount, setFixedAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [modifiers, setModifiers] = useState([])

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
    setDescription('')
    setCustomName('')
    setNotes('')
    setModifiers([])
    setRateType(activeTab === 'fleet' ? 'daily' : 'hourly')
  }, [activeTab])

  // Auto-populate description when resource is selected
  useEffect(() => {
    if (selectedResource) {
      setDescription(selectedResource.description || '')
      setCustomName(selectedResource.name || '')
    }
  }, [selectedResource])

  const loadResources = async () => {
    if (!organizationId) return
    setLoading(true)
    try {
      const [operators, services, equipment] = await Promise.all([
        getOperators(organizationId),
        getServices(organizationId),
        getEquipment(organizationId)
      ])

      // Filter equipment for fleet (vehicles category)
      const fleet = equipment.filter(e => e.category === 'vehicles')
      const otherEquipment = equipment.filter(e => e.category !== 'vehicles')

      setResources({
        personnel: operators.map(o => ({
          id: o.id,
          name: `${o.firstName} ${o.lastName}`,
          subtitle: o.role || 'Operator',
          description: o.notes || '',
          hourlyRate: o.hourlyRate || 0,
          dailyRate: o.dailyRate || (o.hourlyRate ? o.hourlyRate * 8 : 0)
        })),
        service: services.map(s => ({
          id: s.id,
          name: s.name,
          subtitle: s.category || 'Service',
          description: s.description || '',
          hourlyRate: s.hourlyRate || 0,
          dailyRate: s.dailyRate || (s.hourlyRate ? s.hourlyRate * 8 : 0),
          unit: s.unit || 'hour'
        })),
        equipment: otherEquipment.map(e => ({
          id: e.id,
          name: e.name,
          subtitle: e.category || 'Equipment',
          description: e.notes || '',
          hourlyRate: e.hourlyRate || 0,
          dailyRate: e.dailyRate || (e.hourlyRate ? e.hourlyRate * 8 : 0)
        })),
        fleet: fleet.map(f => ({
          id: f.id,
          name: f.name,
          subtitle: f.model || 'Vehicle',
          description: f.notes || '',
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
      (r.subtitle && r.subtitle.toLowerCase().includes(query)) ||
      (r.description && r.description.toLowerCase().includes(query))
    )
  }

  const getRate = () => {
    if (customRate) return parseFloat(customRate) || 0
    if (!selectedResource) return 0
    return rateType === 'daily'
      ? selectedResource.dailyRate
      : selectedResource.hourlyRate
  }

  const getBaseTotal = () => {
    if (activeTab === 'fixed') {
      return parseFloat(fixedAmount) || 0
    }
    const rate = getRate()
    const qty = parseFloat(hours) || 0
    return calculateCostItemTotal(qty, rate, rateType)
  }

  const getTotal = () => {
    let total = getBaseTotal()
    // Apply modifiers (multiplicative)
    if (modifiers.length > 0) {
      let multiplier = 1
      for (const mod of modifiers) {
        multiplier *= (mod.multiplier || 1)
      }
      total *= multiplier
    }
    return total
  }

  // Modifier management functions
  const addModifier = (preset = null) => {
    const newModifier = preset
      ? { id: generateId(), name: preset.name, multiplier: preset.multiplier }
      : { id: generateId(), name: '', multiplier: 1.0 }
    setModifiers(prev => [...prev, newModifier])
  }

  const updateModifier = (id, field, value) => {
    setModifiers(prev => prev.map(m =>
      m.id === id ? { ...m, [field]: value } : m
    ))
  }

  const removeModifier = (id) => {
    setModifiers(prev => prev.filter(m => m.id !== id))
  }

  const handleSubmit = () => {
    if (activeTab === 'fixed') {
      if (!fixedName.trim() || !fixedAmount) {
        alert('Please enter a name and amount')
        return
      }

      // Calculate fixed total with modifiers
      let fixedTotal = parseFloat(fixedAmount) || 0
      if (modifiers.length > 0) {
        let multiplier = 1
        for (const mod of modifiers) {
          multiplier *= (mod.multiplier || 1)
        }
        fixedTotal *= multiplier
      }

      const costItem = createCostItem({
        type: 'fixed',
        referenceId: '',
        referenceName: fixedName.trim(),
        description: description.trim(),
        hours: 0,
        rate: parseFloat(fixedAmount) || 0,
        rateType: 'fixed',
        total: fixedTotal,
        notes: notes.trim(),
        modifiers: modifiers
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
      referenceName: customName.trim() || selectedResource.name,
      description: description.trim(),
      hours: parseFloat(hours) || 0,
      rate,
      rateType,
      total,
      notes: notes.trim(),
      modifiers: modifiers
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
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-auto z-10 max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
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
          <div className="flex border-b border-gray-200 flex-shrink-0">
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
          <div className="p-4 overflow-y-auto flex-1">
            {activeTab === 'fixed' ? (
              /* Fixed Cost Form */
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost Name
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
                    Description (optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add details about this cost..."
                    rows={2}
                    className="input resize-none"
                  />
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
                          className={`w-full flex items-start justify-between p-3 text-left border-b border-gray-100 last:border-b-0 transition-colors ${
                            isSelected ? 'bg-aeria-navy/5' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">{resource.name}</p>
                            <p className="text-sm text-gray-500">{resource.subtitle}</p>
                            {resource.description && (
                              <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                {resource.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0 ml-3">
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
                    {/* Editable Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Display Name
                        <span className="ml-1 text-xs text-gray-400 font-normal">(editable)</span>
                      </label>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder={selectedResource.name}
                        className="input"
                      />
                    </div>

                    {/* Editable Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          Description
                        </span>
                        <span className="ml-1 text-xs text-gray-400 font-normal">(auto-populated, editable)</span>
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add or edit description..."
                        rows={2}
                        className="input resize-none"
                      />
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
                          Rate
                          <span className="ml-1 text-xs text-gray-400 font-normal">(override)</span>
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

            {/* Price Adjustments / Modifiers */}
            {(selectedResource || (activeTab === 'fixed' && fixedAmount)) && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Percent className="w-4 h-4" />
                    Price Adjustments
                  </label>
                  <button
                    type="button"
                    onClick={() => addModifier()}
                    className="text-xs text-aeria-navy hover:underline"
                  >
                    + Add Custom
                  </button>
                </div>

                {/* Quick add preset modifiers */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {COST_ITEM_MODIFIER_PRESETS
                    .filter(preset => !modifiers.some(m => m.name === preset.name))
                    .slice(0, 6)
                    .map(preset => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => addModifier(preset)}
                        className="px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-gray-100 transition-colors"
                      >
                        + {preset.name} ({preset.multiplier > 1 ? '+' : ''}{((preset.multiplier - 1) * 100).toFixed(0)}%)
                      </button>
                    ))}
                </div>

                {/* Active modifiers */}
                {modifiers.length > 0 ? (
                  <div className="space-y-2">
                    {modifiers.map(m => (
                      <div key={m.id} className="flex items-center gap-2 bg-white p-2 rounded border border-gray-200">
                        <input
                          type="text"
                          value={m.name}
                          onChange={(e) => updateModifier(m.id, 'name', e.target.value)}
                          className="input flex-1 text-sm"
                          placeholder="Adjustment name"
                        />
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={m.multiplier || ''}
                            onChange={(e) => updateModifier(m.id, 'multiplier', parseFloat(e.target.value) || 1)}
                            className="input w-20 text-sm text-center"
                            placeholder="1.0"
                            step="0.05"
                            min="0.1"
                            max="3"
                          />
                          <span className="text-xs text-gray-500">x</span>
                        </div>
                        <span className={`text-xs w-14 text-right ${
                          m.multiplier > 1 ? 'text-red-600' : m.multiplier < 1 ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {m.multiplier > 1 ? `+${((m.multiplier - 1) * 100).toFixed(0)}%` :
                           m.multiplier < 1 ? `${((m.multiplier - 1) * 100).toFixed(0)}%` : '—'}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeModifier(m.id)}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No adjustments. Add rush fees, discounts, etc.</p>
                )}
              </div>
            )}

            {/* Total Display */}
            {(selectedResource || (activeTab === 'fixed' && fixedAmount)) && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-gray-600">Calculated Total:</span>
                    {modifiers.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Base: {formatCurrency(getBaseTotal())}
                        {modifiers.map(m => ` × ${m.multiplier}`).join('')}
                      </p>
                    )}
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    {formatCurrency(getTotal())}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-4 border-t border-gray-200 flex-shrink-0">
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
