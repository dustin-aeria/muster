/**
 * Document Center Component
 * Unified document generation hub replacing Proposal and Export tabs
 *
 * @location src/components/documentCenter/DocumentCenter.jsx
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Files,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Loader2,
  Check
} from 'lucide-react'
import DocumentTypeSelector from './DocumentTypeSelector'
import DocumentConfigurator from './DocumentConfigurator'
import DocumentPreview from './DocumentPreview'
import AIEnhancementControls from './AIEnhancementControls'
import ExportActions from './ExportActions'
import { getDocumentType, getDefaultSections, AI_TONES } from '../../lib/documentTypes'
import { useExportEnhancement } from '../../hooks/useExportEnhancement'
import { useBranding } from '../BrandingSettings'
import { logger } from '../../lib/logger'

// Steps in the document workflow
const STEPS = [
  { id: 'type', label: 'Choose Type', number: 1 },
  { id: 'configure', label: 'Configure', number: 2 },
  { id: 'preview', label: 'Preview & Export', number: 3 }
]

export default function DocumentCenter({ project }) {
  // Current step state
  const [currentStep, setCurrentStep] = useState('type')

  // Document configuration state
  const [selectedDocType, setSelectedDocType] = useState(null)
  const [selectedSections, setSelectedSections] = useState([])
  const [sectionOrder, setSectionOrder] = useState([])

  // AI Enhancement state
  const [aiEnabled, setAiEnabled] = useState(true)
  const [aiTone, setAiTone] = useState('professional')

  // Multi-site state
  const [selectedSite, setSelectedSite] = useState(null) // null = all sites

  // Export state
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(null)

  // Get branding
  const { branding, loading: brandingLoading } = useBranding()

  // AI Enhancement hook
  const {
    enhance,
    isEnhancing,
    enhancingType,
    isCached,
    getCachedAt,
    getEnhanced,
    error: enhancementError,
    clearError
  } = useExportEnhancement(project?.id)

  // Get sites array for multi-site projects
  const sites = useMemo(() => {
    return Array.isArray(project?.sites) ? project.sites : []
  }, [project?.sites])

  const isMultiSite = sites.length > 1

  // Get current document type config
  const documentType = useMemo(() => {
    return selectedDocType ? getDocumentType(selectedDocType) : null
  }, [selectedDocType])

  // Handle document type selection
  const handleDocTypeSelect = useCallback((typeId) => {
    setSelectedDocType(typeId)
    // Initialize sections with defaults
    const defaultSections = getDefaultSections(typeId)
    setSelectedSections(defaultSections)
    setSectionOrder(defaultSections)
    // Auto-advance to configure step
    setCurrentStep('configure')
  }, [])

  // Handle section toggle
  const handleSectionToggle = useCallback((sectionId) => {
    setSelectedSections(prev => {
      if (prev.includes(sectionId)) {
        return prev.filter(id => id !== sectionId)
      } else {
        return [...prev, sectionId]
      }
    })
    // Update order as well
    setSectionOrder(prev => {
      if (prev.includes(sectionId)) {
        return prev.filter(id => id !== sectionId)
      } else {
        return [...prev, sectionId]
      }
    })
  }, [])

  // Handle section reorder
  const handleSectionReorder = useCallback((newOrder) => {
    setSectionOrder(newOrder)
    // Only keep selected sections
    setSelectedSections(prev => newOrder.filter(id => prev.includes(id)))
  }, [])

  // Handle step navigation
  const handleStepChange = useCallback((stepId) => {
    // Validate before moving forward
    if (stepId === 'configure' && !selectedDocType) {
      return
    }
    if (stepId === 'preview' && selectedSections.length === 0) {
      return
    }
    setCurrentStep(stepId)
  }, [selectedDocType, selectedSections])

  // Go back
  const handleBack = useCallback(() => {
    const stepIndex = STEPS.findIndex(s => s.id === currentStep)
    if (stepIndex > 0) {
      setCurrentStep(STEPS[stepIndex - 1].id)
    }
  }, [currentStep])

  // Go forward
  const handleNext = useCallback(() => {
    const stepIndex = STEPS.findIndex(s => s.id === currentStep)
    if (stepIndex < STEPS.length - 1) {
      handleStepChange(STEPS[stepIndex + 1].id)
    }
  }, [currentStep, handleStepChange])

  // Reset to beginning
  const handleReset = useCallback(() => {
    setSelectedDocType(null)
    setSelectedSections([])
    setSectionOrder([])
    setCurrentStep('type')
    setSelectedSite(null)
  }, [])

  // Render step indicator
  const renderStepIndicator = () => {
    const currentIndex = STEPS.findIndex(s => s.id === currentStep)

    return (
      <div className="flex items-center justify-center mb-6">
        {STEPS.map((step, index) => {
          const isComplete = index < currentIndex
          const isCurrent = step.id === currentStep

          return (
            <div key={step.id} className="flex items-center">
              {/* Step circle */}
              <button
                onClick={() => handleStepChange(step.id)}
                disabled={index > currentIndex + 1 || (index > 0 && !selectedDocType)}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm
                  transition-all
                  ${isComplete
                    ? 'bg-green-500 text-white'
                    : isCurrent
                      ? 'bg-aeria-navy text-white ring-4 ring-aeria-navy/20'
                      : 'bg-gray-200 text-gray-500'
                  }
                  ${index <= currentIndex + 1 && selectedDocType ? 'cursor-pointer hover:ring-2 hover:ring-gray-300' : 'cursor-not-allowed'}
                `}
              >
                {isComplete ? <Check className="w-4 h-4" /> : step.number}
              </button>

              {/* Step label */}
              <span className={`
                ml-2 text-sm font-medium hidden sm:inline
                ${isCurrent ? 'text-aeria-navy' : 'text-gray-500'}
              `}>
                {step.label}
              </span>

              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div className={`
                  w-8 sm:w-16 h-0.5 mx-2 sm:mx-4
                  ${index < currentIndex ? 'bg-green-500' : 'bg-gray-200'}
                `} />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-r from-aeria-navy to-aeria-blue p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Files className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Document Center</h2>
              <p className="text-white/70 text-sm">
                Generate professional documents with AI assistance
              </p>
            </div>
          </div>

          {/* Reset button when not on first step */}
          {currentStep !== 'type' && (
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              Start Over
            </button>
          )}
        </div>
      </div>

      {/* Step indicator */}
      {renderStepIndicator()}

      {/* Step content */}
      <div className="min-h-[400px]">
        {/* Step 1: Document Type Selection */}
        {currentStep === 'type' && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Choose Document Type
            </h3>
            <DocumentTypeSelector
              selectedType={selectedDocType}
              onSelect={handleDocTypeSelect}
              project={project}
            />
          </div>
        )}

        {/* Step 2: Configuration */}
        {currentStep === 'configure' && documentType && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left side - Section configuration */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Configure Sections
              </h3>
              <DocumentConfigurator
                documentType={documentType}
                selectedSections={selectedSections}
                sectionOrder={sectionOrder}
                onSectionToggle={handleSectionToggle}
                onSectionReorder={handleSectionReorder}
              />
            </div>

            {/* Right side - Options */}
            <div className="space-y-4">
              {/* AI Enhancement controls */}
              <AIEnhancementControls
                enabled={aiEnabled}
                onEnabledChange={setAiEnabled}
                tone={aiTone}
                onToneChange={setAiTone}
                documentType={documentType}
                projectId={project?.id}
                isCached={isCached}
                getCachedAt={getCachedAt}
                isEnhancing={isEnhancing}
                enhancingType={enhancingType}
                error={enhancementError}
                onClearError={clearError}
              />

              {/* Multi-site selector */}
              {isMultiSite && documentType?.supportsMultiSite && (
                <div className="card">
                  <h4 className="font-medium text-gray-900 mb-3">Site Selection</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="site"
                        checked={selectedSite === null}
                        onChange={() => setSelectedSite(null)}
                        className="w-4 h-4 text-aeria-navy"
                      />
                      <span className="font-medium text-gray-900">All Sites</span>
                      <span className="text-sm text-gray-500">({sites.length} sites)</span>
                    </label>
                    {sites.map((site, index) => (
                      <label
                        key={site.id}
                        className="flex items-center gap-3 p-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="radio"
                          name="site"
                          checked={selectedSite === site.id}
                          onChange={() => setSelectedSite(site.id)}
                          className="w-4 h-4 text-aeria-navy"
                        />
                        <span className="font-medium text-gray-900">
                          {site.name || `Site ${index + 1}`}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={handleBack}
                  className="btn-secondary flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={selectedSections.length === 0}
                  className="btn-primary flex items-center gap-2"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Preview & Export */}
        {currentStep === 'preview' && documentType && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left side - Preview */}
            <div className="lg:col-span-2">
              <DocumentPreview
                project={project}
                documentType={documentType}
                selectedSections={selectedSections}
                sectionOrder={sectionOrder}
                aiEnabled={aiEnabled}
                aiTone={aiTone}
                selectedSite={selectedSite}
                branding={branding}
                getEnhanced={getEnhanced}
              />
            </div>

            {/* Right side - Export actions */}
            <div className="space-y-4">
              <ExportActions
                project={project}
                documentType={documentType}
                selectedSections={selectedSections}
                sectionOrder={sectionOrder}
                aiEnabled={aiEnabled}
                aiTone={aiTone}
                selectedSite={selectedSite}
                branding={branding}
                sites={sites}
                enhance={enhance}
                isEnhancing={isEnhancing}
                getEnhanced={getEnhanced}
                isExporting={isExporting}
                setIsExporting={setIsExporting}
                exportProgress={exportProgress}
                setExportProgress={setExportProgress}
              />

              {/* Navigation */}
              <div className="card">
                <button
                  onClick={handleBack}
                  className="btn-secondary w-full flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to Configuration
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
