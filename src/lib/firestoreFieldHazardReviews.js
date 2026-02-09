/**
 * firestoreFieldHazardReviews.js
 * Firestore functions for Field Hazard Review management
 *
 * UPDATED: All queries now require organizationId for Firestore security rules
 *
 * Field hazard reviews are created when field workers identify new hazards
 * during operations using the Field Level Hazard Assessment (FLHA) forms.
 * These submissions are queued for safety manager review and can be:
 * - Approved and added to the formal FHA library
 * - Linked to an existing FHA
 * - Rejected with feedback
 *
 * @location src/lib/firestoreFieldHazardReviews.js
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from './firebase'
import { createFormalHazard } from './firestoreFHA'
import { requireOrgId } from './firestoreQueryUtils'

// ============================================
// COLLECTION REFERENCES
// ============================================

const fieldHazardReviewsRef = collection(db, 'fieldHazardReviews')

// ============================================
// REVIEW STATUS OPTIONS
// ============================================

export const REVIEW_STATUSES = [
  { id: 'pending', name: 'Pending Review', color: 'yellow' },
  { id: 'in_review', name: 'In Review', color: 'blue' },
  { id: 'approved', name: 'Approved', color: 'green' },
  { id: 'linked', name: 'Linked to Existing', color: 'purple' },
  { id: 'rejected', name: 'Rejected', color: 'red' }
]

// ============================================
// PRIORITY LEVELS
// ============================================

export const PRIORITY_LEVELS = [
  { id: 'low', name: 'Low', color: 'gray', description: 'Can be reviewed in normal workflow' },
  { id: 'medium', name: 'Medium', color: 'yellow', description: 'Should be reviewed within a week' },
  { id: 'high', name: 'High', color: 'orange', description: 'Should be reviewed within 48 hours' },
  { id: 'critical', name: 'Critical', color: 'red', description: 'Requires immediate attention' }
]

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Create a new field hazard review from FLHA submission
 * @param {Object} reviewData - The review data
 * @returns {Promise<Object>} Created review with ID
 */
