/**
 * Firestore Attachments Service
 * Manage document and file attachments
 *
 * UPDATED: All queries now require organizationId for Firestore security rules
 *
 * @location src/lib/firestoreAttachments.js
 */

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  serverTimestamp
} from 'firebase/firestore'
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage'
import { db, storage } from './firebase'
import { logger } from './logger'
import { requireOrgId } from './firestoreQueryUtils'

// ============================================
// ATTACHMENT TYPES
// ============================================

export const ATTACHMENT_TYPES = {
  document: { label: 'Document', icon: 'FileText', extensions: ['.pdf', '.doc', '.docx', '.txt', '.rtf'] },
  image: { label: 'Image', icon: 'Image', extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'] },
  spreadsheet: { label: 'Spreadsheet', icon: 'FileSpreadsheet', extensions: ['.xls', '.xlsx', '.csv'] },
  presentation: { label: 'Presentation', icon: 'Presentation', extensions: ['.ppt', '.pptx'] },
  video: { label: 'Video', icon: 'Video', extensions: ['.mp4', '.mov', '.avi', '.wmv', '.webm'] },
  audio: { label: 'Audio', icon: 'Music', extensions: ['.mp3', '.wav', '.m4a', '.ogg'] },
  archive: { label: 'Archive', icon: 'Archive', extensions: ['.zip', '.rar', '.7z', '.tar', '.gz'] },
  other: { label: 'Other', icon: 'File', extensions: [] }
}

export const ATTACHMENT_CATEGORIES = {
  general: { label: 'General', color: 'bg-gray-100 text-gray-700' },
  certificate: { label: 'Certificate', color: 'bg-blue-100 text-blue-700' },
  permit: { label: 'Permit', color: 'bg-green-100 text-green-700' },
  insurance: { label: 'Insurance', color: 'bg-purple-100 text-purple-700' },
  report: { label: 'Report', color: 'bg-indigo-100 text-indigo-700' },
  photo: { label: 'Photo', color: 'bg-amber-100 text-amber-700' },
  checklist: { label: 'Checklist', color: 'bg-cyan-100 text-cyan-700' },
  manual: { label: 'Manual', color: 'bg-orange-100 text-orange-700' },
  contract: { label: 'Contract', color: 'bg-red-100 text-red-700' }
}

// Maximum file size (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024

// ============================================
// FILE TYPE DETECTION
// ============================================

/**
 * Detect attachment type from filename
 */
export function detectAttachmentType(filename) {
  const ext = '.' + filename.split('.').pop().toLowerCase()

  for (const [type, config] of Object.entries(ATTACHMENT_TYPES)) {
    if (config.extensions.includes(ext)) {
      return type
    }
  }

  return 'other'
}

/**
 * Get file extension
 */
export function getFileExtension(filename) {
  return filename.split('.').pop().toLowerCase()
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Validate file
 */
export function validateFile(file, options = {}) {
  const { maxSize = MAX_FILE_SIZE, allowedTypes = null } = options
  const errors = []

  if (file.size > maxSize) {
    errors.push(`File size ${formatFileSize(file.size)} exceeds maximum ${formatFileSize(maxSize)}`)
  }

  if (allowedTypes) {
    const type = detectAttachmentType(file.name)
    if (!allowedTypes.includes(type)) {
      errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// ============================================
// UPLOAD FUNCTIONS
// ============================================

/**
 * Upload file to storage
 */
export async function uploadFile(file, path, metadata = {}) {
  const storageRef = ref(storage, path)

  const uploadMetadata = {
    contentType: file.type,
    customMetadata: metadata
  }

  const snapshot = await uploadBytes(storageRef, file, uploadMetadata)
  const downloadURL = await getDownloadURL(snapshot.ref)

  return {
    path,
    url: downloadURL,
    size: file.size,
    contentType: file.type
  }
}

/**
 * Delete file from storage
 */
export async function deleteFile(path) {
  try {
    const storageRef = ref(storage, path)
    await deleteObject(storageRef)
    return true
  } catch (err) {
    logger.error('Error deleting file:', err)
    return false
  }
}

// ============================================
// ATTACHMENT CRUD
// ============================================

/**
 * Create an attachment record
 */
export async function createAttachment(attachmentData, file = null) {
  requireOrgId(attachmentData.organizationId, 'create attachment')

  let fileData = {}

  // Upload file if provided
  if (file) {
    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const path = `attachments/${attachmentData.organizationId}/${attachmentData.entityType}/${attachmentData.entityId}/${timestamp}_${safeName}`

    fileData = await uploadFile(file, path, {
      uploadedBy: attachmentData.uploadedBy,
      entityType: attachmentData.entityType,
      entityId: attachmentData.entityId
    })
  }

  const attachment = {
    organizationId: attachmentData.organizationId,
    entityType: attachmentData.entityType, // project, equipment, aircraft, incident, etc.
    entityId: attachmentData.entityId,
    name: attachmentData.name || file?.name || 'Untitled',
    description: attachmentData.description || '',
    category: attachmentData.category || 'general',
    type: attachmentData.type || detectAttachmentType(attachmentData.name || file?.name || ''),
    fileName: file?.name || attachmentData.fileName || '',
    fileSize: file?.size || attachmentData.fileSize || 0,
    fileType: file?.type || attachmentData.fileType || '',
    filePath: fileData.path || attachmentData.filePath || '',
    fileUrl: fileData.url || attachmentData.fileUrl || '',
    tags: attachmentData.tags || [],
    isPublic: attachmentData.isPublic || false,
    uploadedBy: attachmentData.uploadedBy,
    uploadedByName: attachmentData.uploadedByName,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  const docRef = await addDoc(collection(db, 'attachments'), attachment)
  return { id: docRef.id, ...attachment }
}

/**
 * Get attachments for an entity
 * @param {string} organizationId - Required for security rules
 * @param {string} entityType - Type of entity
 * @param {string} entityId - ID of the entity
 */
export async function getEntityAttachments(organizationId, entityType, entityId) {
  requireOrgId(organizationId, 'get attachments')

  const q = query(
    collection(db, 'attachments'),
    where('organizationId', '==', organizationId),
    where('entityType', '==', entityType),
    where('entityId', '==', entityId),
    orderBy('createdAt', 'desc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.(),
    updatedAt: doc.data().updatedAt?.toDate?.()
  }))
}

/**
 * Get attachments by category
 */
export async function getAttachmentsByCategory(organizationId, category) {
  requireOrgId(organizationId, 'get attachments by category')

  const q = query(
    collection(db, 'attachments'),
    where('organizationId', '==', organizationId),
    where('category', '==', category),
    orderBy('createdAt', 'desc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.(),
    updatedAt: doc.data().updatedAt?.toDate?.()
  }))
}

/**
 * Search attachments
 */
export async function searchAttachments(organizationId, searchQuery) {
  requireOrgId(organizationId, 'search attachments')

  const q = query(
    collection(db, 'attachments'),
    where('organizationId', '==', organizationId),
    orderBy('createdAt', 'desc')
  )

  const snapshot = await getDocs(q)
  const searchLower = searchQuery.toLowerCase()

  return snapshot.docs
    .map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.(),
      updatedAt: doc.data().updatedAt?.toDate?.()
    }))
    .filter(att =>
      att.name?.toLowerCase().includes(searchLower) ||
      att.description?.toLowerCase().includes(searchLower) ||
      att.fileName?.toLowerCase().includes(searchLower) ||
      att.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    )
}

/**
 * Get a single attachment
 */
export async function getAttachment(attachmentId) {
  const docRef = doc(db, 'attachments', attachmentId)
  const snapshot = await getDoc(docRef)

  if (!snapshot.exists()) {
    throw new Error('Attachment not found')
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
    createdAt: snapshot.data().createdAt?.toDate?.(),
    updatedAt: snapshot.data().updatedAt?.toDate?.()
  }
}

/**
 * Update an attachment
 */
export async function updateAttachment(attachmentId, updates) {
  const attachmentRef = doc(db, 'attachments', attachmentId)
  await updateDoc(attachmentRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })
}

