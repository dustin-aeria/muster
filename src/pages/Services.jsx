/**
 * Services.jsx
 * Services library management page
 *
 * Allows users to define services they offer with associated
 * pricing (hourly/daily/weekly rates) for cost estimation.
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
  AlertCircle
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

// Service modal component
function ServiceModal({ isOpen, onClose, service, onSave, userId }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    hourlyRate: '',
    dailyRate: '',
    weeklyRate: '',
    minimumCharge: '',
    unit: 'hour',
    status: 'active',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        category: service.category || '',
        description: service.description || '',
        hourlyRate: service.hourlyRate || '',
        dailyRate: service.dailyRate || '',
        weeklyRate: service.weeklyRate || '',
        minimumCharge: service.minimumCharge || '',
        unit: service.unit || 'hour',
        status: service.status || 'active',
        notes: service.notes || ''
      })
    } else {
      setFormData({
        name: '',
        category: '',
        description: '',
        hourlyRate: '',
        dailyRate: '',
        weeklyRate: '',
        minimumCharge: '',
        unit: 'hour',
        status: 'active',
        notes: ''
      })
    }
    setError('')
  }, [service, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
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
        minimumCharge: formData.minimumCharge ? parseFloat(formData.minimumCharge) : null
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={service ? 'Edit Service' : 'Add Service'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

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

        {/* Pricing Section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Billing Rates
            <span className="text-xs font-normal text-gray-500">(Admin only - for cost estimation)</span>
          </h3>
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
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="label">Minimum Charge ($)</label>
              <input
                type="number"
                name="minimumCharge"
                value={formData.minimumCharge}
                onChange={handleChange}
                className="input"
                placeholder="e.g., 500"
                min="0"
              />
            </div>
            <div>
              <label className="label">Default Billing Unit</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="input"
              >
                <option value="hour">Per Hour</option>
                <option value="day">Per Day</option>
                <option value="week">Per Week</option>
                <option value="project">Per Project</option>
                <option value="acre">Per Acre</option>
                <option value="km">Per Kilometer</option>
              </select>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            These rates are used in the project cost estimator.
          </p>
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

                {/* Pricing */}
                <div className="grid grid-cols-3 gap-2 py-3 border-t border-gray-100">
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
