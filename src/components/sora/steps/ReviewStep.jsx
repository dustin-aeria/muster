/**
 * ReviewStep.jsx
 * Step 7: Review & Submit
 *
 * Final review of complete SORA assessment
 * Shows summary of all steps and allows submission
 *
 * @location src/components/sora/steps/ReviewStep.jsx
 */

import { useState, useMemo } from 'react'
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Download,
  Send,
  Printer,
  Target,
  Shield,
  Plane,
  MapPin,
  Users
} from 'lucide-react'
import { submitForReview, approveAssessment } from '../../../lib/firestoreSora'
import {
  populationCategories,
  uaCharacteristics,
  arcLevels,
  sailColors,
  sailDescriptions,
  groundMitigations,
  tmprDefinitions,
  containmentMethods,
  checkAllOSOCompliance
} from '../../../lib/soraConfig'
import { useAuth } from '../../../contexts/AuthContext'

export default function ReviewStep({ assessment, osoStatuses }) {
  const { user } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [approving, setApproving] = useState(false)

  const { conops, groundRisk, airRisk, sail, containment, osoSummary } = assessment

  // Calculate OSO compliance
  const compliance = useMemo(() => {
    if (!sail?.level) return null
    const statusMap = {}
    osoStatuses.forEach(oso => {
      statusMap[oso.osoId] = { robustness: oso.robustness, evidence: oso.evidence }
    })
    return checkAllOSOCompliance(sail.level, statusMap)
  }, [sail?.level, osoStatuses])

  // Check readiness
  const readiness = useMemo(() => {
    const checks = {
      conops: conops?.isComplete,
      groundRisk: groundRisk?.isComplete,
      airRisk: airRisk?.isComplete,
      sail: sail?.isComplete,
      containment: containment?.isComplete,
      oso: compliance?.summary?.overallCompliant
    }

    const complete = Object.values(checks).filter(Boolean).length
    const total = Object.keys(checks).length

    return {
      checks,
      complete,
      total,
      percentage: Math.round((complete / total) * 100),
      ready: complete === total
    }
  }, [conops, groundRisk, airRisk, sail, containment, compliance])

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await submitForReview(assessment.id)
    } catch (err) {
      console.error('Error submitting assessment:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleApprove = async () => {
    setApproving(true)
    try {
      await approveAssessment(assessment.id, {
        userId: user.uid,
        name: user.displayName || user.email
      })
    } catch (err) {
      console.error('Error approving assessment:', err)
    } finally {
      setApproving(false)
    }
  }

  return (
    <div className="divide-y divide-gray-200">
      {/* Header */}
      <div className="p-4 bg-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Step 7: Review & Submit</h3>
              <p className="text-sm text-gray-600">Review your SORA assessment before submission</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors">
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors">
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Readiness Check */}
      <div className="p-4">
        <h4 className="font-medium text-gray-900 mb-3">Assessment Readiness</h4>
        <div className="space-y-2">
          {Object.entries(readiness.checks).map(([key, complete]) => (
            <div key={key} className="flex items-center gap-3">
              {complete ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              )}
              <span className={`capitalize ${complete ? 'text-gray-900' : 'text-gray-500'}`}>
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              {complete ? (
                <span className="text-xs text-green-600">Complete</span>
              ) : (
                <span className="text-xs text-yellow-600">Incomplete</span>
              )}
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500">Overall Progress</span>
            <span className="font-medium">{readiness.percentage}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                readiness.ready ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${readiness.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* SORA Summary */}
      <div className="p-4">
        <h4 className="font-medium text-gray-900 mb-3">SORA Summary</h4>

        {/* Key Results */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* SAIL */}
          <div className={`p-4 rounded-xl text-center ${
            sail?.level ? sailColors[sail.level] : 'bg-gray-100'
          }`}>
            <p className="text-sm font-medium opacity-75">SAIL Level</p>
            <p className="text-4xl font-bold">{sail?.level || '-'}</p>
          </div>

          {/* Final GRC */}
          <div className="p-4 rounded-xl text-center bg-orange-100">
            <p className="text-sm font-medium text-orange-700">Final GRC</p>
            <p className="text-4xl font-bold text-orange-900">{groundRisk?.finalGRC || '-'}</p>
            {groundRisk?.intrinsicGRC && groundRisk?.finalGRC !== groundRisk?.intrinsicGRC && (
              <p className="text-xs text-orange-600">
                From iGRC {groundRisk.intrinsicGRC}
              </p>
            )}
          </div>

          {/* Residual ARC */}
          <div className="p-4 rounded-xl text-center bg-purple-100">
            <p className="text-sm font-medium text-purple-700">Residual ARC</p>
            <p className="text-4xl font-bold text-purple-900">
              {airRisk?.residualARC?.replace('ARC-', '') || '-'}
            </p>
          </div>

          {/* OSO Compliance */}
          <div className={`p-4 rounded-xl text-center ${
            compliance?.summary?.overallCompliant ? 'bg-green-100' : 'bg-yellow-100'
          }`}>
            <p className={`text-sm font-medium ${
              compliance?.summary?.overallCompliant ? 'text-green-700' : 'text-yellow-700'
            }`}>OSO Compliance</p>
            <p className={`text-4xl font-bold ${
              compliance?.summary?.overallCompliant ? 'text-green-900' : 'text-yellow-900'
            }`}>
              {compliance?.summary?.compliant || 0}/{compliance?.summary?.total || 24}
            </p>
          </div>
        </div>

        {/* ConOps Summary */}
        <div className="mb-4 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-gray-600" />
            <h5 className="font-medium text-gray-900">Concept of Operations</h5>
          </div>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="text-gray-500">Purpose</dt>
              <dd className="text-gray-900 truncate">
                {conops?.operationDescription?.purpose || 'Not specified'}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">UAS</dt>
              <dd className="text-gray-900">
                {conops?.uasDescription?.manufacturer} {conops?.uasDescription?.model || 'Not specified'}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">MTOW</dt>
              <dd className="text-gray-900">{conops?.uasDescription?.mtow || '-'} kg</dd>
            </div>
            <div>
              <dt className="text-gray-500">Max Altitude</dt>
              <dd className="text-gray-900">{conops?.operatingEnvironment?.maxAltitudeAGL || '-'} ft AGL</dd>
            </div>
          </dl>
        </div>

        {/* Ground Risk Summary */}
        <div className="mb-4 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-orange-600" />
            <h5 className="font-medium text-gray-900">Ground Risk Assessment</h5>
          </div>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="text-gray-500">Population Category</dt>
              <dd className="text-gray-900">
                {populationCategories[groundRisk?.populationCategory]?.label || 'Not specified'}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">UA Characteristic</dt>
              <dd className="text-gray-900">
                {uaCharacteristics[groundRisk?.uaCharacteristic]?.label || 'Not specified'}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Intrinsic GRC</dt>
              <dd className="text-gray-900">{groundRisk?.intrinsicGRC || '-'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Mitigations Applied</dt>
              <dd className="text-gray-900">
                {Object.entries(groundRisk?.mitigations || {})
                  .filter(([_, m]) => m.enabled)
                  .map(([k]) => k)
                  .join(', ') || 'None'}
              </dd>
            </div>
          </dl>
        </div>

        {/* Air Risk Summary */}
        <div className="mb-4 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Plane className="w-4 h-4 text-purple-600" />
            <h5 className="font-medium text-gray-900">Air Risk Assessment</h5>
          </div>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="text-gray-500">Initial ARC</dt>
              <dd className="text-gray-900">{airRisk?.initialARC || 'Not specified'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">TMPR</dt>
              <dd className="text-gray-900">
                {airRisk?.tmpr?.enabled
                  ? `${airRisk.tmpr.type} (${airRisk.tmpr.robustness})`
                  : 'None applied'}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Airspace</dt>
              <dd className="text-gray-900">{airRisk?.airspaceType || 'Not specified'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Residual ARC</dt>
              <dd className="text-gray-900 font-medium">{airRisk?.residualARC || '-'}</dd>
            </div>
          </dl>
        </div>

        {/* Containment Summary */}
        <div className="p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-teal-600" />
            <h5 className="font-medium text-gray-900">Containment</h5>
          </div>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="text-gray-500">Adjacent Area Population</dt>
              <dd className="text-gray-900">
                {populationCategories[containment?.adjacentPopulation]?.label || 'Not specified'}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Method</dt>
              <dd className="text-gray-900">
                {containmentMethods[containment?.method]?.label || 'Not specified'}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Required Robustness</dt>
              <dd className="text-gray-900 capitalize">{containment?.requiredRobustness || '-'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Achieved Robustness</dt>
              <dd className="text-gray-900 capitalize">{containment?.achievedRobustness || '-'}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Submit Section */}
      <div className="p-4 bg-gray-50">
        {assessment.status === 'approved' ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <p className="font-medium">Assessment Approved</p>
            {assessment.finalAssessment?.approvedAt && (
              <span className="text-sm text-gray-500">
                on {new Date(assessment.finalAssessment.approvedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        ) : assessment.status === 'ready_for_review' ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Assessment submitted for review. Awaiting approval.
            </p>
            <button
              onClick={handleApprove}
              disabled={approving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {approving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Approve Assessment
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              {readiness.ready ? (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Assessment complete and ready for submission
                </p>
              ) : (
                <p className="text-sm text-yellow-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  Complete all sections before submitting
                </p>
              )}
            </div>
            <button
              onClick={handleSubmit}
              disabled={!readiness.ready || submitting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit for Review
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
