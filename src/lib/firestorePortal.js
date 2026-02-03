/**
 * firestorePortal.js
 * Firebase Firestore data access layer for Client Portal
 *
 * Collections:
 * - clients: Client companies (updated with portal fields)
 * - portalUsers: Individual client users who can log in
 * - portalSessions: Magic link sessions
 *
 * @location src/lib/firestorePortal.js
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from './firebase'
import { logger } from './logger'

// ============================================
// COLLECTION REFERENCES
// ============================================

const clientsRef = collection(db, 'clients')
const portalUsersRef = collection(db, 'portalUsers')
const portalSessionsRef = collection(db, 'portalSessions')

// ============================================
// PORTAL USERS
// ============================================

/**
 * Portal user structure:
 * {
 *   id: string,
 *   clientId: string,
 *   email: string,
 *   name: string,
 *   role: 'admin' | 'viewer',
 *   status: 'pending' | 'active' | 'disabled',
 *   invitedBy: string,
 *   invitedAt: Timestamp,
 *   acceptedAt: Timestamp | null,
 *   lastLoginAt: Timestamp | null,
 *   createdAt: Timestamp,
 *   updatedAt: Timestamp
 * }
 */

/**
 * Get portal user by email
 * @param {string} email - User email
 * @returns {Promise<Object|null>}
 */
export async function getPortalUserByEmail(email) {
  const q = query(
    portalUsersRef,
    where('email', '==', email.toLowerCase()),
    limit(1)
  )
  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    return null
  }

  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
}

/**
 * Get portal user by ID
 * @param {string} id - User ID
 * @returns {Promise<Object|null>}
 */
export async function getPortalUserById(id) {
  const docRef = doc(db, 'portalUsers', id)
  const snapshot = await getDoc(docRef)

  if (!snapshot.exists()) {
    return null
  }

  return { id: snapshot.id, ...snapshot.data() }
}

/**
 * Get all portal users for a client
 * @param {string} clientId - Client ID
 * @returns {Promise<Array>}
 */
