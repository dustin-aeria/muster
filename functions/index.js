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

// ============================================
// Safety Declaration AI Functions
// ============================================

const safetyDeclarationAI = require('./safetyDeclarationAI')

exports.askDeclarationQuestion = safetyDeclarationAI.askDeclarationQuestion
exports.verifyCalculation = safetyDeclarationAI.verifyCalculation
exports.recommendComplianceMethod = safetyDeclarationAI.recommendComplianceMethod
exports.generateRequirementGuidance = safetyDeclarationAI.generateRequirementGuidance
exports.analyzeEvidence = safetyDeclarationAI.analyzeEvidence
exports.getPreDeclarationGuidance = safetyDeclarationAI.getPreDeclarationGuidance

// ============================================
// SFOC & SORA AI Functions
// ============================================

const sfocSoraAI = require('./sfocSoraAI')

// SFOC Application Assistance
exports.askSFOCQuestion = sfocSoraAI.askSFOCQuestion
exports.getSFOCDocumentGuidance = sfocSoraAI.getSFOCDocumentGuidance

// SORA Assessment Assistance
exports.askSORAQuestion = sfocSoraAI.askSORAQuestion
exports.getSORAStepGuidance = sfocSoraAI.getSORAStepGuidance
exports.recommendMitigations = sfocSoraAI.recommendMitigations
exports.getOSOGuidance = sfocSoraAI.getOSOGuidance
exports.analyzeConOps = sfocSoraAI.analyzeConOps

// ============================================
// Export Enhancement Functions
// ============================================

const exportEnhancement = require('./exportEnhancement')

exports.enhanceExportContent = exportEnhancement.enhanceExportContent
exports.invalidateExportCache = exportEnhancement.invalidateExportCache
exports.getExportCacheStatus = exportEnhancement.getExportCacheStatus

// ============================================
// Team Notification Emails
// ============================================

/**
 * Get notification type display info
 */
function getNotificationTypeInfo(type) {
  const types = {
    go_no_go: {
      label: 'GO/NO GO Decision',
      color: '#10b981',
      description: 'Flight operations status update'
    },
    plan_approved: {
      label: 'Plan Approved',
      color: '#3b82f6',
      description: 'Project plan has been approved'
    },
    daily_plan: {
      label: 'Daily Plan',
      color: '#8b5cf6',
      description: 'Daily operations plan'
    },
    briefing: {
      label: 'Briefing',
      color: '#f59e0b',
      description: 'Team briefing notification'
    },
    safety_alert: {
      label: 'Safety Alert',
      color: '#ef4444',
      description: 'Important safety notification'
    },
    flightPlan: {
      label: 'Flight Plan',
      color: '#0ea5e9',
      description: 'Flight plan with GO/NO GO status'
    },
    custom: {
      label: 'Team Update',
      color: '#6b7280',
      description: 'Team notification'
    }
  }
  return types[type] || types.custom
}

/**
 * Send team notification emails to distribution list members
 * Triggered when a notification is created with email channel
 */
