/**
 * ContextStatusBar.jsx
 * Shows token usage and context status for the document conversation
 */

import { useState, useEffect } from 'react'
import { Zap, AlertTriangle, Info, ChevronDown, ChevronUp } from 'lucide-react'

// Approximate token limits for context window
const MAX_CONTEXT_TOKENS = 100000 // Claude's context window
const WARNING_THRESHOLD = 0.7 // 70% usage warning
const DANGER_THRESHOLD = 0.9 // 90% usage danger

export default function ContextStatusBar({
  tokenUsage = { promptTokens: 0, completionTokens: 0 },
  messageCount = 0,
  knowledgeBaseDocsCount = 0
}) {
  const [expanded, setExpanded] = useState(false)

  const totalTokens = tokenUsage.promptTokens + tokenUsage.completionTokens
  const usagePercentage = (totalTokens / MAX_CONTEXT_TOKENS) * 100

  const getStatusColor = () => {
    if (usagePercentage >= DANGER_THRESHOLD * 100) return 'text-red-600 bg-red-50'
    if (usagePercentage >= WARNING_THRESHOLD * 100) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  const getProgressColor = () => {
    if (usagePercentage >= DANGER_THRESHOLD * 100) return 'bg-red-500'
    if (usagePercentage >= WARNING_THRESHOLD * 100) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const formatNumber = (num) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return num.toString()
  }

  return (
    <div className="border-b border-gray-200 bg-gray-50">
      {/* Collapsed View */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
            <Zap className="w-3 h-3" />
            {formatNumber(totalTokens)} tokens
          </div>

          <span className="text-xs text-gray-500">
            {messageCount} messages
          </span>

          {knowledgeBaseDocsCount > 0 && (
            <span className="text-xs text-gray-500">
              {knowledgeBaseDocsCount} KB docs
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {usagePercentage >= WARNING_THRESHOLD * 100 && (
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded View */}
      {expanded && (
        <div className="px-4 pb-3 space-y-3">
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Context Usage</span>
              <span>{usagePercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${getProgressColor()}`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-gray-500">Prompt Tokens</p>
              <p className="font-medium text-gray-900">{formatNumber(tokenUsage.promptTokens)}</p>
            </div>
            <div>
              <p className="text-gray-500">Completion Tokens</p>
              <p className="font-medium text-gray-900">{formatNumber(tokenUsage.completionTokens)}</p>
            </div>
            <div>
              <p className="text-gray-500">Messages in Context</p>
              <p className="font-medium text-gray-900">{messageCount}</p>
            </div>
            <div>
              <p className="text-gray-500">KB Documents Used</p>
              <p className="font-medium text-gray-900">{knowledgeBaseDocsCount}</p>
            </div>
          </div>

          {/* Warning Messages */}
          {usagePercentage >= DANGER_THRESHOLD * 100 && (
            <div className="flex items-start gap-2 p-2 bg-red-50 rounded-lg text-xs text-red-700">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>
                Context is nearly full. Older messages may be truncated. Consider starting a new conversation or reducing message length.
              </p>
            </div>
          )}

          {usagePercentage >= WARNING_THRESHOLD * 100 && usagePercentage < DANGER_THRESHOLD * 100 && (
            <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded-lg text-xs text-yellow-700">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>
                Context usage is high. The AI may start forgetting earlier parts of the conversation.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
