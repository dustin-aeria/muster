/**
 * SafetyDeclarationDetail.jsx
 * Detailed view and management of a Safety Assurance Declaration
 *
 * Phase 1: Placeholder - Full implementation in Phase 2-6
 *
 * @location src/pages/SafetyDeclarationDetail.jsx
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useOrganization } from '../hooks/useOrganization'
import {
  FileCheck,
  ArrowLeft,
  Plane,
  ClipboardList,
  TestTube,
  FileText,
  Settings,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronRight,
  Play,
  Pause
} from 'lucide-react'
import {
  subscribeToSafetyDeclaration,
  subscribeToDeclarationRequirements,
  subscribeToTestingSessions,
  getDeclarationStats,
  DECLARATION_STATUSES,
  DECLARATION_TYPES,
  RPAS_CATEGORIES,
  KINETIC_ENERGY_CATEGORIES
} from '../lib/firestoreSafetyDeclaration'

export default function SafetyDeclarationDetail() {
  const { declarationId } = useParams()
  const navigate = useNavigate()
  const { organization } = useOrganization()

  const [declaration, setDeclaration] = useState(null)
  const [requirements, setRequirements] = useState([])
  const [sessions, setSessions] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // Subscribe to declaration data
  useEffect(() => {
    if (!declarationId) return

    const unsubDeclaration = subscribeToSafetyDeclaration(declarationId, (data) => {
      setDeclaration(data)
      setLoading(false)
    })

    const unsubRequirements = subscribeToDeclarationRequirements(declarationId, (data) => {
      setRequirements(data)
    })

    const unsubSessions = subscribeToTestingSessions(declarationId, (data) => {
      setSessions(data)
    })

    // Load stats
    getDeclarationStats(declarationId).then(setStats)

    return () => {
      unsubDeclaration()
      unsubRequirements()
      unsubSessions()
    }
  }, [declarationId])

  // Refresh stats when requirements or sessions change
  useEffect(() => {
    if (declarationId && (requirements.length > 0 || sessions.length > 0)) {
      getDeclarationStats(declarationId).then(setStats)
    }
  }, [declarationId, requirements, sessions])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!declaration) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-lg font-medium text-gray-900">Declaration Not Found</h2>
        <p className="text-gray-500 mt-2">The requested declaration could not be found.</p>
        <Link
          to="/safety-declarations"
          className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Declarations
        </Link>
      </div>
    )
  }

  const statusInfo = DECLARATION_STATUSES[declaration.status] || DECLARATION_STATUSES.draft
  const typeInfo = DECLARATION_TYPES[declaration.declarationType] || DECLARATION_TYPES.declaration
  const categoryInfo = RPAS_CATEGORIES[declaration.rpasDetails?.category] || RPAS_CATEGORIES.small
  const keCategory = KINETIC_ENERGY_CATEGORIES[declaration.rpasDetails?.kineticEnergyCategory] || KINETIC_ENERGY_CATEGORIES.low

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileCheck },
    { id: 'requirements', label: 'Requirements', icon: ClipboardList, count: requirements.length },
    { id: 'testing', label: 'Testing', icon: TestTube, count: sessions.length },
    { id: 'evidence', label: 'Evidence', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  // Group requirements by section
  const requirementsBySection = requirements.reduce((acc, req) => {
    if (!acc[req.sectionId]) {
      acc[req.sectionId] = {
        sectionId: req.sectionId,
        sectionTitle: req.sectionTitle,
        requirements: []
      }
    }
    acc[req.sectionId].requirements.push(req)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link
            to="/safety-declarations"
            className="mt-1 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{declaration.name}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {typeInfo.label} &bull; {declaration.rpasDetails?.manufacturer} {declaration.rpasDetails?.model}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* TODO: Add action buttons in later phases */}
        </div>
      </div>

      {/* Progress Overview */}
      {stats && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Progress</h2>
            <span className="text-2xl font-bold text-blue-600">
              {stats.requirements.completionPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${stats.requirements.completionPercentage}%` }}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.requirements.completed}</p>
              <p className="text-sm text-gray-500">Requirements Complete</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.requirements.inProgress}</p>
              <p className="text-sm text-gray-500">In Progress</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.testing.completedSessions}</p>
              <p className="text-sm text-gray-500">Tests Complete</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.evidence.total}</p>
              <p className="text-sm text-gray-500">Evidence Items</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200">
        {activeTab === 'overview' && (
          <div className="p-6 space-y-6">
            {/* RPAS Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Plane className="w-5 h-5 text-gray-400" />
                RPAS System Details
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Manufacturer</p>
                  <p className="font-medium">{declaration.rpasDetails?.manufacturer || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Model</p>
                  <p className="font-medium">{declaration.rpasDetails?.model || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Serial Number</p>
                  <p className="font-medium">{declaration.rpasDetails?.serialNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Weight</p>
                  <p className="font-medium">{declaration.rpasDetails?.weightKg || '-'} kg</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium">{categoryInfo.label}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Max Kinetic Energy</p>
                  <p className="font-medium">{declaration.rpasDetails?.maxKineticEnergy || '-'} J</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">KE Category</p>
                  <p className="font-medium">{keCategory.label}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Robustness Level</p>
                  <p className="font-medium capitalize">{declaration.robustnessLevel || 'Low'}</p>
                </div>
              </div>
            </div>

            {/* Operation Types */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Operation Types</h3>
              {declaration.operationTypes?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {declaration.operationTypes.map((opType) => (
                    <span
                      key={opType}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700"
                    >
                      {opType.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No operation types selected</p>
              )}
            </div>

            {/* Applicable Standards */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Applicable Standards</h3>
              {declaration.applicableStandards?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {declaration.applicableStandards.map((std) => (
                    <span
                      key={std}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                    >
                      CAR {std}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No standards selected</p>
              )}
            </div>

            {/* Declarant Info */}
            {declaration.declarantInfo && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Declarant Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{declaration.declarantInfo.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Organization</p>
                    <p className="font-medium">{declaration.declarantInfo.organization || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{declaration.declarantInfo.email || '-'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'requirements' && (
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Requirements ({requirements.length})
              </h3>
              <p className="text-sm text-gray-500">
                Full requirements management coming in Phase 3
              </p>
            </div>

            {Object.values(requirementsBySection).length > 0 ? (
              <div className="space-y-4">
                {Object.values(requirementsBySection).map((section) => (
                  <div key={section.sectionId} className="border border-gray-200 rounded-lg">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <h4 className="font-medium text-gray-900">
                        CAR {section.sectionId}: {section.sectionTitle}
                      </h4>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {section.requirements.map((req) => (
                        <div key={req.id} className="px-4 py-3 flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{req.text}</p>
                            <p className="text-xs text-gray-500 mt-1">{req.requirementId}</p>
                          </div>
                          <span className={`ml-4 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            req.status === 'complete' ? 'bg-green-100 text-green-800' :
                            req.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                            req.status === 'not_applicable' ? 'bg-gray-100 text-gray-500' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {req.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No requirements initialized yet.</p>
                <p className="text-sm text-gray-400 mt-1">
                  Select operation types to auto-populate applicable requirements.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'testing' && (
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Testing Sessions ({sessions.length})
              </h3>
              <button
                onClick={() => {/* TODO: Add create session modal in Phase 4 */}}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Play className="w-4 h-4" />
                New Test Session
              </button>
            </div>

            {sessions.length > 0 ? (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          session.status === 'complete' ? 'bg-green-100' :
                          session.status === 'in_progress' ? 'bg-yellow-100' :
                          session.status === 'paused' ? 'bg-orange-100' :
                          'bg-gray-100'
                        }`}>
                          {session.status === 'paused' ? (
                            <Pause className="w-5 h-5 text-orange-600" />
                          ) : session.status === 'in_progress' ? (
                            <Play className="w-5 h-5 text-yellow-600" />
                          ) : session.status === 'complete' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <Clock className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{session.name}</p>
                          <p className="text-sm text-gray-500">
                            {session.testType || 'General Test'} &bull;{' '}
                            {session.scheduledDate || session.createdAt?.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          session.status === 'complete' ? 'bg-green-100 text-green-800' :
                          session.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                          session.status === 'paused' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {session.status.replace(/_/g, ' ')}
                        </span>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No testing sessions yet.</p>
                <p className="text-sm text-gray-400 mt-1">
                  Create your first test session to start recording results.
                </p>
              </div>
            )}

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Testing Session Management</h4>
                  <p className="mt-1 text-sm text-blue-700">
                    Full testing session management with pause/resume, multi-day tracking,
                    and real-time logging coming in Phase 4.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'evidence' && (
          <div className="p-6">
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Evidence Management</h3>
              <p className="text-gray-500">
                Full evidence upload, linking, and management coming in Phase 5.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-6">
            <div className="text-center py-12">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Declaration Settings</h3>
              <p className="text-gray-500">
                Declaration settings and configuration options coming in later phases.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
