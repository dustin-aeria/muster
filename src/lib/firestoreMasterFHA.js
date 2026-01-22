/**
 * firestoreMasterFHA.js
 * Platform-level master FHA management
 *
 * Master FHAs are the authoritative source for FHA templates.
 * Users seed their FHA library from these masters and can customize them.
 *
 * Schema:
 * masterFormalHazards/{fhaId}
 *   - fhaNumber: string (e.g., "FHA-2.5")
 *   - title: string
 *   - category: string
 *   - description: string
 *   - consequences: string
 *   - likelihood: number (1-5)
 *   - severity: number (1-5)
 *   - riskScore: number
 *   - controlMeasures: array
 *   - residualLikelihood: number
 *   - residualSeverity: number
 *   - residualRiskScore: number
 *   - version: number (auto-incremented)
 *   - status: string (draft|published|archived)
 *   - metadata:
 *     - keywords: string[]
 *     - regulatoryRefs: string[]
 *     - applicableOperations: string[]
 *   - createdAt: timestamp
 *   - createdBy: string (userId)
 *   - updatedAt: timestamp
 *   - updatedBy: string (userId)
 *   - publishedAt: timestamp
 *   - publishedBy: string (userId)
 *
 * masterFHAVersions/{versionId}
 *   - fhaId: string
 *   - version: number
 *   - content: object (snapshot of FHA at this version)
 *   - changeNotes: string
 *   - createdAt: timestamp
 *   - createdBy: string
 *
 * @location src/lib/firestoreMasterFHA.js
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
  serverTimestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from './firebase'
import { FHA_CATEGORIES, calculateRiskScore } from './firestoreFHA'

// Collection references
const masterFHAsRef = collection(db, 'masterFormalHazards')
const masterFHAVersionsRef = collection(db, 'masterFHAVersions')

// ============================================
// PLATFORM ADMIN CHECK
// ============================================

/**
 * Check if a user is a platform admin
 * Platform admins can manage master FHAs
 * @param {Object} userProfile - User profile from AuthContext
 * @returns {boolean}
 */
export function isPlatformAdmin(userProfile) {
  if (!userProfile) return false
  return userProfile.isPlatformAdmin === true || userProfile.role === 'platformAdmin'
}

// ============================================
// MASTER FHA CRUD
// ============================================

/**
 * Get all master FHAs
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>}
 */
