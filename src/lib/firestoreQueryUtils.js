/**
 * Firestore Query Utilities
 * Central utilities for building secure, organization-scoped Firestore queries
 *
 * WHY THIS EXISTS:
 * Firestore security rules check organizationId on documents. For LIST queries,
 * Firestore needs the query to filter by organizationId to validate access.
 * This utility ensures all queries include organizationId automatically.
 *
 * @location src/lib/firestoreQueryUtils.js
 */

import { query, where } from 'firebase/firestore'

/**
 * Create an organization-scoped query
 * Automatically prepends organizationId filter to ensure security rules pass
 *
 * @param {CollectionReference} collectionRef - Firestore collection reference
 * @param {string} organizationId - The organization ID to scope the query to
 * @param {...QueryConstraint} constraints - Additional query constraints (where, orderBy, limit, etc.)
 * @returns {Query} Firestore query with organizationId filter
 * @throws {Error} If organizationId is not provided
 *
 * @example
 * // Instead of:
 * const q = query(collection(db, 'comments'), where('entityId', '==', id), orderBy('createdAt'))
 *
 * // Use:
 * const q = orgQuery(collection(db, 'comments'), organizationId, where('entityId', '==', id), orderBy('createdAt'))
 */
export function orgQuery(collectionRef, organizationId, ...constraints) {
  if (!organizationId) {
    throw new Error(`organizationId is required for querying ${collectionRef.path}. This is needed for Firestore security rules.`)
  }

  return query(
    collectionRef,
    where('organizationId', '==', organizationId),
    ...constraints
  )
}

/**
 * Validate that organizationId is present for document creation
 * Call this at the start of any create function
 *
 * @param {string} organizationId - The organization ID
 * @param {string} operation - Description of the operation (for error message)
 * @throws {Error} If organizationId is not provided
 *
 * @example
 * export async function createComment(data) {
 *   requireOrgId(data.organizationId, 'create comment')
 *   // ... rest of function
 * }
 */
export function requireOrgId(organizationId, operation = 'perform this operation') {
  if (!organizationId) {
    throw new Error(`organizationId is required to ${operation}. This is needed for Firestore security rules.`)
  }
}

/**
 * Ensure document data includes organizationId
 * Returns the data with organizationId guaranteed to be present
 *
 * @param {Object} data - Document data
 * @param {string} organizationId - The organization ID to ensure is present
 * @param {string} operation - Description of the operation (for error message)
 * @returns {Object} Data with organizationId included
 * @throws {Error} If neither data.organizationId nor organizationId parameter is provided
 *
 * @example
 * const docData = ensureOrgId(data, explicitOrgId, 'create attachment')
 */
export function ensureOrgId(data, organizationId, operation = 'perform this operation') {
  const orgId = data?.organizationId || organizationId

  if (!orgId) {
    throw new Error(`organizationId is required to ${operation}. Pass it in the data object or as a parameter.`)
  }

  return {
    ...data,
    organizationId: orgId
  }
}

/**
 * Build query constraints array with organizationId first
 * Useful for dynamic query building
 *
 * @param {string} organizationId - The organization ID
 * @param {Array<QueryConstraint>} additionalConstraints - Other constraints to add
 * @returns {Array<QueryConstraint>} Array of constraints with orgId filter first
 *
 * @example
 * const constraints = buildOrgConstraints(organizationId, [
 *   where('status', '==', 'active'),
 *   orderBy('createdAt', 'desc')
 * ])
 * const q = query(collectionRef, ...constraints)
 */
export function buildOrgConstraints(organizationId, additionalConstraints = []) {
  requireOrgId(organizationId, 'build query constraints')

  return [
    where('organizationId', '==', organizationId),
    ...additionalConstraints
  ]
}

export default {
  orgQuery,
  requireOrgId,
  ensureOrgId,
  buildOrgConstraints
}
