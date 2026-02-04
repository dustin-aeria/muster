/**
 * Muster - Firebase Cloud Functions
 * Handles email notifications for team invitations
 *
 * @version 2.0.0
 */

const functions = require('firebase-functions/v1')
const admin = require('firebase-admin')
const { Resend } = require('resend')

// Initialize Firebase Admin
admin.initializeApp()

const db = admin.firestore()

// ============================================
// Security Helpers
// ============================================

/**
 * Escape HTML to prevent XSS in email templates
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  if (!text) return ''
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return String(text).replace(/[&<>"']/g, m => map[m])
}

/**
 * Rate limiting configuration
 */
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const MAX_RESENDS_PER_WINDOW = 5

/**
 * Check rate limit for an action
 * @param {string} key - Rate limit key
 * @param {string} action - Action name
 * @returns {Promise<boolean>} True if within limit
 */
async function checkRateLimit(key, action) {
  const rateLimitRef = db.collection('rateLimits').doc(`${action}_${key}`)
  const doc = await rateLimitRef.get()
  const now = Date.now()

  if (!doc.exists) {
    await rateLimitRef.set({
      count: 1,
      windowStart: now,
      lastAttempt: now
    })
    return true
  }

  const data = doc.data()

  // Reset window if expired
  if (now - data.windowStart > RATE_LIMIT_WINDOW_MS) {
    await rateLimitRef.set({
      count: 1,
      windowStart: now,
      lastAttempt: now
    })
    return true
  }

  // Check limit
  if (data.count >= MAX_RESENDS_PER_WINDOW) {
    return false
  }

  // Increment counter
  await rateLimitRef.update({
    count: admin.firestore.FieldValue.increment(1),
    lastAttempt: now
  })

  return true
}

// Initialize Resend - using environment variables
const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Muster <onboarding@resend.dev>'
const APP_URL = process.env.APP_URL || 'https://aeria-ops.vercel.app'

let resend = null
if (RESEND_API_KEY) {
  resend = new Resend(RESEND_API_KEY)
  functions.logger.info('Resend initialized successfully')
} else {
  functions.logger.warn('Resend API key not configured. Email sending will fail.')
}

/**
 * Firestore trigger: Send invitation email when a new member is invited
 * Triggered when a new organizationMembers document is created with status 'invited'
 */
