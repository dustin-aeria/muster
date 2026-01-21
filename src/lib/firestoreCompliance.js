/**
 * firestoreCompliance.js
 * Firestore functions for Compliance Matrix Engine
 *
 * Collections:
 * - complianceTemplates: Platform-managed compliance matrix templates
 * - complianceApplications: User working copies of compliance applications
 * - documentRegistry: Supporting document registry for linking
 *
 * @location src/lib/firestoreCompliance.js
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
  writeBatch
} from 'firebase/firestore'
import { db } from './firebase'

// ============================================
// COLLECTION REFERENCES
// ============================================

const complianceTemplatesRef = collection(db, 'complianceTemplates')
const complianceApplicationsRef = collection(db, 'complianceApplications')
const documentRegistryRef = collection(db, 'documentRegistry')

// ============================================
// COMPLIANCE TEMPLATE CATEGORIES
// ============================================

export const TEMPLATE_CATEGORIES = {
  sfoc: {
    id: 'sfoc',
    name: 'SFOC Applications',
    description: 'Special Flight Operations Certificate compliance matrices',
    regulatoryBody: 'Transport Canada',
    icon: 'FileCheck',
    color: 'blue'
  },
  cor: {
    id: 'cor',
    name: 'COR Certification',
    description: 'Certificate of Recognition safety compliance',
    regulatoryBody: 'Alberta OH&S',
    icon: 'Shield',
    color: 'green'
  },
  sora: {
    id: 'sora',
    name: 'SORA Assessment',
    description: 'Specific Operations Risk Assessment documentation',
    regulatoryBody: 'JARUS/Transport Canada',
    icon: 'AlertTriangle',
    color: 'amber'
  },
  general: {
    id: 'general',
    name: 'General Compliance',
    description: 'Other regulatory compliance checklists',
    regulatoryBody: 'Various',
    icon: 'ClipboardCheck',
    color: 'gray'
  }
}

// ============================================
// RESPONSE TYPES
// ============================================

export const RESPONSE_TYPES = {
  text: {
    id: 'text',
    name: 'Text Response',
    description: 'Free-form text response'
  },
  'document-reference': {
    id: 'document-reference',
    name: 'Document Reference',
    description: 'Response with linked documents'
  },
  checkbox: {
    id: 'checkbox',
    name: 'Checkbox',
    description: 'Simple yes/no confirmation'
  },
  select: {
    id: 'select',
    name: 'Single Select',
    description: 'Choose one option from a list'
  },
  'multi-select': {
    id: 'multi-select',
    name: 'Multi Select',
    description: 'Choose multiple options from a list'
  }
}

// ============================================
// APPLICATION STATUS WORKFLOW
// ============================================

export const APPLICATION_STATUSES = {
  draft: {
    id: 'draft',
    name: 'Draft',
    description: 'Initial creation, not yet started',
    color: 'gray',
    allowedTransitions: ['in-progress']
  },
  'in-progress': {
    id: 'in-progress',
    name: 'In Progress',
    description: 'Actively being filled out',
    color: 'blue',
    allowedTransitions: ['ready-for-review', 'draft']
  },
  'ready-for-review': {
    id: 'ready-for-review',
    name: 'Ready for Review',
    description: 'Completed, awaiting internal review',
    color: 'amber',
    allowedTransitions: ['in-progress', 'submitted']
  },
  submitted: {
    id: 'submitted',
    name: 'Submitted',
    description: 'Submitted to regulatory body',
    color: 'purple',
    allowedTransitions: ['approved', 'rejected']
  },
  approved: {
    id: 'approved',
    name: 'Approved',
    description: 'Application approved',
    color: 'green',
    allowedTransitions: []
  },
  rejected: {
    id: 'rejected',
    name: 'Rejected',
    description: 'Application rejected, needs revision',
    color: 'red',
    allowedTransitions: ['in-progress']
  }
}

// ============================================
// COMPLIANCE TEMPLATES
// ============================================

/**
 * Get all compliance templates
 * @param {Object} filters - Optional filters (category, status, regulatoryBody)
 * @returns {Promise<Array>}
 */
