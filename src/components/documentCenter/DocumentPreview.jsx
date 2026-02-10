/**
 * Document Preview Component
 * Live preview of the document being configured
 *
 * @location src/components/documentCenter/DocumentPreview.jsx
 */

import { useState, useMemo } from 'react'
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles
} from 'lucide-react'
import { getDocumentColorClasses } from '../../lib/documentTypes'

export default function DocumentPreview({
  project,
  documentType,
  selectedSections,
  sectionOrder,
  aiEnabled,
  aiTone,
  selectedSite,
  branding,
  getEnhanced
}) {
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(100)

  // Get sites for multi-site projects
  const sites = useMemo(() => {
    if (!project?.sites) return []
    if (selectedSite) {
      return project.sites.filter(s => s.id === selectedSite)
    }
    return project.sites
  }, [project?.sites, selectedSite])

  // Get document colors
  const colors = getDocumentColorClasses(documentType?.id)

  // Get AI enhanced content if available
  const enhancedContent = useMemo(() => {
    if (!aiEnabled || !getEnhanced) return null
    const exportType = documentType?.exportType || documentType?.id
    return getEnhanced(exportType)
  }, [aiEnabled, getEnhanced, documentType])

  // Generate preview content based on selected sections
  const previewContent = useMemo(() => {
    if (!project || !documentType) return []

    const orderedSections = sectionOrder
      .filter(id => selectedSections.includes(id))
      .map(id => documentType.sections.find(s => s.id === id))
      .filter(Boolean)

    return orderedSections.map(section => {
      let content = generateSectionPreview(section, project, sites, enhancedContent, branding)
      return {
        id: section.id,
        label: section.label,
        content
      }
    })
  }, [project, documentType, selectedSections, sectionOrder, sites, enhancedContent, branding])

  // Estimated page count (rough estimate)
  const totalPages = Math.max(1, Math.ceil(previewContent.length / 3))

  // Handle zoom
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50))

  return (
    <div className="card h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-500" />
          Preview
        </h3>
        <div className="flex items-center gap-2">
          {/* AI indicator */}
          {aiEnabled && (
            <span className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
              <Sparkles className="w-3 h-3" />
              AI Enhanced
            </span>
          )}

          {/* Zoom controls */}
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:bg-gray-100 rounded"
              disabled={zoom <= 50}
            >
              <ZoomOut className="w-4 h-4 text-gray-500" />
            </button>
            <span className="text-xs text-gray-500 min-w-[3rem] text-center">
              {zoom}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:bg-gray-100 rounded"
              disabled={zoom >= 200}
            >
              <ZoomIn className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 bg-gray-100 rounded-lg p-4 overflow-auto">
        <div
          className="bg-white shadow-lg mx-auto transition-transform origin-top"
          style={{
            width: `${Math.min(600 * (zoom / 100), 800)}px`,
            minHeight: '600px',
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center'
          }}
        >
          {/* Document header/cover */}
          <div className={`p-6 ${colors.bg} border-b`}>
            {/* Branding */}
            <div className="flex items-center justify-between mb-6">
              {branding?.operator?.logo ? (
                <img
                  src={branding.operator.logo}
                  alt={branding.operator.name}
                  className="h-10 w-auto"
                />
              ) : (
                <div className="h-10 w-24 bg-gray-300 rounded flex items-center justify-center text-xs text-gray-500">
                  Logo
                </div>
              )}
              <span className="text-xs text-gray-500">
                {new Date().toLocaleDateString()}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-xl font-bold text-gray-900">
              {documentType?.label}
            </h1>
            <p className="text-gray-600 mt-1">{project?.name || 'Project Name'}</p>
            {project?.clientName && (
              <p className="text-sm text-gray-500 mt-1">
                Prepared for: {project.clientName}
              </p>
            )}

            {/* Multi-site indicator */}
            {sites.length > 1 && (
              <p className="text-sm text-gray-500 mt-2">
                {sites.length} sites included
              </p>
            )}
          </div>

          {/* Document content */}
          <div className="p-6 space-y-6">
            {previewContent.map((section, index) => (
              <div key={section.id} className="border-b border-gray-100 pb-4 last:border-0">
                <h2 className={`text-sm font-semibold ${colors.text} mb-2`}>
                  {index + 1}. {section.label}
                </h2>
                <div className="text-sm text-gray-600 whitespace-pre-line">
                  {section.content}
                </div>
              </div>
            ))}

            {previewContent.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Select sections to see preview</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Page navigation */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage <= 1}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronLeft className="w-5 h-5 text-gray-500" />
        </button>
        <span className="text-sm text-gray-500">
          Page {currentPage} of ~{totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage >= totalPages}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronRight className="w-5 h-5 text-gray-500" />
        </button>
      </div>
    </div>
  )
}

