/**
 * Document Types Configuration
 * Defines all document types available in the Document Center
 *
 * @location src/lib/documentTypes.js
 */

import {
  DollarSign,
  FileText,
  Shield,
  AlertTriangle,
  MapPin,
  Plane,
  Users,
  ClipboardList,
  FileCheck,
  BarChart
} from 'lucide-react'

// ============================================
// AI TONE OPTIONS
// ============================================

export const AI_TONES = {
  professional: {
    label: 'Professional',
    description: 'Formal, regulatory-appropriate language'
  },
  technical: {
    label: 'Technical',
    description: 'Precise technical terminology'
  },
  friendly: {
    label: 'Friendly',
    description: 'Approachable while remaining professional'
  },
  concise: {
    label: 'Concise',
    description: 'Brief and direct'
  }
}

// ============================================
// DOCUMENT CATEGORIES
// ============================================

export const DOCUMENT_CATEGORIES = {
  client: {
    id: 'client',
    label: 'Client Documents',
    description: 'Documents for client delivery',
    color: 'blue'
  },
  regulatory: {
    id: 'regulatory',
    label: 'Regulatory Documents',
    description: 'Documents for regulatory compliance',
    color: 'purple'
  },
  field: {
    id: 'field',
    label: 'Field Documents',
    description: 'Documents for field operations',
    color: 'green'
  }
}

// ============================================
// DOCUMENT TYPES
// ============================================

