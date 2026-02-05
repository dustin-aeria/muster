/**
 * MessageInput.jsx
 * Chat input with quick actions for document generation
 */

import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, FileText, ListChecks, AlertCircle, Loader2 } from 'lucide-react'

const QUICK_ACTIONS = [
  {
    id: 'generate',
    label: 'Generate content',
    icon: Sparkles,
    prompt: 'Generate comprehensive content for the current section based on best practices and regulatory requirements.'
  },
  {
    id: 'improve',
    label: 'Improve writing',
    icon: FileText,
    prompt: 'Review and improve the current section content. Make it more professional, clear, and compliant.'
  },
  {
    id: 'checklist',
    label: 'Create checklist',
    icon: ListChecks,
    prompt: 'Create a compliance checklist for this section covering all key requirements.'
  },
  {
    id: 'review',
    label: 'Review for gaps',
    icon: AlertCircle,
    prompt: 'Review the current content and identify any gaps, missing information, or areas that need improvement.'
  }
]

export default function MessageInput({
  onSend,
  disabled,
  loading,
  placeholder = 'Ask about the document or request content...',
  currentSection = null
}) {
  const [message, setMessage] = useState('')
  const [showQuickActions, setShowQuickActions] = useState(false)
  const textareaRef = useRef(null)
  const quickActionsRef = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`
    }
  }, [message])

  // Close quick actions on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (quickActionsRef.current && !quickActionsRef.current.contains(e.target)) {
        setShowQuickActions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = (e) => {
    e?.preventDefault()
    if (!message.trim() || disabled || loading) return

    onSend(message.trim())
    setMessage('')

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleQuickAction = (action) => {
    let prompt = action.prompt
    if (currentSection) {
      prompt = `For the "${currentSection}" section: ${prompt}`
    }
    onSend(prompt)
    setShowQuickActions(false)
  }

  return (
    <div className="border-t border-gray-200 bg-white">
      {/* Quick Actions */}
      <div className="relative" ref={quickActionsRef}>
        {showQuickActions && (
          <div className="absolute bottom-full left-0 right-0 p-2 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2 px-2">Quick actions:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.map(action => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action)}
                  disabled={disabled || loading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-100 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <action.icon className="w-3.5 h-3.5" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-3">
        <div className="flex items-end gap-2">
          {/* Quick Actions Toggle */}
          <button
            type="button"
            onClick={() => setShowQuickActions(!showQuickActions)}
            disabled={disabled || loading}
            className={`p-2 rounded-lg transition-colors ${
              showQuickActions
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Quick actions"
          >
            <Sparkles className="w-5 h-5" />
          </button>

          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || loading}
              rows={1}
              className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ maxHeight: '150px' }}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!message.trim() || disabled || loading}
              className="absolute right-2 bottom-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 transition-colors"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Helper text */}
        <p className="text-xs text-gray-400 mt-1.5 px-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </form>
    </div>
  )
}
