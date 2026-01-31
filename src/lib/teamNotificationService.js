/**
 * Muster - Team Notification Service
 * Orchestration service for sending team notifications
 *
 * Phase 1: In-app notifications
 * Phase 2: Email/SMS via Cloud Functions (future)
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
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from './firebase'
import {
  getDistributionLists,
  getDistributionList,
  getAllProjectMembers
} from './firestoreDistributionLists'

// ============================================
// COLLECTION REFERENCES
// ============================================

const notificationsRef = collection(db, 'notifications')

// ============================================
// NOTIFICATION TYPES & TEMPLATES
// ============================================

export const NOTIFICATION_EVENTS = {
  goNoGo: {
    label: 'GO/NO GO Decision',
    description: 'Triggered when GO/NO GO decision is made',
    icon: 'CheckCircle'
  },
  planApproved: {
    label: 'Plan Approved',
    description: 'Triggered when operations plan is approved',
    icon: 'FileCheck'
  },
  dailyPlan: {
    label: 'Daily Plan',
    description: 'Manual daily briefing distribution',
    icon: 'Calendar'
  }
}

/**
 * Message templates for each notification type
 */
export const MESSAGE_TEMPLATES = {
  goNoGo: {
    title: (data) => `${data.projectName} - GO/NO GO Update`,
    body: (data) => {
      const lines = [
        `Status: ${data.decision}`,
        `Date: ${formatDate(data.date)}`,
        `PIC: ${data.pic || 'Not assigned'}`
      ]

      if (data.decision === 'NO-GO' && data.notes) {
        lines.push('', `Reason: ${data.notes}`)
      }

      if (data.projectLink) {
        lines.push('', `View project: ${data.projectLink}`)
      }

      return lines.join('\n')
    }
  },
  planApproved: {
    title: (data) => `${data.projectName} - Operations Plan Approved`,
    body: (data) => {
      const lines = [
        `Approved by: ${data.approver || 'Unknown'}`,
        `Date: ${formatDate(data.date)}`,
        '',
        'The operations plan is now locked and ready for execution.'
      ]

      if (data.conditions) {
        lines.push('', `Conditions: ${data.conditions}`)
      }

      if (data.projectLink) {
        lines.push('', `View project: ${data.projectLink}`)
      }

      return lines.join('\n')
    }
  },
  dailyPlan: {
    title: (data) => `${data.projectName} - Daily Briefing`,
    body: (data) => {
      const lines = [
        `Date: ${formatDate(data.date)}`,
        `Location: ${data.location || 'See project details'}`,
        `PIC: ${data.pic || 'Not assigned'}`
      ]

      if (data.crew && data.crew.length > 0) {
        lines.push(`Crew: ${data.crew.join(', ')}`)
      }

      lines.push('')
      lines.push('Key Items:')

      if (data.operation) {
        lines.push(`• Operation: ${data.operation}`)
      }
      if (data.maxAltitude) {
        lines.push(`• Max Altitude: ${data.maxAltitude}m AGL`)
      }
      if (data.weatherSummary) {
        lines.push(`• Weather: ${data.weatherSummary}`)
      }

      if (data.projectLink) {
        lines.push('', `View full briefing: ${data.projectLink}`)
      }

      return lines.join('\n')
    }
  }
}

// ============================================
// DEFAULT STRUCTURES
// ============================================

/**
 * Get default notification structure
 */
export const getDefaultNotificationStructure = () => ({
  // Core fields
  type: 'team', // 'team' | 'system' | 'personal'
  title: '',
  body: '',

  // Targeting
  userId: null, // For personal notifications
  projectId: null,
  recipientIds: [], // Array of user IDs for team notifications

  // Event tracking
  triggerEvent: null, // 'goNoGo' | 'planApproved' | 'dailyPlan' | null
  eventData: {}, // Original event data

  // Delivery tracking
  deliveryStatus: {
    inApp: 'pending', // 'pending' | 'sent' | 'failed'
    email: null, // 'pending' | 'sent' | 'failed' | null (not configured)
    sms: null // 'pending' | 'sent' | 'failed' | null (not configured)
  },

  // Read status (per recipient)
  readBy: {}, // { [userId]: timestamp }

  // Metadata
  priority: 'normal', // 'low' | 'normal' | 'high' | 'urgent'
  expiresAt: null,
  createdAt: null,
  updatedAt: null,
  createdBy: null
})

