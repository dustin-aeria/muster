/**
 * ProjectServicesSection.jsx
 * Project services selection and customization for Project Overview
 *
 * Allows selecting services from the library with auto-population,
 * plus custom services. All fields are editable per-project.
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
  AlertCircle
} from 'lucide-react'
import { getServices } from '../../lib/firestore'
import { formatCurrency } from '../../lib/costEstimator'

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

    const projectService = {
      id: generateId(),
      sourceId: selectedService.id,
      sourceType: 'library',
      name: selectedService.name,
      category: selectedService.category,
      description: selectedService.description || '',
      estimatedHours: '',
      hourlyRate: selectedService.hourlyRate || 0,
      dailyRate: selectedService.dailyRate || 0,
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

    const projectService = {
      id: generateId(),
      sourceId: null,
      sourceType: 'custom',
      name: customForm.name.trim(),
      category: customForm.category,
      description: customForm.description.trim(),
      estimatedHours: customForm.estimatedHours ? parseFloat(customForm.estimatedHours) : '',
      hourlyRate: customForm.hourlyRate ? parseFloat(customForm.hourlyRate) : 0,
      dailyRate: customForm.dailyRate ? parseFloat(customForm.dailyRate) : 0,
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
      estimatedHours: editForm.estimatedHours ? parseFloat(editForm.estimatedHours) : '',
      hourlyRate: editForm.hourlyRate ? parseFloat(editForm.hourlyRate) : 0,
      dailyRate: editForm.dailyRate ? parseFloat(editForm.dailyRate) : 0
    })
    setIsEditing(false)
  }

  const estimatedCost = service.estimatedHours && service.hourlyRate
    ? service.estimatedHours * service.hourlyRate
    : null

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
            <p className="text-xs text-gray-500">
              {SERVICE_CATEGORIES[service.category] || service.category}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {service.estimatedHours && (
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {service.estimatedHours}h
            </span>
          )}
          {estimatedCost && (
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
            /* Edit Form */
            <div className="space-y-4">
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

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="input resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Est. Hours</label>
                  <input
                    type="number"
                    value={editForm.estimatedHours}
                    onChange={(e) => setEditForm(prev => ({ ...prev, estimatedHours: e.target.value }))}
                    min="0"
                    step="0.5"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Hourly Rate</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      value={editForm.hourlyRate}
                      onChange={(e) => setEditForm(prev => ({ ...prev, hourlyRate: e.target.value }))}
                      min="0"
                      className="input pl-7"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Daily Rate</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      value={editForm.dailyRate}
                      onChange={(e) => setEditForm(prev => ({ ...prev, dailyRate: e.target.value }))}
                      min="0"
                      className="input pl-7"
                    />
                  </div>
                </div>
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
            /* View Mode */
            <>
              {service.description && (
                <p className="text-sm text-gray-600 mb-3">{service.description}</p>
              )}

              <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                <div>
                  <span className="text-gray-500">Est. Hours:</span>
                  <span className="ml-2 font-medium">{service.estimatedHours || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Hourly:</span>
                  <span className="ml-2 font-medium">
                    {service.hourlyRate ? formatCurrency(service.hourlyRate) : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Daily:</span>
                  <span className="ml-2 font-medium">
                    {service.dailyRate ? formatCurrency(service.dailyRate) : '—'}
                  </span>
                </div>
              </div>

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

  // Calculate totals
  const totalEstimatedCost = projectServices.reduce((sum, s) => {
    if (s.estimatedHours && s.hourlyRate) {
      return sum + (s.estimatedHours * s.hourlyRate)
    }
    return sum
  }, 0)

  const totalHours = projectServices.reduce((sum, s) => {
    return sum + (parseFloat(s.estimatedHours) || 0)
  }, 0)

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
              {totalHours > 0 && (
                <span className="ml-3">
                  <Clock className="w-3.5 h-3.5 inline mr-1" />
                  {totalHours}h estimated
                </span>
              )}
            </div>
            {totalEstimatedCost > 0 && (
              <div className="text-right">
                <span className="text-gray-500">Est. Total:</span>
                <span className="ml-2 font-semibold text-gray-900">
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
