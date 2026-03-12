/**
 * FormSubmissions Page
 * List page showing all form submissions with filters and actions
 *
 * @version 1.0.0
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  Search,
  Filter,
  Eye,
  Download,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  ChevronDown,
  MoreVertical,
  GitBranch,
  Plus,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useOrganization } from '../hooks/useOrganization'
import {
  getFormSubmissions,
  deleteFormSubmission,
  getSubmissionCounts,
} from '../lib/firestoreFormSubmissions'
import { FORM_SUBMISSION_STATUS } from '../lib/database-phase4'
import { openPrintPreview } from '../lib/pdfGenerator'
import LoadingSpinner from '../components/LoadingSpinner'

// Status badge component
function StatusBadge({ status }) {
  const config = FORM_SUBMISSION_STATUS[status] || FORM_SUBMISSION_STATUS.draft
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
      {config.label}
    </span>
  )
}

// Status icon component
function StatusIcon({ status }) {
  const iconMap = {
    draft: <Clock className="w-4 h-4 text-gray-500" />,
    submitted: <Send className="w-4 h-4 text-blue-500" />,
    approved: <CheckCircle className="w-4 h-4 text-green-500" />,
    rejected: <XCircle className="w-4 h-4 text-red-500" />,
  }
  return iconMap[status] || iconMap.draft
}

export default function FormSubmissions() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { organization } = useOrganization()

  // State
  const [submissions, setSubmissions] = useState([])
  const [filteredSubmissions, setFilteredSubmissions] = useState([])
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  // Actions
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [showActions, setShowActions] = useState(null)
  const [deleting, setDeleting] = useState(null)

  // Load submissions
  useEffect(() => {
    async function loadData() {
      if (!organization?.id) return

      setLoading(true)
      setError(null)

      try {
        const [subs, counts] = await Promise.all([
          getFormSubmissions(organization.id),
          getSubmissionCounts(organization.id),
        ])
        setSubmissions(subs)
        setCounts(counts)
      } catch (err) {
        console.error('Error loading submissions:', err)
        setError(err.message || 'Failed to load submissions')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [organization?.id])

  // Apply filters
  useEffect(() => {
    let filtered = [...submissions]

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(s =>
        s.formTitle?.toLowerCase().includes(query) ||
        s.formNumber?.toLowerCase().includes(query) ||
        s.createdByName?.toLowerCase().includes(query)
      )
    }

    // Sort
    if (sortBy === 'newest') {
      filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
    } else if (sortBy === 'title') {
      filtered.sort((a, b) => (a.formTitle || '').localeCompare(b.formTitle || ''))
    }

    setFilteredSubmissions(filtered)
  }, [submissions, statusFilter, searchQuery, sortBy])

  // Handle delete
  const handleDelete = async (submission) => {
    if (!window.confirm(`Are you sure you want to delete this submission for "${submission.formTitle}"?`)) {
      return
    }

    setDeleting(submission.id)
    try {
      await deleteFormSubmission(submission.id)
      setSubmissions(submissions.filter(s => s.id !== submission.id))
    } catch (err) {
      console.error('Error deleting submission:', err)
      alert('Failed to delete submission: ' + err.message)
    } finally {
      setDeleting(null)
    }
  }

  // Handle view/edit
  const handleView = (submission) => {
    navigate(`/forms/${submission.formId}/fill?submission=${submission.id}`)
  }

  // Handle print preview
  const handlePrint = (submission) => {
    openPrintPreview({
      title: submission.formTitle,
      formNumber: submission.formNumber,
      template: '', // Would need to load form template
      fieldValues: submission.fieldValues,
      fieldDefinitions: submission.fieldDefinitions,
      metadata: {
        submittedBy: submission.submittedByName || submission.createdByName,
        organization: organization?.name,
      },
    })
  }

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading submissions..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Form Submissions</h1>
          <p className="text-gray-600 mt-1">View and manage all form submissions</p>
        </div>
        <button
          onClick={() => navigate('/forms')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Fill New Form
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{counts.total || 0}</div>
          <div className="text-sm text-gray-500">Total Submissions</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-amber-600">{counts.draft || 0}</div>
          <div className="text-sm text-gray-500">Drafts</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{counts.submitted || 0}</div>
          <div className="text-sm text-gray-500">Submitted</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{counts.approved || 0}</div>
          <div className="text-sm text-gray-500">Approved</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by form title, number, or submitter..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="draft">Drafts</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">By Title</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">Error</p>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Submissions list */}
      {filteredSubmissions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Start by filling out a form template'}
          </p>
          <button
            onClick={() => navigate('/forms')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Fill a Form
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Form
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Workflow
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSubmissions.map((submission) => (
                <tr
                  key={submission.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleView(submission)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {submission.formTitle}
                        </div>
                        {submission.formNumber && (
                          <div className="text-sm text-gray-500">
                            #{submission.formNumber}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={submission.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {submission.createdByName || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {submission.createdAt?.toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {submission.createdAt?.toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {submission.workflowInstanceId ? (
                      <span className="inline-flex items-center gap-1 text-sm text-purple-600">
                        <GitBranch className="w-4 h-4" />
                        In Workflow
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleView(submission)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {submission.pdfUrl && (
                        <a
                          href={submission.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                      {submission.status === 'draft' && (
                        <button
                          onClick={() => handleDelete(submission)}
                          disabled={deleting === submission.id}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
