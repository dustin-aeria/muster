/**
 * userRoles.js
 * User roles and permissions management
 *
 * Defines role hierarchy, permissions, and helper functions
 * for role-based access control throughout the application.
 *
 * @location src/lib/userRoles.js
 */

/**
 * Available user roles in the system
 */
export const USER_ROLES = {
  owner: {
    id: 'owner',
    name: 'Owner',
    description: 'Full access to all features and settings',
    level: 100,
    color: 'bg-purple-100 text-purple-700',
    icon: 'Crown'
  },
  admin: {
    id: 'admin',
    name: 'Administrator',
    description: 'Manage users, settings, and all operational data',
    level: 90,
    color: 'bg-red-100 text-red-700',
    icon: 'Shield'
  },
  operations_manager: {
    id: 'operations_manager',
    name: 'Operations Manager',
    description: 'Manage projects, crew, and operational planning',
    level: 70,
    color: 'bg-blue-100 text-blue-700',
    icon: 'Briefcase'
  },
  safety_manager: {
    id: 'safety_manager',
    name: 'Safety Manager',
    description: 'Manage safety programs, incidents, and compliance',
    level: 70,
    color: 'bg-green-100 text-green-700',
    icon: 'ShieldCheck'
  },
  pilot_in_command: {
    id: 'pilot_in_command',
    name: 'Pilot in Command',
    description: 'Lead flight operations, approve flight plans',
    level: 60,
    color: 'bg-sky-100 text-sky-700',
    icon: 'Plane'
  },
  pilot: {
    id: 'pilot',
    name: 'Pilot',
    description: 'Conduct flight operations under supervision',
    level: 50,
    color: 'bg-cyan-100 text-cyan-700',
    icon: 'Navigation'
  },
  visual_observer: {
    id: 'visual_observer',
    name: 'Visual Observer',
    description: 'Support flight operations as VO',
    level: 40,
    color: 'bg-teal-100 text-teal-700',
    icon: 'Eye'
  },
  crew_member: {
    id: 'crew_member',
    name: 'Crew Member',
    description: 'General crew member with limited access',
    level: 30,
    color: 'bg-gray-100 text-gray-700',
    icon: 'User'
  },
  client: {
    id: 'client',
    name: 'Client',
    description: 'External client with view-only access to their projects',
    level: 10,
    color: 'bg-amber-100 text-amber-700',
    icon: 'Building'
  },
  viewer: {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to assigned content',
    level: 5,
    color: 'bg-slate-100 text-slate-700',
    icon: 'Eye'
  }
}

/**
 * Permission definitions
 */
export const PERMISSIONS = {
  // Project permissions
  'projects.view': { name: 'View Projects', category: 'Projects' },
  'projects.create': { name: 'Create Projects', category: 'Projects' },
  'projects.edit': { name: 'Edit Projects', category: 'Projects' },
  'projects.delete': { name: 'Delete Projects', category: 'Projects' },
  'projects.approve': { name: 'Approve Projects', category: 'Projects' },

  // Crew permissions
  'crew.view': { name: 'View Crew', category: 'Crew' },
  'crew.manage': { name: 'Manage Crew', category: 'Crew' },
  'crew.assign': { name: 'Assign Crew to Projects', category: 'Crew' },

  // Aircraft permissions
  'aircraft.view': { name: 'View Aircraft', category: 'Aircraft' },
  'aircraft.manage': { name: 'Manage Aircraft', category: 'Aircraft' },

  // Safety permissions
  'safety.view': { name: 'View Safety Data', category: 'Safety' },
  'safety.report_incident': { name: 'Report Incidents', category: 'Safety' },
  'safety.manage_incidents': { name: 'Manage Incidents', category: 'Safety' },
  'safety.manage_capas': { name: 'Manage CAPAs', category: 'Safety' },

  // Training permissions
  'training.view': { name: 'View Training Records', category: 'Training' },
  'training.manage': { name: 'Manage Training', category: 'Training' },
  'training.record_own': { name: 'Record Own Training', category: 'Training' },

  // Compliance permissions
  'compliance.view': { name: 'View Compliance', category: 'Compliance' },
  'compliance.manage': { name: 'Manage Compliance', category: 'Compliance' },

  // Policy permissions
  'policies.view': { name: 'View Policies', category: 'Policies' },
  'policies.manage': { name: 'Manage Policies', category: 'Policies' },
  'policies.acknowledge': { name: 'Acknowledge Policies', category: 'Policies' },

  // Settings permissions
  'settings.view': { name: 'View Settings', category: 'Settings' },
  'settings.manage': { name: 'Manage Settings', category: 'Settings' },
  'settings.users': { name: 'Manage Users', category: 'Settings' },

  // Reports permissions
  'reports.view': { name: 'View Reports', category: 'Reports' },
  'reports.export': { name: 'Export Reports', category: 'Reports' }
}

/**
 * Role-to-permission mapping
 */
