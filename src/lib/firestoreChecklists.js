/**
 * Firestore Checklists Service
 * Manage operational checklists for flights and projects
 *
 * UPDATED: All queries now require organizationId for Firestore security rules
 *
 * @location src/lib/firestoreChecklists.js
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
// CHECKLIST TYPES
// ============================================

export const CHECKLIST_TYPES = {
  pre_flight: { label: 'Pre-Flight', icon: 'ClipboardCheck', color: 'bg-blue-100 text-blue-700' },
  post_flight: { label: 'Post-Flight', icon: 'ClipboardList', color: 'bg-green-100 text-green-700' },
  maintenance: { label: 'Maintenance', icon: 'Wrench', color: 'bg-amber-100 text-amber-700' },
  site_survey: { label: 'Site Survey', icon: 'MapPin', color: 'bg-purple-100 text-purple-700' },
  safety: { label: 'Safety', icon: 'Shield', color: 'bg-red-100 text-red-700' },
  equipment: { label: 'Equipment', icon: 'Package', color: 'bg-indigo-100 text-indigo-700' },
  emergency: { label: 'Emergency', icon: 'AlertTriangle', color: 'bg-orange-100 text-orange-700' },
  custom: { label: 'Custom', icon: 'FileText', color: 'bg-gray-100 text-gray-700' }
}

// ============================================
// DEFAULT CHECKLIST TEMPLATES
// ============================================

export const DEFAULT_CHECKLISTS = {
  pre_flight: {
    name: 'Standard Pre-Flight Checklist',
    type: 'pre_flight',
    items: [
      { id: 'pf-1', text: 'Weather conditions verified', category: 'environment' },
      { id: 'pf-2', text: 'NOTAMs checked', category: 'regulatory' },
      { id: 'pf-3', text: 'Airspace authorization confirmed', category: 'regulatory' },
      { id: 'pf-4', text: 'Battery charged and tested', category: 'aircraft' },
      { id: 'pf-5', text: 'Propellers inspected', category: 'aircraft' },
      { id: 'pf-6', text: 'Camera/payload secured', category: 'payload' },
      { id: 'pf-7', text: 'GPS signal acquired', category: 'aircraft' },
      { id: 'pf-8', text: 'Remote controller paired', category: 'equipment' },
      { id: 'pf-9', text: 'Return-to-home altitude set', category: 'aircraft' },
      { id: 'pf-10', text: 'Flight plan reviewed', category: 'planning' },
      { id: 'pf-11', text: 'Crew briefing completed', category: 'planning' },
      { id: 'pf-12', text: 'Emergency procedures reviewed', category: 'safety' }
    ]
  },
  post_flight: {
    name: 'Standard Post-Flight Checklist',
    type: 'post_flight',
    items: [
      { id: 'po-1', text: 'Aircraft powered down', category: 'aircraft' },
      { id: 'po-2', text: 'Battery removed and stored', category: 'aircraft' },
      { id: 'po-3', text: 'Visual inspection completed', category: 'aircraft' },
      { id: 'po-4', text: 'Flight data downloaded', category: 'data' },
      { id: 'po-5', text: 'Any issues documented', category: 'maintenance' },
      { id: 'po-6', text: 'Flight log completed', category: 'documentation' },
      { id: 'po-7', text: 'Equipment secured', category: 'equipment' }
    ]
  },
  site_survey: {
    name: 'Site Survey Checklist',
    type: 'site_survey',
    items: [
      { id: 'ss-1', text: 'Access permission confirmed', category: 'access' },
      { id: 'ss-2', text: 'Takeoff/landing area identified', category: 'operations' },
      { id: 'ss-3', text: 'Obstacles surveyed', category: 'safety' },
      { id: 'ss-4', text: 'Emergency landing areas identified', category: 'safety' },
      { id: 'ss-5', text: 'Population density assessed', category: 'safety' },
      { id: 'ss-6', text: 'Nearby airports/heliports identified', category: 'airspace' },
      { id: 'ss-7', text: 'Communication coverage verified', category: 'equipment' },
      { id: 'ss-8', text: 'Site photographs taken', category: 'documentation' }
    ]
  },
  emergency: {
    name: 'Emergency Response Checklist',
    type: 'emergency',
    items: [
      { id: 'em-1', text: 'Initiate emergency landing if safe', category: 'immediate' },
      { id: 'em-2', text: 'Warn nearby personnel', category: 'immediate' },
      { id: 'em-3', text: 'Attempt manual control', category: 'control' },
      { id: 'em-4', text: 'Activate return-to-home', category: 'control' },
      { id: 'em-5', text: 'Contact ATC if required', category: 'communication' },
      { id: 'em-6', text: 'Document incident details', category: 'documentation' },
      { id: 'em-7', text: 'Secure aircraft and scene', category: 'post-incident' },
      { id: 'em-8', text: 'Report to appropriate authorities', category: 'post-incident' }
    ]
  }
}

// ============================================
// CHECKLIST TEMPLATES CRUD
// ============================================

/**
 * Create a checklist template
 */
