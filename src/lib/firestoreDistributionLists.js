/**
 * Muster - Distribution Lists Service
 * Firestore functions for team notification distribution lists
 *
 * Phase 1: Team Notifications Feature
 * @version 1.0.0
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

// ============================================
// COLLECTION REFERENCE
// ============================================

const distributionListsRef = collection(db, 'distributionLists')

// ============================================
// CONSTANTS
// ============================================

export const DEFAULT_LIST_TYPES = {
  pilots: { label: 'Pilots', description: 'All pilots and crew members', icon: 'Plane' },
  safety: { label: 'Safety Team', description: 'Safety officers and managers', icon: 'Shield' },
  ground: { label: 'Ground Crew', description: 'Ground support personnel', icon: 'Users' },
  clients: { label: 'Clients', description: 'Client representatives', icon: 'Briefcase' },
  custom: { label: 'Custom', description: 'Custom distribution list', icon: 'List' }
}

export const NOTIFICATION_CHANNELS = {
  inApp: { label: 'In-App', description: 'Notification in the app', icon: 'Bell' },
  email: { label: 'Email', description: 'Email notification', icon: 'Mail', requiresSetup: true },
  sms: { label: 'SMS', description: 'Text message', icon: 'MessageSquare', requiresSetup: true }
}

export const MEMBER_TYPES = {
  operator: { label: 'Operator', description: 'Existing system operator' },
  external: { label: 'External', description: 'External contact (email/phone only)' }
}

// ============================================
// DEFAULT STRUCTURES
// ============================================

/**
 * Get default distribution list structure
 */
export const getDefaultDistributionListStructure = () => ({
  organizationId: '', // Required for Firestore security rules
  projectId: '',
  name: '',
  type: 'custom',
  description: '',
  members: [],
  createdAt: null,
  updatedAt: null
})

/**
 * Get default member structure
 */
export const getDefaultMemberStructure = () => ({
  type: 'operator', // 'operator' | 'external'
  organizationId: null, // If type === 'operator'
  name: '',
  email: '',
  phone: '',
  channels: ['inApp'] // Default to in-app notifications
})

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Get all distribution lists for a project
 * Note: organizationId is required for Firestore security rules to work with list queries
 */