export async function getPortalUsersByClient(clientId) {
  const q = query(
    portalUsersRef,
    where('clientId', '==', clientId)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Create a portal user (invite)
 * @param {Object} data - User data
 * @returns {Promise<Object>}
 */
export async function createPortalUser(data) {
  const user = {
    clientId: data.clientId,
    email: data.email.toLowerCase(),
    name: data.name || '',
    role: data.role || 'viewer',
    status: 'pending',
    invitedBy: data.invitedBy,
    invitedAt: serverTimestamp(),
    acceptedAt: null,
    lastLoginAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  const docRef = await addDoc(portalUsersRef, user)
  return { id: docRef.id, ...user }
}

/**
 * Update a portal user
 * @param {string} id - User ID
 * @param {Object} data - Updated data
 */
export async function updatePortalUser(id, data) {
  const docRef = doc(db, 'portalUsers', id)
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  })
}

/**
 * Delete a portal user
 * @param {string} id - User ID
 */
export async function deletePortalUser(id) {
  const docRef = doc(db, 'portalUsers', id)
  await deleteDoc(docRef)
}

/**
 * Record login for portal user
 * @param {string} id - User ID
 */
export async function recordPortalUserLogin(id) {
  const docRef = doc(db, 'portalUsers', id)
  await updateDoc(docRef, {
    lastLoginAt: serverTimestamp(),
    status: 'active', // Mark as active on first login
    acceptedAt: serverTimestamp(), // Set accepted time if first login
    updatedAt: serverTimestamp()
  })
}

// ============================================
// MAGIC LINK SESSIONS
// ============================================

/**
 * Session structure:
 * {
 *   id: string,
 *   portalUserId: string,
 *   clientId: string,
 *   email: string,
 *   token: string (unique random token),
 *   type: 'login' | 'invite',
 *   status: 'pending' | 'used' | 'expired',
 *   createdAt: Timestamp,
 *   expiresAt: Timestamp,
 *   usedAt: Timestamp | null
 * }
 */

/**
 * Generate a cryptographically secure random token
 * Uses Web Crypto API for secure random values
 * @returns {string} 64-character URL-safe base64 token
 */
function generateToken() {
  const array = new Uint8Array(48) // 48 bytes = 64 base64 characters
  crypto.getRandomValues(array)

  // Convert to base64 and make URL-safe
  const base64 = btoa(String.fromCharCode.apply(null, array))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

/**
 * Hash a token for secure storage
 * Never store plain tokens - only store hashes
 * @param {string} token - Plain token
 * @returns {Promise<string>} SHA-256 hash of token
 */
async function hashToken(token) {
  const encoder = new TextEncoder()
  const data = encoder.encode(token)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Create a magic link session
 * Stores hashed token for security - plain token only returned once
 * @param {Object} data - Session data
 * @returns {Promise<Object>}
 */
export async function createMagicLinkSession(data) {
  const token = generateToken()
  const tokenHash = await hashToken(token)
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000) // 15 minutes (more secure)

  const session = {
    portalUserId: data.portalUserId,
    clientId: data.clientId,
    email: data.email.toLowerCase(),
    tokenHash, // Store hash, never plain token
    type: data.type || 'login',
    status: 'pending',
    createdAt: serverTimestamp(),
    expiresAt: Timestamp.fromDate(expiresAt),
    usedAt: null
  }

  const docRef = await addDoc(portalSessionsRef, session)

  // Return plain token only once - for sending in email
  // This is the only time the plain token exists
  return { id: docRef.id, ...session, token }
}

/**
 * Verify and consume a magic link token
 * Hashes the provided token and compares with stored hash
 * @param {string} token - The magic link token (plain text from URL)
 * @returns {Promise<Object|null>} - Session data if valid, null if invalid/expired
 */
export async function verifyMagicLinkToken(token) {
  if (!token || typeof token !== 'string') {
    return null
  }

  // Hash the provided token to compare with stored hash
  const tokenHash = await hashToken(token)

  const q = query(
    portalSessionsRef,
    where('tokenHash', '==', tokenHash),
    where('status', '==', 'pending'),
    limit(1)
  )
  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    return null
  }

  const sessionDoc = snapshot.docs[0]
  const session = { id: sessionDoc.id, ...sessionDoc.data() }

  // Check if expired
  const expiresAt = session.expiresAt?.toDate ? session.expiresAt.toDate() : new Date(session.expiresAt)
  if (expiresAt < new Date()) {
    // Mark as expired
    await updateDoc(doc(db, 'portalSessions', session.id), {
      status: 'expired',
      expiredAt: serverTimestamp()
    })
    return null
  }

  // Mark as used (one-time use)
  await updateDoc(doc(db, 'portalSessions', session.id), {
    status: 'used',
    usedAt: serverTimestamp()
  })

  return session
}

/**
 * Get session by token (without consuming)
 * @param {string} token - The magic link token (plain text)
 * @returns {Promise<Object|null>}
 */
export async function getSessionByToken(token) {
  if (!token || typeof token !== 'string') {
    return null
  }

  const tokenHash = await hashToken(token)

  const q = query(
    portalSessionsRef,
    where('tokenHash', '==', tokenHash),
    limit(1)
  )
  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    return null
  }

  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
}

/**
 * Validate portal session server-side
 * Call this to verify a user's session is still valid
 * @param {string} portalUserId - Portal user ID
 * @param {string} clientId - Client ID
 * @returns {Promise<{valid: boolean, user?: Object, error?: string}>}
 */
export async function validatePortalSession(portalUserId, clientId) {
  if (!portalUserId || !clientId) {
    return { valid: false, error: 'Missing session data' }
  }

  try {
    // Verify user exists and is active
    const user = await getPortalUserById(portalUserId)
    if (!user) {
      return { valid: false, error: 'User not found' }
    }

    if (user.status === 'disabled') {
      return { valid: false, error: 'User account is disabled' }
    }

    // Verify user belongs to claimed client
    if (user.clientId !== clientId) {
      return { valid: false, error: 'Client mismatch' }
    }

    return { valid: true, user }
  } catch (err) {
    logger.error('Session validation failed:', err)
    return { valid: false, error: 'Validation failed' }
  }
}

// ============================================
// CLIENT PORTAL SETTINGS
// ============================================

/**
 * Update client with portal settings
 * @param {string} clientId - Client ID
 * @param {Object} portalSettings - Portal settings
 */
