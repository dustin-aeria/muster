/**
 * DocumentLinkPopover.jsx
 * Popover for inserting cross-reference links in the editor
 */

import { useState, useEffect, useRef } from 'react'
import {
  Link2,
  FileText,
  ChevronRight,
  Search,
  X,
  Check
} from 'lucide-react'

export default function DocumentLinkPopover({
  isOpen,
  onClose,
  position = { top: 0, left: 0 },
  projectDocuments = [],
  currentDocumentId,
  onInsertLink
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDocId, setSelectedDocId] = useState(null)
  const [selectedSectionId, setSelectedSectionId] = useState(null)
  const popoverRef = useRef(null)

  // Filter out current document
  const availableDocuments = projectDocuments.filter(
    doc => doc.id !== currentDocumentId
  )

  // Filter documents by search
  const filteredDocuments = availableDocuments.filter(doc =>
    doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.type?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get selected document
  const selectedDocument = availableDocuments.find(doc => doc.id === selectedDocId)

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('')
      setSelectedDocId(null)
      setSelectedSectionId(null)
    }
  }, [isOpen])

  const handleSelectDocument = (docId) => {
    if (selectedDocId === docId) {
      // Toggle off
      setSelectedDocId(null)
      setSelectedSectionId(null)
    } else {
      setSelectedDocId(docId)
      setSelectedSectionId(null)
    }
  }

  const handleInsert = () => {
    if (!selectedDocId) return

    const doc = availableDocuments.find(d => d.id === selectedDocId)
    const section = selectedSectionId
      ? doc?.sections?.find(s => s.id === selectedSectionId)
      : null

    // Generate link text
    let linkText = `[See: ${doc.title}`
    if (section) {
      linkText += ` - ${section.title}`
    }
    linkText += `]`

    onInsertLink?.({
      documentId: selectedDocId,
      sectionId: selectedSectionId,
      documentTitle: doc.title,
      sectionTitle: section?.title,
      linkText
    })

    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      ref={popoverRef}
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 w-80"
      style={{
        top: position.top,
        left: position.left,
        maxHeight: '400px'
      }}
    >
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-gray-900">Insert Document Link</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="p-2 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            autoFocus
            className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
          />
        </div>
      </div>

      {/* Document List */}
      <div className="max-h-64 overflow-y-auto">
        {filteredDocuments.length === 0 ? (
          <div className="px-3 py-6 text-center">
            <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              {searchQuery ? 'No documents match your search' : 'No other documents available'}
            </p>
          </div>
        ) : (
          <div className="py-1">
            {filteredDocuments.map(doc => (
              <div key={doc.id}>
                {/* Document Item */}
                <button
                  onClick={() => handleSelectDocument(doc.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                    selectedDocId === doc.id ? 'bg-green-50' : ''
                  }`}
                >
                  <FileText className={`w-4 h-4 flex-shrink-0 ${
                    selectedDocId === doc.id ? 'text-green-600' : 'text-gray-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      selectedDocId === doc.id ? 'text-green-700' : 'text-gray-900'
                    }`}>
                      {doc.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {doc.type?.replace(/_/g, ' ')}
                    </p>
                  </div>
                  {doc.sections?.length > 0 && (
                    <ChevronRight className={`w-4 h-4 transition-transform ${
                      selectedDocId === doc.id ? 'rotate-90 text-green-600' : 'text-gray-400'
                    }`} />
                  )}
                  {selectedDocId === doc.id && !selectedSectionId && (
                    <Check className="w-4 h-4 text-green-600" />
                  )}
                </button>

                {/* Sections (if document is selected) */}
                {selectedDocId === doc.id && doc.sections?.length > 0 && (
                  <div className="bg-gray-50 border-y border-gray-100">
                    <p className="px-3 py-1.5 text-xs font-medium text-gray-500 uppercase">
                      Sections
                    </p>
                    {doc.sections.map(section => (
                      <button
                        key={section.id}
                        onClick={() => setSelectedSectionId(
                          selectedSectionId === section.id ? null : section.id
                        )}
                        className={`w-full flex items-center gap-2 px-3 py-2 pl-8 text-left hover:bg-gray-100 transition-colors ${
                          selectedSectionId === section.id ? 'bg-green-100' : ''
                        }`}
                      >
                        <span className={`text-sm truncate ${
                          selectedSectionId === section.id ? 'text-green-700 font-medium' : 'text-gray-700'
                        }`}>
                          {section.title}
                        </span>
                        {selectedSectionId === section.id && (
                          <Check className="w-4 h-4 text-green-600 ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {selectedDocId && (
        <div className="px-3 py-2 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-500 truncate flex-1">
            Link to: {selectedDocument?.title}
            {selectedSectionId && ` → ${selectedDocument?.sections?.find(s => s.id === selectedSectionId)?.title}`}
          </p>
          <button
            onClick={handleInsert}
            className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <Check className="w-3 h-3" />
            Insert
          </button>
        </div>
      )}
    </div>
  )
}
