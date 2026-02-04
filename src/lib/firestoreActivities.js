/**
 * firestoreActivities.js
 * Firebase Firestore data access layer for In-Field Activities Tracking
 *
 * Collections:
 * - activities: Individual activity records with timer data and notes
 *
 * @location src/lib/firestoreActivities.js
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

// ============================================
// CONSTANTS
// ============================================

export const ACTIVITY_STATUS = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700' },
  paused: { label: 'Paused', color: 'bg-yellow-100 text-yellow-700' },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700' }
}

export const ACTIVITY_CATEGORIES = {
  survey: { label: 'Survey', icon: 'Map', color: 'bg-blue-100 text-blue-700' },
  data_collection: { label: 'Data Collection', icon: 'Database', color: 'bg-purple-100 text-purple-700' },
  inspection: { label: 'Inspection', icon: 'Search', color: 'bg-amber-100 text-amber-700' },
  photography: { label: 'Photography', icon: 'Camera', color: 'bg-pink-100 text-pink-700' },
  mapping: { label: 'Mapping', icon: 'MapPin', color: 'bg-green-100 text-green-700' },
  flight_ops: { label: 'Flight Operations', icon: 'Plane', color: 'bg-sky-100 text-sky-700' },
  ground_work: { label: 'Ground Work', icon: 'Footprints', color: 'bg-orange-100 text-orange-700' },
  equipment_setup: { label: 'Equipment Setup', icon: 'Wrench', color: 'bg-gray-100 text-gray-700' },
  client_meeting: { label: 'Client Meeting', icon: 'Users', color: 'bg-indigo-100 text-indigo-700' },
  travel: { label: 'Travel', icon: 'Car', color: 'bg-teal-100 text-teal-700' },
  other: { label: 'Other', icon: 'MoreHorizontal', color: 'bg-gray-100 text-gray-700' }
}

export const METHOD_TAGS = [
  'Visual Inspection',
  'Drone Survey',
  'GPS Measurement',
  'Photogrammetry',
  'LiDAR Scan',
  'Thermal Imaging',
  'Ground Control Points',
  'Manual Documentation',
  'Video Recording',
  'Sample Collection',
  'Instrument Reading',
  'Safety Check'
]

export const REPORT_SECTIONS = {
  methods: { label: 'Methods', description: 'How the work was performed' },
  findings: { label: 'Findings', description: 'Results and observations' },
  fieldwork: { label: 'Fieldwork', description: 'General field operations' }
}

// ============================================
// COLLECTION REFERENCES
// ============================================

const activitiesRef = collection(db, 'activities')

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format duration in seconds to human readable string
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration (e.g., "2h 15m 30s")
 */
