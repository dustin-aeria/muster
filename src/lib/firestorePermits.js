/**
 * firestorePermits.js
 * Firestore operations for permits and certificates management
 *
 * Features:
 * - CRUD operations for permits (SFOCs, CORs, airspace authorizations, etc.)
 * - Status calculation based on expiry dates
 * - Document management integration
 * - Calendar event generation for expiries
 *
 * @location src/lib/firestorePermits.js
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'
import { logger } from './logger'

// ============================================
// CONSTANTS
// ============================================

export const PERMIT_TYPES = {
  sfoc: {
    id: 'sfoc',
    name: 'Special Flight Operations Certificate',
    shortName: 'SFOC',
    authority: 'Transport Canada',
    icon: 'FileCheck',
    color: 'blue'
  },
  cor: {
    id: 'cor',
    name: 'Certificate of Registration',
    shortName: 'COR',
    authority: 'Transport Canada',
    icon: 'Award',
    color: 'purple'
  },
  land_access: {
    id: 'land_access',
    name: 'Land Access Permit',
    shortName: 'Land Access',
    authority: 'Various',
    icon: 'MapPin',
    color: 'green'
  },
  airspace_auth: {
    id: 'airspace_auth',
    name: 'Airspace Authorization',
    shortName: 'Airspace Auth',
    authority: 'NAV CANADA',
    icon: 'Radio',
    color: 'cyan'
  },
  client_approval: {
    id: 'client_approval',
    name: 'Client Approval',
    shortName: 'Client Approval',
    authority: 'Client',
    icon: 'UserCheck',
    color: 'amber'
  },
  other: {
    id: 'other',
    name: 'Other Permit/Certificate',
    shortName: 'Other',
    authority: 'Various',
    icon: 'FileText',
    color: 'gray'
  }
}

export const PERMIT_STATUS = {
  active: {
    id: 'active',
    label: 'Active',
    color: 'green',
    bgClass: 'bg-green-100 text-green-800',
    borderClass: 'border-green-200'
  },
  expiring_soon: {
    id: 'expiring_soon',
    label: 'Expiring Soon',
    color: 'amber',
    bgClass: 'bg-amber-100 text-amber-800',
    borderClass: 'border-amber-200'
  },
  expired: {
    id: 'expired',
    label: 'Expired',
    color: 'red',
    bgClass: 'bg-red-100 text-red-800',
    borderClass: 'border-red-200'
  },
  suspended: {
    id: 'suspended',
    label: 'Suspended',
    color: 'gray',
    bgClass: 'bg-gray-100 text-gray-800',
    borderClass: 'border-gray-200'
  }
}

export const OPERATION_TYPES = [
  { id: 'vlos', label: 'VLOS Operations' },
  { id: 'bvlos', label: 'BVLOS Operations' },
  { id: 'night', label: 'Night Operations' },
  { id: 'over_people', label: 'Operations Over People' },
  { id: 'controlled_airspace', label: 'Controlled Airspace' },
  { id: 'altitude_above_400', label: 'Above 400ft AGL' },
  { id: 'urban', label: 'Urban/Built-up Areas' },
  { id: 'industrial', label: 'Industrial Sites' },
  { id: 'pipeline', label: 'Pipeline Inspection' },
  { id: 'powerline', label: 'Powerline Inspection' },
  { id: 'survey', label: 'Aerial Survey/Mapping' },
  { id: 'photography', label: 'Photography/Videography' },
  { id: 'lidar', label: 'LiDAR Operations' },
  { id: 'thermal', label: 'Thermal Imaging' }
]

export const CONDITION_CATEGORIES = [
  { id: 'operational', label: 'Operational' },
  { id: 'notification', label: 'Notification' },
  { id: 'equipment', label: 'Equipment' },
  { id: 'personnel', label: 'Personnel' },
  { id: 'reporting', label: 'Reporting' }
]

// Warning threshold in days
const EXPIRY_WARNING_DAYS = 30

// ============================================
// STATUS CALCULATION
// ============================================

/**
 * Calculate permit status based on expiry date
 * @param {Object} permit - Permit object with expiryDate
 * @returns {string} Status ID
 */
export function calculatePermitStatus(permit) {
  // If manually suspended, keep that status
  if (permit.status === 'suspended') {
    return 'suspended'
  }

  // No expiry date = always active
  if (!permit.expiryDate) {
    return 'active'
  }

  const now = new Date()
  const expiryDate = permit.expiryDate instanceof Timestamp
    ? permit.expiryDate.toDate()
    : new Date(permit.expiryDate)

  // Check if expired
  if (expiryDate < now) {
    return 'expired'
  }

  // Check if expiring soon (within warning threshold)
  const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))
  if (daysUntilExpiry <= EXPIRY_WARNING_DAYS) {
    return 'expiring_soon'
  }

  return 'active'
}

/**
 * Get days until expiry (or days since expired if negative)
 * @param {Object} permit - Permit object with expiryDate
 * @returns {number|null} Days until expiry, null if no expiry
 */
