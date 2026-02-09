/**
 * Firestore Comments/Activity Service
 * Handles project comments and activity tracking for team collaboration
 *
 * UPDATED: All queries now require organizationId for Firestore security rules
 *
 * @location src/lib/firestoreComments.js
 */

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore'
import { db } from './firebase'
import { requireOrgId } from './firestoreQueryUtils'

// ============================================
// CONSTANTS
// ============================================

export const COMMENT_TYPES = {
  comment: { label: 'Comment', icon: 'MessageSquare', color: 'bg-blue-100 text-blue-800' },
  note: { label: 'Note', icon: 'FileText', color: 'bg-yellow-100 text-yellow-800' },
  question: { label: 'Question', icon: 'HelpCircle', color: 'bg-purple-100 text-purple-800' },
  action: { label: 'Action Item', icon: 'CheckSquare', color: 'bg-green-100 text-green-800' },
  issue: { label: 'Issue', icon: 'AlertCircle', color: 'bg-red-100 text-red-800' }
}

export const ACTIVITY_TYPES = {
  created: { label: 'Created', icon: 'Plus', verb: 'created' },
  updated: { label: 'Updated', icon: 'Edit', verb: 'updated' },
  status_change: { label: 'Status Change', icon: 'RefreshCw', verb: 'changed status of' },
  assigned: { label: 'Assigned', icon: 'UserPlus', verb: 'assigned' },
  commented: { label: 'Commented', icon: 'MessageSquare', verb: 'commented on' },
  uploaded: { label: 'Uploaded', icon: 'Upload', verb: 'uploaded a file to' },
  completed: { label: 'Completed', icon: 'CheckCircle', verb: 'completed' }
}

// ============================================
// COMMENTS CRUD
// ============================================

/**
 * Create a new comment on a project or entity
 */
export async function createComment(commentData) {
  requireOrgId(commentData.organizationId, 'create comment')

  const comment = {
    entityType: commentData.entityType || 'project', // project, incident, capa, etc.
    entityId: commentData.entityId,
    organizationId: commentData.organizationId,
    type: commentData.type || 'comment',
    content: commentData.content,
    authorId: commentData.authorId,
    authorName: commentData.authorName,
    authorEmail: commentData.authorEmail,
    mentions: commentData.mentions || [], // Array of user IDs mentioned
    attachments: commentData.attachments || [],
    parentId: commentData.parentId || null, // For threaded replies
    isResolved: false,
    isPinned: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  const docRef = await addDoc(collection(db, 'comments'), comment)

  // Also log as activity
  await logActivity({
    entityType: comment.entityType,
    entityId: comment.entityId,
    organizationId: comment.organizationId,
    type: 'commented',
    actorId: comment.authorId,
    actorName: comment.authorName,
    description: `Added a ${COMMENT_TYPES[comment.type]?.label?.toLowerCase() || 'comment'}`
  })

  return { id: docRef.id, ...comment }
}

/**
 * Get comments for an entity
 * @param {string} organizationId - Required for security rules
 * @param {string} entityType - Type of entity (project, incident, etc.)
 * @param {string} entityId - ID of the entity
 * @param {Object} options - Query options
 */
export async function getComments(organizationId, entityType, entityId, options = {}) {
  requireOrgId(organizationId, 'get comments')

  const { includeResolved = true, pinnedFirst = true } = options

  const q = query(
    collection(db, 'comments'),
    where('organizationId', '==', organizationId),
    where('entityType', '==', entityType),
    where('entityId', '==', entityId),
    orderBy('createdAt', 'desc')
  )

  const snapshot = await getDocs(q)
  let comments = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate()
  }))

  // Filter resolved if needed
  if (!includeResolved) {
    comments = comments.filter(c => !c.isResolved)
  }

  // Sort pinned first
  if (pinnedFirst) {
    comments.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return 0
    })
  }

  return comments
}

/**
 * Subscribe to comments for real-time updates
 * @param {string} organizationId - Required for security rules
 * @param {string} entityType - Type of entity
 * @param {string} entityId - ID of the entity
 * @param {Function} callback - Callback function for updates
 */
export function subscribeToComments(organizationId, entityType, entityId, callback) {
  requireOrgId(organizationId, 'subscribe to comments')

  const q = query(
    collection(db, 'comments'),
    where('organizationId', '==', organizationId),
    where('entityType', '==', entityType),
    where('entityId', '==', entityId),
    orderBy('createdAt', 'desc')
  )

  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    }))
    callback(comments)
  })
}

/**
 * Update a comment
 */
