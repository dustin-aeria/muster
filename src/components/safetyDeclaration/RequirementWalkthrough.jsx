/**
 * Requirement Walkthrough Component
 * Step-by-step guide for each CAR 922 requirement
 *
 * @location src/components/safetyDeclaration/RequirementWalkthrough.jsx
 */

import React, { useState, useEffect } from 'react'
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  Target,
  ClipboardCheck,
  MessageSquare,
  Sparkles,
  RefreshCw,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { HelpTooltip } from '../ui/Tooltip'
import {
  REQUIREMENT_GUIDANCE,
  SECTION_GUIDANCE,
  COMPLIANCE_METHODS,
  getGuidance
} from '../../lib/requirementGuidance'

// ============================================
// Main Walkthrough Component
// ============================================

export function RequirementWalkthrough({
  requirementId,
  requirementText,
  acceptanceCriteria,
  rpasContext = {},
  onClose,
  onAICheck,
  className = ''
}) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState([])
  const [aiCheckResult, setAiCheckResult] = useState(null)
  const [isCheckingAI, setIsCheckingAI] = useState(false)
  const [userNotes, setUserNotes] = useState('')
  const [selectedMethod, setSelectedMethod] = useState(null)

  // Get guidance for this requirement
  const guidance = getGuidance(requirementId) || {}
  const sectionId = requirementId?.split('.').slice(0, 2).join('.')
  const sectionGuidance = SECTION_GUIDANCE[sectionId] || {}

  // Define walkthrough steps
  const steps = [
    { id: 'understand', title: 'What It Requires', icon: FileText },
    { id: 'why', title: 'Why It Matters', icon: Target },
    { id: 'how', title: 'How to Comply', icon: ClipboardCheck },
    { id: 'evidence', title: 'Evidence Needed', icon: BookOpen },
    { id: 'mistakes', title: 'Common Mistakes', icon: AlertTriangle },
    { id: 'check', title: 'AI Check', icon: Sparkles }
  ]

  const currentStepData = steps[currentStep]

  // Mark step as complete
  const completeStep = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep])
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  // AI Check
  const handleAICheck = async () => {
    if (!onAICheck) return

    setIsCheckingAI(true)
    setAiCheckResult(null)

    try {
      const result = await onAICheck({
        requirementId,
        requirementText,
        selectedMethod,
        userNotes,
        rpasContext
      })
      setAiCheckResult(result)
    } catch (error) {
      setAiCheckResult({ success: false, error: error.message })
    } finally {
      setIsCheckingAI(false)
    }
  }

  // Get tips for user's RPAS type
  const rpasTypeTips = rpasContext?.isCustomBuild
    ? guidance.tips?.custom
    : guidance.tips?.commercial

  return (
    <div className={`bg-white rounded-lg shadow-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            <span className="font-medium">Requirement Walkthrough</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <h2 className="text-xl font-bold">CAR {requirementId}</h2>
        <p className="text-white/80 text-sm mt-1">{sectionGuidance.title}</p>
      </div>

      {/* Progress Indicator */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(index)
            const isCurrent = index === currentStep
            const StepIcon = step.icon

            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => setCurrentStep(index)}
                  className={`flex flex-col items-center gap-1 transition-colors ${
                    isCurrent
                      ? 'text-indigo-600'
                      : isCompleted
                        ? 'text-green-600'
                        : 'text-gray-400'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    isCurrent
                      ? 'border-indigo-600 bg-indigo-100'
                      : isCompleted
                        ? 'border-green-600 bg-green-100'
                        : 'border-gray-300 bg-white'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-xs font-medium hidden sm:block">{step.title}</span>
                </button>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    isCompleted ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 min-h-[400px]">
        {/* Step 1: What It Requires */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              What This Requirement Says
            </h3>

            {/* Original Text */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-500 mb-2">Official Requirement Text</p>
              <p className="text-gray-900">{requirementText}</p>
            </div>

            {/* Plain Language */}
            {guidance.plainLanguage && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-700 mb-2 flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  In Plain Language
                </p>
                <p className="text-blue-900">{guidance.plainLanguage}</p>
              </div>
            )}

            {/* Acceptance Criteria */}
            {acceptanceCriteria && (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm font-medium text-amber-700 mb-2">Acceptance Criteria</p>
                <p className="text-amber-900">{acceptanceCriteria}</p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Why It Matters */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              Why This Matters
            </h3>

            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <p className="text-indigo-900">
                {guidance.whyItMatters || sectionGuidance.summary || 'Understanding why this requirement exists helps you implement it correctly.'}
              </p>
            </div>

            {/* Safety Rationale */}
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm font-medium text-red-700 mb-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Safety Rationale
              </p>
              <p className="text-red-900 text-sm">
                This requirement exists to protect people, property, and the aviation system.
                Non-compliance could result in accidents, injuries, or regulatory action.
              </p>
            </div>

            {/* Section Key Points */}
            {sectionGuidance.keyPoints && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Key Points for {sectionGuidance.title}</p>
                <ul className="space-y-2">
                  {sectionGuidance.keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Step 3: How to Comply */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-indigo-600" />
              How to Comply
            </h3>

            {/* Compliance Steps */}
            {guidance.howToComply && (
              <div className="space-y-3">
                {guidance.howToComply.map((step, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-gray-700">{step}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Compliance Method Selection */}
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Select Your Compliance Method</p>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(COMPLIANCE_METHODS).map(([key, method]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedMethod(key)}
                    className={`p-3 text-left rounded-lg border-2 transition-all ${
                      selectedMethod === key
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium text-gray-900">{method.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{method.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Tips for RPAS Type */}
            {rpasTypeTips && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-700 mb-1 flex items-center gap-1">
                  <Lightbulb className="w-4 h-4" />
                  Tip for Your RPAS Type
                </p>
                <p className="text-green-900 text-sm">{rpasTypeTips}</p>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Evidence Needed */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Evidence Needed
            </h3>

            {/* Example Evidence */}
            {guidance.evidenceExamples && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Acceptable Evidence Examples</p>
                {guidance.evidenceExamples.map((example, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{example}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Typical Evidence for Section */}
            {sectionGuidance.typicalEvidence && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-700 mb-2">
                  Typical Evidence for {sectionGuidance.title}
                </p>
                <ul className="space-y-1">
                  {sectionGuidance.typicalEvidence.map((item, i) => (
                    <li key={i} className="text-sm text-blue-900 flex items-center gap-2">
                      <FileText className="w-3 h-3" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quality Standards */}
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm font-medium text-amber-700 mb-2">Evidence Quality Standards</p>
              <ul className="space-y-1 text-sm text-amber-900">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  Clear, legible, and professionally presented
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  Directly addresses the requirement text
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  Includes dates, signatures, or traceability
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  References applicable standards where relevant
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 5: Common Mistakes */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Common Mistakes to Avoid
            </h3>

            {/* Mistakes List */}
            {guidance.commonMistakes && (
              <div className="space-y-2">
                {guidance.commonMistakes.map((mistake, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-red-900 text-sm">{mistake}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Related Standards */}
            {guidance.relatedStandards && guidance.relatedStandards.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Related Standards</p>
                <div className="flex flex-wrap gap-2">
                  {guidance.relatedStandards.map((standard, i) => (
                    <span key={i} className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">
                      {standard}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Pro Tips */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-700 mb-2 flex items-center gap-1">
                <Lightbulb className="w-4 h-4" />
                Pro Tips
              </p>
              <ul className="space-y-1 text-sm text-green-900">
                <li>Start with the end in mind - what evidence will you need?</li>
                <li>Document as you go, don't leave it until the end</li>
                <li>When in doubt, provide more evidence rather than less</li>
                <li>Reference specific sections of standards, not just the standard name</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 6: AI Check */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI Compliance Check
            </h3>

            <p className="text-gray-600">
              Use AI to validate your approach and get personalized recommendations.
            </p>

            {/* User Notes */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Describe Your Approach (Optional)
              </label>
              <textarea
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="Describe how you plan to comply with this requirement..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Current Selections Summary */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Your Selections</p>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Requirement:</span> {requirementId}</p>
                <p><span className="font-medium">Compliance Method:</span> {selectedMethod ? COMPLIANCE_METHODS[selectedMethod]?.label : 'Not selected'}</p>
                <p><span className="font-medium">RPAS Type:</span> {rpasContext?.isCustomBuild ? 'Custom Build' : 'Commercial'}</p>
              </div>
            </div>

            {/* AI Check Button */}
            {onAICheck ? (
              <button
                onClick={handleAICheck}
                disabled={isCheckingAI}
                className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCheckingAI ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Checking with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Check My Approach
                  </>
                )}
              </button>
            ) : (
              <div className="p-4 bg-gray-100 rounded-lg text-center text-gray-500">
                AI Check not available
              </div>
            )}

            {/* AI Result */}
            {aiCheckResult && (
              <div className={`p-4 rounded-lg ${
                aiCheckResult.success
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                {aiCheckResult.success ? (
                  <div className="prose prose-sm max-w-none text-gray-700">
                    <div className="flex items-start gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <p className="font-medium text-green-700">AI Analysis Complete</p>
                    </div>
                    <div className="whitespace-pre-wrap">{aiCheckResult.guidance || aiCheckResult.recommendation}</div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-red-700">{aiCheckResult.error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            currentStep === 0
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-200'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </button>

        <div className="text-sm text-gray-500">
          Step {currentStep + 1} of {steps.length}
        </div>

        {currentStep < steps.length - 1 ? (
          <button
            onClick={completeStep}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <CheckCircle2 className="w-5 h-5" />
            Complete
          </button>
        )}
      </div>
    </div>
  )
}

// ============================================
// Compact Requirement Card
// ============================================

export function RequirementQuickGuide({
  requirementId,
  requirementText,
  onViewWalkthrough,
  className = ''
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const guidance = getGuidance(requirementId)

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div>
          <p className="text-sm font-medium text-indigo-600">{requirementId}</p>
          <p className="text-sm text-gray-700 mt-0.5 line-clamp-2">{requirementText}</p>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 space-y-3">
          {guidance?.plainLanguage && (
            <div className="p-2 bg-blue-50 rounded text-sm text-blue-900">
              <p className="font-medium text-blue-700 text-xs mb-1">Plain Language</p>
              {guidance.plainLanguage}
            </div>
          )}

          {guidance?.howToComply && (
            <div className="text-xs text-gray-600">
              <p className="font-medium text-gray-700 mb-1">Quick Steps</p>
              <ol className="list-decimal ml-4 space-y-0.5">
                {guidance.howToComply.slice(0, 3).map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          )}

          <button
            onClick={onViewWalkthrough}
            className="w-full flex items-center justify-center gap-1 py-2 text-sm text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            View Full Walkthrough
          </button>
        </div>
      )}
    </div>
  )
}

// ============================================
// Export All
// ============================================

export default RequirementWalkthrough
