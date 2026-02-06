/**
 * OSOComplianceStep.jsx
 * Step 6: OSO Compliance Matrix
 *
 * Displays all 24 Operational Safety Objectives with required robustness
 * based on SAIL level. Tracks compliance status and evidence.
 *
 * @location src/components/sora/steps/OSOComplianceStep.jsx
 */

import { useState, useMemo } from 'react'
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  Filter,
  ChevronDown,
  ChevronRight,
  FileText,
  Upload,
  Save,
  Info
} from 'lucide-react'
import { updateOSOStatus } from '../../../lib/firestoreSora'
import {
  osoDefinitions,
  osoCategories,
  robustnessLevels,
  checkOSOCompliance,
  checkAllOSOCompliance
} from '../../../lib/soraConfig'

export default function OSOComplianceStep({ assessment, osoStatuses }) {
  const [expandedOSOs, setExpandedOSOs] = useState({})
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [savingOSO, setSavingOSO] = useState(null)

  const sailLevel = assessment?.sail?.level

  // Map OSO statuses by ID for easy lookup
  const osoStatusMap = useMemo(() => {
    const map = {}
    osoStatuses.forEach(oso => {
      map[oso.osoId] = oso
    })
    return map
  }, [osoStatuses])

  // Calculate compliance for all OSOs
  const compliance = useMemo(() => {
    if (!sailLevel) return null

    const statusMap = {}
    osoStatuses.forEach(oso => {
      statusMap[oso.osoId] = { robustness: oso.robustness, evidence: oso.evidence }
    })

    return checkAllOSOCompliance(sailLevel, statusMap)
  }, [sailLevel, osoStatuses])

  // Filter OSOs
  const filteredOSOs = useMemo(() => {
    return osoDefinitions.filter(oso => {
      // Category filter
      if (categoryFilter !== 'all' && oso.category !== categoryFilter) {
        return false
      }

      // Status filter
      if (statusFilter !== 'all') {
        const osoStatus = osoStatusMap[oso.id]
        const complianceResult = compliance?.results?.find(r => r.id === oso.id)

        if (statusFilter === 'compliant' && !complianceResult?.compliant) return false
        if (statusFilter === 'non_compliant' && (complianceResult?.compliant || complianceResult?.required === 'O')) return false
        if (statusFilter === 'optional' && complianceResult?.required !== 'O') return false
      }

      return true
    })
  }, [categoryFilter, statusFilter, osoStatusMap, compliance])

  const toggleOSO = (osoId) => {
    setExpandedOSOs(prev => ({
      ...prev,
      [osoId]: !prev[osoId]
    }))
  }

  const handleUpdateOSO = async (osoDocId, field, value) => {
    setSavingOSO(osoDocId)
    try {
      await updateOSOStatus(assessment.id, osoDocId, { [field]: value })
    } catch (err) {
      console.error('Error updating OSO:', err)
    } finally {
      setSavingOSO(null)
    }
  }

  // Get required robustness display
  const getRequirementBadge = (required) => {
    switch (required) {
      case 'O':
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">Optional</span>
      case 'L':
        return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">Low</span>
      case 'M':
        return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">Medium</span>
      case 'H':
        return <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">High</span>
      default:
        return null
    }
  }

  if (!sailLevel) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">SAIL Not Yet Determined</h3>
        <p className="text-gray-500">
          Complete the SAIL determination step before reviewing OSO requirements.
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-200">
      {/* Header */}
      <div className="p-4 bg-green-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Step 6: OSO Compliance</h3>
              <p className="text-sm text-gray-600">24 Operational Safety Objectives for SAIL {sailLevel}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Summary */}
      {compliance && (
        <div className="p-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-gray-100">
              <p className="text-sm text-gray-600">Total OSOs</p>
              <p className="text-2xl font-bold text-gray-900">{compliance.summary.total}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <p className="text-sm text-green-600">Compliant</p>
              <p className="text-2xl font-bold text-green-700">{compliance.summary.compliant}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-100">
              <p className="text-sm text-red-600">Non-Compliant</p>
              <p className="text-2xl font-bold text-red-700">{compliance.summary.nonCompliant}</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-100">
              <p className="text-sm text-gray-600">Optional</p>
              <p className="text-2xl font-bold text-gray-700">{compliance.summary.optional}</p>
            </div>
          </div>

          {/* Overall Status */}
          <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
            compliance.summary.overallCompliant
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {compliance.summary.overallCompliant ? (
              <>
                <CheckCircle className="w-5 h-5" />
                <p className="font-medium">All required OSOs are compliant</p>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5" />
                <p className="font-medium">
                  {compliance.summary.nonCompliant} OSO(s) require attention
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="p-4 bg-gray-50">
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Categories</option>
              {Object.entries(osoCategories).map(([key, cat]) => (
                <option key={key} value={key}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Statuses</option>
              <option value="compliant">Compliant</option>
              <option value="non_compliant">Non-Compliant</option>
              <option value="optional">Optional</option>
            </select>
          </div>
        </div>
      </div>

      {/* OSO List by Category */}
      {Object.entries(osoCategories).map(([catKey, category]) => {
        const categoryOSOs = filteredOSOs.filter(oso => oso.category === catKey)
        if (categoryOSOs.length === 0) return null

        return (
          <div key={catKey} className="divide-y divide-gray-100">
            {/* Category Header */}
            <div className="px-4 py-2 bg-gray-100">
              <p className="font-medium text-gray-700">{category.label}</p>
            </div>

            {/* OSOs in Category */}
            {categoryOSOs.map(oso => {
              const osoStatus = osoStatusMap[oso.id]
              const complianceResult = compliance?.results?.find(r => r.id === oso.id)
              const isExpanded = expandedOSOs[oso.id]
              const isSaving = savingOSO === osoStatus?.id

              return (
                <div key={oso.id}>
                  {/* OSO Row */}
                  <button
                    onClick={() => toggleOSO(oso.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 text-left"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Compliance Icon */}
                      <div className={`p-2 rounded-lg ${
                        complianceResult?.required === 'O'
                          ? 'bg-gray-100'
                          : complianceResult?.compliant
                          ? 'bg-green-100'
                          : 'bg-red-100'
                      }`}>
                        {complianceResult?.required === 'O' ? (
                          <Info className="w-4 h-4 text-gray-500" />
                        ) : complianceResult?.compliant ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        )}
                      </div>

                      {/* OSO Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{oso.id}</p>
                          {getRequirementBadge(complianceResult?.required)}
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            oso.responsibility === 'operator'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {oso.responsibility === 'operator' ? 'Operator' : 'Designer'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{oso.name}</p>
                      </div>
                    </div>

                    {/* Achieved Robustness */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Achieved</p>
                        <p className={`text-sm font-medium capitalize ${
                          osoStatus?.robustness === 'high' ? 'text-purple-600' :
                          osoStatus?.robustness === 'medium' ? 'text-yellow-600' :
                          osoStatus?.robustness === 'low' ? 'text-green-600' :
                          'text-gray-400'
                        }`}>
                          {osoStatus?.robustness || 'None'}
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 bg-gray-50">
                      <div className="ml-11 space-y-4">
                        <p className="text-sm text-gray-600">{oso.description}</p>

                        {/* Robustness Selection */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Achieved Robustness
                            </label>
                            <select
                              value={osoStatus?.robustness || 'none'}
                              onChange={(e) => handleUpdateOSO(osoStatus?.id, 'robustness', e.target.value)}
                              disabled={isSaving}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                            >
                              {robustnessLevels.map(level => (
                                <option key={level.value} value={level.value}>
                                  {level.label} ({level.code})
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
                              value={osoStatus?.evidence || ''}
                              onChange={(e) => handleUpdateOSO(osoStatus?.id, 'evidence', e.target.value)}
                              placeholder="Document reference..."
                              disabled={isSaving}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                            />
                          </div>
                        </div>

                        {/* Evidence Guidance */}
                        {oso.evidenceGuidance && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-xs font-medium text-blue-800 mb-2">Evidence Guidance:</p>
                            <div className="space-y-2">
                              {Object.entries(oso.evidenceGuidance).map(([level, items]) => (
                                <div key={level}>
                                  <p className="text-xs font-medium text-blue-700 capitalize">{level}:</p>
                                  <ul className="text-xs text-blue-600 list-disc list-inside">
                                    {items.map((item, i) => (
                                      <li key={i}>{item}</li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes
                          </label>
                          <textarea
                            value={osoStatus?.notes || ''}
                            onChange={(e) => handleUpdateOSO(osoStatus?.id, 'notes', e.target.value)}
                            placeholder="Additional notes..."
                            rows={2}
                            disabled={isSaving}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                          />
                        </div>

                        {/* Saving indicator */}
                        {isSaving && (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                            Saving...
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}

      {/* Footer */}
      <div className="p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {compliance?.summary.overallCompliant ? (
              <span className="text-green-600 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                All required OSOs compliant - proceed to Review
              </span>
            ) : (
              <span className="text-yellow-600 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Complete remaining OSOs to proceed
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