export async function createChecklistTemplate(templateData) {
  requireOrgId(templateData.organizationId, 'create checklist template')

  const template = {
    organizationId: templateData.organizationId,
    name: templateData.name,
    description: templateData.description || '',
    type: templateData.type || 'custom',
    items: templateData.items || [],
    isDefault: templateData.isDefault || false,
    createdBy: templateData.createdBy,
    createdByName: templateData.createdByName,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  const docRef = await addDoc(collection(db, 'checklistTemplates'), template)
  return { id: docRef.id, ...template }
}

/**
 * Get checklist templates for an organization
 */
export async function getChecklistTemplates(organizationId, options = {}) {
  requireOrgId(organizationId, 'get checklist templates')

  const { type = null } = options

  const q = query(
    collection(db, 'checklistTemplates'),
    where('organizationId', '==', organizationId),
    orderBy('name', 'asc')
  )

  const snapshot = await getDocs(q)
  let templates = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.(),
    updatedAt: doc.data().updatedAt?.toDate?.()
  }))

  if (type) {
    templates = templates.filter(t => t.type === type)
  }

  return templates
}

/**
 * Update a checklist template
 */
export async function updateChecklistTemplate(templateId, updates) {
  const templateRef = doc(db, 'checklistTemplates', templateId)
  await updateDoc(templateRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })
}

/**
 * Delete a checklist template
 */
export async function deleteChecklistTemplate(templateId) {
  await deleteDoc(doc(db, 'checklistTemplates', templateId))
}

// ============================================
// CHECKLIST INSTANCES CRUD
// ============================================

/**
 * Create a checklist instance (filled out checklist)
 */
export async function createChecklistInstance(instanceData) {
  requireOrgId(instanceData.organizationId, 'create checklist instance')

  const instance = {
    organizationId: instanceData.organizationId,
    templateId: instanceData.templateId || null,
    templateName: instanceData.templateName || 'Custom Checklist',
    type: instanceData.type || 'custom',
    projectId: instanceData.projectId || null,
    projectName: instanceData.projectName || null,
    flightLogId: instanceData.flightLogId || null,
    aircraftId: instanceData.aircraftId || null,
    aircraftName: instanceData.aircraftName || null,
    items: instanceData.items.map(item => ({
      ...item,
      checked: item.checked || false,
      checkedAt: item.checked ? new Date() : null,
      notes: item.notes || ''
    })),
    status: 'in_progress', // in_progress, completed, abandoned
    completedAt: null,
    completedBy: null,
    completedByName: null,
    createdBy: instanceData.createdBy,
    createdByName: instanceData.createdByName,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  const docRef = await addDoc(collection(db, 'checklistInstances'), instance)
  return { id: docRef.id, ...instance }
}

/**
 * Get checklist instances for a project
 * @param {string} organizationId - Required for security rules
 * @param {string} projectId - Project ID
 */
export async function getProjectChecklists(organizationId, projectId) {
  requireOrgId(organizationId, 'get project checklists')

  const q = query(
    collection(db, 'checklistInstances'),
    where('organizationId', '==', organizationId),
    where('projectId', '==', projectId),
    orderBy('createdAt', 'desc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    completedAt: doc.data().completedAt?.toDate?.(),
    createdAt: doc.data().createdAt?.toDate?.(),
    updatedAt: doc.data().updatedAt?.toDate?.()
  }))
}

