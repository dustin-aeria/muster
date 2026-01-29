/**
 * ProjectServicesSection.jsx
 * Project services selection and customization for Project Overview
 *
 * Supports flexible pricing models:
 * - Time-based (hourly/daily/weekly)
 * - Per-unit (acre, mile, structure, etc.) with volume tiers
 * - Fixed fee
 * - Deliverable add-ons
 * - Modifiers/multipliers
 *
 * @location src/components/projects/ProjectServicesSection.jsx
 */

import { useState, useEffect } from 'react'
import {
  Briefcase,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  FileText,
  Loader2,
  Check,
  AlertCircle,
  Layers,
  Package,
  Percent,
  TrendingDown
} from 'lucide-react'
import { getServices } from '../../lib/firestore'
import { formatCurrency } from '../../lib/costEstimator'
import { PRICING_TYPES, UNIT_TYPES } from '../../pages/Services'

// Service categories for display
const SERVICE_CATEGORIES = {
  aerial_survey: 'Aerial Survey & Mapping',
  inspection: 'Infrastructure Inspection',
  photography: 'Photography & Videography',
  lidar: 'LiDAR Scanning',
  thermal: 'Thermal Imaging',
  agriculture: 'Agricultural Services',
  construction: 'Construction Monitoring',
  environmental: 'Environmental Assessment',
  emergency: 'Emergency Response',
  training: 'Training & Consultation',
  data_processing: 'Data Processing',
  other: 'Other'
}

// Legacy rate type options (for backwards compatibility)
const RATE_TYPE_OPTIONS = {
  hourly: { label: 'Hours', rateField: 'hourlyRate', unitLabel: 'hr' },
  daily: { label: 'Days', rateField: 'dailyRate', unitLabel: 'day' },
  weekly: { label: 'Weeks', rateField: 'weeklyRate', unitLabel: 'wk' },
  fixed: { label: 'Fixed', rateField: 'fixedRate', unitLabel: 'fixed' }
}

// Calculate service cost with new pricing model
export function calculateServiceCost(service) {
  const pricingType = service.pricingType || 'time_based'
  let baseCost = 0

  // Calculate base cost based on pricing type
  if (pricingType === 'fixed') {
    baseCost = service.fixedRate || 0
  } else if (pricingType === 'per_unit') {
    const quantity = parseFloat(service.quantity) || 0
    const unitRate = service.unitRate || 0

    // Check for volume tier pricing
    if (service.volumeTiers?.length > 0 && quantity > 0) {
      // Sort tiers by upTo value
      const sortedTiers = [...service.volumeTiers].sort((a, b) => (a.upTo || Infinity) - (b.upTo || Infinity))
      let remainingQty = quantity
      let tierCost = 0

      for (const tier of sortedTiers) {
        const tierMax = tier.upTo || Infinity
        const prevMax = sortedTiers[sortedTiers.indexOf(tier) - 1]?.upTo || 0
        const tierQty = Math.min(remainingQty, tierMax - prevMax)

        if (tierQty > 0) {
          tierCost += tierQty * (tier.rate || 0)
          remainingQty -= tierQty
        }
        if (remainingQty <= 0) break
      }
      baseCost = tierCost
    } else {
      baseCost = quantity * unitRate
    }
  } else {
    // time_based - legacy calculation
    const rateType = service.rateType || 'daily'
    const rateConfig = RATE_TYPE_OPTIONS[rateType]
    const rate = service[rateConfig?.rateField] || 0
    const quantity = parseFloat(service.quantity) || 0

    if (rateType === 'fixed') {
      baseCost = rate
    } else {
      baseCost = quantity * rate
    }
  }

  // Add base/mobilization fee
  baseCost += service.baseFee || 0

  // Add selected deliverables
  const selectedDeliverables = service.selectedDeliverables || []
  const deliverablesCost = selectedDeliverables.reduce((sum, dId) => {
    const d = service.deliverables?.find(del => del.id === dId)
    if (d && !d.included) {
      return sum + (d.price || 0)
    }
    return sum
  }, 0)
  baseCost += deliverablesCost

  // Apply modifiers (multipliers)
  const selectedModifiers = service.selectedModifiers || []
  let totalMultiplier = 1
  for (const mId of selectedModifiers) {
    const m = service.modifiers?.find(mod => mod.id === mId)
    if (m) {
      totalMultiplier *= (m.multiplier || 1)
    }
  }
  baseCost *= totalMultiplier

  // Apply minimum charge
  if (service.minimumCharge && baseCost > 0 && baseCost < service.minimumCharge) {
    baseCost = service.minimumCharge
  }

  return baseCost
}