export async function getComplianceTemplates(filters = {}) {
  let q = query(complianceTemplatesRef, orderBy('name', 'asc'))

  if (filters.category) {
    q = query(complianceTemplatesRef, where('category', '==', filters.category), orderBy('name', 'asc'))
  }

  if (filters.status) {
    q = query(complianceTemplatesRef, where('status', '==', filters.status), orderBy('name', 'asc'))
  }

  if (filters.isPublic !== undefined) {
    q = query(complianceTemplatesRef, where('isPublic', '==', filters.isPublic), orderBy('name', 'asc'))
  }

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Get a single compliance template by ID
 * @param {string} id - Template ID
 * @returns {Promise<Object>}
 */
export async function getComplianceTemplate(id) {
  const docRef = doc(db, 'complianceTemplates', id)
  const snapshot = await getDoc(docRef)

  if (!snapshot.exists()) {
    throw new Error('Compliance template not found')
  }

  return { id: snapshot.id, ...snapshot.data() }
}

/**
 * Create a new compliance template (admin only)
 * @param {Object} data - Template data
 * @returns {Promise<Object>}
 */
export async function createComplianceTemplate(data) {
  const template = {
    // Basic info
    name: data.name || '',
    shortName: data.shortName || '',
    description: data.description || '',

    // Metadata
    category: data.category || 'general',
    regulatoryBody: data.regulatoryBody || '',
    regulation: data.regulation || '',
    version: data.version || '1.0',
    effectiveDate: data.effectiveDate || null,

    // Structure
    categories: data.categories || [],
    requirements: data.requirements || [],

    // Export configuration
    exportFormat: data.exportFormat || {
      type: 'matrix',
      columns: ['requirement', 'response', 'documentRef'],
      includeGuidance: false
    },

    // Related templates
    relatedTemplates: data.relatedTemplates || [],

    // Status
    status: data.status || 'draft',
    isPublic: data.isPublic !== undefined ? data.isPublic : false,

    // Timestamps
    createdAt: serverTimestamp(),
    createdBy: data.createdBy || null,
    updatedAt: serverTimestamp(),
    updatedBy: data.updatedBy || null
  }

  const docRef = await addDoc(complianceTemplatesRef, template)
  return { id: docRef.id, ...template }
}

/**
 * Update a compliance template
 * @param {string} id - Template ID
 * @param {Object} data - Updated data
 * @param {string} userId - User making the update
 */
export async function updateComplianceTemplate(id, data, userId = null) {
  const docRef = doc(db, 'complianceTemplates', id)
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
    updatedBy: userId
  })
}

/**
 * Delete a compliance template (admin only)
 * @param {string} id - Template ID
 */
export async function deleteComplianceTemplate(id) {
  // Check if any applications use this template
  const appsQuery = query(complianceApplicationsRef, where('templateId', '==', id))
  const appsSnapshot = await getDocs(appsQuery)

  if (!appsSnapshot.empty) {
    throw new Error('Cannot delete template with existing applications')
  }

  const docRef = doc(db, 'complianceTemplates', id)
  await deleteDoc(docRef)
}

// ============================================
// COMPLIANCE APPLICATIONS
// ============================================

/**
 * Get compliance applications for a user/operator
 * @param {Object} filters - Filters (operatorId, projectId, status, templateId)
 * @returns {Promise<Array>}
 */
