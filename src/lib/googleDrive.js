/**
 * Google Drive Integration
 * OAuth flow and file upload functionality
 *
 * Note: This requires setting up Google Cloud credentials
 * and configuring environment variables:
 * - VITE_GOOGLE_CLIENT_ID
 * - VITE_GOOGLE_REDIRECT_URI
 *
 * @version 1.0.0
 */

import { db } from './firebase'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { COLLECTIONS, GOOGLE_DRIVE_SCOPES } from './database-phase4'

// ============================================
// CONFIGURATION
// ============================================

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/settings`
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3'
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files'

// ============================================
// TOKEN MANAGEMENT
// ============================================

/**
 * Get stored Google Drive tokens for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Token data or null
 */
export async function getGoogleDriveTokens(userId) {
  try {
    const docRef = doc(db, COLLECTIONS.GOOGLE_DRIVE_TOKENS, userId)
    const snapshot = await getDoc(docRef)

    if (!snapshot.exists()) {
      return null
    }

    const data = snapshot.data()
    return {
      ...data,
      connectedAt: data.connectedAt?.toDate(),
      lastUsedAt: data.lastUsedAt?.toDate(),
      tokenExpiry: data.tokenExpiry?.toDate(),
    }
  } catch (error) {
    console.error('Error getting Google Drive tokens:', error)
    return null
  }
}

/**
 * Save Google Drive tokens for a user
 * @param {string} userId - User ID
 * @param {string} organizationId - Organization ID
 * @param {Object} tokens - Token data
 */
export async function saveGoogleDriveTokens(userId, organizationId, tokens) {
  try {
    const docRef = doc(db, COLLECTIONS.GOOGLE_DRIVE_TOKENS, userId)

    await setDoc(docRef, {
      userId,
      organizationId,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
      email: tokens.email || null,
      defaultFolderId: null,
      defaultFolderName: null,
      autoUpload: false,
      connectedAt: serverTimestamp(),
      lastUsedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error saving Google Drive tokens:', error)
    throw error
  }
}

/**
 * Update Google Drive token after refresh
 * @param {string} userId - User ID
 * @param {Object} tokens - New token data
 */
export async function updateGoogleDriveTokens(userId, tokens) {
  try {
    const docRef = doc(db, COLLECTIONS.GOOGLE_DRIVE_TOKENS, userId)

    await updateDoc(docRef, {
      accessToken: tokens.access_token,
      tokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
      lastUsedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error updating Google Drive tokens:', error)
    throw error
  }
}

/**
 * Update Google Drive preferences
 * @param {string} userId - User ID
 * @param {Object} preferences - Preferences to update
 */
export async function updateGoogleDrivePreferences(userId, preferences) {
  try {
    const docRef = doc(db, COLLECTIONS.GOOGLE_DRIVE_TOKENS, userId)

    await updateDoc(docRef, {
      ...preferences,
      lastUsedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error updating Google Drive preferences:', error)
    throw error
  }
}

/**
 * Disconnect Google Drive (delete tokens)
 * @param {string} userId - User ID
 */
export async function disconnectGoogleDrive(userId) {
  try {
    const { deleteDoc } = await import('firebase/firestore')
    const docRef = doc(db, COLLECTIONS.GOOGLE_DRIVE_TOKENS, userId)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error disconnecting Google Drive:', error)
    throw error
  }
}

// ============================================
// OAUTH FLOW
// ============================================

/**
 * Generate OAuth authorization URL
 * @param {string} state - State parameter for CSRF protection
 * @returns {string} Authorization URL
 */
export function getGoogleAuthUrl(state = '') {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('Google Client ID is not configured. Please set VITE_GOOGLE_CLIENT_ID.')
  }

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: GOOGLE_DRIVE_SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state,
  })

  return `${GOOGLE_AUTH_URL}?${params.toString()}`
}

/**
 * Exchange authorization code for tokens
 * Note: This should ideally be done server-side for security
 * @param {string} code - Authorization code
 * @returns {Promise<Object>} Token response
 */
export async function exchangeCodeForTokens(code) {
  // In production, this should be handled by a backend/Edge Function
  // to keep the client secret secure

  // For development/demo, we can use a Cloud Function
  // that accepts the code and returns tokens

  throw new Error(
    'Token exchange should be handled server-side. ' +
    'Please implement a Supabase Edge Function or Firebase Cloud Function ' +
    'to exchange the authorization code for tokens.'
  )
}

/**
 * Refresh access token using refresh token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} New token response
 */
export async function refreshAccessToken(refreshToken) {
  // This should also be handled server-side
  throw new Error(
    'Token refresh should be handled server-side.'
  )
}

/**
 * Check if token needs refresh and refresh if necessary
 * @param {Object} tokenData - Stored token data
 * @returns {Promise<string>} Valid access token
 */
export async function ensureValidToken(tokenData) {
  if (!tokenData) {
    throw new Error('No Google Drive connection')
  }

  const now = new Date()
  const expiryBuffer = 5 * 60 * 1000 // 5 minutes buffer

  if (tokenData.tokenExpiry && new Date(tokenData.tokenExpiry) > new Date(now.getTime() + expiryBuffer)) {
    // Token is still valid
    return tokenData.accessToken
  }

  // Token expired or expiring soon, refresh it
  if (!tokenData.refreshToken) {
    throw new Error('No refresh token available. Please reconnect Google Drive.')
  }

  const newTokens = await refreshAccessToken(tokenData.refreshToken)
  await updateGoogleDriveTokens(tokenData.userId, newTokens)

  return newTokens.access_token
}

// ============================================
// DRIVE API OPERATIONS
// ============================================

/**
 * List folders in Google Drive
 * @param {string} accessToken - Valid access token
 * @param {string} [parentId] - Parent folder ID (default: root)
 * @returns {Promise<Array>} List of folders
 */
export async function listDriveFolders(accessToken, parentId = 'root') {
  const query = `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`

  const response = await fetch(
    `${DRIVE_API_URL}/files?q=${encodeURIComponent(query)}&fields=files(id,name,parents)`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Failed to list folders: ${error.error?.message || response.statusText}`)
  }

  const data = await response.json()
  return data.files || []
}

