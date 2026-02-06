/**
 * AirRiskStep.jsx
 * Step 3: Air Risk Assessment
 *
 * Determines Initial ARC and applies tactical mitigations (TMPR)
 * to calculate Residual ARC
 *
 * @location src/components/sora/steps/AirRiskStep.jsx
 */

import { useState, useEffect, useMemo } from 'react'
import {
  Plane,
  Radio,
  Eye,
  Shield,
  Save,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react'
import { updateAirRisk } from '../../../lib/firestoreSora'
import {
  arcLevels,
  tmprDefinitions,
  calculateResidualARC,
  robustnessLevels
} from '../../../lib/soraConfig'

export default function AirRiskStep({ assessment }) {
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    initialARC: '',
    airspaceType: '',
    encounterRate: '',
    tmpr: {
      enabled: false,
      type: null,
      robustness: null,
      evidence: ''
    }
  })

  // Initialize from assessment
  useEffect(() => {
    if (assessment?.airRisk) {
      setFormData({
        initialARC: assessment.airRisk.initialARC || '',
        airspaceType: assessment.airRisk.airspaceType || '',
        encounterRate: assessment.airRisk.encounterRate || '',
        tmpr: assessment.airRisk.tmpr || {
          enabled: false,
          type: null,
          robustness: null,
          evidence: ''
        }
      })
    }
  }, [assessment])

  // Calculate residual ARC
  const calculations = useMemo(() => {
    const residualARC = calculateResidualARC(formData.initialARC, formData.tmpr)
    const arcReduced = formData.initialARC && residualARC !== formData.initialARC

    return { residualARC, arcReduced }
  }, [formData.initialARC, formData.tmpr])

  const updateTMPR = (field, value) => {
    setFormData(prev => ({
      ...prev,
      tmpr: {
        ...prev.tmpr,
        [field]: value
      }
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateAirRisk(assessment.id, formData)
    } catch (err) {
      console.error('Error saving air risk:', err)
    } finally {
      setSaving(false)
    }
  }

  // Get required robustness for selected TMPR type
  const getRequiredRobustness = () => {
    if (!formData.tmpr.type) return null
    return tmprDefinitions[formData.tmpr.type]?.robustnessRequired
  }

  return (
    <div className="divide-y divide-gray-200">
      {/* Header */}
      <div className="p-4 bg-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Plane className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Step 3: Air Risk Assessment</h3>
              <p className="text-sm text-gray-600">Determine Initial ARC and apply tactical mitigations</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !formData.initialARC}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
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

      {/* Initial ARC Selection */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Radio className="w-5 h-5 text-gray-600" />
          <h4 className="font-medium text-gray-900">Initial Air Risk Class</h4>
          <span className="text-red-500">*</span>
        </div>
        <p className="text-sm text-gray-500 mb-3">
          Based on airspace type and expected encounter rate with manned aircraft (SORA Figure 6)
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(arcLevels).map(([key, arc]) => (
            <button
              key={key}
              onClick={() => setFormData(prev => ({ ...prev, initialARC: key }))}
              className={`p-4 rounded-lg border text-left transition-colors ${
                formData.initialARC === key
                  ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-lg text-gray-900">{key}</p>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  key === 'ARC-a' ? 'bg-green-100 text-green-700' :
                  key === 'ARC-b' ? 'bg-yellow-100 text-yellow-700' :
                  key === 'ARC-c' ? 'bg-orange-100 text-orange-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {arc.encounters}
                </span>
              </div>
              <p className="text-sm text-gray-600">{arc.description}</p>
              <p className="text-xs text-gray-500 mt-1">{arc.notes}</p>
            </button>
          ))}
        </div>

        {/* Airspace Context */}
        {formData.initialARC && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Airspace Type</label>
              <select
                value={formData.airspaceType}
                onChange={(e) => setFormData(prev => ({ ...prev, airspaceType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select airspace</option>
                <option value="segregated">Segregated/Restricted</option>
                <option value="uncontrolled_rural">Uncontrolled - Rural</option>
                <option value="uncontrolled_urban">Uncontrolled - Urban</option>
                <option value="controlled">Controlled Airspace</option>
                <option value="airport_environment">Airport/Heliport Environment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Encounter Rate</label>
              <select
                value={formData.encounterRate}
                onChange={(e) => setFormData(prev => ({ ...prev, encounterRate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select rate</option>
                <option value="negligible">Negligible</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Tactical Mitigation (TMPR) */}
      {formData.initialARC && (
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-5 h-5 text-gray-600" />
            <h4 className="font-medium text-gray-900">Tactical Mitigation Performance Requirement (TMPR)</h4>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Apply tactical mitigations to reduce Air Risk Class (Annex D)
          </p>

          {/* TMPR Enable */}
          <div className="space-y-4">
            <label className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.tmpr.enabled}
                onChange={(e) => {
                  if (!e.target.checked) {
                    setFormData(prev => ({
                      ...prev,
                      tmpr: { enabled: false, type: null, robustness: null, evidence: '' }
                    }))
                  } else {
                    updateTMPR('enabled', true)
                  }
                }}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <div>
                <p className="font-medium text-gray-900">Apply Tactical Mitigation</p>
                <p className="text-sm text-gray-500">Reduce ARC through see-and-avoid or detect-and-avoid capability</p>
              </div>
            </label>

            {/* TMPR Type Selection */}
            {formData.tmpr.enabled && (
              <div className="ml-7 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mitigation Type</label>
                  <div className="space-y-2">
                    {Object.entries(tmprDefinitions).map(([key, tmpr]) => (
                      <label
                        key={key}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          formData.tmpr.type === key
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="tmpr_type"
                          checked={formData.tmpr.type === key}
                          onChange={() => updateTMPR('type', key)}
                          className="w-4 h-4 text-purple-600 mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900">{key}</p>
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                              -{tmpr.arcReduction} ARC
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{tmpr.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Required robustness: {tmpr.robustnessRequired} | Max residual: {tmpr.maxResidualARC}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Robustness Selection */}
                {formData.tmpr.type && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Robustness Level
                      </label>
                      <select
                        value={formData.tmpr.robustness || ''}
                        onChange={(e) => updateTMPR('robustness', e.target.value || null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Select robustness</option>
                        {robustnessLevels.filter(r => r.value !== 'none').map(level => (
                          <option key={level.value} value={level.value}>
                            {level.label} ({level.code})
                          </option>
                        ))}
                      </select>
                      {getRequiredRobustness() && (
                        <p className="text-xs text-gray-500 mt-1">
                          Minimum required: {getRequiredRobustness()}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Evidence Reference
                      </label>
                      <input
                        type="text"
                        value={formData.tmpr.evidence}
                        onChange={(e) => updateTMPR('evidence', e.target.value)}
                        placeholder="Document reference..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Residual ARC Result */}
      {formData.initialARC && (
        <div className="p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Residual Air Risk Class</p>
              <div className="flex items-center gap-3">
                <p className={`text-4xl font-bold ${
                  calculations.residualARC === 'ARC-a' ? 'text-green-700' :
                  calculations.residualARC === 'ARC-b' ? 'text-yellow-700' :
                  calculations.residualARC === 'ARC-c' ? 'text-orange-700' :
                  'text-red-700'
                }`}>
                  {calculations.residualARC || formData.initialARC}
                </p>
                {calculations.arcReduced && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-sm rounded-lg">
                    Reduced from {formData.initialARC}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {arcLevels[calculations.residualARC]?.description || arcLevels[formData.initialARC]?.description}
              </p>
            </div>
          </div>

          {/* GRC+ARC Summary for SAIL */}
          {assessment?.groundRisk?.finalGRC && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Ready for SAIL Determination:</strong><br />
                Final GRC: {assessment.groundRisk.finalGRC} | Residual ARC: {calculations.residualARC || formData.initialARC}
              </p>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving || !formData.initialARC}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save & Continue to SAIL'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
