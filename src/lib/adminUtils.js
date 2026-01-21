/**
 * adminUtils.js
 * Utility functions for admin operations
 *
 * Usage: Import and call from browser console or temporarily from a component
 *
 * @location src/lib/adminUtils.js
 */

import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from './firebase'
import { logger } from './logger'

/**
 * Make a user a platform admin
 * @param {string} userId - The user's Firebase UID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function makePlatformAdmin(userId) {
  try {
    const userRef = doc(db, 'operators', userId)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      return { success: false, error: 'User not found in operators collection' }
    }

    await updateDoc(userRef, {
      isPlatformAdmin: true,
      role: 'admin' // Also ensure they have admin role
    })

    logger.info(`User ${userId} is now a platform admin`)
    return { success: true }
  } catch (error) {
    logger.error('Error making user platform admin:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Remove platform admin status from a user
 * @param {string} userId - The user's Firebase UID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function removePlatformAdmin(userId) {
  try {
    const userRef = doc(db, 'operators', userId)
    await updateDoc(userRef, {
      isPlatformAdmin: false
    })

    logger.info(`User ${userId} is no longer a platform admin`)
    return { success: true }
  } catch (error) {
    logger.error('Error removing platform admin:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Make the current logged-in user a platform admin
 * Call this from browser console after importing
 * @param {Object} auth - Firebase auth instance
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function makeCurrentUserPlatformAdmin(auth) {
  const user = auth.currentUser
  if (!user) {
    return { success: false, error: 'No user logged in' }
  }
  return makePlatformAdmin(user.uid)
}

// SECURITY: Admin functions should only be called through authenticated admin UI
// Do NOT expose to window object in production
// Use the MasterPolicyAdmin page or Settings page for admin operations
