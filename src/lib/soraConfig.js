import { logger } from './logger'

// ============================================
// SORA 2.5 Configuration
// JARUS SORA 2.5 Compliant
//
// AUDIT LOG:
// - 2026-01-19: Full audit against JARUS documents
//   - Added missing OSOs: 10, 11, 12, 21, 22
//   - Verified iGRC matrix (Table 2)
//   - Verified SAIL matrix (Table 7)
//   - Verified ground mitigations (Annex B)
//   - OSOs 14, 15 intentionally omitted (removed in SORA 2.5)
//
// Reference Documents:
// - JAR_doc_25: SORA 2.5 Main Body
// - JAR_doc_26: Annex A - ConOps Template
// - JAR_doc_27: Annex B - Ground Risk Mitigations
// - JAR_doc_28: Annex E - OSO Requirements
// ============================================

// ============================================
// POPULATION CATEGORIES (Table 3 descriptors)
// ============================================
export const populationCategories = {
  controlled: { 
    label: 'Controlled Ground Area', 
    density: 0,
    description: 'Areas controlled where unauthorized people are not allowed to enter'
  },
  remote: { 
    label: 'Remote (< 5 ppl/km²)', 
    density: 5,
    description: 'Areas where people may be, such as forests, deserts, large farm parcels'
  },
  lightly: { 
    label: 'Lightly Populated (< 50 ppl/km²)', 
    density: 50,
    description: 'Areas of small farms, residential areas with very large lots (~4 acres)'
  },
  sparsely: { 
    label: 'Sparsely Populated (< 500 ppl/km²)', 
    density: 500,
    description: 'Areas of homes and small businesses with large lot sizes (~1 acre)'
  },
  suburban: { 
    label: 'Suburban (< 5,000 ppl/km²)', 
    density: 5000,
    description: 'Single-family homes on small lots, apartment complexes, commercial buildings'
  },
  highdensity: { 
    label: 'High Density Metro (< 50,000 ppl/km²)', 
    density: 50000,
    description: 'Areas of mostly large multistory buildings, downtown areas'
  },
  assembly: { 
    label: 'Assembly of People (> 50,000 ppl/km²)', 
    density: 100000,
    description: 'Large gatherings such as professional sporting events, large concerts'
  }
}

// ============================================
// UA CHARACTERISTICS (Table 2 columns)
// ============================================
export const uaCharacteristics = {
  '1m_25ms': { 
    label: '≤1m / ≤25 m/s', 
    maxDimension: 1, 
    maxSpeed: 25,
    description: 'Small consumer drones'
  },
  '3m_35ms': { 
    label: '≤3m / ≤35 m/s', 
    maxDimension: 3, 
    maxSpeed: 35,
    description: 'Medium commercial UAS'
  },
  '8m_75ms': { 
    label: '≤8m / ≤75 m/s', 
    maxDimension: 8, 
    maxSpeed: 75,
    description: 'Large industrial UAS'
  },
  '20m_120ms': { 
    label: '≤20m / ≤120 m/s', 
    maxDimension: 20, 
    maxSpeed: 120,
    description: 'Large fixed-wing UAS'
  },
  '40m_200ms': { 
    label: '≤40m / ≤200 m/s', 
    maxDimension: 40, 
    maxSpeed: 200,
    description: 'Very large UAS'
  }
}

// ============================================
// INTRINSIC GRC MATRIX (SORA 2.5 Table 2)
// CORRECTED per JARUS JAR_doc_25 page 34
// Rows: Population, Columns: UA Characteristics
// Values: Intrinsic Ground Risk Class (1-10)
// null = outside SORA scope ("Not part of SORA")
// ============================================
export const intrinsicGRCMatrix = {
  //                   1m/25ms  3m/35ms  8m/75ms  20m/120ms  40m/200ms
  controlled: {
    '1m_25ms': 1,
    '3m_35ms': 1,
    '8m_75ms': 2,
    '20m_120ms': 3,
    '40m_200ms': 3
  },
  remote: {  // < 5 ppl/km²
    '1m_25ms': 2,
    '3m_35ms': 3,
    '8m_75ms': 4,
    '20m_120ms': 5,
    '40m_200ms': 6
  },
  lightly: {  // < 50 ppl/km²
    '1m_25ms': 3,
    '3m_35ms': 4,
    '8m_75ms': 5,
    '20m_120ms': 6,
    '40m_200ms': 7
  },
  sparsely: {  // < 500 ppl/km²
    '1m_25ms': 4,
    '3m_35ms': 5,
    '8m_75ms': 6,
    '20m_120ms': 7,
    '40m_200ms': 8
  },
  suburban: {  // < 5,000 ppl/km²
    '1m_25ms': 5,
    '3m_35ms': 6,
    '8m_75ms': 7,
    '20m_120ms': 8,
    '40m_200ms': 9
  },
  highdensity: {  // < 50,000 ppl/km²
    '1m_25ms': 6,
    '3m_35ms': 7,
    '8m_75ms': 8,
    '20m_120ms': 9,
    '40m_200ms': 10
  },
  assembly: {  // > 50,000 ppl/km²
    '1m_25ms': 7,
    '3m_35ms': 8,
    '8m_75ms': null,  // Not part of SORA
    '20m_120ms': null,
    '40m_200ms': null
  }
}

