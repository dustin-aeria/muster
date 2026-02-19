/**
 * Firestore Document Generation Service
 * Handles CRUD operations for AI-driven document generation system
 *
 * Collections:
 * - documentProjects: Client documentation projects
 * - generatedDocuments: Individual documents within projects
 * - documentConversations/{documentId}/messages: Chat history (subcollection)
 *
 * @location src/lib/firestoreDocumentGeneration.js
 */

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  writeBatch,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore'
import { db } from './firebase'
import { getFunctions, httpsCallable } from 'firebase/functions'

// ============================================
// CONSTANTS
// ============================================

export const PROJECT_STATUSES = {
  active: { label: 'Active', color: 'bg-green-100 text-green-800' },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-800' },
  archived: { label: 'Archived', color: 'bg-gray-100 text-gray-800' }
}

export const DOCUMENT_STATUSES = {
  draft: { label: 'Draft', color: 'bg-yellow-100 text-yellow-800' },
  in_review: { label: 'In Review', color: 'bg-purple-100 text-purple-800' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800' },
  published: { label: 'Published', color: 'bg-blue-100 text-blue-800' }
}

export const DOCUMENT_TYPES = {
  sms: {
    label: 'Safety Management System',
    description: 'Comprehensive SMS documentation including policy, risk management, assurance, and promotion',
    icon: 'Shield',
    sections: ['Policy & Objectives', 'Safety Risk Management', 'Safety Assurance', 'Safety Promotion']
  },
  training_manual: {
    label: 'Training Manual',
    description: 'Training program documentation covering ground, flight, proficiency, and recurrent training',
    icon: 'GraduationCap',
    sections: ['Ground Training', 'Flight Training', 'Proficiency Standards', 'Recurrent Training']
  },
  maintenance_plan: {
    label: 'Maintenance Program',
    description: 'Maintenance policy, schedules, procedures, and record-keeping requirements',
    icon: 'Wrench',
    sections: ['Maintenance Policy', 'Maintenance Schedule', 'Maintenance Procedures', 'Records Management']
  },
  ops_manual: {
    label: 'Operations Manual',
    description: 'Organizational structure, flight operations, and emergency procedures',
    icon: 'BookOpen',
    sections: ['Organization', 'Flight Operations', 'Emergency Procedures', 'Standard Operating Procedures']
  },
  safety_declaration: {
    label: 'Safety Declaration',
    description: 'Declaration of safety scope, commitment, and risk assessment',
    icon: 'FileCheck',
    sections: ['Declaration Statement', 'Scope of Operations', 'Risk Assessment', 'Commitment to Safety']
  },
  hse_manual: {
    label: 'HSE Manual',
    description: 'Health, Safety, and Environment manual covering hazards, incidents, and PPE',
    icon: 'ShieldCheck',
    sections: ['HSE Policy', 'Hazard Management', 'Incident Management', 'PPE Requirements']
  },
  risk_assessment: {
    label: 'Risk Assessment',
    description: 'Comprehensive risk assessment with hazard identification and mitigations',
    icon: 'AlertTriangle',
    sections: ['Scope', 'Hazard Identification', 'Risk Analysis', 'Mitigation Measures']
  },
  sop: {
    label: 'Standard Operating Procedure',
    description: 'Detailed SOP with purpose, responsibilities, and step-by-step procedures',
    icon: 'ClipboardList',
    sections: ['Purpose', 'Responsibilities', 'Procedure Steps', 'References']
  },
  erp: {
    label: 'Emergency Response Plan',
    description: 'Emergency response procedures, contacts, and communication protocols',
    icon: 'AlertCircle',
    sections: ['Overview', 'Emergency Contacts', 'Response Procedures', 'Communication Protocol']
  },
  compliance_matrix: {
    label: 'Compliance Matrix',
    description: 'Regulatory requirements tracking with status and evidence documentation',
    icon: 'CheckSquare',
    sections: ['Requirements Overview', 'Compliance Status', 'Evidence Documentation', 'Gap Analysis']
  }
}

// ============================================
// DOCUMENT PROJECTS CRUD
// ============================================

/**
 * Create a new document project
 */
export async function createDocumentProject(projectData) {
  const project = {
    organizationId: projectData.organizationId,
    clientId: projectData.clientId,
    clientName: projectData.clientName,
    name: projectData.name,
    description: projectData.description || '',
    status: 'active',
    branding: projectData.branding || {
      name: projectData.clientName,
      logo: null,
      colors: {
        primary: '#1e3a5f',
        secondary: '#2563eb',
        accent: '#3b82f6'
      }
    },
    sharedContext: {
      companyProfile: projectData.companyProfile || '',
      operationsScope: projectData.operationsScope || '',
      aircraftTypes: projectData.aircraftTypes || [],
      regulations: projectData.regulations || [],
      customContext: projectData.customContext || ''
    },
    documentIds: [],
    createdBy: projectData.createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  const docRef = await addDoc(collection(db, 'documentProjects'), project)
  return { id: docRef.id, ...project }
}

/**
 * Get a document project by ID
 */
export async function getDocumentProject(projectId) {
  const docRef = doc(db, 'documentProjects', projectId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return null
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: docSnap.data().createdAt?.toDate(),
    updatedAt: docSnap.data().updatedAt?.toDate()
  }
}

/**
 * Get all document projects for an organization
 */
export async function getDocumentProjects(organizationId, options = {}) {
  const { status = null, clientId = null } = options

  let q = query(
    collection(db, 'documentProjects'),
    where('organizationId', '==', organizationId),
    orderBy('updatedAt', 'desc')
  )

  const snapshot = await getDocs(q)
  let projects = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate()
  }))

  // Filter by status if specified
  if (status) {
    projects = projects.filter(p => p.status === status)
  }

  // Filter by client if specified
  if (clientId) {
    projects = projects.filter(p => p.clientId === clientId)
  }

  return projects
}

