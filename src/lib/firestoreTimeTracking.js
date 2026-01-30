/**
 * firestoreTimeTracking.js
 * Firebase Firestore data access layer for Time Tracking
 *
 * Collections:
 * - timeEntries: Individual time entry records
 * - timesheets: Weekly aggregation for approval workflow
 *
 * @location src/lib/firestoreTimeTracking.js
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

export const TIME_ENTRY_STATUS = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' }
}

export const TIMESHEET_STATUS = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' }
}

export const TASK_TYPES = {
  field_work: { label: 'Field Work', color: 'bg-green-100 text-green-700' },
  travel: { label: 'Travel', color: 'bg-blue-100 text-blue-700' },
  prep: { label: 'Preparation', color: 'bg-purple-100 text-purple-700' },
  post_processing: { label: 'Post-Processing', color: 'bg-indigo-100 text-indigo-700' },
  admin: { label: 'Administrative', color: 'bg-gray-100 text-gray-700' },
  training: { label: 'Training', color: 'bg-amber-100 text-amber-700' },
  other: { label: 'Other', color: 'bg-slate-100 text-slate-700' }
}

// ============================================
// COLLECTION REFERENCES
// ============================================

const timeEntriesRef = collection(db, 'timeEntries')
const timesheetsRef = collection(db, 'timesheets')

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate total hours from start time, end time, and break
 * @param {string} startTime - Start time in "HH:MM" format
 * @param {string} endTime - End time in "HH:MM" format
 * @param {number} breakMinutes - Break duration in minutes
 * @returns {number} Total hours worked
 */
export function calculateTotalHours(startTime, endTime, breakMinutes = 0) {
  if (!startTime || !endTime) return 0

  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)

  const startMinutes = startHour * 60 + startMin
  let endMinutes = endHour * 60 + endMin

  // Handle overnight shifts
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60
  }

  const totalMinutes = endMinutes - startMinutes - breakMinutes
  return Math.max(0, totalMinutes / 60)
}

/**
 * Get the Monday of the week for a given date
 * @param {Date} date - The date
 * @returns {Date} Monday of that week
 */
export function getWeekStart(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Sunday
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Get the Sunday of the week for a given date
 * @param {Date} date - The date
 * @returns {Date} Sunday of that week
 */
export function getWeekEnd(date) {
  const monday = getWeekStart(date)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return sunday
}

/**
 * Format date to YYYY-MM-DD string
 * @param {Date} date - The date
 * @returns {string} Formatted date string
 */
export function formatDateString(date) {
  return date.toISOString().split('T')[0]
}

/**
 * Get week identifier string (YYYY-WXX format)
 * @param {Date} date - The date
 * @returns {string} Week identifier
 */
export function getWeekId(date) {
  const monday = getWeekStart(date)
  const year = monday.getFullYear()
  const startOfYear = new Date(year, 0, 1)
  const days = Math.floor((monday - startOfYear) / (24 * 60 * 60 * 1000))
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7)
  return `${year}-W${String(weekNumber).padStart(2, '0')}`
}

// ============================================
// TIME ENTRIES CRUD
// ============================================

/**
 * Get all time entries with optional filters
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>}
 */
