/**
 * Firestore Equipment Assignments Service
 * Assign equipment to projects and track usage
 *
 * UPDATED: All queries now require organizationId for Firestore security rules
 *
 * @location src/lib/firestoreEquipmentAssignments.js
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
  serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'
import { requireOrgId } from './firestoreQueryUtils'

// ============================================
// ASSIGNMENT STATUS
// ============================================

export const ASSIGNMENT_STATUS = {
  reserved: { label: 'Reserved', color: 'bg-yellow-100 text-yellow-700' },
  deployed: { label: 'Deployed', color: 'bg-blue-100 text-blue-700' },
  returned: { label: 'Returned', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-700' }
}

// ============================================
// ASSIGNMENTS CRUD
// ============================================

/**
 * Create an equipment assignment
 */
export async function createEquipmentAssignment(assignmentData) {
  requireOrgId(assignmentData.organizationId, 'create equipment assignment')

  const assignment = {
    equipmentId: assignmentData.equipmentId,
    equipmentName: assignmentData.equipmentName,
    projectId: assignmentData.projectId,
    projectName: assignmentData.projectName,
    organizationId: assignmentData.organizationId,
    assignedBy: assignmentData.assignedBy,
    assignedByName: assignmentData.assignedByName,
    status: assignmentData.status || 'reserved',
    startDate: assignmentData.startDate || null,
    endDate: assignmentData.endDate || null,
    deployedDate: assignmentData.deployedDate || null,
    returnedDate: assignmentData.returnedDate || null,
    notes: assignmentData.notes || '',
    flightHoursUsed: assignmentData.flightHoursUsed || 0,
    conditionOnReturn: assignmentData.conditionOnReturn || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  const docRef = await addDoc(collection(db, 'equipmentAssignments'), assignment)
  return { id: docRef.id, ...assignment }
}

/**
 * Get assignments for a project
 * @param {string} organizationId - Required for security rules
 * @param {string} projectId - Project ID
 */
export async function getProjectAssignments(organizationId, projectId) {
  requireOrgId(organizationId, 'get project assignments')

  const q = query(
    collection(db, 'equipmentAssignments'),
    where('organizationId', '==', organizationId),
    where('projectId', '==', projectId),
    orderBy('createdAt', 'desc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    startDate: doc.data().startDate?.toDate?.() || doc.data().startDate,
    endDate: doc.data().endDate?.toDate?.() || doc.data().endDate,
    deployedDate: doc.data().deployedDate?.toDate?.() || doc.data().deployedDate,
    returnedDate: doc.data().returnedDate?.toDate?.() || doc.data().returnedDate,
    createdAt: doc.data().createdAt?.toDate?.(),
    updatedAt: doc.data().updatedAt?.toDate?.()
  }))
}

/**
 * Get assignments for equipment
 * @param {string} organizationId - Required for security rules
 * @param {string} equipmentId - Equipment ID
 */
export async function getEquipmentAssignments(organizationId, equipmentId) {
  requireOrgId(organizationId, 'get equipment assignments')

  const q = query(
    collection(db, 'equipmentAssignments'),
    where('organizationId', '==', organizationId),
    where('equipmentId', '==', equipmentId),
    orderBy('createdAt', 'desc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    startDate: doc.data().startDate?.toDate?.() || doc.data().startDate,
    endDate: doc.data().endDate?.toDate?.() || doc.data().endDate,
    deployedDate: doc.data().deployedDate?.toDate?.() || doc.data().deployedDate,
    returnedDate: doc.data().returnedDate?.toDate?.() || doc.data().returnedDate,
    createdAt: doc.data().createdAt?.toDate?.(),
    updatedAt: doc.data().updatedAt?.toDate?.()
  }))
}

/**
 * Get all active assignments for an organization
 */
export async function getActiveAssignments(organizationId) {
  const q = query(
    collection(db, 'equipmentAssignments'),
    where('organizationId', '==', organizationId),
    where('status', 'in', ['reserved', 'deployed']),
    orderBy('startDate', 'asc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    startDate: doc.data().startDate?.toDate?.() || doc.data().startDate,
    endDate: doc.data().endDate?.toDate?.() || doc.data().endDate,
    deployedDate: doc.data().deployedDate?.toDate?.() || doc.data().deployedDate,
    returnedDate: doc.data().returnedDate?.toDate?.() || doc.data().returnedDate,
    createdAt: doc.data().createdAt?.toDate?.(),
    updatedAt: doc.data().updatedAt?.toDate?.()
  }))
}

