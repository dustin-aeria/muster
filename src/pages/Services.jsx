/**
 * Services.jsx
 * Services library management page
 *
 * Allows users to define services with flexible pricing models:
 * - Time-based (hourly/daily/weekly)
 * - Per-unit (acre, mile, structure, MW, etc.)
 * - Fixed fee
 * - Volume tiers with quantity breaks
 * - Deliverable add-ons
 * - Modifiers/multipliers (rush, difficulty, etc.)
 */

import { useState, useEffect } from 'react'
import {
  Briefcase,
  Plus,
  Search,
  Edit2,
  Trash2,
  DollarSign,
  Tag,
  Clock,
  AlertCircle,
  Layers,
  TrendingDown,
  Package,
  Percent,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import Modal, { ModalFooter } from '../components/Modal'

// Service categories
const SERVICE_CATEGORIES = [
  { value: 'aerial_survey', label: 'Aerial Survey & Mapping' },
  { value: 'inspection', label: 'Infrastructure Inspection' },
  { value: 'photography', label: 'Photography & Videography' },
  { value: 'lidar', label: 'LiDAR Scanning' },
  { value: 'thermal', label: 'Thermal Imaging' },
  { value: 'agriculture', label: 'Agricultural Services' },
  { value: 'construction', label: 'Construction Monitoring' },
  { value: 'environmental', label: 'Environmental Assessment' },
  { value: 'emergency', label: 'Emergency Response' },
  { value: 'training', label: 'Training & Consultation' },
  { value: 'data_processing', label: 'Data Processing' },
  { value: 'other', label: 'Other' }
]

// Pricing type options
export const PRICING_TYPES = [
  { value: 'time_based', label: 'Time-Based', description: 'Hourly, daily, or weekly rates' },
  { value: 'per_unit', label: 'Per Unit', description: 'Per acre, mile, structure, etc.' },
  { value: 'fixed', label: 'Fixed Fee', description: 'Single flat rate' }
]

// Unit types for per-unit pricing
export const UNIT_TYPES = [
  { value: 'acre', label: 'Per Acre', plural: 'acres', icon: '🌾' },
  { value: 'hectare', label: 'Per Hectare', plural: 'hectares', icon: '🌾' },
  { value: 'sqft', label: 'Per Sq Ft', plural: 'sq ft', icon: '📐' },
  { value: 'sqm', label: 'Per Sq Meter', plural: 'sq m', icon: '📐' },
  { value: 'mile', label: 'Per Mile', plural: 'miles', icon: '📏' },
  { value: 'km', label: 'Per Kilometer', plural: 'km', icon: '📏' },
  { value: 'structure', label: 'Per Structure', plural: 'structures', icon: '🏗️' },
  { value: 'tower', label: 'Per Tower', plural: 'towers', icon: '📡' },
  { value: 'turbine', label: 'Per Turbine', plural: 'turbines', icon: '🌀' },
  { value: 'mw', label: 'Per MW', plural: 'MW', icon: '⚡' },
  { value: 'panel', label: 'Per Panel', plural: 'panels', icon: '☀️' },
  { value: 'site', label: 'Per Site', plural: 'sites', icon: '📍' },
  { value: 'image', label: 'Per Image', plural: 'images', icon: '📷' },
  { value: 'gb', label: 'Per GB', plural: 'GB', icon: '💾' },
  { value: 'flight', label: 'Per Flight', plural: 'flights', icon: '✈️' },
  { value: 'deliverable', label: 'Per Deliverable', plural: 'deliverables', icon: '📦' }
]

// Common deliverable add-ons
export const COMMON_DELIVERABLES = [
  { name: 'Orthomosaic', defaultPrice: 0 },
  { name: 'Point Cloud', defaultPrice: 150 },
  { name: '3D Mesh Model', defaultPrice: 300 },
  { name: 'Digital Terrain Model (DTM)', defaultPrice: 200 },
  { name: 'Digital Surface Model (DSM)', defaultPrice: 150 },
  { name: 'Contour Map', defaultPrice: 100 },
  { name: 'Volume Calculations', defaultPrice: 75 },
  { name: 'CAD Export', defaultPrice: 100 },
  { name: 'GIS Layers', defaultPrice: 150 },
  { name: 'Thermal Report', defaultPrice: 200 },
  { name: 'Inspection Report', defaultPrice: 250 },
  { name: 'Progress Report', defaultPrice: 100 },
  { name: 'Raw Imagery', defaultPrice: 0 },
  { name: '4K Video', defaultPrice: 150 },
  { name: 'Edited Video', defaultPrice: 300 }
]

// Common modifiers
export const COMMON_MODIFIERS = [
  { name: 'Rush (24-48hr)', multiplier: 1.25 },
  { name: 'Same Day', multiplier: 1.50 },
  { name: 'Difficult Terrain', multiplier: 1.30 },
  { name: 'Remote Location', multiplier: 1.20 },
  { name: 'Night Operations', multiplier: 1.40 },
  { name: 'Survey-Grade Accuracy', multiplier: 1.35 },
  { name: 'High-Risk Environment', multiplier: 1.50 },
  { name: 'Weekend/Holiday', multiplier: 1.25 }
]

// Firestore helpers for services
async function getServices(userId) {
  const q = query(collection(db, 'services'), orderBy('name'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

async function createService(data, userId) {
  return await addDoc(collection(db, 'services'), {
    ...data,
    createdBy: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
}

async function updateService(id, data) {
  const ref = doc(db, 'services', id)
  return await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp()
  })
}

async function deleteService(id) {
  const ref = doc(db, 'services', id)
  return await deleteDoc(ref)
}

// Helper to generate unique IDs
function generateId() {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Service modal component with enhanced pricing
function ServiceModal({ isOpen, onClose, service, onSave, userId }) {
  const [activeTab, setActiveTab] = useState('basic')
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    status: 'active',
    // Pricing type
    pricingType: 'time_based',
    // Time-based rates (legacy + enhanced)
    hourlyRate: '',
    dailyRate: '',
    weeklyRate: '',
    // Per-unit pricing
    unitType: 'acre',
    unitRate: '',
    // Fixed fee
    fixedRate: '',
    // Base/mobilization fee
    baseFee: '',
    minimumCharge: '',
    // Volume tiers
    volumeTiers: [],
    // Deliverables
    deliverables: [],
    // Modifiers
    modifiers: [],
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Initialize form data when service changes
  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        category: service.category || '',
        description: service.description || '',
        status: service.status || 'active',
        pricingType: service.pricingType || 'time_based',
        hourlyRate: service.hourlyRate || '',
        dailyRate: service.dailyRate || '',
        weeklyRate: service.weeklyRate || '',
        unitType: service.unitType || 'acre',
        unitRate: service.unitRate || '',
        fixedRate: service.fixedRate || '',
        baseFee: service.baseFee || '',
        minimumCharge: service.minimumCharge || '',
        volumeTiers: service.volumeTiers || [],
        deliverables: service.deliverables || [],
        modifiers: service.modifiers || [],
        notes: service.notes || ''
      })
    } else {
      setFormData({
        name: '',
        category: '',
        description: '',
        status: 'active',
        pricingType: 'time_based',
        hourlyRate: '',
        dailyRate: '',
        weeklyRate: '',
        unitType: 'acre',
        unitRate: '',
        fixedRate: '',
        baseFee: '',
        minimumCharge: '',
        volumeTiers: [],
        deliverables: [],
        modifiers: [],
        notes: ''
      })
    }
    setError('')
    setActiveTab('basic')
  }, [service, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Volume tier management
  const addVolumeTier = () => {
    setFormData(prev => ({
      ...prev,
      volumeTiers: [...prev.volumeTiers, { id: generateId(), upTo: '', rate: '' }]
    }))
  }

  const updateVolumeTier = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      volumeTiers: prev.volumeTiers.map(t =>
        t.id === id ? { ...t, [field]: value } : t
      )
    }))
  }

  const removeVolumeTier = (id) => {
    setFormData(prev => ({
      ...prev,
      volumeTiers: prev.volumeTiers.filter(t => t.id !== id)
    }))
  }

  // Deliverable management
  const addDeliverable = (preset = null) => {
    const newDeliverable = preset
      ? { id: generateId(), name: preset.name, price: preset.defaultPrice, included: preset.defaultPrice === 0 }
      : { id: generateId(), name: '', price: '', included: false }
    setFormData(prev => ({
      ...prev,
      deliverables: [...prev.deliverables, newDeliverable]
    }))
  }

  const updateDeliverable = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.map(d =>
        d.id === id ? { ...d, [field]: value } : d
      )
    }))
  }

  const removeDeliverable = (id) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter(d => d.id !== id)
    }))
  }

  // Modifier management
  const addModifier = (preset = null) => {
    const newModifier = preset
      ? { id: generateId(), name: preset.name, multiplier: preset.multiplier }
      : { id: generateId(), name: '', multiplier: 1.0 }
    setFormData(prev => ({
      ...prev,
      modifiers: [...prev.modifiers, newModifier]
    }))
  }

  const updateModifier = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      modifiers: prev.modifiers.map(m =>
        m.id === id ? { ...m, [field]: value } : m
      )
    }))
  }

  const removeModifier = (id) => {
    setFormData(prev => ({
      ...prev,
      modifiers: prev.modifiers.filter(m => m.id !== id)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!formData.name.trim()) throw new Error('Service name is required')
      if (!formData.category) throw new Error('Category is required')

      const data = {
        ...formData,
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
        dailyRate: formData.dailyRate ? parseFloat(formData.dailyRate) : null,
        weeklyRate: formData.weeklyRate ? parseFloat(formData.weeklyRate) : null,
        unitRate: formData.unitRate ? parseFloat(formData.unitRate) : null,
        fixedRate: formData.fixedRate ? parseFloat(formData.fixedRate) : null,
        baseFee: formData.baseFee ? parseFloat(formData.baseFee) : null,
        minimumCharge: formData.minimumCharge ? parseFloat(formData.minimumCharge) : null,
        volumeTiers: formData.volumeTiers.map(t => ({
          ...t,
          upTo: t.upTo ? parseFloat(t.upTo) : null,
          rate: t.rate ? parseFloat(t.rate) : 0
        })),
        deliverables: formData.deliverables.map(d => ({
          ...d,
          price: d.price ? parseFloat(d.price) : 0
        })),
        modifiers: formData.modifiers.map(m => ({
          ...m,
          multiplier: m.multiplier ? parseFloat(m.multiplier) : 1.0
        }))
      }

      if (service) {
        await updateService(service.id, data)
      } else {
        await createService(data, userId)
      }

      onSave()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'deliverables', label: 'Deliverables' },
    { id: 'modifiers', label: 'Modifiers' }
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={service ? 'Edit Service' : 'Add Service'}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-4 -mx-6 px-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-aeria-navy text-aeria-navy'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="label">Service Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input"
                    placeholder="e.g., Aerial Photogrammetry Survey"
                  />
                </div>

                <div>
                  <label className="label">Category <span className="text-red-500">*</span></label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="">Select category...</option>
                    {SERVICE_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input min-h-[80px]"
                  placeholder="Describe what this service includes..."
                />
              </div>

              <div>
                <label className="label">Internal Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="input min-h-[60px]"
                  placeholder="Internal notes, requirements, equipment needed..."
                />
              </div>
            </>
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <>
              {/* Pricing Type Selection */}
              <div>
                <label className="label">Pricing Model</label>
                <div className="grid grid-cols-3 gap-3">
                  {PRICING_TYPES.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, pricingType: type.value }))}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        formData.pricingType === type.value
                          ? 'border-aeria-navy bg-aeria-navy/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className={`text-sm font-medium ${formData.pricingType === type.value ? 'text-aeria-navy' : 'text-gray-900'}`}>
                        {type.label}
                      </p>
                      <p className="text-xs text-gray-500">{type.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time-Based Rates */}
              {formData.pricingType === 'time_based' && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Time-Based Rates
                  </h4>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="label">Hourly Rate ($)</label>
                      <input
                        type="number"
                        name="hourlyRate"
                        value={formData.hourlyRate}
                        onChange={handleChange}
                        className="input"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="label">Daily Rate ($)</label>
                      <input
                        type="number"
                        name="dailyRate"
                        value={formData.dailyRate}
                        onChange={handleChange}
                        className="input"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="label">Weekly Rate ($)</label>
                      <input
                        type="number"
                        name="weeklyRate"
                        value={formData.weeklyRate}
                        onChange={handleChange}
                        className="input"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Per-Unit Pricing */}
              {formData.pricingType === 'per_unit' && (
                <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                  <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Per-Unit Pricing
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Unit Type</label>
                      <select
                        name="unitType"
                        value={formData.unitType}
                        onChange={handleChange}
                        className="input"
                      >
                        {UNIT_TYPES.map(u => (
                          <option key={u.value} value={u.value}>{u.icon} {u.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">Rate per Unit ($)</label>
                      <input
                        type="number"
                        name="unitRate"
                        value={formData.unitRate}
                        onChange={handleChange}
                        className="input"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Volume Tiers */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <TrendingDown className="w-4 h-4" />
                        Volume Tiers (Optional)
                      </h5>
                      <button
                        type="button"
                        onClick={addVolumeTier}
                        className="text-xs text-aeria-navy hover:underline"
                      >
                        + Add Tier
                      </button>
                    </div>
                    {formData.volumeTiers.length === 0 ? (
                      <p className="text-xs text-gray-500">No volume tiers. Add tiers for quantity discounts.</p>
                    ) : (
                      <div className="space-y-2">
                        {formData.volumeTiers.map((tier, idx) => (
                          <div key={tier.id} className="flex items-center gap-2 bg-white p-2 rounded border border-gray-200">
                            <span className="text-xs text-gray-500 w-16">
                              {idx === 0 ? 'Up to' : `${formData.volumeTiers[idx - 1]?.upTo || 0}+ to`}
                            </span>
                            <input
                              type="number"
                              value={tier.upTo || ''}
                              onChange={(e) => updateVolumeTier(tier.id, 'upTo', e.target.value)}
                              className="input w-20 text-sm"
                              placeholder={idx === formData.volumeTiers.length - 1 ? '∞' : '0'}
                            />
                            <span className="text-xs text-gray-500">units →</span>
                            <div className="relative flex-1">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                              <input
                                type="number"
                                value={tier.rate || ''}
                                onChange={(e) => updateVolumeTier(tier.id, 'rate', e.target.value)}
                                className="input pl-5 text-sm"
                                placeholder="0.00"
                                step="0.01"
                              />
                            </div>
                            <span className="text-xs text-gray-500">/unit</span>
                            <button
                              type="button"
                              onClick={() => removeVolumeTier(tier.id)}
                              className="p-1 text-gray-400 hover:text-red-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Fixed Fee */}
              {formData.pricingType === 'fixed' && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Fixed Fee
                  </h4>
                  <div className="max-w-xs">
                    <label className="label">Fixed Price ($)</label>
                    <input
                      type="number"
                      name="fixedRate"
                      value={formData.fixedRate}
                      onChange={handleChange}
                      className="input"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
              )}

              {/* Base Fee & Minimum (all pricing types) */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Base/Mobilization Fee ($)</label>
                  <input
                    type="number"
                    name="baseFee"
                    value={formData.baseFee}
                    onChange={handleChange}
                    className="input"
                    placeholder="e.g., 500"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Added to every quote regardless of quantity</p>
                </div>
                <div>
                  <label className="label">Minimum Charge ($)</label>
                  <input
                    type="number"
                    name="minimumCharge"
                    value={formData.minimumCharge}
                    onChange={handleChange}
                    className="input"
                    placeholder="e.g., 1000"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Quote will not go below this amount</p>
                </div>
              </div>
            </>
          )}

          {/* Deliverables Tab */}
          {activeTab === 'deliverables' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Define deliverables that can be included or added as extras. Mark items as "included" for no additional charge.
              </p>

              {/* Quick Add from Common Deliverables */}
              <div>
                <label className="label">Quick Add Common Deliverables</label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_DELIVERABLES
                    .filter(cd => !formData.deliverables.some(d => d.name === cd.name))
                    .slice(0, 8)
                    .map(cd => (
                      <button
                        key={cd.name}
                        type="button"
                        onClick={() => addDeliverable(cd)}
                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                      >
                        + {cd.name}
                      </button>
                    ))}
                </div>
              </div>

              {/* Deliverables List */}
              <div className="space-y-2">
                {formData.deliverables.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <Package className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">No deliverables defined</p>
                    <button
                      type="button"
                      onClick={() => addDeliverable()}
                      className="mt-2 text-sm text-aeria-navy hover:underline"
                    >
                      + Add Custom Deliverable
                    </button>
                  </div>
                ) : (
                  <>
                    {formData.deliverables.map(d => (
                      <div key={d.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                        <input
                          type="text"
                          value={d.name}
                          onChange={(e) => updateDeliverable(d.id, 'name', e.target.value)}
                          className="input flex-1"
                          placeholder="Deliverable name"
                        />
                        <label className="flex items-center gap-2 text-sm whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={d.included || false}
                            onChange={(e) => updateDeliverable(d.id, 'included', e.target.checked)}
                            className="rounded border-gray-300 text-aeria-navy focus:ring-aeria-navy"
                          />
                          Included
                        </label>
                        <div className="relative w-24">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                          <input
                            type="number"
                            value={d.price || ''}
                            onChange={(e) => updateDeliverable(d.id, 'price', e.target.value)}
                            className="input pl-5 text-sm"
                            placeholder="0"
                            min="0"
                            disabled={d.included}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDeliverable(d.id)}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addDeliverable()}
                      className="w-full py-2 text-sm text-aeria-navy hover:bg-aeria-navy/5 rounded-lg border border-dashed border-gray-300"
                    >
                      + Add Custom Deliverable
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Modifiers Tab */}
          {activeTab === 'modifiers' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Define multipliers that can be applied to adjust pricing (e.g., rush fees, difficulty adjustments).
              </p>

              {/* Quick Add from Common Modifiers */}
              <div>
                <label className="label">Quick Add Common Modifiers</label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_MODIFIERS
                    .filter(cm => !formData.modifiers.some(m => m.name === cm.name))
                    .map(cm => (
                      <button
                        key={cm.name}
                        type="button"
                        onClick={() => addModifier(cm)}
                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                      >
                        + {cm.name} ({((cm.multiplier - 1) * 100).toFixed(0)}%)
                      </button>
                    ))}
                </div>
              </div>

              {/* Modifiers List */}
              <div className="space-y-2">
                {formData.modifiers.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <Percent className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">No modifiers defined</p>
                    <button
                      type="button"
                      onClick={() => addModifier()}
                      className="mt-2 text-sm text-aeria-navy hover:underline"
                    >
                      + Add Custom Modifier
                    </button>
                  </div>
                ) : (
                  <>
                    {formData.modifiers.map(m => (
                      <div key={m.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                        <input
                          type="text"
                          value={m.name}
                          onChange={(e) => updateModifier(m.id, 'name', e.target.value)}
                          className="input flex-1"
                          placeholder="Modifier name"
                        />
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={m.multiplier || ''}
                            onChange={(e) => updateModifier(m.id, 'multiplier', e.target.value)}
                            className="input w-20 text-sm text-center"
                            placeholder="1.00"
                            step="0.05"
                            min="0.5"
                            max="5"
                          />
                          <span className="text-xs text-gray-500">×</span>
                        </div>
                        <span className="text-xs text-gray-500 w-16 text-right">
                          {m.multiplier > 1 ? `+${((m.multiplier - 1) * 100).toFixed(0)}%` :
                           m.multiplier < 1 ? `-${((1 - m.multiplier) * 100).toFixed(0)}%` : '—'}
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
                    <button
                      type="button"
                      onClick={() => addModifier()}
                      className="w-full py-2 text-sm text-aeria-navy hover:bg-aeria-navy/5 rounded-lg border border-dashed border-gray-300"
                    >
                      + Add Custom Modifier
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <ModalFooter>
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : service ? 'Save Changes' : 'Add Service'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  )
}

export default function Services() {
  const { user } = useAuth()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState(null)

  const loadServices = async () => {
    try {
      const data = await getServices(user?.uid)
      setServices(data)
    } catch (err) {
      console.error('Failed to load services:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadServices()
    }
  }, [user])

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      await deleteService(id)
      loadServices()
    } catch (err) {
      console.error('Failed to delete service:', err)
    }
  }

  // Filter services
  const filteredServices = services.filter(service => {
    const matchesSearch =
      service.name?.toLowerCase().includes(search.toLowerCase()) ||
      service.description?.toLowerCase().includes(search.toLowerCase())

    const matchesCategory = filterCategory === 'all' || service.category === filterCategory
    const matchesStatus = filterStatus === 'all' || service.status === filterStatus

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Calculate metrics
  const activeCount = services.filter(s => s.status === 'active').length
  const avgHourlyRate = services.filter(s => s.hourlyRate).reduce((sum, s) => sum + s.hourlyRate, 0) /
    (services.filter(s => s.hourlyRate).length || 1)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-aeria-navy border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-aeria-navy" />
            Services Library
          </h1>
          <p className="text-gray-500 mt-1">Define your service offerings and pricing</p>
        </div>
        <button
          onClick={() => { setEditingService(null); setShowModal(true) }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Services</p>
          <p className="text-2xl font-bold text-gray-900">{services.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Categories</p>
          <p className="text-2xl font-bold text-gray-900">
            {new Set(services.map(s => s.category)).size}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Avg. Hourly Rate</p>
          <p className="text-2xl font-bold text-gray-900">
            ${avgHourlyRate.toFixed(0)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="input w-full sm:w-48"
        >
          <option value="all">All Categories</option>
          {SERVICE_CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input w-full sm:w-32"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No services found</h3>
          <p className="text-gray-500 mt-1">
            {services.length === 0
              ? 'Add your first service to get started.'
              : 'Try adjusting your search or filters.'}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map(service => {
            const categoryLabel = SERVICE_CATEGORIES.find(c => c.value === service.category)?.label || service.category
            const pricingType = service.pricingType || 'time_based'
            const pricingLabel = PRICING_TYPES.find(p => p.value === pricingType)?.label || 'Time-Based'
            const unitTypeInfo = UNIT_TYPES.find(u => u.value === service.unitType)

            return (
              <div
                key={service.id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{service.name}</h3>
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Tag className="w-3 h-3" />
                      {categoryLabel}
                    </span>
                  </div>
                  <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                    service.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {service.status}
                  </span>
                </div>

                {service.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {service.description}
                  </p>
                )}

                {/* Pricing Type Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${
                    pricingType === 'time_based' ? 'bg-blue-100 text-blue-700' :
                    pricingType === 'per_unit' ? 'bg-purple-100 text-purple-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {pricingType === 'time_based' && <Clock className="w-3 h-3" />}
                    {pricingType === 'per_unit' && <Layers className="w-3 h-3" />}
                    {pricingType === 'fixed' && <DollarSign className="w-3 h-3" />}
                    {pricingLabel}
                  </span>
                  {service.volumeTiers?.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                      <TrendingDown className="w-3 h-3" />
                      Volume Tiers
                    </span>
                  )}
                </div>

                {/* Pricing Details */}
                <div className="py-3 border-t border-gray-100">
                  {pricingType === 'time_based' && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Hourly</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {service.hourlyRate ? `$${service.hourlyRate}` : '-'}
                        </p>
                      </div>
                      <div className="text-center border-x border-gray-100">
                        <p className="text-xs text-gray-400">Daily</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {service.dailyRate ? `$${service.dailyRate}` : '-'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Weekly</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {service.weeklyRate ? `$${service.weeklyRate}` : '-'}
                        </p>
                      </div>
                    </div>
                  )}

                  {pricingType === 'per_unit' && (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400">{unitTypeInfo?.label || 'Per Unit'}</p>
                        <p className="text-lg font-semibold text-gray-900">
                          ${service.unitRate || 0}
                          <span className="text-xs font-normal text-gray-500">/{unitTypeInfo?.plural || 'unit'}</span>
                        </p>
                      </div>
                      {service.baseFee > 0 && (
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Base Fee</p>
                          <p className="text-sm font-medium text-gray-700">+${service.baseFee}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {pricingType === 'fixed' && (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400">Fixed Price</p>
                        <p className="text-lg font-semibold text-gray-900">
                          ${service.fixedRate || 0}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Extras indicators */}
                {(service.deliverables?.length > 0 || service.modifiers?.length > 0) && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100 mt-2">
                    {service.deliverables?.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        {service.deliverables.length} deliverable{service.deliverables.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    {service.modifiers?.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Percent className="w-3 h-3" />
                        {service.modifiers.length} modifier{service.modifiers.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 mt-3">
                  <button
                    onClick={() => { setEditingService(service); setShowModal(true) }}
                    className="p-1.5 text-gray-400 hover:text-aeria-navy rounded"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Service Modal */}
      <ServiceModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingService(null) }}
        service={editingService}
        onSave={loadServices}
        userId={user?.uid}
      />
    </div>
  )
}
