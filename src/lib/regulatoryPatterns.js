/**
 * regulatoryPatterns.js
 * Regulatory Pattern Library for Universal Compliance Assistance
 *
 * This library contains compliance patterns learned from regulatory frameworks
 * (primarily Transport Canada SFOC matrices) that can be applied to ANY
 * compliance document - client prequalifications, insurance forms, audits, etc.
 *
 * The patterns help the assistant understand:
 * - What categories of questions regulators/clients ask
 * - What evidence typically satisfies requirements
 * - How to map between different compliance frameworks
 *
 * @location src/lib/regulatoryPatterns.js
 */

// ============================================
// REGULATORY REFERENCE DEFINITIONS
// ============================================

/**
 * Canadian Aviation Regulations (CARs) relevant to RPAS operations
 * These define what regulators are looking for when they cite a reference
 */
export const REGULATORY_REFERENCES = {
  // Part 9 - RPAS Operations
  'CAR 900': {
    id: 'CAR 900',
    title: 'RPAS General',
    description: 'General provisions for remotely piloted aircraft systems',
    category: 'general',
    topics: ['definitions', 'applicability', 'general requirements']
  },
  'CAR 901': {
    id: 'CAR 901',
    title: 'RPAS Registration and Marking',
    description: 'Requirements for registering and marking RPAS',
    category: 'equipment',
    topics: ['registration', 'marking', 'identification']
  },
  'CAR 901.01': {
    id: 'CAR 901.01',
    title: 'Registration Requirements',
    description: 'RPAS must be registered before operation',
    category: 'equipment',
    topics: ['registration'],
    evidenceTypes: ['registration certificate', 'TC registration number']
  },
  'CAR 901.02': {
    id: 'CAR 901.02',
    title: 'Marking Requirements',
    description: 'RPAS must display registration markings',
    category: 'equipment',
    topics: ['marking', 'identification'],
    evidenceTypes: ['photos of markings', 'marking procedure']
  },
  'CAR 901.29': {
    id: 'CAR 901.29',
    title: 'Advanced Operations - General',
    description: 'Requirements for advanced RPAS operations',
    category: 'operations',
    topics: ['advanced operations', 'controlled airspace', 'proximity to people']
  },
  'CAR 901.48': {
    id: 'CAR 901.48',
    title: 'Maintenance Requirements',
    description: 'RPAS maintenance and airworthiness requirements',
    category: 'equipment',
    topics: ['maintenance', 'airworthiness', 'inspection'],
    evidenceTypes: ['maintenance program', 'inspection checklists', 'maintenance logs']
  },
  'CAR 901.54': {
    id: 'CAR 901.54',
    title: 'Pilot Certificate - Advanced',
    description: 'Advanced RPAS pilot certificate requirements',
    category: 'crew',
    topics: ['pilot certification', 'qualifications', 'training'],
    evidenceTypes: ['pilot certificate', 'training records', 'recency']
  },
  'CAR 901.55': {
    id: 'CAR 901.55',
    title: 'Pilot Certificate - Basic',
    description: 'Basic RPAS pilot certificate requirements',
    category: 'crew',
    topics: ['pilot certification', 'basic operations']
  },
  'CAR 901.70': {
    id: 'CAR 901.70',
    title: 'Flight Crew Training',
    description: 'Training requirements for RPAS flight crew',
    category: 'crew',
    topics: ['training', 'competency', 'currency'],
    evidenceTypes: ['training records', 'competency assessments', 'recency logs']
  },
  'CAR 903': {
    id: 'CAR 903',
    title: 'Special Flight Operations Certificate',
    description: 'SFOC requirements for complex RPAS operations',
    category: 'operations',
    topics: ['SFOC', 'special operations', 'risk mitigation']
  },
  'CAR 903.01': {
    id: 'CAR 903.01',
    title: 'SFOC Application Requirements',
    description: 'What must be included in an SFOC application',
    category: 'operations',
    topics: ['application', 'documentation requirements'],
    subParts: {
      'a': 'BVLOS operations',
      'b': 'Operations over 25kg MTOW',
      'c': 'Swarm operations',
      'd': 'Night operations',
      'e': 'Transport of dangerous goods',
      'f': 'Operations over people',
      'g': 'Autonomous operations',
      'h': 'First responder operations'
    }
  },
  'CAR 903.02': {
    id: 'CAR 903.02',
    title: 'SFOC Content Requirements',
    description: 'Detailed content requirements for SFOC applications',
    category: 'operations',
    topics: ['CONOPS', 'procedures', 'risk assessment'],
    subParts: {
      'd': { topic: 'CONOPS', description: 'Concept of operations - purpose, scope, method' },
      'e': { topic: 'Area', description: 'Operational area description and boundaries' },
      'f': { topic: 'Equipment', description: 'RPAS specifications and capabilities' },
      'g': { topic: 'C2 Link', description: 'Command and control link specifications' },
      'h': { topic: 'Navigation', description: 'Navigation and geo-fencing capabilities' },
      'i': { topic: 'Flight Planning', description: 'Flight planning procedures' },
      'j': { topic: 'Emergency', description: 'Emergency and contingency procedures' },
      'k': { topic: 'Weather', description: 'Weather minimums and monitoring' },
      'l': { topic: 'Crew', description: 'Crew qualifications and responsibilities' },
      'm': { topic: 'Communications', description: 'Communication procedures' },
      'n': { topic: 'Security', description: 'Security procedures' },
      'o': { topic: 'Third Party', description: 'Third party and property considerations' }
    }
  },

  // Advisory Circulars
  'AC 903-001': {
    id: 'AC 903-001',
    title: 'RPAS SORA Application',
    description: 'Guidance on applying SORA methodology for SFOC applications',
    category: 'operations',
    topics: ['SORA', 'risk assessment', 'SAIL', 'OSO', 'GRC', 'ARC'],
    evidenceTypes: ['SORA report', 'risk assessment', 'OSO compliance matrix']
  },
  'AC 901-001': {
    id: 'AC 901-001',
    title: 'RPAS Operations Guidance',
    description: 'General guidance for RPAS operations in Canada',
    category: 'operations',
    topics: ['operations', 'guidance', 'best practices']
  },

  // Staff Instructions
  'SI 623-001': {
    id: 'SI 623-001',
    title: 'RPAS Review Procedures',
    description: 'Transport Canada procedures for reviewing RPAS applications',
    category: 'operations',
    topics: ['review criteria', 'assessment']
  }
}