export async function getMasterFHAs(filters = {}) {
  const constraints = []

  if (filters.status) {
    constraints.push(where('status', '==', filters.status))
  }

  if (filters.category) {
    constraints.push(where('category', '==', filters.category))
  }

  constraints.push(orderBy('fhaNumber', 'asc'))

  const q = query(masterFHAsRef, ...constraints)
  const snapshot = await getDocs(q)

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Get published master FHAs only (for user seeding)
 * @returns {Promise<Array>}
 */
export async function getPublishedMasterFHAs() {
  return getMasterFHAs({ status: 'published' })
}

/**
 * Get a single master FHA by ID
 * @param {string} id - Master FHA ID
 * @returns {Promise<Object>}
 */
export async function getMasterFHA(id) {
  const docRef = doc(db, 'masterFormalHazards', id)
  const snapshot = await getDoc(docRef)

  if (!snapshot.exists()) {
    throw new Error('Master FHA not found')
  }

  return { id: snapshot.id, ...snapshot.data() }
}

/**
 * Get a master FHA by number (e.g., "FHA-2.5")
 * @param {string} fhaNumber - FHA number
 * @returns {Promise<Object|null>}
 */
export async function getMasterFHAByNumber(fhaNumber) {
  const q = query(masterFHAsRef, where('fhaNumber', '==', fhaNumber))
  const snapshot = await getDocs(q)

  if (snapshot.empty) return null

  const docSnap = snapshot.docs[0]
  return { id: docSnap.id, ...docSnap.data() }
}

/**
 * Create a new master FHA
 * @param {Object} data - FHA data
 * @param {string} userId - Creating user ID
 * @returns {Promise<Object>}
 */
export async function createMasterFHA(data, userId) {
  // Check if FHA number already exists
  const existing = await getMasterFHAByNumber(data.fhaNumber)
  if (existing) {
    throw new Error(`Master FHA with number ${data.fhaNumber} already exists`)
  }

  // Calculate risk scores
  const riskScore = data.riskScore || (data.likelihood * data.severity)
  const residualRiskScore = data.residualRiskScore ||
    ((data.residualLikelihood || data.likelihood) * (data.residualSeverity || data.severity))

  const fha = {
    fhaNumber: data.fhaNumber,
    title: data.title,
    category: data.category || 'flight_ops',
    description: data.description || '',
    consequences: data.consequences || '',

    // Risk assessment
    likelihood: data.likelihood || 3,
    severity: data.severity || 3,
    riskScore,

    // Control measures
    controlMeasures: data.controlMeasures || [],

    // Residual risk
    residualLikelihood: data.residualLikelihood || data.likelihood || 3,
    residualSeverity: data.residualSeverity || data.severity || 3,
    residualRiskScore,

    // Version and status
    version: 1,
    status: data.status || 'draft',

    // Metadata
    metadata: {
      keywords: data.keywords || [],
      regulatoryRefs: data.regulatoryRefs || [],
      applicableOperations: data.applicableOperations || []
    },

    // Timestamps
    createdAt: serverTimestamp(),
    createdBy: userId,
    updatedAt: serverTimestamp(),
    updatedBy: userId,
    publishedAt: null,
    publishedBy: null
  }

  const docRef = await addDoc(masterFHAsRef, fha)

  // Create initial version snapshot
  await createVersionSnapshot(docRef.id, fha, 'Initial creation', userId)

  return { id: docRef.id, ...fha }
}

/**
 * Update a master FHA
 * Automatically increments version and creates snapshot
 * @param {string} id - FHA ID
 * @param {Object} data - Updated data
 * @param {string} changeNotes - Notes describing the changes
 * @param {string} userId - Updating user ID
 * @returns {Promise<Object>}
 */
export async function updateMasterFHA(id, data, changeNotes, userId) {
  const fhaRef = doc(db, 'masterFormalHazards', id)
  const currentFHA = await getMasterFHA(id)

  // Determine if this is a content change that warrants version bump
  const contentChanged = hasContentChanged(currentFHA, data)

  // Recalculate risk scores if needed
  const updatedData = { ...data }

  if (data.likelihood !== undefined || data.severity !== undefined) {
    const likelihood = data.likelihood ?? currentFHA.likelihood
    const severity = data.severity ?? currentFHA.severity
    updatedData.riskScore = likelihood * severity
  }

  if (data.residualLikelihood !== undefined || data.residualSeverity !== undefined) {
    const residualLikelihood = data.residualLikelihood ?? currentFHA.residualLikelihood
    const residualSeverity = data.residualSeverity ?? currentFHA.residualSeverity
    updatedData.residualRiskScore = residualLikelihood * residualSeverity
  }

  updatedData.version = contentChanged ? currentFHA.version + 1 : currentFHA.version
  updatedData.updatedAt = serverTimestamp()
  updatedData.updatedBy = userId

  // Remove undefined values
  Object.keys(updatedData).forEach(key => {
    if (updatedData[key] === undefined) delete updatedData[key]
  })

  await updateDoc(fhaRef, updatedData)

  // Create version snapshot if content changed
  if (contentChanged) {
    const snapshotData = { ...currentFHA, ...updatedData }
    await createVersionSnapshot(id, snapshotData, changeNotes || 'Content updated', userId)
  }

  return { id, ...currentFHA, ...updatedData }
}

/**
 * Publish a master FHA (make it available for user seeding)
 * @param {string} id - FHA ID
 * @param {string} userId - Publishing user ID
 * @returns {Promise<Object>}
 */
export async function publishMasterFHA(id, userId) {
  const fhaRef = doc(db, 'masterFormalHazards', id)

  await updateDoc(fhaRef, {
    status: 'published',
    publishedAt: serverTimestamp(),
    publishedBy: userId,
    updatedAt: serverTimestamp(),
    updatedBy: userId
  })

  return getMasterFHA(id)
}

/**
 * Archive a master FHA
 * @param {string} id - FHA ID
 * @param {string} userId - Archiving user ID
 * @returns {Promise<Object>}
 */
export async function archiveMasterFHA(id, userId) {
  const fhaRef = doc(db, 'masterFormalHazards', id)

  await updateDoc(fhaRef, {
    status: 'archived',
    updatedAt: serverTimestamp(),
    updatedBy: userId
  })

  return getMasterFHA(id)
}

/**
 * Delete a master FHA (only if draft and never published)
 * @param {string} id - FHA ID
 */
export async function deleteMasterFHA(id) {
  const fha = await getMasterFHA(id)

  if (fha.status === 'published' || fha.publishedAt) {
    throw new Error('Cannot delete a published master FHA. Archive it instead.')
  }

  const batch = writeBatch(db)

  // Delete all version snapshots
  const versionsQuery = query(masterFHAVersionsRef, where('fhaId', '==', id))
  const versionsSnapshot = await getDocs(versionsQuery)
  versionsSnapshot.docs.forEach(doc => batch.delete(doc.ref))

  // Delete the FHA
  const fhaRef = doc(db, 'masterFormalHazards', id)
  batch.delete(fhaRef)

  await batch.commit()
}

// ============================================
// VERSION MANAGEMENT
// ============================================

/**
 * Create a version snapshot
 * @param {string} fhaId - FHA ID
 * @param {Object} fhaData - Full FHA data to snapshot
 * @param {string} changeNotes - Notes describing changes
 * @param {string} userId - User creating snapshot
 * @returns {Promise<Object>}
 */
async function createVersionSnapshot(fhaId, fhaData, changeNotes, userId) {
  const snapshot = {
    fhaId,
    version: fhaData.version,
    content: {
      fhaNumber: fhaData.fhaNumber,
      title: fhaData.title,
      category: fhaData.category,
      description: fhaData.description,
      consequences: fhaData.consequences,
      likelihood: fhaData.likelihood,
      severity: fhaData.severity,
      riskScore: fhaData.riskScore,
      controlMeasures: fhaData.controlMeasures,
      residualLikelihood: fhaData.residualLikelihood,
      residualSeverity: fhaData.residualSeverity,
      residualRiskScore: fhaData.residualRiskScore,
      metadata: fhaData.metadata
    },
    changeNotes,
    createdAt: serverTimestamp(),
    createdBy: userId
  }

  const docRef = await addDoc(masterFHAVersionsRef, snapshot)
  return { id: docRef.id, ...snapshot }
}

/**
 * Get version history for a master FHA
 * @param {string} fhaId - FHA ID
 * @returns {Promise<Array>}
 */
export async function getMasterFHAVersions(fhaId) {
  const q = query(
    masterFHAVersionsRef,
    where('fhaId', '==', fhaId),
    orderBy('version', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Get a specific version of a master FHA
 * @param {string} fhaId - FHA ID
 * @param {number} version - Version number
 * @returns {Promise<Object|null>}
 */
export async function getMasterFHAVersion(fhaId, version) {
  const q = query(
    masterFHAVersionsRef,
    where('fhaId', '==', fhaId),
    where('version', '==', version)
  )
  const snapshot = await getDocs(q)

  if (snapshot.empty) return null

  const docSnap = snapshot.docs[0]
  return { id: docSnap.id, ...docSnap.data() }
}

// ============================================
// USER FHA INTEGRATION
// ============================================

/**
 * Check for available updates for user FHAs
 * Compares user's sourceVersion with current master version
 * @param {Array} userFHAs - Array of user's FHAs with sourceId and sourceVersion
 * @returns {Promise<Array>} Array of FHAs with updates available
 */
export async function checkForFHAUpdates(userFHAs) {
  const masterFHAs = await getPublishedMasterFHAs()
  const masterByNumber = new Map(masterFHAs.map(f => [f.fhaNumber, f]))

  const updates = []

  for (const userFHA of userFHAs) {
    // Skip if no source tracking
    if (!userFHA.sourceId && !userFHA.fhaNumber) continue

    const master = userFHA.sourceId
      ? masterFHAs.find(m => m.id === userFHA.sourceId)
      : masterByNumber.get(userFHA.fhaNumber)

    if (!master) continue

    const sourceVersion = userFHA.sourceVersion || 0

    if (master.version > sourceVersion) {
      updates.push({
        userFHAId: userFHA.id,
        userFHANumber: userFHA.fhaNumber,
        userFHATitle: userFHA.title,
        currentSourceVersion: sourceVersion,
        masterFHAId: master.id,
        masterVersion: master.version,
        masterTitle: master.title,
        isCustomized: userFHA.isCustomized || false
      })
    }
  }

  return updates
}

/**
 * Get master FHA content for seeding/updating user FHAs
 * @param {string} masterFHAId - Master FHA ID
 * @returns {Promise<Object>} FHA data ready for user adoption
 */
export async function getMasterFHAForAdoption(masterFHAId) {
  const master = await getMasterFHA(masterFHAId)

  if (master.status !== 'published') {
    throw new Error('Only published master FHAs can be adopted')
  }

  return {
    // Copy main fields
    fhaNumber: master.fhaNumber,
    title: master.title,
    category: master.category,
    description: master.description,
    consequences: master.consequences,

    // Risk assessment
    likelihood: master.likelihood,
    severity: master.severity,
    riskScore: master.riskScore,

    // Control measures
    controlMeasures: master.controlMeasures,

    // Residual risk
    residualLikelihood: master.residualLikelihood,
    residualSeverity: master.residualSeverity,
    residualRiskScore: master.residualRiskScore,

    // Metadata
    keywords: master.metadata?.keywords || [],
    regulatoryRefs: master.metadata?.regulatoryRefs || [],

    // Source tracking
    sourceId: master.id,
    sourceVersion: master.version,
    isCustomized: false,

    // New FHA defaults
    status: 'active',
    source: 'default'
  }
}

// ============================================
// MIGRATION HELPERS
// ============================================

/**
 * Seed master FHAs from the JS data files
 * Used for initial migration from defaultFHATemplates.js
 * @param {Array} fhaData - Array from DEFAULT_FHA_TEMPLATES
 * @param {string} userId - User performing migration
 * @returns {Promise<Object>} Migration results
 */
export async function seedMasterFHAsFromJS(fhaData, userId) {
  const results = { created: 0, skipped: 0, errors: [] }

  for (const fha of fhaData) {
    try {
      // Check if already exists
      const existing = await getMasterFHAByNumber(fha.fhaNumber)
      if (existing) {
        results.skipped++
        continue
      }

      await createMasterFHA({
        fhaNumber: fha.fhaNumber,
        title: fha.title,
        category: fha.category,
        description: fha.description,
        consequences: fha.consequences,
        likelihood: fha.likelihood,
        severity: fha.severity,
        riskScore: fha.riskScore,
        controlMeasures: fha.controlMeasures,
        residualLikelihood: fha.residualLikelihood,
        residualSeverity: fha.residualSeverity,
        residualRiskScore: fha.residualRiskScore,
        status: 'published', // Mark as published for immediate use
        keywords: fha.keywords || [],
        regulatoryRefs: fha.regulatoryRefs || [],
        applicableOperations: fha.applicableOperations || []
      }, userId)

      results.created++
    } catch (err) {
      results.errors.push({ fhaNumber: fha.fhaNumber, error: err.message })
    }
  }

  return results
}

/**
 * Bulk publish all draft master FHAs
 * @param {string} userId - User performing the action
 * @returns {Promise<Object>} Results
 */
export async function publishAllDraftFHAs(userId) {
  const drafts = await getMasterFHAs({ status: 'draft' })
  let published = 0
  const errors = []

  for (const fha of drafts) {
    try {
      await publishMasterFHA(fha.id, userId)
      published++
    } catch (err) {
      errors.push({ fhaNumber: fha.fhaNumber, error: err.message })
    }
  }

  return { published, errors }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if content has changed between old and new FHA data
 * @param {Object} oldFHA - Current FHA data
 * @param {Object} newData - New data being applied
 * @returns {boolean}
 */
function hasContentChanged(oldFHA, newData) {
  const contentFields = [
    'title',
    'description',
    'consequences',
    'likelihood',
    'severity',
    'controlMeasures',
    'residualLikelihood',
    'residualSeverity',
    'metadata'
  ]

  for (const field of contentFields) {
    if (newData[field] === undefined) continue

    const oldVal = JSON.stringify(oldFHA[field])
    const newVal = JSON.stringify(newData[field])

    if (oldVal !== newVal) return true
  }

  return false
}

/**
 * Get statistics about master FHAs
 * @returns {Promise<Object>}
 */
export async function getMasterFHAStats() {
  const fhas = await getMasterFHAs()

  const stats = {
    total: fhas.length,
    byStatus: {
      draft: 0,
      published: 0,
      archived: 0
    },
    byCategory: {},
    byRiskLevel: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    }
  }

  for (const fha of fhas) {
    // Count by status
    if (stats.byStatus[fha.status] !== undefined) {
      stats.byStatus[fha.status]++
    }

    // Count by category
    const cat = fha.category || 'uncategorized'
    stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1

    // Count by risk level
    const { level } = calculateRiskScore(fha.likelihood, fha.severity)
    stats.byRiskLevel[level.toLowerCase()]++
  }

  return stats
}

/**
 * Export master FHAs to JSON format
 * Useful for backup or data transfer
 * @returns {Promise<Array>}
 */
export async function exportMasterFHAsToJSON() {
  const fhas = await getMasterFHAs()

  return fhas.map(fha => ({
    fhaNumber: fha.fhaNumber,
    title: fha.title,
    category: fha.category,
    description: fha.description,
    consequences: fha.consequences,
    likelihood: fha.likelihood,
    severity: fha.severity,
    riskScore: fha.riskScore,
    controlMeasures: fha.controlMeasures,
    residualLikelihood: fha.residualLikelihood,
    residualSeverity: fha.residualSeverity,
    residualRiskScore: fha.residualRiskScore,
    keywords: fha.metadata?.keywords || [],
    regulatoryRefs: fha.metadata?.regulatoryRefs || [],
    applicableOperations: fha.metadata?.applicableOperations || [],
    version: fha.version,
    status: fha.status
  }))
}
