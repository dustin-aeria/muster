/**
 * CreateDocumentModal.jsx
 * Modal for creating a new document within a project
 */

import { useState } from 'react'
import { X, FileText } from 'lucide-react'
import DocumentTypeSelector from './DocumentTypeSelector'
import { DOCUMENT_TYPES } from '../../lib/firestoreDocumentGeneration'

export default function CreateDocumentModal({ isOpen, onClose, onSubmit, projectName }) {
  const [selectedType, setSelectedType] = useState('')
  const [title, setTitle] = useState('')
  const [specificRequirements, setSpecificRequirements] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Auto-generate title when type changes
  const handleTypeSelect = (type) => {
    setSelectedType(type)
    if (!title || DOCUMENT_TYPES[selectedType]?.label === title) {
      setTitle(DOCUMENT_TYPES[type]?.label || '')
    }
  }

  const handleSubmit = async () => {
    if (!selectedType || !title.trim()) return

    setSubmitting(true)
    try {
      await onSubmit({
        type: selectedType,
        title: title.trim(),
        specificRequirements: specificRequirements.trim()
      })
      // Reset form
      setSelectedType('')
      setTitle('')
      setSpecificRequirements('')
      onClose()
    } catch (error) {
      console.error('Error creating document:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit = selectedType && title.trim()

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
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Create New Document
              </h2>
              {projectName && (
                <p className="text-sm text-gray-500">
                  Adding to: {projectName}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-6">
              {/* Document Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Type *
                </label>
                <DocumentTypeSelector
                  selectedType={selectedType}
                  onSelect={handleTypeSelect}
                />
              </div>

              {/* Document Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter document title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  This will be the main title shown on the document
                </p>
              </div>

              {/* Specific Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specific Requirements (Optional)
                </label>
                <textarea
                  value={specificRequirements}
                  onChange={(e) => setSpecificRequirements(e.target.value)}
                  placeholder="Any specific requirements, standards, or considerations for this document..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  These will be used by the AI when generating content
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-4 h-4" />
              {submitting ? 'Creating...' : 'Create Document'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
