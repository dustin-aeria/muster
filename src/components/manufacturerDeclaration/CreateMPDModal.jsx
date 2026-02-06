/**
 * CreateMPDModal.jsx
 * Modal wizard for creating new Manufacturer Performance Declarations
 * Step 1: Basic info & RPAS category
 * Step 2: RPAS specifications & kinetic energy
 * Step 3: Custom software (if applicable)
 * Step 4: Review & create
 *
 * @location src/components/manufacturerDeclaration/CreateMPDModal.jsx
 */

import { useState, useEffect, useMemo } from 'react'
import { useOrganization } from '../../hooks/useOrganization'
import { useAuth } from '../../hooks/useAuth'
import {
  X,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  FileCheck,
  Cpu,
  Code,
  Check,
  Info,
  Loader2,
  Zap,
  Calculator
} from 'lucide-react'
import {
  createManufacturerDeclaration,
  MPD_RPAS_CATEGORIES,
  SOFTWARE_DAL_LEVELS,
  DESIGN_STANDARDS,
  calculateKineticEnergy,
  getKineticEnergyCategory
} from '../../lib/firestoreManufacturerDeclaration'

export default function CreateMPDModal({ isOpen, onClose, onSuccess }) {
  const { organization } = useOrganization()
  const { user } = useAuth()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'large',
    manufacturer: '',
    model: '',
    serialNumber: '',
    operatingWeight: '',
    maxTakeoffWeight: '',
    maxVelocity: '',
    dimensions: '',
    propulsionType: '',
    powerSource: '',
    hasCustomSoftware: false,
    softwareDetails: {
      name: '',
      version: '',
      designStandard: 'ASTM_F3201',
      dalLevel: 'D',
      description: '',
      functions: []
    },
    declarantInfo: {
      name: '',
      title: '',
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
        category: 'large',
        manufacturer: '',
        model: '',
        serialNumber: '',
        operatingWeight: '',
        maxTakeoffWeight: '',
        maxVelocity: '',
        dimensions: '',
        propulsionType: '',
        powerSource: '',
        hasCustomSoftware: false,
        softwareDetails: {
          name: '',
          version: '',
          designStandard: 'ASTM_F3201',
          dalLevel: 'D',
          description: '',
          functions: []
        },
        declarantInfo: {
          name: user?.displayName || '',
          title: '',
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

  // Calculate kinetic energy
  const kineticEnergy = useMemo(() => {
    const weight = parseFloat(formData.operatingWeight) || 0
    const velocity = parseFloat(formData.maxVelocity) || 0
    return calculateKineticEnergy(weight, velocity)
  }, [formData.operatingWeight, formData.maxVelocity])

  const keCategory = useMemo(() => {
    return getKineticEnergyCategory(kineticEnergy)
  }, [kineticEnergy])

  // Determine total steps based on custom software
  const totalSteps = formData.hasCustomSoftware ? 4 : 3

  const validateStep = (stepNum) => {
    switch (stepNum) {
      case 1:
        return formData.name.trim() && formData.category
      case 2:
        return formData.manufacturer.trim() &&
               formData.model.trim() &&
               formData.operatingWeight &&
               formData.maxVelocity
      case 3:
        if (formData.hasCustomSoftware) {
          return formData.softwareDetails.name.trim() &&
                 formData.softwareDetails.designStandard
        }
        return true // Review step if no custom software
      case 4:
        return true // Review step
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
      const declarationData = {
        organizationId: organization.id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        manufacturer: formData.manufacturer.trim(),
        model: formData.model.trim(),
        serialNumber: formData.serialNumber.trim(),
        operatingWeight: parseFloat(formData.operatingWeight) || 0,
        maxTakeoffWeight: parseFloat(formData.maxTakeoffWeight) || parseFloat(formData.operatingWeight) || 0,
        maxVelocity: parseFloat(formData.maxVelocity) || 0,
        dimensions: formData.dimensions.trim(),
        propulsionType: formData.propulsionType.trim(),
        powerSource: formData.powerSource.trim(),
        hasCustomSoftware: formData.hasCustomSoftware,
        softwareDetails: formData.hasCustomSoftware ? {
          name: formData.softwareDetails.name.trim(),
          version: formData.softwareDetails.version.trim(),
          designStandard: formData.softwareDetails.designStandard,
          dalLevel: formData.softwareDetails.dalLevel,
          description: formData.softwareDetails.description.trim(),
          functions: formData.softwareDetails.functions
        } : null,
        declarantInfo: {
          name: formData.declarantInfo.name.trim(),
          title: formData.declarantInfo.title.trim(),
          organization: formData.declarantInfo.organization.trim(),
          email: formData.declarantInfo.email.trim(),
          phone: formData.declarantInfo.phone.trim()
        },
        createdBy: user?.uid || 'unknown'
      }

      const newDeclaration = await createManufacturerDeclaration(declarationData)
      onSuccess?.(newDeclaration)
      onClose()
    } catch (err) {
      console.error('Error creating manufacturer declaration:', err)
      setError(err.message || 'Failed to create declaration')
    } finally {
      setLoading(false)
    }
  }

  const isReviewStep = (formData.hasCustomSoftware && step === 4) || (!formData.hasCustomSoftware && step === 3)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="relative inline-block w-full max-w-2xl overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">New Manufacturer Declaration</h2>
              <p className="text-sm text-gray-500">Step {step} of {totalSteps}</p>
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
              {Array.from({ length: totalSteps }).map((_, idx) => (
                <div key={idx} className="flex-1">
                  <div className={`h-2 rounded-full ${
                    idx + 1 <= step ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                  <p className={`mt-1 text-xs ${
                    idx + 1 === step ? 'text-blue-600 font-medium' : 'text-gray-500'
                  }`}>
                    {idx === 0 ? 'Basic Info' :
                     idx === 1 ? 'RPAS Specs' :
                     idx === 2 && formData.hasCustomSoftware ? 'Software' :
                     'Review'}
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

            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Declaration Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Heavy Lift Drone MPD - Pipeline Operations"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    RPAS Category <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    {Object.entries(MPD_RPAS_CATEGORIES).map(([key, cat]) => (
                      <label
                        key={key}
                        className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                          formData.category === key
                            ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="category"
                          checked={formData.category === key}
                          onChange={() => handleInputChange('category', key)}
                          className="mt-1 h-4 w-4 text-blue-600"
                        />
                        <div>
                          <p className="font-medium text-sm text-gray-900">{cat.label}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{cat.description}</p>
                          {cat.requiresSFOC && (
                            <p className="text-xs text-orange-600 mt-1">Requires SFOC</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Brief description of the RPAS and its intended use..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="hasCustomSoftware"
                    checked={formData.hasCustomSoftware}
                    onChange={(e) => handleInputChange('hasCustomSoftware', e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="hasCustomSoftware" className="flex-1">
                    <span className="font-medium text-sm text-gray-900">Custom Software</span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      This RPAS uses custom/modified flight control software requiring DO-178C or ASTM F3201 declaration
                    </p>
                  </label>
                </div>
              </div>
            )}

            {/* Step 2: RPAS Specifications */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Calculator className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">Kinetic Energy Calculator</p>
                      <p className="mt-1">
                        Enter weight and max velocity to automatically calculate kinetic energy category.
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
                      value={formData.manufacturer}
                      onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                      placeholder="e.g., Custom Build, DJI"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Model <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => handleInputChange('model', e.target.value)}
                      placeholder="e.g., HeavyLifter 400"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Operating Weight (kg) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.operatingWeight}
                      onChange={(e) => handleInputChange('operatingWeight', e.target.value)}
                      placeholder="e.g., 400"
                      min="0"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Velocity (m/s) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.maxVelocity}
                      onChange={(e) => handleInputChange('maxVelocity', e.target.value)}
                      placeholder="e.g., 25"
                      min="0"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tip: km/h ÷ 3.6 = m/s (e.g., 90 km/h = 25 m/s)
                    </p>
                  </div>
                </div>

                {/* Kinetic Energy Display */}
                {kineticEnergy > 0 && (
                  <div className={`p-4 rounded-lg border ${
                    keCategory.category === 'very_high' ? 'bg-red-50 border-red-200' :
                    keCategory.category === 'high' ? 'bg-orange-50 border-orange-200' :
                    keCategory.category === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-green-50 border-green-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      <Zap className={`w-5 h-5 ${
                        keCategory.category === 'very_high' ? 'text-red-600' :
                        keCategory.category === 'high' ? 'text-orange-600' :
                        keCategory.category === 'medium' ? 'text-yellow-600' :
                        'text-green-600'
                      }`} />
                      <div>
                        <p className={`font-medium ${
                          keCategory.category === 'very_high' ? 'text-red-900' :
                          keCategory.category === 'high' ? 'text-orange-900' :
                          keCategory.category === 'medium' ? 'text-yellow-900' :
                          'text-green-900'
                        }`}>
                          Kinetic Energy: {(kineticEnergy / 1000).toFixed(2)} kJ ({keCategory.label})
                        </p>
                        {keCategory.requiresContact && (
                          <p className="text-sm text-red-700 mt-1">
                            {keCategory.note}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Serial Number
                    </label>
                    <input
                      type="text"
                      value={formData.serialNumber}
                      onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                      placeholder="Aircraft serial number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Takeoff Weight (kg)
                    </label>
                    <input
                      type="number"
                      value={formData.maxTakeoffWeight}
                      onChange={(e) => handleInputChange('maxTakeoffWeight', e.target.value)}
                      placeholder="e.g., 450"
                      min="0"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Propulsion Type
                    </label>
                    <select
                      value={formData.propulsionType}
                      onChange={(e) => handleInputChange('propulsionType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select type...</option>
                      <option value="electric_multirotor">Electric Multirotor</option>
                      <option value="electric_fixed_wing">Electric Fixed Wing</option>
                      <option value="hybrid">Hybrid (Gas/Electric)</option>
                      <option value="gas_turbine">Gas Turbine</option>
                      <option value="internal_combustion">Internal Combustion</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Power Source
                    </label>
                    <input
                      type="text"
                      value={formData.powerSource}
                      onChange={(e) => handleInputChange('powerSource', e.target.value)}
                      placeholder="e.g., 6S 30000mAh LiPo"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Custom Software (if applicable) */}
            {step === 3 && formData.hasCustomSoftware && (
              <div className="space-y-6">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Code className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-purple-700">
                      <p className="font-medium">Custom Software Declaration</p>
                      <p className="mt-1">
                        Document your custom flight control software per DO-178C or ASTM F3201.
                        This information will be used to generate the software declaration section.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Software Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.softwareDetails.name}
                      onChange={(e) => handleNestedChange('softwareDetails', 'name', e.target.value)}
                      placeholder="e.g., HeavyLift FlightOS"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Version
                    </label>
                    <input
                      type="text"
                      value={formData.softwareDetails.version}
                      onChange={(e) => handleNestedChange('softwareDetails', 'version', e.target.value)}
                      placeholder="e.g., 2.4.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Design Standard <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(DESIGN_STANDARDS)
                      .filter(([_, std]) => std.applicableTo === 'software')
                      .map(([key, std]) => (
                        <label
                          key={key}
                          className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                            formData.softwareDetails.designStandard === key
                              ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="designStandard"
                            checked={formData.softwareDetails.designStandard === key}
                            onChange={() => handleNestedChange('softwareDetails', 'designStandard', key)}
                            className="mt-1 h-4 w-4 text-purple-600"
                          />
                          <div>
                            <p className="font-medium text-sm text-gray-900">{std.label}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{std.description}</p>
                          </div>
                        </label>
                      ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Design Assurance Level (DAL)
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(SOFTWARE_DAL_LEVELS).map(([key, level]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleNestedChange('softwareDetails', 'dalLevel', key)}
                        className={`p-2 border rounded-lg text-center transition-all ${
                          formData.softwareDetails.dalLevel === key
                            ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-bold text-lg text-gray-900">{key}</p>
                        <p className="text-xs text-gray-500">{level.label.split(' - ')[1]}</p>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {SOFTWARE_DAL_LEVELS[formData.softwareDetails.dalLevel]?.description}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Software Description
                  </label>
                  <textarea
                    value={formData.softwareDetails.description}
                    onChange={(e) => handleNestedChange('softwareDetails', 'description', e.target.value)}
                    placeholder="Describe the software's main functions and role in the RPAS..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Review Step */}
            {isReviewStep && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-blue-600" />
                    Review Declaration Details
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Declaration Name</p>
                      <p className="font-medium text-gray-900">{formData.name}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Category</p>
                      <p className="text-gray-900">{MPD_RPAS_CATEGORIES[formData.category]?.label}</p>
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">RPAS System</p>
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {formData.manufacturer} {formData.model}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                        <div>
                          <span className="text-gray-500">Weight:</span>
                          <span className="ml-1 font-medium">{formData.operatingWeight} kg</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Max Velocity:</span>
                          <span className="ml-1 font-medium">{formData.maxVelocity} m/s</span>
                        </div>
                        <div>
                          <span className="text-gray-500">KE:</span>
                          <span className={`ml-1 font-medium ${
                            keCategory.category === 'very_high' ? 'text-red-600' :
                            keCategory.category === 'high' ? 'text-orange-600' :
                            ''
                          }`}>
                            {(kineticEnergy / 1000).toFixed(1)} kJ
                          </span>
                        </div>
                      </div>
                    </div>

                    {formData.hasCustomSoftware && (
                      <div className="border-t pt-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Custom Software</p>
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Code className="w-4 h-4 text-purple-600" />
                            <span className="font-medium text-purple-900">
                              {formData.softwareDetails.name}
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-purple-700">
                            {formData.softwareDetails.designStandard?.replace('_', ' ')} • DAL {formData.softwareDetails.dalLevel}
                          </div>
                        </div>
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
                        <li>1. Complete all 8 documentation sections</li>
                        <li>2. Upload evidence for each requirement</li>
                        {formData.hasCustomSoftware && (
                          <li>3. Complete software verification documentation</li>
                        )}
                        <li>{formData.hasCustomSoftware ? '4' : '3'}. Link to SFOC application if applicable</li>
                        <li>{formData.hasCustomSoftware ? '5' : '4'}. Submit to Transport Canada for acceptance</li>
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

            {!isReviewStep ? (
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
                    Create Declaration
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
