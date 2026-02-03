/**
 * Muster - Twilio SMS Service
 * Handles SMS delivery via Twilio API
 *
 * Required Environment Variables:
 * - TWILIO_ACCOUNT_SID: Your Twilio Account SID
 * - TWILIO_AUTH_TOKEN: Your Twilio Auth Token
 * - TWILIO_PHONE_NUMBER: Your Twilio phone number (E.164 format)
 *
 * @version 1.0.0
 */

const functions = require('firebase-functions/v1')
const twilio = require('twilio')

// Initialize Twilio with credentials from Firebase config
const config = functions.config()
const TWILIO_ACCOUNT_SID = config.twilio?.account_sid || process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = config.twilio?.auth_token || process.env.TWILIO_AUTH_TOKEN
const TWILIO_PHONE_NUMBER = config.twilio?.phone_number || process.env.TWILIO_PHONE_NUMBER

let twilioClient = null

if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
} else {
  functions.logger.warn('Twilio credentials not configured. SMS sending will fail.')
}

/**
 * Send an SMS via Twilio
 *
 * @param {Object} options - SMS options
 * @param {string} options.to - Recipient phone number (E.164 format preferred)
 * @param {string} options.body - Message body (max 1600 characters)
 * @returns {Promise<Object>} - Twilio response
 */
async function sendSMS({ to, body }) {
  if (!twilioClient) {
    throw new Error('Twilio credentials not configured')
  }

  if (!TWILIO_PHONE_NUMBER) {
    throw new Error('Twilio phone number not configured')
  }

  if (!to) {
    throw new Error('Recipient phone number is required')
  }

  if (!body) {
    throw new Error('Message body is required')
  }

  // Format phone number to E.164 if needed
  const formattedNumber = formatPhoneNumber(to)

  if (!formattedNumber) {
    throw new Error(`Invalid phone number: ${to}`)
  }

  // Truncate message if too long (Twilio limit is 1600 chars)
  const truncatedBody = body.length > 1600 ? body.substring(0, 1597) + '...' : body

  try {
    const message = await twilioClient.messages.create({
      body: truncatedBody,
      from: TWILIO_PHONE_NUMBER,
      to: formattedNumber
    })

    functions.logger.info('SMS sent successfully', {
      to: formattedNumber,
      sid: message.sid,
      status: message.status
    })

    return {
      success: true,
      sid: message.sid,
      status: message.status
    }
  } catch (error) {
    functions.logger.error('Twilio error:', {
      to: formattedNumber,
      error: error.message,
      code: error.code
    })

    // Re-throw with more context
    const enhancedError = new Error(`Twilio error: ${error.message}`)
    enhancedError.code = error.code
    enhancedError.moreInfo = error.moreInfo
    throw enhancedError
  }
}

/**
 * Send SMS to multiple recipients
 *
 * @param {string} body - Message body
 * @param {Array<string>} recipients - Array of phone numbers
 * @returns {Promise<Object>} - Results summary
 */
async function sendBulkSMS(body, recipients) {
  if (!twilioClient) {
    throw new Error('Twilio credentials not configured')
  }

  if (!Array.isArray(recipients) || recipients.length === 0) {
    throw new Error('Recipients array is required')
  }

  const results = {
    sent: 0,
    failed: 0,
    errors: []
  }

  // Process in batches to avoid rate limits
  const batchSize = 10
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize)

    await Promise.all(
      batch.map(async (phone) => {
        try {
          await sendSMS({ to: phone, body })
          results.sent++
        } catch (error) {
          results.failed++
          results.errors.push({
            phone,
            error: error.message
          })
        }
      })
    )

    // Small delay between batches to avoid rate limits
    if (i + batchSize < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  functions.logger.info('Bulk SMS complete', {
    sent: results.sent,
    failed: results.failed
  })

  return results
}

/**
 * Format phone number to E.164 format
 * Assumes Canadian/US numbers if no country code provided
 *
 * @param {string} phone - Phone number in various formats
 * @returns {string|null} - E.164 formatted number or null if invalid
 */
function formatPhoneNumber(phone) {
  if (!phone) return null

  // Remove all non-digit characters except leading +
  let cleaned = phone.replace(/[^\d+]/g, '')

  // If starts with +, assume it's already E.164
  if (cleaned.startsWith('+')) {
    // Validate length (E.164 is 8-15 digits)
    const digits = cleaned.substring(1)
    if (digits.length >= 8 && digits.length <= 15) {
      return cleaned
    }
    return null
  }

  // Remove leading 1 if present (North American country code)
  if (cleaned.startsWith('1') && cleaned.length === 11) {
    cleaned = cleaned.substring(1)
  }

  // Assume 10-digit North American number
  if (cleaned.length === 10) {
    return `+1${cleaned}`
  }

  // If 11 digits starting with 1, it's North American
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`
  }

  // Can't determine format
  functions.logger.warn('Could not format phone number:', phone)
  return null
}

/**
 * Validate phone number format
 *
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - Whether phone format is valid
 */
function isValidPhone(phone) {
  return formatPhoneNumber(phone) !== null
}

/**
 * Get SMS segment count for a message
 * SMS messages are split into segments of 160 chars (or 70 for Unicode)
 *
 * @param {string} message - Message text
 * @returns {number} - Number of segments
 */
function getSegmentCount(message) {
  if (!message) return 0

  // Check if message contains non-GSM characters (requires Unicode)
  const gsmChars = /^[@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ !"#%&'()*+,\-./0-9:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà^{}\\[~\]|€]*$/
  const isGsm = gsmChars.test(message)

  const segmentSize = isGsm ? 160 : 70
  const multipartSize = isGsm ? 153 : 67

  if (message.length <= segmentSize) {
    return 1
  }

  return Math.ceil(message.length / multipartSize)
}

module.exports = {
  sendSMS,
  sendBulkSMS,
  formatPhoneNumber,
  isValidPhone,
  getSegmentCount
}
