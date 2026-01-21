/**
 * ComplianceProjectEditor.jsx
 * Simple Q&A interface for compliance projects
 *
 * Users can:
 * - Add compliance questions one at a time
 * - Get auto-suggestions from Knowledge Base and linked project
 * - Edit/delete questions
 * - Export all Q&As
 *
 * @location src/components/compliance/ComplianceProjectEditor.jsx
 */

import React, { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  FileText,
  FolderOpen,
  Save,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Sparkles,
  Download,
  Link2,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  HelpCircle,
  X,
  Search,
  BookOpen
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import {
  getComplianceProject,
  updateComplianceProject,
  addComplianceQuestion,
  updateComplianceQuestion,
  deleteComplianceQuestion
} from '../../lib/firestoreCompliance'
import { getComprehensiveSuggestions, getPatternBasedSuggestions } from '../../lib/complianceAssistant'
import { mapRequirementToPatterns, COMPLIANCE_CATEGORIES } from '../../lib/regulatoryPatterns'
import { logger } from '../../lib/logger'

// ============================================
// CATEGORY COLORS
// ============================================

const CATEGORY_COLORS = {
  operations: 'bg-blue-100 text-blue-700',
  equipment: 'bg-purple-100 text-purple-700',
  crew: 'bg-amber-100 text-amber-700',
  safety: 'bg-red-100 text-red-700',
  emergency: 'bg-orange-100 text-orange-700',
  communications: 'bg-green-100 text-green-700',
  weather: 'bg-cyan-100 text-cyan-700',
  insurance: 'bg-emerald-100 text-emerald-700',
  documentation: 'bg-gray-100 text-gray-700'
}

// ============================================
// QUESTION CARD COMPONENT
// ============================================

function QuestionCard({
  question,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onUseAnswer
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (question.answer) {
      await navigator.clipboard.writeText(question.answer)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const categoryColor = CATEGORY_COLORS[question.category] || 'bg-gray-100 text-gray-700'

  return (
    <div className={`border rounded-lg overflow-hidden ${
      question.status === 'answered' ? 'border-green-200 bg-green-50/30' : 'border-gray-200'
    }`}>
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 text-left flex items-start gap-3 hover:bg-gray-50/50"
      >
        {question.status === 'answered' ? (
          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
        ) : (
          <Circle className="w-5 h-5 text-gray-300 mt-0.5 flex-shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{question.question}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {question.category && (
              <span className={`text-xs px-2 py-0.5 rounded ${categoryColor}`}>
                {COMPLIANCE_CATEGORIES[question.category]?.name || question.category}
              </span>
            )}
            {question.regulatoryRef && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {question.regulatoryRef}
              </span>
            )}
            {question.documentRefs?.length > 0 && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Link2 className="w-3 h-3" />
                {question.documentRefs.length} doc{question.documentRefs.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-4 space-y-3">
          {/* Answer */}
          {question.answer ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-500">Answer</span>
                <button
                  onClick={handleCopy}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="p-3 bg-white rounded border border-gray-200 text-sm text-gray-700 whitespace-pre-wrap">
                {question.answer}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-gray-50 rounded border border-dashed border-gray-300 text-sm text-gray-500 text-center">
              No answer yet
            </div>
          )}

          {/* Notes */}
          {question.notes && (
            <div>
              <span className="text-xs font-medium text-gray-500">Notes</span>
              <p className="text-sm text-gray-600 mt-1">{question.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => onDelete(question.id)}
              className="text-xs text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
            >
              <Trash2 className="w-3 h-3 inline mr-1" />
              Delete
            </button>
            <button
              onClick={() => onEdit(question)}
              className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-200"
            >
              <Edit3 className="w-3 h-3 inline mr-1" />
              Edit
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// ADD/EDIT QUESTION MODAL
// ============================================

function QuestionModal({
  isOpen,
  onClose,
  onSave,
  question,
  project,
  linkedProject
}) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: null,
    regulatoryRef: '',
    notes: ''
  })
  const [suggestions, setSuggestions] = useState(null)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [saving, setSaving] = useState(false)

  // Initialize form when question changes
  useEffect(() => {
    if (question) {
      setFormData({
        question: question.question || '',
        answer: question.answer || '',
        category: question.category || null,
        regulatoryRef: question.regulatoryRef || '',
        notes: question.notes || ''
      })
    } else {
      setFormData({
        question: '',
        answer: '',
        category: null,
        regulatoryRef: '',
        notes: ''
      })
    }
    setSuggestions(null)
  }, [question, isOpen])

  // Analyze question and get suggestions
  const analyzeQuestion = useCallback(async () => {
    if (!formData.question.trim() || !user) return

    setLoadingSuggestions(true)
    try {
      // Get pattern analysis
      const patternAnalysis = getPatternBasedSuggestions({
        text: formData.question,
        regulatoryRef: formData.regulatoryRef
      })

      // Auto-set category if detected
      if (patternAnalysis.category && !formData.category) {
        setFormData(prev => ({ ...prev, category: patternAnalysis.category.id }))
      }

      // Get comprehensive suggestions from KB
      const comprehensiveSuggestions = await getComprehensiveSuggestions(
        user.uid,
        {
          text: formData.question,
          regulatoryRef: formData.regulatoryRef
        },
        linkedProject
      )

      setSuggestions({
        pattern: patternAnalysis,
        comprehensive: comprehensiveSuggestions
      })
    } catch (err) {
      logger.error('Error getting suggestions:', err)
    } finally {
      setLoadingSuggestions(false)
    }
  }, [formData.question, formData.regulatoryRef, user, linkedProject])

  // Analyze on question change (debounced)
  useEffect(() => {
    if (!formData.question.trim()) return

    const timer = setTimeout(() => {
      analyzeQuestion()
    }, 500)

    return () => clearTimeout(timer)
  }, [formData.question, analyzeQuestion])

  const handleSave = async () => {
    if (!formData.question.trim()) return

    setSaving(true)
    try {
      await onSave({
        ...formData,
        id: question?.id
      })
      onClose()
    } catch (err) {
      logger.error('Error saving question:', err)
    } finally {
      setSaving(false)
    }
  }

  const useSuggestion = (text) => {
    setFormData(prev => ({
      ...prev,
      answer: prev.answer ? `${prev.answer}\n\n${text}` : text
    }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 overflow-y-auto">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">
            {question ? 'Edit Question' : 'Add Question'}
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Two Column Layout */}
        <div className="flex divide-x divide-gray-200">
          {/* Left: Form */}
          <div className="flex-1 p-4 space-y-4">
            {/* Question */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compliance Question *
              </label>
              <textarea
                value={formData.question}
                onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                placeholder="Enter the compliance question or requirement..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                rows={3}
              />
            </div>

            {/* Category & Regulatory Ref */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value || null }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Auto-detect</option>
                  {Object.entries(COMPLIANCE_CATEGORIES).map(([id, cat]) => (
                    <option key={id} value={id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Regulatory Reference
                </label>
                <input
                  type="text"
                  value={formData.regulatoryRef}
                  onChange={(e) => setFormData(prev => ({ ...prev, regulatoryRef: e.target.value }))}
                  placeholder="e.g., CAR 903.02(d)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Answer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Answer
              </label>
              <textarea
                value={formData.answer}
                onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                placeholder="Enter your response... (suggestions will appear on the right)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                rows={8}
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (internal)
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Optional notes for your reference"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Right: Suggestions Panel */}
          <div className="w-80 p-4 bg-gray-50 overflow-y-auto max-h-[600px]">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h4 className="font-medium text-gray-900 text-sm">AI Suggestions</h4>
              {loadingSuggestions && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
            </div>

            {!formData.question.trim() ? (
              <p className="text-sm text-gray-500 text-center py-8">
                Enter a question to get suggestions
              </p>
            ) : loadingSuggestions ? (
              <p className="text-sm text-gray-500 text-center py-8">
                Analyzing question...
              </p>
            ) : suggestions ? (
              <div className="space-y-4">
                {/* Pattern Insights */}
                {suggestions.pattern?.category && (
                  <div className="p-3 bg-white rounded border border-gray-200">
                    <p className="text-xs font-medium text-gray-500 mb-2">Detected Pattern</p>
                    <span className={`text-xs px-2 py-1 rounded ${CATEGORY_COLORS[suggestions.pattern.category.id] || 'bg-gray-100'}`}>
                      {suggestions.pattern.category.name}
                    </span>
                    {suggestions.pattern.responseHints?.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-gray-500">Should include:</p>
                        {suggestions.pattern.responseHints.slice(0, 3).map((hint, i) => (
                          <p key={i} className="text-xs text-gray-600 flex items-start gap-1">
                            <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                            {hint}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* AI-Generated Draft Response */}
                {suggestions.comprehensive?.compositeResponse?.draft && (
                  <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-purple-700 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        AI Draft Suggestion
                      </p>
                      <span className="text-xs text-gray-500">
                        {suggestions.comprehensive.compositeResponse.confidence}% confidence
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 whitespace-pre-line line-clamp-6">
                      {suggestions.comprehensive.compositeResponse.draft}
                    </p>
                    {suggestions.comprehensive.compositeResponse.sources?.length > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        Sources: {suggestions.comprehensive.compositeResponse.sources.join(', ')}
                      </p>
                    )}
                    <button
                      onClick={() => useSuggestion(suggestions.comprehensive.compositeResponse.draft)}
                      className="mt-2 w-full py-1.5 bg-purple-600 text-white text-xs font-medium rounded hover:bg-purple-700"
                    >
                      Use this draft
                    </button>
                  </div>
                )}

                {/* KB Matches */}
                {suggestions.comprehensive?.fromKnowledgeBase?.directMatches?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">From Knowledge Base</p>
                    <div className="space-y-2">
                      {suggestions.comprehensive.fromKnowledgeBase.directMatches.slice(0, 3).map((match, i) => (
                        <div key={i} className="p-2 bg-white rounded border border-gray-200">
                          <p className="text-xs font-medium text-gray-700">{match.sourceTitle}</p>
                          {match.sectionTitle && (
                            <p className="text-xs text-gray-500">{match.sectionTitle}</p>
                          )}
                          <p className="text-xs text-gray-600 mt-1 line-clamp-3">
                            {match.content?.substring(0, 150)}...
                          </p>
                          <button
                            onClick={() => useSuggestion(match.content)}
                            className="mt-2 text-xs text-blue-600 hover:text-blue-700"
                          >
                            Use this
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Project Data */}
                {suggestions.comprehensive?.fromProject?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">From Linked Project</p>
                    <div className="space-y-2">
                      {suggestions.comprehensive.fromProject.slice(0, 3).map((item, i) => (
                        <div key={i} className="p-2 bg-green-50 rounded border border-green-200">
                          <p className="text-xs font-medium text-green-700">{item.label}</p>
                          <p className="text-xs text-green-600 mt-1 line-clamp-2">{item.value}</p>
                          <button
                            onClick={() => useSuggestion(item.value)}
                            className="mt-2 text-xs text-green-700 hover:text-green-800"
                          >
                            Use this
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Templates */}
                {suggestions.comprehensive?.templates?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Response Templates</p>
                    <div className="space-y-2">
                      {suggestions.comprehensive.templates.slice(0, 2).map((template, i) => (
                        <div key={i} className="p-2 bg-purple-50 rounded border border-purple-200">
                          <p className="text-xs font-medium text-purple-700">{template.name}</p>
                          <button
                            onClick={() => useSuggestion(template.template)}
                            className="mt-2 text-xs text-purple-700 hover:text-purple-800"
                          >
                            Use template
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!formData.question.trim() || saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {question ? 'Update' : 'Add'} Question
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ComplianceProjectEditor({ projectId, linkedProject = null }) {
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [expandedQuestionId, setExpandedQuestionId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)

  // Load project
  useEffect(() => {
    loadProject()
  }, [projectId])

  const loadProject = async () => {
    try {
      setLoading(true)
      const data = await getComplianceProject(projectId)
      setProject(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Add/Update question
  const handleSaveQuestion = async (questionData) => {
    if (questionData.id) {
      // Update existing
      await updateComplianceQuestion(projectId, questionData.id, questionData)
    } else {
      // Add new
      await addComplianceQuestion(projectId, questionData)
    }
    await loadProject()
  }

  // Delete question
  const handleDeleteQuestion = async (questionId) => {
    if (!confirm('Delete this question?')) return
    await deleteComplianceQuestion(projectId, questionId)
    await loadProject()
  }

  // Open edit modal
  const handleEditQuestion = (question) => {
    setEditingQuestion(question)
    setModalOpen(true)
  }

  // Open add modal
  const handleAddQuestion = () => {
    setEditingQuestion(null)
    setModalOpen(true)
  }

  // Export
  const handleExport = () => {
    if (!project?.questions?.length) return

    let content = `# ${project.name}\n\n`
    if (project.description) content += `${project.description}\n\n`
    content += `---\n\n`

    project.questions.forEach((q, i) => {
      content += `## ${i + 1}. ${q.question}\n\n`
      if (q.regulatoryRef) content += `**Reference:** ${q.regulatoryRef}\n\n`
      if (q.answer) {
        content += `**Answer:**\n${q.answer}\n\n`
      } else {
        content += `*No answer yet*\n\n`
      }
      content += `---\n\n`
    })

    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.name.replace(/\s+/g, '_')}_compliance.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-3" />
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{project?.name}</h2>
            {project?.description && (
              <p className="text-sm text-gray-500 mt-1">{project.description}</p>
            )}
            {project?.linkedProjectName && (
              <p className="text-sm text-blue-600 mt-1 flex items-center gap-1">
                <FolderOpen className="w-4 h-4" />
                Linked to: {project.linkedProjectName}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={!project?.questions?.length}
              className="px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handleAddQuestion}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          </div>
        </div>

        {/* Stats */}
        {project?.stats && (
          <div className="flex gap-4 mt-4 text-sm">
            <span className="text-gray-600">
              <strong>{project.stats.total}</strong> questions
            </span>
            <span className="text-green-600">
              <strong>{project.stats.answered}</strong> answered
            </span>
            <span className="text-gray-400">
              <strong>{project.stats.unanswered}</strong> unanswered
            </span>
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {project?.questions?.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
            <HelpCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 mb-4">No questions yet</p>
            <button
              onClick={handleAddQuestion}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add First Question
            </button>
          </div>
        ) : (
          project?.questions?.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              isExpanded={expandedQuestionId === question.id}
              onToggle={() => setExpandedQuestionId(
                expandedQuestionId === question.id ? null : question.id
              )}
              onEdit={handleEditQuestion}
              onDelete={handleDeleteQuestion}
            />
          ))
        )}
      </div>

      {/* Question Modal */}
      {modalOpen && (
        <QuestionModal
          key={editingQuestion?.id || 'new'}
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false)
            setEditingQuestion(null)
          }}
          onSave={handleSaveQuestion}
          question={editingQuestion}
          project={project}
          linkedProject={linkedProject}
        />
      )}
    </div>
  )
}
