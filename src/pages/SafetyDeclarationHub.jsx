/**
 * SafetyDeclarationHub.jsx
 * Main dashboard for Safety Assurance Declarations (CAR Standard 922)
 *
 * @location src/pages/SafetyDeclarationHub.jsx
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
  TestTube,
  Send
} from 'lucide-react'
import {
  subscribeToSafetyDeclarations,
  getDeclarationStats,
  DECLARATION_STATUSES,
  DECLARATION_TYPES
} from '../lib/firestoreSafetyDeclaration'
import CreateDeclarationModal from '../components/safetyDeclaration/CreateDeclarationModal'
import DeclarationCard from '../components/safetyDeclaration/DeclarationCard'

export default function SafetyDeclarationHub() {
  const navigate = useNavigate()
  const { organization } = useOrganization()
  const [declarations, setDeclarations] = useState([])
  const [declarationStats, setDeclarationStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Subscribe to declarations
  useEffect(() => {
    if (!organization?.id) return

    const unsubscribe = subscribeToSafetyDeclarations(organization.id, (data) => {
      setDeclarations(data)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [organization?.id])

  // Load stats for each declaration
  useEffect(() => {
    const loadStats = async () => {
      const stats = {}
      for (const dec of declarations) {
        try {
          stats[dec.id] = await getDeclarationStats(dec.id)
        } catch (err) {
          console.error(`Error loading stats for ${dec.id}:`, err)
        }
      }
      setDeclarationStats(stats)
    }

    if (declarations.length > 0) {
      loadStats()
    }
  }, [declarations])

  // Filter declarations
  const filteredDeclarations = declarations.filter(dec => {
    const matchesSearch = dec.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dec.rpasDetails?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dec.rpasDetails?.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dec.clientName?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || dec.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Calculate stats
  const stats = {
    total: declarations.length,
    inProgress: declarations.filter(d =>
      ['draft', 'requirements_mapping', 'testing', 'evidence_review'].includes(d.status)
    ).length,
    readyForSubmission: declarations.filter(d => d.status === 'ready_for_submission').length,
    accepted: declarations.filter(d => d.status === 'accepted').length
  }

  // Count declarations with active testing
  const activeTestingCount = declarations.filter(d => d.status === 'testing').length

  const handleCreateSuccess = useCallback((newDeclaration) => {
    navigate(`/safety-declarations/${newDeclaration.id}`)
  }, [navigate])

  const getStatusBadge = (status) => {
    const statusInfo = DECLARATION_STATUSES[status] || DECLARATION_STATUSES.draft
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
          <h1 className="text-2xl font-bold text-gray-900">Safety Declarations</h1>
          <p className="mt-1 text-sm text-gray-500">
            Transport Canada CAR Standard 922 Safety Assurance Declarations
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Declaration
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
              <p className="text-sm text-gray-500">Total Declarations</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'testing' ? 'all' : 'testing')}
          className={`bg-white rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'testing' ? 'border-yellow-500 ring-1 ring-yellow-500' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-100 rounded-lg">
              <TestTube className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeTestingCount}</p>
              <p className="text-sm text-gray-500">Active Testing</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'ready_for_submission' ? 'all' : 'ready_for_submission')}
          className={`bg-white rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'ready_for_submission' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 rounded-lg">
              <Send className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.readyForSubmission}</p>
              <p className="text-sm text-gray-500">Ready to Submit</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'accepted' ? 'all' : 'accepted')}
          className={`bg-white rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'accepted' ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.accepted}</p>
              <p className="text-sm text-gray-500">Accepted</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, manufacturer, model, or client..."
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
              {Object.entries(DECLARATION_STATUSES).map(([key, status]) => (
                <option key={key} value={key}>{status.label}</option>
              ))}
            </select>
          </div>

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

      {/* Active filter indicator */}
      {statusFilter !== 'all' && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Filtering by:</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
            {DECLARATION_STATUSES[statusFilter]?.label}
            <button
              onClick={() => setStatusFilter('all')}
              className="ml-1 hover:text-blue-900"
            >
              ×
            </button>
          </span>
        </div>
      )}

      {/* Declarations Display */}
      {filteredDeclarations.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <FileCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {declarations.length === 0
              ? 'No Safety Declarations Yet'
              : 'No Matching Declarations'
            }
          </h3>
          <p className="text-gray-500 mb-4 max-w-md mx-auto">
            {declarations.length === 0
              ? 'Create your first Safety Assurance Declaration to track compliance with Transport Canada CAR Standard 922.'
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
          {declarations.length === 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Declaration
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDeclarations.map((declaration) => (
            <DeclarationCard
              key={declaration.id}
              declaration={declaration}
              stats={declarationStats[declaration.id]}
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
                    Declaration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RPAS System
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Activity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDeclarations.map((declaration) => {
                  const stats = declarationStats[declaration.id]
                  const progress = stats?.requirements?.completionPercentage || 0

                  return (
                    <tr
                      key={declaration.id}
                      onClick={() => navigate(`/safety-declarations/${declaration.id}`)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <FileCheck className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {declaration.name}
                            </div>
                            {declaration.clientName && (
                              <div className="text-sm text-gray-500">
                                Client: {declaration.clientName}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {declaration.rpasDetails?.manufacturer} {declaration.rpasDetails?.model}
                        </div>
                        <div className="text-xs text-gray-500">
                          {declaration.rpasDetails?.weightKg} kg
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {DECLARATION_TYPES[declaration.declarationType]?.label || 'Declaration'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full w-20">
                            <div
                              className={`h-full rounded-full ${
                                progress === 100 ? 'bg-green-500' :
                                progress > 50 ? 'bg-blue-500' :
                                'bg-yellow-500'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(declaration.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {declaration.lastActivityAt?.toLocaleDateString()}
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
            <h4 className="text-sm font-medium text-blue-900">About Safety Assurance Declarations</h4>
            <p className="mt-1 text-sm text-blue-700">
              Safety Assurance Declarations are required under Transport Canada CAR Standard 922
              for RPAS operations including controlled airspace, near/over people, and BVLOS flights.
              This tool helps you track requirements, testing, and evidence for your declaration.
            </p>
          </div>
        </div>
      </div>

      {/* Create Declaration Modal */}
      <CreateDeclarationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  )
}