export const ROLE_PERMISSIONS = {
  owner: Object.keys(PERMISSIONS), // All permissions

  admin: [
    'projects.view', 'projects.create', 'projects.edit', 'projects.delete', 'projects.approve',
    'crew.view', 'crew.manage', 'crew.assign',
    'aircraft.view', 'aircraft.manage',
    'safety.view', 'safety.report_incident', 'safety.manage_incidents', 'safety.manage_capas',
    'training.view', 'training.manage', 'training.record_own',
    'compliance.view', 'compliance.manage',
    'policies.view', 'policies.manage', 'policies.acknowledge',
    'settings.view', 'settings.manage', 'settings.users',
    'reports.view', 'reports.export'
  ],

  operations_manager: [
    'projects.view', 'projects.create', 'projects.edit', 'projects.approve',
    'crew.view', 'crew.assign',
    'aircraft.view',
    'safety.view', 'safety.report_incident',
    'training.view', 'training.record_own',
    'compliance.view',
    'policies.view', 'policies.acknowledge',
    'reports.view', 'reports.export'
  ],

  safety_manager: [
    'projects.view',
    'crew.view',
    'aircraft.view',
    'safety.view', 'safety.report_incident', 'safety.manage_incidents', 'safety.manage_capas',
    'training.view', 'training.manage', 'training.record_own',
    'compliance.view', 'compliance.manage',
    'policies.view', 'policies.manage', 'policies.acknowledge',
    'reports.view', 'reports.export'
  ],

  pilot_in_command: [
    'projects.view', 'projects.create', 'projects.edit',
    'crew.view', 'crew.assign',
    'aircraft.view',
    'safety.view', 'safety.report_incident',
    'training.view', 'training.record_own',
    'compliance.view',
    'policies.view', 'policies.acknowledge',
    'reports.view'
  ],

  pilot: [
    'projects.view', 'projects.edit',
    'crew.view',
    'aircraft.view',
    'safety.view', 'safety.report_incident',
    'training.view', 'training.record_own',
    'compliance.view',
    'policies.view', 'policies.acknowledge',
    'reports.view'
  ],

  visual_observer: [
    'projects.view',
    'crew.view',
    'safety.view', 'safety.report_incident',
    'training.view', 'training.record_own',
    'policies.view', 'policies.acknowledge'
  ],

  crew_member: [
    'projects.view',
    'crew.view',
    'safety.view', 'safety.report_incident',
    'training.view', 'training.record_own',
    'policies.view', 'policies.acknowledge'
  ],

  client: [
    'projects.view',
    'reports.view'
  ],

  viewer: [
    'projects.view',
    'policies.view'
  ]
}

/**
 * Check if a user has a specific permission
 * @param {Object} user - User object with role property
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export function hasPermission(user, permission) {
  if (!user?.role) return false

  const rolePermissions = ROLE_PERMISSIONS[user.role] || []
  return rolePermissions.includes(permission)
}

/**
 * Check if a user has any of the specified permissions
 * @param {Object} user - User object with role property
 * @param {string[]} permissions - Permissions to check
 * @returns {boolean}
 */
export function hasAnyPermission(user, permissions) {
  return permissions.some(p => hasPermission(user, p))
}

/**
 * Check if a user has all of the specified permissions
 * @param {Object} user - User object with role property
 * @param {string[]} permissions - Permissions to check
 * @returns {boolean}
 */
export function hasAllPermissions(user, permissions) {
  return permissions.every(p => hasPermission(user, p))
}

/**
 * Get all permissions for a role
 * @param {string} role - Role ID
 * @returns {string[]}
 */
export function getRolePermissions(role) {
  return ROLE_PERMISSIONS[role] || []
}

/**
 * Check if a user's role level is at least the specified level
 * @param {Object} user - User object with role property
 * @param {number} requiredLevel - Minimum level required
 * @returns {boolean}
 */
export function hasMinimumRoleLevel(user, requiredLevel) {
  if (!user?.role) return false

  const role = USER_ROLES[user.role]
  return role ? role.level >= requiredLevel : false
}

/**
 * Check if user can manage another user (based on role hierarchy)
 * @param {Object} manager - User attempting to manage
 * @param {Object} target - User being managed
 * @returns {boolean}
 */
export function canManageUser(manager, target) {
  if (!manager?.role || !target?.role) return false

  const managerRole = USER_ROLES[manager.role]
  const targetRole = USER_ROLES[target.role]

  if (!managerRole || !targetRole) return false

  // Must have higher level to manage
  return managerRole.level > targetRole.level
}

/**
 * Get roles a user can assign to others
 * @param {Object} user - User object with role property
 * @returns {Object[]}
 */
export function getAssignableRoles(user) {
  if (!user?.role) return []

  const userRole = USER_ROLES[user.role]
  if (!userRole) return []

  // Can only assign roles with lower level
  return Object.values(USER_ROLES)
    .filter(role => role.level < userRole.level)
    .sort((a, b) => b.level - a.level)
}

/**
 * Get role display info
 * @param {string} roleId - Role ID
 * @returns {Object|null}
 */
export function getRoleInfo(roleId) {
  return USER_ROLES[roleId] || null
}

/**
 * Get permissions grouped by category
 * @param {string[]} permissions - Array of permission IDs
 * @returns {Object}
 */
export function groupPermissionsByCategory(permissions) {
  const grouped = {}

  for (const permId of permissions) {
    const perm = PERMISSIONS[permId]
    if (!perm) continue

    const category = perm.category
    if (!grouped[category]) {
      grouped[category] = []
    }
    grouped[category].push({ id: permId, ...perm })
  }

  return grouped
}

/**
 * Default role for new users
 */
export const DEFAULT_ROLE = 'crew_member'

/**
 * Role options for select inputs
 */
export const ROLE_OPTIONS = Object.values(USER_ROLES)
  .sort((a, b) => b.level - a.level)
  .map(role => ({
    value: role.id,
    label: role.name,
    description: role.description
  }))
