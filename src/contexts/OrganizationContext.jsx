/**
 * OrganizationContext.jsx
 * Organization context provider for multi-tenancy
 *
 * Provides organization state and membership info throughout the app.
 * Single organization per user - no org switching needed.
 *
 * @location src/contexts/OrganizationContext.jsx
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import {
  getMembershipsByUser,
  getOrganization,
  ROLE_PERMISSIONS,
  ROLE_HIERARCHY,
  ORGANIZATION_ROLES,
  linkPendingInvitations
} from '../lib/firestoreOrganizations'

// Role migration mapping (old role -> new role)
const ROLE_MIGRATION_MAP = {
  'owner': 'admin',
  'manager': 'management'
}

const OrganizationContext = createContext(null)

export function useOrganizationContext() {
  const context = useContext(OrganizationContext)
  if (!context) {
    throw new Error('useOrganizationContext must be used within an OrganizationProvider')
  }
  return context
}

export function OrganizationProvider({ children }) {
  const { user, userProfile, loading: authLoading } = useAuth()

  const [organization, setOrganization] = useState(null)
  const [membership, setMembership] = useState(null)
  const [memberships, setMemberships] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch user's organization memberships when user changes
  useEffect(() => {
    async function fetchOrganizationData() {
      if (authLoading) return

      if (!user) {
        setOrganization(null)
        setMembership(null)
        setMemberships([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        // First, link any pending invitations for this email
        if (user.email) {
          await linkPendingInvitations(user.uid, user.email)
        }

        // Get all memberships for this user
        const userMemberships = await getMembershipsByUser(user.uid)
        setMemberships(userMemberships)

        // Filter to active memberships only
        const activeMemberships = userMemberships.filter(
          m => m.status === 'active' && m.organization?.subscription?.status !== 'deleted'
        )

        if (activeMemberships.length > 0) {
          // Use the first active membership (single org per user for now)
          const primaryMembership = activeMemberships[0]
          setMembership(primaryMembership)
          setOrganization(primaryMembership.organization)
        } else {
          // No active organization - user needs to create one or be invited
          setOrganization(null)
          setMembership(null)
        }
      } catch (err) {
        console.error('Error fetching organization data:', err)
        setError(err.message || 'Failed to load organization data')
        setOrganization(null)
        setMembership(null)
      } finally {
        setLoading(false)
      }
    }

    fetchOrganizationData()
  }, [user, authLoading])

  // Automatic role migration: owner -> admin, manager -> management
  useEffect(() => {
    async function migrateRoleIfNeeded() {
      if (!membership?.role || !membership?.id) return

      const newRole = ROLE_MIGRATION_MAP[membership.role]
      if (!newRole) return // Role doesn't need migration

      console.log(`[RBAC Migration] Migrating role from "${membership.role}" to "${newRole}"`)

      try {
        const memberRef = doc(db, 'organizationMembers', membership.id)
        await updateDoc(memberRef, {
          role: newRole,
          previousRole: membership.role,
          roleMigratedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })

        // Update local state immediately
        setMembership(prev => prev ? { ...prev, role: newRole } : null)

        console.log(`[RBAC Migration] Successfully migrated to "${newRole}"`)
      } catch (err) {
        console.error('[RBAC Migration] Failed to migrate role:', err)
      }
    }

    migrateRoleIfNeeded()
  }, [membership?.role, membership?.id])

  /**
   * Check if current user has a specific permission
   * @param {string} permission - Permission name from ROLE_PERMISSIONS
   * @returns {boolean}
   */
  const hasPermission = useCallback((permission) => {
    if (!membership?.role) return false
    const rolePerms = ROLE_PERMISSIONS[membership.role]
    return rolePerms?.[permission] === true
  }, [membership?.role])

  /**
   * Check if current user has any of the specified roles
   * @param {string[]} roles - Array of role names
   * @returns {boolean}
   */
  const hasRole = useCallback((allowedRoles) => {
    if (!membership?.role) return false
    return allowedRoles.includes(membership.role)
  }, [membership?.role])

  /**
   * Check if user can manage another member (based on role hierarchy)
   * @param {string} targetRole - Role of the member to manage
   * @returns {boolean}
   */
  const canManageMember = useCallback((targetRole) => {
    if (!membership?.role) return false
    if (!hasPermission('manageTeam')) return false
    const myIndex = ROLE_HIERARCHY.indexOf(membership.role)
    const targetIndex = ROLE_HIERARCHY.indexOf(targetRole)
    if (myIndex === -1 || targetIndex === -1) return false
    return myIndex < targetIndex // Can only manage lower roles
  }, [membership?.role, hasPermission])

  /**
   * Refresh organization data
   */
  const refreshOrganization = useCallback(async () => {
    if (!organization?.id) return

    try {
      const updatedOrg = await getOrganization(organization.id)
      setOrganization(updatedOrg)
    } catch (err) {
      console.error('Error refreshing organization:', err)
    }
  }, [organization?.id])

  /**
   * Refresh all membership data
   */
  const refreshMemberships = useCallback(async () => {
    if (!user?.uid) return

    try {
      const userMemberships = await getMembershipsByUser(user.uid)
      setMemberships(userMemberships)

      const activeMemberships = userMemberships.filter(
        m => m.status === 'active' && m.organization?.subscription?.status !== 'deleted'
      )

      if (activeMemberships.length > 0) {
        const primaryMembership = activeMemberships[0]
        setMembership(primaryMembership)
        setOrganization(primaryMembership.organization)
      }
    } catch (err) {
      console.error('Error refreshing memberships:', err)
    }
  }, [user?.uid])

  /**
   * Set the current organization (for future multi-org support)
   */
  const setCurrentOrganization = useCallback(async (orgId) => {
    const targetMembership = memberships.find(m => m.organizationId === orgId)
    if (targetMembership) {
      setMembership(targetMembership)
      setOrganization(targetMembership.organization)
    }
  }, [memberships])

  const value = {
    // Core state
    organization,
    membership,
    memberships,
    organizationId: organization?.id || null,
    loading: loading || authLoading,
    error,

    // Permission helpers
    hasPermission,
    hasRole,
    canManageMember,

    // Role constants
    ROLES: ORGANIZATION_ROLES,
    PERMISSIONS: ROLE_PERMISSIONS,

    // Actions
    refreshOrganization,
    refreshMemberships,
    setCurrentOrganization,

    // Convenience flags - computed from actual role permissions
    isAdmin: membership?.role === 'admin',
    isManagement: membership?.role === 'admin' || membership?.role === 'management',
    canEdit: hasPermission('createEdit'),
    canDelete: hasPermission('delete'),
    canApprove: hasPermission('approve'),
    canManageTeam: hasPermission('manageTeam'),
    canManageSettings: hasPermission('manageSettings'),
    canReportIncidents: hasPermission('reportIncidents'),
    hasOrganization: !!organization
  }

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  )
}

export default OrganizationContext