/**
 * Subscribe to document projects for real-time updates
 */
export function subscribeToDocumentProjects(organizationId, callback, onError) {
  const q = query(
    collection(db, 'documentProjects'),
    where('organizationId', '==', organizationId),
    orderBy('updatedAt', 'desc')
  )

  return onSnapshot(q, (snapshot) => {
    const projects = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    }))
    callback(projects)
  }, (error) => {
    console.error('Error subscribing to document projects:', error)
    if (onError) {
      onError(error)
    }
  })
}

/**
 * Update a document project
 */
export async function updateDocumentProject(projectId, updates) {
  const projectRef = doc(db, 'documentProjects', projectId)
  await updateDoc(projectRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })
}

/**
 * Delete a document project and all its documents
 */
export async function deleteDocumentProject(projectId) {
  const batch = writeBatch(db)

  // Get all documents in the project
  const docsQuery = query(
    collection(db, 'generatedDocuments'),
    where('documentProjectId', '==', projectId)
  )
  const docsSnapshot = await getDocs(docsQuery)

  // Delete all documents and their conversations
  for (const docSnap of docsSnapshot.docs) {
    // Delete conversation messages
    const messagesQuery = query(
      collection(db, 'documentConversations', docSnap.id, 'messages')
    )
    const messagesSnapshot = await getDocs(messagesQuery)
    messagesSnapshot.docs.forEach(msgDoc => {
      batch.delete(doc(db, 'documentConversations', docSnap.id, 'messages', msgDoc.id))
    })

    // Delete the document
    batch.delete(doc(db, 'generatedDocuments', docSnap.id))
  }

  // Delete the project
  batch.delete(doc(db, 'documentProjects', projectId))

  await batch.commit()
}

/**
 * Update shared context for a project
 */
export async function updateSharedContext(projectId, sharedContext) {
  await updateDocumentProject(projectId, { sharedContext })
}

/**
 * Update branding for a project
 */
export async function updateProjectBranding(projectId, branding) {
  await updateDocumentProject(projectId, { branding })
}

// ============================================
// GENERATED DOCUMENTS CRUD
// ============================================

/**
 * Create a new generated document
 */