// ============================================
// GROUND RISK MITIGATIONS (Annex B Table 11)
// CORRECTED per JARUS JAR_doc_27 page 15
// Note: M3 (ERP) removed in SORA 2.5
// ============================================
export const groundMitigations = {
  M1A: {
    name: 'M1(A) - Strategic Mitigation: Sheltering',
    description: 'People on ground are sheltered by structures',
    reductions: {
      none: 0,
      low: -1,
      medium: -2
      // High: N/A - M1(A) only goes up to medium robustness
    },
    maxRobustness: 'medium',
    notes: 'Cannot be combined with M1(B) at medium robustness'
  },
  M1B: {
    name: 'M1(B) - Strategic Mitigation: Operational Restrictions',
    description: 'Spacetime-based restrictions reduce exposure',
    reductions: {
      none: 0,
      // Low: N/A - M1(B) starts at medium
      medium: -1,
      high: -2
    },
    minRobustness: 'medium',
    notes: 'Cannot be combined with M1(A) at medium robustness'
  },
  M1C: {
    name: 'M1(C) - Tactical Mitigation: Ground Observation',
    description: 'Observers can warn people in operational area',
    reductions: {
      none: 0,
      low: -1
      // Medium/High: N/A - M1(C) only provides low robustness
    },
    maxRobustness: 'low',
    notes: 'Limited to -1 reduction at low robustness only'
  },
  M2: {
    name: 'M2 - Effects of UA Impact Dynamics Reduced',
    description: 'Parachute, autorotation, or frangibility reduces impact energy',
    reductions: {
      none: 0,
      // Low: N/A - M2 starts at medium
      medium: -1,
      high: -2
    },
    minRobustness: 'medium',
    notes: 'Can claim additional reduction with demonstrated 3+ orders of magnitude risk reduction'
  }
  // M3 (ERP) REMOVED in SORA 2.5 - ERP is no longer a mitigation
}

// ============================================
// AIR RISK CLASSES (Figure 6)
// ============================================
export const arcLevels = {
  'ARC-a': {
    description: 'Atypical airspace (segregated, restricted)',
    encounters: 'Negligible',
    notes: 'Risk acceptably low without tactical mitigation'
  },
  'ARC-b': {
    description: 'Uncontrolled airspace, rural, low altitude',
    encounters: 'Low',
    notes: 'Typical for rural VLOS operations below 400ft'
  },
  'ARC-c': {
    description: 'Controlled airspace or urban uncontrolled',
    encounters: 'Medium',
    notes: 'Requires coordination with ANSP in controlled airspace'
  },
  'ARC-d': {
    description: 'Airport/heliport environment or high traffic',
    encounters: 'High',
    notes: 'Requires specific approval and coordination'
  }
}

// ============================================
// TMPR DEFINITIONS (Tactical Mitigation - Annex D)
// ============================================
export const tmprDefinitions = {
  VLOS: {
    description: 'Visual Line of Sight - See and avoid by remote pilot',
    arcReduction: 1,
    maxResidualARC: 'ARC-b',
    robustnessRequired: 'low'
  },
  EVLOS: {
    description: 'Extended VLOS - Visual observers provide separation',
    arcReduction: 1,
    maxResidualARC: 'ARC-b',
    robustnessRequired: 'low'
  },
  DAA: {
    description: 'Detect and Avoid system onboard',
    arcReduction: 2,
    maxResidualARC: 'ARC-a',
    robustnessRequired: 'medium'
  }
}

// ============================================
// SAIL MATRIX (SORA 2.5 Table 7)
// CORRECTED per JARUS JAR_doc_25 page 47
// Final GRC (rows) × Residual ARC (columns) = SAIL
// ============================================
export const sailMatrix = {
  // GRC ≤2 uses same row
  1: { 'ARC-a': 'I', 'ARC-b': 'II', 'ARC-c': 'IV', 'ARC-d': 'VI' },
  2: { 'ARC-a': 'I', 'ARC-b': 'II', 'ARC-c': 'IV', 'ARC-d': 'VI' },
  3: { 'ARC-a': 'II', 'ARC-b': 'II', 'ARC-c': 'IV', 'ARC-d': 'VI' },
  4: { 'ARC-a': 'III', 'ARC-b': 'III', 'ARC-c': 'IV', 'ARC-d': 'VI' },
  5: { 'ARC-a': 'IV', 'ARC-b': 'IV', 'ARC-c': 'IV', 'ARC-d': 'VI' },
  6: { 'ARC-a': 'V', 'ARC-b': 'V', 'ARC-c': 'V', 'ARC-d': 'VI' },
  7: { 'ARC-a': 'VI', 'ARC-b': 'VI', 'ARC-c': 'VI', 'ARC-d': 'VI' }
  // GRC > 7 is Category C (Certified) - outside SORA scope
}

// ============================================
// SAIL COLORS & DESCRIPTIONS
// ============================================
export const sailColors = {
  'I': 'bg-green-100 text-green-800 border-green-300',
  'II': 'bg-green-200 text-green-800 border-green-400',
  'III': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'IV': 'bg-orange-100 text-orange-800 border-orange-300',
  'V': 'bg-red-100 text-red-800 border-red-300',
  'VI': 'bg-red-200 text-red-900 border-red-400'
}

export const sailDescriptions = {
  'I': 'Lowest assurance - Declaration may be sufficient',
  'II': 'Low assurance - Standard operating procedures',
  'III': 'Medium assurance - Validated procedures required',
  'IV': 'Medium-High assurance - Comprehensive safety case',
  'V': 'High assurance - Extensive demonstration required',
  'VI': 'Highest assurance - Full airworthiness demonstration'
}

// ============================================
// ROBUSTNESS LEVELS
// ============================================
export const robustnessLevels = [
  { value: 'none', label: 'None', code: 'O' },
  { value: 'low', label: 'Low', code: 'L' },
  { value: 'medium', label: 'Medium', code: 'M' },
  { value: 'high', label: 'High', code: 'H' }
]

// ============================================
// CONTAINMENT ROBUSTNESS (Step #8)
// Based on adjacent area population & SAIL
// Simplified - actual requirements in Annex E
// ============================================
export const containmentRobustness = {
  controlled: {
    'I': 'low', 'II': 'low', 'III': 'low', 'IV': 'low', 'V': 'low', 'VI': 'medium'
  },
  remote: {
    'I': 'low', 'II': 'low', 'III': 'low', 'IV': 'low', 'V': 'low', 'VI': 'medium'
  },
  lightly: {
    'I': 'low', 'II': 'low', 'III': 'low', 'IV': 'low', 'V': 'medium', 'VI': 'medium'
  },
  sparsely: {
    'I': 'low', 'II': 'low', 'III': 'low', 'IV': 'medium', 'V': 'medium', 'VI': 'high'
  },
  suburban: {
    'I': 'low', 'II': 'low', 'III': 'medium', 'IV': 'medium', 'V': 'high', 'VI': 'high'
  },
  highdensity: {
    'I': 'low', 'II': 'medium', 'III': 'medium', 'IV': 'high', 'V': 'high', 'VI': 'high'
  },
  assembly: {
    'I': 'medium', 'II': 'medium', 'III': 'high', 'IV': 'high', 'V': 'high', 'VI': 'high'
  }
}

