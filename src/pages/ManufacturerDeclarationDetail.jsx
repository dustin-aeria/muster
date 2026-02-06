/**
 * ManufacturerDeclarationDetail.jsx
 * Detailed view for Manufacturer Performance Declaration management
 * Includes section tracking, evidence management, software declaration
 *
 * @location src/pages/ManufacturerDeclarationDetail.jsx
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useOrganization } from '../hooks/useOrganization'
import {
  ArrowLeft,
  FileCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  Send,
  Cpu,
  Code,
  Zap,
  Calendar,
  ChevronRight,
  FileText,
  Activity,
  Edit,
  Trash2,
  Link as LinkIcon,
  Shield,
  BarChart
} from 'lucide-react'
import {
  subscribeToManufacturerDeclaration,
  subscribeToDeclarationSections,
  subscribeToMPDEvidence,
  updateManufacturerDeclaration,
  updateMPDStatus,
  deleteManufacturerDeclaration,
  getMPDStats,
  MPD_STATUSES,
  MPD_RPAS_CATEGORIES,
  SOFTWARE_DAL_LEVELS,
  DESIGN_STANDARDS,
  getKineticEnergyCategory,
  calculateOverallCompletion
} from '../lib/firestoreManufacturerDeclaration'
import MPDSectionChecklist from '../components/manufacturerDeclaration/MPDSectionChecklist'

export default function ManufacturerDeclarationDetail() {
  const { declarationId } = useParams()
  const navigate = useNavigate()
  const { organization } = useOrganization()

  const [declaration, setDeclaration] = useState(null)
  const [sections, setSections] = useState([])
  const [evidence, setEvidence] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('sections')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)

  // Subscribe to declaration data
  useEffect(() => {
    if (!declarationId) return

    const unsubDecl = subscribeToManufacturerDeclaration(declarationId, (data) => {
      setDeclaration(data)
      setLoading(false)
    })

    const unsubSections = subscribeToDeclarationSections(declarationId, (data) => {
      setSections(data)
    })

    const unsubEvidence = subscribeToMPDEvidence(declarationId, (data) => {
      setEvidence(data)
    })

    return () => {
      unsubDecl()
      unsubSections()
      unsubEvidence()
    }
  }, [declarationId])

  // Load stats
  useEffect(() => {
    if (declarationId) {
      getMPDStats(declarationId).then(setStats)
    }
  }, [declarationId, sections])

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
        <p className="text-gray-500 mt-1">The manufacturer declaration could not be found.</p>
        <button
          onClick={() => navigate('/manufacturer-declarations')}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          Return to Declarations
        </button>
      </div>
    )
  }

  const statusInfo = MPD_STATUSES[declaration.status] || MPD_STATUSES.draft
  const categoryInfo = MPD_RPAS_CATEGORIES[declaration.category] || MPD_RPAS_CATEGORIES.large
  const keCategory = getKineticEnergyCategory(declaration.rpasDetails?.kineticEnergy || 0)
  const overallCompletion = stats?.items?.percentage || 0

  const handleStatusChange = async (newStatus) => {
    try {
      await updateMPDStatus(declarationId, newStatus)
      setShowStatusMenu(false)
    } catch (err) {
      console.error('Error updating status:', err)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteManufacturerDeclaration(declarationId)
      navigate('/manufacturer-declarations')
    } catch (err) {
      console.error('Error deleting declaration:', err)
    }
  }

  // Valid status transitions
  const getValidTransitions = () => {
    const transitions = {
      draft: ['in_development', 'cancelled'],
      in_development: ['draft', 'testing', 'internal_review'],
      testing: ['in_development', 'internal_review'],
      internal_review: ['in_development', 'submitted'],
      submitted: ['under_review', 'info_requested', 'accepted', 'rejected'],
      under_review: ['info_requested', 'accepted', 'rejected'],
      info_requested: ['under_review', 'rejected'],
      accepted: ['expired'],
      rejected: ['draft'],
      expired: []
    }
    return transitions[declaration.status] || []
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate('/manufacturer-declarations')}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{declaration.name}</h1>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>{categoryInfo.label}</span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1">
                <Cpu className="w-4 h-4" />
                {declaration.rpasDetails?.manufacturer} {declaration.rpasDetails?.model}
              </span>
              {declaration.hasCustomSoftware && (
                <>
                  <span className="text-gray-300">|</span>
                  <span className="flex items-center gap-1 text-purple-600">
                    <Code className="w-4 h-4" />
                    Custom Software
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Change Menu */}
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Update Status
              <ChevronRight className={`w-4 h-4 transition-transform ${showStatusMenu ? 'rotate-90' : ''}`} />
            </button>
            {showStatusMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="p-2">
                  {getValidTransitions().map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-100 flex items-center gap-2"
                    >
                      <span className={`w-2 h-2 rounded-full ${MPD_STATUSES[status]?.color.split(' ')[0] || 'bg-gray-400'}`} />
                      {MPD_STATUSES[status]?.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Delete */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
            title="Delete Declaration"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Kinetic Energy Warning */}
      {(keCategory.category === 'high' || keCategory.category === 'very_high') && (
        <div className={`p-4 rounded-lg border ${
          keCategory.category === 'very_high'
            ? 'bg-red-50 border-red-200'
            : 'bg-orange-50 border-orange-200'
        }`}>
          <div className="flex items-center gap-3">
            <Zap className={`w-5 h-5 ${
              keCategory.category === 'very_high' ? 'text-red-600' : 'text-orange-600'
            }`} />
            <div>
              <p className={`font-medium ${
                keCategory.category === 'very_high' ? 'text-red-900' : 'text-orange-900'
              }`}>
                {keCategory.label} - Kinetic Energy: {(declaration.rpasDetails?.kineticEnergy / 1000).toFixed(1)} kJ
              </p>
              <p className={`text-sm ${
                keCategory.category === 'very_high' ? 'text-red-700' : 'text-orange-700'
              }`}>
                {keCategory.requiresContact
                  ? 'Contact Transport Canada directly for guidance on this high-energy system.'
                  : 'Additional safety analysis and evidence required for this kinetic energy category.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Requested Alert */}
      {declaration.status === 'info_requested' && (
        <div className="p-4 rounded-lg border bg-orange-50 border-orange-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-orange-900">Transport Canada requires additional information</p>
              <p className="text-sm text-orange-700 mt-1">
                Review TC comments and provide the requested documentation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Section Progress */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Section Progress</span>
            <BarChart className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-gray-900">{stats?.sections?.complete || 0}</span>
            <span className="text-gray-500 mb-1">/ {stats?.sections?.total || 0} sections</span>
          </div>
          <div className="mt-2 h-2 bg-gray-100 rounded-full">
            <div
              className={`h-full rounded-full ${
                stats?.sections?.percentage === 100 ? 'bg-green-500' :
                stats?.sections?.percentage > 50 ? 'bg-blue-500' :
                'bg-yellow-500'
              }`}
              style={{ width: `${stats?.sections?.percentage || 0}%` }}
            />
          </div>
        </div>

        {/* Item Progress */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Item Progress</span>
            <FileText className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-gray-900">{overallCompletion}%</span>
            <span className="text-gray-500 mb-1">complete</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {stats?.items?.complete || 0} of {stats?.items?.total || 0} items
          </p>
        </div>

        {/* Evidence Count */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Evidence Files</span>
            <FileCheck className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.evidence?.total || 0}</p>
          <p className="text-sm text-gray-500 mt-1">documents uploaded</p>
        </div>

        {/* SAIL Level */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">SAIL Level</span>
            <Shield className="w-4 h-4 text-gray-400" />
          </div>
          {declaration.sailLevel ? (
            <p className={`text-2xl font-bold ${
              declaration.sailLevel >= 5 ? 'text-red-600' :
              declaration.sailLevel >= 3 ? 'text-orange-600' :
              'text-green-600'
            }`}>
              SAIL {declaration.sailLevel}
            </p>
          ) : (
            <div>
              <p className="text-gray-500">Not linked</p>
              <Link
                to="/safety-declarations"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Link SORA assessment
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* RPAS & Software Details Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* RPAS Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-gray-400" />
            RPAS System Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase">Manufacturer</p>
              <p className="font-medium">{declaration.rpasDetails?.manufacturer}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Model</p>
              <p className="font-medium">{declaration.rpasDetails?.model}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Operating Weight</p>
              <p className={`font-medium ${
                declaration.rpasDetails?.operatingWeight > 150 ? 'text-orange-600' : ''
              }`}>
                {declaration.rpasDetails?.operatingWeight} kg
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Max Velocity</p>
              <p className="font-medium">{declaration.rpasDetails?.maxVelocity} m/s</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Kinetic Energy</p>
              <p className={`font-medium ${
                keCategory.category === 'very_high' ? 'text-red-600' :
                keCategory.category === 'high' ? 'text-orange-600' :
                ''
              }`}>
                {(declaration.rpasDetails?.kineticEnergy / 1000).toFixed(1)} kJ ({keCategory.label})
              </p>
            </div>
            {declaration.rpasDetails?.propulsionType && (
              <div>
                <p className="text-xs text-gray-500 uppercase">Propulsion</p>
                <p className="font-medium">{declaration.rpasDetails.propulsionType.replace(/_/g, ' ')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Software Details (if applicable) */}
        {declaration.hasCustomSoftware && declaration.softwareDetails && (
          <div className="bg-white rounded-lg border border-purple-200 p-5">
            <h3 className="font-medium text-purple-900 mb-4 flex items-center gap-2">
              <Code className="w-5 h-5 text-purple-600" />
              Custom Software Declaration
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-purple-500 uppercase">Software Name</p>
                <p className="font-medium text-purple-900">{declaration.softwareDetails.name}</p>
              </div>
              <div>
                <p className="text-xs text-purple-500 uppercase">Version</p>
                <p className="font-medium text-purple-900">{declaration.softwareDetails.version || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-purple-500 uppercase">Design Standard</p>
                <p className="font-medium text-purple-900">
                  {DESIGN_STANDARDS[declaration.softwareDetails.designStandard]?.label}
                </p>
              </div>
              <div>
                <p className="text-xs text-purple-500 uppercase">DAL Level</p>
                <p className="font-medium text-purple-900">
                  Level {declaration.softwareDetails.dalLevel} - {SOFTWARE_DAL_LEVELS[declaration.softwareDetails.dalLevel]?.label.split(' - ')[1]}
                </p>
              </div>
            </div>
            {declaration.softwareDetails.description && (
              <div className="mt-4 pt-4 border-t border-purple-100">
                <p className="text-xs text-purple-500 uppercase mb-1">Description</p>
                <p className="text-sm text-purple-800">{declaration.softwareDetails.description}</p>
              </div>
            )}
          </div>
        )}

        {/* Placeholder if no custom software */}
        {!declaration.hasCustomSoftware && (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-5 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Code className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No custom software declared</p>
              <p className="text-xs mt-1">Using manufacturer's standard flight software</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {[
            { id: 'sections', label: 'Documentation Sections', icon: FileText },
            { id: 'evidence', label: 'Evidence', icon: FileCheck },
            { id: 'activity', label: 'Activity', icon: Activity }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'sections' && overallCompletion < 100 && (
                <span className="ml-1 px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">
                  {100 - overallCompletion}%
                </span>
              )}
              {tab.id === 'evidence' && (
                <span className="ml-1 px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                  {evidence.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200">
        {activeTab === 'sections' && (
          <MPDSectionChecklist
            declarationId={declarationId}
            sections={sections}
            hasCustomSoftware={declaration.hasCustomSoftware}
          />
        )}

        {activeTab === 'evidence' && (
          <div className="p-6">
            {evidence.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileCheck className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="font-medium">No Evidence Uploaded</p>
                <p className="text-sm mt-1">Upload evidence files in the Documentation Sections tab.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {evidence.map(ev => (
                  <div key={ev.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{ev.name}</p>
                        <p className="text-sm text-gray-500">{ev.type} • {ev.createdAt?.toLocaleDateString()}</p>
                      </div>
                    </div>
                    {ev.fileUrl && (
                      <a
                        href={ev.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        View
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="p-6">
            <div className="text-center py-12 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="font-medium">Activity Log</p>
              <p className="text-sm mt-1">Activity tracking will be implemented in a future phase.</p>
            </div>
          </div>
        )}
      </div>

      {/* Linked SFOC */}
      {declaration.sfocApplicationId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <LinkIcon className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">Linked to SFOC Application</p>
              <Link
                to={`/sfoc/${declaration.sfocApplicationId}`}
                className="text-sm text-blue-700 hover:text-blue-800"
              >
                View SFOC Application →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowDeleteConfirm(false)} />
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Declaration?</h3>
              <p className="text-gray-500 mb-4">
                This will permanently delete this manufacturer declaration and all associated sections and evidence. This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete Declaration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
