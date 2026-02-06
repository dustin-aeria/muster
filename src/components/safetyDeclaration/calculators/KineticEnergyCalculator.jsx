/**
 * Kinetic Energy Calculator Component
 * Enhanced calculator with guidance, presets, and AI verification
 *
 * @location src/components/safetyDeclaration/calculators/KineticEnergyCalculator.jsx
 */

import React, { useState, useMemo, useEffect } from 'react'
import {
  Calculator,
  HelpCircle,
  Zap,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Search,
  Plane,
  Weight,
  Gauge,
  Info,
  Sparkles,
  RefreshCw,
  Check,
  X
} from 'lucide-react'
import { HelpTooltip, Tooltip } from '../../ui/Tooltip'
import { HelpPanel, InlineHelpTip, WhatIsThis } from '../help/HelpPanel'
import {
  KINETIC_ENERGY_CATEGORIES,
  DRONE_PRESETS,
  calculateKineticEnergy,
  getKineticEnergyCategory,
  getRPASCategory,
  searchDronePresets
} from '../../../lib/requirementGuidance'

// ============================================
// Main Calculator Component
// ============================================

export function KineticEnergyCalculator({
  initialMass = '',
  initialVelocity = '',
  onCalculate,
  onAIVerify,
  showPresets = true,
  showHelp = true,
  showBreakdown = true,
  compact = false,
  className = ''
}) {
  // Form State
  const [mass, setMass] = useState(initialMass)
  const [velocity, setVelocity] = useState(initialVelocity)
  const [showPresetSearch, setShowPresetSearch] = useState(false)
  const [presetSearch, setPresetSearch] = useState('')
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState(null)

  // Parsed values
  const massKg = parseFloat(mass) || 0
  const velocityMs = parseFloat(velocity) || 0

  // Calculations
  const kineticEnergy = useMemo(() => {
    if (massKg > 0 && velocityMs > 0) {
      return calculateKineticEnergy(massKg, velocityMs)
    }
    return 0
  }, [massKg, velocityMs])

  const keCategory = useMemo(() => {
    return getKineticEnergyCategory(kineticEnergy)
  }, [kineticEnergy])

  const rpasCategory = useMemo(() => {
    return getRPASCategory(massKg)
  }, [massKg])

  // Notify parent of calculation
  useEffect(() => {
    if (kineticEnergy > 0) {
      onCalculate?.({
        massKg,
        velocityMs,
        kineticEnergy,
        keCategory,
        rpasCategory
      })
    }
  }, [kineticEnergy, keCategory, rpasCategory, massKg, velocityMs, onCalculate])

  // Filter presets
  const filteredPresets = useMemo(() => {
    if (!presetSearch) {
      return Object.entries(DRONE_PRESETS).slice(0, 6).map(([id, drone]) => ({ id, ...drone }))
    }
    return searchDronePresets(presetSearch).slice(0, 8)
  }, [presetSearch])

  // Apply preset
  const applyPreset = (preset) => {
    setMass(preset.weightKg.toString())
    setVelocity(preset.maxVelocityMs.toString())
    setShowPresetSearch(false)
    setPresetSearch('')
  }

  // AI Verification
  const handleVerify = async () => {
    if (!onAIVerify || kineticEnergy <= 0) return

    setIsVerifying(true)
    setVerificationResult(null)

    try {
      const result = await onAIVerify({
        massKg,
        velocityMs,
        calculatedKE: kineticEnergy,
        keCategory
      })
      setVerificationResult(result)
    } catch (error) {
      setVerificationResult({ success: false, error: error.message })
    } finally {
      setIsVerifying(false)
    }
  }

  // Category info
  const categoryInfo = KINETIC_ENERGY_CATEGORIES[keCategory]

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Zap className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Kinetic Energy Calculator</h3>
              <p className="text-xs text-gray-500">CAR 922.07 Compliance</p>
            </div>
          </div>
          {showHelp && (
            <HelpTooltip
              content="Calculate kinetic energy to determine your reliability category per CAR 922.07"
              position="left"
              size="md"
            />
          )}
        </div>
      </div>

      {/* Calculator Body */}
      <div className="p-4 space-y-4">
        {/* Input Fields */}
        <div className="grid grid-cols-2 gap-4">
          {/* Mass Input */}
          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
              <Weight className="w-4 h-4 text-gray-400" />
              Mass (kg)
              <Tooltip content="Maximum takeoff weight including batteries, payload, and all equipment">
                <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
              </Tooltip>
            </label>
            <input
              type="number"
              value={mass}
              onChange={(e) => setMass(e.target.value)}
              placeholder="e.g., 9.0"
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
            {massKg > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Category: {RPAS_WEIGHT_CATEGORIES_DISPLAY[rpasCategory]}
              </p>
            )}
          </div>

          {/* Velocity Input */}
          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
              <Gauge className="w-4 h-4 text-gray-400" />
              Max Velocity (m/s)
              <Tooltip content="Maximum achievable speed, not cruise speed. Check manufacturer specs.">
                <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
              </Tooltip>
            </label>
            <input
              type="number"
              value={velocity}
              onChange={(e) => setVelocity(e.target.value)}
              placeholder="e.g., 23"
              step="0.1"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
            {velocityMs > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                = {(velocityMs * 3.6).toFixed(1)} km/h
              </p>
            )}
          </div>
        </div>

        {/* Presets Section */}
        {showPresets && (
          <div>
            <button
              onClick={() => setShowPresetSearch(!showPresetSearch)}
              className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800"
            >
              <Plane className="w-4 h-4" />
              <span>Use a preset drone</span>
              {showPresetSearch ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showPresetSearch && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={presetSearch}
                    onChange={(e) => setPresetSearch(e.target.value)}
                    placeholder="Search drones (e.g., DJI, M300)..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {filteredPresets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset)}
                      className="p-2 text-left bg-white rounded border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {preset.manufacturer} {preset.model}
                      </p>
                      <p className="text-xs text-gray-500">
                        {preset.weightKg}kg / {preset.maxVelocityMs}m/s
                      </p>
                    </button>
                  ))}
                </div>

                {filteredPresets.length === 0 && (
                  <p className="text-center text-sm text-gray-500 py-4">
                    No drones found. Try a different search.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Help Tips */}
        {showHelp && !compact && (
          <div className="space-y-2">
            <InlineHelpTip
              type="tip"
              message="Use maximum takeoff weight (MTOW) with all equipment and maximum achievable speed - not cruise speed."
              dismissible
            />
          </div>
        )}

        {/* Results Section */}
        {kineticEnergy > 0 && (
          <div className="pt-4 border-t border-gray-200 space-y-4">
            {/* Main Result */}
            <div className={`p-4 rounded-lg ${categoryInfo?.color || 'bg-gray-100'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Kinetic Energy</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {kineticEnergy.toLocaleString(undefined, { maximumFractionDigits: 1 })} J
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">Category</p>
                  <p className="text-xl font-bold">
                    {categoryInfo?.label || 'Unknown'}
                  </p>
                </div>
              </div>

              {/* Category-specific warning */}
              {keCategory === 'very_high' && (
                <div className="mt-3 p-2 bg-red-100 rounded flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">
                    <strong>Very High KE:</strong> Direct consultation with Transport Canada is required for RPAS in this category.
                  </p>
                </div>
              )}
            </div>

            {/* Reliability Targets Summary */}
            {categoryInfo?.reliabilityTargets && (
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  Required Reliability Targets
                  <Tooltip content="Maximum allowable failure probability per flight hour for this KE category">
                    <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
                  </Tooltip>
                </h4>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 bg-white rounded border border-red-200">
                    <p className="text-xs text-gray-500">Catastrophic</p>
                    <p className="text-sm font-mono font-medium text-red-600">
                      10<sup>{Math.log10(categoryInfo.reliabilityTargets.catastrophic)}</sup>
                    </p>
                  </div>
                  <div className="p-2 bg-white rounded border border-orange-200">
                    <p className="text-xs text-gray-500">Hazardous</p>
                    <p className="text-sm font-mono font-medium text-orange-600">
                      10<sup>{Math.log10(categoryInfo.reliabilityTargets.hazardous)}</sup>
                    </p>
                  </div>
                  <div className="p-2 bg-white rounded border border-yellow-200">
                    <p className="text-xs text-gray-500">Major</p>
                    <p className="text-sm font-mono font-medium text-yellow-600">
                      10<sup>{Math.log10(categoryInfo.reliabilityTargets.major)}</sup>
                    </p>
                  </div>
                  <div className="p-2 bg-white rounded border border-blue-200">
                    <p className="text-xs text-gray-500">Minor</p>
                    <p className="text-sm font-mono font-medium text-blue-600">
                      10<sup>{Math.log10(categoryInfo.reliabilityTargets.minor)}</sup>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Breakdown */}
            {showBreakdown && (
              <div>
                <button
                  onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
                  className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Show calculation breakdown</span>
                  {showDetailedBreakdown ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {showDetailedBreakdown && (
                  <div className="mt-2 p-3 bg-gray-900 text-gray-100 rounded-lg font-mono text-sm space-y-1">
                    <p className="text-indigo-400">// Kinetic Energy Formula</p>
                    <p className="text-gray-300">KE = 0.5 × m × v²</p>
                    <p className="text-gray-300">KE = 0.5 × {massKg} kg × ({velocityMs} m/s)²</p>
                    <p className="text-gray-300">KE = 0.5 × {massKg} × {(velocityMs * velocityMs).toFixed(2)}</p>
                    <p className="text-green-400 font-medium">KE = {kineticEnergy.toLocaleString(undefined, { maximumFractionDigits: 2 })} J</p>
                    <p className="text-gray-500 mt-2">// Category Determination</p>
                    <p className="text-gray-300">
                      {kineticEnergy < 700 && '< 700 J → Low Category'}
                      {kineticEnergy >= 700 && kineticEnergy < 34000 && '700 J ≤ KE < 34,000 J → Medium Category'}
                      {kineticEnergy >= 34000 && kineticEnergy < 1084000 && '34,000 J ≤ KE < 1,084,000 J → High Category'}
                      {kineticEnergy >= 1084000 && '≥ 1,084,000 J → Very High Category'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* AI Verification Button */}
            {onAIVerify && (
              <div className="pt-3 border-t border-gray-200">
                <button
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Verifying with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Verify with AI
                    </>
                  )}
                </button>

                {/* Verification Result */}
                {verificationResult && (
                  <div className={`mt-3 p-3 rounded-lg ${
                    verificationResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-start gap-2">
                      {verificationResult.success ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      )}
                      <div className="text-sm">
                        {verificationResult.success ? (
                          <div className="prose prose-sm max-w-none text-gray-700">
                            {verificationResult.verification}
                          </div>
                        ) : (
                          <p className="text-red-700">{verificationResult.error}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {kineticEnergy <= 0 && (
          <div className="py-6 text-center text-gray-500">
            <Calculator className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Enter mass and velocity to calculate kinetic energy</p>
          </div>
        )}
      </div>

      {/* Where to Find Values Help */}
      {showHelp && !compact && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <HelpPanel title="Where do I find these values?" variant="info">
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <p className="font-medium">Mass (Weight):</p>
                <ul className="ml-4 list-disc text-gray-600 space-y-1">
                  <li>Check manufacturer specifications for "Max Takeoff Weight" or "MTOW"</li>
                  <li>Include batteries, payload, and all equipment</li>
                  <li>For custom builds, weigh with a precision scale</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">Maximum Velocity:</p>
                <ul className="ml-4 list-disc text-gray-600 space-y-1">
                  <li>Look for "Max Speed" in manufacturer specs (often in Sport mode)</li>
                  <li>Use m/s if available, or convert: km/h ÷ 3.6 = m/s</li>
                  <li>For fixed-wing, use dive speed, not cruise speed</li>
                </ul>
              </div>
            </div>
          </HelpPanel>
        </div>
      )}
    </div>
  )
}

// ============================================
// Display Labels for Categories
// ============================================

const RPAS_WEIGHT_CATEGORIES_DISPLAY = {
  micro: 'Micro (≤250g)',
  small: 'Small (≤25kg)',
  medium: 'Medium (≤150kg)',
  large: 'Large (>150kg)'
}

// ============================================
// Compact Version
// ============================================

export function KineticEnergyCalculatorCompact({
  mass,
  velocity,
  onChange,
  className = ''
}) {
  const massKg = parseFloat(mass) || 0
  const velocityMs = parseFloat(velocity) || 0
  const kineticEnergy = massKg > 0 && velocityMs > 0
    ? calculateKineticEnergy(massKg, velocityMs)
    : 0
  const keCategory = getKineticEnergyCategory(kineticEnergy)
  const categoryInfo = KINETIC_ENERGY_CATEGORIES[keCategory]

  return (
    <div className={`bg-gray-50 rounded-lg p-3 ${className}`}>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-gray-500">Mass (kg)</label>
          <input
            type="number"
            value={mass}
            onChange={(e) => onChange?.('mass', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Velocity (m/s)</label>
          <input
            type="number"
            value={velocity}
            onChange={(e) => onChange?.('velocity', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Kinetic Energy</label>
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium">
              {kineticEnergy > 0 ? `${kineticEnergy.toLocaleString(undefined, { maximumFractionDigits: 0 })} J` : '--'}
            </span>
            {kineticEnergy > 0 && (
              <span className={`px-1.5 py-0.5 text-xs rounded ${categoryInfo?.color || 'bg-gray-100'}`}>
                {categoryInfo?.label}
              </span>
            )}
          </div>
        </div>
      </div>

      {keCategory === 'very_high' && (
        <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
          <AlertTriangle className="w-3 h-3" />
          <span>Very High KE - TC consultation required</span>
        </div>
      )}
    </div>
  )
}

// ============================================
// Visual Category Display
// ============================================

export function KECategoryVisual({
  kineticEnergy,
  showScale = true,
  className = ''
}) {
  const keCategory = getKineticEnergyCategory(kineticEnergy)
  const categoryInfo = KINETIC_ENERGY_CATEGORIES[keCategory]

  // Calculate position on scale (logarithmic)
  const getScalePosition = () => {
    if (kineticEnergy <= 0) return 0
    if (kineticEnergy >= 1084000) return 100

    // Log scale: 0-100% mapped to 0-1084000J
    const logKE = Math.log10(Math.max(1, kineticEnergy))
    const logMax = Math.log10(1084000) // ~6.03
    return Math.min(100, (logKE / logMax) * 100)
  }

  const scalePosition = getScalePosition()

  return (
    <div className={className}>
      {/* Category Label */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          {kineticEnergy > 0 ? (
            <>
              {kineticEnergy.toLocaleString(undefined, { maximumFractionDigits: 0 })} J
            </>
          ) : (
            'No calculation'
          )}
        </span>
        {kineticEnergy > 0 && (
          <span className={`px-2 py-0.5 text-xs font-medium rounded ${categoryInfo?.color}`}>
            {categoryInfo?.label} KE
          </span>
        )}
      </div>

      {/* Visual Scale */}
      {showScale && (
        <div className="relative h-6 rounded-full overflow-hidden bg-gradient-to-r from-green-400 via-yellow-400 via-orange-400 to-red-500">
          {/* Category Divisions */}
          <div className="absolute inset-0 flex">
            <div className="flex-1 border-r border-white/50" title="Low <700J" />
            <div className="flex-[3] border-r border-white/50" title="Medium 700-34kJ" />
            <div className="flex-[3] border-r border-white/50" title="High 34k-1084kJ" />
            <div className="flex-1" title="Very High >1084kJ" />
          </div>

          {/* Current Position Indicator */}
          {kineticEnergy > 0 && (
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-lg border-2 border-gray-800 rounded-full transition-all duration-300"
              style={{ left: `calc(${scalePosition}% - 2px)` }}
            />
          )}
        </div>
      )}

      {/* Scale Labels */}
      {showScale && (
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0</span>
          <span>700J</span>
          <span>34kJ</span>
          <span>1084kJ</span>
        </div>
      )}
    </div>
  )
}

// ============================================
// Export All
// ============================================

export default KineticEnergyCalculator
