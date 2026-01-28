/**
 * PermitDetailPanel.jsx
 * Slide-out panel for viewing full permit details
 *
 * Features:
 * - Full permit information display
 * - Privileges and conditions sections
 * - Document list with upload capability
 * - Edit and delete actions
 *
 * @location src/components/permits/PermitDetailPanel.jsx
 */

import { useState, useRef } from 'react'
import PropTypes from 'prop-types'
import {
  X,
  Pencil,
  Trash2,
  Calendar,
  Building2,
  MapPin,
  Plane,
  Check,
  AlertCircle,
  FileText,
  Upload,
  Download,
  ExternalLink,
  Loader2,
  Clock,
  Tag
} from 'lucide-react'
import { Timestamp } from 'firebase/firestore'
import {
  PERMIT_TYPES,
  OPERATION_TYPES,
  getDaysUntilExpiry,
  deletePermit,
  addPermitDocument,
  removePermitDocument
} from '../../lib/firestorePermits'
import PermitStatusBadge from './PermitStatusBadge'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../../lib/firebase'
import { logger } from '../../lib/logger'

function formatDate(date) {
  if (!date) return '—'
  const d = date instanceof Timestamp ? date.toDate() : new Date(date)
  return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function PermitDetailPanel({ permit, isOpen, onClose, onEdit, onDelete, onUpdate }) {
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deletingDoc, setDeletingDoc] = useState(null)
  const fileInputRef = useRef(null)

  if (!isOpen || !permit) return null

  const permitType = PERMIT_TYPES[permit.type] || PERMIT_TYPES.other
  const daysUntilExpiry = getDaysUntilExpiry(permit)

  const handleDelete = async () => {
    try {
      setDeleting(true)

      // Delete all documents from storage first
      for (const doc of (permit.documents || [])) {
        if (doc.path) {
          try {
            const storageRef = ref(storage, doc.path)
            await deleteObject(storageRef)
          } catch (err) {
            logger.warn('Failed to delete document from storage:', err)
          }
        }
      }

      await deletePermit(permit.id)
      onDelete?.()
      onClose()
    } catch (error) {
      logger.error('Error deleting permit:', error)
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)

      // Upload to Firebase Storage
      const storagePath = `permits/${permit.id}/${Date.now()}_${file.name}`
      const storageRef = ref(storage, storagePath)
      await uploadBytes(storageRef, file)
      const downloadUrl = await getDownloadURL(storageRef)

      // Add document reference to permit
      await addPermitDocument(permit.id, {
        name: file.name,
        path: storagePath,
        url: downloadUrl,
        type: file.type,
        size: file.size
      })

      onUpdate?.()
    } catch (error) {
      logger.error('Error uploading document:', error)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteDocument = async (doc) => {
    try {
      setDeletingDoc(doc.id)

      // Delete from storage
      if (doc.path) {
        const storageRef = ref(storage, doc.path)
        await deleteObject(storageRef)
      }

      // Remove reference from permit
      await removePermitDocument(permit.id, doc.id)
      onUpdate?.()
    } catch (error) {
      logger.error('Error deleting document:', error)
    } finally {
      setDeletingDoc(null)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-xl bg-white shadow-xl z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <PermitStatusBadge status={permit.status} />
                <span className="text-sm text-gray-500">{permitType.shortName}</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">{permit.name}</h2>
              {permit.permitNumber && (
                <p className="text-sm text-gray-500 font-mono mt-1">{permit.permitNumber}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit?.(permit)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Edit permit"
              >
                <Pencil className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete permit"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Key Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Building2 className="w-4 h-4" />
                <span className="text-xs font-medium">Authority</span>
              </div>
              <p className="text-sm text-gray-900">{permit.issuingAuthority || permitType.authority}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-medium">Expiry</span>
              </div>
              <p className="text-sm text-gray-900">{formatDate(permit.expiryDate)}</p>
              {daysUntilExpiry !== null && (
                <p className={`text-xs mt-0.5 ${
                  daysUntilExpiry < 0 ? 'text-red-600' :
                  daysUntilExpiry <= 30 ? 'text-amber-600' : 'text-gray-500'
                }`}>
                  {daysUntilExpiry < 0
                    ? `Expired ${Math.abs(daysUntilExpiry)} days ago`
                    : `${daysUntilExpiry} days remaining`
                  }
                </p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Validity Period
            </h3>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Issue Date</p>
                <p className="font-medium">{formatDate(permit.issueDate)}</p>
              </div>
              <div>
                <p className="text-gray-500">Effective</p>
                <p className="font-medium">{formatDate(permit.effectiveDate)}</p>
              </div>
              <div>
                <p className="text-gray-500">Expiry</p>
                <p className="font-medium">{formatDate(permit.expiryDate)}</p>
              </div>
            </div>
          </div>

          {/* Geographic Area */}
          {permit.geographicArea && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Geographic Area
              </h3>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {permit.geographicArea}
              </p>
            </div>
          )}

          {/* Operation Types */}
          {permit.operationTypes?.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Plane className="w-4 h-4" />
                Authorized Operations
              </h3>
              <div className="flex flex-wrap gap-2">
                {permit.operationTypes.map(typeId => {
                  const opType = OPERATION_TYPES.find(t => t.id === typeId)
                  return (
                    <span
                      key={typeId}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded-lg"
                    >
                      {opType?.label || typeId}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {/* Aircraft */}
          {permit.aircraftRegistrations?.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Aircraft Registrations</h3>
              <div className="flex flex-wrap gap-2">
                {permit.aircraftRegistrations.map(reg => (
                  <span
                    key={reg}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-sm font-mono rounded"
                  >
                    {reg}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Privileges */}
          {permit.privileges?.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                Privileges
              </h3>
              <div className="space-y-2">
                {permit.privileges.map(priv => (
                  <div key={priv.id} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-900">{priv.description}</p>
                        {priv.conditions && (
                          <p className="text-xs text-gray-500 mt-1">Conditions: {priv.conditions}</p>
                        )}
                        {priv.reference && (
                          <p className="text-xs text-gray-400 mt-0.5">Ref: {priv.reference}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conditions */}
          {permit.conditions?.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Conditions & Restrictions
              </h3>
              <div className="space-y-2">
                {permit.conditions.map(cond => (
                  <div
                    key={cond.id}
                    className={`p-3 rounded-lg border ${
                      cond.isCritical
                        ? 'bg-red-50 border-red-200'
                        : 'bg-amber-50 border-amber-200'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        cond.isCritical ? 'text-red-600' : 'text-amber-600'
                      }`} />
                      <div>
                        {cond.isCritical && (
                          <span className="inline-block text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded mb-1">
                            CRITICAL
                          </span>
                        )}
                        <p className="text-sm text-gray-900">{cond.description}</p>
                        <p className="text-xs text-gray-500 mt-0.5 uppercase">{cond.category}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documents
            </h3>

            {permit.documents?.length > 0 ? (
              <div className="space-y-2 mb-3">
                {permit.documents.map(doc => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(doc.size)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <a
                        href={doc.url}
                        download={doc.name}
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDeleteDocument(doc)}
                        disabled={deletingDoc === doc.id}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingDoc === doc.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-3">No documents uploaded</p>
            )}

            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Document
                </>
              )}
            </button>
          </div>

          {/* Tags */}
          {permit.tags?.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {permit.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {permit.notes && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                {permit.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Permit</h3>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{permit.name}</strong>?
              This will also delete all uploaded documents. This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete Permit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

PermitDetailPanel.propTypes = {
  permit: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onUpdate: PropTypes.func
}
