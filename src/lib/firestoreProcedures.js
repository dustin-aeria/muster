/**
 * firestoreProcedures.js
 * Enhanced procedure management Firestore functions
 *
 * Features:
 * - Version control with automatic snapshots
 * - Acknowledgment tracking with signatures
 * - Custom category management
 * - Default template system
 * - Role-based permissions
 * - Step-by-step procedure structure
 *
 * @location src/lib/firestoreProcedures.js
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
  Timestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from './firebase'
import { logger } from './logger'

// ============================================
// COLLECTION REFERENCES
// ============================================

const proceduresRef = collection(db, 'procedures')
const procedureVersionsRef = collection(db, 'procedureVersions')
const procedureAcknowledgmentsRef = collection(db, 'procedureAcknowledgments')
const procedureCategoriesRef = collection(db, 'procedureCategories')

// ============================================
// DEFAULT CATEGORY DEFINITIONS
// ============================================

export const DEFAULT_PROCEDURE_CATEGORIES = [
  {
    id: 'general',
    name: 'General Procedures',
    description: 'Pre-flight, post-flight, and routine operational procedures',
    icon: 'ClipboardList',
    color: 'blue',
    numberRange: { start: 'GP-001', end: 'GP-999' },
    isDefault: true,
    isActive: true,
    order: 0
  },
  {
    id: 'advanced',
    name: 'Advanced Procedures',
    description: 'BVLOS, complex operations, and specialized tasks',
    icon: 'Zap',
    color: 'purple',
    numberRange: { start: 'AP-001', end: 'AP-999' },
    isDefault: true,
    isActive: true,
    order: 1
  },
  {
    id: 'emergency',
    name: 'Emergency Procedures',
    description: 'Flyaways, lost link, injuries, and emergency response',
    icon: 'AlertTriangle',
    color: 'red',
    numberRange: { start: 'EP-001', end: 'EP-999' },
    isDefault: true,
    isActive: true,
    order: 2
  }
]

// ============================================
// PROCEDURE CATEGORIES
// ============================================

/**
 * Get all procedure categories
 * @returns {Promise<Array>} Array of category objects
 */
export async function getProcedureCategories() {
  const q = query(procedureCategoriesRef, orderBy('order', 'asc'))
  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    // Return default categories if none exist in Firestore
    return DEFAULT_PROCEDURE_CATEGORIES
  }

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Get a single category by ID
 * @param {string} id - Category ID
 * @returns {Promise<Object>}
 */
export async function getProcedureCategory(id) {
  const docRef = doc(db, 'procedureCategories', id)
  const snapshot = await getDoc(docRef)

  if (!snapshot.exists()) {
    // Check default categories
    const defaultCat = DEFAULT_PROCEDURE_CATEGORIES.find(c => c.id === id)
    if (defaultCat) return defaultCat
    throw new Error('Category not found')
  }

  return { id: snapshot.id, ...snapshot.data() }
}

/**
 * Create a new custom category
 * @param {Object} data - Category data
 * @returns {Promise<Object>}
 */
export async function createProcedureCategory(data) {
  // Get existing categories to determine next order
  const existingCategories = await getProcedureCategories()
  const maxOrder = Math.max(...existingCategories.map(c => c.order), -1)

  // Determine number prefix based on name
  const prefix = data.prefix || data.name.substring(0, 2).toUpperCase() + 'P'

  const category = {
    name: data.name,
    description: data.description || '',
    icon: data.icon || 'FolderOpen',
    color: data.color || 'gray',
    numberRange: {
      start: `${prefix}-001`,
      end: `${prefix}-999`
    },
    isDefault: false,
    isActive: true,
    order: maxOrder + 1,
    createdAt: serverTimestamp(),
    createdBy: data.createdBy || null
  }

  const docRef = await addDoc(procedureCategoriesRef, category)
  return { id: docRef.id, ...category }
}

/**
 * Update a category
 * @param {string} id - Category ID
 * @param {Object} data - Updated data
 */
export async function updateProcedureCategory(id, data) {
  const docRef = doc(db, 'procedureCategories', id)
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  })
}

/**
 * Delete a custom category (not allowed for default categories)
 * @param {string} id - Category ID
 */
export async function deleteProcedureCategory(id) {
  // Check if it's a default category
  if (DEFAULT_PROCEDURE_CATEGORIES.some(c => c.id === id)) {
    throw new Error('Cannot delete default categories')
  }

  // Check if any procedures use this category
  const proceduresQuery = query(proceduresRef, where('category', '==', id))
  const proceduresSnapshot = await getDocs(proceduresQuery)

  if (!proceduresSnapshot.empty) {
    throw new Error('Cannot delete category with existing procedures')
  }

  const docRef = doc(db, 'procedureCategories', id)
  await deleteDoc(docRef)
}