/**
 * Update an assignment
 */
export async function updateEquipmentAssignment(assignmentId, updates) {
  const assignmentRef = doc(db, 'equipmentAssignments', assignmentId)
  await updateDoc(assignmentRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })
}

/**
 * Deploy equipment (change from reserved to deployed)
 */
export async function deployEquipment(assignmentId) {
  await updateEquipmentAssignment(assignmentId, {
    status: 'deployed',
    deployedDate: new Date()
  })
}

/**
 * Return equipment
 */
export async function returnEquipment(assignmentId, returnData = {}) {
  await updateEquipmentAssignment(assignmentId, {
    status: 'returned',
    returnedDate: returnData.returnedDate || new Date(),
    flightHoursUsed: returnData.flightHoursUsed || 0,
    conditionOnReturn: returnData.conditionOnReturn || null,
    notes: returnData.notes || ''
  })
}

/**
 * Cancel an assignment
 */
export async function cancelAssignment(assignmentId, reason = '') {
  await updateEquipmentAssignment(assignmentId, {
    status: 'cancelled',
    notes: reason
  })
}

/**
 * Delete an assignment
 */
export async function deleteEquipmentAssignment(assignmentId) {
  await deleteDoc(doc(db, 'equipmentAssignments', assignmentId))
}

// ============================================
// AVAILABILITY CHECK
// ============================================

/**
 * Check if equipment is available for a date range
 * @param {string} organizationId - Required for security rules
 * @param {string} equipmentId - Equipment ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {string} excludeAssignmentId - Assignment ID to exclude
 */
export async function checkEquipmentAvailability(organizationId, equipmentId, startDate, endDate, excludeAssignmentId = null) {
  const assignments = await getEquipmentAssignments(organizationId, equipmentId)

  // Filter out the assignment being edited
  const activeAssignments = assignments.filter(a =>
    a.id !== excludeAssignmentId &&
    (a.status === 'reserved' || a.status === 'deployed')
  )

  const requestedStart = new Date(startDate)
  const requestedEnd = new Date(endDate)

  // Check for overlaps
  const conflicts = activeAssignments.filter(a => {
    const assignStart = new Date(a.startDate)
    const assignEnd = new Date(a.endDate)

    // Check if date ranges overlap
    return requestedStart <= assignEnd && requestedEnd >= assignStart
  })

  return {
    available: conflicts.length === 0,
    conflicts
  }
}

/**
 * Get equipment utilization stats
 * @param {string} organizationId - Required for security rules
 * @param {string} equipmentId - Equipment ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 */
export async function getEquipmentUtilization(organizationId, equipmentId, startDate, endDate) {
  const assignments = await getEquipmentAssignments(organizationId, equipmentId)

  const periodStart = new Date(startDate)
  const periodEnd = new Date(endDate)
  const totalDays = Math.ceil((periodEnd - periodStart) / (1000 * 60 * 60 * 24))

  // Filter assignments within period
  const periodAssignments = assignments.filter(a => {
    if (a.status === 'cancelled') return false
    const assignStart = new Date(a.startDate)
    const assignEnd = new Date(a.endDate || a.returnedDate || new Date())
    return assignStart <= periodEnd && assignEnd >= periodStart
  })

  // Calculate days used
  let daysUsed = 0
  periodAssignments.forEach(a => {
    const assignStart = new Date(Math.max(new Date(a.startDate), periodStart))
    const assignEnd = new Date(Math.min(new Date(a.endDate || a.returnedDate || new Date()), periodEnd))
    const days = Math.ceil((assignEnd - assignStart) / (1000 * 60 * 60 * 24))
    daysUsed += Math.max(0, days)
  })

  const totalFlightHours = periodAssignments.reduce((sum, a) => sum + (a.flightHoursUsed || 0), 0)

  return {
    totalDays,
    daysUsed,
    utilizationRate: totalDays > 0 ? (daysUsed / totalDays * 100).toFixed(1) : 0,
    totalAssignments: periodAssignments.length,
    totalFlightHours
  }
}

export default {
  ASSIGNMENT_STATUS,
  createEquipmentAssignment,
  getProjectAssignments,
  getEquipmentAssignments,
  getActiveAssignments,
  updateEquipmentAssignment,
  deployEquipment,
  returnEquipment,
  cancelAssignment,
  deleteEquipmentAssignment,
  checkEquipmentAvailability,
  getEquipmentUtilization
}
