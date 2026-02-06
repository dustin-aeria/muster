/**
 * Guided Tooltip Component
 * Enhanced tooltips with multi-step explanations and contextual help
 *
 * @location src/components/safetyDeclaration/shared/GuidedTooltip.jsx
 */

import React, { useState, useRef, useEffect } from 'react'
import {
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
  Lightbulb,
  AlertTriangle,
  Info,
  CheckCircle2,
  BookOpen
} from 'lucide-react'

// ============================================
// Guided Tooltip Component
// ============================================

/**
 * Multi-step guided tooltip with "Why this matters" context
 */
export function GuidedTooltip({
  children,
  title,
  steps = [], // [{ title, content }]
  whyItMatters,
  examples = [],
  relatedLinks = [],
  position = 'right',
  trigger = 'hover', // 'hover' | 'click'
  variant = 'default', // 'default' | 'info' | 'warning' | 'tip'
  showStepIndicator = true,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const tooltipRef = useRef(null)
  const triggerRef = useRef(null)

  // Handle click outside
  useEffect(() => {
    if (!isOpen || trigger !== 'click') return

    const handleClickOutside = (event) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target) &&
        !triggerRef.current?.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, trigger])

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  const handleOpen = () => {
    setIsOpen(true)
    setCurrentStep(0)
  }

  const handleClose = () => {
    setIsOpen(false)
    setCurrentStep(0)
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Variant styles
  const variantStyles = {
    default: {
      bg: 'bg-white',
      border: 'border-gray-200',
      header: 'bg-gray-50',
      headerText: 'text-gray-900',
      icon: HelpCircle,
      iconColor: 'text-gray-500'
    },
    info: {
      bg: 'bg-white',
      border: 'border-blue-200',
      header: 'bg-blue-50',
      headerText: 'text-blue-900',
      icon: Info,
      iconColor: 'text-blue-500'
    },
    warning: {
      bg: 'bg-white',
      border: 'border-amber-200',
      header: 'bg-amber-50',
      headerText: 'text-amber-900',
      icon: AlertTriangle,
      iconColor: 'text-amber-500'
    },
    tip: {
      bg: 'bg-white',
      border: 'border-green-200',
      header: 'bg-green-50',
      headerText: 'text-green-900',
      icon: Lightbulb,
      iconColor: 'text-green-500'
    }
  }

  const style = variantStyles[variant]
  const Icon = style.icon

  // Position styles
  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  }

  const hasMultipleSteps = steps.length > 1

  return (
    <div className={`relative inline-flex ${className}`}>
      {/* Trigger */}
      <div
        ref={triggerRef}
        onMouseEnter={trigger === 'hover' ? handleOpen : undefined}
        onMouseLeave={trigger === 'hover' ? handleClose : undefined}
        onClick={trigger === 'click' ? () => setIsOpen(!isOpen) : undefined}
        className="cursor-help"
      >
        {children || (
          <Icon className={`w-4 h-4 ${style.iconColor}`} />
        )}
      </div>

      {/* Tooltip */}
      {isOpen && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 ${positionStyles[position]} w-80 max-h-96 overflow-hidden rounded-lg shadow-lg border ${style.bg} ${style.border}`}
          onMouseEnter={trigger === 'hover' ? handleOpen : undefined}
          onMouseLeave={trigger === 'hover' ? handleClose : undefined}
        >
          {/* Header */}
          <div className={`px-3 py-2 ${style.header} border-b ${style.border} flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <Icon className={`w-4 h-4 ${style.iconColor}`} />
              <span className={`text-sm font-medium ${style.headerText}`}>
                {title || (steps.length > 0 ? steps[currentStep]?.title : 'Help')}
              </span>
            </div>
            {trigger === 'click' && (
              <button
                onClick={handleClose}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <X className="w-3 h-3 text-gray-500" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-3 overflow-y-auto max-h-64">
            {/* Step Content */}
            {steps.length > 0 ? (
              <div className="text-sm text-gray-700">
                {steps[currentStep]?.content}
              </div>
            ) : (
              <div className="text-sm text-gray-700">
                {whyItMatters}
              </div>
            )}

            {/* Why It Matters Section */}
            {whyItMatters && steps.length > 0 && currentStep === steps.length - 1 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-500 mb-1">Why This Matters</p>
                <p className="text-sm text-gray-700">{whyItMatters}</p>
              </div>
            )}

            {/* Examples */}
            {examples.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-500 mb-2">Examples</p>
                <div className="space-y-2">
                  {examples.map((example, i) => (
                    <div
                      key={i}
                      className="p-2 bg-gray-50 rounded text-xs text-gray-600 italic"
                    >
                      {example}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Links */}
            {relatedLinks.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-500 mb-2">Learn More</p>
                <div className="space-y-1">
                  {relatedLinks.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Step Navigation */}
          {hasMultipleSteps && (
            <div className={`px-3 py-2 ${style.header} border-t ${style.border} flex items-center justify-between`}>
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`p-1 rounded transition-colors ${
                  currentStep === 0
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {showStepIndicator && (
                <div className="flex items-center gap-1">
                  {steps.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentStep(i)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        i === currentStep
                          ? 'bg-gray-600'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}

              <button
                onClick={nextStep}
                disabled={currentStep === steps.length - 1}
                className={`p-1 rounded transition-colors ${
                  currentStep === steps.length - 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// Field Help Tooltip
// ============================================

/**
 * Tooltip designed for form field help
 */
export function FieldHelpTooltip({
  label,
  description,
  example,
  required = false,
  tip,
  position = 'right',
  className = ''
}) {
  return (
    <GuidedTooltip
      title={label}
      whyItMatters={description}
      examples={example ? [example] : []}
      variant={tip ? 'tip' : 'default'}
      position={position}
      trigger="hover"
      className={className}
    >
      <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-help" />
    </GuidedTooltip>
  )
}

// ============================================
// Requirement Tooltip
// ============================================

/**
 * Tooltip for CAR 922 requirement explanations
 */
export function RequirementTooltip({
  requirementId,
  text,
  plainLanguage,
  complianceTips = [],
  relatedSections = [],
  position = 'right',
  className = ''
}) {
  const steps = [
    {
      title: 'Requirement Text',
      content: text
    },
    {
      title: 'Plain Language',
      content: plainLanguage
    }
  ]

  if (complianceTips.length > 0) {
    steps.push({
      title: 'Compliance Tips',
      content: (
        <ul className="list-disc ml-4 space-y-1">
          {complianceTips.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      )
    })
  }

  return (
    <GuidedTooltip
      title={`CAR ${requirementId}`}
      steps={steps}
      variant="info"
      position={position}
      trigger="click"
      className={className}
    >
      <button className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
        <BookOpen className="w-3 h-3" />
        {requirementId}
      </button>
    </GuidedTooltip>
  )
}

// ============================================
// RPAS Context Tooltip
// ============================================

/**
 * Tooltip that adapts content based on RPAS type
 */
export function RPASContextTooltip({
  children,
  title,
  commercialContent,
  customContent,
  isCustomBuild = false,
  position = 'right',
  className = ''
}) {
  return (
    <GuidedTooltip
      title={title}
      steps={[
        {
          title: isCustomBuild ? 'For Custom Builds' : 'For Commercial RPAS',
          content: isCustomBuild ? customContent : commercialContent
        }
      ]}
      variant="tip"
      position={position}
      trigger="hover"
      className={className}
    >
      {children}
    </GuidedTooltip>
  )
}

// ============================================
// Progress Step Tooltip
// ============================================

/**
 * Tooltip for workflow step explanations
 */
export function ProgressStepTooltip({
  stepNumber,
  stepTitle,
  description,
  estimatedTime,
  prerequisites = [],
  outcomes = [],
  position = 'bottom',
  className = ''
}) {
  return (
    <GuidedTooltip
      title={`Step ${stepNumber}: ${stepTitle}`}
      steps={[
        {
          title: 'Overview',
          content: (
            <div className="space-y-2">
              <p>{description}</p>
              {estimatedTime && (
                <p className="text-xs text-gray-500">
                  Estimated time: {estimatedTime}
                </p>
              )}
            </div>
          )
        },
        ...(prerequisites.length > 0 ? [{
          title: 'Prerequisites',
          content: (
            <ul className="space-y-1">
              {prerequisites.map((prereq, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{prereq}</span>
                </li>
              ))}
            </ul>
          )
        }] : []),
        ...(outcomes.length > 0 ? [{
          title: 'What You\'ll Accomplish',
          content: (
            <ul className="space-y-1">
              {outcomes.map((outcome, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          )
        }] : [])
      ]}
      variant="default"
      position={position}
      trigger="hover"
      className={className}
    >
      <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
    </GuidedTooltip>
  )
}

// ============================================
// Warning Tooltip
// ============================================

/**
 * Tooltip for displaying warnings and cautions
 */
export function WarningTooltip({
  children,
  title,
  message,
  consequences = [],
  recommendations = [],
  position = 'top',
  className = ''
}) {
  const steps = [
    {
      title: 'Warning',
      content: message
    }
  ]

  if (consequences.length > 0) {
    steps.push({
      title: 'Potential Consequences',
      content: (
        <ul className="list-disc ml-4 space-y-1 text-amber-700">
          {consequences.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )
    })
  }

  if (recommendations.length > 0) {
    steps.push({
      title: 'Recommendations',
      content: (
        <ul className="space-y-1">
          {recommendations.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )
    })
  }

  return (
    <GuidedTooltip
      title={title}
      steps={steps}
      variant="warning"
      position={position}
      trigger="click"
      className={className}
    >
      {children || (
        <AlertTriangle className="w-4 h-4 text-amber-500 cursor-help" />
      )}
    </GuidedTooltip>
  )
}

// ============================================
// Inline Definition
// ============================================

/**
 * Inline term with hover definition
 */
export function InlineDefinition({
  term,
  definition,
  abbreviation,
  className = ''
}) {
  return (
    <GuidedTooltip
      title={abbreviation ? `${term} (${abbreviation})` : term}
      whyItMatters={definition}
      variant="default"
      position="top"
      trigger="hover"
      className={className}
    >
      <span className="border-b border-dotted border-gray-400 cursor-help">
        {abbreviation || term}
      </span>
    </GuidedTooltip>
  )
}

// ============================================
// Export All
// ============================================

export default {
  GuidedTooltip,
  FieldHelpTooltip,
  RequirementTooltip,
  RPASContextTooltip,
  ProgressStepTooltip,
  WarningTooltip,
  InlineDefinition
}
