/**
 * Error Handling Service
 * Centralized error handling and user-friendly error messages
 *
 * @location src/lib/errorHandling.js
 */

import { logger } from './logger'

// ============================================
// ERROR TYPES
// ============================================

export const ERROR_TYPES = {
  NETWORK: 'network',
  AUTH: 'auth',
  PERMISSION: 'permission',
  VALIDATION: 'validation',
  NOT_FOUND: 'not_found',
  CONFLICT: 'conflict',
  RATE_LIMIT: 'rate_limit',
  SERVER: 'server',
  UNKNOWN: 'unknown'
}

// ============================================
// ERROR MESSAGES
// ============================================

export const ERROR_MESSAGES = {
  // Network errors
  network_offline: 'You appear to be offline. Please check your internet connection.',
  network_timeout: 'The request timed out. Please try again.',
  network_error: 'A network error occurred. Please check your connection and try again.',

  // Auth errors
  auth_expired: 'Your session has expired. Please sign in again.',
  auth_invalid: 'Invalid credentials. Please check your email and password.',
  auth_required: 'Please sign in to continue.',
  auth_email_not_verified: 'Please verify your email address to continue.',
  auth_user_disabled: 'This account has been disabled. Please contact support.',
  auth_too_many_requests: 'Too many sign-in attempts. Please try again later.',

  // Permission errors
  permission_denied: 'You do not have permission to perform this action.',
  permission_read: 'You do not have permission to view this content.',
  permission_write: 'You do not have permission to modify this content.',
  permission_delete: 'You do not have permission to delete this content.',

  // Validation errors
  validation_required: 'This field is required.',
  validation_email: 'Please enter a valid email address.',
  validation_password: 'Password must be at least 8 characters.',
  validation_format: 'Invalid format. Please check your input.',

  // Resource errors
  not_found: 'The requested resource was not found.',
  not_found_project: 'Project not found.',
  not_found_incident: 'Incident not found.',
  not_found_equipment: 'Equipment not found.',
  not_found_aircraft: 'Aircraft not found.',
  not_found_user: 'User not found.',

  // Conflict errors
  conflict_duplicate: 'This item already exists.',
  conflict_modified: 'This item was modified by someone else. Please refresh and try again.',

  // Rate limit errors
  rate_limit: 'Too many requests. Please wait a moment and try again.',

  // Server errors
  server_error: 'An unexpected error occurred. Please try again later.',
  server_maintenance: 'The system is currently under maintenance. Please try again later.',

  // Generic fallback
  unknown: 'Something went wrong. Please try again.'
}

// ============================================
// FIREBASE ERROR MAPPING
// ============================================

const FIREBASE_ERROR_MAP = {
  // Auth errors
  'auth/invalid-email': { type: ERROR_TYPES.VALIDATION, message: ERROR_MESSAGES.validation_email },
  'auth/user-disabled': { type: ERROR_TYPES.AUTH, message: ERROR_MESSAGES.auth_user_disabled },
  'auth/user-not-found': { type: ERROR_TYPES.AUTH, message: ERROR_MESSAGES.auth_invalid },
  'auth/wrong-password': { type: ERROR_TYPES.AUTH, message: ERROR_MESSAGES.auth_invalid },
  'auth/email-already-in-use': { type: ERROR_TYPES.CONFLICT, message: 'An account with this email already exists.' },
  'auth/weak-password': { type: ERROR_TYPES.VALIDATION, message: ERROR_MESSAGES.validation_password },
  'auth/expired-action-code': { type: ERROR_TYPES.AUTH, message: 'This link has expired. Please request a new one.' },
  'auth/invalid-action-code': { type: ERROR_TYPES.AUTH, message: 'This link is invalid. Please request a new one.' },
  'auth/too-many-requests': { type: ERROR_TYPES.RATE_LIMIT, message: ERROR_MESSAGES.auth_too_many_requests },
  'auth/network-request-failed': { type: ERROR_TYPES.NETWORK, message: ERROR_MESSAGES.network_error },
  'auth/requires-recent-login': { type: ERROR_TYPES.AUTH, message: 'Please sign in again to complete this action.' },

  // Firestore errors
  'permission-denied': { type: ERROR_TYPES.PERMISSION, message: ERROR_MESSAGES.permission_denied },
  'not-found': { type: ERROR_TYPES.NOT_FOUND, message: ERROR_MESSAGES.not_found },
  'already-exists': { type: ERROR_TYPES.CONFLICT, message: ERROR_MESSAGES.conflict_duplicate },
  'resource-exhausted': { type: ERROR_TYPES.RATE_LIMIT, message: ERROR_MESSAGES.rate_limit },
  'failed-precondition': { type: ERROR_TYPES.CONFLICT, message: ERROR_MESSAGES.conflict_modified },
  'aborted': { type: ERROR_TYPES.CONFLICT, message: ERROR_MESSAGES.conflict_modified },
  'unavailable': { type: ERROR_TYPES.SERVER, message: 'The service is temporarily unavailable. Please try again.' },
  'deadline-exceeded': { type: ERROR_TYPES.NETWORK, message: ERROR_MESSAGES.network_timeout },
  'cancelled': { type: ERROR_TYPES.UNKNOWN, message: 'The operation was cancelled.' },
  'data-loss': { type: ERROR_TYPES.SERVER, message: 'Data loss detected. Please contact support.' },
  'internal': { type: ERROR_TYPES.SERVER, message: ERROR_MESSAGES.server_error },
  'unimplemented': { type: ERROR_TYPES.SERVER, message: 'This feature is not yet available.' },

  // Storage errors
  'storage/unauthorized': { type: ERROR_TYPES.PERMISSION, message: 'You do not have permission to access this file.' },
  'storage/canceled': { type: ERROR_TYPES.UNKNOWN, message: 'The upload was cancelled.' },
  'storage/unknown': { type: ERROR_TYPES.UNKNOWN, message: 'An unknown error occurred during file upload.' },
  'storage/object-not-found': { type: ERROR_TYPES.NOT_FOUND, message: 'File not found.' },
  'storage/quota-exceeded': { type: ERROR_TYPES.SERVER, message: 'Storage quota exceeded. Please contact support.' },
  'storage/unauthenticated': { type: ERROR_TYPES.AUTH, message: ERROR_MESSAGES.auth_required },
  'storage/retry-limit-exceeded': { type: ERROR_TYPES.NETWORK, message: 'Upload failed. Please try again.' }
}