export async function createGeneratedDocument(documentData) {
  const document = {
    documentProjectId: documentData.documentProjectId,
    organizationId: documentData.organizationId,
    type: documentData.type,
    title: documentData.title,
    version: '1.0',
    status: 'draft',
    sections: DOCUMENT_TYPES[documentData.type]?.sections.map((title, index) => ({
      id: `section-${index + 1}`,
      title,
      content: '',
      order: index,
      generatedFrom: null
    })) || [],
    crossReferences: [],
    localContext: {
      specificRequirements: documentData.specificRequirements || '',
      sourceReferences: documentData.sourceReferences || [],
      regulatoryReferences: documentData.regulatoryReferences || []
    },
    exports: [],
    createdBy: documentData.createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  const docRef = await addDoc(collection(db, 'generatedDocuments'), document)

  // Add document ID to project's documentIds array
  const projectRef = doc(db, 'documentProjects', documentData.documentProjectId)
  await updateDoc(projectRef, {
    documentIds: arrayUnion(docRef.id),
    updatedAt: serverTimestamp()
  })

  return { id: docRef.id, ...document }
}

/**
 * Get a generated document by ID
 */
export async function getGeneratedDocument(documentId) {
  const docRef = doc(db, 'generatedDocuments', documentId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return null
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: docSnap.data().createdAt?.toDate(),
    updatedAt: docSnap.data().updatedAt?.toDate()
  }
}

/**
 * Get all documents for a project
 */
export async function getProjectDocuments(projectId) {
  const q = query(
    collection(db, 'generatedDocuments'),
    where('documentProjectId', '==', projectId),
    orderBy('createdAt', 'asc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate()
  }))
}

/**
 * Subscribe to documents for a project
 */
export function subscribeToProjectDocuments(projectId, callback) {
  const q = query(
    collection(db, 'generatedDocuments'),
    where('documentProjectId', '==', projectId),
    orderBy('createdAt', 'asc')
  )

  return onSnapshot(q, (snapshot) => {
    const documents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    }))
    callback(documents)
  })
}

/**
 * Subscribe to a single document for real-time updates
 */
export function subscribeToDocument(documentId, callback) {
  const docRef = doc(db, 'generatedDocuments', documentId)

  return onSnapshot(docRef, (docSnap) => {
    if (!docSnap.exists()) {
      callback(null)
      return
    }

    callback({
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate(),
      updatedAt: docSnap.data().updatedAt?.toDate()
    })
  })
}

/**
 * Update a generated document
 */
export async function updateGeneratedDocument(documentId, updates) {
  const docRef = doc(db, 'generatedDocuments', documentId)
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })
}

/**
 * Update a specific section of a document
 */
export async function updateDocumentSection(documentId, sectionId, sectionUpdates) {
  const document = await getGeneratedDocument(documentId)
  if (!document) return

  const updatedSections = document.sections.map(section =>
    section.id === sectionId ? { ...section, ...sectionUpdates } : section
  )

  await updateGeneratedDocument(documentId, { sections: updatedSections })
}

/**
 * Reorder document sections
 */
export async function reorderDocumentSections(documentId, sectionIds) {
  const document = await getGeneratedDocument(documentId)
  if (!document) return

  const sectionMap = new Map(document.sections.map(s => [s.id, s]))
  const reorderedSections = sectionIds.map((id, index) => ({
    ...sectionMap.get(id),
    order: index
  }))

  await updateGeneratedDocument(documentId, { sections: reorderedSections })
}

/**
 * Add a new section to a document
 */
export async function addDocumentSection(documentId, sectionData) {
  const document = await getGeneratedDocument(documentId)
  if (!document) return

  const newSection = {
    id: `section-${Date.now()}`,
    title: sectionData.title || 'New Section',
    content: sectionData.content || '',
    order: document.sections.length,
    generatedFrom: sectionData.generatedFrom || null
  }

  const updatedSections = [...document.sections, newSection]
  await updateGeneratedDocument(documentId, { sections: updatedSections })

  return newSection
}

/**
 * Delete a section from a document
 */
export async function deleteDocumentSection(documentId, sectionId) {
  const document = await getGeneratedDocument(documentId)
  if (!document) return

  const updatedSections = document.sections
    .filter(s => s.id !== sectionId)
    .map((s, index) => ({ ...s, order: index }))

  await updateGeneratedDocument(documentId, { sections: updatedSections })
}

/**
 * Delete a generated document
 */
export async function deleteGeneratedDocument(documentId) {
  const document = await getGeneratedDocument(documentId)
  if (!document) return

  const batch = writeBatch(db)

  // Delete conversation messages
  const messagesQuery = query(
    collection(db, 'documentConversations', documentId, 'messages')
  )
  const messagesSnapshot = await getDocs(messagesQuery)
  messagesSnapshot.docs.forEach(msgDoc => {
    batch.delete(doc(db, 'documentConversations', documentId, 'messages', msgDoc.id))
  })

  // Remove document ID from project's documentIds array
  const projectRef = doc(db, 'documentProjects', document.documentProjectId)
  batch.update(projectRef, {
    documentIds: arrayRemove(documentId),
    updatedAt: serverTimestamp()
  })

  // Delete the document
  batch.delete(doc(db, 'generatedDocuments', documentId))

  await batch.commit()
}

