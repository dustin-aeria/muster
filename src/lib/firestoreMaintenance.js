/**
 * firestoreMaintenance.js
 * Firebase Firestore data access layer for Preventative Maintenance System
 *
 * Collections:
 * - maintenanceSchedules: Schedule templates (e.g., "100-Hour Inspection")
 * - maintenanceRecords: Individual maintenance events/logs
 *
 * Extended fields on:
 * - equipment: maintenanceScheduleIds, currentHours, currentCycles, maintenanceStatus, isGrounded
 * - aircraft: maintenanceScheduleIds, maintenanceStatus, isGrounded, firmwareVersion
 *
 * @location src/lib/firestoreMaintenance.js
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
  runTransaction,
  Timestamp
} from 'firebase/firestore'
import { db } from './firebase'

// ============================================
// CONSTANTS (for backward compatibility with MaintenanceTracker)
// ============================================

export const MAINTENANCE_TYPES = {
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700' },
  preventive: { label: 'Preventive', color: 'bg-green-100 text-green-700' },
  corrective: { label: 'Corrective', color: 'bg-amber-100 text-amber-700' },
  emergency: { label: 'Emergency', color: 'bg-red-100 text-red-700' },
  inspection: { label: 'Inspection', color: 'bg-purple-100 text-purple-700' },
  calibration: { label: 'Calibration', color: 'bg-indigo-100 text-indigo-700' },
  firmware: { label: 'Firmware Update', color: 'bg-cyan-100 text-cyan-700' }
}

export const MAINTENANCE_STATUS = {
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-500' },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-700' }
}

// ============================================
// COLLECTION REFERENCES
// ============================================

const maintenanceSchedulesRef = collection(db, 'maintenanceSchedules')
const maintenanceRecordsRef = collection(db, 'maintenanceRecords')
const equipmentRef = collection(db, 'equipment')
const aircraftRef = collection(db, 'aircraft')

// ============================================
// MAINTENANCE SCHEDULES
// ============================================

/**
 * Get all maintenance schedules with optional filters
 * @param {string} organizationId - Organization ID (required)
 * @param {Object} filters - Optional filters (itemType, category)
 * @returns {Promise<Array>}
 */
export async function getMaintenanceSchedules(organizationId, filters = {}) {
  if (!organizationId) {
    console.warn('getMaintenanceSchedules called without organizationId')
    return []
  }

  let q = query(
    maintenanceSchedulesRef,
    where('organizationId', '==', organizationId),
    orderBy('name', 'asc')
  )

  if (filters.itemType) {
    q = query(
      maintenanceSchedulesRef,
      where('organizationId', '==', organizationId),
      where('itemType', '==', filters.itemType),
      orderBy('name', 'asc')
    )
  }

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Get a single maintenance schedule by ID
 * @param {string} id - Schedule ID
 * @returns {Promise<Object>}
 */
export async function getMaintenanceScheduleById(id) {
  const docRef = doc(db, 'maintenanceSchedules', id)
  const snapshot = await getDoc(docRef)

  if (!snapshot.exists()) {
    throw new Error('Maintenance schedule not found')
  }

  return { id: snapshot.id, ...snapshot.data() }
}

/**
 * Create a new maintenance schedule
 * @param {string} organizationId - Organization ID (required)
 * @param {Object} data - Schedule data
 * @returns {Promise<Object>}
 */
export async function createMaintenanceSchedule(organizationId, data) {
  if (!organizationId) {
    throw new Error('organizationId is required to create a maintenance schedule')
  }

  const schedule = {
    organizationId,
    name: data.name || '',
    description: data.description || '',
    itemType: data.itemType || 'equipment', // 'equipment' | 'aircraft'
    category: data.category || null,

    // Interval settings
    intervalType: data.intervalType || 'days', // 'days' | 'hours' | 'cycles' | 'flights'
    intervalValue: data.intervalValue || 0,
    warningThreshold: data.warningThreshold || 0,
    criticalThreshold: data.criticalThreshold || 0,

    // Form integration
    formTemplateId: data.formTemplateId || null,
    formTemplateName: data.formTemplateName || null,
    requiresForm: data.requiresForm || false,

    // Legacy tasks (for schedules without forms)
    tasks: data.tasks || [],

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  const docRef = await addDoc(maintenanceSchedulesRef, schedule)
  return { id: docRef.id, ...schedule }
}

/**
 * Update a maintenance schedule
 * @param {string} id - Schedule ID
 * @param {Object} data - Updated data
 */
export async function updateMaintenanceSchedule(id, data) {
  const docRef = doc(db, 'maintenanceSchedules', id)
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  })
}