/**
 * Seed default categories to Firestore
 * @returns {Promise<void>}
 */
export async function seedDefaultProcedureCategories() {
  const batch = writeBatch(db)

  for (const category of DEFAULT_PROCEDURE_CATEGORIES) {
    const docRef = doc(db, 'procedureCategories', category.id)
    batch.set(docRef, {
      ...category,
      createdAt: serverTimestamp()
    }, { merge: true })
  }

  await batch.commit()
}

/**
 * Get next available procedure number for a category
 * @param {string} categoryId - Category ID
 * @returns {Promise<string>}
 */
export async function getNextProcedureNumber(categoryId) {
  const category = await getProcedureCategory(categoryId)
  const range = category.numberRange || { start: 'GP-001', end: 'GP-999' }

  // Extract prefix from range (e.g., "GP" from "GP-001")
  const prefix = range.start.split('-')[0]

  // Get all procedures in category
  const q = query(proceduresRef, where('category', '==', categoryId))
  const snapshot = await getDocs(q)

  // Find highest number in range
  let maxNumber = 0
  snapshot.docs.forEach(doc => {
    const number = doc.data().number
    if (number && number.startsWith(prefix)) {
      const numPart = parseInt(number.split('-')[1], 10)
      if (!isNaN(numPart) && numPart > maxNumber) {
        maxNumber = numPart
      }
    }
  })

  const nextNumber = maxNumber + 1
  const maxAllowed = parseInt(range.end.split('-')[1], 10)

  if (nextNumber > maxAllowed) {
    throw new Error(`Category number range exhausted (${range.start}-${range.end})`)
  }

  return `${prefix}-${String(nextNumber).padStart(3, '0')}`
}

// ============================================
// PROCEDURE VERSION MANAGEMENT
// ============================================

/**
 * Create a version snapshot of a procedure
 * @param {string} procedureId - Procedure ID
 * @param {Object} procedureData - Full procedure data to snapshot
 * @param {string} versionNotes - Description of changes
 * @param {string} createdBy - User ID
 * @returns {Promise<Object>}
 */
export async function createProcedureVersion(procedureId, procedureData, versionNotes = '', createdBy = null) {
  const version = {
    procedureId,
    version: procedureData.version || '1.0',
    steps: procedureData.steps || [],
    title: procedureData.title,
    description: procedureData.description,
    equipmentRequired: procedureData.equipmentRequired || [],
    personnelRequired: procedureData.personnelRequired || [],
    versionNotes,
    changedFields: [],
    previousVersionId: procedureData.previousVersionId || null,
    createdAt: serverTimestamp(),
    createdBy
  }

  const docRef = await addDoc(procedureVersionsRef, version)
  return { id: docRef.id, ...version }
}

/**
 * Get all versions of a procedure
 * @param {string} procedureId - Procedure ID
 * @returns {Promise<Array>}
 */
