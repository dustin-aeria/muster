/**
 * Muster - Firebase Cloud Functions
 * Handles email notifications for team invitations
 *
 * @version 2.0.0
 */

const functions = require('firebase-functions')
const admin = require('firebase-admin')
const { Resend } = require('resend')

// Initialize Firebase Admin
admin.initializeApp()

const db = admin.firestore()

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

              <p>${inviterName} has invited you to join <strong>${orgName}</strong> on Muster as a <strong>${roleName}</strong>.</p>

              <p>Muster is a field operations platform for managing projects, safety, equipment, and team coordination.</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${APP_URL}/login" style="background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                  Accept Invitation
                </a>
              </div>

              <p style="color: #6b7280; font-size: 14px;">Simply sign up or log in with this email address (<strong>${member.email}</strong>) and you'll automatically be added to the organization.</p>

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
          emailError: error.message
        })
        return { success: false, error: error.message }
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
        emailError: error.message
      })

      return { success: false, error: error.message }
    }
  })

/**
 * HTTP endpoint: Resend invitation email
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

  if (!memberId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Member ID is required'
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

            <p>This is a reminder that you've been invited to join <strong>${orgName}</strong> on Muster as a <strong>${roleName}</strong>.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${APP_URL}/login" style="background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                Accept Invitation
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px;">Simply sign up or log in with this email address (<strong>${member.email}</strong>) and you'll automatically be added to the organization.</p>

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
      throw new functions.https.HttpsError('internal', error.message)
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
    functions.logger.error('Error resending invitation:', error)
    throw new functions.https.HttpsError('internal', error.message)
  }
})
