/**
 * FieldHazardReviewPanel.jsx
 * Panel for reviewing field-submitted hazards
 *
 * Allows safety managers to:
 * - View submitted hazard details
 * - Approve and create new FHA
 * - Link to existing FHA
 * - Reject with feedback
 *
 * @location src/components/fha/FieldHazardReviewPanel.jsx
 */

import { useState, useEffect } from 'react'
import {
  X,
  AlertTriangle,
  MapPin,
  User,
  Calendar,
  Camera,
  CheckCircle,
  Link2,
  XCircle,
  Loader2,
  ChevronRight,
  Clock,
  Flag,
  FileText,
  Search
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useOrganizationContext } from '../../contexts/OrganizationContext'
import {
  getFieldHazardReviews,
  getPendingReviewsCount,
  startReview,
  approveAndCreateFHA,
  linkToExistingFHA,
  rejectFieldHazard,
  REVIEW_STATUSES,
  PRIORITY_LEVELS
} from '../../lib/firestoreFieldHazardReviews'
import {
  getUserFormalHazards,
  FHA_CATEGORIES,
  getRiskLevel
} from '../../lib/firestoreFHA'
import { RiskMatrixSelector } from './FHARiskMatrix'

// Status badge component
function StatusBadge({ status }) {
  const config = REVIEW_STATUSES.find(s => s.id === status) || REVIEW_STATUSES[0]
  const colors = {
    yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800',
    red: 'bg-red-100 text-red-800'
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[config.color] || colors.yellow}`}>
      {config.name}
    </span>
  )
}

// Priority badge component
function PriorityBadge({ priority }) {
  const config = PRIORITY_LEVELS.find(p => p.id === priority) || PRIORITY_LEVELS[1]
  const colors = {
    gray: 'bg-gray-100 text-gray-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    orange: 'bg-orange-100 text-orange-700',
    red: 'bg-red-100 text-red-700'
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${colors[config.color]}`}>
      <Flag className="w-3 h-3" />
      {config.name}
    </span>
  )
}

// Review list item
function ReviewListItem({ review, onClick, isSelected }) {
  const formatDate = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 border-b border-gray-200 hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={review.status} />
            <PriorityBadge priority={review.priority} />
          </div>
          <h4 className="font-medium text-gray-900 truncate">{review.hazardTitle || 'Untitled Hazard'}</h4>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {review.submittedByName || 'Unknown'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(review.submittedAt)}
            </span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
      </div>
    </button>
  )
}

// FHA search result for linking
function FHASearchResult({ fha, onSelect }) {
  const risk = getRiskLevel(fha.riskScore)
  const category = FHA_CATEGORIES.find(c => c.id === fha.category)

  return (
    <button
      onClick={() => onSelect(fha)}
      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-gray-500">{fha.fhaNumber}</span>
            <span className={`px-1.5 py-0.5 rounded text-xs ${risk.bgColor} ${risk.textColor}`}>
              {risk.level}
            </span>
          </div>
          <h5 className="font-medium text-gray-900">{fha.title}</h5>
          <p className="text-xs text-gray-500">{category?.name}</p>
        </div>
        <Link2 className="w-5 h-5 text-blue-500" />
      </div>
    </button>
  )
}

/**
 * Review detail panel
 */
