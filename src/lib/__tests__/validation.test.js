/**
 * Validation Tests
 * Tests for validation utility functions
 *
 * @location src/lib/__tests__/validation.test.js
 */

import { describe, it, expect } from 'vitest'
import {
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
  sanitizeString,
  sanitizeNumber,
  sanitizeInteger,
} from '../validation'

// ============================================
// isEmpty Tests
// ============================================
describe('isEmpty', () => {
  it('returns true for null and undefined', () => {
    expect(isEmpty(null)).toBe(true)
    expect(isEmpty(undefined)).toBe(true)
  })

  it('returns true for empty strings', () => {
    expect(isEmpty('')).toBe(true)
    expect(isEmpty('   ')).toBe(true)
    expect(isEmpty('\t\n')).toBe(true)
  })

  it('returns true for empty arrays', () => {
    expect(isEmpty([])).toBe(true)
  })

  it('returns true for empty objects', () => {
    expect(isEmpty({})).toBe(true)
  })

  it('returns false for non-empty values', () => {
    expect(isEmpty('hello')).toBe(false)
    expect(isEmpty([1, 2, 3])).toBe(false)
    expect(isEmpty({ a: 1 })).toBe(false)
    expect(isEmpty(0)).toBe(false)
    expect(isEmpty(false)).toBe(false)
  })
})

// ============================================
// isValidEmail Tests
// ============================================
describe('isValidEmail', () => {
  it('accepts valid email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
    expect(isValidEmail('user.name@domain.org')).toBe(true)
    expect(isValidEmail('user+tag@domain.co.uk')).toBe(true)
    expect(isValidEmail('first.last@subdomain.domain.com')).toBe(true)
  })

  it('rejects invalid email addresses', () => {
    expect(isValidEmail('')).toBe(false)
    expect(isValidEmail(null)).toBe(false)
    expect(isValidEmail(undefined)).toBe(false)
    expect(isValidEmail('invalid')).toBe(false)
    expect(isValidEmail('@domain.com')).toBe(false)
    expect(isValidEmail('user@')).toBe(false)
    expect(isValidEmail('user@.com')).toBe(false)
  })

  it('rejects emails with invalid lengths', () => {
    // Local part too long (> 64 chars)
    const longLocal = 'a'.repeat(65) + '@domain.com'
    expect(isValidEmail(longLocal)).toBe(false)

    // Total email too long (> 254 chars)
    const longEmail = 'user@' + 'a'.repeat(250) + '.com'
    expect(isValidEmail(longEmail)).toBe(false)
  })

  it('rejects emails with too-short domains', () => {
    expect(isValidEmail('user@ab')).toBe(false)
  })
})

// ============================================
// isValidPhone Tests
// ============================================
describe('isValidPhone', () => {
  describe('US/CA validation', () => {
    it('accepts valid 10-digit phone numbers', () => {
      expect(isValidPhone('6048492345')).toBe(true)
      expect(isValidPhone('604-849-2345')).toBe(true)
      expect(isValidPhone('(604) 849-2345')).toBe(true)
      expect(isValidPhone('604.849.2345')).toBe(true)
    })

    it('accepts valid 11-digit phone numbers starting with 1', () => {
      expect(isValidPhone('1-604-849-2345')).toBe(true)
      expect(isValidPhone('16048492345')).toBe(true)
    })

    it('rejects invalid phone numbers', () => {
      expect(isValidPhone('')).toBe(false)
      expect(isValidPhone(null)).toBe(false)
      expect(isValidPhone('123')).toBe(false)
      expect(isValidPhone('123456789')).toBe(false) // 9 digits
      expect(isValidPhone('2604849234567')).toBe(false) // 13 digits, doesn't start with 1
    })
  })

  describe('International validation', () => {
    it('accepts valid international phone numbers', () => {
      expect(isValidPhone('+44 7911 123456', 'UK')).toBe(true)
      expect(isValidPhone('0412345678', 'AU')).toBe(true)
    })

    it('rejects too short phone numbers', () => {
      expect(isValidPhone('12345', 'INT')).toBe(false)
    })

    it('rejects too long phone numbers', () => {
      expect(isValidPhone('1234567890123456', 'INT')).toBe(false)
    })
  })
})

