/**
 * Evidence Guide Component
 * Guidance for evidence requirements per CAR 922 requirement
 *
 * @location src/components/safetyDeclaration/EvidenceGuide.jsx
 */

import React, { useState } from 'react'
import {
  FileText,
  FileSpreadsheet,
  Calculator,
  Image,
  Video,
  Factory,
  Award,
  PenTool,
  FileCode,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RefreshCw,
  BookOpen,
  ClipboardCheck,
  Download,
  ExternalLink,
  Star,
  HelpCircle
} from 'lucide-react'
import { HelpPanel } from './help/HelpPanel'

// ============================================
// Evidence Types Definition
// ============================================

export const EVIDENCE_TYPES = {
  test_report: {
    id: 'test_report',
    label: 'Test Report',
    description: 'Results of physical testing and demonstration',
    icon: FileText,
    color: 'bg-blue-100 text-blue-700',
    formats: ['PDF', 'Word', 'Markdown'],
    requiredElements: [
      'Test objectives and acceptance criteria',
      'Test setup and equipment used',
      'Test procedure followed',
      'Results and data collected',
      'Pass/fail determination',
      'Tester signature and date'
    ],
    qualityTips: [
      'Include photos or videos of test setup',
      'Reference calibration records for test equipment',
      'Note environmental conditions during test',
      'Clearly link results to acceptance criteria'
    ]
  },
  analysis_document: {
    id: 'analysis_document',
    label: 'Analysis Document',
    description: 'Engineering calculations, simulations, or assessments',
    icon: Calculator,
    color: 'bg-purple-100 text-purple-700',
    formats: ['PDF', 'Word', 'Excel'],
    requiredElements: [
      'Analysis objectives and scope',
      'Methodology and assumptions',
      'Input data and sources',
      'Calculations or simulation results',
      'Conclusions and recommendations',
      'Analyst signature and date'
    ],
    qualityTips: [
      'Document all assumptions clearly',
      'Reference industry-standard methods',
      'Show sensitivity to key parameters',
      'Include validation against known cases'
    ]
  },
  calculation: {
    id: 'calculation',
    label: 'Calculation',
    description: 'Mathematical calculations with supporting data',
    icon: FileSpreadsheet,
    color: 'bg-green-100 text-green-700',
    formats: ['Excel', 'PDF', 'Mathcad'],
    requiredElements: [
      'Calculation purpose and scope',
      'Input values with units and sources',
      'Formulas used with references',
      'Step-by-step calculation',
      'Final result with units',
      'Checker signature (if required)'
    ],
    qualityTips: [
      'Show intermediate steps',
      'Use consistent units throughout',
      'Reference source of formulas',
      'Include hand calculations for critical values'
    ]
  },
  photo: {
    id: 'photo',
    label: 'Photograph',
    description: 'Visual evidence of configuration or condition',
    icon: Image,
    color: 'bg-yellow-100 text-yellow-700',
    formats: ['JPG', 'PNG', 'HEIC'],
    requiredElements: [
      'Clear, well-lit image',
      'Subject clearly visible',
      'Date and location documented',
      'Caption explaining relevance',
      'Scale reference if applicable'
    ],
    qualityTips: [
      'Use high resolution images',
      'Include context in the shot',
      'Add annotations if helpful',
      'Take multiple angles for complex subjects'
    ]
  },
  video: {
    id: 'video',
    label: 'Video',
    description: 'Video recording of test or demonstration',
    icon: Video,
    color: 'bg-red-100 text-red-700',
    formats: ['MP4', 'MOV', 'AVI'],
    requiredElements: [
      'Clear audio and video quality',
      'Narration or timestamps',
      'Full test procedure captured',
      'Date and conditions documented'
    ],
    qualityTips: [
      'Use stable mounting or tripod',
      'Include telemetry overlay if possible',
      'Edit with clear chapter markers',
      'Keep file sizes reasonable'
    ]
  },
  manufacturer_data: {
    id: 'manufacturer_data',
    label: 'Manufacturer Data',
    description: 'Specifications, datasheets, or certificates from OEM',
    icon: Factory,
    color: 'bg-gray-100 text-gray-700',
    formats: ['PDF', 'Web link'],
    requiredElements: [
      'Official manufacturer document',
      'Part/model numbers match equipment',
      'Relevant specifications highlighted',
      'Document date and revision'
    ],
    qualityTips: [
      'Use official sources, not third-party copies',
      'Highlight specific relevant sections',
      'Verify document is current revision',
      'Include compliance declarations if available'
    ]
  },
  certification: {
    id: 'certification',
    label: 'Certification/Certificate',
    description: 'Third-party certifications or regulatory approvals',
    icon: Award,
    color: 'bg-amber-100 text-amber-700',
    formats: ['PDF'],
    requiredElements: [
      'Issuing authority clearly identified',
      'Certificate number and validity',
      'Scope of certification',
      'Expiration date (if applicable)'
    ],
    qualityTips: [
      'Verify certificate is still valid',
      'Ensure scope covers your application',
      'Include contact for verification',
      'Note any conditions or limitations'
    ]
  },
  drawing: {
    id: 'drawing',
    label: 'Drawing/Diagram',
    description: 'Technical drawings, schematics, or diagrams',
    icon: PenTool,
    color: 'bg-indigo-100 text-indigo-700',
    formats: ['PDF', 'DWG', 'SVG'],
    requiredElements: [
      'Clear title and revision',
      'Scale and dimensions',
      'Legend for symbols',
      'Approval signatures'
    ],
    qualityTips: [
      'Use standard drawing conventions',
      'Include revision history',
      'Ensure text is legible at printed size',
      'Reference related drawings'
    ]
  },
  log_file: {
    id: 'log_file',
    label: 'Log File/Data',
    description: 'Flight logs, telemetry data, or system logs',
    icon: FileCode,
    color: 'bg-cyan-100 text-cyan-700',
    formats: ['CSV', 'JSON', 'BIN'],
    requiredElements: [
      'Date and time of recording',
      'Aircraft/system identification',
      'Relevant parameters captured',
      'Interpretation of key events'
    ],
    qualityTips: [
      'Include log analysis summary',
      'Convert to readable format if needed',
      'Highlight key data points',
      'Correlate with test procedure'
    ]
  }
}