// ============================================
// ERROR PARSING
// ============================================

/**
 * Parse error and return user-friendly message
 */
export function parseError(error) {
  if (!error) {
    return {
      type: ERROR_TYPES.UNKNOWN,
      message: ERROR_MESSAGES.unknown,
      originalError: null
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      type: ERROR_TYPES.UNKNOWN,
      message: error,
      originalError: error
    }
  }

  // Check for Firebase error code
  const code = error.code || error.name
  if (code && FIREBASE_ERROR_MAP[code]) {
    return {
      ...FIREBASE_ERROR_MAP[code],
      originalError: error
    }
  }

  // Check for network errors
  if (error.name === 'NetworkError' || !navigator.onLine) {
    return {
      type: ERROR_TYPES.NETWORK,
      message: navigator.onLine ? ERROR_MESSAGES.network_error : ERROR_MESSAGES.network_offline,
      originalError: error
    }
  }

  // Check for timeout
  if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
    return {
      type: ERROR_TYPES.NETWORK,
      message: ERROR_MESSAGES.network_timeout,
      originalError: error
    }
  }

  // Check for HTTP status codes
  if (error.status) {
    return parseHttpError(error.status, error)
  }

  // Default to error message or unknown
  return {
    type: ERROR_TYPES.UNKNOWN,
    message: error.message || ERROR_MESSAGES.unknown,
    originalError: error
  }
}

/**
 * Parse HTTP status code to error
 */
function parseHttpError(status, error) {
  const statusMap = {
    400: { type: ERROR_TYPES.VALIDATION, message: 'Invalid request. Please check your input.' },
    401: { type: ERROR_TYPES.AUTH, message: ERROR_MESSAGES.auth_required },
    403: { type: ERROR_TYPES.PERMISSION, message: ERROR_MESSAGES.permission_denied },
    404: { type: ERROR_TYPES.NOT_FOUND, message: ERROR_MESSAGES.not_found },
    409: { type: ERROR_TYPES.CONFLICT, message: ERROR_MESSAGES.conflict_duplicate },
    429: { type: ERROR_TYPES.RATE_LIMIT, message: ERROR_MESSAGES.rate_limit },
    500: { type: ERROR_TYPES.SERVER, message: ERROR_MESSAGES.server_error },
    502: { type: ERROR_TYPES.SERVER, message: ERROR_MESSAGES.server_error },
    503: { type: ERROR_TYPES.SERVER, message: ERROR_MESSAGES.server_maintenance },
    504: { type: ERROR_TYPES.NETWORK, message: ERROR_MESSAGES.network_timeout }
  }

  return {
    ...statusMap[status] || { type: ERROR_TYPES.UNKNOWN, message: ERROR_MESSAGES.unknown },
    originalError: error
  }
}

// ============================================
// ERROR HANDLING UTILITIES
// ============================================

/**
 * Handle error with logging
 */
export function handleError(error, context = 'Unknown') {
  const parsed = parseError(error)

  // Log the error
  logger.error(`[${context}] ${parsed.type}: ${parsed.message}`, {
    originalError: error,
    type: parsed.type
  })

  return parsed
}

/**
 * Create error handler for async operations
 */
export function createErrorHandler(context) {
  return (error) => handleError(error, context)
}

/**
 * Wrap async function with error handling
 */
export function withErrorHandling(fn, context = 'Operation') {
  return async (...args) => {
    try {
      return await fn(...args)
    } catch (error) {
      const parsed = handleError(error, context)
      throw parsed
    }
  }
}

/**
 * Try-catch wrapper that returns result or error
 */
