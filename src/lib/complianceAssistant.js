/**
 * complianceAssistant.js
 * Unified AI Compliance Assistant Engine
 *
 * Combines multiple sources for intelligent suggestions:
 * - Knowledge Base (indexed policies/procedures)
 * - Project Data (SORA, site surveys, flight plans)
 * - Response Templates
 * - Cross-reference analysis
 *
 * @location src/lib/complianceAssistant.js
 */

import { findRelevantDocs, searchKnowledgeBase } from './firestoreKnowledgeBase'
import { getAutoPopulateSuggestions } from '../components/compliance/SmartPopulate'
import {
  mapRequirementToPatterns,
  findMatchingQuestionPattern,
  analyzeComplianceText,
  COMPLIANCE_CATEGORIES,
  EVIDENCE_PATTERNS
} from './regulatoryPatterns'

// ============================================
// RESPONSE TEMPLATES
// ============================================

/**
 * Pre-built response templates for common compliance patterns
 * Templates include placeholders marked with [PLACEHOLDER_NAME]
 */
export const RESPONSE_TEMPLATES = {
  // CONOPS Template
  conops: {
    id: 'conops',
    name: 'Concept of Operations',
    category: 'operations',
    regulatoryRefs: ['CAR 903.02(d)'],
    template: `The purpose of this operation is to conduct [OPERATION_TYPE] for [CLIENT_NAME] in the [LOCATION] area.

Operations will involve [DESCRIPTION_OF_ACTIVITIES] using [AIRCRAFT_TYPE] equipped with [PAYLOAD_SENSORS].

Operational Parameters:
- Maximum Altitude: [MAX_ALTITUDE] AGL
- Operational Area: [AREA_DESCRIPTION]
- Duration: [DURATION]
- Frequency: [FREQUENCY]

See attached CONOPS document (Operations Manual Section [SECTION_NUMBER]) for complete operational details.`,
    placeholders: [
      { key: 'OPERATION_TYPE', hint: 'e.g., aerial inspection, surveying, mapping' },
      { key: 'CLIENT_NAME', hint: 'Client or project name' },
      { key: 'LOCATION', hint: 'Geographic location' },
      { key: 'DESCRIPTION_OF_ACTIVITIES', hint: 'Describe the activities' },
      { key: 'AIRCRAFT_TYPE', hint: 'e.g., DJI Matrice 300 RTK' },
      { key: 'PAYLOAD_SENSORS', hint: 'e.g., thermal camera, LiDAR' },
      { key: 'MAX_ALTITUDE', hint: 'e.g., 120m (400ft)' },
      { key: 'AREA_DESCRIPTION', hint: 'Describe the operational area' },
      { key: 'DURATION', hint: 'e.g., 25-30 minutes per flight' },
      { key: 'FREQUENCY', hint: 'e.g., 2-3 flights per day' },
      { key: 'SECTION_NUMBER', hint: 'Operations Manual section reference' }
    ]
  },

  // SORA Assessment Template
  sora: {
    id: 'sora',
    name: 'SORA Assessment Summary',
    category: 'operations',
    regulatoryRefs: ['AC 903-001'],
    template: `SORA Assessment completed per JARUS SORA 2.5 methodology.

Final SAIL Level: [SAIL_LEVEL]
Ground Risk Class (GRC): [GRC] ([GRC_DESCRIPTION])
Air Risk Class (ARC): [ARC] ([ARC_DESCRIPTION])

Ground Risk Mitigations Applied:
[GROUND_MITIGATIONS]

Air Risk Mitigations Applied:
[AIR_MITIGATIONS]

All applicable Operational Safety Objectives (OSOs) have been addressed with evidence documented in the attached SORA report.`,
    placeholders: [
      { key: 'SAIL_LEVEL', hint: 'I, II, III, IV, V, or VI' },
      { key: 'GRC', hint: 'e.g., 3' },
      { key: 'GRC_DESCRIPTION', hint: 'e.g., Sparsely populated, mitigated by M1 & M2' },
      { key: 'ARC', hint: 'e.g., ARC-b' },
      { key: 'ARC_DESCRIPTION', hint: 'e.g., Uncontrolled airspace with VO DAA' },
      { key: 'GROUND_MITIGATIONS', hint: 'List M1, M2, M3 mitigations applied' },
      { key: 'AIR_MITIGATIONS', hint: 'List tactical/strategic mitigations' }
    ]
  },

  // Emergency Procedures Template
  emergency: {
    id: 'emergency',
    name: 'Emergency Procedures',
    category: 'procedures',
    regulatoryRefs: ['CAR 903.02'],
    template: `Emergency procedures are documented in Operations Manual Section [SECTION_NUMBER].

Key Emergency Procedures:

1. Loss of C2 Link:
[LOST_LINK_PROCEDURE]

2. Fly-away:
[FLYAWAY_PROCEDURE]

3. Low Battery Emergency:
[LOW_BATTERY_PROCEDURE]

4. Weather Deterioration:
[WEATHER_PROCEDURE]

5. Medical Emergency:
[MEDICAL_PROCEDURE]

All crew members are trained on emergency procedures during initial training and through quarterly refresher exercises.`,
    placeholders: [
      { key: 'SECTION_NUMBER', hint: 'e.g., Section 6' },
      { key: 'LOST_LINK_PROCEDURE', hint: 'Describe RTH behavior and crew actions' },
      { key: 'FLYAWAY_PROCEDURE', hint: 'Describe tracking and notification procedures' },
      { key: 'LOW_BATTERY_PROCEDURE', hint: 'Describe RTH trigger and reserve requirements' },
      { key: 'WEATHER_PROCEDURE', hint: 'Describe monitoring and abort procedures' },
      { key: 'MEDICAL_PROCEDURE', hint: 'Describe first aid and emergency contacts' }
    ]
  },

  // Weather Minimums Template
  weather: {
    id: 'weather',
    name: 'Weather Minimums',
    category: 'operations',
    regulatoryRefs: ['CAR 903.02'],
    template: `Weather Minimums for [OPERATION_TYPE] Operations:

Visibility: Minimum [MIN_VISIBILITY] SM
Ceiling: Minimum [MIN_CEILING] ft AGL
Wind: Maximum [MAX_WIND] sustained, [MAX_GUST] gusts
Precipitation: [PRECIPITATION_LIMITS]
Temperature: [TEMP_LIMITS]

Weather Information Sources:
- [WEATHER_SOURCES]

Weather is checked via [CHECK_METHOD] [CHECK_TIMING] and continuously monitored during operations.

Operations will be suspended immediately if conditions deteriorate below minimums.`,
    placeholders: [
      { key: 'OPERATION_TYPE', hint: 'VLOS, EVLOS, or BVLOS' },
      { key: 'MIN_VISIBILITY', hint: 'e.g., 3' },
      { key: 'MIN_CEILING', hint: 'e.g., 500' },
      { key: 'MAX_WIND', hint: 'e.g., 25 km/h' },
      { key: 'MAX_GUST', hint: 'e.g., 35 km/h' },
      { key: 'PRECIPITATION_LIMITS', hint: 'e.g., No operations in rain, fog, or snow' },
      { key: 'TEMP_LIMITS', hint: 'e.g., -10°C to +40°C (battery limits)' },
      { key: 'WEATHER_SOURCES', hint: 'e.g., AWOS, METAR, Aviation Weather' },
      { key: 'CHECK_METHOD', hint: 'e.g., NavCanada weather services' },
      { key: 'CHECK_TIMING', hint: 'e.g., 1 hour prior to operations' }
    ]
  },

  // Crew Communications Template
  communications: {
    id: 'communications',
    name: 'Crew Communications',
    category: 'crew',
    regulatoryRefs: ['CAR 903.02'],
    template: `Communication procedures between crew members:

Primary Communication: [PRIMARY_METHOD]
Backup Communication: [BACKUP_METHOD]
Aviation Radio: [AVIATION_RADIO]

Standard Phraseology: Per Operations Manual Section [SECTION_NUMBER]

Check-in Intervals: [CHECK_INTERVAL]

Emergency Stop Command: "[STOP_COMMAND]"

Pre-flight communication check is conducted before each operation to verify all equipment is functioning properly.`,
    placeholders: [
      { key: 'PRIMARY_METHOD', hint: 'e.g., Dedicated UHF radio (Channel X)' },
      { key: 'BACKUP_METHOD', hint: 'e.g., Cellular phone' },
      { key: 'AVIATION_RADIO', hint: 'e.g., Monitor 126.7 MHz' },
      { key: 'SECTION_NUMBER', hint: 'e.g., Section 5.3' },
      { key: 'CHECK_INTERVAL', hint: 'e.g., Every 2 minutes during BVLOS' },
      { key: 'STOP_COMMAND', hint: 'e.g., ABORT ABORT ABORT' }
    ]
  },

  // Maintenance Program Template
  maintenance: {
    id: 'maintenance',
    name: 'Maintenance Program',
    category: 'equipment',
    regulatoryRefs: ['CAR 903.02'],
    template: `Maintenance is conducted per manufacturer recommendations and Operations Manual Section [SECTION_NUMBER].

Inspection Schedule:
- Pre-flight inspection: Before each flight
- Post-flight inspection: After each flight
- [INTERVAL_1]-hour inspection: [INTERVAL_1_TASKS]
- [INTERVAL_2]-hour major inspection: [INTERVAL_2_TASKS]

Battery Management:
- Cycle tracking in [TRACKING_SYSTEM]
- Replacement criteria: [BATTERY_CRITERIA]

All maintenance is logged in [LOG_SYSTEM] and records retained for [RETENTION_PERIOD].

See attached maintenance schedule and sample logs.`,
    placeholders: [
      { key: 'SECTION_NUMBER', hint: 'e.g., Section 8' },
      { key: 'INTERVAL_1', hint: 'e.g., 25' },
      { key: 'INTERVAL_1_TASKS', hint: 'e.g., Motor inspection, propeller check' },
      { key: 'INTERVAL_2', hint: 'e.g., 100' },
      { key: 'INTERVAL_2_TASKS', hint: 'e.g., Complete airframe inspection, firmware update' },
      { key: 'TRACKING_SYSTEM', hint: 'e.g., AirData' },
      { key: 'BATTERY_CRITERIA', hint: 'e.g., 200 cycles or 80% capacity' },
      { key: 'LOG_SYSTEM', hint: 'e.g., Aircraft logbook and AirData' },
      { key: 'RETENTION_PERIOD', hint: 'e.g., 24 months' }
    ]
  },

  // Insurance Coverage Template
  insurance: {
    id: 'insurance',
    name: 'Insurance Coverage',
    category: 'crew',
    regulatoryRefs: ['CAR 903.02'],
    template: `Liability Insurance Coverage:

Insurance Provider: [PROVIDER]
Policy Number: [POLICY_NUMBER]
Coverage Amount: $[COVERAGE_AMOUNT] per occurrence

Coverage includes:
- [COVERAGE_TYPES]

Policy specifically endorses: [ENDORSED_OPERATIONS]

Certificate of Insurance is attached.
Policy Expiry Date: [EXPIRY_DATE]`,
    placeholders: [
      { key: 'PROVIDER', hint: 'Insurance company name' },
      { key: 'POLICY_NUMBER', hint: 'Policy number' },
      { key: 'COVERAGE_AMOUNT', hint: 'e.g., 2,000,000' },
      { key: 'COVERAGE_TYPES', hint: 'e.g., Third-party liability, Hull coverage' },
      { key: 'ENDORSED_OPERATIONS', hint: 'e.g., BVLOS operations, commercial operations' },
      { key: 'EXPIRY_DATE', hint: 'Policy expiration date' }
    ]
  },

  // Pilot Certification Template
  pilotCert: {
    id: 'pilotCert',
    name: 'Pilot Certification',
    category: 'crew',
    regulatoryRefs: ['CAR 901.54'],
    template: `Pilot Certification Details:

Pilot Name: [PILOT_NAME]
Certificate Type: [CERT_TYPE]
Certificate Number: [CERT_NUMBER]
Issue Date: [ISSUE_DATE]
Medical Category: [MEDICAL_CAT]

Additional Ratings/Endorsements:
[ADDITIONAL_RATINGS]

Flight Experience:
- Total Hours: [TOTAL_HOURS]
- Hours on Type: [TYPE_HOURS]

Certificate copies are attached.`,
    placeholders: [
      { key: 'PILOT_NAME', hint: 'Full name' },
      { key: 'CERT_TYPE', hint: 'e.g., Advanced RPAS Certificate' },
      { key: 'CERT_NUMBER', hint: 'Certificate number' },
      { key: 'ISSUE_DATE', hint: 'Certificate issue date' },
      { key: 'MEDICAL_CAT', hint: 'e.g., Category 1/3 or Self-declaration' },
      { key: 'ADDITIONAL_RATINGS', hint: 'e.g., Night Rating, Ground Instructor' },
      { key: 'TOTAL_HOURS', hint: 'Total flight hours' },
      { key: 'TYPE_HOURS', hint: 'Hours on specific aircraft type' }
    ]
  },

  // ============================================
  // GENERAL COMPLIANCE TEMPLATES
  // For client prequalification and general questionnaires
  // ============================================

  // Company Overview Template
  companyOverview: {
    id: 'companyOverview',
    name: 'Company Overview',
    category: 'general',
    regulatoryRefs: [],
    template: `[COMPANY_NAME] is a [COMPANY_TYPE] established in [YEAR_ESTABLISHED], specializing in [SPECIALIZATION].

Corporate Information:
- Legal Name: [LEGAL_NAME]
- Business Number: [BUSINESS_NUMBER]
- Head Office: [HEAD_OFFICE_ADDRESS]

Our organization has [YEARS_EXPERIENCE] years of experience providing [SERVICES_DESCRIPTION].

We employ [EMPLOYEE_COUNT] personnel including [KEY_POSITIONS].

For more information, please visit [WEBSITE] or contact [CONTACT_INFO].`,
    placeholders: [
      { key: 'COMPANY_NAME', hint: 'Company name' },
      { key: 'COMPANY_TYPE', hint: 'e.g., privately held company' },
      { key: 'YEAR_ESTABLISHED', hint: 'Year founded' },
      { key: 'SPECIALIZATION', hint: 'Core services/expertise' },
      { key: 'LEGAL_NAME', hint: 'Full legal registered name' },
      { key: 'BUSINESS_NUMBER', hint: 'Business registration number' },
      { key: 'HEAD_OFFICE_ADDRESS', hint: 'Head office address' },
      { key: 'YEARS_EXPERIENCE', hint: 'Years in business' },
      { key: 'SERVICES_DESCRIPTION', hint: 'Description of services' },
      { key: 'EMPLOYEE_COUNT', hint: 'Number of employees' },
      { key: 'KEY_POSITIONS', hint: 'Key staff roles' },
      { key: 'WEBSITE', hint: 'Company website' },
      { key: 'CONTACT_INFO', hint: 'Contact email/phone' }
    ]
  },

  // Safety Program Template
  safetyProgram: {
    id: 'safetyProgram',
    name: 'Safety Management System',
    category: 'safety',
    regulatoryRefs: ['OH&S Act', 'COR'],
    template: `Our Safety Management System includes:

Safety Policy:
Our organization maintains a documented safety policy signed by senior management, communicated to all employees, and reviewed annually.

Hazard Identification & Risk Assessment:
- Formal hazard identification process before each project
- Risk assessment using [RISK_METHOD] methodology
- Documented safe work procedures for all high-risk tasks

Incident Reporting & Investigation:
- All incidents reported within [REPORTING_TIMELINE]
- Root cause analysis conducted for all incidents
- Corrective actions tracked to completion

Training Program:
- Safety orientation for all new employees
- Role-specific training for [SPECIFIC_ROLES]
- Annual refresher training for all personnel

Safety Performance:
- TRIR: [TRIR_VALUE] (past 3 years average)
- Lost Time Incidents: [LTI_COUNT] (past 12 months)
- Days Since Last Recordable: [DAYS_SAFE]

[CERTIFICATIONS_LIST]`,
    placeholders: [
      { key: 'RISK_METHOD', hint: 'e.g., SORA 2.5, Job Hazard Analysis' },
      { key: 'REPORTING_TIMELINE', hint: 'e.g., 24 hours' },
      { key: 'SPECIFIC_ROLES', hint: 'e.g., pilots, ground crew, supervisors' },
      { key: 'TRIR_VALUE', hint: 'Total Recordable Incident Rate' },
      { key: 'LTI_COUNT', hint: 'Number of lost time incidents' },
      { key: 'DAYS_SAFE', hint: 'Days since last recordable incident' },
      { key: 'CERTIFICATIONS_LIST', hint: 'e.g., COR certified, ISO 45001' }
    ]
  },

  // Quality Management Template
  qualityManagement: {
    id: 'qualityManagement',
    name: 'Quality Management',
    category: 'general',
    regulatoryRefs: ['ISO 9001'],
    template: `Quality Management System Overview:

Our quality management practices include:

Documentation:
- Operations Manual with controlled revision process
- Standard Operating Procedures for all key activities
- Quality records maintained for [RETENTION_PERIOD]

Quality Control:
- Pre-work inspections and checklists
- In-process quality verification
- Final deliverable review and approval

Continuous Improvement:
- Regular internal audits
- Management review meetings [REVIEW_FREQUENCY]
- Non-conformance tracking and corrective action

[QUALITY_CERTIFICATIONS]

Customer feedback is actively solicited and used to improve our services.`,
    placeholders: [
      { key: 'RETENTION_PERIOD', hint: 'e.g., 5 years' },
      { key: 'REVIEW_FREQUENCY', hint: 'e.g., quarterly' },
      { key: 'QUALITY_CERTIFICATIONS', hint: 'e.g., ISO 9001:2015 certified' }
    ]
  },

  // Service Capabilities Template
  serviceCapabilities: {
    id: 'serviceCapabilities',
    name: 'Service Capabilities',
    category: 'operations',
    regulatoryRefs: [],
    template: `Service Capabilities:

Core Services:
[CORE_SERVICES_LIST]

Geographic Coverage:
[GEOGRAPHIC_COVERAGE]

Equipment & Resources:
- Fleet: [FLEET_DESCRIPTION]
- Sensors/Payloads: [SENSOR_CAPABILITIES]
- Data Processing: [DATA_CAPABILITIES]

Operational Capabilities:
- [OPERATIONAL_CAPABILITIES]

Typical Deliverables:
[DELIVERABLES_LIST]

We have successfully completed [PROJECT_COUNT] similar projects for clients including [NOTABLE_CLIENTS].`,
    placeholders: [
      { key: 'CORE_SERVICES_LIST', hint: 'List of primary services offered' },
      { key: 'GEOGRAPHIC_COVERAGE', hint: 'Areas/regions served' },
      { key: 'FLEET_DESCRIPTION', hint: 'Aircraft types and quantities' },
      { key: 'SENSOR_CAPABILITIES', hint: 'Camera, LiDAR, thermal, etc.' },
      { key: 'DATA_CAPABILITIES', hint: 'Processing and analysis capabilities' },
      { key: 'OPERATIONAL_CAPABILITIES', hint: 'e.g., BVLOS, night operations' },
      { key: 'DELIVERABLES_LIST', hint: 'Typical project outputs' },
      { key: 'PROJECT_COUNT', hint: 'Number of similar projects' },
      { key: 'NOTABLE_CLIENTS', hint: 'Reference clients (if permitted)' }
    ]
  },

  // Training Program Template
  trainingProgram: {
    id: 'trainingProgram',
    name: 'Training Program',
    category: 'crew',
    regulatoryRefs: ['CAR 901.54', 'CAR 901.55'],
    template: `Training Program Overview:

Initial Training:
All personnel complete comprehensive initial training including:
- [INITIAL_TRAINING_COMPONENTS]

Recurrent Training:
- Frequency: [RECURRENT_FREQUENCY]
- Topics covered: [RECURRENT_TOPICS]

Competency Assessment:
- Knowledge testing: [KNOWLEDGE_TESTING]
- Practical evaluation: [PRACTICAL_EVAL]
- Proficiency standards: [PROFICIENCY_STANDARDS]

Training Records:
- All training documented in [TRAINING_SYSTEM]
- Records maintained for [RECORD_RETENTION]
- Certificates issued for completed training

Training is delivered by [TRAINING_PROVIDERS].`,
    placeholders: [
      { key: 'INITIAL_TRAINING_COMPONENTS', hint: 'Ground school, flight training, etc.' },
      { key: 'RECURRENT_FREQUENCY', hint: 'e.g., annually, every 24 months' },
      { key: 'RECURRENT_TOPICS', hint: 'Topics covered in recurrent training' },
      { key: 'KNOWLEDGE_TESTING', hint: 'Written exams, oral tests' },
      { key: 'PRACTICAL_EVAL', hint: 'Flight check, skills demonstration' },
      { key: 'PROFICIENCY_STANDARDS', hint: 'Minimum standards required' },
      { key: 'TRAINING_SYSTEM', hint: 'e.g., Learning Management System' },
      { key: 'RECORD_RETENTION', hint: 'e.g., duration of employment plus 2 years' },
      { key: 'TRAINING_PROVIDERS', hint: 'Internal trainers, third-party providers' }
    ]
  },

  // References Template
  references: {
    id: 'references',
    name: 'Project References',
    category: 'general',
    regulatoryRefs: [],
    template: `Reference Project 1:
- Client: [CLIENT_1_NAME]
- Project: [PROJECT_1_DESC]
- Date: [PROJECT_1_DATE]
- Scope: [PROJECT_1_SCOPE]
- Contact: [CLIENT_1_CONTACT]

Reference Project 2:
- Client: [CLIENT_2_NAME]
- Project: [PROJECT_2_DESC]
- Date: [PROJECT_2_DATE]
- Scope: [PROJECT_2_SCOPE]
- Contact: [CLIENT_2_CONTACT]

Reference Project 3:
- Client: [CLIENT_3_NAME]
- Project: [PROJECT_3_DESC]
- Date: [PROJECT_3_DATE]
- Scope: [PROJECT_3_SCOPE]
- Contact: [CLIENT_3_CONTACT]

Additional references available upon request.`,
    placeholders: [
      { key: 'CLIENT_1_NAME', hint: 'Client company name' },
      { key: 'PROJECT_1_DESC', hint: 'Project description' },
      { key: 'PROJECT_1_DATE', hint: 'Project date/duration' },
      { key: 'PROJECT_1_SCOPE', hint: 'Scope of work' },
      { key: 'CLIENT_1_CONTACT', hint: 'Contact name, email, phone' }
    ]
  }
}

