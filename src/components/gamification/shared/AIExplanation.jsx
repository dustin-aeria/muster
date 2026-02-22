/**
 * AIExplanation Component
 *
 * Displays AI-generated explanations with consistent styling.
 * Used for wrong answer explanations, concept clarifications,
 * and scenario debriefs.
 *
 * @version 1.0.0
 */

import React, { useState } from 'react'
import {
  Lightbulb,
  ChevronDown,
  ChevronUp,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Info,
  ExternalLink,
  Sparkles
} from 'lucide-react'

/**
 * Main AIExplanation component
 *
 * @param {Object} props
 * @param {string} props.type - Type of explanation: 'wrong-answer' | 'correct' | 'concept' | 'debrief' | 'tip'
 * @param {string} props.title - Optional title for the explanation
 * @param {string} props.content - Main explanation content
 * @param {Array} props.keyPoints - Optional array of key learning points
 * @param {Array} props.references - Optional regulatory or document references
 * @param {boolean} props.collapsible - Whether the explanation can be collapsed
 * @param {boolean} props.defaultExpanded - Initial expanded state
 * @param {string} props.className - Additional CSS classes
 */
export default function AIExplanation({
  type = 'concept',
  title,
  content,
  keyPoints = [],
  references = [],
  collapsible = false,
  defaultExpanded = true,
  className = ''
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  // Type-specific styling
  const typeConfig = {
    'wrong-answer': {
      icon: AlertTriangle,
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      iconColor: 'text-amber-500',
      titleColor: 'text-amber-800',
      defaultTitle: 'Let\'s Learn From This'
    },
    'correct': {
      icon: CheckCircle2,
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      iconColor: 'text-emerald-500',
      titleColor: 'text-emerald-800',
      defaultTitle: 'Great Job!'
    },
    'concept': {
      icon: Lightbulb,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-500',
      titleColor: 'text-blue-800',
      defaultTitle: 'Concept Explanation'
    },
    'debrief': {
      icon: BookOpen,
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      iconColor: 'text-indigo-500',
      titleColor: 'text-indigo-800',
      defaultTitle: 'Scenario Debrief'
    },
    'tip': {
      icon: Info,
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      iconColor: 'text-gray-500',
      titleColor: 'text-gray-800',
      defaultTitle: 'Tip'
    }
  }

  const config = typeConfig[type] || typeConfig.concept
  const Icon = config.icon
  const displayTitle = title || config.defaultTitle

  return (
    <div
      className={`${config.bgColor} ${config.borderColor} border rounded-lg overflow-hidden ${className}`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 ${
          collapsible ? 'cursor-pointer hover:bg-black/5' : ''
        }`}
        onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-full ${config.bgColor}`}>
            <Icon className={`w-5 h-5 ${config.iconColor}`} />
          </div>
          <div className="flex items-center gap-2">
            <h4 className={`font-semibold ${config.titleColor}`}>
              {displayTitle}
            </h4>
            <Sparkles className={`w-4 h-4 ${config.iconColor} opacity-50`} />
          </div>
        </div>
        {collapsible && (
          <button className={`p-1 ${config.iconColor}`}>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {/* Content */}
      {(!collapsible || isExpanded) && (
        <div className="px-4 pb-4">
          {/* Main explanation */}
          <p className="text-gray-700 text-sm leading-relaxed">
            {content}
          </p>

          {/* Key Points */}
          {keyPoints.length > 0 && (
            <div className="mt-4">
              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Key Takeaways
              </h5>
              <ul className="space-y-2">
                {keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className={`w-5 h-5 rounded-full ${config.bgColor} ${config.iconColor} flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5`}>
                      {index + 1}
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* References */}
          {references.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Related Regulations & References
              </h5>
              <div className="flex flex-wrap gap-2">
                {references.map((ref, index) => (
                  <a
                    key={index}
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {ref.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Wrong Answer Explanation - Specialized wrapper
 */
export function WrongAnswerExplanation({
  correctAnswer,
  userAnswer,
  explanation,
  keyPoints = [],
  references = [],
  ...props
}) {
  return (
    <AIExplanation
      type="wrong-answer"
      title="Understanding the Correct Answer"
      content={
        <>
          <div className="mb-3 p-3 bg-white/50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Your answer:</div>
            <div className="text-sm text-red-600 line-through">{userAnswer}</div>
            <div className="text-xs text-gray-500 mt-2 mb-1">Correct answer:</div>
            <div className="text-sm text-emerald-600 font-medium">{correctAnswer}</div>
          </div>
          {explanation}
        </>
      }
      keyPoints={keyPoints}
      references={references}
      {...props}
    />
  )
}

/**
 * Scenario Debrief - Specialized wrapper for scenario outcomes
 */
export function ScenarioDebrief({
  outcome,
  outcomeType, // 'success' | 'partial' | 'failure'
  decisions = [],
  keyLessons = [],
  alternativeApproach,
  realWorldConnection,
  references = [],
  ...props
}) {
  const outcomeConfig = {
    success: {
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      title: 'Mission Success',
      emoji: '\u2705'
    },
    partial: {
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      title: 'Partial Success',
      emoji: '\u26A0\uFE0F'
    },
    failure: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      title: 'Mission Outcome',
      emoji: '\u274C'
    }
  }

  const config = outcomeConfig[outcomeType] || outcomeConfig.partial

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg overflow-hidden`}>
      {/* Outcome Header */}
      <div className="px-4 py-3 border-b border-gray-200/50">
        <div className="flex items-center gap-2">
          <span className="text-xl">{config.emoji}</span>
          <h4 className="font-semibold text-gray-800">{config.title}</h4>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Outcome description */}
        <p className="text-gray-700">{outcome}</p>

        {/* Decision review */}
        {decisions.length > 0 && (
          <div>
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Your Decisions
            </h5>
            <div className="space-y-2">
              {decisions.map((decision, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-lg text-sm ${
                    decision.wasOptimal
                      ? 'bg-emerald-100/50 text-emerald-800'
                      : 'bg-amber-100/50 text-amber-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {decision.wasOptimal ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                    {decision.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key lessons */}
        {keyLessons.length > 0 && (
          <div>
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Key Lessons
            </h5>
            <ul className="space-y-1.5">
              {keyLessons.map((lesson, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  {lesson}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Alternative approach */}
        {alternativeApproach && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <h5 className="text-xs font-semibold text-blue-800 uppercase tracking-wide mb-1">
              Alternative Approach
            </h5>
            <p className="text-sm text-blue-700">{alternativeApproach}</p>
          </div>
        )}

        {/* Real-world connection */}
        {realWorldConnection && (
          <div className="p-3 bg-indigo-50 rounded-lg">
            <h5 className="text-xs font-semibold text-indigo-800 uppercase tracking-wide mb-1">
              Real-World Connection
            </h5>
            <p className="text-sm text-indigo-700">{realWorldConnection}</p>
          </div>
        )}

        {/* References */}
        {references.length > 0 && (
          <div className="pt-3 border-t border-gray-200/50">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Related Regulations
            </h5>
            <div className="flex flex-wrap gap-2">
              {references.map((ref, index) => (
                <a
                  key={index}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  {ref.title}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Loading state for AI explanations
 */
export function AIExplanationLoading() {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-4/5 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  )
}
