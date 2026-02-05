/**
 * DocumentTypeSelector.jsx
 * Visual picker for selecting document types when creating a new document
 */

import { useState } from 'react'
import {
  Shield,
  GraduationCap,
  Wrench,
  BookOpen,
  FileCheck,
  ShieldCheck,
  AlertTriangle,
  ClipboardList,
  AlertCircle,
  CheckSquare,
  Search
} from 'lucide-react'
import { DOCUMENT_TYPES } from '../../lib/firestoreDocumentGeneration'

const ICON_MAP = {
  Shield,
  GraduationCap,
  Wrench,
  BookOpen,
  FileCheck,
  ShieldCheck,
  AlertTriangle,
  ClipboardList,
  AlertCircle,
  CheckSquare
}

export default function DocumentTypeSelector({ selectedType, onSelect }) {
  const [searchQuery, setSearchQuery] = useState('')

  const documentTypes = Object.entries(DOCUMENT_TYPES).map(([id, type]) => ({
    id,
    ...type
  }))

  const filteredTypes = documentTypes.filter(type =>
    type.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    type.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search document types..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Document Type Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
        {filteredTypes.map((type) => {
          const IconComponent = ICON_MAP[type.icon] || FileCheck
          const isSelected = selectedType === type.id

          return (
            <button
              key={type.id}
              type="button"
              onClick={() => onSelect(type.id)}
              className={`flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <IconComponent className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-medium text-sm ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                  {type.label}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                  {type.description}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {filteredTypes.length === 0 && (
        <p className="text-center text-gray-500 py-8">
          No document types match your search.
        </p>
      )}

      {/* Selected Type Details */}
      {selectedType && DOCUMENT_TYPES[selectedType] && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">
            {DOCUMENT_TYPES[selectedType].label} - Sections
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {DOCUMENT_TYPES[selectedType].sections.map((section, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="w-5 h-5 flex items-center justify-center bg-gray-200 rounded text-xs font-medium">
                  {index + 1}
                </span>
                {section}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