export async function tryCatch(fn, context = 'Operation') {
  try {
    const result = await fn()
    return { success: true, data: result, error: null }
  } catch (error) {
    const parsed = handleError(error, context)
    return { success: false, data: null, error: parsed }
  }
}

// ============================================
// FORM ERROR HANDLING
// ============================================

/**
 * Parse validation errors for forms
 */
export function parseValidationErrors(errors) {
  if (!errors) return {}

  // Handle array of errors
  if (Array.isArray(errors)) {
    return errors.reduce((acc, err) => {
      if (err.field) {
        acc[err.field] = err.message
      }
      return acc
    }, {})
  }

  // Handle object of errors
  if (typeof errors === 'object') {
    const parsed = {}
    Object.entries(errors).forEach(([field, messages]) => {
      if (Array.isArray(messages)) {
        parsed[field] = messages[0]
      } else {
        parsed[field] = messages
      }
    })
    return parsed
  }

  return {}
}

/**
 * Get first error message from form errors
 */
export function getFirstError(errors) {
  if (!errors) return null

  if (Array.isArray(errors)) {
    return errors[0]?.message || null
  }

  const values = Object.values(errors)
  if (values.length > 0) {
    return Array.isArray(values[0]) ? values[0][0] : values[0]
  }

  return null
}

// ============================================
// RETRY LOGIC
// ============================================

/**
 * Retry an operation with exponential backoff
 */
export async function retry(fn, options = {}) {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = 2,
    shouldRetry = (error) => error.type === ERROR_TYPES.NETWORK || error.type === ERROR_TYPES.SERVER
  } = options

  let lastError

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = parseError(error)

      if (!shouldRetry(lastError) || attempt === maxRetries - 1) {
        throw lastError
      }

      // Wait before retrying
      const waitTime = delay * Math.pow(backoff, attempt)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }

  throw lastError
}

// ============================================
// ERROR DISPLAY HELPERS
// ============================================

/**
 * Get error icon based on type
 */
export function getErrorIcon(type) {
  const icons = {
    [ERROR_TYPES.NETWORK]: 'WifiOff',
    [ERROR_TYPES.AUTH]: 'Lock',
    [ERROR_TYPES.PERMISSION]: 'ShieldOff',
    [ERROR_TYPES.VALIDATION]: 'AlertCircle',
    [ERROR_TYPES.NOT_FOUND]: 'FileQuestion',
    [ERROR_TYPES.CONFLICT]: 'GitMerge',
    [ERROR_TYPES.RATE_LIMIT]: 'Clock',
    [ERROR_TYPES.SERVER]: 'Server',
    [ERROR_TYPES.UNKNOWN]: 'AlertTriangle'
  }

  return icons[type] || 'AlertTriangle'
}

/**
 * Get error color based on type
 */
export function getErrorColor(type) {
  const colors = {
    [ERROR_TYPES.NETWORK]: 'text-yellow-600',
    [ERROR_TYPES.AUTH]: 'text-blue-600',
    [ERROR_TYPES.PERMISSION]: 'text-orange-600',
    [ERROR_TYPES.VALIDATION]: 'text-red-600',
    [ERROR_TYPES.NOT_FOUND]: 'text-gray-600',
    [ERROR_TYPES.CONFLICT]: 'text-purple-600',
    [ERROR_TYPES.RATE_LIMIT]: 'text-yellow-600',
    [ERROR_TYPES.SERVER]: 'text-red-600',
    [ERROR_TYPES.UNKNOWN]: 'text-red-600'
  }

  return colors[type] || 'text-red-600'
}

/**
 * Get recovery action for error type
 */
export function getRecoveryAction(type) {
  const actions = {
    [ERROR_TYPES.NETWORK]: { label: 'Check Connection', action: 'checkNetwork' },
    [ERROR_TYPES.AUTH]: { label: 'Sign In', action: 'signIn' },
    [ERROR_TYPES.PERMISSION]: { label: 'Request Access', action: 'requestAccess' },
    [ERROR_TYPES.VALIDATION]: { label: 'Fix Errors', action: 'fixForm' },
    [ERROR_TYPES.NOT_FOUND]: { label: 'Go Back', action: 'goBack' },
    [ERROR_TYPES.CONFLICT]: { label: 'Refresh', action: 'refresh' },
    [ERROR_TYPES.RATE_LIMIT]: { label: 'Wait & Retry', action: 'waitRetry' },
    [ERROR_TYPES.SERVER]: { label: 'Try Again', action: 'retry' },
    [ERROR_TYPES.UNKNOWN]: { label: 'Try Again', action: 'retry' }
  }

  return actions[type] || actions[ERROR_TYPES.UNKNOWN]
}

export default {
  ERROR_TYPES,
  ERROR_MESSAGES,
  parseError,
  handleError,
  createErrorHandler,
  withErrorHandling,
  tryCatch,
  parseValidationErrors,
  getFirstError,
  retry,
  getErrorIcon,
  getErrorColor,
  getRecoveryAction
}
