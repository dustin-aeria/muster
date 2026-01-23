/**
 * CORDashboard.jsx
 * Comprehensive COR (Certificate of Recognition) Program Dashboard
 * Aggregates metrics from all safety modules to show overall COR readiness
 */

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import {
  Award,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  GraduationCap,
  ClipboardCheck,
  FileCheck,
  UserCheck,
  RefreshCw,
  ChevronRight,
  Calendar,
  Target,
  BarChart3
} from 'lucide-react'

// Import metrics functions from various modules
import { calculateJHSCMetrics } from '../lib/firestoreJHSC'
import { getTrainingSummary, getCORTrainingMetrics } from '../lib/firestoreTraining'
import { calculateCORInspectionMetrics, getInspectionSummary } from '../lib/firestoreInspections'
import { calculateCORReadiness, getAuditCycleStatus, getCertificates, getAudits } from '../lib/firestoreCORAudit'

// COR Elements mapping
const COR_ELEMENTS = [
  { id: 1, name: 'Management Leadership & Commitment', icon: Shield, weight: { min: 10, max: 15 } },
  { id: 2, name: 'Safe Work Procedures', icon: FileCheck, weight: { min: 10, max: 15 } },
  { id: 3, name: 'Training & Competency', icon: GraduationCap, weight: { min: 10, max: 15 }, link: '/training' },
  { id: 4, name: 'Hazard Identification & Control', icon: AlertTriangle, weight: { min: 10, max: 15 }, link: '/hazards' },
  { id: 5, name: 'Workplace Inspections', icon: ClipboardCheck, weight: { min: 10, max: 15 }, link: '/inspections' },
  { id: 6, name: 'Accident & Incident Investigation', icon: Target, weight: { min: 10, max: 15 }, link: '/incidents' },
  { id: 7, name: 'Program Administration', icon: BarChart3, weight: { min: 10, max: 15 } },
  { id: 8, name: 'Joint Health & Safety Committee', icon: UserCheck, weight: { min: 10, max: 15 }, link: '/jhsc' }
]