// ============================================
// CONTAINMENT METHODS (Step #8)
// Methods to ensure UAS stays within operational volume
// ============================================
export const containmentMethods = {
  none: {
    label: 'None',
    description: 'No specific containment measures',
    robustnessAchievable: 'none',
    evidenceRequired: []
  },
  procedural: {
    label: 'Procedural',
    description: 'Operational procedures and flight planning to stay within boundaries',
    robustnessAchievable: 'low',
    evidenceRequired: [
      'Flight planning procedures',
      'Boundary awareness training',
      'Visual reference points identified'
    ]
  },
  sw_geofence: {
    label: 'Software Geofencing',
    description: 'Software-based geofencing that alerts pilot when approaching boundaries',
    robustnessAchievable: 'medium',
    evidenceRequired: [
      'Geofence configuration documented',
      'Alert/warning system tested',
      'Pilot response procedures',
      'Geofence accuracy specifications'
    ]
  },
  hw_geofence: {
    label: 'Hardware Geofencing',
    description: 'Hardware-enforced geofencing with automatic position limiting',
    robustnessAchievable: 'medium',
    evidenceRequired: [
      'Hardware geofence specifications',
      'Independent position source',
      'Automatic boundary enforcement tested',
      'Failure mode analysis'
    ]
  },
  flight_termination: {
    label: 'Flight Termination System',
    description: 'Independent system to terminate flight if boundaries exceeded',
    robustnessAchievable: 'high',
    evidenceRequired: [
      'FTS specifications and design',
      'Independent trigger mechanism',
      'Demonstrated reliability data',
      'Testing and verification records',
      'Activation criteria defined'
    ]
  },
  parachute_fts: {
    label: 'Parachute + Flight Termination',
    description: 'Flight termination with parachute recovery system',
    robustnessAchievable: 'high',
    evidenceRequired: [
      'Parachute specifications',
      'Combined FTS + parachute testing',
      'Descent rate and footprint analysis',
      'Reliability demonstration',
      'Activation altitude requirements'
    ]
  }
}

// ============================================
// ADJACENT AREA ASSESSMENT GUIDANCE
// ============================================
export const adjacentAreaGuidance = {
  sameOrLower: {
    label: 'Same or Lower Population',
    description: 'Adjacent area has same or lower population density than operational area',
    action: 'No additional containment required beyond operational requirements'
  },
  higher: {
    label: 'Higher Population',
    description: 'Adjacent area has higher population density than operational area',
    action: 'Must demonstrate containment OR use higher population category for GRC'
  }
}

// ============================================
// OSO CATEGORIES (SORA 2.5 Table 14)
// ============================================
export const osoCategories = {
  technical: { 
    label: 'Technical Issue with UAS', 
    osos: ['OSO-01', 'OSO-02', 'OSO-03', 'OSO-04', 'OSO-05', 'OSO-06', 'OSO-07', 'OSO-10', 'OSO-11'] 
  },
  external: { 
    label: 'Deterioration of External Systems', 
    osos: ['OSO-08', 'OSO-13'] 
  },
  human: { 
    label: 'Human Error', 
    osos: ['OSO-09', 'OSO-12', 'OSO-16', 'OSO-17', 'OSO-18', 'OSO-19', 'OSO-20'] 
  },
  operating: { 
    label: 'Adverse Operating Conditions', 
    osos: ['OSO-21', 'OSO-22', 'OSO-23', 'OSO-24'] 
  }
}