export function getDaysUntilExpiry(permit) {
  if (!permit.expiryDate) return null

  const now = new Date()
  const expiryDate = permit.expiryDate instanceof Timestamp
    ? permit.expiryDate.toDate()
    : new Date(permit.expiryDate)

  return Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))
}

// ============================================
// CRUD OPERATIONS
// ============================================

const COLLECTION = 'permits'

/**
 * Create a new permit
 * @param {Object} permitData - Permit data
 * @returns {Promise<Object>} Created permit with ID
 */
export async function createPermit(permitData) {
  try {
    const docData = {
      ...permitData,
      privileges: permitData.privileges || [],
      conditions: permitData.conditions || [],
      notificationRequirements: permitData.notificationRequirements || [],
      documents: permitData.documents || [],
      operationTypes: permitData.operationTypes || [],
      aircraftRegistrations: permitData.aircraftRegistrations || [],
      tags: permitData.tags || [],
      status: 'active',
      renewalInfo: permitData.renewalInfo || {
        isRenewalRequired: true,
        renewalLeadDays: 60,
        renewalStatus: null
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    // Calculate initial status
    docData.status = calculatePermitStatus(docData)

    const docRef = await addDoc(collection(db, COLLECTION), docData)
    logger.info('Permit created:', docRef.id)

    return { id: docRef.id, ...docData }
  } catch (error) {
    logger.error('Error creating permit:', error)
    throw error
  }
}

/**
 * Update an existing permit
 * @param {string} permitId - Permit ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export async function updatePermit(permitId, updates) {
  try {
    const docRef = doc(db, COLLECTION, permitId)

    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    }

    // Recalculate status if expiry changed
    if (updates.expiryDate !== undefined) {
      updateData.status = calculatePermitStatus({ ...updates })
    }

    await updateDoc(docRef, updateData)
    logger.info('Permit updated:', permitId)
  } catch (error) {
    logger.error('Error updating permit:', error)
    throw error
  }
}

/**
 * Get a single permit by ID
 * @param {string} permitId - Permit ID
 * @returns {Promise<Object|null>} Permit object or null
 */
export async function getPermit(permitId) {
  try {
    const docRef = doc(db, COLLECTION, permitId)
    const snapshot = await getDoc(docRef)

    if (!snapshot.exists()) {
      return null
    }

    const data = { id: snapshot.id, ...snapshot.data() }
    // Update status in case it changed
    data.status = calculatePermitStatus(data)

    return data
  } catch (error) {
    logger.error('Error getting permit:', error)
    throw error
  }
}

/**
 * Get all permits with optional filters
 * @param {Object} filters - Optional filters { type, status, operatorId }
 * @returns {Promise<Array>} Array of permits
 */
export async function getPermits(filters = {}) {
  try {
    let q = collection(db, COLLECTION)
    const constraints = []

    if (filters.operatorId) {
      constraints.push(where('operatorId', '==', filters.operatorId))
    }

    if (filters.type) {
      constraints.push(where('type', '==', filters.type))
    }

    constraints.push(orderBy('createdAt', 'desc'))

    if (constraints.length > 0) {
      q = query(q, ...constraints)
    }

    const snapshot = await getDocs(q)
    const permits = snapshot.docs.map(doc => {
      const data = { id: doc.id, ...doc.data() }
      // Update status in case it changed
      data.status = calculatePermitStatus(data)
      return data
    })

    // Filter by status client-side (since status is calculated)
    if (filters.status) {
      return permits.filter(p => p.status === filters.status)
    }

    return permits
  } catch (error) {
    logger.error('Error getting permits:', error)
    throw error
  }
}

/**
 * Delete a permit
 * @param {string} permitId - Permit ID
 * @returns {Promise<void>}
 */
export async function deletePermit(permitId) {
  try {
    const docRef = doc(db, COLLECTION, permitId)
    await deleteDoc(docRef)
    logger.info('Permit deleted:', permitId)
  } catch (error) {
    logger.error('Error deleting permit:', error)
    throw error
  }
}

// ============================================
// DOCUMENT MANAGEMENT
// ============================================

/**
 * Add a document reference to a permit
 * @param {string} permitId - Permit ID
 * @param {Object} document - Document metadata
 * @returns {Promise<void>}
 */
export async function addPermitDocument(permitId, document) {
  try {
    const permit = await getPermit(permitId)
    if (!permit) throw new Error('Permit not found')

    const documents = [...(permit.documents || []), {
      ...document,
      id: `doc_${Date.now()}`,
      uploadedAt: Timestamp.now()
    }]

    await updatePermit(permitId, { documents })
    logger.info('Document added to permit:', permitId)
  } catch (error) {
    logger.error('Error adding permit document:', error)
    throw error
  }
}

/**
 * Remove a document from a permit
 * @param {string} permitId - Permit ID
 * @param {string} documentId - Document ID to remove
 * @returns {Promise<void>}
 */
export async function removePermitDocument(permitId, documentId) {
  try {
    const permit = await getPermit(permitId)
    if (!permit) throw new Error('Permit not found')

    const documents = (permit.documents || []).filter(d => d.id !== documentId)
    await updatePermit(permitId, { documents })
    logger.info('Document removed from permit:', permitId)
  } catch (error) {
    logger.error('Error removing permit document:', error)
    throw error
  }
}

// ============================================
// PRIVILEGES & CONDITIONS
// ============================================

/**
 * Add a privilege to a permit
 * @param {string} permitId - Permit ID
 * @param {Object} privilege - Privilege data
 * @returns {Promise<void>}
 */
export async function addPrivilege(permitId, privilege) {
  try {
    const permit = await getPermit(permitId)
    if (!permit) throw new Error('Permit not found')

    const privileges = [...(permit.privileges || []), {
      ...privilege,
      id: `priv_${Date.now()}`
    }]

    await updatePermit(permitId, { privileges })
  } catch (error) {
    logger.error('Error adding privilege:', error)
    throw error
  }
}

/**
 * Add a condition to a permit
 * @param {string} permitId - Permit ID
 * @param {Object} condition - Condition data
 * @returns {Promise<void>}
 */
export async function addCondition(permitId, condition) {
  try {
    const permit = await getPermit(permitId)
    if (!permit) throw new Error('Permit not found')

    const conditions = [...(permit.conditions || []), {
      ...condition,
      id: `cond_${Date.now()}`
    }]

    await updatePermit(permitId, { conditions })
  } catch (error) {
    logger.error('Error adding condition:', error)
    throw error
  }
}

// ============================================
// METRICS & REPORTING
// ============================================

/**
 * Get permit metrics (counts by status)
 * @param {string} operatorId - Optional operator ID filter
 * @returns {Promise<Object>} Metrics object
 */
export async function getPermitMetrics(operatorId = null) {
  try {
    const permits = await getPermits(operatorId ? { operatorId } : {})

    const metrics = {
      total: permits.length,
      active: 0,
      expiring_soon: 0,
      expired: 0,
      suspended: 0,
      byType: {}
    }

    permits.forEach(permit => {
      // Count by status
      if (metrics[permit.status] !== undefined) {
        metrics[permit.status]++
      }

      // Count by type
      if (!metrics.byType[permit.type]) {
        metrics.byType[permit.type] = 0
      }
      metrics.byType[permit.type]++
    })

    return metrics
  } catch (error) {
    logger.error('Error getting permit metrics:', error)
    throw error
  }
}

/**
 * Get permit expiry events for calendar integration
 * @param {string} operatorId - Operator ID (optional, for filtering)
 * @param {number} daysAhead - Number of days ahead to look (default 365)
 * @returns {Promise<Array>} Array of calendar events
 */
export async function getPermitExpiryEvents(operatorId = null, daysAhead = 365) {
  try {
    const filters = operatorId ? { operatorId } : {}
    const permits = await getPermits(filters)

    const now = new Date()
    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000)

    const events = permits
      .filter(permit => {
        if (!permit.expiryDate) return false

        const expiryDate = permit.expiryDate instanceof Timestamp
          ? permit.expiryDate.toDate()
          : new Date(permit.expiryDate)

        // Include events within the range (past month to daysAhead)
        const pastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        return expiryDate >= pastMonth && expiryDate <= futureDate
      })
      .map(permit => {
        const expiryDate = permit.expiryDate instanceof Timestamp
          ? permit.expiryDate.toDate()
          : new Date(permit.expiryDate)

        const permitType = PERMIT_TYPES[permit.type] || PERMIT_TYPES.other

        return {
          id: `permit_expiry_${permit.id}`,
          title: `${permitType.shortName} Expires: ${permit.name}`,
          date: expiryDate,
          type: 'permit_expiry',
          source: 'permit',
          sourceId: permit.id,
          permitId: permit.id,
          permitType: permit.type,
          status: permit.status,
          subtitle: permit.permitNumber || permitType.authority,
          details: {
            permitNumber: permit.permitNumber,
            issuingAuthority: permit.issuingAuthority
          }
        }
      })

    return events
  } catch (error) {
    logger.error('Error getting permit expiry events:', error)
    throw error
  }
}

/**
 * Get permits expiring within a date range
 * @param {number} days - Number of days to look ahead
 * @returns {Promise<Array>} Array of expiring permits
 */
export async function getExpiringPermits(days = 30) {
  try {
    const permits = await getPermits()
    const now = new Date()
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

    return permits.filter(permit => {
      if (!permit.expiryDate) return false

      const expiryDate = permit.expiryDate instanceof Timestamp
        ? permit.expiryDate.toDate()
        : new Date(permit.expiryDate)

      return expiryDate >= now && expiryDate <= futureDate
    })
  } catch (error) {
    logger.error('Error getting expiring permits:', error)
    throw error
  }
}

export default {
  PERMIT_TYPES,
  PERMIT_STATUS,
  OPERATION_TYPES,
  CONDITION_CATEGORIES,
  calculatePermitStatus,
  getDaysUntilExpiry,
  createPermit,
  updatePermit,
  getPermit,
  getPermits,
  deletePermit,
  addPermitDocument,
  removePermitDocument,
  addPrivilege,
  addCondition,
  getPermitMetrics,
  getPermitExpiryEvents,
  getExpiringPermits
}
