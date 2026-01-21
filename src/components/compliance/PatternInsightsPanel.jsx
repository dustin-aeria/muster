/**
 * PatternInsightsPanel.jsx
 * Displays regulatory pattern insights for compliance requirements
 *
 * Shows:
 * - Detected compliance category
 * - Regulatory reference information
 * - Suggested evidence types
 * - Response hints and guidance
 *
 * @location src/components/compliance/PatternInsightsPanel.jsx
 */

import React, { useState, useMemo } from 'react'
import {
  Lightbulb,
  BookOpen,
  FileCheck,
  ChevronRight,
  ChevronDown,
  Info,
  Target,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  FolderOpen,
  Users,
  Plane,
  Shield,
  AlertTriangle,
  Radio,
  Cloud,
  Lock,
  FileBox
} from 'lucide-react'
import { useRequirementAnalysis } from '../../hooks/useRegulatoryPatterns'

// ============================================
// CATEGORY ICONS & COLORS
// ============================================

const CATEGORY_CONFIG = {
  operations: { icon: Target, color: 'blue', bgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200' },
  equipment: { icon: Plane, color: 'purple', bgColor: 'bg-purple-50', textColor: 'text-purple-700', borderColor: 'border-purple-200' },
  crew: { icon: Users, color: 'amber', bgColor: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-200' },
  safety: { icon: Shield, color: 'red', bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200' },
  emergency: { icon: AlertTriangle, color: 'orange', bgColor: 'bg-orange-50', textColor: 'text-orange-700', borderColor: 'border-orange-200' },
  communications: { icon: Radio, color: 'green', bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-200' },
  airspace: { icon: Cloud, color: 'sky', bgColor: 'bg-sky-50', textColor: 'text-sky-700', borderColor: 'border-sky-200' },
  weather: { icon: Cloud, color: 'cyan', bgColor: 'bg-cyan-50', textColor: 'text-cyan-700', borderColor: 'border-cyan-200' },
  insurance: { icon: FileCheck, color: 'emerald', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'border-emerald-200' },
  security: { icon: Lock, color: 'slate', bgColor: 'bg-slate-50', textColor: 'text-slate-700', borderColor: 'border-slate-200' },
  documentation: { icon: FileBox, color: 'gray', bgColor: 'bg-gray-50', textColor: 'text-gray-700', borderColor: 'border-gray-200' }
}

const DEFAULT_CATEGORY_CONFIG = {
  icon: HelpCircle,
  color: 'gray',
  bgColor: 'bg-gray-50',
  textColor: 'text-gray-700',
  borderColor: 'border-gray-200'
}

// ============================================
// SUB-COMPONENTS
// ============================================

function CategoryBadge({ category }) {
  const config = CATEGORY_CONFIG[category?.id] || DEFAULT_CATEGORY_CONFIG
  const Icon = config.icon

  if (!category) return null

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${config.bgColor} ${config.textColor}`}>
      <Icon className="w-3.5 h-3.5" />
      <span className="text-sm font-medium">{category.name}</span>
    </div>
  )
}

function ConfidenceIndicator({ confidence }) {
  const percentage = Math.round((confidence || 0) * 100)
  let color = 'text-gray-400'
  let label = 'Low'

  if (percentage >= 70) {
    color = 'text-green-600'
    label = 'High'
  } else if (percentage >= 40) {
    color = 'text-amber-600'
    label = 'Medium'
  }

  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="text-gray-500">Pattern match:</span>
      <span className={`font-medium ${color}`}>{label}</span>
      <span className="text-gray-400">({percentage}%)</span>
    </div>
  )
}

function CollapsibleSection({ title, icon: Icon, children, defaultExpanded = false, count }) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <div className="border-t border-gray-100">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">{title}</span>
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
      {expanded && (
        <div className="px-3 pb-3">
          {children}
        </div>
      )}
    </div>
  )
}

function RegulatoryRefCard({ regulatoryRef, analysis }) {
  const { lookupRegulation } = require('../../hooks/useRegulatoryPatterns').useRegulatoryPatterns()
  const refInfo = lookupRegulation(regulatoryRef)

  if (!refInfo) {
    return (
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-start gap-2">
          <BookOpen className="w-4 h-4 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-700">{regulatoryRef}</p>
            <p className="text-xs text-gray-500 mt-0.5">Reference not in database</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-start gap-2">
        <BookOpen className="w-4 h-4 text-blue-600 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-900">{refInfo.id}</p>
          <p className="text-sm text-blue-800">{refInfo.title}</p>
          <p className="text-xs text-blue-600 mt-1">{refInfo.description}</p>

          {refInfo.subPartInfo && (
            <div className="mt-2 p-2 bg-blue-100 rounded">
              <p className="text-xs font-medium text-blue-800">
                Subsection ({refInfo.subPart}): {refInfo.subPartInfo.topic || refInfo.subPartInfo.description}
              </p>
            </div>
          )}

          {refInfo.topics && refInfo.topics.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {refInfo.topics.map((topic, i) => (
                <span key={i} className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function EvidenceCard({ evidence }) {
  const sourceTypeIcons = {
    policy: FileText,
    project: FolderOpen,
    equipment: Plane,
    crew: Users,
    upload: FileBox
  }

  return (
    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
      <p className="text-sm font-medium text-emerald-900">{evidence.name}</p>
      <p className="text-xs text-emerald-700 mt-0.5">{evidence.description}</p>

      {evidence.sourceTypes && evidence.sourceTypes.length > 0 && (
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-emerald-600">Sources:</span>
          <div className="flex gap-1">
            {evidence.sourceTypes.map((type, i) => {
              const Icon = sourceTypeIcons[type] || FileText
              return (
                <span key={i} className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <Icon className="w-3 h-3" />
                  {type}
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function ResponseHintCard({ hint, index }) {
  return (
    <div className="flex items-start gap-2 p-2 bg-amber-50 rounded border border-amber-200">
      <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
      <p className="text-sm text-amber-900">{hint}</p>
    </div>
  )
}

function KeywordCloud({ keywords }) {
  if (!keywords || keywords.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1">
      {keywords.slice(0, 10).map((keyword, i) => (
        <span
          key={i}
          className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
        >
          {keyword}
        </span>
      ))}
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function PatternInsightsPanel({ requirement, compact = false }) {
  const analysis = useRequirementAnalysis(requirement)

  if (!requirement) {
    return (
      <div className="p-4 text-center text-gray-500">
        <Lightbulb className="w-8 h-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">Select a requirement to see pattern insights</p>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="p-4 text-center text-gray-500">
        <Info className="w-8 h-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">Analyzing requirement patterns...</p>
      </div>
    )
  }

  const { primaryCategory, suggestedEvidence, responseHints, relatedRegs } = analysis
  const { regulatoryRefs, keywords, confidence } = analysis.analysis || {}

  // Compact mode shows minimal info
  if (compact) {
    return (
      <div className="space-y-2">
        {primaryCategory && (
          <CategoryBadge category={primaryCategory} />
        )}
        {confidence > 0 && (
          <ConfidenceIndicator confidence={confidence} />
        )}
        {suggestedEvidence.length > 0 && (
          <p className="text-xs text-gray-500">
            Needs: {suggestedEvidence.map(e => e.name).join(', ')}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Pattern Insights
          </h3>
        </div>

        {/* Category and Confidence */}
        <div className="space-y-2">
          {primaryCategory ? (
            <CategoryBadge category={primaryCategory} />
          ) : (
            <div className="flex items-center gap-2 text-gray-500">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Category not detected</span>
            </div>
          )}
          <ConfidenceIndicator confidence={confidence} />
        </div>
      </div>

      {/* Regulatory Reference */}
      {requirement.regulatoryRef && (
        <CollapsibleSection
          title="Regulatory Reference"
          icon={BookOpen}
          defaultExpanded={true}
        >
          <RegulatoryRefCard
            regulatoryRef={requirement.regulatoryRef}
            analysis={analysis}
          />
        </CollapsibleSection>
      )}

      {/* Detected References */}
      {regulatoryRefs && regulatoryRefs.length > 0 && !requirement.regulatoryRef && (
        <CollapsibleSection
          title="Detected References"
          icon={BookOpen}
          count={regulatoryRefs.length}
        >
          <div className="space-y-2">
            {regulatoryRefs.map((ref, i) => (
              <RegulatoryRefCard key={i} regulatoryRef={ref} />
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Suggested Evidence */}
      {suggestedEvidence.length > 0 && (
        <CollapsibleSection
          title="Suggested Evidence"
          icon={FileCheck}
          count={suggestedEvidence.length}
          defaultExpanded={true}
        >
          <div className="space-y-2">
            {suggestedEvidence.map((evidence, i) => (
              <EvidenceCard key={i} evidence={evidence} />
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Response Hints */}
      {responseHints && responseHints.length > 0 && (
        <CollapsibleSection
          title="Response Should Include"
          icon={CheckCircle2}
          count={responseHints.length}
        >
          <div className="space-y-2">
            {responseHints.map((hint, i) => (
              <ResponseHintCard key={i} hint={hint} index={i} />
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Question Pattern Match */}
      {analysis.questionPattern && (
        <CollapsibleSection
          title="Similar Question Pattern"
          icon={HelpCircle}
        >
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm font-medium text-purple-900 capitalize">
              {analysis.questionPattern.id.replace(/_/g, ' ')}
            </p>
            <p className="text-xs text-purple-700 mt-1">
              This type of question typically asks about {analysis.questionPattern.category}
            </p>
            {analysis.questionPattern.regulatoryRef && (
              <p className="text-xs text-purple-600 mt-1">
                Often related to: {analysis.questionPattern.regulatoryRef}
              </p>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Keywords */}
      {keywords && keywords.length > 0 && (
        <CollapsibleSection
          title="Detected Keywords"
          icon={Target}
          count={keywords.length}
        >
          <KeywordCloud keywords={keywords} />
        </CollapsibleSection>
      )}

      {/* No insights available */}
      {!primaryCategory && suggestedEvidence.length === 0 && responseHints.length === 0 && (
        <div className="p-4 text-center">
          <AlertCircle className="w-6 h-6 mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">
            No specific patterns detected for this requirement
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Try adding more context or regulatory references
          </p>
        </div>
      )}
    </div>
  )
}

// Also export a simpler inline version
export function PatternBadge({ requirement }) {
  const analysis = useRequirementAnalysis(requirement)

  if (!analysis?.primaryCategory) return null

  const config = CATEGORY_CONFIG[analysis.primaryCategory.id] || DEFAULT_CATEGORY_CONFIG
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${config.bgColor} ${config.textColor}`}>
      <Icon className="w-3 h-3" />
      {analysis.primaryCategory.name}
    </span>
  )
}
