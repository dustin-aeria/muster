/**
 * SFOCHub.jsx
 * Main dashboard for Special Flight Operations Certificate (SFOC) applications
 * For Transport Canada CAR 903 compliance - RPAS operations requiring SFOC
 *
 * @location src/pages/SFOCHub.jsx
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrganization } from '../hooks/useOrganization'
import {
  FileCheck,
  Plus,
  Search,
  Filter,
  AlertCircle,
  Clock,
  CheckCircle2,
  FileText,
  LayoutGrid,
  List,
  Send,
  AlertTriangle,
  Calendar,
  Scale
} from 'lucide-react'
import {
  subscribeToSFOCApplications,
  getSFOCStats,
  SFOC_STATUSES,
  SFOC_COMPLEXITY,
  SFOC_APPLICATION_TYPES,
  isExpiringSoon,
  isExpired,
  getDaysUntilExpiry
} from '../lib/firestoreSFOC'
import CreateSFOCModal from '../components/sfoc/CreateSFOCModal'
import SFOCCard from '../components/sfoc/SFOCCard'

export default function SFOCHub() {
  const navigate = useNavigate()
  const { organization } = useOrganization()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [complexityFilter, setComplexityFilter] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Subscribe to applications
  useEffect(() => {
    if (!organization?.id) return

    const unsubscribe = subscribeToSFOCApplications(organization.id, (data) => {
      setApplications(data)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [organization?.id])

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.aircraftDetails?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.aircraftDetails?.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.operationalArea?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.sfocNumber?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || app.status === statusFilter
    const matchesComplexity = complexityFilter === 'all' || app.complexityLevel === complexityFilter

    return matchesSearch && matchesStatus && matchesComplexity
  })

  // Calculate stats
  const stats = {
    total: applications.length,
    inProgress: applications.filter(a =>
      ['draft', 'documents_pending', 'sora_in_progress', 'review_ready'].includes(a.status)
    ).length,
    pending: applications.filter(a =>
      ['submitted', 'under_review', 'additional_info_requested'].includes(a.status)
    ).length,
    approved: applications.filter(a => a.status === 'approved').length,
    expiringSoon: applications.filter(a =>
      a.status === 'approved' && isExpiringSoon(a.approvedEndDate)
    ).length,
    mediumComplexity: applications.filter(a => a.complexityLevel === 'medium').length,
    highComplexity: applications.filter(a => a.complexityLevel === 'high').length
  }

  const handleCreateSuccess = useCallback((newApplication) => {
    navigate(`/sfoc/${newApplication.id}`)
  }, [navigate])

  const getStatusBadge = (status) => {
    const statusInfo = SFOC_STATUSES[status] || SFOC_STATUSES.draft
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SFOC Applications</h1>
          <p className="mt-1 text-sm text-gray-500">
            Transport Canada Special Flight Operations Certificate - CAR Part IX
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Application
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gray-100 rounded-lg">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total Applications</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'submitted' ? 'all' : 'submitted')}
          className={`bg-white rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'submitted' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 rounded-lg">
              <Send className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-500">With Transport Canada</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'approved' ? 'all' : 'approved')}
          className={`bg-white rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'approved' ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              <p className="text-sm text-gray-500">Approved SFOCs</p>
            </div>
          </div>
        </div>

        {stats.expiringSoon > 0 && (
          <div
            onClick={() => setStatusFilter('approved')}
            className="bg-white rounded-lg border border-orange-200 p-4 cursor-pointer transition-all hover:shadow-md bg-orange-50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-900">{stats.expiringSoon}</p>
                <p className="text-sm text-orange-700">Expiring Soon</p>
              </div>
            </div>
          </div>
        )}

        {stats.expiringSoon === 0 && (
          <div
            onClick={() => setComplexityFilter(complexityFilter === 'high' ? 'all' : 'high')}
            className={`bg-white rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md ${
              complexityFilter === 'high' ? 'border-purple-500 ring-1 ring-purple-500' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-100 rounded-lg">
                <Scale className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.highComplexity}</p>
                <p className="text-sm text-gray-500">High Complexity</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, aircraft, area, or SFOC number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              {Object.entries(SFOC_STATUSES).map(([key, status]) => (
                <option key={key} value={key}>{status.label}</option>
              ))}
            </select>
          </div>

          <select
            value={complexityFilter}
            onChange={(e) => setComplexityFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Complexity</option>
            {Object.entries(SFOC_COMPLEXITY).map(([key, complexity]) => (
              <option key={key} value={key}>{complexity.label}</option>
            ))}
          </select>

          {/* View Toggle */}
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              title="Grid view"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              title="List view"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Active filter indicators */}
      {(statusFilter !== 'all' || complexityFilter !== 'all') && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500">Filtering by:</span>
          {statusFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
              {SFOC_STATUSES[statusFilter]?.label}
              <button
                onClick={() => setStatusFilter('all')}
                className="ml-1 hover:text-blue-900"
              >
                ×
              </button>
            </span>
          )}
          {complexityFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm bg-purple-100 text-purple-700">
              {SFOC_COMPLEXITY[complexityFilter]?.label}
              <button
                onClick={() => setComplexityFilter('all')}
                className="ml-1 hover:text-purple-900"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}

      {/* Applications Display */}
      {filteredApplications.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <FileCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {applications.length === 0
              ? 'No SFOC Applications Yet'
              : 'No Matching Applications'
            }
          </h3>
          <p className="text-gray-500 mb-4 max-w-md mx-auto">
            {applications.length === 0
              ? 'Create your first SFOC application for operations requiring Transport Canada approval, such as RPAS over 150kg or extended BVLOS.'
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
          {applications.length === 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Application
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApplications.map((application) => (
            <SFOCCard
              key={application.id}
              application={application}
            />
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aircraft
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Complexity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valid Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.map((application) => {
                  const complexityInfo = SFOC_COMPLEXITY[application.complexityLevel]
                  const daysUntilExpiry = application.status === 'approved'
                    ? getDaysUntilExpiry(application.approvedEndDate)
                    : null

                  return (
                    <tr
                      key={application.id}
                      onClick={() => navigate(`/sfoc/${application.id}`)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            application.status === 'approved' ? 'bg-green-50' :
                            application.status === 'rejected' ? 'bg-red-50' :
                            application.complexityLevel === 'high' ? 'bg-purple-50' :
                            'bg-blue-50'
                          }`}>
                            <FileCheck className={`w-5 h-5 ${
                              application.status === 'approved' ? 'text-green-600' :
                              application.status === 'rejected' ? 'text-red-600' :
                              application.complexityLevel === 'high' ? 'text-purple-600' :
                              'text-blue-600'
                            }`} />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {application.name}
                            </div>
                            {application.sfocNumber && (
                              <div className="text-xs text-gray-500">
                                SFOC #{application.sfocNumber}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {application.aircraftDetails?.manufacturer} {application.aircraftDetails?.model}
                        </div>
                        {application.aircraftDetails?.weightKg && (
                          <div className="text-xs text-gray-500">
                            {application.aircraftDetails.weightKg} kg
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          application.complexityLevel === 'high'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {complexityInfo?.label || 'Medium'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(application.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {application.status === 'approved' && application.approvedStartDate ? (
                          <div>
                            <div className="text-sm text-gray-900">
                              {application.approvedStartDate?.toLocaleDateString()} - {application.approvedEndDate?.toLocaleDateString()}
                            </div>
                            {daysUntilExpiry !== null && (
                              <div className={`text-xs ${
                                daysUntilExpiry <= 0 ? 'text-red-600' :
                                daysUntilExpiry <= 60 ? 'text-orange-600' :
                                'text-gray-500'
                              }`}>
                                {daysUntilExpiry <= 0 ? 'Expired' :
                                 daysUntilExpiry === 1 ? '1 day left' :
                                 `${daysUntilExpiry} days left`}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {application.updatedAt?.toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">About SFOC Applications</h4>
            <p className="mt-1 text-sm text-blue-700">
              A Special Flight Operations Certificate (SFOC) is required under CAR 903.01 for operations such as
              RPAS over 150kg, altitudes above 400ft AGL, extended BVLOS, and hazardous payloads.
              Processing time is typically 60 business days for medium/high complexity applications.
            </p>
          </div>
        </div>
      </div>

      {/* Create Application Modal */}
      <CreateSFOCModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  )
}