// ============================================
// CROSS-REFERENCE ANALYSIS
// ============================================

/**
 * Requirement relationship mappings
 * Groups requirements that typically share evidence
 */
export const REQUIREMENT_RELATIONSHIPS = {
  // Operations cluster
  operations: {
    keywords: ['conops', 'operations', 'procedures', 'flight plan'],
    relatedCategories: ['operations', 'procedures'],
    relatedRegRefs: ['CAR 903.02', 'CAR 903.02(d)']
  },

  // SORA cluster
  sora: {
    keywords: ['sora', 'sail', 'risk assessment', 'oso', 'grc', 'arc'],
    relatedCategories: ['operations', 'safety'],
    relatedRegRefs: ['AC 903-001']
  },

  // Emergency procedures cluster
  emergency: {
    keywords: ['emergency', 'contingency', 'lost link', 'fly-away', 'rth'],
    relatedCategories: ['procedures', 'safety'],
    relatedRegRefs: ['CAR 903.02']
  },

  // Equipment cluster
  equipment: {
    keywords: ['aircraft', 'rpas', 'c2 link', 'navigation', 'gps', 'geo-fence'],
    relatedCategories: ['equipment'],
    relatedRegRefs: ['CAR 901.02', 'CAR 903.02']
  },

  // Crew cluster
  crew: {
    keywords: ['pilot', 'crew', 'training', 'certification', 'qualification'],
    relatedCategories: ['crew'],
    relatedRegRefs: ['CAR 901.54', 'CAR 901.55', 'CAR 901.70']
  },

  // Maintenance cluster
  maintenance: {
    keywords: ['maintenance', 'inspection', 'airworthiness', 'service'],
    relatedCategories: ['equipment'],
    relatedRegRefs: ['CAR 901.48', 'CAR 903.02']
  },

  // Communications cluster
  communications: {
    keywords: ['communication', 'radio', 'atc', 'nav canada', 'notam'],
    relatedCategories: ['crew', 'procedures'],
    relatedRegRefs: ['CAR 903.02']
  }
}

