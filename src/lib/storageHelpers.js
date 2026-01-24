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

// ============================================
// FHA ATTACHMENTS
// ============================================

/**
 * Upload an FHA attachment (PDF, Word doc, images, etc.)
 * @param {File} file - The file to upload
 * @param {string} fhaId - FHA ID for organizing files
 * @returns {Promise<{url: string, path: string, name: string, size: number, type: string}>}
 */
export async function uploadFHAAttachment(file, fhaId) {
  if (!file) throw new Error('No file provided')
  if (!fhaId) throw new Error('FHA ID required')

  // Validate file type
  const validTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/webp'
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

  // Create storage path: fha/{fhaId}/attachments/{filename}
  const storagePath = `fha/${fhaId}/attachments/${filename}`
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
 * Delete an FHA attachment from Firebase Storage
 * @param {string} storagePath - The storage path of the file to delete
 */
export async function deleteFHAAttachment(storagePath) {
  if (!storagePath) throw new Error('Storage path required')

  const storageRef = ref(storage, storagePath)
  await deleteObject(storageRef)
}

/**
 * Upload an FHA document (for uploaded source FHAs)
 * @param {File} file - The file to upload
 * @param {string} fhaId - FHA ID
 * @returns {Promise<{url: string, path: string, name: string, size: number, type: string}>}
 */
export async function uploadFHADocument(file, fhaId) {
  if (!file) throw new Error('No file provided')
  if (!fhaId) throw new Error('FHA ID required')

  // Validate file type - only allow documents for FHA uploads
  const validTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]

  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload PDF or Word documents.')
  }

  // Validate file size (max 50MB for main documents)
  const maxSize = 50 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 50MB.')
  }

  // Generate unique filename
  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const filename = `${timestamp}_${safeName}`

  // Create storage path: fha/{fhaId}/documents/{filename}
  const storagePath = `fha/${fhaId}/documents/${filename}`
  const storageRef = ref(storage, storagePath)

  // Upload file
  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type,
    customMetadata: {
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
      documentType: 'fha_source'
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
 * Delete an FHA document from Firebase Storage
 * @param {string} storagePath - The storage path of the file to delete
 */
export async function deleteFHADocument(storagePath) {
  if (!storagePath) throw new Error('Storage path required')

  const storageRef = ref(storage, storagePath)
  await deleteObject(storageRef)
}

/**
 * Upload multiple FHA attachments
 * @param {FileList|File[]} files - Files to upload
 * @param {string} fhaId - FHA ID
 * @param {function} onProgress - Progress callback (index, total)
 * @returns {Promise<Array<{url: string, path: string, name: string}>>}
 */
export async function uploadMultipleFHAAttachments(files, fhaId, onProgress) {
  const results = []
  const fileArray = Array.from(files)

  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i]
    if (onProgress) onProgress(i + 1, fileArray.length)

    try {
      const result = await uploadFHAAttachment(file, fhaId)
      results.push(result)
    } catch (error) {
      results.push({ error: error.message, name: file.name })
    }
  }

  return results
}

// ============================================
// FORM ATTACHMENTS
// ============================================

/**
 * Upload a form attachment (photos, documents, etc.)
 * @param {File} file - The file to upload
 * @param {string} formId - Form submission ID for organizing files
 * @param {string} fieldId - Field ID for organizing files
 * @returns {Promise<{url: string, path: string, name: string, size: number, type: string}>}
 */
export async function uploadFormAttachment(file, formId, fieldId) {
  if (!file) throw new Error('No file provided')
  if (!formId) throw new Error('Form ID required')
  if (!fieldId) throw new Error('Field ID required')

  // Validate file type - broad support for form uploads
  const validTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'video/mp4',
    'video/quicktime',
    'video/webm'
  ]

  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Supported: PDF, Word, Excel, images, and videos.')
  }

  // Validate file size (max 50MB)
  const maxSize = 50 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 50MB.')
  }

  // Generate unique filename
  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const filename = `${timestamp}_${safeName}`

  // Create storage path: forms/{formId}/attachments/{fieldId}/{filename}
  const storagePath = `forms/${formId}/attachments/${fieldId}/${filename}`
  const storageRef = ref(storage, storagePath)

  // Upload file
  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type,
    customMetadata: {
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
      fieldId
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
 * Delete a form attachment from Firebase Storage
 * @param {string} storagePath - The storage path of the file to delete
 */
export async function deleteFormAttachment(storagePath) {
  if (!storagePath) throw new Error('Storage path required')

  const storageRef = ref(storage, storagePath)
  await deleteObject(storageRef)
}

/**
 * Upload multiple form attachments
 * @param {FileList|File[]} files - Files to upload
 * @param {string} formId - Form submission ID
 * @param {string} fieldId - Field ID
 * @param {function} onProgress - Progress callback (index, total)
 * @returns {Promise<Array<{url: string, path: string, name: string}>>}
 */
export async function uploadMultipleFormAttachments(files, formId, fieldId, onProgress) {
  const results = []
  const fileArray = Array.from(files)

  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i]
    if (onProgress) onProgress(i + 1, fileArray.length)

    try {
      const result = await uploadFormAttachment(file, formId, fieldId)
      results.push(result)
    } catch (error) {
      results.push({ error: error.message, name: file.name })
    }
  }

  return results
}

