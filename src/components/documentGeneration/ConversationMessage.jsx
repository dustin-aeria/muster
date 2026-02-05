/**
 * ConversationMessage.jsx
 * Chat message bubble for user and assistant messages
 */

import { useState } from 'react'
import { User, Bot, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function ConversationMessage({ message, isLast }) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(true)

  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatTime = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  // System messages are displayed differently
  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <div className="px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-500">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-blue-600' : 'bg-gray-800'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[85%] ${isUser ? 'flex flex-col items-end' : ''}`}>
        <div className={`rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-md'
            : 'bg-gray-100 text-gray-900 rounded-bl-md'
        }`}>
          {/* Collapsible for long messages */}
          {message.content.length > 500 && !isUser ? (
            <>
              <div className={`prose prose-sm max-w-none ${!expanded ? 'line-clamp-3' : ''} ${
                isUser ? 'prose-invert' : ''
              }`}>
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    code: ({ inline, children }) =>
                      inline
                        ? <code className="px-1 py-0.5 bg-gray-200 rounded text-sm">{children}</code>
                        : <pre className="bg-gray-800 text-gray-100 p-3 rounded-lg overflow-x-auto text-sm my-2"><code>{children}</code></pre>,
                    h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 mt-2 text-xs text-gray-500 hover:text-gray-700"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="w-3 h-3" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" />
                    Show more
                  </>
                )}
              </button>
            </>
          ) : (
            <div className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : ''}`}>
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  code: ({ inline, children }) =>
                    inline
                      ? <code className={`px-1 py-0.5 rounded text-sm ${isUser ? 'bg-blue-500' : 'bg-gray-200'}`}>{children}</code>
                      : <pre className="bg-gray-800 text-gray-100 p-3 rounded-lg overflow-x-auto text-sm my-2"><code>{children}</code></pre>,
                  h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Meta info */}
        <div className={`flex items-center gap-2 mt-1 text-xs text-gray-400 ${
          isUser ? 'flex-row-reverse' : ''
        }`}>
          <span>{formatTime(message.createdAt)}</span>

          {/* Token usage for assistant messages */}
          {!isUser && message.tokenUsage && (
            <span className="text-gray-300">
              {message.tokenUsage.completionTokens} tokens
            </span>
          )}

          {/* Copy button for assistant messages */}
          {!isUser && (
            <button
              onClick={handleCopy}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