/**
 * Update document status
 */
export async function updateDocumentStatus(documentId, status) {
  await updateGeneratedDocument(documentId, { status })
}

/**
 * Increment document version
 */
export async function incrementDocumentVersion(documentId) {
  const document = await getGeneratedDocument(documentId)
  if (!document) return

  const currentVersion = parseFloat(document.version) || 1.0
  const newVersion = (currentVersion + 0.1).toFixed(1)

  await updateGeneratedDocument(documentId, { version: newVersion })
  return newVersion
}

// ============================================
// CONVERSATION MESSAGES
// ============================================

/**
 * Subscribe to conversation messages for a document
 */
export function subscribeToConversation(documentId, callback) {
  const q = query(
    collection(db, 'documentConversations', documentId, 'messages'),
    orderBy('createdAt', 'asc')
  )

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }))
    callback(messages)
  })
}

/**
 * Get conversation messages for a document
 */
export async function getConversationMessages(documentId, messageLimit = 50) {
  const q = query(
    collection(db, 'documentConversations', documentId, 'messages'),
    orderBy('createdAt', 'desc'),
    limit(messageLimit)
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate()
  })).reverse()
}

/**
 * Add a message to the conversation (used internally, prefer sendDocumentMessage callable)
 */
export async function addConversationMessage(documentId, messageData) {
  const message = {
    role: messageData.role,
    content: messageData.content,
    tokenUsage: messageData.tokenUsage || null,
    contextSnapshot: messageData.contextSnapshot || null,
    createdAt: serverTimestamp()
  }

  const docRef = await addDoc(
    collection(db, 'documentConversations', documentId, 'messages'),
    message
  )

  return { id: docRef.id, ...message }
}

// ============================================
// CROSS-REFERENCES
// ============================================

/**
 * Add a cross-reference between documents
 */
export async function addCrossReference(documentId, crossRef) {
  const document = await getGeneratedDocument(documentId)
  if (!document) return

  const newCrossRef = {
    id: `ref-${Date.now()}`,
    targetDocumentId: crossRef.targetDocumentId,
    targetSectionId: crossRef.targetSectionId || null,
    referenceText: crossRef.referenceText,
    createdAt: new Date().toISOString()
  }

  const updatedRefs = [...(document.crossReferences || []), newCrossRef]
  await updateGeneratedDocument(documentId, { crossReferences: updatedRefs })

  return newCrossRef
}

/**
 * Remove a cross-reference
 */
export async function removeCrossReference(documentId, crossRefId) {
  const document = await getGeneratedDocument(documentId)
  if (!document) return

  const updatedRefs = (document.crossReferences || []).filter(ref => ref.id !== crossRefId)
  await updateGeneratedDocument(documentId, { crossReferences: updatedRefs })
}

// ============================================
// EXPORT TRACKING
// ============================================

/**
 * Record a document export
 */
export async function recordDocumentExport(documentId, exportData) {
  const document = await getGeneratedDocument(documentId)
  if (!document) return

  const exportRecord = {
    id: `export-${Date.now()}`,
    exportedAt: new Date().toISOString(),
    format: exportData.format,
    fileUrl: exportData.fileUrl || null,
    exportedBy: exportData.exportedBy
  }

  const updatedExports = [...(document.exports || []), exportRecord]
  await updateGeneratedDocument(documentId, { exports: updatedExports })

  return exportRecord
}

// ============================================
// CLAUDE API CALLABLE FUNCTION
// ============================================

/**
 * Send a message to Claude for document generation
 * This calls the Cloud Function which handles the Claude API interaction
 */
export async function sendDocumentMessage(documentId, message, userId) {
  const functions = getFunctions()
  const sendMessage = httpsCallable(functions, 'sendDocumentMessage')

  try {
    const result = await sendMessage({
      documentId,
      message,
      userId
    })

    return result.data
  } catch (error) {
    console.error('Error sending document message:', error)
    throw error
  }
}

/**
 * Generate content for a specific section
 */
