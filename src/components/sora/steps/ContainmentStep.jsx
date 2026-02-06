/**
 * ContainmentStep.jsx
 * Step 5: Containment Strategy
 *
 * Defines adjacent area population and containment methods
 * per SORA Step 8
 *
 * @location src/components/sora/steps/ContainmentStep.jsx
 */

import { useState, useEffect, useMemo } from 'react'
import {
  Shield,
  MapPin,
  Save,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react'
import { updateContainment } from '../../../lib/firestoreSora'
import {
  populationCategories,
  containmentMethods,
  containmentRobustness,
  getContainmentRequirement,
  calculateAdjacentAreaDistance,
  robustnessLevels
} from '../../../lib/soraConfig'

export default function ContainmentStep({ assessment }) {
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    adjacentPopulation: '',
    method: '',
    achievedRobustness: '',
    evidence: ''
  })

  const sailLevel = assessment?.sail?.level
  const maxSpeed = assessment?.conops?.uasDescription?.maxSpeed

  // Initialize from assessment
  useEffect(() => {
    if (assessment?.containment) {
      setFormData({
        adjacentPopulation: assessment.containment.adjacentPopulation || '',
        method: assessment.containment.method || '',
        achievedRobustness: assessment.containment.achievedRobustness || '',
        evidence: assessment.containment.evidence || ''
      })
    }
  }, [assessment])

  // Calculate requirements
  const calculations = useMemo(() => {
    if (!formData.adjacentPopulation || !sailLevel) {
      return { requiredRobustness: null, distanceKm: null, meetsRequirement: false }
    }

    const requiredRobustness = getContainmentRequirement(formData.adjacentPopulation, sailLevel)
    const distanceM = maxSpeed ? calculateAdjacentAreaDistance(maxSpeed) : null
    const distanceKm = distanceM ? (distanceM / 1000).toFixed(1) : null

    // Check if achieved robustness meets requirement
    const robOrder = ['none', 'low', 'medium', 'high']
    const achievedLevel = robOrder.indexOf(formData.achievedRobustness)
    const requiredLevel = robOrder.indexOf(requiredRobustness)
    const meetsRequirement = achievedLevel >= requiredLevel

    return { requiredRobustness, distanceKm, meetsRequirement }
  }, [formData.adjacentPopulation, formData.achievedRobustness, sailLevel, maxSpeed])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateContainment(assessment.id, {
        ...formData,
        requiredRobustness: calculations.requiredRobustness
      })
    } catch (err) {
      console.error('Error saving containment:', err)
    } finally {
      setSaving(false)
    }
  }

  if (!sailLevel) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">SAIL Not Yet Determined</h3>
        <p className="text-gray-500">
          Complete the SAIL determination step before defining containment strategy.
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-200">
      {/* Header */}
      <div className="p-4 bg-teal-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <Shield className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Step 5: Containment Strategy</h3>
              <p className="text-sm text-gray-600">Define containment for adjacent areas (SORA Step 8)</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !formData.adjacentPopulation || !formData.method}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Containment
          </button>
        </div>
      </div>

      {/* Adjacent Area Distance */}
      {calculations.distanceKm && (
        <div className="p-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">Adjacent Area Definition</p>
                <p className="text-sm text-blue-700 mt-1">
                  Based on max speed of {maxSpeed} m/s, the adjacent area extends{' '}
                  <strong>{calculations.distanceKm} km</strong> from the operational volume
                  (3 minutes × max speed, min 5km, max 35km per SORA).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Adjacent Area Population */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-5 h-5 text-gray-600" />
          <h4 className="font-medium text-gray-900">Adjacent Area Population Density</h4>
          <span className="text-red-500">*</span>
        </div>
        <p className="text-sm text-gray-500 mb-3">
          What is the highest population density in the adjacent area?
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(populationCategories).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setFormData(prev => ({ ...prev, adjacentPopulation: key }))}
              className={`p-3 rounded-lg border text-left transition-colors ${
                formData.adjacentPopulation === key
                  ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-medium text-gray-900">{cat.label}</p>
              <p className="text-xs text-gray-500 mt-1">{cat.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Required Robustness */}
      {formData.adjacentPopulation && calculations.requiredRobustness && (
        <div className="p-4">
          <div className={`p-4 rounded-lg border ${
            calculations.requiredRobustness === 'low' ? 'bg-green-50 border-green-200' :
            calculations.requiredRobustness === 'medium' ? 'bg-yellow-50 border-yellow-200' :
            'bg-red-50 border-red-200'
          }`}>
            <p className="font-medium text-gray-900">
              Required Containment Robustness for SAIL {sailLevel}:
            </p>
            <p className="text-2xl font-bold capitalize mt-1">
              {calculations.requiredRobustness}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Based on adjacent area: {populationCategories[formData.adjacentPopulation]?.label}
            </p>
          </div>
        </div>
      )}

      {/* Containment Method */}
      {formData.adjacentPopulation && (
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-gray-600" />
            <h4 className="font-medium text-gray-900">Containment Method</h4>
            <span className="text-red-500">*</span>
          </div>

          <div className="space-y-3">
            {Object.entries(containmentMethods).map(([key, method]) => {
              const canAchieveRequired = (() => {
                const robOrder = ['none', 'low', 'medium', 'high']
                const achievable = robOrder.indexOf(method.robustnessAchievable)
                const required = robOrder.indexOf(calculations.requiredRobustness)
                return achievable >= required
              })()

              return (
                <label
                  key={key}
                  className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    formData.method === key
                      ? 'border-teal-500 bg-teal-50'
                      : !canAchieveRequired
                      ? 'border-gray-200 opacity-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="containment_method"
                    checked={formData.method === key}
                    onChange={() => setFormData(prev => ({
                      ...prev,
                      method: key,
                      achievedRobustness: method.robustnessAchievable
                    }))}
                    disabled={!canAchieveRequired && key !== 'none'}
                    className="w-4 h-4 text-teal-600 mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">{method.label}</p>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        method.robustnessAchievable === 'none' ? 'bg-gray-100 text-gray-600' :
                        method.robustnessAchievable === 'low' ? 'bg-green-100 text-green-700' :
                        method.robustnessAchievable === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {method.robustnessAchievable} robustness
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                    {method.evidenceRequired?.length > 0 && formData.method === key && (
                      <div className="mt-2 p-2 bg-gray-100 rounded">
                        <p className="text-xs font-medium text-gray-700">Evidence Required:</p>
                        <ul className="text-xs text-gray-600 mt-1 list-disc list-inside">
                          {method.evidenceRequired.map((ev, i) => (
                            <li key={i}>{ev}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {!canAchieveRequired && key !== 'none' && (
                      <p className="text-xs text-red-600 mt-1">
                        Cannot achieve required {calculations.requiredRobustness} robustness
                      </p>
                    )}
                  </div>
                </label>
              )
            })}
          </div>
        </div>
      )}

      {/* Evidence Reference */}
      {formData.method && formData.method !== 'none' && (
        <div className="p-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Evidence Reference
          </label>
          <textarea
            value={formData.evidence}
            onChange={(e) => setFormData(prev => ({ ...prev, evidence: e.target.value }))}
            placeholder="Document references, test reports, or other evidence..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>
      )}

      {/* Summary and Save */}
      <div className="p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            {calculations.meetsRequirement ? (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Containment meets SAIL {sailLevel} requirements
              </p>
            ) : formData.method ? (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                Selected method does not meet required robustness
              </p>
            ) : (
              <p className="text-sm text-gray-500">Select a containment method to continue</p>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !formData.adjacentPopulation || !formData.method}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save & Continue to OSOs'}
          </button>
        </div>
      </div>
    </div>
  )
}
