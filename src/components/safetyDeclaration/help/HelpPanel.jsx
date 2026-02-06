/**
 * Help Panel Component
 * Expandable contextual help for Safety Declaration features
 *
 * @location src/components/safetyDeclaration/help/HelpPanel.jsx
 */

import React, { useState } from 'react'
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  ExternalLink,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Info,
  FileText,
  Link2,
  X
} from 'lucide-react'

// ============================================
// Help Panel Component
// ============================================

/**
 * Expandable help panel with contextual information
 */
export function HelpPanel({
  title,
  children,
  variant = 'default', // default, tip, warning, info
  defaultExpanded = false,
  className = ''
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const variantStyles = {
    default: {
      container: 'bg-gray-50 border-gray-200',
      header: 'text-gray-700 hover:bg-gray-100',
      icon: HelpCircle,
      iconColor: 'text-gray-500'
    },
    tip: {
      container: 'bg-blue-50 border-blue-200',
      header: 'text-blue-700 hover:bg-blue-100',
      icon: Lightbulb,
      iconColor: 'text-blue-500'
    },
    warning: {
      container: 'bg-amber-50 border-amber-200',
      header: 'text-amber-700 hover:bg-amber-100',
      icon: AlertTriangle,
      iconColor: 'text-amber-500'
    },
    info: {
      container: 'bg-indigo-50 border-indigo-200',
      header: 'text-indigo-700 hover:bg-indigo-100',
      icon: Info,
      iconColor: 'text-indigo-500'
    }
  }

  const styles = variantStyles[variant] || variantStyles.default
  const Icon = styles.icon

  return (
    <div className={`rounded-lg border ${styles.container} ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${styles.header}`}
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${styles.iconColor}`} />
          <span className="text-sm font-medium">{title}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {isExpanded && (
        <div className="px-3 pb-3">
          <div className="pt-2 border-t border-gray-200">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// Learn More Panel
// ============================================

/**
 * Learn more section with regulatory references
 */
export function LearnMorePanel({
  concept,
  explanation,
  regulatoryRef,
  relatedSections = [],
  className = ''
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className={`rounded-lg border border-indigo-200 bg-indigo-50 ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-500" />
          <span className="text-sm font-medium">Learn More: {concept}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 space-y-3">
          <div className="pt-2 border-t border-indigo-200">
            <p className="text-sm text-gray-700">{explanation}</p>
          </div>

          {regulatoryRef && (
            <div className="flex items-start gap-2 p-2 bg-white rounded border border-indigo-100">
              <FileText className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-indigo-700">Regulatory Reference</p>
                <p className="text-xs text-gray-600">{regulatoryRef}</p>
              </div>
            </div>
          )}

          {relatedSections.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-indigo-700 flex items-center gap-1">
                <Link2 className="w-3 h-3" />
                Related Sections
              </p>
              <div className="flex flex-wrap gap-1">
                {relatedSections.map((section, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded"
                  >
                    {section}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// Quick Reference Card
// ============================================

/**
 * Quick reference card for key information
 */
export function QuickReferenceCard({
  title,
  items,
  variant = 'default',
  className = ''
}) {
  const variantStyles = {
    default: 'bg-gray-50 border-gray-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-amber-50 border-amber-200',
    info: 'bg-blue-50 border-blue-200'
  }

  const checkColors = {
    default: 'text-gray-500',
    success: 'text-green-500',
    warning: 'text-amber-500',
    info: 'text-blue-500'
  }

  return (
    <div className={`rounded-lg border p-3 ${variantStyles[variant]} ${className}`}>
      <h4 className="text-sm font-medium text-gray-800 mb-2">{title}</h4>
      <ul className="space-y-1.5">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
            <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${checkColors[variant]}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ============================================
// Floating Help Button
// ============================================

/**
 * Floating help button with slide-out panel
 */
export function FloatingHelpButton({
  content,
  title = 'Help',
  position = 'bottom-right' // bottom-right, bottom-left, top-right, top-left
}) {
  const [isOpen, setIsOpen] = useState(false)

  const positionStyles = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  }

  const panelPositionStyles = {
    'bottom-right': 'bottom-16 right-4',
    'bottom-left': 'bottom-16 left-4',
    'top-right': 'top-16 right-4',
    'top-left': 'top-16 left-4'
  }

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed ${positionStyles[position]} z-40 w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all`}
        title={title}
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <HelpCircle className="w-5 h-5" />
        )}
      </button>

      {/* Help Panel */}
      {isOpen && (
        <div
          className={`fixed ${panelPositionStyles[position]} z-40 w-80 max-h-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden`}
        >
          <div className="p-3 bg-indigo-600 text-white font-medium flex items-center justify-between">
            <span>{title}</span>
            <button onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-3 overflow-y-auto max-h-72">
            {content}
          </div>
        </div>
      )}
    </>
  )
}

// ============================================
// Step Guide Component
// ============================================

/**
 * Step-by-step guide display
 */
export function StepGuide({
  steps,
  currentStep = null,
  showNumbers = true,
  className = ''
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {steps.map((step, index) => {
        const isActive = currentStep === index
        const isCompleted = currentStep !== null && index < currentStep

        return (
          <div
            key={index}
            className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-indigo-50 border border-indigo-200'
                : isCompleted
                  ? 'bg-green-50'
                  : 'bg-gray-50'
            }`}
          >
            {/* Step Number */}
            {showNumbers && (
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
            )}

            {/* Step Content */}
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                isActive ? 'text-indigo-700' : isCompleted ? 'text-green-700' : 'text-gray-700'
              }`}>
                {step.title}
              </p>
              {step.description && (
                <p className="text-xs text-gray-600 mt-0.5">{step.description}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ============================================
// Context Help Sidebar
// ============================================

/**
 * Sidebar with contextual help content
 */
export function ContextHelpSidebar({
  isOpen,
  onClose,
  title,
  children,
  width = 'w-80'
}) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-full ${width} bg-white shadow-xl z-50 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-indigo-600 text-white">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            <h3 className="font-medium">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-indigo-500 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </>
  )
}

// ============================================
// Inline Help Tip
// ============================================

/**
 * Inline help tip that can be dismissed
 */
export function InlineHelpTip({
  message,
  type = 'info', // info, tip, warning
  dismissible = true,
  onDismiss,
  className = ''
}) {
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) return null

  const typeStyles = {
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: Info,
      iconColor: 'text-blue-500',
      textColor: 'text-blue-700'
    },
    tip: {
      container: 'bg-amber-50 border-amber-200',
      icon: Lightbulb,
      iconColor: 'text-amber-500',
      textColor: 'text-amber-700'
    },
    warning: {
      container: 'bg-red-50 border-red-200',
      icon: AlertTriangle,
      iconColor: 'text-red-500',
      textColor: 'text-red-700'
    }
  }

  const styles = typeStyles[type]
  const Icon = styles.icon

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()
  }

  return (
    <div className={`flex items-start gap-2 p-2 rounded border ${styles.container} ${className}`}>
      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${styles.iconColor}`} />
      <p className={`text-xs flex-1 ${styles.textColor}`}>{message}</p>
      {dismissible && (
        <button
          onClick={handleDismiss}
          className={`p-0.5 rounded hover:bg-white/50 ${styles.textColor}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}

// ============================================
// What Is This Component
// ============================================

/**
 * "What is this?" explanatory component
 */
export function WhatIsThis({
  term,
  explanation,
  example,
  className = ''
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className={className}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"
      >
        <HelpCircle className="w-3 h-3" />
        <span>What is {term}?</span>
      </button>

      {isExpanded && (
        <div className="mt-2 p-3 bg-indigo-50 rounded-lg border border-indigo-200 text-sm">
          <p className="text-gray-700">{explanation}</p>
          {example && (
            <div className="mt-2 pt-2 border-t border-indigo-200">
              <p className="text-xs font-medium text-indigo-700">Example:</p>
              <p className="text-xs text-gray-600 italic">{example}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// Regulation Reference Badge
// ============================================

/**
 * Badge linking to regulatory reference
 */
export function RegulationBadge({
  section,
  document = 'CAR 922',
  onClick
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-gray-300 transition-colors"
    >
      <FileText className="w-3 h-3" />
      <span>{document} {section}</span>
      <ExternalLink className="w-3 h-3" />
    </button>
  )
}

// ============================================
// Export All
// ============================================

export default {
  HelpPanel,
  LearnMorePanel,
  QuickReferenceCard,
  FloatingHelpButton,
  StepGuide,
  ContextHelpSidebar,
  InlineHelpTip,
  WhatIsThis,
  RegulationBadge
}