export async function getTimeEntries(filters = {}) {
  let q = query(timeEntriesRef, orderBy('date', 'desc'))

  if (filters.projectId) {
    q = query(timeEntriesRef,
      where('projectId', '==', filters.projectId),
      orderBy('date', 'desc')
    )
  }

  if (filters.operatorId) {
    q = query(timeEntriesRef,
      where('operatorId', '==', filters.operatorId),
      orderBy('date', 'desc')
    )
  }

  if (filters.status) {
    q = query(timeEntriesRef,
      where('status', '==', filters.status),
      orderBy('date', 'desc')
    )
  }

  if (filters.limit) {
    q = query(q, limit(filters.limit))
  }

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Get a single time entry by ID
 * @param {string} id - Time entry ID
 * @returns {Promise<Object>}
 */
export async function getTimeEntryById(id) {
  const docRef = doc(db, 'timeEntries', id)
  const snapshot = await getDoc(docRef)

  if (!snapshot.exists()) {
    throw new Error('Time entry not found')
  }

  return { id: snapshot.id, ...snapshot.data() }
}

/**
 * Get time entries for a specific project
 * @param {string} projectId - Project ID
 * @returns {Promise<Array>}
 */
export async function getTimeEntriesByProject(projectId) {
  const q = query(
    timeEntriesRef,
    where('projectId', '==', projectId)
  )
  const snapshot = await getDocs(q)
  const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  // Sort client-side to avoid needing composite index
  return entries.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
}

/**
 * Get time entries for a specific operator
 * @param {string} operatorId - Operator ID
 * @param {Object} filters - Additional filters
 * @returns {Promise<Array>}
 */
export async function getTimeEntriesByOperator(operatorId, filters = {}) {
  let q = query(
    timeEntriesRef,
    where('operatorId', '==', operatorId),
    orderBy('date', 'desc')
  )

  if (filters.limit) {
    q = query(q, limit(filters.limit))
  }

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Get time entries for a specific week and operator
 * @param {string} operatorId - Operator ID
 * @param {Date} weekStartDate - Monday of the week
 * @returns {Promise<Array>}
 */
export async function getTimeEntriesForWeek(operatorId, weekStartDate) {
  const monday = getWeekStart(weekStartDate)
  const sunday = getWeekEnd(weekStartDate)

  const mondayStr = formatDateString(monday)
  const sundayStr = formatDateString(sunday)

  // Simple query by operatorId only (no composite index needed)
  // Then filter by date client-side
  const q = query(
    timeEntriesRef,
    where('operatorId', '==', operatorId)
  )

  const snapshot = await getDocs(q)
  const allEntries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

  // Filter by date range client-side and sort
  return allEntries
    .filter(entry => entry.date >= mondayStr && entry.date <= sundayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Create a new time entry
 * @param {Object} data - Time entry data
 * @returns {Promise<Object>}
 */
export async function createTimeEntry(data) {
  // Calculate total hours if not provided
  const totalHours = data.totalHours ?? calculateTotalHours(
    data.startTime,
    data.endTime,
    data.breakMinutes || 0
  )

  // Calculate billing amount if billable
  const billingAmount = data.billable && data.billingRate
    ? totalHours * data.billingRate
    : 0

  const entry = {
    // Project/Site association
    projectId: data.projectId,
    projectName: data.projectName || '',
    siteId: data.siteId || null,
    siteName: data.siteName || '',

    // Operator
    operatorId: data.operatorId,
    operatorName: data.operatorName || '',

    // Time details
    date: data.date, // YYYY-MM-DD string
    startTime: data.startTime || null, // HH:MM string
    endTime: data.endTime || null, // HH:MM string
    breakMinutes: data.breakMinutes || 0,
    totalHours: totalHours,

    // Categorization
    taskType: data.taskType || 'field_work',
    description: data.description || '',

    // Billing
    billable: data.billable ?? true,
    billingRate: data.billingRate || 0,
    billingAmount: billingAmount,

    // Approval workflow
    status: data.status || 'draft',
    submittedAt: null,
    approvedBy: null,
    approvedByName: null,
    approvedAt: null,
    rejectionReason: null,

    // Week tracking for timesheet aggregation
    weekId: getWeekId(new Date(data.date)),
    weekStartDate: formatDateString(getWeekStart(new Date(data.date))),

    // Metadata
    createdBy: data.createdBy || data.operatorId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  const docRef = await addDoc(timeEntriesRef, entry)
  return { id: docRef.id, ...entry }
}

/**
 * Update an existing time entry
 * @param {string} id - Time entry ID
 * @param {Object} data - Updated data
 */
export async function updateTimeEntry(id, data) {
  const docRef = doc(db, 'timeEntries', id)

  // Recalculate hours if time fields changed
  let updateData = { ...data }
  if (data.startTime !== undefined || data.endTime !== undefined || data.breakMinutes !== undefined) {
    const current = await getTimeEntryById(id)
    const totalHours = calculateTotalHours(
      data.startTime ?? current.startTime,
      data.endTime ?? current.endTime,
      data.breakMinutes ?? current.breakMinutes ?? 0
    )
    updateData.totalHours = totalHours

    // Recalculate billing if billable
    if (current.billable && current.billingRate) {
      updateData.billingAmount = totalHours * current.billingRate
    }
  }

  // Update week tracking if date changed
  if (data.date) {
    updateData.weekId = getWeekId(new Date(data.date))
    updateData.weekStartDate = formatDateString(getWeekStart(new Date(data.date)))
  }

  await updateDoc(docRef, {
    ...updateData,
    updatedAt: serverTimestamp()
  })
}

/**
 * Delete a time entry
 * @param {string} id - Time entry ID
 */
export async function deleteTimeEntry(id) {
  const docRef = doc(db, 'timeEntries', id)
  await deleteDoc(docRef)
}

// ============================================
// TIMESHEETS
// ============================================

/**
 * Get timesheet for a specific week and operator
 * Creates one if it doesn't exist
 * @param {string} operatorId - Operator ID
 * @param {Date} weekStartDate - Monday of the week
 * @returns {Promise<Object>}
 */
export async function getTimesheetForWeek(operatorId, weekStartDate) {
  const weekId = getWeekId(weekStartDate)

  // Query by operatorId only, then filter client-side
  const q = query(
    timesheetsRef,
    where('operatorId', '==', operatorId)
  )
  const snapshot = await getDocs(q)
  const timesheets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

  // Find matching weekId
  const match = timesheets.find(ts => ts.weekId === weekId)
  return match || null
}

/**
 * Get or create timesheet for a week
 * @param {string} operatorId - Operator ID
 * @param {string} operatorName - Operator name
 * @param {Date} weekStartDate - Monday of the week
 * @returns {Promise<Object>}
 */
export async function getOrCreateTimesheet(operatorId, operatorName, weekStartDate) {
  const existing = await getTimesheetForWeek(operatorId, weekStartDate)
  if (existing) return existing

  const weekId = getWeekId(weekStartDate)
  const monday = getWeekStart(weekStartDate)
  const sunday = getWeekEnd(weekStartDate)

  const timesheet = {
    operatorId,
    operatorName: operatorName || '',
    weekId,
    weekStartDate: formatDateString(monday),
    weekEndDate: formatDateString(sunday),

    // Totals (calculated from entries)
    totalHours: 0,
    billableHours: 0,
    totalBillingAmount: 0,

    // Status
    status: 'draft',
    submittedAt: null,
    approvedBy: null,
    approvedByName: null,
    approvedAt: null,
    rejectionReason: null,

    // Metadata
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  const docRef = await addDoc(timesheetsRef, timesheet)
  return { id: docRef.id, ...timesheet }
}

/**
 * Calculate and update timesheet totals from entries
 * @param {string} operatorId - Operator ID
 * @param {Date} weekStartDate - Monday of the week
 */
export async function recalculateTimesheetTotals(operatorId, weekStartDate) {
  const entries = await getTimeEntriesForWeek(operatorId, weekStartDate)

  let totalHours = 0
  let billableHours = 0
  let totalBillingAmount = 0

  entries.forEach(entry => {
    totalHours += entry.totalHours || 0
    if (entry.billable) {
      billableHours += entry.totalHours || 0
      totalBillingAmount += entry.billingAmount || 0
    }
  })

  // Get or create timesheet
  const timesheet = await getOrCreateTimesheet(operatorId, '', weekStartDate)

  if (timesheet) {
    const docRef = doc(db, 'timesheets', timesheet.id)
    await updateDoc(docRef, {
      totalHours,
      billableHours,
      totalBillingAmount,
      updatedAt: serverTimestamp()
    })
  }
}

/**
 * Submit a timesheet for approval
 * @param {string} timesheetId - Timesheet ID
 * @param {string} notes - Optional notes for the approver
 */
export async function submitTimesheet(timesheetId, notes = '') {
  const docRef = doc(db, 'timesheets', timesheetId)
  await updateDoc(docRef, {
    status: 'submitted',
    submittedAt: serverTimestamp(),
    submissionNotes: notes || null,
    rejectionReason: null, // Clear any previous rejection reason
    updatedAt: serverTimestamp()
  })

  // Also mark all associated entries as submitted
  const timesheet = await getDoc(docRef)
  const data = timesheet.data()

  const entries = await getTimeEntriesForWeek(data.operatorId, new Date(data.weekStartDate))
  for (const entry of entries) {
    if (entry.status === 'draft') {
      await updateDoc(doc(db, 'timeEntries', entry.id), {
        status: 'submitted',
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    }
  }
}

/**
 * Approve a timesheet
 * @param {string} timesheetId - Timesheet ID
 * @param {string} approvedBy - Approver's user ID
 * @param {string} approvedByName - Approver's name
 */
export async function approveTimesheet(timesheetId, approvedBy, approvedByName) {
  const docRef = doc(db, 'timesheets', timesheetId)
  await updateDoc(docRef, {
    status: 'approved',
    approvedBy,
    approvedByName,
    approvedAt: serverTimestamp(),
    rejectionReason: null,
    updatedAt: serverTimestamp()
  })

  // Also mark all associated entries as approved
  const timesheet = await getDoc(docRef)
  const data = timesheet.data()

  const entries = await getTimeEntriesForWeek(data.operatorId, new Date(data.weekStartDate))
  for (const entry of entries) {
    if (entry.status === 'submitted') {
      await updateDoc(doc(db, 'timeEntries', entry.id), {
        status: 'approved',
        approvedBy,
        approvedByName,
        approvedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    }
  }
}

/**
 * Reject a timesheet
 * @param {string} timesheetId - Timesheet ID
 * @param {string} rejectedBy - Rejector's user ID
 * @param {string} reason - Rejection reason
 */
export async function rejectTimesheet(timesheetId, rejectedBy, reason) {
  const docRef = doc(db, 'timesheets', timesheetId)
  await updateDoc(docRef, {
    status: 'rejected',
    rejectionReason: reason,
    updatedAt: serverTimestamp()
  })

  // Also mark all associated entries as rejected
  const timesheet = await getDoc(docRef)
  const data = timesheet.data()

  const entries = await getTimeEntriesForWeek(data.operatorId, new Date(data.weekStartDate))
  for (const entry of entries) {
    if (entry.status === 'submitted') {
      await updateDoc(doc(db, 'timeEntries', entry.id), {
        status: 'rejected',
        rejectionReason: reason,
        updatedAt: serverTimestamp()
      })
    }
  }
}

/**
 * Get pending timesheets for approval (for managers)
 * @returns {Promise<Array>}
 */
export async function getPendingTimesheets() {
  const q = query(
    timesheetsRef,
    where('status', '==', 'submitted')
  )
  const snapshot = await getDocs(q)
  const timesheets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  // Sort client-side by submittedAt ascending
  return timesheets.sort((a, b) => {
    const aTime = a.submittedAt?.toMillis?.() || 0
    const bTime = b.submittedAt?.toMillis?.() || 0
    return aTime - bTime
  })
}

/**
 * Get a single timesheet with its entries
 * @param {string} timesheetId - Timesheet ID
 * @returns {Promise<Object>}
 */
export async function getTimesheetWithEntries(timesheetId) {
  const docRef = doc(db, 'timesheets', timesheetId)
  const timesheetSnap = await getDoc(docRef)

  if (!timesheetSnap.exists()) {
    throw new Error('Timesheet not found')
  }

  const timesheet = { id: timesheetSnap.id, ...timesheetSnap.data() }

  // Get the entries for this timesheet's week
  const weekStart = timesheet.weekStartDate?.toDate
    ? timesheet.weekStartDate.toDate()
    : new Date(timesheet.weekStartDate)

  const entries = await getTimeEntriesForWeek(timesheet.operatorId, weekStart)

  return {
    ...timesheet,
    entries
  }
}

/**
 * Get all timesheets with a specific status
 * @param {string} status - Status to filter by
 * @param {Object} options - Optional filters
 * @returns {Promise<Array>}
 */
export async function getTimesheetsByStatus(status, options = {}) {
  const q = query(
    timesheetsRef,
    where('status', '==', status)
  )

  const snapshot = await getDocs(q)
  let timesheets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

  // Sort client-side by submittedAt descending
  timesheets.sort((a, b) => {
    const aTime = a.submittedAt?.toMillis?.() || 0
    const bTime = b.submittedAt?.toMillis?.() || 0
    return bTime - aTime
  })

  if (options.limit) {
    timesheets = timesheets.slice(0, options.limit)
  }

  return timesheets
}

/**
 * Get timesheets for a specific operator
 * @param {string} operatorId - Operator ID
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>}
 */
export async function getTimesheetsByOperator(operatorId, filters = {}) {
  let q = query(
    timesheetsRef,
    where('operatorId', '==', operatorId),
    orderBy('weekStartDate', 'desc')
  )

  if (filters.limit) {
    q = query(q, limit(filters.limit))
  }

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

// ============================================
// STATISTICS & REPORTING
// ============================================

/**
 * Calculate weekly totals for a project
 * @param {string} projectId - Project ID
 * @returns {Promise<Object>}
 */
export async function getProjectTimeSummary(projectId) {
  const entries = await getTimeEntriesByProject(projectId)

  const summary = {
    totalHours: 0,
    billableHours: 0,
    totalBillingAmount: 0,
    byTaskType: {},
    byOperator: {},
    entriesCount: entries.length
  }

  entries.forEach(entry => {
    summary.totalHours += entry.totalHours || 0

    if (entry.billable) {
      summary.billableHours += entry.totalHours || 0
      summary.totalBillingAmount += entry.billingAmount || 0
    }

    // By task type
    const taskType = entry.taskType || 'other'
    if (!summary.byTaskType[taskType]) {
      summary.byTaskType[taskType] = { hours: 0, amount: 0 }
    }
    summary.byTaskType[taskType].hours += entry.totalHours || 0
    summary.byTaskType[taskType].amount += entry.billingAmount || 0

    // By operator
    const operatorId = entry.operatorId
    if (!summary.byOperator[operatorId]) {
      summary.byOperator[operatorId] = {
        name: entry.operatorName,
        hours: 0,
        amount: 0
      }
    }
    summary.byOperator[operatorId].hours += entry.totalHours || 0
    summary.byOperator[operatorId].amount += entry.billingAmount || 0
  })

  return summary
}

/**
 * Get time entry statistics for an operator
 * @param {string} operatorId - Operator ID
 * @param {number} days - Number of days to look back
 * @returns {Promise<Object>}
 */
export async function getOperatorTimeStats(operatorId, days = 30) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  const cutoffStr = formatDateString(cutoffDate)

  const q = query(
    timeEntriesRef,
    where('operatorId', '==', operatorId),
    where('date', '>=', cutoffStr),
    orderBy('date', 'desc')
  )

  const snapshot = await getDocs(q)
  const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

  const stats = {
    totalHours: 0,
    billableHours: 0,
    totalBillingAmount: 0,
    entriesCount: entries.length,
    averageHoursPerDay: 0,
    byTaskType: {},
    byProject: {}
  }

  const uniqueDays = new Set()

  entries.forEach(entry => {
    stats.totalHours += entry.totalHours || 0
    uniqueDays.add(entry.date)

    if (entry.billable) {
      stats.billableHours += entry.totalHours || 0
      stats.totalBillingAmount += entry.billingAmount || 0
    }

    // By task type
    const taskType = entry.taskType || 'other'
    if (!stats.byTaskType[taskType]) {
      stats.byTaskType[taskType] = 0
    }
    stats.byTaskType[taskType] += entry.totalHours || 0

    // By project
    const projectId = entry.projectId
    if (projectId && !stats.byProject[projectId]) {
      stats.byProject[projectId] = {
        name: entry.projectName,
        hours: 0
      }
    }
    if (projectId) {
      stats.byProject[projectId].hours += entry.totalHours || 0
    }
  })

  stats.averageHoursPerDay = uniqueDays.size > 0
    ? stats.totalHours / uniqueDays.size
    : 0

  return stats
}

/**
 * Get current week summary for dashboard widget
 * @param {string} operatorId - Operator ID
 * @returns {Promise<Object>}
 */
export async function getCurrentWeekSummary(operatorId) {
  const today = new Date()
  const entries = await getTimeEntriesForWeek(operatorId, today)
  const timesheet = await getTimesheetForWeek(operatorId, today)

  const summary = {
    totalHours: 0,
    billableHours: 0,
    entriesCount: entries.length,
    status: timesheet?.status || 'draft',
    timesheetId: timesheet?.id || null,
    byDay: {}
  }

  // Initialize all days of week
  const monday = getWeekStart(today)
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday)
    day.setDate(monday.getDate() + i)
    summary.byDay[formatDateString(day)] = 0
  }

  entries.forEach(entry => {
    summary.totalHours += entry.totalHours || 0
    if (entry.billable) {
      summary.billableHours += entry.totalHours || 0
    }
    if (summary.byDay[entry.date] !== undefined) {
      summary.byDay[entry.date] += entry.totalHours || 0
    }
  })

  return summary
}
