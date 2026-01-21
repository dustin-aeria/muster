/**
 * usePolicyPermissions.js
 * Hook for checking policy-related permissions based on user role
 *
 * @location src/hooks/usePolicyPermissions.js
 */

import { useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  canViewPolicy,
  canEditPolicy,
  canApprovePolicy,
  canManageCategories,
  canManageDefaults
} from '../lib/firestorePolicies'
import { isPlatformAdmin as checkPlatformAdmin } from '../lib/firestoreMasterPolicies'

/**
 * Permission levels for quick reference
 */
export const PERMISSION_LEVELS = {
  VIEWER: 'viewer',
  EDITOR: 'editor',
  APPROVER: 'approver',
  ADMIN: 'admin',
  PLATFORM_ADMIN: 'platformAdmin'
}

/**
 * Default permission configuration by role
 */
export const DEFAULT_ROLE_PERMISSIONS = {
  admin: {
    canViewAll: true,
    canEdit: true,
    canApprove: true,
    canManageCategories: true,
    canManageDefaults: true
  },
  manager: {
    canViewAll: true,
    canEdit: true,
    canApprove: true,
    canManageCategories: false,
    canManageDefaults: false
  },
  editor: {
    canViewAll: true,
    canEdit: true,
    canApprove: false,
    canManageCategories: false,
    canManageDefaults: false
  },
  operator: {
    canViewAll: true,
    canEdit: false,
    canApprove: false,
    canManageCategories: false,
    canManageDefaults: false
  },
  viewer: {
    canViewAll: false,
    canEdit: false,
    canApprove: false,
    canManageCategories: false,
    canManageDefaults: false
  }
}

/**
 * Hook to get policy permissions for the current user
 * @param {Object} policy - Optional specific policy to check against
 * @returns {Object} Permission flags and helper functions
 */
export function usePolicyPermissions(policy = null) {
  const { user, userProfile } = useAuth()

  const permissions = useMemo(() => {
    // Default permissions for unauthenticated users
    if (!user) {
      return {
        canView: false,
        canEdit: false,
        canApprove: false,
        canDelete: false,
        canManageCategories: false,
        canManageDefaults: false,
        canAcknowledge: false,
        canViewAcknowledgments: false,
        canManageAcknowledgments: false,
        canViewVersions: false,
        canRollback: false,
        permissionLevel: null,
        isAdmin: false,
        isPlatformAdmin: false,
        canManageMasterPolicies: false
      }
    }

    // Get user's role and policy-specific permissions
    const role = userProfile?.role || 'viewer'
    const policyPermissions = userProfile?.policyPermissions || DEFAULT_ROLE_PERMISSIONS[role] || DEFAULT_ROLE_PERMISSIONS.viewer
    const isAdmin = role === 'admin'
    const isPlatformAdmin = checkPlatformAdmin(userProfile)

    // Build user object for permission checks
    const userForCheck = {
      id: user.uid,
      role,
      policyPermissions
    }

    // Calculate permissions
    let canView = true
    let canEdit = isAdmin || policyPermissions.canEdit
    let canApprove = isAdmin || policyPermissions.canApprove

    // If a specific policy is provided, check its permissions
    if (policy) {
      canView = canViewPolicy(policy, userForCheck)
      canEdit = canEditPolicy(policy, userForCheck)
      canApprove = canApprovePolicy(policy, userForCheck)
    }

    // Determine permission level
    let permissionLevel = PERMISSION_LEVELS.VIEWER
    if (isPlatformAdmin) {
      permissionLevel = PERMISSION_LEVELS.PLATFORM_ADMIN
    } else if (isAdmin) {
      permissionLevel = PERMISSION_LEVELS.ADMIN
    } else if (canApprove) {
      permissionLevel = PERMISSION_LEVELS.APPROVER
    } else if (canEdit) {
      permissionLevel = PERMISSION_LEVELS.EDITOR
    }

    return {
      // Policy-specific permissions
      canView,
      canEdit,
      canApprove,
      canDelete: canEdit && (isAdmin || policy?.status === 'draft'),

      // Category and template management
      canManageCategories: canManageCategories(userForCheck),
      canManageDefaults: canManageDefaults(userForCheck),

      // Acknowledgment permissions
      canAcknowledge: canView && user,
      canViewAcknowledgments: canEdit || isAdmin,
      canManageAcknowledgments: isAdmin,

      // Version management
      canViewVersions: canView,
      canRollback: canEdit && (isAdmin || canApprove),

      // Workflow permissions
      canSubmitForReview: canEdit && policy?.status === 'draft',
      canSubmitForApproval: canEdit && policy?.status === 'pending_review',
      canPublish: canApprove && policy?.status === 'pending_approval',
      canRetire: canApprove && policy?.status === 'active',

      // Meta
      permissionLevel,
      isAdmin,
      isPlatformAdmin,
      canManageMasterPolicies: isPlatformAdmin,
      userRole: role
    }
  }, [user, userProfile, policy])

  return permissions
}

/**
 * Hook to check if user has pending policy acknowledgments
 * @returns {Object} { hasPending, count, loading }
 */
export function usePendingAcknowledgments() {
  const { user, userProfile } = useAuth()

  // This would typically fetch from Firestore
  // For now, return structure that can be enhanced
  return useMemo(() => {
    if (!user) {
      return { hasPending: false, count: 0, loading: false, policies: [] }
    }

    const pendingPolicies = userProfile?.pendingAcknowledgments || []

    return {
      hasPending: pendingPolicies.length > 0,
      count: pendingPolicies.length,
      loading: false,
      policies: pendingPolicies
    }
  }, [user, userProfile])
}

/**
 * Check if user can perform a specific action on a policy
 * Useful for conditional rendering
 * @param {string} action - Action name (view, edit, approve, delete, etc.)
 * @param {Object} policy - Policy object
 * @returns {boolean}
 */
export function useCanPerformAction(action, policy) {
  const permissions = usePolicyPermissions(policy)

  return useMemo(() => {
    switch (action) {
      case 'view':
        return permissions.canView
      case 'edit':
        return permissions.canEdit
      case 'approve':
        return permissions.canApprove
      case 'delete':
        return permissions.canDelete
      case 'acknowledge':
        return permissions.canAcknowledge
      case 'rollback':
        return permissions.canRollback
      case 'submit_review':
        return permissions.canSubmitForReview
      case 'submit_approval':
        return permissions.canSubmitForApproval
      case 'publish':
        return permissions.canPublish
      case 'retire':
        return permissions.canRetire
      default:
        return false
    }
  }, [action, permissions])
}

export default usePolicyPermissions
