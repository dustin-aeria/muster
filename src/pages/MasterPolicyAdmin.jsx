/**
 * MasterPolicyAdmin.jsx
 * Platform admin interface for managing master policies
 *
 * Features:
 * - Full CRUD for master policies
 * - Version tracking with history
 * - Publish/Archive workflow
 * - Migration from JS files
 *
 * @location src/pages/MasterPolicyAdmin.jsx
 */

import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Shield,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Upload,
  Download,
  History,
  Check,
  X,
  AlertCircle,
  Loader2,
  ChevronRight,
  FileText,
  Plane,
  Users,
  HardHat,
  RefreshCw,
  Archive,
  Send
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { usePolicyPermissions } from '../hooks/usePolicyPermissions'
import { logger } from '../lib/logger'
import {
  getMasterPolicies,
  getMasterPolicy,
  createMasterPolicy,
  updateMasterPolicy,
  deleteMasterPolicy,
  publishMasterPolicy,
  archiveMasterPolicy,
  getMasterPolicyVersions,
  getMasterPolicyStats,
  seedMasterPoliciesFromJS
} from '../lib/firestoreMasterPolicies'
import { POLICIES } from '../components/PolicyLibrary'
import { POLICY_CONTENT } from '../data/policyContent'

// Category configuration
const CATEGORIES = {
  rpas: { name: 'RPAS Operations', icon: Plane, color: 'blue' },
  crm: { name: 'Crew Resource Management', icon: Users, color: 'purple' },
  hse: { name: 'Health, Safety & Environment', icon: HardHat, color: 'green' }
}

