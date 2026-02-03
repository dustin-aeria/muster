/**
 * Data Validation Utilities
 * Validate form inputs and data structures
 *
 * @location src/lib/validation.js
 */

// ============================================
// BASIC VALIDATORS
// ============================================

/**
 * Check if value is empty
 */
export function isEmpty(value) {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Check if value is a valid email
 * Uses a more comprehensive regex and additional checks
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false

  // More comprehensive email regex
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  if (!regex.test(email)) return false

  // Additional checks
  if (email.length > 254) return false
  const [local, domain] = email.split('@')
  if (!local || local.length > 64) return false
  if (!domain || domain.length < 3) return false

  return true
}

/**
 * Check if value is a valid phone number
 * @param {string} phone - Phone number to validate
 * @param {string} country - Country code for validation (default: 'US')
 */
export function isValidPhone(phone, country = 'US') {
  if (!phone || typeof phone !== 'string') return false

  // Remove all non-digits
  const digits = phone.replace(/\D/g, '')

  // North American validation (US, CA)
  if (country === 'US' || country === 'CA') {
    // Must be 10 or 11 digits (with optional 1 prefix)
    if (digits.length === 10) return true
    if (digits.length === 11 && digits.startsWith('1')) return true
    return false
  }

  // Generic international validation
  return digits.length >= 7 && digits.length <= 15
}

/**
 * Check if value is a valid URL
 */