// ============================================
// ============================================
// OSO DEFINITIONS WITH REQUIREMENTS BY SAIL
// CORRECTED per JARUS SORA 2.5 Table 14
// O = Optional (not required to show compliance)
// L = Low robustness, M = Medium, H = High
// 
// Evidence Guidance added for each robustness level
// ============================================
export const osoDefinitions = [
  // Technical Issue with UAS
  { 
    id: 'OSO-01', 
    category: 'technical', 
    name: 'Ensure the Operator is competent and/or proven', 
    description: 'Operator demonstrates competency for the operation',
    requirements: { 'I': 'O', 'II': 'L', 'III': 'M', 'IV': 'H', 'V': 'H', 'VI': 'H' },
    responsibility: 'operator',
    evidenceGuidance: {
      low: ['Pilot certificate/license', 'Basic flight training records', 'Operator registration'],
      medium: ['Recurrent training records', 'Type-specific training', 'Competency assessments', 'Operations manual'],
      high: ['Third-party competency verification', 'Audited training program', 'Continuous assessment program']
    }
  },
  { 
    id: 'OSO-02', 
    category: 'technical', 
    name: 'UAS manufactured by competent and/or proven entity',
    description: 'Manufacturer has documented quality and design processes',
    requirements: { 'I': 'O', 'II': 'O', 'III': 'L', 'IV': 'M', 'V': 'H', 'VI': 'H' },
    responsibility: 'designer',
    evidenceGuidance: {
      low: ['Manufacturer declaration', 'Basic product documentation'],
      medium: ['ISO 9001 or equivalent QMS certification', 'Design documentation'],
      high: ['Aviation authority approved design organization', 'Full design assurance']
    }
  },
  { 
    id: 'OSO-03', 
    category: 'technical', 
    name: 'UAS maintained by competent and/or proven entity',
    description: 'Maintenance performed by trained personnel per procedures',
    requirements: { 'I': 'L', 'II': 'L', 'III': 'M', 'IV': 'M', 'V': 'H', 'VI': 'H' },
    responsibility: 'operator',
    evidenceGuidance: {
      low: ['Maintenance log', 'Basic maintenance training records'],
      medium: ['Documented maintenance program', 'Certified maintenance personnel', 'Maintenance tracking system'],
      high: ['Approved maintenance organization', 'Audited maintenance program', 'Component tracking']
    }
  },
  { 
    id: 'OSO-04', 
    category: 'technical', 
    name: 'UAS developed to Airworthiness Design Standard (ADS)',
    description: 'UAS components essential to safe ops designed to ADS',
    requirements: { 'I': 'O', 'II': 'O', 'III': 'O', 'IV': 'L', 'V': 'M', 'VI': 'H' },
    responsibility: 'designer',
    evidenceGuidance: {
      low: ['Reference to industry standards used', 'Basic design documentation'],
      medium: ['Compliance matrix to recognized standard', 'Design verification evidence'],
      high: ['Full airworthiness certification', 'Type certificate or equivalent']
    }
  },
  { 
    id: 'OSO-05', 
    category: 'technical', 
    name: 'UAS designed considering system safety and reliability',
    description: 'System safety and reliability analysis performed',
    requirements: { 'I': 'O', 'II': 'O', 'III': 'L', 'IV': 'M', 'V': 'H', 'VI': 'H' },
    responsibility: 'designer',
    evidenceGuidance: {
      low: ['Basic hazard identification', 'Manufacturer reliability data'],
      medium: ['Functional Hazard Analysis (FHA)', 'FMEA or equivalent', 'Reliability targets defined'],
      high: ['Full safety assessment per ARP4761 or equivalent', 'Demonstrated reliability data']
    }
  },
  { 
    id: 'OSO-06', 
    category: 'technical', 
    name: 'C3 link characteristics appropriate for operation',
    description: 'Command, control, communication link meets operational needs',
    requirements: { 'I': 'O', 'II': 'L', 'III': 'L', 'IV': 'M', 'V': 'H', 'VI': 'H' },
    responsibility: 'designer',
    evidenceGuidance: {
      low: ['C3 link specifications', 'Range and latency data', 'Basic link testing'],
      medium: ['Link budget analysis', 'Interference assessment', 'Link loss procedures'],
      high: ['Certified C3 link performance', 'Redundant link capability', 'Full spectrum analysis']
    }
  },
  { 
    id: 'OSO-07', 
    category: 'technical', 
    name: 'Conformity check of UAS configuration',
    description: 'Inspection of UAS to ensure condition for safe operation',
    requirements: { 'I': 'L', 'II': 'L', 'III': 'M', 'IV': 'M', 'V': 'H', 'VI': 'H' },
    responsibility: 'operator',
    evidenceGuidance: {
      low: ['Pre-flight checklist', 'Visual inspection records'],
      medium: ['Configuration control log', 'Software version verification', 'Component tracking'],
      high: ['Independent conformity inspection', 'Airworthiness release documentation']
    }
  },
  
  // Operations & Procedures
  { 
    id: 'OSO-08', 
    category: 'external', 
    name: 'Operational procedures defined, validated and adhered to',
    description: 'Procedures exist, are validated, and crew adheres to them',
    requirements: { 'I': 'L', 'II': 'M', 'III': 'H', 'IV': 'H', 'V': 'H', 'VI': 'H' },
    responsibility: 'operator',
    evidenceGuidance: {
      low: ['Basic operating procedures', 'Emergency procedures documented'],
      medium: ['Validated operations manual', 'Procedure compliance records', 'Crew briefing records'],
      high: ['Third-party validated procedures', 'Audited procedure compliance', 'Continuous improvement process']
    }
  },
  { 
    id: 'OSO-09', 
    category: 'human', 
    name: 'Remote crew trained and current',
    description: 'Crew training for normal and emergency procedures',
    requirements: { 'I': 'L', 'II': 'L', 'III': 'M', 'IV': 'M', 'V': 'H', 'VI': 'H' },
    responsibility: 'operator',
    evidenceGuidance: {
      low: ['Initial training records', 'Currency requirements met'],
      medium: ['Recurrent training program', 'Emergency procedure training', 'Competency checks'],
      high: ['Simulator-based training', 'Third-party assessed competency', 'CRM training']
    }
  },
  { 
    id: 'OSO-10', 
    category: 'technical', 
    name: 'Safe recovery from technical issue',
    description: 'Procedures exist to safely recover from a technical failure',
    requirements: { 'I': 'L', 'II': 'L', 'III': 'M', 'IV': 'M', 'V': 'H', 'VI': 'H' },
    responsibility: 'operator',
    evidenceGuidance: {
      low: ['Emergency landing procedures', 'Basic failure response procedures'],
      medium: ['Failure mode procedures', 'Recovery training evidence', 'Tested contingency procedures'],
      high: ['Automatic safe recovery systems', 'Demonstrated recovery capability', 'Validated through testing']
    }
  },
  { 
    id: 'OSO-11', 
    category: 'technical', 
    name: 'Safe recovery from C3 link issues',
    description: 'Procedures and systems to recover from communication failures',
    requirements: { 'I': 'L', 'II': 'L', 'III': 'M', 'IV': 'M', 'V': 'H', 'VI': 'H' },
    responsibility: 'operator',
    evidenceGuidance: {
      low: ['Link loss procedures', 'Return-to-home settings documented'],
      medium: ['Automatic link loss behavior tested', 'Backup C3 procedures', 'Training on link loss'],
      high: ['Redundant C3 link', 'Demonstrated safe behavior on link loss', 'Certified link loss response']
    }
  },
  { 
    id: 'OSO-12', 
    category: 'human', 
    name: 'Remote crew trained to handle technical emergencies',
    description: 'Crew competent to manage technical failures and degraded modes',
    requirements: { 'I': 'L', 'II': 'L', 'III': 'M', 'IV': 'M', 'V': 'H', 'VI': 'H' },
    responsibility: 'operator',
    evidenceGuidance: {
      low: ['Emergency procedure training records', 'Basic troubleshooting capability'],
      medium: ['Scenario-based emergency training', 'Regular drills conducted', 'Assessment records'],
      high: ['Simulator training for emergencies', 'Third-party competency verification', 'Stress training']
    }
  },
  
  // External Systems
  { 
    id: 'OSO-13', 
    category: 'external', 
    name: 'External services supporting UAS operations are adequate',
    description: 'CNS, UTM, weather services adequate for operation',
    requirements: { 'I': 'L', 'II': 'L', 'III': 'M', 'IV': 'H', 'V': 'H', 'VI': 'H' },
    responsibility: 'operator',
    evidenceGuidance: {
      low: ['Weather source identified', 'NOTAM check process', 'Basic communication plan'],
      medium: ['Validated weather services', 'UTM integration where required', 'ATC coordination procedures'],
      high: ['Certified external service providers', 'Redundant services', 'SLA with service providers']
    }
  },
  
  // Human Factors
  { 
    id: 'OSO-16', 
    category: 'human', 
    name: 'Multi-crew coordination',
    description: 'Coordination between multiple crew members',
    requirements: { 'I': 'L', 'II': 'L', 'III': 'M', 'IV': 'M', 'V': 'H', 'VI': 'H' },
    responsibility: 'operator',
    evidenceGuidance: {
      low: ['Defined crew roles', 'Basic communication procedures'],
      medium: ['CRM principles applied', 'Briefing/debriefing procedures', 'Team training'],
      high: ['Formal CRM training', 'Crew composition requirements', 'Third-party assessed coordination']
    }
  },
  { 
    id: 'OSO-17', 
    category: 'human', 
    name: 'Remote crew fit to operate',
    description: 'Crew fitness-for-duty (medical, fatigue, substances)',
    requirements: { 'I': 'L', 'II': 'L', 'III': 'M', 'IV': 'M', 'V': 'H', 'VI': 'H' },
    responsibility: 'operator',
    evidenceGuidance: {
      low: ['Self-declaration of fitness', 'Basic fitness requirements documented'],
      medium: ['Medical certificate', 'Fatigue management policy', 'Substance policy'],
      high: ['Aviation medical certificate', 'Fatigue risk management system', 'Random testing program']
    }
  },
  { 
    id: 'OSO-18', 
    category: 'human', 
    name: 'Automatic protection of flight envelope from human error',
    description: 'Automatic systems prevent exceeding flight envelope',
    requirements: { 'I': 'O', 'II': 'O', 'III': 'L', 'IV': 'M', 'V': 'H', 'VI': 'H' },
    responsibility: 'designer',
    evidenceGuidance: {
      low: ['Basic geofencing capability', 'Altitude limits implemented'],
      medium: ['Validated envelope protection', 'Tested limit functions', 'Override procedures'],
      high: ['Certified flight envelope protection', 'Independent monitoring', 'Full automation testing']
    }
  },
  { 
    id: 'OSO-19', 
    category: 'human', 
    name: 'Safe recovery from human error',
    description: 'Procedures and systems for recovery from human error',
    requirements: { 'I': 'O', 'II': 'O', 'III': 'L', 'IV': 'M', 'V': 'M', 'VI': 'H' },
    responsibility: 'designer',
    evidenceGuidance: {
      low: ['Basic error recovery procedures', 'Undo/cancel functions'],
      medium: ['Error-tolerant interface design', 'Recovery mode procedures', 'Training on error recovery'],
      high: ['Formal HMI assessment', 'Demonstrated error recovery capability', 'Independent verification']
    }
  },
  { 
    id: 'OSO-20', 
    category: 'human', 
    name: 'Human Factors evaluation performed, HMI appropriate',
    description: 'HMI assessed and found appropriate for the mission',
    requirements: { 'I': 'O', 'II': 'L', 'III': 'L', 'IV': 'M', 'V': 'M', 'VI': 'H' },
    responsibility: 'designer',
    evidenceGuidance: {
      low: ['Basic HMI description', 'User feedback considered'],
      medium: ['HMI assessment performed', 'Workload analysis', 'Usability testing'],
      high: ['Formal HF evaluation per standards', 'Independent HMI assessment', 'Certified HMI design']
    }
  },
  { 
    id: 'OSO-21', 
    category: 'operating', 
    name: 'Automatic protection of flight envelope from adverse conditions',
    description: 'Automatic systems protect operation from adverse environmental conditions',
    requirements: { 'I': 'O', 'II': 'O', 'III': 'L', 'IV': 'M', 'V': 'H', 'VI': 'H' },
    responsibility: 'designer',
    evidenceGuidance: {
      low: ['Environmental limits defined', 'Basic sensor monitoring'],
      medium: ['Automatic response to adverse conditions', 'Tested environmental protection'],
      high: ['Certified environmental protection systems', 'Redundant sensing', 'Full automation validation']
    }
  },
  { 
    id: 'OSO-22', 
    category: 'operating', 
    name: 'Remote crew able to control UAS in adverse conditions',
    description: 'Crew can safely manage UAS when faced with adverse conditions',
    requirements: { 'I': 'L', 'II': 'L', 'III': 'M', 'IV': 'M', 'V': 'H', 'VI': 'H' },
    responsibility: 'operator',
    evidenceGuidance: {
      low: ['Adverse condition procedures', 'Basic training on weather effects'],
      medium: ['Scenario training for adverse conditions', 'Decision-making procedures', 'Competency assessment'],
      high: ['Simulator training for adverse conditions', 'Third-party verified competency', 'Stress testing']
    }
  },
  
  // Operating Conditions
  { 
    id: 'OSO-23', 
    category: 'operating', 
    name: 'Environmental conditions defined, measurable and adhered to',
    description: 'Weather and environmental limits documented and followed',
    requirements: { 'I': 'L', 'II': 'L', 'III': 'M', 'IV': 'M', 'V': 'H', 'VI': 'H' },
    responsibility: 'operator',
    evidenceGuidance: {
      low: ['Weather limits defined', 'Weather briefing procedure'],
      medium: ['Weather monitoring during ops', 'Go/no-go criteria', 'Real-time weather updates'],
      high: ['Validated weather sources', 'Continuous monitoring systems', 'Automatic alerts']
    }
  },
  { 
    id: 'OSO-24', 
    category: 'operating', 
    name: 'UAS designed and qualified for adverse environmental conditions',
    description: 'UAS can handle defined adverse environmental conditions',
    requirements: { 'I': 'O', 'II': 'O', 'III': 'M', 'IV': 'H', 'V': 'H', 'VI': 'H' },
    responsibility: 'designer',
    evidenceGuidance: {
      low: ['Environmental envelope defined by manufacturer'],
      medium: ['Environmental testing performed', 'IP rating where applicable', 'Temperature range verified'],
      high: ['Certified environmental qualification', 'Full environmental testing to standards', 'Independent verification']
    }
  }
]