export async function createFieldHazardReview(reviewData) {
  requireOrgId(reviewData.organizationId, 'create field hazard review')

  const docData = {
    // Organization (REQUIRED for security rules)
    organizationId: reviewData.organizationId,
    // Source information
    sourceType: reviewData.sourceType || 'flha', // 'flha', 'incident', 'observation'
    sourceId: reviewData.sourceId || null, // ID of the source form/incident
    projectId: reviewData.projectId || null,
    siteId: reviewData.siteId || null,

    // Hazard details from field
    hazardTitle: reviewData.hazardTitle || '',
    hazardDescription: reviewData.hazardDescription || '',
    location: reviewData.location || '',
    observedConditions: reviewData.observedConditions || '',
    suggestedControls: reviewData.suggestedControls || [],
    photos: reviewData.photos || [],

    // Risk assessment from field (if provided)
    fieldLikelihood: reviewData.fieldLikelihood || null,
    fieldSeverity: reviewData.fieldSeverity || null,
    fieldRiskScore: reviewData.fieldRiskScore || null,

    // Submission info
    submittedBy: reviewData.submittedBy || null,
    submittedByName: reviewData.submittedByName || '',
    submittedAt: serverTimestamp(),

    // Review status
    status: 'pending',
    priority: reviewData.priority || 'medium',

    // Review outcome (filled during review)
    reviewedBy: null,
    reviewedByName: '',
    reviewedAt: null,
    reviewNotes: '',

    // Outcome details
    outcome: null, // 'new_fha', 'linked_fha', 'rejected'
    linkedFHAId: null, // If linked to existing FHA
    createdFHAId: null, // If new FHA was created
    rejectionReason: '',

    // Metadata
    userId: reviewData.userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  const docRef = await addDoc(fieldHazardReviewsRef, docData)
  return { id: docRef.id, ...docData }
}

/**
 * Get all field hazard reviews for an organization
 * @param {string} organizationId - Required for security rules
 * @param {Object} filters - Optional filters (status, userId)
 * @returns {Promise<Array>} Array of reviews
 */
export async function getFieldHazardReviews(organizationId, filters = {}) {
  requireOrgId(organizationId, 'get field hazard reviews')

  let q = query(
    fieldHazardReviewsRef,
    where('organizationId', '==', organizationId),
    orderBy('createdAt', 'desc')
  )

  // Apply status filter
  if (filters.status) {
    q = query(
      fieldHazardReviewsRef,
      where('organizationId', '==', organizationId),
      where('status', '==', filters.status),
      orderBy('createdAt', 'desc')
    )
  }

  const snapshot = await getDocs(q)
  let reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

  // Client-side filter by userId if specified
  if (filters.userId) {
    reviews = reviews.filter(r => r.userId === filters.userId)
  }

  return reviews
}

/**
 * Get pending reviews count for badge display
 * @param {string} organizationId - Required for security rules
 * @returns {Promise<number>} Count of pending reviews
 */
export async function getPendingReviewsCount(organizationId) {
  requireOrgId(organizationId, 'get pending reviews count')

  const q = query(
    fieldHazardReviewsRef,
    where('organizationId', '==', organizationId),
    where('status', 'in', ['pending', 'in_review'])
  )

  const snapshot = await getDocs(q)
  return snapshot.size
}

/**
 * Get a single field hazard review by ID
 * @param {string} reviewId - Review ID
 * @returns {Promise<Object|null>} Review data or null
 */
export async function getFieldHazardReview(reviewId) {
  const docRef = doc(fieldHazardReviewsRef, reviewId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return null
  }

  return { id: docSnap.id, ...docSnap.data() }
}

/**
 * Update a field hazard review
 * @param {string} reviewId - Review ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export async function updateFieldHazardReview(reviewId, updates) {
  const docRef = doc(fieldHazardReviewsRef, reviewId)
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })
}

/**
 * Start reviewing a field hazard
 * @param {string} reviewId - Review ID
 * @param {Object} reviewer - Reviewer info { uid, displayName }
 * @returns {Promise<void>}
 */
export async function startReview(reviewId, reviewer) {
  await updateFieldHazardReview(reviewId, {
    status: 'in_review',
    reviewedBy: reviewer.uid,
    reviewedByName: reviewer.displayName || reviewer.email || ''
  })
}

/**
 * Approve and create new FHA from field submission
 * @param {string} reviewId - Review ID
 * @param {Object} fhaData - FHA data to create
 * @param {Object} reviewer - Reviewer info
 * @returns {Promise<Object>} Created FHA
 */
export async function approveAndCreateFHA(reviewId, fhaData, reviewer) {
  // Create the new FHA
  const newFHA = await createFormalHazard({
    ...fhaData,
    source: 'field_triggered',
    fieldReviewId: reviewId
  }, reviewer.uid)

  // Update the review
  await updateFieldHazardReview(reviewId, {
    status: 'approved',
    outcome: 'new_fha',
    createdFHAId: newFHA.id,
    reviewedBy: reviewer.uid,
    reviewedByName: reviewer.displayName || reviewer.email || '',
    reviewedAt: serverTimestamp()
  })

  return newFHA
}

/**
 * Link field submission to existing FHA
 * @param {string} reviewId - Review ID
 * @param {string} fhaId - Existing FHA ID to link to
 * @param {string} notes - Review notes
 * @param {Object} reviewer - Reviewer info
 * @returns {Promise<void>}
 */
export async function linkToExistingFHA(reviewId, fhaId, notes, reviewer) {
  await updateFieldHazardReview(reviewId, {
    status: 'linked',
    outcome: 'linked_fha',
    linkedFHAId: fhaId,
    reviewNotes: notes,
    reviewedBy: reviewer.uid,
    reviewedByName: reviewer.displayName || reviewer.email || '',
    reviewedAt: serverTimestamp()
  })
}

/**
 * Reject a field hazard submission
 * @param {string} reviewId - Review ID
 * @param {string} reason - Rejection reason
 * @param {Object} reviewer - Reviewer info
 * @returns {Promise<void>}
 */
export async function rejectFieldHazard(reviewId, reason, reviewer) {
  await updateFieldHazardReview(reviewId, {
    status: 'rejected',
    outcome: 'rejected',
    rejectionReason: reason,
    reviewedBy: reviewer.uid,
    reviewedByName: reviewer.displayName || reviewer.email || '',
    reviewedAt: serverTimestamp()
  })
}

/**
 * Delete a field hazard review
 * @param {string} reviewId - Review ID
 * @returns {Promise<void>}
 */
export async function deleteFieldHazardReview(reviewId) {
  const docRef = doc(fieldHazardReviewsRef, reviewId)
  await deleteDoc(docRef)
}

/**
 * Get review statistics
 * @param {string} organizationId - Required for security rules
 * @returns {Promise<Object>} Review statistics
 */
export async function getReviewStats(organizationId) {
  const reviews = await getFieldHazardReviews(organizationId)

  const stats = {
    total: reviews.length,
    pending: 0,
    inReview: 0,
    approved: 0,
    linked: 0,
    rejected: 0,
    byPriority: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    },
    recentSubmissions: []
  }

  reviews.forEach(review => {
    // Count by status
    switch (review.status) {
      case 'pending':
        stats.pending++
        break
      case 'in_review':
        stats.inReview++
        break
      case 'approved':
        stats.approved++
        break
      case 'linked':
        stats.linked++
        break
      case 'rejected':
        stats.rejected++
        break
    }

    // Count by priority (only for pending/in_review)
    if (['pending', 'in_review'].includes(review.status)) {
      if (review.priority && stats.byPriority[review.priority] !== undefined) {
        stats.byPriority[review.priority]++
      }
    }
  })

  // Get 5 most recent pending submissions
  stats.recentSubmissions = reviews
    .filter(r => ['pending', 'in_review'].includes(r.status))
    .slice(0, 5)

  return stats
}

/**
 * Get field hazard reviews by project
 * @param {string} organizationId - Required for security rules
 * @param {string} projectId - Project ID
 * @returns {Promise<Array>} Array of reviews
 */
export async function getReviewsByProject(organizationId, projectId) {
  requireOrgId(organizationId, 'get reviews by project')

  const q = query(
    fieldHazardReviewsRef,
    where('organizationId', '==', organizationId),
    where('projectId', '==', projectId),
    orderBy('createdAt', 'desc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Search field hazard reviews
 * @param {string} organizationId - Required for security rules
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} Matching reviews
 */
export async function searchFieldHazardReviews(organizationId, searchTerm) {
  // Get all reviews first (Firestore doesn't support full-text search)
  const reviews = await getFieldHazardReviews(organizationId)

  if (!searchTerm) return reviews

  const searchLower = searchTerm.toLowerCase()
  return reviews.filter(review =>
    review.hazardTitle?.toLowerCase().includes(searchLower) ||
    review.hazardDescription?.toLowerCase().includes(searchLower) ||
    review.location?.toLowerCase().includes(searchLower) ||
    review.submittedByName?.toLowerCase().includes(searchLower)
  )
}