exports.sendTeamNotificationEmail = functions.firestore
  .document('notifications/{notificationId}')
  .onCreate(async (snap, context) => {
    const notification = snap.data()
    const notificationId = context.params.notificationId

    // Debug logging
    functions.logger.info('Email Function triggered:', {
      notificationId,
      type: notification.type,
      hasEmailRecipients: !!notification.emailRecipients,
      emailRecipientsCount: notification.emailRecipients?.length || 0
    })

    // Only process email_batch type notifications
    if (notification.type !== 'email_batch') {
      functions.logger.info('Skipping - not email_batch type:', notification.type)
      return null
    }

    // Skip if no email recipients
    if (!notification.emailRecipients || notification.emailRecipients.length === 0) {
      functions.logger.info('No email recipients for notification:', notificationId)
      return null
    }

    if (!resend) {
      functions.logger.error('Resend not configured for team notifications')
      await snap.ref.update({
        emailStatus: 'failed',
        emailError: 'Email service not configured'
      })
      return null
    }

    try {
      // Get project info if available
      let projectName = 'Project Update'
      let orgName = 'Your Organization'

      if (notification.projectId) {
        const projectDoc = await db.collection('projects').doc(notification.projectId).get()
        if (projectDoc.exists) {
          projectName = projectDoc.data().name || projectName
        }
      }

      if (notification.organizationId) {
        const orgDoc = await db.collection('organizations').doc(notification.organizationId).get()
        if (orgDoc.exists) {
          orgName = orgDoc.data().name || orgName
        }
      }

      // Get sender info
      let senderName = 'Team Member'
      if (notification.sentBy) {
        const senderDoc = await db.collection('operators').doc(notification.sentBy).get()
        if (senderDoc.exists) {
          const sender = senderDoc.data()
          senderName = sender.firstName ? `${sender.firstName} ${sender.lastName || ''}`.trim() : senderName
        }
      }

      const typeInfo = getNotificationTypeInfo(notification.type)
      const sentAt = notification.sentAt?.toDate?.() || new Date()
      const formattedDate = sentAt.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })

      // Build recipient list
      const recipients = notification.emailRecipients.filter(email => email && email.includes('@'))

      if (recipients.length === 0) {
        functions.logger.info('No valid email addresses:', notificationId)
        return null
      }

      // Prepare attachments if present
      const emailAttachments = (notification.attachments || []).map(att => ({
        filename: att.filename,
        content: att.content  // Base64 string
      }))

      // Send emails to all recipients
      const emailPromises = recipients.map(async (email) => {
        try {
          const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: `[${escapeHtml(projectName)}] ${typeInfo.label}`,
            attachments: emailAttachments.length > 0 ? emailAttachments : undefined,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f3f4f6;">
                <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">Muster</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">${escapeHtml(orgName)}</p>
                </div>

                <div style="background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-top: none;">
                  <!-- Type Badge -->
                  <div style="margin-bottom: 20px;">
                    <span style="display: inline-block; background: ${typeInfo.color}20; color: ${typeInfo.color}; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600;">
                      ${escapeHtml(typeInfo.label)}
                    </span>
                  </div>

                  <!-- Project Name -->
                  <h2 style="color: #1e3a5f; margin: 0 0 16px 0; font-size: 20px;">${escapeHtml(projectName)}</h2>

                  <!-- Message Content -->
                  ${notification.message ? `
                    <div style="background: #f9fafb; border-left: 4px solid ${typeInfo.color}; padding: 16px; margin-bottom: 20px; border-radius: 0 8px 8px 0;">
                      <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(notification.message)}</p>
                    </div>
                  ` : ''}

                  <!-- Status for GO/NO GO -->
                  ${notification.type === 'go_no_go' && notification.status ? `
                    <div style="text-align: center; padding: 20px; background: ${notification.status === 'go' ? '#dcfce7' : '#fee2e2'}; border-radius: 8px; margin-bottom: 20px;">
                      <span style="font-size: 32px; font-weight: bold; color: ${notification.status === 'go' ? '#16a34a' : '#dc2626'};">
                        ${notification.status === 'go' ? '✓ GO' : '✗ NO GO'}
                      </span>
                    </div>
                  ` : ''}

                  <!-- Metadata -->
                  <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 16px;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">
                      <strong>Sent by:</strong> ${escapeHtml(senderName)}
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #6b7280;">
                      <strong>Date:</strong> ${escapeHtml(formattedDate)}
                    </p>
                  </div>
                </div>

                <div style="background: #f9fafb; padding: 16px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
                  <a href="${APP_URL}/projects/${notification.projectId}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                    View Project
                  </a>
                </div>

                <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
                  You received this email because you're on a distribution list for this project.
                </p>
              </body>
              </html>
            `
          })

          if (error) {
            functions.logger.error('Failed to send to:', email, error)
            return { email, success: false, error: error.message }
          }

          return { email, success: true, messageId: data?.id }
        } catch (err) {
          functions.logger.error('Email send error:', email, err)
          return { email, success: false, error: err.message }
        }
      })

      const results = await Promise.all(emailPromises)
      const successCount = results.filter(r => r.success).length
      const failedCount = results.filter(r => !r.success).length

      functions.logger.info('Team notification emails sent:', {
        notificationId,
        total: recipients.length,
        success: successCount,
        failed: failedCount
      })

      // Update notification with email status
      await snap.ref.update({
        emailStatus: failedCount === 0 ? 'sent' : (successCount > 0 ? 'partial' : 'failed'),
        emailSentAt: admin.firestore.FieldValue.serverTimestamp(),
        emailResults: {
          total: recipients.length,
          success: successCount,
          failed: failedCount
        }
      })

      return { success: true, sent: successCount, failed: failedCount }

    } catch (error) {
      functions.logger.error('Team notification email error:', error)
      await snap.ref.update({
        emailStatus: 'failed',
        emailError: 'An error occurred while sending emails'
      })
      return { success: false, error: error.message }
    }
  })

// ============================================
// Team SMS Notifications (Twilio)
// ============================================

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER

let twilioClient = null
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  const twilio = require('twilio')
  twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
  functions.logger.info('Twilio client initialized successfully')
} else {
  functions.logger.warn('Twilio not configured. SMS sending will be disabled.')
}

/**
 * Send team notification SMS to distribution list members
 * Triggered when a notification is created with SMS recipients
 */
exports.sendTeamNotificationSMS = functions.firestore
  .document('notifications/{notificationId}')
  .onCreate(async (snap, context) => {
    const notification = snap.data()
    const notificationId = context.params.notificationId

    // Debug logging
    functions.logger.info('SMS Function triggered:', {
      notificationId,
      type: notification.type,
      hasSmsRecipients: !!notification.smsRecipients,
      smsRecipientsCount: notification.smsRecipients?.length || 0
    })

    // Only process email_batch type notifications that have SMS recipients
    if (notification.type !== 'email_batch') {
      functions.logger.info('Skipping - not email_batch type:', notification.type)
      return null
    }

    // Skip if no SMS recipients
    if (!notification.smsRecipients || notification.smsRecipients.length === 0) {
      functions.logger.info('Skipping - no SMS recipients')
      return null
    }

    if (!twilioClient) {
      functions.logger.error('Twilio not configured for SMS notifications')
      await snap.ref.update({
        smsStatus: 'failed',
        smsError: 'SMS service not configured'
      })
      return null
    }

    try {
      // Get project name
      let projectName = 'Muster Project'
      if (notification.projectId) {
        const projectDoc = await db.collection('projects').doc(notification.projectId).get()
        if (projectDoc.exists) {
          projectName = projectDoc.data().name || projectName
        }
      }

      // Build SMS message (keep it short for SMS)
      const typeInfo = getNotificationTypeInfo(notification.triggerEvent || 'custom')
      let smsBody = `[${projectName}] ${typeInfo.label}`

      // Add GO/NO GO status if applicable
      if (notification.status === 'go') {
        smsBody += '\n\n✓ STATUS: GO'
      } else if (notification.status === 'no_go') {
        smsBody += '\n\n✗ STATUS: NO GO'
      }

      // Add message preview (truncated for SMS)
      if (notification.message) {
        const truncatedMsg = notification.message.substring(0, 100)
        smsBody += `\n\n${truncatedMsg}${notification.message.length > 100 ? '...' : ''}`
      }

      smsBody += `\n\nView: ${APP_URL}/projects/${notification.projectId}`

      // Send SMS to all recipients
      const smsPromises = notification.smsRecipients.map(async (phone) => {
        // Normalize phone number (ensure it has country code)
        let formattedPhone = phone.replace(/[^\d+]/g, '')
        if (!formattedPhone.startsWith('+')) {
          // Assume North America if no country code
          formattedPhone = '+1' + formattedPhone.replace(/^1/, '')
        }

        try {
          const message = await twilioClient.messages.create({
            body: smsBody,
            from: TWILIO_PHONE_NUMBER,
            to: formattedPhone
          })

          functions.logger.info('SMS sent:', { to: formattedPhone, sid: message.sid })
          return { phone: formattedPhone, success: true, sid: message.sid }
        } catch (err) {
          functions.logger.error('SMS send error:', { phone: formattedPhone, error: err.message })
          return { phone: formattedPhone, success: false, error: err.message }
        }
      })

      const results = await Promise.all(smsPromises)
      const successCount = results.filter(r => r.success).length
      const failedCount = results.filter(r => !r.success).length

      functions.logger.info('Team notification SMS sent:', {
        notificationId,
        total: notification.smsRecipients.length,
        success: successCount,
        failed: failedCount
      })

      // Update notification with SMS status
      await snap.ref.update({
        smsStatus: failedCount === 0 ? 'sent' : (successCount > 0 ? 'partial' : 'failed'),
        smsSentAt: admin.firestore.FieldValue.serverTimestamp(),
        smsResults: {
          total: notification.smsRecipients.length,
          success: successCount,
          failed: failedCount
        }
      })

      return { success: true, sent: successCount, failed: failedCount }

    } catch (error) {
      functions.logger.error('Team notification SMS error:', error)
      await snap.ref.update({
        smsStatus: 'failed',
        smsError: 'An error occurred while sending SMS'
      })
      return { success: false, error: error.message }
    }
  })

// ============================================
// Q-Cards AI Study Assistant
// ============================================

const Anthropic = require('@anthropic-ai/sdk')

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
let anthropic = null
if (ANTHROPIC_API_KEY) {
  anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY })
  functions.logger.info('Anthropic SDK initialized for Q-Cards AI')
}

/**
 * Q-Cards AI Study Assistant
 * Answers questions about L1C RPAS flashcards
 */
// ============================================
// Training Content AI Functions
// ============================================

const trainingContentAI = require('./trainingContentAI')

exports.enhanceLessonContent = trainingContentAI.enhanceLessonContent
exports.generateQuizFromContent = trainingContentAI.generateQuizFromContent
exports.generateScenarioFromProcedure = trainingContentAI.generateScenarioFromProcedure
exports.generateFlashcardsFromContent = trainingContentAI.generateFlashcardsFromContent
exports.generateWrongAnswerExplanation = trainingContentAI.generateWrongAnswerExplanation
exports.generateScenarioDebrief = trainingContentAI.generateScenarioDebrief

// ============================================
// Study Recommendations Functions
// ============================================

const studyRecommendations = require('./studyRecommendations')

exports.analyzeUserPerformance = studyRecommendations.analyzeUserPerformance
exports.generateStudyPlan = studyRecommendations.generateStudyPlan
exports.getSpacedRepetitionSchedule = studyRecommendations.getSpacedRepetitionSchedule
exports.updateReviewItem = studyRecommendations.updateReviewItem
exports.addToReviewQueue = studyRecommendations.addToReviewQueue
exports.getNextQuestRecommendations = studyRecommendations.getNextQuestRecommendations

// ============================================
// Q-Cards AI Study Assistant
// ============================================

exports.askQCardQuestion = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    )
  }

  if (!anthropic) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'AI service not configured'
    )
  }

  const { question, card } = data
  const callerUid = context.auth.uid

  // Input validation
  if (!question || typeof question !== 'string' || question.length > 1000) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Valid question is required (max 1000 characters)'
    )
  }

  if (!card || !card.question || !card.answer) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Valid flashcard data is required'
    )
  }

  // Rate limiting
  const withinLimit = await checkRateLimit(callerUid, 'qcard_question')
  if (!withinLimit) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      'Too many requests. Please try again later.'
    )
  }

  const systemPrompt = `You are a knowledgeable RPAS (Remotely Piloted Aircraft Systems) instructor helping a student study for their Level 1 Complex Operations (L1C) certification in Canada.

The student is studying the following flashcard:

**Question:** ${escapeHtml(card.question)}

**Correct Answer:** ${escapeHtml(card.answer)}

**Category:** ${escapeHtml(card.category || 'General')}

Your role is to:
1. Help explain concepts in different ways if the student is confused
2. Provide real-world examples and practical scenarios
3. Connect this topic to related regulations (CARs, Standards 921/922/923, SORA)
4. Help the student understand WHY this information is important for safe BVLOS operations
5. Answer follow-up questions with accuracy

**FORMATTING REQUIREMENTS - IMPORTANT:**
- Use **bold** for key terms, numbers, and critical information
- Use bullet points (•) for lists of items
- Use numbered lists (1. 2. 3.) for sequential steps or processes
- Keep responses focused and concise (3-4 short paragraphs max)
- Start with the most important point first
- Include specific regulation references (e.g., "CAR 901.87", "Standard 922.08") when relevant

Example format:
**Key Point:** The main concept explained simply.

• First supporting detail
• Second supporting detail
• Third supporting detail

**Practical Application:** A real-world scenario or example.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        { role: 'user', content: question }
      ]
    })

    const responseText = response.content?.[0]?.text || 'No response generated.'

    functions.logger.info('Q-Card question answered', {
      userId: callerUid,
      questionLength: question.length,
      responseLength: responseText.length
    })

    return { success: true, response: responseText }

  } catch (error) {
    functions.logger.error('Q-Card AI error:', error)
    throw new functions.https.HttpsError(
      'internal',
      'Failed to get AI response. Please try again.'
    )
  }
})

