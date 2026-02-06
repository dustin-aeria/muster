/**
 * Reliability Calculator Component
 * Calculate and understand reliability targets per CAR 922.07
 *
 * @location src/components/safetyDeclaration/calculators/ReliabilityCalculator.jsx
 */

import React, { useState, useMemo } from 'react'
import {
  Calculator,
  HelpCircle,
  Shield,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
  Sparkles,
  RefreshCw,
  Target,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { HelpTooltip, Tooltip } from '../../ui/Tooltip'
import { HelpPanel, InlineHelpTip, WhatIsThis, QuickReferenceCard } from '../help/HelpPanel'
import {
  KINETIC_ENERGY_CATEGORIES,
  SEVERITY_CLASSIFICATIONS,
  getReliabilityTarget,
  formatProbability
} from '../../../lib/requirementGuidance'

// ============================================
// Main Calculator Component
// ============================================

export function ReliabilityCalculator({
  keCategory = 'medium',
  onCalculate,
  onAIVerify,
  showHelp = true,
  className = ''
}) {
  // Form State
  const [selectedSeverity, setSelectedSeverity] = useState('catastrophic')
  const [calculationMode, setCalculationMode] = useState('target') // 'target' | 'mtbf' | 'probability'
  const [showDetailedHelp, setShowDetailedHelp] = useState(false)

  // MTBF Inputs
  const [mtbf, setMtbf] = useState('')
  const [mtbfUnit, setMtbfUnit] = useState('hours')
  const [flightHoursPerMonth, setFlightHoursPerMonth] = useState('20')

  // Probability Inputs
  const [failures, setFailures] = useState('')
  const [totalHours, setTotalHours] = useState('')

  // AI Verification
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState(null)

  // Get target for current selections
  const targetProbability = useMemo(() => {
    return getReliabilityTarget(keCategory, selectedSeverity)
  }, [keCategory, selectedSeverity])

  // MTBF to probability conversion
  const mtbfProbability = useMemo(() => {
    const mtbfValue = parseFloat(mtbf)
    if (!mtbfValue || mtbfValue <= 0) return null
    return 1 / mtbfValue
  }, [mtbf])

  // Calculate if MTBF meets target
  const mtbfMeetsTarget = useMemo(() => {
    if (!mtbfProbability || !targetProbability) return null
    return mtbfProbability <= targetProbability
  }, [mtbfProbability, targetProbability])

  // Calculate required MTBF to meet target
  const requiredMTBF = useMemo(() => {
    if (!targetProbability) return null
    return 1 / targetProbability
  }, [targetProbability])

  // Probability from failure data
  const calculatedProbability = useMemo(() => {
    const failureCount = parseFloat(failures)
    const hours = parseFloat(totalHours)
    if (!failureCount || !hours || hours <= 0) return null
    return failureCount / hours
  }, [failures, totalHours])

  // Probability meets target
  const probabilityMeetsTarget = useMemo(() => {
    if (!calculatedProbability || !targetProbability) return null
    return calculatedProbability <= targetProbability
  }, [calculatedProbability, targetProbability])

  // Category info
  const categoryInfo = KINETIC_ENERGY_CATEGORIES[keCategory]
  const severityInfo = SEVERITY_CLASSIFICATIONS[selectedSeverity]

  // AI Verification
  const handleVerify = async () => {
    if (!onAIVerify) return

    setIsVerifying(true)
    setVerificationResult(null)

    try {
      const result = await onAIVerify({
        keCategory,
        failureSeverity: selectedSeverity,
        targetProbability,
        userCalculation: calculationMode === 'mtbf'
          ? `MTBF: ${mtbf} ${mtbfUnit}, calculated probability: ${mtbfProbability}`
          : `Failures: ${failures}, Hours: ${totalHours}, calculated probability: ${calculatedProbability}`
      })
      setVerificationResult(result)
    } catch (error) {
      setVerificationResult({ success: false, error: error.message })
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Reliability Calculator</h3>
              <p className="text-xs text-gray-500">CAR 922.07 Targets</p>
            </div>
          </div>
          {showHelp && (
            <HelpTooltip
              content="Calculate reliability targets and verify your system meets CAR 922.07 requirements"
              position="left"
              size="md"
            />
          )}
        </div>
      </div>

      {/* Calculator Body */}
      <div className="p-4 space-y-4">
        {/* Current KE Category Display */}
        <div className={`p-3 rounded-lg ${categoryInfo?.color || 'bg-gray-100'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Kinetic Energy Category</p>
              <p className="font-medium text-gray-900">{categoryInfo?.label || keCategory}</p>
            </div>
            <Target className="w-5 h-5 text-gray-500" />
          </div>
        </div>

        {/* Severity Selection */}
        <div>
          <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
            Failure Severity
            <Tooltip content="The severity of the failure consequence you are analyzing">
              <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
            </Tooltip>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(SEVERITY_CLASSIFICATIONS).map(([key, info]) => (
              <button
                key={key}
                onClick={() => setSelectedSeverity(key)}
                className={`p-2 rounded-lg border-2 text-center transition-all ${
                  selectedSeverity === key
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="text-xs font-medium text-gray-900">{info.label}</p>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {severityInfo?.description}
          </p>
        </div>

        {/* Target Display */}
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-purple-900">Required Reliability Target</p>
            <Tooltip content="Maximum allowable probability of this failure per flight hour">
              <Info className="w-4 h-4 text-purple-500 cursor-help" />
            </Tooltip>
          </div>
          <div className="flex items-baseline gap-3">
            <p className="text-3xl font-bold text-purple-700 font-mono">
              {targetProbability ? (
                <>10<sup>{Math.log10(targetProbability)}</sup></>
              ) : (
                'N/A'
              )}
            </p>
            <p className="text-sm text-purple-600">
              per flight hour
            </p>
          </div>
          <p className="text-xs text-purple-600 mt-2">
            {targetProbability && (
              <>This means no more than 1 {selectedSeverity} failure per {(1/targetProbability).toLocaleString()} flight hours</>
            )}
          </p>
        </div>

        {/* Calculation Mode Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={() => setCalculationMode('target')}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                calculationMode === 'target'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              View Target
            </button>
            <button
              onClick={() => setCalculationMode('mtbf')}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                calculationMode === 'mtbf'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              From MTBF
            </button>
            <button
              onClick={() => setCalculationMode('probability')}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                calculationMode === 'probability'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              From Data
            </button>
          </div>
        </div>

        {/* Target Mode */}
        {calculationMode === 'target' && (
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Required MTBF to Meet Target</h4>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-gray-900 font-mono">
                  {requiredMTBF?.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">hours</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Component or system must have MTBF of at least this value
              </p>
            </div>

            <InlineHelpTip
              type="tip"
              message="For system-level reliability, use Fault Tree Analysis (FTA) to combine component failure rates."
              dismissible
            />
          </div>
        )}

        {/* MTBF Mode */}
        {calculationMode === 'mtbf' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Enter MTBF (Mean Time Between Failures)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={mtbf}
                  onChange={(e) => setMtbf(e.target.value)}
                  placeholder="e.g., 10000"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
                <select
                  value={mtbfUnit}
                  onChange={(e) => setMtbfUnit(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                >
                  <option value="hours">hours</option>
                  <option value="cycles">cycles</option>
                </select>
              </div>
            </div>

            {mtbfProbability && (
              <div className={`p-3 rounded-lg ${
                mtbfMeetsTarget
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-start gap-2">
                  {mtbfMeetsTarget ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                  <div>
                    <p className={`text-sm font-medium ${mtbfMeetsTarget ? 'text-green-700' : 'text-red-700'}`}>
                      {mtbfMeetsTarget ? 'Meets Target' : 'Does Not Meet Target'}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Calculated failure rate: {mtbfProbability.toExponential(2)} per hour
                    </p>
                    <p className="text-xs text-gray-600">
                      Target: {targetProbability?.toExponential(2)} per hour
                    </p>
                    {!mtbfMeetsTarget && requiredMTBF && (
                      <p className="text-xs text-red-600 mt-1">
                        Need MTBF of at least {requiredMTBF.toLocaleString()} hours
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="p-3 bg-gray-900 text-gray-100 rounded-lg font-mono text-sm">
              <p className="text-purple-400">// MTBF to Failure Rate Conversion</p>
              <p className="text-gray-300">Failure Rate (λ) = 1 / MTBF</p>
              {mtbf && (
                <>
                  <p className="text-gray-300">λ = 1 / {mtbf}</p>
                  <p className="text-green-400">λ = {mtbfProbability?.toExponential(2)} per {mtbfUnit === 'hours' ? 'hour' : 'cycle'}</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Probability from Data Mode */}
        {calculationMode === 'probability' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Number of Failures
                </label>
                <input
                  type="number"
                  value={failures}
                  onChange={(e) => setFailures(e.target.value)}
                  placeholder="e.g., 2"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Total Flight Hours
                </label>
                <input
                  type="number"
                  value={totalHours}
                  onChange={(e) => setTotalHours(e.target.value)}
                  placeholder="e.g., 50000"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {calculatedProbability && (
              <div className={`p-3 rounded-lg ${
                probabilityMeetsTarget
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-start gap-2">
                  {probabilityMeetsTarget ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                  <div>
                    <p className={`text-sm font-medium ${probabilityMeetsTarget ? 'text-green-700' : 'text-red-700'}`}>
                      {probabilityMeetsTarget ? 'Meets Target' : 'Does Not Meet Target'}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Observed failure rate: {calculatedProbability.toExponential(2)} per hour
                    </p>
                    <p className="text-xs text-gray-600">
                      Target: {targetProbability?.toExponential(2)} per hour
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-3 bg-gray-900 text-gray-100 rounded-lg font-mono text-sm">
              <p className="text-purple-400">// Failure Rate from Service Data</p>
              <p className="text-gray-300">P = Failures / Total Hours</p>
              {failures && totalHours && (
                <>
                  <p className="text-gray-300">P = {failures} / {totalHours}</p>
                  <p className="text-green-400">P = {calculatedProbability?.toExponential(2)} per hour</p>
                </>
              )}
            </div>

            <InlineHelpTip
              type="info"
              message="Service experience data requires statistical confidence analysis. Consider using Chi-squared methods for small sample sizes."
              dismissible
            />
          </div>
        )}

        {/* AI Verification */}
        {onAIVerify && (calculationMode === 'mtbf' || calculationMode === 'probability') && (
          <div className="pt-3 border-t border-gray-200">
            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Verify with AI
                </>
              )}
            </button>

            {verificationResult && (
              <div className={`mt-3 p-3 rounded-lg ${
                verificationResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
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
            )}
          </div>
        )}
      </div>

      {/* Help Section */}
      {showHelp && (
        <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
          <button
            onClick={() => setShowDetailedHelp(!showDetailedHelp)}
            className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Understanding reliability targets</span>
            {showDetailedHelp ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showDetailedHelp && (
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <p className="font-medium">What does 10^-5 mean?</p>
                <p className="text-gray-600">
                  A probability of 10^-5 means 1 in 100,000. So for every 100,000 flight hours,
                  you can expect no more than 1 failure of this type.
                </p>
              </div>

              <div>
                <p className="font-medium">How do I demonstrate compliance?</p>
                <ul className="list-disc ml-4 text-gray-600 space-y-1">
                  <li><strong>Analysis:</strong> Use Fault Tree Analysis (FTA) or FMEA with component reliability data</li>
                  <li><strong>Test:</strong> Conduct reliability testing with statistical analysis</li>
                  <li><strong>Service Experience:</strong> Use fleet data with sufficient flight hours</li>
                </ul>
              </div>

              <div>
                <p className="font-medium">What about combined failures?</p>
                <p className="text-gray-600">
                  For independent failures in series: P_combined = P1 + P2 + ... <br/>
                  For independent failures in parallel (redundancy): P_combined = P1 × P2 × ...
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// Reliability Matrix Display
// ============================================

export function ReliabilityTargetMatrix({
  highlightCategory = null,
  highlightSeverity = null,
  className = ''
}) {
  const categories = ['low', 'medium', 'high']
  const severities = ['catastrophic', 'hazardous', 'major', 'minor']

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      <div className="p-3 bg-gray-50 border-b border-gray-200">
        <h4 className="text-sm font-medium text-gray-900">CAR 922.07 Reliability Targets</h4>
        <p className="text-xs text-gray-500">Maximum allowable probability per flight hour</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Severity</th>
              {categories.map(cat => (
                <th
                  key={cat}
                  className={`px-3 py-2 text-center text-xs font-medium ${
                    highlightCategory === cat ? 'bg-purple-100 text-purple-700' : 'text-gray-500'
                  }`}
                >
                  {KINETIC_ENERGY_CATEGORIES[cat].label} KE
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {severities.map(severity => (
              <tr
                key={severity}
                className={highlightSeverity === severity ? 'bg-purple-50' : ''}
              >
                <td className={`px-3 py-2 font-medium ${
                  highlightSeverity === severity ? 'text-purple-700' : 'text-gray-900'
                }`}>
                  {SEVERITY_CLASSIFICATIONS[severity].label}
                </td>
                {categories.map(cat => {
                  const target = getReliabilityTarget(cat, severity)
                  const isHighlighted = highlightCategory === cat && highlightSeverity === severity
                  return (
                    <td
                      key={cat}
                      className={`px-3 py-2 text-center font-mono text-xs ${
                        isHighlighted
                          ? 'bg-purple-200 text-purple-900 font-bold'
                          : highlightCategory === cat || highlightSeverity === severity
                            ? 'bg-purple-50 text-purple-700'
                            : 'text-gray-700'
                      }`}
                    >
                      10<sup>{Math.log10(target)}</sup>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============================================
// MTBF Comparison Tool
// ============================================

export function MTBFComparisonTool({
  components = [],
  keCategory = 'medium',
  className = ''
}) {
  const [selectedSeverity, setSelectedSeverity] = useState('catastrophic')

  const targetProbability = getReliabilityTarget(keCategory, selectedSeverity)
  const requiredMTBF = 1 / targetProbability

  const componentResults = useMemo(() => {
    return components.map(comp => {
      const failureRate = 1 / comp.mtbf
      const meetsTarget = failureRate <= targetProbability
      const marginPercent = ((requiredMTBF - comp.mtbf) / requiredMTBF) * -100

      return {
        ...comp,
        failureRate,
        meetsTarget,
        marginPercent
      }
    })
  }, [components, targetProbability, requiredMTBF])

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="p-3 border-b border-gray-200">
        <h4 className="text-sm font-medium text-gray-900">Component MTBF Comparison</h4>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-gray-500">For:</span>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1"
          >
            {Object.entries(SEVERITY_CLASSIFICATIONS).map(([key, info]) => (
              <option key={key} value={key}>{info.label}</option>
            ))}
          </select>
          <span className="text-xs text-gray-500">
            (Target: {requiredMTBF.toLocaleString()} hrs)
          </span>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {componentResults.map((comp, i) => (
          <div key={i} className="p-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{comp.name}</p>
              <p className="text-xs text-gray-500">MTBF: {comp.mtbf.toLocaleString()} hrs</p>
            </div>
            <div className="flex items-center gap-2">
              {comp.meetsTarget ? (
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  +{Math.abs(comp.marginPercent).toFixed(0)}% margin
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  {comp.marginPercent.toFixed(0)}% short
                </span>
              )}
            </div>
          </div>
        ))}

        {components.length === 0 && (
          <div className="p-6 text-center text-gray-500 text-sm">
            No components to compare
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// Export All
// ============================================

export default ReliabilityCalculator
