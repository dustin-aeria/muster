/**
 * SAILStep.jsx
 * Step 4: SAIL Determination
 *
 * Displays calculated SAIL level from GRC and ARC
 * Shows SAIL matrix and requirements
 *
 * @location src/components/sora/steps/SAILStep.jsx
 */

import { useMemo } from 'react'
import {
  Target,
  CheckCircle,
  AlertTriangle,
  Info,
  ArrowRight,
  Shield
} from 'lucide-react'
import {
  sailMatrix,
  sailColors,
  sailDescriptions,
  arcLevels,
  getMPDRequirements
} from '../../../lib/soraConfig'

export default function SAILStep({ assessment }) {
  const { groundRisk, airRisk, sail } = assessment

  // Check if we have the data needed
  const hasData = groundRisk?.finalGRC && airRisk?.residualARC
  const sailLevel = sail?.level

  // Get MPD requirements for current SAIL
  const mpdRequirements = useMemo(() => {
    if (!sailLevel) return null
    return getMPDRequirements(sailLevel)
  }, [sailLevel])

  // Matrix highlighting
  const getMatrixCellClass = (grc, arc) => {
    const isCurrentCell = groundRisk?.finalGRC === grc && airRisk?.residualARC === arc
    const cellSail = sailMatrix[grc]?.[arc]

    if (isCurrentCell) {
      return 'ring-4 ring-blue-500 ring-offset-2 font-bold scale-110 z-10'
    }

    return sailColors[cellSail] || 'bg-gray-100'
  }

  if (!hasData) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Previous Steps</h3>
        <p className="text-gray-500">
          You need to complete Ground Risk (GRC) and Air Risk (ARC) assessments before SAIL can be determined.
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-200">
      {/* Header */}
      <div className="p-4 bg-indigo-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Target className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Step 4: SAIL Determination</h3>
            <p className="text-sm text-gray-600">Specific Assurance and Integrity Level from Table 7</p>
          </div>
        </div>
      </div>

      {/* SAIL Result Card */}
      <div className="p-6">
        <div className={`p-6 rounded-xl ${sailLevel ? sailColors[sailLevel] : 'bg-gray-100'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-75">Specific Assurance and Integrity Level</p>
              <div className="flex items-baseline gap-3 mt-1">
                <p className="text-6xl font-bold">{sailLevel || '?'}</p>
                {sailLevel && (
                  <p className="text-lg">{sailDescriptions[sailLevel]}</p>
                )}
              </div>
            </div>

            <div className="text-right space-y-2">
              <div className="flex items-center gap-2 justify-end">
                <span className="text-sm opacity-75">Final GRC:</span>
                <span className="px-3 py-1 bg-white/30 rounded-lg font-bold text-xl">
                  {groundRisk.finalGRC}
                </span>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <span className="text-sm opacity-75">Residual ARC:</span>
                <span className="px-3 py-1 bg-white/30 rounded-lg font-bold text-xl">
                  {airRisk.residualARC}
                </span>
              </div>
            </div>
          </div>

          {sailLevel && (
            <div className="mt-4 pt-4 border-t border-current/20">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <p className="font-medium">SAIL {sailLevel} determined from SORA Table 7</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SAIL Matrix */}
      <div className="p-4">
        <h4 className="font-medium text-gray-900 mb-3">SAIL Determination Matrix (Table 7)</h4>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-left text-sm text-gray-600 border border-gray-200"></th>
                {['ARC-a', 'ARC-b', 'ARC-c', 'ARC-d'].map(arc => (
                  <th
                    key={arc}
                    className={`p-2 text-center text-sm font-medium border border-gray-200 ${
                      airRisk.residualARC === arc ? 'bg-purple-100' : ''
                    }`}
                  >
                    {arc}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6, 7].map(grc => (
                <tr key={grc}>
                  <td className={`p-2 text-sm font-medium border border-gray-200 ${
                    groundRisk.finalGRC === grc ? 'bg-orange-100' : ''
                  }`}>
                    GRC {grc}
                  </td>
                  {['ARC-a', 'ARC-b', 'ARC-c', 'ARC-d'].map(arc => {
                    const cellSail = sailMatrix[grc]?.[arc]
                    const isCurrentCell = groundRisk.finalGRC === grc && airRisk.residualARC === arc

                    return (
                      <td
                        key={arc}
                        className={`p-3 text-center font-bold border border-gray-200 transition-all ${
                          isCurrentCell
                            ? `${sailColors[cellSail]} ring-4 ring-blue-500 ring-inset`
                            : sailColors[cellSail]
                        }`}
                      >
                        {cellSail}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          GRC &gt;7 requires Category C (Certified) operations outside SORA scope
        </p>
      </div>

      {/* SAIL Requirements */}
      {sailLevel && mpdRequirements && (
        <div className="p-4">
          <h4 className="font-medium text-gray-900 mb-3">SAIL {sailLevel} Requirements</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Declaration Type */}
            <div className="p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-gray-600" />
                <p className="font-medium text-gray-900">Declaration Type</p>
              </div>
              <p className="text-lg font-semibold text-gray-900 capitalize">
                {mpdRequirements.declarationType}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {mpdRequirements.description}
              </p>
            </div>

            {/* Evidence Level */}
            <div className="p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-5 h-5 text-gray-600" />
                <p className="font-medium text-gray-900">Evidence Level</p>
              </div>
              <p className="text-lg font-semibold text-gray-900 capitalize">
                {mpdRequirements.evidenceLevel}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {mpdRequirements.thirdPartyRequired
                  ? 'Third-party verification required'
                  : 'Self-declaration acceptable'}
              </p>
            </div>
          </div>

          {/* Critical OSOs */}
          {mpdRequirements.criticalOSOCount > 0 && (
            <div className="mt-4 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">
                    {mpdRequirements.criticalOSOCount} OSOs Require HIGH Robustness
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    At SAIL {sailLevel}, the following OSOs must demonstrate high robustness:
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {mpdRequirements.criticalOSOs.map(oso => (
                      <span
                        key={oso.id}
                        className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded"
                      >
                        {oso.id}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {mpdRequirements.notes && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> {mpdRequirements.notes}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Continue Button */}
      <div className="p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {sailLevel ? (
              <span className="text-green-600 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                SAIL determined - proceed to Containment
              </span>
            ) : (
              'SAIL will be calculated when GRC and ARC are complete'
            )}
          </p>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            disabled={!sailLevel}
          >
            Continue to Containment
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