export async function getComplianceApplications(filters = {}) {
  let q = query(complianceApplicationsRef, orderBy('updatedAt', 'desc'))

  if (filters.operatorId) {
    q = query(
      complianceApplicationsRef,
      where('operatorId', '==', filters.operatorId),
      orderBy('updatedAt', 'desc')
    )
  }

  if (filters.projectId) {
    q = query(
      complianceApplicationsRef,
      where('projectId', '==', filters.projectId),
      orderBy('updatedAt', 'desc')
    )
  }

  if (filters.status) {
    q = query(
      complianceApplicationsRef,
      where('status', '==', filters.status),
      orderBy('updatedAt', 'desc')
    )
  }

  if (filters.limit) {
    q = query(q, limit(filters.limit))
  }

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Get a single compliance application by ID
 * @param {string} id - Application ID
 * @returns {Promise<Object>}
 */
export async function getComplianceApplication(id) {
  const docRef = doc(db, 'complianceApplications', id)
  const snapshot = await getDoc(docRef)

  if (!snapshot.exists()) {
    throw new Error('Compliance application not found')
  }

  return { id: snapshot.id, ...snapshot.data() }
}

/**
 * Create a new compliance application from a template
 * @param {Object} data - Application data including templateId
 * @returns {Promise<Object>}
 */
export async function createComplianceApplication(data) {
  // Get the template to validate and copy metadata
  const template = await getComplianceTemplate(data.templateId)

  // Initialize empty responses for all requirements
  const responses = {}
  template.requirements.forEach(req => {
    responses[req.id] = {
      response: '',
      documentRefs: [],
      status: 'empty',
      lastUpdated: null,
      updatedBy: null,
      aiAssisted: false,
      aiDraftAccepted: false,
      reviewNotes: '',
      flagged: false,
      flagReason: null
    }
  })

  // Calculate initial progress
  const progress = calculateProgress(template.requirements, responses)

  const application = {
    // Template reference
    templateId: data.templateId,
    templateName: template.name,
    templateVersion: template.version,

    // Metadata
    name: data.name || `${template.shortName || template.name} - ${new Date().toLocaleDateString()}`,
    description: data.description || '',

    // Operator context
    operatorId: data.operatorId || null,

    // Linked project (optional)
    projectId: data.projectId || null,
    projectName: data.projectName || '',

    // Status workflow
    status: 'draft',
    statusHistory: [{
      status: 'draft',
      timestamp: new Date().toISOString(),
      userId: data.createdBy,
      notes: 'Application created'
    }],

    // Responses to requirements
    responses,

    // Progress tracking
    progress,

    // Uploaded files specific to this application
    uploadedFiles: [],

    // Gap analysis results (computed)
    gapAnalysis: null,

    // Submission tracking
    submission: {
      submittedAt: null,
      submittedBy: null,
      submittedTo: '',
      referenceNumber: null,
      responseReceivedAt: null,
      outcome: null
    },

    // Timestamps
    createdAt: serverTimestamp(),
    createdBy: data.createdBy || null,
    updatedAt: serverTimestamp(),
    updatedBy: data.updatedBy || null
  }

  const docRef = await addDoc(complianceApplicationsRef, application)
  return { id: docRef.id, ...application }
}

/**
 * Update a compliance application
 * @param {string} id - Application ID
 * @param {Object} data - Updated data
 * @param {string} userId - User making the update
 */
export async function updateComplianceApplication(id, data, userId = null) {
  const docRef = doc(db, 'complianceApplications', id)
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
    updatedBy: userId
  })
}

/**
 * Update a single requirement response in an application
 * @param {string} applicationId - Application ID
 * @param {string} requirementId - Requirement ID
 * @param {Object} responseData - Response data
 * @param {string} userId - User making the update
 */
