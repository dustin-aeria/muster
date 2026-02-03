/**
 * Muster - SendGrid Email Service
 * Handles email delivery via SendGrid API
 *
 * Required Environment Variables:
 * - SENDGRID_API_KEY: Your SendGrid API key
 * - SENDGRID_FROM_EMAIL: Verified sender email address
 * - SENDGRID_FROM_NAME: Sender display name (optional)
 *
 * @version 1.0.0
 */

const functions = require('firebase-functions/v1')
const sgMail = require('@sendgrid/mail')

// Initialize SendGrid with API key from Firebase config
const config = functions.config()
const SENDGRID_API_KEY = config.sendgrid?.api_key || process.env.SENDGRID_API_KEY
const FROM_EMAIL = config.sendgrid?.from_email || process.env.SENDGRID_FROM_EMAIL || 'notifications@aeria.ca'
const FROM_NAME = config.sendgrid?.from_name || process.env.SENDGRID_FROM_NAME || 'Muster'

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY)
} else {
  functions.logger.warn('SendGrid API key not configured. Email sending will fail.')
}

/**
 * Send an email via SendGrid
 *
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text body
 * @param {string} options.html - HTML body (optional)
 * @param {string} options.replyTo - Reply-to address (optional)
 * @returns {Promise<Object>} - SendGrid response
 */
async function sendEmail({ to, subject, text, html, replyTo }) {
  if (!SENDGRID_API_KEY) {
    throw new Error('SendGrid API key not configured')
  }

  if (!to) {
    throw new Error('Recipient email address is required')
  }

  if (!subject) {
    throw new Error('Email subject is required')
  }

  if (!text && !html) {
    throw new Error('Email body (text or html) is required')
  }

  const msg = {
    to,
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME
    },
    subject,
    text: text || stripHtml(html),
    html: html || text
  }

  if (replyTo) {
    msg.replyTo = replyTo
  }

  // Add tracking settings
  msg.trackingSettings = {
    clickTracking: {
      enable: false // Disable click tracking for cleaner links
    },
    openTracking: {
      enable: true
    }
  }

  try {
    const response = await sgMail.send(msg)
    functions.logger.info('Email sent successfully', {
      to,
      subject,
      statusCode: response[0]?.statusCode
    })
    return {
      success: true,
      statusCode: response[0]?.statusCode,
      messageId: response[0]?.headers?.['x-message-id']
    }
  } catch (error) {
    functions.logger.error('SendGrid error:', {
      to,
      subject,
      error: error.message,
      code: error.code,
      response: error.response?.body
    })

    // Re-throw with more context
    const enhancedError = new Error(`SendGrid error: ${error.message}`)
    enhancedError.code = error.code
    enhancedError.statusCode = error.response?.statusCode
    throw enhancedError
  }
}

/**
 * Send a batch of emails (up to 1000)
 *
 * @param {Array<Object>} messages - Array of email objects
 * @returns {Promise<Object>} - Results summary
 */
async function sendBatchEmails(messages) {
  if (!SENDGRID_API_KEY) {
    throw new Error('SendGrid API key not configured')
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('Messages array is required')
  }

  if (messages.length > 1000) {
    throw new Error('Maximum 1000 messages per batch')
  }

  const formattedMessages = messages.map(msg => ({
    to: msg.to,
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME
    },
    subject: msg.subject,
    text: msg.text || stripHtml(msg.html),
    html: msg.html || msg.text
  }))

  try {
    const response = await sgMail.send(formattedMessages)
    functions.logger.info('Batch emails sent', {
      count: messages.length,
      statusCode: response[0]?.statusCode
    })
    return {
      success: true,
      count: messages.length,
      statusCode: response[0]?.statusCode
    }
  } catch (error) {
    functions.logger.error('SendGrid batch error:', {
      count: messages.length,
      error: error.message
    })
    throw error
  }
}

/**
 * Validate email address format
 *
 * @param {string} email - Email address to validate
 * @returns {boolean} - Whether email format is valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Strip HTML tags from string
 *
 * @param {string} html - HTML string
 * @returns {string} - Plain text
 */
function stripHtml(html) {
  if (!html) return ''
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim()
}

module.exports = {
  sendEmail,
  sendBatchEmails,
  isValidEmail
}
