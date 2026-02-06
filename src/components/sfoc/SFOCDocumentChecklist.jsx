/**
 * SFOCDocumentChecklist.jsx
 * Document checklist component for SFOC applications
 * Displays required documents organized by category with upload/status tracking
 *
 * @location src/components/sfoc/SFOCDocumentChecklist.jsx
 */

import { useState, useMemo } from 'react'
import {
  FileText,
  Upload,
  Check,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Trash2,
  Eye,
  Users,
  Cpu,
  MapPin,
  AlertTriangle,
  Link as LinkIcon
} from 'lucide-react'
import {
  DOCUMENT_CATEGORIES,
  DOCUMENT_STATUSES,
  SFOC_DOCUMENT_REQUIREMENTS,
  SFOC_OPERATION_TRIGGERS,
  updateSFOCDocument
} from '../../lib/firestoreSFOC'

const CATEGORY_ICONS = {
  administrative: FileText,
  operational: MapPin,
  risk: AlertTriangle,
  equipment: Cpu,
  crew: Users
}

export default function SFOCDocumentChecklist({ applicationId, documents, operationTriggers = [] }) {
  const [expandedCategories, setExpandedCategories] = useState(
    Object.keys(DOCUMENT_CATEGORIES).reduce((acc, key) => ({ ...acc, [key]: true }), {})
  )
  const [uploadingDoc, setUploadingDoc] = useState(null)

  // Group documents by category
  const documentsByCategory = useMemo(() => {
    const grouped = {}
    Object.keys(DOCUMENT_CATEGORIES).forEach(cat => {
      grouped[cat] = documents.filter(d => d.category === cat)
    })
    return grouped
  }, [documents])

  // Calculate category stats
  const categoryStats = useMemo(() => {
    const stats = {}
    Object.keys(DOCUMENT_CATEGORIES).forEach(cat => {
      const catDocs = documentsByCategory[cat]
      const required = catDocs.filter(d => d.isRequired && d.status !== 'not_applicable')
      const completed = required.filter(d => ['approved', 'uploaded'].includes(d.status))
      stats[cat] = {
        total: catDocs.length,
        required: required.length,
        completed: completed.length,
        percentage: required.length > 0 ? Math.round((completed.length / required.length) * 100) : 100
      }
    })
    return stats
  }, [documentsByCategory])

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  const handleStatusChange = async (docId, newStatus) => {
    try {
      await updateSFOCDocument(applicationId, docId, { status: newStatus })
    } catch (err) {
      console.error('Error updating document status:', err)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <Check className="w-4 h-4 text-green-600" />
      case 'uploaded':
        return <Check className="w-4 h-4 text-blue-600" />
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      case 'under_review':
        return <Clock className="w-4 h-4 text-purple-600" />
      case 'not_applicable':
        return <span className="w-4 h-4 text-gray-400 text-xs">N/A</span>
      default:
        return <div className="w-4 h-4 border-2 border-gray-300 rounded" />
    }
  }

  return (
    <div className="divide-y divide-gray-200">
      {/* Overall Progress Header */}
      <div className="p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-900">Document Checklist</h3>
          <span className="text-sm text-gray-500">
            {documents.filter(d => ['approved', 'uploaded'].includes(d.status)).length} / {documents.filter(d => d.isRequired).length} required documents
          </span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(DOCUMENT_CATEGORIES)
            .sort((a, b) => a[1].order - b[1].order)
            .map(([key, cat]) => {
              const stats = categoryStats[key]
              return (
                <div
                  key={key}
                  className="text-center p-2 rounded-lg bg-white border border-gray-200"
                >
                  <p className="text-xs text-gray-500">{cat.label}</p>
                  <p className={`text-lg font-bold ${
                    stats.percentage === 100 ? 'text-green-600' :
                    stats.percentage > 50 ? 'text-blue-600' :
                    'text-yellow-600'
                  }`}>
                    {stats.percentage}%
                  </p>
                </div>
              )
            })}
        </div>
      </div>

      {/* Category Sections */}
      {Object.entries(DOCUMENT_CATEGORIES)
        .sort((a, b) => a[1].order - b[1].order)
        .map(([categoryKey, category]) => {
          const CategoryIcon = CATEGORY_ICONS[categoryKey] || FileText
          const catDocs = documentsByCategory[categoryKey]
          const stats = categoryStats[categoryKey]
          const isExpanded = expandedCategories[categoryKey]

          return (
            <div key={categoryKey}>
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(categoryKey)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <CategoryIcon className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-gray-900">{category.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    stats.percentage === 100
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {stats.completed}/{stats.required}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {/* Category Documents */}
              {isExpanded && (
                <div className="px-4 pb-4">
                  <div className="space-y-2">
                    {catDocs.map(doc => {
                      const statusInfo = DOCUMENT_STATUSES[doc.status] || DOCUMENT_STATUSES.not_started
                      const docDef = SFOC_DOCUMENT_REQUIREMENTS[doc.documentId]

                      return (
                        <div
                          key={doc.id}
                          className={`flex items-start gap-3 p-3 rounded-lg border ${
                            doc.status === 'not_applicable'
                              ? 'bg-gray-50 border-gray-200 opacity-60'
                              : doc.status === 'approved'
                              ? 'bg-green-50 border-green-200'
                              : doc.status === 'rejected'
                              ? 'bg-red-50 border-red-200'
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          {/* Status Icon */}
                          <div className="flex-shrink-0 mt-0.5">
                            {getStatusIcon(doc.status)}
                          </div>

                          {/* Document Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className={`font-medium text-sm ${
                                  doc.status === 'not_applicable' ? 'text-gray-500' : 'text-gray-900'
                                }`}>
                                  {doc.label}
                                  {doc.isRequired && doc.status !== 'not_applicable' && (
                                    <span className="text-red-500 ml-1">*</span>
                                  )}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">{doc.description}</p>
                              </div>
                              <span className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusInfo.color}`}>
                                {statusInfo.label}
                              </span>
                            </div>

                            {/* Linked Module Badge */}
                            {docDef?.linkedModule && (
                              <div className="mt-2">
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-blue-50 text-blue-700">
                                  <LinkIcon className="w-3 h-3" />
                                  Link from {docDef.linkedModule === 'soraAssessment' ? 'SORA Assessment' :
                                              docDef.linkedModule === 'manufacturerDeclaration' ? 'Manufacturer Declaration' :
                                              docDef.linkedModule}
                                </span>
                              </div>
                            )}

                            {/* Uploaded File Info */}
                            {doc.fileUrl && (
                              <div className="mt-2 flex items-center gap-3">
                                <a
                                  href={doc.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                                >
                                  <Eye className="w-3 h-3" />
                                  {doc.fileName || 'View Document'}
                                </a>
                                {doc.uploadedAt && (
                                  <span className="text-xs text-gray-400">
                                    Uploaded {doc.uploadedAt.toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Review Notes */}
                            {doc.reviewNotes && (
                              <div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
                                <strong>Review Notes:</strong> {doc.reviewNotes}
                              </div>
                            )}

                            {/* Actions */}
                            {doc.status !== 'not_applicable' && (
                              <div className="mt-2 flex items-center gap-2">
                                <select
                                  value={doc.status}
                                  onChange={(e) => handleStatusChange(doc.id, e.target.value)}
                                  className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
                                >
                                  {Object.entries(DOCUMENT_STATUSES)
                                    .filter(([key]) => key !== 'not_applicable')
                                    .map(([key, status]) => (
                                      <option key={key} value={key}>{status.label}</option>
                                    ))}
                                </select>

                                {!doc.fileUrl && (
                                  <button
                                    onClick={() => setUploadingDoc(doc.id)}
                                    className="inline-flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded"
                                  >
                                    <Upload className="w-3 h-3" />
                                    Upload
                                  </button>
                                )}

                                {docDef?.template && (
                                  <a
                                    href={docDef.template}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 rounded"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    Template
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}

      {/* Legend */}
      <div className="p-4 bg-gray-50">
        <p className="text-xs text-gray-500 mb-2">Status Legend:</p>
        <div className="flex flex-wrap gap-4">
          {Object.entries(DOCUMENT_STATUSES).map(([key, status]) => (
            <div key={key} className="flex items-center gap-1.5">
              {getStatusIcon(key)}
              <span className="text-xs text-gray-600">{status.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Modal Placeholder */}
      {uploadingDoc && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setUploadingDoc(null)} />
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Document</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">Drag and drop a file here, or click to browse</p>
                <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
              </div>
              <p className="mt-4 text-sm text-gray-500 text-center">
                File upload functionality will be implemented in a future phase.
              </p>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setUploadingDoc(null)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