// ============================================
// CALCULATION FUNCTIONS
// ============================================

/**
 * Get intrinsic GRC from matrix
 * @param {string} population - Population category key
 * @param {string} uaChar - UA characteristic key
 * @returns {number|null} Intrinsic GRC or null if outside scope
 */
export function getIntrinsicGRC(population, uaChar) {
  return intrinsicGRCMatrix[population]?.[uaChar] ?? null
}

/**
 * Calculate final GRC with mitigations
 * Per SORA 2.5 Annex B Table 11
 * @param {number} iGRC - Intrinsic GRC
 * @param {object} mitigations - Applied mitigations
 * @returns {number|null} Final GRC (minimum = controlled area equivalent)
 */
export function calculateFinalGRC(iGRC, mitigations = {}) {
  if (iGRC === null) return null
  
  let reduction = 0
  
  // M1A - Sheltering (Low: -1, Medium: -2, High: N/A)
  if (mitigations.M1A?.enabled && mitigations.M1A.robustness) {
    const rob = mitigations.M1A.robustness
    if (rob === 'low') reduction -= 1
    else if (rob === 'medium') reduction -= 2
    // High is not available for M1A
  }
  
  // M1B - Operational Restrictions (Low: N/A, Medium: -1, High: -2)
  // Note: Cannot combine M1A(medium) with M1B
  if (mitigations.M1B?.enabled && mitigations.M1B.robustness) {
    const rob = mitigations.M1B.robustness
    // Check for invalid combination
    if (mitigations.M1A?.robustness === 'medium') {
      logger.warn('M1A(medium) cannot be combined with M1B')
    } else {
      if (rob === 'medium') reduction -= 1
      else if (rob === 'high') reduction -= 2
      // Low is not available for M1B
    }
  }
  
  // M1C - Ground Observers (Low: -1, Medium: N/A, High: N/A)
  if (mitigations.M1C?.enabled && mitigations.M1C.robustness === 'low') {
    reduction -= 1
    // Only low robustness provides reduction
  }
  
  // M2 - Impact Dynamics (Low: N/A, Medium: -1, High: -2)
  if (mitigations.M2?.enabled && mitigations.M2.robustness) {
    const rob = mitigations.M2.robustness
    if (rob === 'medium') reduction -= 1
    else if (rob === 'high') reduction -= 2
    // Low is not available for M2
  }
  
  // Note: M3 (ERP) removed in SORA 2.5 - no penalty
  
  const finalGRC = iGRC + reduction
  
  // GRC cannot go below equivalent for controlled ground area
  // Per SORA 2.5: "The GRC cannot be lowered to a value less than the equivalent for controlled ground area"
  return Math.max(1, finalGRC)
}