export const DOCUMENT_TYPES = {
  // Client Documents
  quote: {
    id: 'quote',
    label: 'Quick Quote',
    description: 'Simple pricing with scope summary',
    icon: DollarSign,
    category: 'client',
    color: 'emerald',
    aiEnhancement: {
      scopeSummary: 'Concise description of what will be delivered',
      valueProposition: 'Why choose this operator',
      pricingIntro: 'Professional framing of the investment'
    },
    sections: [
      { id: 'header', label: 'Quote Header', required: true, default: true },
      { id: 'scope', label: 'Scope of Work', required: true, default: true },
      { id: 'deliverables', label: 'Deliverables', required: false, default: true },
      { id: 'pricing', label: 'Pricing', required: true, default: true },
      { id: 'terms', label: 'Terms & Conditions', required: false, default: true },
      { id: 'validity', label: 'Quote Validity', required: false, default: true }
    ],
    supportsMultiSite: true
  },

  proposal: {
    id: 'proposal',
    label: 'Client Proposal',
    description: 'Full proposal with methodology and value',
    icon: FileText,
    category: 'client',
    color: 'blue',
    aiEnhancement: {
      executiveSummary: 'Compelling overview with key benefits',
      companyValue: 'Articulate unique qualifications',
      methodologyNarrative: 'Clear explanation of approach',
      whyUs: 'Differentiation from competitors',
      safetyCommitment: 'Professional safety assurances'
    },
    sections: [
      { id: 'coverPage', label: 'Cover Page', required: true, default: true },
      { id: 'executiveSummary', label: 'Executive Summary', required: true, default: true },
      { id: 'companyOverview', label: 'Company Overview', required: false, default: true },
      { id: 'scope', label: 'Scope of Work', required: true, default: true },
      { id: 'methodology', label: 'Methodology', required: false, default: true },
      { id: 'safety', label: 'Safety & Compliance', required: false, default: true },
      { id: 'equipment', label: 'Equipment', required: false, default: false },
      { id: 'personnel', label: 'Personnel', required: false, default: false },
      { id: 'deliverables', label: 'Deliverables', required: true, default: true },
      { id: 'timeline', label: 'Timeline', required: false, default: true },
      { id: 'pricing', label: 'Pricing', required: true, default: true },
      { id: 'terms', label: 'Terms & Conditions', required: false, default: true }
    ],
    supportsMultiSite: true
  },

  projectReport: {
    id: 'projectReport',
    label: 'Project Report',
    description: 'Comprehensive post-operation deliverable report',
    icon: BarChart,
    category: 'client',
    color: 'cyan',
    exportType: 'project-report',
    aiEnhancement: {
      executiveSummary: 'Summary of completed work and key outcomes',
      activitiesNarrative: 'Professional narrative of field activities performed',
      methodsNarrative: 'Description of methods and techniques employed',
      findingsNarrative: 'Description of key findings and observations',
      dataAnalysis: 'Analysis and interpretation of collected data',
      deliverablesNarrative: 'Description of deliverables provided',
      recommendations: 'Professional recommendations for next steps'
    },
    sections: [
      { id: 'coverPage', label: 'Cover Page', required: true, default: true },
      { id: 'executiveSummary', label: 'Executive Summary', required: true, default: true },
      { id: 'projectOverview', label: 'Project Overview', required: true, default: true },
      { id: 'scope', label: 'Scope & Objectives', required: false, default: true },
      { id: 'team', label: 'Project Team', required: false, default: true },
      { id: 'equipment', label: 'Equipment Used', required: false, default: true },
      { id: 'fieldActivities', label: 'Field Activities', required: true, default: true },
      { id: 'methods', label: 'Methods & Techniques', required: true, default: true },
      { id: 'flightLog', label: 'Flight Log Summary', required: false, default: true },
      { id: 'dataCollected', label: 'Data Collected', required: false, default: true },
      { id: 'findings', label: 'Findings & Observations', required: true, default: true },
      { id: 'deliverables', label: 'Deliverables Provided', required: true, default: true },
      { id: 'qualityAssurance', label: 'Quality Assurance', required: false, default: false },
      { id: 'recommendations', label: 'Recommendations', required: false, default: true },
      { id: 'appendices', label: 'Appendices', required: false, default: false }
    ],
    supportsMultiSite: true
  },

  // Regulatory Documents
  operationsPlan: {
    id: 'operationsPlan',
    label: 'Operations Plan',
    description: 'Full operations documentation for regulatory submission',
    icon: FileCheck,
    category: 'regulatory',
    color: 'indigo',
    exportType: 'operations-plan', // Maps to existing export type
    aiEnhancement: {
      executiveSummary: 'Professional executive summary',
      riskNarrative: 'Clear risk assessment explanation',
      recommendations: 'Specific, actionable recommendations',
      closingStatement: 'Professional sign-off'
    },
    sections: [
      { id: 'coverPage', label: 'Cover Page', required: true, default: true },
      { id: 'executiveSummary', label: 'Executive Summary', required: true, default: true },
      { id: 'projectOverview', label: 'Project Overview', required: true, default: true },
      { id: 'crew', label: 'Crew Roster', required: true, default: true },
      { id: 'aircraft', label: 'Aircraft Details', required: true, default: true },
      { id: 'siteSurvey', label: 'Site Survey', required: true, default: true },
      { id: 'flightPlan', label: 'Flight Plan', required: true, default: true },
      { id: 'riskAssessment', label: 'Risk Assessment', required: true, default: true },
      { id: 'emergency', label: 'Emergency Plan', required: true, default: true },
      { id: 'ppe', label: 'PPE Requirements', required: false, default: true },
      { id: 'communications', label: 'Communications', required: false, default: true },
      { id: 'approvals', label: 'Approvals & Signatures', required: false, default: true }
    ],
    supportsMultiSite: true
  },

  sora: {
    id: 'sora',
    label: 'SORA Assessment',
    description: 'JARUS SORA 2.5 risk assessment',
    icon: Shield,
    category: 'regulatory',
    color: 'purple',
    exportType: 'sora', // Maps to existing export type
    aiEnhancement: {
      executiveSummary: 'SORA assessment overview',
      riskNarrative: 'GRC/ARC explanation in plain language',
      mitigationsSummary: 'Summary of applied mitigations',
      osoNarrative: 'OSO requirements explanation'
    },
    sections: [
      { id: 'coverPage', label: 'Cover Page', required: true, default: true },
      { id: 'executiveSummary', label: 'Executive Summary', required: true, default: true },
      { id: 'conops', label: 'Concept of Operations', required: true, default: true },
      { id: 'groundRisk', label: 'Ground Risk Assessment', required: true, default: true },
      { id: 'airRisk', label: 'Air Risk Assessment', required: true, default: true },
      { id: 'mitigations', label: 'Mitigations', required: true, default: true },
      { id: 'sailDetermination', label: 'SAIL Determination', required: true, default: true },
      { id: 'osos', label: 'OSO Compliance', required: false, default: true },
      { id: 'adjacentAreas', label: 'Adjacent Area Analysis', required: false, default: false }
    ],
    supportsMultiSite: true,
    conditional: 'soraAssessment'
  },

  hseRisk: {
    id: 'hseRisk',
    label: 'HSE Risk Assessment',
    description: 'Health, Safety & Environment assessment',
    icon: AlertTriangle,
    category: 'regulatory',
    color: 'orange',
    exportType: 'hse-risk', // Maps to existing export type
    aiEnhancement: {
      executiveSummary: 'Overall risk profile summary',
      hazardDescriptions: 'Professional hazard descriptions',
      recommendations: 'Practical HSE recommendations'
    },
    sections: [
      { id: 'coverPage', label: 'Cover Page', required: true, default: true },
      { id: 'executiveSummary', label: 'Executive Summary', required: true, default: true },
      { id: 'hazardRegister', label: 'Hazard Register', required: true, default: true },
      { id: 'riskMatrix', label: 'Risk Matrix', required: true, default: true },
      { id: 'controlMeasures', label: 'Control Measures', required: true, default: true },
      { id: 'ppe', label: 'PPE Requirements', required: false, default: true },
      { id: 'monitoring', label: 'Monitoring Requirements', required: false, default: false },
      { id: 'signoff', label: 'Sign-off', required: false, default: true }
    ],
    supportsMultiSite: false,
    conditional: 'hseRiskAssessment'
  },

  // Field Documents
  tailgate: {
    id: 'tailgate',
    label: 'Tailgate Briefing',
    description: 'Pre-deployment safety briefing form',
    icon: Users,
    category: 'field',
    color: 'amber',
    exportType: 'tailgate', // Maps to existing export type
    aiEnhancement: {
      briefingIntro: 'Safety briefing introduction',
      emergencyProcedures: 'Emergency procedures in prose'
    },
    sections: [
      { id: 'header', label: 'Briefing Header', required: true, default: true },
      { id: 'attendees', label: 'Attendees', required: true, default: true },
      { id: 'safetyItems', label: 'Safety Items', required: true, default: true },
      { id: 'hazards', label: 'Site Hazards', required: true, default: true },
      { id: 'emergency', label: 'Emergency Procedures', required: true, default: true },
      { id: 'communications', label: 'Communications Check', required: false, default: true },
      { id: 'signatures', label: 'Signatures', required: false, default: true }
    ],
    supportsMultiSite: false
  },

  siteSurvey: {
    id: 'siteSurvey',
    label: 'Site Survey Report',
    description: 'Site assessment documentation',
    icon: MapPin,
    category: 'field',
    color: 'green',
    exportType: 'site-survey', // Maps to existing export type
    aiEnhancement: {
      executiveSummary: 'Site survey summary',
      siteDescription: 'Detailed site description',
      operationalConsiderations: 'Operational considerations'
    },
    sections: [
      { id: 'header', label: 'Report Header', required: true, default: true },
      { id: 'siteOverview', label: 'Site Overview', required: true, default: true },
      { id: 'location', label: 'Location Details', required: true, default: true },
      { id: 'access', label: 'Access & Egress', required: false, default: true },
      { id: 'obstacles', label: 'Obstacles', required: true, default: true },
      { id: 'airspace', label: 'Airspace', required: true, default: true },
      { id: 'hazards', label: 'Site Hazards', required: false, default: true },
      { id: 'photos', label: 'Site Photos', required: false, default: false },
      { id: 'recommendations', label: 'Recommendations', required: false, default: true }
    ],
    supportsMultiSite: false,
    conditional: 'siteSurvey'
  },

  flightBrief: {
    id: 'flightBrief',
    label: 'Flight Brief',
    description: 'Pilot mission briefing document',
    icon: Plane,
    category: 'field',
    color: 'sky',
    exportType: 'flight-plan', // Maps to existing export type
    aiEnhancement: {
      executiveSummary: 'Mission overview',
      missionDescription: 'Detailed mission description'
    },
    sections: [
      { id: 'header', label: 'Brief Header', required: true, default: true },
      { id: 'mission', label: 'Mission Objective', required: true, default: true },
      { id: 'aircraft', label: 'Aircraft Details', required: true, default: true },
      { id: 'flightArea', label: 'Flight Area', required: true, default: true },
      { id: 'weather', label: 'Weather Conditions', required: true, default: true },
      { id: 'notams', label: 'NOTAMs', required: false, default: true },
      { id: 'procedures', label: 'Flight Procedures', required: true, default: true },
      { id: 'contingencies', label: 'Contingencies', required: false, default: true },
      { id: 'checklist', label: 'Pre-flight Checklist', required: false, default: false }
    ],
    supportsMultiSite: false,
    conditional: 'flightPlan'
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get document types by category
 */
export function getDocumentsByCategory(category) {
  return Object.values(DOCUMENT_TYPES).filter(doc => doc.category === category)
}

/**
 * Get all document types as array
 */
export function getAllDocumentTypes() {
  return Object.values(DOCUMENT_TYPES)
}

/**
 * Get document type by ID
 */
export function getDocumentType(id) {
  return DOCUMENT_TYPES[id] || null
}

/**
 * Get default sections for a document type
 */
export function getDefaultSections(documentTypeId) {
  const docType = DOCUMENT_TYPES[documentTypeId]
  if (!docType) return []

  return docType.sections
    .filter(section => section.default)
    .map(section => section.id)
}

/**
 * Check if document type is available for project
 */
export function isDocumentTypeAvailable(documentTypeId, project) {
  const docType = DOCUMENT_TYPES[documentTypeId]
  if (!docType) return false

  // Check conditional requirements
  if (docType.conditional) {
    const sites = Array.isArray(project?.sites) ? project.sites : []
    const hasData = project?.[docType.conditional] || sites.some(s => s[docType.conditional])
    if (!hasData) return false
  }

  return true
}

/**
 * Get color classes for a document type
 */
export function getDocumentColorClasses(documentTypeId) {
  const docType = DOCUMENT_TYPES[documentTypeId]
  if (!docType) return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' }

  const colorMap = {
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-200' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
    cyan: { bg: 'bg-cyan-100', text: 'text-cyan-600', border: 'border-cyan-200' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-200' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-200' },
    green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
    sky: { bg: 'bg-sky-100', text: 'text-sky-600', border: 'border-sky-200' }
  }

  return colorMap[docType.color] || { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' }
}

export default {
  DOCUMENT_TYPES,
  DOCUMENT_CATEGORIES,
  AI_TONES,
  getDocumentsByCategory,
  getAllDocumentTypes,
  getDocumentType,
  getDefaultSections,
  isDocumentTypeAvailable,
  getDocumentColorClasses
}
