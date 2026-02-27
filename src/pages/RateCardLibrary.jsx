/**
 * RateCardLibrary.jsx
 * Master Rate Card management page
 *
 * Displays all billable line items organized by category
 * with inline editing of rates.
 */

import { useState, useEffect, useMemo } from 'react'
import { useOrganization } from '../hooks/useOrganization'
import {
  Search,
  Filter,
  Edit3,
  Save,
  X,
  Plus,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Check,
  AlertCircle,
  Package,
  Users,
  Plane,
  Camera,
  FileText,
  GraduationCap,
  MapPin,
  Database,
  Shield,
  AlertTriangle,
  Receipt,
  Truck,
  Building2,
  Car,
  Ship,
  ToggleLeft,
  ToggleRight,
  Download,
  Upload
} from 'lucide-react'

import {
  DEFAULT_RATE_CARD_ITEMS,
  RATE_CARD_CATEGORIES,
  getRateCardItemsByCategory,
  getAllCategories
} from '../data/rateCard'

import {
  getRateCardItems,
  saveRateCardItem,
  initializeRateCard,
  toggleRateCardItemActive,
  addCustomRateCardItem
} from '../lib/firestore'

// Icon mapping for categories
const CATEGORY_ICONS = {
  'personnel-pic': Users,
  'personnel-field': Users,
  'personnel-travel': Car,
  'personnel-office': Building2,
  'mob-demob': Truck,
  'equipment-rpas-small': Plane,
  'equipment-rpas-medium': Plane,
  'equipment-water': Ship,
  'equipment-sensors': Camera,
  'services-consulting': FileText,
  'services-training': GraduationCap,
  'services-field': MapPin,
  'data-processing': Database,
  'deliverables': Package,
  'specialized': AlertTriangle,
  'insurance': Shield,
  'travel-expenses': Receipt
}

// Color classes for categories
const CATEGORY_COLORS = {
  'personnel-pic': 'bg-blue-50 border-blue-200 text-blue-700',
  'personnel-field': 'bg-green-50 border-green-200 text-green-700',
  'personnel-travel': 'bg-slate-50 border-slate-200 text-slate-700',
  'personnel-office': 'bg-indigo-50 border-indigo-200 text-indigo-700',
  'mob-demob': 'bg-orange-50 border-orange-200 text-orange-700',
  'equipment-rpas-small': 'bg-sky-50 border-sky-200 text-sky-700',
  'equipment-rpas-medium': 'bg-cyan-50 border-cyan-200 text-cyan-700',
  'equipment-water': 'bg-blue-50 border-blue-200 text-blue-700',
  'equipment-sensors': 'bg-purple-50 border-purple-200 text-purple-700',
  'services-consulting': 'bg-violet-50 border-violet-200 text-violet-700',
  'services-training': 'bg-amber-50 border-amber-200 text-amber-700',
  'services-field': 'bg-emerald-50 border-emerald-200 text-emerald-700',
  'data-processing': 'bg-teal-50 border-teal-200 text-teal-700',
  'deliverables': 'bg-pink-50 border-pink-200 text-pink-700',
  'specialized': 'bg-red-50 border-red-200 text-red-700',
  'insurance': 'bg-lime-50 border-lime-200 text-lime-700',
  'travel-expenses': 'bg-stone-50 border-stone-200 text-stone-700'
}

// Format currency
function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '-'
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount)
}

// Rate type display names
const RATE_TYPE_LABELS = {
  hourly: 'Hourly',
  halfDay: 'Half-Day',
  day: 'Daily',
  week: 'Weekly',
  monthly: 'Monthly',
  fixed: 'Fixed',
  perUnit: 'Per Unit',
  perPerson: 'Per Person',
  perKm: 'Per km',
  perHectare: 'Per Hectare',
  perCollection: 'Per Collection',
  perProject: 'Per Project',
  perStructure: 'Per Structure',
  perIndex: 'Per Index',
  perComparison: 'Per Comparison',
  perStockpile: 'Per Stockpile',
  perMonth: 'Per Month',
  perYear: 'Per Year',
  standalone: 'Standalone',
  perModel: 'Per Model',
  perPersonDay: 'Per Person/Day',
  estimated: 'Estimated',
  callout: 'Callout',
  multiplier: 'Multiplier',
  standard: 'Standard Rush',
  urgent: 'Urgent Rush',
  daily: 'Daily Standby',
  weekly: 'Weekly Standby'
}