/**
 * Get default notification settings structure for a project
 */
export const getDefaultNotificationSettings = () => ({
  goNoGoDecision: {
    enabled: true,
    listIds: []
  },
  planApproved: {
    enabled: true,
    listIds: []
  },
  dailyPlan: {
    enabled: true,
    listIds: []
  }
})

// ============================================
// CORE NOTIFICATION FUNCTIONS
// ============================================

/**
 * Send a team notification based on event type
 * This is the main entry point for automated notifications
 */
export async function sendTeamNotification(projectId, event, eventData = {}, options = {}) {
  try {
    // Get project to check notification settings
    const projectRef = doc(db, 'projects', projectId)
    const projectSnap = await getDoc(projectRef)

    if (!projectSnap.exists()) {
      throw new Error('Project not found')
    }

    const project = { id: projectSnap.id, ...projectSnap.data() }
    const notificationSettings = project.notificationSettings || getDefaultNotificationSettings()

    // Check if this event type is enabled
    const eventSettings = notificationSettings[event === 'goNoGo' ? 'goNoGoDecision' : event]
    if (!eventSettings?.enabled) {
      return { sent: false, reason: 'disabled' }
    }

    // Get configured distribution lists
    const listIds = eventSettings.listIds || []
    if (listIds.length === 0) {
      return { sent: false, reason: 'no_lists' }
    }

    // Build notification data
    const template = MESSAGE_TEMPLATES[event]
    if (!template) {
      throw new Error(`Unknown event type: ${event}`)
    }

    const templateData = {
      projectName: project.name || 'Unnamed Project',
      projectLink: `${window.location.origin}/projects/${projectId}`,
      date: new Date().toISOString(),
      ...eventData
    }

    const notification = {
      ...getDefaultNotificationStructure(),
      type: 'team',
      title: template.title(templateData),
      body: template.body(templateData),
      projectId,
      triggerEvent: event,
      eventData: templateData,
      priority: options.priority || 'normal',
      createdBy: options.createdBy || null
    }

    // Collect all recipients from configured lists
    const recipients = await collectRecipientsFromLists(listIds)

    // Send to all recipients
    const result = await sendToRecipients(notification, recipients, options)

    return {
      sent: true,
      notificationIds: result.notificationIds,
      recipientCount: recipients.length,
      deliveryStats: result.deliveryStats
    }
  } catch (error) {
    console.error('Failed to send team notification:', error)
    throw error
  }
}

/**
 * Send a manual notification (from Quick Send)
 */
export async function sendManualNotification(projectId, {
  title,
  body,
  listIds = [],
  individualRecipients = [],
  channels = ['inApp'],
  priority = 'normal',
  createdBy = null
}) {
  try {
    // Collect recipients
    let recipients = []

    // From distribution lists
    if (listIds.length > 0) {
      const listRecipients = await collectRecipientsFromLists(listIds)
      recipients = [...recipients, ...listRecipients]
    }

    // Add individual recipients
    if (individualRecipients.length > 0) {
      recipients = [...recipients, ...individualRecipients]
    }

    // Deduplicate by organizationId or email
    const uniqueRecipients = deduplicateRecipients(recipients)

    // Filter to only use specified channels
    const filteredRecipients = uniqueRecipients.map(r => ({
      ...r,
      channels: r.channels.filter(c => channels.includes(c))
    }))

    const notification = {
      ...getDefaultNotificationStructure(),
      type: 'team',
      title,
      body,
      projectId,
      triggerEvent: null, // Manual send
      eventData: { manual: true },
      priority,
      createdBy
    }

    const result = await sendToRecipients(notification, filteredRecipients)

    return {
      sent: true,
      notificationIds: result.notificationIds,
      recipientCount: filteredRecipients.length,
      deliveryStats: result.deliveryStats
    }
  } catch (error) {
    console.error('Failed to send manual notification:', error)
    throw error
  }
}

/**
 * Send notification to a specific list
 */
export async function sendToList(listId, notification) {
  const list = await getDistributionList(listId)
  return sendToRecipients(notification, list.members)
}

// ============================================
// RECIPIENT MANAGEMENT
// ============================================