function ReviewDetail({ review, onAction, existingFHAs }) {
  const [action, setAction] = useState(null) // 'approve', 'link', 'reject'
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)

  // Approval form state
  const [fhaTitle, setFhaTitle] = useState(review?.hazardTitle || '')
  const [fhaNumber, setFhaNumber] = useState('')
  const [fhaCategory, setFhaCategory] = useState('flight_ops')
  const [likelihood, setLikelihood] = useState(review?.fieldLikelihood || 3)
  const [severity, setSeverity] = useState(review?.fieldSeverity || 3)

  // Link form state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFHA, setSelectedFHA] = useState(null)
  const [linkNotes, setLinkNotes] = useState('')

  // Reject form state
  const [rejectionReason, setRejectionReason] = useState('')

  if (!review) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Select a review to view details</p>
        </div>
      </div>
    )
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Not set'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const handleApprove = async () => {
    if (!fhaTitle.trim() || !fhaNumber.trim()) {
      setError('Title and FHA Number are required')
      return
    }

    setProcessing(true)
    setError(null)

    try {
      await onAction('approve', {
        title: fhaTitle.trim(),
        fhaNumber: fhaNumber.trim(),
        category: fhaCategory,
        description: review.hazardDescription,
        consequences: review.observedConditions,
        likelihood,
        severity,
        riskScore: likelihood * severity,
        residualLikelihood: Math.max(1, likelihood - 1),
        residualSeverity: Math.max(1, severity - 1),
        residualRiskScore: Math.max(1, likelihood - 1) * Math.max(1, severity - 1),
        controlMeasures: review.suggestedControls?.map(c => ({
          type: 'administrative',
          description: c,
          implemented: false
        })) || [],
        keywords: [],
        regulatoryRefs: []
      })
      setAction(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleLink = async () => {
    if (!selectedFHA) {
      setError('Please select an FHA to link to')
      return
    }

    setProcessing(true)
    setError(null)

    try {
      await onAction('link', {
        fhaId: selectedFHA.id,
        notes: linkNotes
      })
      setAction(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection')
      return
    }

    setProcessing(true)
    setError(null)

    try {
      await onAction('reject', { reason: rejectionReason.trim() })
      setAction(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }

  // Filter FHAs for linking
  const filteredFHAs = existingFHAs.filter(fha => {
    if (!searchQuery) return true
    const search = searchQuery.toLowerCase()
    return (
      fha.title?.toLowerCase().includes(search) ||
      fha.fhaNumber?.toLowerCase().includes(search) ||
      fha.description?.toLowerCase().includes(search)
    )
  }).slice(0, 5)

  const isPending = ['pending', 'in_review'].includes(review.status)

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 mb-2">
          <StatusBadge status={review.status} />
          <PriorityBadge priority={review.priority} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{review.hazardTitle || 'Untitled Hazard'}</h3>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <User className="w-4 h-4" />
            {review.submittedByName}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formatDate(review.submittedAt)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Description */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
          <p className="text-gray-600 whitespace-pre-wrap">
            {review.hazardDescription || 'No description provided'}
          </p>
        </div>

        {/* Location */}
        {review.location && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Location
            </h4>
            <p className="text-gray-600">{review.location}</p>
          </div>
        )}

        {/* Observed Conditions */}
        {review.observedConditions && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Observed Conditions</h4>
            <p className="text-gray-600 whitespace-pre-wrap">{review.observedConditions}</p>
          </div>
        )}

        {/* Field Risk Assessment */}
        {review.fieldRiskScore && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="text-sm font-medium text-amber-800 mb-2">Field Risk Assessment</h4>
            <div className="flex items-center gap-4 text-sm">
              <span>Likelihood: {review.fieldLikelihood}</span>
              <span>Severity: {review.fieldSeverity}</span>
              <span className="font-medium">Score: {review.fieldRiskScore}</span>
            </div>
          </div>
        )}

        {/* Suggested Controls */}
        {review.suggestedControls?.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Suggested Controls</h4>
            <ul className="space-y-1">
              {review.suggestedControls.map((control, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                  {control}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Photos */}
        {review.photos?.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Camera className="w-4 h-4" />
              Photos ({review.photos.length})
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {review.photos.map((photo, i) => (
                <a
                  key={i}
                  href={photo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="aspect-square rounded-lg overflow-hidden bg-gray-100"
                >
                  <img
                    src={photo.url}
                    alt={`Photo ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Review outcome (if completed) */}
        {!isPending && (
          <div className={`p-3 rounded-lg ${
            review.status === 'approved' ? 'bg-green-50 border border-green-200' :
            review.status === 'linked' ? 'bg-purple-50 border border-purple-200' :
            'bg-red-50 border border-red-200'
          }`}>
            <h4 className="text-sm font-medium mb-2">Review Outcome</h4>
            <p className="text-sm text-gray-600">
              Reviewed by {review.reviewedByName} on {formatDate(review.reviewedAt)}
            </p>
            {review.reviewNotes && <p className="text-sm mt-1">{review.reviewNotes}</p>}
            {review.rejectionReason && <p className="text-sm mt-1 text-red-600">{review.rejectionReason}</p>}
          </div>
        )}
      </div>

      {/* Action Buttons (only for pending reviews) */}
      {isPending && !action && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {error}
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => setAction('approve')}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4" />
              Create FHA
            </button>
            <button
              onClick={() => setAction('link')}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Link2 className="w-4 h-4" />
              Link to Existing
            </button>
            <button
              onClick={() => setAction('reject')}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          </div>
        </div>
      )}

      {/* Approve Form */}
      {action === 'approve' && (
        <div className="p-4 border-t border-gray-200 bg-green-50 space-y-4">
          <h4 className="font-medium text-green-800">Create New FHA</h4>

          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">FHA Number *</label>
              <input
                type="text"
                value={fhaNumber}
                onChange={(e) => setFhaNumber(e.target.value)}
                placeholder="e.g., FHA-051"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <select
                value={fhaCategory}
                onChange={(e) => setFhaCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {FHA_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
            <input
              type="text"
              value={fhaTitle}
              onChange={(e) => setFhaTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Risk Assessment</label>
            <RiskMatrixSelector
              likelihood={likelihood}
              severity={severity}
              onChange={({ likelihood: l, severity: s }) => {
                setLikelihood(l)
                setSeverity(s)
              }}
              label={null}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setAction(null)}
              disabled={processing}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleApprove}
              disabled={processing}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {processing ? 'Creating...' : 'Create FHA'}
            </button>
          </div>
        </div>
      )}

      {/* Link Form */}
      {action === 'link' && (
        <div className="p-4 border-t border-gray-200 bg-purple-50 space-y-4">
          <h4 className="font-medium text-purple-800">Link to Existing FHA</h4>

          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search existing FHAs..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {filteredFHAs.map(fha => (
              <FHASearchResult
                key={fha.id}
                fha={fha}
                onSelect={setSelectedFHA}
              />
            ))}
            {filteredFHAs.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No matching FHAs found</p>
            )}
          </div>

          {selectedFHA && (
            <div className="p-3 bg-purple-100 rounded-lg">
              <p className="text-sm font-medium text-purple-800">Selected: {selectedFHA.fhaNumber} - {selectedFHA.title}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea
              value={linkNotes}
              onChange={(e) => setLinkNotes(e.target.value)}
              placeholder="Why is this being linked to the selected FHA?"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setAction(null)
                setSelectedFHA(null)
              }}
              disabled={processing}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleLink}
              disabled={processing || !selectedFHA}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
              {processing ? 'Linking...' : 'Link to FHA'}
            </button>
          </div>
        </div>
      )}

      {/* Reject Form */}
      {action === 'reject' && (
        <div className="p-4 border-t border-gray-200 bg-red-50 space-y-4">
          <h4 className="font-medium text-red-800">Reject Submission</h4>

          {error && (
            <div className="p-2 bg-red-100 border border-red-300 rounded text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Reason for Rejection *</label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why this submission is being rejected..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setAction(null)}
              disabled={processing}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={processing}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              {processing ? 'Rejecting...' : 'Reject Submission'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Main Field Hazard Review Panel
 */
export default function FieldHazardReviewPanel({ isOpen, onClose, onReviewComplete }) {
  const { user, userProfile } = useAuth()
  const { organizationId } = useOrganizationContext()
  const [reviews, setReviews] = useState([])
  const [existingFHAs, setExistingFHAs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReview, setSelectedReview] = useState(null)
  const [filter, setFilter] = useState('pending') // 'pending', 'all', 'completed'

  // Load reviews and FHAs
  useEffect(() => {
    if (isOpen && user && organizationId) {
      loadData()
    }
  }, [isOpen, user, organizationId])

  const loadData = async () => {
    setLoading(true)
    try {
      const [reviewsData, fhasData] = await Promise.all([
        getFieldHazardReviews(organizationId),
        getUserFormalHazards(organizationId)
      ])
      setReviews(reviewsData)
      setExistingFHAs(fhasData)
    } catch (err) {
      console.error('Error loading reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action, data) => {
    if (!selectedReview) return

    const reviewer = {
      uid: user.uid,
      displayName: userProfile?.displayName || userProfile?.firstName || user.email
    }

    if (action === 'approve') {
      await approveAndCreateFHA(selectedReview.id, data, reviewer)
    } else if (action === 'link') {
      await linkToExistingFHA(selectedReview.id, data.fhaId, data.notes, reviewer)
    } else if (action === 'reject') {
      await rejectFieldHazard(selectedReview.id, data.reason, reviewer)
    }

    // Refresh data
    await loadData()
    setSelectedReview(null)
    onReviewComplete?.()
  }

  // Filter reviews
  const filteredReviews = reviews.filter(r => {
    if (filter === 'pending') return ['pending', 'in_review'].includes(r.status)
    if (filter === 'completed') return ['approved', 'linked', 'rejected'].includes(r.status)
    return true
  })

  const pendingCount = reviews.filter(r => ['pending', 'in_review'].includes(r.status)).length

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-4xl bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Field Hazard Reviews
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-sm rounded-full">
                  {pendingCount} pending
                </span>
              )}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Review hazards submitted from the field
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              filter === 'pending'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              filter === 'completed'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              filter === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            All ({reviews.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No {filter} reviews</p>
                <p className="text-sm">
                  {filter === 'pending'
                    ? 'Field hazard submissions will appear here'
                    : 'Completed reviews will appear here'}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Review list */}
              <div className="w-80 border-r border-gray-200 overflow-y-auto">
                {filteredReviews.map(review => (
                  <ReviewListItem
                    key={review.id}
                    review={review}
                    isSelected={selectedReview?.id === review.id}
                    onClick={() => setSelectedReview(review)}
                  />
                ))}
              </div>

              {/* Review detail */}
              <ReviewDetail
                review={selectedReview}
                onAction={handleAction}
                existingFHAs={existingFHAs}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
