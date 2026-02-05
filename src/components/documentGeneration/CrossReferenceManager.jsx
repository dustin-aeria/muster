/**
 * CrossReferenceManager.jsx
 * Manage cross-references between documents in a project
 */

import { useState, useEffect } from 'react'
import {
  Link2,
  Plus,
  Trash2,
  ExternalLink,
  FileText,
  Search,
  X,
  ArrowRight,
  ChevronDown,
  AlertCircle
} from 'lucide-react'

export default function CrossReferenceManager({
  currentDocument,
  projectDocuments = [],
  crossReferences = [],
  onAddReference,
  onRemoveReference,
  onNavigateToDocument,
  isOpen,
  onClose
}) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedDocId, setSelectedDocId] = useState('')
  const [selectedSectionId, setSelectedSectionId] = useState('')
  const [referenceText, setReferenceText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter out current document from available documents
  const availableDocuments = projectDocuments.filter(
    doc => doc.id !== currentDocument?.id
  )

  // Get sections for selected document
  const selectedDocument = availableDocuments.find(doc => doc.id === selectedDocId)
  const availableSections = selectedDocument?.sections || []

  // Filter cross-references by search
  const filteredReferences = crossReferences.filter(ref => {
    if (!searchQuery) return true
    const targetDoc = projectDocuments.find(d => d.id === ref.targetDocumentId)
    return (
      targetDoc?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ref.referenceText?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const handleAddReference = () => {
    if (!selectedDocId || !referenceText.trim()) return

    onAddReference?.({
      targetDocumentId: selectedDocId,
      targetSectionId: selectedSectionId || null,
      referenceText: referenceText.trim()
    })

    // Reset form
    setSelectedDocId('')
    setSelectedSectionId('')
    setReferenceText('')
    setShowAddForm(false)
  }

  const getDocumentById = (id) => {
    return projectDocuments.find(doc => doc.id === id)
  }

  const getSectionById = (docId, sectionId) => {
    const doc = getDocumentById(docId)
    return doc?.sections?.find(s => s.id === sectionId)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Link2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Cross-References
              </h2>
              <p className="text-sm text-gray-500">
                {currentDocument?.title || 'Document'} • {crossReferences.length} references
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Add Button */}
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search references..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
            />
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showAddForm
                ? 'bg-gray-200 text-gray-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {showAddForm ? (
              <>
                <X className="w-4 h-4" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Reference
              </>
            )}
          </button>
        </div>

        {/* Add Reference Form */}
        {showAddForm && (
          <div className="px-6 py-4 border-b border-gray-200 bg-green-50 space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Add New Reference</h3>

            {availableDocuments.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                No other documents in this project to reference.
              </div>
            ) : (
              <>
                {/* Target Document */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Document
                  </label>
                  <select
                    value={selectedDocId}
                    onChange={(e) => {
                      setSelectedDocId(e.target.value)
                      setSelectedSectionId('')
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  >
                    <option value="">Select a document...</option>
                    {availableDocuments.map(doc => (
                      <option key={doc.id} value={doc.id}>
                        {doc.title} ({doc.type?.replace(/_/g, ' ')})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Target Section (optional) */}
                {selectedDocId && availableSections.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Section (optional)
                    </label>
                    <select
                      value={selectedSectionId}
                      onChange={(e) => setSelectedSectionId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    >
                      <option value="">Entire document</option>
                      {availableSections.map(section => (
                        <option key={section.id} value={section.id}>
                          {section.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Reference Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reference Text
                  </label>
                  <input
                    type="text"
                    value={referenceText}
                    onChange={(e) => setReferenceText(e.target.value)}
                    placeholder="e.g., 'See Training Manual for detailed procedures'"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    This text will appear in your document as a cross-reference link.
                  </p>
                </div>

                {/* Add Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleAddReference}
                    disabled={!selectedDocId || !referenceText.trim()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Reference
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* References List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredReferences.length === 0 ? (
            <div className="text-center py-12">
              <Link2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Cross-References
              </h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                {searchQuery
                  ? 'No references match your search.'
                  : 'Add cross-references to link this document to other documents in the project.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReferences.map((ref, index) => {
                const targetDoc = getDocumentById(ref.targetDocumentId)
                const targetSection = ref.targetSectionId
                  ? getSectionById(ref.targetDocumentId, ref.targetSectionId)
                  : null

                return (
                  <div
                    key={ref.id || index}
                    className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="p-2 bg-white rounded-lg border border-gray-200">
                      <FileText className="w-4 h-4 text-gray-500" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {targetDoc?.title || 'Unknown Document'}
                        </span>
                        {targetSection && (
                          <>
                            <ArrowRight className="w-3 h-3 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {targetSection.title}
                            </span>
                          </>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 italic">
                        "{ref.referenceText}"
                      </p>
                      {targetDoc?.type && (
                        <span className="inline-block mt-2 px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">
                          {targetDoc.type.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {onNavigateToDocument && targetDoc && (
                        <button
                          onClick={() => onNavigateToDocument(targetDoc.id, ref.targetSectionId)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Go to document"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onRemoveReference?.(ref.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove reference"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {filteredReferences.length} reference{filteredReferences.length !== 1 ? 's' : ''}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
