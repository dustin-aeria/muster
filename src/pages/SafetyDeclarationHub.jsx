/**
 * SafetyDeclarationHub.jsx
 * Main dashboard for Safety Assurance Declarations (CAR Standard 922)
 *
 * Phase 1: Placeholder - Full implementation in Phase 2
 *
 * @location src/pages/SafetyDeclarationHub.jsx
 */

import { useState, useEffect } from 'react'
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
  Plane
} from 'lucide-react'
import {
  subscribeToSafetyDeclarations,
  DECLARATION_STATUSES,
  DECLARATION_TYPES
} from '../lib/firestoreSafetyDeclaration'

export default function SafetyDeclarationHub() {
  const navigate = useNavigate()
  const { organization } = useOrganization()
  const [declarations, setDeclarations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    if (!organization?.id) return

    const unsubscribe = subscribeToSafetyDeclarations(organization.id, (data) => {
      setDeclarations(data)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [organization?.id])

  // Filter declarations
  const filteredDeclarations = declarations.filter(dec => {
    const matchesSearch = dec.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dec.rpasDetails?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dec.rpasDetails?.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase())

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
          onClick={() => {/* TODO: Open create modal in Phase 2 */}}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Declaration
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total Declarations</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              <p className="text-sm text-gray-500">In Progress</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.readyForSubmission}</p>
              <p className="text-sm text-gray-500">Ready to Submit</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.accepted}</p>
              <p className="text-sm text-gray-500">Accepted</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search declarations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

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
      </div>

      {/* Declarations List */}
      {filteredDeclarations.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <FileCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {declarations.length === 0
              ? 'No Safety Declarations Yet'
              : 'No Matching Declarations'
            }
          </h3>
          <p className="text-gray-500 mb-4">
            {declarations.length === 0
              ? 'Create your first Safety Assurance Declaration to get started.'
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
          {declarations.length === 0 && (
            <button
              onClick={() => {/* TODO: Open create modal in Phase 2 */}}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Declaration
            </button>
          )}
        </div>
      ) : (
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Activity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDeclarations.map((declaration) => (
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
                      <div className="flex items-center gap-2">
                        <Plane className="w-4 h-4 text-gray-400" />
                        <div className="text-sm text-gray-900">
                          {declaration.rpasDetails?.manufacturer} {declaration.rpasDetails?.model}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {DECLARATION_TYPES[declaration.declarationType]?.label || 'Declaration'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(declaration.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {declaration.lastActivityAt?.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
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
    </div>
  )
}
