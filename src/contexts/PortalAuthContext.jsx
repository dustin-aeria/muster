/**
 * PortalAuthContext.jsx
 * Authentication context for Client Portal
 * Uses magic links (passwordless) for client authentication
 *
 * @location src/contexts/PortalAuthContext.jsx
 */

import { createContext, useContext, useState, useEffect } from 'react'
import {
  getPortalUserByEmail,
  getPortalUserById,
  createMagicLinkSession,
  verifyMagicLinkToken,
  recordPortalUserLogin,
  getClientForPortal,
  validatePortalSession
} from '../lib/firestorePortal'
import { logger } from '../lib/logger'

// ============================================
// CONTEXT
// ============================================

const PortalAuthContext = createContext(null)

// Storage key for portal session
const PORTAL_SESSION_KEY = 'aeria_portal_session'

// ============================================
// PROVIDER
// ============================================

export function PortalAuthProvider({ children }) {
  const [portalUser, setPortalUser] = useState(null)
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession()
  }, [])

  /**
   * Check for existing session in localStorage
   * Performs server-side validation to ensure session is still valid
   */
  const checkExistingSession = async () => {
    try {
      const sessionData = localStorage.getItem(PORTAL_SESSION_KEY)
      if (!sessionData) {
        setLoading(false)
        return
      }

      const session = JSON.parse(sessionData)

      // Client-side expiry check (server will also validate)
      if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
        localStorage.removeItem(PORTAL_SESSION_KEY)
        setLoading(false)
        return
      }

      // SERVER-SIDE VALIDATION - verify session is still valid
      const validation = await validatePortalSession(
        session.portalUserId,
        session.clientId
      )

      if (!validation.valid) {
        logger.warn('Session validation failed:', validation.error)
        localStorage.removeItem(PORTAL_SESSION_KEY)
        setLoading(false)
        return
      }

      // Session is valid - use the validated user data
      const user = validation.user

      // Fetch client data
      const clientData = await getClientForPortal(user.clientId)
      if (!clientData) {
        localStorage.removeItem(PORTAL_SESSION_KEY)
        setLoading(false)
        return
      }

      setPortalUser(user)
      setClient(clientData)
    } catch (err) {
      logger.error('Failed to check portal session:', err)
      localStorage.removeItem(PORTAL_SESSION_KEY)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Request a magic link for login
   * @param {string} email - User email
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const requestMagicLink = async (email) => {
    try {
      setError(null)

      // Find portal user by email
      const user = await getPortalUserByEmail(email)
      if (!user) {
        return {
          success: false,
          error: 'No account found with this email address. Please contact your service provider.'
        }
      }

      if (user.status === 'disabled') {
        return {
          success: false,
          error: 'Your account has been disabled. Please contact your service provider.'
        }
      }

      // Create magic link session
      const session = await createMagicLinkSession({
        portalUserId: user.id,
        clientId: user.clientId,
        email: user.email,
        type: 'login'
      })

      // In production, this would send an email
      // For now, we'll log the token and return the magic link URL
      const magicLinkUrl = `${window.location.origin}/portal/verify?token=${session.token}`

      logger.info('Magic link generated:', magicLinkUrl)

      // PRODUCTION: Integrate email service to send magic link
      // Options: Firebase Extensions (Trigger Email), SendGrid, or AWS SES
      // Example implementation:
      // await sendMagicLinkEmail({
      //   to: user.email,
      //   subject: 'Your Aeria Ops Login Link',
      //   magicLinkUrl,
      //   expiresIn: '15 minutes'
      // })
      //
      // For now, magic link URL is returned in dev mode for testing

      return {
        success: true,
        // For development, include the URL
        magicLinkUrl: import.meta.env.DEV ? magicLinkUrl : undefined
      }
    } catch (err) {
      logger.error('Failed to request magic link:', err)
      return {
        success: false,
        error: 'Failed to send login link. Please try again.'
      }
    }
  }

  /**
   * Verify magic link token and log in
   * @param {string} token - Magic link token
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const verifyAndLogin = async (token) => {
    try {
      setError(null)
      setLoading(true)

      // Verify token
      const session = await verifyMagicLinkToken(token)
      if (!session) {
        return {
          success: false,
          error: 'This login link is invalid or has expired. Please request a new one.'
        }
      }

      // Get user data
      const user = await getPortalUserById(session.portalUserId)
      if (!user || user.status === 'disabled') {
        return {
          success: false,
          error: 'Your account is not active. Please contact your service provider.'
        }
      }

      // Get client data
      const clientData = await getClientForPortal(user.clientId)
      if (!clientData) {
        return {
          success: false,
          error: 'Client not found. Please contact your service provider.'
        }
      }

      // Record login
      await recordPortalUserLogin(user.id)

      // Store session
      const sessionExpiry = new Date()
      sessionExpiry.setDate(sessionExpiry.getDate() + 7) // 7 days

      localStorage.setItem(PORTAL_SESSION_KEY, JSON.stringify({
        portalUserId: user.id,
        clientId: user.clientId,
        expiresAt: sessionExpiry.toISOString()
      }))

      // Update state
      setPortalUser({ ...user, lastLoginAt: new Date() })
      setClient(clientData)

      return { success: true }
    } catch (err) {
      logger.error('Failed to verify magic link:', err)
      return {
        success: false,
        error: 'Failed to verify login link. Please try again.'
      }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Log out of portal
   */
  const logout = () => {
    localStorage.removeItem(PORTAL_SESSION_KEY)
    setPortalUser(null)
    setClient(null)
  }

  /**
   * Refresh client data
   */
  const refreshClient = async () => {
    if (!portalUser?.clientId) return

    try {
      const clientData = await getClientForPortal(portalUser.clientId)
      if (clientData) {
        setClient(clientData)
      }
    } catch (err) {
      logger.error('Failed to refresh client:', err)
    }
  }

  // Context value
  const value = {
    portalUser,
    client,
    loading,
    error,
    isAuthenticated: !!portalUser,
    requestMagicLink,
    verifyAndLogin,
    logout,
    refreshClient
  }

  return (
    <PortalAuthContext.Provider value={value}>
      {children}
    </PortalAuthContext.Provider>
  )
}

// ============================================
// HOOK
// ============================================

export function usePortalAuth() {
  const context = useContext(PortalAuthContext)
  if (!context) {
    throw new Error('usePortalAuth must be used within a PortalAuthProvider')
  }
  return context
}