/**
 * Find related requirements that might share evidence
 */
export function findRelatedRequirements(requirement, allRequirements, responses) {
  const related = []
  const reqText = `${requirement.text} ${requirement.shortText || ''} ${requirement.guidance || ''}`.toLowerCase()
  const reqRegRef = requirement.regulatoryRef?.toLowerCase() || ''

  // Determine which clusters this requirement belongs to
  const matchingClusters = []
  for (const [clusterId, cluster] of Object.entries(REQUIREMENT_RELATIONSHIPS)) {
    const keywordMatch = cluster.keywords.some(kw => reqText.includes(kw))
    const regRefMatch = cluster.relatedRegRefs.some(ref => reqRegRef.includes(ref.toLowerCase()))

    if (keywordMatch || regRefMatch) {
      matchingClusters.push(clusterId)
    }
  }

  // Find other requirements in the same clusters
  for (const otherReq of allRequirements) {
    if (otherReq.id === requirement.id) continue

    const otherText = `${otherReq.text} ${otherReq.shortText || ''} ${otherReq.guidance || ''}`.toLowerCase()
    const otherRegRef = otherReq.regulatoryRef?.toLowerCase() || ''
    const otherResponse = responses[otherReq.id]

    // Check if this requirement matches any of our clusters
    for (const clusterId of matchingClusters) {
      const cluster = REQUIREMENT_RELATIONSHIPS[clusterId]
      const keywordMatch = cluster.keywords.some(kw => otherText.includes(kw))
      const regRefMatch = cluster.relatedRegRefs.some(ref => otherRegRef.includes(ref.toLowerCase()))

      if (keywordMatch || regRefMatch) {
        const hasContent = otherResponse?.response?.length > 0 || otherResponse?.documentRefs?.length > 0

        related.push({
          requirementId: otherReq.id,
          shortText: otherReq.shortText || otherReq.text.substring(0, 60),
          regulatoryRef: otherReq.regulatoryRef,
          cluster: clusterId,
          hasContent,
          status: otherResponse?.status || 'empty'
        })
        break // Only add once per requirement
      }
    }
  }

  // Remove duplicates and sort by status (completed first)
  const unique = related.filter((r, i, arr) =>
    arr.findIndex(x => x.requirementId === r.requirementId) === i
  )

  return unique.sort((a, b) => {
    if (a.hasContent && !b.hasContent) return -1
    if (!a.hasContent && b.hasContent) return 1
    return 0
  })
}

