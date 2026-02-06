/**
 * ManufacturerDeclarationHub.jsx
 * Main dashboard for RPAS Manufacturer Performance Declarations
 * Required for RPAS >150kg and BVLOS operations per Transport Canada
 *
 * @location src/pages/ManufacturerDeclarationHub.jsx
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
  Cpu,
  Zap,
  Code
} from 'lucide-react'
import {
  subscribeToManufacturerDeclarations,
  MPD_STATUSES,
  MPD_RPAS_CATEGORIES,
  getKineticEnergyCategory
} from '../lib/firestoreManufacturerDeclaration'
import CreateMPDModal from '../components/manufacturerDeclaration/CreateMPDModal'
import MPDCard from '../components/manufacturerDeclaration/MPDCard'

export default function ManufacturerDeclarationHub() {
  const navigate = useNavigate()
  const { organization } = useOrganization()
  const [declarations, setDeclarations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Subscribe to declarations
  useEffect(() => {
    if (!organization?.id) return

    const unsubscribe = subscribeToManufacturerDeclarations(organization.id, (data) => {
      setDeclarations(data)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [organization?.id])

  // Filter declarations
  const filteredDeclarations = declarations.filter(dec => {
    const matchesSearch = dec.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dec.rpasDetails?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dec.rpasDetails?.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dec.softwareDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || dec.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || dec.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  // Calculate stats
  const stats = {
    total: declarations.length,
    inProgress: declarations.filter(d =>
      ['draft', 'in_development', 'testing', 'internal_review'].includes(d.status)
    ).length,
    pending: declarations.filter(d =>
      ['submitted', 'under_review', 'info_requested'].includes(d.status)
    ).length,
    accepted: declarations.filter(d => d.status === 'accepted').length,
    withCustomSoftware: declarations.filter(d => d.hasCustomSoftware).length,
    largeRPAS: declarations.filter(d => d.category === 'large').length,
    highKineticEnergy: declarations.filter(d =>
      d.rpasDetails?.kineticEnergyCategory === 'high' ||
      d.rpasDetails?.kineticEnergyCategory === 'very_high'
    ).length
  }

  const handleCreateSuccess = useCallback((newDeclaration) => {
    navigate(`/manufacturer-declarations/${newDeclaration.id}`)
  }, [navigate])

  const getStatusBadge = (status) => {
    const statusInfo = MPD_STATUSES[status] || MPD_STATUSES.draft
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
          <h1 className="text-2xl font-bold text-gray-900">Manufacturer Declarations</h1>
          <p className="mt-1 text-sm text-gray-500">
            RPAS Performance Declarations for Transport Canada - Large RPAS &amp; BVLOS
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
              <p className="text-sm text-gray-500">TC Accepted</p>
            </div>
          </div>
        </div>

        {stats.withCustomSoftware > 0 ? (
          <div
            onClick={() => {}}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-100 rounded-lg">
                <Code className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.withCustomSoftware}</p>
                <p className="text-sm text-gray-500">Custom Software</p>
              </div>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setCategoryFilter(categoryFilter === 'large' ? 'all' : 'large')}
            className={`bg-white rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md ${
              categoryFilter === 'large' ? 'border-orange-500 ring-1 ring-orange-500' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-100 rounded-lg">
                <Cpu className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.largeRPAS}</p>
                <p className="text-sm text-gray-500">Large RPAS (&gt;150kg)</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* High Kinetic Energy Warning */}
      {stats.highKineticEnergy > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-orange-600" />
            <div>
              <p className="font-medium text-orange-900">
                {stats.highKineticEnergy} declaration(s) with high kinetic energy (&gt;34kJ)
              </p>
              <p className="text-sm text-orange-700">
                These require additional safety analysis and may need direct TC consultation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, manufacturer, model, or software..."
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
              {Object.entries(MPD_STATUSES).map(([key, status]) => (
                <option key={key} value={key}>{status.label}</option>
              ))}
            </select>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            {Object.entries(MPD_RPAS_CATEGORIES).map(([key, cat]) => (
              <option key={key} value={key}>{cat.label}</option>
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
      {(statusFilter !== 'all' || categoryFilter !== 'all') && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500">Filtering by:</span>
          {statusFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
              {MPD_STATUSES[statusFilter]?.label}
              <button
                onClick={() => setStatusFilter('all')}
                className="ml-1 hover:text-blue-900"
              >
                ×
              </button>
            </span>
          )}
          {categoryFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm bg-orange-100 text-orange-700">
              {MPD_RPAS_CATEGORIES[categoryFilter]?.label}
              <button
                onClick={() => setCategoryFilter('all')}
                className="ml-1 hover:text-orange-900"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}

      {/* Declarations Display */}
      {filteredDeclarations.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <FileCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {declarations.length === 0
              ? 'No Manufacturer Declarations Yet'
              : 'No Matching Declarations'
            }
          </h3>
          <p className="text-gray-500 mb-4 max-w-md mx-auto">
            {declarations.length === 0
              ? 'Create your first Manufacturer Performance Declaration for RPAS over 150kg or BVLOS operations requiring TC acceptance.'
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
            <MPDCard
              key={declaration.id}
              declaration={declaration}
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
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kinetic Energy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDeclarations.map((declaration) => {
                  const categoryInfo = MPD_RPAS_CATEGORIES[declaration.category]
                  const keCategory = getKineticEnergyCategory(declaration.rpasDetails?.kineticEnergy || 0)

                  return (
                    <tr
                      key={declaration.id}
                      onClick={() => navigate(`/manufacturer-declarations/${declaration.id}`)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            declaration.status === 'accepted' ? 'bg-green-50' :
                            declaration.hasCustomSoftware ? 'bg-purple-50' :
                            'bg-blue-50'
                          }`}>
                            {declaration.hasCustomSoftware ? (
                              <Code className={`w-5 h-5 ${
                                declaration.status === 'accepted' ? 'text-green-600' : 'text-purple-600'
                              }`} />
                            ) : (
                              <FileCheck className={`w-5 h-5 ${
                                declaration.status === 'accepted' ? 'text-green-600' : 'text-blue-600'
                              }`} />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {declaration.name}
                            </div>
                            {declaration.hasCustomSoftware && (
                              <div className="text-xs text-purple-600">
                                Custom Software: {declaration.softwareDetails?.name}
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
                          {declaration.rpasDetails?.operatingWeight} kg
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          declaration.category === 'large'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {categoryInfo?.label || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${
                          keCategory.category === 'very_high' ? 'text-red-600 font-medium' :
                          keCategory.category === 'high' ? 'text-orange-600' :
                          'text-gray-600'
                        }`}>
                          {(declaration.rpasDetails?.kineticEnergy / 1000).toFixed(1)} kJ
                        </div>
                        <div className="text-xs text-gray-500">{keCategory.label}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(declaration.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {declaration.updatedAt?.toLocaleDateString()}
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
            <h4 className="text-sm font-medium text-blue-900">About Manufacturer Declarations</h4>
            <p className="mt-1 text-sm text-blue-700">
              RPAS Manufacturer Performance Declarations are required for RPAS exceeding 150kg or conducting
              BVLOS operations. The declaration must include system design, safety analysis, performance
              verification, and environmental qualification documentation per Transport Canada requirements.
            </p>
          </div>
        </div>
      </div>

      {/* Create Declaration Modal */}
      <CreateMPDModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  )
}
