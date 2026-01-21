/**
 * EnhancedAIPanel.jsx
 * Comprehensive AI-powered assistance panel for compliance requirements
 *
 * Features:
 * - Knowledge Base document suggestions
 * - Project data auto-population
 * - Response templates with placeholders
 * - Cross-reference to related requirements
 *
 * @location src/components/compliance/EnhancedAIPanel.jsx
 */

import React, { useState, useEffect, useMemo } from 'react'
import {
  Sparkles,
  FileText,
  Database,
  FolderOpen,
  Link2,
  ChevronRight,
  ChevronDown,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  FileCode,
  Users,
  Plane,
  RefreshCw,
  X,
  ArrowRight,
  Edit3,
  Book,
  Target,
  FileCheck,
  Shield
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import {
  getComprehensiveSuggestions,
  RESPONSE_TEMPLATES,
  applyTemplate,
  getUnfilledPlaceholders
} from '../../lib/complianceAssistant'
import { useKnowledgeBase } from '../../hooks/useKnowledgeBase'
import { PatternBadge } from './PatternInsightsPanel'
import { logger } from '../../lib/logger'

// ============================================
// SOURCE ICONS
// ============================================

const SOURCE_ICONS = {
  policy: FileText,
  project: FolderOpen,
  equipment: Plane,
  crew: Users
}

// ============================================
// SUB-COMPONENTS
// ============================================

function SectionHeader({ icon: Icon, title, count, expanded, onToggle, color = 'gray' }) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    purple: 'text-purple-600 bg-purple-50',
    amber: 'text-amber-600 bg-amber-50',
    gray: 'text-gray-600 bg-gray-50'
  }

  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
    >
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded ${colorClasses[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="font-medium text-gray-900">{title}</span>
        {count > 0 && (
          <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </div>
      {expanded ? (
        <ChevronDown className="w-4 h-4 text-gray-400" />
      ) : (
        <ChevronRight className="w-4 h-4 text-gray-400" />
      )}
    </button>
  )
}

function KBResultCard({ result, onUseContent, onLinkDocument }) {
  const [expanded, setExpanded] = useState(false)
  const Icon = SOURCE_ICONS[result.sourceType] || FileText

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 text-left flex items-start gap-2 hover:bg-gray-50"
      >
        <Icon className="w-4 h-4 text-gray-400 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 text-sm truncate">
              {result.sourceTitle}
            </span>
            {result.relevanceScore > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                result.relevanceScore > 70 ? 'bg-green-100 text-green-700' :
                result.relevanceScore > 40 ? 'bg-amber-100 text-amber-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {result.relevanceScore}%
              </span>
            )}
          </div>
          {result.sectionTitle && (
            <p className="text-xs text-gray-500 mt-0.5">{result.sectionTitle}</p>
          )}
        </div>
        {expanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
      </button>

      {expanded && (
        <div className="border-t border-gray-100 p-3 space-y-2">
          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded max-h-32 overflow-y-auto">
            {result.content?.substring(0, 500)}
            {result.content?.length > 500 && '...'}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onUseContent(result.content)}
              className="flex-1 text-xs bg-aeria-navy text-white px-2 py-1.5 rounded flex items-center justify-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Use
            </button>
            <button
              onClick={() => onLinkDocument(result)}
              className="flex-1 text-xs border border-gray-300 text-gray-700 px-2 py-1.5 rounded flex items-center justify-center gap-1"
            >
              <Link2 className="w-3 h-3" />
              Link
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ProjectDataCard({ suggestion, onUse }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(suggestion.value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="border border-green-200 bg-green-50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-green-800">{suggestion.label}</span>
        <div className="flex gap-1">
          <button
            onClick={handleCopy}
            className="p-1 text-green-600 hover:bg-green-100 rounded"
            title="Copy"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </div>
      <p className="text-sm text-green-900 whitespace-pre-wrap line-clamp-3">
        {suggestion.value}
      </p>
      <button
        onClick={() => onUse(suggestion.value)}
        className="mt-2 w-full text-xs bg-green-600 text-white px-2 py-1.5 rounded flex items-center justify-center gap-1"
      >
        <ExternalLink className="w-3 h-3" />
        Use This Data
      </button>
    </div>
  )
}

function TemplateCard({ template, onUse, onCustomize }) {
  return (
    <div className="border border-purple-200 bg-purple-50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-purple-900 text-sm">{template.name}</span>
        {template.matchScore && (
          <span className="text-xs bg-purple-200 text-purple-700 px-1.5 py-0.5 rounded">
            {template.matchScore}% match
          </span>
        )}
      </div>
      {template.regulatoryRefs && (
        <div className="flex flex-wrap gap-1 mb-2">
          {template.regulatoryRefs.map((ref, i) => (
            <span key={i} className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
              {ref}
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => onUse(template)}
          className="flex-1 text-xs bg-purple-600 text-white px-2 py-1.5 rounded flex items-center justify-center gap-1"
        >
          <FileCode className="w-3 h-3" />
          Use Template
        </button>
        <button
          onClick={() => onCustomize(template)}
          className="flex-1 text-xs border border-purple-300 text-purple-700 px-2 py-1.5 rounded flex items-center justify-center gap-1"
        >
          <Edit3 className="w-3 h-3" />
          Customize
        </button>
      </div>
    </div>
  )
}

function RelatedRequirementCard({ related, onNavigate }) {
  return (
    <button
      onClick={() => onNavigate(related.requirementId)}
      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          {related.regulatoryRef && (
            <span className="text-xs text-blue-600 font-medium">{related.regulatoryRef}</span>
          )}
          <p className="text-sm text-gray-900 truncate">{related.shortText}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-1.5 py-0.5 rounded ${
              related.hasContent ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {related.hasContent ? 'Has content' : 'Empty'}
            </span>
            <span className="text-xs text-gray-500">
              {related.cluster}
            </span>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400" />
      </div>
    </button>
  )
}

function TemplateCustomizer({ template, onApply, onCancel }) {
  const [values, setValues] = useState({})
  const [preview, setPreview] = useState(template.template)

  useEffect(() => {
    setPreview(applyTemplate(template.id, values))
  }, [values, template.id])

  const handleValueChange = (key, value) => {
    setValues(prev => ({ ...prev, [key]: value }))
  }

  const unfilledCount = getUnfilledPlaceholders(preview).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Customize: {template.name}</h4>
        <button onClick={onCancel} className="p-1 text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Placeholder inputs */}
      <div className="space-y-3 max-h-48 overflow-y-auto">
        {template.placeholders.map(placeholder => (
          <div key={placeholder.key}>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {placeholder.key.replace(/_/g, ' ')}
            </label>
            <input
              type="text"
              value={values[placeholder.key] || ''}
              onChange={(e) => handleValueChange(placeholder.key, e.target.value)}
              placeholder={placeholder.hint}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        ))}
      </div>

      {/* Preview */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-700">Preview</span>
          {unfilledCount > 0 && (
            <span className="text-xs text-amber-600">{unfilledCount} placeholders remaining</span>
          )}
        </div>
        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded max-h-32 overflow-y-auto whitespace-pre-wrap">
          {preview}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onApply(preview)}
          className="flex-1 bg-purple-600 text-white px-3 py-2 rounded text-sm font-medium"
        >
          Apply Template
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-2 border border-gray-300 rounded text-sm text-gray-700"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function EnhancedAIPanel({
  requirement,
  project,
  allRequirements = [],
  responses = {},
  onUseContent,
  onLinkDocument,
  onNavigateToRequirement
}) {
  const { user } = useAuth()
  const { isIndexed } = useKnowledgeBase()

  // State
  const [suggestions, setSuggestions] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [customizingTemplate, setCustomizingTemplate] = useState(null)

  // Section visibility
  const [sections, setSections] = useState({
    patternInsights: true,
    knowledgeBase: true,
    projectData: true,
    templates: true,
    related: false
  })

  // Load suggestions when requirement changes
  useEffect(() => {
    if (requirement && user) {
      loadSuggestions()
    }
  }, [requirement?.id])

  const loadSuggestions = async () => {
    if (!requirement || !user) return

    setLoading(true)
    setError(null)

    try {
      const result = await getComprehensiveSuggestions(
        user.uid,
        requirement,
        project,
        allRequirements,
        responses
      )
      setSuggestions(result)
    } catch (err) {
      setError('Failed to load suggestions')
      logger.error('Error loading suggestions:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleSection = (section) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleUseTemplate = (template) => {
    const content = applyTemplate(template.id, {})
    onUseContent?.(content)
  }

  const handleApplyCustomTemplate = (content) => {
    onUseContent?.(content)
    setCustomizingTemplate(null)
  }

  // Counts
  const kbCount = (suggestions?.fromKnowledgeBase?.directMatches?.length || 0) +
    (suggestions?.fromKnowledgeBase?.relatedMatches?.length || 0)
  const projectCount = suggestions?.fromProject?.length || 0
  const templateCount = suggestions?.templates?.length || 0
  const relatedCount = suggestions?.relatedRequirements?.length || 0

  // If customizing a template, show that view
  if (customizingTemplate) {
    return (
      <div className="p-4">
        <TemplateCustomizer
          template={customizingTemplate}
          onApply={handleApplyCustomTemplate}
          onCancel={() => setCustomizingTemplate(null)}
        />
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            AI Assistant
          </h3>
          <button
            onClick={loadSuggestions}
            disabled={loading}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Requirement Context */}
        {requirement && (
          <div className="p-2 bg-gray-50 rounded text-sm">
            <p className="text-gray-600 line-clamp-2">
              {requirement.shortText || requirement.text?.substring(0, 100)}
            </p>
            {requirement.regulatoryRef && (
              <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                {requirement.regulatoryRef}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="p-8 text-center">
          <Loader2 className="w-6 h-6 mx-auto text-aeria-navy animate-spin mb-2" />
          <p className="text-sm text-gray-500">Finding suggestions...</p>
        </div>
      )}

      {/* Suggestions */}
      {!loading && suggestions && (
        <>
          {/* Pattern Insights Section */}
          {suggestions.patternAnalysis && (
            <div>
              <SectionHeader
                icon={Target}
                title="Pattern Insights"
                count={suggestions.patternAnalysis.suggestedEvidence?.length || 0}
                expanded={sections.patternInsights}
                onToggle={() => toggleSection('patternInsights')}
                color="amber"
              />
              {sections.patternInsights && (
                <div className="p-4 pt-0 space-y-3">
                  {/* Category & Confidence */}
                  {suggestions.patternAnalysis.category && (
                    <div className="flex items-center justify-between">
                      <PatternBadge requirement={requirement} />
                      <span className="text-xs text-gray-500">
                        {Math.round(suggestions.patternAnalysis.confidence * 100)}% confidence
                      </span>
                    </div>
                  )}

                  {/* Response Hints */}
                  {suggestions.patternAnalysis.responseHints?.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-gray-600">Response should include:</p>
                      {suggestions.patternAnalysis.responseHints.slice(0, 3).map((hint, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{hint}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Suggested Evidence */}
                  {suggestions.patternAnalysis.suggestedEvidence?.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-gray-600">Evidence typically needed:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {suggestions.patternAnalysis.suggestedEvidence.slice(0, 4).map((evidence, i) => (
                          <span
                            key={i}
                            className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-200"
                            title={evidence.description}
                          >
                            <FileCheck className="w-3 h-3 inline mr-1" />
                            {evidence.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Question Pattern Match */}
                  {suggestions.patternAnalysis.questionPattern && (
                    <div className="p-2 bg-purple-50 rounded border border-purple-200">
                      <p className="text-xs text-purple-700">
                        <Shield className="w-3 h-3 inline mr-1" />
                        <strong>Pattern recognized:</strong> This is typically a{' '}
                        <span className="font-medium">
                          {suggestions.patternAnalysis.questionPattern.id.replace(/_/g, ' ')}
                        </span>{' '}
                        question
                        {suggestions.patternAnalysis.questionPattern.regulatoryRef && (
                          <span className="ml-1">
                            (related to {suggestions.patternAnalysis.questionPattern.regulatoryRef})
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Project Data Section */}
          {projectCount > 0 && (
            <div>
              <SectionHeader
                icon={FolderOpen}
                title="From Project"
                count={projectCount}
                expanded={sections.projectData}
                onToggle={() => toggleSection('projectData')}
                color="green"
              />
              {sections.projectData && (
                <div className="p-4 pt-0 space-y-2">
                  {suggestions.fromProject.map((suggestion, i) => (
                    <ProjectDataCard
                      key={i}
                      suggestion={suggestion}
                      onUse={onUseContent}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Knowledge Base Section */}
          {isIndexed && (
            <div>
              <SectionHeader
                icon={Database}
                title="From Knowledge Base"
                count={kbCount}
                expanded={sections.knowledgeBase}
                onToggle={() => toggleSection('knowledgeBase')}
                color="blue"
              />
              {sections.knowledgeBase && (
                <div className="p-4 pt-0 space-y-2">
                  {kbCount === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No matching documents found
                    </p>
                  ) : (
                    <>
                      {suggestions.fromKnowledgeBase.directMatches?.map((result, i) => (
                        <KBResultCard
                          key={`direct-${i}`}
                          result={result}
                          onUseContent={onUseContent}
                          onLinkDocument={onLinkDocument}
                        />
                      ))}
                      {suggestions.fromKnowledgeBase.relatedMatches?.slice(0, 3).map((result, i) => (
                        <KBResultCard
                          key={`related-${i}`}
                          result={result}
                          onUseContent={onUseContent}
                          onLinkDocument={onLinkDocument}
                        />
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Templates Section */}
          {templateCount > 0 && (
            <div>
              <SectionHeader
                icon={FileCode}
                title="Response Templates"
                count={templateCount}
                expanded={sections.templates}
                onToggle={() => toggleSection('templates')}
                color="purple"
              />
              {sections.templates && (
                <div className="p-4 pt-0 space-y-2">
                  {suggestions.templates.map((template, i) => (
                    <TemplateCard
                      key={i}
                      template={template}
                      onUse={handleUseTemplate}
                      onCustomize={setCustomizingTemplate}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Related Requirements Section */}
          {relatedCount > 0 && (
            <div>
              <SectionHeader
                icon={Link2}
                title="Related Requirements"
                count={relatedCount}
                expanded={sections.related}
                onToggle={() => toggleSection('related')}
                color="amber"
              />
              {sections.related && (
                <div className="p-4 pt-0 space-y-2">
                  <p className="text-xs text-gray-500 mb-2">
                    These requirements may share evidence or content
                  </p>
                  {suggestions.relatedRequirements.slice(0, 5).map((related, i) => (
                    <RelatedRequirementCard
                      key={i}
                      related={related}
                      onNavigate={onNavigateToRequirement}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Gaps Warning */}
          {suggestions.fromKnowledgeBase?.gaps?.length > 0 && (
            <div className="p-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <h5 className="font-medium text-amber-800 flex items-center gap-2 text-sm mb-2">
                  <AlertCircle className="w-4 h-4" />
                  Documentation Gaps
                </h5>
                <ul className="space-y-1">
                  {suggestions.fromKnowledgeBase.gaps.map((gap, i) => (
                    <li key={i} className="text-xs text-amber-700">
                      • {gap.message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </>
      )}

      {/* Not Indexed Warning */}
      {!isIndexed && !loading && (
        <div className="p-4">
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <Database className="w-6 h-6 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-1">Knowledge Base not indexed</p>
            <p className="text-xs text-gray-500">
              Index your policies in the Compliance Hub to enable document suggestions
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
