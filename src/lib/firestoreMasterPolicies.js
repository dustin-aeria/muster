/**
 * firestoreMasterPolicies.js
 * Platform-level master policy management
 *
 * Master policies are the authoritative source for policy templates.
 * Operators seed their policies from these masters and can customize them.
 *
 * Schema:
 * masterPolicies/{policyId}
 *   - number: string (e.g., "1001")
 *   - title: string
 *   - category: string (rpas|crm|hse)
 *   - description: string
 *   - content: object (full policy content with sections)
 *   - version: number (auto-incremented)
 *   - status: string (draft|published|archived)
 *   - metadata:
 *     - owner: string
 *     - regulatoryRefs: string[]
 *     - keywords: string[]
 *     - sections: string[]
 *   - createdAt: timestamp
 *   - createdBy: string (userId)
 *   - updatedAt: timestamp
 *   - updatedBy: string (userId)
 *   - publishedAt: timestamp
 *   - publishedBy: string (userId)
 *
 * masterPolicyVersions/{versionId}
 *   - policyId: string
 *   - version: number
 *   - content: object (snapshot of policy at this version)
 *   - changeNotes: string
 *   - createdAt: timestamp
 *   - createdBy: string
 *
 * @location src/lib/firestoreMasterPolicies.js
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
  increment
} from 'firebase/firestore'
import { db } from './firebase'

// Collection references
const masterPoliciesRef = collection(db, 'masterPolicies')
const masterPolicyVersionsRef = collection(db, 'masterPolicyVersions')

// ============================================
// PLATFORM ADMIN CHECK
// ============================================

/**
 * Check if a user is a platform admin
 * Platform admins can manage master policies
 * @param {Object} userProfile - User profile from AuthContext
 * @returns {boolean}
 */
export function isPlatformAdmin(userProfile) {
  if (!userProfile) return false
  // Check for explicit platformAdmin flag or admin role
  return userProfile.isPlatformAdmin === true || userProfile.role === 'platformAdmin'
}

// ============================================
// MASTER POLICY CRUD
// ============================================

/**
 * Get all master policies
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>}
 */
