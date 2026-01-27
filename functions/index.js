/**
 * Aeria Ops - Firebase Cloud Functions
 * Handles email and SMS notifications for team communication
 *
 * @version 1.0.0
 */

const functions = require('firebase-functions')
const admin = require('firebase-admin')

// Initialize Firebase Admin
admin.initializeApp()

const db = admin.firestore()

// Import notification handlers
const { sendEmail } = require('./sendEmail')
const { sendSMS } = require('./sendSMS')

/**
 * Firestore trigger: Process new notifications
 * Triggered when a new notification document is created
 */
exports.processNotification = functions.firestore
  .document('notifications/{notificationId}')
  .onCreate(async (snap, context) => {
    const notification = snap.data()
    const notificationId = context.params.notificationId

    functions.logger.info('Processing notification:', notificationId)

    const results = {
      email: null,
      sms: null
    }

    try {
      // Process email if pending
      if (notification.deliveryStatus?.email === 'pending') {
        const recipientEmail = notification.recipientInfo?.email

        if (recipientEmail) {
          try {
            await sendEmail({
              to: recipientEmail,
              subject: notification.title,
              text: notification.body,
              html: formatEmailHtml(notification)
            })

            results.email = 'sent'
            functions.logger.info('Email sent successfully to:', recipientEmail)
          } catch (emailError) {
            results.email = 'failed'
            functions.logger.error('Email failed:', emailError.message)
          }
        } else {
          results.email = 'failed'
          functions.logger.warn('No email address for notification:', notificationId)
        }
      }

      // Process SMS if pending
      if (notification.deliveryStatus?.sms === 'pending') {
        const recipientPhone = notification.recipientInfo?.phone

        if (recipientPhone) {
          try {
            const smsBody = formatSmsMessage(notification)
            await sendSMS({
              to: recipientPhone,
              body: smsBody
            })

            results.sms = 'sent'
            functions.logger.info('SMS sent successfully to:', recipientPhone)
          } catch (smsError) {
            results.sms = 'failed'
            functions.logger.error('SMS failed:', smsError.message)
          }
        } else {
          results.sms = 'failed'
          functions.logger.warn('No phone number for notification:', notificationId)
        }
      }

      // Update notification with delivery results
      const updateData = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }

      if (results.email) {
        updateData['deliveryStatus.email'] = results.email
      }
      if (results.sms) {
        updateData['deliveryStatus.sms'] = results.sms
      }

      await snap.ref.update(updateData)

      return { success: true, results }
    } catch (error) {
      functions.logger.error('Error processing notification:', error)

      // Update notification with error status
      await snap.ref.update({
        'deliveryStatus.error': error.message,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      })

      return { success: false, error: error.message }
    }
  })

/**
 * HTTP endpoint: Manually trigger notification send
 * Useful for retrying failed notifications
 */
exports.retryNotification = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    )
  }

  const { notificationId, channels } = data

  if (!notificationId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Notification ID is required'
    )
  }

  const notificationRef = db.collection('notifications').doc(notificationId)
  const notificationSnap = await notificationRef.get()

  if (!notificationSnap.exists) {
    throw new functions.https.HttpsError(
      'not-found',
      'Notification not found'
    )
  }

  const notification = notificationSnap.data()
  const results = { email: null, sms: null }

  // Retry email if requested
  if (channels?.includes('email') && notification.recipientInfo?.email) {
    try {
      await sendEmail({
        to: notification.recipientInfo.email,
        subject: notification.title,
        text: notification.body,
        html: formatEmailHtml(notification)
      })
      results.email = 'sent'
    } catch (error) {
      results.email = 'failed'
      functions.logger.error('Email retry failed:', error)
    }
  }

  // Retry SMS if requested
  if (channels?.includes('sms') && notification.recipientInfo?.phone) {
    try {
      await sendSMS({
        to: notification.recipientInfo.phone,
        body: formatSmsMessage(notification)
      })
      results.sms = 'sent'
    } catch (error) {
      results.sms = 'failed'
      functions.logger.error('SMS retry failed:', error)
    }
  }

  // Update delivery status
  const updateData = {
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }
  if (results.email) updateData['deliveryStatus.email'] = results.email
  if (results.sms) updateData['deliveryStatus.sms'] = results.sms

  await notificationRef.update(updateData)

  return { success: true, results }
})