/**
 * Get checklist instances for a flight
 * @param {string} organizationId - Required for security rules
 * @param {string} flightLogId - Flight log ID
 */
export async function getFlightChecklists(organizationId, flightLogId) {
  requireOrgId(organizationId, 'get flight checklists')

  const q = query(
    collection(db, 'checklistInstances'),
    where('organizationId', '==', organizationId),
    where('flightLogId', '==', flightLogId),
    orderBy('createdAt', 'desc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    completedAt: doc.data().completedAt?.toDate?.(),
    createdAt: doc.data().createdAt?.toDate?.(),
    updatedAt: doc.data().updatedAt?.toDate?.()
  }))
}

/**
 * Get a single checklist instance
 */
export async function getChecklistInstance(instanceId) {
  const docRef = doc(db, 'checklistInstances', instanceId)
  const snapshot = await getDoc(docRef)

  if (!snapshot.exists()) {
    throw new Error('Checklist not found')
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
    completedAt: snapshot.data().completedAt?.toDate?.(),
    createdAt: snapshot.data().createdAt?.toDate?.(),
    updatedAt: snapshot.data().updatedAt?.toDate?.()
  }
}

/**
 * Update a checklist instance
 */
export async function updateChecklistInstance(instanceId, updates) {
  const instanceRef = doc(db, 'checklistInstances', instanceId)
  await updateDoc(instanceRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })
}

/**
 * Toggle a checklist item
 */
export async function toggleChecklistItem(instanceId, itemId, checked, userId, userName) {
  const instance = await getChecklistInstance(instanceId)
  const items = instance.items.map(item => {
    if (item.id === itemId) {
      return {
        ...item,
        checked,
        checkedAt: checked ? new Date() : null,
        checkedBy: checked ? userId : null,
        checkedByName: checked ? userName : null
      }
    }
    return item
  })

  await updateChecklistInstance(instanceId, { items })
  return items
}

/**
 * Add note to checklist item
 */
export async function addItemNote(instanceId, itemId, note) {
  const instance = await getChecklistInstance(instanceId)
  const items = instance.items.map(item => {
    if (item.id === itemId) {
      return { ...item, notes: note }
    }
    return item
  })

  await updateChecklistInstance(instanceId, { items })
}

/**
 * Complete a checklist
 */
export async function completeChecklist(instanceId, userId, userName) {
  await updateChecklistInstance(instanceId, {
    status: 'completed',
    completedAt: serverTimestamp(),
    completedBy: userId,
    completedByName: userName
  })
}

/**
 * Delete a checklist instance
 */
export async function deleteChecklistInstance(instanceId) {
  await deleteDoc(doc(db, 'checklistInstances', instanceId))
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get completion percentage
 */
export function getChecklistProgress(items) {
  if (!items || items.length === 0) return 0
  const checked = items.filter(item => item.checked).length
  return Math.round((checked / items.length) * 100)
}

/**
 * Check if checklist is complete
 */
export function isChecklistComplete(items) {
  if (!items || items.length === 0) return false
  return items.every(item => item.checked)
}

/**
 * Get unchecked items
 */
export function getUncheckedItems(items) {
  return items.filter(item => !item.checked)
}

export default {
  CHECKLIST_TYPES,
  DEFAULT_CHECKLISTS,
  createChecklistTemplate,
  getChecklistTemplates,
  updateChecklistTemplate,
  deleteChecklistTemplate,
  createChecklistInstance,
  getProjectChecklists,
  getFlightChecklists,
  getChecklistInstance,
  updateChecklistInstance,
  toggleChecklistItem,
  addItemNote,
  completeChecklist,
  deleteChecklistInstance,
  getChecklistProgress,
  isChecklistComplete,
  getUncheckedItems
}