// ============================================
// UNIFIED SUGGESTION ENGINE
// ============================================

/**
 * Get comprehensive suggestions for a requirement
 * Combines all sources: Knowledge Base, Project Data, Templates, Pattern Analysis
 */
export async function getComprehensiveSuggestions(operatorId, requirement, project = null, allRequirements = [], responses = {}) {
  const suggestions = {
    fromKnowledgeBase: null,
    fromProject: [],
    templates: [],
    relatedRequirements: [],
    patternAnalysis: null,
    compositeResponse: null
  }

  // 1. Analyze requirement patterns (fast, local)
  try {
    suggestions.patternAnalysis = getPatternBasedSuggestions(requirement)
  } catch (err) {
    console.warn('Pattern analysis failed:', err)
    suggestions.patternAnalysis = null
  }

  // 2. Get Knowledge Base suggestions
  try {
    // Use pattern analysis to enhance KB search
    const searchTerms = suggestions.patternAnalysis?.searchTerms || []
    suggestions.fromKnowledgeBase = await findRelevantDocs(operatorId, {
      ...requirement,
      // Add pattern-detected keywords to improve search
      keywords: [...(requirement.keywords || []), ...searchTerms]
    })
  } catch (err) {
    console.warn('KB search failed:', err)
    suggestions.fromKnowledgeBase = { directMatches: [], relatedMatches: [], gaps: [] }
  }

  // 3. Get Project Data suggestions
  if (project) {
    suggestions.fromProject = getAutoPopulateSuggestions(requirement, project)
  }

  // 4. Find matching templates
  suggestions.templates = findMatchingTemplates(requirement)

  // 5. Find related requirements
  if (allRequirements.length > 0) {
    suggestions.relatedRequirements = findRelatedRequirements(requirement, allRequirements, responses)
  }

  // 6. Build composite response suggestion
  suggestions.compositeResponse = buildCompositeResponse(suggestions, requirement)

  return suggestions
}

