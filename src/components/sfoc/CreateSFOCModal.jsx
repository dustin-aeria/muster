/**
 * CreateSFOCModal.jsx
 * Modal wizard for creating new SFOC applications
 * Step 1: Basic info & operation triggers
 * Step 2: Aircraft details
 * Step 3: Review & create
 *
 * @location src/components/sfoc/CreateSFOCModal.jsx
 */

import { useState, useEffect } from 'react'
import { useOrganization } from '../../hooks/useOrganization'
import { useAuth } from '../../contexts/AuthContext'
import {
  X,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  FileCheck,
  Scale,
  Plane,
  Check,
  Info,
  Loader2
} from 'lucide-react'
import {
  createSFOCApplication,
  SFOC_APPLICATION_TYPES,
  SFOC_OPERATION_TRIGGERS,
  SFOC_COMPLEXITY,
  determineComplexity
} from '../../lib/firestoreSFOC'

export default function CreateSFOCModal({ isOpen, onClose, onSuccess }) {
  const { organization } = useOrganization()
  const { user } = useAuth()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    applicationType: 'new',
    operationTriggers: [],
    operationDescription: '',
    operationalArea: '',
    proposedStartDate: '',
    proposedEndDate: '',
    aircraftDetails: {
      manufacturer: '',
      model: '',
      serialNumber: '',
      registrationNumber: '',
      weightKg: '',
      maxSpeed: ''
    },
    applicantInfo: {
      name: '',
      organization: '',
      email: '',
      phone: ''
    }
  })

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1)
      setError(null)
      setFormData({
        name: '',
        description: '',
        applicationType: 'new',
        operationTriggers: [],
        operationDescription: '',
        operationalArea: '',
        proposedStartDate: '',
        proposedEndDate: '',
        aircraftDetails: {
          manufacturer: '',
          model: '',
          serialNumber: '',
          registrationNumber: '',
          weightKg: '',
          maxSpeed: ''
        },
        applicantInfo: {
          name: user?.displayName || '',
          organization: organization?.name || '',
          email: user?.email || '',
          phone: ''
        }
      })
    }
  }, [isOpen, user, organization])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }))
  }

  const toggleOperationTrigger = (triggerId) => {
    setFormData(prev => ({
      ...prev,
      operationTriggers: prev.operationTriggers.includes(triggerId)
        ? prev.operationTriggers.filter(t => t !== triggerId)
        : [...prev.operationTriggers, triggerId]
    }))
  }

  const complexity = determineComplexity(formData.operationTriggers)
  const complexityInfo = SFOC_COMPLEXITY[complexity]

  const validateStep = (stepNum) => {
    switch (stepNum) {
      case 1:
        return formData.name.trim() && formData.operationTriggers.length > 0
      case 2:
        return formData.aircraftDetails.manufacturer.trim() &&
               formData.aircraftDetails.model.trim() &&
               formData.aircraftDetails.weightKg
      case 3:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1)
      setError(null)
    } else {
      setError('Please fill in all required fields')
    }
  }

  const handleBack = () => {
    setStep(prev => prev - 1)
    setError(null)
  }

  const handleSubmit = async () => {
    if (!organization?.id) {
      setError('Organization not found')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const applicationData = {
        organizationId: organization.id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        applicationType: formData.applicationType,
        operationTriggers: formData.operationTriggers,
        operationDescription: formData.operationDescription.trim(),
        operationalArea: formData.operationalArea.trim(),
        proposedStartDate: formData.proposedStartDate ? new Date(formData.proposedStartDate) : null,
        proposedEndDate: formData.proposedEndDate ? new Date(formData.proposedEndDate) : null,
        aircraftDetails: {
          manufacturer: formData.aircraftDetails.manufacturer.trim(),
          model: formData.aircraftDetails.model.trim(),
          serialNumber: formData.aircraftDetails.serialNumber.trim(),
          registrationNumber: formData.aircraftDetails.registrationNumber.trim(),
          weightKg: parseFloat(formData.aircraftDetails.weightKg) || 0,
          maxSpeed: formData.aircraftDetails.maxSpeed ? parseFloat(formData.aircraftDetails.maxSpeed) : null
        },
        applicantInfo: {
          name: formData.applicantInfo.name.trim(),
          organization: formData.applicantInfo.organization.trim(),
          email: formData.applicantInfo.email.trim(),
          phone: formData.applicantInfo.phone.trim()
        },
        createdBy: user?.uid || 'unknown'
      }

      const newApplication = await createSFOCApplication(applicationData)
      onSuccess?.(newApplication)
      onClose()
    } catch (err) {
      console.error('Error creating SFOC application:', err)
      setError(err.message || 'Failed to create application')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="relative inline-block w-full max-w-2xl overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">New SFOC Application</h2>
              <p className="text-sm text-gray-500">Step {step} of 3</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-6 pt-4">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex-1">
                  <div className={`h-2 rounded-full ${
                    s < step ? 'bg-blue-600' :
                    s === step ? 'bg-blue-600' :
                    'bg-gray-200'
                  }`} />
                  <p className={`mt-1 text-xs ${
                    s === step ? 'text-blue-600 font-medium' : 'text-gray-500'
                  }`}>
                    {s === 1 ? 'Operation Details' : s === 2 ? 'Aircraft Info' : 'Review'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Step 1: Operation Details */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Application Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Pipeline Inspection SFOC - Northern Region"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Application Type
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(SFOC_APPLICATION_TYPES).map(([key, type]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleInputChange('applicationType', key)}
                        className={`p-3 border rounded-lg text-left transition-all ${
                          formData.applicationType === key
                            ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-medium text-sm text-gray-900">{type.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{type.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Operation Triggers <span className="text-red-500">*</span>
                    <span className="font-normal text-gray-500 ml-2">
                      Select all that apply
                    </span>
                  </label>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {Object.entries(SFOC_OPERATION_TRIGGERS).map(([key, trigger]) => (
                      <label
                        key={key}
                        className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                          formData.operationTriggers.includes(key)
                            ? trigger.complexity === 'high'
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.operationTriggers.includes(key)}
                          onChange={() => toggleOperationTrigger(key)}
                          className="mt-1 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm text-gray-900">{trigger.label}</p>
                            <span className={`px-1.5 py-0.5 rounded text-xs ${
                              trigger.complexity === 'high'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {trigger.complexity === 'high' ? 'High' : 'Medium'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{trigger.description}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{trigger.car_reference}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {formData.operationTriggers.length > 0 && (
                  <div className={`p-4 rounded-lg border ${
                    complexity === 'high'
                      ? 'bg-purple-50 border-purple-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      <Scale className={`w-5 h-5 ${
                        complexity === 'high' ? 'text-purple-600' : 'text-blue-600'
                      }`} />
                      <div>
                        <p className={`font-medium ${
                          complexity === 'high' ? 'text-purple-900' : 'text-blue-900'
                        }`}>
                          {complexityInfo.label}
                        </p>
                        <p className={`text-sm ${
                          complexity === 'high' ? 'text-purple-700' : 'text-blue-700'
                        }`}>
                          Expected processing: ~{complexityInfo.processingDays} business days
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Operation Description
                  </label>
                  <textarea
                    value={formData.operationDescription}
                    onChange={(e) => handleInputChange('operationDescription', e.target.value)}
                    placeholder="Describe the purpose and nature of the proposed operations..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Operational Area
                  </label>
                  <input
                    type="text"
                    value={formData.operationalArea}
                    onChange={(e) => handleInputChange('operationalArea', e.target.value)}
                    placeholder="e.g., Northern Alberta, within 50km of Fort McMurray"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Aircraft Info */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">Aircraft Information</p>
                      <p className="mt-1">
                        Enter details for the primary RPAS that will be used in operations.
                        {formData.operationTriggers.includes('large_rpas') && (
                          <span className="block mt-1 font-medium">
                            Large RPAS (&gt;150kg) requires a Manufacturer Performance Declaration.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Manufacturer <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.aircraftDetails.manufacturer}
                      onChange={(e) => handleNestedChange('aircraftDetails', 'manufacturer', e.target.value)}
                      placeholder="e.g., DJI, Wingtra, Custom"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Model <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.aircraftDetails.model}
                      onChange={(e) => handleNestedChange('aircraftDetails', 'model', e.target.value)}
                      placeholder="e.g., Matrice 300 RTK"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Serial Number
                    </label>
                    <input
                      type="text"
                      value={formData.aircraftDetails.serialNumber}
                      onChange={(e) => handleNestedChange('aircraftDetails', 'serialNumber', e.target.value)}
                      placeholder="Aircraft serial number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registration Number
                    </label>
                    <input
                      type="text"
                      value={formData.aircraftDetails.registrationNumber}
                      onChange={(e) => handleNestedChange('aircraftDetails', 'registrationNumber', e.target.value)}
                      placeholder="TC registration number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Takeoff Weight (kg) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.aircraftDetails.weightKg}
                      onChange={(e) => handleNestedChange('aircraftDetails', 'weightKg', e.target.value)}
                      placeholder="e.g., 400"
                      min="0"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {parseFloat(formData.aircraftDetails.weightKg) > 150 && (
                      <p className="mt-1 text-xs text-purple-600 font-medium">
                        Large RPAS - Manufacturer Performance Declaration required
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Speed (km/h)
                    </label>
                    <input
                      type="number"
                      value={formData.aircraftDetails.maxSpeed}
                      onChange={(e) => handleNestedChange('aircraftDetails', 'maxSpeed', e.target.value)}
                      placeholder="e.g., 120"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Proposed Operation Period</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.proposedStartDate}
                        onChange={(e) => handleInputChange('proposedStartDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={formData.proposedEndDate}
                        onChange={(e) => handleInputChange('proposedEndDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-blue-600" />
                    Review Application Details
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Application Name</p>
                      <p className="font-medium text-gray-900">{formData.name}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Application Type</p>
                      <p className="text-gray-900">{SFOC_APPLICATION_TYPES[formData.applicationType]?.label}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Complexity Level</p>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium ${
                        complexity === 'high'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        <Scale className="w-3.5 h-3.5" />
                        {complexityInfo.label}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Operation Triggers</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.operationTriggers.map(triggerId => (
                          <span
                            key={triggerId}
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-gray-200 text-gray-700"
                          >
                            {SFOC_OPERATION_TRIGGERS[triggerId]?.label}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Aircraft</p>
                      <div className="flex items-center gap-2">
                        <Plane className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {formData.aircraftDetails.manufacturer} {formData.aircraftDetails.model}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          parseFloat(formData.aircraftDetails.weightKg) > 150
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {formData.aircraftDetails.weightKg} kg
                        </span>
                      </div>
                    </div>

                    {formData.operationalArea && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Operational Area</p>
                        <p className="text-gray-900">{formData.operationalArea}</p>
                      </div>
                    )}

                    {(formData.proposedStartDate || formData.proposedEndDate) && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Proposed Period</p>
                        <p className="text-gray-900">
                          {formData.proposedStartDate && new Date(formData.proposedStartDate).toLocaleDateString()}
                          {formData.proposedStartDate && formData.proposedEndDate && ' - '}
                          {formData.proposedEndDate && new Date(formData.proposedEndDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">Next Steps After Creation</p>
                      <ul className="mt-2 space-y-1 text-yellow-700">
                        <li>1. Complete all required documents in the checklist</li>
                        <li>2. Complete and link a SORA assessment</li>
                        {parseFloat(formData.aircraftDetails.weightKg) > 150 && (
                          <li>3. Complete and link a Manufacturer Performance Declaration</li>
                        )}
                        <li>
                          {parseFloat(formData.aircraftDetails.weightKg) > 150 ? '4' : '3'}. Submit to Transport Canada
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={step === 1 ? onClose : handleBack}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              {step === 1 ? 'Cancel' : (
                <span className="flex items-center gap-1">
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </span>
              )}
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!validateStep(step)}
                className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Create Application
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
