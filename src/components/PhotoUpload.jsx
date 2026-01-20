/**
 * PhotoUpload.jsx
 * Photo upload component for site surveys with preview and management
 * 
 * Features:
 * - Drag and drop upload
 * - Multiple file selection
 * - Image preview thumbnails
 * - Progress indicator
 * - Delete functionality
 * - Category organization
 * - Lightbox view
 * 
 * @location src/components/PhotoUpload.jsx
 * @action NEW
 */

import React, { useState, useRef, useCallback } from 'react'
import {
  Camera,
  Upload,
  X,
  Loader2,
  Image as ImageIcon,
  Trash2,
  ZoomIn,
  Download,
  AlertCircle,
  CheckCircle2,
  FolderOpen
} from 'lucide-react'
import { uploadSitePhoto, deleteSitePhoto } from '../lib/storageHelpers'

// Maximum file size in bytes (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024

// Photo categories for site surveys
const PHOTO_CATEGORIES = [
  { id: 'site_overview', label: 'Site Overview', icon: FolderOpen },
  { id: 'obstacles', label: 'Obstacles', icon: AlertCircle },
  { id: 'access_points', label: 'Access Points', icon: FolderOpen },
  { id: 'hazards', label: 'Hazards', icon: AlertCircle },
  { id: 'surrounding_area', label: 'Surrounding Area', icon: ImageIcon },
  { id: 'other', label: 'Other', icon: Camera }
]

/**
 * PhotoUpload component
 * @param {Object} props
 * @param {string} props.projectId - Project ID for storage path
 * @param {string} props.siteId - Site ID for storage path
 * @param {Array} props.photos - Existing photos array
 * @param {Function} props.onPhotosChange - Callback when photos change
 * @param {number} props.maxPhotos - Maximum number of photos allowed (default: 20)
 */
export default function PhotoUpload({ 
  projectId, 
  siteId, 
  photos = [], 
  onPhotosChange,
  maxPhotos = 20 
}) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('site_overview')
  const [lightboxPhoto, setLightboxPhoto] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  // Handle file selection
  const handleFileSelect = useCallback(async (files) => {
    if (!files || files.length === 0) return
    if (!projectId || !siteId) {
      setError('Project and site must be saved before uploading photos')
      return
    }

    const fileArray = Array.from(files)
    
    // Check total count
    if (photos.length + fileArray.length > maxPhotos) {
      setError(`Maximum ${maxPhotos} photos allowed. You can add ${maxPhotos - photos.length} more.`)
      return
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
    const invalidFiles = fileArray.filter(f => !validTypes.includes(f.type))
    if (invalidFiles.length > 0) {
      setError('Only JPEG, PNG, and WebP images are allowed')
      return
    }

    // Validate file sizes
    const oversizedFiles = fileArray.filter(f => f.size > MAX_FILE_SIZE)
    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map(f => f.name).join(', ')
      setError(`The following files exceed the 10MB limit: ${fileNames}`)
      return
    }

    setError(null)
    setUploading(true)
    setUploadProgress({ current: 0, total: fileArray.length })

    const newPhotos = [...photos]
    
    for (let i = 0; i < fileArray.length; i++) {
      try {
        setUploadProgress({ current: i + 1, total: fileArray.length })
        
        const result = await uploadSitePhoto(
          fileArray[i], 
          projectId, 
          siteId, 
          selectedCategory
        )
        
        newPhotos.push({
          ...result,
          category: selectedCategory,
          caption: ''
        })
      } catch (err) {
        setError(`Failed to upload ${fileArray[i].name}: ${err.message || 'Unknown error'}`)
      }
    }

    setUploading(false)
    setUploadProgress({ current: 0, total: 0 })
    onPhotosChange(newPhotos)
  }, [projectId, siteId, photos, selectedCategory, maxPhotos, onPhotosChange])

  // Handle drag and drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  // Handle photo deletion
  const handleDelete = useCallback(async (photoIndex) => {
    const photo = photos[photoIndex]
    
    try {
      // Delete from storage if path exists
      if (photo.path) {
        await deleteSitePhoto(photo.path)
      }
      
      // Remove from array
      const newPhotos = photos.filter((_, i) => i !== photoIndex)
      onPhotosChange(newPhotos)
    } catch (err) {
      setError(`Failed to delete photo: ${err.message || 'Unknown error'}`)
    }
  }, [photos, onPhotosChange])

  // Handle caption update
  const handleCaptionChange = useCallback((photoIndex, caption) => {
    const newPhotos = [...photos]
    newPhotos[photoIndex] = { ...newPhotos[photoIndex], caption }
    onPhotosChange(newPhotos)
  }, [photos, onPhotosChange])

  // Group photos by category
  const photosByCategory = photos.reduce((acc, photo, index) => {
    const cat = photo.category || 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push({ ...photo, index })
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {/* Category selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Photo Category
        </label>
        <div className="flex flex-wrap gap-2">
          {PHOTO_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-aeria-navy text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Upload area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging 
            ? 'border-aeria-navy bg-aeria-navy/5' 
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/heic"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        {uploading ? (
          <div className="py-4">
            <Loader2 className="w-8 h-8 mx-auto text-aeria-navy animate-spin mb-2" />
            <p className="text-sm text-gray-600">
              Uploading {uploadProgress.current} of {uploadProgress.total}...
            </p>
          </div>
        ) : (
          <>
            <Camera className="w-10 h-10 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 mb-2">
              Drag and drop photos here, or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-aeria-navy font-medium hover:underline"
              >
                browse
              </button>
            </p>
            <p className="text-xs text-gray-500">
              JPEG, PNG, or WebP • Max 10MB each • {photos.length}/{maxPhotos} photos
            </p>
          </>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Photo gallery by category */}
      {Object.entries(photosByCategory).length > 0 && (
        <div className="space-y-4">
          {PHOTO_CATEGORIES.filter(cat => photosByCategory[cat.id]?.length > 0).map(cat => (
            <div key={cat.id}>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                <cat.icon className="w-4 h-4" />
                {cat.label} ({photosByCategory[cat.id].length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {photosByCategory[cat.id].map(photo => (
                  <div
                    key={photo.index}
                    className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200"
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || photo.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Overlay with actions */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => setLightboxPhoto(photo)}
                        className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                        title="View full size"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(photo.index)}
                        className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50"
                        title="Delete photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Caption badge */}
                    {photo.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                        {photo.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {photos.length === 0 && !uploading && (
        <div className="text-center py-6 text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto text-gray-300 mb-2" />
          <p className="text-sm">No photos uploaded yet</p>
        </div>
      )}

      {/* Lightbox */}
      {lightboxPhoto && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-4 right-4 p-2 text-white hover:text-gray-300"
          >
            <X className="w-8 h-8" />
          </button>
          
          <img
            src={lightboxPhoto.url}
            alt={lightboxPhoto.caption || lightboxPhoto.name}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          
          {/* Caption input in lightbox */}
          <div 
            className="absolute bottom-4 left-4 right-4 max-w-lg mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              value={lightboxPhoto.caption || ''}
              onChange={(e) => handleCaptionChange(lightboxPhoto.index, e.target.value)}
              placeholder="Add a caption..."
              className="w-full px-4 py-2 bg-white/90 rounded-lg text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Compact photo count badge for use in section headers
 */
export function PhotoCountBadge({ count }) {
  if (!count) return null
  
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
      <Camera className="w-3 h-3" />
      {count}
    </span>
  )
}
