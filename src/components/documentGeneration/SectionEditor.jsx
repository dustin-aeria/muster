/**
 * SectionEditor.jsx
 * Markdown editor with toolbar and live preview for document sections
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Link,
  Code,
  Quote,
  Eye,
  EyeOff,
  Save,
  Loader2,
  CheckCircle,
  FileText,
  Sparkles
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'

// Debounce hook for auto-save
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

export default function SectionEditor({
  section,
  onSave,
  onRequestAI,
  saving = false,
  autoSave = true,
  autoSaveDelay = 2000
}) {
  const [content, setContent] = useState(section?.content || '')
  const [showPreview, setShowPreview] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const textareaRef = useRef(null)

  // Track content changes
  useEffect(() => {
    setContent(section?.content || '')
    setHasChanges(false)
    setLastSaved(null)
  }, [section?.id])

  // Debounced content for auto-save
  const debouncedContent = useDebounce(content, autoSaveDelay)

  // Auto-save effect
  useEffect(() => {
    if (autoSave && hasChanges && debouncedContent !== section?.content) {
      handleSave()
    }
  }, [debouncedContent, autoSave])

  const handleContentChange = (e) => {
    setContent(e.target.value)
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!hasChanges || saving) return
    await onSave?.(content)
    setHasChanges(false)
    setLastSaved(new Date())
  }

  // Insert formatting at cursor
  const insertFormatting = useCallback((before, after = '', placeholder = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end) || placeholder

    const newContent =
      content.substring(0, start) +
      before +
      selectedText +
      after +
      content.substring(end)

    setContent(newContent)
    setHasChanges(true)

    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + before.length + selectedText.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }, [content])

  // Toolbar actions
  const toolbarActions = [
    { icon: Bold, action: () => insertFormatting('**', '**', 'bold text'), title: 'Bold' },
    { icon: Italic, action: () => insertFormatting('*', '*', 'italic text'), title: 'Italic' },
    { type: 'divider' },
    { icon: Heading1, action: () => insertFormatting('\n# ', '\n', 'Heading 1'), title: 'Heading 1' },
    { icon: Heading2, action: () => insertFormatting('\n## ', '\n', 'Heading 2'), title: 'Heading 2' },
    { icon: Heading3, action: () => insertFormatting('\n### ', '\n', 'Heading 3'), title: 'Heading 3' },
    { type: 'divider' },
    { icon: List, action: () => insertFormatting('\n- ', '\n', 'List item'), title: 'Bullet List' },
    { icon: ListOrdered, action: () => insertFormatting('\n1. ', '\n', 'List item'), title: 'Numbered List' },
    { type: 'divider' },
    { icon: Link, action: () => insertFormatting('[', '](url)', 'link text'), title: 'Link' },
    { icon: Code, action: () => insertFormatting('`', '`', 'code'), title: 'Inline Code' },
    { icon: Quote, action: () => insertFormatting('\n> ', '\n', 'quote'), title: 'Block Quote' },
  ]

  // Format last saved time
  const formatLastSaved = () => {
    if (!lastSaved) return null
    const diff = Math.round((new Date() - lastSaved) / 1000)
    if (diff < 5) return 'Just saved'
    if (diff < 60) return `Saved ${diff}s ago`
    return `Saved ${Math.round(diff / 60)}m ago`
  }

  if (!section) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <FileText className="w-12 h-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Section Selected
        </h3>
        <p className="text-sm text-gray-500">
          Select a section from the sidebar to start editing.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Section Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              {section.generatedFrom && (
                <span className="inline-flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                  <Sparkles className="w-3 h-3" />
                  AI Generated
                </span>
              )}
              {lastSaved && (
                <span className="text-xs text-gray-500">
                  {formatLastSaved()}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && !autoSave && (
              <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                Unsaved changes
              </span>
            )}
            {saving && (
              <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                <Loader2 className="w-3 h-3 animate-spin" />
                Saving...
              </span>
            )}
            {!hasChanges && lastSaved && (
              <span className="inline-flex items-center gap-1 text-xs text-green-600">
                <CheckCircle className="w-3 h-3" />
                Saved
              </span>
            )}
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`p-2 rounded-lg transition-colors ${
                showPreview
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              title={showPreview ? 'Hide Preview' : 'Show Preview'}
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            {!autoSave && (
              <button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-4 py-2 border-b border-gray-200 bg-white flex items-center gap-1 flex-wrap">
        {toolbarActions.map((item, index) =>
          item.type === 'divider' ? (
            <div key={index} className="w-px h-6 bg-gray-200 mx-1" />
          ) : (
            <button
              key={index}
              onClick={item.action}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              title={item.title}
            >
              <item.icon className="w-4 h-4" />
            </button>
          )
        )}
        <div className="flex-1" />
        {onRequestAI && (
          <button
            onClick={() => onRequestAI(section)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Generate with AI
          </button>
        )}
      </div>

      {/* Editor / Preview */}
      <div className="flex-1 overflow-hidden flex">
        {/* Editor */}
        <div className={`flex-1 overflow-hidden ${showPreview ? 'border-r border-gray-200' : ''}`}>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            placeholder="Start writing or use AI to generate content..."
            className="w-full h-full p-4 resize-none focus:outline-none font-mono text-sm leading-relaxed"
            style={{ minHeight: '100%' }}
          />
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            <div className="prose prose-sm max-w-none">
              {content ? (
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
                    a: ({ href, children }) => (
                      <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    ),
                  }}
                >
                  {content}
                </ReactMarkdown>
              ) : (
                <p className="text-gray-400 italic">Preview will appear here...</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Word Count Footer */}
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex items-center justify-between">
        <span>
          {content.trim() ? content.trim().split(/\s+/).length : 0} words
          {' • '}
          {content.length} characters
        </span>
        <span>
          Markdown supported • Press Tab to indent
        </span>
      </div>
    </div>
  )
}