export async function generateSectionContent(documentId, sectionId, prompt, userId, options = {}) {
  const functions = getFunctions()
  const generateSection = httpsCallable(functions, 'generateSectionContent')

  try {
    const result = await generateSection({
      documentId,
      sectionId,
      prompt,
      userId,
      enableResearch: options.enableResearch !== false // Default true
    })

    return result.data
  } catch (error) {
    console.error('Error generating section content:', error)
    throw error
  }
}

/**
 * Populate all sections of a document with baseline content from knowledge base
 * This generates complete content for all empty sections at once
 * @param {string} documentId - Document ID
 * @returns {Promise<Object>} Result with sections updated count
 */
export async function populateAllSections(documentId) {
  const functions = getFunctions()
  const populate = httpsCallable(functions, 'populateAllSections', {
    timeout: 540000 // 9 minute timeout for full document generation
  })

  try {
    const result = await populate({ documentId })
    return result.data
  } catch (error) {
    console.error('Error populating all sections:', error)
    throw error
  }
}

/**
 * Search the knowledge base for relevant policies and procedures
 * @param {string} query - Search query
 * @param {string} type - 'all', 'policies', or 'procedures'
 * @param {number} limit - Max results
 * @returns {Promise<Object>} Search results
 */
export async function searchKnowledgeBase(query, type = 'all', limit = 10) {
  const functions = getFunctions()
  const search = httpsCallable(functions, 'searchKnowledgeBase')

  try {
    const result = await search({ query, type, limit })
    return result.data
  } catch (error) {
    console.error('Error searching knowledge base:', error)
    throw error
  }
}

/**
 * Get relevant knowledge base content for a specific document type
 * @param {string} documentType - Document type (sms, ops_manual, etc.)
 * @param {Object} projectContext - Project shared context for scope detection
 * @returns {Promise<Object>} Relevant policies, procedures, and gaps
 */
export async function getKnowledgeForDocumentType(documentType, projectContext = {}) {
  const functions = getFunctions()
  const getKnowledge = httpsCallable(functions, 'getKnowledgeForDocumentType')

  try {
    const result = await getKnowledge({ documentType, projectContext })
    return result.data
  } catch (error) {
    console.error('Error getting knowledge for document type:', error)
    throw error
  }
}

// ============================================
// HELPERS
// ============================================

/**
 * Get document type info
 */
export function getDocumentTypeInfo(type) {
  return DOCUMENT_TYPES[type] || null
}

/**
 * Get all document types
 */
export function getAllDocumentTypes() {
  return Object.entries(DOCUMENT_TYPES).map(([key, value]) => ({
    id: key,
    ...value
  }))
}

/**
 * Calculate total token usage for a document
 */
export async function getDocumentTokenUsage(documentId) {
  const messages = await getConversationMessages(documentId, 1000)

  let totalPromptTokens = 0
  let totalCompletionTokens = 0

  messages.forEach(msg => {
    if (msg.tokenUsage) {
      totalPromptTokens += msg.tokenUsage.promptTokens || 0
      totalCompletionTokens += msg.tokenUsage.completionTokens || 0
    }
  })

  return {
    promptTokens: totalPromptTokens,
    completionTokens: totalCompletionTokens,
    totalTokens: totalPromptTokens + totalCompletionTokens
  }
}

export default {
  PROJECT_STATUSES,
  DOCUMENT_STATUSES,
  DOCUMENT_TYPES,
  createDocumentProject,
  getDocumentProject,
  getDocumentProjects,
  subscribeToDocumentProjects,
  updateDocumentProject,
  deleteDocumentProject,
  updateSharedContext,
  updateProjectBranding,
  createGeneratedDocument,
  getGeneratedDocument,
  getProjectDocuments,
  subscribeToProjectDocuments,
  subscribeToDocument,
  updateGeneratedDocument,
  updateDocumentSection,
  reorderDocumentSections,
  addDocumentSection,
  deleteDocumentSection,
  deleteGeneratedDocument,
  updateDocumentStatus,
  incrementDocumentVersion,
  subscribeToConversation,
  getConversationMessages,
  addConversationMessage,
  addCrossReference,
  removeCrossReference,
  recordDocumentExport,
  sendDocumentMessage,
  generateSectionContent,
  populateAllSections,
  searchKnowledgeBase,
  getKnowledgeForDocumentType,
  getDocumentTypeInfo,
  getAllDocumentTypes,
  getDocumentTokenUsage
}
