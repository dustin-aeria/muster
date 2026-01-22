/**
 * firestoreFHA.js
 * Firestore functions for Formal Hazard Assessment (FHA) management
 *
 * Features:
 * - Full CRUD for FHA records
 * - Category and status filtering
 * - Risk score calculation
 * - Field hazard linking
 * - Default FHA seeding with white-labeling
 *
 * @location src/lib/firestoreFHA.js
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
  writeBatch,
  Timestamp
} from 'firebase/firestore'
import { db } from './firebase'

// ============================================
// COLLECTION REFERENCES
// ============================================

const formalHazardsRef = collection(db, 'formalHazards')

// ============================================
// FHA CATEGORIES
// ============================================

export const FHA_CATEGORIES = [
  {
    id: 'flight_ops',
    name: 'Flight Operations',
    description: 'Standard and specialized flight operation hazards',
    icon: 'Plane',
    color: 'blue'
  },
  {
    id: 'equipment',
    name: 'Equipment & Maintenance',
    description: 'Aircraft, battery, payload, and maintenance hazards',
    icon: 'Wrench',
    color: 'purple'
  },
  {
    id: 'environmental',
    name: 'Environmental',
    description: 'Weather, terrain, and environmental condition hazards',
    icon: 'ThermometerSun',
    color: 'orange'
  },
  {
    id: 'site_hazards',
    name: 'Site Hazards',
    description: 'Ground-level and site-specific hazards',
    icon: 'MapPin',
    color: 'red'
  },
  {
    id: 'emergency',
    name: 'Emergency Response',
    description: 'Emergency procedures and incident response hazards',
    icon: 'AlertTriangle',
    color: 'amber'
  },
  {
    id: 'personnel',
    name: 'Personnel Safety',
    description: 'Crew and third-party safety hazards',
    icon: 'Users',
    color: 'green'
  },
  {
    id: 'specialized',
    name: 'Specialized Operations',
    description: 'BVLOS, night ops, confined spaces, and specialty operations',
    icon: 'Target',
    color: 'indigo'
  }
]

// ============================================
// FHA STATUS OPTIONS
// ============================================

export const FHA_STATUSES = [
  { id: 'active', name: 'Active', color: 'green' },
  { id: 'under_review', name: 'Under Review', color: 'yellow' },
  { id: 'archived', name: 'Archived', color: 'gray' }
]

// ============================================
// FHA SOURCE OPTIONS
// ============================================

export const FHA_SOURCES = [
  { id: 'default', name: 'Default Template', color: 'blue' },
  { id: 'uploaded', name: 'Uploaded', color: 'purple' },
  { id: 'created', name: 'Created', color: 'green' },
  { id: 'field_triggered', name: 'Field Triggered', color: 'orange' }
]

// ============================================
// RISK MATRIX CONFIGURATION
// Matches ProjectHSERisk.jsx 5x5 matrix
// ============================================

export const LIKELIHOOD_RATINGS = [
  { value: 1, label: 'Rare', description: 'Highly unlikely to occur' },
  { value: 2, label: 'Unlikely', description: 'Could occur but not expected' },
  { value: 3, label: 'Possible', description: 'Might occur occasionally' },
  { value: 4, label: 'Likely', description: 'Will probably occur' },
  { value: 5, label: 'Almost Certain', description: 'Expected to occur' }
]

export const SEVERITY_RATINGS = [
  { value: 1, label: 'Negligible', description: 'No injury, minimal damage' },
  { value: 2, label: 'Minor', description: 'First aid injury, minor damage' },
  { value: 3, label: 'Moderate', description: 'Medical treatment, moderate damage' },
  { value: 4, label: 'Major', description: 'Serious injury, major damage' },
  { value: 5, label: 'Catastrophic', description: 'Fatality, total loss' }
]

export const CONTROL_TYPES = [
  { id: 'elimination', name: 'Elimination', description: 'Remove the hazard entirely', order: 1 },
  { id: 'substitution', name: 'Substitution', description: 'Replace with less hazardous alternative', order: 2 },
  { id: 'engineering', name: 'Engineering Controls', description: 'Physical changes to isolate hazard', order: 3 },
  { id: 'administrative', name: 'Administrative Controls', description: 'Procedures, training, signage', order: 4 },
  { id: 'ppe', name: 'PPE', description: 'Personal protective equipment', order: 5 }
]

/**
 * Calculate risk score from likelihood and severity
 * @param {number} likelihood - 1-5 scale
 * @param {number} severity - 1-5 scale
 * @returns {Object} Risk score and level
 */