// ============================================
// COMPLIANCE CATEGORIES
// ============================================

/**
 * Standard compliance categories that appear across different frameworks
 * These help map between different compliance documents
 */
export const COMPLIANCE_CATEGORIES = {
  operations: {
    id: 'operations',
    name: 'Operations',
    description: 'Concept of operations, flight procedures, operational parameters',
    keywords: [
      'conops', 'concept of operations', 'operations', 'procedure', 'flight plan',
      'mission', 'purpose', 'scope', 'method', 'operational area', 'boundaries',
      'altitude', 'duration', 'frequency', 'vlos', 'bvlos', 'evlos'
    ],
    typicalRequirements: [
      'Description of operations purpose',
      'Operational area and boundaries',
      'Flight parameters (altitude, duration, frequency)',
      'Operational procedures',
      'Pre-flight and post-flight procedures'
    ],
    evidenceTypes: ['operations manual', 'CONOPS document', 'flight plans', 'SOPs']
  },

  equipment: {
    id: 'equipment',
    name: 'Equipment',
    description: 'Aircraft specifications, systems, maintenance, airworthiness',
    keywords: [
      'aircraft', 'rpas', 'uas', 'drone', 'equipment', 'specifications', 'specs',
      'manufacturer', 'model', 'serial', 'registration', 'c2 link', 'command',
      'control', 'navigation', 'gps', 'geo-fence', 'geofencing', 'payload',
      'sensor', 'camera', 'battery', 'propulsion', 'maintenance', 'inspection',
      'airworthiness', 'mtow', 'weight'
    ],
    typicalRequirements: [
      'Aircraft type and specifications',
      'Registration and markings',
      'C2 link specifications and redundancy',
      'Navigation and positioning systems',
      'Geo-fencing capabilities',
      'Payload and sensor specifications',
      'Maintenance program'
    ],
    evidenceTypes: [
      'manufacturer specs', 'registration certificate', 'maintenance logs',
      'inspection checklists', 'equipment list', 'C2 link specifications'
    ]
  },

  crew: {
    id: 'crew',
    name: 'Crew',
    description: 'Pilot qualifications, training, medical, crew roles',
    keywords: [
      'pilot', 'crew', 'operator', 'rpic', 'pic', 'visual observer', 'vo',
      'spotter', 'certificate', 'certification', 'license', 'qualification',
      'training', 'competency', 'medical', 'recency', 'currency', 'experience',
      'hours', 'flight time'
    ],
    typicalRequirements: [
      'Pilot certification (Basic/Advanced)',
      'Training records and competency',
      'Medical requirements',
      'Currency and recency',
      'Flight experience',
      'Crew roles and responsibilities',
      'Visual observer qualifications'
    ],
    evidenceTypes: [
      'pilot certificate', 'training records', 'medical declaration',
      'flight logs', 'competency assessments', 'crew roster'
    ]
  },

  safety: {
    id: 'safety',
    name: 'Safety & Risk',
    description: 'Risk assessment, SORA, mitigations, safety management',
    keywords: [
      'safety', 'risk', 'hazard', 'assessment', 'sora', 'sail', 'oso',
      'grc', 'arc', 'ground risk', 'air risk', 'mitigation', 'sms',
      'safety management', 'incident', 'accident', 'reporting'
    ],
    typicalRequirements: [
      'Risk assessment methodology',
      'SORA analysis (if applicable)',
      'Ground risk class and mitigations',
      'Air risk class and mitigations',
      'Hazard identification',
      'Safety management system',
      'Incident reporting procedures'
    ],
    evidenceTypes: [
      'SORA report', 'risk assessment', 'hazard register',
      'safety management manual', 'incident reports'
    ]
  },

  emergency: {
    id: 'emergency',
    name: 'Emergency Procedures',
    description: 'Contingency plans, emergency response, abnormal operations',
    keywords: [
      'emergency', 'contingency', 'abnormal', 'lost link', 'fly-away', 'flyaway',
      'rth', 'return to home', 'failure', 'malfunction', 'abort', 'terminate',
      'crash', 'incident', 'first aid', 'medical emergency', 'fire'
    ],
    typicalRequirements: [
      'Lost link procedures',
      'Fly-away procedures',
      'Low battery emergency procedures',
      'Weather deterioration procedures',
      'Medical emergency procedures',
      'Emergency contacts',
      'Abort/terminate procedures'
    ],
    evidenceTypes: [
      'emergency procedures document', 'contingency plans',
      'emergency contact list', 'emergency checklists'
    ]
  },

  communications: {
    id: 'communications',
    name: 'Communications',
    description: 'Crew communications, ATC coordination, radio procedures',
    keywords: [
      'communication', 'radio', 'frequency', 'atc', 'air traffic', 'nav canada',
      'notam', 'coordination', 'phraseology', 'check-in', 'transponder'
    ],
    typicalRequirements: [
      'Crew communication methods',
      'ATC coordination procedures',
      'Radio frequencies and monitoring',
      'NOTAM procedures',
      'Communication equipment',
      'Standard phraseology'
    ],
    evidenceTypes: [
      'communication procedures', 'radio licenses',
      'ATC coordination letters', 'NOTAM examples'
    ]
  },

  airspace: {
    id: 'airspace',
    name: 'Airspace',
    description: 'Airspace classification, authorizations, deconfliction',
    keywords: [
      'airspace', 'controlled', 'uncontrolled', 'class', 'cyz', 'restricted',
      'prohibited', 'advisory', 'authorization', 'clearance', 'notam',
      'nav canada', 'deconfliction', 'see and avoid', 'detect and avoid', 'daa'
    ],
    typicalRequirements: [
      'Airspace classification at operational area',
      'Airspace authorization (if required)',
      'Deconfliction procedures',
      'NOTAM requirements',
      'See-and-avoid or DAA procedures'
    ],
    evidenceTypes: [
      'airspace authorization', 'airspace charts',
      'NAV CANADA coordination', 'NOTAM procedures'
    ]
  },

  weather: {
    id: 'weather',
    name: 'Weather',
    description: 'Weather minimums, monitoring, limitations',
    keywords: [
      'weather', 'visibility', 'ceiling', 'cloud', 'wind', 'gust', 'rain',
      'snow', 'precipitation', 'temperature', 'icing', 'metar', 'taf',
      'forecast', 'minimums', 'limitations'
    ],
    typicalRequirements: [
      'Weather minimums (visibility, ceiling, wind)',
      'Weather information sources',
      'Pre-flight weather assessment',
      'Continuous weather monitoring',
      'Weather abort criteria'
    ],
    evidenceTypes: [
      'weather minimums document', 'weather briefing procedures',
      'weather sources list'
    ]
  },

  insurance: {
    id: 'insurance',
    name: 'Insurance',
    description: 'Liability insurance, coverage requirements',
    keywords: [
      'insurance', 'liability', 'coverage', 'policy', 'certificate',
      'indemnity', 'premium', 'claim'
    ],
    typicalRequirements: [
      'Liability insurance coverage amount',
      'Policy details and endorsements',
      'Certificate of insurance'
    ],
    evidenceTypes: ['insurance certificate', 'policy document', 'endorsements']
  },

  security: {
    id: 'security',
    name: 'Security',
    description: 'Physical security, data security, access control',
    keywords: [
      'security', 'access', 'control', 'data', 'privacy', 'encryption',
      'storage', 'transport', 'sensitive', 'restricted'
    ],
    typicalRequirements: [
      'Physical security of equipment',
      'Data handling and privacy',
      'Access control procedures',
      'Sensitive area procedures'
    ],
    evidenceTypes: ['security procedures', 'data handling policy', 'access logs']
  },

  documentation: {
    id: 'documentation',
    name: 'Documentation',
    description: 'Records, logs, manuals, reporting',
    keywords: [
      'document', 'record', 'log', 'manual', 'report', 'filing', 'retention',
      'audit', 'review', 'version', 'control'
    ],
    typicalRequirements: [
      'Operations manual',
      'Flight logs',
      'Maintenance records',
      'Training records',
      'Incident reports',
      'Record retention periods'
    ],
    evidenceTypes: [
      'operations manual', 'flight logs', 'maintenance logs',
      'training records', 'document control procedures'
    ]
  }
}