/**
 * Get pattern-based suggestions for a requirement
 * Uses regulatory pattern library for intelligent matching
 */
export function getPatternBasedSuggestions(requirement) {
  const patterns = mapRequirementToPatterns(requirement)
  const questionMatch = findMatchingQuestionPattern(
    requirement.text || requirement.shortText || ''
  )

  return {
    // Primary detected category
    category: patterns.primaryCategory,

    // Confidence in the pattern match
    confidence: patterns.analysis.confidence,

    // Suggested evidence types
    suggestedEvidence: patterns.suggestedEvidence,

    // Response hints (what should be included)
    responseHints: patterns.responseHints,

    // Related regulations
    relatedRegs: patterns.relatedRegs,

    // Search terms for knowledge base
    searchTerms: patterns.searchTerms,

    // Full analysis details
    analysis: patterns.analysis,

    // Common question pattern match
    questionPattern: questionMatch,

    // Get category-specific guidance
    categoryGuidance: patterns.primaryCategory
      ? COMPLIANCE_CATEGORIES[patterns.primaryCategory.id]
      : null
  }
}

/**
 * Find templates that match a requirement
 */
export function findMatchingTemplates(requirement) {
  const matches = []
  const reqText = `${requirement.text} ${requirement.shortText || ''} ${requirement.guidance || ''}`.toLowerCase()
  const reqRegRef = requirement.regulatoryRef?.toLowerCase() || ''
  const reqCategory = requirement.category?.toLowerCase() || ''

  for (const [id, template] of Object.entries(RESPONSE_TEMPLATES)) {
    let score = 0

    // Check regulatory reference match
    if (template.regulatoryRefs.some(ref => reqRegRef.includes(ref.toLowerCase()))) {
      score += 30
    }

    // Check category match
    if (template.category === reqCategory) {
      score += 20
    }

    // Check keyword match in template name
    if (reqText.includes(template.name.toLowerCase())) {
      score += 25
    }

    // Check template ID keywords
    if (reqText.includes(id.toLowerCase())) {
      score += 15
    }

    if (score > 20) {
      matches.push({
        ...template,
        matchScore: score
      })
    }
  }

  return matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3)
}

