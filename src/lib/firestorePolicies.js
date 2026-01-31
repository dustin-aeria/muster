/**
 * firestorePolicies.js
 * Enhanced policy management Firestore functions
 *
 * Features:
 * - Version control with automatic snapshots
 * - Acknowledgment tracking with signatures
 * - Custom category management
 * - Default template system
 * - Role-based permissions
 *
 * @location src/lib/firestorePolicies.js
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

const policiesRef = collection(db, 'policies')
const policyVersionsRef = collection(db, 'policyVersions')
const policyAcknowledgmentsRef = collection(db, 'policyAcknowledgments')
const policyCategoriesRef = collection(db, 'policyCategories')

// ============================================
// DEFAULT CATEGORY DEFINITIONS
// ============================================

export const DEFAULT_CATEGORIES = [
  {
    id: 'rpas',
    name: 'RPAS Operations',
    description: 'Policies governing remotely piloted aircraft system operations',
    icon: 'Plane',
    color: 'blue',
    numberRange: { start: 1001, end: 1999 },
    isDefault: true,
    isActive: true,
    order: 0
  },
  {
    id: 'crm',
    name: 'Crew Resource Management',
    description: 'Policies for crew coordination, communication, and decision making',
    icon: 'Users',
    color: 'purple',
    numberRange: { start: 2001, end: 2999 },
    isDefault: true,
    isActive: true,
    order: 1
  },
  {
    id: 'hse',
    name: 'Health, Safety & Environment',
    description: 'Workplace health, safety, and environmental protection policies',
    icon: 'HardHat',
    color: 'green',
    numberRange: { start: 3001, end: 3999 },
    isDefault: true,
    isActive: true,
    order: 2
  }
]

// ============================================
// POLICY CATEGORIES
// ============================================

/**
 * Get all policy categories
 * @returns {Promise<Array>} Array of category objects
 */
export async function getCategories() {
  const q = query(policyCategoriesRef, orderBy('order', 'asc'))
  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    // Return default categories if none exist in Firestore
    return DEFAULT_CATEGORIES
  }

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Get a single category by ID
 * @param {string} id - Category ID
 * @returns {Promise<Object>}
 */
export async function getCategory(id) {
  const docRef = doc(db, 'policyCategories', id)
  const snapshot = await getDoc(docRef)

  if (!snapshot.exists()) {
    // Check default categories
    const defaultCat = DEFAULT_CATEGORIES.find(c => c.id === id)
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
export async function createCategory(data) {
  // Get existing categories to determine next order and number range
  const existingCategories = await getCategories()
  const maxOrder = Math.max(...existingCategories.map(c => c.order), -1)
  const maxRangeEnd = Math.max(...existingCategories.map(c => c.numberRange?.end || 0), 3999)

  const category = {
    name: data.name,
    description: data.description || '',
    icon: data.icon || 'FolderOpen',
    color: data.color || 'gray',
    numberRange: {
      start: maxRangeEnd + 1,
      end: maxRangeEnd + 1000
    },
    isDefault: false,
    isActive: true,
    order: maxOrder + 1,
    createdAt: serverTimestamp(),
    createdBy: data.createdBy || null
  }

  const docRef = await addDoc(policyCategoriesRef, category)
  return { id: docRef.id, ...category }
}

/**
 * Update a category
 * @param {string} id - Category ID
 * @param {Object} data - Updated data
 */
export async function updateCategory(id, data) {
  const docRef = doc(db, 'policyCategories', id)
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  })
}

/**
 * Delete a custom category (not allowed for default categories)
 * @param {string} id - Category ID
 */
export async function deleteCategory(id) {
  // Check if it's a default category
  if (DEFAULT_CATEGORIES.some(c => c.id === id)) {
    throw new Error('Cannot delete default categories')
  }

  // Check if any policies use this category
  const policiesQuery = query(policiesRef, where('category', '==', id))
  const policiesSnapshot = await getDocs(policiesQuery)

  if (!policiesSnapshot.empty) {
    throw new Error('Cannot delete category with existing policies')
  }

  const docRef = doc(db, 'policyCategories', id)
  await deleteDoc(docRef)
}

/**
 * Seed default categories to Firestore
 * @returns {Promise<void>}
 */
export async function seedDefaultCategories() {
  const batch = writeBatch(db)

  for (const category of DEFAULT_CATEGORIES) {
    const docRef = doc(db, 'policyCategories', category.id)
    batch.set(docRef, {
      ...category,
      createdAt: serverTimestamp()
    }, { merge: true })
  }

  await batch.commit()
}

/**
 * Get next available policy number for a category
 * @param {string} categoryId - Category ID
 * @returns {Promise<string>}
 */
export async function getNextPolicyNumber(categoryId) {
  const category = await getCategory(categoryId)
  const range = category.numberRange || { start: 1001, end: 1999 }

  // Get all policies in category
  const q = query(policiesRef, where('category', '==', categoryId))
  const snapshot = await getDocs(q)

  // Find highest number in range
  let maxNumber = range.start - 1
  snapshot.docs.forEach(doc => {
    const num = parseInt(doc.data().number, 10)
    if (!isNaN(num) && num >= range.start && num <= range.end && num > maxNumber) {
      maxNumber = num
    }
  })

  const nextNumber = maxNumber + 1
  if (nextNumber > range.end) {
    throw new Error(`Category number range exhausted (${range.start}-${range.end})`)
  }

  return String(nextNumber)
}

// ============================================
// POLICY VERSION MANAGEMENT
// ============================================

/**
 * Create a version snapshot of a policy
 * @param {string} policyId - Policy ID
 * @param {Object} policyData - Full policy data to snapshot
 * @param {string} versionNotes - Description of changes
 * @param {string} createdBy - User ID
 * @returns {Promise<Object>}
 */
export async function createPolicyVersion(policyId, policyData, versionNotes = '', createdBy = null) {
  const version = {
    policyId,
    version: policyData.version || '1.0',
    content: policyData.content || '',
    sections: policyData.sections || [],
    title: policyData.title,
    description: policyData.description,
    versionNotes,
    changedFields: [],
    previousVersionId: policyData.previousVersionId || null,
    createdAt: serverTimestamp(),
    createdBy
  }

  const docRef = await addDoc(policyVersionsRef, version)
  return { id: docRef.id, ...version }
}

/**
 * Get all versions of a policy
 * @param {string} policyId - Policy ID
 * @returns {Promise<Array>}
 */
export async function getPolicyVersions(policyId) {
  // Query without orderBy to avoid composite index requirement
  // Sort in memory instead
  const q = query(
    policyVersionsRef,
    where('policyId', '==', policyId)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0
      const bTime = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0
      return bTime - aTime // Descending order
    })
}

/**
 * Get a specific version
 * @param {string} versionId - Version ID
 * @returns {Promise<Object>}
 */
export async function getPolicyVersion(versionId) {
  const docRef = doc(db, 'policyVersions', versionId)
  const snapshot = await getDoc(docRef)

  if (!snapshot.exists()) {
    throw new Error('Version not found')
  }

  return { id: snapshot.id, ...snapshot.data() }
}

/**
 * Rollback policy to a previous version
 * Creates a new version that restores the old content
 * @param {string} policyId - Policy ID
 * @param {string} versionId - Version ID to restore
 * @param {string} userId - User performing the rollback
 * @returns {Promise<Object>} Updated policy
 */
