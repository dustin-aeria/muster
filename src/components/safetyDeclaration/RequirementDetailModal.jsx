/**
 * RequirementDetailModal.jsx
 * Modal for viewing and editing individual requirement details
 *
 * @location src/components/safetyDeclaration/RequirementDetailModal.jsx
 */

import { useState, useEffect } from 'react'
import {
  X,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Eye,
  Calculator,
  TestTube,
  FileText,
  Save,
  Link2,
  ExternalLink,
  Info
} from 'lucide-react'
import {
  updateRequirement,
  REQUIREMENT_STATUSES,
  COMPLIANCE_METHODS,
  REQUIREMENT_SECTIONS,
  KINETIC_ENERGY_CATEGORIES,
  RELIABILITY_TARGETS
} from '../../lib/firestoreSafetyDeclaration'

export default function RequirementDetailModal({
  isOpen,
  onClose,
  requirement,
  declarationId,
  declaration,
  onSave
}) {
  const [formData, setFormData] = useState({
    status: 'not_started',
    complianceMethod: null,
    notes: ''
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // Initialize form data when requirement changes
  useEffect(() => {
    if (requirement) {
      setFormData({
        status: requirement.status || 'not_started',
        complianceMethod: requirement.complianceMethod || null,
        notes: requirement.notes || ''
      })
    }
  }, [requirement])

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      await updateRequirement(declarationId, requirement.id, {
        status: formData.status,
        complianceMethod: formData.complianceMethod,
        notes: formData.notes
      })

      if (onSave) {
        onSave({
          ...requirement,
          ...formData
        })
      }

      onClose()
    } catch (err) {
      console.error('Error updating requirement:', err)
      setError(err.message || 'Failed to update requirement')
    } finally {
      setSaving(false)
    }
  }

  const getStatusIcon = (status, size = 'w-5 h-5') => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className={`${size} text-green-500`} />
      case 'in_progress':
        return <Clock className={`${size} text-yellow-500`} />
      case 'evidence_needed':
        return <AlertCircle className={`${size} text-orange-500`} />
      case 'not_applicable':
        return <Circle className={`${size} text-gray-300`} />
      case 'under_review':
        return <Eye className={`${size} text-purple-500`} />
      default:
        return <Circle className={`${size} text-gray-400`} />
    }
  }

  const getComplianceIcon = (method, size = 'w-5 h-5') => {
    switch (method) {
      case 'inspection':
        return <Eye className={size} />
      case 'analysis':
        return <Calculator className={size} />
      case 'test':
        return <TestTube className={size} />
      case 'service_experience':
        return <FileText className={size} />
      default:
        return null
    }
  }

  // Get section info
  const sectionInfo = REQUIREMENT_SECTIONS[requirement?.sectionId]

  // Get reliability target if applicable (922.07)
  const keCategory = declaration?.rpasDetails?.kineticEnergyCategory || 'low'
  const showReliabilityTargets = requirement?.sectionId === '922.07'

  if (!isOpen || !requirement) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <span className="font-mono">{requirement.requirementId}</span>
                <span>&bull;</span>
                <span>CAR {requirement.sectionId}</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                {sectionInfo?.title || requirement.sectionTitle}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Requirement Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requirement
              </label>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-900">{requirement.text}</p>
              </div>
            </div>

            {/* Acceptance Criteria */}
            {requirement.acceptanceCriteria && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Acceptance Criteria
                </label>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-900">{requirement.acceptanceCriteria}</p>
                </div>
              </div>
            )}

            {/* Reliability Targets for 922.07 */}
            {showReliabilityTargets && (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-amber-900">
                      Reliability Targets ({KINETIC_ENERGY_CATEGORIES[keCategory]?.label || 'Low'} KE)
                    </h4>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-amber-800">
                      <div>Catastrophic: {RELIABILITY_TARGETS.catastrophic[keCategory]}</div>
                      <div>Hazardous: {RELIABILITY_TARGETS.hazardous[keCategory]}</div>
                      <div>Major: {RELIABILITY_TARGETS.major[keCategory]}</div>
                      <div>Minor: {RELIABILITY_TARGETS.minor[keCategory]}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Robustness Level for 922.08 */}
            {requirement.robustnessLevel && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-purple-900">
                    Robustness Level Required:
                  </span>
                  <span className="font-medium text-purple-900 capitalize">
                    {requirement.robustnessLevel}
                  </span>
                </div>
              </div>
            )}

            {/* Status Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Status
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(REQUIREMENT_STATUSES).map(([key, status]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, status: key }))}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      formData.status === key
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {getStatusIcon(key)}
                    <span className="text-sm font-medium text-gray-900">{status.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Compliance Method Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Compliance Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(COMPLIANCE_METHODS).map(([key, method]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      complianceMethod: prev.complianceMethod === key ? null : key
                    }))}
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                      formData.complianceMethod === key
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      formData.complianceMethod === key ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {getComplianceIcon(key)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{method.label}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{method.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any notes about compliance, testing approach, or other relevant information..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Linked Evidence */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Linked Evidence
              </label>
              {requirement.evidenceIds?.length > 0 ? (
                <div className="space-y-2">
                  {requirement.evidenceIds.map((evidenceId, index) => (
                    <div
                      key={evidenceId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">Evidence #{index + 1}</span>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                  <Link2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No evidence linked yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Evidence can be linked in Phase 5
                  </p>
                </div>
              )}
            </div>

            {/* Testable Indicator */}
            {requirement.testable !== undefined && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Testable:</span>
                {requirement.testable ? (
                  <span className="inline-flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    Yes
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-gray-500">
                    <Circle className="w-4 h-4" />
                    No (design review)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