export async function getMasterPolicies(filters = {}) {
  const constraints = []

  if (filters.status) {
    constraints.push(where('status', '==', filters.status))
  }

  if (filters.category) {
    constraints.push(where('category', '==', filters.category))
  }

  constraints.push(orderBy('number', 'asc'))

  const q = query(masterPoliciesRef, ...constraints)
  const snapshot = await getDocs(q)

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Get published master policies only (for operator seeding)
 * @returns {Promise<Array>}
 */
export async function getPublishedMasterPolicies() {
  return getMasterPolicies({ status: 'published' })
}

/**
 * Get a single master policy by ID
 * @param {string} id - Master policy ID
 * @returns {Promise<Object>}
 */
export async function getMasterPolicy(id) {
  const docRef = doc(db, 'masterPolicies', id)
  const snapshot = await getDoc(docRef)

  if (!snapshot.exists()) {
    throw new Error('Master policy not found')
  }

  return { id: snapshot.id, ...snapshot.data() }
}

/**
 * Get a master policy by number (e.g., "1001")
 * @param {string} number - Policy number
 * @returns {Promise<Object|null>}
 */
export async function getMasterPolicyByNumber(number) {
  const q = query(masterPoliciesRef, where('number', '==', number))
  const snapshot = await getDocs(q)

  if (snapshot.empty) return null

  const doc = snapshot.docs[0]
  return { id: doc.id, ...doc.data() }
}

/**
 * Create a new master policy
 * @param {Object} data - Policy data
 * @param {string} userId - Creating user ID
 * @returns {Promise<Object>}
 */
export async function createMasterPolicy(data, userId) {
  // Check if policy number already exists
  const existing = await getMasterPolicyByNumber(data.number)
  if (existing) {
    throw new Error(`Master policy with number ${data.number} already exists`)
  }

  const policy = {
    number: data.number,
    title: data.title,
    category: data.category || 'rpas',
    description: data.description || '',
    content: data.content || {},
    version: 1,
    status: data.status || 'draft',
    metadata: {
      owner: data.owner || '',
      regulatoryRefs: data.regulatoryRefs || [],
      keywords: data.keywords || [],
      sections: data.sections || [],
      effectiveDate: data.effectiveDate || null,
      reviewDate: data.reviewDate || null
    },
    createdAt: serverTimestamp(),
    createdBy: userId,
    updatedAt: serverTimestamp(),
    updatedBy: userId,
    publishedAt: null,
    publishedBy: null
  }

  const docRef = await addDoc(masterPoliciesRef, policy)

  // Create initial version snapshot
  await createVersionSnapshot(docRef.id, policy, 'Initial creation', userId)

  return { id: docRef.id, ...policy }
}

/**
 * Update a master policy
 * Automatically increments version and creates snapshot
 * @param {string} id - Policy ID
 * @param {Object} data - Updated data
 * @param {string} changeNotes - Notes describing the changes
 * @param {string} userId - Updating user ID
 * @returns {Promise<Object>}
 */
export async function updateMasterPolicy(id, data, changeNotes, userId) {
  const policyRef = doc(db, 'masterPolicies', id)
  const currentPolicy = await getMasterPolicy(id)

  // Determine if this is a content change that warrants version bump
  const contentChanged = hasContentChanged(currentPolicy, data)

  const updatedData = {
    ...data,
    version: contentChanged ? currentPolicy.version + 1 : currentPolicy.version,
    updatedAt: serverTimestamp(),
    updatedBy: userId
  }

  // Remove undefined values
  Object.keys(updatedData).forEach(key => {
    if (updatedData[key] === undefined) delete updatedData[key]
  })

  await updateDoc(policyRef, updatedData)

  // Create version snapshot if content changed
  if (contentChanged) {
    const snapshotData = { ...currentPolicy, ...updatedData }
    await createVersionSnapshot(id, snapshotData, changeNotes || 'Content updated', userId)
  }

  return { id, ...currentPolicy, ...updatedData }
}

/**
 * Publish a master policy (make it available for operator seeding)
 * @param {string} id - Policy ID
 * @param {string} userId - Publishing user ID
 * @returns {Promise<Object>}
 */
export async function publishMasterPolicy(id, userId) {
  const policyRef = doc(db, 'masterPolicies', id)

  await updateDoc(policyRef, {
    status: 'published',
    publishedAt: serverTimestamp(),
    publishedBy: userId,
    updatedAt: serverTimestamp(),
    updatedBy: userId
  })

  return getMasterPolicy(id)
}

/**
 * Archive a master policy
 * @param {string} id - Policy ID
 * @param {string} userId - Archiving user ID
 * @returns {Promise<Object>}
 */
export async function archiveMasterPolicy(id, userId) {
  const policyRef = doc(db, 'masterPolicies', id)

  await updateDoc(policyRef, {
    status: 'archived',
    updatedAt: serverTimestamp(),
    updatedBy: userId
  })

  return getMasterPolicy(id)
}

/**
 * Delete a master policy (only if draft and never published)
 * @param {string} id - Policy ID
 */
export async function deleteMasterPolicy(id) {
  const policy = await getMasterPolicy(id)

  if (policy.status === 'published' || policy.publishedAt) {
    throw new Error('Cannot delete a published master policy. Archive it instead.')
  }

  const batch = writeBatch(db)

  // Delete all version snapshots
  const versionsQuery = query(masterPolicyVersionsRef, where('policyId', '==', id))
  const versionsSnapshot = await getDocs(versionsQuery)
  versionsSnapshot.docs.forEach(doc => batch.delete(doc.ref))

  // Delete the policy
  const policyRef = doc(db, 'masterPolicies', id)
  batch.delete(policyRef)

  await batch.commit()
}

// ============================================
// VERSION MANAGEMENT
// ============================================

/**
 * Create a version snapshot
 * @param {string} policyId - Policy ID
 * @param {Object} policyData - Full policy data to snapshot
 * @param {string} changeNotes - Notes describing changes
 * @param {string} userId - User creating snapshot
 * @returns {Promise<Object>}
 */
async function createVersionSnapshot(policyId, policyData, changeNotes, userId) {
  const snapshot = {
    policyId,
    version: policyData.version,
    content: {
      number: policyData.number,
      title: policyData.title,
      category: policyData.category,
      description: policyData.description,
      content: policyData.content,
      metadata: policyData.metadata
    },
    changeNotes,
    createdAt: serverTimestamp(),
    createdBy: userId
  }

  const docRef = await addDoc(masterPolicyVersionsRef, snapshot)
  return { id: docRef.id, ...snapshot }
}

/**
 * Get version history for a master policy
 * @param {string} policyId - Policy ID
 * @returns {Promise<Array>}
 */
export async function getMasterPolicyVersions(policyId) {
  const q = query(
    masterPolicyVersionsRef,
    where('policyId', '==', policyId),
    orderBy('version', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Get a specific version of a master policy
 * @param {string} policyId - Policy ID
 * @param {number} version - Version number
 * @returns {Promise<Object|null>}
 */
export async function getMasterPolicyVersion(policyId, version) {
  const q = query(
    masterPolicyVersionsRef,
    where('policyId', '==', policyId),
    where('version', '==', version)
  )
  const snapshot = await getDocs(q)

  if (snapshot.empty) return null

  const doc = snapshot.docs[0]
  return { id: doc.id, ...doc.data() }
}

// ============================================
// OPERATOR POLICY INTEGRATION
// ============================================

/**
 * Check for available updates for operator policies
 * Compares operator's sourceVersion with current master version
 * @param {Array} operatorPolicies - Array of operator's policies with sourceId and sourceVersion
 * @returns {Promise<Array>} Array of policies with updates available
 */
export async function checkForUpdates(operatorPolicies) {
  const masterPolicies = await getPublishedMasterPolicies()
  const masterByNumber = new Map(masterPolicies.map(p => [p.number, p]))

  const updates = []

  for (const opPolicy of operatorPolicies) {
    // Skip if no source tracking
    if (!opPolicy.sourceId && !opPolicy.number) continue

    const master = opPolicy.sourceId
      ? masterPolicies.find(m => m.id === opPolicy.sourceId)
      : masterByNumber.get(opPolicy.number)

    if (!master) continue

    const sourceVersion = opPolicy.sourceVersion || 0

    if (master.version > sourceVersion) {
      updates.push({
        operatorPolicyId: opPolicy.id,
        operatorPolicyNumber: opPolicy.number,
        operatorPolicyTitle: opPolicy.title,
        currentSourceVersion: sourceVersion,
        masterPolicyId: master.id,
        masterVersion: master.version,
        masterTitle: master.title,
        isCustomized: opPolicy.isCustomized || false
      })
    }
  }

  return updates
}

/**
 * Get master policy content for seeding/updating operator policies
 * @param {string} masterPolicyId - Master policy ID
 * @returns {Promise<Object>} Policy data ready for operator adoption
 */
export async function getMasterPolicyForAdoption(masterPolicyId) {
  const master = await getMasterPolicy(masterPolicyId)

  if (master.status !== 'published') {
    throw new Error('Only published master policies can be adopted')
  }

  return {
    // Copy main fields
    number: master.number,
    title: master.title,
    category: master.category,
    description: master.description,
    content: master.content,

    // Copy metadata
    owner: master.metadata?.owner || '',
    regulatoryRefs: master.metadata?.regulatoryRefs || [],
    keywords: master.metadata?.keywords || [],
    sections: master.metadata?.sections || [],
    effectiveDate: master.metadata?.effectiveDate || null,
    reviewDate: master.metadata?.reviewDate || null,

    // Source tracking
    sourceId: master.id,
    sourceVersion: master.version,
    isCustomized: false,

    // New policy defaults
    status: 'active',
    version: '1.0'
  }
}

// ============================================
// MIGRATION HELPERS
// ============================================

/**
 * Seed master policies from the JS data files
 * Used for initial migration
 * @param {Array} policiesData - Array from POLICIES constant
 * @param {Object} contentData - Object from POLICY_CONTENT
 * @param {string} userId - User performing migration
 * @returns {Promise<Object>} Migration results
 */
export async function seedMasterPoliciesFromJS(policiesData, contentData, userId) {
  const results = { created: 0, skipped: 0, errors: [] }

  for (const policy of policiesData) {
    try {
      // Check if already exists
      const existing = await getMasterPolicyByNumber(policy.number)
      if (existing) {
        results.skipped++
        continue
      }

      // Get rich content if available
      const richContent = contentData[policy.number]

      await createMasterPolicy({
        number: policy.number,
        title: richContent?.title || policy.title,
        category: policy.category,
        description: richContent?.description || policy.description,
        content: richContent || {},
        status: 'published', // Mark as published for immediate use
        owner: richContent?.owner || policy.owner,
        regulatoryRefs: richContent?.regulatoryRefs || policy.regulatoryRefs || [],
        keywords: richContent?.keywords || policy.keywords || [],
        sections: policy.sections || richContent?.sections?.map(s => s.title) || [],
        effectiveDate: richContent?.effectiveDate || policy.effectiveDate,
        reviewDate: richContent?.reviewDate || policy.reviewDate
      }, userId)

      results.created++
    } catch (err) {
      results.errors.push({ number: policy.number, error: err.message })
    }
  }

  return results
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if content has changed between old and new policy data
 * @param {Object} oldPolicy - Current policy data
 * @param {Object} newData - New data being applied
 * @returns {boolean}
 */
function hasContentChanged(oldPolicy, newData) {
  const contentFields = ['title', 'description', 'content', 'metadata']

  for (const field of contentFields) {
    if (newData[field] === undefined) continue

    const oldVal = JSON.stringify(oldPolicy[field])
    const newVal = JSON.stringify(newData[field])

    if (oldVal !== newVal) return true
  }

  return false
}

/**
 * Get statistics about master policies
 * @returns {Promise<Object>}
 */
export async function getMasterPolicyStats() {
  const policies = await getMasterPolicies()

  const stats = {
    total: policies.length,
    byStatus: {
      draft: 0,
      published: 0,
      archived: 0
    },
    byCategory: {}
  }

  for (const policy of policies) {
    // Count by status
    if (stats.byStatus[policy.status] !== undefined) {
      stats.byStatus[policy.status]++
    }

    // Count by category
    const cat = policy.category || 'uncategorized'
    stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1
  }

  return stats
}