/**
 * Check if final GRC is within SORA scope
 * @param {number} finalGRC - Final GRC
 * @returns {boolean} True if within scope (≤7)
 */
export function isWithinSORAScope(finalGRC) {
  return finalGRC !== null && finalGRC <= 7
}

/**
 * Calculate residual ARC after tactical mitigations
 * @param {string} initialARC - Initial ARC (e.g., 'ARC-b')
 * @param {object} tmpr - TMPR configuration
 * @returns {string} Residual ARC
 */
export function calculateResidualARC(initialARC, tmpr = {}) {
  const arcOrder = ['ARC-a', 'ARC-b', 'ARC-c', 'ARC-d']
  const currentIndex = arcOrder.indexOf(initialARC)
  
  if (currentIndex === -1) return 'ARC-b' // Default
  
  // VLOS/EVLOS can reduce ARC by 1 step
  if (tmpr?.enabled && tmpr?.type) {
    const tmprDef = tmprDefinitions[tmpr.type]
    if (tmprDef) {
      // Verify robustness meets minimum requirement
      const robustnessOrder = ['none', 'low', 'medium', 'high']
      const actualRob = robustnessOrder.indexOf(tmpr.robustness || 'none')
      const requiredRob = robustnessOrder.indexOf(tmprDef.robustnessRequired || 'low')
      
      if (actualRob >= requiredRob) {
        const newIndex = Math.max(0, currentIndex - tmprDef.arcReduction)
        return arcOrder[newIndex]
      }
    }
  }
  
  return initialARC
}

/**
 * Get SAIL from matrix
 * Per SORA 2.5 Table 7
 * @param {number} finalGRC - Final GRC
 * @param {string} residualARC - Residual ARC
 * @returns {string|null} SAIL level or null if outside scope
 */
export function getSAIL(finalGRC, residualARC) {
  if (finalGRC === null || finalGRC > 7) return null
  const grc = Math.min(7, Math.max(1, finalGRC))
  return sailMatrix[grc]?.[residualARC] ?? null
}

/**
 * Calculate adjacent area distance
 * Per SORA 2.5 Step #8: 3 minutes × max speed, min 5km, max 35km
 * @param {number} maxSpeed - Max speed in m/s
 * @returns {number} Distance in meters
 */
export function calculateAdjacentAreaDistance(maxSpeed) {
  const distance = maxSpeed * 180 // 3 min = 180 seconds
  if (distance < 5000) return 5000 // Minimum 5km
  if (distance > 35000) return 35000 // Maximum 35km
  return distance
}

/**
 * Get required containment robustness
 * @param {string} adjacentPopulation - Adjacent area population category
 * @param {string} sail - SAIL level
 * @returns {string} Required robustness level
 */
export function getContainmentRequirement(adjacentPopulation, sail) {
  return containmentRobustness[adjacentPopulation]?.[sail] ?? 'low'
}

/**
 * Check OSO compliance
 * @param {object} oso - OSO definition
 * @param {string} sail - SAIL level
 * @param {string} actualRobustness - Actual robustness achieved
 * @returns {object} Compliance status
 */
