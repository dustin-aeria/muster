/**
 * Aeria Ops - Firebase Cloud Functions
 * Handles notifications for team communication
 *
 * NOTE: Email/SMS sending is disabled. Only in-app notifications are active.
 * To enable email/SMS, configure SendGrid/Twilio and uncomment the send calls.
 *
 * @version 1.0.0
 */

const functions = require('firebase-functions')
const admin = require('firebase-admin')

// Initialize Firebase Admin
admin.initializeApp()

const db = admin.firestore()

// Email/SMS disabled - uncomment these when ready to enable
// const { sendEmail } = require('./sendEmail')
// const { sendSMS } = require('./sendSMS')

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
      // Email sending disabled - mark as such
      if (notification.deliveryStatus?.email === 'pending') {
        results.email = 'disabled'
        functions.logger.info('Email sending disabled, skipping:', notificationId)
      }

      // SMS sending disabled - mark as such
      if (notification.deliveryStatus?.sms === 'pending') {
        results.sms = 'disabled'
        functions.logger.info('SMS sending disabled, skipping:', notificationId)
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

      await snap.ref.update({
        'deliveryStatus.error': error.message,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      })

      return { success: false, error: error.message }
    }
  })

/**
 * HTTP endpoint: Manually trigger notification send
 * Currently disabled - returns message about feature being disabled
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

  // Email/SMS disabled
  return {
    success: false,
    message: 'Email/SMS sending is currently disabled. Only in-app notifications are active.',
    channels: channels || []
  }
})

/**
 * Scheduled function: Cleanup for stuck notifications
 * Marks stuck pending notifications as disabled
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

    // Mark stuck email notifications as disabled
    for (const doc of emailSnap.docs) {
      if (processedIds.has(doc.id)) continue
      processedIds.add(doc.id)

      await doc.ref.update({
        'deliveryStatus.email': 'disabled',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      })
      processed++
    }

    // Mark stuck SMS notifications as disabled
    for (const doc of smsSnap.docs) {
      if (processedIds.has(doc.id)) continue
      processedIds.add(doc.id)

      await doc.ref.update({
        'deliveryStatus.sms': 'disabled',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      })
      processed++
    }

    functions.logger.info(`Marked ${processed} stuck notifications as disabled`)
    return null
  })