// ============================================
// EVIDENCE PATTERNS
// ============================================

/**
 * Evidence patterns define what types of documentation typically
 * satisfy different categories of requirements
 */
export const EVIDENCE_PATTERNS = {
  // Operations evidence
  conops: {
    id: 'conops',
    name: 'Concept of Operations',
    description: 'Document describing operational purpose, scope, and method',
    satisfies: ['operations', 'CAR 903.02(d)'],
    keywords: ['conops', 'concept', 'operations', 'purpose', 'scope'],
    sourceTypes: ['operations manual', 'project document', 'CONOPS']
  },

  operationsManual: {
    id: 'operationsManual',
    name: 'Operations Manual',
    description: 'Comprehensive manual covering all operational procedures',
    satisfies: ['operations', 'procedures', 'emergency', 'crew'],
    keywords: ['operations manual', 'ops manual', 'procedures'],
    sourceTypes: ['policy']
  },

  // Equipment evidence
  manufacturerSpecs: {
    id: 'manufacturerSpecs',
    name: 'Manufacturer Specifications',
    description: 'Official specifications from aircraft manufacturer',
    satisfies: ['equipment', 'CAR 903.02(f)'],
    keywords: ['specifications', 'specs', 'manufacturer', 'datasheet'],
    sourceTypes: ['equipment', 'upload']
  },

  registrationCertificate: {
    id: 'registrationCertificate',
    name: 'Registration Certificate',
    description: 'Transport Canada registration certificate for RPAS',
    satisfies: ['equipment', 'CAR 901.01'],
    keywords: ['registration', 'certificate', 'TC'],
    sourceTypes: ['equipment', 'upload']
  },

  maintenanceProgram: {
    id: 'maintenanceProgram',
    name: 'Maintenance Program',
    description: 'Documented maintenance schedule and procedures',
    satisfies: ['equipment', 'CAR 901.48'],
    keywords: ['maintenance', 'inspection', 'schedule', 'program'],
    sourceTypes: ['policy', 'equipment']
  },

  // Crew evidence
  pilotCertificate: {
    id: 'pilotCertificate',
    name: 'Pilot Certificate',
    description: 'Transport Canada RPAS pilot certificate',
    satisfies: ['crew', 'CAR 901.54', 'CAR 901.55'],
    keywords: ['certificate', 'pilot', 'license', 'qualification'],
    sourceTypes: ['crew', 'upload']
  },

  trainingRecords: {
    id: 'trainingRecords',
    name: 'Training Records',
    description: 'Documentation of pilot training and competency',
    satisfies: ['crew', 'CAR 901.70'],
    keywords: ['training', 'competency', 'records', 'qualification'],
    sourceTypes: ['crew', 'upload']
  },

  // Safety evidence
  soraReport: {
    id: 'soraReport',
    name: 'SORA Report',
    description: 'Specific Operations Risk Assessment per JARUS methodology',
    satisfies: ['safety', 'AC 903-001', 'risk'],
    keywords: ['sora', 'risk assessment', 'sail', 'oso', 'grc', 'arc'],
    sourceTypes: ['project', 'upload']
  },

  riskAssessment: {
    id: 'riskAssessment',
    name: 'Risk Assessment',
    description: 'Hazard identification and risk mitigation documentation',
    satisfies: ['safety', 'risk'],
    keywords: ['risk', 'hazard', 'assessment', 'mitigation'],
    sourceTypes: ['project', 'policy']
  },

  // Emergency evidence
  emergencyProcedures: {
    id: 'emergencyProcedures',
    name: 'Emergency Procedures',
    description: 'Documented contingency and emergency response procedures',
    satisfies: ['emergency', 'CAR 903.02(j)'],
    keywords: ['emergency', 'contingency', 'procedures', 'response'],
    sourceTypes: ['policy', 'operations manual']
  },

  // Insurance evidence
  insuranceCertificate: {
    id: 'insuranceCertificate',
    name: 'Insurance Certificate',
    description: 'Certificate of insurance showing liability coverage',
    satisfies: ['insurance'],
    keywords: ['insurance', 'certificate', 'liability', 'coverage'],
    sourceTypes: ['upload']
  }
}