export default function RateCardLibrary() {
  const { organizationId } = useOrganization()

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [expandedCategories, setExpandedCategories] = useState({})
  const [editingItem, setEditingItem] = useState(null)
  const [editingRates, setEditingRates] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  // Load rate card items
  useEffect(() => {
    async function loadRateCard() {
      if (!organizationId) return

      try {
        setLoading(true)
        setError(null)

        // Try to get existing items
        let orgItems = await getRateCardItems(organizationId)

        // If no items exist, initialize with defaults
        if (orgItems.length === 0) {
          await initializeRateCard(organizationId, DEFAULT_RATE_CARD_ITEMS)
          orgItems = await getRateCardItems(organizationId)
          setInitialized(true)
        }

        // Merge with defaults to ensure we have all items
        const mergedItems = DEFAULT_RATE_CARD_ITEMS.map(defaultItem => {
          const orgItem = orgItems.find(item => item.id === defaultItem.id)
          return orgItem || { ...defaultItem, organizationId }
        })

        // Add any custom items
        const customItems = orgItems.filter(item => item.isCustom)
        setItems([...mergedItems, ...customItems])

        // Expand first category by default
        if (Object.keys(expandedCategories).length === 0) {
          setExpandedCategories({ 'personnel-pic': true })
        }
      } catch (err) {
        console.error('Error loading rate card:', err)
        setError('Failed to load rate card. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadRateCard()
  }, [organizationId])

  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = !searchTerm ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = !selectedCategory || item.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [items, searchTerm, selectedCategory])

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups = {}
    filteredItems.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = []
      }
      groups[item.category].push(item)
    })
    return groups
  }, [filteredItems])

  // Toggle category expansion
  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }

  // Expand all categories
  const expandAll = () => {
    const allExpanded = {}
    Object.keys(RATE_CARD_CATEGORIES).forEach(cat => {
      allExpanded[cat] = true
    })
    setExpandedCategories(allExpanded)
  }

  // Collapse all categories
  const collapseAll = () => {
    setExpandedCategories({})
  }

  // Start editing an item
  const startEditing = (item) => {
    setEditingItem(item.id)
    setEditingRates({ ...item.rates })
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingItem(null)
    setEditingRates({})
  }

  // Save edited rates
  const saveRates = async (item) => {
    try {
      setSaving(true)
      setError(null)

      await saveRateCardItem(organizationId, item.id, {
        ...item,
        rates: editingRates
      })

      // Update local state
      setItems(prev => prev.map(i =>
        i.id === item.id ? { ...i, rates: editingRates } : i
      ))

      setEditingItem(null)
      setEditingRates({})
      setSuccessMessage('Rates updated successfully')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error('Error saving rates:', err)
      setError('Failed to save rates. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Toggle item active status
  const handleToggleActive = async (item) => {
    try {
      const newStatus = !item.isActive
      await toggleRateCardItemActive(organizationId, item.id, newStatus)

      setItems(prev => prev.map(i =>
        i.id === item.id ? { ...i, isActive: newStatus } : i
      ))
    } catch (err) {
      console.error('Error toggling item:', err)
      setError('Failed to update item status.')
    }
  }

  // Get category stats
  const getCategoryStats = (categoryId) => {
    const categoryItems = items.filter(item => item.category === categoryId)
    const activeCount = categoryItems.filter(item => item.isActive !== false).length
    return { total: categoryItems.length, active: activeCount }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Loading rate card...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rate Card Library</h1>
          <p className="text-gray-600 mt-1">
            Manage pricing for all billable line items ({items.length} items)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={expandAll}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4 text-red-500" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <Check className="w-5 h-5 text-green-500" />
          <span className="text-green-700">{successMessage}</span>
        </div>
      )}

      {initialized && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500" />
          <span className="text-blue-700">
            Rate card initialized with default rates. You can now customize pricing for your organization.
          </span>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search line items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <select
          value={selectedCategory || ''}
          onChange={(e) => setSelectedCategory(e.target.value || null)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">All Categories</option>
          {getAllCategories().map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Category Groups */}
      <div className="space-y-4">
        {Object.entries(RATE_CARD_CATEGORIES).map(([categoryId, category]) => {
          const categoryItems = groupedItems[categoryId] || []
          if (categoryItems.length === 0 && (searchTerm || selectedCategory)) return null

          const isExpanded = expandedCategories[categoryId]
          const stats = getCategoryStats(categoryId)
          const IconComponent = CATEGORY_ICONS[categoryId] || Package
          const colorClass = CATEGORY_COLORS[categoryId] || 'bg-gray-50 border-gray-200 text-gray-700'

          return (
            <div key={categoryId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(categoryId)}
                className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${isExpanded ? 'border-b border-gray-200' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg border ${colorClass}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    {stats.active} / {stats.total} active
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Category Items */}
              {isExpanded && (
                <div className="divide-y divide-gray-100">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 text-sm font-medium text-gray-500">
                    <div className="col-span-4">Line Item</div>
                    <div className="col-span-5">Rates</div>
                    <div className="col-span-2">Unit</div>
                    <div className="col-span-1 text-right">Actions</div>
                  </div>

                  {categoryItems.map(item => (
                    <div
                      key={item.id}
                      className={`grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50 ${item.isActive === false ? 'opacity-50' : ''}`}
                    >
                      {/* Item Name & Description */}
                      <div className="col-span-4">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">{item.description}</div>
                        {item.notes && (
                          <div className="text-xs text-amber-600 mt-1">{item.notes}</div>
                        )}
                      </div>

                      {/* Rates */}
                      <div className="col-span-5">
                        {editingItem === item.id ? (
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(editingRates).map(([rateType, rate]) => (
                              <div key={rateType} className="flex items-center gap-1">
                                <span className="text-xs text-gray-500 w-16 truncate">
                                  {RATE_TYPE_LABELS[rateType] || rateType}:
                                </span>
                                <input
                                  type="number"
                                  value={rate}
                                  onChange={(e) => setEditingRates(prev => ({
                                    ...prev,
                                    [rateType]: parseFloat(e.target.value) || 0
                                  }))}
                                  className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                                  step="0.01"
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(item.rates || {}).map(([rateType, rate]) => (
                              <span
                                key={rateType}
                                className="inline-flex items-center px-2 py-1 bg-gray-100 text-sm rounded"
                              >
                                <span className="text-gray-500 mr-1">
                                  {RATE_TYPE_LABELS[rateType] || rateType}:
                                </span>
                                <span className="font-medium text-gray-900">
                                  {typeof rate === 'number' && rate < 10
                                    ? `${rate}x`
                                    : formatCurrency(rate)}
                                </span>
                              </span>
                            ))}
                            {(!item.rates || Object.keys(item.rates).length === 0) && (
                              <span className="text-gray-400 text-sm">At cost / variable</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Base Unit */}
                      <div className="col-span-2">
                        <span className="text-sm text-gray-600 capitalize">
                          {item.baseUnit}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 flex items-center justify-end gap-2">
                        {editingItem === item.id ? (
                          <>
                            <button
                              onClick={() => saveRates(item)}
                              disabled={saving}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="p-1.5 text-gray-400 hover:bg-gray-100 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(item)}
                              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                              title="Edit rates"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleActive(item)}
                              className={`p-1.5 rounded ${item.isActive === false ? 'text-gray-400 hover:text-green-600' : 'text-green-600 hover:text-gray-400'}`}
                              title={item.isActive === false ? 'Enable' : 'Disable'}
                            >
                              {item.isActive === false ? (
                                <ToggleLeft className="w-4 h-4" />
                              ) : (
                                <ToggleRight className="w-4 h-4" />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary Stats */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Rate Card Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{items.length}</div>
            <div className="text-sm text-gray-500">Total Items</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {items.filter(i => i.isActive !== false).length}
            </div>
            <div className="text-sm text-gray-500">Active Items</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {Object.keys(RATE_CARD_CATEGORIES).length}
            </div>
            <div className="text-sm text-gray-500">Categories</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">
              {items.filter(i => i.isCustom).length}
            </div>
            <div className="text-sm text-gray-500">Custom Items</div>
          </div>
        </div>
      </div>
    </div>
  )
}
