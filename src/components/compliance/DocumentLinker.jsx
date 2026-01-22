/**
 * DocumentLinker.jsx
 * Modal for linking documents to compliance requirements
 *
 * Features:
 * - Search policies from PolicyLibrary
 * - Select specific sections/pages
 * - Add external document references
 * - Preview linked documents
 *
 * @location src/components/compliance/DocumentLinker.jsx
 */

import React, { useState, useEffect, useMemo } from 'react'
import {
  X,
  Search,
  FileText,
  Book,
  Paperclip,
  Link as LinkIcon,
  Check,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Plus,
  Loader2,
  AlertCircle,
  Upload,
  Globe,
  Building2
} from 'lucide-react'
import { getPoliciesEnhanced } from '../../lib/firestorePolicies'
import { logger } from '../../lib/logger'

// ============================================
// DOCUMENT SOURCE TYPES
// ============================================

const DOCUMENT_SOURCES = {
  policy: {
    id: 'policy',
    name: 'Policy Library',
    description: 'Link to internal policies and procedures',
    icon: Book
  },
  project: {
    id: 'project',
    name: 'Project Documents',
    description: 'Link to documents from current project',
    icon: FileText
  },
  external: {
    id: 'external',
    name: 'External Reference',
    description: 'Add reference to external document or URL',
    icon: Globe
  },
  upload: {
    id: 'upload',
    name: 'Upload Document',
    description: 'Upload a new document',
    icon: Upload
  }
}

// ============================================
// SUB-COMPONENTS
// ============================================

function SourceTab({ source, isActive, onClick }) {
  const Icon = source.icon

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        isActive
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      <Icon className="w-4 h-4" />
      {source.name}
    </button>
  )
}