export async function updateComment(commentId, updates) {
  const commentRef = doc(db, 'comments', commentId)
  await updateDoc(commentRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId) {
  await deleteDoc(doc(db, 'comments', commentId))
}

/**
 * Toggle comment resolved status
 */
export async function toggleCommentResolved(commentId, isResolved, resolvedBy = null) {
  await updateComment(commentId, {
    isResolved,
    resolvedAt: isResolved ? serverTimestamp() : null,
    resolvedBy: isResolved ? resolvedBy : null
  })
}

/**
 * Toggle comment pinned status
 */
export async function toggleCommentPinned(commentId, isPinned) {
  await updateComment(commentId, { isPinned })
}

// ============================================
// ACTIVITY LOG
// ============================================

/**
 * Log an activity
 */
export async function logActivity(activityData) {
  requireOrgId(activityData.organizationId, 'log activity')

  const activity = {
    entityType: activityData.entityType,
    entityId: activityData.entityId,
    organizationId: activityData.organizationId,
    type: activityData.type,
    actorId: activityData.actorId,
    actorName: activityData.actorName,
    description: activityData.description,
    metadata: activityData.metadata || {},
    createdAt: serverTimestamp()
  }

  const docRef = await addDoc(collection(db, 'activities'), activity)
  return { id: docRef.id, ...activity }
}

/**
 * Get activity log for an entity
 * @param {string} organizationId - Required for security rules
 * @param {string} entityType - Type of entity
 * @param {string} entityId - ID of the entity
 * @param {number} limit - Max number of results
 */
export async function getActivityLog(organizationId, entityType, entityId, limit = 50) {
  requireOrgId(organizationId, 'get activity log')

  const q = query(
    collection(db, 'activities'),
    where('organizationId', '==', organizationId),
    where('entityType', '==', entityType),
    where('entityId', '==', entityId),
    orderBy('createdAt', 'desc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.slice(0, limit).map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate()
  }))
}

/**
 * Subscribe to activity log for real-time updates
 * @param {string} organizationId - Required for security rules
 * @param {string} entityType - Type of entity
 * @param {string} entityId - ID of the entity
 * @param {Function} callback - Callback function
 * @param {number} limit - Max number of results
 */
export function subscribeToActivityLog(organizationId, entityType, entityId, callback, limit = 50) {
  requireOrgId(organizationId, 'subscribe to activity log')

  const q = query(
    collection(db, 'activities'),
    where('organizationId', '==', organizationId),
    where('entityType', '==', entityType),
    where('entityId', '==', entityId),
    orderBy('createdAt', 'desc')
  )

  return onSnapshot(q, (snapshot) => {
    const activities = snapshot.docs.slice(0, limit).map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }))
    callback(activities)
  })
}

/**
 * Get all recent activity for an organization (across all entities)
 */
export async function getRecentOrganizationActivity(organizationId, limit = 100) {
  requireOrgId(organizationId, 'get organization activity')

  const q = query(
    collection(db, 'activities'),
    where('organizationId', '==', organizationId),
    orderBy('createdAt', 'desc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.slice(0, limit).map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate()
  }))
}

// ============================================
// USER MENTIONS
// ============================================

/**
 * Get comments where user is mentioned
 */
export async function getMentions(userId, organizationId, options = {}) {
  requireOrgId(organizationId, 'get mentions')

  const q = query(
    collection(db, 'comments'),
    where('organizationId', '==', organizationId),
    where('mentions', 'array-contains', userId),
    orderBy('createdAt', 'desc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate()
  }))
}

// ============================================
// COMMENT COUNTS
// ============================================

/**
 * Get comment count for an entity
 * @param {string} organizationId - Required for security rules
 * @param {string} entityType - Type of entity
 * @param {string} entityId - ID of the entity
 */
export async function getCommentCount(organizationId, entityType, entityId) {
  requireOrgId(organizationId, 'get comment count')

  const q = query(
    collection(db, 'comments'),
    where('organizationId', '==', organizationId),
    where('entityType', '==', entityType),
    where('entityId', '==', entityId)
  )

  const snapshot = await getDocs(q)
  const total = snapshot.size
  const unresolved = snapshot.docs.filter(doc => !doc.data().isResolved).length

  return { total, unresolved }
}

export default {
  COMMENT_TYPES,
  ACTIVITY_TYPES,
  createComment,
  getComments,
  subscribeToComments,
  updateComment,
  deleteComment,
  toggleCommentResolved,
  toggleCommentPinned,
  logActivity,
  getActivityLog,
  subscribeToActivityLog,
  getRecentOrganizationActivity,
  getMentions,
  getCommentCount
}
