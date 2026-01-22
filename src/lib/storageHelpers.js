/**
 * storageHelpers.js
 * Firebase Storage helpers for file uploads
 * 
 * @location src/lib/storageHelpers.js
 */

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './firebase'

/**
 * Upload a photo to Firebase Storage
 * @param {File} file - The file to upload
 * @param {string} projectId - Project ID for organizing files
 * @param {string} siteId - Site ID for organizing files
 * @param {string} category - Photo category (e.g., 'site', 'obstacle', 'general')
 * @returns {Promise<{url: string, path: string, name: string}>}
 */
export async function uploadSitePhoto(file, projectId, siteId, category = 'general') {
  if (!file) throw new Error('No file provided')
  if (!projectId) throw new Error('Project ID required')
  if (!siteId) throw new Error('Site ID required')
  
  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload JPEG, PNG, or WebP images.')
  }
  
  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 10MB.')
  }
  
  // Generate unique filename
  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const filename = `${timestamp}_${safeName}`
  
  // Create storage path: projects/{projectId}/sites/{siteId}/photos/{category}/{filename}
  const storagePath = `projects/${projectId}/sites/${siteId}/photos/${category}/${filename}`
  const storageRef = ref(storage, storagePath)
  
  // Upload file
  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type,
    customMetadata: {
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
      category
    }
  })
  
  // Get download URL
  const url = await getDownloadURL(snapshot.ref)
  
  return {
    url,
    path: storagePath,
    name: file.name,
    size: file.size,
    type: file.type,
    uploadedAt: new Date().toISOString()
  }
}

/**
 * Delete a photo from Firebase Storage
 * @param {string} storagePath - The storage path of the file to delete
 */
export async function deleteSitePhoto(storagePath) {
  if (!storagePath) throw new Error('Storage path required')
  
  const storageRef = ref(storage, storagePath)
  await deleteObject(storageRef)
}

/**
 * Upload multiple photos
 * @param {FileList|File[]} files - Files to upload
 * @param {string} projectId - Project ID
 * @param {string} siteId - Site ID
 * @param {string} category - Photo category
 * @param {function} onProgress - Progress callback (index, total)
 * @returns {Promise<Array<{url: string, path: string, name: string}>>}
 */
export async function uploadMultipleSitePhotos(files, projectId, siteId, category = 'general', onProgress) {
  const results = []
  const fileArray = Array.from(files)

  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i]
    if (onProgress) onProgress(i + 1, fileArray.length)

    try {
      const result = await uploadSitePhoto(file, projectId, siteId, category)
      results.push(result)
    } catch (error) {
      results.push({ error: error.message, name: file.name })
    }
  }

  return results
}

// ============================================
// POLICY ATTACHMENTS
// ============================================

/**
 * Upload a policy attachment (PDF, Word doc, etc.)
 * @param {File} file - The file to upload
 * @param {string} policyId - Policy ID for organizing files
 * @returns {Promise<{url: string, path: string, name: string, size: number, type: string}>}
 */
export async function uploadPolicyAttachment(file, policyId) {
  if (!file) throw new Error('No file provided')
  if (!policyId) throw new Error('Policy ID required')

  // Validate file type
  const validTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'image/jpeg',
    'image/png'
  ]

  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload PDF, Word, Excel, text, or image files.')
  }

  // Validate file size (max 25MB for documents)
  const maxSize = 25 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 25MB.')
  }

  // Generate unique filename
  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const filename = `${timestamp}_${safeName}`

  // Create storage path: policies/{policyId}/attachments/{filename}
  const storagePath = `policies/${policyId}/attachments/${filename}`
  const storageRef = ref(storage, storagePath)

  // Upload file
  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type,
    customMetadata: {
      originalName: file.name,
      uploadedAt: new Date().toISOString()
    }
  })

  // Get download URL
  const url = await getDownloadURL(snapshot.ref)

  return {
    url,
    path: storagePath,
    name: file.name,
    size: file.size,
    type: file.type,
    uploadedAt: new Date().toISOString()
  }
}

/**
 * Delete a policy attachment from Firebase Storage
 * @param {string} storagePath - The storage path of the file to delete
 */
export async function deletePolicyAttachment(storagePath) {
  if (!storagePath) throw new Error('Storage path required')

  const storageRef = ref(storage, storagePath)
  await deleteObject(storageRef)
}

// ============================================
// EQUIPMENT IMAGES
// ============================================

/**
 * Upload an equipment image
 * @param {File} file - The image file to upload
 * @param {string} equipmentId - Equipment ID for organizing files
 * @returns {Promise<{url: string, path: string, name: string, size: number, type: string}>}
 */
export async function uploadEquipmentImage(file, equipmentId) {
  if (!file) throw new Error('No file provided')
  if (!equipmentId) throw new Error('Equipment ID required')

  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload JPEG, PNG, or WebP images.')
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 10MB.')
  }

  // Generate unique filename
  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const filename = `${timestamp}_${safeName}`

  // Create storage path: equipment/{equipmentId}/images/{filename}
  const storagePath = `equipment/${equipmentId}/images/${filename}`
  const storageRef = ref(storage, storagePath)

  // Upload file
  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type,
    customMetadata: {
      originalName: file.name,
      uploadedAt: new Date().toISOString()
    }
  })

  // Get download URL
  const url = await getDownloadURL(snapshot.ref)

  return {
    url,
    path: storagePath,
    name: file.name,
    size: file.size,
    type: file.type,
    uploadedAt: new Date().toISOString()
  }
}

/**
 * Delete an equipment image from Firebase Storage
 * @param {string} storagePath - The storage path of the image to delete
 */
export async function deleteEquipmentImage(storagePath) {
  if (!storagePath) throw new Error('Storage path required')

  const storageRef = ref(storage, storagePath)
  await deleteObject(storageRef)
}