/**
 * Build a composite response from multiple suggestion sources
 * Intelligently combines KB results, templates, and pattern analysis
 */
function buildCompositeResponse(suggestions, requirement) {
  const parts = []
  const sources = []

  // 1. Start with project data if available (most reliable source)
  if (suggestions.fromProject.length > 0) {
    const projectParts = suggestions.fromProject.map(s => s.value)
    parts.push(...projectParts)
    sources.push('project data')
  }

  // 2. If we have a strong template match and no project data, use template structure
  if (parts.length === 0 && suggestions.templates?.length > 0) {
    const topTemplate = suggestions.templates[0]
    if (topTemplate.matchScore >= 40) {
      // High confidence match - provide template as starting point
      parts.push(`[Suggested structure from ${topTemplate.name} template]\n\n${topTemplate.template}`)
      sources.push('template')
    }
  }

  // 3. Add relevant content from Knowledge Base
  if (suggestions.fromKnowledgeBase?.directMatches?.length > 0) {
    const kbMatches = suggestions.fromKnowledgeBase.directMatches.slice(0, 3)

    for (const match of kbMatches) {
      // Build a useful reference
      const ref = match.sourceNumber
        ? `[From ${match.sourceType === 'policy' ? 'Policy' : match.sourceType} ${match.sourceNumber}${match.sectionTitle ? ` - ${match.sectionTitle}` : ''}]`
        : `[From ${match.sourceType || 'Knowledge Base'}]`

      // Include relevant content snippet if available
      if (match.content && match.relevanceScore > 0.6) {
        // Truncate to ~200 chars for the draft
        const snippet = match.content.length > 200
          ? match.content.substring(0, 200) + '...'
          : match.content
        parts.push(`${ref}\n${snippet}`)
        sources.push('knowledge base')
        break // Only include top match content to keep response focused
      } else if (parts.length === 0) {
        // At minimum, reference where to look
        parts.push(ref)
        sources.push('knowledge base reference')
      }
    }
  }

  // 4. Add pattern-based guidance if no other content
  if (parts.length === 0 && suggestions.patternAnalysis) {
    const pattern = suggestions.patternAnalysis

    if (pattern.responseHints?.length > 0) {
      parts.push(`[Guidance: This question typically requires addressing:]\n- ${pattern.responseHints.join('\n- ')}`)
      sources.push('pattern analysis')
    }

    if (pattern.suggestedEvidence?.length > 0) {
      parts.push(`\n[Consider attaching: ${pattern.suggestedEvidence.join(', ')}]`)
    }
  }

  // 5. Add regulatory context if available
  if (suggestions.patternAnalysis?.relatedRegs?.length > 0 && parts.length > 0) {
    const regs = suggestions.patternAnalysis.relatedRegs.slice(0, 3)
    parts.push(`\n[Related regulations: ${regs.join(', ')}]`)
  }

  // Return null if we couldn't build anything meaningful
  if (parts.length === 0) return null

  return {
    draft: parts.join('\n\n'),
    sources: [...new Set(sources)], // Deduplicate sources
    confidence: calculateConfidence(suggestions)
  }
}

