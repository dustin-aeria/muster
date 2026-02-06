/**
 * Insurance.jsx
 * Insurance management page
 *
 * Provides a dedicated page to manage insurance policies,
 * track expiry dates, and maintain compliance records.
 */

import { useState, useEffect } from 'react'
import {
  ShieldCheck,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Upload,
  Trash2,
  Edit2,
  Calendar,
  DollarSign,
  FileText
} from 'lucide-react'
import { useOrganization } from '../hooks/useOrganization'
import {
  getInsurancePolicies,
  createInsurancePolicy,
  updateInsurancePolicy,
  deleteInsurancePolicy
} from '../lib/firestoreInsurance'
import Modal, { ModalFooter } from '../components/Modal'

// Insurance policy types
const POLICY_TYPES = [
  { value: 'liability', label: 'General Liability' },
  { value: 'aviation', label: 'Aviation Liability' },
  { value: 'hull', label: 'Hull/Equipment' },
  { value: 'professional', label: 'Professional Liability (E&O)' },
  { value: 'workers_comp', label: 'Workers Compensation' },
  { value: 'auto', label: 'Commercial Auto' },
  { value: 'umbrella', label: 'Umbrella/Excess' },
  { value: 'cyber', label: 'Cyber Liability' },
  { value: 'property', label: 'Property Insurance' },
  { value: 'other', label: 'Other' }
]

// Policy status helper
function getPolicyStatus(expiryDate) {
  if (!expiryDate) return { status: 'unknown', label: 'No Expiry Set', color: 'gray' }

  const expiry = new Date(expiryDate)
  const today = new Date()
  const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))

  if (daysUntilExpiry < 0) {
    return { status: 'expired', label: 'Expired', color: 'red', days: Math.abs(daysUntilExpiry) }
  } else if (daysUntilExpiry <= 30) {
    return { status: 'expiring', label: 'Expiring Soon', color: 'yellow', days: daysUntilExpiry }
  } else {
    return { status: 'active', label: 'Active', color: 'green', days: daysUntilExpiry }
  }
}

