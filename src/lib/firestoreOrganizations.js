/**
 * firestoreOrganizations.js
 * Firebase Firestore data access layer for multi-tenancy
 *
 * Handles organizations and organization members (team management)
 *
 * @location src/lib/firestoreOrganizations.js
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from './firebase'

// Collection references
const organizationsRef = collection(db, 'organizations')
const organizationMembersRef = collection(db, 'organizationMembers')

// ============================================
// ROLE DEFINITIONS & PERMISSIONS
// ============================================

export const ORGANIZATION_ROLES = {
  admin: 'admin',
  management: 'management',
  operator: 'operator',
  viewer: 'viewer'
}

export const ROLE_HIERARCHY = ['admin', 'management', 'operator', 'viewer']

export const ROLE_PERMISSIONS = {
  admin: {
    viewData: true,
    createEdit: true,
    delete: true,
    approve: true,
    manageTeam: true,
    manageSettings: true,
    reportIncidents: true,
    recordOwnTraining: true
  },
  management: {
    viewData: true,
    createEdit: true,
    delete: true,
    approve: true,
    manageTeam: false,
    manageSettings: false,
    reportIncidents: true,
    recordOwnTraining: true
  },
  operator: {
    viewData: true,
    createEdit: true,
    delete: false,
    approve: false,
    manageTeam: false,
    manageSettings: false,
    reportIncidents: true,
    recordOwnTraining: true
  },
  viewer: {
    viewData: true,
    createEdit: false,
    delete: false,
    approve: false,
    manageTeam: false,
    manageSettings: false,
    reportIncidents: false,
    recordOwnTraining: false
  }
}

/**
 * Check if a role has a specific permission
 * @param {string} role - Role name
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export function hasPermission(role, permission) {
  if (!role || !ROLE_PERMISSIONS[role]) return false
  return ROLE_PERMISSIONS[role][permission] === true
}

/**
 * Check if roleA is higher or equal in hierarchy to roleB
 * @param {string} roleA - First role
 * @param {string} roleB - Second role
 * @returns {boolean}
 */
export function isRoleHigherOrEqual(roleA, roleB) {
  const indexA = ROLE_HIERARCHY.indexOf(roleA)
  const indexB = ROLE_HIERARCHY.indexOf(roleB)
  if (indexA === -1 || indexB === -1) return false
  return indexA <= indexB // Lower index = higher role
}

/**
 * Get the level/priority of a role (higher = more permissions)
 * @param {string} role - Role name
 * @returns {number}
 */
export function getRoleLevel(role) {
  const levels = { admin: 100, management: 70, operator: 40, viewer: 10 }
  return levels[role] || 0
}

/**
 * Check if a user can assign a specific role to another user
 * @param {string} assignerRole - Role of the user doing the assignment
 * @param {string} targetRole - Role being assigned
 * @returns {boolean}
 */
export function canAssignRole(assignerRole, targetRole) {
  if (!hasPermission(assignerRole, 'manageTeam')) return false
  const assignerLevel = getRoleLevel(assignerRole)
  const targetLevel = getRoleLevel(targetRole)
  return assignerLevel > targetLevel
}

// ============================================
// ORGANIZATION CRUD OPERATIONS
// ============================================

/**
 * Create a new organization
 * @param {Object} data - Organization data
 * @param {string} creatorId - User ID of the creator (will be made owner)
 * @returns {Promise<Object>} Created organization with ID
 */