export function formatDuration(seconds) {
  if (!seconds || seconds < 0) return '0s'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  const parts = []
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`)

  return parts.join(' ')
}

/**
 * Format duration for timer display (HH:MM:SS)
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted timer string
 */
export function formatTimerDisplay(seconds) {
  if (!seconds || seconds < 0) return '00:00:00'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  return [hours, minutes, secs]
    .map(v => String(v).padStart(2, '0'))
    .join(':')
}

/**
 * Calculate elapsed seconds for an activity
 * @param {Object} activity - Activity object
 * @returns {number} Total elapsed seconds (excluding paused time)
 */
export function calculateElapsedSeconds(activity) {
  if (!activity?.startTime) return 0

  const startTime = activity.startTime.toDate ? activity.startTime.toDate() : new Date(activity.startTime)
  const totalPausedSeconds = activity.totalPausedSeconds || 0

  if (activity.status === 'completed' && activity.endTime) {
    const endTime = activity.endTime.toDate ? activity.endTime.toDate() : new Date(activity.endTime)
    return Math.floor((endTime - startTime) / 1000) - totalPausedSeconds
  }

  if (activity.status === 'paused' && activity.pausedAt) {
    const pausedAt = activity.pausedAt.toDate ? activity.pausedAt.toDate() : new Date(activity.pausedAt)
    return Math.floor((pausedAt - startTime) / 1000) - totalPausedSeconds
  }

  // Active - calculate from now
  return Math.floor((Date.now() - startTime.getTime()) / 1000) - totalPausedSeconds
}

/**
 * Calculate activity totals from an array of activities
 * @param {Array} activities - Array of activity objects
 * @returns {Object} Totals by category, status, and total time
 */
export function calculateActivityTotals(activities) {
  const totals = {
    totalSeconds: 0,
    byCategory: {},
    byStatus: {
      active: 0,
      paused: 0,
      completed: 0
    },
    count: activities.length,
    activeCount: 0
  }

  activities.forEach(activity => {
    const seconds = activity.totalSeconds || calculateElapsedSeconds(activity)
    totals.totalSeconds += seconds

    // By category
    const category = activity.category || 'other'
    if (!totals.byCategory[category]) {
      totals.byCategory[category] = { count: 0, seconds: 0 }
    }
    totals.byCategory[category].count++
    totals.byCategory[category].seconds += seconds

    // By status
    const status = activity.status || 'active'
    if (totals.byStatus[status] !== undefined) {
      totals.byStatus[status]++
    }

    if (status === 'active') {
      totals.activeCount++
    }
  })

  return totals
}

// ============================================
// ACTIVITIES CRUD
// ============================================

/**
 * Get all activities with optional filters
 * @param {string} organizationId - Organization ID (required)
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>}
 */
export async function getActivities(organizationId, filters = {}) {
  if (!organizationId) {
    console.warn('getActivities called without organizationId')
    return []
  }

  const constraints = [
    where('organizationId', '==', organizationId)
  ]

  if (filters.projectId) {
    constraints.push(where('projectId', '==', filters.projectId))
  }

  if (filters.status) {
    constraints.push(where('status', '==', filters.status))
  }

  if (filters.category) {
    constraints.push(where('category', '==', filters.category))
  }

  if (filters.operatorId) {
    constraints.push(where('operatorId', '==', filters.operatorId))
  }

  if (filters.limit) {
    constraints.push(limit(filters.limit))
  }

  const q = query(activitiesRef, ...constraints)
  const snapshot = await getDocs(q)
  const activities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

  // Sort by startTime descending (most recent first)
  return activities.sort((a, b) => {
    const aTime = a.startTime?.toMillis?.() || 0
    const bTime = b.startTime?.toMillis?.() || 0
    return bTime - aTime
  })
}

/**
 * Get a single activity by ID
 * @param {string} id - Activity ID
 * @returns {Promise<Object>}
 */
export async function getActivityById(id) {
  const docRef = doc(db, 'activities', id)
  const snapshot = await getDoc(docRef)

  if (!snapshot.exists()) {
    throw new Error('Activity not found')
  }

  return { id: snapshot.id, ...snapshot.data() }
}

/**
 * Get activities for a specific project
 * @param {string} projectId - Project ID
 * @returns {Promise<Array>}
 */
export async function getActivitiesByProject(projectId) {
  const q = query(
    activitiesRef,
    where('projectId', '==', projectId)
  )
  const snapshot = await getDocs(q)
  const activities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

  // Sort by startTime descending
  return activities.sort((a, b) => {
    const aTime = a.startTime?.toMillis?.() || 0
    const bTime = b.startTime?.toMillis?.() || 0
    return bTime - aTime
  })
}

/**
 * Get active activities for a user (across all projects)
 * @param {string} organizationId - Organization ID
 * @param {string} operatorId - Operator/User ID
 * @returns {Promise<Array>}
 */
export async function getActiveActivities(organizationId, operatorId) {
  const q = query(
    activitiesRef,
    where('organizationId', '==', organizationId),
    where('operatorId', '==', operatorId),
    where('status', 'in', ['active', 'paused'])
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Start a new activity (create with timer started)
 * @param {Object} data - Activity data
 * @param {string} organizationId - Organization ID (required)
 * @returns {Promise<Object>}
 */
export async function startActivity(data, organizationId) {
  if (!organizationId) {
    throw new Error('organizationId is required to start an activity')
  }

  const activity = {
    // Organization (REQUIRED for security rules)
    organizationId,

    // Project/Site association
    projectId: data.projectId,
    projectName: data.projectName || '',
    siteId: data.siteId || null,
    siteName: data.siteName || '',

    // Activity info
    name: data.name || 'Untitled Activity',
    category: data.category || 'other',

    // Timer data
    status: 'active',
    startTime: serverTimestamp(),
    endTime: null,
    pausedAt: null,
    totalPausedSeconds: 0,
    totalSeconds: 0,

    // Notes
    notes: data.notes || '',
    methodsUsed: data.methodsUsed || [],
    informationGathered: '',

    // Photos
    photos: [],

    // Report inclusion
    includeInReport: data.includeInReport ?? true,
    reportSection: data.reportSection || 'fieldwork',

    // Operator
    operatorId: data.operatorId,
    operatorName: data.operatorName || '',

    // Metadata
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  const docRef = await addDoc(activitiesRef, activity)
  return { id: docRef.id, ...activity, startTime: Timestamp.now() }
}

/**
 * Pause an active activity
 * @param {string} activityId - Activity ID
 */
export async function pauseActivity(activityId) {
  const docRef = doc(db, 'activities', activityId)
  const activity = await getActivityById(activityId)

  if (activity.status !== 'active') {
    throw new Error('Only active activities can be paused')
  }

  await updateDoc(docRef, {
    status: 'paused',
    pausedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
}

/**
 * Resume a paused activity
 * @param {string} activityId - Activity ID
 */
export async function resumeActivity(activityId) {
  const docRef = doc(db, 'activities', activityId)
  const activity = await getActivityById(activityId)

  if (activity.status !== 'paused') {
    throw new Error('Only paused activities can be resumed')
  }

  // Calculate additional paused seconds
  const pausedAt = activity.pausedAt.toDate ? activity.pausedAt.toDate() : new Date(activity.pausedAt)
  const additionalPausedSeconds = Math.floor((Date.now() - pausedAt.getTime()) / 1000)
  const newTotalPausedSeconds = (activity.totalPausedSeconds || 0) + additionalPausedSeconds

  await updateDoc(docRef, {
    status: 'active',
    pausedAt: null,
    totalPausedSeconds: newTotalPausedSeconds,
    updatedAt: serverTimestamp()
  })
}

/**
 * Complete an activity (stop timer)
 * @param {string} activityId - Activity ID
 * @param {Object} finalData - Optional final notes/findings
 */
export async function completeActivity(activityId, finalData = {}) {
  const docRef = doc(db, 'activities', activityId)
  const activity = await getActivityById(activityId)

  if (activity.status === 'completed') {
    throw new Error('Activity is already completed')
  }

  // Calculate final total seconds
  let totalPausedSeconds = activity.totalPausedSeconds || 0

  // If currently paused, add the paused time
  if (activity.status === 'paused' && activity.pausedAt) {
    const pausedAt = activity.pausedAt.toDate ? activity.pausedAt.toDate() : new Date(activity.pausedAt)
    totalPausedSeconds += Math.floor((Date.now() - pausedAt.getTime()) / 1000)
  }

  const startTime = activity.startTime.toDate ? activity.startTime.toDate() : new Date(activity.startTime)
  const totalSeconds = Math.floor((Date.now() - startTime.getTime()) / 1000) - totalPausedSeconds

  await updateDoc(docRef, {
    status: 'completed',
    endTime: serverTimestamp(),
    pausedAt: null,
    totalPausedSeconds,
    totalSeconds,
    notes: finalData.notes ?? activity.notes,
    methodsUsed: finalData.methodsUsed ?? activity.methodsUsed,
    informationGathered: finalData.informationGathered ?? activity.informationGathered,
    includeInReport: finalData.includeInReport ?? activity.includeInReport,
    reportSection: finalData.reportSection ?? activity.reportSection,
    updatedAt: serverTimestamp()
  })
}

/**
 * Update activity details (notes, methods, etc.)
 * @param {string} activityId - Activity ID
 * @param {Object} data - Updated data
 */
export async function updateActivity(activityId, data) {
  const docRef = doc(db, 'activities', activityId)

  // Only allow updating specific fields
  const allowedFields = [
    'name', 'category', 'notes', 'methodsUsed', 'informationGathered',
    'includeInReport', 'reportSection', 'photos'
  ]

  const updates = {}
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates[field] = data[field]
    }
  }

  if (Object.keys(updates).length > 0) {
    updates.updatedAt = serverTimestamp()
    await updateDoc(docRef, updates)
  }
}

/**
 * Add a photo to an activity
 * @param {string} activityId - Activity ID
 * @param {Object} photo - Photo object with url, path, caption
 */
export async function addActivityPhoto(activityId, photo) {
  const docRef = doc(db, 'activities', activityId)
  const activity = await getActivityById(activityId)

  const photos = activity.photos || []
  photos.push({
    url: photo.url,
    path: photo.path,
    caption: photo.caption || '',
    takenAt: serverTimestamp()
  })

  await updateDoc(docRef, {
    photos,
    updatedAt: serverTimestamp()
  })
}

/**
 * Delete an activity
 * @param {string} activityId - Activity ID
 */
export async function deleteActivity(activityId) {
  const docRef = doc(db, 'activities', activityId)
  await deleteDoc(docRef)
}

// ============================================
// STATISTICS & REPORTING
// ============================================

/**
 * Get activity summary for a project
 * @param {string} projectId - Project ID
 * @returns {Promise<Object>}
 */
export async function getProjectActivitySummary(projectId) {
  const activities = await getActivitiesByProject(projectId)
  return calculateActivityTotals(activities)
}

/**
 * Get activities for report inclusion
 * @param {string} projectId - Project ID
 * @param {string} section - Optional report section filter
 * @returns {Promise<Array>}
 */
export async function getActivitiesForReport(projectId, section = null) {
  const activities = await getActivitiesByProject(projectId)

  let filtered = activities.filter(a => a.includeInReport && a.status === 'completed')

  if (section) {
    filtered = filtered.filter(a => a.reportSection === section)
  }

  return filtered
}

/**
 * Get operator activity statistics
 * @param {string} organizationId - Organization ID
 * @param {string} operatorId - Operator ID
 * @param {number} days - Number of days to look back
 * @returns {Promise<Object>}
 */
export async function getOperatorActivityStats(organizationId, operatorId, days = 30) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  const activities = await getActivities(organizationId, { operatorId })
  const recentActivities = activities.filter(a => {
    const startTime = a.startTime?.toDate?.() || new Date(a.startTime)
    return startTime >= cutoffDate
  })

  return {
    ...calculateActivityTotals(recentActivities),
    period: `Last ${days} days`
  }
}