/**
 * Create a folder in Google Drive
 * @param {string} accessToken - Valid access token
 * @param {string} name - Folder name
 * @param {string} [parentId] - Parent folder ID
 * @returns {Promise<Object>} Created folder
 */
export async function createDriveFolder(accessToken, name, parentId = null) {
  const metadata = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
  }

  if (parentId) {
    metadata.parents = [parentId]
  }

  const response = await fetch(`${DRIVE_API_URL}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Failed to create folder: ${error.error?.message || response.statusText}`)
  }

  return response.json()
}

/**
 * Upload a file to Google Drive
 * @param {string} accessToken - Valid access token
 * @param {File|Blob} file - File to upload
 * @param {string} fileName - Name for the file
 * @param {string} [folderId] - Folder ID to upload to
 * @returns {Promise<Object>} Uploaded file info
 */
export async function uploadToDrive(accessToken, file, fileName, folderId = null) {
  // Metadata for the file
  const metadata = {
    name: fileName,
    mimeType: file.type || 'application/pdf',
  }

  if (folderId) {
    metadata.parents = [folderId]
  }

  // Create multipart form data
  const boundary = '-------' + Date.now()
  const delimiter = '\r\n--' + boundary + '\r\n'
  const closeDelimiter = '\r\n--' + boundary + '--'

  // Read file as array buffer
  const fileContent = await file.arrayBuffer()
  const fileBytes = new Uint8Array(fileContent)

  // Build the multipart request body
  const metadataString = JSON.stringify(metadata)
  const requestBody = new Uint8Array([
    ...new TextEncoder().encode(
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      metadataString +
      delimiter +
      `Content-Type: ${metadata.mimeType}\r\n\r\n`
    ),
    ...fileBytes,
    ...new TextEncoder().encode(closeDelimiter),
  ])

  const response = await fetch(
    `${DRIVE_UPLOAD_URL}?uploadType=multipart&fields=id,name,webViewLink,webContentLink`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
        'Content-Length': requestBody.length.toString(),
      },
      body: requestBody,
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Failed to upload file: ${error.error?.message || response.statusText}`)
  }

  return response.json()
}

/**
 * Get shareable link for a file
 * @param {string} accessToken - Valid access token
 * @param {string} fileId - File ID
 * @returns {Promise<string>} Shareable link
 */
export async function getShareableLink(accessToken, fileId) {
  // First, update permissions to allow anyone with link to view
  const permissionResponse = await fetch(
    `${DRIVE_API_URL}/files/${fileId}/permissions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone',
      }),
    }
  )

  if (!permissionResponse.ok) {
    console.warn('Could not set file permissions for sharing')
  }

  // Get the file info with web link
  const response = await fetch(
    `${DRIVE_API_URL}/files/${fileId}?fields=webViewLink`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error('Failed to get file link')
  }

  const data = await response.json()
  return data.webViewLink
}