export async function updateRequirementResponse(applicationId, requirementId, responseData, userId = null) {
  return await runTransaction(db, async (transaction) => {
    const appRef = doc(db, 'complianceApplications', applicationId)
    const appSnap = await transaction.get(appRef)

    if (!appSnap.exists()) {
      throw new Error('Application not found')
    }

    const appData = appSnap.data()
    const responses = { ...appData.responses }

    // Update the specific response
    responses[requirementId] = {
      ...responses[requirementId],
      ...responseData,
      lastUpdated: new Date().toISOString(),
      updatedBy: userId
    }

    // Determine response status
    const hasResponse = responseData.response && responseData.response.trim().length > 0
    const hasDocs = responseData.documentRefs && responseData.documentRefs.length > 0

    if (!hasResponse && !hasDocs) {
      responses[requirementId].status = 'empty'
    } else if (responseData.flagged) {
      responses[requirementId].status = 'needs-attention'
    } else if (hasResponse && (responseData.responseType !== 'document-reference' || hasDocs)) {
      responses[requirementId].status = 'complete'
    } else {
      responses[requirementId].status = 'partial'
    }

    // Get template to recalculate progress
    const template = await getComplianceTemplate(appData.templateId)
    const progress = calculateProgress(template.requirements, responses)

    transaction.update(appRef, {
      responses,
      progress,
      updatedAt: serverTimestamp(),
      updatedBy: userId
    })

    return { responses, progress }
  })
}

/**
 * Update application status with history tracking
 * @param {string} id - Application ID
 * @param {string} newStatus - New status
 * @param {string} userId - User making the change
 * @param {string} notes - Optional notes
 */
export async function updateApplicationStatus(id, newStatus, userId, notes = '') {
  return await runTransaction(db, async (transaction) => {
    const appRef = doc(db, 'complianceApplications', id)
    const appSnap = await transaction.get(appRef)

    if (!appSnap.exists()) {
      throw new Error('Application not found')
    }

    const appData = appSnap.data()
    const currentStatus = appData.status
    const statusConfig = APPLICATION_STATUSES[currentStatus]

    // Validate transition
    if (!statusConfig.allowedTransitions.includes(newStatus)) {
      throw new Error(`Cannot transition from ${currentStatus} to ${newStatus}`)
    }

    const statusHistory = [...(appData.statusHistory || []), {
      status: newStatus,
      timestamp: new Date().toISOString(),
      userId,
      notes
    }]

    transaction.update(appRef, {
      status: newStatus,
      statusHistory,
      updatedAt: serverTimestamp(),
      updatedBy: userId
    })

    return { status: newStatus, statusHistory }
  })
}

/**
 * Delete a compliance application
 * @param {string} id - Application ID
 */
export async function deleteComplianceApplication(id) {
  const docRef = doc(db, 'complianceApplications', id)
  await deleteDoc(docRef)
}

// ============================================
// DOCUMENT REGISTRY
// ============================================

/**
 * Get documents from registry
 * @param {Object} filters - Filters (operatorId, sourceType, category)
 * @returns {Promise<Array>}
 */
export async function getDocumentRegistry(filters = {}) {
  let q = query(documentRegistryRef, orderBy('title', 'asc'))

  if (filters.operatorId) {
    q = query(
      documentRegistryRef,
      where('operatorId', '==', filters.operatorId),
      orderBy('title', 'asc')
    )
  }

  if (filters.sourceType) {
    q = query(
      documentRegistryRef,
      where('sourceType', '==', filters.sourceType),
      orderBy('title', 'asc')
    )
  }

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Register a document in the registry
 * @param {Object} data - Document data
 * @returns {Promise<Object>}
 */
export async function registerDocument(data) {
  const document = {
    // Source
    sourceType: data.sourceType, // 'policy', 'project', 'uploaded', 'external'
    sourceId: data.sourceId || null,

    // Operator context
    operatorId: data.operatorId || null,

    // Metadata
    title: data.title || '',
    description: data.description || '',
    category: data.category || 'general',

    // Content info
    version: data.version || '1.0',
    effectiveDate: data.effectiveDate || null,
    pageCount: data.pageCount || null,

    // Compliance mapping
    relevantRegulations: data.relevantRegulations || [],
    relevantRequirements: data.relevantRequirements || [],

    // Keywords for search
    keywords: data.keywords || [],

    // Status
    status: data.status || 'current',
    lastReviewed: data.lastReviewed || null,

    // Timestamps
    createdAt: serverTimestamp(),
    createdBy: data.createdBy || null,
    updatedAt: serverTimestamp()
  }

  const docRef = await addDoc(documentRegistryRef, document)
  return { id: docRef.id, ...document }
}

/**
 * Update a document in the registry
 * @param {string} id - Document ID
 * @param {Object} data - Updated data
 */
export async function updateRegistryDocument(id, data) {
  const docRef = doc(db, 'documentRegistry', id)
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  })
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate progress for an application
 * @param {Array} requirements - Template requirements
 * @param {Object} responses - Application responses
 * @returns {Object} Progress stats
 */
