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
import { getServices, getRateCardItems, initializeRateCard } from '../../lib/firestore'
import { useOrganization } from '../../hooks/useOrganization'
import { formatCurrency } from '../../lib/costEstimator'
import { PRICING_TYPES, UNIT_TYPES } from '../../pages/Services'
import { DEFAULT_RATE_CARD_ITEMS, RATE_CARD_CATEGORIES } from '../../data/rateCard'

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

// Calculate service cost with flexible pricing model
export function calculateServiceCost(service) {
  // selectedRateType is the PROJECT-LEVEL choice of which rate to use
  const selectedRateType = service.selectedRateType || 'fixed'
  let baseCost = 0

  // Calculate base cost based on selected rate type
  if (selectedRateType === 'fixed') {
    // Fixed price - just use the fixed rate, no quantity needed
    baseCost = service.fixedRate || 0
  } else if (selectedRateType === 'per_unit') {
    // Per-unit pricing (per acre, mile, structure, etc.)
    const quantity = parseFloat(service.quantity) || 0
    const unitRate = service.unitRate || 0

    // Check for volume tier pricing
    if (service.volumeTiers?.length > 0 && quantity > 0) {
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
    // Time-based: hourly, daily, weekly
    const rateConfig = RATE_TYPE_OPTIONS[selectedRateType]
    const rate = service[rateConfig?.rateField] || 0
    const quantity = parseFloat(service.quantity) || 0
    baseCost = quantity * rate
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

  // Apply PROJECT-LEVEL modifiers (stored directly on the service)
  const projectModifiers = service.projectModifiers || []
  let totalMultiplier = 1
  for (const m of projectModifiers) {
    totalMultiplier *= (m.multiplier || 1)
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
  const { organizationId } = useOrganization()
  const [activeTab, setActiveTab] = useState('library')
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedService, setSelectedService] = useState(null)

  // Rate selection for library services
  const [selectedRateType, setSelectedRateType] = useState(null)
  const [quantity, setQuantity] = useState('')

  // Rate card state
  const [rateCardItems, setRateCardItems] = useState([])
  const [rateCardLoading, setRateCardLoading] = useState(false)
  const [selectedRateCardItem, setSelectedRateCardItem] = useState(null)
  const [selectedRateCardCategory, setSelectedRateCardCategory] = useState(null)
  const [rateCardRateType, setRateCardRateType] = useState(null)
  const [rateCardQuantity, setRateCardQuantity] = useState('1')

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
      loadRateCard()
      setSelectedService(null)
      setSelectedRateType(null)
      setQuantity('')
      setSelectedRateCardItem(null)
      setSelectedRateCardCategory(null)
      setRateCardRateType(null)
      setRateCardQuantity('1')
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

  // When a service is selected, auto-select the first available rate
  useEffect(() => {
    if (selectedService) {
      // Use simple truthy check (matches Services.jsx display logic)
      const availableRates = []
      if (selectedService.fixedRate) availableRates.push('fixed')
      if (selectedService.hourlyRate) availableRates.push('hourly')
      if (selectedService.dailyRate) availableRates.push('daily')
      if (selectedService.weeklyRate) availableRates.push('weekly')
      if (selectedService.unitRate) availableRates.push('per_unit')

      setSelectedRateType(availableRates[0] || null)
      setQuantity(availableRates[0] === 'fixed' ? '' : '1')
    } else {
      setSelectedRateType(null)
      setQuantity('')
    }
  }, [selectedService])

  const loadServices = async () => {
    if (!organizationId) return
    setLoading(true)
    try {
      const data = await getServices(organizationId)
      setServices(data.filter(s => s.status === 'active'))
    } catch (error) {
      console.error('Failed to load services:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRateCard = async () => {
    if (!organizationId) return
    setRateCardLoading(true)
    try {
      let items = await getRateCardItems(organizationId)
      // If no items, initialize with defaults
      if (items.length === 0) {
        await initializeRateCard(organizationId, DEFAULT_RATE_CARD_ITEMS)
        items = await getRateCardItems(organizationId)
      }
      // Merge with defaults to ensure all items are present
      const mergedItems = DEFAULT_RATE_CARD_ITEMS.map(defaultItem => {
        const orgItem = items.find(item => item.id === defaultItem.id)
        return orgItem || { ...defaultItem, organizationId }
      })
      setRateCardItems(mergedItems.filter(item => item.isActive !== false))
    } catch (error) {
      console.error('Failed to load rate card:', error)
      // Fallback to defaults
      setRateCardItems(DEFAULT_RATE_CARD_ITEMS.filter(item => item.isActive !== false))
    } finally {
      setRateCardLoading(false)
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
    if (!selectedService || !selectedRateType) return

    // Build list of available rate types based on what's defined (truthy check)
    const availableRates = []
    if (selectedService.fixedRate) availableRates.push('fixed')
    if (selectedService.hourlyRate) availableRates.push('hourly')
    if (selectedService.dailyRate) availableRates.push('daily')
    if (selectedService.weeklyRate) availableRates.push('weekly')
    if (selectedService.unitRate) availableRates.push('per_unit')

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
      // Available rates from library (for user to choose from)
      availableRates,
      // Project-level selection of which rate to use (user selected this!)
      selectedRateType: selectedRateType,
      quantity: selectedRateType === 'fixed' ? '' : (quantity || '1'),
      // Copy all rates from library
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
      // Project-level modifiers (user adds these)
      projectModifiers: [],
      notes: ''
    }

    onAdd(projectService)
    onClose()
  }

  const handleAddFromRateCard = () => {
    if (!selectedRateCardItem || !rateCardRateType) return

    const item = selectedRateCardItem
    const rates = item.rates || {}
    const rate = rates[rateCardRateType] || 0

    // Map rate card categories to service categories
    const categoryMapping = {
      'services-consulting': 'other',
      'services-training': 'training',
      'services-field': 'aerial_survey',
      'data-processing': 'data_processing',
      'deliverables': 'other',
      'personnel-pic': 'other',
      'personnel-field': 'other',
      'personnel-travel': 'other',
      'personnel-office': 'other',
      'mob-demob': 'other',
      'equipment-rpas-small': 'other',
      'equipment-rpas-medium': 'other',
      'equipment-water': 'other',
      'equipment-sensors': 'other',
      'specialized': 'emergency',
      'insurance': 'other',
      'travel-expenses': 'other'
    }

    // Build available rates
    const availableRates = Object.keys(rates).filter(k => rates[k] > 0)

    // Determine rate type mapping
    let selectedRateType = 'fixed'
    if (rateCardRateType === 'day' || rateCardRateType === 'daily') selectedRateType = 'daily'
    else if (rateCardRateType === 'hourly') selectedRateType = 'hourly'
    else if (rateCardRateType === 'week' || rateCardRateType === 'weekly') selectedRateType = 'weekly'
    else if (rateCardRateType === 'fixed' || rateCardRateType === 'perProject') selectedRateType = 'fixed'
    else if (rateCardRateType.startsWith('per')) selectedRateType = 'per_unit'

    const projectService = {
      id: generateId(),
      sourceId: item.id,
      sourceType: 'rate-card',
      name: item.name,
      category: categoryMapping[item.category] || 'other',
      description: item.description || '',
      availableRates: availableRates.map(r => {
        if (r === 'day' || r === 'daily') return 'daily'
        if (r === 'hourly') return 'hourly'
        if (r === 'week' || r === 'weekly') return 'weekly'
        if (r === 'fixed' || r === 'perProject') return 'fixed'
        return 'per_unit'
      }),
      selectedRateType,
      quantity: selectedRateType === 'fixed' ? '' : (rateCardQuantity || '1'),
      // Map rates
      hourlyRate: rates.hourly || 0,
      dailyRate: rates.day || rates.daily || 0,
      weeklyRate: rates.week || rates.weekly || 0,
      fixedRate: rates.fixed || rates.perProject || 0,
      unitType: item.baseUnit || 'unit',
      unitRate: rate,
      baseFee: 0,
      minimumCharge: 0,
      deliverables: [],
      selectedDeliverables: [],
      projectModifiers: [],
      notes: item.notes || '',
      rateCardItem: {
        id: item.id,
        category: item.category,
        baseUnit: item.baseUnit
      }
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
              onClick={() => setActiveTab('rate-card')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'rate-card'
                  ? 'border-aeria-navy text-aeria-navy'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center justify-center gap-1">
                <DollarSign className="w-4 h-4" />
                Rate Card
              </span>
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'custom'
                  ? 'border-aeria-navy text-aeria-navy'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Custom
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

                {/* Selected Preview & Rate Selection */}
                {selectedService && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Selected:</p>
                      <p className="font-medium text-gray-900">{selectedService.name}</p>
                      {selectedService.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{selectedService.description}</p>
                      )}
                    </div>

                    {/* Rate Type Selection */}
                    {(() => {
                      // Use simple truthy check (matches Services.jsx display logic)
                      const availableRates = []
                      if (selectedService.fixedRate) availableRates.push('fixed')
                      if (selectedService.hourlyRate) availableRates.push('hourly')
                      if (selectedService.dailyRate) availableRates.push('daily')
                      if (selectedService.weeklyRate) availableRates.push('weekly')
                      if (selectedService.unitRate) availableRates.push('per_unit')
                      const unitInfo = UNIT_TYPES?.find(u => u.value === selectedService.unitType)

                      if (availableRates.length === 0) {
                        return (
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-sm text-amber-800 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" />
                              No rates defined for this service
                            </p>
                          </div>
                        )
                      }

                      return (
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Select Pricing:</p>
                            <div className="flex flex-wrap gap-2">
                              {availableRates.map(rateType => {
                                const isSelected = selectedRateType === rateType
                                let rateValue = 0
                                let label = ''

                                if (rateType === 'fixed') {
                                  rateValue = selectedService.fixedRate
                                  label = `Fixed: ${formatCurrency(rateValue)}`
                                } else if (rateType === 'hourly') {
                                  rateValue = selectedService.hourlyRate
                                  label = `${formatCurrency(rateValue)}/hr`
                                } else if (rateType === 'daily') {
                                  rateValue = selectedService.dailyRate
                                  label = `${formatCurrency(rateValue)}/day`
                                } else if (rateType === 'weekly') {
                                  rateValue = selectedService.weeklyRate
                                  label = `${formatCurrency(rateValue)}/wk`
                                } else if (rateType === 'per_unit') {
                                  rateValue = selectedService.unitRate
                                  label = `${formatCurrency(rateValue)}/${unitInfo?.plural || 'unit'}`
                                }

                                return (
                                  <button
                                    key={rateType}
                                    type="button"
                                    onClick={() => {
                                      setSelectedRateType(rateType)
                                      if (rateType === 'fixed') {
                                        setQuantity('')
                                      } else if (!quantity) {
                                        setQuantity('1')
                                      }
                                    }}
                                    className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                                      isSelected
                                        ? 'bg-aeria-navy text-white border-aeria-navy'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                    }`}
                                  >
                                    {label}
                                  </button>
                                )
                              })}
                            </div>
                          </div>

                          {/* Quantity input for non-fixed rates */}
                          {selectedRateType && selectedRateType !== 'fixed' && (
                            <div className={`p-3 rounded-lg ${
                              selectedRateType === 'per_unit' ? 'bg-purple-50' : 'bg-blue-50'
                            }`}>
                              <label className={`block text-xs font-medium mb-1 ${
                                selectedRateType === 'per_unit' ? 'text-purple-800' : 'text-blue-800'
                              }`}>
                                {selectedRateType === 'per_unit'
                                  ? `Quantity (${unitInfo?.plural || 'units'})`
                                  : selectedRateType === 'hourly' ? 'Number of Hours'
                                  : selectedRateType === 'daily' ? 'Number of Days'
                                  : 'Number of Weeks'
                                }
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={quantity}
                                  onChange={(e) => setQuantity(e.target.value)}
                                  min="0"
                                  step="0.5"
                                  className="input w-24"
                                  placeholder="1"
                                />
                                <span className={`text-sm ${
                                  selectedRateType === 'per_unit' ? 'text-purple-700' : 'text-blue-700'
                                }`}>
                                  × {formatCurrency(
                                    selectedRateType === 'per_unit' ? selectedService.unitRate :
                                    selectedRateType === 'hourly' ? selectedService.hourlyRate :
                                    selectedRateType === 'daily' ? selectedService.dailyRate :
                                    selectedService.weeklyRate || 0
                                  )}
                                  {' = '}
                                  <strong>
                                    {formatCurrency(
                                      (parseFloat(quantity) || 0) * (
                                        selectedRateType === 'per_unit' ? selectedService.unitRate :
                                        selectedRateType === 'hourly' ? selectedService.hourlyRate :
                                        selectedRateType === 'daily' ? selectedService.dailyRate :
                                        selectedService.weeklyRate || 0
                                      )
                                    )}
                                  </strong>
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Fixed rate confirmation */}
                          {selectedRateType === 'fixed' && (
                            <div className="p-3 bg-amber-50 rounded-lg">
                              <p className="text-sm text-amber-800">
                                <strong>Fixed price:</strong> {formatCurrency(selectedService.fixedRate)}
                                {selectedService.baseFee > 0 && (
                                  <span className="text-amber-600 ml-2">+ {formatCurrency(selectedService.baseFee)} base fee</span>
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                )}
              </>
            ) : activeTab === 'rate-card' ? (
              /* Rate Card Selection */
              <div className="space-y-4">
                {/* Category Filter */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedRateCardCategory(null)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      !selectedRateCardCategory
                        ? 'bg-aeria-navy text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  {Object.entries(RATE_CARD_CATEGORIES).map(([id, cat]) => (
                    <button
                      key={id}
                      onClick={() => setSelectedRateCardCategory(id)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        selectedRateCardCategory === id
                          ? 'bg-aeria-navy text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search rate card items..."
                    className="input pl-10"
                  />
                </div>

                {/* Rate Card Items List */}
                <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                  {rateCardLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : (() => {
                    const filteredRateCard = rateCardItems.filter(item => {
                      if (selectedRateCardCategory && item.category !== selectedRateCardCategory) return false
                      if (!searchQuery) return true
                      const query = searchQuery.toLowerCase()
                      return (
                        item.name?.toLowerCase().includes(query) ||
                        item.description?.toLowerCase().includes(query)
                      )
                    })

                    if (filteredRateCard.length === 0) {
                      return (
                        <div className="text-center py-8 text-gray-500">
                          No matching rate card items
                        </div>
                      )
                    }

                    return filteredRateCard.map(item => {
                      const isSelected = selectedRateCardItem?.id === item.id
                      const rates = item.rates || {}
                      const firstRate = Object.entries(rates).find(([k, v]) => v > 0)

                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setSelectedRateCardItem(item)
                            // Auto-select first rate type
                            const availableRates = Object.keys(rates).filter(k => rates[k] > 0)
                            setRateCardRateType(availableRates[0] || null)
                            setRateCardQuantity('1')
                          }}
                          className={`w-full p-3 text-left border-b border-gray-100 last:border-b-0 transition-colors ${
                            isSelected ? 'bg-aeria-navy/5 ring-1 ring-inset ring-aeria-navy' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="text-xs text-gray-500">
                                {RATE_CARD_CATEGORIES[item.category]?.name || item.category}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0 ml-3">
                              {firstRate && (
                                <p className="text-sm font-medium text-gray-700">
                                  {formatCurrency(firstRate[1])}/{item.baseUnit}
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
                  })()}
                </div>

                {/* Selected Rate Card Item Preview */}
                {selectedRateCardItem && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Selected:</p>
                      <p className="font-medium text-gray-900">{selectedRateCardItem.name}</p>
                      <p className="text-sm text-gray-600 mt-1">{selectedRateCardItem.description}</p>
                    </div>

                    {/* Rate Selection */}
                    {(() => {
                      const rates = selectedRateCardItem.rates || {}
                      const availableRates = Object.entries(rates).filter(([k, v]) => v > 0)

                      if (availableRates.length === 0) {
                        return (
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-sm text-amber-800">Variable pricing - enter manually after adding</p>
                          </div>
                        )
                      }

                      return (
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Select Rate:</p>
                            <div className="flex flex-wrap gap-2">
                              {availableRates.map(([rateType, rate]) => {
                                const isSelected = rateCardRateType === rateType
                                const displayRate = typeof rate === 'number' && rate < 10
                                  ? `${rate}x multiplier`
                                  : formatCurrency(rate)

                                return (
                                  <button
                                    key={rateType}
                                    type="button"
                                    onClick={() => setRateCardRateType(rateType)}
                                    className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                                      isSelected
                                        ? 'bg-aeria-navy text-white border-aeria-navy'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                    }`}
                                  >
                                    {rateType}: {displayRate}
                                  </button>
                                )
                              })}
                            </div>
                          </div>

                          {/* Quantity */}
                          {rateCardRateType && !['fixed', 'perProject'].includes(rateCardRateType) && (
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <label className="block text-xs font-medium text-blue-800 mb-1">
                                Quantity ({selectedRateCardItem.baseUnit})
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={rateCardQuantity}
                                  onChange={(e) => setRateCardQuantity(e.target.value)}
                                  min="0"
                                  step="0.5"
                                  className="input w-24"
                                  placeholder="1"
                                />
                                <span className="text-sm text-blue-700">
                                  × {formatCurrency(rates[rateCardRateType] || 0)}
                                  {' = '}
                                  <strong>
                                    {formatCurrency((parseFloat(rateCardQuantity) || 0) * (rates[rateCardRateType] || 0))}
                                  </strong>
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>
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
              onClick={
                activeTab === 'library' ? handleAddFromLibrary :
                activeTab === 'rate-card' ? handleAddFromRateCard :
                handleAddCustom
              }
              disabled={
                activeTab === 'library' ? (!selectedService || !selectedRateType) :
                activeTab === 'rate-card' ? (!selectedRateCardItem || !rateCardRateType) :
                !customForm.name.trim()
              }
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {activeTab === 'rate-card' ? 'Add Line Item' : 'Add Service'}
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

  // Add project-level modifier
  const addProjectModifier = (preset = null) => {
    const newModifier = preset
      ? { id: generateId(), name: preset.name, multiplier: preset.multiplier }
      : { id: generateId(), name: '', multiplier: 1.0 }
    setEditForm(prev => ({
      ...prev,
      projectModifiers: [...(prev.projectModifiers || []), newModifier]
    }))
  }

  // Update project modifier
  const updateProjectModifier = (id, field, value) => {
    setEditForm(prev => ({
      ...prev,
      projectModifiers: (prev.projectModifiers || []).map(m =>
        m.id === id ? { ...m, [field]: value } : m
      )
    }))
  }

  // Remove project modifier
  const removeProjectModifier = (id) => {
    setEditForm(prev => ({
      ...prev,
      projectModifiers: (prev.projectModifiers || []).filter(m => m.id !== id)
    }))
  }

  // Calculate cost using new function
  const estimatedCost = calculateServiceCost(service)
  const selectedRateType = service.selectedRateType || 'fixed'
  const unitTypeInfo = UNIT_TYPES?.find(u => u.value === service.unitType)
  const quantity = parseFloat(service.quantity) || 0

  // Dynamically detect available rates from service data (truthy check)
  const availableRates = []
  if (service.fixedRate) availableRates.push('fixed')
  if (service.hourlyRate) availableRates.push('hourly')
  if (service.dailyRate) availableRates.push('daily')
  if (service.weeklyRate) availableRates.push('weekly')
  if (service.unitRate) availableRates.push('per_unit')

  // Get rate config for display
  const rateConfig = RATE_TYPE_OPTIONS[selectedRateType]
  const currentRate = selectedRateType === 'per_unit'
    ? service.unitRate
    : service[rateConfig?.rateField] || 0

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
              {/* Selected rate type badge */}
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                selectedRateType === 'fixed' ? 'bg-amber-100 text-amber-700' :
                selectedRateType === 'per_unit' ? 'bg-purple-100 text-purple-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {selectedRateType === 'fixed' ? 'Fixed' :
                 selectedRateType === 'per_unit' ? unitTypeInfo?.label?.replace('Per ', '') || 'Unit' :
                 selectedRateType === 'hourly' ? 'Hourly' :
                 selectedRateType === 'daily' ? 'Daily' :
                 selectedRateType === 'weekly' ? 'Weekly' : selectedRateType}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Quantity display - only show for non-fixed rates */}
          {selectedRateType === 'per_unit' && quantity > 0 && (
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              {quantity} {unitTypeInfo?.plural || 'units'}
            </span>
          )}
          {selectedRateType !== 'fixed' && selectedRateType !== 'per_unit' && quantity > 0 && (
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

              {/* Rate Type Selection - Project Level */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Pricing Method
                </label>
                <div className="flex flex-wrap gap-2">
                  {/* Show all available rates - dynamically detect from service data */}
                  {(() => {
                    // Use simple truthy check (matches Services.jsx display logic)
                    const editAvailableRates = []
                    if (editForm.fixedRate) editAvailableRates.push('fixed')
                    if (editForm.hourlyRate) editAvailableRates.push('hourly')
                    if (editForm.dailyRate) editAvailableRates.push('daily')
                    if (editForm.weeklyRate) editAvailableRates.push('weekly')
                    if (editForm.unitRate) editAvailableRates.push('per_unit')
                    const unitInfo = UNIT_TYPES?.find(u => u.value === editForm.unitType)

                    if (editAvailableRates.length === 0) {
                      return <p className="text-sm text-gray-500">No rates defined for this service</p>
                    }

                    return editAvailableRates.map(rateType => {
                      const isSelected = editForm.selectedRateType === rateType
                      const rateValue = rateType === 'per_unit'
                        ? editForm.unitRate
                        : editForm[RATE_TYPE_OPTIONS[rateType]?.rateField]

                      return (
                        <button
                          key={rateType}
                          type="button"
                          onClick={() => setEditForm(prev => ({ ...prev, selectedRateType: rateType }))}
                          className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                            isSelected
                              ? 'bg-aeria-navy text-white border-aeria-navy'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {rateType === 'fixed' && `Fixed: ${formatCurrency(rateValue || 0)}`}
                          {rateType === 'hourly' && `Hourly: ${formatCurrency(rateValue || 0)}/hr`}
                          {rateType === 'daily' && `Daily: ${formatCurrency(rateValue || 0)}/day`}
                          {rateType === 'weekly' && `Weekly: ${formatCurrency(rateValue || 0)}/wk`}
                          {rateType === 'per_unit' && `${unitInfo?.label || 'Per Unit'}: ${formatCurrency(rateValue || 0)}/${unitInfo?.plural || 'unit'}`}
                        </button>
                      )
                    })
                  })()}
                </div>
              </div>

              {/* Quantity Input - only show for non-fixed rates */}
              {editForm.selectedRateType && editForm.selectedRateType !== 'fixed' && (
                <div className={`p-3 rounded-lg ${
                  editForm.selectedRateType === 'per_unit' ? 'bg-purple-50' : 'bg-blue-50'
                }`}>
                  <label className={`block text-xs font-medium mb-2 ${
                    editForm.selectedRateType === 'per_unit' ? 'text-purple-800' : 'text-blue-800'
                  }`}>
                    {editForm.selectedRateType === 'per_unit'
                      ? `Quantity (${UNIT_TYPES?.find(u => u.value === editForm.unitType)?.plural || 'units'})`
                      : `Number of ${RATE_TYPE_OPTIONS[editForm.selectedRateType]?.label || 'Days'}`
                    }
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={editForm.quantity || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, quantity: e.target.value }))}
                      min="0"
                      step="0.5"
                      className="input w-32"
                      placeholder="Enter quantity"
                    />
                    <span className={`text-sm ${
                      editForm.selectedRateType === 'per_unit' ? 'text-purple-700' : 'text-blue-700'
                    }`}>
                      × {formatCurrency(
                        editForm.selectedRateType === 'per_unit'
                          ? editForm.unitRate || 0
                          : editForm[RATE_TYPE_OPTIONS[editForm.selectedRateType]?.rateField] || 0
                      )}
                      /{editForm.selectedRateType === 'per_unit'
                        ? UNIT_TYPES?.find(u => u.value === editForm.unitType)?.plural || 'unit'
                        : RATE_TYPE_OPTIONS[editForm.selectedRateType]?.unitLabel || 'day'
                      }
                    </span>
                  </div>
                  {/* Show volume tiers for per_unit */}
                  {editForm.selectedRateType === 'per_unit' && editForm.volumeTiers?.length > 0 && (
                    <div className="mt-2 text-xs text-purple-600">
                      <TrendingDown className="w-3 h-3 inline mr-1" />
                      Volume tiers: {editForm.volumeTiers.map((t, i) => (
                        <span key={t.id || i}>
                          {i > 0 && ' → '}
                          {t.upTo ? `≤${t.upTo}` : '∞'}: ${t.rate}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {editForm.selectedRateType === 'fixed' && (
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

              {/* Project-Level Modifiers */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                    <Percent className="w-3 h-3" />
                    Price Adjustments (Project-Specific)
                  </label>
                  <button
                    type="button"
                    onClick={() => addProjectModifier()}
                    className="text-xs text-aeria-navy hover:underline"
                  >
                    + Add Custom
                  </button>
                </div>

                {/* Quick add common modifiers */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {[
                    { name: 'Rush (24-48hr)', multiplier: 1.25 },
                    { name: 'Same Day', multiplier: 1.50 },
                    { name: 'Difficult Terrain', multiplier: 1.30 },
                    { name: 'Remote Location', multiplier: 1.20 },
                  ].filter(preset => !(editForm.projectModifiers || []).some(m => m.name === preset.name))
                   .map(preset => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => addProjectModifier(preset)}
                      className="px-2 py-0.5 text-xs bg-white border border-gray-200 rounded hover:bg-gray-100"
                    >
                      + {preset.name}
                    </button>
                  ))}
                </div>

                {/* Active modifiers */}
                {(editForm.projectModifiers || []).length > 0 ? (
                  <div className="space-y-2">
                    {(editForm.projectModifiers || []).map(m => (
                      <div key={m.id} className="flex items-center gap-2 bg-white p-2 rounded border border-gray-200">
                        <input
                          type="text"
                          value={m.name}
                          onChange={(e) => updateProjectModifier(m.id, 'name', e.target.value)}
                          className="input flex-1 text-sm"
                          placeholder="Modifier name"
                        />
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={m.multiplier || ''}
                            onChange={(e) => updateProjectModifier(m.id, 'multiplier', parseFloat(e.target.value) || 1)}
                            className="input w-16 text-sm text-center"
                            placeholder="1.0"
                            step="0.05"
                            min="0.5"
                            max="3"
                          />
                          <span className="text-xs text-gray-500">×</span>
                        </div>
                        <span className="text-xs text-gray-500 w-12 text-right">
                          {m.multiplier > 1 ? `+${((m.multiplier - 1) * 100).toFixed(0)}%` :
                           m.multiplier < 1 ? `-${((1 - m.multiplier) * 100).toFixed(0)}%` : '—'}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeProjectModifier(m.id)}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No adjustments applied. Add rush fees, difficulty modifiers, etc.</p>
                )}
              </div>

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
                    {selectedRateType === 'fixed' && (
                      <p>Fixed price: {formatCurrency(service.fixedRate || 0)}</p>
                    )}
                    {selectedRateType === 'per_unit' && quantity > 0 && (
                      <p>{quantity} {unitTypeInfo?.plural || 'units'} × {formatCurrency(service.unitRate || 0)}/{unitTypeInfo?.plural || 'unit'}</p>
                    )}
                    {selectedRateType !== 'fixed' && selectedRateType !== 'per_unit' && quantity > 0 && (
                      <p>{quantity} {rateConfig?.label?.toLowerCase() || 'days'} × {formatCurrency(currentRate)}/{rateConfig?.unitLabel || 'day'}</p>
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
                    {(service.projectModifiers || []).length > 0 && (
                      <p>
                        × Adjustments: {service.projectModifiers
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

              {/* Project Modifiers */}
              {(service.projectModifiers || []).length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Applied Adjustments:</p>
                  <div className="flex flex-wrap gap-1">
                    {service.projectModifiers.map(m => (
                      <span key={m.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-xs">
                        <Percent className="w-3 h-3" />
                        {m.name} ({m.multiplier > 1 ? '+' : ''}{((m.multiplier - 1) * 100).toFixed(0)}%)
                      </span>
                    ))}
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
