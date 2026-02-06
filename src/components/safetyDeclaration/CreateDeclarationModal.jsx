/**
 * CreateDeclarationModal.jsx
 * Multi-step wizard for creating Safety Assurance Declarations
 *
 * Steps:
 * 1. Declaration Type (Declaration vs Pre-Validated Declaration)
 * 2. RPAS System Details (with kinetic energy calculator)
 * 3. Operation Types (auto-populates applicable 922.xx requirements)
 * 4. Declarant/Client Information
 *
 * @location src/components/safetyDeclaration/CreateDeclarationModal.jsx
 */

import { useState, useEffect, useMemo } from 'react'
import {
  X,
  ChevronRight,
  ChevronLeft,
  FileCheck,
  Shield,
  Plane,
  ClipboardList,
  User,
  Calculator,
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useOrganization } from '../../hooks/useOrganization'
import { getClients } from '../../lib/firestore'
import {
  createSafetyDeclaration,
  DECLARATION_TYPES,
  RPAS_CATEGORIES,
  KINETIC_ENERGY_CATEGORIES,
  OPERATION_TYPES,
  REQUIREMENT_SECTIONS,
  calculateKineticEnergy,
  getKineticEnergyCategory,
  getRPASCategory,
  getApplicableRequirements,
  getOperationTypesForCategory,
  anyRequiresPreValidation
} from '../../lib/firestoreSafetyDeclaration'

const STEPS = [
  { id: 1, title: 'Declaration Type', icon: FileCheck },
  { id: 2, title: 'RPAS System', icon: Plane },
  { id: 3, title: 'Operations', icon: ClipboardList },
  { id: 4, title: 'Declarant Info', icon: User }
]