/**
 * Calculate confidence score for composite response
 */
function calculateConfidence(suggestions) {
  let score = 0

  // Project data is highly reliable
  if (suggestions.fromProject?.length > 0) score += 40

  // KB matches add confidence
  if (suggestions.fromKnowledgeBase?.directMatches?.length > 0) {
    const topMatch = suggestions.fromKnowledgeBase.directMatches[0]
    score += Math.min(30, (topMatch.relevanceScore || 0.5) * 30)
  }

  // Template matches add some confidence
  if (suggestions.templates?.length > 0) {
    score += Math.min(20, suggestions.templates[0].matchScore / 2)
  }

  // Pattern analysis adds base confidence
  if (suggestions.patternAnalysis?.confidence) {
    score += Math.min(10, suggestions.patternAnalysis.confidence * 10)
  }

  return Math.min(100, Math.round(score))
}

/**
 * Apply a template with placeholder values
 */
export function applyTemplate(templateId, values = {}) {
  const template = RESPONSE_TEMPLATES[templateId]
  if (!template) return null

  let result = template.template

  // Replace placeholders with values
  for (const placeholder of template.placeholders) {
    const value = values[placeholder.key] || `[${placeholder.key}]`
    result = result.replace(new RegExp(`\\[${placeholder.key}\\]`, 'g'), value)
  }

  return result
}

