/**
 * AddPermitModal.jsx
 * Multi-step modal for creating and editing permits
 *
 * Steps:
 * 1. Basic info (type, name, number, authority, dates)
 * 2. Scope (geographic area, operation types, aircraft)
 * 3. Privileges & Conditions
 * 4. Documents & Notes
 *
 * @location src/components/permits/AddPermitModal.jsx
 */

import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  X,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Check,
  Plus,
  Trash2,
  FileCheck,
  Award,
  MapPin,
  Radio,
  UserCheck,
  FileText,
  AlertCircle
} from 'lucide-react'
import { Timestamp } from 'firebase/firestore'
import {
  PERMIT_TYPES,
  OPERATION_TYPES,
  CONDITION_CATEGORIES,
  createPermit,
  updatePermit
} from '../../lib/firestorePermits'

const TYPE_ICONS = {
  sfoc: FileCheck,
  cor: Award,
  land_access: MapPin,
  airspace_auth: Radio,
  client_approval: UserCheck,
  other: FileText
}

const STEPS = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'scope', label: 'Scope' },
  { id: 'privileges', label: 'Privileges & Conditions' },
  { id: 'documents', label: 'Notes' }
]

function formatDateForInput(date) {
  if (!date) return ''
  const d = date instanceof Timestamp ? date.toDate() : new Date(date)
  return d.toISOString().split('T')[0]
}