export async function updateClientPortalSettings(clientId, portalSettings) {
  const docRef = doc(db, 'clients', clientId)
  await updateDoc(docRef, {
    portalEnabled: portalSettings.portalEnabled ?? true,
    branding: portalSettings.branding || null,
    updatedAt: serverTimestamp()
  })
}

/**
 * Get client with portal settings
 * @param {string} clientId - Client ID
 * @returns {Promise<Object|null>}
 */
export async function getClientForPortal(clientId) {
  const docRef = doc(db, 'clients', clientId)
  const snapshot = await getDoc(docRef)

  if (!snapshot.exists()) {
    return null
  }

  return { id: snapshot.id, ...snapshot.data() }
}

// ============================================
// CLIENT PROJECTS (Read-only access)
// ============================================

/**
 * Get projects for a client (by client name match)
 * @param {string} clientName - Client name to match
 * @returns {Promise<Array>}
 */
export async function getProjectsForClient(clientName) {
  const projectsRef = collection(db, 'projects')
  const q = query(
    projectsRef,
    where('clientName', '==', clientName)
  )
  const snapshot = await getDocs(q)
  const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

  // Sort by createdAt descending (newest first)
  return projects.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() || 0
    const bTime = b.createdAt?.toMillis?.() || 0
    return bTime - aTime
  })
}

/**
 * Get a single project for client view (read-only)
 * @param {string} projectId - Project ID
 * @param {string} clientName - Client name (for verification)
 * @returns {Promise<Object|null>}
 */
export async function getProjectForClient(projectId, clientName) {
  const docRef = doc(db, 'projects', projectId)
  const snapshot = await getDoc(docRef)

  if (!snapshot.exists()) {
    return null
  }

  const project = { id: snapshot.id, ...snapshot.data() }

  // Verify this project belongs to the client
  if (project.clientName !== clientName) {
    return null
  }

  return project
}

// ============================================
// DELIVERABLES / DOCUMENTS
// ============================================

/**
 * Get deliverables for a project (client-visible documents)
 * @param {string} projectId - Project ID
 * @returns {Promise<Array>}
 */
export async function getProjectDeliverables(projectId) {
  const deliverablesRef = collection(db, 'projects', projectId, 'deliverables')
  const snapshot = await getDocs(deliverablesRef)
  const deliverables = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

  // Filter to only client-visible deliverables
  return deliverables
    .filter(d => d.clientVisible !== false)
    .sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0
      const bTime = b.createdAt?.toMillis?.() || 0
      return bTime - aTime
    })
}

/**
 * Add a deliverable to a project
 * @param {string} projectId - Project ID
 * @param {Object} data - Deliverable data
 * @returns {Promise<Object>}
 */
export async function addProjectDeliverable(projectId, data) {
  const deliverablesRef = collection(db, 'projects', projectId, 'deliverables')

  const deliverable = {
    name: data.name,
    description: data.description || '',
    type: data.type || 'document', // document, report, data, media
    fileUrl: data.fileUrl,
    fileName: data.fileName,
    fileSize: data.fileSize || 0,
    mimeType: data.mimeType || '',
    clientVisible: data.clientVisible ?? true,
    uploadedBy: data.uploadedBy,
    uploadedByName: data.uploadedByName,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  const docRef = await addDoc(deliverablesRef, deliverable)
  return { id: docRef.id, ...deliverable }
}

/**
 * Update deliverable visibility
 * @param {string} projectId - Project ID
 * @param {string} deliverableId - Deliverable ID
 * @param {boolean} clientVisible - Whether client can see it
 */
export async function updateDeliverableVisibility(projectId, deliverableId, clientVisible) {
  const docRef = doc(db, 'projects', projectId, 'deliverables', deliverableId)
  await updateDoc(docRef, {
    clientVisible,
    updatedAt: serverTimestamp()
  })
}

/**
 * Delete a deliverable
 * @param {string} projectId - Project ID
 * @param {string} deliverableId - Deliverable ID
 */
export async function deleteDeliverable(projectId, deliverableId) {
  const docRef = doc(db, 'projects', projectId, 'deliverables', deliverableId)
  await deleteDoc(docRef)
}
