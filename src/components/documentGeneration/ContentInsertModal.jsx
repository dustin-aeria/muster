/**
 * ContentInsertModal.jsx
 * Modal for reviewing and inserting AI-generated content into sections
 */

import { useState, useEffect } from 'react'
import {
  X,
  Sparkles,
  Check,
  Edit3,
  RefreshCw,
  Copy,
  Eye,
  FileText,
  ArrowRight,
  AlertCircle
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function ContentInsertModal({
  isOpen,
  onClose,
  generatedContent,
  sectionTitle,
  existingContent,
  onInsert,
  onRegenerate,
  loading = false
}) {
  const [mode, setMode] = useState('preview') // 'preview' | 'edit'
  const [editedContent, setEditedContent] = useState('')
  const [insertMode, setInsertMode] = useState('replace') // 'replace' | 'append' | 'prepend'

  useEffect(() => {
    if (generatedContent) {
      setEditedContent(generatedContent)
    }
  }, [generatedContent])

  useEffect(() => {
    if (isOpen) {
      setMode('preview')
      setInsertMode(existingContent ? 'append' : 'replace')
    }
  }, [isOpen, existingContent])

  if (!isOpen) return null

  const handleInsert = () => {
    let finalContent = editedContent

    if (existingContent) {
      switch (insertMode) {
        case 'append':
          finalContent = existingContent.trim() + '\n\n' + editedContent
          break
        case 'prepend':
          finalContent = editedContent + '\n\n' + existingContent.trim()
          break
        case 'replace':
        default:
          finalContent = editedContent
          break
      }
    }

    onInsert?.(finalContent)
    onClose()
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editedContent)
  }

  const wordCount = editedContent?.trim().split(/\s+/).length || 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                AI Generated Content
              </h2>
              <p className="text-sm text-gray-500">
                For section: {sectionTitle}
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

        {/* Loading State */}
        {loading && (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Generating content...</p>
              <p className="text-sm text-gray-400 mt-1">This may take a moment</p>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && generatedContent && (
          <>
            {/* Mode Toggle */}
            <div className="px-6 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMode('preview')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    mode === 'preview'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
                <button
                  onClick={() => setMode('edit')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    mode === 'edit'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {wordCount} words
                </span>
                <button
                  onClick={handleCopy}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>
                {onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Regenerate
                  </button>
                )}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
              {mode === 'preview' ? (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 pb-2 border-b">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-xl font-bold mb-3 mt-6">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-lg font-semibold mb-2 mt-4">{children}</h3>,
                      p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc pl-6 mb-3 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-6 mb-3 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-3">
                          {children}
                        </blockquote>
                      ),
                      code: ({ inline, children }) =>
                        inline ? (
                          <code className="px-1.5 py-0.5 bg-gray-200 rounded text-sm font-mono">{children}</code>
                        ) : (
                          <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm my-3">
                            <code>{children}</code>
                          </pre>
                        ),
                    }}
                  >
                    {editedContent}
                  </ReactMarkdown>
                </div>
              ) : (
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full h-full min-h-[400px] p-4 border border-gray-200 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              )}
            </div>

            {/* Insert Mode Selection (if existing content) */}
            {existingContent && (
              <div className="px-6 py-3 border-t border-gray-200 bg-amber-50">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-800">
                      This section already has content
                    </p>
                    <div className="mt-2 flex items-center gap-4">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="insertMode"
                          value="append"
                          checked={insertMode === 'append'}
                          onChange={(e) => setInsertMode(e.target.value)}
                          className="text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">Add after existing</span>
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="insertMode"
                          value="prepend"
                          checked={insertMode === 'prepend'}
                          onChange={(e) => setInsertMode(e.target.value)}
                          className="text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">Add before existing</span>
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="insertMode"
                          value="replace"
                          checked={insertMode === 'replace'}
                          onChange={(e) => setInsertMode(e.target.value)}
                          className="text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">Replace existing</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInsert}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Check className="w-4 h-4" />
                Insert Content
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {/* No Content State */}
        {!loading && !generatedContent && (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No content generated yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Use the AI chat to generate content for this section
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
