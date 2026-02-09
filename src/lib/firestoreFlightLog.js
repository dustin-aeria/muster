/**
 * Firestore Flight Log Service
 * Track flight records for aircraft and pilots
 *
 * UPDATED: All queries now require organizationId for Firestore security rules
 *
 * @location src/lib/firestoreFlightLog.js
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
  getDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'
import { requireOrgId } from './firestoreQueryUtils'

// ============================================
// FLIGHT LOG TYPES
// ============================================

export const FLIGHT_PURPOSES = {
  commercial: { label: 'Commercial Operation', color: 'bg-blue-100 text-blue-700' },
  training: { label: 'Training', color: 'bg-green-100 text-green-700' },
  maintenance: { label: 'Maintenance Check', color: 'bg-amber-100 text-amber-700' },
  testing: { label: 'Test Flight', color: 'bg-purple-100 text-purple-700' },
  survey: { label: 'Survey/Mapping', color: 'bg-indigo-100 text-indigo-700' },
  inspection: { label: 'Inspection', color: 'bg-cyan-100 text-cyan-700' },
  emergency: { label: 'Emergency Response', color: 'bg-red-100 text-red-700' },
  recreational: { label: 'Recreational', color: 'bg-gray-100 text-gray-700' }
}

export const FLIGHT_STATUS = {
  planned: { label: 'Planned', color: 'bg-gray-100 text-gray-700' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700' },
  aborted: { label: 'Aborted', color: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-500' }
}

export const WEATHER_CONDITIONS = {
  vfr: { label: 'VFR', description: 'Visual Flight Rules' },
  mvfr: { label: 'MVFR', description: 'Marginal VFR' },
  ifr: { label: 'IFR', description: 'Instrument Flight Rules' },
  lifr: { label: 'LIFR', description: 'Low IFR' }
}

// ============================================
// FLIGHT LOG CRUD
// ============================================

/**
 * Create a flight log entry
 */
export async function createFlightLog(logData) {
  requireOrgId(logData.organizationId, 'create flight log')

  const log = {
    // Project and organization info
    organizationId: logData.organizationId,
    projectId: logData.projectId || null,
    projectName: logData.projectName || null,

    // Aircraft info
    aircraftId: logData.aircraftId,
    aircraftName: logData.aircraftName,
    aircraftRegistration: logData.aircraftRegistration || null,

    // Pilot info
    pilotId: logData.pilotId,
    pilotName: logData.pilotName,
    pilotRole: logData.pilotRole || 'PIC', // PIC, SIC, Observer

    // Flight details
    flightDate: logData.flightDate,
    purpose: logData.purpose || 'commercial',
    status: logData.status || 'planned',

    // Location
    takeoffLocation: logData.takeoffLocation || '',
    landingLocation: logData.landingLocation || '',
    latitude: logData.latitude || null,
    longitude: logData.longitude || null,

    // Times (in UTC)
    plannedStartTime: logData.plannedStartTime || null,
    plannedEndTime: logData.plannedEndTime || null,
    actualStartTime: logData.actualStartTime || null,
    actualEndTime: logData.actualEndTime || null,

    // Flight metrics
    flightDuration: logData.flightDuration || 0, // minutes
    flightDistance: logData.flightDistance || 0, // meters
    maxAltitude: logData.maxAltitude || 0, // meters AGL
    maxSpeed: logData.maxSpeed || 0, // m/s
    batteryCycles: logData.batteryCycles || 1,

    // Weather
    weatherConditions: logData.weatherConditions || 'vfr',
    windSpeed: logData.windSpeed || null, // m/s
    windDirection: logData.windDirection || null, // degrees
    temperature: logData.temperature || null, // celsius
    visibility: logData.visibility || null, // km

    // Notes and issues
    notes: logData.notes || '',
    preFlightChecklist: logData.preFlightChecklist || false,
    postFlightChecklist: logData.postFlightChecklist || false,
    issuesEncountered: logData.issuesEncountered || [],

    // Metadata
    createdBy: logData.createdBy,
    createdByName: logData.createdByName,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  const docRef = await addDoc(collection(db, 'flightLogs'), log)
  return { id: docRef.id, ...log }
}

/**
 * Get flight logs for a project
 * @param {string} organizationId - Required for security rules
 * @param {string} projectId - Project ID
 */
export async function getProjectFlightLogs(organizationId, projectId) {
  requireOrgId(organizationId, 'get project flight logs')

  const q = query(
    collection(db, 'flightLogs'),
    where('organizationId', '==', organizationId),
    where('projectId', '==', projectId),
    orderBy('flightDate', 'desc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    flightDate: doc.data().flightDate?.toDate?.() || doc.data().flightDate,
    createdAt: doc.data().createdAt?.toDate?.(),
    updatedAt: doc.data().updatedAt?.toDate?.()
  }))
}