// Status badge component
function StatusBadge({ status }) {
  const styles = {
    draft: 'bg-gray-100 text-gray-700 border-gray-300',
    published: 'bg-green-100 text-green-700 border-green-300',
    archived: 'bg-amber-100 text-amber-700 border-amber-300'
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${styles[status] || styles.draft}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

// Master Policy Editor Modal
function MasterPolicyEditorModal({ policy, onSave, onClose, saving }) {
  const [formData, setFormData] = useState({
    number: policy?.number || '',
    title: policy?.title || '',
    category: policy?.category || 'rpas',
    description: policy?.description || '',
    owner: policy?.metadata?.owner || '',
    keywords: policy?.metadata?.keywords?.join(', ') || '',
    regulatoryRefs: policy?.metadata?.regulatoryRefs?.join(', ') || '',
    effectiveDate: policy?.metadata?.effectiveDate || '',
    reviewDate: policy?.metadata?.reviewDate || ''
  })
  const [changeNotes, setChangeNotes] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...formData,
      keywords: formData.keywords.split(',').map(k => k.trim()).filter(Boolean),
      regulatoryRefs: formData.regulatoryRefs.split(',').map(r => r.trim()).filter(Boolean),
      metadata: {
        owner: formData.owner,
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(Boolean),
        regulatoryRefs: formData.regulatoryRefs.split(',').map(r => r.trim()).filter(Boolean),
        effectiveDate: formData.effectiveDate,
        reviewDate: formData.reviewDate
      }
    }, changeNotes)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {policy ? 'Edit Master Policy' : 'Create Master Policy'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Policy Number *
              </label>
              <input
                type="text"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 1001"
                required
                disabled={!!policy}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {Object.entries(CATEGORIES).map(([id, cat]) => (
                  <option key={id} value={id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Policy title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Brief description of the policy"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Owner
              </label>
              <input
                type="text"
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Operations Manager"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keywords
              </label>
              <input
                type="text"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="comma, separated, keywords"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Regulatory References
            </label>
            <input
              type="text"
              value={formData.regulatoryRefs}
              onChange={(e) => setFormData({ ...formData, regulatoryRefs: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="CARs 901, OH&S Act, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Effective Date
              </label>
              <input
                type="date"
                value={formData.effectiveDate}
                onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Review Date
              </label>
              <input
                type="date"
                value={formData.reviewDate}
                onChange={(e) => setFormData({ ...formData, reviewDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {policy && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Change Notes
              </label>
              <textarea
                value={changeNotes}
                onChange={(e) => setChangeNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Describe what changed in this update"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {policy ? 'Update Policy' : 'Create Policy'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Version History Modal
function VersionHistoryModal({ policy, onClose }) {
  const [versions, setVersions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVersions()
  }, [policy.id])

  const loadVersions = async () => {
    try {
      const data = await getMasterPolicyVersions(policy.id)
      setVersions(data)
    } catch (err) {
      logger.error('Error loading versions:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Version History - {policy.number}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : versions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No version history available</p>
          ) : (
            <div className="space-y-4">
              {versions.map((version) => (
                <div key={version.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Version {version.version}</span>
                    <span className="text-sm text-gray-500">
                      {version.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown date'}
                    </span>
                  </div>
                  {version.changeNotes && (
                    <p className="text-sm text-gray-600">{version.changeNotes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Migration Modal
function MigrationModal({ onClose, onMigrate, migrating, migrationResult }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Migrate from JS Files
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg" disabled={migrating}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {migrationResult ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <Check className="w-5 h-5" />
                <span className="font-medium">Migration Complete</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-sm">
                <p>Created: {migrationResult.created} policies</p>
                <p>Skipped: {migrationResult.skipped} (already exist)</p>
                {migrationResult.errors?.length > 0 && (
                  <div className="mt-2 text-red-600">
                    <p>Errors: {migrationResult.errors.length}</p>
                    <ul className="list-disc list-inside">
                      {migrationResult.errors.slice(0, 5).map((err, i) => (
                        <li key={i}>{err.number}: {err.error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">
                This will import policies from the hardcoded JS files (POLICIES array and POLICY_CONTENT)
                into the masterPolicies collection. Existing policies will be skipped.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-700">
                <p className="font-medium">Note:</p>
                <p>This is a one-time migration operation. New policies will be created as published
                and ready for operators to seed from.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  disabled={migrating}
                >
                  Cancel
                </button>
                <button
                  onClick={onMigrate}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                  disabled={migrating}
                >
                  {migrating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Migrating...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Start Migration
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Delete Confirmation Modal
function DeleteConfirmModal({ policy, onConfirm, onCancel, deleting }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-full">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Delete Master Policy</h3>
        </div>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <strong>{policy.number} - {policy.title}</strong>?
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} disabled={deleting} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Policy'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Main Component
export default function MasterPolicyAdmin() {
  const navigate = useNavigate()
  const { user, userProfile } = useAuth()
  const permissions = usePolicyPermissions()

  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState(null)
  const [statusFilter, setStatusFilter] = useState(null)
  const [stats, setStats] = useState(null)

  // Modal states
  const [showEditor, setShowEditor] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(null)
  const [showMigration, setShowMigration] = useState(false)
  const [migrating, setMigrating] = useState(false)
  const [migrationResult, setMigrationResult] = useState(null)
  const [deletingPolicy, setDeletingPolicy] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Check platform admin access
  useEffect(() => {
    if (!permissions.isPlatformAdmin && !loading) {
      navigate('/policies')
    }
  }, [permissions.isPlatformAdmin, loading, navigate])

  // Load policies
  useEffect(() => {
    loadPolicies()
    loadStats()
  }, [])

  const loadPolicies = async () => {
    try {
      setError('')
      const data = await getMasterPolicies()
      setPolicies(data)
    } catch (err) {
      setError('Failed to load master policies')
      logger.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await getMasterPolicyStats()
      setStats(data)
    } catch (err) {
      logger.error('Error loading stats:', err)
    }
  }

  // Filter policies
  const filteredPolicies = useMemo(() => {
    let result = [...policies]

    if (categoryFilter) {
      result = result.filter(p => p.category === categoryFilter)
    }

    if (statusFilter) {
      result = result.filter(p => p.status === statusFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.number?.includes(query) ||
        p.title?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      )
    }

    return result
  }, [policies, searchQuery, categoryFilter, statusFilter])

  // Handlers
  const handleSavePolicy = async (data, changeNotes) => {
    setSaving(true)
    try {
      if (editingPolicy) {
        await updateMasterPolicy(editingPolicy.id, data, changeNotes, user.uid)
      } else {
        await createMasterPolicy(data, user.uid)
      }
      await loadPolicies()
      await loadStats()
      setShowEditor(false)
      setEditingPolicy(null)
    } catch (err) {
      setError(err.message || 'Failed to save policy')
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async (policy) => {
    try {
      await publishMasterPolicy(policy.id, user.uid)
      await loadPolicies()
      await loadStats()
    } catch (err) {
      setError(err.message || 'Failed to publish policy')
    }
  }

  const handleArchive = async (policy) => {
    try {
      await archiveMasterPolicy(policy.id, user.uid)
      await loadPolicies()
      await loadStats()
    } catch (err) {
      setError(err.message || 'Failed to archive policy')
    }
  }

  const handleDelete = async () => {
    if (!deletingPolicy) return
    setIsDeleting(true)
    try {
      await deleteMasterPolicy(deletingPolicy.id)
      await loadPolicies()
      await loadStats()
      setDeletingPolicy(null)
    } catch (err) {
      setError(err.message || 'Failed to delete policy')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleMigration = async () => {
    setMigrating(true)
    try {
      const result = await seedMasterPoliciesFromJS(POLICIES, POLICY_CONTENT, user.uid)
      setMigrationResult(result)
      await loadPolicies()
      await loadStats()
    } catch (err) {
      setError(err.message || 'Migration failed')
    } finally {
      setMigrating(false)
    }
  }

  // Access denied
  if (!permissions.isPlatformAdmin && !loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500">You must be a platform admin to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto p-1 hover:bg-red-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Shield className="w-7 h-7 text-blue-600" />
              Master Policy Administration
            </h1>
            <p className="text-gray-500 mt-1">
              Manage platform-wide master policies that operators can adopt
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMigration(true)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Migrate from JS
            </button>
            <button
              onClick={() => {
                setEditingPolicy(null)
                setShowEditor(true)
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Master Policy
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div className="text-center border-l border-gray-200 pl-6">
              <p className="text-2xl font-bold text-green-600">{stats.byStatus.published}</p>
              <p className="text-xs text-gray-500">Published</p>
            </div>
            <div className="text-center border-l border-gray-200 pl-6">
              <p className="text-2xl font-bold text-gray-600">{stats.byStatus.draft}</p>
              <p className="text-xs text-gray-500">Draft</p>
            </div>
            <div className="text-center border-l border-gray-200 pl-6">
              <p className="text-2xl font-bold text-amber-600">{stats.byStatus.archived}</p>
              <p className="text-xs text-gray-500">Archived</p>
            </div>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
            <label htmlFor="master-policy-search" className="sr-only">Search master policies</label>
            <input
              id="master-policy-search"
              type="search"
              placeholder="Search master policies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <label htmlFor="master-policy-category-filter" className="sr-only">Filter by category</label>
          <select
            id="master-policy-category-filter"
            value={categoryFilter || ''}
            onChange={(e) => setCategoryFilter(e.target.value || null)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {Object.entries(CATEGORIES).map(([id, cat]) => (
              <option key={id} value={id}>{cat.name}</option>
            ))}
          </select>

          <select
            value={statusFilter || ''}
            onChange={(e) => setStatusFilter(e.target.value || null)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>

          <button
            onClick={loadPolicies}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Policy List */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading master policies...</p>
        </div>
      ) : filteredPolicies.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No master policies found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || categoryFilter || statusFilter
              ? 'Try adjusting your filters'
              : 'Get started by migrating from JS files or creating a new policy'}
          </p>
          {!searchQuery && !categoryFilter && !statusFilter && (
            <button
              onClick={() => setShowMigration(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Migrate from JS Files
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Number</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Version</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPolicies.map((policy) => {
                const category = CATEGORIES[policy.category] || CATEGORIES.rpas
                const CategoryIcon = category.icon

                return (
                  <tr key={policy.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded text-sm font-bold bg-${category.color}-100 text-${category.color}-700`}>
                        {policy.number}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{policy.title}</p>
                        <p className="text-sm text-gray-500 truncate max-w-md">{policy.description}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                        <CategoryIcon className="w-4 h-4" />
                        {category.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      v{policy.version}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={policy.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setShowVersionHistory(policy)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                          title="Version History"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingPolicy(policy)
                            setShowEditor(true)
                          }}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {policy.status === 'draft' && (
                          <button
                            onClick={() => handlePublish(policy)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Publish"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        {policy.status === 'published' && (
                          <button
                            onClick={() => handleArchive(policy)}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                            title="Archive"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                        {policy.status === 'draft' && !policy.publishedAt && (
                          <button
                            onClick={() => setDeletingPolicy(policy)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {showEditor && (
        <MasterPolicyEditorModal
          policy={editingPolicy}
          onSave={handleSavePolicy}
          onClose={() => {
            setShowEditor(false)
            setEditingPolicy(null)
          }}
          saving={saving}
        />
      )}

      {showVersionHistory && (
        <VersionHistoryModal
          policy={showVersionHistory}
          onClose={() => setShowVersionHistory(null)}
        />
      )}

      {showMigration && (
        <MigrationModal
          onClose={() => {
            setShowMigration(false)
            setMigrationResult(null)
          }}
          onMigrate={handleMigration}
          migrating={migrating}
          migrationResult={migrationResult}
        />
      )}

      {deletingPolicy && (
        <DeleteConfirmModal
          policy={deletingPolicy}
          onConfirm={handleDelete}
          onCancel={() => setDeletingPolicy(null)}
          deleting={isDeleting}
        />
      )}
    </div>
  )
}