export async function getDistributionLists(projectId, organizationId) {
  if (!organizationId) {
    throw new Error('organizationId is required to query distribution lists')
  }

  const q = query(
    distributionListsRef,
    where('organizationId', '==', organizationId),
    where('projectId', '==', projectId),
    orderBy('name', 'asc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Get a single distribution list by ID
 */
export async function getDistributionList(id) {
  const docRef = doc(db, 'distributionLists', id)
  const snapshot = await getDoc(docRef)

  if (!snapshot.exists()) {
    throw new Error('Distribution list not found')
  }

  return { id: snapshot.id, ...snapshot.data() }
}

/**
 * Create a new distribution list
 */
export async function createDistributionList(data) {
  if (!data.organizationId) {
    throw new Error('organizationId is required to create a distribution list')
  }
  if (!data.projectId) {
    throw new Error('projectId is required to create a distribution list')
  }

  const list = {
    ...getDefaultDistributionListStructure(),
    ...data,
    members: (data.members || []).map(member => ({
      ...getDefaultMemberStructure(),
      ...member
    })),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  const docRef = await addDoc(distributionListsRef, list)
  return { id: docRef.id, ...list }
}

/**
 * Update a distribution list
 */
export async function updateDistributionList(id, data) {
  const docRef = doc(db, 'distributionLists', id)

  // Get existing doc to preserve organizationId (required for security rules)
  const existing = await getDoc(docRef)
  if (!existing.exists()) {
    throw new Error('Distribution list not found')
  }

  const updateData = {
    ...data,
    // Preserve organizationId and projectId (security rules require these)
    organizationId: existing.data().organizationId,
    projectId: existing.data().projectId,
    updatedAt: serverTimestamp()
  }

  // If members are being updated, ensure they have default structure
  if (data.members) {
    updateData.members = data.members.map(member => ({
      ...getDefaultMemberStructure(),
      ...member
    }))
  }

  await updateDoc(docRef, updateData)
}

/**
 * Delete a distribution list
 */
export async function deleteDistributionList(id) {
  const docRef = doc(db, 'distributionLists', id)
  await deleteDoc(docRef)
}

// ============================================
// MEMBER OPERATIONS
// ============================================

/**
 * Add a member to a distribution list
 */
export async function addMemberToList(listId, member) {
  const list = await getDistributionList(listId)

  const newMember = {
    ...getDefaultMemberStructure(),
    ...member
  }

  // Check for duplicates
  const isDuplicate = list.members.some(m =>
    (m.organizationId && m.organizationId === newMember.organizationId) ||
    (m.email && m.email === newMember.email)
  )

  if (isDuplicate) {
    throw new Error('Member already exists in this list')
  }

  await updateDistributionList(listId, {
    members: [...list.members, newMember]
  })

  return newMember
}

/**
 * Remove a member from a distribution list
 */
export async function removeMemberFromList(listId, memberIdentifier) {
  const list = await getDistributionList(listId)

  const updatedMembers = list.members.filter(m =>
    m.organizationId !== memberIdentifier && m.email !== memberIdentifier
  )

  await updateDistributionList(listId, {
    members: updatedMembers
  })
}

/**
 * Update a member's channels in a distribution list
 */
export async function updateMemberChannels(listId, memberIdentifier, channels) {
  const list = await getDistributionList(listId)

  const updatedMembers = list.members.map(m => {
    if (m.organizationId === memberIdentifier || m.email === memberIdentifier) {
      return { ...m, channels }
    }
    return m
  })

  await updateDistributionList(listId, {
    members: updatedMembers
  })
}

// ============================================
// BATCH OPERATIONS
// ============================================

/**
 * Create default distribution lists for a project
 */
export async function createDefaultListsForProject(projectId, organizationId, projectCrew = []) {
  if (!organizationId) {
    throw new Error('organizationId is required to create distribution lists')
  }
  if (!projectId) {
    throw new Error('projectId is required to create distribution lists')
  }

  const batch = writeBatch(db)
  const createdLists = []

  // Create Pilots list with assigned PIC/crew
  const pilotsRef = doc(distributionListsRef)
  const pilotMembers = projectCrew
    .filter(c => ['PIC', 'Remote Pilot', 'VO'].includes(c.role))
    .map(c => ({
      type: 'operator',
      organizationId: c.organizationId,
      name: c.operatorName || c.name,
      email: c.email || '',
      phone: c.phone || '',
      channels: ['inApp']
    }))

  batch.set(pilotsRef, {
    organizationId,
    projectId,
    name: 'Pilots',
    type: 'pilots',
    description: 'Pilots and flight crew',
    members: pilotMembers,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
  createdLists.push({ id: pilotsRef.id, name: 'Pilots' })

  // Create Safety Team list
  const safetyRef = doc(distributionListsRef)
  batch.set(safetyRef, {
    organizationId,
    projectId,
    name: 'Safety Team',
    type: 'safety',
    description: 'Safety officers and supervisors',
    members: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
  createdLists.push({ id: safetyRef.id, name: 'Safety Team' })

  // Create Ground Crew list
  const groundRef = doc(distributionListsRef)
  const groundMembers = projectCrew
    .filter(c => ['Ground Support', 'Spotter', 'Site Supervisor'].includes(c.role))
    .map(c => ({
      type: 'operator',
      organizationId: c.organizationId,
      name: c.operatorName || c.name,
      email: c.email || '',
      phone: c.phone || '',
      channels: ['inApp']
    }))

  batch.set(groundRef, {
    organizationId,
    projectId,
    name: 'Ground Crew',
    type: 'ground',
    description: 'Ground support and spotters',
    members: groundMembers,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
  createdLists.push({ id: groundRef.id, name: 'Ground Crew' })

  // Create Clients list (empty by default)
  const clientsRef = doc(distributionListsRef)
  batch.set(clientsRef, {
    organizationId,
    projectId,
    name: 'Clients',
    type: 'clients',
    description: 'Client representatives and stakeholders',
    members: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
  createdLists.push({ id: clientsRef.id, name: 'Clients' })

  await batch.commit()
  return createdLists
}

/**
 * Delete all distribution lists for a project
 */
export async function deleteAllListsForProject(projectId, organizationId) {
  if (!organizationId) {
    throw new Error('organizationId is required to delete distribution lists')
  }

  const lists = await getDistributionLists(projectId, organizationId)
  const batch = writeBatch(db)

  lists.forEach(list => {
    const docRef = doc(db, 'distributionLists', list.id)
    batch.delete(docRef)
  })

  await batch.commit()
}

// ============================================
// QUERY HELPERS
// ============================================

/**
 * Get all members across all lists for a project (de-duplicated)
 */
export async function getAllProjectMembers(projectId, organizationId) {
  if (!organizationId) {
    throw new Error('organizationId is required to get project members')
  }

  const lists = await getDistributionLists(projectId, organizationId)
  const memberMap = new Map()

  lists.forEach(list => {
    list.members.forEach(member => {
      const key = member.organizationId || member.email
      if (key && !memberMap.has(key)) {
        memberMap.set(key, {
          ...member,
          lists: [list.name]
        })
      } else if (key) {
        const existing = memberMap.get(key)
        existing.lists.push(list.name)
      }
    })
  })

  return Array.from(memberMap.values())
}

/**
 * Find lists containing a specific member
 */
export async function getListsContainingMember(projectId, organizationId, memberIdentifier) {
  if (!organizationId) {
    throw new Error('organizationId is required to find lists')
  }

  const lists = await getDistributionLists(projectId, organizationId)

  return lists.filter(list =>
    list.members.some(m =>
      m.organizationId === memberIdentifier || m.email === memberIdentifier
    )
  )
}

/**
 * Get members by channel preference
 */
export async function getMembersByChannel(projectId, organizationId, channel) {
  if (!organizationId) {
    throw new Error('organizationId is required to get members by channel')
  }

  const allMembers = await getAllProjectMembers(projectId, organizationId)
  return allMembers.filter(member => member.channels.includes(channel))
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate member data
 */
export function validateMember(member) {
  const errors = []

  if (!member.name || member.name.trim() === '') {
    errors.push('Name is required')
  }

  if (member.type === 'operator' && !member.organizationId) {
    errors.push('Organization ID is required for operator members')
  }

  if (member.type === 'external') {
    if (!member.email && !member.phone) {
      errors.push('External contacts must have at least email or phone')
    }

    // External contacts can't receive in-app notifications
    if (member.channels.includes('inApp') && member.channels.length === 1) {
      errors.push('External contacts cannot receive in-app only notifications')
    }
  }

  if (member.email && !isValidEmail(member.email)) {
    errors.push('Invalid email format')
  }

  if (member.phone && !isValidPhone(member.phone)) {
    errors.push('Invalid phone format')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validate distribution list data
 */
export function validateDistributionList(list) {
  const errors = []

  if (!list.name || list.name.trim() === '') {
    errors.push('List name is required')
  }

  if (!list.projectId) {
    errors.push('Project ID is required')
  }

  // Validate all members
  if (list.members && list.members.length > 0) {
    list.members.forEach((member, index) => {
      const memberValidation = validateMember(member)
      if (!memberValidation.valid) {
        errors.push(`Member ${index + 1}: ${memberValidation.errors.join(', ')}`)
      }
    })
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// Email validation helper
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Phone validation helper (basic)
function isValidPhone(phone) {
  // Allow various formats: +1234567890, (123) 456-7890, 123-456-7890, etc.
  const phoneRegex = /^[\d\s\-\+\(\)]+$/
  return phone.length >= 10 && phoneRegex.test(phone)
}

// ============================================
// EXPORT DEFAULT
// ============================================

export default {
  // Constants
  DEFAULT_LIST_TYPES,
  NOTIFICATION_CHANNELS,
  MEMBER_TYPES,

  // Structures
  getDefaultDistributionListStructure,
  getDefaultMemberStructure,

  // CRUD
  getDistributionLists,
  getDistributionList,
  createDistributionList,
  updateDistributionList,
  deleteDistributionList,

  // Member Operations
  addMemberToList,
  removeMemberFromList,
  updateMemberChannels,

  // Batch Operations
  createDefaultListsForProject,
  deleteAllListsForProject,

  // Query Helpers
  getAllProjectMembers,
  getListsContainingMember,
  getMembersByChannel,

  // Validation
  validateMember,
  validateDistributionList
}
