/**
 * CORCertificateModal.jsx
 * Modal for managing COR certificates
 */

import { useState, useEffect } from 'react'
import { X, Save, Award } from 'lucide-react'
import {
  issueCertificate,
  revokeCertificate,
  COR_TYPE,
  CERTIFICATE_STATUS
} from '../../lib/firestoreCORAudit'

export default function CORCertificateModal({
  isOpen,
  onClose,
  certificate,
  operatorId,
  audits = []
}) {
  const [formData, setFormData] = useState({
    certificateNumber: '',
    corType: 'OHS',
    certifyingPartner: '',
    issueDate: new Date().toISOString().split('T')[0],
    certificationAuditId: '',
    workSitesIncluded: '',
    classificationUnits: ''
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const isEditing = !!certificate

  useEffect(() => {
    if (certificate) {
      setFormData({
        certificateNumber: certificate.certificateNumber || '',
        corType: certificate.corType || 'OHS',
        certifyingPartner: certificate.certifyingPartner || '',
        issueDate: certificate.issueDate
          ? (certificate.issueDate.toDate?.() || new Date(certificate.issueDate)).toISOString().split('T')[0]
          : '',
        certificationAuditId: certificate.certificationAuditId || '',
        workSitesIncluded: certificate.workSitesIncluded?.join(', ') || '',
        classificationUnits: certificate.classificationUnits?.join(', ') || ''
      })
    }
  }, [certificate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      const certData = {
        ...formData,
        operatorId,
        issueDate: new Date(formData.issueDate),
        workSitesIncluded: formData.workSitesIncluded.split(',').map(s => s.trim()).filter(Boolean),
        classificationUnits: formData.classificationUnits.split(',').map(s => s.trim()).filter(Boolean)
      }

      await issueCertificate(certData)
      onClose()
    } catch (err) {
      console.error('Error saving certificate:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleRevoke = async () => {
    const reason = window.prompt('Enter reason for revocation:')
    if (!reason) return

    setSaving(true)
    try {
      await revokeCertificate(certificate.id, reason)
      onClose()
    } catch (err) {
      console.error('Error revoking certificate:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = timestamp?.toDate?.() || new Date(timestamp)
    return date.toLocaleDateString('en-CA')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-aeria-blue" />
            {isEditing ? 'Certificate Details' : 'Issue Safety Certificate'}
          </h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
          )}

          {isEditing && (
            <div className={`p-4 rounded-lg ${
              certificate.calculatedStatus === 'active' ? 'bg-green-50' :
              certificate.calculatedStatus === 'expiring' ? 'bg-yellow-50' : 'bg-red-50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{certificate.certificateNumber}</p>
                  <p className="text-sm text-gray-600">{COR_TYPE[certificate.corType]?.label}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${CERTIFICATE_STATUS[certificate.calculatedStatus]?.color}`}>
                  {CERTIFICATE_STATUS[certificate.calculatedStatus]?.label}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Issued:</span>
                  <span className="ml-1 text-gray-900">{formatDate(certificate.issueDate)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Expires:</span>
                  <span className="ml-1 text-gray-900">{formatDate(certificate.expiryDate)}</span>
                </div>
              </div>
            </div>
          )}

          {!isEditing && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Number *</label>
                  <input
                    type="text"
                    name="certificateNumber"
                    value={formData.certificateNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Type *</label>
                  <select
                    name="corType"
                    value={formData.corType}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
                  >
                    {Object.entries(COR_TYPE).map(([key, type]) => (
                      <option key={key} value={key}>{type.label} ({type.rebate}% rebate)</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certifying Partner *</label>
                <input
                  type="text"
                  name="certifyingPartner"
                  value={formData.certifyingPartner}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
                  placeholder="e.g., BC Construction Safety Alliance"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date *</label>
                <input
                  type="date"
                  name="issueDate"
                  value={formData.issueDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">Certificate valid for 3 years from issue date</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certification Audit</label>
                <select
                  name="certificationAuditId"
                  value={formData.certificationAuditId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
                >
                  <option value="">Select passed audit...</option>
                  {audits.map(a => (
                    <option key={a.id} value={a.id}>{a.auditNumber} - {a.overallScore}%</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work Sites Included</label>
                <input
                  type="text"
                  name="workSitesIncluded"
                  value={formData.workSitesIncluded}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
                  placeholder="Comma-separated list of work sites"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Classification Units (CUs)</label>
                <input
                  type="text"
                  name="classificationUnits"
                  value={formData.classificationUnits}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
                  placeholder="Comma-separated WorkSafeBC CU codes"
                />
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            {isEditing && certificate.status === 'active' ? (
              <button
                type="button"
                onClick={handleRevoke}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Revoke Certificate
              </button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isEditing ? 'Close' : 'Cancel'}
              </button>
              {!isEditing && (
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-aeria-blue text-white rounded-lg hover:bg-aeria-navy transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Issue Certificate'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