export async function getProcedureVersions(procedureId) {
  const q = query(
    procedureVersionsRef,
    where('procedureId', '==', procedureId),
    orderBy('createdAt', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Get a specific version
 * @param {string} versionId - Version ID
 * @returns {Promise<Object>}
 */
export async function getProcedureVersion(versionId) {
  const docRef = doc(db, 'procedureVersions', versionId)
  const snapshot = await getDoc(docRef)

  if (!snapshot.exists()) {
    throw new Error('Version not found')
  }

  return { id: snapshot.id, ...snapshot.data() }
}

/**
 * Rollback procedure to a previous version
 * Creates a new version that restores the old content
 * @param {string} procedureId - Procedure ID
 * @param {string} versionId - Version ID to restore
 * @param {string} userId - User performing the rollback
 * @returns {Promise<Object>} Updated procedure
 */
export async function rollbackProcedureToVersion(procedureId, versionId, userId = null) {
  return await runTransaction(db, async (transaction) => {
    const procedureRef = doc(db, 'procedures', procedureId)
    const versionRef = doc(db, 'procedureVersions', versionId)

    const [procedureSnap, versionSnap] = await Promise.all([
      transaction.get(procedureRef),
      transaction.get(versionRef)
    ])

    if (!procedureSnap.exists()) {
      throw new Error('Procedure not found')
    }

    if (!versionSnap.exists()) {
      throw new Error('Version not found')
    }

    const currentProcedure = procedureSnap.data()
    const oldVersion = versionSnap.data()

    // Calculate new version number (increment major)
    const currentVersionParts = (currentProcedure.version || '1.0').split('.')
    const newMajor = parseInt(currentVersionParts[0]) + 1
    const newVersion = `${newMajor}.0`

    // Create version snapshot of current state before rollback
    const versionSnapshot = {
      procedureId,
      version: currentProcedure.version,
      steps: currentProcedure.steps || [],
      title: currentProcedure.title,
      description: currentProcedure.description,
      equipmentRequired: currentProcedure.equipmentRequired || [],
      personnelRequired: currentProcedure.personnelRequired || [],
      versionNotes: `Auto-saved before rollback to version ${oldVersion.version}`,
      changedFields: [],
      previousVersionId: null,
      createdAt: serverTimestamp(),
      createdBy: userId
    }

    const newVersionRef = doc(procedureVersionsRef)
    transaction.set(newVersionRef, versionSnapshot)

    // Update procedure with old version content
    transaction.update(procedureRef, {
      steps: oldVersion.steps || [],
      equipmentRequired: oldVersion.equipmentRequired || [],
      personnelRequired: oldVersion.personnelRequired || [],
      version: newVersion,
      versionNotes: `Restored from version ${oldVersion.version}`,
      previousVersionId: newVersionRef.id,
      isLatest: true,
      updatedAt: serverTimestamp(),
      updatedBy: userId
    })

    return {
      id: procedureId,
      ...currentProcedure,
      steps: oldVersion.steps,
      equipmentRequired: oldVersion.equipmentRequired,
      personnelRequired: oldVersion.personnelRequired,
      version: newVersion
    }
  })
}

/**
 * Increment version number
 * @param {string} currentVersion - Current version string (e.g., "1.2")
 * @param {string} type - 'major' or 'minor'
 * @returns {string}
 */
export function incrementProcedureVersion(currentVersion, type = 'minor') {
  const parts = (currentVersion || '1.0').split('.')
  const major = parseInt(parts[0]) || 1
  const minor = parseInt(parts[1]) || 0

  if (type === 'major') {
    return `${major + 1}.0`
  }
  return `${major}.${minor + 1}`
}

/**
 * Compare two procedures to find changed fields
 * @param {Object} oldProcedure - Original procedure
 * @param {Object} newProcedure - Updated procedure
 * @returns {Array<string>} List of changed field names
 */
export function findChangedProcedureFields(oldProcedure, newProcedure) {
  const compareFields = ['title', 'description', 'steps', 'equipmentRequired', 'personnelRequired', 'owner', 'status']
  const changed = []

  for (const field of compareFields) {
    const oldVal = JSON.stringify(oldProcedure[field])
    const newVal = JSON.stringify(newProcedure[field])
    if (oldVal !== newVal) {
      changed.push(field)
    }
  }

  return changed
}

// ============================================
// PROCEDURE ACKNOWLEDGMENTS
// ============================================

/**
 * Create an acknowledgment record
 * @param {Object} data - Acknowledgment data
 * @returns {Promise<Object>}
 */
export async function createProcedureAcknowledgment(data) {
  const acknowledgment = {
    procedureId: data.procedureId,
    procedureVersion: data.procedureVersion,
    userId: data.userId,
    userName: data.userName || '',
    userRole: data.userRole || '',
    acknowledgedAt: serverTimestamp(),
    signatureType: data.signatureType || 'checkbox', // checkbox | typed | drawn
    signatureData: data.signatureData || null,
    expiresAt: data.expiresAt || null,
    isValid: true
  }

  const docRef = await addDoc(procedureAcknowledgmentsRef, acknowledgment)
  return { id: docRef.id, ...acknowledgment }
}

/**
 * Get all acknowledgments for a procedure
 * @param {string} procedureId - Procedure ID
 * @returns {Promise<Array>}
 */
export async function getProcedureAcknowledgments(procedureId) {
  const q = query(
    procedureAcknowledgmentsRef,
    where('procedureId', '==', procedureId),
    orderBy('acknowledgedAt', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Get all acknowledgments for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>}
 */
export async function getUserProcedureAcknowledgments(userId) {
  const q = query(
    procedureAcknowledgmentsRef,
    where('userId', '==', userId),
    orderBy('acknowledgedAt', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Get pending acknowledgments for a user
 * Checks which procedures require acknowledgment that user hasn't acknowledged
 * @param {string} userId - User ID
 * @param {string} userRole - User's role
 * @returns {Promise<Array>}
 */
export async function getPendingProcedureAcknowledgments(userId, userRole) {
  // Get all procedures that require acknowledgment
  const proceduresQuery = query(
    proceduresRef,
    where('acknowledgmentSettings.required', '==', true),
    where('status', '==', 'active')
  )
  const proceduresSnapshot = await getDocs(proceduresQuery)
  const requiredProcedures = proceduresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

  // Get user's existing acknowledgments
  const userAcks = await getUserProcedureAcknowledgments(userId)
  const acknowledgedProcedureIds = new Set(
    userAcks
      .filter(ack => ack.isValid)
      .map(ack => `${ack.procedureId}:${ack.procedureVersion}`)
  )

  // Filter to procedures user needs to acknowledge
  const pending = requiredProcedures.filter(procedure => {
    // Check if user's role is in required roles
    const requiredRoles = procedure.acknowledgmentSettings?.requiredRoles || []
    if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
      return false
    }

    // Check if already acknowledged current version
    const key = `${procedure.id}:${procedure.version}`
    return !acknowledgedProcedureIds.has(key)
  })

  return pending
}

/**
 * Check if a user has acknowledged a specific procedure version
 * @param {string} procedureId - Procedure ID
 * @param {string} procedureVersion - Procedure version
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Acknowledgment record or null
 */
export async function checkProcedureAcknowledgmentStatus(procedureId, procedureVersion, userId) {
  const q = query(
    procedureAcknowledgmentsRef,
    where('procedureId', '==', procedureId),
    where('procedureVersion', '==', procedureVersion),
    where('userId', '==', userId),
    where('isValid', '==', true),
    limit(1)
  )

  const snapshot = await getDocs(q)
  if (snapshot.empty) return null

  const docSnap = snapshot.docs[0]
  return { id: docSnap.id, ...docSnap.data() }
}

/**
 * Invalidate acknowledgments when procedure is updated to new version
 * @param {string} procedureId - Procedure ID
 * @param {string} oldVersion - Previous version
 */
export async function invalidateOldProcedureAcknowledgments(procedureId, oldVersion) {
  const q = query(
    procedureAcknowledgmentsRef,
    where('procedureId', '==', procedureId),
    where('procedureVersion', '==', oldVersion),
    where('isValid', '==', true)
  )

  const snapshot = await getDocs(q)
  const batch = writeBatch(db)

  snapshot.docs.forEach(docSnap => {
    batch.update(docSnap.ref, { isValid: false })
  })

  await batch.commit()
}

/**
 * Get acknowledgment statistics for a procedure
 * @param {string} procedureId - Procedure ID
 * @param {string} procedureVersion - Procedure version
 * @returns {Promise<Object>}
 */
export async function getProcedureAcknowledgmentStats(procedureId, procedureVersion) {
  const q = query(
    procedureAcknowledgmentsRef,
    where('procedureId', '==', procedureId),
    where('procedureVersion', '==', procedureVersion),
    where('isValid', '==', true)
  )

  const snapshot = await getDocs(q)
  const acknowledgments = snapshot.docs.map(doc => doc.data())

  return {
    total: acknowledgments.length,
    byRole: acknowledgments.reduce((acc, ack) => {
      const role = ack.userRole || 'unknown'
      acc[role] = (acc[role] || 0) + 1
      return acc
    }, {})
  }
}

// ============================================
// ENHANCED PROCEDURE CRUD
// ============================================

/**
 * Create a new procedure with full schema support
 * @param {Object} data - Procedure data
 * @returns {Promise<Object>}
 */
export async function createProcedureEnhanced(data) {
  const procedure = {
    // Core metadata
    number: data.number || '',
    title: data.title || '',
    category: data.category || 'general',
    description: data.description || '',

    // Source & Type
    type: data.type || 'custom', // default | custom
    isTemplate: data.isTemplate || false,
    derivedFrom: data.derivedFrom || null,

    // Versioning
    version: data.version || '1.0',
    versionNotes: data.versionNotes || 'Initial version',
    previousVersionId: null,
    isLatest: true,

    // Lifecycle
    effectiveDate: data.effectiveDate || new Date().toISOString().split('T')[0],
    reviewDate: data.reviewDate || '',
    lastReviewedDate: null,
    retiredDate: null,

    // Ownership & Status
    owner: data.owner || '',
    status: data.status || 'draft', // draft | pending_review | pending_approval | active | retired

    // Steps (procedure-specific)
    steps: (data.steps || []).map((step, index) => ({
      stepNumber: step.stepNumber || index + 1,
      action: step.action || '',
      details: step.details || '',
      notes: step.notes || null,
      cautions: step.cautions || null,
      checkpoints: step.checkpoints || []
    })),

    // Equipment and Personnel (procedure-specific)
    equipmentRequired: data.equipmentRequired || [],
    personnelRequired: data.personnelRequired || [],

    // Search & Organization
    keywords: data.keywords || [],
    relatedPolicies: data.relatedPolicies || [],
    regulatoryRefs: data.regulatoryRefs || [],

    // Attachments
    attachments: data.attachments || [],

    // Permissions
    permissions: data.permissions || {
      viewRoles: [], // Empty = all roles can view
      editRoles: ['admin', 'procedure_editor'],
      approveRoles: ['admin', 'procedure_approver']
    },

    // Acknowledgment settings
    acknowledgmentSettings: data.acknowledgmentSettings || {
      required: false,
      requiredRoles: [],
      deadline: null,
      reacknowledgmentPeriod: null, // days (365 = annual)
      signatureRequired: false,
      signatureType: 'checkbox'
    },

    // Audit trail
    createdAt: serverTimestamp(),
    createdBy: data.createdBy || null,
    updatedAt: serverTimestamp(),
    updatedBy: data.createdBy || null,

    // Organization reference (for multi-tenant future)
    organizationId: data.organizationId || 'default'
  }

  const docRef = await addDoc(proceduresRef, procedure)

  // Create initial version snapshot
  await createProcedureVersion(docRef.id, procedure, 'Initial version', data.createdBy)

  return { id: docRef.id, ...procedure }
}

/**
 * Update a procedure with version management
 * @param {string} id - Procedure ID
 * @param {Object} data - Updated data
 * @param {Object} options - Update options
 * @returns {Promise<Object>}
 */
export async function updateProcedureEnhanced(id, data, options = {}) {
  const { createNewVersion = false, versionType = 'minor', versionNotes = '', userId = null } = options

  return await runTransaction(db, async (transaction) => {
    const procedureRef = doc(db, 'procedures', id)
    const procedureSnap = await transaction.get(procedureRef)

    if (!procedureSnap.exists()) {
      throw new Error('Procedure not found')
    }

    const currentProcedure = procedureSnap.data()
    let updatedData = { ...data }

    if (createNewVersion) {
      // Check what fields changed
      const changedFields = findChangedProcedureFields(currentProcedure, data)

      if (changedFields.length > 0) {
        // Create version snapshot of current state
        const versionSnapshot = {
          procedureId: id,
          version: currentProcedure.version,
          steps: currentProcedure.steps || [],
          title: currentProcedure.title,
          description: currentProcedure.description,
          equipmentRequired: currentProcedure.equipmentRequired || [],
          personnelRequired: currentProcedure.personnelRequired || [],
          versionNotes: `Snapshot before update to ${incrementProcedureVersion(currentProcedure.version, versionType)}`,
          changedFields,
          previousVersionId: currentProcedure.previousVersionId || null,
          createdAt: serverTimestamp(),
          createdBy: userId
        }

        const versionRef = doc(procedureVersionsRef)
        transaction.set(versionRef, versionSnapshot)

        // Update version number
        updatedData.version = incrementProcedureVersion(currentProcedure.version, versionType)
        updatedData.versionNotes = versionNotes
        updatedData.previousVersionId = versionRef.id
      }
    }

    // Transform steps if needed
    if (updatedData.steps) {
      updatedData.steps = updatedData.steps.map((step, index) => ({
        stepNumber: step.stepNumber || index + 1,
        action: step.action || '',
        details: step.details || '',
        notes: step.notes || null,
        cautions: step.cautions || null,
        checkpoints: step.checkpoints || []
      }))
    }

    transaction.update(procedureRef, {
      ...updatedData,
      updatedAt: serverTimestamp(),
      updatedBy: userId
    })

    return { id, ...currentProcedure, ...updatedData }
  })
}

/**
 * Quick update for single procedure fields (no version tracking)
 * Used for inline editing of fields like reviewDate and status
 * @param {string} id - Procedure ID
 * @param {Object} fields - Fields to update (e.g., { reviewDate: '2025-06-01' } or { status: 'active' })
 * @param {string} userId - User making the update
 * @returns {Promise<Object>}
 */
export async function updateProcedureField(id, fields, userId = null) {
  const procedureRef = doc(db, 'procedures', id)

  await updateDoc(procedureRef, {
    ...fields,
    updatedAt: serverTimestamp(),
    updatedBy: userId
  })

  // Return the updated fields with the id
  return { id, ...fields }
}

/**
 * Get all procedures with optional filtering
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>}
 */
export async function getProceduresEnhanced(filters = {}) {
  let q = proceduresRef
  const constraints = []

  if (filters.category) {
    constraints.push(where('category', '==', filters.category))
  }

  if (filters.status) {
    constraints.push(where('status', '==', filters.status))
  }

  if (filters.type) {
    constraints.push(where('type', '==', filters.type))
  }

  if (filters.isTemplate !== undefined) {
    constraints.push(where('isTemplate', '==', filters.isTemplate))
  }

  constraints.push(orderBy('number', 'asc'))

  if (filters.limit) {
    constraints.push(limit(filters.limit))
  }

  q = query(proceduresRef, ...constraints)

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Get default template procedures
 * @returns {Promise<Array>}
 */
export async function getDefaultProcedures() {
  return getProceduresEnhanced({ type: 'default', isTemplate: true })
}

/**
 * Adopt a template procedure
 * Creates a new custom procedure derived from the template
 * @param {string} templateId - Template procedure ID
 * @param {Object} customizations - Custom values to override
 * @param {string} userId - User creating the procedure
 * @returns {Promise<Object>}
 */
export async function adoptProcedureTemplate(templateId, customizations = {}, userId = null) {
  const template = await getProcedure(templateId)

  if (!template) {
    throw new Error('Template not found')
  }

  // Get next number for category
  const nextNumber = await getNextProcedureNumber(customizations.category || template.category)

  const newProcedure = {
    ...template,
    id: undefined,
    number: nextNumber,
    type: 'custom',
    isTemplate: false,
    derivedFrom: templateId,
    status: 'draft',
    version: '1.0',
    versionNotes: `Created from template: ${template.title}`,
    previousVersionId: null,
    isLatest: true,
    createdBy: userId,
    ...customizations
  }

  // Remove template-specific fields
  delete newProcedure.id
  delete newProcedure.createdAt
  delete newProcedure.updatedAt

  return createProcedureEnhanced(newProcedure)
}

/**
 * Get procedure by ID (enhanced)
 * @param {string} id - Procedure ID
 * @returns {Promise<Object>}
 */
export async function getProcedure(id) {
  const docRef = doc(db, 'procedures', id)
  const snapshot = await getDoc(docRef)

  if (!snapshot.exists()) {
    throw new Error('Procedure not found')
  }

  return { id: snapshot.id, ...snapshot.data() }
}

/**
 * Delete a procedure and its versions
 * @param {string} id - Procedure ID
 */
export async function deleteProcedureEnhanced(id) {
  // Delete all versions
  const versionsQuery = query(procedureVersionsRef, where('procedureId', '==', id))
  const versionsSnapshot = await getDocs(versionsQuery)

  const batch = writeBatch(db)

  versionsSnapshot.docs.forEach(docSnap => {
    batch.delete(docSnap.ref)
  })

  // Delete procedure
  const procedureRef = doc(db, 'procedures', id)
  batch.delete(procedureRef)

  await batch.commit()
}

// ============================================
// PERMISSION HELPERS
// ============================================

/**
 * Check if a user can view a procedure
 * @param {Object} procedure - Procedure object
 * @param {Object} user - User object with role
 * @returns {boolean}
 */
export function canViewProcedure(procedure, user) {
  if (!procedure.permissions?.viewRoles?.length) {
    return true // No restrictions = everyone can view
  }
  return procedure.permissions.viewRoles.includes(user.role) || user.role === 'admin'
}

/**
 * Check if a user can edit a procedure
 * @param {Object} procedure - Procedure object
 * @param {Object} user - User object with role
 * @returns {boolean}
 */
export function canEditProcedure(procedure, user) {
  if (user.role === 'admin') return true
  if (user.procedurePermissions?.canEdit) return true
  return procedure.permissions?.editRoles?.includes(user.role)
}

/**
 * Check if a user can approve a procedure
 * @param {Object} procedure - Procedure object
 * @param {Object} user - User object with role
 * @returns {boolean}
 */
export function canApproveProcedure(procedure, user) {
  if (user.role === 'admin') return true
  if (user.procedurePermissions?.canApprove) return true
  return procedure.permissions?.approveRoles?.includes(user.role)
}

/**
 * Check if a user can manage categories
 * @param {Object} user - User object
 * @returns {boolean}
 */
export function canManageProcedureCategories(user) {
  return user.role === 'admin' || user.procedurePermissions?.canManageCategories
}

/**
 * Check if a user can manage default templates
 * @param {Object} user - User object
 * @returns {boolean}
 */
export function canManageProcedureDefaults(user) {
  return user.role === 'admin' || user.procedurePermissions?.canManageDefaults
}

// ============================================
// WORKFLOW HELPERS
// ============================================

/**
 * Submit procedure for review
 * @param {string} id - Procedure ID
 * @param {string} userId - User submitting
 */
export async function submitProcedureForReview(id, userId) {
  const docRef = doc(db, 'procedures', id)
  await updateDoc(docRef, {
    status: 'pending_review',
    submittedForReviewAt: serverTimestamp(),
    submittedForReviewBy: userId,
    updatedAt: serverTimestamp()
  })
}

/**
 * Submit procedure for approval
 * @param {string} id - Procedure ID
 * @param {string} userId - User submitting
 * @param {string} reviewNotes - Optional review notes
 */
export async function submitProcedureForApproval(id, userId, reviewNotes = '') {
  const docRef = doc(db, 'procedures', id)
  await updateDoc(docRef, {
    status: 'pending_approval',
    lastReviewedDate: new Date().toISOString().split('T')[0],
    reviewedBy: userId,
    reviewNotes,
    updatedAt: serverTimestamp()
  })
}

/**
 * Approve and publish a procedure
 * @param {string} id - Procedure ID
 * @param {string} userId - User approving
 */
export async function approveProcedure(id, userId) {
  const docRef = doc(db, 'procedures', id)
  await updateDoc(docRef, {
    status: 'active',
    approvedBy: userId,
    approvedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
}

/**
 * Reject a procedure
 * @param {string} id - Procedure ID
 * @param {string} userId - User rejecting
 * @param {string} reason - Rejection reason
 */
export async function rejectProcedure(id, userId, reason = '') {
  const docRef = doc(db, 'procedures', id)
  await updateDoc(docRef, {
    status: 'draft',
    rejectedBy: userId,
    rejectedAt: serverTimestamp(),
    rejectionReason: reason,
    updatedAt: serverTimestamp()
  })
}

/**
 * Retire a procedure
 * @param {string} id - Procedure ID
 * @param {string} userId - User retiring
 */
export async function retireProcedure(id, userId) {
  const docRef = doc(db, 'procedures', id)
  await updateDoc(docRef, {
    status: 'retired',
    retiredDate: new Date().toISOString().split('T')[0],
    retiredBy: userId,
    updatedAt: serverTimestamp()
  })
}

// ============================================
// PROCEDURE CONTENT UPDATE FUNCTION
// ============================================

/**
 * Update existing procedures with full content from procedureContent.js
 * This function reads the PROCEDURE_CONTENT data and updates matching procedures
 * in Firestore with the extracted step content.
 *
 * @param {string} userId - User ID performing the update
 * @returns {Promise<{success: boolean, updated: number, skipped: number, errors: Array}>}
 */
export async function updateProceduresWithContent(userId = null) {
  // Dynamically import the procedure content to avoid circular dependencies
  const { PROCEDURE_CONTENT } = await import('../data/procedureContent.js')

  const results = {
    success: true,
    updated: 0,
    skipped: 0,
    errors: []
  }

  try {
    // Get all existing procedures
    const snapshot = await getDocs(proceduresRef)

    if (snapshot.empty) {
      return { ...results, success: false, errors: ['No procedures found in database'] }
    }

    const batch = writeBatch(db)
    let batchCount = 0
    const MAX_BATCH_SIZE = 500 // Firestore limit

    for (const docSnapshot of snapshot.docs) {
      const procedure = docSnapshot.data()
      const procedureNumber = procedure.number

      // Check if we have content for this procedure
      const content = PROCEDURE_CONTENT[procedureNumber]

      if (!content) {
        results.skipped++
        continue
      }

      // Update the procedure document
      batch.update(docSnapshot.ref, {
        steps: content.steps || [],
        description: content.description || procedure.description,
        equipmentRequired: content.equipmentRequired || procedure.equipmentRequired || [],
        personnelRequired: content.personnelRequired || procedure.personnelRequired || [],
        regulatoryRefs: content.regulatoryRefs || procedure.regulatoryRefs || [],
        keywords: content.keywords || procedure.keywords || [],
        relatedPolicies: content.relatedPolicies || procedure.relatedPolicies || [],
        updatedAt: serverTimestamp(),
        updatedBy: userId
      })

      results.updated++
      batchCount++

      // Commit batch if approaching limit
      if (batchCount >= MAX_BATCH_SIZE) {
        await batch.commit()
        batchCount = 0
      }
    }

    // Commit any remaining updates
    if (batchCount > 0) {
      await batch.commit()
    }

    return results
  } catch (error) {
    logger.error('Error updating procedures with content:', error)
    return { ...results, success: false, errors: [error.message] }
  }
}

/**
 * Update a single procedure with content from procedureContent.js
 *
 * @param {string} procedureId - The Firestore document ID
 * @param {string} procedureNumber - The procedure number (e.g., "GP-001")
 * @param {string} userId - User ID performing the update
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateSingleProcedureContent(procedureId, procedureNumber, userId = null) {
  const { PROCEDURE_CONTENT } = await import('../data/procedureContent.js')

  const content = PROCEDURE_CONTENT[procedureNumber]

  if (!content) {
    return { success: false, error: `No content found for procedure ${procedureNumber}` }
  }

  try {
    const procedureRef = doc(db, 'procedures', procedureId)

    await updateDoc(procedureRef, {
      steps: content.steps || [],
      description: content.description,
      equipmentRequired: content.equipmentRequired || [],
      personnelRequired: content.personnelRequired || [],
      regulatoryRefs: content.regulatoryRefs || [],
      keywords: content.keywords || [],
      relatedPolicies: content.relatedPolicies || [],
      updatedAt: serverTimestamp(),
      updatedBy: userId
    })

    return { success: true }
  } catch (error) {
    logger.error('Error updating procedure content:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get list of procedure numbers that have content available
 * @returns {Promise<string[]>}
 */
export async function getAvailableContentProcedureNumbers() {
  const { PROCEDURE_CONTENT } = await import('../data/procedureContent.js')
  return Object.keys(PROCEDURE_CONTENT)
}

// ============================================
// SEEDING FUNCTIONS
// ============================================

/**
 * Seed default procedures from procedureContent.js
 * Creates all default procedures in Firestore
 * @param {string} userId - User ID performing the seed
 * @returns {Promise<{success: boolean, added: number, errors: Array}>}
 */
export async function seedDefaultProcedures(userId = null) {
  const { PROCEDURE_CONTENT } = await import('../data/procedureContent.js')

  const results = {
    success: true,
    added: 0,
    errors: []
  }

  try {
    const batch = writeBatch(db)
    const now = serverTimestamp()

    for (const [number, content] of Object.entries(PROCEDURE_CONTENT)) {
      const docRef = doc(proceduresRef)
      batch.set(docRef, {
        ...content,
        type: 'default',
        isTemplate: false,
        isLatest: true,
        attachments: [],
        permissions: {
          viewRoles: [],
          editRoles: ['admin', 'procedure_editor'],
          approveRoles: ['admin', 'procedure_approver']
        },
        acknowledgmentSettings: {
          required: content.category === 'emergency', // Emergency procedures require acknowledgment
          requiredRoles: content.category === 'emergency' ? ['pilot', 'visual_observer'] : [],
          deadline: null,
          reacknowledgmentPeriod: 365,
          signatureRequired: false,
          signatureType: 'checkbox'
        },
        organizationId: 'default',
        createdAt: now,
        createdBy: userId,
        updatedAt: now,
        updatedBy: userId
      })

      results.added++
    }

    await batch.commit()
    return results
  } catch (error) {
    logger.error('Error seeding default procedures:', error)
    return { ...results, success: false, errors: [error.message] }
  }
}

/**
 * Seed only missing procedures (doesn't overwrite existing)
 * @param {string} userId - User ID performing the seed
 * @returns {Promise<{success: boolean, added: number, skipped: number, errors: Array}>}
 */
export async function seedMissingProcedures(userId = null) {
  const { PROCEDURE_CONTENT } = await import('../data/procedureContent.js')

  const results = {
    success: true,
    added: 0,
    skipped: 0,
    errors: []
  }

  try {
    // Get all existing procedure numbers
    const existingSnapshot = await getDocs(proceduresRef)
    const existingNumbers = new Set(
      existingSnapshot.docs.map(doc => doc.data().number)
    )

    // Filter to only procedures that don't exist
    const missingProcedures = Object.entries(PROCEDURE_CONTENT).filter(
      ([number]) => !existingNumbers.has(number)
    )

    if (missingProcedures.length === 0) {
      return { ...results, skipped: Object.keys(PROCEDURE_CONTENT).length }
    }

    const batch = writeBatch(db)
    const now = serverTimestamp()

    for (const [number, content] of missingProcedures) {
      const docRef = doc(proceduresRef)
      batch.set(docRef, {
        ...content,
        type: 'default',
        isTemplate: false,
        isLatest: true,
        attachments: [],
        permissions: {
          viewRoles: [],
          editRoles: ['admin', 'procedure_editor'],
          approveRoles: ['admin', 'procedure_approver']
        },
        acknowledgmentSettings: {
          required: content.category === 'emergency',
          requiredRoles: content.category === 'emergency' ? ['pilot', 'visual_observer'] : [],
          deadline: null,
          reacknowledgmentPeriod: 365,
          signatureRequired: false,
          signatureType: 'checkbox'
        },
        organizationId: 'default',
        createdAt: now,
        createdBy: userId,
        updatedAt: now,
        updatedBy: userId
      })

      results.added++
    }

    results.skipped = existingNumbers.size

    await batch.commit()
    return results
  } catch (error) {
    logger.error('Error seeding missing procedures:', error)
    return { ...results, success: false, errors: [error.message] }
  }
}

/**
 * Check if procedures have been seeded
 * @returns {Promise<boolean>}
 */
export async function areProceduresSeeded() {
  const snapshot = await getDocs(query(proceduresRef, limit(1)))
  return !snapshot.empty
}

/**
 * Get procedure count by category
 * @returns {Promise<Object>}
 */
export async function getProcedureCountByCategory() {
  const snapshot = await getDocs(proceduresRef)
  const counts = {
    general: 0,
    advanced: 0,
    emergency: 0,
    total: 0
  }

  snapshot.docs.forEach(doc => {
    const category = doc.data().category
    if (counts[category] !== undefined) {
      counts[category]++
    }
    counts.total++
  })

  return counts
}
