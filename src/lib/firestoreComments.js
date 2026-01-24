/**
 * Firestore Comments/Activity Service
 * Handles project comments and activity tracking for team collaboration
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
  const comment = {
    entityType: commentData.entityType || 'project', // project, incident, capa, etc.
    entityId: commentData.entityId,
    operatorId: commentData.operatorId,
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
    operatorId: comment.operatorId,
    type: 'commented',
    actorId: comment.authorId,
    actorName: comment.authorName,
    description: `Added a ${COMMENT_TYPES[comment.type]?.label?.toLowerCase() || 'comment'}`
  })

  return { id: docRef.id, ...comment }
}

/**
 * Get comments for an entity
 */
export async function getComments(entityType, entityId, options = {}) {
  const { includeResolved = true, pinnedFirst = true } = options

  let q = query(
    collection(db, 'comments'),
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
 */
export function subscribeToComments(entityType, entityId, callback) {
  const q = query(
    collection(db, 'comments'),
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
  const activity = {
    entityType: activityData.entityType,
    entityId: activityData.entityId,
    operatorId: activityData.operatorId,
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
 */
export async function getActivityLog(entityType, entityId, limit = 50) {
  const q = query(
    collection(db, 'activities'),
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
 */
export function subscribeToActivityLog(entityType, entityId, callback, limit = 50) {
  const q = query(
    collection(db, 'activities'),
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
 * Get all recent activity for an operator (across all entities)
 */
export async function getRecentOperatorActivity(operatorId, limit = 100) {
  const q = query(
    collection(db, 'activities'),
    where('operatorId', '==', operatorId),
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
export async function getMentions(userId, operatorId, options = {}) {
  const { unreadOnly = false } = options

  const q = query(
    collection(db, 'comments'),
    where('operatorId', '==', operatorId),
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
 */
export async function getCommentCount(entityType, entityId) {
  const q = query(
    collection(db, 'comments'),
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
  getRecentOperatorActivity,
  getMentions,
  getCommentCount
}