// ============================================
// INSPECTION PHOTOS
// ============================================

/**
 * Upload an inspection photo
 * @param {File} file - The image file to upload
 * @param {string} inspectionId - Inspection ID for organizing files
 * @param {string} itemId - Optional checklist item ID (for item-specific photos)
 * @returns {Promise<{url: string, path: string, name: string, size: number, type: string}>}
 */
export async function uploadInspectionPhoto(file, inspectionId, itemId = null) {
  if (!file) throw new Error('No file provided')
  if (!inspectionId) throw new Error('Inspection ID required')

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

  // Create storage path: inspections/{inspectionId}/photos/{itemId?}/{filename}
  const subPath = itemId ? `items/${itemId}` : 'general'
  const storagePath = `inspections/${inspectionId}/photos/${subPath}/${filename}`
  const storageRef = ref(storage, storagePath)

  // Upload file
  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type,
    customMetadata: {
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
      inspectionId,
      itemId: itemId || ''
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
    uploadedAt: new Date().toISOString(),
    itemId
  }
}

/**
 * Delete an inspection photo from Firebase Storage
 * @param {string} storagePath - The storage path of the file to delete
 */
export async function deleteInspectionPhoto(storagePath) {
  if (!storagePath) throw new Error('Storage path required')

  const storageRef = ref(storage, storagePath)
  await deleteObject(storageRef)
}

/**
 * Upload multiple inspection photos
 * @param {FileList|File[]} files - Files to upload
 * @param {string} inspectionId - Inspection ID
 * @param {string} itemId - Optional checklist item ID
 * @param {function} onProgress - Progress callback (index, total)
 * @returns {Promise<Array<{url: string, path: string, name: string}>>}
 */
export async function uploadMultipleInspectionPhotos(files, inspectionId, itemId = null, onProgress) {
  const results = []
  const fileArray = Array.from(files)

  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i]
    if (onProgress) onProgress(i + 1, fileArray.length)

    try {
      const result = await uploadInspectionPhoto(file, inspectionId, itemId)
      results.push(result)
    } catch (error) {
      results.push({ error: error.message, name: file.name })
    }
  }

  return results
}

// ============================================
// INSURANCE DOCUMENTS
// ============================================

/**
 * Upload an insurance document
 * @param {File} file - The document file to upload
 * @param {string} policyId - Insurance policy ID
 * @returns {Promise<{url: string, path: string, name: string, size: number, type: string}>}
 */
export async function uploadInsuranceDocument(file, policyId) {
  if (!file) throw new Error('No file provided')
  if (!policyId) throw new Error('Policy ID required')

  // Validate file type
  const validTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload PDF, JPEG, PNG, or Word documents.')
  }

  // Validate file size (max 20MB)
  const maxSize = 20 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 20MB.')
  }

  // Generate unique filename
  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const filename = `${timestamp}_${safeName}`

  // Create storage path
  const storagePath = `insurance/${policyId}/${filename}`
  const storageRef = ref(storage, storagePath)

  // Upload file
  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type,
    customMetadata: {
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
      policyId
    }
  })

  // Get download URL
  const url = await getDownloadURL(snapshot.ref)

  return {
    url,
    path: storagePath,
    name: file.name,
    size: file.size,
    type: file.type
  }
}

/**
 * Delete an insurance document from Firebase Storage
 * @param {string} storagePath - The storage path of the file to delete
 */
export async function deleteInsuranceDocument(storagePath) {
  if (!storagePath) throw new Error('Storage path required')

  const storageRef = ref(storage, storagePath)
  await deleteObject(storageRef)
}
