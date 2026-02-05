/**
 * DocumentExportModal.jsx
 * Export options modal for generated documents
 */

import { useState } from 'react'
import {
  X,
  Download,
  FileText,
  File,
  FileCode,
  Loader2,
  Check,
  AlertCircle,
  Eye
} from 'lucide-react'
import { exportToPDF, exportToMarkdown, exportToDocx } from '../../lib/documentExportService'
import { recordDocumentExport } from '../../lib/firestoreDocumentGeneration'

const EXPORT_FORMATS = [
  {
    id: 'pdf',
    label: 'PDF Document',
    description: 'Professional PDF with branding, table of contents, and formatted sections',
    icon: FileText,
    extension: '.pdf',
    recommended: true
  },
  {
    id: 'docx',
    label: 'Word Document (HTML)',
    description: 'HTML file that can be opened in Microsoft Word for further editing',
    icon: File,
    extension: '.html'
  },
  {
    id: 'markdown',
    label: 'Markdown',
    description: 'Plain text markdown format for version control or documentation systems',
    icon: FileCode,
    extension: '.md'
  }
]

export default function DocumentExportModal({
  isOpen,
  onClose,
  document,
  project,
  onPreview
}) {
  const [selectedFormat, setSelectedFormat] = useState('pdf')
  const [exporting, setExporting] = useState(false)
  const [exportResult, setExportResult] = useState(null)
  const [error, setError] = useState(null)

  // Export options
  const [includeToC, setIncludeToC] = useState(true)
  const [includeCrossRefs, setIncludeCrossRefs] = useState(true)
  const [includeBranding, setIncludeBranding] = useState(true)

  const handleExport = async () => {
    setExporting(true)
    setError(null)
    setExportResult(null)

    try {
      const options = {
        includeToC,
        includeCrossRefs,
        includeBranding
      }

      let result

      switch (selectedFormat) {
        case 'pdf':
          result = await exportToPDF(document, project, options)
          break
        case 'docx':
          result = exportToDocx(document, project, options)
          break
        case 'markdown':
          result = exportToMarkdown(document, project, options)
          break
        default:
          throw new Error('Unknown format')
      }

      // Record export in Firestore
      try {
        await recordDocumentExport(document.id, {
          format: selectedFormat,
          exportedBy: 'current-user' // Would come from auth context
        })
      } catch (recordError) {
        console.warn('Failed to record export:', recordError)
      }

      setExportResult(result)
    } catch (err) {
      console.error('Export error:', err)
      setError(err.message || 'Failed to export document')
    } finally {
      setExporting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Download className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Export Document
              </h2>
              <p className="text-sm text-gray-500">
                {document?.title || 'Document'}
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Export Format
            </label>
            <div className="space-y-2">
              {EXPORT_FORMATS.map(format => (
                <label
                  key={format.id}
                  className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedFormat === format.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="format"
                    value={format.id}
                    checked={selectedFormat === format.id}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <format.icon className={`w-4 h-4 ${
                        selectedFormat === format.id ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <span className={`font-medium ${
                        selectedFormat === format.id ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {format.label}
                      </span>
                      {format.recommended && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {format.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Options
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeToC}
                  onChange={(e) => setIncludeToC(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Include Table of Contents</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCrossRefs}
                  onChange={(e) => setIncludeCrossRefs(e.target.checked)}
                  disabled={!document?.crossReferences?.length}
                  className="rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                />
                <span className={`text-sm ${
                  document?.crossReferences?.length ? 'text-gray-700' : 'text-gray-400'
                }`}>
                  Include Cross-References Appendix
                  {!document?.crossReferences?.length && ' (none available)'}
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeBranding}
                  onChange={(e) => setIncludeBranding(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Apply Client Branding</span>
              </label>
            </div>
          </div>

          {/* Document Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Version</p>
                <p className="font-medium text-gray-900">v{document?.version || '1.0'}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <p className="font-medium text-gray-900 capitalize">{document?.status || 'Draft'}</p>
              </div>
              <div>
                <p className="text-gray-500">Sections</p>
                <p className="font-medium text-gray-900">{document?.sections?.length || 0}</p>
              </div>
              <div>
                <p className="text-gray-500">Cross-References</p>
                <p className="font-medium text-gray-900">{document?.crossReferences?.length || 0}</p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Success Message */}
          {exportResult && (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Export successful!</p>
                <p className="text-green-600">{exportResult.filename}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between rounded-b-xl">
          <div className="flex items-center gap-2">
            {onPreview && (
              <button
                onClick={() => onPreview(document, project)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {exporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export {EXPORT_FORMATS.find(f => f.id === selectedFormat)?.extension}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
