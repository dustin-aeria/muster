/**
 * Firestore Form Submissions Operations
 * CRUD operations for fillable form submissions
 *
 * @version 1.0.0
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
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import { COLLECTIONS, FORM_SUBMISSION_STATUS } from './database-phase4'

// ============================================
// COLLECTION REFERENCE
// ============================================

const formSubmissionsRef = collection(db, COLLECTIONS.FORM_SUBMISSIONS)

// ============================================
// ERROR HANDLING HELPER
// ============================================

async function withErrorHandling(operation, operationName) {
  try {
    return await operation()
  } catch (error) {
    const enhancedError = new Error(`${operationName} failed: ${error.message}`)
    enhancedError.originalError = error
    enhancedError.operationName = operationName
    throw enhancedError
  }
}

// ============================================
// FORM SUBMISSIONS CRUD
// ============================================

/**
 * Get all form submissions for an organization
 * @param {string} organizationId - Organization ID
 * @param {Object} filters - Optional filters
 * @param {string} [filters.formId] - Filter by source form ID
 * @param {string} [filters.status] - Filter by status
 * @param {string} [filters.createdBy] - Filter by creator
 * @returns {Promise<Array>} Array of form submissions
 */
export async function getFormSubmissions(organizationId, filters = {}) {
  return withErrorHandling(async () => {
    let q = query(
      formSubmissionsRef,
      where('organizationId', '==', organizationId),
      orderBy('createdAt', 'desc')
    )

    const snapshot = await getDocs(q)
    let submissions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      submittedAt: doc.data().submittedAt?.toDate(),
      pdfGeneratedAt: doc.data().pdfGeneratedAt?.toDate(),
    }))

    // Apply client-side filters (Firestore has limitations on multiple where clauses)
    if (filters.formId) {
      submissions = submissions.filter(s => s.formId === filters.formId)
    }
    if (filters.status) {
      submissions = submissions.filter(s => s.status === filters.status)
    }
    if (filters.createdBy) {
      submissions = submissions.filter(s => s.createdBy === filters.createdBy)
    }

    return submissions
  }, 'getFormSubmissions')
}

/**
 * Get a single form submission by ID
 * @param {string} submissionId - Submission document ID
 * @returns {Promise<Object|null>} Form submission or null
 */
export async function getFormSubmission(submissionId) {
  return withErrorHandling(async () => {
    const docRef = doc(formSubmissionsRef, submissionId)
    const snapshot = await getDoc(docRef)

    if (!snapshot.exists()) {
      return null
    }

    const data = snapshot.data()
    return {
      id: snapshot.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
      submittedAt: data.submittedAt?.toDate(),
      pdfGeneratedAt: data.pdfGeneratedAt?.toDate(),
    }
  }, 'getFormSubmission')
}

/**
 * Create a new form submission
 * @param {Object} submission - Submission data
 * @param {string} submission.formId - Source form/document ID
 * @param {string} submission.formTitle - Form title
 * @param {string} [submission.formNumber] - Form number
 * @param {string} submission.organizationId - Organization ID
 * @param {Object} submission.fieldValues - Field values object
 * @param {Array} submission.fieldDefinitions - Field definitions
 * @param {string} submission.createdBy - User ID
 * @param {string} submission.createdByName - User display name
 * @returns {Promise<Object>} Created submission with ID
 */