/**
 * Collect all recipients from multiple distribution lists
 */
async function collectRecipientsFromLists(listIds) {
  const recipients = []

  for (const listId of listIds) {
    try {
      const list = await getDistributionList(listId)
      recipients.push(...list.members)
    } catch (error) {
      console.error(`Failed to get list ${listId}:`, error)
    }
  }

  return deduplicateRecipients(recipients)
}

/**
 * Deduplicate recipients by organizationId or email
 */
function deduplicateRecipients(recipients) {
  const seen = new Set()
  return recipients.filter(recipient => {
    const key = recipient.organizationId || recipient.email
    if (!key || seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

// ============================================
// DELIVERY FUNCTIONS
// ============================================

/**
 * Send notification to multiple recipients
 */
async function sendToRecipients(notification, recipients, options = {}) {
  const batch = writeBatch(db)
  const notificationIds = []
  const deliveryStats = {
    inApp: { sent: 0, failed: 0 },
    email: { pending: 0, failed: 0 },
    sms: { pending: 0, failed: 0 }
  }

  for (const recipient of recipients) {
    // Skip external contacts for in-app notifications
    if (recipient.type === 'external' && recipient.channels.every(c => c === 'inApp')) {
      continue
    }

    const notificationDoc = {
      ...notification,
      recipientIds: [recipient.organizationId].filter(Boolean),
      userId: recipient.organizationId || null,
      deliveryStatus: {
        inApp: recipient.channels.includes('inApp') && recipient.type === 'operator' ? 'sent' : null,
        email: recipient.channels.includes('email') && recipient.email ? 'pending' : null,
        sms: recipient.channels.includes('sms') && recipient.phone ? 'pending' : null
      },
      recipientInfo: {
        name: recipient.name,
        email: recipient.email || null,
        phone: recipient.phone || null,
        type: recipient.type
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const docRef = doc(notificationsRef)
    batch.set(docRef, notificationDoc)
    notificationIds.push(docRef.id)

    // Track delivery stats
    if (notificationDoc.deliveryStatus.inApp === 'sent') {
      deliveryStats.inApp.sent++
    }
    if (notificationDoc.deliveryStatus.email === 'pending') {
      deliveryStats.email.pending++
    }
    if (notificationDoc.deliveryStatus.sms === 'pending') {
      deliveryStats.sms.pending++
    }
  }

  await batch.commit()

  return { notificationIds, deliveryStats }
}

// ============================================
// NOTIFICATION QUERIES
// ============================================

/**
 * Get notifications for a user
 */
export async function getNotificationsForUser(userId, options = {}) {
  let q = query(
    notificationsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )

  if (options.limit) {
    q = query(q, limit(options.limit))
  }

  if (options.unreadOnly) {
    q = query(
      notificationsRef,
      where('userId', '==', userId),
      where(`readBy.${userId}`, '==', null),
      orderBy('createdAt', 'desc')
    )
  }

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Get notification history for a project
 */
export async function getProjectNotificationHistory(projectId, options = {}) {
  let q = query(
    notificationsRef,
    where('projectId', '==', projectId),
    orderBy('createdAt', 'desc')
  )

  if (options.limit) {
    q = query(q, limit(options.limit))
  }

  if (options.event) {
    q = query(
      notificationsRef,
      where('projectId', '==', projectId),
      where('triggerEvent', '==', options.event),
      orderBy('createdAt', 'desc')
    )
  }

  const snapshot = await getDocs(q)

  // Group notifications by creation time to show as single send events
  const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

  return notifications
}

/**
 * Get aggregated notification history (grouped by send event)
 */
export async function getAggregatedNotificationHistory(projectId, options = {}) {
  const notifications = await getProjectNotificationHistory(projectId, { limit: 500 })

  // Group by triggerEvent + createdAt (within 5 second window)
  const groups = new Map()

  notifications.forEach(notification => {
    const timestamp = notification.createdAt?.toDate?.() || new Date(notification.createdAt)
    const key = `${notification.triggerEvent || 'manual'}_${Math.floor(timestamp.getTime() / 5000)}`

    if (!groups.has(key)) {
      groups.set(key, {
        event: notification.triggerEvent,
        title: notification.title,
        timestamp: timestamp,
        projectId: notification.projectId,
        recipients: [],
        deliveryStats: {
          inApp: { sent: 0, failed: 0 },
          email: { sent: 0, pending: 0, failed: 0 },
          sms: { sent: 0, pending: 0, failed: 0 }
        }
      })
    }

    const group = groups.get(key)
    group.recipients.push({
      name: notification.recipientInfo?.name || 'Unknown',
      type: notification.recipientInfo?.type || 'operator'
    })

    // Aggregate delivery stats
    const status = notification.deliveryStatus || {}
    if (status.inApp === 'sent') group.deliveryStats.inApp.sent++
    if (status.inApp === 'failed') group.deliveryStats.inApp.failed++
    if (status.email === 'sent') group.deliveryStats.email.sent++
    if (status.email === 'pending') group.deliveryStats.email.pending++
    if (status.email === 'failed') group.deliveryStats.email.failed++
    if (status.sms === 'sent') group.deliveryStats.sms.sent++
    if (status.sms === 'pending') group.deliveryStats.sms.pending++
    if (status.sms === 'failed') group.deliveryStats.sms.failed++
  })

  const result = Array.from(groups.values())
    .sort((a, b) => b.timestamp - a.timestamp)

  if (options.limit) {
    return result.slice(0, options.limit)
  }

  return result
}

// ============================================
// NOTIFICATION STATUS UPDATES
// ============================================

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId, userId) {
  const docRef = doc(db, 'notifications', notificationId)
  await updateDoc(docRef, {
    [`readBy.${userId}`]: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
}

/**
 * Mark multiple notifications as read
 */
export async function markMultipleAsRead(notificationIds, userId) {
  const batch = writeBatch(db)

  notificationIds.forEach(id => {
    const docRef = doc(db, 'notifications', id)
    batch.update(docRef, {
      [`readBy.${userId}`]: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  })

  await batch.commit()
}

/**
 * Update delivery status (used by Cloud Functions)
 */
export async function updateDeliveryStatus(notificationId, channel, status) {
  const docRef = doc(db, 'notifications', notificationId)
  await updateDoc(docRef, {
    [`deliveryStatus.${channel}`]: status,
    updatedAt: serverTimestamp()
  })
}

// ============================================
// UNREAD COUNT
// ============================================

/**
 * Get unread notification count for a user
 */
export async function getUnreadCount(userId) {
  // Note: This is a simplified version. For production, consider using
  // a counter document or Cloud Functions to maintain counts
  const notifications = await getNotificationsForUser(userId, { limit: 100 })
  return notifications.filter(n => !n.readBy?.[userId]).length
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format date for display
 */
function formatDate(dateStr) {
  if (!dateStr) return 'Unknown'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Build project link
 */
export function buildProjectLink(projectId) {
  return `${window.location.origin}/projects/${projectId}`
}

// ============================================
// PROJECT SETTINGS MANAGEMENT
// ============================================

/**
 * Update project notification settings
 */
export async function updateProjectNotificationSettings(projectId, settings) {
  const projectRef = doc(db, 'projects', projectId)
  await updateDoc(projectRef, {
    notificationSettings: settings,
    updatedAt: serverTimestamp()
  })
}

/**
 * Get project notification settings
 */
export async function getProjectNotificationSettings(projectId) {
  const projectRef = doc(db, 'projects', projectId)
  const projectSnap = await getDoc(projectRef)

  if (!projectSnap.exists()) {
    throw new Error('Project not found')
  }

  return projectSnap.data().notificationSettings || getDefaultNotificationSettings()
}

// ============================================
// EXPORT DEFAULT
// ============================================

export default {
  // Events & Templates
  NOTIFICATION_EVENTS,
  MESSAGE_TEMPLATES,

  // Structures
  getDefaultNotificationStructure,
  getDefaultNotificationSettings,

  // Core Functions
  sendTeamNotification,
  sendManualNotification,
  sendToList,

  // Queries
  getNotificationsForUser,
  getProjectNotificationHistory,
  getAggregatedNotificationHistory,

  // Status Updates
  markAsRead,
  markMultipleAsRead,
  updateDeliveryStatus,

  // Counts
  getUnreadCount,

  // Settings
  updateProjectNotificationSettings,
  getProjectNotificationSettings,

  // Utilities
  buildProjectLink
}
