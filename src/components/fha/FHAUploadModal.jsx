/**
 * FHAUploadModal.jsx
 * Modal for uploading FHA documents (PDF, Word)
 *
 * @location src/components/fha/FHAUploadModal.jsx
 */

import { useState, useRef } from 'react'
import {
  X,
  Upload,
  FileText,
  File,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Trash2,
  Plus
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { uploadFHADocument } from '../../lib/storageHelpers'
import { createFormalHazard, FHA_CATEGORIES } from '../../lib/firestoreFHA'

// Accepted file types
const ACCEPTED_TYPES = {
  'application/pdf': { ext: '.pdf', icon: FileText, color: 'text-red-500' },
  'application/msword': { ext: '.doc', icon: File, color: 'text-blue-500' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: '.docx', icon: File, color: 'text-blue-500' }
}

const ACCEPTED_EXTENSIONS = '.pdf,.doc,.docx'
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

/**
 * File item in upload queue
 */
function FileItem({ file, status, error, onRemove, onUpdateMeta, meta }) {
  const fileType = ACCEPTED_TYPES[file.type] || { icon: File, color: 'text-gray-500' }
  const Icon = fileType.icon

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className={`border rounded-lg p-4 ${
      status === 'error' ? 'border-red-200 bg-red-50' :
      status === 'success' ? 'border-green-200 bg-green-50' :
      status === 'uploading' ? 'border-blue-200 bg-blue-50' :
      'border-gray-200 bg-white'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg bg-gray-100 ${fileType.color}`}>
          <Icon className="w-6 h-6" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 truncate">{file.name}</span>
            <span className="text-xs text-gray-500">{formatSize(file.size)}</span>
          </div>

          {status === 'pending' && (
            <div className="mt-3 space-y-3">
              {/* FHA Title */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  FHA Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={meta?.title || ''}
                  onChange={(e) => onUpdateMeta({ ...meta, title: e.target.value })}
                  placeholder="Brief description of the hazard"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* FHA Number */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    FHA Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={meta?.fhaNumber || ''}
                    onChange={(e) => onUpdateMeta({ ...meta, fhaNumber: e.target.value })}
                    placeholder="e.g., FHA-001"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                  <select
                    value={meta?.category || 'flight_ops'}
                    onChange={(e) => onUpdateMeta({ ...meta, category: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {FHA_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  value={meta?.description || ''}
                  onChange={(e) => onUpdateMeta({ ...meta, description: e.target.value })}
                  placeholder="Optional description of the hazard..."
                  rows={2}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          )}

          {status === 'uploading' && (
            <div className="flex items-center gap-2 mt-2 text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Uploading...</span>
            </div>
          )}

          {status === 'success' && (
            <div className="flex items-center gap-2 mt-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Uploaded successfully</span>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-2 mt-2 text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">{error || 'Upload failed'}</span>
            </div>
          )}
        </div>

        {status === 'pending' && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Main Upload Modal
 */
export default function FHAUploadModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth()
  const fileInputRef = useRef(null)

  const [files, setFiles] = useState([]) // { file, status, error, meta }
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  // Handle file selection
  const handleFileSelect = (selectedFiles) => {
    const newFiles = Array.from(selectedFiles)
      .filter(file => {
        // Validate type
        if (!Object.keys(ACCEPTED_TYPES).includes(file.type)) {
          return false
        }
        // Validate size
        if (file.size > MAX_FILE_SIZE) {
          return false
        }
        // Check for duplicates
        return !files.some(f => f.file.name === file.name)
      })
      .map(file => ({
        file,
        status: 'pending',
        error: null,
        meta: {
          title: file.name.replace(/\.(pdf|docx?)/i, ''),
          fhaNumber: '',
          category: 'flight_ops',
          description: ''
        }
      }))

    setFiles(prev => [...prev, ...newFiles])
  }

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  // Update file metadata
  const updateFileMeta = (index, meta) => {
    setFiles(prev => prev.map((f, i) => i === index ? { ...f, meta } : f))
  }

  // Remove file from queue
  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Upload all files
  const handleUploadAll = async () => {
    if (!user) return

    // Validate all files have required fields
    const invalidFiles = files.filter(f =>
      f.status === 'pending' && (!f.meta.title?.trim() || !f.meta.fhaNumber?.trim())
    )
    if (invalidFiles.length > 0) {
      alert('Please fill in the title and FHA number for all files')
      return
    }

    setUploading(true)

    const results = []

    for (let i = 0; i < files.length; i++) {
      const fileItem = files[i]
      if (fileItem.status !== 'pending') continue

      // Update status to uploading
      setFiles(prev => prev.map((f, idx) =>
        idx === i ? { ...f, status: 'uploading' } : f
      ))

      try {
        // Generate a temporary ID for the upload path
        const tempId = `temp_${Date.now()}_${i}`

        // Upload file to storage
        const uploadResult = await uploadFHADocument(fileItem.file, tempId)

        // Create FHA record
        const fhaData = {
          title: fileItem.meta.title.trim(),
          fhaNumber: fileItem.meta.fhaNumber.trim(),
          category: fileItem.meta.category,
          description: fileItem.meta.description?.trim() || '',
          source: 'uploaded',
          status: 'under_review',
          // Default risk values - user can edit later
          likelihood: 3,
          severity: 3,
          riskScore: 9,
          residualLikelihood: 2,
          residualSeverity: 2,
          residualRiskScore: 4,
          controlMeasures: [],
          // Document reference
          sourceDocument: {
            url: uploadResult.url,
            path: uploadResult.path,
            name: uploadResult.name,
            size: uploadResult.size,
            type: uploadResult.type,
            uploadedAt: uploadResult.uploadedAt
          },
          keywords: [],
          regulatoryRefs: []
        }

        const savedFHA = await createFormalHazard(fhaData, user.uid)
        results.push(savedFHA)

        // Update status to success
        setFiles(prev => prev.map((f, idx) =>
          idx === i ? { ...f, status: 'success' } : f
        ))
      } catch (err) {
        console.error('Error uploading file:', err)
        setFiles(prev => prev.map((f, idx) =>
          idx === i ? { ...f, status: 'error', error: err.message } : f
        ))
      }
    }

    setUploading(false)

    // If any successful uploads, notify parent
    if (results.length > 0) {
      onSuccess?.(results)
    }
  }

  // Close and reset
  const handleClose = () => {
    if (uploading) return
    setFiles([])
    onClose()
  }

  if (!isOpen) return null

  const pendingCount = files.filter(f => f.status === 'pending').length
  const successCount = files.filter(f => f.status === 'success').length
  const canUpload = pendingCount > 0 && !uploading

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-start justify-center p-4 pt-16">
        <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Upload FHA Documents</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Upload PDF or Word documents to create FHA records
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={uploading}
              className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[calc(100vh-250px)] overflow-y-auto">
            {/* Drop zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPTED_EXTENSIONS}
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />

              <Upload className={`w-10 h-10 mx-auto mb-3 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
              <p className="text-gray-700 font-medium mb-1">
                Drag and drop files here
              </p>
              <p className="text-sm text-gray-500 mb-3">
                or click to browse
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <Plus className="w-4 h-4" />
                Select Files
              </button>
              <p className="text-xs text-gray-400 mt-3">
                Accepted formats: PDF, DOC, DOCX (max 50MB each)
              </p>
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700">
                    Files ({files.length})
                  </h3>
                  {successCount > 0 && (
                    <span className="text-sm text-green-600">
                      {successCount} uploaded successfully
                    </span>
                  )}
                </div>

                {files.map((fileItem, index) => (
                  <FileItem
                    key={`${fileItem.file.name}-${index}`}
                    file={fileItem.file}
                    status={fileItem.status}
                    error={fileItem.error}
                    meta={fileItem.meta}
                    onRemove={() => removeFile(index)}
                    onUpdateMeta={(meta) => updateFileMeta(index, meta)}
                  />
                ))}
              </div>
            )}

            {/* Info box */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Note about uploaded FHAs</p>
                  <ul className="mt-1 space-y-1 text-blue-700">
                    <li>• Uploaded FHAs are marked as "Under Review" by default</li>
                    <li>• You can edit the risk assessment and controls after upload</li>
                    <li>• The original document will be stored and linked to the FHA</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <div className="text-sm text-gray-500">
              {pendingCount > 0 && `${pendingCount} file${pendingCount !== 1 ? 's' : ''} ready to upload`}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={uploading}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                {successCount > 0 ? 'Done' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleUploadAll}
                disabled={!canUpload}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload {pendingCount > 0 ? `(${pendingCount})` : ''}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
