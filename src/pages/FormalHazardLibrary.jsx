/**
 * FormalHazardLibrary.jsx
 * Main FHA Library page with list view, filtering, and CRUD
 *
 * Features:
 * - List/grid view of all FHAs
 * - Filtering by category, status, source, risk level
 * - Search functionality
 * - Create/Edit/Delete FHAs
 * - Risk matrix summary
 * - Field hazard review notifications
 *
 * @location src/pages/FormalHazardLibrary.jsx
 */

import { useState, useEffect, useMemo } from 'react'
import {
  Plus,
  Upload,
  Grid,
  List,
  AlertTriangle,
  FileText,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  Bell,
  Download,
  BarChart3
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import FHACard from '../components/fha/FHACard'
import FHAFilters from '../components/fha/FHAFilters'
import { RiskMatrixDisplay, RiskSummaryStats } from '../components/fha/FHARiskMatrix'
import FHAEditorModal from '../components/fha/FHAEditorModal'
import FHAUploadModal from '../components/fha/FHAUploadModal'
import FHADetailModal from '../components/fha/FHADetailModal'
import FieldHazardReviewPanel from '../components/fha/FieldHazardReviewPanel'
import { getPendingReviewsCount } from '../lib/firestoreFieldHazardReviews'
import {
  getUserFormalHazards,
  getFHAStats,
  deleteFormalHazard,
  seedDefaultFHAs,
  FHA_CATEGORIES
} from '../lib/firestoreFHA'
import { DEFAULT_FHA_TEMPLATES } from '../data/defaultFHATemplates'

export default function FormalHazardLibrary() {
  const { user, userProfile } = useAuth()

  // State
  const [fhas, setFhas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('list') // 'list' | 'grid'
  const [showMatrix, setShowMatrix] = useState(false)
  const [stats, setStats] = useState(null)
  const [seeding, setSeeding] = useState(false)

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    category: null,
    status: null,
    riskLevel: null,
    source: null
  })

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [editingFHA, setEditingFHA] = useState(null)
  const [viewingFHA, setViewingFHA] = useState(null)

  // Field hazard review state
  const [pendingReviews, setPendingReviews] = useState(0)
  const [showReviewPanel, setShowReviewPanel] = useState(false)

  // Load FHAs
  useEffect(() => {
    loadFHAs()
  }, [user])

  const loadFHAs = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const [data, statsData, reviewCount] = await Promise.all([
        getUserFormalHazards(user.uid),
        getFHAStats(user.uid),
        getPendingReviewsCount(user.uid)
      ])
      setFhas(data)
      setStats(statsData)
      setPendingReviews(reviewCount)
    } catch (err) {
      console.error('Error loading FHAs:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Filter FHAs
  const filteredFHAs = useMemo(() => {
    let result = [...fhas]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(fha =>
        fha.title?.toLowerCase().includes(searchLower) ||
        fha.description?.toLowerCase().includes(searchLower) ||
        fha.fhaNumber?.toLowerCase().includes(searchLower) ||
        fha.keywords?.some(k => k.toLowerCase().includes(searchLower))
      )
    }

    // Category filter
    if (filters.category) {
      result = result.filter(fha => fha.category === filters.category)
    }

    // Status filter
    if (filters.status) {
      result = result.filter(fha => fha.status === filters.status)
    }

    // Source filter
    if (filters.source) {
      result = result.filter(fha => fha.source === filters.source)
    }

    // Risk level filter
    if (filters.riskLevel) {
      const riskRanges = {
        low: { min: 1, max: 4 },
        medium: { min: 5, max: 9 },
        high: { min: 10, max: 16 },
        critical: { min: 17, max: 25 }
      }
      const range = riskRanges[filters.riskLevel]
      if (range) {
        result = result.filter(fha =>
          fha.riskScore >= range.min && fha.riskScore <= range.max
        )
      }
    }

    return result
  }, [fhas, filters])

  // Handlers
  const handleSeedDefaults = async () => {
    if (!user) return

    setSeeding(true)
    try {
      const businessDetails = {
        companyName: userProfile?.organization?.name || userProfile?.displayName || 'Your Company',
        contactEmail: userProfile?.email || '',
        contactPhone: userProfile?.phone || '',
        address: userProfile?.organization?.address || ''
      }

      const result = await seedDefaultFHAs(user.uid, businessDetails, DEFAULT_FHA_TEMPLATES)
      console.log('Seeding result:', result)

      await loadFHAs()
    } catch (err) {
      console.error('Error seeding FHAs:', err)
      setError(err.message)
    } finally {
      setSeeding(false)
    }
  }

  const handleDelete = async (fha) => {
    if (!confirm(`Delete "${fha.title}"? This action cannot be undone.`)) {
      return
    }

    try {
      await deleteFormalHazard(fha.id)
      setFhas(prev => prev.filter(f => f.id !== fha.id))
    } catch (err) {
      console.error('Error deleting FHA:', err)
      setError(err.message)
    }
  }

  const handleView = (fha) => {
    setViewingFHA(fha)
  }

  const handleEdit = (fha) => {
    setEditingFHA(fha)
  }

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading FHA Library...</span>
        </div>
      </div>
    )
  }

  // Render empty state
  if (!loading && fhas.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Formal Hazard Assessments</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Your FHA library is empty. Get started by seeding the default FHA templates
            or create your own custom assessments.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleSeedDefaults}
              disabled={seeding}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {seeding ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Seeding {DEFAULT_FHA_TEMPLATES.length} FHAs...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Seed Default FHAs ({DEFAULT_FHA_TEMPLATES.length})
                </>
              )}
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <Plus className="w-5 h-5" />
              Create Custom FHA
            </button>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg text-left max-w-lg mx-auto">
            <h3 className="font-medium text-gray-900 mb-2">Default FHA Library Includes:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              {FHA_CATEGORIES.map(cat => {
                const count = DEFAULT_FHA_TEMPLATES.filter(f => f.category === cat.id).length
                return (
                  <li key={cat.id} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    {cat.name}: {count} FHAs
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-7 h-7 text-amber-600" />
              Formal Hazard Library
            </h1>
            <p className="text-gray-500 mt-1">
              Manage formal hazard assessments for your operations
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Field Hazard Review Badge */}
            {pendingReviews > 0 && (
              <button
                onClick={() => setShowReviewPanel(true)}
                className="relative inline-flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200"
              >
                <Bell className="w-5 h-5" />
                <span className="font-medium">{pendingReviews} Review{pendingReviews !== 1 ? 's' : ''}</span>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingReviews}
                </span>
              </button>
            )}

            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <Upload className="w-5 h-5" />
              Upload
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Create FHA
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="mt-6">
            <RiskSummaryStats fhas={fhas} />
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <FHAFilters
          filters={filters}
          onChange={setFilters}
          counts={stats || {}}
        />
      </div>

      {/* View controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {filteredFHAs.length} of {fhas.length} FHAs
          {filters.search && ` matching "${filters.search}"`}
        </div>

        <div className="flex items-center gap-2">
          {/* Matrix toggle */}
          <button
            onClick={() => setShowMatrix(!showMatrix)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
              showMatrix
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Risk Matrix
            {showMatrix ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* View toggle */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              title="List view"
            >
              <List className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              title="Grid view"
            >
              <Grid className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Refresh */}
          <button
            onClick={loadFHAs}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Risk Matrix (collapsible) */}
      {showMatrix && (
        <div className="animate-in slide-in-from-top-2">
          <RiskMatrixDisplay
            fhas={filteredFHAs}
            onCellClick={(cellData) => {
              console.log('Cell clicked:', cellData)
              // Could filter to show only FHAs in this cell
            }}
          />
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-sm underline mt-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* FHA List/Grid */}
      {filteredFHAs.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No FHAs match your filters</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
          <button
            onClick={() => setFilters({ search: '', category: null, status: null, riskLevel: null, source: null })}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear all filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFHAs.map(fha => (
            <FHACard
              key={fha.id}
              fha={fha}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFHAs.map(fha => (
            <FHACard
              key={fha.id}
              fha={fha}
              compact
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Seed more button if some defaults missing */}
      {fhas.length > 0 && fhas.length < DEFAULT_FHA_TEMPLATES.length && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-blue-800">
              {DEFAULT_FHA_TEMPLATES.length - fhas.length} default FHAs not yet added
            </p>
            <p className="text-sm text-blue-600">
              You can add the remaining default templates to your library
            </p>
          </div>
          <button
            onClick={handleSeedDefaults}
            disabled={seeding}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {seeding ? 'Adding...' : 'Add Missing FHAs'}
          </button>
        </div>
      )}

      {/* FHA Editor Modal - Create */}
      <FHAEditorModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={(savedFHA) => {
          setFhas(prev => [savedFHA, ...prev])
          loadFHAs() // Refresh to get updated stats
        }}
      />

      {/* FHA Editor Modal - Edit */}
      <FHAEditorModal
        isOpen={!!editingFHA}
        onClose={() => setEditingFHA(null)}
        fha={editingFHA}
        onSave={(savedFHA) => {
          setFhas(prev => prev.map(f => f.id === savedFHA.id ? savedFHA : f))
          loadFHAs() // Refresh to get updated stats
        }}
      />

      {/* FHA Upload Modal */}
      <FHAUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={(uploadedFHAs) => {
          setFhas(prev => [...uploadedFHAs, ...prev])
          loadFHAs() // Refresh to get updated stats
        }}
      />

      {/* FHA Detail Modal - View */}
      <FHADetailModal
        isOpen={!!viewingFHA}
        onClose={() => setViewingFHA(null)}
        fha={viewingFHA}
        onEdit={(fha) => {
          setViewingFHA(null)
          setEditingFHA(fha)
        }}
      />

      {/* Field Hazard Review Panel */}
      <FieldHazardReviewPanel
        isOpen={showReviewPanel}
        onClose={() => setShowReviewPanel(false)}
        onReviewComplete={() => {
          loadFHAs() // Refresh FHAs and review count
        }}
      />
    </div>
  )
}
