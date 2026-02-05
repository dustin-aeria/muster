/**
 * EvidenceUploadModal.jsx
 * Modal for uploading evidence files with metadata and requirement linking
 *
 * @location src/components/safetyDeclaration/EvidenceUploadModal.jsx
 */

import { useState, useEffect, useRef } from 'react'
import {
  X,
  Upload,
  FileText,
  FileSpreadsheet,
  Calculator,
  Image,
  Video,
  Factory,
  Award,
  PenTool,
  FileCode,
  AlertCircle,
  CheckCircle2,
  Link2,
  Loader2
} from 'lucide-react'
import {
  addEvidence,
  EVIDENCE_TYPES
} from '../../lib/firestoreSafetyDeclaration'
import { uploadDeclarationEvidence } from '../../lib/storageHelpers'

// Map icon names to components
const ICON_MAP = {
  FileText,
  FileSpreadsheet,
  Calculator,
  Image,
  Video,
  Factory,
  Award,
  PenTool,
  FileCode
}

export default function EvidenceUploadModal({
  isOpen,
  onClose,
  declarationId,
  requirements = [],
  sessions = [],
  onUploaded
}) {
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'test_report',
    linkedRequirements: [],
    testingSessionId: ''
  })

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFile(null)
      setError(null)
      setUploadProgress(0)
      setFormData({
        name: '',
        description: '',
        type: 'test_report',
        linkedRequirements: [],
        testingSessionId: ''
      })
    }
  }, [isOpen])

  // Auto-fill name from file
  useEffect(() => {
    if (file && !formData.name) {
      // Remove extension for default name
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
      setFormData(prev => ({ ...prev, name: nameWithoutExt }))
    }
  }, [file])

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      setFile(droppedFile)
      setError(null)
    }
  }

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
    }
  }

  const toggleRequirement = (reqId) => {
    setFormData(prev => ({
      ...prev,
      linkedRequirements: prev.linkedRequirements.includes(reqId)
        ? prev.linkedRequirements.filter(id => id !== reqId)
        : [...prev.linkedRequirements, reqId]
    }))
  }

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file to upload')
      return
    }

    if (!formData.name.trim()) {
      setError('Please enter a name for the evidence')
      return
    }

    setUploading(true)
    setError(null)
    setUploadProgress(10)

    try {
      // Upload file to Firebase Storage
      setUploadProgress(30)
      const uploadResult = await uploadDeclarationEvidence(file, declarationId, formData.type)
      setUploadProgress(70)

      // Create evidence document in Firestore
      await addEvidence(declarationId, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        fileUrl: uploadResult.url,
        fileName: uploadResult.name,
        fileSize: uploadResult.size,
        mimeType: uploadResult.type,
        storagePath: uploadResult.path,
        linkedRequirements: formData.linkedRequirements,
        testingSessionId: formData.testingSessionId || null,
        uploadedBy: 'current_user' // TODO: Get from auth context
      })

      setUploadProgress(100)

      if (onUploaded) onUploaded()
      onClose()
    } catch (err) {
      console.error('Error uploading evidence:', err)
      setError(err.message || 'Failed to upload evidence')
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFileIcon = () => {
    if (!file) return FileText
    const type = file.type

    if (type.startsWith('image/')) return Image
    if (type.startsWith('video/')) return Video
    if (type.includes('spreadsheet') || type.includes('excel')) return FileSpreadsheet
    if (type.includes('pdf')) return FileText
    return FileText
  }

  const FileIcon = getFileIcon()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-900">Upload Evidence</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* File Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                dragOver
                  ? 'border-blue-500 bg-blue-50'
                  : file
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.jpg,.jpeg,.png,.webp,.heic,.mp4,.mov,.webm,.zip"
              />

              {file ? (
                <div className="flex flex-col items-center">
                  <div className="p-3 bg-green-100 rounded-full mb-3">
                    <FileIcon className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500 mt-1">{formatFileSize(file.size)}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setFile(null)
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-900 font-medium">Drop file here or click to browse</p>
                  <p className="text-sm text-gray-500 mt-1">
                    PDF, Word, Excel, images, videos up to 100MB
                  </p>
                </>
              )}
            </div>

            {/* Evidence Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Evidence Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Position Accuracy Test Report"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Evidence Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Evidence Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(EVIDENCE_TYPES).map(([key, type]) => {
                  const TypeIcon = ICON_MAP[type.icon] || FileText
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: key }))}
                      className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-all text-left text-sm ${
                        formData.type === key
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <TypeIcon className={`w-4 h-4 ${
                        formData.type === key ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <span className="truncate">{type.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this evidence demonstrates..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Link to Testing Session */}
            {sessions.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link to Testing Session (Optional)
                </label>
                <select
                  value={formData.testingSessionId}
                  onChange={(e) => setFormData(prev => ({ ...prev, testingSessionId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">No linked session</option>
                  {sessions.map(session => (
                    <option key={session.id} value={session.id}>
                      {session.name} ({session.status})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Link to Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Link2 className="w-4 h-4 inline mr-1" />
                Link to Requirements
              </label>
              {requirements.length > 0 ? (
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
                  {requirements.map(req => (
                    <label
                      key={req.id}
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-50 ${
                        formData.linkedRequirements.includes(req.id) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.linkedRequirements.includes(req.id)}
                        onChange={() => toggleRequirement(req.id)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-700">{req.requirementId}</span>
                        <p className="text-xs text-gray-500 truncate">{req.text}</p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg text-center">
                  No requirements available to link
                </p>
              )}

              {formData.linkedRequirements.length > 0 && (
                <p className="text-sm text-blue-600 mt-2">
                  {formData.linkedRequirements.length} requirement{formData.linkedRequirements.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  <span className="text-sm text-blue-700">Uploading evidence...</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={uploading || !file || !formData.name.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Evidence
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