// ============================================
// HIGH-LEVEL UPLOAD FUNCTION
// ============================================

/**
 * Upload a form PDF to Google Drive
 * @param {string} userId - User ID
 * @param {File|Blob} pdfBlob - PDF file/blob
 * @param {string} fileName - File name
 * @param {Object} [options] - Upload options
 * @param {string} [options.folderId] - Override folder ID
 * @param {boolean} [options.createFormFolder] - Create a folder for forms
 * @returns {Promise<{fileId: string, fileUrl: string}>}
 */
export async function uploadFormPdfToDrive(userId, pdfBlob, fileName, options = {}) {
  // Get user's token data
  const tokenData = await getGoogleDriveTokens(userId)
  if (!tokenData) {
    throw new Error('Google Drive is not connected. Please connect in Settings.')
  }

  // Ensure valid token
  const accessToken = await ensureValidToken(tokenData)

  // Determine target folder
  let targetFolderId = options.folderId || tokenData.defaultFolderId

  // If creating form folder and no target specified, create one
  if (options.createFormFolder && !targetFolderId) {
    const folder = await createDriveFolder(accessToken, 'Muster Forms')
    targetFolderId = folder.id

    // Save as default folder
    await updateGoogleDrivePreferences(userId, {
      defaultFolderId: folder.id,
      defaultFolderName: 'Muster Forms',
    })
  }

  // Upload the file
  const uploadedFile = await uploadToDrive(
    accessToken,
    pdfBlob,
    fileName,
    targetFolderId
  )

  // Get shareable link
  let fileUrl = uploadedFile.webViewLink
  if (!fileUrl) {
    fileUrl = await getShareableLink(accessToken, uploadedFile.id)
  }

  return {
    fileId: uploadedFile.id,
    fileUrl,
  }
}

// ============================================
// CONNECTION STATUS
// ============================================

/**
 * Check if user has Google Drive connected
 * @param {string} userId - User ID
 * @returns {Promise<boolean>}
 */
export async function isGoogleDriveConnected(userId) {
  const tokens = await getGoogleDriveTokens(userId)
  return tokens !== null
}

/**
 * Get connection status and info
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
export async function getGoogleDriveStatus(userId) {
  const tokens = await getGoogleDriveTokens(userId)

  if (!tokens) {
    return {
      connected: false,
      email: null,
      defaultFolder: null,
      autoUpload: false,
    }
  }

  return {
    connected: true,
    email: tokens.email,
    defaultFolder: tokens.defaultFolderName,
    defaultFolderId: tokens.defaultFolderId,
    autoUpload: tokens.autoUpload || false,
    connectedAt: tokens.connectedAt,
  }
}