// ============================================
// Gamification Functions
// ============================================

const gamification = require("./gamification")

exports.generateQuizQuestions = gamification.generateQuizQuestions
exports.generateWrongAnswerExplanation = gamification.generateWrongAnswerExplanation
exports.generateScenario = gamification.generateScenario
exports.generateScenarioDebrief = gamification.generateScenarioDebrief
exports.generateReadinessNudge = gamification.generateReadinessNudge
exports.generateTrendInsight = gamification.generateTrendInsight
exports.chunkDocumentContent = gamification.chunkDocumentContent
exports.generateLessonContent = gamification.generateLessonContent
exports.getAdaptiveDifficulty = gamification.getAdaptiveDifficulty

// ============================================
// AI Tutor for Training System
// ============================================

/**
 * AI Tutor - Context-aware learning assistant
 * Provides explanations, examples, and guidance during training
 */
exports.askAITutor = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    )
  }

  if (!anthropic) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'AI service not configured'
    )
  }

  const { message, context: tutorContext } = data
  const callerUid = context.auth.uid

  // Input validation
  if (!message || typeof message !== 'string' || message.length > 2000) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Valid message is required (max 2000 characters)'
    )
  }

  // Rate limiting
  const withinLimit = await checkRateLimit(callerUid, 'ai_tutor')
  if (!withinLimit) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      'Too many requests. Please try again later.'
    )
  }

  // Build context-aware system prompt
  let contextInfo = ''
  if (tutorContext?.lessonTitle) {
    contextInfo += `\nCurrent lesson: "${tutorContext.lessonTitle}"`
  }
  if (tutorContext?.questTitle) {
    contextInfo += `\nCurrent quest: "${tutorContext.questTitle}"`
  }
  if (tutorContext?.trackId) {
    contextInfo += `\nTraining track: ${tutorContext.trackId}`
  }
  if (tutorContext?.lessonContent) {
    contextInfo += `\n\nLesson content excerpt:\n${tutorContext.lessonContent.substring(0, 1500)}`
  }

  const systemPrompt = `You are an expert RPAS (Remotely Piloted Aircraft Systems) training instructor and AI tutor embedded within Muster, a field operations platform. Your role is to help students understand aviation safety concepts, Canadian RPAS regulations, and operational procedures.

${contextInfo ? `**Current Learning Context:**${contextInfo}` : ''}

**Your Capabilities:**
1. Explain complex concepts in clear, accessible language
2. Provide real-world examples from RPAS operations
3. Reference relevant Canadian regulations (CARs, Standards, SORA)
4. Connect topics to practical safety applications
5. Answer follow-up questions with accuracy
6. Encourage and support learners

**Response Guidelines:**
- Be concise but thorough (2-4 paragraphs typical)
- Use **bold** for key terms and important points
- Use bullet points for lists
- Include regulatory references when relevant (e.g., CAR 901.XX)
- Be encouraging and supportive
- If uncertain about specific regulations, say so rather than guessing

**Important Topics You Cover:**
- Safety Management Systems (SMS)
- Crew Resource Management (CRM)
- RPAS flight operations and procedures
- Canadian regulations (CARs Part IX, Standards 921/922/923)
- SORA methodology and risk assessment
- Wildlife and environmental considerations
- Emergency procedures
- Infrastructure inspection operations
- Marine and specialized operations`

  try {
    // Build conversation with history if provided
    const messages = []

    if (tutorContext?.conversationHistory) {
      for (const msg of tutorContext.conversationHistory.slice(-4)) {
        messages.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        })
      }
    }

    messages.push({ role: 'user', content: message })

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307', // Use Haiku for fast, cost-effective responses
      max_tokens: 1024,
      system: systemPrompt,
      messages
    })

    const responseText = response.content?.[0]?.text || 'No response generated.'

    functions.logger.info('AI Tutor question answered', {
      userId: callerUid,
      questionLength: message.length,
      responseLength: responseText.length,
      track: tutorContext?.trackId
    })

    // Extract any regulatory references mentioned
    const references = []
    const carMatches = responseText.match(/CAR\s*\d+\.\d+/gi) || []
    const standardMatches = responseText.match(/Standard\s*\d+\.\d+/gi) || []

    carMatches.forEach(match => {
      references.push({
        title: match,
        url: 'https://tc.canada.ca/en/corporate-services/acts-regulations/list-regulations/canadian-aviation-regulations-sor-96-433'
      })
    })

    standardMatches.forEach(match => {
      references.push({
        title: match,
        url: 'https://tc.canada.ca/en/aviation/publications/standards'
      })
    })

    return {
      success: true,
      response: responseText,
      references: references.slice(0, 3) // Limit to 3 references
    }

  } catch (error) {
    functions.logger.error('AI Tutor error:', error)
    throw new functions.https.HttpsError(
      'internal',
      'Failed to get AI response. Please try again.'
    )
  }
})