export function checkOSOCompliance(oso, sail, actualRobustness) {
  const required = oso.requirements[sail]
  
  // Map requirement letters to numeric values
  const requirementMap = { 'O': 0, 'L': 1, 'M': 2, 'H': 3 }
  const robustnessMap = { 'none': 0, 'low': 1, 'medium': 2, 'high': 3 }
  
  const requiredLevel = requirementMap[required] ?? 0
  const actualLevel = robustnessMap[actualRobustness] ?? 0
  
  return {
    required,
    requiredLabel: required === 'O' ? 'Optional' : required === 'L' ? 'Low' : required === 'M' ? 'Medium' : 'High',
    actual: actualRobustness,
    compliant: actualLevel >= requiredLevel,
    gap: requiredLevel > actualLevel ? requiredLevel - actualLevel : 0
  }
}

/**
 * Get all OSO compliance for a given SAIL
 * @param {string} sail - SAIL level
 * @param {object} osoStatuses - Map of OSO ID to { robustness: string }
 * @returns {object} Overall compliance summary
 */
export function checkAllOSOCompliance(sail, osoStatuses = {}) {
  const results = osoDefinitions.map(oso => {
    const status = osoStatuses[oso.id] || { robustness: 'none' }
    return {
      ...oso,
      ...checkOSOCompliance(oso, sail, status.robustness),
      evidence: status.evidence || ''
    }
  })
  
  const compliant = results.filter(r => r.compliant)
  const nonCompliant = results.filter(r => !r.compliant && r.required !== 'O')
  const optional = results.filter(r => r.required === 'O')
  
  return {
    results,
    summary: {
      total: results.length,
      compliant: compliant.length,
      nonCompliant: nonCompliant.length,
      optional: optional.length,
      overallCompliant: nonCompliant.length === 0
    }
  }
}

// ============================================
// SFOC & LARGE RPAS EXTENSIONS
// For RPAS >150kg requiring SFOC per CAR 903.01(a)
// ============================================

/**
 * SFOC requirement triggers based on operation characteristics
 * Per Transport Canada CAR 903.01
 */
export const sfocTriggers = {
  weight_over_150kg: {
    id: 'weight_over_150kg',
    label: 'RPAS Weight >150kg',
    description: 'Operating an RPAS with weight exceeding 150kg',
    car_reference: 'CAR 903.01(a)',
    complexity: 'medium',
    requiresMPD: true
  },
  altitude_over_400ft: {
    id: 'altitude_over_400ft',
    label: 'Altitude >400ft AGL',
    description: 'Operating above 400 feet in uncontrolled airspace',
    car_reference: 'CAR 903.01(b)',
    complexity: 'medium',
    requiresMPD: false
  },
  bvlos_extended: {
    id: 'bvlos_extended',
    label: 'Extended BVLOS',
    description: 'BVLOS beyond sheltered/EVLOS/lower-risk categories',
    car_reference: 'CAR 903.01(g)',
    complexity: 'high',
    requiresMPD: true
  },
  bvlos_aerodrome: {
    id: 'bvlos_aerodrome',
    label: 'BVLOS in Aerodrome Environment',
    description: 'BVLOS within aerodrome boundaries',
    car_reference: 'CAR 903.01(h)',
    complexity: 'high',
    requiresMPD: true
  },
  hazardous_payload: {
    id: 'hazardous_payload',
    label: 'Hazardous Payload',
    description: 'Operating with dangerous or hazardous payloads',
    car_reference: 'CAR 903.01(j)',
    complexity: 'high',
    requiresMPD: false
  }
}

/**
 * Manufacturer Performance Declaration requirements by SAIL level
 * Per TC guidance: "At SAIL III and IV, TC is looking for more details
 * on the means of compliance used"
 */
export const mpdRequirementsBySAIL = {
  'I': {
    label: 'SAIL I - Minimal',
    declarationType: 'self',
    description: 'Self-declaration by operator/manufacturer sufficient',
    evidenceLevel: 'low',
    thirdPartyRequired: false,
    notes: 'Straightforward declaration with basic documentation'
  },
  'II': {
    label: 'SAIL II - Low',
    declarationType: 'self',
    description: 'Self-declaration with supporting documentation',
    evidenceLevel: 'low',
    thirdPartyRequired: false,
    notes: 'Declaration with means of compliance documented'
  },
  'III': {
    label: 'SAIL III - Medium',
    declarationType: 'detailed',
    description: 'Detailed declaration with means of compliance',
    evidenceLevel: 'medium',
    thirdPartyRequired: false,
    notes: 'TC will want to see details on compliance methods used'
  },
  'IV': {
    label: 'SAIL IV - Medium-High',
    declarationType: 'detailed',
    description: 'Detailed declaration with verification evidence',
    evidenceLevel: 'medium',
    thirdPartyRequired: false,
    notes: 'May request test reports and supporting evidence'
  },
  'V': {
    label: 'SAIL V - High',
    declarationType: 'verified',
    description: 'Third-party verified declaration',
    evidenceLevel: 'high',
    thirdPartyRequired: true,
    notes: 'Third-party audit or verification typically required'
  },
  'VI': {
    label: 'SAIL VI - Highest',
    declarationType: 'certified',
    description: 'Full airworthiness-level certification',
    evidenceLevel: 'high',
    thirdPartyRequired: true,
    notes: 'Equivalent to traditional airworthiness certification'
  }
}

/**
 * OSOs requiring HIGH robustness at each SAIL level
 * Used to identify critical compliance areas
 */
export const highRobustnessOSOsBySAIL = {
  'I': [],
  'II': [],
  'III': ['OSO-08'],
  'IV': ['OSO-01', 'OSO-08', 'OSO-13', 'OSO-24'],
  'V': ['OSO-01', 'OSO-02', 'OSO-03', 'OSO-04', 'OSO-05', 'OSO-06', 'OSO-07', 'OSO-08',
        'OSO-09', 'OSO-10', 'OSO-11', 'OSO-12', 'OSO-13', 'OSO-16', 'OSO-17',
        'OSO-18', 'OSO-19', 'OSO-21', 'OSO-22', 'OSO-23', 'OSO-24'],
  'VI': ['OSO-01', 'OSO-02', 'OSO-03', 'OSO-04', 'OSO-05', 'OSO-06', 'OSO-07', 'OSO-08',
         'OSO-09', 'OSO-10', 'OSO-11', 'OSO-12', 'OSO-13', 'OSO-16', 'OSO-17', 'OSO-18',
         'OSO-19', 'OSO-20', 'OSO-21', 'OSO-22', 'OSO-23', 'OSO-24']
}