// Helper function to generate section preview content
function generateSectionPreview(section, project, sites, enhancedContent, branding) {
  const sectionId = section.id

  // Check for AI enhanced content first
  if (enhancedContent) {
    const enhancedKey = getEnhancedKeyForSection(sectionId)
    if (enhancedContent[enhancedKey]) {
      return enhancedContent[enhancedKey]
    }
  }

  // Generate programmatic preview based on section type
  switch (sectionId) {
    case 'header':
    case 'coverPage':
      return `${branding?.operator?.name || 'Operator Name'}
Reference: ${project?.projectCode || 'PRJ-XXXX'}
Date: ${new Date().toLocaleDateString()}`

    case 'executiveSummary':
      return `This document outlines the ${project?.name || 'project'} for ${project?.clientName || 'the client'}.
${project?.description || 'Project description will appear here.'}`

    case 'companyOverview':
      return `${branding?.operator?.name || 'Our company'} provides professional drone services with ${project?.crew?.length || 0} qualified personnel.`

    case 'scope':
      if (project?.needsAnalysis?.requirements) {
        return project.needsAnalysis.requirements
      }
      return 'Scope of work details will be populated from project requirements.'

    case 'deliverables':
      if (project?.needsAnalysis?.deliverables?.length > 0) {
        return project.needsAnalysis.deliverables.map((d, i) => `${i + 1}. ${d}`).join('\n')
      }
      return '1. Final deliverables\n2. Documentation\n3. Flight logs'

    case 'pricing':
      if (project?.estimatedCost) {
        return `Total: $${project.estimatedCost.toLocaleString()}`
      }
      return 'Pricing to be confirmed based on final requirements.'

    case 'timeline':
      return `Start: ${project?.startDate || 'TBD'}
End: ${project?.endDate || 'TBD'}`

    case 'crew':
      if (project?.crew?.length > 0) {
        return project.crew.map(c => `${c.role || 'Crew'}: ${c.name || 'TBD'}`).join('\n')
      }
      return 'Crew assignments pending.'

    case 'aircraft':
      const aircraft = project?.aircraft || project?.flightPlan?.aircraft || []
      if (aircraft.length > 0) {
        return aircraft.map(a => `${a.nickname || a.registration || 'Aircraft'}: ${a.make || ''} ${a.model || ''}`).join('\n')
      }
      return 'Aircraft details pending.'

    case 'siteSurvey':
    case 'siteOverview':
    case 'location':
      if (sites.length > 0) {
        return sites.map((s, i) => `Site ${i + 1}: ${s.name || 'Unnamed'} - ${s.siteSurvey?.location || 'Location TBD'}`).join('\n')
      }
      if (project?.siteSurvey) {
        return `Location: ${project.siteSurvey.location || project.siteSurvey.general?.siteName || 'TBD'}`
      }
      return 'Site survey data pending.'

    case 'flightPlan':
    case 'flightArea':
    case 'procedures':
      if (project?.flightPlan) {
        return `Operation Type: ${project.flightPlan.operationType || 'VLOS'}
Max Altitude: ${project.flightPlan.maxAltitude || project.flightPlan.maxAltitudeAGL || 'TBD'}m AGL`
      }
      return 'Flight plan details pending.'

    case 'riskAssessment':
    case 'hazardRegister':
      if (project?.hseRiskAssessment?.hazards?.length > 0) {
        return project.hseRiskAssessment.hazards
          .slice(0, 3)
          .map((h, i) => `${i + 1}. ${h.description || 'Hazard'} - Risk: ${h.riskLevel || 'TBD'}`)
          .join('\n')
      }
      return 'Risk assessment data pending.'

    case 'groundRisk':
      if (project?.soraAssessment) {
        return `Population Category: ${project.soraAssessment.populationCategory || 'TBD'}
Intrinsic GRC: ${project.soraAssessment.intrinsicGRC || 'TBD'}
Final GRC: ${project.soraAssessment.finalGRC || 'TBD'}`
      }
      return 'Ground risk assessment pending.'

    case 'airRisk':
      if (project?.soraAssessment) {
        return `Initial ARC: ${project.soraAssessment.initialARC || 'TBD'}
Residual ARC: ${project.soraAssessment.residualARC || 'TBD'}`
      }
      return 'Air risk assessment pending.'

    case 'sailDetermination':
      if (project?.soraAssessment) {
        return `SAIL Level: ${project.soraAssessment.sail || 'TBD'}`
      }
      return 'SAIL determination pending.'

    case 'emergency':
      if (project?.emergencyPlan) {
        return `Emergency Contact: ${project.emergencyPlan.primaryEmergencyContact?.name || 'TBD'}
Hospital: ${project.emergencyPlan.nearestHospital || 'TBD'}`
      }
      return 'Emergency plan pending.'

    case 'communications':
      if (project?.communications) {
        return `Primary Channel: ${project.communications.primaryChannel || 'TBD'}
Backup: ${project.communications.backupChannel || 'TBD'}`
      }
      return 'Communications plan pending.'

    case 'ppe':
      if (project?.ppe?.required?.length > 0) {
        return project.ppe.required.join('\n')
      }
      return 'Standard PPE requirements apply.'

    case 'terms':
      return `1. Quote valid for 30 days
2. 50% deposit required
3. Subject to weather conditions
4. All operations comply with regulations`

    case 'validity':
      return `This quote is valid for 30 days from ${new Date().toLocaleDateString()}.`

    case 'attendees':
      if (project?.crew?.length > 0) {
        return project.crew.map(c => c.name || 'TBD').join(', ')
      }
      return 'Attendees to be confirmed.'

    case 'safetyItems':
    case 'hazards':
      return 'Site-specific hazards will be briefed.'

    case 'signatures':
    case 'signoff':
    case 'approvals':
      return 'Signature: _____________________\nDate: _____________________'

    default:
      return `${section.label} content will appear here.`
  }
}

// Map section IDs to enhanced content keys
function getEnhancedKeyForSection(sectionId) {
  const mapping = {
    executiveSummary: 'executiveSummary',
    companyOverview: 'companyValue',
    scope: 'scopeSummary',
    methodology: 'methodologyNarrative',
    safety: 'safetyCommitment',
    pricing: 'pricingIntro',
    riskAssessment: 'riskNarrative',
    hazardRegister: 'hazardDescriptions',
    recommendations: 'recommendations',
    emergency: 'emergencyProcedures',
    mission: 'missionDescription',
    briefingIntro: 'briefingIntro'
  }
  return mapping[sectionId] || sectionId
}