export async function createFormSubmission(submission) {
  return withErrorHandling(async () => {
    const now = serverTimestamp()

    const docData = {
      formId: submission.formId,
      formTitle: submission.formTitle,
      formNumber: submission.formNumber || null,
      organizationId: submission.organizationId,
      fieldValues: submission.fieldValues || {},
      fieldDefinitions: submission.fieldDefinitions || [],
      status: 'draft',
      submittedAt: null,
      submittedBy: null,
      submittedByName: null,
      pdfUrl: null,
      pdfGeneratedAt: null,
      driveFileId: null,
      driveFileUrl: null,
      workflowInstanceId: null,
      createdAt: now,
      createdBy: submission.createdBy,
      createdByName: submission.createdByName,
      updatedAt: now,
    }

    const docRef = await addDoc(formSubmissionsRef, docData)

    return {
      id: docRef.id,
      ...docData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }, 'createFormSubmission')
}

/**
 * Update a form submission
 * @param {string} submissionId - Submission ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export async function updateFormSubmission(submissionId, updates) {
  return withErrorHandling(async () => {
    const docRef = doc(formSubmissionsRef, submissionId)

    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    })
  }, 'updateFormSubmission')
}

/**
 * Submit a form (change status from draft to submitted)
 * @param {string} submissionId - Submission ID
 * @param {string} userId - User ID submitting
 * @param {string} userName - User display name
 * @returns {Promise<void>}
 */
export async function submitFormSubmission(submissionId, userId, userName) {
  return withErrorHandling(async () => {
    const docRef = doc(formSubmissionsRef, submissionId)

    await updateDoc(docRef, {
      status: 'submitted',
      submittedAt: serverTimestamp(),
      submittedBy: userId,
      submittedByName: userName,
      updatedAt: serverTimestamp(),
    })
  }, 'submitFormSubmission')
}

/**
 * Approve a form submission
 * @param {string} submissionId - Submission ID
 * @param {string} userId - Approver user ID
 * @param {string} [comment] - Optional comment
 * @returns {Promise<void>}
 */
export async function approveFormSubmission(submissionId, userId, comment = null) {
  return withErrorHandling(async () => {
    const docRef = doc(formSubmissionsRef, submissionId)

    const updates = {
      status: 'approved',
      approvedAt: serverTimestamp(),
      approvedBy: userId,
      updatedAt: serverTimestamp(),
    }

    if (comment) {
      updates.approvalComment = comment
    }

    await updateDoc(docRef, updates)
  }, 'approveFormSubmission')
}

/**
 * Reject a form submission
 * @param {string} submissionId - Submission ID
 * @param {string} userId - Rejector user ID
 * @param {string} reason - Rejection reason
 * @returns {Promise<void>}
 */
export async function rejectFormSubmission(submissionId, userId, reason) {
  return withErrorHandling(async () => {
    const docRef = doc(formSubmissionsRef, submissionId)

    await updateDoc(docRef, {
      status: 'rejected',
      rejectedAt: serverTimestamp(),
      rejectedBy: userId,
      rejectionReason: reason,
      updatedAt: serverTimestamp(),
    })
  }, 'rejectFormSubmission')
}

/**
 * Update PDF info for a submission
 * @param {string} submissionId - Submission ID
 * @param {string} pdfUrl - URL to generated PDF
 * @returns {Promise<void>}
 */
export async function updateSubmissionPdf(submissionId, pdfUrl) {
  return withErrorHandling(async () => {
    const docRef = doc(formSubmissionsRef, submissionId)

    await updateDoc(docRef, {
      pdfUrl,
      pdfGeneratedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }, 'updateSubmissionPdf')
}

/**
 * Update Google Drive info for a submission
 * @param {string} submissionId - Submission ID
 * @param {string} driveFileId - Google Drive file ID
 * @param {string} driveFileUrl - Google Drive URL
 * @returns {Promise<void>}
 */
export async function updateSubmissionDriveInfo(submissionId, driveFileId, driveFileUrl) {
  return withErrorHandling(async () => {
    const docRef = doc(formSubmissionsRef, submissionId)

    await updateDoc(docRef, {
      driveFileId,
      driveFileUrl,
      updatedAt: serverTimestamp(),
    })
  }, 'updateSubmissionDriveInfo')
}

/**
 * Link a workflow instance to a submission
 * @param {string} submissionId - Submission ID
 * @param {string} workflowInstanceId - Workflow instance ID
 * @returns {Promise<void>}
 */
export async function linkWorkflowToSubmission(submissionId, workflowInstanceId) {
  return withErrorHandling(async () => {
    const docRef = doc(formSubmissionsRef, submissionId)

    await updateDoc(docRef, {
      workflowInstanceId,
      updatedAt: serverTimestamp(),
    })
  }, 'linkWorkflowToSubmission')
}

/**
 * Delete a form submission
 * @param {string} submissionId - Submission ID
 * @returns {Promise<void>}
 */
export async function deleteFormSubmission(submissionId) {
  return withErrorHandling(async () => {
    const docRef = doc(formSubmissionsRef, submissionId)
    await deleteDoc(docRef)
  }, 'deleteFormSubmission')
}

/**
 * Get submissions for a specific form template
 * @param {string} organizationId - Organization ID
 * @param {string} formId - Form/document ID
 * @returns {Promise<Array>} Array of submissions
 */
export async function getSubmissionsForForm(organizationId, formId) {
  return getFormSubmissions(organizationId, { formId })
}

/**
 * Get user's draft submissions
 * @param {string} organizationId - Organization ID
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of draft submissions
 */
export async function getUserDraftSubmissions(organizationId, userId) {
  return withErrorHandling(async () => {
    const q = query(
      formSubmissionsRef,
      where('organizationId', '==', organizationId),
      where('createdBy', '==', userId),
      where('status', '==', 'draft'),
      orderBy('updatedAt', 'desc')
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    }))
  }, 'getUserDraftSubmissions')
}

/**
 * Get submission counts by status
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Count by status
 */
export async function getSubmissionCounts(organizationId) {
  return withErrorHandling(async () => {
    const submissions = await getFormSubmissions(organizationId)

    const counts = {
      total: submissions.length,
      draft: 0,
      submitted: 0,
      approved: 0,
      rejected: 0,
    }

    for (const submission of submissions) {
      if (counts[submission.status] !== undefined) {
        counts[submission.status]++
      }
    }

    return counts
  }, 'getSubmissionCounts')
}