export default function AddPermitModal({ isOpen, onClose, onSave, permit = null }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isEditing = !!permit

  const [formData, setFormData] = useState({
    // Basic info
    type: 'sfoc',
    name: '',
    permitNumber: '',
    issuingAuthority: '',
    issuingOffice: '',
    contactEmail: '',
    issueDate: '',
    effectiveDate: '',
    expiryDate: '',

    // Scope
    geographicArea: '',
    operationTypes: [],
    aircraftRegistrations: [],

    // Privileges & Conditions
    privileges: [],
    conditions: [],
    notificationRequirements: [],

    // Notes
    notes: '',
    tags: []
  })

  // New privilege/condition form state
  const [newPrivilege, setNewPrivilege] = useState({ description: '', conditions: '', reference: '' })
  const [newCondition, setNewCondition] = useState({ category: 'operational', description: '', isCritical: false })

  useEffect(() => {
    if (permit) {
      setFormData({
        type: permit.type || 'sfoc',
        name: permit.name || '',
        permitNumber: permit.permitNumber || '',
        issuingAuthority: permit.issuingAuthority || '',
        issuingOffice: permit.issuingOffice || '',
        contactEmail: permit.contactEmail || '',
        issueDate: formatDateForInput(permit.issueDate),
        effectiveDate: formatDateForInput(permit.effectiveDate),
        expiryDate: formatDateForInput(permit.expiryDate),
        geographicArea: permit.geographicArea || '',
        operationTypes: permit.operationTypes || [],
        aircraftRegistrations: permit.aircraftRegistrations || [],
        privileges: permit.privileges || [],
        conditions: permit.conditions || [],
        notificationRequirements: permit.notificationRequirements || [],
        notes: permit.notes || '',
        tags: permit.tags || []
      })
    } else {
      // Reset form for new permit
      setFormData({
        type: 'sfoc',
        name: '',
        permitNumber: '',
        issuingAuthority: '',
        issuingOffice: '',
        contactEmail: '',
        issueDate: '',
        effectiveDate: '',
        expiryDate: '',
        geographicArea: '',
        operationTypes: [],
        aircraftRegistrations: [],
        privileges: [],
        conditions: [],
        notificationRequirements: [],
        notes: '',
        tags: []
      })
    }
    setCurrentStep(0)
    setError('')
  }, [permit, isOpen])

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleOperationType = (typeId) => {
    setFormData(prev => ({
      ...prev,
      operationTypes: prev.operationTypes.includes(typeId)
        ? prev.operationTypes.filter(t => t !== typeId)
        : [...prev.operationTypes, typeId]
    }))
  }

  const addPrivilege = () => {
    if (!newPrivilege.description.trim()) return
    setFormData(prev => ({
      ...prev,
      privileges: [...prev.privileges, { ...newPrivilege, id: `priv_${Date.now()}` }]
    }))
    setNewPrivilege({ description: '', conditions: '', reference: '' })
  }

  const removePrivilege = (id) => {
    setFormData(prev => ({
      ...prev,
      privileges: prev.privileges.filter(p => p.id !== id)
    }))
  }

  const addCondition = () => {
    if (!newCondition.description.trim()) return
    setFormData(prev => ({
      ...prev,
      conditions: [...prev.conditions, { ...newCondition, id: `cond_${Date.now()}` }]
    }))
    setNewCondition({ category: 'operational', description: '', isCritical: false })
  }

  const removeCondition = (id) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.filter(c => c.id !== id)
    }))
  }

  const validateStep = () => {
    setError('')

    if (currentStep === 0) {
      if (!formData.name.trim()) {
        setError('Permit name is required')
        return false
      }
      if (!formData.issueDate) {
        setError('Issue date is required')
        return false
      }
    }

    return true
  }

  const handleNext = () => {
    if (!validateStep()) return
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1))
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  const handleSubmit = async () => {
    if (!validateStep()) return

    try {
      setLoading(true)
      setError('')

      const permitData = {
        ...formData,
        issueDate: formData.issueDate ? Timestamp.fromDate(new Date(formData.issueDate)) : null,
        effectiveDate: formData.effectiveDate ? Timestamp.fromDate(new Date(formData.effectiveDate)) : null,
        expiryDate: formData.expiryDate ? Timestamp.fromDate(new Date(formData.expiryDate)) : null
      }

      if (isEditing) {
        await updatePermit(permit.id, permitData)
      } else {
        await createPermit(permitData)
      }

      onSave?.()
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to save permit')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const permitType = PERMIT_TYPES[formData.type]
  const TypeIcon = TYPE_ICONS[formData.type] || FileText

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TypeIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {isEditing ? 'Edit Permit' : 'Add Permit'}
                </h2>
                <p className="text-sm text-gray-500">{permitType?.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => index < currentStep && setCurrentStep(index)}
                  disabled={index > currentStep}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
                    index === currentStep
                      ? 'bg-blue-100 text-blue-700'
                      : index < currentStep
                      ? 'bg-green-100 text-green-700 cursor-pointer'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="w-4 h-4 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                  )}
                  <span className="hidden sm:inline">{step.label}</span>
                </button>
                {index < STEPS.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-300 mx-1" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Basic Info */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permit Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.values(PERMIT_TYPES).map(type => {
                    const Icon = TYPE_ICONS[type.id] || FileText
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => updateField('type', type.id)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          formData.type === type.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mb-1 ${formData.type === type.id ? 'text-blue-600' : 'text-gray-400'}`} />
                        <p className="text-sm font-medium text-gray-900">{type.shortName}</p>
                        <p className="text-xs text-gray-500">{type.authority}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permit Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., BVLOS Pipeline Inspection SFOC"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Permit Number
                  </label>
                  <input
                    type="text"
                    value={formData.permitNumber}
                    onChange={(e) => updateField('permitNumber', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., SFOC-2024-12345"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issuing Authority
                  </label>
                  <input
                    type="text"
                    value={formData.issuingAuthority}
                    onChange={(e) => updateField('issuingAuthority', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={permitType?.authority || 'e.g., Transport Canada'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issue Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => updateField('issueDate', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Effective Date
                  </label>
                  <input
                    type="date"
                    value={formData.effectiveDate}
                    onChange={(e) => updateField('effectiveDate', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => updateField('expiryDate', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Scope */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Geographic Area
                </label>
                <textarea
                  value={formData.geographicArea}
                  onChange={(e) => updateField('geographicArea', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the authorized operating area..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Operation Types
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {OPERATION_TYPES.map(type => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => toggleOperationType(type.id)}
                      className={`p-2 text-left rounded-lg border transition-colors ${
                        formData.operationTypes.includes(type.id)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <span className="text-sm">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aircraft Registrations
                </label>
                <input
                  type="text"
                  value={formData.aircraftRegistrations.join(', ')}
                  onChange={(e) => updateField('aircraftRegistrations', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="C-XXXX, C-YYYY (comma separated)"
                />
              </div>
            </div>
          )}

          {/* Step 3: Privileges & Conditions */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Privileges */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Privileges</h3>
                <p className="text-xs text-gray-500 mb-3">What operations does this permit authorize?</p>

                {formData.privileges.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {formData.privileges.map(priv => (
                      <div key={priv.id} className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">{priv.description}</p>
                          {priv.conditions && (
                            <p className="text-xs text-gray-500 mt-0.5">Conditions: {priv.conditions}</p>
                          )}
                        </div>
                        <button
                          onClick={() => removePrivilege(priv.id)}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                  <input
                    type="text"
                    value={newPrivilege.description}
                    onChange={(e) => setNewPrivilege(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Privilege description..."
                  />
                  <input
                    type="text"
                    value={newPrivilege.conditions}
                    onChange={(e) => setNewPrivilege(prev => ({ ...prev, conditions: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Conditions (optional)..."
                  />
                  <button
                    type="button"
                    onClick={addPrivilege}
                    disabled={!newPrivilege.description.trim()}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    Add Privilege
                  </button>
                </div>
              </div>

              {/* Conditions */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Conditions & Restrictions</h3>
                <p className="text-xs text-gray-500 mb-3">What restrictions or requirements apply?</p>

                {formData.conditions.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {formData.conditions.map(cond => (
                      <div
                        key={cond.id}
                        className={`flex items-start gap-2 p-3 rounded-lg border ${
                          cond.isCritical ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                        }`}
                      >
                        <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${cond.isCritical ? 'text-red-600' : 'text-amber-600'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {cond.isCritical && (
                              <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">CRITICAL</span>
                            )}
                            <span className="text-xs text-gray-500 uppercase">{cond.category}</span>
                          </div>
                          <p className="text-sm text-gray-900 mt-0.5">{cond.description}</p>
                        </div>
                        <button
                          onClick={() => removeCondition(cond.id)}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex gap-2">
                    <select
                      value={newCondition.category}
                      onChange={(e) => setNewCondition(prev => ({ ...prev, category: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {CONDITION_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={newCondition.isCritical}
                        onChange={(e) => setNewCondition(prev => ({ ...prev, isCritical: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                      Critical
                    </label>
                  </div>
                  <input
                    type="text"
                    value={newCondition.description}
                    onChange={(e) => setNewCondition(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Condition description..."
                  />
                  <button
                    type="button"
                    onClick={addCondition}
                    disabled={!newCondition.description.trim()}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    Add Condition
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Notes */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Additional notes about this permit..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={(e) => updateField('tags', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="pipeline, bvlos, client-xyz (comma separated)"
                />
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> You can upload documents after creating the permit from the permit detail view.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={currentStep === 0 ? onClose : handleBack}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </button>

          {currentStep < STEPS.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 btn-primary"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 btn-primary"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {isEditing ? 'Save Changes' : 'Create Permit'}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

AddPermitModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func,
  permit: PropTypes.object
}