// Status badge component
function StatusBadge({ expiryDate }) {
  const { status, label, color, days } = getPolicyStatus(expiryDate)

  const colorClasses = {
    red: 'bg-red-100 text-red-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    green: 'bg-green-100 text-green-700',
    gray: 'bg-gray-100 text-gray-600'
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colorClasses[color]}`}>
      {status === 'expired' && <AlertTriangle className="w-3 h-3" />}
      {status === 'expiring' && <Clock className="w-3 h-3" />}
      {status === 'active' && <CheckCircle className="w-3 h-3" />}
      {label}
      {days !== undefined && status !== 'active' && ` (${days}d)`}
    </span>
  )
}

// Policy modal component
function PolicyModal({ isOpen, onClose, policy, onSave }) {
  const [formData, setFormData] = useState({
    policyType: '',
    policyNumber: '',
    provider: '',
    coverageAmount: '',
    premium: '',
    effectiveDate: '',
    expiryDate: '',
    description: '',
    documentUrl: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (policy) {
      setFormData({
        policyType: policy.policyType || '',
        policyNumber: policy.policyNumber || '',
        provider: policy.provider || '',
        coverageAmount: policy.coverageAmount || '',
        premium: policy.premium || '',
        effectiveDate: policy.effectiveDate || '',
        expiryDate: policy.expiryDate || '',
        description: policy.description || '',
        documentUrl: policy.documentUrl || '',
        notes: policy.notes || ''
      })
    } else {
      setFormData({
        policyType: '',
        policyNumber: '',
        provider: '',
        coverageAmount: '',
        premium: '',
        effectiveDate: '',
        expiryDate: '',
        description: '',
        documentUrl: '',
        notes: ''
      })
    }
    setError('')
  }, [policy, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!formData.policyType) throw new Error('Policy type is required')
      if (!formData.provider) throw new Error('Provider is required')
      if (!formData.expiryDate) throw new Error('Expiry date is required')

      const data = {
        ...formData,
        organizationId,
        coverageAmount: formData.coverageAmount ? parseFloat(formData.coverageAmount) : null,
        premium: formData.premium ? parseFloat(formData.premium) : null
      }

      if (policy) {
        await updateInsurancePolicy(policy.id, data)
      } else {
        await createInsurancePolicy(data)
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
      title={policy ? 'Edit Insurance Policy' : 'Add Insurance Policy'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Policy Type <span className="text-red-500">*</span></label>
            <select
              name="policyType"
              value={formData.policyType}
              onChange={handleChange}
              className="input"
            >
              <option value="">Select type...</option>
              {POLICY_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Policy Number</label>
            <input
              type="text"
              name="policyNumber"
              value={formData.policyNumber}
              onChange={handleChange}
              className="input"
              placeholder="e.g., POL-12345"
            />
          </div>
        </div>

        <div>
          <label className="label">Insurance Provider <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="provider"
            value={formData.provider}
            onChange={handleChange}
            className="input"
            placeholder="e.g., Global Aerospace, AIG"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Coverage Amount ($)</label>
            <input
              type="number"
              name="coverageAmount"
              value={formData.coverageAmount}
              onChange={handleChange}
              className="input"
              placeholder="e.g., 2000000"
              min="0"
            />
          </div>
          <div>
            <label className="label">Annual Premium ($)</label>
            <input
              type="number"
              name="premium"
              value={formData.premium}
              onChange={handleChange}
              className="input"
              placeholder="e.g., 5000"
              min="0"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Effective Date</label>
            <input
              type="date"
              name="effectiveDate"
              value={formData.effectiveDate}
              onChange={handleChange}
              className="input"
            />
          </div>
          <div>
            <label className="label">Expiry Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input min-h-[80px]"
            placeholder="Coverage details, exclusions, special conditions..."
          />
        </div>

        <div>
          <label className="label">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="input min-h-[60px]"
            placeholder="Internal notes..."
          />
        </div>

        <ModalFooter>
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : policy ? 'Save Changes' : 'Add Policy'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  )
}

export default function Insurance() {
  const { organizationId } = useOrganization()
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState(null)

  const loadPolicies = async () => {
    if (!organizationId) return
    try {
      const data = await getInsurancePolicies(organizationId)
      setPolicies(data)
    } catch (err) {
      console.error('Failed to load policies:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (organizationId) {
      loadPolicies()
    }
  }, [organizationId])

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this policy?')) return

    try {
      await deleteInsurancePolicy(id)
      loadPolicies()
    } catch (err) {
      console.error('Failed to delete policy:', err)
    }
  }

  // Filter policies
  const filteredPolicies = policies.filter(policy => {
    const matchesSearch =
      policy.provider?.toLowerCase().includes(search.toLowerCase()) ||
      policy.policyNumber?.toLowerCase().includes(search.toLowerCase()) ||
      policy.policyType?.toLowerCase().includes(search.toLowerCase())

    const matchesType = filterType === 'all' || policy.policyType === filterType

    const status = getPolicyStatus(policy.expiryDate)
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && status.status === 'active') ||
      (filterStatus === 'expiring' && status.status === 'expiring') ||
      (filterStatus === 'expired' && status.status === 'expired')

    return matchesSearch && matchesType && matchesStatus
  })

  // Calculate metrics
  const metrics = {
    total: policies.length,
    active: policies.filter(p => getPolicyStatus(p.expiryDate).status === 'active').length,
    expiring: policies.filter(p => getPolicyStatus(p.expiryDate).status === 'expiring').length,
    expired: policies.filter(p => getPolicyStatus(p.expiryDate).status === 'expired').length,
    totalCoverage: policies.reduce((sum, p) => sum + (p.coverageAmount || 0), 0),
    totalPremium: policies.reduce((sum, p) => sum + (p.premium || 0), 0)
  }

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
            <ShieldCheck className="w-7 h-7 text-aeria-navy" />
            Insurance Management
          </h1>
          <p className="text-gray-500 mt-1">Track and manage insurance policies and coverage</p>
        </div>
        <button
          onClick={() => { setEditingPolicy(null); setShowModal(true) }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Policy
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Policies</p>
          <p className="text-2xl font-bold text-gray-900">{metrics.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">{metrics.active}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Expiring Soon</p>
          <p className="text-2xl font-bold text-yellow-600">{metrics.expiring}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Expired</p>
          <p className="text-2xl font-bold text-red-600">{metrics.expired}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Coverage</p>
          <p className="text-2xl font-bold text-gray-900">${(metrics.totalCoverage / 1000000).toFixed(1)}M</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Annual Premiums</p>
          <p className="text-2xl font-bold text-gray-900">${metrics.totalPremium.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search policies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="input w-full sm:w-48"
        >
          <option value="all">All Types</option>
          {POLICY_TYPES.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input w-full sm:w-40"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="expiring">Expiring Soon</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Policies List */}
      {filteredPolicies.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No policies found</h3>
          <p className="text-gray-500 mt-1">
            {policies.length === 0
              ? 'Add your first insurance policy to get started.'
              : 'Try adjusting your search or filters.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Policy</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Provider</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden sm:table-cell">Coverage</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Expiry</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPolicies.map(policy => {
                const typeLabel = POLICY_TYPES.find(t => t.value === policy.policyType)?.label || policy.policyType
                return (
                  <tr key={policy.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{typeLabel}</p>
                      {policy.policyNumber && (
                        <p className="text-sm text-gray-500">{policy.policyNumber}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{policy.provider}</td>
                    <td className="px-4 py-3 text-gray-700 hidden sm:table-cell">
                      {policy.coverageAmount
                        ? `$${(policy.coverageAmount / 1000000).toFixed(1)}M`
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-700 hidden md:table-cell">
                      {policy.expiryDate || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge expiryDate={policy.expiryDate} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditingPolicy(policy); setShowModal(true) }}
                          className="p-1.5 text-gray-400 hover:text-aeria-navy rounded"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(policy.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Policy Modal */}
      <PolicyModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingPolicy(null) }}
        policy={editingPolicy}
        onSave={loadPolicies}
      />
    </div>
  )
}