/**
 * Get flight logs for an aircraft
 * @param {string} organizationId - Required for security rules
 * @param {string} aircraftId - Aircraft ID
 * @param {Object} options - Query options
 */
export async function getAircraftFlightLogs(organizationId, aircraftId, options = {}) {
  requireOrgId(organizationId, 'get aircraft flight logs')

  const { startDate = null, endDate = null, limit = 100 } = options

  let q = query(
    collection(db, 'flightLogs'),
    where('organizationId', '==', organizationId),
    where('aircraftId', '==', aircraftId),
    orderBy('flightDate', 'desc')
  )

  const snapshot = await getDocs(q)
  let logs = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    flightDate: doc.data().flightDate?.toDate?.() || doc.data().flightDate,
    createdAt: doc.data().createdAt?.toDate?.(),
    updatedAt: doc.data().updatedAt?.toDate?.()
  }))

  // Apply date filters
  if (startDate) {
    const start = new Date(startDate)
    logs = logs.filter(log => new Date(log.flightDate) >= start)
  }
  if (endDate) {
    const end = new Date(endDate)
    logs = logs.filter(log => new Date(log.flightDate) <= end)
  }

  return logs.slice(0, limit)
}

/**
 * Get flight logs for a pilot
 * @param {string} organizationId - Required for security rules
 * @param {string} pilotId - Pilot ID
 * @param {Object} options - Query options
 */
export async function getPilotFlightLogs(organizationId, pilotId, options = {}) {
  requireOrgId(organizationId, 'get pilot flight logs')

  const { startDate = null, endDate = null, limit = 100 } = options

  let q = query(
    collection(db, 'flightLogs'),
    where('organizationId', '==', organizationId),
    where('pilotId', '==', pilotId),
    orderBy('flightDate', 'desc')
  )

  const snapshot = await getDocs(q)
  let logs = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    flightDate: doc.data().flightDate?.toDate?.() || doc.data().flightDate,
    createdAt: doc.data().createdAt?.toDate?.(),
    updatedAt: doc.data().updatedAt?.toDate?.()
  }))

  // Apply date filters
  if (startDate) {
    const start = new Date(startDate)
    logs = logs.filter(log => new Date(log.flightDate) >= start)
  }
  if (endDate) {
    const end = new Date(endDate)
    logs = logs.filter(log => new Date(log.flightDate) <= end)
  }

  return logs.slice(0, limit)
}

/**
 * Get all flight logs for an organization
 */
export async function getOrganizationFlightLogs(organizationId, options = {}) {
  const { startDate = null, endDate = null, limit = 500 } = options

  let q = query(
    collection(db, 'flightLogs'),
    where('organizationId', '==', organizationId),
    orderBy('flightDate', 'desc')
  )

  const snapshot = await getDocs(q)
  let logs = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    flightDate: doc.data().flightDate?.toDate?.() || doc.data().flightDate,
    createdAt: doc.data().createdAt?.toDate?.(),
    updatedAt: doc.data().updatedAt?.toDate?.()
  }))

  // Apply date filters
  if (startDate) {
    const start = new Date(startDate)
    logs = logs.filter(log => new Date(log.flightDate) >= start)
  }
  if (endDate) {
    const end = new Date(endDate)
    logs = logs.filter(log => new Date(log.flightDate) <= end)
  }

  return logs.slice(0, limit)
}

/**
 * Get a single flight log
 */
export async function getFlightLog(logId) {
  const docRef = doc(db, 'flightLogs', logId)
  const snapshot = await getDoc(docRef)

  if (!snapshot.exists()) {
    throw new Error('Flight log not found')
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
    flightDate: snapshot.data().flightDate?.toDate?.() || snapshot.data().flightDate,
    createdAt: snapshot.data().createdAt?.toDate?.(),
    updatedAt: snapshot.data().updatedAt?.toDate?.()
  }
}

/**
 * Update a flight log
 */
export async function updateFlightLog(logId, updates) {
  const logRef = doc(db, 'flightLogs', logId)
  await updateDoc(logRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })
}

/**
 * Complete a flight log
 */
export async function completeFlightLog(logId, completionData) {
  await updateFlightLog(logId, {
    status: 'completed',
    actualEndTime: completionData.actualEndTime || new Date(),
    flightDuration: completionData.flightDuration,
    flightDistance: completionData.flightDistance || 0,
    maxAltitude: completionData.maxAltitude || 0,
    maxSpeed: completionData.maxSpeed || 0,
    postFlightChecklist: true,
    notes: completionData.notes || '',
    issuesEncountered: completionData.issuesEncountered || []
  })
}

/**
 * Delete a flight log
 */