/**
 * Scheduled function: Process any stuck pending notifications
 * Runs every hour to catch any missed notifications
 */
exports.processStuckNotifications = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    functions.logger.info('Running stuck notification processor')

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

    // Find notifications stuck in pending state
    const pendingEmailQuery = db.collection('notifications')
      .where('deliveryStatus.email', '==', 'pending')
      .where('createdAt', '<', oneHourAgo)
      .limit(50)

    const pendingSmsQuery = db.collection('notifications')
      .where('deliveryStatus.sms', '==', 'pending')
      .where('createdAt', '<', oneHourAgo)
      .limit(50)

    const [emailSnap, smsSnap] = await Promise.all([
      pendingEmailQuery.get(),
      pendingSmsQuery.get()
    ])

    const processedIds = new Set()
    let processed = 0

    // Process stuck email notifications
    for (const doc of emailSnap.docs) {
      if (processedIds.has(doc.id)) continue
      processedIds.add(doc.id)

      const notification = doc.data()
      if (notification.recipientInfo?.email) {
        try {
          await sendEmail({
            to: notification.recipientInfo.email,
            subject: notification.title,
            text: notification.body,
            html: formatEmailHtml(notification)
          })
          await doc.ref.update({
            'deliveryStatus.email': 'sent',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          })
          processed++
        } catch (error) {
          await doc.ref.update({
            'deliveryStatus.email': 'failed',
            'deliveryStatus.emailError': error.message,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          })
        }
      }
    }

    // Process stuck SMS notifications
    for (const doc of smsSnap.docs) {
      if (processedIds.has(doc.id)) continue
      processedIds.add(doc.id)

      const notification = doc.data()
      if (notification.recipientInfo?.phone) {
        try {
          await sendSMS({
            to: notification.recipientInfo.phone,
            body: formatSmsMessage(notification)
          })
          await doc.ref.update({
            'deliveryStatus.sms': 'sent',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          })
          processed++
        } catch (error) {
          await doc.ref.update({
            'deliveryStatus.sms': 'failed',
            'deliveryStatus.smsError': error.message,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          })
        }
      }
    }

    functions.logger.info(`Processed ${processed} stuck notifications`)
    return null
  })

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format notification as HTML email
 */
function formatEmailHtml(notification) {
  const eventLabels = {
    goNoGo: 'GO/NO GO Decision',
    planApproved: 'Plan Approved',
    dailyPlan: 'Daily Briefing'
  }

  const eventLabel = eventLabels[notification.triggerEvent] || 'Notification'
  const projectLink = notification.eventData?.projectLink || ''

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${notification.title}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 20px;">${notification.title}</h1>
    <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">${eventLabel}</p>
  </div>

  <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
    <pre style="white-space: pre-wrap; font-family: inherit; margin: 0; background: white; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb;">${notification.body}</pre>

    ${projectLink ? `
    <div style="margin-top: 20px; text-align: center;">
      <a href="${projectLink}" style="display: inline-block; background: #1e3a5f; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500;">View Project</a>
    </div>
    ` : ''}
  </div>

  <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
    <p>This is an automated notification from Aeria Ops.</p>
    <p>Aeria Intelligence Inc.</p>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Format notification as SMS message (character limit aware)
 */
function formatSmsMessage(notification) {
  const maxLength = 160 // Standard SMS length

  // Create a concise version for SMS
  let message = notification.title

  // Add key info based on event type
  if (notification.triggerEvent === 'goNoGo') {
    const decision = notification.eventData?.decision || ''
    message = `${notification.eventData?.projectName || 'Project'}: ${decision}`
    if (notification.eventData?.notes && message.length < 120) {
      message += ` - ${notification.eventData.notes}`
    }
  } else if (notification.triggerEvent === 'planApproved') {
    message = `${notification.eventData?.projectName || 'Project'} plan approved by ${notification.eventData?.approver || 'reviewer'}`
  }

  // Truncate if necessary
  if (message.length > maxLength - 3) {
    message = message.substring(0, maxLength - 3) + '...'
  }

  return message
}
