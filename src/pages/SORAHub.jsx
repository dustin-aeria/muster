/**
 * SORAHub.jsx
 * Main dashboard for SORA (Specific Operational Risk Assessment) management
 *
 * Displays all SORA assessments with filtering, search, and creation
 * Links to SFOC applications for integrated regulatory workflow
 *
 * @location src/pages/SORAHub.jsx
 */

import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Search,
  Filter,
  Grid,
  List,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  FileText,
  ArrowRight,
  TrendingUp,
  Shield
} from 'lucide-react'
import { useOrganization } from '../hooks/useOrganization'
import {
  subscribeToSORAAssessments,
  getSORAStats,
  SORA_STATUSES
} from '../lib/firestoreSora'
import { sailColors, sailDescriptions } from '../lib/soraConfig'
import CreateSORAModal from '../components/sora/CreateSORAModal'
import SORACard from '../components/sora/SORACard'

export default function SORAHub() {
  const navigate = useNavigate()
  const { organization } = useOrganization()
  const [assessments, setAssessments] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sailFilter, setSailFilter] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Subscribe to assessments
  useEffect(() => {
    if (!organization?.id) return

    const unsubscribe = subscribeToSORAAssessments(organization.id, (data) => {
      setAssessments(data)
      setLoading(false)
    })

    // Load stats
    getSORAStats(organization.id).then(setStats)

    return () => unsubscribe()
  }, [organization?.id])

  // Filter assessments
  const filteredAssessments = useMemo(() => {
    return assessments.filter(assessment => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        const matchesSearch =
          assessment.name?.toLowerCase().includes(search) ||
          assessment.description?.toLowerCase().includes(search) ||
          assessment.conops?.operationDescription?.purpose?.toLowerCase().includes(search)
        if (!matchesSearch) return false
      }

      // Status filter
      if (statusFilter !== 'all' && assessment.status !== statusFilter) {
        return false
      }

      // SAIL filter
      if (sailFilter !== 'all' && assessment.sail?.level !== sailFilter) {
        return false
      }

      return true
    })
  }, [assessments, searchTerm, statusFilter, sailFilter])

  // Group by status for quick access
  const groupedByStatus = useMemo(() => {
    return {
      inProgress: assessments.filter(a =>
        !['approved', 'archived'].includes(a.status)
      ),
      approved: assessments.filter(a => a.status === 'approved'),
      readyForReview: assessments.filter(a => a.status === 'ready_for_review')
    }
  }, [assessments])

  const handleCreateSuccess = (newAssessment) => {
    setShowCreateModal(false)
    navigate(`/sora/${newAssessment.id}`)
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">SORA Assessments</h1>
          <p className="mt-1 text-sm text-gray-500">
            Specific Operational Risk Assessments per JARUS SORA 2.5
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Assessment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Assessments</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.inProgress || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Approved</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.approved || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">OSO Compliant</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.osoCompliant || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* SAIL Distribution */}
      {stats && stats.total > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">SAIL Level Distribution</h3>
          <div className="flex gap-2">
            {['I', 'II', 'III', 'IV', 'V', 'VI'].map(sail => {
              const count = stats.bySAIL?.[sail] || 0
              const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0
              return (
                <div
                  key={sail}
                  className={`flex-1 p-3 rounded-lg border ${sailColors[sail] || 'bg-gray-100'}`}
                >
                  <p className="text-lg font-bold">{sail}</p>
                  <p className="text-xs">{count} ({percentage}%)</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search assessments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            {Object.entries(SORA_STATUSES).map(([key, status]) => (
              <option key={key} value={key}>{status.label}</option>
            ))}
          </select>

          {/* SAIL Filter */}
          <select
            value={sailFilter}
            onChange={(e) => setSailFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All SAIL Levels</option>
            {['I', 'II', 'III', 'IV', 'V', 'VI'].map(sail => (
              <option key={sail} value={sail}>SAIL {sail}</option>
            ))}
          </select>

          {/* View Toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'bg-white'}`}
            >
              <Grid className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'bg-white'}`}
            >
              <List className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Access: Ready for Review */}
      {groupedByStatus.readyForReview.length > 0 && (
        <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-cyan-800 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Ready for Review ({groupedByStatus.readyForReview.length})
            </h3>
          </div>
          <div className="space-y-2">
            {groupedByStatus.readyForReview.slice(0, 3).map(assessment => (
              <div
                key={assessment.id}
                onClick={() => navigate(`/sora/${assessment.id}`)}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-cyan-200 hover:border-cyan-400 cursor-pointer transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">{assessment.name}</p>
                  {assessment.sail?.level && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${sailColors[assessment.sail.level]}`}>
                      SAIL {assessment.sail.level}
                    </span>
                  )}
                </div>
                <ArrowRight className="w-5 h-5 text-cyan-600" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assessment Grid/List */}
      {filteredAssessments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments found</h3>
          <p className="text-gray-500 mb-4">
            {assessments.length === 0
              ? 'Create your first SORA assessment to get started.'
              : 'Try adjusting your search or filter criteria.'}
          </p>
          {assessments.length === 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Create Assessment
            </button>
          )}
        </div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-3'
        }>
          {filteredAssessments.map(assessment => (
            <SORACard
              key={assessment.id}
              assessment={assessment}
              viewMode={viewMode}
              onClick={() => navigate(`/sora/${assessment.id}`)}
            />
          ))}
        </div>
      )}

      {/* SORA Info Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-2">About SORA Assessments</p>
            <ul className="space-y-1">
              <li>• SORA (Specific Operational Risk Assessment) is required for all SFOC applications</li>
              <li>• Determines SAIL level (I-VI) based on Ground Risk Class and Air Risk Class</li>
              <li>• SAIL level determines required OSO (Operational Safety Objectives) robustness</li>
              <li>• Complete all 24 OSOs at the required robustness level for your SAIL</li>
              <li>• Reference: JARUS SORA 2.5, TC Advisory Circular 903-001</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateSORAModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  )
}