/**
 * Delete a maintenance schedule
 * @param {string} id - Schedule ID
 */
export async function deleteMaintenanceSchedule(id) {
  const docRef = doc(db, 'maintenanceSchedules', id)
  await deleteDoc(docRef)
}

// ============================================
// MAINTENANCE RECORDS
// ============================================

/**
 * Get maintenance records with optional filters
 * @param {Object|string} filtersOrEquipmentId - Filters object or legacy equipmentId string
 * @returns {Promise<Array>}
 */
export async function getMaintenanceRecords(filtersOrEquipmentId = {}) {
  // Handle legacy call pattern: getMaintenanceRecords(equipmentId)
  let filters = filtersOrEquipmentId
  if (typeof filtersOrEquipmentId === 'string') {
    filters = { itemId: filtersOrEquipmentId }
  }

  let q = query(maintenanceRecordsRef, orderBy('serviceDate', 'desc'))

  if (filters.itemId) {
    q = query(maintenanceRecordsRef,
      where('itemId', '==', filters.itemId),
      orderBy('serviceDate', 'desc')
    )
  }

  // Also check legacy equipmentId field
  if (filters.equipmentId) {
    q = query(maintenanceRecordsRef,
      where('equipmentId', '==', filters.equipmentId),
      orderBy('scheduledDate', 'desc')
    )
  }

  if (filters.itemType) {
    q = query(maintenanceRecordsRef,
      where('itemType', '==', filters.itemType),
      orderBy('serviceDate', 'desc')
    )
  }

  if (filters.limit) {
    q = query(q, limit(filters.limit))
  }

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Get a single maintenance record by ID
 * @param {string} id - Record ID
 * @returns {Promise<Object>}
 */
export async function getMaintenanceRecordById(id) {
  const docRef = doc(db, 'maintenanceRecords', id)
  const snapshot = await getDoc(docRef)

  if (!snapshot.exists()) {
    throw new Error('Maintenance record not found')
  }

  return { id: snapshot.id, ...snapshot.data() }
}

/**
 * Create a new maintenance record
 * Supports both new format (itemId, itemType) and legacy format (equipmentId)
 * @param {Object} data - Record data
 * @returns {Promise<Object>}
 */
export async function createMaintenanceRecord(data) {
  // Handle legacy format conversion
  const isLegacyFormat = data.equipmentId && !data.itemId

  const record = {
    // New format fields
    itemId: data.itemId || data.equipmentId || null,
    itemType: data.itemType || (data.equipmentId ? 'equipment' : null),
    itemName: data.itemName || data.equipmentName || '',
    scheduleId: data.scheduleId || null,
    scheduleName: data.scheduleName || null,

    // Form integration
    formSubmissionId: data.formSubmissionId || null,
    formTemplateId: data.formTemplateId || null,
    formTemplateName: data.formTemplateName || null,

    // Service details
    serviceType: data.serviceType || data.type || 'scheduled',
    serviceDate: data.serviceDate || data.scheduledDate || Timestamp.now(),
    completedBy: data.completedBy || null,
    completedByName: data.completedByName || '',

    // Meter readings
    hoursAtService: data.hoursAtService || null,
    cyclesAtService: data.cyclesAtService || null,
    flightsAtService: data.flightsAtService || null,

    // Tasks completed (legacy)
    tasksCompleted: data.tasksCompleted || [],

    // Parts & costs
    partsUsed: data.partsUsed || [],
    laborHours: data.laborHours || 0,
    laborCost: data.laborCost || 0,
    partsCost: data.partsCost || 0,
    totalCost: data.totalCost || 0,

    // Documentation
    notes: data.notes || '',
    description: data.description || '',
    findings: data.findings || '',
    attachments: data.attachments || [],

    // Status - default to 'scheduled' for legacy (pending) records
    status: data.status || (isLegacyFormat ? 'scheduled' : 'completed'),

    // Legacy fields for backward compatibility
    equipmentId: data.equipmentId || data.itemId || null,
    equipmentName: data.equipmentName || data.itemName || '',
    organizationId: data.organizationId || null,
    type: data.type || data.serviceType || 'scheduled',
    scheduledDate: data.scheduledDate || data.serviceDate || null,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  const docRef = await addDoc(maintenanceRecordsRef, record)
  return { id: docRef.id, ...record }
}

/**
 * Update a maintenance record
 * @param {string} id - Record ID
 * @param {Object} data - Updated data
 */
export async function updateMaintenanceRecord(id, data) {
  const docRef = doc(db, 'maintenanceRecords', id)
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  })
}