export function isValidURL(url) {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Check if value is a valid date
 */
export function isValidDate(date) {
  if (!date) return false
  const d = new Date(date)
  return d instanceof Date && !isNaN(d.getTime())
}

/**
 * Check if value is a valid number
 */
export function isValidNumber(value) {
  if (value === '' || value === null || value === undefined) return false
  return !isNaN(parseFloat(value)) && isFinite(value)
}

/**
 * Check if value is within range
 */
export function isInRange(value, min, max) {
  const num = parseFloat(value)
  if (isNaN(num)) return false
  if (min !== undefined && num < min) return false
  if (max !== undefined && num > max) return false
  return true
}

/**
 * Check string length
 */
export function isValidLength(value, min = 0, max = Infinity) {
  if (!value) return min === 0
  const length = String(value).length
  return length >= min && length <= max
}

// ============================================
// AVIATION-SPECIFIC VALIDATORS
// ============================================

/**
 * Validate aircraft registration (various formats)
 */
export function isValidRegistration(registration) {
  if (!registration) return false
  // Common formats: N12345, C-GABC, G-ABCD, VH-ABC
  const patterns = [
    /^N\d{1,5}[A-Z]{0,2}$/,  // US
    /^C-[A-Z]{4}$/,          // Canada
    /^G-[A-Z]{4}$/,          // UK
    /^VH-[A-Z]{3}$/,         // Australia
    /^[A-Z]{1,2}-[A-Z]{3,4}$/ // Generic international
  ]
  return patterns.some(pattern => pattern.test(registration.toUpperCase()))
}

/**
 * Validate serial number format
 */
export function isValidSerialNumber(serial) {
  if (!serial) return false
  // At least 3 alphanumeric characters
  return /^[A-Za-z0-9-]{3,}$/.test(serial)
}

/**
 * Validate coordinates
 */
export function isValidLatitude(lat) {
  const num = parseFloat(lat)
  return !isNaN(num) && num >= -90 && num <= 90
}

export function isValidLongitude(lng) {
  const num = parseFloat(lng)
  return !isNaN(num) && num >= -180 && num <= 180
}

export function isValidCoordinates(lat, lng) {
  return isValidLatitude(lat) && isValidLongitude(lng)
}

/**
 * Validate altitude (meters AGL)
 */
export function isValidAltitude(altitude, maxAltitude = 120) {
  const num = parseFloat(altitude)
  return !isNaN(num) && num >= 0 && num <= maxAltitude
}

// ============================================
// FORM VALIDATION
// ============================================

/**
 * Validate a field against rules
 */
export function validateField(value, rules) {
  const errors = []

  for (const rule of rules) {
    const error = applyRule(value, rule)
    if (error) {
      errors.push(error)
      // Stop on first error unless validateAll is set
      if (!rule.validateAll) break
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Apply a single validation rule
 */
function applyRule(value, rule) {
  switch (rule.type) {
    case 'required':
      if (isEmpty(value)) return rule.message || 'This field is required'
      break

    case 'email':
      if (value && !isValidEmail(value)) return rule.message || 'Invalid email address'
      break

    case 'phone':
      if (value && !isValidPhone(value)) return rule.message || 'Invalid phone number'
      break

    case 'url':
      if (value && !isValidURL(value)) return rule.message || 'Invalid URL'
      break

    case 'date':
      if (value && !isValidDate(value)) return rule.message || 'Invalid date'
      break

    case 'number':
      if (value && !isValidNumber(value)) return rule.message || 'Must be a number'
      break

    case 'min':
      if (value !== '' && value !== null && parseFloat(value) < rule.value) {
        return rule.message || `Must be at least ${rule.value}`
      }
      break

    case 'max':
      if (value !== '' && value !== null && parseFloat(value) > rule.value) {
        return rule.message || `Must be no more than ${rule.value}`
      }
      break

    case 'minLength':
      if (value && String(value).length < rule.value) {
        return rule.message || `Must be at least ${rule.value} characters`
      }
      break

    case 'maxLength':
      if (value && String(value).length > rule.value) {
        return rule.message || `Must be no more than ${rule.value} characters`
      }
      break

    case 'pattern':
      if (value && !rule.value.test(value)) {
        return rule.message || 'Invalid format'
      }
      break

    case 'custom':
      if (rule.validator && !rule.validator(value)) {
        return rule.message || 'Invalid value'
      }
      break

    case 'match':
      if (value !== rule.value) {
        return rule.message || 'Values do not match'
      }
      break
  }

  return null
}

/**
 * Validate entire form
 */
export function validateForm(formData, schema) {
  const errors = {}
  let isValid = true

  for (const [field, rules] of Object.entries(schema)) {
    const value = formData[field]
    const result = validateField(value, rules)

    if (!result.valid) {
      errors[field] = result.errors
      isValid = false
    }
  }

  return {
    valid: isValid,
    errors
  }
}

// ============================================
// COMMON VALIDATION SCHEMAS
// ============================================

export const validationSchemas = {
  project: {
    name: [
      { type: 'required', message: 'Project name is required' },
      { type: 'minLength', value: 3, message: 'Name must be at least 3 characters' },
      { type: 'maxLength', value: 100, message: 'Name must be less than 100 characters' }
    ],
    clientId: [
      { type: 'required', message: 'Please select a client' }
    ]
  },

  operator: {
    firstName: [
      { type: 'required', message: 'First name is required' },
      { type: 'minLength', value: 2, message: 'First name must be at least 2 characters' }
    ],
    lastName: [
      { type: 'required', message: 'Last name is required' },
      { type: 'minLength', value: 2, message: 'Last name must be at least 2 characters' }
    ],
    email: [
      { type: 'required', message: 'Email is required' },
      { type: 'email', message: 'Please enter a valid email address' }
    ]
  },

  aircraft: {
    nickname: [
      { type: 'required', message: 'Aircraft name is required' },
      { type: 'minLength', value: 2, message: 'Name must be at least 2 characters' }
    ],
    make: [
      { type: 'required', message: 'Make is required' }
    ],
    model: [
      { type: 'required', message: 'Model is required' }
    ],
    serialNumber: [
      { type: 'required', message: 'Serial number is required' },
      { type: 'custom', validator: isValidSerialNumber, message: 'Invalid serial number format' }
    ]
  },

  equipment: {
    name: [
      { type: 'required', message: 'Equipment name is required' },
      { type: 'minLength', value: 2, message: 'Name must be at least 2 characters' }
    ],
    category: [
      { type: 'required', message: 'Please select a category' }
    ]
  },

  incident: {
    title: [
      { type: 'required', message: 'Title is required' },
      { type: 'minLength', value: 5, message: 'Title must be at least 5 characters' }
    ],
    incidentDate: [
      { type: 'required', message: 'Incident date is required' },
      { type: 'date', message: 'Please enter a valid date' }
    ],
    description: [
      { type: 'required', message: 'Description is required' },
      { type: 'minLength', value: 20, message: 'Please provide more detail (at least 20 characters)' }
    ],
    severity: [
      { type: 'required', message: 'Please select a severity level' }
    ]
  },

  client: {
    name: [
      { type: 'required', message: 'Client name is required' },
      { type: 'minLength', value: 2, message: 'Name must be at least 2 characters' }
    ],
    email: [
      { type: 'email', message: 'Please enter a valid email address' }
    ],
    phone: [
      { type: 'phone', message: 'Please enter a valid phone number' }
    ]
  }
}

// ============================================
// SANITIZATION
// ============================================

/**
 * Sanitize string input
 */
export function sanitizeString(value) {
  if (!value) return ''
  return String(value).trim()
}

/**
 * Sanitize number input
 */
export function sanitizeNumber(value, defaultValue = 0) {
  const num = parseFloat(value)
  return isNaN(num) ? defaultValue : num
}

/**
 * Sanitize integer input
 */
export function sanitizeInteger(value, defaultValue = 0) {
  const num = parseInt(value, 10)
  return isNaN(num) ? defaultValue : num
}

/**
 * Sanitize form data
 */
export function sanitizeFormData(data, schema) {
  const sanitized = {}

  for (const [key, value] of Object.entries(data)) {
    const fieldSchema = schema[key]

    if (fieldSchema?.type === 'number') {
      sanitized[key] = sanitizeNumber(value)
    } else if (fieldSchema?.type === 'integer') {
      sanitized[key] = sanitizeInteger(value)
    } else if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

export default {
  isEmpty,
  isValidEmail,
  isValidPhone,
  isValidURL,
  isValidDate,
  isValidNumber,
  isInRange,
  isValidLength,
  isValidRegistration,
  isValidSerialNumber,
  isValidLatitude,
  isValidLongitude,
  isValidCoordinates,
  isValidAltitude,
  validateField,
  validateForm,
  validationSchemas,
  sanitizeString,
  sanitizeNumber,
  sanitizeInteger,
  sanitizeFormData
}
