/**
 * User Preferences Service
 * Store and retrieve user-specific settings
 *
 * @location src/lib/userPreferences.js
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'
import { logger } from './logger'

// Default preferences
const DEFAULT_PREFERENCES = {
  // Dashboard settings
  dashboard: {
    defaultView: 'overview',
    showQuickStats: true,
    showRecentProjects: true,
    showUpcomingEvents: true,
    showActivityFeed: true
  },
  // Project settings
  projects: {
    defaultView: 'grid', // grid | list | board
    defaultSort: 'updatedAt',
    defaultFilter: 'active',
    showArchived: false
  },
  // Equipment settings
  equipment: {
    defaultView: 'grid',
    showRetired: false,
    groupByCategory: true
  },
  // Calendar settings
  calendar: {
    defaultView: 'month', // month | week | day
    showWeekends: true,
    startOfWeek: 0, // 0 = Sunday, 1 = Monday
    showProjectEvents: true,
    showTrainingEvents: true,
    showMaintenanceEvents: true,
    showInspectionEvents: true
  },
  // Notification settings
  notifications: {
    emailNotifications: true,
    pushNotifications: false,
    notifyOnMention: true,
    notifyOnAssignment: true,
    notifyOnDeadline: true,
    notifyOnProjectUpdate: true,
    notifyOnIncident: true,
    deadlineReminderDays: 7,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00'
  },
  // Appearance settings
  appearance: {
    theme: 'system', // light | dark | system
    sidebarCollapsed: false,
    compactMode: false,
    fontSize: 'medium' // small | medium | large
  },
  // Accessibility settings
  accessibility: {
    reduceMotion: false,
    highContrast: false,
    screenReaderMode: false
  },
  // Regional settings
  regional: {
    dateFormat: 'MMM d, yyyy',
    timeFormat: '12h', // 12h | 24h
    timezone: 'auto',
    currency: 'USD',
    measurementUnit: 'metric' // metric | imperial
  }
}

// ============================================
// PREFERENCES CRUD
// ============================================

/**
 * Get user preferences
 */
export async function getUserPreferences(userId) {
  try {
    const docRef = doc(db, 'userPreferences', userId)
    const snapshot = await getDoc(docRef)

    if (snapshot.exists()) {
      // Merge with defaults to ensure all keys exist
      return deepMerge(DEFAULT_PREFERENCES, snapshot.data().preferences || {})
    }

    return { ...DEFAULT_PREFERENCES }
  } catch (err) {
    logger.error('Error getting user preferences:', err)
    return { ...DEFAULT_PREFERENCES }
  }
}

/**
 * Set user preferences (full replace)
 */
export async function setUserPreferences(userId, preferences) {
  try {
    const docRef = doc(db, 'userPreferences', userId)
    await setDoc(docRef, {
      preferences,
      updatedAt: serverTimestamp()
    })
  } catch (err) {
    logger.error('Error setting user preferences:', err)
    throw err
  }
}

/**
 * Update specific preference(s)
 */
export async function updateUserPreferences(userId, updates) {
  try {
    const docRef = doc(db, 'userPreferences', userId)
    const snapshot = await getDoc(docRef)

    if (snapshot.exists()) {
      const currentPrefs = snapshot.data().preferences || {}
      const newPrefs = deepMerge(currentPrefs, updates)

      await updateDoc(docRef, {
        preferences: newPrefs,
        updatedAt: serverTimestamp()
      })
    } else {
      // Create new document with merged preferences
      const newPrefs = deepMerge(DEFAULT_PREFERENCES, updates)
      await setDoc(docRef, {
        preferences: newPrefs,
        updatedAt: serverTimestamp()
      })
    }
  } catch (err) {
    logger.error('Error updating user preferences:', err)
    throw err
  }
}

/**
 * Reset preferences to defaults
 */
export async function resetUserPreferences(userId, category = null) {
  try {
    if (category) {
      // Reset specific category
      await updateUserPreferences(userId, {
        [category]: DEFAULT_PREFERENCES[category]
      })
    } else {
      // Reset all preferences
      await setUserPreferences(userId, DEFAULT_PREFERENCES)
    }
  } catch (err) {
    logger.error('Error resetting user preferences:', err)
    throw err
  }
}

// ============================================
// LOCAL STORAGE FALLBACK
// ============================================

const LOCAL_STORAGE_KEY = 'aeria_user_preferences'

/**
 * Get preferences from local storage
 */
export function getLocalPreferences() {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (stored) {
      return deepMerge(DEFAULT_PREFERENCES, JSON.parse(stored))
    }
  } catch (err) {
    logger.error('Error reading local preferences:', err)
  }
  return { ...DEFAULT_PREFERENCES }
}

/**
 * Save preferences to local storage
 */
export function setLocalPreferences(preferences) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(preferences))
  } catch (err) {
    logger.error('Error saving local preferences:', err)
  }
}

/**
 * Update local preferences
 */
export function updateLocalPreferences(updates) {
  const current = getLocalPreferences()
  const updated = deepMerge(current, updates)
  setLocalPreferences(updated)
  return updated
}

// ============================================
// PREFERENCE HELPERS
// ============================================

/**
 * Deep merge objects
 */
function deepMerge(target, source) {
  const result = { ...target }

  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key])
    } else {
      result[key] = source[key]
    }
  }

  return result
}

/**
 * Get single preference value by path
 */
export function getPreferenceValue(preferences, path) {
  return path.split('.').reduce((obj, key) => obj?.[key], preferences)
}

/**
 * Set single preference value by path
 */
export function setPreferenceValue(preferences, path, value) {
  const keys = path.split('.')
  const lastKey = keys.pop()
  const target = keys.reduce((obj, key) => {
    if (!obj[key]) obj[key] = {}
    return obj[key]
  }, preferences)

  target[lastKey] = value
  return preferences
}

/**
 * Check if a preference differs from default
 */
export function isCustomized(preferences, path) {
  const currentValue = getPreferenceValue(preferences, path)
  const defaultValue = getPreferenceValue(DEFAULT_PREFERENCES, path)
  return JSON.stringify(currentValue) !== JSON.stringify(defaultValue)
}

// ============================================
// EXPORTS
// ============================================

export {
  DEFAULT_PREFERENCES
}

export default {
  DEFAULT_PREFERENCES,
  getUserPreferences,
  setUserPreferences,
  updateUserPreferences,
  resetUserPreferences,
  getLocalPreferences,
  setLocalPreferences,
  updateLocalPreferences,
  getPreferenceValue,
  setPreferenceValue,
  isCustomized
}