export async function rollbackToVersion(policyId, versionId, userId = null) {
  return await runTransaction(db, async (transaction) => {
    const policyRef = doc(db, 'policies', policyId)
    const versionRef = doc(db, 'policyVersions', versionId)

    const [policySnap, versionSnap] = await Promise.all([
      transaction.get(policyRef),
      transaction.get(versionRef)
    ])

    if (!policySnap.exists()) {
      throw new Error('Policy not found')
    }

    if (!versionSnap.exists()) {
      throw new Error('Version not found')
    }

    const currentPolicy = policySnap.data()
    const oldVersion = versionSnap.data()

    // Calculate new version number (increment major)
    const currentVersionParts = (currentPolicy.version || '1.0').split('.')
    const newMajor = parseInt(currentVersionParts[0]) + 1
    const newVersion = `${newMajor}.0`

    // Create version snapshot of current state before rollback
    const versionSnapshot = {
      policyId,
      version: currentPolicy.version,
      content: currentPolicy.content || '',
      sections: currentPolicy.sections || [],
      title: currentPolicy.title,
      description: currentPolicy.description,
      versionNotes: `Auto-saved before rollback to version ${oldVersion.version}`,
      changedFields: [],
      previousVersionId: null,
      createdAt: serverTimestamp(),
      createdBy: userId
    }

    const newVersionRef = doc(policyVersionsRef)
    transaction.set(newVersionRef, versionSnapshot)

    // Update policy with old version content
    transaction.update(policyRef, {
      content: oldVersion.content || '',
      sections: oldVersion.sections || [],
      version: newVersion,
      versionNotes: `Restored from version ${oldVersion.version}`,
      previousVersionId: newVersionRef.id,
      isLatest: true,
      updatedAt: serverTimestamp(),
      updatedBy: userId
    })

    return {
      id: policyId,
      ...currentPolicy,
      content: oldVersion.content,
      sections: oldVersion.sections,
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
export function incrementVersion(currentVersion, type = 'minor') {
  const parts = (currentVersion || '1.0').split('.')
  const major = parseInt(parts[0]) || 1
  const minor = parseInt(parts[1]) || 0

  if (type === 'major') {
    return `${major + 1}.0`
  }
  return `${major}.${minor + 1}`
}

/**
 * Compare two policies to find changed fields
 * @param {Object} oldPolicy - Original policy
 * @param {Object} newPolicy - Updated policy
 * @returns {Array<string>} List of changed field names
 */
export function findChangedFields(oldPolicy, newPolicy) {
  const compareFields = ['title', 'description', 'content', 'sections', 'owner', 'status']
  const changed = []

  for (const field of compareFields) {
    const oldVal = JSON.stringify(oldPolicy[field])
    const newVal = JSON.stringify(newPolicy[field])
    if (oldVal !== newVal) {
      changed.push(field)
    }
  }

  return changed
}

// ============================================
// POLICY ACKNOWLEDGMENTS
// ============================================

/**
 * Create an acknowledgment record
 * Sets expiry to 1 year from acknowledgment date for user-based tracking
 * @param {Object} data - Acknowledgment data
 * @returns {Promise<Object>}
 */
export async function createAcknowledgment(data) {
  // Calculate expiry date: 1 year from now
  const oneYearFromNow = new Date()
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)

  const acknowledgment = {
    policyId: data.policyId,
    policyVersion: data.policyVersion,
    userId: data.userId,
    userName: data.userName || '',
    userRole: data.userRole || '',
    acknowledgedAt: serverTimestamp(),
    signatureType: data.signatureType || 'checkbox', // checkbox | typed | drawn
    signatureData: data.signatureData || null,
    expiresAt: data.expiresAt || Timestamp.fromDate(oneYearFromNow), // Default to 1 year expiry
    isValid: true
  }

  const docRef = await addDoc(policyAcknowledgmentsRef, acknowledgment)
  return { id: docRef.id, ...acknowledgment }
}

/**
 * Get all acknowledgments for a policy
 * @param {string} policyId - Policy ID
 * @returns {Promise<Array>}
 */
export async function getAcknowledgments(policyId) {
  const q = query(
    policyAcknowledgmentsRef,
    where('policyId', '==', policyId),
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
export async function getUserAcknowledgments(userId) {
  const q = query(
    policyAcknowledgmentsRef,
    where('userId', '==', userId),
    orderBy('acknowledgedAt', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Check if an acknowledgment has expired
 * @param {Object} ack - Acknowledgment record
 * @returns {boolean}
 */
export function isAcknowledgmentExpired(ack) {
  if (!ack || !ack.expiresAt) return false
  const expiresAt = ack.expiresAt?.toDate?.() || new Date(ack.expiresAt)
  return new Date() > expiresAt
}

/**
 * Get days until acknowledgment expires
 * @param {Object} ack - Acknowledgment record
 * @returns {number|null} Days until expiry, negative if expired, null if no expiry
 */
export function getDaysUntilExpiry(ack) {
  if (!ack || !ack.expiresAt) return null
  const expiresAt = ack.expiresAt?.toDate?.() || new Date(ack.expiresAt)
  const now = new Date()
  const diffMs = expiresAt - now
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * Get pending acknowledgments for a user
 * Checks which policies require acknowledgment that user hasn't acknowledged
 * Also treats expired acknowledgments as pending
 * @param {string} userId - User ID
 * @param {string} userRole - User's role
 * @returns {Promise<Array>}
 */
export async function getPendingAcknowledgments(userId, userRole) {
  // Get all policies that require acknowledgment
  const policiesQuery = query(
    policiesRef,
    where('acknowledgmentSettings.required', '==', true),
    where('status', '==', 'active')
  )
  const policiesSnapshot = await getDocs(policiesQuery)
  const requiredPolicies = policiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

  // Get user's existing acknowledgments
  const userAcks = await getUserAcknowledgments(userId)

  // Build map of valid, non-expired acknowledgments
  const validAcknowledgments = new Map()
  userAcks.forEach(ack => {
    if (ack.isValid && !isAcknowledgmentExpired(ack)) {
      const key = `${ack.policyId}:${ack.policyVersion}`
      validAcknowledgments.set(key, ack)
    }
  })

  // Filter to policies user needs to acknowledge (including expired ones)
  const pending = requiredPolicies.filter(policy => {
    // Check if user's role is in required roles
    const requiredRoles = policy.acknowledgmentSettings?.requiredRoles || []
    if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
      return false
    }

    // Check if already has a valid, non-expired acknowledgment for current version
    const key = `${policy.id}:${policy.version}`
    return !validAcknowledgments.has(key)
  })

  return pending
}

/**
 * Check if a user has acknowledged a specific policy version
 * Includes expiry status information
 * @param {string} policyId - Policy ID
 * @param {string} policyVersion - Policy version
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Acknowledgment record with expiry status or null
 */
export async function checkAcknowledgmentStatus(policyId, policyVersion, userId) {
  const q = query(
    policyAcknowledgmentsRef,
    where('policyId', '==', policyId),
    where('policyVersion', '==', policyVersion),
    where('userId', '==', userId),
    where('isValid', '==', true),
    limit(1)
  )

  const snapshot = await getDocs(q)
  if (snapshot.empty) return null

  const docData = snapshot.docs[0]
  const ack = { id: docData.id, ...docData.data() }

  // Add computed expiry status
  ack.isExpired = isAcknowledgmentExpired(ack)
  ack.daysUntilExpiry = getDaysUntilExpiry(ack)
  ack.isExpiringSoon = ack.daysUntilExpiry !== null && ack.daysUntilExpiry <= 30 && ack.daysUntilExpiry > 0

  return ack
}

/**
 * Invalidate acknowledgments when policy is updated to new version
 * @param {string} policyId - Policy ID
 * @param {string} oldVersion - Previous version
 */
export async function invalidateOldAcknowledgments(policyId, oldVersion) {
  const q = query(
    policyAcknowledgmentsRef,
    where('policyId', '==', policyId),
    where('policyVersion', '==', oldVersion),
    where('isValid', '==', true)
  )

  const snapshot = await getDocs(q)
  const batch = writeBatch(db)

  snapshot.docs.forEach(doc => {
    batch.update(doc.ref, { isValid: false })
  })

  await batch.commit()
}

/**
 * Get acknowledgment statistics for a policy
 * @param {string} policyId - Policy ID
 * @param {string} policyVersion - Policy version
 * @returns {Promise<Object>}
 */
export async function getAcknowledgmentStats(policyId, policyVersion) {
  const q = query(
    policyAcknowledgmentsRef,
    where('policyId', '==', policyId),
    where('policyVersion', '==', policyVersion),
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
// ENHANCED POLICY CRUD
// ============================================

/**
 * Create a new policy with full schema support
 * @param {Object} data - Policy data
 * @returns {Promise<Object>}
 */
export async function createPolicyEnhanced(data) {
  const policy = {
    // Core metadata
    number: data.number || '',
    title: data.title || '',
    category: data.category || 'rpas',
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

    // Content
    content: data.content || '', // Rich text/markdown content
    sections: (data.sections || []).map((section, index) => {
      if (typeof section === 'string') {
        return { id: `section_${index}`, title: section, content: '', order: index }
      }
      return {
        id: section.id || `section_${index}`,
        title: section.title || section,
        content: section.content || '',
        order: section.order ?? index
      }
    }),

    // Search & Organization
    keywords: data.keywords || [],
    relatedPolicies: data.relatedPolicies || [],
    regulatoryRefs: data.regulatoryRefs || [],

    // Attachments
    attachments: data.attachments || [],

    // Permissions
    permissions: data.permissions || {
      viewRoles: [], // Empty = all roles can view
      editRoles: ['admin', 'policy_editor'],
      approveRoles: ['admin', 'policy_approver']
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

  const docRef = await addDoc(policiesRef, policy)

  // Create initial version snapshot
  await createPolicyVersion(docRef.id, policy, 'Initial version', data.createdBy)

  return { id: docRef.id, ...policy }
}

/**
 * Update a policy with version management
 * @param {string} id - Policy ID
 * @param {Object} data - Updated data
 * @param {Object} options - Update options
 * @returns {Promise<Object>}
 */
export async function updatePolicyEnhanced(id, data, options = {}) {
  const { createNewVersion = false, versionType = 'minor', versionNotes = '', userId = null } = options

  return await runTransaction(db, async (transaction) => {
    const policyRef = doc(db, 'policies', id)
    const policySnap = await transaction.get(policyRef)

    if (!policySnap.exists()) {
      throw new Error('Policy not found')
    }

    const currentPolicy = policySnap.data()
    let updatedData = { ...data }

    if (createNewVersion) {
      // Check what fields changed
      const changedFields = findChangedFields(currentPolicy, data)

      if (changedFields.length > 0) {
        // Create version snapshot of current state
        const versionSnapshot = {
          policyId: id,
          version: currentPolicy.version,
          content: currentPolicy.content || '',
          sections: currentPolicy.sections || [],
          title: currentPolicy.title,
          description: currentPolicy.description,
          versionNotes: `Snapshot before update to ${incrementVersion(currentPolicy.version, versionType)}`,
          changedFields,
          previousVersionId: currentPolicy.previousVersionId || null,
          createdAt: serverTimestamp(),
          createdBy: userId
        }

        const versionRef = doc(policyVersionsRef)
        transaction.set(versionRef, versionSnapshot)

        // Update version number
        updatedData.version = incrementVersion(currentPolicy.version, versionType)
        updatedData.versionNotes = versionNotes
        updatedData.previousVersionId = versionRef.id

        // Optionally invalidate old acknowledgments
        // (handled separately as it's async)
      }
    }

    // Transform sections if needed
    if (updatedData.sections) {
      updatedData.sections = updatedData.sections.map((section, index) => {
        if (typeof section === 'string') {
          return { id: `section_${index}`, title: section, content: '', order: index }
        }
        return {
          id: section.id || `section_${index}`,
          title: section.title || section,
          content: section.content || '',
          order: section.order ?? index
        }
      })
    }

    transaction.update(policyRef, {
      ...updatedData,
      updatedAt: serverTimestamp(),
      updatedBy: userId
    })

    return { id, ...currentPolicy, ...updatedData }
  })
}

/**
 * Quick update for single policy fields (no version tracking)
 * Used for inline editing of fields like reviewDate and status
 * @param {string} id - Policy ID
 * @param {Object} fields - Fields to update (e.g., { reviewDate: '2025-06-01' } or { status: 'active' })
 * @param {string} userId - User making the update
 * @returns {Promise<Object>}
 */
export async function updatePolicyField(id, fields, userId = null) {
  const policyRef = doc(db, 'policies', id)

  await updateDoc(policyRef, {
    ...fields,
    updatedAt: serverTimestamp(),
    updatedBy: userId
  })

  // Return the updated fields with the id
  return { id, ...fields }
}

/**
 * Get all policies with optional filtering
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>}
 */
export async function getPoliciesEnhanced(filters = {}) {
  let q = policiesRef
  const constraints = []

  // REQUIRED: Filter by organizationId for Firestore security rules
  if (filters.organizationId) {
    constraints.push(where('organizationId', '==', filters.organizationId))
  }

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

  q = query(policiesRef, ...constraints)

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Get default template policies
 * @returns {Promise<Array>}
 */
export async function getDefaultPolicies() {
  return getPoliciesEnhanced({ type: 'default', isTemplate: true })
}

/**
 * Adopt a template policy
 * Creates a new custom policy derived from the template
 * @param {string} templateId - Template policy ID
 * @param {Object} customizations - Custom values to override
 * @param {string} userId - User creating the policy
 * @returns {Promise<Object>}
 */
export async function adoptTemplate(templateId, customizations = {}, userId = null) {
  const template = await getPolicy(templateId)

  if (!template) {
    throw new Error('Template not found')
  }

  // Get next number for category
  const nextNumber = await getNextPolicyNumber(customizations.category || template.category)

  const newPolicy = {
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
  delete newPolicy.id
  delete newPolicy.createdAt
  delete newPolicy.updatedAt

  return createPolicyEnhanced(newPolicy)
}

/**
 * Get policy by ID (enhanced)
 * @param {string} id - Policy ID
 * @returns {Promise<Object>}
 */
export async function getPolicy(id) {
  const docRef = doc(db, 'policies', id)
  const snapshot = await getDoc(docRef)

  if (!snapshot.exists()) {
    throw new Error('Policy not found')
  }

  return { id: snapshot.id, ...snapshot.data() }
}

/**
 * Delete a policy and its versions
 * @param {string} id - Policy ID
 */
export async function deletePolicyEnhanced(id) {
  // Delete all versions
  const versionsQuery = query(policyVersionsRef, where('policyId', '==', id))
  const versionsSnapshot = await getDocs(versionsQuery)

  const batch = writeBatch(db)

  versionsSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref)
  })

  // Delete policy
  const policyRef = doc(db, 'policies', id)
  batch.delete(policyRef)

  await batch.commit()
}

// ============================================
// PERMISSION HELPERS
// ============================================

/**
 * Check if a user can view a policy
 * @param {Object} policy - Policy object
 * @param {Object} user - User object with role
 * @returns {boolean}
 */
export function canViewPolicy(policy, user) {
  if (!policy.permissions?.viewRoles?.length) {
    return true // No restrictions = everyone can view
  }
  return policy.permissions.viewRoles.includes(user.role) || user.role === 'admin'
}

/**
 * Check if a user can edit a policy
 * @param {Object} policy - Policy object
 * @param {Object} user - User object with role
 * @returns {boolean}
 */
export function canEditPolicy(policy, user) {
  if (user.role === 'admin') return true
  if (user.policyPermissions?.canEdit) return true
  return policy.permissions?.editRoles?.includes(user.role)
}

/**
 * Check if a user can approve a policy
 * @param {Object} policy - Policy object
 * @param {Object} user - User object with role
 * @returns {boolean}
 */
export function canApprovePolicy(policy, user) {
  if (user.role === 'admin') return true
  if (user.policyPermissions?.canApprove) return true
  return policy.permissions?.approveRoles?.includes(user.role)
}

/**
 * Check if a user can manage categories
 * @param {Object} user - User object
 * @returns {boolean}
 */
export function canManageCategories(user) {
  return user.role === 'admin' || user.policyPermissions?.canManageCategories
}

/**
 * Check if a user can manage default templates
 * @param {Object} user - User object
 * @returns {boolean}
 */
export function canManageDefaults(user) {
  return user.role === 'admin' || user.policyPermissions?.canManageDefaults
}

// ============================================
// WORKFLOW HELPERS
// ============================================

/**
 * Submit policy for review
 * @param {string} id - Policy ID
 * @param {string} userId - User submitting
 */
export async function submitForReview(id, userId) {
  const docRef = doc(db, 'policies', id)
  await updateDoc(docRef, {
    status: 'pending_review',
    submittedForReviewAt: serverTimestamp(),
    submittedForReviewBy: userId,
    updatedAt: serverTimestamp()
  })
}

/**
 * Submit policy for approval
 * @param {string} id - Policy ID
 * @param {string} userId - User submitting
 * @param {string} reviewNotes - Optional review notes
 */
export async function submitForApproval(id, userId, reviewNotes = '') {
  const docRef = doc(db, 'policies', id)
  await updateDoc(docRef, {
    status: 'pending_approval',
    lastReviewedDate: new Date().toISOString().split('T')[0],
    reviewedBy: userId,
    reviewNotes,
    updatedAt: serverTimestamp()
  })
}

/**
 * Approve and publish a policy
 * @param {string} id - Policy ID
 * @param {string} userId - User approving
 */
export async function approvePolicy(id, userId) {
  const docRef = doc(db, 'policies', id)
  await updateDoc(docRef, {
    status: 'active',
    approvedBy: userId,
    approvedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
}

/**
 * Reject a policy
 * @param {string} id - Policy ID
 * @param {string} userId - User rejecting
 * @param {string} reason - Rejection reason
 */
export async function rejectPolicy(id, userId, reason = '') {
  const docRef = doc(db, 'policies', id)
  await updateDoc(docRef, {
    status: 'draft',
    rejectedBy: userId,
    rejectedAt: serverTimestamp(),
    rejectionReason: reason,
    updatedAt: serverTimestamp()
  })
}

/**
 * Retire a policy
 * @param {string} id - Policy ID
 * @param {string} userId - User retiring
 */
export async function retirePolicy(id, userId) {
  const docRef = doc(db, 'policies', id)
  await updateDoc(docRef, {
    status: 'retired',
    retiredDate: new Date().toISOString().split('T')[0],
    retiredBy: userId,
    updatedAt: serverTimestamp()
  })
}

// ============================================
// POLICY CONTENT UPDATE FUNCTION
// ============================================

/**
 * Update existing policies with full content from policyContent.js
 * This function reads the POLICY_CONTENT data and updates matching policies
 * in Firestore with the extracted section content.
 *
 * @param {string} userId - User ID performing the update
 * @returns {Promise<{success: boolean, updated: number, skipped: number, errors: Array}>}
 */
export async function updatePoliciesWithContent(userId = null) {
  // Dynamically import the policy content to avoid circular dependencies
  const { POLICY_CONTENT } = await import('../data/policyContent.js')

  const results = {
    success: true,
    updated: 0,
    skipped: 0,
    errors: []
  }

  try {
    // Get all existing policies
    const snapshot = await getDocs(policiesRef)

    if (snapshot.empty) {
      return { ...results, success: false, errors: ['No policies found in database'] }
    }

    const batch = writeBatch(db)
    let batchCount = 0
    const MAX_BATCH_SIZE = 500 // Firestore limit

    for (const docSnapshot of snapshot.docs) {
      const policy = docSnapshot.data()
      const policyNumber = policy.number

      // Check if we have content for this policy
      const content = POLICY_CONTENT[policyNumber]

      if (!content) {
        results.skipped++
        continue
      }

      // Transform sections to include content
      const updatedSections = content.sections.map((section, index) => ({
        id: `section_${index}`,
        title: section.title,
        content: section.content || '',
        order: index
      }))

      // Update the policy document
      batch.update(docSnapshot.ref, {
        sections: updatedSections,
        description: content.description || policy.description,
        regulatoryRefs: content.regulatoryRefs || policy.regulatoryRefs || [],
        keywords: content.keywords || policy.keywords || [],
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
    logger.error('Error updating policies with content:', error)
    return { ...results, success: false, errors: [error.message] }
  }
}

/**
 * Update a single policy with content from policyContent.js
 *
 * @param {string} policyId - The Firestore document ID
 * @param {string} policyNumber - The policy number (e.g., "1001")
 * @param {string} userId - User ID performing the update
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateSinglePolicyContent(policyId, policyNumber, userId = null) {
  const { POLICY_CONTENT } = await import('../data/policyContent.js')

  const content = POLICY_CONTENT[policyNumber]

  if (!content) {
    return { success: false, error: `No content found for policy ${policyNumber}` }
  }

  try {
    const policyRef = doc(db, 'policies', policyId)

    const updatedSections = content.sections.map((section, index) => ({
      id: `section_${index}`,
      title: section.title,
      content: section.content || '',
      order: index
    }))

    await updateDoc(policyRef, {
      sections: updatedSections,
      description: content.description,
      regulatoryRefs: content.regulatoryRefs || [],
      keywords: content.keywords || [],
      updatedAt: serverTimestamp(),
      updatedBy: userId
    })

    return { success: true }
  } catch (error) {
    logger.error('Error updating policy content:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get list of policy numbers that have content available
 * @returns {Promise<string[]>}
 */
export async function getAvailableContentPolicyNumbers() {
  const { getAvailablePolicyNumbers } = await import('../data/policyContent.js')
  return getAvailablePolicyNumbers()
}

// ============================================
// SAMPLE POLICIES DATA
// ============================================

// Sample policies data - defined at module level so it can be reused
const SAMPLE_POLICIES = [
    // RPAS Operations (1001-1012)
    {
      number: '1001',
      title: 'RPAS Operations Policy',
      category: 'rpas',
      description: 'Establishes the framework for all remotely piloted aircraft system operations, defining responsibilities, authorization requirements, and operational standards.',
      version: '3.0',
      effectiveDate: '2025-01-15',
      reviewDate: '2026-01-15',
      owner: 'Chief Pilot',
      status: 'active',
      keywords: ['operations', 'framework', 'authorization', 'standards', 'rpas', 'drone'],
      relatedPolicies: ['1002', '1003', '1009'],
      regulatoryRefs: ['CARs 901', 'CARs 903', 'SFOC Guidelines'],
      sections: [
        { id: '1', title: 'Purpose and Scope', content: '', order: 1 },
        { id: '2', title: 'Responsibilities', content: '', order: 2 },
        { id: '3', title: 'Authorization Requirements', content: '', order: 3 },
        { id: '4', title: 'Operational Categories', content: '', order: 4 },
        { id: '5', title: 'Training Requirements', content: '', order: 5 },
        { id: '6', title: 'Documentation', content: '', order: 6 },
        { id: '7', title: 'Compliance Monitoring', content: '', order: 7 }
      ]
    },
    {
      number: '1002',
      title: 'Flight Authorization Procedure',
      category: 'rpas',
      description: 'Defines the process for obtaining internal flight authorization, including risk assessment review, crew qualification verification, and operational approval.',
      version: '2.1',
      effectiveDate: '2024-09-01',
      reviewDate: '2025-09-01',
      owner: 'Operations Manager',
      status: 'active',
      keywords: ['authorization', 'approval', 'risk assessment', 'flight', 'permission'],
      relatedPolicies: ['1001', '1005', '1006'],
      regulatoryRefs: ['CARs 901.71', 'CARs 903.03'],
      sections: [
        { id: '1', title: 'Authorization Request Process', content: '', order: 1 },
        { id: '2', title: 'Risk Assessment Requirements', content: '', order: 2 },
        { id: '3', title: 'Crew Qualification Verification', content: '', order: 3 },
        { id: '4', title: 'Site Survey Requirements', content: '', order: 4 },
        { id: '5', title: 'Approval Authority Matrix', content: '', order: 5 },
        { id: '6', title: 'Documentation Requirements', content: '', order: 6 }
      ]
    },
    {
      number: '1003',
      title: 'Airspace Authorization',
      category: 'rpas',
      description: 'Procedures for obtaining airspace authorization from NAV CANADA and operating in controlled airspace, including NOTAM requirements.',
      version: '2.0',
      effectiveDate: '2024-06-15',
      reviewDate: '2025-06-15',
      owner: 'Chief Pilot',
      status: 'active',
      keywords: ['airspace', 'NAV CANADA', 'controlled', 'authorization', 'ATC'],
      relatedPolicies: ['1001', '1004'],
      regulatoryRefs: ['CARs 901.64', 'CARs 901.65', 'NAV CANADA RPAS Guidelines'],
      sections: [
        { id: '1', title: 'Airspace Classification Overview', content: '', order: 1 },
        { id: '2', title: 'Authorization Requirements by Class', content: '', order: 2 },
        { id: '3', title: 'NAV CANADA Application Process', content: '', order: 3 },
        { id: '4', title: 'NOTAM Procedures', content: '', order: 4 },
        { id: '5', title: 'Real-time Coordination', content: '', order: 5 },
        { id: '6', title: 'Emergency Procedures', content: '', order: 6 }
      ]
    },
    {
      number: '1004',
      title: 'NOTAM Procedures',
      category: 'rpas',
      description: 'Procedures for filing, managing, and monitoring NOTAMs for drone operations, including timing requirements and coordination protocols.',
      version: '1.5',
      effectiveDate: '2024-08-01',
      reviewDate: '2025-08-01',
      owner: 'Operations Manager',
      status: 'active',
      keywords: ['NOTAM', 'notice', 'airmen', 'filing', 'airspace'],
      relatedPolicies: ['1003'],
      regulatoryRefs: ['CARs 602.73', 'NAV CANADA NOTAM Manual'],
      sections: [
        { id: '1', title: 'NOTAM Requirements', content: '', order: 1 },
        { id: '2', title: 'Filing Procedures', content: '', order: 2 },
        { id: '3', title: 'Timing Requirements', content: '', order: 3 },
        { id: '4', title: 'Content Standards', content: '', order: 4 },
        { id: '5', title: 'Monitoring and Updates', content: '', order: 5 },
        { id: '6', title: 'Cancellation Procedures', content: '', order: 6 }
      ]
    },
    {
      number: '1005',
      title: 'Weather Minimums and Limitations',
      category: 'rpas',
      description: 'Defines weather minimums for safe operations, including visibility, wind, precipitation, and temperature limitations for different aircraft types.',
      version: '2.2',
      effectiveDate: '2024-11-01',
      reviewDate: '2025-11-01',
      owner: 'Chief Pilot',
      status: 'active',
      keywords: ['weather', 'minimums', 'wind', 'visibility', 'conditions', 'limitations'],
      relatedPolicies: ['1002', '1006'],
      regulatoryRefs: ['CARs 901.22', 'Manufacturer Limitations'],
      sections: [
        { id: '1', title: 'Weather Assessment Requirements', content: '', order: 1 },
        { id: '2', title: 'Visibility Minimums', content: '', order: 2 },
        { id: '3', title: 'Wind Limitations', content: '', order: 3 },
        { id: '4', title: 'Precipitation Restrictions', content: '', order: 4 },
        { id: '5', title: 'Temperature Limits', content: '', order: 5 },
        { id: '6', title: 'Weather Monitoring During Operations', content: '', order: 6 }
      ]
    },
    {
      number: '1006',
      title: 'Emergency Procedures',
      category: 'rpas',
      description: 'Standard emergency procedures for RPAS operations including flyaways, loss of control link, battery emergencies, and collision response.',
      version: '3.1',
      effectiveDate: '2024-12-01',
      reviewDate: '2025-06-01',
      owner: 'Chief Pilot',
      status: 'active',
      keywords: ['emergency', 'flyaway', 'loss of link', 'battery', 'collision', 'procedures'],
      relatedPolicies: ['1001', '1007'],
      regulatoryRefs: ['CARs 901.73', 'Transport Canada Advisory Circulars'],
      sections: [
        { id: '1', title: 'Emergency Classification', content: '', order: 1 },
        { id: '2', title: 'Flyaway Procedures', content: '', order: 2 },
        { id: '3', title: 'Loss of Control Link', content: '', order: 3 },
        { id: '4', title: 'Low Battery Emergency', content: '', order: 4 },
        { id: '5', title: 'Collision/Near-Miss Response', content: '', order: 5 },
        { id: '6', title: 'Post-Emergency Reporting', content: '', order: 6 }
      ]
    },
    {
      number: '1007',
      title: 'Incident Reporting',
      category: 'rpas',
      description: 'Requirements and procedures for reporting safety incidents, accidents, and near-misses, including Transport Canada notification requirements.',
      version: '2.0',
      effectiveDate: '2024-07-01',
      reviewDate: '2025-07-01',
      owner: 'Safety Manager',
      status: 'active',
      keywords: ['incident', 'accident', 'reporting', 'notification', 'safety', 'near-miss'],
      relatedPolicies: ['1006', '1045', '1046'],
      regulatoryRefs: ['CARs 901.75', 'TSB Regulations'],
      sections: [
        { id: '1', title: 'Reportable Events Definition', content: '', order: 1 },
        { id: '2', title: 'Internal Reporting Process', content: '', order: 2 },
        { id: '3', title: 'Transport Canada Notification', content: '', order: 3 },
        { id: '4', title: 'TSB Notification Requirements', content: '', order: 4 },
        { id: '5', title: 'Investigation Procedures', content: '', order: 5 },
        { id: '6', title: 'Documentation Requirements', content: '', order: 6 }
      ]
    },
    {
      number: '1008',
      title: 'Aircraft Registration',
      category: 'rpas',
      description: 'Procedures for registering and marking RPAS with Transport Canada, including renewal requirements and record keeping.',
      version: '1.3',
      effectiveDate: '2024-03-01',
      reviewDate: '2025-03-01',
      owner: 'Operations Manager',
      status: 'active',
      keywords: ['registration', 'marking', 'Transport Canada', 'aircraft', 'renewal'],
      relatedPolicies: ['1009'],
      regulatoryRefs: ['CARs 901.03', 'CARs 901.05'],
      sections: [
        { id: '1', title: 'Registration Requirements', content: '', order: 1 },
        { id: '2', title: 'Marking Requirements', content: '', order: 2 },
        { id: '3', title: 'Registration Process', content: '', order: 3 },
        { id: '4', title: 'Renewal Procedures', content: '', order: 4 },
        { id: '5', title: 'Record Keeping', content: '', order: 5 },
        { id: '6', title: 'Fleet Management', content: '', order: 6 }
      ]
    },
    {
      number: '1009',
      title: 'Aircraft Maintenance',
      category: 'rpas',
      description: 'Maintenance requirements, inspection schedules, and airworthiness standards for the RPAS fleet, including pre-flight and periodic inspections.',
      version: '2.5',
      effectiveDate: '2024-10-15',
      reviewDate: '2025-10-15',
      owner: 'Maintenance Manager',
      status: 'active',
      keywords: ['maintenance', 'inspection', 'airworthiness', 'pre-flight', 'periodic'],
      relatedPolicies: ['1001', '1008'],
      regulatoryRefs: ['CARs 901.29', 'Manufacturer Maintenance Manuals'],
      sections: [
        { id: '1', title: 'Maintenance Philosophy', content: '', order: 1 },
        { id: '2', title: 'Pre-flight Inspection', content: '', order: 2 },
        { id: '3', title: 'Periodic Inspection Schedule', content: '', order: 3 },
        { id: '4', title: 'Component Life Limits', content: '', order: 4 },
        { id: '5', title: 'Maintenance Documentation', content: '', order: 5 },
        { id: '6', title: 'Defect Reporting and Rectification', content: '', order: 6 }
      ]
    },
    {
      number: '1010',
      title: 'Pilot Certification',
      category: 'rpas',
      description: 'Requirements for pilot certification, currency, and proficiency, including Basic and Advanced certificate requirements.',
      version: '2.1',
      effectiveDate: '2024-05-01',
      reviewDate: '2025-05-01',
      owner: 'Chief Pilot',
      status: 'active',
      keywords: ['certification', 'pilot', 'basic', 'advanced', 'currency', 'proficiency'],
      relatedPolicies: ['1001', '1011'],
      regulatoryRefs: ['CARs 901.54', 'CARs 901.55', 'CARs 901.56'],
      sections: [
        { id: '1', title: 'Certification Requirements', content: '', order: 1 },
        { id: '2', title: 'Basic vs Advanced Operations', content: '', order: 2 },
        { id: '3', title: 'Currency Requirements', content: '', order: 3 },
        { id: '4', title: 'Proficiency Standards', content: '', order: 4 },
        { id: '5', title: 'Recertification Process', content: '', order: 5 },
        { id: '6', title: 'Record Keeping', content: '', order: 6 }
      ]
    },
    {
      number: '1011',
      title: 'Flight Review Program',
      category: 'rpas',
      description: 'Internal flight review program for maintaining pilot proficiency, including annual check requirements and remedial training.',
      version: '1.8',
      effectiveDate: '2024-04-01',
      reviewDate: '2025-04-01',
      owner: 'Chief Pilot',
      status: 'active',
      keywords: ['flight review', 'proficiency', 'check', 'annual', 'training'],
      relatedPolicies: ['1010'],
      regulatoryRefs: ['CARs 901.57'],
      sections: [
        { id: '1', title: 'Flight Review Requirements', content: '', order: 1 },
        { id: '2', title: 'Review Schedule', content: '', order: 2 },
        { id: '3', title: 'Evaluation Criteria', content: '', order: 3 },
        { id: '4', title: 'Remedial Training', content: '', order: 4 },
        { id: '5', title: 'Documentation', content: '', order: 5 },
        { id: '6', title: 'Examiner Qualifications', content: '', order: 6 }
      ]
    },
    {
      number: '1012',
      title: 'SFOC Operations',
      category: 'rpas',
      description: 'Procedures for conducting operations under Special Flight Operations Certificates, including application process and compliance requirements.',
      version: '2.3',
      effectiveDate: '2024-08-15',
      reviewDate: '2025-08-15',
      owner: 'Chief Pilot',
      status: 'active',
      keywords: ['SFOC', 'special', 'operations', 'certificate', 'Transport Canada'],
      relatedPolicies: ['1001', '1002', '1003'],
      regulatoryRefs: ['CARs 903', 'Transport Canada SFOC Guidelines'],
      sections: [
        { id: '1', title: 'SFOC Requirements', content: '', order: 1 },
        { id: '2', title: 'Application Process', content: '', order: 2 },
        { id: '3', title: 'Operational Conditions', content: '', order: 3 },
        { id: '4', title: 'Compliance Monitoring', content: '', order: 4 },
        { id: '5', title: 'Reporting Requirements', content: '', order: 5 },
        { id: '6', title: 'Renewal Process', content: '', order: 6 }
      ]
    },
    // CRM Policies (1013-1021)
    {
      number: '1013',
      title: 'Crew Resource Management',
      category: 'crm',
      description: 'CRM principles and practices for RPAS operations, including communication, decision making, and situational awareness.',
      version: '2.0',
      effectiveDate: '2024-06-01',
      reviewDate: '2025-06-01',
      owner: 'Chief Pilot',
      status: 'active',
      keywords: ['CRM', 'crew', 'resource', 'management', 'communication', 'teamwork'],
      relatedPolicies: ['1014', '1017', '1018'],
      regulatoryRefs: ['Transport Canada CRM Guidelines', 'ICAO Doc 9995'],
      sections: [
        { id: '1', title: 'CRM Principles', content: '', order: 1 },
        { id: '2', title: 'Communication Standards', content: '', order: 2 },
        { id: '3', title: 'Situational Awareness', content: '', order: 3 },
        { id: '4', title: 'Workload Management', content: '', order: 4 },
        { id: '5', title: 'Team Coordination', content: '', order: 5 },
        { id: '6', title: 'Error Management', content: '', order: 6 }
      ]
    },
    {
      number: '1014',
      title: 'Briefing and Debriefing',
      category: 'crm',
      description: 'Requirements for pre-flight briefings, operational briefings, and post-flight debriefings to ensure effective crew coordination.',
      version: '1.7',
      effectiveDate: '2024-05-15',
      reviewDate: '2025-05-15',
      owner: 'Operations Manager',
      status: 'active',
      keywords: ['briefing', 'debriefing', 'pre-flight', 'post-flight', 'coordination'],
      relatedPolicies: ['1013', '1015'],
      regulatoryRefs: ['CARs 901.71'],
      sections: [
        { id: '1', title: 'Pre-Flight Briefing Requirements', content: '', order: 1 },
        { id: '2', title: 'Briefing Content Standards', content: '', order: 2 },
        { id: '3', title: 'Operational Briefings', content: '', order: 3 },
        { id: '4', title: 'Debriefing Process', content: '', order: 4 },
        { id: '5', title: 'Lessons Learned Documentation', content: '', order: 5 },
        { id: '6', title: 'Briefing Checklists', content: '', order: 6 }
      ]
    },
    {
      number: '1015',
      title: 'Visual Observer Procedures',
      category: 'crm',
      description: 'Requirements, responsibilities, and procedures for visual observers supporting RPAS operations.',
      version: '2.2',
      effectiveDate: '2024-07-01',
      reviewDate: '2025-07-01',
      owner: 'Chief Pilot',
      status: 'active',
      keywords: ['visual observer', 'VO', 'spotter', 'EVLOS', 'procedures'],
      relatedPolicies: ['1013', '1016', '1021'],
      regulatoryRefs: ['CARs 901.70', 'CARs 901.71'],
      sections: [
        { id: '1', title: 'Visual Observer Requirements', content: '', order: 1 },
        { id: '2', title: 'Qualifications and Training', content: '', order: 2 },
        { id: '3', title: 'Communication Protocols', content: '', order: 3 },
        { id: '4', title: 'Positioning Requirements', content: '', order: 4 },
        { id: '5', title: 'Handover Procedures', content: '', order: 5 },
        { id: '6', title: 'Documentation', content: '', order: 6 }
      ]
    },
    {
      number: '1016',
      title: 'Crew Composition',
      category: 'crm',
      description: 'Requirements for crew composition based on operation type, complexity, and risk level.',
      version: '1.5',
      effectiveDate: '2024-04-01',
      reviewDate: '2025-04-01',
      owner: 'Operations Manager',
      status: 'active',
      keywords: ['crew', 'composition', 'staffing', 'roles', 'requirements'],
      relatedPolicies: ['1013', '1015'],
      regulatoryRefs: ['CARs 901.69'],
      sections: [
        { id: '1', title: 'Minimum Crew Requirements', content: '', order: 1 },
        { id: '2', title: 'Role Definitions', content: '', order: 2 },
        { id: '3', title: 'Complexity-Based Staffing', content: '', order: 3 },
        { id: '4', title: 'Qualification Matrix', content: '', order: 4 },
        { id: '5', title: 'Crew Assignment Process', content: '', order: 5 },
        { id: '6', title: 'Substitution Procedures', content: '', order: 6 }
      ]
    },
    {
      number: '1017',
      title: 'Aeronautical Decision Making',
      category: 'crm',
      description: 'Framework for aeronautical decision making including the FORDEC model and risk-based decision processes.',
      version: '2.1',
      effectiveDate: '2024-09-01',
      reviewDate: '2025-09-01',
      owner: 'Chief Pilot',
      status: 'active',
      keywords: ['decision making', 'FORDEC', 'ADM', 'risk', 'judgment'],
      relatedPolicies: ['1013', '1018'],
      regulatoryRefs: ['Transport Canada ADM Guidelines'],
      sections: [
        { id: '1', title: 'Decision Making Framework', content: '', order: 1 },
        { id: '2', title: 'FORDEC Model', content: '', order: 2 },
        { id: '3', title: 'Risk Assessment Integration', content: '', order: 3 },
        { id: '4', title: 'Go/No-Go Decisions', content: '', order: 4 },
        { id: '5', title: 'In-Flight Decision Making', content: '', order: 5 },
        { id: '6', title: 'Post-Decision Review', content: '', order: 6 }
      ]
    },
    {
      number: '1018',
      title: 'Threat and Error Management',
      category: 'crm',
      description: 'TEM model implementation for identifying, managing, and mitigating threats and errors in RPAS operations.',
      version: '1.8',
      effectiveDate: '2024-10-01',
      reviewDate: '2025-10-01',
      owner: 'Safety Manager',
      status: 'active',
      keywords: ['TEM', 'threat', 'error', 'management', 'safety'],
      relatedPolicies: ['1013', '1017'],
      regulatoryRefs: ['ICAO Doc 9995', 'Transport Canada SMS Guidelines'],
      sections: [
        { id: '1', title: 'TEM Model Overview', content: '', order: 1 },
        { id: '2', title: 'Threat Identification', content: '', order: 2 },
        { id: '3', title: 'Error Classification', content: '', order: 3 },
        { id: '4', title: 'Countermeasures', content: '', order: 4 },
        { id: '5', title: 'Undesired Aircraft States', content: '', order: 5 },
        { id: '6', title: 'TEM Training Requirements', content: '', order: 6 }
      ]
    },
    {
      number: '1019',
      title: 'Fatigue Risk Management',
      category: 'crm',
      description: 'Fatigue risk management system including duty time limitations, rest requirements, and fatigue reporting.',
      version: '2.0',
      effectiveDate: '2024-11-15',
      reviewDate: '2025-11-15',
      owner: 'Operations Manager',
      status: 'active',
      keywords: ['fatigue', 'duty time', 'rest', 'FRMS', 'hours'],
      relatedPolicies: ['1020'],
      regulatoryRefs: ['Transport Canada FRMS Guidelines'],
      sections: [
        { id: '1', title: 'Fatigue Risk Factors', content: '', order: 1 },
        { id: '2', title: 'Duty Time Limitations', content: '', order: 2 },
        { id: '3', title: 'Rest Requirements', content: '', order: 3 },
        { id: '4', title: 'Fatigue Reporting', content: '', order: 4 },
        { id: '5', title: 'Scheduling Considerations', content: '', order: 5 },
        { id: '6', title: 'Fatigue Countermeasures', content: '', order: 6 }
      ]
    },
    {
      number: '1020',
      title: 'Fitness for Duty',
      category: 'crm',
      description: 'Requirements for crew fitness for duty including medical fitness, substance use policy, and self-assessment.',
      version: '1.6',
      effectiveDate: '2024-08-01',
      reviewDate: '2025-08-01',
      owner: 'Operations Manager',
      status: 'active',
      keywords: ['fitness', 'duty', 'medical', 'IMSAFE', 'impairment'],
      relatedPolicies: ['1019'],
      regulatoryRefs: ['CARs 602.02', 'Transport Canada Guidelines'],
      sections: [
        { id: '1', title: 'Fitness Standards', content: '', order: 1 },
        { id: '2', title: 'IMSAFE Checklist', content: '', order: 2 },
        { id: '3', title: 'Medical Requirements', content: '', order: 3 },
        { id: '4', title: 'Substance Use Policy', content: '', order: 4 },
        { id: '5', title: 'Self-Declaration', content: '', order: 5 },
        { id: '6', title: 'Return to Duty Process', content: '', order: 6 }
      ]
    },
    {
      number: '1021',
      title: 'Communication Procedures',
      category: 'crm',
      description: 'Standard communication procedures for crew coordination, including radio procedures and emergency communications.',
      version: '1.9',
      effectiveDate: '2024-06-15',
      reviewDate: '2025-06-15',
      owner: 'Chief Pilot',
      status: 'active',
      keywords: ['communication', 'radio', 'procedures', 'crew', 'coordination'],
      relatedPolicies: ['1013', '1015'],
      regulatoryRefs: ['CARs 901.71'],
      sections: [
        { id: '1', title: 'Communication Standards', content: '', order: 1 },
        { id: '2', title: 'Radio Procedures', content: '', order: 2 },
        { id: '3', title: 'Crew Communication', content: '', order: 3 },
        { id: '4', title: 'External Communications', content: '', order: 4 },
        { id: '5', title: 'Emergency Communications', content: '', order: 5 },
        { id: '6', title: 'Communication Equipment', content: '', order: 6 }
      ]
    },
    // HSE Policies (1022-1045)
    {
      number: '1022',
      title: 'Health and Safety Policy',
      category: 'hse',
      description: 'Overarching health and safety policy establishing commitment, responsibilities, and HSE management system framework.',
      version: '3.0',
      effectiveDate: '2025-01-01',
      reviewDate: '2026-01-01',
      owner: 'HSE Manager',
      status: 'active',
      keywords: ['health', 'safety', 'policy', 'HSE', 'OHS', 'management'],
      relatedPolicies: ['1023', '1024'],
      regulatoryRefs: ['OH&S Act', 'COR Requirements'],
      sections: [
        { id: '1', title: 'Policy Statement', content: '', order: 1 },
        { id: '2', title: 'Management Commitment', content: '', order: 2 },
        { id: '3', title: 'Responsibilities', content: '', order: 3 },
        { id: '4', title: 'HSE Management System', content: '', order: 4 },
        { id: '5', title: 'Performance Monitoring', content: '', order: 5 },
        { id: '6', title: 'Continuous Improvement', content: '', order: 6 }
      ]
    },
    {
      number: '1023',
      title: 'Hazard Identification and Risk Assessment',
      category: 'hse',
      description: 'Procedures for identifying workplace hazards and conducting risk assessments using the 5x5 risk matrix.',
      version: '2.4',
      effectiveDate: '2024-09-01',
      reviewDate: '2025-09-01',
      owner: 'HSE Manager',
      status: 'active',
      keywords: ['hazard', 'HIRA', 'risk assessment', 'matrix', 'identification'],
      relatedPolicies: ['1022', '1024'],
      regulatoryRefs: ['OH&S Act', 'COR Requirements', 'CSA Z1002'],
      sections: [
        { id: '1', title: 'Hazard Identification Process', content: '', order: 1 },
        { id: '2', title: 'Risk Assessment Methodology', content: '', order: 2 },
        { id: '3', title: '5x5 Risk Matrix', content: '', order: 3 },
        { id: '4', title: 'Risk Ranking and Prioritization', content: '', order: 4 },
        { id: '5', title: 'Control Measures', content: '', order: 5 },
        { id: '6', title: 'Documentation Requirements', content: '', order: 6 }
      ]
    },
    {
      number: '1024',
      title: 'Site Safety',
      category: 'hse',
      description: 'Site-specific safety requirements including site setup, hazard controls, and safe work practices for field operations.',
      version: '2.1',
      effectiveDate: '2024-07-15',
      reviewDate: '2025-07-15',
      owner: 'HSE Manager',
      status: 'active',
      keywords: ['site', 'safety', 'field', 'setup', 'controls'],
      relatedPolicies: ['1022', '1023', '1025'],
      regulatoryRefs: ['OH&S Act', 'COR Requirements'],
      sections: [
        { id: '1', title: 'Site Assessment', content: '', order: 1 },
        { id: '2', title: 'Site Setup Requirements', content: '', order: 2 },
        { id: '3', title: 'Exclusion Zones', content: '', order: 3 },
        { id: '4', title: 'Signage Requirements', content: '', order: 4 },
        { id: '5', title: 'Traffic Management', content: '', order: 5 },
        { id: '6', title: 'Site Inspections', content: '', order: 6 }
      ]
    },
    {
      number: '1025',
      title: 'Personal Protective Equipment',
      category: 'hse',
      description: 'PPE requirements, selection, use, maintenance, and training for all operational activities.',
      version: '2.0',
      effectiveDate: '2024-06-01',
      reviewDate: '2025-06-01',
      owner: 'HSE Manager',
      status: 'active',
      keywords: ['PPE', 'protective', 'equipment', 'safety gear', 'protection'],
      relatedPolicies: ['1024'],
      regulatoryRefs: ['OH&S Act', 'CSA Standards'],
      sections: [
        { id: '1', title: 'PPE Requirements by Task', content: '', order: 1 },
        { id: '2', title: 'Selection Criteria', content: '', order: 2 },
        { id: '3', title: 'Use and Limitations', content: '', order: 3 },
        { id: '4', title: 'Inspection and Maintenance', content: '', order: 4 },
        { id: '5', title: 'Training Requirements', content: '', order: 5 },
        { id: '6', title: 'Procurement Standards', content: '', order: 6 }
      ]
    },
    {
      number: '1026',
      title: 'Emergency Response Plan',
      category: 'hse',
      description: 'Emergency response procedures for medical emergencies, fires, severe weather, and other emergency situations.',
      version: '2.5',
      effectiveDate: '2024-10-01',
      reviewDate: '2025-04-01',
      owner: 'HSE Manager',
      status: 'active',
      keywords: ['emergency', 'response', 'plan', 'ERP', 'evacuation'],
      relatedPolicies: ['1006', '1027', '1028'],
      regulatoryRefs: ['OH&S Act', 'Fire Code'],
      sections: [
        { id: '1', title: 'Emergency Classification', content: '', order: 1 },
        { id: '2', title: 'Response Procedures', content: '', order: 2 },
        { id: '3', title: 'Evacuation Procedures', content: '', order: 3 },
        { id: '4', title: 'Emergency Contacts', content: '', order: 4 },
        { id: '5', title: 'Emergency Equipment', content: '', order: 5 },
        { id: '6', title: 'Drill Requirements', content: '', order: 6 }
      ]
    },
    {
      number: '1027',
      title: 'First Aid',
      category: 'hse',
      description: 'First aid requirements, equipment, training, and response procedures for workplace injuries.',
      version: '1.8',
      effectiveDate: '2024-05-01',
      reviewDate: '2025-05-01',
      owner: 'HSE Manager',
      status: 'active',
      keywords: ['first aid', 'medical', 'injury', 'treatment', 'kit'],
      relatedPolicies: ['1026'],
      regulatoryRefs: ['OH&S Act', 'First Aid Regulation'],
      sections: [
        { id: '1', title: 'First Aid Requirements', content: '', order: 1 },
        { id: '2', title: 'Training Standards', content: '', order: 2 },
        { id: '3', title: 'First Aid Kit Contents', content: '', order: 3 },
        { id: '4', title: 'Response Procedures', content: '', order: 4 },
        { id: '5', title: 'Record Keeping', content: '', order: 5 },
        { id: '6', title: 'Medical Transportation', content: '', order: 6 }
      ]
    },
    {
      number: '1028',
      title: 'Fire Prevention and Response',
      category: 'hse',
      description: 'Fire prevention measures, fire fighting equipment, and emergency response procedures for fire incidents.',
      version: '1.6',
      effectiveDate: '2024-04-15',
      reviewDate: '2025-04-15',
      owner: 'HSE Manager',
      status: 'active',
      keywords: ['fire', 'prevention', 'extinguisher', 'response', 'LiPo'],
      relatedPolicies: ['1026'],
      regulatoryRefs: ['Fire Code', 'NFPA Standards'],
      sections: [
        { id: '1', title: 'Fire Prevention Measures', content: '', order: 1 },
        { id: '2', title: 'LiPo Battery Safety', content: '', order: 2 },
        { id: '3', title: 'Fire Fighting Equipment', content: '', order: 3 },
        { id: '4', title: 'Fire Response Procedures', content: '', order: 4 },
        { id: '5', title: 'Evacuation', content: '', order: 5 },
        { id: '6', title: 'Post-Fire Procedures', content: '', order: 6 }
      ]
    },
    {
      number: '1029',
      title: 'Vehicle Safety',
      category: 'hse',
      description: 'Vehicle safety requirements including inspections, safe driving practices, and incident response.',
      version: '1.5',
      effectiveDate: '2024-03-01',
      reviewDate: '2025-03-01',
      owner: 'HSE Manager',
      status: 'active',
      keywords: ['vehicle', 'driving', 'safety', 'inspection', 'fleet'],
      relatedPolicies: ['1024'],
      regulatoryRefs: ['Traffic Safety Act', 'Company Fleet Policy'],
      sections: [
        { id: '1', title: 'Vehicle Inspection Requirements', content: '', order: 1 },
        { id: '2', title: 'Safe Driving Practices', content: '', order: 2 },
        { id: '3', title: 'Journey Management', content: '', order: 3 },
        { id: '4', title: 'Loading and Securing', content: '', order: 4 },
        { id: '5', title: 'Incident Response', content: '', order: 5 },
        { id: '6', title: 'Maintenance Requirements', content: '', order: 6 }
      ]
    },
    {
      number: '1030',
      title: 'Working at Heights',
      category: 'hse',
      description: 'Safety requirements for working at heights including fall protection, equipment, and rescue procedures.',
      version: '1.7',
      effectiveDate: '2024-06-01',
      reviewDate: '2025-06-01',
      owner: 'HSE Manager',
      status: 'active',
      keywords: ['heights', 'fall protection', 'ladder', 'scaffold', 'rescue'],
      relatedPolicies: ['1025'],
      regulatoryRefs: ['OH&S Act', 'Fall Protection Code'],
      sections: [
        { id: '1', title: 'Working at Heights Definition', content: '', order: 1 },
        { id: '2', title: 'Fall Protection Requirements', content: '', order: 2 },
        { id: '3', title: 'Equipment Standards', content: '', order: 3 },
        { id: '4', title: 'Training Requirements', content: '', order: 4 },
        { id: '5', title: 'Rescue Procedures', content: '', order: 5 },
        { id: '6', title: 'Inspection Requirements', content: '', order: 6 }
      ]
    },
    {
      number: '1031',
      title: 'Hazardous Materials',
      category: 'hse',
      description: 'Handling, storage, and disposal of hazardous materials including batteries, fuels, and chemicals.',
      version: '2.0',
      effectiveDate: '2024-08-01',
      reviewDate: '2025-08-01',
      owner: 'HSE Manager',
      status: 'active',
      keywords: ['hazmat', 'hazardous', 'materials', 'WHMIS', 'SDS', 'battery'],
      relatedPolicies: ['1028', '1032'],
      regulatoryRefs: ['WHMIS Regulations', 'TDG Act'],
      sections: [
        { id: '1', title: 'WHMIS Requirements', content: '', order: 1 },
        { id: '2', title: 'SDS Management', content: '', order: 2 },
        { id: '3', title: 'Storage Requirements', content: '', order: 3 },
        { id: '4', title: 'Handling Procedures', content: '', order: 4 },
        { id: '5', title: 'Spill Response', content: '', order: 5 },
        { id: '6', title: 'Disposal Procedures', content: '', order: 6 }
      ]
    },
    {
      number: '1032',
      title: 'Environmental Protection',
      category: 'hse',
      description: 'Environmental protection measures including spill prevention, waste management, and environmental incident response.',
      version: '1.8',
      effectiveDate: '2024-07-01',
      reviewDate: '2025-07-01',
      owner: 'HSE Manager',
      status: 'active',
      keywords: ['environmental', 'protection', 'spill', 'waste', 'pollution'],
      relatedPolicies: ['1031'],
      regulatoryRefs: ['Environmental Protection Act', 'Spill Reporting Regulation'],
      sections: [
        { id: '1', title: 'Environmental Responsibilities', content: '', order: 1 },
        { id: '2', title: 'Spill Prevention', content: '', order: 2 },
        { id: '3', title: 'Waste Management', content: '', order: 3 },
        { id: '4', title: 'Spill Response', content: '', order: 4 },
        { id: '5', title: 'Reporting Requirements', content: '', order: 5 },
        { id: '6', title: 'Remediation Procedures', content: '', order: 6 }
      ]
    },
    {
      number: '1033',
      title: 'Drug & Alcohol Policy',
      category: 'hse',
      description: 'Ensures a safe and productive workplace by preventing the use, possession, or distribution of drugs and alcohol that could impair performance or safety.',
      version: '1.0',
      effectiveDate: '2025-09-18',
      reviewDate: '2026-02-01',
      owner: 'HSE Manager',
      status: 'active',
      keywords: ['drug', 'alcohol', 'substance', 'impairment', 'testing', 'workplace safety'],
      relatedPolicies: ['1007'],
      regulatoryRefs: ['BC OHS Regulation', 'Workers Compensation Act'],
      sections: [
        { id: '1', title: 'Purpose & Scope', content: '', order: 1 },
        { id: '2', title: 'Definitions & References', content: '', order: 2 },
        { id: '3', title: 'Policy Statement', content: '', order: 3 },
        { id: '4', title: 'Procedures', content: '', order: 4 },
        { id: '5', title: 'Roles & Responsibilities', content: '', order: 5 },
        { id: '6', title: 'Monitoring, Compliance & Enforcement', content: '', order: 6 }
      ]
    },
    {
      number: '1034',
      title: 'Refuse Unsafe Work Policy',
      category: 'hse',
      description: 'Empowers workers to refuse unsafe work without fear of reprisal, ensuring a safe workplace and compliance with legal rights.',
      version: '1.0',
      effectiveDate: '2025-09-18',
      reviewDate: '2026-02-01',
      owner: 'HSE Manager',
      status: 'active',
      keywords: ['refuse', 'unsafe work', 'worker rights', 'safety', 'reprisal'],
      relatedPolicies: ['1007'],
      regulatoryRefs: ['BC OHS Regulation Section 3.12', 'Workers Compensation Act'],
      sections: [
        { id: '1', title: 'Purpose & Scope', content: '', order: 1 },
        { id: '2', title: 'Definitions & References', content: '', order: 2 },
        { id: '3', title: 'Policy Statement', content: '', order: 3 },
        { id: '4', title: 'Procedures', content: '', order: 4 },
        { id: '5', title: 'Roles & Responsibilities', content: '', order: 5 },
        { id: '6', title: 'Monitoring, Compliance & Enforcement', content: '', order: 6 }
      ]
    },
    {
      number: '1035',
      title: 'Harassment & Violence Policy',
      category: 'hse',
      description: 'Prevents and addresses harassment and violence in the workplace, ensuring a respectful and safe environment for all personnel.',
      version: '1.0',
      effectiveDate: '2025-09-18',
      reviewDate: '2026-02-01',
      owner: 'HSE Manager',
      status: 'active',
      keywords: ['harassment', 'violence', 'bullying', 'workplace', 'respect', 'prevention'],
      relatedPolicies: ['1007'],
      regulatoryRefs: ['BC OHS Regulation Section 4.24-4.31', 'Workers Compensation Act'],
      sections: [
        { id: '1', title: 'Purpose & Scope', content: '', order: 1 },
        { id: '2', title: 'Definitions & References', content: '', order: 2 },
        { id: '3', title: 'Policy Statement', content: '', order: 3 },
        { id: '4', title: 'Procedures', content: '', order: 4 },
        { id: '5', title: 'Roles & Responsibilities', content: '', order: 5 },
        { id: '6', title: 'Monitoring, Compliance & Enforcement', content: '', order: 6 }
      ]
    },
    {
      number: '1036',
      title: 'Environmental Policy',
      category: 'hse',
      description: 'Integrates health, safety, and environmental principles to minimize environmental impact and ensure worker safety.',
      version: '1.0',
      effectiveDate: '2025-09-18',
      reviewDate: '2026-02-01',
      owner: 'HSE Manager',
      status: 'active',
      keywords: ['environmental', 'sustainability', 'impact', 'protection', 'compliance'],
      relatedPolicies: ['1032'],
      regulatoryRefs: ['Environmental Management Act', 'BC OHS Regulation'],
      sections: [
        { id: '1', title: 'Purpose & Scope', content: '', order: 1 },
        { id: '2', title: 'Definitions & References', content: '', order: 2 },
        { id: '3', title: 'Policy Statement', content: '', order: 3 },
        { id: '4', title: 'Procedures', content: '', order: 4 },
        { id: '5', title: 'Roles & Responsibilities', content: '', order: 5 },
        { id: '6', title: 'Monitoring, Compliance & Enforcement', content: '', order: 6 }
      ]
    },
    {
      number: '1037',
      title: 'Security Policy',
      category: 'hse',
      description: 'Protects the physical and information assets from unauthorized access, theft, or damage.',
      version: '1.0',
      effectiveDate: '2025-09-18',
      reviewDate: '2026-02-01',
      owner: 'HSE Manager',
      status: 'active',
      keywords: ['security', 'access control', 'assets', 'protection', 'theft prevention'],
      relatedPolicies: ['1007'],
      regulatoryRefs: ['BC OHS Regulation', 'Workers Compensation Act'],
      sections: [
        { id: '1', title: 'Purpose & Scope', content: '', order: 1 },
        { id: '2', title: 'Definitions & References', content: '', order: 2 },
        { id: '3', title: 'Policy Statement', content: '', order: 3 },
        { id: '4', title: 'Procedures', content: '', order: 4 },
        { id: '5', title: 'Roles & Responsibilities', content: '', order: 5 },
        { id: '6', title: 'Monitoring, Compliance & Enforcement', content: '', order: 6 }
      ]
    },
    {
      number: '1038',
      title: 'Waste Disposal Policy',
      category: 'hse',
      description: 'Manages waste disposal responsibly, minimizing environmental impact and ensuring compliance with regulations.',
      version: '1.0',
      effectiveDate: '2025-09-18',
      reviewDate: '2026-02-01',
      owner: 'HSE Manager',
      status: 'active',
      keywords: ['waste', 'disposal', 'recycling', 'hazardous', 'environmental'],
      relatedPolicies: ['1032', '1036'],
      regulatoryRefs: ['Environmental Management Act', 'Hazardous Waste Regulation'],
      sections: [
        { id: '1', title: 'Purpose & Scope', content: '', order: 1 },
        { id: '2', title: 'Definitions & References', content: '', order: 2 },
        { id: '3', title: 'Policy Statement', content: '', order: 3 },
        { id: '4', title: 'Procedures', content: '', order: 4 },
        { id: '5', title: 'Roles & Responsibilities', content: '', order: 5 },
        { id: '6', title: 'Monitoring, Compliance & Enforcement', content: '', order: 6 }
      ]
    },
    {
      number: '1039',
      title: 'Fatigue Management Policy',
      category: 'hse',
      description: 'Prevents fatigue-related incidents by managing work hours and promoting well-being for all personnel.',
      version: '1.0',
      effectiveDate: '2025-09-18',
      reviewDate: '2026-02-01',
      owner: 'HSE Manager',
      status: 'active',
      keywords: ['fatigue', 'work hours', 'rest', 'well-being', 'safety'],
      relatedPolicies: ['1007'],
      regulatoryRefs: ['BC OHS Regulation', 'Employment Standards Act'],
      sections: [
        { id: '1', title: 'Purpose & Scope', content: '', order: 1 },
        { id: '2', title: 'Definitions & References', content: '', order: 2 },
        { id: '3', title: 'Policy Statement', content: '', order: 3 },
        { id: '4', title: 'Procedures', content: '', order: 4 },
        { id: '5', title: 'Roles & Responsibilities', content: '', order: 5 },
        { id: '6', title: 'Monitoring, Compliance & Enforcement', content: '', order: 6 }
      ]
    },
    {
      number: '1040',
      title: 'Incident Investigation',
      category: 'hse',
      description: 'Procedures for investigating workplace incidents and near-misses to identify root causes and prevent recurrence.',
      version: '2.3',
      effectiveDate: '2024-11-01',
      reviewDate: '2025-11-01',
      owner: 'HSE Manager',
      status: 'active',
      keywords: ['incident', 'investigation', 'root cause', 'analysis', 'near miss'],
      relatedPolicies: ['1007', '1041'],
      regulatoryRefs: ['OH&S Act', 'COR Requirements'],
      sections: [
        { id: '1', title: 'Investigation Requirements', content: '', order: 1 },
        { id: '2', title: 'Investigation Team', content: '', order: 2 },
        { id: '3', title: 'Root Cause Analysis', content: '', order: 3 },
        { id: '4', title: 'Documentation', content: '', order: 4 },
        { id: '5', title: 'Corrective Actions', content: '', order: 5 },
        { id: '6', title: 'Lessons Learned', content: '', order: 6 }
      ]
    },
    {
      number: '1041',
      title: 'Corrective and Preventive Actions',
      category: 'hse',
      description: 'CAPA process for addressing non-conformances, incidents, and opportunities for improvement.',
      version: '2.0',
      effectiveDate: '2024-09-15',
      reviewDate: '2025-09-15',
      owner: 'HSE Manager',
      status: 'active',
      keywords: ['CAPA', 'corrective', 'preventive', 'action', 'improvement'],
      relatedPolicies: ['1040'],
      regulatoryRefs: ['COR Requirements', 'ISO 45001'],
      sections: [
        { id: '1', title: 'CAPA Process', content: '', order: 1 },
        { id: '2', title: 'Root Cause Requirements', content: '', order: 2 },
        { id: '3', title: 'Action Planning', content: '', order: 3 },
        { id: '4', title: 'Implementation', content: '', order: 4 },
        { id: '5', title: 'Effectiveness Verification', content: '', order: 5 },
        { id: '6', title: 'Closure Criteria', content: '', order: 6 }
      ]
    },
    {
      number: '1042',
      title: 'HSE - Grounds for Dismissal',
      category: 'hse',
      description: 'Outlines the grounds for dismissal at the Company to maintain a safe and productive workplace.',
      version: '1.0',
      effectiveDate: '2025-09-18',
      reviewDate: '2026-02-01',
      owner: 'HSE Manager',
      status: 'active',
      keywords: ['dismissal', 'termination', 'discipline', 'misconduct', 'safety violations'],
      relatedPolicies: ['1007', '1040'],
      regulatoryRefs: ['BC OHS Regulation', 'Employment Standards Act'],
      sections: [
        { id: '1', title: 'Purpose & Scope', content: '', order: 1 },
        { id: '2', title: 'Definitions & References', content: '', order: 2 },
        { id: '3', title: 'Policy Statement', content: '', order: 3 },
        { id: '4', title: 'Procedures', content: '', order: 4 },
        { id: '5', title: 'Roles & Responsibilities', content: '', order: 5 },
        { id: '6', title: 'Monitoring, Compliance & Enforcement', content: '', order: 6 }
      ]
    },
    {
      number: '1043',
      title: 'HSE - Public & Visitors Policy',
      category: 'hse',
      description: 'Ensures the safety and security of the public and visitors at the Company sites while protecting company operations.',
      version: '1.0',
      effectiveDate: '2025-09-18',
      reviewDate: '2026-02-01',
      owner: 'HSE Manager',
      status: 'active',
      keywords: ['public', 'visitors', 'site access', 'safety', 'security'],
      relatedPolicies: ['1037'],
      regulatoryRefs: ['BC OHS Regulation', 'Workers Compensation Act'],
      sections: [
        { id: '1', title: 'Purpose & Scope', content: '', order: 1 },
        { id: '2', title: 'Definitions & References', content: '', order: 2 },
        { id: '3', title: 'Policy Statement', content: '', order: 3 },
        { id: '4', title: 'Procedures', content: '', order: 4 },
        { id: '5', title: 'Roles & Responsibilities', content: '', order: 5 },
        { id: '6', title: 'Monitoring, Compliance & Enforcement', content: '', order: 6 }
      ]
    },
    {
      number: '1044',
      title: 'Training and Competency',
      category: 'hse',
      description: 'HSE training requirements, competency assessment, and training records management.',
      version: '2.2',
      effectiveDate: '2024-08-01',
      reviewDate: '2025-08-01',
      owner: 'HSE Manager',
      status: 'active',
      keywords: ['training', 'competency', 'qualification', 'assessment', 'certification'],
      relatedPolicies: ['1010', '1011'],
      regulatoryRefs: ['OH&S Act', 'COR Requirements'],
      sections: [
        { id: '1', title: 'Training Matrix', content: '', order: 1 },
        { id: '2', title: 'Mandatory Training', content: '', order: 2 },
        { id: '3', title: 'Competency Assessment', content: '', order: 3 },
        { id: '4', title: 'Refresher Requirements', content: '', order: 4 },
        { id: '5', title: 'Records Management', content: '', order: 5 },
        { id: '6', title: 'Training Evaluation', content: '', order: 6 }
      ]
    },
    {
      number: '1045',
      title: 'Records and Documentation',
      category: 'hse',
      description: 'Requirements for HSE records retention, documentation standards, and record management.',
      version: '1.8',
      effectiveDate: '2024-06-15',
      reviewDate: '2025-06-15',
      owner: 'HSE Manager',
      status: 'active',
      keywords: ['records', 'documentation', 'retention', 'filing', 'audit'],
      relatedPolicies: ['1022'],
      regulatoryRefs: ['OH&S Act', 'COR Requirements', 'Privacy Act'],
      sections: [
        { id: '1', title: 'Document Control', content: '', order: 1 },
        { id: '2', title: 'Required Records', content: '', order: 2 },
        { id: '3', title: 'Retention Periods', content: '', order: 3 },
        { id: '4', title: 'Storage Requirements', content: '', order: 4 },
        { id: '5', title: 'Access and Confidentiality', content: '', order: 5 },
        { id: '6', title: 'Disposal Procedures', content: '', order: 6 }
      ]
    },
    // HSE Policies 1046-1053 (Additional)
    {
      number: '1046',
      title: 'Joint Health and Safety Committee Requirements',
      category: 'hse',
      description: 'Compliance with regulatory requirements for joint health and safety committees (JHSCs) and health and safety representatives (HSRs), ensuring worker involvement in safety decisions.',
      version: '1.0',
      effectiveDate: '2025-09-18',
      reviewDate: '2026-02-01',
      owner: 'HSE Manager',
      status: 'active',
      keywords: ['JHSC', 'HSR', 'committee', 'worker representation', 'safety committee', 'consultation'],
      relatedPolicies: ['1022', '1042'],
      regulatoryRefs: ['OH&S Act', 'OHS Code Part 13', 'COR Requirements'],
      sections: [
        { id: '1', title: 'Committee Establishment', content: '', order: 1 },
        { id: '2', title: 'Member Selection', content: '', order: 2 },
        { id: '3', title: 'Training Requirements', content: '', order: 3 },
        { id: '4', title: 'Meeting Schedule', content: '', order: 4 },
        { id: '5', title: 'Issue Resolution', content: '', order: 5 },
        { id: '6', title: 'Documentation and Reporting', content: '', order: 6 }
      ]
    },
    {
      number: '1047',
      title: 'Hazard Assessment Policy',
      category: 'hse',
      description: 'Procedures for identifying and controlling workplace hazards through systematic assessment, promoting a proactive safety culture and addressing risks before incidents occur.',
      version: '1.0',
      effectiveDate: '2025-09-18',
      reviewDate: '2026-02-01',
      owner: 'HSE Manager',
      status: 'active',
      keywords: ['hazard', 'assessment', 'HIRA', 'risk identification', 'workplace safety', 'FLRA', 'FLHA'],
      relatedPolicies: ['1023', '1048'],
      regulatoryRefs: ['OH&S Act', 'OHS Regulation Section 3.5', 'COR Requirements'],
      sections: [
        { id: '1', title: 'Initial Assessment', content: '', order: 1 },
        { id: '2', title: 'Routine Monitoring', content: '', order: 2 },
        { id: '3', title: 'Risk Evaluation', content: '', order: 3 },
        { id: '4', title: 'Control Implementation', content: '', order: 4 },
        { id: '5', title: 'Documentation Requirements', content: '', order: 5 },
        { id: '6', title: 'Review and Updates', content: '', order: 6 }
      ]
    },
    {
      number: '1048',
      title: 'Hazard Control Policy',
      category: 'hse',
      description: 'Procedures for controlling identified hazards using the hierarchy of controls to minimize risks and ensure a safe workplace environment.',
      version: '1.0',
      effectiveDate: '2025-09-18',
      reviewDate: '2026-02-01',
      owner: 'HSE Manager',
      status: 'active',
      keywords: ['hazard control', 'hierarchy of controls', 'elimination', 'substitution', 'engineering controls', 'residual risk'],
      relatedPolicies: ['1023', '1047'],
      regulatoryRefs: ['OH&S Act', 'OHS Regulation Section 3.6', 'COR Requirements'],
      sections: [
        { id: '1', title: 'Hazard Identification', content: '', order: 1 },
        { id: '2', title: 'Control Selection', content: '', order: 2 },
        { id: '3', title: 'Implementation Process', content: '', order: 3 },
        { id: '4', title: 'Monitoring Effectiveness', content: '', order: 4 },
        { id: '5', title: 'Adjustment and Review', content: '', order: 5 },
        { id: '6', title: 'Documentation', content: '', order: 6 }
      ]
    },
    {
      number: '1049',
      title: 'Workplace Inspection Policy',
      category: 'hse',
      description: 'Systematic inspection process to identify and address workplace hazards, ensuring safety and compliance through regular oversight and corrective actions.',
      version: '1.0',
      effectiveDate: '2025-09-18',
      reviewDate: '2026-02-01',
      owner: 'HSE Manager',
      status: 'active',
      keywords: ['inspection', 'workplace', 'safety check', 'corrective action', 'compliance', 'monitoring'],
      relatedPolicies: ['1023', '1047', '1050'],
      regulatoryRefs: ['OH&S Act', 'OHS Regulation Section 3.5', 'COR Requirements'],
      sections: [
        { id: '1', title: 'Inspection Scheduling', content: '', order: 1 },
        { id: '2', title: 'Conducting Inspections', content: '', order: 2 },
        { id: '3', title: 'Hazard Reporting', content: '', order: 3 },
        { id: '4', title: 'Corrective Actions', content: '', order: 4 },
        { id: '5', title: 'Record Keeping', content: '', order: 5 },
        { id: '6', title: 'Follow-up Procedures', content: '', order: 6 }
      ]
    },
    {
      number: '1050',
      title: 'Preventative Maintenance Policy',
      category: 'hse',
      description: 'Systematic approach to equipment maintenance ensuring reliability, safety, and compliance through scheduled inspections and proactive repairs.',
      version: '1.0',
      effectiveDate: '2025-09-18',
      reviewDate: '2026-02-01',
      owner: 'HSE Manager',
      status: 'active',
      keywords: ['maintenance', 'preventative', 'equipment', 'reliability', 'inspection', 'schedule'],
      relatedPolicies: ['1009', '1049'],
      regulatoryRefs: ['OH&S Act', 'OHS Regulation', 'COR Requirements'],
      sections: [
        { id: '1', title: 'Maintenance Planning', content: '', order: 1 },
        { id: '2', title: 'Scheduling Requirements', content: '', order: 2 },
        { id: '3', title: 'Inspection Protocols', content: '', order: 3 },
        { id: '4', title: 'Documentation Standards', content: '', order: 4 },
        { id: '5', title: 'Equipment Tracking', content: '', order: 5 },
        { id: '6', title: 'Compliance Verification', content: '', order: 6 }
      ]
    },
    {
      number: '1051',
      title: 'HSE Emergency Response Policy',
      category: 'hse',
      description: 'Comprehensive emergency response procedures ensuring worker safety and effective incident management through preparation, communication, and coordinated response.',
      version: '1.0',
      effectiveDate: '2025-09-18',
      reviewDate: '2026-02-01',
      owner: 'HSE Manager',
      status: 'active',
      keywords: ['emergency', 'response', 'evacuation', 'drill', 'crisis', 'first aid'],
      relatedPolicies: ['1006', '1026', '1027'],
      regulatoryRefs: ['OH&S Act', 'OHS Regulation', 'Fire Code', 'COR Requirements'],
      sections: [
        { id: '1', title: 'Emergency Planning', content: '', order: 1 },
        { id: '2', title: 'Response Procedures', content: '', order: 2 },
        { id: '3', title: 'Communication Protocols', content: '', order: 3 },
        { id: '4', title: 'Training and Drills', content: '', order: 4 },
        { id: '5', title: 'Equipment Requirements', content: '', order: 5 },
        { id: '6', title: 'Post-Emergency Review', content: '', order: 6 }
      ]
    },
    {
      number: '1052',
      title: 'HSE Investigations Policy',
      category: 'hse',
      description: 'Procedures for investigating workplace incidents, near-misses, and hazards to identify root causes and implement effective corrective actions.',
      version: '1.0',
      effectiveDate: '2025-09-18',
      reviewDate: '2026-02-01',
      owner: 'HSE Manager',
      status: 'active',
      keywords: ['investigation', 'incident', 'root cause', 'corrective action', 'near miss', 'analysis'],
      relatedPolicies: ['1007', '1040', '1041'],
      regulatoryRefs: ['OH&S Act', 'OHS Regulation', 'COR Requirements'],
      sections: [
        { id: '1', title: 'Investigation Triggers', content: '', order: 1 },
        { id: '2', title: 'Investigation Process', content: '', order: 2 },
        { id: '3', title: 'Root Cause Analysis', content: '', order: 3 },
        { id: '4', title: 'Corrective Actions', content: '', order: 4 },
        { id: '5', title: 'Reporting Requirements', content: '', order: 5 },
        { id: '6', title: 'Follow-up and Closure', content: '', order: 6 }
      ]
    },
    {
      number: '1053',
      title: 'HSE Systems Overview and Audit Policy',
      category: 'hse',
      description: 'Framework for HSE management system auditing, ensuring continuous improvement and compliance through systematic evaluation and verification.',
      version: '1.0',
      effectiveDate: '2025-09-18',
      reviewDate: '2026-02-01',
      owner: 'HSE Manager',
      status: 'active',
      keywords: ['audit', 'HSE system', 'compliance', 'evaluation', 'continuous improvement', 'verification'],
      relatedPolicies: ['1022', '1041', '1045'],
      regulatoryRefs: ['OH&S Act', 'COR Requirements', 'ISO 45001'],
      sections: [
        { id: '1', title: 'HSE System Overview', content: '', order: 1 },
        { id: '2', title: 'Audit Planning', content: '', order: 2 },
        { id: '3', title: 'Audit Execution', content: '', order: 3 },
        { id: '4', title: 'Findings and Reporting', content: '', order: 4 },
        { id: '5', title: 'Corrective Action Tracking', content: '', order: 5 },
        { id: '6', title: 'Management Review', content: '', order: 6 }
      ]
    }
  ]

// ============================================
// SEED DATA FUNCTION
// ============================================

/**
 * Seed the database with sample policies
 * @param {string} userId - User ID performing the seed
 * @returns {Promise<{success: boolean, count: number, error?: string}>}
 */
export async function seedSamplePolicies(userId) {
  try {
    // Check if policies already exist
    const existingSnapshot = await getDocs(query(policiesRef, limit(1)))
    if (!existingSnapshot.empty) {
      return { success: false, count: 0, error: 'Policies already exist. Clear existing policies first.' }
    }

    const batch = writeBatch(db)
    const now = serverTimestamp()

    SAMPLE_POLICIES.forEach((policy) => {
      const docRef = doc(policiesRef)
      batch.set(docRef, {
        ...policy,
        type: 'default',
        isTemplate: false,
        isLatest: true,
        content: '',
        attachments: [],
        permissions: {
          viewRoles: [],
          editRoles: ['admin', 'manager'],
          approveRoles: ['admin']
        },
        acknowledgmentSettings: {
          required: false,
          requiredRoles: [],
          deadline: null,
          reacknowledgmentPeriod: null,
          signatureRequired: false,
          signatureType: 'checkbox'
        },
        createdAt: now,
        createdBy: userId,
        updatedAt: now,
        updatedBy: userId
      })
    })

    await batch.commit()

    return { success: true, count: SAMPLE_POLICIES.length }
  } catch (error) {
    logger.error('Error seeding policies:', error)
    return { success: false, count: 0, error: error.message }
  }
}

/**
 * Seed only missing policies (policies that don't exist in Firestore)
 * @param {string} userId - User ID performing the seed
 * @returns {Promise<{success: boolean, added: number, skipped: number, error?: string}>}
 */
export async function seedMissingPolicies(userId) {
  try {
    // Get all existing policy numbers
    const existingSnapshot = await getDocs(policiesRef)
    const existingNumbers = new Set(
      existingSnapshot.docs.map(doc => doc.data().number)
    )

    // Filter to only policies that don't exist
    const missingPolicies = SAMPLE_POLICIES.filter(
      policy => !existingNumbers.has(policy.number)
    )

    if (missingPolicies.length === 0) {
      return { success: true, added: 0, skipped: SAMPLE_POLICIES.length }
    }

    const batch = writeBatch(db)
    const now = serverTimestamp()

    missingPolicies.forEach((policy) => {
      const docRef = doc(policiesRef)
      batch.set(docRef, {
        ...policy,
        type: 'default',
        isTemplate: false,
        isLatest: true,
        content: '',
        attachments: [],
        permissions: {
          viewRoles: [],
          editRoles: ['admin', 'manager'],
          approveRoles: ['admin']
        },
        acknowledgmentSettings: {
          required: false,
          requiredRoles: [],
          deadline: null,
          reacknowledgmentPeriod: null,
          signatureRequired: false,
          signatureType: 'checkbox'
        },
        createdAt: now,
        createdBy: userId,
        updatedAt: now,
        updatedBy: userId
      })
    })

    await batch.commit()

    return {
      success: true,
      added: missingPolicies.length,
      skipped: SAMPLE_POLICIES.length - missingPolicies.length
    }
  } catch (error) {
    logger.error('Error seeding missing policies:', error)
    return { success: false, added: 0, skipped: 0, error: error.message }
  }
}

// ============================================
// MASTER POLICY INTEGRATION
// ============================================

/**
 * Seed operator policies from masterPolicies collection
 * This is the preferred method - seeds from Firestore masterPolicies
 * @param {string} userId - User ID performing the seed
 * @returns {Promise<{success: boolean, count: number, error?: string}>}
 */
export async function seedFromMasterPolicies(userId) {
  try {
    // Dynamic import to avoid circular dependencies
    const { getPublishedMasterPolicies } = await import('./firestoreMasterPolicies.js')

    // Check if policies already exist
    const existingSnapshot = await getDocs(query(policiesRef, limit(1)))
    if (!existingSnapshot.empty) {
      return { success: false, count: 0, error: 'Policies already exist. Clear existing policies first.' }
    }

    // Get published master policies
    const masterPolicies = await getPublishedMasterPolicies()

    if (masterPolicies.length === 0) {
      // Fallback to SAMPLE_POLICIES if no master policies exist
      return seedSamplePolicies(userId)
    }

    const batch = writeBatch(db)
    const now = serverTimestamp()

    masterPolicies.forEach((master) => {
      const docRef = doc(policiesRef)
      batch.set(docRef, {
        // Core fields from master
        number: master.number,
        title: master.title,
        category: master.category,
        description: master.description,
        version: '1.0',
        effectiveDate: master.metadata?.effectiveDate || null,
        reviewDate: master.metadata?.reviewDate || null,
        owner: master.metadata?.owner || '',
        status: 'active',
        keywords: master.metadata?.keywords || [],
        regulatoryRefs: master.metadata?.regulatoryRefs || [],
        sections: master.content?.sections || [],

        // Source tracking
        sourceId: master.id,
        sourceVersion: master.version,
        isCustomized: false,

        // Standard fields
        type: 'adopted',
        isTemplate: false,
        isLatest: true,
        content: master.content || {},
        attachments: [],
        permissions: {
          viewRoles: [],
          editRoles: ['admin', 'manager'],
          approveRoles: ['admin']
        },
        acknowledgmentSettings: {
          required: false,
          requiredRoles: [],
          deadline: null,
          reacknowledgmentPeriod: null,
          signatureRequired: false,
          signatureType: 'checkbox'
        },
        createdAt: now,
        createdBy: userId,
        updatedAt: now,
        updatedBy: userId
      })
    })

    await batch.commit()

    return { success: true, count: masterPolicies.length }
  } catch (error) {
    logger.error('Error seeding from master policies:', error)
    return { success: false, count: 0, error: error.message }
  }
}

/**
 * Seed only missing policies from masterPolicies
 * @param {string} userId - User ID performing the seed
 * @returns {Promise<{success: boolean, added: number, skipped: number, error?: string}>}
 */
export async function seedMissingFromMaster(userId) {
  try {
    const { getPublishedMasterPolicies } = await import('./firestoreMasterPolicies.js')

    // Get existing policy numbers
    const existingSnapshot = await getDocs(policiesRef)
    const existingNumbers = new Set(
      existingSnapshot.docs.map(doc => doc.data().number)
    )

    // Get published master policies
    const masterPolicies = await getPublishedMasterPolicies()

    if (masterPolicies.length === 0) {
      // Fallback to seedMissingPolicies if no master policies
      return seedMissingPolicies(userId)
    }

    // Filter to only policies that don't exist
    const missingPolicies = masterPolicies.filter(
      master => !existingNumbers.has(master.number)
    )

    if (missingPolicies.length === 0) {
      return { success: true, added: 0, skipped: masterPolicies.length }
    }

    const batch = writeBatch(db)
    const now = serverTimestamp()

    missingPolicies.forEach((master) => {
      const docRef = doc(policiesRef)
      batch.set(docRef, {
        number: master.number,
        title: master.title,
        category: master.category,
        description: master.description,
        version: '1.0',
        effectiveDate: master.metadata?.effectiveDate || null,
        reviewDate: master.metadata?.reviewDate || null,
        owner: master.metadata?.owner || '',
        status: 'active',
        keywords: master.metadata?.keywords || [],
        regulatoryRefs: master.metadata?.regulatoryRefs || [],
        sections: master.content?.sections || [],

        // Source tracking
        sourceId: master.id,
        sourceVersion: master.version,
        isCustomized: false,

        type: 'adopted',
        isTemplate: false,
        isLatest: true,
        content: master.content || {},
        attachments: [],
        permissions: {
          viewRoles: [],
          editRoles: ['admin', 'manager'],
          approveRoles: ['admin']
        },
        acknowledgmentSettings: {
          required: false,
          requiredRoles: [],
          deadline: null,
          reacknowledgmentPeriod: null,
          signatureRequired: false,
          signatureType: 'checkbox'
        },
        createdAt: now,
        createdBy: userId,
        updatedAt: now,
        updatedBy: userId
      })
    })

    await batch.commit()

    return {
      success: true,
      added: missingPolicies.length,
      skipped: masterPolicies.length - missingPolicies.length
    }
  } catch (error) {
    logger.error('Error seeding missing from master:', error)
    return { success: false, added: 0, skipped: 0, error: error.message }
  }
}

/**
 * Check for available updates from master policies
 * @returns {Promise<Array>} Array of policies with updates available
 */
export async function checkForMasterUpdates() {
  try {
    const { checkForUpdates } = await import('./firestoreMasterPolicies.js')

    // Get all operator policies
    const snapshot = await getDocs(policiesRef)
    const operatorPolicies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // Check for updates
    return await checkForUpdates(operatorPolicies)
  } catch (error) {
    logger.error('Error checking for master updates:', error)
    return []
  }
}

/**
 * Update an operator policy from its master source
 * @param {string} policyId - Operator policy ID
 * @param {boolean} preserveCustomizations - If true, only update non-customized fields
 * @param {string} userId - User performing the update
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateFromMaster(policyId, preserveCustomizations = true, userId) {
  try {
    const { getMasterPolicy } = await import('./firestoreMasterPolicies.js')

    // Get the operator policy
    const policyRef = doc(db, 'policies', policyId)
    const policySnapshot = await getDoc(policyRef)

    if (!policySnapshot.exists()) {
      return { success: false, error: 'Policy not found' }
    }

    const policy = policySnapshot.data()

    if (!policy.sourceId) {
      return { success: false, error: 'Policy has no source master to update from' }
    }

    // Get the master policy
    const master = await getMasterPolicy(policy.sourceId)

    if (master.status !== 'published') {
      return { success: false, error: 'Master policy is not published' }
    }

    // Build update data
    const updateData = {
      sourceVersion: master.version,
      updatedAt: serverTimestamp(),
      updatedBy: userId
    }

    // If not preserving customizations or policy isn't customized, update content
    if (!preserveCustomizations || !policy.isCustomized) {
      updateData.title = master.title
      updateData.description = master.description
      updateData.content = master.content
      updateData.keywords = master.metadata?.keywords || []
      updateData.regulatoryRefs = master.metadata?.regulatoryRefs || []
      updateData.sections = master.content?.sections || []
      updateData.owner = master.metadata?.owner || ''
      updateData.isCustomized = false
    }

    await updateDoc(policyRef, updateData)

    return { success: true }
  } catch (error) {
    logger.error('Error updating from master:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Mark a policy as customized (called when user edits adopted policy)
 * @param {string} policyId - Policy ID
 * @param {string} userId - User making the edit
 */
export async function markAsCustomized(policyId, userId) {
  const policyRef = doc(db, 'policies', policyId)
  await updateDoc(policyRef, {
    isCustomized: true,
    customizedAt: serverTimestamp(),
    customizedBy: userId,
    updatedAt: serverTimestamp()
  })
}
