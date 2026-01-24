/**
 * InsuranceManager.jsx
 * Manage insurance policies, documents, and expiry tracking
 *
 * @location src/components/insurance/InsuranceManager.jsx
 */

import { useState, useEffect, useRef } from 'react'
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Upload,
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
  X,
  Save,
  Building,
  DollarSign
} from 'lucide-react'
import { format } from 'date-fns'
import {
  getInsurancePolicies,
  createInsurancePolicy,
  updateInsurancePolicy,
  deleteInsurancePolicy,
  addPolicyDocument,
  removePolicyDocument,
  getInsuranceMetrics,
  INSURANCE_TYPES,
  INSURANCE_STATUS,
  calculateInsuranceStatus
} from '../../lib/firestoreInsurance'

export default function InsuranceManager({ operatorId }) {
  const [policies, setPolicies] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    type: 'liability',
    carrier: '',
    policyNumber: '',
    coverageAmount: '',
    effectiveDate: '',
    expiryDate: '',
    notes: ''
  })

  // File upload
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (operatorId) {
      loadData()
    }
  }, [operatorId])

  const loadData = async () => {
    setLoading(true)
    try {
      const [policiesData, metricsData] = await Promise.all([
        getInsurancePolicies(operatorId),
        getInsuranceMetrics(operatorId)
      ])
      setPolicies(policiesData)
      setMetrics(metricsData)
    } catch (err) {
      console.error('Error loading insurance data:', err)
      setError('Failed to load insurance policies')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingPolicy(null)
    setFormData({
      type: 'liability',
      carrier: '',
      policyNumber: '',
      coverageAmount: '',
      effectiveDate: '',
      expiryDate: '',
      notes: ''
    })
    setShowModal(true)
  }

  const handleEdit = (policy) => {
    setEditingPolicy(policy)
    setFormData({
      type: policy.type || 'liability',
      carrier: policy.carrier || '',
      policyNumber: policy.policyNumber || '',
      coverageAmount: policy.coverageAmount || '',
      effectiveDate: policy.effectiveDate
        ? format(policy.effectiveDate.toDate?.() || new Date(policy.effectiveDate), 'yyyy-MM-dd')
        : '',
      expiryDate: policy.expiryDate
        ? format(policy.expiryDate.toDate?.() || new Date(policy.expiryDate), 'yyyy-MM-dd')
        : '',
      notes: policy.notes || ''
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.carrier || !formData.policyNumber) {
      alert('Please fill in carrier and policy number')
      return
    }

    setSaving(true)
    try {
      const policyData = {
        ...formData,
        operatorId,
        effectiveDate: formData.effectiveDate ? new Date(formData.effectiveDate) : null,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : null
      }

      if (editingPolicy) {
        await updateInsurancePolicy(editingPolicy.id, policyData)
      } else {
        await createInsurancePolicy(policyData)
      }

      setShowModal(false)
      loadData()
    } catch (err) {
      console.error('Error saving policy:', err)
      alert('Failed to save policy')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (policy) => {
    if (!confirm(`Delete ${INSURANCE_TYPES[policy.type]?.label} policy from ${policy.carrier}?`)) return

    try {
      await deleteInsurancePolicy(policy.id)
      loadData()
    } catch (err) {
      console.error('Error deleting policy:', err)
      alert('Failed to delete policy')
    }
  }

  const handleFileUpload = async (policyId, event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      await addPolicyDocument(policyId, file)
      loadData()
    } catch (err) {
      console.error('Error uploading document:', err)
      alert(err.message || 'Failed to upload document')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteDocument = async (policyId, documentPath) => {
    if (!confirm('Delete this document?')) return

    try {
      await removePolicyDocument(policyId, documentPath)
      loadData()
    } catch (err) {
      console.error('Error deleting document:', err)
      alert('Failed to delete document')
    }
  }

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A'
    try {
      const date = dateValue.toDate?.() || new Date(dateValue)
      return format(date, 'MMM d, yyyy')
    } catch {
      return 'Invalid date'
    }
  }

  const getStatusColor = (status) => {
    if (status === 'active') return 'text-green-600'
    if (status === 'expiring_soon') return 'text-yellow-600'
    if (status === 'expired') return 'text-red-600'
    return 'text-gray-600'
  }

  const getStatusIcon = (status) => {
    if (status === 'active') return CheckCircle
    if (status === 'expiring_soon') return Clock
    if (status === 'expired') return AlertTriangle
    return FileText
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-aeria-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500">Total Policies</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalPolicies}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-500">Active</span>
            </div>
            <p className="text-2xl font-bold text-green-600 mt-1">{metrics.active}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-gray-500">Expiring Soon</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{metrics.expiringSoon}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-gray-500">Expired</span>
            </div>
            <p className="text-2xl font-bold text-red-600 mt-1">{metrics.expired}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Insurance Policies</h3>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-aeria-blue text-white rounded-lg hover:bg-aeria-navy transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Policy
        </button>
      </div>

      {/* Policies List */}
      {policies.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <Shield className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No insurance policies yet</p>
          <button
            onClick={handleAdd}
            className="mt-4 text-aeria-blue hover:text-aeria-navy font-medium"
          >
            Add your first policy
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {policies.map((policy) => {
            const status = calculateInsuranceStatus(policy)
            const StatusIcon = getStatusIcon(status)
            const typeInfo = INSURANCE_TYPES[policy.type] || INSURANCE_TYPES.other

            return (
              <div
                key={policy.id}
                className={`bg-white rounded-lg border-l-4 shadow-sm p-4 ${
                  status === 'active' ? 'border-green-500' :
                  status === 'expiring_soon' ? 'border-yellow-500' :
                  'border-red-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`p-2 rounded-lg ${
                        status === 'active' ? 'bg-green-100' :
                        status === 'expiring_soon' ? 'bg-yellow-100' :
                        'bg-red-100'
                      }`}>
                        <StatusIcon className={`w-5 h-5 ${getStatusColor(status)}`} />
                      </span>
                      <div>
                        <h4 className="font-semibold text-gray-900">{typeInfo.label}</h4>
                        <p className="text-sm text-gray-600">{policy.carrier}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Policy Number</p>
                        <p className="font-medium">{policy.policyNumber}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Coverage</p>
                        <p className="font-medium">
                          {policy.coverageAmount ? `$${Number(policy.coverageAmount).toLocaleString()}` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Effective Date</p>
                        <p className="font-medium">{formatDate(policy.effectiveDate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Expiry Date</p>
                        <p className={`font-medium ${getStatusColor(status)}`}>
                          {formatDate(policy.expiryDate)}
                        </p>
                      </div>
                    </div>

                    {/* Documents */}
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-2">Documents</p>
                      <div className="flex flex-wrap gap-2">
                        {policy.documents?.map((doc, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm"
                          >
                            <FileText className="w-4 h-4 text-gray-400" />
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-aeria-blue hover:underline"
                            >
                              {doc.name}
                            </a>
                            <button
                              onClick={() => handleDeleteDocument(policy.id, doc.path)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <label className="flex items-center gap-2 px-3 py-1.5 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-aeria-blue hover:text-aeria-blue cursor-pointer transition-colors">
                          <Upload className="w-4 h-4" />
                          {uploading ? 'Uploading...' : 'Upload'}
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => handleFileUpload(policy.id, e)}
                            disabled={uploading}
                          />
                        </label>
                      </div>
                    </div>

                    {policy.notes && (
                      <p className="mt-3 text-sm text-gray-600">{policy.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(policy)}
                      className="p-2 text-gray-400 hover:text-aeria-blue rounded-lg hover:bg-gray-100"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(policy)}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingPolicy ? 'Edit Policy' : 'Add Insurance Policy'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Insurance Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
                >
                  {Object.entries(INSURANCE_TYPES).map(([key, type]) => (
                    <option key={key} value={key}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Insurance Carrier *
                </label>
                <input
                  type="text"
                  value={formData.carrier}
                  onChange={(e) => setFormData(prev => ({ ...prev, carrier: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
                  placeholder="e.g., XYZ Insurance Company"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Policy Number *
                </label>
                <input
                  type="text"
                  value={formData.policyNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, policyNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
                  placeholder="e.g., POL-123456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coverage Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={formData.coverageAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, coverageAmount: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
                    placeholder="e.g., 1000000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Effective Date
                  </label>
                  <input
                    type="date"
                    value={formData.effectiveDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, effectiveDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
                  rows={3}
                  placeholder="Additional notes about this policy..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-aeria-blue text-white rounded-lg hover:bg-aeria-navy transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {editingPolicy ? 'Update Policy' : 'Add Policy'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
