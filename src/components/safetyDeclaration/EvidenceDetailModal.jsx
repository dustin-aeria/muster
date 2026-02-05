/**
 * EvidenceDetailModal.jsx
 * Modal for viewing and editing evidence details, managing requirement links
 *
 * @location src/components/safetyDeclaration/EvidenceDetailModal.jsx
 */

import { useState, useEffect } from 'react'
import {
  X,
  Download,
  Trash2,
  Save,
  Edit,
  FileText,
  FileSpreadsheet,
  Calculator,
  Image,
  Video,
  Factory,
  Award,
  PenTool,
  FileCode,
  Link2,
  ExternalLink,
  Calendar,
  User,
  AlertCircle,
  CheckCircle2,
  Plus
} from 'lucide-react'
import {
  updateEvidence,
  deleteEvidence,
  linkEvidenceToRequirement,
  unlinkEvidenceFromRequirement,
  EVIDENCE_TYPES
} from '../../lib/firestoreSafetyDeclaration'

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

export default function EvidenceDetailModal({
  isOpen,
  onClose,
  evidence,
  declarationId,
  requirements = [],
  sessions = [],
  onUpdate
}) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [showLinkModal, setShowLinkModal] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'test_report'
  })

  // Initialize form data when evidence changes
  useEffect(() => {
    if (evidence) {
      setFormData({
        name: evidence.name || '',
        description: evidence.description || '',
        type: evidence.type || 'test_report'
      })
      setEditing(false)
      setError(null)
    }
  }, [evidence])

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Please enter a name for the evidence')
      return
    }

    setSaving(true)
    setError(null)

    try {
      await updateEvidence(declarationId, evidence.id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type
      })

      setEditing(false)
      if (onUpdate) onUpdate()
    } catch (err) {
      console.error('Error updating evidence:', err)
      setError(err.message || 'Failed to update evidence')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${evidence.name}"? This will also unlink it from all requirements.`)) {
      return
    }

    try {
      await deleteEvidence(declarationId, evidence.id)
      if (onUpdate) onUpdate()
      onClose()
    } catch (err) {
      console.error('Error deleting evidence:', err)
      setError(err.message || 'Failed to delete evidence')
    }
  }

  const handleLinkRequirement = async (reqId) => {
    try {
      await linkEvidenceToRequirement(declarationId, reqId, evidence.id)
      if (onUpdate) onUpdate()
    } catch (err) {
      console.error('Error linking requirement:', err)
    }
  }

  const handleUnlinkRequirement = async (reqId) => {
    try {
      await unlinkEvidenceFromRequirement(declarationId, reqId, evidence.id)
      if (onUpdate) onUpdate()
    } catch (err) {
      console.error('Error unlinking requirement:', err)
    }
  }

  const formatDate = (date) => {
    if (!date) return '-'
    if (typeof date === 'string') date = new Date(date)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '-'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getTypeIcon = (type) => {
    const typeInfo = EVIDENCE_TYPES[type]
    if (!typeInfo) return FileText
    return ICON_MAP[typeInfo.icon] || FileText
  }

  const isImage = (mimeType) => mimeType?.startsWith('image/')
  const isPdf = (mimeType) => mimeType === 'application/pdf'
  const isVideo = (mimeType) => mimeType?.startsWith('video/')

  // Get linked requirements details
  const linkedReqs = requirements.filter(r =>
    evidence?.linkedRequirements?.includes(r.id)
  )

  // Get unlinked requirements for linking
  const unlinkedReqs = requirements.filter(r =>
    !evidence?.linkedRequirements?.includes(r.id)
  )

  // Get linked session
  const linkedSession = sessions.find(s => s.id === evidence?.testingSessionId)

  if (!isOpen || !evidence) return null

  const typeInfo = EVIDENCE_TYPES[evidence.type] || { label: 'Document' }
  const TypeIcon = getTypeIcon(evidence.type)

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <TypeIcon className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                {editing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="text-lg font-semibold text-gray-900 border-b-2 border-blue-500 focus:outline-none"
                  />
                ) : (
                  <h2 className="text-lg font-semibold text-gray-900">{evidence.name}</h2>
                )}
                <p className="text-sm text-gray-500">{typeInfo.label}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {error && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              {/* Left Column - Preview & File Info */}
              <div className="space-y-4">
                {/* File Preview */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {isImage(evidence.mimeType) && evidence.fileUrl ? (
                    <img
                      src={evidence.fileUrl}
                      alt={evidence.name}
                      className="w-full h-64 object-contain bg-gray-50"
                    />
                  ) : isPdf(evidence.mimeType) && evidence.fileUrl ? (
                    <div className="h-64 bg-gray-50 flex flex-col items-center justify-center">
                      <FileText className="w-16 h-16 text-red-500 mb-2" />
                      <p className="text-sm text-gray-600">PDF Document</p>
                      <a
                        href={evidence.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open in new tab
                      </a>
                    </div>
                  ) : isVideo(evidence.mimeType) && evidence.fileUrl ? (
                    <video
                      src={evidence.fileUrl}
                      controls
                      className="w-full h-64 bg-black"
                    />
                  ) : (
                    <div className="h-64 bg-gray-50 flex flex-col items-center justify-center">
                      <TypeIcon className="w-16 h-16 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">{evidence.fileName}</p>
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-gray-900">File Information</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">File Name</p>
                      <p className="text-gray-900 truncate">{evidence.fileName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Size</p>
                      <p className="text-gray-900">{formatFileSize(evidence.fileSize)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Type</p>
                      <p className="text-gray-900">{evidence.mimeType || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Uploaded</p>
                      <p className="text-gray-900">{formatDate(evidence.createdAt)}</p>
                    </div>
                  </div>

                  {evidence.fileUrl && (
                    <a
                      href={evidence.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm w-full justify-center"
                    >
                      <Download className="w-4 h-4" />
                      Download File
                    </a>
                  )}
                </div>
              </div>

              {/* Right Column - Details & Links */}
              <div className="space-y-4">
                {/* Evidence Type (editable) */}
                {editing && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Evidence Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {Object.entries(EVIDENCE_TYPES).map(([key, type]) => (
                        <option key={key} value={key}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  {editing ? (
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe what this evidence demonstrates..."
                    />
                  ) : (
                    <p className="text-gray-700 text-sm bg-gray-50 rounded-lg p-3">
                      {evidence.description || 'No description provided'}
                    </p>
                  )}
                </div>

                {/* Linked Testing Session */}
                {linkedSession && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Linked Testing Session
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-purple-700">{linkedSession.name}</span>
                    </div>
                  </div>
                )}

                {/* Linked Requirements */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Linked Requirements
                    </label>
                    <button
                      onClick={() => setShowLinkModal(true)}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Link
                    </button>
                  </div>

                  {linkedReqs.length > 0 ? (
                    <div className="space-y-2">
                      {linkedReqs.map(req => (
                        <div
                          key={req.id}
                          className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-green-700">{req.requirementId}</p>
                            <p className="text-xs text-green-600 truncate">{req.text}</p>
                          </div>
                          <button
                            onClick={() => handleUnlinkRequirement(req.id)}
                            className="ml-2 p-1 text-green-600 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Unlink"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-orange-50 rounded-lg text-center">
                      <Link2 className="w-6 h-6 text-orange-400 mx-auto mb-1" />
                      <p className="text-sm text-orange-600">Not linked to any requirements</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>

            <div className="flex items-center gap-2">
              {editing ? (
                <>
                  <button
                    onClick={() => {
                      setEditing(false)
                      setFormData({
                        name: evidence.name || '',
                        description: evidence.description || '',
                        type: evidence.type || 'test_report'
                      })
                    }}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Link Requirements Mini Modal */}
        {showLinkModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/30"
              onClick={() => setShowLinkModal(false)}
            />
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md max-h-96 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <h3 className="font-medium text-gray-900">Link to Requirement</h3>
                <button
                  onClick={() => setShowLinkModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {unlinkedReqs.length > 0 ? (
                  unlinkedReqs.map(req => (
                    <button
                      key={req.id}
                      onClick={() => {
                        handleLinkRequirement(req.id)
                        setShowLinkModal(false)
                      }}
                      className="w-full text-left p-3 hover:bg-gray-50 rounded-lg"
                    >
                      <p className="text-sm font-medium text-gray-900">{req.requirementId}</p>
                      <p className="text-xs text-gray-500 truncate">{req.text}</p>
                    </button>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    All requirements are already linked
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