// ============================================
// isValidURL Tests
// ============================================
describe('isValidURL', () => {
  it('accepts valid URLs', () => {
    expect(isValidURL('https://example.com')).toBe(true)
    expect(isValidURL('http://example.com/path')).toBe(true)
    expect(isValidURL('https://example.com/path?query=1')).toBe(true)
  })

  it('rejects invalid URLs', () => {
    expect(isValidURL('')).toBe(false)
    expect(isValidURL(null)).toBe(false)
    expect(isValidURL('not-a-url')).toBe(false)
    expect(isValidURL('example.com')).toBe(false) // Missing protocol
  })
})

// ============================================
// isValidDate Tests
// ============================================
describe('isValidDate', () => {
  it('accepts valid dates', () => {
    expect(isValidDate('2024-01-15')).toBe(true)
    expect(isValidDate(new Date())).toBe(true)
    expect(isValidDate('January 15, 2024')).toBe(true)
  })

  it('rejects invalid dates', () => {
    expect(isValidDate('')).toBe(false)
    expect(isValidDate(null)).toBe(false)
    expect(isValidDate('invalid-date')).toBe(false)
  })
})

// ============================================
// isValidNumber Tests
// ============================================
describe('isValidNumber', () => {
  it('accepts valid numbers', () => {
    expect(isValidNumber(0)).toBe(true)
    expect(isValidNumber(42)).toBe(true)
    expect(isValidNumber(-3.14)).toBe(true)
    expect(isValidNumber('123.45')).toBe(true)
  })

  it('rejects invalid numbers', () => {
    expect(isValidNumber('')).toBe(false)
    expect(isValidNumber(null)).toBe(false)
    expect(isValidNumber(undefined)).toBe(false)
    expect(isValidNumber('abc')).toBe(false)
    expect(isValidNumber(Infinity)).toBe(false)
    expect(isValidNumber(NaN)).toBe(false)
  })
})

// ============================================
// isInRange Tests
// ============================================
describe('isInRange', () => {
  it('checks minimum values', () => {
    expect(isInRange(5, 0)).toBe(true)
    expect(isInRange(-5, 0)).toBe(false)
  })

  it('checks maximum values', () => {
    expect(isInRange(5, undefined, 10)).toBe(true)
    expect(isInRange(15, undefined, 10)).toBe(false)
  })

  it('checks both min and max', () => {
    expect(isInRange(5, 0, 10)).toBe(true)
    expect(isInRange(-5, 0, 10)).toBe(false)
    expect(isInRange(15, 0, 10)).toBe(false)
  })
})

// ============================================
// isValidLength Tests
// ============================================
describe('isValidLength', () => {
  it('validates string length', () => {
    expect(isValidLength('hello', 1, 10)).toBe(true)
    expect(isValidLength('hello', 1, 3)).toBe(false)
    expect(isValidLength('hi', 3)).toBe(false)
  })

  it('handles empty values', () => {
    expect(isValidLength('', 0)).toBe(true)
    expect(isValidLength(null, 0)).toBe(true)
    expect(isValidLength(null, 1)).toBe(false)
  })
})

// ============================================
// Aviation-Specific Validators
// ============================================
describe('isValidRegistration', () => {
  it('accepts US registrations', () => {
    expect(isValidRegistration('N12345')).toBe(true)
    expect(isValidRegistration('N1AB')).toBe(true)
  })

  it('accepts Canadian registrations', () => {
    expect(isValidRegistration('C-GABC')).toBe(true)
  })

  it('accepts UK registrations', () => {
    expect(isValidRegistration('G-ABCD')).toBe(true)
  })

  it('rejects invalid registrations', () => {
    expect(isValidRegistration('')).toBe(false)
    expect(isValidRegistration('INVALID')).toBe(false)
    expect(isValidRegistration('123456')).toBe(false)
  })
})

describe('isValidSerialNumber', () => {
  it('accepts valid serial numbers', () => {
    expect(isValidSerialNumber('ABC123')).toBe(true)
    expect(isValidSerialNumber('123-456-789')).toBe(true)
  })

  it('rejects invalid serial numbers', () => {
    expect(isValidSerialNumber('')).toBe(false)
    expect(isValidSerialNumber('AB')).toBe(false) // Too short
  })
})