// ============================================
// PATTERN MATCHING ENGINE
// ============================================

/**
 * Analyze text to identify compliance categories and patterns
 * @param {string} text - Text to analyze (requirement, question, etc.)
 * @returns {Object} Analysis results with matched categories, refs, and evidence
 */
export function analyzeComplianceText(text) {
  const textLower = text.toLowerCase()
  const results = {
    categories: [],
    regulatoryRefs: [],
    evidenceTypes: [],
    keywords: [],
    confidence: 0
  }

  // Match categories
  for (const [categoryId, category] of Object.entries(COMPLIANCE_CATEGORIES)) {
    const matchedKeywords = category.keywords.filter(kw => textLower.includes(kw))
    if (matchedKeywords.length > 0) {
      results.categories.push({
        id: categoryId,
        name: category.name,
        matchedKeywords,
        score: matchedKeywords.length / category.keywords.length
      })
      results.keywords.push(...matchedKeywords)
    }
  }

  // Extract regulatory references
  const regRefPatterns = [
    /CAR\s*(\d{3}(?:\.\d{2})?(?:\s*\([a-z]\))?)/gi,
    /AC\s*(\d{3}-\d{3})/gi,
    /SI\s*(\d{3}-\d{3})/gi
  ]

  for (const pattern of regRefPatterns) {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      const ref = match[0].toUpperCase().replace(/\s+/g, ' ')
      if (!results.regulatoryRefs.includes(ref)) {
        results.regulatoryRefs.push(ref)
      }
    }
  }

  // Match evidence patterns
  for (const [evidenceId, evidence] of Object.entries(EVIDENCE_PATTERNS)) {
    const matchedKeywords = evidence.keywords.filter(kw => textLower.includes(kw))
    if (matchedKeywords.length > 0) {
      results.evidenceTypes.push({
        id: evidenceId,
        name: evidence.name,
        matchedKeywords,
        score: matchedKeywords.length / evidence.keywords.length
      })
    }
  }

  // Sort by score
  results.categories.sort((a, b) => b.score - a.score)
  results.evidenceTypes.sort((a, b) => b.score - a.score)

  // Calculate overall confidence
  const categoryScore = results.categories.length > 0 ? results.categories[0].score : 0
  const evidenceScore = results.evidenceTypes.length > 0 ? results.evidenceTypes[0].score : 0
  const refScore = results.regulatoryRefs.length > 0 ? 0.3 : 0
  results.confidence = Math.min((categoryScore + evidenceScore + refScore) / 2, 1)

  return results
}

