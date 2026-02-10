/**
 * AI Enhancement Controls Component
 * Toggle for AI enhancement, tone selector, and cache status display
 *
 * @location src/components/documentCenter/AIEnhancementControls.jsx
 */

import {
  Sparkles,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  RefreshCw,
  X
} from 'lucide-react'
import { AI_TONES } from '../../lib/documentTypes'

export default function AIEnhancementControls({
  enabled,
  onEnabledChange,
  tone,
  onToneChange,
  documentType,
  projectId,
  isCached,
  getCachedAt,
  isEnhancing,
  enhancingType,
  error,
  onClearError
}) {
  // Get export type for cache check
  const exportType = documentType?.exportType || documentType?.id

  // Check cache status
  const hasCachedContent = isCached && isCached(exportType)
  const cachedAt = getCachedAt && getCachedAt(exportType)

  // Format cached date
  const formatCachedDate = (date) => {
    if (!date) return null
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  return (
    <div className="card">
      {/* Header with toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`
            p-2 rounded-lg
            ${enabled ? 'bg-purple-100' : 'bg-gray-100'}
          `}>
            <Sparkles className={`
              w-5 h-5
              ${enabled ? 'text-purple-600' : 'text-gray-400'}
            `} />
          </div>
          <div>
            <span className="font-medium text-gray-900">AI Enhancement</span>
            <p className={`text-xs ${enabled ? 'text-purple-600' : 'text-gray-500'}`}>
              {enabled ? 'Professional prose enabled' : 'Standard output'}
            </p>
          </div>
        </div>

        {/* Toggle switch */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onEnabledChange(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
        </label>
      </div>

      {/* Options when enabled */}
      {enabled && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          {/* Tone selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Writing Tone
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(AI_TONES).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => onToneChange(key)}
                  className={`
                    p-2 rounded-lg border text-left text-sm transition-all
                    ${tone === key
                      ? 'border-purple-500 bg-purple-50 text-purple-900'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }
                  `}
                >
                  <div className="font-medium">{config.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {config.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* AI sections that will be enhanced */}
          {documentType?.aiEnhancement && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI-Enhanced Sections
              </label>
              <div className="flex flex-wrap gap-1">
                {Object.keys(documentType.aiEnhancement).map(key => (
                  <span
                    key={key}
                    className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs"
                  >
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Cache status */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {hasCachedContent ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-green-700">
                    Cached {formatCachedDate(cachedAt)}
                  </span>
                </>
              ) : isEnhancing && enhancingType === exportType ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 text-purple-500 animate-spin" />
                  <span className="text-purple-700">Generating...</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-gray-500">Will generate on export</span>
                </>
              )}
            </div>

            {hasCachedContent && (
              <button
                className="text-gray-400 hover:text-gray-600 flex items-center gap-1"
                title="Regenerate content"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error.message || 'Enhancement failed'}</span>
          </div>
          <button
            onClick={onClearError}
            className="p-1 hover:bg-red-100 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