/**
 * Extract placeholders that still need values
 */
export function getUnfilledPlaceholders(text) {
  const matches = text.match(/\[([A-Z_]+)\]/g)
  if (!matches) return []

  return [...new Set(matches)].map(m => m.replace(/[\[\]]/g, ''))
}

// ============================================
// BATCH OPERATIONS
// ============================================

/**
 * Auto-populate multiple requirements from project data
 */
export function batchAutoPopulate(requirements, project, responses) {
  const updates = []

  for (const req of requirements) {
    // Skip if already has content
    if (responses[req.id]?.response?.length > 50) continue

    const suggestions = getAutoPopulateSuggestions(req, project)
    if (suggestions.length > 0) {
      updates.push({
        requirementId: req.id,
        suggestions,
        combinedValue: suggestions.map(s => `[${s.label}]\n${s.value}`).join('\n\n')
      })
    }
  }

  return updates
}

/**
 * Get requirements that can be auto-populated
 */
export function getAutoPopulatableRequirements(requirements, project, responses) {
  const populatable = []

  for (const req of requirements) {
    if (!req.autoPopulateFrom || req.autoPopulateFrom.length === 0) continue

    const currentResponse = responses[req.id]
    const hasContent = currentResponse?.response?.length > 50

    const suggestions = getAutoPopulateSuggestions(req, project)
    const hasData = suggestions.length > 0

    if (hasData) {
      populatable.push({
        requirement: req,
        suggestions,
        hasExistingContent: hasContent,
        wouldOverwrite: hasContent
      })
    }
  }

  return populatable
}

// ============================================
// EXPORT
// ============================================

export default {
  RESPONSE_TEMPLATES,
  REQUIREMENT_RELATIONSHIPS,
  findRelatedRequirements,
  getComprehensiveSuggestions,
  getPatternBasedSuggestions,
  findMatchingTemplates,
  applyTemplate,
  getUnfilledPlaceholders,
  batchAutoPopulate,
  getAutoPopulatableRequirements
}
