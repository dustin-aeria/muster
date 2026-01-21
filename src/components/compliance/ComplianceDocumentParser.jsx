/**
 * ComplianceDocumentParser.jsx
 * UI for parsing compliance documents into structured requirements
 *
 * Allows users to:
 * - Paste text from any compliance document
 * - Review extracted requirements
 * - Edit, merge, or remove requirements
 * - Save as a compliance session
 *
 * @location src/components/compliance/ComplianceDocumentParser.jsx
 */

import React, { useState, useCallback } from 'react'
import {
  FileText,
  Upload,
  Clipboard,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit3,
  Save,
  X,
  Loader2,
  FileCheck,
  Target,
  BookOpen,
  Sparkles,
  ArrowRight,
  RotateCcw
} from 'lucide-react'
import { parseComplianceText, generateTemplate } from '../../lib/complianceMatrixParser'
import { PatternBadge } from './PatternInsightsPanel'
import { logger } from '../../lib/logger'

// ============================================
// SUB-COMPONENTS
// ============================================

function ParsedRequirementCard({
  requirement,
  index,
  onEdit,
  onRemove,
  isEditing,
  editValue,
  onEditChange,
  onEditSave,
  onEditCancel
}) {
  return (
    <div className={`border rounded-lg overflow-hidden ${
      requirement.confidence > 0.5 ? 'border-gray-200' : 'border-amber-200 bg-amber-50'
    }`}>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <span className="text-xs font-mono text-gray-400 mt-1">
              {String(index + 1).padStart(2, '0')}
            </span>
            {isEditing ? (
              <div className="flex-1">
                <textarea
                  value={editValue}
                  onChange={(e) => onEditChange(e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={3}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={onEditSave}
                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded flex items-center gap-1"
                  >
                    <Save className="w-3 h-3" /> Save
                  </button>
                  <button
                    onClick={onEditCancel}
                    className="text-xs border border-gray-300 text-gray-700 px-2 py-1 rounded flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{requirement.shortText}</p>
                {requirement.text !== requirement.shortText && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {requirement.text}
                  </p>
                )}
              </div>
            )}
          </div>

          {!isEditing && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(requirement)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                title="Edit"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onRemove(requirement.id)}
                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                title="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Metadata row */}
        {!isEditing && (
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {requirement.regulatoryRef && (
              <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                {requirement.regulatoryRef}
              </span>
            )}
            {requirement.section && (
              <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                {requirement.section}
              </span>
            )}
            {requirement.category && (
              <PatternBadge requirement={requirement} />
            )}
            {requirement.confidence < 0.3 && (
              <span className="text-xs text-amber-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Low confidence
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function CategorySummary({ categories }) {
  const categoryColors = {
    operations: 'bg-blue-100 text-blue-700',
    equipment: 'bg-purple-100 text-purple-700',
    crew: 'bg-amber-100 text-amber-700',
    safety: 'bg-red-100 text-red-700',
    emergency: 'bg-orange-100 text-orange-700',
    communications: 'bg-green-100 text-green-700',
    weather: 'bg-cyan-100 text-cyan-700',
    insurance: 'bg-emerald-100 text-emerald-700'
  }

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(categories).map(([category, count]) => (
        <span
          key={category}
          className={`text-xs px-2 py-1 rounded ${categoryColors[category] || 'bg-gray-100 text-gray-700'}`}
        >
          {category}: {count}
        </span>
      ))}
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ComplianceDocumentParser({
  onRequirementsParsed,
  onCancel,
  initialText = ''
}) {
  // States
  const [step, setStep] = useState('input') // 'input' | 'review' | 'complete'
  const [inputText, setInputText] = useState(initialText)
  const [documentName, setDocumentName] = useState('')
  const [parsedResult, setParsedResult] = useState(null)
  const [requirements, setRequirements] = useState([])
  const [parsing, setParsing] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')

  // Handle paste from clipboard
  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInputText(text)
    } catch (err) {
      logger.error('Failed to read clipboard:', err)
    }
  }, [])

  // Parse the input text
  const handleParse = useCallback(() => {
    if (!inputText.trim()) return

    setParsing(true)

    // Use setTimeout to allow UI to update
    setTimeout(() => {
      try {
        const result = parseComplianceText(inputText, {
          documentName: documentName || 'Parsed Document'
        })

        setParsedResult(result)
        setRequirements(result.requirements)
        setStep('review')
      } catch (err) {
        logger.error('Parse error:', err)
        alert('Failed to parse document. Please try a different format.')
      } finally {
        setParsing(false)
      }
    }, 100)
  }, [inputText, documentName])

  // Edit requirement
  const handleStartEdit = useCallback((requirement) => {
    setEditingId(requirement.id)
    setEditValue(requirement.text)
  }, [])

  const handleSaveEdit = useCallback(() => {
    setRequirements(prev => prev.map(req => {
      if (req.id === editingId) {
        return {
          ...req,
          text: editValue,
          shortText: editValue.split(/[.?!]/)[0].substring(0, 80)
        }
      }
      return req
    }))
    setEditingId(null)
    setEditValue('')
  }, [editingId, editValue])

  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
    setEditValue('')
  }, [])

  // Remove requirement
  const handleRemove = useCallback((id) => {
    setRequirements(prev => prev.filter(req => req.id !== id))
  }, [])

  // Confirm and proceed
  const handleConfirm = useCallback(() => {
    if (onRequirementsParsed) {
      onRequirementsParsed({
        ...parsedResult,
        requirements,
        documentName: documentName || parsedResult.documentName
      })
    }
    setStep('complete')
  }, [requirements, parsedResult, documentName, onRequirementsParsed])

  // Reset
  const handleReset = useCallback(() => {
    setStep('input')
    setParsedResult(null)
    setRequirements([])
  }, [])

  // Input Step
  if (step === 'input') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Parse Compliance Document
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Paste text from any compliance matrix, checklist, or questionnaire
          </p>
        </div>

        <div className="p-4 space-y-4">
          {/* Document name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Name (optional)
            </label>
            <input
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="e.g., SFOC Compliance Matrix"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Text input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Document Text
              </label>
              <button
                onClick={handlePaste}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Clipboard className="w-3 h-3" />
                Paste from clipboard
              </button>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste the content from your compliance document here...

Supported formats:
• Numbered lists (1. 2. 3.)
• Bulleted lists (• - *)
• Table format (tab or pipe delimited)
• Sectioned documents

The parser will extract individual requirements and identify regulatory references."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              rows={12}
            />
            <p className="text-xs text-gray-500 mt-1">
              {inputText.length} characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleParse}
              disabled={!inputText.trim() || parsing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ml-auto"
            >
              {parsing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Parsing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Parse Document
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Review Step
  if (step === 'review') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Review Parsed Requirements
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {parsedResult?.documentName}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              Start Over
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total:</span>{' '}
              <span className="font-medium text-gray-900">
                {requirements.length} requirements
              </span>
            </div>
            <div>
              <span className="text-gray-600">Categorized:</span>{' '}
              <span className="font-medium text-gray-900">
                {parsedResult?.stats?.categorized || 0}
              </span>
            </div>
            <div>
              <span className="text-gray-600">With reg refs:</span>{' '}
              <span className="font-medium text-gray-900">
                {parsedResult?.stats?.withRegRef || 0}
              </span>
            </div>
          </div>
          {parsedResult?.categories && Object.keys(parsedResult.categories).length > 0 && (
            <div className="mt-2">
              <CategorySummary categories={parsedResult.categories} />
            </div>
          )}
        </div>

        {/* Requirements list */}
        <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
          {requirements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No requirements found</p>
              <button
                onClick={handleReset}
                className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
              >
                Try different text
              </button>
            </div>
          ) : (
            requirements.map((req, index) => (
              <ParsedRequirementCard
                key={req.id}
                requirement={req}
                index={index}
                onEdit={handleStartEdit}
                onRemove={handleRemove}
                isEditing={editingId === req.id}
                editValue={editValue}
                onEditChange={setEditValue}
                onEditSave={handleSaveEdit}
                onEditCancel={handleCancelEdit}
              />
            ))
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Back
          </button>
          <button
            onClick={handleConfirm}
            disabled={requirements.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Use {requirements.length} Requirements
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  // Complete Step
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
      <CheckCircle2 className="w-12 h-12 mx-auto text-green-600 mb-3" />
      <h3 className="font-semibold text-gray-900 text-lg">
        Requirements Imported
      </h3>
      <p className="text-gray-500 mt-1">
        {requirements.length} requirements have been added to your compliance session
      </p>
    </div>
  )
}

// Also export a compact version for modal use
export function ComplianceDocumentParserModal({ isOpen, onClose, onRequirementsParsed }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <ComplianceDocumentParser
          onRequirementsParsed={(result) => {
            onRequirementsParsed(result)
            onClose()
          }}
          onCancel={onClose}
        />
      </div>
    </div>
  )
}