/**
 * Large RPAS specific guidance
 * For RPAS >150kg that fall outside standard 922 framework
 */
export const largeRPASGuidance = {
  applicability: {
    minWeight: 150, // kg
    description: 'RPAS with operating weight exceeding 150kg',
    note: 'Falls outside standard CAR Part IX / Standard 922 framework'
  },
  regulatoryPath: {
    primary: 'SFOC-RPAS',
    secondary: 'Manufacturer Performance Declaration',
    description: 'Requires SFOC application with manufacturer declaration accepted by TC'
  },
  contactInfo: {
    sfoc: 'TC.RPASCentre-CentreSATP.TC@tc.gc.ca',
    declaration: 'TC.RPASDeclaration-DeclarationSATP.TC@tc.gc.ca',
    processingTime: '60 business days'
  },
  kineticEnergyNote: 'Kinetic energy likely exceeds 1084kJ - contact TC directly for guidance'
}

/**
 * Check if operation requires SFOC
 * @param {object} operationParams - Operation parameters
 * @returns {object} SFOC requirement info
 */
export function checkSFOCRequired(operationParams) {
  const triggers = []
  let complexity = 'medium'
  let requiresMPD = false

  // Check weight
  if (operationParams.weightKg > 150) {
    triggers.push(sfocTriggers.weight_over_150kg)
    requiresMPD = true
  }

  // Check altitude
  if (operationParams.maxAltitudeFt > 400 && !operationParams.controlledAirspace) {
    triggers.push(sfocTriggers.altitude_over_400ft)
  }

  // Check BVLOS type
  if (operationParams.isBVLOS && operationParams.bvlosType === 'extended') {
    triggers.push(sfocTriggers.bvlos_extended)
    complexity = 'high'
    requiresMPD = true
  }

  if (operationParams.isBVLOS && operationParams.nearAerodrome) {
    triggers.push(sfocTriggers.bvlos_aerodrome)
    complexity = 'high'
    requiresMPD = true
  }

  // Check payload
  if (operationParams.hasHazardousPayload) {
    triggers.push(sfocTriggers.hazardous_payload)
    complexity = 'high'
  }

  // Determine highest complexity
  if (triggers.some(t => t.complexity === 'high')) {
    complexity = 'high'
  }

  return {
    required: triggers.length > 0,
    triggers,
    complexity,
    requiresMPD,
    processingDays: 60,
    contactEmail: largeRPASGuidance.contactInfo.sfoc
  }
}

/**
 * Get MPD requirements based on SAIL level
 * @param {string} sail - SAIL level (I-VI)
 * @returns {object} MPD requirements
 */
export function getMPDRequirements(sail) {
  const requirements = mpdRequirementsBySAIL[sail]
  if (!requirements) return null

  const highRobustnessOSOs = highRobustnessOSOsBySAIL[sail] || []
  const criticalOSOs = osoDefinitions.filter(oso =>
    highRobustnessOSOs.includes(oso.id)
  )

  return {
    ...requirements,
    sail,
    criticalOSOCount: criticalOSOs.length,
    criticalOSOs: criticalOSOs.map(oso => ({
      id: oso.id,
      name: oso.name,
      category: oso.category
    }))
  }
}

/**
 * Calculate estimated SAIL for large RPAS operation
 * Large RPAS typically operate in SAIL IV-VI range
 * @param {object} operationParams - Operation parameters
 * @returns {object} Estimated SAIL info
 */
export function estimateLargeRPASSAIL(operationParams) {
  // Start with base SAIL based on population density
  let baseSAIL = 'IV'

  // Increase for populated areas
  if (operationParams.populationCategory === 'suburban' ||
      operationParams.populationCategory === 'highdensity') {
    baseSAIL = 'V'
  }

  if (operationParams.populationCategory === 'assembly') {
    baseSAIL = 'VI'
  }

  // BVLOS typically increases SAIL
  if (operationParams.isBVLOS && !operationParams.hasDAA) {
    const sailOrder = ['I', 'II', 'III', 'IV', 'V', 'VI']
    const currentIndex = sailOrder.indexOf(baseSAIL)
    if (currentIndex < 5) {
      baseSAIL = sailOrder[currentIndex + 1]
    }
  }

  // Kinetic energy consideration
  const keCategory = operationParams.kineticEnergyCategory
  if (keCategory === 'very_high') {
    return {
      sail: 'VI',
      note: 'Very high kinetic energy (>1084kJ) - maximum SAIL',
      recommendation: 'Contact TC directly for specific guidance'
    }
  }

  return {
    sail: baseSAIL,
    note: `Estimated based on operation parameters`,
    recommendation: getMPDRequirements(baseSAIL)?.notes
  }
}

// ============================================
// DEFAULT EXPORTS
// ============================================
export default {
  populationCategories,
  uaCharacteristics,
  intrinsicGRCMatrix,
  groundMitigations,
  arcLevels,
  tmprDefinitions,
  sailMatrix,
  sailColors,
  sailDescriptions,
  robustnessLevels,
  containmentRobustness,
  containmentMethods,
  adjacentAreaGuidance,
  osoCategories,
  osoDefinitions,
  getIntrinsicGRC,
  calculateFinalGRC,
  isWithinSORAScope,
  calculateResidualARC,
  getSAIL,
  calculateAdjacentAreaDistance,
  getContainmentRequirement,
  checkOSOCompliance,
  checkAllOSOCompliance,
  // SFOC & Large RPAS extensions
  sfocTriggers,
  mpdRequirementsBySAIL,
  highRobustnessOSOsBySAIL,
  largeRPASGuidance,
  checkSFOCRequired,
  getMPDRequirements,
  estimateLargeRPASSAIL
}