/**
 * Get suggested evidence types for a compliance category
 * @param {string} categoryId - Category ID
 * @returns {Array} Suggested evidence types
 */
export function getSuggestedEvidence(categoryId) {
  const category = COMPLIANCE_CATEGORIES[categoryId]
  if (!category) return []

  return Object.entries(EVIDENCE_PATTERNS)
    .filter(([, evidence]) => evidence.satisfies.includes(categoryId))
    .map(([id, evidence]) => ({
      id,
      name: evidence.name,
      description: evidence.description,
      sourceTypes: evidence.sourceTypes
    }))
}

/**
 * Get related regulatory references for a category
 * @param {string} categoryId - Category ID
 * @returns {Array} Related regulatory references
 */
export function getRelatedRegulations(categoryId) {
  return Object.entries(REGULATORY_REFERENCES)
    .filter(([, ref]) => ref.category === categoryId)
    .map(([id, ref]) => ({
      id,
      title: ref.title,
      description: ref.description,
      topics: ref.topics
    }))
}

/**
 * Map a requirement to suggested response content
 * @param {Object} requirement - Compliance requirement
 * @returns {Object} Mapping with categories, evidence, and suggestions
 */
export function mapRequirementToPatterns(requirement) {
  const text = [
    requirement.text,
    requirement.shortText,
    requirement.guidance,
    requirement.regulatoryRef
  ].filter(Boolean).join(' ')

  const analysis = analyzeComplianceText(text)

  // Get primary category
  const primaryCategory = analysis.categories[0] || null

  // Get suggested evidence
  const suggestedEvidence = primaryCategory
    ? getSuggestedEvidence(primaryCategory.id)
    : []

  // Get response hints based on category
  const responseHints = primaryCategory
    ? COMPLIANCE_CATEGORIES[primaryCategory.id]?.typicalRequirements || []
    : []

  // Get related regulations
  const relatedRegs = primaryCategory
    ? getRelatedRegulations(primaryCategory.id)
    : []

  return {
    analysis,
    primaryCategory,
    suggestedEvidence,
    responseHints,
    relatedRegs,
    // Knowledge base search terms
    searchTerms: [
      ...analysis.keywords.slice(0, 5),
      ...(analysis.regulatoryRefs || [])
    ]
  }
}