/**
 * Delete a maintenance record
 * @param {string} id - Record ID
 */
export async function deleteMaintenanceRecord(id) {
  const docRef = doc(db, 'maintenanceRecords', id)
  await deleteDoc(docRef)
}

/**
 * Get maintenance history for a specific item
 * @param {string} itemId - Item ID
 * @param {string} itemType - 'equipment' | 'aircraft'
 * @returns {Promise<Array>}
 */
export async function getMaintenanceHistory(itemId, itemType) {
  const q = query(
    maintenanceRecordsRef,
    where('itemId', '==', itemId),
    where('itemType', '==', itemType),
    orderBy('serviceDate', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

// ============================================
// ITEM MAINTENANCE OPERATIONS
// ============================================

/**
 * Apply a maintenance schedule to an item
 * @param {string} itemId - Item ID
 * @param {string} itemType - 'equipment' | 'aircraft'
 * @param {string} scheduleId - Schedule ID to apply
 */
export async function applyScheduleToItem(itemId, itemType, scheduleId) {
  const collectionRef = itemType === 'aircraft' ? aircraftRef : equipmentRef
  const itemRef = doc(collectionRef, itemId)

  await runTransaction(db, async (transaction) => {
    const itemSnap = await transaction.get(itemRef)
    if (!itemSnap.exists()) {
      throw new Error(`${itemType} not found`)
    }

    const itemData = itemSnap.data()
    const scheduleIds = itemData.maintenanceScheduleIds || []

    if (!scheduleIds.includes(scheduleId)) {
      scheduleIds.push(scheduleId)

      // Initialize maintenance status for this schedule
      const maintenanceStatus = itemData.maintenanceStatus || {}
      maintenanceStatus[scheduleId] = {
        lastServiceDate: null,
        lastServiceHours: null,
        lastServiceCycles: null,
        nextDueDate: null,
        nextDueHours: null,
        nextDueCycles: null,
        status: 'ok'
      }

      transaction.update(itemRef, {
        maintenanceScheduleIds: scheduleIds,
        maintenanceStatus,
        updatedAt: serverTimestamp()
      })
    }
  })
}

/**
 * Remove a maintenance schedule from an item
 * @param {string} itemId - Item ID
 * @param {string} itemType - 'equipment' | 'aircraft'
 * @param {string} scheduleId - Schedule ID to remove
 */
export async function removeScheduleFromItem(itemId, itemType, scheduleId) {
  const collectionRef = itemType === 'aircraft' ? aircraftRef : equipmentRef
  const itemRef = doc(collectionRef, itemId)

  await runTransaction(db, async (transaction) => {
    const itemSnap = await transaction.get(itemRef)
    if (!itemSnap.exists()) {
      throw new Error(`${itemType} not found`)
    }

    const itemData = itemSnap.data()
    const scheduleIds = (itemData.maintenanceScheduleIds || []).filter(id => id !== scheduleId)

    // Remove maintenance status for this schedule
    const maintenanceStatus = { ...(itemData.maintenanceStatus || {}) }
    delete maintenanceStatus[scheduleId]

    transaction.update(itemRef, {
      maintenanceScheduleIds: scheduleIds,
      maintenanceStatus,
      updatedAt: serverTimestamp()
    })
  })
}

/**
 * Record maintenance completion and update item status
 * @param {string} itemId - Item ID
 * @param {string} itemType - 'equipment' | 'aircraft'
 * @param {Object} recordData - Maintenance record data
 * @returns {Promise<Object>} Created maintenance record
 */
export async function recordMaintenance(itemId, itemType, recordData) {
  // Create the maintenance record
  const record = await createMaintenanceRecord({
    ...recordData,
    itemId,
    itemType
  })

  // Update item's maintenance status if linked to a schedule
  if (recordData.scheduleId) {
    await updateItemMaintenanceStatus(itemId, itemType, recordData.scheduleId, {
      serviceDate: recordData.serviceDate,
      hoursAtService: recordData.hoursAtService,
      cyclesAtService: recordData.cyclesAtService
    })
  }

  return record
}

/**
 * Update an item's maintenance status for a specific schedule
 * @param {string} itemId - Item ID
 * @param {string} itemType - 'equipment' | 'aircraft'
 * @param {string} scheduleId - Schedule ID
 * @param {Object} serviceData - Service completion data
 */
export async function updateItemMaintenanceStatus(itemId, itemType, scheduleId, serviceData) {
  const collectionRef = itemType === 'aircraft' ? aircraftRef : equipmentRef
  const itemRef = doc(collectionRef, itemId)

  // Get the schedule to determine interval
  const schedule = await getMaintenanceScheduleById(scheduleId)

  await runTransaction(db, async (transaction) => {
    const itemSnap = await transaction.get(itemRef)
    if (!itemSnap.exists()) {
      throw new Error(`${itemType} not found`)
    }

    const itemData = itemSnap.data()
    const maintenanceStatus = { ...(itemData.maintenanceStatus || {}) }

    // Calculate next due based on interval type
    const now = serviceData.serviceDate || new Date()
    let nextDueDate = null
    let nextDueHours = null
    let nextDueCycles = null

    if (schedule.intervalType === 'days') {
      const nextDate = new Date(now)
      nextDate.setDate(nextDate.getDate() + schedule.intervalValue)
      nextDueDate = nextDate.toISOString().split('T')[0]
    } else if (schedule.intervalType === 'hours') {
      nextDueHours = (serviceData.hoursAtService || itemData.currentHours || 0) + schedule.intervalValue
    } else if (schedule.intervalType === 'cycles') {
      nextDueCycles = (serviceData.cyclesAtService || itemData.currentCycles || 0) + schedule.intervalValue
    }

    maintenanceStatus[scheduleId] = {
      lastServiceDate: now instanceof Date ? now.toISOString() : now,
      lastServiceHours: serviceData.hoursAtService || null,
      lastServiceCycles: serviceData.cyclesAtService || null,
      nextDueDate,
      nextDueHours,
      nextDueCycles,
      status: 'ok'
    }

    transaction.update(itemRef, {
      maintenanceStatus,
      updatedAt: serverTimestamp()
    })
  })
}

/**
 * Update meter readings for an item
 * @param {string} itemId - Item ID
 * @param {string} itemType - 'equipment' | 'aircraft'
 * @param {Object} meters - { hours, cycles, flights }
 */
export async function updateItemMeters(itemId, itemType, meters) {
  const collectionRef = itemType === 'aircraft' ? aircraftRef : equipmentRef
  const itemRef = doc(collectionRef, itemId)

  const updateData = {
    updatedAt: serverTimestamp()
  }

  if (meters.hours !== undefined) {
    updateData.currentHours = meters.hours
    if (itemType === 'aircraft') {
      updateData.totalFlightHours = meters.hours
    }
  }

  if (meters.cycles !== undefined) {
    updateData.currentCycles = meters.cycles
    if (itemType === 'aircraft') {
      updateData.totalCycles = meters.cycles
    }
  }

  if (meters.flights !== undefined && itemType === 'aircraft') {
    updateData.totalFlights = meters.flights
  }

  await updateDoc(itemRef, updateData)

  // Recalculate maintenance status after meter update
  await recalculateMaintenanceStatus(itemId, itemType)
}

/**
 * Recalculate maintenance status for all schedules on an item
 * @param {string} itemId - Item ID
 * @param {string} itemType - 'equipment' | 'aircraft'
 */
export async function recalculateMaintenanceStatus(itemId, itemType) {
  const collectionRef = itemType === 'aircraft' ? aircraftRef : equipmentRef
  const itemRef = doc(collectionRef, itemId)

  const itemSnap = await getDoc(itemRef)
  if (!itemSnap.exists()) return

  const itemData = itemSnap.data()
  const scheduleIds = itemData.maintenanceScheduleIds || []

  if (scheduleIds.length === 0) return

  const maintenanceStatus = { ...(itemData.maintenanceStatus || {}) }
  const today = new Date()
  const currentHours = itemData.currentHours || itemData.totalFlightHours || 0
  const currentCycles = itemData.currentCycles || itemData.totalCycles || 0

  for (const scheduleId of scheduleIds) {
    try {
      const schedule = await getMaintenanceScheduleById(scheduleId)
      const status = maintenanceStatus[scheduleId] || {}

      let newStatus = 'ok'
      let remaining = null

      if (schedule.intervalType === 'days' && status.nextDueDate) {
        const nextDue = new Date(status.nextDueDate)
        const daysUntil = Math.ceil((nextDue - today) / (1000 * 60 * 60 * 24))
        remaining = daysUntil

        if (daysUntil <= 0) {
          newStatus = 'overdue'
        } else if (daysUntil <= schedule.warningThreshold) {
          newStatus = 'due_soon'
        }
      } else if (schedule.intervalType === 'hours' && status.nextDueHours) {
        const hoursUntil = status.nextDueHours - currentHours
        remaining = hoursUntil

        if (hoursUntil <= 0) {
          newStatus = 'overdue'
        } else if (hoursUntil <= schedule.warningThreshold) {
          newStatus = 'due_soon'
        }
      } else if (schedule.intervalType === 'cycles' && status.nextDueCycles) {
        const cyclesUntil = status.nextDueCycles - currentCycles
        remaining = cyclesUntil

        if (cyclesUntil <= 0) {
          newStatus = 'overdue'
        } else if (cyclesUntil <= schedule.warningThreshold) {
          newStatus = 'due_soon'
        }
      }

      maintenanceStatus[scheduleId] = {
        ...status,
        status: newStatus,
        remaining
      }
    } catch (err) {
      console.warn(`Failed to recalculate status for schedule ${scheduleId}:`, err)
    }
  }

  await updateDoc(itemRef, {
    maintenanceStatus,
    updatedAt: serverTimestamp()
  })
}

/**
 * Ground an item (take out of service)
 * @param {string} itemId - Item ID
 * @param {string} itemType - 'equipment' | 'aircraft'
 * @param {string} reason - Reason for grounding
 * @param {string} groundedBy - User ID who grounded the item
 */
export async function groundItem(itemId, itemType, reason, groundedBy) {
  const collectionRef = itemType === 'aircraft' ? aircraftRef : equipmentRef
  const itemRef = doc(collectionRef, itemId)

  await updateDoc(itemRef, {
    isGrounded: true,
    groundedReason: reason,
    groundedDate: serverTimestamp(),
    groundedBy,
    status: itemType === 'aircraft' ? 'grounded' : 'maintenance',
    updatedAt: serverTimestamp()
  })
}

/**
 * Unground an item (return to service)
 * @param {string} itemId - Item ID
 * @param {string} itemType - 'equipment' | 'aircraft'
 * @param {string} clearedBy - User ID who cleared the item
 * @param {string} notes - Return to service notes
 */
export async function ungroundItem(itemId, itemType, clearedBy, notes = '') {
  const collectionRef = itemType === 'aircraft' ? aircraftRef : equipmentRef
  const itemRef = doc(collectionRef, itemId)

  await updateDoc(itemRef, {
    isGrounded: false,
    groundedReason: null,
    groundedDate: null,
    groundedBy: null,
    ungroundedBy: clearedBy,
    ungroundedDate: serverTimestamp(),
    ungroundedNotes: notes,
    status: itemType === 'aircraft' ? 'airworthy' : 'available',
    updatedAt: serverTimestamp()
  })
}

// ============================================
// DASHBOARD QUERIES
// ============================================

/**
 * Get maintenance dashboard statistics
 * @returns {Promise<Object>} Dashboard stats
 */
export async function getMaintenanceDashboardStats(organizationId) {
  if (!organizationId) {
    console.warn('getMaintenanceDashboardStats called without organizationId')
    return { totalItems: 0, itemsWithSchedules: 0, dueSoon: 0, overdue: 0, grounded: 0, ok: 0, dueSoonItems: [], overdueItems: [], groundedItems: [] }
  }

  // Get all equipment and aircraft for this organization
  const equipmentQuery = query(equipmentRef, where('organizationId', '==', organizationId))
  const aircraftQuery = query(aircraftRef, where('organizationId', '==', organizationId))

  const equipmentSnap = await getDocs(equipmentQuery)
  const aircraftSnap = await getDocs(aircraftQuery)

  const equipment = equipmentSnap.docs.map(doc => ({ id: doc.id, type: 'equipment', ...doc.data() }))
  const aircraft = aircraftSnap.docs.map(doc => ({ id: doc.id, type: 'aircraft', ...doc.data() }))

  const allItems = [...equipment, ...aircraft].filter(item =>
    item.status !== 'retired' && item.status !== 'sold'
  )

  const stats = {
    totalItems: allItems.length,
    itemsWithSchedules: 0,
    dueSoon: 0,
    overdue: 0,
    grounded: 0,
    ok: 0,
    dueSoonItems: [],
    overdueItems: [],
    groundedItems: []
  }

  allItems.forEach(item => {
    // Check grounded status
    if (item.isGrounded) {
      stats.grounded++
      stats.groundedItems.push(item)
      return
    }

    // Check maintenance status
    const maintenanceStatus = item.maintenanceStatus || {}
    const scheduleStatuses = Object.values(maintenanceStatus)

    if (scheduleStatuses.length > 0) {
      stats.itemsWithSchedules++

      // Find worst status
      const hasOverdue = scheduleStatuses.some(s => s.status === 'overdue')
      const hasDueSoon = scheduleStatuses.some(s => s.status === 'due_soon')

      if (hasOverdue) {
        stats.overdue++
        stats.overdueItems.push({
          ...item,
          worstStatus: 'overdue',
          scheduleStatuses
        })
      } else if (hasDueSoon) {
        stats.dueSoon++
        stats.dueSoonItems.push({
          ...item,
          worstStatus: 'due_soon',
          scheduleStatuses
        })
      } else {
        stats.ok++
      }
    }
  })

  // Sort by urgency
  stats.overdueItems.sort((a, b) => {
    const aRemaining = Math.min(...Object.values(a.scheduleStatuses).map(s => s.remaining || 0))
    const bRemaining = Math.min(...Object.values(b.scheduleStatuses).map(s => s.remaining || 0))
    return aRemaining - bRemaining
  })

  stats.dueSoonItems.sort((a, b) => {
    const aRemaining = Math.min(...Object.values(a.scheduleStatuses).map(s => s.remaining || Infinity))
    const bRemaining = Math.min(...Object.values(b.scheduleStatuses).map(s => s.remaining || Infinity))
    return aRemaining - bRemaining
  })

  return stats
}

/**
 * Get items due for maintenance soon
 * @param {string} organizationId - Organization ID
 * @param {number} daysAhead - Days to look ahead
 * @param {string} itemType - Optional filter by type
 * @returns {Promise<Array>}
 */
export async function getItemsDueSoon(organizationId, daysAhead = 30, itemType = null) {
  const stats = await getMaintenanceDashboardStats(organizationId)

  let items = [...stats.dueSoonItems, ...stats.overdueItems]

  if (itemType) {
    items = items.filter(item => item.type === itemType)
  }

  // Filter by days ahead for date-based schedules
  items = items.filter(item => {
    const scheduleStatuses = Object.values(item.scheduleStatuses || {})
    return scheduleStatuses.some(s => {
      if (s.nextDueDate) {
        const daysUntil = Math.ceil((new Date(s.nextDueDate) - new Date()) / (1000 * 60 * 60 * 24))
        return daysUntil <= daysAhead
      }
      return s.status === 'due_soon' || s.status === 'overdue'
    })
  })

  return items
}

/**
 * Get overdue items
 * @param {string} organizationId - Organization ID
 * @param {string} itemType - Optional filter by type
 * @returns {Promise<Array>}
 */
export async function getOverdueItems(organizationId, itemType = null) {
  const stats = await getMaintenanceDashboardStats(organizationId)

  let items = stats.overdueItems

  if (itemType) {
    items = items.filter(item => item.type === itemType)
  }

  return items
}

/**
 * Get upcoming maintenance events (calendar view)
 * @param {string} organizationId - Organization ID
 * @param {number} daysAhead - Days to look ahead
 * @returns {Promise<Array>}
 */
export async function getUpcomingMaintenance(organizationId, daysAhead = 90) {
  const stats = await getMaintenanceDashboardStats(organizationId)
  const events = []

  const allItems = [...stats.dueSoonItems, ...stats.overdueItems]

  allItems.forEach(item => {
    Object.entries(item.scheduleStatuses || {}).forEach(([scheduleId, status]) => {
      if (status.nextDueDate) {
        const dueDate = new Date(status.nextDueDate)
        const daysUntil = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24))

        if (daysUntil <= daysAhead) {
          events.push({
            itemId: item.id,
            itemName: item.name || item.nickname,
            itemType: item.type,
            scheduleId,
            dueDate: status.nextDueDate,
            daysUntil,
            status: status.status
          })
        }
      }
    })
  })

  // Sort by due date
  events.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

  return events
}

/**
 * Get recent maintenance activity
 * @param {string} organizationId - Organization ID
 * @param {number} limitCount - Number of records to return
 * @returns {Promise<Array>}
 */
export async function getRecentMaintenance(organizationId, limitCount = 10) {
  if (!organizationId) {
    console.warn('getRecentMaintenance called without organizationId')
    return []
  }
  const q = query(
    maintenanceRecordsRef,
    where('organizationId', '==', organizationId),
    orderBy('serviceDate', 'desc'),
    limit(limitCount)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

// ============================================
// FORM INTEGRATION HELPERS
// ============================================

/**
 * Create maintenance record from form submission
 * Called when a maintenance-linked form is submitted
 * @param {Object} formSubmission - Form submission data
 * @returns {Promise<Object>} Created maintenance record
 */
export async function createMaintenanceRecordFromForm(formSubmission) {
  // Extract maintenance-relevant fields from form submission
  const record = await createMaintenanceRecord({
    itemId: formSubmission.linkedItemId,
    itemType: formSubmission.linkedItemType,
    itemName: formSubmission.linkedItemName,
    scheduleId: formSubmission.maintenanceScheduleId,
    scheduleName: formSubmission.maintenanceScheduleName,

    formSubmissionId: formSubmission.id,
    formTemplateId: formSubmission.templateId,
    formTemplateName: formSubmission.templateName,

    serviceType: formSubmission.maintenanceType || 'scheduled',
    serviceDate: formSubmission.submittedAt,
    completedBy: formSubmission.submittedBy,
    completedByName: formSubmission.submittedByName,

    hoursAtService: formSubmission.hoursAtSubmission,
    cyclesAtService: formSubmission.cyclesAtSubmission,

    status: 'completed'
  })

  // Update item maintenance status
  if (formSubmission.maintenanceScheduleId && formSubmission.linkedItemId) {
    await updateItemMaintenanceStatus(
      formSubmission.linkedItemId,
      formSubmission.linkedItemType,
      formSubmission.maintenanceScheduleId,
      {
        serviceDate: formSubmission.submittedAt,
        hoursAtService: formSubmission.hoursAtSubmission,
        cyclesAtService: formSubmission.cyclesAtSubmission
      }
    )
  }

  return record
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get all maintainable items (equipment + aircraft combined)
 * @param {string} organizationId - Organization ID
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>}
 */
export async function getAllMaintainableItems(organizationId, filters = {}) {
  if (!organizationId) {
    console.warn('getAllMaintainableItems called without organizationId')
    return []
  }

  const equipmentQuery = query(equipmentRef, where('organizationId', '==', organizationId))
  const aircraftQuery = query(aircraftRef, where('organizationId', '==', organizationId))

  const equipmentSnap = await getDocs(equipmentQuery)
  const aircraftSnap = await getDocs(aircraftQuery)

  let equipment = equipmentSnap.docs.map(doc => ({
    id: doc.id,
    itemType: 'equipment',
    ...doc.data()
  }))

  let aircraft = aircraftSnap.docs.map(doc => ({
    id: doc.id,
    itemType: 'aircraft',
    name: doc.data().nickname, // Normalize name field
    ...doc.data()
  }))

  let items = [...equipment, ...aircraft]

  // Apply filters
  if (filters.status) {
    if (filters.status === 'grounded') {
      items = items.filter(item => item.isGrounded)
    } else if (filters.status === 'overdue' || filters.status === 'due_soon' || filters.status === 'ok') {
      items = items.filter(item => {
        const statuses = Object.values(item.maintenanceStatus || {})
        if (filters.status === 'overdue') {
          return statuses.some(s => s.status === 'overdue')
        } else if (filters.status === 'due_soon') {
          return statuses.some(s => s.status === 'due_soon') && !statuses.some(s => s.status === 'overdue')
        } else {
          return statuses.length === 0 || statuses.every(s => s.status === 'ok')
        }
      })
    }
  }

  if (filters.itemType) {
    items = items.filter(item => item.itemType === filters.itemType)
  }

  if (filters.category) {
    items = items.filter(item => item.category === filters.category)
  }

  if (filters.search) {
    const search = filters.search.toLowerCase()
    items = items.filter(item =>
      (item.name || '').toLowerCase().includes(search) ||
      (item.nickname || '').toLowerCase().includes(search) ||
      (item.serialNumber || '').toLowerCase().includes(search) ||
      (item.model || '').toLowerCase().includes(search)
    )
  }

  // Filter out retired items unless specifically requested
  if (!filters.includeRetired) {
    items = items.filter(item => item.status !== 'retired' && item.status !== 'sold')
  }

  // Sort by name
  items.sort((a, b) => (a.name || a.nickname || '').localeCompare(b.name || b.nickname || ''))

  return items
}

/**
 * Calculate overall maintenance status for an item
 * @param {Object} item - Item with maintenanceStatus
 * @returns {string} 'ok' | 'due_soon' | 'overdue' | 'grounded' | 'no_schedule'
 */
export function calculateOverallMaintenanceStatus(item) {
  if (item.isGrounded) return 'grounded'

  const maintenanceStatus = item.maintenanceStatus || {}
  const statuses = Object.values(maintenanceStatus)

  if (statuses.length === 0) return 'no_schedule'

  if (statuses.some(s => s.status === 'overdue')) return 'overdue'
  if (statuses.some(s => s.status === 'due_soon')) return 'due_soon'

  return 'ok'
}

/**
 * Get the most urgent maintenance issue for an item
 * @param {Object} item - Item with maintenanceStatus
 * @returns {Object|null} Most urgent schedule status
 */
export function getMostUrgentMaintenance(item) {
  const maintenanceStatus = item.maintenanceStatus || {}
  const entries = Object.entries(maintenanceStatus)

  if (entries.length === 0) return null

  // Sort by urgency (overdue first, then by remaining)
  entries.sort(([, a], [, b]) => {
    if (a.status === 'overdue' && b.status !== 'overdue') return -1
    if (b.status === 'overdue' && a.status !== 'overdue') return 1
    return (a.remaining || 0) - (b.remaining || 0)
  })

  const [scheduleId, status] = entries[0]
  return { scheduleId, ...status }
}

// ============================================
// LEGACY COMPATIBILITY FUNCTIONS
// For backward compatibility with MaintenanceTracker component
// ============================================

/**
 * Complete a maintenance record (legacy function for MaintenanceTracker)
 * @param {string} recordId - Record ID
 * @param {Object} completionData - Completion details
 */
export async function completeMaintenanceRecord(recordId, completionData) {
  const docRef = doc(db, 'maintenanceRecords', recordId)
  await updateDoc(docRef, {
    status: 'completed',
    completedDate: completionData.completedDate || serverTimestamp(),
    performedBy: completionData.performedBy || null,
    performedByName: completionData.performedByName || '',
    completionNotes: completionData.notes || '',
    cost: completionData.cost || null,
    parts: completionData.parts || [],
    updatedAt: serverTimestamp()
  })
}

/**
 * Get equipment health status based on maintenance records (legacy function)
 * @param {Object} equipment - Equipment object
 * @param {Array} records - Maintenance records for this equipment
 * @returns {Object} Health status with label and color
 */
export function getEquipmentHealthStatus(equipment, records = []) {
  // Check if grounded
  if (equipment?.isGrounded) {
    return { label: 'Grounded', color: 'bg-red-100 text-red-700' }
  }

  // Check maintenance status from new system
  const maintenanceStatus = equipment?.maintenanceStatus || {}
  const statuses = Object.values(maintenanceStatus)

  if (statuses.some(s => s.status === 'overdue')) {
    return { label: 'Overdue', color: 'bg-red-100 text-red-700' }
  }

  if (statuses.some(s => s.status === 'due_soon')) {
    return { label: 'Due Soon', color: 'bg-amber-100 text-amber-700' }
  }

  // Check legacy records
  const pendingRecords = records.filter(r =>
    r.status !== 'completed' && r.status !== 'cancelled'
  )

  const overdueRecords = pendingRecords.filter(r => {
    if (!r.scheduledDate) return false
    const date = r.scheduledDate instanceof Date ? r.scheduledDate : new Date(r.scheduledDate)
    return date < new Date()
  })

  if (overdueRecords.length > 0) {
    return { label: 'Overdue', color: 'bg-red-100 text-red-700' }
  }

  // Check for upcoming maintenance in next 7 days
  const upcomingRecords = pendingRecords.filter(r => {
    if (!r.scheduledDate) return false
    const date = r.scheduledDate instanceof Date ? r.scheduledDate : new Date(r.scheduledDate)
    const daysUntil = Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24))
    return daysUntil <= 7 && daysUntil > 0
  })

  if (upcomingRecords.length > 0) {
    return { label: 'Due Soon', color: 'bg-amber-100 text-amber-700' }
  }

  // Check equipment status
  if (equipment?.status === 'maintenance') {
    return { label: 'In Maintenance', color: 'bg-amber-100 text-amber-700' }
  }

  return { label: 'Good', color: 'bg-green-100 text-green-700' }
}