// ============================================
// Requirement Evidence Guide
// ============================================

export const REQUIREMENT_EVIDENCE_MAP = {
  '922.04.1': {
    title: 'Lateral Position Accuracy',
    requiredEvidence: ['manufacturer_data', 'test_report'],
    optionalEvidence: ['log_file', 'calculation'],
    guidance: 'GPS/GNSS receiver specifications typically suffice. Flight test data comparing actual vs reported position strengthens the case.',
    examples: [
      'GPS module datasheet showing horizontal accuracy specification',
      'Position accuracy test report with reference points',
      'Flight log analysis showing position data'
    ]
  },
  '922.04.2': {
    title: 'Vertical Position Accuracy',
    requiredEvidence: ['manufacturer_data', 'test_report'],
    optionalEvidence: ['log_file', 'calculation'],
    guidance: 'Document both barometric and GPS altitude accuracy. Include calibration procedures.',
    examples: [
      'Altimeter specification sheet',
      'Altitude accuracy test at known references',
      'Calibration procedure documentation'
    ]
  },
  '922.05.1': {
    title: 'Single Failure Analysis',
    requiredEvidence: ['analysis_document'],
    optionalEvidence: ['test_report', 'drawing', 'manufacturer_data'],
    guidance: 'FMEA or similar systematic analysis is essential. Document all identified failure modes and their effects.',
    examples: [
      'Failure Mode and Effects Analysis (FMEA) document',
      'Single-point failure summary table',
      'Mitigation system test report'
    ]
  },
  '922.06.1': {
    title: 'Combined Failure Probability',
    requiredEvidence: ['analysis_document', 'calculation'],
    optionalEvidence: ['test_report', 'manufacturer_data'],
    guidance: 'Formal safety assessment required. Fault Tree Analysis recommended for quantitative probability.',
    examples: [
      'Fault Tree Analysis with probability calculations',
      'System Safety Assessment summary',
      'Component reliability data sources'
    ]
  },
  '922.07.1': {
    title: 'Reliability Demonstration',
    requiredEvidence: ['calculation', 'analysis_document'],
    optionalEvidence: ['test_report', 'manufacturer_data', 'log_file'],
    guidance: 'Show how reliability targets are met through component data, analysis, or service experience.',
    examples: [
      'Reliability target calculation worksheet',
      'Component MTBF data compilation',
      'Service experience data analysis'
    ]
  },
  '922.08.1': {
    title: 'Geofence Containment',
    requiredEvidence: ['test_report', 'manufacturer_data'],
    optionalEvidence: ['video', 'log_file', 'photo'],
    guidance: 'Flight test at geofence boundaries essential. Document response time and behavior.',
    examples: [
      'Geofence boundary test report',
      'Lost-link containment test video',
      'Geofence configuration documentation'
    ]
  },
  '922.09.1': {
    title: 'C2 Link Reliability',
    requiredEvidence: ['manufacturer_data', 'test_report'],
    optionalEvidence: ['calculation', 'log_file'],
    guidance: 'Document link specifications, test range capability, and lost-link behavior.',
    examples: [
      'C2 link system specifications',
      'Range and reliability test results',
      'Lost-link behavior demonstration'
    ]
  },
  '922.11.1': {
    title: 'Human Factors Assessment',
    requiredEvidence: ['analysis_document'],
    optionalEvidence: ['test_report', 'photo', 'video'],
    guidance: 'Task analysis and workload assessment. Consider using Bedford or Cooper-Harper scales.',
    examples: [
      'Task analysis document',
      'Workload rating assessment',
      'Control station design description'
    ]
  },
  '922.12.1': {
    title: 'Environmental Envelope',
    requiredEvidence: ['test_report'],
    optionalEvidence: ['log_file', 'video', 'manufacturer_data'],
    guidance: 'Flight test at or near declared environmental limits. Document conditions precisely.',
    examples: [
      'Temperature envelope test report',
      'Wind limit validation test',
      'Flight logs at boundary conditions'
    ]
  }
}