export async function createOrganization(data, creatorId) {
  if (!data.name) {
    throw new Error('Organization name is required')
  }
  if (!creatorId) {
    throw new Error('Creator ID is required')
  }

  // Generate slug from name
  const slug = data.slug || generateSlug(data.name)

  const organization = {
    name: data.name,
    slug: slug,

    branding: {
      logoUrl: data.branding?.logoUrl || null,
      primaryColor: data.branding?.primaryColor || '#3B82F6'
    },

    settings: {
      timezone: data.settings?.timezone || 'America/New_York',
      dateFormat: data.settings?.dateFormat || 'MM/DD/YYYY',
      measurementSystem: data.settings?.measurementSystem || 'imperial'
    },

    subscription: {
      plan: data.subscription?.plan || 'starter',
      status: data.subscription?.status || 'trial',
      maxUsers: data.subscription?.maxUsers || 5
    },

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: creatorId
  }

  // Create organization
  const orgDocRef = await addDoc(organizationsRef, organization)

  // Create admin membership for creator (first user is always Admin)
  const membershipId = `${creatorId}_${orgDocRef.id}`
  const membership = {
    organizationId: orgDocRef.id,
    userId: creatorId,
    role: ORGANIZATION_ROLES.admin,
    status: 'active',
    invitedAt: null,
    invitedBy: null,
    acceptedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  await setDoc(doc(organizationMembersRef, membershipId), membership)

  return {
    id: orgDocRef.id,
    ...organization,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

/**
 * Get organization by ID
 * @param {string} orgId - Organization ID
 * @returns {Promise<Object|null>} Organization object or null
 */
export async function getOrganization(orgId) {
  if (!orgId) return null

  const docSnap = await getDoc(doc(organizationsRef, orgId))
  if (!docSnap.exists()) return null

  return {
    id: docSnap.id,
    ...docSnap.data()
  }
}

/**
 * Get organization by slug
 * @param {string} slug - Organization slug
 * @returns {Promise<Object|null>} Organization object or null
 */
export async function getOrganizationBySlug(slug) {
  if (!slug) return null

  const q = query(organizationsRef, where('slug', '==', slug))
  const snapshot = await getDocs(q)

  if (snapshot.empty) return null

  const doc = snapshot.docs[0]
  return {
    id: doc.id,
    ...doc.data()
  }
}

/**
 * Update organization
 * @param {string} orgId - Organization ID
 * @param {Object} data - Fields to update
 * @returns {Promise<void>}
 */
export async function updateOrganization(orgId, data) {
  if (!orgId) {
    throw new Error('Organization ID is required')
  }

  const updateData = {
    ...data,
    updatedAt: serverTimestamp()
  }

  // Don't allow updating certain fields
  delete updateData.id
  delete updateData.createdAt
  delete updateData.createdBy

  await updateDoc(doc(organizationsRef, orgId), updateData)
}

/**
 * Delete organization (soft delete by updating status)
 * @param {string} orgId - Organization ID
 * @returns {Promise<void>}
 */
export async function deleteOrganization(orgId) {
  if (!orgId) {
    throw new Error('Organization ID is required')
  }

  // Soft delete - mark as deleted rather than removing
  await updateDoc(doc(organizationsRef, orgId), {
    'subscription.status': 'deleted',
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
}

// ============================================
// ORGANIZATION MEMBER OPERATIONS
// ============================================

/**
 * Get all members of an organization
 * @param {string} orgId - Organization ID
 * @returns {Promise<Array>} Array of member objects
 */
export async function getOrganizationMembers(orgId) {
  if (!orgId) return []

  const q = query(
    organizationMembersRef,
    where('organizationId', '==', orgId),
    orderBy('createdAt', 'asc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

/**
 * Get all organization memberships for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of membership objects with organization data
 */
export async function getMembershipsByUser(userId) {
  if (!userId) return []

  const q = query(
    organizationMembersRef,
    where('userId', '==', userId),
    where('status', 'in', ['active', 'invited'])
  )

  const snapshot = await getDocs(q)
  const memberships = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))

  // Fetch organization data for each membership
  const membershipsWithOrgs = await Promise.all(
    memberships.map(async (membership) => {
      const org = await getOrganization(membership.organizationId)
      return {
        ...membership,
        organization: org
      }
    })
  )

  return membershipsWithOrgs
}

/**
 * Get a user's active membership for an organization
 * @param {string} userId - User ID
 * @param {string} orgId - Organization ID
 * @returns {Promise<Object|null>} Membership object or null
 */
export async function getMembership(userId, orgId) {
  if (!userId || !orgId) return null

  const membershipId = `${userId}_${orgId}`
  const docSnap = await getDoc(doc(organizationMembersRef, membershipId))

  if (!docSnap.exists()) return null

  return {
    id: docSnap.id,
    ...docSnap.data()
  }
}

/**
 * Invite a new member to an organization
 * @param {string} orgId - Organization ID
 * @param {string} email - Email of user to invite
 * @param {string} role - Role to assign
 * @param {string} invitedBy - User ID of person inviting
 * @param {string} userId - Optional: User ID if user already exists
 * @returns {Promise<Object>} Created membership object
 */
export async function inviteMember(orgId, email, role, invitedBy, userId = null) {
  if (!orgId) {
    throw new Error('Organization ID is required')
  }
  if (!email) {
    throw new Error('Email is required')
  }
  if (!role || !ORGANIZATION_ROLES[role]) {
    throw new Error('Valid role is required')
  }
  if (role === ORGANIZATION_ROLES.admin) {
    throw new Error('Cannot invite as admin. Promote an existing member instead.')
  }

  // Check organization exists and get member count
  const org = await getOrganization(orgId)
  if (!org) {
    throw new Error('Organization not found')
  }

  const currentMembers = await getOrganizationMembers(orgId)
  if (currentMembers.length >= org.subscription.maxUsers) {
    throw new Error(`Organization has reached maximum of ${org.subscription.maxUsers} members`)
  }

  // Check if user already has a membership
  if (userId) {
    const existingMembership = await getMembership(userId, orgId)
    if (existingMembership) {
      throw new Error('User is already a member of this organization')
    }
  }

  const membership = {
    organizationId: orgId,
    userId: userId, // Can be null for pending invites
    email: email.toLowerCase(),
    role: role,
    status: 'invited',
    invitedAt: serverTimestamp(),
    invitedBy: invitedBy,
    acceptedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  // Use composite ID if we have userId, otherwise generate one
  const membershipId = userId ? `${userId}_${orgId}` : `invite_${Date.now()}_${orgId}`
  await setDoc(doc(organizationMembersRef, membershipId), membership)

  return {
    id: membershipId,
    ...membership,
    invitedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

/**
 * Accept an invitation to join an organization
 * @param {string} memberId - Membership ID
 * @param {string} userId - User ID accepting the invite
 * @returns {Promise<void>}
 */
export async function acceptInvitation(memberId, userId) {
  if (!memberId || !userId) {
    throw new Error('Membership ID and User ID are required')
  }

  const docSnap = await getDoc(doc(organizationMembersRef, memberId))
  if (!docSnap.exists()) {
    throw new Error('Invitation not found')
  }

  const membership = docSnap.data()
  if (membership.status !== 'invited') {
    throw new Error('Invitation is no longer valid')
  }

  const batch = writeBatch(db)

  // Update the invitation with the user ID
  batch.update(doc(organizationMembersRef, memberId), {
    userId: userId,
    status: 'active',
    acceptedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })

  // If this was a pending invite (no userId), create proper document with composite key
  if (!membership.userId) {
    const newMembershipId = `${userId}_${membership.organizationId}`
    batch.set(doc(organizationMembersRef, newMembershipId), {
      ...membership,
      userId: userId,
      status: 'active',
      acceptedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    // Delete the old invite document
    batch.delete(doc(organizationMembersRef, memberId))
  }

  await batch.commit()
}

/**
 * Update a member's role
 * @param {string} memberId - Membership ID
 * @param {string} newRole - New role to assign
 * @param {string} updatedBy - User ID making the change
 * @returns {Promise<void>}
 */
export async function updateMemberRole(memberId, newRole, updatedBy) {
  if (!memberId) {
    throw new Error('Membership ID is required')
  }
  if (!newRole || !ORGANIZATION_ROLES[newRole]) {
    throw new Error('Valid role is required')
  }

  const docSnap = await getDoc(doc(organizationMembersRef, memberId))
  if (!docSnap.exists()) {
    throw new Error('Member not found')
  }

  const membership = docSnap.data()

  // Only admins can change roles, and they can't demote other admins
  if (membership.role === ORGANIZATION_ROLES.admin) {
    throw new Error('Cannot change admin role directly.')
  }

  await updateDoc(doc(organizationMembersRef, memberId), {
    role: newRole,
    updatedAt: serverTimestamp(),
    updatedBy: updatedBy
  })
}

/**
 * Update member details (job info, allowances, etc.)
 * @param {string} memberId - Membership ID
 * @param {Object} details - Details to update
 * @param {string} updatedBy - User ID making the change
 * @returns {Promise<void>}
 */
export async function updateMemberDetails(memberId, details, updatedBy) {
  if (!memberId) {
    throw new Error('Membership ID is required')
  }

  const docSnap = await getDoc(doc(organizationMembersRef, memberId))
  if (!docSnap.exists()) {
    throw new Error('Member not found')
  }

  // Allowed fields to update
  const allowedFields = [
    'jobTitle',
    'department',
    'employeeId',
    'startDate',
    'notes'
  ]

  // Filter to only allowed fields
  const updateData = {}
  for (const field of allowedFields) {
    if (details[field] !== undefined) {
      updateData[field] = details[field]
    }
  }

  if (Object.keys(updateData).length === 0) {
    throw new Error('No valid fields to update')
  }

  await updateDoc(doc(organizationMembersRef, memberId), {
    ...updateData,
    updatedAt: serverTimestamp(),
    updatedBy: updatedBy
  })
}

/**
 * Remove a member from an organization
 * @param {string} memberId - Membership ID
 * @returns {Promise<void>}
 */
export async function removeMember(memberId) {
  if (!memberId) {
    throw new Error('Membership ID is required')
  }

  const docSnap = await getDoc(doc(organizationMembersRef, memberId))
  if (!docSnap.exists()) {
    throw new Error('Member not found')
  }

  const membership = docSnap.data()

  // Cannot remove admin (they can only leave voluntarily or be demoted first)
  if (membership.role === ORGANIZATION_ROLES.admin) {
    throw new Error('Cannot remove organization admin directly.')
  }

  await deleteDoc(doc(organizationMembersRef, memberId))
}

/**
 * Suspend a member (soft removal)
 * @param {string} memberId - Membership ID
 * @returns {Promise<void>}
 */
export async function suspendMember(memberId) {
  if (!memberId) {
    throw new Error('Membership ID is required')
  }

  const docSnap = await getDoc(doc(organizationMembersRef, memberId))
  if (!docSnap.exists()) {
    throw new Error('Member not found')
  }

  const membership = docSnap.data()

  if (membership.role === ORGANIZATION_ROLES.admin) {
    throw new Error('Cannot suspend organization admin')
  }

  await updateDoc(doc(organizationMembersRef, memberId), {
    status: 'suspended',
    updatedAt: serverTimestamp()
  })
}

/**
 * Reactivate a suspended member
 * @param {string} memberId - Membership ID
 * @returns {Promise<void>}
 */
export async function reactivateMember(memberId) {
  if (!memberId) {
    throw new Error('Membership ID is required')
  }

  await updateDoc(doc(organizationMembersRef, memberId), {
    status: 'active',
    updatedAt: serverTimestamp()
  })
}

/**
 * Promote a member to admin role
 * @param {string} orgId - Organization ID
 * @param {string} adminId - Current admin's user ID (must be admin)
 * @param {string} targetUserId - User to promote to admin
 * @returns {Promise<void>}
 */
export async function promoteToAdmin(orgId, adminId, targetUserId) {
  if (!orgId || !adminId || !targetUserId) {
    throw new Error('Organization ID, admin ID, and target user ID are required')
  }

  const adminMembershipId = `${adminId}_${orgId}`
  const targetMembershipId = `${targetUserId}_${orgId}`

  // Verify current user is admin
  const adminDoc = await getDoc(doc(organizationMembersRef, adminMembershipId))
  if (!adminDoc.exists() || adminDoc.data().role !== ORGANIZATION_ROLES.admin) {
    throw new Error('Only admins can promote other members to admin')
  }

  // Verify target is a member
  const targetDoc = await getDoc(doc(organizationMembersRef, targetMembershipId))
  if (!targetDoc.exists()) {
    throw new Error('Target user must be an existing member of the organization')
  }

  // Promote to admin
  await updateDoc(doc(organizationMembersRef, targetMembershipId), {
    role: ORGANIZATION_ROLES.admin,
    updatedAt: serverTimestamp()
  })
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generate URL-friendly slug from name
 * @param {string} name - Organization name
 * @returns {string} Slug
 */
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50)
}

/**
 * Check if a slug is available
 * @param {string} slug - Slug to check
 * @param {string} excludeOrgId - Optional org ID to exclude (for updates)
 * @returns {Promise<boolean>} True if available
 */
export async function isSlugAvailable(slug, excludeOrgId = null) {
  const org = await getOrganizationBySlug(slug)
  if (!org) return true
  if (excludeOrgId && org.id === excludeOrgId) return true
  return false
}

/**
 * Get pending invitations by email
 * @param {string} email - Email to check
 * @returns {Promise<Array>} Array of pending invitations
 */
export async function getPendingInvitationsByEmail(email) {
  if (!email) return []

  const q = query(
    organizationMembersRef,
    where('email', '==', email.toLowerCase()),
    where('status', '==', 'invited')
  )

  const snapshot = await getDocs(q)
  const invitations = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))

  // Fetch organization data for each invitation
  const invitationsWithOrgs = await Promise.all(
    invitations.map(async (invitation) => {
      const org = await getOrganization(invitation.organizationId)
      return {
        ...invitation,
        organization: org
      }
    })
  )

  return invitationsWithOrgs
}

/**
 * Link pending invitations to a user after signup
 * @param {string} userId - User ID
 * @param {string} email - User's email
 * @returns {Promise<number>} Number of invitations linked
 */
export async function linkPendingInvitations(userId, email) {
  const invitations = await getPendingInvitationsByEmail(email)

  for (const invitation of invitations) {
    await acceptInvitation(invitation.id, userId)
  }

  return invitations.length
}

export default {
  // Roles & Permissions
  ORGANIZATION_ROLES,
  ROLE_HIERARCHY,
  ROLE_PERMISSIONS,
  hasPermission,
  isRoleHigherOrEqual,

  // Organization CRUD
  createOrganization,
  getOrganization,
  getOrganizationBySlug,
  updateOrganization,
  deleteOrganization,

  // Member operations
  getOrganizationMembers,
  getMembershipsByUser,
  getMembership,
  inviteMember,
  acceptInvitation,
  updateMemberRole,
  updateMemberDetails,
  removeMember,
  suspendMember,
  reactivateMember,
  promoteToAdmin,
  getRoleLevel,
  canAssignRole,

  // Utilities
  isSlugAvailable,
  getPendingInvitationsByEmail,
  linkPendingInvitations
}