export default function CreateDeclarationModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth()
  const { organization } = useOrganization()
  const [step, setStep] = useState(1)
  const [clients, setClients] = useState([])
  const [loadingClients, setLoadingClients] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Declaration Type
    name: '',
    description: '',
    declarationType: 'declaration',

    // Step 2: RPAS Details
    rpasDetails: {
      manufacturer: '',
      model: '',
      serialNumber: '',
      weightKg: '',
      maxVelocityMs: '',
      description: ''
    },

    // Step 3: Operations
    operationTypes: [],
    robustnessLevel: 'low',

    // Step 4: Declarant Info
    isClientDeclaration: false,
    clientId: '',
    clientName: '',
    declarantInfo: {
      name: '',
      organization: '',
      email: '',
      phone: '',
      address: ''
    }
  })

  // Calculated values
  const calculatedKE = useMemo(() => {
    const weight = parseFloat(formData.rpasDetails.weightKg) || 0
    const velocity = parseFloat(formData.rpasDetails.maxVelocityMs) || 0
    if (weight > 0 && velocity > 0) {
      return calculateKineticEnergy(weight, velocity)
    }
    return 0
  }, [formData.rpasDetails.weightKg, formData.rpasDetails.maxVelocityMs])

  const keCategory = useMemo(() => {
    return getKineticEnergyCategory(calculatedKE)
  }, [calculatedKE])

  const rpasCategory = useMemo(() => {
    const weight = parseFloat(formData.rpasDetails.weightKg) || 0
    return getRPASCategory(weight)
  }, [formData.rpasDetails.weightKg])

  const applicableStandards = useMemo(() => {
    return getApplicableRequirements(formData.operationTypes)
  }, [formData.operationTypes])

  // Filter operation types based on RPAS category (weight-based filtering)
  const filteredOperationTypes = useMemo(() => {
    return getOperationTypesForCategory(rpasCategory)
  }, [rpasCategory])

  // Check if any selected operations require pre-validation
  const needsPreValidation = useMemo(() => {
    return anyRequiresPreValidation(formData.operationTypes)
  }, [formData.operationTypes])

  // Load clients
  useEffect(() => {
    if (isOpen && organization?.id) {
      setLoadingClients(true)
      getClients(organization.id)
        .then(setClients)
        .catch(console.error)
        .finally(() => setLoadingClients(false))
    }
  }, [isOpen, organization?.id])

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1)
      setError(null)
      setFormData({
        name: '',
        description: '',
        declarationType: 'declaration',
        rpasDetails: {
          manufacturer: '',
          model: '',
          serialNumber: '',
          weightKg: '',
          maxVelocityMs: '',
          description: ''
        },
        operationTypes: [],
        robustnessLevel: 'low',
        isClientDeclaration: false,
        clientId: '',
        clientName: '',
        declarantInfo: {
          name: user?.displayName || '',
          organization: organization?.name || '',
          email: user?.email || '',
          phone: '',
          address: ''
        }
      })
    }
  }, [isOpen, user, organization])

  // Pre-fill declarant from organization
  useEffect(() => {
    if (organization && !formData.isClientDeclaration) {
      setFormData(prev => ({
        ...prev,
        declarantInfo: {
          ...prev.declarantInfo,
          organization: organization.name || ''
        }
      }))
    }
  }, [organization, formData.isClientDeclaration])

  // Clear invalid operation types when RPAS category changes
  useEffect(() => {
    const validOpTypes = Object.keys(filteredOperationTypes)
    setFormData(prev => ({
      ...prev,
      operationTypes: prev.operationTypes.filter(opType => validOpTypes.includes(opType))
    }))
  }, [rpasCategory]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNestedFieldChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }))
  }

  const handleOperationTypeToggle = (opTypeId) => {
    setFormData(prev => ({
      ...prev,
      operationTypes: prev.operationTypes.includes(opTypeId)
        ? prev.operationTypes.filter(id => id !== opTypeId)
        : [...prev.operationTypes, opTypeId]
    }))
  }

  const handleClientSelect = (clientId) => {
    const client = clients.find(c => c.id === clientId)
    setFormData(prev => ({
      ...prev,
      clientId,
      clientName: client?.name || ''
    }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)

    try {
      const weight = parseFloat(formData.rpasDetails.weightKg) || 0
      const velocity = parseFloat(formData.rpasDetails.maxVelocityMs) || 0

      const declarationData = {
        organizationId: organization.id,
        name: formData.name,
        description: formData.description,
        declarationType: formData.declarationType,
        rpasDetails: {
          manufacturer: formData.rpasDetails.manufacturer,
          model: formData.rpasDetails.model,
          serialNumber: formData.rpasDetails.serialNumber,
          weightKg: weight,
          maxVelocityMs: velocity,
          maxKineticEnergy: calculatedKE,
          category: rpasCategory,
          kineticEnergyCategory: keCategory,
          description: formData.rpasDetails.description
        },
        operationTypes: formData.operationTypes,
        applicableStandards,
        robustnessLevel: formData.robustnessLevel,
        declarantInfo: formData.declarantInfo,
        clientId: formData.isClientDeclaration ? formData.clientId : null,
        clientName: formData.isClientDeclaration ? formData.clientName : null,
        createdBy: user.uid
      }

      const newDeclaration = await createSafetyDeclaration(declarationData)

      if (onSuccess) {
        onSuccess(newDeclaration)
      }
      onClose()
    } catch (err) {
      console.error('Error creating declaration:', err)
      setError(err.message || 'Failed to create declaration')
    } finally {
      setSubmitting(false)
    }
  }

  // Validation
  const canProceedStep1 = formData.name.trim() && formData.declarationType
  const canProceedStep2 = formData.rpasDetails.manufacturer.trim() &&
    formData.rpasDetails.model.trim() &&
    parseFloat(formData.rpasDetails.weightKg) > 0
  const canProceedStep3 = formData.operationTypes.length > 0
  const canProceedStep4 = formData.declarantInfo.name.trim() &&
    formData.declarantInfo.email.trim() &&
    (!formData.isClientDeclaration || formData.clientId)

  const canProceed = [canProceedStep1, canProceedStep2, canProceedStep3, canProceedStep4][step - 1]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Create Safety Declaration
              </h2>
              <p className="text-sm text-gray-500">
                Step {step} of {STEPS.length}: {STEPS[step - 1].title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-6 pt-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              {STEPS.map((s, index) => (
                <div key={s.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                      step > s.id
                        ? 'bg-green-500 text-white'
                        : step === s.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step > s.id ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <s.icon className="w-5 h-5" />
                    )}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`w-full h-1 mx-2 rounded ${
                        step > s.id ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                      style={{ width: '60px' }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Step 1: Declaration Type */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <FileCheck className="w-5 h-5" />
                  <span className="font-medium">Declaration Type & Details</span>
                </div>

                {/* Declaration Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Declaration Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    placeholder="e.g., DJI M300 RTK BVLOS Declaration"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    placeholder="Brief description of this declaration's purpose..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Declaration Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Declaration Type *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(DECLARATION_TYPES).map(([key, type]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleFieldChange('declarationType', key)}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          formData.declarationType === key
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            formData.declarationType === key
                              ? 'bg-blue-100'
                              : 'bg-gray-100'
                          }`}>
                            {key === 'pre_validated' ? (
                              <Shield className="w-5 h-5 text-blue-600" />
                            ) : (
                              <FileCheck className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{type.label}</p>
                            <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {formData.declarationType === 'pre_validated' && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-amber-900">Pre-Validated Declaration</h4>
                        <p className="mt-1 text-sm text-amber-700">
                          PVDs require Transport Canada review before the declaration can be made.
                          Additional documentation and a review fee may be required.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: RPAS System Details */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <Plane className="w-5 h-5" />
                  <span className="font-medium">RPAS System Details</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Manufacturer */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Manufacturer *
                    </label>
                    <input
                      type="text"
                      value={formData.rpasDetails.manufacturer}
                      onChange={(e) => handleNestedFieldChange('rpasDetails', 'manufacturer', e.target.value)}
                      placeholder="e.g., DJI, Freefly, Custom"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Model */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Model *
                    </label>
                    <input
                      type="text"
                      value={formData.rpasDetails.model}
                      onChange={(e) => handleNestedFieldChange('rpasDetails', 'model', e.target.value)}
                      placeholder="e.g., Matrice 300 RTK"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Serial Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Serial Number
                  </label>
                  <input
                    type="text"
                    value={formData.rpasDetails.serialNumber}
                    onChange={(e) => handleNestedFieldChange('rpasDetails', 'serialNumber', e.target.value)}
                    placeholder="Optional - for specific unit declarations"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Kinetic Energy Calculator */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Calculator className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Kinetic Energy Calculator</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Maximum Takeoff Weight (kg) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.rpasDetails.weightKg}
                        onChange={(e) => handleNestedFieldChange('rpasDetails', 'weightKg', e.target.value)}
                        placeholder="e.g., 9.0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Maximum Velocity (m/s)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.rpasDetails.maxVelocityMs}
                        onChange={(e) => handleNestedFieldChange('rpasDetails', 'maxVelocityMs', e.target.value)}
                        placeholder="e.g., 23.0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Calculated Results */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">RPAS Category</p>
                      <p className="font-medium text-gray-900">
                        {RPAS_CATEGORIES[rpasCategory]?.label || 'N/A'}
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Max Kinetic Energy</p>
                      <p className="font-medium text-gray-900">
                        {calculatedKE > 0 ? `${calculatedKE.toLocaleString()} J` : 'Enter values'}
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">KE Category</p>
                      <p className={`font-medium ${
                        keCategory === 'very_high' ? 'text-red-600' :
                        keCategory === 'high' ? 'text-orange-600' :
                        keCategory === 'medium' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {KINETIC_ENERGY_CATEGORIES[keCategory]?.label || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {keCategory === 'very_high' && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">
                        Kinetic energy exceeds 1084 kJ. Contact Transport Canada before proceeding.
                      </p>
                    </div>
                  )}
                </div>

                {/* System Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    System Description
                  </label>
                  <textarea
                    value={formData.rpasDetails.description}
                    onChange={(e) => handleNestedFieldChange('rpasDetails', 'description', e.target.value)}
                    placeholder="Optional additional details about the system configuration, payloads, modifications..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Operation Types */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <ClipboardList className="w-5 h-5" />
                  <span className="font-medium">Operation Types</span>
                </div>

                <p className="text-sm text-gray-600">
                  Select all operation types this declaration will cover. Each operation type
                  triggers specific CAR Standard 922 requirements.
                </p>

                {/* RPAS Category Notice */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-800">
                      Showing operations for <strong>{RPAS_CATEGORIES[rpasCategory]?.label}</strong> ({RPAS_CATEGORIES[rpasCategory]?.description})
                    </span>
                  </div>
                </div>

                {/* Operation Type Cards - Filtered by RPAS Category */}
                <div className="space-y-3">
                  {Object.entries(filteredOperationTypes).map(([key, opType]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleOperationTypeToggle(key)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        formData.operationTypes.includes(key)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{opType.label}</p>
                            {opType.declarationType === 'pre_validated' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-800 font-medium">
                                Pre-Validation Required
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{opType.description}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {opType.applicableStandards.map(std => (
                              <span
                                key={std}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                              >
                                {std}
                              </span>
                            ))}
                            {opType.car_reference && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-600">
                                {opType.car_reference}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-4 ${
                          formData.operationTypes.includes(key)
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {formData.operationTypes.includes(key) && (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Applicable Standards Summary */}
                {applicableStandards.length > 0 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="text-sm font-medium text-green-900 mb-2">
                      Applicable Requirements ({applicableStandards.length} sections)
                    </h4>
                    <div className="space-y-2">
                      {applicableStandards.map(std => (
                        <div key={std} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="text-sm font-medium text-green-900">CAR {std}</span>
                            <span className="text-sm text-green-700 ml-2">
                              - {REQUIREMENT_SECTIONS[std]?.title}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pre-Validation Warning */}
                {needsPreValidation && formData.declarationType !== 'pre_validated' && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-amber-900">Pre-Validation Required</h4>
                        <p className="mt-1 text-sm text-amber-700">
                          One or more selected operations require a Pre-Validated Declaration.
                          Consider going back to Step 1 to change the declaration type.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Robustness Level - shown for operations that include 922.08 containment */}
                {(formData.operationTypes.includes('bvlos_isolated') ||
                  formData.operationTypes.includes('bvlos_near_populated') ||
                  formData.operationTypes.includes('medium_bvlos_isolated') ||
                  formData.operationTypes.includes('medium_rpas_away_from_people')) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Containment Robustness Level (922.08)
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => handleFieldChange('robustnessLevel', 'low')}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          formData.robustnessLevel === 'low'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-medium text-gray-900">Low Robustness</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Single-failure protection for containment (sRPAS)
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFieldChange('robustnessLevel', 'high')}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          formData.robustnessLevel === 'high'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-medium text-gray-900">High Robustness</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Multi-failure protection, DO-178/254 (mRPAS)
                        </p>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Declarant Information */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <User className="w-5 h-5" />
                  <span className="font-medium">Declarant Information</span>
                </div>

                {/* Client Declaration Toggle */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isClientDeclaration}
                      onChange={(e) => handleFieldChange('isClientDeclaration', e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-medium text-gray-900">This is a client declaration</span>
                      <p className="text-sm text-gray-500">
                        Creating this declaration on behalf of a client
                      </p>
                    </div>
                  </label>
                </div>

                {/* Client Selection */}
                {formData.isClientDeclaration && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client *
                    </label>
                    {loadingClients ? (
                      <div className="animate-pulse h-10 bg-gray-100 rounded-lg" />
                    ) : (
                      <select
                        value={formData.clientId}
                        onChange={(e) => handleClientSelect(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select a client</option>
                        {clients.map(client => (
                          <option key={client.id} value={client.id}>
                            {client.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {/* Declarant Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      value={formData.declarantInfo.name}
                      onChange={(e) => handleNestedFieldChange('declarantInfo', 'name', e.target.value)}
                      placeholder="Full name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization
                    </label>
                    <input
                      type="text"
                      value={formData.declarantInfo.organization}
                      onChange={(e) => handleNestedFieldChange('declarantInfo', 'organization', e.target.value)}
                      placeholder="Company name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.declarantInfo.email}
                      onChange={(e) => handleNestedFieldChange('declarantInfo', 'email', e.target.value)}
                      placeholder="email@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.declarantInfo.phone}
                      onChange={(e) => handleNestedFieldChange('declarantInfo', 'phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    value={formData.declarantInfo.address}
                    onChange={(e) => handleNestedFieldChange('declarantInfo', 'address', e.target.value)}
                    placeholder="Street address, City, Province, Postal Code"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Summary */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">Declaration Summary</h4>
                      <ul className="mt-2 text-sm text-blue-700 space-y-1">
                        <li>Type: {DECLARATION_TYPES[formData.declarationType]?.label}</li>
                        <li>System: {formData.rpasDetails.manufacturer} {formData.rpasDetails.model}</li>
                        <li>Operations: {formData.operationTypes.length} type(s) selected</li>
                        <li>Requirements: {applicableStandards.length} CAR 922 section(s)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex-shrink-0">
            <button
              type="button"
              onClick={() => step > 1 ? setStep(step - 1) : onClose()}
              className="flex items-center gap-1 px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              <ChevronLeft className="w-4 h-4" />
              {step > 1 ? 'Back' : 'Cancel'}
            </button>

            {step < STEPS.length ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={!canProceed}
                className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canProceed || submitting}
                className="flex items-center gap-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creating...' : 'Create Declaration'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