function PolicyItem({ policy, isSelected, onSelect, onToggleSections, showSections }) {
  const [sectionsExpanded, setSectionsExpanded] = useState(false)

  return (
    <div className={`border rounded-lg overflow-hidden ${
      isSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div
        onClick={() => onSelect(policy)}
        className="flex items-center gap-3 p-3 cursor-pointer"
      >
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
          isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
        }`}>
          {isSelected && <Check className="w-3 h-3 text-white" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
              {policy.number}
            </span>
            <span className="font-medium text-gray-900 truncate">{policy.title}</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{policy.description}</p>
        </div>

        {policy.sections?.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setSectionsExpanded(!sectionsExpanded)
            }}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${sectionsExpanded ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Sections */}
      {sectionsExpanded && policy.sections?.length > 0 && (
        <div className="border-t border-gray-100 bg-gray-50 p-2">
          <p className="text-xs text-gray-500 px-2 mb-1">Select specific section (optional)</p>
          <div className="space-y-1">
            {policy.sections.map((section, idx) => (
              <button
                key={idx}
                onClick={() => onToggleSections(policy, section)}
                className="w-full text-left px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
              >
                <ChevronRight className="w-3 h-3 text-gray-400" />
                {section}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SelectedDocumentBadge({ doc, onRemove }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm">
      <FileText className="w-4 h-4" />
      <span className="font-medium">{doc.title}</span>
      {doc.section && (
        <span className="text-blue-500">- {doc.section}</span>
      )}
      <button
        onClick={() => onRemove(doc)}
        className="ml-1 p-0.5 hover:bg-blue-200 rounded"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  )
}

function ExternalReferenceForm({ onAdd }) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')

  const handleAdd = () => {
    if (!title.trim()) return

    onAdd({
      type: 'external',
      title: title.trim(),
      url: url.trim() || null,
      description: description.trim() || null,
      addedAt: new Date().toISOString()
    })

    setTitle('')
    setUrl('')
    setDescription('')
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Document Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Operations Manual Section 3.2"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL (optional)
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description or page/section reference"
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <button
        onClick={handleAdd}
        disabled={!title.trim()}
        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Reference
      </button>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function DocumentLinker({
  isOpen,
  onClose,
  currentDocRefs = [],
  suggestedPolicies = [],
  suggestedDocTypes = [],
  onSave
}) {
  const [activeSource, setActiveSource] = useState('policy')
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDocs, setSelectedDocs] = useState([])

  // Initialize with current document refs
  useEffect(() => {
    if (isOpen) {
      setSelectedDocs(currentDocRefs || [])
    }
  }, [isOpen, currentDocRefs])

  // Load policies
  useEffect(() => {
    async function loadPolicies() {
      try {
        const data = await getPoliciesEnhanced()
        setPolicies(data)
      } catch (err) {
        logger.error('Error loading policies:', err)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen && activeSource === 'policy') {
      loadPolicies()
    }
  }, [isOpen, activeSource])

  // Filter policies
  const filteredPolicies = useMemo(() => {
    let result = [...policies]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.title?.toLowerCase().includes(query) ||
        p.number?.includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.keywords?.some(k => k.toLowerCase().includes(query))
      )
    }

    // Sort suggested policies first
    if (suggestedPolicies.length > 0) {
      result.sort((a, b) => {
        const aIsSuggested = suggestedPolicies.includes(a.number)
        const bIsSuggested = suggestedPolicies.includes(b.number)
        if (aIsSuggested && !bIsSuggested) return -1
        if (!aIsSuggested && bIsSuggested) return 1
        return 0
      })
    }

    return result
  }, [policies, searchQuery, suggestedPolicies])

  // Check if policy is selected
  const isPolicySelected = (policy) => {
    return selectedDocs.some(d => d.type === 'policy' && d.sourceId === policy.id)
  }

  // Handle policy selection
  const handleSelectPolicy = (policy) => {
    if (isPolicySelected(policy)) {
      setSelectedDocs(prev => prev.filter(d => !(d.type === 'policy' && d.sourceId === policy.id)))
    } else {
      setSelectedDocs(prev => [...prev, {
        type: 'policy',
        sourceId: policy.id,
        title: `Policy ${policy.number}: ${policy.title}`,
        number: policy.number,
        version: policy.version,
        section: null
      }])
    }
  }

  // Handle section selection
  const handleSelectSection = (policy, section) => {
    // Remove any existing reference to this policy
    const filtered = selectedDocs.filter(d => !(d.type === 'policy' && d.sourceId === policy.id))

    // Add with section
    setSelectedDocs([...filtered, {
      type: 'policy',
      sourceId: policy.id,
      title: `Policy ${policy.number}: ${policy.title}`,
      number: policy.number,
      version: policy.version,
      section
    }])
  }

  // Handle external reference
  const handleAddExternal = (ref) => {
    setSelectedDocs(prev => [...prev, ref])
  }

  // Remove document
  const handleRemoveDoc = (doc) => {
    setSelectedDocs(prev => prev.filter(d =>
      !(d.type === doc.type && (d.sourceId === doc.sourceId || d.title === doc.title))
    ))
  }

  // Save and close
  const handleSave = () => {
    onSave(selectedDocs)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Link Documents</h2>
            <p className="text-sm text-gray-500">
              Select documents to reference for this requirement
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Documents */}
        {selectedDocs.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Selected ({selectedDocs.length})</p>
            <div className="flex flex-wrap gap-2">
              {selectedDocs.map((doc, idx) => (
                <SelectedDocumentBadge
                  key={idx}
                  doc={doc}
                  onRemove={handleRemoveDoc}
                />
              ))}
            </div>
          </div>
        )}

        {/* Source Tabs */}
        <div className="flex border-b border-gray-200 px-4">
          {Object.values(DOCUMENT_SOURCES).map(source => (
            <SourceTab
              key={source.id}
              source={source}
              isActive={activeSource === source.id}
              onClick={() => setActiveSource(source.id)}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeSource === 'policy' && (
            <div className="space-y-4">
              {/* Suggested Policies Banner */}
              {suggestedPolicies.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Suggested:</strong> Policies {suggestedPolicies.join(', ')} may be relevant to this requirement
                  </p>
                </div>
              )}

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                <label htmlFor="policy-linker-search" className="sr-only">Search policies</label>
                <input
                  id="policy-linker-search"
                  type="search"
                  placeholder="Search policies by number, title, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Policy List */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : filteredPolicies.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">No policies found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPolicies.map(policy => (
                    <PolicyItem
                      key={policy.id}
                      policy={policy}
                      isSelected={isPolicySelected(policy)}
                      onSelect={handleSelectPolicy}
                      onToggleSections={handleSelectSection}
                      showSections={true}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSource === 'project' && (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-gray-900 font-medium mb-2">Project Documents</h3>
              <p className="text-gray-500 text-sm">
                Link project to this application to access project documents
              </p>
            </div>
          )}

          {activeSource === 'external' && (
            <ExternalReferenceForm onAdd={handleAddExternal} />
          )}

          {activeSource === 'upload' && (
            <div className="text-center py-12">
              <Upload className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-gray-900 font-medium mb-2">Upload Document</h3>
              <p className="text-gray-500 text-sm mb-4">
                Upload supporting documents directly
              </p>
              <button className="btn-secondary">
                Select File
              </button>
              <p className="text-xs text-gray-400 mt-2">
                PDF, DOC, DOCX up to 10MB
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-500">
            {selectedDocs.length} document{selectedDocs.length !== 1 ? 's' : ''} selected
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Save References
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
