/**
 * Document Type Selector Component
 * Card grid for selecting document types in the Document Center
 *
 * @location src/components/documentCenter/DocumentTypeSelector.jsx
 */

import { useMemo } from 'react'
import { Check, Lock } from 'lucide-react'
import {
  DOCUMENT_TYPES,
  DOCUMENT_CATEGORIES,
  getDocumentsByCategory,
  isDocumentTypeAvailable,
  getDocumentColorClasses
} from '../../lib/documentTypes'

export default function DocumentTypeSelector({
  selectedType,
  onSelect,
  project
}) {
  // Get available document types
  const documentsByCategory = useMemo(() => {
    const result = {}
    Object.keys(DOCUMENT_CATEGORIES).forEach(categoryId => {
      result[categoryId] = getDocumentsByCategory(categoryId).map(docType => ({
        ...docType,
        available: isDocumentTypeAvailable(docType.id, project)
      }))
    })
    return result
  }, [project])

  return (
    <div className="space-y-6">
      {Object.entries(DOCUMENT_CATEGORIES).map(([categoryId, category]) => {
        const docs = documentsByCategory[categoryId]
        if (!docs || docs.length === 0) return null

        return (
          <div key={categoryId}>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              {category.label}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {docs.map(docType => {
                const Icon = docType.icon
                const isSelected = selectedType === docType.id
                const colors = getDocumentColorClasses(docType.id)

                return (
                  <button
                    key={docType.id}
                    onClick={() => docType.available && onSelect(docType.id)}
                    disabled={!docType.available}
                    className={`
                      relative p-4 rounded-xl border-2 text-left transition-all
                      ${isSelected
                        ? `${colors.border} ${colors.bg} ring-2 ring-offset-2 ring-${docType.color}-500`
                        : docType.available
                          ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                      }
                    `}
                  >
                    {/* Selected indicator */}
                    {isSelected && (
                      <div className={`absolute top-2 right-2 w-5 h-5 rounded-full ${colors.bg} ${colors.text} flex items-center justify-center`}>
                        <Check className="w-3 h-3" />
                      </div>
                    )}

                    {/* Locked indicator */}
                    {!docType.available && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center">
                        <Lock className="w-3 h-3" />
                      </div>
                    )}

                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-lg ${colors.bg} ${colors.text} flex items-center justify-center mb-3`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Label */}
                    <div className="font-medium text-gray-900 text-sm">
                      {docType.label}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {docType.description}
                    </p>

                    {/* Multi-site badge */}
                    {docType.supportsMultiSite && project?.sites?.length > 1 && (
                      <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                        Multi-site
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
