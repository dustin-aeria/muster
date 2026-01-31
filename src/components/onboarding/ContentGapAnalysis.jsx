/**
 * ContentGapAnalysis.jsx
 * Analyzes user's content and identifies gaps/missing items
 *
 * Checks for:
 * - Missing essential policies
 * - Incomplete safety documentation
 * - Training gaps
 * - Expired certifications
 * - Missing emergency procedures
 *
 * @location src/components/onboarding/ContentGapAnalysis.jsx
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  FileText,
  Shield,
  GraduationCap,
  AlertCircle,
  ShieldAlert,
  Loader2,
  RefreshCw,
  Target,
  TrendingUp
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useOrganization } from '../../hooks/useOrganization'
import { getPoliciesEnhanced } from '../../lib/firestorePolicies'
import { getPublishedMasterPolicies } from '../../lib/firestoreMasterPolicies'
import { getAllTrainingRecords, getCourses } from '../../lib/firestoreTraining'
import { getOperators } from '../../lib/firestore'
import { logger } from '../../lib/logger'

// Essential policies that every operator should have
const ESSENTIAL_POLICIES = [
  { number: '1001', name: 'RPAS Operations Policy', category: 'rpas' },
  { number: '1002', name: 'Flight Operations Standards', category: 'rpas' },
  { number: '1003', name: 'Maintenance Policy', category: 'rpas' },
  { number: '1004', name: 'Training Policy', category: 'rpas' },
  { number: '2001', name: 'Crew Resource Management', category: 'crm' },
  { number: '2002', name: 'Fatigue Management', category: 'crm' },
  { number: '3001', name: 'Health and Safety Policy', category: 'hse' },
  { number: '3002', name: 'Emergency Response Plan', category: 'hse' },
  { number: '3003', name: 'Incident Reporting Policy', category: 'hse' },
]

// Essential training courses
const ESSENTIAL_TRAINING = [
  { code: 'TC-RPAS-BASIC', name: 'Basic RPAS Operations', category: 'regulatory' },
  { code: 'TC-RPAS-ADV', name: 'Advanced RPAS Operations', category: 'regulatory' },
  { code: 'FIRST-AID', name: 'First Aid', category: 'safety' },
  { code: 'EMERGENCY', name: 'Emergency Response', category: 'safety' },
]

export default function ContentGapAnalysis() {
  const { user } = useAuth()
  const { organizationId } = useOrganization()
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [gaps, setGaps] = useState({
    policies: [],
    training: [],
    certifications: [],
    procedures: []
  })
  const [score, setScore] = useState(0)

  useEffect(() => {
    if (user) {
      analyzeGaps()
    }
  }, [user])

  const analyzeGaps = async () => {
    setAnalyzing(true)
    try {
      const [policies, masterPolicies, operators, trainingRecords, courses] = await Promise.all([
        getPoliciesEnhanced().catch(() => []),
        getPublishedMasterPolicies().catch(() => []),
        organizationId ? getOperators(organizationId).catch(() => []) : Promise.resolve([]),
        getAllTrainingRecords().catch(() => []),
        getCourses().catch(() => [])
      ])

      const policyNumbers = new Set(policies.map(p => p.number))
      const coursesCodes = new Set(courses.map(c => c.courseCode))

      // Find missing essential policies
      const missingPolicies = ESSENTIAL_POLICIES.filter(ep => !policyNumbers.has(ep.number))

      // Find available master policies not yet imported
      const availableMasterPolicies = masterPolicies.filter(mp => !policyNumbers.has(mp.number))

      // Find missing essential training courses
      const missingTraining = ESSENTIAL_TRAINING.filter(et => !coursesCodes.has(et.code))

      // Find expired certifications
      const now = new Date()
      const expiredCerts = []
      const expiringCerts = []

      operators.forEach(op => {
        const certs = op.certifications || []
        certs.forEach(cert => {
          if (!cert.expiryDate) return
          const expiry = new Date(cert.expiryDate)
          if (expiry < now) {
            expiredCerts.push({
              operatorName: op.name || op.displayName,
              certName: cert.name || cert.type,
              expiryDate: cert.expiryDate
            })
          } else if (expiry < new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)) {
            expiringCerts.push({
              operatorName: op.name || op.displayName,
              certName: cert.name || cert.type,
              expiryDate: cert.expiryDate
            })
          }
        })
      })

      // Calculate compliance score
      const totalItems = ESSENTIAL_POLICIES.length + ESSENTIAL_TRAINING.length + operators.length
      const missingItems = missingPolicies.length + missingTraining.length + expiredCerts.length
      const complianceScore = totalItems > 0
        ? Math.round(((totalItems - missingItems) / totalItems) * 100)
        : 100

      setGaps({
        policies: missingPolicies,
        availablePolicies: availableMasterPolicies.slice(0, 10), // Show up to 10
        training: missingTraining,
        certifications: { expired: expiredCerts, expiring: expiringCerts },
        procedures: [] // Could add procedure gap analysis later
      })

      setScore(complianceScore)
    } catch (err) {
      logger.error('Gap analysis failed:', err)
    } finally {
      setLoading(false)
      setAnalyzing(false)
    }
  }

  const getScoreColor = (s) => {
    if (s >= 90) return 'text-green-600'
    if (s >= 70) return 'text-yellow-600'
    if (s >= 50) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (s) => {
    if (s >= 90) return 'bg-green-100'
    if (s >= 70) return 'bg-yellow-100'
    if (s >= 50) return 'bg-orange-100'
    return 'bg-red-100'
  }

  const totalGaps = gaps.policies.length +
    gaps.training.length +
    (gaps.certifications.expired?.length || 0)

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-aeria-navy animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${getScoreBgColor(score)}`}>
            <Target className={`w-5 h-5 ${getScoreColor(score)}`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Content Gap Analysis</h3>
            <p className="text-sm text-gray-500">
              {totalGaps === 0 ? 'All essential content in place' : `${totalGaps} gaps identified`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-gray-500">Compliance</p>
            <p className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}%</p>
          </div>
          <button
            onClick={analyzeGaps}
            disabled={analyzing}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Re-analyze"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${analyzing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Gap sections */}
      <div className="divide-y divide-gray-100">
        {/* Missing Policies */}
        {gaps.policies.length > 0 && (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-red-500" />
              <h4 className="font-medium text-gray-900">Missing Essential Policies</h4>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                {gaps.policies.length}
              </span>
            </div>
            <div className="space-y-2">
              {gaps.policies.map(policy => (
                <div
                  key={policy.number}
                  className="flex items-center justify-between p-2 bg-red-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-900">{policy.name}</span>
                    <span className="text-xs text-gray-500">#{policy.number}</span>
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/policies"
              className="mt-3 inline-flex items-center gap-1 text-sm text-aeria-blue hover:text-aeria-navy"
            >
              Go to Policy Library
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Available Policies to Import */}
        {gaps.availablePolicies?.length > 0 && (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <h4 className="font-medium text-gray-900">Recommended Policies</h4>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {gaps.availablePolicies.length}+ available
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              These policies are available in the master library and may be useful for your operations.
            </p>
            <div className="flex flex-wrap gap-2">
              {gaps.availablePolicies.slice(0, 5).map(policy => (
                <span
                  key={policy.id}
                  className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                >
                  {policy.title}
                </span>
              ))}
              {gaps.availablePolicies.length > 5 && (
                <span className="text-xs text-gray-500">
                  +{gaps.availablePolicies.length - 5} more
                </span>
              )}
            </div>
            <Link
              to="/policies"
              className="mt-3 inline-flex items-center gap-1 text-sm text-aeria-blue hover:text-aeria-navy"
            >
              Browse Policy Library
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Missing Training */}
        {gaps.training.length > 0 && (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="w-4 h-4 text-orange-500" />
              <h4 className="font-medium text-gray-900">Missing Training Courses</h4>
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                {gaps.training.length}
              </span>
            </div>
            <div className="space-y-2">
              {gaps.training.map(training => (
                <div
                  key={training.code}
                  className="flex items-center justify-between p-2 bg-orange-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-gray-900">{training.name}</span>
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/training"
              className="mt-3 inline-flex items-center gap-1 text-sm text-aeria-blue hover:text-aeria-navy"
            >
              Go to Training
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Certification Issues */}
        {(gaps.certifications.expired?.length > 0 || gaps.certifications.expiring?.length > 0) && (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-yellow-500" />
              <h4 className="font-medium text-gray-900">Certification Alerts</h4>
            </div>

            {gaps.certifications.expired?.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium text-red-600 mb-2">
                  Expired ({gaps.certifications.expired.length})
                </p>
                <div className="space-y-1">
                  {gaps.certifications.expired.slice(0, 3).map((cert, i) => (
                    <div key={i} className="text-sm p-2 bg-red-50 rounded flex justify-between">
                      <span>{cert.operatorName} - {cert.certName}</span>
                      <span className="text-red-600 text-xs">{cert.expiryDate}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {gaps.certifications.expiring?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-yellow-600 mb-2">
                  Expiring Soon ({gaps.certifications.expiring.length})
                </p>
                <div className="space-y-1">
                  {gaps.certifications.expiring.slice(0, 3).map((cert, i) => (
                    <div key={i} className="text-sm p-2 bg-yellow-50 rounded flex justify-between">
                      <span>{cert.operatorName} - {cert.certName}</span>
                      <span className="text-yellow-600 text-xs">{cert.expiryDate}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Link
              to="/operators"
              className="mt-3 inline-flex items-center gap-1 text-sm text-aeria-blue hover:text-aeria-navy"
            >
              Manage Certifications
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* All Good */}
        {totalGaps === 0 && gaps.certifications.expiring?.length === 0 && (
          <div className="p-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 mb-1">Looking Good!</h4>
            <p className="text-sm text-gray-500">
              All essential policies, training, and certifications are in place.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