/**
 * Delete an attachment
 */
export async function deleteAttachment(attachmentId) {
  const attachment = await getAttachment(attachmentId)

  // Delete file from storage
  if (attachment.filePath) {
    await deleteFile(attachment.filePath)
  }

  // Delete record
  await deleteDoc(doc(db, 'attachments', attachmentId))
}

// ============================================
// BULK OPERATIONS
// ============================================

/**
 * Get total storage used by organization
 */
export async function getStorageUsage(organizationId) {
  requireOrgId(organizationId, 'get storage usage')

  const q = query(
    collection(db, 'attachments'),
    where('organizationId', '==', organizationId)
  )

  const snapshot = await getDocs(q)
  let totalSize = 0
  let fileCount = 0

  snapshot.docs.forEach(doc => {
    totalSize += doc.data().fileSize || 0
    fileCount++
  })

  return {
    totalSize,
    formattedSize: formatFileSize(totalSize),
    fileCount
  }
}

/**
 * Delete all attachments for an entity
 * @param {string} organizationId - Required for security rules
 * @param {string} entityType - Type of entity
 * @param {string} entityId - ID of the entity
 */
export async function deleteEntityAttachments(organizationId, entityType, entityId) {
  const attachments = await getEntityAttachments(organizationId, entityType, entityId)

  const deletePromises = attachments.map(att => deleteAttachment(att.id))
  await Promise.all(deletePromises)

  return attachments.length
}

export default {
  ATTACHMENT_TYPES,
  ATTACHMENT_CATEGORIES,
  MAX_FILE_SIZE,
  detectAttachmentType,
  getFileExtension,
  formatFileSize,
  validateFile,
  uploadFile,
  deleteFile,
  createAttachment,
  getEntityAttachments,
  getAttachmentsByCategory,
  searchAttachments,
  getAttachment,
  updateAttachment,
  deleteAttachment,
  getStorageUsage,
  deleteEntityAttachments
}