export async function deleteFlightLog(logId) {
  await deleteDoc(doc(db, 'flightLogs', logId))
}

// ============================================
// FLIGHT LOG STATISTICS
// ============================================

/**
 * Get aircraft flight statistics
 * @param {string} organizationId - Required for security rules
 * @param {string} aircraftId - Aircraft ID
 */
export async function getAircraftFlightStats(organizationId, aircraftId) {
  const logs = await getAircraftFlightLogs(organizationId, aircraftId, { limit: 1000 })
  const completedLogs = logs.filter(log => log.status === 'completed')

  const totalFlightTime = completedLogs.reduce((sum, log) => sum + (log.flightDuration || 0), 0)
  const totalDistance = completedLogs.reduce((sum, log) => sum + (log.flightDistance || 0), 0)
  const totalCycles = completedLogs.reduce((sum, log) => sum + (log.batteryCycles || 1), 0)

  return {
    totalFlights: completedLogs.length,
    totalFlightTime, // minutes
    totalFlightHours: (totalFlightTime / 60).toFixed(1),
    totalDistance, // meters
    totalDistanceKm: (totalDistance / 1000).toFixed(1),
    totalCycles,
    averageFlightDuration: completedLogs.length > 0
      ? Math.round(totalFlightTime / completedLogs.length)
      : 0
  }
}

/**
 * Get pilot flight statistics
 * @param {string} organizationId - Required for security rules
 * @param {string} pilotId - Pilot ID
 */
export async function getPilotFlightStats(organizationId, pilotId) {
  const logs = await getPilotFlightLogs(organizationId, pilotId, { limit: 1000 })
  const completedLogs = logs.filter(log => log.status === 'completed')

  const totalFlightTime = completedLogs.reduce((sum, log) => sum + (log.flightDuration || 0), 0)
  const byPurpose = {}

  completedLogs.forEach(log => {
    const purpose = log.purpose || 'commercial'
    if (!byPurpose[purpose]) {
      byPurpose[purpose] = { count: 0, time: 0 }
    }
    byPurpose[purpose].count++
    byPurpose[purpose].time += log.flightDuration || 0
  })

  return {
    totalFlights: completedLogs.length,
    totalFlightTime, // minutes
    totalFlightHours: (totalFlightTime / 60).toFixed(1),
    byPurpose,
    recentFlights: completedLogs.slice(0, 5)
  }
}

/**
 * Get organization flight statistics
 */
export async function getOrganizationFlightStats(organizationId, options = {}) {
  const { startDate = null, endDate = null } = options
  const logs = await getOrganizationFlightLogs(organizationId, { startDate, endDate, limit: 10000 })
  const completedLogs = logs.filter(log => log.status === 'completed')

  const totalFlightTime = completedLogs.reduce((sum, log) => sum + (log.flightDuration || 0), 0)
  const totalDistance = completedLogs.reduce((sum, log) => sum + (log.flightDistance || 0), 0)

  // Group by aircraft
  const byAircraft = {}
  completedLogs.forEach(log => {
    const acId = log.aircraftId
    if (!byAircraft[acId]) {
      byAircraft[acId] = {
        name: log.aircraftName,
        count: 0,
        time: 0
      }
    }
    byAircraft[acId].count++
    byAircraft[acId].time += log.flightDuration || 0
  })

  // Group by pilot
  const byPilot = {}
  completedLogs.forEach(log => {
    const pilotId = log.pilotId
    if (!byPilot[pilotId]) {
      byPilot[pilotId] = {
        name: log.pilotName,
        count: 0,
        time: 0
      }
    }
    byPilot[pilotId].count++
    byPilot[pilotId].time += log.flightDuration || 0
  })

  // Group by month
  const byMonth = {}
  completedLogs.forEach(log => {
    const date = new Date(log.flightDate)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!byMonth[monthKey]) {
      byMonth[monthKey] = { count: 0, time: 0 }
    }
    byMonth[monthKey].count++
    byMonth[monthKey].time += log.flightDuration || 0
  })

  return {
    totalFlights: completedLogs.length,
    totalFlightTime,
    totalFlightHours: (totalFlightTime / 60).toFixed(1),
    totalDistance,
    totalDistanceKm: (totalDistance / 1000).toFixed(1),
    byAircraft,
    byPilot,
    byMonth
  }
}

export default {
  FLIGHT_PURPOSES,
  FLIGHT_STATUS,
  WEATHER_CONDITIONS,
  createFlightLog,
  getProjectFlightLogs,
  getAircraftFlightLogs,
  getPilotFlightLogs,
  getOrganizationFlightLogs,
  getFlightLog,
  updateFlightLog,
  completeFlightLog,
  deleteFlightLog,
  getAircraftFlightStats,
  getPilotFlightStats,
  getOrganizationFlightStats
}
