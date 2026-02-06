/**
 * GroundRiskStep.jsx
 * Step 2: Ground Risk Assessment
 *
 * Calculates Intrinsic GRC from population and UA characteristics
 * Applies M1A, M1B, M1C, M2 mitigations to determine Final GRC
 *
 * @location src/components/sora/steps/GroundRiskStep.jsx
 */

import { useState, useEffect, useMemo } from 'react'
import {
  Target,
  Users,
  Plane,
  Shield,
  Save,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react'
import { updateGroundRisk } from '../../../lib/firestoreSora'
import {
  populationCategories,
  uaCharacteristics,
  intrinsicGRCMatrix,
  groundMitigations,
  getIntrinsicGRC,
  calculateFinalGRC,
  robustnessLevels
} from '../../../lib/soraConfig'

export default function GroundRiskStep({ assessment }) {
  const [saving, setSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    populationCategory: '',
    uaCharacteristic: '',
    mitigations: {
      M1A: { enabled: false, robustness: null, evidence: '' },
      M1B: { enabled: false, robustness: null, evidence: '' },
      M1C: { enabled: false, robustness: null, evidence: '' },
      M2: { enabled: false, robustness: null, evidence: '' }
    }
  })

  // Initialize from assessment
  useEffect(() => {
    if (assessment?.groundRisk) {
      setFormData({
        populationCategory: assessment.groundRisk.populationCategory || '',
        uaCharacteristic: assessment.groundRisk.uaCharacteristic || '',
        mitigations: assessment.groundRisk.mitigations || {
          M1A: { enabled: false, robustness: null, evidence: '' },
          M1B: { enabled: false, robustness: null, evidence: '' },
          M1C: { enabled: false, robustness: null, evidence: '' },
          M2: { enabled: false, robustness: null, evidence: '' }
        }
      })
    }
  }, [assessment])

  // Calculate GRC values
  const calculations = useMemo(() => {
    const iGRC = getIntrinsicGRC(formData.populationCategory, formData.uaCharacteristic)
    const finalGRC = calculateFinalGRC(iGRC, formData.mitigations)
    const totalReduction = iGRC !== null && finalGRC !== null ? iGRC - finalGRC : 0

    return { iGRC, finalGRC, totalReduction }
  }, [formData.populationCategory, formData.uaCharacteristic, formData.mitigations])

  const updateMitigation = (mitId, field, value) => {
    setFormData(prev => ({
      ...prev,
      mitigations: {
        ...prev.mitigations,
        [mitId]: {
          ...prev.mitigations[mitId],
          [field]: value
        }
      }
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateGroundRisk(assessment.id, {
        populationCategory: formData.populationCategory,
        uaCharacteristic: formData.uaCharacteristic,
        mitigations: formData.mitigations
      })
    } catch (err) {
      console.error('Error saving ground risk:', err)
    } finally {
      setSaving(false)
    }
  }

  // Get valid robustness levels for a mitigation
  const getValidRobustnessLevels = (mitId) => {
    const mit = groundMitigations[mitId]
    return robustnessLevels.filter(level => {
      if (level.value === 'none') return true
      if (mit.maxRobustness && level.value !== 'none') {
        const order = ['low', 'medium', 'high']
        return order.indexOf(level.value) <= order.indexOf(mit.maxRobustness)
      }
      if (mit.minRobustness) {
        const order = ['low', 'medium', 'high']
        return order.indexOf(level.value) >= order.indexOf(mit.minRobustness)
      }
      return true
    })
  }

  // Check for M1A/M1B conflict
  const hasM1Conflict = formData.mitigations.M1A.robustness === 'medium' &&
    formData.mitigations.M1B.enabled

  return (
    <div className="divide-y divide-gray-200">
      {/* Header */}
      <div className="p-4 bg-orange-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Target className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Step 2: Ground Risk Assessment</h3>
              <p className="text-sm text-gray-600">Determine Intrinsic GRC and apply mitigations</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !formData.populationCategory || !formData.uaCharacteristic}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save & Calculate
          </button>
        </div>
      </div>

      {/* Population Category */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-5 h-5 text-gray-600" />
          <h4 className="font-medium text-gray-900">Population Density Category</h4>
          <span className="text-red-500">*</span>
        </div>
        <p className="text-sm text-gray-500 mb-3">
          Select the population density of your operational area (SORA Table 3)
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(populationCategories).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setFormData(prev => ({ ...prev, populationCategory: key }))}
              className={`p-3 rounded-lg border text-left transition-colors ${
                formData.populationCategory === key
                  ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-medium text-gray-900">{cat.label}</p>
              <p className="text-xs text-gray-500 mt-1">{cat.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* UA Characteristics */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Plane className="w-5 h-5 text-gray-600" />
          <h4 className="font-medium text-gray-900">UA Characteristics</h4>
          <span className="text-red-500">*</span>
        </div>
        <p className="text-sm text-gray-500 mb-3">
          Based on max dimension and max cruise speed (SORA Table 2 columns)
        </p>

        {/* Auto-detected from ConOps */}
        {assessment?.conops?.uasDescription?.maxDimension && assessment?.conops?.uasDescription?.maxSpeed && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
            <p className="text-sm text-blue-700">
              <strong>From ConOps:</strong> {assessment.conops.uasDescription.maxDimension}m dimension,{' '}
              {assessment.conops.uasDescription.maxSpeed} m/s speed
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(uaCharacteristics).map(([key, char]) => (
            <button
              key={key}
              onClick={() => setFormData(prev => ({ ...prev, uaCharacteristic: key }))}
              className={`p-3 rounded-lg border text-left transition-colors ${
                formData.uaCharacteristic === key
                  ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-medium text-gray-900">{char.label}</p>
              <p className="text-xs text-gray-500 mt-1">{char.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Intrinsic GRC Result */}
      {formData.populationCategory && formData.uaCharacteristic && (
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-gray-600" />
            <h4 className="font-medium text-gray-900">Intrinsic Ground Risk Class (iGRC)</h4>
          </div>

          <div className={`p-4 rounded-lg border ${
            calculations.iGRC === null
              ? 'bg-red-50 border-red-200'
              : calculations.iGRC <= 3
              ? 'bg-green-50 border-green-200'
              : calculations.iGRC <= 5
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-red-50 border-red-200'
          }`}>
            {calculations.iGRC === null ? (
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                <p className="font-medium">Outside SORA Scope</p>
                <p className="text-sm">This combination requires certified category operations</p>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Intrinsic GRC (from Table 2)</p>
                  <p className="text-3xl font-bold">{calculations.iGRC}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Population: {populationCategories[formData.populationCategory]?.label}</p>
                  <p className="text-sm text-gray-600">UA: {uaCharacteristics[formData.uaCharacteristic]?.label}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ground Risk Mitigations */}
      {calculations.iGRC !== null && (
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-gray-600" />
            <h4 className="font-medium text-gray-900">Ground Risk Mitigations (Annex B)</h4>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Apply mitigations to reduce the Ground Risk Class
          </p>

          {hasM1Conflict && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-700">
                <strong>Warning:</strong> M1(A) at medium robustness cannot be combined with M1(B).
                Please adjust your mitigations.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {Object.entries(groundMitigations).map(([mitId, mit]) => {
              const mitData = formData.mitigations[mitId]
              const validRobustness = getValidRobustnessLevels(mitId)

              return (
                <div
                  key={mitId}
                  className={`p-4 rounded-lg border ${
                    mitData.enabled ? 'border-orange-300 bg-orange-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={mitData.enabled}
                      onChange={(e) => updateMitigation(mitId, 'enabled', e.target.checked)}
                      className="w-4 h-4 text-orange-600 rounded mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">{mit.name}</p>
                        {mitData.enabled && mitData.robustness && mit.reductions[mitData.robustness] && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-sm rounded font-medium">
                            {mit.reductions[mitData.robustness]} GRC
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{mit.description}</p>
                      {mit.notes && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Info className="w-3 h-3" /> {mit.notes}
                        </p>
                      )}

                      {mitData.enabled && (
                        <div className="mt-3 grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Robustness Level
                            </label>
                            <select
                              value={mitData.robustness || ''}
                              onChange={(e) => updateMitigation(mitId, 'robustness', e.target.value || null)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            >
                              <option value="">Select robustness</option>
                              {validRobustness.filter(r => r.value !== 'none').map(level => (
                                <option key={level.value} value={level.value}>
                                  {level.label} ({level.code})
                                  {mit.reductions[level.value] && ` → ${mit.reductions[level.value]} GRC`}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Evidence Reference
                            </label>
                            <input
                              type="text"
                              value={mitData.evidence}
                              onChange={(e) => updateMitigation(mitId, 'evidence', e.target.value)}
                              placeholder="Document reference..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Final GRC Result */}
      {calculations.iGRC !== null && (
        <div className="p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Final Ground Risk Class</p>
              <div className="flex items-center gap-3">
                <p className="text-4xl font-bold text-gray-900">{calculations.finalGRC}</p>
                {calculations.totalReduction > 0 && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-sm rounded-lg">
                    -{calculations.totalReduction} from mitigations
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              {calculations.finalGRC <= 7 ? (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Within SORA scope
                </p>
              ) : (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  GRC &gt;7 requires certified category
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving || !formData.populationCategory || !formData.uaCharacteristic}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save & Continue to Air Risk'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