export function calculateRiskScore(likelihood, severity) {
  const score = likelihood * severity

  let level, color, priority
  if (score <= 4) {
    level = 'Low'
    color = 'green'
    priority = 4
  } else if (score <= 9) {
    level = 'Medium'
    color = 'yellow'
    priority = 3
  } else if (score <= 16) {
    level = 'High'
    color = 'orange'
    priority = 2
  } else {
    level = 'Critical'
    color = 'red'
    priority = 1
  }

  return { score, level, color, priority }
}

/**
 * Get risk level from score
 * @param {number} score - Risk score (1-25)
 * @returns {Object} Risk level info
 */
export function getRiskLevel(score) {
  if (score <= 4) return { level: 'Low', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800' }
  if (score <= 9) return { level: 'Medium', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' }
  if (score <= 16) return { level: 'High', color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-800' }
  return { level: 'Critical', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-800' }
}

// ============================================
// CORE CRUD OPERATIONS
// ============================================

/**
 * Get all formal hazards with optional filtering
 * @param {Object} filters - Optional filters
 * @param {string} filters.category - Filter by category
 * @param {string} filters.status - Filter by status
 * @param {string} filters.source - Filter by source
 * @param {string} filters.ownerId - Filter by owner
 * @param {number} filters.minRiskScore - Minimum risk score
 * @returns {Promise<Array>} Array of FHA objects
 */
export async function getFormalHazards(filters = {}) {
  let q = query(formalHazardsRef, orderBy('createdAt', 'desc'))

  // Apply filters
  if (filters.category) {
    q = query(formalHazardsRef, where('category', '==', filters.category), orderBy('createdAt', 'desc'))
  }
  if (filters.status) {
    q = query(formalHazardsRef, where('status', '==', filters.status), orderBy('createdAt', 'desc'))
  }
  if (filters.source) {
    q = query(formalHazardsRef, where('source', '==', filters.source), orderBy('createdAt', 'desc'))
  }
  if (filters.ownerId) {
    q = query(formalHazardsRef, where('ownerId', '==', filters.ownerId), orderBy('createdAt', 'desc'))
  }

  const snapshot = await getDocs(q)
  let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

  // Client-side filter for risk score (Firestore doesn't support >= with other where clauses easily)
  if (filters.minRiskScore) {
    results = results.filter(fha => fha.riskScore >= filters.minRiskScore)
  }

  return results
}

/**
 * Get formal hazards for a specific user/organization
 * @param {string} ownerId - Owner ID (user or org)
 * @returns {Promise<Array>}
 */
export async function getUserFormalHazards(ownerId) {
  const q = query(
    formalHazardsRef,
    where('ownerId', '==', ownerId),
    orderBy('createdAt', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Get a single formal hazard by ID
 * @param {string} fhaId - FHA document ID
 * @returns {Promise<Object>}
 */
export async function getFormalHazard(fhaId) {
  const docRef = doc(db, 'formalHazards', fhaId)
  const snapshot = await getDoc(docRef)

  if (!snapshot.exists()) {
    throw new Error('Formal hazard assessment not found')
  }

  return { id: snapshot.id, ...snapshot.data() }
}

/**
 * Create a new formal hazard assessment
 * @param {Object} data - FHA data
 * @param {string} userId - Creating user's ID
 * @returns {Promise<Object>} Created FHA with ID
 */
export async function createFormalHazard(data, userId) {
  // Calculate risk scores if not provided
  const riskScore = data.riskScore || (data.likelihood * data.severity)
  const residualRiskScore = data.residualRiskScore ||
    ((data.residualLikelihood || data.likelihood) * (data.residualSeverity || data.severity))

  const fha = {
    fhaNumber: data.fhaNumber || await generateFHANumber(),
    title: data.title,
    category: data.category || 'flight_ops',
    description: data.description || '',
    consequences: data.consequences || '',

    // Initial risk assessment
    likelihood: data.likelihood || 3,
    severity: data.severity || 3,
    riskScore,

    // Control measures
    controlMeasures: data.controlMeasures || [],

    // Residual risk (after controls)
    residualLikelihood: data.residualLikelihood || data.likelihood || 3,
    residualSeverity: data.residualSeverity || data.severity || 3,
    residualRiskScore,

    // Status and source
    status: data.status || 'active',
    source: data.source || 'created',

    // Attachments and links
    attachments: data.attachments || [],
    linkedFieldForms: data.linkedFieldForms || [],

    // Review tracking
    reviewDate: data.reviewDate || null,
    lastReviewedBy: data.lastReviewedBy || null,

    // Ownership and timestamps
    ownerId: data.ownerId || userId,
    createdBy: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),

    // Optional metadata
    keywords: data.keywords || [],
    regulatoryRefs: data.regulatoryRefs || []
  }

  const docRef = await addDoc(formalHazardsRef, fha)
  return { id: docRef.id, ...fha }
}

/**
 * Update an existing formal hazard assessment
 * @param {string} fhaId - FHA document ID
 * @param {Object} data - Updated data
 * @param {string} userId - Updating user's ID
 * @returns {Promise<void>}
 */
export async function updateFormalHazard(fhaId, data, userId) {
  const docRef = doc(db, 'formalHazards', fhaId)

  // Recalculate risk scores if likelihood/severity changed
  const updateData = { ...data }

  if (data.likelihood !== undefined || data.severity !== undefined) {
    const existing = await getFormalHazard(fhaId)
    const likelihood = data.likelihood ?? existing.likelihood
    const severity = data.severity ?? existing.severity
    updateData.riskScore = likelihood * severity
  }

  if (data.residualLikelihood !== undefined || data.residualSeverity !== undefined) {
    const existing = await getFormalHazard(fhaId)
    const residualLikelihood = data.residualLikelihood ?? existing.residualLikelihood
    const residualSeverity = data.residualSeverity ?? existing.residualSeverity
    updateData.residualRiskScore = residualLikelihood * residualSeverity
  }

  await updateDoc(docRef, {
    ...updateData,
    updatedAt: serverTimestamp(),
    updatedBy: userId
  })
}

/**
 * Delete a formal hazard assessment
 * @param {string} fhaId - FHA document ID
 * @returns {Promise<void>}
 */
export async function deleteFormalHazard(fhaId) {
  const docRef = doc(db, 'formalHazards', fhaId)
  await deleteDoc(docRef)
}

// ============================================
// FHA NUMBER GENERATION
// ============================================

/**
 * Generate a unique FHA number
 * Format: FHA-YYYY-NNNN (e.g., FHA-2024-0001)
 * @returns {Promise<string>}
 */
export async function generateFHANumber() {
  const year = new Date().getFullYear()
  const prefix = `FHA-${year}-`

  // Get all FHAs with this year's prefix to find next number
  const q = query(formalHazardsRef, orderBy('fhaNumber', 'desc'), limit(100))
  const snapshot = await getDocs(q)

  let maxNumber = 0
  snapshot.docs.forEach(doc => {
    const fhaNumber = doc.data().fhaNumber || ''
    if (fhaNumber.startsWith(prefix)) {
      const num = parseInt(fhaNumber.replace(prefix, ''), 10)
      if (!isNaN(num) && num > maxNumber) {
        maxNumber = num
      }
    }
  })

  const nextNumber = String(maxNumber + 1).padStart(4, '0')
  return `${prefix}${nextNumber}`
}

// ============================================
// SEARCH AND FILTERING
// ============================================

/**
 * Search FHAs by text query
 * @param {string} searchQuery - Search text
 * @param {string} ownerId - Owner ID to filter by
 * @returns {Promise<Array>}
 */
export async function searchFormalHazards(searchQuery, ownerId = null) {
  const normalizedQuery = searchQuery.toLowerCase().trim()

  let q = query(formalHazardsRef, orderBy('createdAt', 'desc'))
  if (ownerId) {
    q = query(formalHazardsRef, where('ownerId', '==', ownerId), orderBy('createdAt', 'desc'))
  }

  const snapshot = await getDocs(q)
  const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

  // Client-side text search (Firestore doesn't support full-text search natively)
  return results.filter(fha => {
    const searchFields = [
      fha.title,
      fha.description,
      fha.consequences,
      fha.fhaNumber,
      ...(fha.keywords || [])
    ].join(' ').toLowerCase()

    return searchFields.includes(normalizedQuery)
  })
}

/**
 * Get FHAs by category
 * @param {string} category - Category ID
 * @param {string} ownerId - Owner ID
 * @returns {Promise<Array>}
 */
export async function getFHAsByCategory(category, ownerId = null) {
  let q = query(
    formalHazardsRef,
    where('category', '==', category),
    orderBy('riskScore', 'desc')
  )

  if (ownerId) {
    q = query(
      formalHazardsRef,
      where('ownerId', '==', ownerId),
      where('category', '==', category),
      orderBy('riskScore', 'desc')
    )
  }

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Get FHAs by risk level
 * @param {string} riskLevel - 'low', 'medium', 'high', 'critical'
 * @param {string} ownerId - Owner ID
 * @returns {Promise<Array>}
 */
export async function getFHAsByRiskLevel(riskLevel, ownerId = null) {
  const allFHAs = ownerId
    ? await getUserFormalHazards(ownerId)
    : await getFormalHazards()

  const levelRanges = {
    low: { min: 1, max: 4 },
    medium: { min: 5, max: 9 },
    high: { min: 10, max: 16 },
    critical: { min: 17, max: 25 }
  }

  const range = levelRanges[riskLevel.toLowerCase()]
  if (!range) return allFHAs

  return allFHAs.filter(fha =>
    fha.riskScore >= range.min && fha.riskScore <= range.max
  )
}

/**
 * Get FHA statistics
 * @param {string} ownerId - Owner ID
 * @returns {Promise<Object>} Statistics object
 */
export async function getFHAStats(ownerId = null) {
  const fhas = ownerId
    ? await getUserFormalHazards(ownerId)
    : await getFormalHazards()

  const stats = {
    total: fhas.length,
    byStatus: {
      active: 0,
      under_review: 0,
      archived: 0
    },
    byRiskLevel: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    },
    byCategory: {},
    bySource: {
      default: 0,
      uploaded: 0,
      created: 0,
      field_triggered: 0
    },
    needsReview: 0
  }

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  fhas.forEach(fha => {
    // Status counts
    if (stats.byStatus[fha.status] !== undefined) {
      stats.byStatus[fha.status]++
    }

    // Risk level counts
    const riskInfo = getRiskLevel(fha.riskScore)
    stats.byRiskLevel[riskInfo.level.toLowerCase()]++

    // Category counts
    if (!stats.byCategory[fha.category]) {
      stats.byCategory[fha.category] = 0
    }
    stats.byCategory[fha.category]++

    // Source counts
    if (stats.bySource[fha.source] !== undefined) {
      stats.bySource[fha.source]++
    }

    // Check if needs review (review date passed or never reviewed)
    if (fha.reviewDate) {
      const reviewDate = fha.reviewDate.toDate ? fha.reviewDate.toDate() : new Date(fha.reviewDate)
      if (reviewDate < now) {
        stats.needsReview++
      }
    } else if (fha.createdAt) {
      const createdDate = fha.createdAt.toDate ? fha.createdAt.toDate() : new Date(fha.createdAt)
      if (createdDate < thirtyDaysAgo) {
        stats.needsReview++
      }
    }
  })

  return stats
}

// ============================================
// FIELD HAZARD INTEGRATION
// ============================================

/**
 * Link a field form to an FHA
 * @param {string} fhaId - FHA document ID
 * @param {string} fieldFormId - Field form ID
 * @returns {Promise<void>}
 */
export async function linkFieldFormToFHA(fhaId, fieldFormId) {
  const fha = await getFormalHazard(fhaId)
  const linkedFieldForms = fha.linkedFieldForms || []

  if (!linkedFieldForms.includes(fieldFormId)) {
    linkedFieldForms.push(fieldFormId)
    await updateFormalHazard(fhaId, { linkedFieldForms })
  }
}

/**
 * Get all field forms linked to an FHA
 * @param {string} fhaId - FHA document ID
 * @returns {Promise<Array>}
 */
export async function getLinkedFieldForms(fhaId) {
  const fha = await getFormalHazard(fhaId)
  return fha.linkedFieldForms || []
}

/**
 * Unlink a field form from an FHA
 * @param {string} fhaId - FHA document ID
 * @param {string} fieldFormId - Field form ID
 * @returns {Promise<void>}
 */
export async function unlinkFieldFormFromFHA(fhaId, fieldFormId) {
  const fha = await getFormalHazard(fhaId)
  const linkedFieldForms = (fha.linkedFieldForms || []).filter(id => id !== fieldFormId)
  await updateFormalHazard(fhaId, { linkedFieldForms })
}

// ============================================
// SEEDING AND WHITE-LABELING
// ============================================

/**
 * Seed default FHAs for a user with white-labeling
 * @param {string} userId - User ID
 * @param {Object} businessDetails - Business details for white-labeling
 * @param {Array} defaultTemplates - Default FHA templates
 * @returns {Promise<Object>} Seeding result
 */
export async function seedDefaultFHAs(userId, businessDetails = {}, defaultTemplates = []) {
  const batch = writeBatch(db)
  let created = 0
  let skipped = 0

  // Get existing FHAs to avoid duplicates
  const existing = await getUserFormalHazards(userId)
  const existingNumbers = new Set(existing.map(fha => fha.fhaNumber))

  for (const template of defaultTemplates) {
    // Skip if already exists
    if (existingNumbers.has(template.fhaNumber)) {
      skipped++
      continue
    }

    // White-label the template
    const whiteLabeledFHA = whiteLabel(template, businessDetails)

    // Create new document reference
    const docRef = doc(formalHazardsRef)

    batch.set(docRef, {
      ...whiteLabeledFHA,
      ownerId: userId,
      source: 'default',
      status: 'active',
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })

    created++
  }

  if (created > 0) {
    await batch.commit()
  }

  return { created, skipped, total: defaultTemplates.length }
}

/**
 * White-label an FHA template with business details
 * @param {Object} template - FHA template
 * @param {Object} businessDetails - Business details
 * @returns {Object} White-labeled FHA
 */
export function whiteLabel(template, businessDetails = {}) {
  const {
    companyName = '[Company Name]',
    contactEmail = '[Contact Email]',
    contactPhone = '[Contact Phone]',
    address = '[Address]'
  } = businessDetails

  const replacePlaceholders = (text) => {
    if (!text) return text
    return text
      .replace(/\[Company Name\]/gi, companyName)
      .replace(/\[Contact Email\]/gi, contactEmail)
      .replace(/\[Contact Phone\]/gi, contactPhone)
      .replace(/\[Address\]/gi, address)
      .replace(/\{COMPANY_NAME\}/gi, companyName)
      .replace(/\{CONTACT_EMAIL\}/gi, contactEmail)
      .replace(/\{CONTACT_PHONE\}/gi, contactPhone)
      .replace(/\{ADDRESS\}/gi, address)
  }

  return {
    ...template,
    title: replacePlaceholders(template.title),
    description: replacePlaceholders(template.description),
    consequences: replacePlaceholders(template.consequences),
    controlMeasures: (template.controlMeasures || []).map(control => ({
      ...control,
      description: replacePlaceholders(control.description)
    }))
  }
}

/**
 * Check which default FHAs are missing for a user
 * @param {string} userId - User ID
 * @param {Array} defaultTemplates - Default FHA templates
 * @returns {Promise<Array>} Missing FHA numbers
 */
export async function getMissingDefaultFHAs(userId, defaultTemplates = []) {
  const existing = await getUserFormalHazards(userId)
  const existingNumbers = new Set(existing.map(fha => fha.fhaNumber))

  return defaultTemplates.filter(template => !existingNumbers.has(template.fhaNumber))
}

/**
 * Seed only missing default FHAs
 * @param {string} userId - User ID
 * @param {Object} businessDetails - Business details for white-labeling
 * @param {Array} defaultTemplates - Default FHA templates
 * @returns {Promise<Object>} Seeding result
 */
export async function seedMissingFHAs(userId, businessDetails = {}, defaultTemplates = []) {
  const missing = await getMissingDefaultFHAs(userId, defaultTemplates)
  return seedDefaultFHAs(userId, businessDetails, missing)
}

// ============================================
// ATTACHMENTS
// ============================================

/**
 * Add an attachment to an FHA
 * @param {string} fhaId - FHA document ID
 * @param {Object} attachment - Attachment data
 * @returns {Promise<void>}
 */
export async function addFHAAttachment(fhaId, attachment) {
  const fha = await getFormalHazard(fhaId)
  const attachments = fha.attachments || []

  attachments.push({
    ...attachment,
    addedAt: new Date().toISOString()
  })

  await updateFormalHazard(fhaId, { attachments })
}

/**
 * Remove an attachment from an FHA
 * @param {string} fhaId - FHA document ID
 * @param {string} attachmentPath - Storage path of attachment
 * @returns {Promise<void>}
 */
export async function removeFHAAttachment(fhaId, attachmentPath) {
  const fha = await getFormalHazard(fhaId)
  const attachments = (fha.attachments || []).filter(a => a.path !== attachmentPath)
  await updateFormalHazard(fhaId, { attachments })
}

// ============================================
// REVIEW MANAGEMENT
// ============================================

/**
 * Mark an FHA as reviewed
 * @param {string} fhaId - FHA document ID
 * @param {string} userId - Reviewing user's ID
 * @param {Date} nextReviewDate - Next review date
 * @returns {Promise<void>}
 */
export async function markFHAReviewed(fhaId, userId, nextReviewDate = null) {
  // Default to 12 months from now if not specified
  const reviewDate = nextReviewDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)

  await updateFormalHazard(fhaId, {
    lastReviewedBy: userId,
    lastReviewedAt: serverTimestamp(),
    reviewDate: Timestamp.fromDate(reviewDate),
    status: 'active'
  }, userId)
}

/**
 * Get FHAs needing review
 * @param {string} ownerId - Owner ID
 * @returns {Promise<Array>}
 */
export async function getFHAsNeedingReview(ownerId = null) {
  const fhas = ownerId
    ? await getUserFormalHazards(ownerId)
    : await getFormalHazards()

  const now = new Date()

  return fhas.filter(fha => {
    if (fha.reviewDate) {
      const reviewDate = fha.reviewDate.toDate ? fha.reviewDate.toDate() : new Date(fha.reviewDate)
      return reviewDate <= now
    }
    return false
  })
}