describe('Coordinate validators', () => {
  it('validates latitude', () => {
    expect(isValidLatitude(0)).toBe(true)
    expect(isValidLatitude(90)).toBe(true)
    expect(isValidLatitude(-90)).toBe(true)
    expect(isValidLatitude(91)).toBe(false)
    expect(isValidLatitude(-91)).toBe(false)
  })

  it('validates longitude', () => {
    expect(isValidLongitude(0)).toBe(true)
    expect(isValidLongitude(180)).toBe(true)
    expect(isValidLongitude(-180)).toBe(true)
    expect(isValidLongitude(181)).toBe(false)
    expect(isValidLongitude(-181)).toBe(false)
  })

  it('validates coordinate pairs', () => {
    expect(isValidCoordinates(49.2827, -123.1207)).toBe(true) // Vancouver
    expect(isValidCoordinates(91, 0)).toBe(false)
  })
})

describe('isValidAltitude', () => {
  it('accepts valid altitudes', () => {
    expect(isValidAltitude(0)).toBe(true)
    expect(isValidAltitude(100)).toBe(true)
    expect(isValidAltitude(120)).toBe(true)
  })

  it('rejects invalid altitudes', () => {
    expect(isValidAltitude(-1)).toBe(false)
    expect(isValidAltitude(121)).toBe(false) // Default max is 120
  })

  it('respects custom max altitude', () => {
    expect(isValidAltitude(150, 200)).toBe(true)
    expect(isValidAltitude(150, 100)).toBe(false)
  })
})

// ============================================
// Form Validation Tests
// ============================================
describe('validateField', () => {
  it('validates required fields', () => {
    const rules = [{ type: 'required', message: 'Field is required' }]
    expect(validateField('', rules).valid).toBe(false)
    expect(validateField('value', rules).valid).toBe(true)
  })

  it('validates email fields', () => {
    const rules = [{ type: 'email' }]
    expect(validateField('invalid', rules).valid).toBe(false)
    expect(validateField('test@example.com', rules).valid).toBe(true)
  })

  it('applies multiple rules', () => {
    const rules = [
      { type: 'required' },
      { type: 'minLength', value: 5 },
    ]
    expect(validateField('', rules).valid).toBe(false)
    expect(validateField('abc', rules).valid).toBe(false)
    expect(validateField('abcdef', rules).valid).toBe(true)
  })
})

describe('validateForm', () => {
  it('validates a complete form', () => {
    const schema = {
      name: [{ type: 'required' }],
      email: [{ type: 'email' }],
    }

    const validData = { name: 'Test', email: 'test@example.com' }
    expect(validateForm(validData, schema).valid).toBe(true)

    const invalidData = { name: '', email: 'invalid' }
    const result = validateForm(invalidData, schema)
    expect(result.valid).toBe(false)
    expect(result.errors.name).toBeDefined()
    expect(result.errors.email).toBeDefined()
  })
})

// ============================================
// Sanitization Tests
// ============================================
describe('sanitizeString', () => {
  it('trims whitespace', () => {
    expect(sanitizeString('  hello  ')).toBe('hello')
  })

  it('handles empty values', () => {
    expect(sanitizeString('')).toBe('')
    expect(sanitizeString(null)).toBe('')
    expect(sanitizeString(undefined)).toBe('')
  })

  it('converts numbers to strings', () => {
    expect(sanitizeString(123)).toBe('123')
  })
})

describe('sanitizeNumber', () => {
  it('parses valid numbers', () => {
    expect(sanitizeNumber('123.45')).toBe(123.45)
    expect(sanitizeNumber(42)).toBe(42)
  })

  it('returns default for invalid values', () => {
    expect(sanitizeNumber('abc')).toBe(0)
    expect(sanitizeNumber('abc', 10)).toBe(10)
  })
})

describe('sanitizeInteger', () => {
  it('parses valid integers', () => {
    expect(sanitizeInteger('42')).toBe(42)
    expect(sanitizeInteger('123.99')).toBe(123) // Truncates
  })

  it('returns default for invalid values', () => {
    expect(sanitizeInteger('abc')).toBe(0)
    expect(sanitizeInteger('abc', -1)).toBe(-1)
  })
})
