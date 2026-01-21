/**
 * seedPolicies.js
 * One-time migration script to seed existing policies into Firestore
 *
 * Usage:
 * 1. Import this module in a component (e.g., Settings page)
 * 2. Call seedPolicies() to migrate all hardcoded policies to Firestore
 * 3. This should only be run ONCE per installation
 *
 * @location src/lib/seedPolicies.js
 */

import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'
import { POLICIES } from '../components/PolicyLibrary'
import { logger } from './logger'

/**
 * Check if policies have already been seeded
 * @returns {Promise<boolean>}
 */
export async function isPoliciesSeeded() {
  try {
    const policiesRef = collection(db, 'policies')
    const snapshot = await getDocs(policiesRef)
    return snapshot.size > 0
  } catch (error) {
    logger.error('Error checking if policies are seeded:', error)
    return false
  }
}

/**
 * Seed all hardcoded policies into Firestore
 * @param {function} onProgress - Progress callback (current, total)
 * @returns {Promise<{success: number, failed: number, errors: string[]}>}
 */
export async function seedPolicies(onProgress) {
  const results = {
    success: 0,
    failed: 0,
    errors: []
  }

  const policiesRef = collection(db, 'policies')
  const total = POLICIES.length

  for (let i = 0; i < POLICIES.length; i++) {
    const policy = POLICIES[i]

    if (onProgress) {
      onProgress(i + 1, total)
    }

    try {
      // Check if policy already exists (by number)
      const existingQuery = query(policiesRef, where('number', '==', policy.number))
      const existingSnapshot = await getDocs(existingQuery)

      if (existingSnapshot.size > 0) {
        logger.debug(`Policy ${policy.number} already exists, skipping...`)
        results.success++
        continue
      }

      // Create policy document
      await addDoc(policiesRef, {
        number: policy.number,
        title: policy.title,
        category: policy.category,
        description: policy.description,
        version: policy.version,
        effectiveDate: policy.effectiveDate,
        reviewDate: policy.reviewDate,
        owner: policy.owner,
        status: policy.status === 'due' || policy.status === 'overdue' ? 'active' : policy.status,
        keywords: policy.keywords || [],
        relatedPolicies: policy.relatedPolicies || [],
        regulatoryRefs: policy.regulatoryRefs || [],
        sections: policy.sections || [],
        attachments: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: 'system-migration'
      })

      results.success++
      logger.debug(`Seeded policy ${policy.number}: ${policy.title}`)
    } catch (error) {
      results.failed++
      results.errors.push(`${policy.number}: ${error.message}`)
      logger.error(`Failed to seed policy ${policy.number}:`, error)
    }
  }

  logger.info(`Seed complete: ${results.success} success, ${results.failed} failed`)
  return results
}

/**
 * Delete all policies from Firestore (use with caution!)
 * @returns {Promise<number>} Number of deleted policies
 */
export async function clearAllPolicies() {
  const policiesRef = collection(db, 'policies')
  const snapshot = await getDocs(policiesRef)

  let deleted = 0
  for (const doc of snapshot.docs) {
    await doc.ref.delete()
    deleted++
  }

  logger.info(`Deleted ${deleted} policies`)
  return deleted
}
