/**
 * CORAuditModal.jsx
 * Modal for scheduling and managing COR audits
 */

import { useState, useEffect } from 'react'
import { X, Save, FileCheck, Calendar } from 'lucide-react'
import {
  scheduleAudit,
  updateAudit,
  AUDIT_TYPES,
  AUDIT_STATUS,
  COR_ELEMENTS,
  COR_REQUIREMENTS
} from '../../lib/firestoreCORAudit'

export default function CORAuditModal({
  isOpen,
  onClose,
  audit,
  operatorId,
  auditors = []
}) {
  const [formData, setFormData] = useState({
    auditType: 'certification',
    auditorType: 'internal',
    auditorId: '',
    auditorName: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    scope: ''
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const isEditing = !!audit

  useEffect(() => {
    if (audit) {
      setFormData({
        auditType: audit.auditType || 'certification',
        auditorType: audit.auditorType || 'internal',
        auditorId: audit.auditorId || '',
        auditorName: audit.auditorName || '',
        scheduledDate: audit.scheduledDate
          ? (audit.scheduledDate.toDate?.() || new Date(audit.scheduledDate)).toISOString().split('T')[0]
          : '',
        scope: audit.scope || ''
      })
    }
  }, [audit])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Auto-fill auditor name when auditor selected
    if (name === 'auditorId' && value) {
      const selectedAuditor = auditors.find(a => a.id === value)
      if (selectedAuditor) {
        setFormData(prev => ({
          ...prev,
          auditorName: selectedAuditor.name,
          auditorType: selectedAuditor.auditorType
        }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      const auditData = {
        ...formData,
        operatorId,
        scheduledDate: new Date(formData.scheduledDate)
      }

      if (isEditing) {
        await updateAudit(audit.id, auditData)
      } else {
        await scheduleAudit(auditData)
      }

      onClose()
    } catch (err) {
      console.error('Error saving audit:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-aeria-blue" />
            {isEditing ? `Audit ${audit.auditNumber}` : 'Schedule Safety Audit'}
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
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Status: <span className={`px-2 py-0.5 rounded-full text-xs ${AUDIT_STATUS[audit.status]?.color}`}>
                  {AUDIT_STATUS[audit.status]?.label}
                </span>
              </p>
              {audit.overallScore !== null && (
                <p className="text-sm text-gray-600 mt-1">
                  Score: <span className={`font-bold ${audit.overallScore >= COR_REQUIREMENTS.minimumOverallScore ? 'text-green-600' : 'text-red-600'}`}>
                    {audit.overallScore}%
                  </span>
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Audit Type *</label>
            <select
              name="auditType"
              value={formData.auditType}
              onChange={handleChange}
              required
              disabled={isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent disabled:bg-gray-100"
            >
              {Object.entries(AUDIT_TYPES).map(([key, type]) => (
                <option key={key} value={key}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date *</label>
            <input
              type="date"
              name="scheduledDate"
              value={formData.scheduledDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Auditor Type *</label>
              <select
                name="auditorType"
                value={formData.auditorType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
              >
                <option value="internal">Internal</option>
                <option value="external">External</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Auditor</label>
              <select
                name="auditorId"
                value={formData.auditorId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
              >
                <option value="">Select or enter name</option>
                {auditors
                  .filter(a => a.auditorType === formData.auditorType && a.calculatedStatus === 'active')
                  .map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Auditor Name *</label>
            <input
              type="text"
              name="auditorName"
              value={formData.auditorName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
              placeholder="Name of auditor"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Audit Scope/Notes</label>
            <textarea
              name="scope"
              value={formData.scope}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
              placeholder="Describe the scope of this audit..."
            />
          </div>

          {/* Element Scores (for viewing completed audits) */}
          {isEditing && audit.elementScores && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Element Scores</h3>
              <div className="space-y-2">
                {audit.elementScores.map((score, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{score.elementName}</span>
                    <span className={`font-medium ${
                      score.totalScore === null ? 'text-gray-400' :
                      score.passed ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {score.totalScore !== null ? `${score.totalScore}%` : '-'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-aeria-blue text-white rounded-lg hover:bg-aeria-navy transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : isEditing ? 'Update' : 'Schedule Audit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