export default function CORDashboard() {
  const { user, userProfile } = useAuth()
  const operatorId = userProfile?.operatorId || user?.uid

  // Data state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [overallReadiness, setOverallReadiness] = useState(null)
  const [elementScores, setElementScores] = useState({})
  const [certificates, setCertificates] = useState([])
  const [auditSummary, setAuditSummary] = useState(null)
  const [trainingSummary, setTrainingSummary] = useState(null)
  const [inspectionSummary, setInspectionSummary] = useState(null)
  const [recommendations, setRecommendations] = useState([])

  useEffect(() => {
    if (operatorId) {
      loadDashboardData()
    } else {
      setLoading(false)
    }
  }, [operatorId])

  const loadDashboardData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch data from all modules in parallel
      const [
        jhscMetrics,
        trainingMetrics,
        inspectionMetrics,
        corReadiness,
        certs,
        audits,
        training,
        inspections
      ] = await Promise.all([
        calculateJHSCMetrics(operatorId).catch(() => null),
        getCORTrainingMetrics(operatorId).catch(() => null),
        calculateCORInspectionMetrics(operatorId).catch(() => null),
        calculateCORReadiness(operatorId).catch(() => ({ score: 0, elementScores: {} })),
        getCertificates(operatorId).catch(() => []),
        getAudits(operatorId, { status: 'scheduled' }).catch(() => []),
        getTrainingSummary(operatorId).catch(() => null),
        getInspectionSummary(operatorId).catch(() => null)
      ])

      // Calculate element scores from various sources
      const scores = {
        1: corReadiness?.elementScores?.element1 || 0, // Management Leadership
        2: corReadiness?.elementScores?.element2 || 0, // Safe Work Procedures
        3: trainingMetrics?.totalScore || 0, // Training
        4: corReadiness?.elementScores?.element4 || 0, // Hazard ID
        5: inspectionMetrics?.totalScore || 0, // Inspections
        6: corReadiness?.elementScores?.element6 || 0, // Accident Investigation
        7: corReadiness?.elementScores?.element7 || 0, // Program Admin
        8: jhscMetrics?.totalScore || 0 // JHSC
      }
      setElementScores(scores)

      // Build audit summary from scheduled audits
      const scheduledAudits = audits || []
      const nextScheduled = scheduledAudits.length > 0 ? scheduledAudits[0] : null
      setAuditSummary({ nextScheduled, totalScheduled: scheduledAudits.length })

      // Calculate overall readiness
      const elementValues = Object.values(scores)
      const avgScore = elementValues.length > 0
        ? Math.round(elementValues.reduce((a, b) => a + b, 0) / elementValues.length)
        : 0
      setOverallReadiness(avgScore)

      // Compile recommendations from all modules
      const allRecs = []
      if (jhscMetrics?.recommendations) {
        allRecs.push(...jhscMetrics.recommendations.map(r => ({ ...r, module: 'JHSC' })))
      }
      if (trainingMetrics?.recommendations) {
        allRecs.push(...trainingMetrics.recommendations.map(r => ({ ...r, module: 'Training' })))
      }
      if (inspectionMetrics?.recommendations) {
        allRecs.push(...inspectionMetrics.recommendations.map(r => ({ ...r, module: 'Inspections' })))
      }

      // Sort recommendations by priority
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      allRecs.sort((a, b) => (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3))

      setRecommendations(allRecs.slice(0, 10)) // Top 10 recommendations
      setCertificates(certs)
      setTrainingSummary(training)
      setInspectionSummary(inspections)
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = timestamp?.toDate?.() || new Date(timestamp)
    return date.toLocaleDateString('en-CA')
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 50) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  // Get active certificate
  const activeCert = certificates.find(c => c.calculatedStatus === 'active')
  const expiringCert = certificates.find(c => c.calculatedStatus === 'expiring')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-aeria-blue animate-spin" />
      </div>
    )
  }

  if (!operatorId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-gray-500">
          <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No operator profile found.</p>
          <p className="text-sm mt-2">Please contact your administrator.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-7 h-7 text-aeria-blue" />
            Safety Program Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Safety Management System Overview</p>
        </div>
        <button
          onClick={loadDashboardData}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
      )}

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Readiness */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Safety Readiness</span>
            <TrendingUp className={`w-5 h-5 ${getScoreColor(overallReadiness)}`} />
          </div>
          <div className="flex items-end gap-2">
            <span className={`text-4xl font-bold ${getScoreColor(overallReadiness)}`}>
              {overallReadiness}%
            </span>
            <span className="text-sm text-gray-500 mb-1">
              {overallReadiness >= 80 ? 'Audit Ready' : overallReadiness >= 50 ? 'Needs Work' : 'At Risk'}
            </span>
          </div>
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                overallReadiness >= 80 ? 'bg-green-500' :
                overallReadiness >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${overallReadiness}%` }}
            />
          </div>
        </div>

        {/* Certificate Status */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Certificate Status</span>
            <Award className={`w-5 h-5 ${activeCert ? 'text-green-500' : 'text-gray-400'}`} />
          </div>
          {activeCert || expiringCert ? (
            <div>
              <p className={`text-lg font-bold ${activeCert ? 'text-green-600' : 'text-yellow-600'}`}>
                {activeCert ? 'Active' : 'Expiring Soon'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {(activeCert || expiringCert).certificateNumber}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Expires: {formatDate((activeCert || expiringCert).expiryDate)}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-bold text-gray-400">No Certificate</p>
              <p className="text-sm text-gray-500 mt-1">Complete certification audit</p>
            </div>
          )}
        </div>

        {/* Next Audit */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Next Audit</span>
            <Calendar className="w-5 h-5 text-aeria-blue" />
          </div>
          {auditSummary?.nextScheduled ? (
            <div>
              <p className="text-lg font-bold text-gray-900">
                {formatDate(auditSummary.nextScheduled.scheduledDate)}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {auditSummary.nextScheduled.auditType}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-bold text-gray-400">Not Scheduled</p>
              <Link to="/cor-audit" className="text-sm text-aeria-blue hover:underline">
                Schedule an audit
              </Link>
            </div>
          )}
        </div>

        {/* Action Items */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Action Items</span>
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Training Expiring</span>
              <span className={`font-bold ${(trainingSummary?.expiringSoon || 0) > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                {trainingSummary?.expiringSoon || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Open Findings</span>
              <span className={`font-bold ${(inspectionSummary?.openFindings || 0) > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                {inspectionSummary?.openFindings || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Overdue Inspections</span>
              <span className={`font-bold ${(inspectionSummary?.overdue || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {inspectionSummary?.overdue || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Elements Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Safety Elements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {COR_ELEMENTS.map(element => {
            const score = elementScores[element.id] || 0
            const Icon = element.icon
            return (
              <div
                key={element.id}
                className={`p-4 rounded-lg border ${getScoreBg(score)} border-gray-100`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${getScoreColor(score)}`} />
                    <span className="text-sm font-medium text-gray-900">Element {element.id}</span>
                  </div>
                  <span className={`text-lg font-bold ${getScoreColor(score)}`}>
                    {score}%
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-2 line-clamp-2">{element.name}</p>
                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                {element.link && (
                  <Link
                    to={element.link}
                    className="flex items-center gap-1 text-xs text-aeria-blue mt-2 hover:underline"
                  >
                    Manage <ChevronRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Audit Requirement:</strong> Minimum 80% overall score with no element below 50% to pass audit.
            Verification methods: Documentation (10-50%), Interviews (10-50%), Observation (10-50%).
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommendations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Priority Actions</h2>
          {recommendations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-400" />
              <p>No critical actions needed</p>
              <p className="text-sm mt-1">Your safety program is in good shape!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${
                    rec.priority === 'critical' ? 'bg-red-50 border-red-200' :
                    rec.priority === 'high' ? 'bg-orange-50 border-orange-200' :
                    rec.priority === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                      rec.priority === 'critical' ? 'bg-red-100 text-red-700' :
                      rec.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {rec.priority}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{rec.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {rec.module} • {rec.area}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/cor-audit"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Award className="w-8 h-8 text-aeria-blue" />
              <div>
                <p className="font-medium text-gray-900">Safety Audits</p>
                <p className="text-xs text-gray-500">Manage audit cycle</p>
              </div>
            </Link>

            <Link
              to="/jhsc"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <UserCheck className="w-8 h-8 text-aeria-blue" />
              <div>
                <p className="font-medium text-gray-900">JHSC</p>
                <p className="text-xs text-gray-500">Committee management</p>
              </div>
            </Link>

            <Link
              to="/training"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <GraduationCap className="w-8 h-8 text-aeria-blue" />
              <div>
                <p className="font-medium text-gray-900">Training</p>
                <p className="text-xs text-gray-500">Records & compliance</p>
              </div>
            </Link>

            <Link
              to="/inspections"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ClipboardCheck className="w-8 h-8 text-aeria-blue" />
              <div>
                <p className="font-medium text-gray-900">Inspections</p>
                <p className="text-xs text-gray-500">Checklists & findings</p>
              </div>
            </Link>

            <Link
              to="/incidents"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <AlertTriangle className="w-8 h-8 text-aeria-blue" />
              <div>
                <p className="font-medium text-gray-900">Incidents</p>
                <p className="text-xs text-gray-500">Investigation & reporting</p>
              </div>
            </Link>

            <Link
              to="/hazards"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <FileCheck className="w-8 h-8 text-aeria-blue" />
              <div>
                <p className="font-medium text-gray-900">Hazard Library</p>
                <p className="text-xs text-gray-500">Risk assessments</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* COR Program Info */}
      <div className="bg-gradient-to-r from-aeria-navy to-aeria-blue rounded-xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">About COR Certification</h2>
            <p className="mt-2 text-blue-100 max-w-2xl">
              The Certificate of Recognition (COR) is awarded to employers who develop health and safety
              management systems that meet established standards. COR certification demonstrates your
              commitment to workplace safety and qualifies you for WorkSafeBC premium rebates.
            </p>
            <div className="mt-4 flex items-center gap-6">
              <div>
                <p className="text-2xl font-bold">10%</p>
                <p className="text-sm text-blue-200">OHS Rebate</p>
              </div>
              <div>
                <p className="text-2xl font-bold">5%</p>
                <p className="text-sm text-blue-200">RTW Rebate</p>
              </div>
              <div>
                <p className="text-2xl font-bold">3 Years</p>
                <p className="text-sm text-blue-200">Certificate Validity</p>
              </div>
            </div>
          </div>
          <Award className="w-24 h-24 text-white/20" />
        </div>
      </div>
    </div>
  )
}