// ============================================
// Main Evidence Guide Component
// ============================================

export function EvidenceGuide({
  requirementId,
  requirementText,
  currentEvidence = [],
  onAIReview,
  className = ''
}) {
  const [expandedType, setExpandedType] = useState(null)
  const [isReviewing, setIsReviewing] = useState(false)
  const [reviewResult, setReviewResult] = useState(null)
  const [evidenceDescription, setEvidenceDescription] = useState('')

  // Get requirement-specific guidance
  const reqGuidance = REQUIREMENT_EVIDENCE_MAP[requirementId] || {}
  const requiredTypes = reqGuidance.requiredEvidence || []
  const optionalTypes = reqGuidance.optionalEvidence || []

  // Check which evidence types are covered
  const coveredTypes = currentEvidence.map(e => e.type)
  const missingRequired = requiredTypes.filter(t => !coveredTypes.includes(t))
  const hasAllRequired = missingRequired.length === 0

  // Handle AI Review
  const handleAIReview = async () => {
    if (!onAIReview || !evidenceDescription) return

    setIsReviewing(true)
    setReviewResult(null)

    try {
      const result = await onAIReview({
        requirementId,
        requirementText,
        evidenceDescription,
        coveredTypes
      })
      setReviewResult(result)
    } catch (error) {
      setReviewResult({ success: false, error: error.message })
    } finally {
      setIsReviewing(false)
    }
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <ClipboardCheck className="w-5 h-5 text-indigo-600" />
          <h3 className="font-medium text-gray-900">Evidence Requirements</h3>
        </div>
        {requirementId && (
          <p className="text-sm text-gray-600">For CAR {requirementId}</p>
        )}
      </div>

      {/* Requirement-Specific Guidance */}
      {reqGuidance.guidance && (
        <div className="p-4 border-b border-gray-100 bg-blue-50">
          <p className="text-sm text-blue-800">{reqGuidance.guidance}</p>
        </div>
      )}

      {/* Coverage Status */}
      <div className="p-4 border-b border-gray-100">
        <div className={`p-3 rounded-lg ${
          hasAllRequired
            ? 'bg-green-50 border border-green-200'
            : 'bg-amber-50 border border-amber-200'
        }`}>
          <div className="flex items-start gap-2">
            {hasAllRequired ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            )}
            <div>
              <p className={`font-medium ${hasAllRequired ? 'text-green-700' : 'text-amber-700'}`}>
                {hasAllRequired
                  ? 'Required evidence types covered'
                  : `Missing ${missingRequired.length} required evidence type${missingRequired.length > 1 ? 's' : ''}`}
              </p>
              {!hasAllRequired && (
                <p className="text-sm text-amber-600 mt-1">
                  Missing: {missingRequired.map(t => EVIDENCE_TYPES[t]?.label).join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Evidence Types */}
      <div className="divide-y divide-gray-100">
        {/* Required Evidence */}
        {requiredTypes.length > 0 && (
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              Required Evidence
            </h4>
            <div className="space-y-2">
              {requiredTypes.map(typeId => (
                <EvidenceTypeCard
                  key={typeId}
                  typeId={typeId}
                  isCovered={coveredTypes.includes(typeId)}
                  isExpanded={expandedType === typeId}
                  onToggle={() => setExpandedType(expandedType === typeId ? null : typeId)}
                  required
                />
              ))}
            </div>
          </div>
        )}

        {/* Optional Evidence */}
        {optionalTypes.length > 0 && (
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-500" />
              Recommended Evidence
            </h4>
            <div className="space-y-2">
              {optionalTypes.map(typeId => (
                <EvidenceTypeCard
                  key={typeId}
                  typeId={typeId}
                  isCovered={coveredTypes.includes(typeId)}
                  isExpanded={expandedType === typeId}
                  onToggle={() => setExpandedType(expandedType === typeId ? null : typeId)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Example Evidence */}
      {reqGuidance.examples && (
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Example Evidence for This Requirement
          </h4>
          <ul className="space-y-1">
            {reqGuidance.examples.map((example, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                {example}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* AI Review Section */}
      {onAIReview && (
        <div className="p-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            AI Evidence Review
          </h4>

          <textarea
            value={evidenceDescription}
            onChange={(e) => setEvidenceDescription(e.target.value)}
            placeholder="Describe your evidence and how it addresses this requirement..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm mb-3"
          />

          <button
            onClick={handleAIReview}
            disabled={isReviewing || !evidenceDescription.trim()}
            className="w-full flex items-center justify-center gap-2 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isReviewing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Review Evidence
              </>
            )}
          </button>

          {reviewResult && (
            <div className={`mt-3 p-3 rounded-lg ${
              reviewResult.success
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              {reviewResult.success ? (
                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  {reviewResult.analysis}
                </div>
              ) : (
                <p className="text-sm text-red-700">{reviewResult.error}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// Evidence Type Card
// ============================================

function EvidenceTypeCard({
  typeId,
  isCovered,
  isExpanded,
  onToggle,
  required = false
}) {
  const typeInfo = EVIDENCE_TYPES[typeId]
  if (!typeInfo) return null

  const Icon = typeInfo.icon

  return (
    <div className={`rounded-lg border ${isCovered ? 'border-green-200' : 'border-gray-200'}`}>
      <button
        onClick={onToggle}
        className="w-full p-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${typeInfo.color}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900">{typeInfo.label}</p>
              {isCovered && (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              )}
              {required && !isCovered && (
                <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded">Required</span>
              )}
            </div>
            <p className="text-xs text-gray-500">{typeInfo.description}</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 space-y-3">
          {/* Formats */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Accepted Formats</p>
            <div className="flex flex-wrap gap-1">
              {typeInfo.formats.map((format, i) => (
                <span key={i} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                  {format}
                </span>
              ))}
            </div>
          </div>

          {/* Required Elements */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Must Include</p>
            <ul className="space-y-1">
              {typeInfo.requiredElements.map((element, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                  <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                  {element}
                </li>
              ))}
            </ul>
          </div>

          {/* Quality Tips */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Quality Tips</p>
            <ul className="space-y-1">
              {typeInfo.qualityTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                  <Star className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// Evidence Checklist Summary
// ============================================

export function EvidenceChecklist({
  requirements = [],
  evidenceByRequirement = {},
  className = ''
}) {
  const summary = requirements.map(req => {
    const reqGuidance = REQUIREMENT_EVIDENCE_MAP[req.requirementId] || {}
    const currentEvidence = evidenceByRequirement[req.id] || []
    const coveredTypes = currentEvidence.map(e => e.type)
    const requiredTypes = reqGuidance.requiredEvidence || []
    const missingRequired = requiredTypes.filter(t => !coveredTypes.includes(t))

    return {
      ...req,
      hasAllRequired: missingRequired.length === 0,
      missingCount: missingRequired.length,
      totalRequired: requiredTypes.length,
      coveredCount: requiredTypes.filter(t => coveredTypes.includes(t)).length
    }
  })

  const completeCount = summary.filter(r => r.hasAllRequired).length
  const totalCount = summary.length
  const overallProgress = totalCount > 0 ? Math.round((completeCount / totalCount) * 100) : 0

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-900">Evidence Coverage</h3>
          <span className={`text-sm font-medium ${
            overallProgress === 100 ? 'text-green-600' : 'text-amber-600'
          }`}>
            {completeCount}/{totalCount} Complete
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              overallProgress === 100 ? 'bg-green-500' : 'bg-amber-500'
            }`}
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {summary.map((req) => (
          <div key={req.id} className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {req.hasAllRequired ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500" />
              )}
              <span className="text-sm font-medium text-gray-900">{req.requirementId}</span>
            </div>
            <span className={`text-xs ${
              req.hasAllRequired ? 'text-green-600' : 'text-amber-600'
            }`}>
              {req.coveredCount}/{req.totalRequired}
            </span>
          </div>
        ))}

        {summary.length === 0 && (
          <div className="p-6 text-center text-gray-500 text-sm">
            No requirements to display
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// Export All
// ============================================

export default EvidenceGuide