// ============================================
// CROSS-FRAMEWORK MAPPING
// ============================================

/**
 * Common compliance questions mapped to categories
 * This helps recognize similar questions across different frameworks
 */
export const COMMON_COMPLIANCE_QUESTIONS = {
  // Operations questions
  'purpose_of_operations': {
    patterns: [
      'purpose of the operation',
      'describe the operation',
      'what operations will be conducted',
      'nature of the work',
      'scope of operations'
    ],
    category: 'operations',
    regulatoryRef: 'CAR 903.02(d)',
    evidenceType: 'conops'
  },
  'operational_area': {
    patterns: [
      'operational area',
      'area of operations',
      'geographic area',
      'location',
      'where will operations'
    ],
    category: 'operations',
    regulatoryRef: 'CAR 903.02(e)',
    evidenceType: 'operationsManual'
  },
  'flight_parameters': {
    patterns: [
      'altitude',
      'flight parameters',
      'how high',
      'maximum height',
      'flight duration'
    ],
    category: 'operations',
    evidenceType: 'conops'
  },

  // Equipment questions
  'aircraft_type': {
    patterns: [
      'aircraft type',
      'what aircraft',
      'rpas used',
      'drone model',
      'equipment list'
    ],
    category: 'equipment',
    regulatoryRef: 'CAR 903.02(f)',
    evidenceType: 'manufacturerSpecs'
  },
  'c2_link': {
    patterns: [
      'command and control',
      'c2 link',
      'control link',
      'communication link',
      'lost link'
    ],
    category: 'equipment',
    regulatoryRef: 'CAR 903.02(g)',
    evidenceType: 'manufacturerSpecs'
  },

  // Crew questions
  'pilot_qualifications': {
    patterns: [
      'pilot qualifications',
      'pilot certificate',
      'who will operate',
      'crew qualifications',
      'certified pilot'
    ],
    category: 'crew',
    regulatoryRef: 'CAR 901.54',
    evidenceType: 'pilotCertificate'
  },
  'training': {
    patterns: [
      'training',
      'competency',
      'how are pilots trained',
      'training program',
      'training records'
    ],
    category: 'crew',
    regulatoryRef: 'CAR 901.70',
    evidenceType: 'trainingRecords'
  },

  // Safety questions
  'risk_assessment': {
    patterns: [
      'risk assessment',
      'risk analysis',
      'hazard',
      'sora',
      'how do you assess risk'
    ],
    category: 'safety',
    regulatoryRef: 'AC 903-001',
    evidenceType: 'soraReport'
  },

  // Emergency questions
  'emergency_procedures': {
    patterns: [
      'emergency',
      'contingency',
      'what if',
      'failure',
      'malfunction',
      'lost link procedure'
    ],
    category: 'emergency',
    regulatoryRef: 'CAR 903.02(j)',
    evidenceType: 'emergencyProcedures'
  },

  // Insurance questions
  'insurance_coverage': {
    patterns: [
      'insurance',
      'liability',
      'coverage',
      'insured',
      'policy'
    ],
    category: 'insurance',
    evidenceType: 'insuranceCertificate'
  }
}

/**
 * Find matching common question pattern
 * @param {string} text - Question or requirement text
 * @returns {Object|null} Matched question pattern or null
 */
export function findMatchingQuestionPattern(text) {
  const textLower = text.toLowerCase()

  for (const [questionId, question] of Object.entries(COMMON_COMPLIANCE_QUESTIONS)) {
    const matchedPatterns = question.patterns.filter(p => textLower.includes(p))
    if (matchedPatterns.length > 0) {
      return {
        id: questionId,
        ...question,
        matchedPatterns,
        confidence: matchedPatterns.length / question.patterns.length
      }
    }
  }

  return null
}

// ============================================
// EXPORT
// ============================================

export default {
  REGULATORY_REFERENCES,
  COMPLIANCE_CATEGORIES,
  EVIDENCE_PATTERNS,
  COMMON_COMPLIANCE_QUESTIONS,
  analyzeComplianceText,
  getSuggestedEvidence,
  getRelatedRegulations,
  mapRequirementToPatterns,
  findMatchingQuestionPattern
}