export function calculateProgress(requirements, responses) {
  const total = requirements.length
  let complete = 0
  let partial = 0
  let empty = 0
  let needsAttention = 0

  const byCategory = {}

  requirements.forEach(req => {
    const response = responses[req.id]
    const status = response?.status || 'empty'

    switch (status) {
      case 'complete':
        complete++
        break
      case 'partial':
        partial++
        break
      case 'needs-attention':
        needsAttention++
        break
      default:
        empty++
    }

    // Track by category
    if (!byCategory[req.category]) {
      byCategory[req.category] = { total: 0, complete: 0, partial: 0, empty: 0 }
    }
    byCategory[req.category].total++
    byCategory[req.category][status === 'complete' ? 'complete' : status === 'partial' ? 'partial' : 'empty']++
  })

  return {
    total,
    complete,
    partial,
    empty,
    needsAttention,
    percentComplete: total > 0 ? Math.round((complete / total) * 100) : 0,
    byCategory
  }
}

/**
 * Run gap analysis on an application
 * @param {string} applicationId - Application ID
 * @returns {Promise<Object>} Gap analysis results
 */
export async function runGapAnalysis(applicationId) {
  const application = await getComplianceApplication(applicationId)
  const template = await getComplianceTemplate(application.templateId)

  const missingDocumentation = []
  const incompleteResponses = []
  const suggestedActions = []

  template.requirements.forEach(req => {
    const response = application.responses[req.id]

    // Check for missing responses
    if (!response || response.status === 'empty') {
      incompleteResponses.push(req.id)
    }

    // Check for missing documentation on document-reference requirements
    if (req.responseType === 'document-reference') {
      if (!response?.documentRefs || response.documentRefs.length === 0) {
        missingDocumentation.push(req.id)
      }
    }

    // Check validation rules
    if (req.validationRules) {
      req.validationRules.forEach(rule => {
        if (rule.type === 'requiresDocument' && (!response?.documentRefs || response.documentRefs.length === 0)) {
          suggestedActions.push({
            type: 'add-document',
            title: `Add documentation for: ${req.shortText || req.text.substring(0, 50)}`,
            relatedRequirements: [req.id],
            docTypes: rule.docTypes
          })
        }
      })
    }
  })

  const gapAnalysis = {
    lastRun: new Date().toISOString(),
    missingDocumentation,
    incompleteResponses,
    outdatedPolicies: [], // Would need to check policy versions
    suggestedActions
  }

  // Save gap analysis to application
  await updateComplianceApplication(applicationId, { gapAnalysis })

  return gapAnalysis
}

/**
 * Seed a compliance template
 * Used by seed scripts to add templates
 * @param {Object} templateData - Full template data including ID
 */
export async function seedComplianceTemplate(templateData) {
  const { id, ...data } = templateData

  const template = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  if (id) {
    // Use specific ID
    const docRef = doc(db, 'complianceTemplates', id)
    await updateDoc(docRef, template).catch(async () => {
      // Document doesn't exist, create it
      const batch = writeBatch(db)
      batch.set(docRef, template)
      await batch.commit()
    })
    return { id, ...template }
  } else {
    // Auto-generate ID
    const docRef = await addDoc(complianceTemplatesRef, template)
    return { id: docRef.id, ...template }
  }
}