// Generate unique ID
function generateId() {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// ============================================
// ADD SERVICE MODAL
// ============================================

function AddServiceModal({ isOpen, onClose, onAdd, existingServiceIds = [] }) {
  const [activeTab, setActiveTab] = useState('library')
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedService, setSelectedService] = useState(null)

  // Custom service form
  const [customForm, setCustomForm] = useState({
    name: '',
    category: 'other',
    description: '',
    estimatedHours: '',
    hourlyRate: '',
    dailyRate: ''
  })

  useEffect(() => {
    if (isOpen) {
      loadServices()
      setSelectedService(null)
      setCustomForm({
        name: '',
        category: 'other',
        description: '',
        estimatedHours: '',
        hourlyRate: '',
        dailyRate: ''
      })
    }
  }, [isOpen])

  const loadServices = async () => {
    setLoading(true)
    try {
      const data = await getServices()
      setServices(data.filter(s => s.status === 'active'))
    } catch (error) {
      console.error('Failed to load services:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredServices = services.filter(s => {
    if (existingServiceIds.includes(s.id)) return false
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      s.name?.toLowerCase().includes(query) ||
      s.description?.toLowerCase().includes(query) ||
      SERVICE_CATEGORIES[s.category]?.toLowerCase().includes(query)
    )
  })

  const handleAddFromLibrary = () => {
    if (!selectedService) return

    const pricingType = selectedService.pricingType || 'time_based'

    // Auto-detect best rate type based on what's available (for time_based)
    let rateType = 'daily'
    let quantity = ''

    if (pricingType === 'time_based') {
      if (selectedService.fixedRate > 0) {
        rateType = 'fixed'
        quantity = ''
      } else if (selectedService.dailyRate > 0) {
        rateType = 'daily'
        quantity = '1'
      } else if (selectedService.hourlyRate > 0) {
        rateType = 'hourly'
        quantity = '1'
      } else if (selectedService.weeklyRate > 0) {
        rateType = 'weekly'
        quantity = '1'
      }
    } else if (pricingType === 'per_unit') {
      quantity = '' // User needs to enter quantity
    }

    // Include deliverables that are marked as "included" by default
    const defaultDeliverables = (selectedService.deliverables || [])
      .filter(d => d.included)
      .map(d => d.id)

    const projectService = {
      id: generateId(),
      sourceId: selectedService.id,
      sourceType: 'library',
      name: selectedService.name,
      category: selectedService.category,
      description: selectedService.description || '',
      // Pricing type
      pricingType,
      rateType,
      quantity,
      // Time-based rates
      hourlyRate: selectedService.hourlyRate || 0,
      dailyRate: selectedService.dailyRate || 0,
      weeklyRate: selectedService.weeklyRate || 0,
      fixedRate: selectedService.fixedRate || 0,
      // Per-unit pricing
      unitType: selectedService.unitType || 'acre',
      unitRate: selectedService.unitRate || 0,
      // Volume tiers
      volumeTiers: selectedService.volumeTiers || [],
      // Base fee & minimum
      baseFee: selectedService.baseFee || 0,
      minimumCharge: selectedService.minimumCharge || 0,
      // Deliverables
      deliverables: selectedService.deliverables || [],
      selectedDeliverables: defaultDeliverables,
      // Modifiers
      modifiers: selectedService.modifiers || [],
      selectedModifiers: [],
      notes: ''
    }

    onAdd(projectService)
    onClose()
  }

  const handleAddCustom = () => {
    if (!customForm.name.trim()) {
      alert('Please enter a service name')
      return
    }

    const hourlyRate = customForm.hourlyRate ? parseFloat(customForm.hourlyRate) : 0
    const dailyRate = customForm.dailyRate ? parseFloat(customForm.dailyRate) : 0

    // Auto-detect best rate type
    let rateType = 'daily'
    let quantity = ''

    if (dailyRate > 0) {
      rateType = 'daily'
      quantity = '1'
    } else if (hourlyRate > 0) {
      rateType = 'hourly'
      quantity = customForm.estimatedHours || '1'
    }

    const projectService = {
      id: generateId(),
      sourceId: null,
      sourceType: 'custom',
      name: customForm.name.trim(),
      category: customForm.category,
      description: customForm.description.trim(),
      rateType,
      quantity,
      hourlyRate,
      dailyRate,
      weeklyRate: 0,
      fixedRate: 0,
      notes: ''
    }

    onAdd(projectService)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />

        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-auto z-10 max-h-[85vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Add Service
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 flex-shrink-0">
            <button
              onClick={() => setActiveTab('library')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'library'
                  ? 'border-aeria-navy text-aeria-navy'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              From Library
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'custom'
                  ? 'border-aeria-navy text-aeria-navy'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Custom Service
            </button>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto flex-1">
            {activeTab === 'library' ? (
              <>
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search services..."
                    className="input pl-10"
                  />
                </div>

                {/* Services List */}
                <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : filteredServices.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {services.length === 0 ? 'No services in library' : 'No matching services'}
                    </div>
                  ) : (
                    filteredServices.map(service => {
                      const isSelected = selectedService?.id === service.id
                      return (
                        <button
                          key={service.id}
                          onClick={() => setSelectedService(service)}
                          className={`w-full p-3 text-left border-b border-gray-100 last:border-b-0 transition-colors ${
                            isSelected ? 'bg-aeria-navy/5 ring-1 ring-inset ring-aeria-navy' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900">{service.name}</p>
                              <p className="text-sm text-gray-500">
                                {SERVICE_CATEGORIES[service.category] || service.category}
                              </p>
                              {service.description && (
                                <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                  {service.description}
                                </p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0 ml-3">
                              {service.hourlyRate > 0 && (
                                <p className="text-sm font-medium text-gray-700">
                                  {formatCurrency(service.hourlyRate)}/hr
                                </p>
                              )}
                              {isSelected && (
                                <Check className="w-5 h-5 text-aeria-navy mt-1 ml-auto" />
                              )}
                            </div>
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>

                {/* Selected Preview */}
                {selectedService && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Selected:</p>
                    <p className="font-medium text-gray-900">{selectedService.name}</p>
                    {selectedService.description && (
                      <p className="text-sm text-gray-600 mt-1">{selectedService.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      You can customize all fields after adding
                    </p>
                  </div>
                )}
              </>
            ) : (
              /* Custom Service Form */
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customForm.name}
                    onChange={(e) => setCustomForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter service name"
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={customForm.category}
                    onChange={(e) => setCustomForm(prev => ({ ...prev, category: e.target.value }))}
                    className="input"
                  >
                    {Object.entries(SERVICE_CATEGORIES).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={customForm.description}
                    onChange={(e) => setCustomForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the service..."
                    rows={3}
                    className="input resize-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Est. Hours
                    </label>
                    <input
                      type="number"
                      value={customForm.estimatedHours}
                      onChange={(e) => setCustomForm(prev => ({ ...prev, estimatedHours: e.target.value }))}
                      placeholder="0"
                      min="0"
                      step="0.5"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hourly Rate
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="number"
                        value={customForm.hourlyRate}
                        onChange={(e) => setCustomForm(prev => ({ ...prev, hourlyRate: e.target.value }))}
                        placeholder="0"
                        min="0"
                        className="input pl-7"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Daily Rate
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="number"
                        value={customForm.dailyRate}
                        onChange={(e) => setCustomForm(prev => ({ ...prev, dailyRate: e.target.value }))}
                        placeholder="0"
                        min="0"
                        className="input pl-7"
                      />
                    </div>
                  </div>
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
              onClick={activeTab === 'library' ? handleAddFromLibrary : handleAddCustom}
              disabled={activeTab === 'library' ? !selectedService : !customForm.name.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Service
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// SERVICE CARD
// ============================================

function ServiceCard({ service, onUpdate, onDelete, isExpanded, onToggle }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState(service)

  useEffect(() => {
    setEditForm(service)
  }, [service])

  const handleSave = () => {
    onUpdate(service.id, {
      ...editForm,
      quantity: editForm.quantity ? parseFloat(editForm.quantity) : '',
      hourlyRate: editForm.hourlyRate ? parseFloat(editForm.hourlyRate) : 0,
      dailyRate: editForm.dailyRate ? parseFloat(editForm.dailyRate) : 0,
      weeklyRate: editForm.weeklyRate ? parseFloat(editForm.weeklyRate) : 0,
      fixedRate: editForm.fixedRate ? parseFloat(editForm.fixedRate) : 0,
      unitRate: editForm.unitRate ? parseFloat(editForm.unitRate) : 0,
      baseFee: editForm.baseFee ? parseFloat(editForm.baseFee) : 0
    })
    setIsEditing(false)
  }

  // Toggle deliverable selection
  const toggleDeliverable = (deliverableId) => {
    const currentSelected = editForm.selectedDeliverables || []
    const newSelected = currentSelected.includes(deliverableId)
      ? currentSelected.filter(id => id !== deliverableId)
      : [...currentSelected, deliverableId]
    setEditForm(prev => ({ ...prev, selectedDeliverables: newSelected }))
  }

  // Toggle modifier selection
  const toggleModifier = (modifierId) => {
    const currentSelected = editForm.selectedModifiers || []
    const newSelected = currentSelected.includes(modifierId)
      ? currentSelected.filter(id => id !== modifierId)
      : [...currentSelected, modifierId]
    setEditForm(prev => ({ ...prev, selectedModifiers: newSelected }))
  }

  // Calculate cost using new function
  const estimatedCost = calculateServiceCost(service)
  const pricingType = service.pricingType || 'time_based'
  const unitTypeInfo = UNIT_TYPES?.find(u => u.value === service.unitType)

  // Legacy calculation for display
  const rateType = service.rateType || 'daily'
  const rateConfig = RATE_TYPE_OPTIONS[rateType]
  const rate = service[rateConfig?.rateField] || 0
  const quantity = parseFloat(service.quantity) || 0

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
        onClick={() => !isEditing && onToggle()}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
            service.sourceType === 'library' ? 'bg-blue-500' : 'bg-purple-500'
          }`} />
          <div className="min-w-0">
            <p className="font-medium text-gray-900 truncate">{service.name}</p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500">
                {SERVICE_CATEGORIES[service.category] || service.category}
              </p>
              {/* Pricing type badge */}
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                pricingType === 'time_based' ? 'bg-blue-100 text-blue-700' :
                pricingType === 'per_unit' ? 'bg-purple-100 text-purple-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {pricingType === 'time_based' ? 'Time' :
                 pricingType === 'per_unit' ? unitTypeInfo?.label?.replace('Per ', '') || 'Unit' :
                 'Fixed'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Quantity display */}
          {pricingType === 'per_unit' && quantity > 0 && (
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              {quantity} {unitTypeInfo?.plural || 'units'}
            </span>
          )}
          {pricingType === 'time_based' && quantity > 0 && (
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {quantity} {rateConfig?.label?.toLowerCase() || 'days'}
            </span>
          )}
          {estimatedCost > 0 && (
            <span className="text-sm font-medium text-gray-900">
              {formatCurrency(estimatedCost)}
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-4">
          {isEditing ? (
            /* Edit Form - Enhanced */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                    className="input"
                  >
                    {Object.entries(SERVICE_CATEGORIES).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quantity Input - based on pricing type */}
              {editForm.pricingType === 'per_unit' && (
                <div className="p-3 bg-purple-50 rounded-lg">
                  <label className="block text-xs font-medium text-purple-800 mb-2">
                    Quantity ({UNIT_TYPES?.find(u => u.value === editForm.unitType)?.plural || 'units'})
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={editForm.quantity || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, quantity: e.target.value }))}
                      min="0"
                      step="0.1"
                      className="input w-32"
                      placeholder="Enter quantity"
                    />
                    <span className="text-sm text-purple-700">
                      × ${editForm.unitRate || 0}/{UNIT_TYPES?.find(u => u.value === editForm.unitType)?.plural || 'unit'}
                    </span>
                    {editForm.volumeTiers?.length > 0 && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        Volume pricing applied
                      </span>
                    )}
                  </div>
                  {/* Show volume tiers if they exist */}
                  {editForm.volumeTiers?.length > 0 && (
                    <div className="mt-2 text-xs text-purple-600">
                      <TrendingDown className="w-3 h-3 inline mr-1" />
                      Volume tiers: {editForm.volumeTiers.map((t, i) => (
                        <span key={t.id}>
                          {i > 0 && ' → '}
                          {t.upTo ? `≤${t.upTo}` : '∞'}: ${t.rate}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {editForm.pricingType === 'time_based' && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-blue-800 mb-1">Rate Type</label>
                      <select
                        value={editForm.rateType || 'daily'}
                        onChange={(e) => setEditForm(prev => ({ ...prev, rateType: e.target.value }))}
                        className="input"
                      >
                        {Object.entries(RATE_TYPE_OPTIONS).map(([key, config]) => (
                          <option key={key} value={key}>{config.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-blue-800 mb-1">
                        {editForm.rateType === 'fixed' ? 'Fixed' : `Number of ${RATE_TYPE_OPTIONS[editForm.rateType || 'daily']?.label || 'Days'}`}
                      </label>
                      <input
                        type="number"
                        value={editForm.quantity || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, quantity: e.target.value }))}
                        min="0"
                        step="0.5"
                        className="input"
                        placeholder="0"
                        disabled={editForm.rateType === 'fixed'}
                      />
                    </div>
                  </div>
                </div>
              )}

              {editForm.pricingType === 'fixed' && (
                <div className="p-3 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-800">
                    Fixed price service: {formatCurrency(editForm.fixedRate || 0)}
                  </p>
                </div>
              )}

              {/* Deliverables Selection */}
              {editForm.deliverables?.length > 0 && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <label className="block text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    Deliverables
                  </label>
                  <div className="space-y-2">
                    {editForm.deliverables.map(d => {
                      const isSelected = (editForm.selectedDeliverables || []).includes(d.id)
                      return (
                        <label
                          key={d.id}
                          className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                            isSelected ? 'bg-white border border-aeria-navy/30' : 'hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleDeliverable(d.id)}
                              className="rounded border-gray-300 text-aeria-navy focus:ring-aeria-navy"
                            />
                            <span className="text-sm">{d.name}</span>
                            {d.included && (
                              <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                                Included
                              </span>
                            )}
                          </div>
                          {!d.included && d.price > 0 && (
                            <span className="text-sm text-gray-600">+{formatCurrency(d.price)}</span>
                          )}
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Modifiers Selection */}
              {editForm.modifiers?.length > 0 && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <label className="block text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Percent className="w-3 h-3" />
                    Price Adjustments
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {editForm.modifiers.map(m => {
                      const isSelected = (editForm.selectedModifiers || []).includes(m.id)
                      const percentChange = ((m.multiplier - 1) * 100).toFixed(0)
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => toggleModifier(m.id)}
                          className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                            isSelected
                              ? 'bg-aeria-navy text-white border-aeria-navy'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {m.name}
                          <span className={`ml-1 ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                            {m.multiplier > 1 ? `+${percentChange}%` : `${percentChange}%`}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Project Notes</label>
                <textarea
                  value={editForm.notes || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Notes specific to this project..."
                  rows={2}
                  className="input resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setEditForm(service)
                    setIsEditing(false)
                  }}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-3 py-1.5 text-sm bg-aeria-navy text-white rounded hover:bg-aeria-navy/90"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            /* View Mode - Enhanced */
            <>
              {service.description && (
                <p className="text-sm text-gray-600 mb-3">{service.description}</p>
              )}

              {/* Cost Calculation Summary - Enhanced */}
              {estimatedCost > 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Cost Breakdown</span>
                    </div>
                    <span className="font-semibold text-green-900">{formatCurrency(estimatedCost)}</span>
                  </div>
                  <div className="text-xs text-green-700 space-y-1">
                    {pricingType === 'fixed' && (
                      <p>Fixed price: {formatCurrency(service.fixedRate || 0)}</p>
                    )}
                    {pricingType === 'per_unit' && quantity > 0 && (
                      <p>{quantity} {unitTypeInfo?.plural || 'units'} × ${service.unitRate || 0}/{unitTypeInfo?.plural || 'unit'}</p>
                    )}
                    {pricingType === 'time_based' && quantity > 0 && (
                      <p>{quantity} {rateConfig?.label?.toLowerCase() || 'days'} × {formatCurrency(rate)}/{rateConfig?.unitLabel || 'day'}</p>
                    )}
                    {service.baseFee > 0 && (
                      <p>+ Base fee: {formatCurrency(service.baseFee)}</p>
                    )}
                    {(service.selectedDeliverables || []).length > 0 && (
                      <p>
                        + Deliverables: {service.selectedDeliverables
                          .map(dId => service.deliverables?.find(d => d.id === dId))
                          .filter(d => d && !d.included && d.price > 0)
                          .map(d => `${d.name} (${formatCurrency(d.price)})`)
                          .join(', ') || 'included items only'}
                      </p>
                    )}
                    {(service.selectedModifiers || []).length > 0 && (
                      <p>
                        × Modifiers: {service.selectedModifiers
                          .map(mId => service.modifiers?.find(m => m.id === mId))
                          .filter(Boolean)
                          .map(m => `${m.name} (${m.multiplier}×)`)
                          .join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Selected Deliverables */}
              {(service.selectedDeliverables || []).length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Deliverables:</p>
                  <div className="flex flex-wrap gap-1">
                    {service.selectedDeliverables.map(dId => {
                      const d = service.deliverables?.find(del => del.id === dId)
                      if (!d) return null
                      return (
                        <span key={dId} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-xs">
                          <Package className="w-3 h-3" />
                          {d.name}
                          {d.included && <Check className="w-3 h-3 text-green-600" />}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Selected Modifiers */}
              {(service.selectedModifiers || []).length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Applied Adjustments:</p>
                  <div className="flex flex-wrap gap-1">
                    {service.selectedModifiers.map(mId => {
                      const m = service.modifiers?.find(mod => mod.id === mId)
                      if (!m) return null
                      return (
                        <span key={mId} className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-xs">
                          <Percent className="w-3 h-3" />
                          {m.name} ({m.multiplier > 1 ? '+' : ''}{((m.multiplier - 1) * 100).toFixed(0)}%)
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {service.notes && (
                <div className="bg-gray-50 rounded p-2 mb-3">
                  <p className="text-xs text-gray-500 mb-1">Project Notes:</p>
                  <p className="text-sm text-gray-700">{service.notes}</p>
                </div>
              )}

              {service.sourceType === 'library' && (
                <p className="text-xs text-gray-400 mb-3">
                  Linked to service library • Changes here don't affect the library
                </p>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <button
                  onClick={() => onDelete(service.id)}
                  className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-aeria-navy hover:text-aeria-navy/80 flex items-center gap-1"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ProjectServicesSection({ project, onUpdate }) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [expandedId, setExpandedId] = useState(null)

  const projectServices = project?.projectServices || []

  const handleAddService = (service) => {
    onUpdate({
      projectServices: [...projectServices, service]
    })
  }

  const handleUpdateService = (serviceId, updates) => {
    onUpdate({
      projectServices: projectServices.map(s =>
        s.id === serviceId ? { ...s, ...updates } : s
      )
    })
  }

  const handleDeleteService = (serviceId) => {
    if (!confirm('Remove this service from the project?')) return
    onUpdate({
      projectServices: projectServices.filter(s => s.id !== serviceId)
    })
    if (expandedId === serviceId) setExpandedId(null)
  }

  // Calculate totals using new pricing model
  const totalEstimatedCost = projectServices.reduce((sum, s) => {
    return sum + calculateServiceCost(s)
  }, 0)

  const servicesWithCost = projectServices.filter(s => {
    return calculateServiceCost(s) > 0
  }).length

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Project Services
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Services to be delivered for this project
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="text-sm text-aeria-navy hover:text-aeria-navy/80 flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </div>

      {/* Services List */}
      {projectServices.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <Briefcase className="w-8 h-8 mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500 text-sm mb-3">No services added yet</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-sm text-aeria-navy hover:underline"
          >
            Add from library or create custom
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {projectServices.map(service => (
            <ServiceCard
              key={service.id}
              service={service}
              onUpdate={handleUpdateService}
              onDelete={handleDeleteService}
              isExpanded={expandedId === service.id}
              onToggle={() => setExpandedId(expandedId === service.id ? null : service.id)}
            />
          ))}
        </div>
      )}

      {/* Summary */}
      {projectServices.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-600">
              <span className="font-medium">{projectServices.length}</span> service{projectServices.length !== 1 ? 's' : ''}
              {servicesWithCost > 0 && (
                <span className="ml-2 text-green-600">
                  ({servicesWithCost} with cost)
                </span>
              )}
            </div>
            {totalEstimatedCost > 0 && (
              <div className="text-right">
                <span className="text-gray-500">Services Total:</span>
                <span className="ml-2 font-semibold text-green-700">
                  {formatCurrency(totalEstimatedCost)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Service Modal */}
      <AddServiceModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddService}
        existingServiceIds={projectServices.filter(s => s.sourceId).map(s => s.sourceId)}
      />
    </div>
  )
}