exports.sendInvitationEmail = functions.firestore
  .document('organizationMembers/{memberId}')
  .onCreate(async (snap, context) => {
    const member = snap.data()
    const memberId = context.params.memberId

    // Only send email for invited members
    if (member.status !== 'invited') {
      functions.logger.info('Skipping email - member status is not invited:', memberId)
      return null
    }

    if (!member.email) {
      functions.logger.error('No email address for invitation:', memberId)
      return null
    }

    if (!resend) {
      functions.logger.error('Resend not configured, cannot send invitation email')
      await snap.ref.update({
        emailStatus: 'failed',
        emailError: 'Email service not configured'
      })
      return null
    }

    try {
      // Get organization name
      let orgName = 'your organization'
      if (member.organizationId) {
        const orgDoc = await db.collection('organizations').doc(member.organizationId).get()
        if (orgDoc.exists) {
          orgName = orgDoc.data().name || orgName
        }
      }

      // Get inviter name
      let inviterName = 'A team member'
      if (member.invitedBy) {
        const inviterDoc = await db.collection('operators').doc(member.invitedBy).get()
        if (inviterDoc.exists) {
          const inviter = inviterDoc.data()
          inviterName = inviter.firstName ? `${inviter.firstName} ${inviter.lastName || ''}`.trim() : inviterName
        }
      }

      const roleName = member.role === 'management' ? 'Management' :
                       member.role === 'operator' ? 'Operator' :
                       member.role === 'viewer' ? 'Viewer' : member.role

      // Send the invitation email
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: member.email,
        subject: `You've been invited to join ${orgName} on Muster`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Muster</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Field Operations Platform</p>
            </div>

            <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <h2 style="color: #1e3a5f; margin-top: 0;">You're Invited!</h2>

              <p>${escapeHtml(inviterName)} has invited you to join <strong>${escapeHtml(orgName)}</strong> on Muster as a <strong>${escapeHtml(roleName)}</strong>.</p>

              <p>Muster is a field operations platform for managing projects, safety, equipment, and team coordination.</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${APP_URL}/login" style="background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                  Accept Invitation
                </a>
              </div>

              <p style="color: #6b7280; font-size: 14px;">Simply sign up or log in with this email address (<strong>${escapeHtml(member.email)}</strong>) and you'll automatically be added to the organization.</p>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

              <p style="color: #9ca3af; font-size: 12px; margin-bottom: 0;">
                If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </div>
          </body>
          </html>
        `
      })

      if (error) {
        functions.logger.error('Resend error:', error)
        await snap.ref.update({
          emailStatus: 'failed',
          emailError: 'Email delivery failed' // Don't expose internal error details
        })
        return { success: false, error: 'Failed to send invitation email' }
      }

      functions.logger.info('Invitation email sent successfully:', {
        to: member.email,
        messageId: data?.id
      })

      // Update the invitation document with email status
      await snap.ref.update({
        emailStatus: 'sent',
        emailSentAt: admin.firestore.FieldValue.serverTimestamp(),
        emailMessageId: data?.id
      })

      return { success: true, messageId: data?.id }
    } catch (error) {
      functions.logger.error('Error sending invitation email:', error)

      await snap.ref.update({
        emailStatus: 'failed',
        emailError: 'An error occurred while sending the invitation'
      })

      return { success: false, error: 'An error occurred while sending the invitation' }
    }
  })

/**
 * HTTP endpoint: Resend invitation email
 * Includes authorization, rate limiting, and input validation
 */
exports.resendInvitationEmail = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    )
  }

  const { memberId } = data
  const callerUid = context.auth.uid

  // Input validation
  if (!memberId || typeof memberId !== 'string' || memberId.length > 255) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Valid member ID is required'
    )
  }

  if (!resend) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Email service not configured'
    )
  }

  try {
    const memberDoc = await db.collection('organizationMembers').doc(memberId).get()

    if (!memberDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Invitation not found')
    }

    const member = memberDoc.data()

    // AUTHORIZATION CHECK: Verify caller is member of same organization
    const callerMembershipId = `${callerUid}_${member.organizationId}`
    const callerMembership = await db.collection('organizationMembers').doc(callerMembershipId).get()

    if (!callerMembership.exists) {
      functions.logger.warn('Unauthorized resend attempt', { callerUid, memberId })
      throw new functions.https.HttpsError(
        'permission-denied',
        'You do not have permission to resend this invitation'
      )
    }

    const callerRole = callerMembership.data().role
    if (!['admin', 'management'].includes(callerRole)) {
      functions.logger.warn('Insufficient role for resend', { callerUid, callerRole, memberId })
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only administrators and management can resend invitations'
      )
    }

    // RATE LIMITING CHECK
    const withinLimit = await checkRateLimit(memberId, 'resend_invitation')
    if (!withinLimit) {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        'Too many resend attempts. Please try again later.'
      )
    }

    if (member.status !== 'invited') {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Member has already accepted the invitation'
      )
    }

    // Get organization name
    let orgName = 'your organization'
    if (member.organizationId) {
      const orgDoc = await db.collection('organizations').doc(member.organizationId).get()
      if (orgDoc.exists) {
        orgName = orgDoc.data().name || orgName
      }
    }

    const roleName = member.role === 'management' ? 'Management' :
                     member.role === 'operator' ? 'Operator' :
                     member.role === 'viewer' ? 'Viewer' : member.role

    // Send the invitation email
    const { data: emailData, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: member.email,
      subject: `Reminder: You've been invited to join ${orgName} on Muster`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Muster</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Field Operations Platform</p>
          </div>

          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <h2 style="color: #1e3a5f; margin-top: 0;">Reminder: You're Invited!</h2>

            <p>This is a reminder that you've been invited to join <strong>${escapeHtml(orgName)}</strong> on Muster as a <strong>${escapeHtml(roleName)}</strong>.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${APP_URL}/login" style="background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                Accept Invitation
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px;">Simply sign up or log in with this email address (<strong>${escapeHtml(member.email)}</strong>) and you'll automatically be added to the organization.</p>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

            <p style="color: #9ca3af; font-size: 12px; margin-bottom: 0;">
              If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </div>
        </body>
        </html>
      `
    })

    if (error) {
      functions.logger.error('Resend email error:', error)
      throw new functions.https.HttpsError('internal', 'Failed to send email')
    }

    // Update the invitation document
    await memberDoc.ref.update({
      emailStatus: 'sent',
      emailSentAt: admin.firestore.FieldValue.serverTimestamp(),
      emailMessageId: emailData?.id,
      emailResendCount: admin.firestore.FieldValue.increment(1)
    })

    return { success: true, messageId: emailData?.id }
  } catch (error) {
    // Re-throw HttpsError as-is, wrap other errors
    if (error instanceof functions.https.HttpsError) {
      throw error
    }
    functions.logger.error('Error resending invitation:', error)
    throw new functions.https.HttpsError('internal', 'An error occurred')
  }
})

// ============================================
// Receipt OCR Processing
// ============================================

const vision = require('@google-cloud/vision')

// Initialize Vision client (uses default credentials from Firebase)
let visionClient = null
function getVisionClient() {
  if (!visionClient) {
    visionClient = new vision.ImageAnnotatorClient()
  }
  return visionClient
}

/**
 * Extract amount from OCR text
 * Looks for currency patterns like $123.45, 123.45, CAD 123.45, etc.
 * @param {string} text - OCR extracted text
 * @returns {number|null} Extracted amount or null
 */
function extractAmount(text) {
  // Common patterns for amounts on receipts
  const patterns = [
    // Total patterns (prioritize these)
    /(?:total|amount|balance|due|paid)[\s:]*\$?\s*(\d{1,6}[.,]\d{2})/gi,
    /\$\s*(\d{1,6}[.,]\d{2})/g,
    /(?:CAD|USD|CDN)\s*\$?\s*(\d{1,6}[.,]\d{2})/gi,
    // Generic number patterns (last resort)
    /(\d{1,6}[.,]\d{2})/g
  ]

  let amounts = []

  for (const pattern of patterns) {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      const amount = parseFloat(match[1].replace(',', '.'))
      if (amount > 0 && amount < 100000) {
        amounts.push(amount)
      }
    }
  }

  // Return the largest amount (usually the total)
  if (amounts.length > 0) {
    return Math.max(...amounts)
  }

  return null
}

/**
 * Extract date from OCR text
 * Looks for date patterns
 * @param {string} text - OCR extracted text
 * @returns {string|null} Date in YYYY-MM-DD format or null
 */
function extractDate(text) {
  const patterns = [
    // MM/DD/YYYY or MM-DD-YYYY
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/g,
    // YYYY/MM/DD or YYYY-MM-DD
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/g,
    // Month DD, YYYY
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})/gi,
    // DD Month YYYY
    /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{4})/gi
  ]

  const monthMap = {
    'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
    'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
    'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
  }

  for (const pattern of patterns) {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      let year, month, day

      if (/^\d{4}$/.test(match[1])) {
        // YYYY/MM/DD format
        year = match[1]
        month = match[2].padStart(2, '0')
        day = match[3].padStart(2, '0')
      } else if (/^\d{1,2}$/.test(match[1]) && /^\d{1,2}$/.test(match[2])) {
        // MM/DD/YYYY format
        month = match[1].padStart(2, '0')
        day = match[2].padStart(2, '0')
        year = match[3]
      } else if (/^[a-z]/i.test(match[1])) {
        // Month DD, YYYY format
        month = monthMap[match[1].toLowerCase().substring(0, 3)]
        day = match[2].padStart(2, '0')
        year = match[3]
      } else if (/^[a-z]/i.test(match[2])) {
        // DD Month YYYY format
        day = match[1].padStart(2, '0')
        month = monthMap[match[2].toLowerCase().substring(0, 3)]
        year = match[3]
      }

      // Validate date
      const yearNum = parseInt(year)
      const monthNum = parseInt(month)
      const dayNum = parseInt(day)

      if (yearNum >= 2020 && yearNum <= 2030 &&
          monthNum >= 1 && monthNum <= 12 &&
          dayNum >= 1 && dayNum <= 31) {
        return `${year}-${month}-${day}`
      }
    }
  }

  return null
}

/**
 * Extract vendor name from OCR text
 * Usually the first few lines of receipt contain the store name
 * @param {string} text - OCR extracted text
 * @returns {string|null} Vendor name or null
 */
function extractVendor(text) {
  const lines = text.split('\n').filter(line => line.trim().length > 2)

  // Skip common header words
  const skipWords = ['receipt', 'invoice', 'tax', 'gst', 'hst', 'pst', 'total', 'date', 'time', 'tel', 'phone', 'fax']

  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim()

    // Skip if it's mostly numbers or too short
    if (/^\d+$/.test(line.replace(/[\s\-\.]/g, ''))) continue
    if (line.length < 3 || line.length > 50) continue

    // Skip common non-vendor lines
    const lowerLine = line.toLowerCase()
    if (skipWords.some(word => lowerLine.startsWith(word))) continue
    if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(line)) continue // Date
    if (/^\$?\d+[.,]\d{2}$/.test(line)) continue // Amount

    // Clean up the line
    const cleaned = line.replace(/[#*=\-_]+/g, '').trim()
    if (cleaned.length >= 3) {
      return cleaned.substring(0, 100) // Cap at 100 chars
    }
  }

  return null
}

/**
 * Firestore trigger: Process receipt image with OCR when expense is created/updated
 * Triggered when an expense document is written with ocrStatus 'pending'
 */
exports.processReceiptOCR = functions.firestore
  .document('expenses/{expenseId}')
  .onWrite(async (change, context) => {
    const expenseId = context.params.expenseId

    // Skip if document was deleted
    if (!change.after.exists) {
      functions.logger.info('Expense deleted, skipping OCR:', expenseId)
      return null
    }

    const expense = change.after.data()
    const previousData = change.before.exists ? change.before.data() : null

    // Only process if ocrStatus is 'pending' and we have a receipt URL
    if (expense.ocrStatus !== 'pending') {
      return null
    }

    if (!expense.receipt?.url) {
      functions.logger.info('No receipt URL, skipping OCR:', expenseId)
      await change.after.ref.update({
        ocrStatus: 'skipped',
        'ocrData.processedAt': admin.firestore.FieldValue.serverTimestamp()
      })
      return null
    }

    // Prevent reprocessing if URL hasn't changed
    if (previousData?.receipt?.url === expense.receipt?.url &&
        previousData?.ocrStatus === 'processing') {
      functions.logger.info('Already processing this receipt:', expenseId)
      return null
    }

    functions.logger.info('Starting OCR processing for expense:', expenseId)

    try {
      // Mark as processing
      await change.after.ref.update({
        ocrStatus: 'processing'
      })

      // Call Google Cloud Vision API
      const client = getVisionClient()
      const [result] = await client.textDetection(expense.receipt.url)

      const detections = result.textAnnotations
      if (!detections || detections.length === 0) {
        functions.logger.info('No text detected in receipt:', expenseId)
        await change.after.ref.update({
          ocrStatus: 'completed',
          ocrData: {
            rawText: null,
            extractedVendor: null,
            extractedAmount: null,
            extractedDate: null,
            confidence: 0,
            processedAt: admin.firestore.FieldValue.serverTimestamp()
          }
        })
        return null
      }

      // First annotation contains the full text
      const fullText = detections[0].description || ''
      const confidence = result.textAnnotations[0]?.confidence || 0.8

      functions.logger.info('OCR text extracted:', {
        expenseId,
        textLength: fullText.length,
        confidence
      })

      // Extract data from text
      const extractedVendor = extractVendor(fullText)
      const extractedAmount = extractAmount(fullText)
      const extractedDate = extractDate(fullText)

      functions.logger.info('OCR extraction results:', {
        expenseId,
        extractedVendor,
        extractedAmount,
        extractedDate
      })

      // Update expense with OCR data
      await change.after.ref.update({
        ocrStatus: 'completed',
        ocrData: {
          rawText: fullText.substring(0, 5000), // Limit storage
          extractedVendor,
          extractedAmount,
          extractedDate,
          confidence: confidence * 100, // Store as percentage
          processedAt: admin.firestore.FieldValue.serverTimestamp()
        }
      })

      functions.logger.info('OCR processing completed:', expenseId)
      return { success: true, expenseId }

    } catch (error) {
      functions.logger.error('OCR processing failed:', {
        expenseId,
        error: error.message
      })

      await change.after.ref.update({
        ocrStatus: 'failed',
        ocrData: {
          rawText: null,
          extractedVendor: null,
          extractedAmount: null,
          extractedDate: null,
          confidence: 0,
          error: error.message,
          processedAt: admin.firestore.FieldValue.serverTimestamp()
        }
      })

      return { success: false, error: error.message }
    }
  })
